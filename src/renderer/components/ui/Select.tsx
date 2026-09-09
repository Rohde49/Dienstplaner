import { forwardRef, type SelectHTMLAttributes } from 'react';

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

/** Zeigt ein einheitlich gestaltetes Auswahlfeld an. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ className, ...props }, ref) {
    return (
      <select
        ref={ref}
        className={[
          'border-app-border bg-app-surface text-app-text focus:border-app-primary disabled:text-app-text-disabled aria-invalid:border-app-danger hover:border-app-border-strong disabled:bg-app-surface-disabled h-9 w-full rounded-md border px-3 text-sm transition-colors disabled:cursor-not-allowed',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      />
    );
  },
);
