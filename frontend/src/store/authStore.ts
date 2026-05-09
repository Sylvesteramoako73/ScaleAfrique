import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  updateTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: (user, accessToken, refreshToken) => {
        set({ user, accessToken, refreshToken, isAuthenticated: true });
        if (typeof document !== 'undefined') {
          document.cookie = `scaleafrique-auth=${encodeURIComponent(JSON.stringify({ state: { isAuthenticated: true } }))};path=/;max-age=2592000`;
        }
      },

      setUser: (user) => set({ user }),

      updateTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),

      logout: () => {
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
        if (typeof document !== 'undefined') {
          document.cookie = 'scaleafrique-auth=;path=/;max-age=0';
        }
      },

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'scaleafrique-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
