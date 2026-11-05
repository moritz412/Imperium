// node hn3_t.js <html> [port] – H3 (v236): Hannibal Paket 3, Akt III Italien. Cannae-Drehbuch (Varro und Paullus, 14 Einheiten, Plan Umfassung +25 %),
// Sieg/Niederlage bei Cannae, Fabius-Verhalten (weicht bei Verhältnis < 1,5 aus, greift kleine Heere und abgefallene Städte an, Marcellus greift an, verbrannte Erde),
// Ochsen mit Fackeln, Winterlager in Capua mit Verweichlichung, Rat von Karthago (Gunst: Regeln, Verstärkung ab 60/80, Warnung 35, Abberufung unter 25),
// Messungen: Cannae-Zeitpunkt im Spielerlauf, Provinz-Pingpong über 30 Runden mit Bot-Hannibal, Bilanz mit/ohne Abfall. Das echte iPad ist nicht getestet.
// Umgebung: HN3_SKIP=PL,PP,BI überspringt die langen Läufe.
const {chromium}=require('playwright');
const FILE=process.argv[2]||require('path').join(__dirname,'..','imperium.html'),PORT=process.argv[3]||'8772';
(async()=>{const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:process.env.PW_GPU?[]:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const R=[];const ok=(n,c,i='')=>{R.push(!!c);console.log((c?'PASS ':'FAIL ')+n+(i!==''?'  '+JSON.stringify(i):''));};
const fs=require('fs');const SHOT=process.env.HN3_SHOT||'/tmp/claude-0/-home-claude/4f60f6a0-fa46-5154-9e84-95c0bd1121bd/scratchpad';
const SKIP=(process.env.HN3_SKIP||'').split(',');
const ctx=await b.newContext({viewport:{width:1024,height:768},hasTouch:true,isMobile:true});const p=await ctx.newPage();const errs=[];
p.on('pageerror',e=>errs.push('PAGE '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|WebGL|GPU stall/.test(m.text()))errs.push('CON '+m.text().slice(0,200));});
await p.addInitScript(()=>{try{localStorage.setItem('imperium.gfx',JSON.stringify({q:'leicht'}));}catch(e){}});
await p.route(/cdnjs/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));
await p.route(/fonts\.g/,r=>r.abort());await p.route(/\.html$/,r=>r.fulfill({body:fs.readFileSync(FILE),contentType:'text/html; charset=utf-8'}));
await p.goto(`http://localhost:${PORT}/imperium.html`,{timeout:300000});await p.waitForFunction(()=>document.getElementById('loading').hidden,null,{timeout:300000});
await p.waitForFunction(()=>!document.querySelector('#loading[data-gate]'),null,{timeout:120000}).catch(()=>{});
await p.waitForTimeout(1500);
await p.evaluate(()=>{window.playCine=(o,d)=>{d&&d();};
 window.setup=()=>{startScenario('hannibal');try{closeModal();}catch(e){}storyRound();S.q=[];const s=S.story[S.player];if(s)s.q=[];S.scen.flags.hn_besatz='b';S.scen.flags.hn_rhone=1;S.scen.flags.hn_landung=1;if(!atWar(S.player,'rom'))try{declareWar('rom',S.player,true);}catch(e){}};
 window.mTxt=()=>$('#modal').hidden?'':$('#dialog').innerText;
 window.closeAll=()=>{try{closeModal();}catch(e){}};
 window.gotoStep=i=>{const f=S.player,s=S.story[f];s.i=i;s.t0=S.turn;s.done=false;s.end=false;s.w0=stW(f);s.g=stResolve(f,stCh(f).steps[i].g);return s;};
 window.hero=()=>S.armies.find(x=>x.id===S.scen.hero);
 window.popEv=()=>stEvents(S.player);
 window.evIds=()=>popEv().map(x=>x.E.id);
 window.logs=(n0)=>S.log.slice(n0).map(e=>e.t);
 // Hannibal steht mit voller Stärke in Provinz id (Besitz: Karthago), Zug frei
 window.heroAt=(id,own)=>{const h=hero(),pi=PI[id];if(own)S.prov[pi].owner=S.player;h.p=pi;h.pos=null;h.goal=null;h.mp=85;h.st=null;h.hnPass=undefined;delete h.hnPass;for(const u of h.units)u.men=unitStat(S.player,u.r,u.v).men;return h;};
 window.romAt=(id,units,gen)=>{const a=scenArmy('rom',PI[id],units,gen||null);a.mp=85;return a;};
 window.RU=n=>{const L=[];for(let i=0;i<n;i++)L.push(i%3===2?['spear','socii']:i%7===6?['cav']:['sword','manipel']);return L;};
 window.clearRom=()=>{for(const a of S.armies)if(a.f==='rom'&&!a.boat)a.units=[];removeEmpty();};
 window.clearMine=()=>{for(const a of S.armies)if(a.f===S.player&&a.id!==S.scen.hero)a.units=[];removeEmpty();};
 window.pcnt=(f)=>provsOf(f).length;
 window.botRound=()=>{const f=S.player,h=hero();if(!h||h.hnPass||!h.units.length)return'none';h.mp=maxMP(h);let did='stay';
  let best=null;for(const n of ADJ[h.p]){if(isSeaLink(h.p,n)||!isAct(n))continue;const o=S.prov[n].owner;if(o!=='rom')continue;let q=0;try{const cx=startAttackCtx(h,n);q=cx.res.att/Math.max(1,cx.res.def);}catch(e){continue;}if(!best||q>best.q)best={n,q};}
  if(best&&best.q>=1.1&&!h.st){try{const res=resolveAttack(h,best.n);battleLog(res);did='attack';}catch(e){}}
  else if(!best){
   const tg=new Set(S.prov.map((P,i)=>i).filter(i=>S.prov[i].owner==='rom'&&isAct(i)&&HN_ITALY.has(hnReg(i))));const prev={[h.p]:-1},q=[h.p];let hit=null;
   while(q.length){const c=q.shift();if(tg.has(c)){hit=c;break;}for(const n of ADJ[c]){if(prev[n]!==undefined||!isAct(n)||isSeaLink(c,n))continue;prev[n]=c;q.push(n);}}
   if(hit!=null){let k=hit;while(prev[k]!==h.p&&prev[k]!==-1)k=prev[k];if(S.prov[k].owner===f){try{marchTo(h,k);did='march';}catch(e){}}}}
  if(S.fac[f].gold>400)for(const n of ADJ[h.p]){try{if(canDefect(f,n)&&tryDefect(f,n)){did+='+defect';break;}}catch(e){}}
  return did;};
 window.bigClose=()=>{try{closeModal();}catch(e){}try{S.q=[];}catch(e){}};
 window.reachUp=(id)=>{for(const i of ['taurini','insubrien','cenomanen','aemilia'])if(PI[i]!=null)S.prov[PI[i]].owner=S.player;};
});

