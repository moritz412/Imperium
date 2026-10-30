# Spielbare Testschlacht – Vorgabe (30.10.2026)

Ziel: Eine kleine, echte Echtzeitschlacht als eigene Seite `dev/proto/schlacht_spiel.html`, am iPad spielbar.
Das Spiel (`dev/imperium.html`) wird **nicht** angefasst. Der Code soll später für S1/S3/S4/S6 (`schlacht_umsetzung.md`) übernommen werden,
also sauber in Abschnitte gegliedert: Figurenmotor · Gelände · Einheiten/Formation · Kampfregeln · KI · Steuerung · Oberfläche.

## Grundlage
- Figuren und GPU-Skinning genau wie `dev/proto/schlacht_figuren.html` (Pakete `dev/proto/figuren/k_*.json`, Format in `dev/pc/blender/backen.py`).
  Clips je Paket: stehen, gehen, laufen, fliehen, stehen_bereit, schlag_a, schlag_b, stoss_speer, abwehr_schild, treffer, sterben_vorn, sterben_hinten, jubeln.
  Pakete sind in three.js-Koordinaten, Figur blickt nach +Z, 1 Einheit = 1 m.
- three.js r128 von cdnjs, keine weiteren Bibliotheken, keine neue Beleuchtungsbibliothek.

## Aufstellung (fest für den Test)
- Spieler Rom: 3 × Hastati (A1). Gegner Karthago: 2 × Libysche Speerträger (A2), 1 × Iberische Scutarii (A3), 2 × Keltische Krieger (A6).
- 40 Figuren je Einheit (Formation 10 breit × 4 tief, Abstand 1,2 m). Heere 120 m auseinander auf ebenem Feld 400 × 300 m (leichte Bodenwellen erlaubt).

## Ablauf
1. Ladeschirm mit echtem Fortschritt (Pakete laden).
2. Aufstellung: eine Zeile oben „Ziehe deine Einheiten. Dann: Schlacht beginnen.“, Knopf **Schlacht beginnen**.
3. Schlacht: Einheiten bewegen sich, kämpfen, fliehen. Pause und Tempo 1×/2×.
4. Ende, wenn eine Seite ganz flieht oder fällt: Tafel „Sieg“/„Niederlage“ mit Gefallenen je Seite, Knopf **Noch einmal**.

## Steuerung (Touch zuerst, Maus geht mit)
- Einheit oder ihre Karte antippen = wählen (Ring am Boden unter der Einheit).
- Gelände antippen = gewählte Einheit geht dorthin (Formation bleibt, dreht sich in Laufrichtung).
- Doppelt tippen auf Gelände = laufen; auf Feind tippen = angreifen (laufen, dann Nahkampf).
- Ein Finger ziehen auf leerem Gelände = Kamera schieben; zwei Finger = drehen und zoomen.
- Rechte Spalte, **untereinander**: Halten/Angreifen (Haltung der gewählten Einheit) · Pause · Tempo.
- Unten Einheitenkarten: Name, Mannstärke, Moral als Ring. Lange drücken auf Karte = Erklärkarte mit Werten.

## Regeln (einfach, später ausbaubar)
- Werte je Typ (Angriff, Abwehr, Moral, Tempo Gehen/Laufen in m/s):
  Hastati 10/11/70/1,3/3,8 · Libyer 9/12/65/1,3/3,6 · Iberer 11/9/60/1,4/4,0 · Kelten 12/8/55 (starker Ansturm)/1,4/4,2.
- Bewegung: Einheit als Block, Figuren laufen zu ihren Formationsplätzen (gehen/laufen-Clip, sonst stehen_bereit).
- Nahkampf, sobald sich Fronten auf ≤ 2 m nähern: Figuren in der ersten Reihe spielen schlag_a / schlag_b / stoss_speer (Speerträger) / abwehr_schild zufällig versetzt.
  Verluste je Sekunde = Grundrate × Angriff/Abwehr × Flankenfaktor (Seite 1,5, Rücken 2) × Ansturmfaktor (erste 3 s nach Anlauf 1,5, Kelten 2).
  Gefallene: treffer → sterben_vorn/hinten, bleiben liegen (Leichen bis zum Ende sichtbar, eigener Bestand).
- Moral: sinkt mit Verlusten, Flankenangriff, fliehenden Nachbarn; steigt langsam, wenn nicht im Kampf. Unter 25 → Einheit flieht (fliehen-Clip, weg vom Feind). Fliehende werden verfolgt und verlieren weiter.
- Feind-KI: rückt geschlossen vor, greift nächste Einheit an, Kelten stürmen zuerst. Einfach und vorsichtig.

## Oberfläche
- „Spiel statt Software“ (`dev/docs/design_leitlinie.md`): Pergament/Bronze, gemalte Wirkung, keine Programm-Optik, Knöpfe in einer Spalte.
- Deutsche Texte, Zahlen höchstens eine Nachkommastelle. Bildrate oben rechts (gemessen).
- Sichere Ränder (env(safe-area-inset-*)), iPad quer ist Hauptformat.

## Prüfen
- Keine Konsolenfehler. Zum Testen `window.SCHLACHT` mit Zustand (Phase, Einheiten mit Stärke/Moral/Zustand) und Hilfsfunktionen
  (`SCHLACHT.befehl(einheit, x, z, laufen)`, `SCHLACHT.angriff(einheit, ziel)`, `SCHLACHT.start()`), damit eine Schlacht automatisch durchgespielt werden kann.
- Echtes iPad: nicht getestet, bis Moritz es meldet.
