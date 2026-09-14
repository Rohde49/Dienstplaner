# Planungsseite – Dokumentationsanalyse

## Untersuchungsrahmen

Diese Zusammenfassung beruht ausschließlich auf dem `docs`-Ordner des Altsystems `Rohde49/dienstplan-app` am Commit `255036d0d95fa7fbf53e354a36680a08ee4719c1`. Sie steht eigenständig neben der Quellcodeanalyse und nimmt keinen Abgleich mit ihr vor.

Die fachlichen Hauptquellen sind `funktionsbereiche/dienstplan-geruest.md` und `funktionsbereiche/eintraege-setzen.md`. Ergänzend beschreiben `architektur/datenmodell.md`, `architektur/auswertung.md`, `architektur/prozessgrenzen.md`, die abgeschlossenen Ablaufpläne der Schritte 6 bis 16, `erledigt.md`, `TODO.md` und die Testdokumentation den geplanten beziehungsweise festgehaltenen Stand.

Querschnittsthemen werden ausführlicher in [Architektur und Navigation](../uebergreifend/architektur-und-navigation.md), [Datenmodell und Datenhaltung](../uebergreifend/datenmodell-und-datenhaltung.md), [Fehlerbehandlung und Validierung](../uebergreifend/fehlerbehandlung-und-validierung.md), [Komponenten und Tests](../uebergreifend/komponenten-und-tests.md) und [Berechnungen](../uebergreifend/berechnungen.md) zusammengefasst.

## Beschriebene Ziele und Aufgaben

Die Dokumentation teilt die Planungsseite fachlich in zwei aufeinander aufbauende Aufgaben:

1. Für einen gewählten Monat und ein Jahr ein leeres Dienstplangerüst mit allen Kalendertagen erzeugen.
2. Dieses Gerüst mit regulären Planungseinträgen, Rufbereitschaften und kurzen Tagesbemerkungen füllen.

Mehrere Dienstpläne für denselben Monat sind ausdrücklich zulässig. Titel sowie Erstellungs- und Änderungszeitpunkt unterstützen die Verwaltung mehrerer Planstände. Der Bearbeitungsablauf soll bewusst über „Erstellen“, „Speichern“ und „Laden“ erfolgen; Autosave ist nicht vorgesehen. Dadurch soll erkennbar bleiben, ob ein gespeicherter Stand oder ein lokaler Entwurf bearbeitet wird.

Die Planungsoberfläche wird als monatliche Tabelle beschrieben: Datum links, pro Mitarbeiter Eintrag/Beginn/Ende, anschließend Rufbereitschaft und Bemerkung. Eine verkürzte Form dient als kompakte, rein lesende Druckvorschau. Eine Auswertung ergänzt die Planung als Dialog und berechnet ihre Werte aus dem aktuellen Entwurf.

## Dokumentierte Benutzerabläufe

### Vorschau und Erstellen

Im Ausgangszustand sind Monat und Jahr wählbar, der optionale Titel kann eingegeben werden und das Raster zeigt berechnete Kalendertage ohne persistierte Tageszeilen. „Erstellen“ legt den Plan und alle Tage des Monats zusammenhängend an. Danach werden Monat und Jahr gesperrt.

### Plan bearbeiten

Reguläre Einträge werden über ein Popover für die gemeinsam behandelten Zellen Eintrag/Beginn/Ende ausgewählt. „Kein Eintrag“ entfernt die Zuordnung. Rufbereitschaft verwendet ein eigenes Popover mit „Keine Rufbereitschaft“. Bemerkungen werden direkt in der Tabellenzelle eingegeben.

Alle drei Änderungsarten sowie Titeländerungen verbleiben zunächst in einem lokalen Entwurf. Von der gespeicherten Baseline abweichende Zellen sollen einen dezenten Punkt erhalten. Der Dirty-Status steuert eine Warnung, bevor „Laden“, „Neu anlegen“ oder das Verlassen zur Startseite den Entwurf verwerfen würden.

