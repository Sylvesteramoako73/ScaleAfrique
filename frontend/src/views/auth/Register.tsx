'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import Link from 'next/link';
import { User, Mail, Lock } from 'lucide-react';
import { Logo } from '../../components/ui/Logo';
import { useAuth } from '../../hooks/useAuth';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  terms: z.literal(true, { errorMap: () => ({ message: 'You must accept the terms' }) }),
});

type FormData = z.infer<typeof schema>;

export function Register() {
  const { register: doRegister, isLoading } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = ({ name, email, password }: FormData) =>
    doRegister({ name, email, password });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-primary-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo size={42} textColor="text-white" />
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h1>
          <p className="text-sm text-gray-500 mb-6">Start growing your African business today</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full name"
              type="text"
              placeholder="Kwame Mensah"
              icon={<User size={15} />}
              error={errors.name?.message}
              {...register('name')}
            />
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
              placeholder="Min. 8 characters"
              icon={<Lock size={15} />}
              error={errors.password?.message}
              {...register('password')}
            />

            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" className="mt-0.5 rounded" {...register('terms')} />
              <span className="text-xs text-gray-600">
                I agree to the{' '}
                <a href="#" className="text-primary-600 hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>
              </span>
            </label>
            {errors.terms && <p className="text-xs text-red-600">{errors.terms.message}</p>}

            <Button type="submit" fullWidth loading={isLoading}>
              Create account
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
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
