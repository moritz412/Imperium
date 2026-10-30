# Ausrüstungsteile als einfache, geschlossene Formen per Skript (statt TRELLIS bei kleinen Teilen).
# Grund (30.10.): TRELLIS-Teile zerfallen bei 70–260 Dreiecken (Löcher, hohle Schilde, zerfranste Klingen).
# Maße nach Funden; Farben linear (Blender). Jede Funktion liefert ein Objekt in Grundlage:
#   Helm:   Mitte der Kalotte im Ursprung, oben +Z, vorne −Y; r = Kalottenradius.
#   Schild: Mitte im Ursprung, oben +Z, Vorderseite −Y.
#   Schwert: Griffmitte im Ursprung, Klinge entlang +Z, Schneide in X.
import bpy, bmesh, math
from mathutils import Vector, Matrix


def mat(name, rgb, metall=0.0, rau=0.8):
    m = bpy.data.materials.get(name)
    if m: return m
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*rgb, 1); b.inputs["Metallic"].default_value = metall
    b.inputs["Roughness"].default_value = rau
    return m


BRONZE = ((0.43, 0.27, 0.09), 0.8, 0.45)
EISEN = ((0.22, 0.22, 0.23), 0.9, 0.4)
LEDER = ((0.15, 0.08, 0.04), 0.0, 0.85)
HOLZ = ((0.3, 0.19, 0.08), 0.0, 0.8)


def _obj(name, bm, mats):
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    for m in mats: me.materials.append(m)
    ob = bpy.data.objects.new(name, me); bpy.context.collection.objects.link(ob)
    return ob


def _kugelkappe(bm, r, sy, z0, z1, seg=10, ringe=4, mi=0, spitze=None):
    """Kalotte von Höhe z0 (Rand) bis z1 (Scheitel) auf einer Kugel r (y gestreckt mit sy). Liefert Randring."""
    ringe_v = []
    for k in range(ringe + 1):
        z = z0 + (z1 - z0) * k / ringe
        rr = math.sqrt(max(0.0, r * r - z * z))
        if k == ringe: rr = 0.0
        if k == ringe:
            ringe_v.append([bm.verts.new((0, 0, spitze if spitze else z))]); continue
        ringe_v.append([bm.verts.new((rr * math.cos(2 * math.pi * i / seg), sy * rr * math.sin(2 * math.pi * i / seg), z)) for i in range(seg)])
    for k in range(ringe):
        a, b = ringe_v[k], ringe_v[k + 1]
        for i in range(seg):
            j = (i + 1) % seg
            f = bm.faces.new((a[i], a[j], b[0])) if len(b) == 1 else bm.faces.new((a[i], a[j], b[j], b[i]))
            f.material_index = mi
    return ringe_v[0]


def _platte(bm, pts, dicke, mi):
    """Flache Platte (Umriss pts in Weltlage, Normale ungefähr −Y) mit Dicke nach +Y."""
    v0 = [bm.verts.new(p) for p in pts]
    v1 = [bm.verts.new(Vector(p) + Vector((0, dicke, 0))) for p in pts]
    bm.faces.new(v0).material_index = mi
    bm.faces.new(list(reversed(v1))).material_index = mi
    n = len(pts)
    for i in range(n):
        j = (i + 1) % n
        bm.faces.new((v0[i], v1[i], v1[j], v0[j])).material_index = mi


def _kasten(bm, mitte, groesse, mi, dreh=None):
    m = Matrix.Translation(mitte) @ (dreh.to_4x4() if dreh else Matrix.Identity(4)) @ Matrix.Diagonal((*groesse, 1))
    r = bmesh.ops.create_cube(bm, size=1.0, matrix=m)
    for f in {f for v in r["verts"] for f in v.link_faces}: f.material_index = mi


