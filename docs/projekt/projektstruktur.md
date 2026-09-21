# Projektstruktur des Dienstplaners

Dieses Dokument ist eine anfängerfreundliche Landkarte des Projekts. Es erklärt,
welche Aufgabe die Dateien und Ordner auf der obersten Projektebene haben und
wie die wichtigsten Unterordner aufgebaut sind.

Die Übersicht beschreibt den aktuellen Aufbau des Repositorys. Sie ist kein
Ersatz für den Quellcode oder die fachliche Dokumentation, sondern hilft dabei,
den richtigen Einstiegspunkt für eine Frage oder Änderung zu finden.

**Repository** bezeichnet hier den gesamten, mit Git verwalteten Projektbestand.

## Drei Arten von Projektbestandteilen

Im Projektordner liegen nicht nur selbst geschriebene Programmdateien. Die
Bestandteile lassen sich grob in drei Gruppen einteilen:

1. **Quellbestand:** selbst geschriebener Code, Tests, Dokumentation und
   Konfiguration. Diese Dateien werden in Git gespeichert.
2. **Installierte oder erzeugte Inhalte:** Abhängigkeiten, Zwischenergebnisse,
   Programmpakete und Installer. Sie entstehen durch Befehle wie `npm install`,
   `npm start` oder `npm run make`.
3. **Git-Verwaltung:** technische Informationen darüber, welche Änderungen und
   Versionen es im Projekt gibt.

Als Grundregel gilt: Fachliche oder technische Änderungen werden im
Quellbestand vorgenommen. Erzeugte Dateien werden normalerweise nicht direkt
bearbeitet.

## Überblick über die oberste Projektebene

Der Begriff **Projekt-Root** oder **Projektstamm** bezeichnet den obersten
Ordner `Dienstplaner`. Dort befinden sich aktuell diese wichtigen Bereiche:

```text
Dienstplaner/
├── .git/                 interne Git-Daten
├── .vite/                erzeugte Vite-Zwischenergebnisse
├── dist/                 eingecheckte, kompilierte Renderer-Ausgabe
├── docs/                 Projektdokumentation
├── node_modules/         installierte npm-Abhängigkeiten
├── out/                  erzeugte Anwendungspakete und Installer
├── release/              Vorlagen für eine Auslieferung
├── scripts/              Hilfsskripte für Projektaufgaben
├── src/                  eigentlicher Anwendungscode
├── tests/                automatisierte Tests
├── tmp/                  lokale temporäre Arbeitsdateien
└── ...                   Konfigurations- und Metadateien
```

## Ordner im Projekt-Root

### `.git/`

Dieser versteckte Ordner ist die interne Datenbank von Git. Darin speichert Git
unter anderem Commits, Branches, Tags und den aktuellen Bearbeitungsstand.

- Der Ordner gehört nicht zur Anwendung selbst.
- Er wird von Git verwaltet und sollte nicht manuell bearbeitet werden.
- Wird er gelöscht, ist der Ordner kein vollständiges Git-Repository mehr und
  die lokale Versionsgeschichte geht verloren.

### `.vite/`

Vite erzeugt hier beim Entwickeln und Bauen technische Zwischenergebnisse für
den Electron Main Process, die Preload-Schicht und die Oberfläche.

- Der Ordner wird automatisch erzeugt.
- Er ist durch `.gitignore` von Git ausgeschlossen.
- Sein Inhalt darf verworfen und bei Bedarf neu erzeugt werden.
- Änderungen gehören in `src/` oder die Vite-Konfigurationen, nicht in `.vite/`.

### `dist/`

Dieser Ordner enthält eine bereits kompilierte Ausgabe der Browser-Oberfläche:
eine HTML-Datei sowie gebündelte JavaScript- und CSS-Dateien.

Der Ordner ist aktuell in Git eingecheckt. Trotzdem ist er kein geeigneter Ort
für manuelle Programmänderungen. Der aktuelle Electron-Forge-Ablauf baut aus
`src/` zunächst nach `.vite/` und erstellt seine Pakete anschließend unter
`out/`. Eine spätere Bereinigung oder Neubewertung von `dist/` sollte deshalb
bewusst als eigene Änderung erfolgen.

### `docs/`

Hier liegt die dauerhafte Projektdokumentation. Der zentrale Wegweiser ist
[`docs/README.md`](../README.md).

