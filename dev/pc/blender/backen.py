# Backt eine Figuren-Datei (.glb/.blend) zu einem Spielpaket für die Echtzeitschlacht.
# Aufruf:  blender -b -P backen.py -- eingabe.glb ausgabe.json [--pruefen]
# Cloud:   python3 backen.py eingabe.glb ausgabe.json [--pruefen]
#
# Format (v1), passend zum Shader aus dev/proto/schlacht_p0.html (bakeAnimations):
#   anim: Float32-Textur, Breite = Knochen × 4 Pixel (RGBA), Höhe = Summe aller Clip-Bilder.
#         Je Knochen und Bild eine 4×4-Skinmatrix (Weltpose × inverse Ruhepose), spaltenweise (wie three.js Matrix4.elements).
#   Koordinaten: three.js (Y oben). Blender (Z oben) wird umgerechnet: (x, y, z) → (x, z, −y).
#   koerper/teile: Ruhepose-Positionen, Normalen, Dreiecke, je Ecke 4 Knochen + 4 Gewichte (Teile: starr an einem Knochen),
#         'col' je Ecke RGB (u8, sRGB) aus Grundfarb-Textur bzw. Materialfarbe (Mittel der angrenzenden Flächenecken).
#         'msk' (optional) je Ecke u8: 1 Kleidung, 2 Schildvorderseite, 0 fest – für Tönung je Volk im Spiel.
#   Detailstufen: 'nah' (Original) und 'mittel' (Decimate auf ≈ 400 bzw. 27 % Dreiecke).
# Mit --pruefen wird für jeden Clip ein Bild in Blender ausgewertet und mit der eigenen Rechnung verglichen (max. Abweichung in mm).
import sys, os, json, base64, struct
import bpy, mathutils
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from regeln import LOOP, FPS, skelett_art

C = mathutils.Matrix(((1, 0, 0, 0), (0, 0, 1, 0), (0, -1, 0, 0), (0, 0, 0, 1)))   # Blender → three.js
CI = C.inverted()
MITTEL_TRIS = 400


def b64f(a): return base64.b64encode(struct.pack('<%df' % len(a), *a)).decode()
def b64u16(a): return base64.b64encode(struct.pack('<%dH' % len(a), *a)).decode()
def b64u8(a): return base64.b64encode(struct.pack('<%dB' % len(a), *a)).decode()


def laden(pfad):
    if pfad.lower().endswith('.blend'):
        bpy.ops.wm.open_mainfile(filepath=pfad)
    else:
        bpy.ops.wm.read_factory_settings(use_empty=True)
        bpy.context.scene.render.fps = FPS        # glTF-Zeiten werden mit dieser Rate in Bilder umgerechnet
        bpy.ops.import_scene.gltf(filepath=pfad)


def aktion_setzen(arm, act):
    ad = arm.animation_data or arm.animation_data_create()
    for tr in ad.nla_tracks:
        tr.mute = True
    ad.action = act
    if act is not None and hasattr(ad, 'action_slot') and getattr(act, 'slots', None) and len(act.slots):
        ad.action_slot = act.slots[0]


_BILDER = {}


def _lin2srgb(c):
    return c * 12.92 if c <= 0.0031308 else 1.055 * c ** (1 / 2.4) - 0.055


def _farbquelle(mat):
    """Bild (Grundfarb-Textur) oder feste Farbe (sRGB 0..1) eines Materials."""
    if mat is None or not mat.use_nodes:
        c = mat.diffuse_color if mat else (0.7, 0.7, 0.7, 1)
        return None, [_lin2srgb(c[i]) for i in range(3)]
    nodes = mat.node_tree.nodes
    bsdf = next((n for n in nodes if n.type == 'BSDF_PRINCIPLED'), None)
    if bsdf:
        inp = bsdf.inputs['Base Color']
        if inp.is_linked:
            stapel, gesehen = [inp.links[0].from_node], set()
            while stapel:
                n = stapel.pop()
                if n.name in gesehen: continue
                gesehen.add(n.name)
                if n.type == 'TEX_IMAGE' and n.image: return n.image, None
                for i in n.inputs:
                    for l in i.links: stapel.append(l.from_node)
        else:
            return None, [_lin2srgb(inp.default_value[i]) for i in range(3)]
    tex = next((n for n in nodes if n.type == 'TEX_IMAGE' and n.image), None)
    return (tex.image, None) if tex else (None, [0.7, 0.7, 0.7])


