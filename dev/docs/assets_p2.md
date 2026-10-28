# Assets Paket 2 „Innenleben“ – für die PC-Pipeline

Im Code werden zurzeit vorhandene Bilder genutzt (ev_feldherr, hist_rubikon, ev_thron, ev_thronwarnung, ev_revolt, ev_aufruhr, ev_wanderzug, ev_heerfolge). Fehlt eine Epochen-Variante, zeigt heroHtml das Epochenbild. Neue Bilder unter den Schlüsseln unten ablegen (Varianten _a1/_m1/_n1 bzw. _x1 wie üblich). Danach im Code nur den Schlüssel tauschen (siehe Spalte „ersetzt“).

## Bilder (FLUX, Querformat 16:9, Stil wie die übrigen ev_-Bilder: gemalt, warmes Licht, keine Schrift)

| Schlüssel | ersetzt im Code | Bildbeschreibung (Englisch, für FLUX) |
|---|---|---|
| ev_triumph_a1 | fhEv „Ehren: Triumphzug“ (zurzeit ev_feldherr) | Roman triumph procession through a sunlit marble city, victorious general in a four-horse chariot wearing a laurel wreath, soldiers carrying captured standards, cheering crowds throwing petals, painterly oil style, warm golden light |
| ev_triumph_m1 | dto. Mittelalter | Medieval victory procession entering a walled city, armored commander on a white horse under banners, townsfolk cheering from timber houses, church bells, painterly oil style, warm light |
| ev_triumph_n1 | dto. Neuzeit | Early modern victory parade through a baroque capital, general on horseback in a plumed hat, regiments with flags and drums, crowds on balconies, painterly oil style |
| ev_putsch_m1 | fhEv bei drohendem Putsch und Abfall-Ereignis „feld“ in Mittelalter (zurzeit hist_rubikon) | Medieval warlord raising his sword before his assembled army at dusk, soldiers hailing him as king, torches and banners, a distant castle on the horizon, tense dramatic mood, painterly oil style |
| ev_putsch_n1 | dto. Neuzeit | Early modern general in a dark coat addressing loyal regiments at night, soldiers raising muskets and shouting, campfires, a capital city glowing in the distance, dramatic chiaroscuro, painterly oil style |
| ev_gegenkoenig_a1 / _m1 / _n1 | Abfall-Ereignis „pret“ (zurzeit ev_thron) | A rival claimant crowned by his followers in a provincial hall, nobles kneeling, an improvised crown, banners in a different color than the realm, candlelight, tense and conspiratorial, painterly oil style (era: antique / medieval / early modern) |
| ev_statthalterkrone_a1 / _m1 / _n1 | Abfall-Ereignis „gov“ (zurzeit ev_revolt) | A provincial governor placing a crown on his own head in a regional palace, officials and guards looking on, the old imperial standard lying on the floor, painterly oil style, cold dawn light (era variants) |
| ev_zeitenwende_x1 | pk2UmbOpen, Abfall-Ereignis „umb“ (zurzeit ev_aufruhr) | Allegory of a turning age: a vast landscape where an old empire's road and a crumbling milestone fade into a new era, storm clouds parting, people of a province gathering at a crossroads, painterly oil style, epic and melancholic |
| ev_grenzmark_a1 | markOpen/markHtml Antike (zurzeit Epochenbild) | Frontier settlers in the Roman age: tribal warriors with families and wagons building a palisade fort on a river border, a Roman officer handing them a standard, painterly oil style |
| ev_grenzmark_m1 | dto. Mittelalter (zurzeit ev_heerfolge) | Medieval march on the frontier: mounted border lords and settlers raising a wooden castle on a hill above a wide steppe, painterly oil style |
| ev_grenzmark_n1 | dto. Neuzeit (zurzeit Epochenbild) | Cossack host at a fortified frontier post on the steppe, horsemen with lances and sabres, a watchtower and river, painterly oil style, wide sky |

## Sprecher (Deutsch, kurze Sätze, je Satz eine Datei)

