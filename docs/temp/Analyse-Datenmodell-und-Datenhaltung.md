# Analyse von Datenmodell und Datenhaltung

Stand: 11. September 2026
Untersuchter Projektstand: `f104952` auf `main`

> Diese Datei dokumentiert die erste, grundsätzlich lesende Analysephase. Sie
> ändert weder den Anwendungscode noch die verbindlichen Fach- oder
> Speicherdokumente. Das alte Projekt `dienstplan-app` wurde nicht untersucht.

## 1. Gesamturteil

Die bestehende Architektur ist als Grundlage tragfähig und sollte weitergeführt
werden:

```text
React-Oberfläche
  -> gemeinsames Zod-Schema
  -> begrenzte Preload-API
  -> IPC-Handler im Main Process
  -> Repository
  -> JsonFileStore
  -> lokale JSON-Datei
```

Die Team- und Eintragsartenverwaltung verwenden diesen Weg bereits vollständig.
Die Monatsplanung ist dagegen noch nicht implementiert: Es gibt noch kein
Monatsplan-Schema, kein Repository, keine IPC-/Preload-Schnittstelle und keine
Planungsoberfläche. In `App.tsx` wird für den Dienstplan nur eine Platzhalterseite
angezeigt.

Das in `docs/Speicherung/Datenmodell.md` beschriebene Monatsplan-Aggregat mit
Mitarbeiter- und Planungseintrag-Snapshots ist grundsätzlich richtig. Das
Dokument ist aber nicht mehr vollständig mit den verbindlichen Regeln unter
`docs/Berechnungen/` vereinbar. `docs/Speicherung/Datenhaltung.md` ist stärker
veraltet: Es wiederholt Modellinhalte, verwendet abweichende Rollen-, Farb- und
Feldbeispiele und beschreibt teilweise nur eine frühere geplante statt der
tatsächlich umgesetzten Speicherarchitektur.

Vor der Monatsplanung müssen insbesondere diese Grundlagen konsistent gemacht
werden:

1. Rolle als gemeinsames Enum mit genau `Erzieher`, `Wirtschaftskraft` und
   `Praktikant` statt Freitext;
2. Wochenarbeitszeit zusätzlich als durch fünf teilbarer Minutenwert;
3. `Arbeitszeit (mit NB)` als abgeleiteter, nicht frei pflegbarer Wert;
4. ein vollständig validiertes Monatsplan- und Snapshot-Modell ohne
   Eintragskategorien;
5. eine festgelegte Versions-, Bestandsdaten- und Wiederherstellungsstrategie.

## 2. Untersuchungsumfang

Vollständig beziehungsweise für den Datenfluss vollständig relevant gelesen
wurden:

- `docs/Berechnungen/README.md` und alle sechs dort verlinkten Dokumente;
- `docs/Speicherung/Datenmodell.md`;
- `docs/Speicherung/Datenhaltung.md`;
- `docs/Zielbild-Rahmenbedingungen.md`;
- die aktuellen Dokumente unter `docs/Features/` und das Navigations- und
  Seitenkonzept;
- `docs/temp/Umsetzungsreihenfolge-Berechnungen.md` ausschließlich lesend;
- die gemeinsamen Mitarbeiter- und Eintragsarten-Schemas;
- `JsonFileStore`, Mitarbeiter- und Eintragsarten-Repositories;
- IPC-Kanäle, IPC-Handler, Preload-Vertrag und Main-Initialisierung;
- die Team- und Eintragsartenoberflächen sowie die aktuelle Platzhalterseite
  der Planung;
- `package.json` und die vorhandenen Prüfskripte.

Nicht untersucht wurden:

- das alte Projekt `dienstplan-app`;
- dessen Quellcode oder Dokumentation;
- tatsächliche Anwendungsdaten außerhalb des Projektordners.

Der Arbeitsbaum enthielt vor der Analyse bereits ausschließlich die ungetrackte
Datei `docs/temp/Umsetzungsreihenfolge-Berechnungen.md`. Sie wurde weder verändert
noch formatiert. Als lesende technische Kontrolle liefen `npm run typecheck` und
`npm run lint` erfolgreich. Ein Testskript und automatisierte Tests sind im
Projekt noch nicht vorhanden.

Die Dateien `docs/Features/Team-Verwaltung.md`,
`docs/Features/EntryType-Verwaltung.md`, `docs/Features/Planungs-Page.md`,
`docs/Features/Auswertung-Tabelle.md` und `docs/Features/Vorschau-Page.md` sind
aktuell leer. Sie liefern daher noch keine zusätzliche verbindliche Beschreibung
von Ist- oder Zielstand.

## 3. Festgestellter Ist-Stand

### 3.1 Mitarbeiter

Tatsächlich implementiert sind:

- `Employee` mit UUID, Vorname, Nachname, Rolle, Wochenarbeitszeit in Minuten,
  kontrolliertem Farbschlüssel, Aktivstatus sowie Anlage- und Änderungszeitpunkt
  (`src/shared/schemas/employee.ts:15-49`);
- eine strikt validierte `employees.json` mit `schemaVersion: 1`
  (`employee.ts:58-65`);
- Anlegen, Laden, Bearbeiten und endgültiges Löschen über Repository, IPC und
  Preload (`employeesRepository.ts`, `registerEmployeeIpcHandlers.ts`,
  `preload.ts`);
