# Leitlinie „Spiel statt Software“ – Menüs in Imperium der Epochen

Kernsatz: Jedes Fenster ist ein Ort im Reich (Kriegsrat, Schreibstube, Schatzkammer), kein Formular.
Klare Übersicht ja, aber über Bilder, Material und Gestaltung – nicht über Tabellen, Reiter und Legenden.

## Prinzipien
1. **Bild zuerst.** Jeder Bereich beginnt mit einem großen Bannerbild (vorhandene r_*, ep_*, ev_*, b_*-Bilder).
   Karten/Einträge tragen ein Bild (Ausschnitt variieren, wenn nur ein Motiv da ist). Kein Fenster ohne Bild.
2. **Zustände gestalten, nicht erklären.** Erledigt = gedämpft, Sepia, Bronze-Siegel ✓. Möglich = leuchtender
   Bronzerand, warmer Schein. Gesperrt = entsättigt + „🔒 Benötigt X“ direkt auf der Karte. Keine Symbol-Legende.
3. **Infos sichtbar statt versteckt.** Wirkung, Kosten, Dauer („≈ 3 Runden“), Bedingung stehen auf der Karte.
   Antippen = handeln (wählen, bauen), nicht „Details öffnen“. Detailblätter nur für echte Zusatzinhalte.
4. **Wenige Reiter.** Höchstens 3–4 Reiter je Bereich; lieber eine scrollbare Seite mit Abschnitten und einer
   Sprungleiste aus Bild-Chips (rund, mit Zähler) als ein Software-Reiterband. Unterreiter vermeiden.
5. **Ziele sichtbar machen.** Das große Ziel (Epochenwende, Sieg, Großbau) als Banner oben mit Fortschrittsbalken
   und Medaillons – erzeugt Motivation.
6. **Entscheidungen inszenieren.** Wahl zwischen zwei Dingen = „Scheideweg“: zwei Karten nebeneinander,
   rotes „oder“-Wachssiegel, ein Satz zur Tragweite („nur eine in dieser Epoche“, „für immer“).
7. **Wege statt Diagramme.** Abfolgen als Pfad mit Bronzelinie und Rauten-Wegmarken (gefüllt = erreicht,
   glühend = als Nächstes), Abzweige mit gestrichelter Linie. Keine Baum-/Flussdiagramm-Optik.
8. **Typografie.** Marcellus (var(--f-display)) für Namen, Titel, Banner, Zahlen-Medaillons; Alegreya Sans
   für Fließtext. Keine VERSALIEN-Etiketten über jedem Block, keine Mini-Schrift unter 11,5 px.
   Zahlen in Bronze hervorheben, Einheit klein dahinter („18 P“, „3/11“).
9. **Material & Ornament sparsam.** Bronze-Verlauf für Primäres, dunkles Holz/Leder (#2e261d→#241d16) für Karten,
   Wachssiegel für Wahl, Goldlinie unter Titeln. Ein Schmuckelement je Fenster, nicht auf jeder Zeile.
10. **Ein Knopfstil.** Menüeinträge immer als Plakette: Bronze-Icon (img/ui_*) links, Titel in Marcellus,
    eine Zeile Erklärung darunter. Primäraktion groß in Bronze oben, Gefährliches (Neues Spiel) rot unten.
    Seltenes in „Mehr …“ (zweite Ebene) statt langer Listen.
11. **Touch.** Ziele ≥ 44 px (min. 34 px in dichten Listen), Abstand ≥ 8 px; Handy quer (844×390):
    Banner auf ~100 px kürzen, Sprungleiste sticky, Fließtext auf 3 Zeilen kürzen, nie quer scrollen.
12. **Sprache.** Spielwelt-Wörter („Das Tor zur nächsten Epoche“, „Scheideweg“, „Wird erforscht“) statt
    Systemwörter („Status“, „Knoten“, „Details“, „verfügbar“).

## Menüs mit dem stärksten Software-Eindruck (Vorschläge, nicht umgesetzt)
- **Einstellungen (Ton/Grafik/Oberfläche/Offline):** Schalter- und Schiebereglerlisten wie OS-Einstellungen.
  → Jede Gruppe als Plakette mit Icon (Horn, Fackel …); Grafikstufen als drei Bildkarten mit Vorschaubild
  der Karte (leicht/mittel/hoch) statt Segmentknopf.
- **Speichern/Laden:** Textzeilen mit Datum. → Spielstand-Karten mit Wappen, Herrschername, Epochenbild,
  Runde/Jahr in Marcellus; Autosave als eigene „Chronik“-Karte oben.
- **Wirtschaft → Haushalt/Waren:** Tabellen mit vielen Zahlen. → Schatzkammer-Ansicht: Einnahmen/Ausgaben
  als zwei Waagschalen-Säulen, Waren als Bildkacheln (Warenbild, Lager, Trend-Pfeil), Tabelle als Aufklapper.
- **Wirtschaft → Provinzen/Siedlungen:** lange Listen. → Kacheln mit Stadtbild (b_*-Bilder) und 2–3 Kennzahlen,
  Sortierchips statt Tabellenkopf.
- **Diplomatie → Verträge:** Listen mit Laufzeiten. → Urkunden-Karten (Pergament, Siegel des Partners,
  Restlaufzeit als Kerze/Balken).
- **Hof → Ämter/Statthalter:** Formular mit Auswahlfeldern. → Porträtkarten an einer „Tafel“, freie Ämter als
  leere Stühle mit „Ernennen“.
- **Chronik → Protokoll:** reiner Meldungs-Feed. → Nach Runden gruppiert mit kleinen Ereignisbildern (ev_*),
  wichtige Meldungen als größere Karte.
- **Hilfe „Steuerung und Regeln“:** eine lange Textliste. → Kapitelkarten mit Bild (Karte, Heer, Bauen …),
  ein Absatz je Karte, Suche optional.
- **Mehrspieler-Fenster:** technische Statuszeilen. → Sitzordnung als Wappenreihe, „am Zug“ als leuchtendes Wappen.