def helm(art, name):
    """art: montefortino | pilos | thraker | sehnen. Kalottenradius 0,115 m."""
    bm = bmesh.new(); r = 0.115
    if art == "haar":   # dichter Haarschopf (Kelten, ohne Helm)
        mats = [mat("haar_schopf", (0.09, 0.05, 0.02), 0, 0.95)]
        _kugelkappe(bm, r * 1.07, 1.12, -0.06, r * 1.07, mi=0)
        return _obj(name, bm, mats), r
    if art == "sehnen":
        mats = [mat("sehne", (0.09, 0.06, 0.035), 0, 0.9), mat("busch_dunkel", (0.04, 0.035, 0.03), 0, 0.95)]
        _kugelkappe(bm, r * 1.04, 1.08, -0.02, r * 1.04, mi=0)
        _kasten(bm, Vector((0, 0.0, r + 0.03)), (0.018, 0.14, 0.06), 1)
        return _obj(name, bm, mats), r
    met = BRONZE
    mats = [mat("bronze", *met), mat("busch_rot", (0.35, 0.03, 0.02), 0, 0.95), mat("busch_schwarz", (0.02, 0.02, 0.02), 0, 0.95)]
    if art == "pilos":
        # kegelförmiger Pilos mit schmalem Rand
        rand = _kugelkappe(bm, r * 1.06, 1.1, -0.035, r * 1.06, seg=10, ringe=4, mi=0, spitze=r * 1.06 + 0.08)
        return _obj(name, bm, mats), r
    rand = _kugelkappe(bm, r * 1.06, 1.1, -0.035, r * 1.06, mi=0)
    # Knauf (Montefortino) bzw. vorgezogener Scheitel (thrakisch)
    if art == "montefortino":
        _kasten(bm, Vector((0, 0, r + 0.02)), (0.025, 0.025, 0.04), 0)
        # Nackenschirm hinten, Wangenklappen
        _platte(bm, [(-0.07, 0.11, -0.03), (0.07, 0.11, -0.03), (0.08, 0.15, -0.06), (-0.08, 0.15, -0.06)], 0.006, 0)
        for sx in (-1, 1):
            _platte(bm, [(sx * 0.115, -0.04, -0.03), (sx * 0.115, 0.03, -0.03), (sx * 0.105, 0.02, -0.12), (sx * 0.1, -0.03, -0.11)], 0.0, 0)
        # Rosshaarbusch: senkrechter Fächer schwarz-rot
        _kasten(bm, Vector((0, 0.01, r + 0.055)), (0.022, 0.17, 0.11), 2)
        _kasten(bm, Vector((0, -0.005, r + 0.085)), (0.026, 0.13, 0.06), 1)
    elif art == "korinth":   # korinthischer Helm: geschlossener Gesichtsschutz mit Augenschlitzen und Nasenschiene, Kamm
        for sx in (-1, 1):   # Wangenplatten vorn, Spalt in der Mitte (Mund), Augenschlitz oben
            _platte(bm, [(sx * 0.02, -0.118, -0.035), (sx * 0.105, -0.085, -0.03), (sx * 0.1, -0.06, -0.15), (sx * 0.03, -0.1, -0.15)], 0.0, 0)
        _platte(bm, [(-0.012, -0.122, 0.01), (0.012, -0.122, 0.01), (0.01, -0.124, -0.075), (-0.01, -0.124, -0.075)], 0.0, 0)  # Nasenschiene
        _platte(bm, [(-0.07, 0.11, -0.03), (0.07, 0.11, -0.03), (0.06, 0.12, -0.13), (-0.06, 0.12, -0.13)], 0.0, 0)   # Nackenschutz
        _kasten(bm, Vector((0, 0.0, r + 0.045)), (0.02, 0.2, 0.09), 1)   # Rosshaarkamm von vorn nach hinten
    else:  # thraker
        _kasten(bm, Vector((0, -0.04, r + 0.015)), (0.03, 0.09, 0.05), 0, Matrix.Rotation(math.radians(-25), 3, "X"))
        _platte(bm, [(-0.11, -0.115, -0.01), (0.11, -0.115, -0.01), (0.12, -0.16, -0.035), (-0.12, -0.16, -0.035)], 0.004, 0)  # Stirnschirm
        for sx in (-1, 1):
            _platte(bm, [(sx * 0.118, -0.06, -0.02), (sx * 0.118, 0.03, -0.02), (sx * 0.108, 0.02, -0.14), (sx * 0.1, -0.05, -0.13)], 0.0, 0)
        _kasten(bm, Vector((0, 0.01, r + 0.06)), (0.016, 0.14, 0.05), 1)
    return _obj(name, bm, mats), r


