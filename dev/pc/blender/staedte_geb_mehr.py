# Städte Roms – weitere Gebäudemodelle (1.11., Cloud). Wird von staedte_geb.py eingelesen und nutzt dessen Grundformen.
# Vorderseite = −y (zur Kamera), 1 Einheit = 1 Feld, Grundfläche innerhalb der Feldgröße mit Rand.

for _n, _c in (('trauben', (0.25, 0.08, 0.2)), ('garum', (0.4, 0.22, 0.08))):
    PAL[_n] = _c; NAMEN.append(_n); MI[_n] = len(NAMEN) - 1

def saeule(bm, x, y, z0, h, r=0.045, mi="stein_hell", seg=6):
    zyl(bm, (x, y, z0), r * 1.3, r * 1.3, 0.04, mi, seg)
    zyl(bm, (x, y, z0 + 0.04), r, r * 0.85, h - 0.08, mi, seg)
    kasten(bm, (x, y, z0 + h - 0.02), (r * 2.8, r * 2.8, 0.04), mi)

def giebeldach_y(bm, cx, cy, z, Wh, T, dh, mi, giebel, ue=0.06):
    """Satteldach mit First entlang y (Giebel vorn/hinten), für Tempel und Hallen."""
    with lage((cx, cy, 0), math.pi / 2):
        satteldach(bm, 0, 0, z, T, Wh, dh, mi, giebel, ue=ue)

def treppe(bm, x, y, b, stufen, h, tiefe, mi="stein_hell"):
    """Freitreppe vor y nach −y, Gesamthöhe h."""
    for k in range(stufen):
        hk = h * (k + 1) / stufen
        kasten(bm, (x, y - tiefe * (stufen - k - 0.5) / stufen, hk / 2), (b, tiefe / stufen, hk), mi)

def insula():
    """Insula: drei Geschosse, Läden mit Bögen unten, Holzbalkon, Ziegeldach."""
    bm = bmesh.new()
    kasten(bm, (0, 0.05, 0.3), (1.7, 1.6, 0.6), "putz")
    kasten(bm, (0, 0.05, 0.95), (1.7, 1.6, 0.7), "putz_hell")
    kasten(bm, (0, 0.05, 1.62), (1.7, 1.6, 0.64), "ocker")
    kasten(bm, (0, 0.05, 0.07), (1.72, 1.62, 0.14), "backstein")
    for x in (-0.55, 0.0, 0.55):                                            # Läden mit Bogen
        kasten(bm, (x, -0.755, 0.24), (0.36, 0.02, 0.42), "dunkel")
        kasten(bm, (x, -0.765, 0.47), (0.42, 0.03, 0.06), "backstein")
        kasten(bm, (x, -0.8, 0.5), (0.44, 0.12, 0.02), "stoff_ocker" if x else "stoff_rot", rx=0.3)
    kasten(bm, (0, -0.83, 0.62), (1.72, 0.18, 0.04), "holz")                # Balkon (maenianum)
    for x in (-0.82, -0.27, 0.27, 0.82): kasten(bm, (x, -0.9, 0.72), (0.03, 0.03, 0.2), "holz")
    kasten(bm, (0, -0.91, 0.8), (1.72, 0.025, 0.03), "holz")
    for z in (0.95, 1.6):
        for x in (-0.6, -0.2, 0.2, 0.6): fenster(bm, x, -0.75, z, 0.12, 0.16)
        for y in (-0.35, 0.1, 0.55): fenster_x(bm, 0.85, y, z, 0.12, 0.16)
    satteldach(bm, 0, 0.05, 1.94, 0.85, 0.8, 0.32, "dach", "ocker", ue=0.06)
    kasten(bm, (0.5, 0.3, 2.3), (0.12, 0.12, 0.3), "backstein")
    ablegen("insula", bm)

def domus():
    """Domus: Atriumhaus, vier Flügel um das Atrium mit Impluvium, Eingang mit Säulen, Peristylgarten hinten."""
    bm = bmesh.new()
    kasten(bm, (0, 0, 0.02), (2.7, 2.7, 0.04), "stein_hell")
    # Vorderhaus mit Atrium (vorne), Peristyl (hinten)
    for (x, y, w, d) in ((-0.95, -0.55, 0.7, 1.5), (0.95, -0.55, 0.7, 1.5), (0, -1.1, 1.2, 0.4), (0, 0.3, 2.6, 0.5)):
        kasten(bm, (x, y, 0.32), (w, d, 0.6), "putz")
        kasten(bm, (x, y, 0.07), (w + 0.02, d + 0.02, 0.1), "ocker")
    satteldach(bm, 0, 0.3, 0.62, 1.3, 0.25, 0.2, "dach", "putz", rippe=None)
    for sx in (-1, 1):
        with lage((sx * 0.95, -0.55, 0), math.pi / 2):
            satteldach(bm, 0, 0, 0.62, 0.75, 0.35, 0.2, "dach", "putz", rippe=None)
    satteldach(bm, 0, -1.1, 0.62, 0.6, 0.2, 0.16, "dach", "putz")
    kasten(bm, (0, -0.55, 0.05), (1.0, 0.9, 0.02), "stein_hell")                # Atrium
    kasten(bm, (0, -0.55, 0.065), (0.42, 0.34, 0.012), "wasser")
    kasten(bm, (0, -0.55, 0.06), (0.5, 0.42, 0.03), "stein")
    tuer(bm, 0, -1.3, 0.24, 0.42)
    for sx in (-1, 1): saeule(bm, sx * 0.22, -1.34, 0.04, 0.5, 0.035)
    kasten(bm, (0, -1.4, 0.56), (0.6, 0.1, 0.05), "stein_hell")
    for x in (-0.5, 0.5): fenster(bm, x, -1.3, 0.45, 0.1, 0.1)
    # Peristyl
    kasten(bm, (0, 0.95, 0.06), (2.2, 0.75, 0.04), "gruen")
    for i in range(4): saeule(bm, -0.9 + i * 0.6, 0.6, 0.04, 0.45, 0.03, seg=5)
    for i in range(4): saeule(bm, -0.9 + i * 0.6, 1.3, 0.04, 0.45, 0.03, seg=5)
    for y in (0.6, 1.32): kasten(bm, (0, y, 0.5), (2.1, 0.08, 0.04), "stein_hell")
    kasten(bm, (0, 1.36, 0.25), (2.6, 0.06, 0.5), "putz_hell")
    for x in (-0.6, 0.6):
        stamm(bm, (x, 0.95, 0.06), (x, 0.95, 0.35), 0.025, "holz", 5)
        kuppel(bm, (x, 0.95, 0.3), 0.16, 0.24, "gruen", 7, 3, 0.25, int(x * 10) + 20)
    kasten(bm, (0, 0.95, 0.09), (0.3, 0.2, 0.04), "wasser")
    ablegen("domus", bm)

