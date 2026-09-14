# Quellcodeanalyse der Eintragsverwaltung

## Untersuchungsrahmen

Diese Analyse beschreibt ausschließlich den statisch untersuchten Quellcode des Altsystems am Commit `255036d0d95fa7fbf53e354a36680a08ee4719c1`. Die Anwendung wurde nicht gestartet, Abhängigkeiten wurden nicht installiert und Tests wurden nicht ausgeführt. Aussagen über sichtbares Laufzeitverhalten sind deshalb als statische Herleitung und nicht als praktische Bestätigung zu verstehen.

## Zweck und Einbindung

Die Eintragsverwaltung pflegt die Vorlagen, aus denen später ein regulärer Eintrag für einen Mitarbeiter und einen Kalendertag gewählt wird. Die Startseite verlinkt die Karte „Eintrag-Verwaltung“ auf die Hash-Route `/eintraege`; `App.tsx` bindet dort `EintraegePage` ein. Die Seite ist damit im normalen Navigationsfluss eindeutig angebunden.

Die gepflegten Definitionen werden nicht nur in der Verwaltungsseite verwendet. `EintragsdefinitionAuswahl` lädt dieselbe Liste in den Auswahl-Popovern der Planungstabelle. Wird dort eine Definition gewählt, erzeugt `erzeugePlaneintragSnapshot` einen eigenständigen Snapshot für den lokalen Planentwurf. Änderungen oder das Löschen der Stammdaten wirken dadurch nicht rückwirkend auf bereits gespeicherte Planeinträge.

Für die allgemeine Navigation und Prozessaufteilung siehe ergänzend [`../uebergreifend/architektur-und-navigation.md`](../uebergreifend/architektur-und-navigation.md).

## Ansichten und Dialoge

### Verwaltungsseite

`src/renderer/src/pages/EintraegePage.tsx` setzt sich aus folgenden sichtbaren Bereichen zusammen:

- `StackedManagementLayout` mit einem gemeinsamen `ManagementHeader`;
- Rückweg „Zurück zur Startseite“ und Primäraktion „Neue Eintragsdefinition“;
- eine oberhalb der Liste liegende, einklappbare Formularkarte;
- eine Tabelle „Vorhandene Eintragsdefinitionen“ mit zehn Datenspalten und einer Aktionsspalte.

Die Tabelle zeigt Kürzel, Name, Berechnungsart, Beginn, Ende und fünf Zeitdauerwerte. Fehlende Zeitpunkte werden als Gedankenstrich, Dauern über `formatMinutesToHHMM` als Stunden und Minuten dargestellt. Jede Zeile besitzt einen beschrifteten „Bearbeiten“-Button. Die ausgewählte Zeile erhält eine linke Rahmen- und Hintergrundmarkierung. Ein `aria-selected` oder eine zusätzliche textliche Kennzeichnung des Auswahlzustands ist nicht vorhanden.

### Formular

`EintragsdefinitionForm` wird sowohl zum Anlegen als auch zum Bearbeiten genutzt. Es enthält:

- Kürzel und Name;
- die Auswahl zwischen `fest` und `mitarbeiterabhaengig`;
- optionale Zeitpunkte für Beginn und Ende;
- Anwesenheitszeit, Arbeitszeit, Arbeitszeit ohne Nachtbereitschaft, Nachtbereitschaft und Nachtarbeit;
- „Speichern“ und „Abbrechen“ sowie im Bearbeitungsmodus „Löschen“.

Das Formular liegt in einem kontrollierten `Collapsible`. Sein Titel wechselt zwischen „Neue Eintragsdefinition anlegen“ und „Eintragsdefinition bearbeiten“. Beim Löschen öffnet sich ein `AlertDialog`, der Kürzel und Name nennt, die Unumkehrbarkeit erklärt und eine zweite Bestätigung verlangt.

## Bedienabläufe und lokale Zustände

`EintraegePage` hält fünf zentrale React-Zustände:

- `eintraege`: die geladene Liste;
- `selectedId`: `null` im Anlegemodus oder die ID des bearbeiteten Datensatzes;
- `formValues`: alle sichtbaren Formularwerte als Zeichenketten;
- `errors`: die lokalen Eingabe- und Formatfehler;
- `isFormOpen`: Offen-/Geschlossen-Zustand der Formularkarte.

Der Löschdialog besitzt zusätzlich seinen eigenen lokalen Offen-/Geschlossen-Zustand in `EintragsdefinitionForm`.

### Laden

Beim Einhängen der Seite ruft ein Effect `window.api.eintragsdefinition.list()` auf. Erfolgreiche Ergebnisse ersetzen die Liste. Das Repository sortiert sie nach aufsteigender numerischer ID.

