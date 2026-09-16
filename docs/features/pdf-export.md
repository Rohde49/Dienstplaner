# PDF-Export

Der PDF-Export soll den gespeicherten Stand eines geöffneten Monatsplans als
verlässliche lokale Datei ausgeben. Er verwendet dasselbe A4-Dokumentlayout wie
die [Kompaktansicht](./kompaktansicht.md), ergänzt dieses aber um Dateierzeugung,
Speicherablauf und Rückmeldungen.

## Zweck und Umfang

Der Export soll:

- das in der Kompaktansicht geprüfte Dokumentlayout unverändert als PDF
  ausgeben,
- die benötigten Planinformationen vollständig und lesbar darstellen,
- ausschließlich lokal und ohne Server- oder Cloud-Dienst funktionieren,
- einen nachvollziehbaren Speicherort beziehungsweise Dateidialog verwenden
  und
- Erfolg, Abbruch oder Fehler verständlich zurückmelden.

Die Kompaktansicht bleibt die zugehörige Bildschirmvorschau. Der PDF-Export ist
der davon getrennte Vorgang, der eine Datei erzeugt.

## Datengrundlage

Die PDF-Datei verwendet ausschließlich den regulär gespeicherten Ausgangsstand
des geöffneten Monatsplans. Ungespeicherte Entwurfsänderungen werden nicht
exportiert.

Ein aus einer Sicherungsdatei wiederhergestellter Stand muss zuerst
ausdrücklich gespeichert werden. Erst danach darf er als regulärer Planstand
exportiert werden.

Die Ausgabe verwendet die im Plan gespeicherten:

- Mitarbeiter-Snapshots einschließlich Reihenfolge, Farben und
  Wochenarbeitszeiten,
- Kalendertage,
- Planungseintrag-Snapshots,
- Rufbereitschaften und
- Bemerkungen.

Kalendermerkmale sowie Ist- und Sollwerte werden mit denselben gemeinsamen
Funktionen ermittelt wie in der Anwendung. Aktuelle Stammdaten dürfen einen
älteren gespeicherten Plan nicht verändern.

Die PDF-Datei ist eine abgeleitete Ausgabe. Sie gehört nicht zur primären
[Datenhaltung](../architektur/datenhaltung.md) und verändert den Monatsplan
nicht.

## Gemeinsames Dokumentlayout

Kompaktansicht und PDF verwenden dieselbe Dokumentdarstellung. Verbindlich sind
insbesondere:

- eine A4-Seite im Hochformat,
- identische Spalten, Zeilen, Inhalte und Umbrüche,
- Plantitel, Monat/Jahr und Speicherdatum,
- die kompakte Monatsplantabelle,
- Feiertagslegende,
- die Abschlusszeilen `Ist`, `Soll` und `h/Woche` sowie
- der Bereich `Datum` und `Freigabe / Unterschrift`.

Die vollständigen Darstellungsregeln stehen in der
[Kompaktansicht](./kompaktansicht.md) und werden hier nicht dupliziert.

Der aktuelle Zielumfang ist eine lesbare Seite mit bis zu neun
Mitarbeiterspalten und 31 Kalendertagen. Passt ein Plan trotz zulässiger
Skalierung nicht vollständig und lesbar auf diese Seite, wird der Export
verhindert. Inhalte werden weder abgeschnitten noch verborgen.

Eine spätere Erweiterung darf breitere Pläne kontrolliert auf mehrere Seiten
verteilen. Die dafür notwendigen Regeln werden erst vor diesem späteren
Arbeitspaket festgelegt.

## Bedien- und Fehlerverhalten

- Eine funktionsfähige Exportaktion wird erst angeboten, wenn Dateierzeugung
  und Speicherablauf vollständig umgesetzt sind. Bis dahin bleibt `Export` in
  der Planungswerkzeugleiste als nicht verfügbar gekennzeichneter Platzhalter
  deaktiviert.
- Der Export ist nur für einen regulär gespeicherten, geöffneten Monatsplan
  verfügbar.
- Während der Erzeugung wird ein eindeutiger Beschäftigtzustand angezeigt und
  ein Mehrfachauslösen verhindert.
- Ein erfolgreicher Export wird knapp bestätigt.
- Ein abgebrochener Dateidialog gilt nicht als Fehler und erzeugt keine falsche
  Erfolgsmeldung.
- Ein fehlgeschlagener Export lässt den Monatsplan unverändert und erklärt die
  Ursache soweit möglich verständlich.
- Ein Plan, der die festgelegte A4-Passung überschreitet, erhält denselben
  dauerhaften Hinweis wie in der Kompaktansicht und kann nicht exportiert
  werden.

## Qualitätsanforderungen

Die erzeugte PDF-Datei muss:

- visuell und inhaltlich der Kompaktansicht entsprechen,
- alle vorgesehenen Inhalte vollständig und lesbar enthalten,
- Mitarbeiter, Tage und Planungseinträge eindeutig zuordnen,
- Wochenenden und Feiertage nicht ausschließlich über Farbe kennzeichnen,
- auf einem üblichen PDF-Betrachter ohne externe Ressourcen funktionieren und
- bei identischem gespeicherten Planstand fachlich identische Inhalte liefern.

Die Prüfung muss neben dem erfolgreichen Erzeugen auch das tatsächlich
gerenderte Dokument kontrollieren. Typprüfung, Build oder eine korrekt
angezeigte Bildschirmvorschau allein belegen noch keine korrekte PDF-Datei.

## Noch festzulegen

Vor der späteren Exportumsetzung sind noch zu entscheiden:

- Dateiname,
- vorausgewählter Speicherort,
- Verhalten bei einer bereits vorhandenen Datei und
- ob zusätzlich eine direkte Druckfunktion benötigt wird.

## Abgrenzung

Der PDF-Export:

- ist keine allgemeine Datensicherung,
- exportiert keine bearbeitbare Monatsplandatei,
- synchronisiert keine Daten mit externen Diensten,
- definiert keine zweite unabhängige Dokumentdarstellung und
- umfasst zunächst weder direkte Druckfunktion noch mehrseitige Ausgabe.
