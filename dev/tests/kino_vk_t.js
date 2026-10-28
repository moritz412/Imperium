// node kino_vk_t.js <html> [port] – W4 (v205): Kinosequenzen der Geschichte Wikinger (Auftakt, Das Große Heer, Edington, Enden Taufe/Treue), Kapitelbilder, Taufe-Fenster.
// Bild: shot/w4_kino.png (laufende Sequenz 1, Untertitel sichtbar)
const {chromium}=require('playwright');const fs=require('fs');
const FILE=process.argv[2],PORT=process.argv[3]||'8772',SH=__dirname+'/shot/';
(async()=>{const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:process.env.PW_GPU?[]:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const R=[];const ok=(n,c,i='')=>{R.push(!!c);console.log((c?'PASS ':'FAIL ')+n+(i?'  '+i:''));};
const ctx=await b.newContext({viewport:{width:1024,height:768},hasTouch:true,isMobile:true});const p=await ctx.newPage();const errs=[],bad=[];
p.on('pageerror',e=>errs.push('PAGE '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|WebGL|GPU stall/.test(m.text()))errs.push('CON '+m.text().slice(0,200));});
p.on('response',r=>{if(r.status()>=400&&/pk_vk|x_wikinger_kino/.test(r.url()))bad.push(r.status()+' '+r.url());});
await p.addInitScript(()=>{try{localStorage.setItem('imperium.gfx',JSON.stringify({q:'leicht'}));}catch(e){}});
await p.route(/cdnjs/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));
await p.route(/fonts\.g/,r=>r.abort());await p.route(/\.html$/,r=>r.fulfill({body:fs.readFileSync(FILE),contentType:'text/html; charset=utf-8'}));
await p.goto(`http://localhost:${PORT}/imperium.html`,{timeout:300000});await p.waitForFunction(()=>document.getElementById('loading').hidden,null,{timeout:300000});
await p.waitForFunction(()=>!document.querySelector('#loading[data-gate]'),null,{timeout:120000}).catch(()=>{});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const cineTitle=()=>p.evaluate(()=>{const e=document.querySelector('.cine .ctit h1');return e?e.textContent:null;});
const waitCine=async t=>{try{await p.waitForFunction(x=>{const e=document.querySelector('.cine .ctit h1');return e&&e.textContent===x;},t,{timeout:15000});return true;}catch(e){return false;}};
const skip=async()=>{await p.evaluate(()=>{const s=document.querySelector('.cine [data-c="skip"]');if(s)s.click();});try{await p.waitForFunction(()=>!document.querySelector('.cine'),null,{timeout:5000});}catch(e){}};
const heroIs=(key)=>p.evaluate(k=>{const h=document.querySelector('#dialog .evhero');return!!(h&&PKU[k]&&h.style.backgroundImage.includes(PKU[k]));},key);

// 0. Pakete
const pk=await p.evaluate(async()=>{const a=await fetch('img/pk_vk.json'),A=a.ok?await a.json():{},c=await fetch('audio/x_wikinger_kino.json'),C=c.ok?await c.json():{};
  return{ia:a.status,n:Object.keys(A).length,ca:c.status,ck:Object.keys(C).sort().join(','),reg:(PKREG.pk_vk||[]).length,of:PKOF['vk_k1_fjord_x1'],lib:(IMGLIB['vk_k1_fjord']||[]).join(),
    off:OFF_MAN.filter(x=>/vk|kino/.test(x[0])).map(x=>x[0]+':'+x[1]).join(' '),ver:OFF_VER,xp:X_PACKS.has('wikinger_kino')};});
ok('Bildpaket pk_vk: 200, 23 Bilder, in PKREG/PKOF/IMGLIB',pk.ia===200&&pk.n===23&&pk.reg===23&&pk.of==='pk_vk'&&pk.lib==='x1',JSON.stringify(pk));
ok('Sprecherpaket: 200, 5 Clips, X_PACKS',pk.ca===200&&pk.ck==='wikinger_kino1,wikinger_kino2,wikinger_kino3,wikinger_kino4a,wikinger_kino4b'&&pk.xp,pk.ck);
ok('OFF_MAN enthält beide Pakete, OFF_VER v205',/pk_vk\.json:\d+/.test(pk.off)&&/x_wikinger_kino\.json:\d+/.test(pk.off)&&pk.ver==='v205',pk.off+' '+pk.ver);
const sz=await p.evaluate(async()=>{const o={};for(const [f,n] of OFF_MAN.filter(x=>/vk|kino/.test(x[0]))){const r=await fetch(f);o[f]=(await r.arrayBuffer()).byteLength===n;}return o;});
ok('Größen in OFF_MAN stimmen mit den Dateien',Object.values(sz).every(Boolean)&&Object.keys(sz).length===2,JSON.stringify(sz));

