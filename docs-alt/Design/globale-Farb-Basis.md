Wir setzen die globale Farb-Basis als **semantische Farbvariablen** um. Komponenten verwenden dadurch Namen wie `primary`, `danger` oder `surface` statt direkter Farben wie `blue-600`.

Tailwind CSS v4 unterstützt solche CSS-basierten Design-Tokens über `@theme inline`. Dadurch entstehen automatisch Klassen wie `bg-primary`, `text-foreground` oder `border-border`. [Offizielle Tailwind-Dokumentation](https://tailwindcss.com/docs/theme)

```css
@import "tailwindcss";

@theme inline {
  /* Grundflächen */
  --color-background: var(--color-slate-50);
  --color-surface: var(--color-white);
  --color-surface-muted: var(--color-slatelate-100);

  /* Rahmen */
  --color-border: var(--color-slate-200);
  --color-border-strong: var(--color-slate-300);

  /* Texte */
  --color-foreground: var(--color-slate-900);
  --color-foreground-secondary: var(--color-slate-600);
  --color-foreground-muted: var(--color-slate-500);
  --color-foreground-disabled: var(--color-slate-400);

  /* Primärfarbe */
  --color-primary: var(--color-blue-600);
  --color-primary-hover: var(--color-blue-700);
  --color-primary-active: var(--color-blue-800);
  --color-primary-subtle: var(--color-blue-50);
  --color-primary-selected: var(--color-blue-100);
  --color-on-primary: var(--color-white);

  /* Information */
  --color-info: var(--color-sky-600);
  --color-info-subtle: var(--color-sky-50);
  --color-info-border: var(--color-sky-200);
  --color-info-foreground: var(--color-sky-800);

  /* Erfolg */
  --color-success: var(--color-emerald-600);
  --color-success-subtle: var(--color-emerald-50);
  --color-success-border: var(--color-emerald-200);
  --color-success-foreground: var(--color-emerald-800);

  /* Warnung */
  --color-warning: var(--color-amber-600);
  --color-warning-subtle: var(--color-amber-50);
  --color-warning-border: var(--color-amber-300);
  --color-warning-foreground: var(--color-amber-900);

  /* Fehler und gefährliche Aktionen */
  --color-danger: var(--color-red-600);
  --color-danger-hover: var(--color-red-700);
  --color-danger-active: var(--color-red-800);
  --color-danger-subtle: var(--color-red-50);
  --color-danger-border: var(--color-red-200);
  --color-danger-foreground: var(--color-red-800);
  --color-on-danger: var(--color-white);

  /* Deaktivierte Elemente */
  --color-disabled: var(--color-slate-100);
  --color-disabled-border: var(--color-slate-200);

  /* Dienstplan */
  --color-planner-weekend: var(--color-slate-100);
  --color-planner-holiday: var(--color-red-50);
  --color-planner-calculated: var(--color-slate-100);
  --color-planner-hover: var(--color-blue-50);
  --color-planner-selected: var(--color-blue-100);
}

@layer base {
  html {
    color-scheme: light;
  }

  body {
    min-height: 100vh;
    margin: 0;
    background-color: var(--color-background);
    color: var(--color-foreground);
  }
}
```

Beispiele für die spätere Verwendung:

```tsx
<button
  className="
    bg-primary text-on-primary
    hover:bg-primary-hover
    active:bg-primary-active
    disabled:bg-disabled
    disabled:text-foreground-disabled
  "
>
  Speichern
</button>
```

```tsx
<div className="border border-warning-border bg-warning-subtle text-warning-foreground">
  Die Sollarbeitszeit wurde überschritten.
</div>
```

```tsx
<div className="border border-primary bg-planner-selected">
  Ausgewählte Dienstplanzelle
</div>
```

Die Mitarbeiterfarben werden getrennt als zentrale, fest definierte Auswahlpalette verwaltet. Sie sind keine allgemeinen UI-Zustände und gehören deshalb nicht in die semantischen Statusfarben.

Als Nächstes folgt sinnvollerweise die **globale UI-Basis**: Schrift, Abstände, Größen, Rundungen, Schatten, Übergänge und grundlegendes Seitenlayout.
