import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { loginSchema, LoginFormData } from '@/schemas/auth';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { ApiErrorResponse } from '@/types/api';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const [serverError, setServerError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setServerError('');
      await login(data);
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const message = axiosError.response?.data?.error?.message || 'Login failed. Please try again.';
      setServerError(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-surface to-primary/10 px-4">
      <div className="w-full max-w-md animate-slide-in">
        <div className="bg-background border border-border rounded-xl p-8 shadow-xl">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-xl mb-4 shadow-lg">
              <svg
                className="w-8 h-8 text-background"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-text mb-2">Welcome to BERM</h1>
            <p className="text-sm text-text-muted">
              Borrowing Equipment and Resources Management
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {serverError && (
              <div
                className="px-4 py-3 text-sm bg-error-light text-error border border-error/20 rounded-lg animate-slide-down"
                role="alert"
              >
                {serverError}
              </div>
            )}

            <Input
              label="Username"
              type="text"
              autoComplete="username"
              error={errors.username?.message}
              required
              {...register('username')}
            />

            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              error={errors.password?.message}
              required
              {...register('password')}
            />

            <Button type="submit" disabled={isSubmitting} className="w-full mt-6">
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-xs text-text-muted">
            Secure access to your inventory management system
          </div>
        </div>
      </div>
    </div>
  );
};
