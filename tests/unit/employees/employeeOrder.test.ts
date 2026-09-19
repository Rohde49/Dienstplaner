import { describe, expect, it } from 'vitest';

import type { Employee } from '../../../src/shared/schemas';
import {
  moveEmployee,
  swapEmployee,
} from '../../../src/renderer/features/team/employeeOrder';

function createEmployee(id: string, firstName: string): Employee {
  return {
    id,
    firstName,
    lastName: 'Test',
    role: 'Erzieher',
    weeklyWorkingMinutes: 2_400,
    colorKey: 'blue',
    active: true,
    createdAt: '2026-09-19T10:00:00.000Z',
    updatedAt: '2026-09-19T10:00:00.000Z',
  };
}

const employees = [
  createEmployee('11111111-1111-4111-8111-111111111111', 'Anna'),
  createEmployee('22222222-2222-4222-8222-222222222222', 'Berta'),
  createEmployee('33333333-3333-4333-8333-333333333333', 'Clara'),
];

function firstNames(items: Employee[]): string[] {
  return items.map((employee) => employee.firstName);
}

describe('Reihenfolge der Mitarbeiter', () => {
  it('verschiebt einen Mitarbeiter vor eine Zielzeile', () => {
    expect(
      firstNames(
        moveEmployee(employees, employees[2].id, employees[0].id, 'before'),
      ),
    ).toEqual(['Clara', 'Anna', 'Berta']);
  });

  it('verschiebt einen Mitarbeiter hinter eine Zielzeile', () => {
    expect(
      firstNames(
        moveEmployee(employees, employees[0].id, employees[2].id, 'after'),
      ),
    ).toEqual(['Berta', 'Clara', 'Anna']);
  });

  it('verändert die Liste beim Ablegen an derselben Position nicht', () => {
    expect(
      moveEmployee(employees, employees[0].id, employees[1].id, 'before'),
    ).toEqual(employees);
  });

  it('verschiebt einen Mitarbeiter per Tastatur um genau eine Position', () => {
    expect(firstNames(swapEmployee(employees, employees[1].id, -1))).toEqual([
      'Berta',
      'Anna',
      'Clara',
    ]);
  });

  it('überschreitet bei der Tastaturbedienung keine Listengrenze', () => {
    expect(swapEmployee(employees, employees[0].id, -1)).toBe(employees);
    expect(swapEmployee(employees, employees[2].id, 1)).toBe(employees);
  });
});
