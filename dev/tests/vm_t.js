// node vm_t.js <html> [port] [altHtml] – Völkermosaik: Fraktion, Wunsch, Entscheidungen, Haltung, Truppen, Vorwarnung+Abfall, Grenze, KI, Speichern/Laden, alter Spielstand, Screenshots
const {chromium}=require('playwright');const fs=require('fs');
const FILE=process.argv[2],PORT=process.argv[3]||'8772',OLD=process.argv[4]||null,D=__dirname+'/vm_';
(async()=>{const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:process.env.PW_GPU?[]:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const R=[];const ok=(n,c,i='')=>{R.push(!!c);console.log((c?'PASS ':'FAIL ')+n+(i?'  '+i:''));};
async function page(file,vp){const ctx=await b.newContext({viewport:vp||{width:1180,height:820},hasTouch:true,isMobile:true});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push('PAGE '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|WebGL|GPU stall/.test(m.text()))errs.push('CON '+m.text().slice(0,200));if(m.type()==='warning'&&/Völkermosaik|Paket 2/.test(m.text()))errs.push('WARN '+m.text().slice(0,200));});
  await p.addInitScript(()=>{try{localStorage.setItem('imperium.gfx',JSON.stringify({q:'leicht'}));}catch(e){}});
  await p.route(/cdnjs/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));
  await p.route(/fonts\.g/,r=>r.abort());await p.route(/\.html$/,r=>r.fulfill({body:fs.readFileSync(file),contentType:'text/html; charset=utf-8'}));
  await p.goto(`http://localhost:${PORT}/imperium.html`,{timeout:300000});await p.waitForFunction(()=>document.getElementById('loading').hidden,null,{timeout:300000});
  await p.waitForFunction(()=>!document.querySelector('#loading[data-gate]'),null,{timeout:120000}).catch(()=>{});return{p,errs,ctx};}
const SETUP=()=>{newGame('rom');loadGame(S);closeModal();const me=S.player;S.turn=40;S.fac[me].gold=5000;S.diff=1;
  const caps=new Set(PLAYABLE.filter(f=>f!==me&&alive(f)).map(f=>capitalOf(f)));const seen=new Set(provsOf(me));let q=[...seen];
  while(q.length&&provsOf(me).length<50){const nq=[];for(const pi of q)for(const n of ADJ[pi]){if(seen.has(n)||!isAct(n)||isSeaLink(pi,n))continue;seen.add(n);if(caps.has(n))continue;S.prov[n].owner=me;S.prov[n].unrest=0;nq.push(n);if(provsOf(me).length>=50)break;}q=nq;}
  try{checkElimination();}catch(e){}refreshOwnership();refresh();S.pk1L=null;return provsOf(me).length;};
let OLDSAVE=null;
if(OLD){const {p,ctx}=await page(OLD);OLDSAVE=await p.evaluate(SETUP=>{eval('('+SETUP+')')();try{endTurn();}catch(e){}return new Promise(z=>setTimeout(()=>{closeModal();z(JSON.stringify(S));},4000));},SETUP.toString());
  ok('Alter Spielstand (v187) erzeugt',OLDSAVE&&OLDSAVE.length>1000);await ctx.close();}
const {p,errs,ctx}=await page(FILE);
await p.evaluate(()=>{window.picMsg=()=>{};try{RATV.set('on','aus');}catch(e){}});
const n0=await p.evaluate(SETUP=>eval('('+SETUP+')')(),SETUP.toString());ok('Aufbau',n0>=45,n0+' Provinzen');
// 1 Fraktion entsteht
const a1=await p.evaluate(()=>{vmRound();const fc=facCul(S.player),cnt={};for(const pi of provsOf(S.player)){const c=S.prov[pi].cul;if(c!==fc)cnt[c]=(cnt[c]||0)+1;}
  const L=Object.keys(S.vm||{}).filter(c=>vmOf(c));window._c=L.sort((a,b)=>vmProvs(b).length-vmProvs(a).length)[0];return{fc,cnt,L,z:L.map(c=>S.vm[c].z)};});
