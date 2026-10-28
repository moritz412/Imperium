// Funktionstest Koalition/Garantie/Kongress. node dip_t.js <html>
const {chromium}=require('playwright');const fs=require('fs');
const FILE=process.argv[2],OUT='/tmp/claude-0/-home-claude/4f60f6a0-fa46-5154-9e84-95c0bd1121bd/scratchpad/par_dip/shots/';
(async()=>{const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:process.env.PW_GPU?[]:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:1180,height:820},deviceScaleFactor:1,hasTouch:true,isMobile:true});const p=await ctx.newPage();const errs=[];
p.on('pageerror',e=>{errs.push(e.message);console.log('PAGEERR',e.message);});p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))errs.push(m.text());});
await p.route(/cdnjs/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));await p.route(/fonts\.g/,r=>r.abort());
await p.route(/\.html$/,r=>r.fulfill({body:fs.readFileSync(FILE),contentType:'text/html; charset=utf-8'}));
await p.goto('http://localhost:8793/imperium.html',{waitUntil:'domcontentloaded',timeout:400000});await p.waitForFunction(()=>document.getElementById('loading').hidden,null,{timeout:400000});
await p.evaluate(()=>{newGame('rom');loadGame(S);});await p.waitForTimeout(2500);await p.evaluate(()=>{closeModal();document.getElementById('tut').hidden=true;});
const ok=(n,c,i='')=>console.log((c?'PASS ':'FAIL ')+n+(i?'  '+i:''));
// 1 Bildung gegen ein großes KI-Reich
let r=await p.evaluate(()=>{const me=S.player;for(const f of PLAYABLE)if(alive(f)&&f!==me)S.fac[f].met=Object.fromEntries(PLAYABLE.map(x=>[x,1]));S.fac[me].met=Object.fromEntries(PLAYABLE.map(x=>[x,1]));
  const big='karthago';const A=[];S.prov.forEach((P,i)=>{if(isAct(i)&&P.owner!==me&&P.owner!==big&&PROV_DEF[i].reg&&Math.random()<0.4)A.push(i);});
  for(const i of A.slice(0,Math.round(activeCount()*0.3))){S.prov[i].owner=big;S.prov[i].flip=S.turn;S.prov[i].flipFrom='frei';}refreshOwnership();
  for(const c of rivals(big))dip(c,big).rel=-30;S.turn=30;S.coal=null;S.coalCd=0;coalitionRound();const C=S.coal;
  return{th:threatOf(big).v,coal:C?{t:C.t,m:C.m}:null,dq:(S.dipQ||[]).map(x=>x.k)};});
ok('Koalition bildet sich gegen großes Reich',r.coal&&r.coal.t==='karthago'&&r.coal.m.length>=2,JSON.stringify(r));
// 2 Bündnisfall: Ziel greift Mitglied an -> andere treten bei
r=await p.evaluate(()=>{const C=S.coal;if(!C)return null;const m0=C.m[0];for(const c of C.m)if(atWar(c,C.t))makePeace(c,C.t);C.war=false;declareWar(C.t,m0);return C.m.map(c=>[c,atWar(c,C.t)]);});
ok('Koalition steht angegriffenem Mitglied bei',r&&r.every(x=>x[1]),JSON.stringify(r));
// 3 Auflösung, wenn Bedrohung sinkt
r=await p.evaluate(()=>{const C=S.coal;const t=C.t;for(const pi of provsOf(t).slice(5)){S.prov[pi].owner='frei';}refreshOwnership();for(let k=0;k<4;k++){S.turn++;coalitionRound();}return{coal:!!S.coal,th:threatOf(t).v,d:S.dstat};});
ok('Koalition löst sich bei geringer Bedrohung auf',!r.coal,JSON.stringify(r));
// 4 Garantie durch KI greift
r=await p.evaluate(()=>{const me=S.player;const small=PLAYABLE.filter(f=>alive(f)&&f!==me&&f!=='horde'&&provsOf(f).length<=3);const s=small[0];const g=PLAYABLE.find(f=>alive(f)&&f!==me&&f!==s&&f!=='horde'&&provsOf(f).length>=3&&!atWar(f,s));
  const a=PLAYABLE.find(f=>alive(f)&&f!==me&&f!==s&&f!==g&&f!=='horde'&&!atWar(f,s)&&!isAlly(f,g)&&!atWar(f,g));S.gar=[{by:g,of:s,until:S.turn+30}];const det=garDeter(a,s);declareWar(a,s);return{s,g,a,war:atWar(g,a),det:+det.toFixed(2),rel:relParts(g,s).map(x=>x[0])};});
ok('Garantiemacht tritt in den Krieg ein',r.war,JSON.stringify(r));
// 5 Spieler garantiert, Bündnisfall als Ereignis
r=await p.evaluate(()=>{const me=S.player;const s=PLAYABLE.find(f=>alive(f)&&f!==me&&f!=='horde'&&provsOf(f).length<=3&&!atWar(me,f));dip(me,s).rel=20;const m=dipCoalAct(s,'gar');
  const a=PLAYABLE.find(f=>alive(f)&&f!==me&&f!==s&&f!=='horde'&&!atWar(f,s)&&!atWar(f,me)&&!isAlly(f,me));S.dipQ=[];declareWar(a,s);const ev=dipEvents(me).map(x=>x.E.id);return{m,s,a,ev,gar:!!garBy(me,s)};});
