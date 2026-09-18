export type BrandenburgSchoolHolidayName =
  | 'Herbstferien'
  | 'Weihnachtsferien'
  | 'Winterferien'
  | 'Osterferien'
  | 'Pfingstferien'
  | 'Sommerferien';

type BrandenburgSchoolHolidayPeriod = {
  name: BrandenburgSchoolHolidayName;
  startDate: string;
  endDate: string;
};

export type BrandenburgSchoolHolidayDay = {
  name: BrandenburgSchoolHolidayName;
  isFirstDay: boolean;
  isLastDay: boolean;
};

export type SchoolHolidayCoverageStatus =
  'covered' | 'expiring' | 'partial' | 'unavailable';

/** Offiziell veröffentlichter Zeitraum der feststehenden Brandenburger Schulferien. */
export const BRANDENBURG_SCHOOL_HOLIDAY_COVERAGE = {
  startDate: '2022-09-01',
  endDate: '2030-08-17',
  warningStartDate: '2029-09-01',
  firstSchoolYear: '2022/23',
  lastSchoolYear: '2029/30',
} as const;

/**
 * Feststehende Ferienzeiträume aus Anlage 1 der VV Schulbetrieb.
 * Schulabhängige variable Ferientage sind bewusst nicht enthalten.
 */
const BRANDENBURG_SCHOOL_HOLIDAY_PERIODS = [
  { name: 'Herbstferien', startDate: '2022-10-24', endDate: '2022-11-05' },
  {
    name: 'Weihnachtsferien',
    startDate: '2022-12-22',
    endDate: '2023-01-03',
  },
  { name: 'Winterferien', startDate: '2023-01-30', endDate: '2023-02-03' },
  { name: 'Osterferien', startDate: '2023-04-03', endDate: '2023-04-14' },
  { name: 'Sommerferien', startDate: '2023-07-13', endDate: '2023-08-26' },
  { name: 'Herbstferien', startDate: '2023-10-23', endDate: '2023-11-04' },
  {
    name: 'Weihnachtsferien',
    startDate: '2023-12-23',
    endDate: '2024-01-05',
  },
  { name: 'Winterferien', startDate: '2024-02-05', endDate: '2024-02-09' },
  { name: 'Osterferien', startDate: '2024-03-25', endDate: '2024-04-05' },
  { name: 'Sommerferien', startDate: '2024-07-18', endDate: '2024-08-31' },
  { name: 'Herbstferien', startDate: '2024-10-21', endDate: '2024-11-02' },
  {
    name: 'Weihnachtsferien',
    startDate: '2024-12-23',
    endDate: '2024-12-31',
  },
  { name: 'Winterferien', startDate: '2025-02-03', endDate: '2025-02-08' },
  { name: 'Osterferien', startDate: '2025-04-14', endDate: '2025-04-25' },
  { name: 'Pfingstferien', startDate: '2025-06-10', endDate: '2025-06-10' },
  { name: 'Sommerferien', startDate: '2025-07-24', endDate: '2025-09-06' },
  { name: 'Herbstferien', startDate: '2025-10-20', endDate: '2025-11-01' },
  {
    name: 'Weihnachtsferien',
    startDate: '2025-12-22',
    endDate: '2026-01-02',
  },
  { name: 'Winterferien', startDate: '2026-02-02', endDate: '2026-02-07' },
  { name: 'Osterferien', startDate: '2026-03-30', endDate: '2026-04-10' },
  { name: 'Pfingstferien', startDate: '2026-05-26', endDate: '2026-05-26' },
  { name: 'Sommerferien', startDate: '2026-07-09', endDate: '2026-08-22' },
  { name: 'Herbstferien', startDate: '2026-10-19', endDate: '2026-10-30' },
  {
    name: 'Weihnachtsferien',
    startDate: '2026-12-23',
    endDate: '2027-01-02',
  },
  { name: 'Winterferien', startDate: '2027-02-01', endDate: '2027-02-06' },
  { name: 'Osterferien', startDate: '2027-03-22', endDate: '2027-04-03' },
  { name: 'Pfingstferien', startDate: '2027-05-18', endDate: '2027-05-18' },
  { name: 'Sommerferien', startDate: '2027-07-01', endDate: '2027-08-14' },
  { name: 'Herbstferien', startDate: '2027-10-11', endDate: '2027-10-23' },
  {
    name: 'Weihnachtsferien',
    startDate: '2027-12-23',
    endDate: '2027-12-31',
  },
  { name: 'Winterferien', startDate: '2028-01-31', endDate: '2028-02-05' },
  { name: 'Osterferien', startDate: '2028-04-10', endDate: '2028-04-22' },
  { name: 'Sommerferien', startDate: '2028-06-29', endDate: '2028-08-12' },
  { name: 'Herbstferien', startDate: '2028-10-02', endDate: '2028-10-14' },
  {
    name: 'Weihnachtsferien',
    startDate: '2028-12-22',
    endDate: '2029-01-02',
  },
  { name: 'Winterferien', startDate: '2029-01-29', endDate: '2029-02-03' },
  { name: 'Osterferien', startDate: '2029-03-26', endDate: '2029-04-06' },
  { name: 'Pfingstferien', startDate: '2029-05-22', endDate: '2029-05-22' },
  { name: 'Sommerferien', startDate: '2029-06-28', endDate: '2029-08-11' },
  { name: 'Herbstferien', startDate: '2029-10-01', endDate: '2029-10-12' },
  {
    name: 'Weihnachtsferien',
    startDate: '2029-12-21',
    endDate: '2030-01-04',
  },
  { name: 'Winterferien', startDate: '2030-02-04', endDate: '2030-02-09' },
  { name: 'Osterferien', startDate: '2030-04-15', endDate: '2030-04-26' },
  { name: 'Sommerferien', startDate: '2030-07-04', endDate: '2030-08-17' },
] as const satisfies readonly BrandenburgSchoolHolidayPeriod[];

