import { useState } from 'react';
import { Toaster } from 'sonner';

import { AppShell, type AppPage } from './components/layout';
import { PlannerPage } from './features/planner/PlannerPage';
import { TeamPage } from './features/team/TeamPage';
import { EntryTypesPage } from './features/entry-types/EntryTypesPage';

/** Steuert die Seitennavigation und zeigt den aktuell gewählten Bereich an. */
export function App() {
  const [activePage, setActivePage] = useState<AppPage>('planner');

  return (
    <>
      <AppShell activePage={activePage} onNavigate={setActivePage}>
        {activePage === 'team' ? (
          <TeamPage />
        ) : activePage === 'entry-types' ? (
          <EntryTypesPage />
        ) : (
          <PlannerPage onNavigate={setActivePage} />
        )}
      </AppShell>

      <Toaster position="bottom-right" theme="light" richColors closeButton />
    </>
  );
}