def ludus():
    """Schule: Haus mit Säulenvorhalle, Bänke, Schreibtafel."""
    bm = bmesh.new()
    kasten(bm, (0, 0, 0.03), (1.7, 1.6, 0.06), "stein")
    kasten(bm, (0, 0.3, 0.4), (1.5, 0.9, 0.7), "putz_hell")
    satteldach(bm, 0, 0.3, 0.75, 0.75, 0.45, 0.3, "dach", "putz_hell")
    kasten(bm, (0, -0.4, 0.07), (1.5, 0.5, 0.02), "stein_hell")
    for x in (-0.65, -0.22, 0.22, 0.65): saeule(bm, x, -0.58, 0.06, 0.58)
    pultdach(bm, -0.78, 0.78, -0.68, 0.62, -0.15, 0.76, "dach", 0.03, "dach_dunkel")
    tuer(bm, 0, -0.15, 0.24, 0.42, z0=0.06)
    for x in (-0.5, 0.5): fenster(bm, x, -0.15, 0.5, 0.14, 0.12)
    for x in (-0.4, 0.4):                                                       # Bänke unter der Vorhalle
        kasten(bm, (x, -0.38, 0.13), (0.42, 0.1, 0.03), "holz_hell")
        for sx in (-1, 1): kasten(bm, (x + sx * 0.17, -0.38, 0.09), (0.03, 0.08, 0.08), "holz")
    kasten(bm, (0, -0.16, 0.5), (0.3, 0.02, 0.2), "dunkel")                    # Tafel
    ablegen("ludus", bm)

def wache():
    """Feuerwache (vigiles): Wachhaus mit Turm, Eimerreihe, Feuerhaken, Wasserfass."""
    bm = bmesh.new()
    kasten(bm, (0, 0, 0.03), (1.7, 1.6, 0.06), "stein")
    kasten(bm, (-0.2, 0.25, 0.38), (1.2, 1.0, 0.65), "putz")
    satteldach(bm, -0.2, 0.25, 0.7, 0.6, 0.5, 0.26, "dach", "putz")
    kasten(bm, (0.55, 0.35, 0.7), (0.5, 0.5, 1.3), "backstein")                  # Turm
    kasten(bm, (0.55, 0.35, 1.38), (0.58, 0.58, 0.06), "stein")
    for sx in (-1, 1):
        for sy in (-1, 1): kasten(bm, (0.55 + sx * 0.24, 0.35 + sy * 0.24, 1.52), (0.06, 0.06, 0.22), "holz")
    pultdach(bm, 0.25, 0.85, 0.05, 1.62, 0.65, 1.62, "dach", 0.03)
    fenster(bm, 0.55, 0.1, 1.05, 0.1, 0.16)
    tuer(bm, -0.3, -0.25, 0.3, 0.44, z0=0.06)
    fenster(bm, -0.65, -0.25, 0.5, 0.12, 0.12)
    for i in range(5): zyl(bm, (-0.75 + i * 0.13, -0.5, 0.06), 0.04, 0.05, 0.08, "holz_hell", 6)   # Eimer
    for i in range(2): stamm(bm, (0.2 + i * 0.12, -0.23, 0.06), (0.25 + i * 0.12, -0.27, 0.75), 0.012, "holz", 4)  # Haken
    kasten(bm, (0.27, -0.28, 0.76), (0.1, 0.02, 0.02), "eisen")
    zyl(bm, (0.6, -0.5, 0.06), 0.12, 0.12, 0.2, "holz", 8)
    kasten(bm, (0.6, -0.5, 0.265), (0.18, 0.18, 0.01), "wasser")
    ablegen("wache", bm)

def quartier():
    """Sklavenquartier: langer niedriger Bau, Strohdach, mehrere Türen, Wasserbottich."""
    bm = bmesh.new()
    kasten(bm, (0, 0.15, 0.04), (1.7, 1.1, 0.08), "stein")
    kasten(bm, (0, 0.15, 0.3), (1.6, 1.0, 0.45), "lehmwand")
    satteldach(bm, 0, 0.15, 0.52, 0.8, 0.5, 0.3, "stroh", "lehmwand", ue=0.1, dicke=0.06, rippe=None, first="holz")
    for x in (-0.55, 0.0, 0.55): tuer(bm, x, -0.35, 0.18, 0.32, z0=0.08)
    for x in (-0.28, 0.28): fenster(bm, x, -0.35, 0.4, 0.08, 0.06)
    zyl(bm, (-0.6, -0.6, 0), 0.1, 0.11, 0.14, "holz", 8)
    kasten(bm, (0.5, -0.6, 0.05), (0.4, 0.12, 0.1), "holz_hell")
    korb(bm, (0.1, -0.6, 0), "korn", 0.06)
    ablegen("quartier", bm)

