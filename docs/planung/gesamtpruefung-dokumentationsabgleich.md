# Gesamtprüfung: Dokumentationsabgleich

## Status

- **Status:** Offene Befundliste
- **Ursprünglicher Abgleich:** 19. September 2026, Commit `51ff908`
- **Letzte Fortschreibung:** 19. September 2026, 14:20 Uhr
- **Zeitzone:** Europe/Berlin
- **Offene Befunde:** 10 von ursprünglich 13

Die Fortschreibung vom 19. September 2026 ordnet Zukunftsvorhaben und
abgeschlossene Planungsunterlagen eindeutig ein. Dadurch sind M-06, M-07 und
N-02 erledigt. Die übrigen Befunde wurden dadurch nicht inhaltlich geprüft
oder verändert.

## Zusammenfassung

Geprüft wurde der Stand von `main` bei Commit `51ff908` am 19. September 2026.
Einbezogen wurden `src/`, `tests/`, die zentralen Projekt-, Build- und
Paketierungskonfigurationen sowie die aktuelle Dokumentation unter `docs/`.
`docs/referenzen/altsystem/` wurde ausschließlich als historisches
Referenzmaterial behandelt und nicht als Anforderung verwendet.

Die implementierten Fachregeln für Kalender, Zeitwerte, Planungseinträge,
Monatskennzahlen, Soll/Ist, Snapshots und die reguläre JSON-Datenhaltung stimmen
weitgehend mit den zuständigen Fach- und Feature-Dokumenten überein. Die
wesentlichen offenen Abweichungen betreffen Daten- und Release-Versionierung,
die tatsächlich ausführbare UI-/Electron-Testabdeckung, Auslieferung und
Lizenzierung, einzelne Fehler- und Barrierefreiheitszusagen sowie veraltete
Planungsstände.

Die vier vorhandenen Projektprüfungen wurden für diesen Abgleich ausgeführt:

- `npm test`: erfolgreich, 27 Testdateien und 355 Tests,
- `npm run typecheck`: erfolgreich,
- `npm run lint`: erfolgreich,
- `npm run format:check`: erfolgreich.

`npm run package` und `npm run make` wurden nicht ausgeführt, damit diese
Dokumentationssitzung keine Build-Artefakte verändert. Vorhandene Dateien unter
`out/` wurden nur lesend betrachtet. Relative Markdown-Verweise in der
verbindlichen Dokumentation wurden geprüft; es wurden keine gebrochenen Ziele
gefunden.

## Nach Priorität sortierte Übersicht

| Priorität | Befunde       | Davon offen | Kernauswirkung                                                                                                                                       |
| --------- | ------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hoch      | H-01 bis H-04 | 4           | Nicht erfüllter Mindest-Testumfang, ungeklärte Datenmigration, nicht aktuell nachgewiesene Auslieferung und offene rechtliche Auslieferungsgrundlage |
| Mittel    | M-01 bis M-07 | 5           | Widersprüchliche Zeitregel, mögliche Teilzustände beim Löschen, rohe Fehlermeldungen, farbabhängige Statusinformation und Testlücken                 |
| Niedrig   | N-01 bis N-02 | 1           | Abweichende Farbpflege                                                                                                                               |

## Hohe Priorität

