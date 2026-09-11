# Datenmodell des Dienstplaners

Dieses Dokument beschreibt den fachlich und technisch umsetzbaren Zielstand der
gespeicherten Daten. Technische Feldnamen sind englisch, die Bezeichnungen in
der Benutzeroberfläche bleiben deutsch.

Die konkreten Speicherorte, Sicherungen und Repository-Abläufe stehen getrennt
in [Datenhaltung.md](./Datenhaltung.md). Die verbindlichen Berechnungsregeln
stehen unter [docs/Berechnungen](../Berechnungen/README.md) und haben bei
fachlichen Formeln Vorrang.

## 1. Umsetzungsstand

| Bereich                  | Stand                                                                                              |
| ------------------------ | -------------------------------------------------------------------------------------------------- |
| Mitarbeiter              | Grundmodell, Datenfluss, Rollen-Enum und Fünf-Minuten-Regel sind umgesetzt                         |
| Eintragsarten            | Grundmodell, Datenfluss und verbindliche Ableitung von `workingMinutes` sind umgesetzt             |
| Monatsplan und Snapshots | Gemeinsame Schemas, planweite Konsistenzprüfung und Erzeugung des Mitarbeiterstands sind umgesetzt |

Eine Beschreibung als Zielmodell bedeutet nicht automatisch, dass der
betreffende Teil bereits implementiert ist.

## 2. Grundentscheidungen

- Die Anwendung verwaltet genau ein Team. Eine eigene Entität `Team` ist nicht
  erforderlich.
- `Employee` und `EntryType` sind veränderbare Stammdaten-Entitäten.
- Ein `MonthlyPlan` ist ein eigenständig gespeichertes Aggregat. Eingebettete
  `PlanEmployee`, `PlanDay` und `PlanEntry` werden nicht getrennt gespeichert.
- Gemeinsame Zod-Schemas sind die zur Laufzeit geprüfte Datenbeschreibung. Die
  TypeScript-Typen werden daraus abgeleitet.
- `Employee`, `EntryType`, `MonthlyPlan`, `PlanEmployee`, `PlanDay` und
  `PlanEntry` besitzen jeweils eine eigene UUID. Neue IDs werden im Main
  Process mit `crypto.randomUUID()` erzeugt.
- Datumswerte verwenden `YYYY-MM-DD`, Uhrzeiten `HH:mm` und Zeitpunkte das
  ISO-Format.
- Zeitdauern werden als nichtnegative sichere ganze Minuten gespeichert.
- Stammdaten besitzen einen Aktivierungsstatus. Inaktive Stammdaten bleiben
  erhalten, werden für neue Planbestandteile aber nicht angeboten.
- Monatspläne verwenden vollständige Snapshots. Spätere Änderungen,
  Deaktivierungen oder Löschungen von Stammdaten verändern bestehende Pläne
  nicht rückwirkend.
- Monatliche Kennzahlen und reine Anzeigewerte werden berechnet und nicht als
  zusätzlicher Auswertungsstand gespeichert.
- Es wird keine Eintragskategorie eingeführt. `EntryTypeCategory` oder ein
  vergleichbares Feld ist nicht Bestandteil des Zielmodells.

### Modellarten

- `Employee` und `EntryType` sind eigenständige Stammdaten-Entitäten.
- `MonthlyPlan` ist die Wurzel eines gemeinsam gespeicherten Aggregats und eine
  eigenständig identifizierbare Entität.
- `PlanEmployee`, `PlanDay` und `PlanEntry` sind Entitäten innerhalb dieses
  Aggregats. Ihre UUIDs bleiben bei späteren Änderungen stabil, sie besitzen
  aber keine eigenen Dateien oder Repositories.
- `TimeValues` ist ein Wertobjekt. Es wird durch seine fünf benannten Werte
  beschrieben und benötigt keine eigene ID.
- Dateihüllen und `schemaVersion` sind technische Bestandteile der
  Datenhaltung und keine fachlichen Entitäten.

## 3. Überblick und Beziehungen

