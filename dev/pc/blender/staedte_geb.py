# Städte Roms (S1.1): Gebäude als Low-Poly-Modelle per Skript, ohne Texturen (Farbe je Ecke, flache Schattierung).
# Maßstab: 1 Einheit = 1 Spielfeld. Ursprung = Mitte der Grundfläche am Boden. Vorderseite (Tür) zeigt nach −Blender-y
# (= +z in three.js, zur Kamera). Ausgabe JSON (three.js-Koordinaten: x, y oben, z = −Blender-y):
#   {"format": "staedte_geb_v1", "teile": {name: {pos, col, r, h, anh?}}}
#   pos = Dreiecke ohne Index (je 3 Ecken), col = sRGB 0..255 je Ecke, r = halbe größte Grundseite, h = Höhe,
#   anh = bewegliche Anbauteile [{t: teilname, p: [x, y, z], dreh: Umdrehungen/s um die Hochachse}].
# Aufruf (PC): blender.exe -b -P staedte_geb.py -- ../../../models/staedte_geb.json
import bpy, bmesh, math, json, sys
from contextlib import contextmanager
from mathutils import Vector, Euler, noise

a = sys.argv[sys.argv.index("--") + 1:]
OUT = a[0]
TEILE = {}

PAL = dict(
    putz=(0.62, 0.55, 0.45), putz_hell=(0.72, 0.67, 0.56), ocker=(0.55, 0.33, 0.14), rot=(0.42, 0.1, 0.06),
    dach=(0.46, 0.17, 0.08), dach_dunkel=(0.33, 0.11, 0.05), holz=(0.27, 0.17, 0.08), holz_hell=(0.47, 0.34, 0.18),
    dunkel=(0.04, 0.03, 0.02), stein=(0.45, 0.42, 0.36), stein_hell=(0.63, 0.61, 0.55), stroh=(0.5, 0.4, 0.19),
    lehm=(0.44, 0.26, 0.13), lehmwand=(0.5, 0.39, 0.25), backstein=(0.48, 0.2, 0.1), erde=(0.24, 0.16, 0.09),
    wasser=(0.12, 0.27, 0.37), stoff_rot=(0.5, 0.1, 0.06), stoff_blau=(0.13, 0.22, 0.36), stoff_ocker=(0.62, 0.42, 0.12),
    stoff_hell=(0.7, 0.66, 0.56), korn=(0.62, 0.5, 0.22), brot=(0.45, 0.25, 0.09), gruen=(0.19, 0.3, 0.1),
    obst=(0.55, 0.2, 0.08), fell=(0.32, 0.27, 0.22), eisen=(0.2, 0.2, 0.21), bronze=(0.35, 0.25, 0.1))
NAMEN = list(PAL); MI = {n: i for i, n in enumerate(NAMEN)}
WAND = {MI[n] for n in ("putz", "putz_hell", "lehmwand", "ocker", "backstein", "stein")}

# ---------- Lage (Verschieben/Drehen ganzer Gruppen) ----------
LAGE = [(Vector((0, 0, 0)), 0.0)]

@contextmanager
def lage(d=(0, 0, 0), rz=0.0):
    p0, r0 = LAGE[-1]; off = Vector(d); off.rotate(Euler((0, 0, r0)))
    LAGE.append((p0 + off, r0 + rz)); yield; LAGE.pop()

def W(p):
    p0, r0 = LAGE[-1]; q = Vector(p); q.rotate(Euler((0, 0, r0))); return q + p0

def _mi(verts, mi):
    for f in {f for v in verts for f in v.link_faces}: f.material_index = MI[mi]

# ---------- Grundformen ----------
def kasten(bm, m, g, mi, rx=0.0, ry=0.0, rz=0.0):
    r = bmesh.ops.create_cube(bm, size=1.0); e = Euler((rx, ry, rz))
    for v in r["verts"]:
        p = Vector((v.co.x * g[0], v.co.y * g[1], v.co.z * g[2])); p.rotate(e); v.co = W(p + Vector(m))
    _mi(r["verts"], mi)

def stamm(bm, a, b, r, mi, seg=6, r2=None):
    """Zylinder/Kegel von Punkt a nach b."""
    a = Vector(a); d = Vector(b) - a; h = d.length
    res = bmesh.ops.create_cone(bm, cap_ends=True, segments=seg, radius1=r, radius2=max(0.001, r if r2 is None else r2), depth=h)
    q = Vector((0, 0, 1)).rotation_difference(d)
    for v in res["verts"]: v.co = W(q @ (v.co + Vector((0, 0, h / 2))) + a)
    _mi(res["verts"], mi)

