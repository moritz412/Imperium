// node age_t.js <html> [port] – v242: Herrscher altern in Geschichten im Takt der Spieljahre (ypt), im Endlosspiel +2 je Runde. Echtes iPad nicht getestet.
const {chromium}=require('playwright');
const FILE=process.argv[2]||require('path').join(__dirname,'..','imperium.html'),PORT=process.argv[3]||'8772';
(async()=>{const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:process.env.PW_GPU?[]:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const R=[];const ok=(n,c,i='')=>{R.push(!!c);console.log((c?'PASS ':'FAIL ')+n+(i!==''?'  '+JSON.stringify(i):''));};
const fs=require('fs');const SHOT=process.env.HN2_SHOT||'/tmp/claude-0/-home-claude/4f60f6a0-fa46-5154-9e84-95c0bd1121bd/scratchpad';
const ctx=await b.newContext({viewport:{width:1024,height:768},hasTouch:true,isMobile:true});const p=await ctx.newPage();const errs=[];
p.on('pageerror',e=>errs.push('PAGE '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|WebGL|GPU stall/.test(m.text()))errs.push('CON '+m.text().slice(0,200));});
await p.addInitScript(()=>{try{localStorage.setItem('imperium.gfx',JSON.stringify({q:'leicht'}));}catch(e){}});
await p.route(/cdnjs/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));
await p.route(/fonts\.g/,r=>r.abort());await p.route(/\.html$/,r=>r.fulfill({body:fs.readFileSync(FILE),contentType:'text/html; charset=utf-8'}));
await p.goto(`http://localhost:${PORT}/imperium.html`,{timeout:300000});await p.waitForFunction(()=>document.getElementById('loading').hidden,null,{timeout:300000});
await p.waitForFunction(()=>!document.querySelector('#loading[data-gate]'),null,{timeout:120000}).catch(()=>{});
const A=await p.evaluate(()=>{const o={};
 startScenario('hannibal');try{closeModal();}catch(e){}const D=SCEN[S.scen.id];const tr=[];for(let i=0;i<16;i++){S.turn++;tr.push(AGE_TURN());}
 o.hn={ypt:D.ypt,sum:tr.reduce((a,b)=>a+b,0),n:16,rate:AGE_RATE()};
 S.scen=null;const t2=[];for(let i=0;i<4;i++){S.turn++;t2.push(AGE_TURN());}o.free={sum:t2.reduce((a,b)=>a+b,0),base:AGE_BASE()};return o;});
ok('Hannibal (ypt 0,25): in 16 Runden 4 Jahre gealtert (vorher 32)',A.hn.sum===4&&A.hn.rate===0.25,A.hn);
ok('Endlosspiel: weiter +2 (bzw. +1 ab Epoche 4) je Runde',A.free.sum===4*A.free.base,A.free);
ok('Keine Seitenfehler',!errs.filter(e=>/PAGE/.test(e)).length,errs.slice(0,3));
console.log(R.filter(x=>x).length+' PASS / '+R.filter(x=>!x).length+' FAIL');await b.close();})();
