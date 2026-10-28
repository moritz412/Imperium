// Erzeugt den FLUX-Auftrag für alle fehlenden Bilder (Prüfung 28.10.): Völker-Gesandte je Epoche, fehlende Völker,
// Gebäude ohne Bild, Artillerie Antike/Mittelalter, Wirtschafts-Unterreiter. Aufruf: node dev/pc/luecken_bilder.js <ziel.json>
const fs=require('fs');
const STIL='Oil painting in the style of a 19th-century academic history painting, painterly brushstrokes, muted earthy palette, dramatic natural light, no text, no lettering, no writing, no logos, no modern objects.';
const P34=' Vertical portrait 3:4 format.',W=' Wide cinematic 16:9 landscape format.',SQ=' Square 1:1 format, single clear subject in the centre.';
// Gesandte je Kultur: m = Mittelalter (um 1100), n = Frühe Neuzeit (um 1650); x nur für Völker, die bisher gar kein Bild haben
const VM={
 latein:{m:'an Italian merchant-noble envoy from a city republic, red wool cap, fur-trimmed gown, gold chain, Romanesque arcade behind',n:'an Italian diplomat in black silk doublet with white lace collar, rapier hilt, baroque palazzo behind'},
 punisch:{m:'a North African Maghrebi notable envoy, white burnous over striped robe, henna-dyed beard, horseshoe arch behind',n:'a Barbary coast envoy in red kaftan and white turban, curved dagger in sash, harbour fortress behind'},
 keltisch:{m:'a French noble envoy in blue surcoat with fleur-de-lis embroidery, chainmail coif lowered, gothic window behind',n:'a French courtier envoy in plumed wide hat, lace cravat, long curled hair, gilded salon behind'},
 thrakisch:{m:'a Bulgarian boyar envoy in fur hat and long brocade kaftan, Byzantine-style cross pendant, wooden church behind',n:'a Balkan Christian notable in fur kalpak and embroidered dolman under Ottoman rule, stone bridge behind'},
 griechisch:{m:'a Byzantine court official envoy in purple and gold silk loros, jewelled collar, gold mosaic behind',n:'a Greek merchant notable in dark kaftan and fez-like cap, prayer beads, Aegean harbour behind'},
 iberisch:{m:'a Castilian knight envoy in mail with castle-and-lion surcoat, cloak, Mudejar arches behind',n:'a Spanish grandee envoy in black velvet with stiff ruff collar, red cross of Santiago, dark palace hall behind'},
 aegyptisch:{m:'a Fatimid or Mamluk Egyptian emir envoy, striped silk robe, white turban with gold band, mosque lamps behind',n:'an Ottoman Egyptian bey envoy, tall turban, fur-lined kaftan, Nile and minarets behind'},
 semitisch:{m:'a Levantine Arab-Christian notable envoy, embroidered robe and headscarf, cedar wood hall, crusader castle in the distance',n:'a Syrian merchant envoy in silk kaftan and turban, caravanserai courtyard behind'},
 germanisch:{m:'a German count envoy of the Holy Roman Empire, eagle-embroidered tabard over mail, half-timbered hall behind',n:'a German imperial count envoy in buff coat and lace collar, wide-brimmed hat, town hall behind'},
 britisch:{m:'an English baron envoy, red surcoat with three lions badge, mail, Norman stone hall behind',n:'an English gentleman envoy in dark doublet with falling band collar, short cape, Tudor-style hall behind'},
 slawisch:{m:'a Kievan Rus boyar envoy in tall fur hat and long embroidered kaftan, onion domes behind',n:'a Muscovite boyar envoy in high sable hat and gold-brocaded feryaz robe, Kremlin walls behind'},
 nordisch:{m:'a Scandinavian Christian jarl envoy around 1100, wool cloak with round brooch, cross pendant, stave church behind',n:'a Swedish officer-envoy in blue coat and buff leather, broad hat, Baltic fortress behind'},
 steppe:{m:'a Mongol noyan envoy in silk deel robe and fur-trimmed hat, gold paiza tablet on belt, felt tents behind',n:'a Crimean Tatar mirza envoy in fur-trimmed kaftan and lambskin hat, horses behind'},
 arabisch:{m:'an Abbasid court envoy in black robe and turban, scholarly bearing, arabesque arches behind',n:'an Arabian sheikh envoy in white thobe and bisht cloak, curved jambiya dagger, desert fort behind'},
 afrikanisch:{m:'a Mali empire envoy in rich indigo and white robes, gold jewellery, mud-brick mosque behind',n:'a West African royal envoy of a coastal kingdom, kente-like woven cloth, gold staff of office, palm court behind'},
 indisch:{m:'a Rajput noble envoy in pleated jama and turban, curved talwar, carved sandstone temple behind',n:'a Mughal court envoy in white muslin jama, jewelled turban ornament, red sandstone palace behind'},
 chinesisch:{m:'a Song dynasty official envoy in red robe with winged black hat, jade belt, ink landscape screen behind',n:'a Ming or early Qing official envoy in robe with mandarin square badge, court beads, lacquered pavilion behind'},
 berber:{m:'an Almoravid Berber envoy with indigo face veil and white burnous, desert kasbah behind',n:'a Moroccan Saadi envoy in white haik and red cap, ornate tile courtyard behind'},
 kaukasisch:{m:'a Georgian noble envoy in long chokha coat with silver belt, cross pendant, mountain monastery behind',n:'an Armenian merchant envoy in long silk robe and tall cap, caravanserai behind'},
 persisch:{m:'a Seljuk Persian vizier envoy, layered silk robes, white turban, turquoise tile dome behind',n:'a Safavid Persian envoy in red-baton turban (qizilbash), brocade robe, Isfahan arches behind'},
 habescha:{x:'an Ethiopian court envoy in white shamma cloth with coloured border, processional cross, rock-hewn church behind',m:'an Ethiopian Zagwe noble envoy in white shamma and embroidered cape, rock-hewn church of Lalibela behind',n:'an Ethiopian Solomonic court envoy in velvet cape over white robes, Gondar castle behind'},
 indigen:{x:'a Native American envoy of the eastern woodlands, wampum belt, feather headdress, deerskin, forest longhouse behind',m:'a Mississippian chief envoy with copper ornaments and feathered cloak, earthen mound temple behind',n:'a Haudenosaunee sachem envoy with wampum belts, trade-cloth blanket, palisaded village behind'},
 japanisch:{x:'a Japanese court noble envoy in layered silk robes and black lacquered hat, wooden shrine gate behind',m:'a Japanese samurai envoy of the Kamakura era in lacquered armour without helmet, shrine behind',n:'a Japanese daimyo envoy in kamishimo with family crest, castle keep behind'},
 koreanisch:{x:'a Korean scholar-official envoy in silk robe and black horsehair gat hat, palace roofs behind',m:'a Goryeo court official envoy in green robe and winged hat, celadon vase, temple behind',n:'a Joseon yangban envoy in white robe and black gat hat, palace gate behind'},
 suedostasiatisch:{x:'a Khmer court envoy in silk sampot with gold armbands, carved temple towers behind',m:'a Khmer Angkor court envoy, gold diadem and silk sampot, stone temple towers behind',n:'a Siamese Ayutthaya envoy in tall conical hat and brocade jacket, gilded stupa behind'}
};
const BLD={
 salpeterei:'A saltpetre works in a medieval town: workers scraping white crust from stable walls, boiling vats over fires, wooden sheds, steam',
 pulvermuehle:'A gunpowder mill by a stream, water wheel driving stamp mills in a stone building with thin walls, barrels of black powder, careful workers',
 giesserei:'A cannon foundry: molten bronze poured from a furnace into a clay mould pit, master founder watching, finished bronze cannon barrels',
 stelen:'A field of tall carved granite stelae of Aksum on a hillside, ancient Ethiopian monuments, priests walking',
 boerse:'An early-modern stock exchange courtyard with arcades, merchants in black coats trading, a clock tower above'};