- eine Oberfläche mit Lade-, Fehler-, Bearbeitungs-, Aktivierungs- und
  Löschzuständen (`TeamPage.tsx`, `EmployeeDialog.tsx`,
  `DeleteEmployeeDialog.tsx`).

Noch nicht fachlich passend sind:

- `role` ist im Schema ein beliebiger Text von 1 bis 100 Zeichen
  (`employee.ts:31-35`);
- die Rolle ist in der Oberfläche ein Texteingabefeld
  (`EmployeeDialog.tsx:284-301`);
- `weeklyWorkingMinutes` wird nur auf Ganzzahligkeit und den Bereich 0 bis 10.080
  geprüft, nicht auf Teilbarkeit durch fünf (`employee.ts:36-43`);
- das Formular rechnet Dezimalstunden mit `Math.round` in Minuten um und zeigt
  einen Viertelstundenschritt an (`EmployeeDialog.tsx:151-165,304-329`). Dadurch
  ist das verbindliche Fünf-Minuten-Raster weder eindeutig dargestellt noch an
  der Speichergrenze erzwungen.

### 3.2 Eintragsarten

Tatsächlich implementiert sind:

- `EntryType` mit UUID, Kürzel, Bezeichnung, Berechnungsart, optionalem
  Uhrzeitpaar, fünf Zeitwerten, Aktivstatus und Zeitpunkten
  (`src/shared/schemas/entryType.ts:3-56`);
- die Berechnungsarten `fixed` und `weeklyWorkingTime`;
- die Regel, dass Start und Ende nur gemeinsam gesetzt werden dürfen;
- die Regel, dass eine `weeklyWorkingTime`-Definition keine Uhrzeiten und nur
  Nullwerte als feste Zeitwerte enthält (`entryType.ts:65-99`);
- vollständiges CRUD über Repository, IPC, Preload und Oberfläche.

Es gibt im aktuellen Code keine `EntryTypeCategory` und kein vergleichbares
Kategoriefeld. Das entspricht dem vorgegebenen Ziel und soll so bleiben.

Nicht fachlich passend ist die Behandlung von `workingMinutes`:

- Das Schema erlaubt bei `fixed` einen beliebigen unabhängigen Wert und prüft
  nicht
  `workingMinutes = workingWithoutNightReadinessMinutes + nightReadinessMinutes`.
- Die Oberfläche lässt `Arbeitszeit (mit NB)` frei bearbeiten
  (`EntryTypeDialog.tsx:72-93,318-355,636-685`).
- Der Hilfetext sagt, die dargestellten Zusammenhänge würden nicht automatisch
  geprüft (`EntryTypeDialog.tsx:627-631`).

Das widerspricht den verbindlichen Regeln in
`docs/Berechnungen/03-Planungseintraege-und-Snapshots.md:25-42`.

### 3.3 JSON-Speicher und Repositories

Tragfähig umgesetzt sind:

- Lesen und vollständige Zod-Prüfung einer JSON-Datei;
- Prüfung unmittelbar vor dem Schreiben;
- zufällig benannte temporäre Datei;
- eine letzte Sicherungsdatei;
- automatische Verwendung einer gültigen Sicherung, wenn die Hauptdatei fehlt
  oder ungültig ist;
- je Repository eine Promise-Warteschlange, die Änderungen derselben Datei
  nacheinander ausführt;
- Erzeugung von UUIDs und Zeitpunkten im Main Process.

Technische Grenzen des aktuellen Stands:

- Sicherungen liegen entgegen `Datenhaltung.md` nicht in `backup/`, sondern
  direkt neben der Hauptdatei als `<dateiname>.backup`
  (`jsonFileStore.ts:56-58,147-154`).
- Eine geladene Sicherung wird der Oberfläche nicht mitgeteilt. Ein möglicher
  Rücksprung auf einen älteren Stand bleibt unsichtbar
  (`jsonFileStore.ts:100-110`).
- Vor dem Umbenennen der temporären Datei wird die Hauptdatei gelöscht. Das ist
  kein vollständig atomarer Austausch und erzeugt ein kurzes Fenster ohne
  Hauptdatei (`jsonFileStore.ts:153-154`).
- Lesezugriffe laufen nicht durch die Mutationswarteschlange. Während eines
  Schreibvorgangs könnte ein paralleler Lesezugriff daher einen Zwischenzustand
  sehen.
- Der Store legt nur den Basisordner `dienstplaner-data/` an. Ein Dateiname wie
  `plans/YYYY-MM.json` funktioniert erst, wenn auch dessen tatsächlicher
  Unterordner angelegt wird (`jsonFileStore.ts:48-54,97-99,139-145`).
- Die Datei-Schemas prüfen Feldtypen, aber noch nicht die Eindeutigkeit der IDs
  innerhalb der Mitarbeiter- beziehungsweise Eintragsartenliste.
- Es gibt noch keine Migration zwischen Schema-Versionen.

### 3.4 IPC, Preload und Oberflächen

Die vorhandene Sicherheits- und Schnittstellengrenze ist sinnvoll:

- Nur der Main Process liest und schreibt Dateien.
- IPC-Handler nehmen Nutzdaten als `unknown` entgegen.
- Die Repositories prüfen IDs und Eingaben erneut mit den gemeinsamen
  Zod-Schemas.
- Die Preload-Brücke stellt nur die ausdrücklich freigegebenen Funktionen unter
  `window.dienstplaner` bereit.

