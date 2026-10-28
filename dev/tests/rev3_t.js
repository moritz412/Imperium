// Review v179 Teil 2: node rev3_t.js <tag> <w> <h> <mobile> <gfx>
const {chromium}=require('playwright');const fs=require('fs');
const FILE=require('path').join(__dirname,'..','imperium.html'),OUT=__dirname+'/rev2/';
const [tag,W,H,MOB,GFX]=[process.argv[2],+process.argv[3],+process.argv[4],process.argv[5]==='1',process.argv[6]||'leicht'];
const L=(...a)=>{console.log(...a);fs.appendFileSync(OUT+tag+'_log.txt',a.map(x=>typeof x==='string'?x:JSON.stringify(x)).join(' ')+'\n');};
(async()=>{const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:process.env.PW_GPU?[]:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({viewport:{width:W,height:H},deviceScaleFactor:1,hasTouch:true,isMobile:MOB});const p=await ctx.newPage();
 const errs=[];p.on('pageerror',e=>errs.push('PAGE '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/WebGL|GPU stall|Failed to load/.test(m.text()))errs.push('CON '+m.text().slice(0,160));});
 await p.addInitScript(g=>{try{localStorage.setItem('imperium.gfx',JSON.stringify({q:g}));localStorage.setItem('imperium.tutDone','1');}catch(e){}},GFX);
 await p.route(/fonts\.g/,r=>r.abort());
 await p.route(/\.html$/,r=>r.fulfill({body:'<!doctype html><meta charset=utf-8><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'+fs.readFileSync(FILE,'utf8'),contentType:'text/html; charset=utf-8'}));
 await p.goto('http://localhost:'+(process.env.PORT||8772)+'/imperium.html',{timeout:300000});await p.waitForFunction(()=>document.getElementById('loading').hidden,null,{timeout:400000});
 const sh=async(n,wait=1500)=>{await p.waitForTimeout(wait);await p.screenshot({path:OUT+tag+'_'+n+'.jpg',quality:62,timeout:180000}).catch(e=>L('shot',n,e.message));};
 const ev=async(f,a)=>{try{return await p.evaluate(f,a);}catch(e){return 'ERR '+e.message.slice(0,200);}};
 const skip=()=>ev(()=>{try{CINE.end();}catch(e){}document.querySelectorAll('.cgate').forEach(x=>x.remove());const b=[...document.querySelectorAll('button')].find(x=>/Überspringen/.test(x.textContent)&&x.offsetParent);b&&b.click();try{closeModal();}catch(e){}});
 await ev(()=>{newGame('rom');loadGame(S);});await p.waitForTimeout(2500);await skip();
 const rn=await ev(async()=>{const w=ms=>new Promise(z=>setTimeout(z,ms));const D=[];for(let i=0;i<6;i++){try{CINE.end();}catch(e){}try{closeModal();}catch(e){}endTurn();for(let k=0;k<25;k++){await w(600);const m=document.querySelector('.modal-card');if(m&&m.offsetParent){D.push(m.innerText.slice(0,60).replace(/\n/g,' '));const bt=[...m.querySelectorAll('button')].find(x=>/Berechnen|Weiter|Verstanden|Annehmen|OK|Schließen/.test(x.textContent))||m.querySelector('button');bt&&bt.click();}if(!document.querySelector('.modal-card')&&!window.BATTLE)break;}}return{turn:S.turn,D};});
 L('runden',rn);await skip();await sh('a0karte',2000);
 L('todo',await ev(()=>document.getElementById('todo')?.innerText.slice(0,400)));
 const W2=[['a1wirtschaft','openEconomy()'],['a2diplomatie','openDiplomacy()'],['a3hof','openHof()'],['a4chronik','openChronicle()'],['a5menu','openMenu()'],['a6reich','openOverview()'],['a7forschung','openResearch()']];
 for(const [n,fn] of W2){await skip();await ev(fn=>{try{closeModal();}catch(e){}try{(0,eval)(fn);}catch(e){console.error('open '+e.message)}},fn);await sh(n,1800);L(n,await ev(()=>{const m=document.querySelector('.modal-card');return m?m.innerText.slice(0,500).replace(/\n+/g,' | '):null;}));}
 // Haushalt-Reiter + ?-Hilfe
 await ev(()=>{try{closeModal();}catch(e){}openEconomy();const t=[...document.querySelectorAll('.modal-card button')].find(x=>/Haushalt/.test(x.textContent));t&&t.click();const q=document.querySelector('.qhelp');q&&q.click();});await sh('a8haushalt');
 // Diplomatie: erstes fremdes Reich
 await ev(()=>{try{closeModal();}catch(e){}const x=rivals(S.player).find(x=>x!=='horde'&&alive(x)&&knows(x));openDiplomacy(x);});await sh('a9reich_dip');L('dipreich',await ev(()=>document.querySelector('.modal-card')?.innerText.slice(0,500).replace(/\n+/g,' | ')));
 // Startwelt 3, Azteken, Epochenwechsel
 const sw=await ev(async()=>{const w=ms=>new Promise(z=>setTimeout(z,ms));try{closeModal();}catch(e){}const W=await loadWorlds();const S0=S;startWorld(3,'azteken');for(let k=0;k<160&&(S===S0);k++)await w(500);await w(3000);return{year:S.year,ep:ep(),pl:S.player};});
 L('welt3',sw);await skip();
 const cults=[['azteken','meso'],['haudeno','nordam'],['mogul','indien'],['ming','china'],['swahili','afrika'],['zimbabwe','afrika2'],['shogunat','japan']];
 for(const [f,n] of cults){const r=await ev(async f=>{const w=ms=>new Promise(z=>setTimeout(z,ms));try{closeCityView(true);}catch(e){}try{closeModal();}catch(e){}if(!S.fac[f]||!alive(f))return 'tot';const c=capitalOf(f);try{openCityView(c);}catch(e){return 'ERR '+e.message;}await w(5000);return PROV_DEF[c].name;},f);L('stadt',f,r);if(r!=='tot')await sh('c_'+n,2500);}
 await ev(()=>{try{closeCityView(true);}catch(e){}});
 const ew=await ev(async()=>{const w=ms=>new Promise(z=>setTimeout(z,ms));const D=[];try{doEpoch();}catch(e){return 'ERR '+e.message;}for(let k=0;k<30;k++){await w(1200);const m=document.querySelector('.modal-card');if(m&&m.offsetParent){D.push(m.innerText.slice(0,120).replace(/\n/g,' '));if(D.length===1){window.__ep1=m.innerText.slice(0,1200);}const bt=[...m.querySelectorAll('button')].find(x=>/Weiter|Verstanden|OK|Schließen|folgen|Annehmen/.test(x.textContent))||m.querySelector('button');bt&&bt.click();}else if(D.length)break;}return{ep:ep(),year:S.year,player:S.player,name:FACTIONS[S.player].name,D,first:window.__ep1};});
 L('epochenwechsel',ew);await skip();await sh('e1nach_epoche',2500);
 L('fehler',errs.slice(0,20));await b.close();})();
