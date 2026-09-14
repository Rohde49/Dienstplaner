# Dokumentationsanalyse der Auswertung

## Einordnung

Diese Datei fasst ausschließlich die zur Auswertung gehörenden Aussagen aus dem `docs`-Ordner des Altsystems am Commit `255036d0d95fa7fbf53e354a36680a08ee4719c1` zusammen. Sie steht eigenständig neben der [Quellcodeanalyse](./quellcodeanalyse.md). Unterschiedliche Aussagen werden hier weder verglichen noch aufgelöst.

Wesentliche Quellen sind:

- `docs/funktionsbereiche/auswertungstabelle.md`,
- `docs/architektur/auswertung.md`,
- `docs/architektur/datenmodell.md`,
- die abgeschlossenen Ablaufpläne zu den Schritten 11, 15 und 16,
- `docs/erledigt.md`, `docs/TODO.md` und
- die Test- und Style-Dokumentation für Prüf- und Darstellungsgrenzen.

## Dokumentierter Zweck

Die Dokumentation beschreibt eine monatliche, mitarbeiterbezogene Auswertung ohne eigene persistierte Entität. Kennzahlen sollen aus Stammdaten, Kalendertagen, gesetzten Planeinträgen und Rufbereitschaften abgeleitet und in einer Tabelle gegenübergestellt werden.

Als zentrale Anforderung wird genannt, dass die Auswertung aus dem aktuellen, noch ungespeicherten Bearbeitungsstand rechnen soll. Dadurch sollen Änderungen während der Dienstplanbearbeitung sichtbar werden, ohne zuerst speichern zu müssen.

## Dokumentierte Darstellung und Benutzerabläufe

Der abgeschlossene Ablaufplan „AuswertungsPage“ legt trotz seines Namens einen Dialog innerhalb der Planungsseite fest, keine eigene Route. Der bestehende Plan soll im Hintergrund erhalten bleiben. Der Auswertungsbutton ist laut Plan nur bei aktivem Dienstplan verfügbar.

Die Darstellung wird als Tabelle mit 15 Kennzahlenzeilen und je einer Spalte pro Erzieher beschrieben. Praktikanten und Wirtschaftskräfte sollen in der vollständigen Auswertung keine eigene Spalte erhalten. Für viele Spalten oder zu geringe Höhe sieht die Dokumentation einen scrollbaren Bereich sowie eine sticky Kennzahlenspalte vor.

Der Planungsraster und die verkürzte Ansicht verwenden laut Dokumentation Teilmengen derselben Berechnungslogik:

- Das Planungsraster zeigt SN/F-Dienste, freie Tage, Soll-Ist-Differenz, Ist und Soll.
- Die verkürzte Ansicht zeigt Ist und Soll.
- Der Auswertungsdialog zeigt die vollständigen 15 Zeilen.

## Dokumentierte Kennzahlen

Die Dokumentation nennt:

1. SN/F-Dienste,
2. freie Samstage,
3. freie Sonntage und Feiertage,
4. gearbeitete Stunden an Sonntagen und Feiertagen,
5. Arbeitszeit gesamt,
6. Nachtbereitschaft gesamt,
7. Arbeitszeit ohne Nachtbereitschaft gesamt,
8. Nachtarbeit gesamt,
9. Nachtzuschlag von 20 Prozent,
10. Nachtbereitschaftszuschlag von 25 Prozent,
11. Anzahl Rufbereitschaften,
12. Anzahl Arbeitstage,
13. Ist-Arbeitszeit,
14. Soll-Arbeitszeit und
15. Differenz Soll/Ist.

Zusätzlich wird „Freie Tage“ als einfachere, nur im Raster verwendete Kennzahl geführt. Sie zählt laut Dokumentation alle mit `/` markierten Einträge unabhängig vom Wochentag und ist nicht als Summe einzelner Wochenendkennzahlen definiert.

## Dokumentierte fachliche Regeln