// ---- (a) Cannae-Drehbuch: erst mit Schritt 7 (Index 6), Riesenheer in Apulien, marschiert auf Hannibal ----
const A=await p.evaluate(()=>{const o={};setup();const f=S.player,F=hnFl();
 gotoStep(5);for(let i=0;i<3;i++){S.turn++;hnRound();}o.before=S.armies.filter(x=>x.hnCan).length;o.fBefore=F.hn_can==null;
 gotoStep(6);const h=heroAt('taurini',true);const hp=h.p;S.turn++;hnRound();
 const ca=S.armies.filter(x=>x.hnCan&&x.units.length);o.n=ca.length;o.units=ca.reduce((s,x)=>s+x.units.length,0);o.at=ca.map(x=>PROV_DEF[x.p].id);o.gens=ca.map(x=>x.gen.n);o.names=ca.map(x=>x.name);o.hold=ca.every(x=>x.hold>=S.turn);
 o.flag=F.hn_can;o.q=evIds();o.war=atWar(S.player,'rom');
 o.target=stTarget(S.player,S.story[S.player].g)!=null;o.goal=stGoalText(S.story[S.player].g);o.prog=stProg(S.player,S.story[S.player].g,S.story[S.player]);
 // Marsch: höchstens eine Provinz je Runde, nähert sich Hannibal
 const d0=hnDist(hp);const tr=[];o.dist0=ca.map(x=>d0[x.p]);
 for(let i=0;i<10;i++){S.turn++;const h2=hero();h2.mp=85;h2.p=hp;hnRound();tr.push(ca.map(x=>d0[x.p]).join('/'));if(S.armies.some(x=>x.id===ca[0].id&&x.p===hp)||!S.armies.some(x=>x.hnCan&&x.units.length))break;}
 o.trace=tr;o.lg=logs(0).filter(x=>/Cannae|Paullus|Varro|greift|wehrt/.test(x)).slice(-6);
 return o;});
ok('Vor Schritt 7 gibt es kein Riesenheer (Cannae nicht vor dem Schritt)',A.before===0&&A.fBefore,[A.before]);
ok('Schritt 7: Varro und Paullus erscheinen in Apulien mit 12–14 Einheiten, Krieg mit Rom, Fenster liegt bereit',A.n===2&&A.units>=12&&A.units<=14&&A.at.every(x=>x==='apulien')&&A.flag==='lauf'&&A.war&&A.q.includes('hn_cannae')&&A.hold,A);
ok('Ziel: „Das Heer von Cannae schlagen“ (Fortschritt 0 von 2), Karte zeigt auf das Heer',/Cannae schlagen/.test(A.goal)&&A.prog[0]===0&&A.prog[1]===2&&A.target,[A.goal.slice(0,60),A.prog]);
ok('Das Riesenheer marschiert auf Hannibal zu (Abstand sinkt, nie mehr als eine Provinz je Runde)',A.trace.length>=2&&A.trace.every((x,i)=>i===0||x.split('/').every((v,k)=>+v>=+A.trace[i-1].split('/')[k]-1)),A.trace);
ok('Ohne Hannibal-Feindberührung bleibt es dabei, kein Fehler',errs.length===0,errs.slice(0,2));

// ---- (b) Plan Umfassung bei Cannae: +25 % (Angreifer und Verteidiger), sonst unverändert ----
const B=await p.evaluate(()=>{const o={};setup();const f=S.player;gotoStep(6);const h=heroAt('taurini',true);S.turn++;hnRound();
 const r=S.armies.find(x=>x.hnCan);const ti=r.p;
 h.plan='umfassung';o.att=planMul(h,ti);h.plan='frontal';o.front=planMul(h,ti);h.plan='umfassung';o.noHit=planMul(h,PI.taurini);
 o.def=hnLauerMul(h,PI.taurini,false,r);o.defNoFoe=hnLauerMul(h,PI.taurini,false,null);o.defAtt=hnLauerMul(h,ti,true,null);
 const cavShare=h.units.filter(u=>u.r==='cav').length/h.units.length;o.cav=cavShare;
 // ohne Reiterei gilt der Sonderwert trotzdem (Sonderwert), außerhalb von Schritt 7 nicht
 const keep=h.units.slice();h.units=h.units.filter(u=>u.r!=='cav');o.noCav=planMul(h,ti);h.units=keep;
 gotoStep(7);o.step7=planMul(h,ti);gotoStep(6);
 const fl=hnFl();fl.hn_can='won';o.won=planMul(h,ti);fl.hn_can='lauf';
 o.note=/Varro und Paullus/.test(planHtml(h));gotoStep(5);o.noteOff=/Varro und Paullus/.test(planHtml(h));gotoStep(6);
 // Rechnung: Hannibal greift Paullus an (Provinz-Schlacht), mit und ohne Umfassung
 const run=(plan,n)=>{let w=0,lau=0;for(let i=0;i<n;i++){setup();gotoStep(6);const hh=heroAt('taurini',true);S.turn++;hnRound();
   const rr=S.armies.find(x=>x.hnCan&&x.gen.n==='Lucius Aemilius Paullus');S.armies.filter(x=>x.hnCan&&x!==rr).forEach(x=>x.units=[]);rr.p=PI.ligurien;rr.hold=999;S.prov[PI.ligurien].owner='rom';
   hh.p=PI.taurini;hh.plan=plan;hh.mp=85;for(const u of hh.units)u.men=Math.round(u.men*0.6);const res=resolveAttack(hh,PI.ligurien);if(res.win)w++;if(res.lauer)lau++;}return{w:w/n,lau:lau/n};};
 o.fr=run('frontal',60);o.um=run('umfassung',60);
 return o;});
