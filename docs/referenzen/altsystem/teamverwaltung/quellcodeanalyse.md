# Quellcodeanalyse der Teamverwaltung im Altsystem

## Analysebasis und Einordnung

Diese Analyse beruht ausschließlich auf dem statisch gelesenen Altsystem am Commit
`255036d0d95fa7fbf53e354a36680a08ee4719c1`. Die Anwendung wurde nicht gestartet, es
wurden keine Pakete installiert und keine Tests ausgeführt.

Die Aussagen werden wie folgt eingeordnet:

- **Eindeutig angebunden:** Aufruf und Datenfluss sind im Quellcode von einer erreichbaren
  Route bis zur jeweiligen Verarbeitung nachvollziehbar.
- **Vorhanden, aber nicht erkennbar angebunden:** Code ist vorhanden, für ihn wurde jedoch
  keine Aufrufstelle gefunden.
- **Ohne Ausführung nicht bestätigt:** Der Code legt ein Verhalten nahe, die tatsächliche
  Laufzeit- oder Darstellungswirkung wurde in dieser Analyse aber nicht geprüft.

Zentrale Prozessgrenzen, Datenbankgrundlagen, Fehlermechanismen und Testkonventionen werden
nur soweit beschrieben, wie sie die Teamverwaltung unmittelbar betreffen. Ergänzend siehe
[`../uebergreifend/architektur-und-navigation.md`](../uebergreifend/architektur-und-navigation.md),
[`../uebergreifend/datenmodell-und-datenhaltung.md`](../uebergreifend/datenmodell-und-datenhaltung.md),
[`../uebergreifend/fehlerbehandlung-und-validierung.md`](../uebergreifend/fehlerbehandlung-und-validierung.md)
und [`../uebergreifend/komponenten-und-tests.md`](../uebergreifend/komponenten-und-tests.md).

## Zweck und eindeutige Anbindung

Die Teamverwaltung pflegt die Mitarbeiterstammdaten, die anschließend in Planung,
Rufbereitschaft und Auswertung verwendet werden. Sie ist eindeutig erreichbar:

1. `StartPage.tsx` verlinkt die Navigationskarte „Team-Verwaltung“ auf `/team`.
2. `App.tsx` ordnet `/team` der `TeamPage` zu.
3. `TeamPage.tsx` lädt Daten über `window.api.team`, hält den Seitenzustand und verbindet
   Liste und Formular.
4. `preload/index.ts` übersetzt die vier Methoden `list`, `add`, `update` und `delete` in
   IPC-Aufrufe über die zentralen Kanalnamen aus `shared/ipcKanaele.ts`.
5. `main/ipc/teamHandlers.ts` registriert dafür Handler und ruft die Funktionen aus
   `main/db/teamRepository.ts` auf.
6. `main/index.ts` öffnet beim Start die SQLite-Datenbank, registriert die Team-Handler und
   erstellt danach das Fenster.

Damit sind Anzeigen, Anlegen, Bearbeiten und Löschen im statischen Code vollständig über
Renderer, Preload, IPC und Repository verbunden.

## Ansichten und Dialoge

### Teamseite

`TeamPage.tsx` rendert ein `ManagementLayout` mit:

- einem Kopfbereich „Team-Verwaltung“ und der Beschreibung „Mitarbeiter anlegen,
  bearbeiten und verwalten“,
- einem Link zurück zur Startseite,
- der primären Aktion „Neuer Mitarbeiter“,
- einer linken Liste über `TeamMemberTable`,
- einem rechten Detailbereich über `TeamMemberForm`.

Das Layout wechselt ab dem `md`-Breakpoint von einer gestapelten Darstellung zu einer
Liste mit fest 380 Pixel breitem Detailbereich. Die tatsächliche Wirkung bei allen
Fenstergrößen ist ohne Rendern nicht bestätigt.

### Mitarbeiterliste

`TeamMemberTable.tsx` zeigt je Datensatz:

- einen farbigen Punkt,
- Vor- und Nachname,
- Rolle,
- die aus Minuten als `HH:MM` formatierte Wochenarbeitszeit,
- einen kontextbezogen beschrifteten Bearbeiten-Button.

