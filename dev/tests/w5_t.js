// node w5_t.js <html> [port] – W5 (v217): Wikinger Phase A „Raubzeit“ (Raubsperre mit Grund) und Phase B „Das Große Heer“ (Ivar und Halfdan, Pferde, Thronstreit, Marionettenkönig) plus Winterlager; Kontrollen Endlosspiel und andere Geschichte
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
await p.evaluate(()=>{window.playCine=(o,d)=>{d&&d();};
 window.setup=()=>{startScenario('wikinger');try{closeModal();}catch(e){}storyRound();S.q=[];const s=S.story[S.player];if(s)s.q=[];};
 window.mTxt=()=>$('#modal').hidden?'':$('#dialog').innerText;
 window.clickBtn=re=>{const x=[...document.querySelectorAll('#dialog .actions .btn, #dialog .rcard')].find(y=>re.test(y.textContent.trim())&&!y.disabled);if(x)x.click();return!!x;};
 window.hasBtn=re=>{const x=[...document.querySelectorAll('#dialog .actions .btn, #dialog .rcard')].find(y=>re.test(y.textContent.trim()));return x?{dis:!!x.disabled}:null;};
 window.tTxt=()=>document.getElementById('toast').textContent;window.tClr=()=>{document.getElementById('toast').textContent='';};
 window.gotoStep=i=>{const f=S.player,s=S.story[f];s.i=i;s.t0=S.turn;s.done=false;s.end=false;return s;};
 // ein Spielerheer neben eine Zielprovinz stellen (Landweg)
 window.putNear=(a,ti)=>{const n=[...ADJ[ti]].find(j=>!isSeaLink(j,ti)&&isAct(j));a.p=n;a.mp=3;a.st=null;a.rz=false;a.goal=null;a.pos=null;a.boat=null;return n;};
 window.closeAll=()=>{try{closeModal();}catch(e){}};});

// ---- (a) Phase A: Marsch gesperrt, mit Grund ----
const A=await p.evaluate(()=>{setup();const f=S.player,a=S.armies.find(x=>x.f===f&&x.p===PI.viken),o={};
 o.step=scenStepI();o.rules=!!scenRuleV('raubzeit');
 const tgt={Bernicia:PI.votadiner,Mercia:PI.corieltauver,EastAnglia:PI.icener,Kent:PI.cantium,Hwicce:PI.dobunner};
 o.lock={};for(const k in tgt){o.lock[k]=wikRaidLock(a,tgt[k]);}
 // Marsch an Northumbria (Krieg) und an Mercia (Frieden)
 const own={};
 for(const [k,ti] of [['briten',PI.votadiner],['mogul',PI.dobunner],['usa',PI.cantium]]){
   closeAll();putNear(a,ti);const p0=a.p,w0=atWar(f,S.prov[ti].owner),ow=S.prov[ti].owner;orderMove(a,ti);
   own[k]={txt:mTxt(),raub:hasBtn(/Raubzug einschalten und angreifen/),abbr:hasBtn(/^Abbrechen/),stay:a.p===p0&&S.prov[ti].owner===ow,war:atWar(f,ow),war0:w0};closeAll();}
 o.march=own;
 // Abbrechen schließt ohne Folgen
 closeAll();const ti=PI.votadiner;putNear(a,ti);const p1=a.p;orderMove(a,ti);o.cancel=clickBtn(/^Abbrechen/);o.cancelStay=a.p===p1&&$('#modal').hidden&&!a.rz;
 // Andere Ziele nicht gesperrt: Franken, freie Provinz
 o.free={franken:wikRaidLock(a,PI.parisier),laigin:wikRaidLock(a,PI.laigin),kaleter:wikRaidLock(a,PI.kaleter)};
 return o;});
