# Umsetzungsplan Planungsseite

## Zweck und Pflege

Dieser Plan zeigt den überprüften Umsetzungsstand der Planungsseite und teilt
die noch offene Arbeit in aufeinander aufbauende, einzeln abnehmbare Abschnitte.
Er wiederholt keine fachlichen Detailregeln.

Maßgeblich bleiben:

- die [Planungsseite](../features/planungsseite.md),
- das [Datenmodell](../fachlichkeit/datenmodell.md),
- die [Datenhaltung](../architektur/datenhaltung.md),
- die Regeln für
  [Planungseinträge](../fachlichkeit/berechnungen/planungseintraege.md),
  [Tageskennzahlen](../fachlichkeit/berechnungen/tageskennzahlen.md),
  [Monatskennzahlen](../fachlichkeit/berechnungen/monatskennzahlen.md) und die
  [Soll-Ist-Auswertung](../fachlichkeit/berechnungen/soll-ist-auswertung.md),
- die [Gestaltungsgrundsätze](../oberflaeche/gestaltungsgrundsaetze.md) und
- die [Teststrategie](../qualitaet/teststrategie.md).

`[x]` bedeutet: im aktuellen Quellcode vorhanden und für diesen Stand geprüft.
`[ ]` bedeutet: noch umzusetzen oder erneut zu prüfen. Eine Checkbox wird erst
nach Umsetzung und angemessener Prüfung abgehakt. Wird bei einer vorhandenen
Grundlage Änderungsbedarf festgestellt, kommt dafür ein neuer offener Punkt in
den passenden Abschnitt.

## Herleitung aus Team- und Planungseintragverwaltung

Die Git-Historie zeigt bei der Teamverwaltung die Abfolge Schema, lokale
Speicherung, IPC-/Preload-Schnittstelle, Listenansicht, Anlegen, Bearbeiten und
Löschen. Die Planungseintragverwaltung hat diese Kette wiederverwendet und ihre
Dialoge und Darstellung anschließend gezielt verbessert.

Für die Planungsseite wird dieses Vorgehen angepasst: Die fachlichen und
technischen Grundlagen sind bereits weitgehend vorhanden. Deshalb wird nicht
erneut bei der Speicherung begonnen, sondern die fehlende Oberfläche in
durchgängigen, jeweils nutzbaren Abschnitten ergänzt. Gemeinsame Fachlogik wird
wiederverwendet und nicht im Renderer nachgebaut.

## Bereits vorhandene Grundlage

- [x] Zielverhalten und Abgrenzung der Planungsseite dokumentiert.
- [x] Kalender-, Feiertags- und Zeitberechnungen implementiert und getestet.
- [x] Monatsplanmodell mit Mitarbeiter-, Tages- und Eintragssnapshots
      implementiert und getestet.
- [x] Erzeugung eines neuen Monatsplans aus den aktiven Mitarbeitern
      implementiert und getestet.
- [x] Setzen, Ersetzen und Entfernen von Planungseinträgen fachlich
      implementiert und getestet.
- [x] Monatskennzahlen zentral implementiert und getestet.
- [x] Auflisten, Laden, Anlegen, Speichern und Löschen von Monatsplänen samt
      Sicherungswiederherstellung implementiert und getestet.
- [x] Typisierte Monatsplan-API über Main Process, IPC und Preload angebunden.
- [x] Hauptfenster maximiert und mit der Mindestgröße `1024 × 700` Pixel
      eingerichtet.

Die Planungsansicht im Renderer ist weiterhin ein Platzhalter. Die folgenden
Abschnitte beschreiben die noch offene Feature-Umsetzung.

## Abschnitt 1: Seitenzustand und Monatsvorschau

**Ziel:** Beim Start erscheint eine verständliche, noch nicht bearbeitbare
Vorschau. Gleichzeitig entsteht das Zustandsmodell für die weiteren Schritte.

- [x] Eigene `PlannerPage` anlegen, einbinden und Vorschau, gespeicherten
      Ausgangsstand, Entwurf, Sicherungs-, Lade- und Fehlerzustand klar trennen.
- [x] Aktuellen Monat und aktuelles Jahr initial auswählen sowie Monatswechsel
      und dokumentierte Jahresauswahl umsetzen.
