// node w6_t.js <html> [port] – W6 (v218): Wikinger Phase C „Alfred“ (Alfred-Ereignis, Burh-Takt, Danegeld, Chippenham-Winter, Fyrd, Edington, Wedmore mit dritter Wahl, Danelag-Vertrag)
// und Phase D (gekürzte Schrittfolge, alte Spielstände). Kontrollen: Endlosspiel, andere Geschichte, Konsolenfehler.
const {chromium}=require('playwright');
const FILE=process.argv[2]||require('path').join(__dirname,'..','imperium.html'),PORT=process.argv[3]||'8772';
(async()=>{const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:process.env.PW_GPU?[]:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const R=[];const ok=(n,c,i='')=>{R.push(!!c);console.log((c?'PASS ':'FAIL ')+n+(i!==''?'  '+JSON.stringify(i):''));};
const fs=require('fs');
const ctx=await b.newContext({viewport:{width:1024,height:768},hasTouch:true,isMobile:true});const p=await ctx.newPage();const errs=[];
p.on('pageerror',e=>errs.push('PAGE '+e.message));p.on('console',m=>{if((m.type()==='error'||m.type()==='warning')&&!/Failed to load resource|WebGL|GPU stall|GroupMarker|swiftshader/i.test(m.text()))errs.push(m.type()+' '+m.text().slice(0,200));});
await p.addInitScript(()=>{try{localStorage.setItem('imperium.gfx',JSON.stringify({q:'leicht'}));}catch(e){}});
await p.route(/cdnjs/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));
await p.route(/fonts\.g/,r=>r.abort());await p.route(/\.html$/,r=>r.fulfill({body:fs.readFileSync(FILE),contentType:'text/html; charset=utf-8'}));
await p.goto(`http://localhost:${PORT}/imperium.html`,{timeout:300000});await p.waitForFunction(()=>document.getElementById('loading').hidden,null,{timeout:300000});
await p.waitForFunction(()=>!document.querySelector('#loading[data-gate]'),null,{timeout:120000}).catch(()=>{});
await p.waitForTimeout(1500);
await p.evaluate(()=>{window.__cine=[];window.playCine=(o,d)=>{window.__cine.push(o&&o.title);d&&d();};
 window.setup=()=>{startScenario('wikinger');try{closeModal();}catch(e){}storyRound();S.q=[];const s=S.story[S.player];if(s)s.q=[];window.__cine.length=0;};
 window.mTxt=()=>$('#modal').hidden?'':$('#dialog').innerText;
 window.clickBtn=re=>{const x=[...document.querySelectorAll('#dialog .actions .btn, #dialog .rcard')].find(y=>re.test(y.textContent.trim())&&!y.disabled);if(x)x.click();return!!x;};
 window.gotoStep=i=>{const f=S.player,s=S.story[f],C=SCEN.wikinger.chapter;s.i=i;s.t0=S.turn;s.done=false;s.end=false;s.q=[];try{s.g=stResolve(f,C.steps[i].g);}catch(e){}return s;};
 window.hook=i=>{const h=SCEN.wikinger.hooks[i];if(h)h(S.player);};
 window.closeAll=()=>{try{closeModal();}catch(e){}};
 window.logHas=re=>S.log.some(e=>re.test(e.t));
 window.putNear=(a,ti)=>{const n=[...ADJ[ti]].find(j=>!isSeaLink(j,ti)&&isAct(j));a.p=n;a.mp=3;a.st=null;a.rz=false;a.goal=null;a.pos=null;a.boat=null;return n;};
 window.wsGar=()=>S.prov[PI.belgae_b].gar;
 // Schritt 5 mit allen Voraussetzungen (Hook), Spielzeit so setzen, dass die nächste Runde Winter ist
 window.step5=()=>{setup();gotoStep(4);hook(4);gotoStep(5);hook(5);const F=S.scen.flags;F.s5T=S.turn;return F;};
 });

// ---- (a) Phase D: gekürzte Schrittfolge ----
const A=await p.evaluate(()=>{const C=SCEN.wikinger.chapter,o={};o.t=C.steps.map(s=>s.t);o.kino=C.steps.map(s=>s.kino||'');o.vk=C.steps.map((st,i)=>stVk('wikinger',st,{i}).join());
 o.img=C.steps.map(s=>s.img||'');o.imgOk=C.steps.every(s=>!s.img||!/^vk_/.test(s.img)||!!IMGLIB[s.img]);o.hooks=Object.keys(SCEN.wikinger.hooks).join();o.turns=SCEN.wikinger.turns;
 o.w=C.steps[5].w&&{n:C.steps[5].w.choice.length,x:C.steps[5].w.extra.act,acts:C.steps[5].w.choice.map(c=>c.act).join()};o.choice5=!!C.steps[5].choice;
 o.vin=C.steps[8].choice.map(c=>c.act).join();o.edGate=C.steps[5].edGate;o.ruleNs=SCEN.wikinger.rules.noSubmit.usa;
 o.k3any=C.steps.some(s=>s.kino==='k3');o.parisWara=C.steps.some(s=>/Paris|Waräger|Island/.test(s.t));
 return o;});
ok('Phase D: 9 Schritte, Paris/Waräger/Island entfallen, Reihenfolge Lindisfarne … Wedmore, Normandie, Miklagard, Vinland',A.t.length===9&&!A.parisWara&&A.t.slice(4).join('|')==='Akt II · Landnahme|Akt II · Wedmore|Akt II · Normandie|Akt III · Miklagard|Akt IV · Vinland',A.t);
ok('Kino k5 (Waräger) liegt jetzt bei Miklagard, k6 (Nordmeer) bei Vinland, k3 nicht mehr am Schrittbeginn',A.kino[7]==='k5'&&A.kino[8]==='k6'&&A.kino[3]==='k2'&&!A.k3any&&A.kino.filter(x=>x==='k5').length===1&&A.kino.filter(x=>x==='k6').length===1,A.kino);
ok('Sprecher hängen am Schritt (ki), nicht am Index: Normandie k6, Miklagard k8, Vinland k10 (ki-Nummern bleiben), Landnahme wikinger_landnahme; Wedmore-Beginn ohne Aufnahme',A.vk[6]==='wikinger_k6'&&A.vk[7]==='wikinger_k8'&&A.vk[8]==='wikinger_k10'&&A.vk[4]==='wikinger_landnahme'&&A.vk[5]===''&&A.vk[0]==='wikinger_k1'&&A.vk[3]==='wikinger_k4',A.vk);
ok('Kapitelbilder aller Schritte vorhanden (Normandie, Miklagard, Vinland, Wedmore = Burhbau)',A.imgOk&&A.img[5]==='vk_kap_burhbau'&&A.img[6]==='vk_kap_normandie'&&A.img[7]==='vk_kap_miklagard'&&A.img[8]==='vk_kap_vinland',A.img);
ok('Hooks 0, 3, 4 (Alfred), 5 (Alfred-Phase); Wedmore-Wahl liegt in steps[5].w (2 Wahlen + dritte), nicht mehr als Sofort-Wahl; Island-Wahl in Vinland',A.hooks==='0,3,4,5'&&A.w&&A.w.n===2&&A.w.x==='wedmore_unterwerfen'&&A.w.acts==='wedmore_tauf,wedmore_treue'&&!A.choice5&&A.edGate===1&&A.vin==='vinland,vinland_island,warten',[A.hooks,A.w,A.vin]);
ok('Sperre Wessex hängt am Schritt „Wedmore“ (Name), Zeitrahmen turns unverändert 80',A.ruleNs==='Wedmore'&&A.turns===80,[A.ruleNs,A.turns]);

// ---- (b) Alfred wird König (Hook Schritt 4) ----
const B=await p.evaluate(()=>{setup();const f=S.player,o={};gotoStep(4);const n0=S.armies.filter(a=>a.f==='usa').length;hook(4);const F=S.scen.flags;
 const al=S.armies.find(a=>a.f==='usa'&&a.gen.n==='Alfred');o.gen=al&&{n:al.gen.n,lvl:al.gen.lvl,tr:al.gen.tr.slice(),e:al.gen.e,flag:!!al.alf,units:al.units.length};
 o.traits=al&&al.gen.tr.every(t=>!!GEN_TRAITS[t]);o.flags={alfred:F.alfred,t0:F.wikT0===S.turn};o.armies=S.armies.filter(a=>a.f==='usa').length===n0;
 const ev=stEvents(f).filter(x=>x.E.id==='wik_alfred');o.ev=ev.length&&{title:ev[0].E.title(),eb:ev[0].E.eb,img:ev[0].E.img,text:ev[0].E.text().slice(0,60),opt:ev[0].E.opts[0].desc()};
 o.imgOk=ev.length&&!!IMGLIB[ev[0].E.img];o.img0=ev.length&&ev[0].E.img;o.libU=IMGLIB['vk_u_alfred'];
 o.log=logHas(/Alfred wird König von Wessex/);
 // zweimal: kein zweites Ereignis
 hook(4);o.again=stEvents(f).filter(x=>x.E.id==='wik_alfred').length;
 // Anzeige im Heer-Blatt
 o.card=genHtml(al,true).includes('Alfred');
 return o;});
ok('Alfred: Wessex-Heer bekommt Feldherr „Alfred“ (Stufe 4, standhaft + beliebt, vorhandene Eigenschaften)',B.gen&&B.gen.n==='Alfred'&&B.gen.lvl===4&&B.traits&&B.gen.tr.join()==='standhaft,beliebt'&&B.gen.flag&&B.armies&&B.card,B.gen);
ok('Alfred: Fenster „Alfred wird König“ mit Rückfall-Bild (vk_u_alfred noch nicht in IMGLIB → vk_kap_burhbau), Merker, Protokoll, nur einmal',B.ev&&B.ev.title==='Alfred wird König'&&B.ev.eb==='Akt II · Landnahme'&&B.ev.img==='vk_kap_burhbau'&&B.imgOk&&B.libU==null&&B.flags.alfred===1&&B.flags.t0&&B.log&&B.again===0,[B.ev,B.flags,B.again,B.libU]);

// ---- (c) Burh-Takt und Danegeld ----
const C=await p.evaluate(()=>{setup();const f=S.player,o={};gotoStep(4);hook(4);const F=S.scen.flags,t0=F.wikT0;const burhs=()=>provsOf('usa').filter(pi=>S.prov[pi].b.burh>0);
 o.b0=burhs().length;const run=[];
 for(let d=1;d<=19;d++){S.turn=t0+d;const n=burhs().length;wikRound();run.push(burhs().length-n);}
 o.run=run.join('');o.burhs=burhs().map(pi=>PROV_DEF[pi].id);o.n=F.burhN;
 // Grenzprovinzen (Nachbar nicht Wessex)
 o.frontier=burhs().every(pi=>[...ADJ[pi]].some(n=>!isSeaLink(pi,n)&&S.prov[n].owner!=='usa'));
 o.log=S.log.filter(e=>/Wessex baut einen Burh/.test(e.t)).length;
 // nur Schritte 4–5
 gotoStep(6);for(const pi of provsOf('usa'))S.prov[pi].b.burh=0;S.turn=t0+24;wikRound();o.afterStep=burhs().length;
 gotoStep(3);S.turn=t0+30;wikRound();o.beforeStep=burhs().length;
 return o;});
ok('Burh-Takt: genau alle 6 Runden ein Burh (Runde 6, 12, 18), jeder in einer anderen Wessex-Grenzprovinz ohne Burh',C.run==='0000010000010000010'&&C.n===3&&C.burhs.length===3&&new Set(C.burhs).size===3&&C.frontier&&C.log===3&&C.b0===0,[C.run,C.burhs,C.n,C.frontier]);
ok('Burh-Takt: nicht vor Schritt 4 und nicht nach Schritt 5',C.afterStep===0&&C.beforeStep===0,[C.afterStep,C.beforeStep]);
const C2=await p.evaluate(()=>{setup();const f=S.player,o={};gotoStep(4);hook(4);const F=S.scen.flags,t0=F.wikT0;
 S.turn=t0+3;wikRound();o.peaceNo=!S.props.some(x=>x.type==='dane');o.flagNo=F.wxDane==null;// Frieden mit Wessex: kein Danegeld (nur im Krieg)
 declareWar(f,'usa',true);S.turn=t0+4;S.fac.usa.gold=10;wikRound();const pr=S.props.filter(x=>x.type==='dane'&&x.from==='usa');o.n=pr.length;o.amt=pr[0]&&pr[0].amt;o.gold=S.fac.usa.gold>=(pr[0]||{amt:1e9}).amt;
 S.turn=t0+5;wikRound();o.once=S.props.filter(x=>x.type==='dane'&&x.from==='usa').length;
 // Fenster aus dem vorhandenen System
 closeAll();const g0=S.fac[f].gold;showProposals(()=>{});o.win=mTxt().slice(0,60);o.acc=clickBtn(/Gold nehmen/);o.gain=Math.round(S.fac[f].gold-g0)===o.amt;o.pact=raidPact(f,'usa');closeAll();
 return o;});
ok('Danegeld: im Frieden kein Angebot; im Krieg einmalig (ab 3 Runden nach Alfred), Wessex hat das Gold, vorhandenes Fenster „Danegeld aus Wessex“, Annehmen zahlt und schließt Raubzug-Pakt',C2.peaceNo&&C2.flagNo&&C2.n===1&&C2.once===1&&C2.gold&&/Danegeld aus Wessex/.test(C2.win)&&C2.acc&&C2.gain&&C2.pact,C2);

// ---- (d) Chippenham-Winter ----
const D=await p.evaluate(()=>{const F=step5(),f=S.player,o={};const a=S.armies.find(x=>x.f===f);const ti=PI.cantium;
 S.turn=34;// (34+1)%4==3: nächste Runde ist Winter
 o.season=((S.turn+1)%4);const g0=wsGar();
 putNear(a,PI.belgae_b);a.mp=3;o.lockBefore=wikRaidLock(a,PI.belgae_b);o.lockStr=WIK_TXT_WESSEX===o.lockBefore;o.W=WIK_TXT_WESSEX;o.noSubBefore=scenNoSubmit('usa');
 S.turn=33;wikRound();o.warnLog=logHas(/Alfred will das Fest im Winter in Chippenham feiern/);o.noChippYet=F.chipp==null;
 S.turn=34;wikRound();o.chipp=F.chipp;o.gar={vorher:g0,jetzt:wsGar(),gemerkt:F.chippGar};o.msg=S.log.filter(e=>e.t==='Alfred feiert Weihnachten in Chippenham – Wessex ist unvorbereitet.').length;
 // Winter: Sperre aufgehoben
 S.turn=F.chipp;o.winter=season();o.lockWinter=wikRaidLock(a,PI.belgae_b);o.lockWinterSiege=wikRaidLock(a,PI.belgae_b,true);o.noSubWinter=scenNoSubmit('usa');o.open=wikOpen('usa');
 closeAll();orderMove(a,PI.belgae_b);o.modal=mTxt().slice(0,80);closeAll();
 declareWar(f,'usa',true);S.armies=S.armies.filter(x=>!(x.f==='usa'&&x.p===PI.belgae_b));o.canSiege=canSiege(a,PI.belgae_b);
 // danach: wieder gesperrt, Garnison zurück
 wikRound();S.turn=F.chipp+1;o.lockAfter=wikRaidLock(a,PI.belgae_b)===WIK_TXT_WESSEX;o.garAfter=wsGar()>=g0;o.garField=F.chippGar;
 // nur einmal
 S.turn=F.chipp+3;const c0=F.chipp;wikRound();o.once=F.chipp===c0&&S.log.filter(e=>e.t==='Alfred feiert Weihnachten in Chippenham – Wessex ist unvorbereitet.').length===1;
 return o;});
ok('Chippenham: eine Runde vor dem Winter Vorwarnung, im Winter die Meldung „Alfred feiert Weihnachten in Chippenham – Wessex ist unvorbereitet.“',D.season===3&&D.warnLog&&D.noChippYet&&D.chipp===35&&D.msg===1,[D.chipp,D.msg,D.warnLog]);
ok('Chippenham: Garnison der Hauptstadt (belgae_b) halbiert, alter Wert gemerkt',D.gar.jetzt===Math.ceil(D.gar.vorher/2)&&D.gar.gemerkt===D.gar.vorher&&D.gar.jetzt<D.gar.vorher,D.gar);
ok('Chippenham: vorher ist Wessex gesperrt („Wessex ist noch zu stark …“), im Winter keine Sperre (Marsch zeigt Kriegs-Rückfrage statt Raubzug-Sperre, Belagern geht), nur Diplomatie-Unterwerfung bleibt gesperrt',D.lockStr&&D.noSubBefore===true&&D.winter===3&&D.lockWinter==null&&D.lockWinterSiege==null&&/Frieden mit Wessex/.test(D.modal)&&!/Nur ein Raubzug/.test(D.modal)&&D.canSiege.ok&&D.open&&D.noSubWinter===true,[D.lockBefore,D.lockWinter,D.modal,D.canSiege,D.noSubWinter]);
ok('Chippenham: danach wieder gesperrt, Garnison aufgefüllt, Ereignis nur einmal',D.lockAfter&&D.garAfter&&D.garField==null&&D.once,[D.lockAfter,D.garAfter,D.garField,D.once]);

// ---- (e) Fyrd-Auslösung auf beiden Wegen ----
const E=await p.evaluate(()=>{const o={};
 // Weg 1: Spieler hat eine Wessex-Provinz erobert
 {const F=step5(),f=S.player;S.turn=50;F.s5T=48;F.wxP=provsOf('usa');const a=S.armies.find(x=>x.f===f);S.prov[PI.dumnonier].owner=f;a.p=PI.dumnonier;
  const best=Math.max(...S.armies.filter(x=>x.f===f).map(armyPower));wikRound();const fy=S.armies.filter(x=>x.fyrd);
  o.w1={n:fy.length,flag:F.fyrd,pi:fy[0]&&PROV_DEF[fy[0].p].id,units:fy[0]&&fy[0].units.length,ratio:fy[0]&&armyPower(fy[0])/best,ratioF:F.fyrdR,gen:fy[0]&&fy[0].gen.n,roles:fy[0]&&[...new Set(fy[0].units.map(u=>u.r+(u.v?':'+u.v:'')))].join(),
   war:atWar(f,'usa'),ev:(S.story[f].q||[]).some(m=>m.k==='wik'&&m.id==='fyrd'),log:logHas(/Alfred sammelt den Fyrd/),alfOld:S.armies.filter(x=>x.alf).length};
  const evs=stEvents(f).filter(x=>x.E.id==='wik_fyrd');o.w1.title=evs[0]&&evs[0].E.title();o.w1.img=evs[0]&&evs[0].E.img;o.w1.imgOk=evs[0]&&!!IMGLIB[evs[0].E.img];}
 // Weg 2: nach mehr als 8 Runden in Schritt 5
 {const F=step5(),f=S.player;S.turn=60;F.s5T=60;F.wxP=provsOf('usa');const res=[];for(const t of [61,64,66,67,68,69]){S.turn=t;wikRound();res.push(!!F.fyrd);}
  const fy=S.armies.filter(x=>x.fyrd);o.w2={res:res.join(),pi:fy[0]&&PROV_DEF[fy[0].p].id,war:atWar(f,'usa'),turn:F.fyrdT};}
 // Weg 1b: Dumnonia schon verloren → nächste Wessex-Provinz
 {const F=step5(),f=S.player;S.turn=70;F.s5T=70;F.wxP=provsOf('usa');S.prov[PI.dumnonier].owner='frei';S.turn=79;wikRound();const fy=S.armies.filter(x=>x.fyrd);o.w3={pi:fy[0]&&PROV_DEF[fy[0].p].id,own:fy[0]&&S.prov[fy[0].p].owner};}
 // vor Schritt 5 nie
 {setup();gotoStep(4);hook(4);const F=S.scen.flags;F.wxP=provsOf('usa');S.prov[PI.dumnonier].owner=S.player;S.turn=90;wikRound();o.early=!F.fyrd&&!S.armies.some(x=>x.fyrd);}
 return o;});
ok('Fyrd Weg 1 (Wessex-Provinz erobert): Heer „Alfreds Fyrd“ in Wessex-Gebiet, angelsächsische Grundrollen (Fyrd-Speerträger, Schwert, Bogen, Reiter), ≤ 10 Einheiten, ca. 1,5× größtes Spielerheer, Feldherr Alfred, Krieg, Ereignis',E.w1.n===1&&E.w1.flag===50&&E.w1.units<=10&&E.w1.units>=6&&E.w1.ratio>=1.2&&E.w1.ratio<=1.9&&Math.abs(E.w1.ratio-E.w1.ratioF)<0.06&&E.w1.gen==='Alfred'&&/spear:fyrd/.test(E.w1.roles)&&E.w1.war&&E.w1.ev&&E.w1.log&&E.w1.alfOld===0,E.w1);
ok('Fyrd-Ereignisfenster „Alfred sammelt den Fyrd“ mit Bild (Rückfall vk_k3_schildwall)',E.w1.title==='Alfred sammelt den Fyrd'&&E.w1.img==='vk_k3_schildwall'&&E.w1.imgOk,[E.w1.title,E.w1.img]);
ok('Fyrd Weg 2 (mehr als 8 Runden Schritt 5): erst in Runde 9, nicht früher; erscheint in Dumnonia, Wessex erklärt den Krieg',E.w2.res==='false,false,false,false,false,true'&&E.w2.pi==='dumnonier'&&E.w2.war,E.w2);
ok('Fyrd: ist Dumnonia verloren, erscheint er in der nächsten Wessex-Provinz; vor Schritt 5 nie',E.w3.own==='usa'&&E.w3.pi&&E.w3.pi!=='dumnonier'&&E.early,[E.w3,E.early]);

// ---- (f) Marsch, Edington (verloren/gewonnen), Kino k3 davor ----
const F1=await p.evaluate(async()=>{const o={};
 const wait=ms=>new Promise(r=>setTimeout(r,ms));
 const run=async(res)=>{const F=step5(),f=S.player;S.turn=50;F.s5T=48;F.wxP=provsOf('usa');const a=S.armies.find(x=>x.f===f);S.prov[PI.dumnonier].owner=f;a.p=PI.dumnonier;wikRound();
  const fy=S.armies.find(x=>x.fyrd);const out={spawn:PROV_DEF[fy.p].id,chain:[]};
  S.turn=51;wikRound();out.hold=fy.hold>=S.turn;out.pend=PENDING.length&&{aid:PENDING[0].aid===fy.id,ti:PROV_DEF[PENDING[0].ti].id};out.stageFyrd=PROV_DEF[fy.p].id;
  // ausgehen lassen
  if(res==='lost')a.units.forEach(u=>u.men=Math.max(1,Math.round(u.men*0.15)));else fy.units.forEach(u=>u.men=Math.max(1,Math.round(u.men*0.1)));
  window.__cine.length=0;let done=0;closeAll();processPending(()=>{done=1;});out.cine=window.__cine.slice();out.k3flag=S.scen.flags.vk_k3;out.modal=mTxt().slice(0,40);
  out.click=clickBtn(/^Berechnen/);for(let i=0;i<40&&!S.scen.flags.edington;i++)await wait(250);out.dbg={fy:S.scen.flags.fyrd,st:scenStepI(),n:S.armies.filter(x=>x.fyrd).map(x=>[x.units.length,x.p,x.f]),me:S.armies.filter(x=>x.f===S.player).map(x=>[x.units.length,x.p]),m:mTxt().slice(0,60),own:S.prov[PI.dumnonier].owner};out.ed=S.scen.flags.edington;out.still=S.armies.some(x=>x.fyrd);out.q=(S.story[f].q||[]).some(m=>m.k==='wik'&&m.id==='wedmore');out.log=logHas(/^Edington:/);closeAll();
  out.hold2=null;return out;};
 o.lost=await run('lost');o.won=await run('won');
 // zweite Schlacht löst Edington nicht noch einmal aus
 o.again=wikEdCtx(S.armies[0],S.armies[0].p);
 return o;});
ok('Marsch: Fyrd rückt auf das Spielerheer vor, greift an (Vorschlag in PENDING), allgemeine KI ruht (hold)',F1.lost.pend&&F1.lost.pend.aid&&F1.lost.pend.ti==='dumnonier'&&F1.lost.hold&&F1.lost.spawn==='belgae_b',F1.lost);
ok('Edington: Kino k3 läuft vor der ersten Schlacht (vor dem Angriffsfenster), genau einmal, Merker vk_k3',F1.lost.cine.length===1&&F1.lost.cine[0]==='Edington'&&F1.lost.k3flag===1&&/greift an/.test(F1.lost.modal)&&true,[F1.lost.cine,F1.lost.modal,F1.won.cine]);
ok('Edington verloren (Spielerheer schwach): flags.edington=\'lost\', Fyrd-Markierung weg, Wedmore-Wahl in der Warteschlange, Protokoll',F1.lost.ed==='lost'&&!F1.lost.still&&F1.lost.q&&F1.lost.log,F1.lost);
ok('Edington gewonnen (Fyrd schwach): flags.edington=\'won\', Wedmore-Wahl in der Warteschlange',F1.won.ed==='won'&&!F1.won.still&&F1.won.q&&F1.won.log,F1.won);
ok('Edington ist die erste Schlacht: danach zählt keine weitere mehr',F1.again===false);
// Spieler greift das Fyrd-Heer an (statt verteidigt): Ergebnis aus Sicht des Angreifers
const F2=await p.evaluate(async()=>{const o={};
 const wait=ms=>new Promise(r=>setTimeout(r,ms));
 for(const res of ['won','lost']){const F=step5(),f=S.player;S.turn=50;F.s5T=48;F.wxP=provsOf('usa');const a=S.armies.find(x=>x.f===f);S.prov[PI.dumnonier].owner=f;wikRound();
  const fy=S.armies.find(x=>x.fyrd);a.p=PI.dumnonier;if(!ADJ[a.p].has(fy.p)){fy.p=[...ADJ[a.p]].find(n=>S.prov[n].owner==='usa'&&!isSeaLink(n,a.p));}
  const ti=fy.p;a.mp=3;if(res==='won'){fy.units.length=Math.min(fy.units.length,2);fy.units.forEach(u=>u.men=1);S.prov[ti].gar=0;}else a.units.forEach(u=>u.men=Math.max(1,Math.round(u.men*0.15)));
  window.__cine.length=0;let st=0;const sb=window.startBattle;
  // Angriff des Spielers: Kino davor (tokAttack-Pfad), danach Berechnung
  tokAttack(a,ti,()=>{st=1;});const cine=window.__cine.slice();for(let i=0;i<40&&!st;i++)await wait(250);
  const r=resolveAttack(a,ti);battleLog(r);o[res]={cine,cb:st,win:r.win,ed:S.scen.flags.edington,at:PROV_DEF[ti].id};}
 return o;});
ok('Spieler greift das Fyrd-Heer an: Sieg → \'won\', Niederlage → \'lost\' (Sicht des Angreifers); Kino k3 vor dem Angriff (tokAttack)',F2.won.ed==='won'&&F2.won.win&&F2.lost.ed==='lost'&&!F2.lost.win&&F2.won.cine.join()==='Edington'&&F2.won.cb===1,[F2.won,F2.lost]);

// ---- (g) Wedmore-Wahl: 2 Wahlen bei lost, 3 bei won; nicht vor Edington ----
const G=await p.evaluate(()=>{const o={};
 {const F=step5(),f=S.player;const s=S.story[f];s.cine=1;s.q=[];stMsg(f,{k:'step'});const evs=stEvents(f);o.start=evs.map(x=>x.E.id+':'+x.E.title());o.startChoice=evs.some(x=>x.E.id==='st_choice');o.vkStart=(evs[0]&&evs[0].E.vk)||[];
  o.gate=storyHtml().includes('storychoice');o.prog=stProg(f,s.g,s)[0];
  // ohne Edington: Wedmore-Ereignis nicht erreichbar (kein Eintrag, Knopf fehlt)
  wikQ('wedmore');o.noEd=stEvents(f).filter(x=>x.E.id==='st_choice').length;}
 for(const res of ['lost','won']){const F=step5(),f=S.player;F.fyrd=1;wikEdSet(res);const evs=stEvents(f).filter(x=>x.E.id==='st_choice');const E=evs[0]&&evs[0].E;
  o[res]={n:evs.length,title:E&&E.title(),opts:E&&E.opts.map(x=>x.label),vk:E&&E.vk,img:E&&E.img,text:E&&E.text().slice(0,50),eb:E&&E.eb};}
 {const F=step5(),f=S.player;wikEdSet('won');F.wedQ=S.turn-5;S.turn+=1;wikQ('wedmore');wikQ('wedmore');o.dedupe=(S.story[f].q||[]).filter(m=>m.id==='wedmore').length;}
 // Wessex tot: keine dritte Wahl
 {const F=step5(),f=S.player;for(const pi of provsOf('usa'))S.prov[pi].owner=f;S.fac.usa.alive=false;S.armies=S.armies.filter(a=>a.f!=='usa');S.turn=100;wikRound();o.dead={ed:F.edington,fyrd:F.fyrd};const evs=stEvents(f).filter(x=>x.E.id==='st_choice');o.dead.n=evs[0]&&evs[0].E.opts.length;}
 return o;});
ok('Schritt 5 beginnt ohne Sofort-Wahl: Alfred-Phase als normales Schrittfenster (kein st_choice), kein „Entscheidung wartet“-Knopf, Ziel offen, Wedmore-Sprecher noch nicht',!G.startChoice&&G.start[0]==='st_step:Akt II · Wedmore'&&!G.gate&&G.prog===0&&G.vkStart.length===0&&G.noEd===0,[G.start,G.gate,G.prog,G.noEd]);
ok('Edington verloren: Wedmore-Wahl wie bisher (Taufe / alte Götter), Sprecher wikinger_wedmore, Kapitelbild Burhbau, historischer Text',G.lost.n===1&&G.lost.opts.join('|')==='Die Taufe annehmen|Den alten Göttern treu bleiben'&&G.lost.vk[0]==='wikinger_wedmore'&&G.lost.img==='vk_kap_burhbau'&&/^878\. König Alfred von Wessex schlägt/.test(G.lost.text),G.lost);
ok('Edington gewonnen: Wedmore-Wahl hat eine dritte Wahl „Wessex unterwerfen“; eigener Text (keine Aufnahme, da anderer Verlauf)',G.won.n===1&&G.won.opts.length===3&&G.won.opts[2]==='Wessex unterwerfen'&&G.won.vk.length===0&&/^878\. Bei Edington ist das Heer von Wessex/.test(G.won.text),G.won);
ok('Wedmore-Ereignis wird nicht doppelt eingereiht; Wessex untergegangen → Edington entfällt als „gewonnen“, nur zwei Wahlen',G.dedupe===1&&G.dead.ed==='won'&&G.dead.n===2,[G.dedupe,G.dead]);

// ---- (h) Wahlen und Folgen: Danelag-Vertrag, Unterwerfung ----
const H=await p.evaluate(()=>{const o={};const prep=()=>{const F=step5(),f=S.player;F.fyrd=1;F.wxP=provsOf('usa');
  S.prov[PI.icener].owner='usa';S.prov[PI.corieltauver].owner='usa';S.prov[PI.briganten].owner='usa';// Danelag-Provinzen in Wessex-Hand
  S.prov[PI.cantium].owner=f;S.prov[PI.dobunner].owner=f;// Spielerbesitz im Wessex-Teil
  const own=S.armies.find(x=>x.f===f);own.p=PI.cantium;own.boat=null;
  const wa=S.armies.find(x=>x.f==='usa');wa.p=PI.trinovanten;
  return{F,f,own,wa};};
 {const{F,f,own,wa}=prep();wikEdSet('lost');const Eev=stEvents(f).find(x=>x.E.id==='st_choice').E;
  const before={}; for(const id of ['icener','trinovanten','corieltauver','briganten','votadiner','belgae_b','dumnonier','cantium','dobunner','silurer'])before[id]=S.prov[PI[id]].owner;
  o.before=before;Eev.opts[0].fx(f);// Taufe
  const after={};for(const id in before)after[id]=S.prov[PI[id]].owner;o.after=after;
  const d=dip(f,'usa');o.dip={st:d.st,truce:d.truce,nap:d.nap-S.turn};o.flags={wedmore:F.wedmore,danelag:F.danelag,bapt:S.fac[f].bapt&&S.fac[f].bapt.c};o.dane=S.scen.dane&&{me:S.scen.dane.me.length,wes:S.scen.dane.wes.length};
  o.armyOut=S.prov[own.p].owner===f&&S.prov[wa.p].owner==='usa';o.ownP=PROV_DEF[own.p].id;o.waP=PROV_DEF[wa.p].id;
  o.log=logHas(/Danelag-Vertrag: 12 Runden Frieden mit Wessex, Grenze an der Watling Street\./);
  o.step=(()=>{const s=S.story[f];return stProg(f,s.g,s)[0];})();
  o.cine=window.__cine.slice();}
 return o;});
ok('Danelag: Taufe → Frieden 12 Runden (Waffenstillstand + Nichtangriffspakt), Wedmore erfüllt, Taufe gesetzt',H.dip.st==='peace'&&H.dip.truce===12&&H.dip.nap===12&&H.flags.wedmore===1&&H.flags.bapt==='tauf'&&H.step===1&&H.log,[H.dip,H.flags,H.step]);
ok('Danelag: Wessex-Provinzen nördlich/östlich (icener, trinovanten, corieltauver, briganten) gehen an den Spieler',H.before.icener==='usa'&&H.before.trinovanten==='usa'&&['icener','trinovanten','corieltauver','briganten'].every(id=>H.after[id]==='nord'),[H.before,H.after]);
ok('Danelag: Spielerprovinzen südlich/westlich (cantium, dobunner) gehen an Wessex; belgae_b/dumnonier bleiben Wessex; votadiner (Northumbria) und silurer bleiben unberührt',H.after.cantium==='usa'&&H.after.dobunner==='usa'&&H.after.belgae_b==='usa'&&H.after.dumnonier==='usa'&&H.after.votadiner===H.before.votadiner&&H.after.silurer===H.before.silurer,H.after);
ok('Danelag: Heere ziehen aus dem Land der Gegenseite ab; Vertrag merkt Listen für das Fenster',H.armyOut&&H.dane&&H.dane.me===4&&H.dane.wes===2,[H.ownP,H.waP,H.dane]);
await p.waitForTimeout(900);
const H2=await p.evaluate(()=>({m:mTxt().slice(0,120),shown:!!(S.scen.dane&&S.scen.dane.shown)}));
ok('Danelag: Fenster „Das Danelag“ mit Bild (Rückfall vk_e1_danelag) erscheint, sobald kein anderes Fenster offen ist',/Das Danelag/.test(H2.m)&&/Vertrag von Wedmore/i.test(H2.m)&&H2.shown,H2.m);
const H3=await p.evaluate(()=>{const o={};closeAll();
 for(const act of ['wedmore_treue']){const F=step5(),f=S.player;F.fyrd=1;S.prov[PI.trinovanten].owner='usa';S.prov[PI.cantium].owner=f;scenChoice(act);o.treue={own:S.prov[PI.trinovanten].owner,cantium:S.prov[PI.cantium].owner,ruhm:S.scen.ruhm,wed:F.wedmore,peace:dip(f,'usa').truce};}
 closeAll();
 // Unterwerfen (nur nach Sieg)
 {const F=step5(),f=S.player;F.fyrd=1;wikEdSet('won');S.prov[PI.trinovanten].owner='usa';S.prov[PI.cantium].owner=f;const r0=S.scen.ruhm||0;const Eev=stEvents(f).find(x=>x.E.id==='st_choice').E;Eev.opts[2].fx(f);
  const d=dip(f,'usa');o.sub={vas:d.vas,st:d.st,ruhm:S.scen.ruhm-r0,wed:F.wedmore,dane:F.danelag==null,tri:S.prov[PI.trinovanten].owner,cantium:S.prov[PI.cantium].owner,lord:lordOf('usa')===f,log:logHas(/Alfred beugt das Knie/),step:stProg(f,S.story[f].g,S.story[f])[0]};
  storyRound();o.sub.next=S.story[f].i;}
 return o;});
ok('Treue: ebenfalls Danelag-Vertrag (Tausch + 12 Runden Frieden), Ruhm +15 aus Wedmore-Treue bleibt',H3.treue.own==='nord'&&H3.treue.cantium==='usa'&&H3.treue.peace===12&&H3.treue.wed===1&&H3.treue.ruhm>=15,H3.treue);
ok('Wessex unterwerfen (nur nach gewonnenem Edington): Wessex wird Vasall (makeVassal), Ruhm +25, Schritt erfüllt → Normandie, KEIN Danelag-Vertrag (Provinzen unverändert)',H3.sub.vas==='usa'&&H3.sub.ruhm===25&&H3.sub.wed===1&&H3.sub.dane&&H3.sub.tri==='usa'&&H3.sub.cantium==='nord'&&H3.sub.lord&&H3.sub.log&&H3.sub.step===1&&H3.sub.next===6,H3.sub);

// ---- (i) Alte Spielstände ----
const I=await p.evaluate(()=>{const o={},rows=[];
 for(const old of [0,3,4,5,6,7,8,9,10,11]){setup();const f=S.player,s=S.story[f];s.i=old;s.g={cond:'choice',flag:'x',txt:'alt'};s.t0=S.turn;s.q=[];delete S.scen.w6;delete S.scen.flags.alfred;delete S.scen.flags.wikT0;
  const raw=JSON.parse(JSON.stringify(S));let err=null;try{loadGame(raw);}catch(e){err=String(e);}closeAll();
  const s2=S.story[S.player],F=S.scen.flags;
  rows.push({old,i:s2.i,w6:S.scen.w6,alf:!!S.armies.find(a=>a.f==='usa'&&a.gen.n==='Alfred'),g:s2.g&&(s2.g.flag||s2.g.cond),ed:F.edington||null,q:(s2.q||[]).some(m=>m.id==='wedmore'),err,t:SCEN.wikinger.chapter.steps[s2.i]&&SCEN.wikinger.chapter.steps[s2.i].t});}
 o.rows=rows;
 // Umrechnung nur einmal: erneutes Laden ändert nichts
 setup();S.story[S.player].i=10;delete S.scen.w6;loadGame(JSON.parse(JSON.stringify(S)));closeAll();const i1=S.story[S.player].i;loadGame(JSON.parse(JSON.stringify(S)));closeAll();o.twice=[i1,S.story[S.player].i];
 // Neues Spiel trägt die Marke
 setup();o.newMark=S.scen.w6;
 // Altstand bei Wedmore: Wahl kommt sofort (historisch verloren), danach geht es weiter
 setup();const f=S.player,s=S.story[f];s.i=5;s.g={cond:'choice',flag:'wedmore',txt:'x'};delete S.scen.w6;loadGame(JSON.parse(JSON.stringify(S)));closeAll();
 const ch=stEvents(S.player).filter(x=>x.E.id==='st_choice');o.wedOld={n:ch.length,opts:ch[0]&&ch[0].E.opts.length};ch[0]&&ch[0].E.opts[1].fx(S.player);storyRound();o.wedOld.next=S.story[S.player].i;
 // Rundenlauf nach dem Laden
 try{newRound();o.round=true;}catch(e){o.round=String(e);}
 return o;});
const row=n=>I.rows.find(r=>r.old===n);
ok('Alter Spielstand: Schrittindex wird umgerechnet 0–5 unverändert, Paris→Normandie, Normandie→Normandie, Waräger/Miklagard→Miklagard, Island/Vinland→Vinland',[[0,0],[3,3],[4,4],[5,5],[6,6],[7,6],[8,7],[9,7],[10,8],[11,8]].every(([o,n])=>row(o).i===n&&!row(o).err&&row(o).w6===1),I.rows.map(r=>r.old+'→'+r.i));
ok('Alter Spielstand: Ziel des neuen Schritts wird neu aufgelöst (Normandie/Miklagard/Vinland: Wahl-Ziel mit passender Kennung)',row(6).g==='normandie'&&row(7).g==='normandie'&&row(8).g==='miklagard'&&row(10).g==='vinland'&&row(11).g==='vinland',I.rows.map(r=>r.old+':'+r.g));
ok('Alter Spielstand ab Schritt 4: Alfred wird still nachgetragen; bei Wedmore (alt) gilt Edington als verloren und die Wahl kommt sofort; davor nichts',row(3).alf===false&&row(4).alf&&row(5).alf&&row(5).ed==='lost'&&row(5).q&&row(4).ed==null&&!row(4).q,I.rows.map(r=>r.old+':'+r.alf+':'+r.ed+':'+r.q));
ok('Alter Spielstand bei Wedmore: Wahl mit zwei Optionen (kein Sieg-Weg), danach weiter zu Normandie; Umrechnung nur einmal; neues Spiel trägt die Marke; Runde läuft',I.wedOld.n===1&&I.wedOld.opts===2&&I.wedOld.next===6&&I.twice[0]===8&&I.twice[1]===8&&I.newMark===1&&I.round===true,[I.wedOld,I.twice,I.newMark,I.round]);

// ---- (j) Vinland mit Island, Miklagard-Kino ----
const J=await p.evaluate(()=>{const o={};setup();const f=S.player;S.fac[f].gold=1000;gotoStep(8);const C=SCEN.wikinger.chapter,s=S.story[f];
 const E=stChoiceEv(C.steps[8],s,C).E;o.opts=E.opts.map(x=>x.label);o.cine=!!E.cine&&E.cine.title;o.eb=E.eb;
 const r0=S.scen.ruhm||0,g0=S.fac[f].gold;E.opts[1].fx(f);o.isl={gold:g0-S.fac[f].gold,ruhm:(S.scen.ruhm||0)-r0,island:S.scen.flags.island,vin:S.scen.flags.vinland,prog:stProg(f,s.g,s)[0]};
 setup();S.fac[S.player].gold=500;gotoStep(8);stChoiceEv(C.steps[8],S.story[S.player],C).E.opts[1].fx(S.player);o.arm={vin:S.scen.flags.vinland||null,gold:S.fac[S.player].gold};
 setup();gotoStep(7);const E7=stChoiceEv(C.steps[7],S.story[S.player],C).E;o.mik=E7.cine&&E7.cine.title;
 return o;});
ok('Vinland: Island fließt als zweite Wahl ein (700 Gold, Ruhm +50, beide Merker, Ziel erfüllt); zu wenig Gold → nichts; Kino „Über das Nordmeer“ bei Vinland, „Der Weg der Waräger“ bei Miklagard',J.opts.join('|')==='Nach Vinland fahren (400 Gold)|Erst Island und Grönland besiedeln, dann nach Vinland (700 Gold)|Noch warten'&&J.isl.gold===700&&J.isl.ruhm===50&&J.isl.island===1&&J.isl.vin===1&&J.isl.prog===1&&J.arm.vin==null&&J.arm.gold===500&&J.cine==='Über das Nordmeer'&&J.mik==='Der Weg der Waräger',J);

// ---- (k) Vollständiger Rundenlauf durch Schritt 5 (newRound) ----
const K=await p.evaluate(()=>{const o={};const F=step5(),f=S.player;S.fac[f].gold=3000;F.wxP=provsOf('usa');const seen={chipp:null,fyrd:null};
 const t0=S.turn;let err=null;
 for(let i=0;i<14;i++){try{newRound();}catch(e){err=String(e);break;}if(seen.chipp==null&&F.chipp!=null)seen.chipp=S.turn-t0;if(seen.fyrd==null&&F.fyrd)seen.fyrd=S.turn-t0;}
 o.err=err;o.seen=seen;o.chippSeason=F.chipp!=null?((F.chipp%4)+4)%4:null;o.fyrdArmy=S.armies.some(a=>a.fyrd);o.ed=F.edington||null;o.rounds=S.turn-t0;
 o.burhN=F.burhN||0;
 return o;});
ok('Rundenlauf (newRound) durch Schritt 5: Chippenham im Winter (Jahreszeit 3), Fyrd spätestens nach 9 Runden, keine Ausnahme',!K.err&&K.chippSeason===3&&K.seen.chipp!=null&&K.seen.fyrd!=null&&K.seen.fyrd<=10,K);

// ---- (l) Kontrollen: Endlosspiel, andere Geschichte, beendete Geschichte ----
const L=await p.evaluate(()=>{const o={};
 newGame('nord');try{closeModal();}catch(e){}{o.endlos={on:wikOn(),open:wikOpen('usa'),round:(()=>{try{wikRound();newRound();return true;}catch(e){return String(e);}})(),flags:!!(S.scen),fyrdArmies:S.armies.some(a=>a.fyrd||a.alf),burh:S.prov.some(P=>P.b.burh>0&&P.owner==='usa'),k3:wikK3(S.armies[0],S.armies[0].p),mig:(()=>{try{wikMigrate();return true;}catch(e){return String(e);}})()};}
 startScenario('caesar');try{closeModal();}catch(e){}{o.caesar={on:wikOn(),w6:S.scen.w6,hooks:Object.keys(SCEN.caesar.hooks||{}).join(),round:(()=>{try{wikRound();newRound();return true;}catch(e){return String(e);}})(),noSub:scenNoSubmit('usa')};}
 setup();S.scen.over=true;o.over={on:wikOn(),open:wikOpen('usa')};
 return o;});
ok('Kontrolle Endlosspiel: Alfred-Skript, Fyrd, Burh-Takt, Kino und Umrechnung greifen nicht; Runde läuft',!L.endlos.on&&!L.endlos.open&&L.endlos.round===true&&!L.endlos.flags&&!L.endlos.fyrdArmies&&L.endlos.k3==null&&L.endlos.mig===true,L.endlos);
ok('Kontrolle andere Geschichte (Caesar): keine Wikinger-Marke, kein Skript, Runde läuft; beendete Wikinger-Geschichte: Skript aus',!L.caesar.on&&L.caesar.w6==null&&L.caesar.round===true&&!L.caesar.noSub&&!L.over.on&&!L.over.open,[L.caesar,L.over]);
ok('Keine Konsolenfehler und keine Seitenfehler',!errs.length,errs.slice(0,6));
const nP=R.filter(x=>x).length;console.log(`${nP} PASS / ${R.length-nP} FAIL`);console.log(R.every(x=>x)?'ALLE PASS':'FEHLER '+R.filter(x=>!x).length);await b.close();process.exit(R.every(x=>x)?0:1);})();
