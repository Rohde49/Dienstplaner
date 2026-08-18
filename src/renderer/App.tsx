import { useState } from 'react';
import { toast, Toaster } from 'sonner';

import {
  AppShell,
  PageHeader,
  Toolbar,
  type AppPage,
} from './components/layout';
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
        <PageHeader
          title={currentPage.title}
          description={currentPage.description}
        />

        <div className="space-y-4 p-6 lg:p-8">
          <Toolbar
            actions={
              <Button
                onClick={() =>
                  toast.success('Visuelles Feedback funktioniert.')
                }
              >
                Feedback testen
              </Button>
            }
          >
            <span className="text-app-muted text-sm">Aktiver Bereich:</span>
            <Badge variant="primary">{currentPage.title}</Badge>
          </Toolbar>

          <Card>
            <CardHeader>
              <Badge variant="success">UI-Grundlage eingerichtet</Badge>
              <CardTitle>{currentPage.title}</CardTitle>
              <CardDescription>
                Dieser Bereich wird im nächsten Schritt mit den zugehörigen
                Komponenten und Funktionen aufgebaut.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Alert title="Komponentenbasis aktiv">
                Globale Oberflächen- und Feedback-Komponenten können jetzt
                einheitlich verwendet werden.
              </Alert>
            </CardContent>
          </Card>
        </div>
      </AppShell>

      <Toaster position="bottom-right" theme="light" richColors closeButton />
    </>
  );
}
