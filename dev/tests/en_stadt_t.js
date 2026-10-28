// node en_stadt_t.js <html> [port] – W2 Paket B (v203): englische Stadtbilder (angel/dane) aus c_en im Wikinger-Szenario; Screenshot shot/w2_england.png
const {chromium}=require('playwright');const fs=require('fs');
const FILE=process.argv[2]||require('path').join(__dirname,'..','imperium.html'),PORT=process.argv[3]||'8772';
(async()=>{const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:process.env.PW_GPU?[]:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const R=[];const ok=(n,c,i='')=>{R.push(!!c);console.log((c?'PASS ':'FAIL ')+n+(i?'  '+i:''));};
const ctx=await b.newContext({viewport:{width:1024,height:768},hasTouch:true,isMobile:true});const p=await ctx.newPage();const errs=[];
p.on('pageerror',e=>errs.push('PAGE '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|WebGL|GPU stall/.test(m.text()))errs.push('CON '+m.text().slice(0,200));});
const Q=process.env.GFXQ||'hoch';
await p.addInitScript(q=>{try{localStorage.setItem('imperium.gfx',JSON.stringify({q}));}catch(e){}},Q);
await p.route(/cdnjs/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));
await p.route(/fonts\.g/,r=>r.abort());await p.route(/\.html$/,r=>r.fulfill({body:fs.readFileSync(FILE),contentType:'text/html; charset=utf-8'}));
const reqs=[];p.on('request',r=>{if(/models\/c_en/.test(r.url()))reqs.push(r.url());});
await p.goto(`http://localhost:${PORT}/imperium.html`,{timeout:300000});await p.waitForFunction(()=>document.getElementById('loading').hidden,null,{timeout:300000});
await p.waitForFunction(()=>!document.querySelector('#loading[data-gate]'),null,{timeout:120000}).catch(()=>{});
await p.evaluate(()=>{window.picMsg=()=>{};startScenario('wikinger');loadGame(S);try{closeModal();}catch(e){}});
const loaded=await p.waitForFunction(()=>MDL_ST.c_en===2,null,{timeout:120000}).then(()=>true).catch(()=>false);
ok('c_en wird geladen (Netz-Anfrage + Status 2)',loaded&&reqs.length>=1,reqs.length+' Anfrage(n), q='+Q);
await p.waitForTimeout(3000);
const r=await p.evaluate(async()=>{const e=ep(),out={ep:e,prov:{}};
  const one=id=>{const i=PI[id],c=CITY[i],P=S.prov[i];const g=c.dio&&c.dio.geometry;return{owner:P.owner,tier:c.tier,pre:enPre(i,e),dio:!!c.dio,en:!!(g&&g.userData.en),tipre:g&&g.userData.pre,n:g&&g.userData.n,tri:g&&Math.round(g.userData.tri)};};
  for(const id of['belgae_b','cantium','trinovanten','dumnonier','dobunner','icener','corieltauver','briganten','votadiner','silurer','kaledonier','parisier'])try{out.prov[id]=one(id);}catch(er){out.prov[id]='ERR '+er.message;}
  // Besitzwechsel an Nord -> dane
  const i=PI.belgae_b;const o0=S.prov[i].owner;S.prov[i].owner='nord';syncCities();await new Promise(z=>setTimeout(z,600));out.nord=one('belgae_b');out.nordRaid=raidKind('nord');
  S.prov[i].owner=o0;syncCities();await new Promise(z=>setTimeout(z,600));out.back=one('belgae_b');
  // Geometrie je Stufe/Art
  out.geo={};for(const pre of['angel','dane'])for(const n of[1,2,3]){const t=[];for(let v=0;v<4;v++){const g=enCityGeo(pre,n,v);t.push(g?Math.round(g.userData.tri):null);}out.geo[pre+n]=t;}
  out.pcc=typeof dioPre==='function'?dioPre(PI.parisier,cityStyle(PI.parisier,e),e):null;
  return out;});
console.log(JSON.stringify(r.prov));console.log('geo',JSON.stringify(r.geo));
const bg=r.prov.belgae_b;
ok('Belgen (Winchester): englisches Stadtbild angel, Dreiecke vorhanden',bg.dio&&bg.en&&bg.tipre==='angel'&&bg.tri>0,JSON.stringify(bg));
ok('Nach Besitzwechsel an Nord: dane',r.nord.en&&r.nord.tipre==='dane'&&r.nordRaid==='see',JSON.stringify(r.nord));
ok('Nach Rückgabe wieder angel',r.back.tipre==='angel',JSON.stringify(r.back));
ok('Nordschottland/Kaledonier/Silurer nicht englisch',!r.prov.kaledonier.en&&!r.prov.silurer.en&&r.prov.kaledonier.pre==null&&r.prov.silurer.pre==null);
ok('Parisier nutzt weiter altes Diorama (kein en_)',!String(r.pcc||'').startsWith('en_')&&!r.prov.parisier.en,String(r.pcc)+' '+JSON.stringify(r.prov.parisier));
const mx=Math.max(...Object.values(r.geo).flat().filter(x=>x));ok('Alle Stufen bauen, höchstens 8000 Dreiecke',Object.values(r.geo).flat().every(x=>x>0)&&mx<=8000,'max '+mx);
// Screenshot England
await p.evaluate(async()=>{const i=PI.belgae_b;try{focusProv(i,2.4);}catch(e){}document.querySelectorAll('#sheet,#cmd,.cmdpanel').forEach(e=>e.style.display='none');for(let k=0;k<40;k++){await new Promise(z=>setTimeout(z,150));if(typeof camTween!=='undefined'&&!camTween)break;}
  if(typeof camTween!=='undefined'&&camTween){CAM.tx=camTween.tx;CAM.tz=camTween.tz;CAM.d=camTween.d;camTween=null;}try{updateCamera();}catch(e){}needRender=3;});
await p.waitForTimeout(2500);await p.screenshot({path:__dirname+'/shot/w2_england.png',timeout:150000});
if(process.env.BIG){// alle drei Stufen sichtbar machen (Debug)
  await p.evaluate(async()=>{const c=CITY[PI.belgae_b];dioAttach(c,PI.belgae_b,4,1);needRender=3;});await p.waitForTimeout(2000);await p.screenshot({path:__dirname+'/shot/w2_england_burh.png'});}
ok('Keine Seiten-/Konsolenfehler',!errs.length,errs.slice(0,4).join(' | '));
console.log(`EN_STADT ${R.filter(Boolean).length}/${R.length}`);await b.close();})();
