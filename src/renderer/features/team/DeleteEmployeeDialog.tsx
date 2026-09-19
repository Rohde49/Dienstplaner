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
import { getUserFacingIpcErrorMessage } from '../../errors/userFacingIpcError';

type DeleteEmployeeDialogProps = {
  employee: Employee;
  disabled?: boolean;
  onDeleted: (employeeId: string) => void;
};

/** Fragt vor dem endgültigen Löschen eines Mitarbeiters nach Bestätigung. */
export function DeleteEmployeeDialog({
  employee,
  disabled = false,
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
      setErrorMessage(
        getUserFacingIpcErrorMessage(error, {
          fallback: 'Der Mitarbeiter konnte nicht gelöscht werden.',
          context: 'Mitarbeiter konnte nicht gelöscht werden',
        }),
      );
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
          disabled={disabled}
          className="border-app-danger-border bg-app-danger-subtle !text-app-danger hover:!bg-app-danger-border hover:!text-app-danger-hover !size-8 border"
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