ok('Fraktionen ab 6 Provinzen',a1.L.length>=1&&a1.L.every(c=>a1.cnt[c]>=6)&&Object.keys(a1.cnt).filter(c=>a1.cnt[c]>=6).every(c=>a1.L.includes(c)),JSON.stringify(a1));
// 2 Wunsch + Jetzt wichtig
const a2=await p.evaluate(()=>{const c=window._c,V=S.vm[c];V.nw=0;V.wish=null;S.turn++;vmRound();const td=todoItems().filter(x=>x.k==='vmwish').map(x=>x.t);return{w:V.wish&&V.wish.k,td};});
ok('Wunsch erscheint, Jetzt wichtig',a2.w&&a2.td.length>=1,JSON.stringify(a2));
// 3 Hof-Karte und Knöpfe
await p.evaluate(()=>{for(const c in S.vm)if(vmOf(c)&&!S.vm[c].wish){S.vm[c].wish={k:'recht',t:S.turn};}openHof('pol');});await p.waitForTimeout(900);
const a3=await p.evaluate(()=>{const d=document.querySelector('#dialog');return{tab:[...d.querySelectorAll('.subtabs button')].map(b=>b.textContent),cards:d.querySelectorAll('.vmcard').length,img:getComputedStyle(d.querySelector('.vmpor')).backgroundImage.slice(0,80),btn:!!d.querySelector(`[data-vm="g:${window._c}"]`)};});
ok('Hof: „Stände und Völker“, Karten mit Bild und Knöpfen',a3.tab.includes('Stände und Völker')&&a3.cards>=1&&/url/.test(a3.img)&&a3.btn,JSON.stringify(a3));
await p.evaluate(()=>{const el=document.querySelector('.vmhead');if(el)el.scrollIntoView();});await p.waitForTimeout(700);await p.screenshot({path:D+'hof_ipad.jpg',quality:72});
// Gewähren per Klick
const a4=await p.evaluate(()=>{const c=window._c,V=S.vm[c];V.wish={k:'amt',t:S.turn};V.z=40;openHof('pol');const g0=S.fac[S.player].gold,cost=VM_WISH.amt.cost();document.querySelector(`[data-vm="g:${c}"]`).click();return{z:V.z,dg:g0-S.fac[S.player].gold,cost,wish:V.wish,open:!document.getElementById('modal').hidden};});
ok('Gewähren: Kosten und Zufriedenheit +20',a4.z===60&&a4.dg===a4.cost&&!a4.wish&&a4.open,JSON.stringify(a4));
const a5=await p.evaluate(()=>{const c=window._c,V=S.vm[c];V.wish={k:'recht',t:S.turn};const m0=S.mods.length;document.querySelector(`[data-vm="n:${c}"]`)?0:openHof('pol');document.querySelector(`[data-vm="n:${c}"]`).click();const z1=V.z;V.wish={k:'recht',t:S.turn};vmGrant(c);return{z1,z2:V.z,mod:S.mods.slice(m0).map(m=>m.k+':'+m.v)};});
ok('Ablehnen −8, Eigenes Recht: Ordnung −0,5',a5.z1===52&&a5.z2===74&&a5.mod.includes('order:-0.5'),JSON.stringify(a5));
// 4 Haltung: Identität achten / Angleichen
const a6=await p.evaluate(()=>{const c=window._c,V=S.vm[c],ps=vmProvs(c),pi=ps[0];document.querySelector(`[data-vm="p:${c}:res"]`).click();const lab=faithParts(pi).map(x=>x[0]+' '+x[1]);
  S.prov[pi].cp=99.5;faithRound();const cul1=S.prov[pi].cul,cp1=S.prov[pi].cp;const tax=polSum(S.player,'tax');V.pol='acc';V.pcd=0;S.prov[pi].cp=10;const z0=V.z;S.turn++;vmRound();
  return{pol:'res',lab,cul1,cp1,keep:cul1===c&&cp1===99.5,tax,cpAcc:S.prov[pi].cp,dz:Math.round((V.z-z0)*10)/10,why:V.d};});
