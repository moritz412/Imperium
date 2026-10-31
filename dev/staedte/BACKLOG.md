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
- [x] S1.2 Laufwege (31.10. abends): Jeder Betrieb holt Arbeiter aus den nächsten Häusern in Laufweite (`EINZUG` = 16 Felder,
      Priorität zuerst), sonst Problem „Keine Häuser in Laufweite“. Arbeiter laufen sichtbar zwischen Haus und Betrieb
      (höchstens 2 Figuren je Haus–Betrieb-Paar), Träger mit Warensack vom Erzeuger zum nächsten Abnehmer (Mühle, Bäckerei,
      Ziegelei, Markt, sonst Speicher). Wege als L-Form ohne Straßen (kommt mit S1.3), Figuren halten bei Pause an.
      Gebäudefenster: Häuser in Laufweite, je Haus „Gehen zur Arbeit“. Test 18/18 (PC, `PW_GPU=1`).
      Offen: Träger sind nur Anzeige (Waren bleiben im gemeinsamen Lager), Figuren laufen noch durch Gebäude.
      **Nicht getestet:** iPad.
- [x] S1.3 Straßen (31.10. abends): Neues Spiel beginnt mit einer Landstraße (z = 12, 38 Felder). Jedes Gebäude außer
      Straße und Brunnen braucht ein Straßenfeld direkt an der Grundfläche („Hier fehlt eine Straße vor der Tür“).
      Markt versorgt nur Häuser, die er über Straßen in höchstens 20 Feldern erreicht (Breitensuche); Brunnen weiter
      per Umkreis. Läufer gehen auf den Straßen (ohne Verbindung weiter querfeldein). Straßen-Baumodus: mit einem Finger
      ziehen legt Straße statt die Karte zu verschieben. Straßen ohne Fugen.
      Alte Spielstände ohne Straßen bleiben ladbar, Märkte versorgen dort aber erst nach Straßenbau.
      Straßen-Ziehen per Maus im Test geprüft (20/20). **Nicht getestet:** iPad, Ziehen mit dem Finger.
- [x] S1.4 Ansichten (31.10. abends): Spalte links unter der Kopfleiste mit Wasser, Stimmung, Arbeit (antippen = an/aus),
      Legende daneben. Wasser: Brunnenbereich blau, Häuser grün/rot. Stimmung: Straßen in Marktreichweite gelb, Häuser nach
      Versorgung (Wasser, Markt, Brot). Arbeit: Betriebe nach Besetzung, Häuser mit freien Arbeitern blau. Farbe als Fläche
      unter dem Gebäude + schwaches Leuchten. Test 24/24 (PC, ). **Nicht getestet:** iPad.
- [x] S1.5 Startseite (31.10. abends): beim Laden und über Menü „Provinz wählen / neu gründen“. Italienkarte (SVG, grobe
      Umrisse, Padus, Tiberis, Roma) mit Cremona, Florentia, Puteoli, Luceria; Regionskarte mit Gründung, Rohstoffen,
      Schwierigkeit (Daten  in daten.js). Nur Cremona wählbar, die anderen entsättigt mit Schloss.
      Hintergrund img/ep_0.webp. Knöpfe in einer Spalte: Weiterspielen (wenn Stand da) / neu gründen (mit Rückfrage).
      Zeit läuft erst nach dem Schließen. Gebaut ohne Blick auf das Mockup „Startregion“ (Canvas von hier nicht erreichbar),
      nach dem Konzepttext. Test 25/25 (PC, ). **Nicht getestet:** iPad, Abgleich mit dem Mockup.
- [ ] S1.6 Ton (Hintergrund, Bauen, Jahreszeit) aus vorhandener Pipeline.

## Später
Stufe 2 Region & Transport · Stufe 3 Forschung & Stände · Stufe 4 Familie & Politik · Stufe 5 Ereignisse & Wahrzeichen ·
Stufe 6 weitere Regionen, Verbindung Hauptspiel.

## Offene Entscheidungen (Moritz)
- Raster quadratisch (jetzt) oder frei drehbar wie Manor Lords?
- Region als Hex-Felder oder freie Landschaft?
- Länge eines Spieljahres (jetzt: 1 Monat = 5 s bei normalem Tempo → 1 Jahr = 1 min).
- Sklaven als Stand oder Tagelöhner?
