// node hn_kampagne_t.js <html> [port] – Prüfung der Hannibal-Kampagne (SCEN.hannibal, H1–H4, v234–v237) auf Spielbarkeit; Bericht: dev/docs/pruef_hannibal_kampagne.md
// Vorbild: vk_kampagne_t.js. Ein Bot spielt die ganze Geschichte mit den Funktionen, die auch Knöpfe/Gesten auslösen
// (orderMove/marchTo, Angriffsfenster mit Belagern/Berechnen anklicken, endTurn, Ereignisfenster anklicken, Abfall, Rekrutieren, Boten/Verstärkung des Rats).
// Ereignisfenster: erste vernünftige Wahl (erste Option; HN_WAHL=0 Rom angreifen, 1 heimkehren). Protokoll je Runde; BEFUND = Messziel/Problem, PASS/FAIL nur für harte Tatsachen.
// Umgebung: HN_LAUFE=1|2 (Anzahl Läufe, Standard 1), HN_RUNDEN (Standard 72), HN_SKIP=PASSIV,ABK,ALT (Teile auslassen). Echtes iPad nicht getestet.
const {chromium}=require('playwright');
const FILE=process.argv[2]||require('path').join(__dirname,'..','imperium.html'),PORT=process.argv[3]||'8772';
const LAUFE=+(process.env.HN_LAUFE||1),RUNDEN=+(process.env.HN_RUNDEN||72),SKIP=(process.env.HN_SKIP||'').split(',');
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
 window.playCine=(o,d)=>{d&&d();};/* Kino (Bilder fehlen ohnehin) überspringen */
 window.errsW=[];const _w=console.warn;console.warn=function(){errsW.push([...arguments].map(x=>x&&x.message||String(x)).join(' ').slice(0,200));_w.apply(console,arguments);};
 window.sl=ms=>new Promise(z=>setTimeout(z,ms));
 window.BOOST=false;window.BOT={ev:[],stuck:[],att:[],wopt:0,prevOwn:null,flips:[]};
 window.setup=()=>{startScenario('hannibal');try{closeModal();}catch(e){}storyRound();};
 window.gotoStep=i=>{const f=S.player,s=S.story[f];s.i=i;s.t0=S.turn;s.done=false;s.end=false;s.w0=stW(f);s.g=stResolve(f,stCh(f).steps[i].g);return s;};
 window.RU=n=>{const L=[];for(let i=0;i<n;i++)L.push(i%3===2?['spear','socii']:i%7===6?['cav']:['sword','manipel']);return L;};
 window.REGS=new Set(['hisp_ost','hisp_sued','hisp_west','gallien_sued','gallien_mitte','gallien_nord','it_nord','it_mitte','it_sued','inseln','africa','salasser','segusiner','vocontier','helvetier']);
 window.mOpen=()=>{const m=document.querySelector('#modal');return!!m&&!m.hidden;};
 window.mText=()=>mOpen()?document.querySelector('#dialog').innerText.replace(/\s+/g,' ').trim():'';
 window.mBtns=()=>[...document.querySelectorAll('#dialog .actions .btn, #dialog .evopt')].filter(x=>!x.disabled);
 // Ein offenes Fenster beantworten wie ein Spieler: Ereignis = erste Option; sonst Weiter/Verstanden/…; protokolliert Titel, Jahr, Wahl
 window.answer=(tag)=>{if(!mOpen())return null;const d=document.querySelector('#dialog'),t=mText(),h2=(d.querySelector('h2')||{}).innerText||'',sub=(d.querySelector('.sub')||{}).innerText||'',eb=(d.querySelector('.eyebrow')||{}).innerText||'';
  const bs=mBtns();let b=null,why='';
  if(!bs.length){const x=d.querySelector('.dlgx');if(!/Das Zeitalter|Buch des Reiches|Untergang/.test(h2+t))BOT.stuck.push({r:S.turn-S.scen.t0,h2,t:t.slice(0,160)});if(x)x.click();else closeModal();return{h2,none:true};}
  const ev=bs.filter(x=>x.classList.contains('evopt'));
  if(/Wer bleibt in Hispanien/.test(t)){b=bs.find(x=>/Alle ziehen mit/.test(x.textContent));why='alle';}
  else if(/Welchen Weg/.test(t)){b=bs.find(x=>/lange Weg/.test(x.textContent))||ev[0];why='route lang';}
  else if(/Rom angreifen|heimkehren/.test(t)&&/Rom/.test(h2)){b=ev[BOT.wopt]||bs[BOT.wopt];why='wahl'+BOT.wopt;}
  else if(ev.length){b=ev[0];why='erste Option';}
  else{const pref=[/Belagern/,/Weiter|Verstanden|Weiterspielen|Annehmen|Flöße/,/Ablehnen/,/Fortsetzen|Berechnen/];for(const re of pref){b=bs.find(x=>re.test(x.textContent));if(b)break;}if(!b)b=bs.find(x=>x.classList.contains('primary'))||bs[0];why='Standard';}
  BOT.ev.push({r:S.turn-S.scen.t0,y:(sub.match(/(\d{1,4}) (v|n)\. Chr\./)||['',''])[0],eb:eb.replace(/\s+/g,' ').slice(0,30),h2:h2.replace(/\s+/g,' ').slice(0,50),n:bs.length,pick:(b.querySelector('b')||b).textContent.trim().slice(0,30),why,tag:tag||''});
  b.click();return{h2,pick:b.textContent.trim()};};
 window.drain=async(tag,max=60)=>{let n=0;for(let i=0;i<max;i++){await sl(40);if(!mOpen()){if(!busy)break;continue;}answer(tag);n++;await sl(30);}return n;};
 // Runde beenden wie der Knopf: endTurn(), danach alle Fenster beantworten, bis die nächste Runde frei ist
 window.turn=async()=>{const t0=S.turn;for(let k=0;k<4&&S.turn===t0;k++){document.querySelectorAll('.cine').forEach(e=>e.remove());if(S.over)return false;if(!busy)endTurn();for(let j=0;j<400&&(busy||mOpen());j++){if(mOpen())answer('runde');await sl(40);}await sl(30);}
  for(let j=0;j<40&&mOpen();j++){answer('nach');await sl(30);}return S.turn!==t0;};
 window.hero=()=>S.armies.find(x=>x.id===S.scen.hero&&x.units.length&&!x.boat);
 window.men=a=>a?a.units.reduce((s,u)=>s+u.men,0):0;
 window.bfs=(from,okFn)=>{const prev={[from]:-1},q=[from];while(q.length){const c=q.shift();if(c!==from&&okFn(c)){const pa=[];let k=c;while(k!==from){pa.unshift(k);k=prev[k];}return pa;}for(const n of ADJ[c]){if(prev[n]!==undefined||!isAct(n)||isSeaLink(c,n))continue;const o=S.prov[n].owner;if(o==='massilia'||o==='syrakus')continue;prev[n]=c;q.push(n);}}return null;};
 // Angriff wie ein Spieler: orderMove öffnet das Angriffsfenster; Belagern bei Mauern (erste Runde), sonst Berechnen
 window.attack=async(a,pi)=>{const f=S.player;const r0=S.turn;orderMove(a,pi);let res='nichts';
  for(let g=0;g<8;g++){await sl(60);if(!mOpen())break;const t=mText(),bs=mBtns();
   if(/Angriff auf/.test(t)){const bel=bs.find(x=>/Belagern/.test(x.textContent)),ber=bs.find(x=>/Berechnen/.test(x.textContent));
    const sg=S.sieges&&S.sieges[pi]&&S.sieges[pi].f===f;
    const m=/Erst nach (\d+)/.exec(t);BOT.att.push({r:r0-S.scen.t0,pi:PROV_DEF[pi].id,pct:(t.match(/Aussicht[^A-Za-z]*([A-Za-zä ]+)/)||[])[1]||'',sieg:!!m});
    const b=(bel&&!sg&&m)?bel:ber||bel;b.click();res=(b===bel?'belagern':'berechnen');
    for(let j=0;j<300&&(busy||!mOpen());j++){await sl(40);if(mOpen())break;}
    for(let j=0;j<5&&mOpen();j++){answer('kampf');await sl(40);}break;}
   else if(/Krieg|Frieden mit/.test(t)&&bs.find(x=>/Krieg erklären/.test(x.textContent))){bs.find(x=>/Krieg erklären/.test(x.textContent)).click();res='krieg';await sl(80);}
   else answer('weg');}
  return res;};
 // Heer zum Ziel: Schritt für Schritt (jeder Hop ist ein Marsch- oder Angriffsbefehl), solange Bewegung übrig ist
 window.stepTo=async(h,path)=>{let hops=0;while(path&&path.length&&h.mp>0&&hops++<7&&!h.hnPass&&h.units.length){const nx=path[0];if(h.p===nx){path.shift();continue;}const o=S.prov[nx].owner,own=o===S.player;
   if(own||passOk(h.f,nx)){const p0=h.p;marchTo(h,nx);for(let j=0;j<6&&mOpen();j++){answer('marsch');await sl(50);}if(h.p===nx){path.shift();continue;}if(h.p===p0&&!h.goal)break;break;}
   if(scenStepI()>=4){let q=9;try{const cx=startAttackCtx(h,nx);q=cx.res.att/Math.max(1,cx.res.def);}catch(e){}if(q<0.9){BOT.wait=(BOT.wait||0)+1;break;}}
   const m0=h.p;await attack(h,nx);if(S.prov[nx].owner===S.player&&h.p!==nx&&h.mp>0){marchTo(h,nx);for(let j=0;j<4&&mOpen();j++){answer('marsch');await sl(50);}}if(h.p===nx){path.shift();continue;}break;}};
});
await p.evaluate(b=>{window.BOOST=b;},process.env.HN_BOOST==='1');
// ---- Spielerlauf: Bot
const lauf=async(nr,wopt)=>{
 const S0=await p.evaluate((wopt)=>{BOT.ev=[];BOT.stuck=[];BOT.att=[];BOT.wopt=wopt;errsW.length=0;setup();window.PL={rows:[],own:S.prov.map(P=>P.owner),flip:S.prov.map(()=>[]),ev:{},t0:S.turn};
  for(let i=0;i<5;i++){if(mOpen())answer('start');}return{turn:S.turn,t0:S.scen.t0,year:S.year,gold:S.fac[S.player].gold,net:income(S.player).net,men:men(hero()),units:hero().units.length};},wopt);
 info(`Lauf ${nr} Start`,S0);console.log('Runde | Jahr | Schritt | Gold (Bilanz) | Männer/Einheiten @Ort | Gunst Kelten | Provinzen | Aktion');
 const t0=Date.now();let lastStep=-1,stepSince=0;
 for(let r=1;r<=RUNDEN;r++){
  const o=await p.evaluate(async()=>{
   const f=S.player,F=hnFl(),h=hero(),rel=S.turn-S.scen.t0,acts=[];
   // Ereignisse/Kelten/Rat vorher (Fenster der letzten Runde sind schon beantwortet)
   for(let i=0;i<10&&mOpen();i++){answer('vor');await sl(40);}
   if(!h)return{dead:true,rel,txt:'Heer des Helden fehlt; Over='+S.over+' '+(S.scen.why||'')};
   h.mp=h.mp==null?maxMP(h):h.mp;
   if(!h.hnPass){
    const owned=i=>S.prov[i].owner===f;
    const step=scenStepI();
    // Rekrutieren: in eigener Provinz mit Platz, Gold über Reserve (wie ein Spieler, der Lücken füllt)
    try{const P=S.prov[h.p];if(P.owner===f&&S.fac[f].gold>350&&h.units.length<armyMax(f)&&P.rec>0){let n=0;for(const [ro,v] of [['spear','libyer'],['sword','scutar'],['spear','libyer']]){if(S.fac[f].gold<300||h.units.length>=armyMax(f)||P.rec<=0)break;const rr=recruit(f,h.p,ro,v);if(rr)n++;}if(n)acts.push('rekr'+n);}}catch(e){}
    // Abkürzung HN_BOOST=1: nach der Ankunft in der Poebene wird das Heer einmalig aufgefüllt (sonst bricht der Bot hier ein und späte Schritte bleiben unmessbar)
    if(BOOST&&F.hn_ankunft&&!F.zz_boost){F.zz_boost=1;for(const u of h.units)u.men=unitStat(f,u.r,u.v).men;for(const [ro,v] of [['spear','libyer'],['spear','libyer'],['sword','scutar'],['sword','scutar'],['cav','numid'],['missile','balear']]){if(h.units.length<armyMax(f))h.units.push(newUnit(f,ro,v));}acts.push('ABKÜRZUNG: Heer aufgefüllt');}
    // Läuft eine Belagerung: warten, bis Sturm möglich ist (wie ein Spieler), dann stürmen
    if(h.st==='belagern'&&h.sieg!=null&&S.prov[h.sieg].owner!==f&&S.sieges&&S.sieges[h.sieg]){const need=siegeNeed(f,h.sieg,h),t=S.sieges[h.sieg].t;
     if(t>=need){const sg=h.sieg,r=await attack(h,sg);acts.push('Sturm '+PROV_DEF[sg].id+' '+r+' (Besitz: '+S.prov[sg].owner+')');}else acts.push('Belagerung '+PROV_DEF[h.sieg].id+' '+t+'/'+need);}
    else {
    // Ziel wählen
    let path=null,why='';
    const SET=ids=>i=>ids.some(id=>PI[id]===i)&&!owned(i);
    if(step===0){path=bfs(h.p,i=>i===PI.edetaner);why='Sagunt';}
    else if(step<=1){path=bfs(h.p,SET(['tarraco','ilergeten','ilerkavonen','vasconen']));why='Ebro/Pyrenäen';}
    else if(step===2){path=bfs(h.p,SET(['narbo','vocontier','allobroger']));why='Rhone';}
    else if(step===3){path=F.hn_ankunft?null:bfs(h.p,i=>i===PI.seealpen||i===PI.salasser||i===PI.segusiner);why=F.hn_ankunft?'Poebene halten':'Pass';}
    else if(step===4){path=bfs(h.p,SET(['insubrien','aemilia','cenomanen','taurini']))||bfs(h.p,i=>S.prov[i].owner==='rom'&&isAct(i));why='Kelten';}
    else if(step===5){// Trebia/Trasimene: Konsulheere schlagen: Heer von Rom, das am nächsten steht, sonst nächste römische Provinz
     const rp=new Set(S.armies.filter(x=>x.f==='rom'&&x.units.length&&!x.boat).map(x=>x.p));path=bfs(h.p,i=>rp.has(i)&&S.prov[i].owner!==f)||bfs(h.p,i=>S.prov[i].owner==='rom'&&isAct(i)&&!owned(i));why='Konsul';}
    else if(step===6){const ids=new Set(S.armies.filter(x=>x.f==='rom'&&x.units.length&&x.hnCan===1).map(x=>x.p));
     path=bfs(h.p,i=>ids.has(i)&&S.prov[i].owner!==f)||bfs(h.p,i=>S.prov[i].owner==='rom'&&isAct(i)&&!owned(i));if(!path&&ids.has(h.p))path=null;why='Cannae';}
    else if(step===7){path=bfs(h.p,i=>['kampanien','lukanien','bruttium','apulien','samnium','hirpinien','tarent'].some(id=>PI[id]===i)&&S.prov[i].owner!==f);why='Süden';}
    else if(step===8){const H=S.armies.find(x=>x.hasd&&x.f===f&&x.units.length);path=H?bfs(h.p,i=>i===H.p):null;if(path&&!path.length)path=null;why='Hasdrubal';}
    else{path=bfs(h.p,i=>S.prov[i].owner==='rom'&&isAct(i)&&!owned(i));why='Rom';}
    // Aktion: Rom-Heer neben dem Helden mit guter Aussicht angreifen (Verteidigung gegen die Konsuln)
    if(path&&path.length){await stepTo(h,path);acts.push(why+' → '+PROV_DEF[h.p].id+(h.hnPass?' (Pass)':''));}
    else acts.push(why+' (kein Weg)');
    }
    // Abfall Süditalien (Schritt Capua): wie der Knopf
    try{if(step>=7)for(const n of [h.p,...ADJ[h.p]]){if(S.fac[f].gold>=defectCost()+150&&canDefect(f,n)&&tryDefect(f,n)){acts.push('Abfall '+PROV_DEF[n].id);break;}}}catch(e){}
   } else acts.push('im Pass');
   // Rat von Karthago: Boten bei niedriger Gunst, Verstärkung wenn bewilligbar
   try{if(hnRatOn()){const F2=hnFl();if(F2.hn_gunst<45&&!hnBotenWhy()&&S.fac[f].gold>hnBotenCost()+250){hnRatAct('boten');acts.push('Boten');}
    if(!hnVerstWhy(hnVerstNext())&&F2.hn_gunst>=70){hnRatAct('verst');acts.push('Verstärkung');}}}catch(e){}
   return{acts};});
  // Fenster beantworten, die durch die Aktionen aufgegangen sind, dann Runde beenden
  await p.evaluate(async()=>{for(let i=0;i<8&&mOpen();i++){answer('nach-aktion');await sl(40);}});
  const t=await p.evaluate(async()=>await turn());
  const row=await p.evaluate((o)=>{const f=S.player,F=hnFl(),h=hero(),rel=S.turn-S.scen.t0;
   // Besitzwechsel verfolgen (Pingpong)
   const cur=S.prov.map(P=>P.owner);S.prov.forEach((P,i)=>{if(PL.own[i]!==cur[i])PL.flip[i].push([rel,PL.own[i],cur[i]]);});PL.own=cur;
   const x={rel,y:S.year,step:scenStepI(),gold:Math.round(S.fac[f].gold),net:Math.round(income(f).net),men:men(h),u:h?h.units.length:0,at:h?PROV_DEF[h.p].id:'-',pass:h&&h.hnPass?1:0,
    gunst:F.hn_gunst!=null?Math.round(F.hn_gunst):null,kelt:F.hn_kelt!=null?Math.round(F.hn_kelt):null,provs:provsOf(f).length,acts:(o&&o.acts||[o&&o.txt]).join('; '),over:S.over,sov:S.scen.over,res:S.scen.res,why:S.scen.why||'',
    f:{krieg:F.hn_krieg,besatz:F.hn_besatz,rhone:F.hn_rhone,landung:F.hn_landung,pass:F.hn_pass,ank:F.hn_ankunft,can:F.hn_can,canT:F.hn_canT,canT2:F.hn_canT2,hasd:F.hn_hasd,wahl:F.hn_wahl,zama:F.hn_zama,fab:F.hn_fab,gunst:F.hn_gunst},year:S.year,sagunt:S.prov[PI.edetaner].owner};
   x.sagOwn=x.sagunt===f?'k':'';return x;},{acts:null});
  // acts aus dem ersten evaluate übernehmen
  row.acts=(o&&(o.acts||[o.txt]).join('; '))||'';
  await p.evaluate((x)=>PL.rows.push(x),row);
  console.log(`R${String(row.rel).padStart(2)} | ${row.y<0?-row.y+' v':row.y} | S${row.step} | ${row.gold} (${row.net>=0?'+':''}${row.net}) | ${row.men}/${row.u}E @${row.at}${row.pass?' PASS':''} | G${row.gunst==null?'-':row.gunst} K${row.kelt==null?'-':row.kelt} | ${row.provs}P | ${row.acts}`);
  if(o&&o.dead){console.log('ABBRUCH: '+o.txt);break;}
  if(!t){console.log('BEFUND blockiert: Runde ließ sich nicht beenden (R'+row.rel+')');break;}
  if(row.sov||row.over){console.log('ENDE: Szenario over='+row.sov+' res='+row.res+' '+row.why);break;}
  if(row.step!==lastStep){lastStep=row.step;stepSince=row.rel;}
  if(Date.now()-t0>1500000){console.log('Zeitlimit des Laufs erreicht');break;}
 }
 const E=await p.evaluate(()=>{const f=S.player;return{rows:PL.rows,ev:BOT.ev,stuck:BOT.stuck,att:BOT.att,flip:PL.flip.map((a,i)=>a.length>2&&REGS.has(PROV_DEF[i].reg)?[PROV_DEF[i].id,a]:null).filter(Boolean),flipN:PL.flip.map((a,i)=>a.length&&REGS.has(PROV_DEF[i].reg)?[PROV_DEF[i].id,a.length]:null).filter(Boolean),warn:errsW.slice(),log:S.log.slice(-45).map(e=>e.t),story:stState(f)&&{i:stState(f).i,end:stState(f).end},scen:{over:S.scen.over,res:S.scen.res,rank:S.scen.rank,why:S.scen.why,turn:S.turn-S.scen.t0}};});
 fs.writeFileSync((process.env.HN_OUT||'/tmp')+`/hn_lauf${nr}.json`,JSON.stringify(E));
 return E;};
