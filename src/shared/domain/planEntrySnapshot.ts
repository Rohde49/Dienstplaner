import {
  calculateWorkingMinutes,
  entryTypeSchema,
  planEmployeeSchema,
  planEntrySchema,
  type EntryType,
  type PlanEmployee,
  type PlanEntry,
  type TimeValues,
} from '../schemas';

export interface CreatePlanEntrySnapshotInput {
  id: string;
  entryType: unknown;
  planEmployee: unknown;
}

function createSnapshotTimeValues(
  entryType: EntryType,
  planEmployee: PlanEmployee,
): TimeValues {
  if (entryType.calculationType === 'weeklyWorkingTime') {
    const dailyWorkingMinutes = planEmployee.weeklyWorkingMinutes / 5;

    return {
      attendanceMinutes: 0,
      workingMinutes: dailyWorkingMinutes,
      workingWithoutNightReadinessMinutes: dailyWorkingMinutes,
      nightReadinessMinutes: 0,
      nightWorkMinutes: 0,
    };
  }

  return {
    attendanceMinutes: entryType.timeValues.attendanceMinutes,
    workingMinutes: calculateWorkingMinutes(
      entryType.timeValues.workingWithoutNightReadinessMinutes,
      entryType.timeValues.nightReadinessMinutes,
    ),
    workingWithoutNightReadinessMinutes:
      entryType.timeValues.workingWithoutNightReadinessMinutes,
    nightReadinessMinutes: entryType.timeValues.nightReadinessMinutes,
    nightWorkMinutes: entryType.timeValues.nightWorkMinutes,
  };
}

/** Erzeugt deterministisch einen vollständigen Planeintrag aus den Snapshots. */
export function createPlanEntrySnapshot({
  id,
  entryType: entryTypeValue,
  planEmployee: planEmployeeValue,
}: CreatePlanEntrySnapshotInput): PlanEntry {
  const entryType = entryTypeSchema.parse(entryTypeValue);
  const planEmployee = planEmployeeSchema.parse(planEmployeeValue);

  if (!entryType.active) {
    throw new Error(
      'Eine inaktive Eintragsart kann nicht neu in den Monatsplan gesetzt werden.',
    );
  }

  const usesWeeklyWorkingTime =
    entryType.calculationType === 'weeklyWorkingTime';

  return planEntrySchema.parse({
    id,
    planEmployeeId: planEmployee.id,
    sourceEntryTypeId: entryType.id,
    code: entryType.code,
    name: entryType.name,
    startTime: usesWeeklyWorkingTime ? null : entryType.startTime,
    endTime: usesWeeklyWorkingTime ? null : entryType.endTime,
    timeValues: createSnapshotTimeValues(entryType, planEmployee),
  });
}
