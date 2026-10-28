// node stk_t.js <html> [port] – gestapelte Heer-Marken fächern auf, Tipp wählt das richtige Heer, Treffer ≥44 px; Hinweisfeld weicht aus
const {chromium}=require('playwright');const fs=require('fs');
const FILE=process.argv[2],PORT=process.argv[3]||'8772',OUT=__dirname+'/stk';fs.mkdirSync(OUT,{recursive:true});
const R=[];const ok=(n,c,i='')=>{R.push(!!c);console.log((c?'PASS ':'FAIL ')+n+(i?'  '+JSON.stringify(i):''));};
async function run(b,name,vp){
  const ctx=await b.newContext({viewport:vp,deviceScaleFactor:1,hasTouch:true,isMobile:vp.width<900});
  const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push('PAGE '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|WebGL|GPU stall/.test(m.text()))errs.push('CON '+m.text().slice(0,160));});
  await p.addInitScript(()=>{try{localStorage.setItem('imperium.gfx',JSON.stringify({q:'leicht'}));}catch(e){}});
  await p.route(/fonts\.g/,r=>r.abort());
  await p.route(/\.html$/,r=>r.fulfill({body:fs.readFileSync(FILE),contentType:'text/html; charset=utf-8'}));
  await p.goto(`http://localhost:${PORT}/imperium.html`,{timeout:300000});await p.waitForFunction(()=>document.getElementById('loading').hidden,null,{timeout:300000});
  const w=ms=>p.waitForTimeout(ms);
  const setup=await p.evaluate(()=>{window.showEvent=(E,c,n)=>{try{E.opts[0].fx(S.player,c);}catch(e){}n&&n();};window.picMsg=()=>{};newGame('rom');loadGame(S);closeModal();try{$('#tut').hidden=true;}catch(e){}
    const a=S.armies.find(x=>x.f===S.player);const pi=a.p;const ids=[a.id];
    for(let i=0;i<3;i++){const n=JSON.parse(JSON.stringify(a));n.id=Math.max(...S.armies.map(x=>x.id))+1;n.name=a.name+' '+(i+2);n.pos=null;S.armies.push(n);ids.push(n.id);}
    S.armies.forEach(x=>{if(ids.includes(x.id))x.pos=null;});syncTokens();return{pi,ids};});
  await p.evaluate(pi=>{focusProv(pi,14);camTween=null;const c=CAP[pi];CAM.tx=c.x;CAM.tz=c.z+1.2;CAM.d=14;for(let i=0;i<40;i++)applyCam();camera.updateMatrixWorld();needRender=5;},setup.pi);await w(900);
  await p.evaluate(()=>{for(let i=0;i<40;i++)applyCam();camera.updateMatrixWorld();needRender=5;try{placeChips();}catch(e){}});await w(700);await p.evaluate(()=>{try{placeChips();}catch(e){}});
  const st=await p.evaluate(ids=>{const L=ids.map(id=>{const t=TOK.get(id);const r=t.chip.getBoundingClientRect();return{id,l:r.left,r:r.right,t:r.top,b:r.bottom,w:r.width,stk:t.chip.classList.contains('stk'),vis:getComputedStyle(t.chip).visibility};});
    let ov=0;for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++){const a=L[i],b=L[j];if(a.l<b.r-1&&b.l<a.r-1&&a.t<b.b-1&&b.t<a.b-1)ov++;}
    return{ov,L:L.map(o=>({id:o.id,x:Math.round(o.l),y:Math.round(o.t),w:Math.round(o.w),stk:o.stk,vis:o.vis}))};},setup.ids);
  ok(name+': 4 Heere in einer Provinz überlappen nicht',st.ov===0&&st.L.every(o=>o.vis!=='hidden'),st);
  ok(name+': mind. 2 Marken gefächert (Stapel erkannt)',st.L.filter(o=>o.stk).length>=2,st.L.map(o=>o.stk));
  // Trefferfläche: Mitte und Rand jeder Marke treffen die eigene Marke
  const hit=await p.evaluate(ids=>ids.map(id=>{const t=TOK.get(id);const r=t.chip.getBoundingClientRect();const pts=[[r.left+r.width/2,r.top+r.height/2],[r.left+r.width/2,r.top-8],[r.left+r.width/2,r.bottom+8]];
    const hs=pts.map(([x,y])=>{const e=document.elementFromPoint(x,y);return !!e&&(e===t.chip||t.chip.contains(e));});return{id,hs,h:Math.round(r.height+20),w:Math.round(r.width)};}),setup.ids);
  ok(name+': jede Marke mit eigener Trefferfläche (Höhe ≥44 inkl. Rand)',hit.every(o=>o.hs[0]&&o.hs[1]&&o.hs[2]&&o.h>=44&&o.w>=44),hit);
  await p.screenshot({path:`${OUT}/${name}_stapel.jpg`,quality:75,timeout:120000}).catch(e=>console.log('shot',e.message));
  // echter Tipp auf die 3. Marke wählt das 3. Heer
  const c3=await p.evaluate(id=>{const r=TOK.get(id).chip.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2};},setup.ids[2]);
  await p.touchscreen.tap(c3.x,c3.y);await w(600);
  const sel=await p.evaluate(()=>UI.army);ok(name+': Tipp auf 3. Marke wählt 3. Heer',sel===setup.ids[2],{sel,want:setup.ids[2]});
  // Hinweisfeld: gewähltes Heer im Bereich des Hinweisfelds → weicht aus
  const hv=await p.evaluate(async id=>{const w=ms=>new Promise(z=>setTimeout(z,ms));const h=$('#hint');h.classList.remove('hl');selectArmy(id);UI.mode='move';refresh();await w(300);
    const hr=h.getBoundingClientRect();const t=TOK.get(id);const sx=hr.left+hr.width/2,sy=hr.top+hr.height/2;
    // Kamera so verschieben, dass die Figur unter dem Hinweisfeld liegt
    for(let k=0;k<30;k++){const p=t.g.position;V.set(p.x,p.y+0.15,p.z).project(camera);const fx=(V.x+1)/2*innerWidth,fy=(1-V.y)/2*innerHeight;const dx=(fx-sx)/innerWidth*CAM.d*0.9,dy=(fy-sy)/innerHeight*CAM.d*0.6;if(Math.abs(fx-sx)<4&&Math.abs(fy-sy)<4)break;CAM.tx+=dx;CAM.tz+=dy;camTween=null;for(let i=0;i<20;i++)applyCam();camera.updateMatrixWorld();}
    needRender=5;await w(500);for(let i=0;i<3;i++){try{placeHint();}catch(e){}}await w(200);
    const p=t.g.position;V.set(p.x,p.y+0.15,p.z).project(camera);const fx=(V.x+1)/2*innerWidth,fy=(1-V.y)/2*innerHeight;const r2=h.getBoundingClientRect();const e=document.elementFromPoint(fx,fy);
    return{hl:h.classList.contains('hl'),fig:[Math.round(fx),Math.round(fy)],hint:[Math.round(r2.left),Math.round(r2.top),Math.round(r2.right),Math.round(r2.bottom)],covered:!!e&&h.contains(e),el:e&&(e.id||e.className||e.tagName)};},setup.ids[0]);
  ok(name+': Hinweisfeld verdeckt das gewählte Heer nicht',!hv.covered,hv);
  await p.screenshot({path:`${OUT}/${name}_hint.jpg`,quality:75,timeout:120000}).catch(e=>console.log('shot',e.message));
  ok(name+': keine Konsolenfehler',!errs.length,errs.slice(0,3));
  await ctx.close();}
(async()=>{const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:process.env.PW_GPU?[]:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  await run(b,'handy',{width:844,height:390});await run(b,'ipad',{width:1180,height:820});
  console.log(`STK ${R.filter(Boolean).length}/${R.length}`);await b.close();})();
