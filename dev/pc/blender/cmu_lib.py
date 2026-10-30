# CMU ASF/AMC lesen und auf das MPFB-Skelett cmu_mb übertragen (gemeinsam für soldat_bau.py u. a.).
# Übertragung je Knochen in Weltlage: Ruherichtung angleichen (CMU-T-Pose -> MPFB-A-Pose), dann CMU-Bewegung aufsetzen.
import math
from mathutils import Matrix, Vector, Euler

CM = 1.0 / 0.45 * 0.0254  # ASF-Länge -> Meter
NAME = {"root": "Hips", "lhipjoint": "LHipJoint", "lfemur": "LeftUpLeg", "ltibia": "LeftLeg", "lfoot": "LeftFoot",
        "ltoes": "LeftToeBase", "rhipjoint": "RHipJoint", "rfemur": "RightUpLeg", "rtibia": "RightLeg", "rfoot": "RightFoot",
        "rtoes": "RightToeBase", "lowerback": "LowerBack", "upperback": "Spine", "thorax": "Spine1", "lowerneck": "Neck",
        "upperneck": "Neck1", "head": "Head", "lclavicle": "LeftShoulder", "lhumerus": "LeftArm", "lradius": "LeftForeArm",
        "lwrist": "LeftHand", "lhand": "LeftFingerBase", "lfingers": "LeftHandFinger1", "lthumb": "LThumb",
        "rclavicle": "RightShoulder", "rhumerus": "RightArm", "rradius": "RightForeArm", "rwrist": "RightHand",
        "rhand": "RightFingerBase", "rfingers": "RightHandFinger1", "rthumb": "RThumb"}
INV = {v: k for k, v in NAME.items()}
Y2Z = Matrix(((1, 0, 0), (0, 0, -1), (0, 1, 0)))  # CMU y-oben -> Blender z-oben


def rot(ax, ay, az):
    return Euler((math.radians(ax), math.radians(ay), math.radians(az)), "XYZ").to_matrix()


class Aufnahme:
    def __init__(self, asf, amc):
        self.bones, self.kids = {}, {}
        lines = open(asf).read().split("\n"); i = 0; mode = None
        while i < len(lines):
            t = lines[i].split()
            if t and t[0] == ":bonedata": mode = "b"
            elif t and t[0] == ":hierarchy": mode = "h"
            elif mode == "b" and t and t[0] == "begin":
                b = {"dof": []}
                while lines[i].split()[0] != "end":
                    s = lines[i].split()
                    if s[0] == "name": nm = s[1]
                    elif s[0] == "direction": b["dir"] = Vector(map(float, s[1:4]))
                    elif s[0] == "length": b["len"] = float(s[1]) * CM
                    elif s[0] == "axis": b["C"] = rot(*map(float, s[1:4]))
                    elif s[0] == "dof": b["dof"] = s[1:]
                    i += 1
                self.bones[nm] = b
            elif mode == "h" and t and t[0] not in ("begin", "end"):
                for k in t[1:]: self.kids.setdefault(t[0], []).append(k)
            i += 1
        self.bones["root"] = {"dir": Vector((0, 0, 0)), "len": 0.0, "C": Matrix.Identity(3), "dof": []}
        self.frames, cur = [], None
        for ln in open(amc):
            s = ln.split()
            if not s or s[0].startswith(("#", ":")): continue
            if s[0].isdigit(): cur = {}; self.frames.append(cur); continue
            cur[s[0]] = list(map(float, s[1:]))
        self.rest, _ = self.welt(None)

    def welt(self, fr):
        W = {}
        def go(n, Rp):
            b = self.bones[n]; v = fr.get(n, []) if fr else []
            ang = {"rx": 0.0, "ry": 0.0, "rz": 0.0}
            dofs = b["dof"] if n != "root" else ["tx", "ty", "tz", "rx", "ry", "rz"]
            for d, x in zip(dofs, v): ang[d] = x
            R = Rp @ b["C"] @ rot(ang["rx"], ang["ry"], ang["rz"]) @ b["C"].inverted()
            W[n] = R
            for k in self.kids.get(n, []): go(k, R)
        go("root", Matrix.Identity(3))
        P = Vector(fr["root"][0:3]) * CM if fr else None
        return W, P


class Uebertrag:
    """Bindet eine Aufnahme an eine Armatur (cmu_mb). setze(i) stellt die Pose für CMU-Bild i ein."""
    def __init__(self, arm, auf):
        self.arm, self.auf = arm, auf
        mw = arm.matrix_world.to_3x3()
        self.trest = {pb.name: mw @ pb.bone.matrix_local.to_3x3() for pb in arm.pose.bones}
        self.hip0 = (arm.matrix_world @ arm.pose.bones["Hips"].bone.head_local).copy()
        self.align = {}
        for pb in arm.pose.bones:
            n = INV.get(pb.name); b = auf.bones.get(n) if n else None
            tdir = (mw @ (pb.bone.tail_local - pb.bone.head_local)).normalized()
            if b and b["len"] > 0:
                d = (Y2Z @ auf.rest[n] @ b["dir"]).normalized()
                self.align[pb.name] = tdir.rotation_difference(d).to_matrix()
            else:
                self.align[pb.name] = Matrix.Identity(3)
        self.order = []
        def walk(b):
            self.order.append(b.name)
            for c in b.children: walk(c)
        walk(arm.pose.bones["Hips"].bone)
        _, self.start = auf.welt(auf.frames[0])

    def setze(self, i, bodenlage=True):
        import bpy
        W, P = self.auf.welt(self.auf.frames[i])
        mwi = self.arm.matrix_world.to_3x3().inverted()
        for name in self.order:
            n = INV.get(name)
            if n is None: continue
            pb = self.arm.pose.bones[name]
            Rs = Y2Z @ W[n] @ Y2Z.inverted(); Rr = Y2Z @ self.auf.rest[n] @ Y2Z.inverted()
            Rw = Rs @ Rr.inverted() @ self.align[name] @ self.trest[name]
            loc = pb.matrix.to_translation()
            if name == "Hips":
                d = Y2Z @ (P - self.start)
                if not bodenlage: d.x = d.y = 0.0  # am Platz (Schleifen)
                loc = mwi @ (self.hip0 + d - self.arm.matrix_world.translation)
            pb.matrix = Matrix.Translation(loc) @ (mwi @ Rw).to_4x4()
            bpy.context.view_layer.update()
