# Kompaktansicht

Die Kompaktansicht soll einen Monatsplan in einer verkürzten, nicht
bearbeitbaren Bildschirmdarstellung zeigen. Sie ist ein eigenständiges Feature
für die schnelle Übersicht und keine Druckvorschau.

## Zweck und Umfang

Die Kompaktansicht dient dazu, die wichtigsten Inhalte eines Monatsplans mit
weniger visuellen Details als die bearbeitbare Planungstabelle zu überblicken.

Dabei gelten folgende Grundsätze:

- Die Ansicht ist schreibgeschützt.
- Sie verwendet denselben Monatsplan und dieselben Snapshots wie die
  Planungsseite.
- Sie erzeugt keine zweite Planversion und keinen eigenen Datenbestand.
- Sie verwendet die zentralen Berechnungsregeln und führt keine abweichenden
  Kennzahlen ein.
- Sie bleibt von Druck und PDF-Export unabhängig.

## Verhältnis zur Planungsseite

Die [Planungsseite](./planungsseite.md) bleibt der Ort für das Anlegen,
Bearbeiten und Speichern eines Monatsplans. Die Kompaktansicht darf dort keine
Bearbeitungsfunktion ersetzen.

Ein Wechsel in die Kompaktansicht verändert den Plan nicht. Ist der betrachtete
Planstand noch nicht gespeichert, muss dieser Entwurfsstatus eindeutig
erkennbar bleiben.

## Datengrundlage und Darstellung

Die Ansicht verwendet ausschließlich den aktuell ausgewählten Monatsplan. Namen,
Rollen, Reihenfolge, Farben, Einträge, Uhrzeiten, Rufbereitschaften und
Bemerkungen stammen aus seinen gespeicherten beziehungsweise im Entwurf
gehaltenen Snapshots.

Die Darstellung muss:

- Mitarbeiter und Kalendertage eindeutig zuordenbar halten,
- Planungseinträge auch ohne Farberkennung verständlich zeigen,
- Wochenenden und Feiertage textlich oder strukturell erkennbar machen,
- leere und belegte Planungszellen unterscheiden und
- bei der kleinsten unterstützten Fenstergröße benutzbar bleiben.

## Noch fachlich festzulegen

Vor der Umsetzung sind insbesondere zu entscheiden:

- welchen eigenständigen Nutzen die Kompaktansicht im Arbeitsablauf erfüllt,
- welche Spalten und Planinformationen sie tatsächlich zeigt,
- ob sie den aktuellen Entwurf oder ausschließlich einen gespeicherten Stand
  darstellen darf,
- wie sie von der Planungsseite aus geöffnet und wieder verlassen wird und
- ob das Feature nach Klärung des Nutzens weiterhin benötigt wird.

Bis diese Fragen beantwortet sind, werden keine konkreten Tabelleninhalte oder
Bedienaktionen erfunden.

## Abgrenzung

Die im Altsystem als „Druckvorschau“ bezeichnete verkürzte Bildschirmtabelle
wird nicht unter dieser Bezeichnung übernommen. Eine Bildschirmansicht ist nur
dann eine echte Druckvorschau, wenn sie das spätere Ausgabedokument verlässlich
abbildet.

Die Kompaktansicht:

- legt kein Seitenformat fest,
- garantiert keine Übereinstimmung mit einer PDF-Datei,
- löst keinen Druckvorgang aus und
- ist keine Voraussetzung für den [PDF-Export](./pdf-export.md).
