import type { ReactNode } from 'react';

type FormFieldProps = {
  htmlFor: string;
  label: string;
  children: ReactNode;
  error?: string;
  hint?: string;
  required?: boolean;
};

/** Verbindet ein Formularfeld mit Beschriftung, Hinweis und Fehlermeldung. */
export function FormField({
  htmlFor,
  label,
  children,
  error,
  hint,
  required = false,
}: FormFieldProps) {
  const messageId = `${htmlFor}-${error ? 'error' : 'hint'}`;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="text-app-text block text-sm font-medium"
      >
        {label}
        {required ? (
          <span className="text-app-muted font-normal"> (Pflichtfeld)</span>
        ) : null}
      </label>

      {children}

      {error ? (
        <p id={messageId} role="alert" className="text-app-danger text-xs">
          {error}
        </p>
      ) : hint ? (
        <p id={messageId} className="text-app-muted text-xs">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
