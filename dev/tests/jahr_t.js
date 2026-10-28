// Schnelltest (~3 min): node smoke.js <html> [port]. Laden, Rom + Mongolen-Startwelt anspielen (2 Runden), Hauptfenster öffnen, Fehler zählen. Niedrige Auflösung, Grafik leicht.
const {chromium}=require('playwright');const fs=require('fs');
const FILE=process.argv[2]||require('path').join(__dirname,'..','imperium.html'),PORT=process.argv[3]||'8772';
(async()=>{const t0=Date.now();const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:process.env.PW_GPU?[]:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:900,height:620},deviceScaleFactor:1,hasTouch:true,isMobile:true});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push('PAGE '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|WebGL|GPU stall/.test(m.text()))errs.push('CON '+m.text().slice(0,160));});
await p.addInitScript(()=>{try{localStorage.setItem('imperium.gfx',JSON.stringify({q:'leicht'}));}catch(e){}});
await p.route(/cdnjs/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));
await p.route(/fonts\.g/,r=>r.abort());
await p.route(/\.html$/,r=>r.fulfill({body:fs.readFileSync(FILE),contentType:'text/html; charset=utf-8'}));
await p.goto(`http://localhost:${PORT}/imperium.html`,{timeout:300000});await p.waitForFunction(()=>document.getElementById('loading').hidden,null,{timeout:300000});
const R=[];const ok=(n,c,i='')=>{R.push(!!c);console.log((c?'PASS ':'FAIL ')+n+(i?'  '+i:''));};
await p.evaluate(()=>{window.showEvent=(E,ctx,next)=>{try{const o=E.opts.find(o=>!o.cost||S.fac[S.player].gold>=o.cost())||E.opts[0];o.fx(S.player,ctx);}catch(e){console.error('ev '+e.message);}next&&next();};window.picMsg=()=>{};});
const r=await p.evaluate(async()=>{const w=ms=>new Promise(z=>setTimeout(z,ms));newGame('rom');loadGame(S);closeModal();S.epochTurn=S.turn;S.year=340;const ys=[];let todoSeen=false,modalOk=false;
 for(let k=0;k<12&&ep()===0;k++){endTurn();for(let q=0;q<20&&typeof BATTLE!=='undefined'&&BATTLE;q++)await w(500);await w(1800);closeModal();ys.push(S.year);try{const t=epochTodo();if(t&&/ausrufen/.test(t.t))todoSeen=true;}catch(e){}if(todoSeen&&!modalOk){try{epochInfoModal();modalOk=/Zeitalter ist zu Ende/.test(document.body.innerText);closeModal();}catch(e){}}}
 return{ys,ep:ep(),todoSeen,modalOk,year:S.year};});
ok('Jahr läuft sanft bis zur Grenze, Epoche folgt',r.ep===1&&r.ys.every((y,i)=>i===0||y>=r.ys[i-1]),JSON.stringify(r));
ok('Angebot in Jetzt wichtig + Fenster',r.todoSeen&&r.modalOk,JSON.stringify({t:r.todoSeen,m:r.modalOk}));
const o=await p.evaluate(async()=>{const w=ms=>new Promise(z=>setTimeout(z,ms));try{const s=JSON.parse(JSON.stringify(S));delete s.epCapT;loadGame(s);closeModal();const y0=S.year;endTurn();await w(2500);closeModal();return'ok '+(S.year>=y0);}catch(e){return'ERR '+e.message;}});
ok('alter Spielstand ohne epCapT',/^ok true/.test(o),o);
ok('Keine Seiten-/Konsolenfehler',!errs.length,errs.slice(0,4).join(' | '));
console.log(`JAHR ${R.filter(Boolean).length}/${R.length} in ${Math.round((Date.now()-t0)/1000)} s`);await b.close();})();
