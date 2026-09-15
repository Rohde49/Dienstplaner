import { LoaderCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import type { MonthlyPlanSummary } from '../../../shared/schemas';
import {
  Alert,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogRoot,
  AlertDialogTrigger,
  Button,
  IconButton,
} from '../../components/ui';
import { PLANNER_MONTHS } from './plannerState';

type DeleteMonthlyPlanDialogProps = {
  plan: MonthlyPlanSummary;
  disabled: boolean;
  onDeletingChange: (isDeleting: boolean) => void;
  onDeleted: (planId: string) => void;
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Der Dienstplan konnte nicht gelöscht werden.';
}

/** Fragt vor dem endgültigen Löschen eines vollständigen Monatsplans nach. */
export function DeleteMonthlyPlanDialog({
  plan,
  disabled,
  onDeletingChange,
  onDeleted,
}: DeleteMonthlyPlanDialogProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleOpenChange(nextOpen: boolean): void {
    if (isDeleting) {
      return;
    }

    setErrorMessage(null);
    setOpen(nextOpen);
  }

  async function handleDelete(): Promise<void> {
    let wasDeleted = false;

    setIsDeleting(true);
    onDeletingChange(true);
    setErrorMessage(null);

    try {
      await window.dienstplaner.monthlyPlans.remove(plan.id);
      wasDeleted = true;
      toast.success(`${plan.title} wurde gelöscht.`);
      setOpen(false);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsDeleting(false);
      onDeletingChange(false);
    }

    if (wasDeleted) {
      onDeleted(plan.id);
    }
  }

  const period = `${PLANNER_MONTHS[plan.month - 1]} ${plan.year}`;

  return (
    <AlertDialogRoot open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <IconButton
          label={`${plan.title} löschen`}
          disabled={disabled}
          className="text-app-danger hover:bg-app-danger-subtle hover:text-app-danger-hover"
        >
          <Trash2 aria-hidden="true" size={17} />
        </IconButton>
      </AlertDialogTrigger>

      <AlertDialogContent
        title="Dienstplan löschen?"
        description={`${plan.title} für ${period} wird dauerhaft gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.`}
      >
        {errorMessage ? (
          <div className="px-6 pt-5">
            <Alert title="Löschen fehlgeschlagen" variant="danger">
              {errorMessage}
            </Alert>
          </div>
        ) : null}

        <div className="border-app-border bg-app-surface-muted flex justify-end gap-3 border-t px-6 py-4">
          <AlertDialogCancel asChild>
            <Button variant="secondary" disabled={isDeleting}>
              Abbrechen
            </Button>
          </AlertDialogCancel>

          <AlertDialogAction asChild>
            <Button
              variant="danger"
              disabled={isDeleting}
              onClick={(event) => {
                event.preventDefault();
                void handleDelete();
              }}
            >
              {isDeleting ? (
                <>
                  <LoaderCircle
                    aria-hidden="true"
                    className="animate-spin"
                    size={17}
                  />
                  Wird gelöscht …
                </>
              ) : (
                <>
                  <Trash2 aria-hidden="true" size={17} />
                  Dienstplan löschen
                </>
              )}
            </Button>
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialogRoot>
  );
}
