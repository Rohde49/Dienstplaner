import type { FormEvent, ReactNode } from 'react';
import { useState } from 'react';
import { toast } from 'sonner';

import {
  entryTypeInputSchema,
  type CalculationType,
  type EntryCategory,
  type EntryType,
  type TimeValues,
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
  Select,
  Spinner,
} from '../../components/ui';
import {
  CALCULATION_TYPE_LABELS,
  ENTRY_CATEGORY_LABELS,
} from './entryTypeLabels';
import {
  formatDuration,
  normalizeClockTime,
  parseDurationInput,
} from './entryTypeTime';

type EntryTypeDialogProps = {
  entryType?: EntryType;
  trigger: ReactNode;
  onSaved: (entryType: EntryType) => void;
};

type DurationFormField =
  | 'attendanceDuration'
  | 'workingDuration'
  | 'workingWithoutNightReadinessDuration'
  | 'nightReadinessDuration'
  | 'nightWorkDuration';

type EntryTypeFormState = {
  code: string;
  name: string;
  category: EntryCategory;
  calculationType: CalculationType;
  startTime: string;
  endTime: string;
  attendanceDuration: string;
  workingDuration: string;
  workingWithoutNightReadinessDuration: string;
  nightReadinessDuration: string;
  nightWorkDuration: string;
  active: boolean;
};

type EntryTypeFormErrors = Partial<Record<keyof EntryTypeFormState, string>>;

type DurationFieldDefinition = {
  field: DurationFormField;
  schemaField: keyof TimeValues;
  label: string;
};

const durationFields: DurationFieldDefinition[] = [
  {
    field: 'attendanceDuration',
    schemaField: 'attendanceMinutes',
    label: 'Anwesenheitszeit',
  },
  {
    field: 'workingDuration',
    schemaField: 'workingMinutes',
    label: 'Arbeitszeit',
  },
  {
    field: 'workingWithoutNightReadinessDuration',
    schemaField: 'workingWithoutNightReadinessMinutes',
    label: 'Arbeitszeit ohne Nachtbereitschaft',
  },
  {
    field: 'nightReadinessDuration',
    schemaField: 'nightReadinessMinutes',
    label: 'Nachtbereitschaft',
  },
  {
    field: 'nightWorkDuration',
    schemaField: 'nightWorkMinutes',
    label: 'Nachtarbeit',
  },
];

const schemaPathToFormField: Record<string, keyof EntryTypeFormState> = {
  code: 'code',
  name: 'name',
  category: 'category',
  calculationType: 'calculationType',
  startTime: 'startTime',
  endTime: 'endTime',
  'timeValues.attendanceMinutes': 'attendanceDuration',
  'timeValues.workingMinutes': 'workingDuration',
  'timeValues.workingWithoutNightReadinessMinutes':
    'workingWithoutNightReadinessDuration',
  'timeValues.nightReadinessMinutes': 'nightReadinessDuration',
  'timeValues.nightWorkMinutes': 'nightWorkDuration',
  active: 'active',
};

/** Erstellt die leeren oder bereits vorhandenen Formularwerte. */
function createInitialFormState(entryType?: EntryType): EntryTypeFormState {
  if (entryType) {
    const usesWeeklyWorkingTime =
      entryType.calculationType === 'weeklyWorkingTime';

    return {
      code: entryType.code,
      name: entryType.name,
      category: entryType.category,
      calculationType: entryType.calculationType,
      startTime: entryType.startTime ?? '',
      endTime: entryType.endTime ?? '',
      attendanceDuration: usesWeeklyWorkingTime
        ? ''
        : formatDuration(entryType.timeValues.attendanceMinutes),
      workingDuration: usesWeeklyWorkingTime
        ? ''
        : formatDuration(entryType.timeValues.workingMinutes),
      workingWithoutNightReadinessDuration: usesWeeklyWorkingTime
        ? ''
        : formatDuration(
            entryType.timeValues.workingWithoutNightReadinessMinutes,
          ),
      nightReadinessDuration: usesWeeklyWorkingTime
        ? ''
        : formatDuration(entryType.timeValues.nightReadinessMinutes),
      nightWorkDuration: usesWeeklyWorkingTime
        ? ''
        : formatDuration(entryType.timeValues.nightWorkMinutes),
      active: entryType.active,
    };
  }

  return {
    code: '',
    name: '',
    category: 'duty',
    calculationType: 'fixed',
    startTime: '',
    endTime: '',
    attendanceDuration: '00:00',
    workingDuration: '00:00',
    workingWithoutNightReadinessDuration: '00:00',
    nightReadinessDuration: '00:00',
    nightWorkDuration: '00:00',
    active: true,
  };
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Der Planungseintrag konnte nicht gespeichert werden.';
}

