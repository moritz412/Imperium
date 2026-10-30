# PC-Plan Echtzeitschlacht (Stand 30.10.2026)

Ziel: Die Testschlacht soll sich wie eine echte große Feldschlacht anfühlen. Code-Seite (Bewegung, Zweikampf, Landschaft) läuft
über `dev/docs/schlacht_testschlacht_v2.md` und `schlacht_landschaft.md`. Hier steht, was **am PC** gebaut wird (Blender, FLUX, XTTS, MusicGen).
Grafikkarte nie doppelt belegen: Blender-Läufe sind CPU-lastig und dürfen parallel zur Warteschlange laufen, TRELLIS nicht.

## P1 – Mehr Leben in den Einheiten (zuerst, wirkt sofort)
- **Körpervarianten:** je Kit 3 Körper (leicht/mittel/schwer: Größe, Muskeln, Gewicht) und 2–3 Hauttöne/Gesichter (MPFB-Hautsätze), Tunika-Farbton ±10 %. Spiel wählt je Figur zufällig. Ziel: kein „Klonheer“.
- **Clip-Varianten:** gehen/laufen/stehen je 2 Varianten aus verschiedenen CMU-Aufnahmen (02, 143, 141, 91), Kampfschläge je 2 Varianten (Tempo, Ausholweite).
- **Saubere Schleifen:** Gang-Zyklen an Fußaufsätzen schneiden (Fersenhöhe auswerten), Anfang/Ende angleichen.
- **Fußgleiten:** Schrittgeschwindigkeit je Clip messen und als `speed` (m/s) ins Paket schreiben (`backen.py`); das Spiel passt die Abspielgeschwindigkeit an die echte Bewegung an.
- **Mehr Kampfbewegungen:** zweiter Stoß aus der Deckung, Nachsetzen (Schritt + Stoß), Stolpern, auf die Knie fallen, Schild heben gegen Geschosse.

## P2 – Pferd und Reiterei (S7)
- Pferdekörper: einfache, geschlossene Form per Skript (wie `teile_form.py`) oder TRELLIS-Pferd als Vorlage, dann eigenes Skelett `pf_*` (≤ 40 Knochen) mit automatischen Gewichten.
- Gangarten per Skript animiert: stehen, schritt, trab, galopp, ansturm, steigen, treffer, sterben (Zyklen nach Bewegungsstudien, z. B. Muybridge – nur als Vorlage für eigene Keyframes).
- Reiter: Sitzhaltung aus CMU 143_19, Clips reiten, schlag_reiter, lanze_gesenkt; Reiter am Pferd-Sattelknochen befestigt.
- Kits: **A5 Numider** (ohne Sattel/Zaum, Wurfspeere, kleiner Rundschild), römische Reiterei (equites).

## P3 – Kriegselefant (S9, für Hannibal)
- Körper + Skelett `el_*`, 8 Clips (stehen, gehen, ansturm, stampfen, treffer, panik, sterben, trompeten), Treiber auf dem Nacken (Kit **A8**), Decke.

## P4 – Fernkampf
- **A4 Balearische Schleuderer:** Clip schleuder (Wirbeln + Abwurf, per Skript), Schleuder als dünnes Formteil, Beutel.
- Bogen (CMU 79_86), Speerwurf/Pilum (CMU 141_11/143_20 + eigene Keyframes), Geschosse als einfache Formen.

## P5 – Landschaftsteile (für `schlacht_landschaft.md`)
- **Bodentexturen kachelbar** per FLUX (Gras grün/trocken, Erde, Feldweg, Fels; je 1024², nahtlos geprüft).
- **Himmel/Horizont:** FLUX-Panorama für Wolken und ferne Hügel (je Landschaftstyp), Ladebilder aus Job 41 liegen schon vor.
- **Bäume/Büsche/Steine:** einfache geschlossene Formen per Skript (Laubbaum, Pinie, Zypresse, Busch, Felsen) – TRELLIS nur, wenn die Form das braucht und das Teil groß bleibt.
- **Banner/Feldzeichen:** Stoffbahnen mit Farben je Seite, später Feldzeichen-Motive (eigene, keine fremden).

## P6 – Ton
- Rufe je Seite (XTTS, Deutsch gesprochen bzw. kurze lateinische/punische Ausrufe): Angriff, Sammeln, Sieg, Rückzug.
- Kampflärm, Wind, Marschtritt als Klangteppich (MusicGen, nicht kommerziell – passt zur Lizenz des Projekts).

## Reihenfolge-Vorschlag
P1 (sofort sichtbar) → P5 (Atmosphäre zusammen mit dem Landschafts-Code) → P2 → P3 → P4 → P6.
Jeder Schritt: `pruefen.py` + `backen.py --pruefen` + Nachbau aus dem Paket (`paket_ansehen.py`), Bild an Moritz, iPad-Test durch Moritz.
