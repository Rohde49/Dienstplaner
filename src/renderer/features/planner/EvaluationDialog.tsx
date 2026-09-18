import { BarChart3, Users } from 'lucide-react';
import { useMemo, useState } from 'react';

import {
  TARGET_FREE_WEEKEND_DAY_COUNT,
  calculateMonthlyPlanEvaluation,
  formatDuration,
  formatTimeDifference,
  getTargetCountStatus,
  parseTimeDifferenceInput,
  type EmployeeMonthlyEvaluation,
  type MonthlyPlanEvaluation,
} from '../../../shared/calculations';
import type { MonthlyPlan, PlanEmployee } from '../../../shared/schemas';
import {
  Alert,
  Badge,
  Button,
  DialogContent,
  DialogRoot,
  DialogTrigger,
  EmptyState,
  Input,
  Select,
} from '../../components/ui';
import { EMPLOYEE_COLOR_STYLES } from '../../styles/employeeColors';
import {
  setDraftEmployeeWorkingTimeCarryover,
  setDraftWorkingTimeCarryoverMonth,
} from './plannerDraft';
import { PLANNER_MONTHS } from './plannerState';

type EvaluationDialogProps = {
  plan: MonthlyPlan | null;
  disabled: boolean;
  status: 'saved' | 'draft' | 'recovered';
  onPlanChange: (plan: MonthlyPlan) => void;
};

type EvaluationRow = {
  label: string;
  sectionStart?: boolean;
  summary?: boolean;
  highlight?: 'free-days' | 'free-saturdays' | 'free-sundays' | 'difference';
  format: (
    employee: EmployeeMonthlyEvaluation,
    workingDayCount: number,
  ) => string;
};

type EvaluationResult =
  | { evaluation: MonthlyPlanEvaluation; error: null }
  | { evaluation: null; error: string };

const ROWS: readonly EvaluationRow[] = [
  {
    label: 'Anzahl SN/F',
    format: (employee) => String(employee.snfServiceCount),
  },
  {
    label: 'Anzahl freier Tage',
    highlight: 'free-days',
    format: (employee) => String(employee.freeDayCount),
  },
  {
    label: 'Anzahl freier Samstage',
    highlight: 'free-saturdays',
    format: (employee) => String(employee.freeSaturdayCount),
  },
  {
    label: 'Anzahl freier Sonntage',
    highlight: 'free-sundays',
    format: (employee) => String(employee.freeSundayCount),
  },
  {
    label: 'Reine Arbeitszeit gesamt',
    sectionStart: true,
    format: (employee) =>
      formatDuration(employee.workingWithoutNightReadinessMinutes),
  },
  {
    label: 'Nachtbereitschaft gesamt',
    format: (employee) => formatDuration(employee.nightReadinessMinutes),
  },
  {
    label: '+Nachtbereitschaft 25 %',
    format: (employee) => formatDuration(employee.nightReadinessBonusMinutes),
  },
  {
    label: 'Anzahl Rufbereitschaften',
    format: (employee) => String(employee.onCallCount),
  },
  {
    label: 'Anzahl Arbeitstage',
    sectionStart: true,
    summary: true,
    format: (_, workingDayCount) => String(workingDayCount),
  },
  {
    label: 'Ist-Arbeitszeit',
    summary: true,
    format: (employee) => formatDuration(employee.actualWorkingMinutes),
  },
  {
    label: 'Soll-Arbeitszeit',
    summary: true,
    format: (employee) => formatDuration(employee.targetWorkingMinutes),
  },
  {
    label: 'Differenz Soll/Ist',
    summary: true,
    highlight: 'difference',
    format: (employee) =>
      formatTimeDifference(employee.workingDifferenceMinutes),
  },
];

function getDifferenceClasses(minutes: number): string {
  if (minutes < 0) {
    return 'bg-red-50 font-semibold text-red-800 group-hover:bg-red-100';
  }

  return minutes > 0
    ? 'bg-green-50 font-semibold text-green-800 group-hover:bg-green-100'
    : 'bg-app-surface-muted font-semibold group-hover:bg-app-surface-hover';
}

function getFreeDayClasses(actual: number, target: number): string {
  const status = getTargetCountStatus(actual, target);

  if (status === 'below') {
    return 'bg-app-signal-warning-subtle text-app-signal-warning group-hover:bg-app-signal-warning-hover font-semibold';
  }

  return status === 'above'
    ? 'bg-app-signal-danger-subtle text-app-signal-danger group-hover:bg-app-signal-danger-hover font-semibold'
    : 'bg-app-signal-success-subtle text-app-signal-success group-hover:bg-app-signal-success-hover font-semibold';
}

