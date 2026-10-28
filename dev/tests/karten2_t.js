// node karten2_t.js <html> [port] – Kartenansichten Stufe 2
const {chromium}=require('playwright');const fs=require('fs');
const FILE=process.argv[2],PORT=process.argv[3]||'8772',OUT=__dirname+'/k2_';
(async()=>{const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:process.env.PW_GPU?[]:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:1180,height:820},deviceScaleFactor:1,hasTouch:true});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push('PAGE '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|WebGL|GPU stall/.test(m.text()))errs.push('CON '+m.text().slice(0,200));});
await p.addInitScript(()=>{try{localStorage.setItem('imperium.gfx',JSON.stringify({q:'leicht'}));}catch(e){}});
await p.route(/cdnjs/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));
await p.route(/fonts\.g/,r=>r.abort());
await p.route(/\.html$/,r=>r.fulfill({body:fs.readFileSync(FILE),contentType:'text/html; charset=utf-8'}));
await p.goto(`http://localhost:${PORT}/imperium.html`,{timeout:300000});await p.waitForFunction(()=>document.getElementById('loading').hidden,null,{timeout:300000});
const R=[];const ok=(n,c,i='')=>{R.push(!!c);console.log((c?'PASS ':'FAIL ')+n+(i?'  '+(typeof i==='string'?i:JSON.stringify(i)):''));};
await p.evaluate(()=>{window.showEvent=(E,ctx,next)=>{try{E.opts[0].fx(S.player,ctx);}catch(e){}next&&next();};window.picMsg=()=>{};});
// Welt mit mehr Diplomatie: Startwelt Epoche 2
const w=await p.evaluate(async()=>{const W=await loadWorlds();const S0=S;startWorld(2,W[2].facs[0].f);for(let k=0;k<180&&(S===S0||ep()!==2);k++)await new Promise(z=>setTimeout(z,500));closeModal();
  for(let i=0;i<2;i++){endTurn();await new Promise(z=>setTimeout(z,2500));closeModal();}return{pl:S.player,t:S.turn};});
console.log('Welt',JSON.stringify(w));
// 1) Diplomatie, Sicht von X, Linien
const d1=await p.evaluate(async()=>{const w=ms=>new Promise(z=>setTimeout(z,ms));closeModal();setMapMode('dip');await w(400);const me=S.player;
  const fs=PLAYABLE.filter(f=>f!==me&&f!=='horde'&&S.fac[f]&&alive(f)&&knows(f));
  // Reich mit Bündnis oder Krieg bevorzugen
  const sc=f=>fs.filter(g=>g!==f&&(atWar(f,g)||dip(f,g).st==='ally')).length;fs.sort((a,b)=>sc(b)-sc(a));const X=fs[0];
  const me0={leg:$('#legend').innerText.slice(0,120),lines:DIPLG?DIPLG.children.length:0,c0:[...PAL.slice(PAL_W*4,PAL_W*4+12)]};
  setDipView(X);await w(400);const own=provsOf(me)[0],xp=capitalOf(X);
  const r={X,known:fs.length,sc:sc(X),me0,leg:$('#legend').innerText.slice(0,200),view:dipViewer(),lines:DIPLG.children.length,kOwn:dipK(me),kX:dipK(X),vi:viewInfo(own).replace(/<[^>]+>/g,' ').slice(0,160)};
  focusProv(xp,18);await w(800);return r;});
ok('Diplomatie: Sicht von Reich X',d1.view===d1.X&&/Sicht:/.test(d1.leg)&&d1.kX===0,d1);
ok('Bündnis-/Kriegslinien gebaut (nur Diplomatie)',d1.lines>0||d1.sc===0,{lines:d1.lines,sc:d1.sc});
await p.screenshot({path:OUT+'dip_sicht.jpg',quality:70,timeout:90000}).catch(e=>console.log('shot',e.message.slice(0,60)));
const d2=await p.evaluate(async()=>{const w=ms=>new Promise(z=>setTimeout(z,ms));const b=document.querySelector('#legend [data-dipme]');b.click();await w(300);const v1=dipViewer()===S.player;setMapMode('eco');await w(300);return{v1,lines:DIPLG?DIPLG.children.length:-1,dv:DIPVIEW};});
ok('„Deine Sicht“ und Linien weg außerhalb Diplomatie',d2.v1&&d2.lines===0&&d2.dv===null,d2);
// 2) Diplomatiefenster „Auf der Karte“
const d3=await p.evaluate(async()=>{const w=ms=>new Promise(z=>setTimeout(z,ms));const me=S.player;const X=PLAYABLE.find(f=>f!==me&&f!=='horde'&&S.fac[f]&&alive(f)&&knows(f));openDiplomacy(X);await w(300);
  const btn=[...document.querySelectorAll('#modal button')].find(b=>/Auf der Karte/.test(b.textContent));btn.click();await w(400);return{X,mode:MAPMODE,view:dipViewer(),modal:!$('#modal').hidden};});
