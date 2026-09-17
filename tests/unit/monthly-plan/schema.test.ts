import { describe, expect, it } from 'vitest';

import { createMonthCalendar } from '../../../src/shared/calculations/calendar';
import {
  monthlyPlanSchema,
  planDaySchema,
  planEmployeeSchema,
  planEntrySchema,
  type MonthlyPlan,
  type PlanDay,
} from '../../../src/shared/schemas/monthlyPlan';
import { monthlyPlanFileSchema } from '../../../src/shared/schemas/monthlyPlanStorage';

const planId = '00000000-0000-4000-8000-000000000001';
const educatorId = '10000000-0000-4000-8000-000000000001';
const kitchenStaffId = '10000000-0000-4000-8000-000000000002';
const sourceEducatorId = '20000000-0000-4000-8000-000000000001';
const sourceKitchenStaffId = '20000000-0000-4000-8000-000000000002';
const sourceEntryTypeId = '50000000-0000-4000-8000-000000000001';

const zeroTimeValues = {
  attendanceMinutes: 0,
  pauseMinutes: 0,
  workingMinutes: 0,
  workingWithoutNightReadinessMinutes: 0,
  nightReadinessMinutes: 0,
  nightWorkMinutes: 0,
};

function indexedUuid(prefix: string, index: number): string {
  return `${prefix}-0000-4000-8000-${String(index).padStart(12, '0')}`;
}

function createPlanEntry(overrides: Record<string, unknown> = {}) {
  return {
    id: indexedUuid('40000000', 1),
    planEmployeeId: educatorId,
    sourceEntryTypeId,
    code: 'SN',
    name: 'Spät-Nacht-Dienst',
    isFreeDay: false,
    startTime: '14:00',
    endTime: '08:00',
    timeValues: {
      attendanceMinutes: 1_080,
      pauseMinutes: 480,
      workingMinutes: 600,
      workingWithoutNightReadinessMinutes: 480,
      nightReadinessMinutes: 120,
      nightWorkMinutes: 60,
    },
    ...overrides,
  };
}

function createValidPlan(): MonthlyPlan {
  return {
    id: planId,
    year: 2026,
    month: 9,
    title: 'Dienstplan September 2026',
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-01T10:00:00.000Z',
    employees: [
      {
        id: educatorId,
        sourceEmployeeId: sourceEducatorId,
        firstName: 'Eva',
        lastName: 'Erzieherin',
        role: 'Erzieher',
        weeklyWorkingMinutes: 2_340,
        colorKey: 'blue',
        position: 1,
      },
      {
        id: kitchenStaffId,
        sourceEmployeeId: sourceKitchenStaffId,
        firstName: 'Willi',
        lastName: 'Wirtschaftskraft',
        role: 'Wirtschaftskraft',
        weeklyWorkingMinutes: 1_800,
        colorKey: 'orange',
        position: 2,
      },
    ],
    days: createMonthCalendar(2026, 9).map((calendarDay, index): PlanDay => ({
      id: indexedUuid('30000000', index + 1),
      date: calendarDay.date,
      note: null,
      onCallEmployeeId: null,
      entries: [],
    })),
  };
}

