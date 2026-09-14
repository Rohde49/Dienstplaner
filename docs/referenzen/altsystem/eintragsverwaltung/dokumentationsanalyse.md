# Dokumentationsanalyse der Eintragsverwaltung

## Untersuchungsrahmen und Dokumentarten

Diese Zusammenfassung stützt sich ausschließlich auf die Dokumentation des Altsystems am Commit `255036d0d95fa7fbf53e354a36680a08ee4719c1`. Sie beschreibt die dort formulierten Ziele, Regeln und Entscheidungen eigenständig; sie ist keine Vergleichs- oder Abweichungsanalyse zum Quellcode oder zu einem anderen Projekt.

Die wichtigsten Dokumentquellen sind:

- `docs/funktionsbereiche/eintrag-verwaltung.md` als fachliche, technologieunabhängige Beschreibung;
- `docs/architektur/datenmodell.md` für Entität, Beziehungen und Konventionen;
- `docs/funktionsbereiche/eintraege-setzen.md` für die spätere Nutzung im Dienstplan;
- die historischen, als abgeschlossen markierten Ablaufpläne `schritt5-eintrag-verwaltung.md` und `schritt13-eintragsdefinition-loeschen.md`;
- `docs/erledigt.md` und das Entwicklungstagebuch als Ergebnis- und Entscheidungsprotokoll;
- die Architektur-, Design- und Testdokumente für Prozessgrenzen, Fehlerbehandlung, Barrierefreiheit und Prüfebenen.

Die Ablaufpläne kennzeichnen sich ausdrücklich als historische Prompt-Verläufe, die nach späteren Weiterentwicklungen nicht rückwirkend aktualisiert werden. Für die fachliche Zusammenfassung sind daher die Funktionsbereichs- und Architekturdokumente maßgeblich; die Ablaufpläne erklären vor allem Entstehung und vorgesehenen Arbeitsablauf.

## Ziel und fachlicher Zweck

Die Eintragsverwaltung ist laut Dokumentation die Stammdatenpflege für alle Eintragsarten, die einem Mitarbeiter an einem Tag zugewiesen werden können. Dazu zählen feste Dienste wie Früh- oder Spätdienst ebenso wie mitarbeiterabhängige Abwesenheiten, etwa Urlaub oder Krankheit.

Die Eintragsarten bilden die Auswahlliste der Planungsoberfläche. Die Verwaltung ist damit ein vorbereitender Bereich; der eigentliche Nutzen entsteht beim Befüllen eines Dienstplans. Das Design-System ordnet Team- und Eintragsverwaltung ausdrücklich dieser Vorbereitung unter und betrachtet die Planung als Kernaufgabe der Anwendung.

## Beschriebene Daten und Begriffe

Eine `Eintragsdefinition` besteht aus:

- eindeutiger numerischer ID;
- Kürzel und Name;
- Berechnungsart `fest` oder `mitarbeiterabhaengig`;
- optionalem Beginn und Ende als Uhrzeiten im Format `HH:MM`;
- Anwesenheitszeit;
- Arbeitszeit gesamt;
- Arbeitszeit ohne Nachtbereitschaft;
- Nachtbereitschaft;
- Nachtarbeit.

Die fünf Zeitwerte gliedern nach der Dokumentation dieselbe geleistete Zeit aus verschiedenen fachlichen Blickwinkeln. Arbeitszeit gesamt setzt sich aus Arbeitszeit ohne Nachtbereitschaft und Nachtbereitschaft zusammen; Anwesenheitszeit umfasst zusätzlich Pausen; Nachtarbeit ist ein Anteil der Arbeitszeit ohne Nachtbereitschaft. Ein eigenes Feld für Arbeitszeit ohne sämtliche Nachtanteile ist bewusst nicht vorgesehen.

Zeitpunkte und Zeitdauern werden klar getrennt: Beginn und Ende bleiben Uhrzeit-Zeichenketten, Dauern werden intern als nichtnegative ganze Minuten geführt und nur an der Ein-/Ausgabe als Stunden und Minuten dargestellt. Für die übergreifende Modell- und Speicherperspektive siehe [`../uebergreifend/datenmodell-und-datenhaltung.md`](../uebergreifend/datenmodell-und-datenhaltung.md).

