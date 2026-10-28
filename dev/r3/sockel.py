"""Entfernt Bodenplatten/Sockel unter einem Modell (GLB aus process.py) und normiert neu (Y=0, Höhe 1).

  python3 sockel.py <in.glb> <out.glb> [--cut 0.06] [--dry]

Heuristik (ohne --cut): Radiusprofil über die Höhe (95.-Perzentil des Abstands zur Mitte je Höhenband).
Ist das unterste Stück (bis höchstens 25 % der Höhe) deutlich breiter (≥1,3×) als das Band direkt darüber
und flach (≤ 12 % der Höhe), gilt es als Sockel. Geschnitten wird oberhalb der Platte; Dreiecke, die ganz
darunter liegen, fallen weg, schräg geschnittene bleiben. Nicht bei Schiffen benutzen; bei Gebäuden mit hohem
Unterbau Ergebnis prüfen (--dry zeigt das Profil).
"""
import os, sys, numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import mdl


def profile(P, n=40, top=0.4):
    y = P[:, 1]; r = np.sqrt(P[:, 0] ** 2 + P[:, 2] ** 2)
    out = []
    for i in range(n):
        a, b = top * i / n, top * (i + 1) / n
        m = (y >= a) & (y < b)
        out.append((a, b, float(np.percentile(r[m], 95)) if m.sum() > 8 else 0.0))
    return out


def surface_points(groups, n=30000, seed=1):
    T = np.vstack([g['p'] for g in groups if len(g['p'])]).reshape(-1, 3, 3)
    a = 0.5 * np.linalg.norm(np.cross(T[:, 1] - T[:, 0], T[:, 2] - T[:, 0]), axis=1)
    rng = np.random.default_rng(seed)
    idx = rng.choice(len(T), size=n, p=a / a.sum())
    u, v = rng.random(n), rng.random(n); m = u + v > 1; u[m], v[m] = 1 - u[m], 1 - v[m]
    t = T[idx]
    return t[:, 0] + u[:, None] * (t[:, 1] - t[:, 0]) + v[:, None] * (t[:, 2] - t[:, 0])


def find_cut(P):
    pr = profile(P)
    rs = np.array([x[2] for x in pr]); hs = np.array([x[1] for x in pr])
    base = rs[:2].max() if len(rs) else 0
    if base <= 0:
        return None
    for i in range(2, len(rs)):
        if hs[i] > 0.25: break
        above = rs[i:i + 3][rs[i:i + 3] > 0]
        if len(above) and base >= 1.3 * above.max() and hs[i - 1] <= 0.12:
            return float(hs[i - 1])
    return None


def renorm(groups):
    P = np.vstack([g['p'] for g in groups if len(g['p'])])
    mn, mx = P.min(0), P.max(0); h = max(mx[1] - mn[1], 1e-9)
    c = np.array([(mn[0] + mx[0]) / 2, mn[1], (mn[2] + mx[2]) / 2])
    for g in groups:
        if len(g['p']): g['p'] = (g['p'] - c) / h
    return groups


def cut(groups, c):
    for g in groups:
        if not len(g['p']): continue
        y = g['p'][:, 1].reshape(-1, 3)
        keep = np.repeat(~(y.max(1) <= c), 3)
        for k in ('p', 'n', 'c'): g[k] = g[k][keep]
    return renorm(groups)


def main(a):
    dry = '--dry' in a; a = [x for x in a if x != '--dry']
    c = None
    if '--cut' in a: i = a.index('--cut'); c = float(a[i + 1]); del a[i:i + 2]
    G = mdl.from_glb(a[0])
    P = surface_points(G)
    if dry:
        for lo, hi, r in profile(P): print(f'{lo:.2f}-{hi:.2f}  r95={r:.3f}')
    if c is None: c = find_cut(P)
    if c is None:
        print('Kein Sockel erkannt – unverändert.'); c = -1
    else:
        print(f'Sockel bis Höhe {c:.3f} entfernt.')
    if not dry:
        if c > 0: G = cut(G, c)
        mdl.to_glb(G, a[1])


if __name__ == '__main__':
    main(sys.argv[1:])
