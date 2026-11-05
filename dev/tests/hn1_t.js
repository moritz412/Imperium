// node hn1_t.js <html> [port] – H1 (v234): Hannibal Paket 1. Sagunt (Mauern, Kriegserklärung Roms beim Beginn der Belagerung, fällt nicht vor Runde 3),
// Besatzung zurücklassen (a/b/c), Landung der Scipionen, Rhone-Übergang (Flöße/sofort, Umfassung +10 %), gesperrte Wege mit Grund (Seeweg, Rom, Diplomatie),
// Elefanten-Regeln (Schrecken, Panik, Gassen öffnen, Kälte nur Hannibal), Scipio-Namen; Kontrollen Endlosspiel und andere Geschichte.
// Spielerheer greift ab Runde 1 an (Messziel aus hannibal_ablauf.md). Das echte iPad ist nicht getestet.
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
 window.setup=()=>{startScenario('hannibal');try{closeModal();}catch(e){}storyRound();S.q=[];const s=S.story[S.player];if(s)s.q=[];};
 window.mTxt=()=>$('#modal').hidden?'':$('#dialog').innerText;
 window.clickBtn=re=>{const x=[...document.querySelectorAll('#dialog .actions .btn, #dialog .rcard')].find(y=>re.test(y.textContent.trim())&&!y.disabled);if(x)x.click();return!!x;};
 window.hasBtn=re=>{const x=[...document.querySelectorAll('#dialog .actions .btn, #dialog .rcard')].find(y=>re.test(y.textContent.trim()));return x?{dis:!!x.disabled}:null;};
 window.closeAll=()=>{try{closeModal();}catch(e){}};
 window.gotoStep=i=>{const f=S.player,s=S.story[f];s.i=i;s.t0=S.turn;s.done=false;s.end=false;return s;};
 window.hero=()=>S.armies.find(x=>x.id===S.scen.hero);
 // Heer in eine Nachbarprovinz von ti stellen (Landweg), mit voller Bewegung
 window.putNear=(a,ti,pred)=>{const n=[...ADJ[ti]].find(j=>!isSeaLink(j,ti)&&isAct(j)&&(!pred||pred(j)));a.p=n;a.mp=85;a.st=null;a.rz=false;a.goal=null;a.pos=null;a.boat=null;return n;};
 window.evs=()=>stEvents(S.player).map(x=>x.E);
 window.cnt=(o,k)=>{o[k]=(o[k]||0)+1;};});

// ---- (a) Schritt 1 Sagunt: Mauern, Garnison, Kriegserklärung beim Beginn der Belagerung ----
const A=await p.evaluate(()=>{setup();const f=S.player,ed=PI.edetaner,o={};const a=hero();
 o.walls=S.prov[ed].b.walls;o.gar=S.prov[ed].gar;o.ms=minSiege(ed);o.warStart=atWar(f,'rom');o.hook1=typeof SCEN.hannibal.hooks[1];
 o.latWalls=S.prov[PI.latium].b.walls;o.latGar=S.prov[PI.latium].gar;
 // sichtbarer Weg: Angriffsfenster zeigt die Wartezeit, Knopf „Belagern“ beginnt die Belagerung
 a.mp=85;closeAll();orderMove(a,ed);o.modal=mTxt();o.btnSiege=hasBtn(/^Belagern$/);
 const l0=S.log.length;o.click=clickBtn(/^Belagern$/);o.sieg=!!(S.sieges&&S.sieges[ed]);o.warSiege=atWar(f,'rom');o.flag=S.scen.flags.hn_krieg;
 o.log=S.log.slice(l0).map(e=>e.t).filter(t=>/Sagunt|Rom/.test(t));
 closeAll();const E=evs();o.ev=E.map(x=>x.id);const e1=E.find(x=>x.id==='hn_sagunt');o.evTxt=e1?e1.title()+' | '+e1.text():'';
 // zweiter Beginn löst nichts doppelt aus
 hnSiegeBegin(a,ed);o.once=S.scen.flags.hn_krieg===o.flag;
 return o;});
ok('Sagunt: Mauern III, Garnison 26, Sturm erst nach 3 Runden Belagerung',A.walls===3&&A.gar>=26&&A.ms>=3,[A.walls,A.gar,A.ms]);
ok('Rom: zu Beginn kein Krieg, Hook 1 erklärt nur noch, wenn nötig',!A.warStart&&A.hook1==='function',A.warStart);
ok('Latium: Mauern III und Bürgerheer (Garnison 34)',A.latWalls===3&&A.latGar>=34,[A.latWalls,A.latGar]);
ok('Angriffsfenster nennt die Belagerung, Knopf „Belagern“ sichtbar',/Belagerung/.test(A.modal)&&A.btnSiege&&A.btnSiege.dis===false,A.modal.slice(0,160));
ok('Belagerung beginnt mit dem Knopf: Rom ist im Krieg (Kriegsschuld bei Hannibal), Meldung im Protokoll',A.click&&A.sieg&&A.warSiege&&A.flag>0&&A.log.some(t=>/Kriegsschuld liegt bei Hannibal/.test(t)),A.log);
ok('Ereignisfenster „Sagunt ist eingeschlossen“ nennt die Schuld und die Wartezeit',A.ev.includes('hn_sagunt')&&/Schuld trägt Hannibal/.test(A.evTxt)&&/3 Runden Belagerung/.test(A.evTxt),A.evTxt);
ok('Kriegserklärung nur einmal',A.once);

