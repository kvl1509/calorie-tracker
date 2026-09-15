import random
import string
from datetime import datetime, timedelta, timezone
import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, AuthCode
from app.schemas.auth import AuthRequest, AuthVerify, Token, UserResponse
from app.api.deps import SECRET_KEY, ALGORITHM, get_current_user

router = APIRouter()

def generate_code():
    return ''.join(random.choices(string.digits, k=6))

@router.post("/request-code")
def request_auth_code(req: AuthRequest, db: Session = Depends(get_db)):
    code = generate_code()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
    
    auth_code = AuthCode(
        email=req.email,
        code=code,
        expires_at=expires_at
    )
    db.add(auth_code)
    db.commit()
    
    from app.config import settings
    
    try:
        subject_text = "Your BiteWise AI Login Code"
        body_text = f"Your login code for BiteWise AI is: {code}\n\nThis code will expire in 10 minutes."
        from_header = f"{settings.emails_from_name} <{settings.emails_from_email}>"
        
        if settings.resend_api_key:
            import resend
            resend.api_key = settings.resend_api_key
            resend.Emails.send({
                "from": from_header,
                "to": req.email,
                "subject": subject_text,
                "text": body_text
            })
            print("Email sent via Resend API")
        else:
            import smtplib
            from email.message import EmailMessage
            msg = EmailMessage()
            msg.set_content(body_text)
            msg["Subject"] = subject_text
            msg["From"] = from_header
            msg["To"] = req.email
            
            with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
                if settings.smtp_user and settings.smtp_password:
                    server.login(settings.smtp_user, settings.smtp_password)
                server.send_message(msg)
            print("Email sent via SMTP (Local MailHog)")
    except Exception as e:
        print(f"Error sending email: {e}")
    
    return {"message": "If the email is valid, a code has been sent."}

@router.post("/verify-code", response_model=Token)
def verify_auth_code(req: AuthVerify, db: Session = Depends(get_db)):
    # Find valid code
    auth_code = db.query(AuthCode).filter(
        AuthCode.email == req.email,
        AuthCode.code == req.code,
        AuthCode.expires_at > datetime.now(timezone.utc)
    ).first()
    
    if not auth_code:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired code"
        )
        
    # Delete used code
    db.delete(auth_code)
    
    # Get or create user
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        user = User(email=req.email)
        db.add(user)
        db.commit()
        db.refresh(user)
        
    # Create JWT
    access_token_expires = timedelta(days=7)
    expire = datetime.now(timezone.utc) + access_token_expires
    to_encode = {"exp": expire, "sub": str(user.id)}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    return {"access_token": encoded_jwt, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

from app.schemas.auth import UserUpdate
@router.put("/me", response_model=UserResponse)
def update_me(user_update: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user_update.username is not None:
        current_user.username = user_update.username
    if user_update.age is not None:
        current_user.age = user_update.age
    if user_update.gender is not None:
        current_user.gender = user_update.gender
    if user_update.height is not None:
        current_user.height = user_update.height
    if user_update.weight is not None:
        current_user.weight = user_update.weight
    
    db.commit()
    db.refresh(current_user)
    return current_user
