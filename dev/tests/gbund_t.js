// node gbund_t.js <html> [port] – Glaubensbund
const {chromium}=require('playwright');const fs=require('fs');
const FILE=process.argv[2],PORT=process.argv[3]||'8772';
(async()=>{const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:process.env.PW_GPU?[]:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:1024,height:768},hasTouch:true,isMobile:true});const p=await ctx.newPage();const errs=[];
p.on('pageerror',e=>errs.push('PAGE '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|WebGL|GPU stall/.test(m.text()))errs.push('CON '+m.text().slice(0,160));});
await p.addInitScript(()=>{try{localStorage.setItem('imperium.gfx',JSON.stringify({q:'leicht'}));}catch(e){}});
await p.route(/cdnjs/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));
await p.route(/fonts\.g/,r=>r.abort());await p.route(/\.html$/,r=>r.fulfill({body:fs.readFileSync(FILE),contentType:'text/html; charset=utf-8'}));
await p.goto(`http://localhost:${PORT}/imperium.html`,{timeout:300000});await p.waitForFunction(()=>document.getElementById('loading').hidden,null,{timeout:300000});
const R=[];const ok=(n,c,i='')=>{R.push(!!c);console.log((c?'PASS ':'FAIL ')+n+(i?'  '+i:''));};
await p.evaluate(()=>{window.showEvent=(E,ctx,next)=>{try{E.opts[0].fx(S.player,ctx);}catch(e){}next&&next();};window.picMsg=()=>{};});
// Aufbau: Rom, Partner gleichen Glaubens mit Kontakt
const A=await p.evaluate(()=>{newGame('rom');loadGame(S);closeModal();const me=S.player,r=facRel(me);
  const C=rivals(me).filter(x=>x!=='horde'&&alive(x)&&inContact(me,x)&&!atWar(me,x)&&!isAlly(me,x));
  const same=C.filter(x=>facRel(x)===r),other=C.filter(x=>facRel(x)&&facRel(x)!==r);
  return{me,r,same,other:other.slice(0,3),allRel:C.map(x=>x+':'+facRel(x)).slice(0,12)};});
console.log('    setup',JSON.stringify(A));
const res=await p.evaluate(async A=>{const w=ms=>new Promise(z=>setTimeout(z,ms));const me=S.player,o={};
  // Partner erzwingen: gleicher Glaube, Frieden
  let x=A.same[0];if(!x){x=rivals(me).find(y=>y!=='horde'&&alive(y)&&inContact(me,y));S.fac[x].rel=facRel(me);}
  const d=dip(me,x);d.st='peace';d.truce=0;d.rel=(d.rel||0)+40;S.fac[x].gold=2000;
  // fremder Glaube
  let y=A.other[0];if(!y){y=rivals(me).find(z=>z!=='horde'&&z!==x&&alive(z)&&inContact(me,z));S.fac[y].rel=facRel(me)==='pantheon'?'germ':'pantheon';}
  o.otherBlocked=!gbCan(me,y).ok&&/gleichen Staatsglaubens/.test(gbCan(me,y).why);
  o.evalOk=aiEval(x,me,'gb').ok;
  openDiplomacy(x);o.btn=!!document.querySelector('[data-dip="gb"]');
  dipAction(x,'gb');o.isGB=isGB(me,x);o.ladder=(document.querySelector('.ladder .on')||{}).textContent;o.part=relParts(x,me).some(q=>q[0]==='Glaubensbund'&&q[1]===6);
  o.trt=/Glaubensbund/.test(treatiesHtml());closeModal();
  // Hilferuf des Spielers
  const z=rivals(me).find(q=>q!=='horde'&&q!==x&&q!==y&&alive(q));dip(me,z).st='peace';declareWar(z,me);
  const g0=S.fac[me].gold,xg0=S.fac[x].gold;const mr=Math.random;Math.random=()=>0.1;const r1=gbAsk(me,x,z);Math.random=mr;
  o.ask={ok:r1.ok,t:r1.t,gold:S.fac[me].gold-g0,xpaid:xg0-S.fac[x].gold};
  const r2=gbAsk(me,x,z);o.askCd=!r2.ok&&/vor kurzem/.test(r2.t);
  // Ablehnung bei schlechter Beziehung
  dip(me,x).gbAsk=null;S.fac[x].gold=10;const rel0=dip(me,x).rel;const r3=gbAsk(me,x,z);o.refuse={ok:r3.ok,drel:dip(me,x).rel-rel0};S.fac[x].gold=2000;
  // KI-Partner wird angegriffen → Bitte an den Spieler
  const e2=rivals(x).find(q=>q!=='horde'&&q!==me&&q!==z&&alive(q)&&!isGB(q,x)&&!isAlly(q,x)&&!atWar(q,me)&&!isAlly(q,me));o.e2=e2;dip(e2,x).st='peace';dip(e2,x).truce=0;
  dip(me,x).gbAsk=null;S.props=[];declareWar(e2,x);o.prop=S.props.some(q=>q.type==='gbhelp'&&q.from===x&&q.e===e2);
  const pg=S.fac[me].gold;showProposals(()=>{});await w(300);o.modal=/Glaubensbund/.test(document.querySelector('#dialog').textContent);
  const bt=[...document.querySelectorAll('#dialog .btn')].find(b=>/Gold schicken/.test(b.textContent));if(bt)bt.click();await w(200);o.helped=pg-S.fac[me].gold;closeModal();
  // Speichern/Laden
  const js=JSON.stringify(S);loadGame(JSON.parse(js));closeModal();o.afterLoad=isGB(S.player,x);
  // Glaubenswechsel löst
  const keep=S.fac[x].rel;setStateRel(x,keep==='pantheon'?'germ':'pantheon');o.faithEnd=!isGB(me,x)&&!dip(me,x).gb;
  setStateRel(x,keep);dip(me,x).st='peace';makeGB(me,x);o.reform=isGB(me,x);
  // Krieg löst
  declareWar(me,x);o.warEnd=!dip(me,x).gb;
  // Linien auf der Karte
  const th=PCENTER[capitalOf(me)].th;const m2=rivals(me).find(q=>q!=='horde'&&alive(q)&&q!==x&&facRel(q)===facRel(me)&&!atWar(me,q)&&!isAlly(me,q)&&capitalOf(q)!=null&&isKnown(capitalOf(q))&&PCENTER[capitalOf(q)].th===th);const m1=me;o.m2=m2;
  if(m2){dip(me,m2).st='peace';makeGB(me,m2);setMapMode('dip');setDipView(null);CAM.th=th;await w(300);DIPLSIG='';syncDipLines();o.line=/,g,/.test(DIPLSIG)||String(DIPLSIG).includes(',g,');o.lineSig=String(DIPLSIG).slice(0,80);}
  // alter Spielstand ohne gb + Runden
  for(const k in S.dip)delete S.dip[k].gb;setMapMode('pol');
  for(let i=0;i<3;i++){endTurn();await w(2200);closeModal();}o.oldOk=S.turn;
  return o;},A);
