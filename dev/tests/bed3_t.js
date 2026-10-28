// node bed3_t.js <html> [port] – Bedienung Phase 2: Heer-Stapel auffächern, Hinweisfeld weicht aus, Kurzhilfe „?“
const {chromium}=require('playwright');const fs=require('fs');
const FILE=process.argv[2],PORT=process.argv[3]||'8772',OUT=__dirname+'/bed3';fs.mkdirSync(OUT,{recursive:true});
const R=[];const ok=(n,c,i='')=>{R.push(!!c);console.log((c?'PASS ':'FAIL ')+n+(i?'  '+(typeof i==='string'?i:JSON.stringify(i)):''));};
async function run(b,name,vp){
  const ctx=await b.newContext({viewport:vp,deviceScaleFactor:1,hasTouch:true,isMobile:vp.width<900});
  const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push('PAGE '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|WebGL|GPU stall/.test(m.text()))errs.push('CON '+m.text().slice(0,160));});
  await p.addInitScript(()=>{try{localStorage.setItem('imperium.gfx',JSON.stringify({q:'leicht'}));}catch(e){}});
  await p.route(/fonts\.g/,r=>r.abort());
  await p.route(/\.html$/,r=>r.fulfill({body:fs.readFileSync(FILE),contentType:'text/html; charset=utf-8'}));
  await p.goto(`http://localhost:${PORT}/imperium.html`,{timeout:300000});await p.waitForFunction(()=>document.getElementById('loading').hidden,null,{timeout:300000});
  const w=ms=>p.waitForTimeout(ms);
  const tick=()=>p.evaluate(()=>{for(let i=0;i<30;i++)applyCam();camera.updateMatrixWorld();placeChips();placeBub();placeUndo();HD.t=0;hintDodge();});
  // 1) Drei eigene Heere in eine Provinz
  const st=await p.evaluate(()=>{window.showEvent=(E,c,n)=>{try{E.opts[0].fx(S.player,c);}catch(e){}n&&n();};window.picMsg=()=>{};newGame('rom');loadGame(S);closeModal();try{$('#tut').hidden=true;}catch(e){}
    const pi=capitalOf(S.player);const a1=scenArmy(S.player,pi,[['sword','legion']]),a2=scenArmy(S.player,pi,[['spear','hastati'],['missile','schleud']]);
    syncTokens();refresh();const c=CAP[pi];camTween=null;CAM.tx=c.x;CAM.tz=c.z+1.2;CAM.d=9;
    return{pi,ids:armiesAt(pi).filter(a=>a.f===S.player).map(a=>a.id)};});
  await w(500);await tick();await w(200);await tick();
  const ch=await p.evaluate(ids=>ids.map(id=>{const t=TOK.get(id),r=t.chip.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,h=document.elementFromPoint(cx,cy);
    return{id,l:Math.round(r.left),r:Math.round(r.right),t:Math.round(r.top),b:Math.round(r.bottom),cx,cy,vis:getComputedStyle(t.chip).visibility,own:!!h&&t.chip.contains(h),hitH:Math.round(r.height+2*(parseFloat(getComputedStyle(t.chip,'::after').top)*-1||0))};}),st.ids);
  const over=ch.some((a,i)=>ch.some((b,j)=>j>i&&a.l<b.r&&b.l<a.r&&a.t<b.b&&b.t<a.b));
  ok(name+': '+ch.length+' Heer-Marken in einer Provinz überlappen nicht',ch.length>=3&&!over&&ch.every(c=>c.vis==='visible'),ch);
  ok(name+': jede Marke einzeln antippbar (elementFromPoint), Trefferhöhe ≥44 px',ch.every(c=>c.own&&c.hitH>=44),ch.map(c=>[c.own,c.hitH]));
  await p.screenshot({path:`${OUT}/${name}_stapel.jpg`,quality:72,timeout:90000}).catch(e=>console.log('shot',e.message));
  let tapOk=true;const tlog=[];for(const c0 of ch){const c=await p.evaluate(id=>{const r=TOK.get(id).chip.getBoundingClientRect();const cx=r.left+r.width/2,cy=r.top+r.height/2,h=document.elementFromPoint(cx,cy);return{id,cx,cy,at:h?(h.id||h.className||h.tagName):''};},c0.id);await p.touchscreen.tap(c.cx,c.cy);await w(350);const u=await p.evaluate(()=>UI.army);tlog.push([c.id,u,c.at]);if(u!==c.id)tapOk=false;await p.evaluate(()=>{UI.army=null;UI.mode='idle';UI.sel=null;refresh();});await w(150);await tick();}
  ok(name+': Antippen jeder Marke wählt genau dieses Heer',tapOk,tlog);
  // 2) Hinweisfeld: gewähltes Heer genau unter das Hinweisfeld schieben → weicht aus
  const hd=await p.evaluate(async id=>{selectArmy(id);refresh();const h=$('#hint');const t=TOK.get(id);
    const prj=()=>{const q=t.g.position;V.set(q.x,q.y+0.3,q.z).project(camera);return{x:(V.x+1)/2*innerWidth,y:(1-V.y)/2*innerHeight};};
    h.classList.remove('hdodge');HD.m=0;const hr=h.getBoundingClientRect();const tx=hr.left+hr.width*0.75,ty=hr.top+hr.height/2;
    for(let k=0;k<12;k++){for(let i=0;i<30;i++)applyCam();camera.updateMatrixWorld();const s=prj();ndc.set(tx/innerWidth*2-1,-(ty/innerHeight)*2+1);ray.setFromCamera(ndc,camera);const hit=ray.intersectObjects(TERRAIN_MESHES.filter(m=>m.parent&&m.parent.visible))[0];if(!hit)break;
      ndc.set(s.x/innerWidth*2-1,-(s.y/innerHeight)*2+1);ray.setFromCamera(ndc,camera);const h2=ray.intersectObjects(TERRAIN_MESHES.filter(m=>m.parent&&m.parent.visible))[0];if(!h2)break;CAM.tx+=h2.point.x-hit.point.x;CAM.tz+=h2.point.z-hit.point.z;camTween=null;}
    for(let i=0;i<30;i++)applyCam();camera.updateMatrixWorld();placeChips();const s=prj();const before=document.elementFromPoint(s.x,s.y);const b0=before?(before.id||before.className||before.tagName):'';
    HD.t=0;hintDodge();const r=h.getBoundingClientRect();const after=document.elementFromPoint(s.x,s.y);
    return{mode:UI.mode,hidden:h.hidden,army:s,hint0:{l:Math.round(hr.left),t:Math.round(hr.top),r:Math.round(hr.right),b:Math.round(hr.bottom)},hint:{l:Math.round(r.left),t:Math.round(r.top),r:Math.round(r.right),b:Math.round(r.bottom)},dodge:h.classList.contains('hdodge'),before:b0,after:after?(after.id||after.className||after.tagName):'',inHint:!!after&&h.contains(after)};},st.ids[0]);
  ok(name+': Hinweisfeld weicht dem gewählten Heer aus',!hd.hidden&&hd.dodge&&!hd.inHint&&!(hd.army.x>hd.hint.l&&hd.army.x<hd.hint.r&&hd.army.y>hd.hint.t&&hd.army.y<hd.hint.b),hd);
  await p.screenshot({path:`${OUT}/${name}_hinweis.jpg`,quality:72}).catch(e=>console.log('shot',e.message));
  const back=await p.evaluate(()=>{const c=CAP[capitalOf(S.player)];CAM.tx=c.x+6;CAM.tz=c.z+6;for(let i=0;i<40;i++)applyCam();camera.updateMatrixWorld();HD.t=0;hintDodge();return $('#hint').classList.contains('hdodge');});
  ok(name+': Hinweisfeld kehrt an seinen Platz zurück, wenn frei',!back);
  await p.evaluate(()=>{UI.army=null;UI.mode='idle';refresh();});
  // 3) Kurzhilfe
  const hp=await p.evaluate(()=>{const out={};const riv=Object.keys(S.fac).find(x=>x!==S.player&&S.fac[x].alive&&knows(x));
    for(const[k,fn]of[['reich',()=>openOverview()],['eco',()=>openEconomy('over')],['hof',()=>openHof('hof')],['res',()=>openResearch()],['dip',()=>openDiplomacy(riv)]]){fn();const d=$('#dialog'),b=d.querySelector('.dlgh'),x=d.querySelector('.dlgx');
      if(!b){out[k]={btn:false};closeModal();continue;}const br=b.getBoundingClientRect(),xr=x.getBoundingClientRect();b.click();const box=d.querySelector('.helpbox');
      out[k]={btn:true,sz:Math.round(Math.min(br.width,br.height)),sep:br.right<=xr.left+1||br.left>=xr.right-1||br.bottom<=xr.top||br.top>=xr.bottom,shown:box&&!box.hidden,len:box?box.textContent.length:0};closeModal();}
    openEconomy('fin');const t1=$('#dialog .helpbox').textContent;closeModal();openHof('fam');const t2=$('#dialog .helpbox').textContent;closeModal();openEconomy('over');const t0=$('#dialog .helpbox').textContent;
    out.tabs={diff:t1!==t0&&!!t2,fam:/Hausgesetz/.test(t2)};return out;});
  ok(name+': „?“ in Reich, Wirtschaft, Hof, Forschung, Diplomatie, ≥44 px, neben ✕',['reich','eco','hof','res','dip'].every(k=>hp[k].btn&&hp[k].sz>=44&&hp[k].sep&&hp[k].shown&&hp[k].len>60),hp);
  ok(name+': Kurzhilfe je Reiter verschieden',hp.tabs.diff&&hp.tabs.fam,hp.tabs);
  await p.evaluate(()=>{$('#dialog .dlgh').click();});await w(200);
  await p.screenshot({path:`${OUT}/${name}_hilfe.jpg`,quality:72}).catch(e=>console.log('shot',e.message));
  await p.evaluate(()=>closeModal());
  ok(name+': keine Konsolenfehler',!errs.length,errs.slice(0,4).join(' | '));
  await ctx.close();}
(async()=>{const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:process.env.PW_GPU?[]:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  await run(b,'handy',{width:844,height:390});await run(b,'ipad',{width:1180,height:820});
  console.log(`BED3 ${R.filter(Boolean).length}/${R.length}`);await b.close();})();
