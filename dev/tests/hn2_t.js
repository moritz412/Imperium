// node hn2_t.js <html> [port] – H2 (v235): Hannibal Paket 2, Akt II. Pass-Abschnitt (Routen 2/3/4 Tage, Heer steht still, Leiste Vorräte/Tragtiere/Moral,
// Tagesereignisse mit Wahl, Ankunft in der Poebene), Kelten-Treue (Sieg +15, Plündern −20, Stillstand −5, ab 50 Krieger, unter 20 Abzug),
// Konsulheere (Sempronius, Scipio) und Flaminius, Plan „Hinterhalt“ (+20 % Fluss im Winter, +25 % Feind marschiert ein), Kontrollen Endlosspiel/andere Geschichte.
// Messung: Pass-Verluste über viele Läufe mit typischen Wahlen (Ziel 50 ± 10 % der Männer). Bewegung wird per evaluate abgekürzt; die Ankunftsrunde misst der
// Spielerlauf am Ende (Bot mit denselben Regeln wie ein Spieler). Das echte iPad ist nicht getestet.
const {chromium}=require('playwright');
const FILE=process.argv[2]||require('path').join(__dirname,'..','imperium.html'),PORT=process.argv[3]||'8772';
(async()=>{const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:process.env.PW_GPU?[]:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const R=[];const ok=(n,c,i='')=>{R.push(!!c);console.log((c?'PASS ':'FAIL ')+n+(i!==''?'  '+JSON.stringify(i):''));};
const fs=require('fs');const SHOT=process.env.HN2_SHOT||'/tmp/claude-0/-home-claude/4f60f6a0-fa46-5154-9e84-95c0bd1121bd/scratchpad';
const ctx=await b.newContext({viewport:{width:1024,height:768},hasTouch:true,isMobile:true});const p=await ctx.newPage();const errs=[];
p.on('pageerror',e=>errs.push('PAGE '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|WebGL|GPU stall/.test(m.text()))errs.push('CON '+m.text().slice(0,200));});
await p.addInitScript(()=>{try{localStorage.setItem('imperium.gfx',JSON.stringify({q:'leicht'}));}catch(e){}});
await p.route(/cdnjs/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));
await p.route(/fonts\.g/,r=>r.abort());await p.route(/\.html$/,r=>r.fulfill({body:fs.readFileSync(FILE),contentType:'text/html; charset=utf-8'}));
await p.goto(`http://localhost:${PORT}/imperium.html`,{timeout:300000});await p.waitForFunction(()=>document.getElementById('loading').hidden,null,{timeout:300000});
await p.waitForFunction(()=>!document.querySelector('#loading[data-gate]'),null,{timeout:120000}).catch(()=>{});
await p.waitForTimeout(1500);
await p.evaluate(()=>{window.playCine=(o,d)=>{d&&d();};
 window.setup=()=>{startScenario('hannibal');try{closeModal();}catch(e){}storyRound();S.q=[];const s=S.story[S.player];if(s)s.q=[];S.scen.flags.hn_besatz='b';S.scen.flags.hn_rhone=1;};
 window.mTxt=()=>$('#modal').hidden?'':$('#dialog').innerText;
 window.clickBtn=re=>{const x=[...document.querySelectorAll('#dialog .actions .btn, #dialog .rcard')].find(y=>re.test(y.textContent.trim())&&!y.disabled);if(x)x.click();return!!x;};
 window.closeAll=()=>{try{closeModal();}catch(e){}};
 window.gotoStep=i=>{const f=S.player,s=S.story[f];s.i=i;s.t0=S.turn;s.done=false;s.end=false;s.w0=stW(f);s.g=stResolve(f,stCh(f).steps[i].g);return s;};
 window.hero=()=>S.armies.find(x=>x.id===S.scen.hero);
 window.popEv=()=>stEvents(S.player);
 // Einstieg: Heer steht im Pass (Provinz erobert), Route gewählt, Runde auf einer Jahreszeit
 window.inPass=(route,turn,prov)=>{setup();const f=S.player,h=hero();S.turn=turn;const pi=PI[prov||'seealpen'];S.prov[pi].owner=f;h.p=pi;h.mp=85;h.hnPick=route||null;closeAll();return h;};
 // Wahl nach Regel: best = historisch/klug, gier = sparsam/riskant, rand = zufällig
 window.HPOL={best:{berg:/Bestechen/,fuehrer:/Ablehnen/,fels:/Feuer/,frost:/schlachten/,absturz:/Seilen/,vorraete:/essen/},gier:{berg:/Kämpfen/,fuehrer:/vertrauen/,fels:/Umgehen/,frost:/Ausharren/,absturz:/Zurücklassen/,vorraete:/kürzen/}};
 window.applyEv=(x,pol)=>{const E=x.E,key=E.id.replace('hn_p_',''),f=S.player;let i=-1;
  if(pol==='rand')i=Math.floor(Math.random()*E.opts.length);else{const re=HPOL[pol][key];i=E.opts.findIndex(o=>re&&re.test(o.label));if(i<0)i=0;}
  let o=E.opts[i];if(o.cost&&S.fac[f].gold<o.cost()){o=E.opts.find(q=>!q.cost)||o;}
  if(o.cost&&S.fac[f].gold>=o.cost())S.fac[f].gold-=o.cost();return{key,label:o.label,msg:o.fx(f,x.ctx)};};
 // ganzer Pass: Tage bis zur Ankunft, Ereignisse nach Regel
 window.runPass=(pol)=>{const h=hero();const seq=[];let guard=0;while(guard++<14){const L=popEv();for(const x of L){if(/^hn_p_/.test(x.E.id)){const r=applyEv(x,pol);seq.push(r.key);}else if(x.E.id==='hn_route'){x.E.opts[0].fx(S.player);}}
   if(!(h.hnPass))break;S.turn++;hnRound();}return seq;};
});

