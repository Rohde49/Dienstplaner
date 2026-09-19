# Lizenzierung

## Dienstplaner 1.0.0

Der selbst entwickelte Dienstplaner-Code der Version `1.0.0` wird unter der
MIT-Lizenz bereitgestellt.

- **Rechteinhaber und Autor:** Jeremy Louis Rohde
- **Copyright-Jahr:** 2026
- **Maßgeblicher Lizenztext:** [`LICENSE`](../../LICENSE)
- **Kontaktangabe in den Auslieferungsmetadaten:** keine

Der private Pilotstatus und die fehlende öffentliche Bereitstellung schränken
die durch MIT eingeräumten Rechte nicht ein. Eine spätere Lizenzentscheidung
kann die Lizenz der bereits als `1.0.0` freigegebenen Fassung nicht
rückwirkend ändern.

## Fremdsoftware

Die Anwendung verwendet Open-Source-Abhängigkeiten mit eigenen
Lizenzbedingungen. Die Datei
[`THIRD_PARTY_NOTICES.txt`](../../THIRD_PARTY_NOTICES.txt) wird reproduzierbar
aus dem in `package-lock.json` festgelegten Produktionsabhängigkeitsgraphen und
den lokal installierten Paket-Lizenzdateien erzeugt.

Die Erfassung ist bewusst konservativ: Sie kann deklarierte
Laufzeitabhängigkeiten enthalten, deren Code beim Bündeln nicht in die
Anwendung gelangt. Ein zusätzlich aufgeführter Hinweis erweitert weder den
tatsächlichen Paketinhalt noch ändert er die Lizenz eines Bestandteils.

Die Erzeugung und Prüfung erfolgen ohne zusätzliche Abhängigkeit:

```text
npm run licenses:generate
npm run licenses:check
```

Fehlt einem Paket ein eigener Lizenztext, bricht die Erzeugung grundsätzlich
ab. Für ein Paket, das MIT sowie einen Autor in seinen Paketmetadaten nennt,
darf das Skript ersatzweise einen ausdrücklich gekennzeichneten MIT-Text
erzeugen. Dieser Sonderfall bleibt in den Fremdlizenzhinweisen sichtbar.

Electron bringt zusätzlich seine eigene Lizenz und die Chromium-Hinweise
`LICENSES.chromium.html` in das Anwendungspaket ein. Diese von Electron
erzeugten Dateien werden beim finalen Paket- und Installer-Build gesondert
kontrolliert; sie werden nicht durch `THIRD_PARTY_NOTICES.txt` ersetzt.

## Auslieferung

`LICENSE` und `THIRD_PARTY_NOTICES.txt` werden über die
Electron-Packager-Konfiguration als zusätzliche Ressourcen in die installierte
Anwendung aufgenommen. Dieselben geprüften Texte werden außerdem mit dem
USB-Übergabepaket bereitgestellt. Eine eigene Seite für rechtliche Hinweise in
der Oberfläche gehört nicht zum privaten Pilotumfang.

## Mögliche spätere Lizenzänderung

Eine proprietäre Lizenzierung ist höchstens für eine klar bezeichnete spätere
Version denkbar und muss vor ihrer Umsetzung erneut entschieden sowie rechtlich
und technisch geprüft werden. Der zugehörige
[Zukunftsplan](../planung/zukunft/umsetzungsplan-proprietaere-lizenzierung.md)
ist keine Lizenzänderung und gilt nicht für `1.0.0`.
