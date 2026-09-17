# Umsetzungsplan PDF-Export

## Status

Die fachliche, gestalterische und technische
[Abstimmung](abstimmung-pdf-export.md) ist abgeschlossen. Alle Arbeitspakete
sind umgesetzt sowie technisch und visuell geprüft. Der PDF-Export ist in der
Kompaktansicht verfügbar und wurde mit einem repräsentativen Plan sowie dem
Grenzfall mit neun Mitarbeitern und 31 Tagen abgenommen.

## Ziel und Abgrenzung

Der zuletzt regulär gespeicherte Stand eines geöffneten Monatsplans wird aus
der Kompaktansicht als lokale PDF-Datei gespeichert. Die PDF verwendet ohne
zweite unabhängige Darstellung dasselbe einseitige A4-Hochformat wie die
Kompaktansicht.

Nicht Bestandteil dieses Plans sind:

- eine direkte Druckfunktion,
- eine mehrseitige Ausgabe,
- eine dauerhaft gespeicherte Exportordner-Einstellung,
- das automatische Öffnen der PDF oder des Zielordners und
- Änderungen an Monatsplanmodell, Monatsplan-Persistenz oder Sicherungen.

Verbindlich bleiben:

- das [PDF-Export-Feature](../features/pdf-export.md),
- das Dokumentlayout der [Kompaktansicht](../features/kompaktansicht.md),
- die [Gestaltungsgrundsätze](../oberflaeche/gestaltungsgrundsaetze.md) und
- die [Teststrategie](../qualitaet/teststrategie.md).

## Vorhandene Grundlage

- [x] Ein reines Darstellungsmodell bereitet den gespeicherten Monatsplan auf.
- [x] `CompactPlanDocument` rendert das abgenommene A4-Dokument ohne
      Bearbeitungsfunktionen.
- [x] Die Kompaktansicht misst A4-Passung und meldet Überlauf.
- [x] Baseline, Entwurf und Sicherungswiederherstellung sind getrennte
      Zustände.
- [x] Die Planungswerkzeugleiste bot vor der Umsetzung einen klar abgegrenzten
      Export-Platzhalter.
- [x] Eine PDF-spezifische IPC-/Preload-Schnittstelle ist vorhanden.
- [x] Druckdarstellung, nativer Speicherdialog und Dateierzeugung sind
      umgesetzt.

## Arbeitspaket 1: Exportvertrag und Dateiauswahl

**Ziel:** Der privilegierte Export besitzt einen kleinen, validierten Vertrag
und einen unabhängig prüfbaren Speicherablauf.

- [x] Exportanfrage und Ergebnis als eng begrenzte gemeinsame Typen
      beziehungsweise Schemas festlegen.
- [x] Dateinamen `YYYY-MM - Plantitel.pdf` erzeugen, unzulässige Zeichen
      ersetzen, Überlänge begrenzen und `.pdf` sicherstellen.
- [x] Einen eigenen IPC-Kanal sowie typsichere Preload-API ergänzen.
- [x] Im Main Process den nativen Speicherdialog mit `Dokumente` als erstem
      Startordner und dem letzten erfolgreichen Sitzungsordner danach anbinden.
- [x] Natürliche Abbruch- und Überschreibabläufe des nativen Dialogs bewahren.
- [x] Dateinamens-, Validierungs-, Dialog- und Abbruchlogik automatisiert
      testen.

**Abnahme:** Der Main Process erhält intern entweder einen bestätigten Zielpfad
oder einen neutralen Abbruch. Die Oberfläche erhält nur das Exportergebnis und
keinen Zielpfad oder allgemeinen Dateisystemzugriff.

## Arbeitspaket 2: Gemeinsames A4-Dokument druckbereit machen

**Ziel:** Das vorhandene Dokument wird unverändert als exakte, isolierte
Druckseite bereitgestellt.

- [x] Eine nur im Druck sichtbare Instanz von `CompactPlanDocument` aus dem
      gespeicherten Ausgangsstand rendern.
- [x] App-Oberfläche, Arbeitsfläche, Schatten, Warnungen und Bedienelemente für
      die Druckausgabe vollständig ausblenden.
- [x] A4-Hochformat, randlose Dokumentfläche und Hintergrundfarben über
      eindeutige Druckregeln festlegen.
- [x] Die Passungsmessung als Status `wird geprüft`, `passt` oder `Überlauf`
      an die Planungsseite melden, ohne eine zweite Berechnungsregel
      einzuführen.
- [x] `printToPDF` ausschließlich mit den bestätigten A4-Optionen aufrufen und
      die erzeugten Bytes erst danach an den gewählten Zielpfad schreiben.
