export enum UserRole {
    USER = 'USER',
    ADMIN = 'ADMIN'
  }
  
  export enum MealType {
    BREAKFAST = 'Breakfast',
    LUNCH = 'Lunch',
    DINNER = 'Dinner',
    SNACK = 'Snack'
  }
  
  export interface User {
    id: string;
    username: string;
    email?: string;
    role: UserRole;
    dailyCalorieTarget: number;
  }
  
  export interface FoodItem {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }
  
  export interface MealLog {
    id: string;
    userId: string;
    date: string; // ISO Date string
    mealType: MealType;
    foodItems: FoodItem[];
    totalCalories: number;
    imageUrl?: string; // Base64 or URL
    notes?: string;
    timestamp: number;
  }
  
  // For chart data
  export interface DailyStat {
    date: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }
  