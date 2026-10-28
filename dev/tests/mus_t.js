const {chromium}=require('playwright');const fs=require('fs');
const FILE=process.argv[2],PORT=process.argv[3]||'8792';
(async()=>{const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required']});
const p=await (await b.newContext({viewport:{width:900,height:620}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|WebGL|GPU/.test(m.text()))errs.push(m.text().slice(0,150));});
await p.addInitScript(()=>{try{localStorage.setItem('imperium.gfx',JSON.stringify({q:'leicht'}));}catch(e){}});
await p.route(/cdnjs/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));
await p.route(/\.html$/,r=>r.fulfill({body:fs.readFileSync(FILE),contentType:'text/html; charset=utf-8'}));
await p.route(/fonts\.g/,r=>r.abort());
await p.goto(`http://localhost:${PORT}/imperium.html`,{timeout:300000});await p.waitForFunction(()=>document.getElementById('loading').hidden,null,{timeout:300000});
const pick=async(label,setup,pred)=>{const r=await p.evaluate(async([setup,pred])=>{try{const W=await loadWorlds();if(setup[0]==='new'){newGame(setup[1]);loadGame(S);}else{await startWorld(setup[1],W[setup[1]].facs[0].f);await new Promise(z=>setTimeout(z,4000));}closeModal();
  const P=new Function('i','d','c','o','pid',pred);let pi=-1;for(let i=0;i<S.prov.length;i++){const d=PROV_DEF[i],c=S.prov[i].cul||cultOfProv(i),o=S.prov[i].owner;let pid='';try{pid=o&&o!=='frei'?facPid(o)||'':'';}catch(e){}if(P(i,d,c,o,pid)){pi=i;break;}}
  if(pi<0)return'keine Provinz';const id=musTrackId(pi);return id+' ('+PROV_DEF[pi].name+', '+(S.prov[pi].cul||'')+', '+S.year+')';}catch(e){return'ERR '+e.message;}},[setup,pred]);console.log(label.padEnd(22),r);};
await pick('Rom Antike',['new','rom'],"return d.id==='latium'");
await pick('Byzanz (E2)',['w',2],"return c==='griechisch'&&!/osman/i.test(pid)");
await pick('Frankreich Neuzeit',['w',3],"return /frank/i.test(pid)");
await pick('Mongolen/Steppe',['w',2],"return c==='steppe'&&!/osman|seldsch/i.test(pid)");
await pick('China',['w',2],"return c==='chinesisch'");
await pick('Japan',['w',3],"return c==='japanisch'");
await pick('Azteken',['w',3],"return c==='indigen'&&d.lat<24&&!['anden','peru'].includes(d.reg)&&d.lat>15");
await pick('Inka',['w',3],"return c==='indigen'&&['anden','peru'].includes(d.reg)");
await pick('Mali',['w',2],"return c==='afrikanisch'");
await pick('Äthiopien',['w',3],"return c==='habescha'");
await pick('Osmanen',['w',3],"return /osman/i.test(pid)");
await pick('Napoleon (E4)',['w',4],"return /frank/i.test(pid)");
// Schlacht je Ära: interne Auswahl über ep()
for(const e of [0,2,3]){console.log(('Schlacht E'+e).padEnd(22),e<=1?'schlacht_ant':e===2?'schlacht_ma':'schlacht_nz','(Regel ep<=1/2/>=3)');}
// Wiedergabe
await p.waitForTimeout(3000);await p.evaluate(async()=>{newGame('rom');loadGame(S);closeModal();});
await p.mouse.click(450,300);await p.waitForTimeout(500);
await p.evaluate(()=>{AUDIO.init();AUDIO.set('music',true);});
let st=null;for(let i=0;i<40;i++){await p.waitForTimeout(500);st=await p.evaluate(()=>({run:AUDIO.running(),...AUDIO.track()}));if(st.id)break;}
console.log('Wiedergabe Karte',JSON.stringify(st));
await p.evaluate(()=>AUDIO.setTheme('battle'));for(let i=0;i<40;i++){await p.waitForTimeout(500);st=await p.evaluate(()=>AUDIO.track());if(st.id&&/schlacht/.test(st.id))break;}
console.log('Wiedergabe Schlacht',JSON.stringify(st));
await p.evaluate(()=>{AUDIO.setTheme('map');AUDIO.set('mtrack',false);});await p.waitForTimeout(3500);console.log('Stil Klassisch',JSON.stringify(await p.evaluate(()=>AUDIO.track())));
await p.evaluate(()=>{AUDIO.set('mtrack',true);});
console.log('errs',errs);await b.close();})();
