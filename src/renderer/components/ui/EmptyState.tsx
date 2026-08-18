import { Inbox, type LucideIcon } from 'lucide-react';
import type { HTMLAttributes, ReactNode } from 'react';

type EmptyStateProps = HTMLAttributes<HTMLDivElement> & {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: LucideIcon;
};

export function EmptyState({
  title,
  description,
  action,
  icon: Icon = Inbox,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={[
        'flex flex-col items-center justify-center px-6 py-10 text-center',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      <div className="text-app-muted flex size-10 items-center justify-center rounded-lg bg-slate-100">
        <Icon aria-hidden="true" size={20} />
      </div>

      <h3 className="text-app-text mt-4 text-sm font-semibold">{title}</h3>

      <p className="text-app-muted mt-1 max-w-md text-sm leading-6">
        {description}
      </p>

      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