Die Dokumentation behauptet teilweise eine zusätzliche Laufzeitvalidierung der
Antworten über die Preload-API (`Datenmodell.md:386-395`,
`Datenhaltung.md:230-235`). Eine solche gesonderte Antwortprüfung gibt es nicht.
Die aktuellen Antworten stammen allerdings aus bereits im Main Process
validierten Repositories. Für den Zielstand genügt diese zentrale Prüfung; die
Dokumentation sollte keine nicht vorhandene zusätzliche Schicht versprechen.

Für Monatspläne fehlen sämtliche Schnittstellen. `channels.ts`,
`dienstplanerApi.ts`, `preload.ts` und `main.ts` kennen nur Mitarbeiter und
Eintragsarten. `App.tsx:28-36,77-90` zeigt für den Dienstplan nur einen
Platzhalter.

## 4. Tragfähige Teile des bestehenden Zielmodells

Folgende Modellentscheidungen aus `Datenmodell.md` können beibehalten werden:

- genau ein Team, daher keine eigene `Team`-Entität;
- lokale JSON-Datenhaltung und keine relationale Datenbank;
- Zod als gemeinsame Laufzeitbeschreibung und daraus abgeleitete
  TypeScript-Typen;
- UUIDs für eigenständig identifizierte Datensätze;
- ganze, nichtnegative Minuten für gespeicherte Zeitdauern;
- `Employee` und `EntryType` als Stammdaten mit Aktivstatus;
- `MonthlyPlan` als vollständiges, gemeinsam gespeichertes Aggregat;
- eingebettete `PlanEmployee`, `PlanDay` und `PlanEntry` statt eigener Dateien;
- vollständige Snapshots ohne lebende Fremdschlüssel zu aktuellen Stammdaten;
- `sourceEmployeeId` und `sourceEntryTypeId` nur als Herkunftsnachweis;
- ein einzelnes `onCallEmployeeId` je Tag für höchstens eine Rufbereitschaft;
- höchstens ein Planungseintrag je Mitarbeiter und Tag;
- keine Speicherung von Kalendermerkmalen und monatlichen Auswertungen;
- nur aktive Stammdaten werden beim Erstellen beziehungsweise Setzen neuer
  Planbestandteile angeboten.

Die Snapshots sind der wichtigste tragfähige Teil: Änderungen, Deaktivierungen
oder Löschungen in `employees.json` und `entry-types.json` dürfen niemals
bestehende Plan-Dateien verändern. Auch beim Laden oder Auswerten darf ein
Snapshot nicht aus aktuellen Stammdaten neu aufgebaut werden.

## 5. Veraltete oder widersprüchliche Beschreibungen

### 5.1 `Datenmodell.md`

1. `Datenmodell.md:7-11` bezeichnet die Eintragsarten noch als nicht umgesetzt.
   Tatsächlich sind Schema, Repository, IPC, Preload und Oberfläche vorhanden.
2. `Employee.role` und `PlanEmployee.role` sind als freier `string` beschrieben;
   die freie Rolle wird sogar ausdrücklich befürwortet
   (`Datenmodell.md:133-161,254-280`). Das widerspricht der neuen verbindlichen
   Rollenliste.
3. Die Rollenprüfung für Rufbereitschaft wird wegen des Freitexts verneint
   (`Datenmodell.md:293-305`). Verbindlich ist die Prüfung gegen die
   Snapshot-Rolle `Erzieher` auch an der Speichergrenze
   (`Berechnungen/04-Tagesbezogene-Kennzahlen.md:48-55`).
4. Alle fünf Zeitwerte werden als eigenständig gespeichert beschrieben
   (`Datenmodell.md:97-127`). `Arbeitszeit (mit NB)` ist jedoch zwingend die
   Summe aus reiner Arbeitszeit und Nachtbereitschaft.
5. Für `weeklyWorkingTime` beschreibt das Dokument nur `workingMinutes` als
   berechneten Wert, setzt die übrigen Werte auf null und verlangt eine Rundung
   (`Datenmodell.md:203-208`). Verbindlich sind reine Arbeitszeit und Arbeitszeit
   mit NB jeweils `Wochenarbeitszeit / 5`; wegen der Teilbarkeit durch fünf wird
   nicht gerundet (`Berechnungen/03-Planungseintraege-und-Snapshots.md:58-75`).
6. Die Teilbarkeit der Wochenarbeitszeit durch fünf fehlt in der beschriebenen
   Mitarbeitervalidierung (`Datenmodell.md:159-161`).
7. Die pauschale Aussage, berechnete Werte würden nicht gespeichert
   (`Datenmodell.md:32`), übersieht die ausdrückliche Ausnahme des berechneten,
   aber im `PlanEntry` gespeicherten Snapshot-Werts `Arbeitszeit (mit NB)`.
8. Unter den nicht gespeicherten Werten stehen `Nachtarbeit` und
   `Nachtbereitschaft` (`Datenmodell.md:367-384`). Die Einzelwerte werden im
   Planungseintrag gespeichert; nur ihre Monatssummen werden berechnet.
9. `Dienst- und Abwesenheitsverteilung` ist dort zu unbestimmt und darf keine
   stillschweigende Eintragskategorisierung voraussetzen.
10. `title` ist als gespeichertes Feld vorgesehen, obwohl die beschriebene
    Bezeichnung vollständig aus Jahr und Monat ableitbar ist. Ohne fachlich
    editierbaren Titel wäre das unnötig redundanter Zustand.