const auswerten=(nr,E)=>{const rows=E.rows;const first=(fn)=>{const r=rows.find(fn);return r?r.rel:null;};
 const sag=first(x=>x.sagOwn==='k');
 const ank=rows.find(x=>x.f.ank)||null;const ankI=ank?ank.f.ank:null;
 const can0=first(x=>x.f.can);const can2=rows.find(x=>x.f.canT2)||null;
 const stepAt={};for(const r of rows)if(stepAt[r.step]==null)stepAt[r.step]=r.rel;
 info(`Lauf ${nr}: Schritt -> erste Runde`,stepAt);
 info(`Lauf ${nr}: Sagunt gefallen in Runde / Ankunft Poebene / Cannae`,{sagunt:sag,ankunft:ankI,can_start:rows.find(x=>x.f.canT)?rows.find(x=>x.f.canT).f.canT:null,can_ende:can2?can2.f.canT2:null,can:rows.length?rows[rows.length-1].f.can:null});
 bef(`Lauf ${nr}: Sagunt nicht vor Runde 3`,sag!=null&&sag<3,{runde:sag});
 bef(`Lauf ${nr}: Ankunft Poebene Runde 9–12 mit 40–60 % der Männer`,!ankI||ankI.t-rows[0].rel<0||(ankI.t-(rows[0].rel-1))<9||(ankI.t-(rows[0].rel-1))>12||ankI.pct<40||ankI.pct>60,ankI);
 const y=rows.map(r=>r.y);
 info(`Lauf ${nr}: Jahr je 8 Runden`,rows.filter((r,i)=>i%8===0).map(r=>[r.rel,r.y]));
 const g10=rows.find(x=>x.rel===10);bef(`Lauf ${nr}: Gold nach 10 Runden > 0`,!g10||g10.gold<=0,g10&&{gold:g10.gold,net:g10.net});
 const ital=rows.filter(x=>x.step>=4&&x.step<=8&&!x.pass);const avg=ital.length?Math.round(ital.reduce((s,x)=>s+x.net,0)/ital.length):null;
 info(`Lauf ${nr}: mittlere Bilanz in Italien (Schritte 4–8), Minimum Gold`,{bilanz:avg,n:ital.length,minGold:Math.min(...rows.map(x=>x.gold))});
 bef(`Lauf ${nr}: Bilanz in Italien dauerhaft negativ (Gold fällt unter 0)`,rows.some(x=>x.gold<=0&&x.step>=4),{minGold:Math.min(...rows.map(x=>x.gold)),avg});
 bef(`Lauf ${nr}: Pingpong (Provinz > 2 Besitzerwechsel im Lauf)`,E.flip.length>0,E.flip.slice(0,6));
 info(`Lauf ${nr}: Besitzwechsel je Provinz (alle)`,E.flipN);
 bef(`Lauf ${nr}: Fenster ohne Knopf (blockiert)`,E.stuck.length>0,E.stuck.slice(0,3));
 const lastStep=rows.length?rows[rows.length-1].step:0;
 info(`Lauf ${nr}: Ende`,{runden:rows.length,letzterSchritt:lastStep,scen:E.scen});
 // Dauer je Schritt
 const starts=Object.entries(stepAt).map(([k,v])=>[+k,v]);const dur=starts.map(([k,v],i)=>[k,(starts[i+1]?starts[i+1][1]:rows[rows.length-1].rel+1)-v]);
 info(`Lauf ${nr}: Runden je Schritt`,dur);bef(`Lauf ${nr}: Schritt dauert > 25 Runden (Stillstand)`,dur.some(d=>d[1]>25&&d[0]<9),dur.filter(d=>d[1]>25));
 // Ereignisfenster: Jahr, Titel, Wahl
 console.log('Ereignisfenster (Runde | Jahr | Kopfzeile | Titel | Optionen | Wahl):');for(const e of E.ev)console.log(`  R${e.r} | ${e.y} | ${e.eb} | ${e.h2} | ${e.n} | ${e.pick} (${e.why})`);
 if(process.env.HN_LOG)console.log('Letzte Logzeilen:\n  '+E.log.join('\n  '));
 const warn=E.warn.filter(w=>/Hannibal|Pass|Kelten|Konsul|Cannae|Fabius|Rat|Hasdrubal|Wahl|Verweich|Geschichte|Ereignis/.test(w));
 bef(`Lauf ${nr}: Warnungen aus Hannibal-Bausteinen`,warn.length>0,warn.slice(0,5));};
