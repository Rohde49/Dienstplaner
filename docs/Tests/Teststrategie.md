# Teststrategie des Dienstplaners

## 1. Ziel

Die Tests sollen nachvollziehbar belegen, dass der Dienstplaner die
festgelegten Fachregeln korrekt anwendet, zusammengehörige Daten konsistent
behandelt und die wichtigsten Benutzerabläufe verlässlich unterstützt.

Die Prüfungen begleiten die schrittweise Umsetzung. Jeder Umsetzungsschritt
wird zunächst in seinem eigenen Umfang geprüft. Später kommen übergreifende
Prüfungen hinzu, die mehrere Bereiche gemeinsam betrachten.

## 2. Verbindliche Grundlage

Die erwarteten Ergebnisse stammen aus den jeweils aktuellen Festlegungen:

- [Berechnungen](../Berechnungen/README.md),
- [Datenmodell](../Speicherung/Datenmodell.md) und
- [Datenhaltung](../Speicherung/Datenhaltung.md) sowie
- die [Planungsseite](../Features/03-PlanPage.md).

Die Teststrategie ergänzt diese Festlegungen nicht um neue Fachregeln. Ist ein
erwartetes Verhalten dort nicht eindeutig beschrieben, wird die offene Frage
zuerst fachlich entschieden und dokumentiert.

## 3. Testziele

Geprüft werden insbesondere:

- die korrekte Berechnung von Zeitwerten, Kalenderdaten, Kennzahlen, Zuschlägen
  sowie Soll, Ist und Differenz;
- die Einhaltung von Rollen-, Zeitwert- und Konsistenzregeln;
- die Unveränderlichkeit bereits erzeugter Mitarbeiter- und
  Planungseintrag-Snapshots;
- das vollständige Speichern und Wiederherstellen von Stammdaten und
  Monatsplänen;
- verständliche Reaktionen auf ungültige Eingaben oder beschädigte Daten;
- manuelles Laden, Entwurfskennzeichnung, Verlustschutz und bestätigtes Löschen
  von Monatsplänen;
- der vollständige Kernablauf vom Anlegen eines Monatsplans bis zu seiner
  Auswertung.

## 4. Abgrenzung

Die Strategie gilt für den aktuellen Einfenster-Prototyp. Nicht Bestandteil
der gegenwärtigen Abnahme sind insbesondere:

- Mehrbenutzerbetrieb und Cloud-Synchronisation,
- allgemeine Benutzer-Backups und Exporte,
- Druck- und PDF-Ausgabe,
- nicht beschlossene Plausibilitätsregeln zwischen unabhängigen Zeitwerten,
- semantische Eintragskategorien und eine kalendertagübergreifende Erkennung
  von Dienstfolgen sowie
- einmalige gesetzliche Sonderfeiertage, solange sie nicht ausdrücklich in die
  fachliche Grundlage aufgenommen wurden.

Diese Abgrenzung darf nicht dazu führen, dass bereits festgelegtes Verhalten
ungeprüft bleibt.

## 5. Testarten

### 5.1 Prüfung einzelner Fachregeln

Eine einzelne Regel wird mit klaren Ausgangswerten und einem eindeutig
erwarteten Ergebnis geprüft. Dazu gehören beispielsweise Zeitumwandlungen,
Rundungen, Arbeitstage, Monatswerte und Zähler.

Diese Prüfungen bilden die Grundlage. Fehler lassen sich dadurch einer
bestimmten Regel zuordnen, ohne dass die Bedienoberfläche oder die Speicherung
das Ergebnis verdecken.

### 5.2 Prüfung zusammenwirkender Bereiche

Zusammengehörige Abläufe werden als Einheit geprüft. Beispiele sind:

- einen Monatsplan aus den aktiven Mitarbeitern und allen Kalendertagen
  erzeugen;
- einen Planungseintrag als vollständigen Snapshot setzen, speichern und wieder
  laden;
- Stammdaten nachträglich ändern, ohne bestehende Snapshots zu verändern;
- Monatskennzahlen aus mehreren Planungseinträgen und Kalendermerkmalen
  ermitteln;
- bei einer beschädigten Hauptfassung eine gültige Sicherung verwenden.

### 5.3 Prüfung aus Benutzersicht

Die wichtigsten Abläufe werden so nachvollzogen, wie ein Benutzer sie in der
Anwendung ausführt. Dabei wird nicht nur das Endergebnis betrachtet, sondern
auch, ob unzulässige Aktionen verhindert und Zustände verständlich angezeigt
werden.