### 5.2 `Datenhaltung.md`

1. Die Beispiele verwenden die alten Rollen `teamLead`, `employee` und `intern`
   statt der drei neuen Rollen (`Datenhaltung.md:51-77,138-152`).
2. Beispiele verwenden `color` und `sky`, während das tatsächliche Schema
   `colorKey` und die Werte `blue`, `emerald`, `amber`, `violet`, `rose` und
   `cyan` verwendet.
3. Im Mitarbeiterbeispiel fehlen `createdAt` und `updatedAt`.
4. Der dargestellte Ordner `backup/` entspricht nicht den tatsächlichen
   angrenzenden `.backup`-Dateien.
5. Die technische Dateiaufteilung unter `Datenhaltung.md:257-274` entspricht
   nicht den heutigen Repository-Dateien und dem heutigen `src/preload.ts`.
6. Rollen, vollständige JSON-Objekte und Zeitwertschemas werden erneut definiert
   und weichen vom Datenmodell beziehungsweise Code ab.
7. `Nachtarbeit` und `Nachtbereitschaft` werden auch hier missverständlich als
   generell nicht gespeichert bezeichnet. Richtig ist: Snapshot-Einzelwerte
   werden gespeichert, Monatsaggregate nicht.
8. Das tatsächliche automatische, aber stille Laden der Sicherung und die
   repository-eigenen Mutationswarteschlangen sind nicht präzise beschrieben.

### 5.3 Weitere Dokumente

- Das Navigations- und Seitenkonzept nennt noch freie Rollenbeispiele wie
  Teamleitung/Mitarbeiter und beschreibt teilweise Deaktivieren, obwohl die
  aktuelle Oberfläche zusätzlich endgültiges Löschen anbietet
  (`Navigations-Seiten-Konzept.md:96-173`).
- Die verbindlichen Berechnungsdokumente enthalten weiterhin unverbindliche
  Zukunftshinweise auf Eintragskategorien
  (`04-Tagesbezogene-Kennzahlen.md:26` und
  `05-Zeitbezogene-Monatskennzahlen.md:46`). Diese Hinweise gehören nicht mehr
  zum aktuellen Zielstand und sollten später neutral formuliert werden.
- Auch `docs/temp/Umsetzungsreihenfolge-Berechnungen.md:244-251` nennt Kategorien
  als nachgelagertes Thema. Die Datei wurde entsprechend der ausdrücklichen
  Vorgabe nicht verändert.
- Der Löschdialog für Eintragsarten verspricht bereits, vorhandene Dienstpläne
  blieben unverändert (`DeleteEntryTypeDialog.tsx:75-78`). Das ist ein richtiges
  Zielverhalten, aber noch kein implementierter Nachweis, weil es noch keine
  Planpersistenz gibt.

## 6. Empfohlener konsistenter Zielstand

### 6.1 Gemeinsame Werttypen

```ts
const EMPLOYEE_ROLES = ['Erzieher', 'Wirtschaftskraft', 'Praktikant'] as const;

type EmployeeRole = (typeof EMPLOYEE_ROLES)[number];
type CalculationType = 'fixed' | 'weeklyWorkingTime';
```

Der gemeinsame `employeeRoleSchema` muss sowohl `Employee.role` als auch
`PlanEmployee.role` validieren. Die Teamoberfläche verwendet dasselbe Array für
eine Auswahl mit genau diesen drei Werten. Eine Rollenprüfung in einer
Fachfunktion findet nur statt, wenn eine verbindliche Regel sie verlangt, etwa
für die Rufbereitschaft. Die allgemeinen Berechnungsformeln bleiben
rollenunabhängig.

Es wird kein `EntryTypeCategory`, kein anderes Kategoriefeld und keine aus
Kürzeln abgeleitete Kategorie eingeführt.

### 6.2 `Employee`

Beibehalten werden können:

```text
id, firstName, lastName, role, weeklyWorkingMinutes,
colorKey, active, createdAt, updatedAt
```

Zusätzlich gelten:

- `role` wird mit `employeeRoleSchema` geprüft;
- `weeklyWorkingMinutes` ist eine nichtnegative ganze Zahl und ohne Rest durch
  fünf teilbar;
- `0` bleibt zulässig;
- die UI darf keine still gerundeten Zwischenwerte erzeugen. Eine Eingabe als
  Dauer `H:MM`/`HH:MM` wäre eindeutiger als Dezimalstunden und kann die bereits
  vorhandene Dauerlogik wiederverwenden.

### 6.3 `EntryType`

Beibehalten werden können:

```text
id, code, name, calculationType, startTime, endTime,
timeValues, active, createdAt, updatedAt
```

Für einen kleinen, zur bestehenden Struktur passenden Umbau wird empfohlen,
`workingMinutes` auch in der Eintragsdefinition zu speichern, aber ausschließlich
technisch abzuleiten:

```text
workingMinutes =
  workingWithoutNightReadinessMinutes + nightReadinessMinutes
```

Damit bleibt die vorhandene gemeinsame `TimeValues`-Form erhalten. Die
Oberfläche zeigt den Wert schreibgeschützt und aktualisiert ihn bei Änderungen
der beiden Ausgangswerte. Das gemeinsame Schema prüft die Summenbeziehung bei
Eingaben, beim Laden und vor dem Speichern. Widersprüchliche gespeicherte Werte
werden abgelehnt und nicht still korrigiert.