// ===== Lauf 1 (und 2)
for(let L=1;L<=LAUFE;L++){const E=await lauf(L,L-1);auswerten(L,E);}
// ===== Abkürzungstest: erste Runden alles Naheliegende
if(!SKIP.includes('ABK')){const A=await p.evaluate(async()=>{const o={};BOT.ev=[];setup();const f=S.player,F=hnFl(),h=hero();
  // Rom direkt in Runde 1 angreifen (Latium) – geschlossen?
  o.romGate=(()=>{const a=h;let shown=false;const g=hnGate(a,PI.latium,()=>{});shown=g&&mOpen();const t=mText().slice(0,120);closeModal();return{gate:g,shown,t};})();
  // Seeweg: Heer einschiffen und Italien anlanden?
  o.sea=['apulien','kampanien','etrurien','lukanien'].map(id=>id+':'+(hnSeaLock(h,PI[id])?'gesperrt':'frei'));
  // Sagunt sofort: Zeitpunkt des Falls
  let cap=null;h.mp=maxMP(h);S.prov[PI.edetaner].gar=S.prov[PI.edetaner].gar;
  for(let r=1;r<=10&&cap==null;r++){const h2=hero();if(!h2)break;h2.mp=maxMP(h2);const path=bfs(h2.p,i=>i===PI.edetaner);if(path)await stepTo(h2,path);if(S.prov[PI.edetaner].owner===f){cap=S.turn-S.scen.t0;break;}await turn();}
  o.sagRunde=cap;o.siege=S.sieges&&S.sieges[PI.edetaner]?S.sieges[PI.edetaner].t:null;
  // Kriegserklärung Rom erfolgt?
  o.krieg=atWar(f,'rom');o.krT=F.hn_krieg;
  // Alle Kelten-Ziele in den ersten 5 Runden? Provinzen Poebene noch fremd/unbekannt
  o.kelt=['insubrien','aemilia','cenomanen','taurini'].map(id=>id+':'+S.prov[PI[id]].owner);
  o.step=scenStepI();o.ev=BOT.ev.map(e=>e.h2);return o;});
 info('Abkürzungstest (Rom-Tor, Seeweg, Sagunt sofort)',A);
 bef('Abkürzung: Sagunt vor Runde 3 gefallen',A.sagRunde!=null&&A.sagRunde<3,A.sagRunde);
 ok('Abkürzung: Seeweg nach Italien gesperrt (außer nach Akt IV)',A.sea.every(x=>/gesperrt/.test(x)),A.sea);
 ok('Abkürzung: Angriff auf Rom in Akt I fragt zurück (Tor mit Fenster)',A.romGate.gate&&A.romGate.shown,A.romGate);}