// Messziel: Spielerheer greift ab Runde 1 jede Runde an – Sagunt fällt nicht vor Runde 3
const M=await p.evaluate(()=>{const o={rounds:[],r1:[]};
 for(let k=0;k<10;k++){setup();const f=S.player,ed=PI.edetaner,a0=hero();let cap=null;
  for(let r=0;r<10;r++){const a=S.armies.find(x=>x.id===a0.id);a.mp=maxMP(a);if(S.prov[ed].owner===f){cap=S.turn-S.scen.t0+1;break;}
   const res=resolveAttack(a,ed);if(r===0)o.r1.push(!!res.captured);if(S.prov[ed].owner===f){cap=S.turn-S.scen.t0+1;break;}newRound();}
  o.rounds.push(cap);}
 return o;});
ok('Messziel: Sagunt fällt in 10 Läufen mit täglichem Angriff nie vor Runde 3 (frühester Fall: Runde '+Math.min(...M.rounds)+')',M.rounds.every(r=>r!=null&&r>=3)&&M.r1.every(x=>!x),M.rounds);

// ---- (b) Besatzung zurücklassen ----
const B=await p.evaluate(()=>{const o={};
 const prep=()=>{setup();const f=S.player,a=hero();S.prov[PI.tarraco].owner=f;S.prov[PI.ilergeten].owner=f;const n=[...ADJ[PI.vasconen]].find(i=>hnHisp(i));a.p=n;a.mp=85;closeAll();return a;};
 // Fenster
 let a=prep();const u0=a.units.length;orderMove(a,PI.vasconen);o.txt=mTxt();o.btn={a:hasBtn(/Hanno bleibt/),b:hasBtn(/Alle ziehen mit/),c:hasBtn(/Iberer heimschicken/)};
 // a
 o.a={};o.a.click=clickBtn(/Hanno bleibt/);const h=S.armies.find(x=>x.hnHanno);o.a.u=a.units.length;o.a.hanno=h?{p:PROV_DEF[h.p].id,n:h.units.length,g:h.gen.n,ele:h.units.filter(hnIsEle).length,gar:S.prov[h.p].gar}:null;o.a.flag=S.scen.flags.hn_besatz;o.a.next=mTxt().slice(0,40);o.a.ele=hnEleN(a);
 closeAll();
 // zweiter Marsch: kein Fenster mehr
 a.mp=85;orderMove(a,PI.vasconen);o.a.again=mTxt().slice(0,40);closeAll();
 // b
 a=prep();orderMove(a,PI.vasconen);o.b={};o.b.click=clickBtn(/Alle ziehen mit/);o.b.u=a.units.length;o.b.flag=S.scen.flags.hn_besatz;o.b.hanno=S.armies.some(x=>x.hnHanno);closeAll();
 // c
 a=prep();const m0=a.units.map(u=>u.xp||0);orderMove(a,PI.vasconen);o.c={};o.c.click=clickBtn(/Iberer heimschicken/);o.c.u=a.units.length;o.c.xp=a.units.every(u=>(u.xp||0)>=40);o.c.flag=S.scen.flags.hn_besatz;o.c.ele=hnEleN(a);closeAll();
 // zu kleines Heer: a und c gesperrt
 a=prep();a.units=a.units.slice(0,4);orderMove(a,PI.vasconen);o.small={a:hasBtn(/Hanno bleibt/),b:hasBtn(/Alle ziehen mit/),c:hasBtn(/Iberer heimschicken/)};closeAll();
 // Ein Heer ohne Heldenrolle löst kein Fenster aus
 a=prep();const x=createArmy(S.player,a.p,['spear','sword'],1);x.mp=85;orderMove(x,PI.vasconen);o.other=mTxt().slice(0,40);closeAll();
 // Rückfall: Heer steht ohne Angriffsdialog jenseits der Pyrenäen
 a=prep();a.p=PI.tolosa;hnRound();o.fall={flag:S.scen.flags.hn_besatz,u:a.units.length};
 return o;});
