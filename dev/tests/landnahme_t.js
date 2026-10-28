// node landnahme_t.js <html> [port] – W3 (v204): Landnahme (Lager, Siedlung, Heimat), Beute-Faktor, Taufe/Treue/Rückfall, Danelag-Mischkultur, Wikinger-Schritte.
// Bilder: shot/w3_landnahme.png (Provinzfenster mit Knopf), shot/w3_taufe.png (Taufe-Fenster)
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
const fresh=()=>p.evaluate(()=>{startScenario('wikinger');loadGame(S);try{closeModal();}catch(e){}window.picMsg=()=>{};
  const me=S.player;S.fac[me].gold=5000;
  // Heer der Spielerin in Northumbria (Briganten), Provinz gehört ihr
  const pi=PI.briganten;S.prov[pi].owner=me;S.prov[pi].cul='britisch';S.armies=S.armies.filter(a=>a.p!==pi||a.f===me);
  if(!S.armies.some(a=>a.f===me&&a.p===pi))createArmy(me,pi,['sword','spear'],1);
  return{me,rel:facRel(me),cul:facCul(me),rk:raidKind(me),t:S.turn,t0:S.scen.t0};});
let s=await fresh();
ok('Szenario: Raubvolk (See), heidnischer Hauptglaube',s.rk==='see'&&['germ','druiden'].includes(s.rel),JSON.stringify(s));

// 1. Plünderungen zählen, Bedingungen
const a=await p.evaluate(()=>{const me=S.player,pi=PI.briganten,F=S.fac[me];if(!atWar(me,'briten'))declareWar(me,'briten');
  const c0=lnCan(me,pi);// zu früh
  S.turn=S.scen.t0+12;F.gold=5000;
  const c1=lnCan(me,pi);// zu wenig Plünderungen
  const tg=PI.votadiner;S.prov[tg].owner='briten';const ar=S.armies.find(x=>x.f===me&&x.p===pi);
  for(let i=0;i<3;i++){S.prov[tg].dv=null;plunderProv(ar,tg,'rz');}
  const n=lnRaids(me,'britannien');
  const c2=lnCan(me,pi);
  // ohne Heer
  const ars=S.armies.filter(x=>x.f===me&&x.p===pi);S.armies=S.armies.filter(x=>!(x.f===me&&x.p===pi));const c3=lnCan(me,pi);S.armies.push(...ars);
  F.gold=100;const c4=lnCan(me,pi);F.gold=5000;
  // Heimat: Provinz in Skandinavien
  const hv=lnCan(me,PI.viken);
  // nicht-Raubvolk
  const cn=lnCan('usa',PI.belgae_b);
  return{c0:c0.why,c1:c1.why,n,c2:c2.ok,c3:c3.why,c4:c4.why,hv:hv.why,cn:cn.why,cost:c2.cost,epc:EPOCH_COST[ep()]};});
ok('Zu früh vor Runde 10',/Frühestens/.test(a.c0),a.c0);
ok('Zu wenige Plünderungen: Meldung mit Zahl',/Plünderungen/.test(a.c1),a.c1);
ok('3 Plünderungen gezählt (rzReg), dann möglich',a.n===3&&a.c2===true,JSON.stringify({n:a.n,ok:a.c2}));
ok('Ohne Heer in der Provinz nicht möglich',/Heer/.test(a.c3),a.c3);
ok('Zu wenig Gold gemeldet',/Gold/.test(a.c4),a.c4);
ok('Heimat (Viken) und Nicht-Raubvolk ausgeschlossen',/Heimat/.test(a.hv)&&/Raubv/.test(a.cn),a.hv+' | '+a.cn);
ok('Kosten 150 × Epochenfaktor',a.cost===Math.round(150*a.epc),a.cost+' '+a.epc);

// 2. Start, Stufen nach Runden, Wirkung
const b2=await p.evaluate(()=>{const me=S.player,pi=PI.briganten,P=S.prov[pi],F=S.fac[me];const g0=F.gold;const inc0=provIncome(pi);
  const ok1=lnStart(me,pi);const spent=g0-F.gold;const st=[];st.push(P.ln);
  const T0=S.turn;const changes=[];let last=P.ln;
  for(let i=1;i<=16;i++){S.turn=T0+i;faithRound();if(P.ln!==last){changes.push(i+':'+P.ln);last=P.ln;}}
  // Steuern je Stufe
  const inc=[];for(const L of [0,1,2,3]){P.ln=L;P.lnF=me;inc.push(provIncome(pi));}P.ln=3;
  const again=lnCan(me,pi);
  // Unruhe
  P.unrest=2;const t1=S.turn;S.turn++;faithRound();const un=P.unrest;
  return{ok1,spent,changes,inc,again:again.why,un,lnOf:lnOf(pi),owner:P.lnF===me};});