def schrein():
    """Schrein (lararium/aedicula): Podium, zwei Säulen, Giebel, Altar davor."""
    bm = bmesh.new()
    kasten(bm, (0, 0.05, 0.08), (0.62, 0.62, 0.16), "stein")
    kasten(bm, (0, 0.18, 0.4), (0.5, 0.3, 0.48), "putz_hell")
    kasten(bm, (0, 0.03, 0.34), (0.2, 0.02, 0.28), "stoff_rot")
    kasten(bm, (0, 0.02, 0.3), (0.06, 0.03, 0.14), "bronze")
    for sx in (-1, 1): saeule(bm, sx * 0.2, -0.12, 0.16, 0.48, 0.03)
    giebeldach_y(bm, 0, 0.07, 0.64, 0.27, 0.32, 0.14, "dach", "stein_hell", ue=0.03)
    kasten(bm, (0, -0.36, 0.1), (0.18, 0.12, 0.2), "stein_hell")              # Altar
    kasten(bm, (0, -0.36, 0.21), (0.08, 0.06, 0.03), "obst")
    ablegen("schrein", bm)

def latrine():
    """Latrine: lange Halle mit Bogenöffnungen, Wasserrinne davor."""
    bm = bmesh.new()
    kasten(bm, (0, 0.08, 0.03), (1.75, 0.75, 0.06), "stein")
    kasten(bm, (0, 0.12, 0.3), (1.6, 0.56, 0.5), "backstein")
    for x in (-0.55, -0.18, 0.18, 0.55):
        kasten(bm, (x, -0.165, 0.27), (0.2, 0.02, 0.32), "dunkel")
        kasten(bm, (x, -0.17, 0.44), (0.26, 0.03, 0.05), "stein_hell")
    pultdach(bm, -0.85, 0.85, -0.22, 0.56, 0.45, 0.66, "dach", 0.03, "dach_dunkel")
    kasten(bm, (0, -0.28, 0.045), (1.6, 0.08, 0.03), "stein_hell")
    kasten(bm, (0, -0.28, 0.062), (1.56, 0.05, 0.006), "wasser")
    ablegen("latrine", bm)

def werkstatt(bm, wand="putz"):
    """Gemeinsamer Werkstatt-Grundbau: Haus hinten, offener Hof vorne."""
    kasten(bm, (0, 0, 0.02), (1.7, 1.66, 0.04), "erde")
    kasten(bm, (0, 0.42, 0.36), (1.6, 0.74, 0.64), wand)
    kasten(bm, (0, 0.42, 0.07), (1.62, 0.76, 0.1), "stein")
    satteldach(bm, 0, 0.42, 0.68, 0.8, 0.37, 0.26, "dach", wand)
    tuer(bm, -0.45, 0.05, 0.26, 0.44, z0=0.04)

def schmiede():
    """Schmiede: Esse mit Kamin unter Vordach, Amboss, Wassertrog, Eisenbarren."""
    bm = bmesh.new(); werkstatt(bm, "backstein")
    for x in (0.0, 0.8): kasten(bm, (x, -0.55, 0.28), (0.05, 0.05, 0.52), "holz")
    pultdach(bm, -0.05, 0.85, -0.62, 0.52, 0.05, 0.66, "dach_dunkel", 0.03, "dach")
    kasten(bm, (0.42, -0.1, 0.16), (0.42, 0.32, 0.24), "stein")                  # Esse
    kasten(bm, (0.42, -0.25, 0.2), (0.2, 0.02, 0.1), "obst")
    kasten(bm, (0.42, 0.0, 0.7), (0.16, 0.16, 0.9), "backstein")
    zyl(bm, (0.25, -0.45, 0.04), 0.05, 0.06, 0.16, "holz", 6)                    # Amboss
    kasten(bm, (0.25, -0.45, 0.22), (0.16, 0.07, 0.05), "eisen")
    kasten(bm, (0.68, -0.4, 0.1), (0.14, 0.3, 0.12), "holz")
    kasten(bm, (0.68, -0.4, 0.16), (0.1, 0.26, 0.01), "wasser")
    for k in range(3): kasten(bm, (-0.3, -0.5, 0.06 + k * 0.035), (0.25, 0.08, 0.03), "eisen", rz=0.1 * k)
    ablegen("schmiede", bm)

def kelter():
    """Kelter: Baumpresse (langer Balken, Gewichtstein), Bottiche, Amphoren."""
    bm = bmesh.new(); werkstatt(bm)
    kasten(bm, (0.1, -0.35, 0.06), (0.4, 0.4, 0.04), "stein")                   # Pressbett
    zyl(bm, (0.1, -0.35, 0.08), 0.15, 0.15, 0.1, "trauben" if "trauben" in MI else "stoff_rot", 8)
    for x in (-0.25, -0.15): kasten(bm, (x, -0.35, 0.3), (0.05, 0.05, 0.6), "holz")
    stamm(bm, (-0.2, -0.35, 0.45), (0.8, -0.35, 0.28), 0.04, "holz_hell", 6)     # Pressbaum
    kasten(bm, (0.78, -0.35, 0.1), (0.16, 0.16, 0.16), "stein")
    for i, x in enumerate((-0.7, -0.55)): zyl(bm, (x, -0.55, 0.04), 0.08, 0.09, 0.14, "holz", 8)
    for x in (0.45, 0.55, 0.65): amphore(bm, (x, -0.7, 0.04), "ocker", 1.2)
    ablegen("kelter", bm)

