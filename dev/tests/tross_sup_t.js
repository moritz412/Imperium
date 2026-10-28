const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:process.env.PW_GPU?[]:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:900,height:620},hasTouch:true,isMobile:true});const p=await ctx.newPage();
const c=await ctx.newCDPSession(p);await c.send('Network.enable');
0&&c.on('Network.requestWillBeSent',e=>{if(/sc_caesar_x1\.webp/.test(e.request.url)){console.log('REQ',e.type,JSON.stringify(e.initiator).slice(0,1200));}});
await p.addInitScript(()=>{try{localStorage.setItem('imperium.gfx',JSON.stringify({q:'leicht'}));}catch(e){}});
await p.route(/cdnjs/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));await p.route(/\.html$/,r=>r.fulfill({body:fs.readFileSync(process.argv[2]),contentType:'text/html; charset=utf-8'}));await p.route(/fonts\.g/,r=>r.abort());
await p.goto('http://localhost:'+(process.env.PORT||8772)+'/imperium.html',{timeout:300000});await p.waitForFunction(()=>document.getElementById('loading').hidden,null,{timeout:300000});
const r=await p.evaluate(async()=>{newGame('rom');loadGame(S);closeModal();const f=S.player,own=pi=>{const o=S.prov[pi].owner;return o===f||isAlly(f,o);};
 const dist={};let fr=Object.keys(S.prov).map(Number).filter(own);fr.forEach(x=>dist[x]=0);let d=0;while(fr.length&&d<4){d++;const nx=[];for(const q of fr)for(const n of ADJ[q])if(dist[n]==null&&!PROV_DEF[n].sea){dist[n]=d;nx.push(n);}fr=nx;}
 const a=S.armies.find(x=>x.f===f&&x.units.length);const out={};for(const k of [1,2,3,4]){const pi=Object.keys(dist).map(Number).find(x=>dist[x]===k);if(pi==null)continue;const op=a.p;a.p=pi;a.tr=null;const n=supplyInfo(a);a.tr={t:S.turn};const t=supplyInfo(a);a.tr=null;a.p=op;out[k]={ohne:n.ok+' '+n.t,mit:t.ok+' '+t.t};}return out;});console.log(JSON.stringify(r,null,1));
await b.close();})();
