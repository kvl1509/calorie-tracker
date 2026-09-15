from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from datetime import datetime, timezone
from app.database import Base

class FoodEntry(Base):
    __tablename__ = "food_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    food_name = Column(String, index=True, nullable=False)
    quantity = Column(Float, nullable=False)
    unit = Column(String, nullable=False)
    meal_type = Column(String, nullable=False) # breakfast, lunch, dinner, snack, beverage, dessert, other

    # Nutrition (using float to support decimal values as per spec)
    calories = Column(Float, nullable=False, default=0.0)
    protein_g = Column(Float, nullable=False, default=0.0)
    fat_g = Column(Float, nullable=False, default=0.0)
    carbohydrates_g = Column(Float, nullable=False, default=0.0)
    dietary_fiber_g = Column(Float, nullable=False, default=0.0)
    added_sugars_g = Column(Float, nullable=False, default=0.0)
    sodium_mg = Column(Float, nullable=False, default=0.0)

    # AI Metadata
    ai_generated = Column(Boolean, default=False)
    ai_confidence = Column(String, nullable=True) # high, medium, low
    ai_assumptions = Column(String, nullable=True) # Stored as JSON string list

    # Timestamps
    consumed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
