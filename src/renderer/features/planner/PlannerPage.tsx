import {
  CalendarDays,
  CalendarPlus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Download,
  FolderOpen,
  Save,
  Users,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import type { MonthlyPlan } from '../../../shared/schemas';
import {
  calculateEmptyMonthlyPlanEvaluation,
  calculateMonthlyPlanEvaluation,
  calculateTargetFreeDayCount,
  countWorkingDays,
  getTargetCountStatus,
} from '../../../shared/calculations';
import { PageHeader, Toolbar, type AppPage } from '../../components/layout';
import {
  Alert,
  Badge,
  Button,
  Card,
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
  canUseCompactPlannerView,
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
  setPlannerViewMode,
} from './plannerState';
import { CreateMonthlyPlanDialog } from './CreateMonthlyPlanDialog';
import { LoadMonthlyPlanDialog } from './LoadMonthlyPlanDialog';
import { PlanningTable } from './PlanningTable';
import { EditPlanTitleDialog } from './EditPlanTitleDialog';
import { setDraftPlanTitle } from './plannerDraft';
import { UnsavedChangesDialog } from './UnsavedChangesDialog';
import { EvaluationDialog } from './EvaluationDialog';
import { CompactPlanPreview } from './CompactPlanPreview';
import type { CompactPlanFitStatus } from './compactPlanLayout';
import {
  getPdfExportActionTitle,
  getPdfExportErrorMessage,
  isPdfExportActionDisabled,
  isPdfExportActionVisible,
  needsSavedPlanExportConfirmation,
  type PlannerPdfExportStatus,
} from './plannerPdfExport';
import { SavedPlanExportDialog } from './SavedPlanExportDialog';

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

function getTargetCountTextClass(actual: number, target: number): string {
  const status = getTargetCountStatus(actual, target);

  if (status === 'below') {
    return 'text-app-signal-warning';
  }

  return status === 'above'
    ? 'text-app-signal-danger'
    : 'text-app-signal-success';
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
  const [toolbarExpanded, setToolbarExpanded] = useState(false);
  const [pdfFitStatus, setPdfFitStatus] =
    useState<CompactPlanFitStatus>('measuring');
  const [pdfExportStatus, setPdfExportStatus] =
    useState<PlannerPdfExportStatus>('idle');
  const [pdfExportErrorMessage, setPdfExportErrorMessage] = useState<
    string | null
  >(null);
  const [savedPlanExportDialogOpen, setSavedPlanExportDialogOpen] =
    useState(false);
  const pendingActionRef = useRef<(() => void) | null>(null);
  const isPdfExporting = pdfExportStatus === 'exporting';
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
      if (state.save.status === 'saving' || isPdfExporting) {
        return;
      }

      if (hasUnsavedPlannerChanges(state)) {
        pendingActionRef.current = action;
        setProtectionDialogOpen(true);
        return;
      }

      action();
    },
    [isPdfExporting, state],
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
  const savedPlan =
    state.document.kind === 'plan' ? state.document.baseline : null;
  const isCompactView = state.viewMode === 'compact' && savedPlan !== null;
  const displayedPlan = isCompactView ? savedPlan : activePlan;
  const toolbarTitle = displayedPlan
    ? displayedPlan.title
    : `${PLANNER_MONTHS[state.period.month - 1]} ${state.period.year}`;
  const hasUnsavedChanges = hasUnsavedPlannerChanges(state);
  const isSaving = state.save.status === 'saving';
  const isPlannerBusy = isSaving || isPdfExporting;
  const canUseCompactView = canUseCompactPlannerView(state);
  const currentPlanId =
    state.document.kind === 'plan' ? state.document.baseline.id : null;
  const canDeleteCurrentPlan =
    state.document.kind !== 'plan' || (!hasUnsavedChanges && !isPlannerBusy);
  const canCreatePlan =
    state.load.status === 'ready' &&
    state.team.some((employee) => employee.active) &&
    !isPlannerBusy;
  const calendarDayCount = activePlan
    ? activePlan.days.length
    : (preview?.calendarDays.length ?? 0);
  const workingDayCount = activePlan
    ? countWorkingDays(activePlan.year, activePlan.month)
    : (preview?.workingDayCount ?? 0);
  const targetFreeDayCount = calculateTargetFreeDayCount(
    calendarDayCount,
    workingDayCount,
  );
  const displayedEvaluation = useMemo(
    () =>
      displayedPlan
        ? calculateMonthlyPlanEvaluation(displayedPlan)
        : preview
          ? calculateEmptyMonthlyPlanEvaluation(
              preview.period.year,
              preview.period.month,
              preview.employees,
            )
          : null,
    [displayedPlan, preview],
  );
  const totalSnfServiceCount =
    displayedEvaluation?.totalEducatorSnfServiceCount ?? 0;

  useEffect(() => {
    if (!isCompactView) {
      setPdfFitStatus('measuring');
      setPdfExportErrorMessage(null);
      setSavedPlanExportDialogOpen(false);
    }
  }, [isCompactView]);

  useEffect(() => {
    setPdfFitStatus('measuring');
    setPdfExportErrorMessage(null);
    setSavedPlanExportDialogOpen(false);
  }, [savedPlan?.id, savedPlan?.updatedAt]);

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

  const exportSavedPlan = useCallback(async (): Promise<void> => {
    if (
      !savedPlan ||
      pdfFitStatus !== 'fits' ||
      pdfExportStatus === 'exporting'
    ) {
      return;
    }

    setPdfExportErrorMessage(null);
    setPdfExportStatus('exporting');

    try {
      const result = await window.dienstplaner.pdfExport.export({
        year: savedPlan.year,
        month: savedPlan.month,
        title: savedPlan.title,
      });

      if (result.status === 'saved') {
        toast.success('PDF wurde gespeichert.');
      }
    } catch (error) {
      setPdfExportErrorMessage(getPdfExportErrorMessage(error));
    } finally {
      setPdfExportStatus('idle');
    }
  }, [pdfExportStatus, pdfFitStatus, savedPlan]);

  function requestPdfExport(): void {
    if (needsSavedPlanExportConfirmation(hasUnsavedChanges)) {
      setSavedPlanExportDialogOpen(true);
      return;
    }

    void exportSavedPlan();
  }

  function confirmSavedPlanExport(): void {
    setSavedPlanExportDialogOpen(false);
    void exportSavedPlan();
  }

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
        description="Monatspläne erstellen und bearbeiten"
        actions={
          <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
            <div
              role="group"
              aria-label="Zeitraum wählen"
              className="flex items-end gap-2"
            >
              <IconButton
                label="Vorheriger Monat"
                variant="secondary"
                disabled={!previousPeriod || isPlannerBusy}
                onClick={() => changeMonth(-1)}
              >
                <ChevronLeft aria-hidden="true" size={17} />
              </IconButton>

              <div className="w-32 shrink-0">
                <label
                  htmlFor="planner-month"
                  className="text-app-muted mb-1 block text-xs font-medium"
                >
                  Monat
                </label>
                <div className="relative">
                  <Select
                    id="planner-month"
                    className="appearance-none pr-9"
                    value={state.period.month}
                    disabled={isPlannerBusy}
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
                  <ChevronDown
                    aria-hidden="true"
                    size={16}
                    className="text-app-muted pointer-events-none absolute right-3 bottom-2.5"
                  />
                </div>
              </div>

              <div className="w-24 shrink-0">
                <label
                  htmlFor="planner-year"
                  className="text-app-muted mb-1 block text-xs font-medium"
                >
                  Jahr
                </label>
                <div className="relative">
                  <Select
                    id="planner-year"
                    className="appearance-none pr-9 tabular-nums"
                    value={state.period.year}
                    disabled={isPlannerBusy}
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
                  <ChevronDown
                    aria-hidden="true"
                    size={16}
                    className="text-app-muted pointer-events-none absolute right-3 bottom-2.5"
                  />
                </div>
              </div>

              <IconButton
                label="Nächster Monat"
                variant="secondary"
                disabled={!nextPeriod || isPlannerBusy}
                onClick={() => changeMonth(1)}
              >
                <ChevronRight aria-hidden="true" size={17} />
              </IconButton>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <LoadMonthlyPlanDialog
                currentPlanId={currentPlanId}
                canDeleteCurrentPlan={canDeleteCurrentPlan}
                trigger={
                  <Button variant="secondary" disabled={isPlannerBusy}>
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
                        : isPdfExporting
                          ? 'Die PDF wird gerade erstellt.'
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
            </div>
          </div>
        }
      />

      <div className="space-y-4 p-6 lg:p-8">
        {(activePlan || (state.load.status === 'ready' && preview)) && (
          <Toolbar label="Planungswerkzeuge" className="relative mb-3 pb-4">
            <div className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 min-[1280px]:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_minmax(0,1fr)]">
              <div className="col-start-1 row-start-1 flex min-w-0 items-center gap-3">
                <span className="border-app-border bg-app-surface-muted text-app-muted flex size-10 shrink-0 items-center justify-center rounded-md border">
                  <CalendarDays aria-hidden="true" size={19} />
                </span>
                <Badge
                  className="max-w-full min-w-0"
                  variant={
                    activePlan
                      ? state.document.kind === 'plan' &&
                        state.document.recoveredFromBackup
                        ? 'warning'
                        : hasUnsavedChanges
                          ? 'warning'
                          : 'success'
                      : 'warning'
                  }
                >
                  {activePlan
                    ? state.document.kind === 'plan' &&
                      state.document.recoveredFromBackup
                      ? 'Aus Sicherung geladen · Speichern erforderlich'
                      : hasUnsavedChanges
                        ? 'Ungespeicherte Änderungen'
                        : 'Gespeichert'
                    : 'Vorschau · nicht angelegt'}
                </Badge>
              </div>

              <div className="col-span-2 row-start-2 flex w-full min-w-0 items-center justify-center gap-2 min-[1280px]:col-span-1 min-[1280px]:col-start-2 min-[1280px]:row-start-1">
                <CardTitle
                  title={toolbarTitle}
                  className="min-w-0 truncate text-center text-lg tracking-tight"
                >
                  {toolbarTitle}
                </CardTitle>
                {activePlan ? (
                  <EditPlanTitleDialog
                    plan={activePlan}
                    disabled={isPlannerBusy || isCompactView}
                    onApply={(title) =>
                      setState((currentState) =>
                        replacePlannerDraft(
                          currentState,
                          setDraftPlanTitle(activePlan, title),
                        ),
                      )
                    }
                  />
                ) : null}
              </div>

              <div className="col-start-2 row-start-1 flex flex-wrap items-center justify-end gap-2 min-[1280px]:col-start-3">
                {activePlan ? (
                  <Button
                    variant={hasUnsavedChanges ? 'primary' : 'secondary'}
                    disabled={
                      !hasUnsavedChanges || isPlannerBusy || isCompactView
                    }
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
                ) : null}
                <EvaluationDialog
                  plan={activePlan}
                  disabled={isPlannerBusy || isCompactView}
                  status={
                    state.document.kind === 'plan' &&
                    state.document.recoveredFromBackup
                      ? 'recovered'
                      : hasUnsavedChanges
                        ? 'draft'
                        : 'saved'
                  }
                />
              </div>
            </div>

            <div
              id="planner-toolbar-details"
              hidden={!toolbarExpanded}
              className="border-app-border mt-3 w-full border-t pt-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
                <dl className="divide-app-border grid max-w-2xl min-w-96 flex-1 grid-cols-4 divide-x">
                  <div className="pr-4">
                    <dt className="text-app-muted text-xs">Anzahl SN/F</dt>
                    <dd
                      className={`mt-0.5 text-lg font-semibold tabular-nums ${getTargetCountTextClass(
                        totalSnfServiceCount,
                        calendarDayCount,
                      )}`}
                    >
                      {totalSnfServiceCount}
                    </dd>
                  </div>
                  <div className="px-4">
                    <dt className="text-app-muted text-xs">Kalendertage</dt>
                    <dd className="text-app-text mt-0.5 text-lg font-semibold tabular-nums">
                      {calendarDayCount}
                    </dd>
                  </div>
                  <div className="px-4">
                    <dt className="text-app-muted text-xs">Arbeitstage</dt>
                    <dd className="text-app-text mt-0.5 text-lg font-semibold tabular-nums">
                      {workingDayCount}
                    </dd>
                  </div>
                  <div className="pl-4">
                    <dt className="text-app-muted text-xs">Freie Tage</dt>
                    <dd className="text-app-text mt-0.5 text-lg font-semibold tabular-nums">
                      {targetFreeDayCount}
                    </dd>
                  </div>
                </dl>
                <div className="flex flex-wrap items-center gap-2">
                  <div
                    role="group"
                    aria-label="Ansicht"
                    className="border-app-border bg-app-surface-muted inline-flex h-9 items-center rounded-md border p-1 text-sm"
                  >
                    <button
                      type="button"
                      aria-pressed={!isCompactView}
                      disabled={isPdfExporting}
                      className={`rounded-sm px-3 py-1 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                        isCompactView
                          ? 'text-app-muted hover:bg-app-surface-hover'
                          : 'bg-app-primary-selected text-app-primary-foreground shadow-sm'
                      }`}
                      onClick={() =>
                        setState((currentState) =>
                          setPlannerViewMode(currentState, 'plan'),
                        )
                      }
                    >
                      Plan
                    </button>
                    <button
                      type="button"
                      aria-pressed={isCompactView}
                      disabled={!canUseCompactView || isPdfExporting}
                      title={
                        isPdfExporting
                          ? 'Die PDF wird gerade erstellt.'
                          : canUseCompactView
                            ? undefined
                            : state.document.kind === 'preview'
                              ? 'Öffne zuerst einen gespeicherten Monatsplan.'
                              : state.document.recoveredFromBackup
                                ? 'Speichere den wiederhergestellten Plan zuerst.'
                                : 'Der Dienstplan wird gerade gespeichert.'
                      }
                      className={`rounded-sm px-3 py-1 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                        isCompactView
                          ? 'bg-app-primary-selected text-app-primary-foreground shadow-sm'
                          : canUseCompactView
                            ? 'text-app-muted hover:bg-app-surface-hover'
                            : 'text-app-text-disabled cursor-not-allowed'
                      }`}
                      onClick={() =>
                        setState((currentState) =>
                          setPlannerViewMode(currentState, 'compact'),
                        )
                      }
                    >
                      Kompakt
                    </button>
                  </div>
                  {isPdfExportActionVisible(isCompactView) ? (
                    <Button
                      variant="secondary"
                      aria-label={getPdfExportActionTitle(
                        pdfFitStatus,
                        pdfExportStatus,
                      )}
                      disabled={isPdfExportActionDisabled(
                        pdfFitStatus,
                        pdfExportStatus,
                      )}
                      title={getPdfExportActionTitle(
                        pdfFitStatus,
                        pdfExportStatus,
                      )}
                      onClick={requestPdfExport}
                    >
                      {isPdfExporting ? (
                        <>
                          <Spinner
                            size="sm"
                            label="PDF wird erstellt"
                            className="text-app-text"
                          />
                          PDF wird erstellt …
                        </>
                      ) : (
                        <>
                          <Download aria-hidden="true" size={17} />
                          Export
                        </>
                      )}
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
            <button
              type="button"
              className="border-app-border bg-app-surface text-app-muted hover:bg-app-surface-muted hover:text-app-text absolute -bottom-3 left-1/2 z-10 flex h-6 w-11 -translate-x-1/2 items-center justify-center rounded-b-md border-x border-b transition-colors"
              aria-label={
                toolbarExpanded
                  ? 'Planungswerkzeuge einklappen'
                  : 'Planungswerkzeuge ausklappen'
              }
              title={
                toolbarExpanded
                  ? 'Planungswerkzeuge einklappen'
                  : 'Planungswerkzeuge ausklappen'
              }
              aria-expanded={toolbarExpanded}
              aria-controls="planner-toolbar-details"
              onClick={() => setToolbarExpanded((expanded) => !expanded)}
            >
              {toolbarExpanded ? (
                <ChevronUp aria-hidden="true" size={16} />
              ) : (
                <ChevronDown aria-hidden="true" size={16} />
              )}
            </button>
          </Toolbar>
        )}

        {state.save.status === 'error' ? (
          <Alert title="Speichern fehlgeschlagen" variant="danger">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span>{state.save.errorMessage}</span>
              {activePlan ? (
                <Button
                  variant="secondary"
                  disabled={isCompactView}
                  onClick={() => void savePlan(activePlan)}
                >
                  Erneut versuchen
                </Button>
              ) : null}
            </div>
          </Alert>
        ) : null}

        {state.document.kind === 'plan' &&
        state.document.recoveredFromBackup ? (
          <Alert
            title="Aus Sicherung geladen · Speichern erforderlich"
            variant="warning"
          >
            Der wiederhergestellte Stand muss ausdrücklich gespeichert werden,
            bevor er als regulärer Ausgangsstand gilt.
          </Alert>
        ) : null}

        {state.load.status === 'loading' ? (
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
        ) : preview && preview.employees.length === 0 ? (
          <Card className="p-4">
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
          </Card>
        ) : null}

        {isCompactView && savedPlan ? (
          <div className="space-y-3">
            {pdfExportErrorMessage ? (
              <Alert
                title="PDF konnte nicht gespeichert werden."
                variant="danger"
              >
                {pdfExportErrorMessage}
              </Alert>
            ) : null}
            {hasUnsavedChanges ? (
              <Alert title="Gespeicherter Stand" variant="info">
                Diese Ansicht zeigt den zuletzt gespeicherten Stand.
                Ungespeicherte Änderungen sind nicht enthalten.
              </Alert>
            ) : null}
            <CompactPlanPreview
              plan={savedPlan}
              onFitStatusChange={setPdfFitStatus}
            />
          </div>
        ) : activePlan ||
          (state.load.status === 'ready' &&
            preview &&
            preview.employees.length > 0) ? (
          <PlanningTable
            document={state.document}
            onDraftChange={
              isPlannerBusy
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

      <SavedPlanExportDialog
        open={savedPlanExportDialogOpen}
        onOpenChange={setSavedPlanExportDialogOpen}
        onConfirm={confirmSavedPlanExport}
      />
    </>
  );
}