ok('Landnahme startet, Lager gegründet, 150 × Faktor Gold',b2.ok1&&b2.spent>0,'Kosten '+b2.spent);
ok('Stufe 2 nach 6 Runden, Stufe 3 nach 14',b2.changes.join(',')==='6:2,14:3',b2.changes.join(','));
ok('Steuern +10/+20/+30 %',b2.inc[1]>b2.inc[0]&&b2.inc[2]>b2.inc[1]&&b2.inc[3]>b2.inc[2]&&Math.abs(b2.inc[3]/b2.inc[0]-1.3)<0.1,JSON.stringify(b2.inc));
ok('Unruhe sinkt auf Stufe 3 (um 0,3 pro Runde)',b2.un<=1.75,String(b2.un));
ok('Doppelte Landnahme gesperrt',/schon gesiedelt/.test(b2.again),b2.again);

// 3. Beute-Faktor ab 3 Siedlungen, Bauen billiger
const c=await p.evaluate(()=>{const me=S.player,F=S.fac[me];const tg=PI.votadiner;S.prov[tg].owner='briten';if(!atWar(me,'briten'))declareWar(me,'briten');
  const ar=S.armies.find(x=>x.f===me);const _gf=genFx;genFx=function(){return 0;};const one=()=>{S.prov[tg].dv=null;const g=F.gold;const r=plunderProv(ar,tg,'rz');return r?r.loot:-1;};
  const own=[PI.briganten,PI.viken,PI.vestland,PI.gautar];for(const q of own){S.prov[q].owner=me;S.prov[q].ln=0;S.prov[q].lnF=null;}
  const sample=()=>{let s=0;for(let i=0;i<4;i++)s+=one();return s/4;};
  const mk=n=>{for(let i=0;i<own.length;i++){const P=S.prov[own[i]];if(i<n){P.ln=2;P.lnF=me;P.lnT=S.turn-7;}else{P.ln=0;P.lnF=null;}}};
  F.gold=9000;const bk=['market','farm','barracks','walls','temple','port','library'].find(k=>canBuild(me,own[0],k).cost&&canBuild(me,own[3],k).cost);
  mk(2);const f2=lnLoot(me),l2=sample();const cb2=canBuild(me,own[0],bk).cost;
  mk(3);const f3=lnLoot(me),l3=sample();const cb3=canBuild(me,own[0],bk).cost;const cbo=canBuild(me,own[3],bk).cost;
  genFx=_gf;return{f2,f3,l2,l3,cb2,cb3,cbo,key:bk};});
ok('Beute-Faktor: 1,0 bei 2 Siedlungen, 0,8 bei 3',c.f2===1&&Math.abs(c.f3-0.8)<1e-9,c.f2+' / '+c.f3);
ok('Tatsächliche Beute sinkt um etwa 20 %',c.l3/c.l2>0.7&&c.l3/c.l2<0.9,Math.round(c.l2)+' -> '+Math.round(c.l3));
ok('Bauen −10 % in gesiedelter, nicht in ungesiedelter Provinz ('+c.key+')',Math.abs(c.cb3/c.cb2-0.9)<0.02&&c.cbo>=c.cb2*0.98,JSON.stringify({cb2:c.cb2,cb3:c.cb3,cbo:c.cbo}));

