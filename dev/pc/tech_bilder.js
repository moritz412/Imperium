// Erzeugt die FLUX-Aufträge für Technikbilder (tk_<id>), Menü-Banner (assets_design.md) und angel_halle.
// Aufruf: node dev/pc/tech_bilder.js <zielordner>  → probe.json, haupt.json, halle.json
const fs=require('fs'),path=require('path');
const OUT=process.argv[2]||'.';
const STIL='Oil painting in the style of a 19th-century academic history painting, painterly brushstrokes, muted earthy palette, dramatic natural light, no text, no lettering, no writing, no logos, no modern objects.';
const SQ=' Square 1:1 format, single clear subject in the centre.';
const W=' Wide cinematic 16:9 landscape format.';
const ERA=['in classical antiquity (Rome, Greece, Carthage, around 200 BC)','in the early Middle Ages (around 700 AD)','in the High Middle Ages (around 1250)','in the early modern era (around 1650)','in the Napoleonic era (around 1800)'];
// Motive je Technik (englisch, ohne Epoche – die hängt ERA an)
const M={
 drill:'Legionaries drilling in tight formation on a dusty training field, a centurion shouting orders, raised shields and wooden practice swords',
 iron:'A blacksmith forging an iron sword blade at a glowing anvil, sparks flying, finished helmets and spearheads on the wall',
 horses:'Grooms breeding and training fine horses in a sunlit paddock, a stallion rearing, riders inspecting the herd',
 siege:'Engineers assembling a wooden siege tower and a torsion catapult before enemy city walls',
 coinage:'A mint workshop: a worker striking silver coins with hammer and die, heaps of shining coins, a supervisor with a scale',
 irrigation:'Farmers opening a sluice of a stone irrigation channel, water flowing into green terraced fields',
 trade:'A busy harbour market with amphorae, merchant ships unloading, traders haggling over goods',
 roads:'Soldiers and workers building a paved stone road through hilly countryside, a milestone, surveyors with a groma',
 writing:'A scribe writing on a papyrus scroll by lamplight, wax tablets, ink pots and scroll shelves',
 law:'A magistrate proclaiming laws to citizens in a forum, bronze tablets on a marble wall, attentive crowd',
 architecture:'Builders raising a marble temple with columns, a wooden crane lifting a capital, an architect with plans',
 citizenship:'Conquered townspeople receiving citizenship before a Roman official, handshake, toga ceremony in a provincial town square',
 bauhuette:'A busy capital city construction site with two buildings rising at once, scaffolding, cranes and many workers',
 manipel:'A legion deployed in three checkerboard lines of maniples on an open plain, standards raised, viewed from a hill',
 lagerbau:'Soldiers digging a ditch and raising a palisade around a square marching camp at dusk, rows of leather tents',
 latifundien:'A vast country estate with vineyards, olive groves and grain fields, slaves and workers harvesting, a villa on a hill',
 veteranen:'Retired veteran soldiers receiving plots of farmland, a surveyor marking fields, a new colony town in the background',
 schildwall:'Warriors standing shoulder to shoulder in a dense shield wall with round painted shields, spears bristling',
 kettenhemd:'An armourer linking iron rings into a mail shirt in a smoky workshop, finished mail hauberks on stands',
 steigbuegel:'A heavily armed horseman rising in iron stirrups with a couched lance, close view of the stirrup and saddle',
 kastelle:'A stone frontier fort with square towers on a river bank, guards on the wall walk, a garrison inside',
 muehle:'A water mill with a large wooden wheel turning in a stream, miller carrying grain sacks',
 kloster:'Monks working the fields, vineyard and fish ponds of a large monastery estate, abbey church behind',
 fernhandel:'A long-distance merchant caravan with pack animals and a trading ship at a river port, bales of silk and furs',
 muenzreform:'A royal treasurer issuing newly minted silver pennies to paymasters, old clipped coins being melted',
 mission:'A missionary monk preaching beside a newly built wooden church to curious villagers and a chieftain',
 kodex:'A king and his counsellors in a hall with a large bound law book open on a lectern, scribes copying it',
 skriptorium:'Monks copying illuminated manuscripts at slanted desks in a stone scriptorium, light from tall windows',
 gewoelbe:'Masons building a stone vaulted ceiling on wooden centring, round arches, a master mason directing',
 foederaten:'A barbarian tribal leader and an imperial officer clasping hands, allied warriors receiving gold and land',
 limitanei:'Farmer-soldiers tending fields next to a border watchtower, weapons leaning against a fence, a river frontier',
 klosterregel:'Monks in black habits praying and then working in a cloister garden, a bell tower, an abbot reading the rule',
 reichskirche:'A crowned king investing a bishop with ring and staff in a church, nobles and clergy watching',
 lehnswesen:'A kneeling vassal placing his hands in the hands of his lord in a castle hall, swearing fealty, knights watching',
 plattenpanzer:'An armourer fitting polished steel plate armour on a knight in a workshop, helmets and gauntlets on a bench',
 armbrust:'A crossbowman with his foot in the iron stirrup of a heavy mechanical crossbow (arbalest), cranking the string back with a winch, short bolts in a quiver, a tall rectangular pavise beside him, no longbow, a castle wall behind',
 burgen:'Masons building a mighty stone castle on a rocky hill, round towers, scaffolding and a treadwheel crane',
 dreifelder:'Open countryside divided into three great fields: one ploughed with oxen, one green with grain, one fallow with sheep',
 zuenfte:'Guild masters in fine robes in a guild hall, banners of the crafts, an apprentice presenting his masterpiece',
 staedtebuende:'Cogs of a merchant league moored at a brick harbour town with a crane gate, traders and wool bales',
 messen:'A large trade fair in a walled town meadow, colourful tents and stalls, merchants from many lands, cloth bales',
 universitaet:'A master lecturing from a raised chair to students in a vaulted hall, books on desks, gothic windows',
 kathedralen:'A towering gothic cathedral under construction, scaffolding on the spires, townsfolk looking up',
 lehnsrecht:'A feudal court in session in a castle hall, a lord judging a dispute between vassals, scribes recording',
 gotik:'Interior of a soaring gothic church with pointed arches, ribbed vaults and coloured light from rose windows',
 dombau:'A cathedral building lodge workshop, stone carvers shaping tracery, master builder with compass and plans',
 turnier:'Two armoured knights charging each other with lances in a tournament lists, banners, spectators in stands',
 soeldner:'A mercenary captain signing a contract with a city council at a table, coins counted, mercenaries waiting outside',
 wechselbrief:'An Italian banker at a counting table handing a bill of exchange to a merchant, coins and ledgers, money changers',
 stadtrecht:'A town council receiving a sealed charter from a prince in a market square, townhall and burghers celebrating',
 pulver:'Gunners firing a large bronze cannon in a cloud of white smoke, powder barrels and cannonballs',
 bastionen:'A star-shaped fortress with angled earth and brick bastions seen from slightly above, cannons on the ramparts',
 pikemuskete:'A pike and shot formation: a dense square of pikemen flanked by musketeers firing, smoke over a field',
 stehendesheer:'Uniformed soldiers of a standing army in neat ranks on a parade ground before barracks, an officer inspecting',
 banken:'A wealthy banker in a panelled counting house, a large ledger, chests of coin, clerks writing, a strongbox',
 kolonialhandel:'Large ocean-going sailing ships unloading spices, sugar and tobacco at a busy harbour quay, warehouses',
 merkantilismus:'A state minister inspecting a royal workshop and warehouses full of goods, tariff officers at a city gate',
 agrarreform:'Landowners and farmers with new ploughs and enclosed hedged fields, a surveyor measuring land',
 buchdruck:'A printer pulling a sheet from a wooden printing press, freshly printed pages hanging to dry, type cases',
 konfession:'Envoys of rival churches sitting at a peace congress table, documents and seals, a city spire visible through a window',
 absolutismus:'A splendid monarch in ermine on a throne in a gilded hall, courtiers bowing, ministers with papers',
 barock:'A grand baroque palace with formal gardens, fountains and statues, courtiers strolling',
 oranisch:'A commander drilling musketeers in precise ranks by a manual, soldiers performing the steps of loading together',
 magazin:'A large army supply magazine: wagons, grain sacks and barrels stacked in a fortified warehouse, quartermasters',
 hofkultur:'An opulent court ball in a palace hall with chandeliers, nobles dancing, musicians playing',
 sozietaet:'Scholars of a learned society observing an experiment with an air pump, telescopes and globes on the table',
 levee:'A crowd of young men enlisting in a town square, tricolour flags, a drummer, recruits receiving muskets',
 divisionen:'Generals bending over a large campaign map in a tent, couriers arriving, columns of troops marching outside',
 feldartillerie:'Horse artillery galloping into position, gunners unlimbering light cannons on a grassy hill',
 festungsguertel:'A ring of detached fortresses with earthworks and cannon around a large city, seen from a hill',
 dampf:'An early steam engine with a great beam and flywheel in a brick engine house, engineers and a coal fire',
 fabriken:'A large manufactory hall with rows of workers at looms and benches, bales of cloth, a supervisor',
 kanaele:'Barges pulled by horses along a new canal with a stone lock, workers digging an extension',
 fruchtwechsel:'A prosperous farm with rotating fields of turnips, clover, wheat and barley, healthy cattle grazing',
 aufklaerung:'Philosophers discussing in a salon by candlelight, books, a globe and scientific instruments',
 codecivil:'Lawyers and a statesman presenting a thick bound law code in a council chamber, clerks and citizens',
 nation:'Citizens of all classes singing beneath national flags at a festival in a town square, a drummer boy',
 klassizismus:'A neoclassical building with tall columns and a pediment at a grand square, citizens in period dress',
 wende0:'An emperor presenting a great reform before a senate assembly, clerks with tax registers, soldiers and officials',
 wende1:'A crowned ruler being anointed in a church, the restored empire, nobles and bishops around, banners',
 wende2:'Scholars of the Renaissance unrolling rediscovered ancient manuscripts, classical statues, a domed city behind',
 wende3:'Scholars and engravers compiling a great encyclopedia, stacks of volumes, plates of machines and plants on a table'
};
const T=require(path.join(OUT,'techs.json')); // aus imperium.html extrahiert (ohne Einheiten- und Kulturtechniken)
const rnd=()=>1000+Math.floor(Math.random()*89000);
const two=(id,p,r,g)=>['a','b'].map(v=>({f:`${id}_${v}`,p,r,g,seed:rnd()}));
const tech=t=>{const m=M[t.id];if(!m)throw new Error('Kein Motiv: '+t.id);
  return two('tk_'+t.id,`${m}, ${ERA[t.ep]}. ${STIL}${SQ}`,'1:1','Technik');};