def zyl(bm, m, r1, r2, h, mi, seg=8):
    m = Vector(m); stamm(bm, m, m + Vector((0, 0, h)), r1, mi, seg, r2)

def poly(bm, pts, mi):
    bm.faces.new([bm.verts.new(W(p)) for p in pts]).material_index = MI[mi]

def kuppel(bm, m, r, h, mi, seg=10, ringe=3, rauh=0.0, seed=0):
    m = Vector(m); off = Vector((seed * 1.3, seed * 0.7, 0))
    def P(x, y, z):
        k = 1 + rauh * noise.noise(Vector((x, y, z)) * 6 + off) if rauh else 1
        return bm.verts.new(W(m + Vector((x * k, y * k, z * k))))
    rr = []
    for k in range(ringe):
        w = (math.pi / 2) * k / ringe
        rr.append([P(r * math.cos(w) * math.cos(2 * math.pi * i / seg), r * math.cos(w) * math.sin(2 * math.pi * i / seg), h * math.sin(w)) for i in range(seg)])
    top = P(0, 0, h); fs = []
    for k in range(ringe - 1):
        for i in range(seg):
            j = (i + 1) % seg; fs.append(bm.faces.new((rr[k][i], rr[k][j], rr[k + 1][j], rr[k + 1][i])))
    for i in range(seg):
        j = (i + 1) % seg; fs.append(bm.faces.new((rr[-1][i], rr[-1][j], top)))
    for f in fs: f.material_index = MI[mi]

def pultdach(bm, x0, x1, ya, za, yb, zb, mi, dicke=0.035, rippe=None, abstand=0.1):
    """Dachfläche von der Linie (ya, za) zur Linie (yb, zb), Breite x0..x1; rippe = Farbe der Hohlziegel-Reihen."""
    d = Vector((0, yb - ya, zb - za)); L = d.length; ang = math.atan2(zb - za, yb - ya)
    n = Vector((0, -math.sin(ang), math.cos(ang)))
    if n.z < 0: n = -n
    mitte = Vector(((x0 + x1) / 2, (ya + yb) / 2, (za + zb) / 2))
    kasten(bm, mitte + n * (dicke / 2), (x1 - x0, L, dicke), mi, rx=ang)
    if rippe:
        k = max(2, int((x1 - x0) / abstand))
        for i in range(k):
            x = x0 + (i + 0.5) * (x1 - x0) / k
            kasten(bm, Vector((x, mitte.y, mitte.z)) + n * (dicke + 0.011), (0.034, L, 0.024), rippe, rx=ang)

def satteldach(bm, cx, cy, z, Wh, T, dh, mi, giebel, ue=0.07, dicke=0.035, rippe="dach", first=None):
    """Satteldach, First entlang x. Wh/T = halbe Wandlänge/-tiefe, z = Traufhöhe an der Wand, dh = Firsthöhe darüber."""
    s = dh / T; za = z - ue * s; zt = z + dh
    pultdach(bm, cx - Wh - ue, cx + Wh + ue, cy - T - ue, za, cy, zt, mi, dicke, rippe)
    pultdach(bm, cx - Wh - ue, cx + Wh + ue, cy + T + ue, za, cy, zt, mi, dicke, rippe)
    poly(bm, [(cx + Wh, cy - T, z), (cx + Wh, cy + T, z), (cx + Wh, cy, zt)], giebel)
    poly(bm, [(cx - Wh, cy + T, z), (cx - Wh, cy - T, z), (cx - Wh, cy, zt)], giebel)
    kasten(bm, (cx, cy, zt + dicke * 0.9), (2 * (Wh + ue), 0.06, 0.05), first or mi)

def amphore(bm, m, mi="ocker", s=1.0):
    x, y, z = m
    zyl(bm, (x, y, z), 0.012 * s, 0.035 * s, 0.05 * s, mi, 6)
    zyl(bm, (x, y, z + 0.05 * s), 0.035 * s, 0.02 * s, 0.05 * s, mi, 6)
    zyl(bm, (x, y, z + 0.1 * s), 0.012 * s, 0.014 * s, 0.025 * s, mi, 6)

def korb(bm, m, inhalt, r=0.05):
    x, y, z = m
    zyl(bm, (x, y, z), r * 0.8, r, r * 0.8, "holz_hell", 7)
    zyl(bm, (x, y, z + r * 0.8), r * 0.95, r * 0.6, r * 0.35, inhalt, 7)

