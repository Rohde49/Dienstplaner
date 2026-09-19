# Gestaltungsgrundsätze

Die Oberfläche des Dienstplaners ist ein professionelles, ruhiges und
übersichtliches Desktop-Arbeitswerkzeug. Gestaltung unterstützt die Orientierung
und tritt gegenüber den Planungsinhalten in den Hintergrund.

Dieses Dokument enthält ausschließlich übergreifende Grundsätze. Fachliches
Verhalten einzelner Bereiche wird in den jeweiligen
[Feature-Dokumenten](../features/planungsseite.md) beschrieben. Konkrete
CSS-Werte, Komponenteneigenschaften und technische Implementierungsdetails
bleiben im Quellcode.

## Designziel

- **Charakter:** professionell, modern und leicht freundlich
- **Informationsdichte:** grundsätzlich ausgewogen, in großen Tabellen bewusst
  kompakt
- **Bedienung:** direkt, vorhersehbar und mit möglichst wenigen Schritten
- **Erscheinungsbild:** klare Flächen, dezente Farben und wenig Dekoration
- **Orientierung:** eindeutige Navigation und erkennbare Seitenüberschriften
- **Sicherheit:** gefährliche oder endgültige Aktionen sind zurückhaltend
  angeordnet und angemessen abgesichert
- **Feedback:** Laden, Speichern, Fehler und notwendige Folgeaktionen sind
  verständlich erkennbar
- **Konsistenz:** gleiche Funktionen werden gleich bezeichnet, dargestellt und
  bedient

Die vertraute tabellarische Grundstruktur eines Dienstplans bleibt erhalten,
ohne das Erscheinungsbild oder die Bedienlogik einer Tabellenkalkulation
nachzuahmen.

## Darstellungsrahmen

- Die Anwendung verwendet ausschließlich ein helles Farbschema.
- Eine mobile Oberfläche und eine individuelle Anpassung des Erscheinungsbilds
  gehören nicht zum vorgesehenen Umfang.
- Das kleinste unterstützte Desktopfenster beträgt `1024 × 700` Pixel.
- Das Hauptfenster startet maximiert, bleibt aber ein normales
  wiederherstellbares Windows-Fenster.
- Inhalte dürfen bei kleineren Fenstern umbrechen oder gezielt horizontal
  scrollen, aber nicht bis zur Unleserlichkeit zusammengedrückt werden.
- Dienstplan und Auswertung nutzen die verfügbare Inhaltsbreite. Einfache
  Verwaltungsbereiche dürfen ihre Inhaltsbreite begrenzen.

Layoutgetreue Dokumentvorschauen stellen eine weiße Ausgabeseite zentriert auf
einer neutralen Arbeitsfläche dar. Bildschirmrand und Schatten unterstützen nur
die räumliche Orientierung und gehören nicht zum Ausgabedokument. Eine
Skalierung darf die festgelegten Umbrüche nicht verändern; bei begrenzter Höhe
hat vertikales Scrollen Vorrang vor unleserlich kleiner Darstellung. Die
jeweilige Feature-Dokumentation legt Seitenformat, Inhalt und Passungsregeln
fest.

## Seitenaufbau und Navigation

Jede Hauptansicht folgt grundsätzlich derselben Reihenfolge:

1. globale Navigation,
2. Seitenkopf mit Titel, kurzer Beschreibung und Hauptaktion,
3. optionale Werkzeug- oder Filterleiste,
4. Seiteninhalt und
5. bei Bedarf dauerhafte Status- oder Fehlerhinweise.

Die Hauptnavigation enthält:

- Dienstplan,
- Team und
- Planungseinträge.

Der Dienstplan ist die Startansicht. Eine zusätzliche Startseite oder ein
Dashboard ist für die lokale Einzelplatzanwendung nicht vorgesehen.

Bei ausreichend breiten Fenstern zeigt die Navigation Symbol und Bezeichnung.
Bei geringerer Breite darf sie auf Symbole reduziert werden, sofern die
Bezeichnungen als zugängliche Namen und verständliche Hinweise erhalten
bleiben.

Die Navigationsleiste bleibt beim Scrollen langer Seiten innerhalb der
Fensterhöhe stehen. Ihre unteren Bedienelemente und der Fußbereich bleiben
dabei erreichbar. Der Fußbereich kennzeichnet die lokale Desktop-Anwendung und
ergänzt in der ausgeklappten Navigation darunter zurückhaltend den Hinweis
„Designed & Developed by Rohde · 2026“. In der eingeklappten Navigation bleibt
die lokale Ausführung über das Symbol und einen zugänglichen Namen erkennbar.

