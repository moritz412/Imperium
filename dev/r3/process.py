"""TRELLIS-Rohmodell (GLB mit Textur) → spielfertiges GLB mit Vertexfarben.

Aufruf wie im Skill:
  BUDGET_FILE=budget.json NO_OBJ=1 python3 -c "import process;process.process(src,id,outdir,0)"
oder
  python3 process.py <src.glb> <id> <outdir> [fac=0|1] [--budget N] [--tex N]

Schritte:
 1. Szene laden, alle Meshes mit Transformation zusammenführen
 2. Farbe je Fläche aus der Textur abtasten (Mittelpunkt + 3 Ecken, Textur vorher auf tex px), NaN-UVs → 0
 3. Auf Budget (Dreiecke) dezimieren (fast_simplification, quadric)
 4. Farbe auf das dezimierte Netz übertragen (nächste Original-Flächen, gewichtet)
 5. Normieren: x/z mittig, Y = 0 unten, Höhe 1
 6. fac=1: kräftig rote Flächen (Fahnen) → Gruppe 1 (Reichsfarbe im Spiel)
Ergebnis: <outdir>/<id>.glb (Meshes 'body' und ggf. 'fac'), Vertexfarben, flach.
"""
import os, sys, json, numpy as np
import trimesh
from PIL import Image
from scipy.spatial import cKDTree

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import mdl

DEF_BUDGET, DEF_TEX = 2000, 512


def budget_for(mid, budget=None, tex=None):
    b, t = DEF_BUDGET, DEF_TEX
    bf = os.environ.get('BUDGET_FILE')
    if bf and os.path.exists(bf):
        try:
            d = json.load(open(bf))
            e = d.get(mid) or d.get('budget', {}).get(mid) if isinstance(d, dict) else None
            if isinstance(e, dict):
                b = int(e.get('budget', b)); t = int(e.get('tex', t))
            elif isinstance(e, (int, float)):
                b = int(e)
            tx = d.get('tex', {}) if isinstance(d.get('tex'), dict) else {}
            if mid in tx: t = int(tx[mid])
        except Exception as ex:
            print('Budget-Datei nicht lesbar:', ex)
    return int(budget or b), int(tex or t)


def _tex_of(m, tex):
    v = m.visual
    img = None
    try:
        mat = v.material
        img = getattr(mat, 'baseColorTexture', None) or getattr(mat, 'image', None)
    except Exception:
        pass
    if img is not None:
        img = img.convert('RGB')
        if max(img.size) > tex:
            img = img.resize((tex, tex), Image.LANCZOS)
        return np.asarray(img).astype(np.float32) / 255.0
    return None


def _face_colors(m, tex):
    F = len(m.faces)
    v = m.visual
    if getattr(v, 'kind', None) == 'vertex' and hasattr(v, 'vertex_colors'):
        return v.vertex_colors[m.faces][:, :, :3].mean(1) / 255.0
    if getattr(v, 'kind', None) == 'face':
        return v.face_colors[:, :3] / 255.0
    img = _tex_of(m, tex)
    uv = getattr(v, 'uv', None)
    if img is not None and uv is not None and len(uv) == len(m.vertices):
        uv = np.nan_to_num(np.asarray(uv, np.float64), nan=0.0, posinf=0.0, neginf=0.0)
        H, W = img.shape[:2]
        fu = uv[m.faces]                              # (F,3,2)
        samples = np.concatenate([fu, fu.mean(1, keepdims=True)], 1)  # Ecken + Mitte
        u = np.mod(samples[..., 0], 1.0); w = np.mod(1.0 - samples[..., 1], 1.0)
        x = np.clip((u * (W - 1)).round().astype(int), 0, W - 1)
        y = np.clip((w * (H - 1)).round().astype(int), 0, H - 1)
        col = img[y, x]                               # (F,4,3)
        return col[:, 3] * 0.5 + col[:, :3].mean(1) * 0.5
    try:
        bc = np.asarray(v.material.baseColorFactor[:3], np.float32)
        bc = bc / 255.0 if bc.max() > 1 else bc
        return np.tile(bc, (F, 1))
    except Exception:
        return np.full((F, 3), 0.7)


def load_merged(src, tex):
    sc = trimesh.load(src, force='scene')
    V, Fs, C, Q = [], [], [], []
    off = 0
    for node in sc.graph.nodes_geometry:
        T, gname = sc.graph[node]
        g = sc.geometry[gname]
        if not isinstance(g, trimesh.Trimesh) or not len(g.faces):
            continue
        m = g.copy(); m.apply_transform(T)
        V.append(np.nan_to_num(m.vertices)); Fs.append(m.faces + off); C.append(_face_colors(m, tex)); off += len(m.vertices)
        Q.append(np.full(len(m.faces), 'fac' in str(gname) or 'fac' in str(node)))
    V, F = np.vstack(V), np.vstack(Fs)
    # Nähte schließen (gleiche Position = gleicher Punkt), damit das Dezimieren zusammenhängend arbeitet
    t = trimesh.Trimesh(V, F, process=False)
    t.merge_vertices(merge_tex=True, merge_norm=True)
    return np.asarray(t.vertices), np.asarray(t.faces), np.vstack(C), np.concatenate(Q)


