# Zeitbasis und Rundung

## Zeitbasis

Alle Arbeitszeitdauern werden intern in **ganzen Minuten** geführt.

- Gespeicherte Zeitdauern müssen nichtnegative ganze Minutenwerte sein.
- Sekunden und Bruchteile von Minuten werden nicht gespeichert.
- Berechnungen, beispielsweise mit Prozentsätzen, dürfen vorübergehend Bruchteile einer Minute ergeben. Das Ergebnis muss anschließend nach der für die jeweilige Berechnung festgelegten Regel auf eine ganze Minute gerundet werden.
- Negative Minutenwerte sind nur für berechnete Differenzen zulässig, beispielsweise für eine noch nicht erreichte Soll-Arbeitszeit.
- Angaben in Stunden und Minuten dienen der Ein- und Ausgabe. Vor Berechnungen werden sie in Minuten umgerechnet.

Beispiel: Eine Wochenarbeitszeit von `39:00` Stunden entspricht intern `2340` Minuten.

## Zeitdauer und Uhrzeit

Zeitdauern und Uhrzeiten sind fachlich unterschiedliche Angaben und werden entsprechend unterschiedlich behandelt.

### Zeitdauer

- Eine Zeitdauer kann mehr als 24 Stunden umfassen.
- Das Eingabeformat ist `H:MM`. Der Stundenanteil besteht aus mindestens einer Ziffer; der Minutenanteil besteht aus genau zwei Ziffern zwischen `00` und `59`.
- Bei der Ausgabe wird der Stundenanteil mit mindestens zwei Stellen dargestellt.
- Beispiele für gültige Zeitdauern sind `5:30`, `39:00` und `120:15`. Bei der Ausgabe wird `5:30` als `05:30` dargestellt.
- Eine fachliche Obergrenze wird bei Bedarf für das jeweilige Eingabefeld gesondert festgelegt. Aus dem Format selbst ergibt sich keine Obergrenze von 24 oder 999 Stunden.

### Uhrzeit

- Beginn und Ende eines Dienstes sind Uhrzeiten innerhalb eines Kalendertages.
- Das Format ist `HH:MM` mit genau zwei Stellen für Stunden und Minuten.
- Zulässig sind Werte von `00:00` bis `23:59`.
- Beginn und Ende sind optionale Informations- und Darstellungsangaben. Sobald eine der beiden Uhrzeiten angegeben wird, muss auch die andere angegeben werden.
- Ein Dienst darf über Mitternacht hinausgehen, beispielsweise von `22:00` bis `06:00` Uhr.
- Der Planungseintrag selbst gehört trotzdem immer genau zu einem Kalendertag und einer Planungszelle. Er wird nicht auf mehrere Kalendertage aufgeteilt.
- Ein Ende am folgenden Kalendertag erzeugt weder automatisch einen weiteren Planungseintrag noch verschiebt es Zeitwerte auf diesen Folgetag.
- Aus Beginn und Ende werden keine Zeitdauern automatisch berechnet. Anwesenheitszeit, reine Arbeitszeit, Nachtbereitschaft und Nachtarbeit werden unabhängig von den Uhrzeiten als eigene Zeitdauern festgelegt. Arbeitszeit (mit NB) wird anschließend nach der verbindlichen Formel aus reiner Arbeitszeit und Nachtbereitschaft abgeleitet.
- Eine automatische Ableitung weiterer Zeitdauern aus Beginn und Ende darf erst eingeführt werden, wenn dafür vollständige fachliche Regeln zu Pausen, Nachtzeiträumen und Diensten über Mitternacht beschlossen wurden.

## Rundungsmethode

Nichtnegative berechnete Zeitdauern werden auf die nächstgelegene volle Minute gerundet.

- Liegt der Bruchteil unter einer halben Minute, wird abgerundet.
- Ab genau einer halben Minute wird aufgerundet.
- Eine halbe Minute entspricht 30 Sekunden beziehungsweise `0,5` Minuten.
- Negative Soll-/Ist-Differenzen werden nicht erneut gerundet, weil sie aus bereits auf ganze Minuten festgelegten Ausgangswerten gebildet werden.

Beispiele:

- `8:00:29` wird zu `8:00` Stunden.
- `8:00:30` wird zu `8:01` Stunden.
- `8:00:45` wird zu `8:01` Stunden.

Der Zeitpunkt einer Rundung wird für die jeweilige Berechnung gesondert festgelegt. Dadurch wird vermieden, dass unterschiedlich oft gerundete Zwischenwerte zu unbeabsichtigten Abweichungen führen.

## Teilbarkeit der Wochenarbeitszeit

Die individuelle Wochenarbeitszeit muss in Fünf-Minuten-Schritten angegeben werden. Ihr interner Minutenwert muss somit ohne Rest durch fünf teilbar sein.

Dadurch kann bei Bedarf ein minutengenauer Tageswert als ein Fünftel der Wochenarbeitszeit gebildet werden. Fünf solcher Tageswerte entsprechen immer exakt der eingetragenen Wochenarbeitszeit; eine Rundung oder Resteverteilung ist nicht erforderlich.

- Eine Wochenarbeitszeit von `0:00` ist zulässig und erfüllt ebenfalls die Teilbarkeitsregel.
- Für ein Teammitglied mit `0:00` beträgt der Tageswert der Berechnungsart `Wochenarbeitszeit` ebenfalls `0` Minuten.
- Seine monatliche Soll-Arbeitszeit beträgt unabhängig von der Arbeitstagszahl `0` Minuten.
- Feste Planungseinträge mit positiver reiner Arbeitszeit können dennoch ein positives Ist erzeugen. Die Soll-/Ist-Differenz entspricht in diesem Fall der Ist-Arbeitszeit.
- Aus dem Wert `0:00` wird keine besondere Mitarbeiterrolle, kein Beschäftigungsstatus und keine automatische Deaktivierung abgeleitet.

Beispiele:

- `39:00` Stunden entsprechen `2340` Minuten und ergeben bei einer Teilung durch fünf `468` Minuten beziehungsweise `7:48` Stunden pro Tag.
- `27:30` Stunden entsprechen `1650` Minuten und ergeben bei einer Teilung durch fünf `330` Minuten beziehungsweise `5:30` Stunden pro Tag.
- `39:01` Stunden entsprechen `2341` Minuten und sind als Wochenarbeitszeit nicht zulässig, weil der Wert nicht ohne Rest durch fünf teilbar ist.

Ob und für welche Planungseinträge ein solcher Tageswert verwendet wird, ist in der jeweiligen Berechnungsregel des Planungseintrags festzulegen.

## Darstellung von Zeitdauern und Differenzen

- Nichtnegative Zeitdauern werden als `HH:MM` dargestellt. Bei einer Dauer von mehr als 99 Stunden darf der Stundenanteil entsprechend mehr Stellen enthalten.
- Positive Soll-/Ist-Differenzen erhalten ein Pluszeichen, beispielsweise `+01:30`.
- Negative Soll-/Ist-Differenzen erhalten ein Minuszeichen, beispielsweise `−01:30`.
- Ein exakter Ausgleich wird einheitlich als `00:00` ohne Vorzeichen dargestellt.
