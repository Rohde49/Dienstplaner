# Planungsseite

Die Planungsseite ist die Startansicht des Dienstplaners. Sie soll die
Teamleitung dabei unterstützen, Monatspläne bewusst anzulegen oder zu laden,
Einträge für Mitarbeiter und Kalendertage zu planen, wichtige Kennzahlen direkt
zu beobachten und Änderungen ausdrücklich zu speichern.

## Zweck und Umfang

Zur Planungsseite gehören:

- eine Monats- und Jahresauswahl mit vorherigem und nächstem Monat,
- ein nicht gespeicherter Vorschauplan,
- das bewusste Anlegen neuer Monatspläne,
- ein globaler Ladedialog für alle gespeicherten Monatspläne,
- das bestätigte Löschen gespeicherter Monatspläne,
- eine bearbeitbare Planungstabelle,
- Planungseinträge, Rufbereitschaften und Tagesbemerkungen,
- unmittelbar aktualisierte Planungskennzahlen,
- ein erkennbarer ungespeicherter Entwurf,
- ausdrückliches Speichern und
- Schutz vor dem Verlust ungespeicherter Änderungen.

## Seitenaufbau

Die Anwendung startet maximiert, aber nicht im Vollbildmodus. Die normale
Windows-Titelleiste und die Möglichkeit zum Wiederherstellen des Fensters
bleiben erhalten. Die kleinste unterstützte Fenstergröße beträgt `1024 × 700`
Pixel.

Die Planungsseite nutzt die verbleibende Inhaltsbreite und gliedert sich in:

1. Seitenkopf mit Seitenüberschrift, Zeitraumsauswahl sowie den Aktionen
   „Laden“ und „Dienstplan erstellen“,
2. eine ein- und ausklappbare Planungswerkzeugleiste direkt oberhalb der
   Tabelle,
3. dauerhafte Lade-, Fehler- oder Sicherungshinweise und
4. die gewählte Plan- oder Kompaktansicht.

Eingeklappt zeigt die Werkzeugleiste links das zurückhaltende Plansymbol und
mit angemessenem Abstand daneben den Speicher- beziehungsweise Vorschaustatus.
Plantitel oder Vorschauzeitraum stehen mittig; beim geöffneten Plan sitzt die
Stiftaktion unmittelbar neben dem Titel. Bei schmaleren Fenstern darf diese
Titelgruppe in eine eigene zentrierte Zeile wechseln. Ein zusätzlicher Text wie
„Aktueller Plan“ ist nicht erforderlich. Bei geöffneten Plänen steht
„Speichern“ und „Auswertung“ rechts bereit. Ohne geöffneten Plan bleiben diese
Aktionen deaktiviert. In der Kompaktansicht sind beide Aktionen ebenfalls
deaktiviert, weil dort ausschließlich der gespeicherte Ausgangsstand sichtbar
ist. Ausgeklappt ergänzt eine flache, durch Linien getrennte Kennzahlenzeile die
zusammengefasste Anzahl SN/F der Erzieher sowie die Kalender-, Arbeits- und
freien Tage. „Freie Tage“ bezeichnet dabei den monatsweiten Zielwert aus
Kalendertagen abzüglich Arbeitstagen. „Anzahl SN/F“ wird mit den Kalendertagen
als Zielwert verglichen. Der Zahlenwert liegt auf einer kompakten Statusfläche
mit abgestimmter gelber, grüner oder roter Schrift-, Hintergrund- und
Konturfarbe. Überschreitet die Summe den Zielwert, erscheint zusätzlich neben
dem Speicherstatus der dauerhafte rote Hinweis „SN/F-Ziel überschritten“ mit
Ist- und Zielwert. Er ist nicht schließbar und verschwindet automatisch, sobald
die Summe den Zielwert nicht mehr überschreitet. Der Ansichtsumschalter „Plan / Kompakt“
steht daneben und hebt die aktive Ansicht mit der zurückhaltenden Primärfläche
hervor. Nur in der aktiven Kompaktansicht erscheint rechts davon die
Exportaktion. Die
Werkzeugleiste startet eingeklappt und besitzt mittig am unteren
Rand eine schmale, ohne Schatten direkt an die Kartenkante angeschlossene
Pfeil-Lasche zum Ein- und Ausklappen. Sie erhält einen
zugänglichen Namen und einen sichtbaren Tastaturfokus, benötigt aber keine
sichtbare Textbeschriftung. Dauerhafte Fehler- und Sicherungshinweise bleiben
unabhängig vom Leistenstatus sichtbar.

