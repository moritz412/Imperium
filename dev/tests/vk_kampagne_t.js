// node vk_kampagne_t.js <html> [port] – Prüfung der Wikinger-Kampagne (SCEN.wikinger) auf Spielbarkeit; Bericht: dev/docs/pruef_wikinger_kampagne.md
// v213: Die Befunde 1-6, 8-11 des Berichts sind behoben und werden hier als PASS/FAIL geprüft; BEFUND bleibt nur für Reste.
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
 const R0=SCEN.wikinger.reveal;const aa=S.armies.find(x=>x.f===f&&x.p===PI.viken);const R_=SCEN.wikinger.rules,sv_=[R_.raidUpkeep,R_.homeUpkeep];R_.raidUpkeep=0;R_.homeUpkeep=0;const upkVoll=income(f).upk;R_.raidUpkeep=sv_[0];R_.homeUpkeep=sv_[1];const u0=I.upk;S.armies=S.armies.filter(x=>x!==aa);const ar=u0-income(f).upk;S.armies.push(aa);aa.p=PI.votadiner;const uF=income(f).upk,nF=income(f).net;aa.p=PI.viken;const fl0=S.fleets.find(x=>x.f===f);embark(aa,fl0);const uB=income(f).upk;aa.boat=null;fl0.cargo=[];aa.p=PI.viken;const kiOwn=S.armies.find(x=>x.f==='briten');const k0=income('briten').upk;const sh0=scenShield();S.turn=S.scen.t0+24;const sh24=scenShield();S.turn=S.scen.t0+25;const sh25=scenShield();S.turn=S.scen.t0;
 return{upkVoll,upkFeind:uF,upkBord:uB,upkArmy:ar,netFeind:nF,upkKI0:k0,upkKI:income('briten').upk,shield0:sh0,shield24:sh24,shield25:sh25,rules:SCEN.wikinger.rules,turn:S.turn,t0:S.scen.t0,year:S.year,gold:S.fac[f].gold,net:I.net,tax:I.tax,upk:I.upk,hof:I.hof,prov,names:['island','gronland','groenland','vinland','miklagard','konstantinopel'].map(id=>id+':'+(PI[id]==null?'-':'ja')),
  dip:['briten','usa','mogul','vijaya','arverner','slawen','polen','osmanen','germanen'].map(x=>x+':'+dip(f,x).st),story0:stProg(f,S.story[f].g,S.story[f]),known:['ilmen','neurer','aestier','kaleter'].map(id=>id+':'+(S.known?!!S.known[PI[id]]:null)),
  men:S.armies.filter(a=>a.f===f).map(a=>a.units.length+'E/'+a.units.reduce((s,u)=>s+u.men,0)+'M')};});
