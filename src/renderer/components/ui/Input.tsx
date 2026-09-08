import { forwardRef, type InputHTMLAttributes } from 'react';

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

/** Zeigt ein einheitlich gestaltetes einzeiliges Eingabefeld an. */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={[
        'border-app-border bg-app-surface text-app-text focus:border-app-primary disabled:text-app-text-disabled aria-invalid:border-app-danger placeholder:text-app-text-disabled hover:border-app-border-strong disabled:bg-app-surface-disabled h-9 w-full rounded-md border px-3 text-sm transition-colors disabled:cursor-not-allowed',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  );
});