| Unterordner     | Aufgabe                                                              |
| --------------- | -------------------------------------------------------------------- |
| `projekt/`      | Zielbild, Projektumfang, Lizenzierung und diese Strukturübersicht    |
| `fachlichkeit/` | Fachliches Datenmodell und verbindliche Berechnungsregeln            |
| `features/`     | Zweck und gewünschtes Verhalten einzelner Funktionen                 |
| `architektur/`  | Dauerhafte technische Entscheidungen, zum Beispiel die Datenhaltung  |
| `oberflaeche/`  | Übergreifende Regeln für Gestaltung und Bedienung                    |
| `qualitaet/`    | Teststrategie und allgemeine Qualitätsregeln                         |
| `planung/`      | Aktueller Arbeitsstand, zukünftige Vorhaben und abgeschlossene Pläne |
| `referenzen/`   | Nicht verbindliche Informationen über ältere oder fremde Systeme     |

Wichtig: Der Quellcode zeigt, was tatsächlich umgesetzt ist. Die Dokumentation
erklärt insbesondere, was fachlich gelten soll und warum Entscheidungen so
getroffen wurden.

### `node_modules/`

Dieser sehr große Ordner enthält die über npm installierten Bibliotheken und
Werkzeuge, zum Beispiel Electron, React, Vite und Vitest.

- Er wird mit `npm install` beziehungsweise `npm ci` aus `package.json` und
  `package-lock.json` erzeugt.
- Er ist durch `.gitignore` von Git ausgeschlossen.
- Abhängigkeiten werden nicht direkt in diesem Ordner bearbeitet.
- Wenn der Ordner fehlt, kann er anhand der Paketdateien neu aufgebaut werden.

### `out/`

Electron Forge legt hier gebaute Anwendungspakete und Installer ab. Nach
`npm run make` befinden sich darunter beispielsweise die verpackte Anwendung,
das Squirrel-Installationsprogramm und weitere Auslieferungsartefakte.

- Der Ordner wird automatisch erzeugt und ist von Git ausgeschlossen.
- Ein vorhandener Inhalt beweist nicht automatisch, dass er zum aktuellen
  Quellstand gehört.
- Für eine Freigabe muss immer das gezielt aus dem freizugebenden Commit
  erstellte und geprüfte Artefakt verwendet werden.

### `release/`

Dieser eingecheckte Ordner enthält Vorlagen für die private Auslieferung:

- `README.md` erklärt den Umgang mit den Vorlagen.
- `LIESMICH.txt` ist die Vorlage für den Übergabeordner des Pilotnutzers.
- `release-nachweis.md` ist die Vorlage für den Nachweis eines konkreten
  Release-Kandidaten.

Fertige Installer, ausgefüllte Nachweise und Benutzerdaten werden nicht in
diesem Ordner und nicht im Git-Repository aufbewahrt.

### `scripts/`

Hier liegen Hilfsprogramme, die Projektaufgaben automatisieren.

Aktuell enthält der Ordner `generate-third-party-notices.mjs`. Dieses Skript
erzeugt oder prüft die Datei `THIRD_PARTY_NOTICES.txt` anhand der installierten
Produktionsabhängigkeiten. Es wird über `npm run licenses:generate` und
`npm run licenses:check` aufgerufen.

### `src/`

`src` steht für **source**, also Quellcode. Hier liegt der eigentliche, von uns
geschriebene Anwendungscode. Die genaue Aufteilung wird weiter unten in einem
eigenen Abschnitt erklärt.

### `tests/`

Dieser Ordner enthält die automatisierten Tests.

- `setup/` enthält Vorbereitungen und Schutzregeln für die Testumgebung.
- `unit/` enthält die eigentlichen Testdateien, nach Themen wie Berechnungen,
  Mitarbeitende, Eintragsarten, Monatspläne, PDF-Export und Planung sortiert.
- Dateien mit der Endung `.test.ts` werden durch Vitest ausgeführt.

Die Tests prüfen einzelne Regeln und technische Abläufe. Sie ersetzen keine
manuelle Sicht- oder Produktabnahme der installierten Anwendung.

### `tmp/`

`tmp` ist ein lokaler Arbeitsbereich für vorübergehende Dateien. Aktuell gibt
es darin den leeren Unterordner `pdfs/`.

Der Ordner gehört nicht zum eingecheckten Projektbestand und kann auf einem
anderen Rechner vollständig fehlen. Weil `tmp/` derzeit nicht durch
`.gitignore` ausgeschlossen ist, sollte vor einem Commit besonders darauf
geachtet werden, keine temporären Dateien versehentlich aufzunehmen.