info('Start',s1);
ok('Waräger-Ziele (ilmen, smolensk, neurer, dregowitschen) existieren, sind aktiv und liegen im Binnenland',['ilmen','smolensk','neurer','dregowitschen'].every(k=>s1.prov[k].act&&!s1.prov[k].coast),s1.prov);
ok('Island, Grönland, Vinland, Miklagard sind keine Provinzen (reine Wahl-Schritte ohne Karte)',s1.names.every(x=>x.endsWith(':-')),s1.names);
ok('Krieg nur mit Northumbria, Rest Frieden',s1.dip[0]==='briten:war'&&s1.dip.slice(1).every(x=>x.endsWith(':peace')),s1.dip);
info('Haushalt am Start daheim (vorher: Bilanz −34, Sold 58)',{net:s1.net,steuern:s1.tax,sold:s1.upk,soldVoll:s1.upkVoll,gold:s1.gold,soldImFeindesland:s1.upkFeind,soldAnBord:s1.upkBord,netFeind:s1.netFeind});
ok('Startgold 400 (v213)',s1.gold===400,s1.gold);
ok('Sold: im Feindesland und an Bord halbiert, daheim ×0,7 (nur Seeräuber-Spieler im Wikinger-Szenario; KI-Sold unverändert)',s1.upk<s1.upkVoll&&Math.abs(s1.upk/s1.upkVoll-0.7)<=0.03&&s1.upkFeind<=s1.upk-3&&s1.upkFeind>s1.upk-s1.upkArmy&&Math.abs(s1.upkBord-s1.upkFeind)<=2&&s1.upkKI===s1.upkKI0&&s1.rules.raidUpkeep===0.5&&s1.rules.homeUpkeep===0.7,s1);
ok('Schonfrist-Regel: 25 Runden, scenShield() am Start an, nach 25 Runden aus',s1.shield0===true&&s1.shield24===true&&s1.shield25===false&&s1.rules.shield===25,s1);
// ===== 2. Fahrt und Landung (Akt I)
const s2=await p.evaluate(()=>{const out={reach:{},land:{}};
 for(const id of ['votadiner','briganten','kaleter','lexovier','ulaid','orkney','kimbern']){setup();const{a,fl}=startFleet();embark(a,fl);out.reach[id]=sailTo(a,fl,id);}
 for(const id of ['skane','seeland','svear','esten','aestier','karelien','gotland']){setup();const{a,fl}=startFleet();embark(a,fl);out.reach[id]=sailTo(a,fl,id);}
 setup();{const{a,fl}=startFleet();embark(a,fl);out.raubAnBord=canRaub(a);out.raubFremd=canRaub({f:'usa',boat:5,units:[{}]});setRaub(a,true);out.raubAn=!!a.rz;}
 const trial=(tgt,rz,pre)=>{setup();if(pre)pre();const{a,fl}=startFleet();embark(a,fl);const r=sailTo(a,fl,tgt);if(!r.ok)return{unreach:true};if(rz){setRaub(a,true);if(!a.rz)return{noRz:true};}const g0=S.scen.flags.beute||0;const d=disembark(a,fl,PI[tgt])||{};const q=d.res||{};return{win:q.win,capt:!!q.captured,siege:!!q.siegeStarted,landed:!!d.landed,loot:q.loot||0,lost:q.attLost||0,beute:(S.scen.flags.beute||0)-g0};};
 const many=(n,f)=>Array.from({length:n},f);
 out.land.votNoRz=many(6,()=>trial('votadiner',false));out.land.votRz=many(4,()=>trial('votadiner',true));
 out.land.brigNoRz=many(6,()=>trial('briganten',false));out.land.brigRz=many(6,()=>trial('briganten',true));
 out.land.kaleter=many(4,()=>trial('kaleter',false,()=>declareWar(S.player,'arverner')));out.land.lexovier=many(3,()=>trial('lexovier',false,()=>declareWar(S.player,'arverner')));
 return out;});
