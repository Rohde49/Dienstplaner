# Auslieferung

## Status

- **Status:** Umsetzung läuft
- **Beginn der Abstimmung:** 19. September 2026, 14:47 Uhr
- **Zeitzone:** Europe/Berlin
- **Ausgangsstand:** Commit `5e8a9ce`

Dieses Dokument hält die Entscheidungen, den daraus abgeleiteten
Umsetzungsplan und später die Abnahme der Auslieferung fest. Es beschreibt den
laufenden Arbeitsstand. Dauerhafte Produkt-, Architektur- oder Qualitätsregeln
werden nach ihrer Bestätigung in den jeweils zuständigen Dokumenten gepflegt.

### Umsetzungsstand vom 19. September 2026, 18:37 Uhr

- Die erste Umsetzungsetappe zur Datenzuverlässigkeit und den zugehörigen
  Repository-/IPC-Tests ist mit Commit `9bdcfdd` abgeschlossen.
- Die vereinfachte Darstellung unerwarteter technischer IPC-Fehler, die
  dauerhaften Daten- und Testregeln, die MIT- und Fremdlizenzunterlagen, die
  feste Installer-Identität sowie die Übergabe- und Nachweisvorlagen sind mit
  Commit `e531df4` umgesetzt.
- Commit `6bcefeb` nimmt die Chromium-Lizenz ausdrücklich als installierte
  Ressource auf, nachdem die erste Squirrel-Paketprüfung gezeigt hatte, dass
  die Datei aus dem Programm-Wurzelverzeichnis nicht automatisch in das
  `.nupkg` übernommen wird.
- `npm run licenses:check`, `npm test` mit 32 Testdateien und 381 Tests,
  `npm run typecheck`, `npm run lint`, `npm run format:check` und
  `git diff --check` waren für diesen Arbeitsstand erfolgreich.
- `npm audit --omit=dev` meldete für den abgefragten Stand keine bekannte
  Schwachstelle in den Produktionsabhängigkeiten.
- Paket und Squirrel-Installer wurden aus dem vollständigen Commit
  `6bcefeb3d3133bb2fdb567a4f2c8922e1838a548` erfolgreich für Windows x64
  gebaut. Version, Architektur, ASAR, Squirrel-Metadaten sowie Projekt-,
  Fremd-, Electron- und Chromium-Lizenzdateien wurden kontrolliert. Die
  `Setup.exe` besitzt die SHA-256-Prüfsumme
  `4B9578F356702562D513D26B001A7054C2B771E5607F81797CA027E4C5A84286`.
- Das private Release-Archiv liegt unter
  `E:\Programmieren\Projects\Dienstplaner-Archiv`. Jeremy führt Installation,
  Systemänderungen und die praktische Abnahme anhand der
  [Installations- und Pilotabnahme](../qualitaet/installations-und-pilotabnahme.md)
  selbst durch. Bis zu deren erfolgreichem Abschluss bleibt H-03 offen.

## Ziel

Aus dem bestätigten Quellstand soll eine eindeutig versionierte und geprüfte
Windows-Anwendung entstehen, die über einen Installer an den festgelegten
Empfängerkreis übergeben werden kann. Die Auslieferung umfasst nicht nur das
Erzeugen einer `Setup.exe`, sondern auch die Festlegung des
Auslieferungsrahmens, die Prüfung der Voraussetzungen, die Installation und
den lokalen Betrieb sowie einen nachvollziehbaren Freigabenachweis.

## Vorgehen

1. Begriffe, Bestandteile und Risiken der Auslieferung verständlich einordnen.
2. Den Auslieferungsrahmen festlegen.
3. Versions-, Daten-, Update-, Rechts- und Prüffragen entscheiden.
4. Einen begrenzten technischen Umsetzungsplan erstellen.
5. Den bestätigten Plan in kleinen, überprüfbaren Arbeitspaketen umsetzen.
6. Den erzeugten Release-Kandidaten installieren und abnehmen.
7. Freigabe, Artefakte, Prüfergebnisse und bekannte Einschränkungen
   dokumentieren.

Die Schritte mit fachlichen oder organisatorischen Entscheidungen werden erst
nach ausdrücklicher Bestätigung abgeschlossen. Build- oder
Installationsartefakte werden nicht während der vorgelagerten Analyse erzeugt.

## Bekannter Ausgangsstand

- `package.json` führt das Produkt als `Dienstplaner` in Version `1.0.0`.
- Electron Forge kann eine entpackte Windows-Anwendung paketieren und mit
  Squirrel.Windows einen Installer erzeugen.
- Die Anwendung behandelt die besonderen Squirrel-Startvorgänge bereits beim
  Programmstart.
- Die fachlichen Daten liegen im Windows-Benutzerdatenverzeichnis und nicht im
  Installationsordner.
- Der vorhandene Installer vom 18. August 2026 bildet den aktuellen
  Quellstand nicht ab.
- Eine automatische Veröffentlichung, ein automatischer Programm-Updateablauf
  und eine Codesignierung sind derzeit nicht eingerichtet.
- Für ältere gespeicherte Schema-Versionen ist noch keine Migrations- oder
  Kompatibilitätsstrategie festgelegt.
- Die rechtlichen Voraussetzungen für eine breite oder kommerzielle externe
  Weitergabe sind als späteres Arbeitspaket dokumentiert und noch nicht
  umgesetzt.
- `main` liegt zu Beginn der Abstimmung drei lokale Commits vor `origin/main`.
  Der tatsächlich auszuliefernde Commit wird erst mit dem Release-Kandidaten
  festgelegt.

## Entscheidungen

### Vorbereitender Schritt: Grundlagen der Auslieferung

