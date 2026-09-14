# Datenhaltung

Dieses Dokument beschreibt die dauerhaften Architekturentscheidungen für die
lokale Datenhaltung. Die konkreten Schemas, Dateizugriffe und Schnittstellen im
Quellcode bleiben die maßgebliche Quelle für den aktuellen Implementierungsstand.

## Ziele

Die Datenhaltung soll:

- vollständig lokal und offline funktionieren,
- nur vollständige und fachlich gültige Daten dauerhaft speichern,
- den direkten Dateisystemzugriff aus der Benutzeroberfläche verhindern,
- beschädigte Daten nicht unbemerkt durch leere Ausgangsdaten ersetzen und
- bereits gespeicherte historische Angaben unabhängig von späteren Änderungen
  an Stammdaten erhalten.

## Ablage und Dateiaufteilung

Die Anwendung legt ihre Daten im betriebssystemseitigen Benutzerverzeichnis der
Anwendung ab. Innerhalb dieses Verzeichnisses verwendet sie den Ordner
`dienstplaner-data` mit folgender fachlicher Aufteilung:

```text
dienstplaner-data/
├── employees.json
├── employees.json.backup
├── entry-types.json
├── entry-types.json.backup
└── plans/
    ├── <plan-id>.json
    └── <plan-id>.json.backup
```

- Mitarbeitende und Eintragsarten werden jeweils gemeinsam in einer Datei
  gespeichert.
- Jeder Dienstplan wird in einer eigenen Datei anhand seiner UUID gespeichert.
  Jahr und Monat sind kein eindeutiger Schlüssel; mehrere Pläne für denselben
  Monat sind zulässig.
- Eine Sicherungsdatei liegt direkt neben der zugehörigen Hauptdatei.
- Temporäre Dateien dürfen während eines Schreibvorgangs entstehen, gehören
  aber nicht zum dauerhaften Datenbestand.

Die Anwendung speichert ihre fachlichen Primärdaten weder im Installationsordner
noch im Browser-Speicher oder in einem externen Dienst.

## Verantwortungsgrenzen

Der Datenfluss folgt dieser Richtung:

```text
React-Oberfläche
  → begrenzte Preload-Schnittstelle
  → IPC-Verarbeitung im Main Process
  → fachliches Repository
  → allgemeiner JSON-Dateispeicher
  → lokale JSON-Dateien
```

- Die Oberfläche kennt keine Dateipfade und besitzt keinen allgemeinen Zugriff
  auf das Dateisystem.
- Die Preload-Schicht stellt ausschließlich die vorgesehenen fachlichen
  Operationen bereit.
- Der Main Process validiert Eingaben erneut, erzeugt systemverantwortete Werte
  wie IDs und Zeitstempel und setzt fachliche Schutzregeln durch.
- Die Repositories übersetzen zwischen fachlichen Vorgängen und gespeicherten
  Daten.
- Der allgemeine JSON-Dateispeicher übernimmt Lesen, Validierung, Schreiben und
  Wiederherstellung, kennt aber keine dienstplanspezifischen Regeln.

## Validierung als Speichergrenze

Eine Prüfung in der Oberfläche dient der schnellen Rückmeldung, ist aber keine
Vertrauensgrenze. Eingaben werden im Main Process als nicht vertrauenswürdig
behandelt und erneut geprüft.

Vor dem Schreiben wird immer das vollständige Zielschema validiert. Beim Lesen
wird die gesamte JSON-Datei zuerst geparst und anschließend vollständig gegen
ihr Schema geprüft. Teilweise gültige oder nur teilweise verstandene Dateien
werden nicht als regulärer Datenbestand verwendet.

Die konkreten Zod-Schemas und ihre Pflichtfelder werden ausschließlich im
Quellcode gepflegt. Das fachliche Modell und seine dauerhaften Invarianten sind
in [Datenmodell](../fachlichkeit/datenmodell.md) beschrieben.

## Schreiben und Sicherung

Ein Schreibvorgang folgt diesen Schutzschritten:

1. Die neuen Daten werden vollständig validiert.
2. Benötigte Verzeichnisse werden angelegt.
3. Die neue Version wird zunächst in eine zufällig benannte temporäre Datei
   geschrieben.
