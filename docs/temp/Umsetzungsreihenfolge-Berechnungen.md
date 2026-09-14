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

- [x] Zeitdauern zwischen Eingabeformat und ganzen Minuten umwandeln.
- [x] Zeitdauern und Soll-/Ist-Differenzen nach den festgelegten Formaten ausgeben.
- [x] Die gemeinsame Rundungsmethode für nichtnegative berechnete Minuten umsetzen.
- [x] Zeitdauer und Uhrzeit technisch als unterschiedliche Konzepte behandeln.

### Kalenderfunktionen

- [x] Alle Datumsberechnungen als reine Kalenderdaten ohne Zeitzonenverschiebung umsetzen.
- [x] Sämtliche Kalendertage eines ausgewählten Monats erzeugen.
- [x] Wochentag, Samstag, Sonntag und Wochenende bestimmen.
- [x] Ostersonntag für jedes technisch unterstützte Jahr berechnen.
- [x] Die zwölf festgelegten gesetzlichen Feiertage Brandenburgs bestimmen.
- [x] Mehrere Feiertagsbezeichnungen an einem Datum erhalten.
- [x] Die kalendarischen Arbeitstage eines Monats berechnen.

Abnahmekriterien:

- [x] Tests decken `0:00`, Dauern über 24 und 99 Stunden sowie positive und negative Differenzen ab.
- [x] Rundungsfälle unter, bei und über einer halben Minute sind geprüft.
- [x] Schaltjahre, Feiertage am Wochenende und mehrere Feiertage an einem Datum sind geprüft.
- [x] Die Kalenderberechnung ist unabhängig von lokaler Zeitzone und Sommerzeit.

## Schritt 4: Monatsplan- und Snapshot-Modelle umsetzen

- [x] Gemeinsame Schemas für `MonthlyPlan`, `PlanEmployee`, `PlanDay` und `PlanEntry` anlegen.
- [x] Beim Erstellen eines Monatsplans ausschließlich die zu diesem Zeitpunkt aktiven Mitarbeiter übernehmen.
- [x] Rolle, Wochenarbeitszeit, Namen, Farbe und Reihenfolge in `PlanEmployee` speichern.
- [x] Für jeden Kalendertag des Monats genau einen regulär erzeugten `PlanDay` anlegen.
- [x] Verweise innerhalb des Monatsplans validieren.
- [x] Pro Mitarbeiter und Kalendertag höchstens einen Planungseintrag zulassen.
- [x] Pro Kalendertag höchstens eine Rufbereitschaft zulassen.

Abnahmekriterien:

- [x] Ein vollständiger Monatsplan kann aus Stammdaten erzeugt und validiert werden.
- [x] Spätere Stammdatenänderungen verändern den erzeugten Mitarbeiter-Snapshot nicht.
- [x] Ungültige interne Verweise und doppelte Einträge einer Planungszelle werden technisch erkannt.

## Schritt 5: Planungseintrag-Snapshots erzeugen und verändern

### Feste Zeitwerte

- [x] Herkunfts-ID, Kürzel, Bezeichnung, Uhrzeiten und die festgelegten Zeitwerte übernehmen.
- [x] Arbeitszeit (mit NB) berechnen und im Planungseintrag-Snapshot speichern.
- [x] Die Summenbeziehung des gespeicherten Snapshot-Werts validieren.

### Wochenarbeitszeit

- [x] Den Tageswert als `Wochenarbeitszeit aus dem Mitarbeiter-Snapshot / 5` berechnen.
- [x] Reine Arbeitszeit und Arbeitszeit (mit NB) auf den Tageswert setzen.
- [x] Anwesenheitszeit, Nachtbereitschaft und Nachtarbeit auf `0` setzen.
- [x] Beginn und Ende leer lassen.

### Änderungen einer Planungszelle

- [x] Einen Planungseintrag setzen.
- [x] Einen vorhandenen Planungseintrag vollständig ersetzen.
- [x] Einen Planungseintrag entfernen.
- [x] Beim erneuten Setzen einen neuen Snapshot aus den dann geltenden Ausgangsdaten bilden.
- [x] Vorhandene Snapshots bei Zelländerungen nicht aus aktuellen Stammdaten neu berechnen.

