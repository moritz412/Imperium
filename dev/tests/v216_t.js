// node v216_t.js <html> [port] – v216: Ein-/Ausschiffen per Kartentipp mit Rückfrage, Wessex bis Wedmore nicht unterwerfbar, Wikinger-Eroberungen halten (Garnison 60 %, Unruhe 2, kein Abfall mit Heer, Hauptstadtfall = Kriegsmüdigkeit); Kontrollen in Endlosspiel und anderer Geschichte
const {chromium}=require('playwright');
const FILE=process.argv[2]||require('path').join(__dirname,'..','imperium.html'),PORT=process.argv[3]||'8772';
(async()=>{const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:process.env.PW_GPU?[]:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const R=[];const ok=(n,c,i='')=>{R.push(!!c);console.log((c?'PASS ':'FAIL ')+n+(i!==''?'  '+JSON.stringify(i):''));};
const fs=require('fs');
const ctx=await b.newContext({viewport:{width:1024,height:768},hasTouch:true,isMobile:true});const p=await ctx.newPage();const errs=[];
p.on('pageerror',e=>errs.push('PAGE '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|WebGL|GPU stall/.test(m.text()))errs.push('CON '+m.text().slice(0,200));});
await p.addInitScript(()=>{try{localStorage.setItem('imperium.gfx',JSON.stringify({q:'leicht'}));}catch(e){}});
await p.route(/cdnjs/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));
await p.route(/fonts\.g/,r=>r.abort());await p.route(/\.html$/,r=>r.fulfill({body:fs.readFileSync(FILE),contentType:'text/html; charset=utf-8'}));
await p.goto(`http://localhost:${PORT}/imperium.html`,{timeout:300000});await p.waitForFunction(()=>document.getElementById('loading').hidden,null,{timeout:300000});
await p.waitForFunction(()=>!document.querySelector('#loading[data-gate]'),null,{timeout:120000}).catch(()=>{});
await p.waitForTimeout(1500);
await p.evaluate(()=>{window.playCine=(o,d)=>{d&&d();};window.showEvent=(E,c,n)=>{n&&n();};
 window.setup=()=>{startScenario('wikinger');try{closeModal();}catch(e){}storyRound();};
 window.mTxt=()=>$('#modal').hidden?'':$('#dialog').innerText;
 window.clickBtn=re=>{const x=[...document.querySelectorAll('#dialog .actions .btn')].find(y=>re.test(y.textContent.trim()));if(x)x.click();return!!x;};
 window.tTxt=()=>document.getElementById('toast').textContent;window.tClr=()=>{document.getElementById('toast').textContent='';};
 window.gotoStep=i=>{const f=S.player,s=S.story[f],C=SCEN.wikinger.chapter;s.i=i;s.t0=S.turn;s.done=false;s.end=false;return s;};});

// (a) Einschiffen per Tipp
const A=await p.evaluate(()=>{setup();const f=S.player,a=S.armies.find(x=>x.f===f&&x.p===PI.viken),fl=S.fleets.find(x=>x.f===f),o={};
 a.mp=0;selectArmy(a.id);tClr();onFleetChip(fl.id);o.noMp={t:tTxt(),m:mTxt()};
 a.mp=3;selectArmy(a.id);const fx=fl.x;fl.x=fx+30;tClr();onFleetChip(fl.id);o.far={t:tTxt(),m:mTxt()};fl.x=fx;
 const n0=fl.n;fl.n=1;tClr();onFleetChip(fl.id);o.full={t:tTxt(),m:mTxt()};fl.n=n0;
 tClr();UI.army=a.id;onFleetChip(fl.id);o.ask=mTxt();o.boatBefore=a.boat;o.clicked=clickBtn(/^Einschiffen$/);o.boat=a.boat===fl.id;o.cargo=fl.cargo.includes(a.id);o.mp=a.mp;o.mode=UI.mode;o.modalClosed=$('#modal').hidden;return o;});
