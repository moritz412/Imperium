// Review-Durchlauf v175: node rev_t.js <tag> <w> <h> <mobile 0/1> <gfx>
const {chromium}=require('playwright');const fs=require('fs');
const FILE=require('path').join(__dirname,'..','imperium.html'),OUT=__dirname+'/rev/';
const [tag,W,H,MOB,GFX]=[process.argv[2],+process.argv[3],+process.argv[4],process.argv[5]==='1',process.argv[6]||'leicht'];
const L=(...a)=>{console.log(...a);fs.appendFileSync(OUT+tag+'_log.txt',a.map(x=>typeof x==='string'?x:JSON.stringify(x)).join(' ')+'\n');};
(async()=>{const t0=Date.now();const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:process.env.PW_GPU?[]:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({viewport:{width:W,height:H},deviceScaleFactor:1,hasTouch:true,isMobile:MOB});const p=await ctx.newPage();
 const errs=[];p.on('pageerror',e=>errs.push('PAGE '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/WebGL|GPU stall/.test(m.text()))errs.push('CON '+m.text().slice(0,160));});
 p.on('response',r=>{if(r.status()>=400)errs.push('HTTP '+r.status()+' '+r.url().slice(-50));});
 await p.addInitScript(g=>{try{localStorage.setItem('imperium.gfx',JSON.stringify({q:g}));}catch(e){}},GFX);
 await p.route(/fonts\.g/,r=>r.abort());
 await p.route(/\.html$/,r=>r.fulfill({body:'<!doctype html><meta charset=utf-8><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'+fs.readFileSync(FILE,'utf8'),contentType:'text/html; charset=utf-8'}));
 const tl=Date.now();await p.goto('http://localhost:'+(process.env.PORT||8772)+'/imperium.html',{timeout:300000});await p.waitForFunction(()=>document.getElementById('loading').hidden,null,{timeout:400000});
 L('ladezeit_s',Math.round((Date.now()-tl)/1000));
 const sh=async(n,wait=1500)=>{await p.waitForTimeout(wait);await p.screenshot({path:OUT+tag+'_'+n+'.jpg',quality:62,timeout:180000}).catch(e=>L('shot',n,e.message));};
 const ev=async(f,a)=>{try{return await p.evaluate(f,a);}catch(e){return 'ERR '+e.message.slice(0,200);}};
 await sh('00start');
 L('start',await ev(()=>({txt:document.getElementById('start').innerText.slice(0,600)})));
 // Endlos-Seite
 await ev(()=>{const b=[...document.querySelectorAll('#start button')].find(x=>/Endlos/.test(x.textContent));b&&b.click();});await sh('01endlos');
 L('endlos',await ev(()=>document.getElementById('start').innerText.slice(0,700)));
 // Geschichten-Seite
 await ev(()=>{const bk=[...document.querySelectorAll('#start button')].find(x=>/Zurück|‹/.test(x.textContent));bk&&bk.click();const b=[...document.querySelectorAll('#start button')].find(x=>/Geschichte spielen/.test(x.textContent));b&&b.click();});await sh('02geschichten');
 // Neues Spiel Rom über Funktion (Volkswahl-Klickpfad notiert)
 await ev(()=>{try{localStorage.removeItem('imperium.tutDone');}catch(e){}newGame('rom');loadGame(S);});await sh('03neu_rom',2500);
 L('nach_start_modal',await ev(()=>{const m=document.querySelector('.modal:not([hidden]) ,#modal:not([hidden])');const t=document.getElementById('tut');return{modal:m?m.innerText.slice(0,500):null,tut:t&&!t.hidden?t.innerText.slice(0,500):null};}));
 // Einführung durchklicken
 for(let i=0;i<9;i++){const r=await ev(()=>{const t=document.getElementById('tut');if(!t||t.hidden)return null;const tx=t.innerText.slice(0,300);const b=[...t.querySelectorAll('button')].find(x=>/Weiter|Los|Verstanden|Fertig|Spielen/.test(x.textContent))||t.querySelector('button');b&&b.click();return tx;});if(!r)break;L('tut'+i,r);if(i<2)await sh('04tut'+i,600);}
 await ev(()=>{try{closeModal();}catch(e){}});await sh('05karte_rom',2500);
 L('dom',await ev(()=>({top:[...document.querySelectorAll('#top button')].filter(b=>b.offsetParent).map(b=>(b.innerText||b.getAttribute('aria-label')||b.title||'').trim().replace(/\s+/g,' ').slice(0,22)),todo:(document.getElementById('todo')||{}).innerText?.slice(0,300),sheet:(document.getElementById('sheet')||{}).innerText?.slice(0,400)})));
 // Heer wählen, Ziel, Blase
 const hz=await ev(async()=>{const w=ms=>new Promise(z=>setTimeout(z,ms));const a=S.armies.find(x=>x.f===S.player&&x.units.length);selectArmy(a.id);try{focusProv(a.p,9);}catch(e){}refresh();await w(1200);
   let tgt=null,own=null;const R=reachMap(a);for(const [pi,Lx] of R){if(Lx.t===0&&S.prov[pi].owner===S.player&&pi!==a.p){own=pi;}if(Lx.t===0&&S.prov[pi].owner!==S.player&&S.prov[pi].owner!=='frei'&&tgt==null)tgt=pi;}
   UI.preview=own!=null?own:tgt;UI.previewPt=null;refresh();await w(1000);const bub=document.getElementById('cmdbub');return{army:a.name,own:own!=null?PROV_DEF[own].name:null,bub:bub&&!bub.hidden?bub.innerText:null,sheet:document.getElementById('sheet').innerText.slice(0,300)};});
 L('heer',hz);await sh('06heer_blase');
 const mv=await ev(async()=>{const w=ms=>new Promise(z=>setTimeout(z,ms));const bub=document.getElementById('cmdbub');const bt=bub&&bub.querySelector('button');if(bt)bt.click();await w(1500);const u=[...document.querySelectorAll('button')].find(x=>/Rückgängig|zurücknehmen/.test(x.textContent)&&x.offsetParent);return{undo:u?u.textContent.trim():null};});
 L('marsch',mv);await sh('07nach_marsch');
 // Runden spielen
 const rn=await ev(async()=>{const w=ms=>new Promise(z=>setTimeout(z,ms));const log=[];window.showEvent=window.showEvent;for(let i=0;i<8;i++){try{closeModal();}catch(e){}try{endTurn();}catch(e){log.push('endTurn '+e.message);break;}for(let k=0;k<30;k++){await w(700);const m=document.querySelector('#modal:not([hidden]) .modal-card, .modal:not([hidden])');const bt=m?[...m.querySelectorAll('button')].find(x=>/Berechnen|Weiter|Annehmen|OK|Verstanden|Schließen/.test(x.textContent)):null;if(bt){log.push((m.querySelector('h2')||{}).textContent||'?');bt.click();}else if(!m)break;}}
   const F=S.fac[S.player];return{turn:S.turn,year:S.year,gold:F.gold,prov:provsOf(S.player).length,armies:S.armies.filter(a=>a.f===S.player).length,dialogs:log.slice(0,40)};});
 L('runden',rn);await sh('08nach_runden',2000);
 for(const [n,fn] of [['10hof','openHof()'],['11wirtschaft','openEconomy()'],['12diplomatie','openDiplomacy()'],['13reich','openOverview()'],['14forschung','openResearch()'],['15chronik','openChronicle()'],['16menu','openMenu()']]){await ev(fn=>{try{closeModal();}catch(e){}try{(0,eval)(fn);}catch(e){console.log(e.message)}},fn);await sh(n,1800);L(n,await ev(()=>{const m=document.querySelector('.modal-card');return m?m.innerText.slice(0,350).replace(/\n+/g,' | '):null;}));}
 await ev(()=>{try{closeModal();}catch(e){}UI.sel=capitalOf(S.player);UI.army=null;UI.mode='prov';refresh();});await sh('17provinz');
 L('provinz',await ev(()=>document.getElementById('sheet').innerText.slice(0,500).replace(/\n+/g,' | ')));
 await ev(()=>{try{openCityView(capitalOf(S.player));}catch(e){console.log(e.message)}});await sh('18stadt',3500);
 await ev(()=>{try{closeCityView(true);}catch(e){}});
 // Rat
 await ev(()=>{try{openRat?openRat():null;}catch(e){}});await sh('19rat',1500);
 // Schlacht: Angriff erzwingen
 const sb=await ev(async()=>{const w=ms=>new Promise(z=>setTimeout(z,ms));try{closeModal();}catch(e){}const a=S.armies.filter(x=>x.f===S.player&&x.units.length).sort((x,y)=>y.units.length-x.units.length)[0];if(!a)return'kein heer';let tgt=null;for(const pi of ADJ[a.p]){const o=S.prov[pi].owner;if(o!==S.player&&o!=='frei'){tgt=pi;break;}}if(tgt==null)return'kein ziel';try{declareWar(S.player,S.prov[tgt].owner);}catch(e){}a.mp=Math.max(a.mp||0,3);selectArmy(a.id);UI.preview=tgt;refresh();await w(1200);const bub=document.getElementById('cmdbub');const t=bub&&!bub.hidden?bub.innerText:null;const bt=bub&&bub.querySelector('button');if(bt)bt.click();await w(2500);const m=document.querySelector('.modal-card');return{bub:t,modal:m?m.innerText.slice(0,400).replace(/\n+/g,' | '):null};});
 L('schlacht_vor',sb);await sh('20angriff');
 const sb2=await ev(async()=>{const w=ms=>new Promise(z=>setTimeout(z,ms));const m=document.querySelector('.modal-card');const bt=m?[...m.querySelectorAll('button')].find(x=>/Schlacht schlagen|Schlagen|Echtzeit/.test(x.textContent)):null;if(bt){bt.click();await w(9000);return 'echtzeit '+!!(typeof BATTLE!=='undefined'&&BATTLE);}return 'kein Knopf';});
 L('schlacht_echt',sb2);await sh('21schlacht',3000);await sh('22schlacht2',5000);
 L('fehler_bis_hier',errs.slice(0,20));L('dauer_s',Math.round((Date.now()-t0)/1000));
 await b.close();})();
