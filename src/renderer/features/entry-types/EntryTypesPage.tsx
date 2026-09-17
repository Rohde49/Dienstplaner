import { ClipboardList, Clock3, ListPlus, Pencil } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
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
        </Toolbar>

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
              <table className="w-full border-collapse text-left">
                <thead className="border-app-border bg-app-surface-muted border-b">
                  <tr>
                    <th className="text-app-muted px-4 py-3 text-xs font-semibold">
                      Planungseintrag
                    </th>
                    <th className="text-app-muted px-4 py-3 text-xs font-semibold">
                      Uhrzeiten
                    </th>
                    <th className="text-app-muted px-4 py-3 text-xs font-semibold">
                      Berechnungsart
                    </th>
                    <th className="text-app-muted px-4 py-3 text-xs font-semibold">
                      Reine Arbeitszeit
                    </th>
                    <th className="text-app-muted px-4 py-3 text-xs font-semibold">
                      Status
                    </th>
                    <th className="w-24 px-4 py-3 text-right">
                      <span className="sr-only">Aktionen</span>
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-app-border divide-y">
                  {entryTypes.map((entryType) => {
                    const isStatusUpdating = statusUpdatingIds.has(
                      entryType.id,
                    );

                    return (
                      <tr
                        key={entryType.id}
                        className="hover:bg-app-surface-muted"
                        aria-busy={isStatusUpdating}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Badge variant="primary" className="shrink-0">
                              {entryType.code}
                            </Badge>
                            <span className="text-app-text text-sm font-medium">
                              {entryType.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <EntryTypeClockTimes entryType={entryType} />
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="neutral">
                            {CALCULATION_TYPE_LABELS[entryType.calculationType]}
                          </Badge>
                        </td>
                        <td className="text-app-muted px-4 py-3 text-sm tabular-nums">
                          {formatPureWorkingTime(entryType)}
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            size="sm"
                            variant="secondary"
                            role="switch"
                            aria-checked={entryType.active}
                            aria-label={`${entryType.code} ${entryType.active ? 'deaktivieren' : 'aktivieren'}`}
                            disabled={isStatusUpdating}
                            className={
                              entryType.active
                                ? 'border-app-success-border bg-app-success-subtle text-app-success hover:bg-app-success-subtle'
                                : 'bg-app-surface-muted text-app-muted'
                            }
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
                          </Button>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1">
                            <EntryTypeDialog
                              entryType={entryType}
                              trigger={
                                <IconButton
                                  label={`${entryType.code} – ${entryType.name} bearbeiten`}
                                  disabled={isStatusUpdating}
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
                              disabled={isStatusUpdating}
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
