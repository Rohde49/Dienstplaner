# Abstimmung zur Kompaktansicht

## Status

- **Status:** Abgeschlossen
- **Abschluss dokumentiert am:** 16. September 2026, 17:43 Uhr
- **Zeitzone:** Europe/Berlin
- **Abschlussnachweis:** Commit `3520495`

Die fachliche, gestalterische und technische Abstimmung ist abgeschlossen. Die
bestätigten Ergebnisse wurden in die zuständigen Dokumente unter `docs/`
übernommen. Für das dauerhafte Zielverhalten ist nun insbesondere die
[Kompaktansicht](../../features/kompaktansicht.md) maßgeblich. Der ebenfalls
abgeschlossene [Umsetzungsplan](umsetzungsplan-kompaktansicht.md) dokumentiert
die anschließende Umsetzung.

Dieses Dokument bleibt als nachvollziehbares Entscheidungsprotokoll erhalten.
Konkrete Schriftgrößen, Spaltenbreiten und Skalierungsgrenzen werden wie
vereinbart erst am sichtbaren A4-Prototyp entschieden.

Aussagen über einen „späteren“ oder deaktivierten PDF-Export dokumentieren den
damaligen Abstimmungsstand. Der PDF-Export wurde danach umgesetzt; für seinen
aktuellen Umfang ist die
[Feature-Dokumentation](../../features/pdf-export.md) maßgeblich.

## Zweck dieses Dokuments

Dieses Protokoll hält die abgeschlossene fachliche, gestalterische und
technische Abstimmung zur Kompaktansicht sowie ihre Herleitung fest. Es ersetzt
weder die dauerhafte Feature-Dokumentation noch den fortzuschreibenden
Umsetzungsplan.

## Bestätigte Festlegungen

### Zweck und Einordnung

- Die Kompaktansicht zeigt den Monatsplan, der auf der Planungsseite geladen
  beziehungsweise geöffnet ist.
- Sie ist eine ruhige, schreibgeschützte Kontrollansicht, in der die tägliche
  Besetzung über den gesamten Monat schneller erfassbar sein soll als in der
  bearbeitbaren Planungstabelle.
- Sie ist keine Bearbeitungsansicht und keine Auswertung.
- Sie ist eine layoutgetreue Bildschirmvorschau der späteren PDF. Spalten,
  Zeilen, Inhalte, Ausrichtung und Umbrüche sollen der PDF entsprechen.
- Die dargestellte A4-Seite darf auf dem Bildschirm abhängig vom verfügbaren
  Platz vergrößert oder verkleinert werden. Die Skalierung verändert das
  Dokumentlayout nicht.
- Kompaktansicht und PDF sollen dasselbe Dokumentlayout verwenden, damit
  Vorschau und exportiertes Ergebnis nicht voneinander abweichen.
- Die Kompaktansicht erzeugt selbst keine Datei. Das bleibt Aufgabe des
  späteren PDF-Exports.
- Der vollständige Dienstplan soll auf genau eine A4-Seite im Hochformat
  passen.

### Datengrundlage

- Die Kompaktansicht zeigt ausschließlich den tatsächlich gespeicherten Stand
  des geladenen Monatsplans.
- Ungespeicherte Änderungen des aktuellen Planentwurfs werden in der
  Kompaktansicht nicht dargestellt.

### Ungespeicherte Änderungen

- Der Wechsel zur Kompaktansicht bleibt auch dann möglich, wenn der geöffnete
  Plan ungespeicherte Entwurfsänderungen enthält.
- Die Kompaktansicht zeigt in diesem Fall weiterhin ausschließlich den zuletzt
  gespeicherten Ausgangsstand.
- Oberhalb der Vorschau erscheint dauerhaft der Hinweis:
  `Diese Ansicht zeigt den zuletzt gespeicherten Stand. Ungespeicherte Änderungen sind nicht enthalten.`
- Der Ansichtswechsel löst keinen Speicher- oder Verlustschutzdialog aus, weil
  er den Entwurf weder verändert noch verwirft.
- Die Aktion `Speichern` ist in der Kompaktansicht deaktiviert. Zum Prüfen und
  Speichern des Entwurfs muss in die Planansicht zurückgewechselt werden.
