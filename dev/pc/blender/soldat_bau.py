# Baut einen kompletten Soldaten eines Antike-Kits aus eigenen Teilen und exportiert ihn als .glb.
# Körper: MPFB (CC0), Skelett cmu_mb; Bewegungen: CMU (ASF/AMC) + Schlag/Stoß/Schild per Skript; Teile: TRELLIS roh_44/45.
# Aufruf (PC): blender.exe -b -P soldat_bau.py -- <kit> <ausgabe.glb> [vorschau.png]   kit: siehe KITS
import bpy, os, sys, math
import numpy as np
from mathutils import Matrix, Vector
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cmu_lib
import teile_form as TF
from bl_ext.user_default.mpfb.services import HumanService, LocationService, TargetService

a = sys.argv[sys.argv.index("--") + 1:]
KIT_NAME, _, VARIANTE = a[0].partition(":"); VARIANTE = VARIANTE or "a"; OUT = a[1]; VORSCHAU = a[2] if len(a) > 2 else None
BASE = r"C:\Users\anmel\Desktop\imperium-bilder"
CMU = os.path.join(BASE, "blender", "cmu")
FPS = 30

# Kits: Farben linear (Blender), Teile aus 3d/roh_44|45, Größen in Metern.
# Quellen: dev/schlacht/profile_truppen.json, dev/docs/schlacht_umsetzung.md 5.4
KITS = {
    "A1_hastatus": dict(tunika=(0.42, 0.06, 0.04), haut="young_caucasian_male", muskel=0.65, rock=0.12,
                        helm="montefortino", brust=True,
                        schild=dict(w=0.65, h=1.1, farbe=(0.42, 0.06, 0.04), mittel=(0.2, 0.1, 0.04), zylinder=0.12, eckig=3.0),
                        waffe=("schwert", "gladius")),
    "A2_libysch": dict(tunika=(0.55, 0.48, 0.34), haut="young_caucasian_male2", muskel=0.6, rock=0.1,
                       helm="pilos", brust=False,
                       schild=dict(w=0.85, h=0.85, farbe=(0.5, 0.22, 0.05), woelbung=0.03),
                       waffe=("speer", 2.4)),
    "A3_iberisch": dict(tunika=(0.66, 0.63, 0.55), haut="young_caucasian_male", muskel=0.6, rock=0.1,
                        helm="sehnen", brust=False,
                        schild=dict(w=0.6, h=1.05, farbe=(0.62, 0.6, 0.52), mittel=(0.3, 0.06, 0.05)),
                        waffe=("schwert", "falcata")),
    "A6_keltisch": dict(tunika=(0.1, 0.22, 0.08), hose=(0.28, 0.16, 0.05), haut="young_caucasian_male2", muskel=0.75,
                        rock=0.05, helm="haar", haar_tief=0.86, brust=False,
                        schild=dict(w=0.55, h=1.1, farbe=(0.08, 0.2, 0.08), mittel=(0.3, 0.19, 0.08)),
                        waffe=("schwert", "lang")),
    "A7_hellenistisch": dict(tunika=(0.62, 0.58, 0.45), haut="young_caucasian_male", muskel=0.6, rock=0.12,
                             helm="thraker", brust=False,
                             schild=dict(w=0.6, h=0.95, farbe=(0.6, 0.55, 0.42), mittel=(0.3, 0.19, 0.08)),
                             waffe=("speer", 2.4)),
}
KIT = dict(KITS[KIT_NAME])
# Körpervarianten (P1): a = Grundform, b = leicht/jung, c = schwer/älter; Hautton und Tunika-Farbton leicht verschoben
# Körpergröße: MPFB height 0,5 ≈ 1,66 m, 0,62 ≈ 1,88 m (gemessen). Ziel antik: 1,64 / 1,70 / 1,74 m
VAR = {"a": dict(muskel=0.0, gewicht=0.5, groesse=0.52, haut=None, ton=1.0),
       "b": dict(muskel=-0.15, gewicht=0.4, groesse=0.49, haut="young_caucasian_male2", ton=0.9),
       "c": dict(muskel=0.15, gewicht=0.64, groesse=0.54, haut="middleage_caucasian_male", ton=1.08)}[VARIANTE]
if VAR["haut"] and KIT["haut"] != VAR["haut"]: KIT["haut"] = VAR["haut"]
elif VAR["haut"]: KIT["haut"] = "young_caucasian_male"
KIT["tunika"] = tuple(min(1.0, c * VAR["ton"]) for c in KIT["tunika"])
TEMPO = {}
KURZ = KIT_NAME.split("_")[0]

# ---------- Körper ----------
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene; sc.render.fps = FPS
data = LocationService.get_user_data()
macro = TargetService.get_default_macro_info_dict()
macro.update({"gender": 1.0, "age": 0.5 if VARIANTE != "c" else 0.62, "muscle": max(0.0, min(1.0, KIT["muskel"] + VAR["muskel"])),
              "weight": VAR["gewicht"], "height": VAR["groesse"]})
