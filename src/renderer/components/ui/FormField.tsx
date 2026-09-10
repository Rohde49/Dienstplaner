import { cloneElement, isValidElement, type ReactNode } from 'react';

type FormFieldProps = {
  htmlFor: string;
  label: string;
  labelAction?: ReactNode;
  children: ReactNode;
  error?: string;
  hint?: string;
};

type DescribedControlProps = {
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
};

/** Verbindet ein Formularfeld mit Beschriftung, Hinweis und Fehlermeldung. */
export function FormField({
  htmlFor,
  label,
  labelAction,
  children,
  error,
  hint,
}: FormFieldProps) {
  const messageId = `${htmlFor}-${error ? 'error' : 'hint'}`;
  const describedControl = isValidElement<DescribedControlProps>(children)
    ? cloneElement(children, {
        'aria-describedby':
          error || hint ? messageId : children.props['aria-describedby'],
        'aria-invalid': error ? true : children.props['aria-invalid'],
      })
    : children;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <label
          htmlFor={htmlFor}
          className="text-app-text block text-sm font-medium"
        >
          {label}
        </label>

        {labelAction}
      </div>

      {describedControl}

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
