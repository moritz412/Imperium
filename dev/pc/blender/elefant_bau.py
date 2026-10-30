# Baut einen Kriegselefanten (nordafrikanischer Waldelefant, Schulter ~2,5 m) mit eigenem Skelett el_* und Bewegungen per Skript.
# Wie pferd_bau.py: Körper aus Querschnitt-Röhren; jede Röhre nennt ihre Knochen, Gewichte nach Abstand zu diesen Knochen.
# Satteldecke rot, Sitz für den Treiber (Mahut) auf dem Nacken: Reiter-Ort +2,45 m hoch, 1,05 m nach vorn (Blickrichtung).
# Aufruf (PC): blender.exe -b -P elefant_bau.py -- <ausgabe.glb> [vorschau.png]
import bpy, bmesh, math, os, sys, json
from mathutils import Vector

a = sys.argv[sys.argv.index("--") + 1:]
OUT = a[0]; VORSCHAU = a[1] if len(a) > 1 else None
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene; sc.render.fps = 30

# ---------- Skelett (Blick nach −Y, Boden z=0) ----------
X = 0.42   # halber Beinabstand
KN = [
    ("el_becken", (0, 1.0, 2.05), (0, 0.4, 2.2), None),
    ("el_ruecken", (0, 0.4, 2.2), (0, -0.4, 2.3), "el_becken"),
    ("el_brust", (0, -0.4, 2.3), (0, -1.1, 2.25), "el_ruecken"),
    ("el_kopf", (0, -1.2, 2.3), (0, -1.85, 2.2), "el_brust"),
    ("el_ruessel1", (0, -1.95, 1.95), (0, -2.15, 1.45), "el_kopf"),
    ("el_ruessel2", (0, -2.15, 1.45), (0, -2.2, 0.95), "el_ruessel1"),
    ("el_ruessel3", (0, -2.2, 0.95), (0, -2.18, 0.45), "el_ruessel2"),
    ("el_ohr_l", (0.35, -1.45, 2.45), (0.75, -1.3, 2.1), "el_kopf"),
    ("el_ohr_r", (-0.35, -1.45, 2.45), (-0.75, -1.3, 2.1), "el_kopf"),
    ("el_schwanz", (0, 1.45, 2.0), (0, 1.6, 1.2), "el_becken"),
]
for s, xs in (("l", X), ("r", -X)):
    KN += [("el_v%s_ober" % s, (xs, -0.85, 1.75), (xs, -0.85, 0.95), "el_brust"),
           ("el_v%s_unter" % s, (xs, -0.85, 0.95), (xs, -0.86, 0.18), "el_v%s_ober" % s),
           ("el_v%s_fuss" % s, (xs, -0.86, 0.18), (xs, -0.92, 0.0), "el_v%s_unter" % s),
           ("el_h%s_ober" % s, (xs, 0.9, 1.75), (xs, 0.85, 0.95), "el_becken"),
           ("el_h%s_unter" % s, (xs, 0.85, 0.95), (xs, 0.88, 0.18), "el_h%s_ober" % s),
           ("el_h%s_fuss" % s, (xs, 0.88, 0.18), (xs, 0.84, 0.0), "el_h%s_unter" % s)]
arm_d = bpy.data.armatures.new("sk_elefant"); arm = bpy.data.objects.new("sk_elefant", arm_d); sc.collection.objects.link(arm)
bpy.context.view_layer.objects.active = arm; bpy.ops.object.mode_set(mode="EDIT")
for n, h, t, p in KN:
    b = arm_d.edit_bones.new(n); b.head = h; b.tail = t; b.roll = 0
    if p: b.parent = arm_d.edit_bones[p]; b.use_connect = False
bpy.ops.object.mode_set(mode="OBJECT")
for pb in arm.pose.bones: pb.rotation_mode = "XYZ"

