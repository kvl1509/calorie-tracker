import { useState } from 'react';
import { Plus, Calendar } from 'lucide-react';
import { useTracker } from '../hooks/useTracker';
import { MacroCard } from '../components/MacroCard';
import { FoodLog } from '../components/FoodLog';
import { FoodEntryForm } from '../components/FoodEntryForm';
import { Button } from '../components/UI/Button';
import { Card } from '../components/UI/Card';
import type { FoodEntry } from '../types';

function getISTDateString() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

export function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(() => {
    return getISTDateString();
  });
  const { summary, goals, isLoading, error, addFood, deleteFood } = useTracker(selectedDate);
  const [isAddingMode, setIsAddingMode] = useState(false);

  if (isLoading && (!summary || !goals)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error && !summary) {
    return <div className="text-red-500 dark:text-red-400 text-center p-8">{error}</div>;
  }

  const handleAdd = async (entry: Partial<FoodEntry>) => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (selectedDate !== todayStr) {
      entry.consumed_at = new Date(`${selectedDate}T12:00:00Z`).toISOString();
    }
    await addFood(entry);
    setIsAddingMode(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {getGreeting()} <span className="inline-block animate-bounce origin-bottom-right">👋</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            {selectedDate === new Date().toISOString().split('T')[0] ? "Let's see how you're fueling today." : `Here is your summary for ${selectedDate}.`}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <Calendar className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent border-none outline-none text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
            max={new Date().toISOString().split('T')[0]}
            style={{ colorScheme: 'inherit' }}
          />
        </div>
      </header>

      {isAddingMode ? (
        <FoodEntryForm onAdd={handleAdd} onCancel={() => setIsAddingMode(false)} />
      ) : (
        <>
          {/* Main Calorie Summary */}
          {summary && (
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 text-white border-transparent p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <h2 className="text-slate-300 dark:text-slate-400 font-medium flex items-center gap-2 mb-2">
                    <span>🔥</span> {selectedDate === new Date().toISOString().split('T')[0] ? "Today's" : selectedDate} Calories
                  </h2>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-5xl font-bold tracking-tight text-white dark:text-slate-100">
                      {Math.round(summary.total_nutrition.calories)}
                    </span>
                    <span className="text-xl text-slate-400 dark:text-slate-500 font-medium">
                      / {goals?.daily_calorie_goal || 2000} kcal
                    </span>
                  </div>
                  <p className="text-slate-400 dark:text-slate-500 font-medium">
                    {Math.max(0, (goals?.daily_calorie_goal || 2000) - summary.total_nutrition.calories)} kcal remaining
                  </p>
                </div>
                
                <div className="w-full md:w-1/2">
                  <div className="h-3 w-full bg-slate-700/50 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${Math.min(100, (summary.total_nutrition.calories / (goals?.daily_calorie_goal || 2000)) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Macros */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MacroCard 
                title="Protein" emoji="💪" 
                current={summary.total_nutrition.protein_g} 
                goal={goals?.protein_goal_g || 140} 
                bgClass="bg-blue-50/50 dark:bg-blue-900/20" 
                colorClass="bg-blue-500 dark:bg-blue-400" 
              />
              <MacroCard 
                title="Carbs" emoji="⚡" 
                current={summary.total_nutrition.carbohydrates_g} 
                goal={goals?.carbohydrates_goal_g || 250} 
                bgClass="bg-amber-50/50 dark:bg-amber-900/20" 
                colorClass="bg-amber-500 dark:bg-amber-400" 
              />
              <MacroCard 
                title="Fat" emoji="🥑" 
                current={summary.total_nutrition.fat_g} 
                goal={goals?.fat_goal_g || 70} 
                bgClass="bg-emerald-50/50 dark:bg-emerald-900/20" 
                colorClass="bg-emerald-500 dark:bg-emerald-400" 
              />
            </div>
          )}

          {/* Add Food CTA */}
          <Button 
            className="w-full py-8 text-lg border-dashed border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-200 dark:hover:border-purple-800 hover:text-purple-700 dark:hover:text-purple-400 text-slate-600 dark:text-slate-400 transition-all shadow-none"
            onClick={() => setIsAddingMode(true)}
          >
            <Plus className="w-6 h-6 mr-2" />
            Add Food
          </Button>

          {/* Food Log */}
          {summary && (
            <FoodLog entries={summary.entries} onDelete={deleteFood} />
          )}
        </>
      )}
    </div>
  );
}