### Speichern

Der Speichern-Ablauf soll Titel und nur die tatsächlich geänderten Zellen gesammelt übertragen. Die Dokumentation legt für reguläre Einträge und Rufbereitschaften ein Löschen-und-gegebenenfalls-Neuanlegen fest; Bemerkungen werden aktualisiert. Sämtliche Änderungen eines Speichervorgangs sollen gemeinsam in einer Transaktion verarbeitet werden. Nach erfolgreichem Speichern wird der neue Stand zur Baseline.

### Laden

Der Ladedialog ist in jedem Seitenzustand erreichbar. Er soll alle Pläne mit ID, Titel, Monat, Jahr sowie Erstellungs- und Änderungszeit anzeigen und nach letzter Änderung absteigend sortieren. Eine Auswahl lädt Plan, Tageszeilen, Planungseinträge und Rufbereitschaften. Schließen ohne Auswahl lässt den bisherigen Zustand bestehen.

### Löschen

Ein Dienstplan wird ausschließlich aus der Laden-Liste gelöscht. Pro Zeile ist ein eigener Lösch-Icon-Button vorgesehen, der nicht gleichzeitig die Zeilenauswahl auslösen darf. Vor dem Löschen nennt ein Bestätigungsdialog Titel, Monat und Jahr. Die dokumentierte Löschreihenfolge entfernt in einer Transaktion Planeinträge und Rufbereitschaften, danach Tageszeilen und zuletzt den Plan. Wird der aktive Plan gelöscht, fällt die Seite in den Ausgangszustand zurück; der Ladedialog bleibt offen.

### Ansichtswechsel

Der Umschalter trägt die Bezeichnungen „Planung“ und „Druckvorschau“. Die Druckvorschau soll denselben aktuellen Entwurf ohne Bearbeitungsfelder kompakter zeigen: eine Spalte pro Teammitglied, Eintrag als Kürzel mit optionalem Zeitbereich, Rufbereitschaft und Bemerkung als Text sowie Ist-/Soll-Fußzeilen. Der Ansichtswechsel darf Entwurfsdaten nicht verlieren.

## Dokumentierte Daten und fachliche Regeln

### Dienstplan und Tage

- Ein Dienstplan bezieht sich über getrennte Zahlenfelder auf einen ganzen Monat und ein Jahr.
- Ein Titel darf leer sein.
- Zu jedem Kalendertag des Monats gehört eine Tageszeile mit optionaler Bemerkung.
- Wochentag, Wochenend- und Feiertagsstatus werden aus dem Datum abgeleitet und nicht gespeichert.
- Die Feiertagsliste ist auf die zwölf gesetzlichen Feiertage Brandenburgs einschließlich Ostersonntag und Pfingstsonntag festgelegt. Benutzerdefinierte und weitere religiöse oder Gedenkfeiertage gehören nicht zum Mindestumfang.

### Reguläre Planungseinträge

- Pro Mitarbeiter und Tag ist genau ein regulärer Eintrag zulässig.
- Kürzel, Beginn, Ende und fünf Zeitanteile werden beim Setzen als Snapshot aus der Eintragsdefinition übernommen. Spätere Änderungen der Definition sollen bestehende Pläne nicht rückwirkend verändern.
- Mehrere Eintragsdefinitionen dürfen dasselbe Kürzel besitzen.
- Mitarbeiterabhängige Arbeitszeit wird beim Setzen aus der aktuellen Wochenarbeitszeit geteilt durch fünf berechnet und auf volle Minuten gerundet; der Wert wird danach im Snapshot festgehalten.
- Beginn und Ende dienen nur der Anzeige. Die Zeitanteile werden nicht aus diesen Uhrzeiten berechnet, und ihre zeitliche Reihenfolge wird nicht plausibilisiert.
- Dienste über Mitternacht werden manuell als zwei unabhängige Einträge an zwei Tagen erfasst. Es gibt keine automatische Kopplung.

