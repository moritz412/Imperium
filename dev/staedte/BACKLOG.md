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
- [x] S2.4 Padus (31.10. spät, Moritz: „Fisch und Boote“): neue Ware Fisch (Kopfleiste), wird nach Brot und vor Getreide
      gegessen und zählt für die Stimmung wie Brot. Auf vermessenem Fluss wahlweise Fischerhütte (3 Fisch, Holz 15) oder
      Anleger (Holz 30, Ziegel 10). Anleger zählen als Weg, Flussboote verbinden alle Anleger: ein fernes Feld mit Weg zu
      einem Anleger ist mit der Stadt verbunden, wenn ein anderer Anleger es ist. Boote pendeln sichtbar zwischen Anlegern.
      Test 33/33 (PC, `PW_GPU=1`, Logik per Schnittstelle; Bild nicht angesehen). Offen: Speicher als Umschlagplatz.
      **Nicht getestet:** iPad, Bedienung per Knopf für Fluss-Felder.
- [x] S2.5 Nachbarstadt und Handel (31.10. nachts, Cloud): Placentia als eigenes Hex westlich vor dem Ring am Padus
      (gezeichnet wie Cremona, kleiner). Handel offen, wenn ein Nachbarfeld von Placentia per Weg mit der Stadt verbunden ist
      oder ein verbundener Anleger besteht. Fenster (Placentia antippen): je Ware 10 verkaufen/kaufen, Preis =
      Grundpreis × (üblicher Vorrat / Vorrat)^0,7 (0,4–3 ×), Kauf +15 %, Verkauf −15 %, Vorrat kehrt monatlich um 10 % zurück
      (`HANDEL` in daten.js). Abgaben an Rom am Ende jedes Herbstes ab dem 2. Jahr: 10 + 0,8 je Einwohner Denare; bezahlt →
      Gunst +8, sonst −20 (`ABGABE`). Gunst ändert den Lohn der Senatsaufträge (50 → 100 %, 0 → 50 %, 100 → 150 %).
      Gunst und Abgabe stehen im Fenster von Cremona im Umland. Test 36/36 (Cloud, Software-Rendering), Bild angesehen.
      Offen: keine sichtbaren Händler/Boote nach Placentia, Verträge, wandernde Händler, Balance der Preise.
      **Nicht getestet:** iPad.
- [x] S2.6 Gefahren (31.10. nachts, Cloud; `GEFAHR`/`SCHUTZ` in daten.js, Zufall fest je Monat und Feld):
      Räuber ab dem 2. Jahr: je Monat 5 % je Betrieb ab 2 Feldern Entfernung ohne Schutz → 3 Monate kein Ertrag (Rauch).
      Wachturm (Holz 25, Ziegel 10) schützt das Feld und die Nachbarn. Hochwasser ab dem 2. Jahr im 2. Frühlingsmonat (40 %):
      Betriebe neben dem Padus ohne Deich (Holz 10, Lehm 15) 2 Monate überflutet. Gallier ab dem 3. Jahr im 2. Sommermonat
      (35 %): rauben 25 % Getreide und Holz, Stimmung −10, Betriebe im Norden 4 Monate verwüstet – außer ein Kastell steht
      (neuer Betrieb auf Hang: Holz 60, Ziegel 40, Denare 80; vertreibt auch Räuber im Umkreis 2). Feldfenster zeigt Schutz
      und Schaden, Cremona-Fenster den Gallierschutz. Test 40/40 (Cloud, Software-Rendering, Zufall im Test erzwungen),
      Bild angesehen. Offen: Balance (Häufigkeit), Räuber/Gallier nicht als Figuren sichtbar, Hochwasser in der Stadt selbst.
      **Nicht getestet:** iPad.

