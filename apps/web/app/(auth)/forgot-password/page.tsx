'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { z } from 'zod';
import { forgotPasswordSchema } from '@recallai/shared';
import { api, fromAxiosError } from '@/lib/api';
import { AuthLayout } from '@/components/auth/auth-layout';
import { AuthCard } from '@/components/auth/auth-card';
import { AuthButton } from '@/components/auth/auth-button';
import { FormError } from '@/components/auth/form-error';

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordData) => {
    setServerError(null);
    try {
      await api.auth.post('/auth/forgot-password', { email: data.email });
      setSent(true);
    } catch (err) {
      const apiErr = fromAxiosError(err);
      setServerError(apiErr.message);
    }
  };

  if (sent) {
    return (
      <AuthLayout>
        <AuthCard title="Check your email">
          <div className="space-y-4 text-center">
            <p className="text-sm text-foreground-secondary">
              If an account exists for that email, we&apos;ve sent a password reset link.
            </p>
            <Link
              href="/login"
              className="inline-block text-sm font-medium text-brand hover:text-brand-hover"
            >
              Back to sign in
            </Link>
          </div>
        </AuthCard>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Reset password"
        description="Enter your email and we'll send you a reset link"
      >
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

          <AuthButton type="submit" isLoading={isSubmitting}>
            Send reset link
          </AuthButton>
        </form>

        <p className="text-center text-sm text-foreground-muted">
          Remember your password?{' '}
          <Link href="/login" className="font-medium text-brand hover:text-brand-hover">
            Sign in
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}
