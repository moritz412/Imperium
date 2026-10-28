// node menu_t.js <html> [port] – Erreichbarkeit aller Funktionen über die Oberfläche (Tippen), 844x390 Touch und 1180x820 Touch
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const FILE=process.argv[2],PORT=process.argv[3]||'8772',OUT=path.join(__dirname,'menu2');fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:process.env.PW_GPU?[]:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const R=[];const ok=(n,c,i='')=>{R.push(!!c);console.log((c?'PASS ':'FAIL ')+n+(i?'  '+String(i).slice(0,300):''));};
for(const [W,H,tag] of [[844,390,'handy'],[1180,820,'ipad']]){
const ctx=await b.newContext({viewport:{width:W,height:H},deviceScaleFactor:1,hasTouch:true,isMobile:true});const p=await ctx.newPage();const errs=[];
p.on('pageerror',e=>errs.push('PAGE '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|WebGL|GPU stall/.test(m.text()))errs.push('CON '+m.text().slice(0,160));});
await p.addInitScript(()=>{try{localStorage.setItem('imperium.gfx',JSON.stringify({q:'leicht'}));localStorage.setItem('imperium.tut','1');}catch(e){}});
await p.route(/cdnjs/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));
await p.route(/fonts\.g/,r=>r.abort());
await p.route(/\.html$/,r=>r.fulfill({body:fs.readFileSync(FILE,'utf8').replace('<head>','<head><meta name="viewport" content="width=device-width,initial-scale=1">'),contentType:'text/html; charset=utf-8'}));
await p.goto(`http://localhost:${PORT}/imperium.html`,{timeout:300000});await p.waitForFunction(()=>document.getElementById('loading').hidden,null,{timeout:300000});
const BLK=[];const tap=async sel=>{const pt=await p.evaluate(s=>{const x=document.querySelector(s);if(!x)return null;x.scrollIntoView({block:'center',inline:'nearest'});const r=x.getBoundingClientRect();if(!r.width)return null;const cx=r.left+r.width/2,cy=r.top+Math.min(r.height/2,20),h=document.elementFromPoint(cx,cy);return{x:cx,y:cy,hit:!!h&&(x===h||x.contains(h)),by:h?(h.id||h.className||h.tagName)+'@'+(h.closest('[id]')||{}).id:''};},sel);if(!pt)return false;if(!pt.hit){BLK.push(sel+'<'+pt.by+(await p.evaluate(()=>document.getElementById('modal').hidden?'':' modal:'+((document.querySelector('#dialog h2')||{}).textContent||'').slice(0,20))));await p.evaluate(s=>document.querySelector(s).click(),sel);}else await p.mouse.click(pt.x,pt.y);await p.waitForTimeout(250);return true;};
// Startmenü
const st=await p.evaluate(()=>({set:!!document.getElementById('stSetBtn'),help:!!document.getElementById('stHelpBtn'),n:(document.getElementById('stStoryN')||{}).textContent||'',order:(()=>{const g=document.getElementById('facGrid'),d=document.querySelector('#stFree details.stmore');return !!(g&&d&&(g.compareDocumentPosition(d)&Node.DOCUMENT_POSITION_FOLLOWING));})()}));
ok(tag+': Startmenü Einstellungen/Hilfe/Volk zuerst',st.set&&st.help&&st.order&&/\d+ Geschichten und \d+ Bonus/.test(st.n),JSON.stringify(st));
await tap('#stSetBtn');await p.waitForTimeout(300);ok(tag+': Start → Einstellungen',await p.evaluate(()=>!document.getElementById('modal').hidden&&!!document.querySelector('#dialog .areatabs[data-area=set]')));
await p.click('#dialog .dlgx');await p.waitForTimeout(200);
await p.evaluate(()=>{newGame('rom');loadGame(S);closeModal();try{document.getElementById('tut').hidden=true;}catch(e){}});await p.waitForTimeout(1500);
const dlg=()=>p.evaluate(()=>{const d=document.getElementById('dialog');return{open:!document.getElementById('modal').hidden,h2:(d.querySelector('h2')||{}).textContent||'',tabs:[...d.querySelectorAll('.areatabs button')].map(b=>b.textContent+(b.classList.contains('on')?'*':'')),sub:[...d.querySelectorAll('.subtabs button')].map(b=>b.textContent+(b.classList.contains('on')?'*':'')),back:!!d.querySelector('.dlgback'),help:!!d.querySelector('.qhelp'),closeBtn:[...d.querySelectorAll('.actions button')].some(b=>/^(Schließen|Fertig)$/.test(b.textContent.trim())),txt:d.innerText.slice(0,4000)};});
const closeX=async()=>{await tap('#dialog .dlgx');await p.waitForTimeout(150);};
const shot=async n=>{try{await p.screenshot({path:path.join(OUT,tag+'_'+n+'.jpg'),quality:65,timeout:60000});}catch(e){}};
// Kopfleiste ohne Überdeckung
const top=await p.evaluate(()=>['#navReich','#navDip','#navEco','#navHof','#navLog','#resBtn','#menuBtn'].map(s=>{const e=document.querySelector(s);if(!e)return s+':fehlt';const r=e.getBoundingClientRect();if(r.width<30)return s+':klein';const h=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return e.contains(h)?'':s+':verdeckt '+(h&&(h.id||h.className));}).filter(Boolean));
ok(tag+': Kopfleiste 7 Bereiche sichtbar, nicht verdeckt',!top.length,top.join(' '));
// Reich
await tap('#navReich');let d=await dlg();ok(tag+': Reich mit 3 Reitern + ?',d.h2.startsWith('Reich')&&d.tabs.length===3&&d.help&&!d.closeBtn,JSON.stringify(d.tabs));await shot('reich');
for(const k of ['reg','ziel']){await tap(`#dialog [data-atab=${k}]`);d=await dlg();ok(tag+': Reich → '+k,d.tabs.some(t=>t.endsWith('*'))&&(k!=='ziel'||/Sieg|Ziel|Kapitel/.test(d.txt)),d.tabs.join('|'));}
await tap('#dialog .qhelp');ok(tag+': Kurzhilfe klappt auf',await p.evaluate(()=>{const x=document.querySelector('.qhelpbox');return !!x&&!x.hidden;}));
await closeX();ok(tag+': ✕ schließt',!(await dlg()).open);
// Diplomatie
await tap('#navDip');d=await dlg();ok(tag+': Diplomatie mit 3 Reitern',d.h2.startsWith('Diplomatie')&&d.tabs.length===3,d.tabs.join('|'));await shot('dip');
const hasRow=await tap('#dialog [data-dipf]');d=await dlg();ok(tag+': Reich antippen → Diplomatie mit ‹ Zurück',hasRow&&d.back&&!/^Diplomatie$/.test(d.h2.trim()),d.h2);await shot('dip_reich');
await tap('#dialog .dlgback');d=await dlg();ok(tag+': ‹ Zurück → Diplomatie-Übersicht',d.h2.startsWith('Diplomatie')&&d.tabs.length===3,d.h2);
await tap('#dialog [data-atab=vertr]');d=await dlg();ok(tag+': Verträge',/Abkommen|Vertr|Handelsplätze/.test(d.txt));
await tap('#dialog [data-atab=karte]');d=await dlg();ok(tag+': Karte der Reiche',await p.evaluate(()=>!!document.querySelector('#dialog canvas,#dialog svg')));await closeX();
// Wirtschaft
await tap('#navEco');d=await dlg();ok(tag+': Wirtschaft 4 Reiter',d.h2.startsWith('Wirtschaft')&&d.tabs.length===4&&!d.closeBtn,d.tabs.join('|'));await shot('eco');
const ecoSeen=[],EGRP={fin:0,over:1,chain:1,cit:2,prov:2,trade:3,trans:3};for(const k of ['fin','over','chain','cit','prov','trade','trans']){await tap(`#dialog .areatabs button:nth-child(${EGRP[k]+1})`);if(!(await tap(`#dialog .subtabs [data-etab=${k}], #dialog .areatabs [data-etab=${k}]`))){ecoSeen.push(k+':-');continue;}d=await dlg();ecoSeen.push(k+':'+(d.sub.find(t=>t.endsWith('*'))||d.tabs.find(t=>t.endsWith('*'))));}
ok(tag+': alle Wirtschafts-Unterreiter erreichbar',!ecoSeen.some(x=>/:-|:undefined/.test(x)),ecoSeen.join(' '));
await tap('#dialog [data-etab=fin]');ok(tag+': Steuersatz unter Haushalt',await p.evaluate(()=>document.querySelectorAll('#dialog [data-tax]').length===3));await closeX();
// Hof
await tap('#navHof');d=await dlg();ok(tag+': Hof 6 Reiter',d.h2.startsWith('Hof')&&d.tabs.length===6,d.tabs.join('|'));await shot('hof');
const hofSeen=[];for(const k of ['hof','gov','pol','fam','gen','ag','kir','rat']){if(!(await tap(`#dialog [data-htab=${k}]`))){hofSeen.push(k+':-');continue;}d=await dlg();hofSeen.push(k+':'+(d.sub.find(t=>t.endsWith('*'))||d.tabs.find(t=>t.endsWith('*'))));}
ok(tag+': alle Hof-Reiter erreichbar (inkl. Rat, Glaube)',!hofSeen.some(x=>/:-|:undefined/.test(x))&&hofSeen.includes('rat:Rat*')&&hofSeen.includes('kir:Glaube*'),hofSeen.join(' '));
ok(tag+': Rat-Einstellung im Hof',await p.evaluate(()=>document.querySelectorAll('#dialog [data-ratm]').length>=3));await shot('hof_rat');await closeX();
// Forschung
await tap('#resBtn');d=await dlg();ok(tag+': Forschung 5 Reiter',d.h2.startsWith('Forschung')&&d.tabs.length===5,d.tabs.join('|'));
const rs=[];for(const k of ['mil','eco','cul','kul','rep']){await tap(`#dialog [data-rtab=${k}]`);rs.push(k+':'+(await p.evaluate(()=>document.querySelectorAll('#dialog .tech').length)));}
ok(tag+': Forschungsreiter mit Inhalt',rs.filter(x=>!/:0$/.test(x)).length>=4,rs.join(' '));await shot('res');await closeX();
// Chronik
await tap('#navLog');d=await dlg();ok(tag+': Chronik 4 Reiter',d.h2.startsWith('Chronik')&&d.tabs.length===4,d.tabs.join('|'));
await tap('#dialog [data-atab=buch]');ok(tag+': Buch des Reiches',await p.evaluate(()=>!!document.getElementById('bkBook')&&!!document.querySelector('#dialog .areatabs[data-area=chron]')));await shot('buch');
await tap('#dialog [data-atab=gesch]');d=await dlg();ok(tag+': Geschichten',d.tabs.length===4&&d.tabs.includes('Geschichten*'),d.tabs.join('|'));
await tap('#dialog [data-atab=erf]');d=await dlg();ok(tag+': Erfolge',d.tabs.includes('Erfolge*')&&await p.evaluate(()=>!!document.querySelector('#dialog .achc')));
await tap('#dialog [data-atab=log]');await tap('#revBtn');d=await dlg();ok(tag+': Rückblick aus Chronik, mit Zurück',/Rückblick/i.test(d.txt)&&d.back,d.h2);await closeX();
// Menü
await tap('#menuBtn');d=await dlg();ok(tag+': Menü gruppiert, ≤10 Einträge',d.h2.startsWith('Menü')&&await p.evaluate(()=>document.querySelectorAll('#dialog .mlist .btn').length<=10&&document.querySelectorAll('#dialog h3.mgrp').length===3),'');await shot('menu');await closeX();
const menuIds=['mSave','mLoad','mExp','mImp','mHelp','mLic','mSet'];const ms=[];
for(const id of menuIds){await tap('#menuBtn');await tap('#'+id);d=await dlg();ms.push(id+':'+(d.open?d.h2.slice(0,20):'zu')+(d.back?'‹':''));await closeX();if(!(await dlg()).open===false)ms.push('NOCLOSE '+id+' '+(await dlg()).h2);}
ok(tag+': Menüeinträge öffnen Fenster mit Zurück',ms.every(x=>!/:zu/.test(x)&&x.endsWith('‹')),ms.join(' | '));
await tap('#menuBtn');await tap('#mSet');const ss=[];for(const k of ['ton','gfx','ui','off']){await tap(`#dialog [data-atab=${k}]`);d=await dlg();ss.push(k+':'+d.tabs.find(t=>t.endsWith('*')));}
ok(tag+': Einstellungen 4 Reiter (Ton, Grafik, Oberfläche, Offline)',ss.every(x=>!/undefined/.test(x)),ss.join(' '));
await tap('#dialog [data-atab=ui]');ok(tag+': Oberfläche: Kulturstil, Hinweise, Rat',await p.evaluate(()=>!!document.getElementById('uiTheme')&&!!document.getElementById('uiHints')&&document.querySelectorAll('#uiRat [data-ratm]').length>=3));
await tap('#dialog [data-atab=ton]');ok(tag+': Berater-Stimmen unter Ton',await p.evaluate(()=>document.querySelectorAll('#aRv [data-rv]').length===3));await shot('set');await closeX();
await tap('#menuBtn');await tap('#mTut');ok(tag+': Einführung startet',await p.evaluate(()=>!document.getElementById('tut').hidden));await p.evaluate(()=>{document.getElementById('tut').hidden=true;});
await tap('#menuBtn');await tap('#mNew');d=await dlg();ok(tag+': Neues Spiel fragt nach',/Neues Spiel\?/.test(d.h2));await closeX();
// Abkürzungen
await tap('#goldStat');d=await dlg();ok(tag+': Gold → Wirtschaft',d.h2.startsWith('Wirtschaft'));await closeX();
await tap('#facBtn');d=await dlg();ok(tag+': Wappen → Reich',d.h2.startsWith('Reich'));await closeX();
// Rücksprung über zwei Ebenen: Reich → Wirtschaft? (Hof → Rat → Hof-Portrait)
await tap('#navHof');await tap('#dialog [data-htab=rat]');d=await dlg();ok(tag+': Rat im Hof ohne Doppeltitel',(await p.evaluate(()=>document.querySelectorAll('#dialog h2').length))===1);await closeX();
// Kein Fußknopf „Schließen“ in Hauptfenstern
const nofoot=[];for(const s of ['#navReich','#navDip','#navEco','#navHof','#navLog','#resBtn','#menuBtn']){await tap(s);d=await dlg();if(d.closeBtn)nofoot.push(s);await closeX();}
ok(tag+': kein Fußknopf „Schließen“',!nofoot.length,nofoot.join(' '));
ok(tag+': alle Knöpfe direkt antippbar (nicht verdeckt)',!BLK.length,BLK.join(' '));ok(tag+': keine Seiten-/Konsolenfehler',!errs.length,errs.slice(0,4).join(' | '));
await ctx.close();}
console.log(`MENU ${R.filter(Boolean).length}/${R.length}`);await b.close();})();