### Rufbereitschaft

- Pro Kalendertag ist höchstens eine Rufbereitschaft zulässig.
- Nur Teammitglieder mit der Rolle `Erzieher` dürfen ausgewählt werden.
- Regulärer Eintrag und Rufbereitschaft können für dieselbe Person am selben Tag nebeneinander bestehen.
- Rufbereitschaft verändert keine Arbeitszeit oder Zuschläge, sondern wird nur gezählt.

### Bemerkungen

- Es gibt einen kurzen Freitext je Kalendertag, nicht je Person.
- Die dokumentierte Höchstlänge beträgt 40 Zeichen.
- Ein geleertes Feld wird als fehlende Bemerkung beziehungsweise `null` gespeichert.

### Berechnungen in der Planung

Das vollständige Raster soll fünf Werte direkt anzeigen: Anzahl SN/F-Dienste, Anzahl freier Tage, Differenz Soll/Ist sowie Ist- und Soll-Arbeitszeit. Die verkürzte Ansicht übernimmt Ist und Soll. Die Auswertungsdokumentation beschreibt insgesamt 15 Kennzahlen, die aus Teammitgliedern, Kalendertagen, Planeintrags-Snapshots und Rufbereitschaften abgeleitet und nicht als eigene Entität gespeichert werden.

Als übergreifende Regeln nennt die Dokumentation unter anderem:

- Zeitdauern werden in ganzen Minuten geführt und nur für Ein- und Ausgabe als Stunden:Minuten formatiert.
- Berechnete Dauern werden auf die nächste volle Minute gerundet; eine exakte halbe Minute wird aufgerundet.
- Soll-Arbeitszeit ergibt sich aus Arbeitstagen im Monat und individueller Wochenarbeitszeit.
- Änderungen im Entwurf sollen die sichtbaren Kennzahlen bereits vor dem Speichern aktualisieren.

Die übergreifenden statisch erkennbaren Rechenbausteine sind unter [Berechnungen](../uebergreifend/berechnungen.md) zusammengefasst. Die dokumentierten Zielregeln stehen eigenständig in diesem Abschnitt und in den genannten Altsystem-Dokumenten.

## Technische und architektonische Festlegungen

Die Dokumentation beschreibt eine klare Prozessaufteilung:

- React-Komponenten im Renderer halten Anzeige- und Entwurfszustände.
- Plattformunabhängige Kalender-, Zeit- und Auswertungsfunktionen liegen in gemeinsam nutzbaren Modulen.
- Der Renderer verwendet ausschließlich die über Preload freigegebene `window.api`.
- IPC-Kanalnamen werden zentral deklariert.
- Handler leiten Aufrufe an SQLite-Repositories im Main-Prozess weiter.
- Repositories erhalten die Datenbankverbindung als Parameter, damit dieselben Funktionen mit einer In-Memory-Datenbank getestet werden können.

Für die Planung werden getrennte Tabellen beziehungsweise Entitäten für Dienstplan, Dienstplantag, Planeintrag und Rufbereitschaft beschrieben. Planeinträge speichern bewusst Kopien der Eintragsdaten. Der gemeinsame Speicheraufruf und das Löschen eines Plans sind als Transaktionen festgelegt.

Das Raster basiert laut Ablaufplan auf einer nativen Tabelle mit `colgroup`, fester Kopfzeile, fester Datumsspalte und eigenem Scrollcontainer. `PlanungsGrid` und `VerkuerzteAnsicht` werden in `components/layout/` geführt, obwohl die Architekturdokumentation sie wegen ihrer Fachkenntnis als bekannte Abweichung von der sonst fachlich neutralen Layout-Schicht kennzeichnet.

## Dokumentierte Zustände, Fehler- und Leerfälle

Beschrieben sind insbesondere:

- Ausgangszustand ohne aktiven Plan und nicht editierbare Monatsvorschau;
- aktiver Plan nach Erstellen oder Laden;
- lokaler Entwurf gegenüber gespeicherter Baseline;
- Warnung vor dem Verwerfen ungespeicherter Änderungen;
- leere Planliste im Ladedialog;
- leere Eintrags- und Rufbereitschaftszellen;
- sichtbare, manuell schließbare Fehlermeldungen für abgelehnte Preload-/IPC-Aufrufe;
- Beenden der Anwendung mit Fehlerdialog, wenn die Datenbank nicht geöffnet werden kann.

Die Architekturdokumentation hält als offenen Prüfpunkt fest, dass Eingabevalidierung im Renderer liegt und der Main-Prozess Eingaben nicht nochmals prüft. Besonders genannt wird die Erzieher-Regel für Rufbereitschaft, die durch die Auswahloberfläche gefiltert wird.

## Dokumentierter Testansatz

Die Teststrategie trennt reine Fachlogik, SQLite-Repositories, React-Komponenten, den IPC-Vertrag und wenige Electron-E2E-Durchstiche. Für die Planungsseite nennen die abgeschlossenen Ablaufpläne insbesondere Tests für:

- Kalendertage, Feiertage, Zeitformatierung und Rundung;
- Snapshots, Entwurfsschlüssel und Auswertungskennzahlen;
- Anlegen, Laden, gemeinsames Speichern und kaskadierendes Löschen in SQLite;
- Eindeutigkeit regulärer Einträge und Rufbereitschaften;
- Vollständigkeit der IPC-Kanäle;
- die Druckausgabe der kompakten Ansicht.

Die Testdokumentation lehnt große Snapshot- beziehungsweise Pixeltests für das Monatsraster ab. Bedien- und Darstellungsprüfungen wurden in den historischen Ablaufplänen zusätzlich als manuelle Screenshot-Prüfungen vorgesehen. Details der Testebenen stehen in [Komponenten und Tests](../uebergreifend/komponenten-und-tests.md).

## Dokumentierte Grenzen

- Das Altsystem bildet eine einzelne Wohngruppe ab; eine eigene Team- oder Wohngruppen-Entität ist nicht vorgesehen.
- Die Feiertagsberechnung ist auf Brandenburg und den dokumentierten Gesetzesstand zugeschnitten.
- Fachliche Plausibilität von Uhrzeiten und Zeitanteilen bleibt bei der Teamleitung; die Anwendung beschreibt nur formale Eingabegrenzen.
- Über Mitternacht laufende Dienste werden nicht automatisch gekoppelt.
- Die verkürzte Ansicht ist rein lesend.
- Praktikanten und Wirtschaftskräfte werden in der Planung angezeigt, erhalten aber keine Ist-/Soll-Auswertung.
- Der native Windows-Druckdialog wird laut Teststrategie nicht automatisiert.

## Offene und geplante Inhalte

`erledigt.md` führt das Planungsgerüst, Erstellen/Laden/Speichern, Planeinträge, Rufbereitschaft, Bemerkungen, Kennzahlen, Dienstplan-Löschen, Auswertungsdialog und verkürzte Ansicht als abgeschlossene Schritte.

`TODO.md` nennt für die Planungsseite vor allem noch:

- einen PDF-Export mit live skalierter A4-Druckvorschau und Drucken über den nativen Windows-Dialog;
- einen Signaturblock „Freigabe und Unterschrift“ auf der Druckausgabe;
- die spätere Umbenennung der verkürzten Ansicht in der Dokumentation nach dem PDF-Ausbau;
- die Klärung der als „zu prüfen“ markierten Main-Prozess-Validierung.

Als bekannter, ausdrücklich dokumentierter Mangel ist festgehalten, dass die bisherige Druckausgabe zwar eine Seite und die Mitarbeiterspalten erreicht, aber den letzten Tag des Monats verlieren kann. Der Druck-Export soll diese Grenze durch eine feste A4-Fläche mit Skalierung beheben.
