# Konzept für morgen (18.10.): Asien Stufe 1, Amerika vor 1492, weitere Ideen

Grundlage im Code (imperium.html): `THEATERS` (Z. 5304), `thOfLL` (Z. 5310), `PROV_DEF` (Z. 1208, Feld `ep` = Aktivierungsepoche, Indien ab Z. ~1581 mit `ep:3`), `POLYS` mit `th:` (Z. 5056, erzeugt mit `scratchpad/geo/mk.js`), `LAND_LINKS` (Z. 1697), `FACTIONS` (Z. ~996), `PLAYABLE` (Z. 1023), `PEOPLE` (Z. 3395), `SLOT_PEOPLE` (Z. 3562), `EPOCHS[].spawns` (Z. 3694 ff.), `REG_CULT` (Z. ~6377), `RELIG`.
Epochen: 0 Antike (−300), 1 Völkerwanderung (400), 2 Mittelalter (900), 3 Frühe Neuzeit (1500), 4 Napoleonisches Zeitalter.

---

## 1. Asien Stufe 1: Schauplatz „Ostasien“

### 1.1 Technik (Reihenfolge)
1. `THEATERS` um einen 5. Eintrag ergänzen:
   `{id:'oas',name:'Ostasien',lon0:86,lon1:146,lat0:-9,lat1:54,k:0.5,hk:0.8,lc:86,la:54,ox:82,oz:0,ep:0,tx:9.5,hx:3.7,trees:6000}`
   - Nach `MS` (×2) liegt X bei ca. 164 bis 210, also rechts von Ostafrika (X 124 bis 156). Keine Überschneidung.
   - `trees` niedrig halten (RAM).
2. `thOfLL` erweitern. **Die Reihenfolge ist wichtig, denn heute fängt `lon>62` alles östlich ab:**
   `lon<-30?2 : (lon>93||(lon>78&&lat>37.5))?4 : lon>62?1 : (lat<6&&lon>25)?3 : 0`
   (Dsungarei, Turfan und Khovd liegen westlich von 93° und müssen trotzdem nach Ostasien.)
3. `POLYS th:4` mit `geo/mk.js` erzeugen: Box `[86,-9,146,54]`. Seen sind nicht nötig, höchstens Baikal und Tonle Sap. Ergebnis als `oas.txt` erzeugen und an `POLYS` anhängen.
4. Seewege und Häfen: `PORTGEO` und `COASTL` für die neuen Küstenprovinzen. Prüfen, ob Verbindungen zwischen Schauplätzen nur über See laufen. Eine Landverbindung über die Steppe, etwa Dsungarei mit Kasachensteppe, ist vermutlich nicht vorgesehen, das muss geprüft werden.
5. `REG_CULT`: neue Kulturen `chinesisch`, `japanisch`, `koreanisch`, `suedostasiatisch` (Mongolei → `steppe`). Kultur-Namenstabelle wie `indisch:{n:[5 Epochen],c:…}`.
6. `RELIG`: neu sind `buddh` (Buddhismus), `konfuz` (Konfuzianismus/Ahnenkult) und `shinto`. Für Südostasien in Epoche 0 bis 2 gilt `hindu`, für die Inseln ab Epoche 3 `islam`.
7. `updateTheaterUI` und `#thSel` funktionieren schon generisch. Beim Theaterwechsel nur testen, ob der Kamerarahmen (`theaterBounds`) stimmt.

### 1.2 Provinzliste (60 Provinzen; Lon/Lat sind Schätzungen für die Hauptstadt)
Format wie `PROV_DEF`: `{id,name,city,lon,lat,owner:"frei",tax,gar,reg,ep}`. `ep` = ab wann die Provinz aktiv ist. Das Kernland ist ab Epoche 0 aktiv, die Ränder später.