Für `weeklyWorkingTime` bleibt die Definition selbst ohne Uhrzeiten und mit
Nullwerten. Erst beim Setzen eines konkreten Planungseintrags werden anhand des
Mitarbeiter-Snapshots reine Arbeitszeit und Arbeitszeit mit NB auf
`weeklyWorkingMinutes / 5` gesetzt.

Die alternative Entfernung von `workingMinutes` aus `EntryType` wäre fachlich
möglich, würde aber getrennte Zeitwertschemas und eine Migration erfordern. Für
den aktuellen Prototyp bringt sie gegenüber der streng geprüften Ableitung
keinen ausreichenden Zusatznutzen.

### 6.4 `MonthlyPlan` als Aggregat

Der Zielaufbau bleibt:

```text
MonthlyPlan
|- PlanEmployee[]
`- PlanDay[]
   `- PlanEntry[]
```

`MonthlyPlan` speichert mindestens Schema-Version, UUID, Jahr, Monat,
Anlage-/Änderungszeitpunkte, Mitarbeiter-Snapshots und sämtliche Plantage. Ein
Titel sollte aus Jahr und Monat berechnet werden, solange kein ausdrücklich frei
editierbarer Plantitel benötigt wird.

`PlanEmployee` speichert:

- planlokale UUID;
- `sourceEmployeeId` als Herkunft, nicht als lebenden Fremdschlüssel;
- Vorname, Nachname;
- die validierte Rolle;
- Wochenarbeitszeit in Minuten;
- Farbschlüssel;
- die Reihenfolge im Plan.

Für den Prototyp genügt es, beim Erstellen die aktuelle Reihenfolge der aktiven
Mitarbeiterliste als lückenlose Positionen `1..n` zu übernehmen. Ein zusätzliches
Reihenfolgefeld in den Mitarbeiterstammdaten und eine neue Sortieroberfläche
sind nicht nötig, solange keine manuelle Teamreihenfolge verlangt wird.

`PlanDay` speichert:

- genau ein gültiges Datum des Planmonats;
- eine optionale Bemerkung;
- keine oder genau eine planlokale Mitarbeiter-ID für Rufbereitschaft;
- die Planungseintrag-Snapshots des Tages.

`PlanEntry` speichert:

- planlokale UUID;
- `planEmployeeId`;
- `sourceEntryTypeId` als Herkunft;
- Kürzel, Bezeichnung, Beginn und Ende;
- Anwesenheit, reine Arbeitszeit, Nachtbereitschaft, Nachtarbeit;
- zwingend auch die berechnete Arbeitszeit mit NB.

Die Berechnungsart muss nicht im Snapshot gespeichert werden, weil der konkrete
Snapshot beim Setzen vollständig bestimmt wird und danach nicht erneut aus der
Definition berechnet werden darf.

### 6.5 Planweite Konsistenzregeln

Beim Erzeugen, Laden und Speichern eines Plans müssen Zod-Verfeinerungen
beziehungsweise ein kleiner fachlicher Planservice mindestens prüfen:

- gültige Kombination aus Jahr und Monat;
- genau die chronologisch geordneten Kalendertage des Monats, ohne Duplikate
  und ohne fremde Daten;
- eindeutige `PlanEmployee.id`- und `sourceEmployeeId`-Werte;
- eindeutige, lückenlose Mitarbeiterpositionen, solange `position` gespeichert
  wird;
- gültige interne Verweise von Einträgen und Rufbereitschaft;
- höchstens ein Eintrag je Mitarbeiter und Tag;
- eindeutige Planungseintrag-IDs im Plan, solange diese IDs beibehalten werden;
- die Summenformel jedes gespeicherten Planungseintrags;
- Rufbereitschaft nur für einen `PlanEmployee` mit Snapshot-Rolle `Erzieher`;
- syntaktisch gültige Herkunfts-IDs, ohne deren aktuelle Stammdatensätze als
  Voraussetzung zu verlangen;
- sichere Ganzzahligkeit auch bei Monatssummen. Ein Überlauf des sicheren
  JavaScript-Zahlenbereichs darf nicht unbemerkt akzeptiert werden.

Die verbindliche Kalenderregel verlangt bei regulärer Erstellung einen
vollständigen Monat. Dass beschädigte oder manuell geänderte Dateien keine neue
fachliche Regel erzeugen, schließt eine strikte technische Ladeprüfung nicht
aus. Ungültige Plan-Dateien sollten technisch abgelehnt oder aus einer gültigen
Sicherung wiederhergestellt werden, nicht teilweise oder zufällig ausgewertet.

### 6.6 Snapshot-Lebenszyklus

- Beim Erstellen werden nur aktuell aktive Mitarbeiter kopiert.
- Spätere Mitarbeiteränderungen, Deaktivierungen, Löschungen oder Neuanlagen
  verändern den Plan nicht.
- Beim Setzen wird nur eine aktuell aktive Eintragsart verwendet und der
  vollständige konkrete Snapshot erzeugt.
- Bei `fixed` werden die gültigen Definitionswerte übernommen.
- Bei `weeklyWorkingTime` wird der Tageswert aus der Wochenarbeitszeit des
  `PlanEmployee`, nicht aus aktuellen Mitarbeiterstammdaten, gebildet.