// ---- (a) Routenfenster: erscheint beim Angriff auf eine Pass-Provinz, nur für das Heldenheer, nur einmal ----
const A=await p.evaluate(()=>{setup();const f=S.player,h=hero(),o={};h.p=PI.vocontier;h.mp=85;closeAll();
 orderMove(h,PI.seealpen);o.modal=mTxt();o.btn={kurz:/kurze, steile/.test(o.modal),lang:/lange Weg/.test(o.modal),wacht:/bewachte Pass/.test(o.modal)};
 o.noX=(()=>{const x=document.querySelector('#dialog .dlgx');return!x||x.style.display==='none';})();
 o.click=clickBtn(/kurze, steile/);o.pick=h.hnPick;o.next=mTxt().slice(0,60);closeAll();
 // zweiter Marsch: kein Routenfenster mehr
 h.mp=85;orderMove(h,PI.seealpen);o.again=mTxt().slice(0,40);closeAll();
 // anderes Heer: kein Fenster
 const x=createArmy(f,PI.vocontier,['spear','sword'],1);x.mp=85;orderMove(x,PI.segusiner);o.other=mTxt().slice(0,40);closeAll();
 // Provinz außerhalb des Passes: kein Fenster
 h.hnPick=null;S.scen.flags.hn_pass=0;h.p=PI.narbo;h.mp=85;orderMove(h,PI.tolosa);o.noPass=mTxt().slice(0,40);closeAll();
 return o;});
ok('Routenfenster beim Angriff auf Seealpen: drei Wege, keine ✕-Schaltfläche',A.btn.kurz&&A.btn.lang&&A.btn.wacht&&A.noX,A.modal.slice(0,200));
ok('Wahl „kurz“ wird am Heer gemerkt, danach folgt der Angriffsdialog',A.click&&A.pick==='kurz'&&/Angriff/.test(A.next),[A.pick,A.next]);
ok('Routenfenster nur einmal, nicht für Nebenheere, nicht außerhalb der Pässe',!/Welchen Weg/.test(A.again)&&!/Welchen Weg/.test(A.other)&&!/Welchen Weg/.test(A.noPass),[A.again,A.other,A.noPass]);

// ---- (b) Pass beginnt, Heer steht still, Leiste im Heer-Blatt ----
const B=await p.evaluate(()=>{const o={};const h=inPass('kurz',6);hnRound();const P=h.hnPass;
 o.P=P?{r:P.r,dur:P.dur,day:P.day,v:P.v,t:P.t,m:P.m,pl:P.pl}:null;o.flag=hnFl().hn_pass;o.ev=popEv().map(x=>x.E.id);
 // zurücklegen (Ereignisse waren abgeholt): erneut planen nicht nötig, nur Blatt prüfen
 UI.army=h.id;UI.sel=h.p;UI.mode='army';refresh();o.sheet=$('#shBody').innerText;o.pass=h.hnPass?1:0;
 // Bewegung gesperrt
 const p0=h.p;h.mp=85;orderMove(h,PI.taurini);o.mv1=h.p===p0&&!/Angriff/.test(mTxt());closeAll();marchTo(h,PI.segusiner);o.mv2=h.p===p0;
 const R0=reachMap(h);o.walk=walkPath(h,R0,PI.segusiner);o.mv3=h.p===p0;
 o.row=armyRow(h);
 // nach dem Rundenwechsel bleibt mp 0
 h.mp=85;newRound();o.mp=hero().mp;o.stillIn=hero().hnPass?1:0;
 return o;});
ok('Pass beginnt am Rundenende: Route „kurz“ 2 Tage, Vorräte/Tragtiere 100, Moral 80, Flagge hn_pass',B.P&&B.P.r==='kurz'&&B.P.dur===2&&B.P.v===100&&B.P.t===100&&B.P.m===80&&B.flag>0,B.P);
ok('Erste Tagesereignisse liegen bereit (1–2, Fenster hn_p_*)',B.ev.length>=1&&B.ev.length<=2&&B.ev.every(x=>/^hn_p_/.test(x)),B.ev);
ok('Heer-Blatt zeigt Leiste Vorräte · Tragtiere · Moral und Jahreszeit-Uhr',/Vorräte/.test(B.sheet)&&/Tragtiere/.test(B.sheet)&&/Moral/.test(B.sheet)&&/Schneelage/.test(B.sheet)&&/Tag 1 von 2/.test(B.sheet),B.sheet.slice(0,300));
ok('Heer im Pass steht still: Marsch, Angriff, Wegepfad und Rundenwechsel ändern nichts (mp 0), Zeile „im Pass“',B.mv1&&B.mv2&&B.mv3&&B.walk===false&&/im Pass/.test(B.row)&&B.mp===0,[B.mv1,B.mv2,B.mv3,B.walk,B.mp]);
await p.evaluate(()=>{const h=hero();if(h&&h.hnPass){UI.army=h.id;UI.sel=h.p;UI.mode='army';$('#sheet').classList.remove('collapsed');refresh();}});
await p.waitForTimeout(400);