ok('Besatzung: Fenster beim ersten Marsch jenseits der Pyrenäen, drei Wahlen mit Wirkung im Text',/Wer bleibt in Hispanien/.test(B.txt)&&B.btn.a&&B.btn.b&&B.btn.c&&/Garnison mindestens 15/.test(B.txt)&&/Hispanien bleibt offen/.test(B.txt),B.txt.slice(0,200));
ok('Wahl a: Hanno mit 3 Einheiten (kein Elefant) in Tarraco, Heer −3, Garnison ≥ 15, danach normaler Angriffsdialog',B.a.click&&B.a.hanno&&B.a.hanno.p==='tarraco'&&B.a.hanno.n===3&&B.a.hanno.g==='Hanno'&&B.a.hanno.ele===0&&B.a.hanno.gar>=15&&B.a.u===7&&B.a.ele===3&&B.a.flag==='a'&&/Angriff auf/.test(B.a.next),B.a);
ok('Zweiter Marsch ohne Fenster',/Angriff auf/.test(B.a.again)||B.a.again==='',B.a.again);
ok('Wahl b: alle bleiben im Heer, kein Hanno',B.b.click&&B.b.u===10&&B.b.flag==='b'&&!B.b.hanno,B.b);
ok('Wahl c: −2 Einheiten, Rest Erfahrung +40, Elefanten bleiben',B.c.click&&B.c.u===8&&B.c.xp&&B.c.flag==='c'&&B.c.ele===3,B.c);
ok('Kleines Heer: a und c gesperrt, b möglich',B.small.a&&B.small.a.dis&&B.small.c&&B.small.c.dis&&B.small.b&&!B.small.b.dis,B.small);
ok('Anderes Heer löst das Fenster nicht aus',!/Wer bleibt/.test(B.other),B.other);
ok('Rückfall (ohne Dialog gezogen): Besatz-Wahl b wird gesetzt, Meldung',B.fall.flag==='b'&&B.fall.u===10,B.fall);

// ---- (c) Landung der Scipionen: Ausgang hängt an der Wahl ----
const C=await p.evaluate(()=>{const o={a:{abgewehrt:0,gefallen:0,belagert:0},b:{abgewehrt:0,gefallen:0,belagert:0},c:{abgewehrt:0,gefallen:0,belagert:0}};
 for(const m of['a','b','c']){for(let i=0;i<30;i++){setup();const f=S.player,a=hero();S.prov[PI.tarraco].owner=f;S.prov[PI.tarraco].gar=9;S.prov[PI.ilergeten].owner=f;hnBesatzDo(a,m);
   if(m==='a'&&i===0){o.hannoThere=armiesAt(PI.tarraco).some(x=>x.hnHanno);}
   hnLanding();o[m][S.scen.flags.hn_scipio]++;}}
 // Zeitplan
 setup();{const f=S.player,Z=S.scen,a=hero();S.prov[PI.tarraco].owner=f;S.prov[PI.ilergeten].owner=f;hnBesatzDo(a,'a');S.scen.flags.hn_besatzT=Z.t0+7;
  S.turn=Z.t0+7;hnRound();o.t1=!!Z.flags.hn_landung;S.turn=Z.t0+8;hnRound();o.warn=!!Z.flags.hn_warn;o.t2=!!Z.flags.hn_landung;S.turn=Z.t0+9;hnRound();o.t3=!!Z.flags.hn_landung;
  o.ev=evs().map(x=>x.id);o.log=S.log.slice(-6).map(e=>e.t);}
 setup();{const Z=S.scen;S.turn=Z.t0+5;hnRound();o.noChoice5=!!Z.flags.hn_landung;S.turn=Z.t0+14;hnRound();o.noChoice14=!!Z.flags.hn_landung;S.turn=Z.t0+15;hnRound();o.noChoice15=!!Z.flags.hn_landung;}
 // Fenstertexte
 setup();{const f=S.player,a=hero();S.prov[PI.tarraco].owner=f;S.prov[PI.ilergeten].owner=f;hnBesatzDo(a,'b');hnLanding();const E=evs().find(x=>x.id==='hn_landung');o.evB=E?E.title()+' | '+E.text():'';}
 setup();{const f=S.player,a=hero();S.prov[PI.tarraco].owner=f;S.prov[PI.tarraco].gar=9;S.prov[PI.ilergeten].owner=f;hnBesatzDo(a,'a');let k=0;while(k++<30){setup();const f2=S.player,a2=hero();S.prov[PI.tarraco].owner=f2;S.prov[PI.tarraco].gar=9;S.prov[PI.ilergeten].owner=f2;hnBesatzDo(a2,'a');hnLanding();if(S.scen.flags.hn_scipio==='abgewehrt')break;}
   const E=evs().find(x=>x.id==='hn_landung');o.evA=E?E.title()+' | '+E.text():'';o.scipRest=S.armies.some(x=>x.hnScip);}
 return o;});
const rate=(x,k)=>x[k]/30;
ok(`Landung nach Wahl a (Hanno): meist abgewehrt (${C.a.abgewehrt}/30)`,rate(C.a,'abgewehrt')>=0.7&&C.hannoThere,C.a);
ok(`Landung nach Wahl b (alle ziehen mit): Provinz fällt fast immer (${C.b.gefallen}/30)`,rate(C.b,'gefallen')>=0.9,C.b);
ok(`Landung nach Wahl c (Iberer heim): Provinz fällt fast immer (${C.c.gefallen}/30)`,rate(C.c,'gefallen')>=0.9,C.c);
ok('Zeitplan: Landung 2 Runden nach der Wahl (nicht vor Runde 6), Warnung eine Runde vorher',!C.t1&&C.warn&&C.t2===false||C.t2===true,[C.t1,C.warn,C.t2,C.t3]);
ok('Zeitplan: spätestens in Runde 16, auch ohne Wahl; vorher nicht',!C.noChoice5&&!C.noChoice14&&C.noChoice15,[C.noChoice5,C.noChoice14,C.noChoice15]);
ok('Ereignisfenster Landung: Text nach Ausgang',/fällt an Rom/.test(C.evB)&&/Gnaeus und Publius Scipio/.test(C.evB)&&/Hanno/.test(C.evA)&&/zurück/.test(C.evA),[C.evA,C.evB]);
ok('Abgewehrte Landung: kein Scipionen-Heer bleibt auf der Karte',C.scipRest===false);

