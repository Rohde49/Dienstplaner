# Quellcodeanalyse der Auswertung

## Einordnung und Nachweisgrenze

Diese Analyse beschreibt ausschließlich den statisch erkennbaren Stand des Altsystem-Quellcodes am Commit `255036d0d95fa7fbf53e354a36680a08ee4719c1`. Die Anwendung und ihre Tests wurden nicht ausgeführt. Aussagen zu Darstellung, Fokusführung, Scrollverhalten und praktischer Bedienbarkeit sind daher keine Laufzeitbestätigung.

Die Auswertung ist im untersuchten Stand keine eigene Route. `App.tsx` registriert nur Start-, Team-, Eintrags- und Dienstplanroute. `PlanPage.tsx` bindet `AuswertungDialog` direkt ein und öffnet ihn über einen Button im Kopfbereich der Planungsseite.

Übergreifende Grundlagen stehen in:

- [Architektur und Navigation](../uebergreifend/architektur-und-navigation.md)
- [Datenmodell und Datenhaltung](../uebergreifend/datenmodell-und-datenhaltung.md)
- [Berechnungen](../uebergreifend/berechnungen.md)
- [Fehlerbehandlung und Validierung](../uebergreifend/fehlerbehandlung-und-validierung.md)
- [Komponenten und Tests](../uebergreifend/komponenten-und-tests.md)

## Zweck und angebundene Bestandteile

Eindeutig angebunden sind:

- `PlanPage.tsx` als Eigentümer des Dialogzustands und der auszuwertenden Entwurfsdaten,
- `AuswertungDialog.tsx` als vollständige tabellarische Ansicht,
- `shared/auswertung.ts` als reine Berechnungs- und Formatierungslogik,
- `shared/kalendertage.ts`, `shared/time.ts`, `shared/rundeAufVolleMinute.ts` und `shared/planeintragSchluessel.ts` als Hilfsfunktionen,
- `renderer/src/lib/sollIstFarbe.ts` für die farbliche Kennzeichnung der Soll-Ist-Differenz sowie
- `PlanungsGrid.tsx` und `VerkuerzteAnsicht.tsx` als weitere Nutzer von Teilmengen derselben Kennzahlen.

Für die Auswertung existieren weder eine eigene Persistenzschicht noch eigene IPC-Kanäle. Sie wird synchron im Renderer aus bereits geladenen beziehungsweise dort bearbeiteten Daten berechnet.

## Sichtbare Ansicht und Bedienablauf

Der Button „Auswertung“ ist deaktiviert, solange `aktiverDienstplan` `null` ist. Bei einem aktiven Plan setzt er `auswertungOffen` auf `true`. `AuswertungDialog` erhält dabei:

- die aktuell in `PlanPage` geladenen Teammitglieder,
- die aus ausgewähltem Monat und Jahr berechneten Kalendertage,
- die zum aktiven Plan gehörenden `Dienstplantag`-Datensätze,
- den aktuellen Planeintragsentwurf und
- den aktuellen Rufbereitschaftsentwurf.

Der Dialog zeigt eine Tabelle mit einer festen linken Kennzahlenspalte und einer Wertespalte je Teammitglied mit Rolle `Erzieher`. Praktikanten und Wirtschaftskräfte werden herausgefiltert. Kopfzeile und erste Spalte sind sticky; der Tabellenbereich ist bei Platzmangel als horizontal und vertikal scrollbarer Container angelegt. Die Schließen-Funktion stammt aus der gemeinsam verwendeten Radix-Dialog-Komponente.

Die Werte beruhen auf dem aktuellen React-Entwurf. Änderungen an Planeinträgen oder Rufbereitschaften können daher bereits vor dem Speichern in die nächste Berechnung eingehen. Bemerkungen werden dem Dialog nicht übergeben und sind kein Berechnungseingang.

## Zustände und Zustandswechsel

`PlanPage` hält lediglich den booleschen Zustand `auswertungOffen`; der Dialog selbst hält keinen fachlichen Zustand. Seine Kennzahlen werden mit `useMemo` aus den Props abgeleitet. Eine Änderung an Teammitgliedern, Kalendertagen, Dienstplantagen, Planeintragsentwurf oder Rufbereitschaftsentwurf erzeugt eine neue Kennzahlen-Map.

