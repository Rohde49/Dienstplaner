# Dokumentationsanalyse der Teamverwaltung im Altsystem

## Analysebasis und Abgrenzung

Diese Zusammenfassung verwendet ausschließlich die Dokumentation des Altsystems am Commit
`255036d0d95fa7fbf53e354a36680a08ee4719c1`. Maßgeblich ausgewertet wurden:

- `docs/funktionsbereiche/team-verwaltung.md`,
- `docs/architektur/datenmodell.md`,
- `docs/architektur/prozessgrenzen.md`,
- `docs/architektur/projektstruktur.md`,
- `docs/style/design-system.md` und `docs/style/barrierefreiheit.md`,
- `docs/test/teststrategie.md` und `docs/test/offene-maengel.md`,
- die historischen Ablaufpläne `schritt4-team-verwaltung.md` und
  `schritt12-teammember-loeschen.md`,
- `docs/erledigt.md` und `docs/TODO.md`.

Die Datei beschreibt die Dokumentationsaussagen eigenständig. Sie ist ausdrücklich keine
Vergleichs- oder Widerspruchsanalyse gegenüber dem Quellcode oder dem aktuellen Projekt.
Historische Ablaufpläne werden als Entwicklungs- und Entscheidungsprotokolle behandelt,
nicht als unveränderter aktueller Stand.

## Ziel und fachliche Rolle

Die Teamverwaltung ist laut Funktionsbereichsdokument die Stammdatenpflege für genau eine
Wohngruppe beziehungsweise ein Team. Sie soll Mitarbeiter anlegen, anzeigen, bearbeiten
und löschen. Eine eigene Team- oder Gruppenentität ist bewusst nicht vorgesehen, weil eine
Installation nur ein Team abbildet.

Die Mitarbeiterstammdaten bilden die Grundlage für die weiteren Funktionsbereiche:
Dienste und sonstige Einträge werden Personen zugeordnet, Rufbereitschaften wählen aus dem
Team aus, und Auswertungen werden pro Mitarbeiter berechnet.

## Dokumentierte Daten

Ein Mitarbeiter umfasst:

- Vorname und Nachname,
- eine Rolle aus der geschlossenen Menge `Erzieher`, `Praktikant` und
  `Wirtschaftskraft`,
- die Wochenarbeitszeit als Zeitdauer,
- eine Farbe aus einer festen Palette.

Die Wochenarbeitszeit soll an der Oberfläche als Stunden und Minuten erscheinen, intern
aber als Minutenzahl gespeichert werden. Die Dokumentation begründet dies mit sicheren
Summen- und Soll-/Ist-Berechnungen ohne wiederholtes Parsen von Textwerten.

Die Farbpalette ist keine frei editierbare Stammdatentabelle. Sie besteht aus zehn
vorgegebenen, kräftigen und unterscheidbaren Werten. Zu jedem Wert gehört ein sprechender
deutscher Name, damit die Auswahl nicht ausschließlich über Farbe oder einen Hex-Code
kommuniziert wird. Die Farbe dient in der Planung als Personenkennzeichnung und ist von
Theme- und Statusfarben getrennt.

Technische Querschnittsdetails zu Entitäten, IDs, SQLite und Zeitkonventionen werden in
[`../uebergreifend/datenmodell-und-datenhaltung.md`](../uebergreifend/datenmodell-und-datenhaltung.md)
zusammengeführt. Berechnungsfolgen der Wochenarbeitszeit stehen in
[`../uebergreifend/berechnungen.md`](../uebergreifend/berechnungen.md).

## Dokumentierte Abläufe

### Anzeigen und Laden

Die Teamseite soll den vorhandenen Mitarbeiterbestand anzeigen. Der ursprüngliche
Ablaufplan entwickelte dies zunächst gegen Repository-Signaturen und Testdaten und stellte
die Datenhaltung anschließend auf SQLite um. Die dauerhafte Speicherung über einen
Anwendungsneustart hinweg war Teil der vorgesehenen manuellen Gesamtverifikation.

### Anlegen

Das Formular soll Vorname, Nachname, Rolle, Wochenarbeitszeit und Farbe erfassen. Vor dem
Absenden werden die Pflichtfelder, die geschlossene Rollenmenge, eine positive
Wochenarbeitszeit und die Zugehörigkeit zur Farbpalette geprüft. Nach erfolgreichem
Anlegen soll die neue Person in der Liste erscheinen.

