import { Save, TriangleAlert } from 'lucide-react';
import { useRef } from 'react';

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
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

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
        description="Deine Änderungen am aktuellen Dienstplan sind noch nicht gespeichert. Wie möchtest du fortfahren?"
        headerIcon={
          <span className="bg-app-warning-subtle text-app-warning flex size-10 items-center justify-center rounded-lg">
            <TriangleAlert aria-hidden="true" size={20} />
          </span>
        }
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          cancelButtonRef.current?.focus();
        }}
      >
        {errorMessage ? (
          <div className="px-6 pt-5">
            <Alert title="Speichern fehlgeschlagen" variant="danger">
              {errorMessage}
            </Alert>
          </div>
        ) : null}

        <div className="border-app-border bg-app-surface-muted flex flex-wrap items-center justify-between gap-3 border-t px-6 py-4">
          <AlertDialogCancel asChild>
            <Button
              ref={cancelButtonRef}
              variant="secondary"
              disabled={isSaving}
              onClick={onCancel}
            >
              Abbrechen
            </Button>
          </AlertDialogCancel>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button variant="danger" disabled={isSaving} onClick={onDiscard}>
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
        </div>
      </AlertDialogContent>
    </AlertDialogRoot>
  );
}
