import { User, UserRole } from '../types.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface SignupData {
  username: string;
  email: string;
  password: string;
  dailyCalorieTarget?: number;
}

class AuthService {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('auth_token');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_URL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        // Add timeout for better error handling
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || 'Request failed');
      }

      return response.json();
    } catch (error: any) {
      // Handle network errors
      if (error.name === 'AbortError' || error.name === 'TypeError') {
        console.error('Network error:', error);
        throw new Error('Failed to connect to server. Please check your internet connection and ensure the backend is running.');
      }
      throw error;
    }
  }

  async signup(data: SignupData): Promise<{ user: User; token: string }> {
    const response = await this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Convert role string to UserRole enum
    const user: User = {
      ...response.user,
      role: response.user.role as UserRole
    };

    this.token = response.token;
    localStorage.setItem('auth_token', response.token);
    localStorage.setItem('user', JSON.stringify(user));

    return { user, token: response.token };
  }

  async login(username: string, password: string): Promise<{ user: User; token: string }> {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    // Convert role string to UserRole enum
    const user: User = {
      ...response.user,
      role: response.user.role as UserRole
    };

    this.token = response.token;
    localStorage.setItem('auth_token', response.token);
    localStorage.setItem('user', JSON.stringify(user));

    return { user, token: response.token };
  }

  async verifyToken(): Promise<User | null> {
    if (!this.token) {
      return null;
    }

    try {
      const response = await this.request('/auth/verify');
      // Convert role string to UserRole enum
      const user: User = {
        ...response.user,
        role: response.user.role as UserRole
      };
      return user;
    } catch (error) {
      this.logout();
      return null;
    }
  }

  logout() {
    this.token = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }

  getToken(): string | null {
    return this.token;
  }

  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    const parsed = JSON.parse(userStr);
    // Convert role string to UserRole enum
    return {
      ...parsed,
      role: parsed.role as UserRole
    };
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  async updateProfile(updates: { username?: string; email?: string; dailyCalorieTarget?: number }): Promise<User> {
    const response = await this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });

    // Convert role string to UserRole enum
    const user: User = {
      ...response.user,
      role: response.user.role as UserRole
    };

    // Update stored user data
    localStorage.setItem('user', JSON.stringify(user));
    
    return user;
  }
}

export const authService = new AuthService();