Die Bestandteile der Auslieferung und die Unterschiede zwischen Quellstand,
Release, Release-Kandidat, Build, Paketierung, Installer, Veröffentlichung,
Programmversion, Datenversion, Codesignierung, Update, Deinstallation und
Freigabenachweis wurden vor dem ersten Entscheidungsblock erläutert.

**Status:** Abgeschlossen.

### Schritt 1: Auslieferungsrahmen

1. **Empfängerkreis:** Die Anwendung bleibt im privaten Kreis. Sie wird nur
   vom Entwickler und dessen Vater verwendet; der Vater ist der Pilotnutzer.
2. **Nutzungsstatus:** Die erste Auslieferung ist eine Pilotversion für eine
   testweise praktische Nutzung und noch keine allgemein produktiv angebotene
   Anwendung.
3. **Anzahl der Installationen und Ausgangsdaten:** Zunächst wird genau eine
   Installation ausgeliefert. Der Installer enthält keine individuell im
   Entwicklungsbetrieb angelegten Stammdaten oder Monatspläne. Bei einer
   erstmaligen Installation ohne vorhandenes Benutzerverzeichnis beginnt die
   Anwendung mit einem leeren fachlichen Bestand, den der Pilotnutzer passend
   für seine Wohngruppe pflegt. Eine erneute Installation auf einem bereits
   verwendeten Windows-Benutzerkonto darf vorhandene Daten nicht
   stillschweigend entfernen.
4. **Arbeitsplatz:** Für den Pilotbetrieb reicht ein fester Haupt-PC. Eine
   Verwendung desselben Datenbestands auf mehreren Arbeitsplatz-PCs ist nicht
   Bestandteil dieser Auslieferung.
5. **Windows-Benutzerkonto:** Die Anwendung wird unter einem festgelegten
   Windows-Benutzerkonto verwendet. Der Datenbestand bleibt diesem Konto
   zugeordnet.
6. **Windows-Version:** Unterstützt und abgenommen wird Windows 11.
7. **Prozessorarchitektur:** Ausgeliefert wird ausschließlich eine
   x64-Version.
8. **Installationsart:** Vorgesehen ist eine benutzerbezogene Installation
   ohne benötigte Administratorrechte.
9. **Übergabeweg:** Die freigegebene `Setup.exe` wird kontrolliert über einen
   USB-Stick übergeben. Der USB-Stick dient nur dem Transport des Installers;
   Anwendung und Daten werden nicht portabel vom Stick betrieben.
10. **Codesignierung:** Die Pilotversion darf unsigniert ausgeliefert werden.
    Mögliche Windows-Sicherheitswarnungen werden in der Installer-Abnahme
    geprüft und dem Pilotnutzer erklärt.
11. **Programmupdates:** Spätere Versionen werden manuell durch einen neuen
    Installer aktualisiert. Ein automatischer Updateweg gehört nicht zu diesem
    Arbeitspaket.
12. **Releaseprozess:** Es wird ein kleiner, dokumentierter und
    wiederholbarer manueller Releaseprozess eingerichtet. Eine automatische
    Build- oder Veröffentlichungspipeline ist nicht vorgesehen.
13. **Pflege und Support:** Fehler können durch spätere manuelle Versionen
    korrigiert werden. Feste Reaktionszeiten, ein garantierter Pflegezeitraum
    oder eine automatische Versorgung mit Aktualisierungen werden nicht
    zugesichert.
14. **Zeitlicher Rahmen:** Es besteht kein festes Auslieferungsdatum. Die
    Auslieferung ist abgeschlossen, wenn der in den Projektdokumenten
    festgelegte Umfang des Prototyps einschließlich Installer und
    Auslieferungsabnahme vollständig erfüllt ist.

**Status:** Am 19. September 2026, 15:25 Uhr bestätigt.

Aus diesen Entscheidungen folgt insbesondere, dass weder eine portable
Programmversion noch Synchronisation, gemeinsamer Mehr-PC-Zugriff oder ein
mobiler Datenbestand auf dem USB-Stick umgesetzt werden. Diese Funktionen
bleiben außerhalb des bestätigten Prototypumfangs.

### Schritt 2: Release- und Versionsregeln

1. **Erste Versionsnummer:** Die erste ausgelieferte Pilotversion trägt die
   technische Versionsnummer `1.0.0`.
2. **Pilotkennzeichnung:** Die technische Versionsnummer bleibt `1.0.0`. Der
   Status als Pilotversion wird im Release-Nachweis und in den
   Übergabeinformationen festgehalten, aber nicht zusätzlich in die
   Programmoberfläche aufgenommen.
3. **Maßgeblicher Quellstand:** Ein Release-Kandidat wird ausschließlich aus
   einem sauberen und vollständig committeten Git-Stand erzeugt.
4. **Entfernter Projektstand:** Der endgültig abgenommene Release-Stand wird
   später zu `origin/main` übertragen. Ein Push erfolgt nur nach
   ausdrücklicher Anweisung.
5. **Git-Kennzeichnung:** Nach erfolgreicher Abnahme erhält der
   Release-Commit den Git-Tag `v1.0.0`.
6. **Spätere Versionsnummern:** Es gilt semantische Versionierung. Kompatible
   Fehlerkorrekturen erhöhen die Patch-Version, neue kompatible Funktionen die
   Minor-Version und grundlegende oder inkompatible Änderungen die
   Major-Version.
7. **Fehlgeschlagene Release-Kandidaten:** Solange `1.0.0` noch nicht
   ausgeliefert wurde, darf ein korrigierter Kandidat erneut als `1.0.0`
   erzeugt werden. Nach der tatsächlichen Übergabe wird eine veränderte
   Fassung niemals unter derselben Versionsnummer ersetzt und erhält
   mindestens `1.0.1`.