ok('Phase A: Regel raubzeit aktiv, Schritt 0',A.step===0&&A.rules,A.step);
ok('Phase A: Sperre nennt den Grund für alle vier Reiche',Object.values(A.lock).every(t=>/^Ihr seid ein Raubzug, kein Heer\. Erobern könnt ihr erst, wenn das Thing das Große Heer beschließt\.$/.test(t||'')),A.lock);
for(const k of ['briten','mogul','usa'])ok(`Marsch auf ${k}: Rückfrage statt Angriff, Knöpfe „Raubzug einschalten und angreifen“ + „Abbrechen“, Heer bleibt`,/Ihr seid ein Raubzug, kein Heer/.test(A.march[k].txt)&&A.march[k].raub&&A.march[k].raub.dis===false&&A.march[k].abbr&&A.march[k].stay,A.march[k]);
ok('Marsch auf Mercia (Frieden): keine Kriegserklärung durch die Sperre',A.march.mogul.war===A.march.mogul.war0&&!A.march.mogul.war,A.march.mogul);
ok('Abbrechen: Fenster zu, Heer bleibt, kein Raubzug',A.cancel&&A.cancelStay);
ok('Franken, Irland/freie Provinzen nicht gesperrt',A.free.franken==null&&A.free.laigin==null&&A.free.kaleter==null,A.free);

// ---- (b) Phase A: Raubzug einschalten und angreifen (Marsch), Plündern bleibt möglich ----
const B=await p.evaluate(()=>{setup();const f=S.player,a=S.armies.find(x=>x.f===f&&x.p===PI.viken),o={};
 const ti=PI.votadiner;closeAll();putNear(a,ti);orderMove(a,ti);o.ask=mTxt().slice(0,60);o.canRaub=canRaub(a).ok;o.click=clickBtn(/Raubzug einschalten und angreifen/);
 o.rz=!!a.rz;o.modal=mTxt().slice(0,80);o.lockNow=wikRaidLock(a,ti);o.lockSiege=wikRaidLock(a,ti,true);o.canSiege=canSiege(a,ti);
 o.note=/Belagern geht nicht/.test(mTxt());
 closeAll();
 // Berechnen: Plünderung
 const b0=S.scen.flags.beute||0,r0=S.scen.ruhm||0;S.prov[ti].gar=1;S.armies=S.armies.filter(x=>!(x.f!==f&&x.p===ti));let res=null;a.mp=3;res=resolveAttack(a,ti);
 o.res={win:res.win,captured:res.captured,raided:res.raided,loot:res.loot,owner:S.prov[ti].owner};o.beute=(S.scen.flags.beute||0)-b0;o.ruhm=(S.scen.ruhm||0)-r0;
 return o;});
ok('Raubzug-Knopf: schaltet den Raubzug ein und öffnet danach den normalen Angriff',B.canRaub&&B.click&&B.rz&&/Angriff auf/.test(B.modal),[B.ask,B.modal]);
ok('Mit Raubzug keine Sperre mehr beim Angriff, aber Belagern bleibt gesperrt (mit Grund im Fenster)',B.lockNow==null&&/Raubzug, kein Heer/.test(B.lockSiege||'')&&B.canSiege.ok===false&&/Raubzug/.test(B.canSiege.why)&&B.note,[B.lockNow,B.canSiege,B.note]);
ok('Raubzug-Angriff: Sieg plündert, besetzt nicht; Beute und Ruhm wachsen (Akt-I-Ziele erreichbar)',B.res.win&&!B.res.captured&&B.res.raided&&B.res.owner==='briten'&&B.beute>0&&B.ruhm>0,[B.res,B.beute,B.ruhm]);

// ---- (c) Phase A: Landung vom Schiff ----
const C=await p.evaluate(()=>{setup();const f=S.player,a=S.armies.find(x=>x.f===f&&x.p===PI.viken),fl=S.fleets.find(x=>x.f===f),o={};
 const ti=PI.votadiner,h=fleetSeaPos(ti);fl.x=h.x;fl.z=h.z;fleetInit(fl);a.boat=fl.id;a.embP=PI.viken;fl.cargo=[a.id];a.rz=false;a.mp=3;
 o.target=landTargets(fl).includes(ti);o.err=disembark(a,fl,ti);
 closeAll();UI.army=a.id;UI.mode='army';onProvinceTap(ti);o.txt=mTxt();o.raub=hasBtn(/Raubzug einschalten und angreifen/);o.stillBoat=a.boat===fl.id;
 o.click=clickBtn(/Raubzug einschalten und angreifen/);o.rz=!!a.rz;
 // danach läuft die Landung (Angriff aus dem Raubzug) – nie erobert
 o.afterModal=mTxt().slice(0,60);o.owner=S.prov[ti].owner;o.landed=a.boat==null;
 closeAll();
 // Landung in einer freien Provinz (Irland) und vor Frankenland nicht gesperrt
 o.lockFr=wikRaidLock(a,PI.parisier,false,true);o.lockIr=wikRaidLock(a,PI.laigin,false,true);
 return o;});
