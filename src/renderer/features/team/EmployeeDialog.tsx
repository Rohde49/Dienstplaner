import type { FormEvent, ReactNode } from 'react';
import { useState } from 'react';
import { toast } from 'sonner';

import {
  employeeInputSchema,
  type Employee,
  type EmployeeColorKey,
} from '../../../shared/schemas';
import {
  Alert,
  Button,
  DialogClose,
  DialogContent,
  DialogRoot,
  DialogTrigger,
  FormField,
  Input,
  Spinner,
} from '../../components/ui';
import { EMPLOYEE_COLOR_OPTIONS } from './employeeColorStyles';

type EmployeeDialogProps = {
  employee?: Employee;
  trigger: ReactNode;
  onSaved: (employee: Employee) => void;
};

type EmployeeFormState = {
  firstName: string;
  lastName: string;
  role: string;
  weeklyWorkingHours: string;
  colorKey: EmployeeColorKey;
  active: boolean;
};

type EmployeeFormErrors = Partial<Record<keyof EmployeeFormState, string>>;

/** Erstellt die leeren oder bereits vorhandenen Werte für das Formular. */
function createInitialFormState(employee?: Employee): EmployeeFormState {
  if (employee) {
    return {
      firstName: employee.firstName,
      lastName: employee.lastName,
      role: employee.role,
      weeklyWorkingHours: String(employee.weeklyWorkingMinutes / 60),
      colorKey: employee.colorKey,
      active: employee.active,
    };
  }

  return {
    firstName: '',
    lastName: '',
    role: '',
    weeklyWorkingHours: '',
    colorKey: 'blue',
    active: true,
  };
}

const schemaPathToFormField: Record<string, keyof EmployeeFormState> = {
  firstName: 'firstName',
  lastName: 'lastName',
  role: 'role',
  weeklyWorkingMinutes: 'weeklyWorkingHours',
  colorKey: 'colorKey',
  active: 'active',
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Der Mitarbeiter konnte nicht gespeichert werden.';
}