Es gibt keinen eigenen Ladeindikator. Da der Anfangswert eine leere Liste ist, zeigt die Tabelle bis zum Eintreffen von Daten denselben Text wie bei einem fachlich leeren Bestand: „Noch keine Eintragsdefinitionen angelegt.“ Schlägt das Laden fehl, bleibt die bisherige Liste erhalten und der globale Fehlerhinweis wird ausgelöst.

### Anlegen

„Neue Eintragsdefinition“ setzt Auswahl, Formular und lokale Fehler zurück und öffnet das Formular. Bei `fest` müssen die fünf Dauerfelder als gültige Dauer eingegeben werden; Beginn und Ende dürfen leer bleiben. Nach erfolgreicher lokaler Validierung ruft die Seite `add` auf. Erst nach erfolgreicher Promise werden Formular und Auswahl zurückgesetzt, das Formular geschlossen und die Liste erneut aus der Datenbank geladen.

### Bearbeiten

„Bearbeiten“ übernimmt alle Werte des Datensatzes in das Formular. Minutenwerte werden für die Eingabe formatiert, `null` bei Beginn oder Ende wird zu einer leeren Zeichenkette. Nach erfolgreicher Validierung ruft die Seite `update(selectedId, data)` auf. Der anschließende Ablauf entspricht dem Anlegen.

### Abbrechen und Einklappen

„Abbrechen“ verwirft die lokalen Formularwerte, löscht die Auswahl sowie Fehler und schließt das Formular. Ein reines Einklappen über den Kartenkopf setzt diese Zustände dagegen nicht zurück; beim erneuten Aufklappen bleibt der bisherige Anlege- oder Bearbeitungsentwurf erhalten. Ein eigener Warnhinweis für ungespeicherte Formularänderungen ist nicht vorhanden.

### Löschen

Löschen ist nur im Bearbeitungsmodus erreichbar. Nach Bestätigung ruft die Seite `delete(selectedId)` auf. Bei Erfolg werden Auswahl und Formular zurückgesetzt, das Formular geschlossen und die Liste neu geladen. Das Repository führt ein direktes `DELETE` ohne Verwendungs- oder Not-found-Prüfung aus.

## Datenmodell

`Eintragsdefinition` in `src/shared/types.ts` enthält:

- eine numerische ID;
- Kürzel und Name;
- `berechnungsart: 'fest' | 'mitarbeiterabhaengig'`;
- `beginn` und `ende` als `string | null`;
- fünf ganzzahlige Minutenfelder für Anwesenheit, Arbeitszeit, Arbeitszeit ohne Nachtbereitschaft, Nachtbereitschaft und Nachtarbeit.

Die SQLite-Tabelle `eintragsdefinitionen` bildet diese Felder direkt ab. Nur ID, `NOT NULL` und die SQLite-Typaffinitäten sind im Schema abgesichert. Es gibt weder einen Eindeutigkeits-Constraint für Kürzel oder Name noch `CHECK`-Constraints für Berechnungsart, Uhrzeiten, Nichtnegativität oder Beziehungen zwischen den Zeitwerten.

Die Liste wird nach ID sortiert. `addEintragsdefinition` nutzt die von SQLite vergebene ID; `updateEintragsdefinition` ersetzt alle fachlichen Spalten des Datensatzes. Beide Funktionen geben ein Objekt aus den übergebenen Werten zurück. Bei einer unbekannten Update-ID wird kein betroffener Datensatz erkannt oder gemeldet; die Funktion gibt dennoch ein scheinbar aktualisiertes Objekt zurück. Entsprechendes gilt für das Löschen einer unbekannten ID, das ohne Ergebnis endet.

Die Datenhaltung, die lokale SQLite-Datei und die Snapshot-Struktur werden übergreifend in [`../uebergreifend/datenmodell-und-datenhaltung.md`](../uebergreifend/datenmodell-und-datenhaltung.md) eingeordnet.

## Fachliche Regeln und Berechnungen

### Feste Eintragsdefinition

Bei `fest` übernimmt ein später erzeugter Planeintrag-Snapshot Kürzel, Beginn, Ende und alle fünf Minutenwerte unverändert. Beginn und Ende werden dabei nicht zur Berechnung einer Dauer verwendet.

### Mitarbeiterabhängige Eintragsdefinition

Beim Wechsel der Formularauswahl auf `mitarbeiterabhaengig` löscht die Seite Beginn und Ende, setzt alle fünf Dauerfelder auf `00:00` und deaktiviert diese sieben Eingaben. Die Validierungsfunktion verlangt anschließend `null` für die Zeitpunkte und `0` für alle fünf Minutenwerte.

