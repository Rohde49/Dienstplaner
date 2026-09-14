Das Navigations- und Seitenkonzept bleibt bewusst einfach. Eine zusätzliche Startseite oder ein Dashboard würde für den Einzelplatz-Dienstplaner keinen ausreichenden Nutzen bieten.

## 1. Grundaufbau

Die Anwendung besteht aus:

- einer festen Navigation auf der linken Seite,
- einem Seitenkopf mit Titel und Aktionen,
- dem eigentlichen Seiteninhalt,
- einem sichtbaren Speicherstatus in der Dienstplanansicht.

Die Navigation enthält:

1. **Dienstplan**
2. **Team**
3. **Planungseinträge**

„Dienstplan“ ist die Startansicht der Anwendung.

Bei großen Fenstern zeigt die Navigation Symbol und Beschriftung. Bei kleineren Fenstern wird sie auf eine schmale Symbolleiste reduziert. Die Bezeichnungen erscheinen dann als Tooltip.

## 2. Dienstplanansicht

Die verbindlichen Inhalte und Bedienabläufe stehen gesammelt in
[Planungsseite](../Features/03-PlanPage.md).

### Seitenkopf und Werkzeugleiste

Der Seitenkopf enthält Titel, Speicherstatus und „Speichern“. Monat, Jahr,
vorheriger und nächster Monat sowie „Laden“ und „Dienstplan erstellen“ stehen in
einer eigenen Werkzeugleiste. Kompaktansicht, Drucken und PDF-Export werden bis
zu ihrer späteren eigenständigen Umsetzung nicht angezeigt.

### Anfangszustand

Kein gespeicherter Plan wird automatisch geöffnet. Für den gewählten Zeitraum
erscheint zunächst der nicht bearbeitbare Zustand „Vorschau · nicht angelegt“
mit allen Kalendertagen, den aktuell aktiven Mitarbeitern und den Kennzahlen des
leeren Planungsstands.

Ein bestehender Plan wird ausschließlich über „Laden“ geöffnet. Ein neuer Plan
wird über „Dienstplan erstellen“ mit einem verpflichtenden Titel angelegt.

### Planungsraster

Die Hauptansicht enthält Kalendertage zeilenweise und je Mitarbeiter die
Teilspalten „Eintrag“ und „Zeit“. Rechts folgen Rufbereitschaft und Bemerkung.
Wochenenden, Feiertage, Mitarbeiterzuordnung und ungespeicherte Änderungen sind
barrierearm erkennbar. Tabellenkopf und Datumsspalte bleiben in der jeweils
festgelegten Scrollrichtung sichtbar.

Ein Klick auf „Eintrag“ öffnet ein Popover mit aktiven Eintragsarten. Kürzel und
Zeitspanne werden gleichwertig angezeigt; der aktuell gesetzte Eintrag ist
markiert. Setzen, Ersetzen oder bestätigungsfreies Entfernen verändert zunächst
nur den ungespeicherten Entwurf.

Die für die Planung festgelegten Kopfkennzahlen sowie Ist- und Soll-Arbeitszeit
am Tabellenende bleiben sichtbar und reagieren unmittelbar auf den aktuellen
Entwurf. Die ausführliche Auswertung folgt als eigener Umsetzungsschritt.

## 3. Team-Verwaltung

### Seitenkopf

- Titel „Team“
- Beschreibung „Mitarbeiter und Arbeitszeitdaten verwalten“
- Button „Mitarbeiter anlegen“

### Mitarbeiterliste

| Spalte            | Inhalt                                     |
| ----------------- | ------------------------------------------ |
| Farbe             | festgelegte Mitarbeiterfarbe               |
| Name              | Vorname und Nachname                       |
| Rolle             | Erzieher, Wirtschaftskraft oder Praktikant |
| Wochenarbeitszeit | Stunden pro Woche                          |
| Status            | Aktiv oder Inaktiv                         |
| Aktionen          | Bearbeiten und Deaktivieren                |

