// node vk_kampagne_t.js <html> [port] – Prüfung der Wikinger-Kampagne (SCEN.wikinger) auf Spielbarkeit; Bericht: dev/docs/pruef_wikinger_kampagne.md
// PASS/FAIL = geprüfte Tatsachen (so funktioniert der Code heute). BEFUND = bekanntes Problem liegt vor (kein Fehlschlag, nur Meldung).
// INFO = Messwerte. Schritte, die zufällige Schlachten enthalten, werden mehrfach gewürfelt (Quoten statt Einzelwerte).
// Abkürzungen im Test (gekennzeichnet "Abkürzung"): Schrittbedingungen per Eintrag in S.scen.flags / Besitz erfüllt, wo der Weg dorthin Hunderte Runden kostet.
const {chromium}=require('playwright');
const FILE=process.argv[2]||require('path').join(__dirname,'..','imperium.html'),PORT=process.argv[3]||'8772';
(async()=>{const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:process.env.PW_GPU?[]:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const R=[];const ok=(n,c,i='')=>{R.push(!!c);console.log((c?'PASS ':'FAIL ')+n+(i!==''?'  '+JSON.stringify(i):''));};
const bef=(n,problem,i='')=>{console.log((problem?'BEFUND ':'ok-kein-Befund ')+n+(i!==''?'  '+JSON.stringify(i):''));};
const info=(n,i)=>console.log('INFO '+n+'  '+JSON.stringify(i));
const fs=require('fs');
const ctx=await b.newContext({viewport:{width:1024,height:768},hasTouch:true,isMobile:true});const p=await ctx.newPage();const errs=[];
p.on('pageerror',e=>errs.push('PAGE '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|WebGL|GPU stall/.test(m.text()))errs.push('CON '+m.text().slice(0,200));});
await p.addInitScript(()=>{try{localStorage.setItem('imperium.gfx',JSON.stringify({q:'leicht'}));}catch(e){}});
await p.route(/cdnjs/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));
await p.route(/fonts\.g/,r=>r.abort());await p.route(/\.html$/,r=>r.fulfill({body:fs.readFileSync(FILE),contentType:'text/html; charset=utf-8'}));
await p.goto(`http://localhost:${PORT}/imperium.html`,{timeout:300000});await p.waitForFunction(()=>document.getElementById('loading').hidden,null,{timeout:300000});
await p.waitForFunction(()=>!document.querySelector('#loading[data-gate]'),null,{timeout:120000}).catch(()=>{});await p.waitForTimeout(1500);
// ---- Hilfsfunktionen in der Seite
await p.evaluate(()=>{
 window.playCine=(o,d)=>{d&&d();};window.showEvent=(E,c,n)=>{n&&n();};
 window.errsW=[];const _w=console.warn;console.warn=function(){errsW.push([...arguments].map(x=>x&&x.message||String(x)).join(' ').slice(0,200));_w.apply(console,arguments);};
 window.setup=()=>{startScenario('wikinger');try{closeModal();}catch(e){}storyRound();};
 // Runde beenden; Angriffsfenster der KI („greift an“) und andere Fenster mit dem ersten Knopf weiterklicken (closeModal würde endTurn hängen lassen)
 window.turn=async()=>{const t0=S.turn,sl=ms=>new Promise(z=>setTimeout(z,ms));for(let k=0;k<3&&S.turn===t0;k++){document.querySelectorAll('.cine').forEach(e=>e.remove());if(S.over)return false;if(!busy)endTurn();for(let j=0;j<240&&busy;j++){const m=document.querySelector('#modal');if(m&&!m.hidden){const bt=m.querySelector('button');if(bt)bt.click();}await sl(50);}await sl(30);}try{closeModal();}catch(e){}return S.turn!==t0;};
 window.gotoStep=i=>{const f=S.player,s=S.story[f],C=SCEN.wikinger.chapter;s.i=i;s.t0=S.turn;s.w0=stW(f);s.sw0=stv(f,'seewin');s.g=stResolve(f,C.steps[i].g);s.done=false;s.end=false;s.q=[];return s;};
 window.choiceEv=i=>{const s=S.story[S.player],C=SCEN.wikinger.chapter;return stChoiceEv(C.steps[i],s,C).E;};
 // Flotte mit Heer zur Küste von Provinz id fahren; gibt {ok,rounds}
 window.sailTo=(a,fl,id)=>{let t=0;for(;t<8;t++){const r=moveFleet(fl,PI[id]);if(landTargets(fl).includes(PI[id]))return{ok:true,rounds:t+1};if(!r)return{ok:false,rounds:t+1,nullPath:true};fl.mp=fleetRange(fl);}return{ok:false,rounds:t};};
 window.startFleet=()=>{const f=S.player,a=S.armies.find(x=>x.f===f&&x.p===PI.viken),fl=S.fleets.find(x=>x.f===f);return{a,fl};};
});
// ===== 1. Startlage
const s1=await p.evaluate(()=>{setup();const f=S.player,I=income(f);const ids=['kaleter','parisier','lexovier','ilmen','smolensk','neurer','dregowitschen','briganten','votadiner'];
 const prov={};for(const id of ids){const i=PI[id];prov[id]={act:isAct(i),owner:S.prov[i].owner,coast:!!feat(i).coast};}
 const R0=SCEN.wikinger.reveal;return{turn:S.turn,t0:S.scen.t0,year:S.year,gold:S.fac[f].gold,net:I.net,tax:I.tax,upk:I.upk,hof:I.hof,prov,names:['island','gronland','groenland','vinland','miklagard','konstantinopel'].map(id=>id+':'+(PI[id]==null?'-':'ja')),
  dip:['briten','usa','mogul','vijaya','arverner','slawen','polen','osmanen','germanen'].map(x=>x+':'+dip(f,x).st),story0:stProg(f,S.story[f].g,S.story[f]),known:['ilmen','neurer','aestier','kaleter'].map(id=>id+':'+(S.known?!!S.known[PI[id]]:null)),
  men:S.armies.filter(a=>a.f===f).map(a=>a.units.length+'E/'+a.units.reduce((s,u)=>s+u.men,0)+'M')};});
