# Testschlacht – Fernkampf und neue Oberfläche (Vorgabe 30.10.2026)

Wunsch Moritz: Menü und Oberfläche der Echtzeitschlacht „sehr rudimentär“ → neu gestalten, gern am Bedienkomfort großer Feldschlacht-Spiele
orientiert, aber eigene Lösung (feste Regel: **keine konkrete Oberfläche eines bestehenden Spiels nachbauen**). Einheiten-Bilder sollen unten in der
Auswahl gut erkennbar sein. Außerdem fehlt **Fernkampf** ganz.

## A. Fernkampf
Neue Pakete (gebacken 30.10., gleiche Clip-Namen wie die anderen + Fernkampf-Clip):
- `dev/proto/figuren/k_A1_veles.json` – **Velites** (Rom): kleine runde Parma, Wurfspeere (1,6 m). Fern-Clip `speerwurf` (30 Bilder, Wurf bei ~55 %).
- `dev/proto/figuren/k_A4_balearisch.json` – **Balearische Schleuderer** (Karthago): kein Schild, Schleuder, Steinbeutel. Fern-Clip `schleuder` (36 Bilder, Abwurf bei ~65 %).
Aufstellung neu: Rom 3 × Hastati + 1 × Velites (vor der Linie). Karthago bisherige 5 Einheiten + 1 × Balearen (vor der Linie).

Regeln (einfach, später feiner):
| | Reichweite | Nachladen | Vorrat | Schaden | Treffer |
|---|---|---|---|---|---|
| Velites (Wurfspeer) | 30 m | 4–6 s | 5 Würfe je Mann | 1,6 | bricht Schilde nicht, aber wirft Moral −0,5 je Treffer zusätzlich |
| Balearen (Schleuder) | 70 m | 2,5–4 s | 25 Steine | 0,8 | hoch gegen Ungeschützte (Kelten, Schleuderer) |
- Geschoss fliegt sichtbar auf ballistischer Bahn (Speer: dünner Stab, dreht sich in Flugrichtung; Stein: kleine dunkle Kugel), Flugzeit aus Entfernung.
- Ziel = Punkt in der Zieleinheit (Zufall um ihre Mitte, Streuung wächst mit Entfernung); Treffer nur, wenn beim Aufprall eine Figur in ≤ 0,6 m steht.
  Schild in Wurfrichtung: Chance auf Abwehr (Hastati 55 %, Libyer/Iberer/Thureophoroi 45 %, Kelten 35 %, ohne Schild 0 %); abgewehrt → Geräusch-Ereignis, kein Schaden.
- Getroffene: treffer-Clip / Tod wie im Nahkampf, Blut wie gehabt. Verfehlte Geschosse bleiben kurz im Boden stecken (Speere) bzw. verschwinden.
- Verhalten: Schützen schießen automatisch auf den nächsten Feind in Reichweite (oder auf den befohlenen); werden sie angegriffen, weichen sie zurück
  (Plänkler-Verhalten, Schalter „Plänkeln“ an/aus), im Nahkampf schwach (Angriff 6, Abwehr 6). Ziel unter Beschuss: Figuren heben bei Schild `schild_hoch`.
- Feind-KI: Balearen beschießen die nächste römische Einheit, bleiben vor der eigenen Linie, ziehen sich bei Annäherung hinter die Linie zurück.
- Leistung: Geschosse als ein InstancedMesh je Art (Ringpuffer, z. B. 300), keine Objekte pro Schuss anlegen.

## B. Oberfläche (eigene Gestaltung, „Spiel statt Software“, `dev/docs/design_leitlinie.md`)
- **Einheitenleiste unten:** große Karten mit **Einheitenbild** (`dev/proto/karten/<id>.jpg`, 3:4; Ids: hastatus, veles, libyer, iberer, kelte, balearer, thureophoros –
  fehlt ein Bild, gemalter Platzhalter mit Wappenfarbe), darunter Name, Mannstärke als Balken + Zahl, Moral-Ring, Müdigkeit, kleines Zustandszeichen
  (marschiert, kämpft, schießt mit Restmunition, flieht). Gewählt = goldener Rahmen + leichtes Anheben; mehrere wählbar (zweite Karte lang antippen oder Rahmen ziehen).
