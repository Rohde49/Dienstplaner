# Roadmap

## Zweck

Die Roadmap beschreibt die vorgesehene Reihenfolge der noch ausstehenden
Arbeitspakete. Sie definiert keine fachlichen Regeln und ersetzt nicht die
jeweiligen Feature-Dokumente.

Der Quellcode bleibt maßgeblich für den tatsächlichen Implementierungsstand.
Die Roadmap wird angepasst, wenn sich Prioritäten ändern oder ein Arbeitspaket
abgeschlossen wurde.

## Aktueller Schwerpunkt

### Planungsseite

Als nächstes wird die bisherige Platzhalterseite durch die eigentliche
Oberfläche für Monatspläne ersetzt. Sie baut auf den bereits vorhandenen
Grundlagen für Monatspläne, Speicherung und Berechnungen auf.

Zum Arbeitspaket gehören insbesondere:

- Zeitraum auswählen und eine noch nicht gespeicherte Vorschau anzeigen,
- Monatspläne anlegen, laden und löschen,
- Planungseinträge, Rufbereitschaften und Tagesbemerkungen bearbeiten,
- ungespeicherte Änderungen erkennbar machen und vor Verlust schützen,
- Kennzahlen aus dem aktuellen Entwurf anzeigen und
- Monatspläne bewusst speichern.

Die verbindliche fachliche Beschreibung steht in der
[Planungsseite](../features/planungsseite.md).

## Anschließende Arbeitspakete

### 1. Auswertung

Die ausführliche [Auswertung](../features/auswertung.md) eines Monatsplans wird
auf Grundlage der verbindlichen Berechnungsregeln dargestellt.

### 2. Kompaktansicht

Eine eigenständige [Kompaktansicht](../features/kompaktansicht.md) des
Monatsplans wird fachlich abschließend geklärt und bei bestätigtem Nutzen
umgesetzt. Sie ist keine Druckvorschau.

### 3. PDF-Export und Ausgabe

Der Dienstplan wird für eine verlässliche Ausgabe aufbereitet und als
[PDF](../features/pdf-export.md) exportierbar gemacht. Ob zusätzlich eine
direkte Druckfunktion benötigt wird, ist vor diesem Arbeitspaket fachlich zu
entscheiden.

### 4. Auslieferung

Die Anwendung wird als Windows-Anwendung paketiert und über einen Installer
bereitgestellt. Die Installation und der lokale Betrieb werden auf einem dafür
geeigneten System geprüft.

### 5. Abschluss und Gesamtprüfung

Zum Abschluss werden die wesentlichen Benutzerabläufe, Berechnungen,
Speicherabläufe und Fehlerfälle gemeinsam geprüft. Verbleibende Abweichungen
zwischen Dokumentation, Code und Oberfläche werden ausdrücklich festgehalten.

## Planungsgrundsätze

Vor der Umsetzung eines größeren Arbeitspakets werden:

1. der aktuelle Quellcode geprüft,
2. die relevante Dokumentation geprüft,
3. vorhandener und gewünschter Stand miteinander abgeglichen,
4. offene fachliche Entscheidungen geklärt und
5. ein klar begrenzter Umsetzungsumfang festgelegt.

Ein detaillierter technischer Umsetzungsplan wird nur erstellt, wenn Umfang
oder Komplexität des Arbeitspakets ihn tatsächlich rechtfertigen.
