from datetime import datetime, timezone

def normalize_unit(unit: str) -> str:
    """Standardizes unit strings."""
    unit = unit.lower().strip()
    # Normalize common units
    if unit in ["g", "gram"]: return "grams"
    if unit in ["kg", "kilogram"]: return "kilograms"
    if unit in ["l", "liter"]: return "liters"
    if unit in ["ml", "milliliter"]: return "ml"
    if unit in ["cup"]: return "cups"
    if unit in ["tbsp", "tablespoon"]: return "tablespoons"
    if unit in ["tsp", "teaspoon"]: return "teaspoons"
    if unit in ["slice"]: return "slices"
    if unit in ["piece"]: return "pieces"
    if unit in ["unit"]: return "units"
    if unit in ["serving"]: return "servings"
    return unit

def calculate_macro_calories(protein_g: float, fat_g: float, carbs_g: float) -> float:
    """Calculates approximate calories from macros."""
    # Protein: 4 kcal/g, Carbs: 4 kcal/g, Fat: 9 kcal/g
    return (protein_g * 4) + (carbs_g * 4) + (fat_g * 9)

from datetime import datetime, timezone, timedelta

IST = timezone(timedelta(hours=5, minutes=30))

def get_start_and_end_of_day(date_str: str = None):
    """Returns start and end datetime for a given date string (YYYY-MM-DD), or today in IST."""
    if date_str:
        dt = datetime.strptime(date_str, "%Y-%m-%d")
    else:
        dt = datetime.now(IST)
        
    start_ist = datetime(dt.year, dt.month, dt.day, 0, 0, 0, tzinfo=IST)
    end_ist = datetime(dt.year, dt.month, dt.day, 23, 59, 59, 999999, tzinfo=IST)
    
    return start_ist.astimezone(timezone.utc), end_ist.astimezone(timezone.utc)
