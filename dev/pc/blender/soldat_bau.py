# Baut einen kompletten Soldaten (Hastatus, Kit A1) aus eigenen Teilen und exportiert ihn als .glb.
# Körper: MPFB (CC0), Skelett cmu_mb; Bewegungen: CMU (ASF/AMC) + Schlag/Stoß/Schild per Skript; Teile: TRELLIS roh_44/45.
# Aufruf (PC): blender.exe -b -P soldat_bau.py -- <ausgabe.glb> [vorschau.png]
import bpy, os, sys, math
import numpy as np
from mathutils import Matrix, Vector
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cmu_lib
from bl_ext.user_default.mpfb.services import HumanService, LocationService, TargetService

a = sys.argv[sys.argv.index("--") + 1:]
OUT = a[0]; VORSCHAU = a[1] if len(a) > 1 else None
BASE = r"C:\Users\anmel\Desktop\imperium-bilder"
CMU = os.path.join(BASE, "blender", "cmu")
FPS = 30

# ---------- Körper ----------
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene; sc.render.fps = FPS
data = LocationService.get_user_data()
macro = TargetService.get_default_macro_info_dict()
macro.update({"gender": 1.0, "age": 0.5, "muscle": 0.65, "weight": 0.5, "height": 0.62})
basemesh = HumanService.create_human(scale=0.1, macro_detail_dict=macro)
arm = HumanService.add_builtin_rig(basemesh, "cmu_mb", import_weights=True)
arm.name = "sk_mensch"
body = HumanService.add_mhclo_asset(os.path.join(data, "proxymeshes", "proxy741", "proxy741.proxy"), basemesh,
                                    asset_type="Proxymeshes", subdiv_levels=0)
body.name = "koerper"
HumanService.set_character_skin(os.path.join(data, "skins", "young_caucasian_male", "young_caucasian_male.mhmat"),
                                basemesh, bodyproxy=body, skin_type="GAMEENGINE")
basemesh.hide_render = True; basemesh.hide_set(True)
bpy.context.view_layer.update()

# Tunika: Flächen, deren Hauptgewicht auf Rumpf/Oberarm/Oberschenkel liegt
TUNIKA_GR = {"Hips", "LowerBack", "Spine", "Spine1", "LHipJoint", "RHipJoint", "LeftShoulder", "RightShoulder",
             "LeftArm", "RightArm", "LeftUpLeg", "RightUpLeg"}
tun = bpy.data.materials.new("tunika_rot"); tun.use_nodes = True
tun.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (0.42, 0.06, 0.04, 1)
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
TREFFER = dict(BEREIT, **{"Spine": (0, 0.2, 0.98), "Spine1": (0, 0.3, 0.95), "Head": (0, 0.35, 0.94)})

def clip_haltung(name, keys):
    """keys: Liste (bild, haltung) – lineare Übergänge zwischen gesetzten Haltungen."""
    act = bpy.data.actions.new(name); act.use_fake_user = True
    arm.animation_data.action = act
    for f, h in keys:
        haltung(h); taste(f)
    return act

def clip_cmu(name, subj, trial, von=0.0, bis=1.0, dauer=None, am_platz=True, arme=None):
    auf = cmu_lib.Aufnahme(os.path.join(CMU, subj, subj + ".asf"), os.path.join(CMU, subj, "%s_%s.amc" % (subj, trial)))
    n = len(auf.frames); i0, i1 = int(n * von), int(n * bis) - 1
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

helm = lade("roh_44/teil_helm_A1_montefortino.glb", "teil_helm_A1_montefortino", 160, staender=0.09)
P, c, ax = pca(helm)
z = P[:, 2]; zb = np.linspace(z.min(), z.max(), 21)
bx = [np.ptp(P[(z >= zb[k]) & (z <= zb[k + 1])][:, 0]) if ((z >= zb[k]) & (z <= zb[k + 1])).sum() > 3 else 0 for k in range(20)]
mx = max(bx); k0 = int(np.argmax(bx))
kt = next((k for k in range(k0, 20) if bx[k] < 0.55 * mx), 19)
kalotte_oben = zb[kt]
kal = P[z < kalotte_oben]
s = 0.31 / max(np.ptp(kal[:, 0]), np.ptp(kal[:, 1]))
kopf = kp("Head", 0.5)
cx, cy = kal[:, 0].mean(), kal[:, 1].mean()
helm.matrix_world = Matrix.Translation((kopf.x, kopf.y + 0.01, kopf_oben + 0.035)) @ Matrix.Rotation(math.pi, 4, "Z") @ Matrix.Scale(s, 4) @ Matrix.Translation((-cx, -cy, -kalotte_oben)) @ helm.matrix_world
bpy.context.view_layer.update()
print("HELM", round(s, 3), "Busch ab Schicht", kt)
m = helm.matrix_world.copy(); helm.parent = arm; helm.parent_type = "BONE"; helm.parent_bone = "Head"
bpy.context.view_layer.update(); helm.matrix_world = m

