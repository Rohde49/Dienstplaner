# Planungseinträge

Die Verwaltung der Planungseinträge pflegt wiederverwendbare Eintragsarten für
die Dienstplanung. Dieses Dokument beschreibt ihren fachlichen Zweck, ihre
Bedienregeln und ihre Wechselwirkung mit Monatsplänen.

## Begriffsklärung

In der Benutzeroberfläche werden die zentral verwalteten Vorlagen als
**Planungseinträge** bezeichnet. Im fachlichen Datenmodell sind dies
**Eintragsarten** (`EntryType`).

Erst wenn eine Eintragsart für einen Mitarbeiter und einen Tag ausgewählt wird,
entsteht im Monatsplan ein konkreter **Planungseintrag** (`PlanEntry`). Dieser
enthält einen eigenen Snapshot und bleibt anschließend von der Eintragsart
unabhängig.

## Zweck und Umfang

Die Verwaltung ermöglicht:

- alle gespeicherten Eintragsarten anzuzeigen,
- neue Eintragsarten anzulegen,
- vorhandene Eintragsarten zu bearbeiten,
- Eintragsarten zu aktivieren oder zu deaktivieren,
- Eintragsarten nach ausdrücklicher Bestätigung dauerhaft zu löschen,
- die Berechnungsart festzulegen und
- die dafür benötigten Uhrzeiten und Zeitwerte zu pflegen.

Die Verwaltung setzt selbst keine Einträge in einen Monatsplan. Änderungen an
Eintragsarten dürfen bereits vorhandene Planungseinträge nicht rückwirkend
verändern.

## Daten einer Eintragsart

| Angabe                            | Bedeutung                                                      |
| --------------------------------- | -------------------------------------------------------------- |
| Kürzel                            | Kurze sichtbare Kennzeichnung im Dienstplan                    |
| Bezeichnung                       | Verständlicher Name der Eintragsart                            |
| Berechnungsart                    | Bestimmt die Zeitwerte eines späteren Planungseintrags         |
| Start- und Endzeit                | Optionale Uhrzeiten für Beginn und Ende                        |
| Anwesenheitszeit                  | Hinterlegte Anwesenheitsdauer                                  |
| Reine Arbeitszeit                 | Arbeitszeit ohne Nachtbereitschaft                             |
| Nachtbereitschaft                 | Hinterlegte passive Arbeitszeit während eines Nachtdienstes    |
| Nachtarbeit                       | Gesondert ausgewiesener Anteil der reinen Arbeitszeit          |
| Arbeitszeit mit Nachtbereitschaft | Abgeleitete Summe aus reiner Arbeitszeit und Nachtbereitschaft |
| Status                            | Kennzeichnung als aktiv oder inaktiv                           |

Jede Eintragsart besitzt eine eigene UUID. Sie bleibt beim Bearbeiten erhalten.
Kürzel und Bezeichnung dienen der Anzeige und müssen nicht eindeutig sein.
Erstellungs- und Änderungszeitpunkte verwaltet die Anwendung.

Eine allgemeine Kategorie wie Dienst, Abwesenheit oder Frei gehört nicht zum
Modell. Die Berechnungsart wird ausdrücklich ausgewählt und nicht aus dem Kürzel
oder der Bezeichnung abgeleitet.

## Übersicht

Die Übersicht zeigt alle Eintragsarten unabhängig von ihrem Aktivierungsstatus.
Mindestens folgende Informationen sind sichtbar:

- Kürzel und Bezeichnung,
- optionale Start- und Endzeit,
- Berechnungsart,
- reine Arbeitszeit und
- Status.

Bei der Berechnungsart `Wochenarbeitszeit` wird anstelle eines festen Wertes die
Formel `Wochenarbeitszeit ÷ 5` angezeigt. Fehlen Start- und Endzeit, wird dies
ausdrücklich als „Keine Uhrzeit“ dargestellt.

Zusätzlich zeigt die Seite die Gesamtzahl aller Eintragsarten und die Anzahl der
aktiven Eintragsarten. Ein leerer Datenbestand und ein Ladefehler werden als
eigene Zustände dargestellt; nach einem Ladefehler ist ein erneuter Versuch
möglich.

## Eintragsart anlegen und bearbeiten

Neue Eintragsarten sind standardmäßig aktiv und verwenden standardmäßig die
Berechnungsart `Feste Zeitwerte`. Nach erfolgreichem Speichern erscheinen sie
unmittelbar in der Übersicht.

Beim Bearbeiten können Kürzel, Bezeichnung, Berechnungsart, Uhrzeiten, Zeitwerte
und Status geändert werden. Die UUID und der Erstellungszeitpunkt bleiben
erhalten; der Änderungszeitpunkt wird durch die Anwendung aktualisiert.

Wird von `Feste Zeitwerte` zu `Wochenarbeitszeit` gewechselt, werden vorhandene
Uhrzeiten und eingegebene Zeitwerte geleert. Sie werden nicht im Hintergrund
beibehalten. Bei einem späteren Wechsel zurück müssen feste Werte erneut
eingegeben werden.

Schlägt das Anlegen oder Bearbeiten fehl, wird der Fehler im geöffneten Dialog
angezeigt. Der zuletzt dauerhaft gespeicherte Stand bleibt maßgeblich.

## Berechnungsarten

Jede Eintragsart besitzt genau eine der folgenden Berechnungsarten.

### Feste Zeitwerte

Bei festen Zeitwerten werden die benötigten Dauern direkt in der Eintragsart
hinterlegt. Start- und Endzeit können zusätzlich gemeinsam angegeben werden,
werden aber nicht zur automatischen Berechnung der Dauern verwendet.

Direkt eingegeben werden:

- Anwesenheitszeit,
- reine Arbeitszeit,
- Nachtbereitschaft und
- Nachtarbeit.