info('Start',s1);
ok('Waräger-Ziele (ilmen, smolensk, neurer, dregowitschen) existieren, sind aktiv und liegen im Binnenland',['ilmen','smolensk','neurer','dregowitschen'].every(k=>s1.prov[k].act&&!s1.prov[k].coast),s1.prov);
ok('Island, Grönland, Vinland, Miklagard sind keine Provinzen (reine Wahl-Schritte ohne Karte)',s1.names.every(x=>x.endsWith(':-')),s1.names);
ok('Krieg nur mit Northumbria, Rest Frieden',s1.dip[0]==='briten:war'&&s1.dip.slice(1).every(x=>x.endsWith(':peace')),s1.dip);
bef('Haushalt zum Start im Minus (Sold der 10 Einheiten höher als Steuern)',s1.net<0,{net:s1.net,steuern:s1.tax,sold:s1.upk,gold:s1.gold});
bef('Geschichte beginnt in Runde '+s1.turn+' (Schonfrist `S.turn<grace` greift nur über epShield)',s1.turn>10,s1.turn);
// ===== 2. Fahrt und Landung (Akt I)
const s2=await p.evaluate(()=>{const out={reach:{},land:{}};
 for(const id of ['votadiner','briganten','kaleter','lexovier','ulaid','orkney','kimbern']){setup();const{a,fl}=startFleet();embark(a,fl);out.reach[id]=sailTo(a,fl,id);}
 for(const id of ['skane','seeland','svear','esten','aestier','karelien','gotland']){setup();const{a,fl}=startFleet();embark(a,fl);out.reach[id]=sailTo(a,fl,id);}
 setup();{const{a,fl}=startFleet();embark(a,fl);out.raubAnBord=canRaub(a);}
 const trial=(tgt,rz,pre)=>{setup();if(pre)pre();const{a,fl}=startFleet();embark(a,fl);const r=sailTo(a,fl,tgt);if(!r.ok)return{unreach:true};if(rz)a.rz=true;const g0=S.scen.flags.beute||0;const d=disembark(a,fl,PI[tgt])||{};const q=d.res||{};return{win:q.win,capt:!!q.captured,siege:!!q.siegeStarted,landed:!!d.landed,loot:q.loot||0,lost:q.attLost||0,beute:(S.scen.flags.beute||0)-g0};};
 const many=(n,f)=>Array.from({length:n},f);
 out.land.votNoRz=many(6,()=>trial('votadiner',false));out.land.votRz=many(4,()=>trial('votadiner',true));
 out.land.brigNoRz=many(6,()=>trial('briganten',false));out.land.brigRz=many(6,()=>trial('briganten',true));
 out.land.kaleter=many(4,()=>trial('kaleter',false,()=>declareWar(S.player,'arverner')));out.land.lexovier=many(3,()=>trial('lexovier',false,()=>declareWar(S.player,'arverner')));
 return out;});