info('Seewege (Runden bis Küste/ Anlandung möglich)',s2.reach);
ok('Votadiner, Briganten, Kaleter, Lexovier, Irland, Orkney, Kimbern sind in ≤4 Runden anlandbar',['votadiner','briganten','kaleter','lexovier','ulaid','orkney','kimbern'].every(k=>s2.reach[k].ok&&s2.reach[k].rounds<=4),s2.reach);
info('Ostsee per Flotte nicht befahrbar (Waräger-Ziele gehen über Land): Küsten ohne Seeweg',['skane','seeland','svear','esten','aestier','karelien','gotland'].filter(k=>!s2.reach[k].ok));
const q=a=>a.filter(x=>x.win).length;
ok('Raubzug an Bord einschaltbar (Seeräuber), für Nicht-Seeräuber an Bord weiter gesperrt',s2.raubAnBord.ok&&s2.raubAn&&!s2.raubFremd.ok&&/Bord/.test(s2.raubFremd.why),[s2.raubAnBord,s2.raubAn,s2.raubFremd]);
ok('Landung Votadiner (ohne Raubzug): Sieg und Eroberung (≥5 von 6), keine Beute',q(s2.land.votNoRz)>=5&&s2.land.votNoRz.filter(x=>x.capt).length>=5&&s2.land.votNoRz.every(x=>x.beute===0),s2.land.votNoRz.map(x=>[x.win,x.capt]));
ok('Landung Votadiner mit Raubzug an Bord: plündert statt zu erobern (Beute, keine Eroberung, keine Belagerung), ≥3 von 4 Siege',q(s2.land.votRz)>=3&&s2.land.votRz.filter(x=>x.win).every(x=>!x.capt&&!x.siege&&x.loot>0&&x.beute>0),s2.land.votRz.map(x=>[x.win,x.capt,x.loot,x.beute]));
info('Landung Briganten (Jórvík) ohne Raubzug: Siege von 6',{win:q(s2.land.brigNoRz),res:s2.land.brigNoRz.map(x=>[x.win,x.siege,x.lost])});
info('Landung Briganten mit gesetztem Raubzug (im Spiel nicht möglich): Siege von 6',{win:q(s2.land.brigRz),loot:s2.land.brigRz.map(x=>x.loot)});
info('Jórvík-Landung (Siege von 6): ohne Raubzug / mit Raubzug',[q(s2.land.brigNoRz),q(s2.land.brigRz)]);
ok('Landung bei Kaleter und Lexovier (Franken): Sieg und Eroberung in allen Versuchen',[...s2.land.kaleter,...s2.land.lexovier].every(x=>x.win&&x.capt),[...s2.land.kaleter,...s2.land.lexovier].map(x=>[x.win,x.capt,x.lost]));
// ===== 3. Raubzug nach der Landung (Beute je Provinz) und Haushalt in den ersten Runden
const s3=await p.evaluate(async()=>{setup();const f=S.player;let{a,fl}=startFleet();const aid=a.id;embark(a,fl);const o=[],nets=[];let r100=null,rLand=null;
 for(let i=0;i<14;i++){a=S.armies.find(x=>x.id===aid);if(!a){o.push('Heer verloren');break;}let act='';
  if(a.boat){setRaub(a,true);moveFleet(fl,PI.votadiner);if(landTargets(fl).includes(PI.votadiner)){const d=disembark(a,fl,PI.votadiner);act='Landung '+(d.res&&d.res.raided?'plündert':d.res&&d.res.captured?'erobert':'?');if(rLand==null)rLand=i+1;}else act='Fahrt';}
  else if(a.mp>0){const T=[...ADJ[a.p]].filter(n=>!isSeaLink(a.p,n)&&S.prov[n].owner!=='frei'&&S.prov[n].owner!==f&&atWar(f,S.prov[n].owner)&&dvSev(n)===0).sort((x,y)=>PROV_DEF[y].tax-PROV_DEF[x].tax);
   const men=a.units.reduce((s,u)=>s+u.men,0);if(T.length&&men>=350){setRaub(a,true);const res=resolveAttack(a,T[0]);act='Raubzug '+PROV_DEF[T[0]].id+' Sieg='+res.win+' Beute='+(res.loot||0);}else act='warten';}
  await turn();nets.push(income(f).net);if(r100==null&&(S.scen.flags.beute||0)>=100)r100=S.turn-S.scen.t0;o.push(`R${S.turn-S.scen.t0} ${act} | Bilanz ${income(f).net} Gold ${Math.round(S.fac[f].gold)} Beute ${Math.round(S.scen.flags.beute||0)} Ruhm ${Math.round(S.scen.ruhm||0)} Mann ${a.units.reduce((s,u)=>s+u.men,0)}/${a.units.length}E`);}
 return {o,nets,r100,rLand,raubAn:!!(a&&a.rz),minGold:Math.round(S.fac[f].gold),beute:S.scen.flags.beute||0,ruhm:S.scen.ruhm,gold:S.fac[f].gold,units:a?a.units.length:0,need:SCEN.wikinger.chapter.steps.map(st=>st.g?Math.min(30,Math.max(3,Math.round(scenNeed(f,stResolve(f,st.g))))):null)};});