brust = lade("roh_45/teil_ruest_A1_pectorale.glb", "teil_ruest_A1_pectorale", 40)
s1 = kp("Spine1", 0.5)
vorne = koerper_P[(np.abs(koerper_P[:, 2] - s1.z) < 0.06) & (np.abs(koerper_P[:, 0]) < 0.06)][:, 1].min()
setze_teil(brust, (Vector((1, 0, 0)), Vector((0, -1, 0))), Vector((0, vorne - 0.012, s1.z)), 0.22, "Spine1")

schild = lade("roh_45/teil_schild_A1_scutum.glb", "teil_schild_A1_scutum", 260)
hand_l = kp("LeftHand", 0.5)
setze_teil(schild, (Vector((0, 0, 1)), Vector((0, -1, 0))), hand_l + Vector((0.02, -0.07, 0.05)), 1.05, "LeftHand", buckel=True)

schwert = lade("roh_45/teil_schwert_A1_gladius.glb", "teil_schwert_A1_gladius", 70)
P, c, ax = pca(schwert)
proj = (P - np.array(c[:])) @ np.array(ax[0][:])
quer = np.linalg.norm((P - np.array(c[:])) - np.outer(proj, np.array(ax[0][:])), axis=1)
lo, hi = proj.min(), proj.max(); band = 0.2 * (hi - lo)
breit_lo = quer[proj < lo + band].max(); breit_hi = quer[proj > hi - band].max()
klinge = ax[0] if breit_lo > breit_hi else -ax[0]   # Griffseite ist breiter (Handschutz, Knauf)
griff_ende = c + ax[0] * (lo if breit_lo > breit_hi else hi)
hand_r = kp("RightHand", 0.6)
ziel = Vector((0.02, -1, 0.15)).normalized()
R = klinge.rotation_difference(ziel).to_matrix().to_4x4()
s = 0.62 / (hi - lo)
# Griffmitte (12 % der Länge vom Griffende) in die Hand
gm = griff_ende + klinge * 0.12 * (hi - lo)
schwert.matrix_world = Matrix.Translation(hand_r) @ R @ Matrix.Scale(s, 4) @ Matrix.Translation(-gm) @ schwert.matrix_world
m = schwert.matrix_world.copy(); schwert.parent = arm; schwert.parent_type = "BONE"; schwert.parent_bone = "RightHand"
bpy.context.view_layer.update(); schwert.matrix_world = m

# Körper dezimieren (Nahstufe ≤ 1500 inkl. Teile)
d = body.modifiers.new("dez", "DECIMATE"); d.ratio = 0.62
while body.modifiers[0].name != "dez":
    bpy.ops.object.modifier_move_up({"object": body}, modifier="dez") if False else body.modifiers.move(len(body.modifiers) - 1, 0)

# ---------- Clips ----------
ruhe()
clip_cmu("stehen", "140", "06", 0.2, 0.6, dauer=60, arme=TRAGEN)
clip_cmu("gehen", "02", "01", 0.25, 0.25 + 1.1 * 120 / 343, dauer=33, arme=TRAGEN)
clip_cmu("laufen", "02", "03", 0.3, 0.3 + 0.75 * 120 / 170, dauer=22, arme=TRAGEN)
clip_cmu("fliehen", "02", "03", 0.3, 0.3 + 0.75 * 120 / 170, dauer=22, arme=TRAGEN)
clip_haltung("stehen_bereit", [(1, BEREIT), (30, dict(BEREIT, Spine1=(0, -0.05, 1))), (60, BEREIT)])
clip_haltung("schlag_a", [(1, BEREIT), (7, AUSHOLEN), (12, STOSS), (16, STOSS), (24, BEREIT)])
clip_haltung("schlag_b", [(1, BEREIT), (9, HIEB_OBEN), (14, HIEB_UNTEN), (24, BEREIT)])
clip_haltung("stoss_speer", [(1, BEREIT), (7, AUSHOLEN), (12, SPEER), (16, SPEER), (24, BEREIT)])
clip_haltung("abwehr_schild", [(1, BEREIT), (6, SCHILD_VOR), (14, SCHILD_VOR), (20, BEREIT)])
clip_haltung("treffer", [(1, BEREIT), (5, TREFFER), (14, BEREIT)])
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

# ---------- Export ----------
nimm("stehen"); sc.frame_set(1)
bpy.ops.object.select_all(action="DESELECT")
for o in [arm, body, helm, brust, schild, schwert]: o.hide_set(False); o.select_set(True)
bpy.context.view_layer.objects.active = arm
bpy.ops.export_scene.gltf(filepath=OUT, export_format="GLB", use_selection=True, export_animation_mode="ACTIONS",
                          export_apply=True, export_morph=False, export_skins=True)
print("EXPORT", OUT, os.path.getsize(OUT) // 1024, "KB")