// 4. Mischkultur (Danelag)
const d=await p.evaluate(()=>{const me=S.player,pi=PI.briganten,P=S.prov[pi];const nb=[...ADJ[pi]].find(q=>S.prov[q].owner==='frei'||true);
  const adj=[...ADJ[pi]].find(q=>q!==pi&&PROV_DEF[q].reg==='britannien');S.prov[adj].owner=me;S.prov[adj].cul='britisch';S.prov[adj].ln=0;S.prov[adj].lnF=null;
  const run=(pi,ln)=>{const Q=S.prov[pi];Q.cul='britisch';Q.cp=0;Q.ln=ln;Q.lnF=ln?me:null;Q.lnT=S.turn;const t=S.turn;faithRound();return Q.cp;};
  // Nachbar ohne Landnahme erst, wenn die Hauptprovinz Landnahme hat
  P.ln=2;P.lnF=me;P.lnT=S.turn-7;
  const base=(()=>{P.ln=0;P.lnF=null;const x=run(adj,0);return x;})();
  P.ln=2;P.lnF=me;P.lnT=S.turn-7;const nbr=run(adj,0);
  P.ln=0;P.lnF=null;const own0=run(pi,0);
  const own1=run(pi,1);
  return{base,nbr,own0,own1,fc:facCul(me),adjName:PROV_DEF[adj].name};});
ok('Landnahme-Provinz gleicht sich ×1,5 schneller an',d.own0>0&&Math.abs(d.own1/d.own0-1.5)<0.05,d.own0+' -> '+d.own1);
ok('Angrenzende eigene Provinz ×1,2',d.base>0&&Math.abs(d.nbr/d.base-1.2)<0.05,d.base+' -> '+d.nbr+' ('+d.adjName+')');

// 5. Taufe
const t=await p.evaluate(()=>{startScenario('wikinger');loadGame(S);try{closeModal();}catch(e){}window.picMsg=()=>{};const me=S.player;S.fac[me].gold=5000;
  // zwei Provinzen an der Grenze zu christlichen Reichen als Siedlung
  const eng=['briganten','corieltauver','icener','dobunner','trinovanten','cantium','belgae_b','dumnonier','votadiner'].map(x=>PI[x]);
  const chr=f=>CHR.includes(facRel(f));
  const cand=eng.filter(q=>S.prov[q].owner!==me&&[...ADJ[q]].some(n=>{const o=S.prov[n].owner;return o&&o!=='frei'&&o!==me&&chr(o);}));
  const mine=[];for(const q of cand){const bd=[...ADJ[q]].filter(n=>eng.includes(n)&&S.prov[n].owner!==me&&chr(S.prov[n].owner));if(mine.length<2&&bd.length)mine.push(q);}
  // Besitz: unsere zwei Provinzen; die Nachbarn bleiben bei den Reichen
  for(const q of mine){S.prov[q].owner=me;S.prov[q].ln=2;S.prov[q].lnF=me;S.prov[q].lnT=S.turn-8;}
  const eg={};['usa','mogul','vijaya','briten'].forEach(f=>eg[f]=facRel(f));
  const I=lnBaptInfo(me);const old=facRel(me);
  const wasWar=I.giver?atWar(me,I.giver):null;if(I.giver&&!wasWar)declareWar(me,I.giver);
  const rel0=I.giver?relation(me,I.giver):0;
  const core=provsOf(me).find(q=>lnCore(me,q)&&q!==mine[0]&&q!==mine[1]);const ord0=provOrder(core);const part=()=>{const x=orderParts(core).find(p=>/Gefolgsleute|Jarlen/.test(p[0]));return x?x[1]:0;};const pt0=part();
  const pagan=lnPagan(me),okb=lnBaptOk(me);
  const ev=lnEvTauf();const lab=ev.E.opts.map(o=>o.label);const txt=ev.E.text({});
  ev.E.opts[0].fx(me);
  const B=S.fac[me].bapt;
  return{eg,mine:mine.map(q=>PROV_DEF[q].name),n:I.n,nb:I.nb,giver:I.giver,pagan,okb,lab,old,nw:facRel(me),rel0,rel1:I.giver?relation(me,I.giver):0,war1:I.giver?atWar(me,I.giver):null,truce:I.giver?dip(me,I.giver).truce:null,
    ord0,ord1:provOrder(core),pt0,pt1:part(),core:PROV_DEF[core].name,loot:lnLoot(me),B:{c:B.c,thr:B.thrT-S.turn,rf:B.rfT},txt};});
