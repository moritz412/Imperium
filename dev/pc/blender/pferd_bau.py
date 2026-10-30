# Baut ein Pferd (antikes Reitpferd, Widerrist ~1,45 m) mit eigenem Skelett pf_* und Gangarten per Skript; Export als .glb.
# Körper aus geschlossenen Formen (Querschnitte entlang Linien), Gewichte nach Abstand zu den Knochen (zwei nächste).
# Gangarten nach den Fußfolgen: Schritt Viertakt, Trab diagonal, Galopp mit Führbein, Ansturm = Galopp mit gesenktem Kopf.
# Aufruf (PC): blender.exe -b -P pferd_bau.py -- <ausgabe.glb> [vorschau.png] [fell r,g,b]
import bpy, bmesh, math, os, sys, json
from mathutils import Vector, Matrix, Euler

a = sys.argv[sys.argv.index("--") + 1:]
OUT = a[0]; VORSCHAU = a[1] if len(a) > 1 and a[1].endswith(".png") else None
FELL = tuple(float(x) for x in a[2].split(",")) if len(a) > 2 else (0.22, 0.11, 0.05)
FPS = 30
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene; sc.render.fps = FPS

# ---------- Skelett (Blick nach −Y, Boden z=0) ----------
X = 0.15   # halber Beinabstand
KN = [  # name, kopf, ende, eltern
    ("pf_becken", (0, 0.55, 1.15), (0, 0.2, 1.18), None),
    ("pf_ruecken", (0, 0.2, 1.18), (0, -0.35, 1.22), "pf_becken"),
    ("pf_brust", (0, -0.35, 1.22), (0, -0.7, 1.25), "pf_ruecken"),
    ("pf_hals1", (0, -0.7, 1.3), (0, -0.93, 1.55), "pf_brust"),
    ("pf_hals2", (0, -0.93, 1.55), (0, -1.08, 1.76), "pf_hals1"),
    ("pf_kopf", (0, -1.08, 1.76), (0, -1.42, 1.47), "pf_hals2"),
    ("pf_schweif", (0, 0.82, 1.22), (0, 1.02, 0.82), "pf_becken"),
]
for s, xs in (("l", X), ("r", -X)):
    KN += [("pf_v%s_ober" % s, (xs, -0.6, 1.0), (xs, -0.63, 0.58), "pf_brust"),
           ("pf_v%s_unter" % s, (xs, -0.63, 0.58), (xs, -0.61, 0.11), "pf_v%s_ober" % s),
           ("pf_v%s_huf" % s, (xs, -0.61, 0.11), (xs, -0.67, 0.0), "pf_v%s_unter" % s),
           ("pf_h%s_ober" % s, (xs, 0.6, 1.02), (xs, 0.74, 0.58), "pf_becken"),
           ("pf_h%s_unter" % s, (xs, 0.74, 0.58), (xs, 0.63, 0.11), "pf_h%s_ober" % s),
           ("pf_h%s_huf" % s, (xs, 0.63, 0.11), (xs, 0.67, 0.0), "pf_h%s_unter" % s)]

arm_d = bpy.data.armatures.new("sk_pferd"); arm = bpy.data.objects.new("sk_pferd", arm_d); sc.collection.objects.link(arm)
bpy.context.view_layer.objects.active = arm; bpy.ops.object.mode_set(mode="EDIT")
for n, h, t, p in KN:
    b = arm_d.edit_bones.new(n); b.head = h; b.tail = t; b.roll = 0
    if p: b.parent = arm_d.edit_bones[p]; b.use_connect = False
bpy.ops.object.mode_set(mode="OBJECT")
for pb in arm.pose.bones: pb.rotation_mode = "XYZ"

# ---------- Körper ----------
bm = bmesh.new()
def loft(punkte, rx, rz, mi, seg=8, deckel=True):
    """Röhre entlang punkte (Liste Vector), elliptische Querschnitte rx/rz je Punkt."""
    ringe = []
    for k, p in enumerate(punkte):
        d = (punkte[min(k + 1, len(punkte) - 1)] - punkte[max(k - 1, 0)]).normalized()
        quer = Vector((1, 0, 0)); hoch = d.cross(quer).normalized()
        if hoch.length < 1e-4: hoch = Vector((0, 0, 1))
        quer = hoch.cross(d).normalized()
        ringe.append([bm.verts.new(p + quer * rx[k] * math.cos(2 * math.pi * i / seg) + hoch * rz[k] * math.sin(2 * math.pi * i / seg)) for i in range(seg)])
    for r0, r1 in zip(ringe, ringe[1:]):
        for i in range(seg):
            j = (i + 1) % seg; f = bm.faces.new((r0[i], r0[j], r1[j], r1[i])); f.material_index = mi
    if deckel:
        for r in (ringe[0], ringe[-1]):
            f = bm.faces.new(r); f.material_index = mi