- [x] Druckoptionen, Dateischreiben und technische Fehler automatisiert
      prüfen.

**Abnahme:** Die technische Ausgabe enthält ausschließlich das gemeinsame
A4-Dokument und erzeugt für passende Inhalte genau eine PDF-Seite.

## Arbeitspaket 3: Exportablauf in der Kompaktansicht

**Ziel:** Der vollständig abgesicherte Export wird mit den bestätigten
Zuständen und Texten bedienbar.

- [x] Den bisherigen Platzhalter in der Planansicht entfernen und die
      Exportaktion ausschließlich bei aktiver Kompaktansicht anzeigen.
- [x] Die Aktion bis zum Abschluss der Passungsmessung sowie bei Überlauf und
      laufendem Export deaktivieren und verständlich beschriften.
- [x] Bei ungespeicherten Änderungen den bestätigten Dialog
      `Gespeicherten Stand exportieren?` anzeigen.
- [x] Ohne ungespeicherte Änderungen unmittelbar den nativen Speicherdialog
      öffnen.
- [x] Während der Erzeugung `PDF wird erstellt …` anzeigen und Ansichts- sowie
      planwechselnde Aktionen sperren.
- [x] Abbruch still behandeln, Erfolg kurz bestätigen und Fehler dauerhaft
      oberhalb der Kompaktansicht mit erneuter Exportmöglichkeit anzeigen.
- [x] Sicherstellen, dass Export, Abbruch und Fehler weder Baseline noch
      Entwurf verändern.
- [x] Zustands- und Interaktionslogik gezielt automatisiert prüfen.

**Abnahme:** Der Export ist nur in der Kompaktansicht verfügbar und folgt in
allen bestätigten Plan-, Entwurfs-, Passungs- und Fehlerzuständen dem
dokumentierten Ablauf.

## Arbeitspaket 4: PDF-Prüfung und Abschluss

**Ziel:** Nicht nur die Anwendung, sondern die tatsächlich erzeugte Datei ist
technisch und visuell bestätigt.

- [x] Einen repräsentativen Plan unterhalb des Grenzfalls mit acht Mitarbeitern
      und 31 Tagen als PDF erzeugen. Dieser anspruchsvollere Prüffall wurde als
      ausreichender Ersatz für den ursprünglich vorgesehenen Normalfall mit
      sechs bis sieben Mitarbeitern bestätigt.
- [x] Den Grenzfall mit neun Mitarbeitern und 31 Tagen als PDF erzeugen.
- [x] Beide Dateien auf genau eine A4-Seite im Hochformat und die erwarteten
      Textinhalte prüfen.
- [x] Beide Dateien in Bilder rendern und auf vollständige Inhalte, Farben,
      Linien, Schriftgrößen, Umbrüche und Seitenränder prüfen.
- [x] Gespeicherten Stand gegenüber einem abweichenden Entwurf, Dialogabbruch,
      Überschreiben, Überlauf und Fehlerzustand prüfen.
- [x] Die Dateien in einem üblichen Windows-PDF-Programm durch den Benutzer
      abnehmen lassen.
- [x] `npm test`, `npm run typecheck`, `npm run lint` und
      `npm run format:check` erfolgreich ausführen.
- [x] Feature-Dokumentation und Roadmap nach dem tatsächlichen Stand
      aktualisieren.

**Abnahme:** Normal- und Grenzfall stimmen mit der Kompaktansicht überein,
bleiben vollständig lesbar und sind technisch sowie durch den Benutzer
abgenommen.

## Abschlussnachweis

Am 17. September 2026 wurden ein Oktoberplan mit acht Mitarbeitern und 31
Tagen sowie ein Dezemberplan mit neun Mitarbeitern und 31 Tagen tatsächlich
exportiert. Beide Dateien bestehen aus genau einer ungedrehten A4-Seite im
Hochformat. Die extrahierten Inhalte enthalten jeweils alle 31 Kalendertage,
die Abschlusszeilen `Ist`, `Soll` und `h/Woche`, die Feiertagslegende und den
Freigabebereich. In den gerenderten Seiten waren keine App-Bedienelemente,
abgeschnittenen Inhalte, Überlagerungen oder unlesbaren Zeichen erkennbar. Die
Darstellung und der Bedienablauf wurden zusätzlich durch den Benutzer in einem
Windows-PDF-Programm bestätigt.

## Empfohlene Commit-Grenzen

1. Exportvertrag, Dateiname, nativer Speicherdialog und Tests,
2. druckbereites A4-Dokument, PDF-Erzeugung und technische Tests,
3. vollständiger Bedienablauf der Kompaktansicht und
4. Abschlussprüfungen und Dokumentationsstatus.
