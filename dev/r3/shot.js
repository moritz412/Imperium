// Kontaktbogen-Vorschau mit three r128 (headless Chromium).
//   node shot.js '<json jobs>' [out.jpg] [spalten]
// Job: {"glb":"pfad.glb"} oder {"pack":"paket.json","id":"key"}; optional "label", "d" (Abstand, Standard 2.6*max(1,breite)),
//      "el" (Höhenwinkel in Grad, Standard 22; Städte el=30, d=3.2), "az" (Drehung in Grad, Standard 35).
// Packs werden genau wie im Spiel gelesen (mdlParse: int16/16000, Gruppe 1 = Reichsfarbe rot).
const {chromium}=require('/opt/npm-tools/node_modules/playwright');const fs=require('fs'),path=require('path');
const jobs=JSON.parse(process.argv[2]);const OUT=process.argv[3]||'shot.jpg';const COLS=+(process.argv[4]||Math.min(6,jobs.length));
const T=300;const V=path.join(__dirname,'vendor');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const rows=Math.ceil(jobs.length/COLS);const p=await b.newPage({viewport:{width:COLS*T,height:rows*(T+22)}});
  await p.setContent('<html><body style="margin:0;background:#2b2f36;font:12px sans-serif;color:#eee"><div id=g style="display:grid;grid-template-columns:repeat('+COLS+','+T+'px)"></div></body></html>');
  await p.addScriptTag({content:fs.readFileSync(path.join(V,'three.min.js'),'utf8')});await p.addScriptTag({content:fs.readFileSync(path.join(V,'GLTFLoader.js'),'utf8')});
  const data=jobs.map(j=>j.glb?{...j,b64:fs.readFileSync(j.glb).toString('base64')}:{...j,b64:JSON.parse(fs.readFileSync(j.pack,'utf8'))[j.id]||''});
  const r=await p.evaluate(async({data,T})=>{const out=[];const g=document.getElementById('g');
    const dec=s=>{const bin=atob(s),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return u.buffer;};
    function mdlParse(buf){const h=new Uint32Array(buf,0,2),res=[];let o=8;for(const nt of[h[0],h[1]]){const nv=nt*3,P=new Int16Array(buf.slice(o,o+nv*6));o+=nv*6;const N=new Int8Array(buf,o,nv*3);o+=nv*3;const C=new Uint8Array(buf,o,nv*3);o+=nv*3;
      const pp=new Float32Array(nv*3),n=new Float32Array(nv*3),c=new Float32Array(nv*3);for(let i=0;i<nv*3;i++){pp[i]=P[i]/16000;n[i]=N[i]/127;c[i]=C[i]/255;}res.push({p:pp,n,c});}return res;}
    for(const j of data){const cell=document.createElement('div');const cv=document.createElement('canvas');cv.width=cv.height=T;const lb=document.createElement('div');lb.style.cssText='height:22px;padding:2px 6px;white-space:nowrap;overflow:hidden';cell.append(cv,lb);g.append(cell);
      const R=new THREE.WebGLRenderer({canvas:cv,antialias:true,preserveDrawingBuffer:true});R.setClearColor(0x3a4048);const sc=new THREE.Scene();
      sc.add(new THREE.HemisphereLight(0xfff4e0,0x404850,0.75));const dl=new THREE.DirectionalLight(0xffffff,0.75);dl.position.set(2,4,3);sc.add(dl);
      const grid=new THREE.Mesh(new THREE.PlaneGeometry(6,6),new THREE.MeshLambertMaterial({color:0x6b6450}));grid.rotation.x=-Math.PI/2;sc.add(grid);
      let obj=new THREE.Group(),info='';try{
        if(j.glb){const gl=await new Promise((ok,er)=>new THREE.GLTFLoader().parse(dec(j.b64),'',ok,er));obj=gl.scene;obj.traverse(o=>{if(!o.isMesh)return;if(!o.geometry.attributes.normal)o.geometry.computeVertexNormals();const fac=/fac/.test(o.name),ca=o.geometry.attributes.color;
          if(ca){const n=ca.count,f=new Float32Array(n*3),sc2=ca.normalized||ca.array instanceof Uint8Array?255:ca.array instanceof Uint16Array?65535:1;for(let i=0;i<n;i++){f[i*3]=ca.array[i*ca.itemSize]/sc2;f[i*3+1]=ca.array[i*ca.itemSize+1]/sc2;f[i*3+2]=ca.array[i*ca.itemSize+2]/sc2;}o.geometry.setAttribute('color',new THREE.BufferAttribute(f,3));}
          if(fac)o.material=new THREE.MeshLambertMaterial({color:0xb02020,side:THREE.DoubleSide});
          else if(ca)o.material=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});
          else{const m0=o.material;o.material=new THREE.MeshLambertMaterial({map:m0&&m0.map||null,color:m0&&m0.color?m0.color:0xcccccc,side:THREE.DoubleSide});}});}
        else{const M=mdlParse(dec(j.b64));M.forEach((m,i)=>{if(!m.p.length)return;const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.BufferAttribute(m.p,3));G.setAttribute('normal',new THREE.BufferAttribute(m.n,3));G.setAttribute('color',new THREE.BufferAttribute(m.c,3));
          obj.add(new THREE.Mesh(G,new THREE.MeshLambertMaterial({vertexColors:i===0,color:i?0xb02020:0xffffff,side:THREE.DoubleSide})));});info=M.map(m=>m.p.length/9).join('+')+' △';}
      }catch(e){info='FEHLER '+e.message;}
      sc.add(obj);const bb=new THREE.Box3().setFromObject(obj),sz=bb.getSize(new THREE.Vector3());const w=Math.max(sz.x,sz.z,0.01);
      const d=j.d||2.6*Math.max(1,w),el=(j.el??22)*Math.PI/180,az=(j.az??35)*Math.PI/180;const cam=new THREE.PerspectiveCamera(30,1,0.01,100);
      const cy=sz.y/2;cam.position.set(Math.sin(az)*Math.cos(el)*d,cy+Math.sin(el)*d,Math.cos(az)*Math.cos(el)*d);cam.lookAt(0,cy,0);R.render(sc,cam);
      if(!info){let n=0;obj.traverse(o=>{if(o.isMesh)n+=o.geometry.attributes.position.count/3;});info=n+' △';}
      lb.textContent=(j.label||j.id||j.glb.split('/').pop())+' · '+info+' · '+sz.x.toFixed(2)+'×'+sz.y.toFixed(2)+'×'+sz.z.toFixed(2);out.push(lb.textContent);}
    return out;},{data,T});
  await p.screenshot({path:OUT,type:'jpeg',quality:85,fullPage:true});console.log(r.join('\n'));console.log('→',OUT);await b.close();})();
