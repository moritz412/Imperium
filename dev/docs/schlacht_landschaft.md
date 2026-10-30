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
