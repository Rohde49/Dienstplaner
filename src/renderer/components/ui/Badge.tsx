import type { HTMLAttributes } from 'react';

type BadgeVariant = 'neutral' | 'primary' | 'success' | 'warning' | 'danger';

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const variantClasses: Record<BadgeVariant, string> = {
  neutral: 'border-app-border bg-app-surface-hover text-app-muted',
  primary:
    'border-app-primary-border bg-app-primary-subtle text-app-primary-foreground',
  success: 'border-app-success-border bg-app-success-subtle text-app-success',
  warning: 'border-app-warning-border bg-app-warning-subtle text-app-warning',
  danger: 'border-app-danger-border bg-app-danger-subtle text-app-danger',
};

/** Zeigt eine kurze Information als farbige Markierung an. */
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
