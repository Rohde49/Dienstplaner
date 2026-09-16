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

## Noch ausstehende Abnahme

### Auswertung

Der [Auswertungsdialog](../features/auswertung.md) ist technisch umgesetzt und
nutzt die verbindlichen Berechnungsregeln. Die abschließende Sichtprüfung der
vollständigen Tabelle und der Rückkehr zur Planung durch den Benutzer
steht noch aus.

### Kompaktansicht – Grenzfälle

Die [Kompaktansicht](../features/kompaktansicht.md) ist technisch umgesetzt und
für einen realen Monatsplan visuell bestätigt. Vor dem endgültigen Abschluss
stehen noch die gezielte manuelle Sichtprüfung des Neun-Mitarbeiter-Grenzfalls,
besonders langer Inhalte und der kleinsten Fenstergröße aus.

## Aktueller Schwerpunkt

### Abschlussprüfung der Kompaktansicht

Die technische Umsetzung folgt dem
[Umsetzungsplan](umsetzungsplan-kompaktansicht.md). Das freigegebene
A4-Dokumentlayout, der sichere Ansichtswechsel und die Passungsprüfung sind
vorhanden. Offen sind nur noch die oben genannten manuellen Grenzfälle; danach
kann das Arbeitspaket abgeschlossen werden.

## Anschließende Arbeitspakete

### 1. PDF-Export und Ausgabe

Das in der Kompaktansicht geprüfte Dokumentlayout wird als
[PDF](../features/pdf-export.md) exportierbar gemacht. Dateiname, Speicherort,
Überschreiben und eine mögliche direkte Druckfunktion werden vor diesem
Arbeitspaket fachlich festgelegt.

### 2. Auslieferung

Die Anwendung wird als Windows-Anwendung paketiert und über einen Installer
bereitgestellt. Die Installation und der lokale Betrieb werden auf einem dafür
geeigneten System geprüft.

### 3. Abschluss und Gesamtprüfung

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
