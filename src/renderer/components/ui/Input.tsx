import { forwardRef, type InputHTMLAttributes } from 'react';

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={[
        'border-app-border bg-app-surface text-app-text focus:border-app-primary disabled:text-app-muted aria-invalid:border-app-danger h-9 w-full rounded-md border px-3 text-sm transition-colors placeholder:text-slate-400 hover:border-slate-300 disabled:cursor-not-allowed disabled:bg-slate-100',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  );
});