def oelmuehle():
    """Ölmühle: Trapetum (rundes Becken mit zwei Mahlsteinen), Vordach, Ölkrüge."""
    bm = bmesh.new(); werkstatt(bm, "putz_hell")
    zyl(bm, (0.15, -0.35, 0.04), 0.3, 0.3, 0.16, "stein", 12)
    kasten(bm, (0.15, -0.35, 0.205), (0.36, 0.36, 0.006), "gruen")
    zyl(bm, (0.15, -0.35, 0.2), 0.04, 0.04, 0.22, "stein_hell", 6)
    for sx in (-1, 1): stamm(bm, (0.15 + sx * 0.05, -0.35, 0.3), (0.15 + sx * 0.2, -0.35, 0.3), 0.1, "stein_hell", 9)
    stamm(bm, (-0.25, -0.35, 0.36), (0.55, -0.35, 0.36), 0.015, "holz", 4)
    for x in (-0.65, -0.5, -0.35): amphore(bm, (x, -0.65, 0.04), "ocker", 1.3)
    ablegen("oelmuehle", bm)

def weberei():
    """Weberei: Webstuhl unter dem Vordach, Wollballen, Tuchbahnen zum Trocknen."""
    bm = bmesh.new(); werkstatt(bm)
    for x in (-0.8, 0.8): kasten(bm, (x, -0.6, 0.28), (0.04, 0.04, 0.52), "holz")
    pultdach(bm, -0.85, 0.85, -0.66, 0.52, 0.05, 0.66, "dach", 0.03, "dach_dunkel")
    for sx in (-1, 1): kasten(bm, (0.2 + sx * 0.22, -0.2, 0.3), (0.03, 0.03, 0.56), "holz")   # Webstuhl
    kasten(bm, (0.2, -0.2, 0.57), (0.5, 0.04, 0.03), "holz")
    kasten(bm, (0.2, -0.21, 0.35), (0.4, 0.01, 0.38), "stoff_blau")
    for i in range(4): kasten(bm, (0.08 + i * 0.08, -0.22, 0.12), (0.03, 0.03, 0.06), "stein")
    for i, x in enumerate((-0.6, -0.42)): kuppel(bm, (x, -0.35, 0.04), 0.1, 0.12, "stoff_hell", 7, 3, 0.2, i + 30)
    stamm(bm, (-0.75, -0.75, 0.42), (0.75, -0.75, 0.42), 0.008, "holz", 4)
    for i, c in enumerate(("stoff_rot", "stoff_ocker", "stoff_hell")):
        kasten(bm, (-0.5 + i * 0.45, -0.75, 0.3), (0.3, 0.008, 0.24), c)
    ablegen("weberei", bm)

def garumsiederei():
    """Garumsiederei: offene Salzbecken mit Fisch, Schuppen, Amphoren."""
    bm = bmesh.new(); werkstatt(bm, "putz_hell")
    for i in range(3):
        for j in range(2):
            x, y = -0.5 + i * 0.42, -0.5 + j * 0.42
            kasten(bm, (x, y, 0.08), (0.36, 0.34, 0.12), "stein_hell")
            kasten(bm, (x, y, 0.141), (0.28, 0.26, 0.004), "garum" if "garum" in MI else "ocker")
    for x in (0.62, 0.72, 0.82): amphore(bm, (x - 0.2, 0.0 - 0.75, 0.04), "rot", 1.3)
    ablegen("garumsiederei", bm)

def tabernae():
    """Ladenzeile: drei Läden mit Markisen, Auslagen davor."""
    bm = bmesh.new()
    kasten(bm, (0, 0.05, 0.03), (1.75, 0.8, 0.06), "stein")
    kasten(bm, (0, 0.15, 0.36), (1.7, 0.56, 0.62), "putz")
    satteldach(bm, 0, 0.15, 0.67, 0.85, 0.28, 0.18, "dach", "putz")
    for i, (x, c) in enumerate(((-0.56, "stoff_rot"), (0.0, "stoff_ocker"), (0.56, "stoff_blau"))):
        kasten(bm, (x, -0.135, 0.28), (0.42, 0.02, 0.42), "dunkel")
        pultdach(bm, x - 0.25, x + 0.25, -0.38, 0.46, -0.13, 0.56, c, 0.015)
        kasten(bm, (x, -0.28, 0.12), (0.36, 0.14, 0.03), "holz_hell")
        for k in range(3): korb(bm, (x - 0.1 + k * 0.1, -0.28, 0.135), ("obst", "korn", "brot")[(i + k) % 3], 0.035)
    ablegen("tabernae", bm)

