export interface User {
  id: number;
  email: string;
  username?: string;
  age?: number;
  gender?: string;
  height?: number;
  weight?: number;
}

export interface Nutrition {
  calories: number;
  protein_g: number;
  fat_g: number;
  carbohydrates_g: number;
  dietary_fiber_g: number;
  added_sugars_g: number;
  sodium_mg: number;
}

export interface FoodEntry extends Nutrition {
  id: number;
  food_name: string;
  quantity: number;
  unit: string;
  meal_type: string;
  ai_generated: boolean;
  ai_confidence?: 'high' | 'medium' | 'low';
  ai_assumptions?: string[];
  consumed_at: string;
  created_at: string;
  updated_at: string;
}

export interface NutritionAnalysisRequest {
  food_name: string;
  quantity: number;
  unit: string;
  meal_type?: string;
}

export interface NutritionAnalysisResponse {
  food_name: string;
  quantity: number;
  unit: string;
  nutrition: Nutrition;
  confidence: 'high' | 'medium' | 'low';
  assumptions: string[];
}

export interface DailySummary {
  date: string;
  total_nutrition: Nutrition;
  entries: FoodEntry[];
  meal_breakdown: Record<string, Nutrition>;
  calories_percentage: number;
  protein_percentage: number;
  carbs_percentage: number;
  fat_percentage: number;
}

export interface UserGoals {
  id?: number;
  daily_calorie_goal: number;
  protein_goal_g: number;
  carbohydrates_goal_g: number;
  fat_goal_g: number;
  fiber_goal_g: number;
  added_sugar_limit_g: number;
  sodium_limit_mg: number;
}

export interface HistoryItem {
  date: string;
  calories: number;
}

export interface HistoryResponse {
  days: number;
  history: HistoryItem[];
  average_calories: number;
}
