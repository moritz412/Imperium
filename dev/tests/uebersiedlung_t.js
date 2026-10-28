// node uebersiedlung_t.js <html> [port] – v214: Übersiedlung „Die Heimat verlegen“ (Bedingung, behalten/Lehen/aufgeben, Kernland neu, Taufe-Ordnung, KI, Fenster).
// Bild: shot/w5_uebersiedlung.png
const {chromium}=require('playwright');const fs=require('fs');
const FILE=process.argv[2],PORT=process.argv[3]||'8772',SH=__dirname+'/shot/';
(async()=>{const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:process.env.PW_GPU?[]:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const R=[];const ok=(n,c,i='')=>{R.push(!!c);console.log((c?'PASS ':'FAIL ')+n+(i?'  '+i:''));};
const ctx=await b.newContext({viewport:{width:1024,height:768},hasTouch:true,isMobile:true});const p=await ctx.newPage();const errs=[];
p.on('pageerror',e=>errs.push('PAGE '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|WebGL|GPU stall/.test(m.text()))errs.push('CON '+m.text().slice(0,200));});
await p.addInitScript(()=>{try{localStorage.setItem('imperium.gfx',JSON.stringify({q:'leicht'}));}catch(e){}});
await p.route(/cdnjs/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));
await p.route(/fonts\.g/,r=>r.abort());await p.route(/\.html$/,r=>r.fulfill({body:fs.readFileSync(FILE),contentType:'text/html; charset=utf-8'}));
await p.goto(`http://localhost:${PORT}/imperium.html`,{timeout:300000});await p.waitForFunction(()=>document.getElementById('loading').hidden,null,{timeout:300000});
await p.waitForFunction(()=>!document.querySelector('#loading[data-gate]'),null,{timeout:120000}).catch(()=>{});
// Grundlage: Wikinger, Hof in Northumbria (Briganten, Heimat Stufe 3), alte Heimat = Region der ersten Hauptstadt mit zwei weiteren Provinzen
const SETUP=`startScenario('wikinger');loadGame(S);try{closeModal();}catch(e){}window.picMsg=()=>{};
  var me=S.player,F=S.fac[me];F.gold=5000;S.turn=S.scen.t0+40;
  var cap0=capitalOf(me),reg0=PROV_DEF[cap0].reg;lnRound();
  var old=[cap0,...provsOf(me).filter(q=>q!==cap0&&PROV_DEF[q].reg===reg0)];
  var extra=S.prov.map((P,i)=>i).filter(i=>PROV_DEF[i].reg===reg0&&S.prov[i].owner!==me&&!old.includes(i)).slice(0,2);for(const q of extra){S.prov[q].owner=me;old.push(q);}
  var pi=PI.briganten;S.prov[pi].owner=me;S.prov[pi].cul='britisch';S.prov[pi].ln=3;S.prov[pi].lnF=me;S.prov[pi].lnT=S.turn-30;
  S.armies=S.armies.filter(a=>a.f!==me||a.boat);createArmy(me,old[0],['sword','spear','missile'],1);createArmy(me,pi,['sword','spear'],1);F.capP=pi;`;
const EV=code=>p.evaluate("(()=>{"+SETUP+code+"})()");
const fresh=()=>EV(`return{me,reg0,regN:PROV_DEF[pi].reg,old:old.length,cap:capitalOf(me)===pi,home0:F.home0,slot:pk2Slot(),rk:raidKind(me),regs:REG[reg0]&&REG[reg0].name};`);
const s=await fresh();
ok('Aufbau: Raubvolk, Hof in Heimat-Provinz, alte Heimat mit Provinzen, freier Jarl-Platz',s.rk==='see'&&s.cap&&s.old>=2&&s.home0===s.reg0&&s.reg0!==s.regN&&!!s.slot,JSON.stringify(s));

