Wir setzen gemeinsam eine bereits begonnene, schrittweise Fachanalyse für das Projekt „Dienstplaner“ fort.

Projektordner:
E:\Programmieren\Projects\Dienstplaner

Ziel:
Alle im alten Projekt implementierten fachlichen Berechnungen sollen nachvollziehbar analysiert und anschließend als verbindliche Regeln in `docs/Berechnungen.md` festgehalten werden.

Wichtige Quellenregel:
Das alte Projekt befindet sich unter:
https://github.com/Rohde49/dienstplan-app

Im alten Projekt darf ausschließlich der Ordner `src` als fachliche Quelle untersucht werden. Der dortige `docs`-Ordner ist veraltet und darf weder geöffnet noch für Schlussfolgerungen verwendet werden. Für die bisherige Analyse wurde der alte Commit `255036d0d95fa7fbf53e354a36680a08ee4719c1` zugrunde gelegt.

Lies zu Beginn vollständig:

1. `docs/Berechnungen.md`
2. `docs/temp/Analyse-Altsystem-Berechnungen.md`

Bedeutung der Dateien:

- `docs/Berechnungen.md` enthält die gemeinsam bestätigten und damit verbindlichen fachlichen Regeln des neuen Projekts.
- `docs/temp/Analyse-Altsystem-Berechnungen.md` enthält den technischen Befund aus dem Quellcode des Altsystems, offene Fragen und den schrittweisen Arbeitsnachweis.
- Der technische Befund des Altsystems ist nicht automatisch eine neue fachliche Regel. Verbindlich wird eine Regel erst nach ausdrücklicher Bestätigung durch den Benutzer.

Bisheriger Arbeitsstand:

- Schritt 1: Inventarisierung der Berechnungsbereiche abgeschlossen.
- Schritt 2: Zeitbasis, Zeitformate und Rundungsregeln analysiert und verbindlich entschieden.
- Schritt 3: Kalender, Feiertage und Arbeitstage analysiert und verbindlich entschieden.
- Schritt 4: Berechnungsarten und Planungseinträge einschließlich Snapshots analysiert und verbindlich entschieden.
- Schritt 5: Tagesbezogene Kennzahlen einschließlich SN/F-Diensten, freien Tagen und Rufbereitschaften analysiert und verbindlich entschieden.
- Schritt 6: zeitbezogene Monatssummen, Sonntags- und Feiertagsstunden, Nachtarbeit, Nachtbereitschaft und Zuschläge vollständig analysiert und fachlich entschieden.
- Schritt 7: Soll-Arbeitszeit, Ist-Arbeitszeit und Differenz vollständig analysiert und fachlich entschieden.
- Schritt 8: Gesamtprüfung und redaktionelle Bereinigung abgeschlossen. Es wurden keine fachlichen Widersprüche und keine zwingend fehlenden Berechnungsentscheidungen gefunden.
- Die schrittweise Fachanalyse der Berechnungen ist damit abgeschlossen. Als nächster Arbeitsabschnitt kann die technische Umsetzung auf Grundlage von `docs/Berechnungen.md` geplant werden.

Bereits verbindliche Kernaussagen:

- Zeitmengen werden intern als ganze, nichtnegative Minuten geführt.
- Negative Werte sind nur bei ausdrücklich als Differenz definierten Ergebnissen zulässig.
- Eine Dauer ist eine Zeitmenge; eine Uhrzeit ist eine Position innerhalb eines Tages. Beide Begriffe dürfen nicht vermischt werden.
- Bei Umrechnungen auf ganze Minuten werden exakt halbe Minuten aufgerundet.
- Die Wochenarbeitszeit muss ohne Rest durch fünf teilbar sein.
- Eine Wochenarbeitszeit von `0:00` ist zulässig. Sie erzeugt bei `Wochenarbeitszeit` einen Tageswert und ein Monatssoll von jeweils `0` Minuten; feste Einträge können trotzdem ein positives Ist erzeugen.
- Dienstbeginn und Dienstende sind optional, müssen aber gemeinsam gesetzt oder gemeinsam leer sein.
- Beginn und Ende sind rein informativ. Aus ihnen werden keine Arbeitszeiten berechnet oder geprüft.
- Ein Ende vor dem Beginn darf einen Dienst über Mitternacht darstellen.
- Berechnungszeitraum ist jeweils ein vollständiger gregorianischer Kalendermonat.
- Beim regulären Anlegen erzeugt die Anwendung automatisch genau einen Plantag für jeden Kalendertag. Es gibt keine zusätzliche fachliche Ablehnungsregel für beschädigte Daten mit fehlenden oder doppelten Plantagen; deren Behandlung bleibt eine technische Robustheitsfrage.
- Arbeitstage sind Montag bis Freitag, ausgenommen gesetzliche Feiertage in Brandenburg.
- Berücksichtigt werden die zwölf gesetzlichen Feiertage nach § 2 Absatz 1 des Feiertagsgesetzes Brandenburg.
- Es gibt die Berechnungsarten `Feste Zeitwerte` und `Wochenarbeitszeit`.
- Im neuen Projekt heißen die fachlichen Größen:
  - „reine Arbeitszeit“ für Arbeitszeit ohne Nachtbereitschaft
  - „Arbeitszeit (mit NB)“ für die Summe aus reiner Arbeitszeit und vollständiger Nachtbereitschaft; sie ist eine eigene Informationskennzahl und nicht mit der Ist-Arbeitszeit gleichzusetzen