ok('Englische Reiche sind christlich (Voraussetzung der Taufe)',['usa','mogul','vijaya','briten'].every(f=>['christ','ortho','evang'].includes(t.eg[f])),JSON.stringify(t.eg));
ok('2 Siedlungen an christlichen Nachbarn: Taufe möglich',t.n>=2&&t.pagan&&t.okb&&t.giver,JSON.stringify({n:t.n,nb:t.nb,g:t.giver,mine:t.mine}));
ok('Fenster mit zwei Knöpfen: Taufe / alte Götter',t.lab.length===2&&t.lab[0]==='Taufe annehmen'&&t.lab[1]==='Den alten Göttern treu bleiben',t.lab.join(' | '));
ok('Taufe: Staatsglaube christlich',t.old!==t.nw&&['christ','ortho','evang'].includes(t.nw),t.old+' -> '+t.nw);
ok('Taufe: Beziehung zum Angebotsgeber steigt (+25), Krieg endet mit 10 Runden Waffenstillstand',t.rel1>t.rel0&&t.war1===false&&t.truce===10,`${t.rel0} -> ${t.rel1} Krieg ${t.war1} Waffenstillstand ${t.truce}`);
ok('Taufe: Ordnung −1 im Kernland (eigener Posten; dazu Glaubensunterschied der Bevölkerung)',t.pt0===0&&t.pt1===-1&&t.ord1<t.ord0,`${t.core}: Posten ${t.pt0} -> ${t.pt1}, Ordnung ${t.ord0} -> ${t.ord1}`);
ok('Taufe: Beute ×0,8, Thronstreit-Fenster 30 Runden, bapt gemerkt',Math.abs(t.loot-0.8)<1e-9&&t.B.c==='tauf'&&t.B.thr===30,JSON.stringify(t.B)+' Beute '+t.loot);

// 6. Rückfall (nur nach Taufe), Wahlen
const r=await p.evaluate(()=>{const me=S.player,F=S.fac[me],B=F.bapt;const old=B.old;
  B.rfT=S.turn;B.rfDone=0;S.lnQ=[];lnRound();const q=(S.lnQ||[]).map(x=>x.k);
  const ev=lnEvRueck();const lab=ev.E.opts.map(o=>o.label);
  const core=provsOf(me).find(q=>lnCore(me,q)&&lnOf(q)===0);
  // standhaft
  B.ord=[];const o0=provOrder(core);ev.E.opts[1].fx(me);const o1=provOrder(core);
  const stay=facRel(me);
  // nachgeben
  ev.E.opts[0].fx(me);
  return{q,lab,o0,o1,stay,back:facRel(me),old,c:B.c};});
ok('Rückfall-Ereignis kommt in die Warteschlange',r.q.includes('rueck'),r.q.join());
ok('Rückfall: Nachgeben / Standhaft bleiben',r.lab.join('|')==='Nachgeben|Standhaft bleiben',r.lab.join('|'));
ok('Standhaft: Ordnung −1 im Kernland, Glaube bleibt christlich',Math.abs((r.o0-r.o1)-1)<0.11&&r.stay!==r.old,`${r.o0} -> ${r.o1}`);
ok('Nachgeben: alter Glaube kehrt zurück',r.back===r.old&&r.c==='rueck',r.back+' / '+r.old);

// 7. Treue
const tr=await p.evaluate(()=>{startScenario('wikinger');loadGame(S);try{closeModal();}catch(e){}window.picMsg=()=>{};const me=S.player;
  const eng=['briganten','corieltauver','icener','dobunner'].map(x=>PI[x]);const chr=f=>CHR.includes(facRel(f));
  const mine=[];for(const q of eng){if(mine.length<2&&[...ADJ[q]].some(n=>{const o=S.prov[n].owner;return o&&o!=='frei'&&o!==me&&chr(o)&&!mine.includes(n);}))mine.push(q);}
  for(const q of mine){S.prov[q].owner=me;S.prov[q].ln=2;S.prov[q].lnF=me;S.prov[q].lnT=S.turn-8;}
  const I=lnBaptInfo(me);const g=I.nb[0];const rel0=relation(me,g);const old=facRel(me);const core=provsOf(me).find(q=>lnCore(me,q)&&lnOf(q)===0);const o0=provOrder(core);const ruhm0=S.scen.ruhm||0;
  lnEvTauf().E.opts[1].fx(me);
  return{rel0,rel1:relation(me,g),same:facRel(me)===old,o0,o1:provOrder(core),ruhm:(S.scen.ruhm||0)-ruhm0,c:S.fac[me].bapt.c,loot:lnLoot(me)};});
