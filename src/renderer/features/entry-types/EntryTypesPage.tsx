import {
  ClipboardList,
  Clock3,
  GripVertical,
  ListPlus,
  Pencil,
} from 'lucide-react';
import {
  useCallback,
  useEffect,
  useState,
  type DragEvent as ReactDragEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { toast } from 'sonner';

import type { EntryType } from '../../../shared/schemas';
import { formatDuration } from '../../../shared/calculations';
import { PageHeader, Toolbar } from '../../components/layout';
import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  IconButton,
  Spinner,
} from '../../components/ui';
import { DeleteEntryTypeDialog } from './DeleteEntryTypeDialog';
import { EntryTypeDialog } from './EntryTypeDialog';
import { CALCULATION_TYPE_LABELS } from './calculationTypeLabels';
import {
  moveEntryType,
  swapEntryType,
  type EntryTypeDropPosition,
} from './entryTypeOrder';

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Die Planungseinträge konnten nicht geladen werden.';
}

function getStatusErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Der Status konnte nicht gespeichert werden.';
}

function getReorderErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Die Reihenfolge konnte nicht gespeichert werden.';
}

type DropTarget = {
  entryTypeId: string;
  position: EntryTypeDropPosition;
};

function EntryTypeClockTimes({ entryType }: { entryType: EntryType }) {
  if (entryType.startTime === null || entryType.endTime === null) {
    return (
      <span className="text-app-muted flex items-center gap-2 text-sm">
        <Clock3 aria-hidden="true" size={16} />
        Keine Uhrzeit
      </span>
    );
  }

  return (
    <div className="flex items-start gap-2">
      <Clock3
        aria-hidden="true"
        className="text-app-muted mt-0.5 shrink-0"
        size={16}
      />

      <dl className="grid grid-cols-[auto_auto] gap-x-2 gap-y-0.5 text-xs">
        <dt className="text-app-muted">Beginn:</dt>
        <dd className="text-app-text font-medium tabular-nums">
          {entryType.startTime}
        </dd>
        <dt className="text-app-muted">Ende:</dt>
        <dd className="text-app-text font-medium tabular-nums">
          {entryType.endTime}
        </dd>
      </dl>
    </div>
  );
}

function formatPureWorkingTime(entryType: EntryType): string {
  return entryType.calculationType === 'weeklyWorkingTime'
    ? 'Wochenarbeitszeit ÷ 5'
    : formatDuration(entryType.timeValues.workingWithoutNightReadinessMinutes);
}

