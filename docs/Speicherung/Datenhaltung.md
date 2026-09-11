# Datenhaltung des Dienstplaners

Dieses Dokument beschreibt, wo und wie die in
[Datenmodell.md](./Datenmodell.md) definierten Daten gespeichert, validiert,
gesichert und über die Anwendungsschichten transportiert werden. Entitäten,
Rollenlisten, Zeitwertformeln und Snapshot-Felder werden hier nicht erneut
definiert.

Die bestehende JSON-, Zod-, Repository-, IPC- und Preload-Architektur bleibt
erhalten. Eine relationale Datenbank ist für den aktuellen Einfenster-Prototyp
nicht erforderlich.

## 1. Umsetzungsstand

### Bereits umgesetzt

- lokale JSON-Dateien für Mitarbeiter und Eintragsarten,
- vollständige Zod-Prüfung nach dem Laden und vor dem Schreiben,
- zufällig benannte temporäre Dateien,
- jeweils eine angrenzende Sicherungsdatei,
- automatische Verwendung einer gültigen Sicherung,
- serialisierte Mutationen innerhalb der vorhandenen Repositories,
- ausschließlicher Dateizugriff durch den Main Process,
- begrenzte IPC-/Preload-Schnittstellen für Mitarbeiter und Eintragsarten,
- gemeinsame Kalenderfunktionen,
- gemeinsame Schemas für Monatsplan und Snapshots einschließlich planweiter
  Konsistenzprüfung,
- Erzeugung eines vollständigen Monatsplans aus aktiven
  Mitarbeiter-Snapshots und allen Kalendertagen,
- gemeinsame reine Erzeugung von Planungseintrag-Snapshots sowie validierte
  Zelloperationen im Main Process,
- der bestätigte Reset der bisherigen Prototypdaten auf die neuen
  Schema-Versionen.

### Noch umzusetzen

- Plan-Unterordner und Plan-Repository,
- Plan-IPC- und Preload-Schnittstellen,
- sichtbare Warnung nach Wiederherstellung aus einer Sicherung,
- Serialisierung von Lesen und Schreiben derselben Ressource.

## 2. Speicherort und Dateistruktur

Alle Anwendungsdaten liegen unter:

```text
app.getPath('userData')/dienstplaner-data/
```

Zielstruktur:

```text
dienstplaner-data/
├── employees.json
├── employees.json.backup
├── entry-types.json
├── entry-types.json.backup
└── plans/
    ├── <plan-id>.json
    └── <plan-id>.json.backup
```

Temporäre Dateien liegen während eines Speichervorgangs neben ihrer Zieldatei
und tragen zusätzlich eine zufällige Kennung sowie die Endung `.tmp`.

Ein eigenes `backup/`-Verzeichnis wird nicht eingeführt. Die angrenzenden
`.backup`-Dateien entsprechen der vorhandenen Store-Logik und genügen als
technische Rückfallebene.

Nicht verwendet werden:

- `localStorage`, Cookies oder Browser-Datenbanken,
- Dateien im Installationsordner,
- Cloud- oder Netzwerkverzeichnisse,
- frei vom Renderer gelieferte Dateipfade.

## 3. Zuordnung der Modelle zu Dateien

| Datei                  | Inhalt                                   | Zielversion |
| ---------------------- | ---------------------------------------- | ----------- |
| `employees.json`       | `EmployeesFile`                          | `2`         |
| `entry-types.json`     | `EntryTypesFile`                         | `2`         |
| `plans/<plan-id>.json` | ein vollständiges `MonthlyPlan`-Aggregat | `1`         |

`EmployeesFile`, `EntryTypesFile` und `MonthlyPlanFile` sind technische
Dateihüllen und keine fachlichen Entitäten. Sie ergänzen die in
`Datenmodell.md` beschriebenen Inhalte um die jeweilige `schemaVersion` und bei
den Stammdatendateien um den Änderungszeitpunkt der Gesamtdatei.

Der Dateiname eines Monatsplans wird ausschließlich im Main Process aus der
validierten Plan-UUID gebildet. Die ID im Dateiinhalt muss mit dem Dateinamen
übereinstimmen. Mehrere Monatspläne dürfen dasselbe Jahr und denselben Monat
besitzen; jeder Plan liegt in einer eigenen Datei und wird nicht auf mehrere
fachliche JSON-Dateien aufgeteilt.

## 4. Verantwortlichkeiten der Anwendungsschichten

```text
React-Oberfläche
  → gemeinsames Eingabeschema
  → begrenzte Preload-API
  → IPC-Handler
  → Repository und Fachfunktionen im Main Process
  → JsonFileStore
  → lokale JSON-Datei
```

### Renderer

- hält Formulare und den noch nicht gespeicherten Monatsplanentwurf,
- zeigt Eingabefehler und ungespeicherte Änderungen an,
- berechnet keine Dateipfade,
- greift nicht direkt auf das Dateisystem zu.

### Preload und IPC

- stellen nur ausdrücklich freigegebene, typisierte Funktionen bereit,
- behandeln eingehende Nutzdaten an der Main-Grenze als ungeprüft,
- geben keine allgemeinen Dateioperationen frei.

