const {chromium}=require('playwright');const fs=require('fs');
const FILE=process.argv[2],TAG=process.argv[3];
let html=fs.readFileSync(FILE,'utf8').replace(/env\(safe-area-inset-top(,0px)?\)/g,'24px').replace(/env\(safe-area-inset-bottom(,0px)?\)/g,'20px').replace(/env\(safe-area-inset-(left|right)(,0px)?\)/g,'0px');
html='<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'+html;
(async()=>{const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:process.env.PW_GPU?[]:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
for(const [w,h] of [[820,1180]]){
const ctx=await b.newContext({viewport:{width:w,height:h},hasTouch:true,isMobile:true,deviceScaleFactor:1});const p=await ctx.newPage();
await p.addInitScript(()=>{try{localStorage.setItem('imperium.gfx',JSON.stringify({q:'leicht'}));}catch(e){}});
await p.route(/cdnjs/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));await p.route(/\.html$/,r=>r.fulfill({body:html,contentType:'text/html; charset=utf-8'}));await p.route(/fonts\.g/,r=>r.abort());
await p.goto('http://localhost:'+(process.env.PORT||8772)+'/imperium.html',{timeout:300000});await p.waitForFunction(()=>document.getElementById('loading').hidden,null,{timeout:300000});
const r=await p.evaluate(async()=>{const wt=ms=>new Promise(z=>setTimeout(z,ms));const W=await loadWorlds();await startWorld(2,W[2].facs[0].f);for(let i=0;i<40&&!(window.S&&S.player);i++)await wt(250);try{closeModal();}catch(e){}
 const f=S.player,pi=provsOf(f)[0];selProv(pi);await wt(500);const R=e=>{if(!e)return null;const q=e.getBoundingClientRect();return[Math.round(q.top),Math.round(q.bottom),Math.round(q.left),Math.round(q.right)];};
 const sh=document.getElementById('sheet');const txt=sh.innerText;const dec=(txt.match(/\d+[.,]\d{2,}/g)||[]).filter(x=>!/^\d{1,3}\.\d{3}$/.test(x));
 const kb=/Unruhe −2, Steuern \+10 % für 10 Runden/.test(txt);const sheet=R(sh);
 try{openHof();}catch(e){}await wt(500);const dlg=R(document.querySelector('#modal .dialog'));
 const D=document.getElementById('dialog'),cs=getComputedStyle(D);return{cls:D.className,st:D.getAttribute('style'),w:cs.width,ml:cs.marginLeft,pos:cs.position,mpad:getComputedStyle(document.getElementById('modal')).padding,sheet,dlg,top:R(document.getElementById('top')),dec,kb,ep:ep(),htmlBg:getComputedStyle(document.documentElement).backgroundColor,bodyH:document.body.offsetHeight};});
console.log(TAG,w+'x'+h,JSON.stringify(r));
0&&await p.screenshot({path:`${__dirname}/sa_${TAG}_${w}.jpg`,type:'jpeg',quality:60});await ctx.close();}
await b.close();})();
