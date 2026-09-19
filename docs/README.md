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

| Bereich                  | Enthaltene Informationen                                        | Nicht enthalten                                           |
| ------------------------ | --------------------------------------------------------------- | --------------------------------------------------------- |
| `projekt/`               | Zielbild, Projektumfang und dauerhafte Rahmenbedingungen        | Arbeitsstand einzelner Features                           |
| `fachlichkeit/`          | Fachliches Datenmodell und verbindliche Berechnungsregeln       | Oberflächenabläufe und technische Umsetzung               |
| `features/`              | Fachlicher Zweck und gewünschtes Verhalten einzelner Funktionen | Fortschritt, Reihenfolge und technische Detailpläne       |
| `architektur/`           | Dauerhafte technische Entscheidungen und Verantwortungsgrenzen  | Quellcodeinventare und kurzlebige Implementierungsdetails |
| `oberflaeche/`           | Übergreifende Gestaltungs- und Bediengrundsätze                 | Wiederholungen einzelner Feature-Abläufe                  |
| `qualitaet/`             | Teststrategie und projektweite Qualitätsgrundsätze              | Momentane Testergebnisse und Testzahlen                   |
| `planung/`               | Aktueller Stand, Prioritäten und Reihenfolge der Arbeitspakete  | Fachliche Regeln und ausformulierte Feature-Inhalte       |
| `planung/zukunft/`       | Bewusst zurückgestellte, bereits konkretisierte Vorhaben        | Aktueller Projektstatus und lose Ideensammlungen          |
| `planung/abgeschlossen/` | Historische Umsetzungspläne und Entscheidungsnachweise          | Aktueller Projektstatus und dauerhaftes Zielverhalten     |
| `referenzen/`            | Nicht verbindliche Untersuchungen fremder oder älterer Systeme  | Anforderungen und Entscheidungen des aktuellen Projekts   |
| `README.md`              | Wegweiser und Zuständigkeiten der Dokumentation                 | Fachliche oder technische Projektinformationen            |

## Einstiegspunkte

- [Zielbild und Rahmenbedingungen](./projekt/zielbild-und-rahmenbedingungen.md)
- [Lizenzierung](./projekt/lizenzierung.md)
- [Release-Vorlagen](../release/README.md)
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

### Planung

- Aktueller Stand:
  - [Roadmap](./planung/roadmap.md)
  - [Auslieferung](./planung/auslieferung.md)
  - [Gesamtprüfung: Dokumentationsabgleich](./planung/gesamtpruefung-dokumentationsabgleich.md)
- Zukunftsvorhaben:
  - [Hinweise zu Zukunftsvorhaben](./planung/zukunft/README.md)
  - [Umsetzungsplan proprietäre Lizenzierung](./planung/zukunft/umsetzungsplan-proprietaere-lizenzierung.md)
- Abgeschlossene Planung:
  - [Hinweise zu abgeschlossenen Plänen](./planung/abgeschlossen/README.md)
  - [Abstimmung Kompaktansicht](./planung/abgeschlossen/abstimmung-kompaktansicht.md)
  - [Umsetzungsplan Kompaktansicht](./planung/abgeschlossen/umsetzungsplan-kompaktansicht.md)
  - [Umsetzungsplan Auswertungsdialog](./planung/abgeschlossen/umsetzungsplan-auswertungsdialog.md)
  - [Abstimmung PDF-Export](./planung/abgeschlossen/abstimmung-pdf-export.md)
  - [Umsetzungsplan PDF-Export](./planung/abgeschlossen/umsetzungsplan-pdf-export.md)
  - [Umsetzungsplan Planungsseite](./planung/abgeschlossen/umsetzungsplan-planungsseite.md)

## Pflegegrundsätze

- Jede Information besitzt einen maßgeblichen Hauptablageort.
- Andere Dokumente dürfen sie zum Verständnis knapp einordnen und verweisen
  für die vollständige Regel auf diesen Hauptablageort.
- Nicht als offen gekennzeichnete Aussagen in Fach- und Feature-Dokumenten
  beschreiben das abgestimmte Zielverhalten. Ob dieses Verhalten bereits
  umgesetzt ist, ergibt sich aus Quellcode und Roadmap.
- Implementierungsstand, Prioritäten und Reihenfolge werden ausschließlich in
  der Roadmap gepflegt.
- Planungsdokumente erhalten in ihrem Statusabschnitt die für ihren
  Lebenszyklus geeigneten Angaben. Dazu gehören mindestens der Status und,
  soweit verlässlich bekannt, Datum, Uhrzeit, Zeitzone und zugehöriger Commit
  der Erstellung, Einordnung oder des Abschlusses. Nicht belegbare Zeitpunkte
  werden nicht nachträglich geschätzt.
- Ein Dokument unter `planung/zukunft/` beschreibt ein bewusst
  zurückgestelltes Vorhaben. Die Einordnung löst darin genannte
  Voraussetzungen nicht auf und ist keine Zusage für einen Umsetzungstermin.
- Ein Dokument unter `planung/abgeschlossen/` bleibt als historischer
  Entscheidungs- oder Abschlussnachweis erhalten. Gegenwartsformulierungen,
  frühere Ausgangslagen und Checklisten darin sind keine konkurrierende
  Statusquelle; maßgeblich sind Roadmap, Quellcode sowie die zuständigen Fach-
  und Feature-Dokumente.
- Feature-Dokumente beschreiben Zweck, gewünschtes Verhalten, Grenzen und noch
  offene fachliche Entscheidungen, aber keinen Umsetzungsfortschritt.
- Technische Schnittstellen, konkrete Schemas und der tatsächlich umgesetzte
  Ablauf bleiben im Quellcode, sofern keine übergreifende Entscheidung erklärt
  werden muss.
- Kurzlebige Aufgabenlisten, Sitzungsübergaben und Arbeitsnotizen sind keine
  dauerhafte Projektdokumentation.
- Vergangene Entscheidungen werden nur dokumentiert, wenn ihre Begründung für
  das heutige Verhalten weiterhin notwendig ist.
