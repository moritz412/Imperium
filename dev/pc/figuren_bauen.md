# Figuren selbst bauen am PC (Blender) – Anleitung und Regeln (29.10.2026)

Entscheidung Moritz 29.10.: Figuren baut Moritz überwiegend selbst am PC. Claude liefert Regeln, Vorlagen und das Back-Skript
(`dev/pc/blender/backen.py`, in der Cloud mit Blender 5.2 headless prüfbar). Ablauf:
**Moritz baut in Blender → exportiert eine .glb je Skelett/Kit → Back-Skript macht daraus Spieldaten → Einbau im Spiel.**

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
