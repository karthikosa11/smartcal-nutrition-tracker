import { MealLog } from '../types';
import { apiService } from './apiService';

export class DBService {
  
  // CREATE
  static async addLog(log: MealLog): Promise<MealLog> {
    const createdLog = await apiService.createMealLog({
      userId: log.userId,
      date: log.date,
      mealType: log.mealType,
      foodItems: log.foodItems,
      totalCalories: log.totalCalories,
      imageUrl: log.imageUrl,
      notes: log.notes,
    });
    return createdLog;
  }

  // READ
  static async getLogs(): Promise<MealLog[]> {
    return await apiService.getMealLogs();
  }

  static async getLogsByUser(userId: string): Promise<MealLog[]> {
    const logs = await apiService.getMealLogs();
    return logs.filter(log => log.userId === userId).sort((a, b) => b.timestamp - a.timestamp);
  }

  // UPDATE
  static async updateLog(id: string, updates: Partial<MealLog>): Promise<void> {
    await apiService.updateMealLog(id, updates);
  }

  // DELETE
  static async deleteLog(id: string): Promise<void> {
    await apiService.deleteMealLog(id);
  }
  
  // ANALYTICS
  static async getWeeklyStats(_userId: string): Promise<any[]> {
    return await apiService.getWeeklyStats();
  }
}

export default DBService;