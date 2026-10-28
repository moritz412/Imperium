// node bed1_t.js <html> [port] – Bedienung Phase 1 Karte: Befehlsblase, Rückgängig, Figur ziehen, Doppeltipp, Befehl oben im Blatt
const {chromium}=require('playwright');const fs=require('fs');
const FILE=process.argv[2],PORT=process.argv[3]||'8772',OUT=__dirname+'/bed1';fs.mkdirSync(OUT,{recursive:true});
const R=[];const ok=(n,c,i='')=>{R.push(!!c);console.log((c?'PASS ':'FAIL ')+n+(i?'  '+(typeof i==='string'?i:JSON.stringify(i)):''));};
async function run(b,name,vp){
  const ctx=await b.newContext({viewport:vp,deviceScaleFactor:1,hasTouch:true,isMobile:vp.width<900});
  const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push('PAGE '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|WebGL|GPU stall/.test(m.text()))errs.push('CON '+m.text().slice(0,160));});
  await p.addInitScript(()=>{try{localStorage.setItem('imperium.gfx',JSON.stringify({q:'leicht'}));}catch(e){}});
  await p.route(/fonts\.g/,r=>r.abort());
  await p.route(/\.html$/,r=>r.fulfill({body:fs.readFileSync(FILE),contentType:'text/html; charset=utf-8'}));
  await p.goto(`http://localhost:${PORT}/imperium.html`,{timeout:300000});await p.waitForFunction(()=>document.getElementById('loading').hidden,null,{timeout:300000});
  const w=ms=>p.waitForTimeout(ms);
  // Spiel, Heer und Ziele suchen
  const setup=await p.evaluate(()=>{window.showEvent=(E,c,n)=>{try{E.opts[0].fx(S.player,c);}catch(e){}n&&n();};window.picMsg=()=>{};newGame('rom');loadGame(S);closeModal();try{$('#tut').hidden=true;}catch(e){}
    const A=S.armies.filter(a=>a.f===S.player&&a.mp>0);let pick=null;
    for(const a of A){const Rm=reachMap(a);let mv=null,mg=null,atk=null,far=null;for(const[n,l]of Rm){if(n===a.p||!isKnown(n))continue;if(l.t===0&&l.own&&pathTo(Rm,n).every(k=>!isNeutralFor(a.f,k))){if(!armiesAt(n).some(x=>x.f===a.f))mv=mv??n;else mg=mg??n;}if(l.t===0&&!l.own&&S.prov[n].owner==='frei')atk=atk??n;}
      if(mv==null&&mg!=null){mv=mg;}if(mv!=null){pick={a:a.id,mv,atk,p0:a.p,mp0:a.mp,merge:mv===mg,n0:S.armies.length};break;}}
    return pick;});
 await p.waitForFunction(()=>!document.querySelector('#loading[data-gate]'),null,{timeout:400000}).catch(()=>{});await p.waitForTimeout(1500);
  ok(name+': Heer und Marschziel gefunden',setup&&setup.mv!=null,setup);if(!setup){await ctx.close();return;}
  const scr=async pi=>p.evaluate(pi=>{const c=CAP[pi];V.set(c.x,c.hd||0,c.z).project(camera);return{x:(V.x+1)/2*innerWidth,y:(1-V.y)/2*innerHeight};},pi);
  const focus=async pi=>{await p.evaluate(pi=>{focusProv(pi,9);camTween=null;const c=CAP[pi];CAM.tx=c.x;CAM.tz=c.z+1.2;CAM.d=9;clampCam&&clampCam();for(let i=0;i<40;i++)applyCam();camera.updateMatrixWorld();needRender=3;},pi);await w(700);await p.evaluate(()=>{for(let i=0;i<40;i++)applyCam();camera.updateMatrixWorld();});};
  // 1) Heer wählen, Ziel antippen → Blase
  await p.evaluate(id=>{selectArmy(id);},setup.a);await w(300);
  await focus(setup.mv);const pt=await scr(setup.mv);
  await p.evaluate(pi=>{UI.tapPt=null;onProvinceTap(pi);},setup.mv);await w(500);
  const bub=await p.evaluate(()=>{const e=document.getElementById('cmdbub');const r=e.getBoundingClientRect();const g=e.querySelector('.bgo');const gr=g?g.getBoundingClientRect():null;
    const hit=gr?document.elementFromPoint(gr.left+gr.width/2,gr.top+gr.height/2):null;window.__hit=hit?(hit.id||hit.className||hit.tagName)+' < '+(hit.parentElement&&(hit.parentElement.id||hit.parentElement.className)):'';const sh=document.getElementById('sheet').getBoundingClientRect();
    const ov=!(r.right<=sh.left||r.left>=sh.right||r.bottom<=sh.top||r.top>=sh.bottom)&&!document.getElementById('sheet').classList.contains('collapsed');
    return{tb:Math.round($('#top').getBoundingClientRect().bottom),bt:Math.round(r.top),bb:bubBox&&bubBox.top,who:window.__hit,vis:getComputedStyle(e).visibility,txt:e.innerText.replace(/\s+/g,' '),inView:r.left>=0&&r.top>=0&&r.right<=innerWidth&&r.bottom<=innerHeight,onTop:!!hit&&e.contains(hit),h:gr&&Math.round(gr.height),ov,preview:UI.preview};});
  ok(name+': Befehlsblase sichtbar, im Bild, nicht verdeckt, ≥44 px',bub.vis==='visible'&&bub.inView&&bub.onTop&&bub.h>=44&&!bub.ov,bub);
  // Befehl oben im Blatt
  const top=await p.evaluate(()=>{const b=document.querySelector('#shBody [data-act="go"]'),u=document.querySelector('#shBody .ucard, #shBody [data-uidx], #shBody .unit');const t=document.querySelector('#shBody .cmdtop');return{go:!!b,cmd:!!t,goTop:b&&Math.round(b.getBoundingClientRect().top),uTop:u&&Math.round(u.getBoundingClientRect().top),firstCmd:t&&t.previousElementSibling&&t.previousElementSibling.className};});
  ok(name+': Befehlsknopf oben im Heer-Blatt',top.go&&top.cmd&&(top.uTop==null||top.goTop<top.uTop),top);
  await p.screenshot({path:`${OUT}/${name}_blase.jpg`,quality:70}).catch(e=>console.log('shot',e.message));
  // 2) Blase antippen (echter Touch) → Marsch
  const g=await p.evaluate(()=>{const r=document.querySelector('#cmdbub .bgo').getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2};});
  await p.touchscreen.tap(g.x,g.y);await w(700);
  const mv=await p.evaluate(id=>{const a=getArmy(id)||getArmy(UI.army);return{n:S.armies.length,p:a.p,mp:a.mp,undo:typeof undoValid==='function'&&undoValid(),ub:getComputedStyle(document.getElementById('undoBub')).visibility,sheetBtn:!!document.querySelector('#shBody [data-act="undoMove"]')};},setup.a);
  ok(name+': Antippen der Blase marschiert',mv.p===setup.mv,mv);
  ok(name+': Rückgängig angeboten (Karte und Blatt)',mv.undo&&mv.ub==='visible'&&mv.sheetBtn,mv);
  await p.screenshot({path:`${OUT}/${name}_rueck.jpg`,quality:70}).catch(e=>console.log('shot',e.message));
  // 3) Rückgängig per Touch
  const ubp=await p.evaluate(()=>{const r=document.getElementById('undoBub').getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2,hit:(()=>{const h=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return h&&h.id;})()};});
  await p.touchscreen.tap(ubp.x,ubp.y);await w(600);
  const un=await p.evaluate(id=>{const a=getArmy(id);return a?{p:a.p,mp:a.mp,undo:undoValid(),n:S.armies.length}:{none:1};},setup.a);
  ok(name+': Rückgängig stellt Ort und Bewegung wieder her',un.p===setup.p0&&un.mp===setup.mp0&&!un.undo&&un.n===setup.n0,{un,hit:ubp.hit});
  // 4) Doppeltipp-Abkürzung
  await p.evaluate(id=>{selectArmy(id);},setup.a);await w(200);await focus(setup.mv);const pt2=await scr(setup.mv);
  await p.evaluate(({x,y})=>{tapAt(x,y);tapAt(x,y);},pt2);await w(500);
  const dt=await p.evaluate(id=>(getArmy(id)||getArmy(UI.army)).p,setup.a);ok(name+': Doppeltipp marschiert weiterhin',dt===setup.mv,{dt});
  await p.evaluate(()=>{if(undoValid())undoMove();});await w(300);
  // 5) Figur ziehen (ausgewähltes Heer)
  await p.evaluate(id=>{selectArmy(id);},setup.a);await w(200);await focus(setup.p0);
  const fig=await p.evaluate(id=>{const t=TOK.get(id);const q=t.g.position;V.set(q.x,q.y+0.15,q.z).project(camera);const x=(V.x+1)/2*innerWidth,y=(1-V.y)/2*innerHeight,el=document.elementFromPoint(x,y);return{x,y,hit:armyFigAt(x,y),el:el&&(el.id||el.className||el.tagName),sel:UI.army,mode:UI.mode};},setup.a);
  const dst=await p.evaluate(({pi,f})=>{const c=CAP[pi];for(let r=0;r<=60;r+=6)for(let k=0;k<12;k++){const a=k/12*Math.PI*2;V.set(c.x,c.hd||0,c.z).project(camera);const x=(V.x+1)/2*innerWidth+Math.cos(a)*r,y=(1-V.y)/2*innerHeight+Math.sin(a)*r;const g=screenGround(x,y);if(g&&pidAt(g.x,g.z)===pi&&Math.hypot(x-f.x,y-f.y)>40)return{x,y};}return null;},{pi:setup.mv,f:fig});
  await p.mouse.move(fig.x,fig.y);await p.mouse.down();for(let i=1;i<=12;i++){await p.mouse.move(fig.x+(dst.x-fig.x)*i/12,fig.y+(dst.y-fig.y)*i/12);await w(30);}await p.mouse.up();await w(600);
  const dr=await p.evaluate(({id,d})=>{const g=screenGround(d.x,d.y);return{p:(getArmy(id)||getArmy(UI.army)).p,cam:CAM.tx,dpid:g?pidAt(g.x,g.z):null,el:(document.elementFromPoint(d.x,d.y)||{}).id,d};},{id:setup.a,d:dst});ok(name+': Ziehen an der Figur marschiert',dr.p===setup.mv,{dr,fig});
  await p.evaluate(()=>{if(undoValid())undoMove();});await w(300);
  // 6) Angriffsblase auf freien Stamm
  if(setup.atk!=null){await p.evaluate(id=>{selectArmy(id);},setup.a);await focus(setup.atk);const pa=await scr(setup.atk);await p.evaluate(({x,y})=>tapAt(x,y),pa);await w(500);
    const ab=await p.evaluate(()=>{const e=document.getElementById('cmdbub');const g=e.querySelector('.bgo');const r=g.getBoundingClientRect();const hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return{txt:e.innerText.replace(/\s+/g,' '),cls:e.className,onTop:!!hit&&e.contains(hit),x:r.left+r.width/2,y:r.top+r.height/2};});
    ok(name+': Angriffsblase mit Aussicht, nicht verdeckt',/Angreifen/.test(ab.txt)&&/Aussicht/.test(ab.txt)&&ab.onTop,ab);
    await p.screenshot({path:`${OUT}/${name}_angriff.jpg`,quality:70}).catch(e=>console.log('shot',e.message));
    await p.touchscreen.tap(ab.x,ab.y);await w(600);
    const md=await p.evaluate(()=>({m:!document.getElementById('modal').hidden,h:(document.querySelector('#dialog h2')||{}).textContent,pv:UI.preview,mode:UI.mode,busy,bub:document.getElementById('cmdbub').style.transform}));ok(name+': Angriff öffnet die Schlacht-Abfrage',md.m&&/Angriff auf/.test(md.h||''),md);
    await p.evaluate(()=>{closeModal();});
    // ✕ bricht ab
    await p.evaluate(id=>{selectArmy(id);},setup.a);await p.evaluate(({x,y})=>tapAt(x,y),pa);await w(400);
    const xb=await p.evaluate(()=>{const r=document.querySelector('#cmdbub .bx').getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2};});await p.touchscreen.tap(xb.x,xb.y);await w(400);
    const xc=await p.evaluate(()=>({pv:UI.preview,vis:getComputedStyle(document.getElementById('cmdbub')).visibility}));ok(name+': ✕ schließt die Blase',xc.pv==null&&xc.vis==='hidden',xc);
  }else console.log('  (kein freier Stamm in Reichweite, Angriffstest übersprungen)');
  // 7) Rückgängig verfällt nach Rundenende
  await p.evaluate(id=>{selectArmy(id);},setup.a);await focus(setup.mv);const p3=await scr(setup.mv);await p.evaluate(({x,y})=>{tapAt(x,y);tapAt(x,y);},p3);await w(300);
  const before=await p.evaluate(()=>undoValid());await p.evaluate(async()=>{endTurn();for(let i=0;i<40&&busy;i++)await new Promise(z=>setTimeout(z,250));closeModal();});await w(500);
  const after=await p.evaluate(()=>undoValid());ok(name+': Rückgängig nur in derselben Runde',before&&!after,{before,after});
  ok(name+': keine Konsolenfehler',!errs.length,errs.slice(0,3).join(' | '));
  await ctx.close();
}
(async()=>{const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:process.env.PW_GPU?[]:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  await run(b,'handy',{width:844,height:390});await run(b,'ipad',{width:1180,height:820});
  console.log(`BED1 ${R.filter(Boolean).length}/${R.length}`);await b.close();})();