Die aktuell ausgewählte Zeile erhält eine linke Akzentkante und einen Akzenthintergrund.
Ist die Liste leer, erscheint die Tabellenzeile „Noch keine Mitarbeiter angelegt.“.

### Formular

`TeamMemberForm.tsx` dient sowohl zum Anlegen als auch zum Bearbeiten. Es enthält:

- Textfelder für Vorname und Nachname,
- ein geschlossenes Rollen-Select,
- ein Textfeld für die Wochenarbeitszeit im Format `HH:MM`,
- eine Farbauswahl mit zehn fest vorgegebenen Farben,
- Speichern und Abbrechen,
- nur im Bearbeitungsmodus zusätzlich Löschen.

Die Farbauswahl ist als ARIA-Radiogruppe umgesetzt. Jede Farbe hat einen deutschen Namen,
und Pfeiltasten wechseln zyklisch durch die Palette. Der Laufzeitfokus nach einem
Pfeiltastendruck ist aus dem Code beabsichtigt, wurde aber nicht interaktiv bestätigt.

### Löschdialog

Der Löschen-Button öffnet einen `AlertDialog`. Er nennt Vor- und Nachname, warnt vor der
Unumkehrbarkeit und verlangt eine zweite Löschbestätigung. Erst deren Aktion ruft den von
`TeamPage` bereitgestellten Löschablauf auf.

## Zustände der Seite

`TeamPage` hält vier fachlich relevante React-Zustände:

| Zustand       | Bedeutung                                                 |
| ------------- | --------------------------------------------------------- |
| `teamMembers` | aktuell geladene Liste; initial leer                      |
| `selectedId`  | `null` für Anlegen, numerische ID für Bearbeiten          |
| `formValues`  | die fünf sichtbaren Formularwerte als Strings             |
| `errors`      | lokale Liste von Format-, Validierungs- oder Löschfehlern |

`TeamMemberForm` hält zusätzlich lokal, ob der Löschdialog geöffnet ist. Einen eigenen
Lade-, Speicher- oder Löschstatus gibt es nicht. Buttons werden während laufender
Promises nicht deaktiviert, und die initial leere Liste ist zugleich die Darstellung
während des Ladens.

## Abläufe

### Laden

Beim Einhängen der Seite ruft ein Effekt `window.api.team.list()` auf. Ein erfolgreicher
Aufruf ersetzt `teamMembers`. Das Repository liest alle Zeilen aus `team_members`, sortiert
nach aufsteigender ID.

Nach erfolgreichem Anlegen, Bearbeiten oder Löschen wird nicht nur das zurückgegebene
Objekt lokal eingearbeitet. Stattdessen setzt die Seite das Formular zurück und lädt die
vollständige Liste erneut. Dadurch ist anschließend der Datenbankbestand die Quelle der
Anzeige.

### Neu anlegen und abbrechen

„Neuer Mitarbeiter“ und „Abbrechen“ führen denselben Reset aus:

- `selectedId` wird `null`,
- alle Formularfelder werden geleert,
- lokale Fehler werden entfernt.

Im Anlegen-Modus ruft Speichern nach erfolgreicher Prüfung `window.api.team.add(data)` auf.
Das Repository fügt einen Datensatz ein und gibt die über `lastInsertRowid` bestimmte
numerische ID zusammen mit den Eingabedaten zurück.

### Bearbeiten

„Bearbeiten“ übernimmt die ID und alle Stammdaten der gewählten Person in das Formular.
Die Wochenarbeitszeit wird dabei von Minuten in `HH:MM` umgewandelt. Speichern verwendet
bei gesetzter `selectedId` `window.api.team.update(id, data)`. Das Repository führt ein
`UPDATE ... WHERE id = @id` aus und gibt anschließend ein aus ID und Eingabe aufgebautes
Objekt zurück.

### Löschen

Nach der Dialogbestätigung ruft die Seite `window.api.team.delete(selectedId)` auf. Das
Repository prüft getrennt, ob die ID in `planeintraege` oder `rufbereitschaften` vorkommt.

