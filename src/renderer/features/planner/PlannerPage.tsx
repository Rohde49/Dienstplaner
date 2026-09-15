import {
  CalendarDays,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Users,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { PageHeader, Toolbar, type AppPage } from '../../components/layout';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  IconButton,
  Select,
  Spinner,
} from '../../components/ui';
import {
  PLANNER_MONTHS,
  beginPlannerTeamLoad,
  completePlannerTeamLoad,
  createInitialPlannerPageState,
  failPlannerTeamLoad,
  getAdjacentPlannerPeriod,
  getPlannerYearOptions,
  openPlannerPlan,
  returnToPlannerPreview,
  selectPlannerPeriod,
} from './plannerState';
import { CreateMonthlyPlanDialog } from './CreateMonthlyPlanDialog';
import { LoadMonthlyPlanDialog } from './LoadMonthlyPlanDialog';

type PlannerPageProps = {
  onNavigate: (page: AppPage) => void;
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Die Vorschau konnte nicht geladen werden.';
}

/** Zeigt die Monatsauswahl und den noch nicht gespeicherten Vorschauzustand. */
export function PlannerPage({ onNavigate }: PlannerPageProps) {
  const [state, setState] = useState(() =>
    createInitialPlannerPageState(new Date()),
  );
  const referenceYear = useMemo(() => new Date().getFullYear(), []);
  const yearOptions = useMemo(
    () => getPlannerYearOptions(referenceYear, state.period.year),
    [referenceYear, state.period.year],
  );

  const loadTeam = useCallback(async (): Promise<void> => {
    setState(beginPlannerTeamLoad);

    try {
      const team = await window.dienstplaner.employees.list();
      setState((currentState) => completePlannerTeamLoad(currentState, team));
    } catch (error) {
      setState((currentState) =>
        failPlannerTeamLoad(currentState, getErrorMessage(error)),
      );
    }
  }, []);

  useEffect(() => {
    void loadTeam();
  }, [loadTeam]);

  const previousPeriod = getAdjacentPlannerPeriod(
    state.period,
    -1,
    yearOptions,
  );
  const nextPeriod = getAdjacentPlannerPeriod(state.period, 1, yearOptions);
  const preview =
    state.document.kind === 'preview' ? state.document.preview : null;
  const activePlan =
    state.document.kind === 'plan' ? state.document.draft : null;
  const currentPlanId = activePlan?.id ?? null;
  const canCreatePlan =
    state.load.status === 'ready' &&
    state.team.some((employee) => employee.active);

  function handleDeletedPlan(planId: string): void {
    setState((currentState) => {
      if (
        currentState.document.kind === 'plan' &&
        currentState.document.baseline.id === planId
      ) {
        return returnToPlannerPreview(currentState);
      }

      return currentState;
    });
  }

  function changeMonth(monthOffset: -1 | 1): void {
    const period = getAdjacentPlannerPeriod(
      state.period,
      monthOffset,
      yearOptions,
    );

    if (period) {
      setState((currentState) => selectPlannerPeriod(currentState, period));
    }
  }

  return (
    <>
      <PageHeader
        title="Dienstplan"
        description="Monatspläne erstellen, bearbeiten und auswerten"
      />

      <div className="space-y-4 p-6 lg:p-8">
        <Toolbar
          label="Zeitraum und Dienstpläne"
          actions={
            <>
              <LoadMonthlyPlanDialog
                currentPlanId={currentPlanId}
                canDeleteCurrentPlan
                trigger={
                  <Button variant="secondary">
                    <FolderOpen aria-hidden="true" size={17} />
                    Laden
                  </Button>
                }
                onLoaded={(result, closeDialog) => {
                  if (result.plan) {
                    setState((currentState) =>
                      openPlannerPlan(
                        currentState,
                        result.plan!,
                        result.recoveryWarning !== null,
                      ),
                    );
                    closeDialog();
                  }
                }}
                onDeleted={handleDeletedPlan}
              />

              <CreateMonthlyPlanDialog
                period={state.period}
                trigger={
                  <Button disabled={!canCreatePlan}>
                    <CalendarPlus aria-hidden="true" size={17} />
                    Dienstplan erstellen
                  </Button>
                }
                onRequestOpen={(openDialog) => openDialog()}
                onCreated={(plan) =>
                  setState((currentState) =>
                    openPlannerPlan(currentState, plan, false),
                  )
                }
              />
            </>
          }
        >
          <IconButton
            label="Vorheriger Monat"
            variant="secondary"
            disabled={!previousPeriod}
            onClick={() => changeMonth(-1)}
          >
            <ChevronLeft aria-hidden="true" size={17} />
          </IconButton>

          <Select
            aria-label="Monat"
            className="w-36"
            value={state.period.month}
            onChange={(event) =>
              setState((currentState) =>
                selectPlannerPeriod(currentState, {
                  ...currentState.period,
                  month: Number(event.target.value),
                }),
              )
            }
          >
            {PLANNER_MONTHS.map((monthName, index) => (
              <option key={monthName} value={index + 1}>
                {monthName}
              </option>
            ))}
          </Select>

          <Select
            aria-label="Jahr"
            className="w-28"
            value={state.period.year}
            onChange={(event) =>
              setState((currentState) =>
                selectPlannerPeriod(currentState, {
                  ...currentState.period,
                  year: Number(event.target.value),
                }),
              )
            }
          >
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </Select>

          <IconButton
            label="Nächster Monat"
            variant="secondary"
            disabled={!nextPeriod}
            onClick={() => changeMonth(1)}
          >
            <ChevronRight aria-hidden="true" size={17} />
          </IconButton>
        </Toolbar>

        {activePlan ? (
          <Card>
            <CardHeader>
              <Badge
                variant={
                  state.document.kind === 'plan' &&
                  state.document.recoveredFromBackup
                    ? 'warning'
                    : 'success'
                }
              >
                {state.document.kind === 'plan' &&
                state.document.recoveredFromBackup
                  ? 'Aus Sicherung geladen · Speichern erforderlich'
                  : 'Gespeichert'}
              </Badge>
              <CardTitle>{activePlan.title}</CardTitle>
              <CardDescription>
                {PLANNER_MONTHS[activePlan.month - 1]} {activePlan.year} ·{' '}
                {activePlan.employees.length} Mitarbeiter ·{' '}
                {activePlan.days.length} Kalendertage
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Alert
                title={
                  state.document.kind === 'plan' &&
                  state.document.recoveredFromBackup
                    ? 'Aus Sicherung geladen · Speichern erforderlich'
                    : 'Dienstplan geöffnet'
                }
                variant={
                  state.document.kind === 'plan' &&
                  state.document.recoveredFromBackup
                    ? 'warning'
                    : 'info'
                }
              >
                Mitarbeiter- und Kalenderstand stammen ausschließlich aus dem
                gespeicherten Plan.
              </Alert>
            </CardContent>
          </Card>
        ) : state.load.status === 'loading' ? (
          <Card>
            <div className="flex min-h-56 items-center justify-center gap-3">
              <Spinner label="Vorschau wird geladen" />
              <span className="text-app-muted text-sm">
                Vorschau wird geladen …
              </span>
            </div>
          </Card>
        ) : state.load.status === 'error' ? (
          <Card>
            <div className="space-y-4 p-6">
              <Alert
                title="Vorschau konnte nicht geladen werden"
                variant="danger"
              >
                {state.load.errorMessage}
              </Alert>

              <Button variant="secondary" onClick={() => void loadTeam()}>
                Erneut laden
              </Button>
            </div>
          </Card>
        ) : preview ? (
          <Card>
            <CardHeader>
              <Badge variant="warning">Vorschau · nicht angelegt</Badge>
              <CardTitle>
                {PLANNER_MONTHS[preview.period.month - 1]} {preview.period.year}
              </CardTitle>
              <CardDescription>
                Diese Vorschau verwendet den aktuellen Teamstand und ist noch
                nicht bearbeitbar oder gespeichert.
              </CardDescription>
            </CardHeader>

            <CardContent>
              {preview.employees.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="Keine aktiven Mitarbeiter vorhanden"
                  description="Aktiviere oder ergänze mindestens einen Mitarbeiter, bevor ein Dienstplan angelegt werden kann."
                  action={
                    <Button onClick={() => onNavigate('team')}>
                      <Users aria-hidden="true" size={17} />
                      Zur Teamverwaltung
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-5">
                  <Alert title="Noch kein Dienstplan angelegt">
                    Ein Wechsel des Zeitraums zeigt immer eine neue Vorschau und
                    lädt keinen gespeicherten Plan automatisch.
                  </Alert>

                  <dl className="grid gap-3 sm:grid-cols-3">
                    <div className="border-app-border bg-app-surface-muted rounded-md border p-4">
                      <dt className="text-app-muted text-xs font-medium">
                        Kalendertage
                      </dt>
                      <dd className="text-app-text mt-1 text-xl font-semibold tabular-nums">
                        {preview.calendarDays.length}
                      </dd>
                    </div>
                    <div className="border-app-border bg-app-surface-muted rounded-md border p-4">
                      <dt className="text-app-muted text-xs font-medium">
                        Arbeitstage
                      </dt>
                      <dd className="text-app-text mt-1 text-xl font-semibold tabular-nums">
                        {preview.workingDayCount}
                      </dd>
                    </div>
                    <div className="border-app-border bg-app-surface-muted rounded-md border p-4">
                      <dt className="text-app-muted text-xs font-medium">
                        Aktive Mitarbeiter
                      </dt>
                      <dd className="text-app-text mt-1 text-xl font-semibold tabular-nums">
                        {preview.employees.length}
                      </dd>
                    </div>
                  </dl>

                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <CalendarDays
                        aria-hidden="true"
                        className="text-app-muted"
                        size={17}
                      />
                      <h2 className="text-app-text text-sm font-semibold">
                        Team in der Vorschau
                      </h2>
                    </div>
                    <ul className="flex flex-wrap gap-2">
                      {preview.employees.map((employee) => (
                        <li key={employee.id}>
                          <Badge>
                            {employee.firstName} {employee.lastName}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </>
  );
}