- Nach erfolgreichem Speichern verwendet die Kompaktansicht beim nächsten
  Wechsel automatisch den neuen gespeicherten Stand.

### Verfügbarkeit und besondere Planstände

- In der unverbindlichen Monatsvorschau ohne geöffneten Plan bleibt die
  Kompaktansicht deaktiviert.
- Während eines laufenden Speichervorgangs ist der Ansichtswechsel deaktiviert.
  Erst nach erfolgreichem Abschluss steht der neue gespeicherte Stand eindeutig
  fest.
- Wurde ein Plan aus einer Sicherungsdatei wiederhergestellt, bleibt die
  Kompaktansicht deaktiviert, bis dieser Stand ausdrücklich als regulärer
  Planstand gespeichert wurde.
- Die Aktion `Auswertung` ist in der Kompaktansicht deaktiviert, weil die
  bestehende Auswertung den aktuellen Entwurf verwendet. Dadurch werden nicht
  gleichzeitig der gespeicherte Stand in der Kompaktansicht und ein davon
  abweichender Entwurf in der Auswertung gezeigt.
- Für einen neu angelegten Plan ist die Kompaktansicht verfügbar, weil der Plan
  bereits bei seiner Anlage gespeichert wird.

### Ansichtswechsel

- Der vorhandene Umschalter `Plan | Kompakt` bleibt im ausklappbaren Bereich
  der Planungswerkzeugleiste.
- Die aktuell aktive Ansicht ist als ausgewähltes Segment eindeutig
  hervorgehoben.
- Der Wechsel erfolgt direkt innerhalb der Planungsseite und öffnet weder einen
  Dialog noch einen eigenen Navigationsbereich.
- Jeder neu angelegte oder neu geladene Monatsplan startet in der Planansicht.
- Die Rückkehr zur unverbindlichen Monatsvorschau setzt die Ansicht ebenfalls
  auf `Plan` zurück.
- Der Wechsel zwischen Plan- und Kompaktansicht verändert oder verwirft den
  vorhandenen Entwurf nicht und löst deshalb keinen Verlustschutzdialog aus.
- Der Umschalter ist vollständig per Tastatur bedienbar.
- Monatsauswahl und die Aktion `Laden` bleiben in der Kompaktansicht
  grundsätzlich erreichbar. Beim Verlassen des geöffneten Plans schützt der
  bestehende Verlustschutz weiterhin möglicherweise vorhandene, in der
  Kompaktansicht nicht sichtbare Entwurfsänderungen.

### Darstellung der A4-Seite auf dem Bildschirm

- Die weiße A4-Seite im Hochformat steht zentriert auf einer neutralen grauen
  Arbeitsfläche.
- Ein dünner Seitenrand und ein dezenter Schatten grenzen das Dokument auf dem
  Bildschirm von seiner Umgebung ab.
- Die Darstellung bewahrt stets das Seitenverhältnis von A4 und verändert beim
  Skalieren nicht das Dokumentlayout oder seine Umbrüche.
- Die Seite wird an die verfügbare Inhaltsbreite angepasst. Bei der kleinsten
  unterstützten Fensterbreite bleibt ihre vollständige Breite ohne
  horizontalen Bildlauf sichtbar.
- Die vollständige Seitenhöhe muss nicht gleichzeitig sichtbar sein.
  Vertikales Scrollen hat Vorrang vor einer für die Lesbarkeit zu kleinen
  Gesamtdarstellung.
- Auf großen Fenstern wird die Seite nicht unnötig über ihre vorgesehene
  Darstellungsgröße hinaus vergrößert.
- Eigene Zoom-Schaltflächen gehören zunächst nicht zum Umfang.
- Graue Arbeitsfläche, Seitenrand und Schatten dienen nur der
  Bildschirmorientierung und erscheinen nicht in der exportierten PDF.

### Interaktion innerhalb der Vorschau

- Die Tabelle innerhalb der A4-Vorschau ist vollständig schreibgeschützt und
  enthält keine auswählbaren oder anklickbaren Zeilen und Zellen.
- Es gibt keine orange Zeilenhervorhebung und keine Hovereffekte auf
  Tabellenzellen.
