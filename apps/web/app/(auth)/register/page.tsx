'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerSchema } from '@lumora/shared';
import { useAuthStore } from '@/stores/auth-store';
import { fromAxiosError } from '@/lib/api';
import { AuthLayout } from '@/components/auth/auth-layout';
import { AuthCard } from '@/components/auth/auth-card';
import { AuthButton } from '@/components/auth/auth-button';
import { PasswordInput } from '@/components/auth/password-input';
import { FormError } from '@/components/auth/form-error';

const registerFormSchema = registerSchema
  .extend({
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerFormSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const registerUser = useAuthStore((s) => s.register);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    try {
      await registerUser(data.email, data.password, data.name);
      router.replace('/dashboard');
    } catch (err) {
      const apiErr = fromAxiosError(err);
      setServerError(apiErr.message);
    }
  };

  return (
    <AuthLayout>
      <AuthCard title="Create account" description="Get started with RecallAI">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormError message={serverError} />

          <div className="space-y-1.5">
            <label htmlFor="name" className="text-sm font-medium text-foreground">
              Full name
            </label>
            <input
              {...register('name')}
              id="name"
              type="text"
              placeholder="Jane Smith"
              autoComplete="name"
              className={`w-full rounded-lg border bg-background-surface px-3 py-2.5 text-sm text-foreground placeholder:text-foreground-disabled focus:outline-none focus:ring-2 focus:ring-brand ${
                errors.name ? 'border-semantic-error' : 'border-bg-overlay'
              }`}
            />
            {errors.name && (
              <p className="text-xs text-semantic-error">{errors.name.message}</p>
            )}
          </div>

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
            placeholder="At least 8 characters"
          />

          <PasswordInput
            label="Confirm password"
            registration={register('confirmPassword')}
            error={errors.confirmPassword?.message}
            placeholder="Re-enter your password"
          />

          <AuthButton type="submit" isLoading={isSubmitting}>
            Create account
          </AuthButton>
        </form>

        <p className="text-center text-sm text-foreground-muted">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-brand hover:text-brand-hover">
            Sign in
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}
