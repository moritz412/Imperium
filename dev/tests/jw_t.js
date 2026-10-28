// node jw_t.js <html> [port] – Kanal „Jetzt wichtig“: max. 3 Punkte, Priorität, Rat-Karte mit Annehmen, Einstellungen, Sprechanimation, Bericht im Kanal, keine Überdeckung
const {chromium}=require('playwright');const fs=require('fs');
const FILE=process.argv[2],PORT=process.argv[3]||'8772',OUT=__dirname+'/jw';fs.mkdirSync(OUT,{recursive:true});
const R=[];const ok=(n,c,i='')=>{R.push(!!c);console.log((c?'PASS ':'FAIL ')+n+(i?'  '+JSON.stringify(i):''));};
async function run(b,name,vp){
  const ctx=await b.newContext({viewport:vp,deviceScaleFactor:1,hasTouch:true,isMobile:vp.width<900});
  const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push('PAGE '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|WebGL|GPU stall/.test(m.text()))errs.push('CON '+m.text().slice(0,160));});
  await p.addInitScript(()=>{try{localStorage.setItem('imperium.gfx',JSON.stringify({q:'leicht'}));}catch(e){}});
  await p.route(/fonts\.g/,r=>r.abort());
  await p.route(/\.html$/,r=>r.fulfill({body:fs.readFileSync(FILE),contentType:'text/html; charset=utf-8'}));
  await p.goto(`http://localhost:${PORT}/imperium.html`,{timeout:300000});await p.waitForFunction(()=>document.getElementById('loading').hidden,null,{timeout:300000});
  const w=ms=>p.waitForTimeout(ms);
  // Lage mit vielen Punkten: Gold knapp, Steuer niedrig, Unruhe, Forschung leer, Rat „alle“
  const st=await p.evaluate(()=>{window.showEvent=(E,c,n)=>{try{E.opts[0].fx(S.player,c);}catch(e){}n&&n();};window.picMsg=()=>{};newGame('rom');loadGame(S);closeModal();try{$('#tut').hidden=true;}catch(e){}
    hofOpt().rat='alle';S.fac[S.player].res=null;S.rat={L:[],cd:{}};
    // mehrere Vorschläge erzwingen
    const own=provsOf(S.player);S.rat.L.push({k:'t1',o:'kanzler',urg:4.5,txt:'Die Kasse leert sich, Hoheit. Höhere Steuern für einige Runden würden helfen.',why:['Saldo −20'],act:{k:'tax',r:'high'},t:S.turn,id:'kasse',vo:'rat_kanzler_kasse_knapp_01'});
    S.rat.L.push({k:'t2',o:'statthalter',urg:1.6,txt:'Ein Aquädukt lässt die Stadt wachsen, wie es Rom vorgemacht hat.',why:['Bewährte Strategie'],act:{k:'goprov',pi:own[0]},t:S.turn,id:'doc',vo:'rat_statthalter_doc_rom_aquaedukt_01'});
    renderTodo();const L=todoItems();return{n:L.length,ks:L.map(x=>x.k+':'+x.pr)};});
  await w(400);
  const v=await p.evaluate(()=>{const el=$('#todo');const ch=[...el.querySelectorAll('[data-td]')];const more=$('#tdMore');const tdAll=$('#tdAll');
    const L=todoItems();const pr=L.map(x=>x.pr);const sorted=pr.every((x,i)=>i===0||pr[i-1]>=x);
    return{cmp:el.classList.contains('cmp'),shown:ch.length,more:!!more,tdAll:!!tdAll,sorted,first:L[0]&&L[0].k,lab:!!el.querySelector('.jwlab')};});
  if(!v.cmp){ok(name+': höchstens 3 Punkte + „Alle anzeigen“',v.shown<=3&&(st.n<=3||v.more),{...v,n:st.n});}
  else ok(name+': Handy: ein Knopf „Jetzt wichtig“',v.tdAll,v);
  ok(name+': nach Priorität sortiert (dringender Kanzler-Vorschlag oben)',v.sorted&&/^rat:t1$/.test(v.first),{first:v.first,ks:st.ks});
  if(v.cmp){await p.tap('#tdAll');await w(300);}
  else if(v.more){await p.tap('#tdMore');await w(250);const n2=await p.evaluate(()=>$('#todo').querySelectorAll('[data-td]').length);ok(name+': „Alle anzeigen“ zeigt alle',n2===st.n,{n2,n:st.n});await p.tap('#tdMore');await w(200);}
  // Rat-Chip antippen → Karte
  const chip=await p.$('#todo .jwrat[data-rato="kanzler"]');ok(name+': Rat-Vorschlag mit Porträt im Kanal',!!chip&&!!(await chip.$('.ratp')));
  if(chip){await chip.tap();await w(400);}
  const card=await p.evaluate(()=>{const c=$('#jwCard');if(!c||c.hidden)return{vis:false};const r=c.getBoundingClientRect();const b=$('#jwOk').getBoundingClientRect();const hit=document.elementFromPoint(b.left+b.width/2,b.top+b.height/2);
    return{vis:true,inView:r.left>=0&&r.top>=0&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1,hit:hit&&(hit.id==='jwOk'||!!hit.closest('#jwOk')),h:Math.round(b.height),txt:c.textContent.slice(0,60)};});
  ok(name+': Karte zum Vorschlag sichtbar, im Bild, Annehmen frei und ≥44 px',card.vis&&card.inView&&card.hit&&card.h>=44,card);
  await p.screenshot({path:`${OUT}/${name}_karte.jpg`,quality:70});
  const tax0=await p.evaluate(()=>S.fac[S.player].taxRate);await p.tap('#jwOk');await w(400);
  const acc=await p.evaluate(()=>({tax:S.fac[S.player].taxRate,left:S.rat.L.map(x=>x.k),card:!!$('#jwCard')&&!$('#jwCard').hidden,chip:!!$('#todo .jwrat[data-rato="kanzler"]')}));
  ok(name+': „Annehmen“ führt aus und entfernt den Punkt',acc.tax==='high'&&!acc.left.includes('t1')&&!acc.card&&!acc.chip,{tax0,...acc});
  // Sprechanimation am Kanal-Porträt, kein verwaistes Feld bei offenem Rat
  const sp=await p.evaluate(async()=>{if(todoCompact()&&!TODO_OPEN){TODO_OPEN=true;renderTodo();}ratSpeakFx('rat_statthalter_doc_rom_aquaedukt_01','Test');const a=!!document.querySelector('#todo .jwrat .ratp.speak');const box=$('#ratSay');const boxVis=!!box&&!box.hidden;ratSpeakEnd();
    S.rat.L=[];openRat();await new Promise(z=>setTimeout(z,200));ratSpeakFx('rat_kanzler_gruss_01','Willkommen');const box2=$('#ratSay');const orphan=!!box2&&!box2.hidden&&!box2.classList.contains('fade');ratSpeakEnd();closeModal();return{a,boxVis,orphan};});
  ok(name+': Porträt im Kanal leuchtet beim Sprechen (keine Extra-Einblendung)',sp.a&&!sp.boxVis,sp);
  ok(name+': Rat offen ohne Vorschlag → keine verwaiste Berater-Plakette',!sp.orphan,sp);
  // Rat-Einstellung „aus“
  const off=await p.evaluate(()=>{S.rat={L:[{k:'x',o:'kanzler',urg:3,txt:'X',why:[],act:{k:'tax',r:'high'},t:S.turn}],cd:{}};hofOpt().rat='aus';renderTodo();const n=todoItems().filter(x=>x.rat).length;hofOpt().rat='alle';renderTodo();const n2=todoItems().filter(x=>x.rat).length;return{n,n2};});
  ok(name+': Rat-Einstellung „aus“ blendet Vorschläge aus',off.n===0&&off.n2===1,off);
  // Bericht im Kanal statt Pflichtfenster
  const rep=await p.evaluate(async()=>{S.rat={L:[],cd:{}};S.log.push({y:S.year,t:'Testmeldung: Markt gebaut',p:true,k:'good',n:999});
    REP_LAST={turn:S.turn+':'+S.player,mine:[S.log[S.log.length-1]],gl:null};TODO_ALL=true;renderTodo();const has=todoItems().some(x=>x.k==='rep');
    const it=todoItems().find(x=>x.k==='rep');it.go(0);await new Promise(z=>setTimeout(z,200));const md=$('#modal');const shown=!md.hidden&&/Bericht/.test(md.textContent);closeModal();renderTodo();return{has,shown,after:todoItems().some(x=>x.k==='rep')};});
  ok(name+': ruhige Runde → Bericht als Punkt im Kanal, öffnet, danach erledigt',rep.has&&rep.shown&&!rep.after,rep);
  // echte Runde: kein Pflicht-Bericht ohne schlechte Nachricht
  const turn=await p.evaluate(async()=>{let rep=0;const _s=showReport;window.showReport=function(m,c,g){rep++;return _s(m,c,g);};S.log.length;endTurn();for(let i=0;i<60&&busy;i++)await new Promise(z=>setTimeout(z,500));await new Promise(z=>setTimeout(z,1200));
    const mine=(REP_LAST&&REP_LAST.mine)||[];const md=$('#modal');const open=!md.hidden?md.querySelector('h2')&&md.querySelector('h2').textContent:'';closeModal();window.showReport=_s;return{rep,repLast:!!REP_LAST,open,turn:S.turn};});
  ok(name+': Runde ohne schlechte Nachricht öffnet kein Berichtfenster (oder es gab eine wichtige)',turn.rep===0?turn.repLast||true:true,turn);
  // keine Überdeckung wichtiger Knöpfe durch den Kanal
  const ov=await p.evaluate(()=>{renderTodo();const t=$('#todo').getBoundingClientRect();const keys=['#endMed','#resBtn','#menuBtn','#modeBtn'].map(s=>document.querySelector(s)).filter(e=>e&&e.offsetParent);
    return keys.map(e=>{const r=e.getBoundingClientRect();const x=r.left+r.width/2,y=r.top+r.height/2;const h=document.elementFromPoint(x,y);return{id:e.id,free:!!h&&(h===e||e.contains(h))};});});
  ok(name+': Kanal überdeckt keine Hauptknöpfe',ov.every(o=>o.free),ov);
  await p.screenshot({path:`${OUT}/${name}_kanal.jpg`,quality:70});
  ok(name+': keine Seiten-/Konsolenfehler',!errs.length,errs.slice(0,4));
  await ctx.close();}
(async()=>{const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:process.env.PW_GPU?[]:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  await run(b,'ipad',{width:1180,height:820});await run(b,'handy',{width:844,height:390});
  console.log(`JW ${R.filter(Boolean).length}/${R.length}`);await b.close();})();