/** Zeigt das Formular zum Anlegen oder Bearbeiten einer Eintragsart an. */
export function EntryTypeDialog({
  entryType,
  trigger,
  onSaved,
}: EntryTypeDialogProps) {
  const [open, setOpen] = useState(false);
  const [formState, setFormState] = useState<EntryTypeFormState>(() =>
    createInitialFormState(entryType),
  );
  const [formErrors, setFormErrors] = useState<EntryTypeFormErrors>({});
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const usesWeeklyWorkingTime =
    formState.calculationType === 'weeklyWorkingTime';

  function resetForm(): void {
    setFormState(createInitialFormState(entryType));
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

  function updateField<Key extends keyof EntryTypeFormState>(
    field: Key,
    value: EntryTypeFormState[Key],
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

  /** Leert abhängige Werte, sobald die Wochenarbeitszeit gewählt wird. */
  function updateCalculationType(calculationType: CalculationType): void {
    setFormState((currentState) => ({
      ...currentState,
      calculationType,
      ...(calculationType === 'weeklyWorkingTime'
        ? {
            startTime: '',
            endTime: '',
            attendanceDuration: '',
            workingDuration: '',
            workingWithoutNightReadinessDuration: '',
            nightReadinessDuration: '',
            nightWorkDuration: '',
          }
        : {}),
    }));
    setFormErrors({});
  }

  function normalizeClockField(field: 'startTime' | 'endTime'): void {
    const value = formState[field].trim();

    if (value === '') {
      return;
    }

    const normalizedValue = normalizeClockTime(value);

    if (normalizedValue !== null) {
      updateField(field, normalizedValue);
    }
  }

  function normalizeDurationField(field: DurationFormField): void {
    const parsedValue = parseDurationInput(formState[field]);

    if (parsedValue) {
      updateField(field, parsedValue.normalized);
    }
  }

  /** Prüft und speichert den neuen oder geänderten Planungseintrag. */
  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setSubmissionError(null);

    const nextErrors: EntryTypeFormErrors = {};
    const startTimeInput = formState.startTime.trim();
    const endTimeInput = formState.endTime.trim();
    const startTime =
      startTimeInput === '' ? null : normalizeClockTime(startTimeInput);
    const endTime =
      endTimeInput === '' ? null : normalizeClockTime(endTimeInput);

    if (startTimeInput !== '' && startTime === null) {
      nextErrors.startTime =
        'Bitte geben Sie eine gültige Uhrzeit im Format HH:mm ein.';
    }

    if (endTimeInput !== '' && endTime === null) {
      nextErrors.endTime =
        'Bitte geben Sie eine gültige Uhrzeit im Format HH:mm ein.';
    }

    if ((startTime === null) !== (endTime === null)) {
      const missingField = startTime === null ? 'startTime' : 'endTime';

      if (!nextErrors[missingField]) {
        nextErrors[missingField] =
          'Start- und Endzeit müssen gemeinsam angegeben werden.';
      }
    }

    const timeValues: TimeValues = {
      attendanceMinutes: 0,
      workingMinutes: 0,
      workingWithoutNightReadinessMinutes: 0,
      nightReadinessMinutes: 0,
      nightWorkMinutes: 0,
    };

    if (!usesWeeklyWorkingTime) {
      for (const definition of durationFields) {
        const parsedValue = parseDurationInput(formState[definition.field]);

        if (!parsedValue) {
          nextErrors[definition.field] =
            formState[definition.field].trim() === ''
              ? 'Der Zeitwert ist erforderlich.'
              : 'Bitte geben Sie eine Dauer im Format HH:mm ein.';
          continue;
        }

        timeValues[definition.schemaField] = parsedValue.minutes;
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setFormErrors(nextErrors);
      return;
    }

    const validationResult = entryTypeInputSchema.safeParse({
      code: formState.code,
      name: formState.name,
      category: formState.category,
      calculationType: formState.calculationType,
      startTime: usesWeeklyWorkingTime ? null : startTime,
      endTime: usesWeeklyWorkingTime ? null : endTime,
      timeValues,
      active: formState.active,
    });

    if (!validationResult.success) {
      for (const issue of validationResult.error.issues) {
        const schemaPath = issue.path.map(String).join('.');
        const formField = schemaPathToFormField[schemaPath];

        if (formField && !nextErrors[formField]) {
          nextErrors[formField] = issue.message;
        }
      }

      setFormErrors(nextErrors);
      return;
    }

    setIsSaving(true);

    try {
      const savedEntryType = entryType
        ? await window.dienstplaner.entryTypes.update(
            entryType.id,
            validationResult.data,
          )
        : await window.dienstplaner.entryTypes.create(validationResult.data);

      onSaved(savedEntryType);
      toast.success(
        entryType
          ? `${savedEntryType.code} – ${savedEntryType.name} wurde aktualisiert.`
          : `${savedEntryType.code} – ${savedEntryType.name} wurde angelegt.`,
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
        className="max-w-3xl"
        title={
          entryType ? 'Planungseintrag bearbeiten' : 'Planungseintrag anlegen'
        }
        description={
          entryType
            ? 'Passe die Eintragsart für zukünftige Dienstpläne an.'
            : 'Erfasse eine wiederverwendbare Eintragsart für die Dienstplanung.'
        }
      >
        <form onSubmit={(event) => void handleSubmit(event)}>
          <div className="space-y-5 p-6">
            {submissionError ? (
              <Alert title="Speichern fehlgeschlagen" variant="danger">
                {submissionError}
              </Alert>
            ) : null}

            <div className="grid grid-cols-[12rem_minmax(0,1fr)] gap-4">
              <FormField
                htmlFor="entry-type-code"
                label="Kürzel"
                required
                error={formErrors.code}
                hint="Zum Beispiel SN/F, D1 oder U"
              >
                <Input
                  id="entry-type-code"
                  maxLength={20}
                  required
                  value={formState.code}
                  aria-invalid={Boolean(formErrors.code)}
                  onChange={(event) => updateField('code', event.target.value)}
                />
              </FormField>

              <FormField
                htmlFor="entry-type-name"
                label="Bezeichnung"
                required
                error={formErrors.name}
              >
                <Input
                  id="entry-type-name"
                  maxLength={100}
                  required
                  value={formState.name}
                  aria-invalid={Boolean(formErrors.name)}
                  onChange={(event) => updateField('name', event.target.value)}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                htmlFor="entry-type-category"
                label="Kategorie"
                required
                error={formErrors.category}
              >
                <Select
                  id="entry-type-category"
                  value={formState.category}
                  onChange={(event) =>
                    updateField('category', event.target.value as EntryCategory)
                  }
                >
                  {Object.entries(ENTRY_CATEGORY_LABELS).map(
                    ([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ),
                  )}
                </Select>
              </FormField>

              <FormField
                htmlFor="entry-type-calculation"
                label="Berechnungsart"
                required
                error={formErrors.calculationType}
              >
                <Select
                  id="entry-type-calculation"
                  value={formState.calculationType}
                  onChange={(event) =>
                    updateCalculationType(event.target.value as CalculationType)
                  }
                >
                  {Object.entries(CALCULATION_TYPE_LABELS).map(
                    ([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ),
                  )}
                </Select>
              </FormField>
            </div>

            {usesWeeklyWorkingTime ? (
              <Alert title="Automatische Zeitberechnung">
                Die Arbeitszeit wird beim Einplanen aus der Wochenarbeitszeit
                des Mitarbeiters berechnet. Uhrzeiten und feste Zeitwerte werden
                nicht gespeichert.
              </Alert>
            ) : null}

            <fieldset className="border-app-border rounded-lg border p-4">
              <legend className="text-app-text px-1 text-sm font-semibold">
                Uhrzeiten
              </legend>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  htmlFor="entry-type-start-time"
                  label="Startzeit"
                  error={formErrors.startTime}
                  hint="Optional, zum Beispiel 13:00"
                >
                  <Input
                    id="entry-type-start-time"
                    inputMode="decimal"
                    placeholder="HH:mm"
                    disabled={usesWeeklyWorkingTime}
                    value={formState.startTime}
                    aria-invalid={Boolean(formErrors.startTime)}
                    onBlur={() => normalizeClockField('startTime')}
                    onChange={(event) =>
                      updateField('startTime', event.target.value)
                    }
                  />
                </FormField>

                <FormField
                  htmlFor="entry-type-end-time"
                  label="Endzeit"
                  error={formErrors.endTime}
                  hint="Nur gemeinsam mit der Startzeit"
                >
                  <Input
                    id="entry-type-end-time"
                    inputMode="decimal"
                    placeholder="HH:mm"
                    disabled={usesWeeklyWorkingTime}
                    value={formState.endTime}
                    aria-invalid={Boolean(formErrors.endTime)}
                    onBlur={() => normalizeClockField('endTime')}
                    onChange={(event) =>
                      updateField('endTime', event.target.value)
                    }
                  />
                </FormField>
              </div>
            </fieldset>

            <fieldset className="border-app-border rounded-lg border p-4">
              <legend className="text-app-text px-1 text-sm font-semibold">
                Zeitwerte
              </legend>

              <p className="text-app-muted mb-4 text-xs">
                Eingabe als HH:mm. Punkt und Komma werden ebenfalls als
                Trennzeichen akzeptiert.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {durationFields.map((definition) => (
                  <FormField
                    key={definition.field}
                    htmlFor={`entry-type-${definition.field}`}
                    label={definition.label}
                    required={!usesWeeklyWorkingTime}
                    error={formErrors[definition.field]}
                  >
                    <Input
                      id={`entry-type-${definition.field}`}
                      inputMode="decimal"
                      placeholder="HH:mm"
                      disabled={usesWeeklyWorkingTime}
                      required={!usesWeeklyWorkingTime}
                      value={formState[definition.field]}
                      aria-invalid={Boolean(formErrors[definition.field])}
                      onBlur={() => normalizeDurationField(definition.field)}
                      onChange={(event) =>
                        updateField(definition.field, event.target.value)
                      }
                    />
                  </FormField>
                ))}
              </div>
            </fieldset>

            <label className="border-app-border flex items-start gap-3 rounded-md border p-3">
              <input
                className="accent-app-primary mt-0.5 size-4"
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
                  Der Planungseintrag wird für neue Einträge im Dienstplan
                  angeboten.
                </span>
              </span>
            </label>
          </div>

          <div className="border-app-border bg-app-surface-muted flex justify-end gap-2 border-t px-6 py-4">
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
                    label="Planungseintrag wird gespeichert"
                    className="text-app-on-primary"
                  />
                  Wird gespeichert …
                </>
              ) : entryType ? (
                'Änderungen speichern'
              ) : (
                'Planungseintrag speichern'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </DialogRoot>
  );
}
