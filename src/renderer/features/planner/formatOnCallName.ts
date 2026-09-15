type PlannerEmployeeName = {
  firstName: string;
  lastName: string;
};

export function formatOnCallName(employee: PlannerEmployeeName): string {
  return `${employee.firstName.charAt(0)}. ${employee.lastName}`;
}
