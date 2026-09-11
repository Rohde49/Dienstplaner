# Berechnungen

## Zweck und Verbindlichkeit

Diese Datei hält die fachlichen Berechnungsregeln des Dienstplaners zentral fest. Sie beschreibt, **welche Werte auf welcher Grundlage berechnet werden**, unabhängig davon, wie die Berechnung technisch umgesetzt wird.

Die Berechnungen des alten Projekts dienen als Ausgangspunkt für die fachliche Klärung. Eine dort vorhandene Implementierung wird nicht automatisch zur verbindlichen Regel des neuen Projekts. Jeder Themenblock wird geprüft, verständlich dokumentiert und anschließend fachlich bestätigt oder angepasst.

## Analysegrundlage

- Altes Projekt: [`Rohde49/dienstplan-app`](https://github.com/Rohde49/dienstplan-app)
- Untersuchte Version: Commit [`255036d0d95fa7fbf53e354a36680a08ee4719c1`](https://github.com/Rohde49/dienstplan-app/tree/255036d0d95fa7fbf53e354a36680a08ee4719c1/src)
- Ausgewerteter Bereich: ausschließlich der Ordner `src`, einschließlich der dort enthaltenen Tests
- Bewusst nicht als Quelle verwendet: der `docs`-Ordner des alten Projekts

Die fachlich maßgeblichen Berechnungsstellen liegen im alten Projekt vor allem in folgenden Quelldateien:

- `src/shared/time.ts` und `src/shared/rundeAufVolleMinute.ts`
- `src/shared/kalendertage.ts`
- `src/renderer/src/lib/mitarbeiterabhaengigeArbeitszeit.ts`
- `src/renderer/src/lib/planeintragSnapshot.ts`
- `src/shared/auswertung.ts`

Die zugehörigen Tests im `src`-Ordner werden ergänzend verwendet, um Beispiele, Grenzfälle und die tatsächlich erwarteten Ergebnisse nachzuvollziehen.

## Erkannte Berechnungsbereiche

| Schritt | Themenbereich | Im alten Quellcode erkannter Inhalt | Bearbeitungsstand |
| --- | --- | --- | --- |
| 1 | Bestandsaufnahme | Berechnungsstellen und Abhängigkeiten im alten `src`-Ordner erfassen | abgeschlossen |
| 2 | Zeitbasis und Rundung | Umrechnung zwischen Stunden-/Minutenangaben und Minuten; gemeinsame Rundungsregel | abgeschlossen |
| 3 | Kalender und Arbeitstage | Monatstage, Wochentage, Wochenenden, Brandenburger Feiertage und monatliche Arbeitstage | abgeschlossen |
| 4 | Planungseinträge | `Feste Zeitwerte` und aus der `Wochenarbeitszeit` berechnete Tageswerte; Übernahme als Snapshot | abgeschlossen |
| 5 | Tagesbezogene Kennzahlen | SN/F-Dienste, freie Tage, freie Samstage und Sonntage sowie Rufbereitschaften | abgeschlossen |
| 6 | Zeitbezogene Kennzahlen | Monatssummen, Sonntags-/Feiertagsstunden, Nachtarbeit, Nachtbereitschaft und Zuschläge | abgeschlossen |
| 7 | Soll-/Ist-Vergleich | monatliche Soll-Arbeitszeit, Ist-Arbeitszeit und deren Differenz | abgeschlossen |
| 8 | Gesamtprüfung | Überschneidungen, Grenzfälle und noch offene fachliche Entscheidungen prüfen | abgeschlossen |

## Abgrenzung der Bestandsaufnahme

Nicht jede Rechenoperation im Quellcode ist eine fachliche Berechnung. Rein technische Vorgänge wie Datenbank-IDs, Bildschirmbreiten, Navigation, Sortierung oder die Erkennung ungespeicherter Änderungen werden deshalb nicht in diese Datei übernommen.

Darstellungsregeln wie das Format `HH:MM`, das Vorzeichen einer Soll-/Ist-Differenz oder ihre farbliche Kennzeichnung werden nur dann aufgenommen, wenn sie für die eindeutige fachliche Interpretation eines berechneten Ergebnisses erforderlich sind.

## Verbindliche fachliche Regeln

### Zeitbasis

Alle Arbeitszeitdauern werden intern in **ganzen Minuten** geführt.

- Gespeicherte Zeitdauern müssen nichtnegative ganze Minutenwerte sein.
- Sekunden und Bruchteile von Minuten werden nicht gespeichert.
- Berechnungen, beispielsweise mit Prozentsätzen, dürfen vorübergehend Bruchteile einer Minute ergeben. Das Ergebnis muss anschließend nach der für die jeweilige Berechnung festgelegten Regel auf eine ganze Minute gerundet werden.
- Negative Minutenwerte sind nur für berechnete Differenzen zulässig, beispielsweise für eine noch nicht erreichte Soll-Arbeitszeit.
- Angaben in Stunden und Minuten dienen der Ein- und Ausgabe. Vor Berechnungen werden sie in Minuten umgerechnet.

Beispiel: Eine Wochenarbeitszeit von `39:00` Stunden entspricht intern `2340` Minuten.

### Zeitdauer und Uhrzeit

Zeitdauern und Uhrzeiten sind fachlich unterschiedliche Angaben und werden entsprechend unterschiedlich behandelt.

#### Zeitdauer

- Eine Zeitdauer kann mehr als 24 Stunden umfassen.
- Das Eingabeformat ist `H:MM`. Der Stundenanteil besteht aus mindestens einer Ziffer; der Minutenanteil besteht aus genau zwei Ziffern zwischen `00` und `59`.
- Bei der Ausgabe wird der Stundenanteil mit mindestens zwei Stellen dargestellt.
- Beispiele für gültige Zeitdauern sind `5:30`, `39:00` und `120:15`. Bei der Ausgabe wird `5:30` als `05:30` dargestellt.
- Eine fachliche Obergrenze wird bei Bedarf für das jeweilige Eingabefeld gesondert festgelegt. Aus dem Format selbst ergibt sich keine Obergrenze von 24 oder 999 Stunden.

#### Uhrzeit

- Beginn und Ende eines Dienstes sind Uhrzeiten innerhalb eines Kalendertages.
- Das Format ist `HH:MM` mit genau zwei Stellen für Stunden und Minuten.
- Zulässig sind Werte von `00:00` bis `23:59`.
- Beginn und Ende sind optionale Informations- und Darstellungsangaben. Sobald eine der beiden Uhrzeiten angegeben wird, muss auch die andere angegeben werden.
- Ein Dienst darf über Mitternacht hinausgehen, beispielsweise von `22:00` bis `06:00` Uhr.
- Der Planungseintrag selbst gehört trotzdem immer genau zu einem Kalendertag und einer Planungszelle. Er wird nicht auf mehrere Kalendertage aufgeteilt.
- Ein Ende am folgenden Kalendertag erzeugt weder automatisch einen weiteren Planungseintrag noch verschiebt es Zeitwerte auf diesen Folgetag.
- Aus Beginn und Ende werden keine Zeitdauern automatisch berechnet. Anwesenheitszeit, reine Arbeitszeit, Nachtbereitschaft und Nachtarbeit werden unabhängig von den Uhrzeiten als eigene Zeitdauern festgelegt. Arbeitszeit (mit NB) wird anschließend nach der verbindlichen Formel aus reiner Arbeitszeit und Nachtbereitschaft abgeleitet.
- Eine automatische Ableitung weiterer Zeitdauern aus Beginn und Ende darf erst eingeführt werden, wenn dafür vollständige fachliche Regeln zu Pausen, Nachtzeiträumen und Diensten über Mitternacht beschlossen wurden.

### Rundungsmethode

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

### Teilbarkeit der Wochenarbeitszeit

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

### Darstellung von Zeitdauern und Differenzen

- Nichtnegative Zeitdauern werden als `HH:MM` dargestellt. Bei einer Dauer von mehr als 99 Stunden darf der Stundenanteil entsprechend mehr Stellen enthalten.
- Positive Soll-/Ist-Differenzen erhalten ein Pluszeichen, beispielsweise `+01:30`.
- Negative Soll-/Ist-Differenzen erhalten ein Minuszeichen, beispielsweise `−01:30`.
- Ein exakter Ausgleich wird einheitlich als `00:00` ohne Vorzeichen dargestellt.

### Kalendergrundlage

- Ein Dienstplan umfasst immer sämtliche Kalendertage des ausgewählten gregorianischen Monats.
- Die Kalendertage werden in chronologischer Reihenfolge geführt.
- Das interne Datumsformat ist `JJJJ-MM-TT`.
- Die Bestimmung eines Kalendertages erfolgt unabhängig von Uhrzeit, lokaler Zeitzone und Sommerzeit. Dadurch darf sich ein Datum bei der Berechnung nicht verschieben.
- Samstag und Sonntag gelten als Wochenende.
- Wochenenden und Feiertage bleiben im Dienstplan enthalten und können wie andere Kalendertage beplant werden. Sie werden lediglich gesondert gekennzeichnet und bei davon abhängigen Berechnungen entsprechend berücksichtigt.

### Gesetzliche Feiertage in Brandenburg

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

### Kalendarische Arbeitstage

Ein **kalendarischer Arbeitstag** ist ein Montag, Dienstag, Mittwoch, Donnerstag oder Freitag, sofern der betreffende Tag kein gesetzlicher Feiertag in Brandenburg ist.

Die monatliche Arbeitstagszahl entspricht somit der Anzahl aller Tage von Montag bis Freitag abzüglich der gesetzlichen Feiertage, die auf einen dieser Wochentage fallen.

- Die kalendarische Arbeitstagszahl ist für alle Mitarbeiter gleich.
- Urlaub, Krankheit, tatsächliche Dienstplanbelegung, Beschäftigungsbeginn und die persönliche Verteilung der Arbeitszeit verändern diese Kalendergröße nicht.
- Ein Feiertag am Samstag oder Sonntag reduziert die Arbeitstagszahl nicht zusätzlich.
- Fällt ein Feiertag auf ein Wochenende, entsteht kein Ersatzarbeitstag.
- Der Begriff `Werktag` wird für diese Berechnung vermieden, weil er auch den Samstag umfassen kann.

### Mehrere Feiertage an einem Datum

- Ein Datum bleibt auch dann genau ein Kalendertag, wenn mehrere gesetzliche Feiertage darauf fallen.
- Bei der Arbeitstagsberechnung wird dieser Kalendertag höchstens einmal ausgeschlossen.
- Alle auf das Datum zutreffenden Feiertagsbezeichnungen bleiben erhalten und werden gemeinsam angezeigt.
- Keine Feiertagsbezeichnung darf eine andere Bezeichnung desselben Datums überschreiben.

### Gültige Kalenderauswahl

- Der ausgewählte Monat muss eine ganze Zahl von `1` bis `12` sein.
- Das ausgewählte Jahr muss ein gültiges, von der Anwendung zugelassenes gregorianisches Kalenderjahr sein.
- Die Kalender- und Feiertagsberechnungen müssen für jedes Jahr funktionieren, das in der Anwendung ausgewählt werden kann.
- Ein konkreter in der Bedienoberfläche angebotener Jahresbereich ist keine Berechnungsregel. Er wird bei der fachlichen Festlegung der Planungsseite bestimmt.

### Automatische Vollständigkeit eines Monatsplans

- Beim regulären Anlegen eines Monatsplans erzeugt die Anwendung automatisch für jeden Kalendertag des ausgewählten Monats genau einen Plantag.
- Dadurch enthält ein regulär erzeugter Monatsplan sämtliche Kalendertage des Monats und keine doppelten Datumswerte.
- Es wird keine zusätzliche fachliche Regel eingeführt, nach der ein gespeicherter Monatsplan wegen fehlender oder doppelter Plantage ausdrücklich abgelehnt werden muss.
- Das Verhalten bei beschädigten oder manuell veränderten gespeicherten Daten ist keine eigene fachliche Berechnungsregel und wird bei der technischen Umsetzung behandelt.
- Insbesondere wird das zufällige Auswahlverhalten des Altsystems bei doppelten Datumswerten nicht als gewünschtes Fachverhalten übernommen.

### Berechnungsarten von Planungseinträgen

Jede Planungseintragsdefinition besitzt ausdrücklich eine der beiden Berechnungsarten `Feste Zeitwerte` oder `Wochenarbeitszeit`. Die Berechnungsart wird nicht aus dem Kürzel oder der Bezeichnung abgeleitet.

Für das neue Projekt gelten folgende Begriffe:

- **Reine Arbeitszeit** bezeichnet die Arbeitszeit ohne Nachtbereitschaft.
- **Arbeitszeit (mit NB)** bezeichnet die Summe aus reiner Arbeitszeit und vollständiger Nachtbereitschaft. Sie ist eine eigene Informationskennzahl und nicht mit der monatlichen Ist-Arbeitszeit gleichzusetzen.

#### Feste Zeitwerte

Beim Setzen eines Planungseintrags werden folgende Werte aus der ausgewählten Definition unverändert für den konkreten Eintrag übernommen:

- Herkunfts-ID der Definition,
- Kürzel,
- Bezeichnung,
- Beginn und Ende,
- Anwesenheitszeit,
- reine Arbeitszeit,
- Nachtbereitschaft und
- Nachtarbeit.

Die Arbeitszeit (mit NB) ist kein zusätzlich frei pflegbarer Zeitwert. Sie wird beim Setzen des Planungseintrags berechnet:

`Arbeitszeit (mit NB) = reine Arbeitszeit + Nachtbereitschaft`

- Reine Arbeitszeit und Nachtbereitschaft bleiben eigenständige, vom Benutzer festgelegte Werte.
- Arbeitszeit (mit NB) wird aus diesen beiden Werten abgeleitet und muss im Planungseintrag-Snapshot gespeichert werden.
- Ein davon abweichender, unabhängig eingegebener Wert ist nicht zulässig.
- Anwesenheitszeit und Nachtarbeit bleiben von dieser Additionsformel unberührt.
- In der EntryTypes-Verwaltung bleibt Arbeitszeit (mit NB) als eigener Wert sichtbar, damit der Benutzer das Berechnungsergebnis unmittelbar nachvollziehen kann.
- Dieser angezeigte Wert ist nicht durch den Benutzer änderbar. Die Anwendung berechnet ihn aus der jeweils eingegebenen reinen Arbeitszeit und Nachtbereitschaft und aktualisiert die Anzeige bei Änderungen dieser beiden Eingaben.

Gespeicherte Daten müssen dieselbe Beziehung einhalten:

- Jeder Planungseintrag-Snapshot muss einen Wert für Arbeitszeit (mit NB) enthalten, der exakt der Summe aus reiner Arbeitszeit und Nachtbereitschaft entspricht.
- Ob dieser abgeleitete Wert zusätzlich in der zugrunde liegenden Eintragsdefinition gespeichert oder dort nur für die schreibgeschützte Anzeige berechnet wird, ist eine technische Datenmodellentscheidung. Wird er gespeichert, muss er auch dort exakt der Summe entsprechen.
- Ein abweichender Wert wird beim Laden beziehungsweise an der fachlichen Speichergrenze als ungültig abgelehnt.
- Die Anwendung korrigiert einen widersprüchlichen gespeicherten Wert nicht stillschweigend.
- Diese Prüfung setzt die verbindliche Berechnungsformel durch. Sie führt keine darüber hinausgehende Plausibilitätsbeziehung zwischen den voneinander unabhängigen Zeitfeldern ein.

Zwischen Anwesenheitszeit und Arbeitszeit (mit NB) wird keine fachliche Größenbeziehung vorgeschrieben.

- Arbeitszeit (mit NB) wird nicht darauf geprüft, ob sie kleiner oder gleich der Anwesenheitszeit ist.
- Anwesenheitszeit wird weder aus den anderen Zeitwerten berechnet noch als Obergrenze für diese verwendet.
- Dies gilt auch für feste Eintragsdefinitionen.
- Bei der Berechnungsart `Wochenarbeitszeit` bleibt die Anwesenheitszeit deshalb wie festgelegt `0`, obwohl reine Arbeitszeit und Arbeitszeit (mit NB) einen positiven Tageswert besitzen können.

Auch zwischen Nachtarbeit und reiner Arbeitszeit wird keine fachliche Größenbeziehung vorgeschrieben.

- Nachtarbeit wird nicht darauf geprüft, ob sie kleiner oder gleich der reinen Arbeitszeit ist.
- Beide Angaben bleiben eigenständige Zeitwerte des Planungseintrags.
- Ein Nachtarbeitswert oberhalb der reinen Arbeitszeit wird nicht automatisch abgelehnt, korrigiert oder gekürzt.
- Für Auswertungen werden die gespeicherten Snapshot-Werte unverändert verwendet.

#### Wochenarbeitszeit

Beim Setzen eines Planungseintrags wird der individuelle Tageswert des Mitarbeiters berechnet:

`Tageswert = individuelle Wochenarbeitszeit / 5`

Der konkrete Eintrag erhält folgende Werte:

- Reine Arbeitszeit = Tageswert
- Nachtbereitschaft = `0`
- Arbeitszeit (mit NB) = reine Arbeitszeit + Nachtbereitschaft, somit ebenfalls der Tageswert
- Anwesenheitszeit = `0`
- Nachtarbeit = `0`
- Beginn und Ende bleiben leer.

Aufgrund der vorgeschriebenen Fünf-Minuten-Schritte der Wochenarbeitszeit ist der Tageswert immer eine ganze Minute. Eine Rundung oder Resteverteilung ist nicht erforderlich.

Beispiel: Bei einer Wochenarbeitszeit von `39:00` Stunden betragen sowohl die reine Arbeitszeit als auch die Arbeitszeit (mit NB) des Eintrags `7:48` Stunden.

### Snapshot eines Planungseintrags

Die konkreten Werte eines Planungseintrags werden in dem Moment bestimmt, in dem die Eintragsdefinition für einen Mitarbeiter und Kalendertag gesetzt wird. Diese konkreten Werte bilden den Snapshot der Planungszelle.

- Änderungen an der zugrunde liegenden Eintragsdefinition verändern bereits gesetzte Planungseinträge nicht rückwirkend.
- Beim Speichern, Laden oder Auswerten eines Dienstplans wird der bestehende Planungseintrag nicht erneut aus seiner Eintragsdefinition berechnet.
- Das Entfernen eines Planungseintrags entfernt auch dessen Snapshot aus der Planungszelle.
- Wird eine Eintragsdefinition bewusst erneut für die Planungszelle gesetzt, wird der bisherige Snapshot vollständig durch einen neuen Snapshot nach den dann gültigen Regeln und Ausgangsdaten ersetzt.
- Die technische Identität eines gespeicherten Datensatzes ist für diese fachliche Regel ohne Bedeutung; maßgeblich ist die Kombination aus Dienstplan, Kalendertag und Mitarbeiter.

### Mitarbeiter-Snapshot eines Monatsplans

Beim Anlegen eines Monatsplans werden die zu diesem Zeitpunkt aktiven Mitarbeiter als eigener Mitarbeiterstand in den Plan übernommen.

Der Snapshot enthält mindestens:

- Vorname und Nachname,
- Rolle,
- individuelle Wochenarbeitszeit,
- zugeordnete Farbe und
- Reihenfolge innerhalb des Plans.

Für sämtliche Berechnungen und Darstellungen des Monatsplans werden die im Plan gespeicherten Mitarbeiterdaten verwendet.

- Spätere Änderungen in der Teamverwaltung verändern bestehende Monatspläne nicht rückwirkend.
- Dies gilt insbesondere für Änderungen an Rolle und Wochenarbeitszeit.
- Später neu angelegte Mitarbeiter werden nicht automatisch in einen bereits bestehenden Monatsplan aufgenommen.
- Das Deaktivieren oder Löschen eines Mitarbeiter-Stammdatensatzes entfernt dessen Snapshot nicht aus bestehenden Monatsplänen.

Dadurch beruhen die Planungseinträge sowie die Soll- und Ist-Auswertung eines Monatsplans dauerhaft auf demselben Mitarbeiterstand.

### Rollenbezug der Berechnungsarten

- Die Berechnungsarten `Feste Zeitwerte` und `Wochenarbeitszeit` können grundsätzlich für jeden Mitarbeiter eines Monatsplans verwendet werden.
- Die Rolle eines Mitarbeiters schränkt die Auswahl einer Berechnungsart nicht ein.
- Bei `Wochenarbeitszeit` gilt für alle Rollen dieselbe Berechnungsformel.
- Fachlich notwendige Rollenbeschränkungen werden ausschließlich bei der jeweils betroffenen Funktion festgelegt, beispielsweise bei einer Rufbereitschaft.
- Welche Mitarbeiter in bestimmte Auswertungen einbezogen werden, wird bei den jeweiligen Kennzahlen gesondert festgelegt.

### Auswertungskreis der tagesbezogenen Kennzahlen

Folgende tagesbezogene Kennzahlen werden für **jeden Mitarbeiter des Mitarbeiter-Snapshots eines Monatsplans** berechnet und angezeigt:

- SN/F-Dienste,
- freie Tage,
- freie Samstage und
- freie Sonntage.

Die Rolle des Mitarbeiters schränkt diesen Auswertungskreis nicht ein. Die Kennzahlen werden für jeden Mitarbeiter getrennt über die Kalendertage des Monatsplans ermittelt.

Diese Regel gilt nicht automatisch für die Rufbereitschaft. Deren zulässiger Personenkreis wird als eigene Fachregel festgelegt.

### SN/F-Dienste

Die Kennzahl behält die Bezeichnung **SN/F-Dienste** und wird für jeden Mitarbeiter über den gesamten Monatsplan gezählt.

- Ein Planungseintrag erhöht den Zähler um `1`, wenn sein im Snapshot gespeichertes Kürzel exakt `SN/F` oder exakt `SN` lautet.
- Ein Planungseintrag mit dem alleinigen Kürzel `F` erhöht den Zähler nicht.
- Jeder passende Planungseintrag wird einzeln für seinen Kalendertag gezählt.
- Mehrere aufeinanderfolgende Planungseinträge werden nicht zu einer kalendertagübergreifenden Dienstfolge zusammengesetzt. Insbesondere wird eine Folge aus einem `SN`-Eintrag und einem späteren `F`-Eintrag nicht zusätzlich oder nachträglich als gemeinsame Kombination erkannt.
- Die Erkennung beruht im Prototyp bewusst auf den exakten Kürzeltexten. Abweichende Schreibweisen, zusätzliche Leerzeichen oder andere frei angelegte Kürzel werden nicht als SN/F-Dienst erkannt.

Diese Regel ist eine bewusste Vereinfachung für den Prototyp. Fachlich soll die Kennzahl Spät-Nacht-Früh-Dienste erfassen; die frei anlegbaren Kürzel und die Beschränkung eines Planungseintrags auf genau einen Kalendertag erlauben jedoch noch keine zuverlässige semantische Erkennung vollständiger Dienstfolgen. Eine spätere Weiterentwicklung kann dafür ausdrückliche Eintragskategorien und eine kalendertagübergreifende Auswertung einführen.

### Freie Tage

Ein Kalendertag wird für einen Mitarbeiter nur dann als freier Tag gezählt, wenn die zugehörige Planungszelle einen Planungseintrag mit dem im Snapshot gespeicherten exakten Kürzel `/` enthält.

- Jeder passende Planungseintrag erhöht die Anzahl der freien Tage dieses Mitarbeiters um `1`.
- Eine leere Planungszelle bedeutet „noch ungeplant“ und wird nicht als freier Tag gezählt.
- Abweichende Kürzel oder Kürzel mit zusätzlichen Zeichen beziehungsweise Leerzeichen gelten nicht als Frei-Eintrag.
- Maßgeblich ist der Snapshot des konkreten Planungseintrags. Eine spätere Änderung der zugrunde liegenden Eintragsdefinition verändert die Zählung eines bereits gesetzten Eintrags nicht.

### Freie Samstage und freie Sonntage

Freie Samstage und freie Sonntage sind kalenderabhängige Teilmengen der freien Tage.

- Ein Frei-Eintrag mit dem exakten Snapshot-Kürzel `/` an einem Samstag erhöht sowohl die Anzahl der freien Tage als auch die Anzahl der freien Samstage dieses Mitarbeiters jeweils um `1`.
- Ein Frei-Eintrag mit dem exakten Snapshot-Kürzel `/` an einem Sonntag erhöht sowohl die Anzahl der freien Tage als auch die Anzahl der freien Sonntage dieses Mitarbeiters jeweils um `1`.
- Maßgeblich ist der tatsächliche Wochentag des Kalendertages im Monatsplan.
- Der Feiertagsstatus verändert diese Einordnung nicht. Ein freier Sonntag bleibt beispielsweise auch dann ein freier Sonntag, wenn er zugleich ein gesetzlicher Feiertag ist.
- Ein Feiertag an einem anderen Wochentag wird dadurch nicht als freier Samstag oder freier Sonntag gezählt.
- Eine leere Planungszelle erhöht auch am Wochenende keinen dieser Zähler.

### Zulässiger Personenkreis der Rufbereitschaft

Eine Rufbereitschaft darf ausschließlich einem Mitarbeiter zugeordnet werden, dessen Rolle im Mitarbeiter-Snapshot des betreffenden Monatsplans `Erzieher` ist.

- Maßgeblich ist die im Monatsplan gespeicherte Rolle und nicht der aktuelle Mitarbeiter-Stammdatensatz.
- Mitarbeiter mit einer anderen Rolle dürfen für die Rufbereitschaft nicht ausgewählt oder gespeichert werden.
- Eine spätere Änderung des Mitarbeiter-Stammdatensatzes verändert die Rufbereitschaften und Auswertungen bestehender Monatspläne nicht rückwirkend.
- Die Rollenregel muss beim Speichern fachlich geprüft werden und darf nicht nur durch die Auswahlmöglichkeiten der Bedienoberfläche abgesichert sein.

### Zählung der Rufbereitschaften

Für jeden Kalendertag eines Monatsplans kann keine oder genau eine Rufbereitschaft festgelegt werden.

- Eine Rufbereitschaft wird genau einem dafür zulässigen Mitarbeiter zugeordnet.
- Der Kalendertag erhöht die Anzahl der Rufbereitschaften dieses Mitarbeiters um `1`.
- Für alle anderen Mitarbeiter erhöht dieser Kalendertag den Rufbereitschaftszähler nicht.
- Die monatliche Anzahl der Rufbereitschaften eines Mitarbeiters entspricht der Anzahl der Kalendertage, an denen ihm die Rufbereitschaft zugeordnet ist.
- Wird die Zuordnung eines Kalendertages auf einen anderen zulässigen Mitarbeiter geändert, entfällt der Zählerpunkt bei der bisherigen Person und wird der neuen Person zugerechnet.
- Wird die Rufbereitschaft eines Kalendertages entfernt, entfällt der zugehörige Zählerpunkt ersatzlos.
- Mehrere Rufbereitschaften am selben Kalendertag sind nicht zulässig.

### Rufbereitschaft und Planungseintrag am selben Tag

Die Rufbereitschaft und der normale Planungseintrag eines Mitarbeiters sind voneinander unabhängige Angaben.

- Eine Rufbereitschaft darf gemeinsam mit jedem zulässigen Planungseintrag desselben Mitarbeiters und Kalendertages bestehen.
- Dies gilt im Prototyp ausdrücklich auch für einen Frei-Eintrag mit dem Kürzel `/`.
- Der Planungseintrag wirkt auf die zugehörigen Dienst- oder Frei-Kennzahlen; die Rufbereitschaft erhöht unabhängig davon den Rufbereitschaftszähler.
- Ein Kalendertag kann dadurch für denselben Mitarbeiter gleichzeitig beispielsweise als freier Tag und als Rufbereitschaft gezählt werden.
- Aus der Kombination werden keine zusätzlichen Zeitwerte oder weiteren Kennzahlen abgeleitet.
- Der Prototyp prüft keine fachliche Plausibilität bestimmter Kombinationen. Solche Einschränkungen dürfen erst ergänzt werden, wenn dafür konkrete fachliche Regeln festgelegt wurden.

### Berechnungsstand während der Bearbeitung

Während der Bearbeitung eines Monatsplans werden die tagesbezogenen und zeitbezogenen Monatskennzahlen einschließlich Soll-Arbeitszeit, Ist-Arbeitszeit und Soll-/Ist-Differenz unmittelbar aus dem aktuellen Planentwurf berechnet.

- Noch nicht gespeicherte Änderungen an Planungseinträgen und Rufbereitschaften werden sofort in den angezeigten Kennzahlen berücksichtigt.
- Die Kennzahlen dienen während der Bearbeitung als Live-Vorschau des aktuellen Entwurfs.
- Das Setzen, Ersetzen oder Entfernen eines Planungseintrags aktualisiert insbesondere die betroffenen Zeit-Monatssummen, Zuschläge, die Ist-Arbeitszeit und die Soll-/Ist-Differenz unmittelbar.
- Die Soll-Arbeitszeit bleibt bei einer reinen Änderung von Planungseinträgen unverändert, da sie ausschließlich aus der berechneten Arbeitstagszahl und der Wochenarbeitszeit des Mitarbeiter-Snapshots entsteht.
- Eine verbindliche Ausgabe, beispielsweise ein Export oder ein als abgeschlossen behandelter Monatsplan, darf ausschließlich auf dem gespeicherten Stand beruhen.
- Enthält der Entwurf noch ungespeicherte Änderungen, muss er vor einer verbindlichen Ausgabe gespeichert werden.
- Entwurfsstand und gespeicherter Stand müssen für den Benutzer eindeutig unterscheidbar sein.

### Monatliche Arbeitszeit (mit NB)

Die monatliche Arbeitszeit (mit NB) eines Mitarbeiters wird durch Addition der berechneten Arbeitszeit (mit NB) aller seiner Planungseinträge im Monatsplan gebildet:

`Monatliche Arbeitszeit (mit NB) = Summe der Arbeitszeit (mit NB) aller Planungseinträge des Mitarbeiters`

- Für jeden Planungseintrag gilt zuvor: `Arbeitszeit (mit NB) = reine Arbeitszeit + Nachtbereitschaft`.
- Jeder Planungseintrag trägt diesen berechneten und im Snapshot gespeicherten Wert zur Monatssumme bei.
- Leere Planungszellen tragen `0` Minuten bei.
- Reine Arbeitszeit und Nachtbereitschaft werden zusätzlich als eigenständige Zeitwerte getrennt ausgewertet.
- Da ausschließlich bereits ganzzahlige Minutenwerte addiert werden, ist für diese Summe keine weitere Rundung erforderlich.

### Einfache zeitbezogene Monatssummen

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

### Gemeinsame Kennzahl für Sonntage und gesetzliche Feiertage

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

### Nachtzuschlag

Der Nachtzuschlag eines Mitarbeiters wird als Zeitgutschrift in ganzen Minuten aus seiner gesamten monatlichen Nachtarbeit berechnet:

`Nachtzuschlag = Rundung(monatliche Nachtarbeit × 20 %)`

- Berechnungsgrundlage ist die bereits gebildete Summe der Nachtarbeit aller Planungseinträge des Mitarbeiters im Kalendermonat.
- Der Prozentsatz wird nicht für jeden einzelnen Planungseintrag angewendet. Zuerst wird die monatliche Nachtarbeit vollständig summiert, anschließend werden `20 %` berechnet.
- Das Ergebnis wird danach genau einmal nach der allgemeinen Rundungsmethode auf eine volle Minute gerundet.
- Der Nachtzuschlag ist eine Zeitgutschrift in Minuten und kein Geldbetrag.
- Der Nachtzuschlag wird als eigene Kennzahl berechnet und angezeigt, fließt aber nicht in die monatliche Ist-Arbeitszeit ein.

### Nachtbereitschaftszuschlag

Der Nachtbereitschaftszuschlag eines Mitarbeiters wird als Zeitgutschrift in ganzen Minuten aus seiner gesamten monatlichen Nachtbereitschaft berechnet:

`Nachtbereitschaftszuschlag = Rundung(monatliche Nachtbereitschaft × 25 %)`

- Berechnungsgrundlage ist die bereits gebildete Summe der Nachtbereitschaft aller Planungseinträge des Mitarbeiters im Kalendermonat.
- Der Prozentsatz wird nicht für jeden einzelnen Planungseintrag angewendet. Zuerst wird die monatliche Nachtbereitschaft vollständig summiert, anschließend werden `25 %` berechnet.
- Das Ergebnis wird danach genau einmal nach der allgemeinen Rundungsmethode auf eine volle Minute gerundet.
- Der Nachtbereitschaftszuschlag ist eine Zeitgutschrift in Minuten und kein Geldbetrag.
- Der Nachtbereitschaftszuschlag fließt nach der festgelegten Ist-Formel vollständig in die monatliche Ist-Arbeitszeit ein.

### Rollenbezug der zeitbezogenen Kennzahlen

#### Berechnungsregel

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

#### Darstellungsregel

- In der vorgesehenen zeitbezogenen Auswertung werden ausschließlich Mitarbeiter aufgelistet, deren Rolle im Mitarbeiter-Snapshot des Monatsplans `Erzieher` ist.
- Maßgeblich für diesen Darstellungsfilter ist die im Monatsplan gespeicherte Rolle und nicht der aktuelle Mitarbeiter-Stammdatensatz.
- Mitarbeiter mit einer anderen Rolle bleiben mit ihren Planungseinträgen Bestandteil des Monatsplans. Ihre Zeitwerte sind nach denselben Formeln berechenbar, werden in dieser Auswertung jedoch nicht aufgelistet.
- Ein Rollenfilter einer Oberfläche ist eine Darstellungsregel und kein Bestandteil der jeweiligen Berechnungsformel.
- Welche Kennzahlen eine andere konkrete Seite, Tabelle oder sonstige Oberfläche anzeigt, wird bei der betreffenden Funktion festgelegt. Daraus entsteht keine allgemeine Rollenabhängigkeit der Berechnungen.

### Deaktivierte oder gelöschte Eintragsdefinitionen

- Bereits bestehende Planungseinträge bleiben mit ihren vollständigen Snapshots erhalten, wenn die zugrunde liegende Eintragsdefinition später deaktiviert oder gelöscht wird.
- Eine deaktivierte oder gelöschte Definition wird nicht mehr für neue Planungseinträge angeboten.
- Der Snapshot enthält die Herkunfts-ID, das Kürzel, die Bezeichnung, Beginn und Ende sowie sämtliche konkreten Zeitwerte der Planungszelle.
- Die Herkunfts-ID dokumentiert die ursprüngliche Eintragsdefinition, erzeugt aber keine fortbestehende Abhängigkeit zu deren Stammdatensatz.
- Deaktivieren oder Löschen führt weder zu einer rückwirkenden Neuberechnung noch zu einem Datenverlust in bestehenden Monatsplänen.

### Monatliche Soll-Arbeitszeit

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

### Monatliche Ist-Arbeitszeit

Die monatliche Ist-Arbeitszeit eines Mitarbeiters wird wie im Altsystem aus seiner monatlichen reinen Arbeitszeit und seinem Nachtbereitschaftszuschlag gebildet:

`Monatliche Ist-Arbeitszeit = monatliche reine Arbeitszeit + Nachtbereitschaftszuschlag`

- Die monatliche reine Arbeitszeit ist die unveränderte Summe der reinen Arbeitszeit aller Planungseintrag-Snapshots des Mitarbeiters.
- Der Nachtbereitschaftszuschlag beträgt nach der bereits festgelegten Regel einmalig gerundete `25 %` der gesamten monatlichen Nachtbereitschaft.
- Der Nachtzuschlag von `20 %` wird als eigene Zeitgutschrift berechnet und angezeigt, fließt aber nicht in die Ist-Arbeitszeit ein.
- Die vollständige Nachtbereitschaft und die daraus gebildete Arbeitszeit (mit NB) fließen ebenfalls nicht in die Ist-Arbeitszeit ein.
- Nachtarbeit, Arbeitszeit an Sonntagen und gesetzlichen Feiertagen, Anwesenheitszeit, Rufbereitschaften und tagesbezogene Zähler werden nicht zusätzlich zum Ist addiert.
- Beide Summanden liegen bereits als ganze Minutenwerte vor. Nach ihrer Addition findet keine weitere Rundung statt.
- Die monatliche Arbeitszeit (mit NB) bleibt eine von der Ist-Arbeitszeit getrennte Informationskennzahl.

### Soll-/Ist-Differenz

Die monatliche Soll-/Ist-Differenz eines Mitarbeiters wird aus seiner monatlichen Ist-Arbeitszeit und seiner monatlichen Soll-Arbeitszeit gebildet:

`Soll-/Ist-Differenz = monatliche Ist-Arbeitszeit − monatliche Soll-Arbeitszeit`

- Ein positiver Wert bedeutet, dass die Ist-Arbeitszeit über der Soll-Arbeitszeit liegt.
- Ein negativer Wert bedeutet, dass die Soll-Arbeitszeit noch nicht erreicht ist.
- `0` Minuten bedeuten einen exakten Ausgleich.
- Soll- und Ist-Arbeitszeit liegen bereits als ganze Minutenwerte vor. Die Differenz wird deshalb nicht zusätzlich gerundet.
- Positive Differenzen werden mit einem Pluszeichen und negative Differenzen mit einem Minuszeichen dargestellt.
- Ein exakter Ausgleich wird als `00:00` ohne Vorzeichen dargestellt.

### Durchgängiges Monatsbeispiel

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