Der Dialog kann nur über einen aktiven Dienstplan geöffnet werden. Im Quellcode existiert keine eigene Ladeanzeige für die Auswertung. Ohne Erzieher bleibt statisch eine Tabelle mit der Kennzahlenspalte, aber ohne Mitarbeiter-Wertespalten erkennbar; ein gesonderter Leerzustand ist nicht implementiert.

## Datenzuordnung

`berechneKennzahlenFuerMitarbeiter()` ordnet zuerst jedes Datum einer `Dienstplantag.id` zu. Planeinträge werden über den zusammengesetzten String-Schlüssel aus `dienstplantagId` und `teamMemberId` gelesen. Rufbereitschaften werden als Zuordnung von `String(dienstplantagId)` zu einer Mitarbeiter-ID übergeben.

Kalendertage ohne zugehörigen `Dienstplantag` werden in der mitarbeiterbezogenen Schleife übersprungen. Die allgemeine Anzahl Arbeitstage wird dagegen direkt aus der vollständigen Kalendertagsliste berechnet.

Die beteiligten Typen und ihre Speicherung sind zentral in [Datenmodell und Datenhaltung](../uebergreifend/datenmodell-und-datenhaltung.md) beschrieben.

## Statisch erkennbare Berechnungen

Die UI zeigt 15 Zeilen. Der untersuchte Code berechnet sie beziehungsweise die zusätzliche Rasterkennzahl wie folgt:

| Wert im Code                                | Statisch erkennbare Regel                                                                                                                              |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| SN/F-Dienste                                | Einträge mit Kürzel `SN/F` **oder** `SN` werden gezählt.                                                                                               |
| Freie Tage                                  | Jeder Eintrag mit Kürzel `/` wird gezählt; dieser Wert erscheint nur im Planungsraster.                                                                |
| Freie Samstage                              | Eintrag `/` an einem Samstag.                                                                                                                          |
| Freie Sonntage                              | Eintrag `/` an einem Sonntag; ein Feiertag an einem anderen Wochentag wird von dieser Zählung nicht erfasst.                                           |
| Gearbeitete Stunden an Sonntagen/Feiertagen | Summe `arbeitszeitOhneNachtbereitschaftMinuten` an Sonntagen oder gesetzlichen Feiertagen.                                                             |
| Arbeitszeit gesamt                          | Je Eintrag `arbeitszeitOhneNachtbereitschaftMinuten + nachtbereitschaftMinuten`. Das Feld `arbeitszeitMinuten` wird von dieser Funktion nicht gelesen. |
| Nachtbereitschaft gesamt                    | Summe `nachtbereitschaftMinuten`.                                                                                                                      |
| Stunden ohne Nachtbereitschaft gesamt       | Summe `arbeitszeitOhneNachtbereitschaftMinuten`.                                                                                                       |
| Nachtarbeit gesamt                          | Summe `nachtarbeitMinuten`.                                                                                                                            |
| Nachtzuschlag                               | 20 Prozent der monatlichen Nachtarbeit, danach auf volle Minuten gerundet.                                                                             |
| Nachtbereitschaftszuschlag                  | 25 Prozent der monatlichen Nachtbereitschaft, danach auf volle Minuten gerundet.                                                                       |
| Rufbereitschaften                           | Anzahl der Tage, deren Entwurfszuordnung der Mitarbeiter-ID entspricht.                                                                                |
| Arbeitstage                                 | Montag bis Freitag, sofern der Tag kein gesetzlicher Feiertag ist.                                                                                     |
| Ist-Arbeitszeit                             | Arbeitszeit ohne Nachtbereitschaft plus gerundeter Nachtbereitschaftszuschlag.                                                                         |
| Soll-Arbeitszeit                            | Arbeitstage mal individuelle Wochenarbeitszeit, geteilt durch fünf und anschließend gerundet.                                                          |
| Differenz Soll/Ist                          | Ist minus Soll.                                                                                                                                        |

Positive Differenzen werden mit `+`, negative mit dem typografischen Minus `−` und der exakte Ausgleich als `0:00` formatiert. Zeitwerte erscheinen über `formatMinutesToHHMM()` als Stunden und Minuten. Die Farbfunktion liefert bei exakt null `text-primary`, sonst `text-warning`.

