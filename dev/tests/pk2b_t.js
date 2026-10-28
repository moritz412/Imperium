// node pk2_t.js <html> [port] [altHtml] – Paket 2: Feldherren, Thronstreit, Statthalter, Zeitenwende, Grenzmark, Speichern/Laden, alter Spielstand
const {chromium}=require('playwright');const fs=require('fs');
const FILE=process.argv[2],PORT=process.argv[3]||'8772',OLD=process.argv[4]||null,D=__dirname+'/pk2b_';
(async()=>{const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:process.env.PW_GPU?[]:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const R=[];const ok=(n,c,i='')=>{R.push(!!c);console.log((c?'PASS ':'FAIL ')+n+(i?'  '+i:''));};
async function page(file){const ctx=await b.newContext({viewport:{width:1024,height:768},hasTouch:true,isMobile:true});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push('PAGE '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|WebGL|GPU stall/.test(m.text()))errs.push('CON '+m.text().slice(0,200));if(m.type()==='warning'&&/Paket 2|Feldherren|Zeitenwende|Grenzmark|Thronstreit|Statthalter-Abfall/.test(m.text()))errs.push('WARN '+m.text().slice(0,200));});
  await p.addInitScript(()=>{try{localStorage.setItem('imperium.gfx',JSON.stringify({q:'leicht'}));}catch(e){}});
  await p.route(/cdnjs/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));
  await p.route(/fonts\.g/,r=>r.abort());await p.route(/\.html$/,r=>r.fulfill({body:fs.readFileSync(file),contentType:'text/html; charset=utf-8'}));
  await p.goto(`http://localhost:${PORT}/imperium.html`,{timeout:300000});await p.waitForFunction(()=>document.getElementById('loading').hidden,null,{timeout:300000});
  await p.waitForFunction(()=>!document.querySelector('#loading[data-gate]'),null,{timeout:120000}).catch(()=>{});return{p,errs,ctx};}
// Gemeinsamer Aufbau: Rom auf ~45 Provinzen, Runde 40
const SETUP=()=>{newGame('rom');loadGame(S);closeModal();const me=S.player;S.turn=40;S.fac[me].gold=5000;
  const caps=new Set(PLAYABLE.filter(f=>f!==me&&alive(f)).map(f=>capitalOf(f)));const seen=new Set(provsOf(me));let q=[...seen];
  while(q.length&&provsOf(me).length<45){const nq=[];for(const pi of q)for(const n of ADJ[pi]){if(seen.has(n)||!isAct(n)||isSeaLink(pi,n))continue;seen.add(n);if(caps.has(n))continue;S.prov[n].owner=me;S.prov[n].unrest=0;nq.push(n);if(provsOf(me).length>=45)break;}q=nq;}
  try{checkElimination();}catch(e){}refreshOwnership();refresh();S.pk1L=null;return provsOf(me).length;};
let OLDSAVE=null;
if(OLD){const {p,errs,ctx}=await page(OLD);OLDSAVE=await p.evaluate(SETUP=>{eval('('+SETUP+')')();for(let i=0;i<1;i++)try{endTurn();}catch(e){}return new Promise(z=>setTimeout(()=>{closeModal();z(JSON.stringify(S));},4000));},SETUP.toString());
  ok('Alter Spielstand (v186) erzeugt',OLDSAVE&&OLDSAVE.length>1000,OLDSAVE?OLDSAVE.length+' Zeichen':'');await ctx.close();}
const {p,errs}=await page(FILE);
await p.evaluate(()=>{window.picMsg=()=>{};try{RATV.set('on','aus');}catch(e){}});
const n0=await p.evaluate(SETUP=>eval('('+SETUP+')')(),SETUP.toString());ok('Aufbau',n0>=40,n0+' Provinzen');
// 1 Feldherr: Gefahr, Vorwarnung, Fenster
const f1=await p.evaluate(()=>{const me=S.player,cap=capitalOf(me),own=provsOf(me),far=own.filter(pi=>!isCapProv(pi)).sort((a,b)=>Math.hypot(PROV_DEF[b].lon-PROV_DEF[cap].lon,PROV_DEF[b].lat-PROV_DEF[cap].lat)-Math.hypot(PROV_DEF[a].lon-PROV_DEF[cap].lon,PROV_DEF[a].lat-PROV_DEF[cap].lat))[0];
  const a=createArmy(me,far,['spear','spear','sword','missile','cav','cav','spear'],1);const G=genOf(a);G.dd={w:8,d:2,c:1};fameRefresh(a);G.amb=75;G.loy=15;window._aid=a.id;
  fhRound();const td=todoItems().filter(x=>/pk2fh/.test(x.k)).map(x=>x.t);return{hon:G.hon,dist:Math.round(fhDist(a)*10)/10,pw:G.pw,q:S.pk2.q.length,td,loy:G.loy,line:genHtml(a,true).includes('data-pk2="fh:')};});