/** Zeigt das Formular zum Anlegen oder Bearbeiten eines Mitarbeiters an. */
export function EmployeeDialog({
  employee,
  trigger,
  onSaved,
}: EmployeeDialogProps) {
  const [open, setOpen] = useState(false);
  const [formState, setFormState] = useState<EmployeeFormState>(() =>
    createInitialFormState(employee),
  );
  const [formErrors, setFormErrors] = useState<EmployeeFormErrors>({});
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function resetForm(): void {
    setFormState(createInitialFormState(employee));
    setFormErrors({});
    setSubmissionError(null);
  }

  function handleOpenChange(nextOpen: boolean): void {
    if (isSaving) {
      return;
    }

    resetForm();
    setOpen(nextOpen);
  }

  function updateField<Key extends keyof EmployeeFormState>(
    field: Key,
    value: EmployeeFormState[Key],
  ): void {
    setFormState((currentState) => ({
      ...currentState,
      [field]: value,
    }));

    setFormErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined,
    }));
  }

  /** Prüft das Formular und speichert den neuen oder geänderten Mitarbeiter. */
  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setSubmissionError(null);

    const normalizedHours = formState.weeklyWorkingHours
      .trim()
      .replace(',', '.');

    const weeklyHours =
      normalizedHours === '' ? Number.NaN : Number(normalizedHours);

    const validationResult = employeeInputSchema.safeParse({
      firstName: formState.firstName,
      lastName: formState.lastName,
      role: formState.role,
      weeklyWorkingMinutes: Math.round(weeklyHours * 60),
      colorKey: formState.colorKey,
      active: formState.active,
    });

    if (!validationResult.success) {
      const nextErrors: EmployeeFormErrors = {};

      for (const issue of validationResult.error.issues) {
        const schemaField = String(issue.path[0]);
        const formField = schemaPathToFormField[schemaField];

        if (formField && !nextErrors[formField]) {
          nextErrors[formField] =
            formField === 'weeklyWorkingHours' && !Number.isFinite(weeklyHours)
              ? 'Die Wochenarbeitszeit ist erforderlich.'
              : issue.message;
        }
      }

      setFormErrors(nextErrors);
      return;
    }

    setIsSaving(true);

    try {
      const savedEmployee = employee
        ? await window.dienstplaner.employees.update(
            employee.id,
            validationResult.data,
          )
        : await window.dienstplaner.employees.create(validationResult.data);

      onSaved(savedEmployee);

      toast.success(
        employee
          ? `${savedEmployee.firstName} ${savedEmployee.lastName} wurde aktualisiert.`
          : `${savedEmployee.firstName} ${savedEmployee.lastName} wurde angelegt.`,
      );

      setOpen(false);
      resetForm();
    } catch (error) {
      setSubmissionError(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <DialogRoot open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent
        title={employee ? 'Mitarbeiter bearbeiten' : 'Mitarbeiter hinzufügen'}
        description={
          employee
            ? 'Passe die Daten des Mitarbeiters für die Dienstplanung an.'
            : 'Erfasse die grundlegenden Daten für die Dienstplanung.'
        }
      >
        <form onSubmit={(event) => void handleSubmit(event)}>
          <div className="space-y-5 p-6">
            {submissionError ? (
              <Alert title="Speichern fehlgeschlagen" variant="danger">
                {submissionError}
              </Alert>
            ) : null}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                htmlFor="employee-first-name"
                label="Vorname"
                required
                error={formErrors.firstName}
              >
                <Input
                  id="employee-first-name"
                  name="firstName"
                  autoComplete="given-name"
                  required
                  value={formState.firstName}
                  aria-invalid={Boolean(formErrors.firstName)}
                  aria-describedby={
                    formErrors.firstName
                      ? 'employee-first-name-error'
                      : undefined
                  }
                  onChange={(event) =>
                    updateField('firstName', event.target.value)
                  }
                />
              </FormField>

              <FormField
                htmlFor="employee-last-name"
                label="Nachname"
                required
                error={formErrors.lastName}
              >
                <Input
                  id="employee-last-name"
                  name="lastName"
                  autoComplete="family-name"
                  required
                  value={formState.lastName}
                  aria-invalid={Boolean(formErrors.lastName)}
                  aria-describedby={
                    formErrors.lastName ? 'employee-last-name-error' : undefined
                  }
                  onChange={(event) =>
                    updateField('lastName', event.target.value)
                  }
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                htmlFor="employee-role"
                label="Rolle"
                required
                error={formErrors.role}
              >
                <Input
                  id="employee-role"
                  name="role"
                  autoComplete="organization-title"
                  required
                  value={formState.role}
                  aria-invalid={Boolean(formErrors.role)}
                  aria-describedby={
                    formErrors.role ? 'employee-role-error' : undefined
                  }
                  onChange={(event) => updateField('role', event.target.value)}
                />
              </FormField>

              <FormField
                htmlFor="employee-weekly-hours"
                label="Wochenarbeitszeit"
                required
                error={formErrors.weeklyWorkingHours}
                hint="Angabe in Stunden, zum Beispiel 39,5"
              >
                <Input
                  id="employee-weekly-hours"
                  name="weeklyWorkingHours"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="168"
                  step="0.25"
                  required
                  value={formState.weeklyWorkingHours}
                  aria-invalid={Boolean(formErrors.weeklyWorkingHours)}
                  aria-describedby={
                    formErrors.weeklyWorkingHours
                      ? 'employee-weekly-hours-error'
                      : 'employee-weekly-hours-hint'
                  }
                  onChange={(event) =>
                    updateField('weeklyWorkingHours', event.target.value)
                  }
                />
              </FormField>
            </div>

            <fieldset>
              <legend className="text-app-text text-sm font-medium">
                Farbe
              </legend>

              <p className="text-app-muted mt-1 text-xs">
                Die Namen bleiben unabhängig von der Farbe sichtbar.
              </p>

              <div className="mt-3 grid grid-cols-3 gap-2">
                {EMPLOYEE_COLOR_OPTIONS.map((option) => {
                  const selected = formState.colorKey === option.key;

                  return (
                    <label
                      key={option.key}
                      className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                        selected
                          ? 'border-app-primary bg-app-primary-subtle text-app-text'
                          : 'border-app-border text-app-muted hover:bg-slate-50'
                      }`}
                    >
                      <input
                        className="peer sr-only"
                        type="radio"
                        name="colorKey"
                        value={option.key}
                        checked={selected}
                        onChange={() => updateField('colorKey', option.key)}
                      />

                      <span
                        aria-hidden="true"
                        className={`size-4 rounded-full ${option.dotClass} peer-focus-visible:ring-app-primary peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2`}
                      />

                      <span>{option.label}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <label className="border-app-border flex items-start gap-3 rounded-md border p-3">
              <input
                className="mt-0.5 size-4 accent-blue-600"
                type="checkbox"
                checked={formState.active}
                onChange={(event) =>
                  updateField('active', event.target.checked)
                }
              />

              <span>
                <span className="text-app-text block text-sm font-medium">
                  Aktiv
                </span>
                <span className="text-app-muted mt-0.5 block text-xs">
                  Der Mitarbeiter wird bei neuen Dienstplänen berücksichtigt.
                </span>
              </span>
            </label>
          </div>

          <div className="border-app-border flex justify-end gap-2 border-t bg-slate-50 px-6 py-4">
            <DialogClose asChild>
              <Button variant="secondary" disabled={isSaving}>
                Abbrechen
              </Button>
            </DialogClose>

            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Spinner
                    size="sm"
                    label="Mitarbeiter wird gespeichert"
                    className="text-white"
                  />
                  Wird gespeichert …
                </>
              ) : employee ? (
                'Änderungen speichern'
              ) : (
                'Mitarbeiter speichern'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </DialogRoot>
  );
}
