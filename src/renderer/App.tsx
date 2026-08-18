import { useState } from 'react';
import { toast, Toaster } from 'sonner';

import { AppShell, type AppPage } from './components/layout/AppShell';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './components/ui';

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
          <Card>
            <CardHeader>
              <Badge variant="success">UI-Grundlage eingerichtet</Badge>
              <CardTitle>{currentPage.title}</CardTitle>
              <CardDescription>
                Dieser Bereich wird im nächsten Schritt mit den zugehörigen
                Komponenten und Funktionen aufgebaut.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              <Alert title="Komponentenbasis aktiv">
                Globale Oberflächen- und Feedback-Komponenten können jetzt
                einheitlich verwendet werden.
              </Alert>

              <Button
                onClick={() =>
                  toast.success('Visuelles Feedback funktioniert.')
                }
              >
                Benachrichtigung testen
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppShell>

      <Toaster position="bottom-right" theme="light" richColors closeButton />
    </>
  );
}