basemesh = HumanService.create_human(scale=0.1, macro_detail_dict=macro)
arm = HumanService.add_builtin_rig(basemesh, "cmu_mb", import_weights=True)
arm.name = "sk_mensch"
body = HumanService.add_mhclo_asset(os.path.join(data, "proxymeshes", "proxy741", "proxy741.proxy"), basemesh,
                                    asset_type="Proxymeshes", subdiv_levels=0)
body.name = "koerper"
HumanService.set_character_skin(os.path.join(data, "skins", KIT["haut"], KIT["haut"] + ".mhmat"),
                                basemesh, bodyproxy=body, skin_type="GAMEENGINE")
basemesh.hide_render = True; basemesh.hide_set(True)
bpy.context.view_layer.update()

# Tunika: Flächen, deren Hauptgewicht auf Rumpf/Oberarm/Oberschenkel liegt
TUNIKA_GR = {"Hips", "LowerBack", "Spine", "Spine1", "LHipJoint", "RHipJoint", "LeftShoulder", "RightShoulder",
             "LeftArm", "RightArm", "LeftUpLeg", "RightUpLeg"}
tun = bpy.data.materials.new("tunika_rot"); tun.use_nodes = True
tun.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (*KIT["tunika"], 1)
tun.node_tree.nodes["Principled BSDF"].inputs["Roughness"].default_value = 0.9
body.data.materials.append(tun); ti = len(body.data.materials) - 1
gname = {g.index: g.name for g in body.vertex_groups}
haupt = []
for v in body.data.vertices:
    best = max(v.groups, key=lambda g: g.weight, default=None)
    haupt.append(gname.get(best.group) if best else None)
zs = [v.co.z for v in body.data.vertices]; hmax = max(zs)
for p in body.data.polygons:
    vs = p.vertices
    if sum(1 for i in vs if haupt[i] in TUNIKA_GR) >= len(vs) / 2:
        # Oberschenkel nur bis knapp über das Knie
        if all(body.data.vertices[i].co.z > 0.47 * hmax for i in vs):
            p.material_index = ti

# Sandalen (Füße) und Haare (Oberkopf/Hinterkopf)
def mat(name, rgb, metall=0.0, rau=0.85):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*rgb, 1); b.inputs["Metallic"].default_value = metall
    b.inputs["Roughness"].default_value = rau
    return m
body.data.materials.append(mat("sandale", (0.16, 0.08, 0.035))); si_ = len(body.data.materials) - 1
body.data.materials.append(mat("haar", (0.035, 0.022, 0.015))); hi_ = len(body.data.materials) - 1
if KIT.get("hose"):
    body.data.materials.append(mat("hose", KIT["hose"])); ho_ = len(body.data.materials) - 1
HAAR_Z = KIT.get("haar_tief", 0.935)
BEIN = {"LeftUpLeg", "RightUpLeg", "LeftLeg", "RightLeg"}
FUSS = {"LeftFoot", "LeftToeBase", "RightFoot", "RightToeBase"}
kopfv = [i for i, g in enumerate(haupt) if g in ("Head", "Neck1")]
kopf_y = sum(body.data.vertices[i].co.y for i in kopfv) / max(1, len(kopfv))
for p in body.data.polygons:
    vs = p.vertices
    if sum(1 for i in vs if haupt[i] in FUSS) >= len(vs) / 2:
        p.material_index = si_
    elif KIT.get("hose") and p.material_index != ti and sum(1 for i in vs if haupt[i] in BEIN) >= len(vs) / 2:
        p.material_index = ho_
    elif all(haupt[i] in ("Head",) for i in vs) and all(body.data.vertices[i].co.z > HAAR_Z * hmax and body.data.vertices[i].co.y > kopf_y - 0.004 * hmax for i in vs):
        p.material_index = hi_

# Tunika-Rock (eigenes Mesh, am Skelett gewichtet) und Gürtel
def bone_obj(n, kopf=True):
    b = arm.data.bones[n]
    return arm.matrix_world @ (b.head_local if kopf else b.tail_local)
