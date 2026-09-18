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
- die sichtbare Reihenfolge der Eintragsarten festzulegen,
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
| Berechnungsart                    | Bestimmt Zeitwerte und die mögliche Freier-Tag-Wirkung         |
| Start- und Endzeit                | Optionale Uhrzeiten für Beginn und Ende                        |
| Anwesenheitszeit                  | Abgeleitete Summe aus Arbeitszeit mit NB und Pause             |
| Reine Arbeitszeit                 | Arbeitszeit ohne Nachtbereitschaft                             |
| Nachtbereitschaft                 | Hinterlegte passive Arbeitszeit während eines Nachtdienstes    |
| Pause                             | Hinterlegte Unterbrechung innerhalb der Anwesenheitszeit       |
| Nachtarbeit                       | Gesondert ausgewiesener Anteil der reinen Arbeitszeit          |
| Arbeitszeit mit Nachtbereitschaft | Abgeleitete Summe aus reiner Arbeitszeit und Nachtbereitschaft |
| Status                            | Kennzeichnung als aktiv oder inaktiv                           |

Jede Eintragsart besitzt eine eigene UUID. Sie bleibt beim Bearbeiten erhalten.
Kürzel und Bezeichnung dienen der Anzeige und müssen nicht eindeutig sein.
Erstellungs- und Änderungszeitpunkte verwaltet die Anwendung.

Eine allgemeine Kategorie wie Dienst oder Abwesenheit gehört nicht zum Modell.
Die fachliche Wirkung als freier Tag ist dagegen Bestandteil der ausdrücklich
gewählten Berechnungsart und wird nicht aus dem Kürzel oder der Bezeichnung
abgeleitet.

## Übersicht

Die Übersicht zeigt alle Eintragsarten unabhängig von ihrem Aktivierungsstatus.
Mindestens folgende Informationen sind sichtbar:

- Kürzel und Bezeichnung,
- optionale Start- und Endzeit,
- Berechnungsart,
- reine Arbeitszeit und
- Status.

Bei der Berechnungsart `Wochenarbeitszeit` wird anstelle eines festen Wertes
„Dynamisch“ angezeigt. Der konkrete Tageswert wird erst beim Einplanen aus der
individuellen Wochenarbeitszeit bestimmt. Fehlen Start- und Endzeit, wird dies
ausdrücklich als „Keine Uhrzeit“ dargestellt. Bei `Freier Tag` wird die reine
Arbeitszeit mit `0:00` angezeigt.

Zusätzlich zeigt die Seite die Gesamtzahl aller Eintragsarten und die Anzahl der
aktiven Eintragsarten. Ein leerer Datenbestand und ein Ladefehler werden als
eigene Zustände dargestellt; nach einem Ladefehler ist ein erneuter Versuch
möglich.

Die Reihenfolge lässt sich über den Ziehgriff am linken Rand einer Tabellenzeile
verändern. Während des Ziehens kennzeichnet eine Einfügelinie die Zielposition.
Als Tastaturalternative verschieben die Pfeiltasten den Eintrag, wenn sein
Ziehgriff fokussiert ist. Die neue Reihenfolge wird dauerhaft gespeichert und
gilt ebenfalls für die Auswahl aktiver Eintragsarten im Monatsplan. Inaktive
Eintragsarten behalten ihren Platz in der Gesamtreihenfolge; neue Eintragsarten
werden am Ende ergänzt.

## Eintragsart anlegen und bearbeiten

Neue Eintragsarten sind standardmäßig aktiv und verwenden standardmäßig die
Berechnungsart `Feste Zeitwerte`. Nach erfolgreichem Speichern erscheinen sie
unmittelbar in der Übersicht.

Beim Bearbeiten können Kürzel, Bezeichnung, Berechnungsart, Uhrzeiten und
Zeitwerte geändert werden. Die UUID, der Erstellungszeitpunkt und der aktuelle
Status bleiben erhalten; der Änderungszeitpunkt wird durch die Anwendung
aktualisiert. Der Status wird direkt in der Übersicht geändert.

Wird von `Feste Zeitwerte` zu `Wochenarbeitszeit` oder `Freier Tag` gewechselt,
werden vorhandene Uhrzeiten und eingegebene Zeitwerte geleert. Sie werden nicht
im Hintergrund beibehalten. Bei einem späteren Wechsel zurück müssen feste
Werte erneut eingegeben werden.

Schlägt das Anlegen oder Bearbeiten fehl, wird der Fehler im geöffneten Dialog
angezeigt. Der zuletzt dauerhaft gespeicherte Stand bleibt maßgeblich.

## Berechnungsarten

Jede Eintragsart besitzt genau eine der folgenden Berechnungsarten.