const BAN={
 ui_gfx_leicht:'Top-down view of a hand-painted strategy game map of a Mediterranean coast, simple flat colors, few details, no shadows, low-poly tokens of tiny armies, muted palette, painterly game art',
 ui_gfx_mittel:'Same map view of a Mediterranean coast in a strategy game, detailed army figures with soft shadows, a few herds and carts on roads, warm daylight, painterly game art',
 ui_gfx_hoch:'Same map view of a Mediterranean coast in a strategy game, rich detail, fleets with wakes, campfires, herds, carts, crisp shadows, golden evening light, painterly game art',
 ev_schatz_a1:'Interior of an ancient Roman treasury vault, oil lamps, chests of gold coins, a scribe weighing coins on bronze scales, ledgers on a wooden table, warm candlelight',
 ev_schatz_m1:'Interior of a medieval treasury vault, candles, iron-bound chests of gold coins, a scribe weighing coins on scales, ledgers on a wooden table, warm candlelight',
 ev_schatz_n1:'Interior of an early-modern treasury vault, candles, chests of gold coins, a clerk weighing coins on brass scales, ledgers on a wooden table, warm candlelight',
 ev_urkunden_x1:'Envoys of two realms sealing a treaty at a long oak table, red wax seals, parchment scrolls with ribbons, banners in the background, candlelight'};