# ---------- Körper ----------
bm = bmesh.new(); ZUORD = []   # (Vertexliste, Knochenliste)
V = lambda *c: Vector(c)
def loft(punkte, rx, rz, mi, knochen, seg=8, deckel=True, quer0=Vector((1, 0, 0))):
    ringe = []; vs = []
    for k, p in enumerate(punkte):
        d = (punkte[min(k + 1, len(punkte) - 1)] - punkte[max(k - 1, 0)]).normalized()
        hoch = d.cross(quer0).normalized()
        if hoch.length < 1e-4: hoch = Vector((0, 0, 1))
        quer = hoch.cross(d).normalized()
        r = [bm.verts.new(p + quer * rx[k] * math.cos(2 * math.pi * i / seg) + hoch * rz[k] * math.sin(2 * math.pi * i / seg)) for i in range(seg)]
        ringe.append(r); vs += r
    for r0, r1 in zip(ringe, ringe[1:]):
        for i in range(seg):
            j = (i + 1) % seg; bm.faces.new((r0[i], r0[j], r1[j], r1[i])).material_index = mi
    if deckel:
        for r in (ringe[0], ringe[-1]): bm.faces.new(r).material_index = mi
    ZUORD.append((vs, knochen))
RUMPF = ["el_becken", "el_ruecken", "el_brust"]
loft([V(0, 1.45, 2.0), V(0, 1.2, 2.15), V(0, 0.7, 2.2), V(0, 0.0, 2.2), V(0, -0.6, 2.2), V(0, -1.05, 2.15), V(0, -1.3, 2.0)],
     [0.35, 0.62, 0.74, 0.76, 0.74, 0.62, 0.38], [0.4, 0.72, 0.85, 0.88, 0.85, 0.75, 0.45], 0, RUMPF, seg=16)
# Kopf (hoch gewölbte Stirn) und Rüssel
loft([V(0, -1.15, 2.35), V(0, -1.45, 2.5), V(0, -1.75, 2.4), V(0, -1.95, 2.05)], [0.38, 0.42, 0.36, 0.24], [0.42, 0.48, 0.42, 0.3], 0,
     ["el_brust", "el_kopf"], seg=12)
loft([V(0, -1.97, 1.95), V(0, -2.1, 1.6), V(0, -2.17, 1.25), V(0, -2.2, 0.95), V(0, -2.2, 0.65), V(0, -2.17, 0.42)],
     [0.19, 0.16, 0.13, 0.11, 0.09, 0.08], [0.17, 0.14, 0.12, 0.1, 0.08, 0.07], 0, ["el_kopf", "el_ruessel1", "el_ruessel2", "el_ruessel3"], seg=8)
# Ohren: flache Scheiben seitlich am Kopf
for s, xs in (("l", 1), ("r", -1)):
    loft([V(0.3 * xs, -1.42, 2.62), V(0.48 * xs, -1.35, 2.4), V(0.55 * xs, -1.3, 2.1), V(0.45 * xs, -1.3, 1.85)],
         [0.05, 0.05, 0.05, 0.04], [0.06, 0.32, 0.3, 0.12], 0, ["el_ohr_" + s], seg=6, quer0=Vector((0, 1, 0)))
    # Stoßzähne (Elfenbein), leicht nach vorn-oben gebogen
    loft([V(0.16 * xs, -1.9, 1.95), V(0.2 * xs, -2.1, 1.72), V(0.22 * xs, -2.38, 1.66), V(0.22 * xs, -2.55, 1.75)],
         [0.06, 0.05, 0.035, 0.01], [0.06, 0.05, 0.035, 0.01], 2, ["el_kopf"], seg=6)