// 1. Start der Geschichte: Sequenz 1
await p.evaluate(()=>{startScenario('wikinger');try{storyRound();}catch(e){}loadGame(S);try{closeModal();}catch(e){}window.__d=0;setTimeout(()=>runEvents(()=>{window.__d=1;}),300);});
ok('Sequenz 1 „Segel im Morgennebel“ startet mit der Geschichte',await waitCine('Segel im Morgennebel'),String(await cineTitle()));
const c1=await p.evaluate(()=>{const on=document.querySelector('.cine .ci.on');return{flag:S.scen.flags.vk_intro,first:!!(PKU['vk_k1_fjord_x1']&&on&&on.style.backgroundImage.includes(PKU['vk_k1_fjord_x1'])),skip:!!document.querySelector('.cine [data-c="skip"]'),dots:document.querySelectorAll('.cdots i').length};});
ok('Sequenz 1: erstes Bild vk_k1_fjord, Merker gesetzt, überspringbar',c1.flag===1&&c1.first&&c1.skip,JSON.stringify(c1));
await p.evaluate(()=>{const g=document.querySelector('.cine .cplay');if(g)g.click();});await sleep(2500);
await p.screenshot({path:SH+'w4_kino.png'});
await skip();
await p.waitForFunction(()=>window.__d===1||document.querySelector('#dialog .evhero'),null,{timeout:15000}).catch(()=>{});
const m1=await p.evaluate(()=>({t:(document.querySelector('#dialog h2')||{}).textContent,sc:S.scen.id}));
ok('Nach Sequenz 1 folgt das Kapitelfenster (Akt I · Lindisfarne)',/Lindisfarne|Wikinger/.test(m1.t||''),m1.t);
const again=await p.evaluate(()=>({v:vkCine('intro'),q:(()=>{const me=S.player,s=stState(me);s.cine=0;stMsg(me,{k:'intro'});return stEvents(me).map(x=>x.E.cine?x.E.cine.title:null);})()}));
ok('Sequenz 1 nur einmal (Merker)',again.v===null&&again.q.every(x=>x!=='Segel im Morgennebel'),JSON.stringify(again));
await p.evaluate(()=>{try{closeModal();}catch(e){}});

// 2. Das große Heer: Schritt 3 beginnt (Ruhm-Ziel erfüllt)
await p.evaluate(()=>{const me=S.player,s=stState(me),C=stCh(me);s.i=2;s.g=stResolve(me,C.steps[2].g);S.scen.ruhm=999;S.scen.flags.ruhm=999;window.__d=0;runEvents(()=>{window.__d=1;});});
const k2=await waitCine('Das Große Heer');
const k2s=await p.evaluate(()=>({i:stState(S.player).i,flag:S.scen.flags.vk_k2,first:!!(PKU['vk_k2_flotte_x1']&&document.querySelector('.cine .ci.on').style.backgroundImage.includes(PKU['vk_k2_flotte_x1']))}));
ok('Sequenz 2 „Das Große Heer“ beim Schritt Akt II · Das große Heer',k2&&k2s.i===3&&k2s.flag===1&&k2s.first,JSON.stringify(k2s));
await skip();await p.waitForSelector('#dialog .evhero',{timeout:10000}).catch(()=>{});
const h2=await p.evaluate(()=>(document.querySelector('#dialog h2')||{}).textContent);
ok('Kapitelbild Jorvik am Schritt „Das große Heer“',/große Heer/.test(h2||'')&&await heroIs('vk_kap_jorvik_x1'),h2);
await p.evaluate(()=>{try{closeModal();}catch(e){}});
const v2=await p.evaluate(()=>{const me=S.player,s=stState(me);s.i=3;stMsg(me,{k:'step'});return stEvents(me).map(x=>!!x.E.cine);});
ok('Sequenz 2 nur einmal',v2.every(x=>!x),JSON.stringify(v2));

