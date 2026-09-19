# Abstimmung zum PDF-Export

## Status

- **Status:** Abgeschlossen
- **Abschluss dokumentiert am:** 17. September 2026, 15:20 Uhr
- **Zeitzone:** Europe/Berlin
- **Abschlussnachweis:** Commit `7d765fb`

Die Abstimmung ist abgeschlossen. Dieses Dokument bleibt als historisches
Entscheidungsprotokoll erhalten. Für das dauerhafte Zielverhalten sind die
zuständigen Feature-Dokumente maßgeblich.

## Zweck und Pflege

Diese Datei hält die fachliche, gestalterische und technische Abstimmung zum
PDF-Export sowie die Herleitung der Entscheidungen fest.

Nach Abschluss der Abstimmung wurden die verbindlichen Ergebnisse in die
zuständigen Feature- und Architekturdokumente übernommen. Die anschließende
Umsetzung wurde in einem eigenen Umsetzungsplan in kleine, prüfbare Schritte
geteilt.

Der aktuelle Quellcode bleibt für den tatsächlichen Implementierungsstand
maßgeblich. Das bestehende A4-Dokumentlayout der
[Kompaktansicht](../../features/kompaktansicht.md) bildet die verbindliche
Darstellungsgrundlage.

## Bestätigte Entscheidungen

### Umfang der ersten Umsetzung

- Die erste Umsetzung erzeugt und speichert ausschließlich eine PDF-Datei.
- Eine direkte Druckfunktion gehört nicht zu diesem Arbeitspaket und bleibt
  einer möglichen späteren Erweiterung vorbehalten.
- Die erste Umsetzung bleibt bei dem bestätigten einseitigen A4-Hochformat der
  Kompaktansicht.
- Eine mehrseitige Ausgabe gehört weiterhin nicht zum ersten PDF-Export.

### Verfügbarkeit und Datengrundlage

- Die Exportaktion wird ausschließlich in der Kompaktansicht angezeigt. In der
  Planansicht und der Monatsvorschau ist kein Export-Button sichtbar.
- Exportiert wird immer der regulär gespeicherte Ausgangsstand, der auch in der
  Kompaktansicht dargestellt wird.
- Bestehen ungespeicherte Entwurfsänderungen, weist ein Bestätigungsdialog vor
  dem Speicherdialog ausdrücklich darauf hin, dass diese Änderungen nicht in
  der PDF enthalten sind.
- Die Bestätigung speichert oder verwirft den Entwurf nicht. Nach Zustimmung
  wird ausschließlich der gespeicherte Ausgangsstand exportiert.
- Ohne ungespeicherte Änderungen öffnet die Exportaktion unmittelbar den
  Speicherdialog.
- Während eines laufenden Exports wird die Exportaktion deaktiviert und ein
  erneutes Auslösen verhindert.
- Passt der gespeicherte Plan nicht vollständig und lesbar auf die bestätigte
  A4-Seite, bleibt die sichtbare Exportaktion deaktiviert. Der bereits in der
  Kompaktansicht vorhandene Überlaufhinweis erklärt die Ursache.
- Monatsvorschau, laufendes Speichern und eine noch nicht bestätigte
  Sicherungswiederherstellung benötigen keinen eigenen Exportzustand, weil die
  Kompaktansicht in diesen Zuständen bereits nicht verfügbar ist.

### Vorgeschlagener Dateiname

- Der Speicherdialog schlägt den Namen `YYYY-MM - Plantitel.pdf` vor.
- Ein Plan mit dem Titel `Dienstplan der Regelgruppe` für September 2026 erhält
  beispielsweise den Vorschlag
  `2026-09 - Dienstplan der Regelgruppe.pdf`.
- Der Benutzer kann den vorgeschlagenen Namen im Speicherdialog ändern.
- Für Windows-Dateinamen unzulässige Zeichen werden im Vorschlag durch einen
  Bindestrich ersetzt. Überlange Vorschläge werden sinnvoll gekürzt, ohne den
  Plantitel im Monatsplan zu verändern.