BV = [body.matrix_world @ v.co for v in body.data.vertices]
RUMPF_BEIN = {"Hips", "LowerBack", "Spine", "LHipJoint", "RHipJoint", "LeftUpLeg", "RightUpLeg", "LeftLeg", "RightLeg"}
BVR = [v for v, g in zip(BV, haupt) if g in RUMPF_BEIN]   # ohne Arme/Hände, die in Ruhepose auf Hüfthöhe hängen
def quer(z, dz=0.05):
    pts = [v for v in BVR if abs(v.z - z) < dz]
    while len(pts) < 6: dz *= 1.5; pts = [v for v in BVR if abs(v.z - z) < dz]
    xs = [p.x for p in pts]; ys = [p.y for p in pts]
    return (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2, (max(xs) - min(xs)) / 2, (max(ys) - min(ys)) / 2
z_bund = bone_obj("Hips").z + 0.06
z_saum = bone_obj("LeftLeg").z + 0.08 + KIT.get("rock", 0.1)
import bmesh as _bm
rock = None
if KIT.get("rock"):
    bmr = _bm.new(); dl = bmr.verts.layers.deform.verify()
    gi = {n: body.vertex_groups[n].index for n in ("Hips", "LeftUpLeg", "RightUpLeg") if n in body.vertex_groups}
    li = {n: i for i, n in enumerate(gi)}
    SEG = 12; ringe = []
    for k, (z, plus) in enumerate(((z_bund, 0.012), ((z_bund + z_saum) / 2, 0.03), (z_saum, 0.055))):
        cx, cy, rx, ry = quer(z)
        if k > 0: _, _, rx0, ry0 = quer(z_bund); rx = max(rx, rx0 * 0.95); ry = max(ry, ry0)
        ring = []
        for i in range(SEG):
            a = 2 * math.pi * i / SEG
            v = bmr.verts.new((cx + (rx + plus) * math.cos(a), cy + (ry + plus) * math.sin(a), z))
            bein = "LeftUpLeg" if math.cos(a) > 0 else "RightUpLeg"
            wb = (0.0, 0.45, 0.7)[k] * min(1.0, abs(math.cos(a)) * 1.6)
            v[dl][li["Hips"]] = 1.0 - wb
            if wb > 0: v[dl][li[bein]] = wb
            ring.append(v)
        ringe.append(ring)
    for k in range(2):
        for i in range(SEG):
            j = (i + 1) % SEG
            bmr.faces.new((ringe[k][i], ringe[k][j], ringe[k + 1][j], ringe[k + 1][i]))
    _bm.ops.recalc_face_normals(bmr, faces=bmr.faces)
    me = bpy.data.meshes.new("kleidung_rock"); bmr.to_mesh(me); bmr.free()
    rock = bpy.data.objects.new("kleidung_rock", me); bpy.context.collection.objects.link(rock)
    for n in gi: rock.vertex_groups.new(name=n)
    rock.parent = arm; rock.matrix_parent_inverse = arm.matrix_world.inverted()
    mod = rock.modifiers.new("Armature", "ARMATURE"); mod.object = arm
    rock.data.materials.append(tun)
# Gürtel: schmales Band am Bund
guert = mat("guertel", (0.12, 0.06, 0.025))
body.data.materials.append(guert); gu_ = len(body.data.materials) - 1
for p in body.data.polygons:
    zz = [BV[i].z for i in p.vertices]
    if min(zz) > z_bund - 0.06 and max(zz) < z_bund + 0.005 and p.material_index == ti: p.material_index = gu_

# ---------- Pose-Werkzeug ----------
for pb in arm.pose.bones:
    pb.rotation_mode = "QUATERNION"
mw = arm.matrix_world.to_3x3(); mwi = mw.inverted()
TREST = {pb.name: mw @ pb.bone.matrix_local.to_3x3() for pb in arm.pose.bones}
TDIR = {pb.name: (mw @ (pb.bone.tail_local - pb.bone.head_local)).normalized() for pb in arm.pose.bones}
ORDER = []
def _walk(b):
    ORDER.append(b.name)
    for c in b.children: _walk(c)
_walk(arm.pose.bones["Hips"].bone)

def ruhe():
    for pb in arm.pose.bones:
        pb.matrix_basis = Matrix.Identity(4)
    bpy.context.view_layer.update()

def richte(richt):
    for n in ORDER:
        if n not in richt: continue
        pb = arm.pose.bones[n]
        R = TDIR[n].rotation_difference(Vector(richt[n]).normalized()).to_matrix() @ TREST[n]
        pb.matrix = Matrix.Translation(pb.matrix.to_translation()) @ (mwi @ R).to_4x4()
        bpy.context.view_layer.update()

def haltung(richt, huefte=0.0):
    """richt: Knochen -> Weltrichtung (Körper blickt nach -Y). Eltern zuerst."""
    ruhe()
    if huefte:
        arm.pose.bones["Hips"].location = (0, huefte, 0) if False else arm.pose.bones["Hips"].location
        arm.pose.bones["Hips"].matrix = Matrix.Translation(Vector((0, 0, huefte))) @ arm.pose.bones["Hips"].matrix
    for n in ORDER:
        if n not in richt: continue
        pb = arm.pose.bones[n]
        R = TDIR[n].rotation_difference(Vector(richt[n]).normalized()).to_matrix() @ TREST[n]
        pb.matrix = Matrix.Translation(pb.matrix.to_translation()) @ (mwi @ R).to_4x4()
        bpy.context.view_layer.update()

def taste(f):
    for pb in arm.pose.bones:
        pb.keyframe_insert("rotation_quaternion", frame=f)
    arm.pose.bones["Hips"].keyframe_insert("location", frame=f)

BEINE = {"LeftUpLeg": (0.06, -0.22, -0.97), "LeftLeg": (0, 0.06, -1), "RightUpLeg": (-0.06, 0.2, -0.98),
         "RightLeg": (0, 0.16, -0.99)}
BEREIT = dict(BEINE, **{"LeftArm": (0.18, -0.3, -0.93), "LeftForeArm": (-0.2, -0.97, 0.06),
                        "RightArm": (-0.06, 0.22, -0.97), "RightForeArm": (0.04, -0.97, 0.12)})
STOSS = dict(BEREIT, **{"RightArm": (-0.04, -0.6, -0.8), "RightForeArm": (0.02, -1, 0.1), "Spine1": (0, -0.12, 0.99)})
AUSHOLEN = dict(BEREIT, **{"RightArm": (-0.08, 0.45, -0.89), "RightForeArm": (0.05, -0.8, 0.3)})
SPEER = dict(BEREIT, **{"RightArm": (-0.03, -0.8, -0.55), "RightForeArm": (0, -1, 0.3)})
SCHILD_VOR = dict(BEREIT, **{"LeftArm": (0.12, -0.65, -0.75), "LeftForeArm": (-0.25, -0.96, 0.15),
                             "Spine1": (0, -0.1, 0.99)})
HIEB_OBEN = dict(BEREIT, **{"RightArm": (-0.1, -0.25, 0.96), "RightForeArm": (0, -0.55, 0.83)})
HIEB_UNTEN = dict(BEREIT, **{"RightArm": (-0.05, -0.75, -0.66), "RightForeArm": (0, -0.75, -0.66)})
TRAGEN = {"LeftArm": BEREIT["LeftArm"], "LeftForeArm": BEREIT["LeftForeArm"], "RightArm": (0.02, 0.1, -0.99),
          "RightForeArm": (0.05, -0.6, -0.8)}
TRAGEN_SPEER = dict(TRAGEN, RightArm=(0.03, 0.05, -1), RightForeArm=(0.02, -0.3, 0.95))
# Zweikampf (30.10.): geduckte Kampfhaltung, seitlicher Hieb, Schildstoß, Ausweichen, Parade
KNIE = {"LeftUpLeg": (0.08, -0.35, -0.93), "LeftLeg": (0, 0.2, -0.98), "RightUpLeg": (-0.08, 0.3, -0.95), "RightLeg": (0, 0.3, -0.95)}
KAMPF = dict(BEREIT, **KNIE, **{"Spine": (0, -0.12, 0.99), "LeftArm": (0.15, -0.4, -0.9)})
KAMPF_B = dict(KAMPF, Spine=(0.03, -0.16, 0.99), RightForeArm=(0.08, -0.95, 0.2))
SEITE_AUS = dict(KAMPF, RightArm=(-0.85, 0.15, -0.5), RightForeArm=(-0.55, -0.45, 0.7), Spine1=(-0.1, 0.05, 0.99))
SEITE_END = dict(KAMPF, RightArm=(0.25, -0.88, -0.4), RightForeArm=(0.65, -0.72, -0.1), Spine1=(0.12, -0.12, 0.98))
SCHILD_STOSS = dict(KAMPF, Spine=(0, -0.3, 0.95), LeftArm=(0.05, -0.88, -0.47), LeftForeArm=(-0.15, -0.97, 0.18))
RUECK = dict(BEREIT, LeftUpLeg=(0.06, 0.15, -0.99), RightUpLeg=(-0.06, 0.35, -0.94), RightLeg=(0, 0.1, -1), Spine=(0, 0.15, 0.99),
             LeftArm=(0.12, -0.55, -0.75), LeftForeArm=(-0.25, -0.95, 0.2))
PARADE = dict(KAMPF, LeftArm=(0.1, -0.75, -0.3), LeftForeArm=(-0.3, -0.9, 0.3), Head=(0, -0.05, 1))
TREFFER = dict(BEREIT, **{"Spine": (0, 0.2, 0.98), "Spine1": (0, 0.3, 0.95), "Head": (0, 0.35, 0.94)})

def clip_haltung(name, keys):
    """keys: Liste (bild, haltung) – lineare Übergänge zwischen gesetzten Haltungen."""
    act = bpy.data.actions.new(name); act.use_fake_user = True
    arm.animation_data.action = act
    for k in keys:
        f, h = k[0], k[1]
        haltung(h, k[2] if len(k) > 2 else 0.0); taste(f)
    return act

def zyklus(auf, i0, i1):
    """Einen ganzen Schrittzyklus finden: zwei aufeinanderfolgende Aufsätze des linken Fußes (Tiefpunkte der Fußhöhe)."""
    h = [auf.punkte(i)[0]["lfoot"].y for i in range(i0, i1)]
    lo, hi_ = min(h), max(h); grenze = lo + 0.35 * (hi_ - lo)
    tiefe = [k for k in range(6, len(h) - 6) if h[k] <= min(h[k - 6:k + 7]) and h[k] < grenze]
    for a_, b_ in zip(tiefe, tiefe[1:]):
        if 45 <= b_ - a_ <= 220: return i0 + a_, i0 + b_
    return None

def clip_cmu(name, subj, trial, von=0.0, bis=1.0, dauer=None, am_platz=True, arme=None, schleife=False):
    auf = cmu_lib.Aufnahme(os.path.join(CMU, subj, subj + ".asf"), os.path.join(CMU, subj, "%s_%s.amc" % (subj, trial)))
    n = len(auf.frames); i0, i1 = int(n * von), int(n * bis) - 1
    if schleife:
        z = zyklus(auf, i0, i1)
        if z:
            i0, i1 = z; dauer = max(8, round((i1 - i0) / 4)) + 1   # letztes Bild = erstes (backen lässt es bei Schleifen weg)
            p0, p1 = auf.welt(auf.frames[i0])[1], auf.welt(auf.frames[i1])[1]
            TEMPO[name] = round(math.hypot(p1.x - p0.x, p1.z - p0.z) / ((i1 - i0) / 120.0), 2)
        if not z: i0 = int(n * 0.3); i1 = min(n - 1, i0 + 90); dauer = 23   # Rückfall: festes Fenster wie bisher
        print("ZYKLUS", name, z, TEMPO.get(name))
    act = bpy.data.actions.new(name); act.use_fake_user = True
    arm.animation_data.action = act
    ruhe()
    ue = cmu_lib.Uebertrag(arm, auf)
    ue.start = auf.welt(auf.frames[i0])[1]
    nb = dauer or max(2, int((i1 - i0) / 4))   # CMU 120 B/s -> 30 B/s
    for k in range(nb):
        i = i0 + round(k * (i1 - i0) / (nb - 1))
        ue.setze(i, bodenlage=not am_platz)
        if arme: richte(arme)
        taste(k + 1)
    return act

arm.animation_data_create()

def nimm(name):
    act = bpy.data.actions[name]
    arm.animation_data.action = act
    if getattr(act, "slots", None) and len(act.slots):
        arm.animation_data.action_slot = act.slots[0]
    return act

# ---------- Teile ----------
def pca(o):
    me = o.data
    P = np.array([(o.matrix_world @ v.co)[:] for v in me.vertices])
    c = P.mean(0); U, S, Vt = np.linalg.svd(P - c, full_matrices=False)
    return P, Vector(c), [Vector(v) for v in Vt]   # Achsen groß -> klein

def staender_weg(o, anteil):
    import bmesh
    bm = bmesh.new(); bm.from_mesh(o.data)
    z = [v.co.z for v in bm.verts]; zc = min(z) + anteil * (max(z) - min(z))
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < zc], context="VERTS")
    bm.to_mesh(o.data); bm.free()

