from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta, timezone
from typing import List
import json

from app.database import get_db
from app.models.food_entry import FoodEntry
from app.models.user_goals import UserGoals
from app.models.user import User
from app.api.deps import get_current_user
from app.schemas.tracker import DailySummary, HistoryResponse, DailyHistoryItem
from app.services.nutrition_calculator import calculate_daily_summary
from app.utils.validators import get_start_and_end_of_day, IST

router = APIRouter()

def get_user_goals_internal(db: Session, user_id: int):
    goals = db.query(UserGoals).filter(UserGoals.user_id == user_id).first()
    if not goals:
        goals = UserGoals(user_id=user_id)
        db.add(goals)
        db.commit()
        db.refresh(goals)
    return goals

@router.get("/daily-summary", response_model=DailySummary)
def get_daily_summary(date: str = Query(None, description="YYYY-MM-DD"), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    start, end = get_start_and_end_of_day(date)
    date_str = date or datetime.now(IST).strftime("%Y-%m-%d")
    
    entries = db.query(FoodEntry).filter(
        FoodEntry.user_id == current_user.id,
        FoodEntry.consumed_at >= start, 
        FoodEntry.consumed_at <= end
    ).order_by(FoodEntry.consumed_at.desc()).all()
    goals = get_user_goals_internal(db, current_user.id)
    
    # Process JSON assumptions
    for e in entries:
        if e.ai_assumptions:
            try:
                e.ai_assumptions = json.loads(e.ai_assumptions)
            except:
                e.ai_assumptions = []
                
    summary = calculate_daily_summary(date_str, entries, goals)
    return summary

@router.get("/history", response_model=HistoryResponse)
def get_history(days: int = Query(7, ge=1, le=30), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    end_date = datetime.now(IST)
    start_date = (end_date - timedelta(days=days-1)).replace(hour=0, minute=0, second=0, microsecond=0)
    start_date_utc = start_date.astimezone(timezone.utc)
    
    # Group by date part using IST
    entries = db.query(FoodEntry).filter(
        FoodEntry.user_id == current_user.id,
        FoodEntry.consumed_at >= start_date_utc
    ).all()
    
    history_map = {}
    for i in range(days):
        d = (end_date - timedelta(days=i)).strftime("%Y-%m-%d")
        history_map[d] = 0.0
        
    for entry in entries:
        dt = entry.consumed_at
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        d = dt.astimezone(IST).strftime("%Y-%m-%d")
        if d in history_map:
            history_map[d] += entry.calories
            
    history_items = [
        DailyHistoryItem(date=d, calories=history_map[d])
        for d in sorted(history_map.keys())
    ]
    
    total_cals = sum(item.calories for item in history_items)
    avg_cals = total_cals / days if days > 0 else 0
    
    return HistoryResponse(
        days=days,
        history=history_items,
        average_calories=round(avg_cals, 1)
    )
