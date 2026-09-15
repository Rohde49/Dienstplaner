import { Save } from 'lucide-react';

import {
  Alert,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogRoot,
  Button,
  Spinner,
} from '../../components/ui';

type UnsavedChangesDialogProps = {
  open: boolean;
  isSaving: boolean;
  errorMessage: string | null;
  onSaveAndContinue: () => void;
  onDiscard: () => void;
  onCancel: () => void;
};

/** Schützt alle Planwechsel mit denselben drei Entscheidungen. */
export function UnsavedChangesDialog({
  open,
  isSaving,
  errorMessage,
  onSaveAndContinue,
  onDiscard,
  onCancel,
}: UnsavedChangesDialogProps) {
  return (
    <AlertDialogRoot
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !isSaving) {
          onCancel();
        }
      }}
    >
      <AlertDialogContent
        title="Ungespeicherte Änderungen"
        description="Speichere oder verwirf den aktuellen Entwurf, bevor du fortfährst."
      >
        {errorMessage ? (
          <div className="px-6 pt-5">
            <Alert title="Speichern fehlgeschlagen" variant="danger">
              {errorMessage}
            </Alert>
          </div>
        ) : null}

        <div className="border-app-border bg-app-surface-muted flex flex-wrap justify-end gap-2 border-t px-6 py-4">
          <AlertDialogCancel asChild>
            <Button variant="secondary" disabled={isSaving} onClick={onCancel}>
              Abbrechen
            </Button>
          </AlertDialogCancel>

          <Button variant="ghost" disabled={isSaving} onClick={onDiscard}>
            Änderungen verwerfen
          </Button>

          <AlertDialogAction asChild>
            <Button
              disabled={isSaving}
              onClick={(event) => {
                event.preventDefault();
                onSaveAndContinue();
              }}
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
                  Speichern und fortfahren
                </>
              )}
            </Button>
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialogRoot>
  );
}