// ===== Stillstandstest passiv: 30 Runden nichts tun
if(!SKIP.includes('PASSIV')){const Pz=await p.evaluate(async()=>{setup();const f=S.player;BOT.ev=[];window.PL={own:S.prov.map(P=>P.owner),flip:S.prov.map(()=>[])};const rows=[];
  for(let r=1;r<=30;r++){const ok=await turn();if(!ok)break;const cur=S.prov.map(P=>P.owner);S.prov.forEach((P,i)=>{if(PL.own[i]!==cur[i])PL.flip[i].push([r,PL.own[i],cur[i]]);});PL.own=cur;
   if(r%5===0)rows.push({r,gold:Math.round(S.fac[f].gold),net:Math.round(income(f).net),men:men(hero()),provs:provsOf(f).length,war:atWar(f,'rom'),step:scenStepI(),y:S.year});if(S.over||S.scen.over)break;}
  return{rows,flip:PL.flip.map((a,i)=>a.length&&REGS.has(PROV_DEF[i].reg)?[PROV_DEF[i].id,a.map(x=>x.join('>'))]:null).filter(Boolean),ev:BOT.ev.map(e=>'R'+e.r+' '+e.h2),over:S.scen.over,res:S.scen.res,why:S.scen.why,turn:S.turn-S.scen.t0,hasHero:!!hero(),landung:hnFl().hn_landung,cap:S.prov[PI.karthago].owner};});
 info('Stillstand passiv (30 Runden, Spieler tut nichts): Haushalt alle 5 Runden',Pz.rows);info('Stillstand passiv: Besitzwechsel, Ereignisse, Ende',{flip:Pz.flip,ev:Pz.ev,over:Pz.over,res:Pz.res,why:Pz.why,turn:Pz.turn,landung:Pz.landung});
 bef('Passiv: Hauptstadt Karthago nach 30 Runden noch eigen (Rom-Landung gesperrt)',Pz.cap!=='karthago',Pz.cap);
 bef('Passiv: Provinz wechselt > 2-mal den Besitzer in 30 Runden',Pz.flip.some(x=>x[1].length>2),Pz.flip.filter(x=>x[1].length>2));
 bef('Passiv: Gold nach 10 Runden <= 0',(Pz.rows.find(x=>x.r===10)||{gold:1}).gold<=0,Pz.rows.find(x=>x.r===10));}
