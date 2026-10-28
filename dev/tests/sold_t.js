// node fz_t.js <html> [port] – Feldzugsziele des Spielers
const {chromium}=require('playwright');const fs=require('fs');
const FILE=process.argv[2],PORT=process.argv[3]||'8772',FAC=process.argv[4]||'rom';
(async()=>{const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:process.env.PW_GPU?[]:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:1024,height:768},deviceScaleFactor:1,hasTouch:true,isMobile:true});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push('PAGE '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|WebGL|GPU stall/.test(m.text()))errs.push('CON '+m.text().slice(0,160));});
await p.addInitScript(()=>{try{localStorage.setItem('imperium.gfx',JSON.stringify({q:'leicht'}));}catch(e){}});
await p.route(/cdnjs/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));
await p.route(/fonts\.g/,r=>r.abort());
await p.route(/\.html$/,r=>r.fulfill({body:fs.readFileSync(FILE),contentType:'text/html; charset=utf-8'}));
await p.goto(`http://localhost:${PORT}/imperium.html`,{timeout:300000});await p.waitForFunction(()=>document.getElementById('loading').hidden,null,{timeout:300000});
const R=[];const ok=(n,c,i='')=>{R.push(!!c);console.log((c?'PASS ':'FAIL ')+n+(i?'  '+i:''));};
await p.evaluate(()=>{window.showEvent=(E,ctx,next)=>{try{E.opts[0].fx(S.player,ctx);}catch(e){}next&&next();};window.picMsg=()=>{};});
await p.evaluate(async()=>{const W=await loadWorlds();const S0=S;startWorld(2,W[2].facs[0].f);for(let k=0;k<180&&(S===S0||ep()!==2);k++)await new Promise(z=>setTimeout(z,500));closeModal();});await p.waitForTimeout(1500);
const s1=await p.evaluate(()=>{closeModal();const me=S.player,F=S.fac[me];F.gold=5000;const a=S.armies.filter(x=>x.f===me&&!x.boat&&S.prov[x.p].owner===me).sort((x,y)=>x.units.length-y.units.length)[0];while(a.units.length>armyMax(me)-4)a.units.pop();
  UI.army=a.id;UI.sel=null;UI.mode='army';refresh();const html=document.body.innerHTML;const btn=!!document.querySelector('[data-act="sldPick"]'),tb=!!document.querySelector('[data-act="trBuy"]');
  const u0=income(me).upk,n0=a.units.length;openSldPick(a);const opts=document.querySelectorAll('[data-sld]').length;document.querySelector('[data-sld="0"]').click();const u=a.units[a.units.length-1];
  const st=uStat(me,u),base=unitStat(me,u.r,u.v);return{aid:a.id,me,ep:ep(),btn,tb,opts,n:a.units.length-n0,sld:u.sld,upk:st.upk,baseUpk:base.upk,name:st.name,du:income(me).upk-u0,gold:F.gold};});
ok('Söldner anwerben (Knopf, Liste, Einheit mit doppeltem Sold)',s1.btn&&s1.opts>=4&&s1.n===1&&s1.sld===1&&s1.upk===Math.round(s1.baseUpk*2)&&s1.du>0,JSON.stringify(s1));
const s2=await p.evaluate(a=>{const A=getArmy(a);for(let i=0;i<3;i++)sldHire(A,1);const left=sldLeft(A.f);openSldPick(A);const dis=[...document.querySelectorAll('[data-sld]')].every(b=>b.disabled);closeModal();return{left,dis,n:A.units.filter(isSld).length};},s1.aid);
ok('Höchstens 3 Söldner je Runde',s2.left===0&&s2.dis&&s2.n===3,JSON.stringify(s2));

const s3=await p.evaluate(a=>{const A=getArmy(a),me=A.f,h0=income(me).hof,g0=S.fac[me].gold;const ok=trossBuy(A);return{ok,tr:!!A.tr,cost:g0-S.fac[me].gold,dh:income(me).hof-h0};},s1.aid);
await p.evaluate(a=>{UI.army=a;UI.mode='army';refresh();const e=document.querySelector('.sldbox');if(e)e.scrollIntoView({block:'center'});},s1.aid);await p.waitForTimeout(800);await p.screenshot({path:__dirname+'/sold_heer.jpg',quality:70});
ok('Tross aufstellen (Kosten, Unterhalt)',s3.ok&&s3.tr&&s3.cost>0&&s3.dh>0,JSON.stringify(s3));
const s4=await p.evaluate(a=>{const A=getArmy(a),me=A.f,okP=pi=>{const o=S.prov[pi].owner;return o===me||isAlly(me,o);};
  // Provinz mit Abstand genau 3 zum eigenen/verbündeten Land suchen
  const dist={};let fr=[];for(let i=0;i<S.prov.length;i++)if(okP(i)){dist[i]=0;fr.push(i);}for(let d=1;d<=3;d++){const nx=[];for(const i of fr)for(const n of ADJ[i])if(dist[n]==null&&!isSeaLink(i,n)){dist[n]=d;nx.push(n);}fr=nx;}
  const t=fr.find(i=>!S.armies.some(b=>b.p===i&&b.f!==me));if(t==null)return{skip:1};const p0=A.p;A.p=t;A.unsup=null;supplyRound();const withTr=A.unsup===S.turn;const keep=A.tr;A.tr=null;A.unsup=null;supplyRound();const without=A.unsup===S.turn;A.tr=keep;A.unsup=null;
  // Abstand 2 muss ohne Tross gehen (Gegenprobe)
  A.p=p0;return{t,withTr,without};},s1.aid);