def lade(datei, name, ziel_dreiecke, staender=False):
    vor = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=os.path.join(BASE, "3d", datei))
    neu = [o for o in bpy.data.objects if o not in vor]
    o = [x for x in neu if x.type == "MESH"][0]
    m = o.matrix_world.copy(); o.parent = None; o.matrix_world = m
    for x in neu:
        if x is not o: bpy.data.objects.remove(x)
    bpy.context.view_layer.objects.active = o; o.select_set(True)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    if staender: staender_weg(o, staender)
    n = sum(len(p.vertices) - 2 for p in o.data.polygons)
    d = o.modifiers.new("dez", "DECIMATE"); d.ratio = min(1.0, ziel_dreiecke / max(n, 1))
    bpy.ops.object.modifier_apply(modifier="dez")
    o.select_set(False); o.name = name
    return o

def setze_teil(o, achsen_ziel, mitte_ziel, groesse, knochen, achse_groesse=0, buckel=False):
    """achsen_ziel: Zielrichtungen für PCA-Achse 0 und 2 (Welt). Skaliert auf groesse entlang Achse achse_groesse."""
    P, c, ax = pca(o)
    a0, a2 = ax[0], ax[2]
    if achsen_ziel[0] is not None and a0.dot(achsen_ziel[0]) < 0: a0 = -a0
    if achsen_ziel[1] is not None and a2.dot(achsen_ziel[1]) < 0: a2 = -a2
    if buckel:
        pr = (P - np.array(c[:])) @ np.array(a2[:])
        if -pr.min() > pr.max(): a2 = -a2
    src = Matrix((a0, a0.cross(a2).normalized().cross(a0), a0.cross(a0.cross(a2).normalized()))).transposed()
    src = Matrix((a0, (a2.cross(a0)).normalized(), a2)).transposed()
    t0 = Vector(achsen_ziel[0]).normalized(); t2 = Vector(achsen_ziel[1]).normalized()
    t2 = (t2 - t0 * t2.dot(t0)).normalized()
    dst = Matrix((t0, t2.cross(t0).normalized(), t2)).transposed()
    R = dst @ src.inverted()
    ext = (P - np.array(c[:])) @ np.array(ax[achse_groesse][:])
    s = groesse / (ext.max() - ext.min())
    o.matrix_world = Matrix.Translation(mitte_ziel) @ (R.to_4x4() * 1.0) @ Matrix.Scale(s, 4) @ Matrix.Translation(-c) @ o.matrix_world
    mwk = o.matrix_world.copy()
    o.parent = arm; o.parent_type = "BONE"; o.parent_bone = knochen
    bpy.context.view_layer.update()
    o.matrix_world = mwk
    return o