**China (20)**
| id | Name | Stadt | lon | lat | reg | ep | tax |
|---|---|---|---|---|---|---|---|
| zhili | Zhili | Ji / Beijing | 116.4 | 39.9 | cn_nord | 0 | 20 |
| shandong | Shandong | Linzi / Jinan | 117.0 | 36.65 | cn_nord | 0 | 20 |
| henan | Henan | Luoyang / Kaifeng | 112.45 | 34.62 | cn_nord | 0 | 24 (cap) |
| shanxi | Shanxi | Jinyang / Taiyuan | 112.55 | 37.87 | cn_nord | 0 | 16 |
| guanzhong | Guanzhong | Xianyang / Chang'an | 108.94 | 34.34 | cn_west | 0 | 24 (cap) |
| hexi | Hexi-Korridor | Liangzhou | 102.64 | 37.93 | cn_west | 1 | 10 |
| amdo | Amdo | Xining | 101.78 | 36.62 | cn_west | 2 | 8 |
| sichuan | Sichuan | Chengdu | 104.07 | 30.67 | cn_west | 0 | 20 |
| yunnan | Yunnan | Dali | 100.23 | 25.6 | cn_west | 1 | 11 |
| hubei | Hubei | Ying / Jiangling | 112.2 | 30.35 | cn_mitte | 0 | 18 (cap Chu) |
| jiangnan | Jiangnan | Jianye / Nanjing | 118.8 | 32.06 | cn_mitte | 0 | 22 |
| zhejiang | Zhejiang | Hangzhou | 120.15 | 30.27 | cn_mitte | 1 | 20 |
| jiangxi | Jiangxi | Nanchang | 115.9 | 28.68 | cn_mitte | 1 | 14 |
| hunan | Hunan | Changsha | 112.94 | 28.23 | cn_sued | 0 | 14 |
| fujian | Fujian | Quanzhou | 118.6 | 24.9 | cn_sued | 1 | 16 |
| lingnan | Lingnan | Panyu / Guangzhou | 113.26 | 23.13 | cn_sued | 0 | 18 |
| guangxi | Guangxi | Guilin | 110.3 | 25.27 | cn_sued | 1 | 10 |
| liaodong | Liaodong | Liaoyang | 123.17 | 41.27 | mandschurei | 0 | 12 |
| mandschurei | Mandschurei | Huining | 126.97 | 45.5 | mandschurei | 1 | 9 |
| formosa | Formosa | Tainan | 120.2 | 23.0 | cn_sued | 3 | 9 |

**Korea (6)**: pjongan „P'yŏngan“ Pjöngjang 125.75/39.03 (korea, ep 0) · hamgyong „Hamgyŏng“ Hamhŭng 127.54/39.92 (1) · hanseong „Gyeonggi“ Hanseong 126.98/37.57 (0, cap) · gongju „Chungcheong“ Gongju 127.12/36.46 (0) · gyeongju „Gyeongsang“ Gyeongju/Busan 129.21/35.84 (0) · jeolla „Jeolla“ Jeonju 127.15/35.82 (1)

**Japan (10)**: hakata „Nord-Kyūshū“ Dazaifu 130.52/33.51 (jp_west, ep 0) · satsuma „Satsuma“ Kagoshima 130.55/31.6 (jp_west, 1) · shikoku „Shikoku“ Kōchi 133.53/33.56 (jp_west, 1) · chugoku „Chūgoku“ Yamaguchi 131.47/34.18 (jp_west, 1) · kinai „Kinai“ Nara/Kyōto 135.77/35.01 (jp_mitte, 0, cap) · owari „Owari-Mino“ Kiyosu 136.85/35.22 (jp_mitte, 1) · hokuriku „Hokuriku“ Kanazawa 136.65/36.56 (jp_mitte, 2) · kanto „Kantō“ Kamakura/Edo 139.7/35.68 (jp_ost, 1) · mutsu „Mutsu“ Hiraizumi 141.13/38.99 (jp_ost, 2) · ezo „Ezo“ Matsumae 140.1/41.43 (jp_ost, 3)

