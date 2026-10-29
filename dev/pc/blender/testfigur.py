# Baut eine einfache Testfigur (Mensch, 5 Knochen, 2 Clips) und exportiert sie als .glb – nur zum Prüfen der Skripte.
# Aufruf: python3 testfigur.py ziel.glb
import sys, math
import bpy

ziel = [a for a in sys.argv[1:] if not a.endswith('.py')][-1]
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.fps = 30
bpy.ops.object.armature_add(location=(0, 0, 0))
arm = bpy.context.object; arm.name = 'sk_mensch'
bpy.ops.object.mode_set(mode='EDIT')
eb = arm.data.edit_bones
root = eb[0]; root.name = 'becken'; root.head = (0, 0, 0.95); root.tail = (0, 0, 1.15)
def knochen(n, par, h, t):
    b = eb.new(n); b.head = h; b.tail = t; b.parent = eb[par]; return b
knochen('brust', 'becken', (0, 0, 1.15), (0, 0, 1.5))
knochen('kopf', 'brust', (0, 0, 1.5), (0, 0, 1.75))
knochen('bein.L', 'becken', (0.1, 0, 0.95), (0.1, 0, 0.0))
knochen('bein.R', 'becken', (-0.1, 0, 0.95), (-0.1, 0, 0.0))
bpy.ops.object.mode_set(mode='OBJECT')
# Körper: drei Zylinder (Rumpf, Beine), automatisch gewichtet nach Höhe/Seite
bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.18, depth=0.8, location=(0, 0, 1.35))
rumpf = bpy.context.object
bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.07, depth=0.95, location=(0.1, 0, 0.475)); bl = bpy.context.object
bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.07, depth=0.95, location=(-0.1, 0, 0.475)); br = bpy.context.object
bpy.ops.object.select_all(action='DESELECT')
for o in (rumpf, bl, br): o.select_set(True)
bpy.context.view_layer.objects.active = rumpf
bpy.ops.object.join(); koerper = bpy.context.object; koerper.name = 'koerper_m_mittel'
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
for n in ['becken', 'brust', 'kopf', 'bein.L', 'bein.R']:
    koerper.vertex_groups.new(name=n)
for v in koerper.data.vertices:
    x, z = v.co.x, v.co.z
    if z < 0.95:
        koerper.vertex_groups['bein.L' if x > 0 else 'bein.R'].add([v.index], 1.0, 'REPLACE')
    elif z < 1.2:
        koerper.vertex_groups['becken'].add([v.index], 1.0, 'REPLACE')
    elif z < 1.5:
        koerper.vertex_groups['brust'].add([v.index], 1.0, 'REPLACE')
    else:
        koerper.vertex_groups['kopf'].add([v.index], 1.0, 'REPLACE')
koerper.parent = arm
m = koerper.modifiers.new('Armature', 'ARMATURE'); m.object = arm
# Teil: Helm am Kopf-Knochen
bpy.ops.mesh.primitive_uv_sphere_add(segments=8, ring_count=5, radius=0.12, location=(0, 0, 1.75))
helm = bpy.context.object; helm.name = 'teil_helm_A1_test'
helm.parent = arm; helm.parent_type = 'BONE'; helm.parent_bone = 'kopf'
helm.matrix_world = __import__('mathutils').Matrix.Translation((0, 0, 1.75))
# Clips
def clip(name, n, fn):
    arm.animation_data_create()
    act = bpy.data.actions.new(name); arm.animation_data.action = act
    for f in range(n + 1):
        ph = f / n
        for b, (ax, ang) in fn(ph).items():
            pb = arm.pose.bones[b]; pb.rotation_mode = 'XYZ'
            r = [0, 0, 0]; r[ax] = ang; pb.rotation_euler = r
            pb.keyframe_insert('rotation_euler', frame=f)
    tr = arm.animation_data.nla_tracks.new(); tr.name = name
    tr.strips.new(name, 0, act); arm.animation_data.action = None
clip('stehen', 30, lambda p: {'brust': (0, 0.05 * math.sin(p * 2 * math.pi))})
clip('gehen', 24, lambda p: {'bein.L': (0, 0.5 * math.sin(p * 2 * math.pi)), 'bein.R': (0, -0.5 * math.sin(p * 2 * math.pi))})
bpy.ops.export_scene.gltf(filepath=ziel, export_format='GLB', export_animations=True, export_animation_mode='NLA_TRACKS')
print('Testfigur geschrieben:', ziel)