def kp(n, wo=0.5):  # Weltpunkt auf Knochen (gepost)
    pb = arm.pose.bones[n]
    return arm.matrix_world @ (pb.head + (pb.tail - pb.head) * wo)

haltung(BEREIT)
koerper_P = np.array([(body.matrix_world @ v.co)[:] for v in body.evaluated_get(bpy.context.evaluated_depsgraph_get()).to_mesh().vertices])
kopf_oben = koerper_P[:, 2].max()

teile = []
if KIT["helm"]:
    helm, hr = TF.helm(KIT["helm"], "teil_helm_%s_%s" % (KURZ, KIT["helm"]))
    kopf = kp("Head", 0.5)
    helm.matrix_world = Matrix.Translation((kopf.x, kopf.y + 0.005, kopf_oben - hr * 1.06 + (0.045 if KIT["helm"] == "pilos" else 0.08 if KIT["helm"] == "haar" else 0.045)))
    bpy.context.view_layer.update()
    m = helm.matrix_world.copy(); helm.parent = arm; helm.parent_type = "BONE"; helm.parent_bone = "Head"
    bpy.context.view_layer.update(); helm.matrix_world = m
    teile.append(helm)

# Pectorale: flache viereckige Bronzeplatte (etwa 20 x 20 cm, Funde 3. Jh. v. Chr.) – 12 Dreiecke
s1 = kp("Spine1", 0.5)
if KIT["brust"]:
    bpy.ops.mesh.primitive_cube_add(size=1)
    brust = bpy.context.active_object; brust.name = "teil_ruest_%s_pectorale" % KURZ
    brust.scale = (0.2, 0.012, 0.2); bpy.ops.object.transform_apply(scale=True)
    vorne = koerper_P[(np.abs(koerper_P[:, 2] - s1.z) < 0.06) & (np.abs(koerper_P[:, 0]) < 0.06)][:, 1].min()
    brust.location = (0, vorne - 0.008, s1.z); bpy.context.view_layer.update()
    m = brust.matrix_world.copy(); brust.parent = arm; brust.parent_type = "BONE"; brust.parent_bone = "Spine1"
    bpy.context.view_layer.update(); brust.matrix_world = m
    brust.data.materials.clear(); brust.data.materials.append(mat("bronze_platte", (0.43, 0.27, 0.09), metall=0.8, rau=0.45))
    teile.append(brust)

