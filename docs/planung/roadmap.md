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
- [Kompaktansicht](../features/kompaktansicht.md)
- [Auswertung](../features/auswertung.md)

## Aktueller Schwerpunkt

### PDF-Export und Ausgabe

Das in der Kompaktansicht geprüfte Dokumentlayout wird als
[PDF](../features/pdf-export.md) exportierbar gemacht. Fachlichkeit,
Bedienablauf, Dateiauswahl, technische Grundrichtung und Prüfung sind
abgestimmt. Die Umsetzung folgt dem
[Umsetzungsplan PDF-Export](umsetzungsplan-pdf-export.md).

## Anschließende Arbeitspakete

### 1. Auslieferung

Die Anwendung wird als Windows-Anwendung paketiert und über einen Installer
bereitgestellt. Die Installation und der lokale Betrieb werden auf einem dafür
geeigneten System geprüft.

### 2. Abschluss und Gesamtprüfung

Zum Abschluss werden die wesentlichen Benutzerabläufe, Berechnungen,
Speicherabläufe und Fehlerfälle gemeinsam geprüft. Verbleibende Abweichungen
zwischen Dokumentation, Code und Oberfläche werden ausdrücklich festgehalten.
Dabei werden auch besonders lange Inhalte der Kompaktansicht und eine
tatsächlich ausgelöste Sicherungswiederherstellung nochmals betrachtet.

## Planungsgrundsätze

Vor der Umsetzung eines größeren Arbeitspakets werden:

1. der aktuelle Quellcode geprüft,
2. die relevante Dokumentation geprüft,
3. vorhandener und gewünschter Stand miteinander abgeglichen,
4. offene fachliche Entscheidungen geklärt und
5. ein klar begrenzter Umsetzungsumfang festgelegt.

Ein detaillierter technischer Umsetzungsplan wird nur erstellt, wenn Umfang
oder Komplexität des Arbeitspakets ihn tatsächlich rechtfertigen.
