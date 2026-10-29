# Test: MPFB-Körper headless erzeugen, Skelett + Proxy, Knochen/Dreiecke/Höhe messen.
# Aufruf: blender.exe -b -P test_koerper.py
import bpy, os
from bl_ext.user_default.mpfb.services import HumanService, LocationService

data = LocationService.get_user_data()
for rig in ("cmu_mb",):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    basemesh = HumanService.create_human(scale=0.1)
    arm = HumanService.add_builtin_rig(basemesh, rig, import_weights=True)
    for px in ("male1591", "proxy741"):
        f = os.path.join(data, "proxymeshes", px, px + ".proxy")
        if not os.path.exists(f):
            print("FEHLT", f); continue
        obj = HumanService.add_mhclo_asset(f, basemesh, asset_type="Proxymeshes", subdiv_levels=0)
        dg = bpy.context.evaluated_depsgraph_get()
        me = obj.evaluated_get(dg).to_mesh()
        me.calc_loop_triangles()
        zs = [(obj.matrix_world @ v.co).z for v in me.vertices]
        print("ERGEBNIS rig=%s proxy=%s knochen=%d dreiecke=%d hoehe=%.2f m" % (rig, px, len(arm.data.bones), len(me.loop_triangles), max(zs) - min(zs)))
        bpy.data.objects.remove(obj)
    print("KNOCHEN", rig, ",".join(b.name for b in arm.data.bones)[:600])
