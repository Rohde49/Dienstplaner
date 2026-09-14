# Planungsseite

## 1. Ziel und Umsetzungsstand

Die Planungsseite ist die Startansicht des Dienstplaners. Sie unterstützt die
Teamleitung dabei, einen Monatsplan bewusst anzulegen oder zu laden, Einträge
für Mitarbeiter und Kalendertage zu planen, zentrale Kennzahlen unmittelbar zu
beobachten und Änderungen ausdrücklich zu speichern.

Die meisten fachlichen Regeln dieser Seite sind bereits festgelegt und bilden
die maßgebliche Richtlinie für die technische Umsetzung. Sie sollen
grundsätzlich wie dokumentiert umgesetzt werden. Treten bei der Umsetzung
fachliche oder technische Probleme, Fehler beziehungsweise Widersprüche auf,
werden diese dem Benutzer mitgeteilt und vor einer davon betroffenen
Abweichung gemeinsam geklärt.

Die Oberfläche selbst ist noch nicht umgesetzt. Monatsplanmodell, Snapshots,
Speicherung und Berechnungsfunktionen sind bereits vorhanden, müssen vor der
UI-Anbindung aber um die in diesem Dokument beschriebenen Regeln und sicheren
Schnittstellen ergänzt werden.

Die Berechnungsformeln werden hier nicht wiederholt. Dafür gelten die
[Berechnungsdokumente](../Berechnungen/README.md). Datenfelder und
Speicherabläufe stehen unter [Speicherung](../Speicherung/Datenmodell.md).

## 2. Umfang der Planungsseite

Zur Planungsseite gehören:

- eine Monats- und Jahresauswahl mit vorherigem und nächstem Monat,
- ein leerer Vorschauplan vor der Anlage,
- das bewusste Anlegen eines neuen Monatsplans,
- ein globaler Ladedialog für alle gespeicherten Monatspläne,
- das bestätigte Löschen gespeicherter Monatspläne,
- die bearbeitbare Monatsmatrix,
- Planungseinträge, Rufbereitschaften und Tagesbemerkungen,
- dauerhaft sichtbare Planungskennzahlen,
- ein klar gekennzeichneter ungespeicherter Entwurf,
- ausdrückliches Speichern sowie
- Schutz vor dem Verlust ungespeicherter Änderungen.

Nicht zu diesem Umsetzungsschritt gehören:

- die ausführliche Auswertungstabelle,
- die spätere eigenständige Kompaktansicht,
- eine echte Druckvorschau,
- Drucken und PDF-Export,
- das nachträgliche Ergänzen, Entfernen oder Umsortieren der im Plan
  eingefrorenen Mitarbeiter.

Kompaktansicht, Drucken und PDF-Export erhalten bis zu ihrer eigenen Umsetzung
keine sichtbaren Platzhalter auf der Planungsseite.

## 3. Fenster und Seitenaufbau

Die Anwendung startet maximiert, aber nicht im Vollbildmodus. Die normale
Windows-Titelleiste und die Möglichkeit zum Wiederherstellen des Fensters
bleiben erhalten.

Zwischen `1024` und `1279` Pixel Fensterbreite reduziert sich die
Hauptnavigation auf eine schmale Symbolleiste. Die Bezeichnungen bleiben über
zugängliche Beschriftungen beziehungsweise Tooltips verfügbar. Ab `1280`
Pixeln werden Symbol und Beschriftung gemeinsam angezeigt.

Die Planungsseite nutzt die gesamte verbleibende Inhaltsbreite und gliedert
sich in:

1. Seitenkopf mit Titel, Speicherstatus und Aktion „Speichern“,
2. Werkzeugleiste mit Zeitraum, „Laden“ und „Dienstplan erstellen“,
3. dauerhafte Lade-, Fehler-, Sicherungs- oder Änderungshinweise,
4. Planungstabelle und
5. Legende.

## 4. Anfangszustand und leerer Vorschauplan

Beim Öffnen der Planungsseite wird kein gespeicherter Plan automatisch geladen.
Das gilt auch dann, wenn für den aktuell gewählten Zeitraum genau ein Plan
vorhanden ist.

Stattdessen zeigt die Seite für den gewählten Monat einen nicht bearbeitbaren
Vorschauplan mit:

- sämtlichen Kalendertagen des Monats,
- den aktuell aktiven Mitarbeitern in ihrer aktuellen Reihenfolge und
- den aus diesem leeren Planungsstand berechneten Kennzahlen.

Die Vorschau trägt den sichtbaren Status „Vorschau · nicht angelegt“. Sie ist
kein gespeicherter Monatsplan und enthält noch keine verbindlichen Snapshots.
Planungseinträge, Rufbereitschaften und Bemerkungen können erst nach der
Plananlage bearbeitet werden.

