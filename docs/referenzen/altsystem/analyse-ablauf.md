# Analyseablauf für das Altsystem

## Untersuchter Stand

- Repository: `Rohde49/dienstplan-app`
- URL: <https://github.com/Rohde49/dienstplan-app>
- Festgelegter und mit `git rev-parse HEAD` bestätigter Commit: `255036d0d95fa7fbf53e354a36680a08ee4719c1`
- Analyseart: ausschließlich statische Untersuchung der Dateien dieses Commits

## Umfang und Grenzen

Untersucht werden der gesamte Quellcode, der gesamte `docs`-Ordner, die vorhandenen Tests sowie Projekt- und Build-Konfigurationen des Altsystems. Vertieft werden Team-Verwaltung, Eintrags-Verwaltung, PlanPage und AuswertungsPage. Andere Bereiche werden nur so weit einbezogen, wie sie für das Gesamtverständnis oder diese vier Features erforderlich sind.

Das Altsystem wird nicht gestartet. Abhängigkeiten werden weder installiert noch aktualisiert, Tests werden nicht ausgeführt und versionierte Dateien des Altsystems werden nicht verändert. Die Analyse beschreibt keine praktische Funktionsbestätigung und enthält keinen Vergleich mit dem aktuellen Projekt.

## Geplante Ergebnisstruktur

```text
docs/referenzen/altsystem/
├── README.md
├── analyse-ablauf.md
├── teamverwaltung/
│   ├── quellcodeanalyse.md
│   └── dokumentationsanalyse.md
├── eintragsverwaltung/
│   ├── quellcodeanalyse.md
│   └── dokumentationsanalyse.md
├── planungsseite/
│   ├── quellcodeanalyse.md
│   └── dokumentationsanalyse.md
├── auswertung/
│   ├── quellcodeanalyse.md
│   └── dokumentationsanalyse.md
└── uebergreifend/
    ├── architektur-und-navigation.md
    ├── datenmodell-und-datenhaltung.md
    ├── berechnungen.md
    ├── fehlerbehandlung-und-validierung.md
    ├── komponenten-und-tests.md
    └── dokumentationsstruktur.md
```

Die Struktur kann während der Analyse angepasst werden, falls der tatsächliche Repository-Inhalt eine andere Trennung sinnvoller macht.

## Reihenfolge der Analyseschritte

1. Repository-Stand verifizieren und Gesamtstruktur erfassen.
2. Anwendungsbereiche, Prozessgrenzen, Navigation, Datenmodell, Datenhaltung, gemeinsame Komponenten, Fehlerbehandlung und Tests zuordnen.
3. Team-Verwaltung statisch aus Quellcode und Dokumentation analysieren.
4. Eintrags-Verwaltung statisch aus Quellcode und Dokumentation analysieren.
5. Planungsseite statisch aus Quellcode und Dokumentation analysieren.
6. Auswertung statisch aus Quellcode und Dokumentation analysieren.
7. Übergreifende Ergebnisse zentral zusammenführen und aus den Feature-Analysen verlinken.
8. Begriffe, interne Links, Abgrenzungen und Kennzeichnungen unklarer Aussagen prüfen.
9. Abschließende `README.md` als Wegweiser erstellen und den Worktree-Änderungsumfang kontrollieren.

## Übergreifende Themen

- Electron-Prozessaufteilung aus Main-Prozess, Preload und Renderer
- Hash-basierte Navigation und lokaler React-Zustand
- typisierte IPC-Kanäle und die Renderer-Main-Prozess-Grenze
- SQLite-Schema, Repositories, Transaktionen und Fremdschlüssel
- gemeinsame Typen, Zeitfunktionen und Auswertungsberechnungen
- Validierung im Renderer sowie Fehlerweitergabe und Leerzustände
- wiederverwendete Layout- und UI-Komponenten
- Testaufbau von reinen Funktionen bis zu E2E-Smoke-Tests
- Gliederung und Aussagearten des Altsystem-`docs`-Ordners

## Verwendete Aufgabenverteilung auf Subagenten

Nach der gemeinsamen Bestandsaufnahme wurden drei voneinander getrennte Feature-Ordner parallel bearbeitet:

- Subagent 1: `teamverwaltung/`
- Subagent 2: `eintragsverwaltung/`
- Subagent 3: `planungsseite/`
- Hauptagent: `auswertung/`, alle Dokumente unter `uebergreifend/`, `analyse-ablauf.md`, abschließende Qualitätsprüfung und `README.md`

Kein Ergebnisdokument wurde gleichzeitig von mehreren Agenten bearbeitet. Der Hauptagent prüfte die gelieferten Feature-Dateien auf Umfang, Gliederung, Begriffe, Verlinkung und Doppelungen.

## Fortschritt

| Analysebereich | Status | Hinweis |
| --- | --- | --- |
| Commit-Verifikation | erledigt | HEAD stimmt exakt mit dem festgelegten Commit überein. |
| Gemeinsame Bestandsaufnahme | erledigt | Struktur, Anwendungsbereiche, Feature-Zuordnung, Querschnittsschichten, Tests und `docs`-Gliederung sind erfasst. |
| Team-Verwaltung | erledigt | Quellcode- und Dokumentationsanalyse vollständig; statische Grenzen und nicht angebundener Farbhelfer sind gekennzeichnet. |
| Eintrags-Verwaltung | erledigt | Quellcode- und Dokumentationsanalyse vollständig; Laufzeitgrenzen, fehlende direkte UI-/E2E-Abdeckung und die Verwendung der Zeitfelder sind gekennzeichnet. |
| Planungsseite | erledigt | Quellcode- und Dokumentationsanalyse vollständig; deaktivierter Druckpfad, nicht angebundene Validierungsfunktion und Laufzeitgrenzen sind gekennzeichnet. |
| Auswertung | erledigt | Dialoganbindung, Entwurfsdaten, 15 Kennzahlen, Tests und statische Grenzen sowie die eigenständige Dokumentationssicht sind erfasst. |
| Übergreifende Ergebnisse | erledigt | Architektur, Navigation, Datenmodell, Datenhaltung, Berechnungen, Fehlerbehandlung, Komponenten, Tests und Dokumentationsstruktur sind zentral dokumentiert. |
| Abschlussprüfung und Wegweiser | erledigt | README vollständig; Commit und unveränderter Altsystem-Checkout bestätigt, 16 Ergebnisdateien vorhanden, interne Links geprüft und Worktree-Änderungen auf den Zielordner begrenzt. |