ok('Tross verlängert Nachschub (Abstand 3: mit Tross versorgt, ohne nicht)',!s4.skip&&!s4.withTr&&s4.without,JSON.stringify(s4));
const s5=await p.evaluate(a=>{const A=getArmy(a),me=A.f;const x=rivals(me).find(y=>y!=='horde'&&S.fac[y]&&S.fac[y].alive);const g0=S.fac[x].gold;const E=S.armies.find(b=>b.f===x)||{f:x,units:[1]};armyWarHook(A,x,[E],false,{});const lg=S.log.slice(-3).map(e=>e.t).join(' | ');return{tr:!!A.tr,loot:S.fac[x].gold-g0,lg};},s1.aid);
ok('Tross geht bei verlorener Schlacht verloren, Sieger erbeutet Gold',!s5.tr&&s5.loot>0&&/Tross/.test(s5.lg),JSON.stringify(s5));
const s6=await p.evaluate(a=>{const A=getArmy(a),me=A.f,P=S.prov[A.p],un0=P.unrest||0,n0=A.units.filter(isSld).length;const R=Math.random;const seq=[0.1,0.6,0.1,0.1,0.1,0.1,0.1,0.1];let i=0;Math.random=()=>seq[i++]??0.99;
  S.fac[me].gold=-50;const gone=sldUnpaid(me);Math.random=R;return{gone,n0,n1:A.units.filter(isSld).length,du:(P.unrest||0)-un0,log:S.log.slice(-3).map(e=>e.t).join(' | ')};},s1.aid);
ok('Kasse < 0: Söldner plündern bzw. ziehen ab',s6.gone>=2&&s6.du===3&&s6.n1===s6.n0-s6.gone,JSON.stringify(s6));
// Überlaufen
const s7=await p.evaluate(a=>{const A=getArmy(a),me=A.f;const F=S.fac[me];F.gold=5000;F.sldT=-1;sldHire(A,0);const x=rivals(me).find(y=>y!=='horde'&&S.fac[y]&&S.fac[y].alive);dip(me,x).st='war';const n=[...ADJ[A.p]].find(q=>!isSeaLink(A.p,q));const E=createArmy(x,n,['spear'],0);
  const e0=E.units.length;const R=Math.random;const seq=[0.1,0.9];let i=0;Math.random=()=>seq[i++]??0.99;F.gold=-10;const g=sldUnpaid(me);Math.random=R;return{g,e:E.units.length-e0,sld:E.units[E.units.length-1].sld,log:S.log.slice(-1)[0].t};},s1.aid);
ok('Kasse < 0: Söldner laufen zum Feind über',s7.g===1&&s7.e===1&&!s7.sld&&/über/.test(s7.log),JSON.stringify(s7));
// Ganze Runde mit leerer Kasse
const s8=await p.evaluate(async a=>{const A=getArmy(a),me=A.f,F=S.fac[me];F.gold=5000;F.sldT=-1;sldHire(A,0);sldHire(A,0);trossBuy(A);const tot0=S.armies.filter(x=>x.f===me).reduce((s,x)=>s+x.units.length,0);F.gold=-3000;endTurn();await new Promise(z=>setTimeout(z,3000));closeModal();
  const tot1=S.armies.filter(x=>x.f===me).reduce((s,x)=>s+x.units.length,0);return{tot0,tot1,gold:F.gold,turn:S.turn};},s1.aid);
ok('Runde mit leerer Kasse läuft (keine Fehler)',s8.turn>0,JSON.stringify(s8));
const s9=await p.evaluate(a=>{const A=getArmy(a)||S.armies.find(x=>x.f===S.player);A.tr={t:S.turn};const u=newUnit(A.f,'spear');u.sld=1;A.units.push(u);const id=A.id;const J=JSON.parse(JSON.stringify(S));loadGame(J);const B=getArmy(id);return{tr:!!B.tr,sld:B.units.some(x=>x.sld===1)};},s1.aid);
ok('Speichern/Laden behält Tross und Söldner',s9.tr&&s9.sld,JSON.stringify(s9));
const s10=await p.evaluate(async()=>{for(const a of S.armies){delete a.tr;for(const u of a.units)delete u.sld;}for(const f in S.fac){delete S.fac[f].sldT;delete S.fac[f].sldN;}const J=JSON.parse(JSON.stringify(S));loadGame(J);endTurn();await new Promise(z=>setTimeout(z,3000));closeModal();return S.turn;});
ok('Alter Spielstand ohne neue Felder läuft',s10>0,String(s10));
ok('Keine Seiten-/Konsolenfehler',!errs.length,errs.slice(0,4).join(' | '));
console.log(`SOLD ${R.filter(Boolean).length}/${R.length}`);await b.close();})();
