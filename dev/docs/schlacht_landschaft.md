# Testschlacht – Landschaft, Licht, Atmosphäre (Vorgabe 30.10.2026)

Rückmeldung Moritz: „Es braucht eine richtige Landschaft … Gras, Bäume, Licht und Schatten … mehr Atmosphäre. Gerade sieht es noch
sehr studiomäßig aus. Das Ganze soll sich anfühlen wie eine echte große Feldschlacht.“
Feste Regel: keine Oberfläche und keine Assets eines bestehenden Spiels nachbauen – nur das Gefühl (Weite, Licht, Gelände) ist Ziel.
Keine neue Beleuchtungsbibliothek: nur three.js r128 selbst. Kommt nach v2 (Bewegung/Zweikampf) in dieselbe Datei `dev/proto/schlacht_spiel.html`.

## 1. Gelände, das mitspielt
- Höhenfeld 600 × 500 m (sanfte Hügel, eine flache Senke, ein Hügelrücken auf einer Flanke), Figuren und Kamera folgen der Höhe.
- Spielwirkung: bergab Ansturm-Bonus, bergauf Abzug und schnellere Ermüdung; Wald verlangsamt und lockert Formationen; Hügelkuppe gibt Sicht/Moral.
- Bodentextur mehrschichtig (Gras, trockenes Gras, Erde, Pfade) aus Canvas, nach Hangneigung und Höhe gemischt; Fernbereich ohne Kachelmuster (zweite Textur mit anderem Maßstab).
- Wege: 1–2 Feldwege als hellere Bänder. Optional ein Bach mit Furt (nur Optik, später Spielwirkung).

## 2. Bewuchs
- Gras: Halmbüschel als Instanzen (wenige Dreiecke, im Wind wiegend per Vertex-Shader), dicht nur im Umkreis ~80 m um die Kamera, ausblendend.
- Bäume: 2–3 einfache Baumarten (Laub, Pinie/Zypresse für Mittelmeer) als Instanzen, Waldstücke und Einzelbäume, Wind leicht. Fernbäume einfacher.
- Büsche, Steine, ein paar Felsblöcke. Getretenes Gras/Staub nicht nötig.

## 3. Licht und Schatten
- Tageszeit-Stimmung: tiefstehende Sonne (Vormittag/Spätnachmittag), warmes Sonnenlicht, kühles Himmelslicht (Hemisphere), ACES-Tonemapping, sRGB.
- Schatten: Sonne mit Schattenkarte (PCF, 2048², Ausschnitt folgt der Kamera). Figuren werfen Schatten über ein eigenes customDepthMaterial mit derselben Skinning-Anpassung.
  Wenn das auf dem iPad zu teuer ist: Schatten nur für nahe Figuren + weiche Kontaktschatten (Kreisflecken) für alle. Schalter in den Grafikstufen.
- Gelände und Bäume empfangen und werfen Schatten.

## 4. Atmosphäre
- Himmel: Farbverlauf mit Sonnenhof und ein paar Wolkenschichten (Canvas-Textur auf großer Kuppel), Dunst/Luftperspektive (Nebel nach Entfernung, leicht bläulich).
- Staubwolken bei laufenden Einheiten und im Nahkampf (wenige weiche Partikel je Einheit), Banner flattern.
- Ferne Kulisse: Hügelketten/Berge am Horizont als einfache Silhouetten.
- Ton (optional, wenn leicht): Wind, ferner Kampflärm, Schritte/Rufe – nur mit vorhandenen Dateien im Repo (`snd/`, `audio/`), keine fremden.

## 5. Leistung und Stufen
- Drei Grafikstufen (niedrig/mittel/hoch) mit Gras-Dichte, Schatten an/aus, Baumanzahl. Standard am iPad: mittel.
- Bildrate oben rechts bleibt (gemessen). Ziel: auf dem iPad weiter flüssig wie v1/v2.

