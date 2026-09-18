# Fachliches Datenmodell

Dieses Dokument beschreibt die fachlichen Objekte des Dienstplaners, ihre
Beziehungen und die Regeln für stabile Monatspläne. Der aktuelle Quellcode ist
maßgeblich für die exakten technischen Felder, Validierungsgrenzen und den
tatsächlichen Implementierungsstand.

Speicherorte, Sicherungen und technische Zugriffswege werden in der
[Datenhaltung](../architektur/datenhaltung.md) beschrieben. Verbindliche
Formeln und Zählregeln stehen unter
[Berechnungen](./berechnungen/zeitbasis-und-rundung.md).

## Grundentscheidungen

- Die Anwendung verwaltet genau eine Wohngruppe. Eine eigene Entität `Team` ist
  deshalb nicht erforderlich.
- Mitarbeiter und Eintragsarten sind veränderbare Stammdaten.
- Ein Monatsplan ist ein eigenständig identifizierbares und gemeinsam
  gespeichertes Aggregat.
- Mitarbeiter-Snapshots, Plantage und Planungseinträge sind eigenständige
  Entitäten innerhalb eines Monatsplans.
- Jede Entität besitzt eine eigene UUID. Namen, Kürzel, Titel oder der Zeitraum
  ersetzen diese Identität nicht.
- Mehrere Monatspläne dürfen denselben Monat und dasselbe Jahr besitzen.
- Bestehende Monatspläne bleiben durch vollständige Snapshots unabhängig von
  späteren Änderungen der Stammdaten.
- Monatliche Auswertungen werden aus dem Monatsplan berechnet und nicht als
  eigener Auswertungsstand gespeichert. Ein manuell aus externer Quelle
  übernommener Zeitübertrag bleibt davon getrennt und wird als Plandatum
  gespeichert.
- Planungseinträge besitzen keine allgemeine fachliche Kategorie. Ihre
  Berechnungsart wird ausdrücklich festgelegt und nicht aus Kürzel oder
  Bezeichnung abgeleitet.

## Überblick

```text
Mitarbeiter ── Snapshot bei Plananlage ──> Planmitarbeiter
                                                │
                                                │ planinterne Zuordnung
                                                ▼
Monatsplan ── enthält ──> Plantag ── enthält ──> Planungseintrag
    │                       │                         ▲
    │                       └─ Rufbereitschaft        │
    │                          verweist auf           │
    ├─ enthält Planmitarbeiter                        │
    └─ enthält manuellen Zeitübertrag                 │
                                                      │
Eintragsart ── Snapshot beim Setzen ──────────────────┘
```

Herkunfts-IDs dokumentieren, aus welchem Stammdatensatz ein Snapshot entstanden
ist. Sie sind keine lebenden Fremdschlüssel. Ein Monatsplan bleibt deshalb auch
dann vollständig nutzbar, wenn die ursprünglichen Stammdaten später geändert
oder gelöscht werden.

## Stammdaten

### Mitarbeiter (`Employee`)

Ein Mitarbeiter ist eine eigenständige Stammdaten-Entität. Zu seinem
fachlichen Stand gehören:

- Name,
- Rolle,
- regelmäßige Wochenarbeitszeit,
- Farbe zur visuellen Zuordnung und
- Aktivierungsstatus.

Der Aktivierungsstatus steuert, ob ein Mitarbeiter in einen neuen Monatsplan
übernommen wird. Änderungen am Mitarbeiterstamm verändern bereits bestehende
Monatspläne nicht.

Zulässige Rollen, Eingaberegeln und das Verhalten der Verwaltung werden im
Feature [Teamverwaltung](../features/teamverwaltung.md) festgelegt.

### Eintragsart (`EntryType`)

Eine Eintragsart ist eine wiederverwendbare Stammdaten-Entität für spätere
Planungseinträge. Zu ihrem fachlichen Stand gehören:

- Kürzel und Bezeichnung,
- eine ausdrücklich gewählte Berechnungsart,
- optionale Start- und Endzeit,
- die für ihre Berechnungsart benötigten Zeitwerte und
- Aktivierungsstatus.

Mehrere Eintragsarten dürfen dasselbe Kürzel besitzen. Entscheidend ist ihre
jeweilige UUID.

Nur aktive Eintragsarten können neu in einen Monatsplan gesetzt werden. Eine
spätere Änderung, Deaktivierung oder Löschung verändert bereits gesetzte
Planungseinträge nicht.

Das Verwaltungsverhalten wird im Feature
[Planungseinträge](../features/planungseintraege.md) beschrieben. Die Bildung
konkreter Zeitwerte steht unter
[Berechnungen von Planungseinträgen](./berechnungen/planungseintraege.md).

## Monatsplan-Aggregat

### Monatsplan (`MonthlyPlan`)

Der Monatsplan ist die Wurzel des Aggregats. Er besitzt:

- eine eigene UUID,
- Monat und Jahr,
- einen vom Benutzer vergebenen Titel,
- einen eingefrorenen Mitarbeiterstand und
- einen optionalen manuellen Zeitübertrag mit Bezugsmonat und
- sämtliche Plantage des gewählten Monats.

Die UUID identifiziert den Plan unabhängig von Zeitraum und Titel. Dadurch
können mehrere alternative Pläne für denselben Monat gespeichert werden.

Beim regulären Erstellen gelten folgende Regeln:

- Es muss mindestens einen aktiven Mitarbeiter geben.
- Alle zu diesem Zeitpunkt aktiven Mitarbeiter werden in ihrer Reihenfolge als
  Snapshots übernommen.
- Sämtliche Kalendertage des ausgewählten Monats werden erzeugt.
- Monat und Jahr bleiben nach der Anlage unverändert; der Titel darf später
  bearbeitet werden.
- Mitarbeiter werden im aktuellen Zielumfang nach der Anlage nicht ergänzt,
  entfernt oder umsortiert.

### Planmitarbeiter (`PlanEmployee`)

Ein Planmitarbeiter ist der eingefrorene Mitarbeiterstand innerhalb genau eines
Monatsplans. Er besitzt eine eigene UUID sowie die Herkunfts-ID des
ursprünglichen Mitarbeiters.

Gespeichert werden die für Planung, Darstellung und Berechnung benötigten
Angaben zum Zeitpunkt der Plananlage:

- Name,
- Rolle,
- Wochenarbeitszeit,
- Mitarbeiterfarbe und
- Position im Monatsplan.

Der Aktivierungsstatus des Stammdatensatzes gehört nicht zum Snapshot. Laden,
Bearbeiten und Auswerten eines Monatsplans verwenden ausschließlich den
Planmitarbeiter und lesen die aktuellen Stammdaten nicht erneut als Grundlage
ein.

### Manueller Zeitübertrag (`WorkingTimeCarryover`)

Der optionale Zeitübertrag hält extern ermittelte Über- oder Minusstunden für
Erzieher des Monatsplans fest. Er enthält einen optionalen Bezugsmonat und je
betroffenem Planmitarbeiter höchstens einen vorzeichenbehafteten Minutenwert.

- Ohne gespeicherten Mitarbeiterwert darf der Bezugsmonat leer bleiben.
- Sobald ein Wert gespeichert wird, ist ein Bezugsmonat erforderlich.
- Jeder Wert verweist auf einen Planmitarbeiter desselben Monatsplans mit der
  Snapshot-Rolle `Erzieher`.
- Positive, negative und ausgeglichene Werte sind zulässig.
- Der Übertrag stammt aus einer externen Quelle, wird nicht berechnet und
  beeinflusst weder Soll, Ist noch Differenz.

### Plantag (`PlanDay`)

Ein Plantag repräsentiert genau ein Kalenderdatum des Monatsplans. Er besitzt
eine eigene UUID und enthält:

- das zugehörige Datum,
- eine optionale Tagesbemerkung,
- optional genau eine Rufbereitschaft und
- die Planungseinträge dieses Tages.

Die Rufbereitschaft verweist auf einen Planmitarbeiter desselben Monatsplans
und darf nur einem Mitarbeiter mit der im Snapshot gespeicherten Rolle
`Erzieher` zugeordnet werden. Sie darf parallel zu einem normalen
Planungseintrag derselben Person bestehen.

Wochentag, Wochenende, Feiertagsstatus und Feiertagsbezeichnungen werden aus
dem Datum berechnet und nicht als eigener Kalenderstand gespeichert.

### Planungseintrag (`PlanEntry`)

Ein Planungseintrag ist der vollständige Snapshot einer gesetzten Eintragsart
für genau einen Planmitarbeiter und einen Plantag. Er besitzt eine eigene UUID
und enthält:

- die planinterne Zuordnung zum Mitarbeiter,
- die Herkunfts-ID der verwendeten Eintragsart,
- Kürzel und Bezeichnung,
- die Freier-Tag-Kennzeichnung,
- optionale Start- und Endzeit sowie
- die konkreten Zeitwerte.

Pro Mitarbeiter und Plantag ist höchstens ein Planungseintrag zulässig. Beim
bewussten Wechsel der Eintragsart wird der fachliche Inhalt des vorhandenen
Snapshots vollständig ersetzt; seine eigene UUID bleibt erhalten. Das
Entfernen eines Planungseintrags entfernt den Snapshot aus der Planungszelle.

Die Berechnungsart muss im Planungseintrag nicht vollständig gespeichert werden.
Die konkreten Zeitwerte sind beim Setzen bereits bestimmt. Ihre fachliche
Freier-Tag-Wirkung wird als eigene Kennzeichnung übernommen, weil sie für die
spätere Auswertung benötigt wird. Planungseinträge werden nicht aus aktuellen
Stammdaten neu berechnet.

