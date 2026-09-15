import { useMemo, useState } from 'react';

import {
  formatDuration,
  formatTimeDifference,
} from '../../../shared/calculations';
import type { MonthlyPlan, PlanEntry } from '../../../shared/schemas';
import { EMPLOYEE_COLOR_STYLES } from '../../styles/employeeColors';
import {
  DayNoteCellPopover,
  OnCallCellPopover,
  PlanEntryCellPopover,
} from './PlannerCellPopovers';
import {
  removeDraftPlanEntry,
  setDraftDayNote,
  setDraftOnCallEmployee,
  setDraftPlanEntry,
} from './plannerDraft';
import { formatOnCallName } from './formatOnCallName';
import { createPlannerTableModel } from './plannerTableModel';
import type { PlannerDocumentState } from './plannerState';

type PlanningTableProps = {
  document: PlannerDocumentState;
  onDraftChange?: (plan: MonthlyPlan) => void;
};

const WEEKDAY_NAMES = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'] as const;

function formatEntryTime(entry: PlanEntry | undefined): string {
  if (!entry) {
    return '';
  }

  return entry.startTime && entry.endTime
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
export function PlanningTable({ document, onDraftChange }: PlanningTableProps) {
  const model = useMemo(() => createPlannerTableModel(document), [document]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const editablePlan = document.kind === 'plan' ? document.draft : null;
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
                className="border-app-border bg-app-surface-muted sticky left-0 z-40 w-32 min-w-32 border-r border-b px-3 py-2 text-center font-semibold"
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
                    className={`min-w-48 border-r border-b text-center ${colorStyle.plannerHeaderClass}`}
                  >
                    <span className="block px-3 py-2">
                      <span className="block font-semibold">
                        {employee.firstName} {employee.lastName}
                      </span>
                      <span className="mt-0.5 block text-[11px] font-normal">
                        {employee.role}
                      </span>
                    </span>
                    <span
                      className={`grid border-t border-current/20 text-[10px] tabular-nums ${
                        showServiceCount ? 'grid-cols-3' : 'grid-cols-2'
                      }`}
                    >
                      {showServiceCount ? (
                        <span className="px-1 py-1.5">
                          <span className="block font-normal">SN/F</span>
                          <span className="block font-semibold">
                            {employee.evaluation.snfServiceCount}
                          </span>
                        </span>
                      ) : null}
                      <span
                        className={`${
                          showServiceCount ? 'border-l' : ''
                        } border-current/20 px-1 py-1.5`}
                      >
                        <span className="block font-normal">Frei</span>
                        <span className="block font-semibold">
                          {employee.evaluation.freeDayCount}
                        </span>
                      </span>
                      <span className="border-l border-current/20 px-1 py-1.5">
                        <span className="block font-normal">Differenz</span>
                        <span className="block font-semibold">
                          {formatTimeDifference(
                            employee.evaluation.workingDifferenceMinutes,
                          )}
                        </span>
                      </span>
                    </span>
                  </th>
                );
              })}

              <th
                rowSpan={2}
                scope="col"
                className="border-app-border bg-app-surface-muted min-w-40 border-r border-b px-3 py-2 text-center font-semibold"
              >
                Rufbereitschaft
              </th>
              <th
                rowSpan={2}
                scope="col"
                className="border-app-border bg-app-surface-muted min-w-56 border-b px-3 py-2 text-center font-semibold"
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
              const dayLabel = `${WEEKDAY_NAMES[calendarDay.weekday - 1]} · ${calendarDay.date.slice(8, 10)}.${calendarDay.date.slice(5, 7)}.${calendarDay.date.slice(0, 4)}`;
              const isSelected = selectedDate === calendarDay.date;
              const rowClasses = isSelected
                ? 'bg-orange-100'
                : getDayClasses(calendarDay.isHoliday, calendarDay.isWeekend);
              const onCallEmployee = planDay?.onCallEmployeeId
                ? employeesById.get(planDay.onCallEmployeeId)
                : undefined;

              return (
                <tr
                  key={calendarDay.date}
                  className={rowClasses}
                  onClick={() => setSelectedDate(calendarDay.date)}
                  onFocusCapture={(event) => {
                    if (
                      event.target instanceof HTMLElement &&
                      !event.target.closest('[data-planner-date-toggle]')
                    ) {
                      setSelectedDate(calendarDay.date);
                    }
                  }}
                >
                  <th
                    scope="row"
                    className={`border-app-border sticky left-0 z-10 w-32 min-w-32 border-r border-b text-center font-medium ${rowClasses}`}
                  >
                    <button
                      type="button"
                      data-planner-date-toggle
                      aria-pressed={isSelected}
                      aria-label={`${dayLabel}, Zeilenhervorhebung ${isSelected ? 'aufheben' : 'einschalten'}`}
                      className="hover:bg-app-primary-selected w-full rounded-sm px-2 py-2 text-center"
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedDate((currentDate) =>
                          currentDate === calendarDay.date
                            ? null
                            : calendarDay.date,
                        );
                      }}
                    >
                      <span
                        className={`whitespace-nowrap ${
                          calendarDay.isHoliday
                            ? 'text-app-danger'
                            : 'text-app-text'
                        }`}
                      >
                        {dayLabel}
                      </span>
                      {calendarDay.holidayNames.length > 0 ? (
                        <span className="text-app-danger mt-0.5 block max-w-full text-center text-[10px] leading-3 break-words">
                          {calendarDay.holidayNames.join(', ')}
                        </span>
                      ) : null}
                    </button>
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
                        {editablePlan && planDay && onDraftChange ? (
                          <PlanEntryCellPopover
                            date={calendarDay.date}
                            employeeName={`${employee.firstName} ${employee.lastName}`}
                            currentEntry={entry}
                            onSelect={(entryType) =>
                              onDraftChange(
                                setDraftPlanEntry(
                                  editablePlan,
                                  planDay.id,
                                  employee.id,
                                  entryType,
                                ),
                              )
                            }
                            onRemove={() =>
                              onDraftChange(
                                removeDraftPlanEntry(
                                  editablePlan,
                                  planDay.id,
                                  employee.id,
                                ),
                              )
                            }
                          />
                        ) : (
                          <span
                            className={
                              entry
                                ? undefined
                                : 'planner-empty-field block min-h-8 w-full rounded'
                            }
                            aria-label={`${calendarDay.date}, ${employee.firstName} ${employee.lastName}, ${entry ? `Eintrag ${entry.code}` : 'kein Eintrag'}`}
                          >
                            {entry?.code}
                          </span>
                        )}
                      </td>,
                      <td
                        key={`${calendarDay.date}-${employee.id}-time`}
                        className="border-app-border text-app-muted border-r border-b px-2 py-2 text-center tabular-nums"
                      >
                        {formatEntryTime(entry)}
                      </td>,
                    ];
                  })}

                  <td className="border-app-border text-app-muted border-r border-b p-1 text-center">
                    {editablePlan && planDay && onDraftChange ? (
                      <OnCallCellPopover
                        date={calendarDay.date}
                        employees={editablePlan.employees}
                        selectedEmployeeId={planDay.onCallEmployeeId}
                        onSelect={(employeeId) =>
                          onDraftChange(
                            setDraftOnCallEmployee(
                              editablePlan,
                              planDay.id,
                              employeeId,
                            ),
                          )
                        }
                      />
                    ) : onCallEmployee ? (
                      formatOnCallName(onCallEmployee)
                    ) : (
                      <span
                        className="planner-empty-field block min-h-8 w-full rounded"
                        aria-label={`${calendarDay.date}, keine Rufbereitschaft`}
                      />
                    )}
                  </td>
                  <td className="border-app-border text-app-muted max-w-56 border-b p-1 text-center">
                    {editablePlan && planDay && onDraftChange ? (
                      <DayNoteCellPopover
                        date={calendarDay.date}
                        note={planDay.note}
                        onApply={(note) =>
                          onDraftChange(
                            setDraftDayNote(editablePlan, planDay.id, note),
                          )
                        }
                      />
                    ) : (
                      <span className="block truncate px-2 py-1 text-center">
                        {planDay?.note ?? ''}
                      </span>
                    )}
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
                  className="border-app-border bg-app-surface-muted sticky left-0 z-10 w-32 min-w-32 border-r border-b px-3 py-2 text-center font-semibold"
                >
                  {valueType === 'actual' ? 'Ist' : 'Soll'}
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
        <span className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="planner-empty-field border-app-border bg-app-surface size-5 rounded-sm border"
          />
          Noch unbelegt (Eintrag oder Rufbereitschaft)
        </span>
        <span>Mitarbeiterfarben kennzeichnen die jeweiligen Spaltenköpfe.</span>
      </div>
    </div>
  );
}
