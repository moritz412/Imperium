// node epo_t.js <html> <port> <modus>  modus: rom|qin|w1:aksum|w3:azteken …  – Epochenwechsel bis 4 über den echten Rundenweg
const {chromium}=require('playwright');const fs=require('fs');
const [FILE,PORT,MODE]=[process.argv[2],process.argv[3]||'8772',process.argv[4]||'rom'];const OUT=__dirname+'/epo/z_';
(async()=>{const T0=Date.now();const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:process.env.PW_GPU?[]:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:1024,height:700},hasTouch:true});const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push('PAGE '+e.message.slice(0,200)));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|WebGL|GPU stall/.test(m.text()))errs.push('CON '+m.text().slice(0,200));if(m.type()==='warning'&&/Chronik|Generationen|Glaubenswelle|Epochenwahl|Siedlungen|Namen|Baukasten|Burg|Modelle/.test(m.text()))errs.push('WARN '+m.text().slice(0,200));});
const net=[];p.on('response',r=>{if(r.status()>=400)net.push(r.status()+' '+r.url().replace(/^.*localhost:\d+\//,''));});
await p.addInitScript(()=>{try{localStorage.setItem('imperium.gfx',JSON.stringify({q:'leicht'}));}catch(e){}});
await p.route(/cdnjs/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));
await p.route(/fonts\.g/,r=>r.abort());await p.route(/\.html$/,r=>r.fulfill({body:fs.readFileSync(FILE),contentType:'text/html; charset=utf-8'}));
console.log('goto',Date.now()-T0);await p.goto(`http://localhost:${PORT}/imperium.html`,{timeout:300000});await p.waitForFunction(()=>document.getElementById('loading').hidden,null,{timeout:300000});
await p.evaluate(()=>{try{RATV.set('on','aus');}catch(e){}
 window.__cm=()=>{const M=document.getElementById('modal');if(!M||M.hidden)return false;const all=[...document.querySelectorAll('#dialog button')].filter(b=>!b.disabled&&b.offsetParent);
   const b=all.find(b=>b.classList.contains('evopt'))||all.find(b=>/^(Berechnen|Weiter|Verstanden|Schließen|OK|Im Buch|Los)/.test(b.textContent.trim()))||all.find(b=>b.classList.contains('primary')&&!/Schlacht/.test(b.textContent))||all.filter(b=>!b.classList.contains('dlgx')).pop();
   if(b){window.__clicks=(window.__clicks||[]);window.__clicks.push(((document.querySelector('#dialog h2')||{}).textContent||'').slice(0,50)+' → '+b.textContent.trim().slice(0,40));b.click();}else closeModal();return true;};
 window.__chk=()=>{const P=[],ids=new Set(),A=[];const facs=Object.keys(S.fac);
   S.prov.forEach((x,i)=>{if(!x.act)return;if(!x.owner||(x.owner!=='frei'&&!S.fac[x.owner]))P.push('Besitzer?'+PROV_DEF[i].id+':'+x.owner);else if(x.owner!=='frei'&&!alive(x.owner))P.push('toter Besitzer '+PROV_DEF[i].id+':'+x.owner);
     if(x.b)for(const k in x.b)if(!(x.b[k]>=0))P.push('Bau NaN '+PROV_DEF[i].id+'.'+k+'='+x.b[k]);if(x.gar!=null&&!(x.gar>=0))P.push('gar '+PROV_DEF[i].id+'='+x.gar);if(!x.cul)P.push('ohne Kultur '+PROV_DEF[i].id);if(!x.rel)P.push('ohne Glaube '+PROV_DEF[i].id);});
   for(const a of S.armies){if(ids.has(a.id))A.push('doppelt '+a.id);ids.add(a.id);if(a.p==null||!S.prov[a.p])A.push('Ort? '+a.name);else if(!S.prov[a.p].act&&!a.boat)A.push('inaktive Provinz '+a.name+'@'+PROV_DEF[a.p].id);if(!S.fac[a.f]||!alive(a.f))A.push('totes Reich '+a.f+' '+a.name);if(!a.units||!a.units.length)A.push('leer '+a.name);
     else for(const u of a.units){try{const st=uStat(a.f,u);if(!st||!(st.atk>=0)&&!(st.a>=0))A.push('Einheit? '+a.name+' '+JSON.stringify(u).slice(0,60));}catch(e){A.push('uStat-Fehler '+a.name+' '+e.message);}}}
   const F=[];for(const f of PLAYABLE){const X=S.fac[f];if(!X||!alive(f))continue;if(!(X.gold>=-1e7)||isNaN(X.gold))F.push('gold '+f);if(!PEOPLE[X.people])F.push('Volk? '+f+':'+X.people);if(capitalOf(f)==null)F.push('ohne Hauptstadt '+f);}
   const me=S.player,mf=S.fac[me];let cityFb=0,cityKit=0;try{CITY.forEach(c=>{if(!c.g.visible)return;if(c.mesh&&c.mesh.parent)cityFb++;else if(c.sig==='K')cityKit++;});}catch(e){}
   return{P:P.slice(0,12),nP:P.length,A:A.slice(0,12),nA:A.length,F,ep:ep(),year:S.year,turn:S.turn,me:FACTIONS[me].name,people:mf.people,cul:facCul(me),rel:facRel(me),provs:provsOf(me).length,armies:S.armies.filter(a=>a.f===me).length,gold:Math.round(mf.gold),kit:!!KIT[ep()],cityFb,cityKit,alive:PLAYABLE.filter(alive).length,pend:!!mf.epPend,ruler:(()=>{try{return dynOf(me).ruler.n+' '+dynOf(me).ruler.age;}catch(e){return'?';}})(),gov:(()=>{try{return Object.keys(govsOf(me)).length;}catch(e){return-1;}})(),wars:rivals(me).filter(x=>atWar(me,x)).length,allies:rivals(me).filter(x=>isAlly(me,x)).length,trade:(()=>{try{return tradeCount(me);}catch(e){return-1;}})(),tech:Object.keys(mf.tech||{}).length,noFace:S.armies.filter(a=>a.gen&&!(a.gen.face>=0)).map(a=>a.f+':'+a.name+':'+(a.gen.n||'')).slice(0,6),cine:(window.CINE&&CINE.imgs)?CINE.imgs.slice(0,4):null};};
});
const R={mode:MODE,steps:[]};console.log('geladen',Date.now()-T0);
const shot=async(n)=>{try{await p.evaluate(()=>{const c=capitalOf(S.player);if(c!=null){setTheater(PCENTER[c].th);focusProv(c,13);}needRender=3;});await p.waitForTimeout(1500);await p.screenshot({path:OUT+MODE.replace(':','_')+'_'+n+'.jpg',quality:65,timeout:60000});}catch(e){R.steps.push({shotErr:n+' '+e.message.slice(0,80)});}};
// Start
const st=await p.evaluate(async(mode)=>{const w=ms=>new Promise(z=>setTimeout(z,ms));const t=performance.now();
  if(mode.startsWith('w')){const[we,f]=mode.slice(1).split(':');const W=await loadWorlds();const S0=S;startWorld(+we,f);for(let k=0;k<240&&(S===S0||ep()!==+we);k++)await w(500);if(S===S0)return{err:'Welt nicht gestartet'};}
  else{newGame(mode);loadGame(S);}
  for(let k=0;k<20;k++){if(!__cm())break;await w(400);}try{$('#tut').hidden=true;}catch(e){}
  for(let k=0;k<60&&!KIT[ep()];k++)await w(250);return{ms:Math.round(performance.now()-t),chk:__chk()};},MODE);
const setup=await p.evaluate(()=>{const f=S.player,F=S.fac[f];F.gold=99999;const A=S.armies.filter(a=>a.f===f&&!a.boat);const a=A[0];const out={};
  try{out.tross=trossBuy(a);}catch(e){out.trossE=e.message;}
  try{out.sld=[sldHire(a,0),sldHire(a,1)];}catch(e){out.sldE=e.message;}
  try{const foe=rivals(f).find(x=>x!=='horde'&&alive(x)&&capitalOf(x)!=null&&provsOf(f).some(pi=>[...ADJ[pi]].some(n=>S.prov[n].owner===x)));if(foe&&!atWar(f,foe))declareWar(f,foe,true);out.foe=foe;const C=fzCands(a);out.fzN=C.length;if(C.length)out.fz=fzStart(a,C[0].n);}catch(e){out.fzE=e.message;}
  try{const regs=[...new Set(provsOf(f).map(pi=>PROV_DEF[pi].reg))];for(const r of regs){if(appointGov(f,r,0)){out.gov=r;break;}}}catch(e){out.govE=e.message;}
  try{const tp=rivals(f).find(x=>x!=='horde'&&alive(x)&&!atWar(f,x)&&inContact(f,x));if(tp){setTrade(f,tp,true);out.trade=tp;}}catch(e){out.tradeE=e.message;}
  try{const g=rivals(f).find(x=>x!=='horde'&&alive(x)&&!atWar(f,x)&&facRel(x)===facRel(f)&&!isAlly(f,x));if(g){makeGB(f,g);out.gb=g;}}catch(e){out.gbE=e.message;}
  window.__st=()=>{const a2=S.armies.find(x=>x.id===a.id);return{army:!!a2,tr:a2?!!a2.tr:null,sld:a2?a2.units.filter(u=>u.sld||u.v==='condott').length:null,units:a2?a2.units.length:null,old:a2?a2.units.filter(u=>{try{return uStat(f,u).old;}catch(e){return'?';}}).length:null,fz:a2&&a2.fz?{t:PROV_DEF[a2.fz.t].id,dl:a2.fz.dl,o:a2.fz.o,owner:S.prov[a2.fz.t].owner}:null,gov:Object.keys(govsOf(f)),trade:out.trade?{on:!!dip(f,out.trade).trade,alive:alive(out.trade),name:FACTIONS[out.trade].name}:null,gb:out.gb?{on:!!dip(f,out.gb).gb,isGB:(()=>{try{return isGB(f,out.gb);}catch(e){return'?';}})(),rel:[facRel(f),facRel(out.gb)]}:null,foeWar:out.foe?atWar(f,out.foe):null,sldUpk:(()=>{try{return sldUpk(f);}catch(e){return'?';}})(),trossUpk:(()=>{try{return trossUpk(f);}catch(e){return'?';}})()};};
  out.st=__st();return out;});
console.log('setup',JSON.stringify(setup));R.setup=setup;
R.start=st;console.log('start',JSON.stringify(st).slice(0,300));await shot('e'+(st.chk?st.chk.ep:'x')+'_start');
const runTurn=async()=>p.evaluate(async()=>{const w=ms=>new Promise(z=>setTimeout(z,ms));const t0=S.turn,tt=performance.now();window.__clicks=[];
  try{endTurn();}catch(e){return{err:'endTurn '+e.message};}for(let k=0;k<200&&(S.turn===t0||!document.getElementById('modal').hidden);k++){await w(250);__cm();}
  return{ms:Math.round(performance.now()-tt),ok:S.turn!==t0,clicks:window.__clicks.slice(0,14)};});
for(let guard=0;guard<5;guard++){
  const e0=await p.evaluate(()=>ep());if(e0>=4)break;
  // Epoche erzwingen über den echten Weg: Höchstdauer erreicht
  await p.evaluate(()=>{S.epochTurn=S.turn-EPOCH_MAX;});
  const pre=await p.evaluate(()=>__chk());
  console.log('runde',Date.now()-T0);const tr=await runTurn();
  const kitT=await p.evaluate(async()=>{const t=performance.now();for(let k=0;k<80&&!KIT[ep()];k++)await new Promise(z=>setTimeout(z,250));return{ms:Math.round(performance.now()-t),kit:!!KIT[ep()]};});
  const post=await p.evaluate(()=>__chk());
  await shot('e'+post.ep+'_nach');
  // zwei weitere Runden
  const r2=[];for(let i=0;i<2;i++)r2.push(await runTurn());
  const after2=await p.evaluate(()=>__chk());
  // Speichern/Laden direkt
  const sl=await p.evaluate(async()=>{const w=ms=>new Promise(z=>setTimeout(z,ms));try{const txt=JSON.stringify(S);const s=(typeof parseSave==='function')?parseSave(txt):JSON.parse(txt);const t=performance.now();loadGame(s);for(let k=0;k<10;k++){if(!__cm())break;await w(300);}let fb0=0;try{CITY.forEach(c=>{if(c.g.visible&&c.mesh&&c.mesh.parent)fb0++;});}catch(e){}return{ms:Math.round(performance.now()-t),size:txt.length,fbDirekt:fb0,chk:__chk()};}catch(e){return{err:e.message};}});
  const r3=await runTurn();
  console.log('schritt',e0,'->',post.ep,tr.ms,JSON.stringify(post).slice(0,200));const stAfter=await p.evaluate(()=>window.__st?__st():null);console.log('zustand',JSON.stringify(stAfter));R.steps.push({from:e0,to:post.ep,pre,tr,kitT,post,r2,after2,sl,r3,stAfter,errs:errs.splice(0)});break;
  if(post.ep===e0){R.steps.push({stuck:'Epoche nicht gewechselt'});break;}
}
R.net=[...new Set(net)].slice(0,20);R.errsRest=errs;R.total=Math.round((Date.now()-T0)/1000);
fs.writeFileSync(OUT+MODE.replace(':','_')+'.json',JSON.stringify(R,null,1));console.log('DONE',MODE,R.total,'s');await b.close();})().catch(e=>{console.log('FAIL',e.message);process.exit(1);});
