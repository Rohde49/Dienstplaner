# Datenmodell des Dienstplaners

Dieses Dokument beschreibt das fachliche Zielmodell des aktuellen Projekts. Die
technischen Feldnamen sind englisch, während die Bezeichnungen in der
Benutzeroberfläche deutsch bleiben.

Die Mitarbeiterverwaltung ist bereits umgesetzt. Die Modelle für
Eintragsarten und Monatspläne legen den vorgesehenen Zielzustand fest und werden
erst mit den zugehörigen Funktionsbereichen umgesetzt. Eine Beschreibung in
diesem Dokument bedeutet daher nicht automatisch, dass die Funktion schon im
Programm vorhanden ist.

## 1. Grundentscheidungen

- Die Anwendung verwaltet genau ein Team. Eine eigene Entität `Team` wird nicht
  benötigt.
- Alle Daten werden lokal als JSON gespeichert. Eine relationale Datenbank und
  relationale Fremdschlüssel sind nicht vorgesehen.
- Zod-Schemas sind die zentrale, zur Laufzeit geprüfte Datenbeschreibung. Die
  TypeScript-Typen werden aus ihnen abgeleitet.
- Jede eigenständig identifizierbare Entität erhält eine UUID als
  Zeichenkette. Neue IDs werden mit `crypto.randomUUID()` erzeugt.
- Datumswerte verwenden `YYYY-MM-DD`, Uhrzeiten `HH:mm` und Zeitpunkte das
  ISO-Format.
- Zeitdauern werden als nichtnegative ganze Minuten gespeichert. Dadurch
  entstehen bei Berechnungen keine Rundungsfehler durch Dezimalstunden.
- Stammdaten besitzen einen Aktivierungsstatus. Inaktive Stammdaten bleiben
  erhalten, werden aber für neue Planungen nicht mehr angeboten.
- Bereits angelegte Monatspläne verwenden Snapshots. Spätere Änderungen an
  Mitarbeitern oder Eintragsarten verändern einen vorhandenen Plan daher nicht
  rückwirkend.
- Berechnete Anzeige- und Auswertungswerte werden nicht gespeichert.

## 2. Überblick und Beziehungen

Das Modell besteht aus zwei Stammdatenbereichen und dem Monatsplan als
zusammenhängendem Aggregat:

```text
Employee ── Snapshot beim Erstellen ──> PlanEmployee
                                           │
                                           │ wird innerhalb des Plans verwendet
                                           ▼
MonthlyPlan ── enthält ──> PlanDay ── enthält ──> PlanEntry
     │                       │                    ▲
     │                       └─ Rufbereitschaft   │
     │                          verweist auf      │
     └─ enthält PlanEmployee[]                   │
                                                  │
EntryType ── Snapshot beim Setzen ────────────────┘
```

- `Employee` enthält die aktuell verwalteten Mitarbeiterstammdaten.
- `EntryType` beschreibt auswählbare Dienste, Abwesenheiten und freie Tage.
- `MonthlyPlan` enthält genau einen Dienstplan für einen Monat und ein Jahr.
- `PlanEmployee` ist die unveränderliche Mitarbeiterkopie innerhalb eines
  Monatsplans.
- `PlanDay` bildet einen Kalendertag mit Bemerkung, Rufbereitschaft und
  Planeinträgen ab.
- `PlanEntry` ist der an einem Tag gesetzte Snapshot einer Eintragsart für einen
  Planmitarbeiter.

`PlanEmployee`, `PlanDay` und `PlanEntry` werden nicht in eigenen Dateien
gespeichert. Sie gehören vollständig zu ihrem `MonthlyPlan`.

## 3. Gemeinsame Werttypen

### Mitarbeiterfarben

```ts
const EMPLOYEE_COLOR_KEYS = [
  'blue',
  'emerald',
  'amber',
  'violet',
  'rose',
  'cyan',
] as const;

type EmployeeColorKey = (typeof EMPLOYEE_COLOR_KEYS)[number];
```

Gespeichert wird nur der kontrollierte Farbschlüssel. Die tatsächlichen
Darstellungsfarben werden zentral in der Oberfläche zugeordnet. Dadurch bleiben
die gespeicherten Daten unabhängig von konkreten CSS-Farbwerten.

### Berechnungsarten

```ts
type CalculationType = 'fixed' | 'weeklyWorkingTime';
```

