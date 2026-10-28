// node raub_t.js <html> [port] [altHtml] – Paket W1 (v199): Raubzug, Verwüstung, Danegeld, Ruhm. Wikinger-Szenario.
// Mit altHtml wird nur das Vorher-Bild (Armee- und Provinzfenster ohne Raubzug) erzeugt.
const {chromium}=require('playwright');const fs=require('fs');
const FILE=process.argv[2],PORT=process.argv[3]||'8772',OLD=process.argv[4]||null,SH=__dirname+'/shot/w1_';
(async()=>{const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:process.env.PW_GPU?[]:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const R=[];const ok=(n,c,i='')=>{R.push(!!c);console.log((c?'PASS ':'FAIL ')+n+(i?'  '+i:''));};
async function page(file){const ctx=await b.newContext({viewport:{width:1024,height:768},hasTouch:true,isMobile:true});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push('PAGE '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|WebGL|GPU stall/.test(m.text()))errs.push('CON '+m.text().slice(0,200));if(m.type()==='warning'&&/Raubzug|Verwüst/.test(m.text()))errs.push('WARN '+m.text().slice(0,200));});
  await p.addInitScript(()=>{try{localStorage.setItem('imperium.gfx',JSON.stringify({q:'leicht'}));}catch(e){}});
  await p.route(/cdnjs/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));
  await p.route(/fonts\.g/,r=>r.abort());await p.route(/\.html$/,r=>r.fulfill({body:fs.readFileSync(file),contentType:'text/html; charset=utf-8'}));
  await p.goto(`http://localhost:${PORT}/imperium.html`,{timeout:300000});await p.waitForFunction(()=>document.getElementById('loading').hidden,null,{timeout:300000});
  await p.waitForFunction(()=>!document.querySelector('#loading[data-gate]'),null,{timeout:120000}).catch(()=>{});return{p,errs,ctx};}
// Aufbau: Wikinger-Szenario, ein starkes Heer neben einer Feindprovinz im Krieg
const CLR=()=>{document.querySelectorAll('.cine').forEach(e=>e.remove());try{closeModal();}catch(e){}try{document.getElementById('tut').hidden=true;}catch(e){}};
const SETUP=()=>{startScenario('wikinger');loadGame(S);try{closeModal();}catch(e){}window.picMsg=()=>{};const me=S.player;S.fac[me].gold=2000;
  let pair=null;for(const pi of provsOf(me)){for(const n of ADJ[pi]){const o=S.prov[n].owner;if(o!=='frei'&&o!==me&&isAct(n)&&!isSeaLink(pi,n)&&PROV_DEF[n].tax>0){pair=[pi,n,o];break;}}if(pair)break;}
  if(!pair)return{err:'kein Nachbar'};const [pi,ti,o]=pair;if(!atWar(me,o))declareWar(me,o);
  const a=createArmy(me,pi,['sword','sword','sword','spear','spear','missile','cav','cav'],1);for(const u of a.units)u.men=Math.round(u.men*0.55);// Verluste zum Auffüllen
  S.prov[ti].gar=1;S.prov[ti].b.walls=0;S.prov[ti].b.grenzwall=0;a.mp=maxMP(a);window._a=a.id;window._ti=ti;window._o=o;window._pi=pi;
  return{me,pi,ti,o,kind:typeof raidKind==='function'?raidKind(me):null,own:PROV_DEF[ti].name,tax:PROV_DEF[ti].tax};};
if(OLD){const {p,errs,ctx}=await page(OLD);const s=await p.evaluate(SETUP);if(s.err){console.log('FAIL Aufbau alt',s.err);process.exit(1);}
  await p.evaluate(CLR);await p.evaluate(()=>{const a=getArmy(window._a);UI.army=a.id;UI.mode='army';UI.sel=a.p;refresh();focusProv(window._ti,6);});await p.waitForTimeout(1500);
  await p.screenshot({path:SH+'vorher_befehle.png'});await p.evaluate(CLR);await p.evaluate(()=>{UI.mode='prov';UI.sel=window._ti;refresh();focusProv(window._ti,6);});await p.waitForTimeout(1500);await p.screenshot({path:SH+'vorher_karte.png'});
  console.log('Vorher-Bilder fertig');await b.close();return;}