8. **Installername:** Der Installer verwendet den Forge-Standard
   `Dienstplaner-1.0.0 Setup.exe`.
9. **Artefaktidentität:** Version, Git-Commit, Erstellungsdatum, Dateiname und
   SHA-256-Prüfsumme der freigegebenen `Setup.exe` werden im Release-Nachweis
   festgehalten.
10. **Übergabeinformation:** Der Pilotnutzer erhält eine kurze verständliche
    Release-Notiz mit Version, Pilotstatus, Installationshinweisen, bekannten
    Einschränkungen und dem manuellen Updateweg.

**Status:** Am 19. September 2026 bestätigt.

### Schritt 3: Benutzerdaten, Updates und Schema-Kompatibilität

1. **Daten für die erste Erprobung:** In der gesamten hier geplanten
   Pilotphase werden ausschließlich erfundene Testdaten verwendet. Reale
   Mitarbeiterdaten sind nicht Bestandteil dieser Auslieferung.
2. **Ausgangszustand:** Die erstmalige Installation beginnt ohne Mitarbeitende,
   Eintragsarten und Monatspläne. Es werden keine Beispiel- oder vorbereiteten
   Nutzerdaten mitgeliefert.
3. **Entwicklungsdaten:** Lokale Entwicklungs- und Testdaten werden niemals in
   Installer oder Release-Artefakte aufgenommen.
4. **Regulärer Speicherort:** Der automatische Speicherort im
   Windows-Benutzerverzeichnis bleibt unverändert. Eine freie Ordnerauswahl
   und ein Datenbestand auf dem USB-Stick gehören nicht zu dieser
   Auslieferung.
5. **Datenbasis von `1.0.0`:** `schemaVersion: 3` ist die erste offiziell
   unterstützte Datenbasis. Ältere interne Schema-Versionen werden nicht
   migriert.
6. **Spätere Versionen:** Die konkrete Kompatibilitäts- und
   Migrationsentscheidung wird bei jeder späteren Version anhand ihrer
   tatsächlichen Datenänderungen getroffen. Keine spätere Version darf
   ausgeliefert werden, ohne vorher ihre Kompatibilität mit dem Datenbestand
   von `1.0.0` zu prüfen.
7. **Sicherung vor Updates:** Vor jedem manuellen Update wird der vollständige
   Ordner `dienstplaner-data` bei geschlossener Anwendung auf einen
   kontrollierten Datenträger kopiert. Die internen `.backup`-Dateien gelten
   nicht als vollständige externe Datensicherung.
8. **Aufbewahrung der Sicherung:** Mindestens eine Sicherung wird getrennt vom
   Haupt-PC auf einem persönlich kontrollierten Datenträger aufbewahrt. Eine
   Sicherung mit realen Mitarbeiterdaten wird nicht unkontrolliert
   weitergegeben.
9. **Deinstallation:** Eine normale Deinstallation soll die Anwendung, aber
   nicht automatisch die fachlichen Daten entfernen. Das tatsächliche
   Verhalten wird mit dem Release-Kandidaten geprüft.
10. **Austausch des Haupt-PCs:** Für einen Gerätewechsel darf der vollständige
    Datenordner bei geschlossener Anwendung kontrolliert gesichert und auf dem
    neuen PC wiederhergestellt werden. Dieser Ablauf wird dokumentiert und
    einmal geprüft; er ist keine laufende Mehr-PC-Nutzung.
11. **Beschädigte oder inkompatible Daten:** Solche Daten werden niemals
    stillschweigend durch einen leeren Bestand ersetzt. Die Dateien bleiben
    erhalten und die Anwendung meldet, dass Unterstützung erforderlich ist.
12. **Löschen der Pilotdaten:** Daten werden nur nach einer ausdrücklichen
    Entscheidung manuell gelöscht. Update und Deinstallation löschen sie
    nicht automatisch.

**Status:** Am 19. September 2026 bestätigt.

### Schritt 4: Lizenzierung und rechtliche Begleitinformationen

1. **Lizenz von `1.0.0`:** Die erste Pilotversion bleibt unter der
   MIT-Lizenz. Die mögliche proprietäre Lizenzierung späterer Versionen bleibt
   ein eigenes zukünftiges Arbeitspaket.
2. **Rechteinhaber:** Als alleiniger Rechteinhaber des selbst entwickelten
   Codes wird `Jeremy Louis Rohde` festgehalten.
3. **Autor- und Kontaktangabe:** Als Autor und Herausgeber wird
   `Jeremy Louis Rohde` verwendet. Eine E-Mail-Adresse wird nicht in die
   Auslieferungsmetadaten aufgenommen.
4. **Eigene Lizenzdatei:** Eine vollständige MIT-`LICENSE` wird im Projekt
   ergänzt und mit der Anwendung ausgeliefert. Im installierten Programmpaket
   wird sie eindeutig von der bereits vorhandenen Electron-Lizenz
   unterschieden.
5. **Fremdlizenzprüfung:** Vor der Auslieferung werden alle tatsächlich
   ausgelieferten Laufzeitabhängigkeiten und ihre Lizenzpflichten ermittelt.
6. **Fremdlizenzhinweise:** Eine geprüfte `THIRD_PARTY_NOTICES`-Datei und die
   erforderlichen Originallizenztexte werden mit der Anwendung ausgeliefert.
7. **Zugänglichkeit:** Lizenz- und Fremdlizenztexte liegen im installierten
   Programmpaket und zusätzlich bei den übergebenen Release-Dateien. Eine
   eigene Seite `Rechtliche Hinweise` in der Programmoberfläche wird für diese
   private Pilotversion nicht umgesetzt.