- **Kräftevergleich oben in der Mitte:** Balken Rom gegen Karthago (lebende Männer × Moral), Schlachtzeit, Tempo-Anzeige. Statt der Hinweiszeile oben eine schmale Zeile darunter, die nach 6 s verblasst.
- **Feindliste links:** kleine Karten mit Bild und Stärke statt Textchips; antippen = Kamera zur Einheit und (wenn eigene gewählt) Angriff.
- **Befehle rechts, eine Spalte:** Halten/Angreifen · Plänkeln (nur Schützen) · Formation (eng/locker) · Pause · Tempo · Grafik · Ton. Knöpfe mit gezeichneten Symbolen (Inline-SVG: Schild, Speere, Pfeil, Pause, Sanduhr, Zahnrad, Lautsprecher) + kurzem Wort.
- **Einheitenfenster:** bei gewählter Einheit links unten ein Feld mit größerem Bild, Werten (Angriff, Abwehr, Moral, Tempo, Reichweite/Munition), Kurztext zur Einheit.
- **Auf dem Feld:** über jeder Einheit ein schwebendes Banner-Schild (Wappenfarbe, kleines Bild/Symbol, Stärke-Balken), skaliert mit Entfernung, blendet bei Nähe aus; Zielmarke als gemalter Pfeil statt Ring.
- **Endtafel** im gleichen Stil mit Bildern der eigenen Einheiten und Verlusten je Einheit.
- Stil: dunkles Holz/Pergament/Bronze, Schatten, Serifenschrift; keine Programm-Optik. iPad quer als Hauptformat, sichere Ränder, große Trefferflächen (≥ 44 px).

## C. Prüfen
- Keine Konsolenfehler; `window.SCHLACHT` erweitert um `geschosse` (fliegend, gesamt, Treffer, abgewehrt).
- Automatischer Durchlauf bis Endtafel; Schützen schießen sichtbar (Bilder im Bild prüfen), Treffer/Abwehr gezählt.
- Oberfläche in 1194 × 834 (iPad quer) und 834 × 1194 ansehen. Echtes iPad: nicht getestet, bis Moritz es meldet.

## Stand Fernkampf/Oberfläche (30.10.2026, `dev/proto/schlacht_spiel.html`)
**Gebaut:** Alles A und B der Vorgabe, bis auf „Rahmen ziehen“ (Mehrfachwahl nur per langem Druck auf eine zweite Karte). Rom 4 Einheiten (3 Hastati + Velites bei z = −38),
Karthago 6 (Balearen bei z = 40). Kit-Indizes: 4 = Velites, 5 = Balearen. Nur diese eine Datei geändert.

**Fernkampf (Abschnitt 4, vor `kampfTick`):** `fernZiel` (Ziel-Einheit je Einheit, 20 Hz) → `wurfStart` (nur stehende Figuren, Zielpunkt = zufällige lebende Figur der Zieleinheit
+ Vorhalt) → Clip `speerwurf`/`schleuder` → `abwurf` zum Clip-Zeitpunkt `wurfT` (Munition −1, Bahn, Streuung) → `geschossSchritt` (Flug, analytisch: Position = Start + v·t − ½g t²)
→ `geschossAufprall` (Figur ≤ 0,6 m im 2-m-Raster, Schildabwehr, Schaden, Treffer-/Todesclip, Blut; Fehlschuss: Speer steckt 7 s, Stein verschwindet).
Beschuss lässt Schildträger der Zieleinheit `schild_hoch` zeigen (Dauer Flugzeit + 0,8 s). Schützen im Nahkampf kämpfen als normale Soldaten (Angriff 6/Abwehr 6).
KI/Spieler: `fernKI` (alle 0,5 s). Plänkeln: Nahkämpfer näher als `weich` → Rückzug um `rueck` m (rennend), danach 7 s Pause bis zum nächsten Ausweichen; der Spieler kann
Plänkeln abschalten, ein eigener Marschbefehl hat Vorrang. Feind-KI-Balearen bleiben vor der Linie (kehren nach dem Ausweichen auf den Platz zurück). Vorrat leer → normale Nahkämpfer.
Spieler: Feind antippen = `angriff` → bei Schützen `fBef` (Feuerbefehl, rückt auf 0,75 × Reichweite heran). Haltung „Angreifen“ bei Schützen: rückt in Schussweite vor.
**Darstellung:** je Art ein `InstancedMesh` (Speer: Stab + Spitze in Flugrichtung, Stein: dunkle Kugel r = 0,13 m, etwas größer als echt für die Sichtbarkeit), Ringpuffer
`GN` = 300 je Art, Matrizen direkt in die Instanz-Arrays, keine Objekte pro Schuss. Neue Clip-Varianten: `gehen_b/laufen_b` (nur wenn das Schritttempo zum Clip passt, mit Hysterese), `schlag_a_b/schlag_b_b`,
`stehen_b` (nur Aufstellung), `sterben_knie` (20 % der Tode); fehlende Clips fallen auf die Grundclips zurück (`CN_ERSATZ`).