## Aufbau des Quellcodes unter `src/`

Die Anwendung besteht aus mehreren klar getrennten Bereichen. Vereinfacht
läuft ein Vorgang in dieser Richtung:

```text
React-Oberfläche
  → Preload-Schnittstelle
  → IPC-Verarbeitung im Main Process
  → Repository und Dateispeicher
  → lokale JSON-Dateien
```

Diese Trennung schützt den Computerzugriff: Die sichtbare Oberfläche kann nicht
beliebig auf Dateien oder Electron-Funktionen zugreifen, sondern nur die
ausdrücklich freigegebenen Vorgänge verwenden.

**IPC** steht für „Inter-Process Communication“, also die kontrollierte
Kommunikation zwischen den getrennten Bereichen der Electron-Anwendung.

### `src/main.ts`

Dies ist der Einstiegspunkt des Electron Main Process. Die Datei startet die
Desktop-Anwendung, erstellt das Hauptfenster, registriert die IPC-Verarbeitung
und lädt die Oberfläche.

Der Main Process ist der technische Hintergrundteil der App. Er darf auf
Electron- und Betriebssystemfunktionen zugreifen.

### `src/preload.ts`

Die Preload-Datei ist die kontrollierte Brücke zwischen Oberfläche und Main
Process. Sie stellt unter `window.dienstplaner` nur die ausdrücklich erlaubten
Funktionen bereit, zum Beispiel das Laden oder Speichern eines Monatsplans.

### `src/main/`

Hier liegt der weitere Code des Main Process.

| Unterordner | Aufgabe                                                                                 |
| ----------- | --------------------------------------------------------------------------------------- |
| `domain/`   | Fachliche Monatsplan-Abläufe, die im Main Process ausgeführt werden                     |
| `ipc/`      | Nimmt Anfragen der Oberfläche entgegen, validiert sie und ruft die zuständige Logik auf |
| `pdf/`      | Steuert den nativen Dialog und Ablauf für den PDF-Export                                |
| `storage/`  | Liest, validiert, sichert und schreibt die lokalen JSON-Daten                           |

Die Dateien mit dem Namensbestandteil `Repository` bilden die fachliche
Schnittstelle zur Speicherung. `jsonFileStore.ts` übernimmt die allgemeinen
Dateizugriffe sowie Sicherungs- und Wiederherstellungsabläufe.

### `src/renderer/`

Der Renderer ist die sichtbare React-Oberfläche.

| Bestandteil             | Aufgabe                                                                          |
| ----------------------- | -------------------------------------------------------------------------------- |
| `index.tsx`             | Startet React und verbindet die App mit dem HTML-Grundgerüst                     |
| `App.tsx`               | Oberster Anwendungsknoten; steuert Seitennavigation und Schließen der App        |
| `global.d.ts`           | Beschreibt für TypeScript die über Preload bereitgestellte Browser-Schnittstelle |
| `components/layout/`    | Übergreifendes Seitenlayout, Seitenkopf und Werkzeugleiste                       |
| `components/ui/`        | Wiederverwendbare Grundbausteine wie Buttons, Dialoge und Eingabefelder          |
| `errors/`               | Übersetzt unerwartete technische Fehler in verständliche Meldungen               |
| `features/team/`        | Oberfläche und Hilfslogik der Teamverwaltung                                     |
| `features/entry-types/` | Oberfläche und Hilfslogik der Planungseinträge                                   |
| `features/planner/`     | Planungsseite, Auswertung, Kompaktansicht und PDF-Ausgabe                        |
| `styles/`               | Globale Gestaltung und Mitarbeiterfarben                                         |

Dateien mit der Endung `.tsx` enthalten meist React-Komponenten und damit
sichtbare Oberflächenelemente. Dateien mit `.ts` enthalten meist Datenmodelle,
Berechnungen oder andere Logik ohne eigenes sichtbares Element.

### `src/shared/`

Dieser Ordner enthält Code, den mehr als ein Anwendungsbereich benötigt. Er
kann vom Main Process, von Preload und teilweise vom Renderer verwendet werden.

