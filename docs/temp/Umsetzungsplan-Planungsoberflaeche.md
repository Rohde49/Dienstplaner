# Umsetzungsplan für die Planungsoberfläche

> Temporäres Arbeitsdokument für Schritt 8. Die Datei beschreibt die geplante
> Umsetzung vor der Implementierung. Verbindliche fachliche Regeln werden
> dadurch nicht ersetzt. Noch offene Oberflächenentscheidungen müssen vor dem
> jeweils betroffenen Teilabschnitt bestätigt werden.

## 1. Ziel und Abgrenzung

In Schritt 8 werden die bereits umgesetzten Monatsplan-, Snapshot-,
Berechnungs- und Speicherfunktionen erstmals in der Planungsseite
zusammengeführt.

Zum Umfang gehören:

- vorhandene Monatspläne auflisten und laden,
- gespeicherte Monatspläne über einen bestätigten Löschvorgang entfernen,
- einen neuen Monatsplan anlegen,
- den vollständigen Plan aus Kalendertagen und Mitarbeiter-Snapshots anzeigen,
- Planungseinträge setzen, ersetzen und entfernen,
- Rufbereitschaften und Bemerkungen bearbeiten,
- Änderungen zunächst als ungespeicherten Entwurf halten,
- Kennzahlen nach jeder Änderung aus dem Entwurf neu berechnen,
- den Entwurf bewusst speichern,
- Lade-, Fehler-, Sicherungs- und Speicherzustände verständlich anzeigen,
- einen versehentlichen Verlust ungespeicherter Änderungen verhindern.

Nicht zu Schritt 8 gehören:

- die ausführliche Auswertungstabelle aus Schritt 9,
- die als eigenes späteres Feature vorgesehene Kompaktansicht,
- eine gesonderte echte Druckvorschau,
- die Druck- und PDF-Ausgabe,
- neue fachliche Berechnungen oder Plausibilitätsregeln,
- das nachträgliche Ergänzen, Entfernen oder Umsortieren der im Plan
  eingefrorenen Mitarbeiter.

## 2. Bereits festgelegte Grundlagen

- „Dienstplan“ bleibt die Startansicht der Anwendung.
- Das Hauptfenster startet maximiert, bleibt aber ein normales Windows-Fenster
  und verwendet keinen Vollbildmodus.
- Die Planungsseite nutzt die gesamte verfügbare Inhaltsbreite.
- Zwischen `1024` und `1279` Pixel Fensterbreite wird die Hauptnavigation auf
  eine schmale Symbolleiste reduziert. Ab `1280` Pixeln bleiben Symbole und
  Beschriftungen sichtbar.
- Kalendertage stehen zeilenweise, Mitarbeiter in Spalten.
- Die Datumsspalte bleibt beim horizontalen Scrollen sichtbar.
- Der vollständige Tabellenkopf mit Kennzahlen, Mitarbeiternamen und den
  Teilspalten `Eintrag` und `Zeit` bleibt beim vertikalen Scrollen sichtbar.
- Mitarbeiterfarben dienen der Zuordnung, füllen aber nicht die gesamte Spalte.
- Wochenenden und Feiertage werden sichtbar gekennzeichnet; Feiertage haben
  bei Überschneidungen Vorrang.
- Eine Planungszelle enthält höchstens einen Eintrag je Mitarbeiter und Tag.
- Ein Klick auf eine Planungszelle öffnet eine kompakte Auswahl der aktiven
  Eintragsarten.
- Ein vorhandener Eintrag kann über dieselbe Auswahl ersetzt oder ohne
  zusätzliche Bestätigung entfernt werden.
- Nur Planmitarbeiter mit der Snapshot-Rolle `Erzieher` können für eine
  Rufbereitschaft ausgewählt werden.
- Einzelne Bearbeitungsschritte werden nicht sofort gespeichert.
- Ungespeicherte Änderungen werden dauerhaft und nicht nur durch Farbe
  angezeigt.
