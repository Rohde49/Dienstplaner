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
Speicherung, sichere Speichergrenzen und Berechnungsfunktionen sind bereits
vorhanden. Sie können nun schrittweise an die Oberfläche angebunden werden.

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

Sind keine aktiven Mitarbeiter vorhanden, bleibt die Zeitraumsauswahl
verfügbar, die leere Monatstabelle wird jedoch nicht angezeigt. Stattdessen
erscheint der Hinweis „Keine aktiven Mitarbeiter vorhanden“ mit der Aktion
„Zur Teamverwaltung“. „Dienstplan erstellen“ bleibt in diesem Zustand
deaktiviert.

Ein Wechsel von Monat oder Jahr lädt niemals automatisch einen vorhandenen
Plan. Stattdessen wird der aktuell angezeigte Plan verlassen und die Vorschau
für den neu gewählten Zeitraum angezeigt. Ungespeicherte Änderungen werden
zuvor nach den Regeln aus Abschnitt 13 geschützt.

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

Der Titel des geladenen Plans steht oberhalb der Planungstabelle. Eine
Stift-Aktion öffnet einen kleinen Dialog zur Bearbeitung. Die Änderung wird erst
in den Entwurf übernommen und gemeinsam mit dem übrigen Plan gespeichert. In
der noch nicht angelegten Vorschau steht diese Titelbearbeitung nicht zur
Verfügung.

## 6. Monatsplan laden

Ein vorhandener Plan wird ausschließlich über die Aktion „Laden“ geöffnet.
Diese Aktion öffnet immer einen Auswahldialog, auch wenn nur ein Plan oder gar
kein Plan gespeichert ist.

Der Dialog zeigt alle gespeicherten Pläne unabhängig vom in der Planungsseite
gewählten Zeitraum. Jeder Eintrag enthält:

- Titel,
- Monat und Jahr,
- Erstellungszeitpunkt und
- letzten Änderungszeitpunkt.

Die Pläne werden nach dem letzten Änderungszeitpunkt absteigend sortiert. Der
Benutzer wählt einen Plan ausdrücklich aus. Die technische ID bleibt in der
Oberfläche verborgen und wird nur intern zur eindeutigen Verarbeitung
verwendet. Existiert kein Plan, bleibt der Dialog geöffnet und zeigt eine
verständliche Information.

Nach dem Laden werden Monats- und Jahresauswahl auf den Zeitraum des gewählten
Plans gesetzt. Da mehrere Pläne denselben Zeitraum besitzen dürfen, kann ein
Zeitraumwechsel umgekehrt keinen Plan automatisch auswählen.

Beim Laden werden ausschließlich die gespeicherten Mitarbeiter-, Kalender- und
Eintrags-Snapshots des gewählten Plans verwendet. Aktuelle Stammdaten verändern
den geladenen Plan nicht.

## 7. Monatsplan löschen

Jeder Eintrag im Ladedialog besitzt eine zugänglich beschriftete Löschaktion mit
Papierkorb-Symbol. Vor jedem Löschen erscheint ein Bestätigungsdialog, der
Titel und Zeitraum des betroffenen Plans nennt. Die technische ID wird auch
hier nicht sichtbar dargestellt.

Dabei gilt:

- Ein nicht geöffneter Plan darf auch gelöscht werden, wenn der aktuell
  bearbeitete Plan ungespeicherte Änderungen enthält.
- Der aktuell geladene Plan darf nur gelöscht werden, wenn keine
  ungespeicherten Änderungen vorliegen.
- Nach dem Löschen des aktuell geladenen Plans zeigt die Seite wieder den
  leeren Vorschauplan desselben Zeitraums.
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

Die gewöhnlichen Planungszellen besitzen eine neutrale Ausgangsbasis. Die
festgelegte Mitarbeiterfarbe wird kräftig im jeweiligen Mitarbeiterkopf
eingesetzt, färbt die darunterliegenden Zellen jedoch nicht ein. Dadurch bleiben
die vollständigen grauen Wochenendzeilen und roten Feiertagszeilen eindeutig
erkennbar. Feiertage haben Vorrang vor Wochenenden. Farbe unterstützt die
Zuordnung, trägt die jeweilige Information aber nicht allein.

Die bestätigte Mitarbeiterfarbpalette besteht aus Blau, Grün, Rot, Orange,
Gelb, Lila, Rosa und Türkis.

## 9. Planungseintrag setzen, ersetzen und entfernen

Ein Klick auf die Teilspalte „Eintrag“ öffnet ein kompaktes Popover. Angeboten
werden ausschließlich aktuell aktive Eintragsarten.