## Fachliche Regeln

### Berechnungsarten

Bei `fest` werden die Zeitwerte unabhängig vom Mitarbeiter als Stammdaten gepflegt. Auch eine feste Definition darf ohne Beginn oder Ende existieren, beispielsweise eine ganztägige Fortbildung mit fester Dauer, aber ohne feste Uhrzeit.

Bei `mitarbeiterabhaengig` pflegt die Teamleitung laut aktuellem Fach- und Datenmodelldokument nur Kürzel, Name und Berechnungsart. Beginn und Ende bleiben `null`, alle fünf Zeitwerte auf Stammdatenebene `0`. Der eigentliche Arbeitszeitwert entsteht erst beim Setzen im Dienstplan aus der Wochenarbeitszeit des gewählten Mitarbeiters: Wochenarbeitszeit geteilt durch fünf, auf die nächste volle Minute gerundet; eine exakte halbe Minute wird aufgerundet.

Das Entwicklungstagebuch hält fest, dass diese Regel nach einem ersten Live-Test fachlich präzisiert wurde. Eine anfängliche Fassung hatte nur vier Zeitwerte deaktiviert und Arbeitszeit weiterhin als Eingabe verlangt. Die spätere Festlegung umfasst ausdrücklich alle fünf Werte. Der alte Ablaufplan bleibt wegen seines historischen Charakters teilweise auf dem früheren Zwischenstand.

Die gesamten Rechenregeln des Altsystems sind in [`../uebergreifend/berechnungen.md`](../uebergreifend/berechnungen.md) zusammengeführt.

### Plausibilität und Eindeutigkeit

Die Anwendung soll das Format, aber nicht die rechnerische Plausibilität der fünf Zeitwerte prüfen. Insbesondere bleibt die Teamleitung dafür verantwortlich, dass Summen und Teilwerte fachlich zusammenpassen. Beginn und Ende werden ebenfalls nicht zur Dauerberechnung herangezogen und müssen nicht in zeitlicher Reihenfolge stehen.

Kürzel sind bewusst nicht eindeutig. Mehrere Definitionen dürfen dasselbe Kürzel für unterschiedliche Zeitvarianten tragen. Die ID ist der technische Schlüssel. Auswertungen, die nach Kürzeln filtern, dürfen daher nicht von einer eindeutigen Eintragsdefinition ausgehen.

### Dienste über Mitternacht

Ein über Mitternacht laufender Dienst wird dokumentarisch als zwei manuell gesetzte Planeinträge an zwei Kalendertagen beschrieben. Dafür können zwei Eintragsdefinitionen mit gleichem Kürzel, aber unterschiedlichen Beginn-/Ende-Varianten verwendet werden. Die Anwendung soll keinen Folgeeintrag automatisch erzeugen, verändern oder entfernen.

## Beschriebene Bedienabläufe

Der abgeschlossene Ablaufplan für Schritt 5 beschreibt einen schrittweisen Aufbau der Verwaltungsoberfläche:

1. Liste aller Definitionen anzeigen;
2. Zeitpunkte und Dauern passend formatieren und fehlende Uhrzeiten sinnvoll darstellen;
3. Definitionen mit allen Feldern anlegen;
4. berechnungsartabhängige Felder sperren beziehungsweise vorbelegen;
5. dasselbe Formular zum Bearbeiten vorbefüllen und wiederverwenden;
6. nach SQLite-Umstellung Persistenz über einen Neustart prüfen.

Die Ergebnisdokumentation beschreibt eine elfspaltige Tabelle mit einer zusätzlichen Aktionsspalte und ein gestapeltes Layout. Die Tabelle und das Formular liegen untereinander, weil eine feste Seitenspalte für die breite Tabelle nicht genügte. Ein gemeinsamer Verwaltungsheader liefert Rückweg, Titel und Primäraktion.