- Die Oberfläche verwendet die bestehende ruhige, kompakte und helle
  Gestaltung der Verwaltungsseiten.

## 3. Vorgesehener Seitenaufbau

```text
Seitenkopf „Dienstplan"
├── Speicherstatus
└── Aktion „Speichern"

Zeitraum- und Planauswahl
├── vorheriger Monat
├── Monat und Jahr
├── nächster Monat
├── Aktion „Laden"
└── Aktion „Dienstplan erstellen"

Dauerhafte Hinweise
├── Lade- oder Speicherfehler
├── Wiederherstellung aus einer Sicherung
└── ungespeicherte Änderungen

Planungsbereich
├── fixierte Datumsspalte
├── Mitarbeiterköpfe mit Farbe, Name, Wochenarbeitszeit und den vorgesehenen
│   rollenspezifisch sichtbaren Kennzahlen
├── kompakte Planungszellen
├── Rufbereitschaft
├── Bemerkung
└── Abschlusszeilen für Ist- und Soll-Arbeitszeit

Legende
└── verwendete Eintragsarten und Kalenderkennzeichnungen
```

Die planungsrelevanten Kennzahlen sind bereits während der Planung dauerhaft in
den Mitarbeiterköpfen sichtbar. Erzieher und Praktikanten sehen `SN/F-Dienste`,
`Freie Tage` und `Soll-/Ist-Differenz`; Wirtschaftskräfte sehen `Freie Tage` und
`Soll-/Ist-Differenz`. Unterhalb der Kalendertage zeigt das Raster für alle
Rollen die Ist- und Soll-Arbeitszeit. Die darüber hinausgehende detaillierte
Auswertung wird in Schritt 9 ergänzt.

## 4. Seitenzustände

### 4.1 Laden

- Die Seite lädt zunächst die verfügbaren Monatspläne.
- Dabei wird kein bestehender Monatsplan automatisch geöffnet.
- Bei wahrnehmbarer Dauer erscheint ein kompakter Ladezustand.
- Ein Fehler bleibt als dauerhafter Hinweis sichtbar und bietet „Erneut
  versuchen“ an.

### 4.2 Kein Monatsplan geladen

- Monat und Jahr bleiben auswählbar.
- Für den gewählten Zeitraum wird zunächst ein leerer Dienstplan aus allen
  Kalendertagen und den aktuell aktiven Mitarbeitern angezeigt.
- Die leere Darstellung ist nicht bearbeitbar, trägt den sichtbaren Status
  „Vorschau · nicht angelegt“ und ist noch kein gespeicherter Monatsplan.
- Die sichtbaren Planungskennzahlen werden bereits aus dieser leeren Vorschau
  gebildet.
- Ein bestehender Monatsplan wird ausschließlich über die Aktion „Laden“ und
  eine bewusste Auswahl des Benutzers geöffnet.
- Ein neuer Monatsplan entsteht ausschließlich über die Aktion „Dienstplan
  erstellen“.
- Fehlen aktive Mitarbeiter, ist die Anlage eines Monatsplans gesperrt. Der
  leere Zustand erklärt den Grund und verweist verständlich auf die
  Teamverwaltung.

### 4.3 Monatsplan geladen

- Der konkrete Plantitel und Zeitraum sind eindeutig erkennbar.
- Der Planungsbereich zeigt ausschließlich die eingefrorenen Mitarbeiter- und
  Planungseintrag-Snapshots.
- Eine mögliche Sicherungswarnung bleibt sichtbar, bis ein anderer Plan geladen
  oder der wiederhergestellte Stand bewusst gespeichert wurde.

### 4.4 Ungespeicherter Entwurf

- Änderungen erscheinen sofort im Planungsbereich.
- Der Status lautet „Ungespeicherte Änderungen“.
- Es erscheint kein Toast nach jeder Zellenänderung.
- Nach erfolgreichem Speichern wird der vom Main Process zurückgegebene Plan zum
  neuen gespeicherten Ausgangsstand.

## 5. Bedienabläufe

### 5.1 Zeitraum wechseln und Plan laden