def _pixel(img, uv):
    if img.name not in _BILDER:
        import numpy as np
        w, h = img.size
        a = np.empty(w * h * 4, dtype=np.float32); img.pixels.foreach_get(a)
        _BILDER[img.name] = (a.reshape(h, w, 4), w, h)
    a, w, h = _BILDER[img.name]
    x = int((uv[0] % 1.0) * (w - 1)); y = int((uv[1] % 1.0) * (h - 1))
    return a[y, x, :3]


def farben(ob, me):
    """Eine Farbe je Ecke (sRGB, 0..255): Mittel der Grundfarbe aller angrenzenden Flächenecken."""
    quellen = [_farbquelle(s.material) for s in ob.material_slots] or [(None, [0.7, 0.7, 0.7])]
    uvl = me.uv_layers.active.data if me.uv_layers.active else None
    summe = [[0.0, 0.0, 0.0, 0] for _ in me.vertices]
    for p in me.polygons:
        img, fest = quellen[min(p.material_index, len(quellen) - 1)]
        for li in p.loop_indices:
            vi = me.loops[li].vertex_index
            c = _pixel(img, uvl[li].uv) if (img and uvl) else fest
            s = summe[vi]; s[0] += c[0]; s[1] += c[1]; s[2] += c[2]; s[3] += 1
    out = []
    for s in summe:
        k = max(1, s[3]); out += [max(0, min(255, round(255 * s[i] / k))) for i in range(3)]
    return out


def _maskenart(mat):
    """Tönungsmaske (31.10., Farben je Volk): 1 = Kleidung (Tunika, Mantel), 2 = Schildvorderseite, 0 = fest."""
    n = (mat.name if mat else "").lower().split(".")[0]
    if n.startswith("tunika") or n in ("mantel", "umhang"):   # Hose bleibt in Paketfarbe (Kontrast zur Tunika)
        return 1
    if n.endswith("_vorn"):
        return 2
    return 0


def maske(ob, me):
    """Maske je Ecke: Art der Mehrheit der angrenzenden Flächen (u8). None, wenn nichts tönbar ist."""
    arten = [_maskenart(s.material) for s in ob.material_slots] or [0]
    z = [[0, 0, 0] for _ in me.vertices]
    for p in me.polygons:
        a = arten[min(p.material_index, len(arten) - 1)]
        for vi in p.vertices:
            z[vi][a] += 1
    out = [max(range(3), key=lambda k: c[k]) for c in z]
    return out if any(out) else None