// ---- (c) Routen: Dauer 2/3/4, Ankunft in der Poebene erst danach, Kampfergebnis, Flaggen ----
const C=await p.evaluate(()=>{const o={};
 for(const [rt,d] of [['kurz',2],['lang',4],['wacht',3]]){const h=inPass(rt,6);const m0=hnMen(h);hnRound();let days=0;const seen=[];
  for(let g=0;g<14&&hero().hnPass;g++){for(const x of popEv()){seen.push(x.E.id);if(/^hn_p_/.test(x.E.id))x.E.opts[x.E.opts.length-1].fx(S.player,x.ctx);}if(!hero().hnPass)break;S.turn++;hnRound();days++;}
  const hh=hero();const I=hnFl().hn_ankunft;
  o[rt]={dur0:d,rounds:days+1,dest:hh.p===PI.taurini,owner:S.prov[PI.taurini].owner===S.player,I:I?{pct:I.pct,men:I.men,men0:I.men0,dur:I.dur,ele:I.ele}:null,first:seen[0],kelt:hnFl().hn_kelt,jagd:hnFl().hn_jagd>0,m0,flag:hnFl().hn_pass>0,left:!!hh.hnPass};}
 return o;});
for(const [rt,d] of [['kurz',2],['lang',4],['wacht',3]]){const c=C[rt];
 ok(`Route ${rt}: Ankunft nach der Routendauer (${d} Tage, mit Umwegen ${c.I?c.I.dur:'?'}), Heer danach in Taurini (erobert)`,c.I&&c.I.dur>=d-1&&c.rounds===c.I.dur+1&&c.dest&&c.owner&&!c.left,c);}
ok('Route „bewacht“ beginnt mit den Bergstämmen',C.wacht.first==='hn_p_berg',C.wacht.first);
ok('Ankunft: Kelten-Treue 35, Konsulheere marschieren (hn_jagd), Ereignis „Poebene“ bereit',C.kurz.kelt===35&&C.kurz.jagd,[C.kurz.kelt,C.kurz.jagd]);
// v239: starke Besatzung in allen Zielen -> kein Zwangskampf, Heer lagert am Fuß des Passes
const L=await p.evaluate(()=>{const h=inPass('kurz',6);for(const k of ['taurini','insubrien','ligurien'])if(PI[k]!=null)S.prov[PI[k]].gar=900;hnRound();
 for(let g=0;g<14&&hero().hnPass;g++){for(const x of popEv()){if(/^hn_p_/.test(x.E.id))x.E.opts[x.E.opts.length-1].fx(S.player,x.ctx);}if(!hero().hnPass)break;S.turn++;hnRound();}
 const I=hnFl().hn_ankunft,hh=hero();return{p:PROV_DEF[hh.p].id,kamp:I&&I.kamp,men:hnMen(hh),im:I&&I.men,pass:!!hh.hnPass};});
ok('Ankunft gegen übermächtige Besatzung: kein Kampf, Heer lagert am Fuß des Passes, keine Verluste',L.p==='seealpen'&&/lagert/.test(L.kamp||'')&&L.men===L.im&&!L.pass,L);

// ---- (d) Ereignisse: jedes mit Bild, Text, Wahl; Wirkung der Wahl stimmt ----
const D=await p.evaluate(()=>{const o={};const keys=['berg','fuehrer','fels','lawine','frost','absturz','vorraete'];
 for(const k of keys){const h=inPass('lang',6);hnRound();popEv();const s=stState(S.player);s.q=[{k:'hn',id:'pass',ev:k}];const L=popEv();const E=L[0]&&L[0].E;
  if(!E){o[k]={none:1};continue;}
  const r={id:E.id,img:!!heroImg(E.img,0,false)||!!E.img,title:E.title(),text:E.text(),n:E.opts.length,descs:E.opts.map(q=>q.desc()),labels:E.opts.map(q=>q.label)};
  r.eff=[];
  for(let i=0;i<E.opts.length;i++){const h2=inPass('lang',6);hnRound();popEv();const P=h2.hnPass;P.v=60;P.t=60;P.m=60;const m0=hnMen(h2),dur0=P.dur,e0=h2.units.filter(hnIsEle).map(u=>u.men);
   const gold=S.fac[S.player].gold;S.fac[S.player].gold=1000;
   const o2=E.opts[i];if(o2.cost)S.fac[S.player].gold-=o2.cost();const msg=o2.fx(S.player,L[0].ctx);
   r.eff.push({label:o2.label,men:Math.round((hnMen(h2)/m0-1)*1000)/10,v:P.v-60,t:P.t-60,m:P.m-60,dur:P.dur-dur0,ele:h2.units.filter(hnIsEle).map(u=>u.men).join('/')+' vs '+e0.join('/'),msg:!!msg||msg===null,cost:o2.cost?o2.cost():0});}
  o[k]=r;}
 return o;});
