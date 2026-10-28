// node rev_fix_t.js <html> [port] – Review-Funde + neue Ereignisbilder
const {chromium}=require('playwright');const fs=require('fs');
const FILE=process.argv[2],PORT=process.argv[3]||'8772';const R=[];const ok=(n,c,i='')=>{R.push(!!c);console.log((c?'PASS ':'FAIL ')+n+(i?'  '+i:''));};
(async()=>{const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:process.env.PW_GPU?[]:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const errs=[];
async function page(vw,vh){const ctx=await b.newContext({viewport:{width:vw,height:vh},hasTouch:true,isMobile:vw<900});const p=await ctx.newPage();
 p.on('pageerror',e=>errs.push('PAGE '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|WebGL|GPU stall/.test(m.text()))errs.push('CON '+m.text().slice(0,160));});
 await p.addInitScript(()=>{try{localStorage.setItem('imperium.gfx',JSON.stringify({q:'leicht'}));localStorage.removeItem('imperium.dev');}catch(e){}});
 await p.route(/\.html$/,r=>r.fulfill({body:fs.readFileSync(FILE),contentType:'text/html; charset=utf-8'}));await p.route(/fonts\.g/,r=>r.abort());
 await p.goto(`http://localhost:${PORT}/imperium.html`,{timeout:300000});await p.waitForFunction(()=>document.getElementById('loading').hidden,null,{timeout:300000});return p;}
const p=await page(844,390);
await p.waitForTimeout(2500);
const ts=await p.evaluate(()=>{const e=document.getElementById('testSaves');return{hid:!e||e.hidden||!e.offsetParent,txt:document.body.innerText.includes('Test-Spielstände')};});
ok('Test-Spielstände ohne Entwicklermodus unsichtbar',ts.hid&&!ts.txt,JSON.stringify(ts));
const od=await p.evaluate(()=>[0.45,0.25,0.1,1.0].map(r=>oddsText(r)[0]));
ok('Aussicht 31 % = Ungünstig, 20 % = Sehr ungünstig, 9 % = Aussichtslos',od[0]==='Ungünstig'&&od[1]==='Sehr ungünstig'&&od[2]==='Aussichtslos',JSON.stringify(od));
const cam=await p.evaluate(async()=>{newGame('rom');loadGame(S);closeModal();await new Promise(z=>setTimeout(z,4500));
  if(camTween){CAM.tx=camTween.tx;CAM.tz=camTween.tz;CAM.d=camTween.d;applyCam();camera.updateMatrixWorld();}const pi=capitalOf(S.player),c=CAP[pi];const sh=document.getElementById('sheet').getBoundingClientRect();
  const v=new THREE.Vector3(c.x,0,c.z).project(camera);const sx=(v.x+1)/2*innerWidth;
  return{sx:Math.round(sx),sheetL:Math.round(sh.left),sheetHidden:document.getElementById('sheet').hidden,tw:camTween?Math.round((camTween.tx-c.x)*100)/100:null,dx:Math.round((CAM.tx-c.x)*100)/100};});
ok('Handy: Hauptstadt beim Start links vom Blatt sichtbar',cam.sheetHidden||(cam.sx>0&&cam.sx<cam.sheetL),JSON.stringify(cam));
await p.screenshot({path:__dirname+'/rev_fix_handy_start.jpg',quality:70,timeout:120000}).catch(e=>console.log('shot',e.message.slice(0,60)));
const pin=await p.evaluate(async()=>{for(let i=0;i<3;i++)addLog('Ein sehr langer Testeintrag über die Lage in Latium, der in der Chronik bis an den rechten Rand reichen soll, damit man eine Überdeckung sieht.',true,'info');
  let L=S.log||[];try{openChronicle();}catch(e){return'ERR '+e.message;}await new Promise(z=>setTimeout(z,600));
  const lis=[...document.querySelectorAll('#dialog .log li')].filter(li=>li.querySelector('.jump'));if(!lis.length)return{n:0,all:document.querySelectorAll('#dialog .log li').length};
  const li=lis[0],bt=li.querySelector('.jump').getBoundingClientRect();const r=document.createRange();const tn=[...li.childNodes].filter(n=>n!==li.querySelector('.jump')&&n!==li.querySelector('span'));let mx=0;for(const n of tn){r.selectNodeContents(n);for(const q of r.getClientRects())mx=Math.max(mx,q.right);}
  return{n:lis.length,textRight:Math.round(mx),btnLeft:Math.round(bt.left)};});
ok('Chronik: 📍 überdeckt keinen Text',pin.n===0?null:pin.textRight<=pin.btnLeft+1,JSON.stringify(pin));
await p.screenshot({path:__dirname+'/rev_fix_chronik.jpg',quality:70,timeout:120000}).catch(e=>console.log('shot',e.message.slice(0,60)));
const st=await p.evaluate(()=>{closeModal();const F=S.fac[S.player],r0=F.rel;const a=stImg({},{build:['market']});F.rel='ortho';const b2=stImg({},{build:['market']});F.rel=r0;return[a,b2,facRel(S.player),facCul(S.player)];});
ok('Kapitelbild: Gelehrte nur lateinisch-christlich, orthodox → Händler',st[1]==='ev_haendler',JSON.stringify(st));
const pk=await p.evaluate(async()=>{await pkLoad('pk_neu');const ks=['ev_glaubensbund','ev_glaubenswelle','ev_hausgesetz','ev_soeldner_meuterei','ev_westfalen','war_feldzug','war_soeldner','war_tross'];
  return{loaded:ks.filter(k=>!!heroImg(k,0,false)).length,man:OFF_MAN.some(x=>x[0]==='img/pk_neu.json'),ver:OFF_VER};});
ok('pk_neu: 8 Bilder geladen, im Offline-Manifest, OFF_VER v177',pk.loaded===8&&pk.man&&pk.ver==='v177',JSON.stringify(pk));
const p2=await page(1180,820);
const dl=await p2.evaluate(async()=>{newGame('rom');loadGame(S);closeModal();await pkLoad('pk_neu');const out={};const bg=()=>{const e=document.querySelector('#dialog .ephero');return e?e.style.backgroundImage.slice(0,30):''};
  try{lawOpen();}catch(e){out.law='ERR '+e.message;}out.law=out.law||bg();closeModal();
  const a=S.armies.find(x=>x.f===S.player);
  try{openSldPick(a);}catch(e){out.sld='ERR '+e.message;}out.sld=out.sld||bg();closeModal();
  const foe=rivals(S.player).find(x=>x!=='horde'&&alive(x)&&sharesBorder(S.player,x))||rivals(S.player)[0];try{declareWar(S.player,foe);}catch(e){}
  try{openFzPick(a);}catch(e){out.fz='ERR '+e.message;}out.fz=out.fz||bg();closeModal();
  a.tr=a.tr||{t:S.turn};try{selArmy?selArmy(a.id):null;}catch(e){}
  S.sldMut={n:2,d:1,p:1,x:0};let shown='';const old=window.showEvent;window.showEvent=(E,ctx,next)=>{if(E.id==='sld_meuterei'||E.id==='relfrieden'){old(E,ctx,()=>{});shown+=E.id+':'+bg()+' ';closeModal();next&&next();}else{try{E.opts[0].fx(S.player,ctx);}catch(e){}next&&next();}};
  await new Promise(z=>runEvents(z));
  S.relFr=null;S.epochTurn=S.turn-100;const _ep=window.ep;
  const x=(()=>{try{const live=PLAYABLE.filter(f=>alive(f));const e1=live.find(f=>f!==S.player),e2=live.find(f=>f!==S.player&&f!==e1);S.fac[S.player].rel='christ';S.fac[e1].rel='evang';S.fac[e2].rel='christ';const e0=S.epoch;S.epoch=3;const r=relPeaceCheck();S.epoch=e0;return r;}catch(e){return 'ERR '+e.message;}})();
  out.wx=x&&x.E?'ok':String(x);if(x&&x.E){showEvent(x.E,x.ctx,()=>{});shown+='westfalen:'+bg();closeModal();}
  window.showEvent=old;out.ev=shown;return out;});
ok('Hausgesetz-Fenster mit Bild',/blob:|data:|url/.test(dl.law)&&!/^ERR/.test(dl.law),dl.law);
ok('Söldner-Fenster mit Bild',/blob:|data:|url/.test(dl.sld)&&!/^ERR/.test(dl.sld),dl.sld);
ok('Feldzug-Fenster mit Bild (oder kein Ziel)',/blob:|data:|url/.test(dl.fz)||dl.fz==='',dl.fz);
ok('Meuterei-Ereignis mit Bild',/sld_meuterei:url/.test(dl.ev),dl.ev);
ok('Westfälischer Friede mit Bild',/relfrieden:url/.test(dl.ev),dl.ev+' | '+dl.wx);
await p2.screenshot({path:__dirname+'/rev_fix_ipad.jpg',quality:70,timeout:120000}).catch(e=>console.log('shot',e.message.slice(0,60)));
ok('Keine Seiten-/Konsolenfehler',!errs.length,errs.slice(0,4).join(' | '));
console.log(`REVFIX ${R.filter(Boolean).length}/${R.length}`);await b.close();})();
