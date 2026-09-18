import type { FormEvent, ReactNode } from 'react';
import { useState } from 'react';
import { toast } from 'sonner';

import {
  calculateAttendanceMinutes,
  calculateWorkingMinutes,
  entryTypeInputSchema,
  type CalculationType,
  type EntryType,
  type TimeValues,
} from '../../../shared/schemas';
import {
  formatDuration,
  normalizeClockTime,
  parseDurationInput,
} from '../../../shared/calculations';
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

type EntryTypeDialogProps = {
  entryType?: EntryType;
  trigger: ReactNode;
  onSaved: (entryType: EntryType) => void;
};

type DurationFormField =
  | 'workingWithoutNightReadinessDuration'
  | 'nightReadinessDuration'
  | 'pauseDuration'
  | 'nightWorkDuration';

type EntryTypeFormState = {
  code: string;
  name: string;
  calculationType: CalculationType;
  startTime: string;
  endTime: string;
  workingWithoutNightReadinessDuration: string;
  nightReadinessDuration: string;
  pauseDuration: string;
  nightWorkDuration: string;
};

type EntryTypeFormField =
  keyof EntryTypeFormState | 'workingDuration' | 'attendanceDuration';

type EntryTypeFormErrors = Partial<Record<EntryTypeFormField, string>>;

type DurationFieldDefinition = {
  field: DurationFormField;
  schemaField: keyof TimeValues;
  label: string;
};

const durationFields: DurationFieldDefinition[] = [
  {
    field: 'workingWithoutNightReadinessDuration',
    schemaField: 'workingWithoutNightReadinessMinutes',
    label: 'Reine Arbeitszeit',
  },
  {
    field: 'nightReadinessDuration',
    schemaField: 'nightReadinessMinutes',
    label: 'Nachtbereitschaft',
  },
  {
    field: 'pauseDuration',
    schemaField: 'pauseMinutes',
    label: 'Pause',
  },
  {
    field: 'nightWorkDuration',
    schemaField: 'nightWorkMinutes',
    label: 'Nachtarbeit',
  },
];

const schemaPathToFormField: Record<string, EntryTypeFormField> = {
  code: 'code',
  name: 'name',
  calculationType: 'calculationType',
  startTime: 'startTime',
  endTime: 'endTime',
  'timeValues.attendanceMinutes': 'attendanceDuration',
  'timeValues.pauseMinutes': 'pauseDuration',
  'timeValues.workingMinutes': 'workingDuration',
  'timeValues.workingWithoutNightReadinessMinutes':
    'workingWithoutNightReadinessDuration',
  'timeValues.nightReadinessMinutes': 'nightReadinessDuration',
  'timeValues.nightWorkMinutes': 'nightWorkDuration',
};

const formFieldIds: Record<EntryTypeFormField, string> = {
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
  pauseDuration: 'entry-type-pauseDuration',
  nightWorkDuration: 'entry-type-nightWorkDuration',
};

/** Setzt den Fokus nach einer fehlgeschlagenen Prüfung auf das erste Feld. */
function focusFirstInvalidField(errors: EntryTypeFormErrors): void {
  const firstField = Object.keys(errors)[0] as EntryTypeFormField | undefined;

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
    const usesFixedTimeValues = entryType.calculationType === 'fixed';

    return {
      code: entryType.code,
      name: entryType.name,
      calculationType: entryType.calculationType,
      startTime: entryType.startTime ?? '',
      endTime: entryType.endTime ?? '',
      workingWithoutNightReadinessDuration: usesFixedTimeValues
        ? formatDuration(
            entryType.timeValues.workingWithoutNightReadinessMinutes,
          )
        : '',
      nightReadinessDuration: usesFixedTimeValues
        ? formatDuration(entryType.timeValues.nightReadinessMinutes)
        : '',
      pauseDuration: usesFixedTimeValues
        ? formatDuration(entryType.timeValues.pauseMinutes)
        : '',
      nightWorkDuration: usesFixedTimeValues
        ? formatDuration(entryType.timeValues.nightWorkMinutes)
        : '',
    };
  }

  return {
    code: '',
    name: '',
    calculationType: 'fixed',
    startTime: '',
    endTime: '',
    workingWithoutNightReadinessDuration: '',
    nightReadinessDuration: '',
    pauseDuration: '',
    nightWorkDuration: '',
  };
}