Eine Suchfunktion ist wegen der kleinen Teamgröße nicht erforderlich. Ein einfacher Filter zwischen aktiven und inaktiven Mitarbeitern genügt.

### Mitarbeiter anlegen oder bearbeiten

Das Formular wird in einem Dialog geöffnet und enthält:

- Vorname
- Nachname
- Rolle
- Wochenarbeitszeit
- Mitarbeiterfarbe
- Aktivierungsstatus

Abschlussaktionen:

- Abbrechen
- Speichern

Mitarbeiter werden vorzugsweise deaktiviert statt endgültig gelöscht, damit vorhandene Dienstpläne nachvollziehbar bleiben.

## 4. Planungseintrag-Verwaltung

### Seitenkopf

- Titel „Planungseinträge“
- Beschreibung „Dienste, Abwesenheiten und freie Tage verwalten“
- Button „Planungseintrag anlegen“

### Liste

| Spalte            | Inhalt                                 |
| ----------------- | -------------------------------------- |
| Planungseintrag   | Kürzel und vollständige Bezeichnung    |
| Uhrzeiten         | Beginn und Ende, falls vorhanden       |
| Berechnungsart    | feste Zeitwerte oder Wochenarbeitszeit |
| Reine Arbeitszeit | maßgeblicher Zeitwert für Auswertungen |
| Status            | Aktiv oder Inaktiv                     |
| Aktionen          | Bearbeiten und Löschen                 |

### Bearbeitungsbereich

Das Formular wird wie in der Teamverwaltung immer als Dialog geöffnet.

Das Formular enthält:

- Kürzel
- Bezeichnung
- optionale Startzeit
- optionale Endzeit
- benötigte Zeitwerte
- Berechnungsart
- Aktivierungsstatus

Abschlussaktionen:

- Deaktivieren
- Abbrechen
- Speichern

## 5. Nachgelagerte Ansichten und Ausgaben

Die im Altsystem als „Druckvorschau“ bezeichnete verkürzte Bildschirmansicht
wird im aktuellen Projekt als eigenständige **Kompaktansicht** behandelt. Sie
gehört nicht zur aktuellen Umsetzung der Planungsseite und erhält dort bis zu
ihrer Umsetzung keinen Platzhalter.

Eine echte Druckvorschau ist derzeit nicht vorgesehen. Druck- und PDF-Ausgabe
werden zum Ende der Umsetzung als eigener Funktionsbereich entwickelt. Bis
dahin erscheinen dafür keine funktionslosen Aktionen in der Oberfläche. Der
PDF-Export bleibt Bestandteil des Gesamtumfangs des Prototyps.

## 6. Typischer Gesamtablauf

Beim erstmaligen Einrichten:

1. Team anlegen
2. Planungseinträge definieren
3. Leeren Vorschauplan für einen Monat prüfen
4. Dienstplan mit Titel erstellen oder einen vorhandenen Plan laden
5. Planungseinträge, Rufbereitschaften und Bemerkungen setzen
6. sichtbare Planungskennzahlen prüfen
7. Dienstplan speichern
8. später die ausführliche Auswertung prüfen
9. nach Umsetzung der Ausgabe den Dienstplan drucken oder als PDF exportieren

Im normalen monatlichen Betrieb beginnt der Benutzer direkt in der Dienstplanansicht.

## 7. Verhalten bei Navigation

Wenn keine ungespeicherten Änderungen vorliegen, erfolgt der Seitenwechsel sofort.

Bei ungespeicherten Änderungen erscheint:

> Der Dienstplan enthält ungespeicherte Änderungen.

Mit den Aktionen:

- Speichern und wechseln
- Änderungen verwerfen
- Abbrechen

Damit sind die Navigation, Ansichten und grundlegenden Bedienabläufe klar definiert, ohne zusätzliche Seiten oder unnötige Funktionen einzuführen.
