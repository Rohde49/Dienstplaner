# Umsetzungsplan proprietäre Lizenzierung

## Status

Dieser Plan beschreibt die abgestimmte Richtung und die noch erforderlichen
Entscheidungen. Die Lizenzumstellung ist noch nicht umgesetzt. Insbesondere
gilt im Projekt derzeit weiterhin die widersprüchliche Ausgangslage aus dem
MIT-Eintrag in `package.json` und einer fehlenden Lizenzdatei.

## Ziel und Abgrenzung

Der selbst entwickelte Quellcode und die selbst erstellten Projektbestandteile
des Dienstplaners werden proprietär lizenziert. Dritte erhalten nur die in den
Lizenzbedingungen ausdrücklich eingeräumten Nutzungsrechte. Alle übrigen
Rechte verbleiben beim Rechteinhaber.

Die proprietäre Lizenzierung des eigenen Codes ändert die Lizenzen der
eingebundenen Fremdsoftware nicht. Deren Hinweise, Lizenztexte und sonstige
Pflichten werden getrennt ermittelt, dokumentiert und bei der Auslieferung
beibehalten.

Nicht Bestandteil dieses Arbeitspakets sind:

- Kopierschutz, DRM, Online-Aktivierung oder Lizenzschlüssel,
- ein Bezahl-, Kunden- oder Vertragsverwaltungssystem,
- eine Veröffentlichung des Quellcodes,
- die Codesignierung des Windows-Installers und
- funktionale Änderungen an Planung, Berechnungen oder Datenhaltung.

Eine proprietäre Lizenz regelt erlaubte Nutzungen, verhindert aber nicht
technisch das Kopieren oder Untersuchen einer ausgelieferten Anwendung.

## Verbindliche Grundentscheidung

- [x] Der eigene Projektcode soll nicht als Open-Source-Software freigegeben
      werden.
- [x] Die bisherige MIT-Kennzeichnung soll durch eine proprietäre
      Kennzeichnung ersetzt werden.
- [x] Fremdlizenzen bleiben unberührt und werden sichtbar von der Lizenz des
      Dienstplaners getrennt.
- [x] Die Anwendung bleibt vollständig lokal und offline; die Lizenzierung
      führt keine Serverabhängigkeit ein.

## Vorhandene Ausgangslage

- `package.json` enthält aktuell `"license": "MIT"`.
- `package.json` enthält `"private": true`; dies verhindert eine
  versehentliche npm-Veröffentlichung, ist aber keine Lizenzregelung.
- Im Projektstamm existieren weder `LICENSE` noch `COPYING`, `NOTICE` oder eine
  vergleichbare Datei mit vollständigen Nutzungsbedingungen.
- Ein allgemeines `README.md` im Projektstamm ist derzeit nicht vorhanden.
- Die Anwendung wird mit Electron Forge, ASAR und Squirrel für Windows
  paketiert.
- Die direkt verwendeten Laufzeitpakete sind nach den derzeit installierten
  Paketmetadaten unter MIT, ISC oder Apache-2.0 lizenziert.
- Electron liefert eigene Lizenztexte sowie `LICENSES.chromium.html` mit. Eine
  vollständige Prüfung aller tatsächlich ausgelieferten transitiven
  Abhängigkeiten steht noch aus.
- Die Navigationssignatur `Designed & Developed by Rohde · 2026` ist ein
  Gestaltungselement und ersetzt keinen rechtlichen Copyright- oder
  Lizenzhinweis.

## Noch zu bestätigende Angaben

Vor dem Formulieren der endgültigen Lizenzbedingungen müssen folgende Punkte
ausdrücklich festgelegt werden:

1. **Rechteinhaber:** vollständiger bürgerlicher Name oder eine rechtsfähige
   Organisation; `Rohde49` beziehungsweise `Rohde` allein ist hierfür nicht
   automatisch die beste Bezeichnung.
2. **Empfängerkreis:** ausschließlich eigene Nutzung, unentgeltliche Weitergabe
   an ausgewählte Einrichtungen oder kommerzieller Vertrieb.
3. **Nutzungsumfang:** zulässige Anzahl von Benutzern, Geräten oder
   Installationen sowie erlaubte Sicherungskopien.
4. **Weitergabe:** ob und unter welchen Voraussetzungen Installer oder
   Anwendung an andere Personen weitergegeben werden dürfen.
5. **Änderungen und Analyse:** gewünschte Verbote für Bearbeitung,
   Dekompilierung und Reverse Engineering unter ausdrücklichem Vorbehalt
   zwingender gesetzlicher Rechte.
6. **Laufzeit:** unbefristetes oder befristetes Nutzungsrecht sowie mögliche
   Gründe für dessen Beendigung.
7. **Support und Aktualisierungen:** ob hierauf ein Anspruch bestehen soll.
8. **Haftung und Gewährleistung:** gewünschte Regelung unter Beachtung
   zwingenden deutschen Rechts und des Unterschieds zwischen Verbrauchern und
   Unternehmen.
9. **Sprache und Zustimmung:** nur deutsche Bedingungen oder zusätzlich eine
   englische Fassung; reine Bereitstellung oder ausdrückliche Zustimmung vor
   der ersten Nutzung beziehungsweise Installation.

