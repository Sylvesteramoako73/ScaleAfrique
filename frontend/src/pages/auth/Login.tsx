'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, FlaskConical } from 'lucide-react';
import { Logo } from '../../components/ui/Logo';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/authStore';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

const DEMO_USER = {
  id: 'demo-001',
  name: 'Kwame Mensah',
  email: 'kwame@payquick.com.gh',
  role: 'MEMBER' as const,
  isVerified: true,
  createdAt: new Date().toISOString(),
  startupProfile: {
    id: 'sp-001',
    userId: 'demo-001',
    companyName: 'PayQuick GH',
    industry: 'fintech',
    growthStage: 'GROWTH' as const,
    country: 'GH',
    region: 'Greater Accra',
    website: 'https://payquick.com.gh',
    description: 'Mobile payment solutions for Ghanaian SMEs',
    teamSize: 12,
    monthlyBudget: 2000,
    targetAudience: 'SMEs in Ghana and West Africa',
    languages: ['en', 'tw'],
  },
};

export function Login() {
  const { login, isLoading } = useAuth();
  const { setAuth } = useAuthStore();
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const loginAsDemo = () => {
    // Empty tokens = no Authorization header sent, so 401s don't trigger logout
    setAuth(DEMO_USER, '', '');
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-primary-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo size={42} textColor="text-white" />
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
          <p className="text-sm text-gray-500 mb-4">Sign in to your ScaleAfrique account</p>

          {/* Demo access */}
          <button
            onClick={loginAsDemo}
            className="w-full mb-5 flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 hover:bg-amber-100 transition-colors text-left"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-400 flex items-center justify-center shrink-0">
              <FlaskConical size={17} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-800">Try demo account</p>
              <p className="text-xs text-amber-600">Explore the full app instantly — no sign-up needed</p>
            </div>
          </button>

          <form onSubmit={handleSubmit(login)} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              placeholder="you@company.com"
              icon={<Mail size={15} />}
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={<Lock size={15} />}
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="flex items-center justify-end">
              <Link href="/auth/forgot-password" className="text-xs text-primary-600 hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" fullWidth loading={isLoading}>
              Sign in
            </Button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-gray-400">or continue with</span>
            </div>
          </div>

          <Button variant="outline" fullWidth icon={
            <img src="https://www.google.com/favicon.ico" alt="" className="w-4 h-4" />
          }>
            Google
          </Button>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-primary-600 font-medium hover:underline">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