- Tabellenkopf und Spalten werden innerhalb der dargestellten A4-Seite nicht
  fixiert. Sie bleiben Bestandteil des unveränderten Dokumentlayouts.
- Die Vorschau öffnet keine Popover und bietet keine anderen
  Bearbeitungsaktionen an.
- Innerhalb der Vorschau ist ausschließlich das normale Scrollen durch das
  Dokument vorgesehen.

### Einseitige Passung und Überlauf

- Das Dokumentlayout wird für den realistischen Grenzfall mit 31 Kalendertagen
  und neun Mitarbeiterspalten optimiert.
- Bemerkungen und andere Inhalte werden weder abgeschnitten noch mit
  Auslassungspunkten gekürzt.
- Das vollständige Dokument darf gleichmäßig verkleinert werden, solange alle
  Inhalte gut lesbar bleiben.
- Die verbindliche Mindestschriftgröße und Mindestskalierung werden anhand des
  visuellen A4-Prototyps bestimmt.
- Passt der Inhalt selbst an dieser Lesbarkeitsgrenze nicht auf eine Seite,
  erscheint dauerhaft der Hinweis:
  `Der Dienstplan passt mit den aktuellen Inhalten nicht lesbar auf eine A4-Seite.`
- Eine spätere PDF-Ausgabe wird in diesem Zustand verhindert. Die erste
  Umsetzung erzeugt weder unbemerkt eine weitere Seite noch verbirgt sie
  Inhalte.

### Dokumentkopf

- Der Plantitel steht als größte Überschrift über der Tabelle.
- Darunter stehen der ausgeschriebene Monat und das Jahr, beispielsweise
  `September 2026`.
- Der Dokumentkopf zeigt den Speicherstand ausschließlich als Datum im Format
  `Stand: DD.MM.YYYY`. Eine Uhrzeit wird nicht angezeigt.
- Die technische Plan-ID wird nicht dargestellt.
- Bezeichnungen wie `Kompaktansicht` oder `Druckvorschau` erscheinen weder im
  Dokumentkopf noch in der späteren PDF.

### Bisher bestätigte Grundstruktur

- Jeder Mitarbeiter erhält genau eine Spalte.
- Im Mitarbeiterkopf wird nur der Nachname angezeigt.
- Haben mehrere Mitarbeiter im Plan denselben Nachnamen, wird zur eindeutigen
  Unterscheidung zusätzlich der erste Buchstabe des Vornamens angezeigt,
  beispielsweise `E. Müller` und `M. Müller`.
- Der Mitarbeitername steht horizontal, zentriert und halbfett im
  Tabellenkopf. Gedrehte oder senkrechte Schrift wird nicht verwendet.
- Lange Nachnamen dürfen auf höchstens zwei Zeilen umbrechen.
- Der Mitarbeiterkopf erhält eine dezente Hintergrundfläche in der im Plan
  gespeicherten Mitarbeiterfarbe. Eine ausreichend kontrastreiche dunkle
  Schrift und der sichtbare Name erhalten die Zuordnung unabhängig von der
  Farberkennung.
- Rolle und weitere Mitarbeiterangaben werden im Tabellenkopf nicht angezeigt.
- Die Datumsspalte zeigt den abgekürzten Wochentag und das Datum einzeilig im
  Format `Mo 01.09.`.
- Die Bemerkungsspalte erhält eine feste, noch festzulegende Breite. Längere
  Bemerkungen brechen innerhalb dieser Spalte nach unten um.
- Die Dimensionierung soll sich an realistischen Plandaten orientieren und
  nicht daran, dass alle zulässigen Textfelder gleichzeitig ihre technische
  Maximallänge ausschöpfen.

### Inhalt einer Mitarbeiterzelle

- Eine belegte Mitarbeiterzelle zeigt das Kürzel des Planungseintrags in der
  oberen Zeile.
- Darunter zeigt sie die im Planungseintrag gespeicherte Zeitspanne von Beginn
  bis Ende. Die Zeitspanne ist eine wesentliche Information des Dienstplans und
  darf nicht zugunsten eines kompakteren Layouts weggelassen werden.
- Die Kompaktansicht verwendet für Uhrzeiten ein kurzes Format:
  - Stunden erhalten keine führende Null.
  - Bei vollen Stunden entfällt `:00` immer.
  - Minuten ungleich `00` bleiben zweistellig sichtbar.
