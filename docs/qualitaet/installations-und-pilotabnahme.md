# Installations- und Pilotabnahme

## Zweck und Verantwortlichkeit

Diese Anleitung führt Jeremy Louis Rohde Schritt für Schritt durch die manuelle
Prüfung des Dienstplaners `1.0.0` unter Windows 11. Codex bereitet den
Release-Kandidaten und die technischen Nachweise vor, führt aber keine
Installation, Deinstallation oder Änderung am Windows-System durch.

Der Kandidat darf erst nach vollständig erfolgreicher Prüfung als freigegeben
bezeichnet und an den Pilotnutzer übergeben werden. Für alle fachlichen
Prüfschritte werden ausschließlich erfundene Testdaten verwendet.

## Geprüfter Kandidat

- **Version:** `1.0.0`
- **Quellcommit:** `6bcefeb3d3133bb2fdb567a4f2c8922e1838a548`
- **Installationsdatei:** `Dienstplaner-1.0.0 Setup.exe`
- **Zielsystem:** Windows 11 x64
- **SHA-256 der Installationsdatei:**
  `4B9578F356702562D513D26B001A7054C2B771E5607F81797CA027E4C5A84286`
- **Signatur:** bewusst nicht digital signiert
- **Privates Release-Archiv:**
  `E:\Programmieren\Projects\Dienstplaner-Archiv`

Der Kandidat ist technisch gebaut und sein Paketinhalt wurde kontrolliert. Die
folgenden Schritte sind der noch fehlende praktische Nachweis auf dem von
Jeremy ausgewählten Windows-11-Testsystem.

## 1. Testsystem vorbereiten

1. Verwende einen Windows-11-x64-PC beziehungsweise ein Windows-Benutzerkonto,
   auf dem Dienstplaner noch nicht installiert wurde.
2. Prüfe unter **Einstellungen → Apps → Installierte Apps**, dass dort kein
   Eintrag `Dienstplaner` vorhanden ist.
3. Drücke `Windows-Taste + R`, gib `%APPDATA%\Dienstplaner` ein und bestätige.
   Der Ordner sollte für den ersten Test noch nicht vorhanden sein.
4. Falls bereits eine ältere Testinstallation oder ein Datenordner vorhanden
   ist, nicht löschen. Die Prüfung unterbrechen und den vorhandenen Stand zuerst
   getrennt sichern.
5. Notiere für den Release-Nachweis Datum, verwendeten PC beziehungsweise das
   Testkonto und die mit `Windows-Taste + R` → `winver` angezeigte
   Windows-Version.

## 2. Installationsdatei und Prüfsumme kontrollieren

1. Öffne den Kandidatenordner im privaten Release-Archiv.
2. Prüfe, dass die Datei genau `Dienstplaner-1.0.0 Setup.exe` heißt.
3. Öffne in diesem Ordner ein PowerShell-Fenster. Unter Windows 11 geht das zum
   Beispiel mit Rechtsklick auf eine freie Stelle und **Im Terminal öffnen**.
4. Führe folgenden Befehl aus:

   ```powershell
   Get-FileHash -Algorithm SHA256 -LiteralPath '.\Dienstplaner-1.0.0 Setup.exe'
   ```

5. Der ausgegebene Wert muss exakt lauten:

   ```text
   4B9578F356702562D513D26B001A7054C2B771E5607F81797CA027E4C5A84286
   ```

6. Bei einer Abweichung die Datei nicht starten und die Prüfung abbrechen.

Die Prüfsumme bestätigt nur, dass die Datei unverändert ist. Sie ist kein
Nachweis dafür, dass eine Datei frei von Schadsoftware ist.

## 3. Installation prüfen

1. Starte `Dienstplaner-1.0.0 Setup.exe` per Doppelklick.
2. Windows kann warnen, weil der private Installer nicht digital signiert ist.
   Notiere den genauen Warntext und fertige bei Bedarf einen Screenshot ohne
   persönliche Daten an.
3. Fahre nur fort, wenn Dateiname und Prüfsumme mit dieser Anleitung
   übereinstimmen. Deaktiviere oder umgehe keinen Viren- oder Echtzeitschutz.
4. Prüfe, dass die Installation ohne Eingabe eines Administratorkennworts
   abgeschlossen wird.
