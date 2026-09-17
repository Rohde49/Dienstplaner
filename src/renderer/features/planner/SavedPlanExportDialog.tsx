import { Download } from 'lucide-react';
import { useRef } from 'react';

import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogRoot,
  Button,
} from '../../components/ui';

type SavedPlanExportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

/** Bestätigt bei einem abweichenden Entwurf den Export des gespeicherten Stands. */
export function SavedPlanExportDialog({
  open,
  onOpenChange,
  onConfirm,
}: SavedPlanExportDialogProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <AlertDialogRoot open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        title="Gespeicherten Stand exportieren?"
        description="Die PDF enthält nur den zuletzt gespeicherten Stand. Deine ungespeicherten Änderungen werden nicht exportiert und bleiben im Plan erhalten."
        headerIcon={
          <span className="bg-app-primary-subtle text-app-primary flex size-10 items-center justify-center rounded-lg">
            <Download aria-hidden="true" size={20} />
          </span>
        }
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          cancelButtonRef.current?.focus();
        }}
      >
        <div className="border-app-border bg-app-surface-muted flex flex-wrap items-center justify-between gap-3 border-t px-6 py-4">
          <AlertDialogCancel asChild>
            <Button ref={cancelButtonRef} variant="secondary">
              Abbrechen
            </Button>
          </AlertDialogCancel>

          <AlertDialogAction asChild>
            <Button onClick={onConfirm}>
              <Download aria-hidden="true" size={17} />
              Gespeicherten Stand exportieren
            </Button>
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialogRoot>
  );
}
