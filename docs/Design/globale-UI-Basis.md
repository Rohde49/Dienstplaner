Die globale UI-Basis verwendet überwiegend Tailwind-Standardwerte. Eigene Werte führen wir nur ein, wenn sie für den Dienstplaner notwendig sind. Tailwind v4 stellt dafür bereits Variablen für Schrift, Abstände, Rundungen, Schatten und Breakpoints bereit. [Tailwind-Dokumentation: Theme variables](https://tailwindcss.com/docs/theme)

## 1. Typografie

Wir verwenden die Windows-nahe Systemschrift **Segoe UI**. Sie ist lokal verfügbar, benötigt keinen Download und keine zusätzliche Lizenz. Tailwinds Standardschrift `font-sans` enthält Segoe UI bereits.

| Element                  | Tailwind-Klassen                |
| ------------------------ | ------------------------------- |
| Seitentitel              | `text-2xl font-semibold`        |
| Abschnittsüberschrift    | `text-lg font-semibold`         |
| Karten- oder Dialogtitel | `text-base font-semibold`       |
| Standardtext             | `text-sm font-normal`           |
| Hervorgehobener Text     | `text-sm font-medium`           |
| Tabellenkopf             | `text-xs font-semibold`         |
| Hilfs- und Zusatztext    | `text-xs text-foreground-muted` |
| Dienstplaneintrag        | `text-xs font-medium`           |
| Stunden und Zahlenwerte  | zusätzlich `tabular-nums`       |

Es werden hauptsächlich drei Schriftstärken verwendet:

* `font-normal`
* `font-medium`
* `font-semibold`

## 2. Abstände

Grundlage ist das Tailwind-Abstandsraster in Vier-Pixel-Schritten.

| Bereich                            | Abstand            |
| ---------------------------------- | ------------------ |
| Seitenrand, großes Fenster         | `p-6` – 24 Pixel   |
| Seitenrand, kompaktes Fenster      | `p-4` – 16 Pixel   |
| Abstand zwischen Abschnitten       | `gap-6` – 24 Pixel |
| Innenabstand von Karten            | `p-4` – 16 Pixel   |
| Abstand zwischen Formularfeldern   | `gap-4` – 16 Pixel |
| Abstand zusammengehöriger Elemente | `gap-2` – 8 Pixel  |
| Sehr enger Abstand                 | `gap-1` – 4 Pixel  |
| Tabellenzellen                     | `px-2 py-1.5`      |

## 3. Größen von Bedienelementen

| Element                     | Größe               |
| --------------------------- | ------------------- |
| Standardschaltfläche        | `h-9` – 36 Pixel    |
| Kompakte Schaltfläche       | `h-8` – 32 Pixel    |
| Eingabefeld und Auswahlfeld | `h-9` – 36 Pixel    |
| Kompaktes Tabellenfeld      | `h-8` – 32 Pixel    |
| Standardsymbol              | `size-4` – 16 Pixel |
| Größeres Symbol             | `size-5` – 20 Pixel |
| Tabellenzeile               | mindestens 32 Pixel |
| Kopfzeile der Anwendung     | ungefähr 56 Pixel   |

Kompakte Elemente werden hauptsächlich innerhalb des Dienstplans eingesetzt. Verwaltungsansichten verwenden die normalen Größen.

## 4. Rundungen und Rahmen

| Element                   | Gestaltung                    |
| ------------------------- | ----------------------------- |
| Buttons und Eingabefelder | `rounded-md`                  |
| Karten und Bereiche       | `rounded-lg`                  |
| Dialoge                   | `rounded-lg`                  |
| Statuskennzeichnungen     | `rounded-md`                  |
| Kleine Punkte oder Zähler | `rounded-full`                |
| Standardrahmen            | `border border-border`        |
| Deutlicher Rahmen         | `border border-border-strong` |

Große Rundungen und pillenförmige Schaltflächen werden vermieden. Die Anwendung soll wie ein Arbeitswerkzeug wirken.

## 5. Schatten

Schatten werden sparsam eingesetzt:

| Element                       | Schatten                       |
| ----------------------------- | ------------------------------ |
| Normale Karten                | kein Schatten oder `shadow-sm` |
| Dropdown-Menüs und Popover    | `shadow-md`                    |
| Dialoge                       | `shadow-xl`                    |
| Tabellen und Formularbereiche | Rahmen statt Schatten          |

## 6. Übergänge

* Hover- und Farbwechsel: `transition-colors duration-150`
* Öffnen von Menüs und Dialogen: höchstens 200 Millisekunden
* keine federnden oder verspielten Animationen
* keine dauerhaften dekorativen Animationen
* Ladeanimationen nur während eines tatsächlichen Vorgangs

## 7. Responsives Desktop-Verhalten

Die kleinste unterstützte Fenstergröße wird auf ungefähr **1024 × 700 Pixel** festgelegt.

### Ab 1280 Pixel Breite

* vollständige Navigation
* 24 Pixel Seitenabstand
* Aktionen möglichst nebeneinander
* Verwaltungsformulare können mehrspaltig dargestellt werden

### Zwischen 1024 und 1279 Pixel Breite

* kompaktere Navigation
* 16 Pixel Seitenabstand
* Aktionsleisten dürfen umbrechen
* Formulare wechseln bei Bedarf auf eine Spalte

### Dienstplan

* nutzt die verfügbare Fensterbreite
* bleibt in seinen Spalten kompakt
* wird nicht bis zur Unleserlichkeit zusammengedrückt
* erhält bei Platzmangel einen horizontalen Scrollbereich
* wichtige Spalten können später fixiert werden

## 8. Grundlegendes Seitenlayout

Jede Ansicht folgt derselben Struktur:

1. globale Navigation
2. Seitenkopf mit Titel und Hauptaktion
3. optionale Werkzeug- oder Filterleiste
4. eigentlicher Seiteninhalt
5. optionaler Status- oder Hinweisbereich

Verwaltungsseiten dürfen eine begrenzte Inhaltsbreite verwenden. Der Dienstplan und seine Auswertung nutzen dagegen die gesamte verfügbare Breite.

## 9. Globale Basisstile

Die vorhandenen globalen CSS-Regeln werden folgendermaßen ergänzt:

```css
@layer base {
  html {
    color-scheme: light;
  }

  body {
    min-height: 100vh;
    margin: 0;
    background-color: var(--color-background);
    color: var(--color-foreground);
    font-family: var(--font-sans);
    font-size: var(--text-sm);
    line-height: var(--text-sm--line-height);
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }

  button,
  input,
  select,
  textarea {
    font: inherit;
  }
}
```

Damit sind Farbgebung, Typografie, Dichte, Abstände, Größen, Rundungen, Schatten, Übergänge und responsives Verhalten einheitlich festgelegt.

Als Nächstes folgt die **globale Komponentenbasis**. Dabei bestimmen wir, welche wiederverwendbaren Komponenten benötigt werden und welche davon auf Radix UI aufbauen.