ok('Diplomatiefenster → Karte aus Sicht des Reichs',d3.mode==='dip'&&d3.view===d3.X&&!d3.modal,d3);
// Tippen in Diplomatie-Ansicht (Klick auf Provinz eines anderen Reichs per tapAt-Weg simuliert über onProvinceTap-Code)
const d4=await p.evaluate(async()=>{const w=ms=>new Promise(z=>setTimeout(z,ms));setDipView(null,true);const me=S.player;const pi=S.prov.findIndex((P,i)=>P.owner!==me&&P.owner!=='frei'&&knows(P.owner)&&isAct(i)&&isKnown(i)&&PCENTER[i].th===CAM.th);
  focusProv(pi,10);camTween=null;const c=CAP[pi];CAM.tx=c.x;CAM.tz=c.z+0.6;CAM.d=10;clampCam();await w(900);
  // Bildschirmposition der Provinz
  const v=new THREE.Vector3(c.x,0.1,c.z).project(camera),r=renderer.domElement.getBoundingClientRect();return{pi,o:S.prov[pi].owner,x:r.left+(v.x+1)/2*r.width,y:r.top+(1-v.y)/2*r.height};});
await p.evaluate(([x,y])=>{UI.mode='idle';UI.sel=null;tapAt(x,y);},[d4.x,d4.y]);await p.waitForTimeout(700);
const d5=await p.evaluate(()=>({view:dipViewer(),sel:UI.sel,hold:(document.querySelector('#holdInfo, .holdinfo')||{}).innerText||''}));
ok('Antippen eines fremden Reichs setzt dessen Sicht',d5.view===d4.o,{want:d4.o,got:d5.view,sel:d5.sel,tapped:d4.pi});
await p.screenshot({path:OUT+'dip_tap.jpg',quality:70,timeout:90000}).catch(e=>console.log('shot',e.message.slice(0,60)));
// 3) Forschung → Wissen
const t1=await p.evaluate(async()=>{const w=ms=>new Promise(z=>setTimeout(z,ms));closeModal();const f=S.player,F=S.fac[f];
  let t=TECHS.find(t=>t.ep<=ep()&&!t.reg&&!t.rep&&techAvail(f,t)&&!hasTech(f,t.id)&&PLAYABLE.some(x=>x!==f&&S.fac[x]&&alive(x)&&hasTech(x,t.id)));if(!t)t=TECHS.find(t=>techAvail(f,t)&&!hasTech(f,t.id)&&!t.rep);setResearch(f,t.id);openResearch();await w(300);
  const b=$('#tecMap');if(!b)return{err:'kein Knopf',t:t.id};b.click();await w(500);const L=$('#legend').innerText;const own=provsOf(f)[0];
  const ks={};S.prov.forEach((P,i)=>{if(isAct(i)&&LEGB)ks[LEGB[i]]=(ks[LEGB[i]]||0)+1;});return{t:t.id,mode:MAPMODE,leg:L.slice(0,220),ks,stored:localStorage.getItem('imperium.mapmode')};});
ok('Forschung „Wer kennt …? Auf der Karte“ → Ansicht Wissen',t1.mode==='tec'&&/Kennt es/.test(t1.leg)&&t1.stored!=='tec',t1);
await p.screenshot({path:OUT+'wissen.jpg',quality:70,timeout:90000}).catch(e=>console.log('shot',e.message.slice(0,60)));
// 4) ✕ in der Legende
const x1=await p.evaluate(async()=>{const b=document.querySelector('#legend .lclose');b.click();await new Promise(z=>setTimeout(z,300));return{mode:MAPMODE,leg:$('#legend').hidden};});
ok('✕ in der Legende → Politik',x1.mode==='pol'&&x1.leg,x1);
// 5) Überblendung: Zwischenwert kurz nach dem Wechsel, Endwert danach
const f1=await p.evaluate(async()=>{const o1=PAL_W*4,n=PROV_DEF.length*4;setMapMode('ord',true);await new Promise(z=>setTimeout(z,600));const A=PAL.slice(o1,o1+n);
  const t0=performance.now();setMapMode('eco',true);const B=PAL.slice(o1,o1+n);const S2=[];let fr=0;const cnt=()=>{fr++;if(performance.now()-t0<700)requestAnimationFrame(cnt);};requestAnimationFrame(cnt);
  for(let i=0;i<25;i++){await new Promise(z=>setTimeout(z,25));S2.push([Math.round(performance.now()-t0),PAL.slice(o1,o1+n)]);}
  const E=PAL.slice(o1,o1+n);let dAB=0,ch=0;for(let j=0;j<n;j++){if(B[j]!==A[j])dAB++;if(A[j]!==E[j])ch++;}
  const mids=S2.map(([t,M])=>{let m=0;for(let j=0;j<n;j++)if(A[j]!==E[j]&&M[j]!==A[j]&&M[j]!==E[j])m++;return[t,m];}).filter(x=>x[1]>0);
  syncTiles();const F2=PAL.slice(o1,o1+n);let same=0;for(let j=0;j<n;j++)if(F2[j]===E[j])same++;return{ch,mid:mids.length,mids:mids.slice(0,4),frames:fr,startIsOld:dAB===0,endFresh:same===n};});