ok('Feldherr: Vorwarnung, Jetzt-wichtig, Karte',f1.pw!=null&&f1.q>=1&&f1.td.length&&f1.line,JSON.stringify(f1));
await p.evaluate(()=>{fhOpen(window._aid);});await p.waitForTimeout(800);await p.screenshot({path:D+'feldherr.jpg',quality:70});
const f1b=await p.evaluate(()=>{const t=document.querySelector('#dialog').innerText;closeModal();return{tri:/Triumphzug/.test(t),kalt:/Kaltstellen/.test(t),weg:/Wegschicken/.test(t),gew:/Gewähren lassen/.test(t)};});
ok('Feldherr: vier Entscheidungen',f1b.tri&&f1b.kalt&&f1b.gew,JSON.stringify(f1b));
// Ehren über das Fenster (Kosten + Wirkung)
const f1c=await p.evaluate(()=>{const a=getArmy(window._aid),G=a.gen,g0=S.fac[S.player].gold,l0=G.loy;fhOpen(a.id);const b=[...document.querySelectorAll('#dialog .pk2opt')].find(x=>/Triumph/.test(x.textContent));b.click();return{dg:g0-S.fac[S.player].gold,cost:fhTriCost(a),dl:Math.round(G.loy-l0),pw:G.pw,open:!document.getElementById('modal').hidden};});
ok('Feldherr: Triumph kostet Gold, Treue +30, Gefahr weg',f1c.dg===f1c.cost&&f1c.dl===30&&f1c.pw==null&&!f1c.open,JSON.stringify(f1c));
// A2: Feldherren bei Laune halten
const h1=await p.evaluate(()=>{const me=S.player,cap=capitalOf(me),own=provsOf(me),far=own.filter(pi=>!isCapProv(pi)&&!S.armies.some(x=>x.p===pi)).sort((a,b)=>Math.hypot(PROV_DEF[b].lon-PROV_DEF[cap].lon,PROV_DEF[b].lat-PROV_DEF[cap].lat)-Math.hypot(PROV_DEF[a].lon-PROV_DEF[cap].lon,PROV_DEF[a].lat-PROV_DEF[cap].lat))[1];
  const a=createArmy(me,far,['spear','spear','sword','missile','cav','cav'],1);const G=genOf(a);G.dd={w:6,d:1,c:1};fameRefresh(a);G.amb=55;G.loy=40;window._bid=a.id;try{dynOf(me);}catch(e){}
  const line=genHtml(a,true);fhOpen(a.id);const t=document.querySelector('#dialog').innerText;
  return{hon:G.hon,dyn:!!S.fac[me].dyn,btn:['fhg','fhl','fhh','fhe'].map(k=>line.includes('data-pk2="'+k+':')),gift:/Geschenk/.test(t),lg:/Landgut verleihen/.test(t),home:/Heimholen/.test(t),ein:/Einheirat/.test(t)&&/Thronanwärter/.test(t)};});
await p.waitForTimeout(700);await p.screenshot({path:D+'feldherr_neu.jpg',quality:72});
ok('Feldherr: vier neue Wege im Fenster und an der Heereskarte',h1.gift&&h1.lg&&h1.home&&h1.ein&&h1.btn.every(Boolean),JSON.stringify(h1));
const h2=await p.evaluate(()=>{closeModal();const me=S.player,a=getArmy(window._bid),G=a.gen,g0=S.fac[me].gold,l0=G.loy,c=fhGiftCost(a);fhAct('fhg',a.id);const r={dg:g0-S.fac[me].gold,c,dl:Math.round(G.loy-l0),gcd:G.gcd-S.turn};
  const g1=S.fac[me].gold;fhAct('fhg',a.id);r.again=g1-S.fac[me].gold;fhOpen(a.id);const b=[...document.querySelectorAll('#dialog .pk2opt')].find(x=>/^Geschenk/.test(x.querySelector('b').textContent));r.dis=b&&b.disabled;r.why=b&&b.innerText.slice(-30);closeModal();return r;});