5. Notiere, ob Dienstplaner anschließend automatisch startet.
6. Prüfe im Startmenü und auf dem Desktop, welche Verknüpfungen tatsächlich
   angelegt wurden. Öffne jede vorhandene Verknüpfung einmal.
7. Prüfe unter **Einstellungen → Apps → Installierte Apps**, dass
   `Dienstplaner` mit Version `1.0.0` aufgeführt wird.

## 4. Ersten Start und Ausgangszustand prüfen

1. Starte Dienstplaner über eine angelegte Windows-Verknüpfung.
2. Prüfe, dass das Hauptfenster sichtbar, maximiert und bedienbar erscheint.
3. Prüfe, dass keine bereits angelegten Mitarbeitenden, Eintragsarten oder
   Monatspläne vorhanden sind.
4. Prüfe sichtbare Fokusmarkierungen, indem du mehrmals die `Tab`-Taste
   verwendest.
5. Öffne die Hauptbereiche der Anwendung und achte auf unverständliche
   technische Fehlermeldungen, leere oder beschädigte Darstellungen und nicht
   bedienbare Schaltflächen.

## 5. Fachlichen Kernablauf mit erfundenen Daten prüfen

Für diesen Abschnitt keine echten Namen, Arbeitszeiten oder Dienstplandaten
verwenden.

1. Lege mindestens zwei erfundene Mitarbeitende mit unterschiedlichen
   Arbeitszeiten und Farben an.
2. Bearbeite einen Mitarbeitenden, ändere die Reihenfolge und prüfe die
   Aktiv-/Inaktiv-Schaltung.
3. Lege mehrere Eintragsarten mit unterschiedlichen Berechnungsarten an.
4. Bearbeite eine Eintragsart, ändere die Reihenfolge und prüfe ihre
   Aktiv-/Inaktiv-Schaltung.
5. Erstelle einen Monatsplan und vergib einen eindeutigen Testtitel.
6. Trage Dienste, freie Tage, Notizen und – soweit passend –
   Bereitschaftsangaben ein.
7. Speichere den Monatsplan, schließe ihn und öffne ihn erneut.
8. Prüfe, dass Stammdaten-Snapshots und Planungseinträge unverändert vorhanden
   sind.
9. Öffne die Auswertung und kontrolliere die dargestellten Soll-, Ist- und
   Differenzwerte anhand einfacher, nachvollziehbarer Testwerte.
10. Öffne die Kompaktansicht und prüfe Lesbarkeit, Seitenaufteilung und lange
    Inhalte.
11. Erzeuge eine PDF-Datei in einem bewusst gewählten Testordner, öffne sie und
    kontrolliere Inhalt, Seitenzahl und Lesbarkeit.
12. Lösche einen nicht mehr benötigten Testdatensatz erst, nachdem der
    zugehörige Bestätigungsdialog vollständig gelesen wurde.

## 6. Neustart und Datenerhalt prüfen

1. Schließe Dienstplaner regulär und bestätige den Schließen-Dialog.
2. Starte die Anwendung erneut und prüfe Stammdaten sowie den gespeicherten
   Monatsplan.
3. Starte Windows neu.
4. Öffne Dienstplaner danach erneut und wiederhole die Datenkontrolle.
5. Führe dieselbe Datei `Dienstplaner-1.0.0 Setup.exe` nochmals aus.
6. Prüfe anschließend erneut Version, Start, Stammdaten und Monatsplan.

## 7. Externe Datensicherung und Wiederherstellung prüfen

1. Schließe Dienstplaner vollständig.
2. Öffne `%APPDATA%\Dienstplaner` im Windows-Explorer.
3. Kopiere den vollständigen Ordner `dienstplaner-data` auf einen getrennten,
   persönlich kontrollierten Datenträger oder in einen eigens angelegten
   Test-Sicherungsordner.
4. Prüfe, dass die Sicherung die JSON-Dateien, Dateien mit der Endung
   `.backup` und den Unterordner `plans` enthält.
5. Benenne den aktuellen Ordner `dienstplaner-data` vorübergehend in
   `dienstplaner-data-vor-wiederherstellung` um.
6. Kopiere die vollständige Sicherung unter dem ursprünglichen Namen
   `dienstplaner-data` zurück.
