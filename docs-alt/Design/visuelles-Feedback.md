Das visuelle Feedback wird nach Wichtigkeit gestaffelt: direkte Rückmeldung am betroffenen Element, dauerhafte Hinweise innerhalb der Seite und kurzzeitige Toast-Benachrichtigungen.

## 1. Grundregel

> Die Anwendung muss nach jeder Benutzeraktion verständlich zeigen, was passiert ist, ob noch etwas erforderlich ist und ob die Aktion erfolgreich war.

Dabei gilt:

* häufige Aktionen erzeugen keine unnötigen Meldungen,
* Fehler erscheinen möglichst nah an ihrer Ursache,
* wichtige Probleme bleiben sichtbar,
* Farben werden durch Text oder Symbole ergänzt,
* Rückmeldungen verwenden immer dieselben Begriffe und Darstellungen.

## 2. Interaktionszustände

Jedes interaktive Element unterstützt passende Zustände:

| Zustand     | Darstellung                                 |
| ----------- | ------------------------------------------- |
| Normal      | neutrale Standarddarstellung                |
| Hover       | dezente Änderung der Hintergrundfarbe       |
| Gedrückt    | etwas dunklere Hintergrundfarbe             |
| Ausgewählt  | hellblauer Hintergrund und blauer Rahmen    |
| Deaktiviert | graue Darstellung, nicht ausführbar         |
| Lädt        | Spinner und gegebenenfalls angepasster Text |
| Fehlerhaft  | roter Rahmen und konkrete Fehlermeldung     |

Ein ausgewählter Dienstplaneintrag ist dadurch auch ohne reine Farberkennung eindeutig sichtbar.

## 3. Änderungen im Dienstplan

Beim Setzen oder Bearbeiten eines Planungseintrags:

* erscheint die Änderung sofort in der betreffenden Zelle,
* wird die Zelle kurz dezent hervorgehoben,
* erhält die Anwendung den Status „Ungespeicherte Änderungen“,
* erscheint kein Toast für jede einzelne Änderung.

Dadurch bleibt die Planung ruhig und wird nicht durch viele Benachrichtigungen unterbrochen.

## 4. Speichern

| Zustand                  | Rückmeldung                                  |
| ------------------------ | -------------------------------------------- |
| Änderungen vorhanden     | gelber Punkt und „Ungespeicherte Änderungen“ |
| Speichern läuft          | Spinner und „Wird gespeichert …“             |
| Speichern erfolgreich    | grünes Häkchen und „Gespeichert“             |
| Speichern fehlgeschlagen | dauerhafte Fehlermeldung mit Ursache         |

Der Speichern-Button wird während des Speicherns deaktiviert, damit der Vorgang nicht mehrfach ausgelöst wird.

Beim Verlassen einer Ansicht oder Schließen der Anwendung mit ungespeicherten Änderungen erscheint eine Abfrage mit:

* **Speichern**
* **Verwerfen**
* **Abbrechen**

## 5. Laden

Da die Daten lokal gespeichert werden, sollten Ladevorgänge normalerweise kurz sein.

* Bei wahrnehmbarer Dauer erscheint ein Spinner.
* Die bisherige Oberfläche wird nicht unnötig durch einen Vollbild-Ladebildschirm ersetzt.
* Bei einem Fehler erscheint ein dauerhafter Hinweis.
* Wenn möglich, erhält der Benutzer die Aktion „Erneut versuchen“.

## 6. Formulare

Fehler werden direkt am betreffenden Feld angezeigt:

```text
Wochenarbeitszeit
[ ungültiger Wert ]

Bitte geben Sie eine Zahl größer als 0 ein.
```

Zusätzlich gilt:

* Fehlerhafte Felder erhalten einen roten Rahmen.
* Die Meldung erklärt, wie der Fehler behoben werden kann.
* Nach der Korrektur verschwindet die Meldung.
* Ein allgemeiner Toast ersetzt keine konkrete Feldmeldung.
* Das Formular bleibt geöffnet, wenn das Speichern fehlschlägt.

## 7. Löschen

Vor dem Löschen erscheint immer ein Bestätigungsdialog.

Während des Löschens:

* zeigt der Löschbutton einen Spinner,
* sind die Dialogaktionen deaktiviert,
* kann die Aktion nicht mehrfach ausgelöst werden.

Nach erfolgreichem Löschen erscheint ein kurzer Toast:

> Mitarbeiter wurde gelöscht.

Bei einem Fehler bleibt der Dialog geöffnet und zeigt die Fehlermeldung direkt an.

## 8. PDF-Export

| Zustand                     | Rückmeldung                                |
| --------------------------- | ------------------------------------------ |
| Export läuft                | Spinner und „PDF wird erstellt …“          |
| Export erfolgreich          | Erfolgstoast „PDF wurde erstellt.“         |
| Export fehlgeschlagen       | Fehlertoast mit verständlicher Ursache     |
| Speicherort nicht verfügbar | konkrete Fehlermeldung und erneute Auswahl |

## 9. Toast-Benachrichtigungen

Sonner wird mit genau einem zentralen `Toaster` verwendet. Danach können Benachrichtigungen über `toast()` ausgelöst werden. [Sonner-Dokumentation](https://github.com/emilkowalski/sonner)

Festgelegtes Verhalten:

* Position unten rechts
* maximal drei sichtbare Toasts
* Schließen-Schaltfläche vorhanden
* Erfolg und Information ungefähr vier Sekunden sichtbar
* Fehler ungefähr sechs Sekunden sichtbar
* keine Toasts für jeden Planungsschritt
* keine wichtigen Informationen ausschließlich als Toast

Vorgesehene Typen:

* Erfolg
* Information
* Warnung
* Fehler

## 10. Dauerhafte Hinweise

Ein `Alert` wird verwendet, wenn die Information nicht automatisch verschwinden darf:

* Daten konnten nicht geladen werden
* Speichern ist fehlgeschlagen
* ungespeicherte Änderungen
* erforderliche Daten fehlen
* PDF konnte nicht erstellt werden

Automatische fachliche Prüfungen des Dienstplans werden dadurch nicht neu zum Prototypumfang hinzugefügt.

## 11. Leere Zustände

Leere Ansichten zeigen nicht nur eine leere Tabelle, sondern erklären den nächsten Schritt.

Beispiel:

> Noch keine Mitarbeiter vorhanden.
> Legen Sie zuerst einen Mitarbeiter an, um einen Dienstplan erstellen zu können.

Dazu erscheint die passende Hauptaktion:

> Mitarbeiter anlegen

## 12. Verbindliche Priorität

Für Rückmeldungen gilt diese Reihenfolge:

1. Fehlermeldung direkt am Eingabefeld
2. Rückmeldung direkt an der betroffenen Komponente
3. dauerhafter Hinweis innerhalb der Seite
4. kurzzeitiger Toast für abgeschlossene Vorgänge

Damit sind Designziel, Farbkonzept, globale Farb-Basis, globale UI-Basis, Komponentenbasis und visuelles Feedback festgelegt. Als nächster UI/UX-Schritt sollten wir die **konkreten Ansichten und Bedienabläufe** des Dienstplaners prüfen: Navigation, Team-Verwaltung, Planungseintrag-Verwaltung und Dienstplanansicht.