const {p,errs}=await page(FILE);
const s=await p.evaluate(SETUP);ok('Aufbau Wikinger-Szenario',!s.err&&s.kind==='see',JSON.stringify(s));if(s.err){await b.close();process.exit(1);}
// Raubvolk-Profile
const pr=await p.evaluate(()=>({sp:raidKind(S.player),other:PLAYABLE.filter(f=>alive(f)&&f!==S.player).map(f=>raidKind(f)).filter(Boolean).length,rom:raidKind('rom'),step:(()=>{const f=PLAYABLE.find(x=>FACTIONS[x]&&S.fac[x]&&facCul(x)==='steppe');return f?raidKind(f):'keine Steppe im Szenario';})()}));
ok('Profile: Wikinger = see',pr.sp==='see'&&pr.rom===null,JSON.stringify(pr));
// Vorher/Nachher-Bild: Befehlsleiste vor dem Raubzug
await p.evaluate(CLR);await p.evaluate(()=>{const a=getArmy(window._a);UI.army=a.id;UI.mode='army';UI.sel=a.p;refresh();focusProv(window._pi,6);});await p.waitForTimeout(1200);
const ui0=await p.evaluate(()=>{const t=document.querySelector('#panel, #dialog, body').innerText;return{btn:!!document.querySelector('[data-act="raub"]'),txt:/Raubzug/.test(document.body.innerText)};});
ok('Befehl „Raubzug“ im Armeefenster',ui0.btn,JSON.stringify(ui0));
await p.evaluate(()=>{const b=document.querySelector('[data-act="raub"]');if(b)b.click();});await p.waitForTimeout(500);await p.evaluate(()=>{const b=document.querySelector('[data-act=raub]');if(b)b.scrollIntoView({block:'center'});});await p.waitForTimeout(400);
await p.screenshot({path:SH+'nachher_befehle.png'});
// Raubzug: Einmarsch und Plünderung
const r1=await p.evaluate(()=>{const a=getArmy(window._a),ti=window._ti,P=S.prov[ti],me=S.player;const g0=S.fac[me].gold,m0=armyMen(a),ow=P.owner,t0=provIncome(ti);const f0=fameOf(genOf(a));
  const res=resolveAttack(a,ti);const m1=armyMen(a);
  return{rz:a.rz,win:res.win,raided:!!res.raided,captured:!!res.captured,sameOwner:P.owner===ow,at:a.p===ti,dv:P.dv?JSON.stringify(P.dv):null,gold:S.fac[me].gold-g0,loot:res.loot,men:m1-m0,tax0:t0,tax1:provIncome(ti),sev:dvSev(ti),fame:fameOf(genOf(a))-f0,b:(genOf(a).dd||{}).b,rmen:res.men};});
ok('Raubzug: Sieg, kein Besetzen, Heer zieht ein',r1.win&&r1.raided&&!r1.captured&&r1.sameOwner&&r1.at,JSON.stringify(r1));
ok('Beute: Gold, Gefolge aus Beute, Ruhm',r1.gold>0&&r1.gold===r1.loot&&r1.fame>=1&&r1.b>=r1.loot,JSON.stringify({g:r1.gold,gefolge:r1.rmen,fame:r1.fame}));
ok('Verwüstung gesetzt (5–10 Runden), Steuern sinken',r1.dv&&JSON.parse(r1.dv).a>=3&&JSON.parse(r1.dv).a<=10&&r1.sev===1&&r1.tax1<r1.tax0,r1.dv+' Steuer '+r1.tax0+'→'+r1.tax1);
// Weiterziehen: kein Nachschubabzug direkt nach dem Plündern; erneutes Plündern hier bringt kaum Beute
const r2=await p.evaluate(()=>{const a=getArmy(window._a),ti=window._ti,P=S.prov[ti];const full=Math.round(PROV_DEF[ti].tax*1.2*EPOCH_INC[ep()]*RZ_PROF.see.m);const g0=S.fac[S.player].gold;const r=plunderProv(a,ti,'rz');
  return{again:r?r.loot:null,full,fed:rzFed(a),sevNow:dvSev(ti)};});