def schild(w, h, name, farbe, rand_farbe=BRONZE, mittel=None, woelbung=0.0, zylinder=0.0, buckel=0.05, seg=16, eckig=2.0):
    """Ovaler/runder Schild. w,h Breite/Höhe (m). woelbung: Mitte nach vorn (m, Aspis); zylinder: seitliches Zurückbiegen
    (m an der Kante, Scutum). mittel: Farbe des senkrechten Mittelgrats (Spina) oder None. eckig > 2: abgerundetes Rechteck."""
    bm = bmesh.new()
    mats = [mat(name + "_vorn", farbe, 0, 0.75), mat(name + "_rand", *rand_farbe), mat("schild_innen", *LEDER),
            mat("schild_buckel", *EISEN)]
    if mittel: mats.append(mat(name + "_spina", mittel, 0, 0.7))
    def umriss(t, s):  # t 0..1 vom Zentrum, s Winkel -> Punkt auf Vorderseite
        c, si = math.cos(s), math.sin(s)
        k = (abs(c) ** eckig + abs(si) ** eckig) ** (-1 / eckig)
        x, z = 0.5 * w * t * k * c, 0.5 * h * t * k * si
        y = -woelbung * (1 - t * t) + zylinder * (2 * x / w) ** 2
        return Vector((x, y, z))
    ts = [0.0, 0.13, 0.55, 0.88, 1.0]
    vorn = []
    for t in ts:
        if t == 0: vorn.append([bm.verts.new(umriss(0, 0) + Vector((0, -buckel, 0)))]); continue
        vorn.append([bm.verts.new(umriss(t, 2 * math.pi * i / seg)) for i in range(seg)])
    hinten_rand = [bm.verts.new(v.co + Vector((0, 0.02, 0))) for v in vorn[-1]]
    hinten_mitte = bm.verts.new(umriss(0, 0) + Vector((0, 0.02 + zylinder * 0.3, 0)))
    for k in range(len(ts) - 1):
        a, b = vorn[k], vorn[k + 1]
        for i in range(seg):
            j = (i + 1) % seg
            if len(a) == 1:
                f = bm.faces.new((a[0], b[i], b[j])); f.material_index = 3
            else:
                f = bm.faces.new((a[i], b[i], b[j], a[j])); f.material_index = 1 if k == len(ts) - 2 else 0
    for i in range(seg):
        j = (i + 1) % seg
        bm.faces.new((vorn[-1][i], hinten_rand[i], hinten_rand[j], vorn[-1][j])).material_index = 1
        bm.faces.new((hinten_mitte, hinten_rand[j], hinten_rand[i])).material_index = 2
    if mittel:   # Spina: schmale Leiste über die ganze Höhe
        for z0, z1 in ((-0.5 * h * 0.9, -0.06), (0.06, 0.5 * h * 0.9)):
            p0 = umriss(abs(z0) / (0.5 * h), math.pi / 2 * (1 if z0 > 0 else -1)); p1 = umriss(abs(z1) / (0.5 * h), math.pi / 2 * (1 if z1 > 0 else -1))
            _kasten(bm, Vector((0, (p0.y + p1.y) / 2 - 0.012, (z0 + z1) / 2)), (0.05, 0.02, abs(z1 - z0)), 4)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return _obj(name, bm, mats)


def bogen(name, laenge=1.15):
    """Kompositbogen (Reflexbogen): Griff im Ursprung, Wurfarme entlang ±Z, Bauch nach −Y (Sehne liegt bei +Y)."""
    bm = bmesh.new()
    mats = [mat("bogen_horn", (0.16, 0.09, 0.04), 0, 0.6), mat("sehne", (0.6, 0.55, 0.45), 0, 0.9)]
    n = 6; pts = []
    for k in range(-n, n + 1):
        t = k / n; z = t * laenge / 2
        y = -0.07 * (1 - t * t) + 0.05 * abs(t) ** 3   # Bogen nach vorn gewölbt, Enden zurückgebogen (Reflex)
        pts.append(Vector((0, y, z)))
    for a, b in zip(pts, pts[1:]):
        m = (a + b) / 2; d = b - a; L = d.length
        R = Vector((0, 0, 1)).rotation_difference(d.normalized()).to_matrix()
        _kasten(bm, m, (0.018, 0.022, L * 1.05), 0, R)
    _kasten(bm, Vector((0, pts[0].y + 0.002, 0)), (0.004, 0.004, laenge * 0.98), 1)   # Sehne (gerade, zwischen den Enden)
    return _obj(name, bm, mats)