ok('Treue: Glaube bleibt, Beziehung zu Christen sinkt',tr.same&&tr.rel1<tr.rel0,`${tr.rel0} -> ${tr.rel1}`);
ok('Treue: Ruhm +15, Ordnung +1 im Kernland, Beute unverändert',tr.ruhm===15&&Math.abs((tr.o1-tr.o0)-1)<0.11&&tr.loot===1&&tr.c==='treue',JSON.stringify(tr));

// 8. KI: selten, höchstens 1 je 10 Runden; Taufe selten
const k=await p.evaluate(()=>{startScenario('wikinger');loadGame(S);try{closeModal();}catch(e){}window.picMsg=()=>{};const me=S.player;
  const f=['nord','polen','slawen','osmanen'].find(x=>x!==me&&alive(x)&&raidKind(x));
  if(!f)return{skip:'kein KI-Raubvolk'};
  isHumanP.__x=1;
  // KI-Reich mit Heer und Plünderungen in Britannien
  const pi=PI.briganten;S.prov[pi].owner=f;S.prov[pi].cul='britisch';if(!S.armies.some(a=>a.f===f&&a.p===pi))createArmy(f,pi,['sword'],1);
  S.fac[f].gold=5000;S.fac[f].rzReg={britannien:5};S.turn=S.scen.t0+30;
  const aiP=LN.aiP;let n0=0;for(let i=0;i<300;i++){S.prov[pi].ln=0;S.prov[pi].lnF=null;S.fac[f].lnAiT=null;S.turn++;lnRound();if(S.prov[pi].ln)n0++;}
  const rate=n0/300;
  LN.aiP=1;S.prov[pi].ln=0;S.prov[pi].lnF=null;S.fac[f].lnAiT=null;S.turn++;lnRound();const first=lnOf(pi)>0;
  const second=(()=>{const q=[...ADJ[pi]].find(x=>PROV_DEF[x].reg==='britannien');S.prov[q].owner=f;S.prov[q].cul='britisch';createArmy(f,q,['sword'],1);S.turn++;lnRound();return lnOf(q)>0;})();
  S.turn+=LN.aiGap;const third=(()=>{const q=[...ADJ[pi]].find(x=>PROV_DEF[x].reg==='britannien');lnRound();return lnOf(q)>0;})();
  LN.aiP=aiP;
  return{f,rate,first,second,third};});
if(k.skip)console.log('SKIP KI '+k.skip);else{
  ok('KI-Landnahme selten (≈3 % je Runde, gemessen)',k.rate>0.005&&k.rate<0.08,'Rate '+k.rate);
  ok('KI: höchstens eine Landnahme je 10 Runden',k.first&&!k.second,JSON.stringify(k));}

// 9. Wikinger-Schritte
const w=await p.evaluate(()=>{startScenario('wikinger');loadGame(S);try{closeModal();}catch(e){}window.picMsg=()=>{};const me=S.player;const C=SCEN.wikinger.chapter;
  const ti=C.steps.map(x=>x.t);const iL=ti.indexOf('Akt II · Landnahme'),iW=ti.indexOf('Akt II · Wedmore'),iG=ti.indexOf('Akt II · Das große Heer'),iP=ti.indexOf('Akt II · Paris');
  storyRound();const s=stState(me);const vk=C.steps.map((st,i)=>stVk('wikinger',st,{i}).join());
  s.i=iL;s.g=stResolve(me,C.steps[iL].g);s.t0=S.turn;
  const p0=stProg(me,s.g,s);
  const pi=PI.briganten;S.prov[pi].owner=me;S.prov[pi].ln=1;S.prov[pi].lnF=me;S.prov[pi].lnT=S.turn;
  const p1=stProg(me,s.g,s);
  S.prov[pi].ln=2;const p2=stProg(me,s.g,s);storyRound();const after=s.i;
  const st=C.steps[iW];s.g=stResolve(me,st.g);const q0=stProg(me,s.g,s);scenChoice('wedmore_tauf');const q1=stProg(me,s.g,s);storyRound();
  return{iG,iL,iW,iP,vk:vk.join(' '),p0,p1,p2,after,q0,q1,after2:s.i,flag:S.scen.flags.wedmore,rel:facRel(me),bapt:S.fac[me].bapt&&S.fac[me].bapt.c,need:scenNeed(me,C.steps[iL].g),ev:typeof stChoiceEv(C.steps[iW],{i:iW},C).E.title==='function'};});
