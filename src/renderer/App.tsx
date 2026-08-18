import { useState } from 'react';
import { Toaster } from 'sonner';

import { AppShell, type AppPage } from './components/layout/AppShell';

type PageInformation = {
  title: string;
  description: string;
};

const pageInformation: Record<AppPage, PageInformation> = {
  planner: {
    title: 'Dienstplan',
    description: 'Monatspläne erstellen, bearbeiten und auswerten.',
  },
  team: {
    title: 'Team',
    description: 'Mitarbeiter und ihre Planungsdaten verwalten.',
  },
  'entry-types': {
    title: 'Planungseinträge',
    description: 'Dienste, Abwesenheiten und weitere Eintragsarten verwalten.',
  },
};

export function App() {
  const [activePage, setActivePage] = useState<AppPage>('planner');
  const currentPage = pageInformation[activePage];

  return (
    <>
      <AppShell activePage={activePage} onNavigate={setActivePage}>
        <header className="border-app-border bg-app-surface border-b px-6 py-5 lg:px-8">
          <h1 className="text-app-text text-2xl font-semibold tracking-tight">
            {currentPage.title}
          </h1>

          <p className="text-app-muted mt-1 text-sm">
            {currentPage.description}
          </p>
        </header>

        <div className="p-6 lg:p-8">
          <section className="border-app-border bg-app-surface rounded-lg border p-6 shadow-sm">
            <p className="text-app-primary text-sm font-medium">
              UI-Grundlage eingerichtet
            </p>

            <h2 className="text-app-text mt-2 text-lg font-semibold">
              {currentPage.title}
            </h2>

            <p className="text-app-muted mt-2 max-w-2xl text-sm leading-6">
              Dieser Bereich wird im nächsten Schritt mit den zugehörigen
              Komponenten und Funktionen aufgebaut.
            </p>
          </section>
        </div>
      </AppShell>

      <Toaster position="bottom-right" theme="light" richColors closeButton />
    </>
  );
}
