# Technische Umsetzungsreihenfolge der Berechnungen

> Temporäres Arbeitsdokument. Die verbindlichen fachlichen Regeln stehen unter `docs/Berechnungen/`. Dieses Dokument legt keine neuen Fachregeln fest, sondern strukturiert deren technische Umsetzung.

## Ziel

Die Berechnungen sollen schrittweise umgesetzt werden, sodass jede Stufe auf einer geprüften Grundlage aufbaut. Ein Schritt wird erst abgehakt, wenn seine genannten Ergebnisse vollständig umgesetzt und geprüft wurden.

## Verbindliche Grundlage

- `docs/Berechnungen/README.md` und alle dort verlinkten Regeldokumente
- das nach der fachlichen Dokumentation angeglichene Datenmodell unter `docs/Speicherung/`
- die für Teamverwaltung, Eintragsarten, Planung und Auswertung jeweils festgelegten Oberflächenregeln

## Schritt 0: Technische Entscheidungen und Dokumentation angleichen

Dieser Schritt verhindert, dass die Umsetzung gleichzeitig auf widersprüchlichen Beschreibungen aufbaut.

- [x] `docs/Speicherung/Datenmodell.md` an die verbindlichen Berechnungsregeln anpassen.
- [x] `docs/Speicherung/Datenhaltung.md` an die verbindlichen Berechnungsregeln anpassen.
- [x] Festlegen, ob Arbeitszeit (mit NB) in einer Eintragsdefinition zusätzlich gespeichert oder dort ausschließlich berechnet angezeigt wird.
- [x] Festlegen, wie vorhandene Prototypdaten behandelt werden, wenn Rollen- und Zeitwertschemas geändert werden.
- [x] Festlegen, wie beschädigte Monatsplandateien technisch behandelt werden, ohne daraus eine neue fachliche Berechnungsregel abzuleiten.
- [x] Den technisch unterstützten Jahresbereich der Planungsseite festlegen.

Abnahmekriterien:

- [x] Zwischen Berechnungs-, Datenmodell- und Datenhaltungsdokumentation bestehen keine widersprüchlichen Aussagen mehr.
- [x] Jede noch offene Entscheidung ist entweder getroffen oder ausdrücklich einem späteren, nicht blockierenden Schritt zugeordnet.

## Schritt 1: Schlanke automatisierte Testgrundlage einrichten

Die reinen Berechnungsfunktionen sollen von Beginn an unabhängig von der Oberfläche geprüft werden können.

- [x] Einen zum bestehenden Vite-/TypeScript-Projekt passenden Test-Runner einrichten.
- [x] Einen getrennten Ort für fachliche Unit-Tests festlegen.
- [x] Testbefehle in `package.json` ergänzen.
- [x] Sicherstellen, dass Tests keine echten Anwendungsdaten im Electron-Benutzerordner verwenden.

Abnahmekriterien:

- [x] Ein einfacher Beispieltest läuft lokal erfolgreich.
- [x] Typecheck, Lint und bestehende Formatierungsprüfungen bleiben getrennt ausführbar.

## Schritt 2: Bestehende Stammdatenmodelle vorbereiten

### Mitarbeiterrollen

- [x] Die Rolle von einem freien Textfeld auf einen fest definierten Rollentyp umstellen.
- [x] Die Rolle `Erzieher` eindeutig im gemeinsamen Schema abbilden.
- [x] Die Teamverwaltung auf eine kontrollierte Rollenauswahl umstellen.
- [x] Rollenwerte an der Speichergrenze validieren.

### Wochenarbeitszeit

- [x] Nichtnegative ganze Minuten als interne Einheit beibehalten.
- [x] Die Teilbarkeit der Wochenarbeitszeit durch fünf im gemeinsamen Schema prüfen.
- [x] Die Eingabe so anpassen, dass alle zulässigen Fünf-Minuten-Schritte erfasst werden können.
- [x] `0:00` als gültigen Wert unterstützen.

### Eintragsarten und Zeitwerte

- [x] Reine Arbeitszeit und Nachtbereitschaft als unabhängig pflegbare Werte beibehalten.
- [x] Arbeitszeit (mit NB) als `reine Arbeitszeit + Nachtbereitschaft` berechnen.
- [x] Arbeitszeit (mit NB) in der Eintragsartenverwaltung sichtbar, aber nicht änderbar darstellen.
- [x] Die Summenbeziehung an der fachlichen Speichergrenze validieren, sofern der Wert in der Eintragsdefinition gespeichert wird.
- [x] Für `Wochenarbeitszeit` weiterhin keine festen Uhrzeiten und keine festen Zeitwerte in der Eintragsdefinition speichern.

