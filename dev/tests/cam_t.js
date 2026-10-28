const {chromium}=require('playwright');const fs=require('fs');
const F=process.argv[2];
(async()=>{const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:process.env.PW_GPU?[]:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
for(const [w,h,mob] of [[844,390,true],[1180,820,false]]){const ctx=await b.newContext({viewport:{width:w,height:h},hasTouch:true,isMobile:mob});const p=await ctx.newPage();
await p.addInitScript(()=>{try{localStorage.setItem('imperium.gfx',JSON.stringify({q:'leicht'}));}catch(e){}});
await p.route(/\.html$/,r=>r.fulfill({body:fs.readFileSync(F),contentType:'text/html; charset=utf-8'}));await p.route(/fonts\.g/,r=>r.abort());
await p.goto('http://localhost:'+(process.env.PORT||8772)+'/imperium.html',{timeout:300000});await p.waitForFunction(()=>document.getElementById('loading').hidden,null,{timeout:300000});
const r=await p.evaluate(async()=>{newGame('rom');loadGame(S);closeModal();for(let i=0;i<30;i++){await new Promise(z=>setTimeout(z,200));if(typeof camTween!=='undefined'&&!camTween)break;}
 if(typeof camTween!=='undefined'&&camTween){CAM.tx=camTween.tx;CAM.tz=camTween.tz;CAM.d=camTween.d;camTween=null;}try{updateCamera&&updateCamera();}catch(e){}
 const pi=capitalOf(S.player),c=CAP[pi];const V=new THREE.Vector3(c.x,0,c.z);camera.updateMatrixWorld();V.project(camera);const x=(V.x+1)/2*innerWidth,y=(1-V.y)/2*innerHeight;
 const sh=document.getElementById('sheet').getBoundingClientRect();const el=document.elementFromPoint(x,y);return{x:Math.round(x),y:Math.round(y),sheetL:Math.round(sh.left),el:el&&(el.id||el.tagName),name:PROV_DEF[pi].name};});
console.log(w,JSON.stringify(r));await p.screenshot({path:__dirname+`/cam_${w}.jpg`});await ctx.close();}
await b.close();})();