sk = KIT["schild"]
schild = TF.schild(sk["w"], sk["h"], "teil_schild_%s_%s" % (KURZ, KIT_NAME.split("_")[1]), sk["farbe"], mittel=sk.get("mittel"),
                   woelbung=sk.get("woelbung", 0.0), zylinder=sk.get("zylinder", 0.0), eckig=sk.get("eckig", 2.0))
hand_l = kp("LeftHand", 0.5)
schild.matrix_world = Matrix.Translation(hand_l + Vector((0.0, -0.05, 0.04)))
bpy.context.view_layer.update()
m = schild.matrix_world.copy(); schild.parent = arm; schild.parent_type = "BONE"; schild.parent_bone = "LeftHand"
bpy.context.view_layer.update(); schild.matrix_world = m
teile.append(schild)

hand_r = kp("RightHand", 0.6)
ziel = Vector((0.02, -1, 0.15)).normalized()
if KIT["waffe"][0] == "schwert":
    waffe = TF.schwert(KIT["waffe"][1], "teil_schwert_%s_%s" % (KURZ, KIT["waffe"][1]))
    R = Vector((0, 0, 1)).rotation_difference(ziel).to_matrix().to_4x4()
    waffe.matrix_world = Matrix.Translation(hand_r) @ R
else:
    wlang = KIT["waffe"][1]
    # Stoßspeer: Eschenschaft (3 cm) + Eisenspitze 25 cm, etwa 40 Dreiecke
    bpy.ops.mesh.primitive_cylinder_add(vertices=6, radius=0.015, depth=wlang - 0.25, location=(0, 0, (wlang - 0.25) / 2))
    schaft = bpy.context.active_object; schaft.data.materials.append(mat("esche", (0.3, 0.19, 0.08)))
    bpy.ops.mesh.primitive_cone_add(vertices=6, radius1=0.028, depth=0.25, location=(0, 0, wlang - 0.125))
    spitze = bpy.context.active_object; spitze.data.materials.append(mat("eisen", (0.25, 0.25, 0.26), metall=0.9, rau=0.4))
    bpy.ops.object.select_all(action="DESELECT"); schaft.select_set(True); spitze.select_set(True)
    bpy.context.view_layer.objects.active = schaft; bpy.ops.object.join()
    waffe = schaft; waffe.name = "teil_speer_%s_stoss" % KURZ
    R = Vector((0, 0, 1)).rotation_difference(ziel).to_matrix().to_4x4()
    waffe.matrix_world = Matrix.Translation(hand_r) @ R @ Matrix.Translation((0, 0, -0.4 * wlang))
