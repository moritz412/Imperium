// node kino_vk2_t.js <html> [port] – v215 (Wikinger-Kino II): Sequenz 5 „Der Weg der Waräger“ (Akt III), Sequenz 6 „Über das Nordmeer“ (Akt IV),
// Kapitelbilder, Schritt-Sprecher Landnahme/Wedmore, Pakete pk_vk2 / x_wikinger_kino2. Bild: shot/w6_kino5.png (laufende Sequenz 5)
const {chromium}=require('playwright');const fs=require('fs');
const FILE=process.argv[2],PORT=process.argv[3]||'8772',SH=__dirname+'/shot/';
(async()=>{const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:process.env.PW_GPU?[]:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const R=[];const ok=(n,c,i='')=>{R.push(!!c);console.log((c?'PASS ':'FAIL ')+n+(i?'  '+i:''));};
const ctx=await b.newContext({viewport:{width:1024,height:768},hasTouch:true,isMobile:true});const p=await ctx.newPage();const errs=[],bad=[],got=[];
p.on('pageerror',e=>errs.push('PAGE '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|WebGL|GPU stall/.test(m.text()))errs.push('CON '+m.text().slice(0,200));});
p.on('response',r=>{if(/pk_vk|x_wikinger_kino/.test(r.url())){got.push(r.status()+' '+r.url().split('/').pop());if(r.status()>=400)bad.push(r.status()+' '+r.url());}});
await p.addInitScript(()=>{try{localStorage.setItem('imperium.gfx',JSON.stringify({q:'leicht'}));}catch(e){}});
await p.route(/cdnjs/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));
await p.route(/fonts\.g/,r=>r.abort());await p.route(/\.html$/,r=>r.fulfill({body:fs.readFileSync(FILE),contentType:'text/html; charset=utf-8'}));
await p.goto(`http://localhost:${PORT}/imperium.html`,{timeout:300000});await p.waitForFunction(()=>document.getElementById('loading').hidden,null,{timeout:300000});
await p.waitForFunction(()=>!document.querySelector('#loading[data-gate]'),null,{timeout:120000}).catch(()=>{});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const waitCine=async t=>{try{await p.waitForFunction(x=>{const e=document.querySelector('.cine .ctit h1');return e&&e.textContent===x;},t,{timeout:15000});return true;}catch(e){return false;}};
const skip=async()=>{await p.evaluate(()=>{const s=document.querySelector('.cine [data-c="skip"]');if(s)s.click();});try{await p.waitForFunction(()=>!document.querySelector('.cine'),null,{timeout:5000});}catch(e){}};
const heroIs=(key)=>p.evaluate(k=>{const h=document.querySelector('#dialog .evhero');return!!(h&&PKU[k]&&h.style.backgroundImage.includes(PKU[k]));},key);

// 0. Pakete
const pk=await p.evaluate(async()=>{const a=await fetch('img/pk_vk2.json'),A=a.ok?await a.json():{},c=await fetch('audio/x_wikinger_kino2.json'),C=c.ok?await c.json():{};
  const sz={};for(const [f,n] of OFF_MAN.filter(x=>/pk_vk2|kino2/.test(x[0]))){sz[f]=(await (await fetch(f)).arrayBuffer()).byteLength===n;}
  const dims=await Promise.all(Object.values(A).map(u=>new Promise(r=>{const i=new Image();i.onload=()=>r(i.width+'x'+i.height);i.onerror=()=>r('err');i.src=u;})));
  return{ia:a.status,n:Object.keys(A).length,reg:(PKREG.pk_vk2||[]).length,of:PKOF['vk_kap_heimkehr_x1'],ca:c.status,ck:Object.keys(C).sort().join(','),xp:X_PACKS.has('wikinger_kino2'),sz,ver:OFF_VER,dims:[...new Set(dims)].join(),
    ok:Object.values(C).every(v=>v.startsWith('data:audio/mpeg;base64,'))};});