1. Monat oder Jahr ändern beziehungsweise zum vorherigen oder nächsten Monat
   wechseln.
2. Für den gewählten Zeitraum einen nicht bearbeitbaren leeren Dienstplan mit
   allen Kalendertagen, den aktuell aktiven Mitarbeitern und den daraus
   gebildeten Kennzahlen anzeigen; ein vorhandener Plan wird nicht automatisch
   geöffnet.
3. Erst die Aktion „Laden“ öffnet den Auswahldialog mit allen gespeicherten
   Monatsplänen unabhängig vom aktuell gewählten Zeitraum.
4. Jeder Listeneintrag zeigt ID, Titel, Monat, Jahr, Erstellungszeitpunkt und
   letzten Änderungszeitpunkt. Die Liste ist nach dem letzten
   Änderungszeitpunkt absteigend sortiert.
5. Der Benutzer öffnet einen bestehenden Plan bewusst über diese Ladefunktion.
   Existiert kein Plan, bleibt der Dialog geöffnet und zeigt eine entsprechende
   Information.
6. Vor dem tatsächlichen Wechsel zu einem anderen Plan wird bei ungespeicherten
   Änderungen eine Entscheidung zum Speichern, Verwerfen oder Abbrechen
   verlangt.

### 5.2 Monatsplan erstellen

1. Monat und Jahr stehen bereits fest.
2. Der Benutzer gibt einen Plantitel ein.
3. Die Anlage verwendet die aktuell aktiven Mitarbeiter.
4. Der zurückgegebene vollständige Plan wird unmittelbar angezeigt.
5. Die bewusste Anlage wird als gespeicherter Ausgangsstand behandelt. Alle
   anschließenden Änderungen bleiben bis zur ausdrücklichen Aktion „Speichern“
   ausschließlich im Entwurf.

### 5.3 Planungseintrag bearbeiten

1. Klick auf eine Mitarbeiterzelle.
2. Auswahl zeigt aktive Eintragsarten mit Kürzel und Zeitspanne, jedoch ohne
   Bezeichnung. Der aktuell gesetzte Eintrag ist markiert.
3. Auswahl setzt oder ersetzt den vollständigen Snapshot.
4. Bei belegter Zelle wird zusätzlich „Eintrag entfernen“ angeboten.
5. Plan, Kennzahlen und Speicherstatus werden unmittelbar aktualisiert.

### 5.4 Rufbereitschaft bearbeiten

- Die Auswahl enthält ausschließlich Erzieher aus dem Mitarbeiter-Snapshot des
  Plans.
- `Keine Rufbereitschaft` entfernt eine vorhandene Zuordnung.
- Die Änderung wird wie jede andere Planänderung zunächst nur im Entwurf
  vorgenommen.

### 5.5 Bemerkung bearbeiten

- Die Bemerkung gehört eindeutig zum jeweiligen Kalendertag.
- Leere oder ausschließlich aus Leerzeichen bestehende Eingaben werden als
  `null` behandelt.
- Die Eingabe ist auf 60 Zeichen begrenzt. Vorhandener Inhalt wird im Raster nur
  als kompakte Vorschau dargestellt und darf die Tabellenzeile nicht
  unkontrolliert vergrößern.

### 5.6 Monatsplan löschen

1. Im Ladedialog besitzt jeder Plan eine zugänglich beschriftete Löschaktion mit
   Papierkorb-Symbol.
2. Vor dem Löschen erscheint immer ein Bestätigungsdialog, der ID und Titel des
   Plans nennt.
3. Ein nicht geöffneter Plan kann auch bei ungespeicherten Änderungen des
   aktuell bearbeiteten Plans gelöscht werden.
4. Der aktuell geladene Plan kann nur ohne ungespeicherte Änderungen gelöscht
   werden. Andernfalls muss der Benutzer diese zuerst speichern oder verwerfen.
5. Nach dem Löschen des aktuell geladenen Plans zeigt die Seite wieder die leere
   Vorschau des gewählten Zeitraums.
