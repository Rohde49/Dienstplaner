import { CalendarPlus } from 'lucide-react';
import { useState, type FormEvent, type ReactNode } from 'react';
import { toast } from 'sonner';

import {
  monthlyPlanInputSchema,
  type MonthlyPlan,
} from '../../../shared/schemas';
import {
  Alert,
  Button,
  DialogClose,
  DialogContent,
  DialogRoot,
  DialogTrigger,
  FormField,
  Input,
  Spinner,
} from '../../components/ui';
import { getUserFacingIpcErrorMessage } from '../../errors/userFacingIpcError';
import { PLANNER_MONTHS, type PlannerPeriod } from './plannerState';

type CreateMonthlyPlanDialogProps = {
  period: PlannerPeriod;
  trigger: ReactNode;
  onRequestOpen: (openDialog: () => void) => void;
  onCreated: (plan: MonthlyPlan) => void;
};

/** Erfasst den verpflichtenden Titel und legt den Monatsplan unmittelbar an. */
export function CreateMonthlyPlanDialog({
  period,
  trigger,
  onRequestOpen,
  onCreated,
}: CreateMonthlyPlanDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [titleError, setTitleError] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  function resetForm(): void {
    setTitle('');
    setTitleError(null);
    setSubmissionError(null);
  }

  function handleOpenChange(nextOpen: boolean): void {
    if (isCreating) {
      return;
    }

    if (nextOpen) {
      onRequestOpen(() => {
        resetForm();
        setOpen(true);
      });
      return;
    }

    resetForm();
    setOpen(false);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setSubmissionError(null);

    const validationResult = monthlyPlanInputSchema.safeParse({
      year: period.year,
      month: period.month,
      title,
    });

    if (!validationResult.success) {
      const errorMessage =
        validationResult.error.issues.find((issue) => issue.path[0] === 'title')
          ?.message ?? 'Bitte prüfe den Plantitel.';
      setTitleError(errorMessage);
      window.setTimeout(
        () => document.getElementById('plan-title')?.focus(),
        0,
      );
      return;
    }

    setIsCreating(true);

    try {
      const createdPlan = await window.dienstplaner.monthlyPlans.create(
        validationResult.data,
      );

      onCreated(createdPlan);
      toast.success(`${createdPlan.title} wurde angelegt.`);
      setOpen(false);
      resetForm();
    } catch (error) {
      setSubmissionError(
        getUserFacingIpcErrorMessage(error, {
          fallback: 'Der Dienstplan konnte nicht angelegt werden.',
          context: 'Dienstplan konnte nicht angelegt werden',
        }),
      );
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <DialogRoot open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent
        title="Dienstplan erstellen"
        description={`Lege einen neuen Dienstplan für ${PLANNER_MONTHS[period.month - 1]} ${period.year} an.`}
      >
        <form noValidate onSubmit={(event) => void handleSubmit(event)}>
          <div className="space-y-5 p-6">
            {submissionError ? (
              <Alert title="Anlegen fehlgeschlagen" variant="danger">
                {submissionError}
              </Alert>
            ) : null}

            <FormField
              htmlFor="plan-title"
              label="Plantitel"
              error={titleError ?? undefined}
              hint="Der Titel darf höchstens 200 Zeichen enthalten."
            >
              <Input
                id="plan-title"
                name="title"
                autoFocus
                required
                value={title}
                aria-invalid={Boolean(titleError)}
                aria-describedby={
                  titleError ? 'plan-title-error' : 'plan-title-hint'
                }
                onChange={(event) => {
                  setTitle(event.target.value);
                  setTitleError(null);
                }}
              />
            </FormField>
          </div>

          <div className="border-app-border bg-app-surface-muted flex justify-end gap-2 border-t px-6 py-4">
            <DialogClose asChild>
              <Button variant="secondary" disabled={isCreating}>
                Abbrechen
              </Button>
            </DialogClose>

            <Button type="submit" disabled={isCreating}>
              {isCreating ? (
                <>
                  <Spinner
                    size="sm"
                    label="Dienstplan wird angelegt"
                    className="text-app-on-primary"
                  />
                  Wird angelegt …
                </>
              ) : (
                <>
                  <CalendarPlus aria-hidden="true" size={17} />
                  Dienstplan erstellen
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </DialogRoot>
  );
}