ok('Bildpaket pk_vk2: 200, 16 Bilder, 1024x585, in PKREG/PKOF',pk.ia===200&&pk.n===16&&pk.reg===16&&pk.of==='pk_vk2'&&pk.dims==='1024x585',JSON.stringify(pk));
ok('Sprecherpaket x_wikinger_kino2: 200, 4 Clips (data:audio/mpeg), X_PACKS',pk.ca===200&&pk.ck==='wikinger_kino5,wikinger_kino6,wikinger_landnahme,wikinger_wedmore'&&pk.xp&&pk.ok,pk.ck);
ok('OFF_MAN-Größen stimmen, OFF_VER ab v215',Object.keys(pk.sz).length===2&&Object.values(pk.sz).every(Boolean)&&+pk.ver.slice(1)>=215,JSON.stringify(pk.sz)+' '+pk.ver);

// keyPack: Schlüssel laden das Paket x_wikinger_kino2
await p.evaluate(()=>{NARR.cfg.rec=true;});got.length=0;
for(const k of ['wikinger_kino5','wikinger_landnahme','wikinger_wedmore'])await p.evaluate(k=>{NARR.speak([k],'Test');setTimeout(()=>NARR.stop(),50);},k);
await sleep(1500);
ok('keyPack: kino5/Landnahme/Wedmore holen x_wikinger_kino2.json (nicht x_wikinger_kino)',got.some(x=>/^200 x_wikinger_kino2\.json/.test(x))&&!got.some(x=>/x_wikinger_kino\.json/.test(x)),got.join(' '));

// 1. Partie, Akt III
await p.evaluate(()=>{startScenario('wikinger');try{storyRound();}catch(e){}loadGame(S);try{closeModal();}catch(e){}const me=S.player,s=stState(me);s.i=7;s.cine=1;s.q=[];S.scen.flags.vk_intro=1;S.scen.flags.vk_k2=1;S.scen.flags.vk_k3=1;window.__d=0;stMsg(me,{k:'step'});runEvents(()=>{window.__d=1;});});
const k5=await waitCine('Der Weg der Waräger');
await p.waitForFunction(()=>{const on=document.querySelector('.cine .ci.on');return PKU['vk_k4_fluss_x1']&&on&&on.style.backgroundImage.includes(PKU['vk_k4_fluss_x1']);},null,{timeout:6000}).catch(()=>{});
const k5s=await p.evaluate(()=>{const on=document.querySelector('.cine .ci.on');return{i:stState(S.player).i,flag:S.scen.flags.vk_k5,first:!!(PKU['vk_k4_fluss_x1']&&on&&on.style.backgroundImage.includes(PKU['vk_k4_fluss_x1'])),skip:!!document.querySelector('.cine [data-c="skip"]')};});
ok('Sequenz 5 „Der Weg der Waräger“ (W6: jetzt beim Schritt Miklagard), Merker, erstes Bild vk_k4_fluss, überspringbar',k5&&k5s.i===7&&k5s.flag===1&&k5s.first&&k5s.skip,JSON.stringify(k5s));
await p.evaluate(()=>{const g=document.querySelector('.cine .cplay');if(g)g.click();});await sleep(3000);
await p.screenshot({path:SH+'w6_kino5.png'});
await skip();await p.waitForSelector('#dialog .evhero',{timeout:10000}).catch(()=>{});
const h5=await p.evaluate(()=>(document.querySelector('#dialog h2')||{}).textContent);
ok('Kapitelbild Miklagard am Schritt Miklagard (W6, nach Sequenz 5)',/Miklagard/.test(h5||'')&&await heroIs('vk_kap_miklagard_x1'),h5);
await p.evaluate(()=>{try{closeModal();}catch(e){}});
const o5=await p.evaluate(()=>{const me=S.player,s=stState(me);s.i=7;stMsg(me,{k:'step'});return{c:stEvents(me).map(x=>!!x.E.cine),v:vkCine('k5')};});
ok('Sequenz 5 nur einmal',o5.c.every(x=>!x)&&o5.v===null,JSON.stringify(o5));

