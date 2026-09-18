# Kalender und Arbeitstage

Dieses Dokument beschreibt die verbindlichen fachlichen Kalenderregeln des
Dienstplaners.

## Kalendergrundlage

- Ein Monatsplan umfasst sämtliche Kalendertage des ausgewählten
  gregorianischen Monats.
- Die Kalendertage werden vollständig, eindeutig und chronologisch geführt.
- Das interne Datumsformat ist `YYYY-MM-DD`.
- Kalendertage werden unabhängig von Uhrzeit, lokaler Zeitzone und Sommerzeit
  bestimmt.
- Samstag und Sonntag gelten als Wochenende.
- Wochenenden und Feiertage bleiben planbar. Sie werden gekennzeichnet und bei
  davon abhängigen Berechnungen berücksichtigt.
- Schulferien bleiben ebenfalls planbar. Sie dienen ausschließlich als
  visuelle Planungshilfe und verändern keine Berechnung.

## Gesetzliche Feiertage in Brandenburg

Automatisch berücksichtigt werden die regelmäßig wiederkehrenden gesetzlichen
Feiertage nach [§ 2 Absatz 1 des Brandenburger Feiertagsgesetzes](https://bravors.brandenburg.de/gesetze/ftg_2015):

| Feiertag                  | Datum oder Berechnung      |
| ------------------------- | -------------------------- |
| Neujahr                   | 1. Januar                  |
| Karfreitag                | zwei Tage vor Ostersonntag |
| Ostersonntag              | berechneter Ostersonntag   |
| Ostermontag               | ein Tag nach Ostersonntag  |
| Tag der Arbeit            | 1. Mai                     |
| Christi Himmelfahrt       | 39 Tage nach Ostersonntag  |
| Pfingstsonntag            | 49 Tage nach Ostersonntag  |
| Pfingstmontag             | 50 Tage nach Ostersonntag  |
| Tag der Deutschen Einheit | 3. Oktober                 |
| Reformationstag           | 31. Oktober                |
| 1. Weihnachtsfeiertag     | 25. Dezember               |
| 2. Weihnachtsfeiertag     | 26. Dezember               |

Die beweglichen Feiertage werden aus dem Ostersonntag des jeweiligen Jahres
berechnet.

Nicht automatisch berücksichtigt werden:

- Feiertage anderer Bundesländer,
- Gedenk- und Trauertage,
- sonstige religiöse Feiertage und
- einmalige Sonderfeiertage.

Wird ein einmaliger Sonderfeiertag für die Dienstplanung relevant, muss die
Kalendergrundlage der Anwendung ausdrücklich aktualisiert werden.

## Schulferien in Brandenburg

Die feststehenden Brandenburger Schulferien werden offline aus der
[Anlage 1 der VV Schulbetrieb](https://bravors.brandenburg.de/sixcms/media.php/66/VV-Schulbetrieb-Anlage-1.pdf)
abgeleitet. Hinterlegt sind die veröffentlichten Schuljahre `2022/23` bis
`2029/30`.

- Berücksichtigt werden Herbst-, Weihnachts-, Winter-, Oster-, Pfingst- und
  Sommerferien, soweit sie landesweit feststehen.
- Variable Ferientage werden nicht automatisch berücksichtigt, weil die
  jeweilige Schulkonferenz abweichende Termine festlegen darf.
- Jeder Kalendertag innerhalb eines veröffentlichten Ferienzeitraums wird als
  Schulferientag gekennzeichnet. Das schließt Wochenenden und gesetzliche
  Feiertage innerhalb des Zeitraums ein.
- Der erste und letzte Ferientag werden zusätzlich als Beginn beziehungsweise
  Ende des Ferienzeitraums ausgewiesen. Ein eintägiger Ferienzeitraum erhält
  eine einzelne Bezeichnung.
- Schulferien verändern weder `isWorkingDay`, die kalendarische
  Arbeitstagszahl noch Soll-, Ist- oder Differenzwerte.

Ab dem letzten vollständig hinterlegten Schuljahr weist die Planungsseite auf
die notwendige Aktualisierung hin. Für Monate außerhalb des veröffentlichten
Datenzeitraums meldet sie mit roter Fehlersignalisierung, dass
Ferienmarkierungen fehlen können. Neue offizielle Termine müssen bis zu einer
späteren Importfunktion zentral in der Anwendung ergänzt werden.

## Kalendarische Arbeitstage

Ein kalendarischer Arbeitstag ist ein Montag, Dienstag, Mittwoch, Donnerstag
oder Freitag, sofern der Tag kein berücksichtigter gesetzlicher Feiertag in
Brandenburg ist.

Die monatliche Arbeitstagszahl ist damit:

`Anzahl Montag bis Freitag − Feiertage an diesen Wochentagen`

- Die Arbeitstagszahl ist für alle Mitarbeiter desselben Monatsplans gleich.
- Urlaub, Krankheit, Planungseinträge, Rufbereitschaften, Beschäftigungsbeginn
  und persönliche Arbeitszeitverteilung verändern diese Kalendergröße nicht.
- Ein Feiertag am Samstag oder Sonntag reduziert die Arbeitstagszahl nicht.
- Es entsteht kein Ersatzarbeitstag.
- Der Begriff `Werktag` wird vermieden, weil er auch den Samstag umfassen kann.

## Mehrere Feiertage an einem Datum

- Ein Datum bleibt genau ein Kalendertag, auch wenn mehrere
  Feiertagsbezeichnungen darauf zutreffen.
- Der Kalendertag wird bei der Arbeitstagsberechnung höchstens einmal
  ausgeschlossen.
- Alle zutreffenden Feiertagsbezeichnungen bleiben erhalten.

## Gültige Kalenderauswahl

- Der Monat ist eine ganze Zahl von `1` bis `12`.
- Das Jahr muss innerhalb des von der Anwendung unterstützten gregorianischen
  Kalenderbereichs liegen.
- Die Kalender- und Feiertagsberechnung gilt für jedes Jahr, das die Anwendung
  zur Auswahl anbietet.

Der konkrete unterstützte Jahresbereich ist eine technische Grenze und wird
daher im Quellcode festgelegt.

## Vollständigkeit eines Monatsplans

Beim Anlegen eines Monatsplans erzeugt die Anwendung für jeden Kalendertag des
ausgewählten Monats genau einen Plantag.

Ein gültiger Monatsplan muss deshalb:

- sämtliche Kalendertage des Monats enthalten,
- jeden Kalendertag genau einmal enthalten,
- ausschließlich Tage des ausgewählten Monats enthalten und
- die Tage chronologisch ordnen.

Fehlende, doppelte, falsch zugeordnete oder falsch sortierte Plantage sind kein
zulässiger Monatsplan. Der technische Umgang mit beschädigten gespeicherten
Daten wird in der Datenhaltung beschrieben.
