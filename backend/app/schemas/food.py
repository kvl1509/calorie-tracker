from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime

class NutritionBase(BaseModel):
    calories: float = Field(default=0.0, ge=0)
    protein_g: float = Field(default=0.0, ge=0)
    fat_g: float = Field(default=0.0, ge=0)
    carbohydrates_g: float = Field(default=0.0, ge=0)
    dietary_fiber_g: float = Field(default=0.0, ge=0)
    added_sugars_g: float = Field(default=0.0, ge=0)
    sodium_mg: float = Field(default=0.0, ge=0)

class FoodEntryBase(BaseModel):
    food_name: str = Field(..., min_length=1)
    quantity: float = Field(..., gt=0)
    unit: str = Field(..., min_length=1)
    meal_type: str = Field(...)

    calories: float = Field(default=0.0, ge=0)
    protein_g: float = Field(default=0.0, ge=0)
    fat_g: float = Field(default=0.0, ge=0)
    carbohydrates_g: float = Field(default=0.0, ge=0)
    dietary_fiber_g: float = Field(default=0.0, ge=0)
    added_sugars_g: float = Field(default=0.0, ge=0)
    sodium_mg: float = Field(default=0.0, ge=0)

    ai_generated: bool = False
    ai_confidence: Optional[str] = None
    ai_assumptions: Optional[List[str]] = None
    
    consumed_at: Optional[datetime] = None

class FoodEntryCreate(FoodEntryBase):
    pass

class FoodEntryUpdate(BaseModel):
    food_name: Optional[str] = Field(None, min_length=1)
    quantity: Optional[float] = Field(None, gt=0)
    unit: Optional[str] = Field(None, min_length=1)
    meal_type: Optional[str] = None

    calories: Optional[float] = Field(None, ge=0)
    protein_g: Optional[float] = Field(None, ge=0)
    fat_g: Optional[float] = Field(None, ge=0)
    carbohydrates_g: Optional[float] = Field(None, ge=0)
    dietary_fiber_g: Optional[float] = Field(None, ge=0)
    added_sugars_g: Optional[float] = Field(None, ge=0)
    sodium_mg: Optional[float] = Field(None, ge=0)

    consumed_at: Optional[datetime] = None

class FoodEntryResponse(FoodEntryBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
