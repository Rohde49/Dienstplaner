# Auswertung

Die Auswertung verdichtet einen Monatsplan zu nachvollziehbaren Kennzahlen für
die Teamleitung. Sie ergänzt das unmittelbare Feedback der Planungsseite um
eine ausführliche, mitarbeiterbezogene Darstellung.

## Zweck und Umfang

Die Auswertung soll:

- die im Monatsplan gespeicherten Erzieher berücksichtigen,
- Tageszähler und zeitbezogene Monatswerte übersichtlich zusammenführen,
- Soll, Ist und Abweichung verständlich gegenüberstellen,
- auf dem aktuell betrachteten Monatsplanstand beruhen und
- keine eigene, abweichende Berechnungslogik enthalten.

Die dauerhaft sichtbaren Kennzahlen in der
[Planungsseite](./planungsseite.md) bleiben das direkte Feedback während der
Bearbeitung. Die ausführliche Auswertung ergänzt sie und ersetzt sie nicht.

## Datengrundlage

Die Auswertung wird vollständig aus einem gültigen Monatsplan berechnet. Sie
verwendet:

- den Zeitraum des Plans,
- die gespeicherten Mitarbeiter-Snapshots,
- die vollständigen Kalendertage,
- die Planungseintrag-Snapshots und
- die Rufbereitschaften.

Aktuelle Mitarbeiter- oder Eintragsarten-Stammdaten werden nicht nachgeladen,
um bestehende Pläne neu zu interpretieren. Dadurch bleibt die Auswertung auch
nach späteren Änderungen oder Löschungen von Stammdaten stabil.

Die Ergebnisse werden bei Bedarf neu berechnet und nicht als eigener
Auswertungsstand gespeichert.

## Auswertungskreis

Die allgemeinen Berechnungen bleiben rollenunabhängig. Der Auswertungsdialog
zeigt ausschließlich Mitarbeiter mit der im Monatsplan gespeicherten Rolle
`Erzieher`. Die Auswahl verändert weder die Berechnung noch den Monatsplan.
Enthält der Plan keinen Erzieher, zeigt der Dialog einen verständlichen
Leerzustand.

## Dargestellte Informationen

Plantitel und Monat/Jahr kennzeichnen den ausgewerteten Plan. In der Tabelle
stehen die Erzieher spaltenweise in Planreihenfolge und genau diese Kennzahlen
zeilenweise:

1. Anzahl SN/F
2. Anzahl freier Tage
3. Anzahl freier Samstage
4. Anzahl freier Sonntage
5. reine Arbeitszeit gesamt
6. Nachtbereitschaft gesamt
7. +Nachtbereitschaft 25 %
8. Anzahl Rufbereitschaften
9. Anzahl Arbeitstage
10. Ist-Arbeitszeit
11. Soll-Arbeitszeit
12. Differenz Soll/Ist

„Anzahl Arbeitstage“ ist die kalendarische Arbeitstagszahl des vollständigen
Monats. Sie ist für alle Mitarbeiter gleich und bildet die Grundlage der
Soll-Arbeitszeit. Andere berechnete Kennzahlen bleiben in den Fachfunktionen
verfügbar, erscheinen aber nicht in diesem Dialog.

Die Auswertung zeigt ausschließlich Ergebnisse. Die dafür geltenden Formeln,
Rundungszeitpunkte und Zählregeln stehen unter
[Tagesbezogene Kennzahlen](../fachlichkeit/berechnungen/tageskennzahlen.md),
[Zeitbezogene Monatskennzahlen](../fachlichkeit/berechnungen/monatskennzahlen.md)
und [Soll-Ist-Auswertung](../fachlichkeit/berechnungen/soll-ist-auswertung.md).

## Verhalten bei Entwurfsänderungen

Wird die Auswertung während der Bearbeitung eines Monatsplans angezeigt, wird
sie aus dem aktuellen Entwurf berechnet und reagiert unmittelbar auf:

- gesetzte, ersetzte oder entfernte Planungseinträge,
- geänderte Rufbereitschaften und
- andere auswertungsrelevante Änderungen des Plans.

