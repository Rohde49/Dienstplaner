import type { FormEvent, ReactNode } from 'react';
import { useState } from 'react';
import { toast } from 'sonner';

import {
  entryTypeInputSchema,
  type CalculationType,
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
  InfoPopover,
  Input,
  Select,
  Spinner,
} from '../../components/ui';
import { CALCULATION_TYPE_LABELS } from './calculationTypeLabels';
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

const primaryDurationField: DurationFieldDefinition = {
  field: 'workingWithoutNightReadinessDuration',
  schemaField: 'workingWithoutNightReadinessMinutes',
  label: 'reine Arbeitszeit',
};

const additionalDurationFields: DurationFieldDefinition[] = [
  {
    field: 'attendanceDuration',
    schemaField: 'attendanceMinutes',
    label: 'Anwesenheitszeit',
  },
  {
    field: 'workingDuration',
    schemaField: 'workingMinutes',
    label: 'Arbeitszeit (mit NB)',
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

const durationFields = [primaryDurationField, ...additionalDurationFields];

const schemaPathToFormField: Record<string, keyof EntryTypeFormState> = {
  code: 'code',
  name: 'name',
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

const formFieldIds: Record<keyof EntryTypeFormState, string> = {
  code: 'entry-type-code',
  name: 'entry-type-name',
  calculationType: 'entry-type-calculation',
  startTime: 'entry-type-start-time',
  endTime: 'entry-type-end-time',
  attendanceDuration: 'entry-type-attendanceDuration',
  workingDuration: 'entry-type-workingDuration',
  workingWithoutNightReadinessDuration:
    'entry-type-workingWithoutNightReadinessDuration',
  nightReadinessDuration: 'entry-type-nightReadinessDuration',
  nightWorkDuration: 'entry-type-nightWorkDuration',
  active: 'entry-type-active',
};

/** Setzt den Fokus nach einer fehlgeschlagenen Prüfung auf das erste Feld. */
function focusFirstInvalidField(errors: EntryTypeFormErrors): void {
  const firstField = Object.keys(errors)[0] as
    keyof EntryTypeFormState | undefined;

  if (!firstField) {
    return;
  }

  window.setTimeout(() => {
    document.getElementById(formFieldIds[firstField])?.focus();
  }, 0);
}

/** Erstellt die leeren oder bereits vorhandenen Formularwerte. */
function createInitialFormState(entryType?: EntryType): EntryTypeFormState {
  if (entryType) {
    const usesWeeklyWorkingTime =
      entryType.calculationType === 'weeklyWorkingTime';

    return {
      code: entryType.code,
      name: entryType.name,
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
    calculationType: 'fixed',
    startTime: '',
    endTime: '',
    attendanceDuration: '',
    workingDuration: '',
    workingWithoutNightReadinessDuration: '',
    nightReadinessDuration: '',
    nightWorkDuration: '',
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
      focusFirstInvalidField(nextErrors);
      return;
    }

    const validationResult = entryTypeInputSchema.safeParse({
      code: formState.code,
      name: formState.name,
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
      focusFirstInvalidField(nextErrors);
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
        <form
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          noValidate
          onSubmit={(event) => void handleSubmit(event)}
        >
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-6">
            {submissionError ? (
              <Alert title="Speichern fehlgeschlagen" variant="danger">
                {submissionError}
              </Alert>
            ) : null}

            <div className="grid grid-cols-[12rem_minmax(0,1fr)] gap-4">
              <FormField
                htmlFor="entry-type-code"
                label="Kürzel"
                error={formErrors.code}
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

            <div className="max-w-sm">
              <FormField
                htmlFor="entry-type-calculation"
                label="Berechnungsart"
                error={formErrors.calculationType}
                labelAction={
                  <InfoPopover
                    title="Bedeutung der Berechnungsarten"
                    triggerLabel="Bedeutung der Berechnungsarten anzeigen"
                  >
                    <dl className="space-y-2.5">
                      <div>
                        <dt className="text-app-text inline font-medium">
                          Feste Zeitwerte:
                        </dt>{' '}
                        <dd className="inline">
                          Uhrzeiten und Zeitwerte werden manuell eingegeben und
                          beim Einplanen unverändert übernommen.
                        </dd>
                      </div>

                      <div>
                        <dt className="text-app-text inline font-medium">
                          Wochenarbeitszeit:
                        </dt>{' '}
                        <dd className="inline">
                          Die anrechenbare Arbeitszeit wird beim Einplanen aus
                          der Wochenarbeitszeit des Mitarbeiters berechnet.
                          Uhrzeiten und feste Zeitwerte sind für diese Auswahl
                          deaktiviert.
                        </dd>
                      </div>
                    </dl>

                    <p className="border-app-border mt-3 border-t pt-3 text-xs leading-5">
                      Allein die Berechnungsart steuert, ob die Uhrzeit- und
                      Zeitwertfelder verfügbar sind.
                    </p>
                  </InfoPopover>
                }
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

            <fieldset className="border-app-border rounded-lg border p-4">
              <legend className="text-app-text px-1 text-sm font-semibold">
                Uhrzeiten
              </legend>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  htmlFor="entry-type-start-time"
                  label="Startzeit"
                  error={formErrors.startTime}
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
              <legend className="px-1">
                <span className="text-app-text flex items-center gap-1.5 text-sm font-semibold">
                  Zeitwerte
                  <InfoPopover
                    title="Bedeutung der Zeitwerte"
                    triggerLabel="Bedeutung der Zeitwerte anzeigen"
                  >
                    <dl className="space-y-2.5">
                      <div>
                        <dt className="text-app-text inline font-medium">
                          Anwesenheitszeit:
                        </dt>{' '}
                        <dd className="inline">
                          Gesamter Zeitraum aus reiner Arbeitszeit,
                          Nachtbereitschaft und Pausen.
                        </dd>
                      </div>

                      <div>
                        <dt className="text-app-text inline font-medium">
                          Arbeitszeit (mit NB):
                        </dt>{' '}
                        <dd className="inline">
                          Summe aus reiner Arbeitszeit und Nachtbereitschaft.
                        </dd>
                      </div>

                      <div>
                        <dt className="text-app-text inline font-medium">
                          Reine Arbeitszeit:
                        </dt>{' '}
                        <dd className="inline">
                          Tatsächlich geleistete aktive Arbeitszeit. Die
                          Nachtarbeit ist darin als gesondert ausgewiesener
                          Anteil enthalten.
                        </dd>
                      </div>

                      <div>
                        <dt className="text-app-text inline font-medium">
                          Nachtarbeit:
                        </dt>{' '}
                        <dd className="inline">
                          Anteil der reinen Arbeitszeit, der zwischen 21:00 und
                          06:00 Uhr geleistet wird.
                        </dd>
                      </div>

                      <div>
                        <dt className="text-app-text inline font-medium">
                          Nachtbereitschaft:
                        </dt>{' '}
                        <dd className="inline">
                          Passive Arbeitszeit während eines Nachtdienstes.
                        </dd>
                      </div>
                    </dl>

                    <p className="border-app-border mt-3 border-t pt-3 text-xs leading-5">
                      Die Eingabe erfolgt im Format HH:mm. Punkt und Komma
                      werden ebenfalls als Trennzeichen akzeptiert.
                    </p>

                    <p className="mt-2 text-xs leading-5">
                      Die Zeitwerte werden separat eingegeben. Die dargestellten
                      Zusammenhänge dienen als Eingabehilfe und werden nicht
                      automatisch geprüft.
                    </p>
                  </InfoPopover>
                </span>
              </legend>

              <div className="border-app-primary-border bg-app-primary-subtle mb-4 rounded-md border p-3">
                <FormField
                  htmlFor={`entry-type-${primaryDurationField.field}`}
                  label={primaryDurationField.label}
                  error={formErrors[primaryDurationField.field]}
                  hint="Zentraler Wert für spätere Arbeitszeitberechnungen"
                >
                  <Input
                    id={`entry-type-${primaryDurationField.field}`}
                    inputMode="decimal"
                    placeholder="HH:mm"
                    disabled={usesWeeklyWorkingTime}
                    required={!usesWeeklyWorkingTime}
                    value={formState[primaryDurationField.field]}
                    onBlur={() =>
                      normalizeDurationField(primaryDurationField.field)
                    }
                    onChange={(event) =>
                      updateField(
                        primaryDurationField.field,
                        event.target.value,
                      )
                    }
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {additionalDurationFields.map((definition) => (
                  <FormField
                    key={definition.field}
                    htmlFor={`entry-type-${definition.field}`}
                    label={definition.label}
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

          <div className="border-app-border bg-app-surface-muted flex shrink-0 justify-end gap-2 border-t px-6 py-4">
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