ok('Landung (Karten-Tipp) an Northumbria: Rückfrage mit Grund, Heer bleibt an Bord',C.target&&/Ihr seid ein Raubzug, kein Heer/.test(C.txt)&&C.raub&&C.stillBoat&&/Raubzug, kein Heer/.test((C.err||{}).err||''),[C.txt.slice(0,80),C.err]);
ok('Landung: „Raubzug einschalten und angreifen“ schaltet ein und landet als Raubzug, Provinz bleibt englisch',C.click&&C.rz&&C.owner==='briten',[C.afterModal,C.owner,C.landed]);
ok('Landung bei Franken/Irland nicht gesperrt',C.lockFr==null&&C.lockIr==null,[C.lockFr,C.lockIr]);

// ---- (d) Phase B: Hook Schritt 3 ----
const D=await p.evaluate(()=>{setup();const f=S.player,o={};const bri=S.armies.filter(a=>a.f==='briten');o.before=bri.map(a=>a.units.map(u=>u.men));
 const n0=S.armies.filter(a=>a.f===f).length,fl0=(S.fleets||[]).length;gotoStep(3);SCEN.wikinger.hooks[3](f);
 const a=S.armies.find(x=>x.f===f&&x.name==='Ivar und Halfdan');o.army=a?{n:a.units.length,husk:a.units.filter(u=>u.v==='husk').length,rolesN:a.units.map(u=>u.r+(u.v?':'+u.v:'')).join(','),boat:a.boat,gen:a.gen&&a.gen.n}:null;
 o.armies=S.armies.filter(x=>x.f===f&&x.name==='Ivar und Halfdan').length;const fl=a&&S.fleets.find(x=>x.id===a.boat);o.fleet=fl?{n:fl.n,cargo:fl.cargo.includes(a.id),f:fl.f,front:landTargets(fl).includes(PI.icener),cnt:S.fleets.length-fl0,cap:fl.n*SHIP_CAP}:null;
 o.after=bri.map(a=>a.units.map(u=>u.men));o.log=S.log.slice(-8).map(e=>e.t);
 const evs=stEvents(f).map(x=>x.E.id);o.evs=evs;return o;});
ok('Hook Schritt 3: zweites Heer „Ivar und Halfdan“ mit 8 Einheiten nordischer Art',D.army&&D.army.n===8&&D.army.husk>=2&&D.armies===1,D.army);
ok('Hook Schritt 3: eigene Flotte (3 Schiffe, Platz für 12), Heer an Bord, Flotte vor der Küste East Anglias',D.fleet&&D.fleet.cargo&&D.fleet.n===3&&D.fleet.cap>=8&&D.fleet.front&&D.fleet.cnt===1,D.fleet);
ok('Thronstreit: alle Northumbria-Heere verlieren 50 % der Männer (mind. 1 je Einheit)',D.before.length>0&&D.before.every((u,i)=>u.every((m,j)=>D.after[i][j]===Math.max(1,Math.round(m*0.5)))),[D.before,D.after]);
ok('Thronstreit: Meldung im Protokoll',D.log.some(t=>/Zwei Könige in Eoforwic/.test(t)),D.log.filter(t=>/Eoforwic/.test(t)));
ok('Ereignisse Schritt 3 stehen bereit: Ivar, Pferde, Thronstreit',['wik_ivar','wik_pferde','wik_thron'].every(x=>D.evs.includes(x)),D.evs);

// ---- (e) Pferde: Wahl A über das echte Ereignisfenster ----
const E1=await p.evaluate(()=>{setup();const f=S.player;gotoStep(3);SCEN.wikinger.hooks[3](f);closeAll();const a=S.armies.find(x=>x.f===f&&x.name==='Ivar und Halfdan');const o={};
 const n0=a.units.length,cav0=a.units.filter(u=>u.r==='cav').length;const E=wikEv('pferde').E;showEvent(E,{},()=>{});o.txt=mTxt();o.opts=[...document.querySelectorAll('.evopt')].map(x=>x.querySelector('b').textContent);
 document.querySelectorAll('.evopt')[0].click();
 const d=dip(f,'vijaya');o.res={n:a.units.length-n0,cav:a.units.filter(u=>u.r==='cav').length-cav0,truce:d.truce,war:atWar(f,'vijaya'),acc:hasAcc(f,'vijaya'),pass:passOk(f,PI.icener),accT:d.acc-S.turn};
 // freier Durchzug: Marsch ohne Rückfrage, keine Sperre
 const a2=S.armies.find(x=>x.f===f&&x.p===PI.viken);if(a2){putNear(a2,PI.icener);closeAll();orderMove(a2,PI.icener);o.march={p:a2.p===PI.icener,modal:mTxt().slice(0,40)};}
 return o;});