## 6. Prüfen
- Sichtprüfung im Bild: Gelände mit Hügeln, Gras in der Nähe, Wald, Schatten unter Figuren, Himmel/Dunst – kein „Studio“-Eindruck mehr.
- Keine Konsolenfehler; automatischer Schlachtdurchlauf wie v2.
- iPad: nicht getestet, bis Moritz es meldet.

## Stand Landschaft (umgesetzt in `dev/proto/schlacht_spiel.html`, 30.10.2026)
**Gebaut**
- **Gelände:** Höhenfeld 648 × 540 m (Raster 2 m, `HG`, `H(x,z)` bilinear, `grad(x,z)`); sanfte Hügel (in der Mitte ruhiger), flache Senke zwischen den Heeren, Rücken auf der Ostflanke (+9,5 m), Kuppen hinter beiden Heeren. Netz 6 m + große Außenfläche mit Loch (Höhe am Rand 0). Boden: Phong-Material mit Bodenkarte (512×432, aus Höhe/Hang/Rauschen/Wald/Wegen: Erde, trockenes Gras, dunkler Waldboden, Geröll) und kachelbarer Detailtextur in zwei Maßstäben (4,3 m und 32 m, in der Ferne zu Einheitsfarbe ausgeblendet). Zwei Feldwege (hellere Bänder). Bach: nicht gebaut.
- **Spielwirkung (alles klein gehalten):** Soldaten und Einheitenanker bergauf bis −40 % Tempo (`Steigung×2,2`), bergab bis +12 %; bergauf zusätzliche Ermüdung (bis +0,02/s); Wald (`WF`, 0–1) bremst bis −35 % und lockert die Formation (`u.loose` bis 0,85); Zweikampf: Angriff × (1 + Höhenunterschied×0,03) mit Grenzen +15 % / −12 %, Ansturm bergab wuchtiger (bis +35 % auf den Ansturmanteil); Hügelkuppe: Druck ×0,85 wer ≥ 2 m höher steht, ×1,12 wer ≥ 2 m tiefer. Ringe (Punkte folgen dem Gelände), Fahnen, Leichen, Zielmarke, Kamera-Ziel und Bodenpicking (Strahlmarsch gegen das Höhenfeld, 9 Halbierungsschritte) folgen der Höhe.
- **Bewuchs:** Bäume als Instanzen (Laubbaum ~130, Schirmpinie ~170, Zypresse ~42 Dreiecke, flach schattiert, Wind-Schwanken im Vertex-Shader), ~800 Bäume in 12 Waldstücken + Einzelbäume + Zypressenallee, 360 Büsche, 90 Steine/Felsen; Aufstellungszone bleibt frei. **Gras:** zwei Instanzschichten (nah Radius 26 m, fern Radius 80 m, je 9 Dreiecke je Büschel), Position/Höhe/Farbe/Wind komplett im Vertex-Shader (Höhe aus Float-Textur, Farbe aus der Bodenkarte, kein Gras auf Wegen/Geröll), keine CPU-Arbeit je Bild.
- **Licht/Schatten:** ACES-Tonemapping (Belichtung 1), sRGB-Ausgabe, Sonne (2,2, warm, Richtung `SD` = (−0,6; 0,5; 0,45), ca. 30° hoch) + Hemisphäre (0,8). Schattenkarte 2048², Ausschnitt ±30…130 m (je nach Kameraabstand) folgt dem Blickziel und rastet auf Texel. Figuren werfen über `customDepthMaterial` mit **derselben** Haut-/Überblendungs-GLSL (`SKIN_GLSL` + `SKIN_MAT`, geteilte Uniform-Objekte) – Schatten bewegen sich mit. Gelände, Bäume, Steine, Fahnenstangen werfen/empfangen Schatten.
- **Atmosphäre:** Himmelskuppel (Verlauf, Sonnenhof, Wolken aus Rauschtextur, driften), linearer Nebel 70…2300 m in Horizontfarbe, zwei Hügelketten als Silhouette (1500 m / 1950 m), Staubwölkchen (Punkte, Ringpuffer 320, Quellen: Laufende/Fliehende, Nahkampf, Treffer/Tod), Banner wehen (Vertex-Welle). Ton: nicht gebaut.