const ban=k=>two(k,`${BAN[k]}. ${k.startsWith('ui_gfx')?'No text, no lettering, no logos.':STIL}${W}`,'16:9','Banner');
const PROBE=['drill','coinage','skriptorium','armbrust','buchdruck','dampf','wende2','manipel'];
const probe=[...T.filter(t=>PROBE.includes(t.id)).flatMap(tech),...ban('ev_urkunden_x1')];
const NEU=['armbrust']; // in der Probe misslungen, neu mit geändertem Motiv
const haupt=[...T.filter(t=>!PROBE.includes(t.id)||NEU.includes(t.id)).flatMap(tech),...Object.keys(BAN).filter(k=>k!=='ev_urkunden_x1').flatMap(ban)];
const HP='a small painted miniature model of a large 9th-century Anglo-Saxon royal timber hall, long plank-built hall with carved door posts and a high, completely closed and intact thatched roof without any holes or gaps, solid roof ridge, isolated, no base, no ground, finely detailed with visible textures of the materials, warm natural colours, hand-painted, three-quarter view from the front and slightly above, plain light grey background, studio lighting, no text';
const halle=['c','d','e','f'].map(v=>({f:`angel_halle_${v}`,p:HP,r:'1:1',g:'21 England',ext:'png',seed:rnd()}));
for(const[n,a]of[['probe',probe],['haupt',haupt],['halle',halle]])fs.writeFileSync(path.join(OUT,n+'.json'),JSON.stringify(a,null,1));
console.log('probe',probe.length,'haupt',haupt.length,'halle',halle.length);