## Stufe 3 – Forschung & volle Bevölkerung (begonnen 1.11.)
Plan (Konzept „Ausbaustufen“ 3: Epoche I–II, alle Stände, Wasser/Feuer):
- [x] S3.1 Forschung (1.11., Cloud): Knopf „Wissen“ (Ansichten-Spalte) öffnet die Forschungsseite: 5 Zweige, je 2 Erfindungen
      der Frühen Republik (erforschbar) und 2 der Späten Republik (grau, Vorschau). Ein Ziel gleichzeitig, Wissen sammelt sich
      auch ohne Ziel. Wissen: Stadtrat 1 im Monat + neue **Schule** (Holz 25, Ziegel 15, 2 Arbeiter, 3 Wissen). Wirkungen:
      Fruchtwechsel (Getreide +25 %), Villa rustica (Gehöft ausbauen, Holz 40/Ziegel 30, Ertrag +75 %, Casa-Modell),
      Ziegelbrand (Ziegelei 3 statt 2), Töpferscheibe (Lager +50), Schotterwege (kein Entfernungsverlust, Karren ×2, helle
      Wege), Bauhütte (−20 % Holz in der Stadt), Steuerlisten (+20 %), Landvermessung (1 Monat, 10 Denare), Schreine (neues
      Gebäude 1×1 ohne Straße, Stimmung bis +10 im Umkreis 9), Erntefest (Ende Herbst −20 Brot, Stimmung +10). Stand der
      Forschung unter dem Senatsauftrag. Test 44/44 (Cloud, Software-Rendering), Bild angesehen.
      Offen: Bild/Illustration für die Seite (Leitlinie „Bilder“), Schule und Schrein ohne eigenes Modell (Quader).
      **Nicht getestet:** iPad.
- [x] S3.2 Stände (1.11., Cloud; Moritz: Sklaven als eigener Stand, „es soll historisch sein“):
      **Sklavenquartier** (Wohnen, Holz 20, 10 Plätze, braucht Straße). Sklaven kauft man im
      Quartier beim Händler (5 für je 25 Denare). Sie arbeiten vollständig, aber nur in Feld, Mühle, Holzfäller, Lehmgrube,
      Ziegelei (`sklaven: true`) und gehen dort vor den Freien hin; nicht in Markt, Schule, Speicher, Bäckerei. Sie zahlen
      keine Steuern, zählen nicht als Einwohner (eigene Zahl in der Kopfleiste), essen Getreidebrei nach den Freien; fehlt er,
      flieht je Quartier einer im Monat. Mehr Sklaven als halb so viele Freie → Stimmungsziel −8 (Furcht vor Aufstand).
      **Freilassung** (manumissio): 5 werden Plebejer in Häusern mit Platz, Freilassungssteuer vicesima libertatis 5 %
      in die Kasse, Stimmung +2. **Insula** (Stufe 3 der Hütte, 30 Bewohner): ab Kleinstadt, volle Casa, Brot, Brunnen, Markt
      und Schrein in der Nähe, Ziegel 25 + Holz 15; eigenes Modell (Läden unten, 2 Wohngeschosse). Test 47/47 (Cloud),
      Bild angesehen. Offen: Equites/Domus erst mit Wein/Öl (S3.4), Modell für das Quartier, Sklavenaufstand als Ereignis.
      **Nicht getestet:** iPad, Balance (Sklaven sind günstig).
- [x] S3.3 Feuer und Ordnung (1.11., Cloud; `FEUER` in daten.js): ab dem 2. Jahr kann jedes Gebäude brennen. Chance je Monat =
      Grundwert (Hütte 0,2 %, Casa 0,15 %, Insula 0,4 %, Bäckerei/Ziegelei 0,6 %) × Dichte (+15 % je Gebäude im Umkreis 3)
      × Schutz (Feuerwache ×0,2, Brunnen ×0,7) × Sommer 1,5. Brennt es ohne Wache, greift das Feuer zu 25 % je Monat auf
      Nachbarn bis 3,5 Felder über und das Gebäude ist nach 3 Monaten zerstört (mit Bewohnern). Neues Gebäude **Feuerwache**
      (Nachtwächter/tresviri nocturni, Holz 30, Ziegel 20, 3 Arbeiter, Reichweite 12): löscht im Folgemonat. Ordnung: ab der
      Kleinstadt drücken Häuser ohne Wache in der Nähe die Stimmung (bis −6). Flammen + Rauch am Gebäude, Symbol, Ansicht
      „Feuer“ (Gefahr je Gebäude, Wachbereich), Zeilen im Gebäudefenster. Test 50/50 (Cloud, Zufall im Test gesteuert).
      Befund: im langen Testspiel ohne Wache brennt jetzt eine Hütte ab (gewollt). Bild angesehen.
      **Nicht getestet:** iPad, Balance (Häufigkeit).
- [ ] S3.4 Epoche II (Späte Republik): Übergang mit Amt/Stadtrang, Weinbau/Öl/Weberei/Garum als Ketten, Römerstraße, Aquädukt.