8. **Installationsort:** Die Pilotversion wird zunächst ausschließlich auf
   einem privaten Test-PC installiert. Eine Installation auf einem
   Arbeitsplatz-PC setzt eine spätere gesonderte Erlaubnis voraus und gehört
   nicht zu dieser Auslieferung.
9. **Verwendete Daten:** Die Pilotversion verwendet ausschließlich erfundene
   Daten. Die Nutzung realer Mitarbeiterdaten ist nicht Bestandteil dieser
   Pilotphase.
10. **Hinweis zur Datenverarbeitung:** Die Übergabeinformation erklärt knapp,
    dass die Anwendung Daten ausschließlich lokal speichert, keine
    Cloudübertragung durchführt und externe Sicherungen ebenfalls die
    eingegebenen Daten enthalten.
11. **Pilotstatus und Support:** Die Release-Notiz nennt den Pilotstatus, die
    fehlenden garantierten Reaktionszeiten und bekannte Einschränkungen. Die
    Rechte aus der MIT-Lizenz bleiben davon unberührt.

**Status:** Am 19. September 2026 bestätigt.

### Schritt 5: Qualitätsgrenze und Freigabekriterien

1. **Hohe Befunde:** Jeder offene Befund hoher Priorität wird vor der
   Freigabe entweder umgesetzt oder durch eine ausdrückliche, dokumentierte
   Entscheidung sachlich geschlossen. Eine begründete Anpassung der
   Dokumentation kann einen Befund schließen, wenn der bestätigte Umfang
   bewusst anders festgelegt wurde.
2. **Mittlere und niedrige Befunde:** Alle verbleibenden Befunde werden noch
   einmal bewertet. Release-relevante Punkte werden behoben; vertretbare
   Restpunkte werden mit Begründung als bekannte Einschränkung dokumentiert.
3. **Automatisierte Quellcodeprüfungen:** `npm test`, `npm run typecheck`,
   `npm run lint`, `npm run format:check` und `git diff --check` müssen auf dem
   endgültigen Release-Stand erfolgreich sein.
4. **UI- und Electron-Prüfung:** Für `1.0.0` wird keine neue umfangreiche
   UI- oder End-to-End-Testinfrastruktur eingerichtet. Stattdessen wird der
   vollständige Kernablauf in der tatsächlich gebauten und installierten
   Electron-Anwendung manuell geprüft und die Teststrategie entsprechend
   eindeutig formuliert.
5. **Release-Kandidat:** Der Kandidat wird erst nach Abschluss der
   erforderlichen Änderungen und erfolgreichen Quellcodeprüfungen aus einem
   sauberen Commit erzeugt.
6. **Kernablauf:** In der installierten Anwendung werden der leere
   Ausgangszustand, das Anlegen von Mitarbeitenden und Eintragsarten, das
   Erstellen, Bearbeiten und Speichern eines Monatsplans, das erneute Laden
   nach einem Neustart sowie Auswertung, Kompaktansicht und PDF-Export geprüft.
7. **Installer-Lebenszyklus:** Installation, erneuter Start, manueller
   Update- beziehungsweise erneuter Installationslauf, Deinstallation und
   anschließende Neuinstallation werden geprüft.
8. **Releasebezogene Datenprüfung:** Geprüft werden Speichern und Laden nach
   einem Neustart, Datenerhalt nach einem erneuten Installerlauf, gewünschter
   Datenerhalt nach der Deinstallation, vollständiges manuelles Kopieren des
   Datenordners und Wiederherstellung dieser Kopie nach einer Neuinstallation.
   Eine Beschädigung der Hauptdatei zum manuellen Auslösen der internen
   `.backup`-Wiederherstellung wird nicht erneut provoziert; hierfür werden die
   vorhandenen automatisierten Tests und früheren Nachweise herangezogen.
9. **Visuelle und grundlegende barrierearme Abnahme:** Geprüft werden die
   kleinste Fenstergröße `1024 × 700`, die normale maximierte Darstellung,
   verständliche Dialoge und Fehlermeldungen, sichtbare Fokuszustände,
   wesentliche Tastaturbedienung sowie konsistente Farben, Buttons und
   Statusanzeigen.
10. **PDF-Abnahme:** Mindestens eine tatsächlich aus der installierten
    Anwendung erzeugte PDF wird technisch und visuell geprüft.
11. **Erstinstallationsumgebung:** Die Erstinstallation wird unter einem
    frischen Windows-Benutzerkonto oder auf einem privaten
    Windows-11-Test-PC ohne vorhandene Dienstplaner-Daten geprüft.
12. **Aufteilung der Abnahme:** Jeremy Louis Rohde führt die technische
    Installer- und Datenprüfung durch. Der Pilotnutzer prüft anschließend
    Verständlichkeit und praktische Bedienung mit erfundenen Daten.
13. **Freigabeblocker:** Möglicher Datenverlust, ein defekter Kernablauf,
    fehlerhafte Installation, eine unbrauchbare PDF oder eine schwerwiegende
    Bedienbehinderung blockieren die Freigabe. Kleine nicht kritische
    Abweichungen werden dokumentiert und einzeln bewertet.
14. **Endgültige Freigabe:** Nach allen Prüfungen wird eine Zusammenfassung
    erstellt. Erst nach ausdrücklicher Bestätigung wird der Installer als
    `1.0.0` freigegeben, mit `v1.0.0` markiert und zur Übergabe vorbereitet.

**Status:** Am 19. September 2026 bestätigt.

### Schritt 6: Installer-Verhalten

1. **Installerformat:** Ausgeliefert wird ausschließlich die von
   Squirrel.Windows erzeugte `Setup.exe`. Ein zusätzlicher MSI-Installer oder
   ein Wechsel der Installertechnik ist nicht vorgesehen.