**Grafikstufen** (Knopf „Grafik“ in der rechten Spalte, Reihenfolge niedrig → mittel → hoch; Standard: Touch-Geräte „Mittel“, sonst „Hoch“; `?g=niedrig|mittel|hoch` und `localStorage.schlachtGrafik` überschreiben)

| | Niedrig | Mittel | Hoch |
|---|---|---|---|
| Pixeldichte-Grenze | 1 | 1,5 | 2 |
| Schatten | aus, weiche Kontaktschatten für alle Figuren | Schattenkarte 2048², PCF; Figuren < 60 m (nahe Stufe) werfen echte Schatten, ferne bekommen Kontaktschatten | 2048², PCF weich; alle Figuren werfen Schatten, keine Kontaktschatten |
| Gras (nah + fern) | 1800 + 1200 | 5000 + 3200 | 9000 + 6000 |
| Bäume / Büsche | 40 % / 40 % | 75 % / 70 % | 100 % |
| Staub (Pool) | 80 | 200 | 320 |

**Schnittstelle neu:** `SCHLACHT.setGrafik(name)`, `SCHLACHT.grafik`, `SCHLACHT.hoehe(x,z)`, `SCHLACHT.wald(x,z)`, `SCHLACHT.kamera(az,el,dist,x,z)`.
**Stellschrauben im Code (Abschnitt 2/3/8):** `hoeheFormel` (Hügel), `WALD` (Waldstücke), `wegD` (Wege), `GU.uC0…uC4` (Bodenfarben), `STUFEN`, `SD`, Sonne/Hemisphäre in der Kopfzeile, Hang-/Wald-Faktoren in `reaktion`, `bewegen`, `figuren`.
**Grenzen:** Echtes iPad nicht getestet; Bildraten nur gemessen, wenn Moritz sie am Gerät meldet (Software-Rendering sagt nichts aus). Gras ist ein Eindruck, keine Einzelhalme; Schatten nur im Ausschnitt ±130 m um das Blickziel (weiter weg keine); Lambert-Figuren empfangen Schatten nur je Vertex (grob); kein Bach, kein Ton, Wald hat keine Kollision (nur Bremse). Wenn Mittel auf dem iPad ruckelt: zuerst `STUFEN.mittel.grasN/grasF` und `pr` senken, dann Schattenkarte 1024².

## Nachbesserung Bewuchs (Rückmeldung Moritz 30.10.: „Bäume deutlich detaillierter gestalten und aufwerten“)
- Heutige Bäume: Laubbaum ~130, Schirmpinie ~170, Zypresse ~42 Dreiecke, flach schattiert, wirken wie Spielzeug.
- Ziel: glaubwürdige mediterrane Bäume aus der Nähe, günstig in der Ferne.
  - **Nahstufe** (bis ~60 m): Stamm mit 2–4 Ästen und Krümmung, Krone aus mehreren unregelmäßigen Blattballen (verformte Ikosaeder, 4–7 je Baum) mit
    Farbverlauf (innen dunkler, oben heller, leichtes Gelb/Oliv), Rinde braun-grau; Varianten: Steineiche/Laubbaum, Schirmpinie (flacher Schirm auf langem Stamm),
    Zypresse (schlank, mehrere Lagen), Olivenbaum (knorriger, silbrig-grün), Busch. Je Art 3 Formvarianten. 300–700 Dreiecke je Nahbaum.
  - **Fernstufe**: die heutigen einfachen Formen bzw. Kreuz-Billboards; Umschalten nach Entfernung (zwei InstancedMeshes je Art, Zuordnung alle ~0,5 s).
  - Wind: Krone wiegt, Stamm fast nicht. Schatten wie bisher.
  - Weichere Waldränder (Büsche, kleine Bäume am Rand), Unterholz im Wald, einzelne Felsen mit Moos.
