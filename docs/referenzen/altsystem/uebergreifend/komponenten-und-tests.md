# Wiederverwendete Komponenten und Tests

## Gemeinsame UI-Bausteine

Unter `renderer/src/components/ui/` liegen lokale React-Bausteine, die auf HTML, Radix UI und einer gemeinsamen `cn()`-Funktion aufbauen:

- `Button` mit Varianten und Größen,
- `Card` mit Kopf, Titel, Beschreibung, Inhalt und Fuß,
- `Input` und `Label`,
- `Select`,
- `Table`,
- `Dialog` und `AlertDialog`,
- `Popover`,
- `Collapsible`.

Die Fachseiten kombinieren diese Primitives, statt direkt voneinander abhängig zu sein. `ManagementHeader`, `ManagementLayout` und `StackedManagementLayout` bilden gemeinsame Rahmen für die Verwaltungsseiten. Die Planungsseite verwendet wegen ihres großen Datenrasters einen eigenen Aufbau.

Weitere wiederverwendete Bestandteile sind:

- `FehlerHinweis` und der Fehler-Melder für seitenübergreifende Bridge-Fehler,
- `planAnsicht.ts` für Datumsformatierung, Spaltenbreiten, Wochenend-/Feiertagsfarben und Mitarbeiterkopf-Stile,
- `EintragsdefinitionAuswahl` und `RufbereitschaftAuswahl` für Popover-Auswahlen im Plan,
- gemeinsame Typen, Zeit-, Kalender-, Schlüssel- und Auswertungsfunktionen unter `shared/`.

Die Style-Dokumentation nennt sichtbare Fokuszustände, echte Bedienelemente, Tabellenkopf-Semantik, deutsche Dokumentensprache und zusätzliche Beschriftungen neben Farben als verbindliche Anforderungen. Ob alle Komponenten diese Regeln in jeder Laufzeitsituation erfüllen, wurde nicht praktisch geprüft.

## Testkonfiguration

`vitest.config.ts` trennt zwei Projekte:

- Node-Umgebung für `*.test.ts`, darunter Main-, Shared- und reine Renderer-Funktionen,
- jsdom für Renderer-`*.test.tsx` und `*.dom.test.ts` mit gemeinsamem Radix-Setup.

Die E2E-Konfiguration ist separat, verwendet Node, ein 60-Sekunden-Timeout und deaktiviert parallele Testdateien. Die E2E-Helfer starten die gebaute Electron-App mit einem isolierten Benutzerverzeichnis. Laut CI-Konfiguration laufen Lint, Typecheck und Tests auf Linux sowie Build und E2E auf Windows.

Für diese Analyse wurden weder Tests noch Build, Anwendung oder CI ausgeführt.

## Vorhandener Testbestand

Im untersuchten Commit liegen 23 Testdateien mit statisch gezählten 189 `it(...)`- beziehungsweise `it.fails(...)`-Fällen. Genau ein Fall ist mit `it.fails` als erwarteter Fehlschlag markiert.

### Reine Fach- und Hilfsfunktionen

Getestet werden Zeitkonvertierung, Uhrzeitformat, Rundung, Planeintragsschlüssel, Kalendertage und Feiertage, Kennzahlen, Mitarbeiter- und Eintragsvalidierung, Bemerkungslänge, mitarbeiterabhängige Arbeitszeit, Snapshotbildung, Rufbereitschaftsentwurf und Soll-Ist-Farbe.

### Repository und Schema

Tests gegen In-Memory-SQLite decken Schema-Vorbereitung, Versionierung, Fremdschlüssel sowie Repository-Funktionen für Teammitglieder, Eintragsdefinitionen und Dienstpläne ab. Die umfangreichen Dienstplan-Tests behandeln unter anderem Tageserzeugung, mehrere Pläne pro Monat/Jahr, Speichern und Ersetzen von Zellen, Rufbereitschaften, Bemerkungen und Löschen.

### Komponenten

`TeamPage.test.tsx` rendert die Teamseite gegen ein typisiertes `window.api`-Fake und prüft Benutzerabläufe. `FehlerHinweis.test.tsx` prüft die globale Fehlerdarstellung. Eigene Komponententests für Eintragsseite, Planungsseite, Planungsraster, Lade- und Auswertungsdialog oder verkürzte Ansicht sind nicht vorhanden.

### IPC-Vertrag

`ipcVertrag.test.ts` ersetzt Electron durch ein Testdoppel und prüft statisch registrierte Handler gegen die zentrale Kanalliste: jeder deklarierte Kanal genau einmal und keine unbekannten Handler.

### E2E

`app.e2e.test.ts` enthält Fälle für Fensterstart und Navigationskarten, die Abschottung von Node/Electron im Renderer sowie einen Team-Persistenzdurchstich über Neustart. `druckausgabe.e2e.test.ts` erzeugt über `printToPDF` eine A4-Ausgabe und prüft Seite und Mitarbeiterspalten. Der Fall, der alle Monatstage erwartet, ist als `it.fails` markiert.

## Testhilfen

- `src/test/datenbank.ts` erzeugt eine vorbereitete In-Memory-Datenbank.
- `src/test/apiFake.ts` implementiert die Preload-API mit In-Memory-Daten für Renderer-Tests.
- `src/test/factories.ts` liefert Testdatenfabriken.
- `src/test/setup.renderer.ts` ergänzt jsdom um für Radix benötigte Browser-APIs.
- `e2e/appStart.ts` verwaltet Electron-Start, Fenster und temporäre Benutzerdaten.
- `e2e/pdf.ts` liest PDF-Seitenzahl und Text über `pdfjs-dist`.

## Statische Abdeckungsgrenzen

Die vorhandenen Tests zeigen beabsichtigte Prüfsignale, aber keine aktuelle erfolgreiche Ausführung. Sichtbare Lücken sind insbesondere die vollständigen UI-Abläufe der Eintrags- und Planungsseite, der Auswertungsdialog, Lade-/Speicher-Zwischenzustände sowie reale native Dialoge. Die Testdokumentation erklärt Pixel-/Snapshot-Tests, Installer-Tests und native Dialogautomatisierung ausdrücklich als nicht abgedeckt.
