import { Sparkles, Trash2 } from 'lucide-react';
import type { FoodEntry } from '../types';
import { Card } from './UI/Card';
import { Button } from './UI/Button';

interface FoodLogProps {
  entries: FoodEntry[];
  onDelete: (id: number) => void;
}

const MEAL_ICONS: Record<string, string> = {
  'Breakfast': '🌅',
  'Lunch': '🍱',
  'Dinner': '🍽️',
  'Snack': '☕',
  'Beverage': '🥤',
  'Dessert': '🍨',
  'Other': '🍕'
};

export function FoodLog({ entries, onDelete }: FoodLogProps) {
  if (entries.length === 0) {
    return (
      <Card className="text-center py-12 border-dashed border-2 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="text-4xl mb-4">🥗</div>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Nothing logged yet</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          Start tracking your meals and see your nutrition story come to life.
        </p>
      </Card>
    );
  }

  // Group by meal
  const grouped = entries.reduce((acc, entry) => {
    if (!acc[entry.meal_type]) acc[entry.meal_type] = [];
    acc[entry.meal_type].push(entry);
    return acc;
  }, {} as Record<string, FoodEntry[]>);

  // Order meals
  const mealOrder = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Beverage', 'Dessert', 'Other'];
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Today's Food</h2>
      
      {mealOrder.map(meal => {
        const mealEntries = grouped[meal];
        if (!mealEntries?.length) return null;
        
        const mealCalories = mealEntries.reduce((sum, e) => sum + e.calories, 0);
        
        return (
          <div key={meal} className="space-y-3 animate-in fade-in duration-500">
            <div className="flex items-center justify-between px-2">
              <h3 className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <span>{MEAL_ICONS[meal] || '🍽️'}</span> {meal}
              </h3>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{Math.round(mealCalories)} kcal</span>
            </div>
            
            <div className="space-y-2">
              {mealEntries.map(entry => (
                <Card key={entry.id} className="p-4 hover:shadow-md transition-shadow group flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      {entry.food_name}
                      {entry.ai_generated && (
                        <span title="AI Estimated" className="text-purple-500 dark:text-purple-400"><Sparkles className="w-3.5 h-3.5" /></span>
                      )}
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      {entry.quantity} {entry.unit} • {Math.round(entry.calories)} kcal
                    </p>
                    <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1.5 flex gap-3">
                      <span>P <span className="text-slate-600 dark:text-slate-300">{Math.round(entry.protein_g)}g</span></span>
                      <span>C <span className="text-slate-600 dark:text-slate-300">{Math.round(entry.carbohydrates_g)}g</span></span>
                      <span>F <span className="text-slate-600 dark:text-slate-300">{Math.round(entry.fat_g)}g</span></span>
                    </p>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onDelete(entry.id)}
                    title="Delete entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