- [ ] **H-01 – Dokumentation beschreibt noch nicht umgesetztes Verhalten: Der geforderte UI- und Electron-Kernablauf ist nicht automatisiert vorhanden.**
  - **Betroffener Bereich:** Teststrategie, Benutzerabläufe, Verlustschutz und Barrierearmut.
  - **Priorität / mögliche Auswirkung:** Hoch. Fehler in gerenderten React-Komponenten, Fokusführung, Dialogverkettung, Tastaturbedienung oder im echten IPC-/Fensterablauf können von der vollständig grünen Testsuite unentdeckt bleiben.
  - **Dokumentierte Aussage:** `docs/qualitaet/teststrategie.md:57-74` fordert Interaktionstests für sichtbares Komponentenverhalten und mindestens einen durchgängigen Kernablauf in der tatsächlich gebauten Electron-Anwendung.
  - **Tatsächlicher Stand:** `vitest.config.mts:3-8` verwendet ausschließlich die Node-Umgebung und `tests/unit/**/*.test.ts`. `tests/unit/planner/plannerWorkflow.test.ts:1-22` und `:70-90` verbinden Repository und reine Zustandsfunktionen direkt, rendern aber weder React noch starten sie Electron. `tests/unit/mainWindow.test.ts` arbeitet mit Electron-Mocks.
  - **Abweichung:** Der als Mindestumfang beschriebene reale Anwendungsablauf ist kein Bestandteil der ausführbaren Testsuite. Vorhanden ist ein wertvoller isolierter Integrationsablauf, aber kein UI- oder gebauter Electron-End-to-End-Test.
  - **Empfehlung:** **Quellcode prüfen.** Einen kleinen, stabilen Testumfang für kritische gerenderte Interaktionen und einen echten gebauten Electron-Kernablauf festlegen und umsetzen; falls dies bewusst nur manuell erfolgen soll, die Teststrategie entsprechend eindeutig anpassen.

- [ ] **H-02 – Fehlende oder unklare Dokumentation: Für Schemawechsel und vorhandene Benutzerdaten fehlt eine Migrations- beziehungsweise Kompatibilitätsstrategie.**
  - **Betroffener Bereich:** Datenmodell, Datenhaltung, Versionierung und spätere Programmupdates.
  - **Priorität / mögliche Auswirkung:** Hoch. Nach einer ausgelieferten Aktualisierung können Daten einer älteren Schema-Version vollständig als ungültig gelten, obwohl das Produktziel dauerhafte lokale Daten vorsieht.
  - **Dokumentierte Aussage:** `docs/projekt/zielbild-und-rahmenbedingungen.md:51-58` verlangt dauerhaft erhaltene gespeicherte Daten. `docs/architektur/datenhaltung.md:71-83` beschreibt strikte Vollvalidierung, legt aber weder Migrationen noch unterstützte Vorgängerversionen oder ein Upgrade-Verfahren fest.
  - **Tatsächlicher Stand:** `src/shared/schemas/employee.ts:72-78`, `src/shared/schemas/entryType.ts:215-221` und `src/shared/schemas/monthlyPlanStorage.ts:5-11` akzeptieren jeweils ausschließlich `schemaVersion: 3`. `tests/unit/employees/employeeSchema.test.ts:87-119` und `tests/unit/entry-types/entryTypeSchema.test.ts:241-276` sichern die Ablehnung älterer Versionen ausdrücklich ab.
  - **Abweichung:** Die technische Versionsgrenze ist eindeutig, das gewünschte Verhalten beim Update einer bestehenden Installation jedoch nicht entschieden oder dokumentiert.
  - **Empfehlung:** **Fachliche Entscheidung treffen.** Vor der Auslieferung festlegen, ob alte Daten migriert, nur bestimmte Vorgängerversionen unterstützt oder bewusst abgelehnt werden; anschließend Datenhaltung, Tests und Releaseprozess konsistent dokumentieren.

