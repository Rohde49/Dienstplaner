import {
  EMPLOYEE_COLOR_KEYS,
  type EmployeeColorKey,
} from '../../shared/schemas';

export type EmployeeColorStyle = {
  label: string;
  selectionDotClass: string;
  plannerHeaderClass: string;
  compactHeaderClass: string;
  plannerCellClass: string;
};

/** Ordnet jeder Mitarbeiterfarbe alle wiederverwendbaren Darstellungsvarianten zu. */
export const EMPLOYEE_COLOR_STYLES: Record<
  EmployeeColorKey,
  EmployeeColorStyle
> = {
  blue: {
    label: 'Blau',
    selectionDotClass: 'bg-blue-500',
    plannerHeaderClass: 'border-blue-300 bg-blue-100 text-blue-900',
    compactHeaderClass: 'bg-blue-200 text-black',
    plannerCellClass: 'border-blue-200 bg-blue-50/50 text-blue-950',
  },
  teal: {
    label: 'Türkis',
    selectionDotClass: 'bg-teal-500',
    plannerHeaderClass: 'border-teal-300 bg-teal-100 text-teal-900',
    compactHeaderClass: 'bg-teal-200 text-black',
    plannerCellClass: 'border-teal-200 bg-teal-50/50 text-teal-950',
  },
  green: {
    label: 'Grün',
    selectionDotClass: 'bg-green-500',
    plannerHeaderClass: 'border-green-300 bg-green-100 text-green-900',
    compactHeaderClass: 'bg-green-200 text-black',
    plannerCellClass: 'border-green-200 bg-green-50/50 text-green-950',
  },
  yellow: {
    label: 'Gelb',
    selectionDotClass: 'bg-yellow-500',
    plannerHeaderClass: 'border-yellow-300 bg-yellow-100 text-yellow-900',
    compactHeaderClass: 'bg-yellow-200 text-black',
    plannerCellClass: 'border-yellow-200 bg-yellow-50/50 text-yellow-950',
  },
  orange: {
    label: 'Orange',
    selectionDotClass: 'bg-orange-500',
    plannerHeaderClass: 'border-orange-300 bg-orange-100 text-orange-900',
    compactHeaderClass: 'bg-orange-200 text-black',
    plannerCellClass: 'border-orange-200 bg-orange-50/50 text-orange-950',
  },
  red: {
    label: 'Rot',
    selectionDotClass: 'bg-red-500',
    plannerHeaderClass: 'border-red-300 bg-red-100 text-red-900',
    compactHeaderClass: 'bg-red-200 text-black',
    plannerCellClass: 'border-red-200 bg-red-50/50 text-red-950',
  },
  pink: {
    label: 'Rosa',
    selectionDotClass: 'bg-pink-500',
    plannerHeaderClass: 'border-pink-300 bg-pink-100 text-pink-900',
    compactHeaderClass: 'bg-pink-200 text-black',
    plannerCellClass: 'border-pink-200 bg-pink-50/50 text-pink-950',
  },
  purple: {
    label: 'Lila',
    selectionDotClass: 'bg-purple-500',
    plannerHeaderClass: 'border-purple-300 bg-purple-100 text-purple-900',
    compactHeaderClass: 'bg-purple-200 text-black',
    plannerCellClass: 'border-purple-200 bg-purple-50/50 text-purple-950',
  },
  brown: {
    label: 'Braun',
    selectionDotClass: 'bg-[#8b5e3c]',
    plannerHeaderClass: 'border-[#c89f7a] bg-[#ead8c7] text-[#4a2f1d]',
    compactHeaderClass: 'bg-[#dcc2aa] text-black',
    plannerCellClass: 'border-[#ddc4ad] bg-[#f7f0e9] text-[#3f2819]',
  },
};

/** Stellt alle Mitarbeiterfarben in der fachlich festgelegten Reihenfolge bereit. */
export const EMPLOYEE_COLOR_OPTIONS = EMPLOYEE_COLOR_KEYS.map((key) => ({
  key,
  ...EMPLOYEE_COLOR_STYLES[key],
}));
