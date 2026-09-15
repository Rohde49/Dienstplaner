import { useMemo } from 'react';

import {
  formatDuration,
  formatTimeDifference,
} from '../../../shared/calculations';
import type { PlanEntry } from '../../../shared/schemas';
import { EMPLOYEE_COLOR_STYLES } from '../../styles/employeeColors';
import { createPlannerTableModel } from './plannerTableModel';
import type { PlannerDocumentState } from './plannerState';

type PlanningTableProps = {
  document: PlannerDocumentState;
};

const WEEKDAY_NAMES = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'] as const;

function formatEntryTime(entry: PlanEntry | undefined): string {
  return entry?.startTime && entry.endTime
    ? `${entry.startTime}–${entry.endTime}`
    : '—';
}

function getDayClasses(isHoliday: boolean, isWeekend: boolean): string {
  if (isHoliday) {
    return 'bg-red-50';
  }

  return isWeekend ? 'bg-slate-100' : 'bg-app-surface';
}

/** Stellt Vorschau und gespeicherten Plan als gemeinsame Monatsmatrix dar. */
export function PlanningTable({ document }: PlanningTableProps) {
  const model = useMemo(() => createPlannerTableModel(document), [document]);
  const employeesById = useMemo(
    () => new Map(model.employees.map((employee) => [employee.id, employee])),
    [model.employees],
  );

  return (
    <div className="space-y-3">
      <div className="border-app-border max-h-[calc(100vh-19rem)] min-h-80 overflow-auto rounded-lg border shadow-sm">
        <table className="w-max min-w-full border-separate border-spacing-0 text-left text-xs">
          <thead className="sticky top-0 z-30">
            <tr>
              <th
                rowSpan={2}
                className="border-app-border bg-app-surface-muted sticky left-0 z-40 w-40 min-w-40 border-r border-b px-3 py-2 font-semibold"
                scope="col"
              >
                Datum
              </th>

              {model.employees.map((employee) => {
                const colorStyle = EMPLOYEE_COLOR_STYLES[employee.colorKey];
                const showServiceCount = employee.role !== 'Wirtschaftskraft';

                return (
                  <th
                    key={employee.id}
                    colSpan={2}
                    scope="colgroup"
                    className={`min-w-48 border-r border-b px-3 py-2 text-center ${colorStyle.plannerHeaderClass}`}
                  >
                    <span className="block font-semibold">
                      {employee.firstName} {employee.lastName}
                    </span>
                    <span className="mt-0.5 block text-[11px] font-normal">
                      {employee.role}
                    </span>
                    <span className="mt-1 block text-[11px] font-medium tabular-nums">
                      {showServiceCount
                        ? `SN/F ${employee.evaluation.snfServiceCount} · `
                        : ''}
                      Frei {employee.evaluation.freeDayCount} · Δ{' '}
                      {formatTimeDifference(
                        employee.evaluation.workingDifferenceMinutes,
                      )}
                    </span>
                  </th>
                );
              })}

              <th
                rowSpan={2}
                scope="col"
                className="border-app-border bg-app-surface-muted min-w-40 border-r border-b px-3 py-2 font-semibold"
              >
                Rufbereitschaft
              </th>
              <th
                rowSpan={2}
                scope="col"
                className="border-app-border bg-app-surface-muted min-w-56 border-b px-3 py-2 font-semibold"
              >
                Bemerkung
              </th>
            </tr>

            <tr>
              {model.employees.flatMap((employee) => [
                <th
                  key={`${employee.id}-entry`}
                  scope="col"
                  className="border-app-border bg-app-surface-muted min-w-20 border-r border-b px-2 py-1.5 text-center font-medium"
                >
                  Eintrag
                </th>,
                <th
                  key={`${employee.id}-time`}
                  scope="col"
                  className="border-app-border bg-app-surface-muted min-w-28 border-r border-b px-2 py-1.5 text-center font-medium"
                >
                  Zeit
                </th>,
              ])}
            </tr>
          </thead>

          <tbody>
            {model.days.map(({ calendarDay, planDay }) => {
              const rowClasses = getDayClasses(
                calendarDay.isHoliday,
                calendarDay.isWeekend,
              );
              const onCallEmployee = planDay?.onCallEmployeeId
                ? employeesById.get(planDay.onCallEmployeeId)
                : undefined;

              return (
                <tr key={calendarDay.date} className={rowClasses}>
                  <th
                    scope="row"
                    className={`border-app-border sticky left-0 z-10 border-r border-b px-3 py-2 font-medium ${rowClasses}`}
                  >
                    <span
                      className={
                        calendarDay.isHoliday
                          ? 'text-app-danger'
                          : 'text-app-text'
                      }
                    >
                      {calendarDay.date.slice(8, 10)}.
                      {calendarDay.date.slice(5, 7)}. ·{' '}
                      {WEEKDAY_NAMES[calendarDay.weekday - 1]}
                    </span>
                    {calendarDay.holidayNames.length > 0 ? (
                      <span className="text-app-danger mt-0.5 block max-w-36 text-[10px] leading-3">
                        {calendarDay.holidayNames.join(', ')}
                      </span>
                    ) : null}
                  </th>

                  {model.employees.flatMap((employee) => {
                    const entry = planDay?.entries.find(
                      (candidate) => candidate.planEmployeeId === employee.id,
                    );

                    return [
                      <td
                        key={`${calendarDay.date}-${employee.id}-entry`}
                        className="border-app-border text-app-text border-r border-b p-1 text-center font-semibold"
                      >
                        <span
                          aria-label={`${calendarDay.date}, ${employee.firstName} ${employee.lastName}, ${entry?.code ?? 'kein Eintrag'}`}
                        >
                          {entry?.code ?? '—'}
                        </span>
                      </td>,
                      <td
                        key={`${calendarDay.date}-${employee.id}-time`}
                        className="border-app-border text-app-muted border-r border-b px-2 py-2 text-center tabular-nums"
                      >
                        {formatEntryTime(entry)}
                      </td>,
                    ];
                  })}

                  <td className="border-app-border text-app-muted border-r border-b p-1">
                    {onCallEmployee
                      ? `${onCallEmployee.firstName} ${onCallEmployee.lastName}`
                      : '—'}
                  </td>
                  <td className="border-app-border text-app-muted max-w-56 border-b p-1">
                    <span className="block truncate px-2 py-1">
                      {planDay?.note ?? ''}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>

          <tfoot className="bg-app-surface-muted">
            {(['actual', 'target'] as const).map((valueType) => (
              <tr key={valueType}>
                <th
                  scope="row"
                  className="border-app-border bg-app-surface-muted sticky left-0 z-10 border-r border-b px-3 py-2 font-semibold"
                >
                  {valueType === 'actual'
                    ? 'Ist-Arbeitszeit'
                    : 'Soll-Arbeitszeit'}
                </th>
                {model.employees.map((employee) => (
                  <td
                    key={`${valueType}-${employee.id}`}
                    colSpan={2}
                    className="border-app-border text-app-text border-r border-b px-3 py-2 text-center font-semibold tabular-nums"
                  >
                    {formatDuration(
                      valueType === 'actual'
                        ? employee.evaluation.actualWorkingMinutes
                        : employee.evaluation.targetWorkingMinutes,
                    )}
                  </td>
                ))}
                <td
                  colSpan={2}
                  className="border-app-border border-b px-3 py-2"
                />
              </tr>
            ))}
          </tfoot>
        </table>
      </div>

      <div
        aria-label="Legende der Planungstabelle"
        className="text-app-muted flex flex-wrap items-center gap-x-5 gap-y-2 text-xs"
      >
        <span className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="border-app-border size-3 rounded-sm border bg-slate-100"
          />
          Wochenende
        </span>
        <span className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="border-app-danger-border size-3 rounded-sm border bg-red-50"
          />
          Feiertag
        </span>
        <span>Mitarbeiterfarben kennzeichnen die jeweiligen Spaltenköpfe.</span>
      </div>
    </div>
  );
}
