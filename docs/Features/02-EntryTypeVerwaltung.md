# Planungseintrags-Verwaltung

## 1. Zweck

Die Planungseintrags-Verwaltung dient der Pflege wiederverwendbarer Eintragsarten für die Dienstplanung.

Eintragsarten definieren, wie ein Planungseintrag bezeichnet wird, welche Uhrzeiten und Zeitwerte ihm zugrunde liegen und wie seine anrechenbare Arbeitszeit bestimmt wird.

Eintragsarten können angelegt, bearbeitet, aktiviert beziehungsweise deaktiviert und dauerhaft gelöscht werden.

## 2. Umfang und Abgrenzung

Zur Planungseintrags-Verwaltung gehören:

* Anzeige aller gespeicherten Eintragsarten,
* Anlegen neuer Eintragsarten,
* Bearbeiten vorhandener Eintragsarten,
* Aktivieren und Deaktivieren von Eintragsarten,
* dauerhaftes Löschen von Eintragsarten,
* Festlegen der Berechnungsart,
* Verwaltung optionaler Uhrzeiten,
* Verwaltung der für Berechnungen benötigten Zeitwerte.

Die Planungseintrags-Verwaltung setzt selbst keine Einträge in einen Monatsplan.

Änderungen an den Stammdaten einer Eintragsart wirken sich nicht rückwirkend auf bereits bestehende Planeinträge aus.

## 3. Fachliche Daten

Für jede Eintragsart werden folgende Angaben verwaltet:

| Angabe                            | Bedeutung                                                                |
| --------------------------------- | ------------------------------------------------------------------------ |
| Kürzel                            | Kurze Kennzeichnung der Eintragsart im Dienstplan                        |
| Bezeichnung                       | Verständliche Bezeichnung der Eintragsart                                |
| Berechnungsart                    | Legt fest, wie die Zeitwerte eines späteren Planeintrags bestimmt werden |
| Startzeit                         | Optionale Uhrzeit für den Beginn                                         |
| Endzeit                           | Optionale Uhrzeit für das Ende                                           |
| Anwesenheitszeit                  | Gesamter berücksichtigter Anwesenheitszeitraum                           |
| Arbeitszeit mit Nachtbereitschaft | Summe aus reiner Arbeitszeit und Nachtbereitschaft                       |
| Reine Arbeitszeit                 | Tatsächlich anrechenbare aktive Arbeitszeit                              |
| Nachtbereitschaft                 | Passive Arbeitszeit während eines Nachtdienstes                          |
| Nachtarbeit                       | Anteil der reinen Arbeitszeit innerhalb der Nachtarbeitszeit             |
| Status                            | Kennzeichnung als aktiv oder inaktiv                                     |

Es stehen zwei Berechnungsarten zur Verfügung:

* **Feste Zeitwerte**
* **Wochenarbeitszeit**

### Feste Zeitwerte

Bei dieser Berechnungsart werden die Zeitwerte direkt in der Eintragsart hinterlegt.

Die Arbeitszeit mit Nachtbereitschaft wird nicht separat eingegeben, sondern ergibt sich aus:

* reiner Arbeitszeit und
* Nachtbereitschaft.

Start- und Endzeit können zusätzlich hinterlegt werden.

### Wochenarbeitszeit

Bei dieser Berechnungsart werden keine festen Uhrzeiten oder Zeitwerte in der Eintragsart verwendet.

Beim späteren Einplanen wird die tägliche Arbeitszeit aus der im Monatsplan hinterlegten Wochenarbeitszeit des Mitarbeiters bestimmt.

Dabei entspricht die tägliche Arbeitszeit:

**Wochenarbeitszeit ÷ 5**

Für den erzeugten Planeintrag gelten dabei:

* reine Arbeitszeit = berechnete Tagesarbeitszeit,
* Arbeitszeit mit Nachtbereitschaft = berechnete Tagesarbeitszeit,
* Anwesenheitszeit = `0:00`,
* Nachtbereitschaft = `0:00`,
* Nachtarbeit = `0:00`,
* keine Startzeit,
* keine Endzeit.

## 4. Fachliches Verhalten

Die Planungseintrags-Verwaltung zeigt alle gespeicherten Eintragsarten unabhängig von ihrem Aktivierungsstatus.

Für jede Eintragsart werden mindestens dargestellt:

* Kürzel,
* Bezeichnung,
* hinterlegte Uhrzeiten,
* Berechnungsart,
* reine Arbeitszeit,
* Status.

Zusätzlich werden die Gesamtzahl der gespeicherten Eintragsarten und die Anzahl der aktiven Eintragsarten angezeigt.

### Eintragsart anlegen

Beim Anlegen werden die für die gewählte Berechnungsart erforderlichen Angaben erfasst.

Neue Eintragsarten sind standardmäßig aktiv.

Als Standard-Berechnungsart wird **Feste Zeitwerte** verwendet.

Nach erfolgreichem Speichern steht die Eintragsart unmittelbar in der Verwaltung zur Verfügung.

### Eintragsart bearbeiten

Die fachlichen Angaben einer bestehenden Eintragsart können nachträglich geändert werden.

Dazu gehören insbesondere:

* Kürzel,
* Bezeichnung,
* Berechnungsart,
* Uhrzeiten,
* Zeitwerte,
* Aktivierungsstatus.

Die Identität der Eintragsart bleibt bei einer Bearbeitung erhalten.

Wird die Berechnungsart auf **Wochenarbeitszeit** geändert, werden vorhandene feste Uhrzeiten und Zeitwerte nicht weiter verwendet.

### Eintragsart aktivieren und deaktivieren

Eine Eintragsart kann als aktiv oder inaktiv gekennzeichnet werden.

