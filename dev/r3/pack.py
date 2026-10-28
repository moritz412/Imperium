"""GLBs (aus process/sockel/normw) ins Spielformat bringen und in ein Paket einfügen.

  python3 pack.py <paket.json> <id>=<datei.glb> [<id>=<datei.glb> ...] [--out neu.json]
  python3 pack.py --unpack <paket.json> <outdir> [id ...]      # Paket → GLBs (zum Prüfen/Nachbearbeiten)

Ohne --out wird das Paket an Ort und Stelle aktualisiert (vorhandene Keys bleiben, gleiche ids werden ersetzt).
Das Paket ist eine JSON-Datei {id: base64-MDL}; neue ids müssen im Spiel in MDL_PK[<paket>] stehen.
"""
import os, sys, json, numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import mdl


def pack(pk, items, out=None):
    d = json.load(open(pk)) if os.path.exists(pk) else {}
    for mid, glb in items:
        G = mdl.from_glb(glb)
        P = np.vstack([g['p'] for g in G if len(g['p'])])
        mn, mx = P.min(0), P.max(0)
        if abs(mn[1]) > 1e-3 or abs(mx[1] - 1) > 1e-2:
            print(f'Warnung {mid}: Y {mn[1]:.3f}..{mx[1]:.3f} (erwartet 0..1) – vorher process/sockel benutzen')
        d[mid] = mdl.encode(G)
        nt = [len(g['p']) // 3 for g in G]
        print(f'{mid}: {nt[0]}+{nt[1]} Dreiecke, {len(d[mid]) // 1024} KB')
    mdl.save_pack(out or pk, d)
    print('Paket', out or pk, ':', len(d), 'Modelle,', os.path.getsize(out or pk) // 1024, 'KB')


def unpack(pk, outdir, ids=None):
    d = json.load(open(pk)); os.makedirs(outdir, exist_ok=True)
    for k in (ids or d):
        mdl.to_glb(mdl.decode(d[k]), os.path.join(outdir, k + '.glb'))
    print(len(ids or d), 'GLBs nach', outdir)


if __name__ == '__main__':
    a = sys.argv[1:]
    if a[0] == '--unpack':
        unpack(a[1], a[2], a[3:] or None)
    else:
        out = None
        if '--out' in a: i = a.index('--out'); out = a[i + 1]; del a[i:i + 2]
        pack(a[0], [x.split('=', 1) for x in a[1:]], out)
