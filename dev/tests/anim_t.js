// node anim_t.js <html> [port] – Sprechanimation der Berater
const {chromium}=require('playwright');const fs=require('fs');
const FILE=process.argv[2],PORT=process.argv[3]||'8772';
(async()=>{const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required']});
const R=[];const ok=(n,c,i='')=>{R.push(!!c);console.log((c?'PASS ':'FAIL ')+n+(i?'  '+(typeof i==='string'?i:JSON.stringify(i)):''));};
async function page(rm){const ctx=await b.newContext({viewport:{width:1024,height:700},hasTouch:true,isMobile:true,reducedMotion:rm?'reduce':'no-preference'});const p=await ctx.newPage();const errs=[];
 p.on('pageerror',e=>errs.push('PAGE '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|WebGL|GPU stall/.test(m.text()))errs.push('CON '+m.text().slice(0,160));});
 await p.addInitScript(()=>{try{localStorage.setItem('imperium.gfx',JSON.stringify({q:'leicht'}));}catch(e){}});
 await p.route(/cdnjs/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));
 await p.route(/fonts\.g/,r=>r.abort());
 await p.route(/\.html$/,r=>r.fulfill({body:fs.readFileSync(FILE),contentType:'text/html; charset=utf-8'}));
 await p.goto(`http://localhost:${PORT}/imperium.html`,{timeout:600000});await p.waitForFunction(()=>document.getElementById('loading').hidden,null,{timeout:600000});
 await p.evaluate(()=>{newGame('rom');loadGame(S);closeModal();RATV.set('on','alle');});return{p,errs};}
const {p,errs}=await page(false);
// 1) Rat geschlossen → Einblendung
let r=await p.evaluate(async()=>{const w=ms=>new Promise(z=>setTimeout(z,ms));S.ratV={t:-1,cd:{},alt:{}};RATV.say('rat_kanzler_gruss',{cd:0,txt:'Hoheit, der Rat ist versammelt.'});
  let el=null;for(let i=0;i<40&&!(el=document.getElementById('ratSay'))||(el&&el.hidden&&i<40);i++)await w(100);
  const box=document.getElementById('ratSay');return{has:!!box,vis:!!box&&!box.hidden,speak:!!(box&&box.querySelector('.ratp.speak')),txt:box?box.textContent:'',last:RATV.last,anim:box&&box.querySelector('.ratp.speak')?getComputedStyle(box.querySelector('.ratp.speak')).animationName:null,paused:NARR.el.paused,dur:NARR.el.duration};});
ok('Einblendung bei geschlossenem Rat',r.vis&&r.speak&&/Hoheit, der Rat/.test(r.txt)&&r.anim==='ratGlow',r);
await p.screenshot({path:__dirname+'/anim_einblendung.jpg',quality:75,timeout:90000}).catch(e=>console.log('shot',e.message.split('\n')[0]));
r=await p.evaluate(async()=>{const w=ms=>new Promise(z=>setTimeout(z,ms));const t0=Date.now();for(let i=0;i<150&&!NARR.el.ended&&!NARR.el.paused;i++)await w(100);await w(600);const box=document.getElementById('ratSay');return{ended:NARR.el.ended,paused:NARR.el.paused,ms:Date.now()-t0,hidden:!box||box.hidden,speak:document.querySelectorAll('.ratp.speak').length};});
ok('Clipende → Einblendung weg, kein Glühen',r.hidden&&r.speak===0,r);
// 2) Rat offen → Porträt in der Ratskarte glüht, keine Einblendung
r=await p.evaluate(async()=>{const w=ms=>new Promise(z=>setTimeout(z,ms));S.ratV={t:-1,cd:{},alt:{}};S.rat=S.rat||{L:[],cd:{}};
  S.rat.L=[{o:'kanzler',k:'kasse',id:'kasse',txt:'Die Kasse leert sich: Testvorschlag.',why:['Test'],act:{k:'open'},urg:3,vo:'rat_kanzler_kasse_knapp_01',t:S.turn}];
  openRat();for(let i=0;i<80&&!document.querySelector('.ratp.speak');i++)await w(100);
  const g=document.querySelector('#modal .ratr[data-rato="kanzler"] .ratp');const box=document.getElementById('ratSay');
  return{busy:NARR.busy(),ratV:S.ratV,row:!!g,speak:!!(g&&g.classList.contains('speak')),box:!!box&&!box.hidden,last:RATV.last,anim:g?getComputedStyle(g).animationName:null};});
ok('Rat offen: Porträt glüht in der Ratskarte',r.row&&r.speak&&!r.box&&r.anim==='ratGlow',r);
await p.screenshot({path:__dirname+'/anim_rat.jpg',quality:75,timeout:90000}).catch(e=>console.log('shot',e.message.split('\n')[0]));
r=await p.evaluate(async()=>{const w=ms=>new Promise(z=>setTimeout(z,ms));for(let i=0;i<150&&!NARR.el.ended&&!NARR.el.paused;i++)await w(100);await w(300);return{speak:document.querySelectorAll('.ratp.speak').length};});
ok('Rat offen: Clipende → Glühen aus',r.speak===0,r);
// 3) Antippen der Einblendung schließt sie
r=await p.evaluate(async()=>{const w=ms=>new Promise(z=>setTimeout(z,ms));closeModal();S.ratV={t:-1,cd:{},alt:{}};RATV.say('rat_marschall_gruss',{cd:0,txt:'Test'});for(let i=0;i<40&&!(document.getElementById('ratSay')&&!document.getElementById('ratSay').hidden);i++)await w(100);const vis=!document.getElementById('ratSay').hidden;document.getElementById('ratSay').click();await w(500);return{vis,after:document.getElementById('ratSay').hidden,speak:document.querySelectorAll('.ratp.speak').length};});
ok('Antippen schließt Einblendung',r.vis&&r.after&&r.speak===0,r);
ok('Keine Seiten-/Konsolenfehler',!errs.length,errs.slice(0,3).join(' | '));
// 4) reduzierte Bewegung
const q=await page(true);
r=await q.p.evaluate(async()=>{const w=ms=>new Promise(z=>setTimeout(z,ms));S.ratV={t:-1,cd:{},alt:{}};RATV.say('rat_gelehrter_gruss',{cd:0,txt:'Test'});for(let i=0;i<40&&!document.querySelector('#ratSay .ratp.speak');i++)await w(100);const g=document.querySelector('#ratSay .ratp.speak');return{has:!!g,anim:g?getComputedStyle(g).animationName:null,sh:g?getComputedStyle(g).boxShadow:null};});
ok('Bewegung reduzieren: keine Animation, festes Glühen',r.has&&r.anim==='none'&&/rgba/.test(r.sh||''),r);
console.log(`ANIM ${R.filter(Boolean).length}/${R.length}`);await b.close();})();