- [ ] **H-03 – Dokumentation beschreibt noch nicht umgesetztes Verhalten: Die Auslieferung des aktuellen Stands ist nicht nachgewiesen.**
  - **Betroffener Bereich:** Paketierung, Installer, Versionierung und Auslieferungsabnahme.
  - **Priorität / mögliche Auswirkung:** Hoch für eine Weitergabe. Eine grüne Quellcodeprüfung belegt weder Paketinhalt noch Installation, Start, Deinstallation oder Datenerhalt der tatsächlich ausgelieferten Anwendung.
  - **Dokumentierte Aussage:** `docs/projekt/zielbild-und-rahmenbedingungen.md:62-71` verlangt die Auslieferung über einen Installer. `docs/planung/roadmap.md:22-29` führt Paketierung, Installer und Prüfung auf einem geeigneten System als aktuellen Schwerpunkt.
  - **Tatsächlicher Stand:** `package.json:4-12` definiert Version `1.0.0` sowie `package`- und `make`-Skripte; `forge.config.ts:7-13` konfiguriert ASAR und Squirrel. Das lokal vorhandene, ignorierte Artefakt `out/make/squirrel.windows/x64/Dienstplaner-1.0.0 Setup.exe` stammt vom 18. August 2026 und liegt damit vor den aktuellen Funktionsänderungen und dem geprüften Commit vom 18. September 2026. Ein automatisierter Paket-/Installer-Smoke-Test und eine dauerhafte Release- oder Versionsrichtlinie sind nicht vorhanden.
  - **Abweichung:** Die technische Grundlage ist vorhanden, aber der Installer belegt nicht den aktuellen Stand. Außerdem bleibt unklar, wann die Produktversion erhöht wird und welche Prüfungen einen auslieferbaren Build kennzeichnen.
  - **Empfehlung:** **Quellcode prüfen.** In einer eigenen Auslieferungssitzung `package` und `make` für den aktuellen Commit ausführen, Paketinhalt sowie Installieren, Starten, Aktualisieren, Deinstallieren und Datenerhalt prüfen und das Ergebnis mit Commit und Version dokumentieren.

- [ ] **H-04 – Dokumentation beschreibt noch nicht umgesetztes Verhalten: Die bestätigte proprietäre Ausrichtung ist technisch und rechtlich noch nicht umgesetzt.**
  - **Betroffener Bereich:** Lizenzierung, Fremdlizenzen, Anwendungshinweise und Installer.
  - **Priorität / mögliche Auswirkung:** Hoch vor kommerzieller oder breiter externer Auslieferung; für eine rein interne Entwicklungsfassung derzeit geringer.
  - **Dokumentierte Aussage:** `docs/planung/zukunft/umsetzungsplan-proprietaere-lizenzierung.md` kennzeichnet die Umstellung ausdrücklich als offen und führt die noch offenen Lizenz-, Hinweis-, UI-, Paketierungs- und Prüfschritte auf. `docs/planung/roadmap.md:42-52` ordnet sie als spätere Erweiterung ein.
  - **Tatsächlicher Stand:** `package.json:25` nennt weiterhin `MIT`. Im Projektstamm fehlen die im Plan vorgesehenen Dateien `LICENSE`, `THIRD_PARTY_NOTICES` und ein Projekt-`README.md`; `forge.config.ts:7-13` nimmt dafür keine eigenen Ressourcen auf.
  - **Abweichung:** Dies ist kein versteckter Widerspruch, sondern ein korrekt dokumentierter, aber auslieferungsrelevanter Sollstand. Eine breit verteilte aktuelle Version würde die bestätigte proprietäre Zielrichtung noch nicht widerspruchsfrei abbilden.
  - **Empfehlung:** **Fachliche Entscheidung treffen.** Vor einer entsprechenden Auslieferung Rechteinhaber, Empfängerkreis und Nutzungsumfang bestätigen und danach den vorhandenen Umsetzungsplan vollständig abarbeiten.

## Mittlere Priorität

- [ ] **M-01 – Bestätigter Widerspruch: Negative gespeicherte Minutenwerte sind zugleich verboten und vorgesehen.**
  - **Betroffener Bereich:** Fachregel für Zeitwerte und manueller Zeitübertrag.
  - **Priorität / mögliche Auswirkung:** Mittel. Die widersprüchliche Grundregel kann bei späteren Validierungen, Importen oder Berechnungen zu einer falschen Ablehnung gültiger Zeitüberträge führen.
  - **Dokumentierte Aussage:** `docs/fachlichkeit/berechnungen/zeitbasis-und-rundung.md:9-18` erlaubt negative Minutenwerte ausschließlich für berechnete Differenzen. Dagegen erlaubt `docs/features/auswertung.md:84-103` ausdrücklich negative, im Monatsplan gespeicherte manuelle Zeitüberträge.
  - **Tatsächlicher Stand:** `src/shared/schemas/monthlyPlan.ts:136-153` definiert den gespeicherten Zeitübertrag als vorzeichenbehafteten sicheren Ganzzahlwert bis `Number.MIN_SAFE_INTEGER`; die Schema- und Entwurfstests decken negative Werte ab.
  - **Abweichung:** Der Code und das Auswertungsfeature sind untereinander konsistent, die übergreifende Zeitbasis formuliert die zulässigen Ausnahmen jedoch zu eng.
  - **Empfehlung:** **Dokumentation anpassen.** Negative Werte auch für ausdrücklich vorzeichenbehaftete gespeicherte Fachwerte wie den manuellen Zeitübertrag zulassen und von nichtnegativen Arbeitszeitdauern abgrenzen.

