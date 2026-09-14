# Todo: UI der Planungsseite

## 1. Ziel und Arbeitsweise

Diese Liste gliedert die Umsetzung der Planungsseite in überschaubare,
aufeinander aufbauende Schritte. Die fachlichen Regeln werden hier nicht
erneut definiert. Maßgeblich bleiben:

- die [Planungsseite](./03-PlanPage.md),
- das [Designziel](../Design/Designziel.md),
- die [globale UI-Basis](../Design/globale-UI-Basis.md),
- die [globale Komponentenbasis](../Design/globale-Komponenten-Basis.md),
- das [Farbkonzept](../Design/Farbkonzept.md),
- die [Berechnungen](../Berechnungen/README.md),
- das [Datenmodell](../Speicherung/Datenmodell.md) und
- die [Teststrategie](../Tests/Teststrategie.md).

Eine Checkbox wird erst abgehakt, wenn der jeweilige Punkt umgesetzt und in
seinem Umfang geprüft wurde. Neue fachliche Widersprüche werden vor einer
abweichenden Umsetzung geklärt und anschließend in der Planungsseite
dokumentiert.

Für alle Schritte gelten durchgehend:

- vorhandene globale Komponenten und Bezeichnungen konsistent wiederverwenden,
- fachliche Berechnungen und Speicherregeln nicht im Renderer duplizieren,
- die Oberfläche bei mindestens `1024 × 700` nutzbar halten,
- ab `1280` Pixeln die verfügbare Breite sinnvoll nutzen,
- Zustände nicht ausschließlich durch Farbe vermitteln,
- Maus- und Tastaturbedienung sowie einen sichtbaren Fokus gewährleisten und
- keine Platzhalter für Kompaktansicht, Auswertung, Druck oder PDF ergänzen.

## 2. Voraussetzungen und Vorbereitung

- [x] Fachliche Regeln und offene Entscheidungen der Planungsseite festhalten.
- [x] Monatsplanmodell, Berechnungen, Speicherung und sichere Speichergrenzen
      vorbereiten.
- [ ] Den Schreibfehler `--color-slatelate-100` in der globalen Farbbasis
      prüfen und vor Verwendung des betroffenen Tokens korrigieren.
- [ ] Das Zustandsmodell der Oberfläche festlegen: Vorschau, Ausgangsstand,
      Entwurf, Ladezustand, Fehlerzustand und Sicherungszustand.
- [ ] Die Planungsseite in klar begrenzte fachliche Komponenten aufteilen, ohne
      unnötige allgemeine Abstraktionen einzuführen.
- [ ] Nur tatsächlich benötigte fehlende Basiskomponenten ergänzen, insbesondere
      Popover und Tooltip.

## 3. Responsives Seitengrundgerüst

- [ ] Die bisherige Platzhalterseite durch eine eigene `PlannerPage` ersetzen.
- [ ] Seitenkopf, Speicherstatus und Speicheraktion mit den vorhandenen
      Layout-Komponenten aufbauen.
- [ ] Die Werkzeugleiste für Zeitraum, Monatsnavigation, Laden und Plananlage
      konsistent und umbrechbar gestalten.
- [ ] Die Hauptnavigation zwischen `1024` und `1279` Pixeln auf die festgelegte
      zugängliche Symbolleiste reduzieren und ab `1280` Pixeln vollständig
      anzeigen.
- [ ] Seitenabstände, Aktionsanordnung und verfügbare Inhaltsbreite an beiden
      Desktop-Breiten prüfen.
- [ ] Sicherstellen, dass die Änderungen an der Navigation Team- und
      Planungseintragsverwaltung nicht verschlechtern.

## 4. Zeitraum, Vorschau und Plananlage

- [ ] Aktuellen Monat und aktuelles Jahr als Anfangszeitraum anzeigen.
- [ ] Monats- und Jahresauswahl sowie vorherigen und nächsten Monat anbinden.
- [ ] Beim Zeitraumwechsel immer die noch nicht angelegte Vorschau anzeigen und
      keinen gespeicherten Plan automatisch laden.
- [ ] Die Vorschau aus allen Kalendertagen und den aktuell aktiven Mitarbeitern
      bilden und klar als „Vorschau · nicht angelegt“ kennzeichnen.
- [ ] Ohne aktive Mitarbeiter statt der Tabelle den festgelegten Leerzustand
      mit „Zur Teamverwaltung“ anzeigen und die Plananlage sperren.
- [ ] Den Titeldialog mit Pflichtfeld, Bereinigung und 200-Zeichen-Grenze
      umsetzen.
- [ ] Einen neuen Plan über die vorhandene Fach- und Speicherlogik anlegen und
      den gespeicherten Rückgabestand anzeigen.

## 5. Laden und Löschen

- [ ] Den globalen Ladedialog mit Titel, Zeitraum, Erstellungszeitpunkt und
      Änderungszeitpunkt umsetzen; die technische ID bleibt unsichtbar.
- [ ] Leere Liste, Ladezustand und verständliche Ladefehler im Dialog darstellen.
- [ ] Einen Plan ausdrücklich laden und die Zeitraumsauswahl mit seinem Zeitraum
      synchronisieren.
- [ ] Pläne über die vorhandene Löschaktion und einen Bestätigungsdialog mit
      Titel und Zeitraum löschen.