| Unterordner oder Datei | Aufgabe                                                                                  |
| ---------------------- | ---------------------------------------------------------------------------------------- |
| `calculations/`        | Gemeinsame Kalender-, Zeit- und Auswertungsberechnungen                                  |
| `domain/`              | Gemeinsame fachliche Funktionen und Daten-Snapshots                                      |
| `ipc/`                 | Kanalnamen, Typen und Vertrag der Kommunikation zwischen Oberfläche und Main Process     |
| `schemas/`             | Zod-Schemas zur Prüfung von Mitarbeitenden, Eintragsarten, Monatsplänen und PDF-Anfragen |
| `pdfExport.ts`         | Gemeinsame Typen und Konstanten für den PDF-Export                                       |

`shared` bedeutet nicht, dass alles dort abgelegt werden soll. Eine Datei
gehört nur dann dorthin, wenn sie tatsächlich über eine Schichtgrenze hinweg
gemeinsam benötigt wird.

## Dateien im Projekt-Root

### Paket- und Projektinformationen

#### `package.json`

Dies ist die zentrale Projektdatei für npm. Sie enthält:

- Name, Produktname und Version der Anwendung,
- Produktions- und Entwicklungsabhängigkeiten,
- Angaben zu Autor und Lizenz sowie
- die verfügbaren npm-Befehle.

Wer beispielsweise `npm test` ausführt, startet damit das in `package.json`
hinterlegte Skript `vitest run`.

#### `package-lock.json`

Diese Datei hält die exakten Versionen des gesamten npm-Abhängigkeitsbaums
fest. Dadurch werden auf verschiedenen Rechnern möglichst dieselben Pakete
installiert.

- Die Datei wird von npm verwaltet und nicht von Hand bearbeitet.
- Bei einer beabsichtigten Abhängigkeitsänderung gehört die passende Änderung
  normalerweise zusammen mit `package.json` in den Commit.

#### `LICENSE`

Enthält die MIT-Lizenz für den selbst entwickelten Code der Version `1.0.0`.
Sie legt rechtlich fest, unter welchen Bedingungen dieser Code verwendet und
weitergegeben werden darf.

#### `THIRD_PARTY_NOTICES.txt`

Enthält Lizenz- und Urheberrechtshinweise der verwendeten Fremdsoftware. Die
Datei wird durch das Skript unter `scripts/` reproduzierbar erzeugt und mit
`npm run licenses:check` überprüft.

### Electron- und Build-Konfiguration

#### `forge.config.ts`

Dies ist die zentrale Konfiguration für Electron Forge. Sie legt unter anderem
fest:

- welche Einstiegspunkte gebaut werden,
- dass die Anwendung in ein ASAR-Archiv gepackt wird,
- dass ein Windows-Squirrel-Installer erstellt wird,
- welche Lizenzdateien zusätzlich in das Paket gelangen und
- welche Electron-Sicherheitsoptionen aktiviert werden.

#### `forge.env.d.ts`

Diese kleine TypeScript-Hilfsdatei bindet die Typdefinitionen des
Electron-Forge-Vite-Plugins ein. Dadurch kennt TypeScript die von diesem Plugin
bereitgestellten Build-Variablen.

#### `vite.main.config.ts`

Vite-Konfiguration für den Electron Main Process. Aktuell sind keine
zusätzlichen Plugins oder Sonderregeln notwendig.

#### `vite.preload.config.ts`

Vite-Konfiguration für die Preload-Schicht. Auch sie benötigt aktuell keine
zusätzlichen Einstellungen.

#### `vite.renderer.config.mts`

Vite-Konfiguration für die sichtbare Oberfläche. Sie aktiviert die Verarbeitung
von React und Tailwind CSS.

#### `index.html`

Das minimale HTML-Grundgerüst der Oberfläche. Es enthält das Element `root`, in
das React die Anwendung einfügt, und verweist auf `src/renderer/index.tsx`.

### Regeln für TypeScript, Tests und Codequalität

#### `tsconfig.json`

Konfiguriert den TypeScript-Compiler. Die Datei legt beispielsweise fest, wie
Module aufgelöst werden, welche JavaScript-Zielversion verwendet wird und dass
implizites `any` nicht erlaubt ist.

#### `vitest.config.mts`

Konfiguriert Vitest. Die aktuellen Unit-Tests laufen in einer Node-Umgebung,
werden unter `tests/unit/` gesucht und verwenden die gemeinsame Vorbereitung
aus `tests/setup/forbidElectronUserData.ts`.

#### `.eslintrc.json`

Enthält Regeln für ESLint. ESLint sucht nach typischen Fehlern und problematischen
Code-Mustern in TypeScript- und React-Dateien.