„Auswertung“ öffnet den Dialog des eigenständigen
[Auswertungsfeatures](./auswertung.md). „Plan / Kompakt“ wechselt bei einem
regulär gespeicherten, geöffneten Monatsplan zwischen der bearbeitbaren
Planungstabelle und der schreibgeschützten
[Kompaktansicht](./kompaktansicht.md). Der Wechsel verändert oder verwirft den
Entwurf nicht. „Export“ speichert über das eigenständige
[PDF-Export-Feature](./pdf-export.md) ausschließlich den gespeicherten
Ausgangsstand als lokale Datei.

Zwischen `1024` und `1279` Pixel Fensterbreite soll die Hauptnavigation als
schmale Symbolleiste erscheinen. Die Bezeichnungen bleiben über zugängliche
Beschriftungen oder Tooltips verfügbar. Ab `1280` Pixeln werden Symbol und
Beschriftung gemeinsam angezeigt. Über eine Schaltfläche am unteren Ende der
Hauptnavigation kann die Teamleitung diese unabhängig von der Fensterbreite
ein- oder ausklappen. Diese
manuelle Auswahl bleibt während der laufenden App-Sitzung erhalten; beim
nächsten Start gilt wieder die zur Fensterbreite passende Ausgangsdarstellung.
Die Navigation einschließlich Schaltfläche und Fußbereich bleibt beim Scrollen
der Planungsseite sichtbar.

## Anfangszustand und Vorschau

Beim ersten Öffnen zeigt die Zeitraumsauswahl den aktuellen Monat und das
aktuelle Jahr. Die Jahresauswahl bietet standardmäßig das aktuelle Jahr sowie
jeweils zwei vorherige und zwei folgende Jahre an, soweit diese innerhalb des
technisch unterstützten Bereichs liegen.

Beim Öffnen der Planungsseite wird kein gespeicherter Plan automatisch geladen.
Das gilt auch dann, wenn für den gewählten Zeitraum genau ein Plan vorhanden
ist.

Stattdessen zeigt die Seite einen nicht bearbeitbaren Vorschauplan für den
gewählten Monat mit:

- allen Kalendertagen des Monats,
- den aktuell aktiven Mitarbeitern in ihrer aktuellen Reihenfolge und
- den Kennzahlen des leeren Planungsstands.

Die Vorschau trägt den sichtbaren Status „Vorschau · nicht angelegt“. Sie ist
kein gespeicherter Monatsplan und besitzt noch keine verbindlichen Snapshots.
Planungseinträge, Rufbereitschaften und Bemerkungen können erst nach der
Plananlage bearbeitet werden.

Bei aktiven Mitarbeitern erscheinen Status und Zeitraum in der eingeklappten
Werkzeugleiste. Die Anzahl der Kalender-, Arbeits- und freien Tage sowie die
zusammengefasste Anzahl SN/F der Erzieher stehen in ihrem ausklappbaren
Detailbereich. Die Mitarbeiternamen stehen in den Tabellenköpfen; eine
zusätzliche Namensliste und ein allgemeiner Informationskasten zur Vorschau
sind nicht erforderlich.

Sind keine aktiven Mitarbeiter vorhanden, bleibt die Zeitraumsauswahl
verfügbar. Anstelle der Monatstabelle erscheint ein verständlicher Leerzustand
mit der Aktion „Zur Teamverwaltung“. „Dienstplan erstellen“ ist in diesem
Zustand deaktiviert.

Ein Wechsel des Monats oder Jahres lädt niemals automatisch einen passenden
Plan. Er führt zurück zur Vorschau des gewählten Zeitraums. Vorhandene
ungespeicherte Änderungen werden zuvor geschützt.