Die Arbeitszeit mit Nachtbereitschaft ist nicht separat änderbar. Sie wird
nach der zentral festgelegten Berechnungsregel automatisch angezeigt. Die
übrigen Zeitwerte werden unabhängig voneinander eingegeben und nicht aus den
Uhrzeiten abgeleitet.

### Wochenarbeitszeit

Bei dieser Berechnungsart werden in der Eintragsart keine festen Uhrzeiten oder
Zeitwerte verwendet. Die entsprechenden Felder sind deaktiviert; gespeichert
werden leere Uhrzeiten und Nullwerte.

Erst beim Einplanen werden die konkreten Werte aus der im Monatsplan
gespeicherten Wochenarbeitszeit des betroffenen Planmitarbeiters bestimmt.
Uhrzeiten, Anwesenheitszeit, Nachtbereitschaft und Nachtarbeit bleiben dabei
leer beziehungsweise bei `0` Minuten.

Die vollständigen und zentral gepflegten Regeln stehen unter
[Berechnungen von Planungseinträgen](../fachlichkeit/berechnungen/planungseintraege.md).

## Eingaberegeln

### Kürzel und Bezeichnung

- Kürzel und Bezeichnung sind Pflichtangaben.
- Äußere Leerzeichen werden entfernt.
- Das Kürzel darf höchstens 20 Zeichen enthalten.
- Die Bezeichnung darf höchstens 100 Zeichen enthalten.
- Mehrere Eintragsarten dürfen dasselbe Kürzel oder dieselbe Bezeichnung
  besitzen; entscheidend ist ihre UUID.

### Start- und Endzeit

- Beide Uhrzeiten sind optional, müssen aber immer gemeinsam angegeben oder
  gemeinsam leer gelassen werden.
- Das verbindliche Format ist `HH:MM` mit einem Doppelpunkt.
- Zulässig sind Uhrzeiten von `00:00` bis `23:59`.
- Ein Ende am Folgetag ist möglich; deshalb muss die Endzeit nicht nach der
  Startzeit liegen.
- Bei der Berechnungsart `Wochenarbeitszeit` sind keine Uhrzeiten zulässig.

### Zeitwerte

- Bei `Feste Zeitwerte` sind alle direkt pflegbaren Zeitwerte erforderlich.
- Das verbindliche Eingabeformat ist `H:MM` mit einem Doppelpunkt,
  beispielsweise `5:30` oder `120:15`.
- Die Werte sind nichtnegative Dauern in ganzen Minuten und dürfen mehr als 24
  Stunden umfassen.
- Ein Zeitwert von `0:00` ist zulässig.
- Bei `Wochenarbeitszeit` sind keine festen Zeitwerte zulässig.

Allgemeine Regeln für Zeitdauern und Uhrzeiten stehen unter
[Zeitbasis und Rundung](../fachlichkeit/berechnungen/zeitbasis-und-rundung.md).

### Fehlerbehandlung

Ungültige oder unvollständige Eingaben verhindern das Speichern. Die betroffenen
Felder werden mit verständlichen Hinweisen gekennzeichnet, und der Eingabefokus
wird auf das erste ungültige Feld gesetzt. Während eines Speichervorgangs kann
der Dialog nicht geschlossen oder erneut abgesendet werden.

## Aktivieren und deaktivieren

Inaktive Eintragsarten bleiben vollständig in der Verwaltung erhalten. Sie
können weiterhin bearbeitet, wieder aktiviert oder gelöscht werden.

Nur aktive Eintragsarten dürfen neu in einen Monatsplan gesetzt werden. Eine
spätere Aktivierung oder Deaktivierung verändert bestehende Planungseinträge
nicht.

## Eintragsart löschen

Das Löschen entfernt eine Eintragsart dauerhaft aus den Stammdaten und kann
nicht rückgängig gemacht werden. Deshalb muss der Benutzer den Vorgang zuvor
ausdrücklich bestätigen.

Während des Löschvorgangs kann die Aktion nicht mehrfach ausgelöst oder der
Bestätigungsdialog geschlossen werden. Schlägt das Löschen fehl, bleibt die
Eintragsart erhalten und der Fehler wird angezeigt.

Bereits vorhandene Planungseinträge bleiben nach dem Löschen vollständig
nutzbar, weil sie die benötigten Daten als unabhängige Snapshots enthalten.

## Wechselwirkung mit Monatsplänen

Beim Setzen oder bewussten Ersetzen eines Planungseintrags werden insbesondere
folgende Werte neu aus der aktiven Eintragsart übernommen oder bestimmt:

- Herkunfts-ID der Eintragsart,
- Kürzel und Bezeichnung,
- optionale Start- und Endzeit sowie
- alle berechnungsrelevanten Zeitwerte.

Der konkrete Planungseintrag erhält eine eigene UUID. Sein Snapshot wird beim
späteren Laden oder Auswerten nicht erneut aus den aktuellen Stammdaten
berechnet. Änderungen, Deaktivierung oder Löschung der Eintragsart verändern ihn
daher nicht.

Die Beziehungen und Lebenszyklen werden zentral im
[fachlichen Datenmodell](../fachlichkeit/datenmodell.md) beschrieben.

## Abgrenzung

Nicht zu dieser Verwaltung gehören:

- das Setzen oder Entfernen konkreter Einträge im Monatsplan,
- eine rückwirkende Synchronisierung bestehender Planungseinträge,
- eine automatische Ableitung von Zeitwerten aus Start- und Endzeit,
- eine automatische fachliche Plausibilisierung aller Zeitwerte,
- eine Ableitung der Berechnungsart aus Kürzel oder Bezeichnung und
- eine allgemeine fachliche Kategorie der Eintragsart.
