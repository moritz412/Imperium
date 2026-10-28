const {chromium}=require('playwright');const fs=require('fs');const F=process.argv[2];
(async()=>{const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:process.env.PW_GPU?[]:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage();
await p.route(/\.html$/,r=>r.fulfill({body:fs.readFileSync(F),contentType:'text/html; charset=utf-8'}));await p.route(/fonts\.g/,r=>r.abort());
await p.goto('http://localhost:'+(process.env.PORT||8772)+'/imperium.html',{timeout:300000});await p.waitForFunction(()=>document.getElementById('loading').hidden,null,{timeout:300000});
console.log(await p.evaluate(()=>{const c={};TECHS.forEach(t=>{const r=Array.isArray(t.req)?t.req:t.req?[t.req]:[];r.forEach(x=>c[x]=(c[x]||0)+1);});const per={};TECHS.filter(t=>!t.reg&&!t.xc&&!t.doc).forEach(t=>{per[t.ep]=per[t.ep]||[];if((c[t.id]||0)>=2)per[t.ep].push(t.id);});return JSON.stringify({per,n:TECHS.length});}));await b.close();})();