- SN/F-Dienste werden anhand des Kürzels der gesetzten Planeinträge gezählt.
- Freie Samstage sowie freie Sonntage und Feiertage setzen einen als frei markierten Eintrag voraus; leere Zellen und andere Abwesenheiten zählen nicht.
- Ein Tag, der zugleich Sonntag und Feiertag ist, soll nur einmal berücksichtigt werden.
- Sonntags- und Feiertagsarbeit wird aus den zugehörigen Arbeitszeitwerten der Planeinträge summiert.
- Monatssummen werden aus den gespeicherten Minutenfeldern der Planeinträge abgeleitet.
- Nacht- und Nachtbereitschaftszuschläge werden erst aus der vollständigen Monatssumme berechnet und erst danach auf eine volle Minute gerundet.
- Zuschläge werden separat ausgewiesen und laut den Auswertungsdokumenten nicht zur Ist-Arbeitszeit addiert.
- Rufbereitschaften werden als Anzahl der Zuordnungen einer Person im Monat gezählt.
- Arbeitstage sind Montage bis Freitage abzüglich der gesetzlichen Feiertage in Brandenburg, die auf diese Wochentage fallen.
- Soll-Arbeitszeit verwendet dieselbe monatliche Arbeitstagezahl für alle Erzieher, aber deren jeweilige Wochenarbeitszeit, geteilt durch fünf und gerundet.
- Die Differenz ist als Ist minus Soll mit positivem, neutralem oder negativem Vorzeichen beschrieben.

Die gemeinsame Rundungs-, Datums- und Zeitkonvention ist in der Datenmodelldokumentation festgehalten und in [Berechnungen](../uebergreifend/berechnungen.md) zusammengefasst.

## Technische und architektonische Festlegungen

Die Ablaufpläne ordnen die Berechnung als reine, plattformunabhängige Funktion `shared/auswertung.ts` ein. Begründet wird dies mit dem lokalen, ungespeicherten Entwurf, der im Renderer vorliegt. Mehrere Ansichten sollen dieselbe Berechnungsfunktion verwenden und lediglich unterschiedliche Werte daraus darstellen.

Der Dialog ist als fachspezifische Komponente beschrieben. Zeitformatierung, Rundung, Soll-Ist-Formatierung und Farbauswahl sollen jeweils zentral wiederverwendet werden. Die Auswertung soll keine zusätzliche IPC- oder Repository-Schicht einführen.

## Dokumentierte Zustände und Fehlerfälle

Die Auswertungsdokumente unterscheiden einen aktiven Plan, bei dem der Dialog geöffnet werden kann, von einem Zustand ohne aktiven Plan, in dem der Button deaktiviert sein soll. Der aktuelle Entwurf darf dabei vom gespeicherten Stand abweichen.

Eigenständige Lade-, Fehler- oder Leerzustände für den Dialog werden nicht näher spezifiziert. Allgemeine Fehlerdarstellung, Eingabevalidierung und Prozessgrenzen werden in anderen Dokumentationsbereichen behandelt.

## Dokumentierte Grenzen und offene Inhalte

- Der native Druckdialog und der eigentliche PDF-Export gehören laut den abgeschlossenen Plänen nicht zur Auswertung beziehungsweise zur verkürzten Ansicht.
- `docs/TODO.md` führt den PDF-Export und einen Signaturblock als noch offen.
- Für die spätere Umgestaltung der verkürzten Ansicht zur Druckansicht sind Dokumentationsanpassungen angekündigt.
- `docs/test/offene-maengel.md` dokumentiert, dass die damalige Druckausgabe den letzten Monatstag verlieren kann; dafür existiert ein als erwartbar fehlschlagend markierter E2E-Test.
- Die Style-Dokumentation kennzeichnet ältere Kontrastmesswerte nach einer Farbänderung als nicht mehr aktuell.

Die Ablaufpläne sind ausdrücklich historische Dokumente. Sie halten die geplante schrittweise Umsetzung und damalige manuelle Prüfvorhaben fest; als aktueller Wegweiser verweist der Altsystem-`docs`-Ordner auf Architektur-, Fachbereichs-, Test-, TODO- und Erledigt-Dokumente.