#### `.prettierrc.json`

Enthält die Formatierungsregeln für Prettier, zum Beispiel einfache
Anführungszeichen und abschließende Kommas. Außerdem ist das Tailwind-Plugin
aktiviert, das CSS-Klassen in eine einheitliche Reihenfolge bringt.

#### `.prettierignore`

Listet Dateien und Ordner auf, die Prettier nicht formatieren soll. Dazu gehören
erzeugte Inhalte wie `.vite/`, `out/`, `dist/` und `node_modules/`, aber auch die
automatisch gepflegte `package-lock.json`.

### Git- und Arbeitsregeln

#### `.gitignore`

Legt fest, welche lokalen oder erzeugten Dateien Git nicht als Projektänderung
behandeln soll. Dazu gehören insbesondere `node_modules/`, `.vite/`, `out/`,
Protokolldateien und lokale Umgebungsdateien.

#### `.gitattributes`

Definiert Git-Regeln für Dateiformate. Im Projekt werden Textdateien grundsätzlich
mit LF-Zeilenenden gespeichert; Windows-Skripte wie `.bat`, `.cmd` und `.ps1`
verwenden CRLF.

#### `AGENTS.md`

Enthält Arbeits- und Qualitätsregeln für KI-gestützte Entwicklungswerkzeuge.
Die Datei beeinflusst nicht das Verhalten der fertigen Anwendung. Sie legt aber
fest, wie Änderungen in diesem Repository untersucht, umgesetzt, geprüft und
dokumentiert werden sollen.

## Was bedeuten die Dateiendungen?

| Endung  | Bedeutung in diesem Projekt                                                     |
| ------- | ------------------------------------------------------------------------------- |
| `.ts`   | TypeScript-Code ohne direkt enthaltene React-Oberfläche                         |
| `.tsx`  | TypeScript-Code, der React-Oberflächenelemente enthalten kann                   |
| `.json` | Strukturierte Konfigurations- oder Paketdaten                                   |
| `.mts`  | TypeScript-Datei, die ausdrücklich als modernes JavaScript-Modul behandelt wird |
| `.mjs`  | JavaScript-Datei, die ausdrücklich als modernes JavaScript-Modul behandelt wird |
| `.md`   | Markdown-Dokumentation mit Überschriften, Listen und Verweisen                  |
| `.txt`  | Einfache Textdatei ohne besondere Dokumentstruktur                              |

Ein führender Punkt wie bei `.gitignore` kennzeichnet unter Windows und vielen
Entwicklungswerkzeugen üblicherweise eine technische Konfigurationsdatei.

## Wichtige npm-Befehle

Die folgenden Befehle werden im Projekt-Root ausgeführt:

| Befehl                      | Bedeutung                                                                                              |
| --------------------------- | ------------------------------------------------------------------------------------------------------ |
| `npm start`                 | Startet die Anwendung im Entwicklungsmodus                                                             |
| `npm test`                  | Führt alle Unit-Tests einmal aus                                                                       |
| `npm run test:watch`        | Beobachtet Änderungen und führt passende Tests erneut aus                                              |
| `npm run typecheck`         | Prüft die TypeScript-Typen, ohne Dateien zu erzeugen                                                   |
| `npm run lint`              | Prüft den Code mit ESLint                                                                              |
| `npm run format`            | Formatiert unterstützte Dateien mit Prettier                                                           |
| `npm run format:check`      | Prüft die Formatierung, ohne sie zu verändern                                                          |
| `npm run licenses:generate` | Erzeugt die Fremdlizenzhinweise neu                                                                    |
| `npm run licenses:check`    | Prüft, ob die Fremdlizenzhinweise aktuell sind                                                         |
| `npm run package`           | Erstellt ein ausführbares Anwendungspaket, aber nicht zwingend einen Installer                         |
| `npm run make`              | Erstellt die Anwendung und die konfigurierten Auslieferungsartefakte einschließlich Installer          |
| `npm run publish`           | Startet den Forge-Veröffentlichungsablauf; für die private USB-Übergabe wird er derzeit nicht benötigt |

## Was wird normalerweise von Hand bearbeitet?

