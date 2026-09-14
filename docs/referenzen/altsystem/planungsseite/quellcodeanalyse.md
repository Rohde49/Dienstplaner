# Planungsseite – Quellcodeanalyse

## Untersuchungsrahmen

Analysiert wurde ausschließlich der Quellcode des Altsystems `Rohde49/dienstplan-app` am Commit `255036d0d95fa7fbf53e354a36680a08ee4719c1`. Die Anwendung wurde nicht gestartet und die Tests wurden nicht ausgeführt. Aussagen über sichtbares oder gespeichertes Verhalten bezeichnen daher nur statisch nachvollziehbare Abläufe.

Zur Einordnung der Befunde werden drei Kategorien verwendet:

- **Angebunden:** Der Aufrufweg ist von der Oberfläche bis zu den beteiligten Modulen statisch nachvollziehbar.
- **Vorhanden, aber nicht erkennbar angebunden:** Code ist vorhanden, wird im untersuchten Ablauf jedoch nicht aufgerufen.
- **Ohne Ausführung nicht bestätigt:** Die Verdrahtung ist erkennbar, ihre praktische Funktion oder Darstellung wurde nicht ausgeführt.

Übergreifende Details stehen in [Architektur und Navigation](../uebergreifend/architektur-und-navigation.md), [Datenmodell und Datenhaltung](../uebergreifend/datenmodell-und-datenhaltung.md), [Fehlerbehandlung und Validierung](../uebergreifend/fehlerbehandlung-und-validierung.md), [Komponenten und Tests](../uebergreifend/komponenten-und-tests.md) und [Berechnungen](../uebergreifend/berechnungen.md).

## Zweck und Einstieg

Die `PlanPage` ist unter der Hash-Route `/dienstplan` in `App.tsx` angebunden. Sie dient dazu, einen Monatsplan als Entwurf aufzubauen, vorhandene Pläne zu laden, Änderungen gesammelt zu speichern und zwischen einer bearbeitbaren Planungstabelle und einer kompakten, rein lesenden Ansicht umzuschalten.

Die Seite lädt beim Einhängen die aktuelle Mitarbeiterliste. Monat und Jahr starten mit dem aktuellen Datum. Solange kein Dienstplan aktiv ist, erzeugt `getKalendertageFuerMonat()` daraus lediglich die darzustellenden Kalendertage; editierbare `Dienstplantag`-IDs entstehen erst beim Anlegen oder Laden eines Plans.

## Sichtbare Ansichten und Dialoge

### Kopfbereich

**Angebunden** sind:

- Rückkehr zur Startseite;
- Auswahl von Monat und Jahr, solange kein Dienstplan aktiv ist;
- optionaler Titel, nach Aktivierung als Text mit Bearbeiten-Schaltfläche;
- „Erstellen“ beziehungsweise „Neu anlegen“, „Speichern“ und „Laden“;
- Umschalter „Planung“/„Druckvorschau“;
- „Auswertung“, sobald ein Dienstplan aktiv ist;
- ein Hinweis auf ungespeicherte Änderungen.

Der „Drucken“-Button ist sichtbar, aber dauerhaft deaktiviert. Ein Druck-Handler ist nicht angebunden.

### Bearbeitbare Planungstabelle

`PlanungsGrid` rendert eine horizontal und vertikal scrollbare Tabelle mit feststehender Kopfzeile und feststehender Datumsspalte. Sie zeigt:

- für jeden Kalendertag Datum, Wochentag und gegebenenfalls Feiertagsname;
- Feiertage und Wochenenden mit unterschiedlichen Zeilenflächen;
- für jedes aktuelle Teammitglied einen farblich gekennzeichneten Block mit „Eintrag“, „Beginn“ und „Ende“;
- je Teammitglied die Kennzahlen „SN/F-Dienste“, „Freie Tage“ und „Δ Soll/Ist“ sowie die Fußzeilen „Ist“ und „Soll“;
- je Tag eine Rufbereitschaft und eine Bemerkung.

