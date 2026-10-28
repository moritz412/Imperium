// node fz_t.js <html> [port] – Feldzugsziele des Spielers
const {chromium}=require('playwright');const fs=require('fs');
const FILE=process.argv[2],PORT=process.argv[3]||'8772',FAC=process.argv[4]||'rom';
(async()=>{const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:process.env.PW_GPU?[]:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:1024,height:768},deviceScaleFactor:1,hasTouch:true,isMobile:true});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push('PAGE '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|WebGL|GPU stall/.test(m.text()))errs.push('CON '+m.text().slice(0,160));});
await p.addInitScript(()=>{try{localStorage.setItem('imperium.gfx',JSON.stringify({q:'leicht'}));}catch(e){}});
await p.route(/cdnjs/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));
await p.route(/fonts\.g/,r=>r.abort());
await p.route(/\.html$/,r=>r.fulfill({body:fs.readFileSync(FILE),contentType:'text/html; charset=utf-8'}));
await p.goto(`http://localhost:${PORT}/imperium.html`,{timeout:300000});await p.waitForFunction(()=>document.getElementById('loading').hidden,null,{timeout:300000});
const R=[];const ok=(n,c,i='')=>{R.push(!!c);console.log((c?'PASS ':'FAIL ')+n+(i?'  '+i:''));};
await p.evaluate(()=>{window.showEvent=(E,ctx,next)=>{try{E.opts[0].fx(S.player,ctx);}catch(e){}next&&next();};window.picMsg=()=>{};});
// Aufbau: Rom, Krieg mit einem Reich, dessen Land 3+ Provinzen entfernt liegt
if(FAC==='w2'){await p.evaluate(async()=>{const W=await loadWorlds();const S0=S;startWorld(2,W[2].facs[0].f);for(let k=0;k<180&&(S===S0||ep()!==2);k++)await new Promise(z=>setTimeout(z,500));closeModal();});await p.waitForTimeout(1500);}
const setup=await p.evaluate((FAC)=>{if(FAC!=='w2'){newGame(FAC);loadGame(S);}closeModal();if(S.known)S.known=S.known.map(()=>true);const me=S.player;const A=S.armies.filter(a=>a.f===me&&!a.boat).sort((x,y)=>armyPower(y)-armyPower(x));
  let best=null;for(const a of A)for(const x of rivals(me)){const d=dip(me,x),old=d.st;d.st='war';const C=fzCands(a).filter(c=>c.o===x).sort((u,v)=>v.h-u.h);d.st=old;if(C.length&&(!best||C[0].h>best.h))best={aid:a.id,x,t:C[0].n,h:C[0].h,from:a.p,name:FACTIONS[x].name};}
  if(best){for(const y of rivals(me))if(y!==best.x&&dip(me,y).st==='war')dip(me,y).st='peace';dip(me,best.x).st='war';const a=getArmy(best.aid);const t=best.t;let q=a.p,qd=-1;for(const pi of provsOf(me)){const o=a.p;a.p=pi;const P=fzPath(a,t);a.p=o;if(P&&P.length>qd){qd=P.length;q=pi;}}a.p=q;a.pos=null;a.goal=null;a.mp=maxMP(a);best.from=q;best.h=qd;}return best;},FAC);