| Bereich                           | Manuell bearbeiten?                 | Hinweis                                                                 |
| --------------------------------- | ----------------------------------- | ----------------------------------------------------------------------- |
| `src/`                            | Ja                                  | Hier entstehen Programmfunktionen und Oberflächenänderungen.            |
| `tests/`                          | Ja                                  | Tests werden passend zu Änderungen ergänzt oder angepasst.              |
| `docs/`                           | Ja                                  | Dauerhafte Regeln, Entscheidungen und Erklärungen werden hier gepflegt. |
| `scripts/`                        | Ja, bei Bedarf                      | Enthält eigene Automatisierungen.                                       |
| Root-Konfigurationen              | Ja, bewusst                         | Änderungen können den gesamten Build- oder Prüfablauf beeinflussen.     |
| `release/`                        | Ja, bei einer Änderung der Vorlagen | Fertige Release-Artefakte gehören trotzdem nicht hier hinein.           |
| `package-lock.json`               | Nicht direkt                        | npm aktualisiert die Datei bei Abhängigkeitsänderungen.                 |
| `THIRD_PARTY_NOTICES.txt`         | Nicht direkt                        | Das Lizenzskript erzeugt die Datei.                                     |
| `.git/`                           | Nein                                | Wird ausschließlich von Git verwaltet.                                  |
| `.vite/`, `node_modules/`, `out/` | Nein                                | Werden von Entwicklungs- und Build-Werkzeugen erzeugt.                  |
| `dist/`                           | Nein                                | Enthält kompilierte Ausgabe; Änderungen gehören in `src/`.              |
| `tmp/`                            | Nur für vorübergehende Arbeit       | Inhalt darf nicht versehentlich als Produktbestand behandelt werden.    |

## Wo finde ich was?

| Frage                                                                      | Passender Einstieg                                                                               |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Was soll das Produkt grundsätzlich leisten?                                | `docs/projekt/zielbild-und-rahmenbedingungen.md`                                                 |
| Was ist als Nächstes geplant?                                              | `docs/planung/roadmap.md`                                                                        |
| Wie soll eine bestimmte Funktion arbeiten?                                 | `docs/features/` und `docs/fachlichkeit/`                                                        |
| Wo ist eine sichtbare Seite umgesetzt?                                     | `src/renderer/features/`                                                                         |
| Wo finde ich wiederverwendbare Oberflächenbausteine?                       | `src/renderer/components/`                                                                       |
| Wo werden Eingaben und gespeicherte Daten geprüft?                         | `src/shared/schemas/`                                                                            |
| Wo werden Daten gelesen und geschrieben?                                   | `src/main/storage/`                                                                              |
| Wo wird die Kommunikation zwischen Oberfläche und Main Process festgelegt? | `src/shared/ipc/`, `src/preload.ts` und `src/main/ipc/`                                          |
| Wo liegen Berechnungen?                                                    | `src/shared/calculations/` und die zugehörigen Dokumente unter `docs/fachlichkeit/berechnungen/` |
| Wo finde ich die automatisierten Prüfungen?                                | `tests/unit/`                                                                                    |
| Wie wird der Installer gebaut?                                             | `forge.config.ts`, `package.json` und `npm run make`                                             |
| Welche Dateien gehören in ein Übergabepaket?                               | `release/README.md`                                                                              |

## Wo liegen die echten Benutzerdaten?

Die in der Anwendung angelegten Mitarbeitenden, Eintragsarten und Monatspläne
liegen **nicht** im Projektordner, nicht unter `src/` und nicht im
Installationsordner.

Die Anwendung verwendet das von Electron bereitgestellte Benutzerverzeichnis
und legt darin den Ordner `dienstplaner-data` an. Darin befinden sich die
JSON-Dateien und ihre Sicherungsdateien. Der genaue Pfad hängt vom angemeldeten
Windows-Benutzer und der Electron-Umgebung ab; typischerweise liegt er im
Windows-Benutzerprofil unter `AppData`.

Der vollständige Aufbau und die Regeln für Sicherung und Wiederherstellung sind
unter [Datenhaltung](../architektur/datenhaltung.md) beschrieben.

## Kurzfassung

Für die tägliche Orientierung reichen meistens diese fünf Merksätze:

1. **`src/` ist die Anwendung.**
2. **`tests/` prüft die Anwendung.**
3. **`docs/` erklärt Ziele, Regeln und Entscheidungen.**
4. **`package.json` und die Konfigurationsdateien steuern die Werkzeuge.**
5. **`.vite/`, `node_modules/` und `out/` sind erzeugte Arbeits- oder
   Build-Inhalte und werden nicht direkt bearbeitet.**