- Die Dateiendung `.pdf` wird sichergestellt.

### Vorausgewählter Speicherort

- Beim ersten Export einer App-Sitzung öffnet sich der native Speicherdialog im
  persönlichen Windows-Ordner `Dokumente`.
- Nach einem erfolgreichen Export wird dessen Ordner für weitere Exporte
  innerhalb derselben laufenden App-Sitzung vorausgewählt.
- Nach einem Neustart beginnt die Auswahl wieder im Ordner `Dokumente`.
- Eine dauerhaft gespeicherte Exportordner-Einstellung gehört nicht zur ersten
  Umsetzung.
- Im Speicherdialog kann jederzeit ein anderer lokaler Ordner gewählt werden.

### Vorhandene Zieldatei

- Wählt der Benutzer einen bereits vorhandenen Dateinamen, übernimmt der
  native Windows-Speicherdialog die Rückfrage zum Überschreiben.
- Die vorhandene Datei wird erst nach der ausdrücklichen Bestätigung ersetzt.
- Ein Abbruch der Rückfrage oder des Speicherdialogs verändert die vorhandene
  Datei nicht.
- Die Anwendung zeigt keinen zusätzlichen eigenen Überschreibdialog und
  erzeugt nicht automatisch Namensvarianten wie `(1)` oder `(2)`.

### Zustände und Rückmeldungen

- Bei ungespeicherten Änderungen erscheint vor dem nativen Speicherdialog der
  vereinbarte Hinweis auf den ausschließlich gespeicherten Exportstand.
- Der Abbruch dieses Hinweises oder des Speicherdialogs gilt nicht als Fehler.
  Er erzeugt keine Erfolgs- oder Fehlermeldung.
- Nach Auswahl des Zielpfads zeigt die Exportaktion einen Spinner mit dem Text
  `PDF wird erstellt …`.
- Während der Erzeugung bleiben Export, Ansichtswechsel und planwechselnde
  Aktionen deaktiviert. Die Kompaktansicht bleibt unverändert sichtbar.
- Nach erfolgreichem Abschluss erscheint kurz `PDF wurde gespeichert.`.
- Bei einem Fehler erscheint oberhalb der Kompaktansicht dauerhaft
  `PDF konnte nicht gespeichert werden.`. Eine verständliche Ursache wird
  ergänzt, soweit sie bekannt ist.
- Nach einem Fehler wird die Exportaktion erneut freigegeben.
- Abbruch und Fehler verändern weder den Monatsplan noch den ungespeicherten
  Entwurf.
- Ein automatisches Öffnen der PDF oder des Zielordners gehört nicht zur ersten
  Umsetzung.

### Technische Grundlage und Sicherheitsgrenzen

- Die PDF wird mit der in Electron vorhandenen Funktion `printToPDF` erzeugt.
  Eine zusätzliche PDF-Laufzeitbibliothek wird nicht eingeführt.
- Die PDF ist kein Bildschirmfoto. Sie verwendet dieselbe
  `CompactPlanDocument`-Komponente und dasselbe aus dem gespeicherten Planstand
  erzeugte Darstellungsmodell wie die sichtbare Kompaktansicht.
- Für die Ausgabe wird eine ausschließlich im Druck sichtbare Instanz des
  Dokuments verwendet. Graue Arbeitsfläche, Schatten, Warnungen und
  Bedienelemente erscheinen nicht in der PDF.
- Verbindliche Druckregeln setzen A4-Hochformat, keine zusätzlichen
  Seitenränder und vollständig ausgegebene Hintergrundfarben.
- Vor dem Öffnen des Speicherdialogs muss die A4-Passungsprüfung abgeschlossen
  sein. Während der Messung und bei Überlauf bleibt der Export deaktiviert.
- Die Oberfläche fordert den Export ausschließlich über die abgesicherte
  Preload-/IPC-Schnittstelle an. Sie erhält keinen allgemeinen
  Dateisystemzugriff und schreibt keine beliebigen Dateien selbst.
