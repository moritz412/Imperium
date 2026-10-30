# Baut eine Figur aus einem Spielpaket (backen.py) nach – nur Ecken-Farben, keine Texturen – und rendert sie.
# So sieht man, was das Spiel bekommt. Aufruf: blender -b -P paket_ansehen.py -- paket.json bild.png [clip] [bild]
import bpy, sys, json, base64, struct, math
from mathutils import Matrix

a = sys.argv[sys.argv.index("--") + 1:]
P = json.load(open(a[0])); OUT = a[1]
CLIP = a[2] if len(a) > 2 else "stehen_bereit"; BILD = int(a[3]) if len(a) > 3 else 0
f32 = lambda s: struct.unpack("<%df" % (len(base64.b64decode(s)) // 4), base64.b64decode(s))
u8 = lambda s: base64.b64decode(s)
u16 = lambda s: struct.unpack("<%dH" % (len(base64.b64decode(s)) // 2), base64.b64decode(s))

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
anim = f32(P["anim"]["f32"]); W = P["anim"]["w"]; nb = len(P["bones"])
clip = next(c for c in P["clips"] if c["n"] == CLIP)
row = clip["row"] + min(BILD, clip["len"] - 1)
def skin(b):
    o = (row * W + b * 4) * 4
    e = anim[o:o + 16]
    return Matrix([[e[c * 4 + r] for c in range(4)] for r in range(4)])
SK = [skin(b) for b in range(nb)]
T = Matrix(((1, 0, 0, 0), (0, 0, -1, 0), (0, 1, 0, 0), (0, 0, 0, 1)))  # three.js -> Blender

mat = bpy.data.materials.new("ecken"); mat.use_nodes = True
nt = mat.node_tree; att = nt.nodes.new("ShaderNodeVertexColor"); att.layer_name = "col"
nt.links.new(att.outputs["Color"], nt.nodes["Principled BSDF"].inputs["Base Color"])
nt.nodes["Principled BSDF"].inputs["Roughness"].default_value = 0.85

def baue(name, d, starr=None):
    pos = f32(d["pos"]); idx = u16(d["idx"]); col = u8(d["col"])
    si = u8(d["si"]); sw = u8(d["sw"]); n = d["n"]
    vs = []
    for i in range(n):
        from mathutils import Vector
        p = Vector((pos[3 * i], pos[3 * i + 1], pos[3 * i + 2], 1.0))
        if starr is not None:
            q = SK[starr] @ p
        else:
            q = Vector((0.0, 0.0, 0.0, 0.0))
            for k in range(4):
                if sw[4 * i + k]: q += (SK[si[4 * i + k]] @ p) * (sw[4 * i + k] / 255.0)
            if not any(sw[4 * i:4 * i + 4]): q = p
        q = T @ q
        vs.append((q.x, q.y, q.z))
    me = bpy.data.meshes.new(name)
    me.from_pydata(vs, [], [tuple(idx[3 * t:3 * t + 3]) for t in range(len(idx) // 3)])
    ca = me.color_attributes.new("col", "BYTE_COLOR", "POINT")
    for i in range(n):
        ca.data[i].color_srgb = (col[3 * i] / 255, col[3 * i + 1] / 255, col[3 * i + 2] / 255, 1)
    me.materials.append(mat)
    ob = bpy.data.objects.new(name, me); sc.collection.objects.link(ob)
    return ob

for k, v in P["koerper"].items(): baue(k, v["nah"])
for k, v in P["teile"].items(): baue(k, v["nah"], starr=v["knochen"])
cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam")); sc.collection.objects.link(cam); sc.camera = cam
cam.location = (-2.3, -2.9, 1.15); cam.rotation_euler = (math.radians(86), 0, math.radians(-38)); cam.data.lens = 45
sun = bpy.data.objects.new("sun", bpy.data.lights.new("sun", "SUN")); sc.collection.objects.link(sun)
sun.rotation_euler = (math.radians(45), 0, math.radians(-20)); sun.data.energy = 3.5
bpy.ops.mesh.primitive_plane_add(size=40)
sc.world = bpy.data.worlds.new("w"); sc.world.use_nodes = True
sc.world.node_tree.nodes["Background"].inputs[0].default_value = (0.55, 0.57, 0.6, 1)
sc.render.engine = "BLENDER_EEVEE"; sc.render.resolution_x, sc.render.resolution_y = 520, 720
sc.render.filepath = OUT; bpy.ops.render.render(write_still=True)
print("PAKETBILD", OUT, CLIP, BILD)
