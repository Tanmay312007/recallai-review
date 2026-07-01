'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { passwordSchema } from '@lumora/shared';
import { api, fromAxiosError } from '@/lib/api';
import { AuthLayout } from '@/components/auth/auth-layout';
import { AuthCard } from '@/components/auth/auth-card';
import { AuthButton } from '@/components/auth/auth-button';
import { PasswordInput } from '@/components/auth/password-input';
import { FormError } from '@/components/auth/form-error';

const resetFormSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetFormData = z.infer<typeof resetFormSchema>;

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetFormSchema),
  });

  const onSubmit = async (data: ResetFormData) => {
    if (!token) {
      setServerError('Missing reset token. Please use the link from your email.');
      return;
    }

    setServerError(null);
    try {
      await api.auth.post('/auth/reset-password', {
        token,
        password: data.password,
      });
      setSuccess(true);
    } catch (err) {
      const apiErr = fromAxiosError(err);
      setServerError(apiErr.message);
    }
  };

  if (!token) {
    return (
      <AuthLayout>
        <AuthCard title="Invalid link">
          <div className="space-y-4 text-center">
            <p className="text-sm text-foreground-secondary">
              This password reset link is invalid. Please request a new one.
            </p>
            <Link
              href="/forgot-password"
              className="inline-block text-sm font-medium text-brand hover:text-brand-hover"
            >
              Request new reset link
            </Link>
          </div>
        </AuthCard>
      </AuthLayout>
    );
  }

  if (success) {
    return (
      <AuthLayout>
        <AuthCard title="Password updated">
          <div className="space-y-4 text-center">
            <p className="text-sm text-foreground-secondary">
              Your password has been updated successfully.
            </p>
            <Link
              href="/login"
              className="inline-block text-sm font-medium text-brand hover:text-brand-hover"
            >
              Sign in with your new password
            </Link>
          </div>
        </AuthCard>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AuthCard title="Reset password" description="Enter your new password">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormError message={serverError} />

          <PasswordInput
            label="New password"
            registration={register('password')}
            error={errors.password?.message}
            placeholder="At least 8 characters"
          />

          <PasswordInput
            label="Confirm password"
            registration={register('confirmPassword')}
            error={errors.confirmPassword?.message}
            placeholder="Re-enter your password"
          />

          <AuthButton type="submit" isLoading={isSubmitting}>
            Reset password
          </AuthButton>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