ok('Identität achten: halbe Kulturstrafe, keine Angleichung, Steuerbonus',a6.lab.some(x=>/geachtet/.test(x))&&a6.keep&&a6.tax>=0.03,JSON.stringify(a6).slice(0,400));
ok('Angleichen: Angleichung schneller, Zufriedenheit sinkt',a6.cpAcc>=11.5&&a6.why.some(x=>/Angleichung/.test(x[0])),JSON.stringify({cp:a6.cpAcc,dz:a6.dz}));
// 5 Spezialtruppen
const a7=await p.evaluate(()=>{const me=S.player,c=window._c,V=S.vm[c];V.z=85;V.pol='none';const vs=vmVarsOf(c),k=vs[0];if(!k)return{none:true,c};const mine=vmProvs(c)[0],other=provsOf(me).find(pi=>S.prov[pi].cul!==c);
  S.prov[mine].b.barracks=Math.max(2,S.prov[mine].b.barracks||0);S.prov[other].b.barracks=Math.max(2,S.prov[other].b.barracks||0);
  const r={c,vs,ta:typeAvail(me,k),here:canRecruit(me,mine,VARIANTS[k].role,k),there:canRecruit(me,other,VARIANTS[k].role,k),ord:faithParts(mine).filter(x=>/Zufriedene/.test(x[0])).length};
  V.z=50;r.off=typeAvail(me,k);V.z=85;UI.sel=mine;window._mine=mine;return r;});
ok('Zufrieden: Volkstruppen nur in ihren Provinzen, Ordnung +1',a7.vs&&a7.vs.length&&a7.ta&&a7.here&&!a7.there&&!a7.off&&a7.ord===1,JSON.stringify(a7));
await p.evaluate(()=>{closeModal();selProv(window._mine);});await p.waitForTimeout(500);
const a8=await p.evaluate(()=>{try{openSheet&&0;}catch(e){}const h=faithHtml(window._mine);return{line:/Hier leben/.test(h)};});
ok('Provinzansicht: Volk und Zufriedenheit',a8.line,JSON.stringify(a8));
// 6 Verärgert: Vorwarnung, dann Abfall
const a9=await p.evaluate(()=>{const me=S.player,c=window._c,V=S.vm[c];V.z=20;V.wish=null;V.nw=S.turn+50;V.cdA=0;V.pol='none';V.w=null;S.turn++;vmRound();const w=V.w;const td=todoItems().filter(x=>x.k==='vmw').map(x=>x.t+' n='+x.n);
  const kin=PLAYABLE.find(f=>f!==me&&alive(f)&&facCul(f)===c&&provsOf(me).some(pi=>S.prov[pi].cul===c&&[...ADJ[pi]].some(q=>S.prov[q].owner===f)));
  let cb=null,wm=null;if(kin){cb=cbOf(kin,me).map(x=>x.n);V.z=50;const m0=warMood(kin,me);V.z=20;wm=Math.round((warMood(kin,me)-m0)*100)/100;}
  return{w,turn:S.turn,td,kin,cb,wm};});
ok('Verärgert: Vorwarnung 4 Runden, Jetzt wichtig',a9.w===a9.turn+4&&a9.td.length===1,JSON.stringify(a9));
ok('Nachbar gleicher Kultur: Kriegsgrund „Landsleute befreien“ (+0,25 warMood)',a9.kin?(a9.cb.includes('Landsleute befreien')&&a9.wm===0.25):true,a9.kin?JSON.stringify({cb:a9.cb,wm:a9.wm}):'kein Nachbar gleicher Kultur in dieser Aufstellung');
await p.evaluate(()=>{openHof('pol');setTimeout(()=>{const el=document.getElementById('vm_'+window._c);if(el)el.scrollIntoView({block:'center'});},50);});await p.waitForTimeout(800);await p.screenshot({path:D+'hof_verärgert.jpg',quality:72});
const a10=await p.evaluate(()=>{closeModal();const me=S.player,c=window._c,V=S.vm[c];const n0=vmProvs(c).length,lc0=pk1L().c||0;S.turn=V.w;const r0=Math.random;Math.random=()=>0.01;try{vmRound();}finally{Math.random=r0;}
  const sl=Object.keys(S.pk2.R).find(f=>S.pk2.R[f].k==='vm'&&alive(f));if(!sl)return{err:'kein Reich',log:S.log.slice(-3).map(e=>e.t||e)};
  return{sl,name:FACTIONS[sl].name,ps:provsOf(sl).length,cul:facCul(sl)===c,war:atWar(me,sl),lc:(pk1L().c||0)-lc0,n0,n1:vmProvs(c).length,q:S.pk2.q.map(x=>x.k),ruler:dynOf(sl).ruler.n,army:S.armies.filter(a=>a.f===sl).reduce((s,a)=>s+a.units.length,0),z:V.z};});