function getRowHighlightClasses(
  row: EvaluationRow,
  employee: EmployeeMonthlyEvaluation,
  evaluation: MonthlyPlanEvaluation,
): string | null {
  if (row.highlight === 'difference') {
    return getDifferenceClasses(employee.workingDifferenceMinutes);
  }

  if (row.highlight === 'free-days') {
    return getFreeDayClasses(
      employee.freeDayCount,
      evaluation.targetFreeDayCount,
    );
  }

  if (row.highlight === 'free-saturdays') {
    return getFreeDayClasses(
      employee.freeSaturdayCount,
      TARGET_FREE_WEEKEND_DAY_COUNT,
    );
  }

  if (row.highlight === 'free-sundays') {
    return getFreeDayClasses(
      employee.freeSundayCount,
      TARGET_FREE_WEEKEND_DAY_COUNT,
    );
  }

  return null;
}

function createCarryoverInputValues(
  plan: MonthlyPlan,
  educators: PlanEmployee[],
): Record<string, string> {
  const minutesByEmployeeId = new Map(
    plan.workingTimeCarryover.entries.map((entry) => [
      entry.planEmployeeId,
      entry.minutes,
    ]),
  );

  return Object.fromEntries(
    educators.map((employee) => {
      const minutes = minutesByEmployeeId.get(employee.id);
      return [
        employee.id,
        minutes === undefined ? '' : formatTimeDifference(minutes),
      ];
    }),
  );
}

function getCarryoverInputClasses(value: string, hasError: boolean): string {
  if (hasError) {
    return '!border-app-danger !bg-app-danger-subtle !text-app-danger';
  }

  if (value.trim().length === 0) {
    return '';
  }

  const parsedValue = parseTimeDifferenceInput(value);

  if (!parsedValue || parsedValue.minutes === 0) {
    return '!border-app-border !bg-app-surface-muted !text-app-muted';
  }

  return parsedValue.minutes > 0
    ? '!border-app-signal-success-border !bg-app-signal-success-subtle !text-app-signal-success'
    : '!border-app-signal-danger-border !bg-app-signal-danger-subtle !text-app-signal-danger';
}

type WorkingTimeCarryoverRowProps = {
  plan: MonthlyPlan;
  educators: PlanEmployee[];
  onPlanChange: (plan: MonthlyPlan) => void;
};

