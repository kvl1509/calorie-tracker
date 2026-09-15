import { useState } from 'react';
import { Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, Input, Select } from './UI/Card';
import { Button } from './UI/Button';
import { api } from '../services/api';
import type { FoodEntry, NutritionAnalysisResponse } from '../types';

interface FoodEntryFormProps {
  onAdd: (entry: Partial<FoodEntry>) => Promise<void>;
  onCancel: () => void;
}

export function FoodEntryForm({ onAdd, onCancel }: FoodEntryFormProps) {
  const [foodName, setFoodName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('serving');
  const [mealType, setMealType] = useState('Breakfast');
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [aiResult, setAiResult] = useState<NutritionAnalysisResponse | null>(null);

  // Editable nutrition state
  const [nutrition, setNutrition] = useState({
    calories: '',
    protein_g: '',
    fat_g: '',
    carbohydrates_g: '',
    dietary_fiber_g: '',
    added_sugars_g: '',
    sodium_mg: ''
  });

  const handleFetchAI = async () => {
    if (!foodName || !quantity) {
      setError('Please enter a food name and quantity');
      return;
    }
    
    setIsAnalyzing(true);
    setError('');
    
    try {
      const res = await api.analyzeNutrition({
        food_name: foodName,
        quantity: parseFloat(quantity),
        unit,
        meal_type: mealType
      });
      
      setAiResult(res);
      setNutrition({
        calories: res.nutrition.calories.toString(),
        protein_g: res.nutrition.protein_g.toString(),
        fat_g: res.nutrition.fat_g.toString(),
        carbohydrates_g: res.nutrition.carbohydrates_g.toString(),
        dietary_fiber_g: res.nutrition.dietary_fiber_g.toString(),
        added_sugars_g: res.nutrition.added_sugars_g.toString(),
        sodium_mg: res.nutrition.sodium_mg.toString()
      });
    } catch (err: any) {
      setError(err.message || 'Something went wrong while fetching nutrition data.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    if (!foodName || !quantity || !nutrition.calories) {
      setError('Please fill in required fields or fetch AI nutrition first');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      await onAdd({
        food_name: foodName,
        quantity: parseFloat(quantity),
        unit,
        meal_type: mealType,
        calories: parseFloat(nutrition.calories || '0'),
        protein_g: parseFloat(nutrition.protein_g || '0'),
        fat_g: parseFloat(nutrition.fat_g || '0'),
        carbohydrates_g: parseFloat(nutrition.carbohydrates_g || '0'),
        dietary_fiber_g: parseFloat(nutrition.dietary_fiber_g || '0'),
        added_sugars_g: parseFloat(nutrition.added_sugars_g || '0'),
        sodium_mg: parseFloat(nutrition.sodium_mg || '0'),
        ai_generated: !!aiResult,
        ai_confidence: aiResult?.confidence,
        ai_assumptions: aiResult?.assumptions
      });
    } catch (err: any) {
      setError(err.message || 'Failed to add food');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200">What did you have?</h2>
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl bg-red-50 dark:bg-red-950/30 p-4 text-red-600 dark:text-red-400">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <Input 
            label="Food or Beverage" 
            placeholder="e.g. Chicken Biryani, Cold Coffee..." 
            value={foodName}
            onChange={(e) => setFoodName(e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Input 
            label="Quantity" 
            type="number" 
            min="0.1" 
            step="any"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
          <Select 
            label="Unit" 
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
          >
            <option value="grams">grams (g)</option>
            <option value="ml">ml</option>
            <option value="serving">serving</option>
            <option value="pieces">pieces</option>
            <option value="slices">slices</option>
            <option value="cups">cups</option>
            <option value="tbsp">tbsp</option>
          </Select>
          <Select 
            label="Meal Type" 
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
            className="col-span-2 md:col-span-1"
          >
            <option value="Breakfast">Breakfast</option>
            <option value="Lunch">Lunch</option>
            <option value="Dinner">Dinner</option>
            <option value="Snack">Snack</option>
            <option value="Beverage">Beverage</option>
            <option value="Dessert">Dessert</option>
            <option value="Other">Other</option>
          </Select>
        </div>

        {!aiResult && (
          <div className="pt-2">
            <Button 
              className="w-full relative overflow-hidden group" 
              size="lg"
              onClick={handleFetchAI}
              isLoading={isAnalyzing}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-fuchsia-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[length:200%_auto] animate-gradient" />
              <span className="relative flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                {isAnalyzing ? 'Analyzing your food...' : 'Fetch AI Nutrition'}
              </span>
            </Button>
            <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-3">
              Or manually enter nutrition below
            </p>
          </div>
        )}

        {aiResult && (
          <div className="rounded-2xl bg-purple-50/50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 p-5 space-y-4 animate-in zoom-in-95 duration-300">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-medium">
                <Sparkles className="w-4 h-4" />
                <span>AI Estimated ({aiResult.confidence} confidence)</span>
              </div>
            </div>
            
            {aiResult.assumptions.length > 0 && (
              <div className="text-sm text-slate-600 dark:text-slate-300 bg-white/60 dark:bg-slate-900/60 rounded-xl p-3 border border-purple-100/50 dark:border-purple-900/50">
                <p className="font-medium text-slate-700 dark:text-slate-200 mb-1">Assumptions:</p>
                <ul className="list-disc pl-4 space-y-1">
                  {aiResult.assumptions.map((a, i) => <li key={i}>{a}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4 flex items-center justify-between">
            Nutrition Details
            {aiResult ? (
              <span className="text-purple-600 dark:text-purple-400 flex items-center gap-1 normal-case tracking-normal text-xs font-medium bg-purple-100 dark:bg-purple-900/40 px-2 py-1 rounded-full"><Sparkles className="w-3 h-3"/> AI Generated</span>
            ) : (
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 normal-case tracking-normal text-xs font-medium bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">✎ Manual Entry</span>
            )}
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Input label="Calories (kcal)" type="number" value={nutrition.calories} onChange={e => setNutrition({...nutrition, calories: e.target.value})} />
            <Input label="Protein (g)" type="number" value={nutrition.protein_g} onChange={e => setNutrition({...nutrition, protein_g: e.target.value})} />
            <Input label="Fat (g)" type="number" value={nutrition.fat_g} onChange={e => setNutrition({...nutrition, fat_g: e.target.value})} />
            <Input label="Carbs (g)" type="number" value={nutrition.carbohydrates_g} onChange={e => setNutrition({...nutrition, carbohydrates_g: e.target.value})} />
            
            <Input label="Fiber (g)" type="number" value={nutrition.dietary_fiber_g} onChange={e => setNutrition({...nutrition, dietary_fiber_g: e.target.value})} />
            <Input label="Sugar (g)" type="number" value={nutrition.added_sugars_g} onChange={e => setNutrition({...nutrition, added_sugars_g: e.target.value})} />
            <Input label="Sodium (mg)" type="number" value={nutrition.sodium_mg} onChange={e => setNutrition({...nutrition, sodium_mg: e.target.value})} />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4">
          <Button 
            className="flex-1" 
            size="lg" 
            onClick={handleSubmit}
            isLoading={isSubmitting}
          >
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Add to Log
          </Button>
          <Button 
            variant="ghost" 
            size="lg" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
        
        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-2">
          AI nutrition values are estimates and may vary by brand, recipe, preparation method, and serving size.
        </p>
      </div>
    </Card>
  );
}
