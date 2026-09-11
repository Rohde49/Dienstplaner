import { describe, expect, it } from 'vitest';

import { formatWeeklyWorkingTime } from '../../../src/renderer/features/team/employeeWorkingTime';

describe('Wochenarbeitszeit in der Teamübersicht', () => {
  it.each([
    [0, '00:00 Std./Woche'],
    [2_345, '39:05 Std./Woche'],
    [10_080, '168:00 Std./Woche'],
  ])('stellt %i Minuten als %s dar', (minutes, expected) => {
    expect(formatWeeklyWorkingTime(minutes)).toBe(expected);
  });
});