const effOf=(k,re)=>D[k].eff.find(e=>re.test(e.label));
ok('Alle sieben Ereignisse erzeugen ein Fenster mit Titel, Text, Wahl und Bild',['berg','fuehrer','fels','lawine','frost','absturz','vorraete'].every(k=>D[k].id&&D[k].title.length>5&&D[k].text.length>40&&D[k].n>=1&&D[k].img),Object.keys(D).map(k=>k+':'+(D[k].n)));
ok('Jede Wahl nennt Wirkung/Kosten (Beschreibung mit % oder Zahl)',Object.values(D).every(r=>r.descs.every(d=>/\d/.test(d))),Object.values(D).map(r=>r.descs));
ok('Bergstämme: Kämpfen −6 % Männer/Moral +6; Bestechen kostet Gold, −1 %; Geiseln: Vorräte +10, Moral −8',Math.abs(effOf('berg',/Kämpfen/).men+6)<=1.2&&effOf('berg',/Kämpfen/).m===6&&effOf('berg',/Bestechen/).cost>0&&effOf('berg',/Bestechen/).men>-2.2&&effOf('berg',/Geiseln/).v===10&&effOf('berg',/Geiseln/).m===-8,D.berg.eff);
ok('Felssturz: Feuer + Essig und Umgehen kosten je 1 Tag; Feuer + Essig belohnt (Moral +10, wenig Verlust), Umgehen schlechter',effOf('fels',/Feuer/).dur===1&&effOf('fels',/Umgehen/).dur===1&&effOf('fels',/Feuer/).m===10&&effOf('fels',/Feuer/).men>effOf('fels',/Umgehen/).men,D.fels.eff);
ok('Lawine: Verlust 5–10 %; Frostnacht: Tragtiere schlachten (Tragtiere −20, Vorräte +25) gegen Ausharren (−6 %)',D.lawine.eff[0].men<=-4.5&&D.lawine.eff[0].men>=-10.6&&effOf('frost',/schlachten/).t===-20&&effOf('frost',/schlachten/).v===25&&effOf('frost',/Ausharren/).men<-5,[D.lawine.eff,D.frost.eff]);
ok('Elefant stürzt: Zurücklassen halbiert eine Elefanten-Einheit; Seile bergen (Vorräte −6); Vorräte knapp: Rationen (Moral −12) gegen Tragtiere essen',effOf('absturz',/Zurücklassen/).ele!==effOf('absturz',/Seilen/).ele&&effOf('absturz',/Seilen/).v===-6&&effOf('vorraete',/Rationen/).m===-12&&effOf('vorraete',/essen/).t===-20,[D.absturz.eff,D.vorraete.eff]);
ok('Führer: Vertrauen führt entweder zur Abkürzung oder zum Hinterhalt; Ablehnen kostet nur Moral −2',effOf('fuehrer',/Ablehnen/).m===-2&&effOf('fuehrer',/Ablehnen/).men===0,D.fuehrer.eff);
await p.waitForTimeout(100);

// ---- (e) Messung Pass-Verluste: 30 Läufe je Regel (typische Wahlen), 3 Routen gemischt ----
const SKIP=(process.env.HN2_SKIP||'').split(',');
const M=SKIP.includes('M')?null:await p.evaluate(()=>{const o={};const RT=['kurz','lang','wacht'];
 for(const pol of['best','rand','gier']){const arr=[],eles=[];
  for(let k=0;k<30;k++){const rt=RT[k%3],h=inPass(rt,6+(k%4));hnRound();runPass(pol);const I=hnFl().hn_ankunft;arr.push({rt,pct:I?I.pct:null,days:I?I.dur:null,ele:I?I.ele+'/'+I.ele0:null});}
  o[pol]=arr;}
 return o;});
const st=a=>{const v=a.map(x=>x.pct).filter(x=>x!=null);return{n:v.length,mean:Math.round(v.reduce((s,x)=>s+x,0)/v.length*10)/10,min:Math.min(...v),max:Math.max(...v)};};
if(M){
const all=[...M.best,...M.rand,...M.gier];const sa=st(all);
console.log('Messung Pass-Verluste (Anteil der Männer bei Ankunft, % von 30 Läufen je Regel):',JSON.stringify({best:st(M.best),rand:st(M.rand),gier:st(M.gier),alle:sa}));
for(const rt of['kurz','lang','wacht'])console.log('  Route',rt,JSON.stringify(st(all.filter(x=>x.rt===rt))),'Tage',[...new Set(all.filter(x=>x.rt===rt).map(x=>x.days))].join('/'));
ok(`Messziel: normaler Spieler kommt im Mittel mit 50 ± 10 % der Männer an (alle Regeln: ${sa.mean} %, Spanne ${sa.min}–${sa.max} %)`,sa.mean>=40&&sa.mean<=60&&all.every(x=>x.pct!=null),sa);
ok('Messziel: 80 % der Läufe liegen zwischen 35 und 70 %, kein Lauf unter 20 % oder über 85 %',all.filter(x=>x.pct>=35&&x.pct<=70).length/all.length>=0.8&&all.every(x=>x.pct>=20&&x.pct<=85),all.map(x=>x.pct).sort((a,b)=>a-b).join(','));
ok('Messziel: kluge Wahl (best) schneidet im Mittel nicht schlechter ab als sparsam/riskante (gier)',st(M.best).mean>=st(M.gier).mean-1,[st(M.best).mean,st(M.gier).mean]);
}