def tempel():
    """Podiumstempel: hohes Podium, Freitreppe, sechs Säulen, Cella, Giebeldach, Altar."""
    bm = bmesh.new()
    kasten(bm, (0, 0.25, 0.2), (1.8, 2.2, 0.4), "stein")
    kasten(bm, (0, 0.25, 0.41), (1.86, 2.26, 0.03), "stein_hell")
    treppe(bm, 0, -0.85, 1.2, 5, 0.4, 0.42)
    kasten(bm, (0, 0.55, 0.85), (1.3, 1.4, 0.86), "putz_hell")
    tuer(bm, 0, -0.15, 0.3, 0.55, rahmen="bronze", z0=0.42)
    for i in range(6): saeule(bm, -0.75 + i * 0.3, -0.62, 0.42, 0.86, 0.055)
    for i in range(2): saeule(bm, -0.75 + i * 1.5, -0.25, 0.42, 0.86, 0.055)
    kasten(bm, (0, 0.25, 1.32), (1.76, 2.1, 0.08), "stein_hell")
    giebeldach_y(bm, 0, 0.25, 1.36, 0.9, 1.08, 0.36, "dach", "stein_hell", ue=0.04)
    kasten(bm, (0, -1.32, 0.12), (0.3, 0.2, 0.24), "stein_hell")                # Altar
    ablegen("tempel", bm)

def theater():
    """Theater: halbrunde Cavea mit Rängen und Arkaden, Bühnenhaus (scaenae frons) dahinter."""
    bm = bmesh.new()
    kasten(bm, (0, 0, 0.02), (3.8, 2.8, 0.04), "stein")
    R = 1.35
    for k in range(5):                                                         # Ränge, nach hinten ansteigend, Bogen zur Kamera
        r0 = 0.45 + k * 0.18; h = 0.12 + k * 0.14; n = 12
        for i in range(n):
            a0, a1 = math.pi * i / n, math.pi * (i + 1) / n
            xm, ym = math.cos((a0 + a1) / 2), -math.sin((a0 + a1) / 2)
            kasten(bm, (xm * (r0 + 0.09), 0.25 + ym * (r0 + 0.09), h / 2), ((r0 + 0.18) * (a1 - a0) + 0.02, 0.18, h),
                   "stein_hell" if k % 2 else "stein", rz=-(a0 + a1) / 2 + math.pi / 2)
    n = 14
    for i in range(n):                                                         # Außenmauer mit Bögen
        a0, a1 = math.pi * i / n, math.pi * (i + 1) / n; am = (a0 + a1) / 2
        x, y = math.cos(am) * (R + 0.02), 0.25 - math.sin(am) * (R + 0.02)
        kasten(bm, (x, y, 0.42), (R * (a1 - a0) + 0.02, 0.06, 0.84), "putz_hell", rz=-am + math.pi / 2)
        kasten(bm, (math.cos(am) * (R + 0.05), 0.25 - math.sin(am) * (R + 0.05), 0.22), (0.12, 0.02, 0.24), "dunkel", rz=-am + math.pi / 2)
    kasten(bm, (0, 0.25 + 0.15, 0.03), (0.8, 0.3, 0.03), "stein_hell")         # Orchestra
    kasten(bm, (0, 0.62, 0.12), (2.2, 0.28, 0.16), "holz_hell")                # Bühne
    kasten(bm, (0, 0.95, 0.55), (2.8, 0.36, 1.1), "putz")                     # Bühnenhaus
    for i in range(7): saeule(bm, -1.2 + i * 0.4, 0.74, 0.2, 0.6, 0.035)
    for x in (-0.6, 0, 0.6): kasten(bm, (x, 0.765, 0.45), (0.22, 0.02, 0.4), "dunkel")
    pultdach(bm, -1.45, 1.45, 0.75, 1.14, 1.15, 1.22, "dach", 0.03, "dach_dunkel")
    ablegen("theater", bm)

def thermen():
    """Thermen: Badehaus mit Kuppeln, Palästra mit Becken, Schornstein des Ofens."""
    bm = bmesh.new()
    kasten(bm, (0, 0, 0.02), (3.8, 2.8, 0.04), "stein_hell")
    kasten(bm, (0.35, 0.45, 0.45), (2.9, 1.5, 0.82), "backstein")
    kasten(bm, (0.35, 0.45, 0.88), (2.96, 1.56, 0.05), "stein_hell")
    for x, r in ((-0.6, 0.5), (0.5, 0.62), (1.4, 0.42)): kuppel(bm, (x, 0.45, 0.9), r, r * 0.8, "stein_hell", 12, 4)
    for x in (-0.6, 0.5, 1.4):
        kasten(bm, (x, -0.31, 0.45), (0.3, 0.02, 0.5), "dunkel")
        kasten(bm, (x, -0.32, 0.72), (0.38, 0.03, 0.05), "stein_hell")
    kasten(bm, (-1.4, 1.0, 0.75), (0.2, 0.2, 1.5), "backstein")
    kasten(bm, (-1.4, 1.0, 1.52), (0.25, 0.25, 0.04), "stein")
    kasten(bm, (-0.4, -0.85, 0.06), (2.2, 0.8, 0.08), "stein")               # Palästra-Becken
    kasten(bm, (-0.4, -0.85, 0.105), (2.0, 0.62, 0.01), "wasser")
    for i in range(7): saeule(bm, -1.6 + i * 0.4, -1.3, 0.04, 0.45, 0.03)
    kasten(bm, (-0.4, -1.3, 0.5), (2.6, 0.08, 0.04), "stein_hell")
    ablegen("thermen", bm)