Abnahmekriterien:

- [x] Ungültige Rollen und nicht durch fünf teilbare Wochenarbeitszeiten werden abgelehnt.
- [x] Die Oberfläche kann keinen von der Formel abweichenden Wert für Arbeitszeit (mit NB) speichern.
- [x] Bestehende Team- und Eintragsartenfunktionen arbeiten nach der Umstellung weiterhin korrekt.

## Schritt 3: Gemeinsame Zeit- und Kalenderfunktionen umsetzen

### Zeitfunktionen

- [ ] Zeitdauern zwischen Eingabeformat und ganzen Minuten umwandeln.
- [ ] Zeitdauern und Soll-/Ist-Differenzen nach den festgelegten Formaten ausgeben.
- [ ] Die gemeinsame Rundungsmethode für nichtnegative berechnete Minuten umsetzen.
- [ ] Zeitdauer und Uhrzeit technisch als unterschiedliche Konzepte behandeln.

### Kalenderfunktionen

- [ ] Alle Datumsberechnungen als reine Kalenderdaten ohne Zeitzonenverschiebung umsetzen.
- [ ] Sämtliche Kalendertage eines ausgewählten Monats erzeugen.
- [ ] Wochentag, Samstag, Sonntag und Wochenende bestimmen.
- [ ] Ostersonntag für jedes technisch unterstützte Jahr berechnen.
- [ ] Die zwölf festgelegten gesetzlichen Feiertage Brandenburgs bestimmen.
- [ ] Mehrere Feiertagsbezeichnungen an einem Datum erhalten.
- [ ] Die kalendarischen Arbeitstage eines Monats berechnen.

Abnahmekriterien:

- [ ] Tests decken `0:00`, Dauern über 24 und 99 Stunden sowie positive und negative Differenzen ab.
- [ ] Rundungsfälle unter, bei und über einer halben Minute sind geprüft.
- [ ] Schaltjahre, Feiertage am Wochenende und mehrere Feiertage an einem Datum sind geprüft.
- [ ] Die Kalenderberechnung ist unabhängig von lokaler Zeitzone und Sommerzeit.

## Schritt 4: Monatsplan- und Snapshot-Modelle umsetzen

- [ ] Gemeinsame Schemas für `MonthlyPlan`, `PlanEmployee`, `PlanDay` und `PlanEntry` anlegen.
- [ ] Beim Erstellen eines Monatsplans ausschließlich die zu diesem Zeitpunkt aktiven Mitarbeiter übernehmen.
- [ ] Rolle, Wochenarbeitszeit, Namen, Farbe und Reihenfolge in `PlanEmployee` speichern.
- [ ] Für jeden Kalendertag des Monats genau einen regulär erzeugten `PlanDay` anlegen.
- [ ] Verweise innerhalb des Monatsplans validieren.
- [ ] Pro Mitarbeiter und Kalendertag höchstens einen Planungseintrag zulassen.
- [ ] Pro Kalendertag höchstens eine Rufbereitschaft zulassen.

Abnahmekriterien:

- [ ] Ein vollständiger Monatsplan kann aus Stammdaten erzeugt und validiert werden.
- [ ] Spätere Stammdatenänderungen verändern den erzeugten Mitarbeiter-Snapshot nicht.
- [ ] Ungültige interne Verweise und doppelte Einträge einer Planungszelle werden technisch erkannt.

## Schritt 5: Planungseintrag-Snapshots erzeugen und verändern

### Feste Zeitwerte

- [ ] Herkunfts-ID, Kürzel, Bezeichnung, Uhrzeiten und die festgelegten Zeitwerte übernehmen.
- [ ] Arbeitszeit (mit NB) berechnen und im Planungseintrag-Snapshot speichern.
- [ ] Die Summenbeziehung des gespeicherten Snapshot-Werts validieren.

### Wochenarbeitszeit