- Ersetzen einer Zelle erzeugt einen neuen vollständigen Snapshot.
- Entfernen einer Zelle entfernt deren Snapshot.
- Laden und Auswerten verwenden ausschließlich gespeicherte Snapshots.
- `sourceEmployeeId` und `sourceEntryTypeId` lösen keine Kaskade und kein
  Löschverbot aus. Endgültiges Löschen von Stammdaten darf bestehende Pläne
  nicht anfassen.

## 7. Gespeicherte und berechnete Werte

### 7.1 Zu speichern

| Bereich                  | Gespeicherte Werte                                                                                                                 |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Mitarbeiterstamm         | ID, Namen, Rollen-Enum, Wochenminuten, Farbe, Aktivstatus, Zeitpunkte                                                              |
| Eintragsartenstamm       | ID, Kürzel, Name, Berechnungsart, Uhrzeiten, feste Zeitwerte, Aktivstatus, Zeitpunkte                                              |
| Monatsplan               | Version, ID, Jahr, Monat, Zeitpunkte, Mitarbeiter-Snapshots, Plantage                                                              |
| Mitarbeiter-Snapshot     | Herkunfts-ID, Namen, Rollen-Enum, Wochenminuten, Farbe, Reihenfolge                                                                |
| Plantag                  | Datum, optionale Bemerkung, optionale Rufbereitschaft, Zell-Snapshots                                                              |
| Planungseintrag-Snapshot | Herkunfts-ID, Zielmitarbeiter, Kürzel, Name, Uhrzeiten und alle konkreten Zeitwerte einschließlich abgeleiteter Arbeitszeit mit NB |

### 7.2 Zu berechnen und nicht als Monatsauswertung zu speichern

- Plantitel, sofern er nicht frei editierbar sein soll;
- Wochentag, Samstag, Sonntag, Wochenende;
- Feiertagsstatus und sämtliche zutreffenden Feiertagsbezeichnungen;
- kalendarische Arbeitstagszahl;
- SN/F-Dienste, freie Tage, freie Samstage, freie Sonntage;
- Anzahl der Rufbereitschaften;
- monatliche Summen von Arbeitszeit mit NB, reiner Arbeitszeit,
  Nachtbereitschaft und Nachtarbeit;
- Sonntags-/Feiertagszeit;
- Nachtzuschlag und Nachtbereitschaftszuschlag;
- Soll-Arbeitszeit, Ist-Arbeitszeit und Differenz;
- Anzeigeformatierungen, Tabellen- und Exportdarstellung.

Wichtig ist die Ebenentrennung: Nachtarbeit und Nachtbereitschaft werden als
Einzelwerte im Planungseintrag gespeichert; nur ihre Monatsaggregate werden neu
berechnet. `Arbeitszeit (mit NB)` wird zwar berechnet, aber als eingefrorener
Wert im Planungseintrag-Snapshot gespeichert. Daraus folgt nicht, dass die
Monatssumme ebenfalls gespeichert werden sollte.

## 8. Empfohlener Zielstand der Datenhaltung

Die Dateiaufteilung bleibt einfach:

```text
app.getPath('userData')/dienstplaner-data/
|- employees.json
|- employees.json.backup
|- entry-types.json
|- entry-types.json.backup
`- plans/
   |- YYYY-MM.json
   `- YYYY-MM.json.backup
```

Die angrenzenden Sicherungsdateien entsprechen dem aktuellen Store und sind für
den Prototyp ausreichend; ein zusätzliches `backup/`-Verzeichnis wäre nur eine
unnötige zweite Struktur.

Notwendige Ergänzungen:

1. `JsonFileStore` beziehungsweise das Plan-Repository legt den tatsächlichen
   Elternordner jeder Datei an.
2. Lesen und Schreiben derselben Datei werden gemeinsam serialisiert. Für die
   kleine Einfensteranwendung genügt eine globale Plan-Warteschlange; eine
   Datenbank oder komplexe Sperrverwaltung ist nicht nötig.
3. Das Laden aus einer Sicherung darf nicht still bleiben. Empfohlen ist eine
   automatische Verwendung der gültigen Sicherung mit deutlich sichtbarer
   Warnung, dass möglicherweise ein älterer Stand geladen wurde.
4. Sind Haupt- und Sicherungsdatei vorhanden, aber ungültig, wird das Laden
   blockiert. Es wird kein leerer Plan über beschädigte Daten gelegt.
5. Der Dateiname wird ausschließlich im Main Process aus validiertem Jahr und
   Monat gebildet. Der Renderer darf keinen freien Dateipfad liefern.
6. Der Dateiinhalt muss zum angefragten Jahr und Monat sowie zum Dateinamen
   passen.
7. Schemawechsel benötigen entweder eine ausdrückliche Migration oder einen
   bestätigten Reset. Unbekannte Rollen und widersprüchliche Zeitwerte dürfen
   nicht still umgedeutet werden.

Ein schlankes Plan-Repository benötigt zunächst nur:

```text
get(year, month) -> MonthlyPlan | null
create(year, month) -> MonthlyPlan
save(monthlyPlan) -> MonthlyPlan
```

`delete` sollte erst ergänzt werden, wenn das gewünschte Löschverhalten eines
Monatsplans fachlich und in der Oberfläche feststeht. Ein optimistischer
Versionskonflikt oder eine Datenbank ist für den aktuellen Einfenster-Prototyp
nicht nötig.