- Der Main Process validiert die Exportanfrage, öffnet den nativen
  Speicherdialog, erzeugt die PDF aus dem anfragenden Fenster und schreibt sie
  ausschließlich an den dort gewählten Zielpfad.
- Der Export verändert weder Datenmodell noch Monatsplan-Persistenz oder
  Sicherungsdateien.

### Platzierung und sichtbare Texte

- Die Exportaktion steht in der ausgeklappten Planungswerkzeugleiste rechts
  neben dem Umschalter `Plan | Kompakt`.
- Sie wird nur angezeigt, wenn die Kompaktansicht aktiv ist.
- Im Normalzustand lautet ihre sichtbare Beschriftung `Export`. Zugänglicher
  Name und Tooltip lauten `Dienstplan als PDF exportieren`.
- Während der Erzeugung zeigt sie einen Spinner und den Text
  `PDF wird erstellt …`.
- Bei ungespeicherten Änderungen erscheint ein Bestätigungsdialog mit:
  - Titel: `Gespeicherten Stand exportieren?`
  - Text:
    > Die PDF enthält nur den zuletzt gespeicherten Stand. Deine
    > ungespeicherten Änderungen werden nicht exportiert und bleiben im Plan
    > erhalten.
  - sekundärer Aktion: `Abbrechen`
  - primärer Aktion: `Gespeicherten Stand exportieren`
- Ohne ungespeicherte Änderungen wird der Bestätigungsdialog übersprungen und
  unmittelbar der native Speicherdialog geöffnet.

## Verifikation

### Automatisierte Anwendungsprüfungen

- Dateinamensbildung, Ersetzung unzulässiger Zeichen, sinnvolle Kürzung und
  sichergestellte Dateiendung werden als reine Logik geprüft.
- Die Exportaktion wird ausschließlich in der Kompaktansicht angeboten und
  bleibt während Passungsmessung, Überlauf und laufender Erzeugung deaktiviert.
- Der Bestätigungsdialog erscheint nur bei ungespeicherten Änderungen.
- IPC- und Main-Process-Tests prüfen validierte Anfragen, Druckoptionen,
  Startordner, Sitzungsordner, Dialogabbruch, Dateischreiben und Fehlerfälle.
- Die vollständigen Projektprüfungen `npm test`, `npm run typecheck`,
  `npm run lint` und `npm run format:check` werden ausgeführt.

### Prüfung der erzeugten PDF

- Die erzeugte Datei wird technisch auf genau eine A4-Seite im Hochformat und
  auf die erwarteten Textinhalte geprüft.
- Sie darf keine Navigation, Arbeitsfläche, Warnung oder Bedienelemente der
  Anwendung enthalten.
- Ein Plan mit ungespeicherten Änderungen wird gegen den ausschließlich
  exportierten gespeicherten Stand geprüft.
- Die PDF wird in Bilder gerendert. Das gerenderte Ergebnis wird mit der
  Kompaktansicht auf vollständige Inhalte, Farben, Linien, Schriftgrößen,
  Umbrüche und Seitenränder verglichen.
- Externe PDF-Prüfwerkzeuge werden nur für die Entwicklung und Abnahme
  verwendet und nicht als Laufzeitabhängigkeit der Anwendung aufgenommen.

### Gemeinsame Sichtprüfung

- Geprüft werden mindestens ein Normalfall mit sechs bis sieben Mitarbeitern
  und der Grenzfall mit neun Mitarbeitern und 31 Tagen.
- Die Sichtprüfung umfasst Planungseinträge, Feiertage, Wochenenden,
  Bemerkungen, Abschlusszeilen und den Freigabebereich.
- Die fertige Datei wird zusätzlich in einem üblichen PDF-Programm unter
  Windows geöffnet und durch den Benutzer abgenommen.

## Abschluss der Abstimmung

Alle fachlichen, gestalterischen und technischen Entscheidungsblöcke für die
erste einseitige PDF-Ausgabe sind bestätigt. Die anschließende Umsetzung ist
im [Umsetzungsplan PDF-Export](umsetzungsplan-pdf-export.md) dokumentiert.
