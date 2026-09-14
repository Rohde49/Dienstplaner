# Struktur des Altsystem-`docs`-Ordners

## Überblick

Der untersuchte `docs`-Ordner enthält 39 versionierte Markdown-Dateien. `docs/README.md` dient als Wegweiser und trennt Zustandsdokumentation, historische Dokumentation, Testwissen und Arbeitsanweisungen.

Die Dokumentation formuliert für sich zwei Ablageregeln:

- Sachdateien beschreiben den jeweils geltenden Zustand und sollen aktualisiert werden.
- Tagebücher und abgeschlossene Ablaufpläne dokumentieren den Weg beziehungsweise historische Planung und sollen nicht nachträglich an neuere Zustände angepasst werden.

Unsicherheit soll mit einer sichtbaren „Zu prüfen“-Markierung erhalten bleiben. Ein erwähnter `temp/`-Bereich ist laut `docs/README.md` ignorierte Zwischenablage und am untersuchten Commit nicht Teil der versionierten Dokumentationsdateien.

## Bereiche und Inhalte

### Wurzeldateien

- `README.md`: Wegweiser zu Architektur, Style, Tests, Workflow, Ablaufplänen und Tagebuch.
- `TODO.md`: kein aktuell laufender Schritt; offen sind vor allem PDF-Export, Signaturblock, Installer-Signierung und einige Infrastruktur-/Dokumentationsaufgaben.
- `erledigt.md`: chronologische Zusammenfassung der Schritte 1 bis 16 und späterer Querschnittsarbeiten.

### `architektur/`

Fünf Sachdateien beschreiben:

- Technologieentscheidungen für Electron, lokale SQLite-Datenhaltung, Windows und Hash-Routing,
- Zuständigkeiten der Projektordner,
- Main-/Preload-/Renderer-Grenzen und IPC,
- sechs Entitäten, Beziehungen und Datenkonventionen,
- die Auswertungsansicht mit 15 Kennzahlen und deren vorgesehener Darstellung.

### `funktionsbereiche/`

Fünf fachlich formulierte Referenztexte behandeln Team-Verwaltung, Eintrags-Verwaltung, Dienstplangerüst, Setzen von Planungseinträgen und Auswertungstabelle. Sie beschreiben Zweck, Daten, Geschäftsregeln und zurückgestellte Punkte und sind laut eigener Einleitung von der konkreten technischen Umsetzung getrennt gedacht.

### `ablaufplaene/`

`README.md` erklärt Lebenszyklus und Vorlage der Umsetzungspläne. Unter `erledigt/` liegen 13 historische Pläne für die Schritte 4 bis 16: Team, Eintragsdefinitionen, Planungsgerüst, Plananlage, Planeinträge, Rufbereitschaft, Bemerkungen, Kennzahlen, drei Löschfunktionen, Auswertungsdialog und verkürzte Ansicht.

Die abgeschlossenen Pläne enthalten damalige Designentscheidungen, kleine Umsetzungsschritte und vorgesehene Prüfungen. Ihre Kopfzeilen kennzeichnen sie als historische Dokumente und verweisen für den aktuellen Stand auf TODO und Erledigt.

### `style/`

- `design-system.md` ist als verbindlicher aktueller Stand der visuellen Sprache bezeichnet.
- `barrierefreiheit.md` nennt WCAG-orientierte Mindestanforderungen und kennzeichnet ältere Kontrastmessungen nach einer Farbänderung als nicht aktuell.
- `grundlagen.md` ist eine historische Begründung der Styling- und Palettenentscheidungen.

### `test/`

- `teststrategie.md` ordnet Prüffragen fünf Ebenen zu: reine Funktionen, Repository/DB, Komponenten, IPC-Vertrag und E2E.
- `testpraxis.md` beschreibt Konventionen, Hilfen, Gegenproben und den Umgang mit bekannten Mängeln.
- `offene-maengel.md` führt erwartbar fehlschlagende und nicht automatisiert überwachte Mängel.

### `tagebuch/`

Ein Index und zwei Wochen-Dateien dokumentieren Entscheidungen und Arbeitsverlauf in den Kalenderwochen 33 und 34 des Jahres 2026. Dieser Bereich ist historisch und enthält daher auch Zwischenstände und später überholte Wege.

### `workflow/`

Drei Texte beschreiben den damaligen Umgang mit Claude Code, Regeln zur Dokumentationspflege sowie Empfehlungen für Hooks, Skills, MCP und CI. Sie erklären den Entwicklungsprozess, nicht das fachliche Laufzeitverhalten der Anwendung.

## Zuordnung zu den vier untersuchten Features

| Feature | Besonders einschlägige Dokumentgruppen |
| --- | --- |
| Team-Verwaltung | `funktionsbereiche/team-verwaltung.md`, Ablaufpläne Schritte 4 und 12, Datenmodell, Erledigt, Tests und Style |
| Eintrags-Verwaltung | `funktionsbereiche/eintrag-verwaltung.md`, Ablaufpläne Schritte 5 und 13, Datenmodell, Erledigt, Tests und Style |
| Planungsseite | `funktionsbereiche/dienstplan-geruest.md`, `eintraege-setzen.md`, Ablaufpläne Schritte 6 bis 10, 14 und 16, Datenmodell, Erledigt, Tests und Style |
| Auswertung | `funktionsbereiche/auswertungstabelle.md`, `architektur/auswertung.md`, Ablaufpläne Schritte 11 und 15 sowie Teile von Schritt 16, Erledigt und Tests |

Die eigenständigen Zusammenfassungen stehen in den jeweiligen `dokumentationsanalyse.md`-Dateien. Diese Strukturübersicht löst unterschiedliche historische und aktuelle Aussagen nicht auf.