const ART={
 e0:'A Roman torsion artillery battery: ballista and onager on a hill, crews winding the ropes, siege camp behind',
 e1:'Early medieval siege engines: a traction trebuchet pulled by a team of men and a mangonel, wooden frames, a fortified town behind',
 e2:'A great counterweight trebuchet hurling a stone at a castle, crew at the winch, banners, high medieval siege'};
const BAN={
 ui_waren:'Interior of a busy medieval warehouse: sacks of grain, bales of cloth, barrels of wine, amphorae, a clerk with a tally stick, warm light',
 ui_maerkte:'A trade route crossroads with a market town: caravans, carts and river boats bringing goods, merchants at stalls, painterly overview'};
const rnd=()=>1000+Math.floor(Math.random()*89000),two=(f,p,r,g)=>['a','b'].map(v=>({f:`${f}_${v}`,p,r,g,seed:rnd()}));
const L=[];
for(const c in VM)for(const e of['x','m','n'])if(VM[c][e])L.push(...two(`vm_${c}_${e}1`,`Portrait of ${VM[c][e]}, envoy at a foreign royal court, dignified, painterly oil style. ${STIL}${P34}`,'3:4','Völker'));
for(const k in BLD)L.push(...two(`b_${k}`,`${BLD[k]}. ${STIL}${SQ}`,'1:1','Gebäude'));
for(const k in ART)L.push(...two(`u_art_${k}`,`${ART[k]}. ${STIL}${SQ}`,'1:1','Artillerie'));
for(const k in BAN)L.push(...two(k,`${BAN[k]}. ${STIL}${W}`,'16:9','Wirtschaft'));
fs.writeFileSync(process.argv[2]||'items.json',JSON.stringify(L,null,1));console.log(L.length,'Bilder');
