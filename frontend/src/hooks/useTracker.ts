import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import type { DailySummary, FoodEntry } from '../types';

export function useTracker(date?: string) {
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [goals, setGoals] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [summaryData, goalsData] = await Promise.all([
        api.getDailySummary(date),
        api.getGoals()
      ]);
      setSummary(summaryData);
      setGoals(goalsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load summary');
    } finally {
      setIsLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const addFood = async (entry: Partial<FoodEntry>) => {
    await api.addFood(entry);
    await fetchSummary();
  };

  const deleteFood = async (id: number) => {
    await api.deleteFood(id);
    await fetchSummary();
  };

  return {
    summary,
    goals,
    isLoading,
    error,
    addFood,
    deleteFood,
    refresh: fetchSummary
  };
}
