# Projektdokumentation

Dieser Ordner ist der Einstiegspunkt in die Dokumentation des Dienstplaners.
Die README dient ausschließlich als Wegweiser und beschreibt, wo welche Art
von Information zu finden ist. Fachliche oder technische Details werden in
den jeweils zuständigen Dokumenten festgehalten.

## Verhältnis zwischen Quellcode und Dokumentation

- Der Quellcode beantwortet, was die Anwendung aktuell tatsächlich umsetzt.
- Die Dokumentation beantwortet, was die Anwendung fachlich tun soll und warum.
  Sie beschreibt dazu fachliche Regeln, projektspezifischen Kontext, geplantes
  Verhalten und wichtige übergreifende Entscheidungen.
- Ein dokumentiertes Zielverhalten ist allein kein Nachweis dafür, dass es
  bereits umgesetzt wurde.
- Technische Einzelheiten, die unmittelbar und verständlich aus dem Quellcode
  hervorgehen, werden nicht zusätzlich in der Dokumentation gepflegt.
- Widersprüche zwischen Quellcode und Dokumentation werden ausdrücklich
  geklärt und nicht stillschweigend aufgelöst.

## Aufbau

| Bereich         | Enthaltene Informationen                                        | Nicht enthalten                                           |
| --------------- | --------------------------------------------------------------- | --------------------------------------------------------- |
| `projekt/`      | Zielbild, Projektumfang und dauerhafte Rahmenbedingungen        | Arbeitsstand einzelner Features                           |
| `fachlichkeit/` | Fachliches Datenmodell und verbindliche Berechnungsregeln       | Oberflächenabläufe und technische Umsetzung               |
| `features/`     | Fachlicher Zweck und gewünschtes Verhalten einzelner Funktionen | Fortschritt, Reihenfolge und technische Detailpläne       |
| `architektur/`  | Dauerhafte technische Entscheidungen und Verantwortungsgrenzen  | Quellcodeinventare und kurzlebige Implementierungsdetails |
| `oberflaeche/`  | Übergreifende Gestaltungs- und Bediengrundsätze                 | Wiederholungen einzelner Feature-Abläufe                  |
| `qualitaet/`    | Teststrategie und projektweite Qualitätsgrundsätze              | Momentane Testergebnisse und Testzahlen                   |
| `planung/`      | Aktueller Stand, Prioritäten und Reihenfolge der Arbeitspakete  | Fachliche Regeln und ausformulierte Feature-Inhalte       |
| `referenzen/`   | Nicht verbindliche Untersuchungen fremder oder älterer Systeme  | Anforderungen und Entscheidungen des aktuellen Projekts   |
| `README.md`     | Wegweiser und Zuständigkeiten der Dokumentation                 | Fachliche oder technische Projektinformationen            |

## Einstiegspunkte

- [Zielbild und Rahmenbedingungen](./projekt/zielbild-und-rahmenbedingungen.md)
- [Roadmap](./planung/roadmap.md)

### Fachlichkeit

- [Fachliches Datenmodell](./fachlichkeit/datenmodell.md)
- Berechnungen:
  - [Zeitbasis und Rundung](./fachlichkeit/berechnungen/zeitbasis-und-rundung.md)
  - [Kalender und Arbeitstage](./fachlichkeit/berechnungen/kalender-und-arbeitstage.md)
  - [Berechnungen von Planungseinträgen](./fachlichkeit/berechnungen/planungseintraege.md)
  - [Tagesbezogene Kennzahlen](./fachlichkeit/berechnungen/tageskennzahlen.md)
  - [Zeitbezogene Monatskennzahlen](./fachlichkeit/berechnungen/monatskennzahlen.md)
  - [Soll-Ist-Auswertung](./fachlichkeit/berechnungen/soll-ist-auswertung.md)

### Features

- [Teamverwaltung](./features/teamverwaltung.md)
- [Planungseinträge](./features/planungseintraege.md)
- [Planungsseite](./features/planungsseite.md)
- [Auswertung](./features/auswertung.md)
- [Kompaktansicht](./features/kompaktansicht.md)
- [PDF-Export](./features/pdf-export.md)

### Technik, Oberfläche und Qualität

- [Datenhaltung](./architektur/datenhaltung.md)
- [Gestaltungsgrundsätze](./oberflaeche/gestaltungsgrundsaetze.md)
- [Teststrategie](./qualitaet/teststrategie.md)

## Pflegegrundsätze

- Jede Information besitzt einen maßgeblichen Hauptablageort.
- Andere Dokumente dürfen sie zum Verständnis knapp einordnen und verweisen
  für die vollständige Regel auf diesen Hauptablageort.
- Nicht als offen gekennzeichnete Aussagen in Fach- und Feature-Dokumenten
  beschreiben das abgestimmte Zielverhalten. Ob dieses Verhalten bereits
  umgesetzt ist, ergibt sich aus Quellcode und Roadmap.
- Implementierungsstand, Prioritäten und Reihenfolge werden ausschließlich in
  der Roadmap gepflegt.
- Feature-Dokumente beschreiben Zweck, gewünschtes Verhalten, Grenzen und noch
  offene fachliche Entscheidungen, aber keinen Umsetzungsfortschritt.
- Technische Schnittstellen, konkrete Schemas und der tatsächlich umgesetzte
  Ablauf bleiben im Quellcode, sofern keine übergreifende Entscheidung erklärt
  werden muss.
- Kurzlebige Aufgabenlisten, Sitzungsübergaben und Arbeitsnotizen sind keine
  dauerhafte Projektdokumentation.
- Vergangene Entscheidungen werden nur dokumentiert, wenn ihre Begründung für
  das heutige Verhalten weiterhin notwendig ist.

## Migrationsarchiv

Der Ordner `docs-alt/` außerhalb dieser Dokumentation enthält den Stand vor der
laufenden Dokumentationsmigration. Er ist kein Bestandteil der aktuellen
Projektdokumentation und keine verbindliche Quelle für Implementierungen. Er
wird nur für den Abschluss der Migration herangezogen und ansonsten nicht
gelesen.