// 1. Bedingungen
const a=await p.evaluate(()=>{const me=S.player,F=S.fac[me],pi=PI.briganten,out={};
  out.ok=ubCan(me);
  S.prov[pi].ln=2;out.ln2=ubCan(me).why;S.prov[pi].ln=3;
  F.capP=PI.viken;out.nocap=ubCan(me).why;out.nocap2=ubCan(me,pi).why;F.capP=pi;
  const keep=S.prov.map(P=>P.owner);const oldPs=ubCan(me).ps.slice();for(const q of oldPs)S.prov[q].owner='frei';out.noold=ubCan(me).why;oldPs.forEach((q,i)=>S.prov[q].owner=keep[q]);
  const h=F.home0;F.home0=PROV_DEF[pi].reg;out.same=ubCan(me).why;F.home0=h;
  out.usa=ubCan('usa').why;
  F.ubT=S.turn-10;out.gap=ubCan(me).why;F.ubT=null;
  out.back=ubCan(me).ok;
  return out;});
ok('Angebot möglich: Hof in Heimat-Provinz + Provinzen in der alten Heimat',a.ok.ok&&a.ok.ps.length>=2&&a.ok.give>0&&a.ok.tr>0&&a.ok.slot,JSON.stringify({ps:a.ok.ps.length,give:a.ok.give,tr:a.ok.tr,tax:a.ok.tax}));
ok('Nicht ohne Heimat-Stufe 3',/Heimat/.test(a.ln2),a.ln2);
ok('Nicht ohne Hauptstadt in der Heimat-Provinz',/Hof muss hier stehen/.test(a.nocap2)&&/Heimat|Hauptstadt|Hof/.test(a.nocap),a.nocap+' | '+a.nocap2);
ok('Nicht ohne Provinzen in der alten Heimat',/keine Provinzen/.test(a.noold),a.noold);
ok('Nicht, wenn die alte Heimat dieselbe Region ist',/derselben Region/.test(a.same),a.same);
ok('Kein Nicht-Raubvolk',/Raubvölker/.test(a.usa),a.usa);
ok('Abstand: erst nach 30 Runden wieder',/Erst in 20 Runden/.test(a.gap)&&a.back,a.gap);

// 2. behalten
const c1=await EV(`
  const c=ubCan(me),before=old.map(q=>S.prov[q].unrest||0),gold0=F.gold,nA=S.armies.filter(x=>x.f===me).length;
  const r=ubDo(me,'behalten');const oldReg=c.oldReg;
  const t=ubCan(me);
  return{r,kern:F.kern,newReg:PROV_DEF[pi].reg,oldReg,own:c.ps.every(q=>S.prov[q].owner===me),un:c.ps.map((q,i)=>(S.prov[q].unrest||0)-before[old.indexOf(q)]),gold:F.gold-gold0,nA:S.armies.filter(x=>x.f===me).length-nA,ubT:F.ubT,again:t.why,cap:capitalOf(me)===pi,log:S.log[S.log.length-1].t.slice(0,160)};`);
ok('behalten: Kernland ist die neue Region, Provinzen bleiben',c1.r&&c1.kern===c1.newReg&&c1.kern!==c1.oldReg&&c1.own,JSON.stringify({k:c1.kern,n:c1.newReg,o:c1.oldReg}));
ok('behalten: Unruhe +1 in der alten Heimat (einmalig), kein Gold, Heere bleiben',c1.un.every(u=>u===1)&&c1.gold===0&&c1.nA===0,JSON.stringify(c1.un)+' '+c1.log);
ok('behalten: sofort kein zweites Mal',/Erst in 30 Runden|derselben Region/.test(c1.again),c1.again);

// 3. Lehen
const c2=await EV(`
  const c=ubCan(me),ps=c.ps.slice();const arm0=S.armies.filter(x=>x.f===me&&ps.includes(x.p)).length;
  const r=ubDo(me,'lehen');const sl=S.prov[ps[0]].owner;const d=sl&&sl!=='frei'?dip(me,sl):{};
  const tp=tributeParts(me);
  S.turn++;let warBefore=atWar(me,sl);try{lnRound();}catch(e){}
  return{r,sl,name:sl&&FACTIONS[sl]?FACTIONS[sl].name:null,all:ps.every(q=>S.prov[q].owner===sl),alive:alive(sl),st:d.st,vas:d.vas,war:warBefore,tr:tp.vas,vt:vassalTribute(sl),exp:c.tr,arm0,armLeft:S.armies.filter(x=>x.f===me&&ps.includes(x.p)).length,armHome:S.armies.filter(x=>x.f===me&&x.p===pi).length,jarlArmy:S.armies.filter(x=>x.f===sl).length,kern:F.kern,newReg:PROV_DEF[pi].reg,lord:lordOf(sl),hasRk:!!pk2Of(sl),isVas:vassalsOf(me).includes(sl)};`);
