// node vk_flotte_t.js <html> [port] – v212: Wikinger starten mit Hafen und Langschiffen; Einschiffen in Vestfold, Fahrt nach Northumbria, Anlanden, Raubzug
const {chromium}=require('playwright');
const FILE=process.argv[2]||require('path').join(__dirname,'..','imperium.html'),PORT=process.argv[3]||'8772';
(async()=>{const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:process.env.PW_GPU?[]:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const R=[];const ok=(n,c,i='')=>{R.push(!!c);console.log((c?'PASS ':'FAIL ')+n+(i?'  '+JSON.stringify(i):''));};
const fs=require('fs');
const ctx=await b.newContext({viewport:{width:1024,height:768},hasTouch:true,isMobile:true});const p=await ctx.newPage();const errs=[];
p.on('pageerror',e=>errs.push('PAGE '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|WebGL|GPU stall/.test(m.text()))errs.push('CON '+m.text().slice(0,200));});
await p.addInitScript(()=>{try{localStorage.setItem('imperium.gfx',JSON.stringify({q:'leicht'}));}catch(e){}});
await p.route(/cdnjs/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));
await p.route(/fonts\.g/,r=>r.abort());await p.route(/\.html$/,r=>r.fulfill({body:fs.readFileSync(FILE),contentType:'text/html; charset=utf-8'}));
await p.goto(`http://localhost:${PORT}/imperium.html`,{timeout:300000});await p.waitForFunction(()=>document.getElementById('loading').hidden,null,{timeout:300000});
await p.waitForFunction(()=>!document.querySelector('#loading[data-gate]'),null,{timeout:120000}).catch(()=>{});
const errs2=errs;await p.waitForTimeout(1500);
const s=await p.evaluate(()=>{window.playCine=(o,d)=>{d&&d();};window.showEvent=(E,c,n)=>{n&&n();};startScenario('wikinger');try{closeModal();}catch(e){}const f=S.player,v=PI.viken;
 const fl=(S.fleets||[]).filter(x=>x.f===f);const a=S.armies.find(x=>x.f===f&&x.p===v);return {port:S.prov[v].b.port,fl:fl.map(x=>({n:x.n,name:x.name,cap:x.n*SHIP_CAP})),men:a&&a.units.length,emb:a?embarkFleets(a).length:0};});
ok('Hafen in Vestfold',s.port>=1,s.port);ok('Startflotte 3 Langschiffe',s.fl.length===1&&s.fl[0].n===3,s.fl);ok('Hauptheer passt auf die Flotte',s.emb===1&&s.men<=s.fl[0].cap,s);
const r=await p.evaluate(async()=>{const f=S.player,a=S.armies.find(x=>x.f===f&&x.p===PI.viken),fl=S.fleets.find(x=>x.f===f);const e=embark(a,fl);let t=0,land=[];
 for(;t<12;t++){moveFleet(fl,PI.briganten);land=landTargets(fl);if(land.includes(PI.briganten))break;try{for(const x of S.fleets)if(x.f===f){x.mp=x.mpv2||1;}fl.mp=fleetRange(fl);}catch(er){}}
 return {e,boat:a.boat,t,land:land.map(i=>PROV_DEF[i].id).slice(0,8)};});
ok('Einschiffen klappt',r.e&&r.boat,r);ok('Flotte erreicht die Küste Northumbrias',r.land.includes('briganten'),r);
const d=await p.evaluate(()=>{const f=S.player;storyRound();S.story[f].i=3;/* W5: ab Schritt 3 ist Erobern erlaubt */const fl=S.fleets.find(x=>x.f===f),a=S.armies.find(x=>x.f===f&&x.boat===fl.id);const res=disembark(a,fl,PI.briganten)||{};const q=res.res||{};return {err:res.err||null,landed:!!res.landed,landing:!!q.landing,win:q.win,captured:!!q.captured,siege:!!q.siegeStarted,onBoard:!!a.boat};});
ok('Anlanden in Northumbria (Landung oder Landungsschlacht)',!d.err&&(d.landed||d.landing),d);
ok('Keine Seitenfehler',!errs.length,errs.slice(0,2));
console.log(R.every(x=>x)?'ALLE PASS':'FEHLER '+R.filter(x=>!x).length);await b.close();})();
