// Job 41: Ladebilder Echtzeitschlacht – 9 Landschaften × 3 Epochenstile (antik/mittelalterlich/neuzeitlich), je 2 Varianten.
// Schlüssel sl_<landschaft>_<a1|m1|n1>, passt zum IMGLIB-Suffix-System. Leere Landschaft vor der Schlacht, Heere nur fern am Horizont.
// Aufruf: node dev/pc/schlacht_ladebilder.js <ziel.json>
const fs=require('fs');
const STIL='Oil painting in the style of a 19th-century academic history painting, painterly brushstrokes, muted earthy palette, dramatic natural light, no text, no lettering, no writing, no logos, no modern objects. Wide cinematic 16:9 landscape format.';
const LAND={
 ebene:'a wide open grassy plain with a dirt road and scattered trees',
 huegel:'rolling hills with a ridge and a lone farmstead',
 wald:'the edge of a dense deciduous forest with a clearing',
 gebirge:'a high mountain valley with rocky slopes and a narrow pass',
 fluss:'a broad river with a shallow ford and reeds, a wooden or stone bridge further up',
 kueste:'a coastline with a beach and cliffs, ships at anchor in the distance',
 wueste:'a dry desert plain with dunes and rocky outcrops, heat haze',
 steppe:'an endless grass steppe under a vast sky, a burial mound on the horizon',
 schnee:'a snow-covered winter field with frozen streams and bare trees'};
const ERA={
 a1:'Two ancient armies of antiquity drawn up far away on the horizon, tiny in the distance, banners and standards, campfires of the camps',
 m1:'Two medieval armies drawn up far away on the horizon, tiny in the distance, heraldic banners, tents of the camps',
 n1:'Two early-modern armies with pike squares and cannon drawn up far away on the horizon, tiny in the distance, flags and gunsmoke from a first shot'};
const rnd=()=>1000+Math.floor(Math.random()*89000),L=[];
for(const l in LAND)for(const e in ERA){const p=`Battlefield before the battle: ${LAND[l]}. ${ERA[e]}. The landscape dominates the picture, calm before the storm. ${STIL}`;
 for(const v of['a','b'])L.push({f:`sl_${l}_${e}_${v}`,p,r:'16:9',g:'Schlacht',seed:rnd()});}
fs.writeFileSync(process.argv[2]||'items.json',JSON.stringify(L,null,1));console.log(L.length,'Bilder');