ok('Pferde-Fenster: zwei Wahlen „Pferde und Winterquartier annehmen“ / „Ablehnen und plündern“',/East Anglia bietet Pferde/.test(E1.txt)&&E1.opts.length===2&&/Pferde und Winterquartier annehmen/.test(E1.opts[0])&&/Ablehnen und plündern/.test(E1.opts[1]),E1.opts);
ok('Wahl A: +2 Reiter, 10 Runden Waffenstillstand, Frieden, freier Durchzug',E1.res.n===2&&E1.res.cav===2&&E1.res.truce>=10&&!E1.res.war&&E1.res.acc&&E1.res.pass&&E1.res.accT>=10,E1.res);
ok('Wahl A: Marsch durch East Anglia ohne Sperre und ohne Rückfrage',E1.march&&E1.march.p&&E1.march.modal==='',E1.march);
const E2=await p.evaluate(()=>{setup();const f=S.player;gotoStep(3);SCEN.wikinger.hooks[3](f);closeAll();const a=S.armies.find(x=>x.f===f&&x.name==='Ivar und Halfdan'),o={};
 const g0=S.fac[f].gold,n0=a.units.length,b0=S.scen.flags.beute||0;const E=wikEv('pferde').E;showEvent(E,{},()=>{});document.querySelectorAll('.evopt')[1].click();
 o.res={gold:S.fac[f].gold-g0,n:a.units.length-n0,war:atWar(f,'vijaya'),acc:hasAcc(f,'vijaya'),beute:(S.scen.flags.beute||0)-b0};
 // Krieg: kein freier Durchzug, Angriff auf East Anglia ist jetzt ab Schritt 3 erlaubt (keine Sperre)
 const a2=S.armies.find(x=>x.f===f&&x.p===PI.viken);putNear(a2,PI.icener);o.lock=wikRaidLock(a2,PI.icener);closeAll();orderMove(a2,PI.icener);o.modal=mTxt().slice(0,30);closeAll();return o;});
ok('Wahl B: Krieg mit East Anglia, Gold sofort, keine Reiter, kein Durchzug',E2.res.gold>0&&E2.res.n===0&&E2.res.war&&!E2.res.acc&&E2.res.beute===E2.res.gold,E2.res);
ok('Wahl B: Angriff auf East Anglia danach nicht gesperrt (normaler Angriffsdialog)',E2.lock==null&&/Angriff auf/.test(E2.modal),[E2.lock,E2.modal]);

// ---- (f) Sperre ab Schritt 3 weg, außer Wessex bis Wedmore ----
const F=await p.evaluate(()=>{setup();const f=S.player,a=S.armies.find(x=>x.f===f&&x.p===PI.viken),o={};o.lock={};
 for(const st of [2,3,4,5,6]){gotoStep(st);o.lock[st]={briten:wikRaidLock(a,PI.votadiner),mogul:wikRaidLock(a,PI.dobunner),vijaya:wikRaidLock(a,PI.icener),usa:wikRaidLock(a,PI.cantium)};}
 gotoStep(3);closeAll();putNear(a,PI.cantium);orderMove(a,PI.cantium);o.wessexModal=mTxt();o.wessexBtn=hasBtn(/Raubzug einschalten und angreifen/);closeAll();
 putNear(a,PI.votadiner);orderMove(a,PI.votadiner);o.nordModal=mTxt().slice(0,30);closeAll();
 gotoStep(4);a.rz=true;o.rzWessex=wikRaidLock(a,PI.cantium);a.rz=false;
 const ws=SCEN.wikinger.chapter.steps.findIndex(x=>/Wedmore/.test(x.t));o.ws=ws;
 return o;});