/** Ermittelt die nur angezeigte Arbeitszeit (mit NB) aus den beiden Eingabewerten. */
function calculateWorkingDuration(formState: EntryTypeFormState): string {
  const workingWithoutNightReadiness = parseDurationInput(
    formState.workingWithoutNightReadinessDuration,
  );
  const nightReadiness = parseDurationInput(formState.nightReadinessDuration);

  if (!workingWithoutNightReadiness || !nightReadiness) {
    return '';
  }

  const workingMinutes = calculateWorkingMinutes(
    workingWithoutNightReadiness.minutes,
    nightReadiness.minutes,
  );

  return Number.isSafeInteger(workingMinutes)
    ? formatDuration(workingMinutes)
    : '';
}

/** Ermittelt die nur angezeigte Anwesenheitszeit aus Arbeitszeit und Pause. */
function calculateAttendanceDuration(formState: EntryTypeFormState): string {
  const workingDuration = calculateWorkingDuration(formState);
  const working = parseDurationInput(workingDuration);
  const pause = parseDurationInput(formState.pauseDuration);

  if (!working || !pause) {
    return '';
  }

  const attendanceMinutes = calculateAttendanceMinutes(
    working.minutes,
    pause.minutes,
  );

  return Number.isSafeInteger(attendanceMinutes)
    ? formatDuration(attendanceMinutes)
    : '';
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

  const usesFixedTimeValues = formState.calculationType === 'fixed';
  const calculatedWorkingDuration = usesFixedTimeValues
    ? calculateWorkingDuration(formState)
    : '';
  const calculatedAttendanceDuration = usesFixedTimeValues
    ? calculateAttendanceDuration(formState)
    : '';

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

  /** Leert abhängige Werte, sobald keine festen Zeitwerte verwendet werden. */
  function updateCalculationType(calculationType: CalculationType): void {
    setFormState((currentState) => ({
      ...currentState,
      calculationType,
      ...(calculationType !== 'fixed'
        ? {
            startTime: '',
            endTime: '',
            workingWithoutNightReadinessDuration: '',
            nightReadinessDuration: '',
            pauseDuration: '',
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
        'Bitte geben Sie eine gültige Uhrzeit ein, zum Beispiel 5:30 oder 530.';
    }

    if (endTimeInput !== '' && endTime === null) {
      nextErrors.endTime =
        'Bitte geben Sie eine gültige Uhrzeit ein, zum Beispiel 14:30 oder 1430.';
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
      pauseMinutes: 0,
      workingMinutes: 0,
      workingWithoutNightReadinessMinutes: 0,
      nightReadinessMinutes: 0,
      nightWorkMinutes: 0,
    };

    if (usesFixedTimeValues) {
      for (const definition of durationFields) {
        const parsedValue = parseDurationInput(formState[definition.field]);

        if (!parsedValue) {
          nextErrors[definition.field] =
            formState[definition.field].trim() === ''
              ? 'Der Zeitwert ist erforderlich.'
              : 'Bitte geben Sie eine gültige Dauer ein, zum Beispiel 5:30 oder 530.';
          continue;
        }

        timeValues[definition.schemaField] = parsedValue.minutes;
      }

      if (
        !nextErrors.workingWithoutNightReadinessDuration &&
        !nextErrors.nightReadinessDuration &&
        !nextErrors.pauseDuration
      ) {
        const workingMinutes = calculateWorkingMinutes(
          timeValues.workingWithoutNightReadinessMinutes,
          timeValues.nightReadinessMinutes,
        );

        if (!Number.isSafeInteger(workingMinutes)) {
          nextErrors.workingDuration =
            'Die Summe ist zu groß, um zuverlässig gespeichert zu werden.';
        } else {
          timeValues.workingMinutes = workingMinutes;
          const attendanceMinutes = calculateAttendanceMinutes(
            workingMinutes,
            timeValues.pauseMinutes,
          );

          if (!Number.isSafeInteger(attendanceMinutes)) {
            nextErrors.attendanceDuration =
              'Die Summe ist zu groß, um zuverlässig gespeichert zu werden.';
          } else {
            timeValues.attendanceMinutes = attendanceMinutes;
          }
        }
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
      startTime: usesFixedTimeValues ? startTime : null,
      endTime: usesFixedTimeValues ? endTime : null,
      timeValues,
      active: entryType?.active ?? true,
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

                      <div>
                        <dt className="text-app-text inline font-medium">
                          Freier Tag:
                        </dt>{' '}
                        <dd className="inline">
                          Der Eintrag wird als freier Tag gezählt. Uhrzeiten und
                          Zeitwerte bleiben leer beziehungsweise bei 0:00.
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

            {usesFixedTimeValues ? (
              <>
                <fieldset className="border-app-border rounded-lg border p-4">
                  <legend className="text-app-text px-1 text-sm font-semibold">
                    Uhrzeiten
                  </legend>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      htmlFor="entry-type-start-time"
                      label="Startzeit"
                      error={formErrors.startTime}
                      hint="Zum Beispiel 530 oder 5:30"
                    >
                      <Input
                        id="entry-type-start-time"
                        inputMode="decimal"
                        placeholder="HH:MM"
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
                      hint="Zum Beispiel 1430 oder 14:30"
                    >
                      <Input
                        id="entry-type-end-time"
                        inputMode="decimal"
                        placeholder="HH:MM"
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
                        side="right"
                        align="center"
                      >
                        <p>
                          Vier Werte werden eingegeben; Arbeitszeit mit
                          Nachtbereitschaft und Anwesenheitszeit berechnet die
                          Anwendung automatisch.
                        </p>

                        <dl className="mt-3 space-y-1.5 text-xs leading-5">
                          <div>
                            <dt className="text-app-text inline font-medium">
                              Reine Arbeitszeit:
                            </dt>{' '}
                            <dd className="inline">
                              Tatsächlich geleistete aktive Arbeitszeit.
                            </dd>
                          </div>
                          <div>
                            <dt className="text-app-text inline font-medium">
                              Pause:
                            </dt>{' '}
                            <dd className="inline">
                              Gehört zur Anwesenheit, zählt aber nicht als
                              Arbeitszeit.
                            </dd>
                          </div>
                          <div>
                            <dt className="text-app-text inline font-medium">
                              Nachtarbeit:
                            </dt>{' '}
                            <dd className="inline">
                              Anteil der reinen Arbeitszeit zwischen 21:00 und
                              06:00 Uhr.
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
                          Ohne Nachtanteil werden Nachtarbeit und
                          Nachtbereitschaft mit 0:00 angegeben. Eingaben wie 8,
                          530, 5:30 oder 5,30 werden automatisch
                          vereinheitlicht.
                        </p>

                        <div className="border-app-border mt-3 border-t pt-3 text-xs leading-5">
                          <p className="text-app-text font-medium">
                            Automatische Berechnung
                          </p>
                          <p className="mt-1">
                            Arbeitszeit (mit NB) = Reine Arbeitszeit +
                            Nachtbereitschaft
                          </p>
                          <p>Anwesenheitszeit = Arbeitszeit (mit NB) + Pause</p>
                        </div>
                      </InfoPopover>
                    </span>
                  </legend>

                  <div className="pb-3">
                    <p className="text-app-text mb-2 text-sm font-semibold">
                      Allgemeine Zeitwerte
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        htmlFor="entry-type-workingWithoutNightReadinessDuration"
                        label="Reine Arbeitszeit"
                        error={formErrors.workingWithoutNightReadinessDuration}
                      >
                        <Input
                          id="entry-type-workingWithoutNightReadinessDuration"
                          className="border-app-primary-border"
                          inputMode="decimal"
                          placeholder="H:MM"
                          required
                          value={formState.workingWithoutNightReadinessDuration}
                          aria-invalid={Boolean(
                            formErrors.workingWithoutNightReadinessDuration,
                          )}
                          onBlur={() =>
                            normalizeDurationField(
                              'workingWithoutNightReadinessDuration',
                            )
                          }
                          onChange={(event) =>
                            updateField(
                              'workingWithoutNightReadinessDuration',
                              event.target.value,
                            )
                          }
                        />
                      </FormField>

                      <FormField
                        htmlFor="entry-type-pauseDuration"
                        label="Pause"
                        error={formErrors.pauseDuration}
                      >
                        <Input
                          id="entry-type-pauseDuration"
                          className="border-app-primary-border"
                          inputMode="decimal"
                          placeholder="H:MM"
                          required
                          value={formState.pauseDuration}
                          aria-invalid={Boolean(formErrors.pauseDuration)}
                          onBlur={() => normalizeDurationField('pauseDuration')}
                          onChange={(event) =>
                            updateField('pauseDuration', event.target.value)
                          }
                        />
                      </FormField>
                    </div>
                  </div>

                  <div className="border-app-border border-t py-3">
                    <p className="text-app-text mb-2 text-sm font-semibold">
                      Nachtwerte
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        htmlFor="entry-type-nightWorkDuration"
                        label="Nachtarbeit"
                        error={formErrors.nightWorkDuration}
                      >
                        <Input
                          id="entry-type-nightWorkDuration"
                          className="border-app-primary-border"
                          inputMode="decimal"
                          placeholder="H:MM"
                          required
                          value={formState.nightWorkDuration}
                          aria-invalid={Boolean(formErrors.nightWorkDuration)}
                          onBlur={() =>
                            normalizeDurationField('nightWorkDuration')
                          }
                          onChange={(event) =>
                            updateField('nightWorkDuration', event.target.value)
                          }
                        />
                      </FormField>

                      <FormField
                        htmlFor="entry-type-nightReadinessDuration"
                        label="Nachtbereitschaft"
                        error={formErrors.nightReadinessDuration}
                      >
                        <Input
                          id="entry-type-nightReadinessDuration"
                          className="border-app-primary-border"
                          inputMode="decimal"
                          placeholder="H:MM"
                          required
                          value={formState.nightReadinessDuration}
                          aria-invalid={Boolean(
                            formErrors.nightReadinessDuration,
                          )}
                          onBlur={() =>
                            normalizeDurationField('nightReadinessDuration')
                          }
                          onChange={(event) =>
                            updateField(
                              'nightReadinessDuration',
                              event.target.value,
                            )
                          }
                        />
                      </FormField>
                    </div>
                  </div>

                  <div className="border-app-border border-t pt-3">
                    <p className="text-app-text mb-2 text-sm font-semibold">
                      Berechnete Werte
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        htmlFor="entry-type-workingDuration"
                        label="Arbeitszeit (mit NB)"
                        error={formErrors.workingDuration}
                      >
                        <output
                          id="entry-type-workingDuration"
                          className="border-app-border bg-app-surface-disabled text-app-muted flex h-9 w-full items-center rounded-md border px-3 text-sm tabular-nums"
                          aria-live="polite"
                          aria-invalid={Boolean(formErrors.workingDuration)}
                        >
                          {calculatedWorkingDuration || 'H:MM'}
                        </output>
                      </FormField>

                      <FormField
                        htmlFor="entry-type-attendanceDuration"
                        label="Anwesenheitszeit"
                        error={formErrors.attendanceDuration}
                      >
                        <output
                          id="entry-type-attendanceDuration"
                          className="border-app-border bg-app-surface-disabled text-app-muted flex h-9 w-full items-center rounded-md border px-3 text-sm tabular-nums"
                          aria-live="polite"
                          aria-invalid={Boolean(formErrors.attendanceDuration)}
                        >
                          {calculatedAttendanceDuration || 'H:MM'}
                        </output>
                      </FormField>
                    </div>
                  </div>
                </fieldset>
              </>
            ) : (
              <Alert
                title={
                  formState.calculationType === 'weeklyWorkingTime'
                    ? 'Zeitwerte werden beim Einplanen berechnet'
                    : 'Dieser Eintrag zählt als freier Tag'
                }
              >
                {formState.calculationType === 'weeklyWorkingTime'
                  ? 'Die tägliche Arbeits- und Anwesenheitszeit wird aus der Wochenarbeitszeit des jeweiligen Mitarbeiters abgeleitet. Uhrzeiten und feste Zeitwerte sind deshalb nicht erforderlich.'
                  : 'Für einen freien Tag werden keine Uhrzeiten und keine Zeitwerte gespeichert.'}
              </Alert>
            )}
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
