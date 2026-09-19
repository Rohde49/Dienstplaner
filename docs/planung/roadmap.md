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
- [PDF-Export](../features/pdf-export.md)

## Aktueller Schwerpunkt

### Auslieferung

Die Anwendung wird als Windows-Anwendung paketiert und über einen Installer
bereitgestellt. Die Installation und der lokale Betrieb werden auf einem dafür
geeigneten System geprüft.

## Anschließende Arbeitspakete

### Abschluss und Gesamtprüfung

Zum Abschluss werden die wesentlichen Benutzerabläufe, Berechnungen,
Speicherabläufe und Fehlerfälle gemeinsam geprüft. Verbleibende Abweichungen
zwischen Dokumentation, Code und Oberfläche werden ausdrücklich festgehalten.
Dabei werden auch besonders lange Inhalte der Kompaktansicht und eine
tatsächlich ausgelöste Sicherungswiederherstellung nochmals betrachtet.

## Spätere Erweiterungsmöglichkeiten

### Proprietäre Lizenzierung und rechtliche Auslieferung

Die Umstellung auf eine proprietäre Lizenz ist als zukünftiges Arbeitspaket
vorgesehen und wird derzeit nicht umgesetzt. Der bereits erstellte
[Umsetzungsplan](zukunft/umsetzungsplan-proprietaere-lizenzierung.md) hält die
erforderlichen Entscheidungen und technischen Schritte fest und bleibt bis zur
späteren Wiederaufnahme unverändert erhalten.

Vor einem kommerziellen oder breiten externen Vertrieb müssen insbesondere der
Rechteinhaber und Nutzungsumfang festgelegt, die Fremdlizenzen vollständig
geprüft sowie die Lizenztexte in Anwendung und Installer aufgenommen werden.

### Schulferientermine durch Benutzer aktualisieren

Die feststehenden Brandenburger Schulferien werden zunächst zentral und offline
mit der Anwendung ausgeliefert. Eine spätere Erweiterung kann es Benutzern
ermöglichen, neu veröffentlichte offizielle Termine selbst zu importieren oder
zu pflegen, ohne eine neue Anwendungsversion zu benötigen.

Vor einer Umsetzung sind insbesondere Quelle und Dateiformat, die Validierung
von Zeiträumen, der Umgang mit bereits vorhandenen Daten, verständliche
Fehlermeldungen sowie die Abgrenzung zu schulabhängigen variablen Ferientagen zu
klären. Als mögliche Eingabe kommen die von der Kultusministerkonferenz
bereitgestellten Kalenderdateien in Betracht. Bis dahin erfolgt jede
Erweiterung der Terminliste kontrolliert im Quellcode und wird mit Tests sowie
einer aktualisierten Quellenangabe ausgeliefert.

## Planungsgrundsätze

Vor der Umsetzung eines größeren Arbeitspakets werden:

1. der aktuelle Quellcode geprüft,
2. die relevante Dokumentation geprüft,
3. vorhandener und gewünschter Stand miteinander abgeglichen,
4. offene fachliche Entscheidungen geklärt und
5. ein klar begrenzter Umsetzungsumfang festgelegt.

Ein detaillierter technischer Umsetzungsplan wird nur erstellt, wenn Umfang
oder Komplexität des Arbeitspakets ihn tatsächlich rechtfertigen.