ok('Schritt 2: England gesperrt (Raubtext), ab Schritt 3 frei für Northumbria/Mercia/East Anglia',F.lock[2].briten&&F.lock[2].mogul&&F.lock[2].vijaya&&F.lock[3].briten==null&&F.lock[3].mogul==null&&F.lock[3].vijaya==null&&F.lock[4].briten==null,F.lock);
ok('Wessex: Schritt 3, 4 und (seit W6, Alfred-Phase bis zur Wedmore-Wahl) 5 gesperrt mit „noch zu stark“, ab Schritt 6 frei',F.ws===5&&F.lock[3].usa===F.lock[4].usa&&F.lock[5].usa===F.lock[4].usa&&/^Wessex ist noch zu stark\. Erst Alfred stellt sich zur Schlacht\.$/.test(F.lock[3].usa)&&F.lock[6].usa==null,[F.ws,F.lock[3].usa,F.lock[5].usa,F.lock[6].usa]);
ok('Wessex-Rückfrage im Schritt 3 zeigt den Wessex-Text und bietet den Raubzug an; Northumbria dort ohne Rückfrage',/Wessex ist noch zu stark/.test(F.wessexModal)&&F.wessexBtn&&F.wessexBtn.dis===false&&/Angriff auf/.test(F.nordModal),[F.wessexModal.slice(0,90),F.nordModal]);
ok('Wessex bleibt Raubziel: mit Raubzug keine Sperre',F.rzWessex==null);

// ---- (g) Marionettenkönig ----
const G=await p.evaluate(()=>{const o={};
 const cap=(label,id,fn)=>{setup();const f=S.player;gotoStep(3);S.fac[f].gold=1000;closeAll();const ti=PI[id],prev=S.prov[ti].owner,a=S.armies.find(x=>x.f===f&&x.p===PI.viken);a.p=ti===PI.icener?PI.icener:a.p;
   const pre=provsOf(prev).length;o[label]={prev,pre,capIs:capitalOf(prev)===ti};S.sieges=S.sieges||{};S.sieges[ti]={f,aid:a.id,t:5};captureBySiege(a,ti);
   o[label].q=(S.marQ||[]).length;o[label].own=S.prov[ti].owner===f;o[label].n=provsOf(prev).length;o[label].war=atWar(f,prev);S.capQ=S.capQ||[];showConquest();o[label].txt=mTxt();o[label].mar=hasBtn(/^Marionettenkönig einsetzen/);o[label].self=hasBtn(/^Selbst herrschen/);fn&&fn(o[label],f,prev,ti);};
 cap('mercia','corieltauver',(r,f,prev,ti)=>{r.click=clickBtn(/^Marionettenkönig einsetzen/);const d=dip(f,prev);r.after={st:d.st,vas:d.vas,war:atWar(f,prev),own:S.prov[ti].owner===f,n:provsOf(prev).length,log:S.log.slice(-4).some(e=>/Ceolwulf/.test(e.t)),next:mTxt().slice(0,30),trib:tributeParts(f).vas};closeAll();});
 cap('northumbria','briganten',(r,f,prev,ti)=>{r.click=clickBtn(/^Selbst herrschen/);const d=dip(f,prev);r.after={st:d.st,vas:d.vas||null,war:atWar(f,prev),own:S.prov[ti].owner===f};closeAll();});
 cap('eastanglia','icener',(r,f,prev,ti)=>{r.click=clickBtn(/^Selbst herrschen/);r.after={war:atWar(f,prev),vas:dip(f,prev).vas||null};closeAll();});
 // Wessex nie
 setup();{const f=S.player;gotoStep(5);const ti=PI.belgae_b,prev='usa',a=S.armies.find(x=>x.f===f);S.sieges=S.sieges||{};S.sieges[ti]={f,aid:a.id,t:5};captureBySiege(a,ti);o.wessex={cap:capitalOf('usa')!==ti,q:(S.marQ||[]).length,own:S.prov[ti].owner===f};}
 // vor Schritt 3 kein Angebot
 setup();{const f=S.player;gotoStep(2);const ti=PI.corieltauver,a=S.armies.find(x=>x.f===f);S.sieges=S.sieges||{};S.sieges[ti]={f,aid:a.id,t:5};captureBySiege(a,ti);o.frueh={q:(S.marQ||[]).length};}
 return o;});
