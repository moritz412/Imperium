// node epf_t.js <html> [port] [tag] – Epochen-Fixes: Kinobild Azteken, gebündelter Epochenbericht (Dialogzahl), Volkswechsel (Haus/Glaube)
const {chromium}=require('playwright');const fs=require('fs');
const [FILE,PORT,TAG]=[process.argv[2],process.argv[3]||'8772',process.argv[4]||'x'];const OUT=__dirname+'/epf/';
(async()=>{const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:process.env.PW_GPU?[]:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const R=[];const ok=(n,c,i='')=>{R.push(!!c);console.log((c?'PASS ':'FAIL ')+n+(i?'  '+String(i).slice(0,900):''));};
const page=async()=>{const ctx=await b.newContext({viewport:{width:1180,height:820},hasTouch:true});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push('PAGE '+e.message));
 await p.addInitScript(()=>{try{localStorage.setItem('imperium.gfx',JSON.stringify({q:'leicht'}));}catch(e){}});
 await p.route(/fonts\.g/,r=>r.abort());await p.route(/\.html$/,r=>r.fulfill({body:fs.readFileSync(FILE),contentType:'text/html; charset=utf-8'}));
 await p.goto(`http://localhost:${PORT}/imperium.html`,{timeout:300000});await p.waitForFunction(()=>document.getElementById('loading').hidden,null,{timeout:300000});return{p,ctx,errs};};
// 1) Kinobild beim ersten Kapitel der Azteken (Startwelt 3)
{const {p,ctx,errs}=await page();
 await p.evaluate(async()=>{await loadWorlds();startWorld(3,'azteken');});
 let r=null;for(let i=0;i<120;i++){r=await p.evaluate(()=>{const c=document.querySelector('.cine');if(!c)return null;const L=[...c.querySelectorAll('.ci')].map(e=>e.style.backgroundImage).filter(Boolean);return{L,eb:(c.querySelector('.ctit h1')||{}).textContent};});if(r&&r.L.length)break;await p.waitForTimeout(500);}
 await p.screenshot({path:OUT+`cine_${TAG}.jpg`,quality:65}).catch(()=>{});
 ok('Kinobild Azteken nicht europäisch (kein ep_3)',r&&r.L.length&&!r.L.some(u=>/ep_3\.webp/.test(u)),JSON.stringify(r&&{eb:r.eb,L:r.L.map(u=>u.slice(0,60))}));
 ok('keine Seitenfehler (Kino)',!errs.length,errs.join(' | '));await ctx.close();}
// 2) Epochenbericht gebündelt + 3) Volkswechsel
{const {p,ctx,errs}=await page();
 const r=await p.evaluate(async()=>{const w=ms=>new Promise(z=>setTimeout(z,ms));window.picMsg=()=>{};
   newGame('qin');loadGame(S);closeModal();S.turn=S.epochTurn+EPOCH_MIN;const h0=dynOf(S.player).house;
   doEpoch();S.thronMsg={t:S.turn,o:'Alter Herrscher',oa:71,n:'Neuer Herrscher',a:34,h:dynOf(S.player).house,rg:false};
   const dl=[];let first=null;window.__d=0;showEpochNews(()=>{window.__d=1;});
   for(let k=0;k<20&&!window.__d;k++){await w(300);const d=document.getElementById('dialog'),m=document.getElementById('modal');if(m.hidden)continue;const t=(d.querySelector('h2')||{}).textContent||'?';dl.push(t);
     if(!first)first={book:!!d.querySelector('#epBookBtn'),map:!!d.querySelector('canvas[data-bkmap]'),thr:/Herrscherhaus/.test(d.textContent),people:d.querySelectorAll('[data-people]').length};
     const P=[...d.querySelectorAll('[data-people]')];if(P.length){P[P.length-1].click();continue;}
     const c=d.querySelector('.actions .btn.primary')||d.querySelector('.actions .btn')||d.querySelector('.faccard,[data-pick],.list button');if(c)c.click();else{closeModal();}}
   const F=S.fac[S.player];return{dl,first,done:window.__d,h0,h1:dynOf(S.player).house,people:F.people,cul:facCul(S.player),rel:facRel(S.player),logs:S.log.slice(-12).map(e=>e.t||e.txt||'').filter(t=>/Haus|Glaube|Volk|Namen/.test(t))};});
 await p.screenshot({path:OUT+`news_${TAG}.jpg`,quality:65}).catch(()=>{});
 console.log('DIALOGE',r.dl.length,JSON.stringify(r.dl));
 ok('Epochenbericht enthält Buch-Knopf, Karte und Thronwechsel',r.first&&r.first.book&&r.first.thr,JSON.stringify(r.first));
 ok('Kette läuft durch',r.done===1,JSON.stringify(r.dl));
 ok('Volkswechsel: neues Herrscherhaus (falls Volk gewechselt)',r.people==='qin'||r.h1!==r.h0,JSON.stringify({p:r.people,h0:r.h0,h1:r.h1,cul:r.cul,rel:r.rel,logs:r.logs}));
 ok('keine Seitenfehler (Bericht)',!errs.length,errs.join(' | '));await ctx.close();}
console.log(`EPF ${R.filter(Boolean).length}/${R.length}`);await b.close();})().catch(e=>{console.log('FAIL',e.message);process.exit(1);});