6. Während des Löschens sind weitere Lade- und Löschaktionen gesperrt. Nach
   erfolgreichem Löschen wird die Liste aktualisiert und der Ladedialog bleibt
   geöffnet.

## 6. Zustands- und Datenfluss

Die Oberfläche unterscheidet ausdrücklich:

- die Liste vorhandener Pläne,
- den zuletzt geladenen oder gespeicherten Plan,
- den aktuell bearbeiteten Entwurf,
- die aus dem Entwurf berechnete Auswertung,
- Lade-, Speicher- und Fehlerzustände,
- eine mögliche Wiederherstellungswarnung.

Planänderungen verwenden die bereits vorhandenen gemeinsamen Fachfunktionen
und Schemas. Die Oberfläche baut Snapshots und Berechnungswerte nicht in einer
zweiten abweichenden Logik nach. Vor dem Speichern prüft der Main Process den
vollständigen Plan erneut.

## 7. Vorgesehene fachliche Komponenten

Die konkrete Benennung darf sich während der Umsetzung noch geringfügig
ändern. Die Verantwortlichkeiten sollen getrennt bleiben:

```text
features/planner/
├── PlannerPage
├── PlanSelectionToolbar
├── CreateMonthlyPlanDialog
├── LoadMonthlyPlanDialog
├── DeleteMonthlyPlanDialog
├── MonthlyPlanGrid
├── PlanDateCell
├── PlanEmployeeHeader
├── PlanEntryCell
├── PlanEntryPopover
├── OnCallCell
├── DayNoteCell
└── PlanningLegend
```

Globale Komponenten werden nur ergänzt, wenn sie auch außerhalb der
Planungsseite sinnvoll wiederverwendbar sind. Der eigentliche Dienstplan bleibt
eine eigene fachliche Komponente und wird nicht in eine universelle Tabelle
gezwungen.

## 8. Geplante Umsetzungsschritte

### 8.1 Seitengrundlage und Laden

- [ ] Hauptfenster beim Anwendungsstart maximiert anzeigen.
- [ ] Hauptnavigation im dokumentierten kleineren Desktopbereich auf eine
      Symbolleiste reduzieren.
- [ ] Platzhalter durch eine eigene Planungsseite ersetzen.
- [ ] Planliste und aktuelle Mitarbeiter laden sowie Lade-, Vorschau- und
      Fehlerzustände anzeigen.
- [ ] Wiederholtes Laden nach einem Fehler ermöglichen.

Abnahme:

- [ ] Die Seite verwendet die vorhandene Plan-Schnittstelle.
- [ ] Die Anwendung startet maximiert, ohne in den Vollbildmodus zu wechseln.
- [ ] Bei der Mindestfenstergröße beansprucht die Navigation nur die
      vorgesehene schmale Symbolbreite.
- [ ] Fehler und fehlende Pläne sind verständlich voneinander unterscheidbar.
- [ ] Ohne geladenen Plan erscheint die eindeutig als nicht angelegt
      bezeichnete, nicht bearbeitbare Monatsvorschau.

### 8.2 Zeitraum, Planauswahl und Neuanlage

- [ ] Monats- und Jahresauswahl anbinden.
- [ ] Wechsel zum vorherigen und nächsten Monat umsetzen.
- [ ] Ladedialog mit allen Plänen, den festgelegten Informationsfeldern und der
      Sortierung nach dem letzten Änderungszeitpunkt umsetzen.
- [ ] Verständlichen Leerzustand im weiterhin geöffneten Ladedialog anzeigen.
- [ ] Bewusste, tastaturbedienbare Planauswahl umsetzen.
- [ ] Bestätigtes Löschen einschließlich Schutz des ungespeicherten aktuell
      geladenen Plans umsetzen.
- [ ] Dialog zur Eingabe des Plantitels und zur Anlage ergänzen.

Abnahme:

- [ ] Ein Plan kann angelegt und anschließend wieder eindeutig geladen werden.
- [ ] Mehrere Pläne desselben Monats werden nicht zusammengeführt oder
      überschrieben.