7. Starte Dienstplaner und prüfe die Stammdaten sowie mindestens einen
   gespeicherten Monatsplan.
8. Wenn die Wiederherstellung erfolgreich war, schließe die Anwendung. Der
   vorübergehend umbenannte Vergleichsordner darf erst nach Abschluss und nur
   dann gelöscht werden, wenn die separate Sicherung weiterhin vorhanden ist.

Keine einzelnen Haupt- und Sicherungsdateien aus verschiedenen Ständen
vermischen. Eine absichtliche Beschädigung interner Dateien gehört nicht zu
dieser Pilotabnahme.

## 8. Deinstallation und Neuinstallation prüfen

1. Stelle sicher, dass die externe Datensicherung weiterhin vorhanden ist.
2. Deinstalliere Dienstplaner über **Einstellungen → Apps → Installierte Apps**.
3. Prüfe, dass Anwendung und angelegte Verknüpfungen entfernt wurden.
4. Öffne `%APPDATA%\Dienstplaner` und prüfe, dass `dienstplaner-data` weiterhin
   vorhanden ist. Die fachlichen Daten sollen durch die Deinstallation nicht
   entfernt werden.
5. Installiere mit derselben geprüften Setup-Datei erneut.
6. Starte Dienstplaner und prüfe, dass Stammdaten und Monatsplan wieder geladen
   werden.

Fehlt der Datenordner nach der Deinstallation oder sind Daten nach der
Neuinstallation nicht mehr lesbar, ist die Freigabe blockiert.

## 9. Pilotnutzer-Abnahme

Erst wenn Jeremys technische Prüfung vollständig erfolgreich war:

1. Übergib dem Pilotnutzer den vorbereiteten Ordner
   `Dienstplaner-1.0.0-Pilot` persönlich.
2. Erkläre die Windows-Warnung, lokale Datenspeicherung, manuelle Sicherung und
   fehlenden automatischen Update-Mechanismus.
3. Lass den Pilotnutzer selbst einen kleinen Ablauf mit ausschließlich
   erfundenen Testdaten ausführen: Mitarbeitenden und Eintragsart anlegen,
   Monatsplan erstellen, speichern, erneut öffnen, auswerten und als PDF
   ausgeben.
4. Notiere Datum, Ergebnis und Rückmeldung im Release-Nachweis.

## 10. Ergebnis zurückmelden

Melde für jeden der folgenden Blöcke **erfolgreich**, **fehlgeschlagen** oder
**nicht durchgeführt** zurück und ergänze Abweichungen:

1. Prüfsumme und Windows-Warnung
2. Installation ohne Administratorrechte
3. Verknüpfungen und erster Start
4. leerer Ausgangszustand
5. fachlicher Kernablauf
6. PDF-Ausgabe
7. Anwendungs- und Windows-Neustart
8. erneutes Ausführen desselben Installers
9. externe Sicherung und Wiederherstellung
10. Deinstallation und Datenerhalt
11. Neuinstallation und erneutes Laden der Daten
12. Tastaturbedienung, Fokuszustände und sichtbare Darstellung
13. Pilotnutzer-Abnahme

Zusätzlich benötigt werden:

- Datum und verwendete Windows-Version,
- genaue Texte unerwarteter Fehlermeldungen,
- gegebenenfalls Screenshots ohne personenbezogene Daten und
- eine kurze Beschreibung jedes abweichenden Ablaufs.

## Abbruch- und Freigaberegel

Die Prüfung wird abgebrochen und die Version nicht freigegeben, wenn:

- die SHA-256-Prüfsumme abweicht,
- Installation oder Start scheitern,
- gespeicherte Daten unerwartet verloren gehen,
- Sicherung oder Wiederherstellung nicht funktioniert,
- Deinstallation entgegen der Vorgabe den fachlichen Datenordner entfernt,
- ein Kernablauf nicht verwendbar ist oder
- eine sonstige Abweichung als Release-Blocker bewertet wird.

Nicht blockierende Auffälligkeiten werden im Release-Nachweis dokumentiert und
vor der Übergabe ausdrücklich bewertet. Erst danach erfolgt die endgültige
Freigabe, Archivierung und Kennzeichnung mit `v1.0.0`.
