"""MDL-Format von Imperium der Epochen (siehe mdlParse im Spiel).

Binär, base64 in einer JSON-Datei {id: base64}. Aufbau:
  uint32 nt0, uint32 nt1                 Dreiecke Gruppe 0 (Körper) / Gruppe 1 (Reichsfarbe)
  je Gruppe, nicht indiziert (nv = nt*3):
    int16  pos[nv*3]   / 16000           Y von 0..1, x/z um 0 zentriert
    int8   norm[nv*3]  / 127
    uint8  col[nv*3]   / 255             Vertexfarbe (keine Textur)
Gruppe 1 wird im Spiel mit der Reichsfarbe eingefärbt (Fahnen, Wimpel).
"""
import base64, json, numpy as np

SCALE = 16000.0


def decode(b64):
    b = base64.b64decode(b64)
    h = np.frombuffer(b[:8], np.uint32)
    o, out = 8, []
    for nt in h:
        nv = int(nt) * 3
        P = np.frombuffer(b[o:o + nv * 6], np.int16).reshape(-1, 3).astype(np.float32) / SCALE; o += nv * 6
        N = np.frombuffer(b[o:o + nv * 3], np.int8).reshape(-1, 3).astype(np.float32) / 127; o += nv * 3
        C = np.frombuffer(b[o:o + nv * 3], np.uint8).reshape(-1, 3).astype(np.float32) / 255; o += nv * 3
        out.append({'p': P, 'n': N, 'c': C})
    return out


def encode(groups):
    """groups: [ {p:(nv,3) float, n:(nv,3), c:(nv,3) 0..1}, {...} ] – genau 2 Gruppen (Gruppe 1 darf leer sein)."""
    while len(groups) < 2:
        groups.append({'p': np.zeros((0, 3)), 'n': np.zeros((0, 3)), 'c': np.zeros((0, 3))})
    parts = [np.array([len(g['p']) // 3 for g in groups[:2]], np.uint32).tobytes()]
    for g in groups[:2]:
        p = np.asarray(g['p'], np.float64)
        if np.abs(p).max(initial=0) * SCALE > 32767:
            raise ValueError('Koordinate außerhalb ±2,04 – vorher normieren')
        parts.append(np.round(p * SCALE).astype(np.int16).tobytes())
        n = np.asarray(g['n'], np.float64)
        n = n / np.maximum(np.linalg.norm(n, axis=1, keepdims=True), 1e-9)
        parts.append(np.round(n * 127).clip(-127, 127).astype(np.int8).tobytes())
        parts.append(np.round(np.asarray(g['c'], np.float64).clip(0, 1) * 255).astype(np.uint8).tobytes())
    return base64.b64encode(b''.join(parts)).decode()


def load_pack(path):
    return json.load(open(path))


def save_pack(path, d):
    json.dump(d, open(path, 'w'), separators=(',', ':'))


def bounds(groups):
    P = np.vstack([g['p'] for g in groups if len(g['p'])])
    return P.min(0), P.max(0)


# ---------- GLB mit Vertexfarben (Zwischenformat der Pipeline) ----------
def to_glb(groups, path):
    """Schreibt MDL-Gruppen als GLB (je Gruppe ein Mesh, Vertexfarben, Gruppe 1 im Namen 'fac')."""
    import trimesh
    sc = trimesh.Scene()
    for i, g in enumerate(groups):
        if not len(g['p']):
            continue
        nv = len(g['p'])
        m = trimesh.Trimesh(vertices=g['p'], faces=np.arange(nv).reshape(-1, 3), process=False)
        m.visual = trimesh.visual.ColorVisuals(m, vertex_colors=np.hstack([(g['c'] * 255).round(), np.full((nv, 1), 255)]).astype(np.uint8))
        sc.add_geometry(m, geom_name='fac' if i == 1 else 'body')
    sc.export(path)


def from_glb(path):
    """Liest ein GLB aus process.py (Vertexfarben, Mesh 'fac' = Gruppe 1) und baut MDL-Gruppen mit Flächennormalen."""
    import trimesh
    sc = trimesh.load(path, force='scene')
    groups = [[], []]
    for node in sc.graph.nodes_geometry:
        T, gname = sc.graph[node]
        m = sc.geometry[gname].copy()
        m.apply_transform(T)
        groups[1 if ('fac' in gname or 'fac' in str(node)) else 0].append(m)
    out = []
    for L in groups:
        if not L:
            out.append({'p': np.zeros((0, 3)), 'n': np.zeros((0, 3)), 'c': np.zeros((0, 3))}); continue
        m = trimesh.util.concatenate(L)
        F = m.faces
        P = m.vertices[F].reshape(-1, 3)
        if hasattr(m.visual, 'vertex_colors') and m.visual.kind == 'vertex':
            C = m.visual.vertex_colors[F].reshape(-1, 4)[:, :3] / 255.0
        elif m.visual.kind == 'face':
            C = np.repeat(m.visual.face_colors[:, :3] / 255.0, 3, axis=0)
        else:
            C = np.full((len(P), 3), 0.7)
        N = np.repeat(m.face_normals, 3, axis=0)
        out.append({'p': P, 'n': N, 'c': C})
    return out