def basilika():
    """Basilika: Hallenbau mit erhöhtem Mittelschiff, Säulenumgang, Apsis an der Schmalseite."""
    bm = bmesh.new()
    kasten(bm, (0, 0, 0.05), (5.6, 3.6, 0.1), "stein")
    kasten(bm, (-0.2, 0.1, 0.6), (4.6, 2.6, 1.0), "putz_hell")
    kasten(bm, (-0.2, 0.1, 1.35), (4.2, 1.3, 0.5), "putz_hell")               # Obergaden
    for i in range(9): fenster(bm, -2.1 + i * 0.48, -0.55, 1.4, 0.16, 0.2)
    satteldach(bm, -0.2, 0.1, 1.6, 2.1, 0.65, 0.3, "dach", "putz_hell")
    for sy in (-1, 1): pultdach(bm, -2.5, 2.1, 0.1 + sy * 1.3, 1.1, 0.1 + sy * 0.65, 1.15, "dach", 0.03)
    with lage((2.1, 0.1, 0)):                                                  # Apsis
        for i in range(8):
            a = -math.pi / 2 + math.pi * (i + 0.5) / 8
            kasten(bm, (math.cos(a) * 0.7, math.sin(a) * 0.7, 0.55), (0.3, 0.06, 1.0), "putz_hell", rz=a + math.pi / 2)
        kuppel(bm, (0, 0, 1.05), 0.72, 0.4, "dach", 10, 3)
    for i in range(13): saeule(bm, -2.6 + i * 0.4, -1.5, 0.1, 0.9, 0.05)       # Säulenumgang vorn
    kasten(bm, (-0.2, -1.5, 1.03), (5.0, 0.12, 0.08), "stein_hell")
    pultdach(bm, -2.75, 2.35, -1.6, 0.98, -1.2, 1.08, "dach", 0.03, "dach_dunkel")
    for x in (-1.2, -0.2, 0.8): tuer(bm, x, -1.2, 0.3, 0.6, rahmen="stein_hell", z0=0.1)
    treppe(bm, -0.2, -1.6, 3.0, 2, 0.1, 0.2)
    ablegen("basilika", bm)

def tor():
    """Stadttor: zwei Tortürme, Bogen mit Durchgang, Zinnen."""
    bm = bmesh.new()
    for sx in (-1, 1):
        kasten(bm, (sx * 0.34, 0, 0.6), (0.3, 0.9, 1.2), "stein")
        for k in range(2): kasten(bm, (sx * 0.34 + (k - 0.5) * 0.14, -0.4, 1.27), (0.08, 0.08, 0.14), "stein")
        fenster(bm, sx * 0.34, -0.45, 0.85, 0.06, 0.12)
    kasten(bm, (0, 0, 0.92), (0.4, 0.9, 0.56), "stein_hell")
    kasten(bm, (0, -0.45, 0.33), (0.38, 0.02, 0.62), "dunkel")
    kasten(bm, (0, -0.46, 0.66), (0.42, 0.03, 0.06), "stein_hell")
    kasten(bm, (0, 0, 1.22), (0.42, 0.9, 0.04), "stein")
    ablegen("tor", bm)

def zeltlager():
    """Zeltlager der Kolonisten: Lederzelte, Feuerstelle mit Kessel, Kisten, Werkzeug."""
    bm = bmesh.new()
    kasten(bm, (0, 0, 0.01), (2.7, 1.7, 0.02), "erde")
    for i, (x, y, r) in enumerate(((-0.9, 0.35, 0.0), (-0.1, 0.45, 0.1), (0.75, 0.3, -0.1), (-0.55, -0.4, 0.2))):
        with lage((x, y, 0), r):
            for sx in (-1, 1): poly(bm, [(-0.3, sx * 0.28, 0.02), (0.3, sx * 0.28, 0.02), (0.3, 0, 0.42), (-0.3, 0, 0.42)], "stoff_hell" if i % 2 else "fell")
            poly(bm, [(0.3, -0.28, 0.02), (0.3, 0.28, 0.02), (0.3, 0, 0.42)], "fell")
            poly(bm, [(-0.3, 0.28, 0.02), (-0.3, -0.28, 0.02), (-0.3, 0, 0.42)], "dunkel")
    for i in range(6):
        a = i * math.pi / 3; kasten(bm, (0.35 + 0.12 * math.cos(a), -0.45 + 0.12 * math.sin(a), 0.03), (0.06, 0.06, 0.05), "stein")
    kasten(bm, (0.35, -0.45, 0.04), (0.12, 0.12, 0.04), "obst")
    zyl(bm, (0.35, -0.45, 0.12), 0.07, 0.08, 0.08, "eisen", 7)
    for sx in (-1, 1): stamm(bm, (0.35 + sx * 0.15, -0.45, 0.0), (0.35, -0.45, 0.3), 0.01, "holz", 4)
    for x, y in ((0.9, -0.5), (1.05, -0.35), (0.98, -0.42)): kasten(bm, (x, y, 0.06 if y != -0.42 else 0.16), (0.14, 0.12, 0.1), "holz_hell")
    for i, x in enumerate((-1.1, -1.0)): stamm(bm, (x, -0.6, 0.03), (x + 0.5, -0.7, 0.03), 0.03, "holz", 5)
    ablegen("zeltlager", bm)

def statue():
    """Statue: Sockel mit Inschrift, Figur in Toga."""
    bm = bmesh.new()
    kasten(bm, (0, 0, 0.04), (0.5, 0.5, 0.08), "stein")
    kasten(bm, (0, 0, 0.26), (0.32, 0.32, 0.36), "stein_hell")
    kasten(bm, (0, -0.162, 0.28), (0.22, 0.01, 0.08), "stein")
    kasten(bm, (0, 0, 0.45), (0.36, 0.36, 0.04), "stein_hell")
    zyl(bm, (0, 0, 0.47), 0.09, 0.07, 0.34, "bronze", 7)
    zyl(bm, (0, 0, 0.81), 0.05, 0.05, 0.03, "bronze", 6)
    kuppel(bm, (0, 0, 0.84), 0.05, 0.07, "bronze", 6, 2)
    stamm(bm, (0.06, 0, 0.72), (0.18, -0.06, 0.8), 0.018, "bronze", 4)
    ablegen("statue", bm)

