import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/auth.service';
import type { LoginPayload, RegisterPayload } from '../services/auth.service';

export function useAuth() {
  const router = useRouter();
  const { user, accessToken, setAuth, logout: storeLogout, isLoading, setLoading } = useAuthStore();

  const login = useCallback(async (payload: LoginPayload) => {
    setLoading(true);
    try {
      const res = await authService.login(payload);
      setAuth(res.user, res.accessToken, res.refreshToken);
      toast.success(`Welcome back, ${res.user.name}!`);
      router.push(res.user.startupProfile ? '/dashboard' : '/onboarding');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Login failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [router, setAuth, setLoading]);

  const register = useCallback(async (payload: RegisterPayload) => {
    setLoading(true);
    try {
      const res = await authService.register(payload);
      setAuth(res.user, res.accessToken, res.refreshToken);
      toast.success("Account created! Let's set up your profile.");
      router.push('/onboarding');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [router, setAuth, setLoading]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      storeLogout();
      router.push('/');
      toast.success('Signed out successfully');
    }
  }, [router, storeLogout]);

  return { user, accessToken, isLoading, login, register, logout, isAuthenticated: !!accessToken };
}