**Mongolei/Steppe (8)**: orchon „Orchon“ Karakorum 102.83/47.2 (mongolei, ep 0, cap) · onon „Onon-Kherlen“ Delüün Boldog 111.5/49.0 (0) · selenge „Selenge“ Kjachta 106.45/50.35 (1) · shangdu „Innere Mongolei“ Shangdu 116.18/42.36 (0) · hulunbuir „Hulun Buir“ Hailar 119.7/49.2 (1) · khovd „Altai“ Khovd 91.64/48.0 (1) · dsungarei „Dsungarei“ Beschbalik 89.18/44.1 (1) · turfan „Turfan“ Gaochang 89.19/42.95 (1, reg tarim)

**Südostasien (16)**: daiviet „Đại Việt“ Cổ Loa/Thăng Long 105.85/21.03 (sea_fest, ep 0) · champa „Champa“ Vijaya 109.1/13.9 (1) · angkor „Kambuja“ Angkor 103.87/13.41 (1, cap) · funan „Funan“ Óc Eo 105.15/10.25 (0) · ayutthaya „Ayutthaya“ 100.57/14.35 (2) · sukhothai „Sukhothai“ 99.82/17.0 (2) · lanxang „Lan Xang“ Luang Prabang 102.13/19.89 (2) · pagan „Pagan“ Bagan 94.86/21.17 (1) · pegu „Pegu“ Bago 96.48/17.34 (1) · malakka „Malakka“ 102.25/2.19 (sea_insel, 2) · srivijaya „Srivijaya“ Palembang 104.75/−2.99 (1) · aceh „Pasai/Aceh“ 95.32/5.55 (2) · majapahit „Ostjava“ Trowulan 112.38/−7.55 (1) · sunda „Westjava“ Banten 106.15/−6.03 (1) · brunei „Brunei“ 114.94/4.9 (2) · luzon „Luzon“ Tondo 120.98/14.6 (2) · molukken „Molukken“ Ternate 127.38/0.79 (2)
(Das sind 17 Einträge. Wenn es eng wird, `funan` weglassen und dessen Rolle `angkor`/`champa` geben. Dann sind es 60 Provinzen.)

`LAND_LINKS` neu: `['hakata','gyeongju']` (Meerenge von Tsushima, nur als Seeweg), `['liaodong','pjongan']`, `['hexi','turfan']`, `['pagan','yunnan']`, `['malakka','srivijaya']` (Seeweg), `['luzon','fujian']` (Seeweg).

### 1.3 Völker je Epoche (Startslots wie `EPOCHS[e].spawns`; `army` wie gehabt)
- **E0 Antike (−300)**, also schon in `START_SLOTS`/`MINOR_SLOTS`: `qin` [guanzhong, sichuan] · `chu` [hubei, hunan, jiangnan] · `qi` [shandong] · `zhao` [shanxi, zhili] · `xiongnu` [orchon, onon, shangdu] (steppe) · `gojoseon` [pjongan, liaodong] · `aulac` [daiviet] · `funan` [funan]
- **E1 Völkerwanderung (400)**: `nwei` (Nördliche Wei) [shanxi, henan, zhili] · `jin_s` (Südliche Dynastien) [jiangnan, zhejiang, hubei] · `rouran` [orchon, onon, selenge] · `goguryeo` [pjongan, liaodong, hamgyong] · `baekje` [gongju, jeolla] · `silla` [gyeongju] · `yamato` [kinai, chugoku] · `srivijaya` [srivijaya, malakka]
- **E2 Mittelalter (900)**: `song` [henan, jiangnan, zhejiang, shandong] · `liao` [shangdu, zhili, hulunbuir] · `xixia` [hexi, amdo] · `goryeo` [hanseong, pjongan, gyeongju] · `heian` [kinai, owari, chugoku] · `khmer` [angkor, champa] · `daiviet` [daiviet] · `pagan` [pagan, pegu] · **Mongolen per Ereignis „Kurultai“ (1206)**: `mongolen` [onon, orchon, selenge] mit einem starken Reiterheer
- **E3 Frühe Neuzeit (1500)**: `ming` [zhili, jiangnan, henan, zhejiang, lingnan] · `joseon` [hanseong, gongju, gyeongju] · `shogunat` [kanto] und die Daimyō (siehe 1.6) · `ayutthaya` [ayutthaya, sukhothai] · `taungoo` [pegu, pagan] · `malakka_s` [malakka] · `nyuan` (Nördliche Yuan/Oiraten) [orchon, khovd, dsungarei] · `jurchen` (ab Runde X als Spätere Jin) [mandschurei, liaodong]. Europäer kommen über See: Portugal → malakka (1511), Spanien → luzon, VOC → sunda/molukken
- **E4 Napoleonisch**: `qing` [ganz China plus Mongolei] · `shogunat` · `joseon` · `konbaung` [pagan, pegu] · `nguyen` [daiviet, champa] · `siam` [ayutthaya] · britische und niederländische Stützpunkte
- `PEOPLE.next`: qin → han_r → nwei/jin_s → sui/tang → song → ming → qing; yamato → heian → shogunat. Die Farben sollten sich unterscheiden: China gelb bis rot, Japan weiß bis rot, Korea blau.

