# Zeitbezogene Monatskennzahlen

## Monatliche Arbeitszeit (mit NB)

Die monatliche Arbeitszeit (mit NB) eines Mitarbeiters wird durch Addition der berechneten Arbeitszeit (mit NB) aller seiner Planungseinträge im Monatsplan gebildet:

`Monatliche Arbeitszeit (mit NB) = Summe der Arbeitszeit (mit NB) aller Planungseinträge des Mitarbeiters`

- Für jeden Planungseintrag gilt zuvor: `Arbeitszeit (mit NB) = reine Arbeitszeit + Nachtbereitschaft`.
- Jeder Planungseintrag trägt diesen berechneten und im Snapshot gespeicherten Wert zur Monatssumme bei.
- Leere Planungszellen tragen `0` Minuten bei.
- Reine Arbeitszeit und Nachtbereitschaft werden zusätzlich als eigenständige Zeitwerte getrennt ausgewertet.
- Da ausschließlich bereits ganzzahlige Minutenwerte addiert werden, ist für diese Summe keine weitere Rundung erforderlich.

## Einfache zeitbezogene Monatssummen

Reine Arbeitszeit, Nachtbereitschaft und Nachtarbeit werden für jeden Mitarbeiter jeweils als eigenständige Monatssumme gebildet:

- `Monatliche reine Arbeitszeit = Summe der reinen Arbeitszeit aller Planungseinträge`
- `Monatliche Nachtbereitschaft = Summe der Nachtbereitschaft aller Planungseinträge`
- `Monatliche Nachtarbeit = Summe der Nachtarbeit aller Planungseinträge`

Für alle drei Summen gilt:

- Jeder Planungseintrag trägt seinen entsprechenden Snapshot-Wert genau einmal bei.
- Leere Planungszellen tragen `0` Minuten bei.
- Die drei Zeitarten werden unabhängig voneinander summiert. Ein Planungseintrag kann deshalb gleichzeitig zu mehreren Monatssummen beitragen.
- Es werden ausschließlich bereits ganzzahlige Minutenwerte addiert; eine weitere Rundung findet nicht statt.
- Spätere Änderungen einer Eintragsdefinition verändern die gespeicherten Snapshot-Werte und damit bestehende Monatssummen nicht rückwirkend.

## Gemeinsame Kennzahl für Sonntage und gesetzliche Feiertage

Arbeitszeit an Sonntagen und gesetzlichen Feiertagen wird in einer gemeinsamen monatlichen Kennzahl geführt.

- Ein Kalendertag wird berücksichtigt, wenn er ein Sonntag oder ein gesetzlicher Feiertag in Brandenburg ist.
- Ist ein Sonntag zugleich ein gesetzlicher Feiertag, trägt der Planungseintrag dieses Tages nur einmal zur gemeinsamen Summe bei.
- Ein gesetzlicher Feiertag an einem Samstag oder einem anderen Wochentag wird aufgrund seines Feiertagsstatus berücksichtigt.
- Ein gewöhnlicher Samstag ohne Feiertagsstatus besitzt für diese Kennzahl keine Sonderwirkung.
- Es werden keine zusätzlichen getrennten Monatssummen für Sonntage und Feiertage gebildet.
- Jeder berücksichtigte Planungseintrag trägt ausschließlich seine im Snapshot gespeicherte **reine Arbeitszeit** zur gemeinsamen Summe bei.
- Anwesenheitszeit, Arbeitszeit (mit NB), Nachtbereitschaft und Nachtarbeit fließen nicht in diese Kennzahl ein.
- Die bereits ganzzahligen Minutenwerte werden unverändert addiert; eine weitere Rundung findet nicht statt.
- Die Berechnung unterscheidet nicht zwischen tatsächlich gearbeitetem Dienst, Urlaub, Krankheit, Frei oder anderen fachlichen Bedeutungen des Planungseintrags.
- Kürzel und Bezeichnung des Planungseintrags beeinflussen die Zeitberechnung nicht.
- Jeder Eintrag mit positiver reiner Arbeitszeit trägt seinen Wert bei. Soll eine Eintragsdefinition für diese Kennzahl keine Zeit beitragen, muss ihre reine Arbeitszeit `0` betragen.
- Diese fehlende semantische Unterscheidung ist eine bewusste Vereinfachung des Prototyps. Eine spätere Weiterentwicklung kann dafür ausdrücklich klassifizierte Eintragsarten verwenden.
- Jeder Planungseintrag ist genau einem Kalendertag zugeordnet. Für die Sonntags-/Feiertagskennzahl ist ausschließlich dieser Kalendertag der Planungszelle maßgeblich.
- Auch wenn Beginn und Ende einen Dienst über Mitternacht darstellen, wird die vollständige reine Arbeitszeit dem einen zugeordneten Kalendertag zugerechnet. Eine zeitanteilige Verteilung auf den Folgetag findet nicht statt.
- Beginnt der dargestellte Dienst beispielsweise am Sonntag und endet laut Uhrzeit am Montag, wird seine vollständige reine Arbeitszeit dem Sonntag zugerechnet. Ein am gewöhnlichen Samstag zugeordneter Eintrag wird umgekehrt nicht allein deshalb berücksichtigt, weil seine Enduhrzeit am Sonntag liegt.