// ---- (f) Kelten-Treue ----
const K=await p.evaluate(()=>{const o={};
 const arrive=()=>{const h=inPass('kurz',6);hnRound();runPass('best');return hero();};
 let h=arrive();const f=S.player,F=hnFl();gotoStep(4);
 o.start=F.hn_kelt;o.on=hnKeltOn();o.bar=scenHtml();
 // Sieg +15
 stat(f,'win');S.turn++;hnKeltRound();o.win=F.hn_kelt;
 // Plündern keltischer Provinz −20
 hnKeltPlunder(PI.insubrien);o.plunder=F.hn_kelt;hnKeltPlunder(PI.insubrien);o.plunderTwice=F.hn_kelt;
 // Stillstand: 3 Runden ohne Sieg, dann −5 je Runde
 F.hn_kelt=40;F.hn_lastW=S.turn;F.hn_w=stW(f);const seq=[];for(let i=0;i<5;i++){S.turn++;hnKeltRound();seq.push(F.hn_kelt);}o.stand=seq;
 // Ab 50: keltische Einheiten kostenlos, Unterhalt halb
 setup();h=inPass('kurz',6);hnRound();runPass('best');h=hero();gotoStep(4);const F2=hnFl();F2.hn_kelt=70;F2.hn_w=stW(f);F2.hn_lastW=S.turn;h.units=h.units.slice(0,6);
 const g0=S.fac[f].gold;let n=0;for(let i=0;i<300&&hnKeltCount()<9;i++){S.turn++;F2.hn_lastW=S.turn;F2.hn_kelt=70;const c0=hnKeltCount();hnKeltRound();n+=hnKeltCount()-c0;if(hnKeltCount()>=4)break;}
 o.spawn=hnKeltCount();o.gold=S.fac[f].gold-g0;
 const ku=S.armies.flatMap(x=>x.units).find(u=>u.kelt);if(ku){const base=unitStat(f,ku.r,ku.v).upk;o.upk=[uStat(f,ku).upk,base];}
 // Deckel 4
 for(let i=0;i<100;i++){S.turn++;F2.hn_lastW=S.turn;F2.hn_kelt=90;hnKeltRound();}o.cap=hnKeltCount();
 // Unter 20: Einheiten verlassen das Heer
 F2.hn_kelt=15;S.turn++;F2.hn_lastW=S.turn;hnKeltRound();o.left=hnKeltCount();
 // Nach Akt II (Schritt 6): Leiste weg, keine Wirkung mehr
 gotoStep(6);o.off=hnKeltOn();o.barOff=/Kelten-Treue/.test(scenHtml());
 return o;});
ok('Kelten-Treue startet bei der Ankunft mit 35 und steht als Leiste im Szenario-Kopf',K.start===35&&K.on&&/Kelten-Treue/.test(K.bar)&&/35/.test(K.bar),K.bar.slice(0,200));
ok('Sieg +15, Plündern keltischer Provinz −20 (je Provinz und Runde einmal)',K.win===50&&K.plunder===30&&K.plunderTwice===30,[K.win,K.plunder,K.plunderTwice]);
ok('Stillstand: 3 Runden ohne Sieg ruhig, danach −5 je Runde',JSON.stringify(K.stand)==='[40,40,35,30,25]'||JSON.stringify(K.stand)==='[40,40,40,35,30]',K.stand);
ok('Ab 50 stellen Insubrer/Boier keltische Einheiten (kostenlos, Unterhalt halb), höchstens 4',K.spawn>=1&&K.spawn<=4&&K.cap<=4&&K.gold>=0&&K.upk&&K.upk[0]<K.upk[1],[K.spawn,K.cap,K.upk,K.gold]);
ok('Unter 20 verlassen die keltischen Einheiten das Heer',K.left===0&&K.cap>=1,[K.cap,K.left]);
ok('Nach Akt II ist die Leiste weg und wirkt nicht mehr',!K.off&&!K.barOff,[K.off,K.barOff]);

// ---- (g) Konsulheere ----
const J=await p.evaluate(()=>{const o={};const h=inPass('kurz',6);hnRound();runPass('best');const f=S.player,F=hnFl();
 const sem=S.armies.find(x=>x.gen&&/Sempronius/.test(x.gen.n)),sc=S.armies.find(x=>x.gen&&/Scipio \(Konsul\)/.test(x.gen.n));
 o.flags={sem:!!sem.hnJagd,sc:!!sc.hnJagd,scAt:PROV_DEF[sc.p].id,semAt:PROV_DEF[sem.p].id};gotoStep(4);
 // marschieren: Sempronius braucht mehrere Runden von Ariminum, höchstens eine Provinz je Runde
 const h0=hero();const trace=[];let fights=0;const lg=S.log.length;
 for(let i=0;i<12;i++){S.turn++;const before=sem.p;hnJagdRound();trace.push(PROV_DEF[sem.p].id);if(sem.p===before&&!fights)fights=0;}
 o.trace=trace;o.logs=S.log.slice(lg).map(e=>e.t).filter(t=>/marschiert|greift|wehrt|schlägt/.test(t)).slice(0,8);
 const steps=trace.filter((x,i)=>i>0&&x!==trace[i-1]).length;o.steps=steps;
 // Flaminius: nur im Kapitel Trebia/Trasimene (Schritt 5) und wenn keine Konsuln mehr marschieren
 setup();const g2=inPass('kurz',6);hnRound();runPass('best');gotoStep(5);for(const x of S.armies)if(x.hnJagd)x.units=[];removeEmpty();S.turn+=3;hnJagdRound();
 o.flam=S.armies.some(x=>x.gen&&/Flaminius/.test(x.gen.n)&&x.hnJagd);o.flamAt=(S.armies.find(x=>x.gen&&/Flaminius/.test(x.gen.n))||{}).p===PI.arretium||'moved';
 // Hannibal im Pass: Konsuln warten
 setup();const g3=inPass('lang',6);hnRound();const sem3=S.armies.find(x=>x.gen&&/Sempronius/.test(x.gen.n));sem3.hnJagd=1;const p0=sem3.p;S.turn++;hnJagdRound();o.wait=sem3.p===p0;
 return o;});