- Beginn und Ende werden platzsparend durch einen Gedankenstrich ohne
  Leerzeichen getrennt.
- Beispiele für die Darstellung sind `5:30–9`, `12–22:30` und `6–14`.
- Besitzt ein Planungseintrag keine hinterlegte Zeitspanne, zeigt die Zelle nur
  sein Kürzel und keine zusätzliche Zeitangabe oder Ersatzbeschriftung.
- Eine vollständig unbelegte Mitarbeiterzelle bleibt sichtbar leer. Sie zeigt
  weder einen Gedankenstrich noch eine Schraffur oder einen anderen
  Platzhalter.
- Tabellenlinien und gegebenenfalls die Kennzeichnung des Kalendertags bleiben
  auch bei einer unbelegten Zelle sichtbar. In der Bildschirmvorschau darf eine
  zugängliche Beschriftung den Zustand als `Kein Eintrag` bezeichnen, ohne
  sichtbaren Text in die Zelle einzufügen.

### Rufbereitschaft

- Hinter den Mitarbeiterspalten steht eine eigene schmale Spalte für die
  Rufbereitschaft.
- Die Spaltenüberschrift lautet `RB`.
- Ist eine Rufbereitschaft eingeteilt, zeigt die Zelle grundsätzlich den
  Nachnamen des zugeordneten Mitarbeiters.
- Haben mehrere Mitarbeiter im Plan denselben Nachnamen, wird zur eindeutigen
  Unterscheidung zusätzlich der erste Buchstabe des Vornamens angezeigt,
  beispielsweise `E. Müller`.
- Ist keine Rufbereitschaft eingeteilt, bleibt die Zelle sichtbar leer.

### Bemerkung

- Die Bemerkungsspalte steht ganz rechts hinter der Spalte für die
  Rufbereitschaft.
- Ihre Spaltenüberschrift lautet `Bemerkung`.
- Eine vorhandene Bemerkung wird vollständig angezeigt und weder gekürzt noch
  mit Auslassungspunkten abgeschnitten.
- Der Text bricht innerhalb der festen Spaltenbreite nach unten um. Sehr lange
  Wörter dürfen erforderlichenfalls innerhalb des Wortes umbrechen.
- Ist keine Bemerkung vorhanden, bleibt die Zelle sichtbar leer.
- Die konkrete feste Breite wird erst anhand eines A4-Prototyps mit neun
  Mitarbeiterspalten bestimmt.

### Wochenenden und Feiertage

- Samstage und Sonntage erhalten über die gesamte Tabellenzeile eine dezente
  graue Hintergrundfläche. Der sichtbare Wochentag kennzeichnet sie zusätzlich
  unabhängig von der Farbe.
- Feiertage erhalten über die gesamte Tabellenzeile eine dezente rote
  Hintergrundfläche und werden zusätzlich durch einen sichtbaren Stern am
  Datum gekennzeichnet, beispielsweise `Fr 03.10.*`.
- Feiertage haben bei einer Überschneidung Vorrang vor der
  Wochenendkennzeichnung.
- Die vollständigen Feiertagsnamen stehen platzsparend unterhalb der Tabelle in
  einer Legende, beispielsweise
  `* 03.10. – Tag der Deutschen Einheit`.
- Durch die ausgelagerte Legende verändern längere Feiertagsnamen nicht die
  Höhe der jeweiligen Tageszeile.

### Freigabebereich

- Unterhalb der Tabelle und der Feiertagslegende steht ein kompakter Bereich
  für die spätere Freigabe des Dienstplans.
- Der Bereich enthält nebeneinander die beiden beschrifteten Linien `Datum`
  und `Freigabe / Unterschrift`.
- Der Freigabebereich ist Bestandteil des gemeinsamen Dokumentlayouts und
  erscheint sowohl in der Kompaktansicht als auch in der späteren PDF.

### Kennzahlen am Tabellenende

- Unterhalb der Kalendertage stehen in dieser Reihenfolge die drei
  Abschlusszeilen `Ist`, `Soll` und `h/Woche`.
