# Planungseinträge und Snapshots

## Berechnungsarten von Planungseinträgen

Jede Planungseintragsdefinition besitzt ausdrücklich eine der beiden Berechnungsarten `Feste Zeitwerte` oder `Wochenarbeitszeit`. Die Berechnungsart wird nicht aus dem Kürzel oder der Bezeichnung abgeleitet.

Für das neue Projekt gelten folgende Begriffe:

- **Reine Arbeitszeit** bezeichnet die Arbeitszeit ohne Nachtbereitschaft.
- **Arbeitszeit (mit NB)** bezeichnet die Summe aus reiner Arbeitszeit und vollständiger Nachtbereitschaft. Sie ist eine eigene Informationskennzahl und nicht mit der monatlichen Ist-Arbeitszeit gleichzusetzen.

### Feste Zeitwerte

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

### Wochenarbeitszeit

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

## Snapshot eines Planungseintrags

Die konkreten Werte eines Planungseintrags werden in dem Moment bestimmt, in dem die Eintragsdefinition für einen Mitarbeiter und Kalendertag gesetzt wird. Diese konkreten Werte bilden den Snapshot der Planungszelle.

- Änderungen an der zugrunde liegenden Eintragsdefinition verändern bereits gesetzte Planungseinträge nicht rückwirkend.
- Beim Speichern, Laden oder Auswerten eines Dienstplans wird der bestehende Planungseintrag nicht erneut aus seiner Eintragsdefinition berechnet.
- Das Entfernen eines Planungseintrags entfernt auch dessen Snapshot aus der Planungszelle.
- Wird eine Eintragsdefinition bewusst erneut für die Planungszelle gesetzt, wird der bisherige Snapshot vollständig durch einen neuen Snapshot nach den dann gültigen Regeln und Ausgangsdaten ersetzt.
- Die technische Identität eines gespeicherten Datensatzes ist für diese fachliche Regel ohne Bedeutung; maßgeblich ist die Kombination aus Dienstplan, Kalendertag und Mitarbeiter.

## Mitarbeiter-Snapshot eines Monatsplans

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

## Rollenbezug der Berechnungsarten

- Die Berechnungsarten `Feste Zeitwerte` und `Wochenarbeitszeit` können grundsätzlich für jeden Mitarbeiter eines Monatsplans verwendet werden.
- Die Rolle eines Mitarbeiters schränkt die Auswahl einer Berechnungsart nicht ein.
- Bei `Wochenarbeitszeit` gilt für alle Rollen dieselbe Berechnungsformel.
- Fachlich notwendige Rollenbeschränkungen werden ausschließlich bei der jeweils betroffenen Funktion festgelegt, beispielsweise bei einer Rufbereitschaft.
- Welche Mitarbeiter in bestimmte Auswertungen einbezogen werden, wird bei den jeweiligen Kennzahlen gesondert festgelegt.

## Berechnungsstand während der Bearbeitung

Während der Bearbeitung eines Monatsplans werden die tagesbezogenen und zeitbezogenen Monatskennzahlen einschließlich Soll-Arbeitszeit, Ist-Arbeitszeit und Soll-/Ist-Differenz unmittelbar aus dem aktuellen Planentwurf berechnet.

- Noch nicht gespeicherte Änderungen an Planungseinträgen und Rufbereitschaften werden sofort in den angezeigten Kennzahlen berücksichtigt.
- Die Kennzahlen dienen während der Bearbeitung als Live-Vorschau des aktuellen Entwurfs.
- Das Setzen, Ersetzen oder Entfernen eines Planungseintrags aktualisiert insbesondere die betroffenen Zeit-Monatssummen, Zuschläge, die Ist-Arbeitszeit und die Soll-/Ist-Differenz unmittelbar.
- Die Soll-Arbeitszeit bleibt bei einer reinen Änderung von Planungseinträgen unverändert, da sie ausschließlich aus der berechneten Arbeitstagszahl und der Wochenarbeitszeit des Mitarbeiter-Snapshots entsteht.
- Eine verbindliche Ausgabe, beispielsweise ein Export oder ein als abgeschlossen behandelter Monatsplan, darf ausschließlich auf dem gespeicherten Stand beruhen.
- Enthält der Entwurf noch ungespeicherte Änderungen, muss er vor einer verbindlichen Ausgabe gespeichert werden.
- Entwurfsstand und gespeicherter Stand müssen für den Benutzer eindeutig unterscheidbar sein.

## Deaktivierte oder gelöschte Eintragsdefinitionen

- Bereits bestehende Planungseinträge bleiben mit ihren vollständigen Snapshots erhalten, wenn die zugrunde liegende Eintragsdefinition später deaktiviert oder gelöscht wird.
- Eine deaktivierte oder gelöschte Definition wird nicht mehr für neue Planungseinträge angeboten.
- Der Snapshot enthält die Herkunfts-ID, das Kürzel, die Bezeichnung, Beginn und Ende sowie sämtliche konkreten Zeitwerte der Planungszelle.
- Die Herkunfts-ID dokumentiert die ursprüngliche Eintragsdefinition, erzeugt aber keine fortbestehende Abhängigkeit zu deren Stammdatensatz.
- Deaktivieren oder Löschen führt weder zu einer rückwirkenden Neuberechnung noch zu einem Datenverlust in bestehenden Monatsplänen.