Erst beim Auswählen einer solchen Definition in der Planung berechnet `berechneMitarbeiterabhaengigeArbeitszeitMinuten` ein Fünftel der aktuellen Wochenarbeitszeit des Mitarbeiters und rundet mit `Math.round` auf eine volle Minute. `erzeugePlaneintragSnapshot` schreibt dieses Ergebnis in `arbeitszeitOhneNachtbereitschaftMinuten`; `arbeitszeitMinuten` und die übrigen Zeitfelder bleiben dort `0`. Die Auswertungsfunktionen summieren für Arbeitszeit und Istzeit tatsächlich `arbeitszeitOhneNachtbereitschaftMinuten` sowie gegebenenfalls Nachtbereitschaft beziehungsweise deren Zuschlag. Das eigenständige Feld `arbeitszeitMinuten` wird zwar verwaltet, gespeichert und in Snapshots kopiert, ist im statisch untersuchten Auswertungscode aber kein Rechenoperand.

Die Berechnungszusammenhänge werden gebündelt in [`../uebergreifend/berechnungen.md`](../uebergreifend/berechnungen.md) behandelt.

### Weitere Regeln

- Kürzel und Name dürfen nicht ausschließlich aus Leerraum bestehen. Ihre äußeren Leerzeichen werden vor dem Speichern jedoch nicht entfernt; nur Beginn und Ende sowie Dauer-Eingaben werden beim Verarbeiten getrimmt.
- Kürzel müssen nicht eindeutig sein.
- Beginn und Ende dürfen bei `fest` unabhängig voneinander fehlen. Falls gesetzt, müssen sie exakt `HH:MM` mit `00:00` bis `23:59` entsprechen.
- Zwischen Beginn und Ende gibt es keine Reihenfolge-, Paar- oder Über-Mitternacht-Prüfung.
- Dauern akzeptieren eine bis drei Stundenstellen und zwei Minutenstellen von `00` bis `59`; dadurch sind statisch `0:00` bis `999:59` darstellbar. Negative und nicht ganzzahlige Werte werden abgewiesen.
- Die fünf Dauerwerte werden einzeln formal geprüft, aber nicht rechnerisch gegeneinander abgeglichen.

## Validierung, Fehler- und Leerzustände

Die Eingabevalidierung ist eindeutig an den Submit-Ablauf der Verwaltungsseite angebunden:

1. Alle fünf Dauerzeichenketten werden mit `parseHHMMToMinutes` geparst. Jeder Formatfehler erzeugt eine feldbezogene Meldung.
2. `validateEintragsdefinitionInput` sammelt Pflichtfeld-, Berechnungsart-, Uhrzeit-, Ganzzahl- und Nullregelverletzungen.
3. Die Meldungen erscheinen gesammelt in einer Liste mit `role="alert"`; bei Fehlern wird kein IPC-Aufruf ausgeführt.

Technische Fehler beim Laden, Speichern oder Löschen laufen dagegen über `fehlerMelder` an die global in `App` eingebundene Komponente `FehlerHinweis`. Sie protokolliert den Fehler in der Konsole und zeigt bis zu drei manuell schließbare Meldungen mit lesbar gekürzter IPC-Ursache an. Es gibt keine lokale Erfolgsanzeige, keinen Speichern-/Löschen-Ladezustand und keine erkennbare Sperre gegen mehrmaliges Auslösen während einer laufenden Anfrage.

Wichtig ist die Schichtgrenze: Die beschriebene Fachvalidierung liegt ausschließlich im Renderer. Preload, IPC-Handler und Repository nehmen die Daten ohne Laufzeit-Schema oder erneute fachliche Prüfung entgegen. TypeScript-Typen schützen den kompilierten Vertrag, validieren aber keine zur Laufzeit über IPC eingehenden Werte. SQLite fängt nur seine wenigen Tabellen-Constraints ab.

Weitere Einzelheiten stehen in [`../uebergreifend/fehlerbehandlung-und-validierung.md`](../uebergreifend/fehlerbehandlung-und-validierung.md).

## Schichtenanbindung

Der CRUD-Weg ist vollständig verdrahtet:

1. `EintraegePage` ruft `window.api.eintragsdefinition.list/add/update/delete` auf.
2. `src/preload/index.ts` reicht ausschließlich die zentral in `IPC_KANAELE` benannten Kanäle über `ipcRenderer.invoke` weiter; `index.d.ts` typisiert dieselben Methoden.
3. `registerEintragsdefinitionHandlers` registriert vier `ipcMain.handle`-Handler und ruft das Repository mit der beim App-Start übergebenen Datenbankverbindung auf.
4. `eintragsdefinitionRepository.ts` führt parametrisierte SQL-Anweisungen gegen SQLite aus.
5. `src/main/index.ts` öffnet und bereitet die Datenbank vor, registriert den Handler und schließt die Verbindung vor dem Beenden.

