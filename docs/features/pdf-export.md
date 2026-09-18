# PDF-Export

Der PDF-Export gibt den gespeicherten Stand eines geöffneten Monatsplans als
verlässliche lokale Datei aus. Er verwendet dasselbe A4-Dokumentlayout wie
die [Kompaktansicht](./kompaktansicht.md), ergänzt dieses aber um Dateierzeugung,
Speicherablauf und Rückmeldungen.

Die erste einseitige Umsetzung ist abgeschlossen und technisch sowie visuell
abgenommen. Eine direkte Druckfunktion und eine mehrseitige Ausgabe bleiben
außerhalb dieses Stands.

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
- gelb gekennzeichnete Brandenburger Schulferien mit sichtbarem Beginn und Ende,
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

- Die Exportaktion steht in der ausgeklappten Planungswerkzeugleiste rechts
  neben `Plan | Kompakt` und wird ausschließlich in der aktiven
  Kompaktansicht angezeigt.
- Im Normalzustand lautet ihre sichtbare Beschriftung `Export`; zugänglicher
  Name und Tooltip lauten `Dienstplan als PDF exportieren`.
- Vor dem Export muss die Passungsprüfung abgeschlossen sein. Während der
  Messung und bei A4-Überlauf bleibt die Aktion deaktiviert. Bei Überlauf
  erklärt der vorhandene dauerhafte Hinweis der Kompaktansicht die Ursache.
- Bestehen ungespeicherte Entwurfsänderungen, fragt ein Dialog
  `Gespeicherten Stand exportieren?`. Er erklärt, dass ausschließlich der
  zuletzt gespeicherte Stand exportiert wird und der Entwurf erhalten bleibt.
- Ohne ungespeicherte Änderungen öffnet die Exportaktion direkt den nativen
  Speicherdialog.
- Nach Auswahl des Zielpfads zeigt die Aktion einen Spinner und
  `PDF wird erstellt …`. Export, Ansichtswechsel und planwechselnde Aktionen
  bleiben bis zum Abschluss deaktiviert.
- Ein erfolgreicher Export wird kurz mit `PDF wurde gespeichert.` bestätigt.
- Der Abbruch des Bestätigungs- oder Speicherdialogs gilt nicht als Fehler und
  erzeugt keine Meldung.
- Ein fehlgeschlagener Export lässt Monatsplan und Entwurf unverändert. Ein
  dauerhafter Hinweis oberhalb der Kompaktansicht nennt den Fehler verständlich
  und die Exportaktion wird für einen erneuten Versuch freigegeben.
- Ein Plan, der die festgelegte A4-Passung überschreitet, erhält denselben
  dauerhaften Hinweis wie in der Kompaktansicht und kann nicht exportiert
  werden.

## Dateiname und Speicherort

Der native Speicherdialog schlägt den Dateinamen
`YYYY-MM - Plantitel.pdf` vor, beispielsweise
`2026-09 - Dienstplan der Regelgruppe.pdf`. Unzulässige Windows-Zeichen werden
im Vorschlag durch einen Bindestrich ersetzt. Ein überlanger Vorschlag wird
sinnvoll gekürzt und die Endung `.pdf` sichergestellt. Der Benutzer kann den
Namen im Dialog ändern.

Beim ersten Export einer App-Sitzung beginnt der Dialog im persönlichen
Windows-Ordner `Dokumente`. Nach einem erfolgreichen Export wird dessen Ordner
für weitere Exporte derselben Sitzung verwendet. Nach einem App-Neustart gilt
wieder `Dokumente`; eine dauerhafte Exportordner-Einstellung ist nicht
Bestandteil der ersten Umsetzung.

Beim Auswählen einer vorhandenen Datei übernimmt der native Windows-Dialog die
Überschreibbestätigung. Ein Abbruch lässt die vorhandene Datei unverändert. Die
Anwendung zeigt keinen zweiten eigenen Überschreibdialog und erzeugt keine
automatischen Namensvarianten.

## Qualitätsanforderungen

Die erzeugte PDF-Datei muss:

- visuell und inhaltlich der Kompaktansicht entsprechen,
- alle vorgesehenen Inhalte vollständig und lesbar enthalten,
- Mitarbeiter, Tage und Planungseinträge eindeutig zuordnen,
- Wochenenden, Feiertage und Schulferien nicht ausschließlich über Farbe
  kennzeichnen,
- auf einem üblichen PDF-Betrachter ohne externe Ressourcen funktionieren und
- bei identischem gespeicherten Planstand fachlich identische Inhalte liefern.

Die Prüfung muss neben dem erfolgreichen Erzeugen auch das tatsächlich
gerenderte Dokument kontrollieren. Typprüfung, Build oder eine korrekt
angezeigte Bildschirmvorschau allein belegen noch keine korrekte PDF-Datei.

Mindestens ein Normalfall mit sechs bis sieben Mitarbeitern und der Grenzfall
mit neun Mitarbeitern und 31 Tagen werden als PDF erzeugt, technisch auf eine
A4-Seite geprüft, in Bilder gerendert und gemeinsam visuell abgenommen.

Für die Abschlussprüfung am 17. September 2026 wurde anstelle des vorgesehenen
Normalfalls ein anspruchsvollerer Plan mit acht Mitarbeitern und 31 Tagen
verwendet und als ausreichender repräsentativer Fall bestätigt. Zusätzlich
wurde der Grenzfall mit neun Mitarbeitern und 31 Tagen geprüft. Beide Dateien
bestanden die technische Seiten- und Inhaltsprüfung, die Kontrolle der
gerenderten Seiten und die Sichtprüfung in einem Windows-PDF-Programm.

## Abgrenzung

Der PDF-Export:

- ist keine allgemeine Datensicherung,
- exportiert keine bearbeitbare Monatsplandatei,
- synchronisiert keine Daten mit externen Diensten,
- definiert keine zweite unabhängige Dokumentdarstellung und
- umfasst weder eine direkte Druckfunktion noch eine mehrseitige Ausgabe.
