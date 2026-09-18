import { EMPLOYEE_COLOR_STYLES } from '../../styles/employeeColors';
import type { CompactPlanDay, CompactPlanModel } from './compactPlanModel';
import { A4_DOCUMENT_HEIGHT, A4_DOCUMENT_WIDTH } from './compactPlanLayout';

type CompactPlanDocumentProps = {
  model: CompactPlanModel;
};

function getDayBackground(day: CompactPlanDay): string {
  if (day.isHoliday) {
    return 'bg-red-100';
  }

  return day.isWeekend ? 'bg-slate-200' : 'bg-white';
}

/** Stellt das gemeinsame, interaktionsfreie A4-Dokumentlayout dar. */
export function CompactPlanDocument({ model }: CompactPlanDocumentProps) {
  const footerRows = [
    {
      label: 'Ist',
      getValue: (employee: CompactPlanModel['employees'][number]) =>
        employee.actualWorkingTime,
    },
    {
      label: 'Soll',
      getValue: (employee: CompactPlanModel['employees'][number]) =>
        employee.targetWorkingTime,
    },
    {
      label: 'h/Woche',
      getValue: (employee: CompactPlanModel['employees'][number]) =>
        employee.weeklyWorkingTime,
    },
  ] as const;

  return (
    <article
      aria-label={`Dienstplan ${model.periodLabel}`}
      className="compact-plan-document bg-white px-11 py-5 text-slate-950"
      style={{
        width: A4_DOCUMENT_WIDTH,
        minHeight: A4_DOCUMENT_HEIGHT,
      }}
    >
      <header className="mb-2 border-b border-black pb-2 text-center">
        <h1 className="text-[18px] leading-[22px] font-bold tracking-tight break-words">
          {model.title}
        </h1>
        <p className="mt-1 text-[11px] leading-4">
          <span className="font-semibold">{model.periodLabel}</span>
          <span className="text-slate-700">
            {' · '}Stand: {model.savedDateLabel}
          </span>
        </p>
      </header>

      <table className="w-full table-fixed border-collapse text-[9px] leading-[1.15] [&_tfoot_tr:last-child>*]:border-b-2 [&_thead_tr:first-child>*]:border-t-2 [&_tr>*]:border-r-2 [&_tr>:first-child]:border-l-2">
        <caption className="sr-only">
          Gespeicherter Dienstplan für {model.periodLabel}
        </caption>
        <colgroup>
          <col className="w-[8%]" />
          {model.employees.map((employee) => (
            <col key={employee.id} />
          ))}
          <col className="w-[8%]" />
          <col className="w-[18%]" />
        </colgroup>
        <thead>
          <tr>
            <th
              scope="col"
              className="border border-black bg-slate-200 px-1 py-1.5 text-center font-semibold"
            >
              Datum
            </th>
            {model.employees.map((employee) => (
              <th
                key={employee.id}
                scope="col"
                title={employee.fullName}
                className={`border border-black px-1 py-1.5 text-center font-semibold ${EMPLOYEE_COLOR_STYLES[employee.colorKey].compactHeaderClass}`}
              >
                <span
                  data-compact-employee-name
                  className="block [overflow-wrap:anywhere]"
                >
                  {employee.displayName}
                </span>
              </th>
            ))}
            <th
              scope="col"
              abbr="Rufbereitschaft"
              className="border border-black bg-slate-200 px-1 py-1.5 text-center font-semibold"
            >
              RB
            </th>
            <th
              scope="col"
              className="border border-black bg-slate-200 px-1 py-1.5 text-center font-semibold"
            >
              Bemerkung
            </th>
          </tr>
        </thead>
        <tbody className="[&>tr:first-child>*]:border-t-0 [&>tr:last-child>*]:border-b-0 [&>tr>:first-child]:border-l-black [&>tr>:last-child]:border-r-black">
          {model.days.map((day) => {
            const dayBackground = getDayBackground(day);

            return (
              <tr key={day.date} className={dayBackground}>
                <th
                  scope="row"
                  className={`border border-black px-1 py-[3px] text-center font-semibold whitespace-nowrap ${
                    day.isHoliday ? 'text-red-800' : 'text-slate-900'
                  }`}
                >
                  {day.dateLabel}
                </th>
                {model.employees.map((employee) => {
                  const entry = day.entries[employee.id];

                  return (
                    <td
                      key={employee.id}
                      aria-label={`${day.fullDateLabel}, ${employee.fullName}: ${
                        entry
                          ? `${entry.code}${entry.timeRange ? `, ${entry.timeRange}` : ''}`
                          : 'Kein Eintrag'
                      }`}
                      className="border border-black px-0.5 py-[2px] text-center align-middle"
                    >
                      {entry ? (
                        <span className="block">
                          <span className="block font-semibold break-words">
                            {entry.code}
                          </span>
                          {entry.timeRange ? (
                            <span className="mt-px block text-[8px] whitespace-nowrap text-black tabular-nums">
                              {entry.timeRange}
                            </span>
                          ) : null}
                        </span>
                      ) : null}
                    </td>
                  );
                })}
                <td
                  aria-label={`${day.fullDateLabel}, Rufbereitschaft: ${day.onCallEmployeeName ?? 'Keine Rufbereitschaft'}`}
                  className="border border-black px-0.5 py-[2px] text-center break-words"
                >
                  {day.onCallEmployeeName}
                </td>
                <td
                  aria-label={`${day.fullDateLabel}, Bemerkung${
                    day.schoolHolidayNames.length > 0
                      ? `, Schulferien Brandenburg: ${day.schoolHolidayNames.join(', ')}`
                      : ''
                  }${day.note ? `, ${day.note}` : ', keine Bemerkung'}`}
                  className={`border border-black px-1 py-[2px] align-middle [overflow-wrap:anywhere] whitespace-pre-wrap ${
                    day.isSchoolHoliday ? 'bg-amber-100' : ''
                  }`}
                >
                  {day.schoolHolidayBoundaryLabel ? (
                    <span className="block font-semibold text-amber-950">
                      {day.schoolHolidayBoundaryLabel}
                    </span>
                  ) : null}
                  {day.note ? (
                    <span
                      className={
                        day.schoolHolidayBoundaryLabel
                          ? 'mt-px block'
                          : undefined
                      }
                    >
                      {day.note}
                    </span>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          {footerRows.map((footerRow) => (
            <tr
              key={footerRow.label}
              className={`bg-slate-200 font-semibold ${
                footerRow.label === 'Ist'
                  ? '[&>*]:border-t-2 [&>*]:border-t-black'
                  : ''
              }`}
            >
              <th
                scope="row"
                className="border border-black px-1 py-1 text-center"
              >
                {footerRow.label}
              </th>
              {model.employees.map((employee) => (
                <td
                  key={employee.id}
                  className="border border-black px-0.5 py-1 text-center tabular-nums"
                >
                  {footerRow.getValue(employee)}
                </td>
              ))}
              <td className="border border-black" />
              <td className="border border-black" />
            </tr>
          ))}
        </tfoot>
      </table>

      {model.holidays.length > 0 ? (
        <section aria-label="Feiertage" className="mt-3 text-[9px] leading-4">
          <h2 className="sr-only">Feiertage</h2>
          <ul className="grid grid-cols-2 gap-x-6">
            {model.holidays.map((holiday) => (
              <li key={holiday.date} className="break-words">
                {holiday.label}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <footer className="mt-8 grid grid-cols-[1fr_2fr] gap-10 text-[10px]">
        <div className="flex items-center gap-2">
          <span className="shrink-0">Datum</span>
          <span aria-hidden="true" className="h-px flex-1 bg-black" />
        </div>
        <div className="flex items-center gap-2">
          <span className="shrink-0">Freigabe / Unterschrift</span>
          <span aria-hidden="true" className="h-px flex-1 bg-black" />
        </div>
      </footer>
    </article>
  );
}