Steht keine aktive Eintragsart zur Verfügung, erscheint ausschließlich im
geöffneten Popover der Hinweis „Es stehen noch keine Planungseinträge zur
Verfügung.“ Ein zusätzlicher Hinweis oberhalb der Tabelle wird nicht angezeigt.
Bei einer bereits belegten Zelle bleibt „Eintrag entfernen“ verfügbar.

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

Enthält der Plan keinen Mitarbeiter mit der Snapshot-Rolle `Erzieher`, bleibt
die Rufbereitschaftszelle bedienbar. Im geöffneten Popover erscheint
ausschließlich der Hinweis „Für diesen Plan stehen keine Erzieher für
Rufbereitschaft zur Verfügung.“ Ein zusätzlicher Hinweis oberhalb der Tabelle
wird nicht angezeigt.

## 11. Tagesbemerkung

Die Bemerkung gehört zum jeweiligen Kalendertag, ist optional und auf maximal
60 Zeichen begrenzt. Äußere Leerzeichen werden entfernt; eine anschließend
leere Bemerkung wird als `null` gespeichert.

Eine leere Bemerkungszelle enthält weder Platzhalter noch Hinweistext. Bei
vorhandenem Inhalt zeigt die Zelle eine gekürzte Vorschau. Die Bearbeitung
erfolgt über ein beschriftetes, mehrzeiliges Eingabefeld in einem Popover. Der
Inhalt darf die Höhe der Planzeile nicht unkontrolliert vergrößern.

Das Popover zeigt die verwendete Zeichenzahl, beispielsweise `24/60`, sowie die
Aktionen „Übernehmen“ und „Abbrechen“. Erst „Übernehmen“ überträgt die Eingabe
in den Planentwurf. „Abbrechen“, die Escape-Taste und ein Klick außerhalb des
Popovers verwerfen die noch nicht übernommene Eingabe. Die Eingabegrenzen
werden beim Übernehmen nach den oben beschriebenen Regeln bereinigt.

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

„Speichern“ ist grundsätzlich nur bei Änderungen verfügbar. Eine Ausnahme ist
ein aus der Sicherungsdatei wiederhergestellter Plan: Er muss auch ohne weitere
inhaltliche Änderung ausdrücklich gespeichert werden können. Während des
Speicherns sind die Speicheraktion und kollidierende Bearbeitungen gesperrt.
Nach erfolgreichem Speichern wird der vom Main Process zurückgegebene Plan zum
neuen Ausgangsstand. Bei einem Fehler bleibt der Entwurf erhalten und eine
dauerhafte Fehlermeldung bietet einen erneuten Versuch an.

Beim Wechsel von Seite, Zeitraum oder Plan sowie beim Schließen der Anwendung
werden ungespeicherte Änderungen durch dieselbe Entscheidung geschützt:

- Speichern und fortfahren,
- Änderungen verwerfen oder
- Abbrechen.

Erst ein erfolgreiches Speichern darf die ursprünglich beabsichtigte Aktion
fortsetzen. Ein bloßes Öffnen des Ladedialogs verwirft noch keinen Entwurf; der
Schutz greift erst bei der Auswahl eines anderen Plans.

Nach einem bestätigten Zeitraumwechsel wird der bisherige Plan verlassen und
die Vorschau für den gewählten Monat angezeigt. Dasselbe gilt nach dem
Verwerfen vorhandener Änderungen. Ein passender gespeicherter Plan wird auch
dann nicht automatisch geladen.

## 14. Laden, Fehler und Sicherungswarnung

Wahrnehmbare Lade-, Speicher- und Löschvorgänge erhalten einen sichtbaren
Beschäftigtzustand. Fehler erscheinen möglichst nahe an der betroffenen Aktion
und bleiben sichtbar, solange sie relevant sind. Technische Rohmeldungen dürfen
nicht die einzige Erklärung sein.

Wurde ein Plan aus seiner Sicherungsdatei geladen, lautet der sichtbare Status
„Aus Sicherung geladen · Speichern erforderlich“. Dieser Zustand wird wie eine
ungespeicherte Änderung durch den Verlustschutz berücksichtigt. Die Warnung
bleibt sichtbar, bis ein anderer Plan geladen oder der wiederhergestellte Stand
ausdrücklich gespeichert wurde. Ein erfolgreiches Speichern stellt die
reguläre Plandatei wieder her und beendet den Sicherungszustand.

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
- Ohne aktive Mitarbeiter ersetzt ein verständlicher Leerzustand die
  Monatstabelle.