### Repository und Fachfunktionen

- validieren Eingaben erneut,
- erzeugen UUIDs und Zeitpunkte,
- setzen Snapshot- und Konsistenzregeln durch,
- serialisieren konkurrierende Zugriffe,
- bestimmen den Dateinamen,
- übergeben ausschließlich vollständige, validierte Aggregate an den Store.

### JsonFileStore

- liest und schreibt eine konkrete JSON-Datei,
- prüft Dateiinhalt mit dem übergebenen Zod-Schema,
- verwaltet temporäre Datei und letzte Sicherung,
- muss bei Monatsplänen eine fehlende Datei von einem vorhandenen Plan
  unterscheiden können,
- kennt keine fachlichen Regeln zu Mitarbeitern oder Monatsplänen.

Der heutige Store erzeugt bei zwei fehlenden Kandidaten immer einen
bereichsspezifischen Standardwert. Das bleibt für leere Stammdatendateien
sinnvoll. Für Monatspläne ist dagegen `nicht vorhanden` das korrekte Ergebnis;
ein leerer Standardplan darf nicht erfunden werden.

## 5. Validierungsgrenzen

Eine Datei wird immer als Ganzes geprüft:

1. Der Renderer prüft Eingaben für eine unmittelbare Rückmeldung.
2. Der Main Process prüft jede IPC-Eingabe erneut.
3. Das Repository erzeugt oder verändert das vollständige Zielobjekt.
4. Unmittelbar vor dem Schreiben wird das vollständige Dateischema geprüft.
5. Nach dem Laden wird der vollständige JSON-Inhalt geprüft, bevor Daten an die
   Oberfläche gelangen.

Beim Monatsplan umfasst die Prüfung zusätzlich alle planweiten Beziehungen und
Snapshot-Regeln aus `Datenmodell.md`. Eine syntaktisch gültige JSON-Datei ist
nicht automatisch ein gültiger Monatsplan.

Antworten an den Renderer stammen aus bereits geprüften Repository-Daten. Eine
zusätzliche unabhängige Antwortvalidierung in der Preload-Schicht ist deshalb
nicht erforderlich.

## 6. Repositories

Die vorhandenen Mitarbeiter- und Eintragsarten-Repositories bleiben bestehen.
Für Monatspläne wird ein eigenes Repository ergänzt.

Minimal benötigte Operationen:

```text
list()                     → MonthlyPlanSummary[]
get(id)                    → MonthlyPlan | null
create(year, month, title) → MonthlyPlan
save(monthlyPlan)          → MonthlyPlan
```

`MonthlyPlanSummary` ist eine berechnete Transportansicht aus ID, Jahr, Monat,
Titel und Änderungszeitpunkt. Sie wird nicht zusätzlich gespeichert.

Beim Erstellen:

1. Jahr, Monat und Titel validieren.
2. Eine neue, noch nicht verwendete Plan-UUID erzeugen.
3. Aktive Mitarbeiter laden und in ihrer aktuellen Reihenfolge snapshotten.
4. Sämtliche Kalendertage des Monats mit eigenen UUIDs erzeugen.
5. Das vollständige Aggregat planweit validieren.
6. Es unter seiner Plan-UUID als eigene Monatsplandatei speichern.

`list()` liefert alle vorhandenen Pläne als Zusammenfassungen. Mehrere
Zusammenfassungen dürfen denselben Monat und dasselbe Jahr besitzen und bleiben
über ihre jeweilige Plan-ID eindeutig auswählbar.

Beim Speichern eines Entwurfs wird erneut das vollständige Aggregat geprüft.
Der Main Process vertraut weder berechneten Zeitwerten noch internen Verweisen
aus dem Renderer.

Bei einem vorhandenen Plan dürfen `id`, `year`, `month`, `createdAt`, die
Mitarbeiter-Snapshots und die Datumsfolge nicht über einen allgemeinen
Speicheraufruf verändert werden. Das Repository vergleicht diese Bestandteile
mit dem geladenen Stand. Änderbar sind der Titel sowie die dafür vorgesehenen
Inhalte der Plantage. `updatedAt` wird ausschließlich im Main Process gesetzt.

Eine Löschoperation für Monatspläne wird erst ergänzt, wenn Löschverhalten und
Oberfläche ausdrücklich festgelegt sind.

## 7. Sicheres Schreiben

Ein Speichervorgang folgt diesem Ablauf:

1. vollständige Daten mit dem gemeinsamen Zod-Schema validieren,
2. tatsächlichen Elternordner rekursiv anlegen,
3. JSON in eine zufällig benannte temporäre Datei im Zielordner schreiben,
4. eine vorhandene gültige Hauptdatei als letzte `.backup`-Datei sichern,
5. die temporäre Datei als neue Hauptdatei einsetzen,
6. nicht mehr benötigte temporäre Dateien entfernen,
7. erst danach Erfolg an die Oberfläche melden.

