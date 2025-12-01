import { MealLog } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_URL}${endpoint}`;
    console.log('API Request:', url, options.method || 'GET');
    
    const response = await fetch(url, {
      ...options,
      headers: this.getAuthHeaders(),
    });

    console.log('API Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error response:', errorText);
      let error;
      try {
        error = JSON.parse(errorText);
      } catch {
        error = { error: errorText || 'Request failed' };
      }
      throw new Error(error.error || 'Request failed');
    }

    const data = await response.json();
    console.log('API Response data:', data);
    return data;
  }

  // Meal Logs
  async getMealLogs(): Promise<MealLog[]> {
    try {
      const response = await this.request<{ logs: any[] }>('/meals');
      console.log('API Response:', response);
      console.log('Raw logs from API:', response.logs);
      const transformed = this.transformLogs(response.logs || []);
      console.log('Transformed logs:', transformed);
      return transformed;
    } catch (error) {
      console.error('Error fetching meal logs:', error);
      return [];
    }
  }

  async getMealLog(id: string): Promise<MealLog> {
    const response = await this.request<{ log: any }>(`/meals/${id}`);
    return this.transformLog(response.log);
  }

  async createMealLog(log: Omit<MealLog, 'id' | 'timestamp'>): Promise<MealLog> {
    const response = await this.request<{ log: any }>('/meals', {
      method: 'POST',
      body: JSON.stringify(log),
    });
    return this.transformLog(response.log);
  }

  async updateMealLog(id: string, updates: Partial<MealLog>): Promise<MealLog> {
    const response = await this.request<{ log: any }>(`/meals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return this.transformLog(response.log);
  }

  async deleteMealLog(id: string): Promise<void> {
    await this.request(`/meals/${id}`, {
      method: 'DELETE',
    });
  }

  async getWeeklyStats(): Promise<any[]> {
    const response = await this.request<{ stats: any[] }>('/meals/stats/weekly');
    return response.stats;
  }

  // Transform database format to app format
  private transformLog(dbLog: any): MealLog {
    if (!dbLog) {
      console.error('transformLog: dbLog is null or undefined');
      throw new Error('Invalid log data');
    }
    
    console.log('Transforming log:', dbLog);
    
    try {
      const foodItems = typeof dbLog.food_items === 'string' 
        ? JSON.parse(dbLog.food_items) 
        : (dbLog.food_items || []);
      
      // Convert date to YYYY-MM-DD format
      let dateStr: string;
      if (dbLog.date instanceof Date) {
        dateStr = dbLog.date.toISOString().split('T')[0];
      } else if (typeof dbLog.date === 'string') {
        // Handle both ISO format and YYYY-MM-DD format
        dateStr = dbLog.date.split('T')[0];
      } else {
        dateStr = new Date(dbLog.date).toISOString().split('T')[0];
      }
      
      const transformed: MealLog = {
        id: dbLog.id,
        userId: dbLog.user_id || dbLog.userId,
        date: dateStr, // Ensure YYYY-MM-DD format
        mealType: dbLog.meal_type || dbLog.mealType,
        foodItems: Array.isArray(foodItems) ? foodItems : [],
        totalCalories: dbLog.total_calories || dbLog.totalCalories || 0,
        imageUrl: dbLog.image_url || dbLog.imageUrl,
        notes: dbLog.notes,
        timestamp: dbLog.timestamp || Date.now(),
      };
      
      console.log('Transformed log result:', transformed);
      return transformed;
    } catch (error) {
      console.error('Error transforming log:', error, dbLog);
      throw error;
    }
  }

  private transformLogs(dbLogs: any[]): MealLog[] {
    if (!Array.isArray(dbLogs)) {
      console.error('transformLogs: dbLogs is not an array:', dbLogs);
      return [];
    }
    
    console.log('Transforming logs array, length:', dbLogs.length);
    return dbLogs.map(log => {
      try {
        return this.transformLog(log);
      } catch (error) {
        console.error('Error transforming individual log:', error, log);
        return null;
      }
    }).filter((log): log is MealLog => log !== null);
  }
}

export const apiService = new ApiService();

