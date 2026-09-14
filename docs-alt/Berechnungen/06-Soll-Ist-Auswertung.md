# Soll-Ist-Auswertung

## Monatliche Soll-Arbeitszeit

Die monatliche Soll-Arbeitszeit eines Mitarbeiters wird aus der vom System berechneten Anzahl kalendarischer Arbeitstage des Monats und der im Mitarbeiter-Snapshot des Monatsplans gespeicherten Wochenarbeitszeit gebildet:

`Monatliche Soll-Arbeitszeit = berechnete kalendarische Arbeitstage × Wochenarbeitszeit aus dem Mitarbeiter-Snapshot / 5`

- Die Arbeitstagszahl wird nach der bereits festgelegten Kalenderregel automatisch aus dem vollständigen Kalendermonat berechnet.
- Sie wird nicht vom Benutzer eingegeben.
- Als kalendarische Arbeitstage zählen Montag bis Freitag, sofern der betreffende Tag kein gesetzlicher Feiertag in Brandenburg ist.
- Die berechnete Arbeitstagszahl ist für alle Mitarbeiter desselben Monatsplans gleich.
- Planungseinträge, Urlaub, Krankheit, Rufbereitschaften, Beschäftigungsbeginn und die tatsächliche persönliche Verteilung der Arbeitszeit verändern diese Kalendergröße nicht.
- Mitarbeiterabhängig ist ausschließlich die Wochenarbeitszeit aus dem Mitarbeiter-Snapshot des betreffenden Monatsplans.
- Da die Wochenarbeitszeit verbindlich ohne Rest durch fünf teilbar ist, ergibt bereits `Wochenarbeitszeit / 5` eine ganze Minutenzahl. Auch die Multiplikation mit der ganzzahligen Arbeitstagszahl benötigt keine Rundung.
- Eine Wochenarbeitszeit von `0:00` ist zulässig und erzeugt eine monatliche Soll-Arbeitszeit von `0` Minuten.
- Spätere Änderungen der Wochenarbeitszeit in den Mitarbeiter-Stammdaten verändern die Soll-Arbeitszeit eines bestehenden Monatsplans nicht rückwirkend.

## Monatliche Ist-Arbeitszeit

Die monatliche Ist-Arbeitszeit eines Mitarbeiters wird aus seiner monatlichen reinen Arbeitszeit und seinem Nachtbereitschaftszuschlag gebildet:

`Monatliche Ist-Arbeitszeit = monatliche reine Arbeitszeit + Nachtbereitschaftszuschlag`

- Die monatliche reine Arbeitszeit ist die unveränderte Summe der reinen Arbeitszeit aller Planungseintrag-Snapshots des Mitarbeiters.
- Der Nachtbereitschaftszuschlag beträgt nach der bereits festgelegten Regel einmalig gerundete `25 %` der gesamten monatlichen Nachtbereitschaft.
- Der Nachtzuschlag von `20 %` wird als eigene Zeitgutschrift berechnet und angezeigt, fließt aber nicht in die Ist-Arbeitszeit ein.
- Die vollständige Nachtbereitschaft und die daraus gebildete Arbeitszeit (mit NB) fließen ebenfalls nicht in die Ist-Arbeitszeit ein.
- Nachtarbeit, Arbeitszeit an Sonntagen und gesetzlichen Feiertagen, Anwesenheitszeit, Rufbereitschaften und tagesbezogene Zähler werden nicht zusätzlich zum Ist addiert.
- Beide Summanden liegen bereits als ganze Minutenwerte vor. Nach ihrer Addition findet keine weitere Rundung statt.
- Die monatliche Arbeitszeit (mit NB) bleibt eine von der Ist-Arbeitszeit getrennte Informationskennzahl.

## Soll-/Ist-Differenz

Die monatliche Soll-/Ist-Differenz eines Mitarbeiters wird aus seiner monatlichen Ist-Arbeitszeit und seiner monatlichen Soll-Arbeitszeit gebildet:

`Soll-/Ist-Differenz = monatliche Ist-Arbeitszeit − monatliche Soll-Arbeitszeit`

- Ein positiver Wert bedeutet, dass die Ist-Arbeitszeit über der Soll-Arbeitszeit liegt.
- Ein negativer Wert bedeutet, dass die Soll-Arbeitszeit noch nicht erreicht ist.
- `0` Minuten bedeuten einen exakten Ausgleich.
- Soll- und Ist-Arbeitszeit liegen bereits als ganze Minutenwerte vor. Die Differenz wird deshalb nicht zusätzlich gerundet.
- Positive Differenzen werden mit einem Pluszeichen und negative Differenzen mit einem Minuszeichen dargestellt.
- Ein exakter Ausgleich wird als `00:00` ohne Vorzeichen dargestellt.

## Durchgängiges Monatsbeispiel

Für einen Mitarbeiter gelten in einem Monat beispielhaft folgende Ausgangswerte:

- `20` berechnete kalendarische Arbeitstage,
- Wochenarbeitszeit im Mitarbeiter-Snapshot: `39:00` Stunden beziehungsweise `2340` Minuten,
- monatliche reine Arbeitszeit: `150:00` Stunden beziehungsweise `9000` Minuten,
- monatliche Nachtbereitschaft: `2:01` Stunden beziehungsweise `121` Minuten und
- monatliche Nachtarbeit: `0:13` Stunden beziehungsweise `13` Minuten.

Daraus werden die Kennzahlen in dieser Reihenfolge gebildet:

1. `Arbeitszeit (mit NB) = 9000 + 121 = 9121 Minuten = 152:01 Stunden`.
2. `Nachtzuschlag = Rundung(13 × 20 %) = Rundung(2,6) = 3 Minuten = 00:03 Stunden`.
3. `Nachtbereitschaftszuschlag = Rundung(121 × 25 %) = Rundung(30,25) = 30 Minuten = 00:30 Stunden`.
4. `Soll-Arbeitszeit = 20 × 2340 / 5 = 9360 Minuten = 156:00 Stunden`.
5. `Ist-Arbeitszeit = 9000 + 30 = 9030 Minuten = 150:30 Stunden`.
6. `Soll-/Ist-Differenz = 9030 − 9360 = −330 Minuten = −05:30 Stunden`.

Der Nachtzuschlag von `00:03` wird zwar berechnet und angezeigt, aber nicht zur Ist-Arbeitszeit addiert. Ebenso geht nicht die vollständige Arbeitszeit (mit NB) in das Ist ein. Für das Ist werden ausschließlich die reine Arbeitszeit und der Nachtbereitschaftszuschlag verwendet.