ok('Spieler-Garantie erzeugt Bündnisfall-Ereignis',r.gar&&r.ev.includes('gar_call'),JSON.stringify(r));
// 6 Kongress
r=await p.evaluate(()=>{const me=S.player;S.coal=null;const foes=PLAYABLE.filter(f=>alive(f)&&f!==me&&f!=='horde'&&sharesBorder(me,f)).slice(0,2);if(foes.length<2){const o=PLAYABLE.filter(f=>alive(f)&&f!==me&&f!=='horde'&&!foes.includes(f));foes.push(...o.slice(0,2-foes.length));}
  for(const x of foes){if(!atWar(me,x))declareWar(me,x,true);dip(me,x).warT=14;}S.turn=60;S.congT=-99;const R=Math.random;Math.random=()=>0.1;S.dipQ=[];const q=dipEvents(me);Math.random=R;window.__q=q;
  return{foes,ev:q.map(x=>x.E.id)};});
ok('Friedenskongress wird ausgelöst',r.ev.includes('kongress'),JSON.stringify(r));
await p.evaluate(()=>{const x=window.__q.find(x=>x.E.id==='kongress');showEvent(x.E,x.ctx,()=>{window.__done=1;});});await p.waitForTimeout(800);await p.screenshot({path:OUT+'kongress.png',timeout:240000});
r=await p.evaluate(()=>{const t=[...document.querySelectorAll('.evopt')].map(b=>b.innerText.replace(/\n/g,' | '));document.querySelector('.evopt').click();return{t,war:window.__q.find(x=>x.E.id==='kongress').ctx,peace:PLAYABLE.filter(f=>f!==S.player&&alive(f)&&dip(S.player,f).nap>S.turn).length,done:window.__done};});
ok('Kongress-Option ausführbar',r.done===1,JSON.stringify(r));
// 7 Koalition gegen den Spieler: Übersicht, Diplomatie-Fenster, Herauslösen
r=await p.evaluate(()=>{const me=S.player;for(const f of PLAYABLE)if(f!==me&&alive(f)&&atWar(me,f))makePeace(me,f);const m=coalCand(me).filter(c=>!isHumanP(c)).slice(0,3);S.coal={t:me,m,t0:S.turn,th:40,war:false,low:0};S.fac[me].gold=5000;
  const it=todoItems().map(x=>x.k);openCoalition();return{m,it};});
await p.waitForTimeout(600);await p.screenshot({path:OUT+'koalition.png',timeout:240000});
ok('Hinweis „Koalition gegen dich“',r.it.includes('coal'),JSON.stringify(r));
await p.evaluate(()=>{closeModal();openDiplomacy(S.coal.m[0]);});await p.waitForTimeout(800);
r=await p.evaluate(()=>{const b=document.querySelector('[data-dip="coalbuy"]');const t=b?b.innerText:null;if(b)b.click();return{t,left:S.coal.m.length,nap:dip(S.player,S.coal?S.coal.t:'x')};});
await p.waitForTimeout(500);await p.screenshot({path:OUT+'diplomatie_koalition.png',timeout:240000});
ok('Mitglied herauslösen',r.t&&r.left>=1,JSON.stringify({t:r.t,left:r.left}));
// 8 alter Spielstand ohne neue Felder
r=await p.evaluate(()=>{delete S.coal;delete S.gar;delete S.dstat;delete S.dipQ;delete S.congT;try{for(let k=0;k<6;k++){S.turn++;coalitionRound();relation(S.player,PLAYABLE[1]);dipEvents(S.player);}openDiplomacy(PLAYABLE.find(f=>f!==S.player&&alive(f)));closeModal();return'ok';}catch(e){return e.message;}});
ok('Alter Spielstand ohne neue Felder',r==='ok',r);
// 9 einige Runden normal spielen
r=await p.evaluate(()=>{window.showEvent=(E,ctx,next)=>{try{E.opts[0].fx(S.player,ctx);}catch(e){window.__E=(window.__E||[]).concat(e.message);}next();};window.picMsg=()=>{};let E=[];
  for(let k=0;k<20;k++){if(S.epReady)S.epGo=true;PENDING.length=0;for(const f of PLAYABLE){if(!alive(f))continue;try{aiDiplomacy(f);aiFaction(f);}catch(e){E.push('ai '+e.message);}}for(const q of PENDING.splice(0)){const a=getArmy(q.aid);if(a)try{battleLog(resolveAttack(a,q.ti));}catch(e){E.push(e.message);}}
    try{newRound();advanceGoals();refreshOwnership();}catch(e){E.push('turn '+e.message);}S.props.length=0;try{runEvents(()=>{});}catch(e){E.push('ev '+e.message);}}
  return{E:E.slice(0,3),E2:(window.__E||[]).slice(0,3),turn:S.turn};});
ok('20 Runden ohne Fehler',!r.E.length&&!r.E2.length,JSON.stringify(r));
console.log('errs',JSON.stringify(errs.slice(0,5)));await b.close();})();
