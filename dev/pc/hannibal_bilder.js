// Job 40: Bilder Hannibal-Paket (Kino, Kapitel, Pass-Ereignisse, Rat von Karthago, Sonder-Schlachtfelder, Porträts).
// Aufruf: node dev/pc/hannibal_bilder.js <ziel.json>   → items.json für die Warteschlange (je Motiv 2 Varianten).
// Stil wie Job 22 (Wikinger-Kino) und Job 34. Schlüssel-Präfix hn_ (hb_ ist schon Habescha).
// Historische Leitplanken: Karthager ohne Turm auf dem Elefanten (Konzept), keine Schrift, keine Minarette/Kuppeln (Fehler vk_k4),
// Römer der Republik (Montefortino-Helm, ovaler Langschild, keine Kaiserzeit-Schienenpanzer).
const fs=require('fs');
const STIL='Oil painting in the style of a 19th-century academic history painting, painterly brushstrokes, muted earthy palette, dramatic natural light, no text, no lettering, no writing, no logos, no modern objects.';
const W=' Wide cinematic 16:9 landscape format.',P34=' Vertical portrait 3:4 format.';
const ERA=' Second Punic War, 218 to 202 BC. Roman soldiers of the Republic with Montefortino bronze helmets, oval scutum shields and mail; Carthaginian army of Libyans, Iberians in white tunics with purple borders, Celts, Numidian horsemen riding without saddle or bridle; African forest elephants without towers, ridden by a single mahout.';
const NO_ISLAM=' No minarets, no domes, no mosques, no crescents, no Christian crosses.';
// [Schlüssel, Motiv, Format]
const KINO=[
 // Seq. 1 „Der Schwur“
 ['hn_k1_altar','A nine-year-old boy, Hannibal, with his hand on a stone altar of Baal Hammon, his father Hamilkar Barca, a bearded general in bronze cuirass, standing behind him with a hand on his shoulder, priests and smoke from the sacrificial fire, dim temple interior lit by fire','W'],
 ['hn_k1_neukarthago','The Carthaginian city of Carthago Nova on a hill above a natural harbour in Spain, warships in the bay, city walls and a palace on the acropolis, an army camp outside the walls, morning light','W'],
 ['hn_k1_feldherr','Hannibal at twenty-eight, a lean dark-bearded Carthaginian commander in a plain bronze muscle cuirass and red cloak, standing among Libyan and Iberian soldiers who raise their spears and shields to him, army camp in Spain','W'],
 ['hn_k1_sagunt','The siege of Saguntum: an Iberian town on a high rocky ridge above the sea, Carthaginian siege towers and a battering ram against the walls, defenders hurling stones, dust and smoke','W'],
 ['hn_k1_gesandte','Roman envoys in white togas standing before the Carthaginian council in a columned hall, one envoy holding up a fold of his toga as if offering peace or war, tense faces of the councillors','W'],
 // Seq. 2 „Der Pass“
 ['hn_k2_kolonne','A long column of soldiers, pack mules and elephants winding up a narrow mountain path in the Alps in late autumn, first snow on the slopes, grey clouds, men wrapped in cloaks','W'],
 ['hn_k2_bergstaemme','Alpine mountain tribesmen on a cliff rolling boulders down onto an army column in a narrow gorge, mules falling, soldiers raising shields, chaos','W'],
 ['hn_k2_fels','Soldiers in the Alps heating a huge boulder that blocks the path with a great fire of felled trees, then pouring vinegar from amphorae onto the hot rock so it cracks, steam rising, elephants waiting behind','W'],
 ['hn_k2_poebene','Hannibal on a snowy Alpine pass pointing down to the green plain of the river Po far below in sunlight, exhausted soldiers and a few surviving elephants behind him, dramatic clouds','W'],
 ['hn_k2_elefanten','A few emaciated elephants descending a muddy snow-covered mountain path, mahouts leading them, frozen bodies of mules by the wayside, sombre mood','W'],
 // Seq. 3 „Cannae“
 ['hn_k3_zange','Bird’s-eye view of the battle of Cannae on a dusty summer plain by a river: a huge dense Roman block in the centre pushing forward into a curved Carthaginian line that bends back, African veterans closing in from both flanks, cavalry attacking the rear','W'],
 ['hn_k3_staub','The battle of Cannae at ground level: hot wind blowing dust into the faces of Roman legionaries, Carthaginian soldiers with the sun at their backs, a sea of spears and shields','W'],
 ['hn_k3_feld','Evening after the battle of Cannae: an endless field of fallen Roman soldiers and shields under a red sky, Carthaginian soldiers walking among them, Hannibal on horseback in silence','W'],
 ['hn_k3_ringe','Gold rings of fallen Roman knights poured from a sack onto the floor of the Carthaginian council hall, councillors leaning forward in astonishment, lamplight','W'],
 // Seq. 4 „Das Zögern“
 ['hn_k4_felder','Roman soldiers burning wheat fields and farmsteads in the hills of southern Italy to deny supplies to the enemy, farmers fleeing with carts, black smoke','W'],
 ['hn_k4_fabius','An old Roman dictator, Quintus Fabius Maximus, in a toga with a purple border, watching from a wooded hill as a Carthaginian army marches through a valley below, Roman soldiers waiting behind him','W'],
 ['hn_k4_capua','The rich Campanian city of Capua opening its gates to Hannibal, nobles in fine robes receiving him, fertile fields and Vesuvius in the distance','W'],
 ['hn_k4_rom','Hannibal on horseback with his officers before the walls of Rome at the Colline Gate, Roman citizens crowding the walls, a tense standoff, late afternoon','W'],
 ['hn_k4_rat','The council of Carthage arguing: Hanno the Great, an elderly aristocrat, pointing accusingly, younger supporters of the Barca family shouting back, columned hall, lamplight','W'],
 // Seq. 5 Ende A „Karthago triumphiert“
 ['hn_k5a_triumph','Hannibal returning victorious to Carthage, the circular military harbour (cothon) full of warships, crowds on the quays, banners, golden light','W'],
 ['hn_k5a_frieden','Roman senators in togas signing a peace treaty before Carthaginian officers in a tent, weapons laid down, sombre Romans','W'],
 ['hn_k5a_meer','Carthaginian warships sailing freely across the western Mediterranean at sunset, the coast of Sicily in the distance','W'],
 // Seq. 5 Ende B „Zama“
 ['hn_k5b_landung','Roman army of Scipio landing on the beach of Africa from many ships, legionaries wading ashore, palm trees and dry hills','W'],
 ['hn_k5b_gassen','The battle of Zama: Roman maniples opening lanes in their lines so that charging elephants run harmlessly through, trumpeters blowing to frighten them, dust','W'],
 ['hn_k5b_abschied','Hannibal standing at the stern of a ship looking back at the coast of Italy, grey sea, his face weary, a few veterans beside him','W'],
 ['hn_k5b_scipio','The young Roman general Publius Cornelius Scipio on horseback on the plain of Zama after the battle, his soldiers raising their shields','W'],
 // Kapitelbilder
 ['hn_kap_ebro','A Carthaginian army crossing the wide shallow river Ebro in Spain at dawn, elephants wading, Pyrenees on the horizon','W'],
 ['hn_kap_rhone','Elephants being ferried across the broad river Rhone on large rafts covered with earth, one elephant plunging into the water, Gallic warriors on the far bank','W'],
 ['hn_kap_trebia','Roman legionaries wading chest-deep through an icy river in snowfall at the Trebia, Carthaginian soldiers hidden in a reed-covered stream bed waiting to ambush','W'],
 ['hn_kap_trasimene','Morning fog over Lake Trasimene, a Roman column marching along the narrow shore, Carthaginian soldiers barely visible on the hillsides above in the mist','W'],
 ['hn_kap_kothon','The circular military harbour of Carthage (cothon) seen from above, ship sheds around the ring, the admiral’s island in the centre, merchant harbour beyond','L'],
 ['hn_kap_schwur','A sacred flame in a bronze bowl in a dark Punic temple, a boy’s hand and a man’s hand together over it','L'],
 // Pass-Ereignisse (Akt „Der Pass“, je Wahl ein Bild)
 ['hn_ps_route','Three possible mountain passes seen from a valley in the Alps: one short and steep with snow, one long through forests, one guarded by a hill fort of a mountain tribe','L'],
 ['hn_ps_lawine','An avalanche sweeping down a mountain slope onto the tail of an army column, men and mules buried in snow','W'],
 ['hn_ps_frost','Soldiers huddled around small fires at night on a snowy Alpine pass, frozen beards, wrapped in blankets, elephants standing motionless in the cold','W'],
 ['hn_ps_haeuptling','A mountain tribe chieftain in furs offering guides and cattle to a Carthaginian officer, hostages being exchanged, wary warriors on both sides','W'],
 ['hn_ps_absturz','A pack elephant slipping on an icy ledge above a gorge, mahouts trying to hold it with ropes','W'],
 ['hn_ps_vorraete','Soldiers counting dwindling grain sacks and slaughtering a pack mule for food in a snowy mountain camp','W'],
 // Rat von Karthago
 ['hn_rat_hanno','Hanno the Great, an elderly wealthy Carthaginian aristocrat in rich purple robes and gold jewellery, speaking with a raised finger in the council','P'],
 ['hn_rat_barkiden','Supporters of the Barca family, younger Carthaginian nobles and merchants in white and red robes, cheering and raising their fists in the council hall','W'],
 ['hn_rat_verstaerkung','Carthaginian transport ships unloading fresh Numidian horses and elephants in a southern Italian harbour at Locri, night, torches','W'],
 // Sonder-Schlachtfelder (Ladebilder der vier großen Schlachten)
 ['hn_sf_trebia','Winter battlefield at the river Trebia: snow-covered plain, an icy grey river, a reed-filled stream bed, Roman camp in the distance, before the battle, no soldiers in the foreground','L'],
 ['hn_sf_trasimene','Lake Trasimene in morning fog with a narrow shore path between lake and wooded hills, before the battle, empty landscape','L'],
 ['hn_sf_cannae','The wide dusty summer plain of Cannae beside the river Aufidus, a low hill with ruins of a small fort, heat haze, empty landscape before the battle','L'],
 ['hn_sf_zama','A dry open plain in North Africa near Zama with low hills and scattered shrubs, hot afternoon light, empty landscape before the battle','L'],
 // Porträts fehlender Figuren (3:4)
 ['hn_p_hamilkar','Hamilkar Barca, a stern grey-bearded Carthaginian general in bronze cuirass and red cloak','P'],
 ['hn_p_hasdrubal','Hasdrubal Barca, Hannibal’s younger brother, a bearded Carthaginian general in mail with a purple cloak, Spanish mountains behind','P'],
 ['hn_p_mago','Mago Barca, Hannibal’s youngest brother, a young bearded Carthaginian cavalry commander in light armour','P'],
 ['hn_p_maharbal','Maharbal, Numidian-Carthaginian cavalry commander, short beard, light cloak, holding a riding spear','P'],
 ['hn_p_fabius','Quintus Fabius Maximus, an old Roman senator and dictator in a toga with purple border, calm and stubborn face','P'],
 ['hn_p_scipio','Publius Cornelius Scipio (later Africanus), a young clean-shaven Roman general in a bronze muscle cuirass and red cloak','P'],
 ['hn_p_varro','Gaius Terentius Varro, a Roman consul of plebeian origin in a toga with purple border, eager and confident expression','P'],
 ['hn_p_masinissa','Masinissa, a young Numidian prince with braided hair and a short beard, riding cloak, holding javelins','P']
];
const rnd=()=>1000+Math.floor(Math.random()*89000);const L=[];
const ERA_K=' Second Punic War, about 218 to 202 BC.';
for(const[k,m,f]of KINO){const p=`${m}.${f==='W'?ERA:ERA_K}${NO_ISLAM} ${STIL}${f==='P'?P34:W}`;for(const v of['a','b'])L.push({f:`${k}_${v}`,p,r:f==='P'?'3:4':'16:9',g:'Hannibal',seed:rnd()});}
fs.writeFileSync(process.argv[2]||'items.json',JSON.stringify(L,null,1));console.log(L.length,'Bilder');
