// node glaube2_t.js <html> [port] – Glaubenswelle beim Epochenwechsel 2→3 (Ankündigung + Wahl) und Religionsfrieden
const {chromium}=require('playwright');const fs=require('fs');
const FILE=process.argv[2],PORT=process.argv[3]||'8772';
(async()=>{const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:process.env.PW_GPU?[]:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:1000,height:700},hasTouch:true,isMobile:true});const p=await ctx.newPage();const errs=[];
p.on('pageerror',e=>errs.push('PAGE '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|WebGL|GPU stall/.test(m.text()))errs.push('CON '+m.text().slice(0,200));});
await p.addInitScript(()=>{try{localStorage.setItem('imperium.gfx',JSON.stringify({q:'leicht'}));}catch(e){}});
await p.route(/cdnjs/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));
await p.route(/fonts\.g/,r=>r.abort());
await p.route(/\.html$/,r=>r.fulfill({body:fs.readFileSync(FILE),contentType:'text/html; charset=utf-8'}));
await p.goto(`http://localhost:${PORT}/imperium.html`,{timeout:300000});await p.waitForFunction(()=>document.getElementById('loading').hidden,null,{timeout:300000});
const R=[];const ok=(n,c,i='')=>{R.push(!!c);console.log((c?'PASS ':'FAIL ')+n+(i?'  '+i:''));};
const w=ms=>p.waitForTimeout(ms);
// Startwelt Epoche 2 mit einem christlichen Reich
const st=await p.evaluate(async()=>{const W=await loadWorlds();const S0=S;const cand=W[2].facs.map(x=>x.f);startWorld(2,cand[0]);for(let k=0;k<180&&(S===S0||ep()!==2);k++)await new Promise(z=>setTimeout(z,500));
  closeModal();const f=Object.keys(S.fac).find(x=>alive(x)&&facRel(x)==='christ'&&provsOf(x).length>=4)||S.player;S.player=f;S.fac[f].rel='christ';return{f,ep:ep(),n:provsOf(f).length,rel:facRel(f)};});
console.log('    Start',JSON.stringify(st));
async function epochRun(choice){return p.evaluate(async ch=>{const f=S.player;closeModal();
  // Welle erzwingen: alle eigenen Provinzen werden protestantisch
  const rt=religionTide;window.religionTide=function(e){rt(e);for(const pi of provsOf(f))if(S.prov[pi].rel==='christ'){S.prov[pi].rel='evang';S.prov[pi].rp=0;}};
  S.bookShow=null;doEpoch();window.religionTide=rt;S.bookShow=null;
  const pend=S.fac[f].relWave?{nr:S.fac[f].relWave.nr,old:S.fac[f].relWave.old}:null,relAfter=facRel(f);
  let html1='',html2='';await new Promise(res=>{showEpochNews(res);setTimeout(()=>{html1=document.getElementById('dialog').textContent;
    const btn=document.querySelector('#dialog .actions [data-i]')||document.querySelector('#dialog [data-people]');if(btn)btn.click();
    setTimeout(()=>{html2=document.getElementById('dialog').textContent;const wb=document.querySelector(`[data-wave="${ch}"]`);if(wb)wb.click();
      setTimeout(()=>{for(let i=0;i<4;i++){const x=document.querySelector('[data-tr],[data-ref],[data-people]');if(x)x.click();}closeModal();res();},400);},500);},800);});
  const c=capitalOf(f);return{e:ep(),pend,relAfter,html1:html1.includes('Glaube im neuen Zeitalter'),prov1:/Protestant|Evangel|Luther/i.test(html1),waveModal:html2.includes('erfasst dein Reich'),relNow:facRel(f),h2:html2.slice(0,200),cap:c!=null?S.prov[c].rel:null,mods:S.mods.filter(m=>m.f===f&&/Glaubens/.test(m.label)).map(m=>m.label+' '+m.v+'/'+m.t)};},choice);}