if(!setup)console.log('    dbg',await p.evaluate(()=>{const me=S.player,a=S.armies.find(a=>a.f===me);return JSON.stringify({riv:rivals(me).length,known:S.known?S.known.filter(Boolean).length:'-',cands:rivals(me).map(x=>{const d=dip(me,x),o=d.st;d.st='war';const c=fzCands(a).map(c=>c.h);d.st=o;return x+':'+c.join(',');}).filter(t=>!t.endsWith(':')).slice(0,12)});}));
ok('Aufbau: Krieg + fernes Ziel',!!setup,JSON.stringify(setup));if(!setup){await b.close();return;}
// Bedienung wie am iPad: Heer antippen -> Feldzug ausrufen -> Ziel antippen
await p.evaluate(a=>{UI.army=a;UI.sel=null;UI.mode='army';refresh();},setup.aid);
const btn=p.locator('[data-act="fzPick"]');ok('Knopf „Feldzug ausrufen“ sichtbar',await btn.count()>0);
console.log('    sheet',await p.evaluate(()=>{const q=s=>{const e=document.querySelector(s);if(!e)return s+':-';const c=getComputedStyle(e),r=e.getBoundingClientRect();return s+' '+c.overflowY+' h'+Math.round(r.height)+' top'+Math.round(r.top)+' sh'+e.scrollHeight+' cls='+e.className;};return[q('#sheet'),q('#shBody')].join(' | ');}));
console.log('    hit',await p.evaluate(()=>{const b=document.querySelector('[data-act="fzPick"]'),r=b.getBoundingClientRect(),e=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);const m=document.querySelector('[data-act="move"]'),rm=m&&m.getBoundingClientRect(),em=m&&document.elementFromPoint(rm.x+rm.width/2,rm.y+rm.height/2);return JSON.stringify({r:[r.x,r.y,r.width,r.height],hit:e&&(e.outerHTML||'').slice(0,90),vh:innerHeight,move:em&&(em.outerHTML||'').slice(0,60),rm:rm&&[rm.y]});}));
console.log('    scroll',await p.evaluate(async()=>{const B=document.querySelector('#shBody');const n0=document.querySelector('[data-act="fzPick"]');B.scrollTop=99999;const a=B.scrollTop;await new Promise(z=>setTimeout(z,800));const n1=document.querySelector('[data-act="fzPick"]');return{a,b:B.scrollTop,same:n0===n1,y:n1.getBoundingClientRect().y};}));await btn.first().scrollIntoViewIfNeeded().catch(()=>{});console.log('    nach Scroll',await p.evaluate(()=>{const b=document.querySelector('[data-act="fzPick"]'),r=b.getBoundingClientRect(),e=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return r.y+' '+(e&&e.dataset?e.dataset.act:'-');}));await btn.first().tap({timeout:8000}).catch(async e=>{console.log('    tap fehlgeschlagen, Klick per Ereignis');await btn.first().dispatchEvent('click');});await p.waitForTimeout(400);
const n=await p.locator(`[data-fzt="${setup.t}"]`).count();ok('Zielliste zeigt das Ziel',n>0,'Einträge '+await p.locator('[data-fzt]').count());
await p.screenshot({path:__dirname+'/fz_pick.jpg',quality:70});
await p.locator(`[data-fzt="${setup.t}"]`).first().tap();await p.waitForTimeout(600);
let st=await p.evaluate(a=>{const A=getArmy(a);return{fz:A.fz,p:A.p,goal:A.goal,mp:A.mp,line:(document.querySelector('.fzline')||{}).textContent||'',chip:!!document.querySelector('.fzf')};},setup.aid);
ok('Feldzug gesetzt, Heer zieht sofort los',st.fz&&st.fz.t===setup.t,JSON.stringify(st).slice(0,300));
ok('Feldzugs-Anzeige im Heer-Fenster',/Feldzug gegen/.test(st.line),st.line.slice(0,140));
await p.evaluate(a=>{const A=getArmy(a);try{const P=fzPath(A,A.fz.t)||[];focusProv(P[Math.floor(P.length/3)]??A.p,16);}catch(e){}try{$('#sheet').classList.add('collapsed');}catch(e){}syncPath();},setup.aid);await p.waitForTimeout(1500);await p.screenshot({path:__dirname+'/fz_map.jpg',quality:70});
await p.evaluate(()=>{try{$('#sheet').classList.remove('collapsed');}catch(e){}});console.log('    Linie',await p.evaluate(()=>PATHG.children.length),'Fahne',await p.evaluate(()=>document.querySelectorAll('.fzf').length));
// 4 Runden laufen lassen
const trace=await p.evaluate(async a=>{const out=[];const dist=()=>{const A=getArmy(a);if(!A||!A.fz)return null;const P=fzPath(A,A.fz.t);return P?P.length:-1;};
  for(let i=0;i<4;i++){const A=getArmy(a);if(!A)break;out.push({p:A.p,d:dist(),goal:A.goal,fz:!!A.fz});try{endTurn();}catch(e){out.push('ERR '+e.message);break;}await new Promise(z=>setTimeout(z,2500));closeModal();}
  const A=getArmy(a);out.push(A?{p:A.p,d:dist(),goal:A.goal,fz:!!A.fz}:'weg');
  out.push(S.log.filter(e=>/Feldzug/.test(e.t)).slice(-4).map(e=>e.t));return out;},setup.aid);