// 3. Edington vor der Wahl in Wedmore
await p.evaluate(()=>{const me=S.player,s=stState(me),C=stCh(me),pi=PI.briganten;S.prov[pi].owner=me;S.prov[pi].cul='britisch';S.prov[pi].ln=2;S.prov[pi].lnF=me;S.prov[pi].lnT=S.turn-8;s.i=4;s.g=stResolve(me,C.steps[4].g);window.__d=0;runEvents(()=>{window.__d=1;});});
const k3=await waitCine('Edington');
const k3s=await p.evaluate(()=>({i:stState(S.player).i,flag:S.scen.flags.vk_k3,imgs:[...document.querySelectorAll('.cine .ci')].length,sieg:Object.values(VK_KINO.k3.ikeys).includes('vk_k3_sieg')}));
ok('Sequenz 3 „Edington“ beim Schritt Wedmore, vor der Wahl, ohne Siegbild',k3&&k3s.i===5&&k3s.flag===1&&!k3s.sieg,JSON.stringify(k3s));
await skip();await p.waitForSelector('#dialog .evopt',{timeout:10000}).catch(()=>{});
const w=await p.evaluate(()=>({t:(document.querySelector('#dialog h2')||{}).textContent,n:document.querySelectorAll('#dialog .evopt').length,bapt:!!S.fac[S.player].bapt}));
ok('Wedmore-Wahl nach der Sequenz, Kapitelbild Burhbau, noch nicht entschieden',/Wedmore/.test(w.t||'')&&w.n===2&&!w.bapt&&await heroIs('vk_kap_burhbau_x1'),JSON.stringify(w));

// 4. Ende A: Taufe
await p.evaluate(()=>document.querySelector('#dialog .evopt').click());
const eA=await waitCine('Die Taufe');
const eAs=await p.evaluate(()=>({flag:S.scen.flags.vk_e1,e2:S.scen.flags.vk_e2,bapt:S.fac[S.player].bapt&&S.fac[S.player].bapt.c,first:!!(PKU['vk_e1_taufe_x1']&&document.querySelector('.cine .ci.on').style.backgroundImage.includes(PKU['vk_e1_taufe_x1']))}));
ok('Ende A „Die Taufe“ nach der Wahl Taufe (Bild vk_e1_taufe)',eA&&eAs.flag===1&&!eAs.e2&&eAs.bapt==='tauf'&&eAs.first,JSON.stringify(eAs));
await skip();await sleep(200);
const eA2=await p.evaluate(()=>{const r=vkCine('e1');scenChoice('wedmore_tauf');return{r,cine:!!document.querySelector('.cine')};});await sleep(400);
ok('Ende A nur einmal',eA2.r===null&&!await p.evaluate(()=>!!document.querySelector('.cine')));
await p.evaluate(()=>{try{closeModal();}catch(e){}});

// 5. Ende B: Treue (frische Partie)
await p.evaluate(()=>{startScenario('wikinger');loadGame(S);try{closeModal();}catch(e){}scenChoice('wedmore_treue');});
const eB=await waitCine('Treue zu den alten Göttern');
const eBs=await p.evaluate(()=>({flag:S.scen.flags.vk_e2,e1:S.scen.flags.vk_e1,bapt:S.fac[S.player].bapt&&S.fac[S.player].bapt.c,first:!!(PKU['vk_e2_opfer_x1']&&document.querySelector('.cine .ci.on').style.backgroundImage.includes(PKU['vk_e2_opfer_x1']))}));
ok('Ende B „Treue zu den alten Göttern“ nach der Wahl Treue (Bild vk_e2_opfer)',eB&&eBs.flag===1&&!eBs.e1&&eBs.bapt==='treue'&&eBs.first,JSON.stringify(eBs));
await skip();

// 6. Taufe-Fenster (Glaubenswechsel) mit eigenem Bild
await p.evaluate(()=>{try{closeModal();}catch(e){}});
const tf=await p.evaluate(async()=>{await pkLoad('pk_vk');const ev=lnEvTauf();showEvent(ev.E,ev.ctx,()=>{});return ev.E.img;});
await sleep(300);
ok('Taufe-Fenster nutzt vk_e1_taufe',tf==='vk_e1_taufe'&&await heroIs('vk_e1_taufe_x1'),tf);
await p.screenshot({path:SH+'w4_taufe.png'});

ok('Keine 404 für die neuen Pakete',bad.length===0,bad.join(' '));
ok('Keine Konsolenfehler',errs.length===0,errs.slice(0,4).join(' | '));
console.log(`${R.filter(Boolean).length}/${R.length} bestanden`);await b.close();process.exit(R.every(Boolean)?0:1);})();