ok('Umfassung bei Cannae: Angreifer +25 % (1,25), Verteidiger +25 %, ohne Cannae-Gegner kein Sonderwert',B.att===1.25&&B.def===1.25&&B.front===1&&B.defNoFoe===1&&B.defAtt===1&&B.noHit===(B.cav>=0.3?1.15:0.9),B);
ok('Sonderwert gilt auch ohne Reiterei; nicht in Schritt 8, nicht nach dem Sieg; Hinweis am Plan nur in Schritt 7',B.noCav===1.25&&B.step7===(B.cav>=0.3?1.15:0.9)&&B.won===B.step7&&B.note&&!B.noteOff,[B.noCav,B.step7,B.won,B.note,B.noteOff]);
ok('Berechnete Schlacht: Umfassung gewinnt häufiger als Frontal und meldet „Umfassung +25 %“',B.um.w>B.fr.w&&B.um.lau===1&&B.fr.lau===0,[B.fr,B.um]);

// ---- (c) Cannae: Sieg (beide Heere geschlagen), Niederlage (Fabius-Phase früher, ein Viertel Belohnung) ----
const C=await p.evaluate(()=>{const o={};
 // Sieg
 setup();let f=S.player,F=hnFl();gotoStep(6);let h=heroAt('taurini',true);S.turn++;hnRound();
 const ca=S.armies.filter(x=>x.hnCan);o.ids=ca.length;const g0=S.fac[f].gold;
 const hit=(r)=>{for(const u of r.units)u.men=Math.max(2,Math.round(u.men*0.05));r.p=PI.ligurien;S.prov[PI.ligurien].owner='rom';h.p=PI.taurini;h.mp=85;return resolveAttack(h,PI.ligurien);};
 const r1=hit(ca[0]);o.w1=r1.win;S.turn++;hnRound();o.prog1=stProg(f,S.story[f].g,S.story[f]);o.flag1=F.hn_can;
 const r2=hit(ca[1]);o.w2=r2.win;S.turn++;hnRound();o.prog2=stProg(f,S.story[f].g,S.story[f]);o.flag2=F.hn_can;
 o.q=evIds();const gb=S.fac[f].gold;storyRound();o.step=S.story[f].i;o.dg=S.fac[f].gold-gb;o.q2=evIds();
 S.turn++;hnRound();o.fabAfter=F.hn_fab!=null;
 // Niederlage (Versuche, bis Rom gewinnt und Hannibals Heer überlebt)
 for(let k=0;k<40;k++){setup();f=S.player;F=hnFl();gotoStep(6);h=heroAt('taurini',true);S.turn++;hnRound();
  const ca2=S.armies.filter(x=>x.hnCan);const rr=ca2[0];ca2[1].hold=999;rr.p=PI.ligurien;S.prov[PI.ligurien].owner=f;h.p=PI.ligurien;for(const u of h.units)u.men=Math.round(u.men*0.45);
  for(let q=0;q<3;q++)rr.units.push(newUnit('rom','sword','manipel'));
  const gunst0=F.hn_gunst;rr.mp=85;const lr=resolveAttack(rr,PI.ligurien);o.tries=k+1;if(!lr.win)continue;
  o.lWin=lr.win;o.lFlag=F.hn_can;o.lHeroAlive=!!hero();
  S.turn++;hnRound();o.lFab=F.hn_fab!=null;o.lGunst=gunst0-F.hn_gunst;o.lHold=ca2.every(x=>!x.hnCan);
  o.lQ=evIds();const gb2=S.fac[f].gold;storyRound();o.lStep=S.story[f].i;o.lDg=S.fac[f].gold-gb2;break;}
 return o;});
ok('Cannae-Sieg: erst ein Heer geschlagen (1 von 2), nach dem zweiten Ziel erfüllt, Fenster, Schritt 8 beginnt, Belohnung',C.w1&&C.prog1[0]===1&&C.flag1==='lauf'&&C.w2&&C.prog2[0]===2&&C.flag2==='won'&&C.step===7&&C.dg>0&&C.q.includes('hn_cannae_won'),C);
ok('Nach dem Sieg beginnt die Fabius-Phase mit dem Schritt „Capua“',C.fabAfter);
ok('Cannae-Niederlage: Flagge „lost“, Gunst −15, Fabius-Phase beginnt früher, Akt geht weiter (Schritt 8), nur ein Viertel der Belohnung',C.lWin&&C.lFlag==='lost'&&C.lFab&&C.lGunst===15&&C.lHold&&C.lStep===7&&C.lQ.includes('hn_cannae_lost')&&Math.abs(C.lDg*4-C.dg)<=4,[C.lWin,C.lFlag,C.lFab,C.lGunst,C.lStep,C.lDg,C.dg,C.lQ]);

