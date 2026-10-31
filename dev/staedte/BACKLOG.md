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
      unter dem Gebäude + schwaches Leuchten. Test 24/24 (PC, `PW_GPU=1`). **Nicht getestet:** iPad.
- [x] S1.5 Startseite (31.10. abends): beim Laden und über Menü „Provinz wählen / neu gründen“. Italienkarte (SVG, grobe
      Umrisse, Padus, Tiberis, Roma) mit Cremona, Florentia, Puteoli, Luceria; Regionskarte mit Gründung, Rohstoffen,
      Schwierigkeit (Daten `REGIONEN` in daten.js). Nur Cremona wählbar, die anderen entsättigt mit Schloss.
      Hintergrund img/ep_0.webp. Knöpfe in einer Spalte: Weiterspielen (wenn Stand da) / neu gründen (mit Rückfrage).
      Zeit läuft erst nach dem Schließen. Gebaut ohne Blick auf das Mockup „Startregion“ (Canvas von hier nicht erreichbar),
      nach dem Konzepttext. Test 25/25 (PC, `PW_GPU=1`). **Nicht getestet:** iPad, Abgleich mit dem Mockup.
- [x] S1.6 Ton (31.10. abends): `js/ton.js`. Musik „rom_ant“ aus dem Hauptspiel (MusicGen) als eigene Datei
      `audio/st_rom.json` (0,9 MB statt 6 MB `m_eu.json`), Schleife mit Einblenden. Umgebung: leiser Wind, ab und zu Vögel.
      Geräusche per WebAudio wie `sfx()` im Hauptspiel: Bauen (Hammer), Straße, Abreißen, Casa-Aufstieg, Fehler,
      Jahreszeitwechsel (Harfenakkord je Jahreszeit). Start mit der ersten Berührung; Menü „Ton: an/aus“ (gespeichert).
      Test 26/26 (PC, `PW_GPU=1`: Ton läuft, Musik dekodiert, Schalter). **Nicht angehört**, Lautstärken nur geschätzt.
      **Nicht getestet:** iPad (Safari-Audio).

- [x] Stadtrang (31.10. abends, vorgezogen aus „Ziele“): Feldlager → Dorf (40 Einwohner) → Kleinstadt (120) → Kolonie (300)
      → Metropole (800), in der Kopfleiste vor dem Datum, Meldung + Klang beim Aufstieg, fällt nicht zurück. Test 27/27.

## Stufe 2 – Region & Transport (begonnen 31.10.)
Entschieden (Moritz 31.10.): Region als **Hex-Felder** (Regeln je Feld), aber als Landschaft gezeichnet, nicht als Spielbrett.
- [x] S2.1 Regionskarte (31.10. abends): Hex-Karte um Cremona (Ring 3 = 37 Felder, fest erzeugt: Acker, Wald im Westen,
      Hang im Norden, Weide/Lehm in der Aue, Padus durchgehend im Süden), als Landschaft gezeichnet (Ackerstreifen,
      Bäume, Schafe, Reben, Zypressen, Schilf), Stadt in der Mitte mit Mauerring und verkleinerten Gebäudemodellen.
      Liegt in derselben Szene neben der Stadt (x + 200), gleiche Kamera/Gesten. Knopf „Umland“/„Stadt“ oben in der
      Ansichten-Spalte; im Umland sind Bauleiste, Auftrag und Ansichten ausgeblendet. Feld antippen: Art, Entfernung,
      Nutzen, Hinweis „noch nicht vermessen“. Test 28/28 (PC, `PW_GPU=1`). Noch ohne Spielwirkung und ohne Speichern.
      **Nicht getestet:** iPad.
- [x] S2.2 Vermessen und Betriebe (31.10. abends): Feld antippen → „Vermessen lassen“ (20 Denare, 2 Monate, nur neben
      Stadt oder vermessenem Land; Pflöcke rot/weiß). Danach je Feldtyp ein Betrieb: Gehöft (Acker, 4 Getreide, Ernte wie
      Stadtfelder), Holzfällerlager (Wald, 3 Holz), Lehmstich (Lehm, 3 Lehm); Modell steht auf dem Feld. Ertrag kommt
      vorläufig direkt ins Lager, −15 % je Feld Entfernung ab dem zweiten (wird mit S2.3 durch Wege/Karren ersetzt).
      Gespeichert in `S.land`; alte Stände laden mit leerem Umland. Weide/Hang/Fluss noch ohne Betrieb.
      Test 30/30 (PC, `PW_GPU=1`, auch per Knopf). Nicht geprüft: Balance (Umland macht Getreide deutlich leichter).
      **Nicht getestet:** iPad.
- [ ] S2.3 Wege und Karren – **Teil 1 fertig (31.10. abends):** Feldweg je vermessenem Feld (10 Denare, 5 Holz), Netz ab der
      Stadt (Breitensuche über Felder mit Weg). Betriebe liefern nur verbunden („arbeitet, aber kein Weg zur Stadt“),
      Abzug nur noch 5 % je Feld Entfernung. Wege als Streifen zu Nachbarn mit Weg. Test 31/31 (PC, `PW_GPU=1`).
      **Teil 2 (31.10. abends):** Ochsenkarren je verbundenem Betrieb, fährt beladen (Farbe je Ware) über die Feldwege zur
      Stadt und leer zurück, hält bei Pause. Test 32/32 (Anzahl Karren geprüft; die Fahrt selbst nicht angesehen).
      **Offen:** Schotterweg/Römerstraße als Ausbau (schneller), Weg auch über unvermessenes Land?
      **Nicht getestet:** iPad.
- [ ] S2.4 Fluss: Anleger, Flussboote auf dem Padus, Speicher (horreum) als Umschlagplatz.
- [ ] S2.5 Nachbarstadt und Handel (Preise nach Angebot/Nachfrage, Abgaben an Rom).
- [ ] S2.6 Gefahren: Räuber (Wachturm), Gallier (Kastell), Hochwasser im Frühling (Deich).

## Später
Stufe 3 Forschung & Stände · Stufe 4 Familie & Politik · Stufe 5 Ereignisse & Wahrzeichen ·
Stufe 6 weitere Regionen, Verbindung Hauptspiel.

## Offene Entscheidungen (Moritz)
- Raster quadratisch (jetzt) oder frei drehbar wie Manor Lords?
- ~~Region als Hex-Felder oder freie Landschaft?~~ → Hex-Felder mit Landschafts-Optik (31.10.)
- Länge eines Spieljahres (jetzt: 1 Monat = 5 s bei normalem Tempo → 1 Jahr = 1 min).
- Sklaven als Stand oder Tagelöhner?
