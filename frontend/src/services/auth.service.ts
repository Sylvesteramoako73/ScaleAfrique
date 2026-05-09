import api from './api';
import type { User } from '../types';

export interface LoginPayload { email: string; password: string }
export interface RegisterPayload { name: string; email: string; password: string }
export interface AuthResponse { user: User; accessToken: string; refreshToken: string }

type Envelope<T> = { success: boolean; data: T };

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await api.post<Envelope<AuthResponse>>('/auth/login', payload);
    return data.data;
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await api.post<Envelope<AuthResponse>>('/auth/register', payload);
    return data.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout').catch(() => {});
  },

  async refreshToken(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    const { data } = await api.post<Envelope<{ accessToken: string; refreshToken: string }>>('/auth/refresh-token', { refreshToken: token });
    return data.data;
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await api.post('/auth/reset-password', { token, password });
  },

  async getMe(): Promise<User> {
    const { data } = await api.get<Envelope<User>>('/users/me');
    return data.data;
  },
};
