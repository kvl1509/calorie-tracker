import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { User, UserGoals } from '../types';
import { Button } from '../components/UI/Button';
import { Card } from '../components/UI/Card';

export function Profile({ onLogout }: { onLogout: () => void }) {
  const [user, setUser] = useState<User | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({});
  const [goalsFormData, setGoalsFormData] = useState<Partial<UserGoals>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userData, goalsData] = await Promise.all([
          api.getMe(),
          api.getGoals()
        ]);
        setUser(userData);
        setFormData({
          username: userData.username || '',
          age: userData.age || '',
          gender: userData.gender || '',
          height: userData.height || '',
          weight: userData.weight || ''
        } as any);
        setGoalsFormData({
          daily_calorie_goal: goalsData.daily_calorie_goal,
          protein_goal_g: goalsData.protein_goal_g,
          carbohydrates_goal_g: goalsData.carbohydrates_goal_g,
          fat_goal_g: goalsData.fat_goal_g
        });
      } catch (err) {
        console.error('Failed to load profile', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    try {
      const updatedUser = await api.updateMe({
        username: formData.username,
        age: formData.age ? Number(formData.age) : undefined,
        gender: formData.gender,
        height: formData.height ? Number(formData.height) : undefined,
        weight: formData.weight ? Number(formData.weight) : undefined,
      });
      await api.updateGoals({
        daily_calorie_goal: goalsFormData.daily_calorie_goal ? Number(goalsFormData.daily_calorie_goal) : undefined,
        protein_goal_g: goalsFormData.protein_goal_g ? Number(goalsFormData.protein_goal_g) : undefined,
        carbohydrates_goal_g: goalsFormData.carbohydrates_goal_g ? Number(goalsFormData.carbohydrates_goal_g) : undefined,
        fat_goal_g: goalsFormData.fat_goal_g ? Number(goalsFormData.fat_goal_g) : undefined
      });
      setUser(updatedUser);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update profile', err);
    }
  };

  const calculateBMI = () => {
    if (!formData.height || !formData.weight) return '';
    const heightInMeters = Number(formData.height) / 100;
    const weightInKg = Number(formData.weight);
    if (heightInMeters <= 0 || weightInKg <= 0) return '';
    const bmi = weightInKg / (heightInMeters * heightInMeters);
    const bmiValue = bmi.toFixed(1);
    
    let category = '';
    if (bmi < 18.5) category = 'Underweight';
    else if (bmi < 25) category = 'Healthy';
    else if (bmi < 30) category = 'Overweight';
    else category = 'Obese';

    return `${bmiValue} - ${category}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Your Profile</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Manage your personal information and goals.</p>
      </header>

      <Card className="p-8 space-y-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Personal Information</h2>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/60">
              Edit
            </Button>
          ) : (
            <div className="space-x-2 flex">
              <Button onClick={() => setIsEditing(false)} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700">
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600">
                Save
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
            <input type="text" value={user?.email || ''} disabled className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Username</label>
            <input 
              type="text" 
              value={formData.username || ''} 
              disabled={!isEditing}
              onChange={e => setFormData({...formData, username: e.target.value})}
              className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg disabled:bg-slate-50 disabled:text-slate-500 dark:disabled:bg-slate-800 dark:disabled:text-slate-400 focus:ring-2 focus:ring-purple-500 outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Age</label>
            <input 
              type="number" 
              value={formData.age || ''} 
              disabled={!isEditing}
              onChange={e => setFormData({...formData, age: e.target.value as any})}
              className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg disabled:bg-slate-50 disabled:text-slate-500 dark:disabled:bg-slate-800 dark:disabled:text-slate-400 focus:ring-2 focus:ring-purple-500 outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Gender</label>
            <select 
              value={formData.gender || ''} 
              disabled={!isEditing}
              onChange={e => setFormData({...formData, gender: e.target.value})}
              className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg disabled:bg-slate-50 disabled:text-slate-500 dark:disabled:bg-slate-800 dark:disabled:text-slate-400 focus:ring-2 focus:ring-purple-500 outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            >
              <option value="">Select...</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Height (cm)</label>
            <input 
              type="number" 
              value={formData.height || ''} 
              disabled={!isEditing}
              onChange={e => setFormData({...formData, height: e.target.value as any})}
              className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg disabled:bg-slate-50 disabled:text-slate-500 dark:disabled:bg-slate-800 dark:disabled:text-slate-400 focus:ring-2 focus:ring-purple-500 outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Weight (kg)</label>
            <input 
              type="number" 
              value={formData.weight || ''} 
              disabled={!isEditing}
              onChange={e => setFormData({...formData, weight: e.target.value as any})}
              className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg disabled:bg-slate-50 disabled:text-slate-500 dark:disabled:bg-slate-800 dark:disabled:text-slate-400 focus:ring-2 focus:ring-purple-500 outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">BMI (Read-only)</label>
            <input 
              type="text" 
              value={calculateBMI()} 
              disabled 
              className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-100 dark:bg-slate-800/50 font-semibold text-slate-700 dark:text-slate-300" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Calorie Goal (kcal)</label>
            <input 
              type="number" 
              value={goalsFormData.daily_calorie_goal || ''} 
              disabled={!isEditing}
              onChange={e => setGoalsFormData({...goalsFormData, daily_calorie_goal: e.target.value as any})}
              className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg disabled:bg-slate-50 disabled:text-slate-500 dark:disabled:bg-slate-800 dark:disabled:text-slate-400 focus:ring-2 focus:ring-purple-500 outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Protein Goal (g)</label>
            <input 
              type="number" 
              value={goalsFormData.protein_goal_g || ''} 
              disabled={!isEditing}
              onChange={e => setGoalsFormData({...goalsFormData, protein_goal_g: e.target.value as any})}
              className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg disabled:bg-slate-50 disabled:text-slate-500 dark:disabled:bg-slate-800 dark:disabled:text-slate-400 focus:ring-2 focus:ring-purple-500 outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Carbs Goal (g)</label>
            <input 
              type="number" 
              value={goalsFormData.carbohydrates_goal_g || ''} 
              disabled={!isEditing}
              onChange={e => setGoalsFormData({...goalsFormData, carbohydrates_goal_g: e.target.value as any})}
              className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg disabled:bg-slate-50 disabled:text-slate-500 dark:disabled:bg-slate-800 dark:disabled:text-slate-400 focus:ring-2 focus:ring-purple-500 outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Fat Goal (g)</label>
            <input 
              type="number" 
              value={goalsFormData.fat_goal_g || ''} 
              disabled={!isEditing}
              onChange={e => setGoalsFormData({...goalsFormData, fat_goal_g: e.target.value as any})}
              className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg disabled:bg-slate-50 disabled:text-slate-500 dark:disabled:bg-slate-800 dark:disabled:text-slate-400 focus:ring-2 focus:ring-purple-500 outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" 
            />
          </div>
        </div>
      </Card>

      <div className="flex justify-center pt-8">
        <Button onClick={onLogout} className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-900/50 px-8 py-3 rounded-xl font-medium flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          Logout
        </Button>
      </div>
    </div>
  );
}