bpy.context.view_layer.update()
m = waffe.matrix_world.copy(); waffe.parent = arm; waffe.parent_type = "BONE"; waffe.parent_bone = "RightHand"
bpy.context.view_layer.update(); waffe.matrix_world = m
teile.append(waffe)

# Körper dezimieren (Nahstufe ≤ 1500 inkl. Teile)
d = body.modifiers.new("dez", "DECIMATE"); d.ratio = 0.62
while body.modifiers[0].name != "dez":
    bpy.ops.object.modifier_move_up({"object": body}, modifier="dez") if False else body.modifiers.move(len(body.modifiers) - 1, 0)

# ---------- Clips ----------
ruhe()
if KIT["waffe"][0] == "speer": TRAGEN = TRAGEN_SPEER
clip_cmu("stehen", "140", "06", 0.2, 0.6, dauer=60, arme=TRAGEN)
clip_cmu("gehen", "02", "01", 0.1, 0.9, arme=TRAGEN, schleife=True)
clip_cmu("laufen", "02", "03", 0.15, 0.95, arme=TRAGEN, schleife=True)
clip_cmu("fliehen", "02", "03", 0.15, 0.95, arme=TRAGEN, schleife=True)
clip_cmu("gehen_b", "143", "32", 0.15, 0.85, arme=TRAGEN, schleife=True)
clip_cmu("laufen_b", "143", "01", 0.15, 0.85, arme=TRAGEN, schleife=True)
clip_cmu("stehen_b", "140", "07", 0.2, 0.6, dauer=60, arme=TRAGEN)
clip_haltung("stehen_bereit", [(1, BEREIT), (30, dict(BEREIT, Spine1=(0, -0.05, 1))), (60, BEREIT)])
clip_haltung("schlag_a", [(1, BEREIT), (7, AUSHOLEN), (12, STOSS), (16, STOSS), (24, BEREIT)])
clip_haltung("schlag_b", [(1, BEREIT), (9, HIEB_OBEN), (14, HIEB_UNTEN), (24, BEREIT)])
clip_haltung("stoss_speer", [(1, BEREIT), (7, AUSHOLEN), (12, SPEER), (16, SPEER), (24, BEREIT)])
clip_haltung("abwehr_schild", [(1, BEREIT), (6, SCHILD_VOR), (14, SCHILD_VOR), (20, BEREIT)])
clip_haltung("treffer", [(1, BEREIT), (5, TREFFER), (14, BEREIT)])
clip_haltung("kampf_bereit", [(1, KAMPF), (20, KAMPF_B), (40, KAMPF)])
clip_haltung("schlag_c", [(1, KAMPF), (8, SEITE_AUS), (13, SEITE_END), (16, SEITE_END), (24, KAMPF)])
clip_haltung("schild_stoss", [(1, KAMPF), (5, SCHILD_VOR), (9, SCHILD_STOSS), (12, SCHILD_STOSS), (20, KAMPF)])
clip_haltung("ausweichen", [(1, KAMPF), (7, RUECK), (12, RUECK), (20, KAMPF)])
clip_haltung("parade", [(1, KAMPF), (4, PARADE), (10, PARADE), (16, KAMPF)])
# P1: Varianten im Tempo und weitere Kampfbewegungen
clip_haltung("schlag_a_b", [(1, BEREIT), (5, AUSHOLEN), (9, STOSS), (12, STOSS), (19, BEREIT)])
clip_haltung("schlag_b_b", [(1, BEREIT), (11, HIEB_OBEN), (17, HIEB_UNTEN), (28, BEREIT)])
VOR_BEIN = {"LeftUpLeg": (0.08, -0.55, -0.83), "LeftLeg": (0, 0.05, -1), "RightUpLeg": (-0.06, 0.4, -0.92), "RightLeg": (0, 0.2, -0.98)}
clip_haltung("nachsetzen", [(1, KAMPF), (6, dict(AUSHOLEN, **KNIE)), (11, dict(STOSS, **VOR_BEIN)), (15, dict(STOSS, **VOR_BEIN)), (24, KAMPF)])
STOLPER = dict(TREFFER, Spine=(0, 0.35, 0.94), RightUpLeg=(-0.06, 0.45, -0.89), LeftArm=(0.5, -0.1, -0.85))
clip_haltung("stolpern", [(1, BEREIT), (4, TREFFER), (9, STOLPER), (20, BEREIT)])
KNIEN = dict(TREFFER, LeftUpLeg=(0.08, -0.15, -0.99), LeftLeg=(0, 0.97, -0.2), RightUpLeg=(-0.08, -0.1, -0.99), RightLeg=(0, 0.97, -0.25))
clip_haltung("sterben_knie", [(1, BEREIT), (5, TREFFER), (14, KNIEN, -0.42), (26, dict(KNIEN, Spine=(0, -0.55, 0.83), Spine1=(0, -0.7, 0.7), Head=(0, -0.8, 0.6)), -0.46), (40, dict(KNIEN, Spine=(0, -0.75, 0.66), Spine1=(0, -0.85, 0.5), Head=(0, -0.9, 0.4), LeftArm=(0.2, -0.3, -0.93), RightArm=(-0.2, -0.3, -0.93)), -0.5)])
SCHILD_HOCH = dict(KAMPF, LeftArm=(0.12, -0.3, 0.94), LeftForeArm=(-0.45, -0.45, 0.77), Spine=(0, -0.05, 1))
clip_haltung("schild_hoch", [(1, KAMPF), (6, SCHILD_HOCH), (20, SCHILD_HOCH), (26, KAMPF)])
clip_cmu("sterben_vorn", "90", "16", 0.42, 0.75, dauer=40, am_platz=False)
clip_cmu("sterben_hinten", "90", "18", 0.35, 0.75, dauer=40, am_platz=False)
clip_cmu("jubeln", "79", "69", 0.1, 0.5, dauer=60)
print("CLIPS", [x.name for x in bpy.data.actions])

