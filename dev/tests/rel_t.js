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
await p.goto('http://localhost:8798/imperium.html',{timeout:300000});await p.waitForFunction(()=>document.getElementById('loading').hidden,null,{timeout:120000});await p.waitForTimeout(1500);
const out=await p.evaluate(async()=>{const R={};for(const w of ['w3','w4']){const j=await (await fetch('saves/'+w+'.json')).json();const s=parseSave(j);S=s;try{loadGame(S);}catch(e){}
  R[w]=PLAYABLE.filter(f=>S.fac[f]&&alive(f)).map(f=>{const c=capitalOf(f);return FACTIONS[f].name+':'+facCul(f)+'/'+relName(facRel(f))+(c!=null?'(Hst '+S.prov[c].cul+')':'')+':'+(indNoGun(f)?'OHNE-GEWEHR':'');});}
  // Funktionstest Glaube
  const f=S.player,r0=facRel(f),sh=relShares(f);S.fac[f].tol=2;const op=faithParts(provsOf(f).find(pi=>S.prov[pi].rel!==facRel(f))??provsOf(f)[0]);
  const alt=sh.find(x=>x[0]!==r0);const can=alt?canAdoptRel(f,alt[0]):null;let ad=false;if(alt&&can.ok)ad=adoptRel(f,alt[0]);
  for(let i=0;i<3;i++)relRound();
  return {R,player:FACTIONS[f].name,r0,sh:sh.slice(0,3),tolParts:op,alt:alt&&alt[0],can,ad,r1:facRel(f),pil:PLAYABLE.filter(x=>alive(x)&&pilgrimGold(x)>0).map(x=>FACTIONS[x].name+' '+pilgrimGold(x)),moscheeOk:canBuild?String(BUILDINGS.lehmmoschee.rel):''};});
console.log(JSON.stringify(out.R.w3));console.log(JSON.stringify(out.R.w4));delete out.R;console.log(JSON.stringify(out));
await p.evaluate(()=>{openHof('kir');});await p.waitForTimeout(1500);await p.screenshot({path:'rel_ui.png',timeout:300000});
console.log('errs',JSON.stringify(errs.slice(0,5)));await b.close();})();