- `fixed` verwendet die in der Eintragsart hinterlegten festen Zeitwerte.
- `weeklyWorkingTime` ermittelt die anrechenbare Arbeitszeit beim Setzen des
  Planeintrags aus der im Plan gespeicherten Wochenarbeitszeit des Mitarbeiters.

### Zeitwerte

```ts
interface TimeValues {
  attendanceMinutes: number;
  workingMinutes: number;
  workingWithoutNightReadinessMinutes: number;
  nightReadinessMinutes: number;
  nightWorkMinutes: number;
}
```

Die fünf Werte haben folgende Bedeutung:

- `attendanceMinutes`: gesamte Anwesenheitsdauer einschließlich Pausen,
- `workingMinutes`: insgesamt angerechnete Arbeitszeit einschließlich
  Nachtbereitschaft; in der Oberfläche „Arbeitszeit (mit NB)“,
- `workingWithoutNightReadinessMinutes`: reine Arbeitszeit ohne
  Nachtbereitschaft; in der Oberfläche „Reine Arbeitszeit“,
- `nightReadinessMinutes`: enthaltene Nachtbereitschaft,
- `nightWorkMinutes`: enthaltene Nachtarbeit.

Alle Werte sind eigenständig gespeicherte, nichtnegative ganze Minuten. Beginn
und Ende dienen der zeitlichen Darstellung; die Anwendung leitet aus ihnen
keine Zeitdauer ab. Dadurch kann beispielsweise auch ein über Mitternacht
laufender Dienst eindeutig durch seine gespeicherten Zeitwerte beschrieben
werden.

Die erwarteten fachlichen Zusammenhänge zwischen den Zeitwerten können später
als Plausibilitätsprüfung ergänzt werden. Das Datenmodell allein führt keine
arbeitsrechtliche oder fachliche Bewertung der eingegebenen Werte durch.

## 4. Mitarbeiter (`Employee`)

Status: **bereits umgesetzt** in `src/shared/schemas/employee.ts`.

