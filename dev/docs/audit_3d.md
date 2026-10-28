# Audit 3D-Modelle (Stand v172, base72.html) 

Methode: Jedes Teil aus den Modellpaketen wird mit den spieleigenen Decodern (decodeKit, mdlParse, dioGeo) einzeln gerendert (Desktop-Chromium, Software-WebGL, Grafik „hoch“), Bilder und Maße in scratchpad/a3d/img/, Kontaktabzüge in scratchpad/a3d/sheets/. Danach Spielansicht-Screenshots.

Nicht veröffentlicht/ungenutzt (liegen nur lokal in /home/claude/models): c_eu, city0-4(b), gen0-4, general_rom, mdl_leg_s, veg, veg_eu – Aufruf von general_rom ist auskommentiert.

## Zwischenstand 1 (Einzelrender)
Kontaktabzüge: scratchpad/a3d/sheets/*.jpg (je Paket), Rohbilder + Maße: scratchpad/a3d/img/ (meta.json fehlt, Lauf brach bei Dioramen ab).

Befunde (vorläufig):
- f_a1 art_ant (Antikes Geschütz/Skorpion): verformt, wirkt wie Spinne – Schwere 2 – PC.
- f_a1 ger, f_a2 gen_azt: Figur sehr dunkel/schwarz, schaut von der Kamera weg (Drehung) – 2 – Code (Drehung/Helligkeit prüfen) bzw. PC.
- f_a1 byz: Schild als weißlich-durchscheinender Fladen – 2 – PC.
- f_as jpa: wirkt europäisch (weißer Rock, Dreispitz) statt japanisch – 2 – PC (falls jpa = japanischer Arkebusier).
- f_am jag: knallgelb, comichaft – 2 – Code (Farbe dämpfen) oder PC. f_am pla: grüne Figur, Farben unstimmig – 1.
- c_kit: nur 6 von 39 vorgesehenen Teilen vorhanden (nur Tempel); Häuser/Mauern aller Nicht-Europa-Kulturen fehlen → prozedural – 2 – PC (33 Modelle).
- c_kit meso_tempel: grell goldgelb – 2 – Code (muten). nordam_tempel: chinesisch wirkende Pagode auf Plattform – 2 – PC.
- obj_b m_bruecke_stein: formloser Fels statt Brücke – 2 – PC. t_rind: fleckige Textur – 1.
- lmk_a lmk_lalibela: Klumpen mit rotem Dach, nicht lesbar – 2 – PC. lmk_kaiserburg: Fels-Sockel unruhig – 1.
- Landmarken/Weltwunder (lmk_*, w_*): eingebaute runde Sockelplatten – 1 – Code (Sockel per Höhen-/Farbschnitt ausblenden) oder lassen.
- c_eu, veg, veg_eu: in MDL_PK, aber nicht veröffentlicht; veg bewusst abgeschaltet (vegPcApply return, Moritz 19.10.), c_eu nicht in PCC_ALL → ungenutzt. c_eu eu_ant_tempel mit schwarzem Loch im Dach.
- Stilbruch: klare Low-Poly-Bausteine (kit*, army*) neben texturierten TRELLIS-Modellen (f_*, lmk_*, w_*, s_*) – 2 – Grundsatzfrage.
- kit0-4, army*: sauber, keine Ausreißer gefunden (army *_F = Fahnen-/Reichsfarbteile, weiß bis zur Einfärbung).

## Zwischenstand 2 (Stadt-Dioramen st_a/st_b, 42 Stück) – Kontaktabzug a3d/sheets/st_a_0.jpg, st_b_0.jpg
- eu_ant_2: weißer, schräg hängender Bodenkeil unter der Stadt – 2 – PC (oder Code: Boden abschneiden).
- eu_nz_3: schwarze Bodenfläche/Schatteninsel – 2 – PC.
- nordam_2, nord_1: lose verstreute Teile, unruhig, Dorf wirkt leer – 1–2 – PC.
- ostasien_jp_3: Geometrie hängt unter der Grundplatte – 1 – Code (y-Clip) oder PC.
- Größenstufen inkonsistent: eu_ma_1 (Dorf) zeigt wenige große Fachwerkhäuser, wirkt größer/näher als eu_ma_3 (Großstadt) – 1 – Code (Skalierung je Stufe) bzw. PC.
- Übrige Dioramen (afrika, indien, orient, anden, meso, ostasien_cn, steppe, suedost) stimmig und kulturpassend.

## Spielansicht
- Versuch mit scratchpad/a3d/ingame.js (Startwelten Epoche 0–4, je 4 Völker, nah/mittel): unter hoher Rechnerlast brauchte jedes Bildschirmfoto mehrere Minuten bzw. lief in die Zeitgrenze; abgebrochen nach 1 Bild (a3d/game/e0_rom_mittel.jpg). Dort: Kamera mittel, Modelle aus dieser Höhe nicht beurteilbar; das Befehlsblatt verdeckt die eigene Hauptstadt. Spielansicht-Prüfung der Modelle: **nicht getestet** – Nachholen mit 1 Browser bei geringer Last.

## Gesamttabelle (priorisiert nach Sichtbarkeit im Spiel)

| Prio | Key | Problem | Schwere | Ursache | Lösung |
|---|---|---|---|---|---|
| 1 | c_kit (33 fehlende Teile) | Häuser/Mauern aller Nicht-Europa-Kulturen fehlen, nur 6 Tempel vorhanden | 2 | Modelle nie geliefert | b) PC: 33 Modelle (afrika, anden, indien, meso, nordam, orient, ostasien_cn/jp, steppe, suedost × haus_klein/gross/mauer + fehlende Tempel) |
| 1 | Stilbruch | Low-Poly-Bausätze (kit*, army*) neben texturierten TRELLIS-Modellen | 2 | zwei Pipelines | Grundsatzentscheidung; a) Code: Farben/Licht angleichen (muteKit-artig auch für MDL) |
| 2 | f_am jag | knallgelb, comichaft | 2 | Textur | a) Code: Farbe dämpfen; sonst b) |
| 2 | c_kit meso_tempel | grell goldgelb | 2 | Textur | a) Code: Sättigung/Helligkeit senken |
| 2 | f_a1 ger, f_a2 gen_azt | fast schwarz, Rücken zur Kamera | 2 | Textur dunkel / Drehung im Modell | a) Code: Drehversatz + Aufhellung prüfen; sonst b) |
| 2 | f_as jpa | wirkt europäisch (Dreispitz, weißer Rock) | 2 | falsches Vorbild | b) PC |
| 2 | f_a1 byz | Schild als durchscheinender Fladen | 2 | TRELLIS-Fehler | b) PC |
| 2 | f_a1 art_ant | verformt (Spinne) | 2 | TRELLIS-Fehler | b) PC |
| 2 | c_kit nordam_tempel | ostasiatische Pagode statt Nordamerika | 2 | falsches Vorbild | b) PC |
| 2 | st_a eu_ant_2 | weißer hängender Bodenkeil | 2 | Modellboden | a) Code: unter Grundplatte abschneiden; sonst b) |
| 2 | st_a eu_nz_3 | schwarze Bodeninsel | 2 | Textur | b) PC |
| 2 | st_b nordam_2, st_a nord_1 | zerstreute lose Teile | 1–2 | Modell | b) PC |
| 2 | obj_b m_bruecke_stein | Fels statt Brücke | 2 | TRELLIS-Fehler | b) PC |
| 2 | lmk_a lmk_lalibela | unlesbarer Klumpen | 2 | Vorbild schwierig | b) PC (Kreuzkirche von oben) |
| 3 | lmk_*, w_* Sockelplatten | runde Sockel unter Bauwerken | 1 | Modell | a) Code: Sockel ausblenden oder belassen |
| 3 | st_b ostasien_jp_3 | Geometrie unter Grundplatte | 1 | Modell | a) Code: y-Clip |
| 3 | st_a eu_ma_1 vs _3 | Größenstufen wirken vertauscht | 1 | Maßstab je Stufe | a) Code: Skalierung je Stufe |
| 3 | f_am pla, obj_b t_rind, lmk_kaiserburg | Farben/Textur unruhig | 1 | Textur | a)/b) |
| – | c_eu, veg, veg_eu | im Code gelistet, nicht veröffentlicht bzw. bewusst abgeschaltet (Moritz 19.10.) | – | Entscheidung | keine; c_eu eu_ant_tempel hätte schwarzes Dachloch |
| – | kit0–4, army0–4/h, s_all, w_all, übrige f_*/obj_b/lmk | keine Ausreißer gefunden | – | – | – |

**Zählung:** Code-Fix (a) möglich: 7 Punkte (Farben jag/meso_tempel, Drehung/Helligkeit ger/gen_azt, Bodenkeil eu_ant_2, y-Clip jp_3, Größenstufen, Sockel). PC-Neuerzeugung (b): 10 Punkte, davon c_kit mit 33 Einzelmodellen (gesamt ca. 42 Modelle).

Kontaktabzüge: scratchpad/a3d/sheets/ (army0-4, armyh0-4, kit0-4, f_*, c_kit, c_eu, lmk_a/b, obj_b, s_all, veg, veg_eu, w_all, st_a, st_b). Skripte: scratchpad/a3d/render.js, render_dio.js, sheets.py, ingame.js.
