import { Check, Clock, Trash2, X } from 'lucide-react';
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
import { formatOnCallName } from './formatOnCallName';

type PlannerPopoverContentProps = {
  title: string;
  titleId: string;
  description?: string;
  presentation?: 'default' | 'selection';
  children: ReactNode;
};

function PlannerPopoverContent({
  title,
  titleId,
  description,
  presentation = 'default',
  children,
}: PlannerPopoverContentProps) {
  const isSelection = presentation === 'selection';
  const descriptionId = `${titleId}-description`;

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        role="dialog"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        align="start"
        sideOffset={6}
        collisionPadding={16}
        className={[
          'border-app-border bg-app-surface relative z-[60] rounded-lg border shadow-lg',
          isSelection
            ? 'w-[min(20rem,calc(100vw-2rem))] overflow-hidden'
            : 'w-[min(22rem,calc(100vw-2rem))] p-4 pr-11',
        ].join(' ')}
      >
        <div
          className={
            isSelection
              ? 'border-app-border border-b px-4 py-3 pr-11'
              : undefined
          }
        >
          <h3 id={titleId} className="text-app-text text-sm font-semibold">
            {title}
          </h3>
          {description ? (
            <p id={descriptionId} className="text-app-muted mt-1 text-xs">
              {description}
            </p>
          ) : null}
        </div>
        <div className={isSelection ? undefined : 'mt-3'}>{children}</div>

        <PopoverPrimitive.Close asChild>
          <IconButton
            label="Popover schließen"
            className="absolute top-2.5 right-2.5 size-7"
          >
            <X aria-hidden="true" size={16} />
          </IconButton>
        </PopoverPrimitive.Close>

        {isSelection ? (
          <PopoverPrimitive.Arrow
            aria-hidden="true"
            className="fill-app-surface"
            width={14}
            height={7}
          />
        ) : null}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  );
}

const planEntryDateFormatter = new Intl.DateTimeFormat('de-DE', {
  weekday: 'long',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'UTC',
});

function formatPlanEntryDate(date: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);

  if (!match) {
    return date;
  }

  return planEntryDateFormatter.format(
    new Date(
      Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
    ),
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
          className={`${currentEntry ? '' : 'planner-empty-field'} hover:bg-app-primary-selected min-h-8 w-full rounded px-2 py-1 text-center font-semibold`}
          aria-label={`${date}, ${employeeName}, ${currentEntry ? `Eintrag ${currentEntry.code}` : 'kein Eintrag'}`}
        >
          {currentEntry?.code}
        </button>
      </PopoverPrimitive.Trigger>

      <PlannerPopoverContent
        title="Planungseintrag auswählen"
        titleId={titleId}
        description={`${employeeName} · ${formatPlanEntryDate(date)}`}
        presentation="selection"
      >
        {errorMessage ? (
          <div className="px-3 pt-3">
            <Alert title="Änderung nicht möglich" variant="danger">
              {errorMessage}
            </Alert>
          </div>
        ) : null}

        {loadStatus === 'loading' ? (
          <div className="text-app-muted flex items-center justify-center gap-2 px-4 py-6 text-sm">
            <Spinner size="sm" label="Planungseinträge werden geladen" />
            Planungseinträge werden geladen …
          </div>
        ) : loadStatus === 'error' ? (
          <div className="p-3">
            <Button
              className="w-full"
              variant="secondary"
              onClick={() => void loadEntryTypes()}
            >
              Erneut laden
            </Button>
          </div>
        ) : (
          <div>
            {entryTypes.length === 0 ? (
              <p className="text-app-muted px-4 py-5 text-center text-sm">
                Es sind keine aktiven Planungseinträge verfügbar.
              </p>
            ) : (
              <div className="max-h-72 [scrollbar-gutter:stable] space-y-1.5 overflow-y-auto overscroll-contain p-2">
                {entryTypes.map((entryType) => {
                  const selected =
                    currentEntry?.sourceEntryTypeId === entryType.id;
                  const hasTime = Boolean(
                    entryType.startTime && entryType.endTime,
                  );

                  return (
                    <button
                      key={entryType.id}
                      type="button"
                      className={[
                        'text-app-text hover:border-app-primary-border hover:bg-app-primary-subtle grid w-full cursor-pointer grid-cols-[auto_1fr_auto] items-center gap-3 rounded-md border px-3 py-2 text-left transition-colors',
                        selected
                          ? 'border-app-primary bg-app-primary-subtle'
                          : 'border-app-border bg-app-surface',
                      ].join(' ')}
                      aria-pressed={selected}
                      onClick={() => applyChange(() => onSelect(entryType))}
                    >
                      <span className="border-app-border bg-app-surface-muted max-w-24 min-w-10 rounded-md border px-2 py-1 text-center text-xs font-semibold break-words">
                        {entryType.code}
                      </span>
                      <span className="text-app-muted flex min-w-0 items-center gap-1.5 text-xs font-medium tabular-nums">
                        {hasTime ? (
                          <Clock aria-hidden="true" size={14} />
                        ) : (
                          <span
                            className="relative inline-flex"
                            aria-hidden="true"
                          >
                            <Clock size={14} />
                            <span className="absolute top-1/2 left-0 h-px w-full -rotate-45 bg-current" />
                          </span>
                        )}
                        <span>{formatEntryTypeTime(entryType)}</span>
                      </span>
                      {selected ? (
                        <span className="text-app-primary-foreground flex items-center gap-1 text-xs font-semibold">
                          <Check aria-hidden="true" size={15} />
                          Aktuell
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {currentEntry ? (
          <div className="border-app-border bg-app-surface-muted border-t p-2">
            <Button
              variant="danger"
              className="w-full"
              onClick={() => applyChange(onRemove)}
            >
              <Trash2 aria-hidden="true" size={16} />
              Eintrag entfernen
            </Button>
          </div>
        ) : null}
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
  const selectedEmployee = selectedEmployeeId
    ? employees.find((employee) => employee.id === selectedEmployeeId)
    : null;

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          className={`${selectedEmployeeId ? '' : 'planner-empty-field'} hover:bg-app-primary-selected min-h-8 w-full rounded px-2 py-1 text-center`}
          aria-label={`${date}, ${selectedEmployee ? `Rufbereitschaft ${selectedEmployee.firstName} ${selectedEmployee.lastName} bearbeiten` : 'keine Rufbereitschaft, bearbeiten'}`}
        >
          {selectedEmployee ? formatOnCallName(selectedEmployee) : null}
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
  schoolHolidayNames: readonly string[];
  schoolHolidayBoundaryLabel: string | null;
  onApply: (note: string) => void;
};

/** Bearbeitet eine Tagesbemerkung erst nach ausdrücklichem Übernehmen. */
export function DayNoteCellPopover({
  date,
  note,
  schoolHolidayNames,
  schoolHolidayBoundaryLabel,
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
          className="hover:bg-app-primary-selected min-h-8 w-full rounded px-2 py-1 text-center [overflow-wrap:anywhere] whitespace-pre-wrap"
          aria-label={`${date}${
            schoolHolidayNames.length > 0
              ? `, Schulferien Brandenburg, ${schoolHolidayNames.join(', ')}`
              : ''
          }, Bemerkung bearbeiten${note ? `, aktuell ${note}` : ''}`}
        >
          {schoolHolidayBoundaryLabel ? (
            <span className="block font-semibold text-amber-900">
              {schoolHolidayBoundaryLabel}
            </span>
          ) : null}
          {note ? (
            <span className={schoolHolidayBoundaryLabel ? 'mt-0.5 block' : ''}>
              {note}
            </span>
          ) : null}
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