Weitere Einzelheiten und gemeinsam verwendete Rechenbausteine stehen in [Berechnungen](../uebergreifend/berechnungen.md).

## Laden, Speichern und Datenänderungen

Der Dialog selbst lädt und speichert nichts. Seine Eingaben stammen aus `PlanPage`:

- Teammitglieder werden beim Mounten der Planungsseite über `window.api.team.list()` geladen.
- Ein aktiver Plan wird samt Tagen sowie separat geladenen Planeinträgen und Rufbereitschaften in Entwurfsobjekte überführt.
- Änderungen im Raster verändern diese Entwurfsobjekte lokal.
- Erst `PlanPage.handleSpeichern()` sendet Differenzen zur Baseline über `dienstplan:speichernPlanungsstand` an Main-Prozess und SQLite.

Damit ist die Auswertung an die aktuelle Planungsseite angebunden, besitzt aber keine eigene Datenhaltung.

## Validierung, Fehler- und Leerzustände

Die Berechnungsfunktion validiert ihre Eingaben nicht zur Laufzeit. Sie setzt typkonforme, nichtnegative Minutenwerte und zueinander passende IDs voraus. `formatMinutesToHHMM()` wirft bei negativen oder nicht ganzzahligen Minutenwerten; im Dialog gibt es dafür keine lokale Fehlerbehandlung.

Bridge-Fehler beim vorgelagerten Laden werden von `PlanPage` über den globalen `FehlerHinweis` gemeldet. Innerhalb des Dialogs gibt es keinen eigenen Fehlerzustand. Für fehlende Erzieher oder vollständig leere Plandaten existiert keine besondere Erläuterung; die Berechnung ergibt je nach Eingaben Nullwerte oder es fehlen Wertespalten.

## Automatisierte Tests im Repository

Vorhanden und unmittelbar einschlägig sind:

- `shared/auswertung.test.ts`: Arbeitstage, Zählungen, Rollenzuordnung über IDs, fehlende Dienstplantage, Monatssummen, Zuschläge, Ist/Soll/Differenz und Differenzformatierung,
- `shared/kalendertage.test.ts`: Monatslängen, Wochentage sowie feste und bewegliche Feiertage,
- `shared/rundeAufVolleMinute.test.ts` und `shared/time.test.ts`: Rundung, Parsing und Formatierung,
- `renderer/src/lib/sollIstFarbe.test.ts`: Farbklasse für Ausgleich und positive/negative Abweichung,
- `renderer/src/lib/planeintragSnapshot.test.ts`: Entstehung der berechneten Eingabewerte und Überführung persistierter Einträge in den Entwurf.

Ein eigener Komponententest für `AuswertungDialog` oder ein UI-Test für das Öffnen und Schließen des Dialogs ist im untersuchten Stand nicht vorhanden. Die E2E-Dateien prüfen Start, Prozessgrenze, einen Team-Persistenzdurchstich und die Druckausgabe, nicht die 15-Zeilen-Auswertung selbst. Tests wurden für diese Analyse nicht ausgeführt; beschrieben wird nur ihr Quellcode.

## Nicht abschließend statisch bestätigbar

- Ob der Radix-Dialog praktisch Fokus korrekt setzt und zurückgibt, lässt sich ohne Ausführung nicht bestätigen.
- Ob die Tabelle bei allen realen Teamgrößen und Fenstermaßen lesbar scrollt, ist statisch nicht abschließend bestimmbar.
- Ob live veränderte Entwurfswerte in jeder Bedienreihenfolge sichtbar aktualisiert werden, ist aus der Datenbindung plausibel ableitbar, wurde hier aber nicht praktisch geprüft.
- Ob persistierte Daten ausschließlich gültige und miteinander konsistente Werte enthalten, wird durch die Auswertungsfunktion selbst nicht abgesichert.

Vorhandenen, aber nicht erkennbar angebundenen Auswertungscode gibt es nicht: `AuswertungDialog`, die Berechnungsfunktion und die Farbfunktion besitzen jeweils sichtbare Aufrufstellen. Die vorhandenen Testdateien sind jedoch kein Beleg dafür, dass die Tests an diesem Commit tatsächlich erfolgreich laufen.
