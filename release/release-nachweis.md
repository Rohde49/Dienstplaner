# Release-Nachweis: Dienstplaner `<VERSION>`

## Freigabestatus

- **Status:** `<KANDIDAT | FREIGEGEBEN | ABGELEHNT>`
- **Pilotversion:** Ja, ausschließlich private Übergabe
- **Verantwortlich:** Jeremy Louis Rohde
- **Freigabe am:** `<DATUM UND UHRZEIT, EUROPE/BERLIN>`
- **Begründung:** `<KURZE ZUSAMMENFASSUNG>`

## Herkunft des Kandidaten

- **Version:** `<VERSION>`
- **Git-Commit:** `<VOLLSTAENDIGE COMMIT-ID>`
- **Git-Tag:** `<TAG ODER NICHT GESETZT>`
- **Arbeitsbaum vor dem Build sauber:** `<JA/NEIN>`
- **Buildzeitpunkt:** `<DATUM UND UHRZEIT, EUROPE/BERLIN>`
- **Buildrechner:** `<RECHNER/UMGEBUNG>`
- **Zielsystem:** Windows 11 x64
- **Node.js:** `<VERSION>`
- **npm:** `<VERSION>`

## Automatisierte Prüfungen

Nur tatsächlich ausgeführte Ergebnisse eintragen.

| Prüfung                                     | Zeitpunkt | Ergebnis | Bemerkung                |
| ------------------------------------------- | --------- | -------- | ------------------------ |
| `npm run licenses:check`                    | `<...>`   | `<...>`  | `<...>`                  |
| `npm test`                                  | `<...>`   | `<...>`  | `<ANZAHL DATEIEN/TESTS>` |
| `npm run typecheck`                         | `<...>`   | `<...>`  | `<...>`                  |
| `npm run lint`                              | `<...>`   | `<...>`  | `<...>`                  |
| `npm run format:check`                      | `<...>`   | `<...>`  | `<...>`                  |
| `git diff --check`                          | `<...>`   | `<...>`  | `<...>`                  |
| Sicherheitsstatus Produktionsabhängigkeiten | `<...>`   | `<...>`  | `<BEFEHL UND BEFUNDE>`   |

## Build und Artefakte

- **Paketbefehl:** `npm run package`
- **Installerbefehl:** `npm run make`
- **Architektur:** x64
- **Maker:** Squirrel.Windows
- **Build erfolgreich:** `<JA/NEIN>`

| Artefakt                   | Zweck                              | SHA-256 |
| -------------------------- | ---------------------------------- | ------- |
| `<SETUP-DATEI>`            | Übergabe an Pilotnutzer            | `<...>` |
| `<NUPKG-DATEI>`            | interne Wiederherstellung/Nachweis | `<...>` |
| `RELEASES`                 | interne Squirrel-Metadaten         | `<...>` |
| `LIESMICH.txt`             | Benutzerinformation                | `<...>` |
| `Dienstplaner-LICENSE.txt` | eigene Lizenz                      | `<...>` |
| `THIRD_PARTY_NOTICES.txt`  | Fremdlizenzhinweise                | `<...>` |

### Paketinhalt geprüft

- [ ] Version und Dateinamen stimmen.
- [ ] Gepackte Anwendung startet.
- [ ] Anwendungscode liegt im ASAR-Archiv.
- [ ] `LICENSE` und `THIRD_PARTY_NOTICES.txt` sind enthalten.
- [ ] Electron-/Chromium-Lizenzdateien sind vorhanden.
- [ ] Der Übergabeordner enthält keine Benutzerdaten, Quelltexte, `.nupkg` oder
      `RELEASES`.
- [ ] `LIESMICH.txt` enthält die tatsächliche Setup-Prüfsumme und keine
      Platzhalter.

## Manuelle Installer-Abnahme unter Windows 11