console.log(s3.o.join('\n'));
ok('Raubzug von Votadiner aus bringt Beute und Ruhm (erste Runden)',s3.beute>0&&s3.ruhm>0,{beute:Math.round(s3.beute),ruhm:Math.round(s3.ruhm)});
info('Beute: Ziel 100 erreicht in Runde (seit Start); Landung in Runde; Bilanz je Runde',{r100:s3.r100,landung:s3.rLand,nets:s3.nets,beute:Math.round(s3.beute),gold:Math.round(s3.gold)});
ok('Beute 100 (Ziel Lindisfarne) mit Raubzug ab Landung in ≤ 8 Runden erreicht',s3.r100!=null&&s3.r100<=8,{r100:s3.r100});
ok('Bilanz an Bord/im Feindesland in den ersten 4 Runden ≥ −20 (vorher −34 bis −26), Gold nach 14 Runden über 0, keine Desertion',s3.nets.slice(0,4).every(n=>n>=-20)&&s3.gold>0&&s3.units>=6,{nets:s3.nets,gold:Math.round(s3.gold),units:s3.units});
info('Frist-Verlängerung je Schritt (scenNeed, Runden)',s3.need);
// ===== 4. Schrittkette per Abkürzung: Ereignisse, Belohnungen, Haken, Ende
const s4=await p.evaluate(()=>{setup();const f=S.player;S.fac[f].gold=2000;const C=SCEN.wikinger.chapter,evs=[],o=[];const w0=errsW.length;let endE=null;
 const drain=tag=>{for(const e of stEvents(f)){const x=e.E;if(x.id==='st_end')endE=x;let ti='';try{ti=x.title();}catch(er){ti='FEHLER '+er.message;}evs.push({tag,id:x.id,ti,cine:!!x.cine,vk:x.vk,img:x.img,opts:x.opts.length});}};
 drain('start');const pick=k=>{const s=S.story[f],E=stChoiceEv(C.steps[s.i],s,C).E;E.opts[k].fx(f);};
 const sat=[()=>{S.scen.flags.beute=100;},()=>{S.scen.flags.beute=400;},()=>{S.scen.ruhm=60;},()=>{S.prov[PI.briganten].owner=f;},()=>{const P=S.prov[PI.briganten];P.ln=2;P.lnF=f;P.lnT=S.turn-7;},()=>pick(0),()=>{S.prov[PI.parisier].owner=f;},()=>pick(0),()=>{S.prov[PI.esten].owner=f;},()=>pick(0),()=>pick(0),()=>pick(0)];
 const yrs=[S.year];let hook=null;for(let i=0;i<sat.length;i++){if(S.story[f].i!==i){o.push('Index '+S.story[f].i+' statt '+i);break;}const g0=S.fac[f].gold;sat[i]();storyRound();drain(i);yrs.push(S.year);o.push([i,S.story[f].i,Math.round(S.fac[f].gold-g0)]);
  if(i===2)hook={tron:S.prov[PI.trondelag].owner,hael:S.prov[PI.haelsingland].owner,polen:alive('polen')};}
 const end=S.story[f].end;let fin=null;if(endE){const m0=S.mods.length;endE.opts[1].fx(f);fin={over:S.scen.over,res:S.scen.res,rank:S.scen.rank,mods:S.mods.length-m0,gold:!!SCEN.wikinger.gold(f)};}
 return{o,hook,end,fin,evs,yrs,ep:ep(),cap:yearCapHit(),warn:errsW.slice(w0),n:C.steps.length};});
info('Jahre entlang der Kette (Index k = Jahr beim Beginn von Schritt k, 0 = Start)',s4.yrs);
ok('Jahr springt je Schritt auf das historische Jahr (865, 876, 878, 885, 911, 911, 950, 985, 1000), nie rückwärts; Epoche bleibt, kein yearCapHit',s4.yrs[3]===865&&s4.yrs[4]===876&&s4.yrs[5]===878&&s4.yrs[6]===885&&s4.yrs[7]===911&&s4.yrs[8]===911&&s4.yrs[9]===950&&s4.yrs[10]===985&&s4.yrs[11]===1000&&s4.yrs.every((y,i,a)=>i===0||y>=a[i-1])&&s4.ep===1&&!s4.cap,s4);
ok('Alle 12 Schritte laufen nacheinander durch (Abkürzung), Index stimmt',s4.o.length===12&&s4.o.every(x=>Array.isArray(x)&&x[1]===x[0]+1)&&s4.end,s4.o);
ok('Haken nach „Das Thing“: Lade und Hälsingland gehören dem Spieler, Polen erloschen',s4.hook&&s4.hook.tron&&s4.hook.hael&&!s4.hook.polen,s4.hook);
ok('Alle Ereignisse der Kette lassen sich bauen (Titel, kein Fehler); Wahlschritte als st_choice',s4.evs.length>=13&&s4.evs.every(e=>!/FEHLER/.test(e.ti))&&s4.evs.filter(e=>e.id==='st_choice').length===5,s4.evs.map(e=>e.id+':'+e.ti));
ok('Saga-Ende: Sieg gewertet (scenWin), Rang gesetzt, Vermächtnis-Modifikator',s4.fin&&s4.fin.over&&s4.fin.res==='win'&&!!s4.fin.rank&&s4.fin.mods>=1,s4.fin);
ok('Keine Warnungen aus Haken/Wahlen in der Kette',!s4.warn.length,s4.warn);
bef('Gold-Rang verlangt 1500 Beute und Vinland (in der Abkürzung nicht erfüllt)',s4.fin&&!s4.fin.gold,s4.fin);
// ===== 5. Wahl-Schritte einzeln (Folgen, Fehlerfälle)
const s5=await p.evaluate(()=>{const o={};const run=(i,k,gold)=>{setup();const f=S.player;gotoStep(i);S.fac[f].gold=gold;const E=choiceEv(i);const w0=errsW.length;let ex=null;try{E.opts[k].fx(f);}catch(e){ex=e.message;}const s=S.story[f];return{ex,warn:errsW.slice(w0).length,prog:stProg(f,s.g,s),gold:Math.round(S.fac[f].gold),ruhm:Math.round(S.scen.ruhm||0),flags:JSON.stringify(S.scen.flags),bapt:S.fac[f].bapt&&S.fac[f].bapt.c};};
 o.wedT=run(5,0,500);o.wedG=run(5,1,500);o.norJa=run(7,0,500);o.norNein=run(7,1,500);o.mikG=run(9,0,0);o.mikH=run(9,1,500);o.isl=run(10,0,500);o.islArm=run(10,0,100);o.islWart=run(10,1,500);o.vin=run(11,0,500);o.vinArm=run(11,0,100);o.vinWart=run(11,1,500);
 {setup();const f=S.player;gotoStep(7);createArmy('arverner',PI.kaleter,['spear','sword']);createArmy('arverner',PI.lexovier,['spear','sword']);choiceEv(7).opts[0].fx(f);o.norJaZustand={arvOwn:S.armies.filter(a=>a.f==='arverner').map(a=>S.prov[a.p].owner),kal:S.prov[PI.kaleter].owner,lex:S.prov[PI.lexovier].owner,fremd:S.armies.filter(a=>a.p===PI.kaleter&&a.f!==f).map(a=>a.f),dip:dip(f,'arverner').st,truce:dip(f,'arverner').truce,kul:S.prov[PI.kaleter].cul};}
 {setup();const f=S.player;gotoStep(9);choiceEv(9).opts[0].fx(f);const a=S.armies.find(x=>x.f===f&&x.gen&&/Harald/.test(x.gen.n));o.mikGarde=a?{e:a.units.map(u=>u.v),p:PROV_DEF[a.p].id}:null;}
 o.descIsland=choiceEv(10).opts[0].desc();o.descVinland=choiceEv(11).opts[0].desc();o.warteIsland=choiceEv(10).opts[1].desc();o.warteVinland=choiceEv(11).opts[1].desc();return o;});