2. **Installationsablauf:** Die Anwendung wird benutzerbezogen, ohne benötigte
   Administratorrechte und ohne Auswahl eines Installationsordners
   installiert.
3. **Anwendungsidentität:** Für Squirrel und Windows wird eine ausdrückliche,
   über spätere Versionen unveränderte technische Anwendungs-ID festgelegt.
4. **Programmsymbol:** Version `1.0.0` verwendet bewusst die vorhandenen
   Electron- beziehungsweise Atom-Standardsymbole. Ein eigenes
   Dienstplaner-Symbol wird erst in einer möglichen späteren Version
   betrachtet und ist eine bekannte gestalterische Einschränkung der
   Pilotversion.
5. **Verknüpfungen:** Die Installation soll Verknüpfungen im Startmenü und auf
   dem Desktop anlegen. Ihr Verhalten wird bei Installation, Update und
   Deinstallation geprüft.
6. **Erster Start:** Die Anwendung darf nach erfolgreicher Installation
   automatisch starten.
7. **Installeroberfläche:** Der schlichte Squirrel-Standardablauf bleibt
   erhalten. Eine eigene Ladeanimation oder ein mehrseitiger
   Installationsassistent wird nicht umgesetzt.
8. **Dateien für den Pilotnutzer:** Der Übergabe-USB-Stick enthält die
   freigegebene `Setup.exe`, eine kurze Release- und Installationsinformation,
   die Lizenz des Dienstplaners und die Fremdlizenzhinweise.
9. **Interne Squirrel-Artefakte:** `.nupkg` und `RELEASES` werden intern mit
   dem Release-Nachweis aufbewahrt, aber nicht als vom Pilotnutzer
   auszuführende Dateien präsentiert.
10. **Veraltete Artefakte:** Vor dem endgültigen Release-Build wird der
    bisherige Inhalt von `out/` nach erneuter Kontrolle gezielt entfernt,
    damit alte und neue Artefakte nicht vermischt werden.
11. **Manuelles Update:** Eine spätere Version wird über ihre neue `Setup.exe`
    installiert. Anwendungs-ID und Installationsart bleiben gleich; Daten und
    Verknüpfungen werden anschließend geprüft.
12. **Deinstallation:** Die Deinstallation soll Anwendung und Verknüpfungen
    entfernen, den fachlichen Datenordner aber behalten. Eine spätere
    Neuinstallation soll ihn wieder verwenden können. Das tatsächliche
    Verhalten wird mit dem Release-Kandidaten geprüft.
13. **Unsignierter Installer:** Eine auftretende Windows-Sicherheitswarnung
    wird auf dem privaten Test-PC nachvollzogen und in der
    Installationsinformation verständlich beschrieben.

**Status:** Am 19. September 2026 bestätigt.

### Schritt 7: Aufbewahrung und Übergabe

1. **Interne Aufbewahrung:** Zusätzlich zum USB-Stick wird eine unveränderte
   interne Kopie des vollständigen Releases außerhalb des kurzlebigen
   `out/`-Ordners aufbewahrt.
2. **Archivort:** Der private Archivordner ist
   `E:\Programmieren\Projects\Dienstplaner-Archiv` und liegt außerhalb des
   Git-Repositorys. Binärartefakte werden nicht in Git aufgenommen.
3. **Interne Artefakte:** Intern werden `Setup.exe`, `.nupkg`, `RELEASES`,
   Release-Nachweis, Lizenzunterlagen und Prüfsummendatei gemeinsam
   aufbewahrt.
4. **Übergabeordner:** Auf dem USB-Stick liegt ein eindeutig benannter Ordner
   `Dienstplaner-1.0.0-Pilot`, der nur die für den Pilotnutzer vorgesehenen
   Dateien enthält.
5. **Inhalt des Übergabeordners:** Enthalten sind
   `Dienstplaner-1.0.0 Setup.exe`, `LIESMICH.txt`,
   `Dienstplaner-LICENSE.txt`, `THIRD_PARTY_NOTICES.txt`, erforderliche
   weitere Lizenztexte und `SHA256SUMS.txt`. Quellcode, `.nupkg` und
   `RELEASES` werden nicht mitgegeben.
6. **Benutzerinformation:** Die Installations- und Release-Hinweise werden als
   einfache deutsche Textdatei `LIESMICH.txt` bereitgestellt, die ohne
   Zusatzprogramm geöffnet werden kann.
7. **Release-Nachweis:** Der interne Nachweis enthält mindestens Version,
   Git-Commit und Tag, Buildzeitpunkt, Zielsystem, Dateinamen und Prüfsummen,
   automatisierte Prüfungen, manuelle Installer- und Produktabnahme, bekannte
   Einschränkungen und die endgültige Freigabe.
8. **Prüfsumme nach dem Kopieren:** Die SHA-256-Prüfsumme der freigegebenen
   `Setup.exe` wird vor und nach dem Kopieren auf den USB-Stick verglichen.
9. **Windows-Sicherheitsprüfung:** Für die private Pilotübergabe wird kein
   zusätzlicher manueller Scan der `Setup.exe` verlangt. Vorhandener
   Echtzeitschutz wird weder deaktiviert noch umgangen. Der Release-Nachweis
   behauptet daher keinen gesondert ausgeführten Virenscan. Die
   SHA-256-Prüfsumme dient ausschließlich als Identitäts- und
   Übertragungsnachweis und nicht als Beleg für Schadsoftwarefreiheit.
10. **Alte Installer:** Veraltete oder nicht freigegebene Installer werden
    nicht auf dem Übergabe-Stick belassen. Für den Pilotnutzer ist nur die
    freigegebene Version sichtbar.
