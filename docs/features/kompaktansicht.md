# Kompaktansicht

Die Kompaktansicht zeigt den gespeicherten Stand eines geöffneten Monatsplans
als ruhige, schreibgeschützte A4-Dokumentvorschau. Sie macht die tägliche
Besetzung über den gesamten Monat schneller erfassbar als die bearbeitbare
Planungstabelle und bildet zugleich das verbindliche Dokumentlayout für den
PDF-Export.

## Zweck und Umfang

Die Kompaktansicht:

- zeigt den auf der Planungsseite geöffneten Monatsplan,
- verwendet ausschließlich seinen zuletzt regulär gespeicherten Stand,
- bietet keine Bearbeitungsfunktionen und keine Auswertung,
- erzeugt weder eine zweite Planversion noch eigene Ergebnisdaten,
- verwendet die gemeinsamen Kalender-, Zeit- und Berechnungsregeln und
- stellt exakt das A4-Dokumentlayout dar, das auch der PDF-Export nutzt.

Die reine Dokumentvorschau erzeugt selbst keine Datei. Die in der
Kompaktansicht verfügbare Exportaktion übergibt Dateierzeugung, Speicherdialog
und Rückmeldungen an den eigenständigen [PDF-Export](./pdf-export.md).

## Datengrundlage

Maßgeblich ist der gespeicherte Ausgangsstand des auf der
[Planungsseite](./planungsseite.md) geöffneten Monatsplans. Namen, Reihenfolge,
Farben, Wochenarbeitszeiten, Planungseinträge, Uhrzeiten, Rufbereitschaften und
Bemerkungen stammen ausschließlich aus dessen Snapshots.

Aktuelle Stammdaten werden nicht nachgeladen. Ungespeicherte Änderungen des
Planentwurfs erscheinen nicht in der Kompaktansicht.

Enthält der geöffnete Plan ungespeicherte Änderungen, bleibt der Wechsel zur
Kompaktansicht möglich. Oberhalb des Dokuments steht dann dauerhaft:

> Diese Ansicht zeigt den zuletzt gespeicherten Stand. Ungespeicherte
> Änderungen sind nicht enthalten.

Der Ansichtswechsel speichert oder verwirft nichts und löst deshalb keinen
Verlustschutzdialog aus. `Speichern` und `Auswertung` sind in der
Kompaktansicht deaktiviert, weil beide den momentan nicht sichtbaren Entwurf
betreffen. Zum Prüfen, Auswerten und Speichern muss zur Planansicht
zurückgewechselt werden.

## Verfügbarkeit und Ansichtswechsel

Der Umschalter `Plan | Kompakt` steht im ausklappbaren Bereich der
Planungswerkzeugleiste. Das aktive Segment ist sichtbar ausgewählt und der
Umschalter ist mit der Tastatur bedienbar. Der Wechsel erfolgt innerhalb der
Planungsseite und öffnet weder einen Dialog noch einen eigenen
Navigationsbereich.

`Kompakt` ist nur für einen regulär gespeicherten, geöffneten Monatsplan
verfügbar. Die Aktion bleibt deaktiviert:

- in der unverbindlichen Monatsvorschau,
- während eines laufenden Speichervorgangs und
- nach einer Sicherungswiederherstellung, bis der wiederhergestellte Stand
  ausdrücklich gespeichert wurde.

Ein neu angelegter Plan kann kompakt angezeigt werden, weil er bei der Anlage
bereits gespeichert wird. Jeder neu angelegte oder neu geladene Plan sowie die
Rückkehr zur Monatsvorschau starten in der Planansicht.

Monatsauswahl und `Laden` bleiben in der Kompaktansicht erreichbar. Beim
Verlassen des geöffneten Plans schützt der vorhandene Verlustschutz weiterhin
eventuell vorhandene, in der Kompaktansicht nicht sichtbare
Entwurfsänderungen.

## Gemeinsames A4-Dokumentlayout

Das Dokument verwendet genau eine A4-Seite im Hochformat. Es wird für sechs bis
sieben Mitarbeiterspalten als Normalfall gestaltet und muss mit 31
Kalendertagen und bis zu neun Mitarbeiterspalten vollständig und lesbar
funktionieren.

Die Bildschirmansicht zeigt eine weiße A4-Seite zentriert auf einer neutralen
grauen Arbeitsfläche. Ein dünner Rand und ein dezenter Schatten grenzen das
Dokument auf dem Bildschirm ab. Diese Orientierungselemente erscheinen nicht
in der exportierten PDF.

Die Seite:

- behält beim Skalieren ihr A4-Seitenverhältnis und ihre Umbrüche,
- passt sich an die verfügbare Inhaltsbreite an,
- bleibt bei `1024 × 700` Pixeln vollständig in der Breite sichtbar,
- darf für ihre Höhe vertikal gescrollt werden und
- wird auf großen Fenstern nicht unnötig vergrößert.