/** Lädt und verwaltet die sichtbare Übersicht der Eintragsarten. */
export function EntryTypesPage() {
  const [entryTypes, setEntryTypes] = useState<EntryType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusUpdatingIds, setStatusUpdatingIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [draggedEntryTypeId, setDraggedEntryTypeId] = useState<string | null>(
    null,
  );
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const [reorderingEntryTypeId, setReorderingEntryTypeId] = useState<
    string | null
  >(null);
  const [reorderAnnouncement, setReorderAnnouncement] = useState('');

  const loadEntryTypes = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const loadedEntryTypes = await window.dienstplaner.entryTypes.list();
      setEntryTypes(loadedEntryTypes);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEntryTypes();
  }, [loadEntryTypes]);

  async function toggleEntryTypeStatus(entryType: EntryType): Promise<void> {
    setStatusUpdatingIds((currentIds) => new Set(currentIds).add(entryType.id));

    try {
      const updatedEntryType = await window.dienstplaner.entryTypes.update(
        entryType.id,
        {
          code: entryType.code,
          name: entryType.name,
          calculationType: entryType.calculationType,
          startTime: entryType.startTime,
          endTime: entryType.endTime,
          timeValues: entryType.timeValues,
          active: !entryType.active,
        },
      );

      setEntryTypes((currentEntryTypes) =>
        currentEntryTypes.map((currentEntryType) =>
          currentEntryType.id === updatedEntryType.id
            ? updatedEntryType
            : currentEntryType,
        ),
      );
    } catch (error) {
      toast.error(getStatusErrorMessage(error));
    } finally {
      setStatusUpdatingIds((currentIds) => {
        const nextIds = new Set(currentIds);
        nextIds.delete(entryType.id);
        return nextIds;
      });
    }
  }

  async function saveEntryTypeOrder(
    nextEntryTypes: EntryType[],
    movedEntryTypeId: string,
  ): Promise<void> {
    if (
      nextEntryTypes.every(
        (entryType, index) => entryType.id === entryTypes[index]?.id,
      )
    ) {
      return;
    }

    const previousEntryTypes = entryTypes;
    setEntryTypes(nextEntryTypes);
    setReorderingEntryTypeId(movedEntryTypeId);
    setReorderAnnouncement('');

    try {
      const savedEntryTypes = await window.dienstplaner.entryTypes.reorder(
        nextEntryTypes.map((entryType) => entryType.id),
      );
      const movedEntryType = savedEntryTypes.find(
        (entryType) => entryType.id === movedEntryTypeId,
      );
      const movedEntryTypeIndex = savedEntryTypes.findIndex(
        (entryType) => entryType.id === movedEntryTypeId,
      );

      setEntryTypes(savedEntryTypes);
      setReorderAnnouncement(
        movedEntryType
          ? `${movedEntryType.code} – ${movedEntryType.name} wurde an Position ${movedEntryTypeIndex + 1} verschoben.`
          : 'Die neue Reihenfolge wurde gespeichert.',
      );
    } catch (error) {
      setEntryTypes(previousEntryTypes);
      toast.error(getReorderErrorMessage(error));
    } finally {
      setReorderingEntryTypeId(null);
    }
  }

  function handleDragStart(
    event: ReactDragEvent<HTMLButtonElement>,
    entryTypeId: string,
  ): void {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', entryTypeId);

    const tableRow = event.currentTarget.closest('tr');
    if (tableRow) {
      event.dataTransfer.setDragImage(tableRow, 20, tableRow.clientHeight / 2);
    }

    setDraggedEntryTypeId(entryTypeId);
    setDropTarget(null);
    setReorderAnnouncement('');
  }

  function handleDragOver(
    event: ReactDragEvent<HTMLTableRowElement>,
    targetEntryTypeId: string,
  ): void {
    if (
      draggedEntryTypeId === null ||
      draggedEntryTypeId === targetEntryTypeId
    ) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';

    const rowBounds = event.currentTarget.getBoundingClientRect();
    const position =
      event.clientY < rowBounds.top + rowBounds.height / 2 ? 'before' : 'after';

    setDropTarget((currentTarget) =>
      currentTarget?.entryTypeId === targetEntryTypeId &&
      currentTarget.position === position
        ? currentTarget
        : { entryTypeId: targetEntryTypeId, position },
    );
  }

  function handleDrop(event: ReactDragEvent<HTMLTableRowElement>): void {
    event.preventDefault();

    const sourceId =
      draggedEntryTypeId ?? event.dataTransfer.getData('text/plain');
    const currentDropTarget = dropTarget;

    setDraggedEntryTypeId(null);
    setDropTarget(null);

    if (!sourceId || currentDropTarget === null) {
      return;
    }

    void saveEntryTypeOrder(
      moveEntryType(
        entryTypes,
        sourceId,
        currentDropTarget.entryTypeId,
        currentDropTarget.position,
      ),
      sourceId,
    );
  }

  function handleReorderKeyDown(
    event: ReactKeyboardEvent<HTMLButtonElement>,
    entryTypeId: string,
  ): void {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
      return;
    }

    event.preventDefault();
    void saveEntryTypeOrder(
      swapEntryType(entryTypes, entryTypeId, event.key === 'ArrowUp' ? -1 : 1),
      entryTypeId,
    );
  }

  const isReordering = reorderingEntryTypeId !== null;
  const isReorderBlocked =
    isReordering || statusUpdatingIds.size > 0 || entryTypes.length < 2;

  return (
    <>
      <PageHeader
        title="Planungseinträge"
        description="Planungseinträge-Stammdaten verwalten"
        actions={
          <EntryTypeDialog
            trigger={
              <Button>
                <ListPlus aria-hidden="true" size={17} />
                Planungseintrag anlegen
              </Button>
            }
            onSaved={(createdEntryType) =>
              setEntryTypes((currentEntryTypes) => [
                ...currentEntryTypes,
                createdEntryType,
              ])
            }
          />
        }
      />

      <div className="space-y-4 p-6 lg:p-8">
        <Toolbar>
          <span className="text-app-muted text-sm">Planungseinträge:</span>
          <Badge variant="primary">{entryTypes.length}</Badge>

          <span className="text-app-muted ml-2 text-sm">Aktiv:</span>
          <Badge variant="success">
            {entryTypes.filter((entryType) => entryType.active).length}
          </Badge>

          <span className="text-app-muted ml-auto flex items-center gap-1.5 text-xs">
            <GripVertical aria-hidden="true" size={15} />
            Reihenfolge am Griff ziehen
          </span>
        </Toolbar>

        <p className="sr-only" aria-live="polite">
          {reorderAnnouncement}
        </p>

        <Card className="overflow-hidden">
          {isLoading ? (
            <div className="flex min-h-56 items-center justify-center gap-3">
              <Spinner label="Planungseinträge werden geladen" />
              <span className="text-app-muted text-sm">
                Planungseinträge werden geladen …
              </span>
            </div>
          ) : errorMessage ? (
            <div className="space-y-4 p-6">
              <Alert title="Laden fehlgeschlagen" variant="danger">
                {errorMessage}
              </Alert>

              <Button variant="secondary" onClick={() => void loadEntryTypes()}>
                Erneut laden
              </Button>
            </div>
          ) : entryTypes.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="Noch keine Planungseinträge vorhanden"
              description="Lege den ersten Planungseintrag an, um Dienste, Abwesenheiten oder freie Tage einplanen zu können."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] table-fixed border-collapse text-left">
                <colgroup>
                  <col className="w-14" />
                  <col className="w-[27%]" />
                  <col className="w-[17%]" />
                  <col className="w-[19%]" />
                  <col />
                  <col className="w-28" />
                  <col className="w-24" />
                </colgroup>
                <thead className="border-app-border bg-app-surface-muted border-b">
                  <tr>
                    <th className="px-2 py-3">
                      <span className="sr-only">Reihenfolge</span>
                    </th>
                    <th className="text-app-muted px-3 py-3 text-xs font-semibold">
                      Planungseintrag
                    </th>
                    <th className="text-app-muted px-3 py-3 text-xs font-semibold">
                      Uhrzeiten
                    </th>
                    <th className="text-app-muted px-3 py-3 text-xs font-semibold">
                      Berechnungsart
                    </th>
                    <th className="text-app-muted px-3 py-3 text-xs font-semibold">
                      Reine Arbeitszeit
                    </th>
                    <th className="text-app-muted px-3 py-3 text-center text-xs font-semibold">
                      Status
                    </th>
                    <th className="text-app-muted px-3 py-3 text-right text-xs font-semibold">
                      Aktionen
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-app-border divide-y">
                  {entryTypes.map((entryType) => {
                    const isStatusUpdating = statusUpdatingIds.has(
                      entryType.id,
                    );
                    const dropPosition =
                      dropTarget?.entryTypeId === entryType.id
                        ? dropTarget.position
                        : null;
                    const dropIndicatorClass =
                      dropPosition === 'before'
                        ? 'border-t-2 border-t-app-primary'
                        : dropPosition === 'after'
                          ? 'border-b-2 border-b-app-primary'
                          : '';

                    return (
                      <tr
                        key={entryType.id}
                        className={[
                          'hover:bg-app-surface-muted transition-[background-color,opacity]',
                          draggedEntryTypeId === entryType.id
                            ? 'opacity-40'
                            : '',
                        ].join(' ')}
                        aria-busy={
                          isStatusUpdating ||
                          reorderingEntryTypeId === entryType.id
                        }
                        onDragOver={(event) =>
                          handleDragOver(event, entryType.id)
                        }
                        onDrop={handleDrop}
                      >
                        <td className={`px-2 py-2 ${dropIndicatorClass}`}>
                          <IconButton
                            label={`${entryType.code} – ${entryType.name} verschieben. Mit den Pfeiltasten nach oben oder unten bewegen.`}
                            className="!size-8 cursor-grab active:cursor-grabbing"
                            disabled={isReorderBlocked}
                            draggable={!isReorderBlocked}
                            onDragStart={(event) =>
                              handleDragStart(event, entryType.id)
                            }
                            onDragEnd={() => {
                              setDraggedEntryTypeId(null);
                              setDropTarget(null);
                            }}
                            onKeyDown={(event) =>
                              handleReorderKeyDown(event, entryType.id)
                            }
                          >
                            {reorderingEntryTypeId === entryType.id ? (
                              <Spinner
                                size="sm"
                                label="Reihenfolge wird gespeichert"
                                className="text-current"
                              />
                            ) : (
                              <GripVertical aria-hidden="true" size={18} />
                            )}
                          </IconButton>
                        </td>
                        <td className={`px-3 py-3 ${dropIndicatorClass}`}>
                          <div className="flex min-w-0 items-center gap-2.5">
                            <Badge variant="primary" className="shrink-0">
                              {entryType.code}
                            </Badge>
                            <span className="text-app-text min-w-0 text-sm font-medium">
                              {entryType.name}
                            </span>
                          </div>
                        </td>
                        <td className={`px-3 py-3 ${dropIndicatorClass}`}>
                          <EntryTypeClockTimes entryType={entryType} />
                        </td>
                        <td className={`px-3 py-3 ${dropIndicatorClass}`}>
                          <Badge variant="neutral">
                            {CALCULATION_TYPE_LABELS[entryType.calculationType]}
                          </Badge>
                        </td>
                        <td
                          className={`text-app-muted px-3 py-3 text-sm tabular-nums ${dropIndicatorClass}`}
                        >
                          {formatPureWorkingTime(entryType)}
                        </td>
                        <td
                          className={`px-3 py-3 text-center ${dropIndicatorClass}`}
                        >
                          <button
                            type="button"
                            role="switch"
                            aria-checked={entryType.active}
                            aria-label={`${entryType.code} ${entryType.active ? 'deaktivieren' : 'aktivieren'}`}
                            disabled={isStatusUpdating || isReordering}
                            className={[
                              'focus-visible:outline-app-primary inline-flex h-7 min-w-20 items-center justify-center gap-2 rounded-full border px-3 text-xs font-semibold transition-[background-color,border-color,color,box-shadow,transform] focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.98] disabled:cursor-wait disabled:opacity-70',
                              entryType.active
                                ? 'border-app-success-border bg-app-success-subtle text-app-success hover:shadow-sm'
                                : 'border-app-border bg-app-surface-muted text-app-muted hover:border-app-border-strong hover:bg-app-surface-hover hover:text-app-text',
                            ].join(' ')}
                            onClick={() =>
                              void toggleEntryTypeStatus(entryType)
                            }
                          >
                            {isStatusUpdating ? (
                              <Spinner
                                size="sm"
                                label="Status wird gespeichert"
                                className="text-current"
                              />
                            ) : null}
                            {entryType.active ? 'Aktiv' : 'Inaktiv'}
                          </button>
                        </td>
                        <td
                          className={`px-3 py-3 text-right ${dropIndicatorClass}`}
                        >
                          <div className="flex justify-end gap-1">
                            <EntryTypeDialog
                              entryType={entryType}
                              trigger={
                                <IconButton
                                  label={`${entryType.code} – ${entryType.name} bearbeiten`}
                                  disabled={isStatusUpdating || isReordering}
                                >
                                  <Pencil aria-hidden="true" size={17} />
                                </IconButton>
                              }
                              onSaved={(updatedEntryType) =>
                                setEntryTypes((currentEntryTypes) =>
                                  currentEntryTypes.map((currentEntryType) =>
                                    currentEntryType.id === updatedEntryType.id
                                      ? updatedEntryType
                                      : currentEntryType,
                                  ),
                                )
                              }
                            />

                            <DeleteEntryTypeDialog
                              entryType={entryType}
                              disabled={isStatusUpdating || isReordering}
                              onDeleted={(deletedEntryTypeId) =>
                                setEntryTypes((currentEntryTypes) =>
                                  currentEntryTypes.filter(
                                    (currentEntryType) =>
                                      currentEntryType.id !==
                                      deletedEntryTypeId,
                                  ),
                                )
                              }
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
