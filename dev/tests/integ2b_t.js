// Integrationstests Task 01 (iPad-Emulation in Chromium: Touch, DPR 2, 1180x820). Aufruf: node integ.js <html>
const {chromium}=require('playwright');const fs=require('fs');
const FILE=process.argv[2]||require('path').join(__dirname,'..','imperium.html');
const R=[];const ok=(n,c,info='')=>{R.push([n,!!c,info]);console.log((c?'PASS ':'FAIL ')+n+(info?'  '+info:''));};
(async()=>{const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:process.env.PW_GPU?[]:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:1180,height:820},deviceScaleFactor:2,hasTouch:true,isMobile:true});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>{errs.push(e.message);console.log('PAGEERR',e.message);});
p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))errs.push(m.text());});
await p.route(/cdnjs/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));
await p.route(/fonts\.g/,r=>r.abort());
await p.route(/\.html$/,r=>r.fulfill({body:fs.readFileSync(FILE),contentType:'text/html; charset=utf-8'}));
await p.goto('http://localhost:8796/imperium.html',{timeout:300000});await p.waitForFunction(()=>document.getElementById('loading').hidden,null,{timeout:400000});await p.waitForTimeout(1500);
ok('Pixelratio auf Touch-Gerät begrenzt',await p.evaluate(()=>renderer.getPixelRatio()<=2),'pr='+await p.evaluate(()=>renderer.getPixelRatio()+' dpr='+devicePixelRatio));
const load=async k=>{await p.evaluate(()=>openTestSaves());await p.waitForTimeout(400);await p.evaluate(k=>document.querySelectorAll('[data-ts]')[k].click(),k);await p.waitForTimeout(2500);await p.evaluate(()=>{document.getElementById('tut').hidden=true;});};
await load(0);
ok('Heer-Plaketten mit Stärke und Zusammensetzung',await p.evaluate(()=>{refresh();const c=[...document.querySelectorAll('.achip:not(.fchip)')];return c.length>0&&c.every(e=>e.querySelector('.pw')&&e.querySelector('.cmp'));}));
ok('Vegetation gekachelt, Kacheln mit Grenzen',await p.evaluate(()=>TREES.length>5&&TREES.every(T=>T.c&&T.im.geometry.boundingSphere)));
ok('Einheitenkarten klappbar, Aufwertungs-Hinweis stimmt',await p.evaluate(()=>{let bad=0,n=0;for(const a of S.armies.filter(x=>x.f===S.player)){UI.army=a.id;UI.mode='army';renderSheet();a.units.forEach((u,i)=>{n++;const I=canUpgrade(a.f,a,u);const exp=retrainTargets(a.f,u).some(k=>canRetrain(a.f,a,u,k).ok)||((u.wpn||0)<2&&canEquip(a.f,a,u,'wpn').ok)||((u.arm||0)<2&&canEquip(a.f,a,u,'arm').ok)||(I.I.kind!=='max'&&I.ok);const card=document.querySelectorAll('#shBody details.ucard')[i];if(!card||!!card.querySelector('.upd')!==exp)bad++;});}UI.mode='idle';UI.army=null;refresh();return n>0&&bad===0;}));
ok('Terrain-Attribut sh auf allen Kacheln',await p.evaluate(()=>TERRAIN_MESHES.every(m=>m.geometry.attributes.sh&&m.geometry.attributes.sh.count===m.geometry.attributes.position.count)));
// Provinzauswahl per Touch-Tap (Raycasting auf Terrain)
const targets=await p.evaluate(()=>{const f=S.player,c0=CAP[capitalOf(f)];CAM.tx=c0.x;CAM.tz=c0.z+0.5;CAM.d=9;CAM.yaw=0;camTween=null;clampCam();applyCam();camera.updateMatrixWorld();
  const out=[];const V3=new THREE.Vector3();
  for(let pi=0;pi<PROV_DEF.length&&out.length<14;pi++){if(!isAct(pi)||!isKnown(pi))continue;const c=CAP[pi];if(Math.hypot(c.x-CAM.tx,c.z-CAM.tz)>7)continue;
    const T=PROV_TILES[pi];if(!T||!T.length)continue;let best=null,bd=1e9;for(const t of T){const d=Math.abs(Math.hypot(t.x-c.x,t.z-c.z)-0.32);if(d<bd&&pidAt(t.x,t.z)===pi){bd=d;best=t;}}if(!best)continue;
    V3.set(best.x,heightAt(best.x,best.z),best.z).project(camera);const x=(V3.x+1)/2*innerWidth,y=(1-V3.y)/2*innerHeight;if(x<60||x>innerWidth-60||y<90||y>innerHeight-120)continue;out.push({pi,x,y,name:PROV_DEF[pi].name,coast:(COASTP.get(pi)||0)});}return out;});