describe('Monatsplan-Grundstruktur', () => {
  it('akzeptiert einen vollständigen Monatsplan ohne Verbindung zu aktuellen Stammdaten', () => {
    const plan = createValidPlan();

    expect(monthlyPlanSchema.parse(plan)).toEqual(plan);
  });

  it('erlaubt mehrere eigenständige Pläne desselben Monats', () => {
    const firstPlan = createValidPlan();
    const secondPlan = {
      ...createValidPlan(),
      id: '00000000-0000-4000-8000-000000000002',
      title: 'Alternative Planung',
    };

    expect(monthlyPlanSchema.safeParse(firstPlan).success).toBe(true);
    expect(monthlyPlanSchema.safeParse(secondPlan).success).toBe(true);
  });

  it.each([
    ['Jahr unterhalb des Bereichs', { year: 1999 }],
    ['Jahr oberhalb des Bereichs', { year: 2101 }],
    ['Monat null', { month: 0 }],
    ['Monat dreizehn', { month: 13 }],
    ['leerer Titel', { title: '   ' }],
    ['zu langer Titel', { title: 'x'.repeat(201) }],
    ['ungültige UUID', { id: 'kein-uuid' }],
    ['ungültiger Zeitpunkt', { updatedAt: '11.09.2026' }],
  ])('lehnt %s ab', (_label, overrides) => {
    expect(
      monthlyPlanSchema.safeParse({ ...createValidPlan(), ...overrides })
        .success,
    ).toBe(false);
  });

  it('lehnt unbekannte Felder strikt ab', () => {
    expect(
      monthlyPlanSchema.safeParse({
        ...createValidPlan(),
        entryTypeCategory: 'Dienst',
      }).success,
    ).toBe(false);
  });

  it('entfernt äußere Leerzeichen aus Titel, Bemerkung und Uhrzeiten', () => {
    const plan = createValidPlan();
    plan.title = ' Septemberplan ';
    plan.days[0].note = ' Hinweis ';
    plan.days[0].entries.push(
      createPlanEntry({ startTime: ' 14:00 ', endTime: ' 08:00 ' }),
    );

    const result = monthlyPlanSchema.parse(plan);

    expect(result.title).toBe('Septemberplan');
    expect(result.days[0].note).toBe('Hinweis');
    expect(result.days[0].entries[0]).toMatchObject({
      startTime: '14:00',
      endTime: '08:00',
    });
  });

  it('prüft die versionierte Dateihülle des Monatsplans', () => {
    const plan = createValidPlan();

    expect(monthlyPlanFileSchema.parse({ schemaVersion: 3, plan })).toEqual({
      schemaVersion: 3,
      plan,
    });
    expect(
      monthlyPlanFileSchema.safeParse({ schemaVersion: 2, plan }).success,
    ).toBe(false);
  });
});

describe('Mitarbeiter-Snapshots', () => {
  it('verwendet die gemeinsamen Rollen-, Farben- und Wochenarbeitszeitregeln', () => {
    const employee = createValidPlan().employees[0];

    expect(
      planEmployeeSchema.safeParse({ ...employee, role: 'Leitung' }).success,
    ).toBe(false);
    expect(
      planEmployeeSchema.safeParse({ ...employee, colorKey: 'cyan' }).success,
    ).toBe(false);
    expect(
      planEmployeeSchema.safeParse({
        ...employee,
        weeklyWorkingMinutes: 2_341,
      }).success,
    ).toBe(false);
  });

  it('lehnt doppelte planinterne Mitarbeiter-IDs ab', () => {
    const plan = createValidPlan();
    plan.employees[1].id = plan.employees[0].id;

    expect(monthlyPlanSchema.safeParse(plan).success).toBe(false);
  });

  it('lehnt doppelte Herkunfts-IDs ab', () => {
    const plan = createValidPlan();
    plan.employees[1].sourceEmployeeId = plan.employees[0].sourceEmployeeId;

    expect(monthlyPlanSchema.safeParse(plan).success).toBe(false);
  });

  it.each([
    ['doppelte Positionen', [1, 1]],
    ['Lücke in den Positionen', [1, 3]],
  ])('lehnt %s ab', (_label, positions) => {
    const plan = createValidPlan();
    plan.employees.forEach((employee, index) => {
      employee.position = positions[index];
    });

    expect(monthlyPlanSchema.safeParse(plan).success).toBe(false);
  });
});

