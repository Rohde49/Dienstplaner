# Umsetzungsplan Auswertungsdialog

## Ziel und Umfang

Der Button „Auswertung“ in der Planungsseite öffnet einen mittig angeordneten,
ausreichend großen Dialog vor dem unveränderten Planungsstand. Der vorhandene
Dialoghintergrund wird leicht unscharf; die Planungsseite ist währenddessen
nicht bedienbar. Nach dem Schließen steht sie mit demselben Entwurf, Zeitraum,
Scrollstand und Leistenstatus wieder zur Verfügung.

Im Dialog stehen Mitarbeiter spaltenweise und Kennzahlen zeilenweise. Die
gewünschte Reihenfolge lautet:

1. Anzahl SN/F
2. Anzahl freier Tage
3. Anzahl freier Samstage
4. Anzahl freier Sonntage
5. reine Arbeitszeit gesamt
6. Nachtbereitschaft gesamt
7. +Nachtbereitschaft 25 %
8. Anzahl Rufbereitschaften
9. Anzahl Arbeitstage
10. Ist-Arbeitszeit
11. Soll-Arbeitszeit
12. Differenz Soll/Ist

Die Anzeige verwendet die bestehende gemeinsame Monatsauswertung aus dem
aktuellen Planentwurf und keine eigenen Formeln oder gespeicherten Ergebnisse.
Nach jeder übernommenen Planänderung liegen beim nächsten Öffnen sofort die
neuen Werte vor. Auch bei einem währenddessen anderweitig aktualisierten
Entwurf bleibt der geöffnete Dialog an dessen aktuellem Stand. Ein
ungespeicherter Entwurf wird als solcher gekennzeichnet.

## Bereits vorhandene Grundlage

- Der Button ist als deaktivierter Platzhalter vorhanden.
- Der gemeinsame Dialograhmen bietet Overlay, leichte Unschärfe, Fokusführung
  und Schließen per Tastatur; seine Größe kann für die Tabelle angepasst werden.
- `calculateMonthlyPlanEvaluation` liefert bereits alle genannten Zeitwerte,
  Tageszähler und die kalendarische Arbeitstagszahl. Die Planungsseite berechnet
  daraus schon sichtbare Kennzahlen des aktuellen Entwurfs.

## Arbeitspakete

### 1. Fachlichen Anzeigeumfang abgleichen

Die hier festgehaltenen Entscheidungen mit der
[Feature-Dokumentation](../features/auswertung.md) abgleichen und deren
abweichenden Auswertungskreis und Kennzahlenumfang ausdrücklich anpassen. Die
verbindlichen [Berechnungsregeln](../fachlichkeit/berechnungen/soll-ist-auswertung.md)
bleiben maßgeblich. „Anzahl Arbeitstage“ meint die bereits berechnete
kalendarische Arbeitstagszahl des Monats.

**Abnahme:** Feature-Dokumentation und dieser Plan beschreiben denselben
Auswertungskreis, Zeilenumfang und dieselbe Bedeutung von „Arbeitstage“.

### 2. Dialog und Tabelle anbinden

Den vorhandenen Button für einen geöffneten Monatsplan aktivieren und den
Dialog mit dem etablierten Dialogmuster umsetzen. Plantitel, Zeitraum und
Entwurfsstatus zeigen den ausgewerteten Stand. Eine gut lesbare Tabelle führt
die festgelegten Zeilen und die Mitarbeiter in Planreihenfolge auf. Seine
Breite richtet sich am Tabelleninhalt aus; Kennzahl und Mitarbeiter erhalten
nur die benötigte Spaltenbreite. Alle zwölf Zeilen und alle Mitarbeiterspalten
bleiben auch bei der unterstützten Mindestgröße `1024 × 700` ohne Bildlauf
sichtbar.
Zeitwerte erscheinen als Stunden und Minuten, die Soll-/Ist-Differenz mit
Vorzeichen. Ein Plan ohne Mitarbeiter im festgelegten Auswertungskreis erhält
einen verständlichen Leerzustand. Berechnungsfehler werden verständlich
angezeigt, ohne Teilwerte als vollständige Auswertung auszugeben.

**Abnahme:** Öffnen, vollständiges Lesen und Schließen funktionieren mit Maus und
Tastatur. Der Entwurf und die Übersicht der Planungsseite bleiben erhalten;
angezeigte Werte stammen aus der gemeinsamen Berechnung.

### 3. Aktualisierung und Prüfung

Die Werte für einen geänderten, noch ungespeicherten Entwurf und für einen
gespeicherten Plan abgleichen. Die vorhandenen fachlichen Berechnungstests
wiederverwenden und nur für neue Anzeige- oder Zustandslogik gezielt ergänzen.
Die vier Projektprüfungen (`npm test`, `npm run typecheck`, `npm run lint`,
`npm run format:check`) ausführen; Dialoggröße, vollständige Tabelle, Fokus und Rückkehr
zur Planung bei schmalem und breitem Fenster manuell prüfen.

**Abnahme:** Kennzahlen entsprechen dem aktuellen Entwurf; Öffnen und
Schließen verändern ihn nicht. Technische Prüfungen und visuelle Abnahme werden
getrennt festgehalten.

## Verbindliche Anzeigeentscheidungen

- **Mitarbeiter – entschieden:** Nur Mitarbeiter mit der im Monatsplan
  gespeicherten Snapshot-Rolle `Erzieher` werden gezeigt. Die bestehende
  Feature-Dokumentation fordert noch alle Mitarbeiter und muss vor der
  Umsetzung an diese Entscheidung angepasst werden.
- **Zeilenumfang – entschieden:** Der Dialog zeigt genau die zwölf oben
  aufgeführten Zeilen. Bisher dokumentierte zusätzliche Kennzahlen wie
  Nachtarbeit, Nachtzuschlag und Arbeitszeit mit Nachtbereitschaft entfallen
  aus dieser Dialogansicht. Die gemeinsame Berechnung bleibt bestehen.
- **Anzahl Arbeitstage – entschieden:** Gezeigt wird die kalendarische
  Arbeitstagszahl des Monats. Sie ist für alle Mitarbeiter gleich und bildet
  die Grundlage der Soll-Arbeitszeit.

Die bestehende Feature-Dokumentation beschreibt derzeit noch einen größeren
Auswertungskreis und Kennzahlenumfang. Dieser Widerspruch wird in Arbeitspaket
1 vor der Codeänderung behoben.
