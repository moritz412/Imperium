
# --- Hastatus: Teile an Knochen (Ruhelage), grobe Lage von Hand ---
R3D = r"C:\Users\anmel\Desktop\imperium-bilder\3d"
def teil(datei, knochen, groesse, versatz, drehung):
    vor = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=os.path.join(R3D, datei))
    o = [x for x in bpy.data.objects if x not in vor and x.type == "MESH"][0]
    mw = o.matrix_world.copy(); o.parent = None; o.matrix_world = mw
    bpy.context.view_layer.update()
    bb = [o.matrix_world @ Vector(c) for c in o.bound_box]
    mitte = sum(bb, Vector()) / 8
    ext = max(max(v[k] for v in bb) - min(v[k] for v in bb) for k in range(3))
    m = Matrix.Translation(-mitte) @ o.matrix_world
    m = Matrix.Scale(groesse / ext, 4) @ m
    m = Euler([math.radians(d) for d in drehung], "XYZ").to_matrix().to_4x4() @ m
    pb = arm.pose.bones[knochen]
    mid = arm.matrix_world @ ((pb.bone.head_local + pb.bone.tail_local) / 2)
    m = Matrix.Translation(mid + Vector(versatz)) @ m
    o.parent = arm; o.parent_type = "BONE"; o.parent_bone = knochen
    bpy.context.view_layer.update()
    o.matrix_world = m
    return o

teil("roh_44/teil_helm_A1_montefortino.glb", "Head", 0.30, (0, 0, 0.06), (0, 0, 180))
teil("roh_45/teil_ruest_A1_pectorale.glb", "Spine1", 0.24, (0, -0.13, 0.02), (0, 0, 0))
teil("roh_45/teil_schild_A1_scutum.glb", "LeftForeArm", 1.05, (0.12, -0.12, -0.05), (0, 0, 0))
teil("roh_45/teil_schwert_A1_gladius.glb", "RightHand", 0.68, (0, -0.05, -0.25), (0, 0, 0))
mat = bpy.data.materials.new("tunika"); mat.use_nodes = True
mat.node_tree.nodes["Principled BSDF"].inputs[0].default_value = (0.55, 0.12, 0.08, 1)
for o in bpy.data.objects:
    if o.type == "MESH" and o is not basemesh and o.parent_type != "BONE" and o.parent == basemesh:
        o.data.materials.clear(); o.data.materials.append(mat)
print("TEILE", [o.name for o in bpy.data.objects if o.parent_type == "BONE"])