## Typografie und Dichte

- Es wird eine lokal verfügbare, Windows-nahe Systemschrift verwendet.
- Seitentitel, Abschnittsüberschriften, Standardtext und Zusatzinformationen
  besitzen eine klar erkennbare Hierarchie.
- Für die Oberfläche reichen im Regelfall normale, mittlere und halbfette
  Schriftstärken aus.
- Zahlen und Zeitwerte werden so dargestellt, dass Stellen untereinander gut
  vergleichbar bleiben.
- Abstände folgen einem einheitlichen Raster. Zusammengehörige Elemente stehen
  enger beieinander als getrennte Inhaltsbereiche.
- Verwaltungsseiten verwenden normal große Bedienelemente; große
  Planungstabellen dürfen kompakter sein.
- Große Rundungen, starke Schatten und dekorative Flächen werden vermieden.

## Farben

Globale Komponenten verwenden semantische Farbbedeutungen wie:

- Hintergrund und Oberfläche,
- primäre Aktion und Auswahl,
- Information,
- Erfolg,
- Warnung,
- Fehler und
- gefährliche Aktion.

Wiederkehrende globale Farbbedeutungen werden zentral definiert und nicht in
jeder Komponente neu festgelegt. Dadurch bleibt beispielsweise eine Warnung
unabhängig von der verwendeten Komponente als Warnung erkennbar.

Einzelne fach- oder dokumentgebundene Farben dürfen direkt an der zuständigen
Darstellung bleiben, wenn ihre Bedeutung dort eindeutig dokumentiert ist und
sie nicht als wiederverwendbarer globaler Status auftreten. Dazu gehören
beispielsweise besondere Flächen der Planungsauswertung und feste Druckfarben
des A4-Dokuments. Werden dieselben Bedeutungen in mehreren unabhängigen
Komponenten wiederverwendet, sind sie in zentrale semantische Tokens zu
überführen.

Für Farben gelten folgende Regeln:

- Keine Information wird ausschließlich über Farbe vermittelt.
- Statusfarben werden durch Text, Symbol oder Struktur ergänzt.
- Texte und Bedienelemente müssen ausreichenden Kontrast besitzen.
- Rot kennzeichnet außerhalb der Mitarbeiterfarben Fehler, gefährliche
  Aktionen und Feiertage.
- Mitarbeiterfarben dienen ausschließlich der Zuordnung einer Person und sind
  von globalen Statusfarben getrennt.
- Mitarbeiterköpfe dürfen ihre festgelegte Farbe tragen; gewöhnliche
  Planungszellen bleiben neutral.
- Wochenend- und Feiertagskennzeichnungen müssen gegenüber anderen Farben
  eindeutig bleiben; Feiertage haben Vorrang vor Wochenenden.

Die zulässige Mitarbeiterpalette und ihr fachlicher Zweck stehen in der
[Teamverwaltung](../features/teamverwaltung.md). Die genaue Verwendung in der
Planungstabelle beschreibt die [Planungsseite](../features/planungsseite.md).

## Interaktionszustände

Interaktive Elemente unterstützen die für sie relevanten Zustände:

- normal,
- Hover,
- gedrückt,
- ausgewählt,
- deaktiviert,
- beschäftigt und
- fehlerhaft.

Auswahl und Tastaturfokus müssen deutlich voneinander und vom normalen Zustand
unterscheidbar sein. Deaktivierte Elemente dürfen keine Aktion auslösen.
Beschäftigte Aktionen verhindern ein versehentliches Mehrfachauslösen.

Übergänge bleiben kurz und dezent. Verspielte oder dauerhafte dekorative
Animationen sind nicht vorgesehen. Die Einstellung für reduzierte Bewegung des
Betriebssystems wird respektiert.

## Wiederverwendbare Komponenten

Allgemeine Oberflächenbausteine werden zentral wiederverwendet. Dazu gehören
insbesondere:

- Schaltflächen und reine Symbolaktionen,
- Eingabe- und Auswahlfelder,
- Formularfelder mit Hinweis oder Fehler,
- Karten und abgegrenzte Inhaltsbereiche,
- Statuskennzeichnungen und dauerhafte Hinweise,
- Lade- und Leerzustände,
- Dialoge und Bestätigungsdialoge,
- Informations-Popover,
- Seitenköpfe und Werkzeugleisten.

Eine allgemeine Komponente erhält eine klar begrenzte Darstellungs- oder
Interaktionsaufgabe. Fachliche Regeln gehören in das jeweilige Feature und
nicht in globale UI-Komponenten. Dienstplan und andere komplexe Fachtabellen
werden nicht in eine übermäßig allgemeine Tabellenkomponente gezwungen.

