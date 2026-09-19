# Zeitbasis und Rundung

Dieses Dokument beschreibt die verbindlichen fachlichen Grundlagen für
Zeitwerte und Rundungen. Konkrete Feldgrenzen und die technische Umsetzung
werden durch den aktuellen Quellcode bestimmt.

## Zeitbasis

Alle Arbeitszeitdauern werden intern in ganzen Minuten geführt.

- Gespeicherte Arbeitszeitdauern sind nichtnegative ganze Minutenwerte.
- Sekunden und Bruchteile von Minuten werden nicht gespeichert.
- Berechnungen mit Prozentsätzen dürfen vorübergehend Bruchteile einer Minute
  ergeben. Das Ergebnis wird anschließend nach der für die Berechnung
  festgelegten Regel gerundet.
- Negative Minutenwerte sind für berechnete Differenzen und für ausdrücklich
  vorzeichenbehaftete Fachwerte wie den manuellen Zeitübertrag zulässig. Reine
  Arbeitszeitdauern bleiben nichtnegativ.
- Angaben in Stunden und Minuten werden vor einer Berechnung in Minuten
  umgerechnet.

Beispiel: `39:00` Stunden entsprechen intern `2340` Minuten.

## Zeitdauer und Uhrzeit

Zeitdauern und Uhrzeiten sind unterschiedliche Angaben.

### Zeitdauer

- Eine Zeitdauer kann mehr als 24 Stunden umfassen.
- Formulare akzeptieren getrennte Eingaben mit Doppelpunkt, Punkt oder Komma
  sowie reine Ziffernfolgen. Bei mindestens drei Ziffern bilden die letzten
  beiden Ziffern den Minutenanteil; ein- und zweistellige Eingaben stehen für
  volle Stunden.
- Der Minutenanteil muss zwischen `00` und `59` liegen.
- Bei der Ausgabe wird der Stundenanteil mit mindestens zwei Stellen
  dargestellt.
- Gültige Beispiele sind `8`, `530`, `030`, `5:30`, `5.30`, `5,30` und
  `12015`. Bei der Ausgabe werden sie beispielsweise als `08:00`, `05:30`,
  `00:30` oder `120:15` dargestellt.
- Fachliche Obergrenzen werden bei Bedarf für das jeweilige Eingabefeld
  festgelegt. Das Format selbst begrenzt eine Dauer nicht auf 24 Stunden.

### Uhrzeit

- Beginn und Ende eines Dienstes sind Uhrzeiten innerhalb eines Kalendertages.
- Formulare akzeptieren beispielsweise `8`, `20`, `530`, `1430`, `030`,
  `5:30`, `5.30` oder `5,30` und vereinheitlichen diese Eingaben als `HH:MM`.
- Zulässig sind Werte von `00:00` bis `23:59`. Eine zweistellige Zahl über
  `23`, beispielsweise `30`, ist bewusst ungültig, weil sie nicht eindeutig
  als Stunde oder Minute verstanden werden kann.
- Beginn und Ende sind optionale Informations- und Darstellungsangaben. Sobald
  eine Uhrzeit angegeben wird, muss auch die andere angegeben werden.
- Ein Dienst darf über Mitternacht hinausgehen, beispielsweise von `22:00` bis
  `06:00` Uhr.
- Der Planungseintrag bleibt trotzdem genau einem Kalendertag zugeordnet. Er
  wird nicht auf mehrere Tage aufgeteilt.
- Aus Beginn und Ende werden keine Zeitdauern automatisch abgeleitet.
  Reine Arbeitszeit, Nachtbereitschaft, Pause und Nachtarbeit werden unabhängig
  davon festgelegt. Arbeitszeit mit Nachtbereitschaft und Anwesenheitszeit
  werden aus diesen Zeitwerten berechnet.

Eine automatische Ableitung aus Uhrzeiten setzt zusätzliche Fachregeln zu
Pausen, Nachtzeiträumen und Diensten über Mitternacht voraus und ist daher
nicht Bestandteil der aktuellen Berechnungsregeln.

## Rundungsmethode

Nichtnegative berechnete Zeitdauern werden auf die nächstgelegene volle Minute
gerundet:

- unter `0,5` Minuten wird abgerundet,
- ab einschließlich `0,5` Minuten wird aufgerundet.

Beispiele:

- `8:00:29` wird zu `8:00` Stunden,
- `8:00:30` wird zu `8:01` Stunden,
- `8:00:45` wird zu `8:01` Stunden.

Der Rundungszeitpunkt wird bei der jeweiligen Berechnung festgelegt. Negative
Soll-/Ist-Differenzen werden nicht erneut gerundet, weil ihre Ausgangswerte
bereits ganze Minuten sind.

## Wochenarbeitszeit

Die individuelle Wochenarbeitszeit wird in Fünf-Minuten-Schritten angegeben.
Ihr Minutenwert ist dadurch ohne Rest durch fünf teilbar.

So kann ein minutengenauer Tageswert gebildet werden:

`Tageswert = Wochenarbeitszeit / 5`

Eine Rundung oder Resteverteilung ist dabei nicht erforderlich.

- `0:00` ist zulässig und ergibt einen Tageswert sowie eine monatliche
  Soll-Arbeitszeit von `0` Minuten.
- Aus `0:00` werden keine Mitarbeiterrolle, kein Beschäftigungsstatus und keine
  automatische Deaktivierung abgeleitet.
- Feste Planungseinträge mit positiver reiner Arbeitszeit können trotz einer
  Soll-Arbeitszeit von `0` Minuten ein positives Ist erzeugen.

Beispiele:

- `39:00` entspricht `2340` Minuten und einem Tageswert von `468` Minuten
  beziehungsweise `7:48` Stunden.
- `27:30` entspricht `1650` Minuten und einem Tageswert von `330` Minuten
  beziehungsweise `5:30` Stunden.
- `39:01` ist als Wochenarbeitszeit nicht zulässig.

## Darstellung

- Nichtnegative Zeitdauern werden als `HH:MM` dargestellt. Der Stundenanteil
  darf mehr als zwei Stellen umfassen.
- Positive Soll-/Ist-Differenzen erhalten ein Pluszeichen, beispielsweise
  `+01:30`.
- Negative Soll-/Ist-Differenzen erhalten ein Minuszeichen, beispielsweise
  `−01:30`.
- Ein exakter Ausgleich wird als `00:00` ohne Vorzeichen dargestellt.
