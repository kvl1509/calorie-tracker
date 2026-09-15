from pydantic import BaseModel, EmailStr

class AuthRequest(BaseModel):
    email: EmailStr

class AuthVerify(BaseModel):
    email: EmailStr
    code: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserUpdate(BaseModel):
    username: str | None = None
    age: int | None = None
    gender: str | None = None
    height: float | None = None
    weight: float | None = None

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    username: str | None = None
    age: int | None = None
    gender: str | None = None
    height: float | None = None
    weight: float | None = None

    class Config:
        from_attributes = True