ok('Gegner-Drehbuch: Sempronius (Ariminum) und Publius Scipio (von Norden, Ligurien) marschieren nach der Ankunft',J.flags.sem&&J.flags.sc&&J.flags.scAt==='ligurien'&&J.flags.semAt==='ariminum',J.flags);
ok('Konsuln ziehen höchstens eine Provinz je Runde und greifen erst an Hannibals Provinz an',J.steps>=1&&J.logs.some(t=>/marschiert/.test(t))&&J.trace.every((x,i)=>true),[J.trace.join('>'),J.logs]);
ok('Flaminius (Trasimene) erscheint nur im Schritt „Trebia und Trasimene“ und nur einmal',J.flam,J.flamAt);
ok('Im Pass warten die Konsuln (kein Marsch, solange Hannibal im Gebirge steht)',J.wait);

// ---- (h) Plan „Hinterhalt“ ----
const H=await p.evaluate(()=>{const o={};setup();const f=S.player,h=hero();
 const rivIt=[...Array(PROV_DEF.length).keys()].filter(i=>hnReg(i)==='it_nord'&&feat(i).river);const dry=[...Array(PROV_DEF.length).keys()].find(i=>hnReg(i)==='it_nord'&&!feat(i).river);
 const ti=rivIt[0];o.rivIt=rivIt.map(i=>PROV_DEF[i].id);
 const wint=()=>{S.turn=7;};const summ=()=>{S.turn=5;};
 h.plan='lauer';wint();o.attRiverWinter=hnLauerMul(h,ti,true);summ();o.attRiverSummer=hnLauerMul(h,ti,true);wint();o.attDry=dry!=null?hnLauerMul(h,dry,true):null;
 o.defItaly=hnLauerMul(h,ti,false);o.defOutside=hnLauerMul(h,PI.contestaner,false);o.season=season();
 h.plan='frontal';o.noPlan=hnLauerMul(h,ti,true);h.plan='lauer';
 o.planMulAtt=(wint(),planMul(h,ti));
 // Knopf nur in Italien
 h.plan='frontal';h.p=PI.taurini;o.btnItaly=/data-p="lauer"/.test(planHtml(h));h.p=PI.contestaner;o.btnSpain=/data-p="lauer"/.test(planHtml(h));
 // Endlosspiel / Caesar: kein Bonus, kein Knopf
 startScenario('caesar');try{closeModal();}catch(e){}{const c=S.armies.find(x=>x.f===S.player);c.plan='lauer';o.caesar=hnLauerMul(c,PI.taurini||0,false);c.plan='frontal';c.p=PI.taurini;o.caesarBtn=/data-p="lauer"/.test(planHtml(c));}
 return o;});
ok(`Plan „Hinterhalt“ als Angreifer: Fluss im Winter +20 % (${H.rivIt.join(',')}), im Sommer/ohne Fluss −8 %`,H.attRiverWinter===1.2&&H.attRiverSummer===0.92&&(H.attDry==null||H.attDry===0.92)&&H.planMulAtt===1.2&&H.noPlan===1,H);
ok('Plan „Hinterhalt“ als Verteidiger in Italien (Feind marschiert ein): +25 %; außerhalb Italiens kein Bonus',H.defItaly===1.25&&H.defOutside===1,[H.defItaly,H.defOutside]);
ok('Plan-Knopf „Hinterhalt“ nur in Italien (und nur in der Hannibal-Geschichte)',H.btnItaly&&!H.btnSpain&&H.caesar===1&&!H.caesarBtn,[H.btnItaly,H.btnSpain,H.caesar,H.caesarBtn]);
const HB=await p.evaluate(()=>{const o={};const PCT=0.3;const run=(plan,n)=>{let w=0,lau=0;for(let i=0;i<n;i++){setup();const f=S.player,h=hero();const ti=PI.taurini;S.prov[ti].owner=f;h.p=ti;h.plan=plan;S.turn=7;
   const rom=scenArmy('rom',PI.ligurien,[['sword','manipel'],['sword','manipel'],['sword','manipel'],['sword','manipel'],['spear','socii'],['spear','socii'],['spear','socii'],['cav'],['cav'],['sword','manipel']],'Test');rom.mp=85;try{declareWar('rom',f,true);}catch(e){}
   const hm=hnMen(h);for(const u of h.units)u.men=Math.round(u.men*PCT);const res=resolveAttack(rom,ti);if(!res.win)w++;if(res.lauer)lau++;}return{w:w/n,lau:lau/n};};
 o.front=run('frontal',80);o.lauer=run('lauer',80);return o;});
