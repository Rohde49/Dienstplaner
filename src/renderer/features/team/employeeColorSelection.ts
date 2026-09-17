import {
  EMPLOYEE_COLOR_KEYS,
  type EmployeeColorKey,
} from '../../../shared/schemas';

/** Wählt die erste noch nicht vergebene Mitarbeiterfarbe aus. */
export function getFirstAvailableEmployeeColorKey(
  usedColorKeys: Iterable<EmployeeColorKey>,
): EmployeeColorKey {
  const usedColorKeySet = new Set(usedColorKeys);

  return (
    EMPLOYEE_COLOR_KEYS.find((colorKey) => !usedColorKeySet.has(colorKey)) ??
    EMPLOYEE_COLOR_KEYS[0]
  );
}