// 2. Akt IV
await p.evaluate(()=>{const me=S.player,s=stState(me);s.i=8;window.__d=0;stMsg(me,{k:'step'});runEvents(()=>{window.__d=1;});});
const k6=await waitCine('Über das Nordmeer');
const k6s=await p.evaluate(()=>{const on=document.querySelector('.cine .ci.on');return{i:stState(S.player).i,flag:S.scen.flags.vk_k6,first:!!(PKU['vk_k5_island_x1']&&on&&on.style.backgroundImage.includes(PKU['vk_k5_island_x1'])),last:VK_KINO.k6.ikeys.slice(-1)[0]};});
ok('Sequenz 6 „Über das Nordmeer“ (W6: jetzt beim Schritt Vinland), Merker, erstes Bild vk_k5_island, letztes vk_k5_saga',k6&&k6s.i===8&&k6s.flag===1&&k6s.first&&k6s.last==='vk_k5_saga',JSON.stringify(k6s));
await skip();await p.waitForSelector('#dialog .evhero',{timeout:10000}).catch(()=>{});
const h6=await p.evaluate(()=>(document.querySelector('#dialog h2')||{}).textContent);
ok('Kapitelbild Vinland am Schritt Vinland (W6: Island ist darin aufgegangen)',/Vinland/.test(h6||'')&&await heroIs('vk_kap_vinland_x1'),h6);
await p.evaluate(()=>{try{closeModal();}catch(e){}});
const o6=await p.evaluate(()=>{const me=S.player,s=stState(me);s.i=8;stMsg(me,{k:'step'});return{c:stEvents(me).map(x=>!!x.E.cine),v:vkCine('k6')};});
ok('Sequenz 6 nur einmal',o6.c.every(x=>!x)&&o6.v===null,JSON.stringify(o6));

// 3. Kapitelbilder und Schritt-Sprecher (Daten)
const d=await p.evaluate(()=>{const C=SCEN.wikinger.chapter,by=t=>C.steps.find(s=>s.t===t);
  return{img:Object.fromEntries(['Akt II · Normandie','Akt III · Miklagard','Akt IV · Vinland'].map(t=>[t,by(t).img])),end:C.end.img,
   vk:['Akt II · Landnahme','Akt II · Wedmore'].map(t=>stVk('wikinger',by(t),{i:0})[0]),k:['Akt II · Normandie'].map(t=>stVk('wikinger',by(t),{i:0})[0])};});
ok('Kapitelbilder gesetzt (Normandie/Miklagard/Vinland, Saga-Ende Heimkehr; Paris/Waräger/Island entfallen)',d.img['Akt II · Normandie']==='vk_kap_normandie'&&d.img['Akt III · Miklagard']==='vk_kap_miklagard'&&d.img['Akt IV · Vinland']==='vk_kap_vinland'&&d.end==='vk_kap_heimkehr',JSON.stringify(d));
ok('Schritt-Sprecher Landnahme gebunden, Wedmore (W6) am Ereignis, andere Schritte unverändert',d.vk[0]==='wikinger_landnahme'&&d.vk[1]==null&&/* W6: Wedmore-Sprecher hängt am Wahl-Ereignis */d.k[0]==='wikinger_k6',JSON.stringify(d.vk)+JSON.stringify(d.k));
// Landnahme-Schritt: Ereignis trägt den Sprecher-Schlüssel
const ln=await p.evaluate(()=>{const me=S.player,s=stState(me);s.i=4;stMsg(me,{k:'step'});const e=stEvents(me).find(x=>x.E.id==='st_step');return e?e.E.vk:null;});
ok('Ereignis Landnahme: vk = [wikinger_landnahme]',JSON.stringify(ln)==='["wikinger_landnahme"]',JSON.stringify(ln));
// Saga-Ende zeigt Heimkehr
const en=await p.evaluate(async()=>{await pkLoad('pk_vk2');const me=S.player,s=stState(me);s.done=false;stMsg(me,{k:'end'});const e=stEvents(me).find(x=>x.E.id==='st_end');return e?e.E.img:null;});
ok('Saga-Ende-Ereignis nimmt vk_kap_heimkehr',en==='vk_kap_heimkehr',String(en));

ok('Keine 404 für die neuen Pakete',bad.length===0,bad.join(' '));
ok('Keine Konsolenfehler',errs.length===0,errs.slice(0,4).join(' | '));
console.log(`${R.filter(Boolean).length}/${R.length} bestanden`);await b.close();process.exit(R.every(Boolean)?0:1);})();