ok('Wedmore: beide Wahlen ohne Fehler, Ziel erfüllt; Taufe setzt bapt=tauf, Treue Ruhm +15',!s5.wedT.ex&&!s5.wedG.ex&&s5.wedT.prog[0]===1&&s5.wedG.prog[0]===1&&s5.wedT.bapt==='tauf'&&s5.wedG.ruhm===15,[s5.wedT,s5.wedG]);
ok('Normandie: „Lehen“ gibt Seinemündung und Lexovier, Frieden 10 Runden; „Weiter plündern“ +400 Gold und +400 Beute',!s5.norJa.ex&&s5.norJaZustand.kal==='nord'&&s5.norJaZustand.lex==='nord'&&s5.norJaZustand.dip==='peace'&&s5.norJaZustand.truce===10&&s5.norNein.gold===900&&/"beute":400/.test(s5.norNein.flags),[s5.norJaZustand,s5.norNein.gold]);
ok('Normandie „Lehen“: fränkische Heere stehen nicht mehr in Seinemündung/Lexovier, sondern in fränkischen Provinzen',s5.norJaZustand.fremd.length===0&&s5.norJaZustand.arvOwn.length>=2&&s5.norJaZustand.arvOwn.every(o=>o==='arverner'),s5.norJaZustand);
ok('Miklagard: Garde = 2 Einheiten Warägergarde im Heer „Harald Hardrada“ in der Hauptstadt (+400 Gold); „handeln“ ohne Fehler',!s5.mikG.ex&&s5.mikG.gold===400&&s5.mikGarde&&s5.mikGarde.e.join()==='varanger,varanger'&&!s5.mikH.ex,[s5.mikG.gold,s5.mikGarde]);
ok('Island und Vinland: mit genug Gold Ruhm +20/+30 und Ziel erfüllt',s5.isl.gold===200&&s5.isl.ruhm===20&&s5.isl.prog[0]===1&&s5.vin.gold===100&&s5.vin.ruhm===30&&s5.vin.prog[0]===1,[s5.isl,s5.vin]);
ok('Island und Vinland mit zu wenig Gold: nichts passiert, Ziel offen, kein Fehler',s5.islArm.prog[0]===0&&s5.vinArm.prog[0]===0&&!s5.islArm.ex&&s5.islArm.gold===100,[s5.islArm,s5.vinArm]);
ok('„Noch warten“ lässt das Ziel offen',s5.islWart.prog[0]===0&&s5.vinWart.prog[0]===0);
ok('Island/Vinland: Beschreibungen versprechen nur Ruhm (keine Bevölkerung/Siedlungswirkung); „Noch warten“ nennt den Geschichte-Knopf',!/Bevölkerung|Siedlungen/.test(s5.descIsland+s5.descVinland)&&/Ruhm [+]20/.test(s5.descIsland)&&/Ruhm [+]30/.test(s5.descVinland)&&/Geschichte-Knopf/.test(s5.warteIsland)&&!/kommt wieder/.test(s5.warteIsland+s5.warteVinland),[s5.descIsland,s5.descVinland,s5.warteIsland]);
{const x=await p.evaluate(()=>{setup();const f=S.player;const o={};
 // Eroberungs-Plünderung zählt als Beute
 S.prov[PI.briganten].owner='briten';const b0=S.scen.flags.beute||0,g0=S.fac[f].gold;applyConquest(f,PI.briganten,'pluendern');o.plu={beute:(S.scen.flags.beute||0)-b0,gold:Math.round(S.fac[f].gold-g0)};
 const b1=S.scen.flags.beute||0;S.prov[PI.votadiner].owner='briten';applyConquest(f,PI.votadiner,'ausloeschen');o.aus=(S.scen.flags.beute||0)-b1;
 // Danegeld erhalten zählt als Beute
 const sm=window.showModal,sp=window.showProposals;let btn=null;window.showModal=(h,bs)=>{btn=bs;};window.showProposals=()=>{};S.fac.briten.gold=1000;const b2=S.scen.flags.beute||0,g2=S.fac[f].gold;showDane({from:'briten',to:f,type:'dane',amt:60},()=>{});if(btn)btn[1].fn();window.showModal=sm;window.showProposals=sp;o.dane={beute:(S.scen.flags.beute||0)-b2,gold:Math.round(S.fac[f].gold-g2),btn:!!btn};
 // Szenario-Fremder: außerhalb eines Szenarios kein Fehler (flags fehlt)
 return o;});
 info('Beute aus Eroberungs-Plünderung / Danegeld',x);
 ok('Eroberungs-Plünderung und erhaltenes Danegeld zählen auf die Szenario-Beute (Auslöschen nicht)',x.plu.beute>0&&x.plu.beute===x.plu.gold&&x.aus===0&&x.dane.btn&&x.dane.beute===60&&x.dane.gold===60,x);}
