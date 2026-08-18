import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'icon';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-app-primary text-white hover:bg-app-primary-hover',
  secondary:
    'border border-app-border bg-app-surface text-app-text hover:bg-slate-50',
  danger: 'bg-app-danger text-white hover:bg-red-700',
  ghost: 'text-app-muted hover:bg-slate-100 hover:text-app-text',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-9 px-4 text-sm',
  icon: 'size-9 p-0',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { className, type = 'button', variant = 'primary', size = 'md', ...props },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        className={[
          'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50',
          variantClasses[variant],
          sizeClasses[size],
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      />
    );
  },
);

type IconButtonProps = Omit<ButtonProps, 'aria-label' | 'children' | 'size'> & {
  label: string;
  children: ReactNode;
};

export function IconButton({
  label,
  children,
  title,
  variant = 'ghost',
  ...props
}: IconButtonProps) {
  return (
    <Button
      aria-label={label}
      title={title ?? label}
      variant={variant}
      size="icon"
      {...props}
    >
      {children}
    </Button>
  );
}