```text
Employee ── Snapshot beim Erstellen ──> PlanEmployee
                                           │
                                           │ planlokale Referenz
                                           ▼
MonthlyPlan ── enthält ──> PlanDay ── enthält ──> PlanEntry
     │                       │                    ▲
     │                       └─ Rufbereitschaft   │
     │                          verweist auf      │
     └─ enthält PlanEmployee[]                   │
                                                  │
EntryType ── Snapshot beim Setzen ────────────────┘
```

`sourceEmployeeId` und `sourceEntryTypeId` dokumentieren ausschließlich die
Herkunft eines Snapshots. Sie sind keine lebenden Fremdschlüssel. Ein Plan muss
deshalb auch dann vollständig verwendbar bleiben, wenn die ursprünglichen
Stammdaten später fehlen.

## 4. Gemeinsame Werttypen

### 4.1 Mitarbeiterrollen

```ts
const EMPLOYEE_ROLES = ['Erzieher', 'Wirtschaftskraft', 'Praktikant'] as const;

type EmployeeRole = (typeof EMPLOYEE_ROLES)[number];
```

`Employee.role` und `PlanEmployee.role` verwenden dasselbe gemeinsame
`employeeRoleSchema`. Andere Werte und freie Texteingaben sind nicht zulässig.

Die allgemeinen Zeitberechnungen sind rollenunabhängig. Eine Rollenprüfung
findet nur dort statt, wo eine verbindliche Fachregel sie verlangt. Die
Rufbereitschaft darf beispielsweise nur einem `PlanEmployee` mit der im
Snapshot gespeicherten Rolle `Erzieher` zugeordnet werden.

### 4.2 Mitarbeiterfarben

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

Gespeichert wird nur der kontrollierte Farbschlüssel. Die tatsächlichen Farben
werden zentral in der Oberfläche zugeordnet.

### 4.3 Berechnungsarten

```ts
type CalculationType = 'fixed' | 'weeklyWorkingTime';
```

- `fixed` verwendet die gültigen festen Zeitwerte der Eintragsart.
- `weeklyWorkingTime` bildet beim Setzen eines Planeintrags den Tageswert aus
  der im `PlanEmployee` gespeicherten Wochenarbeitszeit.

### 4.4 Zeitwerte

```ts
interface TimeValues {
  attendanceMinutes: number;
  workingMinutes: number;
  workingWithoutNightReadinessMinutes: number;
  nightReadinessMinutes: number;
  nightWorkMinutes: number;
}
```

- `attendanceMinutes`: Anwesenheitsdauer einschließlich Pausen,
- `workingMinutes`: Arbeitszeit einschließlich Nachtbereitschaft,
- `workingWithoutNightReadinessMinutes`: reine Arbeitszeit,
- `nightReadinessMinutes`: Nachtbereitschaft,
- `nightWorkMinutes`: Nachtarbeit.

Alle fünf Felder bleiben gespeichert, damit Eintragsart und Planeintrag dieselbe
schlanke Struktur verwenden können. `workingMinutes` ist jedoch kein frei
bestimmbarer Wert. Es gilt verbindlich:

Jeder Zeitwert bleibt eine eigene, ausdrücklich benannte Eigenschaft. Die Werte
werden weder zu einer allgemeinen Zahl zusammengefasst noch als frei benannte
Liste von Zeitwerten gespeichert.

```text
workingMinutes =
  workingWithoutNightReadinessMinutes + nightReadinessMinutes
```

Die Oberfläche zeigt diesen Wert schreibgeschützt an. Das gemeinsame Schema
prüft die Gleichung bei Eingaben, nach dem Laden und vor dem Speichern.
Widersprüchliche Werte werden abgelehnt und nicht still korrigiert.

Beginn und Ende dienen der zeitlichen Darstellung. Zeitdauern werden nicht aus
ihnen abgeleitet. Dadurch kann auch ein über Mitternacht laufender Dienst durch
seine ausdrücklich gespeicherten Minutenwerte beschrieben werden.

## 5. Mitarbeiter (`Employee`)

Status: **für den aktuellen Stammdatenumfang umgesetzt**.

```ts
interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  role: EmployeeRole;
  weeklyWorkingMinutes: number;
  colorKey: EmployeeColorKey;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
```