- [x] Vorschau aus aktuellem Team und Kalender bilden, als „Vorschau · nicht
      angelegt“ kennzeichnen und niemals automatisch einen Plan laden.
- [x] Ohne aktive Mitarbeiter den vorgesehenen Leerzustand mit „Zur
      Teamverwaltung“ anzeigen und die Plananlage sperren.

**Abnahme:** Start und Zeitraumwechsel zeigen den richtigen Monat als
nicht bearbeitbare Vorschau. Der Seitenzustand ist eindeutig und getestet,
soweit er als reine Logik ausgelagert werden kann.

## Abschnitt 2: Pläne anlegen, laden und löschen

**Ziel:** Die vollständige Verwaltung gespeicherter Monatspläne ist über die
vorhandene API bedienbar.

- [x] Plantitel-Dialog umsetzen und einen neuen Plan über
      `monthlyPlans.create` unmittelbar speichern und öffnen.
- [x] Globalen Ladedialog mit allen dokumentierten Angaben sowie Lade-, Leer-
      und Fehlerzustand umsetzen.
- [x] Ausgewählten Plan laden, Zeitraum und Seitenzustand synchronisieren und
      eine Sicherungswiederherstellung sichtbar übernehmen.
- [x] Planlöschung mit Bestätigung, gesperrten Parallelaktionen und
      anschließender Listen- beziehungsweise Seitenaktualisierung umsetzen.
- [x] Alle Vorgänge verwenden ausschließlich die gewählte Plan-UUID und den
      vom Main Process zurückgegebenen Stand.

**Abnahme:** Mehrere Pläne desselben Monats lassen sich eindeutig anlegen,
finden, öffnen und löschen. Fehlversuche lassen den vorherigen Zustand
verständlich und weiter bedienbar zurück.

## Abschnitt 3: Planungstabelle und Kennzahlen

**Ziel:** Vorschau und gespeicherter Plan werden als lesbare Monatsmatrix
dargestellt, zunächst noch ohne Bearbeitung.

- [x] Kalendertage, Mitarbeiter-Teilspalten, Rufbereitschaft und Bemerkung in
      der dokumentierten Tabellenstruktur darstellen.
- [x] Für geladene Pläne ausschließlich gespeicherte Snapshots und für die
      Vorschau den aktuellen Mitarbeiterstand verwenden.
- [x] Fixierten Tabellenkopf, fixierte Datumsspalte und erreichbaren
      horizontalen sowie vertikalen Bildlauf umsetzen.
- [x] Wochenenden, Feiertage und Mitarbeiterzuordnung regelkonform und nicht
      ausschließlich über Farbe kennzeichnen.
- [x] Kopfkennzahlen sowie Ist- und Soll-Arbeitszeit ausschließlich aus der
      gemeinsamen Monatsauswertung anzeigen.

**Abnahme:** Leere Vorschau und gespeicherter Plan sind vollständig lesbar;
Snapshots, Kalenderkennzeichnungen und Kennzahlen entsprechen den vorhandenen
Fachfunktionen.

## Abschnitt 4: Planentwurf bearbeiten

**Ziel:** Alle Inhalte des Plans lassen sich lokal im Entwurf ändern und wirken
sich sofort auf Tabelle und Kennzahlen aus.

- [x] Kleine testbare Entwurfsoperationen bereitstellen und dabei vorhandene
      Snapshot- und Validierungslogik wiederverwenden.
- [x] Planungseinträge über ein tastaturbedienbares Popover setzen, ersetzen
      und ohne Bestätigung entfernen; nur aktive Eintragsarten anbieten.
- [x] Rufbereitschaft aus den im Plan gespeicherten Erziehern auswählen oder
      entfernen.
- [x] Tagesbemerkung mit 60-Zeichen-Grenze sowie „Übernehmen“ und „Abbrechen“
      bearbeiten und den Plantitel über die Stift-Aktion ändern.
- [x] Nach jeder übernommenen Änderung die sichtbaren Kennzahlen aus dem
      aktuellen Entwurf neu berechnen.

**Abnahme:** Alle Bearbeitungen verändern nur den Entwurf. Ohne Speichern bleibt
der gespeicherte Ausgangsstand unverändert; Eintrags-UUIDs und Snapshots folgen
den dokumentierten Regeln.