- Bei Verwendung wird nicht gelöscht. Das Ergebnis enthält `geloescht: false` und einen
  fachlichen Grund; die Seite zeigt ihn im Fehlerbereich des Formulars.
- Ohne Verwendung wird `DELETE FROM team_members WHERE id = ?` ausgeführt und
  `geloescht: true` zurückgegeben. Danach werden Formular und Auswahl zurückgesetzt und
  die Liste neu geladen.

Die Tabellen für Planeinträge und Rufbereitschaften enthalten in diesem Stand für
`teamMemberId` selbst keine deklarierte SQLite-Referenz auf `team_members`. Der Schutz der
Planungshistorie liegt für diese Beziehung daher sichtbar in der expliziten Löschprüfung.

## Daten und fachliche Regeln

Der gemeinsame Typ `TeamMember` besteht aus:

| Feld                       | Statische Bedeutung                                  |
| -------------------------- | ---------------------------------------------------- |
| `id`                       | numerischer SQLite-Primärschlüssel mit Autoincrement |
| `vorname`                  | Vorname als Text                                     |
| `name`                     | Nachname als Text                                    |
| `rolle`                    | `Erzieher`, `Praktikant` oder `Wirtschaftskraft`     |
| `wochenarbeitszeitMinuten` | Zeitdauer als Minutenzahl                            |
| `farbe`                    | Hex-Wert aus der gemeinsamen Zehnerpalette           |

Die Wochenarbeitszeit wird nur an der UI-Grenze als `HH:MM` behandelt. Der Parser
akzeptiert nach optionalen äußeren Leerzeichen eine bis drei Stundenziffern sowie Minuten
von `00` bis `59`; im Code liegt der darstellbare Bereich dadurch bei `0:00` bis
`999:59`. Gespeichert wird die daraus berechnete ganze Minutenzahl. Die Formatierung lehnt
negative Werte und Nicht-Ganzzahlen ab.

Die Mitarbeiterdaten werden außerhalb der Verwaltung weiterverwendet:

- `PlanPage.tsx` lädt die gesamte Teamliste und erzeugt daraus Mitarbeiterspalten.
- Bei mitarbeiterabhängigen Einträgen fließt die Wochenarbeitszeit beim Setzen eines
  Planeintrags in dessen Snapshot ein.
- `RufbereitschaftAuswahl.tsx` lädt dieselbe Liste und filtert auf die Rolle `Erzieher`.
- Planung und Auswertung ordnen Daten über `teamMemberId` zu und verwenden Namen und
  Farben zur Darstellung.

Die zugehörigen Berechnungsdetails werden hier nicht wiederholt; siehe
[`../uebergreifend/berechnungen.md`](../uebergreifend/berechnungen.md).

## Validierung

Die eindeutig angebundene Validierung findet vor dem IPC-Aufruf im Renderer statt:

1. `parseHHMMToMinutes()` prüft zunächst das Zeitformat. Bei einem Fehler bricht der
   Ablauf sofort ab und zeigt nur diese eine Meldung.
2. `validateTeamMemberInput()` sammelt anschließend alle weiteren Fehler:
   - Vorname darf nach `trim()` nicht leer sein,
   - Nachname darf nach `trim()` nicht leer sein,
   - Rolle muss exakt einer der drei Rollen entsprechen,
   - Wochenarbeitszeit muss endlich und größer als null sein,
   - Farbe muss exakt in der vorgegebenen Palette vorkommen.

Vor- und Nachname werden nur für die Leerprüfung getrimmt; gespeichert wird der
ursprüngliche String einschließlich möglicher Rand-Leerzeichen. Weder Validierung noch
Schema begrenzen die Textlänge oder verhindern doppelte Personen. Das Datenbankschema
enthält für die Teamfelder `NOT NULL`, aber keine `CHECK`-Constraints für Rollen, Farbe
oder positive Ganzzahlen.