### 1.4 Mechanik „Mandat des Himmels“
- **Daten**: `S.mandat={holder:f|null, v:0..100, turns:0}`. Konstante `CN_CORE=['zhili','henan','guanzhong','jiangnan']`. Pro Provinz in China wird das vorhandene `unrest` genutzt.
- **Regeln**
  - Wer 2 der 4 `CN_CORE` und mindestens 50 % der Provinzen in China hält und das 5 Runden lang, erhält das Mandat. Startwert ist `v=60`.
  - Jede Runde: `v += 1` bei Frieden und Ordnung, `−2` je verlorene Schlacht, `−1` je China-Provinz mit `unrest>50`, `−5` bei Hunger- oder Flutereignissen.
  - Bonus bei `v>60`: Ordnung +1 in allen China-Provinzen und +10 % Steuer. Tributgaben fallen doppelt so hoch aus (siehe 1.5).
  - Bei `v<25` beginnt der „Zerfall des Mandats“: In jeder Runde erhebt sich mit 15 % Wahrscheinlichkeit eine Rebellenfraktion (Gelbe Turbane, Rote Turbane) in der Provinz mit der höchsten `unrest`. Nachbarn bekommen einen Kriegsgrund.
  - Bei `v=0` verliert der Halter das Mandat und ein „Dynastiewechsel“ wird möglich: Wer zuerst die Hauptstadt erobert, gründet eine neue Dynastie (nach `PEOPLE.next`).
- **UI**
  - Kleines Mandat-Symbol (gelbe Sonne) mit Balken im Fraktionspanel. Auf der Karte erhalten die Provinzen des Halters einen gelben Randschimmer.
  - Ereignisbilder: `as_ev_mandat` für Zerfall und Komet, `oa_cn_ev_himmelsopfer` für ein gewonnenes Mandat.
  - Ein Tooltip zeigt, was das Mandat gerade senkt oder hebt.

### 1.5 Mechanik „Tributsystem“
- **Daten**: `S.trib={[vasall]:{lord, seit, next}}`. Gilt nur, wenn `lord` das Mandat oder mindestens 10 Provinzen in China besitzt.
- **Regeln**
  - In der Diplomatie gibt es die neue Option „Tribut entrichten“ (Vasall) und „Gesandtschaft empfangen“ (Lord).
  - Alle 8 Runden reist eine Gesandtschaft. Der Vasall zahlt 20 Gold und erhält Gegengaben im Wert von 30 Gold plus +10 % Handel für 8 Runden, wirtschaftlich lohnt es sich also.
  - Lord und Vasall sind 30 Runden an Nichtangriff gebunden. Der Lord bekommt +2 Mandat je Gesandtschaft.
  - Bleibt eine Gesandtschaft aus, verliert der Lord Mandat (−3) und erhält einen Kriegsgrund.
  - Die KI-Vasallen der Ming sind typischerweise joseon, daiviet, malakka_s, ayutthaya und Ryukyu.
