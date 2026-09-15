from sqlalchemy.orm import Session
from datetime import datetime, timezone
import json
from app.models.food_entry import FoodEntry

def seed_demo_data_if_empty(db: Session):
    count = db.query(FoodEntry).count()
    if count > 0:
        return
        
    demo_entries = [
        FoodEntry(
            food_name="Avocado Toast with Eggs",
            quantity=1,
            unit="serving",
            meal_type="Breakfast",
            calories=450,
            protein_g=22,
            fat_g=25,
            carbohydrates_g=38,
            dietary_fiber_g=10,
            added_sugars_g=0,
            sodium_mg=550,
            ai_generated=True,
            ai_confidence="high",
            ai_assumptions=json.dumps(["Assumed 2 slices whole wheat toast", "Assumed 1/2 avocado", "Assumed 2 poached eggs"]),
            consumed_at=datetime.now(timezone.utc)
        ),
        FoodEntry(
            food_name="Chicken Biryani",
            quantity=250,
            unit="grams",
            meal_type="Lunch",
            calories=410,
            protein_g=19,
            fat_g=14,
            carbohydrates_g=48,
            dietary_fiber_g=3,
            added_sugars_g=2,
            sodium_mg=780,
            ai_generated=True,
            ai_confidence="medium",
            ai_assumptions=json.dumps(["Standard restaurant-style chicken biryani", "Estimated based on 250g serving"]),
            consumed_at=datetime.now(timezone.utc)
        ),
        FoodEntry(
            food_name="Cold Brew Coffee",
            quantity=300,
            unit="ml",
            meal_type="Snack",
            calories=15,
            protein_g=0,
            fat_g=0,
            carbohydrates_g=3,
            dietary_fiber_g=0,
            added_sugars_g=0,
            sodium_mg=15,
            ai_generated=False,
            ai_confidence=None,
            ai_assumptions=None,
            consumed_at=datetime.now(timezone.utc)
        )
    ]
    
    for entry in demo_entries:
        db.add(entry)
    db.commit()