def koecher(name):
    """Köcher mit Pfeilen: Unterkante im Ursprung, entlang +Z (0,6 m)."""
    bm = bmesh.new()
    mats = [mat("koecher_leder", (0.22, 0.12, 0.05), 0, 0.85), mat("pfeil_feder", (0.55, 0.5, 0.42), 0, 0.9)]
    r = bmesh.ops.create_cone(bm, cap_ends=True, segments=6, radius1=0.045, radius2=0.055, depth=0.6, matrix=Matrix.Translation((0, 0, 0.3)))
    for f in {f for v in r["verts"] for f in v.link_faces}: f.material_index = 0
    for dx, dy in ((-0.02, 0), (0.02, 0.01), (0, -0.02)):
        _kasten(bm, Vector((dx, dy, 0.66)), (0.012, 0.03, 0.12), 1)   # Federn
    return _obj(name, bm, mats)


def schwert(art, name):
    """art: gladius | falcata | lang. Griffmitte im Ursprung, Klinge +Z."""
    bm = bmesh.new()
    mats = [mat("klinge", (0.55, 0.56, 0.58), 0.95, 0.3), mat("griff", *HOLZ), mat("beschlag", *BRONZE)]
    L, B = {"gladius": (0.5, 0.055), "falcata": (0.47, 0.05), "lang": (0.75, 0.05)}[art]
    n = 4
    ringe = []
    for k in range(n + 1):
        t = k / n; z = 0.06 + t * L
        b = B * (1 - t ** 3 * 0.85) if art != "falcata" else B * (0.8 + 0.5 * math.sin(t * math.pi * 0.9)) * (1 - t ** 4)
        x0 = 0.0 if art != "falcata" else -0.07 * math.sin(t * math.pi * 0.85)   # Falcata: Klinge nach vorn gebogen
        if k == n:
            ringe.append([bm.verts.new((x0 + (0.02 if art == "falcata" else 0), 0, z + 0.04))]); continue
        ringe.append([bm.verts.new(p) for p in ((x0 - b / 2, 0, z), (x0, -0.006, z), (x0 + b / 2, 0, z), (x0, 0.006, z))])
    for k in range(n):
        a, c = ringe[k], ringe[k + 1]
        for i in range(4):
            j = (i + 1) % 4
            f = bm.faces.new((a[i], a[j], c[0])) if len(c) == 1 else bm.faces.new((a[i], a[j], c[j], c[i]))
            f.material_index = 0
    bm.faces.new(list(reversed(ringe[0]))).material_index = 0
    # Griff, Handschutz, Knauf
    _kasten(bm, Vector((0, 0, -0.02)), (0.028, 0.028, 0.11), 1)
    if art == "gladius":
        _kasten(bm, Vector((0, 0, 0.045)), (0.075, 0.035, 0.02), 1)      # ovaler Holz-Handschutz
        _kasten(bm, Vector((0, 0, -0.09)), (0.045, 0.04, 0.035), 1)      # Kugelknauf
    elif art == "falcata":
        _kasten(bm, Vector((0, 0, 0.045)), (0.05, 0.02, 0.015), 2)
        _kasten(bm, Vector((0.03, 0, -0.085)), (0.07, 0.015, 0.025), 2, Matrix.Rotation(math.radians(35), 3, "Y"))  # Hakengriff
    else:
        _kasten(bm, Vector((0, 0, 0.045)), (0.09, 0.025, 0.018), 2)      # Parierstange (La Tène, kurz)
        _kasten(bm, Vector((0, 0, -0.085)), (0.04, 0.03, 0.02), 2)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return _obj(name, bm, mats)