- Mehrere Pläne desselben Zeitraums bleiben getrennt ladbar.
- Die technische Plan-ID wird nicht in der Oberfläche dargestellt.
- Löschen folgt den festgelegten Bestätigungs- und Entwurfsregeln.
- Planungstabelle, fixierter Kopf und fixiertes Datum bleiben bei `1024 × 700`
  lesbar.
- Gewöhnliche Planungszellen bleiben neutral; Wochenend- und
  Feiertagskennzeichnungen behalten Vorrang vor Mitarbeiterfarben.
- Einträge, Rufbereitschaften und Bemerkungen verändern zunächst nur den
  Entwurf.
- Leere Eintrags- und Rufbereitschaftsauswahlen werden ausschließlich im
  jeweils geöffneten Popover erklärt.
- Die 60-Zeichen-Grenze wird in Oberfläche und Main Process eingehalten.
- Eine Bemerkung gelangt erst durch „Übernehmen“ in den Planentwurf.
- Sichtbare Kennzahlen reagieren unmittelbar und entsprechen den gemeinsamen
  Berechnungsfunktionen.
- Speichern, Verwerfen und Abbrechen schützen alle festgelegten Wechsel- und
  Schließwege.
- Ein aus Sicherung geladener Plan kann ohne zusätzliche Inhaltsänderung
  gespeichert und damit wiederhergestellt werden.
- Snapshots bleiben nach späteren Stammdatenänderungen unverändert.
- Die sichtbare Oberfläche wurde zusätzlich zu den automatischen Prüfungen vom
  Benutzer abgenommen.

## 17. Entscheidungsprotokoll

Die fachlichen Abschnitte dieses Dokuments sind für die Umsetzung maßgeblich.
Das folgende Protokoll hält ergänzend fest, welche zuvor offenen Punkte
gemeinsam entschieden wurden.

| Nr. | Thema                              | Festgelegte Entscheidung                                                                                                                                                            |
| --: | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|   1 | Aus Sicherung geladener Plan       | Der Status fordert zum Speichern auf. Speichern ist auch ohne weitere Inhaltsänderung möglich, stellt die reguläre Datei wieder her und der Zustand wird vom Verlustschutz erfasst. |
|   2 | Zeitraum eines geladenen Plans     | Monats- und Jahresauswahl wechseln beim Laden auf den Zeitraum des Plans. Nach dem Löschen des geöffneten Plans erscheint die Vorschau desselben Zeitraums.                         |
|   3 | Plantitel bearbeiten               | Der Titel steht oberhalb der Tabelle und wird über eine Stift-Aktion in einem kleinen Dialog bearbeitet. Die Änderung bleibt bis zum Speichern Teil des Entwurfs.                   |
|   4 | Mitarbeiterfarbpalette             | Die verbindliche Palette besteht aus Blau, Grün, Rot, Orange, Gelb, Lila, Rosa und Türkis.                                                                                          |
|   5 | Farben der Planungstabelle         | Gewöhnliche Zellen bleiben neutral, Mitarbeiterköpfe tragen die Mitarbeiterfarbe, Wochenenden sind grau und Feiertage rot. Feiertage haben Vorrang.                                 |
|   6 | Keine aktiven Mitarbeiter          | Die Monatstabelle wird durch einen Leerzustand mit „Zur Teamverwaltung“ ersetzt und die Plananlage bleibt deaktiviert.                                                              |
|   7 | Zeitraum wechseln                  | Der Wechsel zeigt stets die Vorschau des gewählten Zeitraums und lädt keinen Plan automatisch. Ungespeicherte Änderungen werden vorher geschützt.                                   |
|   8 | Keine aktiven Eintragsarten        | Nur das geöffnete Eintrags-Popover weist darauf hin, dass noch keine Planungseinträge zur Verfügung stehen.                                                                         |
|   9 | Keine Erzieher für Rufbereitschaft | Nur das geöffnete Rufbereitschafts-Popover weist darauf hin, dass für den Plan keine Erzieher zur Verfügung stehen.                                                                 |
|  10 | Tagesbemerkung bearbeiten          | „Übernehmen“ überträgt die Eingabe in den Entwurf. „Abbrechen“, Escape und ein Klick außerhalb verwerfen sie. Eine Zeichenanzeige zeigt die Grenze von 60 Zeichen.                  |
|  11 | Technische Plan-ID                 | Die ID bleibt intern erhalten, wird in der normalen Oberfläche aber vorerst nicht dargestellt.                                                                                      |