- [ ] Den Tageswert als `Wochenarbeitszeit aus dem Mitarbeiter-Snapshot / 5` berechnen.
- [ ] Reine Arbeitszeit und Arbeitszeit (mit NB) auf den Tageswert setzen.
- [ ] Anwesenheitszeit, Nachtbereitschaft und Nachtarbeit auf `0` setzen.
- [ ] Beginn und Ende leer lassen.

### Änderungen einer Planungszelle

- [ ] Einen Planungseintrag setzen.
- [ ] Einen vorhandenen Planungseintrag vollständig ersetzen.
- [ ] Einen Planungseintrag entfernen.
- [ ] Beim erneuten Setzen einen neuen Snapshot aus den dann geltenden Ausgangsdaten bilden.
- [ ] Vorhandene Snapshots beim Laden und Auswerten nicht aus aktuellen Stammdaten neu berechnen.

Abnahmekriterien:

- [ ] Änderungen oder Löschungen einer Eintragsdefinition verändern bestehende Snapshots nicht.
- [ ] Änderungen eines Mitarbeiters verändern bestehende Mitarbeiter- und Planungseintrag-Snapshots nicht.
- [ ] Beide Berechnungsarten erzeugen exakt die fachlich festgelegten Snapshot-Werte.

## Schritt 6: Reine Auswertungsfunktionen umsetzen

Die Funktionen dieses Schritts erhalten einen Monatsplan beziehungsweise klar abgegrenzte Teile davon und verändern keine gespeicherten Daten.

### Tagesbezogene Kennzahlen

- [ ] SN/F-Dienste anhand der exakten Snapshot-Kürzel `SN/F` und `SN` zählen.
- [ ] Freie Tage anhand des exakten Snapshot-Kürzels `/` zählen.
- [ ] Freie Samstage und freie Sonntage als Teilmengen der freien Tage zählen.
- [ ] Rufbereitschaften je Mitarbeiter zählen.
- [ ] Rufbereitschaften ausschließlich für Mitarbeiter mit der Snapshot-Rolle `Erzieher` zulassen.

### Zeitbezogene Monatskennzahlen

- [ ] Arbeitszeit (mit NB), reine Arbeitszeit, Nachtbereitschaft und Nachtarbeit jeweils monatlich summieren.
- [ ] Die gemeinsame Sonntags-/Feiertagskennzahl aus der reinen Arbeitszeit bilden.
- [ ] Einen Sonntag, der zugleich Feiertag ist, nur einmal berücksichtigen.
- [ ] Den Nachtzuschlag einmal aus der vollständigen monatlichen Nachtarbeit berechnen und runden.
- [ ] Den Nachtbereitschaftszuschlag einmal aus der vollständigen monatlichen Nachtbereitschaft berechnen und runden.

### Soll, Ist und Differenz

- [ ] Soll als `Arbeitstage × Wochenarbeitszeit aus dem Mitarbeiter-Snapshot / 5` berechnen.
- [ ] Ist als `monatliche reine Arbeitszeit + Nachtbereitschaftszuschlag` berechnen.
- [ ] Den Nachtzuschlag nicht zum Ist addieren.
- [ ] Die Differenz als `Ist − Soll` berechnen.
- [ ] Alle Formeln rollenunabhängig halten.

Abnahmekriterien:

- [ ] Leere Zellen, exakte und abweichende Kürzel sowie Feiertagsüberschneidungen sind getestet.
- [ ] Zuschläge werden nach der Monatssumme genau einmal gerundet.
- [ ] Positive, negative und ausgeglichene Soll-/Ist-Differenzen sind getestet.
- [ ] Das durchgängige Monatsbeispiel aus `06-Soll-Ist-Auswertung.md` läuft als übergreifender Akzeptanztest erfolgreich.

## Schritt 7: Monatsplan speichern und über die Anwendungsschnittstelle bereitstellen

- [ ] Einen Repository-Bereich für Monatspläne anlegen.
- [ ] Monatspläne eindeutig nach Jahr und Monat speichern und laden.
- [ ] Schreibvorgänge gegen Überschneidungen absichern.
- [ ] Vor dem Speichern und nach dem Laden vollständig validieren.
- [ ] Fehler- und Sicherungsverhalten entsprechend der vorhandenen Datenhaltung umsetzen.
- [ ] IPC- und Preload-Schnittstellen für Erstellen, Laden und Speichern bereitstellen.

Abnahmekriterien:

- [ ] Ein Monatsplan bleibt nach Speichern, Anwendungsneustart und erneutem Laden unverändert.
- [ ] Snapshots bleiben auch ohne ihre ursprünglichen Stammdatensätze auswertbar.
- [ ] Fehlerhafte Dateien werden nach der in Schritt 0 festgelegten technischen Strategie behandelt.

## Schritt 8: Planungsseite und Live-Vorschau anbinden

- [ ] Monat und Jahr auswählen sowie einen Monatsplan laden oder neu anlegen.
- [ ] Mitarbeiter-Snapshots und alle Kalendertage darstellen.
- [ ] Planungseinträge setzen, ersetzen und entfernen.
- [ ] Rufbereitschaften ausschließlich zulässigen Mitarbeitern zuordnen.
- [ ] Ungespeicherte Änderungen eindeutig kennzeichnen.
- [ ] Alle Kennzahlen unmittelbar aus dem aktuellen Entwurf neu berechnen.
- [ ] Speichern als bewusste Aktion anbieten.
- [ ] Verbindliche Ausgaben bei ungespeicherten Änderungen verhindern beziehungsweise vorheriges Speichern verlangen.

Abnahmekriterien:

- [ ] Jede Änderung einer Planungszelle aktualisiert die betroffenen Kennzahlen sofort.
- [ ] Die Soll-Arbeitszeit bleibt bei reinen Planungseintragsänderungen unverändert.
- [ ] Entwurfsstand und gespeicherter Stand sind für den Benutzer unterscheidbar.

## Schritt 9: Auswertungsdarstellung anbinden

- [ ] Tagesbezogene Kennzahlen für alle Mitarbeiter des Monatsplan-Snapshots darstellen.
- [ ] Zeitbezogene Auswertung ausschließlich für Mitarbeiter mit der Snapshot-Rolle `Erzieher` darstellen.
- [ ] Arbeitszeit (mit NB), reine Arbeitszeit, Nachtbereitschaft und Nachtarbeit getrennt anzeigen.
- [ ] Sonntags-/Feiertagskennzahl und beide Zuschläge getrennt anzeigen.
- [ ] Soll, Ist und Differenz mit korrektem Vorzeichenformat anzeigen.
- [ ] Rufbereitschaftszähler nach der für die betreffende Oberfläche festgelegten Darstellung anzeigen.

Abnahmekriterien:

- [ ] Rollenfilter beeinflussen ausschließlich die Darstellung und nicht die globalen Berechnungsfunktionen.
- [ ] `00:00`, positive und negative Differenzen werden fachlich korrekt dargestellt.
- [ ] Angezeigte Werte stimmen mit den geprüften Berechnungsfunktionen überein.

## Schritt 10: Technische Gesamtprüfung und fachliche Abnahme

- [ ] Sämtliche Unit- und Integrationstests ausführen.
- [ ] Typecheck und Lint ausführen.
- [ ] Den vollständigen Kernablauf mit einem neu angelegten Monatsplan prüfen.
- [ ] Speichern und erneutes Laden mit realen temporären Dateien prüfen.
- [ ] Snapshot-Verhalten nach Änderung und Löschung von Stammdaten prüfen.
- [ ] Das dokumentierte Monatsbeispiel manuell in der Oberfläche nachvollziehen.
- [ ] Verbleibende Abweichungen zwischen Dokumentation, Code und Oberfläche dokumentieren.

Abnahmekriterien:

- [ ] Die technischen Prüfungen sind erfolgreich oder verbleibende Einschränkungen sind ausdrücklich dokumentiert.
- [ ] Die fachlichen Ergebnisse entsprechen vollständig den Dokumenten unter `docs/Berechnungen/`.
- [ ] Die sichtbare Oberfläche wurde durch den Benutzer fachlich abgenommen.

## Bewusst nachgelagerte Themen

Diese Themen sollten erst nach einer stabilen Planung und Auswertung umgesetzt werden:

- [ ] Druck- und PDF-Ausgabe
- [ ] weitergehende Plausibilitätsprüfungen zwischen unabhängigen Zeitfeldern
- [ ] semantische Eintragskategorien für eine robustere SN/F- und Sonntags-/Feiertagsauswertung
- [ ] kalendertagübergreifende Erkennung zusammenhängender Dienstfolgen
- [ ] automatische Berücksichtigung einmaliger gesetzlicher Sonderfeiertage