Alle drei Text-Inputs erhalten bei irgendeinem lokalen Fehler gemeinsam `aria-invalid`
und denselben `aria-describedby`-Verweis. Rollen-Select und Farbradiogruppe bekommen
diesen Fehlerzustand nicht. Die Fehlermeldungen stehen gesammelt in einer Liste mit
`role="alert"`.

Die Team-IPC-Handler validieren ihre Argumente nicht erneut. Auch das Repository prüft
weder Eingabedaten noch ID-Typen. Dieser Bereich ist daher nur für Eingaben über den
vorgesehenen Formularablauf abgesichert. Details der querschnittlichen Fehler- und
Validierungsarchitektur stehen in
[`../uebergreifend/fehlerbehandlung-und-validierung.md`](../uebergreifend/fehlerbehandlung-und-validierung.md).

## Fehler- und Leerzustände

- **Leere Datenbank oder noch laufendes Laden:** Die Tabelle zeigt „Noch keine Mitarbeiter
  angelegt.“. Ein eigener Ladetext oder Fortschrittszustand existiert nicht.
- **Ungültige Formulareingabe:** Lokale Fehlerliste im Formular; es erfolgt kein IPC-Aufruf.
- **Fachlich abgelehntes Löschen:** Der Repository-Grund erscheint in derselben lokalen
  Fehlerliste; Auswahl und Formular bleiben bestehen.
- **Technischer Fehler bei Laden, Speichern oder Löschen:** `.catch(fehlerMelder(...))`
  leitet ihn an den global in `App.tsx` eingebundenen `FehlerHinweis` weiter. Diese
  Meldungen bleiben bis zum manuellen Schließen sichtbar; maximal drei werden gehalten.
- **Fehler beim erneuten Laden nach erfolgreichem Schreiben:** Der technische Fehler wird
  global angezeigt. Ob und wie schnell die UI den tatsächlich gespeicherten Stand dann
  widerspiegelt, ist ohne Ausführung nicht bestätigt.

Eine ausdrückliche Erfolgsmeldung gibt es nicht; Erfolg wird durch Formularreset und neu
geladene Liste sichtbar gemacht.

## Module und Verantwortlichkeiten

| Modul                                         | Verantwortung                                                |
| --------------------------------------------- | ------------------------------------------------------------ |
| `renderer/src/pages/TeamPage.tsx`             | Seitenzustand, Abläufe, API-Aufrufe                          |
| `renderer/src/components/TeamMemberTable.tsx` | Liste und Leerzustand                                        |
| `renderer/src/components/TeamMemberForm.tsx`  | kontrolliertes Formular, Farbtastatur, Löschdialog           |
| `renderer/src/lib/validateTeamMember.ts`      | reine Team-Eingabeprüfung                                    |
| `shared/time.ts`                              | Konvertierung zwischen Dauerstring und Minuten               |
| `shared/types.ts`                             | Teamtyp, Farbpalette und Farbhelfer                          |
| `shared/ipcKanaele.ts`                        | zentrale IPC-Kanalnamen                                      |
| `preload/index.ts` und `index.d.ts`           | freigegebene, typisierte Team-API                            |
| `main/ipc/teamHandlers.ts`                    | IPC-zu-Repository-Weiterleitung                              |
| `main/db/teamRepository.ts`                   | Schema sowie SQL für Liste, Anlage, Änderung und Löschung    |
| `main/db/schema.ts`                           | Einbindung der Teamtabelle in die gemeinsame DB-Vorbereitung |

## Gemeinsame Komponenten

Die Teamverwaltung verwendet die seitenübergreifenden Layout-Bausteine
`ManagementLayout` und `ManagementHeader`. Ihre Fachkomponenten setzen auf die gemeinsamen
UI-Primitives `Button`, `Card`, `Input`, `Label`, `Select`, `Table` und `AlertDialog`.
`FehlerHinweis` ist global für alle Routen eingebunden. Die ausführliche Einordnung dieser
Bausteine steht in
[`../uebergreifend/komponenten-und-tests.md`](../uebergreifend/komponenten-und-tests.md).

## Vorhandene Tests – nur statisch inventarisiert

