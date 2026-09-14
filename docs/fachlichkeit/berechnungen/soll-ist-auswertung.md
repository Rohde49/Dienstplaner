# Soll-Ist-Auswertung

Dieses Dokument beschreibt die verbindliche Berechnung von Soll-Arbeitszeit,
Ist-Arbeitszeit und ihrer Differenz.

## Monatliche Soll-Arbeitszeit

Die monatliche Soll-Arbeitszeit eines Mitarbeiters wird aus der Anzahl der
kalendarischen Arbeitstage und seiner im Monatsplan gespeicherten
Wochenarbeitszeit gebildet:

`Soll-Arbeitszeit = Arbeitstage × Wochenarbeitszeit / 5`

- Die Arbeitstage werden nach den
  [Kalenderregeln](./kalender-und-arbeitstage.md) aus dem vollständigen Monat
  berechnet und nicht eingegeben.
- Die Arbeitstagszahl ist für alle Mitarbeiter desselben Monatsplans gleich.
- Planungseinträge, Urlaub, Krankheit, Rufbereitschaften, Beschäftigungsbeginn
  und persönliche Arbeitszeitverteilung verändern diese Kalendergröße nicht.
- Mitarbeiterabhängig ist nur die im Monatsplan gespeicherte
  Wochenarbeitszeit.
- Aufgrund der Fünf-Minuten-Schritte ergibt `Wochenarbeitszeit / 5` bereits
  ganze Minuten. Eine Rundung ist nicht erforderlich.
- Eine Wochenarbeitszeit von `0:00` ergibt eine Soll-Arbeitszeit von `0`
  Minuten.
- Spätere Änderungen der Mitarbeiter-Stammdaten verändern das Soll eines
  bestehenden Monatsplans nicht rückwirkend.

## Monatliche Ist-Arbeitszeit

Die monatliche Ist-Arbeitszeit wird aus der reinen Arbeitszeit und dem
Nachtbereitschaftszuschlag gebildet:

`Ist-Arbeitszeit = monatliche reine Arbeitszeit + Nachtbereitschaftszuschlag`

- Der Nachtbereitschaftszuschlag beträgt einmalig gerundete `25 %` der gesamten
  monatlichen Nachtbereitschaft.
- Der Nachtzuschlag von `20 %` wird gesondert berechnet und nicht zum Ist
  addiert.
- Die vollständige Nachtbereitschaft und die Arbeitszeit mit
  Nachtbereitschaft werden nicht zum Ist addiert.
- Nachtarbeit, Sonntags- und Feiertagszeit, Anwesenheitszeit,
  Rufbereitschaften und tagesbezogene Zähler werden nicht zusätzlich
  eingerechnet.
- Beide Summanden sind bereits ganze Minuten; nach der Addition wird nicht
  erneut gerundet.

## Soll-/Ist-Differenz

`Soll-/Ist-Differenz = Ist-Arbeitszeit − Soll-Arbeitszeit`

- Ein positiver Wert bedeutet, dass das Ist über dem Soll liegt.
- Ein negativer Wert bedeutet, dass das Soll noch nicht erreicht ist.
- `0` Minuten bedeuten einen exakten Ausgleich.
- Die Differenz wird nicht zusätzlich gerundet.
- Positive Werte erhalten ein Pluszeichen, negative Werte ein Minuszeichen.
- Ein exakter Ausgleich wird als `00:00` ohne Vorzeichen dargestellt.

## Durchgängiges Monatsbeispiel

Für einen Mitarbeiter gelten:

- `20` kalendarische Arbeitstage,
- Wochenarbeitszeit: `39:00` Stunden beziehungsweise `2340` Minuten,
- monatliche reine Arbeitszeit: `150:00` Stunden beziehungsweise `9000`
  Minuten,
- monatliche Nachtbereitschaft: `2:01` Stunden beziehungsweise `121` Minuten,
- monatliche Nachtarbeit: `0:13` Stunden beziehungsweise `13` Minuten.

Daraus folgt:

1. Arbeitszeit mit NB: `9000 + 121 = 9121` Minuten beziehungsweise `152:01`.
2. Nachtzuschlag: `Rundung(13 × 20 %) = 3` Minuten beziehungsweise `00:03`.
3. Nachtbereitschaftszuschlag: `Rundung(121 × 25 %) = 30` Minuten
   beziehungsweise `00:30`.
4. Soll-Arbeitszeit: `20 × 2340 / 5 = 9360` Minuten beziehungsweise `156:00`.
5. Ist-Arbeitszeit: `9000 + 30 = 9030` Minuten beziehungsweise `150:30`.
6. Soll-/Ist-Differenz: `9030 − 9360 = −330` Minuten beziehungsweise `−05:30`.

Der Nachtzuschlag wird zwar berechnet, aber nicht zum Ist addiert. Für die
Ist-Arbeitszeit zählen ausschließlich die reine Arbeitszeit und der
Nachtbereitschaftszuschlag.