- [ ] **M-02 – Bestätigter Widerspruch: Ein fehlgeschlagenes Planlöschen kann einen technischen Teilzustand hinterlassen.**
  - **Betroffener Bereich:** Datenhaltung, Fehler- und Wiederherstellungsverhalten beim Löschen.
  - **Priorität / mögliche Auswirkung:** Mittel. Bei einem einseitigen Dateisystemfehler kann nach einer als fehlgeschlagen gemeldeten Löschung nur noch Haupt- oder Sicherungsdatei vorhanden sein; der nächste Ladevorgang kann dadurch einen anderen Wiederherstellungsstatus zeigen.
  - **Dokumentierte Aussage:** `docs/architektur/datenhaltung.md:144-153` behandelt Haupt- und Sicherungsdatei beim Löschen gemeinsam in einem serialisierten Vorgang. `docs/qualitaet/teststrategie.md:166-181` verlangt, dass ein fehlgeschlagener Vorgang keinen teilweise gespeicherten Zustand hinterlässt.
  - **Tatsächlicher Stand:** `src/main/storage/monthlyPlansRepository.ts:333-357` löscht beide Dateien parallel mit zwei unabhängigen `rm`-Aufrufen in `Promise.all`. Schlägt genau einer davon fehl, wird der andere nicht zurückgerollt. Die Repositorytests prüfen erfolgreiches Löschen und „nicht gefunden“, aber keinen einseitigen Löschfehler.
  - **Abweichung:** Die Zugriffe sind serialisiert, das Dateipaar wird beim Löschen jedoch nicht als wiederherstellbare Einheit behandelt. Diese Aussage ist aus dem Fehlerpfad des Codes abgeleitet; ein entsprechender Laufzeitfehler wurde in dieser Sitzung nicht künstlich ausgelöst.
  - **Empfehlung:** **Quellcode prüfen.** Gewünschte Fehlersemantik festlegen und durch einen gezielten Fehlerfalltest absichern; je nach Entscheidung Löschablauf, Wiederholbarkeit oder Dokumentation der verbleibenden Datei anpassen.

- [ ] **M-03 – Bestätigter Widerspruch: Technische Fehlermeldungen werden in mehreren Bereichen ungefiltert als einzige Erklärung angezeigt.**
  - **Betroffener Bereich:** Team, Eintragsarten, Planladen/-speichern und allgemeines Fehlerverhalten.
  - **Priorität / mögliche Auswirkung:** Mittel. IPC-, Zod- oder Dateisystemdetails können unverständlich in der Oberfläche erscheinen und die dokumentierte handlungsorientierte Rückmeldung verfehlen.
  - **Dokumentierte Aussage:** `docs/oberflaeche/gestaltungsgrundsaetze.md:208-225` und `docs/features/planungsseite.md:438-446` verlangen verständliche, ursachennahe Meldungen; technische Rohmeldungen dürfen nicht die einzige Erklärung sein.
  - **Tatsächlicher Stand:** `src/renderer/features/team/TeamPage.tsx:20-24`, `src/renderer/features/entry-types/EntryTypesPage.tsx:38-55`, `src/renderer/features/planner/LoadMonthlyPlanDialog.tsx:44-45` und `src/renderer/features/planner/PlannerPage.tsx:84-87,258-265` übernehmen bei jedem `Error` unmittelbar `error.message`. Nur der PDF-Export besitzt in `src/renderer/features/planner/plannerPdfExport.ts:48-70` eine gezielte Übersetzung technischer Fehler.
  - **Abweichung:** Für die meisten IPC-Vorgänge ist die technische Meldung zugleich die einzige sichtbare Erklärung; eine konsistente Übersetzung oder ein ergänzender benutzerbezogener Kontext fehlt.
  - **Empfehlung:** **Quellcode prüfen.** Eine kleine gemeinsame Fehlerübersetzung für erwartbare Fehlerklassen einführen und technische Details höchstens ergänzend behandeln.

