// Integrationstests Task 01 (iPad-Emulation in Chromium: Touch, DPR 2, 1180x820). Aufruf: node integ.js <html>
const {chromium}=require('playwright');const fs=require('fs');
const FILE=process.argv[2]||require('path').join(__dirname,'..','imperium.html');
const R=[];const ok=(n,c,info='')=>{R.push([n,!!c,info]);console.log((c?'PASS ':'FAIL ')+n+(info?'  '+info:''));};
(async()=>{const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:process.env.PW_GPU?[]:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:1180,height:820},deviceScaleFactor:2,hasTouch:true,isMobile:true});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>{errs.push(e.message);console.log('PAGEERR',e.message);});
p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))errs.push(m.text());});
await p.route(/cdnjs/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));
await p.route(/fonts\.g/,r=>r.abort());
await p.route(/\.html$/,r=>r.fulfill({body:fs.readFileSync(FILE),contentType:'text/html; charset=utf-8'}));
await p.goto('http://localhost:8796/imperium.html',{timeout:300000});await p.waitForFunction(()=>document.getElementById('loading').hidden,null,{timeout:120000});await p.waitForTimeout(1500);
const out=await p.evaluate(()=>{const R=[];newGame('rom');loadGame(S);
 const show=()=>{const L=['rom','karthago','makedonien','arverner','germanen','ptolemaeer','seleukiden','odrysen','slawen','nord','osmanen','araber','aksum','ghana','azteken','inka','maya','mogul','marathen','vijaya','mapuche','haudeno','swahili'];
   R.push('E'+ep()+': '+L.filter(f=>S.fac[f]&&alive(f)).map(f=>{try{return f+'['+facPid(f)+','+facCul(f)+']='+[0,1,2,3].map(r=>rankName(f,r)).join('/')+' ('+realmName(f,3)+')';}catch(e){return f+'=ERR '+e.message;}}).join(' | '));};
 show();for(let k=0;k<4;k++){S.turn=S.epochTurn+EPOCH_MIN;doEpoch();show();}
 // Reformation-Filter
 const H=HIST.find(h=>h.id==='reformation'),K=HIST.find(h=>h.id==='kreuzzug');
 const t=f=>{try{return f+':'+(histOk(H,f)?'ja':'nein')+' rel='+facRel(f);}catch(e){return f+':ERR';}};
 R.push('Reformation '+['osmanen','iberer','kastilien','rom','polen','slawen','azteken','mogul'].filter(f=>S.fac[f]&&alive(f)).map(t).join(' '));
 R.push('Kreuzzug '+['osmanen','rom','araber','ghana','mogul'].filter(f=>S.fac[f]&&alive(f)).map(f=>f+':'+(histOk(K,f)?'ja':'nein')).join(' '));
 R.push('Pick '+JSON.stringify([0,1,2,3,4,5].map(()=>histAiPick(H,'rom').label)));
 R.push('Addons '+JSON.stringify(S.addons)+' spawned am:'+['azteken','inka','usa'].map(f=>alive(f)).join(','));
 return R;});
console.log(out.join('\n'));
// Kastilien in Geschichte 'kastilien'
const k2=await p.evaluate(()=>{startScenario('kastilien');const H=HIST.find(h=>h.id==='reformation');const f=S.player;return 'Geschichte kastilien: spieler '+f+' rel='+facRel(f)+' Reformation ok='+histOk(H,f)+' titel='+mainTitle(f)+' / '+realmName(f);});console.log(k2);
// Amerika-Kapitel aus: keine Spawns
const k3=await p.evaluate(()=>{ADDON_SEL.am=false;ADDON_SEL.af=false;newGame('rom');ADDON_SEL.am=true;ADDON_SEL.af=true;for(let k=0;k<4;k++){S.turn=S.epochTurn+EPOCH_MIN;doEpoch();}return 'am/af aus: azteken '+alive('azteken')+' usa '+alive('usa')+' aksum '+alive('aksum')+' mogul '+alive('mogul');});console.log(k3);
console.log('errs',JSON.stringify(errs.slice(0,3)));await b.close();})();
