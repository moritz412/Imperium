# Vorschau: MPFB-Körper (cmu_mb, proxy741, 1,72 m) + alle TRELLIS-Ausrüstungsteile in einer Reihe.
# Aufruf: blender.exe -b -P vorschau.py -- <ausgabe.png>
import bpy, os, sys, glob, math
from mathutils import Vector
from bl_ext.user_default.mpfb.services import HumanService, LocationService

out = sys.argv[sys.argv.index("--") + 1]
B3 = r"C:\Users\anmel\Desktop\imperium-bilder\3d"
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene

# Körper
data = LocationService.get_user_data()
basemesh = HumanService.create_human(scale=0.1)
arm = HumanService.add_builtin_rig(basemesh, "cmu_mb", import_weights=True)
body = HumanService.add_mhclo_asset(os.path.join(data, "proxymeshes", "proxy741", "proxy741.proxy"), basemesh,
                                    asset_type="Proxymeshes", subdiv_levels=0)
basemesh.hide_render = True
arm.scale = (1.72 / 1.66,) * 3
arm.location = (-0.7, 0.3, 0)

# Teile: TRELLIS normiert auf ~1; reale Größe grob setzen (m)
GROESSE = {"helm": 0.32, "schild": 0.95, "schwert": 0.75, "ruest": 0.25, "beutel": 0.2}
teile = sorted(glob.glob(os.path.join(B3, "roh_44", "*.glb")) + glob.glob(os.path.join(B3, "roh_45", "*.glb")))
REIHE = {"schild": 1, "helm": 0, "ruest": 0, "beutel": 0, "schwert": 0}
xpos = {0: 0.0, 1: 0.0}
for f in sorted(teile, key=lambda p: os.path.basename(p).split("_")[1]):
    vor = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=f)
    neu = [o for o in bpy.data.objects if o not in vor and o.type == "MESH"]
    if not neu: continue
    o = neu[0]; art = os.path.basename(f).split("_")[1]
    bpy.context.view_layer.update()
    bb = [o.matrix_world @ Vector(c) for c in o.bound_box]
    ext = [max(v[k] for v in bb) - min(v[k] for v in bb) for k in range(3)]
    if art == "schwert":  # längste Achse senkrecht stellen
        k = ext.index(max(ext))
        if k == 0: o.rotation_euler.rotate_axis("Y", math.radians(90))
        if k == 1: o.rotation_euler.rotate_axis("X", math.radians(90))
        bpy.context.view_layer.update()
        bb = [o.matrix_world @ Vector(c) for c in o.bound_box]
        ext = [max(v[kk] for v in bb) - min(v[kk] for v in bb) for kk in range(3)]
    s = GROESSE.get(art, 0.4) / max(ext)
    o.scale = [c * s for c in o.scale]
    bpy.context.view_layer.update()
    bb = [o.matrix_world @ Vector(c) for c in o.bound_box]
    w = max(v.x for v in bb) - min(v.x for v in bb)
    r = REIHE.get(art, 0)
    o.location.x += xpos[r] - min(v.x for v in bb)
    o.location.y += r * 1.0
    o.location.z -= min(v.z for v in bb)
    xpos[r] += w + 0.12
    o.name = os.path.basename(f)[5:-4]
print("BREITE", xpos)

# Boden, Licht, Kamera
bpy.ops.mesh.primitive_plane_add(size=30, location=(2, 0, 0))
cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam")); sc.collection.objects.link(cam)
cam.location = (2.6, -6.0, 2.0); cam.rotation_euler = (math.radians(78), 0, 0); cam.data.lens = 32
sc.camera = cam
sun = bpy.data.objects.new("sun", bpy.data.lights.new("sun", "SUN")); sc.collection.objects.link(sun)
sun.rotation_euler = (math.radians(50), math.radians(10), math.radians(30)); sun.data.energy = 3
sc.render.engine = "BLENDER_EEVEE"
sc.world = bpy.data.worlds.new("w"); sc.world.use_nodes = True
sc.world.node_tree.nodes["Background"].inputs[0].default_value = (0.6, 0.6, 0.62, 1)
sc.render.resolution_x, sc.render.resolution_y = 1800, 900
sc.render.filepath = out
bpy.ops.render.render(write_still=True)
print("GERENDERT", out, len(teile), "Teile")