### Empfohlener Ausgangspunkt

Sofern vor der Umsetzung nichts Abweichendes beschlossen wird, soll der
Lizenzentwurf folgenden engen Rahmen abbilden:

- Nutzung nur durch ausdrücklich berechtigte Empfänger,
- Installation und Ausführung ausschließlich als fertige Anwendung,
- eine Sicherungskopie für den eigenen Gebrauch,
- keine Weitergabe, Unterlizenzierung, Vermietung oder Veröffentlichung,
- keine Änderung oder Nutzung des Quellcodes,
- gesetzlich zwingende Rechte bleiben unberührt,
- Updates und Support nur nach gesonderter Zusage und
- alle nicht ausdrücklich eingeräumten Rechte bleiben vorbehalten.

Vor einer entgeltlichen oder breiten externen Verteilung wird der endgültige
Lizenztext rechtlich geprüft. Der technische Umsetzungsplan ersetzt keine
individuelle Rechtsberatung.

## Arbeitspaket 1: Eigene Lizenz und Projektmetadaten

**Ziel:** Das Repository weist den eigenen Code eindeutig und widerspruchsfrei
als proprietär aus.

- [ ] Im Projektstamm eine maßgebliche `LICENSE`-Datei mit dem bestätigten
      Rechteinhaber, dem Copyright-Jahr 2026 und den freigegebenen
      Nutzungsbedingungen anlegen.
- [ ] Ausschließlich einen maßgeblichen vollständigen Lizenztext pflegen;
      Kurzangaben in Anwendung und Dokumentation verweisen auf diesen Text und
      formulieren keine abweichenden Rechte.
- [ ] Den npm-Lizenzwert in `package.json` von `MIT` auf `UNLICENSED` ändern.
- [ ] `private: true` beibehalten, um eine versehentliche npm-Veröffentlichung
      weiterhin zu verhindern.
- [ ] Namen und Kontaktangabe in `package.json` mit dem bestätigten
      Rechteinhaber abgleichen, ohne private Kontaktdaten unnötig in
      Auslieferungsartefakte zu übernehmen.
- [ ] Im Projektstamm ein knappes `README.md` mit Projektbeschreibung,
      proprietärem Lizenzhinweis und Verweisen auf `LICENSE` und
      `THIRD_PARTY_NOTICES` anlegen.
- [ ] Die dauerhafte Projektentscheidung nach der Umsetzung unter
      `docs/projekt/lizenzierung.md` dokumentieren; dieser Umsetzungsplan bleibt
      der Arbeits- und Abschlussnachweis.

**Abnahme:** Im Repository existiert genau eine eindeutige Lizenzierung des
eigenen Codes. Es gibt keine Aussage mehr, die den Dienstplaner selbst als
MIT- oder Open-Source-Projekt ausweist.

## Arbeitspaket 2: Fremdsoftware und Hinweise

**Ziel:** Alle mit Quellcode, Anwendung oder Installer weitergegebenen
Fremdbestandteile bleiben lizenzkonform nachvollziehbar.

- [ ] Direkte und transitive Abhängigkeiten getrennt nach Entwicklungswerkzeug
      und tatsächlich ausgeliefertem Bestandteil inventarisieren.
- [ ] Paketmetadaten nicht ungeprüft übernehmen, sondern maßgebliche
      Lizenzdateien der verwendeten Paketversionen kontrollieren.
- [ ] Eine zentrale `THIRD_PARTY_NOTICES`-Datei mit Paketname, Version,
      Lizenzkennung, Rechteinhaber beziehungsweise Hinweis und erforderlichem
      Lizenztext oder eindeutigem Fundort erstellen.
- [ ] MIT-, ISC-, Apache-2.0- sowie weitere gefundene Hinweis- und
      Weitergabepflichten vollständig berücksichtigen.
- [ ] Electron-Lizenz und `LICENSES.chromium.html` in die Prüfung und
      Auslieferung einbeziehen.
- [ ] Unklare, proprietäre, Copyleft- oder nicht eindeutig lizenzierte
      Abhängigkeiten vor der Auslieferung einzeln bewerten; eine notwendige
      Abhängigkeitsänderung erfordert eine gesonderte Zustimmung.
- [ ] Die Fremdhinweise so formulieren, dass sie keine Rechte am eigenen
      Dienstplaner-Code einräumen.

**Abnahme:** Für jeden tatsächlich ausgelieferten Fremdbestandteil ist
nachvollziehbar, unter welcher Lizenz er verwendet wird und welche Hinweise
mitgeliefert werden müssen.

## Arbeitspaket 3: Rechtliche Hinweise in der Anwendung

**Ziel:** Benutzer können Rechteinhaber, proprietären Status und
Fremdlizenzen ohne Suche im Installationsverzeichnis erkennen.

- [ ] Im bestehenden Navigationsfuß einen dezenten, tastaturbedienbaren Zugang
      zu `Rechtliche Hinweise` ergänzen, ohne die vorhandene Signatur zu
      überladen.
