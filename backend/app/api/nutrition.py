from fastapi import APIRouter, HTTPException, Depends
import logging

from app.schemas.nutrition import NutritionAnalysisRequest, NutritionAnalysisResponse
from app.services.ai_nutrition import get_ai_provider
from app.models.user import User
from app.api.deps import get_current_user

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/analyze", response_model=NutritionAnalysisResponse)
async def analyze_nutrition(request: NutritionAnalysisRequest, current_user: User = Depends(get_current_user)):
    try:
        provider = get_ai_provider()
        response = await provider.analyze_food(request)
        return response
    except Exception as e:
        logger.error(f"Error analyzing nutrition: {str(e)}")
        raise HTTPException(status_code=500, detail="Something went wrong while fetching nutrition data.")