## 2-Stunden-Block (1.11., Moritz: Senat genehmigt; Ring mit Mantua, Gallierdorf, Steinbruch/Erz; Epoche II über Rang +
## Forschung; Tempo „mehr wie Manor Lords, aber nicht so langsam“; selbstständig pushen)
- [x] Tempo: 1 Monat = 15 s (1 Jahr = 3 min).
- [x] Stadterweiterung: Raster 64 × 40 (Osten neu, altes Gelände Feld für Feld gleich, alte Stände passen). Offen bis x < 40,
      dann 52, dann 64 (`GRENZE`, `ERWEITERUNG`): gesperrtes Land dunkel mit Grenzsteinen (cippi); antippen → Fenster
      „Land im Osten“ mit Bedingungen (Dorf/Gunst 50/150 Denare, dann Kleinstadt/Gunst 60/400 Denare) und Antrag beim Senat.
      Die Landstraße wird als Via Postumia bis an die neue Grenze verlängert. Schatten folgen der Kamera. Test 51/51.
- [x] Umland Ring 4 (61 Felder; innere 37 unverändert): Südufer (Weide/Lehm), Westen Wald, Osten Acker/Weide, Norden
      **Steinbruch** (Stein 2) und **Erzgrube** (Erz 2) als neue Feldtypen/Betriebe. Neue Waren Stein, Erz, Werkzeug (Kopfleiste
      erst, wenn vorhanden). **Schmiede** (Handwerk: Erz 1 + Holz 1 → Werkzeug 2); Werkzeug macht Sklaven-Betriebe 15 %
      schneller (0,1 je Betrieb und Monat). Insula kostet jetzt Ziegel 20 + Stein 10. **Mantua** (Osten, nur über Feldwege,
      handelt Erz/Werkzeug/Stein), Placentia an den Rand (−5,4) gerückt. **Dorf der Insubrer** im Norden (Palisade,
      Rundhütten): Geschenke (40 Brot, 60 Denare) → 24 Monate kein Gallierüberfall. Test 54/54, Bild angesehen.
      Offen: Werkzeug-Bedarf bei Höfen im Umland, Händlerkarren nach Mantua sichtbar.
- [x] Späte Republik (Einstieg): Übergang auf der Forschungsseite („Der Weg in die Späte Republik“): Kolonie (300 Einwohner),
      6 Erfindungen der Frühen Republik, Gunst Roms 50 → Knopf „Späte Republik beginnen“ (`EPOCHE2`, `S.epoche`).
      Spielbar: **Weinbau** (Weinberg auf Hang, Lese im Herbst → **Kelter** in der Stadt: Trauben 2 → Wein 2),
      **Domus** (Wohnen 3×3, Atriumhaus, 10 Equites: brauchen Brot, Brunnen, Markt, Wein 0,1/Kopf; arbeiten nicht, zahlen 4× Steuern),
      **Römerstraße** (nach Schotterwegen: Karren ×3, Räuber halb so oft), **Aquädukt** (Brunnen 12 Felder, Brandgefahr ×0,5
      statt ×0,7), **Archiv** (Aufschlag 8 statt 15 %), **Zölle** (8 Denare je offener Handelsstraße und Monat).
      Als „kommt später“ markiert: Olivenpresse, Weberei, Garum, Tempelbau, Theater. Test 56/56, Bild angesehen.
- [x] Balance-Lauf (`dev/staedte/werkzeug/balance_lauf.js`, fester Bauplan, 5 Spieljahre, Node ohne Grafik). Ergebnisse:
      erste Casa nach 13 Monaten (≈ 3 min), Dorf nach 19 Monaten (≈ 5 min), ≈ 96 Einwohner im 3. Jahr; danach Hunger, weil
      der Plan nur 2 Felder hat (Spielerentscheidung). Denare häufen sich (> 1.400 nach 5 Jahren), Holz ist der Engpass.
      **Fehler gefunden und behoben:** Zufall per sin-Hash lieferte für Monate im Abstand 12 fast gleiche Werte → Gallier
      fast jedes Jahr. Jetzt Ganzzahl-Mischfunktion (geprüft: 38 % bei Soll 35 %). Brände erst ab Jahr 3 und seltener
      (−25 %), Gallier erst ab Jahr 4 und ab 60 Einwohnern; Feuermeldung nennt das Gebäude. Test 56/56.
      Offen: Denare-Senke (z. B. Unterhalt der Gebäude, Löhne der Wache) – Vorschlag für Moritz.
