'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginSchema, type LoginRequest } from '@lumora/shared';
import { useAuthStore } from '@/stores/auth-store';
import { fromAxiosError } from '@/lib/api';
import { AuthLayout } from '@/components/auth/auth-layout';
import { AuthCard } from '@/components/auth/auth-card';
import { AuthButton } from '@/components/auth/auth-button';
import { PasswordInput } from '@/components/auth/password-input';
import { FormError } from '@/components/auth/form-error';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginRequest) => {
    setServerError(null);
    try {
      await login(data.email, data.password);
      router.replace('/dashboard');
    } catch (err) {
      const apiErr = fromAxiosError(err);
      if (apiErr.isRateLimited) {
        setServerError('Too many attempts. Please try again later.');
      } else {
        setServerError(apiErr.message);
      }
    }
  };

  return (
    <AuthLayout>
      <AuthCard title="Sign in" description="Welcome back to RecallAI">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormError message={serverError} />

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Email
            </label>
            <input
              {...register('email')}
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              className={`w-full rounded-lg border bg-background-surface px-3 py-2.5 text-sm text-foreground placeholder:text-foreground-disabled focus:outline-none focus:ring-2 focus:ring-brand ${
                errors.email ? 'border-semantic-error' : 'border-bg-overlay'
              }`}
            />
            {errors.email && (
              <p className="text-xs text-semantic-error">{errors.email.message}</p>
            )}
          </div>

          <PasswordInput
            label="Password"
            registration={register('password')}
            error={errors.password?.message}
            placeholder="Enter your password"
          />

          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-xs text-foreground-muted hover:text-brand"
            >
              Forgot password?
            </Link>
          </div>

          <AuthButton type="submit" isLoading={isSubmitting}>
            Sign in
          </AuthButton>
        </form>

        <p className="text-center text-sm text-foreground-muted">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium text-brand hover:text-brand-hover">
            Create one
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}