- [ ] Ein gelöschter Plan verschwindet aus der aktualisierten Liste; beim
      Löschen des geladenen Plans erscheint anschließend die leere Vorschau.
- [ ] Der aktuell geladene Plan kann mit ungespeicherten Änderungen nicht
      gelöscht werden.

### 8.3 Lesbare Planraster-Grundlage

- [ ] Kalendertage vollständig und chronologisch darstellen.
- [ ] Mitarbeiter-Snapshots in ihrer gespeicherten Reihenfolge darstellen.
- [ ] Datumsspalte horizontal fixieren.
- [ ] Den vollständigen Tabellenkopf vertikal fixieren.
- [ ] Wochenenden, Feiertage und Mitarbeiterfarben barrierearm kennzeichnen.
- [ ] Horizontalen und vertikalen Platzbedarf bei mindestens `1024 × 700`
      prüfen.

Abnahme:

- [ ] Ein leerer und ein gefüllter Monatsplan bleiben übersichtlich lesbar.
- [ ] Die leere Vorschau zeigt alle Kalendertage und ausschließlich die aktuell
      aktiven Mitarbeiter.
- [ ] Namen, Kennzahlen sowie die Teilspalten `Eintrag` und `Zeit` bleiben beim
      vertikalen Scrollen sichtbar und eindeutig zugeordnet.
- [ ] Kein Inhalt wird durch sehr viele Mitarbeiterspalten unlesbar
      zusammengedrückt.

### 8.4 Planungseinträge bearbeiten

- [ ] Eintragsauswahl für leere und belegte Zellen umsetzen.
- [ ] Nur aktive Eintragsarten zur Neuauswahl anbieten.
- [ ] Setzen, Ersetzen und Entfernen über die gemeinsamen Fachfunktionen
      ausführen.
- [ ] Geänderte Zelle und ungespeicherten Zustand sichtbar machen.

Abnahme:

- [ ] Bestehende Snapshots ändern sich nur in der ausdrücklich bearbeiteten
      Zelle.
- [ ] Jede Änderung aktualisiert Entwurf und Berechnungen unmittelbar.

### 8.5 Rufbereitschaft und Bemerkungen

- [ ] Rufbereitschaft pro Kalendertag auswählen oder entfernen.
- [ ] Auswahl auf Erzieher des Plans begrenzen.
- [ ] Tagesbemerkung kompakt anzeigen und bearbeiten.
- [ ] Optionale Tagesbemerkung an der Oberfläche und Fachgrenze auf maximal 60
      Zeichen begrenzen.

Abnahme:

- [ ] Ungültige Rollen können nicht als Rufbereitschaft ausgewählt werden.
- [ ] Bemerkungen bleiben dem richtigen Kalendertag zugeordnet.
- [ ] Leere Bemerkungen bleiben ohne Platzhalter; Eingaben mit mehr als 60
      Zeichen werden verständlich abgelehnt.

### 8.6 Speichern und Änderungsschutz

- [ ] Speicherstatus und Speichern-Aktion anbinden.
- [ ] Sicherungswarnung dauerhaft anzeigen.
- [ ] Wechsel der Hauptseite, des Zeitraums oder des Plans sowie das Schließen
      der Anwendung bei ungespeicherten Änderungen absichern.
- [ ] Mehrfaches Speichern während eines laufenden Vorgangs verhindern.

Abnahme:

- [ ] Erfolgreiches Speichern setzt den zurückgegebenen Plan als neuen
      Ausgangsstand.
- [ ] Fehler lassen den Entwurf zur erneuten Bearbeitung erhalten.
- [ ] Ungespeicherte Änderungen können nicht unbemerkt verloren gehen.

### 8.7 Live-Berechnung und sichtbare Planungskennzahlen

