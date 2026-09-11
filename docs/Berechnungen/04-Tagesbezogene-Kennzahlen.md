# Tagesbezogene Kennzahlen

## Auswertungskreis der tagesbezogenen Kennzahlen

Folgende tagesbezogene Kennzahlen werden für **jeden Mitarbeiter des Mitarbeiter-Snapshots eines Monatsplans** berechnet und angezeigt:

- SN/F-Dienste,
- freie Tage,
- freie Samstage und
- freie Sonntage.

Die Rolle des Mitarbeiters schränkt diesen Auswertungskreis nicht ein. Die Kennzahlen werden für jeden Mitarbeiter getrennt über die Kalendertage des Monatsplans ermittelt.

Diese Regel gilt nicht automatisch für die Rufbereitschaft. Deren zulässiger Personenkreis wird als eigene Fachregel festgelegt.

## SN/F-Dienste

Die Kennzahl behält die Bezeichnung **SN/F-Dienste** und wird für jeden Mitarbeiter über den gesamten Monatsplan gezählt.

- Ein Planungseintrag erhöht den Zähler um `1`, wenn sein im Snapshot gespeichertes Kürzel exakt `SN/F` oder exakt `SN` lautet.
- Ein Planungseintrag mit dem alleinigen Kürzel `F` erhöht den Zähler nicht.
- Jeder passende Planungseintrag wird einzeln für seinen Kalendertag gezählt.
- Mehrere aufeinanderfolgende Planungseinträge werden nicht zu einer kalendertagübergreifenden Dienstfolge zusammengesetzt. Insbesondere wird eine Folge aus einem `SN`-Eintrag und einem späteren `F`-Eintrag nicht zusätzlich oder nachträglich als gemeinsame Kombination erkannt.
- Äußere Leerzeichen werden bei Texteingaben an der gemeinsamen Validierungsgrenze automatisch entfernt. Danach beruht die Erkennung im Prototyp bewusst auf den exakten Kürzeltexten. Abweichende Schreibweisen oder andere frei angelegte Kürzel werden nicht als SN/F-Dienst erkannt.

Diese Regel ist eine bewusste Vereinfachung für den Prototyp. Fachlich soll die Kennzahl Spät-Nacht-Früh-Dienste erfassen; die frei anlegbaren Kürzel und die Beschränkung eines Planungseintrags auf genau einen Kalendertag erlauben jedoch noch keine zuverlässige semantische Erkennung vollständiger Dienstfolgen. Eine spätere Weiterentwicklung kann dafür ausdrückliche Eintragskategorien und eine kalendertagübergreifende Auswertung einführen.

## Freie Tage

Ein Kalendertag wird für einen Mitarbeiter nur dann als freier Tag gezählt, wenn die zugehörige Planungszelle einen Planungseintrag mit dem im Snapshot gespeicherten exakten Kürzel `/` enthält.

- Jeder passende Planungseintrag erhöht die Anzahl der freien Tage dieses Mitarbeiters um `1`.
- Eine leere Planungszelle bedeutet „noch ungeplant“ und wird nicht als freier Tag gezählt.
- Äußere Leerzeichen werden vor dem Speichern entfernt. Davon abgesehen gelten abweichende Kürzel oder Kürzel mit zusätzlichen Zeichen nicht als Frei-Eintrag.
- Maßgeblich ist der Snapshot des konkreten Planungseintrags. Eine spätere Änderung der zugrunde liegenden Eintragsdefinition verändert die Zählung eines bereits gesetzten Eintrags nicht.

## Freie Samstage und freie Sonntage

Freie Samstage und freie Sonntage sind kalenderabhängige Teilmengen der freien Tage.

