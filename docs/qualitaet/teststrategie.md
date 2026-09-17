# Teststrategie

Die Teststrategie beschreibt, welche Risiken im Dienstplaner wie geprüft
werden. Sie legt keine fachlichen Regeln fest: Erwartetes Verhalten wird aus
den zuständigen Fach-, Feature- und Architekturdokumenten sowie aus dem
tatsächlichen Quellcode abgeleitet.

## Ziele

Die Prüfungen sollen insbesondere sicherstellen, dass:

- verbindliche Berechnungs- und Validierungsregeln reproduzierbar eingehalten
  werden,
- Monatspläne und Stammdaten vollständig und konsistent gespeichert werden,
- Fehler und beschädigte Daten nicht unbemerkt zu falschen Ergebnissen führen,
- wichtige Benutzerabläufe ohne Datenverlust funktionieren und
- Änderungen keine bereits abgesicherten Regeln unbeabsichtigt verletzen.

Ein Test darf keine noch offene fachliche Entscheidung durch eine zufällige
Erwartung ersetzen. Fehlt eine Regel, wird sie zuerst im zuständigen Dokument
geklärt.

## Prüfschichten

### Fachlogik

Kleine, deterministische Tests prüfen einzelne Regeln ohne Oberfläche oder
Dateisystem. Dazu gehören insbesondere:

- Schema- und Eingabevalidierung,
- Zeitspannen, Rundung und Kalenderregeln,
- Berechnungen von Planungseinträgen,
- Tages- und Monatskennzahlen,
- Soll-/Ist-Auswertung und
- Snapshot- und Rollenregeln.

Diese Schicht bildet die Grundlage, weil fachliche Fehler hier schnell und mit
kleinen, von Hand nachvollziehbaren Beispielen eingegrenzt werden können.

### Zusammenspiel und Datenhaltung

Integrationstests prüfen mehrere Verantwortlichkeiten gemeinsam. Besonders
wichtig sind:

- Erzeugen, Speichern, Laden und Löschen von Monatsplänen,
- erneutes Validieren veränderter Planungsdaten an der Speichergrenze,
- Erhaltung von UUIDs, Snapshots und Reihenfolgen,
- serielles Verarbeiten konkurrierender Änderungen,
- Sicherungsdatei, Wiederherstellung und erneutes Speichern sowie
- verständliches Scheitern bei ungültigen oder beschädigten Dateien.

Dateibasierte Tests verwenden echte Dateien in einem eigens erzeugten
temporären Verzeichnis. Sie ersetzen die Dateizugriffe nicht vollständig durch
Attrappen, weil gerade Schreiben, Umbenennen, Sicherung und Wiederherstellung
gemeinsam geprüft werden müssen.

### Oberfläche und Benutzerabläufe

Interaktionstests prüfen sichtbares Verhalten einzelner Seiten und Komponenten,
beispielsweise Eingabefehler, Dialogentscheidungen, Auswahlzustände und den
Schutz ungespeicherter Änderungen.

Mindestens ein durchgängiger Kernablauf soll zusätzlich in der tatsächlich
gebauten Electron-Anwendung geprüft werden:

1. Stammdaten anlegen,
2. einen Monatsplan erstellen,
3. Planungseinträge bearbeiten,
4. den Plan speichern und
5. ihn nach einem Neustart wieder laden.

Solche Ablauftests ergänzen die kleineren Tests. Sie ersetzen sie nicht, weil
fachliche Grenzfälle darin nur schwer gezielt und verständlich geprüft werden
können.

### Manuelle Sichtprüfung

Layout, Lesbarkeit, Fokusführung und Bedienbarkeit werden bei relevanten
Oberflächenänderungen zusätzlich manuell geprüft. Dazu gehören mindestens:

- die kleinste unterstützte Fenstergröße,
- normale und große Inhaltsmengen,
- Tastaturbedienung und sichtbare Fokuszustände,
- verständliche Lade-, Leer- und Fehlerzustände sowie
- bei Ausgabedokumenten das tatsächlich gerenderte Ergebnis.

Eine erfolgreiche technische Prüfung belegt nicht automatisch eine visuell
oder praktisch geeignete Oberfläche.

### A4-Dokumentansichten und PDF

Eine layoutgetreue Dokumentvorschau benötigt zusätzlich zur gewöhnlichen
Oberflächenprüfung einen Abgleich ihrer aufbereiteten Inhalte und ihrer festen
Seitenfläche.

Für die Kompaktansicht werden insbesondere automatisiert geprüft:

- die ausschließliche Verwendung des gespeicherten Planstands,
- kompakte Uhrzeitformate und unveränderte Zeitdauern,
- eindeutige Namen bei identischen Nachnamen,
- Feiertagsmarkierungen und Feiertagslegende sowie
- die Abschlusswerte für Ist, Soll und Wochenarbeitszeit.

