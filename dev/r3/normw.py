"""Breiten-Normierung: skaliert ein GLB (aus process/sockel) gleichmäßig, so dass die größte Breite (x oder z)
dem Zielwert entspricht; Y bleibt unten 0. Danach werden NaN-Werte bereinigt.

  python3 normw.py <in.glb> <out.glb> <breite> [--keep-height]

--keep-height: nur x/z skalieren (Höhe bleibt 1) – für Teile, die im Spiel auf eine feste Grundfläche passen müssen.
Hinweis: Das Spielformat erlaubt Koordinaten bis ±2,04; bei Breite > 4 bricht pack.py ab.
"""
import os, sys, numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import mdl


def normw(groups, W, keep_height=False):
    P = np.vstack([g['p'] for g in groups if len(g['p'])])
    mn, mx = P.min(0), P.max(0)
    w = max(mx[0] - mn[0], mx[2] - mn[2], 1e-9)
    s = W / w
    c = np.array([(mn[0] + mx[0]) / 2, mn[1], (mn[2] + mx[2]) / 2])
    for g in groups:
        if not len(g['p']): continue
        p = g['p'] - c
        p = p * (np.array([s, 1, s]) if keep_height else s)
        g['p'] = np.nan_to_num(p)
        g['n'] = np.nan_to_num(g['n']); g['c'] = np.nan_to_num(g['c'], nan=0.7)
    return groups


if __name__ == '__main__':
    a = sys.argv[1:]
    kh = '--keep-height' in a; a = [x for x in a if x != '--keep-height']
    G = normw(mdl.from_glb(a[0]), float(a[2]), kh)
    mdl.to_glb(G, a[1])
    print('Breite →', a[2], '(Höhe beibehalten)' if kh else '')
