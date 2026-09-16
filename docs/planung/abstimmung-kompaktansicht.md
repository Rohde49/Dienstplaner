# Abstimmung zur Kompaktansicht

## Zweck dieses Dokuments

Dieses Arbeitsdokument hält die laufende fachliche, gestalterische und
technische Abstimmung zur Kompaktansicht fest. Es trennt bestätigte
Festlegungen von offenen Entscheidungen und verhindert, dass einzelne
Zwischenstände bereits als vollständige Feature-Spezifikation erscheinen.

Bis zum Abschluss der Abstimmung bleiben die bestehenden Dokumente unter
`docs/` der aktuelle Dokumentationsstand. Danach werden die bestätigten
Ergebnisse in die jeweils zuständigen Feature-, Oberflächen- und
Planungsdokumente übernommen. Dabei werden auch Widersprüche zu bisherigen
Festlegungen bereinigt.

## Bestätigte Festlegungen

### Zweck und Einordnung

- Die Kompaktansicht zeigt den Monatsplan, der auf der Planungsseite geladen
  beziehungsweise geöffnet ist.
- Sie ist eine ruhige, schreibgeschützte Kontrollansicht, in der die tägliche
  Besetzung über den gesamten Monat schneller erfassbar sein soll als in der
  bearbeitbaren Planungstabelle.
- Sie ist keine Bearbeitungsansicht und keine Auswertung.
- Sie ist eine layoutgetreue Bildschirmvorschau der späteren PDF. Spalten,
  Zeilen, Inhalte, Ausrichtung und Umbrüche sollen der PDF entsprechen.
- Die dargestellte A4-Seite darf auf dem Bildschirm abhängig vom verfügbaren
  Platz vergrößert oder verkleinert werden. Die Skalierung verändert das
  Dokumentlayout nicht.
- Kompaktansicht und PDF sollen dasselbe Dokumentlayout verwenden, damit
  Vorschau und exportiertes Ergebnis nicht voneinander abweichen.
- Die Kompaktansicht erzeugt selbst keine Datei. Das bleibt Aufgabe des
  späteren PDF-Exports.
- Der vollständige Dienstplan soll auf genau eine A4-Seite im Hochformat
  passen.

### Datengrundlage

- Die Kompaktansicht zeigt ausschließlich den tatsächlich gespeicherten Stand
  des geladenen Monatsplans.
- Ungespeicherte Änderungen des aktuellen Planentwurfs werden in der
  Kompaktansicht nicht dargestellt.

### Bisher bestätigte Grundstruktur

- Jeder Mitarbeiter erhält genau eine Spalte.
- Im Mitarbeiterkopf wird nur der Nachname angezeigt.
- Die Datumsspalte zeigt nur den abgekürzten Wochentag und das Datum im Format
  `DD.MM.`.
- Die Bemerkungsspalte erhält eine feste, noch festzulegende Breite. Längere
  Bemerkungen brechen innerhalb dieser Spalte nach unten um.
- Die Dimensionierung soll sich an realistischen Plandaten orientieren und
  nicht daran, dass alle zulässigen Textfelder gleichzeitig ihre technische
  Maximallänge ausschöpfen.

### Inhalt einer Mitarbeiterzelle

- Eine belegte Mitarbeiterzelle zeigt das Kürzel des Planungseintrags in der
  oberen Zeile.
- Darunter zeigt sie die im Planungseintrag gespeicherte Zeitspanne von Beginn
  bis Ende. Die Zeitspanne ist eine wesentliche Information des Dienstplans und
  darf nicht zugunsten eines kompakteren Layouts weggelassen werden.
- Die Kompaktansicht verwendet für Uhrzeiten ein kurzes Format:
  - Stunden erhalten keine führende Null.
  - Bei vollen Stunden entfällt `:00` immer.
  - Minuten ungleich `00` bleiben zweistellig sichtbar.
- Beginn und Ende werden platzsparend durch einen Gedankenstrich ohne
  Leerzeichen getrennt.
- Beispiele für die Darstellung sind `5:30–9`, `12–22:30` und `6–14`.
- Besitzt ein Planungseintrag keine hinterlegte Zeitspanne, zeigt die Zelle nur
  sein Kürzel und keine zusätzliche Zeitangabe oder Ersatzbeschriftung.
