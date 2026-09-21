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
- [Auslieferung der Pilotversion 1.0.0](abgeschlossen/auslieferung-1.0.0.md)
- [Gesamtprüfung und Dokumentationsabgleich](abgeschlossen/gesamtpruefung-dokumentationsabgleich-1.0.0.md)

## Aktueller Schwerpunkt

Derzeit ist kein weiteres Umsetzungspaket als aktueller Schwerpunkt bestätigt.
Die Pilotversion `1.0.0` wurde vollständig geprüft, freigegeben, archiviert und
übergeben. Der zugehörige Quellstand ist mit `v1.0.0` gekennzeichnet; der
Abschlussabgleich enthält keinen offenen Befund.

Ein neuer Schwerpunkt wird erst nach einer eigenen Priorisierung festgelegt.
Beobachtungen aus dem Pilotbetrieb werden bis dahin als konkrete Fehler- oder
Änderungsanfrage bewertet und erweitern den abgeschlossenen Umfang von `1.0.0`
nicht rückwirkend.

## Spätere Erweiterungsmöglichkeiten

### Proprietäre Lizenzierung und rechtliche Auslieferung

Die Umstellung auf eine proprietäre Lizenz ist als zukünftiges Arbeitspaket
vorgesehen und wird derzeit nicht umgesetzt. Der bereits erstellte
[Umsetzungsplan](zukunft/umsetzungsplan-proprietaere-lizenzierung.md) hält die
zu prüfenden Entscheidungen und technischen Schritte fest. Version `1.0.0`
wird unabhängig davon unter MIT ausgeliefert und bleibt dauerhaft unter dieser
Lizenz nutzbar. Vor einer späteren Wiederaufnahme wird der Zukunftsplan anhand
der dann vorgesehenen Version neu entschieden.

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