// ===== 6. Landnahme: Voraussetzungen (Abkürzung: Besitz Briganten, Heer dort)
const s6=await p.evaluate(()=>{setup();const f=S.player;const P=S.prov[PI.briganten];P.owner=f;const a=S.armies.find(x=>x.f===f&&x.p===PI.viken);a.p=PI.briganten;S.fac[f].gold=1000;const r=[];
 r.push(lnCan(f,PI.briganten).why);S.turn=S.scen.t0+12;r.push(lnCan(f,PI.briganten).why);S.fac[f].rzReg={britannien:3};const ok0=lnCan(f,PI.briganten);r.push(ok0.ok+':'+ok0.cost);
 const st=lnStart(f,PI.briganten);const L1=lnOf(PI.briganten);const g=S.story[f];return{r,st,L1,lnt:LN.t2,cost:lnCost(),need:Math.round(scenNeed(f,{cond:'landnahme'}))};});
ok('Landnahme-Voraussetzungen: ab Runde 10, 3 Plünderungen in der Region, Heer in der Provinz, 165 Gold; Lager startet',/Frühestens/.test(s6.r[0])&&/Erst 3 Plünderungen/.test(s6.r[1])&&s6.r[2]==='true:165'&&s6.st&&s6.L1===1,s6);
// ===== 7. Waräger-Weg: Heerzug von Gautar aus
const s7=await p.evaluate(()=>{setup();const f=S.player;const a=S.armies.find(x=>x.f===f&&x.p===PI.viken);a.p=PI.gautar;a.mp=maxMP(a);const Rm=reachMap(a,30),o={};for(const id of ['svear','esten','aestier','ostgauten','ilmen','smolensk','neurer','dregowitschen','karelien','liven'])o[id]=Rm.get(PI[id])?Rm.get(PI[id]).t:null;
 const ng=isNeutralFor(f,PI.svear);const adj={ilmen:[...ADJ[PI.ilmen]].map(n=>PROV_DEF[n].id),esten:[...ADJ[PI.esten]].map(n=>PROV_DEF[n].id),aestier:[...ADJ[PI.aestier]].map(n=>PROV_DEF[n].id),aukstaiten:[...ADJ[PI.aukstaiten]].map(n=>PROV_DEF[n].id)};
 const kn=['ilmen','smolensk','neurer','dregowitschen','esten','karelien','liven'].map(id=>id+':'+!!S.known[PI[id]]);gotoStep(8);const g8=stResolve(f,SCEN.wikinger.chapter.steps[8].g);const p0=stProg(f,g8,S.story[f])[0];S.prov[PI.karelien].owner=f;const p1=stProg(f,g8,S.story[f])[0];S.prov[PI.karelien].owner='frei';S.prov[PI.esten].owner=f;const p2=stProg(f,g8,S.story[f])[0];
 return{o,kn,prog:[p0,p1,p2],ng,adj,gar:['esten','ilmen','aestier','aukstaiten','dregowitschen'].map(id=>id+':'+S.prov[PI[id]].gar+'/'+S.prov[PI[id]].owner),polenDip:dip(f,'osmanen').st};});