describe('Kalendertage', () => {
  it('normalisiert eine leere Bemerkung zu null', () => {
    const day = createValidPlan().days[0];

    expect(planDaySchema.parse({ ...day, note: '   ' }).note).toBeNull();
  });

  it('lehnt eine Tagesbemerkung mit mehr als 60 Zeichen ab', () => {
    const day = createValidPlan().days[0];

    expect(
      planDaySchema.safeParse({ ...day, note: 'x'.repeat(61) }).success,
    ).toBe(false);
  });

  it.each([
    ['einen fehlenden Tag', (plan: MonthlyPlan) => plan.days.pop()],
    [
      'eine falsche Reihenfolge',
      (plan: MonthlyPlan) => {
        [plan.days[0], plan.days[1]] = [plan.days[1], plan.days[0]];
      },
    ],
    [
      'ein Datum außerhalb des Monats',
      (plan: MonthlyPlan) => {
        plan.days[0].date = '2026-08-31';
      },
    ],
    [
      'eine doppelte Plantag-ID',
      (plan: MonthlyPlan) => {
        plan.days[1].id = plan.days[0].id;
      },
    ],
  ])('lehnt %s ab', (_label, mutatePlan) => {
    const plan = createValidPlan();
    mutatePlan(plan);

    expect(monthlyPlanSchema.safeParse(plan).success).toBe(false);
  });

  it.each(['2026-02-29', '2026-13-01', '2026-9-01'])(
    'lehnt das ungültige Kalenderdatum %s ab',
    (date) => {
      const day = { ...createValidPlan().days[0], date };

      expect(planDaySchema.safeParse(day).success).toBe(false);
    },
  );
});