## 5. Monatsplan anlegen

„Dienstplan erstellen“ öffnet einen kleinen Dialog für den verpflichtenden
Plantitel. Der Titel wird an den Eingabegrenzen von äußeren Leerzeichen befreit
und darf höchstens 200 Zeichen enthalten.

Ein Plan darf nur angelegt werden, wenn mindestens ein aktiver Mitarbeiter
vorhanden ist. Andernfalls ist die Anlage gesperrt und die Oberfläche verweist
verständlich auf die Teamverwaltung. Diese Regel wird nicht nur in der
Oberfläche, sondern auch an der maßgeblichen Fachgrenze erzwungen.

Beim Anlegen:

1. werden Jahr, Monat und Titel geprüft,
2. werden die aktuell aktiven Mitarbeiter in ihrer Reihenfolge als Snapshots
   übernommen,
3. werden sämtliche Kalendertage des Monats erzeugt,
4. wird der neue Plan unmittelbar gespeichert und
5. wird der gespeicherte Rückgabestand als Ausgangsstand der Oberfläche
   angezeigt.

Mehrere Pläne dürfen denselben Monat und dasselbe Jahr besitzen. Jahr und Monat
eines angelegten Plans bleiben unveränderlich. Der Titel kann später bearbeitet
werden; eine Titeländerung ist bis zum ausdrücklichen Speichern ungespeichert.

## 6. Monatsplan laden

Ein vorhandener Plan wird ausschließlich über die Aktion „Laden“ geöffnet.
Diese Aktion öffnet immer einen Auswahldialog, auch wenn nur ein Plan oder gar
kein Plan gespeichert ist.

Der Dialog zeigt alle gespeicherten Pläne unabhängig vom in der Planungsseite
gewählten Zeitraum. Jeder Eintrag enthält:

- ID,
- Titel,
- Monat und Jahr,
- Erstellungszeitpunkt und
- letzten Änderungszeitpunkt.

Die Pläne werden nach dem letzten Änderungszeitpunkt absteigend sortiert. Der
Benutzer wählt einen Plan ausdrücklich aus; technische Eindeutigkeit entsteht
durch seine ID. Existiert kein Plan, bleibt der Dialog geöffnet und zeigt eine
verständliche Information.

Beim Laden werden ausschließlich die gespeicherten Mitarbeiter-, Kalender- und
Eintrags-Snapshots des gewählten Plans verwendet. Aktuelle Stammdaten verändern
den geladenen Plan nicht.

## 7. Monatsplan löschen

Jeder Eintrag im Ladedialog besitzt eine zugänglich beschriftete Löschaktion mit
Papierkorb-Symbol. Vor jedem Löschen erscheint ein Bestätigungsdialog, der ID
und Titel des betroffenen Plans nennt.

Dabei gilt:

- Ein nicht geöffneter Plan darf auch gelöscht werden, wenn der aktuell
  bearbeitete Plan ungespeicherte Änderungen enthält.
- Der aktuell geladene Plan darf nur gelöscht werden, wenn keine
  ungespeicherten Änderungen vorliegen.
- Nach dem Löschen des aktuell geladenen Plans zeigt die Seite wieder den
  leeren Vorschauplan des gewählten Zeitraums.
- Während eines Löschvorgangs sind weitere Lade- und Löschaktionen gesperrt.
- Nach erfolgreichem Löschen wird die Liste aktualisiert und der Ladedialog
  bleibt geöffnet.

Das Löschen eines vollständigen Plans ist von dem bestätigungsfreien Entfernen
eines einzelnen Planungseintrags zu unterscheiden.

## 8. Aufbau der Planungstabelle

Die Tabelle führt Kalendertage zeilenweise und Mitarbeiter spaltenweise. Rechts
hinter allen Mitarbeiterspalten stehen „Rufbereitschaft“ und „Bemerkung“.

Jeder Mitarbeiter besitzt zwei Teilspalten:

1. **Eintrag:** interaktive Zelle zum Setzen eines Planungseintrags und zur
   Anzeige seines Kürzels,
2. **Zeit:** nicht bearbeitbare Anzeige von Beginn und Ende als gemeinsame
   Zeitspanne, beispielsweise `06:00–14:00`.

Beginn und Ende werden nicht unabhängig in der Planungszelle bearbeitet. Sie
stammen aus dem gespeicherten Eintragssnapshot. Ein über Mitternacht reichender
Eintrag bleibt dem Kalendertag seiner Planungszelle zugeordnet.

