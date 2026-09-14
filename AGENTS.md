# Dienstplaner – Projektanweisungen

## Projektzweck

Dienstplaner ist eine lokale Windows-Desktop-Anwendung zur Erstellung und Verwaltung monatlicher Dienstpläne.

## Quellen und Orientierung

* Der aktuelle Quellcode und die Projektdateien sind die maßgebliche Quelle für den tatsächlichen Implementierungsstand.
* Die Dokumentation unter `docs/` enthält fachliche Anforderungen, Designvorgaben, Berechnungsregeln und weitere Projektentscheidungen.
* Vor Änderungen immer zuerst die bestehende Implementierung und die für die Aufgabe relevante Dokumentation prüfen.
* Bei Widersprüchen zwischen Quellcode und Dokumentation den Widerspruch benennen und nicht stillschweigend auflösen.

## Technologie

* Electron Forge
* Vite
* TypeScript
* React
* Tailwind CSS 4
* Radix UI
* Sonner
* Lucide React
* Zod
* Vitest

## Rahmenbedingungen

* Windows-Desktop-Anwendung.
* Vollständig lokal und offline.
* Keine Serverabhängigkeit.
* Keine lizenzpflichtigen Abhängigkeiten.
* Eine Installation verwaltet eine Wohngruppe.
* Responsivität, Konsistenz und Barrierearmut der Oberfläche erhalten.
* Unnötige Komplexität und Overengineering vermeiden.

## Arbeitsregeln

* Bestehende Architektur, Projektstruktur, Benennung und etablierte Muster beibehalten.
* Bestehende Komponenten, Schemas, Berechnungen und andere geeignete Lösungen wiederverwenden.
* Die kleinste zusammenhängende Änderung bevorzugen, die die Aufgabe vollständig erfüllt.
* Keine nicht angeforderten Refactorings oder sonstigen Änderungen durchführen.
* Abhängigkeiten nur mit ausdrücklicher Zustimmung hinzufügen, entfernen oder aktualisieren.
* Analyse, Prüfung, Review und Planung sind grundsätzlich lesend, solange keine Änderung ausdrücklich beauftragt wurde.
* Keine Commits, Pushes oder sonstigen Änderungen an der Git-Historie ohne ausdrückliche Anweisung.

## Code und Oberfläche

* TypeScript typsicher halten und `any` nur verwenden, wenn es erforderlich ist.
* Code verständlich, wartbar und auf klare Verantwortlichkeiten ausrichten.
* Kommentare nur für nicht unmittelbar erkennbare Absichten, Einschränkungen oder Entscheidungen verwenden.
* Die bestehende Trennung zwischen Main Process, Preload, Renderer und gemeinsam genutztem Code beibehalten.
* Wichtige fachliche Regeln nicht ausschließlich in der Benutzeroberfläche absichern.
* Die Benutzeroberfläche visuell und funktional konsistent halten.
* Informationen nicht ausschließlich über Farbe vermitteln.
* Sichtbare Fokuszustände und grundlegende Tastaturbedienbarkeit erhalten.

## Verifikation

Nach Codeänderungen die für den jeweiligen Umfang relevanten Prüfungen ausführen:

* `npm test`
* `npm run typecheck`
* `npm run lint`
* `npm run format:check`

Nicht behaupten, dass eine Prüfung erfolgreich war, wenn sie nicht tatsächlich ausgeführt wurde.

## Kommunikation

* Beobachtungen, Annahmen und Vorschläge klar voneinander trennen.
* Technische und architektonische Entscheidungen kurz und konkret begründen.
* Geänderte Dateien und ausgeführte Prüfungen nachvollziehbar benennen.