Ohne `Dienstplantag`-Datensätze ist das Grid eine nicht editierbare Vorschau. Planeintrags- und Rufbereitschaftszellen zeigen dann Striche, Bemerkungszellen bleiben leer und ein Hinweis „Vorschau · nicht gespeichert“ wird eingeblendet. Mit einem aktiven Plan öffnen Eintrags- und Zeitzellen gemeinsam ein Popover zur Eintragsauswahl; die Rufbereitschaft hat ein eigenes Auswahl-Popover, die Bemerkung ist ein Inline-Eingabefeld.

### Verkürzte Ansicht

`VerkuerzteAnsicht` ist über den Umschalter „Druckvorschau“ angebunden. Sie ist rein lesend und übernimmt denselben aktuellen Entwurf wie das Grid. Pro Teammitglied gibt es nur eine Spalte. Ein gesetzter Eintrag erscheint als Kürzel und, wenn beide Werte vorhanden sind, zusätzlich als `Beginn–Ende`. Rufbereitschaft und Bemerkung werden als Text dargestellt; die Fußzeilen zeigen Ist und Soll.

Die Ansicht zeigt alle Rollen. Kennzahlen werden aber nur für Teammitglieder mit der Rolle `Erzieher` berechnet; bei anderen Rollen bleiben die Ist-/Soll-Zellen leer. Anders als das vollständige Grid besitzt die verkürzte Ansicht keinen ausdrücklichen Vorschauhinweis, wenn noch kein Dienstplan aktiv ist.

### Laden- und Löschdialoge

`DienstplanLadenDialog` lädt beim Öffnen über `dienstplan.list()` alle Pläne und sortiert sie im Renderer nach `geaendertAm` absteigend. Die Tabelle enthält ID, Titel, Monat, Jahr sowie Erstellungs- und Änderungszeitpunkt. Eine leere Liste wird als „Noch keine Dienstpläne vorhanden“ angezeigt.

Ein Klick auf eine Tabellenzeile wählt den Plan zum Laden. Der Lösch-Icon-Button stoppt die Zeilenaktion und öffnet stattdessen einen Bestätigungsdialog mit Titel, Monat und Jahr. Nach bestätigtem Löschen wird die Liste neu geladen. War der gelöschte Plan aktiv, setzt die `PlanPage` ihren Planungszustand zurück; der Ladedialog bleibt nach dem statisch erkennbaren Ablauf geöffnet.

### Warnung vor Datenverlust

Ein gemeinsamer `AlertDialog` schützt die Aktionen „Laden“, „Neu anlegen“ und „Startseite“, wenn der aktive Plan vom zuletzt gespeicherten Stand abweicht. „Abbrechen“ belässt den Zustand, „Fortfahren“ führt die vorgemerkte Aktion aus. Das Löschen hat einen eigenen Bestätigungsdialog.

## Zustände und Zustandswechsel

### Kein aktiver Dienstplan

- Monat und Jahr sind änderbar, der Titel ist ein Eingabefeld.
- „Erstellen“ und „Laden“ sind aktiv, „Speichern“ und „Auswertung“ sind deaktiviert.
- Kalendertage und aktuelle Teammitglieder werden angezeigt, Zellen sind mangels `Dienstplantag`-IDs nicht editierbar.
- „Erstellen“ persistiert sofort den Plan samt Tageszeilen und wechselt anschließend in den aktiven Zustand.

### Aktiver Dienstplan

- Monat und Jahr sind gesperrt.
- Titel, Planeinträge, Rufbereitschaften und Bemerkungen werden als lokaler Entwurf geführt.
- „Neu anlegen“ ersetzt „Erstellen“; „Speichern“ und „Auswertung“ sind aktiv.
- Der Titel wird zunächst als Text dargestellt und kann in ein Eingabefeld umgeschaltet werden.

### Entwurf und Baseline

Für Planeinträge und Rufbereitschaften hält `PlanPage` jeweils einen Entwurfs- und einen Baseline-State. Bemerkungen liegen im Entwurf; ihre Baseline sind die geladenen `Dienstplantag`-Objekte. Der Titel wird mit `letzterGespeicherterTitel` verglichen.