## Nachtzuschlag

Der Nachtzuschlag eines Mitarbeiters wird als Zeitgutschrift in ganzen Minuten aus seiner gesamten monatlichen Nachtarbeit berechnet:

`Nachtzuschlag = Rundung(monatliche Nachtarbeit × 20 %)`

- Berechnungsgrundlage ist die bereits gebildete Summe der Nachtarbeit aller Planungseinträge des Mitarbeiters im Kalendermonat.
- Der Prozentsatz wird nicht für jeden einzelnen Planungseintrag angewendet. Zuerst wird die monatliche Nachtarbeit vollständig summiert, anschließend werden `20 %` berechnet.
- Das Ergebnis wird danach genau einmal nach der allgemeinen Rundungsmethode auf eine volle Minute gerundet.
- Der Nachtzuschlag ist eine Zeitgutschrift in Minuten und kein Geldbetrag.
- Der Nachtzuschlag wird als eigene Kennzahl berechnet und angezeigt, fließt aber nicht in die monatliche Ist-Arbeitszeit ein.

## Nachtbereitschaftszuschlag

Der Nachtbereitschaftszuschlag eines Mitarbeiters wird als Zeitgutschrift in ganzen Minuten aus seiner gesamten monatlichen Nachtbereitschaft berechnet:

`Nachtbereitschaftszuschlag = Rundung(monatliche Nachtbereitschaft × 25 %)`

- Berechnungsgrundlage ist die bereits gebildete Summe der Nachtbereitschaft aller Planungseinträge des Mitarbeiters im Kalendermonat.
- Der Prozentsatz wird nicht für jeden einzelnen Planungseintrag angewendet. Zuerst wird die monatliche Nachtbereitschaft vollständig summiert, anschließend werden `25 %` berechnet.
- Das Ergebnis wird danach genau einmal nach der allgemeinen Rundungsmethode auf eine volle Minute gerundet.
- Der Nachtbereitschaftszuschlag ist eine Zeitgutschrift in Minuten und kein Geldbetrag.
- Der Nachtbereitschaftszuschlag fließt nach der festgelegten Ist-Formel vollständig in die monatliche Ist-Arbeitszeit ein.

## Rollenbezug der zeitbezogenen Kennzahlen

### Berechnungsregel

Die Berechnungsformeln der zeitbezogenen Monatskennzahlen sind **rollenunabhängig**. Sie werden für einen Mitarbeiter ausschließlich aus dessen Kalendertagen, Mitarbeiter-Snapshot und Planungseintrag-Snapshots gebildet und enthalten selbst keine Prüfung der Mitarbeiterrolle.

Dies gilt für:

- Arbeitszeit (mit NB),
- reine Arbeitszeit,
- Nachtbereitschaft,
- Nachtarbeit,
- Arbeitszeit an Sonntagen und gesetzlichen Feiertagen,
- Nachtzuschlag und
- Nachtbereitschaftszuschlag,
- Soll-Arbeitszeit,
- Ist-Arbeitszeit sowie
- Soll-/Ist-Differenz.

- Die Formeln können unabhängig von der Rolle auf jeden Mitarbeiter des Monatsplans angewendet werden.
- Die bereits festgelegte rollenunabhängige Berechnung und Anzeige von SN/F-Diensten, freien Tagen, freien Samstagen und freien Sonntagen bleibt davon unberührt.
- Eine Rollenprüfung innerhalb einer Fachfunktion ist nur zulässig, wenn dafür eine ausdrückliche fachliche Rollenregel besteht. Dies gilt beispielsweise für die Zuordnung einer Rufbereitschaft zu einem Erzieher, nicht aber für die allgemeinen Monatsformeln.

### Darstellungsregel

- Die vorgesehene zeitbezogene Auswertung führt Mitarbeiter aller im Monatsplan
  gespeicherten Rollen auf.
- Soll-Arbeitszeit, Ist-Arbeitszeit und Soll-/Ist-Differenz werden insbesondere
  für Erzieher, Wirtschaftskräfte und Praktikanten nach denselben Formeln
  berechnet und angezeigt.
- Welche dieser und weiterer Kennzahlen eine konkrete Seite an welcher Stelle
  hervorhebt, wird bei der betreffenden Oberfläche festgelegt. Die
  Planungsseite zeigt beispielsweise im Mitarbeiterkopf eine bewusst kleinere,
  rollenabhängig ausgewählte Kennzahlenmenge.
- Die Auswahl sichtbarer Kennzahlen einer Oberfläche ist eine Darstellungsregel
  und erzeugt keine Rollenabhängigkeit der Berechnungsformeln.
