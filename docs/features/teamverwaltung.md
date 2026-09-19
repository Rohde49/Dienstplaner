# Teamverwaltung

Die Teamverwaltung pflegt die Mitarbeiter-Stammdaten, die für neue
Dienstpläne benötigt werden. Dieses Dokument beschreibt ihren fachlichen Zweck,
ihre Bedienregeln und ihre Wechselwirkung mit Monatsplänen.

## Zweck und Umfang

Die Teamverwaltung ermöglicht:

- alle gespeicherten Mitarbeiter anzuzeigen,
- neue Mitarbeiter anzulegen,
- vorhandene Mitarbeiter zu bearbeiten,
- Mitarbeiter zu aktivieren oder zu deaktivieren,
- die sichtbare Reihenfolge der Mitarbeiter festzulegen und
- Mitarbeiter nach ausdrücklicher Bestätigung dauerhaft zu löschen.

Sie bearbeitet keine Monatspläne. Änderungen an den Stammdaten dürfen bereits
angelegte Monatspläne nicht rückwirkend verändern.

## Mitarbeiterdaten

Für jeden Mitarbeiter werden folgende fachliche Angaben verwaltet:

| Angabe            | Bedeutung                                                      |
| ----------------- | -------------------------------------------------------------- |
| Vorname           | Vorname des Mitarbeiters                                       |
| Nachname          | Nachname des Mitarbeiters                                      |
| Rolle             | Fachliche Rolle innerhalb der Dienstplanung                    |
| Wochenarbeitszeit | Regelmäßige Wochenarbeitszeit als Dauer in Stunden und Minuten |
| Farbe             | Zusätzliche visuelle Zuordnung innerhalb der Anwendung         |
| Status            | Kennzeichnung als aktiv oder inaktiv                           |

Jeder Mitarbeiter besitzt eine eigene UUID. Sie bleibt beim Bearbeiten
unverändert und unterscheidet auch Mitarbeiter mit identischen Namen eindeutig.
Erstellungs- und Änderungszeitpunkte werden von der Anwendung verwaltet und
nicht durch den Benutzer eingegeben.

### Rollen

Zulässig sind ausschließlich:

- Erzieher,
- Wirtschaftskraft und
- Praktikant.

Die Rolle ist verpflichtend. Freie oder davon abweichende Rollen sind nicht
zulässig.

### Mitarbeiterfarben

Zulässig sind:

- Blau,
- Türkis,
- Grün,
- Gelb,
- Orange,
- Rot,
- Rosa,
- Lila und
- Braun.

Jedem Mitarbeiter wird genau eine Farbe zugeordnet. Die Farbe unterstützt die
visuelle Orientierung, ersetzt aber niemals die sichtbare namentliche
Kennzeichnung. Bereits verwendete Farben werden in der Auswahl gekennzeichnet,
bleiben aber weiterhin auswählbar.

## Übersicht

Die Übersicht zeigt alle gespeicherten Mitarbeiter unabhängig von ihrem
Aktivierungsstatus. Für jeden Mitarbeiter sind mindestens Name, Rolle,
Wochenarbeitszeit und Status sichtbar. Die Farbe ergänzt die namentliche
Zuordnung.

Zusätzlich zeigt die Seite:

- die Gesamtzahl aller gespeicherten Mitarbeiter und
- die Anzahl der aktuell aktiven Mitarbeiter.

Solange keine Mitarbeiter vorhanden sind, wird ein verständlicher Leerzustand
angezeigt. Können die Daten nicht geladen werden, wird der Fehler angezeigt und
ein erneuter Ladeversuch angeboten.

Die Reihenfolge lässt sich über den Ziehgriff am linken Rand einer Tabellenzeile
verändern. Während des Ziehens kennzeichnet eine Einfügelinie die Zielposition.
Als Tastaturalternative verschieben die Pfeiltasten den Mitarbeiter, wenn sein
Ziehgriff fokussiert ist. Die neue Reihenfolge wird dauerhaft gespeichert und
gilt für Vorschauen sowie für anschließend neu angelegte Monatspläne. Inaktive
Mitarbeiter behalten ihren Platz in der Gesamtreihenfolge; neue Mitarbeiter
werden am Ende ergänzt.

## Mitarbeiter anlegen

Beim Anlegen werden alle erforderlichen Stammdaten erfasst. Ein neuer
Mitarbeiter ist standardmäßig aktiv. Die Anwendung wählt die erste noch nicht
verwendete Farbe der festgelegten Palette vor. Sind alle Farben bereits
vergeben, wird wieder Blau vorausgewählt. Die Vorauswahl kann vor dem Speichern
geändert werden.

Nach erfolgreichem Speichern erscheint der Mitarbeiter unmittelbar in der
Übersicht. Die Anwendung erzeugt seine UUID sowie die Zeitstempel. Kann der
Vorgang nicht gespeichert werden, wird kein neuer Mitarbeiter in die Übersicht
übernommen.