### Bearbeiten

Der fachliche Funktionsbereich nennt Bearbeiten als vollständigen Teil der
Stammdatenpflege. `docs/erledigt.md` hält fest, dass die Teamverwaltung nach dem ersten
Ablaufplan anhand eines Nutzer-Mockups nachbearbeitet wurde; dazu gehörten die
Bearbeiten-Funktion, eine echte Tabelle und das gemeinsame Management-Layout.

### Löschen

Löschen erfolgt aus dem bestehenden Bearbeitungsformular und nur nach einer
Bestätigungsabfrage. Das Ergebnis soll kontrolliert behandelt werden:

- Eine nie verwendete Person kann gelöscht werden und verschwindet aus der Liste.
- Sobald ein regulärer Planeintrag oder eine Rufbereitschaft auf die Person verweist, wird
  Löschen blockiert.
- Die Ablehnung wird nicht als technischer Ausnahmefehler beschrieben, sondern als
  Ergebnis mit einem verständlichen Grund, der im vorhandenen Fehlerbereich des Formulars
  erscheint.

Die Begründung ist der Schutz der Planungshistorie. Ein kaskadierendes Entfernen der
historischen Zuordnungen und unsichtbar werdende Zuordnungen sollen vermieden werden.

## Geschäftsregeln

Die Dokumentation legt folgende bereichsspezifische Regeln fest:

1. Die Anwendung bildet nur ein einzelnes Team ab.
2. Vorname und Nachname sind Pflichtangaben.
3. Rollen sind fest vorgegeben und nicht frei administrierbar.
4. Die Wochenarbeitszeit ist eine Dauer und wird intern in Minuten geführt.
5. Die Wochenarbeitszeit muss positiv sein.
6. Die Farbe muss aus der festen, benannten Palette stammen.
7. Eingaben werden vor dem dauerhaften Speichern validiert.
8. Ein verwendeter Mitarbeiter darf nicht gelöscht werden.
9. Nur Erzieher sind für Rufbereitschaft und die vollständige Auswertungstabelle relevant;
   Praktikanten und Wirtschaftskräfte bleiben in diesen beiden Verwendungen außen vor.

Die fachlichen Auswirkungen auf Planung und Auswertung werden hier nicht erneut
ausgeführt; siehe [`../uebergreifend/berechnungen.md`](../uebergreifend/berechnungen.md).

## Architekturfestlegungen

Die Teamverwaltung war der erste vollständige Fachbereich und diente laut
`docs/erledigt.md` als Blaupause für spätere Bereiche. Der dokumentierte Aufbau lautet:

1. gemeinsamer Entitätstyp und Konstanten,
2. reine Konvertierungs- und Validierungsfunktionen mit Unit-Tests,
3. Repository-Signaturen zunächst mit Testdaten,
4. IPC-Handler und typisierte Preload-API,
5. Oberfläche gegen diese Schnittstelle,
6. Umstellung des Repositorys auf SQLite,
7. Repository-Tests gegen In-Memory-SQLite,
8. Gesamtverifikation.

Repositorys und IPC-Handler erhalten die Datenbankverbindung als Parameter. Die konkrete
Verdrahtung liegt zentral beim Anwendungsstart. Der Renderer greift ausschließlich über
die eng definierte `window.api`-Brücke zu; der Preload enthält keine Fachlogik. Die
vollständige Architektur- und Navigationsdarstellung steht in
[`../uebergreifend/architektur-und-navigation.md`](../uebergreifend/architektur-und-navigation.md).

Für die Oberfläche ist ein gemeinsames Management-Muster dokumentiert: Kopfbereich mit
Rückweg und Hauptaktion sowie Liste und Detailformular. Wiederkehrende UI-Bausteine sollen
zentral verwendet werden. Farbe darf nie die einzige Information sein, gleichnamige
Bearbeiten-Schaltflächen benötigen Personenkontext, Fehlerflächen sollen assistiv
angekündigt werden, und Fokuszustände müssen sichtbar bleiben. Die zentrale Komponenten-
und Testeinordnung steht in
[`../uebergreifend/komponenten-und-tests.md`](../uebergreifend/komponenten-und-tests.md).

