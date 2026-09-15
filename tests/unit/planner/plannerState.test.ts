import { describe, expect, it } from 'vitest';

import { createMonthlyPlan } from '../../../src/main/domain/monthlyPlanFactory';
import {
  beginPlannerSave,
  beginPlannerTeamLoad,
  completePlannerSave,
  completePlannerTeamLoad,
  createInitialPlannerPageState,
  discardPlannerChanges,
  failPlannerSave,
  failPlannerTeamLoad,
  getAdjacentPlannerPeriod,
  getPlannerYearOptions,
  hasUnsavedPlannerChanges,
  openPlannerPlan,
  replacePlannerDraft,
  returnToPlannerPreview,
  selectPlannerPeriod,
} from '../../../src/renderer/features/planner/plannerState';
import type { Employee } from '../../../src/shared/schemas';

function createEmployee(
  id: string,
  overrides: Partial<Employee> = {},
): Employee {
  return {
    id,
    firstName: 'Eva',
    lastName: 'Beispiel',
    role: 'Erzieher',
    weeklyWorkingMinutes: 2_340,
    colorKey: 'blue',
    active: true,
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-09-01T08:00:00.000Z',
    ...overrides,
  };
}

describe('Planungsseitenzustand', () => {
  it('startet im aktuellen lokalen Monat als noch ungeladene Vorschau', () => {
    const state = createInitialPlannerPageState(new Date(2026, 8, 15));

    expect(state.period).toEqual({ year: 2026, month: 9 });
    expect(state.load).toEqual({ status: 'loading', errorMessage: null });
    expect(state.document).toMatchObject({
      kind: 'preview',
      baseline: null,
      draft: null,
      recoveredFromBackup: false,
    });
  });

  it('bildet die Vorschau mit aktiven Mitarbeitern in aktueller Reihenfolge', () => {
    const initialState = createInitialPlannerPageState(new Date(2026, 8, 15));
    const team = [
      createEmployee('10000000-0000-4000-8000-000000000001', {
        firstName: 'Anna',
      }),
      createEmployee('10000000-0000-4000-8000-000000000002', {
        firstName: 'Berta',
        active: false,
      }),
      createEmployee('10000000-0000-4000-8000-000000000003', {
        firstName: 'Clara',
      }),
    ];

    const state = completePlannerTeamLoad(initialState, team);

    expect(state.load).toEqual({ status: 'ready', errorMessage: null });
    expect(state.document.kind).toBe('preview');
    if (state.document.kind !== 'preview') {
      throw new Error('Vorschauzustand erwartet.');
    }
    expect(
      state.document.preview.employees.map(({ firstName }) => firstName),
    ).toEqual(['Anna', 'Clara']);
    expect(state.document.preview.calendarDays).toHaveLength(30);
    expect(state.document.preview.calendarDays[0].date).toBe('2026-09-01');
    expect(state.document.preview.workingDayCount).toBe(22);
    expect(state.document.preview.canCreatePlan).toBe(true);
  });

  it('setzt einen Zeitraumwechsel immer als neue Vorschau ohne Planstand um', () => {
    const loadedState = completePlannerTeamLoad(
      createInitialPlannerPageState(new Date(2026, 8, 15)),
      [createEmployee('10000000-0000-4000-8000-000000000001')],
    );

    const state = selectPlannerPeriod(loadedState, { year: 2027, month: 2 });

    expect(state.period).toEqual({ year: 2027, month: 2 });
    expect(state.document).toMatchObject({
      kind: 'preview',
      baseline: null,
      draft: null,
      recoveredFromBackup: false,
    });
    if (state.document.kind !== 'preview') {
      throw new Error('Vorschauzustand erwartet.');
    }
    expect(state.document.preview.calendarDays).toHaveLength(28);
  });

  it('bietet das aktuelle Jahr sowie zwei Jahre davor und danach an', () => {
    expect(getPlannerYearOptions(2026)).toEqual([2024, 2025, 2026, 2027, 2028]);
    expect(getPlannerYearOptions(2000)).toEqual([2000, 2001, 2002]);
    expect(getPlannerYearOptions(2100)).toEqual([2098, 2099, 2100]);
    expect(getPlannerYearOptions(2026, 2010)).toEqual([
      2009, 2010, 2011, 2024, 2025, 2026, 2027, 2028,
    ]);
  });

  it('trennt Fehler und erneuten Ladevorgang eindeutig von der Vorschau', () => {
    const readyState = completePlannerTeamLoad(
      createInitialPlannerPageState(new Date(2026, 8, 15)),
      [createEmployee('10000000-0000-4000-8000-000000000001')],
    );

    const errorState = failPlannerTeamLoad(
      readyState,
      'Mitarbeiterdaten sind beschädigt.',
    );
    const loadingState = beginPlannerTeamLoad(errorState);

    expect(errorState.load).toEqual({
      status: 'error',
      errorMessage: 'Mitarbeiterdaten sind beschädigt.',
    });
    expect(errorState.document).toBe(readyState.document);
    expect(loadingState.load).toEqual({
      status: 'loading',
      errorMessage: null,
    });
  });

  it('wechselt über Jahresgrenzen nur innerhalb der angebotenen Jahre', () => {
    const years = getPlannerYearOptions(2026);

    expect(
      getAdjacentPlannerPeriod({ year: 2026, month: 1 }, -1, years),
    ).toEqual({
      year: 2025,
      month: 12,
    });
    expect(
      getAdjacentPlannerPeriod({ year: 2028, month: 12 }, 1, years),
    ).toBeNull();
  });

  it('übernimmt einen geladenen Plan als getrennten Ausgangsstand und Entwurf', () => {
    const initialState = completePlannerTeamLoad(
      createInitialPlannerPageState(new Date(2026, 8, 15)),
      [createEmployee('10000000-0000-4000-8000-000000000001')],
    );
    const plan = createMonthlyPlan({
      year: 2010,
      month: 4,
      title: 'Historischer Plan',
      employees: initialState.team,
    });

    const state = openPlannerPlan(initialState, plan, true);

    expect(state.period).toEqual({ year: 2010, month: 4 });
    expect(state.document.kind).toBe('plan');
    if (state.document.kind !== 'plan') {
      throw new Error('Planansicht erwartet.');
    }
    expect(state.document.baseline).toEqual(plan);
    expect(state.document.draft).toEqual(plan);
    expect(state.document.draft).not.toBe(state.document.baseline);
    expect(state.document.recoveredFromBackup).toBe(true);
  });

  it('verwirft einen bereits geöffneten Plan nicht durch ein später geladenes Team', () => {
    const employee = createEmployee('10000000-0000-4000-8000-000000000001');
    const initialState = createInitialPlannerPageState(new Date(2026, 8, 15));
    const plan = createMonthlyPlan({
      year: 2027,
      month: 3,
      title: 'Geladener Plan',
      employees: [employee],
    });
    const openedState = openPlannerPlan(initialState, plan, false);

    const state = completePlannerTeamLoad(openedState, [employee]);

    expect(state.document.kind).toBe('plan');
    expect(state.period).toEqual({ year: 2027, month: 3 });
  });

  it('kehrt nach dem Löschen des geöffneten Plans im selben Zeitraum zur Vorschau zurück', () => {
    const readyState = completePlannerTeamLoad(
      createInitialPlannerPageState(new Date(2026, 8, 15)),
      [createEmployee('10000000-0000-4000-8000-000000000001')],
    );
    const plan = createMonthlyPlan({
      year: 2027,
      month: 2,
      title: 'Februarplan',
      employees: readyState.team,
    });
    const loadedState = openPlannerPlan(readyState, plan, false);

    const state = returnToPlannerPreview(loadedState);

    expect(state.period).toEqual({ year: 2027, month: 2 });
    expect(state.document.kind).toBe('preview');
    if (state.document.kind !== 'preview') {
      throw new Error('Vorschauzustand erwartet.');
    }
    expect(state.document.preview.calendarDays).toHaveLength(28);
    expect(state.document.preview.employees).toHaveLength(1);
  });

  it('erkennt Entwurfsänderungen und Sicherungsstände als ungespeichert', () => {
    const readyState = completePlannerTeamLoad(
      createInitialPlannerPageState(new Date(2026, 8, 15)),
      [createEmployee('10000000-0000-4000-8000-000000000001')],
    );
    const plan = createMonthlyPlan({
      year: 2026,
      month: 9,
      title: 'Septemberplan',
      employees: readyState.team,
    });
    const cleanState = openPlannerPlan(readyState, plan, false);
    const changedState = replacePlannerDraft(cleanState, {
      ...plan,
      title: 'Entwurf',
    });
    const recoveredState = openPlannerPlan(readyState, plan, true);

    expect(hasUnsavedPlannerChanges(cleanState)).toBe(false);
    expect(hasUnsavedPlannerChanges(changedState)).toBe(true);
    expect(hasUnsavedPlannerChanges(recoveredState)).toBe(true);
  });

  it('bewahrt den Entwurf bei Fehlern und übernimmt nur den gespeicherten Rückgabestand', () => {
    const readyState = completePlannerTeamLoad(
      createInitialPlannerPageState(new Date(2026, 8, 15)),
      [createEmployee('10000000-0000-4000-8000-000000000001')],
    );
    const plan = createMonthlyPlan({
      year: 2026,
      month: 9,
      title: 'Septemberplan',
      employees: readyState.team,
    });
    const changedState = replacePlannerDraft(
      openPlannerPlan(readyState, plan, false),
      { ...plan, title: 'Entwurf' },
    );

    const savingState = beginPlannerSave(changedState);
    const errorState = failPlannerSave(
      savingState,
      'Datenträger nicht verfügbar.',
    );
    const savedPlan = {
      ...plan,
      title: 'Vom Main Process gespeichert',
      updatedAt: '2026-09-15T08:00:00.000Z',
    };
    const savedState = completePlannerSave(errorState, savedPlan);

    expect(errorState.save).toEqual({
      status: 'error',
      errorMessage: 'Datenträger nicht verfügbar.',
    });
    expect(errorState.document.kind).toBe('plan');
    if (errorState.document.kind !== 'plan') {
      throw new Error('Planansicht erwartet.');
    }
    expect(errorState.document.draft.title).toBe('Entwurf');
    expect(savedState.document.kind).toBe('plan');
    if (savedState.document.kind !== 'plan') {
      throw new Error('Planansicht erwartet.');
    }
    expect(savedState.document.baseline.title).toBe(
      'Vom Main Process gespeichert',
    );
    expect(savedState.document.draft).toEqual(savedState.document.baseline);
    expect(savedState.save.status).toBe('idle');
    expect(hasUnsavedPlannerChanges(savedState)).toBe(false);
  });

  it('stellt beim Verwerfen den gespeicherten Ausgangsstand wieder her', () => {
    const readyState = completePlannerTeamLoad(
      createInitialPlannerPageState(new Date(2026, 8, 15)),
      [createEmployee('10000000-0000-4000-8000-000000000001')],
    );
    const plan = createMonthlyPlan({
      year: 2026,
      month: 9,
      title: 'Septemberplan',
      employees: readyState.team,
    });
    const changedState = replacePlannerDraft(
      openPlannerPlan(readyState, plan, false),
      { ...plan, title: 'Entwurf' },
    );

    const state = discardPlannerChanges(changedState);

    expect(state.document.kind).toBe('plan');
    if (state.document.kind !== 'plan') {
      throw new Error('Planansicht erwartet.');
    }
    expect(state.document.draft.title).toBe('Septemberplan');
    expect(hasUnsavedPlannerChanges(state)).toBe(false);
  });

  it('sperrt die Plananlage ohne aktive Mitarbeiter fachlich durch eine leere Vorschau', () => {
    const state = completePlannerTeamLoad(
      createInitialPlannerPageState(new Date(2026, 8, 15)),
      [
        createEmployee('10000000-0000-4000-8000-000000000001', {
          active: false,
        }),
      ],
    );

    expect(state.document.kind).toBe('preview');
    if (state.document.kind !== 'preview') {
      throw new Error('Vorschauzustand erwartet.');
    }
    expect(state.document.preview.employees).toHaveLength(0);
    expect(state.document.preview.canCreatePlan).toBe(false);
  });
});