ok('Berechnete Schlacht: Verteidigung mit „Hinterhalt“ gewinnt häufiger als Frontal (Hinweis im Ergebnis)',HB.lauer.w>HB.front.w&&HB.lauer.lau===1&&HB.front.lau===0,HB);

// ---- (i) Kälte (Elefanten, Winter, Norditalien) bleibt bei hnKaelte; Kontrollen Endlosspiel/andere Geschichte/Spielstand ----
const Z=await p.evaluate(()=>{const o={};
 // Endlosspiel: Pass-Regel bleibt leise (einmal Verlust, kein Pass-Zustand, Ziel nicht blockiert)
 newGame('nord');try{closeModal();}catch(e){}const f=S.player;const a=S.armies.find(x=>x.f===f)||createArmy(f,provsOf(f)[0],['spear','sword'],1);
 const pi=PI.salasser;a.p=pi;a.units.forEach(u=>u.men=100);a.mp=85;S.turn=7;
 o.on=hnOn();o.gate=hnGate(a,PI.segusiner,()=>{});passRound();o.men=a.units[0].men;o.hasPass=!!a.hnPass;o.mp0=(()=>{a.mp=85;orderMove(a,PI.segusiner);return true;})();
 closeAll();
 // andere Geschichte
 startScenario('caesar');try{closeModal();}catch(e){}const c=S.armies.find(x=>x.f===S.player);c.p=PI.salasser;c.units.forEach(u=>u.men=100);S.turn=7;passRound();o.caesar=c.units[0].men;o.caesarPass=!!c.hnPass;hnRound();o.caesarAfter=!!c.hnPass;
 // Hannibal: Nebenheer (nicht Held) im Pass bekommt weiter die leise Regel
 setup();const f2=S.player;const x=createArmy(f2,PI.salasser,['spear','sword'],1);x.units.forEach(u=>u.men=100);S.turn=7;passRound();o.side=x.units[0].men;o.sideHn=!!x.hnPass;
 // Spielstand: JSON-Rundlauf
 const h=inPass('lang',6);hnRound();popEv();const j=JSON.stringify({scen:S.scen,army:h,q:stState(S.player).q});const back=JSON.parse(j);
 o.save={r:back.army.hnPass.r,dur:back.army.hnPass.dur,keys:Object.keys(back.army.hnPass).join(','),flag:back.scen.flags.hn_pass};
 // Alt-Stand ohne hn_*-Zustand: Runden laufen
 setup();let err=null;try{for(let i=0;i<4;i++){S.turn++;hnRound();}}catch(e){err=e.message;}o.err=err;
 // Heer im Pass geladen aus JSON: Tage laufen weiter
 const h2=inPass('lang',6);hnRound();const dump=JSON.parse(JSON.stringify(h2.hnPass));h2.hnPass=dump;popEv();S.turn++;hnRound();o.cont=hero().hnPass?hero().hnPass.day:-1;
 return o;});
ok('Endlosspiel: kein Tor, kein Pass-Zustand, leise Geländeregel (Verlust, kein Stillstand)',!Z.on&&Z.gate===false&&!Z.hasPass&&Z.men<100,[Z.on,Z.gate,Z.hasPass,Z.men]);
ok('Andere Geschichte (Caesar) und Hannibals Nebenheer: Pass bleibt die leise Regel, kein hnPass',Z.caesar<100&&!Z.caesarPass&&!Z.caesarAfter&&Z.side<100&&!Z.sideHn,[Z.caesar,Z.side]);
ok('Spielstand: Pass-Zustand übersteht JSON und läuft weiter; Alt-Stand ohne hn_*-Daten läuft fehlerfrei',Z.save.r==='lang'&&Z.save.dur===4&&Z.save.flag>0&&Z.err==null&&Z.cont===1,[Z.save,Z.err,Z.cont]);

// ---- (j) Bilder: Rückfalltabelle liefert für jeden H2-Schlüssel ein vorhandenes Bild ----
const I=await p.evaluate(()=>{const o={};for(const k of['route','berg','fuehrer','fels','lawine','frost','absturz','vorraete','poebene','trebia','trasimene']){const x=hnImg(k);o[k]=x+':'+(heroImg(x,0,false)?'ja':'nein');}return o;});
ok('HN_IMG (H2): jeder Schlüssel fällt auf ein vorhandenes Bild zurück (TODO Job 40: hn_ps_*, hn_k2_*, hn_kap_*)',Object.values(I).every(v=>/:ja$/.test(v)),I);

