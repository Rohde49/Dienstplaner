# PDF-Export

Der PDF-Export soll einen Monatsplan als verlässliche lokale Datei ausgeben. Er
ist ein eigener Funktionsbereich und wird nicht durch eine bloße
Bildschirmansicht oder die Kompaktansicht ersetzt.

## Zweck und Umfang

Der Export soll:

- einen Monatsplan in ein festgelegtes PDF-Layout übertragen,
- die für die Weitergabe benötigten Planinformationen vollständig und lesbar
  darstellen,
- ausschließlich lokal und ohne Server- oder Cloud-Dienst funktionieren,
- einen nachvollziehbaren Speicherort beziehungsweise Dateidialog verwenden
  und
- Erfolg oder Fehler verständlich zurückmelden.

## Bezug zum Monatsplan

Die PDF-Datei wird aus genau einem ausgewählten Monatsplan erzeugt.
Ungespeicherte Änderungen oder ein aus einer Sicherung geladener Stand dürfen
dabei nicht unbemerkt als regulär gespeicherter Plan erscheinen.

Ob ausschließlich ein gespeicherter Plan exportiert werden darf oder auch ein
eindeutig gekennzeichneter Entwurf, ist noch fachlich zu entscheiden.

## Datengrundlage

Die Ausgabe verwendet ausschließlich den vollständigen Monatsplan mit seinen:

- Mitarbeiter-Snapshots,
- Kalendertagen,
- Planungseintrag-Snapshots,
- Rufbereitschaften und
- Bemerkungen.

Benötigte Kalendermerkmale und Kennzahlen werden mit denselben gemeinsamen
Funktionen ermittelt wie in der Anwendung. Aktuelle Stammdaten dürfen einen
älteren gespeicherten Plan nicht verändern.

Die PDF-Datei ist eine abgeleitete Ausgabe. Sie gehört nicht zur primären
[Datenhaltung](../architektur/datenhaltung.md) und verändert den Monatsplan
nicht.

## Bedien- und Fehlerverhalten

- Die Exportaktion wird erst angezeigt, wenn sie tatsächlich funktionsfähig
  ist.
- Während der Erzeugung wird ein eindeutiger Beschäftigtzustand angezeigt und
  ein Mehrfachauslösen verhindert.
- Ein erfolgreicher Export wird knapp bestätigt.
- Ein fehlgeschlagener oder abgebrochener Export erzeugt keinen falschen
  Erfolgszustand.
- Fehlermeldungen erklären die Ursache soweit möglich verständlich und lassen
  den Monatsplan unverändert.

## Qualitätsanforderungen

Die erzeugte PDF-Datei muss:

- auf dem festgelegten Seitenformat vollständig lesbar sein,
- keine abgeschnittenen Tabellen, Texte oder Bemerkungen enthalten,
- Mitarbeiter, Tage und Planungseinträge eindeutig zuordnen,
- Wochenenden und Feiertage auch ohne alleinige Farberkennung kennzeichnen,
- auf einem üblichen PDF-Betrachter ohne externe Ressourcen funktionieren und
- bei identischem gespeicherten Planstand fachlich identische Inhalte liefern.

Die technische Prüfung muss neben dem erfolgreichen Erzeugen auch das
gerenderte Ergebnis kontrollieren. Eine bestandene Typ- oder Buildprüfung allein
belegt kein korrektes PDF-Layout.

## Noch fachlich festzulegen

Vor der Umsetzung sind insbesondere festzulegen:

- Seitenformat und Ausrichtung,
- verbindlicher Tabelleninhalt und Umgang mit breiten Plänen,
- Kopf-, Fuß- und Metainformationen,
- Dateiname und vorausgewählter Speicherort,
- Verhalten bei einer bereits vorhandenen Datei,
- Umgang mit ungespeicherten oder aus einer Sicherung geladenen Planständen,
- Verhalten bei mehreren Seiten und
- ob neben dem PDF-Export eine direkte Druckfunktion benötigt wird.

## Abgrenzung

Der PDF-Export:

- ist keine allgemeine Datensicherung,
- exportiert keine bearbeitbare Monatsplandatei,
- synchronisiert keine Daten mit externen Diensten,
- ersetzt keine Kompaktansicht und
- definiert noch keine eigenständige Druckvorschau oder direkte Druckfunktion.
