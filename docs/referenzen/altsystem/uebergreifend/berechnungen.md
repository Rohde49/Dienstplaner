# Übergreifende Berechnungen

## Geltungsbereich

Diese Datei beschreibt die statisch erkennbare Berechnungslogik des Quellcodes am festgelegten Commit. Sie bestätigt keine fachliche Richtigkeit durch Ausführung. Dokumentierte Zielregeln der einzelnen Features stehen jeweils getrennt in deren Dokumentationsanalyse.

## Zeitpunkte und Zeitdauern

Der Code trennt Uhrzeiten und Dauern:

- `timeOfDay.ts` akzeptiert Uhrzeiten nur als zweistelliges `HH:MM` von `00:00` bis `23:59`.
- `shared/time.ts` parst Zeitdauern als eine bis drei Stundenstellen plus Minuten von `00` bis `59`. Dauern können damit deutlich über 24 Stunden liegen.
- Intern werden Dauern als Minuten geführt.
- `formatMinutesToHHMM()` akzeptiert nur nichtnegative ganze Minuten und formatiert Stunden mindestens zweistellig.
- `rundeAufVolleMinute()` verwendet `Math.round`; eine exakte halbe Minute wird für nichtnegative Werte aufgerundet.

Beginn und Ende einer Eintragsdefinition beziehungsweise eines Snapshots sind darstellende Uhrzeiten. Der Quellcode leitet die fünf Dauerfelder nicht aus Beginn und Ende ab und prüft keine zeitliche Reihenfolge.

## Mitarbeiterabhängige Einträge

Bei der Berechnungsart `mitarbeiterabhaengig` erzeugt `erzeugePlaneintragSnapshot()` einen Snapshot mit:

- `arbeitszeitOhneNachtbereitschaftMinuten = rundeAufVolleMinute(wochenarbeitszeitMinuten / 5)`,
- allen übrigen Dauerfeldern auf `0`,
- Beginn und Ende auf `null`.

Bei einer festen Eintragsdefinition übernimmt der Snapshot Kürzel, Beginn, Ende und alle fünf Dauerfelder unverändert. Die Berechnung findet beim Setzen des Eintrags im Renderer statt; gespeichert wird anschließend der Snapshot.

## Kalender und Feiertage

`getKalendertageFuerMonat()` erzeugt in UTC für jeden Tag des gewählten Monats:

- ISO-Datum,
- deutschen Wochentagskurznamen,
- Wochenendkennzeichen,
- Feiertagskennzeichen und gegebenenfalls Namen.

Der Code enthält zwölf Feiertage für Brandenburg: Neujahr, Karfreitag, Ostersonntag, Ostermontag, Tag der Arbeit, Christi Himmelfahrt, Pfingstsonntag, Pfingstmontag, Tag der Deutschen Einheit, Reformationstag sowie beide Weihnachtsfeiertage. Bewegliche Feiertage werden aus dem Ostersonntag des gregorianischen Kalenders abgeleitet.

Ein gesetzlicher Arbeitstag für die Sollzeit ist im Code ein Montag bis Freitag, der nicht als Feiertag markiert ist.

## Auswertungskennzahlen

`shared/auswertung.ts` berechnet eine Kennzahlenstruktur pro Mitarbeiter. Die tatsächlichen Codepfade sind ausführlich in der [Quellcodeanalyse der Auswertung](../auswertung/quellcodeanalyse.md) beschrieben. Übergreifend wichtig sind:

- Die Berechnung erhält Kalendertage, Dienstplantage sowie Planeintrags- und Rufbereitschaftsentwürfe als Werte und führt keine Datenbankabfrage aus.
- Tageswerte werden über Datum, Dienstplantag-ID und Mitarbeiter-ID verbunden.
- Monatssummen lesen die im Planeintrag gespeicherten Snapshot-Minuten.
- Nachtzuschlag ist 20 Prozent der Nachtarbeitsminuten; Nachtbereitschaftszuschlag ist 25 Prozent der Nachtbereitschaftsminuten. Gerundet wird jeweils das Monatsergebnis.
- Sollzeit wird aus Arbeitstagen und individueller Wochenarbeitszeit berechnet.
- Soll-Ist-Differenzen werden mit Vorzeichen formatiert und in der UI bei null beziehungsweise Abweichung verschieden eingefärbt.

Die vollständige Auswertung wird nur für Erzieher erzeugt. `PlanungsGrid` und `VerkuerzteAnsicht` rufen dieselbe Funktion ebenfalls auf, zeigen aber nur Teilmengen.

## Berechnungsnahe Tests

Der Repository-Stand enthält reine Tests für:

- Zeitdauer-Parsing und -Formatierung,
- Uhrzeitvalidierung,
- Rundung,
- Kalendertage und Feiertage,
- Planeintragsschlüssel,
- mitarbeiterabhängige Tagesarbeitszeit,
- Snapshot-Erzeugung,
- Rufbereitschaftsentwürfe,
- sämtliche Felder der Kennzahlenstruktur, Soll-Ist-Formatierung und Soll-Ist-Farbe.

Die Tests wurden nicht ausgeführt. Ihre Existenz belegt nur die beabsichtigten Prüffälle im untersuchten Quellcode.

## Statische Grenzen

- Die Rechenfunktionen prüfen nicht, ob alle übergebenen IDs zu demselben Dienstplan gehören.
- Sie prüfen nicht, ob Minutenwerte fachlich plausibel oder nichtnegativ sind; einzelne Formatierungsfunktionen werfen bei ungültigen Ausgabewerten.
- Gesetzesänderungen nach dem fest kodierten Stand werden nicht automatisch bezogen.
- Die praktische Aktualisierung der Kennzahlen während einer Bedienfolge wurde nicht ausgeführt.
