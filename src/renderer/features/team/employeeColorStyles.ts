import {
  EMPLOYEE_COLOR_KEYS,
  type EmployeeColorKey,
} from '../../../shared/schemas';

type EmployeeColorStyle = {
  label: string;
  dotClass: string;
};

/** Ordnet jeder Mitarbeiterfarbe eine Bezeichnung und Darstellung zu. */
export const EMPLOYEE_COLOR_STYLES: Record<
  EmployeeColorKey,
  EmployeeColorStyle
> = {
  blue: {
    label: 'Blau',
    dotClass: 'bg-blue-500',
  },
  emerald: {
    label: 'Grün',
    dotClass: 'bg-emerald-500',
  },
  amber: {
    label: 'Gelb',
    dotClass: 'bg-amber-500',
  },
  violet: {
    label: 'Violett',
    dotClass: 'bg-violet-500',
  },
  rose: {
    label: 'Rosa',
    dotClass: 'bg-rose-500',
  },
  cyan: {
    label: 'Türkis',
    dotClass: 'bg-cyan-500',
  },
};

/** Stellt alle Mitarbeiterfarben als auswählbare Optionen bereit. */
export const EMPLOYEE_COLOR_OPTIONS = EMPLOYEE_COLOR_KEYS.map((key) => ({
  key,
  ...EMPLOYEE_COLOR_STYLES[key],
}));
