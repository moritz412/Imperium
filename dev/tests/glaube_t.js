// node glaube_t.js <html> [port] – Glaubens-/Diplomatie-Prüfung
const {chromium}=require('playwright');const fs=require('fs');
const FILE=process.argv[2],PORT=process.argv[3]||'8772';
(async()=>{const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:process.env.PW_GPU?[]:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:1000,height:700},hasTouch:true,isMobile:true});const p=await ctx.newPage();const errs=[];
p.on('pageerror',e=>errs.push('PAGE '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|WebGL|GPU stall/.test(m.text()))errs.push('CON '+m.text().slice(0,200));});
await p.addInitScript(()=>{try{localStorage.setItem('imperium.gfx',JSON.stringify({q:'leicht'}));}catch(e){}});
await p.route(/cdnjs/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));
await p.route(/fonts\.g/,r=>r.abort());await p.route(/\.html$/,r=>r.fulfill({body:fs.readFileSync(FILE),contentType:'text/html; charset=utf-8'}));
await p.goto(`http://localhost:${PORT}/imperium.html`,{timeout:300000});await p.waitForFunction(()=>document.getElementById('loading').hidden,null,{timeout:300000});
const R=[];const ok=(n,c,i='')=>{R.push(!!c);console.log((c?'PASS ':'FAIL ')+n+(i?'  '+i:''));};
await p.evaluate(()=>{window.showEvent=(E,ctx,next)=>{try{E.opts[E.opts.length-1].fx(S.player,ctx);}catch(e){}next&&next();};window.picMsg=()=>{};});
const r=await p.evaluate(async()=>{const o={};const w=ms=>new Promise(z=>setTimeout(z,ms));
 newGame('rom');loadGame(S);closeModal();const f=S.player;
 // Provinz mit fremdem Glauben
 const pi=provsOf(f).find(i=>i!==capitalOf(f));const P=S.prov[pi];P.rel=P.rel===facRel(f)?'germ':P.rel;P.rp=20;
 selProv(pi);await w(300);const sh=document.getElementById('shBody').innerHTML;o.prov=/Bekehrung zu/.test(sh)&&/je Runde/.test(sh)&&/fertig in etwa/.test(sh);o.provTxt=(document.querySelector('.convnote')||{}).textContent||'';
 // Hof Glaube
 openHof('kir');await w(200);const hh=document.querySelector('.modal')?document.querySelector('.modal').innerHTML:document.body.innerHTML;o.hof=/Glaubenspolitik/.test(hh)&&/Bekehrung/.test(hh)&&/Religionskarte zeigen/.test(hh);
 // Toleranz wechseln und Sperre
 const b0=document.querySelector('[data-tol="2"]');if(b0)b0.click();await w(200);o.tol1=tolOf(f);const b1=document.querySelector('[data-tol="0"]');o.tolLocked=!!(b1&&b1.disabled);if(b1)b1.click();await w(100);o.tol2=tolOf(f);closeModal();
 // Karte Religion
 setMapMode('rel');await w(600);const lg=document.body.innerText;o.map=/Heilige Stätte/.test(lg);setMapMode('pol');
 // Diplomatie
 const x=Object.keys(S.fac).find(k=>k!==f&&alive(k)&&inContact(f,k));if(x){openDiplomacy(x);await w(200);o.dip=/Glaubenspolitik:/.test(document.body.innerHTML);closeModal();}
 // alter Spielstand mit P.miss
 const P2=S.prov[provsOf(f)[0]];P2.mon=null;P2.rel='germ';P2.miss=S.turn+6;const js=JSON.stringify(S);loadGame(JSON.parse(js));closeModal();
 for(let i=0;i<3;i++){try{endTurn();}catch(e){o.endErr=e.message;}await w(2500);closeModal();}
 const Q=S.prov[provsOf(S.player).find(i=>S.prov[i].mon)??-1];o.missMig=!!Q||S.prov.every(P=>P.miss==null);o.missLeft=S.prov.filter(P=>P.miss!=null).length;
 return o;});
console.log(JSON.stringify(r));
ok('Provinz: Bekehrung mit Rate/Restrunden',r.prov,r.provTxt.slice(0,160));ok('Hof-Glaubensreiter',r.hof);ok('Toleranzwechsel + Sperre',r.tol1===2&&r.tolLocked&&r.tol2===2,JSON.stringify([r.tol1,r.tolLocked,r.tol2]));
ok('Religionskarte mit Legende',r.map);ok('Diplomatie zeigt Glaubenspolitik',r.dip);ok('Alter Stand mit P.miss',r.missMig&&r.missLeft===0&&!r.endErr,JSON.stringify([r.missLeft,r.endErr]));
ok('Keine Fehler',!errs.length,errs.slice(0,4).join(' | '));console.log(`GLAUBE ${R.filter(Boolean).length}/${R.length}`);await b.close();})();
