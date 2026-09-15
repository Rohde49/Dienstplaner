import { useCallback, useEffect, useRef, useState } from 'react';
import { Toaster } from 'sonner';

import { AppShell, type AppPage } from './components/layout';
import {
  PlannerPage,
  type PlannerProtectionHandler,
} from './features/planner/PlannerPage';
import { TeamPage } from './features/team/TeamPage';
import { EntryTypesPage } from './features/entry-types/EntryTypesPage';

/** Steuert die Seitennavigation und zeigt den aktuell gewählten Bereich an. */
export function App() {
  const [activePage, setActivePage] = useState<AppPage>('planner');
  const plannerProtectionRef = useRef<PlannerProtectionHandler | null>(null);

  const registerPlannerProtection = useCallback(
    (handler: PlannerProtectionHandler | null): void => {
      plannerProtectionRef.current = handler;
    },
    [],
  );

  const requestNavigation = useCallback((page: AppPage): void => {
    const navigate = (): void => setActivePage(page);

    if (plannerProtectionRef.current) {
      plannerProtectionRef.current(navigate);
    } else {
      navigate();
    }
  }, []);

  useEffect(
    () =>
      window.dienstplaner.app.onCloseRequested(() => {
        const closeWindow = (): void => window.dienstplaner.app.confirmClose();

        if (plannerProtectionRef.current) {
          plannerProtectionRef.current(closeWindow);
        } else {
          closeWindow();
        }
      }),
    [],
  );

  return (
    <>
      <AppShell activePage={activePage} onNavigate={requestNavigation}>
        {activePage === 'team' ? (
          <TeamPage />
        ) : activePage === 'entry-types' ? (
          <EntryTypesPage />
        ) : (
          <PlannerPage
            onNavigate={requestNavigation}
            onRegisterProtection={registerPlannerProtection}
          />
        )}
      </AppShell>

      <Toaster position="bottom-right" theme="light" richColors closeButton />
    </>
  );
}
