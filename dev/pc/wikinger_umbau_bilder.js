// Job 42: Bilder für den Wikinger-Umbau (wikinger_nachbesserung.md Abschnitt 4) + Ersatz vk_k4_miklagard (zeigte Minarette).
// Aufruf: node dev/pc/wikinger_umbau_bilder.js <ziel.json>
// Bilder kosten nur GPU-Zeit; eingebaut werden sie erst, wenn Moritz den Umbau freigibt.
const fs=require('fs');
const STIL='Oil painting in the style of a 19th-century academic history painting, painterly brushstrokes, muted earthy palette, dramatic natural light, no text, no lettering, no writing, no logos, no modern objects.';
const W=' Wide cinematic 16:9 landscape format.',P34=' Vertical portrait 3:4 format.';
const ERA=' Ninth-century England and Scandinavia: Viking warriors with round shields, spangenhelm or simple iron helmets without horns, mail or wool tunics, Danish axes; Anglo-Saxons with long shields, spears, seax knives, timber halls; no horned helmets.';
const M=[
 ['vk_u_alfred','King Alfred of Wessex, a thoughtful Anglo-Saxon king of about thirty with short beard, simple gold circlet, wool cloak with brooch, holding a book and a sword','P'],
 ['vk_u_ivar','Ivar the Boneless and Halfdan, two Viking war leaders standing on a riverbank before longships, fur cloaks, mail, arm rings, hard faces','W'],
 ['vk_u_winterlager','A fortified Viking winter camp at Repton: a D-shaped earthen rampart against a river, longships pulled up on the bank, a stone church incorporated into the defences, smoke from huts, frost','W'],
 ['vk_u_athelney','A misty marshland at Athelney in Somerset, a small fortified island with a timber hall, Anglo-Saxon warriors gathering in boats among reeds, winter dawn','W'],
 ['vk_u_fyrd','Anglo-Saxon farmers and thegns gathering at a stone landmark on a hill to answer the king’s call to arms, spears and shields, banners with a dragon, cold spring morning','W'],
 ['vk_u_marionette','A Viking jarl placing a gold circlet on the head of a nervous Anglo-Saxon nobleman in a timber hall, Viking warriors watching, the new puppet king avoiding their eyes','W'],
 ['vk_u_danelag','A Viking chieftain and an Anglo-Saxon king clasping hands over a peace treaty beside an old Roman road (Watling Street) running across the countryside, warriors of both sides behind','W'],
 ['vk_u_burh','Anglo-Saxons building a burh: a town rampart of earth and timber palisade around a small town on a hill, workers carrying logs, a planned street grid inside','W'],
 ['vk_u_thronstreit','Two rival Northumbrian kings with their retinues facing each other angrily in the hall of Eoforwic (York), the Roman walls visible through the door','W'],
 ['vk_u_pferde','East Anglian men handing over horses to a Viking army camp, Vikings mounting the horses, flat fenland landscape','W'],
 ['vk_k4_miklagard','Viking traders and Varangian guardsmen arriving by boat at Constantinople (Miklagard) in the tenth century, the huge sea walls and towers of the city, Byzantine churches with domes but definitely no minarets, galleys in the Golden Horn','W']];
const rnd=()=>1000+Math.floor(Math.random()*89000),L=[];
for(const[k,m,f]of M){const p=`${m}.${ERA} ${STIL}${f==='P'?P34:W}`;for(const v of['a','b'])L.push({f:`${k}_${v}`,p,r:f==='P'?'3:4':'16:9',g:'Wikinger2',seed:rnd()});}
fs.writeFileSync(process.argv[2]||'items.json',JSON.stringify(L,null,1));console.log(L.length,'Bilder');