- Grafikstufen: Nah-Radius und Anzahl je Stufe (niedrig: keine Nahbäume, nur Fernform).
- Leistung bleibt Pflicht (iPad flüssig auf „Hoch“): Instancing, keine Speicheranforderungen im Bildablauf.

## Stand Bewuchs (umgesetzt in `dev/proto/schlacht_spiel.html`, 30.10.2026)
**Gebaut**
- **Arten** (prozedurale Geometrie, Vertexfarben, flach schattiert): Steineiche/Laubbaum, Schirmpinie, Zypresse, Olivenbaum (neu), Busch – je 3 Formvarianten (Stamm als gebogene Röhre mit Verjüngung, Äste als Röhren, Krone aus verformten Ikosaeder-Blattballen; Farbe: innen dunkler, oben/außen heller mit Gelbstich; Olive silbrig-grün).
- **Dreiecke Nahstufe:** Laub 476 / 576 / 476, Pinie 460, Zypresse 410, Olive 472 / 508 / 472, Busch 320 (je Variante). **Fernstufe:** Laub 144, Pinie 124, Zypresse 49, Olive 100, Busch 80 (die alten einfachen Formen). Fels mit Moos: 240 Dreiecke (Hauptblock + 2 Brocken, Oberseiten bemoost).
- **Umschalten (`lodUpdate`):** je Art ein Fern-InstancedMesh + 3 Nah-InstancedMeshes (je Variante). Alle 500 ms (echte Zeit) wird je Baum nach 3D-Abstand zur Kamera entschieden; Eintritt unter R, Austritt erst über 1,22·R (Hysterese); Variante je Baum fest (kein Wechsel der Form). Instanzpuffer werden nur bei Änderung beschrieben (Schleife über Float32Arrays, keine Zuweisungen); Obergrenze Nahinstanzen je Variante 200 (Büsche 260).
- **Grafikstufen:** Niedrig: nur Fernstufe (R = 0). Mittel: R = 45 m. Hoch: R = 70 m (`STUFEN.*.nahR`). Anteil aktiver Bäume/Büsche wie zuvor (40 / 75 / 100 % bzw. 40 / 70 / 100 %).
- **Bestand:** Laub max. 560, Pinie 190, Zypresse 150, Olive 110 (5 Haine auf freiem Flachland), Büsche max. 560 (Unterholz im Wald, Randbüsche, kleine Randbäume 0,5–0,8 ×), Steine 90. Gesamtzahl je Stufe: Hoch 1010 Bäume + 560 Büsche, Mittel 760 + 392, Niedrig 404 + 224.
- Wind unverändert (Krone wiegt über `y²`, Stamm kaum). Schatten wie bisher (Bäume werfen, Büsche nicht).
- Neu in `SCHLACHT`: `vegInfo()` (Dreiecke, Instanzzahlen), `lodUpdate(force)`.

**Geprüft (Headless-Chromium, Software-Rendering):** keine Konsolenfehler; Bilder Waldrand nah und Übersicht auf Hoch/Mittel/Niedrig angesehen; automatischer Schlachtdurchlauf (Hoch, Tempo 4) erreicht die Endtafel. Bildraten: nicht getestet (Software-Rendering sagt nichts aus). **iPad: nicht getestet.**
**Grenzen:** Umschalten ohne Überblendung (nur Hysterese + 0,5-s-Takt; Formen sind ähnlich groß, sichtbar bleibt ein leichtes Aufpoppen); Abstand ist 3D zur Kamera, bei hoher Übersichtskamera gibt es daher keine Nahbäume; Nahbäume im Schatten wirken sehr dunkel (Zypressen fast schwarz); Wald hat weiter keine Kollision; Nah-Obergrenze kann in sehr dichtem Wald zufällig einzelne Bäume in der Fernform lassen.
