import React from 'react';
import { cn } from '../../utils/cn';

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100/50 dark:border-slate-800 p-6', className)}
      {...props}
    />
  )
);
Card.displayName = 'Card';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { label?: string, error?: string }>(
  ({ className, label, error, ...props }, ref) => (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>}
      <input
        ref={ref}
        className={cn(
          'w-full rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 px-4 py-3 text-slate-900 dark:text-slate-100 transition-colors focus:border-purple-500 dark:focus:border-purple-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-0',
          error && 'border-red-300 dark:border-red-500/50 focus:border-red-500 dark:focus:border-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm text-red-500 dark:text-red-400">{error}</p>}
    </div>
  )
);
Input.displayName = 'Input';

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string, error?: string }>(
  ({ className, label, error, children, ...props }, ref) => (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>}
      <select
        ref={ref}
        className={cn(
          'w-full rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 px-4 py-3 text-slate-900 dark:text-slate-100 transition-colors focus:border-purple-500 dark:focus:border-purple-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-0 appearance-none',
          error && 'border-red-300 dark:border-red-500/50 focus:border-red-500 dark:focus:border-red-500',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1.5 text-sm text-red-500 dark:text-red-400">{error}</p>}
    </div>
  )
);
Select.displayName = 'Select';
