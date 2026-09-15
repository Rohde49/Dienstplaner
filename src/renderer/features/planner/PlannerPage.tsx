import {
  CalendarDays,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Save,
  Users,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import type { MonthlyPlan } from '../../../shared/schemas';
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
  beginPlannerSave,
  completePlannerTeamLoad,
  completePlannerSave,
  createInitialPlannerPageState,
  discardPlannerChanges,
  failPlannerTeamLoad,
  failPlannerSave,
  getAdjacentPlannerPeriod,
  getPlannerYearOptions,
  hasUnsavedPlannerChanges,
  openPlannerPlan,
  replacePlannerDraft,
  returnToPlannerPreview,
  selectPlannerPeriod,
} from './plannerState';
import { CreateMonthlyPlanDialog } from './CreateMonthlyPlanDialog';
import { LoadMonthlyPlanDialog } from './LoadMonthlyPlanDialog';
import { PlanningTable } from './PlanningTable';
import { EditPlanTitleDialog } from './EditPlanTitleDialog';
import { setDraftPlanTitle } from './plannerDraft';
import { UnsavedChangesDialog } from './UnsavedChangesDialog';

export type PlannerProtectionHandler = (action: () => void) => void;

type PlannerPageProps = {
  onNavigate: (page: AppPage) => void;
  onRegisterProtection: (handler: PlannerProtectionHandler | null) => void;
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Die Vorschau konnte nicht geladen werden.';
}