// ---- (d) Fabius-Verhalten ----
const D=await p.evaluate(()=>{const o={};
 // Phase beginnt mit Schritt 8: Rom-Heere in Italien werden gehalten, Marcellus erscheint, Fenster erklärt die Taktik
 setup();let f=S.player,F=hnFl();gotoStep(7);clearRom();let h=heroAt('kampanien',true);const pre=S.armies.filter(x=>x.f==='rom').length;
 S.turn++;hnRound();o.fab=F.hn_fab!=null;const marc=S.armies.find(x=>x.hnMarc);o.marc=!!marc&&marc.gen.n==='Marcus Claudius Marcellus';o.q=evIds();
 const R=romAt('apulien',RU(6),'Fabius Test');S.turn++;hnRound();o.hold=R.hold>=S.turn&&R.hnFab===1;
 // Vor Schritt 8 (Schritt 7 Cannae noch nicht gefallen) kein Fabius-Zustand und keine Haltung
 setup();gotoStep(5);const R5=romAt('samnium',RU(4),'Vor');S.turn++;hnRound();o.pre=R5.hold==null&&!hnFl().hn_fab;
 // 1. Verhältnis < 1,5: nicht angreifen, ausweichen, Meldung mit Grund
 const prep=()=>{setup();f=S.player;F=hnFl();gotoStep(7);clearRom();h=heroAt('kampanien',true);S.turn++;hnRound();clearRom();clearMine();h=heroAt('kampanien',true);S.prov[PI.kampanien].gar=20;return h;};
 prep();const r1=romAt('samnium',RU(6),'Fabius Eins');o.ratio1=hnRatio(r1,h);const m0=hnMen(h),l0=S.log.length;S.turn++;hnRound();
 o.m1=hnMen(h)===m0;o.p1=PROV_DEF[r1.p].id;o.msg1=logs(l0).find(x=>/Fabius weicht aus/.test(x))||'';o.att1=logs(l0).some(x=>/greift (an|Kampanien)/.test(x));
 // 2. Verhältnis >= 1,5: greift an
 prep();for(const u of h.units)u.men=Math.round(u.men*0.3);const r2=romAt('samnium',RU(10),'Fabius Zwei');o.ratio2=hnRatio(r2,h);const l2=S.log.length;S.turn++;hnRound();
 o.att2=logs(l2).some(x=>/stark genug/.test(x))&&logs(l2).some(x=>/Kampanien/.test(x));
 // 3. kleine karthagische Heere werden angegriffen (nicht das Hauptheer)
 prep();const r3=romAt('apulien',RU(8),'Fabius Drei');const sm=createArmy(f,PI.daunien,['spear','sword'],1);sm.name='Lockvogel';sm.mp=85;const l3=S.log.length;S.turn++;hnRound();
 o.att3=logs(l3).some(x=>/kleine Heer „Lockvogel“/.test(x));o.heroSafe3=!logs(l3).some(x=>/greift an: Rom ist stark/.test(x));
 // 4. abgefallene Städte: Angriff mit Pause, höchstens zweimal; andere Provinzen des Spielers nicht
 prep();const r4=romAt('daunien',RU(10),'Fabius Vier');S.prov[PI.tarent].owner=f;S.prov[PI.tarent].gar=1;F.hn_abf=[PI.tarent];S.prov[PI.lukanien].owner=f;S.prov[PI.lukanien].gar=1;clearMine();
 r4.hnCool=0;const l4=S.log.length;S.turn++;hnRound();o.abf1=(F.hn_abfN||{})[PI.tarent]||0;o.cd=(F.hn_abfCd||{})[PI.tarent]>S.turn;o.abfMsg=logs(l4).some(x=>/Tarent|Taras/.test(x));
 const luk=S.prov[PI.lukanien].owner===f;
 S.turn++;hnRound();o.abf2=(F.hn_abfN||{})[PI.tarent]||0;o.luk=luk&&S.prov[PI.lukanien].owner===f;
 // Köder: steht Hannibal neben der abgefallenen Stadt, lohnt der Angriff nicht (Verteidigungshilfe)
 prep();const r8=romAt('samnium',RU(6),'Fabius Acht');S.prov[PI.hirpinien].owner=f;S.prov[PI.hirpinien].gar=1;F.hn_abf=[PI.hirpinien];clearMine();r8.hnCool=0;S.turn++;hnRound();o.koeder=(F.hn_abfN||{})[PI.hirpinien]||0;
 // 5. Marcellus greift an, auch bei Verhältnis < 1,5
 prep();const mq=S.armies.find(x=>x.hnMarc);const mm=mq||romAt('samnium',RU(6),'Marcellus');if(!mq){mm.hnMarc=1;mm.gen.n='Marcus Claudius Marcellus';}else{mm.p=PI.samnium;}
 let fr=1;while(hnRatio(mm,h)<0.8&&fr>0.2){fr-=0.05;for(const u of h.units)u.men=Math.round(unitStat(f,u.r,u.v).men*fr);}
 o.ratioM=hnRatio(mm,h);mm.hnCool=0;const l5=S.log.length;S.turn++;hnRound();o.attM=logs(l5).some(x=>/Marcellus, das Schwert Roms/.test(x));
 // Kontrolle: dasselbe Verhältnis bei einem gewöhnlichen Heer greift nicht an
 prep();const r6=romAt('samnium',RU(6),'Fabius Sechs');for(const u of h.units)u.men=Math.round(unitStat(f,u.r,u.v).men*0.6);o.ratio6=hnRatio(r6,h);const l6=S.log.length;S.turn++;hnRound();o.att6=logs(l6).some(x=>/greift an: Rom ist/.test(x));
 // 6. Verbrannte Erde neben Hannibal
 prep();const r7=romAt('apulien',RU(6),'Fabius Sieben');const l7=S.log.length;S.turn++;hnRound();
 const burnt=[...ADJ[PI.kampanien]].filter(n=>S.prov[n].dv&&S.prov[n].dv.by==='rom');o.burnt=burnt.map(n=>PROV_DEF[n].id);o.burnMsg=logs(l7).some(x=>/verbrennt die Felder/.test(x));o.sev=burnt.length&&dvSev(burnt[0])>0;
 // Hunger in verbrannter Erde (Hannibal steht in Roms Land), kein Hunger mit Winterlager
 prep();clearRom();S.prov[PI.samnium].owner='rom';hnBurn(PI.samnium);h=heroAt('samnium',false);const mh=hnMen(h);S.turn++;hnRound();o.hunger=hnMen(h)<mh;
 // Kontrolle: Endlosspiel / Caesar: nichts passiert
 startScenario('caesar');try{closeModal();}catch(e){}const cr=S.armies.find(x=>x.f==='rom')||S.armies[0];hnRound();hnFabRound();o.caesar=cr.hnFab==null&&cr.hold==null;
 return o;});
ok('Fabius-Phase beginnt mit Schritt 8: Marcellus erscheint, Rom-Heere stehen unter dem Skript (a.hold), Fenster erklärt die Taktik; davor nichts',D.fab&&D.marc&&D.q.includes('hn_fabius')&&D.hold&&D.pre,D);
ok('Verhältnis < 1,5: kein Angriff auf Hannibals Heer, das Heer weicht aus, Meldung „Fabius weicht aus …“ nennt den Grund',D.ratio1<1.5&&D.m1&&D.p1!=='samnium'&&/Fabius weicht aus/.test(D.msg1)&&/nötig 1,5/.test(D.msg1)&&!D.att1,[D.ratio1,D.p1,D.msg1]);
ok('Verhältnis ≥ 1,5: Rom greift an (mit Meldung)',D.ratio2>=1.5&&D.att2,[D.ratio2,D.att2]);
ok('Kleine karthagische Heere (Lockvogel) werden angegriffen, nicht Hannibals Hauptheer',D.att3&&D.heroSafe3);
ok('Abgefallene Städte werden angegriffen (einmal, dann Pause); andere Provinzen des Spielers nicht; neben Hannibal (Köder) lohnt es nicht',D.abf1===1&&D.cd&&D.abf2===1&&D.luk&&D.koeder===0,[D.abf1,D.cd,D.abf2,D.luk,D.koeder]);
ok('Marcellus greift bei Verhältnis < 1,5 an, ein gewöhnliches Heer mit gleichem Verhältnis nicht',D.ratioM>=0.7&&D.ratioM<1.5&&D.attM&&D.ratio6<1.5&&!D.att6,[D.ratioM,D.attM,D.ratio6,D.att6]);
ok('Verbrannte Erde: Provinz neben Hannibal wird verwüstet (Verwüstung des Raubzug-Systems), Meldung; Heer in verbrannter Erde hungert',D.burnt.length>=1&&D.burnMsg&&D.sev&&D.hunger,[D.burnt,D.burnMsg,D.sev,D.hunger]);
ok('Caesar-Geschichte: kein Fabius-Zustand',D.caesar);