ok('Geschenk: kostet Gold, Treue +10, 4 Runden Abklingzeit',h2.dg===h2.c&&h2.dl===10&&h2.gcd===4&&h2.again===0&&h2.dis,JSON.stringify(h2));
const h3=await p.evaluate(()=>{const me=S.player,a=getArmy(window._bid),G=a.gen,t0=fhTgt(a);const pi=lgPick(a),inc0=Math.round(provIncome(pi)*10)/10,ti0=income(me).tax!=null?income(me).tax:null;fhAct('fhl',a.id);
  const r={pi,name:PROV_DEF[pi].name,inc0,inc1:provIncome(pi),lg:G.lg===pi,dt:Math.round(fhTgt(a)-t0),html:/Landgut von/.test(lgHtml(pi))};const am=G.amb;fhRound();r.da=Math.round((G.amb-am)*10)/10;
  const js=JSON.stringify(S);loadGame(parseSave(js)||JSON.parse(js));closeModal();const b=getArmy(window._bid);r.load=lgOk(pi)&&provIncome(pi)===0&&b.gen.lg===pi;
  selProv(pi);r.panel=(document.querySelector('#sheet')||document.body).innerHTML.includes('Landgut von');
  return r;});
ok('Landgut: Provinz zahlt nichts, Treue-Ziel +15, Ehrgeiz sinkt, Anzeige, Laden',h3.lg&&h3.inc0>0&&h3.inc1===0&&h3.dt===15&&h3.html&&h3.load&&h3.panel&&h3.da<0,JSON.stringify(h3));
await p.waitForTimeout(400);await p.screenshot({path:D+'landgut_provinz.jpg',quality:70});
const h4=await p.evaluate(()=>{const me=S.player,a=getArmy(window._bid),cap=capitalOf(me),p0=a.p;a.mp=maxMP(a);fhAct('fhh',a.id);const r={goal:a.goal===cap||fhHome(a),moved:a.p!==p0};
  // Treue erholt sich daheim doppelt so schnell
  a.p=cap;a.goal=null;a.pos=null;const G=a.gen;G.loy=20;const tg=fhTgt(a);fhRound();r.dl=Math.round((G.loy-20)*10)/10;r.exp=Math.round((tg-20)*0.2*10)/10;r.home=fhHome(a);return r;});
ok('Heimholen: Marschziel Hauptstadt, Treue erholt sich doppelt',h4.goal&&h4.home&&Math.abs(h4.dl-h4.exp)<=0.2,JSON.stringify(h4));
const h5=await p.evaluate(()=>{const me=S.player,a=getArmy(window._bid),G=a.gen,D=dynOf(me);const k=orName(newPerson('m',40),me);k.tr=['kriegerisch','weise'];k.rel='Neffe';D.kin.push(k);D.regent=null;
  const x0=dynRival(me),n0=pk2ThronN(me),g0=S.fac[me].gold,c=fhEinCost(a);fhAct('fhe',a.id);const txt=document.querySelector('#dialog').innerText;const b=[...document.querySelectorAll('#dialog .actions .btn')].find(x=>/Einheiraten/.test(x.textContent));b.click();
  const x1=dynRival(me);D.kin=D.kin.filter(y=>y!==k);return{warn:/Thronanwärter/.test(txt),dg:g0-S.fac[me].gold,c,fam:G.fam,ein:G.ein!=null,loy:G.loy,p0:x0&&x0.p,p1:x1&&x1.p,n0,n1:pk2ThronN(me),line:/Thronanwärter/.test(genHtml(a,true)),dang:fhDanger(a)};});