- [x] Eigene Formen (three.js, kein Blender) für Schule (Säulenvorhalle), Feuerwache (Turm, Eimer), Sklavenquartier,
      Schrein (Lararium), Schmiede (Esse), Kelter (Baumpresse, Dolia). Test 56/56, Bild angesehen.
      Offen: Vorderseiten zeigen immer nach Süden, nicht zur Straße (gilt auch für die Blender-Modelle).
## Zweiter 2-Stunden-Block (1.11., selbst gewählt; Moritz: „selbstständig weiter“)
- [x] Unterhalt: Lohn/Sold je Monat aus der Kasse – Markt 3, Speicher 2, Schule 4, Feuerwache 5, Kastell 6, Wachturm 1
      (nur wer arbeitet, wird bezahlt). Fehlt Geld, steht das Gebäude still („Kein Geld für den Lohn“), Kastell/Turm schützen
      nicht. Summe im Cremona-Fenster und als Hinweis an den Denaren. Test 57/57.
- [x] Gebäude zur Straße drehen: beim Bauen gespeicherte Vorderseite (`dreh`, Süd/Ost/Nord/West; nicht quadratische nur
      Süd/Nord), alte Stände werden beim Zeichnen nachgerechnet, Vorschau dreht mit. Test 57/57, Bild angesehen.
- [x] Späte Republik vollständig: **Öl** (Olivenhain auf Hang → Ölmühle), **Tuch** (Schäferei auf Weide → Weberei; Casa/Insula
      verbrauchen 0,02/Kopf, versorgt → Stimmung +6), **Garum** (Garum-Siederei: Fisch 3 → Garum 1; teuer im Handel), Öl und
      Garum als Luxus der Equites (je +25 % Steuern), **Tempel** (3×3, 2 Priester, Unterhalt 5: Stimmung bis +12 im Umkreis 16,
      jeden Herbst Gunst +2), **Theater** (4×3, nach Tempelbau, Unterhalt 8: Stimmung +8 stadtweit). Placentia/Mantua handeln
      Wein, Öl, Tuch, Garum. Eigene Formen (Podiumstempel, Theater mit Rängen, Ölmühle, Weberei, Garum-Becken). Test 59/59.
- [x] Händler sichtbar: Maultierkarren mit bunter Ladung über die Feldwege nach Mantua/Placentia, sonst Handelsboot vom
      nächsten Anleger nach Placentia. Dabei behoben: Karren kamen mit Schotter-/Römerstraße nur halb ans Ziel (Tempo nur in
      der Fahrzeit, nicht im Weg). Neues Werkzeug `dev/staedte/werkzeug/modulcheck.sh` (lädt alle Module, findet z. B. doppelte
      Importe, die `node --check` übersieht). Test 60/60. Fahrt selbst nicht angesehen.
- [x] Balance-Lauf mit Unterhalt: Kasse pendelt ab Jahr 3 bei ≈ 1.100–1.170 Denaren (Testplan gibt nichts für Vermessen/Handel
      aus), Holz bleibt Engpass, Brände im 4. Jahr ohne Wache.

## Stufe 4 – Familie & Politik (begonnen 1.11.)
- [x] S4.1 Familie und Ämter: Familie der Valerier (Lucius 38 „Redner“ = Ansehen +20 %, Aemilia „Geschäftssinn“ =
      Geschäfte +25 %, Sohn Marcus 13, Tochter Valeria 9), altern jährlich, Sohn mündig mit 16, Oberhaupt ab 62 stirbt mit
      20 % je Jahr → Erbfolge (Ansehen −20 %). Stadtkasse und **Familienvermögen** getrennt (+1/Monat Landgut).
      **Familiengeschäfte** (Gebäudefenster, max. 3): je 4 Denare/Monat aus der Stadtkasse ins Vermögen, ab 3 Gunst −1/Monat.
      **Ansehen**: 0,3 + 0,35 × Rang (+0,4 bei Gunst ≥ 70) im Monat, +5 je Senatsauftrag, +15 je Spiele.
      **Ämter**: Quästor (Start, Steuern +10 %) → Ädil (Späte Republik, Ansehen 60, 300 Denare: Bauen −10 %, Spiele einmal im
      Jahr) → Prätor (Kolonie, Ansehen 150, 800 Denare: Räuber halb, Wache/Kastell halber Sold) → Konsul (kommt später).
      Wahl nur mit mehr Ansehen als die stärkste **Rivalen-Familie** (Fabier +0,6/Monat, Sempronier +0,75/Monat).
      Knopf „Familie“ (Ansichten-Spalte), Familienseite, Zeile unter dem Senatsauftrag. Test 64/64, Bild angesehen.
      **Nicht getestet:** iPad, Balance (Rennen gegen die Rivalen nicht nachgespielt).
