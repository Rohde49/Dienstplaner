import type {
  Employee,
  EmployeeInput,
  EmployeeOrder,
  EntryType,
  EntryTypeInput,
  EntryTypeOrder,
  MonthlyPlan,
  MonthlyPlanInput,
  MonthlyPlanLoadResult,
  MonthlyPlanSummary,
  PdfExportRequest,
  PdfExportResult,
} from '../schemas';

/** Beschreibt die verfügbaren Funktionen der Mitarbeiterverwaltung. */
export type EmployeesApi = {
  list: () => Promise<Employee[]>;
  create: (input: EmployeeInput) => Promise<Employee>;
  update: (id: string, input: EmployeeInput) => Promise<Employee>;
  reorder: (orderedIds: EmployeeOrder) => Promise<Employee[]>;
  remove: (id: string) => Promise<void>;
};

/** Beschreibt die verfügbaren Funktionen der Eintragsartenverwaltung. */
export type EntryTypesApi = {
  list: () => Promise<EntryType[]>;
  create: (input: EntryTypeInput) => Promise<EntryType>;
  update: (id: string, input: EntryTypeInput) => Promise<EntryType>;
  reorder: (orderedIds: EntryTypeOrder) => Promise<EntryType[]>;
  remove: (id: string) => Promise<void>;
};

/** Beschreibt die verfügbaren Funktionen für gespeicherte Monatspläne. */
export type MonthlyPlansApi = {
  list: () => Promise<MonthlyPlanSummary[]>;
  get: (id: string) => Promise<MonthlyPlanLoadResult>;
  create: (input: MonthlyPlanInput) => Promise<MonthlyPlan>;
  save: (plan: MonthlyPlan) => Promise<MonthlyPlan>;
  remove: (id: string) => Promise<void>;
};

/** Beschreibt ausschließlich den bestätigten lokalen PDF-Export. */
export type PdfExportApi = {
  export: (request: PdfExportRequest) => Promise<PdfExportResult>;
};

/** Beschreibt den begrenzten Lebenszykluszugriff der Oberfläche. */
export type AppApi = {
  onCloseRequested: (listener: () => void) => () => void;
  confirmClose: () => void;
};

/** Beschreibt alle Funktionen, die der Oberfläche bereitgestellt werden. */
export type DienstplanerApi = {
  app: AppApi;
  employees: EmployeesApi;
  entryTypes: EntryTypesApi;
  monthlyPlans: MonthlyPlansApi;
  pdfExport: PdfExportApi;
};