Der Austausch muss so umgesetzt werden, dass ein Fehler zwischen Sicherung und
Einsetzen der neuen Hauptdatei weiterhin eine gültige Haupt- oder
Sicherungsdatei hinterlässt. Die aktuelle Store-Implementierung löscht die
Hauptdatei vor dem Umbenennen und muss vor der Monatsplanpersistenz für dieses
Zielverhalten geprüft und gehärtet werden.

Das ist keine vollständige Backup-Funktion. Es schützt gegen eine beschädigte
oder unvollständig geschriebene letzte Fassung.

## 8. Laden und Wiederherstellung

Beim Laden werden Haupt- und Sicherungsdatei eindeutig unterschieden:

- Ist die Hauptdatei gültig, wird sie verwendet.
- Fehlt oder scheitert die Hauptdatei und ist die Sicherung gültig, wird die
  Sicherung automatisch verwendet.
- Die Oberfläche zeigt dann deutlich an, dass möglicherweise ein älterer Stand
  wiederhergestellt wurde.
- Sind Haupt- und Sicherungsdatei nicht vorhanden, gilt die Stammdatendatei als
  leer beziehungsweise der über seine ID angefragte Monatsplan als nicht
  vorhanden.
- Ist mindestens ein vorhandener Stand ungültig und steht keine gültige
  Alternative zur Verfügung, wird das Laden blockiert.
- Beschädigte Daten werden nicht mit einem leeren Standard überschrieben und
  nicht teilweise ausgewertet.

Der Store muss dem Repository deshalb neben den Daten mitteilen können, ob die
Hauptdatei oder die Sicherung verwendet wurde. Das Repository übersetzt diesen
technischen Zustand in eine verständliche Rückmeldung für die Oberfläche.

## 9. Schutz vor überschneidenden Zugriffen

Die bestehenden Repositories führen ihre Mutationen bereits nacheinander aus.
Für den Zielstand gelten zusätzlich:

- Lesen und Schreiben derselben Ressource werden gemeinsam serialisiert.
- Für Monatspläne genügt im Einfenster-Prototyp eine gemeinsame
  Plan-Warteschlange.
- Erzeugen der Plan-ID und anschließendes Schreiben erfolgen innerhalb
  derselben serialisierten Operation.
- Ein komplexes Sperrsystem, eine Datenbank oder optimistische
  Versionskonflikte sind derzeit nicht erforderlich.

Damit kann kein paralleler Zugriff einen temporären Zwischenzustand lesen oder
dieselbe Plan-ID widersprüchlich speichern.

## 10. Schema-Versionen und bestätigter Reset

Die Umstellung auf feste Rollen und die strengere Zeitwertregel sind
inkompatibel zu möglichen bisherigen Prototypdateien. Es wurde deshalb ein
Reset statt einer Migration bestätigt.

Für die Umsetzung gilt:

- vorhandene Prototypdaten werden einmalig und bewusst zurückgesetzt,
- `EmployeesFile` und `EntryTypesFile` beginnen danach mit Zielversion `2`,
- `MonthlyPlan` beginnt als neues Modell mit Version `1`,
- es wird kein Migrationscode für freie Rollen oder widersprüchliche Zeitwerte
  entwickelt,
- Daten werden nicht still beim normalen Programmstart gelöscht,
- eine unbekannte Schema-Version wird mit verständlicher Fehlermeldung
  abgelehnt.

Spätere Schemaänderungen erhalten entweder eine ausdrückliche Migration oder
einen erneut bestätigten Reset. Eine vorhandene Version wird nicht still mit
neuer Bedeutung weiterverwendet.

## 11. Monatsplanentwurf und Speichern

Der Monatsplanentwurf darf bis zum ausdrücklichen Speichern im Renderer gehalten
werden. Dadurch kann die Oberfläche ungespeicherte Änderungen sichtbar machen,
ohne jede Zelländerung sofort auf die Festplatte zu schreiben.

Eine gemeinsame reine Fachfunktion erzeugt beim Setzen eines Planeintrags den
vollständigen Snapshot. Der Main Process berechnet beziehungsweise prüft die
verbindlichen Werte beim Speichern erneut. So liegt die maßgebliche Fachlogik
nicht ausschließlich im Renderer.

Snapshots werden immer als Teil des vollständigen Monatsplans gespeichert. Das
Repository darf sie beim Laden weder aus aktuellen Mitarbeiter- noch aus
aktuellen Eintragsartenstammdaten neu aufbauen.

## 12. Abgrenzung

- Wochentage, Feiertage und Monatsauswertungen werden nicht in getrennten
  Dateien gespeichert.
- Snapshot-Einzelwerte sind dagegen Bestandteil des Monatsplans.
- Druck- und PDF-Dateien gehören nicht zur primären Datenhaltung.
- Ein allgemeines Benutzer-Backup, Export, Cloud-Synchronisation und
  Mehrbenutzerbetrieb sind nicht Teil dieses Zielstands.
- Eine SQLite-Lösung wäre erst bei deutlich höheren Anforderungen an
  gleichzeitige Zugriffe oder komplexe Abfragen zu prüfen.

Damit bleibt die Datenhaltung klein und nachvollziehbar, ohne die für
Monatsplanung und Berechnungen notwendigen Konsistenz- und
Wiederherstellungsregeln auszulassen.
