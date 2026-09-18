import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  HardDrive,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';

import { Button } from '../ui';

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
  const [isWideWindow, setIsWideWindow] = useState(
    () => window.matchMedia('(min-width: 1280px)').matches,
  );
  const [manualExpansion, setManualExpansion] = useState<boolean | null>(null);
  const isExpanded = manualExpansion ?? isWideWindow;

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1280px)');
    const handleWidthChange = (event: MediaQueryListEvent): void => {
      setIsWideWindow(event.matches);
    };

    mediaQuery.addEventListener('change', handleWidthChange);
    return () => mediaQuery.removeEventListener('change', handleWidthChange);
  }, []);

  const toggleLabel = isExpanded
    ? 'Navigationsleiste einklappen'
    : 'Navigationsleiste ausklappen';

  return (
    <div
      className={`bg-app-background grid min-h-screen motion-safe:transition-[grid-template-columns] motion-safe:duration-150 ${
        isExpanded
          ? 'grid-cols-[15rem_minmax(0,1fr)]'
          : 'grid-cols-[4.5rem_minmax(0,1fr)]'
      }`}
    >
      <aside className="border-app-border bg-app-surface sticky top-0 flex h-screen flex-col self-start border-r">
        <div
          className={`border-app-border flex h-16 items-center gap-3 border-b ${
            isExpanded ? 'justify-start px-5' : 'justify-center px-3'
          }`}
        >
          <div className="bg-app-primary text-app-on-primary flex size-9 items-center justify-center rounded-lg">
            <CalendarDays aria-hidden="true" size={20} strokeWidth={1.8} />
          </div>

          <div className={isExpanded ? 'block' : 'hidden'}>
            <p className="text-app-text font-semibold">Dienstplaner</p>
            <p className="text-app-muted text-xs">Dienstplanung</p>
          </div>
        </div>

        <nav
          aria-label="Hauptnavigation"
          className={`flex min-h-0 flex-1 flex-col ${
            isExpanded ? 'p-3' : 'p-2'
          }`}
        >
          <ul className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;

              return (
                <li key={item.id}>
                  <button
                    type="button"
                    aria-current={isActive ? 'page' : undefined}
                    title={item.label}
                    className={`flex w-full items-center gap-3 rounded-md py-2.5 text-sm font-medium transition-colors ${
                      isExpanded
                        ? 'justify-start px-3 text-left'
                        : 'justify-center px-2'
                    } ${
                      isActive
                        ? 'bg-app-primary-selected text-app-primary-foreground'
                        : 'text-app-muted hover:text-app-text hover:bg-app-surface-hover'
                    }`}
                    onClick={() => onNavigate(item.id)}
                  >
                    <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
                    <span className={isExpanded ? '' : 'sr-only'}>
                      {item.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-auto pt-4">
            <Button
              variant="ghost"
              size={isExpanded ? 'md' : 'icon'}
              className={isExpanded ? 'w-full justify-start px-3' : 'mx-auto'}
              aria-label={toggleLabel}
              title={toggleLabel}
              aria-expanded={isExpanded}
              onClick={() => setManualExpansion(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronLeft aria-hidden="true" size={18} />
              ) : (
                <ChevronRight aria-hidden="true" size={18} />
              )}
              {isExpanded ? <span>Navigation einklappen</span> : null}
            </Button>
          </div>
        </nav>

        <div
          className={`border-app-border border-t ${isExpanded ? 'p-4' : 'p-3'}`}
        >
          <div
            className={`text-app-muted flex gap-2 ${
              isExpanded
                ? 'items-center justify-start'
                : 'items-center justify-center'
            }`}
          >
            <span className="border-app-primary-border bg-app-primary-subtle text-app-primary-foreground flex size-7 shrink-0 items-center justify-center rounded-md border">
              <HardDrive aria-hidden="true" size={14} />
            </span>
            {isExpanded ? (
              <div className="min-w-0">
                <p className="text-xs leading-4">Lokale Desktop-Anwendung</p>
                <p className="text-app-text-disabled mt-0.5 text-[9px] leading-3 font-normal whitespace-nowrap italic">
                  Designed &amp; Developed by Rohde · 2026
                </p>
              </div>
            ) : (
              <span className="sr-only">Lokale Desktop-Anwendung</span>
            )}
          </div>
        </div>
      </aside>

      <main className="min-w-0">{children}</main>
    </div>
  );
}