Der Monatsentwurf kann passend zum dokumentierten manuellen Speichern im
Renderer gehalten werden. Eine gemeinsame, reine Fachfunktion erzeugt beim
Setzen den vollständigen Snapshot aus Eintragsdefinition und
Mitarbeiter-Snapshot. Der Main Process behandelt den übergebenen Entwurf trotzdem
als ungeprüft und validiert das vollständige Aggregat vor jedem Speichern.
Dadurch bleiben sichtbare „ungespeicherte Änderungen“ möglich, ohne jede
Zelländerung sofort auf die Festplatte zu schreiben oder die Fachformel an
mehreren Stellen nachzubauen.

## 9. Empfehlung für `Datenmodell.md` und `Datenhaltung.md`

Die Dokumente sollen getrennt bleiben. Eine Zusammenführung würde fachliches
Modell und technische Speicherung unnötig vermischen und die Dokumente schwerer
wartbar machen.

### `Datenmodell.md` ist allein zuständig für

- Entitäten und Werttypen;
- Feldbedeutungen;
- Rollen- und Zeitwertschemas;
- Beziehungen und Aggregatgrenzen;
- Snapshot-Inhalte und Snapshot-Lebenszyklus;
- gespeichert gegenüber berechnet;
- fachnahe Konsistenzregeln eines gültigen Plans;
- klare Kennzeichnung von tatsächlich umgesetzt und nur geplant.

### `Datenhaltung.md` ist allein zuständig für

- Speicherort und Dateizuordnung;
- tatsächliche Repository- und Store-Aufteilung;
- Lese-, Schreib- und Mutationsablauf;
- temporäre Dateien und Sicherungen;
- Wiederherstellungs- und Fehlerzustände;
- Schema-Versionen und Migration;
- Validierungsgrenzen;
- IPC-/Preload-Grenze;
- Schutz vor überschneidenden Zugriffen.

`Datenhaltung.md` soll keine Rollenlisten, TypeScript-Interfaces oder
vollständigen JSON-Beispiele erneut definieren. Kurze Dateihüllen oder Pfade
sind ausreichend; für Felder und Werte verweist es auf `Datenmodell.md`.
Umgekehrt soll `Datenmodell.md` keine konkreten Repository-Dateinamen oder
Backup-Abläufe wiederholen.

## 10. Noch notwendige Entscheidungen

Die verbindlichen Berechnungsdokumente enthalten keine zwingend offene
Rechenformel mehr. Vor Dokumentänderung und Umsetzung müssen aber folgende
fachliche beziehungsweise technische Punkte bestätigt werden:

1. **Vorhandene Prototypdaten und Schemawechsel:** Sollen vorhandene
   Mitarbeiter- und Eintragsartendaten zurückgesetzt werden, oder wird eine
   einmalige Migration benötigt? Für unbekannte freie Rollen wäre eine
   automatische Zuordnung fachlich nicht zuverlässig. Empfehlung bei reinen
   Testdaten: bestätigter Reset; sonst explizite Zuordnung/Migration.
2. **Arbeitszeit mit NB in `EntryType`:** Empfehlung ist, das bestehende Feld zu
   behalten, aber ausschließlich zu berechnen, schreibgeschützt anzuzeigen und
   streng zu validieren. Im `PlanEntry` ist das Speichern bereits verbindlich.
3. **Planmitarbeiter nach Erstellung:** Soll die Mitarbeiterzusammensetzung
   eines vorhandenen Monatsplans vollständig eingefroren bleiben, oder dürfen
   Mitarbeiter manuell ergänzt, entfernt oder umsortiert werden? Automatische
   rückwirkende Änderungen sind in jedem Fall ausgeschlossen. Empfehlung für
   den ersten Prototyp: Zusammensetzung nach Erstellung unverändert lassen.
4. **Plantitel:** Soll es einen frei editierbaren Titel geben? Wenn nein, wird
   die Bezeichnung aus Jahr und Monat berechnet und nicht gespeichert.
5. **Jahresbereich:** Welchen kleinsten und größten Wert bietet und akzeptiert
   die Planungsseite? Die Kalenderlogik muss für den gesamten Bereich korrekt
   funktionieren.
6. **Beschädigte Monatsplandatei:** Empfehlung ist automatische Verwendung
   einer gültigen Sicherung mit sichtbarer Warnung; sind beide Stände ungültig,
   wird das Laden blockiert. Dieses Verhalten muss bestätigt werden.
7. **Reihenfolge:** Empfehlung ist, die aktuelle Reihenfolge der aktiven
   Mitarbeiter beim Erstellen als `1..n` zu snapshotten. Eine eigene
   Team-Sortierfunktion wird nur benötigt, wenn der Benutzer diese Reihenfolge
   zuvor bearbeiten können soll.
8. **Schema-Versionen:** Bei Migration sollten geänderte Mitarbeiter- und
   Eintragsartendateien eine nachvollziehbare neue Version erhalten;
   `MonthlyPlan` beginnt als neues Modell mit Version 1. Bei einem bestätigten
   vollständigen Testdaten-Reset kann auf eine aufwendige Altdatenmigration
   verzichtet werden.

Nicht mehr offen ist, ob Eintragskategorien eingeführt werden: Sie sind
ausdrücklich ausgeschlossen.

## 11. Priorisierter Änderungsvorschlag

### Priorität 1: Zielentscheidungen bestätigen

- Bestandsdaten: Reset oder Migration;
- gespeicherter, aber abgeleiteter EntryType-Wert `workingMinutes`;
- eingefrorene oder manuell veränderbare Planmitarbeiter;
- Plantitel, Jahresbereich, Recovery und Reihenfolge.

