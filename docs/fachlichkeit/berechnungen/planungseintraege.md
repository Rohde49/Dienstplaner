# Berechnungen von Planungseinträgen

Dieses Dokument beschreibt, wie die konkreten Zeitwerte eines
Planungseintrags bestimmt werden. Beziehungen und Lebenszyklus der beteiligten
Snapshots werden im [fachlichen Datenmodell](../datenmodell.md) beschrieben.

## Begriffe

- **Reine Arbeitszeit** ist die Arbeitszeit ohne Nachtbereitschaft.
- **Arbeitszeit (mit NB)** ist die Summe aus reiner Arbeitszeit und vollständiger
  Nachtbereitschaft. Sie ist nicht mit der monatlichen Ist-Arbeitszeit
  gleichzusetzen.

Jede Eintragsart besitzt ausdrücklich eine der Berechnungsarten `Feste
Zeitwerte`, `Wochenarbeitszeit` oder `Freier Tag`. Die Berechnungsart wird nicht
aus Kürzel oder Bezeichnung abgeleitet.

## Feste Zeitwerte

Beim Setzen eines Planungseintrags werden die folgenden Werte aus der gewählten
Eintragsart übernommen:

- Kürzel und Bezeichnung,
- optionale Start- und Endzeit,
- Anwesenheitszeit,
- reine Arbeitszeit,
- Nachtbereitschaft und
- Nachtarbeit.

Die Arbeitszeit mit Nachtbereitschaft wird abgeleitet:

`Arbeitszeit (mit NB) = reine Arbeitszeit + Nachtbereitschaft`

- Arbeitszeit mit Nachtbereitschaft ist kein unabhängig pflegbarer Wert.
- Ein davon abweichender gespeicherter Wert ist ungültig und wird nicht
  stillschweigend korrigiert.
- Anwesenheitszeit und Nachtarbeit werden durch diese Formel nicht verändert.

Zwischen den übrigen Zeitwerten bestehen im Prototyp keine zusätzlichen
Größenbeziehungen:

- Arbeitszeit mit Nachtbereitschaft muss nicht kleiner oder gleich der
  Anwesenheitszeit sein.
- Nachtarbeit muss nicht kleiner oder gleich der reinen Arbeitszeit sein.
- Die Werte werden weder automatisch gekürzt noch gegenseitig abgeleitet.

Diese Begrenzung ist bewusst. Zusätzliche Plausibilitätsregeln dürfen erst
eingeführt werden, wenn sie fachlich festgelegt wurden.

## Wochenarbeitszeit

Bei dieser Berechnungsart wird der Tageswert aus der Wochenarbeitszeit des im
Monatsplan gespeicherten Mitarbeiters bestimmt:

`Tageswert = individuelle Wochenarbeitszeit / 5`

Der konkrete Planungseintrag erhält:

| Zeitwert             |    Ergebnis |
| -------------------- | ----------: |
| Reine Arbeitszeit    |   Tageswert |
| Arbeitszeit (mit NB) |   Tageswert |
| Anwesenheitszeit     | `0` Minuten |
| Nachtbereitschaft    | `0` Minuten |
| Nachtarbeit          | `0` Minuten |

Beginn und Ende bleiben leer. Aufgrund der Fünf-Minuten-Schritte der
Wochenarbeitszeit ist keine Rundung oder Resteverteilung erforderlich.

Beispiel: Bei `39:00` Stunden Wochenarbeitszeit betragen die reine Arbeitszeit
und die Arbeitszeit mit Nachtbereitschaft jeweils `7:48` Stunden.

## Freier Tag

Diese Berechnungsart kennzeichnet einen Planungseintrag fachlich als freien Tag.
Das frei vergebene Kürzel ist dafür unerheblich; dadurch können beispielsweise
`/` und `WF` dieselbe Zählwirkung besitzen.

Beginn und Ende bleiben leer. Anwesenheitszeit, reine Arbeitszeit, Arbeitszeit
mit Nachtbereitschaft, Nachtbereitschaft und Nachtarbeit betragen jeweils `0`
Minuten. Beim Wechsel zu dieser Berechnungsart werden zuvor eingegebene
Uhrzeiten und Zeitwerte verworfen.

Beim Einplanen wird die Freier-Tag-Eigenschaft zusätzlich zu den konkreten
Nullwerten in den Snapshot übernommen. Sie bleibt dadurch auch dann erhalten,
wenn die zugrunde liegende Eintragsart später geändert oder gelöscht wird.

## Zeitpunkt und Bestand der Berechnung

Die konkreten Werte werden bestimmt, wenn eine Eintragsart für einen
Mitarbeiter und einen Kalendertag gesetzt wird. Dabei entsteht ein vollständiger
Snapshot des Planungseintrags.

- Bestehende Planungseinträge werden beim Laden oder Auswerten nicht erneut aus
  der aktuellen Eintragsart berechnet.
- Wird eine Eintragsart später geändert, deaktiviert oder gelöscht, bleiben
  vorhandene Planungseinträge unverändert.
- Wird in einer Planungszelle bewusst erneut eine Eintragsart gesetzt, wird der
  bisherige fachliche Snapshot vollständig nach den dann geltenden Regeln und
  Ausgangsdaten ersetzt.
- Für die Berechnungsart `Wochenarbeitszeit` bleibt die im Monatsplan
  gespeicherte Wochenarbeitszeit maßgeblich. Änderungen an den aktuellen
  Mitarbeiter-Stammdaten wirken nicht rückwirkend.
- Für die Berechnungsart `Freier Tag` bleibt die im Planungseintrag gespeicherte
  Freier-Tag-Kennzeichnung maßgeblich.

## Rollenbezug

Die drei Berechnungsarten können für jeden Mitarbeiter eines Monatsplans
verwendet werden. Die Mitarbeiterrolle verändert ihre Berechnungsformeln
nicht. Rollenbeschränkungen gelten nur dort, wo sie ausdrücklich fachlich
festgelegt sind, beispielsweise bei der Rufbereitschaft.