| Schlüssel | Sprecher | Text |
|---|---|---|
| rat_marschall_putsch_warnung | Marschall | Herr, ein Feldherr sammelt Getreue um sich. Die Soldaten rufen seinen Namen, nicht deinen. |
| rat_marschall_putsch_ehre | Marschall | Ein Triumph würde ihn binden. Er kostet Gold, aber er kostet keine Krone. |
| rat_marschall_putsch | Marschall | Er hat den Rubikon überschritten. Sein Heer marschiert unter fremder Fahne. |
| rat_kanzler_abfall_reich | Kanzler | Die Region hat sich losgesagt und eine eigene Krone gewählt. Wir können zahlen, anerkennen oder kämpfen. |
| rat_kanzler_gegenkoenig | Kanzler | Ein Gegenkönig! Ferne Provinzen folgen ihm. Noch ist der Streit nicht verloren. |
| rat_kanzler_zeitenwende | Kanzler | Die Zeitenwende naht. Wo kein Statthalter regiert und Unruhe herrscht, wanken die Regionen. |
| rat_kanzler_zeitenwende_gut | Kanzler | Die Zeitenwende ist überstanden. Das Reich hält zusammen. |
| rat_marschall_foederaten | Marschall | Die Föderaten murren. Ein Jahrgeld oder ein Sieg würde sie beruhigen. |
| rat_kanzler_thronstreit_warnung | Kanzler | Der Herrscher altert, und ein Verwandter wartet. Kaufen wir seinen Anspruch, solange es noch geht. |

Hinweis: Sprecher-Einbindung (RATV.say) ist im Code noch nicht verdrahtet; nach Lieferung je Stelle ein `RATV.say('<schlüssel>',{cd:6})` ergänzen (fhRound-Warnung, fhPutsch, pk2DynRevolt, pk2GovRevolt, pk2UmbRound, markRound-Warnung, pk2ThronOpen).

---

# Teil 4 „Völkermosaik“ – Gesandtenporträts und Sprecher

Im Code: `vmImgUrl(c)` nimmt zuerst `heroImg('vm_'+kultur)`, sonst ein Kriegerbild des Volkes (img/u_sp_*.webp). Neue Bilder unter `vm_<kultur>_x1` ablegen (epochenfest; optional zusätzlich `_a1/_m1/_n1`), Hochformat 3:4 oder quadratisch, Kopf im oberen Drittel (die Karte schneidet auf 128×178 px zu, Ausschnitt oben). Kein Code-Tausch nötig: Sobald das Bild im Paket (PKREG) steht, erscheint es.

