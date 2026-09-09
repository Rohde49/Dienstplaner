import { ClipboardList, ListPlus, Pencil } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import type { EntryType } from '../../../shared/schemas';
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
import { ENTRY_CATEGORY_LABELS } from './entryTypeLabels';
import { formatDuration } from './entryTypeTime';

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Die Planungseinträge konnten nicht geladen werden.';
}

function formatClockRange(entryType: EntryType): string {
  if (entryType.startTime === null || entryType.endTime === null) {
    return '–';
  }

  return `${entryType.startTime}–${entryType.endTime}`;
}

function formatWorkingTime(entryType: EntryType): string {
  return entryType.calculationType === 'weeklyWorkingTime'
    ? 'Wochenarbeitszeit ÷ 5'
    : formatDuration(entryType.timeValues.workingMinutes);
}

/** Lädt und verwaltet die sichtbare Übersicht der Eintragsarten. */
export function EntryTypesPage() {
  const [entryTypes, setEntryTypes] = useState<EntryType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
                      Kürzel
                    </th>
                    <th className="text-app-muted px-4 py-3 text-xs font-semibold">
                      Bezeichnung
                    </th>
                    <th className="text-app-muted px-4 py-3 text-xs font-semibold">
                      Kategorie
                    </th>
                    <th className="text-app-muted px-4 py-3 text-xs font-semibold">
                      Uhrzeit
                    </th>
                    <th className="text-app-muted px-4 py-3 text-xs font-semibold">
                      Arbeitszeit
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
                  {entryTypes.map((entryType) => (
                    <tr
                      key={entryType.id}
                      className="hover:bg-app-surface-muted"
                    >
                      <td className="text-app-text px-4 py-3 font-semibold">
                        {entryType.code}
                      </td>
                      <td className="text-app-text px-4 py-3 text-sm">
                        {entryType.name}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="neutral">
                          {ENTRY_CATEGORY_LABELS[entryType.category]}
                        </Badge>
                      </td>
                      <td className="text-app-muted px-4 py-3 text-sm tabular-nums">
                        {formatClockRange(entryType)}
                      </td>
                      <td className="text-app-muted px-4 py-3 text-sm tabular-nums">
                        {formatWorkingTime(entryType)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={entryType.active ? 'success' : 'neutral'}
                        >
                          {entryType.active ? 'Aktiv' : 'Inaktiv'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <EntryTypeDialog
                            entryType={entryType}
                            trigger={
                              <IconButton
                                label={`${entryType.code} – ${entryType.name} bearbeiten`}
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
                            onDeleted={(deletedEntryTypeId) =>
                              setEntryTypes((currentEntryTypes) =>
                                currentEntryTypes.filter(
                                  (currentEntryType) =>
                                    currentEntryType.id !== deletedEntryTypeId,
                                ),
                              )
                            }
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