- [ ] Vollständige Monatsauswertung nach jeder Entwurfsänderung neu berechnen.
- [ ] Berechnungen ausschließlich aus dem aktuellen Plan-Snapshot durchführen.
- [ ] SN/F-Dienste bei Erziehern und Praktikanten sowie freie Tage und
      Soll-/Ist-Differenz bei allen Rollen dauerhaft im jeweiligen
      Mitarbeiterkopf anzeigen.
- [ ] Ist- und Soll-Arbeitszeit für alle Rollen in Abschlusszeilen unterhalb
      des Dienstplans anzeigen.
- [ ] Ergebnis für die Auswertungsdarstellung aus Schritt 9 bereitstellen.

Abnahme:

- [ ] Eine Zellenänderung aktualisiert die betroffenen Werte unmittelbar.
- [ ] Die drei Kennzahlen sowie Ist- und Soll-Arbeitszeit bleiben während der
      Planung ohne zusätzlichen Dialog sichtbar.
- [ ] Die Soll-Arbeitszeit bleibt bei einer reinen Änderung von
      Planungseinträgen unverändert.

### 8.8 Gesamtprüfung der Planungsseite

- [ ] Fachliche Komponenten gezielt automatisch prüfen.
- [ ] Typecheck, Lint und Formatprüfung ausführen.
- [ ] Technischen Kernablauf von Anlage bis erneutem Laden prüfen.
- [ ] Oberfläche bei `1024 × 700` und bei einem größeren Desktopfenster prüfen.
- [ ] Sichtbare Bedienung gemeinsam mit dem Benutzer abnehmen.

## 9. Vor der Implementierung zu bestätigende Entscheidungen

Die Nummerierung entspricht der ausführlichen Altsystemanalyse. Bestätigte
Punkte werden hier unmittelbar festgehalten; die übrigen werden nacheinander
gemeinsam entschieden.

### [x] Entscheidung 1: Plananlage ohne aktive Mitarbeiter

Ein Monatsplan darf nur erstellt werden, wenn mindestens ein aktiver Mitarbeiter
vorhanden ist. Andernfalls ist die Anlage gesperrt und die Oberfläche verweist
mit einer verständlichen Begründung auf die Teamverwaltung.

### [x] Entscheidung 2: Laden bestehender Monatspläne

Für einen gewählten Zeitraum wird zunächst immer ein leerer Dienstplan
angezeigt. Kein vorhandener Plan wird automatisch geöffnet – unabhängig davon,
wie viele Pläne für den Zeitraum existieren. Ein bestehender Plan wird nur über
die Aktion „Laden“ bewusst geöffnet. Der Dialog zeigt alle gespeicherten Pläne
mit ID, Titel, Monat, Jahr, Erstellungszeitpunkt und letztem
Änderungszeitpunkt. Die Sortierung erfolgt nach dem letzten Änderungszeitpunkt
absteigend. Auch ohne gespeicherte Pläne lässt sich der Dialog öffnen und zeigt
dann eine entsprechende Information. Änderungen am geladenen oder neu
angelegten Plan werden nicht automatisch gespeichert und bleiben bis zur
ausdrücklichen Aktion „Speichern“ sichtbar als ungespeichert gekennzeichnet.

### [x] Entscheidung 3: Plantitel anlegen und bearbeiten

Der verpflichtende Plantitel wird beim Erstellen eingegeben und kann bereits in
Schritt 8 über eine zurückhaltende Aktion neben dem angezeigten Plantitel
bearbeitet werden. Eine Titeländerung gilt wie jede andere Bearbeitung als
ungespeicherte Änderung und wird erst durch die ausdrückliche Aktion
„Speichern“ übernommen.

### [x] Entscheidung 4: Dichte der Mitarbeiter- und Planungszellen

Jeder Mitarbeiter erhält zwei Teilspalten:

1. **Eintrag:** dient zum Setzen eines Planungseintrags und zeigt dessen Kürzel
   an.
2. **Zeit:** zeigt Beginn und Ende gemeinsam als Zeitspanne, beispielsweise
   `06:00–14:00`, an.