/** Pflegt den extern ermittelten Zeitübertrag ohne Einfluss auf Berechnungen. */
function WorkingTimeCarryoverRow({
  plan,
  educators,
  onPlanChange,
}: WorkingTimeCarryoverRowProps) {
  const [inputValues, setInputValues] = useState<Record<string, string>>(() =>
    createCarryoverInputValues(plan, educators),
  );
  const [invalidEmployeeIds, setInvalidEmployeeIds] = useState<Set<string>>(
    () => new Set(),
  );
  const carryoverMonth = plan.workingTimeCarryover.month;
  const hasStoredEntries = plan.workingTimeCarryover.entries.length > 0;

  function updateInputValue(employeeId: string, value: string): void {
    setInputValues((currentValues) => ({
      ...currentValues,
      [employeeId]: value,
    }));
    setInvalidEmployeeIds((currentIds) => {
      if (!currentIds.has(employeeId)) {
        return currentIds;
      }

      const nextIds = new Set(currentIds);
      nextIds.delete(employeeId);
      return nextIds;
    });
  }

  function commitInputValue(employee: PlanEmployee): void {
    const value = inputValues[employee.id] ?? '';

    if (value.trim().length === 0) {
      setInvalidEmployeeIds((currentIds) => {
        const nextIds = new Set(currentIds);
        nextIds.delete(employee.id);
        return nextIds;
      });
      onPlanChange(
        setDraftEmployeeWorkingTimeCarryover(plan, employee.id, null),
      );
      return;
    }

    const parsedValue = parseTimeDifferenceInput(value);

    if (!parsedValue) {
      setInvalidEmployeeIds((currentIds) =>
        new Set(currentIds).add(employee.id),
      );
      return;
    }

    setInputValues((currentValues) => ({
      ...currentValues,
      [employee.id]: parsedValue.normalized,
    }));
    setInvalidEmployeeIds((currentIds) => {
      const nextIds = new Set(currentIds);
      nextIds.delete(employee.id);
      return nextIds;
    });
    onPlanChange(
      setDraftEmployeeWorkingTimeCarryover(
        plan,
        employee.id,
        parsedValue.minutes,
      ),
    );
  }

  return (
    <tr>
      <th
        scope="row"
        className="border-t-app-border-strong border-app-border bg-app-surface-muted border-t-2 border-r px-3 py-2 text-left font-medium"
      >
        <span className="mb-1.5 block">Übertrag aus</span>
        <Select
          aria-label="Bezugsmonat des Zeitübertrags"
          className="!h-8 px-2 text-xs"
          value={carryoverMonth ?? ''}
          onChange={(event) => {
            onPlanChange(
              setDraftWorkingTimeCarryoverMonth(
                plan,
                event.currentTarget.value === ''
                  ? null
                  : Number(event.currentTarget.value),
              ),
            );
            event.currentTarget.blur();
          }}
        >
          <option value="" disabled={hasStoredEntries}>
            Monat wählen
          </option>
          {PLANNER_MONTHS.map((month, index) => (
            <option key={month} value={index + 1}>
              {month}
            </option>
          ))}
        </Select>
      </th>

      {educators.map((employee, employeeIndex) => {
        const hasError = invalidEmployeeIds.has(employee.id);
        const errorId = `carryover-error-${employee.id}`;
        const value = inputValues[employee.id] ?? '';

        return (
          <td
            key={employee.id}
            className={`border-t-app-border-strong bg-app-surface border-t-2 px-2 py-2 text-center ${
              employeeIndex < educators.length - 1
                ? 'border-app-border border-r'
                : ''
            }`}
          >
            <Input
              aria-describedby={hasError ? errorId : undefined}
              aria-invalid={hasError}
              aria-label={`Zeitübertrag für ${employee.firstName} ${employee.lastName}`}
              className={`!h-8 px-2 text-center text-xs font-semibold tabular-nums hover:shadow-sm ${getCarryoverInputClasses(
                value,
                hasError,
              )}`}
              disabled={carryoverMonth === null}
              inputMode="text"
              placeholder="±00:00"
              title={
                carryoverMonth === null
                  ? 'Bitte zuerst einen Bezugsmonat auswählen.'
                  : 'Positive oder negative Zeit im Format ±HH:MM'
              }
              value={value}
              onBlur={() => commitInputValue(employee)}
              onChange={(event) =>
                updateInputValue(employee.id, event.currentTarget.value)
              }
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.currentTarget.blur();
                }
              }}
            />
            {hasError ? (
              <span
                id={errorId}
                className="text-app-danger mt-1 block text-[10px] leading-3"
              >
                Ungültige Zeit
              </span>
            ) : null}
          </td>
        );
      })}
    </tr>
  );
}