### Priorität 2: Dokumentation angleichen

1. `Datenmodell.md` zum eindeutigen Zielmodell überarbeiten.
2. `Datenhaltung.md` auf technische Speicherung und tatsächliche Architektur
   begrenzen.
3. Zukunftshinweise auf Kategorien aus den verbindlichen Berechnungsdokumenten
   neutralisieren.
4. `docs/temp/Umsetzungsreihenfolge-Berechnungen.md` nur nach ausdrücklicher
   gesonderter Zustimmung an den bestätigten Zielstand anpassen.

### Priorität 3: Stammdaten technisch absichern

- Rollen-Enum im gemeinsamen Schema und als UI-Auswahl;
- Teilbarkeit der Wochenarbeitszeit durch fünf;
- exakte, nicht still rundende Eingabe;
- Arbeitszeit mit NB ableiten, schreibschützen und validieren;
- Datei-Schemas auf eindeutige IDs prüfen;
- beschlossene Migration oder Reset-Strategie umsetzen.

### Priorität 4: Reine Grundlagen und Monatsplanmodell

- schlanke automatisierte Testgrundlage;
- gemeinsame Zeit- und Kalenderfunktionen;
- `MonthlyPlan`, `PlanEmployee`, `PlanDay` und `PlanEntry` als gemeinsame
  Zod-Schemas;
- planweite Konsistenzprüfungen;
- zentrale Snapshot-Erzeugung für beide Berechnungsarten.

### Priorität 5: Planpersistenz und Anwendungsschnittstelle

- Store für Unterordner, sichtbare Recovery und gemeinsame Zugriffskontrolle
  härten;
- Plan-Repository für Laden, Erstellen und manuelles Speichern;
- Plan-IPC-Kanäle, API-Typen, Handler, Preload-Brücke und Main-Registrierung;
- Integrationstests mit temporären echten Dateien, ohne das reale Electron-
  Benutzerverzeichnis zu verwenden.

### Priorität 6: Planungs- und Auswertungsoberfläche

- Monatsauswahl und Planerstellung;
- lokaler Entwurf mit eindeutigem Speicherstatus;
- Setzen, Ersetzen und Entfernen vollständiger Snapshots;
- Rufbereitschaft gegen Snapshot-Rolle prüfen;
- Live-Berechnungen aus dem Entwurf;
- manuelles Speichern und erneutes Laden;
- Auswertungsdarstellung nach den verbindlichen Berechnungsregeln.

Druck und PDF bleiben sinnvoll nachgelagert, bis Planung, Snapshots,
Persistenz und Auswertung fachlich und technisch stabil sind.

## 12. Abgrenzung der ersten Analysephase

Diese Analyse legt einen umsetzbaren Vorschlag vor, nimmt aber keine der offenen
Entscheidungen stillschweigend als freigegeben an. Insbesondere wurden
`Datenmodell.md`, `Datenhaltung.md`, die Berechnungsdokumente, der
Anwendungscode, Pakete und Konfigurationen nicht verändert. Es wurde kein Commit
erstellt.

## 13. Ergebnis der anschließenden Entscheidungs- und Überarbeitungsphase

Nach der ersten Analyse wurden die offenen Entscheidungen gemeinsam geklärt und
die Zieldokumente `docs/Speicherung/Datenmodell.md` und
`docs/Speicherung/Datenhaltung.md` entsprechend überarbeitet. Verbindlich
festgelegt wurden insbesondere:

- vorhandene Prototypdaten werden zurückgesetzt; eine Migration ist nicht
  vorgesehen;
- `workingMinutes` bleibt Teil von `TimeValues`, wird jedoch aus reiner
  Arbeitszeit und Nachtbereitschaft berechnet, schreibgeschützt angezeigt und
  auf Konsistenz geprüft;
- die Mitarbeiterzusammensetzung und -reihenfolge eines Monatsplans werden bei
  dessen Erstellung als unveränderlicher Snapshot festgehalten;
- Monatspläne besitzen einen frei angelegten und später editierbaren Titel;
- mehrere Monatspläne für denselben Monat und dasselbe Jahr sind zulässig und
  werden über ihre Plan-UUID unterschieden;
- der technisch validierte Jahresbereich reicht von `2000` bis `2100`; die
  Oberfläche bietet für neue Pläne ein rollierendes Fenster vom aktuellen Jahr
  plus/minus zwei Jahre an;
- eine gültige Sicherungsdatei wird bei Bedarf automatisch verwendet und in der
  Oberfläche kenntlich gemacht; ohne gültigen Stand wird das Laden blockiert;
- Mitarbeiter- und Eintragsartendateien verwenden im Zielstand
  `schemaVersion: 2`, neue Monatsplandateien beginnen mit `schemaVersion: 1`;
- `TimeValues` bleibt ein gemeinsames Wertobjekt ohne eigene ID; jede der fünf
  Zeitgrößen bleibt darin als eigene Eigenschaft erhalten;
- Eintragskategorien bleiben ausdrücklich außerhalb des Zielmodells.

Damit sind die in Abschnitt 10 aufgeführten blockierenden Entscheidungen
abgeschlossen. Die dortigen Fragen dokumentieren weiterhin den
Entscheidungsweg; für die technische Umsetzung gelten ausschließlich die
überarbeiteten Zieldokumente. Anwendungscode, Pakete und Konfigurationen wurden
in dieser Dokumentationsphase noch nicht verändert.
