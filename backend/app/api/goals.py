from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user_goals import UserGoals
from app.models.user import User
from app.api.deps import get_current_user
from app.schemas.user_goals import UserGoalsResponse, UserGoalsUpdate

router = APIRouter()

@router.get("/", response_model=UserGoalsResponse)
def get_goals(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    goals = db.query(UserGoals).filter(UserGoals.user_id == current_user.id).first()
    if not goals:
        goals = UserGoals(user_id=current_user.id)
        db.add(goals)
        db.commit()
        db.refresh(goals)
    return goals

@router.put("/", response_model=UserGoalsResponse)
def update_goals(update_data: UserGoalsUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    goals = db.query(UserGoals).filter(UserGoals.user_id == current_user.id).first()
    if not goals:
        goals = UserGoals(user_id=current_user.id)
        db.add(goals)
    
    update_dict = update_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(goals, key, value)
        
    db.commit()
    db.refresh(goals)
    return goals