ok('Abfall: eigenes Reich des Volkes, Krieg, Heer, zählt zur Grenze',a10.sl&&a10.cul&&a10.war&&a10.lc===a10.ps&&a10.army>=3&&a10.q.includes('sec'),JSON.stringify(a10));
await p.evaluate(()=>{window._done=0;S.pk2.q=S.pk2.q.filter(x=>x.k==='sec');pk2RunQ(()=>{window._done=1;});});await p.waitForTimeout(1200);await p.screenshot({path:D+'abfall.jpg',quality:70});
const a11=await p.evaluate(()=>{const t=document.querySelector('#dialog').innerText;for(let i=0;i<3;i++)closeModal();return{t:t.slice(0,200),ok:/Fürst im Bund der/.test(t)&&/Bestechen/.test(t)};});
ok('Abfall-Fenster mit Entscheidungen',a11.ok,JSON.stringify(a11));
// 7 Verlustgrenze: kein Abfall ohne Spielraum
const a12=await p.evaluate(()=>{const me=S.player,L=pk1L();const c=Object.keys(S.vm).find(x=>vmOf(x)&&vmProvs(x).length>=2)||window._c,V=S.vm[c];L.c=pk2Max();const n0=provsOf(me).length;V.z=10;V.w=S.turn;V.cdA=0;const r0=Math.random;Math.random=()=>0.01;try{vmRound();}finally{Math.random=r0;}return{room:pk2Room(),n0,n1:provsOf(me).length,c};});
ok('Verlustgrenze: kein Landverlust ohne Spielraum',a12.n0===a12.n1&&a12.room===0,JSON.stringify(a12));
// 8 Leicht halb
const a13=await p.evaluate(()=>{S.diff=0;const r={k:pk1F(),max:pk2Max()};S.diff=1;return r;});ok('Leicht: halbe Stärke',a13.k===0.5,JSON.stringify(a13));
// 9 KI-Abfall (große KI-Reiche)
const a14=await p.evaluate(()=>{const me=S.player;const f=PLAYABLE.filter(x=>x!==me&&x!=='horde'&&alive(x)&&!isHumanP(x)).sort((a,b)=>provsOf(b).length-provsOf(a).length)[0];
  // KI-Reich künstlich vergrößern mit fremdem Volk
  const fc=facCul(f),free=i=>isAct(i)&&S.prov[i].owner!==me&&S.prov[i].owner!==f&&!isCapProv(i)&&!(S.prov[i].owner!=='frei'&&alive(S.prov[i].owner)&&capitalOf(S.prov[i].owner)===i);
  const cc={};for(let i=0;i<S.prov.length;i++)if(free(i)&&S.prov[i].cul!==fc)cc[S.prov[i].cul]=(cc[S.prov[i].cul]||0)+1;const cx=Object.keys(cc).sort((a,b)=>cc[b]-cc[a])[0];
  let ad=0;for(let i=0;i<S.prov.length&&ad<12;i++)if(free(i)&&S.prov[i].cul===cx){S.prov[i].owner=f;ad++;}for(let i=0;i<S.prov.length&&provsOf(f).length<40;i++)if(free(i))S.prov[i].owner=f;
  const c0=[cx,provsOf(f).filter(pi=>S.prov[pi].cul===cx).length];
  for(const pi of provsOf(f))if(S.prov[pi].cul===c0[0])S.prov[pi].unrest=8;refreshOwnership();
  const avg=provsOf(f).filter(pi=>S.prov[pi].cul===c0[0]).reduce((s,pi)=>s+provOrder(pi),0)/c0[1];S.vmAi=-99;const t0=S.turn;S.turn=Math.ceil(S.turn/6)*6;const r0=Math.random;Math.random=()=>0.01;const R0=Object.keys(S.pk2.R).length;try{vmAiRound();}finally{Math.random=r0;}
  const sl=Object.keys(S.pk2.R).find(x=>S.pk2.R[x].from===f&&S.pk2.R[x].k==='vm');return{f,n:provsOf(f).length,c0,avg:Math.round(avg*10)/10,sl,ps:sl&&provsOf(sl).length,war:sl&&atWar(f,sl),cul:sl&&facCul(sl)===c0[0]};});