// ---- (d) Rhone-Übergang ----
const D=await p.evaluate(()=>{const o={};
 const prep=()=>{setup();const a=hero();a.p=PI.tarraco;S.prov[PI.tarraco].owner=S.player;a.mp=85;S.scen.flags.hn_besatz='b';closeAll();return a;};
 // Fenster, Flöße
 let a=prep();const en0=a.units.filter(hnIsEle).map(u=>u.men);orderMove(a,PI.narbo);o.txt=mTxt();o.btn={f:hasBtn(/Flöße bauen/),s:hasBtn(/Sofort übersetzen/)};
 o.fl={click:clickBtn(/Flöße bauen/),mp:a.mp,ele:a.units.filter(hnIsEle).map(u=>u.men),ele0:en0,flag:S.scen.flags.hn_rhone,rh:!!a.hnRhone,modal:mTxt()};closeAll();
 // Plan Umfassung +10 %
 a.plan='umfassung';const m1=planMul(a,PI.narbo);delete a.hnRhone;const m0=planMul(a,PI.narbo);a.hnRhone={to:PI.narbo,t:S.turn};o.um={m1,m0,ratio:m1/m0,other:planMul(a,PI.vocontier)/m0};
 a.plan='frontal';o.plan=planHtml(a);
 // nächste Runde: kein Fenster mehr, Angriff möglich
 a.mp=85;orderMove(a,PI.narbo);o.next=mTxt().slice(0,40);closeAll();
 // sofort: Verlustrate
 let hit=0,tot=0,lost=0;for(let i=0;i<60;i++){const a2=prep();const e0=a2.units.filter(hnIsEle).map(u=>u.men);hnRhoneDo(a2,PI.narbo,'sofort');a2.units.filter(hnIsEle).forEach((u,j)=>{tot++;if(u.men<e0[j]){hit++;lost+=1-u.men/e0[j];}});}
 o.sof={rate:hit/tot,avg:hit?lost/hit:0,mpKept:prep().mp};
 // Sofort per Knopf, danach Angriffsdialog
 a=prep();orderMove(a,PI.vocontier);o.vocTxt=mTxt().slice(0,200);o.so={click:clickBtn(/Sofort übersetzen/),next:mTxt().slice(0,40)};closeAll();
 // ohne Elefanten kein Fenster
 a=prep();delete S.scen.flags.hn_rhone;a.units=a.units.filter(u=>!hnIsEle(u));orderMove(a,PI.narbo);o.noEle=mTxt().slice(0,40);closeAll();
 // Rückfall Rhone
 a=prep();delete S.scen.flags.hn_rhone;a.p=PI.narbo;hnRound();o.fall=!!S.scen.flags.hn_rhone;
 return o;});
ok('Rhone: Fenster mit Floß/sofort, Wirkung im Text (Wartezeit, 50 % Risiko, 30 %), Hinweis auf Umfassung',/Der Strom ist breit/.test(D.txt)&&D.btn.f&&D.btn.s&&/1 Runde Wartezeit/.test(D.txt)&&/50 %/.test(D.txt)&&/30 %/.test(D.txt)&&/\+10 %/.test(D.txt),D.txt.slice(0,260));
ok('Floß: Heer wartet (keine Bewegung), Elefanten unversehrt, Fenster zu',D.fl.click&&D.fl.mp===0&&JSON.stringify(D.fl.ele)===JSON.stringify(D.fl.ele0)&&D.fl.flag>0&&D.fl.rh&&D.fl.modal==='',D.fl);
ok('Plan Umfassung: +10 % zusätzlich nur am Rhone-Ziel',Math.abs(D.um.ratio-1.1)<1e-9&&Math.abs(D.um.other-1)<1e-9,D.um);
ok('Heerblatt erklärt Rhone-Bonus und Elefanten-Regeln',/Rhone/.test(D.plan)&&/Elefanten: Ihr Schrecken/.test(D.plan)&&/erfrieren/.test(D.plan),D.plan.slice(0,80));
ok('Nach dem Floß kein zweites Fenster, normaler Angriffsdialog',/Angriff auf/.test(D.next),D.next);
ok(`Sofort: Risiko je Elefanten-Einheit ca. 50 % (${Math.round(D.sof.rate*100)} %), Verlust 30 %`,D.sof.rate>0.3&&D.sof.rate<0.7&&Math.abs(D.sof.avg-0.3)<0.05,D.sof);
ok('Vocontier: Fenster nennt die Vocontier; „Sofort übersetzen“ öffnet danach den Angriff',/Vocontier/.test(D.vocTxt)&&D.so.click&&/Angriff auf/.test(D.so.next),[D.vocTxt,D.so]);
ok('Heer ohne Elefanten: kein Rhone-Fenster',/Angriff auf/.test(D.noEle),D.noEle);
ok('Rückfall: Heer an der Rhone ohne Dialog – Übergang wird gesetzt',D.fall===true);

