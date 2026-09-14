# Referenzdokumentation des Altsystems

## Untersuchtes Repository

- Name: `Rohde49/dienstplan-app`
- URL: <https://github.com/Rohde49/dienstplan-app>
- Analysierter Commit: `255036d0d95fa7fbf53e354a36680a08ee4719c1`

Der Commit wurde im isolierten Altsystem-Checkout mit `git rev-parse HEAD` bestätigt. Diese Dokumentation beruht ausschließlich auf den Dateien dieses Repository-Stands.

## Analyseumfang

Die Referenz beschreibt statisch die Architektur, Navigation, Zustandsverwaltung, Datenmodelle, lokale Datenhaltung, Berechnungen, Validierung, Fehlerbehandlung, gemeinsame Komponenten, Tests und den `docs`-Ordner des Altsystems. Vertieft untersucht wurden Team-Verwaltung, Eintrags-Verwaltung, Planungsseite und Auswertung.

Die Anwendung wurde nicht gestartet, Abhängigkeiten wurden nicht installiert und Tests wurden nicht ausgeführt. Die Dokumentation bestätigt daher kein praktisches Laufzeitverhalten. Sie enthält keinen Vergleich mit dem aktuellen Projekt und keine Empfehlungen für dessen Weiterentwicklung.

Der Arbeits- und Fortschrittsstand der Analyse ist in [analyse-ablauf.md](./analyse-ablauf.md) festgehalten.

## Feature-Analysen

### Team-Verwaltung

- [Quellcodeanalyse](./teamverwaltung/quellcodeanalyse.md)
- [Dokumentationsanalyse](./teamverwaltung/dokumentationsanalyse.md)

Behandelt werden Mitarbeiterliste, gemeinsames Anlage-/Bearbeitungsformular, Löschsperre für verwendete Personen, Renderer-Validierung, IPC-/SQLite-Anbindung und zugehörige Tests.

### Eintrags-Verwaltung

- [Quellcodeanalyse](./eintragsverwaltung/quellcodeanalyse.md)
- [Dokumentationsanalyse](./eintragsverwaltung/dokumentationsanalyse.md)

Behandelt werden feste und mitarbeiterabhängige Eintragsdefinitionen, Formularsteuerung, Zeitfelder, CRUD-Abläufe, Verwendung als Planeintrag-Snapshot und zugehörige Tests.

### Planungsseite

- [Quellcodeanalyse](./planungsseite/quellcodeanalyse.md)
- [Dokumentationsanalyse](./planungsseite/dokumentationsanalyse.md)

Behandelt werden Monatsvorschau, Anlegen und Laden von Plänen, lokaler Entwurf und Baseline, Planeinträge, Rufbereitschaften, Bemerkungen, gemeinsames Speichern, Löschen, verkürzte Ansicht und Schutz vor dem Verwerfen ungespeicherter Änderungen.

### Auswertung

- [Quellcodeanalyse](./auswertung/quellcodeanalyse.md)
- [Dokumentationsanalyse](./auswertung/dokumentationsanalyse.md)

Behandelt werden die Einbindung als Dialog, aktuelle Entwurfsdaten, Kennzahlen und Formatierung, Verwendung derselben Berechnung in mehreren Ansichten sowie die statisch vorhandenen Tests.

## Übergreifende Dokumente

- [Architektur, Navigation und Zustandsverwaltung](./uebergreifend/architektur-und-navigation.md)
- [Datenmodell und Datenhaltung](./uebergreifend/datenmodell-und-datenhaltung.md)
- [Berechnungen](./uebergreifend/berechnungen.md)
- [Fehlerbehandlung und Validierung](./uebergreifend/fehlerbehandlung-und-validierung.md)
- [Wiederverwendete Komponenten und Tests](./uebergreifend/komponenten-und-tests.md)
- [Struktur des Altsystem-`docs`-Ordners](./uebergreifend/dokumentationsstruktur.md)

## Trennung der Analysebereiche

Jeder Feature-Ordner enthält zwei eigenständige Sichtweisen:

- Die **Quellcodeanalyse** beschreibt ausschließlich statisch aus dem Quellcode ableitbare Implementierung. Sie kennzeichnet eindeutig angebundene Bereiche, vorhandenen aber nicht erkennbar angebundenen Code und Verhalten, das ohne Ausführung nicht abschließend bestätigt werden kann.
- Die **Dokumentationsanalyse** fasst Ziele, Abläufe, Regeln, Entscheidungen, Grenzen und offene Inhalte aus dem `docs`-Ordner des Altsystems zusammen.

Die beiden Sichtweisen werden nicht in einer gesonderten Abweichungs- oder Widerspruchsanalyse zusammengeführt. Übergreifende Sachverhalte sind zentral dokumentiert und aus den Feature-Dateien verlinkt, damit sie nicht mehrfach vollständig wiederholt werden.