## Mitarbeiter bearbeiten

Vorname, Nachname, Rolle, Wochenarbeitszeit und Farbe können nachträglich
geändert werden. Die UUID, der Erstellungszeitpunkt und der aktuelle Status
bleiben erhalten; der Änderungszeitpunkt wird durch die Anwendung aktualisiert.
Der Status wird direkt in der Übersicht geändert.

Schlägt das Speichern fehl, wird der Fehler im geöffneten Dialog angezeigt. Die
zuletzt dauerhaft gespeicherten Stammdaten bleiben maßgeblich.

## Aktivieren und deaktivieren

Inaktive Mitarbeiter bleiben vollständig in der Teamverwaltung erhalten. Sie
können weiterhin bearbeitet, wieder aktiviert oder gelöscht werden.

Der sichtbare Status in der Übersicht ist gleichzeitig die Schaltfläche zum
Aktivieren oder Deaktivieren. Während der Änderung ist nur die betroffene Zeile
gesperrt. Schlägt das Speichern fehl, bleibt der vorherige Status erhalten und
eine Fehlermeldung wird angezeigt.

Der Status wirkt sich ausschließlich auf die Anlage neuer Monatspläne aus:

- Aktive Mitarbeiter werden als Snapshot in einen neuen Monatsplan übernommen.
- Inaktive Mitarbeiter werden nicht in einen neuen Monatsplan übernommen.
- Ein Monatsplan kann nicht ohne mindestens einen aktiven Mitarbeiter angelegt
  werden.

Eine spätere Aktivierung oder Deaktivierung verändert bestehende Monatspläne
nicht.

## Mitarbeiter löschen

Das Löschen entfernt einen Mitarbeiter dauerhaft aus den Stammdaten und kann
nicht rückgängig gemacht werden. Deshalb muss der Benutzer den Vorgang zuvor
ausdrücklich bestätigen.

Während des Löschvorgangs kann die Aktion nicht mehrfach ausgelöst oder der
Bestätigungsdialog geschlossen werden. Schlägt das Löschen fehl, bleibt der
Mitarbeiter erhalten und der Fehler wird im Dialog angezeigt.

Bereits angelegte Monatspläne bleiben nach dem Löschen vollständig nutzbar,
weil sie ihre Mitarbeiterdaten als unabhängige Snapshots enthalten.

## Eingaberegeln

### Namen

- Vorname und Nachname sind Pflichtangaben.
- Äußere Leerzeichen werden entfernt.
- Beide Angaben dürfen jeweils höchstens 100 Zeichen enthalten.
- Namen müssen nicht eindeutig sein; entscheidend ist die UUID.

### Wochenarbeitszeit

- Die Angabe ist verpflichtend.
- Sie wird als Zeitdauer im Format `H:MM` eingegeben, beispielsweise `39:00`.
- Der Mindestwert beträgt `0:00`.
- Der Höchstwert beträgt `168:00`.
- Zulässig sind ausschließlich Fünf-Minuten-Schritte.
- Eine Wochenarbeitszeit von `0:00` ist ausdrücklich zulässig.

Allgemeine Regeln für Zeitdauern stehen unter
[Zeitbasis und Rundung](../fachlichkeit/berechnungen/zeitbasis-und-rundung.md).

### Fehlerbehandlung

Ungültige Eingaben verhindern das Speichern. Die betroffenen Felder werden mit
verständlichen Hinweisen gekennzeichnet, und der Eingabefokus wird auf das erste
ungültige Text- oder Auswahlfeld gesetzt. Während eines Speichervorgangs kann
der Dialog nicht geschlossen oder erneut abgesendet werden.

## Wechselwirkung mit Monatsplänen

Bei der Anlage eines Monatsplans werden von jedem zu diesem Zeitpunkt aktiven
Mitarbeiter insbesondere folgende Angaben übernommen:

- Herkunfts-ID des Mitarbeiters,
- Vorname und Nachname,
- Rolle,
- Wochenarbeitszeit und
- Farbe.

Der Plan erhält dafür eine eigene planinterne Mitarbeiter-ID. Die übernommenen
Werte bilden den Stand zum Zeitpunkt der Plananlage ab. Änderungen oder das
Löschen des ursprünglichen Mitarbeiters verändern diesen Stand nicht.

Die Beziehungen und Snapshot-Regeln werden zentral im
[fachlichen Datenmodell](../fachlichkeit/datenmodell.md) beschrieben.

## Abgrenzung

Nicht zur Teamverwaltung gehören:

- das Erstellen oder Bearbeiten von Monatsplänen,
- eine rückwirkende Synchronisierung bestehender Monatspläne,
- eine Personalakte mit Adress-, Vertrags- oder Abrechnungsdaten,
- eine Historie aller früheren Stammdatenstände und
- eine automatische fachliche Prüfung, ob die hinterlegte Wochenarbeitszeit zu
  einem Arbeitsvertrag passt.
