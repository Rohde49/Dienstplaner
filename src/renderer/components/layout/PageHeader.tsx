import type { ReactNode } from 'react';

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
};

/** Zeigt Titel, Beschreibung und mögliche Aktionen einer Seite an. */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className="border-app-border bg-app-surface flex min-h-20 flex-wrap items-center justify-between gap-x-6 gap-y-4 border-b px-6 py-5 lg:px-8">
      <div className="min-w-0">
        <h1 className="text-app-text text-2xl font-semibold tracking-tight">
          {title}
        </h1>

        {description ? (
          <p className="text-app-muted mt-1 text-sm">{description}</p>
        ) : null}
      </div>

      {actions ? (
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      ) : null}
    </header>
  );
}