info('Heerzug Gautar → Waräger (Runden bis erreichbar; null = nur über Eroberung der Zwischenprovinz)',s7);
ok('Waräger-Schritt: Region rus und alle Ziele aufgedeckt; Esten ist in ≤2 Runden Landzug ab Gautar erreichbar (Karelien/Liven danach, siehe INFO); Besitz von Karelien oder Esten erfüllt das Ziel',s7.kn.every(x=>/true$/.test(x))&&s7.o.esten!=null&&s7.o.esten<=2&&s7.prog.join()==='0,1,1',[s7.o,s7.kn,s7.prog]);
// ===== 8. Kino, Sprecher, Bilder je Schritt
await p.evaluate(()=>{try{pkLoad('pk_vk');pkLoad('pk_vk2');}catch(e){}});await p.waitForTimeout(2500);
const s8=await p.evaluate(async()=>{const X=await (await fetch('audio/x_wikinger.json')).json(),XK=await (await fetch('audio/x_wikinger_kino.json')).json(),K2=await (await fetch('audio/x_wikinger_kino2.json')).json();Object.assign(XK,K2);Object.assign(X,K2);setup();const C=SCEN.wikinger.chapter;const has=k=>{try{return!!heroImg(k,0,false);}catch(e){return false;}};
 const rows=C.steps.map((st,i)=>{const vk=stVk('wikinger',st,{i});const kin=st.kino?VK_KINO[st.kino]:null;return{i,t:st.t,img:st.img||null,imgOk:st.img?has(st.img):null,fallback:st.img?null:(st.choice?'ev_thron':stImg(st,st.g)),vk:vk.join()||null,vkOk:vk.length?vk.every(k=>!!X[k]&&X[k].length>1000):null,kino:st.kino||null,kinoImgs:kin?kin.ikeys.every(has):null,kinoVoice:kin?kin.keys.every(k=>!!XK[k]&&XK[k].length>1000):null};});
 const E=(id)=>VK_KINO[id];return{rows,intro:{imgs:E('intro').ikeys.every(has),voice:E('intro').keys.every(k=>!!XK[k]),kap:C.kino},ends:{e1:E('e1').ikeys.every(has)&&!!XK.wikinger_kino4a,e2:E('e2').ikeys.every(has)&&!!XK.wikinger_kino4b},introVo:!!X.wikinger_intro,endeVo:!!X.wikinger_ende};});
