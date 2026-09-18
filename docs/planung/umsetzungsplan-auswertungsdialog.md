# Umsetzungsplan Auswertungsdialog

## Status

Der Auswertungsdialog ist mit zwölf berechneten Kennzahlen umgesetzt. Als
bestätigte Erweiterung kommt darunter ein dauerhaft im Monatsplan gespeicherter
manueller Zeitübertrag mit Bezugsmonat hinzu. Die berechneten Kennzahlen bleiben
unverändert und der Übertrag fließt in keine Formel ein.

## Ziel und Umfang

Der Button „Auswertung“ in der Planungsseite öffnet einen mittig angeordneten,
ausreichend großen Dialog vor dem aktuellen Planungsstand. Der vorhandene
Dialoghintergrund wird leicht unscharf; die Planungsseite ist währenddessen
nicht bedienbar. Nach dem Schließen stehen Zeitraum, Scrollstand und
Leistenstatus weiterhin zur Verfügung; gültige Änderungen am manuellen
Zeitübertrag bleiben im Planentwurf erhalten.

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
13. Übertrag aus ausgewähltem Monat

Die ersten zwölf Zeilen verwenden die bestehende gemeinsame Monatsauswertung
aus dem aktuellen Planentwurf und keine eigenen Formeln oder gespeicherten
Ergebnisse. Die dreizehnte Zeile ist ein ausdrücklich manueller Planwert.
Nach jeder übernommenen Planänderung liegen beim nächsten Öffnen sofort die
neuen Werte vor. Auch bei einem währenddessen anderweitig aktualisierten
Entwurf bleibt der geöffnete Dialog an dessen aktuellem Stand. Ein
ungespeicherter Entwurf wird als solcher gekennzeichnet.

## Umgesetzter Stand

- Der Button ist bei einem geöffneten Monatsplan verfügbar und öffnet die
  Auswertung des aktuellen Planentwurfs.
- Der gemeinsame Dialograhmen bietet Overlay, leichte Unschärfe, Fokusführung
  und Schließen per Tastatur. Seine Größe ist auf die vollständige Tabelle
  abgestimmt.
- `calculateMonthlyPlanEvaluation` liefert bereits alle genannten Zeitwerte,
  Tageszähler und die kalendarische Arbeitstagszahl. Der Dialog stellt diese
  gemeinsame Berechnung ohne eigene fachliche Formeln dar.
- Die Tabelle zeigt ausschließlich Erzieher in Planreihenfolge, die zwölf
  festgelegten Kennzahlen und darunter den manuellen Zeitübertrag. Einzelne
  neutrale Abschnittslinien gliedern die fachlichen Bereiche.

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
nur die benötigte Spaltenbreite. Alle dreizehn Zeilen und alle
Mitarbeiterspalten bleiben auch bei der unterstützten Mindestgröße `1024 × 700`
ohne Bildlauf sichtbar.
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

**Abnahme:** Kennzahlen entsprechen dem aktuellen Entwurf. Reines Öffnen und
Schließen verändern ihn nicht; bestätigte Eingaben am manuellen Zeitübertrag
bleiben dagegen im Entwurf erhalten. Technische Prüfungen und visuelle Abnahme
werden getrennt festgehalten.

## Verbindliche Anzeigeentscheidungen

- **Mitarbeiter – entschieden:** Nur Mitarbeiter mit der im Monatsplan
  gespeicherten Snapshot-Rolle `Erzieher` werden gezeigt.
- **Zeilenumfang – entschieden:** Der Dialog zeigt genau die zwölf oben
  aufgeführten berechneten Zeilen und als dreizehnte Zeile den manuellen
  Zeitübertrag. Bisher dokumentierte zusätzliche Kennzahlen wie Nachtarbeit,
  Nachtzuschlag und Arbeitszeit mit Nachtbereitschaft entfallen aus dieser
  Dialogansicht. Die gemeinsame Berechnung bleibt bestehen.
- **Anzahl Arbeitstage – entschieden:** Gezeigt wird die kalendarische
  Arbeitstagszahl des Monats. Sie ist für alle Mitarbeiter gleich und bildet
  die Grundlage der Soll-Arbeitszeit.
- **Zeitübertrag – entschieden:** Die Monatsauswahl beginnt leer. Gültige
  positive, negative und ausgeglichene Werte werden je Erzieher im Monatsplan
  gespeichert, farblich signalisiert und nicht verrechnet.

Die [Feature-Dokumentation](../features/auswertung.md) wurde vor der Umsetzung
an diese Entscheidungen angepasst und beschreibt den abgenommenen Stand.