ok('Reihenfolge: Das große Heer → Landnahme → Wedmore → Paris',w.iL===w.iG+1&&w.iW===w.iL+1&&w.iP===w.iW+1,JSON.stringify({g:w.iG,l:w.iL,w:w.iW,p:w.iP}));
ok('Sprecher-Nummern der späteren Schritte bleiben (k5…k10), Landnahme/Wedmore seit v215 mit eigenen Clips',/wikinger_k4 wikinger_landnahme wikinger_wedmore wikinger_k5 wikinger_k6 wikinger_k7 wikinger_k8 wikinger_k9 wikinger_k10/.test(w.vk),w.vk);
ok('Schritt Landnahme: Stand 0/1 → Lager 0/1 → Siedlung 1/1, danach nächster Schritt',w.p0[0]===0&&w.p1[0]===0&&w.p2[0]===1&&w.after===w.iW,JSON.stringify([w.p0,w.p1,w.p2,w.after]));
ok('Schritt Wedmore: Wahl erfüllt das Ziel, Taufe wirkt',w.q0[0]===0&&w.q1[0]===1&&w.flag===1&&w.bapt==='tauf'&&w.after2===w.iP,JSON.stringify({q0:w.q0,q1:w.q1,fl:w.flag,b:w.bapt,i:w.after2}));
ok('Frist wird für Landnahme verlängert (scenNeed 16)',w.need===16,String(w.need));

// 10. Bilder
await p.evaluate(()=>{startScenario('wikinger');loadGame(S);try{closeModal();}catch(e){}const me=S.player,pi=PI.briganten;S.prov[pi].owner=me;S.prov[pi].cul='britisch';S.fac[me].gold=5000;S.turn=S.scen.t0+14;S.fac[me].rzReg={britannien:4};
  if(!S.armies.some(a=>a.f===me&&a.p===pi))createArmy(me,pi,['sword','spear'],1);UI.sel=pi;UI.army=null;UI.mode='prov';focusProv(pi,10);refresh();});
await p.waitForTimeout(1500);
const btn=await p.evaluate(()=>{const b=document.querySelector('[data-act="landnahme"]');if(b)b.scrollIntoView({block:'center'});return b?{dis:b.disabled,t:b.textContent}:null;});
ok('Provinzfenster zeigt den Landnahme-Knopf',btn&&!btn.dis&&/Hier siedeln/.test(btn.t),JSON.stringify(btn));
await p.waitForTimeout(500);await p.screenshot({path:SH+'w3_landnahme.png'});
await p.evaluate(()=>{const b=document.querySelector('[data-act="landnahme"]');b.click();});await p.waitForTimeout(800);
const after=await p.evaluate(()=>({ln:lnOf(PI.briganten),txt:(document.querySelector('#sheet')||document.body).innerText.includes('Lager')}));
ok('Klick auf den Knopf gründet das Lager, Fenster zeigt es',after.ln===1&&after.txt,JSON.stringify(after));
await p.waitForTimeout(300);await p.screenshot({path:SH+'w3_landnahme_lager.png'});
// Taufe-Fenster
await p.evaluate(()=>{const me=S.player;const eng=['corieltauver','icener','dobunner'].map(x=>PI[x]);
  for(const q of [PI.briganten,eng[0]]){S.prov[q].owner=me;S.prov[q].ln=2;S.prov[q].lnF=me;S.prov[q].lnT=S.turn-8;}
  const x=lnEvTauf();showEvent(x.E,x.ctx,()=>{});});
await p.waitForTimeout(1500);await p.screenshot({path:SH+'w3_taufe.png'});
const tf=await p.evaluate(()=>{const o=[...document.querySelectorAll('.evopt')].map(b=>b.textContent.trim().slice(0,60));return{o,h:document.querySelector('#dialog h2')&&document.querySelector('#dialog h2').textContent};});
ok('Taufe-Fenster: zwei Knöpfe untereinander',tf.o.length===2,JSON.stringify(tf));
ok('Keine Seiten-/Konsolenfehler',!errs.length,errs.slice(0,4).join(' | '));
console.log(`LANDNAHME ${R.filter(Boolean).length}/${R.length}`);await b.close();})();