- **UI**: Knopf im Diplomatiefenster. Gestrichelte goldene Linien zwischen den Hauptstädten. Ereignisbild `oa_cn_ev_tribut`. Eine kleine Liste „Tributstaaten“ im Fraktionspanel.

### 1.6 Mechanik „Shogunat und Daimyō-Treue“
- **Daten**: Für jede Japan-Provinz `S.prov[i].dm={clan:'oda'|'mori'|'shimazu'|'date'|'takeda'|…, treue:0..100}`. Dazu `S.shogun=f|null`. Die Clans sind keine eigenen KI-Fraktionen, sondern Provinz-Attribute. Nur bei Abfall werden sie zur Rebellenfraktion `daimyo_<clan>`.
- **Regeln**
  - Shōgun wird, wer Kinai und Kantō sowie mindestens 60 % der Japan-Provinzen hält.
  - `treue` −1 pro Runde, wenn der Shōgun im Krieg verliert. −5 bei hohen Steuern.
  - Fällt `treue` unter 30, fällt die Provinz mit 10 % Wahrscheinlichkeit pro Runde ab und wird zum Daimyō-Aufstand. Fallen 3 oder mehr Provinzen ab, folgt das Ereignis „Entscheidungsschlacht“ (Sekigahara): eine Feldschlacht. Bei Sieg steigt `treue` überall auf 70.
  - Aktionen des Spielers:
    - „Geiseln fordern“: +15 Treue, −Ansehen.
    - „Land verleihen“: Die Provinz gibt die Hälfte der Steuer ab, dafür +25 Treue.
    - „Sankin-kōtai einführen“ ab Epoche 3: −2 Gold je Provinz und Runde, Treue fällt nie unter 50, Aufstände sind ausgeschlossen. Dazu Handelsbonus in Kantō (Straße nach Edo).
  - In Epoche 2 bis Anfang Epoche 3 gilt die „Sengoku-Zeit“: Treue startet bei 40.
- **UI**: Der Provinztooltip zeigt Clanname und Treuebalken. Unter der Diplomatie gibt es ein Panel „Daimyō“ mit einer sortierten Liste (niedrigste Treue zuerst). Ereignisbilder: `oa_jp_ev_sekigahara`, `oa_jp_ev_sankin`.

### 1.7 Einheiten-Varianten (`VARIANTS`, Bilder in der Bildliste unter „Asien“)
Feuerlanze (missile, E2), Tang-Panzerreiter (cav, E1), Ming-Musketier (missile, E3), Ashigaru-Teppō (missile, E3), Sōhei (spear, E2), berittener Samurai (cav, E2), Joseon-Bogen (missile), Schildkrötenschiff (nur Flotte, falls es Schiffstypen gibt), Mongolischer Bogenreiter und Panzerreiter, Khmer-Krieger, Malaiischer Krieger, Majapahit-Speer.

### 1.8 Tagesplan Asien
1) THEATERS, thOfLL und POLYS ergänzen, 20 China-Provinzen anlegen und die Karte im Spiel prüfen. → 2) Korea, Japan, Mongolei und Südostasien eintragen, dazu ADJ/LAND_LINKS. → 3) Spawns und PEOPLE, KI-Test über 50 Runden. → 4) Mandat. → 5) Tribut. → 6) Daimyō (eventuell erst übermorgen).

---

## 2. Amerika vor 1492 (Aktivierung ab Epoche 0)

### 2.1 Technik
- `THEATERS[am].ep` von 3 auf **0** setzen. Die Startnachricht „Neue Welt über Seewege erreichbar“ in Z. 5036 an `ep>=3` koppeln, sonst erscheint sie falsch.
- **Kontaktsperre**: Vor Epoche 3 keine Seeverbindung zwischen Alter Welt und Amerika, also Häfen bzw. Seewege mit `ep<3` für den Ozean sperren. Ausnahme: Wikinger nach Vinland in Epoche 2, nur Neufundland.
- `indGunRound` (Musketen der Indigenen) bleibt ab Epoche 3 und braucht keine Änderung.
- Provinznamen je Epoche: Neues optionales Feld `nm:{0:'…',2:'…'}` in `PROV_DEF`. Die Anzeige nutzt dann `nm[ep()]` als Fallback vor `name`. So heißt `tenochtitlan` in E0/E1 „Teotihuacán“, in E2 „Tula“ und ab E3 „Anáhuac“.

