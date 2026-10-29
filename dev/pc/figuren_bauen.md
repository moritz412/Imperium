# Figuren selbst bauen am PC (Blender) – Anleitung und Regeln (29.10.2026)

Entscheidung Moritz 29.10., präzisiert 29.10. abends: Figuren werden **am PC gebaut, nicht als fertige Modelle aus dem Netz
übernommen – und zwar von Claude** (Blender per Skript auf Moritz' PC). Erlaubte Ausgangsdaten: MPFB-Grundkörper (CC0) und
CMU-Bewegungen (frei, mit Nennung); Rüstung/Ausrüstung eigen (TRELLIS aus eigenen FLUX-Vorlagen oder Blender). Ablauf:
**Claude baut in Blender am PC → .glb je Skelett/Kit → Back-Skript (`dev/pc/blender/backen.py`) macht daraus Spieldaten → Einbau im Spiel.**
Wo unten „Moritz“ als Bauender steht, gilt jetzt Claude.

## 0. Stand PC (29.10. abends)
- Blender 5.2.3 LTS portable: `Desktop\imperium-bilder\blender\blender-5.2.3-windows-x64\blender.exe` (Einstellungen im Unterordner `portable`, nichts systemweit). SHA-256 geprüft.
- MPFB 2.0.18 (extensions.blender.org, SHA-256 geprüft) + MakeHuman system assets (CC0, 268 MB) installiert. Downloads in `blender\dl`.
- Headless geprüft (`blender\test_koerper.py`): `HumanService.create_human` + `add_builtin_rig(…, "cmu_mb")` + Proxy über `add_mhclo_asset(<proxy>.proxy, …, asset_type="Proxymeshes")`.
- **Skelett-Wahl: `cmu_mb`** – 31 Knochen, Namen identisch mit den CMU-BVH-Dateien (Hips, LeftUpLeg … Head), also kein Retarget nötig. Gilt ab jetzt für alle Menschenfiguren.
- Proxy `proxy741`: 1460 Dreiecke, `male1591`: 3140 (zu viel) → proxy741 als Grundlage, für Nah-Stufe auf ≈ 1000 dezimieren (Platz für Ausrüstung). Standardhöhe 1,66 m → auf 1,72 m skalieren.
- CMU-Bewegungen: Original-Seite mocap.cs.cmu.edu (ASF/AMC, kein BVH nötig). Geladen nach `blender\cmu\02`: Subject 02 – 01 Gehen, 03 Laufen, 05 Schlag, 07/08 Schwertkampf (≈ 5 MB).
- **Übertragung geprüft (29.10. 22:40):** `dev/pc/blender/cmu_auf_koerper.py` liest ASF/AMC direkt, ordnet CMU-Segmente den cmu_mb-Knochen zu und überträgt je Knochen in Weltlage (Ruherichtung angeglichen, CMU-T-Pose → MPFB-A-Pose). Gehen und Schwertkampf sehen im Bild plausibel aus (`dev/pc/blender/cmu_test.jpg`). Fehler: kleine Zacken am Rumpf (Gewichte des Proxys), Hände ohne Griff, Füße gleiten noch (keine Bodenkorrektur). Noch nicht: Schleifen schneiden, 30 B/s, Export, Back-Skript.
- Ausrüstung Antike: 18 Teile als TRELLIS-Rohmodelle in `3d\roh_44` (13) und `3d\roh_45` (5), noch ohne r3-Nachbearbeitung.

## 1. Werkzeuge (einmalig)
- Blender 4.x oder 5.x (kostenlos, blender.org).
- MPFB 2 (MakeHuman-Erweiterung für Blender) für realistische Grundkörper.
- Bewegungen: CMU Motion Capture Database (BVH-Dateien).

## 2. Lizenzen (geprüft 29.10.)
| Quelle | Bedingung | Folge für uns |
|---|---|---|
| MakeHuman/MPFB | Exporte sind CC0, **soweit die verwendeten Teile CC0 sind**; einzelne Zusatzteile (Kleidung, Haare aus der Community) können andere Lizenzen haben | nur Grundkörper + Standardteile; Kleidung/Rüstung selbst modellieren oder TRELLIS |
| CMU Mocap | frei nutzbar, auch in Produkten; **Daten nicht direkt weiterverkaufen, auch nicht umgewandelt**; bei Veröffentlichung Dank/Nennung erbeten | erlaubt; Nennung in `LIZENZEN.html` ergänzen |
| Mixamo | nicht verwenden (öffentliches Repo, Weitergabe der Rohdaten unklar) | – |
| Modelle/Animationen aus Spielen | nie (feste Regel) | – |

## 3. Feste Regeln für alle Figuren (damit das Back-Skript sie versteht)
- **Maßstab:** 1 Blender-Einheit = 1 m. Mann ≈ 1,72 m. Füße auf Höhe 0, Blick nach −Y (Blender-Vorne).
- **Skelett Mensch:** ein MPFB-Skelett für alle Menschenfiguren, Knochennamen nicht umbenennen. Wahl beim ersten Körper (bitte in MPFB nachsehen, welche angeboten werden): bevorzugt eines, das zu den CMU-BVH-Dateien passt (spart das Übertragen), sonst das kleinste vollständige (Ziel ≤ 55 Knochen, Finger nur grob). Die Wahl gilt dann für immer.
- **Skelett Pferd/Elefant:** je eins, selbst gebaut; Knochennamen beginnen mit `pf_` bzw. `el_`. Höchstens 40 Knochen.
- **Dreiecke je Figur (inkl. Ausrüstung):** Nah ≤ 1.500, Mittel ≤ 400 (Decimate genügt). Pferd ≤ 2.000, Elefant ≤ 2.500.
- **Texturen:** eine 1024×1024-Textur je Kit-Familie (Atlas); Farbvarianten über Vertex-Farbe oder zweiten UV-Bereich, nicht über neue Texturen.
- **Ausrüstungsteile** als eigene Objekte, am passenden Knochen geparentet (Helm → Kopf, Schild → linker Unterarm/Hand, Waffe → rechte Hand), Namen `teil_<art>_<kit>_<name>`, z. B. `teil_helm_A1_montefortino`.
- **Clips** als Aktionen (Actions) mit genau den Namen aus `dev/docs/schlacht_umsetzung.md` 5.1–5.3 (`stehen`, `gehen`, `laufen`, `schlag_a` …). 30 Bilder/s. Schleifen (`gehen`, `laufen`, `stehen`) müssen nahtlos sein.
- **Export:** glTF Binär (.glb), „Animation: alle Aktionen“, „Formen/Shape Keys“ aus. Dateiname `sk_mensch.glb`, `sk_pferd.glb`, `sk_elefant.glb`, Kits `k_<Kit>.glb` (z. B. `k_A1.glb`).
- Ablage: `Desktop\imperium-bilder\figuren\` und dann in die Cloud-Sitzung hochladen oder ins Repo `dev/pc/figuren/` (glb klein halten, < 10 MB).

## 4. Reihenfolge (Vorschlag)
1. **Mensch-Grundkörper:** in MPFB 3 Körper anlegen (`m_leicht`, `m_mittel`, `m_schwer`), gleiches Skelett, Kleidung erst mal nur Tunika. → `sk_mensch.glb` mit Clip `stehen`. **Ich prüfe die Datei in der Cloud (Knochen, Maße, Dreiecke) und backe einen ersten Test.**
2. **Clips Mensch:** CMU-BVH auf das Skelett übertragen (Retarget), auf 15 Clips zuschneiden. Kampf-Clips (Schlag, Stoß, Abwehr) gibt es in CMU nur teilweise → selbst keyframen.
3. **Kit A1 römisch + A2 libysch** (Hannibal zuerst): Helm, Schild, Waffe, Rüstung.
4. **Pferd** (Skelett + 10 Clips), dann **Elefant** (vorgezogen, Entscheidung 29.10.).
5. Übrige Antike-Kits A3–A8.
Profile mit Teilen je Einheit: `dev/schlacht/profile_truppen.json` (Feld `teile`).

## 5. Was Claude dazu liefert
- Prüfskript `dev/pc/blender/pruefen.py` (Knochen, Maße, Dreiecke, Clip-Namen) – am PC: `blender -b -P pruefen.py -- datei.glb`.
- Back-Skript `dev/pc/blender/backen.py` (Animations-Textur, Detailstufen, Spielpaket) – am PC: `blender -b -P backen.py -- datei.glb datei.json --pruefen`.
- Beide in der Cloud an einer Testfigur geprüft (siehe `dev/pc/blender/README.md`); an einer echten MPFB-Figur noch nicht getestet.
- CMU-Nennung in `LIZENZEN.html`, sobald die ersten CMU-Bewegungen im Spiel sind.
- Je Kit eine Teileliste mit Bildvorlagen (FLUX-Referenzbilder als Modellier-Vorlage, kein Abpausen fremder Werke).