info('Seewege (Runden bis Küste/ Anlandung möglich)',s2.reach);
ok('Votadiner, Briganten, Kaleter, Lexovier, Irland, Orkney, Kimbern sind in ≤4 Runden anlandbar',['votadiner','briganten','kaleter','lexovier','ulaid','orkney','kimbern'].every(k=>s2.reach[k].ok&&s2.reach[k].rounds<=4),s2.reach);
bef('Ostsee ist mit der Flotte nicht befahrbar (Skane, Seeland, Svear, Esten, Karelien, Gotland: kein Seeweg)',['skane','seeland','svear','esten','aestier','karelien','gotland'].every(k=>!s2.reach[k].ok),s2.reach);
const q=a=>a.filter(x=>x.win).length;
ok('Raubzug an Bord nicht einschaltbar (canRaub: „An Bord eines Schiffes“)',!s2.raubAnBord.ok&&/Bord/.test(s2.raubAnBord.why),s2.raubAnBord);
ok('Landung Votadiner (ohne Raubzug): Sieg und Eroberung (≥5 von 6), keine Beute',q(s2.land.votNoRz)>=5&&s2.land.votNoRz.filter(x=>x.capt).length>=5&&s2.land.votNoRz.every(x=>x.beute===0),s2.land.votNoRz.map(x=>[x.win,x.capt]));
ok('Landung Votadiner mit (nur im Test gesetztem) Raubzug: Beute, keine Eroberung',s2.land.votRz.every(x=>x.win&&!x.capt&&x.loot>0),s2.land.votRz.map(x=>[x.win,x.capt,x.loot]));
info('Landung Briganten (Jórvík) ohne Raubzug: Siege von 6',{win:q(s2.land.brigNoRz),res:s2.land.brigNoRz.map(x=>[x.win,x.siege,x.lost])});
info('Landung Briganten mit gesetztem Raubzug (im Spiel nicht möglich): Siege von 6',{win:q(s2.land.brigRz),loot:s2.land.brigRz.map(x=>x.loot)});
bef('Landungsschlacht bei Jórvík wird meist verloren (≤2 von 6 Siegen ohne Raubzug)',q(s2.land.brigNoRz)<=2,q(s2.land.brigNoRz));
ok('Landung bei Kaleter und Lexovier (Franken): Sieg und Eroberung in allen Versuchen',[...s2.land.kaleter,...s2.land.lexovier].every(x=>x.win&&x.capt),[...s2.land.kaleter,...s2.land.lexovier].map(x=>[x.win,x.capt,x.lost]));
// ===== 3. Raubzug nach der Landung (Beute je Provinz) und Haushalt in den ersten Runden
const s3=await p.evaluate(async()=>{setup();const f=S.player;let{a,fl}=startFleet();const aid=a.id;embark(a,fl);const o=[];
 for(let i=0;i<10;i++){a=S.armies.find(x=>x.id===aid);if(!a){o.push('Heer verloren');break;}let act='';
  if(a.boat){moveFleet(fl,PI.votadiner);if(landTargets(fl).includes(PI.votadiner)){const d=disembark(a,fl,PI.votadiner);act='Landung '+(d.res&&d.res.captured?'erobert':'?');}else act='Fahrt';}
  else if(a.mp>0){const T=[...ADJ[a.p]].filter(n=>!isSeaLink(a.p,n)&&S.prov[n].owner!=='frei'&&S.prov[n].owner!==f&&atWar(f,S.prov[n].owner)&&dvSev(n)===0).sort((x,y)=>PROV_DEF[y].tax-PROV_DEF[x].tax);
   const men=a.units.reduce((s,u)=>s+u.men,0);if(T.length&&men>=350){setRaub(a,true);const res=resolveAttack(a,T[0]);act='Raubzug '+PROV_DEF[T[0]].id+' Sieg='+res.win+' Beute='+(res.loot||0);}else act='warten';}
  await turn();o.push(`R${S.turn-S.scen.t0} ${act} | Gold ${Math.round(S.fac[f].gold)} Beute ${Math.round(S.scen.flags.beute||0)} Ruhm ${Math.round(S.scen.ruhm||0)} Mann ${a.units.reduce((s,u)=>s+u.men,0)}/${a.units.length}E`);}
 return {o,beute:S.scen.flags.beute||0,ruhm:S.scen.ruhm,gold:S.fac[f].gold,units:a?a.units.length:0,need:SCEN.wikinger.chapter.steps.map(st=>st.g?Math.min(30,Math.max(3,Math.round(scenNeed(f,stResolve(f,st.g))))):null)};});