## Monatsplan anlegen

„Dienstplan erstellen“ öffnet einen Dialog für den verpflichtenden Plantitel.
Äußere Leerzeichen werden entfernt; der Titel darf höchstens 200 Zeichen
enthalten.

Ein Plan darf nur mit mindestens einem aktiven Mitarbeiter angelegt werden.
Beim Anlegen werden:

1. Jahr, Monat und Titel geprüft,
2. die aktuell aktiven Mitarbeiter in ihrer Reihenfolge als Snapshots
   übernommen,
3. sämtliche Kalendertage des Monats erzeugt,
4. der neue Plan unmittelbar gespeichert und
5. der gespeicherte Rückgabestand als Ausgangsstand der Oberfläche übernommen.

Mehrere Pläne dürfen denselben Monat und dasselbe Jahr besitzen. Jeder Plan wird
durch seine eigene UUID unterschieden. Jahr und Monat bleiben nach der Anlage
unveränderlich.

Der Plantitel steht oberhalb der Planungstabelle und kann über eine Stift-Aktion
bearbeitet werden. Eine Titeländerung gehört zunächst zum Entwurf und wird erst
mit dem gesamten Plan gespeichert. In der Vorschau steht diese Bearbeitung
nicht zur Verfügung.

Bei einem geöffneten Plan stehen Titel und Speicherstatus in der eingeklappten
Werkzeugleiste. Die Titelbearbeitung steht als zugänglich beschriftete
Stiftaktion direkt beim Titel; „Speichern“ steht im selben Bereich und ist nur
bei Änderungen beziehungsweise einem Sicherungsstand verfügbar. Zeitraum und
weitere Kennzahlen sind über die Seitenkopfzeile beziehungsweise den
ausklappbaren Detailbereich erkennbar. Fehler- und Sicherungswarnungen bleiben
deutlich sichtbar.

## Monatsplan laden

Ein gespeicherter Plan wird ausschließlich über „Laden“ geöffnet. Die Aktion
öffnet immer einen Auswahldialog, auch wenn kein oder nur ein Plan vorhanden
ist.

Der Dialog zeigt alle gespeicherten Pläne unabhängig vom aktuell gewählten
Zeitraum. Jeder Eintrag enthält:

- Titel,
- Monat und Jahr,
- Erstellungszeitpunkt und
- letzten Änderungszeitpunkt.

Die Liste wird nach dem letzten Änderungszeitpunkt absteigend sortiert. Die
technische Plan-ID bleibt in der normalen Oberfläche verborgen und dient nur
der eindeutigen Verarbeitung. Gibt es noch keinen Plan, bleibt der Dialog
geöffnet und zeigt einen verständlichen Leerzustand.

Nach der Auswahl werden Monat und Jahr auf den Zeitraum des Plans gesetzt. Die
Planungsseite verwendet ausschließlich die gespeicherten Mitarbeiter-,
Kalender- und Eintragssnapshots dieses Plans. Aktuelle Stammdaten ersetzen diese
nicht.

## Monatsplan löschen

Jeder Plan im Ladedialog besitzt eine zugänglich beschriftete Löschaktion. Vor
dem Löschen bestätigt der Benutzer einen Dialog, der Titel und Zeitraum des
betroffenen Plans nennt.

Dabei gilt:

- Ein nicht geöffneter Plan darf auch gelöscht werden, wenn der aktuell
  bearbeitete Plan ungespeicherte Änderungen besitzt.
- Der aktuell geöffnete Plan darf nur ohne ungespeicherte Änderungen gelöscht
  werden.
- Nach dem Löschen des geöffneten Plans erscheint die Vorschau desselben
  Zeitraums.
- Während eines Löschvorgangs sind weitere Lade- und Löschaktionen gesperrt.
- Nach erfolgreichem Löschen wird die Liste aktualisiert; der Ladedialog bleibt
  geöffnet.

Das bestätigte Löschen eines vollständigen Plans ist vom bestätigungsfreien
Entfernen eines einzelnen Planungseintrags zu unterscheiden.