Geänderte Planeintragszellen werden über die Vereinigung der Schlüssel beider Zustände und einen `JSON.stringify`-Vergleich ermittelt. Rufbereitschaften und Bemerkungen werden direkt verglichen. Abweichende Zellen erhalten einen kleinen Punkt. Der gemeinsame Dirty-Status umfasst Titel, Planeinträge, Rufbereitschaften und Bemerkungen.

Beim Wechsel zwischen Planung und Druckvorschau bleiben diese States in `PlanPage` erhalten; die Ansichten werden lediglich alternativ gerendert.

## Benutzerabläufe und Datenänderungen

### Dienstplan anlegen

1. `PlanPage` übergibt Monat, Jahr und Titel an `window.api.dienstplan.create()`.
2. Preload und IPC-Handler leiten den Aufruf an `createDienstplan()` weiter.
3. Das Repository legt in einer SQLite-Transaktion einen `Dienstplan` und für jeden berechneten Kalendertag eine `Dienstplantag`-Zeile an.
4. Die Rückgabe wird zum aktiven Plan; alle Eintrags- und Rufbereitschafts-Baselines sind leer, die Bemerkungen werden aus den neuen Tageszeilen initialisiert.

Mehrere Pläne mit demselben Monat und Jahr sind durch keine Eindeutigkeitsregel ausgeschlossen.

### Planeintrag setzen, ersetzen oder entfernen

Die Popover-Komponente lädt die aktuellen Eintragsdefinitionen. „Kein Eintrag“ entfernt den Schlüssel aus dem lokalen Entwurf. Bei Auswahl einer Definition erzeugt `erzeugePlaneintragSnapshot()` eine Kopie aus Kürzel, Zeiten und fünf Minutenwerten. Dadurch ist die spätere Darstellung nicht von einem erneuten Nachschlagen der Definition abhängig.

Bei `berechnungsart: 'mitarbeiterabhaengig'` setzt der untersuchte Code Beginn und Ende auf `null`, vier Minutenwerte einschließlich `arbeitszeitMinuten` auf `0` und berechnet `arbeitszeitOhneNachtbereitschaftMinuten` als Wochenarbeitszeit geteilt durch fünf, gerundet auf volle Minuten.

### Rufbereitschaft setzen oder entfernen

Die Auswahl lädt die aktuelle Mitarbeiterliste erneut und bietet nur Personen mit Rolle `Erzieher` an. Im Entwurf steht pro `Dienstplantag` höchstens eine `teamMemberId`; „Keine Rufbereitschaft“ entfernt den Schlüssel.

### Bemerkung bearbeiten

Die Bemerkung wird direkt im Eingabefeld geändert. Ein leerer String wird beim Speichern in `null` umgewandelt. Das Feld begrenzt die Eingabe über `maxLength` auf 40 Zeichen.

### Speichern

`handleSpeichern()` erzeugt ausschließlich für geänderte Zellen drei Änderungslisten. Diese sowie Titel und Plan-ID gehen in einem IPC-Aufruf an `speicherePlanungsstand()`.

Das Repository verarbeitet die Datenänderungen in einer SQLite-Transaktion:

- Titel und `geaendertAm` werden aktualisiert;
- Planeinträge werden pro Tag/Mitarbeiter zuerst gelöscht und bei gesetztem Snapshot neu eingefügt;
- Rufbereitschaften werden pro Tag zuerst gelöscht und gegebenenfalls neu eingefügt;
- geänderte Bemerkungen werden auf den Tageszeilen aktualisiert.

Anschließend liest das Repository Plan, Planeinträge, Rufbereitschaften und Tageszeilen zurück. Erst auf eine erfolgreiche Promise hin ersetzt `PlanPage` Entwurf und Baselines mit diesem Rückgabestand. Der Speichern-Button bleibt auch ohne erkannte Änderungen aktiv; dadurch wird bei Betätigung zumindest Titel und Änderungszeitpunkt erneut geschrieben.

### Laden

Nach Auswahl einer Plan-ID lädt `PlanPage` parallel:

- Plan und Tageszeilen,
- Planeinträge des Plans,
- Rufbereitschaften des Plans.

