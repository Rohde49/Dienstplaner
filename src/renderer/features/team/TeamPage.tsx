import { Pencil, UserPlus, Users } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import type { Employee } from '../../../shared/schemas';
import { PageHeader, Toolbar } from '../../components/layout';
import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  Spinner,
  IconButton,
} from '../../components/ui';
import { EMPLOYEE_COLOR_STYLES } from './employeeColorStyles';
import { EmployeeDialog } from './EmployeeDialog';

function formatWeeklyWorkingTime(minutes: number): string {
  const hours = minutes / 60;

  return `${new Intl.NumberFormat('de-DE', {
    maximumFractionDigits: 2,
  }).format(hours)} Std./Woche`;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Die Mitarbeiterdaten konnten nicht geladen werden.';
}

export function TeamPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  return (
    <>
      <PageHeader
        title="Team"
        description="Mitarbeiter und ihre Planungsdaten verwalten."
        actions={
          <EmployeeDialog
            trigger={
              <Button>
                <UserPlus aria-hidden="true" size={17} />
                Mitarbeiter hinzufügen
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
        </Toolbar>

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
              <table className="w-full border-collapse text-left">
                <thead className="border-app-border border-b bg-slate-50">
                  <tr>
                    <th className="text-app-muted px-4 py-3 text-xs font-semibold">
                      Mitarbeiter
                    </th>
                    <th className="text-app-muted px-4 py-3 text-xs font-semibold">
                      Rolle
                    </th>
                    <th className="text-app-muted px-4 py-3 text-xs font-semibold">
                      Wochenarbeitszeit
                    </th>
                    <th className="text-app-muted px-4 py-3 text-xs font-semibold">
                      Status
                    </th>
                    <th className="w-16 px-4 py-3 text-right">
                      <span className="sr-only">Aktionen</span>
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-app-border divide-y">
                  {employees.map((employee) => {
                    const colorStyle = EMPLOYEE_COLOR_STYLES[employee.colorKey];

                    return (
                      <tr key={employee.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span
                              aria-hidden="true"
                              className={`size-2.5 shrink-0 rounded-full ${colorStyle.dotClass}`}
                            />
                            <span className="text-app-text font-medium">
                              {employee.firstName} {employee.lastName}
                            </span>
                          </div>
                        </td>

                        <td className="text-app-muted px-4 py-3 text-sm">
                          {employee.role}
                        </td>

                        <td className="text-app-muted px-4 py-3 text-sm">
                          {formatWeeklyWorkingTime(
                            employee.weeklyWorkingMinutes,
                          )}
                        </td>

                        <td className="px-4 py-3">
                          <Badge
                            variant={employee.active ? 'success' : 'neutral'}
                          >
                            {employee.active ? 'Aktiv' : 'Inaktiv'}
                          </Badge>
                        </td>

                        <td className="px-4 py-3 text-right">
                          <EmployeeDialog
                            employee={employee}
                            trigger={
                              <IconButton
                                label={`${employee.firstName} ${employee.lastName} bearbeiten`}
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