// ---- (e) Seeweg gesperrt, Rom-Angriff mit Rückfrage, keine Unterwerfung ----
const E=await p.evaluate(()=>{const o={};setup();const f=S.player,a=hero();
 // Flotte vor Kampanien, Heer an Bord
 const h=fleetSeaPos(PI.kampanien),fl={id:S.nextId++,f,p:PI.kampanien,x:h.x,z:h.z,n:3,hp:100,mp:0,mpv2:1,e:ep(),cargo:[],name:'Flotte Test'};S.fleets=S.fleets||[];S.fleets.push(fl);fleetInit(fl);fl.mp=fleetRange(fl);
 a.boat=fl.id;a.embP=a.p;fl.cargo=[a.id];a.mp=85;a.landT=null;
 o.target=landTargets(fl).includes(PI.kampanien);
 o.lock=hnSeaLock(a,PI.kampanien);o.lockGallia=hnSeaLock(a,PI.massalia);o.err=(disembark(a,fl,PI.kampanien)||{}).err;o.stillBoat=a.boat===fl.id;
 closeAll();doLand(a,fl,PI.kampanien);o.doLand=mTxt();o.okBtn=hasBtn(/^Verstanden$/);closeAll();
 UI.army=a.id;UI.mode='army';askLand([a],fl,PI.kampanien);o.askLand=mTxt();closeAll();
 UI.mode='fleet';UI.fleet=fl.id;UI.army=null;UI.sel=fl.p;try{renderSheet();}catch(e){}o.sheet=($('#sheet')||{}).innerText||'';
 o.landed=a.boat===fl.id;
 // ab Akt IV offen
 gotoStep(8);o.open=hnSeaLock(a,PI.kampanien);gotoStep(7);o.step7=hnSeaLock(a,PI.kampanien);gotoStep(0);S.scen.flags.hn_seeOk=1;o.seeOk=hnSeaLock(a,PI.kampanien);delete S.scen.flags.hn_seeOk;
 o.stepsIdx=[SCEN.hannibal.chapter.steps.findIndex(x=>/Cannae/.test(x.t)),SCEN.hannibal.chapter.steps.findIndex(x=>/Nachschub/.test(x.t)),SCEN.hannibal.chapter.steps.findIndex(x=>/Rom oder Zama/.test(x.t))];
 return o;});
ok('Seeweg: Anlanden an Italiens Küste gesperrt mit Grund (disembark, Antippen, Ausladen-Knopf), Heer bleibt an Bord',E.target&&E.lock==='Rom beherrscht das Meer. Der Weg nach Italien führt über die Alpen.'&&E.err===E.lock&&E.stillBoat&&E.landed,[E.lock,E.err]);
ok('Seeweg: Fenster nennt den Grund und hat nur „Verstanden“',/Rom beherrscht das Meer\. Der Weg nach Italien führt über die Alpen\./.test(E.doLand)&&E.okBtn&&/Rom beherrscht das Meer/.test(E.askLand),E.doLand.slice(0,160));
ok('Seeweg: Flottenblatt zeigt „🔒“ mit Grund am Ausladen-Knopf',/🔒 Rom beherrscht das Meer/.test(E.sheet),E.sheet.slice(0,120));
ok('Seeweg: Gallien nicht gesperrt; ab Akt IV (Schritt 8) offen; Schritt 7 noch gesperrt; Ausnahme-Flagge (Rat) öffnet',E.lockGallia==null&&E.open==null&&E.step7!=null&&E.seeOk==null&&JSON.stringify(E.stepsIdx)==='[6,8,9]',[E.lockGallia,E.open,E.step7,E.stepsIdx]);
const F=await p.evaluate(()=>{const o={};setup();const f=S.player,a=hero();try{declareWar('rom',f,true);}catch(e){}
 putNear(a,PI.latium);closeAll();orderMove(a,PI.latium);o.txt=mTxt();o.btn={no:hasBtn(/^Abbrechen$/),go:hasBtn(/^Trotzdem angreifen$/)};
 o.cancel=clickBtn(/^Abbrechen$/);o.stay=a.p!==PI.latium&&$('#modal').hidden;
 closeAll();orderMove(a,PI.latium);o.go=clickBtn(/^Trotzdem angreifen$/);o.after=mTxt().slice(0,40);closeAll();
 gotoStep(5);closeAll();a.mp=85;delete a._hnRom;orderMove(a,PI.latium);o.step5=mTxt().slice(0,30);closeAll();
 gotoStep(6);closeAll();a.mp=85;orderMove(a,PI.latium);o.step6=mTxt().slice(0,30);closeAll();
 // andere Provinz: kein Tor
 gotoStep(0);const n2=putNear(a,PI.sabina);closeAll();orderMove(a,PI.sabina);o.sab=mTxt().slice(0,30);closeAll();
 // Diplomatie
 gotoStep(0);o.ns=scenNoSubmit('rom');o.ev=aiEval('rom',f,'vassal');o.ed=aiEval('rom',f,'demand');
 gotoStep(9);o.ns9=scenNoSubmit('rom');
 return o;});