/** Verdichtet den aktuellen Planentwurf und ergänzt den manuellen Zeitübertrag. */
function EvaluationTable({
  plan,
  onPlanChange,
}: {
  plan: MonthlyPlan;
  onPlanChange: (plan: MonthlyPlan) => void;
}) {
  const result = useMemo<EvaluationResult>(() => {
    try {
      return { evaluation: calculateMonthlyPlanEvaluation(plan), error: null };
    } catch (error) {
      return {
        evaluation: null,
        error:
          error instanceof Error
            ? error.message
            : 'Der Dienstplan konnte nicht zuverlässig ausgewertet werden.',
      };
    }
  }, [plan]);

  if (result.error) {
    return (
      <div className="p-6">
        <Alert title="Auswertung nicht möglich" variant="danger">
          {result.error}
        </Alert>
      </div>
    );
  }

  const evaluation = result.evaluation;
  const evaluationsById = new Map(
    evaluation.employees.map((employee) => [employee.planEmployeeId, employee]),
  );
  const educators = [...plan.employees]
    .filter((employee) => employee.role === 'Erzieher')
    .sort((first, second) => first.position - second.position);

  if (educators.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Keine Erzieher im Dienstplan"
        description="Dieser Dienstplan enthält keine Mitarbeiter mit der Rolle Erzieher."
      />
    );
  }

  if (educators.some((employee) => !evaluationsById.has(employee.id))) {
    return (
      <div className="p-6">
        <Alert title="Auswertung nicht möglich" variant="danger">
          Die Mitarbeiterwerte dieses Dienstplans konnten nicht vollständig
          zugeordnet werden.
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 p-4">
      <div className="border-app-border overflow-hidden rounded-lg border shadow-sm">
        <table className="w-full table-fixed border-separate border-spacing-0 text-left text-xs">
          <caption className="sr-only">
            Monatsauswertung der Erzieherinnen und Erzieher
          </caption>
          <colgroup>
            <col className="w-48" />
            {educators.map((employee) => (
              <col key={employee.id} className="w-28" />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th
                scope="col"
                className="border-app-border border-r border-b bg-slate-100 px-3 py-2.5 font-semibold"
              >
                Kennzahl
              </th>
              {educators.map((employee, employeeIndex) => {
                const colorStyle = EMPLOYEE_COLOR_STYLES[employee.colorKey];

                return (
                  <th
                    key={employee.id}
                    scope="col"
                    className={`relative px-2 py-2.5 text-center font-semibold break-words ${colorStyle.plannerHeaderClass}`}
                  >
                    {employee.firstName} {employee.lastName}
                    <span
                      aria-hidden="true"
                      className="bg-app-border absolute inset-x-0 bottom-0 h-px"
                    />
                    {employeeIndex < educators.length - 1 ? (
                      <span
                        aria-hidden="true"
                        className="bg-app-border absolute inset-y-0 right-0 w-px"
                      />
                    ) : null}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, rowIndex) => {
              const sectionClasses = row.sectionStart
                ? 'border-t-app-border-strong border-t-2'
                : '';
              const isLastRow = rowIndex === ROWS.length - 1;
              const nextRowStartsSection =
                ROWS[rowIndex + 1]?.sectionStart ?? false;
              const showBottomBorder = !isLastRow && !nextRowStartsSection;

              return (
                <tr key={row.label} className="group">
                  <th
                    scope="row"
                    className={`border-app-border border-r px-3 py-2 font-medium transition-colors ${
                      showBottomBorder ? 'border-b' : ''
                    } ${sectionClasses} ${
                      row.summary
                        ? 'bg-blue-50/60 group-hover:bg-blue-50'
                        : 'bg-app-surface-muted group-hover:bg-slate-100'
                    }`}
                  >
                    {row.label}
                  </th>
                  {educators.map((employee, employeeIndex) => {
                    const employeeEvaluation = evaluationsById.get(
                      employee.id,
                    )!;
                    const highlightClasses = getRowHighlightClasses(
                      row,
                      employeeEvaluation,
                      evaluation,
                    );

                    return (
                      <td
                        key={employee.id}
                        className={`border-app-border px-2 py-2 text-center tabular-nums transition-colors ${
                          employeeIndex < educators.length - 1 ? 'border-r' : ''
                        } ${showBottomBorder ? 'border-b' : ''} ${sectionClasses} ${
                          highlightClasses
                            ? highlightClasses
                            : row.summary
                              ? 'bg-blue-50/40 font-medium group-hover:bg-blue-50'
                              : 'bg-app-surface group-hover:bg-app-surface-hover'
                        }`}
                      >
                        {row.format(
                          employeeEvaluation,
                          evaluation.workingDayCount,
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            <WorkingTimeCarryoverRow
              plan={plan}
              educators={educators}
              onPlanChange={onPlanChange}
            />
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Öffnet die Auswertung modal über dem aktuellen Planentwurf. */
export function EvaluationDialog({
  plan,
  disabled,
  status,
  onPlanChange,
}: EvaluationDialogProps) {
  const period = plan ? `${PLANNER_MONTHS[plan.month - 1]} ${plan.year}` : '';
  const statusLabel =
    status === 'recovered'
      ? 'Aus Sicherung geladen'
      : status === 'draft'
        ? 'Ungespeicherter Stand'
        : 'Gespeicherter Stand';
  const educatorCount =
    plan?.employees.filter((employee) => employee.role === 'Erzieher').length ??
    0;
  const dialogWidth = educatorCount === 0 ? 560 : 224 + educatorCount * 112;

  return (
    <DialogRoot>
      <DialogTrigger asChild>
        <Button variant="secondary" disabled={!plan || disabled}>
          <BarChart3 aria-hidden="true" size={17} />
          Auswertung
        </Button>
      </DialogTrigger>
      {plan ? (
        <DialogContent
          style={{
            width: `min(calc(100vw - 3rem), ${dialogWidth}px)`,
            maxWidth: 'none',
          }}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            (event.currentTarget as HTMLElement)
              .querySelector<HTMLButtonElement>(
                'button[aria-label="Dialog schließen"]',
              )
              ?.focus({ preventScroll: true });
          }}
          title="Auswertung"
          description={`${plan.title} · ${period}`}
          headerAside={
            <Badge variant={status === 'saved' ? 'success' : 'warning'}>
              {statusLabel}
            </Badge>
          }
        >
          <EvaluationTable plan={plan} onPlanChange={onPlanChange} />
        </DialogContent>
      ) : null}
    </DialogRoot>
  );
}
