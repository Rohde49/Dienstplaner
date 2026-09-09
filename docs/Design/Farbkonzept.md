Das konkrete Farbkonzept steht. Wir verwenden hauptsächlich die vorhandenen Tailwind-Farben und geben ihnen semantische Rollen. Dadurch bleiben Komponenten konsistent und Farben werden nicht überall einzeln festgelegt. Tailwind CSS v4 stellt seine Palette als CSS-Variablen bereit; eigene semantische Farbnamen können darauf aufbauen. [Tailwind-Dokumentation: Colors](https://tailwindcss.com/docs/colors) und [Theme variables](https://tailwindcss.com/docs/theme).

## 1. Neutrale Grundfarben

| Rolle                 | Tailwind-Klasse    | Verwendung                             |
| --------------------- | ------------------ | -------------------------------------- |
| Anwendungshintergrund | `bg-slate-50`      | Hintergrund der gesamten Anwendung     |
| Hauptfläche           | `bg-white`         | Seiten, Dialoge und Karten             |
| Abgesetzte Fläche     | `bg-slate-100`     | Tabellenköpfe und berechnete Bereiche  |
| Standardrahmen        | `border-slate-200` | Eingabefelder, Tabellen und Karten     |
| Starker Rahmen        | `border-slate-300` | deutliche Abgrenzungen                 |
| Primärer Text         | `text-slate-900`   | Überschriften und wichtige Inhalte     |
| Sekundärer Text       | `text-slate-600`   | Beschreibungen und Zusatzinformationen |
| Zurückhaltender Text  | `text-slate-500`   | Hinweise und Metadaten                 |
| Deaktivierter Inhalt  | `text-slate-400`   | nicht verfügbare Funktionen            |

## 2. Primärfarbe und Auswahl

| Zustand              | Tailwind-Klasse          |
| -------------------- | ------------------------ |
| Primäre Schaltfläche | `bg-blue-600 text-white` |
| Hover                | `bg-blue-700`            |
| Gedrückt             | `bg-blue-800`            |
| Dezente blaue Fläche | `bg-blue-50`             |
| Ausgewählte Fläche   | `bg-blue-100`            |
| Auswahlrahmen        | `border-blue-600`        |
| Auswahltext          | `text-blue-900`          |
| Link oder Textaktion | `text-blue-700`          |

Eine ausgewählte Tabellenzelle erhält beispielsweise einen hellblauen Hintergrund und einen deutlich blauen Rahmen. Dadurch ist der Auswahlfokus nicht nur durch eine leichte Farbänderung erkennbar.

## 3. Statusfarben

| Status                     | Hintergrund     | Rahmen               | Text/Symbol        |
| -------------------------- | --------------- | -------------------- | ------------------ |
| Information                | `bg-sky-50`     | `border-sky-200`     | `text-sky-800`     |
| Erfolg                     | `bg-emerald-50` | `border-emerald-200` | `text-emerald-800` |
| Warnung                    | `bg-amber-50`   | `border-amber-300`   | `text-amber-900`   |
| Fehler                     | `bg-red-50`     | `border-red-200`     | `text-red-800`     |
| Gefährliche Aktion         | `bg-red-600`    | –                    | `text-white`       |
| Gefährliche Aktion – Hover | `bg-red-700`    | –                    | `text-white`       |

Die Statusfarbe wird immer durch einen Text oder ein Symbol ergänzt, beispielsweise:

* Häkchen und „Gespeichert“
* Warndreieck und konkrete Warnmeldung
* Fehlersymbol und Fehlerbeschreibung

## 4. Farben im Dienstplan

| Element                   | Gestaltung                               |
| ------------------------- | ---------------------------------------- |
| Normaler Kalendertag      | weißer Hintergrund                       |
| Wochenende                | `bg-slate-100`                           |
| Feiertag                  | `bg-red-50` mit Kennzeichnung „Feiertag“ |
| Zelle beim Hover          | `bg-blue-50`                             |
| Ausgewählte Zelle         | `bg-blue-100 border-blue-600`            |
| Berechneter Bereich       | `bg-slate-50` oder `bg-slate-100`        |
| Fehlender Eintrag         | Amber-Hinweis mit Symbol                 |
| Widersprüchlicher Eintrag | roter Rahmen mit Fehlersymbol            |
| Ungespeicherte Änderungen | Amber-Hinweis mit erklärendem Text       |

Falls ein Feiertag auf ein Wochenende fällt, besitzt die Feiertagsdarstellung Vorrang.

## 5. Mitarbeiterfarben

Für Mitarbeiter verwenden wir helle Hintergrundfarben mit dunklem Text:

| Farbe      | Hintergrund     | Rahmen              | Text              |
| ---------- | --------------- | ------------------- | ----------------- |
| Himmelblau | `bg-sky-100`    | `border-sky-300`    | `text-sky-900`    |
| Violett    | `bg-violet-100` | `border-violet-300` | `text-violet-900` |
| Türkis     | `bg-teal-100`   | `border-teal-300`   | `text-teal-900`   |
| Orange     | `bg-orange-100` | `border-orange-300` | `text-orange-900` |
| Rosa       | `bg-pink-100`   | `border-pink-300`   | `text-pink-900`   |
| Limette    | `bg-lime-100`   | `border-lime-300`   | `text-lime-900`   |
| Indigo     | `bg-indigo-100` | `border-indigo-300` | `text-indigo-900` |
| Cyan       | `bg-cyan-100`   | `border-cyan-300`   | `text-cyan-900`   |

Die Mitarbeiterfarbe sollte hauptsächlich im Mitarbeiterkopf, am Namen oder als Farbstreifen erscheinen. Sie füllt nicht unnötig die gesamte Dienstplanzeile aus.

## 6. Verbindliche Farbregeln

* Farben werden nach ihrer Bedeutung eingesetzt, nicht nur nach ihrem Aussehen.
* Blau kennzeichnet zentrale Aktionen und Auswahlen.
* Rot wird ausschließlich für Fehler und gefährliche Aktionen verwendet.
* Statusinformationen werden nie nur durch Farbe vermittelt.
* Mitarbeiterfarben dienen ausschließlich der Zuordnung.
* Für Texte auf hellen Flächen werden dunkle Farbstufen verwendet.
* Warnflächen verwenden dunklen Text statt weißem Text auf Gelb.
* Konkrete Farbkombinationen werden bei der Implementierung auf ausreichenden Kontrast geprüft.
* Farben werden global definiert und nicht innerhalb einzelner Komponenten wiederholt.

Als Nächstes können wir daraus die **globale Farb-Basis mit semantischen Variablen** wie `background`, `surface`, `primary`, `warning` und `danger` ableiten.