ok('Einheirat: Warnung, Kosten, Familie, Thronstreit wahrscheinlicher und größer',h5.warn&&h5.dg===h5.c&&h5.ein&&h5.fam&&h5.p1>h5.p0&&h5.n1===Math.min(9,h5.n0+1)&&h5.line&&!h5.dang,JSON.stringify(h5));
await p.evaluate(()=>{for(let i=0;i<3;i++)closeModal();});
// Kaltstellen beendet das Landgut
const h6=await p.evaluate(()=>{const me=S.player,a=getArmy(window._bid),pi=a.gen.lg;fhNewGen(a,a.gen);lgRound();return{pi,lgA:S.prov[pi].lgA,inc:provIncome(pi)};});
ok('Landgut fällt zurück, wenn der Feldherr abgelöst wird',h6.lgA==null&&h6.inc>0,JSON.stringify(h6));
// B: Schwerpunkt je Epoche
const e1=await p.evaluate(()=>{const e0=S.epoch,d0=S.diff,et=S.epochTurn,r={};const g=e=>{S.epoch=e;return{amb:epF('amb'),put:Math.round(fhPutschP()*100),dang:epA('dang'),vm:epF('vm'),mig:epF('mig'),inv:epF('inv'),gov:epF('gov'),thr:epF('thr'),dul:epA('dul'),stand:epF('stand'),vmBad:vmBad()};};
  for(let e=0;e<5;e++)r['e'+e]=g(e);S.diff=0;r.leicht0=g(0);r.leicht4=g(4);S.diff=d0;S.epoch=0;S.epochTurn=S.turn-2;r.todo=todoItems().some(x=>x.k==='epfoc');epFocusOpen();r.modal=/drohen vor allem/.test(document.querySelector('#dialog').innerText);closeModal();r.news=/Was diese Zeit prägt/.test(epFocusHtml());
  S.epochTurn=S.turn-20;r.todoOld=todoItems().some(x=>x.k==='epfoc');S.epoch=e0;S.epochTurn=et;S.mp=true;r.mp=epF('amb');S.mp=false;return r;});
ok('Schwerpunkt: Tabelle wirkt je Epoche, Leicht halb, Hinweis und Fenster',e1.e0.amb===1.5&&e1.e0.put===65&&e1.e1.inv===1.15&&e1.e1.vm===1.3&&e1.e2.gov===1.35&&e1.e2.thr===1.4&&e1.e3.dul===0.35&&e1.e4.vmBad===30&&e1.e4.put===60&&e1.leicht0.amb===1.25&&e1.leicht0.put===29&&e1.leicht4.vmBad===27.5&&e1.todo&&e1.modal&&e1.news&&!e1.todoOld&&e1.mp===1,JSON.stringify(e1));
// Putsch erzwingen
const f2=await p.evaluate(()=>{const me=S.player,a=getArmy(window._aid),G=a.gen;G.loy=10;G.triT=-99;G.pw=S.turn;G.pcd=null;const r0=Math.random;Math.random=()=>0.01;const lc0=(pk1L().c||0);let x;try{fhRound();}finally{Math.random=r0;}
  const sl=Object.keys(S.pk2.R).find(f=>S.pk2.R[f].k==='feld'&&alive(f));if(!sl)return{err:'kein Reich',log:S.log.slice(-3).map(e=>e.t||e)};
  return{sl,name:FACTIONS[sl].name,ps:provsOf(sl).length,army:S.armies.some(x=>x.f===sl&&x.gen&&x.gen.n===G.n),war:atWar(me,sl),lc:(pk1L().c||0)-lc0,force:pk1Force(sl),q:S.pk2.q.map(x=>x.k),cul:facCul(sl)===facCul(me)};});
ok('Putsch: eigenes Reich mit seinem Heer, Krieg, zählt zur Grenze',f2.sl&&f2.army&&f2.war&&f2.lc===f2.ps&&f2.force,JSON.stringify(f2));
// Entscheidung nach Abfall im echten Ereignisfenster
await p.evaluate(()=>{window._done=0;S.pk2.q=S.pk2.q.filter(x=>x.k==='sec');pk2RunQ(()=>{window._done=1;});});await p.waitForTimeout(1200);await p.screenshot({path:D+'abfall.jpg',quality:70});
const f3=await p.evaluate(()=>{const t=document.querySelector('#dialog').innerText;const bs=[...document.querySelectorAll('#dialog .evopt')];const v=bs.find(b=>/Vasall/.test(b.textContent));
  const sl=Object.keys(S.pk2.R).find(f=>S.pk2.R[f].k==='feld');const r={has:/Bestechen/.test(t)&&/Vasall/.test(t)&&/Zurückholen/.test(t),txt:t.slice(0,160)};
  if(v)v.click();return Object.assign(r,{vas:dip(S.player,sl).vas===sl,war:atWar(S.player,sl)});});