/** Zeigt die Monatsauswahl und den noch nicht gespeicherten Vorschauzustand. */
export function PlannerPage({
  onNavigate,
  onRegisterProtection,
}: PlannerPageProps) {
  const [state, setState] = useState(() =>
    createInitialPlannerPageState(new Date()),
  );
  const [protectionDialogOpen, setProtectionDialogOpen] = useState(false);
  const pendingActionRef = useRef<(() => void) | null>(null);
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

  const requestProtectedAction = useCallback<PlannerProtectionHandler>(
    (action) => {
      if (state.save.status === 'saving') {
        return;
      }

      if (hasUnsavedPlannerChanges(state)) {
        pendingActionRef.current = action;
        setProtectionDialogOpen(true);
        return;
      }

      action();
    },
    [state],
  );

  useEffect(() => {
    onRegisterProtection(requestProtectedAction);
    return () => onRegisterProtection(null);
  }, [onRegisterProtection, requestProtectedAction]);

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
  const hasUnsavedChanges = hasUnsavedPlannerChanges(state);
  const isSaving = state.save.status === 'saving';
  const currentPlanId =
    state.document.kind === 'plan' ? state.document.baseline.id : null;
  const canDeleteCurrentPlan =
    state.document.kind !== 'plan' || (!hasUnsavedChanges && !isSaving);
  const canCreatePlan =
    state.load.status === 'ready' &&
    state.team.some((employee) => employee.active) &&
    !isSaving;

  const savePlan = useCallback(async (draft: MonthlyPlan): Promise<boolean> => {
    setState(beginPlannerSave);

    try {
      const savedPlan = await window.dienstplaner.monthlyPlans.save(draft);
      setState((currentState) => completePlannerSave(currentState, savedPlan));
      toast.success(`${savedPlan.title} wurde gespeichert.`);
      return true;
    } catch (error) {
      setState((currentState) =>
        failPlannerSave(
          currentState,
          error instanceof Error
            ? error.message
            : 'Der Dienstplan konnte nicht gespeichert werden.',
        ),
      );
      return false;
    }
  }, []);

  function changeMonth(monthOffset: -1 | 1): void {
    const period = getAdjacentPlannerPeriod(
      state.period,
      monthOffset,
      yearOptions,
    );

    if (period) {
      requestProtectedAction(() =>
        setState((currentState) => selectPlannerPeriod(currentState, period)),
      );
    }
  }

  function continuePendingAction(): void {
    const action = pendingActionRef.current;
    pendingActionRef.current = null;
    setProtectionDialogOpen(false);
    action?.();
  }

  async function saveAndContinue(): Promise<void> {
    if (activePlan && (await savePlan(activePlan))) {
      continuePendingAction();
    }
  }

  function discardAndContinue(): void {
    setState(discardPlannerChanges);
    continuePendingAction();
  }

  function cancelPendingAction(): void {
    pendingActionRef.current = null;
    setProtectionDialogOpen(false);
  }

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

  return (
    <>
      <PageHeader
        title="Dienstplan"
        description="Monatspläne erstellen, bearbeiten und auswerten"
        actions={
          activePlan ? (
            <Button
              disabled={!hasUnsavedChanges || isSaving}
              onClick={() => void savePlan(activePlan)}
            >
              {isSaving ? (
                <>
                  <Spinner
                    size="sm"
                    label="Dienstplan wird gespeichert"
                    className="text-app-on-primary"
                  />
                  Wird gespeichert …
                </>
              ) : (
                <>
                  <Save aria-hidden="true" size={17} />
                  Speichern
                </>
              )}
            </Button>
          ) : null
        }
      />

      <div className="space-y-4 p-6 lg:p-8">
        <Toolbar
          label="Zeitraum und Dienstpläne"
          actions={
            <>
              <LoadMonthlyPlanDialog
                currentPlanId={currentPlanId}
                canDeleteCurrentPlan={canDeleteCurrentPlan}
                trigger={
                  <Button variant="secondary" disabled={isSaving}>
                    <FolderOpen aria-hidden="true" size={17} />
                    Laden
                  </Button>
                }
                onLoaded={(result, closeDialog) => {
                  if (result.plan) {
                    const plan = result.plan;
                    requestProtectedAction(() => {
                      setState((currentState) =>
                        openPlannerPlan(
                          currentState,
                          plan,
                          result.recoveryWarning !== null,
                        ),
                      );
                      closeDialog();
                    });
                  }
                }}
                onDeleted={handleDeletedPlan}
              />

              <CreateMonthlyPlanDialog
                period={state.period}
                trigger={
                  <Button
                    disabled={!canCreatePlan}
                    title={
                      canCreatePlan
                        ? undefined
                        : isSaving
                          ? 'Der Dienstplan wird gerade gespeichert.'
                          : state.load.status === 'loading'
                            ? 'Die Mitarbeiterdaten werden noch geladen.'
                            : state.load.status === 'error'
                              ? 'Die Mitarbeiterdaten konnten nicht geladen werden.'
                              : 'Für einen neuen Dienstplan ist mindestens ein aktiver Mitarbeiter erforderlich.'
                    }
                  >
                    <CalendarPlus aria-hidden="true" size={17} />
                    Dienstplan erstellen
                  </Button>
                }
                onRequestOpen={requestProtectedAction}
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
            disabled={!previousPeriod || isSaving}
            onClick={() => changeMonth(-1)}
          >
            <ChevronLeft aria-hidden="true" size={17} />
          </IconButton>

          <Select
            aria-label="Monat"
            className="w-36"
            value={state.period.month}
            disabled={isSaving}
            onChange={(event) => {
              const month = Number(event.target.value);
              requestProtectedAction(() =>
                setState((currentState) =>
                  selectPlannerPeriod(currentState, {
                    ...currentState.period,
                    month,
                  }),
                ),
              );
            }}
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
            disabled={isSaving}
            onChange={(event) => {
              const year = Number(event.target.value);
              requestProtectedAction(() =>
                setState((currentState) =>
                  selectPlannerPeriod(currentState, {
                    ...currentState.period,
                    year,
                  }),
                ),
              );
            }}
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
            disabled={!nextPeriod || isSaving}
            onClick={() => changeMonth(1)}
          >
            <ChevronRight aria-hidden="true" size={17} />
          </IconButton>
        </Toolbar>

        {state.save.status === 'error' ? (
          <Alert title="Speichern fehlgeschlagen" variant="danger">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span>{state.save.errorMessage}</span>
              {activePlan ? (
                <Button
                  variant="secondary"
                  onClick={() => void savePlan(activePlan)}
                >
                  Erneut versuchen
                </Button>
              ) : null}
            </div>
          </Alert>
        ) : null}

        {activePlan ? (
          <Card>
            <CardHeader>
              <Badge
                variant={
                  state.document.kind === 'plan' &&
                  state.document.recoveredFromBackup
                    ? 'warning'
                    : hasUnsavedChanges
                      ? 'warning'
                      : 'success'
                }
              >
                {state.document.kind === 'plan' &&
                state.document.recoveredFromBackup
                  ? 'Aus Sicherung geladen · Speichern erforderlich'
                  : hasUnsavedChanges
                    ? 'Ungespeicherte Änderungen'
                    : 'Gespeichert'}
              </Badge>
              <div className="flex items-center gap-2">
                <CardTitle>{activePlan.title}</CardTitle>
                <EditPlanTitleDialog
                  plan={activePlan}
                  disabled={isSaving}
                  onApply={(title) =>
                    setState((currentState) =>
                      replacePlannerDraft(
                        currentState,
                        setDraftPlanTitle(activePlan, title),
                      ),
                    )
                  }
                />
              </div>
              <CardDescription>
                {PLANNER_MONTHS[activePlan.month - 1]} {activePlan.year} ·{' '}
                {activePlan.employees.length} Mitarbeiter ·{' '}
                {activePlan.days.length} Kalendertage
              </CardDescription>
            </CardHeader>

            <CardContent>
              {state.document.kind === 'plan' &&
              state.document.recoveredFromBackup ? (
                <Alert
                  title="Aus Sicherung geladen · Speichern erforderlich"
                  variant="warning"
                >
                  Der wiederhergestellte Stand muss ausdrücklich gespeichert
                  werden, bevor er als regulärer Ausgangsstand gilt.
                </Alert>
              ) : (
                <Alert title="Dienstplan geöffnet">
                  Der gespeicherte Plan wurde über seine eindeutige Plan-ID
                  geladen. Mitarbeiter- und Kalenderstand stammen ausschließlich
                  aus diesem Plan.
                </Alert>
              )}
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

        {activePlan ||
        (state.load.status === 'ready' &&
          preview &&
          preview.employees.length > 0) ? (
          <PlanningTable
            document={state.document}
            onDraftChange={
              isSaving
                ? undefined
                : (draft) =>
                    setState((currentState) =>
                      replacePlannerDraft(currentState, draft),
                    )
            }
          />
        ) : null}
      </div>

      <UnsavedChangesDialog
        open={protectionDialogOpen}
        isSaving={isSaving}
        errorMessage={state.save.errorMessage}
        onSaveAndContinue={() => void saveAndContinue()}
        onDiscard={discardAndContinue}
        onCancel={cancelPendingAction}
      />
    </>
  );
}
