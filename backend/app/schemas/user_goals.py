from pydantic import BaseModel, Field
from datetime import datetime

class UserGoalsBase(BaseModel):
    daily_calorie_goal: float = Field(default=2000.0, gt=0)
    protein_goal_g: float = Field(default=140.0, gt=0)
    carbohydrates_goal_g: float = Field(default=250.0, gt=0)
    fat_goal_g: float = Field(default=70.0, gt=0)
    fiber_goal_g: float = Field(default=30.0, gt=0)
    added_sugar_limit_g: float = Field(default=25.0, ge=0)
    sodium_limit_mg: float = Field(default=2300.0, ge=0)

from typing import Optional

class UserGoalsUpdate(BaseModel):
    daily_calorie_goal: Optional[float] = Field(default=None, gt=0)
    protein_goal_g: Optional[float] = Field(default=None, gt=0)
    carbohydrates_goal_g: Optional[float] = Field(default=None, gt=0)
    fat_goal_g: Optional[float] = Field(default=None, gt=0)
    fiber_goal_g: Optional[float] = Field(default=None, gt=0)
    added_sugar_limit_g: Optional[float] = Field(default=None, ge=0)
    sodium_limit_mg: Optional[float] = Field(default=None, ge=0)

class UserGoalsResponse(UserGoalsBase):
    id: int
    updated_at: datetime

    class Config:
        from_attributes = True
