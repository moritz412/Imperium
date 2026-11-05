// node hn_akt4_t.js <html> [port] – Hannibal Akt IV im Spielerlauf (Schritt 9 Hasdrubal/Nero, Wahl Rom/Heimkehr, Zama, Ende A/B). Bericht: dev/docs/pruef_hannibal_kampagne.md, Abschnitt „Akt IV im Spielerlauf“.
// Gerüst wie hn_kampagne_t.js: ein Bot handelt wie ein Spieler (Fenster per Knopf, Heere per orderMove/marchTo/Angriffsfenster, endTurn).
// ABKÜRZUNG (gekennzeichnet): Der Test springt in einen „typischen Zustand nach Akt III“ (akt3()): Hannibal in Kampanien mit ~65 % der Startstärke, Gunst 50, 6 Provinzen
// (Kampanien, Lukanien, Bruttium, Apulien, Insubrien, Taurini), Gold 3000, Cannae erledigt, Schritt 8 (Capua) erfüllt → die Geschichte rückt selbst auf Schritt 9 (Hook 8: Hasdrubal und Nero).
// Der Weg bis hierher (Schritte 1–8) wird NICHT gespielt. Echtes iPad nicht getestet. Kino/Bilder nicht geprüft.
// Varianten: A = Hannibal zieht Hasdrubal entgegen, vereint, dann Rom angreifen (Latium belagern); B = passiv im Süden, Heimkehr, Zama (Standardplan);
//            C = wie B, Plan „Elefanten zurückhalten“; D = ganz passiv (Hasdrubal bleibt zu Hause), misst Gunst/Frist/Abberufung.
// Umgebung: HN4_LAUFE="A:2,B:2,C:2,D:1" (Läufe je Variante), HN4_RUNDEN (Standard je Variante A 28, B/C 18, D 12), HN4_ZAMA=12 (Wiederholungen der Zama-Schlacht per Ladepunkt), HN4_LOG=1, HN4_OUT (Ordner für JSON), PW_GPU, PW_CHROMIUM.
const {chromium}=require('playwright');
const FILE=process.argv[2]||require('path').join(__dirname,'..','imperium.html'),PORT=process.argv[3]||'8772';
const PLAN=(process.env.HN4_LAUFE||'A:2,B:2,C:2,D:1').split(',').map(x=>x.split(':')).map(([v,n])=>[v,+n]);
const MAXRV={A:28,B:18,C:18,D:12},MAXR0=+(process.env.HN4_RUNDEN||0),NZ=+(process.env.HN4_ZAMA||12),LOG=!!process.env.HN4_LOG;
(async()=>{const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:process.env.PW_GPU?[]:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const R=[];const ok=(n,c,i='')=>{R.push(!!c);console.log((c?'PASS ':'FAIL ')+n+(i!==''?'  '+JSON.stringify(i):''));};
const bef=(n,problem,i='')=>{console.log((problem?'BEFUND ':'ok-kein-Befund ')+n+(i!==''?'  '+JSON.stringify(i):''));};
const info=(n,i)=>console.log('INFO '+n+'  '+JSON.stringify(i));
const fs=require('fs');const T0=Date.now();
const ctx=await b.newContext({viewport:{width:1024,height:768},hasTouch:true,isMobile:true});const p=await ctx.newPage();const errs=[];
p.on('pageerror',e=>errs.push('PAGE '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|WebGL|GPU stall/.test(m.text()))errs.push('CON '+m.text().slice(0,200));});
await p.addInitScript(()=>{try{localStorage.setItem('imperium.gfx',JSON.stringify({q:'leicht'}));}catch(e){}});
await p.route(/cdnjs/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));
await p.route(/fonts\.g/,r=>r.abort());await p.route(/\.html$/,r=>r.fulfill({body:fs.readFileSync(FILE),contentType:'text/html; charset=utf-8'}));
await p.goto(`http://localhost:${PORT}/imperium.html`,{timeout:300000});await p.waitForFunction(()=>document.getElementById('loading').hidden,null,{timeout:300000});
await p.waitForFunction(()=>!document.querySelector('#loading[data-gate]'),null,{timeout:120000}).catch(()=>{});await p.waitForTimeout(1500);
// ---- Hilfsfunktionen in der Seite
await p.evaluate(()=>{
 window.playCine=(o,d)=>{d&&d();};
 window.errsW=[];const _w=console.warn;console.warn=function(){errsW.push([...arguments].map(x=>x&&x.message||String(x)).join(' ').slice(0,200));_w.apply(console,arguments);};
 window.sl=ms=>new Promise(z=>setTimeout(z,ms));
 window.BOT={ev:[],stuck:[],att:[],wopt:0,ph:[],txt:[],wait:0,log:[]};
 window.PHRE=/undefined|NaN|\$\{|\[object|\bnull\b/;
 window.setup=()=>{startScenario('hannibal');try{closeModal();}catch(e){}storyRound();};
 window.gotoStep=i=>{const f=S.player,s=S.story[f];s.i=i;s.t0=S.turn;s.done=false;s.end=false;s.w0=stW(f);s.g=stResolve(f,stCh(f).steps[i].g);return s;};
 window.RU=n=>{const L=[];for(let i=0;i<n;i++)L.push(i%3===2?['spear','socii']:i%7===6?['cav']:['sword','manipel']);return L;};
 window.mOpen=()=>{const m=document.querySelector('#modal');return!!m&&!m.hidden;};
 window.mText=()=>mOpen()?document.querySelector('#dialog').innerText.replace(/\s+/g,' ').trim():'';
 window.mBtns=()=>[...document.querySelectorAll('#dialog .actions .btn, #dialog .evopt')].filter(x=>!x.disabled);
 // Ein offenes Fenster beantworten wie ein Spieler. Protokoll: Titel, Jahr, Wahl; Platzhalter-Prüfung auf den ganzen Fenstertext.
 window.answer=(tag)=>{try{return answer0(tag);}catch(e){BOT.log.push({r:S.turn-S.scen.t0,err:String(e.stack||e).slice(0,300)});try{closeModal();}catch(e2){}return null;}};
 window.answer0=(tag)=>{if(!mOpen())return null;const d=document.querySelector('#dialog'),t=mText(),h2=(d.querySelector('h2')||{}).innerText||'',sub=(d.querySelector('.sub')||{}).innerText||'',eb=(d.querySelector('.eyebrow')||{}).innerText||'';
  const rel=S.turn-S.scen.t0;
  if(PHRE.test(t))BOT.ph.push({r:rel,h2:h2.slice(0,50),m:(t.match(new RegExp('.{0,40}('+PHRE.source+').{0,40}'))||[''])[0]});
  if(/Ende [AB]|Sieg:|Niederlage|Der Sieg Karthagos|Hasdrubal|Nero|Zama|Heimkehr|Rom oder/.test(h2+eb))BOT.txt.push({r:rel,y:S.year,h2:h2.replace(/\s+/g,' ').slice(0,60),sub:sub.replace(/\s+/g,' ').slice(0,80),t:t.slice(0,900)});
  const bs=mBtns();let b=null,why='';
  if(!bs.length){const x=d.querySelector('.dlgx');if(!/Das Zeitalter|Buch des Reiches|Untergang/.test(h2+t))BOT.stuck.push({r:rel,h2,t:t.slice(0,160)});if(x)x.click();else closeModal();return{h2,none:true};}
  const ev=bs.filter(x=>x.classList.contains('evopt'));
  if(/Wer bleibt in Hispanien/.test(t)){b=bs.find(x=>/Alle ziehen mit/.test(x.textContent));why='alle';}
  else if(/Welchen Weg/.test(t)){b=bs.find(x=>/lange Weg/.test(x.textContent))||ev[0];why='route lang';}
  else if(/Rom angreifen|heimkehren/.test(t)&&/Rom/.test(h2)){b=ev[BOT.wopt]||bs[BOT.wopt];why='wahl'+BOT.wopt;}
  else if(ev.length){b=ev[0];why='erste Option';}
  else{const pref=[/Belagern/,/Weiter|Verstanden|Weiterspielen|Annehmen|Flöße/,/Ablehnen/,/Fortsetzen|Berechnen/];for(const re of pref){b=bs.find(x=>re.test(x.textContent));if(b)break;}if(!b)b=bs.find(x=>x.classList.contains('primary'))||bs[0];why='Standard';}
  BOT.ev.push({r:rel,y:(sub.match(/(\d{1,4}) (v|n)\. Chr\./)||['',''])[0],eb:eb.replace(/\s+/g,' ').slice(0,30),h2:h2.replace(/\s+/g,' ').slice(0,50),n:bs.length,pick:(b.querySelector('b')||b).textContent.trim().slice(0,30),why,tag:tag||''});
  b.click();return{h2,pick:b.textContent.trim()};};
 window.turn=async()=>{const t0=S.turn;for(let k=0;k<4&&S.turn===t0;k++){document.querySelectorAll('.cine').forEach(e=>e.remove());if(S.over)return false;if(!busy)endTurn();for(let j=0;j<400&&(busy||mOpen());j++){if(mOpen())answer('runde');await sl(40);}await sl(30);}
  for(let j=0;j<40&&mOpen();j++){answer('nach');await sl(30);}return S.turn!==t0;};
 window.hero=()=>S.armies.find(x=>x.id===S.scen.hero&&x.units.length&&!x.boat);
 window.men=a=>a?a.units.reduce((s,u)=>s+u.men,0):0;
 window.bfs=(from,okFn)=>{const prev={[from]:-1},q=[from];while(q.length){const c=q.shift();if(c!==from&&okFn(c)){const pa=[];let k=c;while(k!==from){pa.unshift(k);k=prev[k];}return pa;}for(const n of ADJ[c]){if(prev[n]!==undefined||!isAct(n)||isSeaLink(c,n))continue;const o=S.prov[n].owner;if(o==='massilia'||o==='syrakus')continue;prev[n]=c;q.push(n);}}return null;};
 window.pdist=(a,b)=>{if(a==null||b==null)return null;const pa=bfs(a,i=>i===b);return a===b?0:pa?pa.length:null;};
 window.attack=async(a,pi)=>{const f=S.player;orderMove(a,pi);let res='nichts';
  for(let g=0;g<8;g++){await sl(60);if(!mOpen())break;const t=mText(),bs=mBtns();
   if(/Angriff auf/.test(t)){const bel=bs.find(x=>/Belagern/.test(x.textContent)),ber=bs.find(x=>/Berechnen/.test(x.textContent));
    const sg=S.sieges&&S.sieges[pi]&&S.sieges[pi].f===f;const m=/Erst nach (\d+)/.exec(t);
    BOT.att.push({r:S.turn-S.scen.t0,pi:PROV_DEF[pi].id,pct:(t.match(/Aussicht[^A-Za-z]*([A-Za-zä ]+)/)||[])[1]||'',sieg:!!m});
    const b=(bel&&!sg&&m)?bel:ber||bel;if(!b){closeModal();res='kein Knopf';break;}b.click();res=(b===bel?'belagern':'berechnen');
    for(let j=0;j<300&&(busy||!mOpen());j++){await sl(40);if(mOpen())break;}
    for(let j=0;j<5&&mOpen();j++){answer('kampf');await sl(40);}break;}
   else if(/Krieg|Frieden mit/.test(t)&&bs.find(x=>/Krieg erklären/.test(x.textContent))){bs.find(x=>/Krieg erklären/.test(x.textContent)).click();res='krieg';await sl(80);}
   else answer('weg');}
  return res;};
 // Heer entlang eines Weges: marschieren in eigenes/verbündetes Land, sonst Angriff (nur mit brauchbarer Aussicht, sonst warten)
 window.stepTo=async(h,path,minq)=>{let hops=0;h.mp=h.mp==null?maxMP(h):h.mp;
  while(path&&path.length&&h.mp>0&&hops++<7&&!h.hnPass&&h.units.length){const nx=path[0];if(h.p===nx){path.shift();continue;}const o=S.prov[nx].owner,own=o===S.player;
   if(own||passOk(h.f,nx)){const p0=h.p;marchTo(h,nx);for(let j=0;j<6&&mOpen();j++){answer('marsch');await sl(50);}if(h.p===nx){path.shift();continue;}break;}
   let q=9;try{const cx=startAttackCtx(h,nx);q=cx.res.att/Math.max(1,cx.res.def);}catch(e){}if(q<(minq==null?0.8:minq)){BOT.wait++;return'wartet(Aussicht '+q.toFixed(2)+')';}
   await attack(h,nx);if(S.prov[nx].owner===S.player&&h.p!==nx&&h.mp>0){marchTo(h,nx);for(let j=0;j<4&&mOpen();j++){answer('marsch');await sl(50);}}if(h.p===nx){path.shift();continue;}break;}
  return'';};
 // Belagerung wie ein Spieler: warten, bis Sturm möglich ist, dann stürmen. Gibt Text zurück oder null.
 window.siegeAct=async(a)=>{if(a.st==='belagern'&&a.sieg!=null&&S.prov[a.sieg].owner!==a.f&&S.sieges&&S.sieges[a.sieg]){const need=siegeNeed(a.f,a.sieg,a),t=S.sieges[a.sieg].t;
   if(t>=need){const sg=a.sieg,r=await attack(a,sg);return'Sturm '+PROV_DEF[sg].id+' '+r+' (Besitz: '+S.prov[sg].owner+')';}return'Belagerung '+PROV_DEF[a.sieg].id+' '+t+'/'+need;}return null;};
 // ===== ABKÜRZUNG: Zustand wie nach typischem Akt III (siehe Kopf der Datei)
 window.akt3=()=>{setup();for(let i=0;i<8&&mOpen();i++){answer('start');}
  const Z=S.scen,D=SCEN.hannibal,f=S.player,F=hnFl();
  S.turn=Z.t0+52;S.year=D.year+Math.floor(52*(D.ypt||1));// Akt IV beginnt im Spielerlauf um Runde 53 (Jahr ~207 v. Chr.)
  for(const id of['kampanien','lukanien','bruttium','apulien','insubrien','taurini'])S.prov[PI[id]].owner=f;S.prov[PI.tarraco].owner=f;
  try{refreshOwnership();}catch(e){}
  const h=hero();h.p=PI.kampanien;h.pos=null;h.goal=null;h.st=null;h.mp=maxMP(h);for(const u of h.units)u.men=Math.max(1,Math.round(unitStat(f,u.r,u.v).men*0.65));
  F.hn_besatz='b';F.hn_rhone=1;F.hn_landung=1;F.hn_krieg=Z.t0+3;F.hn_pass=Z.t0+10;F.hn_ankunft={t:Z.t0+14,men:men(h),pct:50};F.hn_jagd=Z.t0+16;F.hn_kelt=60;
  F.hn_can='won';F.hn_canN=2;F.hn_canT=Z.t0+24;F.hn_canT2=Z.t0+29;S.fac[f].gold=3000;
  if(!atWar(f,'rom'))try{declareWar('rom',f,true);}catch(e){}
  gotoStep(7);hnRatStart();F.hn_gunst=50;F.hn_gw=stW(f);F.hn_ga=F.abw||0;F.hn_gn=F.hn_nied||0;F.hn_pn=provsOf(f).length;F.hn_gLast=S.turn;
  try{hnFabStart();}catch(e){}
  for(const a of S.armies)if(a.f==='rom'&&a.hnJagd){a.hnJagd=0;}
  S.story[f].q=[];for(let i=0;i<8&&mOpen();i++)answer('start');
  storyRound();// Schritt 8 (Capua) erfüllt (4 Provinzen) → Schritt 9, Hook 8
  return{step:scenStepI(),turn:S.turn-Z.t0,year:S.year,men:men(h),u:h.units.length,hasd:F.hn_hasd,gunst:F.hn_gunst};};
});
const BOTRUN=async(variant,nr)=>{
 const S0=await p.evaluate((variant)=>{BOT.ev=[];BOT.stuck=[];BOT.att=[];BOT.ph=[];BOT.txt=[];BOT.wait=0;BOT.wopt=(variant==='A'?0:1);errsW.length=0;window.PL={rows:[],snap:null,t0:null};
  const s=akt3();const h=hero();PL.t0=S.turn-s.turn;s.men0=men(h);s.ele=h.units.filter(u=>u.v==='elef').length;
  s.hasdA=!!hnHasdA();s.neroA=!!hnNeroA();return s;},variant);
 info(`Lauf ${variant}${nr} Start (nach Abkürzung akt3)`,S0);
 console.log('Runde | Jahr | Schritt | Hannibal Männer/E @Ort | Hasdrubal Männer @Ort [Zustand] | Nero @Ort (Abst. zu H) | Gunst | Aktion');
 const t0=Date.now();let lastRow=null;
 const MAXR=MAXR0||MAXRV[variant]||20;for(let r=1;r<=MAXR;r++){
  const o=await p.evaluate(async(variant)=>{
   const f=S.player,F=hnFl(),h=hero(),rel=S.turn-S.scen.t0,acts=[];
   for(let i=0;i<10&&mOpen();i++){answer('vor');await sl(40);}
   if(S.scen.over)return{over:true,acts};
   if(!h)return{dead:true,rel,txt:'Heer des Helden fehlt; Over='+S.over+' '+(S.scen.why||'')};
   const step=scenStepI();h.mp=h.mp==null?maxMP(h):h.mp;
   // Rekrutieren wie ein Spieler (nur in eigener Provinz mit Platz): auch Hannibal in Karthago nach der Heimkehr
   try{const P=S.prov[h.p];if(!h.hnPass&&P.owner===f&&S.fac[f].gold>350&&h.units.length<armyMax(f)&&P.rec>0){let n=0;for(const [ro,v] of [['spear','libyer'],['sword','scutar']]){if(S.fac[f].gold<300||h.units.length>=armyMax(f)||P.rec<=0)break;if(recruit(f,h.p,ro,v))n++;}if(n)acts.push('rekr'+n);}}catch(e){}
   const H=hnHasdA(),Nr=hnNeroA();
   // Hasdrubal marschiert nach Italien (Spielerheer): A, B, C – D lässt ihn stehen
   if(H&&!H.hnPass&&F.hn_hasd==='lauf'&&variant!=='D'&&!HN_ITALY.has(hnReg(H.p))){H.mp=H.mp==null?maxMP(H):H.mp;const path=bfs(H.p,i=>i===PI.taurini);
     if(path&&path.length){const w=await stepTo(H,path,0.7);acts.push('Hasdrubal → '+PROV_DEF[H.p].id+(H.hnPass?' (Pass)':'')+(w?' '+w:''));}else acts.push('Hasdrubal: kein Weg');}
   else if(H&&H.hnPass)acts.push('Hasdrubal im Pass');
   const wahl=F.hn_wahl;
   if(!h.hnPass){
    if(variant==='A'&&wahl==null){// Hasdrubal entgegen: in die Poebene bzw. zu seinem Heer
     const tgt=H&&!H.hnPass&&HN_ITALY.has(hnReg(H.p))?H.p:PI.taurini;
     if(h.p!==tgt&&F.hn_hasd==='lauf'){const path=bfs(h.p,i=>i===tgt);if(path&&path.length){const w=await stepTo(h,path,0.8);acts.push('Hannibal → '+PROV_DEF[h.p].id+(w?' '+w:''));}else acts.push('Hannibal: kein Weg zu '+PROV_DEF[tgt].id);}
     else acts.push('Hannibal wartet bei '+PROV_DEF[h.p].id);}
    else if(variant==='A'&&wahl==='rom'){// Rom: Latium belagern/stürmen, beide Heere
     for(const a of [h,H].filter(x=>x&&!x.hnPass&&x.units.length)){a.mp=a.mp==null?maxMP(a):a.mp;const sg=await siegeAct(a);if(sg){acts.push((a===h?'Hannibal ':'Hasdrubal ')+sg);continue;}
      if(a.p!==PI.latium){const path=bfs(a.p,i=>i===PI.latium);if(path&&path.length){const w=await stepTo(a,path,0.8);acts.push((a===h?'Hannibal ':'Hasdrubal ')+'→ '+PROV_DEF[a.p].id+(w?' '+w:''));}}
      else if(S.prov[PI.latium].owner!==f){const r=await attack(a,PI.latium);acts.push((a===h?'Hannibal ':'Hasdrubal ')+'Latium '+r);}}}
    else if(variant!=='A'&&wahl==='heim'){// Zama: Hannibal in Karthago, Scipio in Byzacena
     if(variant==='C'&&planZurOk(h)&&h.plan!=='zurueck'){h.plan='zurueck';acts.push('Plan: Elefanten zurückhalten');}
     const sc=S.armies.find(x=>x.scip&&x.units.length);
     if(sc&&h.p===PI.karthago&&F.hn_zama==null){
      if(!PL.snap){PL.snap=JSON.stringify(S);const cx=startAttackCtx(h,sc.p);PL.pre={men:men(h),u:h.units.length,ele:h.units.filter(u=>u.v==='elef').length,eleMen:h.units.filter(u=>u.v==='elef').reduce((s,u)=>s+u.men,0),sc:men(sc),q:cx.res.att/Math.max(1,cx.res.def),plan:h.plan||'frontal'};}
      const rr=await attack(h,sc.p);acts.push('Zama-Angriff: '+rr+' → hn_zama='+F.hn_zama);}
     else acts.push('Heimkehr: '+(sc?'Scipio '+PROV_DEF[sc.p].id:'kein Scipio')+', Hannibal '+PROV_DEF[h.p].id);}
    else if(variant!=='A'&&wahl==null){acts.push('Hannibal bleibt in '+PROV_DEF[h.p].id+' (passiv)');}
    else if(variant==='D'){acts.push('passiv');}
   } else acts.push(h.hnPass.heim?'Heimfahrt':'Hannibal im Pass');
   // Abfall wie der Knopf (Gold ist reichlich) – nur in Variante A, solange noch Italien
   try{if(variant==='A'&&wahl!=='heim')for(const n of [h.p,...ADJ[h.p]]){if(S.fac[f].gold>=defectCost()+150&&canDefect(f,n)&&tryDefect(f,n)){acts.push('Abfall '+PROV_DEF[n].id);break;}}}catch(e){}
   // Rat: Boten bei niedriger Gunst (wie ein Spieler, der die Leiste sieht)
   try{if(hnRatOn()&&F.hn_gunst<45&&!hnBotenWhy()&&S.fac[f].gold>hnBotenCost()+250){hnRatAct('boten');acts.push('Boten');}}catch(e){}
   return{acts};},variant);
  await p.evaluate(async()=>{for(let i=0;i<8&&mOpen();i++){answer('nach-aktion');await sl(40);}});
  const t=await p.evaluate(async()=>await turn()).catch(e=>{console.log('BEFUND Seitenfehler in turn(): '+String(e.message).slice(0,200));return false;});
  const row=await p.evaluate((o)=>{const f=S.player,F=hnFl(),h=hero(),rel=S.turn-S.scen.t0,H=hnHasdA(),N=hnNeroA();
   const x={rel,y:S.year,step:scenStepI(),men:men(h),u:h?h.units.length:0,ele:h?h.units.filter(u=>u.v==='elef').length:0,at:h?PROV_DEF[h.p].id:'-',hpass:h&&h.hnPass?(h.hnPass.heim?'heim':'pass'):'',
    hm:H?men(H):null,hat:H?PROV_DEF[H.p].id:null,hpas:H&&H.hnPass?1:0,hasd:F.hn_hasd,how:F.hn_hasdHow||null,
    nat:N?PROV_DEF[N.p].id:null,nd:(N&&H)?pdist(N.p,H.p):null,ndh:(N&&h)?pdist(N.p,h.p):null,hd:(H&&h)?pdist(h.p,H.p):null,go:F.hn_neroGo!=null?F.hn_neroGo-S.scen.t0:null,nb:!!F.hn_neroB,
    gunst:F.hn_gunst!=null?Math.round(F.hn_gunst):null,wahl:F.hn_wahl||null,zama:F.hn_zama||null,arr:F.hn_hasdArr||null,
    provs:provsOf(f).length,gold:Math.round(S.fac[f].gold),acts:(o&&(o.acts||[o.txt])||[]).join('; '),over:S.over,sov:S.scen.over,res:S.scen.res,why:S.scen.why||'',hnEnd:S.scen.hnEnd||null,lat:S.prov[PI.latium].owner};return x;},o);
  await p.evaluate((x)=>PL.rows.push(x),row);lastRow=row;
  console.log(`R${String(row.rel).padStart(2)} | ${row.y<0?-row.y+' v':row.y} | S${row.step} | ${row.men}/${row.u}E ${row.ele}el @${row.at}${row.hpass?' ['+row.hpass+']':''} | ${row.hm==null?'-':row.hm+' @'+row.hat+(row.hpas?' PASS':'')} [${row.hasd||'-'}${row.how?':'+row.how:''}] | ${row.nat?row.nat+' ('+row.nd+')':'-'} | G${row.gunst==null?'-':row.gunst}${row.wahl?' W:'+row.wahl:''}${row.zama?' Z:'+row.zama:''} | ${row.acts}`);
  if(o&&o.dead){console.log('ABBRUCH: '+o.txt);break;}
  if(!t&&!(row.sov||row.over)){console.log('BEFUND blockiert: Runde ließ sich nicht beenden (R'+row.rel+')');break;}
  if(row.sov||row.over){
   // Endfenster einsammeln: Schlussentscheidung („Der Sieg Karthagos“) und Endefenster beantworten
   await p.evaluate(async()=>{for(let k=0;k<3;k++){for(let i=0;i<12&&mOpen();i++){answer('ende');await sl(60);}if(S.scen.q&&!S.scen.q.length&&!mOpen()&&k>0)break;if(!mOpen()&&!busy)try{await turn();}catch(e){}}});
   console.log('ENDE: Szenario over='+row.sov+' res='+row.res+' '+row.why+' hnEnd='+JSON.stringify(row.hnEnd));break;}
  if(Date.now()-t0>420000){console.log('Zeitlimit des Laufs (7 Min) erreicht');break;}
 }
 // Nach dem Ende: Spielerlauf-Zustand für Auswertung
 const E=await p.evaluate(()=>{const Z=S.scen,F=hnFl();return{botlog:BOT.log,rows:PL.rows,ev:BOT.ev,stuck:BOT.stuck,att:BOT.att,ph:BOT.ph,txt:BOT.txt,wait:BOT.wait,warn:errsW.slice(),pre:PL.pre||null,hasSnap:!!PL.snap,
   scen:{over:Z.over,res:Z.res,why:Z.why,hnEnd:Z.hnEnd||null,rank:Z.rank},year:S.year,yearTxt:fmtYear(S.year),fl:{hasd:F.hn_hasd,how:F.hn_hasdHow,arr:F.hn_hasdArr,go:F.hn_neroGo,wahl:F.hn_wahl,zama:F.hn_zama,gunst:F.hn_gunst},t0:Z.t0,story:{i:stState(S.player).i,end:stState(S.player).end,done:stState(S.player).done}};});
 fs.writeFileSync((process.env.HN4_OUT||'/tmp')+`/hn4_lauf_${variant}${nr}.json`,JSON.stringify(E));return E;};
// ---- Zama-Wiederholungen aus dem Ladepunkt (Schlacht von Hand: resolveAttack wie hinter „Berechnen“, ABKÜRZUNG: ohne Fenster)
const ZAMAQ=async(plan)=>await p.evaluate(async({plan,N})=>{if(!PL.snap)return null;const J=PL.snap;const res=[];
 for(let i=0;i<N;i++){loadGame(JSON.parse(J));try{closeModal();}catch(e){}await sl(250);const h=hero(),sc=S.armies.find(x=>x.scip&&x.units.length);if(!h||!sc){res.push({err:'kein Heer'});continue;}
  h.plan=plan==='zurueck'&&planZurOk(h)?'zurueck':'frontal';h.mp=85;const m0=men(h),F=hnFl();let r=null,err=null;try{r=resolveAttack(h,sc.p);}catch(e){err=String(e.message||e).slice(0,80);}
  res.push({win:r?!!r.win:null,zama:F.hn_zama,over:!!S.scen.over,m1:men(hero()),m0,eleTxt:(r&&r.eleTxt||'').slice(0,60),err,why:S.scen.why||''});try{closeModal();}catch(e){}
  for(let k=0;k<3&&mOpen();k++){answer('zq');await sl(30);}}
 return res;},{plan,N:NZ});
const ALL={};
for(const [v,n] of PLAN){ALL[v]=[];for(let i=1;i<=n;i++){
  const E=await BOTRUN(v,i);ALL[v].push(E);
  const rows=E.rows;const last=rows[rows.length-1]||{};
  const arrRow=rows.find(x=>x.arr);const goRow=rows.find(x=>x.go!=null);
  info(`Lauf ${v}${i}: Ergebnis`,{runden:rows.length,letzterSchritt:last.step,scen:E.scen,fl:E.fl,jahrEnde:E.yearTxt,story:E.story});
  if(v!=='D'){info(`Lauf ${v}${i}: Hasdrubal Ankunft Runde / Männer / Nero`,{ankunftRunde:arrRow?arrRow.rel:null,arr:arrRow?arrRow.arr:null,neroLos:goRow?goRow.go:null,
     neroAbstandBeiLos:goRow?goRow.nd:null,hannibalAbstandBeiLos:goRow?goRow.hd:null,ausgang:E.fl.hasd+(E.fl.how?':'+E.fl.how:''),
     neroNah:(()=>{const x=rows.find(y=>y.nd!=null&&y.nd<=1);return x?x.rel:null;})(),hannibalNah:(()=>{const x=rows.find(y=>y.hd!=null&&y.hd<=1&&y.go!=null);return x?x.rel:null;})()});}
  if(E.pre)info(`Lauf ${v}${i}: Zama-Vorstand`,E.pre);
  if(E.txt.length)for(const t of E.txt.filter(t=>/Ende|Sieg|Niederlage|Zama/.test(t.h2)))console.log(`  Endfenster R${t.r} Jahr ${t.y}: ${t.h2} | ${t.sub} | ${t.t.slice(0,420)}`);
  console.log('Ereignisfenster (Runde | Jahr | Kopf | Titel | Optionen | Wahl):');for(const e of E.ev)console.log(`  R${e.r} | ${e.y} | ${e.eb} | ${e.h2} | ${e.n} | ${e.pick} (${e.why})`);
  bef(`Lauf ${v}${i}: Fehler im Fensterbot`,E.botlog.length>0,E.botlog.slice(0,3));
  bef(`Lauf ${v}${i}: Fenster ohne Knopf (Sackgasse)`,E.stuck.length>0,E.stuck.slice(0,3));
  bef(`Lauf ${v}${i}: Platzhalter im Text (undefined/NaN/\${/[object/null)`,E.ph.length>0,E.ph.slice(0,4));
  const warn=E.warn.filter(w=>/Hannibal|Pass|Kelten|Konsul|Cannae|Fabius|Rat|Hasdrubal|Wahl|Nero|Zama|Verweich|Geschichte|Ereignis/.test(w));bef(`Lauf ${v}${i}: Warnungen aus Hannibal-Bausteinen`,warn.length>0,warn.slice(0,5));
  bef(`Lauf ${v}${i}: Ende kam (scen.over) innerhalb der Rundengrenze`,!E.scen.over,{runden:rows.length,step:last.step});
  if(LOG)console.log('Logzeilen:\n  '+(await p.evaluate(()=>S.log.slice(-25).map(e=>e.t).join('\n  '))));
  if(v==='B'||v==='C'){const Q=await ZAMAQ(v==='C'?'zurueck':'frontal');ALL[v][ALL[v].length-1].Q=Q;
   if(Q){const w=Q.filter(x=>x.zama==='won').length,l=Q.filter(x=>x.zama==='lost').length,er=Q.filter(x=>x.err);
    info(`Zama-Wiederholungen ${v}${i} (Ladepunkt vor der Schlacht, ${Q.length} Schlachten, resolveAttack ohne Fenster)`,{gewonnen:w,verloren:l,anders:Q.length-w-l,fehler:er.slice(0,2),beispiel:Q.slice(0,2)});}
   else info(`Zama-Wiederholungen ${v}${i}`,'nicht getestet: Lauf erreichte Zama nicht (kein Ladepunkt)');}
  console.log(`   (Zeit seit Start: ${Math.round((Date.now()-T0)/1000)} s)`);
}}
// ---- Zusammenfassung je Variante
for(const v of Object.keys(ALL)){const L=ALL[v];if(!L.length)continue;
 const sum=L.map(E=>({arr:(E.rows.find(x=>x.arr)||{}).rel||null,pct:(E.fl.arr||{}).pct||null,how:E.fl.hasd+(E.fl.how?':'+E.fl.how:''),wahl:E.fl.wahl,zama:E.fl.zama,end:E.scen.hnEnd&&E.scen.hnEnd.e+'/'+E.scen.hnEnd.c,res:E.scen.res,jahr:E.yearTxt,runden:E.rows.length}));
 info(`Zusammenfassung Variante ${v}`,sum);
 if(v==='B'||v==='C'){const Q=[].concat(...L.map(E=>E.Q||[]));if(Q.length){const w=Q.filter(x=>x.zama==='won').length;info(`Zama-Siegquote Variante ${v} (alle Wiederholungen)`,{siege:w,von:Q.length,quote:Math.round(100*w/Q.length)+' %'});}}}
ok('Keine Seiten-/Konsolenfehler im ganzen Test',!errs.length,errs.slice(0,3));
console.log(`Gesamtlaufzeit ${Math.round((Date.now()-T0)/1000)} s`);
console.log(R.every(x=>x)?'ALLE PASS':'FEHLER '+R.filter(x=>!x).length);await b.close();})();