Dazu gehören auf der Planungsseite insbesondere:

- der eindeutig nicht angelegte Vorschauplan ohne automatisches Öffnen eines
  gespeicherten Plans,
- das bewusste Laden aus der vollständigen Planliste,
- sichtbare Kennzahlen nach einer noch ungespeicherten Änderung,
- Speichern, Verwerfen und Abbrechen vor einem zustandsverwerfenden Wechsel,
- der Schutz beim Schließen der Anwendung sowie
- das bestätigte Löschen einschließlich des gesperrten ungespeicherten
  aktuellen Plans.

Die sichtbare und fachliche Abnahme der Oberfläche erfolgt durch den Benutzer.
Automatische Prüfungen ersetzen diese Abnahme nicht.

### 5.4 Wiederholungsprüfung

Bereits bestandene wichtige Prüfungen werden nach späteren Änderungen erneut
ausgeführt. Dadurch soll verhindert werden, dass eine neue Funktion vorhandene
Fachregeln oder Kernabläufe unbeabsichtigt verändert.

## 6. Prioritäten

### Priorität 1: unverzichtbar

- Validierung von Mitarbeiterrollen, Wochenarbeitszeit und Zeitwerten;
- Zeit-, Rundungs-, Kalender- und Feiertagsregeln;
- Bildung und Erhalt vollständiger Snapshots;
- monatliche Summen, Zuschläge sowie Soll, Ist und Differenz;
- vollständiges Speichern und Laden ohne Verlust oder stille Veränderung;
- Schutz echter Nutzerdaten während jeder Prüfung.

### Priorität 2: wichtig

- tagesbezogene Zähler und Rufbereitschaft;
- fachliche Fehlermeldungen und Wiederherstellung aus einer Sicherung;
- Live-Aktualisierung während der Planbearbeitung;
- rollenbezogene Auswahl der im Mitarbeiterkopf sichtbaren Kennzahlen;
- manuelles Laden, Entwurfs- und Verlustschutz sowie Planlöschung;
- vollständiger Kernablauf aus Benutzersicht.

### Priorität 3: nachgelagert

- seltene Randfälle außerhalb des vorgesehenen Bedienumfangs;
- Komfortfunktionen und später ergänzte Ausgaben;
- bewusst nachgelagerte Themen aus der fachlichen Dokumentation.

Priorität 3 bedeutet nicht, dass bekannte Fehler ignoriert werden. Sie legt
nur fest, was für die erste belastbare Umsetzung nicht blockierend ist.

## 7. Grundsätze für Testdaten

Testdaten werden klein, eindeutig und für Menschen nachrechenbar gehalten. Ein
Test enthält nur so viele Mitarbeiter, Tage und Einträge, wie für seinen Zweck
erforderlich sind.

Berücksichtigt werden mindestens:

- typische Werte aus dem normalen Planungsablauf;
- zulässige Grenzwerte wie `0:00`, sehr lange Zeitdauern und ein
  Fünf-Minuten-Schritt der Wochenarbeitszeit;
- Werte unmittelbar unter, bei und über einer Rundungsgrenze;
- Schaltjahre, Feiertage auf Wochentagen und Wochenenden sowie mehrere
  Feiertagsbezeichnungen an einem Datum;
- leere Planungszellen und exakte beziehungsweise bewusst abweichende Kürzel;
- Mitarbeiter aller festgelegten Rollen;
- positive, negative und ausgeglichene Soll-/Ist-Differenzen;
- ungültige und widersprüchliche Daten, die eindeutig abgelehnt werden müssen.

