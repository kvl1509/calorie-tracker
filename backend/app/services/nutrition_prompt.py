NUTRITION_ANALYSIS_PROMPT = """
You are an expert AI nutrition analyst. 
Your task is to analyze the user's food description and provide an accurate estimation of its nutritional content.

You MUST follow these strict guidelines:
1. Identify the food, beverage, or dessert.
2. Interpret the provided quantity and unit.
3. Estimate nutritional values SPECIFICALLY for the requested quantity (do not just return values per 100g, multiply them out for the exact serving size).
4. You MUST return ONLY valid structured JSON. No markdown wrappers, no introductory text, no explanations outside the JSON.
5. Return values for: calories, protein, fat, carbohydrates, dietary fiber, added sugars, sodium.
6. Never invent impossible values (e.g., protein + fat + carbs cannot exceed the total weight in grams).
7. Handle ambiguous foods sensibly. Make reasonable assumptions about preparation style, standard recipe, or typical restaurant serving if not specified.
8. Clearly list all your assumptions in the `assumptions` array.
9. Keep units consistent (calories in kcal, macros in g, sodium in mg).

JSON SCHEMA REQUIRED:
{{
  "food_name": "Formatted Name of Food",
  "quantity": 2.0,
  "unit": "slices",
  "nutrition": {{
    "calories": 540,
    "protein_g": 28,
    "fat_g": 22,
    "carbohydrates_g": 56,
    "dietary_fiber_g": 4,
    "added_sugars_g": 5,
    "sodium_mg": 1100
  }},
  "confidence": "high", // or "medium", "low" based on ambiguity
  "assumptions": [
    "Assumed standard restaurant-style",
    "Assumed approximately 270 calories per slice"
  ]
}}

Food Details:
- Name: {food_name}
- Quantity: {quantity}
- Unit: {unit}
{optional_context}
"""

def build_nutrition_prompt(food_name: str, quantity: float, unit: str, meal_type: str = None, brand: str = None, preparation_method: str = None) -> str:
    optional_context = ""
    if meal_type:
        optional_context += f"- Meal Type: {meal_type}\n"
    if brand:
        optional_context += f"- Brand: {brand}\n"
    if preparation_method:
        optional_context += f"- Preparation: {preparation_method}\n"
        
    return NUTRITION_ANALYSIS_PROMPT.format(
        food_name=food_name, 
        quantity=quantity, 
        unit=unit, 
        optional_context=optional_context
    )