ok('Abfall-Entscheidung: Bestechen/Vasall/Zurückholen, Vasall wirkt',f3.has&&f3.vas&&!f3.war,JSON.stringify(f3));
await p.evaluate(()=>{for(let i=0;i<4;i++)closeModal();});
// 2a Thronstreit
const t1=await p.evaluate(()=>{const me=S.player,D=dynOf(me);const k=orName(newPerson('m',40),me);k.tr=['kriegerisch','weise'];k.rel='Vetter';D.kin.push(k);D.ruler.age=66;D.ruler.tr=[];
  const td=todoItems().filter(x=>x.k==='pk2thr').map(x=>x.t);pk2ThronOpen();const mt=document.querySelector('#dialog').innerText.slice(0,120);
  return{td,mt,room:pk2Room(),n:pk2ThronN(me)};});
await p.screenshot({path:D+'thronwarnung.jpg',quality:70});
ok('Thronstreit: Vorwarnung + Fenster',t1.td.length&&/wartet/.test(t1.mt),JSON.stringify(t1));
const t2=await p.evaluate(()=>{closeModal();const me=S.player,D=dynOf(me),k=D.kin[D.kin.length-1];const n0=provsOf(me).length,lc0=pk1L().c||0;const ps=dynRevolt(me,k);
  const sl=Object.keys(S.pk2.R).find(f=>S.pk2.R[f].k==='pret'&&alive(f));return{n0,ps:ps&&ps.length,sl,name:sl&&FACTIONS[sl].name,lc:(pk1L().c||0)-lc0,pret:!!D.pret,army:S.armies.filter(a=>a.f===sl).reduce((s,a)=>s+a.units.length,0),room:pk2Room(),max:pk2Max(),L:pk1L()};});
ok('Thronstreit: Gegenkönig als Reich, mehr als 3 Provinzen bei großem Reich, Heer',t2.sl&&t2.ps>=3&&t2.army>=3&&t2.lc===t2.ps,JSON.stringify(t2));
// Bestechen
const t3=await p.evaluate(()=>{const me=S.player,sl=Object.keys(S.pk2.R).find(f=>S.pk2.R[f].k==='pret'&&alive(f));const E=pk2SecEv(sl),c=E.opts[0].cost(),g0=S.fac[me].gold,n=provsOf(sl).length,lc0=pk1L().c;S.fac[me].gold-=c;E.opts[0].fx(me,{});
  return{c,back:provsOf(sl).length===0,alive:alive(sl),lc:lc0-pk1L().c,n};});
ok('Bestechen: Land zurück, Verlust zurückgebucht',t3.back&&!t3.alive&&t3.lc===t3.n,JSON.stringify(t3));
// 2b Statthalter
const g1=await p.evaluate(()=>{const me=S.player,cap=capitalOf(me),cr=PROV_DEF[cap].reg;const regs={};for(const pi of provsOf(me)){const r=PROV_DEF[pi].reg;if(r!==cr)regs[r]=(regs[r]||0)+1;}
  const reg=Object.keys(regs).sort((a,b)=>regs[b]-regs[a])[0];const own=REG[reg].provs.filter(pi=>S.prov[pi].owner===me);S.armies=S.armies.filter(a=>!(a.f===me&&own.includes(a.p)));
  govsOf(me)[reg]={n:'Gnaeus Piso',s:2,t:'streng',face:0,dir:'grow',auto:true,since:S.turn};const G=govMigrate(govsOf(me)[reg]);G.loy=5;G.amb=90;G.warn=S.turn;S.turn=Math.max(S.turn,31);
  const r0=Math.random;Math.random=()=>0.01;const lc0=pk1L().c||0;try{govPerson(me,reg,G,own,true);}finally{Math.random=r0;}
  const sl=Object.keys(S.pk2.R).find(f=>S.pk2.R[f].k==='gov'&&alive(f));return{reg,n:own.length,sl,name:sl&&FACTIONS[sl].name,ps:sl&&provsOf(sl).length,lc:(pk1L().c||0)-lc0,room:pk2Room(),gone:!govOf(me,reg)};});