Nach erfolgreicher gemeinsamer Rückgabe werden Monat, Jahr, Titel, Tageszeilen, Entwürfe und Baselines ersetzt und der Dialog geschlossen. Liefert `dienstplan.get()` `null`, beendet der Handler den Erfolgszweig ohne sichtbare Zustandsänderung und ohne eigene Meldung.

### Löschen

Der Löschaufruf läuft über Preload und IPC in `deleteDienstplan()`. Dort werden in einer Transaktion zuerst Planeinträge und Rufbereitschaften des Plans, dann seine Tageszeilen und zuletzt der Plan selbst gelöscht. Andere Pläne werden durch die Abfragen nach `dienstplanId` nicht ausgewählt.

## Beteiligte Module und Schichten

| Bereich | Wesentliche Bestandteile | Aufgabe |
| --- | --- | --- |
| Renderer-Seite | `PlanPage.tsx` | Orchestriert Laden, Entwurf, Dirty-Tracking, Speichern, Dialoge und Ansichtswechsel |
| Renderer-Ansichten | `PlanungsGrid.tsx`, `VerkuerzteAnsicht.tsx` | Bearbeitbare beziehungsweise kompakte Tabellendarstellung und live berechnete Kennzahlen |
| Renderer-Auswahl | `EintragsdefinitionAuswahl.tsx`, `RufbereitschaftAuswahl.tsx` | Lädt Stammdaten für die Popover und liefert die Auswahl zurück |
| Renderer-Hilfen | `planeintragSnapshot.ts`, `rufbereitschaftEntwurf.ts`, `planAnsicht.ts`, `mitarbeiterabhaengigeArbeitszeit.ts`, `sollIstFarbe.ts` | Snapshot-/Entwurfsbildung, gemeinsame Darstellung und Berechnungshilfen |
| Gemeinsamer Code | `types.ts`, `kalendertage.ts`, `auswertung.ts`, `planeintragSchluessel.ts`, `time.ts`, `rundeAufVolleMinute.ts` | Typen, Kalender, Schlüssel, Zeitformatierung und fachliche Berechnungen |
| Prozessgrenze | `ipcKanaele.ts`, `preload/index.ts`, `preload/index.d.ts`, `main/ipc/*Handlers.ts` | Typisierte `window.api`-Brücke und Registrierung der IPC-Aufrufe |
| Datenhaltung | `dienstplanRepository.ts`, `planeintragRepository.ts`, `rufbereitschaftRepository.ts`, `schema.ts` | SQLite-Schema, Transaktionen und planbezogene Abfragen |

Der Renderer greift nicht direkt auf SQLite zu. Der Main-Prozess öffnet die lokale Datei `dienstplan.db` im Electron-`userData`-Verzeichnis, bereitet Schema und Pragmas vor und reicht die Verbindung an die Handler und Repositories weiter.

## Daten und Datenstrukturen

Die Seite arbeitet vor allem mit:

- `Dienstplan`: ID, Monat, Jahr, Titel und Zeitstempel;
- `Dienstplantag`: ID, Plan-ID, Datum und optionale Bemerkung;
- `PlaneintragSnapshot`: Herkunfts-ID der Eintragsdefinition, Kürzel, Beginn/Ende und fünf Zeitwerte, ohne eigene Planzeilen-ID und Mitarbeiter-ID;
- `PlaneintragAenderung`: Tag, Mitarbeiter und Snapshot oder `null`;
- `RufbereitschaftAenderung`: Tag und Mitarbeiter oder `null`;
- `BemerkungAenderung`: Tag und Text oder `null`.

Planeinträge werden im Renderer über den Schlüssel `dienstplantagId:teamMemberId` indiziert. Rufbereitschaften und Bemerkungen verwenden die `dienstplantagId` als String-Schlüssel. Das Datenbankschema erzwingt höchstens einen Planeintrag je Tag/Mitarbeiter und höchstens eine Rufbereitschaft je Tag. Die in `schema.ts` deklarierten Fremdschlüsselprüfungen werden beim Öffnen der Datenbank eingeschaltet; nicht jede gespeicherte ID-Spalte besitzt allerdings eine `REFERENCES`-Klausel.