// ---- (e) Ochsen mit Fackeln: Ausbruch aus dem Kessel ----
const E=await p.evaluate(()=>{const o={};
 const prep=()=>{setup();const f=S.player;gotoStep(7);clearRom();clearMine();let h=heroAt('kampanien',true);S.turn++;hnRound();clearRom();clearMine();h=heroAt('kampanien',true);return h;};
 let h=prep();const f=S.player,F=hnFl();
 const ring=['samnium','latium','hirpinien'].map(id=>{const a=romAt(id,RU(5),'Riegel '+id);a.hnCool=S.turn+9;return a;});
 o.trap=!!hnTrap(h);const m0=hnMen(h);S.turn++;hnRound();o.k1=F.hn_kessel;o.hunger=hnMen(h)<m0;o.ev1=evIds().includes('hn_ochsen');
 for(const a of ring)a.hnCool=S.turn+9;S.turn++;hnRound();o.k2=F.hn_kessel;const L=popEv();const ev=L.find(x=>x.E.id==='hn_ochsen');o.ev2=!!ev;
 if(ev){o.txt=ev.E.text();o.opts=ev.E.opts.map(x=>x.label);const g0=S.fac[f].gold;const hm=hnMen(h);o.msg=ev.E.opts[0].fx(f);o.moved=h.p!==PI.kampanien;o.where=PROV_DEF[h.p].id;o.cool=ring.every(a=>(a.hnCool||0)>=S.turn+3||a.units.length===0);o.cost=ev.E.opts[0].cost?ev.E.opts[0].cost():0;o.loss=hnMen(h)<hm;o.k0=F.hn_kessel;}
 // zweite Auslösung erst nach 8 Runden
 F.hn_kessel=2;o.cd=F.hn_ochT===S.turn;
 // Kein Kessel, wenn ein Ausgang frei ist
 h=prep();const r2=['samnium','hirpinien'].map(id=>{const a=romAt(id,RU(5),'R'+id);a.hnCool=S.turn+9;return a;});S.prov[PI.latium].owner=S.player;o.free=hnTrap(h)===null;
 // Durchbruch
 h=prep();for(const id of['samnium','latium','hirpinien']){const a=romAt(id,RU(2),'S'+id);a.hnCool=S.turn+9;}const r0=hnDurchbruch();o.dbr=typeof r0==='string'&&/Durchbruch/.test(r0);
 return o;});
ok('Kessel (alle Ausgänge besetzt oder überwacht, ≥ 2 Heere): Hunger −3 % je Runde, ab der zweiten Runde Fenster „Ochsen mit Fackeln“ mit Ursache (Ausgänge genannt)',E.trap&&E.hunger&&E.k1===1&&!E.ev1&&E.k2===2&&E.ev2&&/Samnium|Latium|Hirpinien/.test(E.txt||''),E);
ok('Ochsen mit Fackeln: Heer bricht aus (Provinz wechselt), Männer −3 %, Wachen 3 Runden verwirrt, Kosten genannt, Pause 8 Runden',E.moved&&E.cool&&E.loss&&E.cost>0&&E.k0===0&&E.opts&&E.opts.length===3,[E.where,E.cool,E.cost,E.opts]);
ok('Kein Kessel bei freiem Ausgang; „Sich durchschlagen“ liefert ein Ergebnis',E.free&&E.dbr,[E.free,E.dbr]);

// ---- (f) Winterlager in Capua und Verweichlichung ----
const W=await p.evaluate(()=>{const o={};setup();const f=S.player;gotoStep(7);clearRom();clearMine();let h=heroAt('kampanien',true);S.turn++;hnRound();clearRom();h=heroAt('kampanien',true);
 o.btn=lagerHtml(h);o.btnOk=/Winterlager aufschlagen/.test(o.btn)&&!/disabled/.test(o.btn);o.why0=lagerWhy(h);
 const g0=S.fac[f].gold,def0=provDefense(PI.kampanien,'rom');const r=setLager(h);o.set=r.ok;o.cost=g0-S.fac[f].gold;o.lager=lagerOn(PI.kampanien);o.def=provDefense(PI.kampanien,'rom')/def0;
 o.reach=(()=>{const x=createArmy(f,PI.hirpinien,['spear','sword'],1);return lagerReach(x);})();
 // anderswo: Knopf fehlt, Grund genannt
 const h2=heroAt('samnium',true);o.btnElse=lagerHtml(h2);o.whyElse=lagerWhy(h2);
 // vor Schritt 8 nicht
 gotoStep(6);o.btnEarly=lagerHtml(heroAt('kampanien',true));o.whyEarly=lagerWhy(hero());gotoStep(7);
 // Verweichlichung nach 2 Runden im Lager, danach Pause
 h=heroAt('kampanien',true);for(const u of h.units)u.men=Math.round(u.men*0.6);const F=hnFl();F.hn_lagN=0;F.hn_weichT=null;
 S.turn++;hnRound();o.l1=evIds().includes('hn_weich');S.turn++;hnRound();const ev=popEv().find(x=>x.E.id==='hn_weich');o.l2=!!ev;
 if(ev){o.opts=ev.E.opts.map(x=>x.label);o.txt=ev.E.text();const full=h.units.reduce((s,u)=>s+unitStat(f,u.r,u.v).men,0),m0=hnMen(h)+hnEleN(h)*0;
  const xp0=h.units[0].xp||0;const msg=ev.E.opts[0].fx(f);const m1=h.units.reduce((s,u)=>s+u.men,0);o.full=m1===full;o.mod=S.mods.some(m=>/Verweichlichung/.test(m.label)&&m.v<0);o.msg=msg;}
 S.turn++;hnRound();S.turn++;hnRound();o.pause=!evIds().includes('hn_weich');
 // Zucht
 for(const u of h.units)u.men=Math.round(u.men*0.5);const gap0=h.units.reduce((s,u)=>s+unitStat(f,u.r,u.v).men-u.men,0);const mods0=S.mods.length;const m=hnWeichFx(true);const gap1=h.units.reduce((s,u)=>s+unitStat(f,u.r,u.v).men-u.men,0);o.zucht=gap1<=Math.ceil(gap0/2)+h.units.length&&gap1<gap0&&S.mods.length===mods0;
 // Kontrolle: Caesar / Wikinger-Lager unverändert
 startScenario('caesar');try{closeModal();}catch(e){}const c=S.armies.find(x=>x.f===S.player);o.caesarBtn=lagerHtml(c);
 return o;});