ok('Lehen: alle Provinzen der alten Heimat gehören einem neuen Jarltum',c2.r&&c2.sl&&c2.all&&c2.alive&&/^Jarltum /.test(c2.name),c2.name+' '+c2.sl);
ok('Lehen: Jarl ist verbündeter Vasall, kein Krieg, Lehnsherr = Spieler',c2.st==='ally'&&c2.vas===c2.sl&&!c2.war&&c2.lord&&c2.isVas,JSON.stringify({st:c2.st,vas:c2.vas,war:c2.war,lord:c2.lord}));
ok('Lehen: Tribut fließt (Vasallenabgabe, ein Viertel der Steuern)',c2.tr===c2.vt&&c2.tr>0&&Math.abs(c2.tr-c2.exp)<=Math.max(2,c2.exp*0.1),`Tribut ${c2.tr} / erwartet ${c2.exp}`);
ok('Lehen: eigene Heere ziehen in die neue Heimat, Jarl hat ein eigenes Heer',c2.armLeft===0&&c2.armHome>=c2.arm0&&c2.jarlArmy>=1,JSON.stringify({von:c2.arm0,bleibt:c2.armLeft,heim:c2.armHome,jarl:c2.jarlArmy}));
ok('Lehen: Kernland neu',c2.kern===c2.newReg,String(c2.kern));

// 4. aufgeben
const c3=await EV(`
  const c=ubCan(me),ps=c.ps.slice(),gold0=F.gold,u0=S.armies.filter(x=>x.f===me).reduce((n,x)=>n+x.units.length,0);
  const r=ubDo(me,'aufgeben');
  const u1=S.armies.filter(x=>x.f===me).reduce((n,x)=>n+x.units.length,0);
  return{r,free:ps.every(q=>S.prov[q].owner==='frei'),gold:F.gold-gold0,give:c.give,exp:Math.round(ps.reduce((a,q)=>a+0,0)),du:u1-u0,kern:F.kern,newReg:PROV_DEF[pi].reg,armLeft:S.armies.filter(x=>x.f===me&&ps.includes(x.p)).length,gar:ps.map(q=>S.prov[q].gar>0),tax:c.tax};`);
ok('aufgeben: Provinzen der alten Heimat sind frei, Heere sind abgezogen',c3.r&&c3.free&&c3.armLeft===0,JSON.stringify({free:c3.free,left:c3.armLeft}));
ok('aufgeben: Gold = Steuern ×5',c3.gold===c3.give&&c3.give===Math.round(c3.tax*5)||Math.abs(c3.gold-c3.tax*5)<=c3.tax*0.05+3,`Gold +${c3.gold}, Steuern ${c3.tax}, Angebot ${c3.give}`);
ok('aufgeben: Gefolge +2 Einheiten, Kernland neu',c3.du===2&&c3.kern===c3.newReg,`Einheiten +${c3.du}`);

// 5. Taufe-Ordnung trifft danach die neue Region
const t=await EV(`
  const pn=PI.dobunner;S.prov[pn].owner=me;S.prov[pn].cul='britisch';
  const oldP=old.find(q=>q!==cap0)||old[0],part=q=>{const x=orderParts(q).find(y=>/Gefolgsleute|Jarlen/.test(y[0]));return x?x[1]:0;};
  lnBapt(me,'tauf');
  const pre={neu:part(pi),neu2:part(pn),alt:part(oldP),alt0:part(cap0),core:[lnCore(me,pi),lnCore(me,pn),lnCore(me,oldP)]};
  ubDo(me,'behalten');
  const post={neu:part(pi),neu2:part(pn),alt:part(oldP),alt0:part(cap0),core:[lnCore(me,pi),lnCore(me,pn),lnCore(me,oldP)],same:PROV_DEF[pn].reg===PROV_DEF[pi].reg};
  return{pre,post};`);
ok('Vor der Übersiedlung: Taufe-Unmut trifft die alte Heimat (Hauptstadt-Logik wie bisher)',t.pre.alt0===-1||t.pre.alt===-1||t.pre.core[2],JSON.stringify(t.pre));
ok('Nach der Übersiedlung: Taufe-Unmut (−1) in der neuen Region, nicht mehr in der alten',t.post.neu===-1&&t.post.core[0]&&!t.post.core[2]&&t.post.alt===0&&t.post.alt0===0&&(!t.post.same||t.post.neu2===-1),JSON.stringify(t.post));