Das durchgängige Beispiel aus der
[Soll-Ist-Auswertung](../Berechnungen/06-Soll-Ist-Auswertung.md#durchg%C3%A4ngiges-monatsbeispiel)
wird als gemeinsames fachliches Referenzbeispiel verwendet.

## 8. Schutz echter Nutzerdaten

Prüfungen verwenden ausschließlich eigens dafür angelegte, vorübergehende
Testdaten. Der tatsächliche Datenbestand der Anwendung darf weder gelesen noch
verändert, zurückgesetzt oder als Testgrundlage wiederverwendet werden.

Insbesondere gilt:

- Testdaten liegen vollständig getrennt von den echten Anwendungsdaten.
- Jede Prüfung beginnt mit einem bekannten Ausgangsstand.
- Eine Prüfung darf keine vorhandenen Mitarbeiter, Eintragsarten oder
  Monatspläne voraussetzen.
- Aufräumarbeiten betreffen ausschließlich die eigens erzeugten Testdaten.
- Auch Fehler- und Wiederherstellungsprüfungen arbeiten nur mit Testkopien.

Kann diese Trennung nicht eindeutig gewährleistet werden, darf die betreffende
Prüfung nicht ausgeführt werden.

## 9. Fehler- und Ausnahmefälle

Neben dem gewünschten Normalfall werden gezielt Fehlerfälle geprüft:

- unzulässige Rollen und nicht durch fünf teilbare Wochenarbeitszeiten;
- unvollständige Uhrzeitpaare und ungültige Zeitformate;
- eine von der Summe aus reiner Arbeitszeit und Nachtbereitschaft abweichende
  Arbeitszeit (mit NB);
- doppelte, fehlende oder fremde Bestandteile eines Monatsplans;
- ungültige Verweise innerhalb eines Monatsplans;
- eine Plananlage ohne aktiven Mitarbeiter;
- eine Tagesbemerkung mit mehr als 60 Zeichen;
- mehrere Planungseinträge für dieselbe Person und denselben Tag;
- neue oder ersetzte Planungseinträge mit manipulierten Snapshotwerten;
- Rufbereitschaften für unzulässige Rollen oder mehrere Rufbereitschaften an
  einem Tag;
- unbekannte Datenstände sowie beschädigte Haupt- und Sicherungsdaten.

Fehlerhafte Daten dürfen weder still korrigiert noch teilweise ausgewertet
oder mit einem leeren Stand überschrieben werden. Wird eine gültige Sicherung
verwendet, muss der möglicherweise ältere Stand für den Benutzer erkennbar
sein.

Bewusst nicht geprüft werden fachliche Beziehungen, die ausdrücklich nicht
festgelegt wurden. Dazu gehören beispielsweise eine Obergrenze der Arbeitszeit
durch die Anwesenheitszeit oder der Nachtarbeit durch die reine Arbeitszeit.

## 10. Abnahme je Umsetzungsschritt

Ein Umsetzungsschritt gilt erst als geprüft, wenn:

- alle für seinen Umfang festgelegten Prüfungen erfolgreich ausgeführt wurden;
- Normalfälle, relevante Grenzwerte und erwartete Ablehnungen berücksichtigt
  sind;
- bestehende Prüfungen weiterhin erfolgreich sind;
- keine echten Nutzerdaten verwendet oder verändert wurden;
- festgestellte Abweichungen entweder behoben oder ausdrücklich dokumentiert
  und für den nächsten Schritt als nicht blockierend bewertet wurden.

Ein vorhandener Test allein ist kein Erfolgsnachweis. Maßgeblich ist sein
tatsächlich erfolgreiches Ergebnis gegen den aktuellen Stand.

## 11. Gesamtfreigabe

Vor der fachlichen Gesamtfreigabe werden mindestens folgende Nachweise
zusammengeführt:

1. Die einzelnen Fachregeln liefern die dokumentierten Ergebnisse.
2. Monatsplan, Snapshots, Speicherung und Auswertung funktionieren gemeinsam.
3. Das durchgängige Monatsbeispiel ergibt alle festgelegten Zwischen- und
   Endwerte.
4. Speichern und erneutes Laden erhalten den Plan unverändert.
5. Spätere Stammdatenänderungen verändern bestehende Snapshots nicht.
6. Beschädigte Daten werden entsprechend der festgelegten Datenhaltung
   behandelt.
7. Der vollständige Kernablauf wurde aus Benutzersicht nachvollzogen.
8. Manuelles Laden, ungespeicherter Entwurf, Verlustschutz und bestätigtes
   Löschen entsprechen den Regeln der Planungsseite.
9. Verbleibende Abweichungen zwischen Dokumentation, Verhalten und sichtbarer
   Oberfläche sind ausdrücklich festgehalten.

Die Gesamtfreigabe setzt sowohl erfolgreiche fachliche Prüfungen als auch die
sichtbare Abnahme der Oberfläche voraus. Die erfolgreiche Ausführung einzelner
Prüfungen darf nicht als Nachweis einer bereits vollständig praxistauglichen
Anwendung dargestellt werden.
