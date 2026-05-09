import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
});

// Attach JWT to every request
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

// Handle 401 — refresh token then retry original request
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (refreshing) {
        // Queue this request until refresh resolves
        return new Promise((resolve) => {
          refreshQueue.push((token: string) => {
            if (originalRequest.headers) originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      refreshing = true;
      const { refreshToken, updateTokens, logout } = useAuthStore.getState();

      // No refresh token means demo mode or fully unauthenticated — don't force logout
      if (!refreshToken) {
        refreshing = false;
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(`${API_BASE_URL}/auth/refresh-token`, { refreshToken });
        const { accessToken: newAccess, refreshToken: newRefresh } = res.data.data;
        updateTokens(newAccess, newRefresh);

        refreshQueue.forEach((cb) => cb(newAccess));
        refreshQueue = [];

        if (originalRequest.headers) originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api(originalRequest);
      } catch {
        logout();
        window.location.href = '/auth/login';
        return Promise.reject(error);
      } finally {
        refreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// Typed convenience methods
export const apiGet = <T>(url: string, params?: Record<string, unknown>) =>
  api.get<{ success: boolean; data: T }>(url, { params }).then((r) => r.data.data);

export const apiPost = <T>(url: string, body?: unknown) =>
  api.post<{ success: boolean; data: T }>(url, body).then((r) => r.data.data);

export const apiPut = <T>(url: string, body?: unknown) =>
  api.put<{ success: boolean; data: T }>(url, body).then((r) => r.data.data);

export const apiDelete = <T>(url: string) =>
  api.delete<{ success: boolean; data: T }>(url).then((r) => r.data.data);

export default api;