console.log(s3.o.join('\n'));
ok('Raubzug von Votadiner aus bringt Beute und Ruhm (erste Runden)',s3.beute>0&&s3.ruhm>0,{beute:Math.round(s3.beute),ruhm:Math.round(s3.ruhm)});
bef('Beute 150 gegen Northumbria allein nach 10 Runden nicht erreicht (nur Briganten, Votadiner, Silurer als Ziele)',s3.beute<150,Math.round(s3.beute));
bef('Sold übersteigt Einnahmen: Gold nach 10 Runden bei 0, Einheiten desertieren',s3.gold<=0,{gold:Math.round(s3.gold),einheiten:s3.units});
info('Frist-Verlängerung je Schritt (scenNeed, Runden)',s3.need);
// ===== 4. Schrittkette per Abkürzung: Ereignisse, Belohnungen, Haken, Ende
const s4=await p.evaluate(()=>{setup();const f=S.player;S.fac[f].gold=2000;const C=SCEN.wikinger.chapter,evs=[],o=[];const w0=errsW.length;let endE=null;
 const drain=tag=>{for(const e of stEvents(f)){const x=e.E;if(x.id==='st_end')endE=x;let ti='';try{ti=x.title();}catch(er){ti='FEHLER '+er.message;}evs.push({tag,id:x.id,ti,cine:!!x.cine,vk:x.vk,img:x.img,opts:x.opts.length});}};
 drain('start');const pick=k=>{const s=S.story[f],E=stChoiceEv(C.steps[s.i],s,C).E;E.opts[k].fx(f);};
 const sat=[()=>{S.scen.flags.beute=150;},()=>{S.scen.flags.beute=700;},()=>{S.scen.ruhm=60;},()=>{S.prov[PI.briganten].owner=f;},()=>{const P=S.prov[PI.briganten];P.ln=2;P.lnF=f;P.lnT=S.turn-7;},()=>pick(0),()=>{S.prov[PI.kaleter].owner=f;},()=>pick(0),()=>{S.prov[PI.ilmen].owner=f;},()=>pick(0),()=>pick(0),()=>pick(0)];
 let hook=null;for(let i=0;i<sat.length;i++){if(S.story[f].i!==i){o.push('Index '+S.story[f].i+' statt '+i);break;}const g0=S.fac[f].gold;sat[i]();storyRound();drain(i);o.push([i,S.story[f].i,Math.round(S.fac[f].gold-g0)]);
  if(i===2)hook={tron:S.prov[PI.trondelag].owner,hael:S.prov[PI.haelsingland].owner,polen:alive('polen')};}
 const end=S.story[f].end;let fin=null;if(endE){const m0=S.mods.length;endE.opts[1].fx(f);fin={over:S.scen.over,res:S.scen.res,rank:S.scen.rank,mods:S.mods.length-m0,gold:!!SCEN.wikinger.gold(f)};}
 return{o,hook,end,fin,evs,warn:errsW.slice(w0),n:C.steps.length};});