console.log('    Verlauf',JSON.stringify(trace).slice(0,900));
const pos=trace.filter(x=>x&&x.d!=null&&x.d>=0);
ok('Heer rückt über Runden vor oder hält gemeldet',pos.length>=2&&(pos[pos.length-1].d<pos[0].d||/wartet|hält an|beendet|gescheitert|erfolgreich/.test(JSON.stringify(trace))),'Abstand '+pos.map(x=>x.d).join('→'));
// Halt bei starkem Feindheer
const halt=await p.evaluate(a=>{const A=getArmy(a);if(!A)return'kein Heer';if(!A.fz){A.fz={t:fzCands(A)[0].n,t0:S.turn,dl:S.turn+10,o:S.prov[fzCands(A)[0].n].owner};}
  const x=A.fz.o;const nb=[...ADJ[A.p]].find(n=>isAct(n))??A.p;const E=scenArmy(x,nb,Array.from({length:10},()=>['sword']),'Testfeind');E.f=x;A.fz.n=null;A.goal=5;fzStep(A);
  const r={goal:A.goal,fz:!!A.fz,log:S.log.slice(-1)[0].t};S.armies.splice(S.armies.indexOf(E),1);return r;},setup.aid);
ok('Hält bei starkem Feindheer und meldet sich',halt.goal==null&&halt.fz&&/hält an/.test(halt.log),JSON.stringify(halt).slice(0,220));
// Speichern/Laden
const sl=await p.evaluate(a=>{const A=getArmy(a);const t=A.fz&&A.fz.t;save(KEY_AUTO);const s=JSON.parse(localStorage.getItem(KEY_AUTO));loadGame(s);closeModal();const B=getArmy(a);return{t,after:B&&B.fz&&B.fz.t};},setup.aid);
ok('Feldzug übersteht Speichern/Laden',sl.t!=null&&sl.t===sl.after,JSON.stringify(sl));
// Abbrechen per Knopf
await p.evaluate(a=>{UI.army=a;UI.sel=null;UI.mode='army';refresh();},setup.aid);
const eb=p.locator('[data-act="fzEnd"]');ok('Knopf „Feldzug abbrechen“',await eb.count()>0);if(await eb.count())await eb.first().tap();await p.waitForTimeout(300);
ok('Abbrechen löscht Feldzug',await p.evaluate(a=>!getArmy(a).fz,setup.aid));
// Erfolg: Ziel gehört uns
const win=await p.evaluate(a=>{const A=getArmy(a);const C=fzCands(A);if(!C.length)return'keine Ziele';fzStart(A,C[0].n);const w0=wwOf(S.player);S.prov[A.fz.t].owner=S.player;fzStep(A);return{fz:!!A.fz,ww:[w0,wwOf(S.player)],log:S.log.slice(-1)[0].t,fame:fameOf(A.gen)};},setup.aid);
ok('Ziel genommen: Erfolg, Ruhm, Kriegsmüdigkeit sinkt',win&&win.fz===false&&/erfolgreich/.test(win.log),JSON.stringify(win).slice(0,240));
// Frist abgelaufen
const fail=await p.evaluate(a=>{const A=getArmy(a);const C=fzCands(A);if(!C.length)return'keine Ziele';fzStart(A,C[0].n);A.fz.dl=S.turn-1;fzStep(A);return{fz:!!A.fz,log:S.log.slice(-1)[0].t};},setup.aid);
ok('Frist abgelaufen: Scheitern gemeldet',fail&&fail.fz===false&&/gescheitert/.test(fail.log),JSON.stringify(fail).slice(0,200));
// alter Spielstand ohne fz-Feld
const old=await p.evaluate(()=>{const s=JSON.parse(JSON.stringify(S));for(const a of s.armies)delete a.fz;loadGame(s);closeModal();try{endTurn();}catch(e){return'ERR '+e.message;}return'ok';});
await p.waitForTimeout(2500);ok('Spielstand ohne Feldzugsfeld läuft',old==='ok',old);
ok('Keine Seiten-/Konsolenfehler',!errs.length,errs.slice(0,4).join(' | '));
console.log(`FZ ${R.filter(Boolean).length}/${R.length}`);await b.close();})();