- Ein Frei-Eintrag mit dem exakten Snapshot-Kürzel `/` an einem Samstag erhöht sowohl die Anzahl der freien Tage als auch die Anzahl der freien Samstage dieses Mitarbeiters jeweils um `1`.
- Ein Frei-Eintrag mit dem exakten Snapshot-Kürzel `/` an einem Sonntag erhöht sowohl die Anzahl der freien Tage als auch die Anzahl der freien Sonntage dieses Mitarbeiters jeweils um `1`.
- Maßgeblich ist der tatsächliche Wochentag des Kalendertages im Monatsplan.
- Der Feiertagsstatus verändert diese Einordnung nicht. Ein freier Sonntag bleibt beispielsweise auch dann ein freier Sonntag, wenn er zugleich ein gesetzlicher Feiertag ist.
- Ein Feiertag an einem anderen Wochentag wird dadurch nicht als freier Samstag oder freier Sonntag gezählt.
- Eine leere Planungszelle erhöht auch am Wochenende keinen dieser Zähler.

## Zulässiger Personenkreis der Rufbereitschaft

Eine Rufbereitschaft darf ausschließlich einem Mitarbeiter zugeordnet werden, dessen Rolle im Mitarbeiter-Snapshot des betreffenden Monatsplans `Erzieher` ist.

- Maßgeblich ist die im Monatsplan gespeicherte Rolle und nicht der aktuelle Mitarbeiter-Stammdatensatz.
- Mitarbeiter mit einer anderen Rolle dürfen für die Rufbereitschaft nicht ausgewählt oder gespeichert werden.
- Eine spätere Änderung des Mitarbeiter-Stammdatensatzes verändert die Rufbereitschaften und Auswertungen bestehender Monatspläne nicht rückwirkend.
- Die Rollenregel muss beim Speichern fachlich geprüft werden und darf nicht nur durch die Auswahlmöglichkeiten der Bedienoberfläche abgesichert sein.

## Zählung der Rufbereitschaften

Für jeden Kalendertag eines Monatsplans kann keine oder genau eine Rufbereitschaft festgelegt werden.

- Eine Rufbereitschaft wird genau einem dafür zulässigen Mitarbeiter zugeordnet.
- Der Kalendertag erhöht die Anzahl der Rufbereitschaften dieses Mitarbeiters um `1`.
- Für alle anderen Mitarbeiter erhöht dieser Kalendertag den Rufbereitschaftszähler nicht.
- Die monatliche Anzahl der Rufbereitschaften eines Mitarbeiters entspricht der Anzahl der Kalendertage, an denen ihm die Rufbereitschaft zugeordnet ist.
- Wird die Zuordnung eines Kalendertages auf einen anderen zulässigen Mitarbeiter geändert, entfällt der Zählerpunkt bei der bisherigen Person und wird der neuen Person zugerechnet.
- Wird die Rufbereitschaft eines Kalendertages entfernt, entfällt der zugehörige Zählerpunkt ersatzlos.
- Mehrere Rufbereitschaften am selben Kalendertag sind nicht zulässig.

## Rufbereitschaft und Planungseintrag am selben Tag

Die Rufbereitschaft und der normale Planungseintrag eines Mitarbeiters sind voneinander unabhängige Angaben.

- Eine Rufbereitschaft darf gemeinsam mit jedem zulässigen Planungseintrag desselben Mitarbeiters und Kalendertages bestehen.
- Dies gilt im Prototyp ausdrücklich auch für einen Frei-Eintrag mit dem Kürzel `/`.
- Der Planungseintrag wirkt auf die zugehörigen Dienst- oder Frei-Kennzahlen; die Rufbereitschaft erhöht unabhängig davon den Rufbereitschaftszähler.
- Ein Kalendertag kann dadurch für denselben Mitarbeiter gleichzeitig beispielsweise als freier Tag und als Rufbereitschaft gezählt werden.
- Aus der Kombination werden keine zusätzlichen Zeitwerte oder weiteren Kennzahlen abgeleitet.
- Der Prototyp prüft keine fachliche Plausibilität bestimmter Kombinationen. Solche Einschränkungen dürfen erst ergänzt werden, wenn dafür konkrete fachliche Regeln festgelegt wurden.