ok('Alle 12 Schritte laufen nacheinander durch (Abkürzung), Index stimmt',s4.o.length===12&&s4.o.every(x=>Array.isArray(x)&&x[1]===x[0]+1)&&s4.end,s4.o);
ok('Haken nach „Das Thing“: Lade und Hälsingland gehören dem Spieler, Polen erloschen',s4.hook&&s4.hook.tron&&s4.hook.hael&&!s4.hook.polen,s4.hook);
ok('Alle Ereignisse der Kette lassen sich bauen (Titel, kein Fehler); Wahlschritte als st_choice',s4.evs.length>=13&&s4.evs.every(e=>!/FEHLER/.test(e.ti))&&s4.evs.filter(e=>e.id==='st_choice').length===5,s4.evs.map(e=>e.id+':'+e.ti));
ok('Saga-Ende: Sieg gewertet (scenWin), Rang gesetzt, Vermächtnis-Modifikator',s4.fin&&s4.fin.over&&s4.fin.res==='win'&&!!s4.fin.rank&&s4.fin.mods>=1,s4.fin);
ok('Keine Warnungen aus Haken/Wahlen in der Kette',!s4.warn.length,s4.warn);
bef('Gold-Rang verlangt 1500 Beute und Vinland (in der Abkürzung nicht erfüllt)',s4.fin&&!s4.fin.gold,s4.fin);
// ===== 5. Wahl-Schritte einzeln (Folgen, Fehlerfälle)
const s5=await p.evaluate(()=>{const o={};const run=(i,k,gold)=>{setup();const f=S.player;gotoStep(i);S.fac[f].gold=gold;const E=choiceEv(i);const w0=errsW.length;let ex=null;try{E.opts[k].fx(f);}catch(e){ex=e.message;}const s=S.story[f];return{ex,warn:errsW.slice(w0).length,prog:stProg(f,s.g,s),gold:Math.round(S.fac[f].gold),ruhm:Math.round(S.scen.ruhm||0),flags:JSON.stringify(S.scen.flags),bapt:S.fac[f].bapt&&S.fac[f].bapt.c};};
 o.wedT=run(5,0,500);o.wedG=run(5,1,500);o.norJa=run(7,0,500);o.norNein=run(7,1,500);o.mikG=run(9,0,0);o.mikH=run(9,1,500);o.isl=run(10,0,500);o.islArm=run(10,0,100);o.islWart=run(10,1,500);o.vin=run(11,0,500);o.vinArm=run(11,0,100);o.vinWart=run(11,1,500);
 {setup();const f=S.player;gotoStep(7);createArmy('arverner',PI.kaleter,['spear','sword']);choiceEv(7).opts[0].fx(f);o.norJaZustand={kal:S.prov[PI.kaleter].owner,lex:S.prov[PI.lexovier].owner,fremd:S.armies.filter(a=>a.p===PI.kaleter&&a.f!==f).map(a=>a.f),dip:dip(f,'arverner').st,truce:dip(f,'arverner').truce,kul:S.prov[PI.kaleter].cul};}
 {setup();const f=S.player;gotoStep(9);choiceEv(9).opts[0].fx(f);const a=S.armies.find(x=>x.f===f&&x.gen&&/Harald/.test(x.gen.n));o.mikGarde=a?{e:a.units.map(u=>u.v),p:PROV_DEF[a.p].id}:null;}
 o.descIsland=choiceEv(10).opts[0].desc();o.descVinland=choiceEv(11).opts[0].desc();return o;});