V = lambda *c: Vector(c)
# Rumpf: Kruppe -> Brust, Bauchlinie
loft([V(0, 0.92, 1.12), V(0, 0.7, 1.16), V(0, 0.35, 1.13), V(0, 0.0, 1.11), V(0, -0.4, 1.12), V(0, -0.72, 1.12), V(0, -0.85, 1.05)],
     [0.12, 0.25, 0.27, 0.27, 0.28, 0.24, 0.14], [0.12, 0.27, 0.3, 0.31, 0.31, 0.29, 0.17], 0, seg=16)
# Hals und Kopf
loft([V(0, -0.68, 1.22), V(0, -0.85, 1.45), V(0, -0.98, 1.64), V(0, -1.08, 1.77)], [0.15, 0.12, 0.1, 0.09], [0.22, 0.17, 0.13, 0.11], 0, seg=10)
loft([V(0, -1.05, 1.8), V(0, -1.2, 1.68), V(0, -1.34, 1.54), V(0, -1.44, 1.45)], [0.08, 0.08, 0.06, 0.05], [0.1, 0.09, 0.07, 0.06], 0, seg=8)
for xs in (0.05, -0.05):   # Ohren
    loft([V(xs, -1.06, 1.85), V(xs * 1.2, -1.04, 1.95)], [0.025, 0.005], [0.015, 0.003], 0, seg=4)
# Mähne (dunkel) und Schweif
loft([V(0, -0.7, 1.4), V(0, -0.86, 1.58), V(0, -0.98, 1.74), V(0, -1.06, 1.86)], [0.025, 0.03, 0.03, 0.02], [0.06, 0.07, 0.06, 0.04], 1, seg=4)
loft([V(0, 0.9, 1.18), V(0, 0.98, 1.0), V(0, 1.03, 0.75), V(0, 1.04, 0.55)], [0.05, 0.07, 0.07, 0.04], [0.04, 0.05, 0.05, 0.03], 1, seg=5)
# Beine (Fell) und Hufe (dunkel)
for xs in (X, -X):
    loft([V(xs, -0.6, 1.08), V(xs, -0.63, 0.58), V(xs, -0.61, 0.13)], [0.09, 0.05, 0.04], [0.11, 0.055, 0.045], 0, seg=8)
    loft([V(xs, -0.61, 0.13), V(xs, -0.65, 0.0)], [0.05, 0.055], [0.05, 0.06], 2, seg=6)
    loft([V(xs, 0.58, 1.08), V(xs, 0.74, 0.58), V(xs, 0.63, 0.13)], [0.11, 0.055, 0.04], [0.14, 0.06, 0.045], 0, seg=8)
    loft([V(xs, 0.63, 0.13), V(xs, 0.66, 0.0)], [0.05, 0.055], [0.05, 0.06], 2, seg=6)
bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
me = bpy.data.meshes.new("koerper_pferd"); bm.to_mesh(me); bm.free()
for p_ in me.polygons: p_.use_smooth = True
body = bpy.data.objects.new("koerper_pferd", me); sc.collection.objects.link(body)
def mat(name, rgb):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]; b.inputs["Base Color"].default_value = (*rgb, 1); b.inputs["Roughness"].default_value = 0.8
    return m
for m in (mat("fell", FELL), mat("maehne", (0.035, 0.022, 0.015)), mat("huf", (0.03, 0.03, 0.03))): me.materials.append(m)

# Gewichte: zwei nächste Knochenstrecken, gewichtet 1/d^4 (Hufe/Beine nur an Beinknochen, Rumpf nicht an Beinen unterhalb)
segs = {n: (Vector(h), Vector(t)) for n, h, t, p in KN}
for n in segs: body.vertex_groups.new(name=n)
def abst(p, a_, b_):
    ab = b_ - a_; t = max(0.0, min(1.0, (p - a_).dot(ab) / ab.length_squared)); return (p - (a_ + ab * t)).length