### Feste Zeitwerte

Bei festen Zeitwerten werden die benötigten Dauern direkt in der Eintragsart
hinterlegt. Start- und Endzeit können zusätzlich gemeinsam angegeben werden,
werden aber nicht zur automatischen Berechnung der Dauern verwendet.

Direkt eingegeben werden:

- reine Arbeitszeit,
- Nachtbereitschaft,
- Pause und
- Nachtarbeit.

Arbeitszeit mit Nachtbereitschaft und Anwesenheitszeit sind nicht separat
änderbar. Beide Werte werden nach den zentral festgelegten Berechnungsregeln
automatisch angezeigt. Nachtarbeit bleibt ein eigenständiger Zeitwert und die
Zeitwerte werden nicht aus den Uhrzeiten abgeleitet.

Der Dialog gruppiert reine Arbeitszeit und Pause als allgemeine Zeitwerte sowie
Nachtarbeit und Nachtbereitschaft als Nachtwerte. Die beiden berechneten Werte
stehen davon visuell getrennt in einem schreibgeschützten Ergebnisbereich. Die
zugehörigen Formeln sind im Informations-Popup erläutert.

### Wochenarbeitszeit

Bei dieser Berechnungsart werden in der Eintragsart keine festen Uhrzeiten oder
Zeitwerte verwendet. Der Dialog zeigt stattdessen einen kompakten Hinweis;
gespeichert werden leere Uhrzeiten und Nullwerte.

Erst beim Einplanen werden die konkreten Werte aus der im Monatsplan
gespeicherten Wochenarbeitszeit des betroffenen Planmitarbeiters bestimmt.
Uhrzeiten bleiben leer. Reine Arbeitszeit, Arbeitszeit mit Nachtbereitschaft
und Anwesenheitszeit entsprechen dem Tageswert; Pause, Nachtbereitschaft und
Nachtarbeit betragen `0` Minuten.

### Freier Tag

Diese Berechnungsart kennzeichnet den später gesetzten Planungseintrag als
freien Tag. Das Kürzel kann frei gewählt werden, beispielsweise `/` oder `WF`.
Der Dialog zeigt anstelle der Uhrzeit- und Zeitwertfelder einen kompakten
Hinweis; gespeichert werden leere Uhrzeiten und ausschließlich Nullwerte.

Beim Einplanen wird die Freier-Tag-Wirkung in den Snapshot übernommen. Sie zählt
damit in der Monatsauswertung als freier Tag und – abhängig vom Kalendertag –
zusätzlich als freier Samstag oder freier Sonntag. Eine spätere Änderung der
Eintragsart verändert bereits gesetzte Planungseinträge nicht.

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
- Eingaben mit Doppelpunkt, Punkt oder Komma werden unterstützt. Uhrzeiten
  können außerdem kompakt eingegeben werden, beispielsweise `8`, `530` oder
  `1430`.
- Beim Verlassen des Feldes wird die Eingabe als `HH:MM` vereinheitlicht.
- Zulässig sind Uhrzeiten von `00:00` bis `23:59`.
- Eine zweistellige Eingabe über `23`, beispielsweise `30`, ist wegen ihrer
  Mehrdeutigkeit ungültig.
- Ein Ende am Folgetag ist möglich; deshalb muss die Endzeit nicht nach der
  Startzeit liegen.
- Bei den Berechnungsarten `Wochenarbeitszeit` und `Freier Tag` sind keine
  Uhrzeiten zulässig.

### Zeitwerte

- Bei `Feste Zeitwerte` sind alle direkt pflegbaren Zeitwerte erforderlich.
- Unterstützt werden Eingaben wie `8`, `530`, `030`, `5:30`, `5.30`, `5,30`
  oder `12015`. Bei mindestens drei Ziffern bilden die letzten beiden Ziffern
  den Minutenanteil.
- Beim Verlassen des Feldes wird die Eingabe als `HH:MM` vereinheitlicht.
- Die Werte sind nichtnegative Dauern in ganzen Minuten und dürfen mehr als 24
  Stunden umfassen.
- Ein Zeitwert von `0:00` ist zulässig.
- Bei `Wochenarbeitszeit` und `Freier Tag` sind keine festen Zeitwerte zulässig.

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

Der sichtbare Status in der Übersicht ist gleichzeitig die Schaltfläche zum
Aktivieren oder Deaktivieren. Während der Änderung ist nur die betroffene Zeile
gesperrt. Schlägt das Speichern fehl, bleibt der vorherige Status erhalten und
eine Fehlermeldung wird angezeigt.

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
- Freier-Tag-Kennzeichnung,
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
- eine allgemeine fachliche Kategorie für Dienste oder Abwesenheiten.
