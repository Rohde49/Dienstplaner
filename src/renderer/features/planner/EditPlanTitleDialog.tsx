import { Pencil } from 'lucide-react';
import { useState, type FormEvent } from 'react';

import {
  monthlyPlanInputSchema,
  type MonthlyPlan,
} from '../../../shared/schemas';
import {
  Button,
  IconButton,
  DialogClose,
  DialogContent,
  DialogRoot,
  DialogTrigger,
  FormField,
  Input,
} from '../../components/ui';

type EditPlanTitleDialogProps = {
  plan: MonthlyPlan;
  disabled?: boolean;
  onApply: (title: string) => void;
};

/** Ändert den Titel ausschließlich im lokalen Planentwurf. */
export function EditPlanTitleDialog({
  plan,
  disabled = false,
  onApply,
}: EditPlanTitleDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(plan.title);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleOpenChange(nextOpen: boolean): void {
    setTitle(plan.title);
    setErrorMessage(null);
    setOpen(nextOpen);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const validationResult = monthlyPlanInputSchema.safeParse({
      year: plan.year,
      month: plan.month,
      title,
    });

    if (!validationResult.success) {
      setErrorMessage(
        validationResult.error.issues.find((issue) => issue.path[0] === 'title')
          ?.message ?? 'Bitte prüfe den Plantitel.',
      );
      return;
    }

    try {
      onApply(validationResult.data.title);
      setOpen(false);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Der Plantitel konnte nicht übernommen werden.',
      );
    }
  }

  return (
    <DialogRoot open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <IconButton
          label="Plantitel bearbeiten"
          className="size-8 shrink-0"
          disabled={disabled}
        >
          <Pencil aria-hidden="true" size={16} />
        </IconButton>
      </DialogTrigger>

      <DialogContent
        title="Plantitel bearbeiten"
        description="Die Änderung wird zunächst nur in den aktuellen Entwurf übernommen."
      >
        <form noValidate onSubmit={handleSubmit}>
          <div className="space-y-5 p-6">
            <FormField
              htmlFor="edit-plan-title"
              label="Plantitel"
              error={errorMessage ?? undefined}
              hint="Der Titel darf höchstens 200 Zeichen enthalten."
            >
              <Input
                id="edit-plan-title"
                autoFocus
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);
                  setErrorMessage(null);
                }}
              />
            </FormField>
          </div>

          <div className="border-app-border bg-app-surface-muted flex justify-end gap-2 border-t px-6 py-4">
            <DialogClose asChild>
              <Button variant="secondary">Abbrechen</Button>
            </DialogClose>
            <Button type="submit">Übernehmen</Button>
          </div>
        </form>
      </DialogContent>
    </DialogRoot>
  );
}