Die manuelle Sichtprüfung umfasst einen normalen Plan mit sechs bis sieben
Mitarbeitern sowie den Grenzfall mit neun Mitarbeitern und 31 Tagen. Zusätzlich
werden lange Namen, umgebrochene Bemerkungen, Einträge ohne Uhrzeit,
Wochenenden, Feiertage und die kleinste Fenstergröße `1024 × 700` geprüft.
Mindestschriftgröße, Skalierung, Zeilenhöhe und Bemerkungsbreite werden erst am
gerenderten A4-Prototyp verbindlich abgenommen. Für den bestätigten Stand gilt
ein kleinster Bildschirmmaßstab von `84 %`; tatsächlicher horizontaler oder
vertikaler Dokumentüberlauf wird unabhängig davon erkannt und gemeldet.

Der PDF-Export rendert für die Abnahme zusätzlich die tatsächlich erzeugte PDF
und prüft sie gegen das gemeinsame Dokumentlayout. Eine korrekte
Kompaktansicht allein belegt noch keine korrekte PDF-Datei. Für die erste
Abschlussprüfung wurden ein repräsentativer Plan mit acht Mitarbeitern und 31
Tagen sowie der Grenzfall mit neun Mitarbeitern und 31 Tagen als jeweils
einseitige A4-PDF technisch und visuell bestätigt.

## Risikoprioritäten

### Höchste Priorität

- Validierung an allen dauerhaften Speichergrenzen,
- Zeit-, Kalender- und Berechnungsregeln,
- Snapshot-Konsistenz bestehender Monatspläne,
- Speichern, Laden, Sicherung und Wiederherstellung sowie
- Schutz echter Benutzerdaten und ungespeicherter Änderungen.

### Hohe Priorität

- tages- und monatsbezogene Kennzahlen,
- rollenabhängiges Verhalten,
- Laden, Wechseln und Löschen von Monatsplänen,
- Fehler- und Wiederholungsabläufe und
- der durchgängige Kernablauf der Anwendung.

### Nachgelagerte Priorität

- seltene Komfort- und Darstellungsvarianten,
- noch nicht fachlich festgelegte Funktionen und
- aufwendige End-to-End-Varianten ohne zusätzliches fachliches Risiko.

Es wird keine pauschale Prozentzahl für Testabdeckung angestrebt. Entscheidend
ist, ob die fachlich und technisch riskanten Regeln nachvollziehbar abgesichert
sind.

## Testdaten und Isolation

Testdaten bleiben klein, eindeutig und möglichst von Hand nachrechenbar. Der
Bestand umfasst gezielt:

- normale Fälle und Grenzwerte,
- Zeitspannen über Mitternacht,
- Rundungsgrenzen,
- kurze und lange Monate sowie Schaltjahre,
- Wochenenden und Feiertage,
- alle zulässigen Rollen,
- positive, negative und ausgeglichene Soll-/Ist-Differenzen und
- bewusst ungültige oder beschädigte Daten.

Automatisierte Tests dürfen niemals das echte Electron-Benutzerdatenverzeichnis
verwenden. Jeder dateibasierte Test arbeitet in einem isolierten temporären
Verzeichnis und entfernt ausschließlich die von ihm selbst erzeugten Daten.

## Wichtige Fehlerfälle

Mindestens folgende Fehlerklassen werden an der jeweils zuständigen Grenze
geprüft:

- ungültige Rollen, Arbeitszeiten und unvollständige Zeitangaben,
- inkonsistente oder manipulierte Zeitwerte und Snapshots,
- fehlende, doppelte oder ungültige IDs und Referenzen,
- ungültige Monatsplandaten oder Kalendertage,
- nicht zulässige Rufbereitschaften,
- zu lange oder anderweitig ungültige Texte,
- beschädigte Haupt- und Sicherungsdateien sowie
- Lese-, Schreib- und Wiederherstellungsfehler.

Ein fehlgeschlagener Vorgang darf keinen teilweise gespeicherten oder in der
Oberfläche fälschlich als erfolgreich dargestellten Zustand hinterlassen.

## Prüfung von Änderungen

Nach einer Änderung werden die zum Umfang passenden, im Projekt definierten
Prüfungen ausgeführt:

- `npm test`,
- `npm run typecheck`,
- `npm run lint` und
- `npm run format:check`.

Zusätzlich werden die betroffenen Benutzerabläufe und Darstellungen manuell
geprüft, wenn die Änderung sichtbares Verhalten berührt. Ein Prüflauf gilt nur
als Nachweis, wenn er tatsächlich ausgeführt und sein Ergebnis festgehalten
wurde. Vergangene Prüfergebnisse und momentane Testanzahlen gehören nicht in
diese dauerhafte Strategie.

## Abgrenzung

- Tests dokumentieren Beispiele für Regeln, sind aber nicht deren einziger
  fachlicher Ablageort.
- Nicht jede interne Funktion oder reine Darstellung benötigt einen eigenen
  Test.
- Externe Dienste und echte Benutzerdaten sind nicht Teil der Testumgebung.
- Druck- und PDF-Ergebnisse benötigen zusätzlich eine Prüfung des gerenderten
  Dokuments.
- Die Reihenfolge noch aufzubauender Testabdeckung gehört in die
  [Roadmap](../planung/roadmap.md), nicht in dieses Dokument.
