# Umsetzungsplan Kompaktansicht

## Status

Die erste Kompaktansicht ist umgesetzt sowie fachlich, gestalterisch und
technisch abgenommen. Dieser Plan bleibt als abgeschlossene Prüfliste und als
Grundlage für den späteren PDF-Export erhalten.

## Zweck und Pflege

Dieser Plan teilt die Umsetzung der Kompaktansicht in kleine, aufeinander
aufbauende und einzeln prüfbare Abschnitte. Er wiederholt nicht die
Darstellungsregeln des Features.

Maßgeblich bleiben:

- die [Kompaktansicht](../features/kompaktansicht.md),
- die [Planungsseite](../features/planungsseite.md),
- der spätere [PDF-Export](../features/pdf-export.md),
- die [Gestaltungsgrundsätze](../oberflaeche/gestaltungsgrundsaetze.md),
- die [Teststrategie](../qualitaet/teststrategie.md) und
- die gemeinsamen fachlichen Berechnungsregeln.

Das [Abstimmungsprotokoll](abstimmung-kompaktansicht.md) dokumentiert die
Herleitung der Entscheidungen. Für das dauerhafte Zielverhalten ist nach der
Dokumentationsübernahme die Feature-Dokumentation maßgeblich.

`[x]` bedeutet: im aktuellen Quellcode vorhanden und für diesen Stand geprüft.
`[ ]` bedeutet: noch umzusetzen oder erneut zu prüfen. Eine Checkbox wird erst
nach tatsächlicher Umsetzung und angemessener Prüfung abgehakt.

## Bereits vorhandene Grundlage

- [x] Planungsseite trennt gespeicherten Ausgangsstand und aktuellen Entwurf.
- [x] Ungespeicherte Änderungen und Sicherungswiederherstellung sind im
      Seitenzustand erkennbar.
- [x] Planmitarbeiter, Plantage, Einträge, Rufbereitschaften und Bemerkungen
      liegen vollständig als Plan-Snapshots vor.
- [x] Kalender- und Feiertagslogik sowie Monatsauswertung sind zentral vorhanden
      und getestet.
- [x] Die Werkzeugleiste enthält den Umschalter `Plan | Kompakt` und den
      weiterhin deaktivierten Export-Platzhalter.
- [x] Die aktuelle Planungstabelle stellt alle benötigten Planinformationen
      bereits dar, ist aber kein wiederverwendbares A4-Dokumentlayout.
- [x] Für die erste Kompaktansicht sind keine Änderungen an Persistenz, IPC,
      Preload oder gemeinsamem Monatsplanschema erforderlich.

## Abschnitt 1: Reines Darstellungsmodell

**Ziel:** Alle Inhalte der A4-Seite werden deterministisch aus einem
gespeicherten Monatsplan aufbereitet, ohne Oberfläche oder Entwurfszustand.

- [x] Eine reine Aufbereitungsfunktion für Dokumentkopf, Tageszeilen,
      Mitarbeiterköpfe, Rufbereitschaft, Bemerkungen, Feiertagslegende und
      Abschlusszeilen anlegen.
- [x] Ausschließlich einen vollständigen gespeicherten Monatsplan als Eingabe
      akzeptieren; keine aktuellen Stammdaten nachladen.
- [x] Kurze Uhrzeiten, unveränderte Dauern und eindeutige Namen bei identischen
      Nachnamen zentral aufbereiten.
- [x] Vorhandene Kalender-, Zeit- und Monatsberechnungen wiederverwenden und
      keine zweite Berechnungslogik einführen.
- [x] Normale Fälle sowie Zeitformat, Namensgleichheit, Feiertage, Einträge ohne
      Uhrzeit und Abschlusswerte gezielt mit Vitest prüfen.

**Abnahme:** Das Modell liefert für denselben gespeicherten Plan reproduzierbar
dieselben Dokumentinhalte. Ein abweichender Entwurf kann das Ergebnis nicht
verändern.

## Abschnitt 2: Sicherer Ansichtsmodus

**Ziel:** Der vorhandene Umschalter wechselt ohne Datenänderung zwischen
Planansicht und gespeichertem Dokumentstand.

- [x] Den Ansichtsmodus in der Planungsseite ergänzen und `Plan` als
      Ausgangsmodus verwenden.
- [x] Bei neuem, geladenem oder gelöschtem Plan sowie bei der Monatsvorschau
      zuverlässig auf `Plan` zurücksetzen.
- [x] `Kompakt` bei Monatsvorschau, laufendem Speichern und noch nicht
      bestätigter Sicherungswiederherstellung deaktivieren.
- [x] In der Kompaktansicht `Speichern` und `Auswertung` deaktivieren.
- [x] Bei einem abweichenden Entwurf den dauerhaften Hinweis auf den
      gespeicherten Stand anzeigen.
- [x] Wechsel und Verlassen des Plans mit dem bestehenden Verlustschutz
      abgleichen und als reine Zustandslogik testen.

**Abnahme:** Der Ansichtswechsel verändert und verwirft keine Daten. Die
Kompaktansicht erhält ausschließlich den gespeicherten Ausgangsstand; alle
deaktivierten und geschützten Zustände entsprechen der Feature-Dokumentation.

## Abschnitt 3: Sichtbarer A4-Prototyp