// ===== Korrekturen v238 (PASS/FAIL): Rom landet nicht in Africa, Rhone-Tor am Allobroger, Pass-Ziel nach Ankunft, Herrscher stirbt nicht, Held flieht statt zu verschwinden
if(!SKIP.includes('FIX')){const X=await p.evaluate(async()=>{const o={};setup();const f=S.player,F=hnFl(),h=hero();
  o.noLand0=hnNoLand(PI.karthago);o.noLandSpain=hnNoLand(PI.tarraco);gotoStep(8);o.noLand8=hnNoLand(PI.karthago);gotoStep(0);
  // Rhone-Tor am Allobroger
  F.hn_besatz='b';F.hn_rhone=null;S.prov[PI.arverner].owner=f;h.p=PI.arverner;h.pos=null;h.mp=maxMP(h);orderMove(h,PI.allobroger);await sl(120);o.rhone=/Der Strom ist breit/.test(mText());o.rhoneBtns=mBtns().length;closeModal();
  // Pass-Ziel nach Ankunft
  F.hn_ankunft={t:S.turn};S.scen.flags.in_segusiner=1;o.pass=SC_COND.pass(f,{});delete F.hn_ankunft;
  // Herrscher stirbt nicht
  const D=dynOf(f),n0=D.ruler.n;D.ruler.age=95;for(let i=0;i<60;i++)dynRound(f);o.ruler=[n0,D.ruler.n];
  // Held ohne eigene Nachbarprovinz: Rückzug statt Löschung
  setup();{const F2=hnFl();F2.hn_besatz='b';F2.hn_rhone=1;const h2=hero(),v=PI.venetien;for(const a of S.armies)if(a.id!==h2.id&&a.f===S.player)a.units=[];removeEmpty();for(const n of ADJ[v])if(S.prov[n].owner===S.player)S.prov[n].owner='rom';S.prov[v].owner=S.player;h2.p=v;h2.pos=null;for(const u of h2.units)u.men=30;
   let alive=0,fell=0,moved=0,wins=0,tries=18;for(let i=0;i<tries;i++){const ro=scenArmy('rom',[...ADJ[v]].find(n=>!isSeaLink(v,n)&&isAct(n)),RU(14),null);ro.mp=85;S.scen.heroFell=false;const r=resolveAttack(ro,v);const hh=S.armies.find(x=>x.id===S.scen.hero&&x.units.length);if(r.win){wins++;if(hh){alive++;if(hh.p!==v)moved++;}else if(S.scen.heroFell)fell++;}
    h2.units=h2.units.length?h2.units:[newUnit(S.player,'spear','libyer')];if(!S.armies.includes(h2)){S.armies.push(h2);}h2.p=v;S.prov[v].owner=S.player;for(const u of h2.units)u.men=30;S.scen.heroFell=false;removeEmpty();for(const a of S.armies.filter(x=>x.f==='rom'&&x.id!==ro.id))a.units=[];}
   o.rout={wins,alive,fell,moved,still:wins-alive-fell};}
  return o;});
 info('Korrekturen v238',X);
 ok('Rom landet nicht in Karthagos Heimat vor Akt IV (hnNoLand), in Hispanien weiter möglich, ab Akt IV frei',X.noLand0===true&&X.noLandSpain===false&&X.noLand8===false,[X.noLand0,X.noLandSpain,X.noLand8]);
 ok('Rhone-Fenster auch beim Zug nach Allobroger (Umweg über Arverner nicht mehr möglich)',X.rhone&&X.rhoneBtns===2,[X.rhone,X.rhoneBtns]);
 ok('Pass-Ziel 2 von 2 sofort nach der Ankunft in der Poebene (nicht erst eine Runde später)',X.pass&&X.pass[0]===2,X.pass);
 ok('Herrscher von Karthago stirbt in der Hannibal-Geschichte nicht (60 Runden mit Alter 95)',X.ruler[0]===X.ruler[1],X.ruler);
 ok('Held ohne eigene Nachbarprovinz: geschlagenes Heer flieht in eine Nachbarprovinz ohne Feindheer (oder fällt, nie still gelöscht)',X.rout.wins>=3&&X.rout.still===0&&X.rout.alive===X.rout.moved,X.rout);}