- Die zugehörigen Zeitwerte stehen jeweils in der Spalte des Mitarbeiters.
- Die Beschriftungen `Ist`, `Soll` und `h/Woche` stehen links in der
  Datumsspalte.
- `h/Woche` zeigt die im gespeicherten Monatsplan eingefrorene regelmäßige
  Wochenarbeitszeit des jeweiligen Mitarbeiters.
- Die Werte aller drei Abschlusszeilen verwenden das einheitliche
  Dauerformat `HH:MM`, beispielsweise `172:30`, `168:00` und `39:00`.
- Anders als bei Beginn- und Enduhrzeiten bleibt bei einer vollen Zeitdauer
  `:00` sichtbar. Ein zusätzliches `h` wird nicht in jede Mitarbeiterzelle
  geschrieben.
- Die Zellen der Rufbereitschafts- und Bemerkungsspalte bleiben in diesen
  Abschlusszeilen leer.
- Eine zusätzliche Differenzzeile sowie weitere Kennzahlen wie SN/F-Dienste
  oder freie Tage werden nicht dargestellt.

### Erwartete Mitarbeiterzahl

- Ein üblicher Monatsplan enthält sechs bis sieben Mitarbeiterspalten:
  - fünf Erzieher,
  - eine Wirtschaftskraft und
  - gegebenenfalls einen Praktikanten.
- Ein Monatsplan enthält im realistisch größten Fall neun
  Mitarbeiterspalten:
  - sechs reguläre Erzieher,
  - eine Wirtschaftskraft,
  - einen Praktikanten und
  - eine zusätzliche Aushilfskraft mit der Rolle `Erzieher`.
- Das A4-Hochformat wird für sechs bis sieben Mitarbeiterspalten als
  Standardfall gestaltet und muss auch mit neun Mitarbeiterspalten vollständig
  und lesbar funktionieren.

### Spätere Erweiterungsmöglichkeit

- Der aktuelle verbindliche Umfang bleibt eine einzelne A4-Seite im
  Hochformat mit bis zu neun Mitarbeiterspalten.
- Eine spätere Erweiterung darf breitere Pläne auf zwei oder mehr A4-Seiten
  verteilen. Diese Mehrseitigkeit gehört nicht zur ersten Umsetzung der
  Kompaktansicht und des einseitigen Dokumentlayouts.
- Die erste Umsetzung soll keine fachliche Begrenzung der Mitarbeiterzahl in
  das Monatsplanmodell einführen und die spätere Seitenteilung nicht durch
  unnötig starre Annahmen verhindern.
- Konkrete Regeln für die spätere Aufteilung, wiederholte Spalten,
  Seitennummerierung und die Zuordnung von Rufbereitschaft und Bemerkung werden
  erst festgelegt, wenn diese Erweiterung tatsächlich umgesetzt wird.

### Grenze der ersten Umsetzung

- Die erste Umsetzung erstellt das vollständige gemeinsame A4-Dokumentlayout
  und zeigt es als Kompaktansicht innerhalb der Planungsseite.
- Sie prüft, ob der gespeicherte Monatsplan vollständig und lesbar auf die eine
  A4-Seite passt, und zeigt gegebenenfalls den festgelegten Überlaufhinweis.
- Die vorhandene Aktion `Export` bleibt in diesem Arbeitspaket deaktiviert.
- Das Erzeugen einer PDF-Datei, ein Dateidialog und alle weiteren
  Exportabläufe bleiben Bestandteil des eigenständigen späteren
  PDF-Export-Arbeitspakets.
- Das Dokumentlayout wird bereits so abgegrenzt, dass der spätere PDF-Export
  dasselbe Layout ohne eine zweite unabhängige Darstellung verwenden kann.

### Technische Aufteilung

- Die Planungsseite verwaltet ausschließlich, ob die Plan- oder Kompaktansicht
  aktiv ist, und setzt den Ansichtsmodus bei Laden, Anlegen oder Rückkehr zur
  Vorschau auf `Plan` zurück.
- Eine neue reine Aufbereitungsfunktion erzeugt aus dem gespeicherten
  Ausgangsstand das Darstellungsmodell der Kompaktansicht. Sie übernimmt unter
  anderem kurze Uhrzeiten, eindeutige Nachnamen, Feiertagslegende sowie Ist-,
  Soll- und Wochenarbeitszeit.