11. **Benutzerdaten auf dem Stick:** Der Übergabe-Stick enthält keine
    Dienstplaner-Benutzerdaten oder Sicherungen.
12. **Persönliche Übergabe:** Jeremy Louis Rohde führt die erste Installation
    gemeinsam mit dem Pilotnutzer durch, erklärt eine mögliche
    Windows-Warnung und lässt ihn anschließend den vereinbarten Pilotablauf
    selbst bedienen.
13. **Bestätigung des Pilotnutzers:** Datum und Ergebnis der praktischen
    Pilotabnahme werden knapp im Release-Nachweis festgehalten.
14. **Keine öffentliche Bereitstellung:** Version `1.0.0` wird nicht öffentlich
    hochgeladen oder beworben.
15. **Updateprüfung der ersten Version:** Da `1.0.0` die erste unterstützte
    Version ist, gibt es noch keine ältere freigegebene Version für einen echten
    Update-Test. Für `1.0.0` werden daher das erneute Ausführen desselben
    Installers sowie Deinstallation und Neuinstallation einschließlich
    Datenerhalt geprüft. Der erste echte Update-Test wird verpflichtend bei der
    nächsten freizugebenden Version, beispielsweise `1.0.1` oder `1.1.0`, vom
    tatsächlich ausgelieferten Stand `1.0.0` aus durchgeführt.

**Status:** Am 19. September 2026 bestätigt.

### Weitere Entscheidungsschritte

Alle für den Umsetzungsplan vorgesehenen Entscheidungsblöcke sind
abgeschlossen. Neue Entscheidungen werden nur ergänzt, wenn der technische
Ist-Abgleich eine bisher nicht erkennbare wesentliche Alternative oder einen
Widerspruch aufdeckt.

## Umsetzungsplan

Der folgende Plan ist die technische Übersetzung der bestätigten Entscheidungen.
Jeremy Louis Rohde hat ihn nach gemeinsamer Prüfung am 19. September 2026 zur
Umsetzung freigegeben. Die Arbeit erfolgt weiterhin in den beschriebenen kleinen
und überprüfbaren Etappen.

### Technischer Ist-Abgleich

- `package.json` enthält bereits die Version `1.0.0` und die Angabe `MIT`, aber
  noch nicht die bestätigte Autorenangabe `Jeremy Louis Rohde`.
- Electron Forge und der Squirrel-Maker sind bereits eingerichtet. Eine feste
  technische Windows-Anwendungs-ID und ausdrückliche Squirrel-Namenswerte fehlen
  noch.
- Das Paket wird bereits als ASAR erstellt. Ein früheres Prüfpaket enthielt darin
  gebündelte Anwendungsausgaben und keinen offen danebenliegenden Quellcode.
- Es gibt noch keine eigene `LICENSE`, keine gebündelten
  `THIRD_PARTY_NOTICES.txt`, keine versionierte Übergabeinformation und keinen
  vollständigen Release-Nachweis.
- Die automatisierten Tests sind überwiegend Unit-Tests. Der installierte
  Electron-Ablauf wird deshalb wie entschieden als manuelle Release-Abnahme
  behandelt.
- Der bestehende Gesamtprüfungsbericht enthält noch offene Befunde. Die für
  `1.0.0` relevanten Befunde werden vor dem Release umgesetzt, ausdrücklich
  abgeschlossen oder als begründete bekannte Einschränkung freigegeben.

### Arbeitspaket 1: Offene Release-Befunde bereinigen

1. Die Dokumentation zur Zeitbasis wird mit der bereits implementierten
   Ausnahme für übernommene negative Zeitwerte in Einklang gebracht.
2. Das Löschen eines Monatsplans wird so abgesichert und getestet, dass ein
   Teilfehler nicht unbemerkt einen schwer verständlichen Restzustand erzeugt.
3. Bereits verständliche fachliche Fehlermeldungen bleiben erhalten.
   Unerwartete technische Fehler aus Datei-, Validierungs- und IPC-Zugriffen
   erhalten stattdessen eine zum jeweiligen Vorgang passende, verständliche
   Meldung. Das technische Original wird für die Fehlersuche protokolliert,
   aber nicht ungefiltert in der Oberfläche angezeigt. Diese Abgrenzung wurde
   am 19. September 2026 ausdrücklich bestätigt.
4. Die farbliche Kennzeichnung der Freie-Tage-Zielwerte bleibt in `1.0.0`
   bewusst unverändert. Eine zusätzliche Text-, Symbol- oder
   Hilfstechnologie-Kennzeichnung wird nicht ergänzt. Die Abweichung vom
   allgemeinen Gestaltungsgrundsatz wird als ausdrücklich akzeptierte
   Einschränkung der Pilotversion dokumentiert.
5. Für die Datenablagen von Mitarbeitenden und Eintragstypen sowie für relevante
   gleichzeitige Schreibzugriffe werden gezielte Tests ergänzt. Eine neue große
   End-to-End-Testinfrastruktur wird nicht eingeführt.
6. Direkte, funktionsbezogene Farbangaben werden für `1.0.0` nicht pauschal
   umgebaut. Ihr verbleibender geringer Befund wird ausdrücklich bewertet und
   dokumentiert.
7. Der automatisierte Umfang und der verpflichtende manuelle installierte
   Kernablauf werden in der Teststrategie eindeutig getrennt beschrieben.

**Zwischenziel:** Die offenen Befunde sind nicht nur abgehakt, sondern durch
Quellcode, Tests, Dokumentation oder eine ausdrücklich akzeptierte Einschränkung
nachvollziehbar behandelt.

### Arbeitspaket 2: Daten- und Versionsregeln festhalten