**Ziel:** Das gemeinsame A4-Dokumentlayout ist mit realistischen Daten sichtbar
und kann vor weiterer Technik fachlich und gestalterisch abgenommen werden.

- [x] Eine reine Dokumentkomponente für die weiße A4-Seite im Hochformat
      erstellen.
- [x] Dokumentkopf, Tabelle, Feiertagslegende, Abschlusszeilen und
      Freigabebereich gemäß Feature-Dokumentation darstellen.
- [x] Mitarbeiterfarben, Wochenenden und Feiertage dezent und unabhängig von
      alleiniger Farberkennung kennzeichnen.
- [x] Leere Zellen, Einträge mit und ohne Uhrzeit, Rufbereitschaft und
      vollständig umbrechende Bemerkungen abbilden.
- [x] Eine getrennte Bildschirmkomponente für graue Arbeitsfläche, Seitenrand,
      Schatten und proportionale Skalierung anlegen.
- [x] Einen normalen Monatsplan mit sechs bis sieben Mitarbeitern sowie den
      Grenzfall mit neun Mitarbeitern und 31 Tagen sichtbar prüfen.
- [x] Konkrete Schriftgrößen, Bemerkungsbreite, Zeilenhöhe und
      Mindestskalierung gemeinsam visuell abnehmen.

**Abnahme:** Der Benutzer bestätigt die konkrete A4-Darstellung. Vor dieser
Sichtfreigabe werden weder die Passungsgrenze endgültig festgelegt noch größere
nachfolgende Layoutschritte umgesetzt.

## Abschnitt 4: Passung, Überlauf und Barrierearmut

**Ziel:** Das bestätigte Dokumentlayout bleibt am unterstützten Fenster
bedienbar und erkennt zuverlässig nicht lesbar passende Pläne.

- [x] Die A4-Seite bis `1024 × 700` vollständig in der Breite darstellen und
      vertikales Scrollen ermöglichen, ohne Dokumentumbrüche zu verändern.
- [x] Die bestätigte Mindestskalierung und den verfügbaren A4-Inhaltsbereich
      als nachvollziehbare Passungsgrenze umsetzen.
- [x] Bei Überlauf den festgelegten dauerhaften Hinweis anzeigen und keine
      Inhalte abschneiden oder verbergen.
- [x] Semantische Tabelle, zugängliche Namen leerer Zellen, sichtbaren Fokus und
      Tastaturbedienung des Umschalters prüfen.
- [x] Sicherstellen, dass die A4-Vorschau keine Hover-, Auswahl-, Sticky- oder
      Bearbeitungszustände aus der Planungstabelle übernimmt.

**Abnahme:** Normal- und Grenzfall bleiben vollständig lesbar. Ein tatsächlich
nicht passender Plan wird verständlich zurückgewiesen und nicht nur optisch
abgeschnitten.

## Abschnitt 5: Technische und manuelle Abschlussprüfung

**Ziel:** Fachliche Inhalte, Zustandsgrenzen und sichtbare Darstellung sind
gemeinsam geprüft; der spätere PDF-Export kann dasselbe Dokumentlayout
übernehmen.

- [x] Automatisierte Tests für Darstellungsmodell und neue Zustandslogik
      vollständig ausführen und gezielt ergänzen.
- [x] Normalfall, Neun-Mitarbeiter-Grenzfall, Feiertage sowie Einträge mit und
      ohne Uhrzeit manuell prüfen; extreme Textlängen bleiben als
      nicht-blockierender Grenzfall der abschließenden Gesamtprüfung erhalten.
- [x] Gespeicherten Stand gegen einen abweichenden Entwurf sowie die
      Sperrzustände Vorschau, Speichern und Sicherungswiederherstellung manuell
      beziehungsweise durch Zustandsprüfungen absichern.
- [x] Darstellung und Tastaturbedienung bei `1024 × 700` und im maximierten
      Fenster manuell prüfen.
- [x] `npm test`, `npm run typecheck`, `npm run lint` und
      `npm run format:check` erfolgreich ausführen.
- [x] Verbleibende Abweichungen ausdrücklich dokumentieren und die sichtbare
      Gesamtumsetzung durch den Benutzer abnehmen lassen.
- [x] Feature-Dokumentation und Roadmap nach dem tatsächlichen
      Implementierungsstand aktualisieren.

**Abnahme:** Technische Prüfungen sind erfolgreich und die manuelle
Produktabnahme ist bestätigt oder enthält konkrete offene Restpunkte. Der
Export-Platzhalter bleibt bis zum späteren PDF-Arbeitspaket deaktiviert.

Besonders lange Namen und Bemerkungen sowie eine tatsächlich ausgelöste
Sicherungswiederherstellung werden bei der abschließenden Gesamtprüfung der
Anwendung nochmals manuell betrachtet. Die vorhandene Überlauferkennung und
die automatisierten Zustandsprüfungen sichern diese seltenen Fälle bis dahin
ab; sie blockieren den Abschluss der Kompaktansicht nicht.

## Nicht Bestandteil dieses Plans

- Erzeugen oder Speichern einer PDF-Datei,
- Dateiname, Speicherort und Überschreibverhalten,
- direkte Druckfunktion,
- mehrseitige Aufteilung und
- fachliche Begrenzung der Mitarbeiterzahl im Monatsplanmodell.