ok('Marionette: Mercia-Hauptstadt fällt (Schritt 3): Fenster mit beiden Wahlen',G.mercia.capIs&&G.mercia.own&&G.mercia.q===1&&/ist gefallen/.test(G.mercia.txt)&&G.mercia.mar&&G.mercia.mar.dis===false&&G.mercia.self,G.mercia);
ok('Marionette einsetzen: Mercia wird Vasall, Frieden, Hauptstadt bleibt beim Spieler, Protokoll, Tribut',G.mercia.click&&G.mercia.after.st==='ally'&&G.mercia.after.vas==='mogul'&&!G.mercia.after.war&&G.mercia.after.own&&G.mercia.after.n>=1&&G.mercia.after.log,G.mercia.after);
ok('Selbst herrschen: Northumbria bleibt im Krieg, kein Vasall',G.northumbria.mar&&G.northumbria.self&&G.northumbria.click&&G.northumbria.after.war&&!G.northumbria.after.vas&&G.northumbria.after.own,G.northumbria);
ok('East Anglia ohne Provinzen: nur „Selbst herrschen“ (Marionette gesperrt mit Grund)',G.eastanglia.n===0&&G.eastanglia.mar&&G.eastanglia.mar.dis===true&&/keine Provinz übrig/.test(G.eastanglia.txt)&&G.eastanglia.click&&G.eastanglia.after.vas==null,G.eastanglia);
ok('Wessex nie Marionette; vor Schritt 3 kein Angebot',G.wessex.q===0&&G.wessex.own&&G.frueh.q===0,[G.wessex,G.frueh]);

// ---- (h) Winterlager ----
const H=await p.evaluate(()=>{setup();const f=S.player,a=S.armies.find(x=>x.f===f&&x.p===PI.viken),o={};S.fac[f].gold=1000;
 const T1=PI.cantium,T2=PI.trinovanten,T3=PI.dumnonier;for(const t of [T1,T2,T3]){S.prov[t].owner=f;}
 a.p=T1;a.rz=false;a.boat=null;
 o.cost=lagerCost();o.html0=lagerHtml(a);gotoStep(0);o.html0=lagerHtml(a);
 gotoStep(1);o.btn=stanceHtml(a,true);o.btnHas=/Winterlager aufschlagen · 66 Gold/.test(o.btn);o.garMax=garMax(T1);
 // Heimat: Kernland Skandinavien gesperrt mit Grund
 const h=S.armies.find(x=>x.f===f&&x.p!==T1)||a;const hp=h.p;h.p=PI.viken;o.home=lagerWhy(h);o.homeHtml=/Daheim braucht ihr kein Lager/.test(lagerHtml(h))&&/disabled/.test(lagerHtml(h));h.p=hp;
 // Fenster
 
 UI.army=a.id;UI.mode='army';closeAll();askLager(a);o.ask=mTxt();const g0=S.fac[f].gold;o.click=clickBtn(/^Aufschlagen/);
 const P=S.prov[T1];o.res={gold:g0-S.fac[f].gold,lager:P.lager===S.turn,gar:P.gar,want:Math.ceil(garMax(T1)*0.8),on:lagerOn(T1)};
 {const w=provDefense(T1,'usa'),wo=provDefense(T1),sv=P.lager,ow=provDefense(T1,f);delete P.lager;const wx=provDefense(T1,'usa'),wox=provDefense(T1);P.lager=sv;o.def={mit:w,ohne:wx,ratio:w/wx,noAttMit:wo,noAttOhne:wox,own:ow};}
 o.after=lagerHtml(a);o.chip=bChips(T1);
 // Garnison wird aufgefüllt
 P.gar=1;lagerRound();o.refill=P.gar>=Math.ceil(garMax(T1)*0.8);
 // Unruhe sinkt doppelt so schnell (Vergleich mit Provinz ohne Lager)
 const Q=S.prov[T2];P.unrest=8;Q.unrest=8;const ordSave=0;newRound();o.unrest={lager:8-P.unrest,ohne:8-Q.unrest};
 // zweites Lager, drittes verweigert
 const b=S.armies.find(x=>x.f===f&&x!==a)||(()=>{const c=JSON.parse(JSON.stringify(a));c.id=S.nextId++;S.armies.push(c);return c;})();b.p=T2;b.boat=null;
 const r2=setLager(b);o.second=r2.ok&&lagerList().length===2;
 const c3=JSON.parse(JSON.stringify(a));c3.id=S.nextId++;c3.p=T3;S.armies.push(c3);const r3=setLager(c3);o.third={ok:r3.ok,why:r3.why,n:lagerList().length,html:/disabled/.test(lagerHtml(c3))&&/Höchstens 2 Lager/.test(lagerHtml(c3))};
 // Speicherfeld bleibt im Speicherstand
 o.saved=JSON.parse(JSON.stringify(S)).prov[T1].lager===P.lager;
 // Versorgung folgt unten; hier Verlust der Provinz
 S.prov[T1].owner='usa';o.lostOn=lagerOn(T1);o.lostField=S.prov[T1].lager===undefined;S.prov[T1].owner=f;o.backOn=lagerOn(T1);
 S.prov[T2].owner='usa';lagerRound();o.lostRound=S.prov[T2].lager===undefined&&lagerList().length===0;
 return o;});
