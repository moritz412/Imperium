// node reach_t.js <html>  – Erreichbarkeit aller Menü-Funktionen per UI-Klickpfad (max. 2 Ebenen + Unterreiter), 844x390 Touch und 1180x820
const {chromium}=require('playwright');const fs=require('fs');
const FILE=process.argv[2],OUT=__dirname+'/reach/';fs.mkdirSync(OUT,{recursive:true});
const R=[];const ok=(n,c,i='')=>{R.push(!!c);console.log((c?'PASS ':'FAIL ')+n+(i?'  '+i:''));};
// Pfad: Liste von Selektoren (Klick nacheinander), erwartet: Regex im Dialogtext
const PATHS=[
 ['Reich · Überblick',['#navReich'],/Reich|Rang|Einnahmen/],
 ['Reich · Regionen',['#navReich','[data-atab="reg"]'],/Region/],
 ['Reich · Ziele',['#navReich','[data-atab="ziel"]'],/Sieg|Ziel/],
 ['Wappen → Reich',['#facBtn'],/Reich/],
 ['Diplomatie · Reiche',['#navDip'],/Diplomatie/],
 ['Diplomatie · Verträge',['#navDip','[data-atab="vertr"]'],/Vertr|Abkommen|Bündnis|keine/i],
 ['Diplomatie · Karte',['#navDip','[data-atab="karte"]'],/Karte|Lage/],
 ['Diplomatie · einzelnes Reich',['#navDip','[data-atab="reiche"]','#dialog [data-dipf]'],/Beziehung/],
 ['Wirtschaft · Haushalt',['#navEco','[data-etab="fin"]'],/Steuersatz/],
 ['Wirtschaft · Waren',['#navEco','[data-etab="over"]'],/Nahrung|Lager|Ware/],
 ['Wirtschaft · Ketten',['#navEco','[data-etab="over"]','.subtabs [data-etab="chain"]'],/Kette|Rohstoff/],
 ['Wirtschaft · Siedlungen',['#navEco','[data-etab="cit"]'],/Siedlung|Stadt|Städte/],
 ['Wirtschaft · Provinzen',['#navEco','[data-etab="cit"]','.subtabs [data-etab="prov"]'],/Provinz/],
 ['Wirtschaft · Handel',['#navEco','[data-etab="trade"]'],/Handel/],
 ['Wirtschaft · Transport',['#navEco','[data-etab="trade"]','.subtabs [data-etab="trans"]'],/Transport|Straße|Verlust/],
 ['Gold → Wirtschaft',['#goldStat'],/Wirtschaft/],
 ['Hof · Ämter',['#navHof','[data-htab="hof"]'],/Amt|Ämter/],
 ['Hof · Statthalter',['#navHof','[data-htab="hof"]','.subtabs [data-htab="gov"]'],/Statthalter/],
 ['Hof · Parteien',['#navHof','[data-htab="hof"]','.subtabs [data-htab="pol"]'],/Stand|Stände|Partei|Adel/],
 ['Hof · Familie',['#navHof','[data-htab="fam"]'],/Erbe|Haus|Familie/],
 ['Hof · Feldherren',['#navHof','[data-htab="gen"]'],/Feldherr/],
 ['Hof · Agenten',['#navHof','[data-htab="ag"]'],/Agent/],
 ['Hof · Glaube',['#navHof','[data-htab="kir"]'],/Glaube|Toleranz/],
 ['Hof · Rat',['#navHof','[data-htab="rat"]'],/Rat|Berater|Vorschl/],
 ['Forschung · Militär',['#resBtn','[data-rtab="mil"]'],/Forschung|Militär|Krieg/],
 ['Forschung · Wirtschaft',['#resBtn','[data-rtab="eco"]'],/Wirtschaft|Handel/],
 ['Forschung · Kultur',['#resBtn','[data-rtab="cul"]'],/Kultur|Staat/],
 ['Forschung · Eigenes Wissen',['#resBtn','[data-rtab="kul"]'],/Wissen|Kultur/],
 ['Forschung · Fortschritte',['#resBtn','[data-rtab="rep"]'],/Fortschritt/],
 ['Chronik · Protokoll',['#navLog'],/Protokoll|Chronik/],
 ['Chronik · Buch des Reiches',['#navLog','[data-atab="buch"]'],/Buch|Zeitalter|Kapitel/],
 ['Chronik · Geschichten',['#navLog','[data-atab="gesch"]'],/Geschichte/],
 ['Chronik · Erfolge',['#navLog','[data-atab="erf"]'],/Erfolg/],
 ['Chronik · Rückblick',['#navLog','[data-atab="log"]','#revBtn'],/Rückblick|Partie/],
 ['Menü · Speichern',['#menuBtn','#mSave'],/Speicher|Spielstand/],
 ['Menü · Laden',['#menuBtn','#mLoad'],/Spielstand|laden/i],
 ['Menü · Exportieren',['#menuBtn','#mExp'],/Export|Datei|Text/],
 ['Menü · Importieren',['#menuBtn','#mImp'],/Import|Datei/],
 ['Menü · Einstellungen Ton',['#menuBtn','#mSet'],/Ton|Musik|Lautst/],
 ['Menü · Einstellungen Grafik',['#menuBtn','#mSet','[data-atab="gfx"]'],/Grafik/],
 ['Menü · Einstellungen Oberfläche',['#menuBtn','#mSet','[data-atab="ui"]'],/Oberfläche|Kulturstil|Hinweis/],
 ['Menü · Einstellungen Offline',['#menuBtn','#mSet','[data-atab="off"]'],/Offline|unterwegs|herunterladen/i],
 ['Menü · Steuerung und Regeln',['#menuBtn','#mHelp'],/Steuerung|Regel/],
 ['Menü · Lizenzen',['#menuBtn','#mLic'],/Lizenz|MusicGen/],
 ['Menü · Neues Spiel vorhanden',['#menuBtn'],/Neues Spiel/],
];
async function run(tag,vp,mob){const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:process.env.PW_GPU?[]:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({viewport:vp,deviceScaleFactor:1,hasTouch:true,isMobile:mob});const p=await ctx.newPage();const errs=[];
 p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|WebGL|GPU stall/.test(m.text()))errs.push(m.text().slice(0,140));});
 await p.addInitScript(()=>{try{localStorage.setItem('imperium.gfx',JSON.stringify({q:'leicht'}));localStorage.setItem('imperium.tut','1');}catch(e){}});
 await p.route(/cdnjs/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));
 await p.route(/fonts\.g/,r=>r.abort());
 await p.route(/\.html$/,r=>r.fulfill({body:'<!doctype html><meta charset=utf-8><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'+fs.readFileSync(FILE,'utf8'),contentType:'text/html; charset=utf-8'}));
 await p.goto('http://localhost:'+(process.env.PORT||8772)+'/imperium.html',{timeout:300000});await p.waitForFunction(()=>document.getElementById('loading').hidden,null,{timeout:300000});
 // Startmenü: Einstellungen/Hilfe/Mehrspieler/Geschichten/Erfolge sichtbar?
 const st=await p.evaluate(()=>{const v=s=>{const e=document.querySelector(s);if(!e)return false;const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};return{set:v('#stSetBtn'),help:v('#stHelpBtn'),chron:!!document.querySelector('#chronBtn'),mp:[...document.querySelectorAll('#start button')].some(b=>/Mehrspieler/.test(b.textContent)),ach:[...document.querySelectorAll('#start button')].some(b=>/Erfolge/.test(b.textContent))};});
 ok(tag+' Startmenü: Einstellungen, Hilfe, Geschichten, Mehrspieler, Erfolge',st.set&&st.help&&st.chron&&st.mp&&st.ach,JSON.stringify(st));
 await p.screenshot({path:OUT+tag+'_start.jpg',quality:70,timeout:120000}).catch(()=>{});
 await p.evaluate(()=>{newGame('rom');loadGame(S);closeModal();});await p.waitForFunction(()=>!document.querySelector('#loading[data-gate]'),null,{timeout:400000}).catch(()=>{});await p.waitForTimeout(4000);await p.evaluate(()=>{try{closeModal();}catch(e){}});
 const blk=await p.evaluate(()=>{const r=document.getElementById('navReich').getBoundingClientRect();const el=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return el?(el.id||String(el.className)||el.tagName):'-';});console.log('    navReich oben liegt:',blk);
 for(const [name,path,re] of PATHS){
  await p.evaluate(()=>{try{closeModal();}catch(e){}});
  let fail='';
  for(const sel of path){
   const h=await p.$(sel.split(',').map(s=>s.trim()).join(','));
   if(!h){fail='fehlt: '+sel;break;}
   const vis=await h.evaluate(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;});
   if(!vis){fail='unsichtbar: '+sel;break;}
   try{await h.scrollIntoViewIfNeeded({timeout:3000}).catch(()=>{});await h.click({timeout:8000});}catch(e){fail='Klick '+sel+': '+e.message.slice(0,80);break;}
   await p.waitForTimeout(350);
  }
  let txt=fail?'':await p.evaluate(()=>{const m=document.getElementById('modal');return m&&!m.hidden?document.getElementById('dialog').innerText:'';});
  const RX=new RegExp(re.source,'i');ok(tag+' '+name,!fail&&RX.test(txt),fail||(RX.test(txt)?'':'Text: '+txt.slice(0,300).replace(/\n/g,' ')));
 }
 // Schließen: kein Fußknopf "Schließen"; ✕ vorhanden; Zurück in Unterfenster
 await p.evaluate(()=>{try{closeModal();}catch(e){}});await p.click('#navEco');await p.waitForTimeout(300);
 const cl=await p.evaluate(()=>({x:!!document.querySelector('#dialog .dlgx'),foot:[...document.querySelectorAll('#dialog .actions .btn')].map(b=>b.textContent).filter(t=>/^Schließen$/.test(t)).length}));
 ok(tag+' Schließen nur ✕',cl.x&&cl.foot===0,JSON.stringify(cl));
 await p.click('#dialog .dlgx');await p.waitForTimeout(300);
 ok(tag+' ✕ schließt',await p.evaluate(()=>document.getElementById('modal').hidden));
 // Kurzhilfe ? in Bereichen
 const qh=[];for(const s of ['#navReich','#navDip','#navEco','#navHof','#resBtn','#navLog']){await p.evaluate(()=>{try{closeModal();}catch(e){}});await p.click(s);await p.waitForTimeout(300);qh.push(await p.evaluate(()=>!!document.querySelector('#dialog .qhelp')));}
 ok(tag+' ?-Kurzhilfe in allen 6 Bereichen',qh.every(Boolean),JSON.stringify(qh));
 await p.click('#dialog .qhelp');await p.waitForTimeout(250);
 ok(tag+' ?-Kurzhilfe klappt auf',await p.evaluate(()=>!!document.querySelector('#dialog .qhelpbox')));
 await p.screenshot({path:OUT+tag+'_forschung_hilfe.jpg',quality:70,timeout:120000}).catch(()=>{});
 // Menü kurz: Einträge
 await p.evaluate(()=>{try{closeModal();}catch(e){}});await p.click('#menuBtn');await p.waitForTimeout(300);
 const mn=await p.evaluate(()=>document.querySelectorAll('#dialog .mlist .btn').length);ok(tag+' Spielmenü ≤ 10 Einträge',mn>0&&mn<=10,'Einträge '+mn);
 await p.screenshot({path:OUT+tag+'_menu.jpg',quality:70,timeout:120000}).catch(()=>{});
 await p.evaluate(()=>{try{closeModal();}catch(e){}});await p.click('#navHof');await p.waitForTimeout(300);
 await p.screenshot({path:OUT+tag+'_hof.jpg',quality:70,timeout:120000}).catch(()=>{});
 await p.evaluate(()=>{try{closeModal();}catch(e){}});await p.click('#navDip');await p.waitForTimeout(300);
 await p.screenshot({path:OUT+tag+'_dip.jpg',quality:70,timeout:120000}).catch(()=>{});
 await p.evaluate(()=>{try{closeModal();}catch(e){}});await p.waitForTimeout(200);
 await p.screenshot({path:OUT+tag+'_karte.jpg',quality:70,timeout:120000}).catch(()=>{});
 ok(tag+' keine Konsolenfehler',!errs.length,errs.slice(0,3).join(' | '));
 await b.close();}
(async()=>{await run('handy',{width:844,height:390},true);await run('ipad',{width:1180,height:820},false);
 console.log(`REACH ${R.filter(Boolean).length}/${R.length}`);})();