- Vorhandene Kalender-, Zeit- und Berechnungsfunktionen werden wiederverwendet.
- Eine Bildschirmkomponente ist für Arbeitsfläche, Skalierung, Statushinweise
  und Passungsprüfung verantwortlich.
- Eine davon getrennte Dokumentkomponente rendert ausschließlich den Inhalt der
  A4-Seite. Diese Dokumentkomponente soll später unverändert vom PDF-Export
  wiederverwendet werden können.
- Die Dokumentkomponente erhält ausschließlich den gespeicherten Ausgangsstand
  des geöffneten Plans und niemals den aktuellen Entwurf.
- Für die erste Kompaktansicht sind voraussichtlich keine Änderungen an
  Datenmodell, Schemas, Repository, IPC oder Preload erforderlich.
- Zuerst wird ein sichtbarer A4-Prototyp mit realistischen Daten für sechs bis
  sieben Mitarbeiter erstellt und anschließend mit neun Mitarbeitern und 31
  Tagen geprüft. Passungsprüfung und vollständige Einbindung folgen erst nach
  der gemeinsamen Sichtfreigabe dieses Prototyps.

### Verifikation

Automatisiert werden mindestens geprüft:

- ausschließliche Verwendung des gespeicherten Ausgangsstands statt des
  aktuellen Entwurfs,
- kurze Uhrzeitformatierung einschließlich voller Stunden,
- eindeutige Namen bei identischen Nachnamen,
- Feiertagsmarkierungen und Feiertagslegende,
- Ist-, Soll- und Wochenarbeitszeit sowie
- Zurücksetzen des Ansichtsmodus bei Anlegen, Laden und Monatsvorschau.

Für diese reine Aufbereitungslogik werden die vorhandenen Vitest-Möglichkeiten
genutzt und keine neue Testabhängigkeit eingeführt. Nach der Umsetzung werden
die projektweiten Prüfungen `npm test`, `npm run typecheck`, `npm run lint` und
`npm run format:check` ausgeführt.

Die manuelle Sicht- und Bedienprüfung umfasst mindestens:

- einen normalen Plan mit sechs bis sieben Mitarbeitern,
- den Grenzfall mit neun Mitarbeitern und 31 Tagen,
- längere Bemerkungen und lange Nachnamen,
- identische Nachnamen,
- Planungseinträge mit und ohne Zeitspanne,
- Wochenenden und Feiertage,
- einen ungespeicherten Entwurf gegenüber dem gespeicherten Stand,
- die deaktivierte Kompaktansicht bei Monatsvorschau, laufendem Speichern und
  Sicherungswiederherstellung,
- das kleinste unterstützte Fenster mit `1024 × 700` Pixeln und ein maximiertes
  Fenster sowie
- die Tastaturbedienung des Ansichtsumschalters.

Der sichtbare A4-Prototyp wird vor Passungsprüfung und weiterer Einbindung
gesondert durch den Benutzer abgenommen. Eine tatsächlich erzeugte PDF-Datei
wird in diesem Arbeitspaket noch nicht geprüft, weil der PDF-Export erst später
umgesetzt wird.

## Offene Entscheidungen

### Einseitiges A4-Layout

- Die konkrete Mindestschriftgröße, Mindestskalierung und zulässige
  Zeilenhöhe werden beim visuellen A4-Prototyp bestimmt.

### Weitere Abstimmungsblöcke

- [x] Datengrundlage und Verfügbarkeit im Detail
- [x] Ansichtswechsel
- [x] Grundaufbau der Tabelle
- [x] Darstellung eines Planungseintrags
- [x] Kennzahlen
- [x] Gestaltung und Orientierung
- [x] Sonder- und Leerzustände
- [x] Technische Umsetzung und Prüfung

## Aufgelöster Dokumentationskonflikt

Das frühere Feature-Dokument grenzte die Kompaktansicht ausdrücklich von einer
Druckvorschau ab und beschrieb sie als vom PDF-Export unabhängige Ansicht. Diese
Festlegung wurde durch die bestätigte layoutgetreue A4-Dokumentvorschau ersetzt
und in den zuständigen Dokumenten bereinigt.