describe('Planungseintrag-Snapshots', () => {
  it('akzeptiert einen vollständigen Snapshot mit gültiger Summenformel', () => {
    expect(planEntrySchema.parse(createPlanEntry())).toEqual(createPlanEntry());
  });

  it('erlaubt leere Uhrzeiten nur gemeinsam', () => {
    expect(
      planEntrySchema.safeParse(
        createPlanEntry({ startTime: null, endTime: null }),
      ).success,
    ).toBe(true);
    expect(
      planEntrySchema.safeParse(createPlanEntry({ startTime: null })).success,
    ).toBe(false);
  });

  it.each(['24:00', '9:00', '12:60'])(
    'lehnt die ungültige Uhrzeit %s ab',
    (startTime) => {
      expect(
        planEntrySchema.safeParse(createPlanEntry({ startTime })).success,
      ).toBe(false);
    },
  );

  it('lehnt widersprüchliche Arbeitszeit mit NB ab', () => {
    expect(
      planEntrySchema.safeParse(
        createPlanEntry({
          timeValues: {
            ...createPlanEntry().timeValues,
            workingMinutes: 599,
          },
        }),
      ).success,
    ).toBe(false);
  });

  it('entfernt äußere Leerzeichen aus dem gespeicherten Snapshot-Kürzel', () => {
    expect(planEntrySchema.parse(createPlanEntry({ code: 'SN/F ' })).code).toBe(
      'SN/F',
    );
  });

  it('behandelt ältere Planungseinträge ohne Kennzeichnung nicht als freien Tag', () => {
    const legacyEntry = createPlanEntry();
    Reflect.deleteProperty(legacyEntry, 'isFreeDay');

    expect(planEntrySchema.parse(legacyEntry).isFreeDay).toBe(false);
  });

  it('akzeptiert freie Tage ausschließlich ohne Uhrzeiten und Zeitwerte', () => {
    expect(
      planEntrySchema.safeParse(
        createPlanEntry({
          code: 'WF',
          isFreeDay: true,
          startTime: null,
          endTime: null,
          timeValues: zeroTimeValues,
        }),
      ).success,
    ).toBe(true);

    expect(
      planEntrySchema.safeParse(
        createPlanEntry({ isFreeDay: true, startTime: null, endTime: null }),
      ).success,
    ).toBe(false);

    expect(
      planEntrySchema.safeParse(
        createPlanEntry({
          isFreeDay: true,
          startTime: null,
          endTime: null,
          timeValues: {
            ...zeroTimeValues,
            workingMinutes: 1,
            workingWithoutNightReadinessMinutes: 1,
          },
        }),
      ).success,
    ).toBe(false);
  });

  it('enthält keine Eintragskategorie oder Berechnungsart', () => {
    expect(
      planEntrySchema.safeParse(createPlanEntry({ calculationType: 'fixed' }))
        .success,
    ).toBe(false);
    expect(
      planEntrySchema.safeParse(createPlanEntry({ category: 'Dienst' }))
        .success,
    ).toBe(false);
  });

  it('lehnt Verweise auf Mitarbeiter außerhalb des Plans ab', () => {
    const plan = createValidPlan();
    plan.days[0].entries.push(
      createPlanEntry({
        planEmployeeId: '90000000-0000-4000-8000-000000000001',
      }),
    );

    expect(monthlyPlanSchema.safeParse(plan).success).toBe(false);
  });

  it('lehnt mehrere Einträge desselben Mitarbeiters an einem Tag ab', () => {
    const plan = createValidPlan();
    plan.days[0].entries.push(
      createPlanEntry(),
      createPlanEntry({ id: indexedUuid('40000000', 2) }),
    );

    expect(monthlyPlanSchema.safeParse(plan).success).toBe(false);
  });

  it('lehnt eine im Plan doppelt verwendete Planungseintrags-ID ab', () => {
    const plan = createValidPlan();
    plan.days[0].entries.push(createPlanEntry());
    plan.days[1].entries.push(createPlanEntry());

    expect(monthlyPlanSchema.safeParse(plan).success).toBe(false);
  });

  it('lehnt Zeitwertsummen außerhalb des sicheren Ganzzahlbereichs ab', () => {
    const plan = createValidPlan();
    const maximumTimeValues = {
      ...zeroTimeValues,
      attendanceMinutes: Number.MAX_SAFE_INTEGER,
      workingMinutes: Number.MAX_SAFE_INTEGER,
      workingWithoutNightReadinessMinutes: Number.MAX_SAFE_INTEGER,
    };

    plan.days[0].entries.push(
      createPlanEntry({ timeValues: maximumTimeValues }),
    );
    plan.days[1].entries.push(
      createPlanEntry({
        id: indexedUuid('40000000', 2),
        timeValues: maximumTimeValues,
      }),
    );

    expect(monthlyPlanSchema.safeParse(plan).success).toBe(false);
  });

  it('prüft Zeitwertsummen getrennt für jeden Mitarbeiter', () => {
    const plan = createValidPlan();
    const maximumTimeValues = {
      ...zeroTimeValues,
      attendanceMinutes: Number.MAX_SAFE_INTEGER,
      workingMinutes: Number.MAX_SAFE_INTEGER,
      workingWithoutNightReadinessMinutes: Number.MAX_SAFE_INTEGER,
    };

    plan.days[0].entries.push(
      createPlanEntry({ timeValues: maximumTimeValues }),
    );
    plan.days[1].entries.push(
      createPlanEntry({
        id: indexedUuid('40000000', 2),
        planEmployeeId: kitchenStaffId,
        timeValues: maximumTimeValues,
      }),
    );

    expect(monthlyPlanSchema.safeParse(plan).success).toBe(true);
  });
});

describe('Rufbereitschaft', () => {
  it('akzeptiert einen Erzieher aus demselben Plan', () => {
    const plan = createValidPlan();
    plan.days[0].onCallEmployeeId = educatorId;

    expect(monthlyPlanSchema.safeParse(plan).success).toBe(true);
  });

  it('lehnt andere Rollen und externe Verweise ab', () => {
    const kitchenPlan = createValidPlan();
    kitchenPlan.days[0].onCallEmployeeId = kitchenStaffId;

    const externalPlan = createValidPlan();
    externalPlan.days[0].onCallEmployeeId =
      '90000000-0000-4000-8000-000000000001';

    expect(monthlyPlanSchema.safeParse(kitchenPlan).success).toBe(false);
    expect(monthlyPlanSchema.safeParse(externalPlan).success).toBe(false);
  });
});