- [x] S4.2 Heirat, Bündnisse, Klienten, Ausbildung (1.11., `HEIRAT`, `KLIENTEN`, `AUSBILDUNG`): Tochter ab 14 – die Familie
      zahlt die Mitgift (Fabier 200, Sempronier 150, Annier aus Placentia 80); Bündnis: diese Rivalen treten bei Wahlen nicht mehr
      an (Sempronier zusätzlich Aufschlag −5 %, Annier +3 Denare/Monat); sie verlässt das Haus. Sohn ab 18 – die Braut bringt
      Mitgift (120/150/250) und ggf. Bündnis; danach Enkel (35 % je Jahr), Enkel werden mit 14 Söhne/Töchter (Erben).
      Klienten in 5er-Schritten (max. 10 + 10 × Rang): je 1,5 Denare/Monat aus dem Vermögen, +0,06 Ansehen/Monat; ohne Geld
      gehen sie. Sohn ab 14: Rhetorenschule (100 Denare, 36 Monate → „Redner“) oder Militärdienst (36 Monate → „Veteran“: Gallier
      halb so oft); Eigenschaften zählen jetzt für jedes erwachsene Mitglied. Test 66/66.
      **Nicht getestet:** iPad, Balance.
- [x] S4.3 Ereignisse mit Entscheidungen (1.11., `EREIGNISSE` in daten.js): Fenster mit Bild (10 Antike-Ereignisbilder aus
      `img/pb_ev_a.json` auf 640 px verkleinert → `img/st_ev.json`, 370 KB), Datum, Text, 2–3 Wahlmöglichkeiten untereinander mit
      Folgen auf dem Knopf (zu teure Wahl gesperrt); Spiel pausiert. **Fest:** Monat 7 der Konsul Sempronius will Getreide gegen
      Hannibal, Monat 10 Flüchtlinge von der Trebia (218 v. Chr.). **Zufall** (12 % je Monat ab Monat 6, dasselbe frühestens nach
      36 Monaten): Bestechung, Witwe eines Legionärs, Getreideschiff (bei Getreide < 60), Fieber (ab 80 Einwohnern), Murren auf dem
      Markt (Stimmung < 45), Münzfund, Testament, Weidestreit mit Placentia, Priester der Ceres, Gesandte der Insubrer.
      Menü: „Ereignisse: an/aus“. Test 68/68 (alter Testteil mit Ereignissen aus), Bild angesehen. **Nicht getestet:** iPad.
- [x] Feste im Jahreslauf (ab dem 2. Jahr, als feste Ereignisse): Cerealia (2. Frühlingsmonat), Ludi Romani (1. Herbstmonat,
      neues Bild Stadion), Saturnalien (1. Wintermonat) – je groß feiern / bescheiden / ausfallen. Test 69/69.
- [x] Seuchen und Latrinen (`SEUCHE`): Gefahr je Haus ab dem 2. Jahr (Dichte, Insula ×2, Sommer ×1,5; Latrine ×0,3, Brunnen
      ×0,8, Aquädukt ×0,7). Kranke Häuser: 3 Monate, je Monat −10 % Bewohner, kein Wachstum, stecken Häuser im Umkreis 3 an
      (30 %, mit Latrine 8 %). Neues Gebäude **Latrine** (2×1, ohne Straße, Reichweite 9, eigene Form), Symbol, Ansicht
      „Gesundheit“, Zeilen im Hausfenster. Balance-Lauf: kleine Stadt (≈ 10 Häuser) 5 Jahre ohne Seuche. Test 70/70.
- [x] Wahrzeichen und Inschriften: **Basilika** (6×4, einmal je Stadt, ab Kleinstadt, Stein 120/Ziegel 150/Holz 80/300 Denare,
      **8 Monate Baustelle** mit Fundament, Gerüst, Tretkran, Steinstapeln) → Eröffnungs-Ereignis (Ansehen +25/30, Gunst +10,
      Stimmung); danach Stimmung +5 stadtweit und Ansehen +0,5/Monat; eigene Form (Säulenumgang, Obergaden, Apsis).
      **Inschriften des Forums** (Menü): 15 Erfolge (Ränge, erste Casa/Insula, Erfindungen, Späte Republik, Ädil/Prätor, volle
      Kasse, Handel, Umland, Basilika, zehn Jahre) als Steintafel mit Jahr. Test 72/72, Bild angesehen.