Für die Bildschirmdarstellung wird die Seite höchstens in ihrer festgelegten
Grundgröße und bei unterstützter Fensterbreite mindestens mit `84 %`
dargestellt. Die Skalierung verändert keine Spaltenbreiten oder Umbrüche des
Dokuments.

Eigene Zoom-Schaltflächen gehören zunächst nicht zum Umfang.

## Dokumentkopf

Über der Tabelle stehen der Plantitel als größte Überschrift und darunter eine
gemeinsame kompakte Zeile aus ausgeschriebenem Monat mit Jahr sowie dem
Speicherdatum, beispielsweise
`September 2026 · Stand: 16.09.2026`. Eine Uhrzeit wird nicht angezeigt.

Die technische Plan-ID sowie Bezeichnungen wie `Kompaktansicht` oder
`Druckvorschau` erscheinen nicht im Dokument.

## Tabellenaufbau

Die Tabelle führt die Kalendertage zeilenweise. Ihre Spalten stehen in dieser
Reihenfolge:

1. Datum,
2. eine Spalte je Planmitarbeiter in gespeicherter Reihenfolge,
3. Rufbereitschaft und
4. Bemerkung.

### Datum

Die Datumsspalte zeigt Wochentag und Datum einzeilig im Format `Mo 01.09.`.

Samstage und Sonntage erhalten über die gesamte Zeile eine klar erkennbare
hellgraue
Hintergrundfläche. Der sichtbare Wochentag macht die Bedeutung unabhängig von
der Farbe erkennbar.

Feiertage haben Vorrang vor Wochenenden. Ihre Zeile erhält eine klar erkennbare
hellrote
Hintergrundfläche und das Datum zusätzlich einen Stern, beispielsweise
`Fr 03.10.*`. Die vollständigen Feiertagsnamen stehen unterhalb der Tabelle in
einer kompakten Legende, beispielsweise
`* 03.10. – Tag der Deutschen Einheit`. Dadurch verändern längere
Feiertagsnamen nicht die Höhe einzelner Tageszeilen.

### Mitarbeiterköpfe

Jeder Mitarbeiter besitzt genau eine Spalte. Der Kopf zeigt ausschließlich den
Nachnamen horizontal, zentriert und halbfett. Haben mehrere Planmitarbeiter
denselben Nachnamen, ergänzt die Ansicht zur Unterscheidung den ersten
Buchstaben des Vornamens, beispielsweise `E. Müller` und `M. Müller`.

Lange Nachnamen dürfen auf höchstens zwei Zeilen umbrechen. Der Kopf trägt eine
kräftige helle Fläche in der gespeicherten Mitarbeiterfarbe und schwarze
Schrift. Die angrenzenden Tabellenlinien bleiben unabhängig von der
Mitarbeiterfarbe einheitlich schwarz. Rolle und weitere Mitarbeiterangaben
erscheinen dort nicht.

Eine einzelne schwarze Linie trennt die Mitarbeiterköpfe von den
Kalendertagen. An den Übergängen zwischen Tabellenkopf, Tagesbereich und
Abschlussblock werden keine verschiedenfarbigen Linien übereinandergelegt.
Der äußere Tabellenrahmen und alle vertikalen Spaltentrenner sind zwei Pixel
stark. Das horizontale Raster der Kalendertage bleibt mit einem Pixel ruhiger.
Dadurch sind insbesondere die Mitarbeiterspalten über die gesamte Tabelle
eindeutig abzugrenzen.

### Planungseintrag

Eine belegte Mitarbeiterzelle zeigt:

1. oben das Kürzel des Planungseintrags und
2. darunter seine gespeicherte Zeitspanne, sofern eine vorhanden ist.

Die Zeitspanne ist eine wesentliche Planinformation und darf nicht aus
Platzgründen entfallen. Für die kompakte Uhrzeitdarstellung gelten:

- keine führende Null bei Stunden,
- kein `:00` bei vollen Stunden,
- zweistellige Minuten ungleich `00` und
- ein Gedankenstrich ohne Leerzeichen zwischen Beginn und Ende.

Beispiele sind `5:30–9`, `12–22:30` und `6–14`. Besitzt ein Eintrag keine
Zeitspanne, zeigt die Zelle ausschließlich sein Kürzel. Kürzel und Zeitspanne
werden für einen eindeutigen Bildschirm- und Druckkontrast schwarz dargestellt.

Eine vollständig unbelegte Mitarbeiterzelle bleibt sichtbar leer. Sie enthält
weder Gedankenstrich noch Schraffur oder einen anderen sichtbaren Platzhalter.
Die Tabellenlinien und die Tageskennzeichnung bleiben erhalten. In der
Bildschirmansicht bezeichnet ein zugänglicher Name den Zustand als
`Kein Eintrag`.

### Rufbereitschaft