ok('Statthalter: nimmt Region als Reich mit',g1.sl&&g1.ps>=1&&g1.lc===g1.ps&&g1.gone,JSON.stringify(g1));
// Verlustgrenze: bei erschöpftem Rahmen keine weiteren Verluste
const g2=await p.evaluate(()=>{const L=pk1L(),me=S.player;const was=L.c;L.c=pk2Max();const k=orName(newPerson('m',40),me);k.tr=['kriegerisch'];dynOf(me).kin.push(k);const n0=provsOf(me).length;dynRevolt(me,k);const n1=provsOf(me).length;L.c=was;return{n0,n1,cap:pk1Cap()};});
ok('Verlustgrenze 20 %: Thronstreit ohne Landverlust',g2.n0===g2.n1,JSON.stringify(g2));
// 2c Zeitenwende
const u1=await p.evaluate(()=>{const me=S.player;for(const r in govsOf(me))delete govsOf(me)[r];for(const pi of provsOf(me))if(!isCapProv(pi)){S.prov[pi].unrest=6;}S.pk1L=null;
  S.epReady=true;pk2UmbRound();const U=S.pk2.umb;const L=pk2UmbRegs();const td=todoItems().filter(x=>x.k==='pk2umb').length;pk2UmbOpen();return{U,L:L.length,td,txt:document.querySelector('#dialog').innerText.slice(0,100)};});
await p.screenshot({path:D+'zeitenwende.jpg',quality:70});
ok('Zeitenwende: Ankündigung, Hinweis, Fenster',u1.U&&u1.L>=1&&u1.td===1,JSON.stringify(u1));
const u2=await p.evaluate(()=>{closeModal();const me=S.player;const e0=ep();S.turn+=2;const r0=Math.random;let gone;Math.random=()=>0.01;try{doEpoch();}catch(e){Math.random=r0;return{err:e.message};}Math.random=r0;
  const U=S.pk2.umb;const a={e:ep()-e0,due:U.due,done:U.done};S.turn=U.due;Math.random=()=>0.01;try{pk2UmbRound();}finally{Math.random=r0;}
  const sl=Object.keys(S.pk2.R).filter(f=>S.pk2.R[f].k==='umb'&&alive(f));return Object.assign(a,{done2:U.done,sl:sl.map(f=>FACTIONS[f].name+':'+provsOf(f).length),L:pk1L()});});
ok('Zeitenwende: Prüfung frühestens 5 Runden nach Ankündigung, höchstens 2 Regionen',u2.e===1&&u2.due!=null&&u2.done2&&u2.sl.length>=1&&u2.sl.length<=2,JSON.stringify(u2));
await p.evaluate(()=>{for(let i=0;i<4;i++)closeModal();S.pk2.q=[];});
// E Grenzmark
const m1=await p.evaluate(()=>{const me=S.player;S.fac[me].gold=5000;const pi=provsOf(me).find(x=>markCan(x).ok);if(pi==null)return{err:'keine Grenzprovinz'};window._mpi=pi;
  const inc0=provIncome(pi),ac0=adminCap(me),up0=income(me).upk;selProv(pi);const panel=(document.querySelector('#sheet')||document.body).innerHTML.includes('data-pk2="mk:');
  markOpen(pi);const txt=document.querySelector('#dialog').innerText;return{pi,inc0,ac0,up0,panel,txt:/Bringt/.test(txt)&&/Kostet/.test(txt)};});
await p.screenshot({path:D+'grenzmark_angebot.jpg',quality:70});
const m2=await p.evaluate(()=>{const me=S.player,pi=window._mpi;const b=[...document.querySelectorAll('#dialog .actions .btn')].find(x=>/Ansiedeln/.test(x.textContent));b.click();const M=S.prov[pi].mark;const a=M&&getArmy(M.aid);MARK_C.t=-1;
  return{M:!!M,inc:provIncome(pi),ac:adminCap(me),army:a&&a.units.length,levy:a&&a.levy,upk:income(me).upk};});
