from pydantic import BaseModel
from typing import List, Dict, Optional
from app.schemas.food import FoodEntryResponse
from app.schemas.nutrition import NutritionBase

class DailySummary(BaseModel):
    date: str # YYYY-MM-DD
    total_nutrition: NutritionBase
    entries: List[FoodEntryResponse]
    meal_breakdown: Dict[str, NutritionBase]
    
    # Progress against goals
    calories_percentage: float = 0.0
    protein_percentage: float = 0.0
    carbs_percentage: float = 0.0
    fat_percentage: float = 0.0

class DailyHistoryItem(BaseModel):
    date: str
    calories: float

class HistoryResponse(BaseModel):
    days: int
    history: List[DailyHistoryItem]
    average_calories: float