def garten():
    """Garten: Wege, Beete, zwei Bäume, kleines Becken."""
    bm = bmesh.new()
    kasten(bm, (0, 0, 0.02), (1.84, 1.84, 0.04), "gruen")
    kasten(bm, (0, 0, 0.042), (1.84, 0.18, 0.006), "stein_hell")
    kasten(bm, (0, 0, 0.043), (0.18, 1.84, 0.006), "stein_hell")
    for sx in (-1, 1):
        for sy in (-1, 1):
            for k in range(3): kasten(bm, (sx * 0.5 + (k - 1) * 0.18, sy * 0.5, 0.06), (0.1, 0.55, 0.04), ("obst", "gruen", "stoff_ocker")[k] if sx == sy else "erde")
    for x, y in ((-0.6, 0.6), (0.6, -0.55)):
        stamm(bm, (x, y, 0.04), (x, y, 0.4), 0.03, "holz", 5)
        kuppel(bm, (x, y, 0.35), 0.24, 0.32, "gruen", 8, 3, 0.25, int(x * 10 + y * 7) + 40)
    zyl(bm, (0, 0, 0.04), 0.18, 0.18, 0.06, "stein_hell", 10)
    kasten(bm, (0, 0, 0.101), (0.22, 0.22, 0.004), "wasser")
    ablegen("garten", bm)

def amphitheater():
    """Amphitheater: ovale Arena, Ränge, Außenmauer mit zwei Bogenreihen, Tore an den Enden."""
    bm = bmesh.new()
    kasten(bm, (0, 0, 0.02), (4.8, 3.8, 0.04), "stein")
    A, B, n = 2.3, 1.8, 20
    for i in range(n):
        a0, a1 = 2 * math.pi * i / n, 2 * math.pi * (i + 1) / n; am = (a0 + a1) / 2
        ca, sa = math.cos(am), math.sin(am)
        for k in range(4):                                            # Ränge, außen höher
            f = 0.45 + k * 0.13; h = 0.25 + k * 0.28
            L = math.hypot(A * f * (math.cos(a1) - math.cos(a0)), B * f * (math.sin(a1) - math.sin(a0))) + 0.03
            kasten(bm, (A * f * ca, B * f * sa, h / 2), (L, 0.24, h), "stein_hell" if k % 2 else "stein", rz=math.atan2(B * ca, -A * sa))
        L = math.hypot(A * (math.cos(a1) - math.cos(a0)), B * (math.sin(a1) - math.sin(a0))) + 0.02
        rz = math.atan2(B * ca, -A * sa)
        kasten(bm, (A * 1.0 * ca, B * 1.0 * sa, 0.66), (L, 0.08, 1.32), "putz_hell", rz=rz)
        for z in (0.3, 0.8):
            kasten(bm, (A * 1.02 * ca, B * 1.02 * sa, z), (L * 0.55, 0.02, 0.3), "dunkel", rz=rz)
        kasten(bm, (A * 1.0 * ca, B * 1.0 * sa, 1.34), (L + 0.02, 0.12, 0.05), "stein", rz=rz)
    kasten(bm, (0, 0, 0.045), (A * 0.85, B * 0.85, 0.01), "korn")          # Sand
    for sx in (-1, 1): kasten(bm, (sx * A * 0.95, 0, 0.3), (0.3, 0.36, 0.56), "dunkel")
    ablegen("amphitheater", bm)

def augusteum():
    """Augusteum: Tempel auf Podium in einem Säulenhof, Altar, Statue des Kaisers."""
    bm = bmesh.new()
    kasten(bm, (0, 0, 0.03), (2.8, 2.8, 0.06), "stein_hell")
    for i in range(7):                                                # Säulenhof hinten und seitlich
        saeule(bm, -1.25 + i * 0.4167, 1.25, 0.06, 0.55, 0.03)
    for sx in (-1, 1):
        for i in range(5): saeule(bm, sx * 1.25, -0.9 + i * 0.5, 0.06, 0.55, 0.03)
        kasten(bm, (sx * 1.25, 0.15, 0.63), (0.1, 2.3, 0.05), "stein_hell")
    kasten(bm, (0, 1.25, 0.63), (2.6, 0.1, 0.05), "stein_hell")
    with lage((0, 0.35, 0)):
        kasten(bm, (0, 0, 0.18), (1.1, 1.4, 0.3), "stein")
        treppe(bm, 0, -0.7, 0.8, 4, 0.3, 0.3)
        kasten(bm, (0, 0.25, 0.65), (0.8, 0.8, 0.66), "putz_hell")
        for i in range(4): saeule(bm, -0.39 + i * 0.26, -0.45, 0.33, 0.66, 0.04)
        giebeldach_y(bm, 0, 0.0, 0.99, 0.55, 0.68, 0.24, "dach", "stein_hell", ue=0.03)
        tuer(bm, 0, -0.15, 0.2, 0.4, rahmen="bronze", z0=0.33)
    kasten(bm, (0, -0.95, 0.12), (0.3, 0.2, 0.2), "stein_hell")
    kasten(bm, (0.75, -0.95, 0.2), (0.22, 0.22, 0.34), "stein_hell")
    zyl(bm, (0.75, -0.95, 0.37), 0.07, 0.05, 0.3, "bronze", 7)
    kuppel(bm, (0.75, -0.95, 0.67), 0.05, 0.07, "bronze", 6, 2)
    ablegen("augusteum", bm)

