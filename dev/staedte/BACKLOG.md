# Backlog – Imperium der Epochen: Städte Roms

Konzept: `dev/staedte/docs/konzept.md`. Quelle: `dev/staedte/` (mehrere Dateien, ES-Module, Three.js r128 per CDN).
Veröffentlicht unter `staedte/` (https://moritz412.github.io/Imperium/staedte/), kopiert von `deploy.py` bzw.
`python dev/tools/deploy_staedte.py` (nur Städte Roms, ohne das Hauptspiel neu zu bauen).

## Stufe 1 – Stadtkern (läuft)
- [x] S1.0 Grundgerüst (31.10.): Schrägsicht-Kamera (orthografisch, Wischen/Zwei-Finger-Zoom/Mausrad), 40×40-Raster,
      Fluss und Wald am Rand, Bauen per Ziehen aus der Leiste (oder Karte antippen, dann Feld antippen),
      11 Gebäude, Ketten Brot (Feld → Mühle → Bäckerei) und Ziegel (Lehmgrube → Ziegelei), Holzfäller braucht Wald,
      Hütte → Casa (Brot + Brunnen + Markt in Reichweite), Arbeiter mit Priorität, Stimmung, Steuern,
      Jahreszeiten mit Ernte im Herbst und Bodenfarbe je Jahreszeit, Problem-Symbole über Gebäuden,
      Gebäudefenster mit Kette und Ursache, Senatsaufträge als Tutorial, Speichern im Browser.
      Test `dev/tests/staedte_t.js` in der Cloud (Software-Rendering, Chrome): 14/14 – Bauen per API und Ziehen (Maus),
      2 Spieljahre: 69 Einwohner, 4 Casas, alle 6 Aufträge, keine Hungersnot. Brot am Ende knapp (2) – Balance beobachten.
      **Nicht getestet:** echtes iPad, echte Touch-Gesten (Wischen, Zwei-Finger-Zoom, Ziehen mit dem Finger).
- [x] S1.1 Gebäudemodelle (31.10. abends): `dev/pc/blender/staedte_geb.py` baut per Skript (Blender 5.2, headless) 10 Gebäude
      + Mühlstein mit Esel als Low-Poly mit Farbe je Ecke → `models/staedte_geb.json` (8.700 Dreiecke, 0,75 MB):
      Hütte (Lehm/Fachwerk, Strohdach), Casa (Putz, Ziegeldach, Hof mit Mauer, Laube, Baum), Mühle (zwei Esel-Mühlen, drehen
      sich), Bäckerei (Tresen, Kuppelofen), Markt (Tholos mit Brunnen, 4 Stände), Speicher (Horreum mit Strebepfeilern),
      Holzfäller (Blockhütte, Stammstapel), Lehmgrube, Ziegelei (Brennofen, Trockenschuppen), Brunnen (lacus).
      Feld und Straße bleiben gezeichnet. Fehlt die Datei, zeigt das Spiel weiter die Quader. Test 14/14 (PC, `PW_GPU=1`),
      Nahaufnahmen angesehen. **Nicht getestet:** iPad (Bildrate mit vielen Gebäuden), Hauptspiel nutzt die Modelle noch nicht.
- [ ] S1.2 Laufwege: Bewohner und Träger sichtbar, Einzugsbereich der Arbeit statt globaler Arbeiter.
- [ ] S1.3 Straßen mit Wirkung (Bau nur an Straße, Markt-Reichweite über Straßen).
- [ ] S1.4 Overlays Wasser, Stimmung, Arbeit.
- [ ] S1.5 Startbildschirm mit Regionswahl (Mockup „Startregion“), zunächst nur Cremona aktiv.
- [ ] S1.6 Ton (Hintergrund, Bauen, Jahreszeit) aus vorhandener Pipeline.

## Später
Stufe 2 Region & Transport · Stufe 3 Forschung & Stände · Stufe 4 Familie & Politik · Stufe 5 Ereignisse & Wahrzeichen ·
Stufe 6 weitere Regionen, Verbindung Hauptspiel.

## Offene Entscheidungen (Moritz)
- Raster quadratisch (jetzt) oder frei drehbar wie Manor Lords?
- Region als Hex-Felder oder freie Landschaft?
- Länge eines Spieljahres (jetzt: 1 Monat = 5 s bei normalem Tempo → 1 Jahr = 1 min).
- Sklaven als Stand oder Tagelöhner?