Die schmale Spalte trägt die Überschrift `RB`. Ist eine Rufbereitschaft
eingeteilt, zeigt sie den Nachnamen der zugeordneten Person. Bei identischen
Nachnamen wird ebenfalls der erste Buchstabe des Vornamens ergänzt. Ohne
Rufbereitschaft bleibt die Zelle leer.

### Bemerkung

Die rechte Spalte trägt die Überschrift `Bemerkung` und besitzt eine feste
Breite. Vorhandene Bemerkungen werden vollständig dargestellt und weder
gekürzt noch mit Auslassungspunkten abgeschnitten. Text bricht nach unten um;
sehr lange Wörter dürfen erforderlichenfalls innerhalb des Wortes umbrechen.
Ohne Bemerkung bleibt die Zelle leer.

Die Bemerkungsspalte verwendet `18 %` der Tabellenbreite. Datum und
Rufbereitschaft verwenden jeweils `8 %`; die verbleibende Breite wird
gleichmäßig auf die Mitarbeiterspalten verteilt. Tageszeilen bleiben durch
kleine Innenabstände kompakt und wachsen nur, wenn vollständig darzustellender
Inhalt dies erfordert.

## Abschlusszeilen

Unter den Kalendertagen stehen in dieser Reihenfolge:

1. `Ist`,
2. `Soll` und
3. `h/Woche`.

Die Beschriftungen stehen in der Datumsspalte, die Werte jeweils unter dem
zugehörigen Mitarbeiter. `h/Woche` verwendet die im Plan gespeicherte
Wochenarbeitszeit. Alle drei Zeilen zeigen Dauern als `HH:MM`, beispielsweise
`172:30`, `168:00` und `39:00`; volle Stunden behalten hier ihr `:00`.

Die Zellen unter `RB` und `Bemerkung` bleiben leer. Eine Differenzzeile sowie
weitere Kennzahlen wie SN/F-Dienste oder freie Tage erscheinen nicht.
Eine stärkere obere Trennlinie setzt den gesamten Abschlussblock sichtbar von
den Kalendertagen ab.

## Freigabebereich

Unter Tabelle und Feiertagslegende stehen zwei kompakte Formularzeilen
nebeneinander. Die jeweilige Beschriftung steht links direkt in derselben Zeile
wie die anschließende Linie:

- `Datum` und
- `Freigabe / Unterschrift`.

Der Bereich ist Bestandteil des gemeinsamen Dokumentlayouts und erscheint
unverändert in der PDF.

## Interaktion und Barrierearmut

Die A4-Vorschau ist ein schreibgeschütztes Dokument. Ihre Tabelle besitzt:

- keine auswählbaren oder anklickbaren Zeilen und Zellen,
- keine orange Zeilenhervorhebung,
- keine Hovereffekte,
- keine fixierten Tabellenköpfe oder Spalten und
- keine Popover oder Bearbeitungsaktionen.

Mitarbeiter und Kalendertage bleiben durch sichtbare Beschriftungen und die
semantische Tabellenstruktur eindeutig zugeordnet. Farben ergänzen nur die
sichtbare Information. Der Ansichtsumschalter besitzt einen zugänglichen Namen,
einen sichtbaren Fokus und einen eindeutig erkennbaren Auswahlzustand.

## Passung und Überlauf

Das Dokument darf gleichmäßig bis auf den bestätigten Bildschirmmaßstab von
`84 %` verkleinert werden. Die Tabellenhauptschrift verwendet in der
Dokumentgrundgröße `9 px`, die untergeordnete Zeitspanne `8 px`. Ein Inhalt,
der einen Namen über mehr als zwei Kopfzeilen oder das Dokument horizontal
beziehungsweise vertikal über die A4-Fläche hinaus wachsen lässt, gilt als
nicht passend.

Passt der vollständige Inhalt selbst an dieser Lesbarkeitsgrenze nicht auf eine
Seite, erscheint dauerhaft:

> Der Dienstplan passt mit den aktuellen Inhalten nicht lesbar auf eine
> A4-Seite.

In diesem Zustand wird die PDF-Ausgabe verhindert. Inhalte werden
weder verborgen noch abgeschnitten, und die erste Umsetzung erzeugt nicht
unbemerkt eine weitere Seite.

Eine spätere Erweiterung darf breitere Pläne auf mehrere A4-Seiten verteilen.
Sie führt keine fachliche Obergrenze für die Mitarbeiterzahl in das
Monatsplanmodell ein. Regeln für Seitenteilung, wiederholte Spalten und
Seitennummerierung werden erst für dieses spätere Arbeitspaket festgelegt.

## Abgrenzung

Nicht zur ersten Umsetzung der Kompaktansicht gehören:

- das Bearbeiten oder Speichern des Planentwurfs,
- die ausführliche Auswertung,
- die technische PDF-Dateierzeugung innerhalb der Dokumentdarstellung,
- ein nativer Druckvorgang,
- eigene Zoomfunktionen und
- eine mehrseitige Dokumentaufteilung.
