# Tagesbezogene Kennzahlen

Dieses Dokument beschreibt die verbindlichen Zählregeln für tagesbezogene
Kennzahlen eines Monatsplans.

## Auswertungskreis

Für jeden im Monatsplan gespeicherten Mitarbeiter werden getrennt berechnet:

- SN/F-Dienste,
- freie Tage,
- freie Samstage,
- freie Sonntage und
- Rufbereitschaften.

Die allgemeinen Dienst- und Frei-Kennzahlen sind rollenunabhängig. Für die
Zuordnung einer Rufbereitschaft gilt dagegen eine eigene Rollenregel.

## SN/F-Dienste

Ein Planungseintrag erhöht den Zähler um `1`, wenn sein gespeichertes Kürzel
exakt `SN/F` oder exakt `SN` lautet.

- Ein Eintrag mit dem alleinigen Kürzel `F` wird nicht gezählt.
- Jeder passende Eintrag wird für seinen Kalendertag einzeln gezählt.
- Mehrere Einträge an aufeinanderfolgenden Tagen werden nicht zu einer
  gemeinsamen Dienstfolge zusammengesetzt.
- Äußere Leerzeichen werden vor dem Speichern entfernt. Danach beruht die
  Erkennung auf dem exakten Kürzel.

Diese Kürzelerkennung ist eine bewusste Vereinfachung des Prototyps. Ohne eine
fachliche Kategorie der Eintragsart lässt sich ein vollständiger
Spät-Nacht-Früh-Dienst nicht zuverlässig semantisch erkennen. Eine spätere
Erweiterung benötigt dafür ausdrücklich festgelegte Kategorien und Regeln für
kalendertagübergreifende Dienstfolgen.

Für die zusammengefasste Kennzahl in der Werkzeugleiste werden die bereits
berechneten SN/F-Zähler aller Mitarbeiter mit der Snapshot-Rolle `Erzieher`
addiert. Andere Rollen fließen nicht in diese Summe ein. Es findet keine zweite
Auswertung der Planungseinträge statt.

Zielwert der Summe ist die Anzahl der Kalendertage des Monats:

- Unterhalb des Zielwerts erscheint die Summe gelb.
- Beim exakten Zielwert erscheint sie grün.
- Oberhalb des Zielwerts erscheint sie rot.

Die Summe bewertet nur die Gesamtzahl der Dienste. Sie prüft nicht, ob jeder
einzelne Kalendertag genau einmal durch einen SN/F-Dienst abgedeckt ist.

## Freie Tage

Ein Kalendertag zählt für einen Mitarbeiter nur dann als freier Tag, wenn sein
Planungseintrag das gespeicherte Kürzel `/` besitzt.

- Jeder passende Eintrag erhöht den Zähler um `1`.
- Eine leere Planungszelle bedeutet „noch ungeplant“ und zählt nicht als frei.
- Andere oder erweiterte Kürzel werden nicht als Frei-Eintrag erkannt.
- Maßgeblich ist der Snapshot des gesetzten Planungseintrags. Eine spätere
  Änderung der Eintragsart verändert die bestehende Zählung nicht.

Der monatliche Zielwert für freie Tage ergibt sich unabhängig vom Mitarbeiter
aus der Differenz zwischen allen Kalendertagen und den kalendarischen
Arbeitstagen des Monats:

`Ziel freie Tage = Kalendertage − Arbeitstage`

Die Zahl der eingetragenen freien Tage wird mit diesem Zielwert verglichen:

- Unterhalb des Zielwerts erhält die Kennzahl einen gelben Warnstatus.
- Beim exakten Zielwert erhält sie einen grünen Status.
- Oberhalb des Zielwerts erhält sie einen roten Status.

Der Zielwert und die Statusanzeige verändern die Zählregel nicht. Insbesondere
bleiben leere Zellen ungeplant und werden nicht als freie Tage gezählt.

## Freie Samstage und Sonntage

Freie Samstage und freie Sonntage sind Teilmengen der freien Tage:

- Ein Frei-Eintrag `/` an einem Samstag erhöht sowohl `freie Tage` als auch
  `freie Samstage` um jeweils `1`.
- Ein Frei-Eintrag `/` an einem Sonntag erhöht sowohl `freie Tage` als auch
  `freie Sonntage` um jeweils `1`.
- Maßgeblich ist der tatsächliche Wochentag des Plantages.
- Ein zusätzlicher Feiertagsstatus verändert die Einordnung nicht.
- Eine leere Planungszelle erhöht auch am Wochenende keinen Zähler.

Für freie Samstage und freie Sonntage gilt jeweils unabhängig vom Monat und
vom Mitarbeiter der feste Zielwert `2`. Beide Kennzahlen erhalten getrennt
voneinander einen Status:

- Unterhalb von `2` ist der Status gelb.
- Bei exakt `2` ist der Status grün.
- Oberhalb von `2` ist der Status rot.

## Rufbereitschaft

Eine Rufbereitschaft darf ausschließlich einem Mitarbeiter zugeordnet werden,
dessen im Monatsplan gespeicherte Rolle `Erzieher` ist. Diese Regel muss an der
fachlichen Speichergrenze geprüft werden und darf nicht nur durch die
Oberfläche abgesichert sein.

Für jeden Kalendertag kann keine oder genau eine Rufbereitschaft festgelegt
werden:

- Der Tag erhöht den Rufbereitschaftszähler des zugeordneten Mitarbeiters um
  `1`.
- Eine Änderung der Zuordnung verschiebt den Zählerpunkt zur neuen Person.
- Das Entfernen der Zuordnung entfernt den Zählerpunkt.
- Spätere Änderungen am Mitarbeiter-Stammdatensatz verändern bestehende
  Rufbereitschaften nicht rückwirkend.

## Kombination mit einem Planungseintrag

Rufbereitschaft und normaler Planungseintrag sind unabhängige Angaben.

- Eine Rufbereitschaft darf gemeinsam mit jedem zulässigen Planungseintrag
  desselben Mitarbeiters und Tages bestehen.
- Das gilt im Prototyp auch für einen Frei-Eintrag `/`.
- Der Planungseintrag beeinflusst die Dienst- und Frei-Kennzahlen; die
  Rufbereitschaft beeinflusst unabhängig davon den Rufbereitschaftszähler.
- Aus der Kombination werden keine zusätzlichen Zeitwerte abgeleitet.

Weitere Plausibilitätsbeschränkungen für bestimmte Kombinationen werden erst
eingeführt, wenn dafür konkrete Fachregeln beschlossen wurden.
