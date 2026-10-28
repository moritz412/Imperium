const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:process.env.PW_GPU?[]:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:900,height:620},hasTouch:true,isMobile:true});const p=await ctx.newPage();
const c=await ctx.newCDPSession(p);await c.send('Network.enable');
0&&c.on('Network.requestWillBeSent',e=>{if(/sc_caesar_x1\.webp/.test(e.request.url)){console.log('REQ',e.type,JSON.stringify(e.initiator).slice(0,1200));}});
await p.addInitScript(()=>{try{localStorage.setItem('imperium.gfx',JSON.stringify({q:'leicht'}));}catch(e){}});
await p.route(/cdnjs/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));await p.route(/\.html$/,r=>r.fulfill({body:fs.readFileSync(process.argv[2]),contentType:'text/html; charset=utf-8'}));await p.route(/fonts\.g/,r=>r.abort());
await p.goto('http://localhost:'+(process.env.PORT||8772)+'/imperium.html',{timeout:300000});await p.waitForFunction(()=>document.getElementById('loading').hidden,null,{timeout:300000});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
const r=await p.evaluate(async()=>{const w=ms=>new Promise(z=>setTimeout(z,ms));const W=await loadWorlds();const S0=S;startWorld(2,W[2].facs[0].f);for(let k=0;k<180&&(S===S0||ep()!==2);k++)await w(500);closeModal();for(let i=0;i<2;i++){try{endTurn();}catch(e){}await w(2500);closeModal();}
const bad=[];const re=/\d+[,.]\d{2,}/g;const grab=(lbl)=>{document.querySelectorAll('details').forEach(d=>d.open=true);const t=(document.getElementById('sheet')||document.body).innerText+' '+((document.querySelector('.modal')||{}).innerText||'');const m=t.match(re);const el=[...document.querySelectorAll('#sheet *')].find(e=>e.children.length===0&&/\d+\.\d{6,}/.test(e.textContent));if(el)bad.push(lbl+' EL: '+(el.parentElement.parentElement||el.parentElement).outerHTML.slice(0,500));const m2=t.match(/.{0,50}\d+\.\d{6,}.{0,30}/g);if(m2)bad.push(lbl+': '+[...new Set(m2)].slice(0,3).join(' || '));};
const ps=provsOf(S.player).slice(0,6);for(const pi of ps){try{selProv(pi);await w(400);grab('prov '+PROV_DEF[pi].id);}catch(e){bad.push('selProv '+e.message);}}
for(const t of [undefined,'haushalt','siedlungen','provinzen','waren']){try{openEconomy(t);await w(400);grab('eco '+t);closeModal();}catch(e){bad.push('eco '+t+' '+e.message);}}
for(const fn of ['openHof','openOverview','openDiplomacy','openResearch']){try{if(typeof window[fn]==='function'){window[fn]();await w(400);grab(fn);document.querySelectorAll('.tabs button,.areatabs button,.subtabs button').forEach(b=>{});closeModal();}}catch(e){bad.push(fn+' '+e.message);}}
try{openRegion(PROV_DEF[ps[0]].reg);await w(400);grab('region');closeModal();}catch(e){bad.push('region '+e.message);}
try{const k=ps[0];selProv(k);await w(300);const kb=document.querySelector('[data-act=kb]');bad.push('KB-Knopf:'+(kb?kb.parentElement.innerText.slice(0,200):'nicht da (Epoche '+ep()+')'));}catch(e){}
return bad;});console.log(JSON.stringify(r,null,1),'errs',errs.length,errs.slice(0,3));
await b.close();})();