Inaktive Eintragsarten bleiben vollständig in der Verwaltung erhalten und können weiterhin bearbeitet, wieder aktiviert oder gelöscht werden.

Nur aktive Eintragsarten dürfen neu in einen Monatsplan gesetzt werden.

### Eintragsart löschen

Eine Eintragsart kann dauerhaft aus der Verwaltung gelöscht werden.

Vor dem Löschen ist eine ausdrückliche Bestätigung erforderlich.

Das Löschen kann nicht rückgängig gemacht werden.

Bereits bestehende Monatspläne und darin vorhandene Planeinträge bleiben durch das Löschen unverändert.

## 5. Regeln und Validierung

### Kürzel

Das Kürzel ist verpflichtend.

Äußere Leerzeichen werden entfernt.

Das Kürzel darf höchstens 20 Zeichen enthalten.

### Bezeichnung

Die Bezeichnung ist verpflichtend.

Äußere Leerzeichen werden entfernt.

Die Bezeichnung darf höchstens 100 Zeichen enthalten.

### Berechnungsart

Jede Eintragsart besitzt genau eine der beiden Berechnungsarten:

* Feste Zeitwerte,
* Wochenarbeitszeit.

Die gewählte Berechnungsart bestimmt, welche Uhrzeiten und Zeitwerte verwendet werden.

### Start- und Endzeit

Start- und Endzeit sind optional.

Wird eine der beiden Uhrzeiten angegeben, muss auch die andere angegeben werden.

Uhrzeiten müssen im Format `HH:MM` zwischen `00:00` und `23:59` angegeben werden.

Bei der Berechnungsart **Wochenarbeitszeit** sind keine Start- oder Endzeiten zulässig.

### Zeitwerte

Bei der Berechnungsart **Feste Zeitwerte** sind folgende Werte erforderlich:

* Anwesenheitszeit,
* reine Arbeitszeit,
* Nachtbereitschaft,
* Nachtarbeit.

Die Eingabe erfolgt als nichtnegative Zeitdauer im Format `H:MM`, beispielsweise `5:30` oder `120:15`.

Die Arbeitszeit mit Nachtbereitschaft wird automatisch nach folgender Beziehung bestimmt:

**Arbeitszeit mit Nachtbereitschaft = reine Arbeitszeit + Nachtbereitschaft**

Sie kann nicht unabhängig davon festgelegt werden.

Bei der Berechnungsart **Wochenarbeitszeit** werden keine festen Zeitwerte gespeichert.

Zwischen Anwesenheitszeit, reiner Arbeitszeit, Nachtbereitschaft und Nachtarbeit bestehen darüber hinaus keine zusätzlichen automatischen Plausibilitätsbeziehungen.

### Status

Jede Eintragsart besitzt eindeutig den Status aktiv oder inaktiv.

## 6. Fehler- und Sonderfälle

Können die gespeicherten Eintragsarten nicht geladen werden, wird der Fehler angezeigt und ein erneuter Ladeversuch ermöglicht.

Ungültige oder unvollständige Eingaben verhindern das Anlegen beziehungsweise Speichern einer Eintragsart.

Dies betrifft insbesondere:

* fehlendes Kürzel,
* fehlende Bezeichnung,
* ungültige Uhrzeiten,
* nur teilweise angegebene Start- und Endzeit,
* fehlende oder ungültige Zeitwerte,
* feste Uhrzeiten oder Zeitwerte bei der Berechnungsart Wochenarbeitszeit.

Schlägt das Anlegen einer Eintragsart fehl, wird keine neue Eintragsart gespeichert.

Schlägt eine Bearbeitung fehl, bleibt der zuvor gespeicherte Stand erhalten.

Schlägt das Löschen fehl, bleibt die Eintragsart erhalten.

Während eines laufenden Speicher- oder Löschvorgangs kann derselbe Vorgang nicht erneut ausgelöst werden.

Eintragsarten ohne Start- und Endzeit sind bei der Berechnungsart **Feste Zeitwerte** zulässig.

Zeitwerte von `0:00` sind zulässig.

## 7. Wechselwirkungen

### Dienstplanung

Beim Setzen eines neuen Planeintrags dürfen ausschließlich aktive Eintragsarten verwendet werden.

Aus der ausgewählten Eintragsart werden die für den Planeintrag benötigten Angaben übernommen.

Dazu gehören insbesondere:

* Kürzel,
* Bezeichnung,
* Startzeit,
* Endzeit,
* berechnungsrelevante Zeitwerte.

### Berechnungsart „Feste Zeitwerte“

Bei festen Zeitwerten werden die in der Eintragsart hinterlegten Werte in den neuen Planeintrag übernommen.

Die Arbeitszeit mit Nachtbereitschaft ergibt sich dabei aus reiner Arbeitszeit und Nachtbereitschaft.

### Berechnungsart „Wochenarbeitszeit“

Bei dieser Berechnungsart wird beim Setzen des Planeintrags die im Monatsplan gespeicherte Wochenarbeitszeit des betroffenen Mitarbeiters verwendet.

Die daraus berechnete Tagesarbeitszeit wird in den Planeintrag übernommen.

### Bestehende Planeinträge

Beim Einplanen werden die relevanten Daten der Eintragsart in den Planeintrag übernommen.

Der dadurch entstandene Planeintrag bleibt anschließend unabhängig von späteren Änderungen der zugrunde liegenden Eintragsart.

Dies gilt insbesondere für:

* Änderung des Kürzels,
* Änderung der Bezeichnung,
* Änderung der Berechnungsart,
* Änderung von Uhrzeiten,
* Änderung von Zeitwerten,
* Aktivierung oder Deaktivierung,
* Löschen der Eintragsart.