Regeln:

- Vorname und Nachname sind erforderlich und auf jeweils 100 Zeichen begrenzt.
- `role` ist genau eine der drei festgelegten Rollen.
- `weeklyWorkingMinutes` ist eine nichtnegative sichere ganze Zahl, höchstens
  10.080 und ohne Rest durch fünf teilbar.
- `0` Minuten bleiben zulässig.
- Die Oberfläche darf Eingaben nicht still auf einen anderen Minutenwert
  runden.
- `active` steuert die Verwendung bei der Erstellung neuer Monatspläne.
- `createdAt` und `updatedAt` dokumentieren Anlage und letzte Änderung.

Die Mitarbeiter-IDs innerhalb der Datei müssen eindeutig sein.

## 6. Eintragsart (`EntryType`)

Status: **für den aktuellen Stammdatenumfang umgesetzt**.

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

Regeln:

- `code` ist erforderlich und höchstens 20 Zeichen lang.
- `name` ist erforderlich und höchstens 100 Zeichen lang.
- Mehrere Eintragsarten dürfen dasselbe Kürzel verwenden. Die UUID bleibt die
  technische Identität.
- `startTime` und `endTime` sind entweder beide gesetzt oder beide `null`.
- Bei `fixed` werden die geprüften Uhrzeiten und Zeitwerte später vollständig
  in den `PlanEntry` kopiert.
- Bei `weeklyWorkingTime` sind Uhrzeiten `null` und alle festen Zeitwerte der
  Definition `0`.
- Bei `weeklyWorkingTime` entstehen die konkreten Werte erst beim Setzen des
  Planeintrags. `workingWithoutNightReadinessMinutes` und `workingMinutes`
  entsprechen dann jeweils `PlanEmployee.weeklyWorkingMinutes / 5`; die
  übrigen Zeitwerte sind `0`. Wegen der Fünf-Minuten-Regel ist keine Rundung
  erforderlich.
- `active` steuert nur die Auswahl für neue Planeinträge. Bereits gespeicherte
  Snapshots bleiben unverändert.

Die Eintragsarten-IDs innerhalb der Datei müssen eindeutig sein.

## 7. Monatsplan (`MonthlyPlan`)

Status: **Grundmodell, Konsistenzprüfung und reguläre Erzeugung sind
umgesetzt; Speicherung und Oberfläche folgen in späteren Schritten**.