## Planungstabelle

Die Planungstabelle führt die Kalendertage zeilenweise und die im Plan
gespeicherten Mitarbeiter spaltenweise. Rechts hinter den Mitarbeiterspalten
stehen „Rufbereitschaft“ und „Bemerkung“.

Die kompakte Datumsspalte zeigt Wochentag und vollständiges Datum in dieser
Reihenfolge, etwa `Di · 01.09.2026`. Datum und Spaltenüberschrift sind zentriert.
Längere Feiertagsnamen dürfen innerhalb der Datumsspalte umbrechen. Die
Rufbereitschafts- und Bemerkungsspalte halten Überschrift und Zellinhalt mittig.
Ein gesetzter Rufbereitschaftsname erscheint mit dem ersten Buchstaben des
Vornamens und dem vollständigen Nachnamen, beispielsweise `E. Rohde`.

Jeder Mitarbeiter besitzt zwei Teilspalten:

1. **Eintrag:** bearbeitbare Zelle zum Setzen eines Planungseintrags und zur
   Anzeige seines Kürzels,
2. **Zeit:** nicht bearbeitbare Anzeige von Beginn und Ende, beispielsweise
   `06:00–14:00`.

Noch unbelegte Zellen für Planungseinträge und Rufbereitschaften zeigen eine
helle graue Schraffur statt eines Strichs. Das gilt auch in der nicht
bearbeitbaren Vorschau. Ein gesetzter Wert ersetzt die Schraffur. Die Zeitspalte
und leere Bemerkungen erhalten keine Schraffur. Zugängliche Beschriftungen
bezeichnen unbelegte Zellen unabhängig von dieser sichtbaren Markierung.

Ohne Planungseintrag bleibt die zugehörige Zeitspalte leer. Ein gesetzter
Planungseintrag ohne Start- und Endzeit zeigt dort einen Strich; vorhandene
Uhrzeiten werden als Zeitspanne angezeigt.

Uhrzeiten stammen aus dem gespeicherten Eintragssnapshot und werden nicht in der
Planungszelle bearbeitet. Ein über Mitternacht reichender Eintrag bleibt dem Tag
seiner Planungszelle zugeordnet.

Der vollständige Tabellenkopf bleibt beim vertikalen Scrollen sichtbar. Die
Datumsspalte bleibt beim horizontalen Scrollen links stehen; die
Bemerkungsspalte bleibt rechts stehen. Abschlusszeilen für Ist- und
Soll-Arbeitszeit verbleiben am normalen Tabellenende und werden nicht vertikal
fixiert.

Ein etwas dunklerer Bereich für die Teilspalten und eine deutliche untere Linie
heben den Tabellenkopf von den Kalendertagszeilen ab. Kräftigere senkrechte
Trennlinien kennzeichnen das Ende der Datumsspalte, jeder Mitarbeitergruppe und
der Rufbereitschaftsspalte. Die beiden Teilspalten eines Mitarbeiters bleiben
durch eine zurückhaltendere Linie voneinander getrennt. Diese Gruppierung setzt
sich bis in die Abschlusszeilen fort.

Kennzahlen sowie die Teilspalten „Eintrag“ und „Zeit“ stehen auf einem neutralen
Hintergrund. Name und Rolle tragen die jeweilige Mitarbeiterfarbe. Die
Trennlinien zwischen Mitarbeitergruppen und unter den Kennzahlen bleiben auch
im farbigen Kopfbereich einheitlich grau.

### Farben und Kalendertage

- Wochenendzeilen erhalten eine graue beziehungsweise dunklere Kennzeichnung.
- Feiertagszeilen werden rot gekennzeichnet und nennen den Feiertag auch
  textlich.
- Treffen mehrere Feiertagsbezeichnungen auf ein Datum zu, bleiben alle
  sichtbar.
- Ein Feiertag hat bei einer Überschneidung Vorrang vor der
  Wochenendkennzeichnung.