Abnahmekriterien:

- [x] Änderungen oder Löschungen einer Eintragsdefinition verändern bestehende Snapshots nicht.
- [x] Änderungen eines Mitarbeiters verändern bestehende Mitarbeiter- und Planungseintrag-Snapshots nicht.
- [x] Beide Berechnungsarten erzeugen exakt die fachlich festgelegten Snapshot-Werte.

## Schritt 6: Reine Auswertungsfunktionen umsetzen

Die Funktionen dieses Schritts erhalten einen Monatsplan beziehungsweise klar abgegrenzte Teile davon und verändern keine gespeicherten Daten.

### Tagesbezogene Kennzahlen

- [x] SN/F-Dienste anhand der exakten Snapshot-Kürzel `SN/F` und `SN` zählen.
- [x] Freie Tage anhand des exakten Snapshot-Kürzels `/` zählen.
- [x] Freie Samstage und freie Sonntage als Teilmengen der freien Tage zählen.
- [x] Rufbereitschaften je Mitarbeiter zählen.
- [x] Rufbereitschaften ausschließlich für Mitarbeiter mit der Snapshot-Rolle `Erzieher` zulassen.

### Zeitbezogene Monatskennzahlen

- [x] Arbeitszeit (mit NB), reine Arbeitszeit, Nachtbereitschaft und Nachtarbeit jeweils monatlich summieren.
- [x] Die gemeinsame Sonntags-/Feiertagskennzahl aus der reinen Arbeitszeit bilden.
- [x] Einen Sonntag, der zugleich Feiertag ist, nur einmal berücksichtigen.
- [x] Den Nachtzuschlag einmal aus der vollständigen monatlichen Nachtarbeit berechnen und runden.
- [x] Den Nachtbereitschaftszuschlag einmal aus der vollständigen monatlichen Nachtbereitschaft berechnen und runden.

### Soll, Ist und Differenz

- [x] Soll als `Arbeitstage × Wochenarbeitszeit aus dem Mitarbeiter-Snapshot / 5` berechnen.
- [x] Ist als `monatliche reine Arbeitszeit + Nachtbereitschaftszuschlag` berechnen.
- [x] Den Nachtzuschlag nicht zum Ist addieren.
- [x] Die Differenz als `Ist − Soll` berechnen.
- [x] Alle Formeln rollenunabhängig halten.

Abnahmekriterien:

- [x] Leere Zellen, exakte und abweichende Kürzel sowie Feiertagsüberschneidungen sind getestet.
- [x] Zuschläge werden nach der Monatssumme genau einmal gerundet.
- [x] Positive, negative und ausgeglichene Soll-/Ist-Differenzen sind getestet.
- [x] Das durchgängige Monatsbeispiel aus `06-Soll-Ist-Auswertung.md` läuft als übergreifender Akzeptanztest erfolgreich.

## Schritt 7: Monatsplan speichern und über die Anwendungsschnittstelle bereitstellen

- [x] Einen Repository-Bereich für Monatspläne anlegen.
- [x] Monatspläne jeweils eindeutig nach ihrer Plan-UUID speichern und laden.
- [x] Mehrere eigenständige Monatspläne für dasselbe Jahr und denselben Monat zulassen.
- [x] Lese- und Schreibvorgänge gegen Überschneidungen absichern.
- [x] Vor dem Speichern und nach dem Laden vollständig validieren.
- [x] Fehler- und Sicherungsverhalten entsprechend der vorhandenen Datenhaltung umsetzen.
- [x] IPC- und Preload-Schnittstellen für Auflisten, Erstellen, Laden und Speichern bereitstellen.

Abnahmekriterien:

- [x] Ein Monatsplan bleibt nach Speichern, Anwendungsneustart und erneutem Laden unverändert.
- [x] Snapshots bleiben auch ohne ihre ursprünglichen Stammdatensätze auswertbar.
- [x] Fehlerhafte Dateien werden nach der in Schritt 0 festgelegten technischen Strategie behandelt.

