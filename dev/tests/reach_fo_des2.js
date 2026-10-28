// node reach_t.js <html>  – Erreichbarkeit aller Menü-Funktionen per UI-Klickpfad (max. 2 Ebenen + Unterreiter), 844x390 Touch und 1180x820
const {chromium}=require('playwright');const fs=require('fs');
const FILE=process.argv[2],OUT=__dirname+'/reach_fo_des2/';fs.mkdirSync(OUT,{recursive:true});
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
 ['Wirtschaft · Ketten (Sprungmarke)',['#navEco','[data-etab="over"]','[data-ejump="chain"]'],/Kette|Rohstoff/],
 ['Wirtschaft · Siedlungen',['#navEco','[data-etab="cit"]'],/Siedlung|Stadt|Städte/],
 ['Wirtschaft · Provinzen (Sprungmarke)',['#navEco','[data-etab="cit"]','[data-ejump="prov"]'],/Provinz/],
 ['Wirtschaft · Handel',['#navEco','[data-etab="trade"]'],/Handel/],
 ['Wirtschaft · Transport (Sprungmarke)',['#navEco','[data-etab="trade"]','[data-ejump="trans"]'],/Transport|Straße|Verlust/],
 ['Gold → Wirtschaft',['#goldStat'],/Wirtschaft/],
 ['Hof · Ämter',['#navHof','[data-htab="hof"]'],/Amt|Ämter/],
 ['Hof · Statthalter',['#navHof','[data-htab="hof"]','.subtabs [data-htab="gov"]'],/Statthalter/],
 ['Hof · Parteien',['#navHof','[data-htab="hof"]','.subtabs [data-htab="pol"]'],/Stand|Stände|Partei|Adel/],
 ['Hof · Familie',['#navHof','[data-htab="fam"]'],/Erbe|Haus|Familie/],
 ['Hof · Feldherren',['#navHof','[data-htab="gen"]'],/Feldherr/],
 ['Hof · Agenten',['#navHof','[data-htab="ag"]'],/Agent/],
 ['Hof · Glaube',['#navHof','[data-htab="kir"]'],/Glaube|Toleranz/],
 ['Hof · Rat',['#navHof','[data-htab="rat"]'],/Rat|Berater|Vorschl/],
 ['Forschung · eine Seite (3 Bereiche + Zähler)',['#resBtn'],/Militär[\s\S]*Wirtschaft[\s\S]*Kultur[\s\S]*(offen|alles erforscht)/],
 ['Forschung · Ziel-Banner Wende',['#resBtn'],/Tor zur nächsten Epoche[\s\S]*von \d+ Techniken/],
 ['Forschung · Sprung Militär',['#resBtn','[data-rjump="mil"]'],/Militär/],
 ['Forschung · Militär Karte zeigt Wirkung+Kosten',['#resBtn','[data-tcol="0"] .tech'],/\d+ P|Erforscht|Benötigt/],
 ['Forschung · Ziel wählen (Karte antippen)',['#resBtn','[data-tcol="1"] .tech:not([disabled])'],/in \d+ Runden/],
 ['Forschung · Kultur Karte',['#resBtn','[data-rjump="cul"]','[data-tcol="2"] .tech'],/Kultur/],
 ['Forschung · Eigenes Wissen',['#resBtn','[data-rjump="kul"]'],/Wissen/],
 ['Forschung · Fortschritte',['#resBtn','[data-rjump="rep"]'],/Fortschritt/],
 ['Chronik · Protokoll',['#navLog'],/Protokoll|Chronik/],
 ['Chronik · Buch des Reiches',['#navLog','[data-atab="buch"]'],/Buch|Zeitalter|Kapitel/],
 ['Chronik · Geschichten',['#navLog','[data-atab="gesch"]'],/Geschichte/],
 ['Chronik · Erfolge',['#navLog','[data-atab="erf"]'],/Erfolg/],
 ['Chronik · Rückblick',['#navLog','[data-atab="log"]','#revBtn'],/Rückblick|Partie/],
 ['Menü · Speichern',['#menuBtn','#mSave'],/Speicher|Spielstand/],
 ['Menü · Laden',['#menuBtn','#mLoad'],/Spielstand|laden/i],
 ['Menü · Exportieren',['#menuBtn','#mMore','#mExp'],/Export|Datei|Text/],
 ['Menü · Importieren',['#menuBtn','#mMore','#mImp'],/Import|Datei/],
 ['Menü · Einstellungen Ton',['#menuBtn','#mSet'],/Ton|Musik|Lautst/],
 ['Menü · Einstellungen Grafik',['#menuBtn','#mSet','[data-atab="gfx"]'],/Grafik/],
 ['Menü · Einstellungen Oberfläche',['#menuBtn','#mSet','[data-atab="ui"]'],/Oberfläche|Kulturstil|Hinweis/],
 ['Menü · Einstellungen Offline',['#menuBtn','#mSet','[data-atab="off"]'],/Offline|unterwegs|herunterladen/i],
 ['Menü · Steuerung und Regeln',['#menuBtn','#mMore','#mHelp'],/Steuerung|Regel/],
 ['Menü · Lizenzen',['#menuBtn','#mMore','#mLic'],/Lizenz|MusicGen/],
 ['Menü · Neues Spiel vorhanden',['#menuBtn'],/Fortsetzen[\s\S]*Spielstand laden[\s\S]*Neues Spiel/],
 ['Menü · Mehr (2. Ebene)',['#menuBtn','#mMore'],/Exportieren[\s\S]*Lizenzen/],
 ['Menü · Einführung über Mehr',['#menuBtn','#mMore'],/Einführung zeigen/],
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
 const st=await p.evaluate(()=>{const v=s=>{const e=document.querySelector(s);if(!e)return false;const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};return{set:v('#stSetBtn'),more:v('#stMoreBtn'),chron:!!document.querySelector('#chronBtn'),ach:[...document.querySelectorAll('#start button')].some(b=>/Erfolge/.test(b.textContent))};});
 const ord=await p.evaluate(()=>[...document.querySelectorAll('#stMain .stbig')].filter(b=>!b.hidden).map(b=>b.id||b.dataset.stgo));
 await p.click('#stMoreBtn');await p.waitForTimeout(300);
 const st2=await p.evaluate(()=>{const v=s=>{const e=document.querySelector(s);if(!e)return false;const r=e.getBoundingClientRect();return r.width>0&&r.height>=34;};return{help:v('#stHelpBtn'),mp:v('#mpBtn'),imp:v('#impBtn'),off:v('#offBtn')};});
 await p.click('#stMoreBack');await p.waitForTimeout(200);
 ok(tag+' Startmenü: Einstellungen, Geschichten, Erfolge oben; Hilfe, Mehrspieler, Import, Offline unter Mehr',st.set&&st.chron&&st.ach&&ord[0]==='loadBtn'&&st2.help&&st2.mp&&st2.imp&&st2.off,JSON.stringify({st,st2,ord}));
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
 const qh=[];for(const s of ['#navReich','#navDip','#navEco','#navHof','#resBtn','#navLog']){await p.evaluate(()=>{try{closeModal();}catch(e){}});await p.click(s);await p.waitForTimeout(300);qh.push(await p.evaluate(s=>!!document.querySelector('#dialog .qhelp'),s));}
 ok(tag+' ?-Kurzhilfe nur noch in der Forschung (Leitlinie: Legende statt ?)',JSON.stringify(qh)===JSON.stringify([false,false,false,false,true,false]),JSON.stringify(qh));
 await p.evaluate(()=>{try{closeModal();}catch(e){}openOverview('reg');});await p.waitForTimeout(300);
 ok(tag+' Kurzlegende Reich · Regionen sichtbar',await p.evaluate(()=>{const e=document.querySelector('#dialog .qleg');return!!e&&e.offsetHeight>0&&/Ganze Region/.test(e.textContent);}));
 await p.evaluate(()=>{try{closeModal();}catch(e){}});await p.click('#resBtn');await p.waitForTimeout(300);
 await p.click('#dialog .qhelp');await p.waitForTimeout(250);
 ok(tag+' ?-Kurzhilfe klappt auf',await p.evaluate(()=>!!document.querySelector('#dialog .qhelpbox')));
 await p.screenshot({path:OUT+tag+'_forschung_hilfe.jpg',quality:70,timeout:120000}).catch(()=>{});
 // Forschungsübersicht: Screenshots mit etwas Fortschritt, Detailblatt, Ziel-Größen
 await p.evaluate(()=>{try{closeModal();}catch(e){}const F=S.fac[S.player];['drill','iron','coinage','irrigation','writing','law','manipel','bogenbau'].forEach(id=>F.tech[id]=true);F.eur=F.eur||{};F.eur.trade=S.turn;setResearch(S.player,'horses');F.res.prog=9;openResearch('ov');});await p.waitForTimeout(500);
 await p.screenshot({path:OUT+tag+'_forschung_uebersicht.jpg',quality:75,timeout:120000}).catch(()=>{});
 const tz=await p.evaluate(()=>{const r=[...document.querySelectorAll('#dialog .fo .tech,#dialog .fchip')].filter(e=>e.offsetParent).map(e=>e.getBoundingClientRect().height);const d=document.getElementById('dialog');return{n:r.length,min:Math.min(...r),ban:Math.min(...[...document.querySelectorAll('#dialog .fban')].map(e=>e.getBoundingClientRect().height)),img:[...document.querySelectorAll('#dialog .fo .tech img')].length,hs:d.scrollWidth>d.clientWidth+1,body:document.documentElement.scrollWidth>innerWidth+1};});
 ok(tag+' Forschung: Karten/Chips ≥34 px, Bildbanner ≥90 px, Bilder je Karte, kein Querscrollen',tz.n>20&&tz.min>=34&&tz.ban>=90&&tz.img>=20&&!tz.hs&&!tz.body,JSON.stringify(tz));
 const sh=await p.evaluate(()=>{const c=document.querySelector('[data-tech="latifundien"]');const x=c&&c.closest('.fcross');if(!x)return null;x.scrollIntoView({block:'center'});const r=x.getBoundingClientRect();return{vis:r.top<innerHeight&&r.bottom>0,seal:!!x.querySelector('.fseal'),txt:x.innerText.slice(0,260)};});
 ok(tag+' Forschung: Scheideweg mit oder-Siegel, Infos direkt sichtbar',sh&&sh.vis&&sh.seal&&/Scheideweg[\s\S]*Nur eine/.test(sh.txt)&&/\d+ P|Benötigt/.test(sh.txt),JSON.stringify(sh));
 await p.screenshot({path:OUT+tag+'_forschung_blatt.jpg',quality:75,timeout:120000}).catch(()=>{});
 await p.evaluate(()=>{try{closeModal();}catch(e){}});
 // Menü kurz: Einträge
 await p.evaluate(()=>{try{closeModal();}catch(e){}});await p.click('#menuBtn');await p.waitForTimeout(300);
 const mn=await p.evaluate(()=>document.querySelectorAll('#dialog .mmenu .stbig').length);ok(tag+' Spielmenü ≤ 8 Einträge, eine Optik',mn>0&&mn<=8&&await p.evaluate(()=>!document.querySelector('#dialog .mlist,#dialog .btn.block')),'Einträge '+mn);
 await p.screenshot({path:OUT+tag+'_menu.jpg',quality:70,timeout:120000}).catch(()=>{});
 await p.evaluate(()=>{try{closeModal();}catch(e){}});await p.click('#navHof');await p.waitForTimeout(300);
 await p.screenshot({path:OUT+tag+'_hof.jpg',quality:70,timeout:120000}).catch(()=>{});
 await p.evaluate(()=>{try{closeModal();}catch(e){}});await p.click('#navDip');await p.waitForTimeout(300);
 await p.screenshot({path:OUT+tag+'_dip.jpg',quality:70,timeout:120000}).catch(()=>{});
 await p.evaluate(()=>{try{closeModal();}catch(e){}});await p.waitForTimeout(200);
 await p.screenshot({path:OUT+tag+'_karte.jpg',quality:70,timeout:120000}).catch(()=>{});
 ok(tag+' keine Konsolenfehler',!errs.length,errs.slice(0,3).join(' | '));
 await b.close();}
(async()=>{if(process.argv[3]!=='ipad')await run('handy',{width:844,height:390},true);await run('ipad',{width:1180,height:820},false);
 console.log(`REACH ${R.filter(Boolean).length}/${R.length}`);})();