ok('Grenzmark: Heer ohne Sold, keine Steuern, Verwaltungsgrenze +1',m2.M&&m2.inc===0&&m2.army>=4&&m2.ac===m1.ac0+1&&m2.upk===m1.up0,JSON.stringify([m1,m2]));
await p.evaluate(()=>{closeModal();selProv(window._mpi);});await p.waitForTimeout(600);await p.screenshot({path:D+'grenzmark_provinz.jpg',quality:70});
const m3=await p.evaluate(()=>{const me=S.player,pi=window._mpi,M=S.prov[pi].mark;M.loy=10;M.pay=0;S.fac[me].gold=-10;markRound();const w=M.w;S.fac[me].gold=5000;S.turn=M.w;const r0=Math.random;Math.random=()=>0.01;try{markRound();}finally{Math.random=r0;}
  const sl=Object.keys(S.pk2.R).find(f=>S.pk2.R[f].k==='fod'&&alive(f));return{w,sl,owner:S.prov[pi].owner,name:sl&&FACTIONS[sl].name,arm:S.armies.some(a=>a.f===sl&&a.units.length>=4)};});
ok('Föderatenaufstand mit Vorwarnung: Provinz + Heer als Reich',m3.w!=null&&m3.sl&&m3.owner===m3.sl&&m3.arm,JSON.stringify(m3));
// Wanderzug-Ereignis: dritte Wahl
const m4=await p.evaluate(()=>{const me=S.player,pi=provsOf(me).find(x=>markCan(x).ok);if(pi==null)return{err:'keine'};S.fac[me].migQ=[{pi,folk:'Goten'}];const L=migEvents(me);return{n:L.length,opts:L[0]&&L[0].E.opts.map(o=>o.label)};});
ok('Wanderzug: „Als Grenzmark ansiedeln“',m4.opts&&m4.opts.includes('Als Grenzmark ansiedeln'),JSON.stringify(m4));
// Runden laufen lassen (echtes endTurn, Ereignisse automatisch erste Wahl)
const r1=await p.evaluate(async()=>{window.showEvent=(E,ctx,next)=>{try{E.opts[0].fx(S.player,ctx);}catch(e){console.error('ev '+e.message);}next&&next();};const t0=S.turn;
  for(let i=0;i<3;i++){const t=S.turn;try{endTurn();}catch(e){return'ERR '+e.message;}for(let k=0;k<60&&S.turn===t;k++)await new Promise(z=>setTimeout(z,300));await new Promise(z=>setTimeout(z,500));for(let j=0;j<4;j++)closeModal();}
  return'ok '+(S.turn-t0)+' Runden';});
ok('3 Runden mit neuen Reichen',/^ok 3/.test(r1),r1);
// Speichern/Laden: Namen der neuen Reiche bleiben
const s1=await p.evaluate(()=>{const names=Object.keys(S.pk2.R).filter(alive).map(f=>[f,FACTIONS[f].name]);const js=JSON.stringify(S);resetPeople();loadGame(parseSave(js)||JSON.parse(js));closeModal();
  return{names,after:names.map(([f])=>FACTIONS[f].name),ok:names.every(([f,n])=>FACTIONS[f].name===n),q:typeof S.pk2.q};});
ok('Speichern/Laden: neue Reiche behalten Namen',s1.names.length&&s1.ok,JSON.stringify(s1));
if(OLDSAVE){const o1=await p.evaluate(async js=>{try{const s=parseSave(js);if(!s)return'parse fehlgeschlagen';loadGame(s);closeModal();const t=S.turn;endTurn();for(let k=0;k<60&&S.turn===t;k++)await new Promise(z=>setTimeout(z,300));await new Promise(z=>setTimeout(z,500));for(let j=0;j<4;j++)closeModal();
  const a=S.armies.find(a=>a.f===S.player);let g='';if(a){a.gen.hon=1;g=genHtml(a,true).includes('data-pk2')?'Feldherrnzeile':'ohne';}return'ok T'+S.turn+' '+g+' pk2:'+typeof S.pk2;}catch(e){return'ERR '+e.message;}},OLDSAVE);
  ok('Alter Spielstand lädt und läuft eine Runde',/^ok/.test(o1),o1);}
ok('Keine Seiten-/Konsolenfehler',!errs.length,errs.slice(0,6).join(' | '));
console.log(`PK2 ${R.filter(Boolean).length}/${R.length}`);await b.close();})();
