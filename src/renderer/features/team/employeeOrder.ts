import type { Employee } from '../../../shared/schemas';

export type EmployeeDropPosition = 'before' | 'after';

/** Ordnet einen Mitarbeiter relativ zu einer Zielzeile ein. */
export function moveEmployee(
  employees: Employee[],
  sourceId: string,
  targetId: string,
  position: EmployeeDropPosition,
): Employee[] {
  const sourceIndex = employees.findIndex(
    (employee) => employee.id === sourceId,
  );
  const targetIndex = employees.findIndex(
    (employee) => employee.id === targetId,
  );

  if (sourceIndex === -1 || targetIndex === -1 || sourceId === targetId) {
    return employees;
  }

  const nextEmployees = [...employees];
  const [movedEmployee] = nextEmployees.splice(sourceIndex, 1);
  let insertionIndex = targetIndex + (position === 'after' ? 1 : 0);

  if (sourceIndex < insertionIndex) {
    insertionIndex -= 1;
  }

  nextEmployees.splice(insertionIndex, 0, movedEmployee);
  return nextEmployees;
}

/** Verschiebt einen Mitarbeiter für die Tastaturbedienung um eine Position. */
export function swapEmployee(
  employees: Employee[],
  employeeId: string,
  direction: -1 | 1,
): Employee[] {
  const sourceIndex = employees.findIndex(
    (employee) => employee.id === employeeId,
  );
  const targetIndex = sourceIndex + direction;

  if (
    sourceIndex === -1 ||
    targetIndex < 0 ||
    targetIndex >= employees.length
  ) {
    return employees;
  }

  const nextEmployees = [...employees];
  [nextEmployees[sourceIndex], nextEmployees[targetIndex]] = [
    nextEmployees[targetIndex],
    nextEmployees[sourceIndex],
  ];
  return nextEmployees;
}
