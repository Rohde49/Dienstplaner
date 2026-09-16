# Roadmap

## Zweck

Die Roadmap beschreibt die vorgesehene Reihenfolge der noch ausstehenden
Arbeitspakete. Sie definiert keine fachlichen Regeln und ersetzt nicht die
jeweiligen Feature-Dokumente.

Der Quellcode bleibt maßgeblich für den tatsächlichen Implementierungsstand.
Die Roadmap wird angepasst, wenn sich Prioritäten ändern oder ein Arbeitspaket
abgeschlossen wurde.

## Abgeschlossen

- [Teamverwaltung](../features/teamverwaltung.md)
- [Planungseinträge](../features/planungseintraege.md)
- [Planungsseite](../features/planungsseite.md)

## Aktueller Schwerpunkt

### Auswertung

Der [Auswertungsdialog](../features/auswertung.md) ist technisch umgesetzt und
nutzt die verbindlichen Berechnungsregeln. Die abschließende Sichtprüfung der
vollständigen Tabelle und der Rückkehr zur Planung durch den Benutzer
steht noch aus.

## Anschließende Arbeitspakete

### 1. Kompaktansicht

Eine eigenständige [Kompaktansicht](../features/kompaktansicht.md) des
Monatsplans wird fachlich abschließend konkretisiert und anschließend
umgesetzt. Sie ist keine Druckvorschau.

### 2. PDF-Export und Ausgabe

Der Dienstplan wird für eine verlässliche Ausgabe aufbereitet und als
[PDF](../features/pdf-export.md) exportierbar gemacht. Ob zusätzlich eine
direkte Druckfunktion benötigt wird, ist vor diesem Arbeitspaket fachlich zu
entscheiden.

### 3. Auslieferung

Die Anwendung wird als Windows-Anwendung paketiert und über einen Installer
bereitgestellt. Die Installation und der lokale Betrieb werden auf einem dafür
geeigneten System geprüft.

### 4. Abschluss und Gesamtprüfung

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