4. Eine vorhandene gültige Hauptdatei wird vor ihrer Ablösung als Sicherung
   erhalten.
5. Ungültige vorhandene Daten werden nicht überschrieben, wenn keine gültige
   Haupt- oder Sicherungsversion als Wiederherstellungsbasis existiert.
6. Erst nach erfolgreichem Austausch gilt der Vorgang als gespeichert;
   verbliebene temporäre Dateien werden bereinigt.

Die Sicherungsdatei enthält höchstens die vorherige gültige Version. Sie ist ein
begrenzter Schutz gegen beschädigte Hauptdateien, aber keine allgemeine
Backupstrategie. Der aktuelle Ablauf verspricht außerdem keine vollständige
atomare Dateisystemtransaktion; die Wiederherstellbarkeit stützt sich auf die
zuvor erhaltene gültige Sicherung.

## Lesen und Wiederherstellung

Beim Laden gilt folgende Reihenfolge:

1. Eine gültige Hauptdatei wird verwendet.
2. Fehlt sie oder ist sie ungültig, wird eine gültige Sicherungsdatei verwendet.
3. Fehlen beide Dateien, dürfen Stammdaten mit einem definierten leeren
   Ausgangszustand beginnen; ein einzelner Dienstplan gilt dagegen als nicht
   vorhanden.
4. Existiert eine beschädigte Datei und steht keine gültige Alternative zur
   Verfügung, wird das Laden mit einem Fehler abgebrochen.

Beim Laden eines Monatsplans bleibt eine Wiederherstellung aus der Sicherung
für den aufrufenden Teil der Anwendung erkennbar, damit die Planungsseite einen
Hinweis anzeigen kann. Bei Mitarbeiter- und Eintragsartendaten verwendet die
bestehende Schnittstelle eine gültige Sicherung automatisch. Beschädigte Daten
dürfen niemals stillschweigend durch einen leeren Zustand ersetzt und
anschließend überschrieben werden.

## Nebenläufigkeit

Zugriffe auf denselben fachlichen Datenbestand werden innerhalb des Main Process
serialisiert. Lesen und Schreiben laufen dadurch in einer eindeutigen Reihenfolge
und können sich nicht gegenseitig überholen. Für Dienstpläne gilt diese
Reihenfolge gemeinsam über alle einzelnen Plandateien hinweg.

Dieses Modell ist auf eine lokale Einzelinstanz der Desktop-Anwendung
ausgerichtet. Gleichzeitige Bearbeitung durch mehrere Prozesse, Datenbank-Sperren
oder verteilte Konfliktauflösung gehören nicht zum vorgesehenen Umfang.

## Schutzregeln für Dienstpläne

Die Dienstplanablage wahrt zusätzlich folgende Grenzen:

- Ein Speichervorgang ändert nur einen bereits vorhandenen Plan und erzeugt
  nicht stillschweigend einen neuen.
- Die Plan-ID, der Planungsmonat, das Erstellungsdatum, die übernommenen
  Mitarbeitenden und die Kalenderstruktur werden beim Bearbeiten nicht
  ausgetauscht.
- Neue oder ersetzte Einträge übernehmen ihre gespeicherten Werte aus einer
  aktuell aktiven Eintragsart. Bereits vorhandene Einträge behalten ihre
  Snapshots und ändern sich nicht rückwirkend mit den Stammdaten.
- Zusammenfassungen für Übersichten werden aus den Plandateien abgeleitet und
  nicht als zusätzlicher paralleler Datenbestand geführt.
- Beim Löschen eines Plans werden Haupt- und Sicherungsdatei gemeinsam als ein
  serialisierter Vorgang behandelt.

## Abgrenzung

Nicht Bestandteil dieser Architekturentscheidung sind:

- eine Datenbank oder Cloud-Synchronisation,
- ein vollständiges Sicherungs-, Export- oder Archivierungskonzept,
- die Ablage von PDF- oder Druckausgaben als Primärdaten,
- separat gespeicherte Berechnungsergebnisse, die aus einem Dienstplan erneut
  ermittelt werden können, und
- eine Dokumentation konkreter Methoden, Typnamen oder Schemafelder, die ohne
  fachliche Auswirkung im Quellcode geändert werden dürfen.
