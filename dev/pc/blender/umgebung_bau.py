# Feste Umgebungsteile für die Schlachtkarte per Skript: Felsen, Häuser (mediterran, keltisches Rundhaus), Flechtzaun, Steinmauer, Heuhaufen.
# Ausgabe JSON (three.js-Koordinaten: x, y oben, z = −Blender-y): {"teile": {name: {pos, nrm, idx, col, r}}}; col sRGB 0..255 je Ecke,
# r = Grundkreisradius (für Kollision/Platz). Aufruf (PC): blender.exe -b -P umgebung_bau.py -- <ausgabe.json> [vorschau.png]
import bpy, bmesh, math, random, json, sys
from mathutils import Vector, noise

a = sys.argv[sys.argv.index("--") + 1:]
OUT = a[0]; VORSCHAU = a[1] if len(a) > 1 else None
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
TEILE = {}

def srgb(c): return [max(0, min(255, round(255 * (x ** (1 / 2.2))))) for x in c]

def ablegen(name, bm, farbe, r):
    """farbe(p, n, f) -> lineares RGB je Ecke; flache Schattierung (Ecken je Fläche getrennt)."""
    bm.normal_update()
    pos, nrm, col, idx = [], [], [], []
    for f in bm.faces:
        vs = f.verts[:]
        for k in range(1, len(vs) - 1):
            for v in (vs[0], vs[k], vs[k + 1]):
                p = v.co; n = f.normal
                pos += [round(p.x, 4), round(p.z, 4), round(-p.y, 4)]; nrm += [round(n.x, 3), round(n.z, 3), round(-n.y, 3)]
                col += srgb(farbe(p, n, f)); idx.append(len(idx))
    TEILE[name] = dict(pos=pos, nrm=nrm, idx=idx, col=col, r=r)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new(name, me); sc.collection.objects.link(ob); return ob

def fels(name, gr, seed, flach=0.95):
    random.seed(seed); bm = bmesh.new(); bmesh.ops.create_icosphere(bm, subdivisions=2, radius=1.0)
    off = Vector((seed * 3.1, seed * 1.7, seed * 0.3))
    for v in bm.verts:
        d = v.co.normalized(); s = 1 + 0.35 * noise.noise(d * 1.6 + off) + 0.12 * noise.noise(d * 4 + off)
        v.co = Vector((d.x * gr[0], d.y * gr[1], d.z * gr[2] * flach)) * s
        v.co.z += 0.3 * gr[2]
        if v.co.z < -0.1 * gr[2]: v.co.z = -0.1 * gr[2]   # unten abgeflacht, steckt im Boden
    def farbe(p, n, f):
        g = 0.32 + 0.06 * noise.noise(p * 2.3 + off); moos = max(0, n.z) * 0.5 * max(0, noise.noise(p * 1.2 + off))
        return (g * (1 - moos) + 0.12 * moos, g * (1 - moos) * 0.97 + 0.16 * moos, g * (1 - moos) * 0.9 + 0.06 * moos)
    return ablegen(name, bm, farbe, max(gr[0], gr[1]) * 1.1)

def kasten(bm, mitte, groesse, mi=0):
    r = bmesh.ops.create_cube(bm, size=1.0)
    for v in r["verts"]: v.co = Vector((v.co.x * groesse[0], v.co.y * groesse[1], v.co.z * groesse[2])) + Vector(mitte)
    for f in {f for v in r["verts"] for f in v.link_faces}: f.material_index = mi

def haus_mittelmeer(name):
    """Bauernhaus: verputzte Wände, flaches Ziegeldach (Satteldach 15°), Tür, Hofmauer."""
    bm = bmesh.new(); W, T, H = 3.0, 2.2, 2.5
    kasten(bm, (0, 0, H / 2), (2 * W, 2 * T, H), 0)
    # Satteldach als Prisma mit Überstand
    ue = 0.25; dh = math.tan(math.radians(17)) * (T + ue)
    v = [bm.verts.new(p) for p in [(-W - ue, -T - ue, H), (W + ue, -T - ue, H), (W + ue, 0, H + dh), (-W - ue, 0, H + dh),
                                   (-W - ue, T + ue, H), (W + ue, T + ue, H)]]
    for fl in ((v[0], v[1], v[2], v[3]), (v[3], v[2], v[5], v[4])): bm.faces.new(fl).material_index = 1
    for fl in ((v[0], v[3], v[4]), (v[1], v[5], v[2])): bm.faces.new(fl).material_index = 2
    for fl in ((v[1], v[0], v[4], v[5]),): bm.faces.new(fl).material_index = 1
    kasten(bm, (0.6, -T - 0.02, 0.95), (0.9, 0.06, 1.9), 3)     # Tür
    kasten(bm, (-1.6, -T - 0.02, 1.6), (0.5, 0.06, 0.5), 3)     # Fensterluke
    kasten(bm, (W + 1.6, 0.6, 0.6), (0.35, 4.2, 1.2), 0)        # Hofmauer
    FARBEN = [(0.62, 0.55, 0.45), (0.42, 0.15, 0.08), (0.58, 0.5, 0.4), (0.12, 0.08, 0.05)]
    def farbe(p, n, f):
        c = FARBEN[f.material_index]; k = 0.9 + 0.12 * noise.noise(p * 1.7) - (0.15 if p.z < 0.4 and f.material_index == 0 else 0)
        return tuple(x * k for x in c)
    return ablegen(name, bm, farbe, 4.2)

