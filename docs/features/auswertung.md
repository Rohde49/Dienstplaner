# Auswertung

Die Auswertung verdichtet einen Monatsplan zu nachvollziehbaren Kennzahlen für
die Teamleitung. Sie ergänzt das unmittelbare Feedback der Planungsseite um
eine ausführliche, mitarbeiterbezogene Darstellung.

## Zweck und Umfang

Die Auswertung soll:

- alle im Monatsplan gespeicherten Mitarbeiter berücksichtigen,
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

Die allgemeinen Berechnungen sind rollenunabhängig. Die ausführliche Auswertung
führt jeden im Monatsplan enthaltenen Mitarbeiter unabhängig von seiner
Snapshot-Rolle auf.

Rollenabhängige Einschränkungen gelten nur für fachliche Vorgänge, für die eine
ausdrückliche Regel besteht. So darf eine Rufbereitschaft ausschließlich einem
Mitarbeiter mit der im Plan gespeicherten Rolle `Erzieher` zugeordnet sein; die
übrigen Kennzahlen werden deshalb nicht auf Erzieher beschränkt.

## Dargestellte Informationen

### Monatsbezogene Grundlage

- Monat und Jahr des ausgewerteten Plans,
- Plantitel und
- kalendarische Arbeitstagszahl.

### Tagesbezogene Kennzahlen je Mitarbeiter

- Anzahl der SN/F-Dienste,
- Anzahl der freien Tage,
- Anzahl der freien Samstage,
- Anzahl der freien Sonntage und
- Anzahl der Rufbereitschaften.

### Zeitbezogene Kennzahlen je Mitarbeiter

- Arbeitszeit mit Nachtbereitschaft,
- reine Arbeitszeit,
- Nachtbereitschaft,
- Nachtarbeit,
- reine Arbeitszeit an Sonntagen und Feiertagen,
- Nachtzuschlag,
- Nachtbereitschaftszuschlag,
- Soll-Arbeitszeit,
- Ist-Arbeitszeit und
- Soll-/Ist-Differenz.

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

- Mitarbeiter werden mit ihrem im Monatsplan gespeicherten Namen und ihrer
  Snapshot-Rolle bezeichnet.
- Zeitdauern werden einheitlich in Stunden und Minuten dargestellt.
- Positive und negative Soll-/Ist-Abweichungen bleiben auch ohne Farberkennung
  anhand ihres Vorzeichens verständlich.
- Ein exakter Ausgleich wird ohne Vorzeichen angezeigt.
- Große Wertemengen werden als lesbare Tabelle oder gleichwertig strukturierte
  Darstellung präsentiert.
- Die Auswertung nutzt die verfügbare Inhaltsbreite, ohne die Zuordnung zwischen
  Mitarbeiter und Kennzahl beim Scrollen zu verlieren.

## Fehlerverhalten

Ein ungültiger oder unvollständiger Monatsplan wird nicht teilweise
ausgewertet. Kann die Berechnung nicht zuverlässig durchgeführt werden, wird
ein verständlicher Fehler angezeigt.

## Noch fachlich festzulegen

Vor der konkreten Oberflächengestaltung sind insbesondere festzulegen:

- die endgültige Gruppierung und Reihenfolge der Kennzahlen,
- die genaue Anordnung der Mitarbeiter und Werte,
- mögliche Ein- und Ausblendungen für große Tabellen und
- der konkrete Zugang von der Planungsseite zur ausführlichen Auswertung.

## Abgrenzung

Die Auswertung:

- verändert den Monatsplan nicht,
- speichert keine parallelen Ergebnisdaten,
- ersetzt keine arbeitsrechtliche oder vertragliche Prüfung,
- erfindet keine Bedeutung aus frei vergebenen Kürzeln und
- ist keine verbindliche Druck- oder PDF-Ausgabe.
