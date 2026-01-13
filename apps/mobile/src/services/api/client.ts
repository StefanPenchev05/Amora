import AsyncStorage from '@react-native-async-storage/async-storage';
import { TokenService } from '../auth/token.service';

const API_URL = 'http://localhost:8000';
const TOKEN_KEY = 'auth_token';

interface ApiError {
  error: string;
  message: string;
}

class ApiClient {
  private readonly baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async getHeaders(): Promise<HeadersInit> {
    // Prefer SecureStore-backed access token (TokenService), but fall back to
    // legacy AsyncStorage key for backwards compatibility.
    let token: string | null = null;
    try {
      token = (await TokenService.getAccess()) ?? null;
    } catch {
      token = null;
    }

    if (!token) {
      token = await AsyncStorage.getItem(TOKEN_KEY);
    }
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (__DEV__) {
      console.log('[API] Auth token:', token ? `present (${token.length} chars)` : 'missing');
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  async setToken(token: string | undefined): Promise<void> {
    if (token) {
      // Store in SecureStore (preferred)
      try {
        await TokenService.setTokens(token);
      } catch {
        // ignore and still write legacy storage
      }
      await AsyncStorage.setItem(TOKEN_KEY, token);
    }
  }

  async removeToken(): Promise<void> {
    try {
      await TokenService.clear();
    } catch {
      // ignore
    }
    await AsyncStorage.removeItem(TOKEN_KEY);
  }

  async getToken(): Promise<string | null> {
    try {
      const token = (await TokenService.getAccess()) ?? null;
      if (token) return token;
    } catch {
      // ignore
    }
    return await AsyncStorage.getItem(TOKEN_KEY);
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers = await this.getHeaders();
    const config: RequestInit = {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    };

    const url = `${this.baseURL}${endpoint}`;
    console.log(`[API] ${options.method || 'GET'} ${url}`);
    if (options.body) {
      console.log('[API] Request body:', options.body);
    }

    try {
      const response = await fetch(url, config);
      
      console.log(`[API] Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('[API] Error response:', errorText);
        let error: ApiError;
        try {
          error = JSON.parse(errorText);
          console.log('[API] Parsed error:', error);
        } catch {
          error = { error: 'unknown_error', message: errorText || 'Request failed' };
        }
        throw new Error(error.message || 'Request failed');
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      const result = await response.json();
      console.log('[API] Response data:', result);
      return result;
    } catch (error) {
      console.error('[API] Request failed:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_URL);
export default apiClient;