Für die weitere Verwendung im Dienstplan beschreibt `eintraege-setzen.md` einen Auswahlablauf: Die Teamleitung öffnet an einer Mitarbeiter-/Tag-Zelle eine Liste der Eintragsdefinitionen, wählt eine Definition oder „Kein Eintrag“ und bearbeitet damit zunächst einen lokalen Planentwurf. Beginn, Ende, Kürzel und Zeitwerte werden beim Setzen als Snapshot übernommen. Gespeichert wird erst über den allgemeinen Speichern-Ablauf der Planung.

Die Navigation und die Rolle von Renderer, Preload und Main-Prozess werden übergreifend in [`../uebergreifend/architektur-und-navigation.md`](../uebergreifend/architektur-und-navigation.md) beschrieben.

## Änderungs- und Löschregeln

Bereits gesetzte Planeinträge behalten laut Dokumentation eine vollständige Kopie der damals gewählten Werte. Spätere Änderungen an der Eintragsdefinition verändern deshalb bestehende Dienstpläne nicht rückwirkend.

Eine Eintragsdefinition darf auch dann gelöscht werden, wenn sie bereits als Vorlage für einen Planeintrag verwendet wurde. Die Löschfunktion braucht keine Verwendungsprüfung, weil der bestehende Planeintrag seinen Snapshot behält. Vorgesehen sind ein Löschen-Button ausschließlich im Bearbeitungsmodus, ein Bestätigungsdialog mit Hinweis auf die Unumkehrbarkeit und anschließend das Neuladen der Definitionsliste. Anders als beim Löschen eines Mitarbeiters ist kein fachlicher Ablehnungsfall vorgesehen.

## Architekturfestlegungen

Die Dokumentation ordnet die Eintragsverwaltung in die allgemeine Electron-Schichtung ein:

- React-Seite und fachspezifische Komponenten halten Anzeige- und Formularzustand im Renderer;
- reine Validierungen liegen in `renderer/src/lib`, prozessübergreifend geeignete Zeitfunktionen in `shared`;
- der Renderer nutzt ausschließlich die typisierte `window.api`-Brücke;
- zentrale IPC-Kanalnamen verbinden Preload und Main-Handler;
- ein Repository kapselt den vollständigen SQL-Zugriff;
- die SQLite-Verbindung wird dem Repository und den Handlern als Parameter übergeben;
- nur `src/main/index.ts` öffnet die Datenbank und verdrahtet die Handler.

Die dokumentierte Arbeitsreihenfolge für neue Fachbereiche lautet: Entität, reine Funktionen mit Tests, Repository-Schnittstelle, IPC/Preload, UI, echtes SQLite, Repository-Tests und Gesamtverifikation. Die Eintragsverwaltung wird als Umsetzung dieses Musters beschrieben.

Für Details der Prozessgrenze und zentralen IPC-Struktur verweist diese Analyse auf [`../uebergreifend/architektur-und-navigation.md`](../uebergreifend/architektur-und-navigation.md).

## Zustände, Validierung und Fehler

Die Dokumentation unterscheidet fachliche Eingabefehler von technischen Fehlern:

- Fachlich-formal sollen leere Pflichtfelder, unbekannte Berechnungsarten, ungültige Uhrzeiten, ungültige Dauern und die Nullregel der mitarbeiterabhängigen Definition erkannt werden.
- Technische Fehler aus IPC oder Datenbank sollen seitenübergreifend sichtbar sein, ihre Ursache lesbar anzeigen und nicht automatisch verschwinden.
- Die Eingabevalidierung liegt laut Architektur- und Mängeldokument im Renderer. Der Main-Prozess validiert Eingaben nicht erneut; dies ist als allgemeiner, noch nicht abschließend entschiedener Mangel registriert.

Die fachliche Beschreibung legt keinen besonderen Ladezustand, keine Erfolgsnachricht und keine leere Tabellenansicht verbindlich fest. Der historische Ablaufplan verlangt lediglich eine sinnvolle Listendarstellung und die Anzeige fehlender Uhrzeiten, beispielsweise als Gedankenstrich.

