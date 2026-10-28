# r3 – Nachbearbeitung der TRELLIS-Modelle für Imperium der Epochen

Spielformat (siehe `mdlParse` im Spiel, `mdl.py`): Pakete `models/<paket>.json` = `{id: base64}`; binär:
`uint32 nt0, nt1` (Dreiecke Körper / Reichsfarbe), je Gruppe nicht indiziert `int16 pos/16000`, `int8 normal/127`,
`uint8 farbe/255`. Keine Texturen – Farben stecken in den Ecken. Y = 0 unten, Höhe 1, x/z mittig, Koordinaten max. ±2,04.
Gruppe 1 („fac“) färbt das Spiel in der Reichsfarbe (Fahnen, Wimpel). Neue ids müssen in `MDL_PK[<paket>]` stehen.

## Einrichtung (nach jedem Container-Neustart prüfen)
```
pip install --break-system-packages trimesh pygltflib fast-simplification scipy pymeshlab pillow numpy
apt-get install -y libopengl0      # für pymeshlab; fehlt es, fällt process.py auf fast_simplification zurück
```
three r128 + GLTFLoader liegen in `vendor/` (für `shot.js`), Chromium unter `/opt/pw-browsers`.

## Kette
1. **Rohmodell → GLB mit Farben** (Dezimieren, Textur → Eckfarben, Y=0, Höhe 1, NaN-UVs → 0):
   ```
   BUDGET_FILE=a5_budget.json NO_OBJ=1 python3 -c "import process;process.process('roh/<id>.glb','<id>','out',0)"
   python3 process.py roh/<id>.glb <id> out [0|1] [--budget 2000] [--tex 512]
   ```
   Budget-Datei: `{"<id>": {"budget": 2000, "tex": 512}}` (auch `{"budget":{id:n},"tex":{id:n}}`). 4. Argument 1 =
   kräftig rote Flächen als Reichsfarbe; Meshes namens `*fac*` im Rohmodell werden immer Gruppe 1.
2. **Sockel weg** (nicht bei Schiffen; bei hohem Unterbau mit `--dry` prüfen): `python3 sockel.py out/<id>.glb out/<id>_ns.glb [--cut 0.06] [--dry]`
3. **Breite normieren** (optional): `python3 normw.py in.glb out.glb <breite> [--keep-height]` – ohne `--keep-height`
   wird gleichmäßig skaliert (Höhe ändert sich, pack.py warnt dann); für Spielmodelle meist `--keep-height`.
4. **Vorschau / Kontaktbogen**: `node shot.js '[{"glb":"out/a.glb"},{"pack":"../models/c_kit.json","id":"anden_tempel"}]' bogen.jpg [spalten]`
   Optionen je Job: `label`, `d` (Abstand, Standard 2,6·max(1,Breite)), `el` (Grad, Städte 30), `az`.
5. **Ins Paket**: `python3 pack.py ../models/c_kit.json <id>=out/<id>_ns.glb [...] [--out neu.json]`
   (vorhandene Keys bleiben, gleiche ids werden ersetzt). Zurück: `python3 pack.py --unpack paket.json outdir [ids]`.
   Danach im Spiel: `OFF_MAN`-Größe des Pakets anpassen, `OFF_VER` erhöhen, Paket mit veröffentlichen.

## Test (27.10.)
`test/`: anden_tempel (c_kit), leg (f_eu, mit Reichsfarbe), lmk_stelen (lmk_a) entpackt → process (Budget 1000/2500/3000)
→ sockel (kein Sockel erkannt, richtig) → pack; dazu `synth_turm` (texturierter Zylinder + Platte): Texturfarben blau/gelb
korrekt übertragen, Platte bis 0,07 erkannt und entfernt. Vergleich: `test/vergleich2.jpg`, `test/vergleich3.jpg`.
Bekannt: Bei halbiertem Budget wirken dünne Säulen facettiert; Farbübertragung nimmt die nächste Originalfläche, dunkle
Innenflächen können Außenflächen leicht abdunkeln.