console.log('    res',JSON.stringify(res));
ok('Fremder Glaube ausgeschlossen',res.otherBlocked);
ok('Knopf + Abschluss + Leiter + Beziehung +6',res.btn&&res.isGB&&res.ladder==='Glaubensbund'&&res.part,`${res.btn} ${res.isGB} ${res.ladder} ${res.part}`);
ok('Vertragsliste zeigt Glaubensbund',res.trt);
ok('Hilferuf: Gold kommt',res.ask.ok&&res.ask.gold>0&&res.ask.gold===res.ask.xpaid,JSON.stringify(res.ask));
ok('Hilferuf: Abklingzeit',res.askCd);
ok('Ablehnung kostet Beziehung',!res.refuse.ok&&res.refuse.drel<=-8,JSON.stringify(res.refuse));
ok('KI-Partner angegriffen → Bitte an Spieler, Gold geschickt',res.prop&&res.modal&&res.helped>0,`${res.prop} ${res.modal} ${res.helped}`);
ok('Speichern/Laden',res.afterLoad);
ok('Glaubenswechsel beendet Bund',res.faithEnd&&res.reform);
ok('Krieg beendet Bund',res.warEnd);
ok('Goldene Linie auf der Diplomatie-Karte',res.line,res.lineSig);
ok('Alter Spielstand ohne gb: 3 Runden',res.oldOk>0,String(res.oldOk));
// Sichtprüfung: Diplomatiefenster mit Bund
await p.evaluate(()=>{const me=S.player;const nf=nemF();const x=rivals(me).find(q=>q!=='horde'&&q!==nf&&alive(q)&&inContact(me,q)&&!atWar(me,q)&&!isAlly(me,q)&&facRel(q)===facRel(me));dip(me,x).st='peace';dip(me,x).truce=0;makeGB(me,x);const z=rivals(me).find(q=>q!=='horde'&&q!==x&&alive(q)&&!atWar(q,x));if(z&&!atWar(me,z))declareWar(z,me);openDiplomacy(x);const n=[...document.querySelectorAll('#dialog .note')].find(e=>/Glaubensbund \(/.test(e.textContent));if(n)n.scrollIntoView({block:'center'});});
await p.waitForTimeout(800);await p.screenshot({path:__dirname+'/gbund_dip.jpg',quality:70}).catch(e=>console.log('shot',e.message));
ok('Keine Fehler',!errs.length,errs.slice(0,4).join(' | '));
console.log(`GBUND ${R.filter(Boolean).length}/${R.length}`);await b.close();})();