def macellum():
    """Macellum: Hof mit Ladenreihen ringsum, Rundbau (tholos) mit Brunnen in der Mitte."""
    bm = bmesh.new()
    kasten(bm, (0, 0, 0.02), (2.8, 2.8, 0.04), "stein_hell")
    for (x, y, w, d) in ((0, 1.15, 2.7, 0.5), (-1.15, 0.0, 0.5, 1.8), (1.15, 0.0, 0.5, 1.8)):
        kasten(bm, (x, y, 0.3), (w, d, 0.52), "putz")
    satteldach(bm, 0, 1.15, 0.56, 1.35, 0.25, 0.18, "dach", "putz", rippe=None)
    for sx in (-1, 1):
        with lage((sx * 1.15, 0, 0), math.pi / 2): satteldach(bm, 0, 0, 0.56, 0.9, 0.25, 0.18, "dach", "putz", rippe=None)
    for i in range(5): kasten(bm, (-1.0 + i * 0.5, 0.895, 0.22), (0.26, 0.02, 0.32), "dunkel")
    for sx in (-1, 1):
        for i in range(3): kasten(bm, (sx * 0.895, -0.6 + i * 0.6, 0.22), (0.02, 0.26, 0.32), "dunkel")
    for x in (-1.1, 1.1): kasten(bm, (x, -1.15, 0.3), (0.5, 0.5, 0.52), "putz")   # Eingangsbauten vorne
    for i in range(8):                                               # Tholos
        a = 2 * math.pi * i / 8; saeule(bm, 0.45 * math.cos(a), 0.45 * math.sin(a), 0.1, 0.5, 0.03)
    zyl(bm, (0, 0, 0.04), 0.55, 0.55, 0.06, "stein", 12)
    kuppel(bm, (0, 0, 0.6), 0.55, 0.3, "dach", 12, 3)
    zyl(bm, (0, 0, 0.1), 0.2, 0.2, 0.08, "stein_hell", 10)
    kasten(bm, (0, 0, 0.181), (0.26, 0.26, 0.004), "wasser")
    for x, y in ((-0.6, -0.7), (0.6, -0.6), (-0.3, -0.9)): korb(bm, (x, y, 0.04), ("obst", "korn", "gruen")[int(x * 10) % 3], 0.05)
    ablegen("macellum", bm)

def hafen():
    """Hafen: Kaimauer mit Pollern, Lagerhaus (horreum), Tretradkran, Handelsschiff am Kai, Amphoren."""
    bm = bmesh.new()
    kasten(bm, (0, 0.2, 0.08), (3.8, 2.2, 0.16), "stein")                  # Kai
    kasten(bm, (0, 1.32, 0.04), (3.8, 0.06, 0.08), "stein_hell")
    for i in range(5): zyl(bm, (-1.6 + i * 0.8, 1.2, 0.16), 0.04, 0.035, 0.1, "dunkel", 6)
    kasten(bm, (-0.8, -0.35, 0.5), (2.0, 0.9, 0.7), "putz")                 # Lagerhaus
    kasten(bm, (-0.8, -0.35, 0.18), (2.02, 0.92, 0.06), "backstein")
    satteldach(bm, -0.8, -0.35, 0.85, 1.0, 0.45, 0.25, "dach", "putz")
    for x in (-1.4, -0.8, -0.2): kasten(bm, (x, -0.805, 0.4), (0.24, 0.02, 0.36), "dunkel")
    stamm(bm, (1.2, 0.6, 0.16), (1.3, 0.85, 1.25), 0.035, "holz", 6)           # Kran
    stamm(bm, (1.4, 0.6, 0.16), (1.3, 0.85, 1.25), 0.035, "holz", 6)
    stamm(bm, (1.3, 0.85, 1.25), (1.3, 1.5, 1.05), 0.03, "holz", 6)
    stamm(bm, (1.3, 1.5, 1.05), (1.3, 1.5, 0.55), 0.006, "dunkel", 4)
    kasten(bm, (1.3, 1.5, 0.5), (0.14, 0.14, 0.1), "holz_hell")
    with lage((1.2, 0.55, 0.42)):
        stamm(bm, (-0.16, 0, 0), (0.16, 0, 0), 0.26, "holz_hell", 12)
    with lage((0.1, 1.75, 0)):                                               # Schiff
        kasten(bm, (0, 0, 0.1), (2.2, 0.5, 0.2), "holz")
        kasten(bm, (0, 0, 0.21), (2.0, 0.42, 0.03), "holz_hell")
        for sx in (-1, 1): kasten(bm, (sx * 1.15, 0, 0.2), (0.2, 0.36, 0.3), "holz", ry=-sx * 0.5)
        stamm(bm, (0, 0, 0.2), (0, 0, 1.15), 0.025, "holz", 6)
        kasten(bm, (0, 0, 0.95), (0.9, 0.02, 0.5), "stoff_hell")
        for x in (-0.6, -0.4, 0.4): amphore(bm, (x, 0.05, 0.22), "ocker", 1.6)
    for x, y in ((0.4, 0.6), (0.55, 0.65), (0.5, 0.45), (0.7, 0.5)): amphore(bm, (x, y, 0.16), "ocker", 1.8)
    for k in range(2): kasten(bm, (-0.1, 0.65, 0.22 + k * 0.1), (0.3, 0.22, 0.09), "stoff_ocker")
    ablegen("hafen", bm)

for fn in (insula, domus, ludus, wache, quartier, schrein, latrine, schmiede, kelter, oelmuehle, weberei, garumsiederei,
           tabernae, tempel, theater, thermen, basilika, tor, zeltlager, statue, garten, amphitheater, augusteum, macellum, hafen): fn()
