import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  EMPLOYEE_IPC_CHANNELS,
  ENTRY_TYPE_IPC_CHANNELS,
  MONTHLY_PLAN_IPC_CHANNELS,
} from '../../../src/shared/ipc';
import { registerEmployeeIpcHandlers } from '../../../src/main/ipc/registerEmployeeIpcHandlers';
import { registerEntryTypeIpcHandlers } from '../../../src/main/ipc/registerEntryTypeIpcHandlers';
import { registerMonthlyPlanIpcHandlers } from '../../../src/main/ipc/registerMonthlyPlanIpcHandlers';

const mocks = vi.hoisted(() => ({
  handle: vi.fn(),
  listEmployees: vi.fn(),
  createEmployee: vi.fn(),
  updateEmployee: vi.fn(),
  reorderEmployees: vi.fn(),
  deleteEmployee: vi.fn(),
  listEntryTypes: vi.fn(),
  createEntryType: vi.fn(),
  updateEntryType: vi.fn(),
  reorderEntryTypes: vi.fn(),
  deleteEntryType: vi.fn(),
  listMonthlyPlans: vi.fn(),
  getMonthlyPlan: vi.fn(),
  createMonthlyPlan: vi.fn(),
  saveMonthlyPlan: vi.fn(),
  removeMonthlyPlan: vi.fn(),
}));

vi.mock('electron', () => ({
  ipcMain: { handle: mocks.handle },
}));

vi.mock('../../../src/main/storage/employeesRepository', () => ({
  listEmployees: mocks.listEmployees,
  createEmployee: mocks.createEmployee,
  updateEmployee: mocks.updateEmployee,
  reorderEmployees: mocks.reorderEmployees,
  deleteEmployee: mocks.deleteEmployee,
}));

vi.mock('../../../src/main/storage/entryTypesRepository', () => ({
  listEntryTypes: mocks.listEntryTypes,
  createEntryType: mocks.createEntryType,
  updateEntryType: mocks.updateEntryType,
  reorderEntryTypes: mocks.reorderEntryTypes,
  deleteEntryType: mocks.deleteEntryType,
}));

vi.mock('../../../src/main/storage/monthlyPlansRepository', () => ({
  listMonthlyPlans: mocks.listMonthlyPlans,
  getMonthlyPlan: mocks.getMonthlyPlan,
  createMonthlyPlan: mocks.createMonthlyPlan,
  saveMonthlyPlan: mocks.saveMonthlyPlan,
  removeMonthlyPlan: mocks.removeMonthlyPlan,
}));

type IpcHandler = (
  event: unknown,
  ...arguments_: unknown[]
) => Promise<unknown>;

