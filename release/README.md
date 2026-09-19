# Release-Vorlagen

Dieser Ordner enthält ausschließlich versionierte Vorlagen für die private
Pilot-Auslieferung. Fertige Installer, Prüfsummendateien, Benutzerdaten und
ausgefüllte Release-Nachweise werden außerhalb des Git-Repositorys aufbewahrt.

- `LIESMICH.txt` wird für den Übergabeordner des Pilotnutzers kopiert und vor
  der Übergabe um die tatsächliche SHA-256-Prüfsumme ergänzt.
- `release-nachweis.md` wird für jeden Release-Kandidaten kopiert und erst mit
  tatsächlich ausgeführten Prüfungen ausgefüllt.

Nicht ausgefüllte Felder sind mit `<...>` gekennzeichnet. Ein solcher
Platzhalter darf im freigegebenen Übergabeordner oder finalen Nachweis nicht
mehr vorhanden sein.
