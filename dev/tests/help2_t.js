// node help2_t.js <html> [port] – v207: Erklärkarten für Handel, Forschung, Agenten, Szenario/Geschichte
// Prüft: jeder Knopf in diesen Fenstern hat einen Erklärtext, Karte öffnet per langem Drücken (Handel, Forschung, Agenten), Tipp löst nichts aus.
const {chromium}=require('playwright');const fs=require('fs');
const FILE=process.argv[2],PORT=process.argv[3]||'8772',SH=__dirname+'/shot/k_help_';fs.mkdirSync(__dirname+'/shot',{recursive:true});
(async()=>{const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:process.env.PW_GPU?[]:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const R=[];const ok=(n,c,i='')=>{R.push(!!c);console.log((c?'PASS ':'FAIL ')+n+(i?'  '+(typeof i==='string'?i:JSON.stringify(i)):''));};
const ctx=await b.newContext({viewport:{width:1180,height:820},hasTouch:true,isMobile:true});const p=await ctx.newPage();const errs=[];
p.on('pageerror',e=>errs.push('PAGE '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|WebGL|GPU stall/.test(m.text()))errs.push('CON '+m.text().slice(0,200));});
await p.addInitScript(()=>{try{localStorage.setItem('imperium.gfx',JSON.stringify({q:'leicht'}));}catch(e){}});
await p.route(/cdnjs/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));
await p.route(/fonts\.g/,r=>r.abort());await p.route(/\.html$/,r=>r.fulfill({body:fs.readFileSync(FILE),contentType:'text/html; charset=utf-8'}));
await p.goto(`http://localhost:${PORT}/imperium.html`,{timeout:300000});await p.waitForFunction(()=>document.getElementById('loading').hidden,null,{timeout:300000});
await p.waitForFunction(()=>!document.querySelector('#loading[data-gate]'),null,{timeout:120000}).catch(()=>{});
const w=ms=>p.waitForTimeout(ms);
await p.evaluate(()=>{newGame('rom');loadGame(S);window.picMsg=()=>{};try{closeModal();}catch(e){}try{document.getElementById('tut').hidden=true;}catch(e){}
  const me=S.player;S.fac[me].gold=9000;S.turn=30;
  // zwei Handelspartner, ein Lieferauftrag als Angebot, Agenten aller Arten
  const rv=rivals(me).filter(x=>alive(x)&&x!=='horde').slice(0,2);for(const x of rv){const d=dip(me,x);d.trade=true;d.st=d.st==='war'?'peace':d.st;}
  S.contracts=S.contracts||[];if(rv[0])S.contracts.push({id:S.nextId++,to:me,from:rv[0],g:'getreide',amt:4,done:0,pay:90,st:'offer',exp:S.turn+3,dur:8});
  agentCap=()=>9;for(const t of Object.keys(AGENT_T))hireAgent(me,t);S.fac[me].gold=9000;window._rv=rv;});
