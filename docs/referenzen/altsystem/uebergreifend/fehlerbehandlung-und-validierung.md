# Fehlerbehandlung und Validierung

## Validierung im Renderer

Die erkennbaren Eingabeprüfungen liegen als reine Funktionen unter `renderer/src/lib/` und werden von den Verwaltungsformularen beziehungsweise Planungszellen verwendet.

### Teammitglieder

`validateTeamMemberInput()` prüft:

- Vorname und Name nach Trimmen auf nicht leer,
- Rolle gegen die drei bekannten Rollen,
- Wochenarbeitszeit auf endlich und größer als null,
- Farbe gegen die vorgegebene Palette.

Die Wochenarbeitszeit muss laut dieser Funktion nicht ausdrücklich ganzzahlig sein. Die Formularanalyse des Features beschreibt zusätzlich die Konvertierung der Texteingabe.

### Eintragsdefinitionen

`validateEintragsdefinitionInput()` prüft:

- Kürzel und Name auf nicht leer,
- Berechnungsart gegen `fest` und `mitarbeiterabhaengig`,
- optionale Uhrzeiten auf das Format `HH:MM` und den Bereich `00:00` bis `23:59`,
- alle fünf Dauern auf nichtnegative ganze Minuten,
- bei mitarbeiterabhängiger Berechnung alle Dauern auf null sowie Beginn und Ende auf `null`.

Eine Regel, dass Ende nach Beginn liegen muss, ist nicht implementiert.

### Bemerkungen

`validateBemerkungLaenge()` begrenzt Bemerkungen auf 40 Zeichen. Im Planungsraster setzt das Eingabefeld zusätzlich `maxLength=40`.

## Grenze zum Main-Prozess

Die IPC-Handler nehmen TypeScript-typisierte Argumente entgegen und reichen sie direkt an Repositories weiter. Es gibt keine Runtime-Schema-Prüfung, keine erneute Wertebereichsprüfung und keine generelle Autorisierungslogik im Main-Prozess. SQLite enthält für viele fachliche Werte keine Check-Constraints.

Einige Integritätsregeln liegen dennoch tiefer:

- Fremdschlüssel und Eindeutigkeitsbedingungen im Schema,
- transaktionales Speichern und Löschen,
- explizite Nutzungsprüfung vor dem Löschen eines Teammitglieds.

Die Auswahl einer Rufbereitschaft filtert in der UI auf Erzieher; der Handler und die Tabelle prüfen diese Rolle nicht.

## Fehler aus API-Aufrufen

`lib/fehlermeldung.ts` implementiert einen kleinen Publish/Subscribe-Mechanismus. Seiten und Komponenten hängen an Promise-Aufrufe meist `.catch(fehlerMelder('…'))` an. Der Melder:

- schreibt den technischen Fehler nach `console.error`,
- entfernt den Electron-IPC-Rahmen aus einer `Error.message`,
- verteilt einen nutzerbezogenen Text mit Ursache an Abonnenten.

`FehlerHinweis` ist global oberhalb der Routen in `App.tsx` eingebunden. Er zeigt bis zu drei jüngste Meldungen als `role="alert"`, blendet sie nicht automatisch aus und bietet pro Meldung eine Schließen-Schaltfläche.

Da Meldungen ohne aktuellen Abonnenten nur protokolliert und nicht gepuffert werden, erscheint ein Fehler vor dem Mounten des Hinweises später nicht nachträglich in der UI.

## Datenbankstart und Fensterfehler

Kann die Datenbank beim Start nicht geöffnet und vorbereitet werden, zeigt der Main-Prozess eine native Fehlerbox mit Pfad und Ursache und beendet die Anwendung. Fehler beim Öffnen erlaubter externer Weblinks werden nur in der Main-Konsole protokolliert.

`runDbSmokeTest()` liegt nach dem erfolgreichen Öffnen außerhalb eines eigenen Fehlerdialogs. Würde dieser Aufruf statisch betrachtet werfen, ist in diesem Bereich kein lokaler Catch erkennbar.

## Leer- und Sonderzustände

Feature-spezifische Leerzustände sind in den jeweiligen Analysen beschrieben. Übergreifend gilt:

- Listenfunktionen können leere Arrays liefern.
- Ladefunktionen können bei nicht gefundener Dienstplan-ID `null` liefern.
- Aktualisierungsfunktionen besitzen keinen eigenen Not-found-Rückgabetyp.
- Der Auswertungsdialog besitzt keinen gesonderten Leer- oder Fehlerzustand.
- Es gibt keine globale Ladeanzeige und keine zentrale Behandlung mehrfach gleichzeitig laufender Mutationen.

## Testquellen und Nachweisgrenze

Reine Validierungsfunktionen besitzen Unit-Tests. `FehlerHinweis.test.tsx` prüft Anzeige, Bereinigung des IPC-Rahmens, Schließen und einen fehlgeschlagenen Ladevorgang der Teamseite. `schema.test.ts` prüft unter anderem aktivierte Fremdschlüssel. Repository-Tests decken ausgewählte Constraint- und Löschfälle ab.

Die Testdateien wurden nicht ausgeführt. Ob Fehler in sämtlichen realen Bedienabläufen sichtbar und verständlich erscheinen, ist daher nicht bestätigt.