def rundhaus(name):
    """Keltisches Rundhaus: Flechtwand mit Lehm (Ø 7 m), steiles Strohkegeldach, Eingang."""
    bm = bmesh.new(); R, H, seg = 3.5, 1.7, 16
    unten = [bm.verts.new((R * math.cos(2 * math.pi * i / seg), R * math.sin(2 * math.pi * i / seg), 0)) for i in range(seg)]
    oben = [bm.verts.new((R * math.cos(2 * math.pi * i / seg), R * math.sin(2 * math.pi * i / seg), H)) for i in range(seg)]
    for i in range(seg):
        j = (i + 1) % seg; bm.faces.new((unten[i], unten[j], oben[j], oben[i])).material_index = 0
    tr = [bm.verts.new(((R + 0.6) * math.cos(2 * math.pi * i / seg), (R + 0.6) * math.sin(2 * math.pi * i / seg), H - 0.35)) for i in range(seg)]
    sp = bm.verts.new((0, 0, H + 4.2))
    for i in range(seg):
        j = (i + 1) % seg; bm.faces.new((tr[i], tr[j], sp)).material_index = 1
        bm.faces.new((oben[i], oben[j], tr[j], tr[i])).material_index = 1
    kasten(bm, (0, -R - 0.5, 0.9), (1.3, 1.2, 1.8), 2)           # Vorbau des Eingangs
    FARBEN = [(0.4, 0.3, 0.2), (0.48, 0.38, 0.18), (0.32, 0.22, 0.12)]
    def farbe(p, n, f):
        c = FARBEN[f.material_index]; k = 0.88 + 0.16 * noise.noise(p * 2.2 + Vector((5, 1, 0)))
        if f.material_index == 1: k *= 0.8 + 0.25 * min(1, p.z / 5)   # Stroh oben heller, unten verwittert
        return tuple(x * k for x in c)
    return ablegen(name, bm, farbe, 4.3)

def flechtzaun(name, laenge=4.0):
    bm = bmesh.new(); n = int(laenge / 0.8) + 1
    for i in range(n):
        x = -laenge / 2 + i * laenge / (n - 1); kasten(bm, (x, 0, 0.6), (0.08, 0.08, 1.2), 0)
    for z in (0.3, 0.55, 0.8, 1.0): kasten(bm, (0, (0.02 if int(z * 10) % 2 else -0.02), z), (laenge, 0.05, 0.12), 1)
    def farbe(p, n, f):
        c = (0.24, 0.17, 0.1) if f.material_index == 0 else (0.36, 0.28, 0.16); k = 0.85 + 0.2 * noise.noise(p * 3)
        return tuple(x * k for x in c)
    return ablegen(name, bm, farbe, laenge / 2)

def steinmauer(name, laenge=6.0):
    """Trockenmauer aus Feldsteinen (Kniehöhe), Feldgrenze."""
    random.seed(7); bm = bmesh.new(); x = -laenge / 2
    while x < laenge / 2:
        w = random.uniform(0.35, 0.6)
        for z, h in ((0.18, 0.36), (0.5, 0.28)):
            kasten(bm, (x + w / 2, random.uniform(-0.04, 0.04), z), (w * 0.96, random.uniform(0.4, 0.5), h * random.uniform(0.85, 1.0)), 0)
        x += w
    def farbe(p, n, f):
        g = 0.36 + 0.08 * noise.noise(f.calc_center_median() * 3.1); return (g, g * 0.96, g * 0.88)
    return ablegen(name, bm, farbe, laenge / 2)

def heuhaufen(name):
    bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, segments=10, radius1=1.1, radius2=0.15, depth=2.0)
    for v in bm.verts: v.co.z += 1.0; v.co += v.co.normalized() * 0.08 * noise.noise(v.co * 2)
    def farbe(p, n, f):
        k = 0.85 + 0.2 * noise.noise(p * 3); return (0.55 * k, 0.45 * k, 0.2 * k)
    return ablegen(name, bm, farbe, 1.2)

