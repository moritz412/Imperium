// node burh_t.js <html> [port] – W2 Paket A (v202): Burh (Bau, Raubzug-Abwehr, Garnison), Wikinger-Szenario mit vier englischen Reichen.
const {chromium}=require('playwright');const fs=require('fs');
const FILE=process.argv[2],PORT=process.argv[3]||'8772';
(async()=>{const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:process.env.PW_GPU?[]:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const R=[];const ok=(n,c,i='')=>{R.push(!!c);console.log((c?'PASS ':'FAIL ')+n+(i?'  '+i:''));};
const ctx=await b.newContext({viewport:{width:1024,height:768},hasTouch:true,isMobile:true});const p=await ctx.newPage();const errs=[];
p.on('pageerror',e=>errs.push('PAGE '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|WebGL|GPU stall/.test(m.text()))errs.push('CON '+m.text().slice(0,200));});
await p.addInitScript(()=>{try{localStorage.setItem('imperium.gfx',JSON.stringify({q:'leicht'}));}catch(e){}});
await p.route(/cdnjs/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));
await p.route(/fonts\.g/,r=>r.abort());await p.route(/\.html$/,r=>r.fulfill({body:fs.readFileSync(FILE),contentType:'text/html; charset=utf-8'}));
await p.goto(`http://localhost:${PORT}/imperium.html`,{timeout:300000});await p.waitForFunction(()=>document.getElementById('loading').hidden,null,{timeout:300000});
await p.waitForFunction(()=>!document.querySelector('#loading[data-gate]'),null,{timeout:120000}).catch(()=>{});
const s=await p.evaluate(()=>{startScenario('wikinger');loadGame(S);try{closeModal();}catch(e){}window.picMsg=()=>{};
  const own=id=>S.prov[PI[id]].owner,nm=id=>PROV_DEF[PI[id]].name+'/'+PROV_DEF[PI[id]].city;
  const ids=['belgae_b','dumnonier','cantium','trinovanten','dobunner','corieltauver','icener','briganten','votadiner','silurer'];
  const O={};ids.forEach(i=>O[i]=own(i));const N={};ids.forEach(i=>N[i]=nm(i));
  const eng=['usa','mogul','vijaya','briten'];const wars=[];for(const a of eng)for(const c of Object.keys(S.fac))if(c!==a&&c!=='frei'&&S.fac[c]&&alive(c)&&atWar(a,c))wars.push(a+'-'+c);
  const intra=[];for(const a of eng)for(const c of eng)if(a<c&&atWar(a,c))intra.push(a+'-'+c);
  return{O,N,people:eng.map(f=>S.fac[f].people+':'+FACTIONS[f].name),alive:eng.map(f=>alive(f)),prov:eng.map(f=>provsOf(f).length),wars,intra,armies:eng.map(f=>S.armies.filter(a=>a.f===f).length),gen:S.armies.filter(a=>['mogul','vijaya'].includes(a.f)).map(a=>a.gen&&a.gen.n),cap:eng.map(f=>PROV_DEF[capitalOf(f)].city),raid:eng.map(f=>raidKind(f)),epoch:S.epoch,
   cul:eng.map(f=>facCul(f))};});
const O=s.O;
ok('Wessex: Belgen, Dumnonier, Cantium, Trinovanten',['belgae_b','dumnonier','cantium','trinovanten'].every(i=>O[i]==='usa'),JSON.stringify(O));
ok('Mercia: Corieltauver + Dobunner; East Anglia: Icener; Northumbria: Briganten + Votadiner',O.corieltauver==='mogul'&&O.dobunner==='mogul'&&O.icener==='vijaya'&&O.briganten==='briten'&&O.votadiner==='briten');
ok('Wales (Silurer) bleibt frei',O.silurer==='frei');
ok('4 englische Reiche leben, Völkernamen stimmen',s.alive.every(Boolean)&&s.people.join()==='wessex:Wessex,mercia:Mercia,eastangles:East Anglia,northumbria:Northumbria',s.people.join()+' Prov '+s.prov.join('/'));
ok('Provinz- und Stadtnamen',s.N.belgae_b==='Wessex/Winchester'&&s.N.corieltauver==='Mercia/Tamworth'&&s.N.icener==='East Anglia/Norwich'&&s.N.briganten==='Northumbria/Jórvík'&&s.N.votadiner==='Bernicia/Bamburgh'&&s.N.dobunner==='Hwicce/Worcester'&&s.N.silurer==='Powys/Mathrafal',JSON.stringify(s.N));
ok('Hauptstädte: Winchester, Tamworth, Norwich, Jórvík',s.cap.join()==='Winchester,Tamworth,Norwich,Jórvík',s.cap.join());
ok('Feldherren Offa und Æthelberht, je Reich mindestens ein Heer',s.gen.includes('Offa')&&s.gen.includes('Æthelberht')&&s.armies.every(n=>n>=1),JSON.stringify({g:s.gen,a:s.armies}));
ok('Kriege: nur Nord gegen Northumbria, keine unter den Angelsachsen',s.intra.length===0&&s.wars.sort().join()==='briten-nord',JSON.stringify({w:s.wars,i:s.intra}));
ok('Englische Reiche sind keine Raubvölker, Kultur britisch',s.raid.every(x=>x===null)&&s.cul.every(c=>c==='britisch'),s.cul.join());
// Burh: Bau
const r=await p.evaluate(()=>{const me=S.player;S.fac[me].gold=5000;const pi=PI.dobunner,ot=PI.viken;
  S.prov[pi].owner=me;S.prov[pi].b.burh=0;const P=S.prov[pi];
  const c1=canBuild(me,pi,'burh');const vis1=bVisP(pi,'burh');
  const c2=canBuild(me,ot,'burh');const vis2=bVisP(ot,'burh');
  const e0=S.epoch;S.epoch=3;const c3=canBuild(me,pi,'burh'),vis3=bVisP(pi,'burh');S.epoch=e0;
  return{c1:c1.ok,cost:c1.cost,t:c1.turns,vis1,c2:c2.ok,w2:c2.why,vis2,c3:c3.ok,w3:c3.why,vis3,cul:P.cul,ep:e0};});
