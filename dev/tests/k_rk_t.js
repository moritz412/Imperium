// node k_rk_t.js <html> [port] [vorher|nachher] – v207: Reichsvolk-Kachel darf nicht unter den Schließen-Knopf laufen (1024x768 und 768x1024)
const {chromium}=require('playwright');const fs=require('fs');
const FILE=process.argv[2],PORT=process.argv[3]||'8772',TAG=process.argv[4]||'nachher',SH=__dirname+'/shot/k_reichsvolk_';fs.mkdirSync(__dirname+'/shot',{recursive:true});
(async()=>{const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:process.env.PW_GPU?[]:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const R=[];const ok=(n,c,i='')=>{R.push(!!c);console.log((c?'PASS ':'FAIL ')+n+(i?'  '+(typeof i==='string'?i:JSON.stringify(i)):''));};
for(const [W,H] of [[1024,768],[768,1024]]){
const ctx=await b.newContext({viewport:{width:W,height:H},hasTouch:true,isMobile:true});const p=await ctx.newPage();const errs=[];
p.on('pageerror',e=>errs.push('PAGE '+e.message));
await p.addInitScript(()=>{try{localStorage.setItem('imperium.gfx',JSON.stringify({q:'leicht'}));}catch(e){}});
await p.route(/cdnjs/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));
await p.route(/fonts\.g/,r=>r.abort());await p.route(/\.html$/,r=>r.fulfill({body:fs.readFileSync(FILE),contentType:'text/html; charset=utf-8'}));
await p.goto(`http://localhost:${PORT}/imperium.html`,{timeout:300000});await p.waitForFunction(()=>document.getElementById('loading').hidden,null,{timeout:300000});
await p.waitForFunction(()=>!document.querySelector('#loading[data-gate]'),null,{timeout:120000}).catch(()=>{});
await p.evaluate(()=>{newGame('rom');loadGame(S);window.picMsg=()=>{};closeModal();try{document.getElementById('tut').hidden=true;}catch(e){}const me=S.player;S.turn=40;S.fac[me].gold=5000;S.diff=1;
  const caps=new Set(PLAYABLE.filter(f=>f!==me&&alive(f)).map(f=>capitalOf(f)));const seen=new Set(provsOf(me));let q=[...seen];
  while(q.length&&provsOf(me).length<50){const nq=[];for(const pi of q)for(const n of ADJ[pi]){if(seen.has(n)||!isAct(n)||isSeaLink(pi,n))continue;seen.add(n);if(caps.has(n))continue;S.prov[n].owner=me;S.prov[n].unrest=0;nq.push(n);if(provsOf(me).length>=50)break;}q=nq;}
  try{checkElimination();}catch(e){}refreshOwnership();refresh();S.pk1L=null;vmRound();openHof('pol');});
await p.waitForTimeout(1500);await p.waitForFunction(()=>document.getElementById("loading").hidden||!document.querySelector("#loading[data-gate]"),null,{timeout:120000}).catch(()=>{});await p.waitForTimeout(1500);
await p.evaluate(()=>{const t=document.querySelector('.rktile');if(t)t.scrollIntoView({block:'start'});});await p.waitForTimeout(400);
const m=await p.evaluate(()=>{const t=document.querySelector('.rktile');if(!t)return null;const r=t.getBoundingClientRect();const pr=parseFloat(getComputedStyle(t).paddingRight);r.inner=r.right-pr;const c=document.querySelector('#modal .x,#modal .close,#modal [data-close],#modal button[aria-label*="chlie"],#mclose');const cr=c?c.getBoundingClientRect():null;
  const box=t.closest('#dialog,.dlg,#modal')||document.body;const br=box.getBoundingClientRect();
  return{inner:Math.round(r.inner),tile:[r.left,r.top,r.right,r.bottom].map(Math.round),close:cr?[cr.left,cr.top,cr.right,cr.bottom].map(Math.round):null,box:[br.left,br.top,br.right,br.bottom].map(Math.round),sw:t.scrollWidth,cw:t.clientWidth,docsw:document.documentElement.scrollWidth,cls:c&&c.className};});
console.log(W+'x'+H,JSON.stringify(m));
await p.evaluate(()=>{const t=document.querySelector('.rktile');if(t)t.scrollIntoView({block:'start'});});await p.waitForTimeout(500);
await p.screenshot({path:SH+TAG+(W===1024?'':'_768')+'.png'});
if(TAG==='nachher'&&m){ok(`${W}x${H}: Kachel liegt im Fenster`,m.tile[2]<=m.box[2]&&m.tile[0]>=m.box[0],m);if(m.close)ok(`${W}x${H}: Kachel überlappt Schließen-Knopf nicht`,!(m.inner>m.close[0]&&m.tile[0]<m.close[2]&&m.tile[3]>m.close[1]&&m.tile[1]<m.close[3]),m);}
await ctx.close();}
await b.close();process.exit(R.every(Boolean)?0:1);})();