1. Die aktuelle `schemaVersion: 3` wird als erster unterstützter Datenstand der
   Version `1.0.0` dokumentiert.
2. Es wird festgehalten, dass vor jeder späteren Freigabe die Verträglichkeit mit
   dem zuletzt wirklich ausgelieferten Datenstand geprüft und bei Bedarf eine
   Migration umgesetzt werden muss.
3. Datensicherung, Wiederherstellung, Neuinstallation, Rechnerwechsel und das
   Verhalten bei beschädigten Daten werden in der Datenhaltungsdokumentation
   entsprechend den bestätigten Entscheidungen beschrieben.
4. Der vorhandene Zukunftsplan für eine mögliche proprietäre Lizenzierung wird
   klargestellt: Die veröffentlichte Version `1.0.0` bleibt dauerhaft unter MIT;
   nur spätere Versionen können unter den dann rechtlich möglichen Bedingungen
   anders lizenziert werden.

### Arbeitspaket 3: Lizenz- und Fremdlizenzunterlagen erstellen

1. Im Projektstamm wird eine vollständige MIT-Datei `LICENSE` mit
   `Copyright (c) 2026 Jeremy Louis Rohde` aufgenommen.
2. Die Autorenangabe in `package.json` wird auf `Jeremy Louis Rohde` ohne
   E-Mail-Adresse korrigiert.
3. Alle tatsächlich für die ausgelieferte Anwendung gebündelten
   Laufzeitabhängigkeiten werden aus dem gesperrten Abhängigkeitsstand ermittelt
   und ihre Lizenzangaben überprüft.
4. Aus dem geprüften Stand wird eine nachvollziehbar reproduzierbare
   `THIRD_PARTY_NOTICES.txt` erzeugt. Ein kleines projektinternes Skript darf
   dafür Erzeugungs- und Prüfmodus bereitstellen; eine neue Abhängigkeit ist
   dafür nicht vorgesehen.
5. Eigene Lizenz und Fremdlizenzhinweise werden als zusätzliche Ressourcen in
   die installierte Anwendung aufgenommen. Die von Electron mitgelieferten
   Electron- und Chromium-Lizenzdateien werden zusätzlich kontrolliert und in
   den Release-Nachweis einbezogen.

### Arbeitspaket 4: Installer eindeutig und stabil konfigurieren

1. Für Squirrel wird der Anwendungsname `Dienstplaner` ausdrücklich
   konfiguriert und für spätere Versionen stabil gehalten.
2. Im Electron-Hauptprozess wird eine feste Windows-App-ID gesetzt, die zur
   Squirrel-Identität passt. Der zugehörige Starttest wird angepasst.
3. Es wird ausschließlich der vorhandene Windows-x64-Squirrel-Installer gebaut.
   Weitere Maker, Code-Signierung, Veröffentlichung und automatische Updates
   werden nicht ergänzt.
4. Das vorhandene Standardsymbol und der schlichte Squirrel-Ablauf bleiben
   bewusst bestehen. Startmenü-, Desktop- und Deinstallationsverhalten werden
   nicht nur aus der Konfiguration abgeleitet, sondern am installierten
   Kandidaten geprüft.

### Arbeitspaket 5: Übergabe- und Nachweisvorlagen vorbereiten

1. Eine versionierte deutsche Vorlage für `LIESMICH.txt` wird erstellt. Sie
   erklärt Installation, unsignierte Windows-Warnung, lokalen Datenspeicher,
   manuelle Updates, Datensicherung, Deinstallation, Pilotstatus, Supportgrenze
   und bekannte Einschränkungen in anfängerfreundlicher Sprache.
2. Eine Vorlage für den internen Release-Nachweis hält Herkunft, Build,
   Prüfsummen, Prüfungen, Abnahmen, Abweichungen und Freigabe fest.
3. Vor dem Build wird gemeinsam ein konkreter privater Archivordner außerhalb
   des Repositorys festgelegt. Weder Binärartefakte noch private Sicherungen
   werden in Git aufgenommen.
4. Die Dokumentationsübersicht und der bestehende Gesamtprüfungsbericht werden
   zunächst nur passend zu tatsächlich erledigten Arbeiten aktualisiert. Der
   vorliegende Plan bleibt während der Umsetzung das führende Protokoll.

### Arbeitspaket 6: Release-Kandidaten im Quellstand absichern

1. Der vollständige Arbeitsbaum wird geprüft, damit keine fremden oder
   unbeabsichtigten Änderungen in den Release-Kandidaten gelangen.
2. Lizenzprüfung, `npm test`, `npm run typecheck`, `npm run lint`,
   `npm run format:check` und `git diff --check` werden erfolgreich
   durchgeführt. Zusätzlich wird der bekannte Sicherheitsstatus der
   Produktionsabhängigkeiten geprüft und als eigener Nachweis dokumentiert;
   Abhängigkeiten werden dabei nicht ohne neue Zustimmung verändert.
3. Vorhandene Unit-Tests werden um die in den vorherigen Arbeitspaketen
   benötigten gezielten Fälle ergänzt.
4. Ein sauberer, eindeutig identifizierbarer Release-Kandidaten-Commit wird erst
   nach Jeremys ausdrücklicher Commit-Freigabe erstellt. Er ist anschließend die
   alleinige Quelle für den finalen Build.

### Arbeitspaket 7: Finalen Installer bauen und technisch prüfen

1. Vor dem finalen Build wird der genaue Inhalt von `out/` noch einmal
   kontrolliert und danach gezielt geleert, damit keine alten Artefakte
   übernommen werden.
2. Aus dem freigegebenen Windows-x64-Quellstand werden zuerst das gepackte
   Programm und anschließend der Squirrel-Installer erzeugt. Der
   Veröffentlichungsbefehl wird nicht verwendet.