// 6. Angebot in der Runde (Spieler) und KI
const q=await EV(`
  S.lnQ=[];F.ubQ=null;lnRound();const n1=(S.lnQ||[]).filter(x=>x.k==='ueb').length;lnRound();const n2=(S.lnQ||[]).filter(x=>x.k==='ueb').length;
  return{n1,n2};`);
ok('Spieler: Angebot kommt einmal in die Warteschlange (nicht doppelt)',q.n1===1&&q.n2===1,JSON.stringify(q));
const k=await p.evaluate(()=>{
  startScenario('wikinger');loadGame(S);try{closeModal();}catch(e){}window.picMsg=()=>{};
  const me=S.player,f=PLAYABLE.find(x=>x!==me&&x!=='horde'&&alive(x)&&raidKind(x)&&provsOf(x).length>=2);if(!f)return{skip:'kein KI-Raubvolk'};
  const F=S.fac[f],ps=provsOf(f),home=ps[0];const nw=S.prov.findIndex((P,i)=>PROV_DEF[i].reg!==PROV_DEF[home].reg&&P.owner==='frei');if(nw<0)return{skip:'keine freie Provinz'};S.prov[nw].owner=f;F.capP=nw;S.prov[nw].ln=3;S.prov[nw].lnF=f;
  F.home0=PROV_DEF[home].reg;F.kern=null;F.ubT=null;S.turn=S.scen.t0+50;
  const ub0=ubDo;let n=0;window.ubDo=function(){n++;return true;};
  const N=3000;for(let i=0;i<N;i++){lnRound();}
  const rate=n/N;
  // Abstand: mit aiP=1 genau alle UB.again Runden
  UB.aiP=1;n=0;const hits=[];for(let i=0;i<70;i++){S.turn++;const b=n;lnRound();if(n>b){hits.push(i);F.ubT=S.turn;}}UB.aiP=0.02;
  window.ubDo=ub0;
  // echte KI-Übersiedlung: Wahl, Eintrag im Protokoll
  F.ubT=null;F.kern=null;F.home0=PROV_DEF[home].reg;S.prov[nw].ln=3;S.prov[nw].lnF=f;F.capP=nw;
  const picks={};for(let i=0;i<400;i++){const k2=ubAiPick(f);picks[k2]=(picks[k2]||0)+1;}
  const log0=S.log.length;const done=ubDo(f,'lehen',true);const L=S.log.slice(log0).map(x=>x.t);
  return{f,rate,hits,picks,done,kern:F.kern,newReg:PROV_DEF[nw].reg,log:L.filter(t=>/Hof zieht|übersiedelt/.test(t)).map(t=>t.slice(0,120)),own:S.prov[home].owner,v:dip(f,S.prov[home].owner).vas};});
if(k.skip)console.log('NICHT GETESTET (KI): '+k.skip);
else{
ok('KI: Übersiedlung selten (≈2 % je Runde)',k.rate>0.01&&k.rate<0.035,`Rate ${(k.rate*100).toFixed(1)} %`);
ok('KI: Abstand mindestens 30 Runden',k.hits.length>=2&&k.hits.every((h,i)=>i===0||h-k.hits[i-1]>=30),JSON.stringify(k.hits));
ok('KI: wählt meist Lehen',k.picks.lehen>k.picks.behalten&&k.picks.lehen>k.picks.aufgeben&&k.picks.lehen/400>0.55,JSON.stringify(k.picks));
ok('KI: echte Übersiedlung setzt Kernland, Lehen-Jarl ist Vasall, Protokoll-Eintrag',k.done&&k.kern===k.newReg&&k.v&&k.log.length>=1,JSON.stringify({kern:k.kern,v:k.v,log:k.log}));
}