### 2.2 Provinzaktivierung (vorhandene ids, `ep` ändern) und 7 neue Provinzen
- **ep 0**: tenochtitlan (Teotihuacán), oaxaca (Monte Albán), veracruz (Olmeken/El Tajín), yucatan, guatemala (Kaminaljuyú), **peten** NEU „Petén“ Tikal −89.62/17.22, **moche** NEU „Moche“ Huaca del Sol −79.0/−8.13, lima (Pachacámac), collao (Tiwanaku), cusco, cajamarca, quito
- **ep 1**: **calakmul** NEU „Kaan“ Calakmul −89.74/18.1, **wari** NEU „Wari“ Huari −74.2/−13.06, michoacan, nikaragua, panama, kolumbien (Muisca), cartagena, charcas, atacama, santiago, araukanien
- **ep 2**: **cahokia** NEU „Cahokia“ −90.06/38.66 (reg mississippi), **moundville** NEU „Moundville“ −87.63/33.0 (reg mississippi), **tlaxcala** NEU „Tlaxcala“ −98.24/19.32 (reg neuspanien), irokesen, huronen, cherokee, ohio, illinois, louisiana, florida, neumexiko (Chaco/Pueblo), kuba, hispaniola, jamaika, puertorico (Taíno), zacatecas, caracas, tucuman, paraguay, amazonas
- **ep 3** (unverändert, kolonial): alle übrigen (Brasilien-Küste, la_plata-Städte, neufundland, quebec usw.)

### 2.3 Völker je Epoche (Startslots)
- **E0**: `teotihuacan` [tenochtitlan, veracruz] · `zapoteken` [oaxaca] · `maya_k` (Tikal) [peten, guatemala] · `moche` [moche, cajamarca] · `tiwanaku` [collao, charcas] (ab E0/E1 schwach)
- **E1**: `calakmul` (Kaan) [calakmul, yucatan] gegen `tikal` [peten, guatemala] als feste Rivalität mit Kriegsgrund · `wari` [wari, cusco, lima] · `tiwanaku` stärker
- **E2**: `tolteken` [tenochtitlan, zacatecas] · `cahokia` [cahokia, illinois, moundville] · `chimu` [moche, lima] · `haudeno` (vorhanden, früher) [irokesen, huronen] · `taino` [hispaniola, kuba] · `muisca` (vorhanden, früher) [kolumbien] · `mayapan` [yucatan]
- **E3**: wie bisher (azteken, inka, maya, tarasken, muisca, mapuche, haudeno) plus **`tlaxcala`** [tlaxcala] als Erzfeind der Azteken
- **E4**: wie bisher (usa, komantschen)

### 2.4 Kleine Mechaniken
- **Haudenosaunee-Rat**: Fraktion `haudeno` hat ein „Ratsprinzip“. Krieg erklären braucht 2 Runden Vorlauf (Ratsversammlung), dafür Ordnung +2 und Verteidigung +15 % in eigenen Provinzen. Bild `av_ev_rat`.
- **Komantschen-Pferdeherde**: Ab E3 und frühestens ab Jahr 1680 erhalten Prärie-Fraktionen pro gehaltener Grasland-Provinz +1 „Herde“. Herden senken die Kosten für Reiter (−5 % je Herde, maximal −40 %). Bild `av_ev_pferde`. Hinweis: historisch erst nach 1492, deshalb nicht vor E3.
- **Seuchenwelle**: Beim ersten Kontakt mit einer Fraktion der Alten Welt (Nachbarschaft oder Krieg) verliert jede indigene Fraktion 30 bis 50 % der Bevölkerung (`pop`) und Steuer in Nachbarprovinzen. Die Welle breitet sich über 6 bis 10 Runden über ADJ aus. Bilder `am_ev_seuche` (Anden) und `av_ev_seuchenwelle`.
- **Tlaxcala-Bündnis**: Landet in E3 eine europäische Fraktion in Neuspanien, bekommt `tlaxcala` die Option bzw. das KI-Ereignis „Bündnis gegen die Mexica“: Allianz plus 2 Hilfsheere. Bild `av_ev_tlaxcala`.
- **Tikal gegen Calakmul (E1)**: „Sternenkrieg“. Wer die Hauptstadt des Rivalen hält, bekommt +20 % Steuer in allen Maya-Provinzen. Bild `av_ev_tikal`.

