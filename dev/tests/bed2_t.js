// node bed2_t.js <html> [tag]  – Bedienung Phase 1 Layout: Blatt, Aufgaben, Umschalter, Stadt, Kopfleiste, Langdruck, Einführung
const {chromium}=require('playwright');const fs=require('fs');
const FILE=process.argv[2],TAG=process.argv[3]||'neu',OUT=__dirname+'/bed2/';fs.mkdirSync(OUT,{recursive:true});
const R=[];const ok=(n,c,i='')=>{R.push(!!c);console.log((c?'PASS ':'FAIL ')+n+(i?'  '+i:''));};
async function run(tag,vp,mob,ph){const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:process.env.PW_GPU?[]:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({viewport:vp,deviceScaleFactor:1,hasTouch:true,isMobile:mob});const p=await ctx.newPage();const errs=[];
 p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|WebGL|GPU stall/.test(m.text()))errs.push(m.text().slice(0,140));});
 await p.addInitScript(()=>{try{localStorage.setItem('imperium.gfx',JSON.stringify({q:'leicht'}));localStorage.setItem('imperium.tut','1');}catch(e){}});
 await p.route(/cdnjs/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));
 await p.route(/fonts\.g/,r=>r.abort());
 await p.route(/\.html$/,r=>r.fulfill({body:'<!doctype html><meta charset=utf-8><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'+fs.readFileSync(FILE,'utf8'),contentType:'text/html; charset=utf-8'}));
 await p.goto('http://localhost:'+(process.env.PORT||8772)+'/imperium.html',{timeout:300000});await p.waitForFunction(()=>document.getElementById('loading').hidden,null,{timeout:300000});
 const sh=async n=>{await p.waitForTimeout(1200);await p.screenshot({path:OUT+TAG+'_'+tag+'_'+n+'.jpg',quality:65,timeout:120000}).catch(e=>console.log('shot',n,e.message));};
 // Prüft, ob die Mitte wichtiger Knöpfe auch wirklich den Knopf trifft
 const cover=async()=>p.evaluate(()=>{const sel=['#top button','#top [role=button]','#shToggle','#endBtn','#endMed','#modeBtn','#thSel button','#tdAll','#todo .tchip'];const bad=[],seen=[];
   for(const s of sel)for(const e of document.querySelectorAll(s)){const r=e.getBoundingClientRect();if(!r.width||!r.height||getComputedStyle(e).visibility==='hidden'||getComputedStyle(e).opacity==='0'||getComputedStyle(e).pointerEvents==='none'||e.closest('[hidden]'))continue;if(r.right<0||r.left>innerWidth||r.bottom<0||r.top>innerHeight)continue;
     const x=r.left+r.width/2,y=r.top+r.height/2,h=document.elementFromPoint(x,y);seen.push(e.id||s);if(!h||!(e===h||e.contains(h))){bad.push((e.id||s)+'→'+(h?(h.id||h.className||h.tagName):'null'));}}
   return{bad,n:seen.length};});
 for(const fac of ['rom','qin']){
  await p.evaluate(async f=>{const w=ms=>new Promise(z=>setTimeout(z,ms));window.showEvent=(E,ctx,next)=>{try{E.opts[0].fx(S.player,ctx);}catch(e){}next&&next();};newGame(f);loadGame(S);await w(800);try{closeModal();}catch(e){}UI.sel=capitalOf(S.player);UI.army=null;UI.mode='prov';$('#sheet').classList.remove('collapsed');refresh();await w(600);},fac);
 await p.waitForFunction(()=>!document.querySelector('#loading[data-gate]'),null,{timeout:400000}).catch(()=>{});await p.waitForTimeout(1500);
  await sh(fac+'_provinz');
  const c1=await cover();ok(`${tag} ${fac}: keine Überdeckung wichtiger Knöpfe (Blatt offen)`,!c1.bad.length,JSON.stringify(c1));
  const st=await p.evaluate(async()=>{const w=ms=>new Promise(z=>setTimeout(z,ms));const sh=$('#sheet');const r0=sh.getBoundingClientRect();$('#shToggle').click();await w(300);const r1=sh.getBoundingClientRect();const col=sh.classList.contains('collapsed');$('#shToggle').click();await w(300);
    const td=$('#todo');return{w:Math.round(r0.width),h0:Math.round(r0.height),h1:Math.round(r1.height),col,back:!sh.classList.contains('collapsed'),todoCmp:td.classList.contains('cmp'),todoN:td.querySelectorAll('.tchip').length,todoH:Math.round(td.getBoundingClientRect().height),thSel:!$('#thSel').hidden,th:(()=>{const r=$('#thSel').getBoundingClientRect();return[r.left,r.top,r.width,r.height].map(Math.round)})()};});
  ok(`${tag} ${fac}: Blatt mit einem Tipp ein- und ausklappbar`,st.col&&st.back&&st.h1<st.h0*0.5,JSON.stringify(st));
  if(ph)ok(`${tag} ${fac}: Blatt schmaler als 300 px`,st.w<=300,'Breite '+st.w);
  if(ph){ok(`${tag} ${fac}: Aufgaben als ein Knopf`,st.todoCmp&&st.todoN===1,JSON.stringify(st));
    const o=await p.evaluate(async()=>{const w=ms=>new Promise(z=>setTimeout(z,ms));const b=$('#tdAll');if(!b)return{err:'kein Knopf'};b.click();await w(300);const n=$('#todo').querySelectorAll('.tchip').length;return{n,close:!!$('#tdClose')};});
    await sh(fac+'_aufgaben_offen');
    const c2=await cover();
    const o2=await p.evaluate(async()=>{const w=ms=>new Promise(z=>setTimeout(z,ms));$('#tdClose').click();await w(300);return $('#todo').querySelectorAll('.tchip').length;});
    ok(`${tag} ${fac}: Aufgaben auf- und zuklappen`,o.n>1&&o.close&&o2===1,JSON.stringify({o,o2,c2}));}
 }
 // Stadtansicht: eine Ebene
 const cv=await p.evaluate(async()=>{const w=ms=>new Promise(z=>setTimeout(z,ms));openCityView(capitalOf(S.player));await w(800);const vis=getComputedStyle($('#sheet')).visibility;const cp=$('#cityPanel').getBoundingClientRect();return{vis,cp:[cp.left,cp.top,cp.width,cp.height].map(Math.round)};});
 await sh('stadt');
 if(ph)ok(`${tag}: Stadtansicht ohne Blatt darunter`,cv.vis==='hidden',JSON.stringify(cv));
 const cv2=await p.evaluate(async()=>{const w=ms=>new Promise(z=>setTimeout(z,ms));closeCityView(true);await w(400);return getComputedStyle($('#sheet')).visibility;});
 ok(`${tag}: Blatt nach Stadtansicht wieder sichtbar`,cv2==='visible',cv2);
 // Langes Drücken auf einen Kopfleisten-Knopf zeigt die Beschriftung, löst aber nichts aus
 const lp=await p.evaluate(async()=>{const w=ms=>new Promise(z=>setTimeout(z,ms));const b=$('#navEco');const r=b.getBoundingClientRect();const o={bubbles:true,pointerType:'touch',clientX:r.left+5,clientY:r.top+5,pointerId:7};
   b.dispatchEvent(new PointerEvent('pointerdown',o));await w(600);const t=$('#tipBub')?$('#tipBub').textContent:null;b.dispatchEvent(new PointerEvent('pointerup',o));b.click();await w(300);const opened=!$('#modal').hidden;try{closeModal();}catch(e){}
   b.click();await w(500);const opened2=!$('#modal').hidden;try{closeModal();}catch(e){}return{t,opened,opened2};});
 ok(`${tag}: Langes Drücken zeigt Beschriftung, normaler Tipp öffnet`,lp.t&&!lp.opened&&lp.opened2,JSON.stringify(lp));
 const lab=await p.evaluate(()=>[...document.querySelectorAll('.navbtn span')].map(s=>getComputedStyle(s).display+':'+s.textContent));
 console.log(tag,'Beschriftungen',JSON.stringify(lab),'Forschung:',await p.evaluate(()=>$('#resPct').textContent));
 // Einführung Schritt 3
 await p.evaluate(()=>{tutI=2;showTut();});await sh('tut3');
 const tt=await p.evaluate(()=>({txt:$('#tutText').textContent.slice(0,40),n:TUT.length}));ok(`${tag}: Einführung aktualisiert`,/Heere bewegen/.test(tt.txt)&&tt.n===7,JSON.stringify(tt));
 await p.evaluate(()=>{tutI=-1;showTut();});
 // Doppeltes Schließen
 const dc=await p.evaluate(async()=>{const w=ms=>new Promise(z=>setTimeout(z,ms));showModal('<h2>Test</h2><p>x</p>',[{label:'Schließen'}]);await w(200);const a=$('#dialog .actions');const vis=a&&getComputedStyle(a).display!=='none';$('#dialog .dlgx').click();await w(200);return{vis,closed:$('#modal').hidden};});
 ok(`${tag}: Fenster schließt über ✕`,dc.closed,JSON.stringify(dc));
 await p.evaluate(()=>{UI.sel=capitalOf(S.player);UI.mode='prov';refresh();});await sh('menue_hof');
 ok(`${tag}: keine Konsolenfehler`,!errs.length,errs.slice(0,3).join(' | '));
 await b.close();}
(async()=>{await run('phone',{width:844,height:390},true,true);await run('ipad',{width:1180,height:820},true,false);await run('desk',{width:1440,height:900},false,false);
 console.log(`BED2 ${R.filter(Boolean).length}/${R.length}`);})();
