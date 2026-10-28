# GLB (texturiert) -> Diorama-Eintrag {v,t,h} wie st_a/st_b.json. Aufruf: python3 dioconv.py in.glb out.json budget [flipv]
import sys,json,base64,io,struct,numpy as np,trimesh,pymeshlab
from PIL import Image
src,out,budget=sys.argv[1],sys.argv[2],int(sys.argv[3]);flip=len(sys.argv)>4 and sys.argv[4]=='1'
sc=trimesh.load(src)
geoms=list(sc.geometry.values()) if hasattr(sc,'geometry') else [sc]
m=max(geoms,key=lambda g:len(g.faces))
if hasattr(sc,'graph'):
  for n in sc.graph.nodes_geometry:
    T,gn=sc.graph[n]
    if sc.geometry[gn] is m: m=m.copy();m.apply_transform(T);break
img=m.visual.material.baseColorTexture if hasattr(m.visual.material,'baseColorTexture') else m.visual.material.image
uv=np.asarray(m.visual.uv,dtype=np.float64)
ms=pymeshlab.MeshSet()
M=pymeshlab.Mesh(vertex_matrix=np.asarray(m.vertices,dtype=np.float64),face_matrix=np.asarray(m.faces,dtype=np.int32),v_tex_coords_matrix=uv)
ms.add_mesh(M)
ms.apply_filter('compute_texcoord_transfer_vertex_to_wedge')
ms.apply_filter('meshing_decimation_quadric_edge_collapse_with_texture',targetfacenum=budget,preserveboundary=True,qualitythr=0.6)
R=ms.current_mesh()
V=R.vertex_matrix();F=R.face_matrix();W=R.wedge_tex_coord_matrix().reshape(-1,3,2)
# Wedge-UVs -> eigene Ecken je Dreieck (nicht indiziert, dann einfach indizieren)
P=V[F].reshape(-1,3);UV=W.reshape(-1,2)
mn,mx=P.min(0),P.max(0);c=(mn+mx)/2;s=1/max(mx[0]-mn[0],mx[2]-mn[2])
P=(P-[c[0],mn[1],c[2]])*s
tm=trimesh.Trimesh(P,np.arange(len(P)).reshape(-1,3),process=False);N=tm.vertex_normals if False else np.repeat(tm.face_normals,3,axis=0)
# gleiche Ecken zusammenführen (Position+UV)
key=np.round(np.hstack([P,UV]),5);u,inv=np.unique(key,axis=0,return_index=False,return_inverse=True)
nv=len(u);Pu=np.zeros((nv,3));UVu=np.zeros((nv,2));Nu=np.zeros((nv,3))
Pu[inv]=P;UVu[inv]=UV;np.add.at(Nu,inv,N);Nu/=np.maximum(np.linalg.norm(Nu,axis=1,keepdims=True),1e-9)
I=inv.astype(np.uint16)
if flip:UVu[:,1]=1-UVu[:,1]
b=struct.pack('<II',nv,len(I))+np.clip(np.round(Pu*20000),-32767,32767).astype(np.int16).tobytes()
nb=np.clip(np.round(Nu*127),-127,127).astype(np.int8).tobytes();b+=nb+(b'\0' if len(nb)%2 else b'')
b+=np.clip(np.round(np.mod(UVu,1.0000001)*65535),0,65535).astype(np.uint16).tobytes()+I.tobytes()
im=img.convert('RGB');im.thumbnail((1024,1024));bio=io.BytesIO();im.save(bio,'WEBP',quality=78)
json.dump({'v':base64.b64encode(b).decode(),'t':'data:image/webp;base64,'+base64.b64encode(bio.getvalue()).decode(),'h':round(float(Pu[:,1].max()),3)},open(out,'w'))
print(out,'nv',nv,'tri',len(I)//3,'h',round(float(Pu[:,1].max()),3),'KB',len(b)//1024+len(bio.getvalue())//1024)