ok('Burh baubar in britischer Provinz (Mittelalter-Epoche)',r.c1&&r.vis1&&r.cost>0,JSON.stringify(r));
ok('Burh nicht baubar in nicht-britischer Provinz',!r.c2&&/britisch/.test(r.w2)&&!r.vis2,r.w2);
ok('Burh nicht mehr baubar ab Frühe Neuzeit',!r.c3&&/Mittelalter/.test(r.w3)&&!r.vis3,r.w3);
// Wirkung
const w=await p.evaluate(()=>{const pi=PI.dobunner,P=S.prov[pi];const ep0=S.epoch;P.b.walls=0;P.b.grenzwall=0;P.b.temple=0;P.b.port=0;const out={m:[],g:[],w:[]};
  for(let l=0;l<=3;l++){P.b.burh=l;const d=rzDef(pi,'see');out.m.push(Math.round(d.m*100)/100);out.g.push(garMax(pi));out.w.push(d.why.join('+'));}
  S.epoch=3;P.b.burh=3;const late=Math.round(rzDef(pi,'see').m*100)/100,lateG=garMax(pi);S.epoch=ep0;
  // Plündern reißt Burh nicht ab
  const me=S.player;let lost=0;P.owner='briten';if(!atWar(me,'briten'))declareWar(me,'briten');
  for(let i=0;i<200;i++){P.b.burh=2;P.b.market=1;P.dv=null;const a=createArmy(me,PI.viken,['sword'],1);try{plunderProv(a,pi,'rz');}catch(e){}if(P.b.burh<2)lost++;S.armies=S.armies.filter(x=>x!==a);}
  return{out,late,lateG,lost};});
ok('rzDef sinkt mit Burh: 1,0 → 0,8 → 0,65 → 0,5',JSON.stringify(w.out.m)===JSON.stringify([1,0.8,0.65,0.5])&&w.out.w[1]==='Burh',JSON.stringify(w.out.m)+' '+w.out.w.join('|'));
ok('Garnison +15/+30/+45 %',w.out.g[1]>w.out.g[0]&&w.out.g[2]>w.out.g[1]&&w.out.g[3]>w.out.g[2]&&Math.abs(w.out.g[3]/w.out.g[0]-1.45)<0.08,JSON.stringify(w.out.g));
ok('Vorhandener Burh wirkt in späterer Epoche weiter',w.late===0.5,w.late+' Garnison '+w.lateG);
ok('Plündern reißt Burh nie ab (200 Versuche)',w.lost===0,'verloren '+w.lost);
// KI und Statthalter
const k=await p.evaluate(()=>{const f='mogul',pi=PI.corieltauver;S.prov[pi].dv=null;S.prov[pi].b.burh=0;
  const w0=burhWant(f,pi);declareWar(f,'nord');const w1=burhWant(f,pi);
  return{w0,w1,mil:GOV_DIR.mil.k.includes('burh'),atw:atWar(f,'nord')};});
ok('KI: Burh gewünscht, wenn ein Raubvolk Krieg führt (sonst niedrig)',k.w1>0&&k.w0<0,JSON.stringify(k));
ok('Statthalter-Auftrag Verteidigung enthält Burh',k.mil===true,String(k.mil));
// Raubzug trifft Mercia und East Anglia
const z=await p.evaluate(()=>{const out={};for(const [f,id] of [['mogul','corieltauver'],['vijaya','icener']]){const a=createArmy('nord',PI.viken,['sword'],1);const P=S.prov[PI[id]];if(!atWar('nord',f))declareWar('nord',f);P.dv=null;P.b.burh=0;const r=plunderProv(a,PI[id],'rz');out[f]=r?r.loot:null;}return out;});
ok('Raubzug trifft Mercia und East Anglia (Beute > 0)',z.mogul>0&&z.vijaya>0,JSON.stringify(z));
ok('Keine Seiten-/Konsolenfehler',!errs.length,errs.slice(0,4).join(' | '));
console.log(`BURH ${R.filter(Boolean).length}/${R.length}`);await b.close();})();
