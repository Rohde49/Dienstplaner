import { GripVertical, Pencil, UserPlus, Users } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useState,
  type DragEvent as ReactDragEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { toast } from 'sonner';

import type { Employee } from '../../../shared/schemas';
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
import { EMPLOYEE_COLOR_STYLES } from '../../styles/employeeColors';
import { DeleteEmployeeDialog } from './DeleteEmployeeDialog';
import { EmployeeDialog } from './EmployeeDialog';
import {
  moveEmployee,
  swapEmployee,
  type EmployeeDropPosition,
} from './employeeOrder';
import { formatWeeklyWorkingTime } from './employeeWorkingTime';

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Die Mitarbeiterdaten konnten nicht geladen werden.';
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
  employeeId: string;
  position: EmployeeDropPosition;
};

/** Lädt und verwaltet die sichtbare Mitarbeiterübersicht. */
export function TeamPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusUpdatingIds, setStatusUpdatingIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [draggedEmployeeId, setDraggedEmployeeId] = useState<string | null>(
    null,
  );
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const [reorderingEmployeeId, setReorderingEmployeeId] = useState<
    string | null
  >(null);
  const [reorderAnnouncement, setReorderAnnouncement] = useState('');

  /** Lädt die Mitarbeiter neu und aktualisiert Lade- und Fehlerzustand. */
  const loadEmployees = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const loadedEmployees = await window.dienstplaner.employees.list();
      setEmployees(loadedEmployees);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEmployees();
  }, [loadEmployees]);

  async function toggleEmployeeStatus(employee: Employee): Promise<void> {
    setStatusUpdatingIds((currentIds) => new Set(currentIds).add(employee.id));

    try {
      const updatedEmployee = await window.dienstplaner.employees.update(
        employee.id,
        {
          firstName: employee.firstName,
          lastName: employee.lastName,
          role: employee.role,
          weeklyWorkingMinutes: employee.weeklyWorkingMinutes,
          colorKey: employee.colorKey,
          active: !employee.active,
        },
      );

      setEmployees((currentEmployees) =>
        currentEmployees.map((currentEmployee) =>
          currentEmployee.id === updatedEmployee.id
            ? updatedEmployee
            : currentEmployee,
        ),
      );
    } catch (error) {
      toast.error(getStatusErrorMessage(error));
    } finally {
      setStatusUpdatingIds((currentIds) => {
        const nextIds = new Set(currentIds);
        nextIds.delete(employee.id);
        return nextIds;
      });
    }
  }

  async function saveEmployeeOrder(
    nextEmployees: Employee[],
    movedEmployeeId: string,
  ): Promise<void> {
    if (
      nextEmployees.every(
        (employee, index) => employee.id === employees[index]?.id,
      )
    ) {
      return;
    }

    const previousEmployees = employees;
    setEmployees(nextEmployees);
    setReorderingEmployeeId(movedEmployeeId);
    setReorderAnnouncement('');

    try {
      const savedEmployees = await window.dienstplaner.employees.reorder(
        nextEmployees.map((employee) => employee.id),
      );
      const movedEmployee = savedEmployees.find(
        (employee) => employee.id === movedEmployeeId,
      );
      const movedEmployeeIndex = savedEmployees.findIndex(
        (employee) => employee.id === movedEmployeeId,
      );

      setEmployees(savedEmployees);
      setReorderAnnouncement(
        movedEmployee
          ? `${movedEmployee.firstName} ${movedEmployee.lastName} wurde an Position ${movedEmployeeIndex + 1} verschoben.`
          : 'Die neue Reihenfolge wurde gespeichert.',
      );
    } catch (error) {
      setEmployees(previousEmployees);
      toast.error(getReorderErrorMessage(error));
    } finally {
      setReorderingEmployeeId(null);
    }
  }

  function handleDragStart(
    event: ReactDragEvent<HTMLButtonElement>,
    employeeId: string,
  ): void {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', employeeId);

    const tableRow = event.currentTarget.closest('tr');
    if (tableRow) {
      event.dataTransfer.setDragImage(tableRow, 20, tableRow.clientHeight / 2);
    }

    setDraggedEmployeeId(employeeId);
    setDropTarget(null);
    setReorderAnnouncement('');
  }

  function handleDragOver(
    event: ReactDragEvent<HTMLTableRowElement>,
    targetEmployeeId: string,
  ): void {
    if (draggedEmployeeId === null || draggedEmployeeId === targetEmployeeId) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';

    const rowBounds = event.currentTarget.getBoundingClientRect();
    const position =
      event.clientY < rowBounds.top + rowBounds.height / 2 ? 'before' : 'after';

    setDropTarget((currentTarget) =>
      currentTarget?.employeeId === targetEmployeeId &&
      currentTarget.position === position
        ? currentTarget
        : { employeeId: targetEmployeeId, position },
    );
  }

  function handleDrop(event: ReactDragEvent<HTMLTableRowElement>): void {
    event.preventDefault();

    const sourceId =
      draggedEmployeeId ?? event.dataTransfer.getData('text/plain');
    const currentDropTarget = dropTarget;

    setDraggedEmployeeId(null);
    setDropTarget(null);

    if (!sourceId || currentDropTarget === null) {
      return;
    }

    void saveEmployeeOrder(
      moveEmployee(
        employees,
        sourceId,
        currentDropTarget.employeeId,
        currentDropTarget.position,
      ),
      sourceId,
    );
  }

  function handleReorderKeyDown(
    event: ReactKeyboardEvent<HTMLButtonElement>,
    employeeId: string,
  ): void {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
      return;
    }

    event.preventDefault();
    void saveEmployeeOrder(
      swapEmployee(employees, employeeId, event.key === 'ArrowUp' ? -1 : 1),
      employeeId,
    );
  }

  const isReordering = reorderingEmployeeId !== null;
  const isReorderBlocked =
    isReordering || statusUpdatingIds.size > 0 || employees.length < 2;

  return (
    <>
      <PageHeader
        title="Team"
        description="Mitarbeiter-Stammdaten verwalten"
        actions={
          <EmployeeDialog
            usedColorKeys={employees.map((employee) => employee.colorKey)}
            trigger={
              <Button>
                <UserPlus aria-hidden="true" size={17} />
                Mitarbeiter anlegen
              </Button>
            }
            onSaved={(createdEmployee) =>
              setEmployees((currentEmployees) => [
                ...currentEmployees,
                createdEmployee,
              ])
            }
          />
        }
      />

      <div className="space-y-4 p-6 lg:p-8">
        <Toolbar>
          <span className="text-app-muted text-sm">Mitarbeiter:</span>
          <Badge variant="primary">{employees.length}</Badge>

          <span className="text-app-muted ml-2 text-sm">Aktiv:</span>
          <Badge variant="success">
            {employees.filter((employee) => employee.active).length}
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
              <Spinner label="Mitarbeiter werden geladen" />
              <span className="text-app-muted text-sm">
                Mitarbeiter werden geladen …
              </span>
            </div>
          ) : errorMessage ? (
            <div className="space-y-4 p-6">
              <Alert title="Laden fehlgeschlagen" variant="danger">
                {errorMessage}
              </Alert>

              <Button variant="secondary" onClick={() => void loadEmployees()}>
                Erneut laden
              </Button>
            </div>
          ) : employees.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Noch keine Mitarbeiter vorhanden"
              description="Lege den ersten Mitarbeiter an, um mit der Teamverwaltung zu beginnen."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] table-fixed border-collapse text-left">
                <colgroup>
                  <col className="w-14" />
                  <col className="w-[31%]" />
                  <col className="w-[23%]" />
                  <col />
                  <col className="w-28" />
                  <col className="w-24" />
                </colgroup>
                <thead className="border-app-border bg-app-surface-muted border-b">
                  <tr>
                    <th className="border-app-border/70 border-r px-2 py-3 text-center">
                      <span className="sr-only">Reihenfolge</span>
                    </th>
                    <th className="text-app-muted px-3 py-3 text-xs font-semibold">
                      Mitarbeiter
                    </th>
                    <th className="text-app-muted px-3 py-3 text-center text-xs font-semibold">
                      Rolle
                    </th>
                    <th className="text-app-muted px-3 py-3 text-center text-xs font-semibold">
                      Wochenarbeitszeit
                    </th>
                    <th className="border-app-border/70 text-app-muted border-l px-3 py-3 text-center text-xs font-semibold">
                      Status
                    </th>
                    <th className="border-app-border/70 text-app-muted border-l px-3 py-3 text-center text-xs font-semibold">
                      Aktionen
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-app-border divide-y">
                  {employees.map((employee) => {
                    const colorStyle = EMPLOYEE_COLOR_STYLES[employee.colorKey];
                    const isStatusUpdating = statusUpdatingIds.has(employee.id);
                    const dropPosition =
                      dropTarget?.employeeId === employee.id
                        ? dropTarget.position
                        : null;
                    const dropIndicatorClass =
                      dropPosition === 'before'
                        ? 'border-t-2 border-t-app-primary'
                        : dropPosition === 'after'
                          ? 'border-b-2 border-b-app-primary'
                          : '';
                    const employeeName = `${employee.firstName} ${employee.lastName}`;

                    return (
                      <tr
                        key={employee.id}
                        className={[
                          'hover:bg-app-surface-muted transition-[background-color,opacity]',
                          draggedEmployeeId === employee.id ? 'opacity-40' : '',
                        ].join(' ')}
                        aria-busy={
                          isStatusUpdating ||
                          reorderingEmployeeId === employee.id
                        }
                        onDragOver={(event) =>
                          handleDragOver(event, employee.id)
                        }
                        onDrop={handleDrop}
                      >
                        <td
                          className={`border-app-border/70 border-r px-2 py-2 text-center ${dropIndicatorClass}`}
                        >
                          <IconButton
                            label={`${employeeName} verschieben. Mit den Pfeiltasten nach oben oder unten bewegen.`}
                            className="!size-8 cursor-grab active:cursor-grabbing"
                            disabled={isReorderBlocked}
                            draggable={!isReorderBlocked}
                            onDragStart={(event) =>
                              handleDragStart(event, employee.id)
                            }
                            onDragEnd={() => {
                              setDraggedEmployeeId(null);
                              setDropTarget(null);
                            }}
                            onKeyDown={(event) =>
                              handleReorderKeyDown(event, employee.id)
                            }
                          >
                            {reorderingEmployeeId === employee.id ? (
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
                          <div className="flex min-w-0 items-center gap-3">
                            <span
                              aria-hidden="true"
                              className={`size-2.5 shrink-0 rounded-full ${colorStyle.selectionDotClass}`}
                            />
                            <span className="text-app-text min-w-0 text-sm font-medium">
                              {employeeName}
                            </span>
                          </div>
                        </td>

                        <td
                          className={`px-3 py-3 text-center ${dropIndicatorClass}`}
                        >
                          <Badge variant="neutral">{employee.role}</Badge>
                        </td>

                        <td
                          className={`text-app-muted px-3 py-3 text-center text-sm tabular-nums ${dropIndicatorClass}`}
                        >
                          {formatWeeklyWorkingTime(
                            employee.weeklyWorkingMinutes,
                          )}
                        </td>

                        <td
                          className={`border-app-border/70 border-l px-3 py-3 text-center ${dropIndicatorClass}`}
                        >
                          <button
                            type="button"
                            role="switch"
                            aria-checked={employee.active}
                            aria-label={`${employeeName} ${employee.active ? 'deaktivieren' : 'aktivieren'}`}
                            disabled={isStatusUpdating || isReordering}
                            className={[
                              'focus-visible:outline-app-primary inline-flex h-7 min-w-20 items-center justify-center gap-2 rounded-full border px-3 text-xs font-semibold transition-[background-color,border-color,color,box-shadow,transform] focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.98] disabled:cursor-wait disabled:opacity-70',
                              employee.active
                                ? 'border-app-success-border bg-app-success-subtle text-app-success hover:shadow-sm'
                                : 'border-app-border bg-app-surface-muted text-app-muted hover:border-app-border-strong hover:bg-app-surface-hover hover:text-app-text',
                            ].join(' ')}
                            onClick={() => void toggleEmployeeStatus(employee)}
                          >
                            {isStatusUpdating ? (
                              <Spinner
                                size="sm"
                                label="Status wird gespeichert"
                                className="text-current"
                              />
                            ) : null}
                            {employee.active ? 'Aktiv' : 'Inaktiv'}
                          </button>
                        </td>

                        <td
                          className={`border-app-border/70 border-l px-3 py-3 text-center ${dropIndicatorClass}`}
                        >
                          <div className="flex justify-center gap-1">
                            <EmployeeDialog
                              employee={employee}
                              usedColorKeys={employees
                                .filter(
                                  (currentEmployee) =>
                                    currentEmployee.id !== employee.id,
                                )
                                .map(
                                  (currentEmployee) => currentEmployee.colorKey,
                                )}
                              trigger={
                                <IconButton
                                  label={`${employeeName} bearbeiten`}
                                  className="border-app-primary-border bg-app-primary-subtle !text-app-primary hover:!bg-app-primary-selected hover:!text-app-primary-hover !size-8 border"
                                  disabled={isStatusUpdating || isReordering}
                                >
                                  <Pencil aria-hidden="true" size={17} />
                                </IconButton>
                              }
                              onSaved={(updatedEmployee) =>
                                setEmployees((currentEmployees) =>
                                  currentEmployees.map((currentEmployee) =>
                                    currentEmployee.id === updatedEmployee.id
                                      ? updatedEmployee
                                      : currentEmployee,
                                  ),
                                )
                              }
                            />

                            <DeleteEmployeeDialog
                              employee={employee}
                              disabled={isStatusUpdating || isReordering}
                              onDeleted={(deletedEmployeeId) =>
                                setEmployees((currentEmployees) =>
                                  currentEmployees.filter(
                                    (currentEmployee) =>
                                      currentEmployee.id !== deletedEmployeeId,
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