**Konstanten (oben bei „Fernkampf“ und in `KITS[].fern`):** `GN` 300 · `GRAV` 9,8 · `TREFF_R` 0,6 · `STREU0/1` 0,45 + 0,05·Entfernung (m) · `SCHILD_WINKEL` 1,3 rad · `FORM_K` eng 1 / locker 1,5.
Velites: Reichweite 30, Nachladen 4–6 s, 5 Würfe, Schaden 1,6, Moral −0,5 je Treffer, v 24 m/s, weicht ab < 14 m um 22 m, Schildchance 40 % (eigene Annahme).
Balearen: 70 m, 2,5–4 s, 25 Steine, Schaden 0,8 (×1,6 gegen `bloss`: Kelten, Balearen), v 40 m/s, weicht ab < 24 m um 34 m, kein Schild.
Schildchancen `KITS[].schild`: Hastati .55 · Libyer/Iberer .45 · Kelten .35.

**Oberfläche:** Kräftevergleich oben Mitte (`#kraft`: Männer × Moral-Anteil, Schlachtzeit, Tempo) + Hinweiszeile `#hinweis` (blendet nach 6 s aus); Feindliste links (`.fk`, Bild + Stärkebalken,
Antippen = Kamera gleitet hin + Angriff der gewählten Einheiten); Befehlsspalte rechts in einer Spalte (Beginnen · Halten/Angreifen · Plänkeln · Formation · Pause · Tempo 1/2/4× · Grafik · Ton) mit Inline-SVG-Symbolen;
Einheitenleiste unten (`.karte`: Bild, Moral-Ring, Zustandszeichen mit Munition, Stärkebalken, Müdigkeit; gewählt = Goldrahmen + angehoben; langer Druck auf eine weitere Karte = Mehrfachwahl, Gruppenbefehl stellt die Einheiten nebeneinander);
Einheitenfenster links unten (`#fenster`, größeres Bild, Werte, Kurztext, × zum Abwählen); Banner-Schilder über den Einheiten (DOM, `transform`/`opacity`, 15 Hz; Größe 95/Abstand, ab < 26 m ausgeblendet);
Zielmarken als gemalte Pfeile (Sprites; gold = Marschziel, rot über dem Angriffsziel); Endtafel mit Bildern und Verlusten je eigener Einheit. Bilder: `karten/<id>.jpg`, bei Fehlen gemalter Platzhalter in Wappenfarbe mit Einheitenzeichen (`#sy-…`).
DOM-Updates nur bei Wertänderung (Hilfsfunktionen `txt`, `wid`, `klasse`, `hrefSet`), Hauptaktualisierung 4 Hz. Hochformat: Einheitenfenster rutscht über die Kartenleiste (`@media (max-aspect-ratio:1/1)`).
**Ton:** Es gibt (noch) keinen Ton in dieser Seite; der Knopf „Ton“ schaltet nur `tonAn`. Ereignisse werden gezählt (`SCHLACHT.ereignisse`: wurf, schleuder, treffer_fern, abgewehrt, verfehlt) und an
`window.SCHLACHT_TON.ereignis(typ, x, z)` gemeldet, falls vorhanden. **Test-Schnittstelle:** `SCHLACHT.geschosse` {gesamt, fliegend, treffer, abgewehrt, verfehlt, speere, steine}, `auswahl`, `schlachtZeit`, `waehle(i, add)`.

**Abstimmen:** Trefferquote über `STREU0/1` und `TREFF_R` (Messung im Test: zwei Läufe mit Steinen: 14–18 % Treffer, 9–14 % abgewehrt, 65–76 % daneben); Schaden/Reichweite/Nachladen in `KITS[].fern`; Ausweichen über `weich`/`rueck`
(Wartezeit 7 s in `fernKI`); Munition `vorrat`; Banner-Größe in `bannerSchritt`; Abstand der Formation `FORM_K`.
**Grenzen:** Echtes iPad nicht getestet. Frameraten im Software-Rendering sind bedeutungslos und nicht gemessen. Kein Rahmenziehen, kein Ton. Rom verliert im Standardaufbau meist (3 Hastati + Velites gegen 6 Einheiten) – Balance nicht angefasst.