---

## 3. Zusätzliche Feature-Ideen (mit Aufwand)
| # | Idee | Kern | Aufwand |
|---|---|---|---|
| 1 | **Kinoszenen mit Standbildern** | Die 66 neuen Bilder `in_<id>_1..3` als langsame Überblendung (Ken-Burns-Zoom) während der TTS-Einleitung. Wechsel nach Satzgrenzen aus `texts.json`. | klein (½ Tag) |
| 2 | **Seidenstraße als Handelsroute** | Eine Handelslinie Chang'an → Turfan → Samarkand → Levante über die Schauplätze hinweg. Gold für jeden, der Teilstücke hält. Überfall-Ereignis `as_ev_ueberfall` gibt es schon. | mittel (1 Tag) |
| 3 | **Monsun-Handel** | In Ostafrika, Indien und Ostasien bewegen sich Flotten im Sommer schneller nach Osten und im Winter nach Westen. Malakka als Knoten mit Zollbonus. | mittel |
| 4 | **Familienchronik mit Nürnberg- und Berlin-Bezug** | Kleine Ereigniskette „Reichsstadt“: Kaiserburg-Hoftag, Dürer-Werkstatt (+Kultur), Hugenotten-Ankunft (+Handwerk und Bevölkerung in Brandenburg), Napoleon 1806. Bilder sind schon in der Liste. | klein bis mittel |
| 5 | **Habescha-Ereigniskette** | Für Aksum/Abessinien: Kaffeezeremonie (Ordnung), Timkat (Religion), Bahr Negash (Küstenstatthalter mit eigener Treue, ähnlich Daimyō), Zemene Mesafint (Fürstenzeit als Zerfallsphase). Bilder sind in der Liste. | mittel |
| 6 | **Dynastiewechsel generisch** | Der Mechanismus aus dem Mandat (Halter-Wert, Zerfall, Rebellen) wird generalisiert und für Rom (Soldatenkaiser), das Kalifat und das Mogulreich wiederverwendet. | mittel bis groß |
| 7 | **Schauplatz-Übersichtskarte** | Mini-Weltkarte als Navigation zwischen den 5 Schauplätzen mit Fraktionsfarben, statt nur `#thSel`. | klein |
| 8 | **Gelehrte und Erfindungen wandern** | Papier, Kompass und Schießpulver breiten sich über Handels- und Tributverbindungen aus Ostasien nach Westen aus und schalten dort Techniken früher frei. | mittel |

## 4. Risiken und Prüfpunkte
- RAM: Ein fünfter Schauplatz bringt zusätzliche Textur (`tx`, `hx`) und Bäume. Werte klein halten und die Texturen nur beim ersten Öffnen des Schauplatzes erzeugen (lazy), falls möglich.
- `thOfLL` wird überall genutzt (Klima `aridAt`/`tropAt` haben eigene Zweige je Schauplatz). Für Ostasien braucht es einen eigenen Zweig: Gobi und Taklamakan trocken, Südostasien tropisch.
- Szenarien (`SCEN`, z. B. kastilien, cuauhtemoc, pachacutec) setzen voraus, dass Amerika erst ab E3 aktiv ist. Wenn sich `ep` ändert, die Szenarien mit `own`/`reveal` testen.
- Speicherstände: Neue Provinzen verschieben die Indizes von `S.prov` nicht, solange sie **am Ende** von `PROV_DEF` angehängt werden. Das ist Pflicht, sonst passen alte Spielstände nicht mehr.