Die Fehler- und Validierungsstrategie ist ausführlicher in [`../uebergreifend/fehlerbehandlung-und-validierung.md`](../uebergreifend/fehlerbehandlung-und-validierung.md) zusammengefasst.

## Komponenten- und Barrierefreiheitsfestlegungen

Die Eintragsverwaltung soll die allgemeinen UI-Primitives und die gemeinsamen Verwaltungs-Layouts wiederverwenden. Als bereichsspezifische Komponenten benennt die Dokumentation Tabelle und Formular. `StackedManagementLayout` ist die bewusste Variante für die breite Tabelle; `Collapsible` besitzt keine eigene Optik und wird nur an dieser Stelle ausgestaltet.

Für die Planungsauswahl dokumentiert die Barrierefreiheitsanalyse eine nachträgliche Entscheidung für echte Button-Zeilen statt klickbarer Tabellenzeilen. Dadurch soll die Auswahl nicht nur mit der Maus, sondern auch per Tastatur bedienbar sein. Formularelemente, Löschdialog und Fehlerflächen sollen über zugängliche Rollen und Beschriftungen erreichbar sein.

Siehe dazu [`../uebergreifend/komponenten-und-tests.md`](../uebergreifend/komponenten-und-tests.md).

## Dokumentierte Prüfstrategie und Nachweise

Die allgemeine Teststrategie unterscheidet fünf Ebenen: reine Fachfunktionen, Repository/SQLite, React-Komponenten, IPC-Vertrag und E2E-Durchstich. Für die Eintragsverwaltung protokollieren Ablaufplan, Erledigt-Liste und Tagebuch insbesondere:

- Unit-Tests für Uhrzeit-, Dauer- und Definitionseingaben;
- Repository-Tests gegen In-Memory-SQLite;
- Prüfung von `null` bei Beginn und Ende sowie des Wechsels zwischen Berechnungsarten;
- einen Löschtest mit weiterbestehendem Planeintrag-Snapshot;
- damalige Sichtprüfungen für Anlegen, Bearbeiten, Feldsteuerung und Löschen;
- damalige Neustartprüfungen für Persistenz.

Diese Angaben sind historische Dokumentation von durchgeführten Entwicklungsschritten, keine in dieser Analyse erneut ausgeführten Prüfungen. Die später ausgebaute Teststrategie verlangt für Oberflächenverhalten grundsätzlich Komponententests und für den vollständigen Prozessdurchstich wenige E2E-Fälle.

## Grenzen und offene beziehungsweise geplante Inhalte

Das fachliche Funktionsbereichsdokument erklärt die Modellierung der Eintragsverwaltung für abgeschlossen und nennt keine offenen fachlichen Punkte. Bewusst außerhalb ihres Umfangs liegen:

- automatische Plausibilitätsberechnungen zwischen den fünf Zeitwerten;
- automatische Behandlung über Mitternacht laufender Dienste;
- rückwirkende Aktualisierung bereits gesetzter Planeinträge;
- eine Eindeutigkeitsregel für Kürzel;
- Rufbereitschaft, Tagesbemerkungen und die gesamte Planpersistenz, soweit sie nicht die Auswahl beziehungsweise Snapshots der Eintragsdefinition betreffen.

Projektweit offen bleibt laut Mängelregister die Entscheidung, ob Eingaben zusätzlich im Main-Prozess validiert werden sollen. Die übrigen in `TODO.md` genannten nächsten Schritte betreffen Druck/PDF, Packaging und Infrastruktur, nicht eine fachliche Erweiterung der Eintragsverwaltung.

Als dokumentarische Grenze ist außerdem zu beachten: Die abgeschlossenen Ablaufpläne sind Entwicklungsprotokolle. Sie enthalten frühere Zwischenstände und geplante Prüfungen, während Funktionsbereich, Datenmodell, Erledigt-Liste und spätere Tagebucheinträge die nachträglich konsolidierten Festlegungen festhalten.