ok('Winterlager: Knopf erst ab Schritt 1, nennt „aufschlagen · 66 Gold“ (60 × Epochenfaktor)',H.cost===66&&H.html0===''&&H.btnHas,[H.cost,H.html0.slice(0,20)]);
ok('Winterlager daheim in Skandinavien: Knopf grau mit Grund',/Daheim braucht ihr kein Lager/.test(H.home||'')&&H.homeHtml,H.home);
ok('Winterlager: Rückfrage, Bestätigen kostet Gold, setzt Garnison auf mind. 80 %',/Winterlager aufschlagen\?/.test(H.ask)&&H.click&&H.res.gold===66&&H.res.lager&&H.res.on&&H.res.gar>=H.res.want,[H.res]);
ok('Winterlager: Abwehr gegen Angreifer exakt ×2 (Verteidigungsberechnung); ohne Angreifer unverändert',H.def.ohne>0&&Math.abs(H.def.ratio-2)<1e-9&&H.def.noAttMit===H.def.noAttOhne,H.def);
ok('Winterlager: im Provinz-Blatt „⛺ Winterlager seit Runde N“ und im Heer-Blatt als Hinweis',/⛺ Winterlager seit Runde \d+/.test(H.chip)&&/seit Runde/.test(H.after)&&!/data-act="lager"/.test(H.after),H.after.slice(0,60));
ok('Winterlager: Garnison wird jede Runde aufgefüllt',H.refill);
ok('Winterlager: Unruhe sinkt doppelt so schnell',H.unrest.ohne>0&&Math.abs(H.unrest.lager-2*H.unrest.ohne)<0.01,H.unrest);
ok('Winterlager: höchstens 2 gleichzeitig, drittes verweigert mit Grund am Knopf',H.second&&!H.third.ok&&/Höchstens 2 Lager/.test(H.third.why)&&H.third.n===2&&H.third.html,H.third);
ok('Winterlager: Speicherfeld P.lager wird gespeichert',H.saved);
ok('Winterlager: verschwindet bei Verlust der Provinz (auch nach Rückeroberung nicht wieder da)',H.lostOn===false&&H.lostField&&H.backOn===false&&H.lostRound,[H.lostOn,H.lostField,H.backOn,H.lostRound]);

// ---- (i) Versorgung ----
const I=await p.evaluate(()=>{setup();const f=S.player,a=S.armies.find(x=>x.f===f&&x.p===PI.viken),o={};
 const dist=s=>{const d=PROV_DEF.map(()=>-1);d[s]=0;let q=[s];while(q.length){const nx=[];for(const c of q)for(const n of ADJ[c])if(d[n]<0&&isAct(n)){d[n]=d[c]+1;nx.push(n);}q=nx;}return d;};
 const mine=provsOf(f);let pick=null;
 for(let x=0;x<PROV_DEF.length&&!pick;x++){if(!isAct(x)||S.prov[x].owner===f)continue;const d=dist(x);if(mine.some(m=>d[m]>=0&&d[m]<=3))continue;
   for(let L=0;L<PROV_DEF.length;L++){if(d[L]===3&&isAct(L)&&S.prov[L].owner!=='frei'&&!mine.includes(L)){// alle Nachbarn bis 2 Schritte von x fremd
     pick=[x,L];break;}}}
 if(!pick){o.err='kein Paar';return o;}
 const [x,L]=pick;a.p=x;a.rz=false;a.st=null;a.boat=null;a.tr=false;const m0=a.units.map(u=>u.men);
 S.prov[L].owner=f;// Lagerprovinz in Reichweite 3
 supplyRound();o.ohne=a.units.map(u=>u.men).reduce((s,v)=>s+v,0)<m0.reduce((s,v)=>s+v,0);
 a.units.forEach((u,i)=>u.men=m0[i]);a.unsup=null;S.prov[L].lager=S.turn;supplyRound();o.mit=a.units.map(u=>u.men).every((v,i)=>v===m0[i]);o.reach=lagerReach(a);
 delete S.prov[L].lager;a.unsup=null;
 o.fremd=(()=>{const c={...a,f:'usa'};return lagerReach(c);})();
 return o;});