ok('Winterlager in Capua (Schritt 8, Kampanien): Knopf, Kosten genannt, Abwehr ×2, Versorgung der Heere ringsum',W.btnOk&&W.set&&W.cost>0&&W.lager&&Math.abs(W.def-2)<0.01&&W.reach,[W.btnOk,W.set,W.cost,W.def,W.reach]);
ok('Anderswo und vor Schritt 8 kein Lager: Grund steht am Knopf bzw. Knopf fehlt; Caesar unberührt',/Capua/.test(W.whyElse||'')&&/Capua/.test(W.whyEarly||'')&&W.btnEarly===''&&W.caesarBtn==='',[W.whyElse,W.whyEarly,W.btnEarly,W.caesarBtn]);
ok('Verweichlichung: nach 2 Runden im Lager, Wahl „Feiern lassen“ (Männer voll, Angriff −8 %) oder „Zucht“ (halbe Lücken, kein Malus), danach Pause',!W.l1&&W.l2&&W.full&&W.mod&&W.pause&&W.zucht&&W.opts.length===2,W);

// ---- (g) Rat von Karthago: Gunst ----
const G=await p.evaluate(()=>{const o={};
 const prep=(step)=>{setup();const f=S.player;gotoStep(step||6);clearRom();clearMine();heroAt('kampanien',true);S.turn++;hnRound();clearRom();if(step===6||step==null){hnFl().hn_can='skip';for(const x of S.armies)x.hnCan=0;}return f;};
 let f=prep(6);let F=hnFl();o.start=F.hn_gunst;o.bar=scenHtml();o.barOk=/Gunst in Karthago/.test(o.bar)&&/>50</.test(o.bar);
 // Stillstand pausiert in Schritt 7 (Cannae)
 for(let i=0;i<5;i++){S.turn++;hnRound();}o.idle6=F.hn_gunst;
 // Siege +10 (2 Siege in einer Runde zählen beide, höchstens 2)
 stat(f,'win');S.turn++;hnRound();o.win1=F.hn_gunst;stat(f,'win');stat(f,'defwin');stat(f,'win');S.turn++;hnRound();o.win3=F.hn_gunst;
 // Abfall +5 über die echte Funktion
 prep(7);F=hnFl();const rnd0=Math.random;Math.random=()=>0;S.fac[f].gold=9999;S.turn++;hnRound();const gA=F.hn_gunst;const ok1=tryDefect(f,PI.hirpinien);Math.random=rnd0;S.turn++;hnRound();o.abf=ok1?F.hn_gunst-gA:null;o.abfList=(F.hn_abf||[]).length;
 // Niederlage −15
 prep(7);F=hnFl();S.turn++;hnRound();const g1=F.hn_gunst;F.hn_nied=(F.hn_nied||0)+1;stat(f,'win');S.turn++;hnRound();o.nied=g1-F.hn_gunst;// Sieg im selben Zug hebt auf +10: −15+10
 prep(7);F=hnFl();S.turn++;hnRound();const g2=F.hn_gunst;F.hn_nied++;S.turn++;hnRound();o.nied2=g2-F.hn_gunst;
 // Stillstand: 3 Runden Ruhe, dann −3 je Runde
 prep(7);F=hnFl();F.hn_gLast=S.turn;const seq=[F.hn_gunst];for(let i=0;i<6;i++){S.turn++;hnRound();seq.push(F.hn_gunst);}o.still=seq;
 return o;});
ok('Gunst startet bei 50 (Leiste im Szenario-Kopf), Stillstand pausiert in Schritt 7 (Cannae)',G.start===50&&G.barOk&&G.idle6===50,[G.start,G.barOk,G.idle6]);
ok('Sieg +10 je Sieg (höchstens 2 je Runde); Abfall einer Stadt +5; Niederlage −15',G.win1===60&&G.win3===80&&G.abf===5&&G.abfList===1&&G.nied2===15&&G.nied===5,[G.win1,G.win3,G.abf,G.nied,G.nied2]);
ok('Stillstand: 3 Runden ohne Erfolg ruhig, danach −3 je Runde',JSON.stringify(G.still.map(x=>G.still[0]-x))==='[0,0,0,3,6,9,12]'||JSON.stringify(G.still.map(x=>G.still[0]-x))==='[0,0,3,6,9,12,15]',G.still);
const V=await p.evaluate(()=>{const o={};setup();const f=S.player;gotoStep(7);clearRom();clearMine();heroAt('kampanien',true);S.turn++;hnRound();clearRom();const F=hnFl();
 const q=(g)=>{F.hn_gunst=g;F.hn_gLast=S.turn;S.turn++;F.hn_gLast=S.turn;};
 // < 60: kein Angebot, Knopf gesperrt
 q(55);hnRound();o.low=!evIds().includes('hn_rat_barkiden');o.btnLow=/data-k="verst" disabled/.test(scenHtml());
 // 60: Angebot einmal
 q(62);hnRound();const L=popEv();const ev=L.find(x=>x.E.id==='hn_rat_barkiden');o.offer=!!ev;o.btnHigh=/data-k="verst"(?! disabled)/.test(scenHtml());
 q(62);hnRound();o.once=!evIds().includes('hn_rat_barkiden');
 o.lock0=hnSeaLock(hero(),PI.taurini)!=null;
 if(ev){const g0=F.hn_gunst;o.msg=ev.E.opts[0].fx(f);o.cost=g0-F.hn_gunst;o.seeOk=F.hn_seeOk===1;o.vq=!!F.hn_vq;o.lockSued=hnSeaLock(hero(),PI.kampanien)===null;o.lockNord=hnSeaLock(hero(),PI.taurini)!=null;}
 // Landung nach 2 Runden bei Bruttium
 F.hn_gunst=62;F.hn_gLast=S.turn;S.turn++;hnRound();o.early=!S.armies.some(x=>x.hnMago);F.hn_gLast=S.turn;S.turn++;hnRound();const mg=S.armies.find(x=>x.hnMago===1);
 o.mago=!!mg;if(mg){o.at=PROV_DEF[mg.p].id;o.ele=mg.units.filter(u=>u.v==='elef').length;o.num=mg.units.filter(u=>u.v==='numid').length;o.gen=mg.gen.n;}o.evL=evIds().includes('hn_rat_verstaerkung');
 // zweite Verstärkung erst ab 80
 F.hn_gunst=70;F.hn_gLast=S.turn;S.turn++;hnRound();o.no2=!F.hn_vo2;
 F.hn_gunst=85;F.hn_gLast=S.turn;S.turn++;hnRound();const L2=popEv();const ev2=L2.find(x=>x.E.id==='hn_rat_barkiden');o.offer2=!!ev2;
 if(ev2){const g0=F.hn_gunst;ev2.E.opts[0].fx(f);o.cost2=g0-F.hn_gunst;}F.hn_gLast=S.turn;S.turn++;hnRound();F.hn_gLast=S.turn;S.turn++;hnRound();o.mago2=S.armies.some(x=>x.hnMago===2);
 // keine dritte
 F.hn_gunst=95;F.hn_gLast=S.turn;S.turn++;hnRound();o.no3=!evIds().includes('hn_rat_barkiden');o.err3=hnVerstWhy(1);
 return o;});
