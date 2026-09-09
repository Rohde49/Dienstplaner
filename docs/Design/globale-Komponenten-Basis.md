Die globale Komponentenbasis wird bewusst klein gehalten. Sie enthält nur wiederverwendbare UI-Bausteine; fachliche Komponenten wie der eigentliche Dienstplan bleiben getrennt.

Radix empfiehlt aktuell das gemeinsame, tree-shakeable Paket `radix-ui`. Dadurch können wir nur die benötigten Primitives importieren, ohne viele einzelne Radix-Pakete verwalten zu müssen. [Radix-Dokumentation](https://www.radix-ui.com/primitives/docs/overview/introduction)

## 1. Einfache Basiskomponenten

Diese Komponenten erstellen und gestalten wir selbst mit React und Tailwind CSS:

| Komponente   | Zweck                                              |
| ------------ | -------------------------------------------------- |
| `Button`     | normale Aktionen                                   |
| `IconButton` | kompakte Aktionen nur mit Symbol                   |
| `Input`      | einzeilige Texteingabe                             |
| `Textarea`   | mehrzeilige Texteingabe                            |
| `FormField`  | Beschriftung, Eingabe, Hilfstext und Fehlermeldung |
| `Card`       | abgegrenzter Inhaltsbereich                        |
| `Panel`      | größere zusammengehörige Seitenfläche              |
| `Badge`      | Status oder kurze Kennzeichnung                    |
| `Alert`      | dauerhaft sichtbare Information oder Warnung       |
| `Spinner`    | laufender Vorgang                                  |
| `EmptyState` | leerer Bereich mit Erklärung und möglicher Aktion  |
| `PageHeader` | Seitentitel, Beschreibung und Hauptaktion          |
| `Toolbar`    | Filter und Aktionen oberhalb einer Ansicht         |
| `Table`      | einfache Verwaltungs- und Auswertungstabellen      |

Der Dienstplan selbst wird keine universelle `Table`-Komponente, sondern eine eigene fachliche Komponente.

## 2. Komponenten auf Basis von Radix UI

| Eigene Komponente | Radix Primitive | Verwendung                                              |
| ----------------- | --------------- | ------------------------------------------------------- |
| `Dialog`          | `Dialog`        | Mitarbeiter oder Planungseintrag anlegen und bearbeiten |
| `ConfirmDialog`   | `AlertDialog`   | Löschen und andere kritische Aktionen bestätigen        |
| `Select`          | `Select`        | Rolle, Eintragsart, Monat oder Jahr auswählen           |
| `DropdownMenu`    | `DropdownMenu`  | zusätzliche Aktionen eines Datensatzes                  |
| `Tooltip`         | `Tooltip`       | Erklärung von Icon-Buttons                              |
| `Popover`         | `Popover`       | kompakte Auswahl innerhalb des Dienstplans              |

Normale Navigation, Buttons, Eingabefelder und Tabellen benötigen kein Radix Primitive.

## 3. Nicht benötigte Radix-Komponenten

Für den Prototyp planen wir zunächst nicht ein:

* `NavigationMenu`
* `Menubar`
* `Accordion`
* `Carousel`
* `Slider`
* `RadioGroup`
* `Switch`
* `Tabs`
* `ScrollArea`
* Radix `Toast`

Falls sich später ein konkreter Anwendungsfall ergibt, können einzelne Komponenten ergänzt werden.

Für Benachrichtigungen verwenden wir ausschließlich **Sonner**. Dadurch existieren nicht zwei konkurrierende Toast-Systeme. Sonner benötigt einen zentralen `Toaster` und stellt anschließend die Funktion `toast()` bereit. [Sonner-Dokumentation](https://github.com/emilkowalski/sonner)

## 4. Button-Varianten

Der globale `Button` erhält vier Varianten:

| Variante    | Verwendung                                               |
| ----------- | -------------------------------------------------------- |
| `primary`   | wichtigste Aktion einer Ansicht                          |
| `secondary` | normale ergänzende Aktion                                |
| `ghost`     | zurückhaltende Aktion, beispielsweise in Werkzeugleisten |
| `danger`    | Löschen oder andere gefährliche Aktion                   |

Größen:

* `default`: 36 Pixel hoch
* `compact`: 32 Pixel hoch
* `icon`: quadratisch für reine Symbolaktionen

Zustände:

* normal
* Hover
* gedrückt
* deaktiviert
* lädt

Während des Ladens bleibt die Breite des Buttons unverändert. Das Symbol wird durch einen Spinner ersetzt und der Button kann nicht erneut ausgelöst werden.

## 5. Formularkomponenten

Jedes Formularfeld folgt derselben Struktur:

```text
Beschriftung
Eingabefeld
Hilfstext oder Fehlermeldung
```

Verbindliche Regeln:

* Beschriftungen stehen oberhalb des Feldes.
* Pflichtfelder werden verständlich gekennzeichnet.
* Fehlermeldungen stehen direkt unter dem betreffenden Feld.
* Fehlermeldungen erklären, was korrigiert werden muss.
* Dialoge besitzen eine primäre und eine sekundäre Abschlussaktion.
* „Speichern“ steht rechts, „Abbrechen“ daneben.
* Enter darf nur speichern, wenn dadurch keine mehrdeutige Aktion entsteht.

## 6. Dialoge

Vorgesehene Größen:

| Größe    | Verwendung                                  |
| -------- | ------------------------------------------- |
| `small`  | kurze Bestätigung                           |
| `medium` | normale Formulare                           |
| `large`  | umfangreichere Formulare oder Informationen |

Jeder Dialog enthält:

* eindeutigen Titel
* bei Bedarf kurze Beschreibung
* Inhalt
* Aktionsbereich
* Möglichkeit zum Abbrechen

Löschbestätigungen verwenden den `ConfirmDialog` und nennen das konkrete Objekt:

> Soll der Mitarbeiter „Max Mustermann“ wirklich gelöscht werden?

## 7. Toasts und Alerts

### Toast

Für kurze Rückmeldungen nach einer Aktion:

* erfolgreich gespeichert
* PDF wurde erstellt
* Daten wurden geladen
* Vorgang ist fehlgeschlagen

### Alert

Für Informationen, die sichtbar bleiben müssen:

* Dienstplan enthält Konflikte
* Daten konnten nicht vollständig geladen werden
* ungespeicherte Änderungen
* Auswertung ist noch unvollständig

Ein Toast ersetzt keine wichtige Fehlermeldung innerhalb eines Formulars.

## 8. Komponentenstruktur

```text
components/
├── ui/
│   ├── Alert
│   ├── Badge
│   ├── Button
│   ├── Card
│   ├── ConfirmDialog
│   ├── Dialog
│   ├── DropdownMenu
│   ├── EmptyState
│   ├── FormField
│   ├── IconButton
│   ├── Input
│   ├── Panel
│   ├── Popover
│   ├── Select
│   ├── Spinner
│   ├── Table
│   ├── Textarea
│   ├── Toast
│   └── Tooltip
└── layout/
    ├── AppShell
    ├── PageHeader
    └── Toolbar
```

Fachliche Komponenten werden außerhalb dieser Basis organisiert, beispielsweise:

```text
features/
├── employees/
├── planning-entries/
└── duty-planner/
```

## 9. Verbindliche Regeln

* Eine UI-Komponente erhält eine klar begrenzte Aufgabe.
* Fachliche Logik gehört nicht in globale UI-Komponenten.
* Gleiche Aktionen verwenden überall dieselbe Variante.
* Icon-Buttons benötigen einen Tooltip oder eine sichtbare Beschriftung.
* Komponenten unterstützen `className`, damit sie erweitert werden können.
* Radix-Komponenten werden zentral gekapselt und nicht direkt über die gesamte Anwendung verteilt.
* Varianten werden zunächst direkt und typisiert umgesetzt.
* Zusätzliche Varianten- oder Klassenbibliotheken werden erst ergänzt, wenn tatsächlich wiederkehrende Komplexität entsteht.

Als Nächstes sollten wir das **visuelle Feedback** konkret festlegen: Welche Rückmeldung erscheint beim Speichern, Laden, Löschen, bei Fehlern, Konflikten und ungespeicherten Änderungen?