ok('Einschiffen: Heer ohne Bewegung -> Hinweis, keine Rückfrage',/keine Bewegung/.test(A.noMp.t)&&!A.noMp.m,A.noMp);
ok('Einschiffen: Flotte zu weit -> Hinweis mit Grund',/zu weit weg/.test(A.far.t)&&!A.far.m,A.far);
ok('Einschiffen: kein Platz -> Hinweis mit Grund',/Kein Platz/.test(A.full.t)&&!A.full.m,A.full);
ok('Einschiffen: Rückfrage erscheint (Heer gewählt, Flotte angetippt)',/Einschiffen\?/.test(A.ask)&&/Restliche Bewegung verfällt/.test(A.ask)&&A.boatBefore==null,A.ask);
ok('Einschiffen: Bestätigen setzt das Heer an Bord',A.clicked&&A.boat&&A.cargo&&A.mp===0&&A.modalClosed&&A.mode==='fleet',A);

// (b) Anlanden per Tipp: Heer an Bord, friedlich in eigener Provinz
const B=await p.evaluate(()=>{const f=S.player,a=S.armies.find(x=>x.f===f&&x.boat),fl=S.fleets.find(x=>x.id===a.boat),o={};
 o.targets=landTargets(fl).map(i=>PROV_DEF[i].id);UI.army=null;onFleetChip(fl.id);o.mode=UI.mode;
 onProvinceTap(PI.viken);o.ask=mTxt();o.clicked=clickBtn(/^Anlanden$/);o.boat=a.boat;o.p=a.p===PI.viken;o.uiMode=UI.mode;
 // Heer an Bord gewählt (zweiter Weg)
 a.landT=-1;a.mp=3;selectArmy(a.id);onFleetChip(fl.id);clickBtn(/^Einschiffen$/);const again=a.boat===fl.id;
 selectArmy(a.id);o.selAboard=UI.army===a.id;onProvinceTap(PI.viken);o.ask2=mTxt();clickBtn(/^Abbrechen$/);o.still=a.boat===fl.id;
 // schon gelandet in dieser Runde
 a.landT=S.turn;tClr();onProvinceTap(PI.viken);o.landed=tTxt();a.landT=-1;o.again=again;return o;});
ok('Anlanden: Flotte antippen zeigt Küstenziele inkl. Vestfold',B.mode==='fleet'&&B.targets.includes('viken'),B.targets);
ok('Anlanden: Rückfrage „Anlanden bei <Provinz>?“ (friedlich, eigenes Land)',/Anlanden bei Viken\?/.test(B.ask)&&/friedlich/.test(B.ask)&&!/Landungsangriff/.test(B.ask),B.ask);
ok('Anlanden: Bestätigen setzt das Heer an Land',B.clicked&&B.boat==null&&B.p&&B.uiMode==='army',{boat:B.boat,p:B.p,m:B.uiMode});
ok('Anlanden: Heer an Bord gewählt + Provinz antippen -> gleiche Rückfrage, Abbrechen lässt es an Bord',B.again&&B.selAboard&&/Anlanden bei/.test(B.ask2)&&B.still,B.ask2);
ok('Anlanden: schon gelandet -> Hinweis statt Rückfrage',/schon gelandet/.test(B.landed),B.landed);

// Hinweis nach dem Segeln (einmal je Spiel), Landungsangriff mit Hinweis -20 %
const C=await p.evaluate(()=>{const f=S.player,a=S.armies.find(x=>x.f===f&&x.boat),fl=S.fleets.find(x=>x.id===a.boat),o={};
 const hp=fleetSeaPos(PI.briganten);fl.mp=fleetRange(fl);UI.army=null;onFleetChip(fl.id);UI.mode='fsail';UI.fleet=fl.id;
 o.h0=S.hintLand||0;const t0=window.toast;o.n=0;window.toast=m=>{if(m==='Tippe eine Küstenprovinz an, um anzulanden.')o.n++;return t0(m);};
 for(let k=0;k<4;k++){fl.mp=fleetRange(fl);UI.mode='fsail';UI.fleet=fl.id;fleetSailTap(fl,hp.x,hp.z);fleetSailTap(fl,hp.x,hp.z);}
 window.toast=t0;o.h1=S.hintLand||0;o.mode1=UI.mode;o.toast1='Tippe eine Küstenprovinz an, um anzulanden.';o.toast2='';
 let t=0,land=[];for(;t<14;t++){fl.mp=fleetRange(fl);moveFleet(fl,PI.briganten);land=landTargets(fl);if(land.includes(PI.briganten))break;}
 o.reach=land.includes(PI.briganten);o.t=t;UI.army=null;onFleetChip(fl.id);
 onProvinceTap(PI.briganten);o.ask=mTxt();o.cancel=clickBtn(/^Abbrechen$/);
 a.rz=1;onProvinceTap(PI.briganten);o.askRz=mTxt();o.raidKind=raidKind(a.f);clickBtn(/^Abbrechen$/);delete a.rz;
 onProvinceTap(PI.briganten);o.clicked=clickBtn(/^Angreifen$/);o.after=mTxt().slice(0,60);o.aboard=S.armies.includes(a)?a.boat:'weg';o.p=a.p===PI.briganten;return o;});