Beginn und Ende erhalten keine getrennten Spalten, weil sie aus der gewählten
Eintragsart stammen und in der Planung nicht unabhängig bearbeitet werden. So
bleiben Kürzel und Zeit unmittelbar sichtbar, während das Raster weniger Breite
als die dreigeteilte Darstellung des Altsystems benötigt.

### [x] Entscheidung 5: Eintragsauswahl und Tastaturbedienung

Die Eintragsauswahl zeigt das Kürzel und die zugehörige Zeitspanne gleichwertig
nebeneinander. Die Bezeichnung der Eintragsart wird in dieser Auswahl nicht
angezeigt. Der aktuell gesetzte Eintrag ist deutlich markiert. Bei einer
belegten Zelle wird zusätzlich das Entfernen des Eintrags angeboten.

Die Auswahl ist per Mausklick sowie mit Tab, Enter und Escape bedienbar. Eine
besondere Navigation des gesamten Planungsrasters mit Pfeiltasten gehört nicht
zum ersten Umsetzungsstand und kann bei nachgewiesenem Bedarf später ergänzt
werden.

### [x] Entscheidung 6: Rufbereitschaft und Bemerkung im Raster

Die beiden tagesbezogenen Spalten stehen rechts hinter sämtlichen
Mitarbeiterspalten. Damit folgt eine Tageszeile der fachlichen Reihenfolge
Datum, Mitarbeitereinsätze, Rufbereitschaft und Bemerkung. Die
Mitarbeiterspalten werden durch die beiden übergreifenden Angaben nicht
unterbrochen.

### [x] Entscheidung 7: Bearbeitung der Tagesbemerkung

Die Tagesbemerkung ist optional und auf maximal 60 Zeichen begrenzt. Eine leere
Bemerkungszelle enthält weder einen Platzhalter noch einen Hinweistext. Bei
vorhandenem Inhalt zeigt die Spalte eine kompakte Vorschau. Ein Klick auf die
Zelle öffnet ein größeres, mehrzeiliges Eingabefeld in einem Popover. Änderungen
bleiben bis zur ausdrücklichen Aktion „Speichern“ Bestandteil des
ungespeicherten Entwurfs.

### [x] Entscheidung 8: Sichtbare Planungskennzahlen in Schritt 8

Die Kennzahlen werden dauerhaft im jeweiligen Mitarbeiterkopf angezeigt und
nach jeder Entwurfsänderung unmittelbar aktualisiert. Erzieher und Praktikanten
sehen `SN/F-Dienste`, `Freie Tage` und `Soll-/Ist-Differenz`.
Wirtschaftskräfte sehen `Freie Tage` und `Soll-/Ist-Differenz`. Unterhalb des
Dienstplans werden die Ist- und Soll-Arbeitszeit für alle Rollen sichtbar
dargestellt. Diese Werte sind essentielles Feedback für die laufende Planung
und kein Ersatz für die ausführliche Auswertung aus Schritt 9.

### [x] Entscheidung 9: Noch nicht umgesetzte Ausgabeaktionen

„Drucken“ und „PDF-Export“ werden bis zu ihrer späteren technischen Umsetzung
vollständig ausgeblendet und erhalten keine Platzhalter im Seitenkopf. Die
zugehörigen Bedienelemente werden erst gemeinsam mit den tatsächlich
funktionsfähigen Ausgaben ergänzt. Eine eigenständige echte Druckvorschau ist
vorerst nicht vorgesehen.

### [x] Entscheidung 10: Eigenständige Kompaktansicht

Die im Altsystem als „Druckvorschau“ bezeichnete kompakte Bildschirmdarstellung
wird im aktuellen Projekt fachlich korrekt als „Kompaktansicht“ geführt. Sie
gehört nicht zu Schritt 8 und wird später als eigenständiges Feature fachlich
beschrieben und technisch umgesetzt. Bis dahin erhält die Planungsseite weder
eine Umschaltung noch einen Platzhalter dafür. Die spätere Kompaktansicht ist
von einer Druckvorschau sowie der Druck- und PDF-Funktion unabhängig.

