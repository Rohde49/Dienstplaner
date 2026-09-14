# Analyse der Planungsoberfläche des Altsystems

## 1. Ziel, Stand und Abgrenzung

Diese Analyse untersucht die tatsächlich implementierte Planungsseite des
Altsystems
[`Rohde49/dienstplan-app`](https://github.com/Rohde49/dienstplan-app) und
gleicht sie mit dem aktuellen Projekt ab. Das Altsystem dient ausschließlich
als Referenz. Seine Lösungen werden nicht automatisch als Zielbild übernommen.

Analysierter Stand:

- Altsystem: Commit
  `255036d0d95fa7fbf53e354a36680a08ee4719c1` vom 22. August 2026
- aktuelles Projekt: Commit
  `f63edfc8427c72eea9ce44f822bafa1be654ad4e`

Für das Altsystem wurde per Sparse-Checkout ausschließlich `src` ausgecheckt.
Der alte `docs`-Ordner wurde weder ausgecheckt noch gelesen. Aussagen über das
Altsystem beruhen deshalb nur auf seinem tatsächlichen Quellcode und den dort
enthaltenen Tests.

Im aktuellen Projekt wurden die angeforderten Dokumente und die relevanten
Dateien unter `src` gelesen. Besonders wichtig sind:

- `docs/Design/*`
- `docs/Berechnungen/*`
- `docs/Speicherung/*`
- `docs/temp/Umsetzungsplan-Planungsoberflaeche.md`
- die Monatsplan-Schemas, Fachfunktionen, Berechnungen, Repositories und
  IPC-/Preload-Verträge unter `src`

`docs/Features/03-PlanPage.md` ist im untersuchten Stand leer. Die konkreten
Vorgaben für die Planungsseite liegen daher zurzeit verteilt in den Design-,
Berechnungs- und Speicherunterlagen sowie im temporären Umsetzungsplan.

### Kennzeichnung der Aussagearten

Die folgenden Begriffe werden bewusst getrennt:

- **Altsystem – belegt:** direkt aus dem alten Quellcode ableitbares Verhalten
- **Interpretation:** technische oder fachliche Einordnung der belegten
  Implementierung
- **Aktuelles Projekt – festgelegt:** durch aktuelle Dokumente oder bereits
  implementierte Fachgrenzen verbindlich vorgegeben
- **Empfehlung:** vorgeschlagene Lösung für das aktuelle Projekt
- **Offene Entscheidung:** Punkt, der nicht bereits eindeutig entschieden ist

## 2. Kurzfazit

Die alte Planungsseite besitzt bereits einen vollständigen, grundsätzlich gut
verständlichen Arbeitsablauf: Monat wählen, Plan anlegen oder laden, Einträge in
einer Monatsmatrix setzen, Rufbereitschaft und Bemerkungen pflegen, live
auswerten und gesammelt speichern. Visuell besonders brauchbar sind die
Kalendertage in Zeilen, die Mitarbeiter in Spalten, die fixierten Tabellenköpfe
und die fixierte Datumsspalte sowie die Kennzeichnung von Wochenenden,
Feiertagen und Mitarbeitern.

Unverändert übernehmbar ist die Lösung dennoch nicht. Die wichtigsten Gründe
sind:

1. Das Altsystem speichert keinen Mitarbeiter-Snapshot je Monatsplan. Alte
   Pläne werden mit den jeweils aktuellen Stammdaten dargestellt und
   ausgewertet.
2. Drei Unterspalten je Mitarbeiter machen das Raster sehr schnell extrem
   breit.
3. Laden, Anlegen und Speichern besitzen keine sichtbaren Beschäftigtzustände
   und keinen Schutz vor Mehrfachauslösung oder verspäteten Antworten.
4. Der Verlustschutz deckt nur einzelne Schaltflächen ab und bietet nicht die im
   aktuellen Projekt festgelegte Möglichkeit „Speichern und wechseln“.
5. Die sogenannte Druckvorschau ist nur eine kompakte Bildschirmtabelle; eine
   echte Druck- oder PDF-Vorschau ist nicht implementiert.
6. Die IPC-/Repository-Grenze des Altsystems validiert Planzugehörigkeit,
   Rollen und viele Werte nicht zuverlässig.
7. Mehrere Planungsaktionen sind nur mit der Maus vollständig nutzbar oder für
   Hilfstechnologien nicht ausreichend beschriftet.

Für das aktuelle Projekt sollte deshalb die bewährte Grundform der
Monatsmatrix angepasst übernommen werden. Datenmodell, Snapshot-Lebenszyklus,
Berechnungen, sichere Speicherung, Navigation und Rückmeldungen müssen dagegen
auf der bereits vorhandenen aktuellen Architektur aufbauen.

## 3. Verbindliche Ausgangsbasis des aktuellen Projekts

Die folgenden Punkte sind bereits festgelegt und dürfen in der späteren
Entscheidungsrunde nicht erneut als offen behandelt werden.

| Bereich              | Bestehende Festlegung                                                                                                                                                                       | Beleg im aktuellen Projekt                                                                                             |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Navigation           | „Dienstplan“ ist die Startansicht in einer festen linken Hauptnavigation; eine zusätzliche Startseite ist nicht vorgesehen.                                                                 | `docs/Design/Navigations-Seiten-Konzept.md:1-20`; `src/renderer/components/layout/AppShell.tsx:24-40`                  |
| Grundlayout          | Die Planungsseite nutzt die gesamte Inhaltsbreite. Tage stehen zeilenweise, Mitarbeiter in Spalten; bei Platzmangel wird horizontal gescrollt.                                              | `docs/Design/globale-UI-Basis.md:106-124`; `docs/temp/Umsetzungsplan-Planungsoberflaeche.md:36-56`                     |
| Kalender             | Jeder Plan enthält alle Tage des Monats chronologisch. Wochenenden und Brandenburg-Feiertage bleiben beplanbar und werden gekennzeichnet; Feiertage haben visuell Vorrang.                  | `docs/Berechnungen/02-Kalender-und-Arbeitstage.md:3-10,42-58,68-73`; `docs/Design/Farbkonzept.md:49-63`                |
| Jahr                 | Das Datenmodell unterstützt 2000 bis 2100. Bei der Neuanlage zeigt die Oberfläche standardmäßig das aktuelle Jahr sowie jeweils zwei Jahre davor und danach.                                | `docs/Speicherung/Datenmodell.md:263-272`                                                                              |
| Mehrere Pläne        | Mehrere eigenständige Pläne desselben Monats und Jahres sind zulässig und bleiben durch ihre UUID getrennt.                                                                                 | `docs/Speicherung/Datenmodell.md:263-280`; `docs/Speicherung/Datenhaltung.md:97-101,198-200`                           |
| Plantitel            | Der Titel ist erforderlich, auf 200 Zeichen begrenzt und grundsätzlich später editierbar. Jahr und Monat sind nach der Erstellung unveränderlich.                                           | `docs/Speicherung/Datenmodell.md:265-275`                                                                              |
| Plananlage           | „Erstellen“ erzeugt und speichert sofort einen vollständigen Monatsplan. Er ist danach der gespeicherte Ausgangsstand, nicht nur ein ungespeicherter lokaler Entwurf.                       | `docs/Speicherung/Datenhaltung.md:175-200`; `docs/temp/Umsetzungsplan-Planungsoberflaeche.md:137-143`                  |
| Mitarbeiter-Snapshot | Beim Erstellen werden nur aktive Mitarbeiter mit Namen, Rolle, Wochenarbeitszeit, Farbe und Reihenfolge eingefroren. Bestehende Pläne werden nicht aus aktuellen Stammdaten neu aufgebaut.  | `docs/Speicherung/Datenmodell.md:276-310,407-418`; `src/main/domain/monthlyPlanFactory.ts:19-59`                       |
| Eintrag pro Zelle    | Je Mitarbeiter und Tag gibt es höchstens einen Eintrag. Setzen und Ersetzen erzeugt einen vollständigen Snapshot; beim Ersetzen bleibt die Eintrags-ID stabil.                              | `docs/Speicherung/Datenmodell.md:347-382`; `src/main/domain/monthlyPlanEntries.ts:19-106`                              |
| Eintragsauswahl      | Für neue Einträge werden nur aktive Eintragsarten angeboten. Die Auswahl zeigt mindestens Kürzel und Bezeichnung. Entfernen benötigt keine zusätzliche Bestätigung.                         | `docs/Speicherung/Datenmodell.md:240-241,407-418`; `docs/temp/Umsetzungsplan-Planungsoberflaeche.md:145-151`           |
| Eintragskategorien   | Es wird im aktuellen Zielmodell ausdrücklich keine Eintragskategorie eingeführt. Die vereinbarten Kennzahlen SN/F und Frei beruhen weiterhin auf exakten Snapshot-Kürzeln.                  | `docs/Speicherung/Datenmodell.md:48-51`; `docs/Berechnungen/04-Tagesbezogene-Kennzahlen.md:16-46`                      |
| Rufbereitschaft      | Pro Tag ist höchstens eine Rufbereitschaft zulässig, ausschließlich für einen Planmitarbeiter mit Snapshot-Rolle `Erzieher`. Normaler Eintrag und Rufbereitschaft dürfen parallel bestehen. | `docs/Berechnungen/04-Tagesbezogene-Kennzahlen.md:48-77`; `docs/Speicherung/Datenmodell.md:324-340`                    |
| Bemerkung            | Eine Bemerkung gehört zum Kalendertag. Leere oder nur aus Leerzeichen bestehende Eingaben werden als `null` gespeichert.                                                                    | `docs/Speicherung/Datenmodell.md:312-345`; `src/shared/schemas/monthlyPlan.ts:115-130`                                 |
| Entwurf              | Änderungen werden im Renderer als Entwurf gehalten und nicht pro Zelle gespeichert. Kennzahlen reagieren sofort auf den Entwurf.                                                            | `docs/Berechnungen/03-Planungseintraege-und-Snapshots.md:116-126`; `docs/Speicherung/Datenhaltung.md:294-307`          |
| Speichern            | Ein ausdrücklicher Speichervorgang validiert und speichert das vollständige Aggregat. Der zurückgegebene Plan wird zur neuen Baseline.                                                      | `docs/Speicherung/Datenhaltung.md:151-168,202-210`; `docs/temp/Umsetzungsplan-Planungsoberflaeche.md:275-288`          |
| Verlustschutz        | Beim Verlassen mit Änderungen sind „Speichern und wechseln“, „Änderungen verwerfen“ und „Abbrechen“ vorgesehen.                                                                             | `docs/Design/Navigations-Seiten-Konzept.md:212-225`; `docs/Design/visuelles-Feedback.md:42-57`                         |
| Auswertung           | Berechnet wird live aus dem Entwurf. Die ausführliche einblendbare Auswertung wird unterhalb des Plans in einem eigenen späteren Schritt umgesetzt.                                         | `docs/Design/Navigations-Seiten-Konzept.md:63,84-95`; `docs/temp/Umsetzungsplan-Planungsoberflaeche.md:27-34,88-90`    |
| Ausgabe              | Eine echte Druckvorschau und PDF-Ausgabe sind eigene spätere Funktionen. Verbindliche Ausgaben dürfen nur auf dem gespeicherten Stand beruhen.                                              | `docs/Design/Navigations-Seiten-Konzept.md:174-195`; `docs/Berechnungen/03-Planungseintraege-und-Snapshots.md:118-126` |
| Löschen              | Das Löschen eines vollständigen Monatsplans gehört nicht zum aktuellen Umsetzungsschritt.                                                                                                   | `docs/temp/Umsetzungsplan-Planungsoberflaeche.md:27-34`                                                                |

Technischer Iststand: Monatsplanmodell, Zelloperationen, Berechnungen,
Speicherung und IPC-Vertrag sind vorhanden; die Renderer-Seite ist noch ein
Platzhalter (`src/renderer/App.tsx:28-39,77-90`).

## 4. Seitenzugang, Navigation und Anfangszustand

### Altsystem – belegt

- Eine separate Startseite zeigt drei Kacheln. „Dienstplan erstellen“ führt zur
  Route `/dienstplan` (`src/renderer/src/pages/StartPage.tsx:12-30,47-64`).
- Die Planungsseite wird als eigene Router-Route eingebunden
  (`src/renderer/src/App.tsx:8-17`).
- Sie startet mit dem aktuellen Monat und Jahr; zur Neuanlage werden nur das
  aktuelle Jahr und jeweils zwei Jahre davor und danach angeboten
  (`src/renderer/src/pages/PlanPage.tsx:47-76`).
- Es wird nicht automatisch ein vorhandener Plan des aktuellen Monats geladen.
  Stattdessen zeigt die Seite sofort ein nicht interaktives Monatsraster als
  „Vorschau · nicht gespeichert“
  (`src/renderer/src/pages/PlanPage.tsx:80-111,499-523`;
  `src/renderer/src/components/layout/PlanungsGrid.tsx:223-250`).
- Das Team wird beim Mounten der Seite asynchron geladen. Ein Ladezustand wird
  nicht angezeigt (`src/renderer/src/pages/PlanPage.tsx:100-109`).

### Interpretation und Bewertung

Die Vorschau vermittelt die Monatsstruktur früh, sieht einem echten Plan aber
zu ähnlich und ist nicht bearbeitbar. Während das Team noch lädt, kann zunächst
eine scheinbar fertige, aber mitarbeiterlose Tabelle erscheinen. Ein bereits
vorhandener Monatsplan muss nach jedem erneuten Öffnen der Route manuell über
„Laden“ ausgewählt werden.

Die alte Startseite passt nicht zum aktuellen Navigationskonzept. Das rollierende
Jahresfenster passt dagegen zum bereits festgelegten aktuellen Modell.

### Empfehlung für das aktuelle Projekt

- Linke Navigation und `PageHeader` des aktuellen Projekts verwenden.
- Zuerst Planliste laden und einen ausdrücklichen Ladezustand zeigen.
- Ohne passenden Plan den bereits vorgesehenen erklärenden Empty State mit
  „Dienstplan erstellen“ zeigen, statt ein deaktiviertes Vollraster vorzutäuschen.
- Bei einem geladenen Plan ausschließlich dessen Snapshots darstellen.

### Entscheidungsstatus

Die Grundnavigation, das rollierende Jahresfenster und der Empty State sind
bereits festgelegt. Offen bleibt nur das genaue automatische oder manuelle
Auswahlverhalten, wenn für einen Zeitraum Pläne vorhanden sind; siehe
Entscheidung 2.

## 5. Kopfbereich, Zeitraum und Aktionshierarchie

### Altsystem – belegt

Der alte Kopfbereich ist eine Karte mit einem festen dreispaltigen Raster:

```text
Startseite + Monat/Jahr | Dienstplan erstellen | Ansicht + Drucken + Auswertung
------------------------+-----------------------+-------------------------------
             Titel + Änderungsstatus + Erstellen/Neu + Speichern + Laden
```

Belegt ist dieser Aufbau in
`src/renderer/src/pages/PlanPage.tsx:342-497`.

- Monat und Jahr werden nach dem Erstellen oder Laden deaktiviert
  (`PlanPage.tsx:359-391`).
- Die Überschrift bleibt auch bei einem geladenen Plan „Dienstplan erstellen“
  (`PlanPage.tsx:395-401`).
- „Erstellen“ beziehungsweise „Neu anlegen“, „Speichern“ und „Laden“ stehen
  gleichrangig nebeneinander (`PlanPage.tsx:451-495`).
- Es gibt keine Vor-/Zurück-Schaltflächen für Monate.
- Der Druckknopf ist dauerhaft deaktiviert (`PlanPage.tsx:436-439`).
- Das feste Raster besitzt keine schmalere oder umbrechende Variante.

### Interpretation und Bewertung

Positiv ist, dass die zentralen Aktionen oberhalb der Tabelle bleiben. Die
visuelle Hierarchie ist jedoch unklar, der Titel ist im geladenen Zustand
unzutreffend und der starre Kopf kann bei kleineren Fenstern überlaufen.

### Abgleich und Empfehlung

Nicht den alten Kartenkopf kopieren. Der aktuelle `PageHeader` sollte Titel,
Speicherstatus und die primäre Speichern-Aktion tragen. Zeitraum,
Planauswahl, Vor-/Zurück-Navigation und Neuanlage gehören in eine eigene
`Toolbar`. Das entspricht bereits dem Umsetzungsplan
(`docs/temp/Umsetzungsplan-Planungsoberflaeche.md:58-86`).

Nicht verfügbare Druck-/PDF-Aktionen sollten aus meiner Sicht zunächst fehlen,
statt dauerhaft deaktiviert Platz und Aufmerksamkeit zu beanspruchen.

### Entscheidungsstatus

Der grundsätzliche Seitenaufbau ist festgelegt. Offen ist, ob spätere
Ausgabeaktionen bis zu ihrer Umsetzung fehlen oder deaktiviert angezeigt
werden; siehe Entscheidung 9.

## 6. Plananlage, Plantitel und Planidentität

### Altsystem – belegt

- Der Titel ist beim Anlegen optional (`PlanPage.tsx:451-459`).
- „Erstellen“ persistiert Plan und sämtliche Monatstage sofort in einer
  SQLite-Transaktion (`PlanPage.tsx:161-176`;
  `src/main/db/dienstplanRepository.ts:66-106`).
- Mehrere Pläne desselben Monats sind möglich, weil weder Code noch Tabelle
  Zeitraum-Eindeutigkeit verlangen
  (`src/main/db/dienstplanRepository.ts:17-36,66-77`).
- Nach dem Anlegen zeigt die Seite den Titel als Text mit Stift-Schaltfläche.
  Eine Titeländerung wird erst beim allgemeinen Speichern dauerhaft
  (`PlanPage.tsx:451-473,239-284`).
- „Neu anlegen“ leert den aktiven Zustand, behält aber den gewählten Monat und
  das Jahr (`PlanPage.tsx:179-190,478-483`).
- Es gibt keinen Beschäftigtzustand. Mehrfachklicks können mehrere Pläne
  erzeugen.

### Interpretation und Bewertung

Das sofortige Persistieren ist konsistent mit einem lokalen Desktopprogramm,
aber der Unterschied zwischen „Erstellen“ und späterem „Speichern“ muss klar
kommuniziert werden. Im Altsystem entsteht die Zulässigkeit mehrerer Pläne eher
durch fehlende Eindeutigkeit als durch eine ausgearbeitete Auswahlführung.

### Aktuelles Projekt – festgelegt

Mehrere Pläne desselben Zeitraums sind bewusst zulässig. Der Titel ist Pflicht,
maximal 200 Zeichen lang und später editierbar. „Erstellen“ liefert bereits den
gespeicherten Ausgangsstand. Diese Grundfragen sind nicht mehr offen
(`docs/Speicherung/Datenmodell.md:263-280`;
`docs/temp/Umsetzungsplan-Planungsoberflaeche.md:137-143`).

### Empfehlung

- Titel in einem kleinen, validierten Anlagedialog erfassen.
- Während der Anlage die Aktion sperren und einen Ladezustand zeigen.
- Bei mehreren Plänen Titel und Änderungszeitpunkt zur eindeutigen Auswahl
  verwenden; technische UUIDs nicht prominent anzeigen.
- Titelbearbeitung spätestens gemeinsam mit dem allgemeinen Speichern
  ermöglichen. Ob sie bereits im ersten UI-Schritt enthalten ist, bleibt eine
  Umfangsentscheidung.

### Entscheidungsstatus

Offen sind das Auswahlverhalten bei mehreren Plänen und der Zeitpunkt der
Titelbearbeitung; siehe Entscheidungen 2 und 3.

## 7. Mitarbeiterbestand, Rollen und Reihenfolge

### Altsystem – belegt

- Der Plan selbst enthält keine Mitarbeiterliste oder Mitarbeiter-Snapshots
  (`src/shared/types.ts:46-60`).
- Die Seite lädt das aktuelle Team und erzeugt daraus bei jeder Darstellung die
  Spalten (`PlanPage.tsx:100-109`;
  `PlanungsGrid.tsx:253-264,274-357`).
- Planeinträge speichern nur die aktuelle `teamMemberId`, aber keinen Namen,
  keine Rolle, keine Wochenarbeitszeit und keine Farbe
  (`src/shared/types.ts:62-77`).
- Neue Mitarbeiter erscheinen deshalb auch in alten Plänen als neue leere
  Spalte. Änderungen an Name, Rolle, Wochenarbeitszeit oder Farbe verändern
  alte Pläne rückwirkend. Dies ist eine direkte technische Folge der genannten
  Datenflüsse.
- Das Löschen eines Mitarbeiters wird nur blockiert, wenn bereits ein Eintrag
  oder eine Rufbereitschaft auf ihn verweist
  (`src/main/db/teamRepository.ts:56-73`). Ein Mitarbeiter ohne Belegung kann
  trotz bestehendem Monatsplan verschwinden.
- Im Raster erscheinen alle Rollen. Kennzahlen werden dort jedoch nur für
  `Erzieher` berechnet; andere Rollen erhalten `n/A`
  (`PlanungsGrid.tsx:226-243,274-315,449-486`).

### Bewertung

Dies ist die gravierendste fachliche Schwäche des Altsystems. Ein historischer
Plan ist nicht stabil. Besonders problematisch ist eine spätere Änderung der
Wochenarbeitszeit: Bereits gesetzte mitarbeiterabhängige Einträge behalten ihren
alten Zeitwert, während Sollwerte mit dem neuen Mitarbeiterstamm berechnet
werden.

### Aktuelles Projekt – festgelegt und umgesetzt

Das aktuelle `MonthlyPlan`-Aggregat friert Namen, Rolle, Wochenarbeitszeit,
Farbe und Position ein. Laden, Bearbeiten und Auswerten verwenden nur diese
Snapshots (`docs/Speicherung/Datenmodell.md:284-310`;
`src/main/domain/monthlyPlanFactory.ts:19-59`). Die Altlösung passt daher nicht
zum aktuellen Modell.

### Empfehlung

- Ausschließlich `plan.employees`, sortiert nach `position`, als Spaltenquelle
  verwenden.
- Keine zweite Teamabfrage zum Aufbau eines geladenen Plans durchführen.
- Rufbereitschaft und Berechnungen ebenfalls aus der Snapshot-Rolle und
  Snapshot-Wochenarbeitszeit ableiten.
- Für alle Planmitarbeiter normale Planungszellen zeigen. Tageskennzahlen gelten
  laut aktuellem Regelwerk für alle Rollen; nur die konkrete zeitbezogene
  Auswertungsdarstellung filtert später auf `Erzieher`.

### Entscheidungsstatus

Keine offene fachliche Entscheidung. Snapshot-Inhalt, Reihenfolge und
Rollenregeln sind bereits festgelegt. Technisch sollte die Oberfläche zur
Sicherheit ausdrücklich nach `position` sortieren, weil das Schema zwar eine
lückenlose Positionsfolge, aber nicht dieselbe Reihenfolge des Arrays erzwingt.

## 8. Tabellenaufbau, Dichte und Scrollverhalten

### Altsystem – belegt

Das Planungsraster enthält:

- eine Datumsspalte,
- je Mitarbeiter drei Unterspalten „Eintrag“, „Beginn“ und „Ende“,
- eine Spalte „Rufbereitschaft“,
- eine Spalte „Bemerkung“
  (`PlanungsGrid.tsx:32-55,253-265,331-358`).

Je Mitarbeiter werden damit `16,5 rem` feste Breite belegt; hinzu kommen
`8,5 rem` für das Datum sowie jeweils `9 rem` für Rufbereitschaft und Bemerkung
(`PlanungsGrid.tsx:32-36,253-265`;
`src/renderer/src/lib/planAnsicht.ts:10-11`).

Die Tabelle besitzt einen eigenen horizontalen und vertikalen Scrollbereich.
Drei Kopfzeilen bleiben vertikal sichtbar; die Datumsspalte bleibt horizontal
sichtbar (`PlanungsGrid.tsx:245-253,266-389`). Ist- und Sollzeilen am Tabellenende
sind nicht fixiert (`PlanungsGrid.tsx:449-486`).

Nicht vorhanden sind Mehrfachauswahl, Kopieren, Ziehen/Ausfüllen, Undo/Redo,
Suche, Filter oder Virtualisierung.

### Bewertung

Die zweidimensionale Monatsmatrix und das zweiachsige Sticky-Verhalten sind
stark. Drei Unterspalten je Person zeigen Zeiten ohne Zusatzaktion, führen bei
normalen Teamgrößen aber zu sehr häufigem horizontalem Scrollen. Die in den
aktuellen Designregeln gewünschte kompakte Planansicht würde dadurch unnötig
breit.

### Empfehlung

- Monatsmatrix, internen Scrollcontainer, fixierten Kopf und fixiertes Datum
  angepasst übernehmen.
- Je Mitarbeiter zunächst eine kompakte Planungszelle verwenden. Sichtbar ist
  primär das Kürzel; Bezeichnung und Zeiten erscheinen über zugänglichen
  Zusatztext beziehungsweise im Popover.
- Keine Massenbearbeitung oder Virtualisierung aufnehmen, solange kein
  konkreter Bedarf oder Leistungsproblem belegt ist.
- Mitarbeiterkopf aus Farbe, vollständigem Namen und Wochenarbeitszeit bilden.

### Entscheidungsstatus

Die Matrix, das horizontale Scrollen und die fixierte Datumsspalte sind
festgelegt. Die Informationsdichte der Mitarbeiterzelle und der vertikal
fixierte Tabellenkopf müssen noch bestätigt werden; siehe Entscheidung 4.

## 9. Kalenderzeilen, Wochenende und Feiertage

### Altsystem – belegt

- Jede Zeile zeigt Datum, Wochentagskürzel und bei Feiertagen den Namen
  (`PlanungsGrid.tsx:361-389`).
- Feiertage erhalten eine rote Tönung, Wochenenden eine graue. Feiertage haben
  Vorrang (`PlanungsGrid.tsx:361-366`;
  `src/renderer/src/lib/planAnsicht.ts:7-8`).
- Die Kalenderlogik ist fest auf Brandenburg codiert
  (`src/shared/kalendertage.ts:44-88`).
- Das Altsystem verwendet eine `Map<string, string>`. Treffen mehrere
  Feiertagsdefinitionen auf dasselbe Datum, kann nur ein Name erhalten bleiben
  (`src/shared/kalendertage.ts:46-63`).

### Bewertung und Abgleich

Die sichtbare Kalenderstruktur passt sehr gut. Das aktuelle Projekt hat die
fachliche Regel jedoch präziser umgesetzt: Es erhält alle Feiertagsnamen eines
Datums und berechnet zeitzonenunabhängig über UTC
(`docs/Berechnungen/02-Kalender-und-Arbeitstage.md:54-59`;
`src/shared/calculations/calendar.ts:171-215`).

### Empfehlung

Nur die visuelle Idee übernehmen. Datum, Wochenende, Feiertagsstatus und Namen
immer mit den aktuellen gemeinsamen Kalenderfunktionen aus `PlanDay.date`
ableiten. Keine zweite Kalenderlogik in der UI aufbauen.

### Entscheidungsstatus

Keine offene fachliche Entscheidung. Die genaue kompakte Darstellung mehrerer
Feiertagsnamen ist ein Implementierungsdetail, das bei der visuellen Abnahme
geprüft werden sollte.

## 10. Eintrag auswählen, setzen, ersetzen und entfernen

### Altsystem – belegt

- Klick auf Kürzel, Beginn oder Ende öffnet dasselbe Popover
  (`PlanungsGrid.tsx:64-128`).
- Die Auswahl enthält „Kein Eintrag“ sowie alle Eintragsdefinitionen mit Kürzel,
  Beginn und Ende. Die Bezeichnung wird nicht angezeigt
  (`src/renderer/src/components/EintragsdefinitionAuswahl.tsx:5-52`).
- Bei jedem Öffnen wird die Liste erneut über IPC geladen. Lade-, Leer- und
  eigene Fehlerzustände fehlen (`EintragsdefinitionAuswahl.tsx:20-30`).
- Auswahl oder „Kein Eintrag“ ändert nur den lokalen Entwurf und schließt das
  Popover (`PlanungsGrid.tsx:97-105`;
  `PlanPage.tsx:192-209`).
- Feste Eintragsdefinitionen werden vollständig in die Zelle kopiert.
  Mitarbeiterabhängige Einträge bilden ihren Tageswert aus der aktuellen
  Wochenarbeitszeit (`src/renderer/src/lib/planeintragSnapshot.ts:10-41`).
- Beginn und Ende sind reine Anzeigen und nicht pro Zelle editierbar
  (`PlanungsGrid.tsx:107-125`).

### Stärken, Schwächen und Vereinfachungen

Die Auswahl einer ganzen Definition ist schnell und passt zum Snapshotprinzip.
Das Entfernen ohne Bestätigungsdialog ist angemessen, weil erst das spätere
Speichern dauerhaft wirkt.

Schwach sind die fehlende Bezeichnung, wiederholte Ladevorgänge, fehlende
Lade-/Leerzustände und die fehlende Kennzeichnung der aktuellen Auswahl. Eine
Suche oder Favoriten fehlen; bei dem erwartbar kleinen Bestand ist das zunächst
eine vertretbare Vereinfachung.

### Aktuelles Projekt – festgelegt

Nur aktive Eintragsarten dürfen neu gesetzt werden. Kürzel, Bezeichnung,
Uhrzeiten und alle Zeitwerte werden gesnapshottet; pro Zelle gibt es genau einen
Eintrag. Ein Ersetzen behält die Eintrags-ID stabil
(`docs/Speicherung/Datenmodell.md:347-382,407-418`). Individuelle Zeitkorrekturen
in einer Planungszelle gehören nicht zum beschriebenen Schritt-8-Ablauf.

### Empfehlung

- Aktive Eintragsarten einmal für die Seite laden und für alle Popover
  wiederverwenden.
- Auswahl mindestens mit Kürzel und vollständiger Bezeichnung zeigen; Beginn
  und Ende als hilfreiche sekundäre Information ergänzen.
- „Eintrag entfernen“ nur bei belegter Zelle sichtbar anbieten.
- Lade-, Leer- und Fehlerzustand der Eintragsartenliste behandeln.
- Zellentrigger mit Datum, Mitarbeiter und aktuellem Eintrag zugänglich
  beschriften.
- Noch keine Suche, Favoriten, Mehrfachbelegung oder individuellen Zeitfelder
  ergänzen.

### Entscheidungsstatus

Grundablauf und Snapshotinhalt sind festgelegt. Offen ist die genaue sichtbare
Informationsmenge und Tastaturführung des Popovers; siehe Entscheidung 5.

## 11. Rufbereitschaft

### Altsystem – belegt

- Pro Tag existiert genau eine Rufbereitschaftszelle
  (`PlanungsGrid.tsx:409-428`).
- Das Popover bietet „Keine Rufbereitschaft“ und lädt separat alle aktuell als
  `Erzieher` geführten Teammitglieder
  (`src/renderer/src/components/RufbereitschaftAuswahl.tsx:12-38`).
- Im Raster wird nur der Nachname angezeigt
  (`PlanungsGrid.tsx:151-173`).
- Der Entwurf speichert pro Dienstplantag eine Mitarbeiter-ID
  (`PlanPage.tsx:211-225`).
- Die Datenbank erzwingt höchstens eine Rufbereitschaft pro Tag, nicht aber die
  Rolle oder Existenz der Person
  (`src/main/db/rufbereitschaftRepository.ts:6-13`).

### Bewertung und Abgleich

Die einfache Tageszuordnung passt fachlich. Das Nachladen aus aktuellen
Stammdaten, der reine Nachname und die ausschließlich oberflächenseitige
Rollenprüfung passen nicht zum aktuellen Snapshotmodell.

### Empfehlung

- Auswahl ausschließlich aus `plan.employees` mit Rolle `Erzieher` bilden.
- Personen mit Vor- und Nachnamen eindeutig anzeigen; bei engen Spalten darf
  nur die sichtbare Kurzform gekürzt werden, der zugängliche Name bleibt
  vollständig.
- „Keine Rufbereitschaft“ zum direkten Entfernen beibehalten.
- Schema- und Main-Process-Prüfung als maßgebliche Grenze verwenden.

### Entscheidungsstatus

Kardinalität, Rollenregel und unabhängige Zählung sind bereits festgelegt.
Offen ist nur die Position der Spalte im Raster; siehe Entscheidung 6.

## 12. Tagesbemerkung

### Altsystem – belegt

- Je Kalendertag gibt es ein direkt eingebettetes einzeiliges Textfeld
  (`PlanungsGrid.tsx:177-207,429-445`).
- Die UI begrenzt die Eingabe auf 40 Zeichen
  (`src/renderer/src/lib/validateBemerkung.ts:1-8`;
  `PlanungsGrid.tsx:196-200`).
- Nur der exakt leere String wird beim Speichern zu `null`; Leerzeichen bleiben
  erhalten (`PlanPage.tsx:254-259`).
- Repository und Datenbank prüfen die 40-Zeichen-Grenze nicht
  (`src/main/db/dienstplanRepository.ts:29-36,208-214`).
- Das Eingabefeld besitzt keinen zugänglichen Namen und keine explizite
  Zuordnung zum Datum (`PlanungsGrid.tsx:194-204`).

### Bewertung und Abgleich

Direkte Eingabe ist schnell, aber ein schmales permanentes Textfeld vergrößert
die Tabelle und eignet sich nur für sehr kurze Hinweise. Die 40-Zeichen-Grenze
ist im Altsystem eine UI-Vereinfachung, keine abgesicherte Fachregel.

Das aktuelle Schema trimmt die Bemerkung und wandelt leeren Inhalt zu `null`
um, setzt aber bewusst keine Längenobergrenze
(`src/shared/schemas/monthlyPlan.ts:115-130`). Eine ungeprüfte Übernahme der
alten Grenze wäre daher eine neue fachliche Regel.

### Empfehlung

- Bemerkung weiterhin tagesbezogen belassen.
- Im Raster eine kompakte, gekürzte Vorschau oder ein eindeutiges Symbol mit
  Status zeigen; Bearbeitung in einem kleinen Popover oder Dialog mit
  beschrifteter `Textarea`.
- Zugänglichen Namen einschließlich Datum vergeben.
- Keine 40-Zeichen-Grenze übernehmen. Eine Grenze nur nach fachlicher
  Begründung ergänzen; die Anzeige selbst muss lange Texte durch Kürzung statt
  wachsende Zeilen beherrschen.

### Entscheidungsstatus

Tagesbezug und Leerwertnormalisierung sind festgelegt. Position und
Bearbeitungsform sind offen; siehe Entscheidungen 6 und 7.

## 13. Entwurf, Änderungsmarkierung und Live-Berechnung

### Altsystem – belegt

- Planeinträge und Rufbereitschaften besitzen jeweils Entwurf und Baseline.
  Bemerkungen werden gegen die geladenen Tage verglichen
  (`PlanPage.tsx:80-92,113-159`).
- Eintrags-Snapshots werden für die Änderungsprüfung mit `JSON.stringify`
  verglichen (`PlanPage.tsx:113-125`).
- Titel, Einträge, Rufbereitschaft oder Bemerkung können den Gesamtstatus
  „ungespeicherte Änderung“ auslösen (`PlanPage.tsx:154-159,474-476`).
- Geänderte Einzelzellen erhalten einen kleinen blauen Punkt
  (`PlanungsGrid.tsx:84-105,151-173,194-205`).
- Alle angezeigten Kennzahlen werden direkt aus dem aktuellen Entwurf berechnet
  (`PlanungsGrid.tsx:226-243`;
  `src/renderer/src/components/AuswertungDialog.tsx:88-106`).

### Bewertung

Die Trennung von Baseline und Entwurf sowie die sofortige Live-Auswertung sind
sehr gut übertragbare Konzepte. Das Zurücksetzen einer Zelle auf den
Ausgangswert entfernt die Änderung automatisch.

Der kleine blaue Punkt ist jedoch nur visuell, nicht erklärt und nicht
barrierearm. Zudem fehlt die eindeutige Unterscheidung zwischen
Entwurfsauswertung und gespeichertem, für eine Ausgabe verbindlichem Stand.

### Empfehlung

- Baseline und Entwurf des vollständigen `MonthlyPlan` getrennt halten.
- Dirty-Zustand durch strukturellen Vergleich der zulässig editierbaren Felder
  ableiten; technische Zeitstempel dabei nicht als Benutzeränderung behandeln.
- Gesamtstatus immer textlich anzeigen.
- Geänderte Zellen zusätzlich durch Form/Rahmen und zugänglichen Status
  kennzeichnen; nicht nur durch Farbe.
- Live-Kennzahlen ausdrücklich als Werte des aktuellen Entwurfs behandeln.

### Entscheidungsstatus

Entwurf, Live-Berechnung und dauerhaft sichtbarer Gesamtstatus sind festgelegt.
Ob bereits in Schritt 8 eine kleine Kennzahlenübersicht sichtbar wird, ist
offen; siehe Entscheidung 8.

## 14. Speichern und Nebenläufigkeit

### Altsystem – belegt

- Nur die gegenüber der Baseline veränderten Einträge, Rufbereitschaften und
  Bemerkungen werden übertragen; der Titel wird immer übertragen
  (`PlanPage.tsx:239-268`).
- Das Repository speichert Titel, Einträge, Rufbereitschaften und Bemerkungen in
  einer SQLite-Transaktion und liest anschließend den neuen Gesamtstand
  (`src/main/db/dienstplanRepository.ts:147-232`).
- Einträge und Rufbereitschaften werden beim Ändern gelöscht und neu eingefügt;
  ihre technischen IDs wechseln (`dienstplanRepository.ts:163-206`).
- Der Speichern-Button ist auch ohne Änderungen aktiv. Dadurch aktualisiert
  selbst inhaltlich unverändertes Speichern `geaendertAm`
  (`PlanPage.tsx:484-490`; `dienstplanRepository.ts:109-121,160-162`).
- Während des Speicherns bleiben Button und Raster aktiv. Eine nach dem Klick
  vorgenommene Änderung kann durch die später eintreffende Serverantwort
  überschrieben werden (`PlanPage.tsx:239-284,499-513`).
- Es gibt keinen sichtbaren Zustand „Wird gespeichert“ oder „Gespeichert“.

### Bewertung und Abgleich

Atomare Speicherung und Rückgabe eines kanonischen Standes sind stark. Die
fehlenden Beschäftigtzustände erzeugen aber reale Mehrfachklick- und
Antwortreihenfolge-Risiken.

Das aktuelle Projekt speichert bewusst das vollständige, validierte Aggregat,
schützt unveränderliche Grunddaten und serialisiert Zugriffe
(`src/main/storage/monthlyPlansRepository.ts:45-90,181-239`). Die alte
differenzbasierte IPC-Struktur sollte deshalb nicht übernommen werden.

### Empfehlung

- Vollständigen aktuellen Entwurf über die bestehende `monthlyPlans.save`-API
  speichern.
- Speichern nur bei Änderungen aktivieren.
- Während des Speicherns erneute Speicherung und alle kollidierenden
  Bearbeitungen sperren.
- Zustände „Ungespeicherte Änderungen“, „Wird gespeichert …“, „Gespeichert“ und
  „Speichern fehlgeschlagen“ entsprechend dem aktuellen Feedbackkonzept zeigen.
- Bei Fehler den Entwurf unverändert erhalten.
- Die Main-Antwort als neue Baseline setzen.

### Technische Voraussetzung im aktuellen Projekt

Der aktuelle Umsetzungsstand besitzt sichere Fachfunktionen zum Setzen und
Entfernen von Planeinträgen
(`src/main/domain/monthlyPlanEntries.ts:19-106`). Diese Funktionen sind aber
nicht über den aktuellen IPC-Vertrag erreichbar
(`src/shared/ipc/dienstplanerApi.ts:28-34`). Gleichzeitig akzeptiert
`MonthlyPlansRepository.save` jeden vollständigen, schema-gültigen
Planungseintrag-Snapshot aus dem Renderer, ohne ihn erneut aus einer aktiven
Eintragsart herzuleiten
(`src/main/storage/monthlyPlansRepository.ts:200-235`).

Damit ist die Dokumentationsaussage, der Main Process vertraue den vom Renderer
gelieferten berechneten Werten nicht, noch nicht vollständig technisch
eingelöst (`docs/Speicherung/Datenhaltung.md:202-204,294-303`). Vor der
Planungsoberfläche muss deshalb sichergestellt werden, dass neue beziehungsweise
ersetzte Zellen tatsächlich über die gemeinsame Fachlogik entstehen und die
maßgebliche Prozessgrenze dies erzwingt. Das ist keine offene fachliche
Entscheidung, sondern eine Umsetzungslücke gegenüber einer bestehenden
Festlegung.

## 15. Schutz vor Datenverlust

### Altsystem – belegt

- Vor „Neu anlegen“, „Laden“ und der eigenen Startseiten-Schaltfläche wird bei
  ungespeicherten Änderungen gewarnt
  (`PlanPage.tsx:231-237,287-311,544-563`).
- Der Dialog bietet nur „Abbrechen“ und „Fortfahren“. Eine Aktion „Speichern und
  fortfahren“ fehlt (`PlanPage.tsx:550-561`).
- Fenster schließen, Browser-Reload oder andere Navigationswege sind nicht
  allgemein geschützt. Im alten Renderer-`src` ist kein allgemeiner
  `beforeunload`- oder Router-Blocker vorhanden.
- Ein vor der Plananlage eingegebener Titel gilt nicht als ungespeichert, weil
  Dirty-State nur bei einem aktiven Plan ermittelt wird
  (`PlanPage.tsx:154-159`).

### Bewertung und Empfehlung

Die Idee ist richtig, die Abdeckung unvollständig. Für das aktuelle Projekt ist
der gewünschte Dialog bereits genauer festgelegt. Alle Wege müssen denselben
zentralen Guard verwenden:

- Wechsel zu Team oder Planungseinträgen,
- Zeitraum- oder Planauswahl,
- Neuanlage,
- Schließen der Anwendung,
- gegebenenfalls Reload während der Entwicklung.

„Speichern und wechseln“ darf erst wechseln, wenn das Speichern erfolgreich
war. Bei Fehler bleibt die Seite mit dem Entwurf geöffnet.

### Entscheidungsstatus

Keine offene fachliche Entscheidung. Die drei Aktionen und der Schutz sind
bereits verbindlich; erforderlich ist eine vollständige technische Umsetzung.

## 16. Laden, Planliste und Löschen

### Altsystem – belegt

- „Laden“ öffnet einen Dialog und lädt bei jedem Öffnen alle Pläne
  (`src/renderer/src/components/DienstplanLadenDialog.tsx:66-80`).
- Die Liste wird nach `geaendertAm` absteigend sortiert und zeigt ID, Titel,
  Monat, Jahr, Erstell- und Änderungszeitpunkt
  (`DienstplanLadenDialog.tsx:80,110-154`).
- Bei leerem Bestand erscheint ein eigener Tabellenhinweis
  (`DienstplanLadenDialog.tsx:123-129`).
- Eine Planzeile ist nur über ihren `onClick`-Handler auswählbar; sie ist kein
  fokussierbarer Button oder Link (`DienstplanLadenDialog.tsx:130-153`).
- Beim Auswählen werden Kopf/Tage, Einträge und Rufbereitschaften in drei
  parallelen IPC-Aufrufen geladen (`PlanPage.tsx:314-340`).
- Liefert der Planaufruf `null`, bleibt der Dialog ohne Erklärung offen
  (`PlanPage.tsx:320-322`).
- Jeder Plan kann über einen bestätigten, endgültigen Löschvorgang entfernt
  werden (`DienstplanLadenDialog.tsx:82-100,160-183`;
  `src/main/db/dienstplanRepository.ts:124-145`).
- Lade-, Auswahl- und Löschaktionen bleiben während laufender Aufrufe erneut
  auslösbar.

### Bewertung und Abgleich

Titel plus Änderungszeitpunkt sind gute Identifikationshilfen. Technische IDs
sind für den normalen Benutzer dagegen nicht hilfreich. Die mausabhängige
Zeilenauswahl, fehlende Ladezustände und drei getrennte Lesevorgänge sind nicht
zu übernehmen.

Das aktuelle Projekt liefert bereits kleine `MonthlyPlanSummary`-Objekte und
lädt danach ein vollständiges Aggregat einschließlich einer möglichen
Sicherungswarnung
(`src/main/storage/monthlyPlansRepository.ts:93-110,145-179`). Eine
Löschoperation ist absichtlich noch nicht vorhanden.

### Empfehlung

- Vorhandene Summaries nach Zeitraum filtern.
- Bei mehreren Treffern Titel und Änderungszeitpunkt in einer echten,
  tastaturbedienbaren Auswahl zeigen.
- Aktiven Plan deutlich markieren; UUID nur bei Diagnosebedarf anzeigen.
- Explizite Lade-, Leer- und Fehlerzustände samt „Erneut versuchen“ anbieten.
- Löschen nicht aus dem Altsystem übernehmen; es liegt außerhalb von Schritt 8.

### Entscheidungsstatus

Mehrere Pläne und fehlende Löschfunktion sind festgelegt. Das genaue
Auswahlverhalten bei mehreren Treffern bleibt offen; siehe Entscheidung 2.

## 17. Fehler, Sicherungswarnung und Wiederholung

### Altsystem – belegt

- IPC-Fehler werden über einen globalen, seitenübergreifenden Bannerstapel
  angezeigt (`src/renderer/src/lib/fehlermeldung.ts:31-55`;
  `src/renderer/src/components/FehlerHinweis.tsx:5-50`).
- Die Banner bleiben bis zum Schließen sichtbar, zeigen Handlung und technische
  Ursache und behalten höchstens drei Meldungen.
- Planseite, Ladedialog und Auswahlkomponenten besitzen keine eigenen
  `loading`, `saving` oder `deleting`-Zustände.
- Ein erneuter Versuch wird nicht als konkrete Aktion angeboten.
- Eine Backup-Wiederherstellung ist im alten Planungsablauf nicht vorhanden.

### Bewertung

Dauerhafte Fehlermeldungen sind besser als stumme Promise-Fehler. Ein globaler
Banner allein zeigt aber nicht zuverlässig, welche Aktion betroffen ist, und
ersetzt keinen Beschäftigtzustand oder gezielten Wiederholungsweg.

### Aktuelles Projekt – festgelegt

Das aktuelle Repository unterscheidet primäre Datei, Sicherung und fehlenden
Plan und gibt eine verständliche `recoveryWarning` zurück
(`src/main/storage/monthlyPlansRepository.ts:93-110`). Dauerhafte Hinweise,
Spinner, Retry und unterschiedliche Speicherzustände sind im Design festgelegt
(`docs/Design/visuelles-Feedback.md:42-66,133-165`).

### Empfehlung

- Fehler möglichst nahe bei Planliste, Raster oder Speichern zeigen.
- Globale Meldung nur als Rückfallebene verwenden.
- Wiederherstellungswarnung beibehalten, bis ein anderer Plan geladen oder der
  wiederhergestellte Stand bewusst gespeichert wurde.
- Erneutes Laden gezielt ermöglichen.
- Keine technische Rohfehlermeldung als alleinige Nutzererklärung verwenden.

### Entscheidungsstatus

Keine offene fachliche Entscheidung. Die nötigen Zustände sind im aktuellen
Umsetzungsplan bereits beschrieben.

## 18. Kennzahlen und Auswertung

### Altsystem – belegt

Im Planungsraster zeigt das Altsystem je `Erzieher` drei Kennzahlen im Kopf:

- Anzahl SN/F-Dienste,
- freie Tage,
- Soll-/Ist-Differenz
  (`PlanungsGrid.tsx:274-317`).

Am Tabellenende stehen zusätzlich Ist und Soll
(`PlanungsGrid.tsx:449-486`). Ein eigener Dialog zeigt 15 Kennzahlenzeilen je
`Erzieher`, besitzt einen internen Scrollbereich sowie fixierte Kopf- und
Bezeichnungsspalten
(`src/renderer/src/components/AuswertungDialog.tsx:16-60,84-106,117-175`).

Die Auswertung verwendet den aktuellen ungespeicherten Entwurf
(`PlanPage.tsx:534-542`). Bei null Erziehern gibt es keinen Empty State. Die
Soll-/Ist-Differenz wird farblich hervorgehoben, aber außer ihrem Vorzeichen
nicht zusätzlich semantisch bezeichnet.

### Fachliche Berechnungen des Altsystems

Belegt in `src/shared/auswertung.ts:7-120`:

- SN/F-Dienste über exakte Kürzel `SN/F` oder `SN`,
- Frei-Kennzahlen über das exakte Kürzel `/`,
- Sonn-/Feiertagszeit aus reiner Arbeitszeit,
- Arbeitszeit mit Nachtbereitschaft als Summe aus reiner Arbeitszeit und voller
  Nachtbereitschaft,
- Nachtzuschlag als 20 % der monatlichen Nachtarbeit,
- Nachtbereitschaftszuschlag als 25 % der monatlichen Nachtbereitschaft,
- Ist als reine Arbeitszeit plus Nachtbereitschaftszuschlag,
- Soll als Arbeitstage mal Wochenarbeitszeit geteilt durch fünf,
- Differenz als Ist minus Soll.

Diese Regeln sind durch umfangreiche Tests in
`src/shared/auswertung.test.ts` abgedeckt. Die Planseite und ihre Dialoge selbst
besitzen dagegen keine Komponenten- oder Ablauftests.

### Abgleich mit dem aktuellen Projekt

Die Formeln entsprechen weitgehend dem inzwischen verbindlich dokumentierten
und implementierten aktuellen Stand. Das aktuelle Projekt präzisiert und
sichert ihn jedoch stärker:

- ganze sichere Minutenwerte,
- Wochenarbeitszeit in Fünf-Minuten-Schritten,
- einmalige Zuschlagsrundung nach Monatssumme,
- vollständige Plan-Snapshots,
- gleiche tagesbezogene Kennzahlen für alle Planmitarbeiter,
- Rollenfilter nur in der vorgesehenen zeitbezogenen Darstellung,
- `00:00` statt `0:00` bei exaktem Ausgleich,
- validierte Beziehung `Arbeitszeit (mit NB) = reine Arbeitszeit +
Nachtbereitschaft`.

Das alte gespeicherte Feld `arbeitszeitMinuten` wird in der Auswertung nicht
verwendet; die Summe wird erneut aus anderen Feldern gebildet
(`src/shared/auswertung.ts:74-79`). Zudem erzwingt das Altsystem die Beziehung
der Zeitfelder nicht an der Speichergrenze.

### Empfehlung

- Keine alte Berechnungsfunktion übernehmen; ausschließlich
  `calculateMonthlyPlanEvaluation` des aktuellen Projekts verwenden.
- Live-Auswertung sichtbar als Entwurfsstand kennzeichnen.
- Detailkennzahlen nicht zugleich im Kopf, Tabellenfuß und Dialog duplizieren.
- Die vollständige Auswertung wie festgelegt unterhalb des Plans statt in einem
  blockierenden Dialog darstellen.

### Entscheidungsstatus

Formeln und späterer Ort der vollständigen Auswertung sind festgelegt. Offen ist
nur, ob Schritt 8 bereits eine kleine sichtbare Zusammenfassung enthält; siehe
Entscheidung 8.

## 19. Kompaktansicht, Druckvorschau und PDF

### Altsystem – belegt

- Ein Umschalter wechselt zwischen „Planung“ und „Druckvorschau“
  (`PlanPage.tsx:404-434`).
- Die „Druckvorschau“ ist eine schreibgeschützte Bildschirmtabelle mit einer
  Spalte je Mitarbeiter. Sie zeigt Wochenarbeitszeit, Name, Kürzel sowie
  optional Beginn/Ende, Rufbereitschaft, Bemerkung und Ist/Soll
  (`src/renderer/src/components/layout/VerkuerzteAnsicht.tsx:17-33,64-215`).
- Der Drucken-Button ist deaktiviert. Das einzige Print-CSS ändert lediglich den
  Body-Hintergrund (`PlanPage.tsx:436-439`;
  `src/renderer/src/assets/base.css:120-124`).
- Titel, Periode, Seitenformat, Ränder, Seitenumbrüche,
  Überschriftenwiederholung und Unterschriftsbereich fehlen.

### Bewertung

Die Bezeichnung „Druckvorschau“ ist sachlich falsch. Es handelt sich um eine
brauchbare mögliche Kompaktansicht, nicht um eine Vorschau eines späteren
Ausgabedokuments.

### Empfehlung

- Nicht als Druckvorschau übernehmen.
- Echte Vorschau und PDF wie bereits geplant anhand des späteren A4-Ziellayouts
  separat entwickeln.
- Eine unabhängige Kompaktansicht nur ergänzen, wenn sie im normalen
  Arbeitsablauf einen belegten Nutzen hat; nicht als Nebenprodukt der
  Druckfunktion.

### Entscheidungsstatus

Die Trennung der echten Ausgabe ist festgelegt. Ob zusätzlich eine
Kompaktansicht gewünscht ist, bleibt eine nachrangige offene Entscheidung;
siehe Entscheidung 10.

## 20. Barrierefreiheit und Tastaturbedienung

### Altsystem – positiv belegt

- Monat und Jahr verwenden beschriftete Radix-Selects
  (`PlanPage.tsx:359-391`).
- Der Ansichtsumschalter besitzt Gruppierung und `aria-pressed`
  (`PlanPage.tsx:404-434`).
- Auswahloptionen sind echte Buttons mit sichtbaren Fokusringen
  (`EintragsdefinitionAuswahl.tsx:29-52`;
  `RufbereitschaftAuswahl.tsx:22-38`).
- Dialoge und Popover verwenden Radix-Primitives.
- Der globale Fehlerhinweis verwendet `role="alert"` und einen beschrifteten
  Schließen-Button (`src/renderer/src/components/FehlerHinweis.tsx:28-50`).

### Altsystem – Defizite

- Leere Eintrags- und Rufbereitschaftszellen besitzen als zugänglichen Namen
  nur „–“; Datum und Person fehlen (`PlanungsGrid.tsx:84-95,151-162`).
- Bemerkungsfelder sind unbeschriftet (`PlanungsGrid.tsx:194-204`).
- Planzeilen im Ladedialog sind nur per Maus auswählbar
  (`DienstplanLadenDialog.tsx:130-153`).
- Tabellen besitzen keine Caption oder zusätzliche Erklärung.
- Änderungspunkte sind leere, rein farbliche Elemente.
- Die Planungsseite besitzt weder eine `main`-Landmarke noch eine echte
  `h1`-Überschrift (`PlanPage.tsx:342-401`).
- Bei einer Zelle pro Tag und Mitarbeiter führt normale Tab-Reihenfolge zu sehr
  vielen Fokusstopps; eine Raster-Pfeiltastensteuerung ist nicht implementiert.

### Empfehlung

- Semantische Seitenstruktur der aktuellen `AppShell`-/`PageHeader`-Basis
  beibehalten.
- Jede Zellaktion mit Datum, Mitarbeiter, aktuellem Wert und Zweck beschriften.
- Plan- und Optionszeilen als echte Buttons beziehungsweise passende
  Auswahlkomponenten umsetzen.
- Status nie nur farblich vermitteln.
- Für den ersten Stand mindestens Tab, Enter/Leertaste, Escape und
  wiederhergestellten Fokus zuverlässig unterstützen.
- Eine aufwendigere Pfeiltastensteuerung nur nach bewusster Festlegung des
  Tastaturumfangs ergänzen.

### Entscheidungsstatus

Barrierearme Beschriftung und sichtbarer Fokus sind bereits verbindliche
Qualitätsregeln. Der Umfang einer tabellenartigen Pfeiltastenbedienung wird in
Entscheidung 5 mitgeklärt.

## 21. Persistenz, IPC und Integritätsgrenzen

### Altsystem – Stärken

- Der Renderer erhält nur eine begrenzte Preload-API; ein allgemeiner
  `ipcRenderer` wird nicht freigegeben (`src/preload/index.ts:15-86`).
- IPC-Kanalnamen liegen zentral in `src/shared/ipcKanaele.ts:1-36`.
- SQLite verwendet WAL, Fremdschlüsselprüfung und Busy-Timeout
  (`src/main/db/schema.ts:28-37`).
- Die Anwendung erzwingt eine Einzelinstanz
  (`src/main/index.ts:133-144`).
- Speichern und Löschen erfolgen transaktional.

### Altsystem – kritische Schwächen

Die TypeScript-Typen sind keine Laufzeitvalidierung. Die IPC-Handler reichen
Werte unmittelbar an die Repositories weiter
(`src/main/ipc/dienstplanHandlers.ts:23-67`).

Die Datenbank prüft nur einen Teil der Beziehungen:

- `dienstplantagId` eines Planeintrags ist ein Fremdschlüssel;
  `teamMemberId` und `eintragsdefinitionId` sind es nicht
  (`src/main/db/planeintragRepository.ts:6-23`).
- Bei Rufbereitschaft ist die Tag-ID verknüpft, die Mitarbeiter-ID aber nicht
  (`src/main/db/rufbereitschaftRepository.ts:6-13`).
- Ein Plantag ist nicht durch `(dienstplanId, datum)` eindeutig.
- Rollen, Monatsgrenzen, Textlängen und Zeitwertbeziehungen werden an dieser
  Grenze nicht vollständig geprüft.

Besonders kritisch: `speicherePlanungsstand` prüft nicht, ob die übergebenen
Tag-IDs zum angegebenen Plan gehören. Ein fehlerhafter oder manipulierter Aufruf
für Plan A kann deshalb mit einer Tag-ID aus Plan B dort einen Eintrag, eine
Rufbereitschaft oder Bemerkung verändern, während nur der Titel von Plan A
aktualisiert wird (`src/main/db/dienstplanRepository.ts:147-225`). Die normale
UI erzeugt diesen Aufruf nicht, die Sicherheitsgrenze verhindert ihn jedoch
ebenfalls nicht.

### Abgleich und Empfehlung

Die alte Änderungs-API nicht übernehmen. Das aktuelle vollständige Aggregat,
die planweiten Zod-Regeln, UUIDs, Snapshot-Referenzen, Backup-Wiederherstellung
und serialisierte Repository-Zugriffe sind deutlich geeigneter
(`src/shared/schemas/monthlyPlan.ts:164-349`;
`src/main/storage/monthlyPlansRepository.ts:45-110,181-239`).

Die in Abschnitt 14 beschriebene aktuelle Lücke zwischen sicheren
Zellfachfunktionen und allgemeinem Speichern muss vor der UI-Anbindung
geschlossen werden.

### Entscheidungsstatus

Keine offene fachliche Entscheidung. Laufzeitvalidierung und planweite
Integrität sind verbindliche technische Anforderungen.

## 22. Tests, nicht vorhandene Funktionen und Aussagegrenzen

### Im Altsystem getestet

- Plananlage einschließlich Schaltjahr und mehrerer Pläne desselben Monats
  (`src/main/db/dienstplanRepository.test.ts:52-93`)
- Laden und Titeländerung (`dienstplanRepository.test.ts:97-160`)
- Setzen, Ersetzen und Entfernen von Einträgen
  (`dienstplanRepository.test.ts:163-300`)
- Rufbereitschaft, Eindeutigkeit und planweise Filterung
  (`dienstplanRepository.test.ts:326-453`)
- Bemerkungen und gemeinsame Transaktion
  (`dienstplanRepository.test.ts:456-567`)
- vollständiges Löschen und Isolation zweier Pläne
  (`dienstplanRepository.test.ts:570-635`)
- Eintrags-Snapshots und deren Fortbestand nach Löschen der Definition
  (`src/renderer/src/lib/planeintragSnapshot.test.ts:42-109`;
  `src/main/db/eintragsdefinitionRepository.test.ts:174-212`)
- Kalender und Auswertungsformeln (`src/shared/kalendertage.test.ts:4-102`;
  `src/shared/auswertung.test.ts:11-426`)

### Im Altsystem nicht belegt

Im alten `src`-Baum gibt es keinen Komponenten- oder Ablauftest für
`PlanPage`, `PlanungsGrid`, Ladedialog oder Auswertungsdialog. Nicht automatisch
belegt sind deshalb insbesondere:

- tatsächliche Benutzbarkeit bei allen Fenstergrößen,
- Dirty-Guard beim Fensterschließen,
- Verhalten bei Doppelklick oder parallelem Speichern,
- vollständige Tastaturbedienung,
- visuelle Drucktreue,
- Wiederherstellung nach beschädigter Speicherung.

### Ausdrücklich nicht implementiert

Aus dem alten Quellcode ergibt sich keine Funktion für:

- automatische Dienstplanerstellung,
- Übernahme oder Kopieren des Vormonats,
- Mehrfachauswahl oder Massenbelegung,
- Drag-and-drop beziehungsweise Ziehen/Ausfüllen,
- Undo/Redo,
- Freigabe, Abschluss oder Archivierung eines Plans,
- echte Druckvorschau, Drucken oder PDF-Export,
- automatische Konflikt- oder Plausibilitätsprüfung des Dienstplans.

Diese Funktionen dürfen nicht als Verhalten des Altsystems behauptet werden.
Für Schritt 8 des aktuellen Projekts sollten sie auch nicht stillschweigend in
den Umfang aufgenommen werden.

## 23. Übernahmematrix

| Bereich                                        | Urteil                             | Konkrete Begründung                                                                           |
| ---------------------------------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------- |
| Monatsmatrix Tage × Mitarbeiter                | angepasst übernehmen               | Fachlich vertraut und direkt; auf aktuelle Snapshots und kompaktere Zellen umstellen.         |
| Interner Scrollbereich                         | angepasst übernehmen               | Für große Matrix nötig; in aktuelles `AppShell`-Layout integrieren.                           |
| Fixierter Tabellenkopf und Datum               | angepasst übernehmen               | Gute Orientierung; zugängliche Semantik und korrekte Hintergründe ergänzen.                   |
| Wochenend-/Feiertagsdarstellung                | angepasst übernehmen               | Visuell gut; aktuelle gemeinsame Kalenderfunktionen und mehrere Feiertagsnamen verwenden.     |
| Mitarbeiterfarbe am Kopf                       | angepasst übernehmen               | Gute Zuordnung; aktuelle zentrale Farbpalette verwenden und nicht allein auf Farbe vertrauen. |
| Drei Unterspalten je Mitarbeiter               | anders lösen                       | Zu breit; zunächst eine kompakte Eintragszelle mit sekundären Details.                        |
| Nicht interaktive Vorschautabelle vor Anlage   | anders lösen                       | Empty State ist klarer und bereits vorgesehen.                                                |
| Auswahl einer vollständigen Eintragsdefinition | angepasst übernehmen               | Passt zum Snapshotprinzip; aktive Liste zentral laden und Name/Details ergänzen.              |
| „Kein Eintrag“ im Popover                      | angepasst übernehmen               | Schnelles Entfernen ohne unnötige Bestätigung.                                                |
| Aktuelles Team als Spaltenquelle               | nicht übernehmen                   | Verletzt die verbindliche historische Snapshotstabilität.                                     |
| Eine Rufbereitschaft je Tag                    | angepasst übernehmen               | Fachlich bereits bestätigt; aus Plan-Snapshots statt Stammdaten auswählen.                    |
| Direktes einzeiliges 40-Zeichen-Notizfeld      | anders lösen                       | Grenze ist nicht fachlich abgesichert; kompakte Vorschau plus Editor ist robuster.            |
| Entwurf/Baseline                               | angepasst übernehmen               | Sehr gutes UX-Prinzip; auf vollständiges `MonthlyPlan`-Aggregat anwenden.                     |
| Differenzbasierte alte IPC-Speicherung         | nicht übernehmen                   | Passt nicht zum aktuellen vollständigen Aggregat und besitzt Integritätslücken.               |
| Globaler dauerhafter Fehlerbanner              | teilweise übernehmen               | Dauerhaftigkeit sinnvoll; Fehler zusätzlich lokal und mit Retry behandeln.                    |
| Alter Verlustdialog                            | nicht unverändert übernehmen       | Aktuelles Projekt verlangt zusätzlich „Speichern und wechseln“ und vollständige Abdeckung.    |
| Drei Kopfkennzahlen + Ist/Soll-Fuß + Dialog    | anders lösen                       | Redundant und bei Nicht-Erziehern inkonsistent; klare Kern-/Detailtrennung.                   |
| „Druckvorschau“ als Kompakttabelle             | nicht als Druckvorschau übernehmen | Kein Drucklayout; allenfalls später als eigenständige Kompaktansicht prüfen.                  |
| Planlöschung im Ladedialog                     | vorerst nicht übernehmen           | Außerhalb des aktuellen Umfangs und im aktuellen Repository bewusst nicht vorhanden.          |
| Alte Berechnungsfunktionen                     | nicht übernehmen                   | Aktuelle Funktionen bilden den inzwischen verbindlichen und stärker validierten Stand.        |

## 24. Bestehende Festlegungen statt offener Entscheidungen

Die Altsystemanalyse bestätigt mehrere bereits getroffene Entscheidungen. Diese
sollten in der nächsten Sitzung nicht erneut geöffnet werden:

1. Das aktuelle Projekt bleibt bei vollständigen Mitarbeiter- und
   Eintragssnapshots.
2. Mehrere Pläne desselben Monats sind erlaubt; nur ihre Auswahlführung ist
   offen.
3. Der Plantitel ist Pflicht, maximal 200 Zeichen lang und grundsätzlich später
   editierbar; nur der Umsetzungszeitpunkt ist offen.
4. Jahr und Monat eines bestehenden Plans sind unveränderlich.
5. Die Neuanlage speichert den Plan sofort.
6. Der Jahresbereich und das rollierende Auswahlfenster sind festgelegt.
7. Alle Planmitarbeiter erhalten Planungszellen; allgemeine Berechnungen sind
   rollenunabhängig.
8. Pro Mitarbeiter und Tag gibt es höchstens einen Eintrag.
9. Nur aktive Eintragsarten dürfen neu gesetzt werden; bestehende Snapshots
   bleiben erhalten.
10. Es gibt keine Eintragskategorie im aktuellen Zielmodell.
11. Rufbereitschaft ist höchstens einmal pro Tag und nur für Plan-Erzieher
    zulässig.
12. Bemerkungen sind tagesbezogen und werden leer zu `null` normalisiert.
13. Änderungen bleiben bis zum manuellen Speichern im Entwurf und werden live
    ausgewertet.
14. Ungespeicherte Änderungen werden dauerhaft angezeigt und beim Verlassen mit
    Speichern, Verwerfen oder Abbrechen geschützt.
15. Die vollständige Auswertung wird später unterhalb des Plans ergänzt.
16. Echte Druckvorschau und PDF sind ein separater späterer Funktionsbereich.
17. Vollständige Planlöschung gehört nicht zu Schritt 8.

## 25. Geordnete Entscheidungsliste

Die folgenden **zehn** Punkte sind nach Abhängigkeiten geordnet. Jeder Punkt
enthält bereits die alte Umsetzung und eine Empfehlung. Die Empfehlung ist noch
keine verbindliche Entscheidung.

### Entscheidung 1: Plananlage ohne aktive Mitarbeiter

**Abhängigkeit:** vor der Ausgestaltung des Empty States und des Anlagedialogs.

- **Altsystem:** Ein Plan kann unabhängig vom Team angelegt werden. Ein
  mitarbeiterloses Raster besitzt keinen erklärenden Leerzustand.
- **Aktuelles Projekt:** Factory und Schema erlauben technisch einen Plan mit
  leerer Mitarbeiterliste. Der Umsetzungsplan verlangt einen verständlichen
  Verweis auf die Teamverwaltung, legt aber ein ausdrückliches Erstellungsverbot
  nicht eindeutig fest.
- **Empfehlung:** Erstellung ohne aktive Mitarbeiter blockieren und direkt zur
  Teamverwaltung verweisen. Ein leerer gespeicherter Monatsplan bietet im
  aktuellen ersten Zielstand keinen Nutzen, weil Mitarbeiter nachträglich nicht
  ergänzt werden dürfen.
- **Zu entscheiden:** Darf ein leerer Monatsplan gespeichert werden oder muss
  mindestens ein aktiver Mitarbeiter vorhanden sein?

### Entscheidung 2: Auswahl bei mehreren Plänen desselben Zeitraums

**Abhängigkeit:** Grundlage für Zeitraumwechsel, Planliste und Wiederaufnahme.

- **Altsystem:** Kein automatisches Öffnen. „Laden“ zeigt alle Pläne in einem
  Dialog, sortiert nach letzter Änderung.
- **Bestehende Festlegung:** Mehrere Pläne desselben Monats bleiben erlaubt und
  getrennt.
- **Empfehlung:** Bei genau einem Treffer direkt laden; bei mehreren Treffern
  zuerst eine explizite Auswahl nach Titel und Änderungszeitpunkt verlangen.
  Nicht automatisch den zuletzt geänderten Plan öffnen, weil dies bei mehreren
  bewusst benannten Varianten zu einem überraschenden Wechsel führen kann.
- **Zu entscheiden:** Explizite Auswahl oder automatisches Öffnen des zuletzt
  bearbeiteten Plans bei mehreren Treffern?

### Entscheidung 3: Titelbearbeitung bereits in Schritt 8

**Abhängigkeit:** beeinflusst Kopfbereich, Dirty-State und Speichern.

- **Altsystem:** Titel kann nach der Anlage über einen Stift in ein Eingabefeld
  gewechselt und mit dem nächsten Gesamtspeichern gesichert werden.
- **Bestehende Festlegung:** Der Titel ist grundsätzlich später editierbar. Nur
  der Zeitpunkt der UI-Umsetzung ist offen.
- **Empfehlung:** Bereits in Schritt 8 eine zurückhaltende Aktion „Titel
  bearbeiten“ anbieten, weil die bestehende `save`-Schnittstelle dies ohnehin
  unterstützt und Titel für mehrere Pläne desselben Monats wesentlich zur
  Unterscheidung beitragen.
- **Zu entscheiden:** Titelbearbeitung sofort in Schritt 8 oder erst in einem
  späteren Schritt?

### Entscheidung 4: Dichte der Mitarbeiter- und Planungszellen

**Abhängigkeit:** zentrale Grundlage für Rasterbreite, Sticky-Kopf und
Auswertungshinweise.

- **Altsystem:** Drei feste Unterspalten je Mitarbeiter: Kürzel, Beginn, Ende.
- **Empfehlung:** Eine kompakte Spalte je Mitarbeiter. In der Zelle steht das
  Kürzel; Name und Beginn/Ende sind als zugängliche Sekundärinformation und im
  Popover verfügbar. Mitarbeiterkopf zeigt Farbe, vollständigen Namen und
  Wochenarbeitszeit. Tabellenkopf und Datum bleiben sticky.
- **Zu entscheiden:** Eine kompakte Zelle oder weiterhin drei sichtbare
  Unterspalten je Mitarbeiter?

### Entscheidung 5: Inhalt und Tastaturumfang der Eintragsauswahl

**Abhängigkeit:** baut auf Entscheidung 4 auf.

- **Altsystem:** Buttons für „Kein Eintrag“ und jede Definition; sichtbar sind
  Kürzel, Beginn und Ende, aber nicht die Bezeichnung. Normale Tab-Reihenfolge,
  keine eigene Raster-Pfeiltastensteuerung.
- **Bestehende Festlegung:** Aktive Eintragsarten, mindestens Kürzel und
  Bezeichnung; Entfernen ohne Bestätigung.
- **Empfehlung:** Kürzel und Bezeichnung primär, Beginn/Ende sekundär; aktuell
  gesetzten Eintrag markieren. Für Schritt 8 zuverlässige Bedienung mit Tab,
  Enter/Leertaste und Escape umsetzen. Eine eigene Pfeiltastensteuerung des
  gesamten Rasters nur aufnehmen, wenn Tastaturplanung tatsächlich ein
  Kernarbeitsablauf ist.
- **Zu entscheiden:** Reicht der robuste Standard-Tastaturfluss für Schritt 8,
  oder wird von Beginn an eine tabellenartige Pfeiltastensteuerung verlangt?

### Entscheidung 6: Position von Rufbereitschaft und Bemerkung

**Abhängigkeit:** baut auf der gewählten Rasterdichte auf und beeinflusst den
horizontalen Arbeitsweg.

- **Altsystem:** Beide Spalten stehen rechts hinter allen Mitarbeiterspalten.
- **Empfehlung:** Rechts beibehalten. Datum und Mitarbeiterbelegung sind der
  häufigste Planungsweg; die tagesbezogenen Zusatzangaben folgen danach. Die
  Datumsspalte bleibt links sticky, sodass der Tagesbezug auch rechts erhalten
  bleibt.
- **Zu entscheiden:** Zusatzspalten rechts hinter den Mitarbeitern oder links
  unmittelbar nach dem Datum?

### Entscheidung 7: Bearbeitungsform und Umfang der Tagesbemerkung

**Abhängigkeit:** nach Entscheidung 6; beeinflusst Spaltenbreite und Zeilenhöhe.

- **Altsystem:** Permanentes einzeiliges Feld mit 40 Zeichen.
- **Aktuelles Projekt:** Tagesbezug und Leerwertnormalisierung sind festgelegt;
  eine maximale Länge nicht.
- **Empfehlung:** Gekürzte Vorschau in der Zelle, Bearbeitung in einem kleinen
  Popover oder Dialog mit `Textarea`. Keine neue 40-Zeichen-Grenze ohne
  fachlichen Grund. Lange Inhalte dürfen die Rasterzeile nicht vergrößern.
- **Zu entscheiden:** Direkte Einzeileneingabe oder kompakte Vorschau mit
  Popover/Dialog; soll zusätzlich eine fachliche Längenobergrenze gelten?

### Entscheidung 8: Sichtbare Live-Kennzahlen bereits in Schritt 8

**Abhängigkeit:** nach Festlegung der Rasterdichte; Detailauswertung folgt in
Schritt 9.

- **Altsystem:** Drei Kennzahlen im Kopf, Ist/Soll am Ende und zusätzlich 15
  Zeilen im Dialog. Das ist informativ, aber redundant und sehr platzintensiv.
- **Bestehende Festlegung:** Alle Werte werden in Schritt 8 live berechnet; die
  vollständige sichtbare Auswertung folgt in Schritt 9 unter dem Plan.
- **Empfehlung:** In Schritt 8 keine provisorische Mini-Auswertung ergänzen.
  Zunächst die komplette Berechnung für Schritt 9 bereitstellen. So wird keine
  Zwischenlösung gebaut, die später wieder entfernt oder doppelt angezeigt
  wird.
- **Zu entscheiden:** Keine sichtbare Auswertung in Schritt 8 oder bereits eine
  kleine Zusammenfassung; falls Zusammenfassung, welche höchstens drei Werte?

### Entscheidung 9: Noch nicht implementierte Ausgabeaktionen

**Abhängigkeit:** betrifft nur den Kopfbereich; echte Ausgabe bleibt später.

- **Altsystem:** „Druckvorschau“ ist sichtbar, obwohl sie keine echte
  Druckvorschau ist; „Drucken“ ist dauerhaft deaktiviert.
- **Bestehende Festlegung:** Druckvorschau und PDF gehören zum späteren
  Zielumfang, nicht zu Schritt 8.
- **Empfehlung:** Aktionen vollständig ausblenden, bis sie funktionieren. Damit
  bleibt die Planungsseite ruhig und enthält keine Sackgassen.
- **Zu entscheiden:** Bis zur Umsetzung ausblenden oder deaktiviert mit Hinweis
  anzeigen?

### Entscheidung 10: Eigenständige Kompaktansicht

**Abhängigkeit:** nach Entscheidung 4; unabhängig von der echten Druckfunktion
bewerten.

- **Altsystem:** Die irreführend „Druckvorschau“ genannte Ansicht zeigt eine
  schreibgeschützte, deutlich schmalere Tabelle mit einer Spalte je Mitarbeiter.
- **Empfehlung:** Nicht in Schritt 8 aufnehmen. Vor Schritt 9 oder der echten
  Ausgabe gezielt prüfen, ob eine Kompaktansicht im normalen Arbeitsablauf einen
  eigenständigen Nutzen hat. Falls ja, sie ausdrücklich „Kompaktansicht“ nennen.
- **Zu entscheiden:** Wird zusätzlich zur bearbeitbaren Matrix eine
  schreibgeschützte Kompaktansicht benötigt oder entfällt sie?

## 26. Empfohlene Reihenfolge nach den Entscheidungen

Nach Klärung der zehn Punkte ergibt sich folgende technische Reihenfolge:

1. bestehende Vertrauenslücke zwischen Zellfachfunktionen und Plan-Speicher-API
   schließen,
2. Planliste, Lade-/Fehlerzustand und Zeitraumführung anbinden,
3. Anlagedialog einschließlich Entscheidung 1 und Mehrfachschutz umsetzen,
4. gespeicherten Plan und getrennten Entwurf führen,
5. lesbares Raster ausschließlich aus Plan-Snapshots aufbauen,
6. Eintragsauswahl und Zelloperationen anbinden,
7. Rufbereitschaft und Bemerkung ergänzen,
8. Dirty-State, Speichern und vollständigen Verlustschutz umsetzen,
9. Live-Auswertung intern bereitstellen,
10. technische und visuelle Abnahme bei `1024 × 700` sowie größerem Fenster.

Diese Reihenfolge übernimmt keine offene Empfehlung als verbindlich. Sie kann
nach der gemeinsamen Entscheidungsliste angepasst werden.

## 27. Abschluss

Aus dem Altsystem sollten vor allem die Monatsmatrix, das Scroll-/Sticky-Prinzip,
die unmittelbare Eintragsauswahl, die lokale Entwurfsbearbeitung und die direkte
Live-Rückmeldung als Referenz dienen. Nicht übernommen werden sollten sein
aktueller Stammdatenbezug, die drei breiten Unterspalten ohne bewusste
Dichteentscheidung, die unvollständigen Lade-/Speicherzustände, die lückenhafte
Integritätsprüfung und die unechte Druckvorschau.

Die Analyse enthält zehn geordnete offene Entscheidungen. Alle übrigen
wesentlichen fachlichen Grundlagen sind entweder bereits im aktuellen Projekt
festgelegt oder als technische Umsetzungsvoraussetzung gekennzeichnet.
