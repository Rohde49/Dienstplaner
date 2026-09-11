# Berechnungen

## Zweck und Verbindlichkeit

Diese Datei hält die fachlichen Berechnungsregeln des Dienstplaners zentral fest. Sie beschreibt, **welche Werte auf welcher Grundlage berechnet werden**, unabhängig davon, wie die Berechnung technisch umgesetzt wird.

Die Berechnungen des alten Projekts dienen als Ausgangspunkt für die fachliche Klärung. Eine dort vorhandene Implementierung wird nicht automatisch zur verbindlichen Regel des neuen Projekts. Jeder Themenblock wird geprüft, verständlich dokumentiert und anschließend fachlich bestätigt oder angepasst.

## Analysegrundlage

- Altes Projekt: [`Rohde49/dienstplan-app`](https://github.com/Rohde49/dienstplan-app)
- Untersuchte Version: Commit [`255036d0d95fa7fbf53e354a36680a08ee4719c1`](https://github.com/Rohde49/dienstplan-app/tree/255036d0d95fa7fbf53e354a36680a08ee4719c1/src)
- Ausgewerteter Bereich: ausschließlich der Ordner `src`, einschließlich der dort enthaltenen Tests
- Bewusst nicht als Quelle verwendet: der `docs`-Ordner des alten Projekts

Die fachlich maßgeblichen Berechnungsstellen liegen im alten Projekt vor allem in folgenden Quelldateien:

- `src/shared/time.ts` und `src/shared/rundeAufVolleMinute.ts`
- `src/shared/kalendertage.ts`
- `src/renderer/src/lib/mitarbeiterabhaengigeArbeitszeit.ts`
- `src/renderer/src/lib/planeintragSnapshot.ts`
- `src/shared/auswertung.ts`

Die zugehörigen Tests im `src`-Ordner werden ergänzend verwendet, um Beispiele, Grenzfälle und die tatsächlich erwarteten Ergebnisse nachzuvollziehen.

## Erkannte Berechnungsbereiche

| Schritt | Themenbereich | Im alten Quellcode erkannter Inhalt | Bearbeitungsstand |
| --- | --- | --- | --- |
| 1 | Bestandsaufnahme | Berechnungsstellen und Abhängigkeiten im alten `src`-Ordner erfassen | abgeschlossen |
| 2 | Zeitbasis und Rundung | Umrechnung zwischen Stunden-/Minutenangaben und Minuten; gemeinsame Rundungsregel | abgeschlossen |
| 3 | Kalender und Arbeitstage | Monatstage, Wochentage, Wochenenden, Brandenburger Feiertage und monatliche Arbeitstage | abgeschlossen |
| 4 | Planungseinträge | `Feste Zeitwerte` und aus der `Wochenarbeitszeit` berechnete Tageswerte; Übernahme als Snapshot | abgeschlossen |
| 5 | Tagesbezogene Kennzahlen | SN/F-Dienste, freie Tage, freie Samstage und Sonntage sowie Rufbereitschaften | abgeschlossen |
| 6 | Zeitbezogene Kennzahlen | Monatssummen, Sonntags-/Feiertagsstunden, Nachtarbeit, Nachtbereitschaft und Zuschläge | abgeschlossen |
| 7 | Soll-/Ist-Vergleich | monatliche Soll-Arbeitszeit, Ist-Arbeitszeit und deren Differenz | abgeschlossen |
| 8 | Gesamtprüfung | Überschneidungen, Grenzfälle und noch offene fachliche Entscheidungen prüfen | abgeschlossen |

## Abgrenzung der Bestandsaufnahme

Nicht jede Rechenoperation im Quellcode ist eine fachliche Berechnung. Rein technische Vorgänge wie Datenbank-IDs, Bildschirmbreiten, Navigation, Sortierung oder die Erkennung ungespeicherter Änderungen werden deshalb nicht in diese Datei übernommen.

Darstellungsregeln wie das Format `HH:MM`, das Vorzeichen einer Soll-/Ist-Differenz oder ihre farbliche Kennzeichnung werden nur dann aufgenommen, wenn sie für die eindeutige fachliche Interpretation eines berechneten Ergebnisses erforderlich sind.

## Verbindliche fachliche Regeln

Die verbindlichen fachlichen Regeln sind thematisch auf folgende Dokumente verteilt:

- [Zeitbasis und Rundung](./01-Zeitbasis-und-Rundung.md)
- [Kalender und Arbeitstage](./02-Kalender-und-Arbeitstage.md)
- [Planungseinträge und Snapshots](./03-Planungseintraege-und-Snapshots.md)
- [Tagesbezogene Kennzahlen](./04-Tagesbezogene-Kennzahlen.md)
- [Zeitbezogene Monatskennzahlen](./05-Zeitbezogene-Monatskennzahlen.md)
- [Soll-Ist-Auswertung](./06-Soll-Ist-Auswertung.md)

Die aufgeführten Dokumente bilden gemeinsam den verbindlichen fachlichen Stand der Berechnungen.
