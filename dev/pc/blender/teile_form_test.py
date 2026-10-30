# Rendert alle Formen aus teile_form.py nebeneinander (Kontrolle). Aufruf: blender -b -P teile_form_test.py -- bild.png
import bpy, sys, os, math
from mathutils import Vector
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import teile_form as T
out = sys.argv[sys.argv.index("--") + 1]
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
obs = []
for a in ("montefortino", "pilos", "thraker", "sehnen"):
    o, r = T.helm(a, "helm_" + a); o.scale = (2.5,) * 3; obs.append(o)
obs.append(T.schild(0.65, 1.1, "scutum", (0.42, 0.06, 0.04), mittel=(0.2, 0.1, 0.04), zylinder=0.12, eckig=3.0))
obs.append(T.schild(0.85, 0.85, "rund", (0.5, 0.22, 0.05), woelbung=0.03))
obs.append(T.schild(0.9, 0.9, "aspis", (0.6, 0.55, 0.42), woelbung=0.08))
obs.append(T.schild(0.55, 1.1, "oval", (0.08, 0.2, 0.08), mittel=(0.3, 0.19, 0.08)))
for a in ("gladius", "falcata", "lang"):
    o = T.schwert(a, "schwert_" + a); o.scale = (1.5,) * 3; obs.append(o)
x = 0
for o in obs:
    o.location = (x, 0, 0.7); x += 0.95
cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam")); sc.collection.objects.link(cam); sc.camera = cam
cam.location = (x / 2 - 0.5, -12.5, 1.6); cam.rotation_euler = (math.radians(86), 0, 0); cam.data.lens = 45
sun = bpy.data.objects.new("sun", bpy.data.lights.new("sun", "SUN")); sc.collection.objects.link(sun)
sun.rotation_euler = (math.radians(50), 0, math.radians(-25)); sun.data.energy = 3.5
sc.world = bpy.data.worlds.new("w"); sc.world.use_nodes = True
sc.world.node_tree.nodes["Background"].inputs[0].default_value = (0.55, 0.57, 0.6, 1)
sc.render.engine = "BLENDER_EEVEE"; sc.render.resolution_x, sc.render.resolution_y = 1800, 520
sc.render.filepath = out; bpy.ops.render.render(write_still=True)
print("DREIECKE", {o.name: sum(len(p.vertices) - 2 for p in o.data.polygons) for o in obs})