ok('Versorgung: ohne Lager Abnutzung in 3 Provinzen Abstand, mit Lager (in Reichweite 3) versorgt',!I.err&&I.ohne&&I.mit&&I.reach&&I.fremd===false,I);

// ---- (j) Alter Spielstand ohne Feld lädt ----
const J=await p.evaluate(()=>{setup();const f=S.player;gotoStep(1);const o={};const raw=JSON.parse(JSON.stringify(S));raw.prov.forEach(P=>{delete P.lager;});delete raw.marQ;
 try{loadGame(raw);}catch(e){o.err=String(e);}try{closeModal();}catch(e){}
 o.scen=S.scen&&S.scen.id;o.noField=S.prov.every(P=>P.lager===undefined);o.list=lagerList().length;
 const a=S.armies.find(x=>x.f===S.player);o.html=lagerHtml(a).length>0;o.round=(()=>{try{lagerRound();newRound();return true;}catch(e){return String(e);}})();o.def=provDefense(PI.viken,'usa')>0;
 return o;});
ok('Alter Spielstand ohne Lager-Feld: lädt, Wikinger-Regeln aktiv, keine Lager, Runde läuft',!J.err&&J.scen==='wikinger'&&J.noField&&J.list===0&&J.html&&J.round===true&&J.def,J);

// ---- (k) Kontrollen: Endlosspiel, andere Geschichte, beendete Wikinger-Geschichte ----
const K=await p.evaluate(()=>{const o={};
 newGame('nord');try{closeModal();}catch(e){}{const f=S.player,a=S.armies.find(x=>x.f===f),ti=PROV_DEF.findIndex((d,i)=>isAct(i)&&S.prov[i].owner!=='frei'&&S.prov[i].owner!==f);o.endlos={rule:scenRuleV('raubzeit'),mar:scenRuleV('marionette'),lager:scenRuleV('winterlager'),lock:a?wikRaidLock(a,ti):null,lockS:a?wikRaidLock(a,ti,true):null,html:a?lagerHtml(a):'',step:scenStepI(),def:provDefense(ti,f)===provDefense0(ti,f)*(gwLv(ti)>=3?1.3:gwLv(ti)>=2?1.15:1),canS:null};
  S.prov[ti].lager=1;o.endlos.lagerWirkt=false; // Feld ohne Regel: Besitzer ist nicht der Spieler -> wird verworfen
  o.endlos.lagerOn=lagerOn(ti);}
 startScenario('caesar');try{closeModal();}catch(e){}{const f=S.player,a=S.armies.find(x=>x.f===f);o.caesar={rule:scenRuleV('raubzeit'),html:a?lagerHtml(a):'',lock:a?wikRaidLock(a,PI.corieltauver):null,hook:!!(SCEN.caesar.hooks&&SCEN.caesar.hooks[3])};}
 setup();{const f=S.player,a=S.armies.find(x=>x.f===f);S.scen.over=true;o.over={lock:wikRaidLock(a,PI.votadiner),rule:scenRuleV('raubzeit'),html:lagerHtml(a)};}
 return o;});
ok('Kontrolle Endlosspiel: keine Sperre, kein Lager-Knopf, Abwehr unverändert, Regelwerte leer',K.endlos.rule==null&&K.endlos.mar==null&&K.endlos.lager==null&&K.endlos.lock==null&&K.endlos.lockS==null&&K.endlos.html===''&&K.endlos.def&&K.endlos.lagerOn===false,K.endlos);
ok('Kontrolle andere Geschichte (Caesar): keine Wikinger-Regeln, keine Sperre',K.caesar.rule==null&&K.caesar.html===''&&K.caesar.lock==null,K.caesar);
ok('Kontrolle: nach Ende der Wikinger-Geschichte keine Sperre mehr',K.over.lock==null&&K.over.rule==null,K.over);
ok('Keine Seitenfehler',!errs.length,errs.slice(0,3));
const nP=R.filter(x=>x).length;console.log(`${nP} PASS / ${R.length-nP} FAIL`);console.log(R.every(x=>x)?'ALLE PASS':'FEHLER '+R.filter(x=>!x).length);await b.close();})();
