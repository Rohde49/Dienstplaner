# Architektur, Navigation und Zustandsverwaltung

## Technischer Rahmen

Der untersuchte Commit ist eine lokale Electron-Desktop-Anwendung mit React und TypeScript. `package.json` weist unter anderem Electron 43, React 19, React Router 7, Tailwind CSS 4, Radix UI, Vitest, Playwright und `better-sqlite3` aus. Der Build ist mit `electron-vite` organisiert; `electron-builder.yml` beschreibt einen Windows-Installer.

Die statische Analyse bestätigt keinen erfolgreichen Build oder Anwendungsstart. Abhängigkeiten wurden nicht installiert und vorhandene Skripte wurden nicht ausgeführt.

## Prozessaufteilung

```text
React-Renderer
    │ window.api (Promises)
    ▼
Preload / contextBridge
    │ benannte IPC-Kanäle
    ▼
Main-Prozess / IPC-Handler
    │ Repository-Funktionen
    ▼
lokale SQLite-Datei
```

- Der **Main-Prozess** öffnet die Datenbank, registriert IPC-Handler, verwaltet das Fenster und den Anwendungslebenszyklus.
- Das **Preload-Bundle** exponiert ausschließlich eine typisierte `window.api`-Oberfläche. Ein generischer `ipcRenderer`-Zugriff wird nicht bereitgestellt.
- Der **Renderer** enthält React-Seiten, Komponenten und den lokalen UI-Zustand. Er greift nicht direkt auf `better-sqlite3` zu.
- `src/shared/` enthält Prozess-unabhängige Typen und reine Funktionen, die von mehreren Schichten importiert werden können.

`BrowserWindow` setzt `contextIsolation: true`, `nodeIntegration: false` und `sandbox: true`. Eine Content-Security-Policy im Renderer erlaubt Ressourcen grundsätzlich nur von `self`, Bilder zusätzlich als `data:`. Neue Fenster werden unterdrückt; nur HTTP- und HTTPS-Links werden an das Betriebssystem weitergereicht. Echte Navigationen außerhalb der aktuellen Seite werden verhindert, während Hash-Änderungen für den Router möglich bleiben.

Der Main-Prozess fordert eine Einzelinstanz-Sperre an. Bei einem zweiten Start wird das bestehende Fenster wiederhergestellt beziehungsweise fokussiert. Ob alle Sicherheits- und Lebenszykluspfade praktisch funktionieren, wurde nicht ausgeführt.

## IPC-Vertrag

`src/shared/ipcKanaele.ts` ist die zentrale Liste der Kanalnamen. Für die fünf Bereiche `team`, `eintragsdefinition`, `dienstplan`, `planeintrag` und `rufbereitschaft` existieren passende Preload-Methoden und Handler-Registrierungen.

Die API ist befehlsspezifisch: Listen, Anlegen, Aktualisieren und Löschen bei Stammdaten; Listen, Laden, Anlegen, Speichern eines Planungsstands und Löschen bei Dienstplänen; getrennte Listenabrufe für Planeinträge und Rufbereitschaften. Der Preload enthält keine Fachberechnungen.

## Navigation

Der Renderer verwendet `HashRouter`. `App.tsx` bindet vier Routen ein:

| Route         | Ansicht         | Zweck                                                    |
| ------------- | --------------- | -------------------------------------------------------- |
| `/`           | `StartPage`     | Einstieg mit drei Navigationskarten                      |
| `/team`       | `TeamPage`      | Team-Verwaltung                                          |
| `/eintraege`  | `EintraegePage` | Eintrags-Verwaltung                                      |
| `/dienstplan` | `PlanPage`      | Monatsplan, Planung, Druckvorschau und Auswertungsdialog |

Die „AuswertungsPage“ ist im untersuchten Code keine Route. `AuswertungDialog` wird in `PlanPage` als modales Overlay eingebunden. Team- und Eintragsseite navigieren über ihre Management-Kopfbereiche zurück; die Planungsseite besitzt eine eigene Startseiten-Schaltfläche.

## Zustandsverwaltung

Es gibt keinen zentralen Anwendungsstore und keinen fachlichen React-Context. Jede Seite hält ihren Zustand mit React-Hooks:

- Verwaltungsseiten laden ihre Listen über `window.api`, halten Auswahl, Formularmodus und Dialogzustände lokal und aktualisieren die Liste nach Mutationen.
- `PlanPage` hält Monat, Jahr, Teamliste, aktiven Dienstplan, Dienstplantage, Titel, Ansicht, Dialogzustände sowie Entwurf und Baseline für Planeinträge und Rufbereitschaften.
- Ungespeicherte Änderungen werden in `PlanPage` durch einen Vergleich von Entwurf und Baseline beziehungsweise gespeichertem Titel und Bemerkungen abgeleitet.
- Vor Laden, Neuanlegen oder Rückkehr zur Startseite kann ein Bestätigungsdialog vor Datenverlust warnen.
- `AuswertungDialog`, `PlanungsGrid` und `VerkuerzteAnsicht` erhalten denselben aktuellen Entwurf als Props und leiten daraus ihre Anzeige ab.

Der einzige seitenübergreifende Laufzeitzustand im Renderer ist die einfache Fehlerverteilung in `lib/fehlermeldung.ts`: Funktionen können Meldungen veröffentlichen, `FehlerHinweis` abonniert sie. Einzelheiten stehen in [Fehlerbehandlung und Validierung](./fehlerbehandlung-und-validierung.md).

## Statisch erkennbare Grenzen

- Es existieren keine globalen Lade-, Cache- oder Synchronisationsmechanismen.
- Parallel ausgelöste UI-Aufrufe werden im Renderer nicht über eine zentrale Queue serialisiert.
- Die API-Aufrufe liefern Promises; fachliche Seiten behandeln Erfolg und Ablehnung jeweils lokal beziehungsweise über den globalen Fehlerhinweis.
- Ohne Ausführung kann nicht bestätigt werden, dass Hash-Navigation, Radix-Fokusführung, Fensterbeschränkungen und alle IPC-Aufrufe in der gebauten Anwendung praktisch funktionieren.

## Zugehörige Feature-Analysen

- [Team-Verwaltung](../teamverwaltung/quellcodeanalyse.md)
- [Eintrags-Verwaltung](../eintragsverwaltung/quellcodeanalyse.md)
- [Planungsseite](../planungsseite/quellcodeanalyse.md)
- [Auswertung](../auswertung/quellcodeanalyse.md)