ok('Wedmore: beide Wahlen ohne Fehler, Ziel erfüllt; Taufe setzt bapt=tauf, Treue Ruhm +15',!s5.wedT.ex&&!s5.wedG.ex&&s5.wedT.prog[0]===1&&s5.wedG.prog[0]===1&&s5.wedT.bapt==='tauf'&&s5.wedG.ruhm===15,[s5.wedT,s5.wedG]);
ok('Normandie: „Lehen“ gibt Seinemündung und Lexovier, Frieden 10 Runden; „Weiter plündern“ +400 Gold und +400 Beute',!s5.norJa.ex&&s5.norJaZustand.kal==='nord'&&s5.norJaZustand.lex==='nord'&&s5.norJaZustand.dip==='peace'&&s5.norJaZustand.truce===10&&s5.norNein.gold===900&&/"beute":400/.test(s5.norNein.flags),[s5.norJaZustand,s5.norNein.gold]);
bef('Normandie „Lehen“: fränkisches Heer bleibt in der nun eigenen Provinz Seinemündung, Kultur bleibt keltisch',s5.norJaZustand.fremd.length>0,s5.norJaZustand);
ok('Miklagard: Garde = 2 Einheiten Warägergarde im Heer „Harald Hardrada“ in der Hauptstadt (+400 Gold); „handeln“ ohne Fehler',!s5.mikG.ex&&s5.mikG.gold===400&&s5.mikGarde&&s5.mikGarde.e.join()==='varanger,varanger'&&!s5.mikH.ex,[s5.mikG.gold,s5.mikGarde]);
ok('Island und Vinland: mit genug Gold Ruhm +20/+30 und Ziel erfüllt',s5.isl.gold===200&&s5.isl.ruhm===20&&s5.isl.prog[0]===1&&s5.vin.gold===100&&s5.vin.ruhm===30&&s5.vin.prog[0]===1,[s5.isl,s5.vin]);
ok('Island und Vinland mit zu wenig Gold: nichts passiert, Ziel offen, kein Fehler',s5.islArm.prog[0]===0&&s5.vinArm.prog[0]===0&&!s5.islArm.ex&&s5.islArm.gold===100,[s5.islArm,s5.vinArm]);
ok('„Noch warten“ lässt das Ziel offen',s5.islWart.prog[0]===0&&s5.vinWart.prog[0]===0);
bef('Island/Vinland: Beschreibung verspricht Siedlungen und „Bevölkerung der Heimat entlastet“, der Code bucht nur Gold, Ruhm und Meldung (kein Bevölkerungs- oder Kartenwirkung)',true,[s5.descIsland,s5.descVinland]);
// ===== 6. Landnahme: Voraussetzungen (Abkürzung: Besitz Briganten, Heer dort)
const s6=await p.evaluate(()=>{setup();const f=S.player;const P=S.prov[PI.briganten];P.owner=f;const a=S.armies.find(x=>x.f===f&&x.p===PI.viken);a.p=PI.briganten;S.fac[f].gold=1000;const r=[];
 r.push(lnCan(f,PI.briganten).why);S.turn=S.scen.t0+12;r.push(lnCan(f,PI.briganten).why);S.fac[f].rzReg={britannien:3};const ok0=lnCan(f,PI.briganten);r.push(ok0.ok+':'+ok0.cost);
 const st=lnStart(f,PI.briganten);const L1=lnOf(PI.briganten);const g=S.story[f];return{r,st,L1,lnt:LN.t2,cost:lnCost(),need:Math.round(scenNeed(f,{cond:'landnahme'}))};});