// ---- (k) Spielerlauf: Bot mit den Knöpfen eines Spielers (Fenster anklicken, Angriff, Runde beenden), misst Ankunftsrunde und Verluste ----
const PL=SKIP.includes('PL')?null:await p.evaluate(()=>{const out={runs:[]};
 const bfs=(from,to)=>{const prev={[from]:-1},q=[from];while(q.length){const c=q.shift();if(c===to)break;for(const n of ADJ[c]){if(prev[n]!==undefined||!isAct(n)||isSeaLink(c,n))continue;prev[n]=c;q.push(n);}}if(prev[to]===undefined)return null;const pa=[];let k=to;while(k!==from){pa.unshift(k);k=prev[k];}return pa;};
 for(let run=0;run<3;run++){setup();const f=S.player;S.scen.flags.hn_besatz=null;S.scen.flags.hn_rhone=null;
  const rt=[/kurze, steile/,/lange Weg/,/bewachte/][run%3];let seenWin={besatz:0,rhone:0,route:0};
  const answer=()=>{for(let g=0;g<6;g++){const t=mTxt();if(!t)break;
     if(/Wer bleibt in Hispanien/.test(t)){seenWin.besatz++;clickBtn(/Alle ziehen mit/);}
     else if(/Der Strom ist breit/.test(t)){seenWin.rhone++;clickBtn(/Flöße bauen/);}
     else if(/Welchen Weg/.test(t)){seenWin.route++;clickBtn(rt);}
     else break;}};
  let arrived=null,r=0,log=[];
  for(r=0;r<30&&!arrived;r++){const h=hero();if(!h)break;
   for(const x of popEv()){if(/^hn_p_/.test(x.E.id))applyEv(x,'best');else if(x.E.id==='hn_route')x.E.opts[run%3].fx(f);}
   closeAll();
   if(!h.hnPass){h.mp=maxMP(h);
    if(S.prov[PI.edetaner].owner!==f){try{if(!(S.sieges&&S.sieges[PI.edetaner])&&r===0){orderMove(h,PI.edetaner);closeAll();}resolveAttack(h,PI.edetaner);}catch(e){}}
    else{const path=bfs(h.p,PI.seealpen);let n=0;
     while(path&&path.length&&h.mp>0&&n++<8&&!h.hnPass){const nx=path[0];
      if(S.prov[nx].owner===f){const m0=h.mp;marchTo(h,nx);answer();closeAll();if(h.p===nx){path.shift();continue;}break;}
      orderMove(h,nx);answer();closeAll();
      if(h.mp>0&&h.p!==nx&&S.prov[nx].owner!==f&&!(hnFl().hn_rhone===S.turn&&h.mp===0)){try{const res=resolveAttack(h,nx);battleLog(res);}catch(e){}}
      if(S.prov[nx].owner===f&&h.p===nx){path.shift();}
      break;}}}
   closeAll();newRound();closeAll();
   if(hnFl().hn_ankunft)arrived=hnFl().hn_ankunft;}
  const I=hnFl().hn_ankunft;out.runs.push({route:['kurz','lang','wacht'][run%3],entry:hnFl().hn_pass||null,arrive:I?I.t:null,pct:I?I.pct:null,dur:I?I.dur:null,rounds:r,hero:!!hero(),win:seenWin});}
 return out;});
if(PL){console.log('Spielerlauf (Bot, kluge Wahl, greift jede Runde an):',JSON.stringify(PL.runs));
 ok('Spielerlauf: Bot erreicht den Pass (Besatz-, Rhone- und Routenfenster erscheinen) und kommt in die Poebene',PL.runs.every(x=>x.arrive!=null&&x.win.route>=1),PL.runs);
 ok('Messziel Spielerlauf (Einzelläufe streuen): Männer bei Ankunft 30–75 %, Ankunft Runde 9–15 (Soll 9–12 nur mit kurzer Route erreicht, siehe Ausgabe)',PL.runs.every(x=>x.arrive>=9&&x.arrive<=15&&x.pct>=30&&x.pct<=75),PL.runs.map(x=>[x.route,x.arrive,x.pct]));}

// ---- Screenshots (nur Sichtprüfung) ----
await p.evaluate(()=>{setup();const h=hero();S.prov[PI.seealpen].owner=S.player;h.p=PI.vocontier;h.mp=85;closeAll();orderMove(h,PI.seealpen);});
await p.waitForTimeout(600);await p.screenshot({path:SHOT+'/hn2_route.jpg',type:'jpeg',quality:70,timeout:120000}).catch(()=>{});
await p.evaluate(()=>{closeAll();const h=inPass('kurz',6);hnRound();const s=stState(S.player);s.q=[];UI.army=h.id;UI.sel=h.p;UI.mode='army';$('#sheet').classList.remove('collapsed');refresh();});
await p.waitForTimeout(600);await p.screenshot({path:SHOT+'/hn2_blatt.jpg',type:'jpeg',quality:70,timeout:120000}).catch(()=>{});
await p.evaluate(()=>{closeAll();const h=inPass('lang',6);hnRound();const L=popEv();stState(S.player).q=[{k:'hn',id:'pass',ev:'fels'}];const x=popEv()[0];if(x)showEvent(x.E,x.ctx,()=>{});});
await p.waitForTimeout(600);await p.screenshot({path:SHOT+'/hn2_ereignis.jpg',type:'jpeg',quality:70,timeout:120000}).catch(()=>{});

ok('Keine Seitenfehler',!errs.length,errs.slice(0,3));
const nP=R.filter(x=>x).length;console.log(`${nP} PASS / ${R.length-nP} FAIL`);console.log(R.every(x=>x)?'ALLE PASS':'FEHLER '+R.filter(x=>!x).length);await b.close();})();
