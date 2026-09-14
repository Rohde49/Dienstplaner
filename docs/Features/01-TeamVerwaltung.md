# Team-Verwaltung

## 1. Zweck

Die Team-Verwaltung dient der Pflege der Mitarbeiter-Stammdaten, die für die Dienstplanung benötigt werden.

Mitarbeiter können angelegt, bearbeitet, aktiviert beziehungsweise deaktiviert und dauerhaft gelöscht werden.

## 2. Umfang und Abgrenzung

Zur Team-Verwaltung gehören:

* Anzeige aller gespeicherten Mitarbeiter,
* Anlegen neuer Mitarbeiter,
* Bearbeiten vorhandener Mitarbeiter,
* Aktivieren und Deaktivieren von Mitarbeitern,
* dauerhaftes Löschen von Mitarbeitern.

Die Team-Verwaltung erstellt oder bearbeitet keine Monatspläne.

Änderungen an Mitarbeiter-Stammdaten wirken sich nicht rückwirkend auf bereits angelegte Monatspläne aus.

## 3. Fachliche Daten

Für jeden Mitarbeiter werden folgende Angaben verwaltet:

| Angabe            | Bedeutung                                                      |
| ----------------- | -------------------------------------------------------------- |
| Vorname           | Vorname des Mitarbeiters                                       |
| Nachname          | Nachname des Mitarbeiters                                      |
| Rolle             | Fachliche Rolle innerhalb der Dienstplanung                    |
| Wochenarbeitszeit | Für die Planung zugrunde gelegte regelmäßige Wochenarbeitszeit |
| Farbe             | Visuelle Zuordnung des Mitarbeiters innerhalb der Anwendung    |
| Status            | Kennzeichnung als aktiv oder inaktiv                           |

Zulässige Rollen sind:

* Erzieher,
* Wirtschaftskraft,
* Praktikant.

Als Mitarbeiterfarben stehen zur Verfügung:

* Blau,
* Grün,
* Gelb,
* Violett,
* Rosa,
* Türkis.

Die Farbe unterstützt die visuelle Zuordnung, ersetzt jedoch nicht die namentliche Kennzeichnung des Mitarbeiters.

## 4. Fachliches Verhalten

Die Team-Verwaltung zeigt alle gespeicherten Mitarbeiter unabhängig von ihrem Aktivierungsstatus.

Für jeden Mitarbeiter werden mindestens Name, Rolle, Wochenarbeitszeit und Status dargestellt.

Zusätzlich werden die Gesamtzahl der gespeicherten Mitarbeiter und die Anzahl der aktiven Mitarbeiter angezeigt.

### Mitarbeiter anlegen

Beim Anlegen eines Mitarbeiters werden alle erforderlichen Stammdaten erfasst.

Neue Mitarbeiter sind standardmäßig aktiv. Als Standardfarbe wird Blau verwendet.

Nach erfolgreichem Speichern steht der Mitarbeiter unmittelbar in der Team-Verwaltung zur Verfügung.

### Mitarbeiter bearbeiten

Die Stammdaten eines bestehenden Mitarbeiters können nachträglich geändert werden.

Dabei können insbesondere Name, Rolle, Wochenarbeitszeit, Farbe und Aktivierungsstatus angepasst werden.

Die Identität des Mitarbeiters bleibt bei einer Bearbeitung erhalten.

### Mitarbeiter aktivieren und deaktivieren

Ein Mitarbeiter kann als aktiv oder inaktiv gekennzeichnet werden.

Inaktive Mitarbeiter bleiben vollständig in der Team-Verwaltung erhalten und können weiterhin bearbeitet, wieder aktiviert oder gelöscht werden.

Der Aktivierungsstatus bestimmt, ob der Mitarbeiter bei der Anlage eines neuen Monatsplans berücksichtigt wird.

### Mitarbeiter löschen

Ein Mitarbeiter kann dauerhaft aus der Team-Verwaltung gelöscht werden.

Vor dem Löschen ist eine ausdrückliche Bestätigung erforderlich.

Nach erfolgreichem Löschen steht der Mitarbeiter nicht mehr in der Team-Verwaltung zur Verfügung.

## 5. Regeln und Validierung

### Name

Vorname und Nachname sind Pflichtangaben.

Äußere Leerzeichen werden entfernt.

Vorname und Nachname dürfen jeweils höchstens 100 Zeichen enthalten.

### Rolle

Die Rolle ist verpflichtend.

Es kann ausschließlich eine der festgelegten Rollen gewählt werden:

* Erzieher,
* Wirtschaftskraft,
* Praktikant.

Andere oder frei eingegebene Rollen sind nicht zulässig.

### Wochenarbeitszeit

Die Wochenarbeitszeit ist verpflichtend und wird als Zeitdauer angegeben.

Es gelten folgende Regeln:

* Mindestwert: `0:00`,
* Höchstwert: `168:00`,
* Angabe ausschließlich in Fünf-Minuten-Schritten,
* Eingabe im Format `H:MM`, beispielsweise `39:00`.

### Farbe

Jedem Mitarbeiter muss genau eine der vorgesehenen Mitarbeiterfarben zugeordnet sein.

### Status

Jeder Mitarbeiter besitzt eindeutig den Status aktiv oder inaktiv.

## 6. Fehler- und Sonderfälle

Können die Mitarbeiterdaten nicht geladen werden, wird der Fehler angezeigt und ein erneuter Ladeversuch ermöglicht.

Ungültige Eingaben verhindern das Anlegen oder Speichern eines Mitarbeiters. Die betroffenen Eingaben werden verständlich gekennzeichnet.

Schlägt das Speichern eines neuen Mitarbeiters fehl, wird kein Mitarbeiter angelegt.

Schlägt die Bearbeitung eines Mitarbeiters fehl, bleiben die zuvor gespeicherten Daten erhalten.

Schlägt das Löschen fehl, bleibt der Mitarbeiter erhalten.

Das Löschen kann während des laufenden Löschvorgangs nicht mehrfach ausgelöst werden.

Ein Mitarbeiter mit einer Wochenarbeitszeit von `0:00` ist zulässig.

## 7. Wechselwirkungen

### Monatsplanerstellung

Bei der Anlage eines neuen Monatsplans werden ausschließlich Mitarbeiter berücksichtigt, die zu diesem Zeitpunkt als aktiv gekennzeichnet sind.

Dabei werden die für die Planung benötigten Mitarbeiterdaten in den Monatsplan übernommen.

Dazu gehören insbesondere:

* Vorname,
* Nachname,
* Rolle,
* Wochenarbeitszeit,
* Farbe.

### Bestehende Monatspläne

Die in einem Monatsplan übernommenen Mitarbeiterdaten bilden den Stand zum Zeitpunkt seiner Erstellung ab.

Spätere Änderungen in der Team-Verwaltung verändern bestehende Monatspläne nicht.

Dies gilt insbesondere für:

* Änderungen des Namens,
* Änderungen der Rolle,
* Änderungen der Wochenarbeitszeit,
* Änderungen der Farbe,
* Aktivierung oder Deaktivierung,
* Löschen des Mitarbeiters.