- [ ] **M-04 – Bestätigter Widerspruch: Zielstatus freier Tage wird in der Auswertung nur über Farbe vermittelt.**
  - **Betroffener Bereich:** Auswertungsdialog, Gestaltungsgrundsätze und Barrierearmut.
  - **Priorität / mögliche Auswirkung:** Mittel. Benutzer ohne zuverlässige Farbwahrnehmung erhalten für „unter Ziel“, „Ziel erreicht“ und „über Ziel“ keine gleichwertige Statusangabe.
  - **Dokumentierte Aussage:** `docs/oberflaeche/gestaltungsgrundsaetze.md:99-123` und `:242-253` verlangen, Statusfarben durch Text, Symbol oder Struktur zu ergänzen. `docs/features/auswertung.md:124-134` definiert die Ampellogik und hält zugleich fest, dass der feste Zielwert `2` nicht zusätzlich angezeigt wird.
  - **Tatsächlicher Stand:** `src/renderer/features/planner/EvaluationDialog.tsx:55-74` gibt in den drei Frei-Zeilen nur den Ist-Zähler aus. `:128-168` übersetzt den Vergleich ausschließlich in gelbe, grüne oder rote CSS-Klassen; es gibt dort weder sichtbaren Statustext noch einen entsprechenden zugänglichen Namen.
  - **Abweichung:** Zahl und Zeilenname bleiben sichtbar, der eigentliche Vergleichsstatus und bei Wochenendtagen sogar der zugrunde liegende Zielwert sind jedoch nur über die Farbe erkennbar.
  - **Empfehlung:** **Quellcode prüfen.** Zielwert oder Vergleichsstatus sichtbar beziehungsweise mindestens assistiv verfügbar ergänzen und die Feature-Dokumentation anschließend auf dieselbe Darstellung bringen.

- [ ] **M-05 – Dokumentation beschreibt noch nicht umgesetztes Verhalten: Wichtige Persistenz- und Nebenläufigkeitstests fehlen.**
  - **Betroffener Bereich:** Mitarbeiter- und Eintragsarten-Repositories, IPC-Grenzen und serialisierte Zugriffe.
  - **Priorität / mögliche Auswirkung:** Mittel. Regressionen bei vollständigen Stammdatenschreibvorgängen, Reihenfolge, IPC-Registrierung oder tatsächlich konkurrierenden Änderungen werden nicht gezielt erkannt.
  - **Dokumentierte Aussage:** `docs/qualitaet/teststrategie.md:40-55` nennt Stammdatenkonsistenz, Erhaltung von Reihenfolgen und serielles Verarbeiten konkurrierender Änderungen als besonders wichtige Integrationstests.
  - **Tatsächlicher Stand:** Die Suite enthält `tests/unit/storage/jsonFileStore.test.ts` und `tests/unit/monthly-plan/repository.test.ts`, aber keine Repositorytests für `src/main/storage/employeesRepository.ts` oder `src/main/storage/entryTypesRepository.ts` und keine Tests der drei fachlichen IPC-Registrierungen. Die vorhandenen `Promise.all`-Verwendungen in Tests dienen dem Aufräumen beziehungsweise paralleler Plananlage, prüfen aber keine definierte Reihenfolge konkurrierender Updates.
  - **Abweichung:** Die gemeinsame Speichertechnik und das Monatsplan-Repository sind gut abgesichert; die dokumentierte Breite für Stammdaten, IPC und Nebenläufigkeit wird trotzdem nicht erreicht.
  - **Empfehlung:** **Quellcode prüfen.** Wenige risikobasierte Repository-/IPC-Tests ergänzen, insbesondere für Reihenfolge, Sicherungswiederherstellung und zwei gleichzeitig angestoßene Änderungen.