for v in me.vertices:
    p = v.co
    kand = []
    for n, (h, t) in segs.items():
        bein = "_ober" in n or "_unter" in n or "_huf" in n
        if bein and p.z > 1.08: continue
        if not bein and p.z < 0.75 and abs(p.x) > 0.06: continue
        if bein and (("_vl" in n or "_hl" in n) and p.x < -0.03 or ("_vr" in n or "_hr" in n) and p.x > 0.03): continue
        kand.append((abst(p, h, t), n))
    kand.sort(); kand = kand[:2]
    w = [1 / max(d, 0.02) ** 4 for d, _ in kand]; sw = sum(w)
    for (d, n), wi in zip(kand, w): body.vertex_groups[n].add([v.index], wi / sw, "REPLACE")
body.parent = arm; mod = body.modifiers.new("Armature", "ARMATURE"); mod.object = arm

# ---------- Gangarten ----------
arm.animation_data_create()
TEMPO = {}
BEIN = {"vl": "pf_vl", "vr": "pf_vr", "hl": "pf_hl", "hr": "pf_hr"}
def setz(n, rx=0.0, ry=0.0, rz=0.0):
    arm.pose.bones[n].rotation_euler = (math.radians(rx), math.radians(ry), math.radians(rz))
def hebe(dz):
    """Becken in Weltrichtung z verschieben (Pose-Ort liegt im Knochenraum)."""
    arm.pose.bones["pf_becken"].location = arm.data.bones["pf_becken"].matrix_local.to_3x3().inverted() @ Vector((0, 0, dz))
def nullen():
    for pb in arm.pose.bones: pb.rotation_euler = (0, 0, 0); pb.location = (0, 0, 0)
def taste(f):
    for pb in arm.pose.bones: pb.keyframe_insert("rotation_euler", frame=f)
    arm.pose.bones["pf_becken"].keyframe_insert("location", frame=f)
def neue(name):
    act = bpy.data.actions.new(name); act.use_fake_user = True; arm.animation_data.action = act; return act
def zyklus(name, laenge, phasen, amp_o, amp_u, bob, kopf, kopf_amp, tempo, nick=0.0):
    """phasen: je Bein Versatz 0..1; Oberschenkel schwingt sin, Unterschenkel beugt in der Schwungphase."""
    neue(name)
    for k in range(laenge + 1):
        t = k / laenge; nullen()
        for b, ph in phasen.items():
            w = 2 * math.pi * (t + ph)
            vorn = b[0] == "v"
            setz(BEIN[b] + "_ober", amp_o * math.sin(w))
            beug = amp_u * max(0.0, math.sin(w + math.pi / 2)) ** 1.5
            setz(BEIN[b] + "_unter", -beug if vorn else beug)
            setz(BEIN[b] + "_huf", (beug * 0.6) if vorn else -beug * 0.4)
        hebe(bob * math.sin(4 * math.pi * t))
        setz("pf_becken", nick * math.sin(2 * math.pi * t)); setz("pf_brust", -nick * 0.6 * math.sin(2 * math.pi * t))
        setz("pf_hals1", kopf + kopf_amp * math.sin(4 * math.pi * t)); setz("pf_kopf", -kopf * 0.4)
        setz("pf_schweif", 8 * math.sin(2 * math.pi * t), 0, 6 * math.sin(2 * math.pi * t + 1))
        taste(k + 1)
    TEMPO[name] = tempo
zyklus("schritt", 33, {"hl": 0.0, "vl": 0.25, "hr": 0.5, "vr": 0.75}, 16, 35, 0.015, 0, 4, 1.7)
zyklus("trab", 21, {"vl": 0.0, "hr": 0.0, "vr": 0.5, "hl": 0.5}, 24, 55, 0.035, -4, 3, 3.8)
zyklus("galopp", 15, {"hl": 0.0, "hr": 0.12, "vr": 0.38, "vl": 0.5}, 38, 70, 0.05, -6, 5, 8.0, nick=7)
zyklus("ansturm", 14, {"hl": 0.0, "hr": 0.12, "vr": 0.38, "vl": 0.5}, 42, 75, 0.055, 14, 4, 9.5, nick=8)
# Stehen: Atmen, Kopf und Schweif bewegen sich ruhig
neue("stehen")
for k in range(61):
    t = k / 60; nullen()
    setz("pf_hals1", 6 * math.sin(2 * math.pi * t)); setz("pf_kopf", 4 * math.sin(2 * math.pi * t + 1.2), 0, 5 * math.sin(2 * math.pi * t * 0.5))
    setz("pf_schweif", 6 * math.sin(4 * math.pi * t), 0, 12 * math.sin(2 * math.pi * t))
    hebe(0.008 * math.sin(2 * math.pi * t)); taste(k + 1)
