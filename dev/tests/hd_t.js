const {chromium}=require('playwright');const fs=require('fs');const F=process.argv[2];
(async()=>{const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:process.env.PW_GPU?[]:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const ctx=await b.newContext({viewport:{width:1180,height:820}});const p=await ctx.newPage();
await p.addInitScript(()=>{try{localStorage.setItem('imperium.gfx',JSON.stringify({q:'leicht'}));}catch(e){}});
await p.route(/\.html$/,r=>r.fulfill({body:fs.readFileSync(F),contentType:'text/html; charset=utf-8'}));await p.route(/fonts\.g/,r=>r.abort());
await p.goto('http://localhost:'+(process.env.PORT||8772)+'/imperium.html',{timeout:300000});await p.waitForFunction(()=>document.getElementById('loading').hidden,null,{timeout:300000});
for(const fac of ['rom','qin']){const r=await p.evaluate(fac=>{newGame(fac);loadGame(S);closeModal();const o={};for(const t of ['kir','fam']){openHof(t);o[t]=[...document.querySelectorAll('#dialog h3, #dialog summary')].map(x=>x.textContent.trim().slice(0,50));closeModal();}return o;},fac);console.log(fac,JSON.stringify(r));}
await b.close();})();