ok('Landnahme-Voraussetzungen: ab Runde 10, 3 Plünderungen in der Region, Heer in der Provinz, 165 Gold; Lager startet',/Frühestens/.test(s6.r[0])&&/Erst 3 Plünderungen/.test(s6.r[1])&&s6.r[2]==='true:165'&&s6.st&&s6.L1===1,s6);
// ===== 7. Waräger-Weg: Heerzug von Gautar aus
const s7=await p.evaluate(()=>{setup();const f=S.player;const a=S.armies.find(x=>x.f===f&&x.p===PI.viken);a.p=PI.gautar;a.mp=maxMP(a);const Rm=reachMap(a,30),o={};for(const id of ['svear','esten','aestier','ostgauten','ilmen','smolensk','neurer','dregowitschen'])o[id]=Rm.get(PI[id])?Rm.get(PI[id]).t:null;
 const ng=isNeutralFor(f,PI.svear);const adj={ilmen:[...ADJ[PI.ilmen]].map(n=>PROV_DEF[n].id),esten:[...ADJ[PI.esten]].map(n=>PROV_DEF[n].id),aestier:[...ADJ[PI.aestier]].map(n=>PROV_DEF[n].id),aukstaiten:[...ADJ[PI.aukstaiten]].map(n=>PROV_DEF[n].id)};
 return{o,ng,adj,gar:['esten','ilmen','aestier','aukstaiten','dregowitschen'].map(id=>id+':'+S.prov[PI[id]].gar+'/'+S.prov[PI[id]].owner),polenDip:dip(f,'osmanen').st};});
info('Heerzug Gautar → Waräger (Runden bis erreichbar; null = nur über Eroberung der Zwischenprovinz)',s7);
ok('Esten und Aestier (frei) sind in ≤2 Runden erreichbar, die vier Ziele selbst erst nach Eroberung dieser Brückenprovinzen',s7.o.esten<=2&&s7.o.aestier<=2&&s7.o.ilmen===null&&s7.o.dregowitschen===null,s7.o);
// ===== 8. Kino, Sprecher, Bilder je Schritt
await p.evaluate(()=>{try{pkLoad('pk_vk');}catch(e){}});await p.waitForTimeout(2500);
const s8=await p.evaluate(async()=>{const X=await (await fetch('audio/x_wikinger.json')).json(),XK=await (await fetch('audio/x_wikinger_kino.json')).json();setup();const C=SCEN.wikinger.chapter;const has=k=>{try{return!!heroImg(k,0,false);}catch(e){return false;}};
 const rows=C.steps.map((st,i)=>{const vk=stVk('wikinger',st,{i});const kin=st.kino?VK_KINO[st.kino]:null;return{i,t:st.t,img:st.img||null,imgOk:st.img?has(st.img):null,fallback:st.img?null:(st.choice?'ev_thron':stImg(st,st.g)),vk:vk.join()||null,vkOk:vk.length?vk.every(k=>!!X[k]&&X[k].length>1000):null,kino:st.kino||null,kinoImgs:kin?kin.ikeys.every(has):null,kinoVoice:kin?kin.keys.every(k=>!!XK[k]&&XK[k].length>1000):null};});
 const E=(id)=>VK_KINO[id];return{rows,intro:{imgs:E('intro').ikeys.every(has),voice:E('intro').keys.every(k=>!!XK[k]),kap:C.kino},ends:{e1:E('e1').ikeys.every(has)&&!!XK.wikinger_kino4a,e2:E('e2').ikeys.every(has)&&!!XK.wikinger_kino4b},introVo:!!X.wikinger_intro,endeVo:!!X.wikinger_ende};});
