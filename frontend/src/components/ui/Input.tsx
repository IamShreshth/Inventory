import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, required, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-semibold text-text">
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'px-4 py-2.5 text-base border-2 border-border rounded-lg bg-background text-text',
            'placeholder:text-text-muted',
            'focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface',
            'transition-all duration-200',
            error && 'border-error focus:border-error focus:ring-error/10',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          required={required}
          {...props}
        />
        {error && (
          <span id={`${inputId}-error`} className="text-sm text-error font-medium animate-slide-down" role="alert">
            {error}
          </span>
        )}
        {helperText && !error && (
          <span id={`${inputId}-helper`} className="text-sm text-text-muted">
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