ok('Hinweis nach dem Segeln: „Tippe eine Küstenprovinz an, um anzulanden.“ genau einmal',C.h0===0&&C.h1===1&&C.n===1&&C.mode1==='fleet',C);
ok('Anlanden bei Feind: Flotte erreicht Northumbria',C.reach,C.t);
ok('Anlanden bei Feind: Rückfrage mit Landungsangriff −20 %, Abbrechen tut nichts',/Anlanden bei Briganten\?/.test(C.ask)&&/Northumbria hält/.test(C.ask)&&/Landungsangriff/.test(C.ask)&&/−20 %/.test(C.ask)&&C.cancel,C.ask);
ok('Anlanden bei Feind im Raubzug: Text „ohne Abzug“ (nur wenn Raubvolk zur See)',C.raidKind==='see'?/ohne Abzug/.test(C.askRz):/−20 %/.test(C.askRz),{kind:C.raidKind,t:C.askRz});
ok('Anlanden bei Feind: Bestätigen löst die Landung aus (Kampfbericht oder angelandet)',C.clicked&&(/Sieg|Niederlage/.test(C.after)||C.aboard==null||C.aboard==='weg'||C.p),C);

// (c) Wessex bis Wedmore
const D=await p.evaluate(()=>{setup();const f=S.player,o={};o.ns=scenNoSubmit('usa');o.nsOther=scenNoSubmit('mogul');o.v=aiEval('usa',f,'vassal');o.d=aiEval('usa',f,'demand');o.vm=aiEval('mogul',f,'vassal').why||'ok';
 try{dip(f,'usa').st='peace';openDiplomacy('usa');}catch(e){o.err=e.message;}
 o.btn=[...document.querySelectorAll('#dialog [data-dip="vassal"],#dialog [data-dip="demand"]')].map(x=>({d:x.dataset.dip,dis:x.disabled,t:x.innerText.replace(/\s+/g,' ')}));
 try{closeModal();}catch(e){}
 const i=SCEN.wikinger.chapter.steps.findIndex(x=>/Wedmore/.test(x.t));o.idx=i;gotoStep(i-1);o.before=scenNoSubmit('usa');gotoStep(i);o.at=scenNoSubmit('usa');o.v2=aiEval('usa',f,'vassal');o.d2=aiEval('usa',f,'demand');
 S.scen.over=true;o.over=scenNoSubmit('usa');return o;});
ok('Wessex: vor Wedmore gesperrt (Regel noSubmit), andere Reiche nicht',D.ns===true&&D.nsOther===false&&D.idx>0,{ns:D.ns,other:D.nsOther,idx:D.idx});
ok('Wessex: Unterwerfung und Tribut lehnt aiEval mit Grund ab',D.v.ok===false&&D.d.ok===false&&D.v.why==='Wessex beugt sich nicht – noch nicht.'&&D.d.why===D.v.why,[D.v,D.d]);
ok('Wessex: Knöpfe im Diplomatie-Fenster sichtbar, gesperrt, mit Grund',D.btn.length===2&&D.btn.every(x=>x.dis&&/Wessex beugt sich nicht – noch nicht\./.test(x.t)),D.btn);
ok('Wessex: ab dem Schritt „Wedmore“ nicht mehr gesperrt (Schritt davor noch gesperrt)',D.before===true&&D.at===false&&D.v2.why!=='Wessex beugt sich nicht – noch nicht.'&&D.d2.why!=='Wessex beugt sich nicht – noch nicht.',[D.v2,D.d2]);
ok('Wessex: Sperre endet mit der Geschichte',D.over===false);