- [ ] Die Regeln für nicht geöffnete, geöffnete und ungespeichert bearbeitete
      Pläne einhalten.
- [ ] Nach dem Löschen des geöffneten Plans die Vorschau desselben Zeitraums
      anzeigen und den Ladedialog aktualisieren.

## 6. Planungsmatrix und Kennzahlen

- [ ] Die fachliche Planungsmatrix mit Datum, Mitarbeiter-Teilspalten,
      Rufbereitschaft und Bemerkung aufbauen.
- [ ] Bei Platzmangel horizontal scrollen, ohne die Spalten unlesbar
      zusammenzudrücken.
- [ ] Den vollständigen Tabellenkopf vertikal und die Datumsspalte horizontal
      sichtbar halten.
- [ ] Gewöhnliche Planungszellen neutral, Wochenenden grau und Feiertage rot
      darstellen; Feiertage haben Vorrang.
- [ ] Die Mitarbeiterfarben kräftig und konsistent in den Mitarbeiterköpfen
      verwenden.
- [ ] Rollenabhängige Kopfkennzahlen sowie Ist- und Soll-Arbeitszeit am
      Tabellenende aus den gemeinsamen Berechnungsfunktionen anzeigen.
- [ ] Die Matrix mit realistischen Mitarbeiterzahlen bei `1024 × 700` und in
      einem größeren Fenster auf Lesbarkeit prüfen.

## 7. Bearbeitung des Entwurfs

- [ ] Planungseinträge über ein kompaktes, tastaturbedienbares Popover setzen,
      ersetzen und ohne Bestätigung entfernen.
- [ ] Im Eintrags-Popover ausschließlich aktive Eintragsarten mit Kürzel und
      Zeitspanne anzeigen.
- [ ] Den festgelegten Hinweis im Eintrags-Popover anzeigen, wenn keine
      Eintragsarten verfügbar sind.
- [ ] Rufbereitschaften anhand der gespeicherten Erzieher-Snapshots auswählen
      oder entfernen.
- [ ] Den festgelegten Hinweis im Rufbereitschafts-Popover anzeigen, wenn keine
      Erzieher verfügbar sind.
- [ ] Tagesbemerkungen mit Zeichenanzeige, „Übernehmen“, „Abbrechen“ und der
      60-Zeichen-Grenze bearbeiten.
- [ ] Den Plantitel über die Stift-Aktion bearbeiten.
- [ ] Nach jeder übernommenen Änderung die sichtbaren Kennzahlen aus dem
      aktuellen Entwurf neu berechnen.

## 8. Speichern und Verlustschutz

- [ ] Ausgangsstand und aktuellen Entwurf getrennt halten und Änderungen
      zuverlässig erkennen.
- [ ] Die Zustände „Ungespeicherte Änderungen“, „Wird gespeichert …“ und
      „Gespeichert“ konsistent darstellen.
- [ ] Während des Speicherns kollidierende Aktionen und Mehrfachausführung
      verhindern.
- [ ] Bei einem Speicherfehler den Entwurf erhalten, den Fehler dauerhaft
      erklären und „Erneut versuchen“ anbieten.
- [ ] Speichern, Verwerfen und Abbrechen vor Seiten-, Zeitraum- und Planwechsel
      umsetzen.
- [ ] Den gleichen Verlustschutz beim Schließen der Anwendung anbinden.
- [ ] Die ursprünglich gewünschte Aktion erst nach erfolgreichem Speichern oder
      bestätigtem Verwerfen fortsetzen.

## 9. Sicherungs- und weitere Rückmeldungszustände

- [ ] Einen aus Sicherung geladenen Plan mit „Aus Sicherung geladen · Speichern
      erforderlich“ kennzeichnen.
- [ ] Das Speichern dieses Zustands auch ohne weitere Inhaltsänderung erlauben
      und damit die reguläre Plandatei wiederherstellen.
- [ ] Wahrnehmbare Lade-, Speicher- und Löschvorgänge direkt an der betroffenen
      Aktion anzeigen.
- [ ] Dauerhafte Hinweise, Feldfehler und kurze Toasts entsprechend ihrer
      festgelegten Priorität einsetzen.
- [ ] Technische Rohmeldungen in verständliche Benutzerhinweise übersetzen.

## 10. Prüfung und Abnahme

- [ ] Komponenten- und Zustandslogik mit passenden automatischen Prüfungen
      absichern.
- [ ] Die wichtigsten Abläufe über Renderer, Preload, IPC und Speicherung mit
      getrennten Testdaten prüfen.
- [ ] Vorschau, Plananlage, Laden, Bearbeiten, Speichern, Verlustschutz,
      Sicherungswiederherstellung und Löschen als Kernablauf prüfen.
- [ ] Tastaturbedienung, Fokusführung, zugängliche Namen und unabhängige
      Farberkennung kontrollieren.
- [ ] Die Darstellung mindestens bei `1024 × 700` sowie ab `1280` Pixeln prüfen.
- [ ] Typecheck, Lint, Formatierung und vollständige Testsuite erfolgreich
      ausführen.
- [ ] Verbleibende Abweichungen zwischen Dokumentation und Umsetzung festhalten.
- [ ] Die sichtbare Oberfläche abschließend durch den Benutzer abnehmen lassen.
