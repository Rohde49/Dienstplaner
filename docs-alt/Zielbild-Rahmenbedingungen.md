# Umfang

## Technische Rahmenbedingungen

* Desktop-Anwendung
* Einzelplatzanwendung für einen Benutzer und dessen Team
* ausschließlich für Windows
* vollständig lokale Nutzung und Datenhaltung
* keine Server- oder Cloud-Komponenten
* Auslieferung ausschließlich über einen Installer
* Speicherung aller Daten auf dem Anwender-PC
* keine Lizenzkosten

## Umfang des Prototyps

Der Prototyp muss:

* Mitarbeiter beziehungsweise das Team verwalten,
* Planungseinträge und Eintragsarten verwalten,
* ein Dienstplangerüst für einen ausgewählten Monat erstellen,
* Planungseinträge im Dienstplan setzen,
* eine Auswertungstabelle für die Mitarbeiter erstellen,
* sämtliche Anwendungsdaten lokal speichern und laden,
* den Dienstplan als PDF exportieren und
* als installierbare Windows-Anwendung ausgeliefert werden können.

Nicht Bestandteil sind damit insbesondere Mehrbenutzerbetrieb, Server, Cloud-Synchronisation, Online-Konten, andere Betriebssysteme und eine portable Programmversion.

Diese Rahmenbedingungen bilden ab jetzt die verbindliche Grundlage für Design, Technologieauswahl, Tests, Entwicklungsumgebung und Auslieferung.

1. **Design**  --> Projektvorbereitung/Design/

   * Designziel.md
   * Farbkonzept.md
   * globale Farb-Basis.md
   * globale UI-Basis.md
   * globale Komponenten-Basis.md
   * visuelles Feedback.md
   * Navigations- und Seitenkonzept.md

2. **Technologie-Stack und Werkzeuge** Projektvorbereitung/Setup/

   * Electron
   * TypeScript
   * Vite
   * React
   * lokale Datenhaltung
   * notwendige Dependencies
   * Build- und Paketierungswerkzeuge

   Erst wenn das Design feststeht, können wir beurteilen, welche Technologien wirklich benötigt werden.

3. **Testkonzept** Projektvorbereitung/Tests/

   * Welche Teile müssen getestet werden?
   * Unit-, Komponenten-, Integrations- und E2E-Tests
   * geeignete Werkzeuge wie Vitest und Playwright
   * sinnvoller Umfang für die Bachelorarbeit

4. **PC und Entwicklungsumgebung einrichten** Projektvorbereitung/Setup/

   * benötigte Programme installieren
   * Versionen festlegen
   * Projekt erzeugen
   * Git und GitHub einrichten
   * Entwicklungs-, Test- und Build-Befehle konfigurieren

5. **Auslieferung konkret umsetzen**

   * Installer erzeugen
   * Speicherorte festlegen
   * Anwendung auf einem sauberen Rechner testen
   * gegebenenfalls Signierung und Update-Strategie
   * Installationsanleitung erstellen

Das Thema **Auslieferung** betrachten wir also zweimal: Die grundlegenden Anforderungen daran müssen wir am Anfang klären, die technische Umsetzung erfolgt am Ende.