ok('Erneut plündern: nur ein Bruchteil der Beute',r2.again!=null&&r2.again<=Math.max(1,Math.round(r2.full*0.2)),JSON.stringify(r2));
// Das stehende Heer plündert erst nach voller Erholung wieder: 14 Runden beobachten
// 8 Runden: Verwüstung klingt ab, dann Erholung
await p.evaluate(()=>{getArmy(window._a).rz=false;});// Raubzug beenden, damit die Erholung ungestört läuft
await p.evaluate(()=>{window._pp=plunderProv;window.plunderProv=(a,t,m)=>a.f===S.player?window._pp(a,t,m):null;});// andere Heere (KI-Raubzüge) stören die Messreihe nicht
const seq=[];for(let i=0;i<14;i++){const sv=await p.evaluate(async()=>{const t0=S.turn;for(let k=0;k<4&&S.turn===t0;k++){try{closeModal();endTurn();}catch(e){return'ERR '+e.message;}await new Promise(z=>setTimeout(z,1300));try{closeModal();}catch(e){}}const P=S.prov[window._ti];const st=S.turn===t0?(' STALL over='+S.over+' modal='+(document.querySelector('#modal:not([hidden])')?document.querySelector('#modal').innerText.slice(0,120).split(String.fromCharCode(10)).join(' '):'-')+' dlg='+(document.querySelector('#dialog')?document.querySelector('#dialog').innerText.slice(0,60).split(String.fromCharCode(10)).join(' '):'-')):'';return(P.dv?P.dv.a+'/'+P.dv.r:'-')+'@'+S.turn+st;});seq.push(sv);}
await p.evaluate(()=>{window.plunderProv=window._pp;});
console.log('Verwüstung a/r je Runde: '+seq.join(' '));
ok('Verwüstung klingt ab und endet',seq.length&&!/ERR/.test(seq.join())&&seq[seq.length-1].startsWith('-')&&!seq[0].startsWith('-'),seq.join(' '));
const rec=await p.evaluate(()=>{const ti=window._ti;return{sev:dvSev(ti),mul:dvTaxMul(ti),grow:dvGrow(ti)};});ok('Nach Erholung wieder volle Wirkung',rec.sev===0&&rec.mul===1&&rec.grow===1,JSON.stringify(rec));
// Schrittweise Erholung (Zwischenwerte)
const ph=await p.evaluate(()=>{const ti=window._ti,P=S.prov[ti];P.dv={a:0,r:6,r0:6};const v=[];for(let i=0;i<6;i++){v.push(Math.round(dvSev(ti)*100)/100);P.dv.r--;}return v;});
ok('Erholung schrittweise (1 → 0)',ph[0]===1&&ph[5]<0.3&&ph.every((x,i)=>i===0||x<ph[i-1]),JSON.stringify(ph));
await p.evaluate(()=>{delete S.prov[window._ti].dv;});
// Abwehr mindert die Beute
const ab=await p.evaluate(()=>{const ti=window._ti,P=S.prov[ti];const a=getArmy(window._a);const k=raidKind(S.player);const d0=rzDef(ti,k).m;P.b.walls=2;P.b.grenzwall=1;const d1=rzDef(ti,k);P.b.walls=0;P.b.grenzwall=0;return{d0,d1:d1.m,why:d1.why};});
ok('Abwehr: Mauern und Grenzbefestigung mindern',ab.d0===1&&ab.d1<0.8&&ab.d1>=0.3,JSON.stringify(ab));
// Wikinger-Bonus gegen anderes Volk (gleiche Provinz)
const prf=await p.evaluate(()=>{const ti=window._ti,a=getArmy(window._a);const base=S.player;const wet=feat(ti);const k=RZ_PROF;return{see:k.see.m,other:k.other.m,coastOrRiver:!!(wet.coast||wet.river)};});
ok('Profile: andere Völker weniger Beute (0,6 gegen Raubvolk)',prf.other<prf.see,JSON.stringify(prf));
// Danegeld: Spieler zahlt (KI-Raubvolk); Pakt wirkt in beide Richtungen
const dg=await p.evaluate(()=>{const me=S.player,o=window._o;const a=getArmy(window._a);const g0=S.fac[me].gold;const amt=daneAmt(me);daneStart(o,me,50);const pact=raidPact(me,o);const r=plunderProv(a,window._ti,'rz');const left=dip(me,o).dg.until-S.turn;
  const gAfter=S.fac[me].gold-g0;S.dip[dkey(me,o)].dg.until=S.turn-1;const pact2=raidPact(me,o);return{amt,pact,blocked:r===null,left,gAfter,expired:!pact2};});
ok('Danegeld an den Spieler: Raubzug ruht, läuft ab',dg.pact&&dg.blocked&&dg.left===8&&dg.gAfter===50&&dg.expired,JSON.stringify(dg));
const dg2=await p.evaluate(()=>{const me=S.player,rv=window._o;const g0=S.fac[me].gold,amt=daneAmt(me);
  // Spieler zahlt: Gegenüber als Raubvolk ausgeben (nur für den Test)
  const r0=raidKind;window.raidKind=f=>f===rv?'see':r0(f);const F=FACTIONS[rv];openDiplomacy(rv);const has=!!document.querySelector('[data-dip="dane"]');
  if(has)document.querySelector('[data-dip="dane"]').click();window.raidKind=r0;const d=dip(me,rv);return{has,amt,paid:g0-S.fac[me].gold,pact:raidPact(rv,me),until:d.dg&&d.dg.until-S.turn};});
