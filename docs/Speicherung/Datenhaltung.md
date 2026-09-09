Die vorhandenen Entitäten und das bereits festgelegte Snapshot-Verhalten können vollständig in JSON abgebildet werden. Wir benötigen dafür keine relationale Datenbank.

## 1. Speicherort

Die Daten liegen ausschließlich im Electron-Verzeichnis:

```text
app.getPath("userData")/dienstplaner-data/
```

Electron empfiehlt einen eigenen Unterordner innerhalb von `userData`. [Electron-Dokumentation](https://electronjs.org/docs/latest/api/app)

Geplante Struktur:

```text
dienstplaner-data/
├── employees.json
├── entry-types.json
├── plans/
│   ├── 2026-08.json
│   ├── 2026-09.json
│   └── ...
└── backup/
```

Nicht verwendet werden:

* `localStorage`
* Cookies
* Dateien im Installationsordner
* Cloud- oder Netzwerkverzeichnisse

## 2. Grundregeln der Datenformate

* IDs werden mit `crypto.randomUUID()` erzeugt.
* Datumswerte verwenden `YYYY-MM-DD`.
* Zeitpunkte verwenden das ISO-Format.
* Uhrzeiten verwenden `HH:mm`.
* Zeitwerte werden als ganze **Minuten** gespeichert.
* Farben werden als Schlüssel wie `sky` oder `violet` gespeichert.
* Jede Datei besitzt eine `schemaVersion`.
* Technische Bezeichner sind englisch, die Benutzeroberfläche bleibt deutsch.

Minuten vermeiden Rundungsfehler:

```ts
7,5 Stunden = 450 Minuten
40 Stunden = 2400 Minuten
```

## 3. Mitarbeiter

```json
{
  "schemaVersion": 1,
  "updatedAt": "2026-08-18T10:00:00.000Z",
  "employees": [
    {
      "id": "4cf046f6-51fd-4b62-b21a-768e842eb3b0",
      "firstName": "Max",
      "lastName": "Mustermann",
      "role": "employee",
      "weeklyWorkingMinutes": 2400,
      "color": "sky",
      "active": true
    }
  ]
}
```

Mögliche Rollen:

```ts
"teamLead" | "employee" | "intern"
```

Deaktivierte Mitarbeiter bleiben gespeichert, erscheinen aber nicht mehr bei der Erstellung neuer Dienstpläne.

## 4. Eintragsarten

```json
{
  "schemaVersion": 1,
  "updatedAt": "2026-08-18T10:00:00.000Z",
  "entryTypes": [
    {
      "id": "2b681e33-606f-42e7-bde9-a5de5efba002",
      "code": "SN/F",
      "name": "Spät-Nacht-Früh",
      "category": "duty",
      "startTime": "13:00",
      "endTime": "13:00",
      "calculationType": "fixed",
      "timeValues": {
        "attendanceMinutes": 1440,
        "workingMinutes": 960,
        "workingWithoutNightReadinessMinutes": 480,
        "nightReadinessMinutes": 480,
        "nightWorkMinutes": 0
      },
      "active": true
    }
  ]
}
```

Kategorien:

```ts
"duty" | "absence" | "free"
```

Berechnungsarten:

```ts
"fixed" | "weeklyWorkingTime"
```

## 5. Monatsplan

Jeder Monat erhält eine eigene Datei:

```text
plans/2026-08.json
```

Vereinfachte Struktur:

```json
{
  "schemaVersion": 1,
  "id": "6de80239-a4a6-4c97-ae80-021de57b8af6",
  "year": 2026,
  "month": 8,
  "title": "Dienstplan August 2026",
  "createdAt": "2026-08-01T08:00:00.000Z",
  "updatedAt": "2026-08-18T10:00:00.000Z",
  "employees": [],
  "days": []
}
```

Für jede Kombination aus Monat und Jahr darf höchstens ein Dienstplan existieren.

## 6. Mitarbeiter-Snapshot

Beim Erstellen eines Dienstplans werden die aktiven Mitarbeiter in den Plan kopiert:

```json
{
  "id": "plan-employee-id",
  "sourceEmployeeId": "original-employee-id",
  "firstName": "Max",
  "lastName": "Mustermann",
  "role": "employee",
  "weeklyWorkingMinutes": 2400,
  "color": "sky",
  "position": 1
}
```

Dadurch verändert eine spätere Änderung der Mitarbeiterdaten keinen bereits bestehenden Dienstplan.

## 7. Kalendertage und Planeinträge

```json
{
  "date": "2026-08-01",
  "note": "Teamberatung",
  "onCallEmployeeId": "plan-employee-id",
  "entries": [
    {
      "id": "plan-entry-id",
      "planEmployeeId": "plan-employee-id",
      "sourceEntryTypeId": "entry-type-id",
      "code": "SN/F",
      "name": "Spät-Nacht-Früh",
      "category": "duty",
      "startTime": "13:00",
      "endTime": "13:00",
      "timeValues": {
        "attendanceMinutes": 1440,
        "workingMinutes": 960,
        "workingWithoutNightReadinessMinutes": 480,
        "nightReadinessMinutes": 480,
        "nightWorkMinutes": 0
      }
    }
  ]
}
```

Auch der Planeintrag enthält einen Snapshot. Wird die ursprüngliche Eintragsart später geändert oder deaktiviert, bleiben bereits geplante Monate unverändert.

Pro Kalendertag gilt:

* höchstens ein Planeintrag je Mitarbeiter,
* höchstens ein Mitarbeiter mit Rufbereitschaft,
* höchstens eine Bemerkung.

## 8. Nicht gespeicherte Werte

Folgende Werte werden bei jeder Änderung neu berechnet:

* Wochentag
* Wochenende
* Feiertag
* Sollstunden
* Iststunden
* Differenz
* freie Tage
* Nachtarbeit
* Nachtbereitschaft
* weitere Auswertungswerte

Diese Werte werden nicht zusätzlich gespeichert. Andernfalls könnten gespeicherte und neu berechnete Werte voneinander abweichen.

Automatische fachliche Regelprüfungen werden dadurch nicht ergänzt.

## 9. Zod-Validierung

Zod-Schemas bilden die zentrale Datenbeschreibung. Aus ihnen werden zugleich die TypeScript-Typen abgeleitet:

```ts
const minutesSchema = z.number().int().nonnegative();

const timeValueSchema = z.object({
  attendanceMinutes: minutesSchema,
  workingMinutes: minutesSchema,
  workingWithoutNightReadinessMinutes: minutesSchema,
  nightReadinessMinutes: minutesSchema,
  nightWorkMinutes: minutesSchema,
});

type TimeValues = z.infer<typeof timeValueSchema>;
```

Validiert wird:

* vor dem Speichern,
* nach dem Laden,
* bei Daten aus dem Renderer,
* bei Antworten des Main Process.

Zod ist für TypeScript-basierte Laufzeitvalidierung vorgesehen. [Zod-Dokumentation](https://zod.dev/)

## 10. Sicheres Speichern

Ein Speichervorgang läuft folgendermaßen ab:

1. Daten mit Zod validieren.
2. JSON in eine temporäre Datei schreiben.
3. vorhandene gültige Datei als letzte Sicherung behalten.
4. temporäre Datei als neue Hauptdatei einsetzen.
5. Ergebnis an die Oberfläche zurückmelden.

Wenn das Laden fehlschlägt:

* wird die beschädigte Datei nicht überschrieben,
* erscheint eine verständliche Fehlermeldung,
* kann die letzte technisch erzeugte Sicherung verwendet werden.

Das ist keine umfangreiche Backup-Funktion, sondern schützt lediglich vor einer unvollständig geschriebenen Datei.

## 11. Technische Aufteilung

```text
src/
├── main/
│   └── storage/
│       ├── employee-storage.ts
│       ├── entry-type-storage.ts
│       ├── plan-storage.ts
│       └── json-file-storage.ts
├── preload/
│   └── api.ts
├── renderer/
│   └── ...
└── shared/
    ├── schemas/
    └── types/
```

Nur der Main Process darf Dateien lesen und schreiben. Die React-Oberfläche greift ausschließlich über eine begrenzte Preload-API darauf zu.

Damit ist die lokale Datenhaltung ausreichend zuverlässig, nachvollziehbar und trotzdem deutlich einfacher als eine SQLite-Lösung. Als Nächstes können wir die **vollständige Dependency-Liste und die Entwicklungswerkzeuge** festlegen.