Ältere Test-Snapshots ohne diese Kennzeichnung werden aus Gründen der
Lesbarkeit als `nicht frei` behandelt. Ein vorhandenes Kürzel `/` wird dabei
nicht automatisch fachlich umgedeutet.

Ein über Mitternacht reichender Dienst bleibt vollständig dem Plantag seiner
Planungszelle zugeordnet.

## Zeitwerte (`TimeValues`)

Zeitwerte sind ein Wertobjekt und keine eigene Entität. Sie besitzen daher
keine UUID. Die Struktur enthält genau sechs ausdrücklich benannte Werte:

| Technischer Name                      | Fachliche Bedeutung               |
| ------------------------------------- | --------------------------------- |
| `attendanceMinutes`                   | Anwesenheitszeit                  |
| `pauseMinutes`                        | Pause                             |
| `workingMinutes`                      | Arbeitszeit mit Nachtbereitschaft |
| `workingWithoutNightReadinessMinutes` | Reine Arbeitszeit                 |
| `nightReadinessMinutes`               | Nachtbereitschaft                 |
| `nightWorkMinutes`                    | Nachtarbeit                       |

Die Werte werden weder in eine allgemeine Zahl zusammengefasst noch als frei
benannte Liste gespeichert. Die verbindlichen Beziehungen zwischen reiner
Arbeitszeit, Nachtbereitschaft, Pause, Arbeitszeit mit Nachtbereitschaft und
Anwesenheitszeit stehen in den
[Berechnungen von Planungseinträgen](./berechnungen/planungseintraege.md).

## Snapshot-Lebenszyklus

1. Beim Erstellen eines Monatsplans werden die aktiven Mitarbeiter als
   Planmitarbeiter kopiert.
2. Der Mitarbeiterbestand und seine Reihenfolge bleiben anschließend
   eingefroren.
3. Für einen neuen Planungseintrag kann nur eine aktive Eintragsart verwendet
   werden.
4. Beim Setzen werden die vollständigen konkreten Werte aus Eintragsart und
   Planmitarbeiter bestimmt und als Planungseintrag gespeichert.
5. Spätere Änderungen, Deaktivierungen, Löschungen oder Neuanlagen in den
   Stammdaten verändern bestehende Snapshots nicht.
6. Laden und Auswerten eines Monatsplans verwenden ausschließlich die im Plan
   gespeicherten Snapshots.

## Planweite Konsistenzregeln

Ein gültiger Monatsplan erfüllt mindestens folgende Beziehungen:

- Er enthält sämtliche Kalendertage seines Monats genau einmal und in
  chronologischer Reihenfolge.
- Die UUIDs der enthaltenen Entitäten sind in ihrem jeweiligen Gültigkeitsraum
  eindeutig.
- Planmitarbeiterpositionen sind eindeutig und lückenlos.
- Planungseinträge und Rufbereitschaften verweisen ausschließlich auf
  Planmitarbeiter desselben Plans.
- Pro Mitarbeiter und Plantag existiert höchstens ein Planungseintrag.
- Eine Rufbereitschaft verweist ausschließlich auf einen Planmitarbeiter mit
  der Snapshot-Rolle `Erzieher`.
- Manuelle Zeitüberträge verweisen ausschließlich und höchstens einmal auf
  Planmitarbeiter mit der Snapshot-Rolle `Erzieher`; gespeicherte Werte setzen
  einen Bezugsmonat voraus.
- Jeder gespeicherte Satz von Zeitwerten erfüllt die verbindlichen
  Berechnungsbeziehungen.
- Die Herkunft eines Snapshots muss syntaktisch identifizierbar sein; die
  ursprünglichen Stammdaten müssen weiterhin nicht vorhanden sein.

Beschädigte oder manuell veränderte Daten begründen kein gewünschtes
fachliches Sonderverhalten. Ein Monatsplan wird nur vollständig verarbeitet,
nicht teilweise ausgewertet.

## Gespeicherte und berechnete Informationen

### Im Monatsplan gespeichert

- Identität, Zeitraum und Titel,
- Mitarbeiter-Snapshots einschließlich Rolle, Wochenarbeitszeit und Position,
- optionaler Bezugsmonat und manuelle Zeitüberträge der Erzieher,
- Plantage mit Bemerkung und optionaler Rufbereitschaft,
- Planungseintrag-Snapshots mit ihren konkreten Zeitwerten.

### Bei Bedarf berechnet

- Wochentage, Wochenenden und Feiertage,
- kalendarische Arbeitstagszahl,
- tagesbezogene Kennzahlen und Anzahl der Rufbereitschaften,
- monatliche Zeitwertsummen,
- Zuschläge sowie Sonntags- und Feiertagszeiten,
- Soll-Arbeitszeit, Ist-Arbeitszeit und Differenz,
- Darstellungen für Oberfläche, Druck und Export.

Nachtarbeit und Nachtbereitschaft sind damit nicht grundsätzlich ungespeichert:
Ihre Einzelwerte stehen in den Planungseinträgen; nur die Monatsaggregate werden
neu berechnet.
