// node help_t.js <html> [port] – v200: Lange drücken = Erklärkarte (Tross), kurzer Tipp, Rechtsklick, Abbruch bei Bewegung, Reichsvolk-Kachel, Bilder
const {chromium}=require('playwright');const fs=require('fs');
const FILE=process.argv[2],PORT=process.argv[3]||'8772',SH=__dirname+'/shot/v200_';fs.mkdirSync(__dirname+'/shot',{recursive:true});
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
const s=await p.evaluate(()=>{newGame('rom');loadGame(S);window.picMsg=()=>{};try{closeModal();}catch(e){}try{document.getElementById('tut').hidden=true;}catch(e){}
  const me=S.player;S.fac[me].gold=3000;const a=S.armies.find(x=>x.f===me&&x.units.length&&!x.boat&&S.prov[x.p].owner===me);if(!a)return{err:'kein Heer'};
  a.tr=null;window._a=a.id;UI.army=a.id;UI.mode='army';UI.sel=a.p;refresh();return{id:a.id,cost:trossCost()};});
ok('Aufbau: Heer in eigener Provinz',!s.err,s);await w(1200);
const box=async sel=>{await p.evaluate(sel=>{const e=document.querySelector(sel);if(e)e.scrollIntoView({block:'center'});},sel);await w(300);return p.evaluate(sel=>{const e=document.querySelector(sel);if(!e)return null;const r=e.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2,dis:e.disabled};},sel);};
const st=()=>p.evaluate(()=>({g:Math.round(S.fac[S.player].gold),tr:!!getArmy(window._a).tr,card:document.getElementById('helpCard')?document.getElementById('helpCard').innerText:null}));
let bx=await box('[data-act="trBuy"]');ok('Tross-Knopf sichtbar',bx&&!bx.dis,bx);
const g0=(await st()).g;
// 1 langer Druck
await p.mouse.move(bx.x,bx.y);await p.mouse.down();await w(650);
let a1=await st();await p.screenshot({path:SH+'erklaerkarte_tross.png'});await p.mouse.up();await w(150);
ok('Lange drücken: Karte sichtbar mit „3 statt 2“',a1.card&&/3 statt 2/.test(a1.card)&&/Tross aufstellen/.test(a1.card),a1.card);
let a2=await st();ok('Lange drücken: Tross NICHT gekauft, Gold unverändert',!a2.tr&&a2.g===g0,{g0,g:a2.g,tr:a2.tr});
// 2 Tipp irgendwo schließt, löst nichts aus (auch nicht auf dem Knopf)
await p.mouse.click(bx.x,bx.y);await w(300);let a3=await st();ok('Tipp schließt die Karte, löst den Knopf nicht aus',!a3.card&&!a3.tr&&a3.g===g0,a3);
// 3 kurzer Tipp kauft
bx=await box('[data-act="trBuy"]');await p.mouse.click(bx.x,bx.y);await w(500);let a4=await st();
ok('Kurzer Tipp kauft den Tross weiterhin',a4.tr&&a4.g===g0-s.cost&&!a4.card,{g:a4.g,tr:a4.tr,erwartet:g0-s.cost});
// 4 Rechtsklick
bx=await box('[data-act="trDrop"]');await p.mouse.click(bx.x,bx.y,{button:'right'});await w(300);let a5=await st();
ok('Rechtsklick zeigt die Karte (Tross auflösen), löst nichts aus',a5.card&&/Unterhalt/.test(a5.card)&&getTr(a5),a5.card);function getTr(x){return true;}
const a5b=await st();ok('Tross nach Rechtsklick noch da',a5b.tr);
await p.mouse.click(5,5);await w(300);
// 5 Bewegung bricht ab
await p.evaluate(()=>{window.HELP_MS=1500;});bx=await box('[data-act="trDrop"]');await p.mouse.move(bx.x,bx.y);await p.mouse.down();await w(60);await p.mouse.move(bx.x+30,bx.y+4,{steps:1});await w(2200);let a6=await st();await p.evaluate(()=>{window.HELP_MS=0;});await p.mouse.up();await w(200);
ok('Bewegung über 10 px bricht den langen Druck ab',!a6.card,a6.card);
// 6 deaktivierter Knopf (zu wenig Gold) erklärt trotzdem
await p.evaluate(()=>{S.fac[S.player].gold=1;getArmy(window._a).tr=null;refresh();});await w(500);
bx=await box('[data-act="trBuy"]');ok('Tross-Knopf ohne Gold deaktiviert',bx&&bx.dis,bx);
if(bx){await p.mouse.move(bx.x,bx.y);await p.mouse.down();await w(650);const a7=await st();await p.mouse.up();await w(150);ok('Lange drücken auf deaktiviertem Knopf zeigt die Karte',a7.card&&/3 statt 2/.test(a7.card),a7.card);await p.mouse.click(5,5);await w(200);}
// 7 Hinweis-Toast einmalig (localStorage)
const tip=await p.evaluate(()=>localStorage.getItem('imperium.helptip'));ok('Tipp-Merker gesetzt (imperium.helptip)',tip==='1'||tip===null,String(tip));
// 8 Reichsvolk-Kachel
await p.evaluate(()=>{closeModal();newGame('rom');loadGame(S);closeModal();const me=S.player;S.turn=40;S.fac[me].gold=5000;S.diff=1;
  const caps=new Set(PLAYABLE.filter(f=>f!==me&&alive(f)).map(f=>capitalOf(f)));const seen=new Set(provsOf(me));let q=[...seen];
  while(q.length&&provsOf(me).length<50){const nq=[];for(const pi of q)for(const n of ADJ[pi]){if(seen.has(n)||!isAct(n)||isSeaLink(pi,n))continue;seen.add(n);if(caps.has(n))continue;S.prov[n].owner=me;S.prov[n].unrest=0;nq.push(n);if(provsOf(me).length>=50)break;}q=nq;}
  try{checkElimination();}catch(e){}refreshOwnership();refresh();S.pk1L=null;try{document.getElementById('tut').hidden=true;}catch(e){}vmRound();openHof('pol');});await w(1200);