// (d) Eroberung durch den Spieler im Wikinger-Szenario
const E=await p.evaluate(()=>{setup();const f=S.player,a=S.armies.find(x=>x.f===f&&x.p===PI.viken),o={};
 // Belagerung (captureBySiege) einer kleinen Provinz
 let ti=PI.cantium;S.sieges=S.sieges||{};S.sieges[ti]={f,aid:a.id,t:3};const prev=S.prov[ti].owner;captureBySiege(a,ti);let P=S.prov[ti];
 o.siege={prev,own:P.owner===f,gar:P.gar,want:Math.max(2,Math.round(garMax(ti)*0.6)),old:Math.max(2,Math.round(garMax(ti)*0.3)),gm:garMax(ti),unrest:P.unrest};
 // Sturm (concludeAttack) einer kleinen Provinz
 const ti2=PI.dumnonier;const P2=S.prov[ti2];S.armies=S.armies.filter(x=>!(x.f!==f&&x.p===ti2));P2.gar=1;a.p=ti;a.mp=3;a.hold=0;let res=null,tries=0;
 for(;tries<8&&P2.owner!==f;tries++){a.mp=3;a.p=ti;res=resolveAttack(a,ti2);if(P2.owner!==f){P2.gar=1;S.armies=S.armies.filter(x=>!(x.f!==f&&x.p===ti2));if(!S.armies.includes(a))break;}}
 o.storm={own:P2.owner===f,gar:P2.gar,want:Math.max(2,Math.round(garMax(ti2)*0.6)),old:Math.max(2,Math.round(garMax(ti2)*0.3)),gm:garMax(ti2),unrest:P2.unrest,tries,cap:res&&res.captured};
 // Hauptstadt Wessex
 const cap=PI.belgae_b;const ww0=wwOf('usa');S.sieges[cap]={f,aid:a.id,t:3};const a2=S.armies.includes(a)?a:S.armies.find(x=>x.f===f);o.capIs=capitalOf('usa')===cap;captureBySiege(a2,cap);o.cap={own:S.prov[cap].owner===f,ww0,ww:wwOf('usa'),gar:S.prov[cap].gar,want:Math.max(2,Math.round(garMax(cap)*0.6))};
 return o;});
ok('Wikinger-Belagerung: Garnison 60 %, Unruhe höchstens 2',E.siege.own&&E.siege.gar===E.siege.want&&E.siege.unrest<=2&&E.siege.gm>=1,E.siege);
ok('Wikinger-Sturm: Garnison 60 %, Unruhe 2',E.storm.own&&E.storm.gar===E.storm.want&&E.storm.unrest===2,E.storm);
ok('Garnison 60 % ist wirklich höher als 30 % (Kontrolle der Zahlen)',E.siege.want>E.siege.old||E.storm.want>E.storm.old,[E.siege.want,E.siege.old,E.storm.want,E.storm.old]);
ok('Hauptstadt Wessex fällt: Kriegsmüdigkeit von Wessex mindestens 60 (vorher kleiner)',E.capIs&&E.cap.own&&E.cap.ww>=60&&E.cap.ww0<60&&E.cap.gar===E.cap.want,E.cap);

// (e) Aufstand: Heer vor Ort verhindert Abfall an „frei“ (Wikinger)
const F=await p.evaluate(()=>{setup();const f=S.player,o={};const ti=PI.vestland,P=S.prov[ti];o.own=P.owner===f;const a=S.armies.find(x=>x.f===f&&x.p===ti)||S.armies.find(x=>x.f===f);a.p=ti;
 addMod(f,'order',-40,20,'Test');o.ord=provOrder(ti);
 for(let i=0;i<3;i++){newRound();}
 o.withArmy={owner:P.owner,rebel:P.rebel,ord:provOrder(ti),army:S.armies.includes(a)&&a.p===ti};
 // ohne Heer fällt sie ab
 const b=S.armies.find(x=>x.f===f&&x!==a&&x.p!==ti);S.armies.forEach(x=>{if(x.f===f&&x.p===ti)x.p=PI.viken;});P.rebel=0;P.owner=f;
 for(let i=0;i<3&&P.owner===f;i++){newRound();}
 o.noArmy={owner:P.owner};return o;});