Der vollständige Tabellenkopf mit Kennzahlen, Mitarbeitername sowie „Eintrag“
und „Zeit“ bleibt beim vertikalen Scrollen sichtbar. Die Datumsspalte bleibt
beim horizontalen Scrollen links sichtbar. Die Abschlusszeilen für Ist- und
Soll-Arbeitszeit bleiben am normalen Tabellenende und werden nicht fixiert.

Wochenenden und Feiertage werden zusätzlich zu ihrer textlichen Benennung über
die vollständige Tabellenzeile sichtbar gekennzeichnet. Wochenendzeilen sind
etwas dunkler beziehungsweise grauer als gewöhnliche Tabellenzeilen.
Feiertagszeilen erhalten eine rote Flächenkennzeichnung. Treffen mehrere
Feiertagsbezeichnungen auf ein Datum zu, bleiben alle erhalten. Fällt ein
Feiertag auf ein Wochenende, hat die rote Feiertagskennzeichnung Vorrang vor
der grauen Wochenendkennzeichnung.

Jede Mitarbeiterspalte erhält außerdem eine dezente Flächenfärbung in der
festgelegten Mitarbeiterfarbe. Im Tabellenkopf ist diese Farbe kräftiger; in
den darunterliegenden Zellen wird sie deutlich zurückhaltender verwendet. Die
Zeilenkennzeichnung für Wochenenden und Feiertage muss dabei weiterhin klar
erkennbar bleiben. Farbe unterstützt die Zuordnung, trägt die jeweilige
Information aber nicht allein.

## 9. Planungseintrag setzen, ersetzen und entfernen

Ein Klick auf die Teilspalte „Eintrag“ öffnet ein kompaktes Popover. Angeboten
werden ausschließlich aktuell aktive Eintragsarten.

Die Auswahl zeigt je Eintragsart gleichwertig:

- Kürzel und
- Zeitspanne.

Die Bezeichnung der Eintragsart wird in dieser Auswahl nicht angezeigt. Der
aktuell gesetzte Eintrag ist deutlich markiert. Bei einer belegten Zelle wird
zusätzlich „Eintrag entfernen“ angeboten. Das Entfernen benötigt keine
Bestätigung, da es zunächst nur den Entwurf verändert.

Setzen oder Ersetzen erzeugt den vollständigen Snapshot über die gemeinsame
Fachlogik. Beim Ersetzen bleibt die Identität des vorhandenen Planeintrags
stabil. Die maßgebliche Main-Process-Grenze darf keine vom Renderer frei
gebildeten Snapshotwerte übernehmen.

Das Popover ist per Maus sowie mit Tab, Enter beziehungsweise Leertaste und
Escape bedienbar. Eine besondere Pfeiltastennavigation der gesamten Tabelle ist
für diesen Umsetzungsstand nicht vorgesehen.

## 10. Rufbereitschaft

Pro Kalendertag kann höchstens eine Rufbereitschaft gesetzt werden. Die Auswahl
enthält ausschließlich Mitarbeiter mit der im Plan gespeicherten Snapshot-Rolle
`Erzieher`. Eine spätere Rollenänderung im Mitarbeiterstamm beeinflusst die
Auswahl eines bestehenden Plans nicht.

„Keine Rufbereitschaft“ entfernt eine bestehende Zuordnung ohne zusätzliche
Bestätigung. Eine Rufbereitschaft und ein normaler Planungseintrag derselben
Person dürfen am selben Tag nebeneinander bestehen.

## 11. Tagesbemerkung

Die Bemerkung gehört zum jeweiligen Kalendertag, ist optional und auf maximal
60 Zeichen begrenzt. Äußere Leerzeichen werden entfernt; eine anschließend
leere Bemerkung wird als `null` gespeichert.

Eine leere Bemerkungszelle enthält weder Platzhalter noch Hinweistext. Bei
vorhandenem Inhalt zeigt die Zelle eine gekürzte Vorschau. Die Bearbeitung
erfolgt über ein beschriftetes, mehrzeiliges Eingabefeld in einem Popover. Der
Inhalt darf die Höhe der Planzeile nicht unkontrolliert vergrößern.

## 12. Sichtbare Kennzahlen

Alle Kennzahlen werden nach jeder Entwurfsänderung aus dem aktuellen
Monatsplanstand neu berechnet. Die Formeln bleiben rollenunabhängig; die
Planungsseite entscheidet lediglich, welche Werte sie an welcher Stelle zeigt.

Im Mitarbeiterkopf erscheinen:

| Snapshot-Rolle   | Sichtbare Kennzahlen                          |
| ---------------- | --------------------------------------------- |
| Erzieher         | SN/F-Dienste, Freie Tage, Soll-/Ist-Differenz |
| Praktikant       | SN/F-Dienste, Freie Tage, Soll-/Ist-Differenz |
| Wirtschaftskraft | Freie Tage, Soll-/Ist-Differenz               |