## Regeln und Berechnungen

Die Planungsansichten rufen dieselbe reine Funktion `berechneKennzahlenFuerMitarbeiter()` auf und berechnen live aus dem aktuellen Entwurf. Eine ausführliche Herleitung steht unter [Berechnungen](../uebergreifend/berechnungen.md). Für die Seite wesentlich sind:

- Kennzahlen werden nur für `Erzieher` erzeugt.
- `SN/F`-Dienste zählen im untersuchten Code Einträge mit Kürzel `SN/F` **oder** `SN`.
- „Freie Tage“ zählt Einträge mit Kürzel `/` unabhängig vom Wochentag.
- Arbeitszeit an Sonn- und Feiertagen summiert `arbeitszeitOhneNachtbereitschaftMinuten`.
- Die monatliche Gesamtarbeitszeit summiert Arbeitszeit ohne Nachtbereitschaft plus Nachtbereitschaft.
- Die Ist-Arbeitszeit besteht aus Arbeitszeit ohne Nachtbereitschaft plus 25 Prozent der gesamten Nachtbereitschaft; der Zuschlag wird nach der Monatssumme gerundet.
- Die Soll-Arbeitszeit ist die Zahl der Werktage Montag bis Freitag ohne gesetzliche Brandenburger Feiertage, multipliziert mit der Wochenarbeitszeit und geteilt durch fünf, anschließend gerundet.
- `Δ Soll/Ist` ist Ist minus Soll und wird mit Vorzeichen formatiert.
- Die Kalenderfunktion berechnet zwölf gesetzliche Feiertage Brandenburgs einschließlich der beweglichen Oster- und Pfingsttage.

## Validierung und technische Absicherung

**Angebunden:**

- Monat wird über zwölf feste Select-Einträge angeboten; die Jahresauswahl enthält beim Start das aktuelle Jahr plus/minus zwei Jahre.
- Monat und Jahr werden nach Aktivierung eines Plans gesperrt.
- Bemerkungen sind im Eingabefeld auf 40 Zeichen begrenzt.
- Die Rufbereitschaftsauswahl filtert auf `Erzieher`.
- SQLite-Eindeutigkeitsregeln begrenzen Planeinträge und Rufbereitschaften.
- Löschen eines bereits in Plänen verwendeten Teammitglieds wird in dessen Repository blockiert; dadurch bleiben die in der Planungsseite verwendeten Personen-IDs erhalten.

**Nicht vorhanden oder nicht durchgängig angebunden:**

- Die Dienstplan-IPC-Handler und Repositories prüfen Plan-ID, Monat, Jahr, Titel und die übergebenen Änderungsobjekte nicht fachlich oder per Laufzeit-Schema.
- Die Erzieher-Regel für Rufbereitschaft wird nur durch die Auswahloberfläche umgesetzt, nicht nochmals im Main-Prozess oder durch einen Datenbankbezug auf die Teamtabelle.
- `validateBemerkungLaenge()` ist implementiert und getestet, wird in der Planungsseite aber nicht aufgerufen; angebunden ist nur die gemeinsame Längenkonstante über `maxLength`.
- Eintrags-Snapshots werden im Main-Prozess ungeprüft aus dem Renderer übernommen.

## Fehler-, Leer- und Ladezustände

Alle erkennbaren Bridge-Aufrufe der Planungsseite und ihrer Auswahlkomponenten besitzen einen `.catch()` mit einem fachlich formulierten Text. `fehlerMelder()` protokolliert den Fehler und reicht ihn an den global in `App` eingebundenen `FehlerHinweis` weiter. Dieser zeigt höchstens die drei jüngsten Meldungen, ergänzt die technische Ursache und bleibt bis zum manuellen Schließen sichtbar.

Es gibt keine eigenen Ladeindikatoren, Sperrzustände oder Erfolgsmeldungen für Erstellen, Laden, Speichern oder Löschen. Während eines laufenden Aufrufs ist im untersuchten Code auch keine Mehrfachauslösung gesperrt. Ob dies praktisch zu wahrnehmbaren Zwischenzuständen oder konkurrierenden Aktionen führt, ist ohne Ausführung nicht bestätigt.