await p.waitForTimeout(800);
let hits=0,coastHits=0,coastN=0;const miss=[];
for(const t of targets){await p.evaluate(()=>{UI.sel=null;UI.mode='idle';UI.army=null;});
  // Ziel kann von einer Heer-Plakette (HTML) verdeckt sein: dann zählt der Test nicht
  const blocked=await p.evaluate(t=>{const e=document.elementFromPoint(t.x,t.y);return e&&e.id!=='gl'&&e.id!=='tilt'?(e.className||e.tagName):'';},t);
  if(blocked){continue;}
  await p.touchscreen.tap(t.x,t.y);await p.waitForTimeout(350);const [s,ar]=await p.evaluate(()=>[UI.sel,UI.army]);if(ar!=null)continue;if(s===t.pi)hits++;else miss.push(t.name+'->'+s);if(t.coast>0){coastN++;if(s===t.pi)coastHits++;}}
ok('Provinzauswahl per Tap',hits>0&&miss.length===0,`${hits} Treffer, Küstenprovinzen ${coastHits}/${coastN}, Fehler: ${miss.join(', ')||'keine'}`);
// Zoom (Mausrad) und Verschieben (Touch-Wischen)
const d0=await p.evaluate(()=>CAM.d);await p.mouse.move(600,400);await p.mouse.wheel(0,-400);await p.waitForTimeout(500);const d1=await p.evaluate(()=>CAM.d);
ok('Kamera-Zoom',d1<d0,`d ${d0.toFixed(2)} -> ${d1.toFixed(2)}`);
const tx0=await p.evaluate(()=>CAM.tx);
// Gesten-Logik direkt mit Pointer-Events (CDP-Touch ist unter Software-Rendering zu langsam und löst den 430-ms-Halten-Timer aus)
await p.evaluate(()=>{const c=document.getElementById('gl');c.setPointerCapture=()=>{};const ev=(t,x,y)=>c.dispatchEvent(new PointerEvent(t,{pointerId:7,pointerType:'touch',clientX:x,clientY:y,bubbles:true,isPrimary:true}));ev('pointerdown',700,450);for(let k=1;k<=10;k++)ev('pointermove',700-k*25,450);ev('pointerup',450,450);});
await p.waitForTimeout(600);const tx1=await p.evaluate(()=>CAM.tx);ok('Kamera verschieben (Wischgeste)',Math.abs(tx1-tx0)>0.05,`tx ${tx0.toFixed(2)} -> ${tx1.toFixed(2)}`);
// Städte reagieren auf Zustandsänderungen
const ct=await p.evaluate(()=>{const pi=CITY.findIndex((c,i)=>c.tier===1&&isAct(i)&&isKnown(i)&&S.prov[i].owner!=='frei');const before=CITY[pi].tier;S.prov[pi].b.walls=1;refresh();const mid=CITY[pi].tier;S.prov[pi].b.walls=0;refresh();return{pi,before,mid,after:CITY[pi].tier};});
ok('Stadtstufe folgt Mauern (1->3->1)',ct.before===1&&ct.mid===3&&ct.after===1,JSON.stringify(ct));
const ow=await p.evaluate(()=>{const pi=CITY.findIndex((c,i)=>c.tier===1&&isAct(i)&&S.prov[i].owner==='frei');const f=S.player;const o=S.prov[pi].owner;S.prov[pi].owner=f;refreshOwnership();refresh();const m=CITY[pi].fac?CITY[pi].fac.material===FMAT[f]:null;S.prov[pi].owner=o;refreshOwnership();refresh();return{pi,m,back:CITY[pi].fac?CITY[pi].fac.material===(FMAT[o]||FMAT.frei):null};});
ok('Stadt-Fraktionsfarbe nach Besitzwechsel',ow.m!==false&&ow.back!==false,JSON.stringify(ow));
const caps=await p.evaluate(()=>{let bad=0,n=0;const cs=cityCaps();for(const c of cs){n++;if(CITY[c].tier!==4)bad++;}return{n,bad};});ok('Alle Reichshauptstädte Stufe 4',caps.bad===0,JSON.stringify(caps));
// Städte schweben/versinken nicht: Stadtgruppe auf Geländehöhe
const fl=await p.evaluate(()=>{let mx=0;CITY.forEach((c,i)=>{const h=Math.max(0.02,heightAt(c.g.position.x,c.g.position.z));mx=Math.max(mx,Math.abs(c.g.position.y-h));});return mx;});ok('Städte auf Geländehöhe',fl<0.005,'max Abweichung '+fl.toFixed(4));
// Wasserebene liegt unter allem Land
ok('Meeresebene unter Landfläche',await p.evaluate(()=>{let mn=1e9;for(const W of WORLDS)for(let i=0;i<W.HG.length;i++)if(W.HG[i]>0&&W.HG[i]<mn)mn=W.HG[i];return sea.position.y<mn&&sea.position.y<=-0.03;}));
// Geometrie-Neuerstellung im Leerlauf
await p.waitForTimeout(15000);// Aufwärmen: Geometrien werden beim ersten Sichtbarwerden einmalig hochgeladen// Städte werden nach dem Laden schrittweise aufgebaut; erst danach messen
const g0=await p.evaluate(()=>renderer.info.memory.geometries);await p.waitForTimeout(3000);const g1=await p.evaluate(()=>renderer.info.memory.geometries);ok('Keine Geometrie-Neuerstellung im Leerlauf (3 s)',g1===g0,`${g0} -> ${g1}`);
// Speichern und Laden
const sv=await p.evaluate(()=>{const t=S.turn,own=S.prov.map(P=>P.owner).join(),r=save('imperium.test.v1');const s2=JSON.parse(localStorage.getItem('imperium.test.v1'));loadGame(s2);return{r,same:S.turn===t&&S.prov.map(P=>P.owner).join()===own};});
ok('Speichern und Laden',sv.r&&sv.same,JSON.stringify(sv));
// Epochenwechsel (echte Spielfunktion) aktualisiert Darstellung
const ep=await p.evaluate(()=>{const e0=ep(),fog0=scene.fog.color.getHexString();doEpoch();refreshOwnership();refresh();const e1=ep();return{e0,e1,uEp:TU.uEp.value,fogChanged:scene.fog.color.getHexString()!==fog0,fogSync:TMAT.uniforms.fogCol.value.getHexString()===scene.fog.color.getHexString(),vis:CITY.filter(c=>c.vis).length};});
await p.waitForTimeout(4000);ep.citySig=await p.evaluate(e1=>CITY.filter(c=>c.vis&&c.kit&&c.ke===e1).length+(typeof ARMY!=='undefined'&&ARMY[e1]?1000:0),ep.e1);
ok('Epochenwechsel aktualisiert Uniforms/Nebel/Städte',ep.e1===ep.e0+1&&ep.uEp===ep.e1&&ep.fogSync&&ep.citySig>0,JSON.stringify(ep));
await p.waitForTimeout(1500);await p.screenshot({path:'it_epoch.png',timeout:400000});
// Flotten und Seewege
const fr=await p.evaluate(()=>{const f=S.fleets?S.fleets.find(x=>x.f===S.player):null;if(!f)return{none:true,lines:SEA_LINES.filter(s=>s.ln.visible).length};return{reach:fleetReach(f).size,lines:SEA_LINES.filter(s=>s.ln.visible).length};});
ok('Seewege sichtbar / Flottenreichweite',fr.lines>0&&(fr.none||fr.reach>0),JSON.stringify(fr));
// Speicherlecks bei wiederholten Ladevorgängen (Szene neu belegt)
for(let k=0;k<5;k++){await load(k);}await load(0);await p.waitForTimeout(1000);// Aufwärmrunde: alle Epochen einmal geladen
const m0=await p.evaluate(()=>({g:renderer.info.memory.geometries,t:renderer.info.memory.textures}));
for(let k=0;k<4;k++){await load(k%5);}
await load(0);await p.waitForTimeout(1000);
const m1=await p.evaluate(()=>({g:renderer.info.memory.geometries,t:renderer.info.memory.textures}));
ok('Speicher nach 5 Ladevorgängen stabil (Geometrien/Texturen)',m1.g<=m0.g*1.25+20&&m1.t<=m0.t+4,JSON.stringify([m0,m1]));
// Kampfszene öffnen und verlassen
const bt=await p.evaluate(()=>new Promise(res=>{try{const a=S.armies.find(x=>x.f===S.player);const ti=[...ADJ[a.p]].find(q=>S.prov[q].owner!==S.player&&isAct(q))??a.p;let done=false;startBattle({a,ti,playerAttacker:true,done:()=>{done=true;}});setTimeout(()=>{const open=!!BATTLE;try{endBattle(0,'test');}catch(e){}setTimeout(()=>res({open,closed:!BATTLE,done}),800);},1500);}catch(e){res({err:e.message});}}));
ok('Kampfszene öffnen/verlassen',bt.open&&bt.closed,JSON.stringify(bt));
await p.waitForTimeout(1200);await p.screenshot({path:'it_afterbattle.png',timeout:400000});
ok('Keine Seiten-/Konsolenfehler',errs.length===0,errs.slice(0,3).join(' | '));
fs.writeFileSync('integ_result.json',JSON.stringify(R,null,1));
await b.close();})();