def balliste(name):
    """Torsionsgeschütz (Balliste, ~3 m lang, Spannrahmen mit zwei Sehnenbündeln, Gleitbahn, Dreibein). Blick nach −Y (Schussrichtung)."""
    bm = bmesh.new()
    kasten(bm, (0, 0.2, 1.15), (0.24, 3.0, 0.14), 0)              # Gleitbahn
    kasten(bm, (0, -1.15, 1.35), (1.1, 0.22, 0.12), 0)            # Spannrahmen oben/unten
    kasten(bm, (0, -1.15, 0.95), (1.1, 0.22, 0.12), 0)
    for sx in (-1, 1):
        kasten(bm, (sx * 0.5, -1.15, 1.15), (0.1, 0.22, 0.5), 0)    # Rahmenständer
        kasten(bm, (sx * 0.32, -1.15, 1.15), (0.14, 0.14, 0.52), 1)  # Sehnenbündel
        kasten(bm, (sx * 0.7, -0.95, 1.15), (0.55, 0.07, 0.07), 0)   # Arme (gespannt nach hinten)
        kasten(bm, (sx * 0.15, 1.3, 1.17), (0.06, 0.06, 0.4), 0)     # Winde
        for sy in (-1, 1):
            kasten(bm, (sx * 0.55, sy * 0.45 + 0.2, 0.5), (0.1, 0.1, 1.05), 0)   # Beine
    kasten(bm, (0, 0.2, 1.24), (0.04, 1.6, 0.04), 2)              # Sehne zum Abzug
    kasten(bm, (0, -0.6, 1.26), (0.05, 1.1, 0.05), 3)             # Bolzen
    FARBEN = [(0.32, 0.2, 0.09), (0.22, 0.16, 0.1), (0.5, 0.45, 0.35), (0.25, 0.25, 0.26)]
    def farbe(p, n, f):
        k = 0.85 + 0.2 * noise.noise(p * 4); return tuple(x * k for x in FARBEN[f.material_index])
    return ablegen(name, bm, farbe, 1.7)

obs = [balliste("balliste"), fels("fels_gross", (2.2, 1.6, 1.4), 1), fels("fels_mittel", (1.2, 0.9, 0.9), 2), fels("fels_klein", (0.5, 0.4, 0.35), 3, 0.8),
       fels("fels_platte", (1.8, 1.3, 0.6), 4, 0.5), haus_mittelmeer("haus_mittelmeer"), rundhaus("rundhaus_kelt"),
       flechtzaun("flechtzaun"), steinmauer("steinmauer"), heuhaufen("heuhaufen")]
json.dump({"format": "umgebung_v1", "teile": TEILE}, open(OUT, "w"), separators=(",", ":"))
print("UMGEBUNG", {k: len(v["idx"]) // 3 for k, v in TEILE.items()}, "Dreiecke")

if VORSCHAU:
    x = -14
    for o in obs: o.location.x = x; x += 2 * TEILE[o.name]["r"] + 1.5
    for o in obs: o.location.x -= x / 2 - 7
    cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam")); sc.collection.objects.link(cam); sc.camera = cam; cam.data.lens = 22
    cam.location = (0, -26, 9); cam.rotation_euler = (math.radians(72), 0, 0)
    sun = bpy.data.objects.new("sun", bpy.data.lights.new("sun", "SUN")); sc.collection.objects.link(sun)
    sun.rotation_euler = (math.radians(45), 0, math.radians(-30)); sun.data.energy = 3.5
    bpy.ops.mesh.primitive_plane_add(size=120)
    for o in obs:
        m = bpy.data.materials.new(o.name); m.use_nodes = True
        attr = m.node_tree.nodes.new("ShaderNodeAttribute"); attr.attribute_name = "Col"
        # Vorschau ohne Vertexfarben-Attribut: mittlere Farbe des Teils
        c = TEILE[o.name]["col"]; n = len(c) // 3
        m.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (*[(sum(c[i::3]) / n / 255) ** 2.2 for i in range(3)], 1)
        o.data.materials.append(m)
    sc.world = bpy.data.worlds.new("w"); sc.world.use_nodes = True; sc.world.node_tree.nodes["Background"].inputs[0].default_value = (0.55, 0.57, 0.6, 1)
    sc.render.engine = "BLENDER_EEVEE"; sc.render.resolution_x, sc.render.resolution_y = 1200, 500
    sc.render.filepath = VORSCHAU; bpy.ops.render.render(write_still=True)