- Gewöhnliche Planungszellen bleiben neutral.
- Die Mitarbeiterfarbe wird im jeweiligen Mitarbeiterkopf eingesetzt, trägt
  die Zuordnung aber nicht allein.

Eine angeklickte oder per Tastatur gewählte Tabellenzelle hebt ihre gesamte
Kalendertagszeile orange hervor. Die Hervorhebung bleibt nach einer Änderung
des Planentwurfs bestehen. Die Auswahl einer Zelle in einer anderen Zeile
verschiebt sie dorthin; ein Klick auf das Datum der hervorgehobenen Zeile hebt
sie auf. Während der Auswahl hat die Hervorhebung Vorrang vor dem normalen
Wochenend- oder Feiertagshintergrund. Wochentag und Feiertagsname bleiben
weiterhin textlich erkennbar.

Nur bedienbare Zellen erhalten beim Darüberfahren mit der Maus einen blauen
Hintergrund. Dadurch bleibt der Hoverzustand auch auf Wochenendzeilen sichtbar.

Die fachlichen Kalender- und Feiertagsregeln stehen unter
[Kalender und Arbeitstage](../fachlichkeit/berechnungen/kalender-und-arbeitstage.md).

## Planungseintrag setzen, ersetzen und entfernen

Ein Klick auf die Teilspalte „Eintrag“ öffnet ein kompaktes Popover. Es bietet
ausschließlich aktuell aktive Eintragsarten an. Jede Auswahl zeigt gleichwertig:

- Kürzel und
- Zeitspanne.

Der Kopf des Popovers nennt Mitarbeiter und formatiertes Datum. Ein kleiner
Pfeil verbindet das Popover sichtbar mit der auslösenden Tabellenzelle. Die
Eintragsarten erscheinen als vollständig bedienbare Auswahlzeilen mit einem
Kürzel-Badge und einem Uhrsymbol an der Zeitspanne. Ein Eintrag ohne Uhrzeit
bleibt mit Symbol und dem Text „Keine Uhrzeit“ eindeutig erkennbar. Hover- und
Fokuszustände heben die gesamte Auswahlzeile hervor.

Die ausführliche Bezeichnung wird in dieser kompakten Auswahl nicht angezeigt.
Der aktuell gesetzte Eintrag ist durch Hintergrund, Häkchen und die sichtbare
Beschriftung „Aktuell“ markiert. Bei vielen Eintragsarten scrollt ausschließlich
die Auswahlliste. Bei einer belegten Zelle wird „Eintrag entfernen“ als eigener
roter Aktionsbereich unterhalb der Liste angeboten. Das Entfernen benötigt keine
Bestätigung, weil es zunächst nur den Entwurf verändert.

Steht keine aktive Eintragsart zur Verfügung, erscheint der Hinweis nur im
geöffneten Popover. Bei einer bereits belegten Zelle bleibt das Entfernen
weiterhin möglich.

Setzen oder Ersetzen erzeugt einen vollständigen Snapshot über die gemeinsame
Fachlogik. Beim Ersetzen bleibt die UUID des vorhandenen Planungseintrags
erhalten. Die Speichergrenze prüft neue oder ersetzte Einträge nochmals gegen
die aktuell aktive Eintragsart und akzeptiert keine frei veränderten
Snapshotwerte.

Die konkreten Snapshot- und Zeitwertregeln stehen unter
[Berechnungen von Planungseinträgen](../fachlichkeit/berechnungen/planungseintraege.md).

## Rufbereitschaft

Pro Kalendertag kann höchstens eine Rufbereitschaft gesetzt werden. Die Auswahl
enthält ausschließlich Mitarbeiter mit der im Plan gespeicherten Rolle
`Erzieher`. Eine spätere Rollenänderung im Mitarbeiterstamm verändert die
Auswahl eines bestehenden Plans nicht.

„Keine Rufbereitschaft“ entfernt eine bestehende Zuordnung ohne Bestätigung.
Eine Rufbereitschaft und ein normaler Planungseintrag derselben Person dürfen am
selben Tag nebeneinander bestehen.

