// node flash_t.js <html> <port> <welt> <volk>  – frische Seite, Welt laden, alle 150 ms Städte zählen (Ersatzstadt vs. Baukasten) + Bilder
const {chromium}=require('playwright');const fs=require('fs');
const [FILE,PORT,WE,VF]=[process.argv[2],process.argv[3]||'8772',process.argv[4]||'3',process.argv[5]||'rom'];const OUT=__dirname+'/epo/';
(async()=>{const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:process.env.PW_GPU?[]:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:1024,height:700},hasTouch:true});const p=await ctx.newPage();
await p.addInitScript(()=>{try{localStorage.setItem('imperium.gfx',JSON.stringify({q:'leicht'}));}catch(e){}});
await p.route(/cdnjs/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));
await p.route(/fonts\.g/,r=>r.abort());await p.route(/\.html$/,r=>r.fulfill({body:fs.readFileSync(FILE),contentType:'text/html; charset=utf-8'}));
const kitReq=[];p.on('request',r=>{if(/models\/kit\d/.test(r.url()))kitReq.push([Date.now(),r.url().replace(/^.*models\//,'')]);});
await p.goto(`http://localhost:${PORT}/imperium.html`,{timeout:300000});await p.waitForFunction(()=>document.getElementById('loading').hidden,null,{timeout:300000});
const pre=await p.evaluate(()=>({kits:Object.keys(KIT).filter(k=>KIT[k])}));
const T=Date.now();
await p.evaluate(async([we,vf])=>{const W=await loadWorlds();startWorld(+we,vf);},[WE,VF]);
const samples=[];let shots=0;
for(let i=0;i<120;i++){const s=await p.evaluate(()=>{if(!S||!CITY)return null;let fb=0,kit=0,vis=0;CITY.forEach(c=>{if(!c.g.visible)return;vis++;if(c.mesh&&c.mesh.parent)fb++;else if(c.sig==='K')kit++;});return{ep:ep(),kit:!!KIT[ep()],fb,kitC:kit,vis,start:!document.getElementById('start').hidden,modal:!document.getElementById('modal').hidden};});
  samples.push([Date.now()-T,s]);if(s&&s.fb>0&&shots<2&&!s.start){await p.evaluate(()=>{try{closeModal();}catch(e){}needRender=3;});await p.screenshot({path:OUT+`flash_w${WE}_${shots}.jpg`,quality:65}).catch(()=>{});shots++;}
  if(s&&s.kit&&s.fb===0&&i>10)break;await p.waitForTimeout(150);}
await p.evaluate(()=>{try{closeModal();}catch(e){}needRender=3;});await p.waitForTimeout(1500);await p.screenshot({path:OUT+`flash_w${WE}_ende.jpg`,quality:65}).catch(()=>{});
const firstFb=samples.find(x=>x[1]&&x[1].fb>0),lastFb=[...samples].reverse().find(x=>x[1]&&x[1].fb>0),kitAt=samples.find(x=>x[1]&&x[1].kit);
const res={WE,VF,pre,kitReq:kitReq.map(x=>[x[0]-T,x[1]]),firstFb,lastFb,kitAt,n:samples.length,last:samples[samples.length-1]};
fs.writeFileSync(OUT+`flash_w${WE}.json`,JSON.stringify({res,samples},null,0));console.log('FLASH',JSON.stringify(res));await b.close();})().catch(e=>{console.log('FAIL',e.message);process.exit(1);});