def decimate(V, F, budget):
    if len(F) <= budget:
        return V, F
    # Bevorzugt pymeshlab (Quadric Edge Collapse, Ränder/Normalen erhalten, kleine flache Teile bleiben);
    # braucht libOpenGL (apt-get install -y libopengl0). Sonst fast_simplification (kann kleine Teile verlieren).
    try:
        import io, contextlib, pymeshlab
        with contextlib.redirect_stderr(io.StringIO()):
            ms = pymeshlab.MeshSet(); ms.add_mesh(pymeshlab.Mesh(V, F))
            ms.meshing_decimation_quadric_edge_collapse(targetfacenum=int(budget), preserveboundary=True, preservenormal=True,
                                                        optimalplacement=True, planarquadric=True, qualitythr=0.3)
            m = ms.current_mesh()
        return np.asarray(m.vertex_matrix(), np.float64), np.asarray(m.face_matrix(), np.int64)
    except Exception as ex:
        print('pymeshlab nicht nutzbar (' + str(ex)[:60] + ') – fast_simplification')
    import fast_simplification
    red = 1.0 - budget / len(F)
    v2, f2 = fast_simplification.simplify(V.astype(np.float32), F.astype(np.int32), target_reduction=red)
    return np.asarray(v2, np.float64), np.asarray(f2, np.int64)


def transfer(V0, F0, C0, V1, F1, k=4):
    c0 = V0[F0].mean(1); c1 = V1[F1].mean(1)
    d, i = cKDTree(c0).query(c1, k=min(k, len(c0)))
    if i.ndim == 1: return C0[i]
    w = 1.0 / np.maximum(d, 1e-6); w /= w.sum(1, keepdims=True)
    return (C0[i] * w[..., None]).sum(1)


def normalize(V):
    mn, mx = V.min(0), V.max(0)
    h = max(mx[1] - mn[1], 1e-9)
    V = V - np.array([(mn[0] + mx[0]) / 2, mn[1], (mn[2] + mx[2]) / 2])
    return V / h


def is_fac(C):
    r, g, b = C[:, 0], C[:, 1], C[:, 2]
    return (r > 0.45) & (r > g * 1.9) & (r > b * 1.9)


def groups_from(V, F, C, fac=False, Q=None):
    P = V[F].reshape(-1, 3)
    fn = np.cross(V[F[:, 1]] - V[F[:, 0]], V[F[:, 2]] - V[F[:, 0]])
    fn /= np.maximum(np.linalg.norm(fn, axis=1, keepdims=True), 1e-12)
    # Glatte Normalen mit Kantenwinkel (45°): weiche Rundungen, harte Kanten bleiben – wie die bisherigen Spielmodelle
    vn = np.zeros_like(V)
    for k in range(3): np.add.at(vn, F[:, k], fn)
    vn /= np.maximum(np.linalg.norm(vn, axis=1, keepdims=True), 1e-12)
    cn = vn[F]                                              # (F,3,3)
    ok = (cn * fn[:, None, :]).sum(2) > np.cos(np.radians(45))
    N = np.where(ok[..., None], cn, fn[:, None, :]).reshape(-1, 3)
    Cv = np.repeat(np.clip(C, 0, 1), 3, 0)
    if not fac:
        return [{'p': P, 'n': N, 'c': Cv}, {'p': np.zeros((0, 3)), 'n': np.zeros((0, 3)), 'c': np.zeros((0, 3))}]
    m = np.repeat(is_fac(C) | (Q if Q is not None else False), 3)
    return [{'p': P[~m], 'n': N[~m], 'c': Cv[~m]}, {'p': P[m], 'n': N[m], 'c': Cv[m]}]


def process(src, mid, outdir, fac=0, budget=None, tex=None):
    b, t = budget_for(mid, budget, tex)
    V0, F0, C0, Q0 = load_merged(src, t)
    V1, F1 = decimate(V0, F0, b)
    C1 = transfer(V0, F0, C0, V1, F1)
    Q1 = transfer(V0, F0, Q0[:, None].astype(float), V1, F1, k=1)[:, 0] > 0.5 if Q0.any() else None
    V1 = normalize(V1)
    os.makedirs(outdir, exist_ok=True)
    out = os.path.join(outdir, mid + '.glb')
    G = groups_from(V1, F1, C1, bool(fac) or Q1 is not None, Q1)
    mdl.to_glb(G, out)
    w = V1.max(0) - V1.min(0)
    print(f'{mid}: {len(F0)} → {len(F1)} Dreiecke (Budget {b}, tex {t}), Breite x {w[0]:.2f} z {w[2]:.2f}, Höhe 1 → {out}')
    return out


if __name__ == '__main__':
    a = sys.argv[1:]
    kw = {}
    if '--budget' in a: i = a.index('--budget'); kw['budget'] = int(a[i + 1]); del a[i:i + 2]
    if '--tex' in a: i = a.index('--tex'); kw['tex'] = int(a[i + 1]); del a[i:i + 2]
    process(a[0], a[1], a[2], int(a[3]) if len(a) > 3 else 0, **kw)