// ===== Alte Spielstände: Zustand mitten im Spiel ohne hn_-Flags laden (wie ein Stand von vor H1–H4)
if(!SKIP.includes('ALT')){const Al=await p.evaluate(async()=>{setup();const f=S.player;for(let r=0;r<4;r++)await turn();
  const J=JSON.parse(JSON.stringify(S));const fl=J.scen.flags||{};for(const k of Object.keys(fl))if(/^hn_/.test(k))delete fl[k];
  loadGame(J);try{closeModal();}catch(e){}await sl(500);const w0=errsW.length;let okT=0;for(let r=0;r<3;r++){if(await turn())okT++;}
  return{ok:okT,turn:S.turn-S.scen.t0,hero:!!hero(),scen:S.scen.id,warn:errsW.slice(w0).slice(0,3),step:scenStepI()};});
 ok('Alter Spielstand (ohne hn_-Flags, Runde 4) lädt und läuft 3 Runden ohne Fehler',Al.ok===3&&Al.hero&&Al.scen==='hannibal'&&!Al.warn.length,Al);}
ok('Keine Seiten-/Konsolenfehler im ganzen Test',!errs.length,errs.slice(0,3));
console.log(R.every(x=>x)?'ALLE PASS':'FEHLER '+R.filter(x=>!x).length);await b.close();})();
