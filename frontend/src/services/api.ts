import type { 
  FoodEntry, 
  NutritionAnalysisRequest, 
  NutritionAnalysisResponse, 
  DailySummary, 
  UserGoals, 
  HistoryResponse,
  User
} from '../types';

// Read from VITE_API_URL environment variable, fallback to just '/api'
const API_BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const headers = getAuthHeaders();
  const res = await fetch(url, { ...options, headers });
  
  if (res.status === 401) {
    localStorage.removeItem('auth_token');
    window.location.reload();
  }
  
  return res;
}

export const api = {
  // Auth
  async requestCode(email: string): Promise<void> {
    const res = await fetch(`${API_BASE}/auth/request-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error('Failed to request code');
  },

  async verifyCode(email: string, code: string): Promise<{ access_token: string }> {
    const res = await fetch(`${API_BASE}/auth/verify-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });
    if (!res.ok) throw new Error('Invalid code');
    return res.json();
  },

  async getMe(): Promise<User> {
    const res = await fetchWithAuth(`${API_BASE}/auth/me`);
    if (!res.ok) throw new Error('Failed to get user');
    return res.json();
  },

  async updateMe(data: Partial<User>): Promise<User> {
    const res = await fetchWithAuth(`${API_BASE}/auth/me`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update user');
    return res.json();
  },

  // Food
  async addFood(data: Partial<FoodEntry>): Promise<FoodEntry> {
    const res = await fetchWithAuth(`${API_BASE}/food/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to add food');
    return res.json();
  },
  
  async deleteFood(id: number): Promise<void> {
    const res = await fetchWithAuth(`${API_BASE}/food/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete food');
  },
  
  // Nutrition AI
  async analyzeNutrition(data: NutritionAnalysisRequest): Promise<NutritionAnalysisResponse> {
    const res = await fetchWithAuth(`${API_BASE}/nutrition/analyze`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.detail || 'Failed to analyze nutrition');
    }
    return res.json();
  },
  
  // Tracker
  async getDailySummary(date?: string): Promise<DailySummary> {
    const url = date ? `${API_BASE}/tracker/daily-summary?date=${date}` : `${API_BASE}/tracker/daily-summary`;
    const res = await fetchWithAuth(url);
    if (!res.ok) throw new Error('Failed to fetch summary');
    return res.json();
  },
  
  async getHistory(days = 7): Promise<HistoryResponse> {
    const res = await fetchWithAuth(`${API_BASE}/tracker/history?days=${days}`);
    if (!res.ok) throw new Error('Failed to fetch history');
    return res.json();
  },
  
  // Goals
  async getGoals(): Promise<UserGoals> {
    const res = await fetchWithAuth(`${API_BASE}/goals/`);
    if (!res.ok) throw new Error('Failed to fetch goals');
    return res.json();
  },
  
  async updateGoals(data: Partial<UserGoals>): Promise<UserGoals> {
    const res = await fetchWithAuth(`${API_BASE}/goals/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update goals');
    return res.json();
  }
};
