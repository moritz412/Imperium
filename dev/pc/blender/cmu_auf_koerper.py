# CMU ASF/AMC (Original-Format) auf den MPFB-Körper (Skelett cmu_mb) übertragen und Einzelbilder rendern.
# Aufruf: blender.exe -b -P cmu_auf_koerper.py -- <asf> <amc> <ausgabe_praefix> [bilder]
# Übertragung je Knochen in Weltlage: Richtung der Ruhelage angleichen, dann Bewegung relativ zur CMU-Ruhelage aufsetzen.
import bpy, os, sys, math
from mathutils import Matrix, Vector, Euler
from bl_ext.user_default.mpfb.services import HumanService, LocationService

a = sys.argv[sys.argv.index("--") + 1:]
ASF, AMC, OUT = a[0], a[1], a[2]
NBILD = int(a[3]) if len(a) > 3 else 6
CM = 1.0 / 0.45 * 0.0254  # ASF-Länge -> Meter (CMU: Einheit 0.45, Zoll)

NAME = {"root": "Hips", "lhipjoint": "LHipJoint", "lfemur": "LeftUpLeg", "ltibia": "LeftLeg", "lfoot": "LeftFoot",
        "ltoes": "LeftToeBase", "rhipjoint": "RHipJoint", "rfemur": "RightUpLeg", "rtibia": "RightLeg", "rfoot": "RightFoot",
        "rtoes": "RightToeBase", "lowerback": "LowerBack", "upperback": "Spine", "thorax": "Spine1", "lowerneck": "Neck",
        "upperneck": "Neck1", "head": "Head", "lclavicle": "LeftShoulder", "lhumerus": "LeftArm", "lradius": "LeftForeArm",
        "lwrist": "LeftHand", "lhand": "LeftFingerBase", "lfingers": "LeftHandFinger1", "lthumb": "LThumb",
        "rclavicle": "RightShoulder", "rhumerus": "RightArm", "rradius": "RightForeArm", "rwrist": "RightHand",
        "rhand": "RightFingerBase", "rfingers": "RightHandFinger1", "rthumb": "RThumb"}

def rot(ax, ay, az):  # ASF/AMC: x zuerst, dann y, dann z
    return Euler((math.radians(ax), math.radians(ay), math.radians(az)), "XYZ").to_matrix()

# --- ASF lesen ---
bones, parent, kids = {}, {}, {}
lines = open(ASF).read().split("\n"); i = 0; mode = None
while i < len(lines):
    t = lines[i].split()
    if t and t[0] == ":bonedata": mode = "b"
    elif t and t[0] == ":hierarchy": mode = "h"
    elif mode == "b" and t and t[0] == "begin":
        b = {"dof": []}
        while lines[i].split()[0] != "end":
            s = lines[i].split()
            if s[0] == "name": nm = s[1]
            elif s[0] == "direction": b["dir"] = Vector(map(float, s[1:4]))
            elif s[0] == "length": b["len"] = float(s[1]) * CM
            elif s[0] == "axis": b["C"] = rot(*map(float, s[1:4]))
            elif s[0] == "dof": b["dof"] = s[1:]
            i += 1
        bones[nm] = b
    elif mode == "h" and t and t[0] not in ("begin", "end"):
        for k in t[1:]: parent[k] = t[0]; kids.setdefault(t[0], []).append(k)
    i += 1
bones["root"] = {"dir": Vector((0, 0, 0)), "len": 0.0, "C": Matrix.Identity(3), "dof": ["rx", "ry", "rz"]}

# --- AMC lesen ---
frames, cur = [], None
for ln in open(AMC):
    s = ln.split()
    if not s or s[0].startswith(("#", ":")): continue
    if s[0].isdigit(): cur = {}; frames.append(cur); continue
    cur[s[0]] = list(map(float, s[1:]))

def welt(fr):  # Weltrotation je CMU-Knochen (3x3) und Hüftposition, CMU-Koordinaten (y oben)
    W, P = {}, None
    def go(n, Rp):
        b = bones[n]; v = fr.get(n, []) if fr else []
        ang = {"rx": 0.0, "ry": 0.0, "rz": 0.0}
        dofs = b["dof"] if n != "root" else ["tx", "ty", "tz", "rx", "ry", "rz"]
        for d, x in zip(dofs, v): ang[d] = x
        M = rot(ang["rx"], ang["ry"], ang["rz"])
        R = Rp @ b["C"] @ M @ b["C"].inverted()
        W[n] = R
        for k in kids.get(n, []): go(k, R)
    go("root", Matrix.Identity(3))
    if fr: P = Vector(fr["root"][0:3]) * CM
    return W, P