- Arbeitszeit (mit NB) wird je Planungseintrag als `reine Arbeitszeit + Nachtbereitschaft` berechnet und ist kein zusätzlich frei pflegbarer Wert.
- Jeder Planungseintrag-Snapshot enthält Arbeitszeit (mit NB) als gespeicherten, abgeleiteten Wert. In der EntryTypes-Verwaltung wird der Wert sichtbar, aber nicht änderbar dargestellt und von der Anwendung aus reiner Arbeitszeit plus Nachtbereitschaft aktualisiert. Ob er zusätzlich in der EntryType-Definition gespeichert oder dort nur live berechnet wird, bleibt eine technische Datenmodellentscheidung. Abweichende gespeicherte Werte werden als ungültig abgelehnt und nicht stillschweigend korrigiert.
- Berechnungsregel: Globale Formeln einschließlich Soll, Ist und Differenz sind grundsätzlich rollenunabhängig und für jeden Mitarbeiter anwendbar. Ausdrückliche rollenbezogene Zulässigkeitsregeln wie bei der Rufbereitschaft bleiben davon unberührt.
- Darstellungsregel: Die vorgesehene zeitbezogene Auswertung listet nur Mitarbeiter mit der im Monatsplan-Snapshot gespeicherten Rolle `Erzieher` auf. Andere Oberflächen legen selbst fest, welche Mitarbeiter und Kennzahlen sie darstellen; die tagesbezogenen Kennzahlen aus Schritt 5 bleiben für alle Mitarbeiter sichtbar.
- Monatliche reine Arbeitszeit, Nachtbereitschaft und Nachtarbeit werden jeweils durch unveränderte Addition ihrer ganzzahligen Snapshot-Minuten gebildet; eine weitere Rundung findet nicht statt.
- Zwischen Anwesenheitszeit und Arbeitszeit (mit NB) gilt keine fachliche Größenbeziehung; insbesondere ist Anwesenheitszeit keine Obergrenze der Arbeitszeit.
- Zwischen Nachtarbeit und reiner Arbeitszeit gilt ebenfalls keine fachliche Größenbeziehung; Nachtarbeit wird als eigenständiger Snapshot-Wert nicht automatisch begrenzt.
- Sonntage und gesetzliche Feiertage bilden eine gemeinsame Zeitkennzahl; ein Sonntag, der zugleich Feiertag ist, trägt nur einmal bei.
- In die gemeinsame Sonntags-/Feiertagskennzahl fließt ausschließlich die reine Arbeitszeit des Planungseintrag-Snapshots ein; andere Zeitfelder bleiben unberücksichtigt.
- Dabei wird nicht nach Dienst, Urlaub, Krankheit oder anderen Eintragsarten unterschieden. Jeder positive Wert der reinen Arbeitszeit trägt bei; Kürzel und Bezeichnung sind für diese Summe ohne Bedeutung.
- Jeder Planungseintrag gehört genau zu einem Kalendertag. Auch bei Uhrzeiten über Mitternacht werden seine Zeitwerte nicht auf den Folgetag verteilt; für Kalenderkennzahlen ist allein der Tag der Planungszelle maßgeblich.
- Der Nachtzuschlag ist eine Zeitgutschrift in Minuten und beträgt `20 %` der gesamten monatlichen Nachtarbeit. Er wird einmal nach Bildung der Monatssumme auf volle Minuten gerundet, als eigene Kennzahl angezeigt und nicht in die Ist-Arbeitszeit eingerechnet.
- Der Nachtbereitschaftszuschlag ist eine Zeitgutschrift in Minuten und beträgt `25 %` der gesamten monatlichen Nachtbereitschaft. Auch er wird einmal nach Bildung der Monatssumme auf volle Minuten gerundet und anschließend vollständig in die Ist-Arbeitszeit eingerechnet.
- Die monatliche Soll-Arbeitszeit lautet `berechnete kalendarische Arbeitstage × Wochenarbeitszeit aus dem Mitarbeiter-Snapshot / 5`. Die Arbeitstage werden vom System nach der verbindlichen Kalenderregel berechnet und nicht eingegeben; wegen der Teilbarkeit der Wochenarbeitszeit durch fünf ist keine Rundung erforderlich.
- Die monatliche Ist-Arbeitszeit wird wie im Altsystem als `monatliche reine Arbeitszeit + Nachtbereitschaftszuschlag` gebildet. Der Nachtzuschlag, die vollständige Nachtbereitschaft und Arbeitszeit (mit NB) fließen nicht ein; nach der Addition wird nicht erneut gerundet.
- Die Soll-/Ist-Differenz wird als `monatliche Ist-Arbeitszeit − monatliche Soll-Arbeitszeit` ohne weitere Rundung gebildet. Positiv bedeutet über Soll, negativ unter Soll; ein Ausgleich wird als `00:00` ohne Vorzeichen dargestellt.
- Bei jedem gesetzten Planungseintrag der Berechnungsart `Wochenarbeitszeit` gilt unabhängig vom Kalendertag:
  - reine Arbeitszeit = Wochenarbeitszeit / 5
  - Arbeitszeit (mit NB) = derselbe Wert
  - Nachtbereitschaft = 0
  - Anwesenheit = 0
  - Nachtarbeit = 0
  - Dienstbeginn und Dienstende bleiben leer