- [ ] In einem zum bestehenden Design passenden Dialog mindestens
      Produktname, Version, Copyright-Hinweis, proprietären Status und einen
      Zugang zu den Fremdlizenzhinweisen anzeigen.
- [ ] Den vollständigen eigenen Lizenztext und die Fremdhinweise aus denselben
      ausgelieferten Quellen anzeigen beziehungsweise öffnen, die auch dem
      Installer beiliegen; keine voneinander abweichenden Textkopien pflegen.
- [ ] Fokusführung, Escape, Tastaturbedienung und lange scrollbare Lizenztexte
      barrierearm umsetzen.
- [ ] Falls eine ausdrückliche Zustimmung erforderlich wird, den bestehenden
      Squirrel-Installationsablauf zunächst auf eine belastbare
      Zustimmungsfunktion prüfen. Ein neuer Installer oder eine neue
      Abhängigkeit wird nicht ohne gesonderte Freigabe eingeführt.

**Abnahme:** Die rechtlichen Hinweise sind in der installierten Anwendung
auffindbar, vollständig lesbar und visuell konsistent. Die bloße Signatur wird
nicht als Lizenzhinweis verwendet.

## Arbeitspaket 4: Paketierung und Installer

**Ziel:** Nicht nur das Repository, sondern auch die tatsächlich ausgelieferte
Windows-Anwendung enthält alle erforderlichen Texte.

- [ ] `LICENSE`, `THIRD_PARTY_NOTICES` sowie erforderliche Electron- und
      Chromium-Hinweise über die Forge-/Packager-Konfiguration gezielt in die
      Anwendung beziehungsweise deren Ressourcen aufnehmen.
- [ ] Verhindern, dass Quellcode, interne Dokumentation oder nicht benötigte
      Entwicklungsdateien allein durch die Lizenzumstellung zusätzlich in den
      Installer gelangen.
- [ ] Mit `npm run package` die entpackte Anwendung prüfen.
- [ ] Mit `npm run make` den Squirrel-Installer erzeugen und sowohl Installer
      als auch installierte Anwendung kontrollieren.
- [ ] Verifizieren, dass die Lizenztexte nach Installation offline erreichbar
      sind und nicht ausschließlich auf externe Webseiten verweisen.
- [ ] Die spätere Codesignierung als separates Auslieferungsarbeitspaket
      behandeln; sie weist Herkunft und Integrität nach, ersetzt aber keine
      Lizenz.

**Abnahme:** Das erzeugte und installierte Produkt enthält die eigene Lizenz
und alle erforderlichen Fremdhinweise. Die Dateien sind auch ohne
Entwicklungsumgebung und Internetverbindung zugänglich.

## Arbeitspaket 5: Prüfung und Dokumentationsabschluss

**Ziel:** Metadaten, Repository, Benutzeroberfläche und Installer treffen
dieselbe überprüfbare Aussage.

- [ ] Automatisiert prüfen, dass `package.json` `UNLICENSED` enthält und die
      maßgeblichen Lizenzdateien vorhanden sind.
- [ ] Einen reproduzierbaren Abgleich der Fremdpakete mit
      `THIRD_PARTY_NOTICES` vorsehen, möglichst ohne neue Abhängigkeit.
- [ ] Dialog und Zugang zu den rechtlichen Hinweisen gezielt testen.
- [ ] Paketinhalt und installierte Dateien auf eigene Lizenz, Fremdhinweise
      sowie versehentlich ausgelieferten Quellcode kontrollieren.
- [ ] `npm test`, `npm run typecheck`, `npm run lint`,
      `npm run format:check` und `git diff --check` erfolgreich ausführen.
- [ ] Rechtliche Hinweise und Installer manuell unter Windows abnehmen.
- [ ] `docs/projekt/lizenzierung.md`, Dokumentationswegweiser und Roadmap nach
      dem tatsächlich erreichten Stand aktualisieren.
- [ ] Vor einem kommerziellen oder breiten externen Vertrieb die endgültigen
      Bedingungen fachjuristisch prüfen lassen.

**Abnahme:** Repository, Anwendung und Installer enthalten keine
widersprüchlichen Lizenzangaben. Technische Prüfungen, visuelle Abnahme und
noch ausstehende rechtliche Prüfung sind getrennt dokumentiert.

## Vorgesehene Reihenfolge

1. Rechteinhaber, Empfängerkreis und Nutzungsumfang bestätigen.
2. Eigenen Lizenztext, Metadaten und dauerhafte Projektdokumentation anlegen.
3. Fremdlizenzen vollständig inventarisieren und Hinweise erstellen.
4. Rechtliche Hinweise in der Anwendung zugänglich machen.
5. Paketierung und Installer ergänzen und tatsächlich prüfen.
6. Technische, visuelle und gegebenenfalls rechtliche Abnahme abschließen.

## Empfohlene Commit-Grenzen

1. Proprietäre Lizenz, Metadaten und Projektdokumentation,
2. Fremdlizenzinventar und Auslieferung der Lizenztexte,
3. rechtliche Hinweise in der Oberfläche samt Tests und
4. Paket-/Installerprüfung sowie Abschlussdokumentation.