| Schlüssel | Kultur (CULT) | Bildbeschreibung (Englisch, für FLUX) |
|---|---|---|
| vm_keltisch_x1 | Kelten/Gallier | Portrait of a Celtic envoy chieftain at a foreign royal court, long moustache, golden torc, checkered wool cloak with bronze brooch, proud wary gaze, warm torchlight, painterly oil style, dark background |
| vm_germanisch_x1 | Germanen | Portrait of a Germanic tribal envoy, braided blond beard, fur-trimmed cloak, iron arm rings, holding a carved staff, standing in a stone hall, painterly oil style, warm light |
| vm_nordisch_x1 | Nordleute | Portrait of a Norse jarl as envoy, weathered face, braided beard, bear fur over chainmail, silver hammer amulet, cold blue window light, painterly oil style |
| vm_slawisch_x1 | Slawen/Veneter | Portrait of a Slavic elder envoy, long linen tunic with red embroidery, fur hat, grey beard, holding bread and salt, wooden hall, painterly oil style |
| vm_thrakisch_x1 | Thraker/Illyrer | Portrait of a Thracian noble envoy, Phrygian cap, patterned cloak, silver phiale in hand, dark curly beard, painterly oil style, warm light |
| vm_griechisch_x1 | Griechen | Portrait of a Greek statesman envoy in a white himation with blue border, olive wreath, trimmed beard, scroll in hand, marble columns behind, painterly oil style |
| vm_latein_x1 | Latiner/Romanen | Portrait of a Roman-born senator envoy in a toga with purple stripe, signet ring, calm calculating look, marble hall, painterly oil style |
| vm_iberisch_x1 | Iberer/Hispanier | Portrait of an Iberian chieftain envoy, black sagum cloak, bronze falcata at the belt, dark beard, sun-baked face, painterly oil style |
| vm_britisch_x1 | Britannier | Portrait of a Briton chieftain envoy with blue woad tattoos, bronze torc, tartan cloak, misty hall, painterly oil style |
| vm_steppe_x1 | Steppenvölker | Portrait of a steppe nomad khan envoy, fur-lined pointed hat, gold plaques on leather coat, composite bow on the back, wind-burnt face, painterly oil style |
| vm_persisch_x1 | Perser | Portrait of a Persian satrap envoy, tall felt cap, embroidered silk robe, curled beard, gold bracelets, palace arches behind, painterly oil style |
| vm_semitisch_x1 | Aramäer/Syrer/Levante | Portrait of a Levantine merchant-prince envoy, layered robes in purple and saffron, rings, carefully trimmed beard, cedar hall, painterly oil style |
| vm_arabisch_x1 | Araber | Portrait of an Arab tribal sheikh envoy, white headcloth and dark cloak, curved dagger at the belt, desert light, painterly oil style |
| vm_aegyptisch_x1 | Ägypter/Kopten | Portrait of an Egyptian noble envoy, linen robe, broad collar necklace, kohl-lined eyes, papyrus scroll, temple pillars behind, painterly oil style |
| vm_punisch_x1 | Punier/Nordafrika | Portrait of a Punic merchant noble envoy, long patterned robe, conical cap, gold earrings, harbour light, painterly oil style |
| vm_berber_x1 | Berber/Mauren | Portrait of a Berber chief envoy, indigo veil and turban, silver jewellery, spear, desert dusk, painterly oil style |
| vm_kaukasisch_x1 | Kaukasier/Armenier | Portrait of an Armenian noble envoy, embroidered kaftan, fur hat, dark beard, mountain fortress behind, painterly oil style |
| vm_afrikanisch_x1 | Afrikaner | Portrait of a West or East African noble envoy, richly patterned robe, gold jewellery, carved staff of office, warm light, painterly oil style |
| vm_indisch_x1 | Inder | Portrait of an Indian rajput noble envoy, jewelled turban, embroidered silk jama, curved sword, palace courtyard, painterly oil style |
| vm_chinesisch_x1 | Han-Chinesen | Portrait of a Chinese scholar-official envoy, dark silk robe with rank badge, black hat, long thin beard, painterly oil style |

## Sprecher (Deutsch, Kanzler; je Satz eine Datei)

| Schlüssel | Sprecher | Text |
|---|---|---|
| rat_kanzler_volk_neu | Kanzler | Ein fremdes Volk in unserem Reich schickt Gesandte. Hören wir, was sie wollen. |
| rat_kanzler_volk_wunsch | Kanzler | Die Gesandten warten auf Antwort. Ein Zugeständnis kostet uns etwas, Schweigen kostet ihre Treue. |
| rat_kanzler_volk_zufrieden | Kanzler | Das Volk ist zufrieden. Seine Krieger stehen bereit, unter unserem Banner zu kämpfen. |
| rat_kanzler_volk_warnung | Kanzler | Herr, ein Volk unseres Reichs will sich lossagen. Noch vier Runden, dann ist es zu spät. |
| rat_kanzler_volk_abfall | Kanzler | Sie haben sich losgesagt und einen eigenen Fürsten gewählt. Bestechen, anerkennen oder zurückholen? |
| rat_kanzler_volk_wortbruch | Kanzler | Wir haben unser Wort gebrochen. Dieses Volk wird es so bald nicht vergessen. |
| rat_kanzler_volk_angleichen | Kanzler | Angleichung braucht Geduld. Wer sie erzwingt, erntet Groll. |

Einbindung nach Lieferung: `RATV.say('<schlüssel>',{cd:6})` in vmRound (neu, Warnung, Wortbruch), vmRevolt und vmSetPol('acc').
