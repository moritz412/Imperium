const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:process.env.PW_GPU?[]:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:1024,height:768}});
p.on('pageerror',e=>console.log('PAGEERR',e.message));
await p.addInitScript(()=>{try{localStorage.setItem('imperium.gfx',JSON.stringify({q:'leicht'}));}catch(e){}});
await p.route(/cdnjs/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));await p.route(/fonts\.g|google/,r=>r.abort());
await p.route(/\.html$/,r=>r.fulfill({body:fs.readFileSync(process.argv[2]),contentType:'text/html; charset=utf-8'}));
await p.goto('http://localhost:8833/imperium.html',{waitUntil:'domcontentloaded',timeout:300000});
await p.waitForFunction(()=>document.getElementById('loading').hidden,null,{timeout:300000});
await p.evaluate(()=>{window.showEvent=(E,ctx,next)=>{try{const o=E.opts.find(o=>!o.cost||S.fac[S.player].gold>=o.cost())||E.opts[0];o.fx(S.player,ctx);}catch(e){console.error('ev '+e.message);}next&&next();};window.picMsg=()=>{};window.playCine=(c,cb)=>cb&&cb();});
for(const id of ['nobunaga','naresuan','zhenghe','yisunsin','temujin','dreibund']){const r=await p.evaluate(async id=>{try{localStorage.setItem('imperium.scenWins',JSON.stringify({pachacutec:'Gold',temujin:'Gold'}));await startScenario(id);closeModal();const f=S.player,D=dynOf(f);const sample=[];for(let k=0;k<6;k++)sample.push(cGiven(f,k%3?'m':'f'));return id+' ['+facCul(f)+'/'+(typeof asiaSub==='function'?asiaSub(f):'')+'] Haus '+D.house+' | Familie: '+[D.ruler,...D.kids,...D.kin].map(p=>p.n).join(', ')+' | neu: '+sample.join(', ');}catch(e){return id+' ERR '+e.message;}},id);console.log(r);}
await b.close();})();