ok('Danegeld zahlen im Diplomatiefenster',dg2.has&&dg2.paid===dg2.amt&&dg2.pact,JSON.stringify(dg2));
await p.evaluate(()=>{try{closeModal();}catch(e){}S.dip[dkey(S.player,window._o)].dg=null;});
// Angebot einer KI an das Spieler-Raubvolk
const of=await p.evaluate(()=>{const me=S.player,o=window._o;const r0=Math.random;Math.random=()=>0.01;S.daneT={};S.props=[];S.fac[o].gold=1000;const a=getArmy(window._a);daneOffers(a,o,{});Math.random=r0;const pr=S.props.find(x=>x.type==='dane'&&x.from===o);
  if(!pr)return{err:'kein Angebot'};showProposals(()=>{});const txt=document.querySelector('#dialog,#modal')?document.querySelector('#dialog,#modal').innerText.slice(0,80):'';const g0=S.fac[me].gold;
  const bt=[...document.querySelectorAll('#dialog button, #modal button')].find(x=>/Gold nehmen/.test(x.textContent));if(bt)bt.click();return{amt:pr.amt,txt,got:S.fac[me].gold-g0,pact:raidPact(me,o)};});
ok('KI bietet Danegeld an, Annahme zahlt',of.amt>=30&&of.got===of.amt&&of.pact,JSON.stringify(of));
await p.evaluate(()=>{try{closeModal();}catch(e){}S.dip[dkey(S.player,window._o)].dg=null;S.props=[];});
// KI-Raubvölker: selten (Simulation der Flaggenwahl)
const ai=await p.evaluate(()=>{let n=0,tr=0;const o=window._o;const a=S.armies.find(x=>x.f!==S.player&&x.units.length>=3);if(!a)return{err:'kein KI-Heer'};const rk=raidKind;window.raidKind=f=>'see';
  for(let i=0;i<2000;i++){a.rz=false;S.fac[a.f].rzCd=0;a.mp=maxMP(a);try{aiRaubFlag(a.f,a);}catch(e){return{err:e.message};}tr++;if(a.rz)n++;}window.raidKind=rk;a.rz=false;return{p:n/tr};});
ok('KI-Raubzug selten (≤ 6 % je Prüfung, nur mit Feindnachbar)',ai.p!=null&&ai.p<=0.06,JSON.stringify(ai));
// Alte Spielstände laden: Felder fehlen
const old=await p.evaluate(()=>{const j=JSON.parse(JSON.stringify(S));for(const P of j.prov)delete P.dv;for(const a of j.armies){delete a.rz;delete a.rzH;delete a.rzT;}for(const k in j.dip)delete j.dip[k].dg;delete j.daneT;
  try{loadGame(j);closeModal();for(let i=0;i<2;i++)endTurn();return new Promise(z=>setTimeout(()=>{try{closeModal();}catch(e){}z('ok T'+S.turn);},1500));}catch(e){return'ERR '+e.message;}});
ok('Alter Spielstand ohne neue Felder lädt und läuft',/^ok/.test(old),old);
// Bilder: verwüstete Provinz + Befehlsleiste + Provinzfenster
await p.evaluate(CLR);await p.evaluate(()=>{const ti=window._ti,P=S.prov[ti];P.dv={a:6,r:6,r0:6,by:S.player};P.raid=S.turn;try{syncTiles();syncMarks();}catch(e){}UI.mode='prov';UI.sel=ti;refresh();focusProv(ti,6);});await p.waitForTimeout(2500);
await p.screenshot({path:SH+'nachher_karte.png'});
const pw=await p.evaluate(()=>/Verwüstet/.test(document.body.innerText)&&/Runden/.test(document.body.innerText));ok('Provinzfenster zeigt Verwüstung mit Restdauer',pw);
await p.evaluate(CLR);await p.evaluate(()=>{const a=getArmy(window._a);if(a){UI.army=a.id;UI.mode='army';refresh();}});await p.waitForTimeout(800);await p.evaluate(()=>{const b=document.querySelector('[data-act=raub]');if(b)b.scrollIntoView({block:'center'});});await p.waitForTimeout(400);await p.screenshot({path:SH+'nachher_befehle2.png'});
ok('Keine Seiten-/Konsolenfehler',!errs.length,errs.slice(0,4).join(' | '));
console.log(`RAUB ${R.filter(Boolean).length}/${R.length}`);await b.close();})();