Die folgenden Prüfsignale sind im Commit vorhanden; sie wurden für diese Analyse nicht
ausgeführt:

- `validateTeamMember.test.ts`: gültige Eingabe, beide Namenspflichtfelder, Rollenmenge,
  positive/endliche Wochenarbeitszeit, feste Farbpalette und mehrere gleichzeitige Fehler.
- `shared/time.test.ts`: Parsen, Formatieren und Rundtrip von Zeitdauern einschließlich
  mehrstelliger Stunden und ungültiger Formate.
- `teamRepository.test.ts`: leere und nach ID sortierte Liste, ID-Vergabe, Anlage,
  Aktualisierung, erfolgreiches Löschen sowie Löschsperren durch Planeintrag und
  Rufbereitschaft gegen In-Memory-SQLite.
- `TeamPage.test.tsx`: initiales Laden, Anlegen mit Minutenumrechnung, fehlende Pflichtangabe
  und sichtbarer Ablehnungsgrund beim Löschen einer verplanten Person. Die echte Seite und
  ihre Kindkomponenten werden gerendert; nur `window.api` wird durch ein speicherbasiertes
  Fake ersetzt.
- `ipcVertrag.test.ts`: Vollständigkeit, keine Überregistrierung und keine doppelte
  Registrierung der zentral deklarierten IPC-Kanäle.
- `e2e/app.e2e.test.ts`: Teamnavigation ist beim Start sichtbar; ein Mitarbeiter wird über
  die API-Brücke bis SQLite geschrieben und nach einem Neustart wiedergefunden.

Der E2E-Persistenzfall bedient die Teammaske nicht, sondern ruft `window.api.team.add`
direkt im Renderer auf. Er bestätigt laut Testaufbau den Prozessdurchstich, nicht den
vollständigen Formularablauf.

Nicht direkt abgedeckt sind unter anderem Bearbeiten über die UI, Abbrechen/Reset,
erfolgreiches Löschen über die UI, Farbauswahl per Tastatur, Ladefehler, technische
Speicherfehler, Doppelklick/Mehrfachabsenden und Lade-/Speicherzustände.

## Statisch unklare oder nicht angebundene Bereiche

### Eindeutig vorhandener, aber nicht erkennbar angebundener Code

- `teamMemberFarbName()` in `shared/types.ts` liefert zu einem Hex-Wert den deutschen
  Farbnamen oder ersatzweise den Wert selbst. Im gesamten `src`-Baum wurde keine
  Aufrufstelle gefunden. Das Formular verwendet stattdessen direkt die Namen aus
  `TEAM_MEMBER_FARBEN`.

### Aus dem Code erkennbare Lücken oder Grenzfälle

- `updateTeamMember()` setzt voraus, dass die ID aus einer zuvor geladenen Liste stammt.
  Es prüft die Anzahl geänderter Zeilen nicht und gibt auch bei unbekannter ID ein
  konstruiertes Mitarbeiterobjekt zurück.
- `deleteTeamMember()` prüft ebenfalls nicht, ob die ID tatsächlich existierte. Eine
  unbekannte, unbenutzte ID ergibt statisch `geloescht: true`.
- Für laufende API-Aufrufe gibt es keine Sperre. Ob schnelle Mehrfachbetätigung zu
  doppelten Anlagen oder verwirrenden Zwischenständen führt, ist ohne Ausführung nicht
  bestätigt.
- Laden und echter Leerbestand sind visuell nicht unterscheidbar. Nach einem Ladefehler
  bleibt die lokale Liste im zuletzt bekannten beziehungsweise initial leeren Zustand.
- Die Sicherheit der Eingaberegeln hängt am vorgesehenen Rendererformular; direkte oder
  fehlerhafte IPC-Aufrufe erreichen das Repository ungeprüft.
- Ob das zweispaltige Layout, Radix-Select, Radiogruppenfokus, Dialogfokus und globale
  Fehlermeldungen in der gebauten Electron-Anwendung tatsächlich wie beabsichtigt
  funktionieren, lässt sich durch diese rein statische Analyse nicht bestätigen.