Erkennbare Leerzustände sind:

- Vorschautabelle ohne aktiven Plan;
- leere Planliste im Ladedialog;
- leere Eintrags- oder Rufbereitschaftszellen;
- Listenoptionen „Kein Eintrag“ und „Keine Rufbereitschaft“ zum Entfernen.

Für eine nicht gefundene Plan-ID beim Laden gibt es keinen eigenen Fehler- oder Leerzustand. Bei einer fehlgeschlagenen Mitarbeiterliste bleibt `teamMembers` leer und die globale Fehlermeldung wird ausgelöst.

## Gemeinsame Komponenten

Die Seite verwendet die projektweiten Button-, Card-, Input-, Select-, Dialog-, AlertDialog- und Popover-Primitives. `planAnsicht.ts` bündelt die gemeinsame Datumsformatierung, Spaltenbreiten, Wochenend-/Feiertagsklassen und Mitarbeiterfarbstile von `PlanungsGrid` und `VerkuerzteAnsicht`. `FehlerHinweis` ist global und nicht auf die Planungsseite beschränkt. Die eigentliche Auswertung ist als angebundener `AuswertungDialog` vorhanden und erhält ebenfalls den aktuellen Entwurf; ihre Detailanalyse gehört zum Auswertungsbereich.

## Automatisierte Tests im Repository

Die Tests wurden für diese Analyse nicht ausgeführt. Statisch vorhanden sind:

- umfangreiche Repository-Tests für Erstellen, mehrere Pläne desselben Monats, Laden, gemeinsames Speichern, Ersetzen/Entfernen von Einträgen und Rufbereitschaften, Bemerkungen, Eindeutigkeitsregel und kaskadierendes Löschen;
- Unit-Tests für Kalendertage und Feiertage, Auswertungskennzahlen, Zeitformatierung, Rundung, Planeintrags-Schlüssel, Snapshot-/Entwurfsbildung, mitarbeiterabhängige Arbeitszeit, Soll-Ist-Farbe und Bemerkungslänge;
- ein IPC-Vertragstest für deklarierte und registrierte Kanäle;
- ein E2E-Drucktest, der über die Oberfläche einen Plan erstellt und in die Druckvorschau wechselt. Ein Fall für alle Tage des Monats ist ausdrücklich mit `it.fails` als bekannter Mangel markiert.

Für `PlanPage`, `PlanungsGrid`, `VerkuerzteAnsicht` und `DienstplanLadenDialog` existieren keine eigenen Komponenten-Tests. Das vorhandene `window.api`-Fake bildet die planbezogenen Methoden ab, ist im untersuchten Stand aber nicht durch einen Planungsseiten-Test verwendet.

## Vorhanden, aber nicht erkennbar angebunden

- `validateBemerkungLaenge()` besitzt Unit-Tests, die Planungsseite nutzt aber nur `MAX_BEMERKUNG_LAENGE`.
- Der Drucktest ruft Electron `webContents.printToPDF()` aus dem Test heraus auf; der sichtbare „Drucken“-Button selbst hat keinen Handler.

## Ohne Ausführung nicht abschließend bestätigbar

- tatsächliches Sticky-, Scroll-, Fokus- und Popover-Verhalten der großen Tabelle;
- korrekte visuelle Priorität der Farbflächen und Punktindikatoren;
- Verhalten eines geladenen Plans, dessen Jahr außerhalb der beim Seitenstart gebildeten Auswahlliste liegt;
- Reaktionsverhalten bei langsamen oder mehrfach ausgelösten IPC-Aufrufen;
- praktische Druckdarstellung der verkürzten Ansicht; der Quellcode hält den sichtbaren Button deaktiviert und der vorhandene E2E-Test dokumentiert einen erwarteten fehlenden Monatstag;
- vollständige Tastatur- und Screenreader-Bedienbarkeit der verschachtelten Tabellen-, Popover- und Dialogstrukturen.
