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
for(const fac of ['rom','qin']){
  const r=await p.evaluate(async f=>{try{if(!FACTIONS[f])return'skip';newGame(f);loadGame(S);closeModal();
    for(let i=0;i<2;i++){try{endTurn();}catch(e){return'endTurn '+e.message;}await new Promise(z=>setTimeout(z,2500));closeModal();}
    const riv=Object.keys(S.fac).find(x=>x!==S.player&&alive(x));for(const [fn,a] of [['openDiplomacy',riv],['openEconomy'],['openHof']]){try{if(typeof window[fn]==='function'){window[fn](a);closeModal();}}catch(e){return fn+' '+e.message;}}
    return'ok T'+S.turn;}catch(e){return'ERR '+e.message;}},fac);
  ok('Spiel '+fac+' 2 Runden + Fenster',/^ok|skip/.test(r),r);}
const w=await p.evaluate(async()=>{try{if(typeof startWorld!=='function')return'skip';const W=await loadWorlds();if(!W[2])return'skip';const S0=S;startWorld(2,W[2].facs[0].f);/* startWorld lädt asynchron: warten, bis die neue Welt wirklich läuft */for(let k=0;k<180&&(S===S0||ep()!==2);k++)await new Promise(z=>setTimeout(z,500));if(S===S0||ep()!==2)return'ERR Welt nicht gestartet (Jahr '+(S&&S.year)+')';closeModal();endTurn();await new Promise(z=>setTimeout(z,3000));closeModal();return'ok '+S.year;}catch(e){return'ERR '+e.message;}});
ok('Startwelt Epoche 2 + 1 Runde',/^ok|skip/.test(w),w);
ok('Keine Seiten-/Konsolenfehler',!errs.length,errs.slice(0,4).join(' | '));
console.log(`SMOKE ${R.filter(Boolean).length}/${R.length} in ${Math.round((Date.now()-t0)/1000)} s`);await b.close();})();
