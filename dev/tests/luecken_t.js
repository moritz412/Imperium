// node luecken_t.js <html> [port] – v206: Lückenbilder (pk_lk Völker-Gesandte je Epoche, pk_lb Gebäude/Artillerie/Waren/Märkte)
// Bilder: shot/lk_voelker.png (Hof › Völker im Mittelalter), shot/lk_waren.png (Wirtschaft › Waren)
const {chromium}=require('playwright');const fs=require('fs');
const FILE=process.argv[2],PORT=process.argv[3]||'8772',SH=__dirname+'/shot/';fs.mkdirSync(SH,{recursive:true});
(async()=>{const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:process.env.PW_GPU?[]:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const R=[];const ok=(n,c,i='')=>{R.push(!!c);console.log((c?'PASS ':'FAIL ')+n+(i?'  '+(typeof i==='string'?i:JSON.stringify(i)).slice(0,400):''));};
const ctx=await b.newContext({viewport:{width:1180,height:820},hasTouch:true,isMobile:true});const p=await ctx.newPage();const errs=[],bad=[];
p.on('pageerror',e=>errs.push('PAGE '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|WebGL|GPU stall/.test(m.text()))errs.push('CON '+m.text().slice(0,200));});
p.on('response',r=>{if(r.status()>=400&&/\/img\//.test(r.url()))bad.push(r.status()+' '+r.url());});
await p.addInitScript(()=>{try{localStorage.setItem('imperium.gfx',JSON.stringify({q:'leicht'}));}catch(e){}});
await p.route(/cdnjs/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));
await p.route(/fonts\.g/,r=>r.abort());await p.route(/\.html$/,r=>r.fulfill({body:fs.readFileSync(FILE),contentType:'text/html; charset=utf-8'}));
await p.goto(`http://localhost:${PORT}/imperium.html`,{timeout:300000});await p.waitForFunction(()=>document.getElementById('loading').hidden,null,{timeout:300000});
await p.waitForFunction(()=>!document.querySelector('#loading[data-gate]'),null,{timeout:120000}).catch(()=>{});
const w=ms=>p.waitForTimeout(ms);
// 0. Pakete
const pk=await p.evaluate(async()=>{const o={};for(const n of['pk_lk','pk_lb']){const r=await fetch('img/'+n+'.json');const buf=r.ok?await r.arrayBuffer():new ArrayBuffer(0);const d=r.ok?JSON.parse(new TextDecoder().decode(buf)):{};
  const reg=PKREG[n]||[];o[n]={st:r.status,n:Object.keys(d).length,reg:reg.length,same:Object.keys(d).sort().join()===[...reg].sort().join(),size:buf.byteLength,man:(OFF_MAN.find(x=>x[0]==='img/'+n+'.json')||[])[1],inOf:reg.every(k=>PKOF[k]===n)};}
  return o;});
ok('pk_lk: 200, 55 Bilder, Schlüssel = PKREG, alle in PKOF',pk.pk_lk.st===200&&pk.pk_lk.n===55&&pk.pk_lk.reg===55&&pk.pk_lk.same&&pk.pk_lk.inOf,pk.pk_lk);
ok('pk_lb: 200, 11 Bilder (v209: + b_burh_x1), Schlüssel = PKREG, alle in PKOF',pk.pk_lb.st===200&&pk.pk_lb.n===11&&pk.pk_lb.reg===11&&pk.pk_lb.same&&pk.pk_lb.inOf,pk.pk_lb);
ok('Größen = OFF_MAN (beide Pakete)',pk.pk_lk.size===pk.pk_lk.man&&pk.pk_lb.size===pk.pk_lb.man,[pk.pk_lk.size,pk.pk_lk.man,pk.pk_lb.size,pk.pk_lb.man]);
ok('OFF_VER ab v206',await p.evaluate(()=>+OFF_VER.slice(1)>=206));
// 1. IMGLIB / PKOF
const CUL=['aegyptisch','afrikanisch','arabisch','berber','britisch','chinesisch','germanisch','griechisch','habescha','iberisch','indigen','indisch','japanisch','kaukasisch','keltisch','koreanisch','latein','nordisch','persisch','punisch','semitisch','slawisch','steppe','suedostasiatisch','thrakisch'];
const X5=['habescha','indigen','japanisch','koreanisch','suedostasiatisch'];
const lib=await p.evaluate(([CUL,X5])=>{const miss=[];for(const c of CUL){const L=IMGLIB['vm_'+c]||[];for(const v of['m1','n1']){if(!L.includes(v)||!PKOF['vm_'+c+'_'+v])miss.push(c+'_'+v);}}
  for(const c of X5)if(!(IMGLIB['vm_'+c]||[]).includes('x1')||!PKOF['vm_'+c+'_x1'])miss.push(c+'_x1');
  const ids=['b_salpeterei_x1','b_pulvermuehle_x1','b_giesserei_x1','b_stelen_x1','b_boerse_x1','u_art_e0','u_art_e1','u_art_e2','ui_waren','ui_maerkte'];for(const i of ids)if(!PKOF[i])miss.push(i);
  return miss;},[CUL,X5]);
ok('Jede neue id in IMGLIB/PKOF (25×m1/n1, 5×x1, 5 Gebäude, 3 Artillerie, 2 UI)',!lib.length,lib);
// 2. Laden
await p.evaluate(async()=>{await pkLoad('pk_lk');await pkLoad('pk_lb');await pkLoad('pk_p2');});await w(500);
const ld=await p.evaluate(()=>[...PKREG.pk_lk,...PKREG.pk_lb].filter(k=>!PKU[k]));
ok('Beide Pakete geladen, alle 65 Bilder als Blob-URL',!ld.length,ld);
// 3. heroImg Epochenwahl
const hero=await p.evaluate(([CUL,X5])=>{newGame('rom');loadGame(S);try{closeModal();}catch(e){}const bad=[];
  for(const c of CUL){for(let sd=0;sd<4;sd++){for(const [e,v] of [[2,'m1'],[3,'n1'],[4,'n1']]){S.epoch=e;if(heroImg('vm_'+c,sd+c,false)!==PKU['vm_'+c+'_'+v])bad.push(c+' ep'+e+' erwartet '+v);}
    for(const e of[0,1]){S.epoch=e;const u=heroImg('vm_'+c,c+sd,false),x=PKU['vm_'+c+'_x1'];if(X5.includes(c)){if(u!==x)bad.push(c+' ep'+e+' erwartet x1');}else if(u!==x)bad.push(c+' ep'+e+' (Antike) x1 fehlt');}}}
  S.epoch=2;return bad;},[CUL,X5]);
ok('heroImg: Mittelalter → _m1, Neuzeit (Ep 3/4) → _n1, Antike → _x1 (25 Kulturen × 4 Seeds)',!hero.length,hero.slice(0,6));
// 4. Gebäude
const bl=await p.evaluate(()=>{const o={};S.epoch=3;for(const [k,n] of[['salpeterei','b_salpeterei_x1'],['pulvermuehle','b_pulvermuehle_x1'],['giesserei','b_giesserei_x1'],['stelen','b_stelen_x1'],['boerse','b_boerse_x1']]){const u=PIC.bld(k,3);o[k]=!!u&&u===PKU[n];}return o;});
ok('PIC.bld: Salpetersiederei, Pulvermühle, Geschützgießerei, Stelenfeld, Börse → neue Bilder',Object.values(bl).every(Boolean)&&Object.keys(bl).length===5,bl);
// 5. Artillerie
const ar=await p.evaluate(async()=>{const o={};const f=S.player;for(const e of[0,1,2,3]){const nm=(EPOCH_UNIT_NAMES[e]||{}).art||'';o[e]={nm,pre:PIC.unit(f,'art',e,nm,false).slice(0,15)};}await new Promise(r=>setTimeout(r,700));
  for(const e of[0,1,2,3]){const nm=(EPOCH_UNIT_NAMES[e]||{}).art||'';o[e].post=PIC.unit(f,'art',e,nm,false).slice(0,15);}return o;});
ok('PIC.unit Artillerie Ep 0–2: Bild statt gezeichnetem Platzhalter (webp), Namen Ep 1/2 vorhanden',[0,1,2].every(e=>/^data:image\/(webp|jpeg)/.test(ar[e].post))&&[1,2].every(e=>ar[e].nm),ar);
// 6. Wirtschaft
const eco=await p.evaluate(async()=>{S.epoch=2;S.fac[S.player].gold=2000;const o={};openEconomy('over');await new Promise(r=>setTimeout(r,400));
  const chips=[...document.querySelectorAll('.ejmp .fchip img')].map(i=>i.getAttribute('src')),ban=(document.querySelector('.eban')||{style:{}}).style.backgroundImage||'';
  o.chipW=chips[1]===PKU.ui_waren;o.banW=ban.includes(PKU.ui_waren);
  openEconomy('trade');await new Promise(r=>setTimeout(r,300));const ban2=(document.querySelector('.eban')||{style:{}}).style.backgroundImage||'',ch2=[...document.querySelectorAll('.ejmp .fchip img')].map(i=>i.getAttribute('src'));
  o.chipM=ch2[3]===PKU.ui_maerkte;o.banM=ban2.includes(PKU.ui_maerkte);openEconomy('trans');await new Promise(r=>setTimeout(r,300));o.banTok=!((document.querySelector('.eban')||{style:{}}).style.backgroundImage||'').includes(PKU.ui_maerkte);
  openEconomy('over');await new Promise(r=>setTimeout(r,300));return o;});
ok('Wirtschaft › Waren: Reiter-Bild und Banner = ui_waren',eco.chipW&&eco.banW,eco);
ok('Wirtschaft › Märkte und Wege: Reiter-Bild und Banner = ui_maerkte; Transport behält Verkehrsbild',eco.chipM&&eco.banM&&eco.banTok,eco);
const imgOk=await p.evaluate(async()=>{const urls=[...document.querySelectorAll('.ejmp .fchip img')].map(i=>i.src);const r=[];for(const u of urls){r.push(await new Promise(res=>{const I=new Image();I.onload=()=>res(I.naturalWidth>0);I.onerror=()=>res(false);I.src=u;}));}return r;});
ok('Reiter-Bilder der Wirtschaft laden alle',imgOk.length===4&&imgOk.every(Boolean),imgOk);
await p.waitForFunction(()=>document.getElementById('loading').hidden&&!document.querySelector('#loading[data-gate]'),null,{timeout:120000}).catch(()=>{});await p.evaluate(()=>{openEconomy('over');});await w(800);
await p.screenshot({path:SH+'lk_waren.png'});
// 7. Völker-Ansicht im Mittelalter
const vm=await p.evaluate(async()=>{newGame('rom');loadGame(S);try{closeModal();}catch(e){}S.epoch=2;const own=provsOf(S.player);own.forEach((pi,i)=>{S.prov[pi].cul=i%2?'germanisch':'habescha';});const on=vmOn();try{vmS();const A=S.vm;for(const c of['germanisch','habescha'])A[c]={z:50,t:S.turn,pol:'none',nw:S.turn+9,cd:0,d:[]};}catch(e){}return{on,n:S.vm?Object.keys(S.vm).length:0};});
await p.evaluate(()=>{try{closeModal();}catch(e){}openHof('pol');});await w(1200);
const vm2=await p.evaluate(()=>{const c=[...document.querySelectorAll('.vmpor')].map(e=>e.style.backgroundImage);return{n:c.length,m1:c.filter(u=>Object.keys(PKU).some(k=>/^vm_.*_m1$/.test(k)&&u.includes(PKU[k]))).length};});
console.log('Völker-Kacheln:',JSON.stringify(vm),JSON.stringify(vm2));
ok('Hof › Völker im Mittelalter: Kacheln zeigen _m1-Fassungen',vm2.n>0&&vm2.m1===vm2.n,vm2);
await p.waitForFunction(()=>document.getElementById('loading').hidden&&!document.querySelector('#loading[data-gate]'),null,{timeout:120000}).catch(()=>{});await p.evaluate(()=>{openHof('pol');});await w(800);await p.evaluate(()=>{const e=document.querySelector('.vmpor');if(e)e.scrollIntoView({block:'center'});});await w(500);
await p.screenshot({path:SH+'lk_voelker.png'});
ok('keine 404 bei img/',!bad.length,bad);
ok('keine Konsolenfehler',!errs.length,errs);
console.log(`${R.filter(Boolean).length}/${R.length}`);await b.close();process.exit(R.every(Boolean)?0:1);})();