ok('Verstärkung: unter 60 gesperrt; ab 60 Fenster einmal und Knopf; Kosten Gunst −20; setzt die Seeweg-Ausnahme (Süditalien offen, Norditalien gesperrt)',V.low&&V.btnLow&&V.offer&&V.btnHigh&&V.once&&V.lock0&&V.cost===20&&V.seeOk&&V.vq&&V.lockSued&&V.lockNord,V);
ok('Mago landet nach 2 Runden bei Locri (Bruttium) mit Elefanten und Numidern, Fenster; zweite Verstärkung erst ab 80 (Gunst −25), keine dritte',V.early&&V.mago&&V.at==='bruttium'&&V.ele>=1&&V.num>=1&&V.evL&&V.no2&&V.offer2&&V.cost2===25&&V.mago2&&V.no3,[V.early,V.at,V.ele,V.num,V.evL,V.no2,V.offer2,V.cost2,V.mago2,V.no3]);
const Ab=await p.evaluate(()=>{const o={};setup();const f=S.player;gotoStep(7);clearRom();clearMine();heroAt('kampanien',true);S.turn++;hnRound();clearRom();const F=hnFl();
 // Warnung bei 35 (einmal)
 F.hn_gunst=40;F.hn_gLast=S.turn;S.turn++;hnRound();o.noW=!evIds().includes('hn_rat_hanno');
 F.hn_gunst=36;F.hn_gLast=S.turn;S.turn++;F.hn_gLast=S.turn;F.hn_gunst=34;hnRound();const L=popEv();const w=L.find(x=>x.E.id==='hn_rat_hanno');o.warn=!!w;
 if(w){o.wtxt=w.E.text();const g0=F.hn_gunst,go0=S.fac[f].gold;const c=w.E.opts[0].cost();w.E.opts[0].fx(f);o.boten=F.hn_gunst-g0;o.cost=c;}
 F.hn_gLast=S.turn;S.turn++;hnRound();o.warn2=!evIds().includes('hn_rat_hanno');
 // Boten: Pause 6 Runden, Kosten
 F.hn_botenT=S.turn;o.cd=hnBotenWhy();F.hn_botenT=null;const gg=S.fac[f].gold;F.hn_gunst=50;o.bo=hnBoten();o.bg=F.hn_gunst;o.bc=gg-S.fac[f].gold;
 // unter 25: Frist, in der nächsten Runde Abberufung
 F.hn_botenT=null;F.hn_gunst=22;F.hn_gLast=S.turn;S.turn++;F.hn_gLast=S.turn;hnRound();o.frist=F.hn_low===1&&!S.scen.over&&evIds().includes('hn_rat_hanno');
 F.hn_gLast=S.turn;S.turn++;F.hn_gLast=S.turn;hnRound();o.lost=S.scen.over&&S.scen.res==='lose'&&/abberufen/.test(S.scen.why||'');o.qAb=true;
 // Rettung in der Frist
 setup();gotoStep(7);clearRom();clearMine();heroAt('kampanien',true);S.turn++;hnRound();clearRom();const F2=hnFl();F2.hn_gunst=22;F2.hn_gLast=S.turn;S.turn++;F2.hn_gLast=S.turn;hnRound();hnBoten();F2.hn_gLast=S.turn;S.turn++;F2.hn_gLast=S.turn;hnRound();o.saved=!S.scen.over&&F2.hn_low===0;
 return o;});
ok('Warnung bei 35 (einmal, mit Boten-Antwort und Kosten); Boten +10 mit Pause 6 Runden',Ab.noW&&Ab.warn&&Ab.boten===10&&Ab.cost>0&&Ab.warn2&&/Runden/.test(Ab.cd||'')&&Ab.bo===null&&Ab.bg===60&&Ab.bc>0,Ab);
ok('Unter 25: Frist von einer Runde mit Fenster, danach Abberufung (Geschichte endet, Grund genannt); Boten in der Frist retten',Ab.frist&&Ab.lost&&Ab.saved,[Ab.frist,Ab.lost,Ab.saved]);

// ---- (h) Kompatibilität: Spielstand (JSON), Alt-Stand, Endlosspiel, Caesar ----
const K=await p.evaluate(()=>{const o={};setup();const f=S.player;gotoStep(6);clearRom();heroAt('taurini',true);S.turn++;hnRound();S.turn++;hnRound();
 const j=JSON.parse(JSON.stringify({fl:S.scen.flags,ca:S.armies.filter(x=>x.hnCan).map(x=>({id:x.id,c:x.hnCan,h:x.hold}))}));o.json=j.fl.hn_can==='lauf'&&j.fl.hn_gunst===50&&j.ca.length===2&&Array.isArray(j.fl.hn_canIds);
 // Alt-Stand: Schritt 8 ohne hn_*-Zustand, Runden laufen fehlerfrei
 setup();gotoStep(7);let err=null;try{for(let i=0;i<5;i++){S.turn++;hnRound();}}catch(e){err=e.message;}o.alt=err===null&&hnFl().hn_fab!=null&&hnFl().hn_gunst<=50&&hnFl().hn_gunst>=40;
 // Alt-Stand in Schritt 7 (Cannae) ohne Zustand: Riesenheer wird nachgebaut
 setup();gotoStep(6);S.turn++;hnRound();o.alt6=S.armies.filter(x=>x.hnCan).length===2;
 // Schritt übersprungen: Cannae-Heer verliert die Marschpflicht
 setup();gotoStep(6);heroAt('taurini',true);S.turn++;hnRound();gotoStep(8);S.turn++;hnRound();o.skip=hnFl().hn_can==='skip'&&!S.armies.some(x=>x.hnCan);
 // Endlosspiel
 newGame('nord');try{closeModal();}catch(e){}const a=S.armies.find(x=>x.f===S.player)||createArmy(S.player,provsOf(S.player)[0],['spear','sword'],1);hnRound();o.endless={on:hnOn(),fab:hnFabOn(),rat:hnRatOn(),bar:/Gunst/.test(scenHtml()),mul:(a.plan='umfassung',planMul(a,PI.taurini||0))};
 // Caesar
 startScenario('caesar');try{closeModal();}catch(e){}const c=S.armies.find(x=>x.f===S.player);hnRound();o.caesar={fab:hnFabOn(),rat:hnRatOn(),bar:/Gunst/.test(scenHtml()),sea:hnSeaLock(c,PI.kampanien||0)};
 return o;});