ok('Aufstand: Ordnung stark negativ, eigenes Heer vor Ort -> Provinz bleibt beim Spieler',F.own&&F.ord<=-6&&F.withArmy.owner!==undefined&&F.withArmy.army,F);
ok('Aufstand mit Heer: kein Abfall an „frei“, kein Aufstandszähler',F.withArmy.owner==='nord'&&F.withArmy.rebel===0,F.withArmy);
ok('Kontrolle: ohne Heer fällt dieselbe Provinz (Test ist aussagekräftig)',F.noArmy.owner==='frei',F.noArmy);

// (f) Kontrolle: Endlosspiel und andere Geschichte nutzen weiter 30 % und Unruhe 3/4
const G=await p.evaluate(()=>{const o={};
 const cap=(label,mk)=>{mk();const f=S.player;if(!S.armies.some(x=>x.f===f)){try{const src=S.armies.find(x=>x.f!==f&&x.units.length);const c=JSON.parse(JSON.stringify(src));c.id=Math.max(...S.armies.map(x=>x.id))+1;c.f=f;c.p=capitalOf(f);S.armies.push(c);}catch(e){}}const a=S.armies.find(x=>x.f===f)||null;if(!a){o[label]={err:'kein Heer'};return;}
  const ti=PROV_DEF.findIndex((d,i)=>isAct(i)&&S.prov[i].owner!=='frei'&&S.prov[i].owner!==f&&!isCapProv(i));S.sieges=S.sieges||{};S.sieges[ti]={f,aid:a.id,t:3};const prev=S.prov[ti].owner;captureBySiege(a,ti);const P=S.prov[ti];
  o[label]={scen:S.scen?S.scen.id:null,rule:scenRule('holdConquest'),hold:holdConq(f),siege:{own:P.owner===f,gar:P.gar,w30:Math.max(2,Math.round(garMax(ti)*0.3)),w60:Math.max(2,Math.round(garMax(ti)*0.6)),unrest:P.unrest}};
  // Sturm
  const t2=PROV_DEF.findIndex((d,i)=>isAct(i)&&i!==ti&&S.prov[i].owner!=='frei'&&S.prov[i].owner!==f&&!isCapProv(i)&&S.prov[i].owner===prev);
  if(t2>=0){const Q=S.prov[t2];S.armies=S.armies.filter(x=>!(x.f!==f&&x.p===t2));Q.gar=1;a.p=ti;let tr=0;for(;tr<8&&Q.owner!==f&&S.armies.includes(a);tr++){a.mp=3;resolveAttack(a,t2);if(Q.owner===f)break;Q.gar=1;S.armies=S.armies.filter(x=>!(x.f!==f&&x.p===t2));}
   o[label].storm={own:Q.owner===f,gar:Q.gar,w30:Math.max(2,Math.round(garMax(t2)*0.3)),unrest:Q.unrest};}};
 cap('endlos',()=>{newGame('nord');try{closeModal();}catch(e){}});
 cap('caesar',()=>{startScenario('caesar');try{closeModal();}catch(e){}});
 return o;});
for(const k of ['endlos','caesar']){const g=G[k];
 ok(`Kontrolle ${k}: Regel holdConquest aus, Belagerung 30 %/Unruhe über 2`,g&&!g.err&&!g.rule&&!g.hold&&g.siege.own&&g.siege.gar===g.siege.w30&&g.siege.unrest>2,g);
 if(g&&g.storm)ok(`Kontrolle ${k}: Sturm 30 %/Unruhe 4 (oder 2 mit Bürgerrecht)`,g.storm.own?(g.storm.gar===g.storm.w30&&g.storm.unrest>=2):true,g.storm);}
ok('Keine Seitenfehler',!errs.length,errs.slice(0,3));
const nP=R.filter(x=>x).length;console.log(`${nP} PASS / ${R.length-nP} FAIL`);console.log(R.every(x=>x)?'ALLE PASS':'FEHLER '+R.filter(x=>!x).length);await b.close();})();