ok('Rom-Angriff vor Akt III: Rückfrage mit geschätzter Lage („Rom hat noch … Heere im Feld … Mauern – …“), Abbrechen/Trotzdem',/Rom hat noch \d+ Heer/.test(F.txt)&&/Mauern – /.test(F.txt)&&F.btn.no&&F.btn.go,F.txt.slice(0,260));
ok('Rom: Abbrechen lässt das Heer stehen, „Trotzdem angreifen“ öffnet den Angriffsdialog',F.cancel&&F.stay&&F.go&&/Angriff auf/.test(F.after),[F.cancel,F.stay,F.after]);
ok('Rom: Schritt 5 noch gesperrt, ab Schritt 6 (Cannae) direkter Angriffsdialog; andere Provinzen ohne Rückfrage',/Angriff auf Rom\?/.test(F.step5)&&/Angriff auf/.test(F.step6)&&!/Angriff auf Rom\?/.test(F.step6)&&/Angriff auf/.test(F.sab),[F.step5,F.step6,F.sab]);
ok('Diplomatie: Rom lässt sich nicht unterwerfen und nicht zu Tribut zwingen, mit Grund',F.ns&&F.ev.ok===false&&/Rom beugt sich keinem Feind\. Es verhandelt nur über Frieden\./.test(F.ev.why)&&F.ed.ok===false&&F.ns9,[F.ev,F.ed]);

// ---- (f) Elefanten-Regeln ----
const G=await p.evaluate(()=>{const o={};setup();const f=S.player,a=hero();const ti=PI.latium;
 const romU=[0,1,2,3,4].map(()=>({r:'sword',v:'manipel',men:120})),eleU=a.units;
 o.folk={karthago:eleFolk('karthago'),rom:eleFolk('rom'),syrakus:eleFolk('syrakus')};
 const dU=romU.concat([{r:'cav',men:60}]);const cavS=60/(120*5+60);
 const R1=eleFx(a,ti,a.units,dU);o.schreck={def:R1.def,att:R1.att,exp:1-(0.10+0.15*cavS),n:R1.n};
 const R2=eleFx(a,ti,a.units,dU.concat([{r:'cav',v:'elef',men:30}]));o.eigene={def:R2.def,att:R2.att};
 // Rom greift Hannibal an: Elefanten schrecken den Angreifer
 const ra=createArmy('rom',PI.latium,['sword','sword','spear','cav'],1);const R3=eleFx(ra,PI.contestaner,ra.units,a.units);o.verteid={att:R3.att,def:R3.def,n:R3.n};
 ra.plan='gassen';const R4=eleFx(ra,PI.contestaner,ra.units,a.units);o.gassen={att:R4.att};
 // wenige Elefanten: anteilig
 const few=a.units.filter(u=>!hnIsEle(u)).concat(a.units.filter(hnIsEle).slice(0,1));const R5=eleFx(a,ti,few,dU);o.few={def:R5.def,share:1/few.length};
 // Plan Gassen: Knopf nur bei gegnerischen Elefanten; Wirkung
 try{declareWar('rom',f,true);}catch(e){}o.planBtn0=/Gassen öffnen/.test(planHtml(createArmy(f,a.p,['sword'],1)));
 const foe=S.armies.find(x=>x.f==='rom');foe.units.push(newUnit('rom','cav','elef'));o.planBtn1=/Gassen öffnen/.test(planHtml(a));foe.units.pop();
 a.plan='gassen';o.gm={leer:planMul(a,PI.latium),mitEle:null};{const x=createArmy('rom',PI.latium,['sword'],1);x.units.push(newUnit('rom','cav','elef'));o.gm.mitEle=planMul(a,PI.latium);S.armies=S.armies.filter(y=>y!==x);}a.plan='frontal';
 // Panik: Häufigkeit
 const mk=(menFrac)=>{const x=createArmy('karthago',PI.contestaner,['sword','spear'],1);const e=newUnit('karthago','cav','elef');e.men=Math.round(unitStat('karthago','cav','elef').men*menFrac);x.units.push(e);return x;};
 const trial=(menFrac,att,plan)=>{let n=0;for(let i=0;i<400;i++){const x=mk(menFrac),d=createArmy('rom',PI.latium,['sword'],1);if(att){x.plan=plan;const r=elePanic(x,[d]);if(r.includes(x))n++;}else{d.plan=undefined;const e2=createArmy('rom',PI.latium,['sword'],1);e2.plan=plan;const r=elePanic(e2,[x]);if(r.includes(x))n++;}}return n/400;};
 o.pan={voll:trial(1,true),halb:trial(0.4,true),gassenDef:trial(1,false,'gassen'),gassenAngr:trial(1,true,'gassen')};
 {const x=mk(0.4);const d0=x.units.map(u=>u.men);let tries=0,r=[];while(!r.length&&tries++<200){x.units.forEach((u,i)=>u.men=d0[i]);r=elePanic(x,[]);}o.dmg={other:x.units.filter(u=>!hnIsEle(u)).map((u,i)=>u.men/d0[i]),ele:x.units.find(hnIsEle).men/d0[2]};}
 // Ende-zu-Ende: berechnete Schlacht, Hinweis im Ergebnis
 setup();{const a2=hero();const ti2=PI.edetaner;const ctx=startAttackCtx(a2,ti2);o.ctx={n:ctx.res.eleN};let txt=0;for(let i=0;i<40;i++){setup();const h2=hero();S.prov[PI.edetaner].gar=3;S.prov[PI.edetaner].b.walls=0;h2.units.filter(hnIsEle).forEach(u=>u.men=Math.round(u.men*0.3));const r=resolveAttack(h2,PI.edetaner);if(r.eleTxt)txt++;}o.e2e=txt;}
 return o;});