console.log('Schritt | Kapitelbild | Ersatzbild | Sprecher | Kino');for(const r of s8.rows)console.log(`${r.i} ${r.t} | ${r.img?r.img+(r.imgOk?' ok':' FEHLT'):'-'} | ${r.fallback||'-'} | ${r.vk||'KEINER'}${r.vk&&!r.vkOk?' (Datei fehlt)':''} | ${r.kino?r.kino+(r.kinoImgs&&r.kinoVoice?' ok':' unvollständig'):'-'}`);
ok('Alle vorhandenen Kapitelbilder, Kino-Bilder und Sprecher-Dateien sind im Paket',s8.rows.every(r=>(r.img==null||r.imgOk)&&(r.vk==null||r.vkOk)&&(r.kino==null||(r.kinoImgs&&r.kinoVoice)))&&s8.intro.imgs&&s8.intro.voice&&s8.ends.e1&&s8.ends.e2&&s8.introVo&&s8.endeVo,s8);
bef('Landnahme und Wedmore haben keinen Sprecher (ki:0); Normandie, Waräger, Miklagard, Island ohne eigenes Kapitelbild (Ersatzbild)',s8.rows[4].vk==null&&s8.rows[5].vk==null&&[7,8,9,10].every(i=>!s8.rows[i].img),s8.rows.filter(r=>!r.img||!r.vk).map(r=>r.t));
// ===== 8b. Schritt aufgeben, Jahreszählung
const s10=await p.evaluate(()=>{setup();const f=S.player;gotoStep(2);const s=S.story[f];s.q=[];const y0=S.year;stSkip(f);const D=SCEN.wikinger;const m=s.q.slice();return{i:s.i,tron:S.prov[PI.trondelag].owner,q:m.length,qk:m.map(x=>x.k+':'+(x.done||'')),y0,y1:S.year,y80:D.year+Math.floor(80*D.ypt),ypt:D.ypt};});
ok('„Schritt aufgeben“ (stSkip) löst Haken (Lade/Hälsingland gehören dem Spieler) und Meldung des nächsten Schritts aus, ohne Belohnung, Jahr 865',s10.i===3&&s10.tron==='nord'&&s10.q===1&&s10.qk[0]==='step:'&&s10.y1===865&&s10.y0<865,s10);
info('Jahreszählung ohne Schritt-Sprünge (ypt 0,5): nach 80 Runden',s10.y80);
// Jahre im echten Rundenlauf: nach dem Sprung auf 1000 weiter, kein Epochenwechsel
const s11=await p.evaluate(async()=>{setup();const f=S.player;const e0=ep(),et=S.epochTurn;stHook(f,9);const y9=S.year;stHook(f,11);const y11=S.year;const ys=[];for(let i=0;i<3;i++){await turn();ys.push(S.year);}return{y9,y11,ys,ep0:e0,ep1:ep(),et0:et,et1:S.epochTurn,cap:yearCapHit(),epReady:!!S.epReady};});
ok('Jahr 1000 im Rundenlauf: steigt weiter (+1 je 2 Runden), kein Epochenwechsel, kein yearCapHit',s11.y9===950&&s11.y11===1000&&s11.ys.every(y=>y>=1000)&&s11.ys[2]>=1001&&s11.ep0===s11.ep1&&s11.et0===s11.et1&&!s11.cap&&!s11.epReady,s11);
// ===== 9. KI-Beobachtung (Gold gestützt, Heere bleiben daheim)
const s9=await p.evaluate(async()=>{setup();const f=S.player;const wars={};const own0=provsOf(f).map(i=>PROV_DEF[i].id);let lost=null;
 let sh=null;{const d=dip('germanen',f);declareWar('germanen',f);sh=dip('germanen',f).st;}
 for(let i=0;i<24;i++){S.fac[f].gold=Math.max(S.fac[f].gold,400);if(!await turn())break;for(const x of PLAYABLE)if(x!==f&&alive(x)&&atWar(f,x)&&!wars[x])wars[x]=S.turn-S.scen.t0;}
 return{wars,sh,own0,own1:provsOf(f).map(i=>PROV_DEF[i].id),turn:S.turn-S.scen.t0,over:S.scen.over,res:S.scen.res,why:S.scen.why};});
info('KI nach 24 Runden (Spieler passiv, Gold gestützt): Kriegsbeginn gegen den Spieler (Runde seit Start), Besitz',s9);
ok('Schonfrist: direkte KI-Kriegserklärung (Germanen) wird abgewiesen; in 24 passiven Runden erklärt kein Reich dem Spieler neu den Krieg (nur Northumbria, Startkrieg)',s9.sh==='peace'&&Object.keys(s9.wars).every(x=>x==='briten')&&s9.turn>=24,{sh:s9.sh,wars:s9.wars,turn:s9.turn});
bef('Provinz des Startbesitzes durch KI verloren innerhalb von 24 Runden',s9.own1.length<s9.own0.length,{vor:s9.own0,nach:s9.own1});
const w=await p.evaluate(()=>errsW.slice());
ok('Keine Seiten-/Konsolenfehler, keine Warnungen aus Haken/Wahlen',!errs.length&&!w.filter(x=>/Geschichte|Wahl|Hook|Landnahme|Kino|Raubzug|Wedmore/.test(x)).length,{errs:errs.slice(0,3),warn:w.slice(0,4)});
console.log(R.every(x=>x)?'ALLE PASS':'FEHLER '+R.filter(x=>!x).length);await b.close();})();