ok('Überblendung: Start alt, Zwischenwerte, Ende neu',f1.ch>0&&f1.mid>0&&f1.startIsOld&&f1.endFresh,f1);
// 6) Region, Rat, Agent
const r1=await p.evaluate(async()=>{const w=ms=>new Promise(z=>setTimeout(z,ms));setMapMode('pol',true);const reg=PROV_DEF[provsOf(S.player)[0]].reg;openRegion(reg);await w(300);
  const b=[...document.querySelectorAll('#modal button')].find(b=>/Auf der Karte/.test(b.textContent));if(!b)return{err:'kein Knopf'};b.click();await w(400);const r={REGHL,bar:!!$('#regBar')&&!$('#regBar').hidden,modal:!$('#modal').hidden};try{regionOff();}catch(e){}return r;});
ok('Region „Auf der Karte“ hebt die Region hervor',r1.REGHL!=null&&r1.bar&&!r1.modal,r1);
const r2=await p.evaluate(async()=>{const w=ms=>new Promise(z=>setTimeout(z,ms));const f=S.player;S.rat=S.rat||{L:[]};S.rat.L.unshift({k:'testkarte',o:'statthalter',urg:3,txt:'Test',why:[],act:{k:'fest',pi:provsOf(f)[0]},vo:'unruhe'});openRat();await w(300);
  const b=document.querySelector('[data-ratmap]');if(!b)return{err:'kein Knopf'};b.click();await w(400);S.rat.L=S.rat.L.filter(x=>x.k!=='testkarte');return{mode:MAPMODE,sel:UI.sel,want:provsOf(f)[0],modal:!$('#modal').hidden};});
ok('Rat 🗺 → passende Ansicht (Ordnung) und Provinz',r2.mode==='ord'&&r2.sel===r2.want&&!r2.modal,r2);
const r3=await p.evaluate(async()=>{const w=ms=>new Promise(z=>setTimeout(z,ms));const f=S.player,F=S.fac[f];F.gold=Math.max(F.gold,2000);let ag=agentsOf(f).find(a=>a.t==='haendler'||Object.keys(AG_ACTS).some(k=>AG_ACTS[k].t===a.t&&k==='handel'));
  if(!ag){const t=Object.keys(AGENT_T).find(t=>AG_ACTS.handel&&AG_ACTS.handel.t===t);try{hireAgent(f,t);}catch(e){return{err:'hire '+e.message};}ag=agentsOf(f).find(a=>a.t===t);}
  if(!ag)return{err:'kein Agent'};AG_SEL={id:ag.id,act:'handel'};openHof('ag');await w(400);const b=document.querySelector('[data-agmap]');if(!b)return{err:'kein Knopf'};b.click();await w(400);return{mode:MAPMODE,modal:!$('#modal').hidden};});
ok('Händlerwahl → Handelskarte',r3.mode==='han'&&!r3.modal,r3);
// 7) altes Speichern/Laden
const s1=await p.evaluate(async()=>{save(KEY_AUTO);const s=JSON.parse(localStorage.getItem(KEY_AUTO));loadGame(s);setMapMode('dip',true);await new Promise(z=>setTimeout(z,300));return{t:S.turn,ok:true};});
ok('Speichern/Laden in Diplomatie-Ansicht',s1.ok,s1);
await p.screenshot({path:OUT+'dip_eigen.jpg',quality:70,timeout:90000}).catch(e=>console.log('shot',e.message.slice(0,60)));
ok('Keine Seiten-/Konsolenfehler',!errs.length,errs.slice(0,5).join(' | '));
console.log(`KARTEN2 ${R.filter(Boolean).length}/${R.length}`);await b.close();})();
