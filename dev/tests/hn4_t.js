// node hn4_t.js <html> [port] – H4 (v237): Hannibal Paket 4, Akt IV Die Entscheidung.
// Schritt 9: Hasdrubal (Pass in Kurzform, 2 Ereignisse), Gegner-Drehbuch Nero (Eilmarsch), Vereinigung / Neros Niederlage / „Hasdrubals Kopf“ (nur Text),
// Schritt 10: Wahlfenster Rom angreifen / heimkehren (Seeweg offen, Heimkehr gesperrt), Sonderschlacht Zama (Panik 40 % je Elefanten-Einheit, Plan „Elefanten zurückhalten“, Masinissa),
// Ende A (Rom fällt, Zama gewonnen) und Ende B (Zama verloren, Abberufung, Zeit abgelaufen). Das echte iPad ist nicht getestet. Kino (Job 40/43) ist nur vorbereitet.
const {chromium}=require('playwright');
const FILE=process.argv[2]||require('path').join(__dirname,'..','imperium.html'),PORT=process.argv[3]||'8772';
(async()=>{const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:process.env.PW_GPU?[]:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const R=[];const ok=(n,c,i='')=>{R.push(!!c);console.log((c?'PASS ':'FAIL ')+n+(i!==''?'  '+JSON.stringify(i):''));};
const fs=require('fs');const SHOT=process.env.HN4_SHOT||'/tmp/claude-0/-home-claude/4f60f6a0-fa46-5154-9e84-95c0bd1121bd/scratchpad';
const SKIP=(process.env.HN4_SKIP||'').split(',');
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


await p.evaluate(()=>{
 window.prep=()=>{setup();const f=S.player,F=hnFl();S.prov[PI.tarraco].owner=f;F.hn_gunst=50;F.hn_gw=stW(f);F.hn_ga=F.abw||0;F.hn_gn=F.hn_nied||0;F.hn_pn=provsOf(f).length;F.hn_gLast=S.turn;F.hn_ratEnd=1;F.hn_pass=S.turn;F.hn_jagd=S.turn;F.hn_can='skip';F.hn_fabOff=1;clearRom();stState(f).q=[];};
 window.spawnH=()=>{gotoStep(8);stHook(S.player,8);return{H:S.armies.find(x=>x.hasd&&x.f===S.player),N:S.armies.find(x=>x.hnNero)};};
 window.nr=n=>{for(let i=0;i<n;i++){S.turn++;hnRound();}};
 window.evAll=()=>popEv();
 window.byz=()=>PI.byzacena;
});

// ---- (a) Hook 8: Hasdrubal bricht auf, Nero wartet im Süden, Startfenster ----
const A=await p.evaluate(()=>{const o={};prep();const f=S.player,F=hnFl(),lg0=S.log.length;const r=spawnH();const H=r.H,N=r.N;
 o.h=!!H;o.hname=H&&H.name;o.nero=!!N;o.nname=N&&N.name;o.nprov=N&&PROV_DEF[N.p].id;o.nunits=N&&N.units.length;o.nOwner=N&&N.f;o.flag=F.hn_hasd;o.id=F.hn_hasdId===H.id;
 const ev=evAll();o.ids=ev.map(x=>x.E.id);const st=ev.find(x=>x.E.id==='hn_hasd_start');o.txt=st&&st.E.text();o.opt=st&&st.E.opts.length;
 o.prog=SC_COND.hasdrubal(f,{});o.goal=stGoalText(stCh(f).steps[8].g);
 // Nero bleibt stehen, solange Hasdrubal nicht in Italien ist
 const p0=N.p;nr(3);o.still=N.p===p0&&!F.hn_neroGo;
 return o;});
console.log(JSON.stringify(A).slice(0,500));
ok('Hook 8: Hasdrubal (Heer des Hasdrubal) und Nero (rom, 6 Einheiten, in Apulien/Süden) erscheinen',A.h&&A.hname==='Heer des Hasdrubal'&&A.nero&&A.nname==='Heer des Claudius Nero'&&A.nOwner==='rom'&&A.nunits===6&&['apulien','daunien','lukanien','samnium','hirpinien','kampanien'].includes(A.nprov),[A.nprov,A.nunits]);
ok('Startfenster „Hasdrubal bricht auf“ nennt Wirkung und Kosten (Gunst −20, Angriff −10 %, 2 Tage, 2 Ereignisse)',A.ids.includes('hn_hasd_start')&&/Gunst −20/.test(A.txt)&&/−10 %/.test(A.txt)&&/2 Tage/.test(A.txt)&&A.opt===1,A.ids);
ok('Ziel nennt Vereinigung oder Neros Heer; Fortschritt 0 von 2, bevor Hasdrubal in Italien ist',/vereinen/.test(A.goal)&&/Nero/.test(A.goal)&&A.prog[0]===0&&A.prog[1]===2,[A.prog]);
ok('Nero rührt sich nicht, solange Hasdrubal nicht in Italien ist',A.still);

// ---- (b) Pass in Kurzform: 2 Tage, genau 2 Ereignisse, Heer steht still, Ankunft in der Poebene ----
const B=await p.evaluate(()=>{const o={};prep();const f=S.player,F=hnFl();const r=spawnH();const H=r.H,N=r.N;evAll();heroAt('kampanien',true);
 S.prov[PI.salasser].owner=f;H.p=PI.salasser;H.pos=null;H.goal=null;const men0=hnMen(H);
 nr(1);o.pass=!!(H.hnPass&&H.hnPass.hasd);o.dur=H.hnPass&&H.hnPass.dur;o.day0=H.hnPass&&H.hnPass.day;o.noNero=!F.hn_neroGo;
 let ev=evAll();o.e1=ev.map(x=>x.E.id);const berg=ev.find(x=>x.E.id==='hn_hasd_berg');o.bergOpts=berg.E.opts.map(x=>x.label);const m1=hnMen(H);berg.E.opts[0].fx();o.bergCut=Math.round((1-hnMen(H)/m1)*100);
 o.txtStill=hnPassTxt(H);o.html=hnPassHtml(H).length>0;
 nr(1);o.day1=H.hnPass&&H.hnPass.day;ev=evAll();o.e2=ev.map(x=>x.E.id);const sn=ev.find(x=>x.E.id==='hn_hasd_schnee');o.snOpts=sn.E.opts.map(x=>x.label);sn.E.opts[1].fx();o.durRast=H.hnPass&&H.hnPass.dur;
 nr(1);o.day2=H.hnPass&&H.hnPass.day;o.stillIn=!!H.hnPass;ev=evAll();o.e3=ev.map(x=>x.E.id);
 nr(1);o.arr=!H.hnPass;o.dest=PROV_DEF[H.p].id;o.pct=F.hn_hasdArr&&F.hn_hasdArr.pct;o.men=hnMen(H)/men0;o.go=F.hn_neroGo;
 ev=evAll();o.e4=ev.map(x=>x.E.id);const ne=ev.find(x=>x.E.id==='hn_nero');o.neroTxt=ne&&ne.E.text();o.cine=ne&&ne.E.cine;
 o.all=[...o.e1,...o.e2,...o.e3,...o.e4].filter(x=>/^hn_hasd_(berg|lawine|schnee)/.test(x)||x==='hn_hasd_berg');
 return o;});
console.log(JSON.stringify(B).slice(0,600));
ok('Hasdrubal im Pass: Eintritt in Salasser startet den Pass (2 Tage), Heer steht still, Leiste im Heer-Blatt',B.pass&&B.dur===2&&B.day0===0&&/Pass/.test(B.txtStill)&&B.html,[B.dur,B.txtStill]);
ok('Genau 2 Ereignisse im Pass (Bergstämme bei Eintritt, Schnee/Lawine am ersten Tag), Rasten verlängert um 1 Tag',B.e1.filter(x=>/^hn_hasd_/.test(x)).join()==='hn_hasd_berg'&&B.e2.filter(x=>/^hn_hasd_/.test(x)).join()==='hn_hasd_schnee'&&B.durRast===3&&B.e3.filter(x=>/^hn_hasd_/.test(x)).length===0,[B.e1,B.e2,B.e3,B.durRast]);
ok('Optionen der Pass-Ereignisse nennen Wirkung (Durchschlagen −6 % Männer)',B.bergOpts.length===2&&B.bergCut>=5&&B.bergCut<=7&&B.snOpts.length===2,[B.bergOpts,B.bergCut]);
ok('Ankunft nach 3 Tagen: Heer in der Poebene (Taurini/Insubrien/Ligurien), Männer unter 100 %, Nero marschiert los',B.arr&&['taurini','insubrien','ligurien'].includes(B.dest)&&B.men<0.95&&B.go>0,[B.dest,B.pct,Math.round(B.men*100)]);
ok('Nero-Fenster: Eilmarsch 2 Provinzen je Runde, Ankunftsbericht, Kino-Stelle ohne Bilder wird übersprungen (cine null)',/2 Provinzen je Runde/.test(B.neroTxt)&&/Mann sind angekommen/.test(B.neroTxt)&&B.cine==null,[B.cine]);

// ---- (c) Nero-Drehbuch: Eilmarsch (höchstens 2 Provinzen je Runde), Angriff auf Hasdrubal ----
const C=await p.evaluate(()=>{const o={};prep();const f=S.player,F=hnFl();const r=spawnH();const H=r.H,N=r.N;evAll();heroAt('kampanien',true);
 H.p=PI.taurini;H.pos=null;S.prov[PI.taurini].owner=f;const D=hnDist(H.p);o.d0=D[N.p];const tr=[D[N.p]];
 for(let i=0;i<8;i++){const ps=N.p;nr(1);tr.push(D[N.p]);if(!N.units.length||!H.units.length||F.hn_hasd!=='lauf')break;o.step=Math.max(o.step||0,D[ps]-D[N.p]);}
 o.tr=tr;o.go=F.hn_neroGo;o.lg=logs(0).filter(x=>/Nero/.test(x)).slice(0,6);o.state=F.hn_hasd;o.ev=evAll().map(x=>x.E.id);return o;});
console.log(JSON.stringify(C).slice(0,500));
ok('Nero-Drehbuch: ab Hasdrubals Ankunft in Italien rückt Nero je Runde um höchstens 2 Provinzen vor und stellt ihn',C.go>0&&C.step<=2&&C.tr[C.tr.length-1]<C.tr[0]&&C.lg.some(x=>/Nero (eilt|stellt)/.test(x)),[C.tr,C.step]);
ok('Meldung „Nero marschiert“ als Ereignis in der Warteschlange',C.ev.includes('hn_nero'),C.ev);

// ---- (d) Vereinigung: beide Heere in einer Provinz → Ziel erfüllt, Gunst +10, Ereignis ----
const Dd=await p.evaluate(()=>{const o={};prep();const f=S.player,F=hnFl();const r=spawnH();const H=r.H,N=r.N;evAll();
 H.p=PI.taurini;S.prov[PI.taurini].owner=f;H.pos=null;heroAt('taurini',true);const g0=F.hn_gunst;F.hn_neroGo=S.turn;nr(1);
 o.state=F.hn_hasd;o.how=F.hn_hasdHow;o.gunst=F.hn_gunst-g0;o.nero0=!N.hnNero;o.prog=SC_COND.hasdrubal(f,{});o.ev=evAll().map(x=>x.E.id);return o;});
ok('Vereinigung in einer Provinz: hn_hasd=won (vereint), Gunst +10, Nero-Skript endet, Ziel [2,2], Ereignis „Brüder vereint“',Dd.state==='won'&&Dd.how==='vereint'&&Dd.gunst===10&&Dd.nero0&&Dd.prog[0]===2&&Dd.ev.includes('hn_hasd_vereint'),Dd);

// ---- (e) Neros Heer geschlagen (Hannibal greift Nero an) → Ziel erfüllt, Gunst +5 ----
const E=await p.evaluate(()=>{const o={};prep();const f=S.player,F=hnFl();const r=spawnH();const H=r.H,N=r.N;evAll();
 H.p=PI.taurini;S.prov[PI.taurini].owner=f;H.pos=null;F.hn_neroGo=S.turn;
 const h=heroAt('kampanien',true);const tgt=N.p===PI.kampanien?[...ADJ[N.p]].find(n=>isAct(n)&&!isSeaLink(N.p,n)):PI.kampanien;
 // Nero in eine römische Nachbarprovinz von Hannibal, Hannibal riesig, Nero klein
 N.p=[...ADJ[h.p]].find(n=>S.prov[n].owner==='rom'&&isAct(n)&&!isSeaLink(h.p,n));N.units=N.units.slice(0,1);for(let i=0;i<8;i++)h.units.push(newUnit(f,'sword','scutar'));for(const u of h.units)u.men=unitStat(f,u.r,u.v).men;
 const g0=F.hn_gunst;h.mp=85;const res=resolveAttack(h,N.p);o.win=res.win;o.beaten=!!N.hnBeaten;o.b=F.hn_neroB;nr(1);
 o.state=F.hn_hasd;o.how=F.hn_hasdHow;o.gunst=F.hn_gunst-g0;o.prog=SC_COND.hasdrubal(f,{});o.ev=evAll().map(x=>x.E.id);return o;});
console.log(JSON.stringify(E).slice(0,300));
ok('Neros Heer geschlagen (Angriff Hannibals): hn_hasd=won (nero), Gunst +5, Ziel [2,2], Ereignis „Nero geschlagen“',E.win&&E.b&&E.state==='won'&&E.how==='nero'&&E.gunst===5&&E.prog[0]===2&&E.ev.includes('hn_hasd_nero'),E);

// ---- (f) Hasdrubals Kopf: Heer vernichtet → nur Text (kein Bild), Moral − (Angriff −10 %), Gunst −20 ----
const Fk=await p.evaluate(()=>{const o={};prep();const f=S.player,F=hnFl();const r=spawnH();const H=r.H,N=r.N;evAll();heroAt('kampanien',true);
 const rp=['etrurien','umbrien','arretium','sabina'].map(id=>PI[id]).find(i=>S.prov[i].owner==='rom');H.p=rp;H.pos=null;H.units=H.units.slice(0,1);H.units[0].men=25;F.hn_neroGo=S.turn;
 N.p=[...ADJ[rp]].find(n=>isAct(n)&&!isSeaLink(rp,n));for(let i=0;i<6;i++)N.units.push(newUnit('rom','sword','manipel'));for(const u of N.units)u.men=unitStat('rom',u.r,u.v).men;
 const g0=F.hn_gunst;const atk0=(S.fac[f].mods||[]).length;
 for(let i=0;i<4&&F.hn_hasd==='lauf';i++)nr(1);
 o.state=F.hn_hasd;o.gunst=F.hn_gunst-g0;o.lg=logs(0).filter(x=>/Kopf/.test(x)).length;o.mod=S.mods.some(m=>m.f===f&&m.label==='Hasdrubals Kopf'&&m.k==='atk'&&m.v===-0.1&&m.t===8);
 o.prog=SC_COND.hasdrubal(f,{});const ev=evAll();o.ids=ev.map(x=>x.E.id);const k=ev.find(x=>x.E.id==='hn_hasd_kopf');o.img=k&&k.E.img;o.txt=k&&k.E.text();
 showEvent(k.E,k.ctx,()=>{});o.hero=!!document.querySelector('#dialog .evhero');o.dlg=mTxt().slice(0,120);closeAll();return o;});
console.log(JSON.stringify(Fk).slice(0,400));
ok('Hasdrubal vernichtet: hn_hasd=lost, Gunst −20, Angriffsabzug „Hasdrubals Kopf“, Ziel dennoch erfüllt [2,2] (die Geschichte geht weiter)',Fk.state==='lost'&&Fk.gunst===-20&&Fk.mod&&Fk.prog[0]===2,Fk);
ok('Ereignis „Hasdrubals Kopf“ nur als Text: kein img, kein Bild im Fenster',Fk.ids.includes('hn_hasd_kopf')&&Fk.img===undefined&&!Fk.hero&&/Kopf/.test(Fk.txt),[Fk.img,Fk.hero]);

// ---- (g) Schritt 10: Wahlfenster, Seeweg offen, Rom angreifen / heimkehren ----
const G=await p.evaluate(()=>{const o={};prep();const f=S.player,F=hnFl();const h=heroAt('kampanien',true);
 gotoStep(5);o.lockAlt=hnSeaLock(h,PI.kampanien)!==null;gotoStep(9);o.lockNeu=hnSeaLock(h,PI.kampanien);
 stHook(f,9);const sc=S.armies.find(x=>x.scip);o.scName=sc&&sc.gen.n;o.scProv=sc&&PROV_DEF[sc.p].id;
 const ev=evAll();o.ids=ev.map(x=>x.E.id);const w=ev.find(x=>x.E.id==='hn_wahl');o.opts=w.E.opts.map(x=>x.label);o.d0=w.E.opts[0].desc();o.d1=w.E.opts[1].desc();o.q=F.hn_wahlQ;
 // Rom angreifen
 const g0=F.hn_gunst;const m=w.E.opts[0].fx();const L=S.prov[PI.latium];o.rom={msg:m,walls:L.b.walls,gar:L.gar,bue:S.armies.filter(x=>x.hnBuerg).length,wahl:F.hn_wahl,gunst:F.hn_gunst-g0,lock:hnSeaLock({f:S.player,name:'x'},PI.karthago)};
 // Wahl nur einmal
 o.again=hnWahlDo('heim');
 return o;});
console.log(JSON.stringify(G).slice(0,600));
ok('Seeweg nach Italien: in Akt III gesperrt, in Akt IV (Schritt 9/10) aufgehoben',G.lockAlt&&G.lockNeu===null,[G.lockAlt,G.lockNeu]);
ok('Hook 9: „Scipio der Jüngere“ landet in Byzacena, Wahlfenster mit zwei Wegen und Wirkung/Kosten',G.scName==='Scipio der Jüngere'&&G.scProv==='byzacena'&&G.ids.includes('hn_wahl')&&G.opts.join()==='Rom angreifen,Heimkehren'&&/Gunst −10/.test(G.d0)&&/Gunst \+15/.test(G.d1)&&/40 %/.test(G.d1)&&/Italien geht verloren/.test(G.d1),[G.opts]);
ok('Wahl „Rom angreifen“: Latium Mauern ≥ 4, Garnison ≥ 46, Bürgerheer, Gunst −10, Heimkehr (Landung in Africa) gesperrt, zweite Wahl unmöglich',G.rom.walls>=4&&G.rom.gar>=46&&G.rom.bue===1&&G.rom.wahl==='rom'&&G.rom.gunst===-10&&/Heimkehr ist abgeschnitten/.test(G.rom.lock||'')&&G.again===null,G.rom);

const H2=await p.evaluate(()=>{const o={};prep();const f=S.player,F=hnFl();const h=heroAt('kampanien',true);S.prov[PI.apulien].owner=f;S.prov[PI.lukanien].owner=f;const nIt0=provsOf(f).filter(i=>HN_ITALY.has(hnReg(i))).length;
 const hs=spawnH();evAll();gotoStep(9);stHook(f,9);const w=evAll().find(x=>x.E.id==='hn_wahl');const g0=F.hn_gunst;const m=w.E.opts[1].fx();
 o.msg=m;o.wahl=F.hn_wahl;o.gunst=F.hn_gunst-g0;o.heim=!!h.hnPass&&!!h.hnPass.heim;o.arr=h.hnPass&&h.hnPass.arr-S.turn;o.nIt0=nIt0;o.nIt=provsOf(f).filter(i=>HN_ITALY.has(hnReg(i))).length;o.owner=S.prov[PI.apulien].owner;
 o.txt=hnPassTxt(h);o.html=hnPassHtml(h);
 nr(1);o.after1=!!h.hnPass;o.at1=PROV_DEF[h.p].id;nr(1);o.after2=!h.hnPass;o.at2=PROV_DEF[h.p].id;o.ev=evAll().map(x=>x.E.id);
 o.noLockHome=hnSeaLock({f:S.player,name:'x'},PI.karthago);return o;});
console.log(JSON.stringify(H2).slice(0,500));
ok('Wahl „Heimkehren“: Heer 2 Runden unterwegs, dann in Zeugitana (Karthago), Italien geht verloren, Gunst +15, Zama-Fenster',H2.heim&&H2.arr===2&&H2.after1===true&&H2.at1!=='karthago'&&H2.after2&&H2.at2==='karthago'&&H2.nIt0>=2&&H2.nIt===0&&H2.owner==='rom'&&H2.gunst===15&&H2.ev.includes('hn_zama'),H2);
ok('Heimfahrt-Anzeige im Heer-Blatt, keine Sperre der Heimreise nach der Wahl „Heimkehren“',/Heimfahrt/.test(H2.html)&&/Heimfahrt/.test(H2.txt)&&H2.noLockHome===null,[H2.txt]);

// ---- (h) Zama: Panik 40 %, Gegenmittel, Masinissa, Schrecken aus ----
const Z=await p.evaluate(()=>{const o={};prep();const f=S.player,F=hnFl();const h=heroAt('kampanien',true);const hs=spawnH();evAll();gotoStep(9);stHook(f,9);evAll();hnWahlDo('heim');nr(2);evAll();
 o.hp=PROV_DEF[h.p].id;const sc=S.armies.find(x=>x.scip);sc.p=PI.byzacena;sc.pos=null;o.eleN=hnEleN(h);
 // Statistik der Panik: 3 Elefanten-Einheiten je Versuch, 4000 Versuche
 let hits=0,tot=0;for(let i=0;i<4000;i++){const x={units:[{v:'elef',men:30},{v:'elef',men:30},{v:'elef',men:30},{v:'libyer',men:60}]};hits+=hnZamaPanic([x]);tot+=3;}o.freq=hits/tot;
 // Wirkung einer Panik: Elefanten-Einheit −40 %, übrige −4 %
 const HZ=HN_ZAMA.pan;HN_ZAMA.pan=1;const y={units:[{v:'elef',men:100},{v:'libyer',men:100}]};const n1=hnZamaPanic([y]);o.eff=[n1,y.units[0].men,y.units[1].men];HN_ZAMA.pan=HZ;
 // Kontext Hannibal greift Scipio an
 h.mp=85;const ctx=startAttackCtx(h,PI.byzacena);o.side=hnZamaSide(h,PI.byzacena);
 const E1=eleFx(h,PI.byzacena,h.units,sc.units);o.scare=E1.def;F.hn_wahl=null;const E0=eleFx(h,PI.byzacena,h.units,sc.units);o.scare0=E0.def;F.hn_wahl='heim';
 let zm=null;for(let i=0;i<50;i++){zm=hnZama(h,PI.byzacena,startAttackCtx(h,PI.byzacena));if(zm.txt.indexOf('brechen aus')>=0)break;}
 o.defMas=zm.def;o.txtMas=/Masinissa/.test(zm.txt);o.txtPan=/Gassen/.test(zm.txt);
 // Gegenmittel
 h.plan='zurueck';let zp=0;for(let i=0;i<300;i++){const q=hnZama(h,PI.byzacena,startAttackCtx(h,PI.byzacena));if(/brechen aus/.test(q.txt))zp++;}o.zurPanik=zp;o.zurTxt=hnZama(h,PI.byzacena,startAttackCtx(h,PI.byzacena)).txt;o.zurMul=planMul(h,PI.byzacena);
 o.planHtml=/Elefanten zurückhalten/.test(planHtml(h));o.note=/Zama: Rom öffnet Gassen/.test(planHtml(h));
 // ohne Elefanten: Plan nicht angeboten
 const h2=h.units.filter(u=>!hnIsEle(u));const save=h.units;h.units=h2;h.plan='frontal';o.planOhne=/Elefanten zurückhalten/.test(planHtml(h));h.units=save;h.plan='frontal';
 // Scipio greift Karthago an (Hannibal verteidigt)
 S.prov[PI.karthago].owner=f;h.p=PI.karthago;sc.p=PI.byzacena;o.sideAtt=hnZamaSide(sc,PI.karthago);
 // andere Schlacht (nicht Scipio): keine Zama-Regel
 o.sideNone=hnZamaSide(h,PI.kampanien);
 return o;});
console.log(JSON.stringify(Z).slice(0,900));
ok('Heer nach der Heimkehr in Zeugitana, mit Elefanten-Einheiten',Z.hp==='karthago'&&Z.eleN>=2,[Z.hp,Z.eleN]);
ok('Zama-Panik: 40 % je Elefanten-Einheit (4000 Versuche × 3 Einheiten, Häufigkeit 0,37 bis 0,43)',Z.freq>0.37&&Z.freq<0.43,Z.freq);
ok('Panik-Wirkung: Elefanten-Einheit −40 % Männer, übrige Einheiten −4 %',Z.eff[0]===1&&Z.eff[1]===60&&Z.eff[2]===96,Z.eff);
ok('Zama-Seite erkannt (Hannibal greift Scipio an: Rom verteidigt; Scipio greift Karthago an: Rom greift an), sonst keine Regel',Z.side&&Z.side.rom==='def'&&Z.sideAtt&&Z.sideAtt.rom==='att'&&Z.sideNone===null,[Z.side,Z.sideAtt,Z.sideNone]);
ok('Römer öffnen Gassen: Schrecken der Elefanten wirkt nicht (Faktor 1) – außerhalb von Zama < 1',Z.scare===1&&Z.scare0<1,[Z.scare,Z.scare0]);
ok('Masinissa: römische Reiterei +12 % (Verteidigerfaktor 1,12 genau), Meldung nennt Masinissa und Gassen',Math.abs(Z.defMas-1.12)<1e-9&&Z.txtMas&&Z.txtPan,[Z.defMas]);
ok('Gegenmittel „Elefanten zurückhalten“: nie Panik (300 Versuche), Plan-Stärke 0,95, Meldung; nur mit Elefanten angeboten',Z.zurPanik===0&&Math.abs(Z.zurMul-0.95)<1e-9&&/hinter der Linie/.test(Z.zurTxt)&&Z.planHtml&&Z.note&&!Z.planOhne,[Z.zurPanik,Z.zurMul,Z.planHtml,Z.planOhne]);

// ---- (i) Zama: Schlacht, Ergebnis → Ende A (gewonnen) oder Ende B (verloren) ----
const Zs=await p.evaluate(()=>{const o={};
 const run=(win)=>{prep();const f=S.player,F=hnFl();const h=heroAt('kampanien',true);const hs=spawnH();evAll();gotoStep(9);stHook(f,9);evAll();hnWahlDo('heim');nr(2);evAll();
  const sc=S.armies.find(x=>x.scip);sc.p=PI.byzacena;sc.pos=null;
  if(win){for(let i=0;i<10;i++)h.units.push(newUnit(f,'sword','scutar'));for(const u of h.units)u.men=unitStat(f,u.r,u.v).men;sc.units=sc.units.slice(0,2);}
  else{h.units=h.units.slice(0,1);h.units[0].men=40;while(sc.units.length<9)sc.units.push(newUnit('rom','sword','manipel'));for(const u of sc.units)u.men=unitStat('rom',u.r,u.v).men;}
  h.mp=85;const res=resolveAttack(h,PI.byzacena);const Z=S.scen;const q={zama:F.hn_zama,res:Z.res,over:!!Z.over,eleTxt:res.eleTxt||'',scip:S.armies.some(x=>x.scip&&x.units.length),hnEnd:Z.hnEnd||null,why:Z.why||''};
  if(win){q.prog=SC_COND.zama(f,{});stState(f).q=[];const ev=hnEndInfo&&null;scenWin();q.hnEnd=Z.hnEnd;q.info=hnEndInfo(true);const se=scenEvents().map(x=>x.E);q.se=se.map(x=>x.id);const e=se.find(x=>x.id==='scen_end');q.t=e&&e.title();q.tx=e&&e.text();q.img=e&&e.img;q.cine=e&&e.cine;}
  else{q.info=hnEndInfo(false);const se=scenEvents().map(x=>x.E);const e=se.find(x=>x.id==='scen_end');q.t=e&&e.title();q.tx=e&&e.text();q.img=e&&e.img;}
  return q;};
 o.w=run(true);o.l=run(false);return o;});
console.log(JSON.stringify(Zs.w).slice(0,700));console.log(JSON.stringify(Zs.l).slice(0,700));
ok('Zama gewonnen: Scipios Heer vernichtet, Ziel „zama“ erfüllt, Panik/Masinissa-Meldung im Kampfbericht',Zs.w.zama==='won'&&!Zs.w.scip&&Zs.w.prog[0]===1&&/Masinissa/.test(Zs.w.eleTxt),[Zs.w.zama,Zs.w.prog,Zs.w.eleTxt.slice(0,80)]);
ok('Ende A (Zama): Titel „Ende A · Karthago triumphiert“, Text nennt Zama und die wirkliche Geschichte, Kino ohne Bilder übersprungen',Zs.w.hnEnd&&Zs.w.hnEnd.e==='A'&&Zs.w.hnEnd.c==='zama'&&/Ende A/.test(Zs.w.t)&&/Zama ist gewonnen/.test(Zs.w.tx)&&/Die wirkliche Geschichte/.test(Zs.w.tx)&&/Wertung/.test(Zs.w.tx)&&Zs.w.cine==null,[Zs.w.t]);
ok('Zama verloren: sofort Niederlage (Ende B · Zama), Text nennt Gassen/Masinissa und den alten Verlusttext',Zs.l.zama==='lost'&&Zs.l.res==='lose'&&Zs.l.hnEnd&&Zs.l.hnEnd.e==='B'&&Zs.l.hnEnd.c==='zama'&&/Ende B/.test(Zs.l.t)&&/Zama ist verloren/.test(Zs.l.tx)&&/Frieden, der Karthago/.test(Zs.l.tx),[Zs.l.t,Zs.l.hnEnd]);

// ---- (j) Panik im echten Kampf: Ausbruch (pan=1) vs. Gegenmittel (pan=1 + Plan) ----
const Pn=await p.evaluate(()=>{const o={};const mk=(plan)=>{prep();const f=S.player,F=hnFl();const h=heroAt('kampanien',true);spawnH();evAll();gotoStep(9);stHook(f,9);evAll();hnWahlDo('heim');nr(2);evAll();const sc=S.armies.find(x=>x.scip);sc.p=PI.byzacena;sc.pos=null;for(const u of sc.units)u.men=unitStat('rom',u.r,u.v).men;h.plan=plan;h.mp=85;h.xz=hnEleN(h);return{h,sc,F};};
 HN_ZAMA.pan=1;let a=mk('frontal');let res=resolveAttack(a.h,PI.byzacena);o.panik=/brechen aus/.test(res.eleTxt||'');o.panikTxt=res.eleTxt;
 a=mk('zurueck');res=resolveAttack(a.h,PI.byzacena);o.zur=/brechen aus/.test(res.eleTxt||'');o.zurTxt=res.eleTxt;
 HN_ZAMA.pan=0.4;return o;});
ok('Im berechneten Kampf: mit pan=1 Ausbruch gemeldet, mit Plan „Elefanten zurückhalten“ nicht',Pn.panik&&!Pn.zur&&/hinter der Linie/.test(Pn.zurTxt),[Pn.panikTxt&&Pn.panikTxt.slice(0,60),Pn.zurTxt&&Pn.zurTxt.slice(0,60)]);

// ---- (k) Ende A durch Roms Fall; Ende B durch Abberufung, Zeit, Heldentod ----
const En=await p.evaluate(()=>{const o={};
 {prep();const f=S.player,F=hnFl();heroAt('kampanien',true);spawnH();evAll();gotoStep(9);S.prov[PI.latium].owner=f;stHook(f,9);o.noWahl=!evAll().some(x=>x.E.id==='hn_wahl');o.prog=SC_COND.zama(f,{});scenWin();o.a=hnEndInfo(true);o.aE=S.scen.hnEnd;}
 {prep();const f=S.player,F=hnFl();heroAt('kampanien',true);gotoStep(7);F.hn_ratEnd=0;F.hn_gunst=10;F.hn_gw=stW(f);F.hn_ga=F.abw||0;F.hn_gn=F.hn_nied||0;F.hn_pn=provsOf(f).length;F.hn_gLast=S.turn;F.hn_low=0;
  nr(1);o.low1=F.hn_low;o.ovr1=!!S.scen.over;nr(1);o.rat={over:!!S.scen.over,res:S.scen.res,e:S.scen.hnEnd,why:S.scen.why};o.ratI=hnEndInfo(false);const se=scenEvents().map(x=>x.E).find(x=>x.id==='scen_end');o.ratT=se&&se.text();o.ratTi=se&&se.title();}
 {prep();const f=S.player;heroAt('kampanien',true);gotoStep(8);const D=SCEN.hannibal;S.turn=S.scen.t0+D.turns+3;scenRound();o.zeit={res:S.scen.res,e:S.scen.hnEnd,why:S.scen.why};o.zeitI=hnEndInfo(false);}
 {prep();const f=S.player;const h=heroAt('kampanien',true);gotoStep(9);hnFl().hn_wahl='heim';S.scen.heroFell=true;h.units=[];removeEmpty();scenRound();o.held={res:S.scen.res,e:S.scen.hnEnd,why:S.scen.why};o.heldI=hnEndInfo(false);}
 {prep();const f=S.player;const h=heroAt('kampanien',true);gotoStep(3);S.scen.heroFell=true;h.units=[];removeEmpty();scenRound();o.frueh={res:S.scen.res,e:S.scen.hnEnd||null};o.fruehI=hnEndInfo(false);}
 return o;});
console.log(JSON.stringify(En).slice(0,900));
ok('Latium schon in Karthagos Hand bei Hook 9: kein Wahlfenster, Ziel „zama“ erfüllt, Ende A (Rom fällt)',En.noWahl&&En.prog[0]===1&&En.aE&&En.aE.e==='A'&&En.aE.c==='rom'&&/Rom fällt/.test(En.a.text)&&/Ende A/.test(En.a.title),[En.aE]);
ok('Abberufung durch den Rat führt in Ende B (Grund „rat“): Titel, Text, alter Verlusttext',En.low1===1&&!En.ovr1&&En.rat.over&&En.rat.res==='lose'&&En.rat.e&&En.rat.e.e==='B'&&En.rat.e.c==='rat'&&/Ende B/.test(En.ratTi)&&/abberufen/.test(En.ratT)&&/Frieden, der Karthago/.test(En.ratT),[En.rat,En.ratTi]);
ok('Zeit abgelaufen → Ende B (Grund „zeit“); Hannibal fällt in Akt IV → Ende B (Zama, wegen Heimkehr); Heldentod früh (Schritt 4) → alter Verlusttext ohne Ende B',En.zeit.e&&En.zeit.e.c==='zeit'&&/Ende B/.test(En.zeitI.title)&&En.held.e&&En.held.e.e==='B'&&En.held.e.c==='zama'&&En.frueh.res==='lose'&&En.frueh.e===null&&En.fruehI===null,[En.zeit.e,En.held.e,En.frueh]);

// ---- (l) Kompatibilität, Nero/Fabius-Skript, Kino-Platzhalter ----
const K=await p.evaluate(()=>{const o={};prep();const f=S.player,F=hnFl();const h=heroAt('kampanien',true);
 // alter Spielstand (ohne hn_hasd): Hasdrubal in Italien genügt wie bisher
 const hs=scenArmy(f,PI.taurini,[['spear','libyer']],'Hasdrubal Barkas');hs.hasd=true;gotoStep(8);o.alt=SC_COND.hasdrubal(f,{});delete hs.hasd;hs.units=[];removeEmpty();o.alt0=SC_COND.hasdrubal(f,{});
 // Fabius-Skript fasst Nero und Bürgerheer nicht an
 prep();const F2=hnFl();F2.hn_fabOff=0;F2.hn_fab=S.turn;const hh=heroAt('kampanien',true);const r=spawnH();evAll();const N=r.N;const p0=N.p;
 const far=hnDist(hh.p);N.p=[...Array(PROV_DEF.length).keys()].filter(i=>far[i]===3&&S.prov[i].owner==='rom')[0];const p1=N.p;
 hnFabRound();o.nero=N.p===p1;
 o.cine=[hnCine('nero','x'),hnCine('ende_a','x'),hnCine('ende_b','x')];o.kinoLeer=Object.values(HN_KINO).every(k=>Array.isArray(k.ikeys)&&k.ikeys.length===0);
 const IM={};for(const k of['nero','hasdrubal','wahl','zama','heim','endA','endB']){const x=hnImg(k);IM[k]=x+':'+(heroImg(x,0,false)?'ja':'nein');}o.IM=IM;
 o.rom=[...HN_IMG.hasdrubal,...HN_IMG.nero,...HN_IMG.wahl,...HN_IMG.zama,...HN_IMG.heim,...HN_IMG.endA,...HN_IMG.endB].filter(x=>/^(siege|ev_conq|rom_|hn_u_rom)/.test(x));
 return o;});
console.log(JSON.stringify(K).slice(0,400));
ok('Alter Spielstand ohne hn_hasd: Ziel „Nachschub“ gilt wie bisher (Hasdrubal in Italien = erfüllt)',K.alt[0]===2&&K.alt0[0]===0,[K.alt,K.alt0]);
ok('Fabius-Skript lässt Nero (hnNero) in Ruhe',K.nero);
ok('Kino-Stellen vorbereitet (Nero, Ende A, Ende B) – leere Bildlisten werden übersprungen (null)',K.cine.every(x=>x===null)&&K.kinoLeer,K.cine);
ok('HN_IMG (H4): jeder Schlüssel fällt auf ein vorhandenes Bild zurück, ohne römische Motive (TODO Job 40: hn_k4_*, hn_k5*_*, hn_sf_zama)',Object.values(K.IM).every(v=>/:ja$/.test(v))&&K.rom.length===0,K.IM);

// ---- Screenshot: Wahlfenster ----
await p.evaluate(()=>{prep();const f=S.player;heroAt('kampanien',true);spawnH();evAll();gotoStep(9);stHook(f,9);closeAll();try{const st=document.getElementById('start');if(st)st.hidden=true;}catch(e){}UI.sel=null;UI.army=null;const x=popEv().find(y=>y.E.id==='hn_wahl');if(x)showEvent(x.E,x.ctx,()=>{});});
await p.waitForTimeout(800);await p.screenshot({path:SHOT+'/hn4_wahl.jpg',type:'jpeg',quality:70,timeout:120000}).catch(()=>{});
ok('Keine Seitenfehler',!errs.length,errs.slice(0,3));
const nP=R.filter(x=>x).length;console.log(`${nP} PASS / ${R.length-nP} FAIL`);console.log(R.every(x=>x)?'ALLE PASS':'FEHLER '+R.filter(x=>!x).length);await b.close();})();
