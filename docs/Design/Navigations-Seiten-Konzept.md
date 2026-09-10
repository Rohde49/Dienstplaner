Das Navigations- und Seitenkonzept bleibt bewusst einfach. Eine zusätzliche Startseite oder ein Dashboard würde für den Einzelplatz-Dienstplaner keinen ausreichenden Nutzen bieten.

## 1. Grundaufbau

Die Anwendung besteht aus:

* einer festen Navigation auf der linken Seite,
* einem Seitenkopf mit Titel und Aktionen,
* dem eigentlichen Seiteninhalt,
* einem sichtbaren Speicherstatus in der Dienstplanansicht.

Die Navigation enthält:

1. **Dienstplan**
2. **Team**
3. **Planungseinträge**

„Dienstplan“ ist die Startansicht der Anwendung.

Bei großen Fenstern zeigt die Navigation Symbol und Beschriftung. Bei kleineren Fenstern wird sie auf eine schmale Symbolleiste reduziert. Die Bezeichnungen erscheinen dann als Tooltip.

## 2. Dienstplanansicht

### Seitenkopf

Enthält:

* Titel „Dienstplan“
* Monats- und Jahresauswahl
* Wechsel zum vorherigen und nächsten Monat
* Speicherstatus
* Button „Speichern“
* weitere Aktionen über ein Menü

Das Aktionsmenü enthält:

* Druckvorschau öffnen
* PDF exportieren

### Noch kein Dienstplan vorhanden

Wenn für den gewählten Monat kein Plan existiert:

> Für August 2026 wurde noch kein Dienstplan erstellt.

Darunter erscheint:

> **Dienstplan erstellen**

Vor der Erstellung kann der Benutzer Monat und Jahr auswählen.

### Dienstplan vorhanden

Die Hauptansicht enthält:

* Kalendertage zeilenweise
* Mitarbeiter als farblich gekennzeichnete Spalten
* Planungseintrag je Mitarbeiter und Tag
* Rufbereitschaft
* Bemerkungen
* Hervorhebung von Wochenenden und Feiertagen
* Legende
* einblendbare Auswertungstabelle

Die Datumsspalte bleibt beim horizontalen Scrollen sichtbar.

### Eintrag setzen

1. Benutzer klickt auf eine Mitarbeiterzelle.
2. Ein Popover mit den verfügbaren Planungseinträgen öffnet sich.
3. Benutzer wählt einen Eintrag aus.
4. Der Eintrag erscheint sofort in der Zelle.
5. Der Dienstplan erhält den Status „Ungespeicherte Änderungen“.

### Eintrag bearbeiten oder entfernen

Ein Klick auf einen vorhandenen Eintrag öffnet dasselbe Popover. Dort kann der Benutzer:

* einen anderen Eintrag auswählen oder
* den vorhandenen Eintrag entfernen.

Für das Entfernen eines einzelnen Dienstplaneintrags ist keine zusätzliche Bestätigung erforderlich, da die Änderung erst durch das Speichern dauerhaft wird.

### Auswertung

Die Auswertung wird unterhalb des Dienstplans ein- und ausgeblendet. Sie enthält die vorgesehenen Werte je Mitarbeiter, insbesondere:

* Sollstunden
* Iststunden
* Differenz
* freie Tage
* planungsrelevante Zeitwerte

Die Anwendung berechnet und zeigt diese Werte. Die fachliche Bewertung bleibt Aufgabe der Teamleitung.

## 3. Team-Verwaltung

### Seitenkopf

* Titel „Team“
* Beschreibung „Mitarbeiter und Arbeitszeitdaten verwalten“
* Button „Mitarbeiter anlegen“

### Mitarbeiterliste

| Spalte            | Inhalt                                      |
| ----------------- | ------------------------------------------- |
| Farbe             | festgelegte Mitarbeiterfarbe                |
| Name              | Vorname und Nachname                        |
| Rolle             | beispielsweise Teamleitung oder Mitarbeiter |
| Wochenarbeitszeit | Stunden pro Woche                           |
| Status            | Aktiv oder Inaktiv                          |
| Aktionen          | Bearbeiten und Deaktivieren                 |

Eine Suchfunktion ist wegen der kleinen Teamgröße nicht erforderlich. Ein einfacher Filter zwischen aktiven und inaktiven Mitarbeitern genügt.

### Mitarbeiter anlegen oder bearbeiten

Das Formular wird in einem Dialog geöffnet und enthält:

* Vorname
* Nachname
* Rolle
* Wochenarbeitszeit
* Mitarbeiterfarbe
* Aktivierungsstatus

Abschlussaktionen:

* Abbrechen
* Speichern

Mitarbeiter werden vorzugsweise deaktiviert statt endgültig gelöscht, damit vorhandene Dienstpläne nachvollziehbar bleiben.

## 4. Planungseintrag-Verwaltung

### Seitenkopf

* Titel „Planungseinträge“
* Beschreibung „Dienste, Abwesenheiten und freie Tage verwalten“
* Button „Planungseintrag anlegen“

### Liste

| Spalte      | Inhalt                              |
| ----------- | ----------------------------------- |
| Planungseintrag | Kürzel und vollständige Bezeichnung       |
| Uhrzeiten       | Beginn und Ende, falls vorhanden          |
| Berechnungsart  | feste Zeitwerte oder Wochenarbeitszeit    |
| Reine Arbeitszeit | maßgeblicher Zeitwert für Auswertungen  |
| Status          | Aktiv oder Inaktiv                        |
| Aktionen        | Bearbeiten und Löschen                    |

### Bearbeitungsbereich

Das Formular wird wie in der Teamverwaltung immer als Dialog geöffnet.

Das Formular enthält:

* Kürzel
* Bezeichnung
* optionale Startzeit
* optionale Endzeit
* benötigte Zeitwerte
* Berechnungsart
* Aktivierungsstatus

Abschlussaktionen:

* Deaktivieren
* Abbrechen
* Speichern

## 5. Druckvorschau und PDF-Export

Die Druckvorschau wird aus dem Dienstplan geöffnet, erscheint aber nicht in der Hauptnavigation.

Sie enthält:

* Zurück zum Dienstplan
* Monat und Jahr
* vollständige A4-Hochformat-Vorschau
* Button „PDF exportieren“

Die Vorschau zeigt:

* alle Kalendertage,
* Wochenarbeitszeit über den Mitarbeitern,
* Mitarbeiter und ihre Einträge,
* Rufbereitschaft,
* Bemerkungen,
* Ist- und Sollzeilen,
* Datum und Unterschriftsbereich.

Die Vorschau ist nicht bearbeitbar. Änderungen erfolgen ausschließlich in der Dienstplanansicht.

## 6. Typischer Gesamtablauf

Beim erstmaligen Einrichten:

1. Team anlegen
2. Planungseinträge definieren
3. Dienstplan für einen Monat erstellen
4. Planungseinträge setzen
5. Auswertung prüfen
6. Dienstplan speichern
7. Druckvorschau öffnen
8. PDF exportieren

Im normalen monatlichen Betrieb beginnt der Benutzer direkt in der Dienstplanansicht.

## 7. Verhalten bei Navigation

Wenn keine ungespeicherten Änderungen vorliegen, erfolgt der Seitenwechsel sofort.

Bei ungespeicherten Änderungen erscheint:

> Der Dienstplan enthält ungespeicherte Änderungen.

Mit den Aktionen:

* Speichern und wechseln
* Änderungen verwerfen
* Abbrechen

Damit sind die Navigation, Ansichten und grundlegenden Bedienabläufe klar definiert, ohne zusätzliche Seiten oder unnötige Funktionen einzuführen.