- [x] Senatsaufträge als roter Faden: 6 → 18 Aufträge (Umland vermessen + Gehöft, Feldweg, Schule + Forschungsziel, Handel mit
      Placentia, Feuerwache, Kleinstadt, Latrine + Insula, Späte Republik, Ädil, Basilika, Kolonie, Prätor), Lohn steigend.
      Test 73/73.
- [x] Leistung: Messskript `dev/staedte/werkzeug/leistung.js [port]` (238 Gebäude + Straßennetz auf 64×40, misst Draw-Calls/
      Dreiecke, **keine FPS** – Software-Rendering). Vorher 2.875 Draw-Calls, nachher **244** (−92 %) bei gleicher Dreieckszahl
      (≈ 138.000): jedes Gebäude wird beim Bauen zu einem Mesh mit Farben je Ecke verschmolzen (bewegte/durchsichtige Teile
      bleiben einzeln), alle Straßen sind ein Instanced-Mesh. Bild vorher/nachher gleich. Test 73/73.
      **Nicht gemessen:** Bildrate auf dem iPad.
- [x] Balance-Spieler (`dev/staedte/werkzeug/balance_spieler.js`, baut nach Bedarf, Umland, Forschung, Wahl). Befunde vorher:
      Holz in den ersten 3 Jahren 3–25 (Engpass), Brandketten im 5. Jahr (6 Brände, beide Holzfäller), ein Gallierüberfall
      verwüstete 13 Betriebe. Geändert: Holzfäller 3 → 4 Holz, Feuer greift zu 15 % statt 25 % über, ohne Wache löschen Nachbarn
      mit Eimerketten (35 %/Monat, Bewohner −25 %), Gallier verwüsten höchstens die 4 Betriebe nächst ihrem Dorf. Danach:
      Dorf nach 43 Monaten (≈ 11 min), Kleinstadt nach 93 (≈ 23 min), keine Brandketten. Ab Jahr 8 Überschuss an Holz/Denaren
      (Spieler baut zu wenig Neues) – nächster Balance-Schritt: mehr Bedarf im Spätspiel. Test 74/74.
- [x] Hilfe in 8 Kapiteln als eigene Seite (Bedienung, Stadt, Umland und Handel, Gefahren, Bevölkerung, Forschung und Epochen,
      Familie und Politik, Ereignisse und Ziele). Prüfung: Spielstand aus Stufe 1 (ohne Umland/Familie/Forschung/neue Waren/
      Drehung) läuft 3 Monate samt allen Seiten ohne Fehler. Dabei behoben: Ereignisfenster blieb nach Wechsel des Spielstands
      offen. Test 76/76, Bild angesehen.
- [x] iPad-Formate (Bilder 820×1180 hoch, 1024×768 quer): Warenleiste lief über, Einwohner/Stimmung waren abgeschnitten.
      Jetzt stehen Einwohner, Sklaven und Stimmung in der Cremona-Kachel, die Warenleiste ist seitlich wischbar, im Hochformat
      mit kleiner Beschriftung. Familienseite zweispaltig geprüft. Test 76/76. **Nicht getestet:** echtes iPad.
- [x] Thermen (nach Aquädukt, 4×3, Ziegel 80/Stein 40/Holz 40, 3 Arbeiter, Lohn 6): Heizung verbraucht 3 Holz/Monat; geheizt
      Stimmung bis +8 im Umkreis 16, Equites in der Nähe +25 % Steuern, Seuchengefahr ×0,7. Eigene Form (Kuppeln, Becken,
      Schornstein). Holz-Senke fürs Spätspiel. **Vicus**: Villa rustica nach 36 verbundenen Monaten → Dorf mit Hütten,
      +3 Denare/Monat, +0,05 Ansehen. **Töne**: Feuer (Knistern), Ereignis (Hornruf), Feste/Eröffnung (Leier).
      Töne nicht angehört. Test 78/78, Bild angesehen.
- [x] Chronik der Stadt (Menü): Jahreswerte (Einwohner, Stadtkasse, Stimmung, Ansehen) als Verlaufskurven, darunter die
      letzten 30 Meldungen mit Datum (ohne Jahreszeitwechsel, Wiederholungen als „(3×)“). Startseite: „Weiterspielen“ zeigt
      Rang, Datum, Einwohner und Amt des Spielstands. Test 79/79, Bild angesehen.