# ---------- Vorschau ----------
if VORSCHAU:
    cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam")); sc.collection.objects.link(cam)
    sc.camera = cam; cam.data.lens = 45
    cam.location = (-2.3, -2.9, 1.25); cam.rotation_euler = (math.radians(86), 0, math.radians(-38))
    sun = bpy.data.objects.new("sun", bpy.data.lights.new("sun", "SUN")); sc.collection.objects.link(sun)
    sun.rotation_euler = (math.radians(45), 0, math.radians(20)); sun.data.energy = 3.5
    bpy.ops.mesh.primitive_plane_add(size=40)
    sc.world = bpy.data.worlds.new("w"); sc.world.use_nodes = True
    sc.world.node_tree.nodes["Background"].inputs[0].default_value = (0.55, 0.57, 0.6, 1)
    sc.render.engine = "BLENDER_EEVEE"; sc.render.resolution_x, sc.render.resolution_y = 520, 720
    for i, (clip, f) in enumerate([("stehen_bereit", 1), ("schlag_a", 7), ("schlag_a", 13), ("abwehr_schild", 10),
                                   ("gehen", 8), ("sterben_vorn", 40)]):
        nimm(clip); sc.frame_set(f)
        hw = arm.matrix_world @ arm.pose.bones["Hips"].head
        cam.location = (hw.x - 2.3, hw.y - 2.9, 1.25)
        sc.render.filepath = VORSCHAU.replace(".png", "_%d.png" % i)
        bpy.ops.render.render(write_still=True)
    nimm("stehen_bereit"); sc.frame_set(1)
    kz = arm.matrix_world @ arm.pose.bones["Head"].head
    cam.location = (kz.x - 0.9, kz.y - 1.0, kz.z + 0.1); cam.rotation_euler = (math.radians(88), 0, math.radians(-42))
    sc.render.filepath = VORSCHAU.replace(".png", "_kopf.png"); bpy.ops.render.render(write_still=True)

# ---------- Export ----------
nimm("stehen"); sc.frame_set(1)
bpy.ops.object.select_all(action="DESELECT")
for o in [arm, body] + ([rock] if rock else []) + teile: o.hide_set(False); o.select_set(True)
bpy.context.view_layer.objects.active = arm
bpy.ops.export_scene.gltf(filepath=OUT, export_format="GLB", use_selection=True, export_animation_mode="ACTIONS",
                          export_apply=True, export_morph=False, export_skins=True)
import json as _json
_json.dump({"tempo": TEMPO, "variante": VARIANTE}, open(OUT + ".clips.json", "w"))
print("EXPORT", OUT, os.path.getsize(OUT) // 1024, "KB", "TEMPO", TEMPO)
