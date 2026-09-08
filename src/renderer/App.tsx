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
import { TeamPage } from './features/team/TeamPage';

type PageInformation = {
  title: string;
  description: string;
};

const pageInformation: Record<Exclude<AppPage, 'team'>, PageInformation> = {
  planner: {
    title: 'Dienstplan',
    description: 'Monatspläne erstellen, bearbeiten und auswerten.',
  },
  'entry-types': {
    title: 'Planungseinträge',
    description: 'Dienste, Abwesenheiten und weitere Eintragsarten verwalten.',
  },
};

/** Zeigt für einen noch nicht umgesetzten Bereich eine Vorschauseite an. */
function PlaceholderPage({ title, description }: PageInformation) {
  return (
    <>
      <PageHeader title={title} description={description} />

      <div className="space-y-4 p-6 lg:p-8">
        <Toolbar
          actions={
            <Button
              onClick={() => toast.success('Visuelles Feedback funktioniert.')}
            >
              Feedback testen
            </Button>
          }
        >
          <span className="text-app-muted text-sm">Aktiver Bereich:</span>
          <Badge variant="primary">{title}</Badge>
        </Toolbar>

        <Card>
          <CardHeader>
            <Badge variant="success">UI-Grundlage eingerichtet</Badge>
            <CardTitle>{title}</CardTitle>
            <CardDescription>
              Dieser Bereich wird später mit den zugehörigen Komponenten und
              Funktionen aufgebaut.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Alert title="Komponentenbasis aktiv">
              Globale Oberflächen- und Feedback-Komponenten können einheitlich
              verwendet werden.
            </Alert>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

/** Steuert die Seitennavigation und zeigt den aktuell gewählten Bereich an. */
export function App() {
  const [activePage, setActivePage] = useState<AppPage>('planner');

  return (
    <>
      <AppShell activePage={activePage} onNavigate={setActivePage}>
        {activePage === 'team' ? (
          <TeamPage />
        ) : (
          <PlaceholderPage {...pageInformation[activePage]} />
        )}
      </AppShell>

      <Toaster position="bottom-right" theme="light" richColors closeButton />
    </>
  );
}
