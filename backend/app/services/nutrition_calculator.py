from typing import List, Dict
from app.models.food_entry import FoodEntry
from app.models.user_goals import UserGoals
from app.schemas.tracker import DailySummary
from app.schemas.food import FoodEntryResponse, NutritionBase

def calculate_daily_summary(date_str: str, entries: List[FoodEntry], goals: UserGoals) -> DailySummary:
    # Initialize totals
    total = NutritionBase()
    
    meal_breakdown: Dict[str, NutritionBase] = {
        "Breakfast": NutritionBase(),
        "Lunch": NutritionBase(),
        "Dinner": NutritionBase(),
        "Snack": NutritionBase(),
        "Beverage": NutritionBase(),
        "Dessert": NutritionBase(),
        "Other": NutritionBase()
    }
    
    # Process entries
    response_entries = []
    for entry in entries:
        # Sum totals
        total.calories += entry.calories
        total.protein_g += entry.protein_g
        total.fat_g += entry.fat_g
        total.carbohydrates_g += entry.carbohydrates_g
        total.dietary_fiber_g += entry.dietary_fiber_g
        total.added_sugars_g += entry.added_sugars_g
        total.sodium_mg += entry.sodium_mg
        
        # Sum for meal breakdown
        meal_type = entry.meal_type if entry.meal_type in meal_breakdown else "Other"
        mb = meal_breakdown[meal_type]
        mb.calories += entry.calories
        mb.protein_g += entry.protein_g
        mb.fat_g += entry.fat_g
        mb.carbohydrates_g += entry.carbohydrates_g
        mb.dietary_fiber_g += entry.dietary_fiber_g
        mb.added_sugars_g += entry.added_sugars_g
        mb.sodium_mg += entry.sodium_mg
        
        response_entries.append(FoodEntryResponse.model_validate(entry))
        
    # Calculate percentages against goals (cap at 100% or allow over 100%)
    cal_pct = min(100.0, (total.calories / goals.daily_calorie_goal * 100)) if goals.daily_calorie_goal > 0 else 0
    prot_pct = min(100.0, (total.protein_g / goals.protein_goal_g * 100)) if goals.protein_goal_g > 0 else 0
    carb_pct = min(100.0, (total.carbohydrates_g / goals.carbohydrates_goal_g * 100)) if goals.carbohydrates_goal_g > 0 else 0
    fat_pct = min(100.0, (total.fat_g / goals.fat_goal_g * 100)) if goals.fat_goal_g > 0 else 0
    
    return DailySummary(
        date=date_str,
        total_nutrition=total,
        entries=response_entries,
        meal_breakdown=meal_breakdown,
        calories_percentage=round(cal_pct, 1),
        protein_percentage=round(prot_pct, 1),
        carbs_percentage=round(carb_pct, 1),
        fat_percentage=round(fat_pct, 1)
    )
