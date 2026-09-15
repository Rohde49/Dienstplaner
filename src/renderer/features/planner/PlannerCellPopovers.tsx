import { Check, Trash2, X } from 'lucide-react';
import { Popover as PopoverPrimitive } from 'radix-ui';
import { useId, useState, type ReactNode } from 'react';

import type {
  EntryType,
  PlanEmployee,
  PlanEntry,
} from '../../../shared/schemas';
import {
  Alert,
  Button,
  IconButton,
  Spinner,
  Textarea,
} from '../../components/ui';

type PlannerPopoverContentProps = {
  title: string;
  titleId: string;
  children: ReactNode;
};

function PlannerPopoverContent({
  title,
  titleId,
  children,
}: PlannerPopoverContentProps) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        role="dialog"
        aria-labelledby={titleId}
        align="start"
        sideOffset={6}
        collisionPadding={16}
        className="border-app-border bg-app-surface z-[60] w-[min(22rem,calc(100vw-2rem))] rounded-lg border p-4 pr-11 shadow-lg"
      >
        <h3 id={titleId} className="text-app-text text-sm font-semibold">
          {title}
        </h3>
        <div className="mt-3">{children}</div>

        <PopoverPrimitive.Close asChild>
          <IconButton
            label="Popover schließen"
            className="absolute top-2 right-2 size-7"
          >
            <X aria-hidden="true" size={16} />
          </IconButton>
        </PopoverPrimitive.Close>
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  );
}

function formatEntryTypeTime(entryType: EntryType): string {
  return entryType.startTime && entryType.endTime
    ? `${entryType.startTime}–${entryType.endTime}`
    : 'Keine Uhrzeit';
}

type PlanEntryCellPopoverProps = {
  date: string;
  employeeName: string;
  currentEntry: PlanEntry | undefined;
  onSelect: (entryType: EntryType) => void;
  onRemove: () => void;
};

/** Wählt für eine Planungszelle ausschließlich aktuell aktive Eintragsarten. */
export function PlanEntryCellPopover({
  date,
  employeeName,
  currentEntry,
  onSelect,
  onRemove,
}: PlanEntryCellPopoverProps) {
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [entryTypes, setEntryTypes] = useState<EntryType[]>([]);
  const [loadStatus, setLoadStatus] = useState<
    'idle' | 'loading' | 'ready' | 'error'
  >('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function loadEntryTypes(): Promise<void> {
    setLoadStatus('loading');
    setErrorMessage(null);

    try {
      const loadedEntryTypes = await window.dienstplaner.entryTypes.list();
      setEntryTypes(loadedEntryTypes.filter((entryType) => entryType.active));
      setLoadStatus('ready');
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Die Planungseinträge konnten nicht geladen werden.',
      );
      setLoadStatus('error');
    }
  }

  function handleOpenChange(nextOpen: boolean): void {
    setOpen(nextOpen);
    setErrorMessage(null);

    if (nextOpen) {
      void loadEntryTypes();
    }
  }

  function applyChange(change: () => void): void {
    try {
      change();
      setOpen(false);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Der Planungseintrag konnte nicht übernommen werden.',
      );
    }
  }

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          className="hover:bg-app-surface-hover min-h-8 w-full rounded px-2 py-1 text-center font-semibold"
          aria-label={`${date}, ${employeeName}, ${currentEntry ? `Eintrag ${currentEntry.code}` : 'kein Eintrag'}`}
        >
          {currentEntry?.code ?? '—'}
        </button>
      </PopoverPrimitive.Trigger>

      <PlannerPopoverContent
        title={`Eintrag für ${employeeName}`}
        titleId={titleId}
      >
        {errorMessage ? (
          <Alert
            className="mb-3"
            title="Änderung nicht möglich"
            variant="danger"
          >
            {errorMessage}
          </Alert>
        ) : null}

        {loadStatus === 'loading' ? (
          <div className="text-app-muted flex items-center gap-2 py-4 text-sm">
            <Spinner size="sm" label="Planungseinträge werden geladen" />
            Planungseinträge werden geladen …
          </div>
        ) : loadStatus === 'error' ? (
          <Button variant="secondary" onClick={() => void loadEntryTypes()}>
            Erneut laden
          </Button>
        ) : (
          <div className="space-y-2">
            {entryTypes.length === 0 ? (
              <p className="text-app-muted text-sm">
                Es sind keine aktiven Planungseinträge verfügbar.
              </p>
            ) : (
              <div className="max-h-64 space-y-1 overflow-y-auto">
                {entryTypes.map((entryType) => {
                  const selected =
                    currentEntry?.sourceEntryTypeId === entryType.id;

                  return (
                    <Button
                      key={entryType.id}
                      variant={selected ? 'secondary' : 'ghost'}
                      className="h-auto w-full justify-between px-3 py-2 text-left"
                      aria-pressed={selected}
                      onClick={() => applyChange(() => onSelect(entryType))}
                    >
                      <span>
                        <span className="block font-semibold">
                          {entryType.code}
                        </span>
                        <span className="text-app-muted block text-xs font-normal">
                          {formatEntryTypeTime(entryType)}
                        </span>
                      </span>
                      {selected ? <Check aria-hidden="true" size={16} /> : null}
                    </Button>
                  );
                })}
              </div>
            )}

            {currentEntry ? (
              <Button
                variant="ghost"
                className="text-app-danger hover:bg-app-danger-subtle hover:text-app-danger-hover w-full justify-start"
                onClick={() => applyChange(onRemove)}
              >
                <Trash2 aria-hidden="true" size={16} />
                Eintrag entfernen
              </Button>
            ) : null}
          </div>
        )}
      </PlannerPopoverContent>
    </PopoverPrimitive.Root>
  );
}

