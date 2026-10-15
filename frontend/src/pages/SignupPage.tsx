import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { apiClient } from '@/lib/api-client';
import type { ApiErrorResponse } from '@/types/api';

const signupSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  institute_email: z.string().email('Invalid email address'),
  roll_no: z.string().min(3, 'Roll number must be at least 3 characters').max(50),
  phone: z.string().optional(),
  programme: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type SignupFormData = z.infer<typeof signupSchema>;

export const SignupPage = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      setServerError('');
      setSuccessMessage('');
      
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...signupData } = data;
      
      await apiClient.post('/auth/register', signupData);
      
      setSuccessMessage('Account created successfully! Redirecting to login...');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const message = axiosError.response?.data?.error?.message || 'Registration failed. Please try again.';
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
            <h1 className="text-2xl font-semibold text-text mb-2">Create Account</h1>
            <p className="text-sm text-text-muted">
              Join BERM to manage equipment efficiently
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

            {successMessage && (
              <div
                className="px-4 py-3 text-sm bg-success-light text-success border border-success/20 rounded-lg animate-slide-down"
                role="alert"
              >
                {successMessage}
              </div>
            )}

            <Input
              label="Full Name"
              type="text"
              autoComplete="name"
              error={errors.full_name?.message}
              required
              {...register('full_name')}
            />

            <Input
              label="Institute Email"
              type="email"
              autoComplete="email"
              error={errors.institute_email?.message}
              required
              {...register('institute_email')}
            />

            <Input
              label="Roll Number"
              type="text"
              autoComplete="username"
              error={errors.roll_no?.message}
              required
              {...register('roll_no')}
            />

            <Input
              label="Phone (Optional)"
              type="tel"
              autoComplete="tel"
              error={errors.phone?.message}
              {...register('phone')}
            />

            <Input
              label="Programme (Optional)"
              type="text"
              error={errors.programme?.message}
              {...register('programme')}
            />

            <Input
              label="Password"
              type="password"
              autoComplete="new-password"
              error={errors.password?.message}
              required
              {...register('password')}
            />

            <Input
              label="Confirm Password"
              type="password"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              required
              {...register('confirmPassword')}
            />

            <Button type="submit" disabled={isSubmitting} className="w-full mt-6">
              {isSubmitting ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-text-muted">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
          
          <div className="mt-4 text-center text-xs text-text-muted">
            By signing up, you agree to our Terms of Service
          </div>
        </div>
      </div>
    </div>
  );
};
