import { FolderOpen, LoaderCircle } from 'lucide-react';
import { useState, type ReactNode } from 'react';

import type {
  MonthlyPlanLoadResult,
  MonthlyPlanSummary,
} from '../../../shared/schemas';
import {
  Alert,
  Badge,
  Button,
  DialogClose,
  DialogContent,
  DialogRoot,
  DialogTrigger,
  EmptyState,
  Spinner,
} from '../../components/ui';
import { getUserFacingIpcErrorMessage } from '../../errors/userFacingIpcError';
import { DeleteMonthlyPlanDialog } from './DeleteMonthlyPlanDialog';
import { PLANNER_MONTHS } from './plannerState';

type LoadMonthlyPlanDialogProps = {
  trigger: ReactNode;
  currentPlanId: string | null;
  canDeleteCurrentPlan: boolean;
  onLoaded: (result: MonthlyPlanLoadResult, closeDialog: () => void) => void;
  onDeleted: (planId: string) => void;
};

type PlanListState =
  | { status: 'loading'; plans: readonly MonthlyPlanSummary[]; error: null }
  | { status: 'ready'; plans: readonly MonthlyPlanSummary[]; error: null }
  | { status: 'error'; plans: readonly MonthlyPlanSummary[]; error: string };

const dateFormatter = new Intl.DateTimeFormat('de-DE', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

function formatTimestamp(timestamp: string): string {
  return dateFormatter.format(new Date(timestamp));
}

/** Zeigt alle gespeicherten Monatspläne unabhängig vom gewählten Zeitraum. */
export function LoadMonthlyPlanDialog({
  trigger,
  currentPlanId,
  canDeleteCurrentPlan,
  onLoaded,
  onDeleted,
}: LoadMonthlyPlanDialogProps) {
  const [open, setOpen] = useState(false);
  const [listState, setListState] = useState<PlanListState>({
    status: 'loading',
    plans: [],
    error: null,
  });
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const isBusy = loadingPlanId !== null || isDeleting;

  async function loadPlanList(): Promise<void> {
    setListState((currentState) => ({
      status: 'loading',
      plans: currentState.plans,
      error: null,
    }));

    try {
      const plans = await window.dienstplaner.monthlyPlans.list();
      setListState({ status: 'ready', plans, error: null });
    } catch (error) {
      setListState((currentState) => ({
        status: 'error',
        plans: currentState.plans,
        error: getUserFacingIpcErrorMessage(error, {
          fallback:
            'Die gespeicherten Dienstpläne konnten nicht geladen werden.',
          context: 'Dienstplanliste konnte nicht geladen werden',
        }),
      }));
    }
  }

  function handleOpenChange(nextOpen: boolean): void {
    if (isBusy) {
      return;
    }

    setOpen(nextOpen);
    setLoadError(null);

    if (nextOpen) {
      void loadPlanList();
    }
  }

  async function handleLoad(planId: string): Promise<void> {
    setLoadingPlanId(planId);
    setLoadError(null);

    try {
      const result = await window.dienstplaner.monthlyPlans.get(planId);

      if (!result.plan) {
        setLoadError(
          'Der ausgewählte Dienstplan wurde nicht gefunden. Aktualisiere die Liste und versuche es erneut.',
        );
        await loadPlanList();
        return;
      }

      onLoaded(result, () => setOpen(false));
    } catch (error) {
      setLoadError(
        getUserFacingIpcErrorMessage(error, {
          fallback: 'Der Dienstplan konnte nicht geladen werden.',
          context: 'Dienstplan konnte nicht geladen werden',
        }),
      );
    } finally {
      setLoadingPlanId(null);
    }
  }

  function handleDeleted(planId: string): void {
    setListState((currentState) => ({
      ...currentState,
      plans: currentState.plans.filter((plan) => plan.id !== planId),
    }));
    onDeleted(planId);
  }

  return (
    <DialogRoot open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent
        className="max-w-4xl"
        title="Dienstplan laden"
        description="Wähle einen gespeicherten Dienstplan aus. Die Liste enthält alle Zeiträume."
      >
        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          {loadError ? (
            <Alert
              className="mb-4"
              title="Dienstplan konnte nicht geladen werden"
              variant="danger"
            >
              {loadError}
            </Alert>
          ) : null}

          {listState.status === 'error' ? (
            <div className="mb-4 space-y-3">
              <Alert title="Liste konnte nicht geladen werden" variant="danger">
                {listState.error}
              </Alert>
              <Button
                variant="secondary"
                disabled={isBusy}
                onClick={() => void loadPlanList()}
              >
                Erneut laden
              </Button>
            </div>
          ) : null}

          {listState.status === 'loading' && listState.plans.length > 0 ? (
            <div className="text-app-muted mb-4 flex items-center gap-2 text-sm">
              <Spinner size="sm" label="Dienstplanliste wird aktualisiert" />
              Liste wird aktualisiert …
            </div>
          ) : null}

          {listState.status === 'loading' && listState.plans.length === 0 ? (
            <div className="flex min-h-48 items-center justify-center gap-3">
              <Spinner label="Dienstpläne werden geladen" />
              <span className="text-app-muted text-sm">
                Dienstpläne werden geladen …
              </span>
            </div>
          ) : listState.plans.length === 0 && listState.status === 'ready' ? (
            <EmptyState
              icon={FolderOpen}
              title="Noch keine Dienstpläne gespeichert"
              description="Lege zuerst einen Dienstplan an. Dieser Dialog bleibt für spätere Pläne verfügbar."
            />
          ) : (
            <ul className="space-y-3">
              {listState.plans.map((plan) => {
                const isCurrentPlan = plan.id === currentPlanId;
                const deleteDisabled =
                  isBusy || (isCurrentPlan && !canDeleteCurrentPlan);

                return (
                  <li
                    key={plan.id}
                    className="border-app-border rounded-md border p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-app-text truncate font-semibold">
                            {plan.title}
                          </h3>
                          {isCurrentPlan ? (
                            <Badge variant="primary">Geöffnet</Badge>
                          ) : null}
                        </div>
                        <p className="text-app-muted mt-1 text-sm">
                          {PLANNER_MONTHS[plan.month - 1]} {plan.year}
                        </p>
                        <dl className="text-app-muted mt-3 grid gap-x-6 gap-y-1 text-xs sm:grid-cols-2">
                          <div className="flex gap-1">
                            <dt>Erstellt:</dt>
                            <dd>{formatTimestamp(plan.createdAt)}</dd>
                          </div>
                          <div className="flex gap-1">
                            <dt>Geändert:</dt>
                            <dd>{formatTimestamp(plan.updatedAt)}</dd>
                          </div>
                        </dl>
                      </div>

                      <div className="flex shrink-0 items-center gap-1">
                        <Button
                          variant="secondary"
                          disabled={isBusy}
                          onClick={() => void handleLoad(plan.id)}
                        >
                          {loadingPlanId === plan.id ? (
                            <>
                              <LoaderCircle
                                aria-hidden="true"
                                className="animate-spin"
                                size={17}
                              />
                              Wird geladen …
                            </>
                          ) : (
                            <>
                              <FolderOpen aria-hidden="true" size={17} />
                              Öffnen
                            </>
                          )}
                        </Button>

                        <DeleteMonthlyPlanDialog
                          plan={plan}
                          disabled={deleteDisabled}
                          onDeletingChange={setIsDeleting}
                          onDeleted={handleDeleted}
                        />
                      </div>
                    </div>

                    {isCurrentPlan && !canDeleteCurrentPlan ? (
                      <p className="text-app-warning mt-3 text-xs">
                        Der geöffnete Plan kann erst nach dem Speichern oder
                        Verwerfen seiner Änderungen gelöscht werden.
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="border-app-border bg-app-surface-muted flex justify-end border-t px-6 py-4">
          <DialogClose asChild>
            <Button variant="secondary" disabled={isBusy}>
              Schließen
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </DialogRoot>
  );
}
