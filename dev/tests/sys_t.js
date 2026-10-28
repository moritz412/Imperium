// node sys_t.js <html> [port] – Haushalt/Ordnung gebündelt, Ware besorgen, Kriegsdrohung, Glaubensreiter, Schlüsseltechnik
const {chromium}=require('playwright');const fs=require('fs');const F=process.argv[2],PORT=process.argv[3]||'8772';
(async()=>{const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:process.env.PW_GPU?[]:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:1180,height:820},hasTouch:true});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|WebGL|GPU/.test(m.text()))errs.push(m.text().slice(0,150));});
await p.addInitScript(()=>{try{localStorage.setItem('imperium.gfx',JSON.stringify({q:'leicht'}));}catch(e){}});
await p.route(/\.html$/,r=>r.fulfill({body:fs.readFileSync(F),contentType:'text/html; charset=utf-8'}));await p.route(/fonts\.g/,r=>r.abort());
await p.goto(`http://localhost:${PORT}/imperium.html`,{timeout:300000});await p.waitForFunction(()=>document.getElementById('loading').hidden,null,{timeout:300000});
const R=[];const ok=(n,c,i='')=>{R.push(!!c);console.log((c?'PASS ':'FAIL ')+n+(i?'  '+i:''));};
const r=await p.evaluate(async()=>{const w=ms=>new Promise(z=>setTimeout(z,ms));const o={};newGame('rom');loadGame(S);closeModal();
 try{ECO_TAB='fin';openEconomy();await w(300);const d=document.querySelector('#dialog');o.bg=d.querySelectorAll('.bgrp>summary').length;o.btot=!!d.querySelector('.btot');
  // Summe der Gruppen = Bilanz
  const I=income(S.player);let sum=0;o.btxt=[];d.querySelectorAll('.bgrp>summary b').forEach(b=>{o.btxt.push(b.textContent);const t=b.textContent.replace(/[.\s\u202f\u00a0]/g,'').replace('−','-').replace(',','.');sum+=parseFloat(t);});o.bsum=Math.round(sum);o.net=Math.round(I.net);closeModal();}catch(e){o.ferr=e.message;}
 try{ECO_TAB='over';openEconomy();await w(300);o.ggrp=document.querySelectorAll('#dialog tr.ggrp').length;closeModal();}catch(e){o.gerr=e.message;}
 try{openProcure('holz');await w(300);o.proc=!!document.querySelector('#dialog .procrec');o.proch=(document.querySelector('#dialog h2')||{}).textContent;closeModal();}catch(e){o.perr=e.message;}
 try{const pi=capitalOf(S.player);openProvince?openProvince(pi):null;}catch(e){}
 try{const pi=capitalOf(S.player);const h=ordGroupsHtml(pi,orderParts(pi));o.og=(h.match(/class="ordg"/g)||[]).length;}catch(e){o.oerr=e.message;}
 try{openHof('kir');await w(300);o.kir=[...document.querySelectorAll('#dialog h3')].map(x=>x.textContent.trim());closeModal();openHof('fam');await w(300);o.fam=[...document.querySelectorAll('#dialog h3, #dialog summary')].map(x=>x.textContent.trim()).filter(t=>/Heirat/.test(t)).length;closeModal();}catch(e){o.herr=e.message;}
 try{openResearch();await w(300);o.tkey=document.querySelectorAll('#dialog .tkey').length;closeModal();}catch(e){o.rerr=e.message;}
 // Kriegsdrohung
 try{const e=rivals(S.player).filter(x=>x!=='horde'&&alive(x)&&dip(x,S.player).st==='peace').sort((a,b)=>relation(a,S.player)-relation(b,S.player))[0];o.rel=relation(e,S.player);o.x=e;warThreat(e,S.player);o.pend=!!warPendOf(e,S.player);o.mood=warMoodTxt(e,S.player).t;const due=warPendOf(e,S.player).due;
  S.turn=due-1;warPendRound(e);o.still=!!warPendOf(e,S.player)&&dip(e,S.player).st==='peace';S.turn=due;warPendRound(e);o.war=dip(e,S.player).st==='war';o.gone=!warPendOf(e,S.player);
  openDiplomacy(e);await w(300);o.dipMood=/Stimmung/.test(document.querySelector('#dialog').textContent);closeModal();
  const e2=rivals(S.player).find(x=>x!==e&&x!=='horde'&&alive(x)&&dip(x,S.player).st==='peace');warThreat(e2,S.player);const d2=dip(e2,S.player);d2.nap=S.turn+20;warPendRound(e2);o.cancel=!warPendOf(e2,S.player)&&d2.st==='peace';}catch(e){o.werr=e.message;}
 return o;});
console.log(JSON.stringify(r));
ok('Haushalt in Gruppen',r.bg>=2&&r.bg<=6&&r.btot,'gruppen '+r.bg);
ok('Gruppensumme = Bilanz',Math.abs(r.bsum-r.net)<=r.bg,r.bsum+' vs '+r.net);
ok('Waren gruppiert',r.ggrp>=3,'gruppen '+r.ggrp);
ok('Ware besorgen mit Empfehlung',r.proc&&/besorgen/.test(r.proch||''));
ok('Ordnung in Gruppen',r.og>=2&&r.og<=6,'gruppen '+r.og);
ok('Glaube Rom Ep.0 ohne Kirche/Ritterorden',r.kir&&!r.kir.some(t=>/Kirche|Ritterorden|Heirat/.test(t)),JSON.stringify(r.kir));
ok('Heiratsallianzen unter Familie',r.fam===1);
ok('Schlüsseltechniken markiert',r.tkey>=1,'n '+r.tkey);
ok('Kriegsdrohung vorgemerkt, Stimmung „Droht“',r.pend&&/Droht/.test(r.mood||''));
ok('Krieg erst bei Fälligkeit',r.still&&r.war&&r.gone);
ok('Drohung fällt weg bei Nichtangriffspakt',r.cancel);
ok('Stimmung im Diplomatiefenster',r.dipMood);
ok('Keine Fehler',!errs.length&&!r.ferr&&!r.gerr&&!r.perr&&!r.oerr&&!r.herr&&!r.rerr&&!r.werr,errs.slice(0,3).join(' | ')+(r.werr||'')+(r.ferr||''));
await p.evaluate(()=>{ECO_TAB='fin';openEconomy();});await p.waitForTimeout(500);await p.evaluate(()=>{const d=document.querySelector('#dialog .bgrp');if(d)d.open=true;});await p.screenshot({path:__dirname+'/sys_haushalt.jpg',quality:70,type:'jpeg'}).catch(()=>{});
await p.evaluate(()=>{closeModal();openProcure('salz');});await p.waitForTimeout(500);await p.screenshot({path:__dirname+'/sys_besorgen.jpg',quality:70,type:'jpeg'}).catch(()=>{});
console.log(`SYS ${R.filter(Boolean).length}/${R.length}`);await b.close();})();
