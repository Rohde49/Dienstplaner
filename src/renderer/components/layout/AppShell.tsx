import {
  CalendarDays,
  ClipboardList,
  HardDrive,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';

export type AppPage = 'planner' | 'team' | 'entry-types';

type AppShellProps = {
  activePage: AppPage;
  children: ReactNode;
  onNavigate: (page: AppPage) => void;
};

type NavigationItem = {
  id: AppPage;
  label: string;
  icon: LucideIcon;
};

const navigationItems: NavigationItem[] = [
  {
    id: 'planner',
    label: 'Dienstplan',
    icon: CalendarDays,
  },
  {
    id: 'team',
    label: 'Team',
    icon: Users,
  },
  {
    id: 'entry-types',
    label: 'Planungseinträge',
    icon: ClipboardList,
  },
];

/** Zeigt den festen Seitenrahmen mit Navigation und aktuellem Seiteninhalt. */
export function AppShell({ activePage, children, onNavigate }: AppShellProps) {
  return (
    <div className="bg-app-background grid min-h-screen grid-cols-[14rem_minmax(0,1fr)] xl:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="border-app-border bg-app-surface flex min-h-screen flex-col border-r">
        <div className="border-app-border flex h-16 items-center gap-3 border-b px-5">
          <div className="bg-app-primary flex size-9 items-center justify-center rounded-lg text-white">
            <CalendarDays aria-hidden="true" size={20} strokeWidth={1.8} />
          </div>

          <div>
            <p className="text-app-text font-semibold">Dienstplaner</p>
            <p className="text-app-muted text-xs">Dienstplanung</p>
          </div>
        </div>

        <nav aria-label="Hauptnavigation" className="flex-1 p-3">
          <ul className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;

              return (
                <li key={item.id}>
                  <button
                    type="button"
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-app-primary-subtle text-app-primary'
                        : 'text-app-muted hover:text-app-text hover:bg-slate-100'
                    }`}
                    onClick={() => onNavigate(item.id)}
                  >
                    <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-app-border border-t p-4">
          <div className="text-app-muted flex items-center gap-2 text-xs">
            <HardDrive aria-hidden="true" size={15} />
            <span>Lokale Desktop-Anwendung</span>
          </div>
        </div>
      </aside>

      <main className="min-w-0">{children}</main>
    </div>
  );
}