/** Ermittelt die feststehenden Brandenburger Schulferien eines ISO-Datums. */
export function getBrandenburgSchoolHolidays(
  date: string,
): BrandenburgSchoolHolidayDay[] {
  return BRANDENBURG_SCHOOL_HOLIDAY_PERIODS.filter(
    (period) => period.startDate <= date && date <= period.endDate,
  ).map((period) => ({
    name: period.name,
    isFirstDay: date === period.startDate,
    isLastDay: date === period.endDate,
  }));
}

/** Formatiert ausschließlich Beginn und Ende eines Ferienzeitraums sichtbar. */
export function formatSchoolHolidayBoundaryLabel(
  schoolHolidays: readonly BrandenburgSchoolHolidayDay[],
): string | null {
  const labels = schoolHolidays.flatMap((schoolHoliday) => {
    if (schoolHoliday.isFirstDay && schoolHoliday.isLastDay) {
      return [schoolHoliday.name];
    }

    if (schoolHoliday.isFirstDay) {
      return [`Beginn ${schoolHoliday.name}`];
    }

    return schoolHoliday.isLastDay ? [`Ende ${schoolHoliday.name}`] : [];
  });

  return labels.length > 0 ? labels.join(', ') : null;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function formatMonthDate(year: number, month: number, day: number): string {
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** Ordnet einen Planungsmonat dem veröffentlichten Ferien-Datenzeitraum zu. */
export function getSchoolHolidayCoverageStatus(
  year: number,
  month: number,
): SchoolHolidayCoverageStatus {
  const monthStart = formatMonthDate(year, month, 1);
  const monthEnd = formatMonthDate(year, month, getDaysInMonth(year, month));
  const coverage = BRANDENBURG_SCHOOL_HOLIDAY_COVERAGE;

  if (monthEnd < coverage.startDate || monthStart > coverage.endDate) {
    return 'unavailable';
  }

  if (monthStart < coverage.startDate || monthEnd > coverage.endDate) {
    return 'partial';
  }

  return monthStart >= coverage.warningStartDate ? 'expiring' : 'covered';
}
