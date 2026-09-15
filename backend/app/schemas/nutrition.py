from pydantic import BaseModel, Field
from typing import Optional, List
from app.schemas.food import NutritionBase

class NutritionAnalysisRequest(BaseModel):
    food_name: str = Field(..., description="Description or name of the food")
    quantity: float = Field(..., gt=0, description="Amount of food")
    unit: str = Field(..., description="Unit of measurement (e.g., grams, slices, ml)")
    meal_type: Optional[str] = None
    brand: Optional[str] = None
    preparation_method: Optional[str] = None

class NutritionAnalysisResponse(BaseModel):
    food_name: str
    quantity: float
    unit: str
    nutrition: NutritionBase
    confidence: str = Field(description="'high', 'medium', or 'low'")
    assumptions: List[str] = Field(default_factory=list)
