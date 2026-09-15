from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine, SessionLocal
from app.config import settings
from app.api import food, nutrition, tracker, goals, auth

# Create database tables
Base.metadata.create_all(bind=engine)

# Demo data seeding removed for user auth implementation
app = FastAPI(
    title="BiteWise AI Nutrition API",
    description="API for the BiteWise AI-Powered Calorie Tracker Application",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(food.router, prefix="/api/food", tags=["Food"])
app.include_router(nutrition.router, prefix="/api/nutrition", tags=["AI Nutrition"])
app.include_router(tracker.router, prefix="/api/tracker", tags=["Tracker"])
app.include_router(goals.router, prefix="/api/goals", tags=["Goals"])

@app.get("/health")
def health_check():
    return {"status": "ok", "provider": settings.ai_provider}