- [x] Rat des Verwalters (unter dem Senatsauftrag): das dringendste Problem mit Vorschlag – Vorräte < 3 Monate (außer kurz vor
      der Ernte), leere Kasse, Betriebe ohne Arbeiter (Häuser zu weit vs. zu wenig Arbeitskräfte), Holz < 15, Häuser ohne
      Brunnen, ≥ 10 Arbeitslose, Stimmung < 45, alle Häuser voll. Test 80/80.
- [x] Wetter je Jahreszeit (ein Points-Objekt, 1 Draw-Call): Schnee im Winter, Regen im Frühling, Blätter im Herbst, klar im
      Sommer; bewegt sich mit dem Spieltempo, Menü „Wetter: an/aus“ (im Browser gemerkt). Test 81/81, Bild Winter angesehen
      (Schnee eher dezent).
### Vorschläge für den nächsten Block
- Denare-Senke: Unterhalt je Gebäude oder Sold für Wache/Lehrer (Balance-Lauf: > 1.400 Denare nach 5 Jahren ungenutzt).
- Gebäude zur Straße drehen. Händler-/Ochsenkarren nach Mantua und Placentia sichtbar.
- Rest der Späten Republik: Öl, Tuch, Garum, Tempel, Theater; danach Stufe 4 Familie & Politik.
## Plan nächste 2 Stunden (1.11., Vorschlag)
Kartenfrage: Empfehlung **Erweitern statt sofort groß** – Stadtfläche 64×64, außen gesperrt; der Senat genehmigt
Stadterweiterungen (Rang + Gunst + Denare). Umland Ring 4 (61 Felder) mit zweitem Nachbarn und Gallierdorf; Vermessen bleibt
das „Kaufen“ von Land (historisch: Landzuteilung, ager publicus).
1. Stadterweiterung (Raster 64, 2 Stufen per Senat) – ca. 35 min
2. Umland Ring 4: Mantua (zweiter Handelspartner, andere Preise), Gallierdorf im Norden als Ursprung der Überfälle – ca. 30 min
3. S3.4 Einstieg Späte Republik: Übergang (Kolonie + Erfindungen + Gunst), Weinberg → Kelter → Wein, Domus der Equites – ca. 40 min
4. Balance-Lauf über 5 Spieljahre (Simulation mit Kennzahlen) + Modelle Schule/Wache/Quartier/Schrein – ca. 15 min
Abgrenzung zu Anno 117 (Pax Romana, 2025): eigene Mechaniken (Laufwege, Hex-Umland mit Vermessen, Jahreszeiten,
Sklaven als historischer Stand, Senatsgunst/Abgaben, echte Orte), keine Übernahme von Ketten, Gebäudelisten oder Oberfläche.

## Rückmeldung Moritz 1.11. (nach Spielen)
„Spielt sich gut, aber sehr schnell und leicht. Man bekommt Lust auf mehr – Manor Lords mit Rom.“ Straßenbau ließ sich nicht korrigieren.
- [x] Straßen korrigieren: Im Straßen-Baumodus Knopf „Entfernen“ – Felder antippen oder ziehen reißt Straßen ab. Test 41/41.
- [x] Balance erster Schritt: 1 Monat 5 → 9 s, Steuern 0,4 → 0,3 je Einwohner, Start 220 Denare / 130 Holz / 30 Ziegel
      (vorher 300/170/40), Gehöft 4 → 3 Getreide. Der Test gibt sich für den Stadtaufbau den alten Vorrat (prüft Abläufe).
      **Nicht nachgespielt** – ob es jetzt passt, muss Moritz sagen.

## Großes Konzept „vom Prototyp zum Spiel“ (1.11.)
`dev/staedte/docs/konzept_spiel.md`: Befund, fünf Säulen (Familie als Hauptfigur, sichtbares Leben, Geschichte als Bühne,
Knappheit, klare Enden), Kampagne in vier Akten 218–27 v. Chr. + freies Spiel, Systeme A–K, Abgrenzung zu Anno, Fahrplan
Phasen A–E. **Entschieden (Moritz 1.11.):** freies Spiel im Vordergrund, Stadt im Vordergrund (Familie zweite Ebene),
Bauzeit tendenziell für alle Gebäude, Bürgerfiguren erst auf Machbarkeit prüfen, Bürgerkrieg/Landenteignung okay, Reihenfolge frei.
Konzept entsprechend überarbeitet (Zeitleiste der Geschichte statt Akte, Rückschläge statt Game over, Fahrplan A–E neu).

