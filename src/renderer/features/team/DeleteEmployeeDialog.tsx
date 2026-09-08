import { LoaderCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import type { Employee } from '../../../shared/schemas';
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

type DeleteEmployeeDialogProps = {
  employee: Employee;
  onDeleted: (employeeId: string) => void;
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Der Mitarbeiter konnte nicht gelöscht werden.';
}

/** Fragt vor dem endgültigen Löschen eines Mitarbeiters nach Bestätigung. */
export function DeleteEmployeeDialog({
  employee,
  onDeleted,
}: DeleteEmployeeDialogProps) {
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

  /** Löscht den Mitarbeiter und entfernt ihn anschließend aus der Ansicht. */
  async function handleDelete(): Promise<void> {
    setIsDeleting(true);
    setErrorMessage(null);

    try {
      await window.dienstplaner.employees.remove(employee.id);

      onDeleted(employee.id);
      toast.success(
        `${employee.firstName} ${employee.lastName} wurde gelöscht.`,
      );

      setOpen(false);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  }

  const employeeName = `${employee.firstName} ${employee.lastName}`;

  return (
    <AlertDialogRoot open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <IconButton
          label={`${employeeName} löschen`}
          className="text-app-danger hover:bg-app-danger-subtle hover:text-app-danger-hover"
        >
          <Trash2 aria-hidden="true" size={17} />
        </IconButton>
      </AlertDialogTrigger>

      <AlertDialogContent
        title="Mitarbeiter löschen?"
        description={`${employeeName} wird dauerhaft aus der Teamverwaltung entfernt. Diese Aktion kann nicht rückgängig gemacht werden.`}
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
                  Mitarbeiter löschen
                </>
              )}
            </Button>
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialogRoot>
  );
}