def tuer(bm, x, y, b, h, rahmen="holz", z0=0.0):
    """Tür in einer Wand bei y (Vorderseite), dunkle Öffnung mit Rahmen."""
    kasten(bm, (x, y - 0.006, z0 + h / 2), (b, 0.014, h), "dunkel")
    for sx in (-1, 1): kasten(bm, (x + sx * (b / 2 + 0.015), y - 0.012, z0 + h / 2), (0.03, 0.024, h + 0.02), rahmen)
    kasten(bm, (x, y - 0.012, z0 + h + 0.02), (b + 0.08, 0.026, 0.035), rahmen)

def fenster(bm, x, y, z, b=0.12, h=0.1):
    kasten(bm, (x, y - 0.006, z), (b, 0.014, h), "dunkel")

def fenster_x(bm, x, y, z, b=0.12, h=0.1):
    kasten(bm, (x + 0.006, y, z), (0.014, b, h), "dunkel")

# ---------- Ablegen ----------
def srgb(c): return [max(0, min(255, round(255 * (x ** (1 / 2.2))))) for x in c]

def ablegen(name, bm, anh=None):
    bm.normal_update()
    pos, col = [], []; lo = Vector((9, 9, 9)); hi = Vector((-9, -9, -9))
    for f in bm.faces:
        mi = f.material_index; c = PAL[NAMEN[mi]]; vs = f.verts[:]
        for k in range(1, len(vs) - 1):
            for v in (vs[0], vs[k], vs[k + 1]):
                p = v.co
                g = 0.9 + 0.12 * noise.noise(p * 6.0)
                if mi in WAND and p.z < 0.1: g *= 0.82 + 1.8 * p.z          # Spritzwasser/Schmutz am Sockel
                if mi == MI["stroh"]: g *= 0.85 + 0.25 * min(1, p.z / 1.0)
                pos += [round(p.x, 3), round(p.z, 3), round(-p.y, 3)]; col += srgb(tuple(x * g for x in c))
                lo = Vector(map(min, lo, p)); hi = Vector(map(max, hi, p))
    t = dict(pos=pos, col=col, r=round(max(-lo.x, hi.x, -lo.y, hi.y), 3), h=round(hi.z, 3))
    if anh: t["anh"] = anh
    TEILE[name] = t; bm.free()
    print("TEIL %-16s %5d Dreiecke  x %.2f..%.2f  y %.2f..%.2f  h %.2f" % (name, len(pos) // 9, lo.x, hi.x, lo.y, hi.y, hi.z))

def zu3(p): return [round(p[0], 3), round(p[2], 3), round(-p[1], 3)]

# ---------- Gebäude ----------
def huette():
    """Plebejer-Hütte: Flechtwerk mit Lehm, Fachwerkpfosten, Strohdach, Holzstapel, Flechtzaun."""
    bm = bmesh.new()
    kasten(bm, (0, 0.1, 0.03), (1.5, 1.2, 0.06), "stein")
    kasten(bm, (0, 0.1, 0.31), (1.4, 1.1, 0.5), "lehmwand")
    for x in (-0.7, 0.7):
        for y in (-0.45, 0.65): kasten(bm, (x, y, 0.31), (0.06, 0.06, 0.5), "holz")
    for x in (-0.1, 0.42): kasten(bm, (x, -0.455, 0.31), (0.045, 0.02, 0.5), "holz")
    kasten(bm, (0, -0.458, 0.56), (1.42, 0.03, 0.04), "holz")
    tuer(bm, 0.16, -0.45, 0.22, 0.38, z0=0.06)
    fenster(bm, -0.4, -0.45, 0.38, 0.16, 0.12); fenster_x(bm, 0.7, 0.1, 0.38, 0.16, 0.12)
    satteldach(bm, 0, 0.1, 0.56, 0.7, 0.55, 0.48, "stroh", "lehmwand", ue=0.14, dicke=0.08, rippe=None, first="holz_hell")
    for i, (x, z) in enumerate(((0.77, 0.045), (0.85, 0.045), (0.81, 0.12))):     # Holzstapel an der Seite
        stamm(bm, (x, -0.35, z), (x, 0.45, z), 0.04, "holz_hell" if i % 2 else "holz", 6)
    for x in (-0.82, -0.55, -0.28):                                             # Flechtzaun vorn links
        kasten(bm, (x, -0.78, 0.1), (0.03, 0.03, 0.2), "holz")
    kasten(bm, (-0.55, -0.78, 0.12), (0.56, 0.02, 0.12), "holz_hell")
    amphore(bm, (0.42, -0.6, 0.0), "ocker", 1.2)
    kasten(bm, (-0.2, -0.62, 0.05), (0.3, 0.08, 0.02), "holz_hell"); kasten(bm, (-0.2, -0.62, 0.025), (0.26, 0.05, 0.05), "holz")
    ablegen("huette", bm)

def casa():
    """Casa: verputztes Wohnhaus mit Ziegeldach, Sockelanstrich, Hof mit Mauer, Tor, Laube und Baum."""
    bm = bmesh.new()
    kasten(bm, (0, 0.45, 0.4), (1.6, 0.8, 0.8), "putz")
    kasten(bm, (0, 0.45, 0.09), (1.62, 0.82, 0.18), "ocker")
    satteldach(bm, 0, 0.45, 0.8, 0.8, 0.4, 0.3, "dach_dunkel", "putz")
    tuer(bm, 0.25, 0.05, 0.22, 0.42)
    for x in (-0.5, -0.15, 0.6): fenster(bm, x, 0.05, 0.62, 0.11, 0.12)
    for y in (0.3, 0.62): fenster_x(bm, 0.8, y, 0.55, 0.12, 0.14)
    # Laube vor dem Haus (links): Pfosten, Pultdach
    for x in (-0.78, -0.12): kasten(bm, (x, -0.22, 0.25), (0.04, 0.04, 0.5), "holz")
    pultdach(bm, -0.82, -0.08, -0.26, 0.5, 0.05, 0.62, "dach_dunkel", 0.03, "dach")
    # Hofmauer mit Ziegelabdeckung und Tor
    for x0, x1 in ((-0.84, 0.06), (0.44, 0.84)):
        kasten(bm, ((x0 + x1) / 2, -0.81, 0.17), (x1 - x0, 0.06, 0.34), "putz_hell")
        kasten(bm, ((x0 + x1) / 2, -0.81, 0.355), (x1 - x0 + 0.02, 0.09, 0.03), "dach")
    for sx in (-1, 1):
        kasten(bm, (sx * 0.81, -0.38, 0.17), (0.06, 0.86, 0.34), "putz_hell")
        kasten(bm, (sx * 0.81, -0.38, 0.355), (0.09, 0.88, 0.03), "dach")
    for x in (0.06, 0.44): kasten(bm, (x, -0.81, 0.22), (0.08, 0.08, 0.44), "putz_hell")
    kasten(bm, (0.25, -0.81, 0.45), (0.46, 0.1, 0.04), "dach")
    kasten(bm, (0, -0.38, 0.008), (1.56, 0.82, 0.016), "stein_hell")
    stamm(bm, (-0.45, -0.5, 0), (-0.45, -0.5, 0.35), 0.03, "holz", 5)          # Baum im Hof
    kuppel(bm, (-0.45, -0.5, 0.3), 0.2, 0.3, "gruen", 7, 3, 0.25, 1)
    kuppel(bm, (-0.45, -0.5, 0.33), 0.16, -0.06, "gruen", 7, 2)
    amphore(bm, (0.6, -0.6, 0.016), "ocker"); amphore(bm, (0.68, -0.52, 0.016), "rot")
    ablegen("casa", bm)

def mola_dreh():
    """Oberer Mühlstein (catillus) mit Zugbalken und Esel; dreht sich um die Hochachse."""
    bm = bmesh.new()
    zyl(bm, (0, 0, 0.12), 0.11, 0.055, 0.1, "stein", 9)
    zyl(bm, (0, 0, 0.22), 0.055, 0.11, 0.1, "stein", 9)
    stamm(bm, (-0.16, 0, 0.22), (0.36, 0, 0.22), 0.014, "holz", 5)
    with lage((0.38, 0, 0)):                                                    # Esel, läuft in +y
        kasten(bm, (0, 0, 0.14), (0.07, 0.17, 0.08), "fell")
        for sx in (-1, 1):
            for sy in (-1, 1): kasten(bm, (sx * 0.022, sy * 0.06, 0.05), (0.02, 0.02, 0.1), "fell")
        kasten(bm, (0, 0.1, 0.19), (0.04, 0.05, 0.07), "fell", rx=0.5)
        kasten(bm, (0, 0.135, 0.2), (0.045, 0.07, 0.035), "fell", rx=-0.3)
        for sx in (-1, 1): kasten(bm, (sx * 0.012, 0.1, 0.24), (0.01, 0.012, 0.045), "dunkel")
        stamm(bm, (0, -0.085, 0.16), (0, -0.11, 0.08), 0.008, "dunkel", 4)
    ablegen("mola_dreh", bm)

def muehle():
    """Römische Mühle: Mühlhaus mit Ziegeldach, gepflasterter Hof mit zwei Esel-Mühlen (molae), Getreidesäcke."""
    bm = bmesh.new()
    kasten(bm, (0, 0.45, 0.35), (1.5, 0.8, 0.7), "putz")
    kasten(bm, (0, 0.45, 0.07), (1.52, 0.82, 0.14), "stein")
    satteldach(bm, 0, 0.45, 0.7, 0.75, 0.4, 0.28, "dach_dunkel", "putz")
    tuer(bm, 0.3, 0.05, 0.3, 0.46)
    for x in (-0.45, -0.1): fenster(bm, x, 0.05, 0.52, 0.12, 0.1)
    fenster_x(bm, 0.75, 0.45, 0.5, 0.14, 0.1)
    kasten(bm, (0, -0.4, 0.01), (1.7, 0.92, 0.02), "stein")
    molae = [(-0.42, -0.42), (0.42, -0.42)]
    for x, y in molae:
        zyl(bm, (x, y, 0.02), 0.17, 0.16, 0.06, "stein_hell", 10)
        zyl(bm, (x, y, 0.08), 0.13, 0.12, 0.04, "stein", 10)
        zyl(bm, (x, y, 0.12), 0.1, 0.02, 0.15, "stein", 9)
    for i, (x, y) in enumerate(((0.62, -0.01), (0.7, -0.03), (0.66, 0.0))):      # Säcke an der Wand
        kasten(bm, (x, y - 0.05, 0.05 + (0.07 if i == 2 else 0)), (0.08, 0.07, 0.09), "stoff_hell", rz=0.3 * i)
    ablegen("muehle", bm, [dict(t="mola_dreh", p=zu3((x, y, 0.0)), dreh=0.12 + 0.03 * i) for i, (x, y) in enumerate(molae)])

def baeckerei():
    """Bäckerei: Haus mit Verkaufstresen und Vordach, gewölbter Backofen, Brotlaibe, Holzvorrat."""
    bm = bmesh.new()
    kasten(bm, (-0.15, 0.4, 0.35), (1.3, 0.9, 0.7), "putz")
    kasten(bm, (-0.15, 0.4, 0.08), (1.32, 0.92, 0.16), "ocker")
    satteldach(bm, -0.15, 0.4, 0.7, 0.65, 0.45, 0.3, "dach_dunkel", "putz")
    kasten(bm, (-0.38, -0.056, 0.26), (0.62, 0.014, 0.36), "dunkel")               # offene Ladenfront
    kasten(bm, (-0.38, -0.13, 0.1), (0.66, 0.12, 0.2), "stein_hell")               # Tresen
    for i in range(5): zyl(bm, (-0.62 + i * 0.12, -0.13, 0.2), 0.04, 0.035, 0.025, "brot", 7)
    for x in (-0.74, -0.02): kasten(bm, (x, -0.36, 0.23), (0.035, 0.035, 0.46), "holz")
    pultdach(bm, -0.8, 0.04, -0.4, 0.44, -0.05, 0.55, "dach_dunkel", 0.03, "dach")
    fenster(bm, 0.25, -0.05, 0.52, 0.12, 0.1)
    kasten(bm, (0.505, 0.45, 0.25), (0.014, 0.22, 0.42), "dunkel")
    kasten(bm, (0.6, -0.4, 0.04), (0.6, 0.6, 0.08), "stein")                       # Backofen
    kuppel(bm, (0.6, -0.4, 0.08), 0.26, 0.28, "backstein", 10, 3)
    kasten(bm, (0.6, -0.66, 0.16), (0.12, 0.05, 0.09), "dunkel")
    kasten(bm, (0.6, -0.69, 0.215), (0.16, 0.03, 0.03), "backstein")
    zyl(bm, (0.6, -0.4, 0.3), 0.04, 0.035, 0.12, "backstein", 6)
    for i, (y, z) in enumerate(((0.05, 0.04), (0.14, 0.04), (0.095, 0.11))):        # Holz für den Ofen
        stamm(bm, (0.62, y, z), (0.86, y, z), 0.035, "holz_hell" if i % 2 else "holz", 6)
    korb(bm, (0.25, -0.3, 0), "brot", 0.05)
    ablegen("baeckerei", bm)

def markt():
    """Markt (macellum): Pflasterplatz, runder Tholos mit Säulen und Brunnen, vier Stände mit Sonnendächern."""
    bm = bmesh.new()
    kasten(bm, (0, 0, 0.012), (2.76, 2.76, 0.024), "stein")
    kasten(bm, (0, 0, 0.03), (2.6, 2.6, 0.02), "stein_hell")
    zyl(bm, (0, 0, 0.04), 0.44, 0.44, 0.06, "stein", 12)
    for i in range(6):
        w = 2 * math.pi * i / 6 + 0.3
        zyl(bm, (0.34 * math.cos(w), 0.34 * math.sin(w), 0.1), 0.032, 0.028, 0.44, "stein_hell", 6)
    zyl(bm, (0, 0, 0.54), 0.42, 0.42, 0.05, "stein_hell", 12)
    zyl(bm, (0, 0, 0.59), 0.46, 0.02, 0.24, "dach", 12)
    zyl(bm, (0, 0, 0.1), 0.18, 0.18, 0.06, "stein_hell", 10)
    zyl(bm, (0, 0, 0.16), 0.15, 0.15, 0.003, "wasser", 10)
    STOFF = ["stoff_rot", "stoff_blau", "stoff_ocker", "stoff_hell"]
    WARE = [("korn", "obst"), ("gruen", "brot"), ("obst", "korn"), ("brot", "gruen")]
    for i, (sx, sy) in enumerate(((-1, -1), (1, -1), (1, 1), (-1, 1))):
        with lage((sx * 0.86, sy * 0.86, 0.04), math.atan2(-sx, sy)):
            kasten(bm, (0, 0.06, 0.09), (0.62, 0.22, 0.18), "holz")
            kasten(bm, (0, 0.06, 0.185), (0.66, 0.26, 0.015), "holz_hell")
            for px in (-0.34, 0.34):
                kasten(bm, (px, -0.16, 0.19), (0.025, 0.025, 0.38), "holz")
                kasten(bm, (px, 0.26, 0.23), (0.025, 0.025, 0.46), "holz")
            pultdach(bm, -0.38, 0.38, -0.2, 0.38, 0.3, 0.46, STOFF[i], 0.012)
            korb(bm, (-0.18, 0.04, 0.19), WARE[i][0], 0.06); korb(bm, (0.04, 0.08, 0.19), WARE[i][1], 0.05)
            amphore(bm, (0.24, 0.05, 0.19), "ocker", 0.9)
            amphore(bm, (0.3, 0.36, 0.0), "rot"); amphore(bm, (0.2, 0.4, 0.0), "ocker")
            kasten(bm, (-0.25, 0.38, 0.05), (0.12, 0.1, 0.1), "holz_hell", rz=0.2)
    ablegen("markt", bm)

def speicher():
    """Speicher (horreum): langer Bau auf Steinsockel, Strebepfeiler, schmale Lüftungsschlitze, Treppe, Säcke."""
    bm = bmesh.new()
    kasten(bm, (0, 0.08, 0.05), (2.6, 1.4, 0.1), "stein")
    kasten(bm, (0, 0.1, 0.48), (2.4, 1.2, 0.76), "putz")
    satteldach(bm, 0, 0.1, 0.86, 1.2, 0.6, 0.3, "dach_dunkel", "putz")
    for k in range(7):
        x = -1.2 + k * 0.4
        for y in (-0.53, 0.73): kasten(bm, (x, y, 0.44), (0.09, 0.07, 0.68), "stein")
        if k < 6 and abs(x + 0.2) > 0.25:
            fenster(bm, x + 0.2, -0.5, 0.72, 0.04, 0.16)
    for y in (-0.2, 0.1, 0.4):
        kasten(bm, (1.23, y, 0.44), (0.07, 0.09, 0.68), "stein")
    for y in (-0.05, 0.25, 0.55): fenster_x(bm, 1.2, y, 0.72, 0.04, 0.16)
    kasten(bm, (0, -0.506, 0.36), (0.36, 0.014, 0.52), "dunkel")
    for sx in (-1, 1): kasten(bm, (sx * 0.21, -0.515, 0.36), (0.06, 0.03, 0.54), "stein_hell")
    kasten(bm, (0, -0.515, 0.64), (0.5, 0.035, 0.06), "stein_hell")
    kasten(bm, (0, -0.66, 0.035), (0.56, 0.12, 0.07), "stein_hell")
    kasten(bm, (0, -0.74, 0.018), (0.56, 0.08, 0.036), "stein")
    for i, (x, y) in enumerate(((-0.55, -0.72), (-0.45, -0.75), (-0.5, -0.66))):
        kasten(bm, (x, y, 0.05 + (0.06 if i == 2 else 0)), (0.09, 0.07, 0.08), "stoff_hell", rz=0.4 * i)
    for x in (0.5, 0.6, 0.7): amphore(bm, (x, -0.72, 0.0), "ocker")
    kasten(bm, (0.95, -0.7, 0.06), (0.14, 0.14, 0.12), "holz_hell"); kasten(bm, (1.1, -0.72, 0.05), (0.12, 0.12, 0.1), "holz_hell", rz=0.4)
    ablegen("speicher", bm)

def holzfaeller():
    """Holzfäller: Blockhütte mit Brettdach, Stammstapel, Hackklotz mit Axt, Sägebock."""
    bm = bmesh.new()
    kasten(bm, (-0.35, 0.42, 0.25), (0.9, 0.75, 0.5), "holz")
    for k in range(5):                                                          # Balkenlagen an der Front
        z = 0.06 + k * 0.1
        stamm(bm, (-0.82, 0.04, z), (0.12, 0.04, z), 0.03, "holz", 5)
        stamm(bm, (0.1, 0.0, z), (0.1, 0.84, z), 0.03, "holz", 5)
    satteldach(bm, -0.35, 0.42, 0.5, 0.45, 0.375, 0.3, "holz_hell", "holz", ue=0.1, dicke=0.03, rippe="holz", first="holz")
    tuer(bm, -0.2, 0.02, 0.2, 0.36)
    fenster(bm, -0.6, 0.02, 0.32, 0.12, 0.1)
    lagen = [(4, 0.055), (3, 0.155), (2, 0.255)]
    for n, z in lagen:                                                          # Stammstapel
        for i in range(n):
            x = 0.42 + (i - (n - 1) / 2) * 0.115
            stamm(bm, (x, -0.8, z), (x, -0.1, z), 0.055, "holz_hell" if (i + n) % 2 else "holz", 7)
    zyl(bm, (-0.45, -0.5, 0), 0.08, 0.075, 0.12, "holz_hell", 8)                # Hackklotz mit Axt
    stamm(bm, (-0.43, -0.5, 0.12), (-0.33, -0.56, 0.3), 0.01, "holz", 4)
    kasten(bm, (-0.425, -0.497, 0.13), (0.06, 0.012, 0.05), "eisen", ry=0.5)
    for i, (x, y) in enumerate(((-0.62, -0.62), (-0.7, -0.5), (-0.58, -0.38))):
        kasten(bm, (x, y, 0.02), (0.06, 0.04, 0.04), "holz_hell", rz=i)
    for sy in (-1, 1):                                                          # Sägebock mit Stamm
        for sx in (-1, 1): kasten(bm, (0.55 + sx * 0.04, 0.42 + sy * 0.2, 0.08), (0.02, 0.02, 0.18), "holz", ry=sx * 0.45)
    stamm(bm, (0.55, 0.1, 0.17), (0.55, 0.8, 0.17), 0.045, "holz_hell", 7)
    zyl(bm, (0.75, 0.0, 0), 0.06, 0.055, 0.05, "holz_hell", 7)
    ablegen("holzfaeller", bm)

def lehmgrube():
    """Lehmgrube: feuchter Grund mit Pfütze, Aushubhaufen am Rand, Bohlenrampe, gestochene Lehmziegel, Spaten, Korb."""
    bm = bmesh.new()
    kasten(bm, (0, 0, 0.006), (1.56, 1.56, 0.012), "lehm")
    kasten(bm, (0.05, 0.0, 0.013), (1.1, 1.0, 0.004), "erde")
    poly(bm, [(-0.25, -0.1, 0.017), (0.0, -0.25, 0.017), (0.25, -0.12, 0.017), (0.2, 0.15, 0.017), (-0.15, 0.2, 0.017)], "wasser")
    for i, (x, y, r, h) in enumerate(((-0.62, 0.55, 0.3, 0.2), (0.0, 0.66, 0.26, 0.16), (0.6, 0.6, 0.28, 0.22),
                                       (-0.68, -0.05, 0.22, 0.14), (0.68, -0.1, 0.2, 0.12), (-0.55, -0.62, 0.2, 0.1))):
        kuppel(bm, (x, y, 0), r * 1.1, h * 0.7, "lehm", 9, 3, 0.1, i + 2)
    kasten(bm, (0.42, -0.5, 0.06), (0.14, 0.5, 0.02), "holz_hell", rx=-0.22)    # Bohlenrampe
    for k in range(3):                                                          # gestochene Lehmziegel
        for i in range(3):
            kasten(bm, (0.05 + i * 0.09, -0.68, 0.02 + k * 0.04), (0.08, 0.12, 0.038), "lehm", rz=0.05 * (k - 1))
    stamm(bm, (0.62, 0.55, 0.12), (0.7, 0.5, 0.38), 0.01, "holz", 4)              # Spaten im Haufen
    kasten(bm, (0.61, 0.555, 0.11), (0.06, 0.012, 0.08), "eisen", rz=-0.5)
    korb(bm, (-0.25, -0.62, 0.0), "lehm", 0.06)
    ablegen("lehmgrube", bm)

def ziegelei():
    """Ziegelei: gewölbter Brennofen mit Schürloch und Kamin, Trockenschuppen mit Rohlingen, Stapel fertiger Ziegel."""
    bm = bmesh.new()
    kasten(bm, (-0.38, 0.38, 0.17), (0.76, 0.74, 0.34), "backstein")
    stamm(bm, (-0.38, 0.01, 0.34), (-0.38, 0.75, 0.34), 0.37, "backstein", 10)
    kasten(bm, (-0.38, -0.005, 0.13), (0.18, 0.02, 0.2), "dunkel")
    kasten(bm, (-0.38, -0.02, 0.245), (0.26, 0.04, 0.04), "stein")
    kasten(bm, (-0.38, 0.62, 0.72), (0.14, 0.14, 0.42), "backstein")
    kasten(bm, (-0.38, 0.62, 0.94), (0.18, 0.18, 0.03), "stein")
    for x in (0.12, 0.82):                                                      # Trockenschuppen
        for y in (-0.05, 0.78): kasten(bm, (x, y, 0.22 if y > 0 else 0.18), (0.035, 0.035, 0.44 if y > 0 else 0.36), "holz")
    pultdach(bm, 0.07, 0.87, -0.1, 0.36, 0.84, 0.46, "dach_dunkel", 0.03, "dach")
    for i in range(3):
        for j in range(2):
            x, y = 0.27 + i * 0.2, 0.15 + j * 0.38
            for k in range(3): kasten(bm, (x, y, 0.035 + k * 0.06), (0.15, 0.24, 0.05), "lehm", rz=0.04 * ((i + j + k) % 3 - 1))
    for x, y, n in ((0.35, -0.55, 4), (0.62, -0.6, 3), (-0.68, -0.5, 2)):        # fertige Ziegel
        for k in range(n): kasten(bm, (x, y, 0.025 + k * 0.05), (0.2, 0.16, 0.045), "backstein", rz=0.06 * (k % 2))
    kuppel(bm, (-0.1, -0.6, 0), 0.18, 0.12, "lehm", 8, 3, 0.25, 9)
    for i, (x, z) in enumerate(((0.05, 0.035), (0.13, 0.035))):
        stamm(bm, (x, -0.2, z), (x, -0.25 - 0.3, z), 0.035, "holz", 6)
    ablegen("ziegelei", bm)

def brunnen():
    """Brunnen (lacus): Steinbecken aus Platten, Brunnenpfeiler mit Bronzekopf und Wasserstrahl, Pflaster."""
    bm = bmesh.new()
    kasten(bm, (0, 0, 0.008), (0.86, 0.86, 0.016), "stein")
    for sy in (-1, 1): kasten(bm, (0, sy * 0.2, 0.1), (0.62, 0.05, 0.18), "stein_hell")
    for sx in (-1, 1): kasten(bm, (sx * 0.285, 0, 0.1), (0.05, 0.36, 0.18), "stein_hell")
    kasten(bm, (0, 0, 0.15), (0.52, 0.36, 0.004), "wasser")
    kasten(bm, (0, 0.27, 0.23), (0.14, 0.1, 0.46), "stein_hell")
    kasten(bm, (0, 0.27, 0.47), (0.17, 0.13, 0.03), "stein")
    kasten(bm, (0, 0.215, 0.33), (0.07, 0.02, 0.07), "bronze")
    kasten(bm, (0, 0.18, 0.3), (0.015, 0.06, 0.012), "bronze")
    kasten(bm, (0, 0.145, 0.22), (0.014, 0.014, 0.16), "wasser")
    amphore(bm, (0.33, -0.3, 0.016), "ocker", 1.1)
    ablegen("brunnen", bm)

for fn in (huette, casa, mola_dreh, muehle, baeckerei, markt, speicher, holzfaeller, lehmgrube, ziegelei, brunnen): fn()
import os; exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'staedte_geb_mehr.py'), encoding='utf-8').read())   # weitere Gebäude (1.11.)
json.dump({"format": "staedte_geb_v1", "teile": TEILE}, open(OUT, "w"), separators=(",", ":"))
print("STAEDTE_GEB", sum(len(t["pos"]) // 9 for t in TEILE.values()), "Dreiecke gesamt")