3. Paketinhalt, ASAR, Version, Architektur, Dateinamen, eingebettete
   Lizenzunterlagen und Squirrel-Artefakte werden kontrolliert.
4. Für alle aufzubewahrenden Artefakte werden SHA-256-Prüfsummen erzeugt. Erst
   dieser geprüfte Kandidat darf in die manuelle Abnahme gehen.

### Arbeitspaket 8: Installierte Anwendung abnehmen

1. Auf einem frischen Windows-11-Benutzerkonto oder einem entsprechend sauberen
   privaten Test-PC werden Installation ohne Administratorrechte, erster Start,
   Startmenü- und Desktopverknüpfung geprüft.
2. Der vollständige fachliche Kernablauf wird mit ausschließlich erfundenen
   Daten durchgeführt: Stammdaten anlegen, Monatsplan erstellen, bearbeiten,
   speichern, neu öffnen, auswerten, kompakt darstellen und als PDF ausgeben.
3. Neustart der Anwendung und des Rechners, erneutes Ausführen derselben
   `1.0.0`-Installation, Deinstallation und Neuinstallation werden mit Blick auf
   den Datenerhalt geprüft.
4. Eine manuell kopierte Sicherung des gesamten Datenordners wird in einem
   kontrollierten Prüffall wiederhergestellt. Eine absichtliche interne
   Datenbeschädigung gehört nicht zur Pilotabnahme.
5. Sichtbild, Tastaturbedienung, Fokuszustände, verständliche Meldungen und die
   PDF-Ausgabe werden getrennt von den automatisierten Prüfungen beurteilt.
6. Jeremy führt die technische Abnahme durch. Danach bedient der Pilotnutzer den
   vereinbarten Kernablauf selbst; Datum, Ergebnis und Rückmeldungen werden im
   Release-Nachweis festgehalten.
7. Ein echter Update-Test von `1.0.0` auf eine neuere Version wird erst bei deren
   Freigabe durchgeführt und ist dann ein Pflichtbestandteil des betreffenden
   Releases.

### Arbeitspaket 9: Freigeben, archivieren und übergeben

1. Jeder Release-Blocker führt zu einer Korrektur und einem neuen Kandidaten.
   Nicht blockierende Abweichungen werden sichtbar dokumentiert und benötigen
   eine ausdrückliche Bewertung.
2. Nach erfolgreicher technischer und fachlicher Abnahme erhält Jeremy eine
   vollständige Freigabezusammenfassung. Ohne seine ausdrückliche Bestätigung
   werden weder Tag noch Übergabepaket als endgültig bezeichnet.
3. Nach der Freigabe wird der geprüfte Quellcommit mit `v1.0.0` markiert. Ein
   Push erfolgt nur auf eine gesonderte ausdrückliche Anweisung.
4. Der interne Archivsatz und der USB-Ordner
   `Dienstplaner-1.0.0-Pilot` werden aus genau den freigegebenen Dateien
   zusammengestellt. Die Prüfsumme der `Setup.exe` wird nach dem Kopieren auf
   den USB-Stick erneut verglichen.
5. Nach Abschluss werden Plan, Gesamtprüfungsbericht, Dokumentationsübersicht
   und gegebenenfalls die Roadmap mit dem tatsächlichen Ergebnis aktualisiert.
   Die Abschlussdokumentation darf keine Prüfung behaupten, die nicht wirklich
   ausgeführt wurde.

### Vorgeschlagene kleine Umsetzungsetappen

Die Arbeit soll überprüfbar bleiben und wird deshalb nicht als ein großer
Änderungsblock durchgeführt:

1. Datenzuverlässigkeit und zugehörige Tests
2. Fehlermeldungen und barrierearme Zustandskennzeichnung
3. Daten-, Test- und Release-Dokumentation
4. Lizenzunterlagen und Installer-Identität
5. finaler Release-Kandidat, Build, Abnahme und Abschlussnachweis

Nach jeder Etappe werden die dazu passenden Prüfungen ausgeführt und die
Ergebnisse berichtet. Commits werden nur nach ausdrücklicher Anweisung erstellt.

## Abnahme und Abschlussnachweis

Die Version `1.0.0` gilt erst dann als ausgeliefert, wenn alle folgenden
Bedingungen erfüllt und belegt sind:

- der freigegebene Quellstand ist eindeutig durch Commit und Tag bestimmt;
- alle verbindlichen automatisierten Prüfungen sind erfolgreich;
- Lizenz- und Fremdlizenzunterlagen sind vollständig geprüft und enthalten;
- der erzeugte Installer ist technisch kontrolliert und per SHA-256
  identifizierbar;
- Installation, Kernablauf, Datenneustart, erneute Installation,
  Deinstallation, Neuinstallation und Wiederherstellung wurden erfolgreich
  geprüft;
- die manuelle visuelle, barrierearme und PDF-bezogene Abnahme ist erfolgt;
- der Pilotnutzer konnte den vereinbarten Kernablauf ausführen;
- offene Abweichungen und bekannte Einschränkungen wurden ausdrücklich
  akzeptiert;
- Jeremy Louis Rohde hat die endgültige Freigabe ausdrücklich bestätigt;
- interne Archivkopie und USB-Übergabeordner stimmen mit dem freigegebenen
  Nachweis überein.

Nicht Bestandteil von `1.0.0` sind ein eigenes Programmsymbol, Code-Signierung,
automatische Updates, portable USB-Ausführung, Mehrrechnerbetrieb, öffentliche
Veröffentlichung, reale personenbezogene Daten oder eine proprietäre
Lizenzierung. Diese Punkte können später getrennt entschieden werden, ohne den
Pilotumfang nachträglich auszuweiten.
