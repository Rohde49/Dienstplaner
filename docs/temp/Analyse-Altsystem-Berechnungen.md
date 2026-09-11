# Analyseprotokoll: Berechnungen im Altsystem

> Temporäres Arbeitsdokument. Die hier festgehaltenen Quellcodebefunde sind noch keine verbindlichen fachlichen Entscheidungen. Verbindliche Regeln werden nach gemeinsamer Prüfung in `docs/Berechnungen/` übernommen.

## Zweck

Dieses Protokoll hält die Zwischenergebnisse der schrittweisen Quellcodeanalyse fest. Es trennt die technische Beweisgrundlage des Altsystems von der fachlichen Zieldokumentation des neuen Dienstplaners.

## Untersuchungsgrundlage

- Repository: [`Rohde49/dienstplan-app`](https://github.com/Rohde49/dienstplan-app)
- Untersuchte Version: Commit [`255036d0d95fa7fbf53e354a36680a08ee4719c1`](https://github.com/Rohde49/dienstplan-app/tree/255036d0d95fa7fbf53e354a36680a08ee4719c1/src)
- Untersuchter Bereich: ausschließlich `src`
- Umfang der Bestandsaufnahme: 94 Dateien einschließlich der Tests innerhalb von `src`
- Nicht untersucht und nicht als Quelle verwendet: der `docs`-Ordner des Altsystems

## Vorgehen

1. Alle Dateien unter `src` erfassen.
2. Nach fachlichen Zeit-, Kalender-, Planungs- und Auswertungsbegriffen sowie Rechenoperationen suchen.
3. Mögliche Fundstellen im Zusammenhang lesen.
4. Implementierung und zugehörige Tests miteinander abgleichen.
5. Rein technische Berechnungen von fachlichen Berechnungsregeln trennen.
6. Jeden fachlichen Themenblock einzeln mit dem Nutzer prüfen.

## Ergebnis von Schritt 1: Bestandsaufnahme

### Zentrale Berechnungskette

Die fachlich relevante Verarbeitung lässt sich im Altsystem vorläufig wie folgt zusammenfassen:

1. Wochenarbeitszeiten und Zeitdauern werden intern als Minutenwerte geführt.
2. Für einen ausgewählten Monat werden Kalendertage, Wochentage, Wochenenden und Feiertage bestimmt.
3. Beim Setzen eines Planungseintrags werden dessen Zeitwerte für den konkreten Mitarbeiter als Snapshot übernommen oder berechnet.
4. Die gespeicherten beziehungsweise noch nicht gespeicherten Snapshots werden pro Mitarbeiter und Monat ausgewertet.
5. Aus Zählungen und Zeitsummen werden Zuschläge sowie Soll-, Ist- und Differenzwerte abgeleitet.
6. Die Ergebnisse werden für die Anzeige wieder als Stunden und Minuten formatiert.

### Erkannte fachliche Fundstellen

| Bereich | Hauptfundstellen im alten `src`-Ordner | Vorläufiger Quellcodebefund |
| --- | --- | --- |
| Zeitbasis | `shared/time.ts`, `shared/rundeAufVolleMinute.ts` | Zeitdauern werden zwischen `HH:MM` und Minuten umgerechnet; berechnete Bruchteile werden auf volle Minuten gerundet. |
| Kalender | `shared/kalendertage.ts` | Erzeugt alle Tage eines Monats und ordnet Wochentage, Wochenenden und gesetzliche Feiertage in Brandenburg zu. |
| Planungseinträge | `renderer/src/lib/mitarbeiterabhaengigeArbeitszeit.ts`, `renderer/src/lib/planeintragSnapshot.ts` | Unterscheidet feste und mitarbeiterabhängige Zeitwerte und friert die Werte beim Setzen eines Eintrags als Snapshot ein. |
| Monatsauswertung | `shared/auswertung.ts` | Zählt bestimmte Dienste und freie Tage, summiert mehrere Arbeitszeitarten und berechnet Zuschläge sowie Soll-/Ist-Werte. |
| Ergebnisdarstellung | `shared/time.ts`, `shared/auswertung.ts`, `renderer/src/lib/sollIstFarbe.ts` | Formatiert Zeitwerte und kennzeichnet den Soll-/Ist-Ausgleich beziehungsweise eine Abweichung. |

### Vorläufig erkannte Einzelregeln

Diese Liste dokumentiert nur den implementierten Stand. Jede Regel wird in den folgenden Schritten noch fachlich geprüft.

- Zeitdauern werden als nichtnegative Minutenwerte verarbeitet.
- Eine Dauer im Format `HH:MM` darf im Altsystem ein- bis dreistellige Stunden enthalten; der Minutenanteil liegt zwischen `00` und `59`.
- Uhrzeiten eines Tages verwenden dagegen genau zwei Stundenstellen und den Bereich `00:00` bis `23:59`.
- Berechnete Zeitdauern werden auf die nächstgelegene volle Minute gerundet; eine halbe Minute wird bei den vorkommenden nichtnegativen Werten aufgerundet.
- Die mitarbeiterabhängige Tagesarbeitszeit wird aus einem Fünftel der individuellen Wochenarbeitszeit berechnet.
- Bei festen Planungseinträgen werden die hinterlegten Zeitwerte unverändert übernommen.
- Ein gesetzlicher Arbeitstag ist im Altsystem ein Montag bis Freitag, der kein gesetzlicher Feiertag in Brandenburg ist.
- Die Auswertung berechnet Kennzahlen nur für Mitarbeiter mit der Rolle `Erzieher`.
- Ausgewertet werden unter anderem SN/F-Dienste, freie Tage, freie Samstage, freie Sonntage und Rufbereitschaften.
- Zeitbezogen werden Arbeitszeit, Arbeitszeit ohne Nachtbereitschaft, Nachtbereitschaft, Nachtarbeit und Arbeit an Sonntagen beziehungsweise Feiertagen summiert.
- Das Altsystem berechnet einen Nachtzuschlag von 20 Prozent und einen Nachtbereitschaftszuschlag von 25 Prozent.
- Die monatliche Soll-Arbeitszeit basiert auf der Anzahl der Arbeitstage und einem Fünftel der individuellen Wochenarbeitszeit.
- Die Soll-/Ist-Differenz wird als Ist-Arbeitszeit minus Soll-Arbeitszeit gebildet.

## Ergebnis von Schritt 2: Zeitbasis, Zeitformate und Rundung

### 1. Implementierter Ist-Stand

#### Zeitdauern und interne Recheneinheit

- Das Altsystem rechnet bei Wochenarbeitszeit, Eintragsdefinitionen, Planeinträgen und Auswertungswerten mit Minuten. Die Feldnamen tragen dafür durchgängig den Zusatz `Minuten`, beispielsweise `wochenarbeitszeitMinuten` und `nachtarbeitMinuten` (`shared/types.ts:1-8`, `shared/types.ts:32-44`, `shared/types.ts:62-77`).
- Nutzereingaben für Zeitdauern werden aus einer Textdarstellung in Minuten umgerechnet. Die Formel lautet `Stunden * 60 + Minuten` (`shared/time.ts:3-12`).
- Der Parser akzeptiert ein- bis dreistellige, nichtnegative Stunden sowie genau zwei Minutenstellen von `00` bis `59`. Beispiele aus den Tests sind `5:30`, `39:00` und `120:15`. Umgebende Leerzeichen werden entfernt (`shared/time.ts:1-12`, `shared/time.test.ts:4-36`). Damit ist der tatsächlich akzeptierte Bereich `0:00` bis `999:59`; die Fehlermeldung nennt trotzdem allgemein das Format `HH:MM`.
- Die Rückumwandlung akzeptiert nur nichtnegative ganze Minuten. Stunden werden mit mindestens zwei Stellen ausgegeben, aber nicht nach oben begrenzt: `330` wird `05:30`, `7215` wird `120:15` (`shared/time.ts:14-22`, `shared/time.test.ts:38-62`). Dadurch kann die Formatierung ab 60.000 Minuten vierstellige Stunden erzeugen, die der Parser anschließend nicht mehr akzeptiert. Dieser Grenzfall ist nicht getestet.
- Die Wochenarbeitszeit wird im Teamformular als Zeitdauer eingegeben, beim Speichern in Minuten umgerechnet und beim Bearbeiten wieder formatiert (`renderer/src/pages/TeamPage.tsx:44-79`, `renderer/src/components/TeamMemberForm.tsx:119-128`). Ein Seitentest belegt beispielhaft `39:00` zu `2340` Minuten (`renderer/src/pages/TeamPage.test.tsx:64-88`).
- Auch die fünf Zeitdauern einer festen Eintragsdefinition werden als Text eingegeben und vor dem Speichern einzeln in Minuten umgerechnet: Anwesenheitszeit, Arbeitszeit, Arbeitszeit ohne Nachtbereitschaft, Nachtbereitschaft und Nachtarbeit (`renderer/src/pages/EintraegePage.tsx:99-139`). Die Eingabevalidierung verlangt für diese gespeicherten Werte nichtnegative ganze Minuten; `0` ist zulässig (`renderer/src/lib/validateEintragsdefinition.ts:53-68`, `renderer/src/lib/validateEintragsdefinition.test.ts:89-103`).
- Für die Wochenarbeitszeit prüft die nachgelagerte Validierung nur „endlich und größer als 0“, nicht ausdrücklich „ganze Minute“. Über den normalen Formularweg entsteht dennoch immer eine ganze Minutenzahl, weil vorher der Zeitdauer-Parser verwendet wird (`renderer/src/pages/TeamPage.tsx:60-79`, `renderer/src/lib/validateTeamMember.ts:32-34`).

#### Uhrzeiten eines Tages

- Beginn und Ende sind von Zeitdauern getrennte Angaben. Zulässig sind ausschließlich Uhrzeiten mit genau zwei Stunden- und zwei Minutenstellen von `00:00` bis `23:59` (`renderer/src/lib/timeOfDay.ts:1-5`, `renderer/src/lib/timeOfDay.test.ts:4-44`). `9:30`, `24:00`, `12:60` und `120:15` werden abgelehnt.
- Im Formular werden leere oder nur aus Leerzeichen bestehende Eingaben als `null` gespeichert; nichtleere Eingaben werden vor der Uhrzeitprüfung getrimmt (`renderer/src/pages/EintraegePage.tsx:126-139`).
- Bei einer festen Eintragsdefinition dürfen Beginn und Ende beide fehlen. Es gibt keine Prüfung, dass beide gemeinsam gesetzt sind, dass Ende nach Beginn liegt oder wie ein Dienst über Mitternacht zu behandeln wäre (`renderer/src/lib/validateEintragsdefinition.test.ts:80-87`).
- Bei einer mitarbeiterabhängigen Eintragsdefinition müssen Beginn und Ende leer sein (`renderer/src/lib/validateEintragsdefinition.ts:70-94`).
- Beginn und Ende werden nicht zur Berechnung einer Dauer verwendet. Im Datentyp des Planeintrags sind sie ausdrücklich nur als darstellender Snapshot beschrieben (`shared/types.ts:62-74`). Die fünf Zeitdauern werden unabhängig davon manuell vorgegeben beziehungsweise bei einer mitarbeiterabhängigen Definition separat berechnet.

#### Rundungsregel und tatsächliche Rundungszeitpunkte

- Die zentrale Hilfsfunktion verwendet `Math.round`. Für die im Altsystem vorkommenden nichtnegativen Werte bedeutet das: auf die nächstgelegene volle Minute runden; ab einer exakten halben Minute aufrunden (`shared/rundeAufVolleMinute.ts:1-5`, `shared/rundeAufVolleMinute.test.ts:4-24`).
- Die Hilfsfunktion selbst prüft weder Vorzeichen noch endliche Werte. Die Tests decken nur `0` und positive Werte ab. Würde sie mit negativen Werten aufgerufen, würde JavaScripts `Math.round` bei einer exakten negativen halben Minute in Richtung plus unendlich runden, beispielsweise `-2,5` zu `-2`. Im untersuchten Stand wird sie jedoch nur mit nichtnegativen Zeitgrundlagen verwendet.
- Bei mitarbeiterabhängigen Einträgen wird die Wochenarbeitszeit durch fünf geteilt und unmittelbar auf volle Minuten gerundet (`renderer/src/lib/mitarbeiterabhaengigeArbeitszeit.ts:1-7`). Dieser bereits gerundete Tageswert wird beim Setzen jedes einzelnen Planeintrags als Snapshot in `arbeitszeitOhneNachtbereitschaftMinuten` übernommen (`renderer/src/lib/planeintragSnapshot.ts:10-27`, `renderer/src/lib/planeintragSnapshot.test.ts:42-71`). Die Rundung erfolgt damit **pro Planeintrag**, nicht erst beim späteren Summieren.
- Nachtzuschlag und Nachtbereitschaftszuschlag werden dagegen erst aus der jeweiligen vollständigen Monatssumme berechnet und danach gerundet. Ein Test sichert diese Reihenfolge ausdrücklich ab (`shared/auswertung.ts:85-106`, `shared/auswertung.test.ts:317-339`).
- Die monatliche Soll-Arbeitszeit wird als `Anzahl Arbeitstage * Wochenarbeitszeit in Minuten / 5` berechnet und erst das Gesamtergebnis wird gerundet (`shared/auswertung.ts:85-93`).
- Manuell eingegebene feste Zeitdauern und bereits gerundete Snapshots werden bei den Monatssummen nur addiert. Dabei findet keine weitere Rundung statt (`shared/auswertung.ts:56-80`).

#### Nachgewiesener Unterschied zwischen Tages- und Monatsrundung

Aus den beiden implementierten Rundungszeitpunkten lässt sich eine fachlich relevante Abweichung ableiten, wenn die Wochenarbeitszeit nicht durch fünf teilbar ist:

| Beispiel | Pro mitarbeiterabhängigem Eintrag | Summe aus fünf Einträgen | Monatssoll bei fünf Arbeitstagen |
| --- | ---: | ---: | ---: |
| 2341 Minuten (`39:01`) | `2341 / 5 = 468,2`, gerundet `468` | `2340` | `2341` |
| 2343 Minuten (`39:03`) | `2343 / 5 = 468,6`, gerundet `469` | `2345` | `2343` |

Das ist kein Rechenfehler der einzelnen Funktionen, sondern die Folge unterschiedlicher Rundungszeitpunkte. Die Tests bestätigen beide Regeln getrennt: Tagesrundung für `2341` und `2343` Minuten (`renderer/src/lib/mitarbeiterabhaengigeArbeitszeit.test.ts:4-23`) sowie Rundung des gesamten Monatssolls (`shared/auswertung.test.ts:365-388`). Nicht getestet ist, wie diese Abweichung fachlich behandelt werden soll.

#### Darstellung von Ergebnissen

- Nichtnegative Zeitwerte werden grundsätzlich als `HH:MM` beziehungsweise bei großen Summen mit mehr Stundenstellen dargestellt (`shared/time.ts:14-22`).
- Eine Soll-/Ist-Differenz wird separat formatiert: positive Werte mit `+`, negative Werte mit einem Minuszeichen und der Betrag anschließend als Zeitdauer. Nur der exakte Nullwert wird abweichend als `0:00` statt `00:00` ausgegeben (`shared/auswertung.ts:115-120`, `shared/auswertung.test.ts:414-425`).

#### Grenzen der technischen Absicherung

- Die Datenbankspalten für Minutenwerte sind als `INTEGER NOT NULL` angelegt, besitzen aber keine fachlichen `CHECK`-Bedingungen für Nichtnegativität oder zulässige Obergrenzen (`main/db/teamRepository.ts:6-16`, `main/db/eintragsdefinitionRepository.ts:6-21`, `main/db/planeintragRepository.ts:6-23`).
- Die IPC-Handler reichen übergebene Daten ohne erneute Laufzeitvalidierung an die Repositories weiter (`main/ipc/teamHandlers.ts:14-29`, `main/ipc/eintragsdefinitionHandlers.ts:14-33`). Die fachlichen Prüfungen liegen damit nur im normalen Formularweg des Renderers.
- Die vorhandenen Repositorytests belegen die Speicherung typischer ganzzahliger Minutenwerte, prüfen aber keine negativen, gebrochenen oder übergroßen Zeitwerte. Der Seitentest zur Teamverwaltung belegt genau einen erfolgreichen Umrechnungsfall. Für die Eintragsseite gibt es keinen entsprechenden Seitentest; vorhanden sind die Parser- und Validierungstests.
- Ein älter wirkender Testdatensatz im Dienstplan-Repositorytest legt den mitarbeiterabhängigen Wert abweichend in `arbeitszeitMinuten` statt in `arbeitszeitOhneNachtbereitschaftMinuten` ab (`main/db/dienstplanRepository.test.ts:33-43`, `main/db/dienstplanRepository.test.ts:256-271`). Dieser Test belegt nur, dass das Repository den gelieferten Snapshot unverändert speichert. Für die tatsächlich erzeugte Feldbelegung sind die Implementierung und ihr direkter Test maßgeblich (`renderer/src/lib/planeintragSnapshot.ts:14-27`, `renderer/src/lib/planeintragSnapshot.test.ts:57-71`).

### 2. Daraus ableitbare fachliche Bedeutung

- Das fachliche Rechenmodell besitzt eine Auflösung von einer vollen Minute. Stunden und Minuten in Formularen sind eine Ein- und Ausgabedarstellung; die eigentliche Recheneinheit ist die Minute.
- Eine **Zeitdauer** ist keine Uhrzeit: `39:00` bedeutet 39 Stunden Dauer und darf daher oberhalb von `23:59` liegen. **Beginn** und **Ende** bezeichnen dagegen Uhrzeiten innerhalb eines Kalendertages und sind auf `00:00` bis `23:59` begrenzt.
- Beginn und Ende haben im Altsystem nur Informationscharakter. Aus ihnen werden weder Anwesenheitszeit noch Arbeitszeit oder Nachtzeit abgeleitet. Deshalb kann der Quellcode keine fachliche Konsistenz zwischen diesen Angaben garantieren.
- Die Rundungsstelle gehört zur fachlichen Regel, nicht nur zur technischen Darstellung. „Jeden Tag runden und anschließend summieren“ kann ein anderes Ergebnis liefern als „zuerst den Monat berechnen und anschließend einmal runden“.
- Der Quellcode legt für Zuschläge die einmalige Rundung nach der Monatssumme fest. Für mitarbeiterabhängige Einträge legt er dagegen eine Rundung pro gesetztem Eintrag fest. Diese unterschiedlichen Regeln müssen bewusst bestätigt oder geändert werden.
- Die TypeScript-Typen und Datenbankbezeichnungen zeigen die beabsichtigte Minutenbasis. Die fehlenden Prüfungen außerhalb des Formularwegs sind jedoch nur eine technische Absicherungslücke und kein Beleg dafür, dass fachlich auch negative oder gebrochene Minuten zulässig sein sollen.

### 3. Ursprünglich erkannte Entscheidungsfragen

1. Soll das neue Projekt ganze Minuten als verbindliche interne Recheneinheit übernehmen?
2. Soll die Wochenarbeitszeit nur in Fünf-Minuten-Schritten zulässig sein, damit die Division durch fünf immer eine ganze Tagesminute ergibt, oder sollen nicht durch fünf teilbare Wochenzeiten erlaubt bleiben?
3. Falls solche Wochenzeiten erlaubt bleiben: Soll jeder mitarbeiterabhängige Planeintrag einzeln gerundet werden, obwohl dadurch seine Summe vom Sollwert abweichen kann, oder soll ein anderes Ausgleichsverfahren festgelegt werden?
4. Soll die Rundung „nächstgelegene volle Minute, exakt 30 Sekunden aufrunden“ verbindlich für alle nichtnegativen berechneten Zeitdauern gelten?
5. Soll für mögliche negative Zwischenergebnisse eine eigene symmetrische Rundungsregel festgelegt werden, oder soll grundsätzlich erst der nichtnegative Betrag gerundet und ein Vorzeichen nur anschließend angewendet werden?
6. Welche fachlichen Obergrenzen sollen für Wochenarbeitszeit und die einzelnen Zeitdauern gelten? Die technische Grenze von drei Stundenstellen ist bislang nur eine Parserentscheidung und keine begründete Fachregel.
7. Sollen Zeitdauern bei der Eingabe einheitlich mindestens zweistellige Stunden verlangen (`05:30`) oder weiterhin auch `5:30` akzeptieren und beim Anzeigen normalisieren?
8. Sollen Beginn und Ende weiterhin rein informativ und optional bleiben, oder sollen daraus künftig Zeitdauern berechnet beziehungsweise Konsistenzprüfungen abgeleitet werden? Dazu gehört auch eine Regel für Dienste über Mitternacht.
9. Soll die Null-Differenz einheitlich als `00:00` oder weiterhin abweichend als `0:00` erscheinen?
10. Soll die fachliche Validierung zusätzlich an der Prozess- beziehungsweise Speichergrenze durchgesetzt werden? Das betrifft die spätere technische Umsetzung, nicht die Rechenformel selbst.

### 4. Verständliche, pragmatische Empfehlung

1. **Ganze Minuten als Basis übernehmen.** Alle gespeicherten und ausgewerteten Zeitdauern sollten nichtnegative ganze Minuten sein. Das ist einfach, nachvollziehbar und vermeidet Gleitkommafehler in Summen.
2. **Zeitdauer und Uhrzeit sprachlich trennen.** Für Dauern sollte die Dokumentation `H:MM` mit beliebig vielen benötigten Stundenstellen beschreiben; die Anzeige kann auf mindestens zwei Stellen auffüllen. Für Tagesuhrzeiten sollte verbindlich `HH:MM` von `00:00` bis `23:59` gelten.
3. **Eine fachliche Obergrenze separat entscheiden.** Die bisherige Grenze `999:59` sollte nicht ungeprüft übernommen werden. Eine spätere Obergrenze sollte je Feld fachlich begründet sein und nicht zufällig aus dem Eingabe-Parser entstehen.
4. **Wochenarbeitszeit in Fünf-Minuten-Schritten empfehlen.** Dann ist `Wochenarbeitszeit / 5` immer eine ganze Minute, und fünf mitarbeiterabhängige Tageswerte ergeben exakt die Wochenarbeitszeit. Das beseitigt die erkannte Abweichung ohne Resteverteilung oder Bruchminuten.
5. **Ansonsten einmal am Ende der jeweiligen fachlichen Gesamtberechnung runden.** Zuschläge sollten wie im Altsystem erst aus der vollständigen Monatssumme berechnet und anschließend gerundet werden. Zwischenwerte sollten nicht mehrfach gerundet werden.
6. **Die Rundungsregel auf nichtnegative Werte begrenzen.** Empfohlen ist „auf die nächstgelegene volle Minute; exakt 30 Sekunden werden aufgerundet“. Differenzen sollten aus bereits ganzzahligen Zeitwerten gebildet und nur mit einem Vorzeichen dargestellt werden; dann ist keine uneindeutige Rundung negativer Werte erforderlich.
7. **Beginn und Ende vorerst als optionale Informationsfelder behandeln.** Eine automatische Ableitung von Arbeits-, Pausen- oder Nachtzeiten sollte erst eingeführt werden, wenn dafür vollständige fachliche Regeln einschließlich Pausen und Diensten über Mitternacht vorliegen.
8. **Darstellung vereinheitlichen.** Auch ein Nullwert sollte als `00:00` dargestellt werden; Differenzen erhalten nur bei positiven oder negativen Werten ein Vorzeichen.
9. **Technisch dieselben Regeln an allen Eingangsgrenzen prüfen.** Renderer, Prozessgrenze und Speicherung sollten später dieselben Anforderungen durchsetzen. Das verhindert ungültige Minutenwerte, verändert aber die hier empfohlene Fachlogik nicht.

### Status von Schritt 2

Die Analyse des implementierten Zeitmodells ist abgeschlossen. Die Empfehlungen sind noch keine verbindlichen Regeln; die oben genannten Entscheidungen müssen vor einer Übernahme in `docs/Berechnungen/` gemeinsam bestätigt werden.

### Bereits verbindlich entschieden

Am 10. September 2026 wurde die interne Zeitbasis festgelegt:

- Arbeitszeitdauern werden in ganzen Minuten geführt.
- Gespeicherte Zeitdauern sind nichtnegative ganze Minutenwerte; Sekunden und Bruchteile werden nicht gespeichert.
- Bruchteile dürfen nur als Zwischenwerte einer Berechnung entstehen und werden anschließend nach der für diese Berechnung festgelegten Regel gerundet.
- Negative Minutenwerte sind ausschließlich bei berechneten Differenzen zulässig.
- Stunden- und Minutenangaben sind Ein- und Ausgabedarstellungen der internen Minutenwerte.

Außerdem wurde die fachliche Trennung zwischen Zeitdauer und Uhrzeit festgelegt:

- Zeitdauern dürfen mehr als 24 Stunden umfassen. Das Eingabeformat ist `H:MM`; bei der Ausgabe wird der Stundenanteil auf mindestens zwei Stellen aufgefüllt.
- Der Minutenanteil einer Zeitdauer liegt zwischen `00` und `59`.
- Aus dem Format wird keine fachliche Obergrenze für den Stundenanteil abgeleitet. Obergrenzen werden bei Bedarf je Eingabefeld festgelegt.
- Beginn und Ende eines Dienstes sind Uhrzeiten im Format `HH:MM` und auf `00:00` bis `23:59` begrenzt.
- Beginn und Ende bleiben optional, müssen aber immer gemeinsam angegeben werden.
- Dienste über Mitternacht, beispielsweise `22:00` bis `06:00`, sind zulässig.
- Beginn und Ende dienen nur der Information und Darstellung. Aus ihnen werden keine Zeitdauern berechnet.
- Eine automatische Ableitung von Zeitdauern setzt zuerst vollständige fachliche Regeln zu Pausen, Nachtzeiträumen und Diensten über Mitternacht voraus.

Als allgemeine Rundungsmethode wurde festgelegt:

- Nichtnegative berechnete Zeitdauern werden auf die nächstgelegene volle Minute gerundet.
- Unter einer halben Minute wird abgerundet; ab genau einer halben Minute beziehungsweise 30 Sekunden wird aufgerundet.
- Negative Soll-/Ist-Differenzen werden nicht erneut gerundet, da sie aus bereits ganzzahligen Minutenwerten entstehen.
- Der konkrete Rundungszeitpunkt wird für jede Berechnung gesondert festgelegt.

Für die Wochenarbeitszeit wurde festgelegt:

- Die individuelle Wochenarbeitszeit muss in Fünf-Minuten-Schritten angegeben werden; ihr Minutenwert ist ohne Rest durch fünf teilbar.
- Damit kann ein minutengenauer Fünftelwert ohne Rundung oder Resteverteilung gebildet werden.
- Welche Planungseinträge diesen Fünftelwert verwenden, wird erst bei den Berechnungsarten verbindlich festgelegt.

Für die Ergebnisdarstellung wurde festgelegt:

- Nichtnegative Zeitdauern werden als `HH:MM` mit bei Bedarf mehr als zwei Stundenstellen dargestellt.
- Positive Soll-/Ist-Differenzen erhalten ein Pluszeichen, negative ein Minuszeichen.
- Ein exakter Ausgleich wird als `00:00` ohne Vorzeichen dargestellt. Die abweichende Darstellung `0:00` des Altsystems wird nicht übernommen.

Diese Entscheidungen wurden in `docs/Berechnungen/` übernommen. Schritt 2 ist damit fachlich abgeschlossen. Berechnungsspezifische Rundungszeitpunkte werden in den jeweils zugehörigen späteren Schritten festgelegt.

## Ergebnis von Schritt 3: Kalender, Feiertage und Arbeitstage

### 1. Implementierter Ist-Stand

#### Monat und Kalendertage

- `getKalendertageFuerMonat(jahr, monat)` erzeugt in aufsteigender Reihenfolge genau einen Eintrag für jeden Kalendertag des angeforderten Monats. Die Anzahl wird über den letzten Tag des Monats bestimmt; dadurch entstehen je nach Monat 28, 29, 30 oder 31 Tage (`shared/kalendertage.ts:66-87`).
- Datum und Wochentag werden in UTC berechnet. Das vermeidet Verschiebungen durch lokale Zeitzonen oder Sommerzeit. Das Datum wird als `JJJJ-MM-TT` und der Wochentag als `Mo` bis `So` ausgegeben (`shared/kalendertage.ts:1-13`, `shared/kalendertage.ts:68-83`).
- Samstag und Sonntag werden als Wochenende markiert. Montag bis Freitag sind keine Wochenendtage (`shared/kalendertage.ts:9`, `shared/kalendertage.ts:73-75`).
- Die direkten Tests belegen einen gewöhnlichen 30-Tage-Monat, Februar mit 29 Tagen im Schaltjahr 2024, Februar mit 28 Tagen im Jahr 2023 und bekannte Wochentage im April 2023 (`shared/kalendertage.test.ts:4-25`). Die Jahrhundertausnahmen der Schaltjahrregel, etwa 1900 und 2000, sind nicht ausdrücklich getestet.

#### Gesetzliche Feiertage in Brandenburg

- Das Altsystem besitzt eine fest im Quellcode hinterlegte Feiertagsregel für Brandenburg. Für jedes Jahr werden folgende zwölf Feiertage erzeugt (`shared/kalendertage.ts:44-63`):

| Feiertag | Berechnung im Altsystem |
| --- | --- |
| Neujahr | 1. Januar |
| Karfreitag | zwei Tage vor Ostersonntag |
| Ostersonntag | berechneter Ostersonntag |
| Ostermontag | ein Tag nach Ostersonntag |
| Tag der Arbeit | 1. Mai |
| Christi Himmelfahrt | 39 Tage nach Ostersonntag |
| Pfingstsonntag | 49 Tage nach Ostersonntag |
| Pfingstmontag | 50 Tage nach Ostersonntag |
| Tag der Deutschen Einheit | 3. Oktober |
| Reformationstag | 31. Oktober |
| 1. Weihnachtsfeiertag | 25. Dezember |
| 2. Weihnachtsfeiertag | 26. Dezember |

- Der Ostersonntag wird mit einem gregorianischen Osteralgorithmus berechnet. Datumsverschiebungen für die davon abhängigen Feiertage erfolgen ebenfalls in UTC und können Monatsgrenzen überschreiten (`shared/kalendertage.ts:15-42`).
- Die Tests belegen die Oster- und Pfingsttermine des Jahres 2023 sowie Neujahr und die beiden Weihnachtsfeiertage. Heiligabend wird ausdrücklich nicht als Feiertag behandelt (`shared/kalendertage.test.ts:27-75`). Für den 1. Mai, den Tag der Deutschen Einheit und den Reformationstag existiert in dieser Testdatei kein eigener direkter Erkennungstest.
- Ein Tag kann zugleich als Wochenende und als Feiertag markiert sein. Dies ist am Ostersonntag 2023 getestet (`shared/kalendertage.test.ts:77-94`). Es gibt keinen Ersatzarbeitstag, wenn ein Feiertag auf Samstag oder Sonntag fällt.
- Feiertage werden in einer `Map` mit dem Datum als eindeutigem Schlüssel gespeichert. Sollten zwei Feiertage auf dasselbe Datum fallen, bleibt deshalb nur ein Kalendereintrag und die später gesetzte Bezeichnung überschreibt die frühere. Der Feiertagsstatus und die Arbeitstagszählung bleiben eindeutig; eine kombinierte Anzeige beider Namen ist im Altsystem nicht vorgesehen (`shared/kalendertage.ts:46-63`). Dieser Überschneidungsfall ist nicht getestet.

#### Abgleich mit der aktuellen amtlichen Feiertagsgrundlage

Am 10. September 2026 wurde die im Altsystem enthaltene Feiertagsliste mit § 2 Absatz 1 der [aktuellen amtlichen Fassung des Brandenburger Feiertagsgesetzes](https://bravors.brandenburg.de/gesetze/ftg_2015) abgeglichen.

- Alle zwölf im Gesetz genannten gesetzlichen Feiertage sind im Altsystem enthalten.
- Das Altsystem enthält keinen zusätzlichen Tag, der nicht in § 2 Absatz 1 aufgeführt ist.
- Die Bezeichnungen `Reformationstag` statt `Reformationsfest` und `Christi Himmelfahrt` statt `Christi Himmelfahrtstag` sind nur sprachliche Verkürzungen und bezeichnen jeweils denselben gesetzlichen Feiertag.
- Die in § 2 Absatz 2 genannten Gedenk- und Trauertage sind keine zusätzlichen gesetzlichen Feiertage und werden deshalb nicht in die reguläre Feiertagsberechnung aufgenommen.
- § 2 Absatz 3 erlaubt einmalige Feier-, Gedenk- oder Trauertage durch Rechtsverordnung. Solche einmaligen Sonderregelungen bildet die fest hinterlegte Feiertagsliste des Altsystems nicht ab.

Damit ist die reguläre Feiertagsliste des Altsystems für den aktuell veröffentlichten Gesetzesstand vollständig. Noch fachlich zu entscheiden ist, ob der neue Dienstplaner nur diese regulären Feiertage oder zusätzlich manuell pflegbare einmalige Sondertage berücksichtigen soll.

#### Definition und Verwendung der monatlichen Arbeitstage

- Die Arbeitstagsformel lautet: Anzahl aller Kalendertage des Monats, die **weder Samstag oder Sonntag noch ein gesetzlicher Feiertag in Brandenburg** sind. Gleichwertig formuliert: Montag bis Freitag abzüglich der Feiertage, die auf einen dieser fünf Wochentage fallen (`shared/auswertung.ts:10-14`).
- Ein Feiertag am Wochenende vermindert die Arbeitstagsanzahl nicht zusätzlich. Ein Feiertag von Montag bis Freitag vermindert sie genau um einen Tag. Es werden weder Ersatz- noch Brückentage berücksichtigt.
- Die Tests belegen 22 Arbeitstage für September 2026 ohne Feiertag, 22 für Januar 2025 nach Abzug von Neujahr und 18 für April 2023 nach Abzug von Karfreitag und Ostermontag. Eine leere Tagesliste ergibt `0` (`shared/auswertung.test.ts:11-33`).
- Die Arbeitstagsanzahl ist eine monatsbezogene Kalendergröße und für alle Mitarbeiter gleich. Persönliche Dienstplanbelegung, Urlaub, Krankheit, Beschäftigungsbeginn oder individuelle Arbeitstage verändern diese Zahl im Altsystem nicht. Die individuelle Wochenarbeitszeit wirkt sich erst bei der späteren Berechnung des Monatssolls aus (`shared/auswertung.ts:35-43`, `shared/auswertung.ts:85-93`).
- Beim Anlegen eines Dienstplans wird aus der Kalenderliste für jeden Tag genau eine Datenbankzeile mit dem Datum erzeugt. Wochentag und Feiertagsstatus werden nicht mitgespeichert (`main/db/dienstplanRepository.ts:66-106`, `shared/types.ts:46-60`). Repositorytests belegen 31 Tage im August sowie 28 beziehungsweise 29 Tage im Februar (`main/db/dienstplanRepository.test.ts:52-84`).
- In der Planungsseite wird die Kalenderklassifikation aus Jahr und Monat neu berechnet. Sie steuert die Anzeige von Datum, Wochentag, Feiertagsname und die Hervorhebung von Feiertagen beziehungsweise Wochenenden; dieselbe Liste wird an die Auswertung übergeben (`renderer/src/pages/PlanPage.tsx:62-76`, `renderer/src/pages/PlanPage.tsx:111`, `renderer/src/pages/PlanPage.tsx:499-542`, `renderer/src/components/layout/PlanungsGrid.tsx:360-388`). Damit ist der Feiertagsstatus kein Snapshot eines gespeicherten Dienstplans, sondern folgt jeweils dem aktuell implementierten Kalendercode.

### 2. Daraus ableitbare fachliche Bedeutung

- Der Dienstplan umfasst immer den vollständigen Kalendermonat, nicht nur die Arbeitstage. Auch Wochenenden und Feiertage sind planbare Tage und werden lediglich gesondert gekennzeichnet.
- Der Begriff **Arbeitstag** bezeichnet im Altsystem eine abstrakte Sollzeit-Größe auf Basis einer gleichmäßig auf Montag bis Freitag verteilten Fünf-Tage-Woche. Er beschreibt nicht, ob ein bestimmter Mitarbeiter an diesem Tag tatsächlich arbeitet.
- Samstag ist nach dieser Regel kein Arbeitstag. Der in Testkommentaren teilweise verwendete Begriff „Werktag“ darf daher nicht im allgemeinen rechtlichen Sinn verstanden werden, in dem auch Samstage erfasst sein können.
- Feiertage wirken nur einmal auf die Arbeitstagszahl: Ein Feiertag von Montag bis Freitag wird ausgeschlossen; ein ohnehin ausgeschlossenes Wochenende bleibt unabhängig vom zusätzlichen Feiertagsstatus ein einzelner Kalendertag.
- Die Feiertagslogik ist vollständig auf Brandenburg festgelegt. Andere Bundesländer, regionale Feiertage, betriebliche Schließtage und individuelle Abwesenheiten sind nicht Teil der Berechnung.

### 3. Grenzfälle und Unklarheiten

- Der Quellcode bezeichnet die Feiertagsliste als gesetzliche Feiertage nach dem Brandenburger Feiertagsgesetz. In diesem Schritt wurde jedoch keine aktuelle rechtliche Prüfung außerhalb des alten `src`-Stands vorgenommen. Die Liste ist daher ein belegter Implementierungsstand, aber noch keine Bestätigung ihrer aktuellen oder für sämtliche historischen und zukünftigen Jahre gültigen Rechtslage.
- Die normale Benutzeroberfläche bietet nur Monate `1` bis `12` und fünf Jahre vom aktuellen Jahr minus zwei bis plus zwei an (`renderer/src/pages/PlanPage.tsx:47-76`). Die Kalenderfunktion, der IPC-Handler und die Datenbank sichern gültige Ganzzahlen und diese Bereiche jedoch nicht erneut ab (`shared/kalendertage.ts:66-87`, `main/ipc/dienstplanHandlers.ts:23-38`, `main/db/dienstplanRepository.ts:17-37`). JavaScript würde ungültige Monate teilweise in andere Monate oder Jahre normalisieren, während die erzeugten Datumstexte weiterhin den ungeprüften Eingabemonat enthalten könnten.
- Änderungen der gesetzlichen Feiertage über die Zeit werden nicht versioniert. Der heutige Algorithmus wird gleichermaßen auf jedes auswählbare Jahr und auf wieder geladene Pläne angewendet.
- Bei zwei Feiertagen am selben Datum kann nur eine Bezeichnung angezeigt werden. Für die Arbeitstagsberechnung ist das folgenlos, fachlich kann die verlorene zweite Bezeichnung aber unvollständig sein.
- Individuelle Teilzeitmodelle mit weniger oder anderen regelmäßigen Arbeitstagen pro Woche werden nicht abgebildet. Die spätere Sollzeitformel teilt jede Wochenarbeitszeit pauschal auf fünf Arbeitstage auf. Ob dieses Modell für alle Mitarbeiter gelten soll, muss spätestens bei der Sollberechnung bestätigt werden.

### 4. Noch nötige Nutzerentscheidungen

1. Soll für den neuen Dienstplaner verbindlich der gregorianische Kalendermonat mit allen Kalendertagen und der Zeitzonen-unabhängigen Datumsdarstellung `JJJJ-MM-TT` gelten?
2. Soll die Feiertagsberechnung fest auf die gesetzlichen Feiertage des Landes Brandenburg begrenzt bleiben, und soll die oben aufgeführte Liste nach einer einmaligen Prüfung gegen die aktuelle amtliche Fassung verbindlich übernommen werden?
3. Soll ein monatlicher Arbeitstag verbindlich als Montag bis Freitag ohne gesetzlichen Feiertag in Brandenburg definiert werden, unabhängig von Dienstplanbelegung und persönlichen Abwesenheiten und ohne Ersatz für Feiertage am Wochenende?
4. Soll bei mehreren Feiertagen am selben Datum der Tag weiterhin nur einmal gezählt, in der Anzeige aber sollen alle zutreffenden Feiertagsnamen erhalten bleiben?
5. Welche Jahre sollen fachlich unterstützt werden? Unabhängig davon sollten Monat und Jahr an jeder Eingangsgrenze als gültige Ganzzahlen geprüft werden; der bisherige Bereich „aktuelles Jahr ± 2“ ist nur eine Oberflächenentscheidung.

### 5. Verständliche, pragmatische Empfehlung

1. **Kalendergrundlage übernehmen.** Ein Dienstplan sollte alle Tage eines gregorianischen Kalendermonats in chronologischer Reihenfolge enthalten. UTC-basierte Datumsberechnung und reine Kalenderdaten ohne Uhrzeit vermeiden Zeitzonenfehler.
2. **Brandenburg als eindeutigen Geltungsbereich festlegen.** Die zwölf im Altsystem enthaltenen Feiertage sind eine nachvollziehbare Ausgangsbasis. Vor der verbindlichen Übernahme sollte die Liste einmal gegen die aktuelle amtliche Gesetzesfassung geprüft werden; danach sollte sie zentral gepflegt werden.
3. **Arbeitstagsformel übernehmen und sprachlich präzisieren.** Empfohlen ist „Montag bis Freitag, sofern kein gesetzlicher Feiertag in Brandenburg“. Urlaub, Krankheit, Planbelegung und andere individuelle Umstände verändern diese Kalendergröße nicht. Der missverständliche Begriff „Werktag“ sollte dafür vermieden werden.
4. **Überschneidungen einmal zählen, aber vollständig benennen.** Ein Datum bleibt genau ein Kalendertag und wird höchstens einmal aus den Arbeitstagen ausgeschlossen. Treffen mehrere Feiertagsgründe zusammen, sollten ihre Namen dennoch gemeinsam angezeigt werden.
5. **Gültige Eingaben absichern.** Der Monat muss eine ganze Zahl von `1` bis `12` sein. Für das Jahr sollte ein fachlich sinnvoller Unterstützungsbereich festgelegt und technisch an allen Eingangsgrenzen durchgesetzt werden; die dynamische Fünf-Jahres-Auswahl sollte nicht ungeprüft zur Fachregel werden.

### Status von Schritt 3

Die Analyse von Kalender, Brandenburger Feiertagen und monatlichen Arbeitstagen ist abgeschlossen. Verbindlich bestätigte Regeln werden nachfolgend festgehalten; die übrigen Empfehlungen bleiben bis zur gemeinsamen Entscheidung unverbindlich.

### Bereits verbindlich entschieden

Am 10. September 2026 wurde die allgemeine Kalendergrundlage festgelegt:

- Ein Dienstplan enthält sämtliche Kalendertage des ausgewählten gregorianischen Monats in chronologischer Reihenfolge.
- Das interne Datumsformat ist `JJJJ-MM-TT`.
- Datumsberechnungen erfolgen unabhängig von Uhrzeit, lokaler Zeitzone und Sommerzeit.
- Samstag und Sonntag gelten als Wochenende.
- Wochenenden und Feiertage bleiben im Dienstplan enthalten und planbar; sie werden gesondert gekennzeichnet und in abhängigen Berechnungen berücksichtigt.

Für die Feiertagsgrundlage wurde festgelegt:

- Berücksichtigt werden die zwölf regelmäßig wiederkehrenden gesetzlichen Feiertage Brandenburgs aus § 2 Absatz 1 des Brandenburger Feiertagsgesetzes.
- Bewegliche Feiertage werden aus dem Ostersonntag des jeweiligen Jahres berechnet.
- Feiertage anderer Bundesländer sowie Gedenk-, Trauer- und sonstige religiöse Feiertage werden nicht berücksichtigt.
- Einmalige, durch Rechtsverordnung bestimmte Sondertage werden im Prototyp nicht automatisch unterstützt. Bei Bedarf muss die Feiertagsgrundlage ausdrücklich aktualisiert werden.

Für die monatliche Arbeitstagszahl wurde festgelegt:

- Ein kalendarischer Arbeitstag ist ein Montag bis Freitag, der kein gesetzlicher Feiertag in Brandenburg ist.
- Die Arbeitstagszahl ist für alle Mitarbeiter gleich und wird nicht durch Urlaub, Krankheit, Planbelegung, Beschäftigungsbeginn oder persönliche Arbeitszeitverteilung verändert.
- Feiertage am Samstag oder Sonntag reduzieren die Zahl nicht zusätzlich und erzeugen keinen Ersatzarbeitstag.
- Für diese Berechnung wird der Begriff `kalendarischer Arbeitstag` verwendet; der missverständliche Begriff `Werktag` wird vermieden.

Für Feiertagsüberschneidungen wurde festgelegt:

- Ein Datum bleibt genau ein Kalendertag und wird bei der Arbeitstagsberechnung höchstens einmal ausgeschlossen.
- Treffen mehrere gesetzliche Feiertage auf dasselbe Datum, bleiben alle Feiertagsbezeichnungen erhalten und werden gemeinsam angezeigt.
- Das Überschreiben einer früher erfassten Feiertagsbezeichnung durch eine später erfasste Bezeichnung wird nicht übernommen.

Für gültige Kalendereingaben wurde festgelegt:

- Der Monat ist eine ganze Zahl von `1` bis `12`.
- Das Jahr ist ein gültiges, von der Anwendung zugelassenes gregorianisches Kalenderjahr.
- Kalender- und Feiertagsberechnungen müssen für jedes in der Anwendung auswählbare Jahr funktionieren.
- Der konkrete Auswahlbereich der Oberfläche ist keine Berechnungsregel und wird bei der fachlichen Beschreibung der Planungsseite festgelegt.

Diese Entscheidungen wurden in `docs/Berechnungen/` übernommen. Schritt 3 ist damit auch fachlich vollständig abgeschlossen.

## Ergebnis von Schritt 4: Berechnungsarten und Snapshot-Verhalten

### 1. Implementierter Ist-Stand

#### Zwei Berechnungsarten einer Eintragsdefinition

- Das Datenmodell kennt ausschließlich die Berechnungsarten `fest` und `mitarbeiterabhaengig` (`shared/types.ts:32-44`). Die Auswahl ist nicht auf bestimmte Kürzel oder Eintragsnamen begrenzt. Der Test verwendet „Urlaub“ nur als Beispiel; technisch kann jede Definition als mitarbeiterabhängig angelegt werden (`renderer/src/lib/planeintragSnapshot.test.ts:28-40`).
- Eine feste Eintragsdefinition enthält Kürzel, Name, optionalen Beginn und optionales Ende sowie fünf voneinander getrennte Zeitdauern: Anwesenheitszeit, Arbeitszeit, Arbeitszeit ohne Nachtbereitschaft, Nachtbereitschaft und Nachtarbeit (`shared/types.ts:32-44`). Aus Beginn und Ende wird keine dieser Dauern berechnet.
- Beim Wechsel einer Definition auf `mitarbeiterabhaengig` leert die Oberfläche Beginn und Ende und setzt alle fünf Dauerfelder auf `00:00`. Die Felder werden anschließend deaktiviert (`renderer/src/pages/EintraegePage.tsx:83-96`, `renderer/src/components/EintragsdefinitionForm.tsx:122-198`). Die Validierung verlangt entsprechend `null` für Beginn und Ende sowie `0` für alle fünf gespeicherten Dauerfelder (`renderer/src/lib/validateEintragsdefinition.ts:70-94`).
- Bei einer festen Definition prüft das Altsystem nur, dass die fünf Zeitdauern nichtnegative ganze Minutenwerte sind. Es erzwingt keine Beziehungen wie `Arbeitszeit <= Anwesenheitszeit` oder eine Ableitung zwischen Arbeitszeit, Arbeitszeit ohne Nachtbereitschaft und Nachtbereitschaft (`renderer/src/lib/validateEintragsdefinition.ts:53-68`). Auch `00:00` in allen Feldern ist bei einer festen Definition zulässig.
- Die alte Validierung erlaubt bei einer festen Definition Beginn und Ende unabhängig voneinander als `null` (`renderer/src/lib/validateEintragsdefinition.test.ts:80-87`). Das widerspricht der bereits verbindlichen neuen Regel, nach der beide Uhrzeiten entweder gemeinsam gesetzt oder gemeinsam leer sein müssen.

#### Feldbelegung des konkreten Planeintrags

Beim Auswählen einer Definition für einen Mitarbeiter und einen Tag erzeugt die Planungsseite einen konkreten `PlaneintragSnapshot` (`renderer/src/pages/PlanPage.tsx:192-208`). Die Feldbelegung unterscheidet sich wie folgt:

| Feld des Snapshots | Berechnungsart `fest` | Berechnungsart `mitarbeiterabhaengig` |
| --- | --- | --- |
| `eintragsdefinitionId` | ID der ausgewählten Definition | ID der ausgewählten Definition |
| `kuerzel` | aus der Definition übernommen | aus der Definition übernommen |
| `beginn`, `ende` | aus der Definition übernommen | jeweils `null` |
| `anwesenheitszeitMinuten` | aus der Definition übernommen | `0` |
| `arbeitszeitMinuten` | aus der Definition übernommen | `0` |
| `arbeitszeitOhneNachtbereitschaftMinuten` | aus der Definition übernommen | individuelle Wochenarbeitszeit des Mitarbeiters geteilt durch fünf |
| `nachtbereitschaftMinuten` | aus der Definition übernommen | `0` |
| `nachtarbeitMinuten` | aus der Definition übernommen | `0` |

Diese Belegung ist direkt in `renderer/src/lib/planeintragSnapshot.ts:10-41` implementiert und durch `renderer/src/lib/planeintragSnapshot.test.ts:42-71` belegt. Der Name und die Berechnungsart der Definition werden dagegen nicht in den Planeintrag übernommen (`shared/types.ts:62-77`). Damit ist der Snapshot eine Kopie der für Anzeige und Auswertung benötigten konkreten Werte, aber kein vollständiges Abbild der Eintragsdefinition.

Die mitarbeiterabhängige Tageszeit wird im Altsystem als `rundeAufVolleMinute(wochenarbeitszeitMinuten / 5)` gebildet (`renderer/src/lib/mitarbeiterabhaengigeArbeitszeit.ts:1-7`). Aufgrund der bereits verbindlich festgelegten Fünf-Minuten-Schritte ist die Division im neuen Fachmodell immer restlos. Für diese Berechnung ist deshalb keine Rundung und keine Resteverteilung mehr erforderlich.

#### Zeitpunkt und Bedeutung des Snapshots

- Der konkrete Snapshot entsteht bereits beim Setzen beziehungsweise erneuten Auswählen eines Eintrags in der Planungsoberfläche, nicht erst beim Speichern und nicht erst bei der Auswertung (`renderer/src/pages/PlanPage.tsx:192-208`).
- Bis zum Speichern liegt der Snapshot im lokalen Planentwurf. Die Oberfläche vergleicht den gesamten Snapshot mit dem zuletzt geladenen beziehungsweise gespeicherten Stand, um geänderte Zellen zu erkennen (`renderer/src/pages/PlanPage.tsx:82-87`, `renderer/src/pages/PlanPage.tsx:113-125`).
- Beim Speichern wird nicht erneut gerechnet. Das Repository löscht für die Kombination aus Dienstplantag und Mitarbeiter zunächst den bisherigen Datensatz und fügt anschließend den vom Renderer gelieferten Snapshot unverändert ein (`main/db/dienstplanRepository.ts:147-189`).
- Beim Laden werden die gespeicherten Snapshot-Felder unverändert wieder in den Planentwurf übernommen; weder die aktuelle Eintragsdefinition noch die aktuelle Wochenarbeitszeit werden dabei herangezogen (`renderer/src/lib/planeintragSnapshot.ts:44-63`, `renderer/src/pages/PlanPage.tsx:314-339`).
- Je Kombination aus Dienstplantag und Mitarbeiter kann höchstens ein Planeintrag gespeichert werden. Dies wird durch einen eindeutigen Datenbankschlüssel abgesichert (`main/db/planeintragRepository.ts:6-23`).

Der implementierte Snapshot bedeutet somit: Der im Moment des Setzens konkrete Eintragswert soll für diese Planungszelle erhalten bleiben. Spätere Änderungen an der Eintragsdefinition wirken nicht rückwirkend auf bereits gesetzte Einträge. Das gilt auch, wenn Kürzel, Zeiten, Berechnungsart oder Dauerwerte der Definition geändert werden.

#### Spätere Änderungen an Definition und Mitarbeiter

- Das Aktualisieren einer Eintragsdefinition verändert nur den Definitionsdatensatz. Bestehende Planeinträge werden weder gesucht noch aktualisiert (`main/db/eintragsdefinitionRepository.ts:55-75`).
- Eine Eintragsdefinition darf sogar gelöscht werden, obwohl bestehende Planeinträge noch ihre ID enthalten. Der alte Planeintrag und seine Snapshot-Werte bleiben ausdrücklich bestehen (`main/db/eintragsdefinitionRepository.test.ts:174-212`). `eintragsdefinitionId` ist in der Planeintrag-Tabelle kein technisch erzwungener Fremdschlüssel (`main/db/planeintragRepository.ts:8-22`).
- Eine geänderte Wochenarbeitszeit aktualisiert bestehende mitarbeiterabhängige Einträge ebenfalls nicht. Nur beim späteren erneuten Setzen wird aus der dann aktuellen Wochenarbeitszeit ein neuer Tageswert berechnet (`renderer/src/pages/PlanPage.tsx:192-208`, `main/db/teamRepository.ts:38-54`).
- Der Dienstplan enthält jedoch keinen Mitarbeiter-Snapshot. Gespeichert wird nur `teamMemberId`, nicht Name, Rolle, Farbe oder die bei der Eintragsberechnung verwendete Wochenarbeitszeit (`shared/types.ts:62-77`). Ein verwendeter Mitarbeiter kann deshalb nicht gelöscht, aber weiterhin bearbeitet werden (`main/db/teamRepository.ts:38-73`, `main/db/teamRepository.test.ts:88-157`).
- Dadurch entsteht nach einer Änderung der Wochenarbeitszeit ein gemischter Stand: Bereits gesetzte mitarbeiterabhängige Ist-Zeitwerte bleiben auf der alten Wochenarbeitszeit eingefroren, während das spätere Monatssoll mit der aktuell geladenen Wochenarbeitszeit berechnet wird (`shared/auswertung.ts:35-43`, `shared/auswertung.ts:85-93`). Diese Kombination ist im Altsystem nicht fachlich aufgelöst und wird nicht durch einen eigenen Test abgedeckt.
- Entsprechend können auch spätere Änderungen an Name, Rolle oder Farbe die Darstellung beziehungsweise die Einbeziehung in Auswertungen alter Pläne verändern, obwohl die Planeinträge selbst unverändert bleiben. Insbesondere werden Kennzahlen nur für aktuell als `Erzieher` geführte Mitarbeiter erzeugt (`renderer/src/components/layout/PlanungsGrid.tsx:226-240`).

#### Erneutes Setzen, Ersetzen und Entfernen

- Die Auswahl „Kein Eintrag“ entfernt den Snapshot aus dem Entwurf. Beim nächsten Speichern wird die gespeicherte Zeile gelöscht (`renderer/src/components/EintragsdefinitionAuswahl.tsx:29-50`, `renderer/src/pages/PlanPage.tsx:192-208`, `renderer/src/pages/PlanPage.tsx:239-268`).
- Das Auswählen einer Definition ersetzt den bisherigen Entwurf der Zelle vollständig durch einen neu erzeugten Snapshot. Bei einer mitarbeiterabhängigen Definition wird dabei die zu diesem Zeitpunkt geladene Wochenarbeitszeit erneut verwendet (`renderer/src/pages/PlanPage.tsx:192-208`).
- Das Repository setzt Ersetzungen technisch als Löschen und anschließendes Einfügen um. Daher erhält der gespeicherte Planeintrag eine neue technische ID; fachlich bleibt es dieselbe Planungszelle (`main/db/dienstplanRepository.ts:163-189`, `main/db/dienstplanRepository.test.ts:184-214`).
- Wird dieselbe unveränderte Definition bei unveränderten Mitarbeiterdaten erneut gewählt, entsteht inhaltlich derselbe Snapshot und damit keine bleibende fachliche Änderung. Haben sich Definition oder Wochenarbeitszeit geändert, übernimmt das erneute Setzen bewusst den neuen Stand.

#### Rollenbezug

- Die Snapshot-Berechnung prüft die Rolle des Mitarbeiters nicht. Im Planungsraster kann jede vorhandene Eintragsdefinition für `Erzieher`, `Praktikant` und `Wirtschaftskraft` ausgewählt werden; die Auswahl lädt ebenfalls ungefiltert alle Definitionen (`renderer/src/components/layout/PlanungsGrid.tsx:390-405`, `renderer/src/components/EintragsdefinitionAuswahl.tsx:17-51`).
- Die mitarbeiterabhängige Berechnung verwendet für alle Rollen dieselbe Formel `Wochenarbeitszeit / 5` (`renderer/src/lib/planeintragSnapshot.ts:10-27`). Eine Beschränkung beispielsweise auf Urlaubs- oder Krankheitskürzel oder auf Erzieher gibt es nicht.
- Davon getrennt filtert das Altsystem bestimmte Auswertungen auf die Rolle `Erzieher`. Ob Planungseinträge und ihre Berechnung grundsätzlich rollenunabhängig bleiben sollen, ist deshalb eine eigene Fachentscheidung; die genaue Reichweite der Auswertungsfilter gehört zusätzlich in die späteren Schritte 5 bis 7.

### 2. Nachgewiesener Testwiderspruch und technische Grenzen

- Der direkte Snapshot-Test und die produktive Erzeugungsfunktion legen den mitarbeiterabhängigen Tageswert in `arbeitszeitOhneNachtbereitschaftMinuten` ab und setzen `arbeitszeitMinuten` auf `0` (`renderer/src/lib/planeintragSnapshot.ts:14-27`, `renderer/src/lib/planeintragSnapshot.test.ts:57-71`).
- Der Dienstplan-Repositorytest verwendet dagegen einen manuell gebauten, als mitarbeiterabhängig bezeichneten Snapshot mit `468` Minuten in `arbeitszeitMinuten` und `0` Minuten in `arbeitszeitOhneNachtbereitschaftMinuten`; er erwartet ausdrücklich die unveränderte Speicherung dieses Werts (`main/db/dienstplanRepository.test.ts:33-43`, `main/db/dienstplanRepository.test.ts:256-271`). Dieser Test widerspricht der tatsächlichen Erzeugungsregel. Er belegt nur, dass das Repository beliebige gelieferte Snapshot-Felder unverändert speichert.
- Die fachliche Validierung findet nur in der Renderer-Oberfläche statt. IPC-Handler, Definitionsrepository und Dienstplanrepository validieren Berechnungsart, Nullfelder, Zeitwerte und Snapshot-Zusammenhänge nicht erneut (`main/ipc/eintragsdefinitionHandlers.ts:14-33`, `main/ipc/dienstplanHandlers.ts:23-63`). Ein fehlerhafter oder manipuliert übergebener Snapshot kann deshalb gespeichert werden.
- Der `dienstplanId` des Speichervorgangs wird nicht gegen die zu den Änderungen gelieferten `dienstplantagId`-Werte geprüft. Der normale Oberflächenweg liefert passende IDs, das Repository selbst erzwingt diese Zuordnung jedoch nicht (`main/db/dienstplanRepository.ts:147-189`). Das ist eine technische Integritätslücke, keine zusätzliche fachliche Berechnungsregel.

### 3. Fachliche Bedeutung

- `fest` bedeutet: Die Definition enthält die konkreten Zeitwerte, die für jeden Mitarbeiter gleich sind. Beim Setzen werden diese Werte in die Planungszelle kopiert.
- `mitarbeiterabhängig` bedeutet im Altsystem nicht allgemein „beliebige personalisierte Berechnung“, sondern genau eine fest verdrahtete Regel: Ein Fünftel der individuellen Wochenarbeitszeit wird als Arbeitszeit ohne Nachtbereitschaft angesetzt; alle anderen Uhrzeit- und Dauerfelder bleiben leer beziehungsweise null.
- Der Snapshot trennt eine bereits geplante Zelle von späteren Änderungen an der wiederverwendbaren Definition. Das schützt abgeschlossene oder ältere Pläne vor unbemerkten rückwirkenden Änderungen.
- Für mitarbeiterabhängige Einträge reicht ein Eintrags-Snapshot allein nicht aus, um einen historischen Dienstplan vollständig konsistent zu halten. Ohne Mitarbeiter-Snapshot kann das Monatssoll später auf einer anderen Wochenarbeitszeit und Rollenlage beruhen als die bereits eingefrorenen Planeinträge.
- Das Entfernen und erneute Setzen ist fachlich eine bewusste Neuanwendung der aktuell gültigen Definition und Mitarbeiterdaten. Dadurch kann eine einzelne Zelle gezielt auf den neuen Stand gebracht werden, ohne alle früheren Einträge automatisch umzuschreiben.

### 4. Grenzfälle und Unklarheiten

- Es ist noch nicht entschieden, ob die fünf Zeitfelder fester Definitionen tatsächlich vollständig unabhängig bleiben dürfen oder ob fachliche Plausibilitätsbeziehungen erforderlich sind. Der Quellcode liefert dafür keine belastbare Regel.
- Es ist nicht festgelegt, ab welchem Datum eine Änderung der Wochenarbeitszeit gelten soll. Ein einzelner aktueller Wert am Mitarbeiter kann weder vergangene Zeiträume zuverlässig bewahren noch Änderungen innerhalb eines Monats abbilden.
- Der Snapshot speichert weder den Namen noch die Berechnungsart der Definition. Nach deren Löschung bleiben Kürzel und konkrete Zeitwerte lesbar, die vollständige ursprüngliche Bedeutung ist aber nicht mehr aus dem Planeintrag allein rekonstruierbar.
- Einträge dürfen im Altsystem rollenunabhängig gesetzt werden, während die Kennzahlenanzeige rollenabhängig ist. Dadurch können gespeicherte Einträge für Praktikanten oder Wirtschaftskräfte vorhanden sein, ohne in derselben Weise ausgewertet zu werden.
- Eine automatische rückwirkende Aktualisierung würde historische Werte verändern; ein vollständiges Einfrieren ohne Mitarbeiter-Snapshot kann dagegen Soll und Ist auseinanderlaufen lassen. Beides darf nicht unbeabsichtigt aus rein technischen Änderungen folgen.

### 5. Ursprünglich erkannte Entscheidungsfragen

1. **Feldbelegung bestätigen:** Soll `fest` alle fünf ausdrücklich gepflegten Zeitwerte übernehmen und `mitarbeiterabhaengig` ausschließlich `Wochenarbeitszeit / 5` in `Arbeitszeit ohne Nachtbereitschaft` setzen, während alle übrigen Zeitfelder `0` und Beginn/Ende leer bleiben?
2. **Snapshot-Zeitpunkt bestätigen:** Soll der Snapshot beim Setzen entstehen und danach unverändert bleiben, bis die Zelle entfernt oder bewusst erneut gesetzt wird?
3. **Historische Mitarbeiterdaten festlegen:** Soll ein Dienstplan die für seine Berechnungen maßgebliche Wochenarbeitszeit und Rolle je Mitarbeiter ebenfalls einfrieren, damit spätere Teamänderungen vergangene Soll-/Ist-Auswertungen nicht verändern?
4. **Rollenbezug festlegen:** Sollen beide Berechnungsarten grundsätzlich für alle Rollen auswählbar sein und Rollenbeschränkungen nur bei einzelnen Funktionen wie der Rufbereitschaft gelten?
5. **Löschung einer Definition festlegen:** Sollen bestehende Planeinträge nach dem Löschen ihrer Definition mit ihren Snapshots erhalten bleiben, während die gelöschte Definition nicht mehr neu ausgewählt werden kann?

Die Frage nach zusätzlichen Plausibilitätsbeziehungen zwischen den fünf festen Zeitfeldern kann sinnvoll gemeinsam mit den Zeit-Summen in Schritt 6 entschieden werden, weil erst dort ihre jeweilige Auswertungswirkung vollständig betrachtet wird.

### 6. Verständliche, pragmatische Empfehlung

1. **Die konkrete Zweiteilung übernehmen.** Feste Definitionen liefern ihre gepflegten Werte; mitarbeiterabhängige Definitionen bilden ausschließlich den minutengenauen Tageswert `Wochenarbeitszeit / 5` in `Arbeitszeit ohne Nachtbereitschaft` ab. Durch die verbindliche Fünf-Minuten-Regel ist dabei keine Rundung nötig.
2. **Snapshots beim Setzen bilden und nicht automatisch nachziehen.** Änderungen an Definitionen dürfen bestehende Planungszellen nicht rückwirkend verändern. Entfernen und erneutes Setzen wendet bewusst den aktuellen Stand neu an.
3. **Mitarbeiterdaten je Dienstplan ergänzend einfrieren.** Mindestens die für Berechnungen maßgebliche Wochenarbeitszeit und Rolle sollten für den Plan gelten. Sinnvoll ist ein Mitarbeiter-Snapshot je Dienstplan mit Name, Rolle, Wochenarbeitszeit und gegebenenfalls Farbe, damit Darstellung und Auswertung gemeinsam historisch stabil bleiben.
4. **Berechnungsarten zunächst rollenunabhängig halten.** Ein allgemeiner Rollenzwang ist im Altsystem nicht begründet. Konkrete Rollenbeschränkungen sollten nur dort festgelegt werden, wo die Fachfunktion sie verlangt; Auswertungsfilter werden in den späteren Schritten gesondert entschieden.
5. **Definitionslöschung ohne rückwirkenden Datenverlust übernehmen.** Gespeicherte Planeinträge bleiben erhalten. Für bessere Nachvollziehbarkeit sollte ein künftiger Snapshot zusätzlich den Definitionsnamen und die Berechnungsart festhalten oder die Definition nur archivieren statt physisch zu löschen.
6. **Regeln an der fachlichen Speichergrenze validieren.** Die verbindliche Feldbelegung sollte nicht nur durch deaktivierte Formularfelder geschützt sein. Beim Speichern muss verhindert werden, dass widersprüchliche Snapshots wie im alten Repositorytest entstehen.

### Status von Schritt 4

Die Quellcodeanalyse zu festen und mitarbeiterabhängigen Einträgen, Feldbelegung, Berechnungszeitpunkt, Snapshot-Wirkung, späteren Änderungen, Ersetzen, Entfernen, Rollenbezug und Speicherung ist abgeschlossen. Die verbleibenden Fachentscheidungen werden nachfolgend schrittweise getroffen, bevor Schritt 4 auch fachlich verbindlich abgeschlossen werden kann.

### Bereits verbindlich entschieden

Am 10. September 2026 wurden die Berechnungsarten und ihre Feldbelegung festgelegt:

- Jede Planungseintragsdefinition wird ausdrücklich als `Feste Zeitwerte` oder `Wochenarbeitszeit` geführt. Kürzel und Bezeichnung bestimmen die Berechnungsart nicht automatisch.
- Bei `Feste Zeitwerte` werden Kürzel, Beginn, Ende, Anwesenheitszeit, reine Arbeitszeit, Nachtbereitschaft und Nachtarbeit unverändert übernommen. Arbeitszeit (mit NB) wird beim Setzen als reine Arbeitszeit plus Nachtbereitschaft berechnet.
- Im neuen Projekt wird die alte Bezeichnung „Arbeitszeit ohne Nachtbereitschaft“ als **reine Arbeitszeit** geführt. Die alte Bezeichnung „Arbeitszeit“ wird als **Arbeitszeit (mit NB)** geführt.
- Bei `Wochenarbeitszeit` wird der Tageswert als `individuelle Wochenarbeitszeit / 5` berechnet. Reine Arbeitszeit und Arbeitszeit (mit NB) erhalten beide diesen Tageswert, weil die Nachtbereitschaft `0` ist.
- Anwesenheitszeit, Nachtbereitschaft und Nachtarbeit werden bei dieser Berechnungsart auf `0` gesetzt; Beginn und Ende bleiben leer.
- Wegen der verbindlichen Fünf-Minuten-Schritte ist keine Rundung oder Resteverteilung erforderlich.

Für den Snapshot-Zeitpunkt wurde festgelegt:

- Die konkreten Werte eines Planungseintrags werden beim Setzen für den gewählten Mitarbeiter und Kalendertag bestimmt.
- Änderungen an der Eintragsdefinition verändern bestehende Planungseinträge nicht rückwirkend.
- Speichern, Laden und Auswerten führen keine erneute Berechnung aus der Definition durch.
- Entfernen löscht den Snapshot der Planungszelle; bewusstes erneutes Setzen ersetzt ihn vollständig durch einen neuen Snapshot nach dem dann aktuellen Stand.

Für die Mitarbeiterdaten eines Monatsplans wurde festgelegt:

- Beim Anlegen des Plans werden die zu diesem Zeitpunkt aktiven Mitarbeiter mit Name, Rolle, Wochenarbeitszeit, Farbe und Reihenfolge in den Plan kopiert.
- Berechnungen und Darstellungen verwenden ausschließlich diesen Mitarbeiter-Snapshot des Plans.
- Spätere Änderungen in der Teamverwaltung verändern bestehende Pläne und deren Auswertungen nicht.
- Später angelegte Mitarbeiter werden nicht automatisch in bestehende Pläne aufgenommen.
- Deaktivieren oder Löschen eines Mitarbeiter-Stammdatensatzes entfernt den Mitarbeiter-Snapshot nicht aus bestehenden Plänen.

Für den Rollenbezug der Berechnungsarten wurde festgelegt:

- `Feste Zeitwerte` und `Wochenarbeitszeit` können für jeden Mitarbeiter des Monatsplans verwendet werden.
- Die Rolle schränkt die Auswahl und die Berechnung eines Planungseintrags nicht ein.
- Bei `Wochenarbeitszeit` gilt für alle Rollen dieselbe Formel.
- Rollenabhängige Einschränkungen und Auswertungsfilter werden nur bei der jeweils betroffenen Fachfunktion festgelegt.

Für deaktivierte oder gelöschte Eintragsdefinitionen wurde festgelegt:

- Bestehende Planungseinträge bleiben mit ihren vollständigen Snapshots erhalten.
- Deaktivierte oder gelöschte Definitionen werden für neue Planungseinträge nicht mehr angeboten.
- Der Snapshot enthält Herkunfts-ID, Kürzel, Bezeichnung, Beginn, Ende und sämtliche konkreten Zeitwerte.
- Die Herkunfts-ID dokumentiert nur die ursprüngliche Definition und ist keine lebende Abhängigkeit.
- Deaktivieren oder Löschen bewirkt weder eine rückwirkende Neuberechnung noch einen Datenverlust im Monatsplan.

Damit weicht die neue Regel bewusst vom Altsystem ab: Dort wurde bei der mitarbeiterabhängigen Berechnung nur die Arbeitszeit ohne Nachtbereitschaft gesetzt, während das Feld Arbeitszeit `0` blieb. Mit der fachlichen Bedeutung „Arbeitszeit (mit NB) = reine Arbeitszeit + Nachtbereitschaft“ wäre dieser alte Stand widersprüchlich.

Diese Entscheidungen wurden in `docs/Berechnungen/` übernommen. Schritt 4 ist damit auch fachlich vollständig abgeschlossen.

## Ergebnis von Schritt 5: Tagesbezogene Zählungen

### 1. Eingabedaten und Auswertungsrahmen

Die zentrale Funktion `berechneKennzahlenFuerMitarbeiter` erzeugt eine Monatsauswertung für genau einen über seine ID angegebenen Mitarbeiter. Für Schritt 5 verwendet sie folgende Eingaben:

- die ID des auszuwertenden Mitarbeiters,
- die Kalendertage des ausgewählten Monats mit Datum, Wochentag und Feiertagsstatus,
- die gespeicherten Dienstplantage mit ihrer technischen ID und ihrem Datum,
- den aktuellen Planeintragsentwurf als Zuordnung aus Dienstplantag und Mitarbeiter zu einem Eintrags-Snapshot sowie
- den aktuellen Rufbereitschaftsentwurf als Zuordnung aus Dienstplantag zu genau einer Mitarbeiter-ID (`shared/auswertung.ts:35-43`).

Die Funktion läuft über die übergebenen Kalendertage, ordnet jedem Datum eine Dienstplantag-ID zu und überspringt einen Kalendertag vollständig, wenn kein entsprechender Dienstplantag vorhanden ist. Erst danach werden Planeintrag und Rufbereitschaft dieses Tages geprüft (`shared/auswertung.ts:43-62`, `shared/auswertung.ts:80-83`). Ein Test belegt, dass ohne zugehörigen Dienstplantag weder SN/F-Dienst, freier Tag noch Rufbereitschaft gezählt werden (`shared/auswertung.test.ts:269-284`).

Die Berechnung arbeitet mit dem aktuellen Entwurf der Planungsseite. Dadurch fließen auch noch nicht gespeicherte Änderungen an Planeinträgen und Rufbereitschaften unmittelbar in die sichtbaren Kennzahlen ein. Dieselben Entwurfsdaten werden sowohl an das Planungsraster als auch an den Auswertungsdialog übergeben (`renderer/src/pages/PlanPage.tsx:499-542`, `renderer/src/components/layout/PlanungsGrid.tsx:226-243`, `renderer/src/components/AuswertungDialog.tsx:88-106`).

### 2. Implementierte Zählregeln

#### SN/F-Dienste

- Ein Planeintrag erhöht `anzahlSnfDienste` genau dann um `1`, wenn sein gespeichertes Kürzel exakt `SN/F` oder exakt `SN` lautet. Das Kürzel `F` wird nicht mitgezählt (`shared/auswertung.ts:62-65`).
- Gezählt wird der konkrete Snapshot in der Planungszelle, nicht die aktuelle Eintragsdefinition. Der Name, die Herkunfts-ID, die Berechnungsart und die Zeitwerte des Eintrags sind für diese Zählung ohne Bedeutung.
- Der Test belegt zwei Einträge mit `SN/F` und einen Eintrag mit `SN` als Ergebnis `3`; ein Eintrag mit `F` bleibt unberücksichtigt (`shared/auswertung.test.ts:69-99`).
- Wochentag, Wochenende und Feiertagsstatus werden für diese Kennzahl nicht geprüft. Ein passender Eintrag zählt daher im Altsystem an jedem Kalendertag gleich.

Die Bezeichnung „SN/F-Dienste“ ist technisch nicht vollständig eindeutig: Implementiert ist nicht nur das Kürzel `SN/F`, sondern die gemeinsame Anzahl der beiden Kürzel `SN/F` und `SN`.

#### Freie Tage

- Ein Tag gilt ausschließlich dann als freier Tag, wenn für den Mitarbeiter ein Planeintrag mit dem exakten Kürzel `/` vorhanden ist. Eine leere Planungszelle wird nicht als freier Tag gezählt (`shared/auswertung.ts:62-69`).
- Jeder solche Eintrag erhöht `anzahlFreieTage` unabhängig vom Wochentag, Wochenende oder Feiertagsstatus um `1`. Der Test belegt dies anhand eines Samstags und eines Montags (`shared/auswertung.test.ts:101-122`).
- Ein freier Samstag ist ein freier Tag mit Kürzel `/`, dessen Kalendertag den Wochentag `Sa` trägt. Andere Wochentage zählen nicht als freie Samstage (`shared/auswertung.ts:65-68`, `shared/auswertung.test.ts:124-145`).
- Ein freier Sonntag ist entsprechend ein freier Tag mit Kürzel `/` und Wochentag `So`. Der Feiertagsstatus ist dabei unerheblich: Ein Ostersonntag wird als freier Sonntag gezählt, ein Feiertag an einem Freitag dagegen nicht (`shared/auswertung.ts:65-69`, `shared/auswertung.test.ts:147-185`).
- Freie Samstage und freie Sonntage sind somit Teilmengen der freien Tage. Ein freier Samstag erhöht am selben Tag sowohl `anzahlFreieTage` als auch `anzahlFreieSamstage`; ein freier Sonntag entsprechend beide zugehörigen Zähler.

Der Code prüft für die Wochenend-Untergruppen ausschließlich `wochentag === 'Sa'` beziehungsweise `wochentag === 'So'`. Das allgemeine Feld `istWochenende` wird dafür nicht verwendet. Bei den regulär erzeugten Kalendertagen stimmen beide Angaben überein; widersprüchliche manuell konstruierte Eingaben würden jedoch anhand des Wochentags ausgewertet (`shared/auswertung.ts:65-69`).

#### Rufbereitschaften

- Rufbereitschaft ist kein Planeintrag und wird nicht aus einem Kürzel erkannt. Sie wird als eigene Zuordnung `Dienstplantag-ID -> Mitarbeiter-ID` geführt (`shared/types.ts:85-93`, `renderer/src/lib/rufbereitschaftEntwurf.ts:3-12`).
- Für den gerade ausgewerteten Mitarbeiter wird jeder Kalendertag um `1` gezählt, an dem die zu diesem Dienstplantag gespeicherte Mitarbeiter-ID exakt seiner ID entspricht (`shared/auswertung.ts:82`). Ein Test mit zwei verschiedenen Mitarbeitern belegt, dass nur die Zuordnung des angefragten Mitarbeiters zählt (`shared/auswertung.test.ts:233-248`).
- Wochentag, Wochenende, Feiertag und vorhandener Planeintrag spielen für die Rufbereitschaftszählung keine Rolle. Eine Rufbereitschaft kann deshalb grundsätzlich an jedem Kalendertag und zusätzlich zu jedem beliebigen Planeintrag bestehen.
- Pro Dienstplantag ist technisch höchstens eine Rufbereitschaft möglich. Die Datenbank erzwingt dies mit einem eindeutigen Schlüssel auf `dienstplantagId` (`main/db/rufbereitschaftRepository.ts:6-13`). Der zugehörige Test weist nach, dass ein zweiter Datensatz für denselben Dienstplantag abgelehnt wird (`main/db/dienstplanRepository.test.ts:440-453`).
- Das Ändern der zuständigen Person ersetzt die bisherige Rufbereitschaft dieses Tages; `null` entfernt sie ersatzlos (`main/db/dienstplanRepository.ts:191-205`, `main/db/dienstplanRepository.test.ts:343-390`).
- Beim Laden eines Plans werden ausschließlich die Rufbereitschaften dieses Dienstplans zurückgegeben (`main/db/rufbereitschaftRepository.ts:16-28`, `main/db/dienstplanRepository.test.ts:416-437`).

### 3. Zähleinheit und gleichzeitig mögliche Kennzahlen

Die Ergebnisse sind **monatliche Anzahlen pro Mitarbeiter**, die tagweise ermittelt werden. Unter den regulären Datenbankbedingungen gilt:

| Sachverhalt | Technische Grundlage | Höchster Beitrag eines Kalendertags zur Kennzahl eines Mitarbeiters |
| --- | --- | ---: |
| SN/F-Dienst | ein Planeintrags-Snapshot mit Kürzel `SN/F` oder `SN` | `1` |
| Freier Tag | ein Planeintrags-Snapshot mit Kürzel `/` | `1` |
| Freier Samstag | derselbe freie Eintrag an einem Samstag | `1` |
| Freier Sonntag | derselbe freie Eintrag an einem Sonntag | `1` |
| Rufbereitschaft | separate Rufbereitschaftszuordnung für den Tag | `1` |

Je Kombination aus Dienstplantag und Mitarbeiter kann nur ein Planeintrag existieren (`main/db/planeintragRepository.ts:6-23`). Ein einzelner Planeintrag kann daher wegen der unterschiedlichen exakten Kürzel nicht zugleich SN/F-Dienst und freier Tag sein. Mehrere Kennzahlen an demselben Datum sind dennoch möglich:

- `/` an einem Samstag zählt als freier Tag und freier Samstag.
- `/` an einem Sonntag zählt als freier Tag und freier Sonntag.
- Eine unabhängig gespeicherte Rufbereitschaft kann zusätzlich zu einem freien Tag oder einem SN/F-Dienst für denselben Mitarbeiter gezählt werden.

Mehrere unterschiedliche Eintragsdefinitionen mit demselben passenden Kürzel ändern die Zähllogik nicht. Entscheidend ist allein das Kürzel des konkreten Snapshots; pro Mitarbeiter und Tag bleibt es wegen des eindeutigen Zellenschlüssels bei höchstens einem Beitrag.

### 4. Exakte Kürzel, Groß-/Kleinschreibung und Leerzeichen

Alle drei kürzelbasierten Erkennungen verwenden exakte, groß-/kleinschreibungssensitive Zeichenkettenvergleiche. Es findet bei der Auswertung weder eine Normalisierung noch ein Entfernen von Leerzeichen statt (`shared/auswertung.ts:62-69`). Dadurch zählen beispielsweise `sn`, `Sn`, `SN `, ` SN/F` oder ` / ` nicht.

Diese Strenge wird bei der Eingabe nicht zuverlässig abgesichert:

- Die Validierung prüft nur, ob nach gedanklichem Entfernen äußerer Leerzeichen überhaupt noch ein Zeichen vorhanden ist; sie verändert das Kürzel selbst nicht (`renderer/src/lib/validateEintragsdefinition.ts:26-35`).
- Die Eintragsseite übernimmt das Kürzel unverändert aus dem Formular in den Speicherdatensatz, während nur Beginn und Ende tatsächlich getrimmt werden (`renderer/src/pages/EintraegePage.tsx:126-137`).
- Datenbank und Repository speichern den gelieferten Text ebenfalls unverändert und erzwingen weder erlaubte Kürzel noch Eindeutigkeit (`main/db/eintragsdefinitionRepository.ts:6-20`, `main/db/eintragsdefinitionRepository.ts:35-52`).
- Beim Setzen eines Planeintrags wird genau dieser Text in den Snapshot kopiert (`renderer/src/lib/planeintragSnapshot.ts:10-40`).

Die vorhandenen Auswertungstests verwenden nur die exakten Kürzel `SN/F`, `SN`, `F` und `/`. Varianten mit abweichender Groß-/Kleinschreibung oder Leerzeichen sind nicht getestet (`shared/auswertung.test.ts:69-185`). Dadurch kann ein formal speicherbares Kürzel für den Benutzer nahezu gleich aussehen, aber unbemerkt aus der Kennzahl herausfallen.

### 5. Rollenbezug

Die Berechnungsfunktion selbst kennt keine Rolle. Sie erhält nur Mitarbeiter-ID und Wochenarbeitszeit und kann technisch für jede Rolle aufgerufen werden (`shared/auswertung.ts:35-42`). Die Rollenbeschränkung liegt vollständig bei den aufrufenden Oberflächen:

- Das ausführliche Planungsraster berechnet Kennzahlen ausschließlich für aktuell als `Erzieher` geführte Mitarbeiter; für andere Rollen zeigt es bei den sichtbaren Kennzahlen `n/A` (`renderer/src/components/layout/PlanungsGrid.tsx:226-243`, `renderer/src/components/layout/PlanungsGrid.tsx:274-311`).
- Die verkürzte Ansicht erzeugt ebenfalls nur für `Erzieher` Kennzahlen (`renderer/src/components/layout/VerkuerzteAnsicht.tsx:45-62`).
- Der Auswertungsdialog zeigt nur Spalten für `Erzieher` und berechnet sämtliche dortigen Tages- und Zeitkennzahlen nur für diese Rolle (`renderer/src/components/AuswertungDialog.tsx:84-106`, `renderer/src/components/AuswertungDialog.tsx:125-169`).

Damit sind im Altsystem nicht nur Rufbereitschaften, sondern auch SN/F-Dienste, freie Tage, freie Samstage und freie Sonntage in der sichtbaren Auswertung auf `Erzieher` begrenzt. Dieser Filter ist jedoch nicht durch einen direkten Komponententest abgesichert.

Für die Auswahl einer Rufbereitschaft bietet die normale Oberfläche ebenfalls ausschließlich aktuell als `Erzieher` geführte Teammitglieder an (`renderer/src/components/RufbereitschaftAuswahl.tsx:12-36`). Der Datentyp beschreibt diese Anforderung nur in einem Kommentar (`shared/types.ts:85-93`). Die technische Speicherung erzwingt sie nicht:

- `teamMemberId` besitzt in der Rufbereitschaftstabelle weder eine Rollenprüfung noch einen Datenbank-Fremdschlüssel auf die Mitarbeitertabelle (`main/db/rufbereitschaftRepository.ts:6-13`).
- Der Speicherweg ersetzt und speichert die gelieferte ID ohne Prüfung der Mitarbeiterrolle (`main/db/dienstplanRepository.ts:191-205`).
- Auch der IPC-Handler reicht die Änderungen ohne fachliche Laufzeitvalidierung weiter (`main/ipc/dienstplanHandlers.ts:40-63`).

Eine Rufbereitschaft für einen Nicht-Erzieher oder eine nicht vorhandene Mitarbeiter-ID wäre daher außerhalb des normalen Oberflächenwegs speicherbar. Dafür gibt es keinen Test. Die Repositorytests verwenden Mitarbeiter-IDs, ohne zugehörige Rollen anzulegen oder zu prüfen (`main/db/dienstplanRepository.test.ts:326-367`).

### 6. Abhängigkeiten zu Snapshots und späteren Änderungen

Die Zählungen für SN/F-Dienste und freie Tage beruhen auf dem im Planeintrag gespeicherten Kürzel-Snapshot (`shared/types.ts:62-77`). Daraus folgt:

- Eine spätere Umbenennung oder Löschung der Eintragsdefinition ändert die Kennzahl eines bereits gesetzten Eintrags nicht. Dass ein Planeintrag samt Snapshot nach dem Löschen seiner Definition erhalten bleibt, ist ausdrücklich getestet (`main/db/eintragsdefinitionRepository.test.ts:183-212`).
- Wird die Zelle entfernt, entfällt ihr Beitrag.
- Wird eine Definition erneut gesetzt, entscheidet das dann neu übernommene Kürzel über die Zählung.

Rufbereitschaften besitzen dagegen keinen Mitarbeiter-Snapshot. Gespeichert wird nur die aktuelle `teamMemberId` (`shared/types.ts:85-93`). Im Altsystem darf ein verwendeter Mitarbeiter zwar nicht gelöscht werden, wenn er in einem Planeintrag oder einer Rufbereitschaft vorkommt; Name und Rolle dürfen aber weiterhin geändert werden (`main/db/teamRepository.ts:38-73`, `main/db/teamRepository.test.ts:88-128`, `main/db/teamRepository.test.ts:159-176`).

Dadurch kann eine spätere Rollenänderung die historische Auswertung verändern: Wird ein Mitarbeiter von `Erzieher` auf eine andere Rolle geändert, werden seine gesamten Kennzahlen nicht mehr erzeugt, obwohl seine Planeinträge und Rufbereitschaften bestehen bleiben. Die Rufbereitschaft kann in der Planzeile weiterhin über die Mitarbeiter-ID angezeigt werden, wird aber in keiner Erzieher-Auswertung mehr gezählt (`renderer/src/components/layout/PlanungsGrid.tsx:409-427`, `renderer/src/components/layout/PlanungsGrid.tsx:226-243`). Dieses Zusammenspiel ist nicht getestet.

Für das neue Projekt ist bereits verbindlich festgelegt, dass Auswertungen den Mitarbeiter-Snapshot des Monatsplans verwenden und spätere Stammdatenänderungen bestehende Pläne nicht verändern. Die noch offene Entscheidung in Schritt 5 betrifft deshalb nicht mehr den technischen Snapshot-Mechanismus, sondern welche Rolle innerhalb dieses eingefrorenen Planstands zu welcher Kennzahl berechtigt.

### 7. Durch Tests belegtes und nicht belegtes Verhalten

Direkt durch `shared/auswertung.test.ts` belegt sind:

- `SN/F` und `SN` werden gezählt, `F` nicht (`shared/auswertung.test.ts:69-99`).
- `/` zählt an jedem Wochentag als freier Tag (`shared/auswertung.test.ts:101-122`).
- Nur `/` am Samstag zählt als freier Samstag (`shared/auswertung.test.ts:124-145`).
- Nur `/` am Sonntag zählt als freier Sonntag; ein Sonntag darf zugleich Feiertag sein, ein Feiertag an einem Freitag zählt nicht als freier Sonntag (`shared/auswertung.test.ts:147-185`).
- Eine Rufbereitschaft wird nur dem Mitarbeiter mit der passenden ID zugerechnet (`shared/auswertung.test.ts:233-248`).
- Planeinträge eines anderen Mitarbeiters werden nicht zugerechnet (`shared/auswertung.test.ts:250-267`).
- Ein Kalendertag ohne zugehörigen Dienstplantag wird vollständig übersprungen (`shared/auswertung.test.ts:269-284`).
- Pro Dienstplantag kann nur eine Rufbereitschaft gespeichert werden; Wechsel und Entfernen funktionieren (`main/db/dienstplanRepository.test.ts:326-390`, `main/db/dienstplanRepository.test.ts:440-453`).

Nicht direkt getestet sind insbesondere:

- abweichende Groß-/Kleinschreibung oder äußere Leerzeichen in Kürzeln,
- eine gültige Planungszelle ohne Planeintrag und die ausdrückliche Abgrenzung „ungeplant ist nicht frei“,
- SN/F- oder freie Einträge an Feiertagen und Samstagen außerhalb der vorhandenen Einzelbeispiele,
- das gleichzeitige Zählen von Planeintragskennzahl und Rufbereitschaft an demselben Tag,
- die Rollenfilter der drei Ansichten,
- die Beschränkung der Rufbereitschaft auf `Erzieher`,
- spätere Rollenänderungen bei bestehenden Einträgen und Rufbereitschaften sowie
- widersprüchliche oder doppelte Kalender- und Dienstplantageingaben.

Die Tests wurden in diesem Schritt als Quelltext ausgewertet; sie wurden nicht erneut ausgeführt. Die genannten Erwartungen sind im untersuchten Commit vorhanden, während die nicht getesteten Aussagen entweder unmittelbar aus der Implementierung folgen oder als technische Grenzfälle gekennzeichnet sind.

### 8. Technische Auffälligkeiten und Grenzfälle

- **Fachlogik über frei editierbare Kürzel:** Die Bedeutung „SN/F-Dienst“ beziehungsweise „freier Tag“ ist nicht als eigenes Merkmal modelliert, sondern hängt an drei fest codierten Textwerten. Tippfehler, Leerzeichen oder spätere Umbenennungen neuer Definitionen führen deshalb zu stillen Fehlzählungen.
- **Uneindeutige Beschriftung:** Die Anzeige nennt die Kennzahl „SN/F-Dienste“, zählt aber zusätzlich `SN`. Eine fachlich präzisere Benennung oder Beschreibung fehlt (`renderer/src/components/AuswertungDialog.tsx:24-31`, `shared/auswertung.ts:64`).
- **Rollenregel nur in der Oberfläche:** Die Auswahl zeigt nur Erzieher, Speicherung und zentrale Berechnung validieren diese Regel jedoch nicht. Dadurch ist die Datenintegrität vom normalen Bedienweg abhängig.
- **Aktueller Entwurf statt nur gespeichertem Stand:** Kennzahlen ändern sich sofort mit ungespeicherten Planänderungen. Das ist für eine Vorschau sinnvoll, sollte aber in einer als verbindlich oder exportiert geltenden Auswertung eindeutig kenntlich sein.
- **Zuordnung nach Datum:** Mehrere Dienstplantage mit demselben Datum würden in der internen `Map` auf den zuletzt vorkommenden Datensatz reduziert. Die Datenbank verhindert doppelte Datumszeilen innerhalb eines Plans nicht ausdrücklich (`shared/auswertung.ts:43`, `main/db/dienstplanRepository.ts:29-36`). Der reguläre Anlageweg erzeugt jedoch genau einen Dienstplantag je Kalendertag (`main/db/dienstplanRepository.ts:66-106`).
- **Doppelte Kalendertage:** Würde die Eingabeliste `tage` dasselbe Datum mehrfach enthalten, würde die Funktion denselben Planeintrag und dieselbe Rufbereitschaft mehrfach zählen, weil keine Deduplizierung stattfindet (`shared/auswertung.ts:56-83`). Der reguläre Kalendergenerator erzeugt diese Dopplung nicht.
- **Keine gegenseitige Plausibilitätsregel:** Das Altsystem verbietet nicht, dass derselbe Mitarbeiter an einem Tag zugleich einen freien Eintrag `/` und eine Rufbereitschaft besitzt. Ebenso kann eine Rufbereitschaft parallel zu jedem Dienstkürzel bestehen. Ob dies fachlich erlaubt ist, lässt sich aus dem Quellcode nicht ableiten.

### 9. Fachliche Bedeutung

- Die Kennzahlen zählen keine Arbeitszeit, sondern klassifizieren belegte Planungszellen beziehungsweise separate Rufbereitschaftszuordnungen nach Kalendertagen.
- „Frei“ bedeutet im Altsystem eine ausdrücklich gesetzte Information und nicht bloß das Fehlen einer Planung. Dadurch bleiben „noch ungeplant“ und „bewusst frei“ unterscheidbar.
- Freie Samstage und freie Sonntage sind keine eigenständigen Eintragsarten, sondern kalenderabhängige Untergruppen der freien Tage.
- Rufbereitschaft ist eine vom normalen Planeintrag unabhängige Tagesverantwortung. Pro Tag kann sie höchstens einer Person zugeordnet werden; pro Mitarbeiter wird die Anzahl seiner zugeordneten Tage im Monat ausgewiesen.
- Die Monatszählung ist mitarbeiterbezogen. Ein Tag kann unterschiedliche Mitarbeiterkennzahlen erhöhen, weil jeder Mitarbeiter eine eigene Planungszelle besitzt. Die globale Rufbereitschaft desselben Tages kann dagegen nur genau einem Mitarbeiter zugerechnet werden.

### 10. Abgrenzung zu Schritt 6 und Schritt 7

Dieser Schritt legt noch nicht fest, welche Zeitwerte eines Eintrags in Monats-, Sonntags-, Feiertags-, Nachtarbeits- oder Nachtbereitschaftssummen einfließen und wie Zuschläge gerundet werden. Diese Fragen gehören zu Schritt 6. Ebenso werden monatliches Soll, Ist und deren Differenz erst in Schritt 7 fachlich entschieden.

Die gemeinsame Schleife der alten Funktion wurde nur soweit betrachtet, wie sie die Eingabedaten und Tageszuordnung der Zählungen erklärt. Aus den hier dokumentierten Anzahlen wird im Altsystem keine Zeitdauer abgeleitet; insbesondere verändert die Anzahl der Rufbereitschaften weder die Zeit- noch die Soll-/Ist-Werte (`shared/auswertung.ts:45-54`, `shared/auswertung.ts:85-111`).

### 11. Priorisierte, einzeln entscheidbare Fachfragen

1. **Auswertungskreis:** Sollen SN/F-Dienste und freie Tage einschließlich ihrer Wochenend-Untergruppen für alle Mitarbeiter des Monatsplan-Snapshots oder wie im Altsystem ausschließlich für die Rolle `Erzieher` berechnet und angezeigt werden?
2. **SN/F-Definition:** Soll die Kennzahl weiterhin gemeinsam die beiden Sachverhalte `SN/F` und `SN` zählen? Falls ja, soll sie verständlicher als „SN- und SN/F-Dienste“ bezeichnet werden?
3. **Stabile Erkennung:** Soll die fachliche Bedeutung künftig über eine ausdrückliche Klassifizierung der Eintragsdefinition und deren Snapshot bestimmt werden, statt unmittelbar von den frei eingegebenen Kürzeltexten `SN/F`, `SN` und `/` abzuhängen?
4. **Freier Tag:** Soll ausschließlich ein ausdrücklich gesetzter Frei-Eintrag als freier Tag gelten, während eine leere beziehungsweise noch ungeplante Zelle nicht zählt?
5. **Wochenend-Untergruppen:** Sollen freie Samstage und freie Sonntage weiterhin als Teilmengen der freien Tage gezählt werden, ausschließlich nach dem tatsächlichen Wochentag und unabhängig vom Feiertagsstatus?
6. **Rufbereitschaft und Rolle:** Darf Rufbereitschaft ausschließlich Mitarbeitern zugeordnet werden, deren Rolle im Mitarbeiter-Snapshot des Monatsplans `Erzieher` ist?
7. **Rufbereitschaft pro Tag:** Soll pro Kalendertag weiterhin höchstens eine Rufbereitschaft existieren und soll jeder zugeordnete Tag für den betreffenden Mitarbeiter genau einmal zählen?
8. **Gleichzeitige Sachverhalte:** Darf ein Mitarbeiter am selben Tag neben einer Rufbereitschaft jeden beliebigen Planeintrag besitzen, insbesondere auch einen freien Eintrag, oder werden dafür Plausibilitätsbeschränkungen benötigt?
9. **Entwurfsstand:** Sollen die Kennzahlen während der Bearbeitung weiterhin sofort den ungespeicherten Entwurf abbilden, wobei verbindliche Ausgaben eindeutig vom nur gespeicherten Stand unterschieden werden?

### 12. Verständliche, pragmatische Empfehlung

1. **Ungeplant und frei weiterhin trennen.** Ein freier Tag sollte nur durch einen bewusst gesetzten Frei-Sachverhalt entstehen. Eine leere Zelle bleibt „noch ungeplant“ und darf Kennzahlen nicht unbemerkt erhöhen.
2. **Fachliche Klassifizierungen statt magischer Kürzel verwenden.** SN/F-Dienst und freier Tag sollten stabile Merkmale einer Definition sein, die beim Setzen in den Planungseintrag-Snapshot übernommen werden. Das sichtbare Kürzel kann dann geändert oder formatiert werden, ohne neue Einträge falsch zu zählen.
3. **Die SN-Kennzahl eindeutig benennen.** Falls beide alten Kategorien fachlich zusammengehören, ist „SN- und SN/F-Dienste“ verständlicher als „SN/F-Dienste“. Andernfalls sollten sie getrennt gezählt werden.
4. **Wochenendzahlen als nachvollziehbare Teilmengen führen.** Jeder ausdrücklich freie Samstag beziehungsweise Sonntag zählt zugleich als freier Tag. Ein Feiertag ändert die Einordnung als Samstag oder Sonntag nicht und erzeugt keine zusätzliche Zählung.
5. **Allgemeine Kennzahlen zunächst rollenunabhängig modellieren, Rollenfilter ausdrücklich entscheiden.** Die Zählformeln selbst benötigen keine Rolle. Wenn SN/F- und Frei-Kennzahlen fachlich nur für Erzieher relevant sind, sollte dieser Auswertungskreis als eigene Regel dokumentiert und nicht lediglich in der Oberfläche versteckt werden.
6. **Rufbereitschaft als eigene Tageszuordnung beibehalten.** Pro Kalendertag höchstens eine zuständige Person und pro zugeordnetem Tag genau ein Zählerpunkt sind einfach und eindeutig. Die Beschränkung auf Erzieher sollte an der fachlichen Speichergrenze anhand des Mitarbeiter-Snapshots geprüft werden, sofern sie bestätigt wird.
7. **Gleichzeitigkeit bewusst erlauben oder verbieten.** Technisch unabhängige Sachverhalte sollten nur dann ausgeschlossen werden, wenn es eine fachliche Begründung gibt. Besonders die Kombination „frei und Rufbereitschaft“ sollte vor der Übernahme ausdrücklich geklärt werden.
8. **Live-Vorschau zulassen, verbindliche Ausgabe kennzeichnen.** Sofort aktualisierte Kennzahlen helfen beim Planen. Für Druck, Export oder abgeschlossene Pläne sollte jedoch klar sein, ob der angezeigte Stand bereits gespeichert ist.

### Status von Schritt 5

Die Quellcodeanalyse zu SN/F-Diensten, freien Tagen, freien Samstagen, freien Sonntagen und Rufbereitschaften ist abgeschlossen. Untersucht wurden Eingabedaten, Zähleinheit, exakte Erkennungsregeln, Kalender- und Rollenbezug, leere und fehlende Einträge, gleichzeitig mögliche Sachverhalte, Snapshot-Abhängigkeiten, Speicherung, Grenzfälle und vorhandene Tests.

Die Quellcodeanalyse und die fachlichen Entscheidungen aus diesem Abschnitt sind abgeschlossen. Schritt 5 ist damit **quellcodeanalytisch und fachlich verbindlich abgeschlossen**. Die bestätigten Entscheidungen werden nachfolgend festgehalten.

### Bereits verbindlich entschieden

Am 10. September 2026 wurde der Auswertungskreis der tagesbezogenen Kennzahlen festgelegt:

- SN- und SN/F-Dienste, freie Tage, freie Samstage und freie Sonntage werden für jeden Mitarbeiter des Mitarbeiter-Snapshots eines Monatsplans berechnet und angezeigt.
- Die Rolle des Mitarbeiters schränkt diese vier Kennzahlen nicht ein.
- Die Kennzahlen werden für jeden Mitarbeiter getrennt über die Kalendertage des Monatsplans ermittelt.
- Diese Entscheidung umfasst noch nicht den zulässigen Personenkreis der Rufbereitschaft; dieser wird gesondert festgelegt.

Damit weicht die neue Regel bewusst vom Altsystem ab. Dort erzeugen die sichtbaren Oberflächen diese Kennzahlen ausschließlich für Mitarbeiter mit der Rolle `Erzieher`, obwohl die zentrale Berechnungsfunktion selbst rollenunabhängig arbeitet.

Für die Kennzahl der SN/F-Dienste wurde außerdem festgelegt:

- Die Bezeichnung bleibt **SN/F-Dienste**. Sie soll fachlich für Spät-Nacht-Früh-Dienste stehen.
- Wie im Altsystem erhöht ein Planungseintrag mit dem exakten Snapshot-Kürzel `SN/F` oder `SN` den Zähler jeweils um `1`; das alleinige Kürzel `F` zählt nicht.
- Eine Folge aus getrennten `SN`- und `F`-Einträgen wird nicht kalendertagübergreifend zusammengesetzt oder zusätzlich als Kombination gezählt.
- Die Erkennung bleibt für den Prototyp an die exakten Kürzeltexte gebunden. Andere Schreibweisen, Leerzeichen oder frei angelegte alternative Kürzel werden nicht erkannt.
- Diese Lösung ist ausdrücklich als prototypische Vereinfachung dokumentiert. Eine spätere Weiterentwicklung kann Einträge fachlich klassifizieren und vollständige Dienstfolgen über mehrere Kalendertage auswerten.

Für die Kennzahl der freien Tage wurde festgelegt:

- Ein Kalendertag zählt für einen Mitarbeiter genau dann als freier Tag, wenn die Planungszelle einen Planungseintrag mit dem exakten Snapshot-Kürzel `/` enthält.
- Jeder passende Planungseintrag erhöht den persönlichen Monatszähler um `1`.
- Eine leere Planungszelle bedeutet „noch ungeplant“ und zählt nicht als freier Tag.
- Abweichende Kürzel sowie zusätzliche Zeichen oder Leerzeichen werden nicht als Frei-Eintrag erkannt.
- Maßgeblich ist der Snapshot des gesetzten Planungseintrags; spätere Änderungen der Eintragsdefinition wirken nicht rückwirkend auf die Zählung.

Für freie Samstage und freie Sonntage wurde festgelegt:

- Beide Kennzahlen sind Teilmengen der freien Tage und setzen deshalb ebenfalls einen Planungseintrag mit dem exakten Snapshot-Kürzel `/` voraus.
- Ein freier Samstag erhöht sowohl den Zähler der freien Tage als auch den Zähler der freien Samstage jeweils um `1`.
- Ein freier Sonntag erhöht sowohl den Zähler der freien Tage als auch den Zähler der freien Sonntage jeweils um `1`.
- Maßgeblich ist ausschließlich der tatsächliche Wochentag des Kalendertages im Monatsplan.
- Der Feiertagsstatus verändert die Einordnung nicht und erzeugt keine zusätzliche Zählung. Ein Feiertag an einem anderen Wochentag zählt nicht als freier Samstag oder freier Sonntag.
- Eine leere Planungszelle erhöht auch an einem Samstag oder Sonntag keinen Frei-Zähler.

Für den zulässigen Personenkreis der Rufbereitschaft wurde festgelegt:

- Eine Rufbereitschaft darf ausschließlich einem Mitarbeiter zugeordnet werden, dessen im Mitarbeiter-Snapshot des Monatsplans gespeicherte Rolle `Erzieher` ist.
- Die aktuellen Mitarbeiter-Stammdaten außerhalb des Plans sind für diese Prüfung nicht maßgeblich.
- Mitarbeiter mit einer anderen Rolle dürfen weder in der Rufbereitschaftsauswahl angeboten noch an der fachlichen Speichergrenze als Rufbereitschaft gespeichert werden.
- Spätere Änderungen des Mitarbeiter-Stammdatensatzes verändern bestehende Monatspläne und ihre Rufbereitschaftsauswertung nicht rückwirkend.

Umsetzungshinweis zum neuen Projekt: Die Rolle ist dort derzeit noch als frei eingebbarer Text modelliert. Im fachlichen Zielmodell wird jedoch verbindlich davon ausgegangen, dass Teammitglieder eine bestehende, eindeutig prüfbare Rolle besitzen und `Erzieher` deshalb zuverlässig erkannt werden kann. Die dafür noch erforderliche technische Umstellung auf fest definierte Rollen setzt der Benutzer gesondert um; sie ist kein offener Punkt dieser Berechnungsanalyse.

Für die Zählung der Rufbereitschaften wurde festgelegt:

- Für jeden Kalendertag eines Monatsplans kann keine oder genau eine Rufbereitschaft bestehen.
- Die Rufbereitschaft wird genau einem dafür zulässigen Mitarbeiter zugeordnet und erhöht dessen persönlichen Monatszähler um `1`.
- Bei allen anderen Mitarbeitern erhöht derselbe Kalendertag den Rufbereitschaftszähler nicht.
- Die monatliche Anzahl entspricht der Anzahl der Kalendertage, an denen der betreffende Mitarbeiter zugeordnet ist.
- Ein Wechsel der zuständigen Person verschiebt den Zählerpunkt von der bisherigen zur neuen Person.
- Das Entfernen der Zuordnung entfernt auch den Zählerpunkt; mehrere Rufbereitschaften am selben Kalendertag sind unzulässig.

Für die Gleichzeitigkeit von Rufbereitschaft und Planungseintrag wurde festgelegt:

- Rufbereitschaft und normaler Planungseintrag sind voneinander unabhängige Angaben.
- Eine Rufbereitschaft darf gemeinsam mit jedem zulässigen Planungseintrag desselben Mitarbeiters und Kalendertages bestehen; dies umfasst im Prototyp ausdrücklich auch den Frei-Eintrag `/`.
- Beide Angaben erhöhen ihre jeweils zugehörigen Kennzahlen unabhängig voneinander. Ein Tag kann deshalb beispielsweise zugleich als freier Tag und als Rufbereitschaft gezählt werden.
- Aus der Kombination werden keine zusätzlichen Zeitwerte oder weiteren Kennzahlen abgeleitet.
- Der Prototyp nimmt keine automatische Plausibilitätsprüfung bestimmter Kombinationen vor. Spätere Einschränkungen benötigen zuerst eine eigene fachliche Regel.

Für den Berechnungsstand während der Bearbeitung wurde festgelegt:

- Die tagesbezogenen Kennzahlen werden während der Bearbeitung unmittelbar aus dem aktuellen Planentwurf berechnet.
- Noch nicht gespeicherte Änderungen an Planungseinträgen und Rufbereitschaften werden sofort als Live-Vorschau berücksichtigt.
- Verbindliche Ausgaben, beispielsweise Exporte oder als abgeschlossen behandelte Monatspläne, dürfen ausschließlich den gespeicherten Stand verwenden.
- Ein Entwurf mit ungespeicherten Änderungen muss deshalb vor einer verbindlichen Ausgabe gespeichert werden.
- Entwurfsstand und gespeicherter Stand müssen für den Benutzer eindeutig unterscheidbar sein.

Diese Entscheidung wurde in `docs/Berechnungen/` übernommen.

## Ergebnis von Schritt 6: Zeitbezogene Monatssummen und Zuschläge

### 1. Auswertungsrahmen und tatsächliche Eingaben

Die bereits in Schritt 5 betrachtete Funktion `berechneKennzahlenFuerMitarbeiter` berechnet auch sämtliche zeitbezogenen Kennzahlen. Ein Aufruf gilt jeweils für **einen Mitarbeiter und die übergebene Liste von Kalendertagen**. Die sichtbaren Oberflächen übergeben dafür den vollständigen aktuellen Monatsentwurf (`shared/auswertung.ts:35-43`, `renderer/src/pages/PlanPage.tsx:499-542`).

Für die Zeitberechnung sind technisch folgende Eingaben vorhanden:

- die Mitarbeiter-ID zur Auswahl der persönlichen Planungszellen,
- die Kalendertage mit Datum, Wochentag und Feiertagsstatus,
- die Dienstplantage zur Übersetzung eines Datums in die technische Dienstplantag-ID,
- die Planungseintrag-Snapshots des aktuellen Entwurfs und
- die individuelle Wochenarbeitszeit des Mitarbeiters (`shared/auswertung.ts:35-43`).

Die Wochenarbeitszeit wird innerhalb von Schritt 6 nicht für eine Zeit-Summe oder einen Zuschlag verwendet. Sie fließt erst in die Soll-Arbeitszeit aus Schritt 7 ein (`shared/auswertung.ts:85-93`). Rufbereitschaften verändern ebenfalls keine Zeitkennzahl; sie werden in derselben Schleife ausschließlich gezählt (`shared/auswertung.ts:80-90`).

Die Funktion ordnet zunächst jedem Datum genau eine Dienstplantag-ID zu. Fehlt zu einem Kalendertag ein Dienstplantag, wird der Tag vollständig übersprungen. Existiert ein Dienstplantag, aber kein Planungseintrag für den ausgewerteten Mitarbeiter, trägt der Tag zu allen Zeit-Summen `0` bei (`shared/auswertung.ts:43-63`).

### 2. Verwendung der einzelnen Snapshot-Felder

Eine feste Eintragsdefinition und ihr Planungseintrag-Snapshot besitzen fünf getrennte Zeitfelder. Das Altsystem bietet alle fünf als eigenständige Eingaben an, wandelt sie einzeln in Minuten um und speichert sie getrennt (`renderer/src/components/EintragsdefinitionForm.tsx:145-197`, `renderer/src/pages/EintraegePage.tsx:99-137`, `shared/types.ts:32-44`). In der Monatsauswertung werden sie jedoch sehr unterschiedlich verwendet:

| Altes Feld | Verwendung in Schritt 6 | Technischer Befund |
| --- | --- | --- |
| `anwesenheitszeitMinuten` | keine | Wird erfasst und im Snapshot gespeichert, aber von der Auswertungsfunktion nicht gelesen. |
| `arbeitszeitMinuten` | keine | Wird erfasst und gespeichert, aber weder summiert noch für „Arbeitszeit gesamt“ verwendet. |
| `arbeitszeitOhneNachtbereitschaftMinuten` | reine Monatssumme, Arbeitszeit gesamt, Sonntags-/Feiertagszeit | Dieses Feld ist die zentrale Zeitgrundlage der Auswertung. Es entspricht nach der bereits verbindlichen neuen Begriffsregel der **reinen Arbeitszeit**. |
| `nachtbereitschaftMinuten` | Arbeitszeit gesamt, Nachtbereitschaftssumme, 25-Prozent-Wert | Die vollständige Dauer wird zu „Arbeitszeit gesamt“ addiert; für den späteren Ist-Wert wird dagegen nur ihr gerundeter 25-Prozent-Wert verwendet. |
| `nachtarbeitMinuten` | Nachtarbeitssumme, 20-Prozent-Wert | Wird separat summiert. Weder die Nachtarbeit noch ihr 20-Prozent-Wert verändern „Arbeitszeit gesamt“. |

Dieser Befund folgt unmittelbar aus der einzigen Summenschleife (`shared/auswertung.ts:56-80`). Eine Suche nach lesenden Verwendungen von `arbeitszeitMinuten` innerhalb des gesamten alten `src`-Ordners zeigt außerhalb von Formular, Anzeige, Snapshot und Speicherung keine Berechnung mit diesem Feld. Der Test der vier Monatssummen bestätigt die Neuberechnung zusätzlich: Die verwendeten Einträge lassen `arbeitszeitMinuten` auf dem Standardwert `0`, ergeben aber dennoch `780` Minuten „Arbeitszeit gesamt“ aus `700` Minuten reiner Arbeitszeit plus `80` Minuten Nachtbereitschaft (`shared/auswertung.test.ts:286-315`).

Beginn, Ende, Kürzel und Herkunfts-ID werden für die zeitbezogenen Summen nicht geprüft. Der Name beziehungsweise die Bezeichnung der Eintragsdefinition ist im alten Planungseintrag-Snapshot gar nicht enthalten. Insbesondere wird nicht aus Beginn und Ende berechnet, welcher Zeitanteil tatsächlich in einen Sonntag, Feiertag oder Nachtzeitraum fällt (`shared/types.ts:62-77`, `shared/auswertung.ts:60-80`).

### 3. Exakte Formeln, Zählebene, Einheit und Rundung

Für jeden ausgewerteten Mitarbeiter betrachtet das Altsystem alle ihm zugeordneten Planungseinträge, deren Datum über die übergebenen Kalender- und Dienstplantage erreichbar ist. Für einen solchen Eintrag `i` gelten:

- `Rᵢ` = `arbeitszeitOhneNachtbereitschaftMinuten`, im neuen Projekt **reine Arbeitszeit**,
- `Bᵢ` = `nachtbereitschaftMinuten`,
- `Nᵢ` = `nachtarbeitMinuten`.

Die monatlichen Kennzahlen werden folgendermaßen gebildet:

| Kennzahl | Formel des Altsystems | Einheit | Rundungszeitpunkt |
| --- | --- | --- | --- |
| Gearbeitete Zeit an Sonntagen und Feiertagen | `Σ Rᵢ` für Einträge an einem Sonntag **oder** gesetzlichen Feiertag | Minuten pro Mitarbeiter und Monat | keine Rundung; bereits ganzzahlige Snapshots werden addiert |
| Arbeitszeit gesamt | `Σ (Rᵢ + Bᵢ)` | Minuten pro Mitarbeiter und Monat | keine Rundung |
| Nachtbereitschaft gesamt | `Σ Bᵢ` | Minuten pro Mitarbeiter und Monat | keine Rundung |
| Arbeitszeit ohne Nachtbereitschaft gesamt | `Σ Rᵢ` | Minuten pro Mitarbeiter und Monat | keine Rundung |
| Nachtarbeit gesamt | `Σ Nᵢ` | Minuten pro Mitarbeiter und Monat | keine Rundung |
| Nachtzuschlag 20 Prozent | `runde(Σ Nᵢ × 0,20)` | Minuten | genau einmal nach Bildung der vollständigen Nachtarbeits-Monatssumme |
| Nachtbereitschaftszuschlag 25 Prozent | `runde(Σ Bᵢ × 0,25)` | Minuten | genau einmal nach Bildung der vollständigen Nachtbereitschafts-Monatssumme |

Die Summenformeln stehen unmittelbar in `shared/auswertung.ts:49-80`, die Prozentsätze und die Rundung in `shared/auswertung.ts:7-8` und `shared/auswertung.ts:85-106`. Die verwendete Rundungsfunktion ruft `Math.round` auf; bei den zulässigen nichtnegativen Werten wird unter `0,5` Minuten ab- und ab genau `0,5` Minuten aufgerundet (`shared/rundeAufVolleMinute.ts:1-5`, `shared/rundeAufVolleMinute.test.ts:4-23`).

Aus den Formeln folgt im Altsystem immer die rechnerische Beziehung:

`Arbeitszeit gesamt = reine Arbeitszeit gesamt + Nachtbereitschaft gesamt`

Diese Beziehung entsteht aus der Auswertungsformel und gilt selbst dann, wenn das separat gespeicherte Feld `arbeitszeitMinuten` eines oder mehrerer Snapshots einen völlig anderen Wert enthält (`shared/auswertung.ts:74-79`).

### 4. Sonntage und gesetzliche Feiertage

Das Altsystem führt Sonntage und gesetzliche Feiertage in **einer gemeinsamen Kennzahl**. Ein Eintrag wird berücksichtigt, wenn `wochentag === 'So'` **oder** `istFeiertag` wahr ist (`shared/auswertung.ts:56-72`). Daraus ergeben sich folgende Einzelregeln:

- Ein Sonntag, der zugleich Feiertag ist, trägt seine reine Arbeitszeit nur **einmal** zur gemeinsamen Summe bei. Die Oder-Bedingung erzeugt keine doppelte Addition.
- Ein gewöhnlicher Samstag besitzt keine Sonderwirkung. Ist ein Samstag jedoch zugleich als gesetzlicher Feiertag markiert, fließt seine reine Arbeitszeit wegen des Feiertagsstatus ein.
- Ein normaler Montag bis Freitag wird nicht berücksichtigt; ein gesetzlicher Feiertag an einem dieser Wochentage dagegen schon.
- Das allgemeine Feld `istWochenende` ist für diese Kennzahl ohne Bedeutung. Für Sonntage wird ausschließlich das Wochentagskürzel `So` geprüft.
- `feiertagsname` ist ebenfalls ohne Bedeutung; entscheidend ist nur der boolesche Feiertagsstatus.
- Eingerechnet wird ausschließlich die reine Arbeitszeit `Rᵢ`. Nachtbereitschaft, Nachtarbeit, das gespeicherte alte Arbeitszeitfeld und Anwesenheitszeit erhöhen diese Kennzahl nicht.

Der direkte Test belegt die Addition von `300` Minuten reiner Arbeitszeit an einem Sonntag und `480` Minuten an einem Feiertag zu `780` Minuten. Die zusätzlichen `60` Minuten Nachtbereitschaft des Sonntags werden ausdrücklich nicht eingerechnet; ein gewöhnlicher Montag mit `480` Minuten bleibt ebenfalls unberücksichtigt (`shared/auswertung.test.ts:188-231`).

Die Zuordnung erfolgt vollständig zum Kalendertag der Planungszelle. Ein beispielsweise am Samstag beginnender und am Sonntag endender Dienst wird nicht zeitanteilig aufgeteilt. Ebenso wird ein am Sonntag beginnender und am Montag endender Dienst mit seiner vollständigen reinen Arbeitszeit dem Sonntag zugerechnet. Beginn und Ende sind nur darstellende Snapshot-Felder und werden für diese Kennzahl nicht gelesen (`shared/types.ts:62-74`, `shared/auswertung.ts:60-79`).

Auch die fachliche Bedeutung des Kürzels wird nicht berücksichtigt. Jeder vorhandene Snapshot mit positiver reiner Arbeitszeit fließt an einem Sonntag oder Feiertag ein, selbst wenn sein Kürzel beispielsweise für Urlaub, Krankheit oder Frei stehen soll. Die Auswertung kennt keine Eintragskategorie „tatsächlich gearbeitet“ (`shared/auswertung.ts:62-79`).

### 5. Bedeutung und Wirkung der beiden Zuschläge

Beide Zuschläge sind im Altsystem **Zeitwerte in Minuten**, keine Geldbeträge. Die Auswertung gibt numerische Minutenfelder zurück, und der Auswertungsdialog stellt sie wie die anderen Zeitdauern im Format `HH:MM` dar (`shared/auswertung.ts:16-32`, `renderer/src/components/AuswertungDialog.tsx:43-57`, `renderer/src/components/AuswertungDialog.tsx:108-114`). Der Quellcode bezeichnet sie zwar als Zuschläge, legt aber darüber hinaus nicht fest, ob diese Minuten fachlich Zeitgutschriften, reine Informationswerte oder eine andere Art von Zeitkonto darstellen sollen.

Die Berechnung erfolgt nicht pro Tag oder Eintrag, sondern erst aus der vollständigen Monatssumme. Dadurch können sich andere Ergebnisse als bei einer täglichen Rundung ergeben. Beispiel:

- Zwei Einträge mit jeweils `2` Minuten Nachtarbeit ergeben monatlich `4 × 20 % = 0,8` Minuten und damit gerundet `1` Minute. Eine Rundung je Eintrag hätte zweimal `0,4` auf `0` gerundet und insgesamt `0` Minuten ergeben.
- Zwei Einträge mit jeweils `1` Minute Nachtbereitschaft ergeben monatlich `2 × 25 % = 0,5` Minuten und damit gerundet `1` Minute. Eine Rundung je Eintrag hätte zweimal `0,25` auf `0` gerundet.

Der vorhandene Test belegt für jeweils `13` Monatsminuten `3` Minuten Nachtzuschlag (`13 × 0,20 = 2,6`) und `3` Minuten Nachtbereitschaftszuschlag (`13 × 0,25 = 3,25`) (`shared/auswertung.test.ts:317-339`).

Die beiden Zuschläge haben im Altsystem unterschiedliche Folgewirkungen:

- Der Nachtzuschlag von 20 Prozent wird berechnet und angezeigt, aber von keiner weiteren Formel verwendet. Er verändert weder „Arbeitszeit gesamt“ noch die spätere Ist-Arbeitszeit.
- Der Nachtbereitschaftszuschlag von 25 Prozent verändert „Arbeitszeit gesamt“ ebenfalls nicht, wird aber in Schritt 7 zur alten Ist-Arbeitszeit addiert (`shared/auswertung.ts:85-111`).

Ob einer oder beide Zuschläge im neuen Projekt als anrechenbare Zeitgutschrift gelten und in welche spätere Ist-Größe sie einfließen, ist damit keine vollständig durch den alten Code erklärte Regel und muss ausdrücklich entschieden werden.

### 6. Rollenfilter, Entwurfsstand und Snapshot-Bezug

Die zentrale Berechnungsfunktion besitzt keinen Rollenparameter. Sie kann die Zeitkennzahlen für jede Mitarbeiter-ID berechnen. Den Rollenfilter setzen ausschließlich die drei aufrufenden Oberflächen:

- Das Planungsraster berechnet Kennzahlen nur für Mitarbeiter mit der aktuellen Rolle `Erzieher`; andere Rollen erhalten `n/A` (`renderer/src/components/layout/PlanungsGrid.tsx:226-243`, `renderer/src/components/layout/PlanungsGrid.tsx:274-311`).
- Die verkürzte Ansicht überspringt andere Rollen ebenfalls (`renderer/src/components/layout/VerkuerzteAnsicht.tsx:43-62`).
- Der Auswertungsdialog enthält ausschließlich Erzieher-Spalten und ruft die Berechnung nur für diese Mitarbeiter auf (`renderer/src/components/AuswertungDialog.tsx:84-106`, `renderer/src/components/AuswertungDialog.tsx:125-169`).

Damit sind im sichtbaren Altsystem auch alle zeitbezogenen Kennzahlen auf Erzieher begrenzt, obwohl ihre Formeln selbst rollenunabhängig sind. Die bereits verbindliche neue Entscheidung, allgemeine **tagesbezogene** Kennzahlen für alle Mitarbeiter auszuwerten, legt die Reichweite dieser zeitbezogenen Kennzahlen noch nicht automatisch fest.

Wie die Zählungen aus Schritt 5 beruhen die Zeit-Summen auf `planeintraegeEntwurf`, also dem aktuellen Entwurf einschließlich ungespeicherter Änderungen (`renderer/src/pages/PlanPage.tsx:82-89`, `renderer/src/pages/PlanPage.tsx:499-542`). Wird ein Eintrag entfernt, ersetzt oder neu gesetzt, ändern sich die Summen unmittelbar. Für das neue Projekt gilt bereits übergreifend, dass ein solcher Entwurfsstand nur eine Live-Vorschau ist und verbindliche Ausgaben den gespeicherten Stand verwenden müssen.

Die Zeitwerte selbst sind Bestandteile des Planungseintrag-Snapshots. Das Laden übernimmt sie unverändert; die Auswertung greift nicht erneut auf die aktuelle Eintragsdefinition zu (`renderer/src/lib/planeintragSnapshot.ts:44-63`). Änderungen oder das Löschen einer Definition verändern deshalb bereits gesetzte Summen nicht. Ein Repositorytest belegt ausdrücklich, dass ein bestehender Planungseintrag samt Zeit-Snapshot nach dem Löschen seiner Definition erhalten bleibt (`main/db/eintragsdefinitionRepository.test.ts:183-212`).

Im Altsystem sind Mitarbeiterdaten dagegen nicht Bestandteil des Plans. Rolle und Wochenarbeitszeit können nachträglich geändert werden, wodurch sich der alte Rollenfilter beziehungsweise die spätere Sollzeit verändern kann (`main/db/teamRepository.ts:38-53`, `renderer/src/components/AuswertungDialog.tsx:84-106`). Für das neue Projekt ist bereits verbindlich entschieden, stattdessen den Mitarbeiter-Snapshot des Monatsplans zu verwenden. Diese neue Regel hat Vorrang: Zeitkennzahlen müssen auf dem im Plan gespeicherten Mitarbeiterstand beruhen, und gelöschte beziehungsweise geänderte Stammdaten dürfen bestehende Planauswertungen nicht rückwirkend verändern.

### 7. Plausibilitätsbeziehungen der Zeitfelder

#### Im Altcode tatsächlich erzwungen

- Der normale Formularweg akzeptiert für alle fünf Zeitfelder nur nichtnegative ganze Minuten (`renderer/src/lib/validateEintragsdefinition.ts:53-68`).
- Bei einer mitarbeiterabhängigen Definition müssen die fünf Definitionsfelder `0` sein. Beim Setzen des konkreten Eintrags wird ausschließlich ein Fünftel der Wochenarbeitszeit als Arbeitszeit ohne Nachtbereitschaft eingesetzt; alle anderen Zeitfelder bleiben `0` (`renderer/src/lib/validateEintragsdefinition.ts:70-94`, `renderer/src/lib/planeintragSnapshot.ts:10-27`). Für das neue Projekt wurde diese Feldbelegung in Schritt 4 bereits abweichend und widerspruchsfrei als gleiche reine Arbeitszeit und Arbeitszeit (mit NB) festgelegt.
- Innerhalb der Monatsauswertung wird „Arbeitszeit gesamt“ zwingend als reine Arbeitszeit plus Nachtbereitschaft neu gebildet. Das separat gespeicherte alte Arbeitszeitfeld kann diese Formel nicht beeinflussen (`shared/auswertung.ts:74-79`).

Die Speicherung selbst erzwingt diese Regeln jedoch nicht vollständig. Die Datenbankspalten sind lediglich `INTEGER NOT NULL`, und das Dienstplanrepository speichert die gelieferten Snapshot-Werte ohne erneute Plausibilitätsprüfung (`main/db/planeintragRepository.ts:6-23`, `main/db/dienstplanRepository.ts:147-188`). Ein außerhalb des normalen Formularwegs erzeugter inkonsistenter Snapshot ist daher technisch möglich.

#### Nur durch Benennung oder typische Daten implizit angenommen

Folgende Beziehungen wirken fachlich naheliegend, werden aber im Altsystem weder berechnet noch validiert:

- reine Arbeitszeit plus Nachtbereitschaft entspricht dem Zeitumfang, den die Anzeige „Arbeitszeit gesamt“ nennt,
- reine Arbeitszeit und Nachtbereitschaft liegen innerhalb der Anwesenheitszeit,
- Nachtarbeit ist ein Teil der reinen Arbeitszeit und
- Nachtarbeit und Nachtbereitschaft beschreiben keine unzulässig überlappenden Zeitanteile.

Die üblichen Testdaten erfüllen einige dieser Erwartungen, beispielsweise `480` Minuten Anwesenheit und `450` Minuten Arbeitszeit. Das ist jedoch nur ein Beispiel und kein Test der Beziehung (`renderer/src/lib/validateEintragsdefinition.test.ts:7-19`).

#### Fachlich offen und technisch nicht abgesichert

Für feste Definitionen gibt es keinerlei Vergleich zwischen den fünf Zeitfeldern. Dadurch akzeptiert beziehungsweise speichert das Altsystem über den normalen Formularweg unter anderem:

- reine Arbeitszeit oberhalb der Anwesenheitszeit,
- Nachtbereitschaft oberhalb der Anwesenheitszeit,
- Nachtarbeit oberhalb der reinen Arbeitszeit,
- eine Summe aus reiner Arbeitszeit und Nachtbereitschaft oberhalb der Anwesenheitszeit,
- ein `arbeitszeitMinuten`-Feld, das nicht der Summe aus reiner Arbeitszeit und Nachtbereitschaft entspricht, sowie
- `0` in allen fünf Zeitfeldern.

Die Monatsauswertung korrigiert solche Snapshots nicht. Sie vertraut reiner Arbeitszeit, Nachtbereitschaft und Nachtarbeit unabhängig voneinander, ignoriert Anwesenheitszeit und das alte Arbeitszeitfeld und kann daher formal berechenbare, aber fachlich widersprüchliche Ergebnisse liefern (`renderer/src/lib/validateEintragsdefinition.ts:53-68`, `shared/auswertung.ts:70-79`).

### 8. Grenzfälle und technische Auffälligkeiten

- **Leerer Monat beziehungsweise fehlende Einträge:** Ohne erreichbare Planungseinträge bleiben alle Zeit-Summen und beide Zuschläge `0`. Für eine leere Tagesliste ist `0` bei den Arbeitstagen direkt getestet; die Zeitnullwerte folgen aus Initialisierung und Schleife, besitzen aber keinen eigenen Test (`shared/auswertung.ts:45-54`, `shared/auswertung.ts:85-106`, `shared/auswertung.test.ts:30-32`).
- **Nullwerte:** Ein vorhandener Eintrag mit lauter Nullwerten verändert keine Zeitkennzahl. Er kann unabhängig davon weiterhin eine kürzelbasierte Tageskennzahl aus Schritt 5 erhöhen.
- **Mehrere Kennzahlen aus demselben Eintrag:** Ein einzelner Sonntagseintrag mit reiner Arbeitszeit, Nachtbereitschaft und Nachtarbeit erhöht gleichzeitig die Sonntags-/Feiertagssumme, Arbeitszeit gesamt, reine Arbeitszeit gesamt, Nachtbereitschaft gesamt, Nachtarbeit gesamt und mittelbar beide Zuschlagswerte.
- **Sonntag und Feiertag zugleich:** Die reine Arbeitszeit wird wegen der gemeinsamen Oder-Bedingung einmal, nicht zweimal addiert. Dieser Zeitfall folgt unmittelbar aus der Implementierung, wird aber nicht durch einen eigenen Zeit-Summen-Test belegt (`shared/auswertung.ts:60-72`).
- **Samstag:** Ein gewöhnlicher Samstag besitzt keine Sonderwirkung. Ein Feiertag am Samstag zählt dagegen vollständig zur gemeinsamen Sonntags-/Feiertagssumme.
- **Dienst über Mitternacht:** Es findet keine Aufteilung nach Uhrzeiten oder Kalendertagen statt. Maßgeblich ist ausschließlich das Datum der Planungszelle.
- **Semantisch arbeitsfreier Eintrag mit Zeitwert:** Auch Urlaub, Krankheit oder `/` würden als „gearbeitete Zeit“ an einem Sonntag beziehungsweise Feiertag zählen, sobald ihr Snapshot eine positive reine Arbeitszeit enthält. Der Quellcode unterscheidet die fachliche Eintragsart nicht.
- **Inkonsistentes altes Arbeitszeitfeld:** Ein hoher oder niedriger Wert in `arbeitszeitMinuten` bleibt für alle Summen folgenlos. Das kann dazu führen, dass die Definitionstabelle einen anderen alten Arbeitszeitwert zeigt als die Monatsauswertung unter „Arbeitszeit gesamt“ (`renderer/src/components/EintragsdefinitionTable.tsx:45-81`, `shared/auswertung.ts:74-79`).
- **Keine Zwischenrundung der Summen:** Da gültige Snapshots bereits ganze Minuten enthalten, werden reine Arbeitszeit, Nachtbereitschaft und Nachtarbeit nur addiert. Ausschließlich die beiden prozentualen Monatsergebnisse werden gerundet.
- **Doppelte Eingabedaten:** Doppelte Kalendertage würden denselben erreichbaren Snapshot mehrfach summieren. Mehrere Dienstplantage mit demselben Datum würden in der internen `Map` auf die zuletzt gelieferte ID reduziert. Der reguläre Kalender- und Anlageweg erzeugt solche Daten nicht (`shared/auswertung.ts:43-62`).
- **Widersprüchliche Kalendermerkmale:** Ein manuell konstruierter Tag mit `wochentag: 'So'` zählt unabhängig von `istWochenende`; ein beliebiger Wochentag zählt bei `istFeiertag: true`. Der Feiertagsname wird nicht kontrolliert.

### 9. Testbelege und Grenzen der Absicherung

Direkt durch `shared/auswertung.test.ts` belegt sind:

- die gemeinsame Sonntags-/Feiertagssumme aus reiner Arbeitszeit und der Ausschluss von Nachtbereitschaft sowie gewöhnlichen Wochentagen (`shared/auswertung.test.ts:188-231`),
- die vier Monatssummen mit `Arbeitszeit gesamt = reine Arbeitszeit + Nachtbereitschaft` und der separaten Nachtarbeit (`shared/auswertung.test.ts:286-315`),
- die Prozentsätze `20 %` und `25 %` sowie die jeweiligen Rundungsergebnisse für einen Monat mit einem Eintrag (`shared/auswertung.test.ts:317-339`) und
- die Verwendung des Nachtbereitschaftszuschlags im späteren Ist-Wert (`shared/auswertung.test.ts:341-363`).

Unmittelbar aus der Implementierung, aber nicht durch einen dafür gezielten Test abgesichert, folgen insbesondere:

- `arbeitszeitMinuten` und `anwesenheitszeitMinuten` werden von der Monatsauswertung nicht gelesen,
- ein Sonntag mit gleichzeitigem Feiertagsstatus wird nur einmal berücksichtigt,
- ein Feiertag am Samstag wird berücksichtigt, ein gewöhnlicher Samstag nicht,
- Dienste über Mitternacht werden nicht aufgeteilt,
- Nachtzuschlag, Nachtarbeit, Nachtbereitschaft und Anwesenheit fließen nicht in die Sonntags-/Feiertagszeit ein,
- der Nachtzuschlag verändert keine andere Kennzahl und
- sämtliche Rollenfilter liegen in den aufrufenden Oberflächen.

Dass die Zuschläge erst nach Addition mehrerer Einträge gerundet werden, folgt eindeutig aus der Implementierungsreihenfolge (`shared/auswertung.ts:56-87`, `shared/auswertung.ts:95-106`). Der vorhandene Zuschlagstest enthält jedoch nur einen Eintrag und könnte deshalb eine versehentliche Rundung je Eintrag nicht von der implementierten Monatsrundung unterscheiden (`shared/auswertung.test.ts:317-339`).

Nicht abgesichert beziehungsweise fachlich widersprüchlich sind:

- Beziehungen zwischen Anwesenheitszeit, Arbeitszeit, reiner Arbeitszeit, Nachtbereitschaft und Nachtarbeit,
- die Bedeutung des ungenutzten Feldes `arbeitszeitMinuten` gegenüber der neu berechneten „Arbeitszeit gesamt“,
- die fachliche Einstufung beider Zuschläge als Zeitgutschrift,
- eine semantische Unterscheidung zwischen tatsächlich gearbeitetem Dienst und anrechenbaren Abwesenheitszeiten bei Sonntagen beziehungsweise Feiertagen und
- die historische Stabilität des alten Rollenfilters nach Änderungen am Mitarbeiter.

Die Tests wurden für Schritt 6 als Quelltext ausgewertet, aber nicht erneut ausgeführt. Der auf `src` begrenzte Alt-Checkout enthält kein Paketmanifest und damit keine eigenständig ausführbare Testumgebung. Es wurden keine Pakete installiert und keine Dateien des Altsystems verändert.

### 10. Abgrenzung zu Schritt 7

Schritt 6 entscheidet noch nicht über monatliche Soll-Arbeitszeit, Ist-Arbeitszeit oder Soll-/Ist-Differenz. Für die Abgrenzung ist jedoch wichtig, welche Schritt-6-Werte das Altsystem später verwendet:

`Ist-Arbeitszeit = reine Arbeitszeit gesamt + gerundeter Nachtbereitschaftszuschlag`

Damit verwendet die alte Ist-Formel weder „Arbeitszeit gesamt“ noch die vollständige Nachtbereitschaft, Nachtarbeit, den Nachtzuschlag oder die Sonntags-/Feiertagszeit. Der Nachtbereitschaftsanteil geht nur mit `25 %` ein (`shared/auswertung.ts:85-111`, `shared/auswertung.test.ts:341-363`). Diese zum damaligen Stand noch offene Frage wurde in Schritt 7 aufgelöst: Die alte Ist-Formel wurde verbindlich übernommen.

### 11. Priorisierte, einzeln entscheidbare Fachfragen

1. **Grundformel der Arbeitszeit (mit NB):** Soll die Arbeitszeit (mit NB) eines Eintrags verbindlich aus `reine Arbeitszeit + Nachtbereitschaft` abgeleitet werden, sodass kein unabhängig pflegbarer, potenziell widersprüchlicher Arbeitszeitwert mehr maßgeblich ist?
2. **Auswertungskreis:** Sollen die zeitbezogenen Monatskennzahlen wie die bereits beschlossenen allgemeinen Tageskennzahlen für alle Mitarbeiter des Monatsplan-Snapshots berechnet werden oder nur für Mitarbeiter mit der Rolle `Erzieher`?
3. **Einfache Monatssummen:** Sollen reine Arbeitszeit, Nachtbereitschaft und Nachtarbeit jeweils durch unveränderte Addition der ganzzahligen Snapshot-Minuten über alle Planungseinträge des Mitarbeiters gebildet werden?
4. **Plausibilität zur Anwesenheit:** Soll verbindlich gelten, dass Arbeitszeit (mit NB) die Anwesenheitszeit nicht überschreiten darf, oder existieren fachliche Fälle, in denen beide Größen nicht unmittelbar vergleichbar sind?
5. **Plausibilität der Nachtarbeit:** Muss Nachtarbeit vollständig in der reinen Arbeitszeit enthalten sein und darf sie diese deshalb nicht überschreiten?
6. **Sonntage und Feiertage gemeinsam oder getrennt:** Soll es wie im Altsystem eine gemeinsame Kennzahl geben, bei der ein zugleich sonntäglicher Feiertag nur einmal zählt, oder werden getrennte Summen benötigt?
7. **Grundlage der Sonntags-/Feiertagssumme:** Soll dort weiterhin ausschließlich die reine Arbeitszeit einfließen? Sollen anrechenbare Abwesenheitseinträge mit reiner Arbeitszeit ebenfalls zählen oder nur fachlich als tatsächlich gearbeitet klassifizierte Dienste?
8. **Dienste über Mitternacht:** Soll für den Prototyp weiterhin die vollständige Zeit dem Datum der Planungszelle zugeordnet werden, oder müssen Zeitanteile auf die tatsächlich berührten Kalendertage verteilt werden?
9. **Nachtzuschlag:** Soll der Wert weiterhin `20 %` der gesamten monatlichen Nachtarbeit betragen, als Zeitgutschrift in Minuten verstanden und erst nach der Monatssumme gerundet werden?
10. **Nachtbereitschaftszuschlag:** Soll der Wert weiterhin `25 %` der gesamten monatlichen Nachtbereitschaft betragen, als Zeitgutschrift in Minuten verstanden und erst nach der Monatssumme gerundet werden?
11. **Folgewirkung der Zuschläge:** Welche Zuschlagswerte verändern die spätere Ist-Arbeitszeit? Diese Entscheidung wird inhaltlich mit Schritt 7 abgeschlossen, muss aber auf der in Schritt 6 festgelegten Bedeutung der Zuschläge aufbauen.
12. **Inkonsistente Bestandsdaten:** Soll die fachliche Speichergrenze widersprüchliche Zeit-Snapshots ablehnen, und wie sollen bereits vorhandene ungültige Snapshots bei einer späteren technischen Umsetzung behandelt werden?

### 12. Verständliche, pragmatische Empfehlung

1. **Arbeitszeit (mit NB) eindeutig ableiten.** Im neuen Begriffssystem sollte je Eintrag und damit auch im Monat gelten: `Arbeitszeit (mit NB) = reine Arbeitszeit + Nachtbereitschaft`. Ein zusätzlich frei pflegbarer Arbeitszeitwert schafft nur Widersprüche und wurde vom Altsystem ohnehin nicht ausgewertet.
2. **Zeitkennzahlen rollenunabhängig berechnen.** Die Formeln benötigen keine Rolle. Deshalb sollten reine Arbeitszeit, Arbeitszeit (mit NB), Nachtbereitschaft, Nachtarbeit und kalenderbezogene Zeitsummen grundsätzlich für jeden Mitarbeiter des Monatsplan-Snapshots verfügbar sein. Spezifische Rollenbeschränkungen bleiben bei echten Rollenfunktionen wie der Rufbereitschaft.
3. **Ganzzahlige Snapshots unverändert summieren.** Die einfachen Monatssummen benötigen keine weitere Rundung. Das hält die Ergebnisse exakt nachvollziehbar.
4. **Plausibilität minimal, aber ausdrücklich festlegen.** Naheliegend sind mindestens `Arbeitszeit (mit NB) ≤ Anwesenheitszeit` und `Nachtarbeit ≤ reine Arbeitszeit`. Vor der Übernahme muss jedoch geprüft werden, ob Anwesenheitszeit in allen vorgesehenen Eintragsarten tatsächlich dieselbe zeitliche Grenze beschreibt.
5. **Gemeinsame Sonntags-/Feiertagskennzahl vorerst beibehalten.** Ein Tag sollte auch bei doppelter Eigenschaft höchstens einmal beitragen. Die Bezeichnung sollte klarstellen, dass im Altsystem tatsächlich reine Arbeitszeit summiert wird und nicht alle Zeitfelder.
6. **Kalendertagzuordnung für den Prototyp beibehalten.** Solange Beginn und Ende nur informativ sind und keine vollständigen Pausen- und Mitternachtsregeln existieren, ist eine minutengenaue Aufteilung über Tagesgrenzen nicht zuverlässig möglich. Die vollständige Zuordnung zum Datum der Planungszelle sollte dann als bewusste Vereinfachung dokumentiert werden.
7. **Beide Prozentsätze als monatlich gerundete Zeitwerte behandeln.** Die bestehende Reihenfolge „Monatssumme bilden, Prozentsatz anwenden, einmal auf volle Minuten runden“ ist eindeutig und vermeidet unnötige Rundungsabweichungen. Ob beide Zeitgutschriften in die Ist-Arbeitszeit einfließen, sollte anschließend ausdrücklich in Schritt 7 entschieden werden.
8. **Semantische Eintragsarten später ergänzen.** Eine belastbare Unterscheidung zwischen tatsächlich gearbeiteter Zeit und anrechenbaren Abwesenheiten ist mit frei gewählten Kürzeln nicht möglich. Für den Prototyp kann die Snapshot-Zeit zunächst maßgeblich bleiben; die Einschränkung sollte aber ebenso sichtbar dokumentiert werden wie bei der SN/F-Zählung.

### Status von Schritt 6

Die Quellcodeanalyse zu zeitbezogenen Monatssummen, Arbeitszeit gesamt, reiner Arbeitszeit, Nachtbereitschaft, Nachtarbeit, Sonntags-/Feiertagszeit sowie beiden prozentualen Zuschlägen ist abgeschlossen. Untersucht wurden Eingabefelder, tatsächliche Feldverwendung, Formeln, Einheiten, Rundungszeitpunkte, Kalender- und Rollenbezug, Entwurfs- und Snapshot-Verhalten, Plausibilitätsbeziehungen, Grenzfälle, Folgewirkungen und vorhandene Tests.

Schritt 6 ist damit **quellcodeanalytisch und fachlich abgeschlossen**. Die verbindlichen Entscheidungen werden nachfolgend festgehalten. Die damals zu Schritt 7 abgegrenzte Folgewirkung der Zuschläge ist inzwischen entschieden: Nur der Nachtbereitschaftszuschlag fließt in die Ist-Arbeitszeit ein.

### Bereits verbindlich entschieden

Am 11. September 2026 wurde die zunächst getroffene Entscheidung zu den Zeitwerten fester Eintragsdefinitionen auf Wunsch des Benutzers revidiert. Verbindlich gilt nun:

- Reine Arbeitszeit und Nachtbereitschaft bleiben eigenständige, vom Benutzer festgelegte Zeitwerte.
- Arbeitszeit (mit NB) wird je Planungseintrag verbindlich als `reine Arbeitszeit + Nachtbereitschaft` berechnet.
- Arbeitszeit (mit NB) ist kein zusätzlich frei pflegbarer Wert und darf nicht von dieser Summe abweichen.
- Der berechnete Wert wird gemeinsam mit den übrigen konkreten Zeitwerten im Planungseintrag-Snapshot gespeichert.
- Anwesenheitszeit und Nachtarbeit bleiben von dieser Additionsformel unberührt.

Damit wird die im Altsystem nur bei der Auswertung verwendete Formel als ausdrückliche und bereits je Planungseintrag geltende Fachregel in das neue Projekt übernommen.

Für die monatliche Arbeitszeit (mit NB) gilt entsprechend:

- Die Monatssumme entspricht der Addition aller je Planungseintrag berechneten und im Snapshot gespeicherten Werte Arbeitszeit (mit NB) des betreffenden Mitarbeiters.
- Jeder Eintragswert beruht auf `reine Arbeitszeit + Nachtbereitschaft`; eine leere Planungszelle trägt `0` Minuten bei.
- Reine Arbeitszeit und Nachtbereitschaft werden zusätzlich als eigenständige Monatssummen ausgewertet.
- Die Addition bereits ganzzahliger Minutenwerte benötigt keine weitere Rundung.

Gegenüber dem Altsystem wird die Beziehung damit früher und konsistenter angewendet: Das Altsystem ignoriert einen möglicherweise abweichenden gespeicherten Wert erst bei der Monatsauswertung; das neue Fachmodell lässt einen solchen Widerspruch bereits im einzelnen Planungseintrag nicht zu.

Für den Rollenbezug der zeitbezogenen Kennzahlen wurde die zunächst formulierte Auswertungskreis-Regel präzisiert. Verbindlich gilt:

- Die Berechnungsformeln für Arbeitszeit (mit NB), reine Arbeitszeit, Nachtbereitschaft, Nachtarbeit, Arbeitszeit an Sonntagen und gesetzlichen Feiertagen sowie Nacht- und Nachtbereitschaftszuschlag sind rollenunabhängig.
- Die Formeln können für jeden Mitarbeiter des Monatsplans aus dessen Kalendertagen und Planungseintrag-Snapshots ausgeführt werden; eine Rollenprüfung ist kein Bestandteil der Berechnung.
- Erst die Bedienoberfläche filtert die sichtbare zeitbezogene Auswertung und listet ausschließlich Mitarbeiter auf, deren Rolle im Mitarbeiter-Snapshot des Monatsplans `Erzieher` ist.
- Maßgeblich für diesen Darstellungsfilter ist die im Monatsplan gespeicherte Rolle; spätere Änderungen am Mitarbeiter-Stammdatensatz verändern die sichtbare Auswertung eines bestehenden Plans nicht.
- Mitarbeiter anderer Rollen und ihre Planungseinträge bleiben im Monatsplan erhalten. Ihre Zeitwerte sind nach denselben Formeln berechenbar, werden in dieser Oberfläche jedoch nicht aufgelistet.
- Die in Schritt 5 beschlossene rollenunabhängige Auswertung der allgemeinen tagesbezogenen Kennzahlen bleibt davon unberührt.
- Der Rollenbezug von Soll, Ist und Differenz war an dieser Stelle noch Schritt 7 vorbehalten und wurde dort inzwischen rollenunabhängig festgelegt; Darstellungsfilter bleiben davon getrennte Oberflächenregeln.

Für die einfachen zeitbezogenen Monatssummen wurde festgelegt:

- Monatliche reine Arbeitszeit, monatliche Nachtbereitschaft und monatliche Nachtarbeit entstehen jeweils durch unveränderte Addition der entsprechenden Snapshot-Minuten aller Planungseinträge des Mitarbeiters.
- Jeder Planungseintrag trägt seinen jeweiligen Wert genau einmal bei; eine leere Planungszelle trägt `0` Minuten bei.
- Die drei Zeitarten werden unabhängig voneinander summiert. Derselbe Planungseintrag kann deshalb gleichzeitig zu mehreren Summen beitragen.
- Da die Snapshot-Werte bereits ganze Minuten sind, findet bei diesen Additionen keine weitere Rundung statt.
- Spätere Änderungen einer Eintragsdefinition wirken wegen des bestehenden Snapshot-Prinzips nicht rückwirkend auf vorhandene Monatssummen.

Für das Verhältnis zwischen Anwesenheitszeit und Arbeitszeit (mit NB) wurde festgelegt:

- Die mögliche Plausibilitätsregel `Arbeitszeit (mit NB) ≤ Anwesenheitszeit` wird nicht Bestandteil des Fachmodells.
- Anwesenheitszeit und Arbeitszeit (mit NB) werden nicht anhand ihrer Größe miteinander verglichen.
- Anwesenheitszeit wird weder aus anderen Zeitwerten abgeleitet noch als deren Obergrenze verwendet.
- Diese Entscheidung gilt auch für feste Eintragsdefinitionen.
- Bei `Wochenarbeitszeit` bleibt dadurch die bereits beschlossene Kombination aus Anwesenheitszeit `0` und positiver berechneter Arbeitszeit zulässig.

Für das Verhältnis zwischen Nachtarbeit und reiner Arbeitszeit wurde festgelegt:

- Die mögliche Plausibilitätsregel `Nachtarbeit ≤ reine Arbeitszeit` wird ebenfalls nicht Bestandteil des Fachmodells.
- Nachtarbeit und reine Arbeitszeit werden nicht anhand ihrer Größe miteinander verglichen.
- Ein Nachtarbeitswert oberhalb der reinen Arbeitszeit wird nicht automatisch abgelehnt, korrigiert oder gekürzt.
- Die Auswertung verwendet beide Snapshot-Werte als eigenständige Zeitangaben unverändert.

Für die Behandlung von Sonntagen und gesetzlichen Feiertagen wurde festgelegt:

- Arbeitszeit an Sonntagen und gesetzlichen Feiertagen wird wie im Altsystem in einer gemeinsamen monatlichen Kennzahl geführt.
- Ein Kalendertag wird berücksichtigt, wenn er ein Sonntag oder ein gesetzlicher Feiertag in Brandenburg ist.
- Trifft beides auf dasselbe Datum zu, trägt der Planungseintrag nur einmal zur gemeinsamen Summe bei.
- Ein Feiertag an einem Samstag oder anderen Wochentag wird aufgrund des Feiertagsstatus berücksichtigt; ein gewöhnlicher Samstag besitzt keine Sonderwirkung.
- Separate Monatskennzahlen für Sonntage und Feiertage werden nicht zusätzlich gebildet.
- Jeder berücksichtigte Planungseintrag trägt ausschließlich seine im Snapshot gespeicherte reine Arbeitszeit zur gemeinsamen Summe bei.
- Anwesenheitszeit, Arbeitszeit (mit NB), Nachtbereitschaft und Nachtarbeit bleiben für diese Kennzahl unberücksichtigt.
- Die ganzzahligen Snapshot-Minuten werden unverändert addiert; eine weitere Rundung ist nicht erforderlich.
- Die Berechnung unterscheidet wie im Altsystem nicht zwischen tatsächlich gearbeitetem Dienst, Urlaub, Krankheit, Frei oder anderen fachlichen Bedeutungen eines Planungseintrags.
- Kürzel und Bezeichnung beeinflussen die Zeitberechnung nicht. Jeder Eintrag mit positiver reiner Arbeitszeit trägt seinen Wert bei.
- Soll eine Eintragsdefinition keinen Beitrag zu dieser Kennzahl erzeugen, muss ihre reine Arbeitszeit `0` betragen.
- Die fehlende semantische Klassifizierung wird als bewusste Einschränkung des Prototyps dokumentiert und kann später durch ausdrücklich klassifizierte Eintragsarten ersetzt werden.
- Wie im Altsystem gehört auch im neuen Projekt jeder Planungseintrag immer genau zu einem Kalendertag und einer Planungszelle. Es gibt keine Planungseinträge, die auf mehrere Kalendertage verteilt werden.
- Beginn und Ende dürfen zwar einen Dienst über Mitternacht darstellen, erzeugen aber keinen zweiten Eintrag und verschieben keine Zeitanteile auf den Folgetag.
- Für die Sonntags-/Feiertagskennzahl ist ausschließlich der Kalendertag der Planungszelle maßgeblich; die vollständige reine Arbeitszeit wird diesem einen Tag zugerechnet.
- Ein am Sonntag zugeordneter und laut Uhrzeiten am Montag endender Dienst zählt deshalb vollständig zum Sonntag. Ein am gewöhnlichen Samstag zugeordneter Dienst zählt nicht allein wegen einer Ende-Uhrzeit am Sonntag.

Diese Entscheidung wurde in `docs/Berechnungen/` übernommen.

Für den Nachtzuschlag wurde festgelegt:

- Der Nachtzuschlag beträgt `20 %` der gesamten monatlichen Nachtarbeit eines Mitarbeiters.
- Er ist eine Zeitgutschrift in ganzen Minuten und kein Geldbetrag.
- Zuerst werden die Nachtarbeitsminuten sämtlicher Planungseinträge des Mitarbeiters im Kalendermonat summiert. Erst auf diese Monatssumme werden `20 %` angewendet.
- Das daraus entstehende Ergebnis wird anschließend genau einmal nach der allgemeinen Rundungsmethode auf eine volle Minute gerundet. Eine Rundung je Planungseintrag findet nicht statt.
- Die Formel lautet: `Nachtzuschlag = Rundung(monatliche Nachtarbeit × 20 %)`.
- Die damals noch offene Folgewirkung wurde in Schritt 7 entschieden: Der Nachtzuschlag fließt nicht in die Ist-Arbeitszeit ein.

Damit wurden Berechnungsgrundlage, Prozentsatz, Einheit und Rundungszeitpunkt des Altsystems übernommen. Die zu diesem Zeitpunkt noch zurückgestellte Ist-Wirkung wurde später in Schritt 7 entschieden. Diese Entscheidung wurde in `docs/Berechnungen/` übernommen.

Für den Nachtbereitschaftszuschlag wurde festgelegt:

- Der Nachtbereitschaftszuschlag beträgt `25 %` der gesamten monatlichen Nachtbereitschaft eines Mitarbeiters.
- Er ist eine Zeitgutschrift in ganzen Minuten und kein Geldbetrag.
- Zuerst werden die Nachtbereitschaftsminuten sämtlicher Planungseinträge des Mitarbeiters im Kalendermonat summiert. Erst auf diese Monatssumme werden `25 %` angewendet.
- Das daraus entstehende Ergebnis wird anschließend genau einmal nach der allgemeinen Rundungsmethode auf eine volle Minute gerundet. Eine Rundung je Planungseintrag findet nicht statt.
- Die Formel lautet: `Nachtbereitschaftszuschlag = Rundung(monatliche Nachtbereitschaft × 25 %)`.
- Die damals noch offene Folgewirkung wurde in Schritt 7 entschieden: Der Nachtbereitschaftszuschlag fließt vollständig in die Ist-Arbeitszeit ein.

Damit wurden auch für den Nachtbereitschaftszuschlag Berechnungsgrundlage, Prozentsatz, Einheit und Rundungszeitpunkt des Altsystems übernommen. Die zu diesem Zeitpunkt noch zurückgestellte Ist-Wirkung wurde später in Schritt 7 entschieden. Diese Entscheidung wurde in `docs/Berechnungen/` übernommen.

Für die Darstellung und Datenkonsistenz der Arbeitszeit (mit NB) wurde ergänzend festgelegt:

- In der EntryTypes-Verwaltung wird Arbeitszeit (mit NB) weiterhin sichtbar angezeigt.
- Der Benutzer kann diesen Wert nicht selbst ändern. Die Anwendung berechnet und aktualisiert ihn aus `reine Arbeitszeit + Nachtbereitschaft`.
- Jeder Planungseintrag-Snapshot muss den abgeleiteten Wert enthalten; er muss exakt mit dieser Summe übereinstimmen.
- Ob der Wert zusätzlich in der Eintragsdefinition gespeichert oder dort nur für die schreibgeschützte Anzeige berechnet wird, bleibt eine technische Datenmodellentscheidung. Wird er gespeichert, muss er auch dort exakt der Summe entsprechen.
- Ein abweichender gespeicherter Wert wird beim Laden beziehungsweise an der fachlichen Speichergrenze als ungültig abgelehnt und nicht stillschweigend korrigiert.
- Dies ist keine zusätzliche Plausibilitätsformel zwischen eigenständigen Zeitarten, sondern die Durchsetzung der bereits verbindlichen Definition von Arbeitszeit (mit NB).

Damit war auch die letzte in Schritt 6 offene Frage zu widersprüchlichen gespeicherten Zeitwerten entschieden. Die anschließend in Schritt 7 behandelte Folgewirkung der Zuschläge ist inzwischen ebenfalls verbindlich festgelegt.

## Ergebnis von Schritt 7: Soll-, Ist- und Differenzberechnung

### 1. Technischer Auswertungsrahmen und Eingaben des Altsystems

Die zentrale Funktion `berechneKennzahlenFuerMitarbeiter` berechnet Soll-Arbeitszeit, Ist-Arbeitszeit und Differenz gemeinsam mit den übrigen Monatskennzahlen für genau einen Mitarbeiter (`shared/auswertung.ts:16-42`). Für Schritt 7 verwendet sie unmittelbar oder mittelbar:

- die ID des auszuwertenden Mitarbeiters,
- dessen im Altsystem aktuell geladene Wochenarbeitszeit in Minuten,
- die Kalendertage des betrachteten Monats mit Wochenend- und Feiertagsstatus,
- die Dienstplantage zur Zuordnung der Kalenderdaten zu technischen IDs und
- die Planungseintrag-Snapshots des aktuellen Planentwurfs (`shared/auswertung.ts:35-43`, `renderer/src/pages/PlanPage.tsx:77-111`, `renderer/src/pages/PlanPage.tsx:499-542`).

Die ebenfalls übergebenen Rufbereitschaften verändern weder Soll noch Ist oder Differenz. Anzahl freier Tage, SN/F-Dienste, Sonntags-/Feiertagszeit, Anwesenheitszeit und Beginn beziehungsweise Ende werden für diese drei Werte ebenfalls nicht verwendet (`shared/auswertung.ts:45-93`).

Im Altsystem stammen Rolle und Wochenarbeitszeit aus dem aktuell geladenen Mitarbeiter-Stammdatensatz. Der Dienstplan besitzt dort keinen Mitarbeiter-Snapshot (`shared/types.ts:1-8`, `shared/types.ts:46-77`, `renderer/src/pages/PlanPage.tsx:77-109`). Für das neue Fachmodell ist bereits abweichend und verbindlich entschieden, dass Rolle und Wochenarbeitszeit aus dem Mitarbeiter-Snapshot des Monatsplans stammen. Diese bestehende Zielregel ist keine neue Entscheidung aus Schritt 7.

### 2. Monatliche Soll-Arbeitszeit im Altsystem

Zunächst zählt das Altsystem die kalendarischen Arbeitstage der übergebenen Tagesliste. Ein Arbeitstag ist ein Tag, der weder als Wochenende noch als Feiertag markiert ist (`shared/auswertung.ts:10-14`). Danach gilt:

`Soll-Arbeitszeit = Rundung(Anzahl kalendarischer Arbeitstage × Wochenarbeitszeit / 5)`

- Die Berechnung erfolgt pro Mitarbeiter und Kalendermonat (`shared/auswertung.ts:85-93`).
- Die Anzahl der Arbeitstage ist für alle Mitarbeiter desselben Monats gleich. Persönliche Planungseinträge, Urlaub, Krankheit, Beschäftigungsbeginn, Rufbereitschaften und die tatsächliche Verteilung der Arbeitszeit verändern sie nicht.
- Die individuelle Wochenarbeitszeit ist der einzige mitarbeiterabhängige Eingangswert der Soll-Formel.
- Das Altsystem teilt jede Wochenarbeitszeit pauschal durch fünf. Andere regelmäßige Wochenmodelle oder individuell festgelegte Arbeitstage werden nicht berücksichtigt.
- Technisch wird erst das vollständige Monatsprodukt berechnet und anschließend einmal mit `Math.round` auf volle Minuten gerundet (`shared/auswertung.ts:91-93`, `shared/rundeAufVolleMinute.ts:1-5`). Es gibt keine tägliche Rundung und keine Resteverteilung.

Das neue Fachmodell schreibt bereits vor, dass die Wochenarbeitszeit in Fünf-Minuten-Schritten angegeben wird und daher ohne Rest durch fünf teilbar ist. Bei gültigen neuen Daten ist `Wochenarbeitszeit / 5` somit bereits eine ganze Minute. Die Multiplikation mit der ganzzahligen Arbeitstagszahl kann keinen Bruchteil erzeugen; eine Rundung der Soll-Arbeitszeit wäre im Zielmodell rechnerisch wirkungslos und nicht erforderlich.

### 3. Monatliche Ist-Arbeitszeit im Altsystem

Das Altsystem bildet die Ist-Arbeitszeit mit folgender Formel (`shared/auswertung.ts:85-90`):

`Ist-Arbeitszeit = monatliche reine Arbeitszeit + Rundung(monatliche Nachtbereitschaft × 25 %)`

Nach den bereits verbindlichen Begriffen des neuen Fachmodells ist der zweite Summand der **Nachtbereitschaftszuschlag**. Für die alte Ist-Formel gilt damit im Einzelnen:

- Die reine Arbeitszeit aller erreichbaren Planungseintrag-Snapshots wird vollständig berücksichtigt.
- Von der Nachtbereitschaft fließt nicht die vollständige Dauer, sondern ausschließlich ihr einmal monatlich gerundeter 25-Prozent-Wert ein.
- Die gesondert ausgewiesene Arbeitszeit (mit NB), also reine Arbeitszeit plus vollständige Nachtbereitschaft, wird nicht als Ist-Arbeitszeit verwendet.
- Der Nachtzuschlag von 20 Prozent wird berechnet und angezeigt, aber nicht zum Ist addiert.
- Nachtarbeit selbst wird nicht zusätzlich addiert; sie kann bereits als Teil der unabhängig gespeicherten reinen Arbeitszeit enthalten sein, ohne dass der Altcode dies prüft.
- Sonntags-/Feiertagszeit, Anwesenheitszeit, Rufbereitschaften und tagesbezogene Zähler verändern das Ist nicht.

Der Nachtbereitschaftszuschlag wird zuerst aus der vollständigen Monatssumme berechnet und gerundet. Die anschließende Addition zur bereits ganzzahligen reinen Arbeitszeit wird nicht erneut gerundet (`shared/auswertung.ts:85-90`).

Die unterschiedliche Wirkung der beiden Zuschläge ist fachlich auffällig: Beide werden im neuen Fachmodell bereits als Zeitgutschrift bezeichnet, im Altsystem erhöht aber nur der Nachtbereitschaftszuschlag das Ist. Für den Nachtzuschlag existiert dort keine weitere Folgewirkung. Ob dies beabsichtigt oder eine Auslassung war, lässt sich aus dem Quellcode nicht ableiten.

### 4. Soll-/Ist-Differenz und fachliche Interpretation

Die Differenz wird im Altsystem unmittelbar aus den beiden bereits auf ganze Minuten festgelegten Monatswerten gebildet (`shared/auswertung.ts:109-111`):

`Soll-/Ist-Differenz = Ist-Arbeitszeit − Soll-Arbeitszeit`

- Ein positiver Wert bedeutet, dass das Ist oberhalb des Solls liegt.
- Ein negativer Wert bedeutet, dass das Soll noch nicht erreicht ist.
- `0` bedeutet einen exakten Ausgleich.
- Die Differenz wird nicht nochmals gerundet.

Die Vorzeichenrichtung entspricht bereits der verbindlichen Darstellungsregel des neuen Fachmodells. Positive Differenzen werden mit `+`, negative mit `−` und ihrem absoluten Zeitbetrag dargestellt. Das Altsystem zeigt den Nullwert als `0:00`; für das neue Projekt wurde in Schritt 2 bereits abweichend `00:00` ohne Vorzeichen festgelegt (`shared/auswertung.ts:115-120`, `shared/auswertung.test.ts:414-425`).

### 5. Rollenbezug und sichtbare Darstellung im Altsystem

Die Berechnungsfunktion selbst enthält keine Rollenprüfung. Sie kann Soll, Ist und Differenz für jede Mitarbeiter-ID und jede übergebene Wochenarbeitszeit berechnen (`shared/auswertung.ts:35-42`). Die Rollenbegrenzung entsteht ausschließlich in den aufrufenden Oberflächen:

- Das ausführliche Planungsraster berechnet die Werte nur für aktuell als `Erzieher` geführte Mitarbeiter. Für andere Rollen zeigt es bei Differenz, Ist und Soll `n/A` (`renderer/src/components/layout/PlanungsGrid.tsx:226-243`, `renderer/src/components/layout/PlanungsGrid.tsx:274-314`, `renderer/src/components/layout/PlanungsGrid.tsx:449-483`).
- Die verkürzte Ansicht berechnet ebenfalls nur für `Erzieher`; bei anderen Rollen bleiben die sichtbaren Ist- und Soll-Zellen leer (`renderer/src/components/layout/VerkuerzteAnsicht.tsx:45-62`, `renderer/src/components/layout/VerkuerzteAnsicht.tsx:180-215`).
- Der Auswertungsdialog führt ausschließlich `Erzieher` als Mitarbeiterspalten und zeigt dort Ist, Soll und Differenz zusammen mit den übrigen Kennzahlen (`renderer/src/components/AuswertungDialog.tsx:24-59`, `renderer/src/components/AuswertungDialog.tsx:84-106`, `renderer/src/components/AuswertungDialog.tsx:125-169`).

Im Planungsraster steht die Differenz im Kopfbereich jeder Mitarbeiterspalte; Ist und Soll werden zusätzlich in zwei Abschlusszeilen unter dem Kalender angezeigt. Die verkürzte Ansicht zeigt nur die Abschlusszeilen für Ist und Soll. Der Auswertungsdialog zeigt alle drei Werte als eigene Zeilen.

Ist und Soll werden wie andere nichtnegative Zeitdauern im Format `HH:MM` ausgegeben. Die Differenz verwendet die gesonderte Vorzeichenformatierung (`shared/time.ts:14-22`, `shared/auswertung.ts:115-120`). Im Altsystem wird ein exakter Ausgleich mit der Primärfarbe und jede positive oder negative Abweichung mit derselben Warnfarbe dargestellt. Positive und negative Abweichungen werden farblich nicht unterschieden (`renderer/src/lib/sollIstFarbe.ts:1-8`, `renderer/src/lib/sollIstFarbe.test.ts:4-19`).

### 6. Entwurfsstand, gespeicherter Stand und Snapshot-Wirkung

Die sichtbaren Ansichten übergeben den aktuellen `planeintraegeEntwurf` an die gemeinsame Kennzahlenfunktion. Neu gesetzte, ersetzte oder entfernte, aber noch nicht gespeicherte Einträge verändern das angezeigte Ist und damit die Differenz deshalb sofort (`renderer/src/pages/PlanPage.tsx:82-125`, `renderer/src/pages/PlanPage.tsx:499-542`). Die Soll-Arbeitszeit verwendet den Entwurf dagegen nicht und bleibt bei reinen Eintragsänderungen unverändert, weil sie ausschließlich von Kalender und Wochenarbeitszeit abhängt.

Die Ist-Grundlagen stammen aus den Zeitwerten der Planungseintrag-Snapshots. Änderungen an einer Eintragsdefinition verändern vorhandene Ist-Werte nicht rückwirkend. Im Altsystem kann dagegen eine spätere Änderung der aktuellen Wochenarbeitszeit das Soll eines alten Plans verändern, obwohl dessen bestehende Planungseinträge unverändert bleiben. Auch eine Rollenänderung kann die gesamte sichtbare Soll-/Ist-Auswertung ein- oder ausblenden (`renderer/src/pages/PlanPage.tsx:100-109`, `renderer/src/components/AuswertungDialog.tsx:84-106`).

Für das neue Projekt gilt bereits verbindlich:

- Planungseinträge und Mitarbeiterdaten sind Snapshots des Monatsplans.
- Die Soll-Formel muss die im Mitarbeiter-Snapshot des Plans gespeicherte Wochenarbeitszeit verwenden.
- Die Ist-Formel muss die im Plan gespeicherten Planungseintrag-Snapshots verwenden.
- Spätere Änderungen an Mitarbeiter-Stammdaten oder Eintragsdefinitionen dürfen bestehende Soll-/Ist-Ergebnisse nicht rückwirkend verändern.

Noch für Schritt 7 zu entscheiden ist, ob die bereits für tagesbezogene Kennzahlen festgelegte Live-Vorschau-Regel ausdrücklich auch für Soll, Ist und Differenz gelten soll.

### 7. Rundungszeitpunkte und Rechenreihenfolge

Im Altsystem ist die Reihenfolge eindeutig:

1. Reine Arbeitszeit und Nachtbereitschaft werden als ganzzahlige Snapshot-Minuten über den Monat summiert.
2. Der Nachtbereitschaftszuschlag wird aus der Monatssumme berechnet und einmal gerundet.
3. Die alte Ist-Arbeitszeit entsteht durch Addition von reiner Arbeitszeit und gerundetem Nachtbereitschaftszuschlag; sie wird nicht erneut gerundet.
4. Die alte Soll-Arbeitszeit wird aus Arbeitstagszahl und Wochenarbeitszeit berechnet und danach einmal gerundet.
5. Die Differenz entsteht als `Ist − Soll` und wird nicht gerundet (`shared/auswertung.ts:85-111`).

Für das neue Zielmodell sind beide Zuschläge bereits als separat nach ihrer jeweiligen Monatssumme gerundete ganze Minutenwerte festgelegt. Werden einer oder beide Zuschläge in das Ist aufgenommen, darf nach ihrer Addition keine weitere Rundung erfolgen. Beim Soll entfällt wegen der verbindlichen Teilbarkeit der Wochenarbeitszeit durch fünf jeder Bruchteil.

### 8. Grenzfälle und technische Auffälligkeiten

- **Keine Planungseinträge:** Die alte Ist-Arbeitszeit ist `0`; bei positivem Monatssoll ist die Differenz entsprechend negativ.
- **Keine kalendarischen Arbeitstage beziehungsweise leere Tagesliste:** Das Soll ist `0`. Eine leere Tagesliste erzeugt zusätzlich keine erreichbaren Ist-Einträge. In einem gültigen neuen Monatsplan ist eine leere oder unvollständige Tagesliste aufgrund der bereits festgelegten vollständigen Monatsgrundlage kein zulässiger Normalfall.
- **Arbeit nur am Wochenende oder Feiertag:** Diese Zeit erhöht das Ist wie jeder andere erreichbare Planungseintrag, obwohl der betreffende Tag das Soll nicht erhöht.
- **Abwesenheitseintrag mit positiver reiner Arbeitszeit:** Mangels semantischer Eintragsklassifizierung erhöht auch er das alte Ist. Kürzel und Bezeichnung werden in der Ist-Formel nicht geprüft.
- **Nachtarbeit ohne reine Arbeitszeit:** Der Nachtzuschlag wird dennoch berechnet. Im Altsystem bleibt er für das Ist folgenlos; bei einer künftigen Einbeziehung könnte dadurch ein positives Ist allein aus dieser Zeitgutschrift entstehen. Zwischen Nachtarbeit und reiner Arbeitszeit wurde bewusst keine Plausibilitätsformel festgelegt.
- **Nachtbereitschaft ohne reine Arbeitszeit:** Im Altsystem entsteht ein Ist in Höhe des gerundeten 25-Prozent-Werts, obwohl die reine Arbeitszeit `0` ist.
- **Fehlender Dienstplantag:** Die Ist-Schleife überspringt den betroffenen Kalendertag vollständig. Das Soll zählt den Kalendertag dennoch, weil seine Arbeitstagszahl direkt aus der Kalenderliste entsteht (`shared/auswertung.ts:43-58`, `shared/auswertung.ts:85-93`). Ein gültiger neuer Monatsplan muss daher alle Kalendertage vollständig und eindeutig enthalten.
- **Doppelte Kalendertage:** Sie könnten Soll und Ist mehrfach erhöhen. Der reguläre Kalendergenerator erzeugt solche Daten nicht; das Zielmodell verlangt bereits genau einen Eintrag je Kalendertag.
- **Wochenarbeitszeit `0`:** Der normale Teamverwaltungsweg des Altsystems lehnt `0` und negative Werte ab, obwohl die Berechnungsfunktionen mit `0` rechnerisch ein Soll von `0` bilden könnten (`renderer/src/lib/validateTeamMember.ts:17-34`, `renderer/src/lib/validateTeamMember.test.ts:41-53`). Ob `0` im neuen Fachmodell für einen aktiven Mitarbeiter zulässig sein soll, ist bislang nicht ausdrücklich festgelegt.
- **Spätere Änderung der Wochenarbeitszeit:** Sie verändert im Altsystem das Soll, aber nicht die bereits gespeicherten Ist-Snapshots. Diese historische Inkonsistenz wird im neuen Zielmodell durch den bereits beschlossenen Mitarbeiter-Snapshot vermieden.

### 9. Vorhandene Tests und Grenzen ihrer Aussagekraft

Direkt in `shared/auswertung.test.ts` belegt sind:

- Die alte Ist-Formel verwendet reine Arbeitszeit plus gerundete 25 Prozent der Nachtbereitschaft: `420 + Rundung(40 × 25 %) = 430` Minuten (`shared/auswertung.test.ts:341-363`).
- Bei 21 konstruierten Arbeitstagen und `2340` Minuten Wochenarbeitszeit entsteht ein Soll von `9828` Minuten beziehungsweise `163:48` Stunden. Ein gleich hohes Ist ergibt eine Differenz von `0` (`shared/auswertung.test.ts:365-388`).
- Bei einem niedrigeren Ist entsteht eine negative Differenz; im Test sind es `100 − 468 = −368` Minuten (`shared/auswertung.test.ts:390-410`).
- Die Differenzformatierung gibt positive, nullwertige und negative Beispiele als `+01:30`, `0:00` und `−01:30` aus (`shared/auswertung.test.ts:414-425`).
- Die Farbhilfe behandelt `0` als ausgeglichen und positive wie negative Abweichungen mit derselben Abweichungsfarbe (`renderer/src/lib/sollIstFarbe.test.ts:4-19`).

Die Tests sichern dagegen insbesondere nicht gezielt ab:

- dass der Nachtzuschlag aus dem Ist ausgeschlossen bleibt,
- dass die vollständige Nachtbereitschaft und die Arbeitszeit (mit NB) nicht als Ist verwendet werden,
- eine positive berechnete Differenz; positiv wird nur die Formatierung getestet,
- die Soll-Rundung bei einem tatsächlich gebrochenen Monatsergebnis; das vorhandene Soll-Beispiel ergibt bereits exakt ganze Minuten,
- Monate ohne Planungseinträge oder mit `0` Arbeitstagen innerhalb der vollständigen Kennzahlenfunktion,
- unvollständige oder doppelte Kalender- beziehungsweise Dienstplantage,
- die Rollenfilter und die unterschiedliche Leer- beziehungsweise `n/A`-Darstellung der drei Oberflächen,
- die sofortige Wirkung ungespeicherter Änderungen sowie
- die historische Veränderung des Solls nach einer Änderung der Wochenarbeitszeit.

Der Quellcode legt die nicht eigens getesteten Ein- und Ausschlüsse der alten Formel dennoch eindeutig fest. Die Tests wurden in Schritt 7 als Quelltext ausgewertet und nicht erneut ausgeführt. Es wurden keine Pakete installiert und keine Dateien des Altsystems verändert.

### 10. Trennung von Altbefund und bereits verbindlichem Zielmodell

Folgende Punkte sind **nur technischer Altbefund** und noch keine neue Fachregel:

- `Ist = reine Arbeitszeit + Nachtbereitschaftszuschlag`; der Nachtzuschlag bleibt unberücksichtigt.
- Soll, Ist und Differenz werden in den alten Oberflächen nur für aktuell als `Erzieher` geführte Mitarbeiter sichtbar berechnet.
- Die alte Wochenarbeitszeit stammt aus veränderlichen Mitarbeiter-Stammdaten.
- Der alte Nullwert wird als `0:00` dargestellt und jede Abweichungsrichtung erhält dieselbe Warnfarbe.

Folgende Grundlagen sind für das **neue Fachmodell bereits verbindlich** und werden durch Schritt 7 nicht erneut geöffnet:

- kalendarische Arbeitstage sind Montag bis Freitag ohne gesetzlichen Feiertag in Brandenburg und für alle Mitarbeiter gleich,
- die Wochenarbeitszeit ist ohne Rest durch fünf teilbar,
- reine Arbeitszeit und beide Zuschläge liegen nach ihren beschlossenen Berechnungen als ganze Minutenwerte vor,
- Nachtzuschlag und Nachtbereitschaftszuschlag sind Zeitgutschriften,
- Planungseintrag und Mitarbeiter sind Snapshots des Monatsplans,
- die Formeln zeitbezogener Kennzahlen sind rollenunabhängig; die sichtbare zeitbezogene Auswertung filtert auf die im Plan gespeicherte Rolle `Erzieher`,
- positive und negative Differenzen werden mit Vorzeichen, ein Ausgleich als `00:00` dargestellt und
- negative Differenzen sind zulässige Rechenergebnisse.

Neu zu entscheiden sind damit vor allem die genaue Zusammensetzung des Ist, die ausdrückliche Anwendung des Rollen- und Entwurfsprinzips auf Soll/Ist/Differenz sowie wenige verbleibende Grenz- und Darstellungsfragen.

### 11. Priorisierte, einzeln entscheidbare Fachfragen

1. **Soll-Formel:** Soll die monatliche Soll-Arbeitszeit als `Anzahl kalendarischer Arbeitstage × Wochenarbeitszeit aus dem Mitarbeiter-Snapshot / 5` berechnet werden? Aufgrund der verbindlichen Fünf-Minuten-Schritte wäre keine Rundung erforderlich.
2. **Ist-Formel und Zeitgutschriften:** Soll das Ist wie im Altsystem nur aus reiner Arbeitszeit plus Nachtbereitschaftszuschlag bestehen, oder sollen beide bereits als Zeitgutschrift definierten Werte einfließen: `Ist = reine Arbeitszeit + Nachtzuschlag + Nachtbereitschaftszuschlag`?
3. **Abgrenzung zur Arbeitszeit (mit NB):** Soll die monatliche Arbeitszeit (mit NB) eine separate Informationskennzahl bleiben, während für das Ist nur der anrechenbare Anteil der Nachtbereitschaft über den 25-Prozent-Zuschlag eingeht, oder soll die vollständige Arbeitszeit (mit NB) selbst Grundlage des Ist sein? Bei letzterer Variante wäre zusätzlich zu klären, ob ein Nachtbereitschaftszuschlag darüber hinaus addiert werden darf.
4. **Differenz:** Soll die Differenz unverändert als `Ist − Soll` gebildet werden, ohne weitere Rundung und mit der Bedeutung „positiv = über Soll, negativ = unter Soll“?
5. **Rollenbezug:** Sollen die Formeln für Soll, Ist und Differenz rollenunabhängig sein, während die sichtbare Soll-/Ist-Auswertung – entsprechend der bereits beschlossenen zeitbezogenen Oberfläche – nur Mitarbeiter mit der Rolle `Erzieher` im Monatsplan-Snapshot auflistet?
6. **Entwurfsstand:** Sollen Soll, Ist und Differenz während der Bearbeitung den aktuellen ungespeicherten Entwurf als Live-Vorschau abbilden, während verbindliche Ausgaben ausschließlich den gespeicherten Stand verwenden?
7. **Wochenarbeitszeit `0`:** Muss die Wochenarbeitszeit eines aktiven Mitarbeiters wie im Altsystem größer als `0` sein, oder darf sie im neuen Fachmodell `0` betragen und damit ein Monatssoll von `0` erzeugen?
8. **Unvollständige Monatsdaten:** Soll ein Monatsplan mit fehlenden oder doppelten Kalendertagen als ungültig abgelehnt werden, statt ein teilweise berechnetes Soll und Ist auszugeben? Dies würde die bereits verbindliche vollständige Monatsgrundlage technisch absichern.
9. **Farbkennzeichnung:** Soll lediglich ein exakter Ausgleich gegenüber jeder Abweichung hervorgehoben werden, oder sollen positive und negative Differenzen visuell voneinander unterschieden werden? Die bereits verbindliche Textdarstellung mit Vorzeichen bleibt davon unberührt.

### 12. Verständliche, pragmatische Empfehlung

1. **Soll direkt aus dem Plan-Snapshot berechnen.** Empfohlen ist `Soll = Arbeitstage × Wochenarbeitszeit / 5`. Die Arbeitstagszahl folgt der bereits festgelegten Kalenderregel, die Wochenarbeitszeit dem Mitarbeiter-Snapshot. Wegen der Teilbarkeit durch fünf ist keine Rundung nötig.
2. **Beide Zeitgutschriften in das Ist aufnehmen.** Empfohlen ist `Ist = monatliche reine Arbeitszeit + Nachtzuschlag + Nachtbereitschaftszuschlag`. Damit besitzt jede bereits ausdrücklich als Zeitgutschrift definierte Kennzahl eine nachvollziehbare Wirkung. Gegenüber dem Altsystem käme der dort folgenlose Nachtzuschlag hinzu.
3. **Arbeitszeit (mit NB) getrennt vom anrechenbaren Ist halten.** Die vollständige Nachtbereitschaft kann als eigene Dauer in Arbeitszeit (mit NB) sichtbar bleiben, während für das Ist nur der beschlossene 25-Prozent-Wert angerechnet wird. Dadurch wird die Nachtbereitschaft nicht unbemerkt vollständig und zusätzlich mit 25 Prozent doppelt berücksichtigt.
4. **Differenz unverändert als `Ist − Soll` bilden.** Alle Bestandteile sind bereits ganze Minuten; eine weitere Rundung ist weder nötig noch sinnvoll. Das Vorzeichen zeigt die Richtung der Abweichung eindeutig.
5. **Formeln rollenunabhängig, Oberfläche konsistent filtern.** Soll, Ist und Differenz sollten für jeden Mitarbeiter berechenbar sein. Die sichtbare zeitbezogene Auswertung kann wie bereits für Schritt 6 festgelegt anhand der im Monatsplan gespeicherten Rolle auf `Erzieher` begrenzt werden.
6. **Live-Vorschau und verbindlichen Stand sauber trennen.** Während der Bearbeitung sollten Eintragsänderungen Ist und Differenz sofort aktualisieren. Export, Druck oder Abschluss dürfen nur den gespeicherten Stand verwenden.
7. **Aktive Mitarbeiter weiterhin mit positiver Wochenarbeitszeit führen.** Ein Soll von `0` sollte nur durch eine ausdrücklich dafür vorgesehene fachliche Situation entstehen, nicht durch eine versehentlich fehlende Wochenarbeitszeit. Falls ein Nullstundenmodell benötigt wird, sollte es bewusst benannt werden.
8. **Unvollständige Monatsdaten ablehnen.** Die Berechnung sollte nicht still ein Soll aus allen Kalendertagen und ein Ist aus nur einem Teil davon kombinieren. Ein gültiger Monatsplan enthält jeden Kalendertag genau einmal.
9. **Farben nicht zur Rechenregel machen.** Fachlich entscheidend sind Wert, Vorzeichen und Nullfall. Ob positive und negative Abweichungen unterschiedliche Farben erhalten, kann als Oberflächengestaltung festgelegt werden; die Berechnungsdokumentation sollte keine konkrete Farbe vorschreiben.

### Status von Schritt 7

Die Quellcodeanalyse zu monatlicher Soll-Arbeitszeit, Ist-Arbeitszeit und Soll-/Ist-Differenz ist abgeschlossen. Untersucht wurden Eingaben, Formeln, Rollen- und Snapshot-Bezug, Rundungszeitpunkte, Darstellung, Entwurfsstand, Grenzfälle, die Folgewirkung beider Zuschläge und die vorhandenen Tests.

Schritt 7 ist damit **quellcodeanalytisch und fachlich abgeschlossen**. Die nachfolgend ausdrücklich bestätigten Entscheidungen sind verbindlich. Die konkrete visuelle Gestaltung der Differenz ist keine offene Berechnungsregel und wird bei der jeweiligen Oberfläche entschieden.

### Bereits verbindlich entschieden

Für die monatliche Soll-Arbeitszeit wurde festgelegt:

- Die Arbeitstagszahl wird vom System aus dem vollständigen Kalendermonat nach der bereits verbindlichen Kalenderregel berechnet und nicht vom Benutzer eingegeben.
- Ein kalendarischer Arbeitstag ist ein Montag bis Freitag, sofern er kein gesetzlicher Feiertag in Brandenburg ist.
- Die berechnete Arbeitstagszahl ist für alle Mitarbeiter desselben Monatsplans gleich. Planungseinträge, Urlaub, Krankheit, Rufbereitschaften, Beschäftigungsbeginn und persönliche Arbeitszeitverteilung verändern sie nicht.
- Die mitarbeiterabhängige Grundlage ist die im Mitarbeiter-Snapshot des Monatsplans gespeicherte Wochenarbeitszeit.
- Die Formel lautet: `Monatliche Soll-Arbeitszeit = berechnete kalendarische Arbeitstage × Wochenarbeitszeit aus dem Mitarbeiter-Snapshot / 5`.
- Wegen der verbindlichen Teilbarkeit der Wochenarbeitszeit durch fünf entsteht eine ganze Minutenzahl; eine Rundung ist nicht erforderlich.
- Spätere Änderungen am Mitarbeiter-Stammdatensatz verändern das Soll eines bestehenden Monatsplans nicht rückwirkend.

Damit wird die Soll-Grundformel des Altsystems übernommen, aber entsprechend dem neuen Snapshot-Modell auf die im Monatsplan gespeicherte Wochenarbeitszeit gestützt. Die im Altsystem vorsorglich ausgeführte Rundung entfällt im Zielmodell, weil sie bei gültigen Daten rechnerisch wirkungslos wäre. Diese Entscheidung wurde in `docs/Berechnungen/` übernommen.

Für die monatliche Ist-Arbeitszeit wurde festgelegt, die Formel des Altsystems unverändert zu übernehmen:

`Monatliche Ist-Arbeitszeit = monatliche reine Arbeitszeit + Nachtbereitschaftszuschlag`

- Die reine Arbeitszeit aller Planungseintrag-Snapshots des Mitarbeiters wird vollständig berücksichtigt.
- Von der Nachtbereitschaft fließt ausschließlich der bereits nach der Monatssumme gerundete Nachtbereitschaftszuschlag von `25 %` ein.
- Der Nachtzuschlag von `20 %` bleibt trotz seiner Einordnung als berechnete und angezeigte Zeitgutschrift für die Ist-Arbeitszeit ohne Folgewirkung.
- Die vollständige Nachtbereitschaft und die Arbeitszeit (mit NB) werden nicht als Grundlage des Ist verwendet.
- Nachtarbeit, Sonntags-/Feiertagszeit, Anwesenheitszeit, Rufbereitschaften und die tagesbezogenen Zähler werden nicht zusätzlich angerechnet.
- Nach der Addition der beiden bereits ganzzahligen Summanden findet keine weitere Rundung statt.
- Arbeitszeit (mit NB) bleibt eine separate Informationskennzahl.

Damit wurde die Empfehlung des Schritt-7-Analyseabschnitts, beide Zeitgutschriften in das Ist aufzunehmen, ausdrücklich verworfen. Verbindlich ist stattdessen die bisherige Formel des Altsystems. Diese Entscheidung wurde in `docs/Berechnungen/` übernommen.

Für die monatliche Soll-/Ist-Differenz wurde festgelegt:

`Soll-/Ist-Differenz = monatliche Ist-Arbeitszeit − monatliche Soll-Arbeitszeit`

- Ein positives Ergebnis bedeutet eine Ist-Arbeitszeit oberhalb des Solls.
- Ein negatives Ergebnis bedeutet, dass die Soll-Arbeitszeit noch nicht erreicht ist.
- `0` Minuten bedeuten einen exakten Ausgleich.
- Da Soll und Ist bereits ganze Minutenwerte sind, findet keine weitere Rundung statt.
- Die bereits in Schritt 2 verbindlich festgelegte Darstellung bleibt bestehen: positive Werte erhalten ein Pluszeichen, negative ein Minuszeichen und der exakte Ausgleich wird als `00:00` ohne Vorzeichen angezeigt.

Damit werden Formel und Vorzeichenrichtung des Altsystems übernommen; ausschließlich dessen abweichende Nulldarstellung `0:00` bleibt wie bereits entschieden verworfen. Diese Entscheidung wurde in `docs/Berechnungen/` übernommen.

Für den Rollenbezug der globalen Berechnungsformeln wurde festgelegt:

- Globale Berechnungsformeln sollen grundsätzlich rollenunabhängig sein und für jeden Mitarbeiter des Monatsplans ausgeführt werden können.
- Dies gilt ausdrücklich auch für Soll-Arbeitszeit, Ist-Arbeitszeit und Soll-/Ist-Differenz.
- Eine Rollenprüfung ist kein Bestandteil dieser Formeln.
- Erst die jeweilige Oberfläche entscheidet als eigene Darstellungsregel, welche Mitarbeiter und welche berechneten Kennzahlen sie anzeigt.
- Die bereits festgelegte zeitbezogene Auswertung darf deshalb auf Mitarbeiter mit der im Monatsplan-Snapshot gespeicherten Rolle `Erzieher` filtern, ohne die zugrunde liegenden Formeln rollenabhängig zu machen.
- Welche konkrete Seite oder Tabelle Soll, Ist und Differenz später zeigt, wird bei der betreffenden Oberflächenfunktion entschieden und ist keine offene Berechnungsregel.
- Rollenabhängige Fachprüfungen bleiben möglich, wenn sie ausdrücklich beschlossen wurden. Die Beschränkung der Rufbereitschaft auf Erzieher ist eine solche Zulässigkeitsregel, aber kein Gegenbeispiel zur Rollenunabhängigkeit der allgemeinen Monatsformeln.

Diese Entscheidung wurde in `docs/Berechnungen/` übernommen.

Für den Berechnungsstand von Soll-Arbeitszeit, Ist-Arbeitszeit und Differenz wurde festgelegt:

- Die bereits für andere Kennzahlen geltende Live-Vorschau wird auf sämtliche zeitbezogenen Monatskennzahlen sowie Soll, Ist und Differenz angewendet.
- Noch nicht gespeicherte Änderungen an Planungseinträgen aktualisieren die betroffenen Monatssummen, Zuschläge, die Ist-Arbeitszeit und die Soll-/Ist-Differenz unmittelbar.
- Die Soll-Arbeitszeit bleibt bei reinen Eintragsänderungen unverändert, weil sie nur von der systemseitig berechneten Arbeitstagszahl und der Wochenarbeitszeit des Mitarbeiter-Snapshots abhängt.
- Die während der Bearbeitung angezeigten Werte beschreiben den aktuellen Planentwurf.
- Verbindliche Ausgaben, insbesondere Export, Druck oder ein als abgeschlossen behandelter Monatsplan, dürfen ausschließlich den gespeicherten Stand verwenden.
- Ein Entwurf mit ungespeicherten Änderungen muss vor einer verbindlichen Ausgabe gespeichert werden; Entwurfsstand und gespeicherter Stand müssen erkennbar unterscheidbar sein.

Diese Entscheidung wurde in `docs/Berechnungen/` übernommen.

Für eine Wochenarbeitszeit von `0:00` wurde festgelegt:

- Der Wert `0:00` ist zulässig; die Einschränkung des Altsystems auf eine positive Wochenarbeitszeit wird nicht übernommen.
- `0` Minuten erfüllen die verbindliche Teilbarkeit durch fünf.
- Bei der Berechnungsart `Wochenarbeitszeit` entsteht ein Tageswert von `0` Minuten.
- Die monatliche Soll-Arbeitszeit beträgt bei einer Wochenarbeitszeit von `0:00` unabhängig von der berechneten Arbeitstagszahl ebenfalls `0` Minuten.
- Feste Planungseinträge mit positiver reiner Arbeitszeit dürfen weiterhin ein positives Ist erzeugen. Die Differenz entspricht dann der Ist-Arbeitszeit.
- Aus einer Wochenarbeitszeit von `0:00` werden weder Rolle noch Beschäftigungsstatus oder Aktivierung eines Mitarbeiters abgeleitet.

Die positive Mindestgrenze des Altsystems war für die Rechenformeln nicht erforderlich und wird deshalb nicht als zusätzliche Fachregel in das Zielmodell übernommen. Diese Entscheidung wurde in `docs/Berechnungen/` übernommen.

Für fehlende oder doppelte Plantage wurde nach Abgleich mit dem Altsystem festgelegt:

- Wie im Altsystem erzeugt die Anwendung beim regulären Anlegen eines Monatsplans automatisch für jeden Kalendertag des ausgewählten Monats genau einen Plantag.
- Im normalen Bedienweg entsteht dadurch ein vollständiger Monatsplan ohne doppelte Datumswerte.
- Das Altsystem prüft die Vollständigkeit beim Laden oder Auswerten nicht erneut und lehnt einen abweichenden Plan nicht ausdrücklich als ungültig ab.
- Das neue Fachmodell führt ebenfalls keine zusätzliche Regel ein, nach der fehlende oder doppelte Plantage zwingend zur Ablehnung des gesamten Monatsplans führen.
- Das zufällige technische Verhalten des Altsystems bei doppelten Datumswerten wird nicht als gewünschte Fachregel übernommen.
- Der Umgang mit beschädigten oder manuell veränderten gespeicherten Daten wird als technische Robustheitsfrage behandelt und verändert die regulären Berechnungsformeln nicht.

Diese Entscheidung wurde in `docs/Berechnungen/` übernommen.

Die im Analyseabschnitt genannte Farbkennzeichnung ist keine Berechnungsregel. Wert, Vorzeichen und Nulldarstellung der Differenz sind bereits verbindlich festgelegt; konkrete Farben oder andere visuelle Hervorhebungen werden bei der Gestaltung der jeweiligen Oberfläche entschieden.

## Bewusst ausgeschlossene Fundstellen

Nicht als fachliche Berechnungen eingestuft wurden insbesondere:

- Erzeugung und Fortschreibung technischer Datenbank-IDs,
- Berechnung von Datenbankschema-Versionen,
- Bildschirm- und Spaltenmaße,
- Auswahl des angezeigten Jahresbereichs,
- Tastaturnavigation in Auswahlelementen,
- technische Schlüssel für Planungszellen,
- Vergleich von Bearbeitungsstand und gespeichertem Stand.

## Bearbeitungsplan

| Schritt | Inhalt | Status |
| --- | --- | --- |
| 1 | Quellcodebestand und Berechnungsbereiche erfassen | abgeschlossen |
| 2 | Zeitbasis, Zeitformate und Rundung fachlich prüfen | abgeschlossen |
| 3 | Kalender, Feiertage und Arbeitstage fachlich prüfen | abgeschlossen |
| 4 | Berechnungsarten und Snapshot-Verhalten fachlich prüfen | abgeschlossen |
| 5 | Tagesbezogene Zählungen fachlich prüfen | abgeschlossen |
| 6 | Zeitbezogene Summen und Zuschläge fachlich prüfen | abgeschlossen |
| 7 | Soll-, Ist- und Differenzberechnung fachlich prüfen | abgeschlossen |
| 8 | Gesamtprüfung und Bereinigung der temporären Notizen | abgeschlossen |

## Abschlussstand der Berechnungsanalyse

- Die Schritte 1 bis 8 sind abgeschlossen.
- Es bestehen keine offenen fachlichen Berechnungsentscheidungen.
- Technische Datenmodell- und Oberflächenentscheidungen werden in den jeweils zuständigen Umsetzungsabschnitten behandelt, ohne die verbindlichen Formeln zu verändern.

## Ergebnis von Schritt 8: Gesamtprüfung

### Prüfgrundlage und Einordnung

Für die Gesamtprüfung wurden `docs/Berechnungen/`, dieses Analyseprotokoll und `docs/temp/Sitzungsuebergabe-Berechnungen.md` vollständig gelesen und miteinander abgeglichen. Geprüft wurden insbesondere die Rechenkette, Minutenbasis und Rundungszeitpunkte, Kalender- und Tageszuordnung, Planungseintrag- und Mitarbeiter-Snapshots, Rollenbezug, Entwurfsstand sowie die Trennung zwischen verbindlichem Zielmodell und historischem Altbefund.

Der alte Quellcode musste für Schritt 8 nicht erneut geöffnet werden. Die für den Abgleich benötigten Altbefunde sind in den vollständig gelesenen Analyseabschnitten mit Quellstellen dokumentiert; keiner der nachfolgenden Befunde hängt von einer neuen oder strittigen Interpretation des Altsystems ab.

Die Befunde werden wie folgt klassifiziert:

- **(a) echter fachlicher Widerspruch:** Zwei verbindliche Regeln verlangen unterschiedliche fachliche Ergebnisse.
- **(b) fehlende Entscheidung:** Eine für ein eindeutiges Berechnungsergebnis notwendige Regel wurde noch nicht festgelegt.
- **(c) redaktionelle Unklarheit oder Wiederholung:** Das Zielergebnis ist entschieden, aber Formulierung, Statusverweis oder Zusammenfassung kann missverstanden werden.
- **(d) bewusst akzeptierte Prototypgrenze:** Eine fachliche Vereinfachung oder technische Robustheitsgrenze wurde ausdrücklich angenommen und ist deshalb kein unbeabsichtigtes Loch im Regelwerk.

### Gesamturteil

Die verbindliche Rechenkette aus den Schritten 1 bis 7 ist **fachlich widerspruchsfrei und vollständig berechenbar**:

1. Alle gespeicherten Dauern und die relevanten Ausgangswerte liegen als nichtnegative ganze Minuten vor.
2. Je Planungseintrag gilt `Arbeitszeit (mit NB) = reine Arbeitszeit + Nachtbereitschaft`.
3. Einfache Monatssummen addieren die unveränderten Snapshot-Minuten; ausschließlich die beiden prozentualen Zuschläge werden einmal nach der jeweiligen vollständigen Monatssumme gerundet.
4. Das Soll verwendet die systemseitig berechneten kalendarischen Arbeitstage und die durch fünf teilbare Wochenarbeitszeit aus dem Mitarbeiter-Snapshot.
5. Das Ist verwendet entsprechend der bestätigten Altformel ausschließlich die monatliche reine Arbeitszeit und den Nachtbereitschaftszuschlag.
6. Die Differenz wird ohne weitere Rundung als `Ist − Soll` gebildet.
7. Planungseintrag- und Mitarbeiter-Snapshots verhindern rückwirkende Änderungen durch spätere Stammdatenänderungen.
8. Die globalen Formeln bleiben rollenunabhängig; Rollenfilter einer Oberfläche und die ausdrückliche Zulässigkeitsregel der Rufbereitschaft sind davon getrennt.
9. Der aktuelle Entwurf darf eine Live-Vorschau erzeugen; verbindliche Ausgaben beruhen auf dem gespeicherten Stand.

Es wurde **kein Befund der Kategorie (a)** gefunden. Ebenso fehlt **keine fachliche Entscheidung der Kategorie (b), die vor dem Abschluss der Berechnungsregeln zwingend nachgeholt werden müsste**. Die gefundenen Punkte betreffen überwiegend die redaktionelle Bereinigung bereits entschiedener Regeln.

### Priorisierte Befunde und Korrekturvorschläge

#### Priorität 1 — veraltete Verweise auf den noch offenen Schritt 7 — erledigt

**Kategorie: (c) redaktionelle Unklarheit.**

- In den Abschnitten `Nachtzuschlag` und `Nachtbereitschaftszuschlag` von `docs/Berechnungen/` stand noch, die Wirkung des jeweiligen Zuschlags auf das Ist werde erst in Schritt 7 festgelegt.
- Entsprechende historische Formulierungen stehen in diesem Protokoll unter anderem bei den bisherigen Zeilen 978, 1009, 1062 bis 1075 und 1085.
- In `docs/temp/Sitzungsuebergabe-Berechnungen.md` wurde die Einbeziehung beider Zuschläge ebenfalls noch als Schritt 7 vorbehalten bezeichnet, obwohl dieselbe Übergabe bereits die endgültige Ist-Formel nannte.

Die endgültige Regel ist an allen Stellen eindeutig: Der Nachtzuschlag von `20 %` wird berechnet und angezeigt, fließt aber nicht in das Ist ein. Der Nachtbereitschaftszuschlag von `25 %` fließt in das Ist ein. In der verbindlichen Datei und der Übergabe sollten die alten Zukunftsverweise durch diese abschließende Aussage ersetzt werden. Im chronologischen Analyseprotokoll können die früheren Aussagen als damaliger Zwischenstand bestehen bleiben, sollten aber mit einem kurzen Hinweis „in Schritt 7 aufgelöst“ versehen werden.

Diese Korrektur verändert keine Formel und benötigt keine neue Fachentscheidung.

#### Priorität 1 — missverständlicher Begriff „insgesamt angerechnete Arbeitszeit“ — erledigt

**Kategorie: (c) redaktionelle Unklarheit.**

Im Begriffsabschnitt von `docs/Berechnungen/` wurde Arbeitszeit (mit NB) als „insgesamt angerechnete Arbeitszeit einschließlich Nachtbereitschaft“ beschrieben. Das Wort „angerechnet“ konnte fälschlich nahelegen, diese vollständige Größe gehe in die Ist-Arbeitszeit ein. Die verbindliche Ist-Regel schließt dies ausdrücklich aus.

Umgesetzte neutrale Definition:

> **Arbeitszeit (mit NB)** bezeichnet die Summe aus reiner Arbeitszeit und vollständiger Nachtbereitschaft. Sie ist eine eigene Informationskennzahl und nicht mit der monatlichen Ist-Arbeitszeit gleichzusetzen.

Auch dies ist keine Änderung der bereits bestätigten Fachlogik.

#### Priorität 1 — „pro Arbeitstag“ in der Sitzungsübergabe ist zu eng — erledigt

**Kategorie: (c) redaktionelle Abweichung zwischen den Dateien.**

Die Sitzungsübergabe leitete die Feldbelegung der Berechnungsart `Wochenarbeitszeit` mit „pro Arbeitstag“ ein. Nach den verbindlichen Kalender-, Berechnungsart- und Rollenregeln können Wochenenden und Feiertage beplant und beide Berechnungsarten rollenunabhängig verwendet werden. Der Tageswert entsteht beim Setzen eines passenden Planungseintrags und nicht nur an einem kalendarischen Arbeitstag.

Umgesetzte Formulierung:

> Bei jedem gesetzten Planungseintrag der Berechnungsart `Wochenarbeitszeit` gilt unabhängig vom Kalendertag: …

Die verbindliche Datei ist an dieser Stelle bereits richtig; nur die Übergabe sollte korrigiert werden.

#### Priorität 2 — Bezeichnungen der Berechnungsarten laufen auseinander — erledigt

**Kategorie: (c) redaktionelle Unklarheit.**

Die verbindlichen Namen lauten in `docs/Berechnungen/` **`Feste Zeitwerte`** und **`Wochenarbeitszeit`**. Die Übergabe nannte dagegen „Fest“ und „Wöchentlich“. Für spätere Datenmodelle, Oberflächen und Tests werden nun überall die verbindlichen Namen verwendet.

#### Priorität 2 — Rollenfilter ist fachlich richtig, aber sprachlich unnötig schwer abzugrenzen — erledigt

**Kategorie: (c) redaktionelle Unklarheit, kein Rollenwiderspruch.**

Der Rollenabschnitt in `docs/Berechnungen/` enthält gleichzeitig zwei richtige Regeln: Alle globalen Zeit-, Soll-, Ist- und Differenzformeln sind rollenunabhängig; eine vorgesehene zeitbezogene Oberfläche listet nur Mitarbeiter mit der Snapshot-Rolle `Erzieher`. Die wechselnden Formulierungen „die zeitbezogene Auswertung“, „diese Oberfläche“ und „eine konkrete Seite“ erschwerten jedoch die Abgrenzung.

Umgesetzt wurde die Trennung in zwei klar benannte Absätze:

1. **Berechnungsregel:** Formeln enthalten keinen Rollenfilter und sind für jeden Mitarbeiter anwendbar.
2. **Darstellungsregel:** Die fachlich vorgesehene zeitbezogene Auswertung filtert auf `Erzieher`; andere Oberflächen entscheiden ihren Auswertungskreis ausdrücklich bei ihrer eigenen Spezifikation.

Die bereits beschlossene Rufbereitschaftsregel bleibt eine eigenständige Zulässigkeitsprüfung. Eine erneute Nutzerentscheidung ist dafür nicht nötig.

#### Priorität 2 — Speicherung des abgeleiteten Werts kann präziser beschrieben werden — erledigt

**Kategorie: (c) redaktionell-technische Unklarheit, keine fehlende Berechnungsentscheidung.**

`docs/Berechnungen/` legt fest, dass Arbeitszeit (mit NB) im Planungseintrag-Snapshot gespeichert wird. Die Konsistenzprüfung begann dagegen bedingt mit „Enthält … einen Wert“. Dadurch blieb sprachlich offen, ob ein Snapshot ohne dieses verbindlich vorgesehene Feld zulässig wäre.

Für die fachliche Berechnung ist das Ergebnis trotzdem eindeutig, weil der Wert immer aus reiner Arbeitszeit und Nachtbereitschaft berechnet werden kann. Für den Planungseintrag-Snapshot wurde deshalb ausdrücklich festgehalten, dass der abgeleitete Wert vorhanden sein muss und exakt der Summe entspricht. Ob eine Eintragsdefinition denselben abgeleiteten Wert zusätzlich dauerhaft speichert oder für ihre schreibgeschützte Anzeige jeweils neu berechnet, ist eine technische Datenmodellentscheidung; in beiden Fällen muss die Formel gelten.

Vor Abschluss der Berechnungsregeln ist hierzu keine weitere Fachentscheidung erforderlich. Vor der Implementierung des Speicherschemas sollte die technische Variante jedoch eindeutig festgelegt werden.

#### Priorität 2 — es fehlt ein durchgängiges Zahlenbeispiel für die vollständige Rechenkette — erledigt

**Kategorie: (c) redaktionelle Ergänzung.**

Die Einzelregeln enthielten bereits Beispiele, aber zunächst noch kein gemeinsames Monatsbeispiel, das reine Arbeitszeit, Nachtbereitschaft, Nachtarbeit, beide Zuschläge, Soll, Ist und Differenz zusammenführt. Ein solches Beispiel sichert insbesondere sichtbar ab, dass der Nachtzuschlag trotz seiner Berechnung nicht zum Ist addiert wird und dass nur der Nachtbereitschaftszuschlag einmal monatlich gerundet einfließt.

Umgesetzt wurde ein vollständiges Beispiel mit nicht ganzzahligen Zuschlags-Zwischenergebnissen. Das Beispiel wendet lediglich die bereits beschlossenen Formeln an und benötigte deshalb keine neue Fachentscheidung.

#### Priorität 3 — Statusangaben müssen nach Abschluss von Schritt 8 nachgezogen werden — erledigt

**Kategorie: (c) redaktionelle Wiederholung beziehungsweise veralteter Arbeitsstand.**

- `docs/Berechnungen/` führte Schritt 8 noch als offen.
- Dieses Protokoll führte Schritt 8 ebenfalls als offen und als nächsten Schritt.
- `docs/temp/Sitzungsuebergabe-Berechnungen.md` bezeichnete Schritt 8 noch als nächsten Schritt.

Diese Angaben waren vor der vorliegenden Prüfung korrekt. Nach der gemeinsamen Bestätigung der redaktionellen Korrekturen wurden alle drei Statusstellen auf „abgeschlossen“ gesetzt und die Übergabe auf den aktuellen Arbeitsstand gebracht.

### Bewusst akzeptierte Grenzen ohne erneuten Entscheidungsbedarf

Die folgenden Punkte sind **Kategorie (d)**. Sie bleiben auffällig, sind aber durch ausdrückliche Entscheidungen gedeckt und dürfen in einer späteren Umsetzung nicht versehentlich als bereits gelöst dargestellt werden:

- SN/F-Dienste und freie Tage werden im Prototyp anhand der exakten Snapshot-Kürzel `SN/F`, `SN` und `/` erkannt. Frei angelegte abweichende Kürzel oder vollständige kalendertagübergreifende Dienstfolgen werden nicht semantisch erkannt.
- Für die gemeinsame Sonntags-/Feiertagskennzahl zählt jeder positive Wert der reinen Arbeitszeit, ohne zwischen tatsächlichem Dienst, Urlaub, Krankheit oder Frei zu unterscheiden.
- Planungseinträge werden auch bei Uhrzeiten über Mitternacht nicht auf mehrere Kalendertage aufgeteilt; alle Zeitwerte gehören zum Datum der Planungszelle.
- Zwischen Anwesenheitszeit und Arbeitszeit (mit NB) sowie zwischen Nachtarbeit und reiner Arbeitszeit gelten bewusst keine Größen- oder Plausibilitätsbeziehungen.
- Ein Mitarbeiter darf am selben Tag zugleich einen normalen Planungseintrag, ausdrücklich auch `/`, und eine Rufbereitschaft besitzen.
- Eine Wochenarbeitszeit von `0:00` ist zulässig und erzeugt ein Soll von `0` Minuten.
- Der reguläre Anlageweg erzeugt jeden Plantag genau einmal. Fehlende oder doppelte Datumswerte beschädigter beziehungsweise manuell veränderter Daten führen aber nicht aufgrund einer zusätzlichen fachlichen Regel zur Ablehnung; ihre Behandlung bleibt technische Robustheitsarbeit.
- Das Zielmodell setzt eindeutig prüfbare Rollen voraus. Dass die Rolle im aktuellen Anwendungscode noch frei eingegeben werden kann, ist eine bekannte ausstehende technische Umsetzung und kein offener Punkt der Formeln.
- Der Nachtzuschlag ist eine separat berechnete und angezeigte Zeitgutschrift, besitzt nach der ausdrücklich bestätigten Altformel aber keine Folgewirkung auf die Ist-Arbeitszeit.

### Prüfung der Einheiten, Rundungen und Grenzwerte

- Tageszähler sind ganzzahlige Anzahlen; Zeitwerte und Zuschläge sind Minuten. In den verbindlichen Regeln werden beide Einheiten nicht miteinander verrechnet.
- Die Division der Wochenarbeitszeit durch fünf bleibt wegen der Teilbarkeitsregel ganzzahlig. Das Soll benötigt daher keine Rundung.
- Nachtzuschlag und Nachtbereitschaftszuschlag werden jeweils erst aus ihrer vollständigen Monatssumme gebildet und danach genau einmal gerundet.
- Ist und Differenz addieren beziehungsweise subtrahieren bereits ganzzahlige Minuten und werden nicht erneut gerundet.
- Negative Werte entstehen ausschließlich bei der Differenz; die allgemeine Rundungsregel muss deshalb keine negativen Zuschlags- oder Dauerwerte behandeln.
- Für Stundenfelder bestehen weiterhin keine allgemeinen fachlichen Obergrenzen. Das ist in `docs/Berechnungen/01-Zeitbasis-und-Rundung.md` ausdrücklich so abgegrenzt. Technische sichere Zahlenbereiche und feldbezogene Maximalwerte sind bei der späteren Validierung zu bestimmen, verändern aber die dokumentierten Formeln nicht.

### Entscheidung zum fachlichen Abschluss

**Keine neue Berechnungsentscheidung.** Die Gesamtprüfung hat keine konkurrierenden Formeln und keinen fehlenden Grenzfall gefunden, der das Ergebnis einer regulären Berechnung uneindeutig macht.

Der Benutzer hat bestätigt, dass die vorgeschlagenen redaktionellen Klarstellungen ohne fachliche Änderung in `docs/Berechnungen/` und die Sitzungsübergabe übernommen werden dürfen. Die technische Entscheidung, ob Arbeitszeit (mit NB) zusätzlich in einer Eintragsdefinition gespeichert oder dort nur für die Anzeige berechnet wird, kann vor der Implementierung des Datenmodells getroffen werden; im Planungseintrag-Snapshot und in allen Berechnungen bleibt die verbindliche Summe unverändert.

### Umgesetzter Abschluss von Schritt 8

1. Die veralteten Schritt-7-Verweise wurden durch die endgültige Zuschlagswirkung ersetzt.
2. Arbeitszeit (mit NB) wurde neutral als Summe und separate Informationskennzahl beschrieben.
3. Die abweichenden Begriffe und „pro Arbeitstag“ wurden in der Sitzungsübergabe korrigiert.
4. Rollenberechnung und Rollenfilter wurden sprachlich in zwei Ebenen getrennt.
5. Die Snapshot-Pflicht des abgeleiteten Werts wurde eindeutig formuliert und ein vollständiges Zahlenbeispiel ergänzt.
6. Die Statusangaben von Schritt 8 wurden in allen drei Dokumenten auf abgeschlossen gesetzt.

Die bestätigten Korrekturen wurden in die verbindliche Datei und die Sitzungsübergabe eingearbeitet. Es wurde dabei keine fachliche Formel verändert.
