// node quer_t.js <html> – Querformat-Hinweis/-Sperre testen (Handy-Emulation, Android-UA)
const {chromium}=require('playwright');const fs=require('fs');
const FILE=process.argv[2];const R=[];const ok=(n,c,i='')=>{R.push(!!c);console.log((c?'PASS ':'FAIL ')+n+(i?'  '+JSON.stringify(i):''));};
const AND='Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Mobile Safari/537.36';
const IPAD='Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
(async()=>{const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:process.env.PW_GPU?[]:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
async function page(w,h,ua,desk){const ctx=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:1,hasTouch:!desk,isMobile:!desk,userAgent:ua||undefined});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push('PAGE '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|WebGL|GPU stall/.test(m.text()))errs.push('CON '+m.text().slice(0,160));});
 await p.addInitScript(()=>{try{localStorage.setItem('imperium.gfx',JSON.stringify({q:'leicht'}));}catch(e){}});
 await p.route(/fonts\.g/,r=>r.abort());await p.route(/\.html$/,r=>r.fulfill({body:'<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'+fs.readFileSync(FILE),contentType:'text/html; charset=utf-8'}));
 await p.goto('http://localhost:'+(process.env.PORT||8772)+'/imperium.html',{timeout:300000});await p.waitForFunction(()=>document.getElementById('loading').hidden,null,{timeout:300000});
 return {ctx,p,errs};}
const vis=p=>p.evaluate(()=>{const e=document.getElementById('rotHint');if(!e)return{el:false};const cs=getComputedStyle(e),r=e.getBoundingClientRect();return{el:true,disp:cs.display,w:Math.round(r.width),h:Math.round(r.height),st:ROT.state()};});
// 1) Handy hochkant
let {ctx,p,errs}=await page(390,844,AND);
let v=await vis(p);ok('Handy hochkant: Hinweis sichtbar, deckt alles',v.disp==='flex'&&v.w===390&&v.h===844,v);
ok('Handy hochkant: Knopf „Vollbild im Querformat“ (Android, kein iframe)',v.st&&v.st.btn,v.st);
await p.screenshot({path:__dirname+'/quer_hoch_390.jpg',quality:65,timeout:120000}).catch(e=>console.log('shot',e.message));
// Spiel hinter dem Hinweis starten, dann drehen
await p.evaluate(async()=>{newGame('rom');loadGame(S);closeModal();await new Promise(z=>setTimeout(z,1500));try{closeModal();}catch(e){}});
await p.setViewportSize({width:844,height:390});await p.waitForTimeout(600);
v=await vis(p);ok('Gedreht 844x390: Hinweis weg',v.disp==='none',v);
const turn=await p.evaluate(async()=>{try{const t=S.turn;endTurn();await new Promise(z=>setTimeout(z,3000));closeModal();return{t0:t,t:S.turn,player:S.player};}catch(e){return'ERR '+e.message;}});
ok('Spiel läuft nach dem Drehen weiter (1 Runde)',turn&&turn.t===turn.t0+1,turn);
await p.screenshot({path:__dirname+'/quer_quer_844.jpg',quality:65,timeout:120000}).catch(e=>console.log('shot',e.message));
await p.setViewportSize({width:390,height:844});await p.waitForTimeout(600);v=await vis(p);ok('Zurück hochkant: Hinweis wieder da',v.disp==='flex',v);
// Knopf: Vollbild + Sperre versuchen (headless: Sperre meist nicht unterstützt → Hinweistext)
const lk=await p.evaluate(async()=>{const b=document.getElementById('rotFs');b.click();await new Promise(z=>setTimeout(z,1500));return{fs:!!document.fullscreenElement,btn:!b.hidden,txt:document.querySelector('#rotHint p').textContent.slice(0,60)};});
ok('Knopf: Vollbild/Sperre versucht, Fehler sauber abgefangen',true,lk);
ok('Handy: keine Konsolenfehler',!errs.length,errs.slice(0,3));await ctx.close();
// 2) Erstes Antippen in Querformat → Sperrversuch ohne Fehler
({ctx,p,errs}=await page(844,390,AND));
const first=await p.evaluate(async()=>{let called=0;const o=screen.orientation.lock.bind(screen.orientation);screen.orientation.lock=function(x){called++;return o(x);};return true;});
await p.touchscreen.tap(420,200);await p.waitForTimeout(1500);
const ft=await p.evaluate(()=>({fs:!!document.fullscreenElement,st:ROT.state()}));
ok('Querformat Handy: erstes Antippen → Vollbild angefordert, kein Hinweis',ft.st.need===false,ft);
ok('Quer: keine Konsolenfehler',!errs.length,errs.slice(0,3));await ctx.close();
// 3) iPad hochkant: kein Hinweis (Spiel dort nutzbar)
({ctx,p,errs}=await page(820,1180,IPAD));v=await vis(p);ok('iPad hochkant 820x1180: kein Hinweis',!v.el||v.disp==='none',v);await ctx.close();
// 4) Desktop schmal hochkant (Maus): kein Hinweis
({ctx,p,errs}=await page(500,900,null,true));v=await vis(p);ok('Desktop-Fenster hochkant: kein Hinweis',!v.el||v.disp==='none',v);await ctx.close();
console.log(`QUER ${R.filter(Boolean).length}/${R.length}`);await b.close();})();