console.log('Schritt | Kapitelbild | Ersatzbild | Sprecher | Kino');for(const r of s8.rows)console.log(`${r.i} ${r.t} | ${r.img?r.img+(r.imgOk?' ok':' FEHLT'):'-'} | ${r.fallback||'-'} | ${r.vk||'KEINER'}${r.vk&&!r.vkOk?' (Datei fehlt)':''} | ${r.kino?r.kino+(r.kinoImgs&&r.kinoVoice?' ok':' unvollständig'):'-'}`);
ok('Alle vorhandenen Kapitelbilder, Kino-Bilder und Sprecher-Dateien sind im Paket',s8.rows.every(r=>(r.img==null||r.imgOk)&&(r.vk==null||r.vkOk)&&(r.kino==null||(r.kinoImgs&&r.kinoVoice)))&&s8.intro.imgs&&s8.intro.voice&&s8.ends.e1&&s8.ends.e2&&s8.introVo&&s8.endeVo,s8);
bef('Landnahme und Wedmore haben keinen Sprecher (ki:0); Normandie, Waräger, Miklagard, Island ohne eigenes Kapitelbild (Ersatzbild)',s8.rows[4].vk==null&&s8.rows[5].vk==null&&[7,8,9,10].every(i=>!s8.rows[i].img),s8.rows.filter(r=>!r.img||!r.vk).map(r=>r.t));
// ===== 8b. Schritt aufgeben, Jahreszählung
const s10=await p.evaluate(()=>{setup();const f=S.player;gotoStep(2);const s=S.story[f];s.q=[];stSkip(f);const D=SCEN.wikinger;return{i:s.i,tron:S.prov[PI.trondelag].owner,q:s.q.length,y80:D.year+Math.floor(80*D.ypt),ypt:D.ypt,hist:['Themse 865','Wedmore 878','Normandie 911']};});
bef('„Schritt aufgeben“ (stSkip) überspringt den Haken (Lade/Hälsingland) und die Meldung des nächsten Schritts',s10.i===3&&s10.tron==='polen'&&s10.q===0,s10);
bef('Jahreszählung: ypt 0,5 ergibt nach 80 Runden erst das Jahr '+s10.y80+', die Kinotexte nennen 865, 878, 911',s10.y80<865,s10);
// ===== 9. KI-Beobachtung (Gold gestützt, Heere bleiben daheim)
const s9=await p.evaluate(async()=>{setup();const f=S.player;const wars={};const own0=provsOf(f).map(i=>PROV_DEF[i].id);let lost=null;
 for(let i=0;i<16;i++){S.fac[f].gold=Math.max(S.fac[f].gold,400);if(!await turn())break;for(const x of PLAYABLE)if(x!==f&&alive(x)&&atWar(f,x)&&!wars[x])wars[x]=S.turn-S.scen.t0;}
 return{wars,own0,own1:provsOf(f).map(i=>PROV_DEF[i].id),turn:S.turn-S.scen.t0,over:S.scen.over,res:S.scen.res,why:S.scen.why};});
info('KI nach 16 Runden (Spieler passiv, Gold gestützt): Kriegsbeginn gegen den Spieler (Runde seit Start), Besitz',s9);
bef('Nachbarn (Germanen, Slawen) erklären dem passiven Spieler binnen 16 Runden den Krieg',Object.keys(s9.wars).some(x=>x!=='briten'),s9.wars);
bef('Provinz des Startbesitzes durch KI verloren innerhalb von 16 Runden',s9.own1.length<s9.own0.length,{vor:s9.own0,nach:s9.own1});
const w=await p.evaluate(()=>errsW.slice());
ok('Keine Seiten-/Konsolenfehler, keine Warnungen aus Haken/Wahlen',!errs.length&&!w.filter(x=>/Geschichte|Wahl|Hook|Landnahme|Kino|Raubzug|Wedmore/.test(x)).length,{errs:errs.slice(0,3),warn:w.slice(0,4)});
console.log(R.every(x=>x)?'ALLE PASS':'FEHLER '+R.filter(x=>!x).length);await b.close();})();