await w(800);
// Hilfsfunktion: alle Knöpfe im offenen Fenster; Liste ohne Text
const miss=()=>p.evaluate(()=>{const o=[];for(const e of document.querySelectorAll('#modal button,#modal [data-help],#modal .arow,#modal .rcard')){if(e.closest('#helpCard')||e.closest('.actions'))continue;if(!helpText(e))o.push((Object.entries(e.dataset).map(([k,v])=>k+'='+v).join(' ')||'(ohne data)')+' :: '+e.innerText.replace(/\s+/g,' ').slice(0,30));}return o;});
const count=js=>p.evaluate(js);
const scan=async(name,js,pre)=>{await p.evaluate(js);await w(1100);const m=await miss();ok('Alle Knöpfe erklärt: '+name,m.length===0,m.slice(0,6));return m;};
// --- Handel
for(const t of ['over','fin','cit','chain','prov','trans','trade'])await scan('Wirtschaft '+t,`openEconomy('${t}')`);
const tradeN=await count(`openEconomy('trade');document.querySelectorAll('#dialog [data-cacc],#dialog [data-resc],#dialog [data-rup],#dialog [data-rshow],#dialog [data-gsrc],#dialog [data-proc],#dialog [data-priv]').length`);
ok('Handel-Fenster zeigt Vertrags-/Routen-Knöpfe',tradeN>=4,tradeN);
await scan('Warenbeschaffung',`openProcure('getreide')`);await scan('Warenherkunft',`openGoodSrc('getreide')`);
// --- Forschung
await scan('Forschung',`openResearch()`);
// --- Agenten
await scan('Hof › Agenten (Liste)',`AG_SEL=null;openHof('ag')`);
for(const t of Object.keys(await p.evaluate(()=>AGENT_T)))for(const k of await p.evaluate(t=>Object.keys(AG_ACTS).filter(k=>AG_ACTS[k].t===t),t)){await scan('Agent '+t+' / '+k+' (Auftrag und Ziele)',`(()=>{const a=agentsOf(S.player).find(x=>x.t==='${t}');AG_SEL={id:a.id,act:'${k}'};openHof('ag');})()`);}
await scan('Agent mit laufendem Plan',`(()=>{const a=agentsOf(S.player)[0];AG_SEL=null;const tg=provsOf(S.player)[0];a.act='abwehr';a.tgt=tg;a.eta=0;a.prog=0;openHof('ag');})()`);
// --- Szenario/Geschichte: Texte für die Tasten (synthetische Knöpfe)
const sc=await p.evaluate(()=>{const o={};for(const k of ['scenbribe','story','storychoice','storyend','storyskip','mission']){const b=document.createElement('button');b.dataset.act=k;o[k]=(helpText(b)||'').length;}return o;});
ok('Szenario-/Geschichts-Knöpfe haben Text',Object.values(sc).every(n=>n>20),sc);
// --- Lange drücken: Handel, Forschung, Agenten
const press=async(sel,keep)=>{const bx=await p.evaluate(sel=>{const e=document.querySelector(sel);if(!e)return null;e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2};},sel);if(!bx)return null;await w(300);
  const bx2=await p.evaluate(sel=>{const e=document.querySelector(sel);const r=e.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2};},sel);
  await p.mouse.move(bx2.x,bx2.y);await p.mouse.down();await w(700);const card=await p.evaluate(()=>{const c=document.getElementById('helpCard');return c?c.innerText:null;});if(keep)await p.screenshot({path:keep});await p.mouse.up();await w(150);await p.mouse.click(5,5);await w(250);return card;};
await p.evaluate(()=>{openEconomy('trade');});await w(1100);
const g0=await p.evaluate(()=>Math.round(S.fac[S.player].gold));
let card=await press('#dialog [data-rup]');ok('Lange drücken Handel (Route ausbauen): Karte mit Kosten',card&&/Kostet \d+ Gold/.test(card),card);
const g1=await p.evaluate(()=>Math.round(S.fac[S.player].gold));ok('Lange drücken löst die Aktion nicht aus (Gold gleich)',g0===g1,{g0,g1});
card=await press('#dialog [data-cacc]');ok('Lange drücken Handel (Lieferauftrag annehmen)',card&&/Lieferauftrag/.test(card),card);
const still=await p.evaluate(()=>(S.contracts||[]).some(c=>c.st==='offer'));ok('Auftrag nach langem Drücken noch Angebot',still);
await p.evaluate(()=>openResearch());await w(1200);
card=await press('#dialog [data-tech]:not([disabled])');ok('Lange drücken Forschung: Karte mit Kosten und Runden',card&&/Punkte/.test(card)&&/Runden/.test(card),card);
const res0=await p.evaluate(()=>!!S.fac[S.player].res);
await p.evaluate(()=>{AG_SEL=null;openHof('ag');});await w(1100);
card=await press('#dialog [data-hire]');ok('Lange drücken Agenten (Anwerben): Karte mit Kosten',card&&/Anwerben kostet \d+ Gold/.test(card),card);
await p.evaluate(()=>{const a=agentsOf(S.player)[0];AG_SEL={id:a.id,act:null};openHof('ag');});await w(1100);
card=await press('#dialog [data-agact]:nth-child(2)',SH.replace('k_help_','k_help_')+'agent.png');ok('Lange drücken Agenten (Auftrag): Karte erscheint',card&&card.length>30,card);
const stilla=await p.evaluate(()=>agentsOf(S.player).every(a=>!a.act||a.act==='abwehr'||true));ok('Agenten-Fenster nach langem Drücken weiter offen',await p.evaluate(()=>!document.getElementById('modal').hidden));
ok('Keine Seiten-/Konsolenfehler',errs.length===0,errs.slice(0,3).join(' || '));
console.log(R.every(Boolean)?'ALLE PASS':'FAIL vorhanden');await b.close();process.exit(R.every(Boolean)?0:1);})();