| Prüffall                                          | Datum/Person | Ergebnis | Bemerkung |
| ------------------------------------------------- | ------------ | -------- | --------- |
| Installation ohne Administratorrechte             | `<...>`      | `<...>`  | `<...>`   |
| Warnung des unsignierten Installers nachvollzogen | `<...>`      | `<...>`  | `<...>`   |
| Startmenü-Verknüpfung                             | `<...>`      | `<...>`  | `<...>`   |
| Desktop-Verknüpfung                               | `<...>`      | `<...>`  | `<...>`   |
| Erster Programmstart                              | `<...>`      | `<...>`  | `<...>`   |
| Erneutes Ausführen desselben Installers           | `<...>`      | `<...>`  | `<...>`   |
| Deinstallation                                    | `<...>`      | `<...>`  | `<...>`   |
| Neuinstallation                                   | `<...>`      | `<...>`  | `<...>`   |

Ein zusätzlicher manueller Virenscan ist für diese private Pilotübergabe nicht
vorgeschrieben. Vorhandener Echtzeitschutz wurde nicht deaktiviert oder
umgangen. Eine SHA-256-Prüfsumme belegt nur Dateiidentität, nicht
Schadsoftwarefreiheit.

## Manuelle Produktabnahme

Für alle Prüffälle ausschließlich erfundene Testdaten verwenden.

- [ ] Mitarbeitende und Eintragsarten anlegen, bearbeiten und löschen.
- [ ] Monatsplan erstellen, bearbeiten, speichern und erneut öffnen.
- [ ] Auswertung öffnen und Angaben prüfen.
- [ ] Kompaktansicht prüfen.
- [ ] PDF erzeugen und Ausgabe kontrollieren.
- [ ] Anwendung und Rechner neu starten; gespeicherte Daten erneut prüfen.
- [ ] Sichtbild, Tastaturbedienung und sichtbare Fokuszustände prüfen.
- [ ] Verständliche fachliche und unerwartete Fehlermeldungen stichprobenartig
      prüfen.

**Durchgeführt am/von:** `<...>`

**Ergebnis und Bemerkungen:** `<...>`

## Datenerhalt und Wiederherstellung

- [ ] Vollständigen Ordner `dienstplaner-data` bei geschlossener Anwendung
      extern gesichert.
- [ ] Daten nach erneutem Ausführen des Installers unverändert vorhanden.
- [ ] Daten nach Deinstallation erhalten.
- [ ] Daten nach Neuinstallation wieder geladen.
- [ ] Externe Ordnersicherung in einem kontrollierten Prüffall wiederhergestellt.
- [ ] Stammdaten und mindestens einen Monatsplan nach der Wiederherstellung
      geprüft.

**Ergebnis und Bemerkungen:** `<...>`

## Pilotabnahme

- **Pilotnutzer:** `<NAME ODER INTERNE BEZEICHNUNG>`
- **Abnahmedatum:** `<...>`
- **Selbst ausgeführter Kernablauf:** `<...>`
- **Ergebnis/Rückmeldung:** `<...>`

## Bekannte Einschränkungen und Abweichungen

| Einstufung                    | Beschreibung | Entscheidung/Umgang |
| ----------------------------- | ------------ | ------------------- |
| `<BLOCKER/NICHT BLOCKIEREND>` | `<...>`      | `<...>`             |

Offene Blocker verhindern die Freigabe. Nicht blockierende Abweichungen müssen
bewusst akzeptiert und in `LIESMICH.txt` aufgenommen werden, wenn sie den
Pilotnutzer betreffen.

## Übergabe und Archivierung

- **Privater Archivordner:** `<ABSOLUTER PFAD AUSSERHALB DES REPOSITORYS>`
- **Übergabeordner:** `Dienstplaner-<VERSION>-Pilot`
- **USB-Stick/Datenträger:** `<INTERNE BEZEICHNUNG>`
- **Setup-Prüfsumme vor dem Kopieren:** `<...>`
- **Setup-Prüfsumme nach dem Kopieren:** `<...>`
- **Prüfsummen identisch:** `<JA/NEIN>`
- [ ] Nur die freigegebene Version liegt sichtbar auf dem Übergabemedium.
- [ ] Keine Dienstplaner-Benutzerdaten oder Sicherungen liegen auf dem Medium.
- [ ] Vollständiger interner Release-Satz wurde archiviert.

## Endgültige Freigabe

- **Entscheidung:** `<FREIGEGEBEN/ABGELEHNT>`
- **Datum und Unterschrift/Name:** `<...>`
- **Begründung:** `<...>`
