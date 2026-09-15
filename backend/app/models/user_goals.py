from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey
from datetime import datetime, timezone
from app.database import Base

class UserGoals(Base):
    __tablename__ = "user_goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True, unique=True)
    
    daily_calorie_goal = Column(Float, default=2000.0)
    protein_goal_g = Column(Float, default=140.0)
    carbohydrates_goal_g = Column(Float, default=250.0)
    fat_goal_g = Column(Float, default=70.0)
    fiber_goal_g = Column(Float, default=30.0)
    added_sugar_limit_g = Column(Float, default=25.0)
    sodium_limit_mg = Column(Float, default=2300.0)

    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
