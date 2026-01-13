import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './client';
import { TokenService } from '../auth/token.service';

const CURRENT_USER_KEY = 'current_user';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
}

export interface AuthResponse {
  user: {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    relationship_id?: string;
  };
  access_token: string;
  refresh_token: string;
  token_type: string;
  exp: number;
}

export interface RegisterResponse {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  created_at: string;
}

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', {
      email_or_username: data.email,
      password: data.password,
    });

    // Store tokens in SecureStore (preferred) + keep legacy storage for compatibility.
    await TokenService.setTokens(response.access_token, response.refresh_token);
    await apiClient.setToken(response.access_token);

    // Cache user info for UI.
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(response.user));
    return response;
  },

  async register(data: RegisterRequest): Promise<void> {
    try {
      console.log('Registering user...', { email: data.email, username: data.username });
      await apiClient.post<RegisterResponse>('/auth/register', data);
      console.log('Registration successful');
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    await TokenService.clear();
    await apiClient.removeToken();

    await AsyncStorage.removeItem(CURRENT_USER_KEY);
  },

  async getCurrentUser(): Promise<AuthResponse['user'] | null> {
    const raw = await AsyncStorage.getItem(CURRENT_USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthResponse['user'];
    } catch {
      return null;
    }
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await apiClient.getToken();
    return !!token;
  },
};