Zusätzliche Komponenten, Varianten oder Klassenbibliotheken werden erst
eingeführt, wenn dafür wiederkehrender konkreter Bedarf besteht.

## Formulare

Jedes Formularfeld besitzt:

- eine sichtbare Beschriftung,
- das zugehörige Eingabeelement,
- bei Bedarf einen kurzen Hilfstext und
- eine konkrete Fehlermeldung direkt am Feld.

Pflichtangaben werden verständlich erkennbar. Nach einer fehlgeschlagenen
Prüfung wird der Fokus nach Möglichkeit auf das erste fehlerhafte Feld gesetzt.
Fehlermeldungen erklären, was korrigiert werden muss, und verschwinden nach der
Korrektur.

Formulardialoge besitzen eine eindeutige primäre Aktion und eine Möglichkeit zum
Abbrechen. „Speichern“ steht im Aktionsbereich rechts. Schlägt das Speichern
fehl, bleibt der Dialog mit den Eingaben geöffnet.

## Dialoge und gefährliche Aktionen

- Dialoge besitzen einen eindeutigen Titel und bei Bedarf eine kurze
  Beschreibung.
- Der Fokus wird beim Öffnen sinnvoll gesetzt und nach dem Schließen
  nachvollziehbar zurückgegeben.
- Escape und Tastaturbedienung funktionieren, solange kein laufender kritischer
  Vorgang dadurch unterbrochen würde.
- Endgültiges Löschen benötigt eine Bestätigung, die das konkrete Ziel nennt.
- Während einer Lösch- oder Speicheraktion sind kollidierende Aktionen
  deaktiviert.
- Reine Symbolaktionen besitzen einen zugänglichen Namen und bei Bedarf einen
  sichtbaren Tooltip.

## Rückmeldungen und Fehler

Rückmeldungen folgen dieser Priorität:

1. Fehlermeldung direkt am Eingabefeld,
2. Rückmeldung an der betroffenen Komponente,
3. dauerhafter Hinweis innerhalb der Seite,
4. kurzzeitige Benachrichtigung für abgeschlossene Vorgänge.

Kurzzeitige Benachrichtigungen eignen sich für erfolgreiche, bereits
abgeschlossene Aktionen. Wichtige Fehler, ungespeicherte Änderungen oder
erforderliche Folgeaktionen dürfen nicht ausschließlich in einer automatisch
verschwindenden Meldung stehen.

Bei wahrnehmbaren Lade-, Speicher-, Lösch- oder Exportvorgängen wird ein
Beschäftigtzustand angezeigt. Fehler erscheinen möglichst nahe an ihrer Ursache
und bieten, wenn sinnvoll, einen erneuten Versuch an. Technische Rohmeldungen
sind nicht die einzige Erklärung für den Benutzer.

Verständliche fachliche Meldungen aus der Anwendung bleiben erhalten. Bei
unerwarteten Datei-, Validierungs- oder IPC-Fehlern zeigt die Oberfläche
stattdessen einen zum betroffenen Vorgang passenden Hinweis. Das technische
Original wird für die Fehlersuche protokolliert, aber nicht ungefiltert als
Benutzermeldung ausgegeben.

Häufige kleinteilige Planungsschritte erzeugen keine eigene
Erfolgsbenachrichtigung. Ihre Wirkung wird direkt am bearbeiteten Inhalt und über
den Speicherstatus sichtbar.

## Leere Zustände

Ein leerer Bereich zeigt nicht nur eine leere Tabelle. Er erklärt knapp:

- welche Daten fehlen,
- warum der Bereich noch leer ist und
- welche sinnvolle nächste Aktion möglich ist.

Ein Leerzustand darf keine Aktion anbieten, die im aktuellen Zustand nicht
ausgeführt werden kann.

## Barrierearme Bedienung

- Alle wesentlichen Funktionen sind mit der Tastatur erreichbar.
- Der Tastaturfokus ist sichtbar.
- Beschriftungen und zugängliche Namen ordnen Bedienelemente eindeutig zu.
- Informationen werden nicht ausschließlich über Farbe, Position oder ein
  unbeschriftetes Symbol vermittelt.
- Statusänderungen und Fehlermeldungen sind für assistive Technik angemessen
  ausgezeichnet.
- Die Fokusreihenfolge folgt der sichtbaren und fachlichen Reihenfolge.
- Vergrößerung und kleinere unterstützte Fenster dürfen keine wesentlichen
  Funktionen unerreichbar machen.