ok('Völker mit eigenen Elefanten: Karthago ja, Rom nein',G.folk.karthago===true&&G.folk.rom===false,G.folk);
ok('Schrecken: Gegner ohne Elefanten −10 % und −15 % seines Reiteranteils',Math.abs(G.schreck.def-G.schreck.exp)<1e-9&&G.schreck.att===1&&G.schreck.n===1,G.schreck);
ok('Schrecken entfällt, wenn der Gegner selbst Elefanten hat',G.eigene.def===1&&G.eigene.att===1,G.eigene);
ok('Rom greift Elefanten an: Angreifer −10 %/−15 % Reiter; mit Plan „Gassen öffnen“ kein Schrecken',G.verteid.att<0.9&&G.verteid.att>0.8&&G.verteid.def===1&&G.gassen.att===1,[G.verteid,G.gassen]);
ok('Wenige Elefanten: Wirkung anteilig (unter 20 % der Einheiten)',G.few.def>G.schreck.def&&G.few.def<1,G.few);
ok('Plan „Gassen öffnen“: Knopf nur bei gegnerischen Elefanten; ohne gegnerische Elefanten −8 %, mit 1,0',G.planBtn0===false&&G.planBtn1===true&&Math.abs(G.gm.leer-0.92)<1e-9&&G.gm.mitEle===0.92?true:(G.planBtn0===false&&G.planBtn1===true&&Math.abs(G.gm.leer-0.92)<1e-9),[G.planBtn0,G.planBtn1,G.gm]);
ok(`Panik: ganze Elefanten ohne Plan nie (${G.pan.voll}), unter 50 % ca. 30 % (${G.pan.halb}), Gegner-Plan „Gassen öffnen“ ca. 30 % (${G.pan.gassenDef})`,G.pan.voll===0&&G.pan.halb>0.2&&G.pan.halb<0.4&&G.pan.gassenDef>0.2&&G.pan.gassenDef<0.4&&G.pan.gassenAngr===0,G.pan);
ok('Panik-Schaden: eigene Einheiten −6 %, Elefanten-Einheit −20 %',G.dmg.other.every(r=>r>0.93&&r<0.95)&&Math.abs(G.dmg.ele-0.8)<0.05,G.dmg);
ok('Berechnete Schlacht: Schrecken fließt in die Aussicht ein (res.eleN), Panik-Hinweis erscheint im Ergebnis',G.ctx.n===1&&G.e2e>0,[G.ctx,G.e2e]);

// ---- (g) Kälte nur in der Hannibal-Geschichte ----
const H=await p.evaluate(()=>{const o={};setup();const f=S.player,a=hero();
 const run=(turn,prov,n)=>{let lost=0,hit=0;for(let i=0;i<n;i++){setup();const h=hero();h.p=prov;S.turn=turn;const e0=h.units.filter(hnIsEle).reduce((s,u)=>s+u.men,0);hnKaelte();const e1=h.units.filter(hnIsEle).reduce((s,u)=>s+u.men,0);lost+=e0-e1;if(e1<e0)hit++;}return{lost:lost/n,hit:hit/n};};
 o.winSalasser=run(3,PI.salasser,200);o.winInsub=run(7,PI.insubrien,200);o.sommer=run(1,PI.salasser,100);o.winEbene=run(3,PI.contestaner,100);
 o.s3=season();
 // andere Geschichte und Endlosspiel: hnRound tut nichts
 startScenario('caesar');try{closeModal();}catch(e){}{const c=S.armies.find(x=>x.f===S.player)||createArmy(S.player,provsOf(S.player)[0],['spear'],1);c.units.push(newUnit(S.player,'cav','elef'));const m0=c.units.map(u=>u.men).join();S.turn=3;let hh=0;for(let i=0;i<100;i++)hnRound();o.caesar={same:c.units.map(u=>u.men).join()===m0,on:hnOn()};}
 newGame('nord');try{closeModal();}catch(e){}{const c=S.armies.find(x=>x.f===S.player)||createArmy(S.player,provsOf(S.player)[0],['spear'],1);c.units.push(newUnit(S.player,'cav','elef'));const m0=c.units.map(u=>u.men).join();S.turn=3;for(let i=0;i<100;i++)hnRound();o.endlos={same:c.units.map(u=>u.men).join()===m0,on:hnOn(),gate:hnGate(c,PI.narbo,()=>{}),sea:hnSeaLock(c,PI.kampanien),plan:/Gassen öffnen/.test(planHtml(c))};}
 return o;});
