// Phase-0-Prototyp pruefen: node p0_proto.js [port]   (PW_GPU=1 = echte Grafik, sonst Software-Rendering)
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const PORT=process.argv[2]||'8790';const OUT=path.join(__dirname,'shot');fs.mkdirSync(OUT,{recursive:true});
(async()=>{
const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:process.env.PW_GPU?['--ignore-gpu-blocklist']:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:1100,height:720},deviceScaleFactor:1,hasTouch:true});
const p=await ctx.newPage();const errs=[];
p.on('pageerror',e=>errs.push('PAGE '+e.message));
p.on('console',m=>{if(['error','warning'].includes(m.type()))errs.push(m.type().toUpperCase()+' '+m.text().slice(0,300));});
await p.route(/cdnjs/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));
const url=`http://localhost:${PORT}/proto/schlacht_p0.html`;
// 1. Fallback ohne Float-Texturen
await p.goto(url+'?test=nofloat');await p.waitForTimeout(500);
console.log('NOFLOAT Meldung sichtbar:',await p.evaluate(()=>!document.getElementById('fatal').hidden),'|',(await p.evaluate(()=>document.getElementById('fatal').innerText)).slice(0,90));
// 2. Normaler Lauf
const t0=Date.now();await p.goto(url);await p.waitForFunction(()=>document.body.dataset.ready==='1',null,{timeout:300000});
console.log('Laden bis ready (Wanduhr):',Date.now()-t0,'ms');
console.log('Ladeliste:',(await p.evaluate(()=>document.getElementById('llist').innerText)).replace(/\n/g,' | '));
console.log('Geometrie:',JSON.stringify(await p.evaluate(()=>P0.tri())));
await p.waitForTimeout(10000);
let s=await p.evaluate(()=>P0.stats());console.log('Nach 10 s (1500, Uebersicht):',JSON.stringify(s));
console.log('HUD-Text:\n'+await p.evaluate(()=>document.getElementById('hud').innerText));
await p.screenshot({path:path.join(OUT,'p0_uebersicht.png')});
for(const n of [1500,2500]){
  await p.click(`#menu [data-n="${n}"]`);await p.waitForTimeout(500);
  await p.evaluate(()=>{P0.advance(40);P0.camFront();});
  await p.waitForTimeout(6000);
  s=await p.evaluate(()=>P0.stats());console.log('N='+n+' (Front, Sim-Zeit '+s.simT.toFixed(1)+' s):',JSON.stringify(s));
  await p.screenshot({path:path.join(OUT,'p0_'+n+'.png')});
}
// Uebersicht 2500 mit kurzem Lauf
await p.evaluate(()=>P0.camOver());await p.waitForTimeout(4000);
console.log('N=2500 Uebersicht:',JSON.stringify(await p.evaluate(()=>P0.stats())));
await p.screenshot({path:path.join(OUT,'p0_2500_uebersicht.png')});
await p.click('#bLod');await p.waitForTimeout(3000);console.log('LOD aus:',JSON.stringify(await p.evaluate(()=>P0.stats())));
console.log('Fehler/Warnungen:',errs.length?errs.slice(0,8).join('\n'):'keine');
await b.close();})();