Ein ungespeicherter Entwurf muss dabei eindeutig als solcher erkennbar bleiben.
Die Anzeige einer Auswertung bestätigt nicht, dass der zugrunde liegende Plan
bereits dauerhaft gespeichert wurde.

## Darstellung

- Mitarbeiter werden mit ihrem im Monatsplan gespeicherten Namen bezeichnet.
  Durch den festgelegten Auswertungskreis ist ihre Snapshot-Rolle eindeutig.
- Zeitdauern werden einheitlich in Stunden und Minuten dargestellt.
- Positive und negative Soll-/Ist-Abweichungen bleiben auch ohne Farberkennung
  anhand ihres Vorzeichens verständlich. Negative Werte werden zusätzlich rot,
  positive Werte grün und ausgeglichene Werte neutral dargestellt.
- Die Anzahl freier Tage wird mit dem monatsweiten Ziel aus Kalendertagen
  abzüglich Arbeitstagen verglichen. Ein noch nicht erreichtes Ziel erscheint
  gelb, ein exakt erreichtes Ziel grün und eine Überschreitung rot.
- Ein exakter Ausgleich wird ohne Vorzeichen angezeigt.
- Die im Monatsplan gespeicherte Mitarbeiterfarbe kennzeichnet den jeweiligen
  Tabellenkopf wie in der Planungstabelle.
- Je eine einzelne, dezente Abschnittslinie gliedert Dienst- und Freitage,
  Zeitwerte sowie den Soll-Ist-Bereich. An diesen Grenzen wird keine normale
  Zeilenlinie zusätzlich dargestellt. Der Soll-Ist-Bereich ist zurückhaltend
  hervorgehoben.
- Eine dezente Hervorhebung der Tabellenzeile unterstützt den Vergleich beim
  Bewegen der Maus, ohne die dauerhaft sichtbaren Mitarbeiterfarben zu
  überlagern.
- Der Tabellenrahmen ist abgerundet; innere Linien bleiben schwächer als die
  Abschnittstrenner und der äußere Rahmen.
- Feine neutrale vertikale Linien trennen die Mitarbeiterspalten. Die
  Mitarbeiterfarben erscheinen als ruhige Kopfflächen ohne zusätzliche
  Farblinien.
- Der Dialog richtet seine Breite am Tabelleninhalt aus und bleibt so kompakt
  wie möglich. Die Kennzahlenspalte und die Mitarbeiterspalten verwenden nur
  die benötigte Breite; Namen dürfen innerhalb ihrer Spalte umbrechen.
- Alle zwölf Kennzahlen und alle Erzieher-Spalten sind beim Öffnen vollständig
  ohne Bildlauf sichtbar.

„Auswertung“ in der Werkzeugleiste der Planungsseite öffnet den zentralen
Dialog für den aktuell geöffneten Monatsplan. Ohne geöffneten Plan bleibt die
Aktion deaktiviert. Sie ist außerdem in der Kompaktansicht deaktiviert, weil
dort der gespeicherte Ausgangsstand sichtbar ist, während die Auswertung den
aktuellen Entwurf verwendet. Ein leicht unscharfer Hintergrund und die modale
Bedienung halten die Planungsseite währenddessen unverändert. Nach dem Schließen
bleiben Entwurf, Zeitraum, Scrollstand und Leistenstatus erhalten. Der Dialog
ist mit Maus und Tastatur bedienbar.

## Fehlerverhalten

Ein ungültiger oder unvollständiger Monatsplan wird nicht teilweise
ausgewertet. Kann die Berechnung nicht zuverlässig durchgeführt werden, wird
ein verständlicher Fehler angezeigt.

## Abgrenzung

Die Auswertung:

- verändert den Monatsplan nicht,
- speichert keine parallelen Ergebnisdaten,
- ersetzt keine arbeitsrechtliche oder vertragliche Prüfung,
- erfindet keine Bedeutung aus frei vergebenen Kürzeln und
- ist keine verbindliche Druck- oder PDF-Ausgabe.