def mesh_daten(ob, arm, bidx, starr=None, ziel_tris=None):
    """Ruhepose-Mesh in three.js-Koordinaten; starr = Knochenindex für Teile."""
    dg = bpy.context.evaluated_depsgraph_get()
    tmp = None
    if ziel_tris:
        tmp = ob.copy(); tmp.data = ob.data.copy(); bpy.context.collection.objects.link(tmp)
        n0 = sum(len(p.vertices) - 2 for p in tmp.data.polygons)
        d = tmp.modifiers.new('lod', 'DECIMATE'); d.ratio = max(0.05, min(1.0, ziel_tris / max(1, n0)))
        # Decimate vor die Skelett-Verformung ziehen, damit Gewichte erhalten bleiben
        while tmp.modifiers[0] != d:
            bpy.context.view_layer.objects.active = tmp
            bpy.ops.object.modifier_move_up(modifier=d.name)
        dg = bpy.context.evaluated_depsgraph_get()
    src = tmp or ob
    ev = src.evaluated_get(dg)
    me = ev.to_mesh()
    me.calc_loop_triangles()
    W = ev.matrix_world
    N3 = W.to_3x3().inverted().transposed()
    gruppen = {g.index: g.name for g in src.vertex_groups}
    pos, nrm, si, sw, idx = [], [], [], [], []
    for v in me.vertices:
        p = C @ (W @ v.co); n = (C.to_3x3() @ (N3 @ v.normal)).normalized()
        pos += [p.x, p.y, p.z]; nrm += [n.x, n.y, n.z]
        if starr is not None:
            ws = [(starr, 1.0)]
        else:
            ws = sorted(((bidx[gruppen[g.group]], g.weight) for g in v.groups if gruppen.get(g.group) in bidx and g.weight > 0),
                        key=lambda t: -t[1])[:4]
        s = sum(w for _, w in ws) or 1.0
        ws = [(b, w / s) for b, w in ws] + [(0, 0.0)] * (4 - len(ws))
        si += [b for b, _ in ws]; sw += [round(w * 255) for _, w in ws]
    for t in me.loop_triangles:
        idx += list(t.vertices)
    ntri = len(me.loop_triangles)
    col = farben(src, me)
    msk = maske(src, me)
    ev.to_mesh_clear()
    if tmp:
        bpy.data.objects.remove(tmp, do_unlink=True)
    return {'n': len(pos) // 3, 'tris': ntri, 'pos': b64f(pos), 'nrm': b64f(nrm), 'idx': b64u16(idx),
            'si': b64u8(si), 'sw': b64u8(sw), 'col': b64u8(col), **({'msk': b64u8(msk)} if msk else {})}, (pos, si, sw)


def backen(ein, aus, pruefen=False):
    laden(ein)
    arms = [o for o in bpy.data.objects if o.type == 'ARMATURE']
    assert len(arms) == 1, 'genau ein Skelett erwartet'
    arm = arms[0]
    bones = list(arm.data.bones)
    bidx = {b.name: i for i, b in enumerate(bones)}
    formen = {pb.custom_shape for pb in arm.pose.bones if pb.custom_shape}
    meshes = [o for o in bpy.data.objects if o.type == 'MESH' and o not in formen]
    # Ruhepose für die Mesh-Daten
    arm.data.pose_position = 'REST'; aktion_setzen(arm, None); bpy.context.view_layer.update()
    koerper, teile, roh = {}, {}, {}
    for o in meshes:
        if o.name.startswith('teil_'):
            b = bidx.get(o.parent_bone) if o.parent_type == 'BONE' else None
            if b is None and not o.vertex_groups:
                print('WARNUNG: Teil ohne Knochen übersprungen:', o.name); continue
            teile[o.name] = {'knochen': b, 'nah': mesh_daten(o, arm, bidx, starr=b)[0]}
            roh[o.name] = mesh_daten(o, arm, bidx, starr=b)[1]
        else:
            nah, r = mesh_daten(o, arm, bidx)
            koerper[o.name] = {'nah': nah, 'mittel': mesh_daten(o, arm, bidx, ziel_tris=MITTEL_TRIS)[0]}
            roh[o.name] = r
    arm.data.pose_position = 'POSE'
    # Animationen backen
    inv_rest = [(arm.matrix_world @ b.matrix_local).inverted() for b in bones]
    clips, rows, daten = [], 0, []
    acts = sorted({a for a in bpy.data.actions}, key=lambda a: a.name)
    tp = ein + '.clips.json'
    TEMPO = json.load(open(tp)).get('tempo', {}) if os.path.exists(tp) else {}
    for act in acts:
        name = act.name.split('|')[-1]
        s, e = int(round(act.frame_range[0])), int(round(act.frame_range[1]))
        loop = name in LOOP
        frames = list(range(s, e)) if loop and e > s else list(range(s, e + 1))
        aktion_setzen(arm, act)
        for f in frames:
            bpy.context.scene.frame_set(f)
            for i, b in enumerate(bones):
                M = C @ (arm.matrix_world @ arm.pose.bones[b.name].matrix) @ inv_rest[i] @ CI
                daten += [M[r][c] for c in range(4) for r in range(4)]   # spaltenweise
        c = {'n': name, 'row': rows, 'len': len(frames), 'loop': loop}
        if name in TEMPO: c['speed'] = TEMPO[name]   # m/s der Aufnahme: Spiel passt Abspieltempo an die Bewegung an
        clips.append(c)
        rows += len(frames)
    pack = {'v': 1, 'art': skelett_art(os.path.basename(ein)), 'fps': FPS,
            'bones': [{'n': b.name, 'p': bidx[b.parent.name] if b.parent else -1} for b in bones],
            'clips': clips, 'anim': {'w': len(bones) * 4, 'h': rows, 'f32': b64f(daten)},
            'koerper': koerper, 'teile': teile}
    with open(aus, 'w') as fh:
        json.dump(pack, fh, separators=(',', ':'))
    print(f'Paket {aus}: {len(bones)} Knochen, {len(clips)} Clips, {rows} Bilder, '
          f'{len(koerper)} Körper, {len(teile)} Teile, {os.path.getsize(aus) / 1e6:.2f} MB')
    for k, v in koerper.items():
        print(f'  {k}: nah {v["nah"]["tris"]} / mittel {v["mittel"]["tris"]} Dreiecke')
    if pruefen:
        vergleich(arm, meshes, roh, clips, daten, len(bones))


