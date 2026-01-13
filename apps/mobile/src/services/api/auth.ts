import apiClient from './client';

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
    await apiClient.setToken(response.access_token);
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
    await apiClient.removeToken();
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await apiClient.getToken();
    return !!token;
  },
};