// 7. Fenster und Knopf im Provinzfenster
await EV(`UI.sel=pi;UI.army=null;UI.mode='prov';focusProv(pi,10);refresh();`);
await p.waitForTimeout(1500);
const btn=await p.evaluate(()=>{const b=document.querySelector('[data-act="uebopen"]');if(b)b.scrollIntoView({block:'center'});return b?{dis:b.disabled,t:b.textContent.trim()}:null;});
ok('Provinzfenster der Heimat zeigt „Die Heimat verlegen“',btn&&!btn.dis&&/Die Heimat verlegen/.test(btn.t),JSON.stringify(btn));
const nb=await p.evaluate(()=>{const P=S.prov[PI.dobunner];const me=S.player;const o=P.owner;P.owner=me;P.ln=3;P.lnF=me;UI.sel=PI.dobunner;refresh();const b=document.querySelector('[data-act="uebopen"]');const r=b?{dis:b.disabled,note:b.closest('.row').nextElementSibling.textContent}:null;P.owner=o;P.ln=0;return r;});
ok('Heimat-Provinz ohne Hof: Knopf gesperrt mit Grund',nb&&nb.dis&&/Hof muss hier stehen/.test(nb.note),JSON.stringify(nb));
await EV(`UI.sel=pi;UI.army=null;UI.mode='prov';focusProv(pi,10);refresh();document.querySelector('[data-act="uebopen"]').click();`);
await p.waitForTimeout(1800);
const w=await p.evaluate(()=>{const bs=[...document.querySelectorAll('#dialog [data-act^="ueb:"]')];const xs=bs.map(x=>Math.round(x.getBoundingClientRect().left)),ys=bs.map(x=>Math.round(x.getBoundingClientRect().top));
  return{n:bs.length,h2:document.querySelector('#dialog h2')&&document.querySelector('#dialog h2').textContent,col:new Set(xs).size===1&&ys.every((y,i)=>i===0||y>ys[i-1]),hero:!!document.querySelector('#dialog .evhero'),help:bs.map(x=>(helpText(x)||'').slice(0,40)),txt:document.querySelector('#dialog').innerText.length,dec:/\d\.\d\d/.test(document.querySelector('#dialog').innerText)};});
ok('Fenster: Bild, Titel, vier Knöpfe in einer Spalte',w.n===4&&w.h2==='Die Heimat verlegen'&&w.col&&w.hero,JSON.stringify(w));
ok('Erklärkarten (HELP_ACT) für alle Knöpfe',w.help.every(x=>x.length>20),JSON.stringify(w.help));
ok('Keine Zahl mit mehr als einer Nachkommastelle im Fenster',!w.dec);
await p.screenshot({path:SH+'w5_uebersiedlung.png'});
// Klick auf „Die alte Heimat behalten“ schließt das Fenster und setzt das Kernland
const cl=await p.evaluate(()=>{document.querySelector('[data-act="ueb:behalten"]').click();const F=S.fac[S.player];return{kern:F.kern,open:!document.getElementById('modal').hidden,reg:PROV_DEF[PI.briganten].reg};});
ok('Klick auf „behalten“ im Fenster: Kernland gesetzt, Fenster zu',cl.kern===cl.reg&&!cl.open,JSON.stringify(cl));
// Wikinger-Schritt Landnahme nennt die Übersiedlung
const st=await p.evaluate(()=>{const st2=SCEN.wikinger.chapter.steps.find(x=>/Landnahme/.test(x.t));return!!st2&&/Die Heimat verlegen/.test(st2.txt);});
ok('Wikinger: Landnahme-Schritt-Text erwähnt „Die Heimat verlegen“',st);
// Hauptstadt-Hook merkt die erste Region
const mh=await p.evaluate(()=>{startScenario('wikinger');loadGame(S);try{closeModal();}catch(e){}const me=S.player,F=S.fac[me],cap0=capitalOf(me),r0=PROV_DEF[cap0].reg;F.home0=undefined;delete F.home0;F.gold=9999;const pi=PI.briganten;S.prov[pi].owner=me;
  const _c=canMoveCap;canMoveCap=()=>({ok:true});const r=moveCap(me,pi);canMoveCap=_c;return{r,h:F.home0,r0};});
ok('Hauptstadt verlegen merkt die Region der ersten Hauptstadt',mh.r&&mh.h===mh.r0,JSON.stringify(mh));
ok('Keine Seiten-/Konsolenfehler',!errs.length,errs.slice(0,4).join(' | '));
console.log(`UEBERSIEDLUNG ${R.filter(Boolean).length}/${R.length}`);await b.close();})();