```ts
interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  weeklyWorkingMinutes: number;
  colorKey: EmployeeColorKey;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Entscheidungen

- `role` ist bewusst frei eingebbarer Text. Das Modell schreibt keine feste
  Rollenliste vor.
- `weeklyWorkingMinutes` speichert die vertragliche Wochenarbeitszeit in
  Minuten. Die Umrechnung in Stunden erfolgt nur für Eingabe und Anzeige.
- `colorKey` verweist auf die festgelegte Farbpalette und enthält keinen frei
  eingegebenen Hex-Wert.
- `active` ermöglicht das Deaktivieren, ohne den Datensatz zu verlieren.
- `createdAt` und `updatedAt` machen Anlage und letzte Änderung
  nachvollziehbar.

Die aktuell umgesetzte Validierung begrenzt Vorname, Nachname und Rolle auf
jeweils 1 bis 100 Zeichen. Die Wochenarbeitszeit muss eine ganze Minutenzahl
zwischen 0 und 10.080 Minuten sein.

### Mitarbeiterdatei

```ts
interface EmployeesFile {
  schemaVersion: 1;
  updatedAt: string;
  employees: Employee[];
}
```

## 5. Eintragsart (`EntryType`)

Eine Eintragsart ist eine wiederverwendbare Vorlage für einen Dienst, eine
Abwesenheit oder einen freien Tag.

```ts
interface EntryType {
  id: string;
  code: string;
  name: string;
  calculationType: CalculationType;
  startTime: string | null;
  endTime: string | null;
  timeValues: TimeValues;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Entscheidungen

- `code` ist das kurze Kürzel für Dienstplan und Legende, beispielsweise
  `SN/F`, `D1` oder `U`.
- `name` ist die ausgeschriebene Bezeichnung.
- `code` muss nicht eindeutig sein. Dadurch sind mehrere Zeitvarianten mit
  demselben fachlichen Kürzel möglich. Die UUID bleibt die technische
  Identität.
- `startTime` und `endTime` sind optionale Uhrzeiten im Format `HH:mm`.
  `null` bedeutet, dass keine Uhrzeit vorgesehen ist.
- Bei `fixed` werden alle Zeitwerte beim Setzen unverändert in den Planeintrag
  kopiert.
- Bei `weeklyWorkingTime` wird `workingMinutes` beim Setzen aus
  `PlanEmployee.weeklyWorkingMinutes / 5` berechnet und auf die nächste volle
  Minute gerundet. Die übrigen Zeitwerte sind für diese Berechnungsart `0`, die
  Uhrzeiten `null`.
- `active` steuert, ob die Eintragsart für neue Planeinträge auswählbar ist.
  Bereits gesetzte Einträge bleiben durch ihren Snapshot unverändert.

### Eintragsartendatei

```ts
interface EntryTypesFile {
  schemaVersion: 1;
  updatedAt: string;
  entryTypes: EntryType[];
}
```

## 6. Monatsplan (`MonthlyPlan`)

Jeder Monatsplan ist ein eigenständig gespeichertes JSON-Aggregat:

```ts
interface MonthlyPlan {
  schemaVersion: 1;
  id: string;
  year: number;
  month: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  employees: PlanEmployee[];
  days: PlanDay[];
}
```

### Entscheidungen

- `year` und `month` beschreiben den Planzeitraum. `month` liegt zwischen 1 und 12.
- Für jede Kombination aus Jahr und Monat darf höchstens ein Monatsplan
  existieren.
- `title` enthält die darstellbare Bezeichnung, beispielsweise
  `Dienstplan August 2026`.
- `employees` und `days` gehören vollständig zum Plan und werden gemeinsam mit
  ihm gespeichert.
- Beim Erstellen werden die zu diesem Zeitpunkt aktiven Mitarbeiter und alle
  Kalendertage des gewählten Monats aufgenommen.
- Spätere Änderungen an den Stammdaten ergänzen oder verändern einen
  bestehenden Plan nicht automatisch.

## 7. Mitarbeiter-Snapshot (`PlanEmployee`)

```ts
interface PlanEmployee {
  id: string;
  sourceEmployeeId: string;
  firstName: string;
  lastName: string;
  role: string;
  weeklyWorkingMinutes: number;
  colorKey: EmployeeColorKey;
  position: number;
}
```

### Entscheidungen

- `id` identifiziert den Mitarbeiter innerhalb dieses Monatsplans.
- `sourceEmployeeId` dokumentiert, aus welchem `Employee` der Snapshot erzeugt
  wurde. Der Plan bleibt auch gültig, wenn dieser Stammdatensatz später
  deaktiviert oder gelöscht wird.
- Namen, Rolle, Wochenarbeitszeit und Farbe werden kopiert. Änderungen in der
  Teamverwaltung wirken sich deshalb nicht rückwirkend aus.
- `position` ist eine positive ganze Zahl und legt die Reihenfolge der
  Mitarbeiterspalten fest. Positionen sind innerhalb eines Plans eindeutig.
- Ein Aktivierungsstatus wird im Snapshot nicht benötigt. In den Plan werden
  bei seiner Erstellung nur aktive Mitarbeiter übernommen.

## 8. Kalendertag (`PlanDay`)

```ts
interface PlanDay {
  date: string;
  note: string | null;
  onCallEmployeeId: string | null;
  entries: PlanEntry[];
}
```

### Entscheidungen

- `date` ist innerhalb des Monatsplans eindeutig und muss in dessen Monat
  liegen.
- `note` enthält höchstens eine optionale Bemerkung zum Tag.
- `onCallEmployeeId` verweist auf die `id` eines `PlanEmployee` desselben
  Plans. `null` bedeutet, dass keine Rufbereitschaft eingeteilt ist.
- Durch das einzelne Feld kann es pro Tag höchstens eine Rufbereitschaft geben.
  Eine zusätzliche eigene Entität ist dafür nicht erforderlich.
- Rufbereitschaft darf parallel zu einem regulären Planeintrag derselben Person
  bestehen und verändert die gespeicherten Arbeitszeitwerte nicht.
- Das aktuelle Modell kennt wegen der frei eingebbaren Rolle keine automatisch
  prüfbare Einschränkung der Rufbereitschaft auf eine bestimmte Rolle.

Wochentag, Wochenende und Feiertag werden aus `date` berechnet und nicht
gespeichert.

## 9. Planeintrag (`PlanEntry`)

```ts
interface PlanEntry {
  id: string;
  planEmployeeId: string;
  sourceEntryTypeId: string;
  code: string;
  name: string;
  startTime: string | null;
  endTime: string | null;
  timeValues: TimeValues;
}
```

### Entscheidungen

- `planEmployeeId` verweist auf einen `PlanEmployee` desselben Monatsplans,
  nicht unmittelbar auf die aktuellen Mitarbeiterstammdaten.
- `sourceEntryTypeId` dokumentiert die ursprüngliche Eintragsart, stellt aber
  keine lebende Abhängigkeit dar.
- Kürzel, Name, Uhrzeiten und Zeitwerte werden beim Setzen in den
  Planeintrag kopiert. Nachträgliche Änderungen oder eine Deaktivierung der
  Eintragsart ändern den Monatsplan daher nicht.
- Pro `PlanDay` darf es höchstens einen `PlanEntry` je `planEmployeeId` geben.
  Das Wechseln einer Eintragsart ersetzt somit den vorhandenen Eintrag in der
  Zelle.
- Beginn und Ende dienen nur der Darstellung. Maßgeblich für Auswertungen sind
  die gespeicherten Minutenwerte.
- Ein über Mitternacht reichender Dienst muss nicht technisch in zwei Einträge
  aufgeteilt werden. Die Zuordnung erfolgt zu dem Kalendertag, an dem der Dienst
  im Plan geführt werden soll; seine Dauer wird ausdrücklich in `timeValues`
  gespeichert.

## 10. Fachliche Regeln über mehrere Modelle

- Ein Monatsplan ist über die Kombination `year` und `month` eindeutig.
- Ein Monatsplan enthält genau einen `PlanDay` für jeden Kalendertag seines
  Monats und keine Tage außerhalb dieses Monats.
- Alle `PlanEmployee.id`-Werte sind innerhalb eines Monatsplans eindeutig.
- Alle `PlanEmployee.position`-Werte sind innerhalb eines Monatsplans
  eindeutig.
- Alle `PlanEntry.id`-Werte sind innerhalb eines Monatsplans eindeutig.
- `PlanDay.onCallEmployeeId` und `PlanEntry.planEmployeeId` müssen auf einen im
  selben Monatsplan enthaltenen `PlanEmployee` verweisen.
- Je Tag und Planmitarbeiter ist höchstens ein Planeintrag zulässig.
- Für neue Monatspläne werden nur aktive Mitarbeiter verwendet.
- Für neue Planeinträge werden nur aktive Eintragsarten angeboten.
- Deaktivierung oder Löschung von Stammdaten macht bestehende Snapshots nicht
  ungültig.
- Feiertage werden aus dem Datum berechnet. Sie sind keine gespeicherten
  Entitäten des Datenmodells.

Diese Regeln werden nicht durch relationale Datenbank-Constraints abgesichert.
Sie müssen beim Erzeugen und Ändern der Daten sowie durch verfeinerte
Zod-Prüfungen im Main Process durchgesetzt werden.

## 11. Nicht gespeicherte Werte

Folgende Werte werden aus den gespeicherten Daten abgeleitet:

- Wochentag, Wochenende und Feiertag,
- Sollarbeitszeit,
- Istarbeitszeit und Differenz,
- Anzahl freier Tage,
- Dienst- und Abwesenheitsverteilung,
- Nachtarbeit und Nachtbereitschaft,
- Anzahl der Rufbereitschaften,
- Summen und weitere Werte der Auswertung,
- Druckdarstellung und PDF-Inhalt.

Diese Werte werden bei Änderungen neu berechnet. Dadurch kann kein veralteter
gespeicherter Auswertungswert von den eigentlichen Planeinträgen abweichen. Die
genauen Berechnungsregeln gehören in die spätere Planungs- und
Auswertungslogik, nicht in zusätzliche Entitäten.

## 12. Laufzeitvalidierung

Für jedes Modell wird ein Zod-Schema angelegt. Validiert wird:

- bei Daten aus der React-Oberfläche,
- im Main Process vor fachlichen Änderungen,
- unmittelbar vor dem Speichern,
- nach dem Laden einer JSON-Datei und
- bei Antworten über die Preload-API.

Neben Feldformaten müssen die Schemas beziehungsweise die aufrufende
Fachlogik auch die Beziehungen innerhalb eines Monatsplans prüfen. Dazu gehören
insbesondere eindeutige Tage, Positionen und Einträge sowie gültige Verweise auf
`PlanEmployee`.

Die geplante Aufteilung der gemeinsamen Schemas lautet:

```text
src/shared/schemas/
├── employee.ts       # bereits umgesetzt
├── timeValues.ts
├── entryType.ts
├── monthlyPlan.ts
└── index.ts
```

## 13. Zuordnung zu den JSON-Dateien

```text
dienstplaner-data/
├── employees.json                  # EmployeesFile
├── entry-types.json                # EntryTypesFile
└── plans/
    └── YYYY-MM.json                # jeweils ein MonthlyPlan
```

Sicherungs- und temporäre Dateien sind Teil der technischen Datenhaltung, aber
keine eigenen fachlichen Entitäten.
