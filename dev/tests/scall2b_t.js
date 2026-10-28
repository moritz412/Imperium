// Integrationstests Task 01 (iPad-Emulation in Chromium: Touch, DPR 2, 1180x820). Aufruf: node integ.js <html>
const {chromium}=require('playwright');const fs=require('fs');
const FILE=process.argv[2]||require('path').join(__dirname,'..','imperium.html');
const R=[];const ok=(n,c,info='')=>{R.push([n,!!c,info]);console.log((c?'PASS ':'FAIL ')+n+(info?'  '+info:''));};
(async()=>{const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:process.env.PW_GPU?[]:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:1180,height:820},deviceScaleFactor:2,hasTouch:true,isMobile:true});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>{errs.push(e.message);console.log('PAGEERR',e.message);});
p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))errs.push(m.text());});
await p.route(/cdnjs/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));
await p.route(/fonts\.g/,r=>r.abort());
await p.route(/\.html$/,r=>r.fulfill({body:fs.readFileSync(FILE),contentType:'text/html; charset=utf-8'}));
await p.goto('http://localhost:8796/imperium.html',{timeout:300000});await p.waitForFunction(()=>document.getElementById('loading').hidden,null,{timeout:400000});await p.waitForTimeout(1500);
const load=async k=>{await p.evaluate(()=>openTestSaves());await p.waitForTimeout(400);await p.evaluate(k=>document.querySelectorAll('[data-ts]')[k].click(),k);await p.waitForTimeout(2500);await p.evaluate(()=>{document.getElementById('tut').hidden=true;});};
console.log('tiles',await p.evaluate(()=>['mandubier','lingonen','bellovaker','ambianer','eburonen','osismer','ariminum','salasser','segusiner','vocontier','daunien','ilerkavonen','nordalbingien','seeland','gotland','orkney','hebriden'].map(id=>id+':'+(PROV_TILES[PI[id]]||[]).length).join(' ')));
const IDS=process.argv[3]?process.argv[3].split(','):await p.evaluate(()=>Object.keys(SCEN));
for(const id of IDS){
  const r=await p.evaluate(async(id)=>{const out={id};try{startScenario(id);loadGame(S);}catch(e){return {id,err:'start '+e.message+' '+(e.stack||'').split('\n')[1]};}
    const f=S.player;out.name=FACTIONS[f].name;out.prov=provsOf(f).length;out.hero=!!S.armies.find(a=>a.hero);out.ep=ep();out.year=S.year;out.alive=PLAYABLE.filter(alive).length;
    const errs=[];for(let k=0;k<4;k++){try{newRound();advanceGoals();refreshOwnership();}catch(e){errs.push(e.message+' '+(e.stack||'').split('\n')[1]);}let done=false;runEvents(()=>{done=true;});for(let t=0;t<30&&!done;t++){const d=document.querySelector('#dialog');const b=d&&!document.querySelector('#modal').hidden&&(d.querySelector('.evopt:not([disabled])')||d.querySelector('[data-people]')||d.querySelector('[data-tr]')||d.querySelector('[data-ref]')||d.querySelector('.actions .btn'));if(b)b.click();await new Promise(r=>setTimeout(r,40));}closeModal();}
    out.errs=errs;out.turn=S.turn;out.year2=S.year;out.over=S.scen.over;out.res=S.scen.res||'';
    // durchspielen per Zwang
    const s=stState(f),log=[];S.scen.einfl=200;S.fac[f].gold=5000;
    for(let k=0;k<16&&s&&!s.end;k++){const C=stCh(f),st=C.steps[s.i],g=s.g;
      if(g.any)stIds(g.any[0]).slice(0,g.any[1]).forEach(i=>S.prov[i].owner=f);if(g.hold)stIds(g.hold).forEach(i=>S.prov[i].owner=f);if(g.wins)stat(f,'win',g.wins);
      if(g.build){const i=PI[g.build[2]];S.prov[i].owner=f;S.prov[i].b[g.build[0]]=g.build[1];}
      if(g.cond==='rhein'){S.scen.flags.bridge=1;S.scen.flags.in_ubier=1;}if(g.cond==='pass'){S.scen.flags.in_salasser=1;S.scen.flags.in_taurini=1;}if(g.cond==='hasdrubal')S.scen.flags.hasd=1;
      if(g.cond==='holdfor'){g.ids.forEach(id=>S.prov[PI[id]].owner=f);S.scen.flags[g.k]=S.turn-g.n;}if(g.cond==='gel')S.scen.flags.gel=g.n;if(g.cond==='hadsch')S.scen.flags.hadsch=1;if(g.cond==='kanun')S.fac[f].kanun=1;if(g.cond==='dort')S.scen.flags['in_'+g.ids[0]]=1;
      if(g.cond==='fakt'){S.prov.forEach((P,i)=>{if(faktOf(f).length<g.n&&P.owner!==f&&P.owner!=='frei'&&coastal(i))P.fakt=f;});}if(g.trade){rivals(f).slice(0,g.trade).forEach(x=>{const d=dip(f,x);d.st='peace';d.trade=true;});}
      if(g.cond==='zama')S.prov[PI.latium].owner=f;if(g.cond==='kroenung'){S.scen.flags.in_latium=1;S.prov[PI.insubrien].owner=f;}if(g.cond==='beute')S.scen.flags.beute=g.n;if(g.cond==='ruhm')S.scen.ruhm=g.n;
      if(st.choice)scenChoice(st.choice[0].act);
      try{storyRound();}catch(e){log.push("E:"+e.message);}log.push(s.i+":"+JSON.stringify(stProg(f,s.g,s)));}
    const E=stEvents(f);const end=E.find(x=>x.E.id==='st_end');if(end)end.E.opts[0].fx(f);out.log=log.join(',');out.endRes=S.scen.res;out.rank=S.scen.rank;return out;},id);
  console.log(JSON.stringify(r));}
console.log('errs',JSON.stringify(errs.slice(0,6)));await b.close();})();