function getHandler(channel: string): IpcHandler {
  const registration = mocks.handle.mock.calls.find(
    ([registeredChannel]) => registeredChannel === channel,
  );

  expect(registration).toBeDefined();
  return registration?.[1] as IpcHandler;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('IPC-Registrierungen der Datenspeicher', () => {
  it('leitet alle Mitarbeiteranfragen mit unveränderten Argumenten weiter', async () => {
    const input = { firstName: 'Anna' };
    const orderedIds = ['employee-2', 'employee-1'];
    mocks.listEmployees.mockResolvedValueOnce(['employees']);
    mocks.createEmployee.mockResolvedValueOnce('created');
    mocks.updateEmployee.mockResolvedValueOnce('updated');
    mocks.reorderEmployees.mockResolvedValueOnce('reordered');
    mocks.deleteEmployee.mockResolvedValueOnce(undefined);

    registerEmployeeIpcHandlers();

    await expect(getHandler(EMPLOYEE_IPC_CHANNELS.list)({})).resolves.toEqual([
      'employees',
    ]);
    await expect(
      getHandler(EMPLOYEE_IPC_CHANNELS.create)({}, input),
    ).resolves.toBe('created');
    await expect(
      getHandler(EMPLOYEE_IPC_CHANNELS.update)({}, 'employee-1', input),
    ).resolves.toBe('updated');
    await expect(
      getHandler(EMPLOYEE_IPC_CHANNELS.reorder)({}, orderedIds),
    ).resolves.toBe('reordered');
    await expect(
      getHandler(EMPLOYEE_IPC_CHANNELS.remove)({}, 'employee-1'),
    ).resolves.toBeUndefined();

    expect(mocks.createEmployee).toHaveBeenCalledWith(input);
    expect(mocks.updateEmployee).toHaveBeenCalledWith('employee-1', input);
    expect(mocks.reorderEmployees).toHaveBeenCalledWith(orderedIds);
    expect(mocks.deleteEmployee).toHaveBeenCalledWith('employee-1');
  });

  it('leitet alle Eintragsartenanfragen mit unveränderten Argumenten weiter', async () => {
    const input = { code: 'F' };
    const orderedIds = ['entry-type-2', 'entry-type-1'];
    mocks.listEntryTypes.mockResolvedValueOnce(['entry-types']);
    mocks.createEntryType.mockResolvedValueOnce('created');
    mocks.updateEntryType.mockResolvedValueOnce('updated');
    mocks.reorderEntryTypes.mockResolvedValueOnce('reordered');
    mocks.deleteEntryType.mockResolvedValueOnce(undefined);

    registerEntryTypeIpcHandlers();

    await expect(getHandler(ENTRY_TYPE_IPC_CHANNELS.list)({})).resolves.toEqual(
      ['entry-types'],
    );
    await expect(
      getHandler(ENTRY_TYPE_IPC_CHANNELS.create)({}, input),
    ).resolves.toBe('created');
    await expect(
      getHandler(ENTRY_TYPE_IPC_CHANNELS.update)({}, 'entry-type-1', input),
    ).resolves.toBe('updated');
    await expect(
      getHandler(ENTRY_TYPE_IPC_CHANNELS.reorder)({}, orderedIds),
    ).resolves.toBe('reordered');
    await expect(
      getHandler(ENTRY_TYPE_IPC_CHANNELS.remove)({}, 'entry-type-1'),
    ).resolves.toBeUndefined();

    expect(mocks.createEntryType).toHaveBeenCalledWith(input);
    expect(mocks.updateEntryType).toHaveBeenCalledWith('entry-type-1', input);
    expect(mocks.reorderEntryTypes).toHaveBeenCalledWith(orderedIds);
    expect(mocks.deleteEntryType).toHaveBeenCalledWith('entry-type-1');
  });

  it('leitet alle Monatsplananfragen mit unveränderten Argumenten weiter', async () => {
    const input = { year: 2026, month: 9 };
    const plan = { id: 'plan-1' };
    mocks.listMonthlyPlans.mockResolvedValueOnce(['plans']);
    mocks.getMonthlyPlan.mockResolvedValueOnce('loaded');
    mocks.createMonthlyPlan.mockResolvedValueOnce('created');
    mocks.saveMonthlyPlan.mockResolvedValueOnce('saved');
    mocks.removeMonthlyPlan.mockResolvedValueOnce(undefined);

    registerMonthlyPlanIpcHandlers();

    await expect(
      getHandler(MONTHLY_PLAN_IPC_CHANNELS.list)({}),
    ).resolves.toEqual(['plans']);
    await expect(
      getHandler(MONTHLY_PLAN_IPC_CHANNELS.get)({}, 'plan-1'),
    ).resolves.toBe('loaded');
    await expect(
      getHandler(MONTHLY_PLAN_IPC_CHANNELS.create)({}, input),
    ).resolves.toBe('created');
    await expect(
      getHandler(MONTHLY_PLAN_IPC_CHANNELS.save)({}, plan),
    ).resolves.toBe('saved');
    await expect(
      getHandler(MONTHLY_PLAN_IPC_CHANNELS.remove)({}, 'plan-1'),
    ).resolves.toBeUndefined();

    expect(mocks.getMonthlyPlan).toHaveBeenCalledWith('plan-1');
    expect(mocks.createMonthlyPlan).toHaveBeenCalledWith(input);
    expect(mocks.saveMonthlyPlan).toHaveBeenCalledWith(plan);
    expect(mocks.removeMonthlyPlan).toHaveBeenCalledWith('plan-1');
  });
});
