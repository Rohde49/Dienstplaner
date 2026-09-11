# Kalender und Arbeitstage

## Kalendergrundlage

- Ein Dienstplan umfasst immer sämtliche Kalendertage des ausgewählten gregorianischen Monats.
- Die Kalendertage werden in chronologischer Reihenfolge geführt.
- Das interne Datumsformat ist `JJJJ-MM-TT`.
- Die Bestimmung eines Kalendertages erfolgt unabhängig von Uhrzeit, lokaler Zeitzone und Sommerzeit. Dadurch darf sich ein Datum bei der Berechnung nicht verschieben.
- Samstag und Sonntag gelten als Wochenende.
- Wochenenden und Feiertage bleiben im Dienstplan enthalten und können wie andere Kalendertage beplant werden. Sie werden lediglich gesondert gekennzeichnet und bei davon abhängigen Berechnungen entsprechend berücksichtigt.

## Gesetzliche Feiertage in Brandenburg

Für die Kalender- und Arbeitstagsberechnungen werden ausschließlich die regelmäßig wiederkehrenden gesetzlichen Feiertage des Landes Brandenburg berücksichtigt. Grundlage ist § 2 Absatz 1 des Brandenburger Feiertagsgesetzes; die Liste wurde am 10. September 2026 mit der amtlich veröffentlichten aktuellen Fassung abgeglichen.

| Feiertag | Datum beziehungsweise Berechnung |
| --- | --- |
| Neujahr | 1. Januar |
| Karfreitag | zwei Tage vor Ostersonntag |
| Ostersonntag | berechneter Ostersonntag |
| Ostermontag | ein Tag nach Ostersonntag |
| Tag der Arbeit | 1. Mai |
| Christi Himmelfahrt | 39 Tage nach Ostersonntag |
| Pfingstsonntag | 49 Tage nach Ostersonntag |
| Pfingstmontag | 50 Tage nach Ostersonntag |
| Tag der Deutschen Einheit | 3. Oktober |
| Reformationstag | 31. Oktober |
| 1. Weihnachtsfeiertag | 25. Dezember |
| 2. Weihnachtsfeiertag | 26. Dezember |

Die beweglichen Feiertage werden aus dem Ostersonntag des jeweiligen Jahres berechnet.

Nicht automatisch berücksichtigt werden:

- Feiertage anderer Bundesländer,
- Gedenk- und Trauertage,
- sonstige religiöse Feiertage und
- einmalige, durch Rechtsverordnung bestimmte Sondertage.

Wird ein einmaliger Sondertag für die Dienstplanung relevant, muss die Feiertagsgrundlage der Anwendung ausdrücklich aktualisiert werden.

## Kalendarische Arbeitstage

Ein **kalendarischer Arbeitstag** ist ein Montag, Dienstag, Mittwoch, Donnerstag oder Freitag, sofern der betreffende Tag kein gesetzlicher Feiertag in Brandenburg ist.

Die monatliche Arbeitstagszahl entspricht somit der Anzahl aller Tage von Montag bis Freitag abzüglich der gesetzlichen Feiertage, die auf einen dieser Wochentage fallen.

- Die kalendarische Arbeitstagszahl ist für alle Mitarbeiter gleich.
- Urlaub, Krankheit, tatsächliche Dienstplanbelegung, Beschäftigungsbeginn und die persönliche Verteilung der Arbeitszeit verändern diese Kalendergröße nicht.
- Ein Feiertag am Samstag oder Sonntag reduziert die Arbeitstagszahl nicht zusätzlich.
- Fällt ein Feiertag auf ein Wochenende, entsteht kein Ersatzarbeitstag.
- Der Begriff `Werktag` wird für diese Berechnung vermieden, weil er auch den Samstag umfassen kann.

## Mehrere Feiertage an einem Datum

- Ein Datum bleibt auch dann genau ein Kalendertag, wenn mehrere gesetzliche Feiertage darauf fallen.
- Bei der Arbeitstagsberechnung wird dieser Kalendertag höchstens einmal ausgeschlossen.
- Alle auf das Datum zutreffenden Feiertagsbezeichnungen bleiben erhalten und werden gemeinsam angezeigt.
- Keine Feiertagsbezeichnung darf eine andere Bezeichnung desselben Datums überschreiben.

## Gültige Kalenderauswahl

- Der ausgewählte Monat muss eine ganze Zahl von `1` bis `12` sein.
- Das ausgewählte Jahr muss ein gültiges, von der Anwendung zugelassenes gregorianisches Kalenderjahr sein.
- Die Kalender- und Feiertagsberechnungen müssen für jedes Jahr funktionieren, das in der Anwendung ausgewählt werden kann.
- Ein konkreter in der Bedienoberfläche angebotener Jahresbereich ist keine Berechnungsregel. Er wird bei der fachlichen Festlegung der Planungsseite bestimmt.

## Automatische Vollständigkeit eines Monatsplans

- Beim regulären Anlegen eines Monatsplans erzeugt die Anwendung automatisch für jeden Kalendertag des ausgewählten Monats genau einen Plantag.
- Dadurch enthält ein regulär erzeugter Monatsplan sämtliche Kalendertage des Monats und keine doppelten Datumswerte.
- Es wird keine zusätzliche fachliche Regel eingeführt, nach der ein gespeicherter Monatsplan wegen fehlender oder doppelter Plantage ausdrücklich abgelehnt werden muss.
- Das Verhalten bei beschädigten oder manuell veränderten gespeicherten Daten ist keine eigene fachliche Berechnungsregel und wird bei der technischen Umsetzung behandelt.
- Insbesondere wird das zufällige Auswahlverhalten des Altsystems bei doppelten Datumswerten nicht als gewünschtes Fachverhalten übernommen.