# Steigen: Vorhand hoch, Vorderbeine angewinkelt
neue("steigen")
for k, (f, p) in enumerate([(1, 0), (12, 1), (26, 1), (40, 0)]):
    nullen(); setz("pf_becken", -32 * p); setz("pf_hals1", -15 * p); setz("pf_kopf", 10 * p)
    for s in "lr": setz("pf_v%s_ober" % s, 55 * p); setz("pf_v%s_unter" % s, -95 * p); setz("pf_h%s_ober" % s, 25 * p)
    hebe(0.04 * p); taste(f)
# Treffer: kurzes Zusammenzucken, Kopf hoch
neue("treffer")
for f, p in [(1, 0), (4, 1), (14, 0)]:
    nullen(); setz("pf_hals1", -18 * p); setz("pf_kopf", 12 * p); setz("pf_becken", -5 * p)
    for s in "lr": setz("pf_v%s_ober" % s, 10 * p)
    taste(f)
# Sterben: knickt ein und fällt auf die Seite
neue("sterben")
for f, p, q in [(1, 0, 0), (10, 1, 0), (22, 1, 0.6), (40, 1, 1)]:
    nullen()
    for s in "lr":
        setz("pf_v%s_ober" % s, -20 * p); setz("pf_v%s_unter" % s, -60 * p); setz("pf_h%s_ober" % s, 30 * p); setz("pf_h%s_unter" % s, 50 * p)
    setz("pf_becken", 0, 85 * q, 0); setz("pf_hals1", 10 * p); setz("pf_kopf", 25 * q)
    hebe(-0.5 * p - 0.38 * q); taste(f)
print("CLIPS", [x.name for x in bpy.data.actions])

# ---------- Vorschau ----------
def nimm(name):
    act = bpy.data.actions[name]; arm.animation_data.action = act
    if getattr(act, "slots", None) and len(act.slots): arm.animation_data.action_slot = act.slots[0]
if VORSCHAU:
    cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam")); sc.collection.objects.link(cam); sc.camera = cam; cam.data.lens = 40
    cam.location = (-3.6, -2.2, 1.4); cam.rotation_euler = (math.radians(84), 0, math.radians(-58))
    sun = bpy.data.objects.new("sun", bpy.data.lights.new("sun", "SUN")); sc.collection.objects.link(sun)
    sun.rotation_euler = (math.radians(45), 0, math.radians(-20)); sun.data.energy = 3.5
    bpy.ops.mesh.primitive_plane_add(size=40)
    sc.world = bpy.data.worlds.new("w"); sc.world.use_nodes = True; sc.world.node_tree.nodes["Background"].inputs[0].default_value = (0.55, 0.57, 0.6, 1)
    sc.render.engine = "BLENDER_EEVEE"; sc.render.resolution_x, sc.render.resolution_y = 560, 420
    for i, (c, f) in enumerate([("stehen", 1), ("schritt", 9), ("trab", 6), ("galopp", 5), ("steigen", 18), ("sterben", 40)]):
        nimm(c); sc.frame_set(f); sc.render.filepath = VORSCHAU.replace(".png", "_%d.png" % i); bpy.ops.render.render(write_still=True)

# ---------- Export ----------
nimm("stehen"); sc.frame_set(1)
bpy.ops.object.select_all(action="DESELECT")
for o in (arm, body): o.select_set(True)
bpy.context.view_layer.objects.active = arm
bpy.ops.export_scene.gltf(filepath=OUT, export_format="GLB", use_selection=True, export_animation_mode="ACTIONS", export_apply=True, export_morph=False, export_skins=True)
json.dump({"tempo": TEMPO, "variante": "a"}, open(OUT + ".clips.json", "w"))
print("EXPORT", OUT, os.path.getsize(OUT) // 1024, "KB", "Dreiecke", sum(len(p.vertices) - 2 for p in me.polygons))