Enthält der Plan keinen Erzieher, bleibt die Zelle bedienbar und erklärt den
leeren Zustand ausschließlich im geöffneten Popover.

## Tagesbemerkung

Eine Bemerkung gehört zu genau einem Kalendertag, ist optional und auf 60
Zeichen begrenzt. Äußere Leerzeichen werden entfernt; ein anschließend leerer
Wert wird als nicht vorhandene Bemerkung gespeichert.

Eine leere Zelle zeigt keinen Platzhalter. Die kompakte Bemerkungsspalte zeigt
vorhandenen Inhalt vollständig an. Passt er nicht in die Spaltenbreite, bricht
der Text um und die Tabellenzeile wird entsprechend höher. Die Bearbeitung
erfolgt in einem Popover mit:

- einem beschrifteten mehrzeiligen Eingabefeld,
- einer Anzeige der verwendeten Zeichen und
- den Aktionen „Übernehmen“ und „Abbrechen“.

Erst „Übernehmen“ überträgt die Eingabe in den Planentwurf. „Abbrechen“, Escape
oder ein Klick außerhalb verwerfen die noch nicht übernommene Eingabe.

## Sichtbare Kennzahlen

Alle Kennzahlen werden nach jeder Entwurfsänderung aus dem aktuellen
Monatsplanstand neu berechnet. Die Planungsseite ordnet die gemeinsamen
Berechnungsergebnisse lediglich ihrer Darstellung zu.

Im Mitarbeiterkopf erscheinen:

| Snapshot-Rolle   | Sichtbare Kennzahlen                         |
| ---------------- | -------------------------------------------- |
| Erzieher         | SN/F-Dienste, freie Tage, Soll-Ist-Differenz |
| Praktikant       | SN/F-Dienste, freie Tage, Soll-Ist-Differenz |
| Wirtschaftskraft | freie Tage, Soll-Ist-Differenz               |

Beschriftung und Wert der Differenz werden bei negativen Werten rot und bei
positiven Werten grün angezeigt. Ein ausgeglichener Wert bleibt neutral. Das
Vorzeichen der Zahl macht die Richtung auch ohne Farbe erkennbar.

Beschriftung und Wert der freien Tage werden mit dem monatsweiten Zielwert
verglichen. Unterhalb des Ziels erscheinen sie gelb, beim exakten Ziel grün und
oberhalb des Ziels rot. Den zugehörigen Zielwert zeigt die ausgeklappte
Werkzeugleiste als „Freie Tage“ neben Kalender- und Arbeitstagen.

Unterhalb der Kalendertage zeigt die Tabelle für alle Rollen die Ist- und
Soll-Arbeitszeit. Die beiden Zeilen tragen die kurzen Beschriftungen „Ist“ und
„Soll“. Diese Werte unterstützen die laufende Planung, ersetzen aber nicht die
ausführliche Auswertung im Dialog.

Die verbindlichen Regeln stehen unter
[Tagesbezogene Kennzahlen](../fachlichkeit/berechnungen/tageskennzahlen.md),
[Zeitbezogene Monatskennzahlen](../fachlichkeit/berechnungen/monatskennzahlen.md)
und [Soll-Ist-Auswertung](../fachlichkeit/berechnungen/soll-ist-auswertung.md).

## Entwurf, Speichern und Verlustschutz

Die Oberfläche hält den zuletzt geladenen oder gespeicherten Ausgangsstand und
den aktuell bearbeiteten Entwurf getrennt.

Titel, Planungseinträge, Rufbereitschaften und Bemerkungen werden nicht nach
jeder Änderung gespeichert. Änderungen erscheinen sofort in Tabelle und
Kennzahlen. Der sichtbare Gesamtstatus lautet „Ungespeicherte Änderungen“; nach
einzelnen Planungsschritten erscheint kein Erfolgstoast.

„Speichern“ ist nur bei Änderungen verfügbar. Eine Ausnahme ist ein aus einer
Sicherungsdatei wiederhergestellter Plan, der auch ohne weitere Inhaltsänderung
ausdrücklich gespeichert werden kann. Während des Speicherns sind die
Speicheraktion und kollidierende Bearbeitungen gesperrt.

