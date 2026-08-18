import type { ReactNode } from 'react';

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className="border-app-border bg-app-surface flex min-h-20 items-start justify-between gap-6 border-b px-6 py-5 lg:px-8">
      <div className="min-w-0">
        <h1 className="text-app-text text-2xl font-semibold tracking-tight">
          {title}
        </h1>

        {description ? (
          <p className="text-app-muted mt-1 text-sm">{description}</p>
        ) : null}
      </div>

      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      ) : null}
    </header>
  );
}
