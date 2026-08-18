import {
  CircleCheck,
  CircleX,
  Info,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react';
import type { HTMLAttributes } from 'react';

type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

type AlertProps = HTMLAttributes<HTMLDivElement> & {
  title: string;
  variant?: AlertVariant;
};

type AlertConfiguration = {
  icon: LucideIcon;
  classes: string;
};

const variantConfiguration: Record<AlertVariant, AlertConfiguration> = {
  info: {
    icon: Info,
    classes: 'border-blue-200 bg-blue-50 text-blue-800',
  },
  success: {
    icon: CircleCheck,
    classes: 'border-emerald-200 bg-app-success-subtle text-app-success',
  },
  warning: {
    icon: TriangleAlert,
    classes: 'border-amber-200 bg-app-warning-subtle text-app-warning',
  },
  danger: {
    icon: CircleX,
    classes: 'border-red-200 bg-app-danger-subtle text-app-danger',
  },
};

export function Alert({
  title,
  children,
  className,
  variant = 'info',
  ...props
}: AlertProps) {
  const configuration = variantConfiguration[variant];
  const Icon = configuration.icon;

  return (
    <div
      role={variant === 'danger' ? 'alert' : 'status'}
      className={[
        'flex gap-3 rounded-md border p-4',
        configuration.classes,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      <Icon aria-hidden="true" className="mt-0.5 shrink-0" size={18} />

      <div>
        <p className="text-sm font-semibold">{title}</p>

        {children ? (
          <div className="mt-1 text-sm leading-5">{children}</div>
        ) : null}
      </div>
    </div>
  );
}
