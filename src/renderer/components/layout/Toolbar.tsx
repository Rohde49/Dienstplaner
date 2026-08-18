import type { HTMLAttributes, ReactNode } from 'react';

type ToolbarProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  children?: ReactNode;
  actions?: ReactNode;
  label?: string;
};

export function Toolbar({
  children,
  actions,
  label = 'Werkzeugleiste',
  className,
  ...props
}: ToolbarProps) {
  return (
    <div
      role="group"
      aria-label={label}
      className={[
        'border-app-border bg-app-surface flex min-h-14 flex-wrap items-center justify-between gap-3 rounded-lg border p-3 shadow-sm',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      <div className="flex flex-1 flex-wrap items-center gap-2">{children}</div>

      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
