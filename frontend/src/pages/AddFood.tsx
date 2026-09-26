import { FoodEntryForm } from '../components/FoodEntryForm';
import { ArrowLeft } from 'lucide-react';
import { useTracker } from '../hooks/useTracker';
import { Button } from '../components/UI/Button';
import type { FoodEntry } from '../types';

interface AddFoodProps {
  onNavigate: (tab: 'dashboard' | 'history' | 'profile' | 'settings' | 'addFood') => void;
  selectedDate?: string;
}

export function AddFood({ onNavigate, selectedDate }: AddFoodProps) {
  const { addFood } = useTracker(selectedDate);

  const handleAdd = async (entry: Partial<FoodEntry>) => {
    if (selectedDate) {
      const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
      if (selectedDate !== todayStr) {
        entry.consumed_at = new Date(`${selectedDate}T12:00:00+05:30`).toISOString();
      }
    }
    await addFood(entry);
    onNavigate('dashboard');
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-4">
        <Button 
          variant="ghost" 
          onClick={() => onNavigate('dashboard')}
          className="w-fit pl-0 hover:bg-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Button>
      </header>
      
      <FoodEntryForm onAdd={handleAdd} onCancel={() => onNavigate('dashboard')} />
    </div>
  );
}