# Schwanz mit Quaste
loft([V(0, 1.42, 2.0), V(0, 1.55, 1.6), V(0, 1.6, 1.25), V(0, 1.6, 1.05)], [0.05, 0.03, 0.025, 0.06], [0.05, 0.03, 0.025, 0.06], 0, ["el_becken", "el_schwanz"], seg=5)
# Beine (Säulen) und Fußsohlen/Nägel
for s, xs in (("l", X), ("r", -X)):
    for v_, y0, y1 in (("v", -0.85, -0.86), ("h", 0.9, 0.88)):
        loft([V(xs, y0, 1.95), V(xs, y0, 1.4), V(xs, y0, 0.95), V(xs, y1, 0.5), V(xs, y1, 0.14)],
             [0.3, 0.26, 0.22, 0.2, 0.21], [0.32, 0.27, 0.23, 0.2, 0.21], 0, ["el_%s%s_ober" % (v_, s), "el_%s%s_unter" % (v_, s)] + (["el_brust"] if v_ == "v" else ["el_becken"]), seg=10)
        loft([V(xs, y1, 0.14), V(xs, y1 - 0.02, 0.0)], [0.22, 0.24], [0.22, 0.24], 3, ["el_%s%s_fuss" % (v_, s)], seg=10)
# Satteldecke (rot, Saum gelb) und Sitzpolster für den Treiber
loft([V(0, 0.55, 2.98), V(0, 0.0, 3.08), V(0, -0.55, 3.0)], [0.82, 0.86, 0.8], [0.06, 0.06, 0.06], 1, RUMPF, seg=8)
for xs in (1, -1):
    loft([V(0.72 * xs, 0.5, 2.6), V(0.8 * xs, 0.0, 2.55), V(0.76 * xs, -0.5, 2.58)], [0.03, 0.03, 0.03], [0.42, 0.45, 0.42], 1, RUMPF, seg=4)
bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
me = bpy.data.meshes.new("koerper_elefant"); bm.to_mesh(me)
idx = [[v.index for v in vs] for vs, _ in ZUORD]; bm.free()
for p_ in me.polygons: p_.use_smooth = True
body = bpy.data.objects.new("koerper_elefant", me); sc.collection.objects.link(body)
def mat(name, rgb, rough=0.85):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]; b.inputs["Base Color"].default_value = (*rgb, 1); b.inputs["Roughness"].default_value = rough
    return m
for m in (mat("haut", (0.2, 0.18, 0.16)), mat("decke", (0.42, 0.05, 0.03)), mat("elfenbein", (0.75, 0.68, 0.52), 0.5), mat("sohle", (0.07, 0.06, 0.05))):
    me.materials.append(m)
# Gewichte: je Röhre nur ihre Knochen, zwei nächste, 1/d^4
segs = {n: (Vector(h), Vector(t)) for n, h, t, p in KN}
for n in segs: body.vertex_groups.new(name=n)
def abst(p, a_, b_):
    ab = b_ - a_; t = max(0.0, min(1.0, (p - a_).dot(ab) / ab.length_squared)); return (p - (a_ + ab * t)).length
for vi, (_, kn) in zip(idx, ZUORD):
    for i in vi:
        p = me.vertices[i].co
        kand = sorted((abst(p, *segs[n]), n) for n in kn)[:2]
        w = [1 / max(d, 0.03) ** 4 for d, _ in kand]; sw = sum(w)
        for (d, n), wi in zip(kand, w): body.vertex_groups[n].add([i], wi / sw, "REPLACE")
body.parent = arm; body.modifiers.new("Armature", "ARMATURE").object = arm

# ---------- Bewegungen ----------
arm.animation_data_create(); TEMPO = {}
def setz(n, rx=0.0, ry=0.0, rz=0.0): arm.pose.bones[n].rotation_euler = (math.radians(rx), math.radians(ry), math.radians(rz))
def hebe(dz, dy=0.0):
    arm.pose.bones["el_becken"].location = arm.data.bones["el_becken"].matrix_local.to_3x3().inverted() @ Vector((0, dy, dz))
def nullen():
    for pb in arm.pose.bones: pb.rotation_euler = (0, 0, 0); pb.location = (0, 0, 0)
def taste(f):
    for pb in arm.pose.bones: pb.keyframe_insert("rotation_euler", frame=f)
    arm.pose.bones["el_becken"].keyframe_insert("location", frame=f)