```ts
interface MonthlyPlan {
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

Regeln:

- `year` ist eine sichere ganze Zahl von `2000` bis einschließlich `2100`.
- `month` ist eine ganze Zahl von `1` bis `12`.
- Mehrere Monatspläne dürfen dasselbe Jahr und denselben Monat besitzen. Die
  UUID identifiziert jeden Plan unabhängig von seinem Zeitraum und Titel.
- Die Oberfläche bietet bei einer Neuanlage standardmäßig das aktuelle Jahr
  sowie die jeweils zwei vorherigen und folgenden Jahre an, soweit diese
  innerhalb des technischen Bereichs liegen. Dieses rollierende Auswahlfenster
  ist eine Bedienregel; die stabile Dateivalidierung bleibt davon unabhängig.
- `title` wird vom Benutzer angelegt, ist erforderlich, höchstens 200 Zeichen
  lang und später editierbar.
- Nach dem Erstellen sind Jahr und Monat unveränderlich.
- Beim Erstellen werden die zu diesem Zeitpunkt aktiven Mitarbeiter in ihrer
  aktuellen Listenreihenfolge und sämtliche Kalendertage des Monats
  aufgenommen.
- Mitarbeiter dürfen in diesem ersten Zielstand nach der Erstellung nicht
  ergänzt, entfernt oder umsortiert werden.
- `employees` und `days` gehören vollständig zum Plan und werden gemeinsam
  validiert und gespeichert.

## 8. Mitarbeiter-Snapshot (`PlanEmployee`)

```ts
interface PlanEmployee {
  id: string;
  sourceEmployeeId: string;
  firstName: string;
  lastName: string;
  role: EmployeeRole;
  weeklyWorkingMinutes: number;
  colorKey: EmployeeColorKey;
  position: number;
}
```

Regeln:

- `id` identifiziert den Mitarbeiter innerhalb des Plans.
- `sourceEmployeeId` dokumentiert die Herkunft, ohne eine lebende Abhängigkeit
  zum Mitarbeiterstamm herzustellen.
- Namen, Rolle, Wochenarbeitszeit und Farbe werden beim Erstellen kopiert.
- `position` übernimmt die aktuelle Reihenfolge der aktiven Mitarbeiter als
  lückenlose Folge `1..n`.
- Ein Aktivstatus ist im Snapshot nicht erforderlich.
- Laden, Bearbeiten und Auswerten eines Plans verwenden ausschließlich den
  Snapshot. Der Mitarbeiterstamm darf dafür nicht erneut eingelesen oder in
  den Plan zurückkopiert werden.

## 9. Kalendertag (`PlanDay`)

```ts
interface PlanDay {
  id: string;
  date: string;
  note: string | null;
  onCallEmployeeId: string | null;
  entries: PlanEntry[];
}
```

Regeln:

- Beim regulären Erstellen enthält der Plan für jeden Tag seines Monats genau
  einen chronologisch einsortierten `PlanDay`.
- `id` identifiziert den Plantag innerhalb des Monatsplan-Aggregats und bleibt
  bei späteren Änderungen an Bemerkung, Rufbereitschaft oder Einträgen stabil.
- `date` muss im Zeitraum des zugehörigen Plans liegen und innerhalb des Plans
  eindeutig sein.
- `note` enthält eine optionale Bemerkung. Eine leere Bemerkung wird als `null`
  gespeichert.
- `onCallEmployeeId` ist `null` oder verweist auf die `id` eines
  `PlanEmployee` desselben Plans.
- Pro Tag gibt es höchstens eine Rufbereitschaft.
- Rufbereitschaft darf nur einem Planmitarbeiter mit Snapshot-Rolle `Erzieher`
  zugeordnet werden.
- Rufbereitschaft und regulärer Planeintrag derselben Person dürfen parallel
  bestehen.

Wochentag, Wochenende, Feiertagsstatus und alle auf ein Datum zutreffenden
Feiertagsbezeichnungen werden aus `date` berechnet und nicht gespeichert. Die
abgeleitete Kalenderdarstellung muss mehrere Feiertagsnamen je Datum erhalten
können, beispielsweise als `string[]`.

## 10. Planeintrag (`PlanEntry`)

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

Regeln:

- `planEmployeeId` verweist auf einen `PlanEmployee` desselben Plans.
- `sourceEntryTypeId` dokumentiert die Herkunft, ohne eine lebende Abhängigkeit
  zur Eintragsart herzustellen.
- Kürzel, Bezeichnung, Uhrzeiten und alle konkreten Zeitwerte werden beim
  Setzen in den Planeintrag kopiert.
- Die Berechnungsart muss nicht gespeichert werden, weil der Snapshot beim
  Setzen vollständig bestimmt wird und danach nicht neu aus Stammdaten
  berechnet werden darf.
- Pro `PlanDay` darf es höchstens einen `PlanEntry` je `planEmployeeId` geben.
- Das Wechseln einer Eintragsart ersetzt den bisherigen Snapshot vollständig.
- Das Entfernen eines Eintrags entfernt dessen Snapshot.
- Ein über Mitternacht reichender Dienst bleibt dem Kalendertag seiner
  Planungszelle zugeordnet. Eine Aufteilung auf den Folgetag erfolgt nicht.

## 11. Planweite Konsistenzregeln

Beim Erzeugen, Laden und Speichern eines Plans müssen das gemeinsame Schema und
die aufrufende Fachlogik mindestens sicherstellen:

- genau die chronologisch geordneten Kalendertage des Planmonats, ohne
  Duplikate und ohne fremde Daten;
- eindeutige `PlanEmployee.id`- und `sourceEmployeeId`-Werte;
- eindeutige und lückenlose Mitarbeiterpositionen `1..n`;
- eindeutige `PlanDay.id`-Werte;
- im gesamten Plan eindeutige `PlanEntry.id`-Werte;
- gültige planinterne Verweise von Planeinträgen und Rufbereitschaften;
- höchstens einen Eintrag je Mitarbeiter und Tag;
- Rufbereitschaft ausschließlich für Snapshot-Rolle `Erzieher`;
- die verbindliche Summenformel jedes gespeicherten `TimeValues`-Objekts;
- syntaktisch gültige Herkunfts-IDs, ohne die Existenz aktueller Stammdaten zu
  verlangen;
- sichere Ganzzahligkeit sämtlicher Minutenwerte und berechneter Summen.

Eine beschädigte oder manuell veränderte Datei begründet kein gewünschtes
fachliches Sonderverhalten. Sie wird technisch abgelehnt oder aus einer
gültigen Sicherung wiederhergestellt und niemals nur teilweise ausgewertet.

## 12. Snapshot-Lebenszyklus

1. Beim Erstellen eines Plans werden nur aktive Mitarbeiter kopiert.
2. Der Mitarbeiterbestand und seine Reihenfolge bleiben danach eingefroren.
3. Beim Setzen wird nur eine aktuell aktive Eintragsart verwendet.
4. Eine gemeinsame Fachfunktion erzeugt den vollständigen konkreten
   `PlanEntry` aus Eintragsart und `PlanEmployee`.
5. Bei `weeklyWorkingTime` wird ausschließlich die Wochenarbeitszeit des
   Snapshots verwendet.
6. Spätere Änderungen, Deaktivierungen, Löschungen oder Neuanlagen in den
   Stammdaten verändern vorhandene Snapshots nicht.
7. Laden und Auswerten verwenden ausschließlich die gespeicherten Snapshots.

## 13. Gespeicherte und berechnete Werte

### Gespeichert

- Mitarbeiter- und Eintragsartenstammdaten,
- frei editierbarer Plantitel,
- Jahr und Monat,
- Mitarbeiter-Snapshots einschließlich Rolle und Reihenfolge,
- Kalendertage mit Bemerkung und optionaler Rufbereitschaft,
- Planungseintrag-Snapshots einschließlich aller konkreten Zeitwerte,
- `workingMinutes` als abgeleiteter, geprüfter und im Snapshot eingefrorener
  Einzelwert.

### Berechnet und nicht als Monatsauswertung gespeichert

- Wochentag, Samstag, Sonntag und Wochenende,
- Feiertagsstatus und sämtliche Feiertagsbezeichnungen,
- kalendarische Arbeitstagszahl,
- SN/F-Dienste und die festgelegten Frei-Kennzahlen,
- Anzahl der Rufbereitschaften,
- monatliche Summen der gespeicherten Zeitwerte,
- Sonntags- und Feiertagszeit,
- Nachtzuschlag und Nachtbereitschaftszuschlag,
- Soll-Arbeitszeit, Ist-Arbeitszeit und Differenz,
- Anzeige-, Tabellen-, Druck- und Exportdarstellung.

Nachtarbeit und Nachtbereitschaft sind damit nicht generell ungespeichert: Ihre
Einzelwerte stehen im `PlanEntry`; nur die Monatsaggregate werden neu
berechnet.

## 14. Laufzeitvalidierung

Validiert wird:

- im Renderer für verständliche Eingaberückmeldungen,
- erneut im Main Process vor jeder fachlichen Änderung,
- unmittelbar vor dem Speichern,
- vollständig nach dem Laden einer JSON-Datei.

Die Main-Process-Prüfung ist die maßgebliche Sicherheitsgrenze. Eine Antwort
über die Preload-API benötigt keine zusätzliche, davon unabhängige
Schema-Schicht, wenn sie ausschließlich aus bereits erfolgreich validierten
Repository-Daten gebildet wurde.

Geplante gemeinsame Schemaaufteilung:

```text
src/shared/schemas/
├── employee.ts
├── timeValues.ts
├── entryType.ts
├── monthlyPlan.ts
└── index.ts
```

Die technische Zuordnung dieser Modelle zu JSON-Dateien und die Behandlung von
Schema-Versionen beschreibt [Datenhaltung.md](./Datenhaltung.md).