ok('Spielstand: Zustand übersteht JSON; Alt-Stand (Schritt 7/8 ohne hn_*-Zustand) wird nachgebaut; übersprungener Schritt beendet den Marsch',K.json&&K.alt&&K.alt6&&K.skip,K);
ok('Endlosspiel und Caesar: keine Gunst-Leiste, kein Fabius, kein Sonderwert',!K.endless.on&&!K.endless.fab&&!K.endless.rat&&!K.endless.bar&&K.endless.mul!==1.25&&!K.caesar.fab&&!K.caesar.rat&&!K.caesar.bar,[K.endless,K.caesar]);

// ---- (i) Messung: Bilanz in Italien (Steuern der Provinzen dort minus Unterhalt der Heere dort), ohne und mit drei abgefallenen Städten ----
const BI=SKIP.includes('BI')?null:await p.evaluate(()=>{const o={};setup();const f=S.player;gotoStep(7);clearRom();clearMine();heroAt('kampanien',false);S.prov[PI.kampanien].owner='rom';
 const it=()=>provsOf(f).filter(pi=>HN_ITALY.has(hnReg(pi)));const bil=()=>Math.round(it().reduce((s,pi)=>s+provIncome(pi),0)-income(f).upk);
 o.ohne=bil();o.unterhalt=Math.round(income(f).upk);for(const id of['kampanien','lukanien','tarent']){S.prov[PI[id]].owner=f;S.prov[PI[id]].gar=10;}
 o.mit3=bil();o.steuer3=it().reduce((s,pi)=>s+provIncome(pi),0);o.n=it().length;
 // Unterhalt ohne die Regel (zur Kontrolle): Caesar/Endlos zahlen den vollen Unterhalt
 const keep=S.armies.filter(a=>a.f===f);o.halb=hnUpkMul(keep[0]);const savedP=keep[0].p;keep[0].p=PI.contestaner;o.heim=hnUpkMul(keep[0]);keep[0].p=savedP;
 return o;});
if(BI){console.log('Bilanz Italien (Gold je Runde):',JSON.stringify(BI));
 ok('Messziel Bilanz Italien: ohne Abfall leicht negativ (−15 bis −70), mit drei abgefallenen Städten ausgeglichen (−15 bis +15); Unterhalt in Italien halb, in Hispanien voll',BI.ohne<=-15&&BI.ohne>=-70&&BI.mit3>=-15&&BI.mit3<=15&&BI.halb===0.5&&BI.heim===1,BI);}

// ---- (j) Messung: Provinz-Pingpong über 30 Runden (Bot-Hannibal greift an, wirbt Städte ab) und Cannae-Zeitpunkt im Spielerlauf ----
const PP=SKIP.includes('PP')?null:await p.evaluate(()=>{const out={};
 const run=(label,setupFn)=>{setupFn();const f=S.player;const owner0=S.prov.map(P=>P.owner),flips=S.prov.map(()=>0),rev=S.prov.map(()=>0);let acts=[];const g=[],men=[];
  for(let r=0;r<30;r++){bigClose();if(S.scen.over)break;acts.push(botRound());storyRound();popEv();bigClose();const before=S.prov.map(P=>P.owner);newRound();bigClose();storyRound();popEv();
   S.prov.forEach((P,i)=>{if(P.owner!==before[i]){if(P.owner==='rom'||before[i]==='rom')flips[i]++;else rev[i]++;}});g.push(Math.round(hnFl().hn_gunst==null?-1:hnFl().hn_gunst));const h=hero();men.push(h?hnMen(h):0);}
  const abf=new Set(hnFl().hn_abf||[]);const worst=flips.map((n,i)=>({id:PROV_DEF[i].id,n,abf:abf.has(i)})).filter(x=>x.n>0).sort((a,b)=>b.n-a.n);
  out[label]={revolts:rev.reduce((a,b)=>a+b,0),rounds:acts.length,max:worst.filter(x=>!x.abf)[0]?worst.filter(x=>!x.abf)[0].n:0,maxAll:worst[0]?worst[0].n:0,worst:worst.slice(0,5),abfall:(hnFl().hn_abf||[]).length,gunst:g.filter((x,i)=>i%5===4),men:men.filter((x,i)=>i%5===4),over:!!S.scen.over,res:S.scen.res||null,acts:acts.filter(x=>x!=='stay'&&x!=='none').length,
   stepEnd:scenStepI(),fab:hnFl().hn_fab!=null};};
 run('nach Cannae (Sieg)',()=>{setup();gotoStep(7);hnFl().hn_can='won';clearMine();heroAt('kampanien',true);for(const id of['samnium','hirpinien']){}S.turn++;hnRound();});
 run('Cannae verloren',()=>{setup();gotoStep(7);hnFl().hn_can='lost';clearMine();const h=heroAt('kampanien',true);for(const u of h.units)u.men=Math.round(u.men*0.5);S.turn++;hnRound();});
 return out;});
if(PP){console.log('Pingpong (30 Runden, Bot-Hannibal):',JSON.stringify(PP));
 ok('Messziel Pingpong: keine Provinz (außer bewusst abgefallene Städte) wechselt in 30 Runden mehr als 2-mal zwischen Karthago und Rom (Aufstände ungehaltener Provinzen werden getrennt gemeldet)',Object.values(PP).every(x=>x.max<=2&&x.rounds>=5),Object.values(PP).map(x=>[x.rounds,x.max,x.maxAll]));}
ok('Keine Seitenfehler',!errs.length,errs.slice(0,3));
const nP=R.filter(x=>x).length;console.log(`${nP} PASS / ${R.length-nP} FAIL`);console.log(R.every(x=>x)?'ALLE PASS':'FEHLER '+R.filter(x=>!x).length);await b.close();})();