Y2Z = Matrix(((1, 0, 0), (0, 0, -1), (0, 1, 0)))  # CMU y-oben -> Blender z-oben
REST, _ = welt(None)

# --- Körper ---
bpy.ops.wm.read_factory_settings(use_empty=True)
data = LocationService.get_user_data()
basemesh = HumanService.create_human(scale=0.1)
arm = HumanService.add_builtin_rig(basemesh, "cmu_mb", import_weights=True)
HumanService.add_mhclo_asset(os.path.join(data, "proxymeshes", "proxy741", "proxy741.proxy"), basemesh,
                             asset_type="Proxymeshes", subdiv_levels=0)
basemesh.hide_render = True
bpy.context.view_layer.update()
inv = {v: k for k, v in NAME.items()}
trest = {pb.name: (arm.matrix_world.to_3x3() @ pb.bone.matrix_local.to_3x3()) for pb in arm.pose.bones}
tdir = {pb.name: (arm.matrix_world.to_3x3() @ (pb.bone.tail_local - pb.bone.head_local)).normalized() for pb in arm.pose.bones}
hip0 = (arm.matrix_world @ arm.pose.bones["Hips"].bone.head_local).copy()

def cmu_dir(n):  # Richtung des Zielknochens in CMU-Ruhelage (Welt, Blender-Achsen)
    b = bones[n]
    if n == "root" or b["len"] == 0:
        return None
    return (Y2Z @ REST[n] @ b["dir"]).normalized()

ALIGN = {}
for pb in arm.pose.bones:
    n = inv.get(pb.name)
    d = cmu_dir(n) if n else None
    ALIGN[pb.name] = tdir[pb.name].rotation_difference(d).to_matrix() if d is not None else Matrix.Identity(3)

def setze(fr):
    W, P = welt(fr)
    order = []
    def walk(b):
        order.append(b)
        for c in b.children: walk(c)
    walk(arm.pose.bones["Hips"].bone)
    for bone in order:
        pb = arm.pose.bones[bone.name]
        n = inv.get(bone.name)
        if n is None: continue
        # Knochen trägt in cmu_mb die Bewegung seines eigenen CMU-Segments
        Rs = Y2Z @ W[n] @ Y2Z.inverted(); Rr = Y2Z @ REST[n] @ Y2Z.inverted()
        Rw = Rs @ Rr.inverted() @ ALIGN[bone.name] @ trest[bone.name]
        m = pb.matrix.copy()
        loc = m.to_translation()
        if bone.name == "Hips":
            loc = hip0 + Y2Z @ (P - start)
            loc.z = hip0.z + (Y2Z @ P).z - (Y2Z @ start).z
        pb.matrix = Matrix.Translation(loc) @ (arm.matrix_world.to_3x3().inverted() @ Rw).to_4x4()
        bpy.context.view_layer.update()

_, start = welt(frames[0])
sc = bpy.context.scene
cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam")); sc.collection.objects.link(cam)
sc.camera = cam; cam.data.lens = 50
sun = bpy.data.objects.new("sun", bpy.data.lights.new("sun", "SUN")); sc.collection.objects.link(sun)
sun.rotation_euler = (math.radians(50), 0, math.radians(30)); sun.data.energy = 3
bpy.ops.mesh.primitive_plane_add(size=60)
sc.world = bpy.data.worlds.new("w"); sc.world.use_nodes = True
sc.world.node_tree.nodes["Background"].inputs[0].default_value = (0.6, 0.6, 0.62, 1)
sc.render.engine = "BLENDER_EEVEE"; sc.render.resolution_x, sc.render.resolution_y = 500, 700
step = max(1, len(frames) // NBILD)
for k in range(NBILD):
    setze(frames[k * step])
    h = arm.pose.bones["Hips"].head; hw = arm.matrix_world @ h
    cam.location = (hw.x + 4.2, hw.y, 1.0); cam.rotation_euler = (math.radians(90), 0, math.radians(90))
    sc.render.filepath = "%s_%02d.png" % (OUT, k)
    bpy.ops.render.render(write_still=True)
print("GERENDERT", NBILD, "Bilder aus", len(frames), "CMU-Bildern")