- [x] **M-06 – Möglicherweise veralteter Planungs- oder Statushinweis: Der Planungsseitenplan bezeichnet die fertige Seite weiterhin als Platzhalter.**
  - **Betroffener Bereich:** Funktionsumfang, Roadmap und Planungsdokumentation.
  - **Priorität / mögliche Auswirkung:** Mittel. Eine neue Sitzung kann den vollständigen Funktionsblock fälschlich erneut als offen einstufen.
  - **Ursprünglich dokumentierte Aussage:** `docs/planung/abgeschlossen/umsetzungsplan-planungsseite.md` sprach von noch offener Arbeit und bezeichnete die Renderer-Ansicht im Präsens als Platzhalter. Im selben Dokument waren alle Abschlussbedingungen erfüllt, und `docs/planung/roadmap.md:13-20` führte die Planungsseite als abgeschlossen.
  - **Tatsächlicher Stand:** `src/renderer/features/planner/PlannerPage.tsx`, `PlanningTable.tsx`, `PlannerCellPopovers.tsx`, `EvaluationDialog.tsx` und die zugehörigen Tests enthalten die abgeschlossenen Vorschau-, Verwaltungs-, Bearbeitungs-, Speicher-, Auswertungs- und Schutzabläufe.
  - **Abweichung:** Ein früherer Ausgangsstand steht im Präsens neben dem späteren Abschlussstatus und widerspricht sowohl Code als auch Roadmap.
  - **Empfehlung:** **Dokumentation anpassen.** Den Absatz ausdrücklich als historischen Ausgangsstand kennzeichnen oder in Vergangenheitsform setzen; die abgeschlossene Prüfliste kann erhalten bleiben.
  - **Erledigt am 19. September 2026, 14:20 Uhr:** Der Plan liegt nun unter `docs/planung/abgeschlossen/`, besitzt eindeutige Abschlussmetadaten und kennzeichnet den Platzhalter ausdrücklich als damaligen Ausgangsstand.

- [x] **M-07 – Quellcode ist weiter als die Dokumentation: Kompaktansichtsunterlagen behandeln den PDF-Export noch als späteren deaktivierten Platzhalter.**
  - **Betroffener Bereich:** Kompaktansicht, PDF-Export und Planungsstatus.
  - **Priorität / mögliche Auswirkung:** Mittel. Die widersprüchlichen Gegenwartsformulierungen erschweren die Entscheidung, ob Export und PDF-Abnahme noch ausstehen.
  - **Ursprünglich dokumentierte Aussage:** `docs/planung/abgeschlossen/umsetzungsplan-kompaktansicht.md` bezeichnete den PDF-Export als später und den Export-Platzhalter als weiterhin deaktiviert. `docs/planung/abgeschlossen/abstimmung-kompaktansicht.md` enthielt denselben früheren Stand. Demgegenüber erklärten `docs/features/pdf-export.md` und `docs/planung/abgeschlossen/umsetzungsplan-pdf-export.md` den Export für umgesetzt und abgenommen.
  - **Tatsächlicher Stand:** `src/renderer/features/planner/PlannerPage.tsx:741-773` zeigt die aktive Exportaktion, `src/main/ipc/registerPdfExportIpcHandlers.ts` erzeugt und schreibt die PDF, und `tests/unit/pdf-export/` prüft Exportvertrag, Dialog, Handler und UI-Zustandslogik.
  - **Abweichung:** Die historischen Planungsunterlagen sind als solche nachvollziehbar, verwenden aber unmarkierte Gegenwarts- und Zukunftsformulierungen, die dem aktuellen Code und der aktuellen Feature-Dokumentation widersprechen.
  - **Empfehlung:** **Dokumentation anpassen.** Frühere Ausgangslagen als historischen Stand kennzeichnen und direkte Statusaussagen auf die aktuelle Feature-Dokumentation beziehungsweise Roadmap verweisen lassen.
  - **Erledigt am 19. September 2026, 14:20 Uhr:** Beide Kompaktansichtsunterlagen liegen nun unter `docs/planung/abgeschlossen/`, besitzen eindeutige Abschlussmetadaten und erklären die Exportaussagen ausdrücklich als historischen Stand. Die aktuelle PDF-Feature-Dokumentation ist direkt verknüpft.

