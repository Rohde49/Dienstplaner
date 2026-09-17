import { describe, expect, it } from 'vitest';

import {
  EMPLOYEE_COLOR_KEYS,
  EMPLOYEE_ROLES,
  employeeColorKeySchema,
  employeeInputSchema,
  employeesFileSchema,
} from '../../../src/shared/schemas';

const validInput = {
  firstName: 'Max',
  lastName: 'Mustermann',
  role: 'Erzieher',
  weeklyWorkingMinutes: 2_340,
  colorKey: 'blue',
  active: true,
} as const;

const validEmployee = {
  ...validInput,
  id: 'd46ab9b7-a5a8-44c7-8c53-2297926b2ceb',
  createdAt: '2026-09-11T12:00:00.000Z',
  updatedAt: '2026-09-11T12:00:00.000Z',
} as const;

describe('Mitarbeiterschema', () => {
  it.each(EMPLOYEE_COLOR_KEYS)(
    'akzeptiert die Mitarbeiterfarbe %s',
    (colorKey) => {
      expect(employeeColorKeySchema.safeParse(colorKey).success).toBe(true);
      expect(
        employeeInputSchema.safeParse({ ...validInput, colorKey }).success,
      ).toBe(true);
    },
  );

  it('lehnt unbekannte Farbschlüssel ab', () => {
    expect(employeeColorKeySchema.safeParse('black').success).toBe(false);
    expect(
      employeeInputSchema.safeParse({ ...validInput, colorKey: 'black' })
        .success,
    ).toBe(false);
  });

  it.each(EMPLOYEE_ROLES)('akzeptiert die Rolle %s', (role) => {
    expect(employeeInputSchema.safeParse({ ...validInput, role }).success).toBe(
      true,
    );
  });

  it('lehnt frei eingegebene Rollen ab', () => {
    expect(
      employeeInputSchema.safeParse({ ...validInput, role: 'Leitung' }).success,
    ).toBe(false);
  });

  it('entfernt äußere Leerzeichen aus Namen', () => {
    expect(
      employeeInputSchema.parse({
        ...validInput,
        firstName: '  Max ',
        lastName: ' Mustermann  ',
      }),
    ).toMatchObject({ firstName: 'Max', lastName: 'Mustermann' });
  });

  it('akzeptiert eine Wochenarbeitszeit von 0 Minuten', () => {
    expect(
      employeeInputSchema.safeParse({
        ...validInput,
        weeklyWorkingMinutes: 0,
      }).success,
    ).toBe(true);
  });

  it('lehnt Wochenarbeitszeiten außerhalb des Fünf-Minuten-Rasters ab', () => {
    expect(
      employeeInputSchema.safeParse({
        ...validInput,
        weeklyWorkingMinutes: 2_341,
      }).success,
    ).toBe(false);
  });
});

describe('Mitarbeiterdatei', () => {
  it('verwendet Schema-Version 3', () => {
    expect(
      employeesFileSchema.safeParse({
        schemaVersion: 3,
        updatedAt: validEmployee.updatedAt,
        employees: [validEmployee],
      }).success,
    ).toBe(true);

    expect(
      employeesFileSchema.safeParse({
        schemaVersion: 2,
        updatedAt: validEmployee.updatedAt,
        employees: [validEmployee],
      }).success,
    ).toBe(false);
  });

  it('lehnt doppelte Mitarbeiter-IDs ab', () => {
    expect(
      employeesFileSchema.safeParse({
        schemaVersion: 3,
        updatedAt: validEmployee.updatedAt,
        employees: [
          validEmployee,
          {
            ...validEmployee,
            firstName: 'Erika',
          },
        ],
      }).success,
    ).toBe(false);
  });
});