## Abschnitt 5: Speichern und Verlustschutz

**Ziel:** Änderungen werden bewusst gespeichert und können weder durch Fehler
noch durch Navigation unbemerkt verloren gehen.

- [x] Ausgangsstand und Entwurf zuverlässig vergleichen, ungespeicherte
      Änderungen anzeigen und nur dann das Speichern anbieten.
- [x] Über `monthlyPlans.save` speichern, Parallelaktionen verhindern und erst
      den validierten Rückgabestand zum neuen Ausgangsstand machen.
- [x] Bei Speicherfehlern den Entwurf erhalten und eine dauerhafte Meldung mit
      erneutem Versuch anbieten.
- [x] Sicherungszustand bis zum ausdrücklichen Speichern oder Planwechsel als
      „Aus Sicherung geladen · Speichern erforderlich“ behandeln.
- [x] Einen gemeinsamen Schutzdialog für Zeitraum-, Plan- und Seitenwechsel
      sowie für das Schließen des Electron-Fensters umsetzen.

**Abnahme:** Speichern, Verwerfen und Abbrechen führen bei allen geschützten
Aktionen zum gleichen Ergebnis. Ein fehlgeschlagenes Speichern verwirft nichts
und setzt die beabsichtigte Aktion nicht fort.

## Abschnitt 6: Responsivität und barrierearme Bedienung

**Ziel:** Die fertige Planungsseite bleibt im unterstützten Desktopbereich
verständlich und per Maus und Tastatur bedienbar.

- [x] Hauptnavigation zwischen `1024` und `1279` Pixeln als zugänglich
      beschriftete Symbolleiste und ab `1280` Pixeln vollständig darstellen.
- [x] Werkzeugleiste, Hinweise, Dialoge und Tabelle bei beiden Breiten sinnvoll
      anordnen, ohne Pflichtaktionen abzuschneiden.
- [x] Planungszellen und Aktionen zugänglich benennen sowie Fokusführung und
      Fokusrückgabe von Dialogen und Popovern prüfen.
- [x] Sicherstellen, dass gemeinsame Layoutänderungen Team- und
      Planungseintragverwaltung nicht verschlechtern.

**Abnahme:** Die Kernabläufe sind bei `1024 × 700` und ab `1280` Pixeln mit
Maus und Tastatur nutzbar; Status, Auswahl und Zuordnung sind nicht allein von
Farbe abhängig.

## Abschnitt 7: Technische Prüfung und Feature-Abnahme

**Ziel:** Der vollständige Ablauf ist nachvollziehbar geprüft und verbleibende
Abweichungen sind ausdrücklich bekannt.

- [x] Neue reine Zustands- und Entwurfslogik sowie neue Prozessgrenzen gezielt
      automatisiert testen.
- [x] Vorschau, Anlage, Laden, Bearbeiten, Speichern,
      Sicherungswiederherstellung und Löschen als Kernablauf mit isolierten
      Testdaten prüfen.
- [x] Tastaturbedienung, Fokusführung und Darstellung bei `1024 × 700` sowie ab
      `1280` Pixeln manuell prüfen.
- [x] `npm test`, `npm run typecheck`, `npm run lint` und
      `npm run format:check` erfolgreich ausführen.
- [x] Verbleibende Abweichungen dokumentieren und die sichtbare Oberfläche
      abschließend durch den Benutzer abnehmen lassen.

**Abnahme:** Automatische Prüfungen und Kernablauf sind erfolgreich. Die
manuelle Sichtprüfung ist bestätigt oder enthält konkrete offene Restpunkte.

## Abschluss des Features

Die Planungsseite gilt als abgeschlossen, wenn:

- [x] alle sieben Implementierungsabschnitte abgenommen sind,
- [x] keine wesentliche Abweichung zur Feature-Dokumentation offen ist und
- [x] die [Roadmap](roadmap.md) aktualisiert wurde.

Auswertung, Kompaktansicht und PDF-Export bleiben eigenständige Features. Die
weitere Arbeit an der integrierten Dokumentvorschau wird im
[Umsetzungsplan Kompaktansicht](umsetzungsplan-kompaktansicht.md) geführt.
