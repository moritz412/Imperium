# Prüft eine Figuren-Datei (.glb oder .blend) gegen die Regeln aus dev/pc/figuren_bauen.md.
# Aufruf:  blender -b -P pruefen.py -- datei.glb [art]        (art = mensch|pferd|elefant, sonst aus Dateiname)
# Cloud:   python3 pruefen.py datei.glb [art]                  (mit pip-Paket bpy)
# Ausgabe: Liste OK/WARNUNG/FEHLER, Rückgabewert 1 bei Fehlern.
import sys, os
import bpy
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from regeln import CLIPS, LOOP, MAX_BONES, MAX_TRIS, HOEHE, FPS, skelett_art


def args():
    a = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
    a = [x for x in a if not x.endswith('.py')]
    return a[0], (a[1] if len(a) > 1 else None)


def laden(pfad):
    if pfad.lower().endswith('.blend'):
        bpy.ops.wm.open_mainfile(filepath=pfad)
    else:
        bpy.ops.wm.read_factory_settings(use_empty=True)
        bpy.ops.import_scene.gltf(filepath=pfad)


def tris(ob):
    me = ob.evaluated_get(bpy.context.evaluated_depsgraph_get()).to_mesh()
    me.calc_loop_triangles()
    n = len(me.loop_triangles)
    ob.evaluated_get(bpy.context.evaluated_depsgraph_get()).to_mesh_clear()
    return n


def pruefen(pfad, art=None):
    laden(pfad)
    art = art or skelett_art(os.path.basename(pfad))
    out, fehler = [], 0
    def ok(t): out.append('OK       ' + t)
    def warn(t): out.append('WARNUNG  ' + t)
    def err(t):
        nonlocal fehler; fehler += 1; out.append('FEHLER   ' + t)

    arms = [o for o in bpy.data.objects if o.type == 'ARMATURE']
    if len(arms) != 1:
        err(f'genau ein Skelett erwartet, gefunden {len(arms)}')
        return out, fehler
    arm = arms[0]
    nb = len(arm.data.bones)
    (ok if nb <= MAX_BONES[art] else err)(f'Knochen: {nb} (höchstens {MAX_BONES[art]})')
    formen = {pb.custom_shape for pb in arm.pose.bones if pb.custom_shape}   # Knochen-Anzeigeformen (glTF-Import) ignorieren
    meshes = [o for o in bpy.data.objects if o.type == 'MESH' and o not in formen]
    koerper = [o for o in meshes if not o.name.startswith('teil_')]
    teile = [o for o in meshes if o.name.startswith('teil_')]
    if not koerper:
        err('kein Körper-Mesh (Objekte ohne Präfix teil_)')
    for o in koerper:
        if not any(m.type == 'ARMATURE' for m in o.modifiers) and o.parent != arm:
            err(f'{o.name}: nicht ans Skelett gebunden')
        vg = {g.name for g in o.vertex_groups}
        fremd = vg - {b.name for b in arm.data.bones}
        if fremd:
            warn(f'{o.name}: Gewichtsgruppen ohne Knochen: {sorted(fremd)[:5]}')
    for o in teile:
        if not (o.parent == arm and o.parent_type == 'BONE') and not any(m.type == 'ARMATURE' for m in o.modifiers):
            err(f'{o.name}: Teil hängt an keinem Knochen (Parent → Knochen) und hat keine Gewichte')
        p = o.name.split('_')
        if len(p) < 4:
            warn(f'{o.name}: Name nicht im Muster teil_<art>_<kit>_<name>')
    # Dreiecke: Körper + alle Teile (Obergrenze gilt je fertiger Figur; hier Summe als grobe Probe)
    tk = sum(tris(o) for o in koerper)
    tt = max([tris(o) for o in teile], default=0)
    ok(f'Dreiecke Körper {tk}, größtes Teil {tt}')
    if tk > MAX_TRIS[art]:
        err(f'Körper hat {tk} Dreiecke (Figur gesamt höchstens {MAX_TRIS[art]})')
    # Höhe in Ruhe
    bpy.context.scene.frame_set(0)
    zs = []
    for o in koerper:
        for v in o.bound_box:
            zs.append((o.matrix_world @ __import__('mathutils').Vector(v)).z)
    if zs:
        h = max(zs) - min(zs); lo, hi = HOEHE[art]
        (ok if lo <= h <= hi else err)(f'Höhe {h:.2f} m (erwartet {lo}–{hi} m; 1 Einheit = 1 m)')
        (ok if abs(min(zs)) < 0.05 else warn)(f'Füße bei z = {min(zs):.2f} (soll 0)')
    # Clips
    acts = {a.name.split('|')[-1] for a in bpy.data.actions}
    soll = CLIPS[art] if art != 'mensch' else CLIPS['mensch']
    fehlt = [c for c in soll if c not in acts]
    (ok if not fehlt else warn)(f'Clips vorhanden {len(acts)}; fehlen: {", ".join(fehlt) or "keine"}')
    if art == 'mensch' and not any(c in acts for c in CLIPS['mensch_fern'] + CLIPS['mensch_reiter']):
        warn('kein Fernkampf- oder Reiter-Clip (nur nötig für Schützen/Reiter)')
    unbekannt = sorted(acts - set(sum(CLIPS.values(), [])))
    if unbekannt:
        warn(f'Clips mit unbekanntem Namen (werden ignoriert): {unbekannt[:8]}')
    fps = bpy.context.scene.render.fps
    if pfad.lower().endswith('.blend') and fps != FPS:
        warn(f'Szene läuft mit {fps} B/s, erwartet {FPS}')
    for a in bpy.data.actions:
        n = a.name.split('|')[-1]
        s, e = a.frame_range
        if n in LOOP and e - s < 8:
            warn(f'Clip {n}: nur {int(e - s)} Bilder')
    return out, fehler


if __name__ == '__main__':
    pfad, art = args()
    zeilen, f = pruefen(pfad, art)
    print('\n'.join(zeilen))
    print(f'ERGEBNIS: {"FEHLER " + str(f) if f else "in Ordnung"}')
    sys.exit(1 if f else 0)
