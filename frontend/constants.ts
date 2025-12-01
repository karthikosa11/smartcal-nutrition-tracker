import { UserRole } from './types';

export const APP_NAME = 'SmartCal AI';
export const DEFAULT_DAILY_TARGET = 2000;

export const MOCK_USERS = [
  {
    id: 'u1',
    username: 'john_doe',
    role: UserRole.USER,
    dailyCalorieTarget: 2200
  },
  {
    id: 'a1',
    username: 'admin',
    role: UserRole.ADMIN,
    dailyCalorieTarget: 2000
  }
];

export const INITIAL_LOGS_KEY = 'smartcal_logs';
export const CURRENT_USER_KEY = 'smartcal_current_user';