## Phase A – Bauen fühlt sich echt an (begonnen 1.11.)
- [x] Bauzeit für alle Gebäude außer Straßen: 1 Monat je 30 Baustoffe (1–4), feste Bauzeit für große (Basilika 8).
      **Bauarbeiter** (2, große Bauten 4) kommen aus Häusern in Laufweite – vor den Betrieben, getrennt gezählt (`b.bw`), Sklaven
      dürfen mitbauen; ohne Bauarbeiter ruht die Baustelle. **Zeltlager der Kolonisten** beim Neustart (Bautrupp 4 Mann, nur
      für Baustellen) – sonst blockiert der Start, weil ohne Häuser niemand baut (vom Balance-Spieler gefunden).
      **Materialfuhren**: Träger laufen sichtbar vom Speicher/Holzfäller/Ziegelei zur Baustelle. Baustellenfenster mit Fortschritt,
      Bauarbeitern, Vorrang und „Bau abbrechen (alle Baustoffe zurück)“. Kleine Bauten: abgesteckte Fläche; große: Gerüst + Kran.
      Brunnen/Schrein/Latrine/Häuser wirken erst nach Fertigstellung. Tests nutzen `S.sofortBauen` (außer Wahrzeichen) + eigene
      Prüfung. Balance-Spieler: Dorf nach 10 min, Kleinstadt nach 27 min (vorher 11/23). Test 82/82, Bild angesehen.
- [x] Stadtmauer (Öffentlich, 1×1, Ziegel 3 + Holz 1, 1 Bauarbeiter, ziehen wie Straßen, „Entfernen“ geht auch) und Stadttor
      (auf eine Straße gebaut, ersetzt sie, Wagen fahren hindurch). Schutz = Anteil der Häuser, die vom Kartenrand nicht erreichbar
      sind (Mauer/Tor/Fluss sperren). Gallier rauben nur noch im ungeschützten Anteil; ganz geschützt: „die Stadtmauer hält“.
      Ab 80 % Schutz Stimmung +3. Zeichnung als Instanced-Mesh (fertig/im Bau), Tor mit zwei Türmen. Anzeige im Cremona-Fenster.
      Test 83/83, Bild angesehen.

## Phase B – Geschichte als Prüfung der Stadt (1.11.)
- [x] Zeitleiste `GESCHICHTE` (daten.js): Vorwarnung 24 Monate vorher (Meldung + blaue Zeile „Vorzeichen … in etwa N Monaten“
      unter dem Auftrag), Wendepunkt im Sommer des Jahres. **Belagerung 200 v. Chr.**: Wert = 0,5 × Mauerschutz + 0,2 × Kastell
      + 0,3 × Vorräte (6 Monate = voll) → hält (Ansehen +15, Gunst +10, Inschrift „Cremona hielt stand“) / plündert Vorstädte
      (Vorräte −30 %) / verwüstet (−60 %, Brände); kleine Städte halbe Verluste. **Siedler 190**: freier Wohnraum + 60 Getreide →
      bis 30 neue Bewohner. **Via Postumia 148** (Wahl: durch die Stadt → +6 Denare/Monat, Aufschlag −3 %). **Spartacus 72**:
      Wache, Mauer, Sklavenanteil → 20 % oder 60 % fliehen, Brände. **Landenteignung 41** (Wahl: Höfe abgeben / freikaufen /
      Widerstand). Ausgang als Fenster mit Text, was geholfen hätte. **Präfekt**: Gunst 0 → 24 Monate Präfekt (Steuern −30 %,
      Familie verliert Amt, Gunst +1/Monat). Menü „Geschichte: Wendepunkte / nur Kulisse / aus“; bei „Ereignisse aus“ nur Meldungen.
      Test 85/85. **Nicht nachgespielt:** Belagerung erst nach ≈ 55 Minuten Spielzeit.

## Später
Stufe 3 Forschung & Stände · Stufe 4 Familie & Politik · Stufe 5 Ereignisse & Wahrzeichen ·
Stufe 6 weitere Regionen, Verbindung Hauptspiel.

## Offene Entscheidungen (Moritz)
- Raster quadratisch (jetzt) oder frei drehbar wie Manor Lords?
- ~~Region als Hex-Felder oder freie Landschaft?~~ → Hex-Felder mit Landschafts-Optik (31.10.)
- Länge eines Spieljahres (jetzt: 1 Monat = 5 s bei normalem Tempo → 1 Jahr = 1 min).
- ~~Sklaven als Stand oder Tagelöhner?~~ → eigener Stand, historisch (1.11.)