## Zustände und Fehler

Die Dokumentation beschreibt für die Teamverwaltung folgende Zustände beziehungsweise
Rückmeldungen:

- Formular im Anlegen-Modus,
- Formular im Bearbeiten-Modus mit zusätzlicher Löschaktion,
- sichtbare Validierungsfehler vor dem Absenden,
- geöffnete Sicherheitsabfrage vor dem Löschen,
- blockiertes Löschen mit verständlichem Grund im Formular,
- erfolgreiche Anlage beziehungsweise Löschung, erkennbar an der aktualisierten Liste.

Technische Fehler aus der Prozess- oder Datenbankschicht und die globale Fehleranzeige
sind Querschnittsthemen; siehe
[`../uebergreifend/fehlerbehandlung-und-validierung.md`](../uebergreifend/fehlerbehandlung-und-validierung.md).

Ein eigener Ladezustand, ein Speicherfortschritt, ein expliziter technischer
Nicht-gefunden-Zustand und eine Erfolgsmeldung werden in den teambezogenen Dokumenten
nicht als fachliche Anforderung ausgearbeitet. Der aktuelle Testmängelkatalog hält
außerdem als offene Architekturfrage fest, dass die Eingabevalidierung nur im Renderer
liegt und der Main-Prozess Eingaben nicht erneut prüft.

## Test- und Verifikationsziele

Die Dokumentation ordnet die Prüfungen mehreren Ebenen zu:

- reine Validierung und Zeitumrechnung ohne I/O,
- Repository- und Löschregeln gegen echtes In-Memory-SQLite,
- Teamseite mit echten Kindkomponenten und einer ersetzten `window.api`-Grenze,
- Vollständigkeit der IPC-Registrierung,
- ein schmaler E2E-Durchstich über Renderer, IPC, SQLite-Datei und Neustart.

Die historischen Ablaufpläne forderten zusätzlich manuelle Sichtprüfungen der Liste,
Formulare, Löschbestätigung und Fehlermeldung sowie eine Neustartprüfung der Persistenz.
Die Dokumentation unterscheidet damit schnelle fachliche Tests von wenigen vollständigen
Prozessdurchstichen. Einzelheiten der Testarchitektur stehen in
[`../uebergreifend/komponenten-und-tests.md`](../uebergreifend/komponenten-und-tests.md).

## Grenzen

- Es gibt keine zweite Wohngruppe und keine Teamverwaltung oberhalb der Mitarbeiter.
- Rollen können nicht ergänzt, umbenannt oder gelöscht werden.
- Farben können nicht frei definiert werden.
- Bereits verplante Personen können nicht entfernt werden.
- Nur Erzieher werden für Rufbereitschaft und die vollständige Auswertung berücksichtigt.
- Die Teamverwaltung pflegt Stammdaten; Planung, Eintragsdefinitionen und Auswertung sind
  eigene Funktionsbereiche.
- Die teambezogene Dokumentation spezifiziert keinen Import, Export, Massenbearbeitung,
  Sortierdialog, Suche oder Filterung.

## Offene und geplante Inhalte

### Inaktiv statt Löschen

Als unpriorisierte Idee ist ein Status „inaktiv“ für ausgeschiedene Mitarbeiter
dokumentiert. Er wäre fachlich passender als die harte Löschsperre, weil Personen mit
Planungshistorie erhalten bleiben könnten, ohne weiterhin als aktiv angeboten zu werden.
Der Status wurde bewusst nicht umgesetzt und ist nicht zugesagt.

### Validierung im Main-Prozess

Der Mängelkatalog lässt offen, ob Eingaben zusätzlich im Main-Prozess geprüft oder die
Architekturdokumentation an die reine Rendererprüfung angepasst werden soll. Für die
Teamverwaltung bedeutet dies insbesondere, dass die dokumentierten Formularregeln bisher
keine ausdrücklich festgelegte zweite Schutzschicht an der IPC-Grenze haben.

### Frei verwaltbare Rollen

Eine eigene Rollenentität wird nur als möglicher späterer Umbau genannt, falls Rollen
künftig durch Nutzer frei verwaltet werden sollen. Für den beschriebenen Stand bleibt die
geschlossene Dreiermenge die Festlegung.
