import { LoaderCircle } from 'lucide-react';
import type { HTMLAttributes } from 'react';

type SpinnerSize = 'sm' | 'md' | 'lg';

type SpinnerProps = HTMLAttributes<HTMLSpanElement> & {
  label?: string;
  size?: SpinnerSize;
};

const sizeClasses: Record<SpinnerSize, string> = {
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-7',
};

/** Zeigt einen zugänglichen Ladeindikator an. */
export function Spinner({
  className,
  label = 'Wird geladen',
  size = 'md',
  ...props
}: SpinnerProps) {
  return (
    <span
      role="status"
      className={['text-app-primary inline-flex', className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      <LoaderCircle
        aria-hidden="true"
        className={`animate-spin ${sizeClasses[size]}`}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}