// Spielstand vor dem Wechsel sichern, zweimal testen
await p.evaluate(()=>{window.__s=JSON.stringify(S);});
const a=await epochRun('go');console.log('    go',JSON.stringify(a));
ok('Epoche 3 erreicht',a.e===3);
ok('Staatsglaube wartet auf Wahl (kein Automatikwechsel)',a.pend&&a.pend.nr==='evang'&&a.relAfter==='christ',JSON.stringify(a.pend)+' '+a.relAfter);
ok('Abschnitt „Glaube im neuen Zeitalter“ mit Provinzen',a.html1&&a.prov1);
ok('Wahlfenster erscheint',a.waveModal);
ok('Folgen: Staatsglaube neu + Ordnung −1/4',a.relNow==='evang'&&a.mods.some(m=>/Glaubenswechsel -1\/4/.test(m)),JSON.stringify(a.mods));
await p.evaluate(()=>{loadGame(JSON.parse(window.__s));closeModal();});
const k=await epochRun('keep');console.log('    keep',JSON.stringify(k));
ok('Bleiben: Staatsglaube + Hauptstadt alt, Ordnung −1/8',k.relNow==='christ'&&k.cap==='christ'&&k.mods.some(m=>/Glaubensstreit -1\/8/.test(m)),JSON.stringify(k));
// Religionsfrieden
const rf=await p.evaluate(async()=>{const f=S.player;closeModal();const live=PLAYABLE.filter(x=>S.fac[x]&&alive(x)&&x!==f);S.fac[f].rel='evang';const other=live.find(x=>facRel(x)==='christ')||live[0];S.fac[other].rel='christ';
  const gap0=relGap('christ','evang'),riv0=relRival('christ','evang');S.relFr=null;S.epochTurn=S.turn-10;S.wsT=-99;
  let seen=[];const se=window.showEvent;window.showEvent=(E,ctx,next)=>{seen.push(E.id);if(E.id==='relfrieden'){E.opts[0].fx(f,ctx);window.__pm=PLAYABLE.filter(x=>x!==f&&S.fac[x]&&((dip(f,x).mem||[]).some(m=>m.k==='Religionsfrieden'&&m.v===6))).length;}next&&next();};
  window.picMsg=()=>{};await new Promise(r=>{setTimeout(r,5000);try{runEvents(r);}catch(e){console.error('RE '+e.message);r();}});const early=!!S.relFr;
  S.epochTurn=S.turn-45;const rel0=dip(f,other).rel;await new Promise(r=>{setTimeout(r,5000);try{runEvents(r);}catch(e){console.error('RE '+e.message);r();}});
  const res={early,set:S.relFr,seen:seen.filter(x=>x==='relfrieden').length,gap0,riv0,gap1:relGap('christ','evang'),riv1:relRival('christ','evang'),drel:window.__pm||0,mem:JSON.stringify((dip(f,other).mem||[]).filter(m=>/Religion/.test(m.k))),other,oth:S.fac[other].rel,order:S.mods.some(m=>m.f===f&&m.label==='Religionsfrieden')};
  await new Promise(r=>{setTimeout(r,5000);try{runEvents(r);}catch(e){console.error('RE '+e.message);r();}});res.twice=seen.filter(x=>x==='relfrieden').length;window.showEvent=se;return res;});
console.log('    frieden',JSON.stringify(rf));
ok('Religionsfrieden nicht zu früh',!rf.early);
ok('Religionsfrieden nach 40 Runden, einmal',rf.set&&rf.seen===1&&rf.twice===1);
ok('Konfessionsstreit endet maßvoll (−8 → −2)',rf.gap0&&rf.gap0[1]===-8&&rf.gap1&&rf.gap1[1]===-2&&!rf.riv1,JSON.stringify([rf.gap0,rf.gap1]));
ok('Unterzeichnen: Beziehung +6 (Reiche mit Eintrag), Ordnung',rf.drel>=1&&rf.order,'Reiche '+rf.drel);
// alter Spielstand ohne neue Felder
const old=await p.evaluate(()=>{const s=JSON.parse(window.__s);for(const f in s.fac)if(s.fac[f])delete s.fac[f].relWave;delete s.relFr;loadGame(s);closeModal();try{endTurn();}catch(e){return'ERR '+e.message;}return'ok';});
await w(3000);ok('Alter Spielstand lädt und läuft',old==='ok',old);
ok('Keine Seiten-/Konsolenfehler',!errs.length,errs.slice(0,4).join(' | '));
console.log(`GLAUBE2 ${R.filter(Boolean).length}/${R.length}`);await b.close();})();
