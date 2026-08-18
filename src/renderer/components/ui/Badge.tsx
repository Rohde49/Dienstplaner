import type { HTMLAttributes } from 'react';

type BadgeVariant = 'neutral' | 'primary' | 'success' | 'warning' | 'danger';

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const variantClasses: Record<BadgeVariant, string> = {
  neutral: 'border-slate-200 bg-slate-100 text-slate-700',
  primary: 'border-blue-200 bg-app-primary-subtle text-blue-700',
  success: 'border-emerald-200 bg-app-success-subtle text-app-success',
  warning: 'border-amber-200 bg-app-warning-subtle text-app-warning',
  danger: 'border-red-200 bg-app-danger-subtle text-app-danger',
};

export function Badge({
  className,
  variant = 'neutral',
  ...props
}: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  );
}
