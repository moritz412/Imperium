# Blender-Skripte für Schlachtfiguren

Regeln: `../figuren_bauen.md`. Gemeinsame Konstanten (Clip-Namen, Grenzen): `regeln.py`.

| Skript | Zweck | Aufruf PC | Aufruf Cloud (pip-Paket `bpy`) |
|---|---|---|---|
| `pruefen.py` | Figur gegen die Regeln prüfen (Skelett, Knochenzahl, Bindung, Teile, Dreiecke, Höhe, Füße, Clips) | `blender -b -P pruefen.py -- sk_mensch.glb` | `python3 pruefen.py sk_mensch.glb` |
| `backen.py` | Spielpaket bauen: Animations-Textur (Layout wie Prototyp `dev/proto/schlacht_p0.html`), Körper nah/mittel, Teile | `blender -b -P backen.py -- sk_mensch.glb sk_mensch.json --pruefen` | `python3 backen.py sk_mensch.glb sk_mensch.json --pruefen` |
| `testfigur.py` | einfache Testfigur (5 Knochen, 2 Clips) zum Prüfen der Skripte | – | `python3 testfigur.py test.glb` |

`--pruefen` rechnet für jeden Clip ein Bild selbst aus (Skinmatrix × Ruheposition) und vergleicht mit Blenders eigener Verformung.

**Stand 29.10.:** Mit der Testfigur in der Cloud geprüft (Blender 5.2.3): `pruefen.py` „in Ordnung“, `backen.py --pruefen` Abweichung 0,0 mm bei bis zu 47 cm Bewegung.
Nicht getestet: echte MPFB-Figur, Blender 4.x am PC, Einlesen des Pakets im Spiel (Ladecode kommt mit Schlacht-Paket S3), Decimate an großen Meshes.