## Schritt 8: Planungsseite und Live-Vorschau anbinden

- [ ] Vor der UI-Anbindung die Main-Process-Prüfung neuer und ersetzter
      Planungseintrag-Snapshots schließen.
- [ ] Tagesbemerkungen auf maximal 60 Zeichen begrenzen und eine Plananlage ohne
      aktiven Mitarbeiter an der Fachgrenze ablehnen.
- [ ] Monat und Jahr auswählen sowie zunächst die nicht bearbeitbare leere
      Monatsvorschau anzeigen.
- [ ] Einen Monatsplan bewusst laden oder mit verpflichtendem Titel neu anlegen.
- [ ] Im globalen Ladedialog alle Pläne mit ID, Titel, Zeitraum sowie
      Erstellungszeitpunkt und Änderungszeitpunkt darstellen.
- [ ] Monatspläne im Ladedialog bestätigt und unter Schutz des aktuellen
      Entwurfs löschen.
- [ ] Mitarbeiter-Snapshots und alle Kalendertage in einem Raster mit zwei
      Teilspalten je Mitarbeiter darstellen.
- [ ] Planungseinträge setzen, ersetzen und entfernen.
- [ ] Rufbereitschaften ausschließlich zulässigen Mitarbeitern zuordnen.
- [ ] Optionale Tagesbemerkungen kompakt anzeigen und bearbeiten.
- [ ] Ungespeicherte Änderungen eindeutig kennzeichnen.
- [ ] Alle Kennzahlen unmittelbar aus dem aktuellen Entwurf neu berechnen.
- [ ] Die festgelegten Kopfkennzahlen sowie Ist und Soll unterhalb des Plans
      dauerhaft sichtbar anzeigen.
- [ ] Speichern als bewusste Aktion anbieten.
- [ ] Seiten-, Zeitraum-, Plan- und Fensterschließwechsel bei ungespeicherten
      Änderungen absichern.
- [ ] Verbindliche Ausgaben bei ungespeicherten Änderungen verhindern beziehungsweise vorheriges Speichern verlangen.

Abnahmekriterien:

- [ ] Jede Änderung einer Planungszelle aktualisiert die betroffenen Kennzahlen sofort.
- [ ] Die Soll-Arbeitszeit bleibt bei reinen Planungseintragsänderungen unverändert.
- [ ] Entwurfsstand und gespeicherter Stand sind für den Benutzer unterscheidbar.
- [ ] Kein vorhandener Plan wird automatisch geöffnet.
- [ ] Die Anwendung startet maximiert und die Navigation wird im kleineren
      Desktopbereich zur Symbolleiste reduziert.

## Schritt 9: Auswertungsdarstellung anbinden

- [ ] Tagesbezogene Kennzahlen für alle Mitarbeiter des Monatsplan-Snapshots darstellen.
- [ ] Zeitbezogene Auswertung für Mitarbeiter aller Snapshot-Rollen darstellen.
- [ ] Arbeitszeit (mit NB), reine Arbeitszeit, Nachtbereitschaft und Nachtarbeit getrennt anzeigen.
- [ ] Sonntags-/Feiertagskennzahl und beide Zuschläge getrennt anzeigen.
- [ ] Soll, Ist und Differenz mit korrektem Vorzeichenformat anzeigen.
- [ ] Rufbereitschaftszähler nach der für die betreffende Oberfläche festgelegten Darstellung anzeigen.

Abnahmekriterien:

- [ ] Eine Auswahl besonders hervorgehobener Kennzahlen beeinflusst
      ausschließlich die Darstellung und nicht die globalen
      Berechnungsfunktionen.
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
- [ ] eigenständige Kompaktansicht
- [ ] weitergehende Plausibilitätsprüfungen zwischen unabhängigen Zeitfeldern
- [ ] semantische Eintragskategorien für eine robustere SN/F- und Sonntags-/Feiertagsauswertung
- [ ] kalendertagübergreifende Erkennung zusammenhängender Dienstfolgen
- [ ] automatische Berücksichtigung einmaliger gesetzlicher Sonderfeiertage