- Ein berechneter Planungseintrag ist ein Snapshot. Spätere Änderungen an Arbeitszeitmodellen oder Stammdaten ändern bestehende Einträge nicht rückwirkend.
- Auch Mitarbeiterdaten werden im Plan als Snapshot gespeichert.
- Das fachliche Zielmodell setzt voraus, dass Teammitglieder eine bestehende, eindeutig prüfbare Rolle besitzen. Die Rolle ist im aktuellen Anwendungscode noch frei eingebbar; die technische Umstellung auf fest definierte Rollen wird vom Benutzer gesondert umgesetzt und ist kein offener Punkt der Berechnungsanalyse.
- Die Berechnungsart und die konkreten Zeitwerte eines einzelnen Planungseintrags sind unabhängig von der Mitarbeiterrolle; einzelne Auswertungen dürfen einen ausdrücklich festgelegten Rollenfilter besitzen.
- Das Löschen eines Mitarbeiters darf bereits gespeicherte Mitarbeiter- und Berechnungssnapshots bestehender Pläne nicht entfernen.
- SN/F-Dienste, freie Tage, freie Samstage und freie Sonntage werden für alle Mitarbeiter des Monatsplan-Snapshots getrennt berechnet.
- Die Kennzahl „SN/F-Dienste“ zählt im Prototyp die exakten Snapshot-Kürzel `SN/F` und `SN`; `F` allein sowie kalendertagübergreifende Dienstfolgen zählen nicht.
- Nur das exakte Snapshot-Kürzel `/` kennzeichnet einen freien Tag. Eine leere Zelle bleibt ungeplant.
- Freie Samstage und freie Sonntage sind anhand des tatsächlichen Wochentags bestimmte Teilmengen der freien Tage; der Feiertagsstatus ändert diese Einordnung nicht.
- Rufbereitschaft darf nur einem Mitarbeiter mit der im Monatsplan-Snapshot gespeicherten Rolle `Erzieher` zugeordnet werden.
- Pro Kalendertag besteht höchstens eine Rufbereitschaft; jeder zugeordnete Tag erhöht den persönlichen Monatszähler um `1`.
- Rufbereitschaft und Planungseintrag sind unabhängig und dürfen auch bei einem Frei-Eintrag gleichzeitig bestehen.
- Während der Bearbeitung zeigen sämtliche Kennzahlen einschließlich Soll, Ist und Differenz den aktuellen Entwurf. Eintragsänderungen aktualisieren Ist und Differenz sofort, während das Soll dabei unverändert bleibt. Verbindliche Ausgaben müssen auf dem gespeicherten Stand beruhen.

Arbeitsweise:

- Antworte auf Deutsch, verständlich, freundlich und ohne unnötigen Fachjargon.
- Beginne mit dem Ergebnis oder der Empfehlung.
- Arbeite in kleinen, nachvollziehbaren Schritten.
- Besprich fachliche Entscheidungen einzeln mit dem Benutzer.
- Stelle bei einer offenen Entscheidung jeweils eine konkrete Frage und warte auf die Antwort.
- Übernimm eine Regel erst nach Zustimmung des Benutzers in `docs/Berechnungen.md`.
- Halte technische Erkenntnisse und den Arbeitsstand zusätzlich in der temporären Analysedatei fest.
- Unterscheide stets klar zwischen:
  1. Verhalten des Altsystems,
  2. gemeinsam getroffener fachlicher Entscheidung,
  3. technischem Stand des neuen Projekts.
- Verwende einen Subagenten nur, wenn der Benutzer dies ausdrücklich wünscht.
- Ein Subagent darf zunächst nur den abgegrenzten Schritt analysieren und die temporäre Analysedatei ergänzen. Die verbindliche Datei wird anschließend gemeinsam mit dem Benutzer Regel für Regel aktualisiert.
- Verändere keinen Anwendungscode, installiere keine Pakete und erstelle keinen Commit oder Push, sofern der Benutzer das nicht ausdrücklich verlangt.
- Informiere während längerer Arbeiten regelmäßig und knapp über den Fortschritt.
- Behaupte keine Prüfung oder Übereinstimmung, die nicht tatsächlich nachvollzogen wurde.

Beginne die neue Sitzung damit, die genannten Dateien zu lesen. Fasse anschließend kurz zusammen, welchen Arbeitsstand du wiederhergestellt hast und was nachweislich als Nächstes ansteht. Nimm noch keine neue fachliche Regel auf, bevor der Benutzer die Fortsetzung bestätigt.