def vergleich(arm, meshes, roh, clips, daten, nb):
    """Wertet je Clip das mittlere Bild in Blender aus und vergleicht mit Skinmatrix × Ruheposition."""
    dg = None; schlecht = 0
    for c in clips:
        act = next(a for a in bpy.data.actions if a.name.split('|')[-1] == c['n'])
        aktion_setzen(arm, act)
        k = max(1, c['len'] // 4); f = int(round(act.frame_range[0])) + k
        bpy.context.scene.frame_set(f); dg = bpy.context.evaluated_depsgraph_get()
        row = c['row'] + k; mx = 0.0; bew = 0.0
        for o in meshes:
            if o.name not in roh: continue
            pos, si, sw = roh[o.name]
            ev = o.evaluated_get(dg); me = ev.to_mesh()
            if len(me.vertices) * 3 != len(pos):
                ev.to_mesh_clear(); continue
            for vi, v in enumerate(me.vertices):
                ziel = C @ (ev.matrix_world @ v.co)
                p = mathutils.Vector((pos[vi * 3], pos[vi * 3 + 1], pos[vi * 3 + 2], 1.0)); acc = mathutils.Vector((0, 0, 0))
                for j in range(4):
                    w = sw[vi * 4 + j] / 255.0
                    if w <= 0: continue
                    b = si[vi * 4 + j]; o16 = (row * nb + b) * 16
                    M = mathutils.Matrix([[daten[o16 + c4 * 4 + r] for c4 in range(4)] for r in range(4)])
                    acc += w * (M @ p).xyz
                mx = max(mx, (acc - ziel).length); bew = max(bew, (ziel - p.xyz).length)
            ev.to_mesh_clear()
        ok = mx < 0.01
        schlecht += 0 if ok else 1
        print(f'  Prüfung {c["n"]} Bild {k}: max. Abweichung {mx * 1000:.1f} mm bei Bewegung bis {bew * 100:.0f} cm {"OK" if ok else "FEHLER"}')
    print('PRÜFUNG:', 'in Ordnung' if not schlecht else f'{schlecht} Clips abweichend')


if __name__ == '__main__':
    a = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
    a = [x for x in a if not x.endswith('.py')]
    backen(a[0], a[1], '--pruefen' in a)