type OnCallCellPopoverProps = {
  date: string;
  employees: readonly PlanEmployee[];
  selectedEmployeeId: string | null;
  onSelect: (employeeId: string | null) => void;
};

/** Ändert die Rufbereitschaft aus den gespeicherten Erzieher-Snapshots. */
export function OnCallCellPopover({
  date,
  employees,
  selectedEmployeeId,
  onSelect,
}: OnCallCellPopoverProps) {
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const educators = employees.filter(
    (employee) => employee.role === 'Erzieher',
  );

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          className="hover:bg-app-surface-hover min-h-8 w-full rounded px-2 py-1 text-left"
          aria-label={`${date}, Rufbereitschaft bearbeiten`}
        >
          {selectedEmployeeId
            ? (() => {
                const employee = employees.find(
                  (candidate) => candidate.id === selectedEmployeeId,
                );
                return employee
                  ? `${employee.firstName} ${employee.lastName}`
                  : '—';
              })()
            : '—'}
        </button>
      </PopoverPrimitive.Trigger>

      <PlannerPopoverContent title="Rufbereitschaft" titleId={titleId}>
        {educators.length === 0 ? (
          <p className="text-app-muted text-sm">
            Dieser Plan enthält keinen Mitarbeiter mit der Rolle Erzieher.
          </p>
        ) : (
          <div className="space-y-1">
            <Button
              variant={selectedEmployeeId === null ? 'secondary' : 'ghost'}
              className="w-full justify-between"
              aria-pressed={selectedEmployeeId === null}
              onClick={() => {
                onSelect(null);
                setOpen(false);
              }}
            >
              Keine Rufbereitschaft
              {selectedEmployeeId === null ? (
                <Check aria-hidden="true" size={16} />
              ) : null}
            </Button>
            {educators.map((employee) => {
              const selected = selectedEmployeeId === employee.id;

              return (
                <Button
                  key={employee.id}
                  variant={selected ? 'secondary' : 'ghost'}
                  className="w-full justify-between"
                  aria-pressed={selected}
                  onClick={() => {
                    onSelect(employee.id);
                    setOpen(false);
                  }}
                >
                  {employee.firstName} {employee.lastName}
                  {selected ? <Check aria-hidden="true" size={16} /> : null}
                </Button>
              );
            })}
          </div>
        )}
      </PlannerPopoverContent>
    </PopoverPrimitive.Root>
  );
}

type DayNoteCellPopoverProps = {
  date: string;
  note: string | null;
  onApply: (note: string) => void;
};

/** Bearbeitet eine Tagesbemerkung erst nach ausdrücklichem Übernehmen. */
export function DayNoteCellPopover({
  date,
  note,
  onApply,
}: DayNoteCellPopoverProps) {
  const titleId = useId();
  const textareaId = useId();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(note ?? '');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const characterCount = draft.trim().length;

  function handleOpenChange(nextOpen: boolean): void {
    setDraft(note ?? '');
    setErrorMessage(null);
    setOpen(nextOpen);
  }

  function handleApply(): void {
    try {
      onApply(draft);
      setOpen(false);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Die Bemerkung konnte nicht übernommen werden.',
      );
    }
  }

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          className="hover:bg-app-surface-hover min-h-8 w-full max-w-56 truncate rounded px-2 py-1 text-left"
          aria-label={`${date}, Bemerkung bearbeiten${note ? `, aktuell ${note}` : ''}`}
        >
          {note ?? ''}
        </button>
      </PopoverPrimitive.Trigger>

      <PlannerPopoverContent title="Tagesbemerkung" titleId={titleId}>
        {errorMessage ? (
          <Alert className="mb-3" title="Bemerkung ungültig" variant="danger">
            {errorMessage}
          </Alert>
        ) : null}

        <label
          htmlFor={textareaId}
          className="text-app-text text-sm font-medium"
        >
          Bemerkung für {date}
        </label>
        <Textarea
          id={textareaId}
          className="mt-2"
          value={draft}
          autoFocus
          aria-invalid={characterCount > 60}
          onChange={(event) => {
            setDraft(event.target.value);
            setErrorMessage(null);
          }}
        />
        <p
          className={`mt-1 text-right text-xs ${
            characterCount > 60 ? 'text-app-danger' : 'text-app-muted'
          }`}
        >
          {characterCount} / 60 Zeichen
        </p>

        <div className="mt-4 flex justify-end gap-2">
          <PopoverPrimitive.Close asChild>
            <Button variant="secondary">Abbrechen</Button>
          </PopoverPrimitive.Close>
          <Button disabled={characterCount > 60} onClick={handleApply}>
            Übernehmen
          </Button>
        </div>
      </PlannerPopoverContent>
    </PopoverPrimitive.Root>
  );
}