Nach erfolgreichem Speichern wird der vom Main Process zurückgegebene Plan zum
neuen Ausgangsstand. Bei einem Fehler bleibt der Entwurf erhalten und eine
dauerhafte Fehlermeldung bietet einen erneuten Versuch an.

Beim Wechsel von Seite, Zeitraum oder Plan sowie beim Schließen der Anwendung
werden ungespeicherte Änderungen durch dieselbe Entscheidung geschützt:

- Speichern und fortfahren,
- Änderungen verwerfen oder
- Abbrechen.

Der Schutzdialog kennzeichnet den ungespeicherten Zustand mit dem vorhandenen
Warnfarbton, ohne den gesamten Dialog einzufärben. „Speichern und fortfahren“
bleibt die blaue Hauptaktion, „Änderungen verwerfen“ ist als roter destruktiver
Button erkennbar und „Abbrechen“ bleibt neutral. Die Aktionen zum Speichern und
Verwerfen stehen gemeinsam rechts; „Abbrechen“ ist räumlich davon getrennt und
erhält beim Öffnen den Tastaturfokus. Bedeutung und Entscheidung bleiben durch
Symbol und Beschriftung auch ohne Farberkennung verständlich.

Erst ein erfolgreiches Speichern setzt die beabsichtigte Aktion fort. Das bloße
Öffnen des Ladedialogs verwirft noch nichts; der Schutz greift erst bei der
Auswahl eines anderen Plans.

## Wiederherstellung und Fehlerzustände

Wahrnehmbare Lade-, Speicher- und Löschvorgänge erhalten einen sichtbaren
Beschäftigtzustand. Fehler erscheinen möglichst nahe an der betroffenen Aktion
und bleiben sichtbar, solange sie relevant sind. Technische Rohmeldungen dürfen
nicht die einzige Erklärung sein.

Wurde ein Plan aus seiner Sicherungsdatei geladen, lautet der sichtbare Status
„Aus Sicherung geladen · Speichern erforderlich“. Dieser Zustand wird wie eine
ungespeicherte Änderung geschützt und bleibt bestehen, bis ein anderer Plan
geladen oder der wiederhergestellte Stand ausdrücklich gespeichert wurde.

Die technischen Grenzen der Sicherung und Wiederherstellung werden in der
[Datenhaltung](../architektur/datenhaltung.md) beschrieben.

## Barrierearme Bedienung

- Jede Planungszelle erhält einen zugänglichen Namen aus Datum, Mitarbeiter und
  aktuellem Eintrag.
- Rufbereitschaft und Bemerkung sind eindeutig ihrem Datum zugeordnet.
- Auswahlzustände und ungespeicherte Änderungen werden nicht ausschließlich
  durch Farbe vermittelt.
- Dialoge, Popover und Listen sind per Tastatur bedienbar.
- Löschsymbole besitzen eine sichtbare oder assistiv verfügbare Beschriftung.
- Der Fokus bleibt nach dem Schließen eines Popovers oder Dialogs
  nachvollziehbar.

Das Eintrags-Popover unterstützt Tab, Enter beziehungsweise Leertaste und
Escape. Eine besondere Pfeiltastennavigation über die gesamte Planungstabelle
ist nicht vorgesehen.

## Abgrenzung

Nicht zur Planungsseite gehören:

- die ausführliche Auswertungstabelle,
- eine direkte Druckfunktion und die fachlichen Regeln der PDF-Dateierzeugung
  sowie
- das nachträgliche Ergänzen, Entfernen oder Umsortieren der im Plan
  eingefrorenen Mitarbeiter.

Das A4-Dokumentlayout, seine gespeicherte Datengrundlage und die
Darstellungsregeln der integrierten Kompaktansicht werden ausschließlich im
zugehörigen Feature-Dokument festgelegt. Die Planungsseite stellt die
Exportaktion nur in der Kompaktansicht bereit; Dateierzeugung, Dateiauswahl und
Rückmeldungen werden im PDF-Export-Feature festgelegt.