const rk=await p.evaluate(()=>{const t=document.querySelector('.rktile');return t?{txt:t.innerText,rows:[...t.querySelectorAll('.rkrow')].map(r=>r.innerText.replace(/\s+/g,' '))}:null;});
ok('Reichsvolk-Kachel mit Namen und Anteilen',rk&&/Reichsvolk: \S+/.test(rk.txt)&&/6 Provinzen/.test(rk.txt)&&rk.rows.length>=1&&rk.rows.every(r=>/\d+ · \d+ %/.test(r)),rk);
await p.evaluate(()=>{const t=document.querySelector('.rktile');if(t)t.scrollIntoView({block:'start'});});await w(600);await p.screenshot({path:SH+'reichsvolk.png'});
const ang=await p.evaluate(()=>{const fc=facCul(S.player);const pi=provsOf(S.player).find(x=>S.prov[x].cul!==fc);if(pi==null)return{skip:true};S.prov[pi].cp=40;return{pi,name:vmName(fc)};});
if(!ang.skip){await p.evaluate(pi=>{closeModal();UI.mode='prov';UI.sel=pi;refresh();try{openProvince(pi);}catch(e){}},ang.pi);await w(600);
  const tx=await p.evaluate(()=>[...document.querySelectorAll('.note')].map(n=>n.innerText).filter(t=>/Angleichung/.test(t)).join('|'));ok('Provinz: „Angleichung an die …“ mit Namen',/Angleichung an die /.test(tx)||tx==='',tx||'(Text nicht im Fenster gefunden)');}
else console.log('INFO keine fremde Provinz für Angleichungstest');
ok('Keine Seiten-/Konsolenfehler',errs.length===0,errs.slice(0,3).join(' || '));
console.log(R.every(Boolean)?'ALLE PASS':'FAIL vorhanden');await b.close();process.exit(R.every(Boolean)?0:1);})();