- Eine vollständig unbelegte Mitarbeiterzelle bleibt sichtbar leer. Sie zeigt
  weder einen Gedankenstrich noch eine Schraffur oder einen anderen
  Platzhalter.
- Tabellenlinien und gegebenenfalls die Kennzeichnung des Kalendertags bleiben
  auch bei einer unbelegten Zelle sichtbar. In der Bildschirmvorschau darf eine
  zugängliche Beschriftung den Zustand als `Kein Eintrag` bezeichnen, ohne
  sichtbaren Text in die Zelle einzufügen.

### Rufbereitschaft

- Hinter den Mitarbeiterspalten steht eine eigene schmale Spalte für die
  Rufbereitschaft.
- Die Spaltenüberschrift lautet `RB`.
- Ist eine Rufbereitschaft eingeteilt, zeigt die Zelle grundsätzlich den
  Nachnamen des zugeordneten Mitarbeiters.
- Haben mehrere Mitarbeiter im Plan denselben Nachnamen, wird zur eindeutigen
  Unterscheidung zusätzlich der erste Buchstabe des Vornamens angezeigt,
  beispielsweise `E. Müller`.
- Ist keine Rufbereitschaft eingeteilt, bleibt die Zelle sichtbar leer.

### Erwartete Mitarbeiterzahl

- Ein üblicher Monatsplan enthält sechs bis sieben Mitarbeiterspalten:
  - fünf Erzieher,
  - eine Wirtschaftskraft und
  - gegebenenfalls einen Praktikanten.
- Ein Monatsplan enthält im realistisch größten Fall neun
  Mitarbeiterspalten:
  - sechs reguläre Erzieher,
  - eine Wirtschaftskraft,
  - einen Praktikanten und
  - eine zusätzliche Aushilfskraft mit der Rolle `Erzieher`.
- Das A4-Hochformat wird für sechs bis sieben Mitarbeiterspalten als
  Standardfall gestaltet und muss auch mit neun Mitarbeiterspalten vollständig
  und lesbar funktionieren.

## Offene Entscheidungen

### Einseitiges A4-Layout

- Welche Mindestschriftgröße und welche kleinsten Zellabmessungen gelten noch
  als gut lesbar?
- Wie wird mit einem Plan umgegangen, der wegen Mitarbeiterzahl oder
  umgebrochener Bemerkungen nicht mehr lesbar auf eine Seite passt?
- Wie werden Mitarbeiter mit identischem Nachnamen eindeutig voneinander
  unterschieden, wenn im Tabellenkopf grundsätzlich nur der Nachname steht?
- Welche feste Breite erhält die Bemerkungsspalte und wie stark dürfen dadurch
  einzelne Tageszeilen wachsen?

### Gespeicherter Stand und Statusfälle

- Wie wird darauf hingewiesen, dass vorhandene ungespeicherte Änderungen nicht
  in der Kompaktansicht enthalten sind?
- Wie verhält sich die Ansicht während eines Speichervorgangs?
- Wie wird ein aus einer Sicherungsdatei wiederhergestellter, noch
  speicherpflichtiger Stand behandelt?
- Ist die Kompaktansicht in der unverbindlichen Monatsvorschau ohne geöffneten
  Plan verfügbar?

### Weitere Abstimmungsblöcke

1. Datengrundlage und Verfügbarkeit im Detail
2. Ansichtswechsel
3. Grundaufbau der Tabelle
4. Darstellung eines Planungseintrags
5. Kennzahlen
6. Gestaltung und Orientierung
7. Sonder- und Leerzustände
8. Technische Umsetzung und Prüfung

## Erkannter Dokumentationskonflikt

Das aktuelle Feature-Dokument `docs/features/kompaktansicht.md` grenzt die
Kompaktansicht noch ausdrücklich von einer Druckvorschau ab und beschreibt sie
als vom PDF-Export unabhängige Ansicht. Diese bisherige Festlegung stimmt nicht
mehr vollständig mit der laufenden Abstimmung überein. Sie wird erst nach
Abschluss der fachlichen Entscheidungen gemeinsam mit den übrigen betroffenen
Dokumenten angepasst.
