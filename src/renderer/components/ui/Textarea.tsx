import { forwardRef, type TextareaHTMLAttributes } from 'react';

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

/** Zeigt ein einheitlich gestaltetes mehrzeiliges Eingabefeld an. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={[
          'border-app-border bg-app-surface text-app-text focus:border-app-primary disabled:text-app-text-disabled aria-invalid:border-app-danger placeholder:text-app-text-disabled hover:border-app-border-strong disabled:bg-app-surface-disabled min-h-24 w-full resize-y rounded-md border px-3 py-2 text-sm transition-colors disabled:cursor-not-allowed',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      />
    );
  },
);