def neue(name):
    act = bpy.data.actions.new(name); act.use_fake_user = True; arm.animation_data.action = act
def ruessel(a1, a2, a3, seit=0.0):
    setz("el_ruessel1", a1, 0, seit); setz("el_ruessel2", a2, 0, seit * 0.7); setz("el_ruessel3", a3, 0, seit * 0.5)
def zyklus(name, laenge, amp_o, amp_u, bob, tempo, kopf=0.0, ohr=8, schwung=6, wild=0.0):
    """Elefanten gehen im Passgang-Viertakt (lateral): hl, vl, hr, vr; Beine bleiben säulenartig, Knie beugt nur in der Schwungphase."""
    neue(name)
    for k in range(laenge + 1):
        t = k / laenge; nullen()
        for b, ph in {"hl": 0.0, "vl": 0.2, "hr": 0.5, "vr": 0.7}.items():
            w = 2 * math.pi * (t + ph)
            setz("el_%s_ober" % b, amp_o * math.sin(w))
            beug = amp_u * max(0.0, math.sin(w + math.pi / 2)) ** 1.5
            setz("el_%s_unter" % b, -beug if b[0] == "v" else beug)
            setz("el_%s_fuss" % b, beug * 0.5 if b[0] == "v" else -beug * 0.3)
        hebe(bob * math.sin(4 * math.pi * t))
        setz("el_becken", 0, 2.5 * math.sin(2 * math.pi * t), 0)   # Wiegen von Seite zu Seite
        setz("el_kopf", kopf + 3 * math.sin(4 * math.pi * t) + wild * math.sin(6 * math.pi * t), 0, wild * 1.5 * math.sin(2 * math.pi * t))
        ruessel(8 + schwung * math.sin(2 * math.pi * t), 6 + schwung * math.sin(2 * math.pi * t - 0.6), 5 + schwung * math.sin(2 * math.pi * t - 1.2),
                (schwung + wild * 2) * math.sin(2 * math.pi * t + 0.4))
        for s, sg in (("l", 1), ("r", -1)): setz("el_ohr_" + s, 0, 0, sg * (ohr * math.sin(2 * math.pi * t) + wild))
        setz("el_schwanz", 10 * math.sin(2 * math.pi * t), 0, 12 * math.sin(2 * math.pi * t + 1))
        taste(k + 1)
    TEMPO[name] = tempo
zyklus("gehen", 40, 14, 25, 0.03, 1.8)
zyklus("ansturm", 22, 24, 40, 0.07, 5.5, kopf=-8, ohr=25, schwung=10)
zyklus("panik", 22, 22, 38, 0.06, 4.5, kopf=10, ohr=30, schwung=22, wild=14)
neue("stehen")
for k in range(91):
    t = k / 90; nullen()
    for s, sg in (("l", 1), ("r", -1)): setz("el_ohr_" + s, 0, 0, sg * 10 * max(0, math.sin(4 * math.pi * t)) ** 2)   # Ohrenfächeln
    ruessel(6 + 5 * math.sin(2 * math.pi * t), 5 + 5 * math.sin(2 * math.pi * t - 0.7), 6 + 6 * math.sin(2 * math.pi * t - 1.4), 6 * math.sin(2 * math.pi * t))
    setz("el_schwanz", 6 * math.sin(4 * math.pi * t), 0, 14 * math.sin(2 * math.pi * t)); setz("el_kopf", 2 * math.sin(2 * math.pi * t))
    hebe(0.01 * math.sin(2 * math.pi * t)); taste(k + 1)
neue("trompeten")   # Kopf hoch, Rüssel nach oben gerollt, Ohren weit
for f, p in [(1, 0), (10, 1), (34, 1), (46, 0)]:
    nullen(); setz("el_kopf", -16 * p); ruessel(-70 * p, -45 * p, -40 * p)
    for s, sg in (("l", 1), ("r", -1)): setz("el_ohr_" + s, 0, 0, sg * 40 * p)
    taste(f)