Unterhalb der Kalendertage zeigt die Tabelle für **alle Rollen** jeweils:

- Ist-Arbeitszeit und
- Soll-Arbeitszeit.

Diese Werte sind dauerhaftes Feedback für die laufende Planung. Sie ersetzen
nicht die spätere ausführliche Auswertungstabelle.

## 13. Entwurf, Speichern und Verlustschutz

Die Oberfläche hält getrennt:

- den zuletzt geladenen oder gespeicherten Ausgangsstand und
- den aktuell bearbeiteten Entwurf.

Titel, Planungseinträge, Rufbereitschaften und Bemerkungen werden nicht nach
jeder Einzeländerung gespeichert. Änderungen erscheinen sofort in der Tabelle und
in den Kennzahlen. Der Gesamtstatus lautet sichtbar „Ungespeicherte
Änderungen“. Es erscheint kein Toast nach jedem Planungsschritt.

„Speichern“ ist nur bei Änderungen verfügbar. Während des Speicherns sind die
Speicheraktion und kollidierende Bearbeitungen gesperrt. Nach erfolgreichem
Speichern wird der vom Main Process zurückgegebene Plan zum neuen
Ausgangsstand. Bei einem Fehler bleibt der Entwurf erhalten und eine dauerhafte
Fehlermeldung bietet einen erneuten Versuch an.

Beim Wechsel von Seite, Zeitraum oder Plan sowie beim Schließen der Anwendung
werden ungespeicherte Änderungen durch dieselbe Entscheidung geschützt:

- Speichern und fortfahren,
- Änderungen verwerfen oder
- Abbrechen.

Erst ein erfolgreiches Speichern darf die ursprünglich beabsichtigte Aktion
fortsetzen. Ein bloßes Öffnen des Ladedialogs verwirft noch keinen Entwurf; der
Schutz greift erst bei der Auswahl eines anderen Plans.

## 14. Laden, Fehler und Sicherungswarnung

Wahrnehmbare Lade-, Speicher- und Löschvorgänge erhalten einen sichtbaren
Beschäftigtzustand. Fehler erscheinen möglichst nahe an der betroffenen Aktion
und bleiben sichtbar, solange sie relevant sind. Technische Rohmeldungen dürfen
nicht die einzige Erklärung sein.

Wurde ein Plan aus seiner Sicherungsdatei geladen, bleibt die verständliche
Sicherungswarnung sichtbar, bis ein anderer Plan geladen oder der
wiederhergestellte Stand ausdrücklich gespeichert wurde.

## 15. Barrierearme Bedienung

- Jede Planungszelle erhält einen zugänglichen Namen aus Datum, Mitarbeiter und
  aktuellem Eintrag.
- Rufbereitschaft und Bemerkung sind eindeutig ihrem Datum zugeordnet.
- Auswahlzustände und ungespeicherte Änderungen werden nicht ausschließlich
  durch Farbe vermittelt.
- Alle Dialoge, Popover und Listen sind vollständig per Tastatur bedienbar.
- Löschsymbole besitzen eine sichtbare oder assistiv verfügbare Beschriftung.
- Der Fokus bleibt nach dem Schließen eines Popovers oder Dialogs
  nachvollziehbar.

## 16. Abnahmekriterien

Die Planungsseite ist fachlich abnahmefähig, wenn mindestens folgende Punkte
erfüllt sind:

- Kein gespeicherter Plan wird automatisch geöffnet.
- Der leere Vorschauplan ist klar vom angelegten Plan unterscheidbar.
- Ohne aktiven Mitarbeiter kann kein Monatsplan angelegt werden.
- Mehrere Pläne desselben Zeitraums bleiben getrennt ladbar.
- Löschen folgt den festgelegten Bestätigungs- und Entwurfsregeln.
- Planungstabelle, fixierter Kopf und fixiertes Datum bleiben bei `1024 × 700`
  lesbar.
- Einträge, Rufbereitschaften und Bemerkungen verändern zunächst nur den
  Entwurf.
- Die 60-Zeichen-Grenze wird in Oberfläche und Main Process eingehalten.
- Sichtbare Kennzahlen reagieren unmittelbar und entsprechen den gemeinsamen
  Berechnungsfunktionen.
- Speichern, Verwerfen und Abbrechen schützen alle festgelegten Wechsel- und
  Schließwege.
- Snapshots bleiben nach späteren Stammdatenänderungen unverändert.
- Die sichtbare Oberfläche wurde zusätzlich zu den automatischen Prüfungen vom
  Benutzer abgenommen.
