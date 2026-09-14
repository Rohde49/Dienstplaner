# Datenmodell und Datenhaltung

## Datenhaltung

Das Altsystem speichert Daten lokal in einer SQLite-Datei `dienstplan.db` unter dem von Electron gelieferten `userData`-Pfad. `better-sqlite3` läuft ausschließlich im Main-Prozess. Beim Öffnen werden folgende Pragmas gesetzt:

- `journal_mode = WAL`,
- `foreign_keys = ON`,
- `busy_timeout = 5000`.

`schema.ts` erzeugt fehlende Tabellen und verwaltet `PRAGMA user_version`. Am untersuchten Commit ist die Schemaversion 1; die Migrationsliste ist leer. Die Vorbereitung ist als wiederholbar angelegt. Zusätzlich führt der Main-Prozess bei jedem Start einen `runDbSmokeTest()` aus, der eine Tabelle `smoke_test` anlegt und eine Zeitstempelzeile einfügt. Für die fachlichen Abläufe wird diese Tabelle nicht gelesen.

## Entitäten und Tabellen

### TeamMember

`team_members` speichert numerische Auto-Increment-ID, Vorname, Name, Rolle, Wochenarbeitszeit in Minuten und Farbe. Der TypeScript-Typ begrenzt die Rolle auf `Erzieher`, `Praktikant` oder `Wirtschaftskraft`; SQLite selbst verwendet dafür lediglich `TEXT` ohne Check-Constraint.

Die gemeinsame Farbpalette enthält zehn Hex-Werte mit deutschen Farbnamen. Die Namen dienen auch der nicht rein farblichen Beschriftung in der UI.

### Eintragsdefinition

`eintragsdefinitionen` enthält Kürzel, Name, Berechnungsart, optionale Beginn-/Endzeit und fünf nicht optionale Minutenfelder:

- Anwesenheitszeit,
- Arbeitszeit,
- Arbeitszeit ohne Nachtbereitschaft,
- Nachtbereitschaft,
- Nachtarbeit.

Die Berechnungsart ist im TypeScript-Typ `fest` oder `mitarbeiterabhaengig`; auf Datenbankebene ist sie unbeschränktes `TEXT`.

### Dienstplan und Dienstplantag

`dienstplaene` speichert Monat, Jahr, optional leer bleibenden Titel sowie Erstellungs- und Änderungszeitstempel. Monat und Jahr besitzen im SQL-Schema keinen Check- oder Unique-Constraint. Mehrere Pläne für denselben Monat und dasselbe Jahr sind deshalb statisch möglich und werden in Repository-Tests ausdrücklich als zulässig behandelt.

`dienstplantage` gehört per Fremdschlüssel zu einem Dienstplan und enthält ein ISO-Datum sowie eine optionale Bemerkung. Beim Anlegen eines Dienstplans erzeugt das Repository innerhalb einer Transaktion für jeden Kalendertag des gewählten Monats eine Zeile. Wochentag, Wochenende und Feiertag werden nicht gespeichert, sondern aus dem Datum berechnet.

### Planeintrag

`planeintraege` verbindet einen Dienstplantag und ein Teammitglied mit der Herkunfts-ID einer Eintragsdefinition. Daneben speichert die Zeile einen Snapshot aus Kürzel, Beginn, Ende und den fünf Minutenwerten. Dadurch werden spätere Auswertungen aus den Eintragswerten des Planungszeitpunkts gespeist.

Die Kombination aus `dienstplantagId` und `teamMemberId` ist eindeutig: pro Person und Tag kann höchstens ein regulärer Planeintrag existieren. Als SQL-Fremdschlüssel ist nur `dienstplantagId` deklariert. `teamMemberId` und `eintragsdefinitionId` sind numerische Felder ohne SQL-Referenz.

### Rufbereitschaft

`rufbereitschaften` ordnet einem Dienstplantag eine Person zu. `dienstplantagId` ist zugleich Fremdschlüssel und `UNIQUE`, also höchstens eine Rufbereitschaft pro Tag. `teamMemberId` besitzt keinen SQL-Fremdschlüssel. Die Einschränkung auf Erzieher ist im untersuchten Stand in der Auswahloberfläche, nicht im SQL-Schema oder IPC-Handler, erkennbar.

## Repository-Verhalten

Jeder Fachbereich besitzt Repository-Funktionen, die eine Datenbankverbindung als Parameter erhalten. Listen werden nach numerischer ID beziehungsweise Dienstplantage nach Datum sortiert.

- Teammitglieder und Eintragsdefinitionen werden einzeln angelegt und aktualisiert.
- Das Löschen eines Teammitglieds wird blockiert, wenn dessen ID in Planeinträgen oder Rufbereitschaften vorkommt.
- Eintragsdefinitionen werden ohne vorgeschaltete Nutzungsprüfung gelöscht; bestehende Planeinträge behalten ihre Snapshotwerte und die Herkunfts-ID als Zahl.
- Dienstpläne werden zusammen mit Tagen angelegt. Beim Löschen entfernt eine Transaktion zuerst Planeinträge und Rufbereitschaften, danach Tage und Plan.
- `speicherePlanungsstand()` aktualisiert Titel, veränderte Planeintragszellen, Rufbereitschaften und Bemerkungen in einer gemeinsamen Transaktion. Eine geänderte Zelle wird zunächst gelöscht und bei nicht leerem Ersatz neu eingefügt.

Nach erfolgreichem Speichern liest das Repository den Dienstplan, alle Planeinträge, Rufbereitschaften und Dienstplantage erneut und gibt sie an den Renderer zurück.

## IDs und Entwurfsstrukturen

In der Persistenz verwenden alle Entitäten numerische IDs. Im Renderer werden Planeinträge für schnellen Zellzugriff zusätzlich als `Record<string, PlaneintragSnapshot>` mit einem zusammengesetzten Schlüssel aus Dienstplantag- und Mitarbeiter-ID gehalten. Rufbereitschaften und Bemerkungen verwenden die Dienstplantag-ID als String-Schlüssel.

Diese Records sind Bearbeitungszustände, keine eigenen gespeicherten Entitäten. Beim Laden werden Datenbankzeilen in diese Form überführt; beim Speichern werden nur als verändert erkannte Schlüssel als Änderungslisten an den Main-Prozess geschickt.

## Datenintegrität und statische Grenzen

- Fremdschlüssel schützen die Beziehung Dienstplan–Tag sowie Tag–Planeintrag beziehungsweise Tag–Rufbereitschaft.
- Beziehungen von Planeintrag/Rufbereitschaft zu Teammitgliedern und von Planeintrag zur Eintragsdefinition sind nicht als SQL-Fremdschlüssel abgesichert.
- Main-Prozess und Repositories prüfen Wertebereiche, Rollen und Formate nicht allgemein vor dem Schreiben. Die Renderer-Validierung ist in [Fehlerbehandlung und Validierung](./fehlerbehandlung-und-validierung.md) beschrieben.
- Aktualisierungsfunktionen setzen laut Kommentar voraus, dass IDs aus zuvor geladenen Daten stammen; ein eigener Not-found-Pfad ist nicht vorhanden.
- Ohne Ausführung ist nicht bestätigt, wie bestehende reale Datenbanken, Sperren oder beschädigte Dateien sich praktisch verhalten.

## Zugehörige Berechnungen

Zeit-, Kalender-, Snapshot- und Auswertungsregeln werden in [Berechnungen](./berechnungen.md) zusammengeführt.