### [x] Ergänzende Entscheidung 11: Leerer Vorschauplan vor der Anlage

Solange kein Monatsplan angelegt oder geladen wurde, zeigt die Planungsseite
für den gewählten Zeitraum eine nicht bearbeitbare Vorschau mit allen
Kalendertagen und den aktuell aktiven Mitarbeitern. Sie ist sichtbar als
„Vorschau · nicht angelegt“ gekennzeichnet und zeigt bereits die aus dem leeren
Planungsstand gebildeten Kennzahlen. Erst „Dienstplan erstellen“ verlangt den
Titel, erzeugt die endgültigen Snapshots und speichert den neuen Monatsplan.
Erst danach können Planungswerte bearbeitet werden.

### [x] Ergänzende Entscheidung 12: Rollenbezug der sichtbaren Kennzahlen

Soll-Arbeitszeit, Ist-Arbeitszeit und Soll-/Ist-Differenz werden für alle Rollen
berechnet und angezeigt. Im Mitarbeiterkopf sehen Erzieher und Praktikanten die
drei Kennzahlen `SN/F-Dienste`, `Freie Tage` und `Soll-/Ist-Differenz`.
Wirtschaftskräfte sehen dort ausschließlich `Freie Tage` und
`Soll-/Ist-Differenz`. Die Abschlusszeilen für Ist- und Soll-Arbeitszeit werden
bei allen Mitarbeitern dargestellt. Die Auswahl sichtbarer Kennzahlen ändert
nicht die rollenunabhängigen Berechnungsformeln.

### [x] Ergänzende Entscheidung 13: Fixierter Tabellenkopf

Beim vertikalen Scrollen bleibt der vollständige Tabellenkopf mit Kennzahlen,
Mitarbeiternamen sowie den Teilspalten `Eintrag` und `Zeit` sichtbar. Beim
horizontalen Scrollen bleibt die Datumsspalte links fixiert. Die Abschlusszeilen
für Ist- und Soll-Arbeitszeit bleiben dagegen am regulären Tabellenende und
werden nicht dauerhaft fixiert.

### [x] Ergänzende Entscheidung 14: Löschen im Ladedialog

Jeder Plan besitzt im Ladedialog eine zugänglich beschriftete Löschaktion mit
Papierkorb-Symbol. Vor jedem Löschen bestätigt der Benutzer den anhand von ID
und Titel benannten Plan. Nicht geöffnete Pläne dürfen unabhängig vom
ungespeicherten Entwurf des aktuell bearbeiteten Plans gelöscht werden. Der
aktuell geladene Plan darf dagegen erst gelöscht werden, wenn keine
ungespeicherten Änderungen mehr vorliegen. Nach seinem Löschen erscheint wieder
die leere Vorschau. Während eines Löschvorgangs sind weitere Lade- und
Löschaktionen gesperrt; anschließend wird die Liste aktualisiert und der Dialog
bleibt geöffnet.

### [x] Ergänzende Entscheidung 15: Maximiertes Fenster und kompakte Navigation

Das Hauptfenster der Anwendung startet maximiert und nutzt damit die verfügbare
Bildschirmfläche, bleibt jedoch ein normales Windows-Fenster mit Titelleiste
und Wiederherstellungsmöglichkeit. Es wird kein Vollbildmodus verwendet.
Zwischen `1024` und `1279` Pixel Fensterbreite reduziert sich die feste
Hauptnavigation auf eine schmale Symbolleiste. Die Bezeichnungen bleiben über
zugängliche Beschriftungen beziehungsweise Tooltips verfügbar. Ab `1280`
Pixeln zeigt die Navigation weiterhin Symbol und sichtbare Beschriftung.

## 10. Freigabepunkt

Die eigentliche Implementierung beginnt erst, nachdem:

- die offenen Entscheidungen aus Abschnitt 9 geklärt wurden,
- dieser Ablauf gemeinsam bestätigt wurde und
- keine widersprüchlichen Festlegungen in den verbindlichen Dokumenten
  verbleiben.
