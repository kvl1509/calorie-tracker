from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timezone
import json

from app.database import get_db
from app.models.food_entry import FoodEntry
from app.models.user import User
from app.api.deps import get_current_user
from app.schemas.food import FoodEntryCreate, FoodEntryUpdate, FoodEntryResponse
from app.utils.validators import normalize_unit, get_start_and_end_of_day

router = APIRouter()

@router.post("/", response_model=FoodEntryResponse, status_code=status.HTTP_201_CREATED)
def create_food_entry(entry: FoodEntryCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_entry = FoodEntry(
        user_id=current_user.id,
        food_name=entry.food_name,
        quantity=entry.quantity,
        unit=normalize_unit(entry.unit),
        meal_type=entry.meal_type,
        calories=entry.calories,
        protein_g=entry.protein_g,
        fat_g=entry.fat_g,
        carbohydrates_g=entry.carbohydrates_g,
        dietary_fiber_g=entry.dietary_fiber_g,
        added_sugars_g=entry.added_sugars_g,
        sodium_mg=entry.sodium_mg,
        ai_generated=entry.ai_generated,
        ai_confidence=entry.ai_confidence,
        ai_assumptions=json.dumps(entry.ai_assumptions) if entry.ai_assumptions else None,
        consumed_at=entry.consumed_at or datetime.now(timezone.utc)
    )
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)

    if db_entry.ai_assumptions:
        try:
            db_entry.ai_assumptions = json.loads(db_entry.ai_assumptions)
        except:
            db_entry.ai_assumptions = []

    return db_entry

@router.get("/today", response_model=List[FoodEntryResponse])
def get_today_food(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    start, end = get_start_and_end_of_day()
    entries = db.query(FoodEntry).filter(
        FoodEntry.user_id == current_user.id,
        FoodEntry.consumed_at >= start, 
        FoodEntry.consumed_at <= end
    ).order_by(FoodEntry.consumed_at.desc()).all()
    
    # Process assumptions from JSON string to list
    for e in entries:
        if e.ai_assumptions:
            try:
                e.ai_assumptions = json.loads(e.ai_assumptions)
            except:
                e.ai_assumptions = []
    return entries

@router.get("/{entry_id}", response_model=FoodEntryResponse)
def get_food(entry_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    entry = db.query(FoodEntry).filter(FoodEntry.id == entry_id, FoodEntry.user_id == current_user.id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Food entry not found")
    
    if entry.ai_assumptions:
        try:
            entry.ai_assumptions = json.loads(entry.ai_assumptions)
        except:
            entry.ai_assumptions = []
            
    return entry

@router.put("/{entry_id}", response_model=FoodEntryResponse)
def update_food(entry_id: int, update_data: FoodEntryUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    entry = db.query(FoodEntry).filter(FoodEntry.id == entry_id, FoodEntry.user_id == current_user.id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Food entry not found")
    
    update_dict = update_data.model_dump(exclude_unset=True)
    if "unit" in update_dict:
        update_dict["unit"] = normalize_unit(update_dict["unit"])
        
    for key, value in update_dict.items():
        setattr(entry, key, value)
        
    db.commit()
    db.refresh(entry)
    
    if entry.ai_assumptions:
        try:
            entry.ai_assumptions = json.loads(entry.ai_assumptions)
        except:
            entry.ai_assumptions = []
            
    return entry

@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_food(entry_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    entry = db.query(FoodEntry).filter(FoodEntry.id == entry_id, FoodEntry.user_id == current_user.id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Food entry not found")
    
    db.delete(entry)
    db.commit()
    return None
