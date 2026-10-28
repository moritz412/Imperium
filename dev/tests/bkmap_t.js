// node bkmap_t.js <html> [port] – Buch des Reiches: Kartenausschnitt je Kapitel
const {chromium}=require('playwright');const fs=require('fs');
const FILE=process.argv[2],PORT=process.argv[3]||'8772';
(async()=>{const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:process.env.PW_GPU?[]:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:1100,height:760},hasTouch:true});const p=await ctx.newPage();const errs=[];
p.on('pageerror',e=>errs.push('PAGE '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|WebGL|GPU stall/.test(m.text()))errs.push('CON '+m.text().slice(0,160));});
await p.addInitScript(()=>{try{localStorage.setItem('imperium.gfx',JSON.stringify({q:'leicht'}));}catch(e){}});
await p.route(/cdnjs/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));
await p.route(/fonts\.g/,r=>r.abort());await p.route(/\.html$/,r=>r.fulfill({body:fs.readFileSync(FILE),contentType:'text/html; charset=utf-8'}));
await p.goto(`http://localhost:${PORT}/imperium.html`,{timeout:300000});await p.waitForFunction(()=>document.getElementById('loading').hidden,null,{timeout:300000});
const R=[];const ok=(n,c,i='')=>{R.push(!!c);console.log((c?'PASS ':'FAIL ')+n+(i?'  '+i:''));};
await p.evaluate(()=>{window.showEvent=(E,ctx,next)=>{try{E.opts[0].fx(S.player,ctx);}catch(e){}next&&next();};window.picMsg=()=>{};});
const a=await p.evaluate(async()=>{newGame('rom');loadGame(S);closeModal();for(let i=0;i<2;i++){endTurn();await new Promise(z=>setTimeout(z,2500));closeModal();}
  const sz0=JSON.stringify(S).length;doEpoch();await new Promise(z=>setTimeout(z,1500));const B=S.books[S.books.length-1];const sz1=JSON.stringify(S).length;
  return{own:B&&B.own,ownLen:B&&B.own?B.own.length:0,n:B?bkOwnSet(B.own||'').size:0,prov:B?B.prov[1]:0,sz0,sz1,ep:ep()};});
ok('Schnappschuss beim Epochenwechsel',a.own&&a.n===a.prov,JSON.stringify({ownLen:a.ownLen,n:a.n,prov:a.prov,ep:a.ep}));
ok('Spielstandgröße: Zuwachs durch Karte klein',a.ownLen<400,`Schnappschuss ${a.ownLen} Zeichen · Spielstand vorher ${a.sz0} → nachher ${a.sz1} Zeichen (Differenz enthält auch Epochenwechsel)`);
// Epochen-Nachricht mit Karte
const news=await p.evaluate(async()=>{closeModal();S.bookShow=S.books[S.books.length-1];showBookNews(()=>{});await new Promise(z=>setTimeout(z,600));const cv=document.querySelector('#dialog canvas[data-bkmap]');if(!cv)return{cv:false};const d=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;let ink=0;for(let i=0;i<d.length;i+=4)if(d[i]>130&&d[i+1]<80)ink++;return{cv:true,ink};});
ok('Epochen-Nachricht zeigt Karte mit eigenem Gebiet',news.cv&&news.ink>50,JSON.stringify(news));
await p.screenshot({path:__dirname+'/bk_news.jpg',quality:70}).catch(e=>console.log('shot',e.message));
// Buch: Kapitel 1 Einleitungsseite
const bk=await p.evaluate(async()=>{closeModal();openReichBook(0);await new Promise(z=>setTimeout(z,300));for(let k=0;k<4&&!document.querySelector('#bkBook canvas[data-bkmap]');k++){document.getElementById('bkNext').click();await new Promise(z=>setTimeout(z,300));}
  const cv=document.querySelector('#bkBook canvas[data-bkmap]');if(!cv)return{cv:false};const d=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;let ink=0;for(let i=0;i<d.length;i+=4)if(d[i]>130&&d[i+1]<80)ink++;return{cv:true,ink,cap:cv.parentNode.textContent};});
ok('Buch Kapitel 1 zeigt Karte',bk.cv&&bk.ink>50,JSON.stringify(bk));
await p.screenshot({path:__dirname+'/bk_book.jpg',quality:70}).catch(e=>console.log('shot',e.message));
// Entwurfskapitel (aktuell)
const cur=await p.evaluate(async()=>{closeModal();openReichBook('last');await new Promise(z=>setTimeout(z,300));for(let k=0;k<3&&!document.querySelector('#bkBook canvas[data-bkmap]');k++){document.getElementById('bkNext').click();await new Promise(z=>setTimeout(z,300));}const cv=document.querySelector('#bkBook canvas[data-bkmap]');return{cv:!!cv,cap:cv?cv.parentNode.textContent:''};});
ok('Entwurfskapitel: Karte „heute“',cur.cv&&/heute/.test(cur.cap),JSON.stringify(cur));
// alter Spielstand ohne Schnappschuss
const old=await p.evaluate(async()=>{closeModal();const s=JSON.parse(JSON.stringify(S));s.books.forEach(B=>delete B.own);loadGame(s);closeModal();openReichBook(0);await new Promise(z=>setTimeout(z,300));let note=false;for(let k=0;k<4;k++){if(/keine Karte verzeichnet/.test(document.getElementById('bkBook').textContent)){note=true;break;}document.getElementById('bkNext').click();await new Promise(z=>setTimeout(z,300));}closeModal();return{note};});
ok('Alter Spielstand: Hinweis statt Karte',old.note,JSON.stringify(old));
// Speichern/Laden behält Schnappschuss
const sl=await p.evaluate(()=>{const s=JSON.parse(JSON.stringify(S));s.books[0].own=bkOwnSnap();loadGame(s);closeModal();return!!S.books[0].own;});
ok('Speichern/Laden behält Schnappschuss',sl);
ok('Keine Seiten-/Konsolenfehler',!errs.length,errs.slice(0,4).join(' | '));
console.log(`BKMAP ${R.filter(Boolean).length}/${R.length}`);await b.close();})();