Die Datenbank liegt laut `db.ts` als `dienstplan.db` im Electron-`userData`-Verzeichnis. `schema.ts` legt die Tabelle zusammen mit den übrigen Tabellen an und setzt unter anderem WAL, Fremdschlüsselprüfung und ein Busy-Timeout. Für `eintragsdefinitionId` in `planeintraege` ist allerdings keine `REFERENCES`-Klausel definiert; das Löschen einer Definition bleibt daher möglich und die gespeicherten Snapshot-Daten bleiben bestehen.

## Gemeinsame Komponenten und Hilfsfunktionen

Eindeutig wiederverwendet werden:

- `ManagementHeader` und `StackedManagementLayout` für Aufbau und Seitensemantik;
- die UI-Primitives `Card`, `Button`, `Input`, `Label`, `Select`, `Table`, `Collapsible` und `AlertDialog`;
- `formatMinutesToHHMM` und `parseHHMMToMinutes` für Dauern;
- `isValidTimeOfDay` für Zeitpunkte;
- `FehlerHinweis` und `fehlerMelder` für technische Fehler;
- `EintragsdefinitionAuswahl`, `erzeugePlaneintragSnapshot` und die Rundungsfunktion für die Verwendung in der Planung.

Die querschnittliche Komponenten- und Testeinordnung steht in [`../uebergreifend/komponenten-und-tests.md`](../uebergreifend/komponenten-und-tests.md).

## Vorhandene Tests

Statisch vorhanden sind insbesondere:

- 13 Unit-Testfälle für `validateEintragsdefinitionInput`, einschließlich beider Berechnungsarten, Zeitpunkten, Minutenwerten und der Nullregel für alle fünf Dauerfelder;
- 10 Unit-Testfälle für die strikte Uhrzeitprüfung sowie 15 allgemein genutzte Tests für Parsen und Formatieren von Dauern;
- 12 Repository-Testfälle für leere und sortierte Listen, Anlegen, Aktualisieren, Wechsel der Berechnungsart und Löschen; ein Test bestätigt ausdrücklich, dass ein bereits gespeicherter Planeintrag-Snapshot nach dem Löschen seiner Definition bestehen bleibt;
- Tests für die mitarbeiterabhängige Division und Rundung sowie für feste und mitarbeiterabhängige Snapshots;
- den bereichsübergreifenden IPC-Vertragstest, der fehlende, überzählige oder doppelt registrierte Kanäle erkennt;
- ein typisiertes `window.api`-Fake mit CRUD-Methoden für Eintragsdefinitionen.

Nicht vorhanden ist eine eigene Komponenten-Testdatei für `EintraegePage`, `EintragsdefinitionForm` oder `EintragsdefinitionTable`. Die vorhandene E2E-Suite prüft die Navigationskarte der Eintragsverwaltung, aber keinen Anlege-, Bearbeiten-, Validierungs-, Lösch- oder Persistenzablauf dieses Bereichs. Da keine Tests ausgeführt wurden, ist auch der Zustand der vorhandenen Tests an diesem Commit nicht praktisch bestätigt.

## Eindeutig angebunden, vorhanden ohne erkennbare Anbindung, nicht bestätigbar

### Eindeutig angebundene Implementierung

- Route, Navigationskarte, Verwaltungsseite, Formular, Tabelle und Löschdialog;
- alle vier CRUD-Aufrufe von Renderer über Preload und IPC bis SQLite;
- Renderer-Validierung und globale technische Fehleranzeige;
- Verwendung der Definitionsliste in der Planung sowie Snapshot-Erzeugung;
- relevante reine Funktionen und Repository-Tests.

### Vorhanden, aber nicht als vollständiges Verhalten angebunden oder abgesichert

- `arbeitszeitMinuten` ist als eigenständiges Definitions- und Snapshot-Feld durch UI, IPC und Speicherung geführt, wird von der untersuchten Auswertungsberechnung aber nicht verwendet.
- Die CRUD-Methoden für Eintragsdefinitionen sind im allgemeinen API-Test-Fake implementiert, ohne dass eine eigene Komponenten-Testdatei der Eintragsverwaltung sie erkennbar nutzt.
- Nicht existente IDs werden vom Repository nicht als Fehlerzustand behandelt; die Rückgabe von `update` kann daher einen Datenstand behaupten, der nicht geschrieben wurde.

### Ohne Ausführung nicht bestätigbar

- tatsächliche Darstellung und horizontale Bedienbarkeit der breiten Tabelle bei verschiedenen Fenstergrößen;
- Fokusführung, Tastaturablauf und Portalverhalten von Select, Collapsible und AlertDialog;
- sichtbare Reihenfolge und Dauer der Lade-, Fehler- und Neuladevorgänge;
- Persistenz über einen echten App-Neustart und Verhalten bei gesperrter oder beschädigter Datenbank;
- Verhalten bei schnellen Mehrfachklicks oder konkurrierenden CRUD-Aufrufen;
- aktueller Bestehensstatus aller statisch vorhandenen Tests.
