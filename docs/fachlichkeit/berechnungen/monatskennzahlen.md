# Zeitbezogene Monatskennzahlen

Dieses Dokument beschreibt die verbindlichen zeitbezogenen Monatssummen und
Zuschläge. Sie werden für jeden im Monatsplan gespeicherten Mitarbeiter nach
denselben Formeln berechnet.

## Arbeitszeit mit Nachtbereitschaft

Für jeden einzelnen Planungseintrag gilt zunächst:

`Arbeitszeit (mit NB) = reine Arbeitszeit + Nachtbereitschaft`

Die monatliche Arbeitszeit mit Nachtbereitschaft ist anschließend:

`Summe der Arbeitszeit (mit NB) aller Planungseinträge des Mitarbeiters`

- Jeder Planungseintrag trägt seinen gespeicherten Wert einmal bei.
- Leere Planungszellen tragen `0` Minuten bei.
- Da ganze Minuten addiert werden, findet keine weitere Rundung statt.
- Die Monatskennzahl ist nicht mit der monatlichen Ist-Arbeitszeit
  gleichzusetzen.

## Einfache Monatssummen

Folgende Zeitwerte werden unabhängig voneinander summiert:

- `Monatliche reine Arbeitszeit = Summe der reinen Arbeitszeit`
- `Monatliche Nachtbereitschaft = Summe der Nachtbereitschaft`
- `Monatliche Nachtarbeit = Summe der Nachtarbeit`

Ein Planungseintrag kann gleichzeitig zu mehreren Summen beitragen. Verwendet
werden ausschließlich seine gespeicherten Snapshot-Werte. Leere Zellen tragen
jeweils `0` Minuten bei; eine weitere Rundung findet nicht statt.

## Arbeitszeit an Sonntagen und Feiertagen

Arbeitszeit an Sonntagen und gesetzlichen Feiertagen in Brandenburg wird in
einer gemeinsamen Monatskennzahl geführt.

- Berücksichtigt wird ein Plantag, wenn er Sonntag oder gesetzlicher Feiertag
  ist.
- Ein Sonntag, der zugleich Feiertag ist, wird nur einmal berücksichtigt.
- Ein Feiertag wird unabhängig von seinem Wochentag berücksichtigt.
- Ein gewöhnlicher Samstag besitzt keine Sonderwirkung.
- Jeder berücksichtigte Planungseintrag trägt ausschließlich seine reine
  Arbeitszeit bei.
- Anwesenheitszeit, Arbeitszeit mit Nachtbereitschaft, Nachtbereitschaft und
  Nachtarbeit werden nicht zusätzlich eingerechnet.
- Die bereits ganzzahligen Minutenwerte werden ohne weitere Rundung addiert.

Die Berechnung wertet die fachliche Bedeutung eines Kürzels nicht aus. Jeder
Eintrag mit positiver reiner Arbeitszeit trägt seinen Wert bei. Soll eine
Eintragsart nichts zu dieser Kennzahl beitragen, muss ihre reine Arbeitszeit
`0` Minuten betragen. Diese fehlende semantische Unterscheidung ist eine
bewusste Begrenzung des Prototyps.

Der vollständige Zeitwert wird dem Kalendertag der Planungszelle zugerechnet.
Auch bei einem Dienst über Mitternacht findet keine zeitanteilige Verteilung
auf den Folgetag statt.

## Nachtzuschlag

Der Nachtzuschlag ist eine Zeitgutschrift in ganzen Minuten:

`Nachtzuschlag = Rundung(monatliche Nachtarbeit × 20 %)`

- Zuerst wird die gesamte Nachtarbeit des Monats summiert.
- Anschließend werden `20 %` dieser Monatssumme berechnet.
- Das Ergebnis wird genau einmal auf eine volle Minute gerundet.
- Der Nachtzuschlag ist kein Geldbetrag.
- Er bleibt eine eigene Kennzahl und fließt nicht in die monatliche
  Ist-Arbeitszeit ein.

## Nachtbereitschaftszuschlag

Der Nachtbereitschaftszuschlag ist ebenfalls eine Zeitgutschrift in ganzen
Minuten:

`Nachtbereitschaftszuschlag = Rundung(monatliche Nachtbereitschaft × 25 %)`

- Zuerst wird die gesamte Nachtbereitschaft des Monats summiert.
- Anschließend werden `25 %` dieser Monatssumme berechnet.
- Das Ergebnis wird genau einmal auf eine volle Minute gerundet.
- Der Zuschlag ist kein Geldbetrag.
- Er fließt vollständig in die monatliche Ist-Arbeitszeit ein.

## Rollenbezug

Die Formeln dieses Dokuments sind rollenunabhängig. Sie werden ausschließlich
aus den Kalenderdaten, dem Mitarbeiter-Snapshot und den Planungseintrag-
Snapshots des Monatsplans gebildet.

Eine Rollenprüfung innerhalb einer Fachfunktion ist nur zulässig, wenn dafür
eine ausdrückliche Fachregel besteht. Das gilt beispielsweise für die
Zuordnung einer Rufbereitschaft, nicht aber für die allgemeinen Monatssummen.
