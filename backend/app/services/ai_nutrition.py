from abc import ABC, abstractmethod
import json
import logging
from app.schemas.nutrition import NutritionAnalysisRequest, NutritionAnalysisResponse
from app.services.nutrition_prompt import build_nutrition_prompt
from app.config import settings

logger = logging.getLogger(__name__)

class NutritionAIProvider(ABC):
    @abstractmethod
    async def analyze_food(self, request: NutritionAnalysisRequest) -> NutritionAnalysisResponse:
        pass

class GeminiNutritionProvider(NutritionAIProvider):
    def __init__(self, api_key: str, model_name: str):
        try:
            from google import genai
            from google.genai import types
            self.client = genai.Client(api_key=api_key)
            self.model_name = model_name
        except ImportError:
            logger.error("google-genai not installed")
            raise

    async def analyze_food(self, request: NutritionAnalysisRequest) -> NutritionAnalysisResponse:
        prompt = build_nutrition_prompt(
            request.food_name, 
            request.quantity, 
            request.unit,
            request.meal_type,
            request.brand,
            request.preparation_method
        )
        
        try:
            from google.genai import types
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.2, # Low temp for factual consistency
                ),
            )
            
            # The response text should be JSON
            content = response.text
            data = json.loads(content)
            return NutritionAnalysisResponse(**data)
            
        except Exception as e:
            logger.error(f"Gemini API error: {e}")
            raise Exception("Failed to fetch nutrition data from Gemini AI.")

class OpenAINutritionProvider(NutritionAIProvider):
    def __init__(self, api_key: str, model_name: str):
        try:
            from openai import AsyncOpenAI
            self.client = AsyncOpenAI(api_key=api_key)
            self.model_name = model_name
        except ImportError:
            logger.error("openai not installed")
            raise

    async def analyze_food(self, request: NutritionAnalysisRequest) -> NutritionAnalysisResponse:
        prompt = build_nutrition_prompt(
            request.food_name, 
            request.quantity, 
            request.unit,
            request.meal_type,
            request.brand,
            request.preparation_method
        )
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": "You are a helpful nutrition API that outputs strictly valid JSON without markdown."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.2
            )
            
            content = response.choices[0].message.content
            data = json.loads(content)
            return NutritionAnalysisResponse(**data)
            
        except Exception as e:
            logger.error(f"OpenAI API error: {e}")
            raise Exception("Failed to fetch nutrition data from OpenAI.")

class FallbackHeuristicProvider(NutritionAIProvider):
    """
    A smart local fallback that attempts to estimate calories based on keywords and quantity.
    This ensures the app works beautifully out-of-the-box even without an API key!
    """
    async def analyze_food(self, request: NutritionAnalysisRequest) -> NutritionAnalysisResponse:
        name = request.food_name.lower()
        q = request.quantity
        
        # Base multipliers per unit
        multiplier = 1.0
        if request.unit.lower() in ["g", "grams", "ml"]:
            multiplier = q / 100.0
        elif request.unit.lower() in ["kg", "liters", "l"]:
            multiplier = (q * 1000) / 100.0
        elif request.unit.lower() in ["cup", "cups"]:
            multiplier = (q * 240) / 100.0
        elif request.unit.lower() in ["tbsp", "tablespoon", "tablespoons"]:
            multiplier = (q * 15) / 100.0
        elif request.unit.lower() in ["tsp", "teaspoon", "teaspoons"]:
            multiplier = (q * 5) / 100.0
        else:
            # e.g., "slices", "pieces", "servings" -> we'll treat 1 piece as roughly 100g equivalent for basic math
            multiplier = q
            
        # Basic keyword heuristics (per 100g equivalent)
        cals, prot, fat, carb, fib, sug, sod = 200, 5, 5, 20, 2, 2, 200
        assumptions = ["No AI key configured. Using intelligent fallback heuristics."]
        
        if "chicken" in name:
            cals, prot, fat, carb = 165, 31, 3.6, 0
            assumptions.append("Assumed grilled/cooked chicken breast baseline.")
        elif "pizza" in name:
            cals, prot, fat, carb, sod = 266, 11, 10, 33, 600
            assumptions.append("Assumed standard cheese pizza baseline.")
        elif "coffee" in name:
            if "cold" in name or "milk" in name or "latte" in name:
                cals, prot, fat, carb = 45, 3, 1.5, 5
                assumptions.append("Assumed milky coffee/latte baseline.")
            else:
                cals, prot, fat, carb = 2, 0.1, 0, 0
                assumptions.append("Assumed black coffee.")
        elif "rice" in name or "biryani" in name:
            cals, prot, fat, carb = 150, 3.5, 3, 30
            if "biryani" in name:
                cals += 50
                fat += 5
                assumptions.append("Assumed standard restaurant biryani with oil/ghee.")
        elif "apple" in name or "fruit" in name:
            cals, prot, fat, carb, fib, sug = 52, 0.3, 0.2, 14, 2.4, 10
            assumptions.append("Assumed fresh fruit baseline.")
        elif "beef" in name or "steak" in name:
            cals, prot, fat, carb = 250, 26, 15, 0
            assumptions.append("Assumed standard cooked beef.")
        elif "egg" in name:
            cals, prot, fat, carb = 143, 12.6, 9.5, 0.7
            assumptions.append("Assumed whole cooked eggs.")
            
        # Format the response
        return NutritionAnalysisResponse(
            food_name=request.food_name.title(),
            quantity=request.quantity,
            unit=request.unit,
            nutrition={
                "calories": round(cals * multiplier, 1),
                "protein_g": round(prot * multiplier, 1),
                "fat_g": round(fat * multiplier, 1),
                "carbohydrates_g": round(carb * multiplier, 1),
                "dietary_fiber_g": round(fib * multiplier, 1),
                "added_sugars_g": round(sug * multiplier, 1),
                "sodium_mg": round(sod * multiplier, 1)
            },
            confidence="low",
            assumptions=assumptions
        )

def get_ai_provider() -> NutritionAIProvider:
    if settings.ai_provider.lower() == "gemini" and settings.ai_api_key:
        return GeminiNutritionProvider(api_key=settings.ai_api_key, model_name=settings.ai_model)
    elif settings.ai_provider.lower() == "openai" and settings.openai_api_key:
        return OpenAINutritionProvider(api_key=settings.openai_api_key, model_name=settings.openai_model)
    else:
        # If explicitly set to fallback or missing keys, use local heuristics
        logger.warning("No AI API key found or fallback configured. Using FallbackHeuristicProvider.")
        return FallbackHeuristicProvider()