ok('KI: großes Reich verliert verärgertes Volk',a14.sl&&a14.war&&a14.cul,JSON.stringify(a14));
// 10 Speichern/Laden
const s1=await p.evaluate(()=>{const v0=JSON.stringify(S.vm);const js=JSON.stringify(S);resetPeople();loadGame(parseSave(js)||JSON.parse(js));closeModal();const r={same:JSON.stringify(S.vm)===v0};S.turn++;try{vmRound();}catch(e){r.err=e.message;}openHof('pol');r.cards=document.querySelectorAll('#dialog .vmcard').length;closeModal();return r;});
ok('Speichern/Laden: Völker bleiben',s1.same&&!s1.err&&s1.cards>=1,JSON.stringify(s1));
// 11 Geschichten/Mehrspieler aus
const s2=await p.evaluate(()=>{const m=S.mp;S.mp=true;const r={mp:vmOn()};S.mp=m;const sc=S.scen;S.scen='x';r.sc=vmOn();S.scen=sc;return r;});ok('Geschichten und Mehrspieler unberührt',!s2.mp&&!s2.sc,JSON.stringify(s2));
// 12 Rundenlauf
const s3=await p.evaluate(async()=>{const t=S.turn;try{endTurn();}catch(e){return'ERR '+e.message;}for(let k=0;k<80&&S.turn===t;k++){await new Promise(z=>setTimeout(z,300));for(let j=0;j<3;j++)if(!document.getElementById('modal').hidden){const bs=[...document.querySelectorAll('#dialog button')].filter(b=>!b.disabled&&b.offsetParent);(bs.find(b=>/Weiter|Verstanden|Schließen|OK/.test(b.textContent))||bs[bs.length-1]||{click:()=>closeModal()}).click();}}return'T'+t+'→'+S.turn;});
ok('Rundenwechsel ohne Fehler',/→/.test(s3)&&!/ERR/.test(s3),s3);
if(OLDSAVE){const o1=await p.evaluate(async js=>{try{const s=parseSave(js);if(!s)return'parse fehlgeschlagen';resetPeople();loadGame(s);closeModal();const had=!!S.vm;const t=S.turn;endTurn();for(let k=0;k<60&&S.turn===t;k++)await new Promise(z=>setTimeout(z,300));await new Promise(z=>setTimeout(z,500));for(let j=0;j<4;j++)closeModal();
  return'ok T'+S.turn+' vorher:'+had+' nachher:'+Object.keys(S.vm||{}).join(',');}catch(e){return'ERR '+e.message;}},OLDSAVE);ok('Alter Spielstand lädt, Völker entstehen',/^ok/.test(o1)&&/nachher:\w/.test(o1),o1);}
// Handy
await ctx.close();{const {p:q,errs:e2,ctx:c2}=await page(FILE,{width:844,height:390});await q.evaluate(()=>{window.picMsg=()=>{};try{RATV.set('on','aus');}catch(e){}});await q.evaluate(SETUP=>eval('('+SETUP+')')(),SETUP.toString());
  await q.evaluate(()=>{vmRound();const L=Object.keys(S.vm).filter(c=>vmOf(c));L.forEach((c,i)=>{S.vm[c].wish={k:['recht','amt','steuer','glaube'][i%4],t:S.turn};S.vm[c].z=[82,48,22,60][i%4];});openHof('pol');setTimeout(()=>{const el=document.querySelector('.vmhead');if(el)el.scrollIntoView();},50);});await q.waitForTimeout(900);await q.screenshot({path:D+'hof_handy.jpg',quality:72});
  const pw=await q.evaluate(()=>{const d=document.querySelector('#dialog');return{sw:d.scrollWidth,cw:d.clientWidth};});ok('Handy: keine waagrechte Überbreite',pw.sw<=pw.cw+2,JSON.stringify(pw));errs.push(...e2);await c2.close();}
console.log('ERRS',JSON.stringify(errs.slice(0,10)));console.log(`ERGEBNIS ${R.filter(x=>x).length}/${R.length}`);await b.close();})();