## Niedrige Priorität

- [ ] **N-01 – Bestätigter Widerspruch: Semantische Farben werden nicht durchgängig zentral gepflegt.**
  - **Betroffener Bereich:** Gestaltungsgrundsätze, Planungstabelle und Auswertung.
  - **Priorität / mögliche Auswirkung:** Niedrig bis mittel. Anpassungen an Kontrast oder Farbbedeutung können mehrere verstreute Komponenten erfordern und dabei inkonsistent werden.
  - **Dokumentierte Aussage:** `docs/oberflaeche/gestaltungsgrundsaetze.md:99-123` verlangt zentrale konkrete Farben und eine Trennung semantischer Statusfarben von Mitarbeiterfarben.
  - **Tatsächlicher Stand:** Die globalen Komponenten verwenden überwiegend `app-*`-Tokens aus `src/renderer/styles/index.css`. `src/renderer/features/planner/PlanningTable.tsx:43-57,89-115,204-213` und `src/renderer/features/planner/EvaluationDialog.tsx:118-137,462-535` verwenden daneben direkte Tailwind-Farben wie `red`, `green`, `blue`, `orange`, `amber` und `slate` für fachliche Zustände und Flächen.
  - **Abweichung:** Der zentrale Ansatz ist vorhanden, wird in den komplexen Planungsansichten aber nicht konsequent eingehalten. Feste Schwarz-/Weiß-/Druckfarben des A4-Dokuments sind davon getrennt zu bewerten.
  - **Empfehlung:** **Quellcode prüfen.** Wiederkehrende semantische Anwendungsfarben zentralisieren oder in der Gestaltungsdokumentation klar festlegen, welche dokument- beziehungsweise featuregebundenen Farben bewusst direkt bleiben.

- [x] **N-02 – Fehlende oder unklare Dokumentation: Statusverantwortung und Wegweiser stimmen nicht mit dem tatsächlichen Dokumentbestand überein.**
  - **Betroffener Bereich:** Dokumentationsstruktur und Pflegeprozess.
  - **Priorität / mögliche Auswirkung:** Niedrig. Die Unklarheit begünstigt genau die festgestellten veralteten Statusformulierungen.
  - **Ursprünglich dokumentierte Aussage:** `docs/README.md` legte den Implementierungsstand ausschließlich in die Roadmap und schloss kurzlebige Aufgabenlisten aus dauerhafter Dokumentation aus. Gleichzeitig führte der Wegweiser mehrere abgeschlossene Abstimmungs- und Umsetzungspläne, aber nicht alle vergleichbaren Dokumente auf.
  - **Tatsächlicher Stand:** Mehrere Dateien unter `docs/planung/` besitzen eigene Statusabschnitte, aktuelle Checkboxen und Abschlussnachweise. Zwei vorhandene Planungsdateien fehlen im Wegweiser, während vergleichbare abgeschlossene Dateien aufgeführt sind.
  - **Abweichung:** Es ist nicht eindeutig, ob Planungsdateien dauerhafte Abschlussnachweise, historische Protokolle oder aktuelle Statusquellen sind. Dadurch konkurrieren Roadmap, Statusabschnitte und Checklisten miteinander.
  - **Empfehlung:** **Dokumentation anpassen.** Eine einheitliche Regel festlegen: Roadmap als einzige aktuelle Statusquelle, abgeschlossene Pläne klar als historische Nachweise markieren und den Wegweiser entweder vollständig oder bewusst kategorisiert führen.
  - **Erledigt am 19. September 2026, 14:20 Uhr:** `docs/README.md` kategorisiert nun aktuellen Stand, Zukunftsvorhaben und abgeschlossene Planung vollständig. Die Unterordner erklären ihre Zuständigkeit; Statusmetadaten und die alleinige Statusverantwortung der Roadmap sind verbindlich festgehalten.