neue("stampfen")   # Vorhand hoch, auf den Gegner niederstampfen
for f, p, q in [(1, 0, 0), (12, 1, 0), (18, 1, 0), (24, 0, 1), (34, 0, 0)]:
    nullen(); setz("el_becken", -14 * p + 2 * q); setz("el_kopf", -10 * p); ruessel(-35 * p, -20 * p, -10 * p)
    for s in "lr": setz("el_v%s_ober" % s, 35 * p); setz("el_v%s_unter" % s, -55 * p)
    for s, sg in (("l", 1), ("r", -1)): setz("el_ohr_" + s, 0, 0, sg * 30 * (p + q))
    hebe(0.03 * p - 0.05 * q); taste(f)
neue("treffer")
for f, p in [(1, 0), (5, 1), (18, 0)]:
    nullen(); setz("el_kopf", -12 * p, 0, 8 * p); ruessel(-25 * p, -10 * p, 0)
    for s, sg in (("l", 1), ("r", -1)): setz("el_ohr_" + s, 0, 0, sg * 30 * p)
    hebe(-0.04 * p); taste(f)
neue("sterben")   # knickt vorn ein, kippt auf die Seite
for f, p, q in [(1, 0, 0), (14, 1, 0), (28, 1, 0.6), (46, 1, 1)]:
    nullen()
    for s in "lr":
        setz("el_v%s_ober" % s, -15 * p); setz("el_v%s_unter" % s, -50 * p); setz("el_h%s_ober" % s, 20 * p); setz("el_h%s_unter" % s, 35 * p)
    setz("el_becken", 4 * p, 82 * q, 0); setz("el_kopf", 10 * p); ruessel(30 * q, 20 * q, 10 * q)
    hebe(-0.75 * p - 0.55 * q); taste(f)
print("CLIPS", [x.name for x in bpy.data.actions])

def nimm(name):
    act = bpy.data.actions[name]; arm.animation_data.action = act
    if getattr(act, "slots", None) and len(act.slots): arm.animation_data.action_slot = act.slots[0]
if VORSCHAU:
    cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam")); sc.collection.objects.link(cam); sc.camera = cam; cam.data.lens = 35
    cam.location = (-6.5, -4.5, 2.6); cam.rotation_euler = (math.radians(82), 0, math.radians(-55))
    sun = bpy.data.objects.new("sun", bpy.data.lights.new("sun", "SUN")); sc.collection.objects.link(sun)
    sun.rotation_euler = (math.radians(45), 0, math.radians(-20)); sun.data.energy = 3.5
    bpy.ops.mesh.primitive_plane_add(size=60)
    sc.world = bpy.data.worlds.new("w"); sc.world.use_nodes = True; sc.world.node_tree.nodes["Background"].inputs[0].default_value = (0.55, 0.57, 0.6, 1)
    sc.render.engine = "BLENDER_EEVEE"; sc.render.resolution_x, sc.render.resolution_y = 560, 420
    for i, (c, f) in enumerate([("stehen", 1), ("gehen", 12), ("ansturm", 6), ("trompeten", 20), ("stampfen", 14), ("sterben", 46)]):
        nimm(c); sc.frame_set(f); sc.render.filepath = VORSCHAU.replace(".png", "_%d.png" % i); bpy.ops.render.render(write_still=True)

nimm("stehen"); sc.frame_set(1)
bpy.ops.object.select_all(action="DESELECT")
for o in (arm, body): o.select_set(True)
bpy.context.view_layer.objects.active = arm
bpy.ops.export_scene.gltf(filepath=OUT, export_format="GLB", use_selection=True, export_animation_mode="ACTIONS", export_apply=True, export_morph=False, export_skins=True)
json.dump({"tempo": TEMPO, "variante": "a", "sitz": [0, 2.45, 1.05]}, open(OUT + ".clips.json", "w"))
print("EXPORT", OUT, os.path.getsize(OUT) // 1024, "KB", "Dreiecke", sum(len(p.vertices) - 2 for p in me.polygons))