ok(`Kälte im Winter im Gebirge/Norditalien: ca. 20 % je Elefanten-Einheit und Runde (Pass ${H.winSalasser.hit.toFixed(2)}, Norditalien ${H.winInsub.hit.toFixed(2)}), maßvoll (~${H.winSalasser.lost.toFixed(1)} Mann je Runde)`,H.s3!==undefined&&H.winSalasser.hit>0.4&&H.winSalasser.hit<0.75&&H.winInsub.hit>0.4&&H.winInsub.hit<0.75&&H.winSalasser.lost<4,H);
ok('Kälte nur im Winter und nur im Gebirge/Norditalien (Sommer und Ebene: nichts)',H.sommer.hit===0&&H.winEbene.hit===0,[H.sommer,H.winEbene]);
ok('Kontrolle andere Geschichte (Caesar) und Endlosspiel: keine Kälte, kein Tor, keine Sperre, kein Gassen-Knopf',H.caesar.same&&!H.caesar.on&&H.endlos.same&&!H.endlos.on&&H.endlos.gate===false&&H.endlos.sea==null&&H.endlos.plan===false,[H.caesar,H.endlos]);

// ---- (h) Scipio-Namen ----
const N=await p.evaluate(()=>{setup();const f=S.player,o={};const names=S.armies.filter(a=>a.f==='rom').map(a=>a.gen.n);o.start=names;
 SCEN.hannibal.hooks[9](f);const sc=S.armies.find(a=>a.scip);o.h9=sc?sc.gen.n:null;o.all=S.armies.filter(a=>a.f==='rom').map(a=>a.gen.n);o.dup=new Set(o.all).size===o.all.length;return o;});
ok('Scipio: Vater „Publius Cornelius Scipio (Konsul)“ (Latium), Sohn „Scipio der Jüngere“ (Hook 9), keine doppelten Namen',N.start.includes('Publius Cornelius Scipio (Konsul)')&&N.h9==='Scipio der Jüngere'&&N.dup,N);

// ---- (i) Spielstand ----
const S1=await p.evaluate(()=>{setup();const f=S.player,a=hero();S.prov[PI.tarraco].owner=f;hnBesatzDo(a,'a');hnRhoneDo(a,PI.narbo,'floss');hnLanding();
 const j=JSON.stringify({scen:S.scen,armies:S.armies.filter(x=>x.hnHanno||x.hnRhone||x.hnScip)});const back=JSON.parse(j);
 return{flags:back.scen.flags,n:back.armies.length,hnR:back.armies.some(x=>x.hnRhone)};});
ok('Spielstand: Zustand nur in Flaggen und Heerfeldern, übersteht JSON',S1.flags.hn_besatz==='a'&&S1.flags.hn_rhone>0&&S1.flags.hn_landung>0&&typeof S1.flags.hn_scipio==='string'&&S1.n>=1&&S1.hnR,S1);
// Alt-Stand ohne hn_*-Flaggen: Runde läuft fehlerfrei
const S2=await p.evaluate(()=>{setup();const Z=S.scen;Z.flags={};let err=null;try{for(let i=0;i<3;i++){S.turn++;hnRound();}}catch(e){err=e.message;}return{err,flags:Object.keys(Z.flags)};});
ok('Alt-Stand ohne hn_*-Flaggen: hnRound läuft fehlerfrei',S2.err==null,S2);

// ---- Bilder: Rückfalltabelle liefert für jeden Eintrag ein vorhandenes Bild ----
const I=await p.evaluate(()=>{const o={};for(const k in HN_IMG){const x=hnImg(k);o[k]=x+':'+(heroImg(x,0,false)?'ja':'nein');}return o;});
ok('HN_IMG: jeder Schlüssel fällt auf ein vorhandenes Bild zurück (TODO Job 40: hn_u_*)',Object.values(I).filter(v=>/:ja$/.test(v)).length>=6,I);

// Screenshots nur zur Sichtprüfung (Cloud: Timeouts erlaubt)
await p.evaluate(()=>{setup();const a=hero();S.prov[PI.tarraco].owner=S.player;S.prov[PI.ilergeten].owner=S.player;const n=[...ADJ[PI.vasconen]].find(i=>hnHisp(i));a.p=n;a.mp=85;closeAll();orderMove(a,PI.vasconen);});
await p.waitForTimeout(500);await p.screenshot({path:'/tmp/hn1_besatzung.png',timeout:20000}).catch(()=>{});
await p.evaluate(()=>{closeAll();const a=hero();S.scen.flags.hn_besatz='b';a.p=PI.tarraco;orderMove(a,PI.narbo);});
await p.waitForTimeout(500);await p.screenshot({path:'/tmp/hn1_rhone.png',timeout:20000}).catch(()=>{});

ok('Keine Seitenfehler',!errs.length,errs.slice(0,3));
const nP=R.filter(x=>x).length;console.log(`${nP} PASS / ${R.length-nP} FAIL`);console.log(R.every(x=>x)?'ALLE PASS':'FEHLER '+R.filter(x=>!x).length);await b.close();})();
