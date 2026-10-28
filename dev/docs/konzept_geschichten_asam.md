# Konzept: Neue Geschichten für Asien und Amerika

Stand: v129 (`/home/claude/imperium.html`). Nur gelesen, kein Code geändert.

**Methode:**
- **Daten:** Provinz-IDs, Nachbarschaften und Besitzer stammen aus dem laufenden Spiel. Für die Hochmittelalter-Welt gilt der Stand von 922, für die Frühe Neuzeit der von 1510.
- **Entfernungen:** Ich habe sie mit einer Breitensuche (BFS) über die tatsächlichen Nachbarschaften (`ADJ`) berechnet.
- **Rundenbedarf:** Ich habe ihn nach derselben Formel geschätzt, die `scenNeed` zur Fristverlängerung benutzt:
  - Eroberung: größte Entfernung × 2 + Ziele × 3 + 3
  - Schlachten: 4 + 4 × Anzahl
  - Bau: 10
  - Entscheidung: 3
  - `holdfor`: n + Weg
- **Hilfsdaten:**
  - `scratchpad/kgas/data.json`: Provinzen und Regionen
  - `scratchpad/kgas/data2.json`: Nachbarschaften und Besitzer, Epoche 2
  - `scratchpad/kgas/data3.json`: Nachbarschaften und Besitzer, Epoche 3

---

## 1. Ist-Stand

### 1.1 Aufbau einer Geschichte (`SCEN`)

Die Geschichten stehen in `const SCEN={caesar…}` und in drei weiteren `Object.assign(SCEN,{…})`-Blöcken. Es sind 24 Geschichten.

**Kopf:** `n`, `sub`, `ep`, `year`, `ypt` (Jahre je Runde), `slot`, `people`, `turns` (Gesamtfrist), `img`, `desc`, `win`, `lose`, `feats`, optional `req` und `bonus` (Freischaltung als Bonus-Geschichte, z. B. Cuauhtémoc braucht Kastilien und Pachacútec), `startGold`, `house`, `cul`.

**Welt:**
- `own`: Fraktionsslot → Provinz-IDs.
- `peopleOf`: Slot → Volk. So wird ein beliebiger Fraktionsschlüssel umbenannt, zum Beispiel `samniten` → `chanka` bei Pachacútec.
- `armies`: mit `hero` (genau einer), `gen` und Einheiten `[rolle, variante]`.
- `allies`, `wars`, `cap` (Hauptstadt), `reveal` (Regionen), `names` (Provinz- und Stadtnamen), `rules` (z. B. `senat`, `wanderhof`).

**Ablauf `chapter`:**
- `txt` ist das Intro.
- `steps[]` sind die Akte, je mit `t`, `txt`, optional `vo` (Sprechertext ohne Spielanweisung), `g` (Ziel), `rew` und `choice`.
- `end` ist der Abschluss mit drei Vermächtnis-Optionen.
- `hooks{i:f=>…}` feuern beim Eintritt in Akt i. Typisch sind Kriegserklärungen.
- `gold:f=>…` ist die Bedingung für die Goldmedaille.

**Ziele (`stProg`/`stGoalTxt`):**
- `hold`, `any:[ids,n]`, `build:[bau,stufe,prov]`, `wins:n`, `trade:n`, `gold:n`, `region`
- `cond` aus `SC_COND`: `bau`, `beute`, `choice`, `dort` (Heer steht in Provinz X), `erbe`, `fakt` (Faktorei), `gel`, `hadsch`, `holdfor` (n Runden halten), `pass`, `ruhm` sowie Sonderfälle (`zama`, `rubikon` …).
- **Lücke:** Es gibt kein Ziel für Seesiege. `navalBattle` zählt nicht in `stat(…,'win')`, und `stW` liest nur `win` und `defwin`. Es gibt auch kein Ziel „Flotte liegt vor Hafen X“ und keines „n Verbündete“.

**Fristen:**
- `turns` ist die Gesamtfrist. Neu ist `scenStepTime`: Beim Eintritt in jeden Akt schätzt `scenNeed` den Bedarf. Reicht die Restfrist nicht, steigt `Z.ext`, und das Protokoll meldet es.
- Silber gibt es, wenn die Geschichte innerhalb von 80 % der ursprünglichen Frist geschafft ist.
- Bronze gibt es sonst. Gold gibt es über `D.gold`.

**Held:** Er stirbt nur in der Schlacht (`heroFell` in `applyLoss`). Verschwindet sein Heer anders, übernimmt er ein anderes. Ohne Heer ist die Geschichte verloren.

**Hauptstadt:** Geht sie verloren, bleiben 3 Runden zum Zurückerobern, nach einem Aufstand 5.

**Sauberer Start:** `cleanStart(f)` setzt den Start eigens für die Geschichte auf. `HIST_PORT` gibt historischen Hafenprovinzen von Anfang an einen Hafen.

**Vertonung:**
- Pakete `audio/x_<id>.json` mit den Schlüsseln `<id>_intro`, `<id>_k1…kN` und `<id>_ende`.
- `X_PACKS` listet die vorhandenen Pakete. Die Zuordnung kann gebündelt werden, so laufen `nuernberg` und `berlin` beide über `x_de`.
- Sprecher ist XTTS „Damien Black“ auf dem PC.

**Standbilder:**
- `IN_MAP` ordnet Geschichte → Bildpaket zu (`in_a`, `in_m`, `in_n1`, `in_n2`). Je Geschichte gibt es 4 Bilder `in_<id>_1…4` für das Intro.
- Optional zeigt `CINE_EXTRA` je Akt ein Ereignisbild, zum Beispiel `hist_alesia`.

**Freischaltung:**
- Das Startmenü sortiert nach `year`.
- Ist `req` nicht erfüllt, ist die Karte gesperrt und als „Bonus-Geschichte“ gekennzeichnet.
- Medaillen werden in `imperium.scenWins` gespeichert und über die Cloud abgeglichen.

### 1.2 Volksgeschichten (`STORY`)

`STORY` hat Einträge je Volk und Epoche. Die Völker sind: rom, samniten, syrakus, karthago, massilia, arverner, epirus, makedonien, athen, odrysen, keltiberer, seleukiden, ptolemaeer, aksum, zagwe, medri_bahri, aethiopien.

**Für Asien und Amerika gibt es keine eigene Volksgeschichte.** Dort greift `stGeneric`.

### 1.3 Vorhandene Geschichten in Asien und Amerika

| Geschichte | Region | Jahr |
|---|---|---|
| Akbar | Indien | 1556 |
| Pachacútec | Anden | 1438 |
| Cuauhtémoc | Mexiko, Bonus | 1519 |
| Kastilien und die Neue Welt | aus europäischer Sicht | 1482 |
| Portugal | Seeweg nach Indien | 1487 |
| Ostindien-Kompanie | aus britischer Sicht | 1757 |
| Die Unabhängigkeit | USA | 1775 |
| Der Mongolensturm | Batu im Westen | 1236 |

**Ostasien (China, Japan, Korea, Mongolei, Südostasien) hat keine einzige Geschichte.** Nordamerika aus indigener Sicht fehlt ebenfalls.

Vorhandene Asien-Mechaniken, die die neuen Geschichten berühren:
- Mandat des Himmels und Tribut
- Shogunat, `jpUnify` ab 1590, Shōgun-Ereignis
- Ereignisse `x_imjin` (1592) und Sekigahara
- Kulturtechniken, zum Beispiel `geobukseon`, `dezimalheer`, `tanegashima`, `blumenkrieg`, `quipu`, `qhapaqnan`, `friedensbund`

### 1.4 Fraktionen, Völker und Provinzen

**Vorhandene Völker (Auswahl, als `peopleOf`-Ziel nutzbar):**
- **Japan:** yamato, heian, emishi, ouchi, hosokawa, hojo_g, shogunat, tokugawa, oda, mori, uesugi, satsuma_h …
- **China:** song, liao, xixia, ming, qing, jurchen, nyuan, uiguren, khalkha, dsungaren …
- **Korea:** goryeo, joseon …
- **Südostasien:** daiviet, champa_k, khmer, pagan, ayutthaya, taungoo, srivijaya, malakka_s, aceh_s, demak, brunei_s …
- **Indien:** mogulreich, vijayanagara, zamorin …
- **Amerika:** azteken, inka, maya, tarasken, muisca, mapuche, irokesen_v/haudeno, komantschen, chanka, colla, chimu, quitu, kastilien …

**Einheiten:**
- Amerika und Steppe haben eigene Varianten: jaguar, adlerkr, atlatl, holkan, tarbog, tlaxcal, inkaschl, inkakeule, orejon, guecha, mapulanz, mapureit, waldkr, comreit, mongbog, mongpanz, chinkat (Belagerungsingenieure).
- Ostasien hat **keine eigenen Varianten**. Es gibt nur die Kulturnamen der Grundrollen, zum Beispiel „Ashigaru-Yari, Samurai, Teppō-Schützen, Berittene Samurai“.

**Provinzen und Nachbarschaften (Auszug, nur was die Vorschläge brauchen):**

| Region | Provinzen (Epoche) | wichtige Nachbarschaften |
|---|---|---|
| Japan | hakata, satsuma, shikoku, chugoku, kinai, owari, hokuriku, kanto, mutsu, ezo (Epoche 3 aktiv) | owari–kinai/hokuriku/kanto; kinai–chugoku/shikoku/hakata; hakata–gyeongju (Korea) |
| Korea | pjongan, hamgyong, hanseong, gongju, gyeongju, jeolla | gyeongju–hakata; pjongan–liaodong |
| Mongolei/Tarim | onon, orchon, selenge, hulunbuir, shangdu, khovd, dsungarei, turfan | onon–orchon/selenge/hulunbuir/shangdu; orchon–hexi/turfan/khovd; shangdu–zhili/shanxi/liaodong |
| China | zhili, shandong, henan, shanxi, guanzhong, hexi, amdo, sichuan, yunnan, hubei, jiangnan, zhejiang, jiangxi, hunan, fujian, lingnan, guangxi, formosa | Kette jiangnan–zhejiang–fujian–lingnan; hubei–henan/jiangnan |
| Südostasien | daiviet, champa, angkor, ayutthaya, sukhothai, lanxang, pagan, pegu, malakka, srivijaya, aceh, sunda, majapahit, brunei, luzon, molukken | ayutthaya–sukhothai/angkor; sukhothai–pegu |
| Indien | ceylon–madurai/malabar. **Kein Landweg nach Südostasien.** | nur über See |
| Mexiko | tenochtitlan–veracruz/oaxaca/michoacan/zacatecas; oaxaca–guatemala; veracruz–yucatan/kuba | |
| Anden | quito–cajamarca/kolumbien; cajamarca–cusco/lima; cusco–collao; collao–charcas; lima–panama | |
| Nordost | irokesen–huronen/neuengland/newyork; neuengland–quebec/akadien | montreal, ohio und pennsylvanien erst ab Epoche 4 |

**Grenzen der Karte:**
- Das Hochtal von Mexiko ist eine einzige Provinz (Anáhuac). Tlaxcala, Texcoco und Azcapotzalco lassen sich nicht als eigene Provinzen darstellen.
- Die Fünf Nationen der Haudenosaunee liegen fast ganz in einer Provinz (`irokesen`).
- Owari-Mino ist eine Provinz.

---

## 2. Vorschläge (8 Geschichten + 1 Reserve)

Alle Geschichten folgen bewusst dem Muster der bestehenden:
- 6–8 Akte
- Jedes Fernziel wird im Text vorher angekündigt.
- Kein Sprung in eine ferne Region ohne Vorlauf.
- Akte bauen räumlich aufeinander auf. Die Entfernung zum nächsten Ziel ist höchstens 2, wo möglich.

**Gewalt:**
- Kriege, Hinrichtungen, Opferkulte oder Massaker werden sachlich und knapp im Rückblick erwähnt, wo sie historisch zentral sind.
- Sie werden nie zur Spielmechanik mit Belohnung.

**Sprechertexte:** Akt-Texte ohne Spielanweisung. Wo eine Anweisung nötig ist, steht sie im `txt`, der vertonte Text getrennt im `vo`.

**Bildstil für alle Standbilder:**
- Englisch, wie bisherige Aufträge.
- Am Ende jedes Prompts: „Oil painting in the style of a 19th-century academic history painting, painterly brushstrokes, muted earthy palette, dramatic natural light, wide cinematic 16:9 landscape format, no text, no lettering, no logos, no flags with real symbols, no modern objects.“

---

### G1 · Oda Nobunaga – „Tenka fubu“ (Japan, 1560–1582)

**Rahmen:** Japan in der Zeit der streitenden Reiche (Sengoku). Das Haus Oda beherrscht nur Owari. 1560 marschiert Imagawa Yoshimoto mit einem riesigen Heer nach Westen in Richtung Kyōto. Nobunaga schlägt ihn bei Okehazama. Danach folgen:
- 1567 Mino mit dem Siegel „Tenka fubu“ (das Reich unter Waffen)
- 1568 der Einzug in Kyōto mit Ashikaga Yoshiaki
- der Kampf gegen Asakura, Azai und die Ikkō-ikki
- 1575 Nagashino mit den Salven der Teppō
- ab 1576 die Burg Azuchi
- ab 1577 der Feldzug gegen die Mōri durch Hashiba Hideyoshi
- 1582 Honnō-ji, wo Nobunaga durch Verrat stirbt. Das kommt nur im Schlusstext vor, nicht als Mechanik.

**Kopf:** `id:'nobunaga'`, `ep:3`, `year:1560`, `ypt:0.3`, `turns:75`, `slot:'yamato'`, `people:'oda'`, `cul:'japanisch'`, `cap:'owari'`, `img:'as_burg'` (falls vorhanden; sonst neu).

**Welt (`own`/`peopleOf`):**

| Slot → Volk | Provinzen |
|---|---|
| yamato → oda | owari |
| samniten → imagawa (neu) | kanto |
| tarent → asakura (neu) | hokuriku |
| epirus → miyoshi (neu) | kinai |
| dakier → mori (vorhanden) | chugoku, hakata |
| ptolemaeer → chosokabe (neu) oder frei | shikoku, satsuma |
| frei | mutsu, ezo |

**Heere:**
- `{f:'yamato',p:'owari',hero:'Oda Nobunaga',u:[['sword'],['sword'],['spear'],['spear'],['missile'],['cav']]}`
- `{f:'yamato',p:'owari',gen:'Shibata Katsuie',u:[['spear'],['sword'],['missile']]}`
- `{f:'samniten',p:'kanto',gen:'Imagawa Yoshimoto',u:[['sword'],['sword'],['sword'],['spear'],['spear'],['spear'],['cav'],['cav'],['missile']]}`: Imagawa ist sehr stark, damit Akt I einen Hinterhalt braucht.
- `{f:'tarent',p:'hokuriku',gen:'Asakura Yoshikage',u:[…5]}`
- `{f:'epirus',p:'kinai',gen:'Miyoshi Nagayoshi',u:[…5]}`

**Krieg und Regeln:**
- `wars:[['yamato','samniten']]`
- `rules:{noJpUnify:true}`: Das ist neu. `jpUnify` und das automatische Shōgun-Ereignis werden während der Geschichte unterdrückt.

**Akte:**

| # | Titel | Ziel | Schätzung | Vorankündigung |
|---|---|---|---|---|
| I | Okehazama | `wins:1`. Hook 0: Unwetter-Bonus Angriff +15 % für 2 Runden | 8 | Intro nennt Imagawas Marsch |
| II | Mino und das Siegel | `build:['walls',2,'owari']` (Gifu) | 10 | Text nennt Kyōto als Ziel nach dem Ausbau |
| III | Der Weg nach Kyōto | `hold:['kinai']`, Hook: Krieg mit miyoshi | 8 | im Vorakt angekündigt |
| IV | Asakura und Azai | `hold:['hokuriku']`, Hook: Krieg asakura | 8 | Akt III endet mit dem Verrat Azais |
| V | Ishiyama Hongan-ji | `cond:'holdfor',ids:['kinai'],n:8`. Hook: zwei Ikkō-Heere entstehen in kinai bzw. angrenzend | 9 | |
| VI | Nagashino | `wins:2`. Hook: Krieg mit takeda (Slot samniten wird zu takeda, Heer in kanto) | 12 | Akt V nennt Takeda Shingen im Osten |
| VII | Azuchi | `build:['walls',3,'kinai']` + `choice` (Nanban-Handel) | 10 | |
| VIII | Der Westen | `hold:['chugoku']`, Hook: Krieg mōri | 8 | Akt VII nennt Hideyoshi und die Mōri |

- **Summe:** etwa 73 Runden, Frist 75 plus automatische Verlängerung.
- **Gold:** `['kanto','chugoku','shikoku'].every(own)`, also über das Historische hinaus.

**Entscheidungen (`choice`):**
- **Akt III, Ashikaga Yoshiaki:**
  - „Den Shōgun einsetzen“: Ordnung +2 für 30 Runden, Ruhm +10.
  - „Selbst regieren“: Steuern +10 % für 30 Runden, Beziehung −10 zu allen Daimyō.
- **Akt VII, Nanban-Händler:**
  - „Portugiesen und Missionare zulassen“: Technik `tanegashima` sofort, Forschung +10 %.
  - „Nur Handel, keine Mission“: Steuern +8 %.
- **Akt II, `rakuichi`:** Freie Märkte (Rakuichi-rakuza) als Belohnung, Steuern +10 %.

**Ende:** Honnō-ji im Schlusstext. Vermächtnis-Optionen:
- „Die Burg Azuchi“: Ordnung +2.
- „Die Teppō-Truppen“: Angriff +10 %.
- „Die freien Märkte“: Steuern +15 %.

**Intro (vertont, etwa 80 s):**
> Owari, im fünften Monat des Jahres 1560. Seit fast hundert Jahren zerfällt Japan in Fürstentümer, die einander belauern. Der Shōgun in Kyōto ist ein Schatten, der Kaiser ein Name auf Urkunden. Oda Nobunaga ist sechsundzwanzig Jahre alt. Man nennt ihn den Narren von Owari, weil er sich kleidet wie ein Stallknecht und mit Bauernsöhnen ringt. Nun zieht Imagawa Yoshimoto, Herr dreier Provinzen, mit einem Heer von zwanzigtausend Mann nach Westen. Sein Weg nach Kyōto führt mitten durch Owari. Nobunaga hat kaum dreitausend Krieger. Seine Berater raten zur Unterwerfung. Nobunaga tanzt in der Nacht das Atsumori, ein Lied über die Kürze des Lebens, isst stehend und reitet hinaus. Am Himmel ziehen Gewitterwolken auf.

**Akttexte (vertont, `vo`):**
1. *Okehazama:* Imagawas Heer rastet in einer engen Schlucht und feiert die ersten Siege. Ein schwerer Regen fällt, die Wachen suchen Schutz unter den Bäumen. Nobunaga führt seine Männer über einen Waldweg in den Rücken des Lagers. Ein einziger Angriff kann alles entscheiden.
2. *Mino und das Siegel:* Nach sieben Jahren fällt die Burg Inabayama in Mino. Nobunaga nennt sie Gifu und lässt sich ein neues Siegel schneiden: Tenka fubu, das Reich unter Waffen. Sein Blick geht nach Westen, nach Kyōto, wo ein vertriebener Erbe der Shōgune um Hilfe bittet.
3. *Der Weg nach Kyōto:* Ashikaga Yoshiaki, Bruder des ermordeten Shōgun, sucht einen Beschützer. Mit ihm zieht Nobunaga in die Hauptstadt. Die Miyoshi, die Kyōto beherrschen, werden nicht kampflos weichen. Wer die Hauptstadt hält, spricht im Namen des Reiches.
4. *Asakura und Azai:* Der Herr von Echizen, Asakura Yoshikage, weigert sich, nach Kyōto zu kommen. Nobunagas Schwager Azai Nagamasa stellt sich auf seine Seite. Am Fluss Ane stehen die Heere einander gegenüber. Der Norden muss fallen, bevor sich weitere Feinde verbünden.
5. *Ishiyama Hongan-ji:* In der Tempelfestung von Ishiyama sammeln sich die Anhänger der Reinen-Land-Schule, Bauern, Mönche und Samurai. Sie nennen sich Ikkō-ikki, die Bünde des einen Herzens. Zehn Jahre lang halten sie stand. Im Osten aber regt sich ein gefährlicherer Gegner: Takeda Shingen, der Tiger von Kai.
6. *Nagashino:* Takeda Katsuyori, Shingens Sohn, führt die berühmteste Reiterei Japans gegen die Burg Nagashino. Nobunaga lässt Holzzäune errichten und stellt dreitausend Teppō-Schützen in Reihen dahinter. Eine Reihe schießt, während die nächste lädt.
7. *Azuchi:* Am Biwa-See lässt Nobunaga eine Burg errichten, wie Japan sie noch nicht gesehen hat. Sieben Stockwerke, golden und rot bemalt, mit Sälen voller Malereien. Portugiesische Jesuiten und Händler kommen an seinen Hof. Im Westen aber warten die Mōri, Herren der Inlandsee.
8. *Der Westen:* Hashiba Hideyoshi, einst Sandalenträger, nun Feldherr, belagert die Burgen der Mōri. Er bittet um Verstärkung. Nobunaga bricht mit kleiner Begleitung auf und übernachtet im Tempel Honnō-ji in Kyōto.

**Schlusstext (vertont):**
> In der Nacht zum zweiten Tag des sechsten Monats 1582 umstellt Akechi Mitsuhide, einer seiner eigenen Feldherren, den Tempel Honnō-ji. Nobunaga stirbt in den Flammen. Doch sein Werk überdauert ihn: Hideyoshi und später Tokugawa Ieyasu vollenden die Einigung Japans. Ein Sprichwort sagt: Nobunaga mischte den Reiskuchen, Hideyoshi buk ihn, und Ieyasu aß ihn. Was soll von Nobunaga bleiben?

**Vertonung:** intro, k1–k8, ende, also 10 Texte.

**Standbilder (FLUX):**
1. `in_nobunaga_1`: „A young Japanese daimyo in plain riding clothes performing a slow solemn dance by lantern light in a castle hall at night, retainers kneeling, Sengoku period“
2. `in_nobunaga_2`: „Samurai attacking an army camp in a narrow wooded gorge during a heavy thunderstorm, tents and banners in rain, Sengoku period Japan“
3. `in_nobunaga_3`: „Rows of Japanese ashigaru arquebusiers behind wooden palisades firing volleys at charging cavalry across a river plain, smoke, 1575“
4. `in_nobunaga_4`: „A seven-storied Japanese castle keep with gold and red painted roofs above Lake Biwa at dawn, Portuguese visitors approaching, 1579“

Optional für `CINE_EXTRA`: `hist_nagashino`.

**Benötigt neu:**
- Völker: imagawa, asakura, miyoshi, takeda, ikko (Ikkō-ikki), chosokabe. Jeweils Name, Farbe, Wappen-Grundform (`HER`) und Beschreibung.
- Regel `noJpUnify`.
- Hook-Helfer „Slot wechselt Volk“, zum Beispiel samniten von imagawa zu takeda, oder einfach ein zweiter Slot.

---

### G2 · Dschingis Khan – „Der Bund der Filzzelte“ (Mongolei, 1202–1227)

**Rahmen:** Temüjin sammelt nach Jahren der Not die Steppenvölker. Die Stationen:
- 1202 die Tataren
- 1203 der Bruch mit Toghrul (Ong Khan) der Kereit
- 1204 die Naiman am Altai
- 1206 der Kurultai am Onon und der Titel Činggis Qan
- 1209 die Unterwerfung der Tanguten (Xixia) und der freiwillige Anschluss der Uiguren
- 1211–1215 der Feldzug gegen die Jin, Zhongdu fällt 1215

Er stirbt 1227 im Land der Tanguten. Choresmien ist auf der Karte nicht über Land erreichbar und kommt deshalb nur im Schlusstext vor.

**Kopf:** `id:'temujin'`, `ep:2`, `year:1202`, `ypt:0.36`, `turns:70`, `slot:'nyuan'` (oder ein freier Steppen-Slot), `people:'mongolen_d'` (neu: „Mongolen“), `cul:'steppe'`, `cap:'onon'`.

**Welt:**

| Slot → Volk | Provinzen |
|---|---|
| Spieler | onon |
| kereit (neu, verbündet) | orchon |
| merkit (neu) | selenge |
| tataren (neu, Krieg) | hulunbuir |
| naiman (neu) | khovd, dsungarei |
| ongud (neu, neutral) | shangdu |
| xixia (vorhanden) | hexi, amdo |
| uiguren (vorhanden) | turfan |
| jin_j (neu, „Jin-Dynastie“) | zhili, shanxi, liaodong, mandschurei, shandong, henan |

**Heere:**
- Held „Temüjin“: mongbog ×3, mongpanz, cav, spear.
- gen „Bo'orchu“: mongbog ×2, cav.
- gen „Jamukha“ bei den Naiman.
- gen „Toghrul“ bei den Kereit, zunächst verbündet.
- Jin: schwere Garnisonen und 2 große Heere.

**Akte:**

| # | Titel | Ziel | Schätzung |
|---|---|---|---|
| I | Die Tataren | `hold:['hulunbuir']` | 8 |
| II | Ong Khan | Hook: Bündnis mit kereit bricht, Krieg; `hold:['orchon']` | 8 |
| III | Merkiten und Naiman | `any:[['selenge','khovd'],2]` | 11 |
| IV | Der Kurultai am Onon | `cond:'choice'`; Held heißt danach „Dschingis Khan“, Technik `dezimalheer` | 3 |
| V | Die Tanguten | `hold:['hexi']` oder Entscheidung „Tribut annehmen“ (xixia wird Vasall) | 8 |
| VI | Die Uiguren | `choice`: Uiguren nehmen den Bund an (turfan kommt hinzu, Schreiber: Forschung +15 %, Schrift) | 3 |
| VII | Zhongdu | Hook: ongud schließt sich an (shangdu übergeben); `any:[['zhili','shanxi','liaodong'],2]`; Einheit chinkat ab hier | 13 |

- **Summe:** etwa 54 Runden plus Reserve, Frist 70.
- **Gold:** zhili, liaodong und hexi halten und dabei kein Bündnisbruch des eigenen Lagers.

**Entscheidungen im Kurultai (Akt IV):**
- „Das Gesetz Yassa“: Ordnung +2 für 40 Runden.
- „Die Garde der Keshig“: Angriff +8 %.
- „Gerechte Teilung der Beute“: Steuern +10 %.

**Ende:** Choresmien (Otrar 1218), der Zug nach Westen und sein Tod 1227 im Schlusstext. Optional schaltet G2 „Der Mongolensturm“ frei (`req`) oder bekommt einen Hinweis darauf.

**Intro (vertont):**
> Die Steppe zwischen Onon und Kerulen, im Jahr 1202. Hier gibt es keine Städte, nur Weiden, Filzzelte und Herden, die mit den Jahreszeiten ziehen. Die Völker der Steppe, Mongolen, Tataren, Kereit, Merkiten und Naiman, rauben einander Pferde, Frauen und Weidegründe. Temüjin ist der Sohn eines vergifteten Häuptlings. Als Kind wurde er mit seiner Mutter verstoßen, als junger Mann gefangen und mit einem hölzernen Kragen um den Hals durch die Lager geführt. Er ist entkommen. Nun hat er Gefährten, die ihm bis in den Tod folgen würden, und einen mächtigen Verbündeten, Toghrul, den Khan der Kereit. Temüjin verteilt die Beute nach Verdienst, nicht nach Herkunft. Das gefällt den einfachen Kriegern und erschreckt die alten Familien.

**Akttexte (vertont, Kurzfassung):**
1. Tataren: Sie haben seinen Vater vergiftet und beherrschen die Weiden im Osten. Temüjin verbietet seinen Kriegern, vor dem Ende der Schlacht zu plündern.
2. Ong Khan: Toghrul fürchtet den Aufstieg seines Ziehsohns. Eine Hochzeit wird zur Falle. Die Kereit herrschen im Tal des Orchon, wo einst Karakorum entstehen wird.
3. Merkiten und Naiman: Im Norden die Merkiten, die einst Temüjins Frau Börte raubten. Im Westen am Altai die Naiman, bei denen sein Blutsbruder Jamukha Zuflucht sucht.
4. Kurultai: Am Quellgebiet des Onon versammeln sich alle Völker der Steppe. Sie rufen Temüjin zum Činggis Qan aus. Das Heer wird in Zehner, Hunderter, Tausender und Zehntausender geteilt.
5. Tanguten: Südlich der Gobi, im Hexi-Korridor, liegt das Reich der Westlichen Xia mit seinen Städten und Kanälen. Es ist der Schlüssel zu den Straßen nach China.
6. Uiguren: Der Idiqut von Qocho schickt Gesandte. Die Uiguren schreiben mit einer Schrift, die die Mongolen übernehmen werden.
7. Zhongdu: Hinter der Großen Mauer herrscht die Jin-Dynastie über Nordchina. Die Önggüt an der Mauer öffnen die Pässe. Zhongdu hat Mauern, die kein Reiter überspringen kann.

**Schlusstext (Kern):**
> 1215 fällt Zhongdu, das spätere Peking. Vier Jahre später zieht Dschingis Khan nach Westen gegen das Reich Choresmien. Er stirbt 1227, während seine Heere die Tanguten belagern. Sein Reich wird das größte zusammenhängende Landreich der Geschichte. Die Steppenstraßen werden sicher genug, dass Kaufleute, Mönche und Gesandte von Venedig bis Peking reisen können, um den Preis vieler zerstörter Städte.

**Vertonung:** intro, k1–k7, ende, also 9 Texte.

**Standbilder:**
1. „A vast gathering of Mongol felt tents and horsemen on a green steppe river valley under a huge sky, white nine-tailed standard raised, 1206“
2. „A young Mongol leader in a fur-trimmed deel addressing loyal companions around a fire inside a yurt“
3. „Mongol horse archers riding across the Gobi toward a walled Tangut city with Buddhist pagodas“
4. „Mongol army at the foot of a massive Chinese city wall with siege engines and catapults, Jin dynasty, 1215“

**Benötigt neu:** Völker mongolen_d, kereit, merkit, tataren, naiman, ongud, jin_j. Hook „Bündnis bricht“: `breakAlliance` plus `declareWar`. Hook „Provinz übergeben“.

---

### G3 · Kublai Khan – „Der Große Khan in Dadu“ (China, 1260–1281)

Das ist eine Alternative oder Fortsetzung zu G2.

**Rahmen:** 1260 ruft sich Kublai in Kaiping (Shangdu) zum Großkhan aus, Ariq Böke in Karakorum ebenso. Danach folgen:
- 1264 Sieg über Ariq Böke
- 1267 Bau von Dadu (Khanbaliq, heute Peking)
- 1271 Name Yuan
- 1268–1273 Belagerung von Xiangyang mit persischen Gegengewichtsschleudern
- 1276 Fall von Lin'an (Hangzhou)
- 1279 Seeschlacht von Yamen, Ende der Song
- 1274 und 1281 scheitern Flotten gegen Japan an den Stürmen (Kamikaze)

**Kopf:** `id:'kublai'`, `ep:2`, `year:1260`, `ypt:0.3`, `turns:70`, `people:'yuan'` (neu), `cap:'shangdu'`.

**Welt:**

| Volk | Provinzen |
|---|---|
| Spieler | shangdu, zhili, shanxi, shandong, henan, guanzhong |
| ariqboeke (neu) | orchon, selenge, khovd |
| song | hubei, jiangnan, zhejiang, jiangxi, hunan, fujian, lingnan, guangxi, sichuan |
| goryeo | Vasall |
| kamakura (neu) | Japan |
| daiviet, pagan | neutral |

**Akte:**

| # | Titel | Ziel | Schätzung |
|---|---|---|---|
| I | Zwei Großkhane | `hold:['orchon']` | 8 |
| II | Dadu | `build:['walls',2,'zhili']` + `choice` („Yuan: chinesische Ordnung“: Ordnung +2, Steuern +10 % ODER „Steppe“: Angriff +10 %) | 10 |
| III | Xiangyang | `hold:['hubei']`; Hook: 2 chinkat-Einheiten „Huihui-Pao“ | 8 |
| IV | Lin'an | `hold:['jiangnan','zhejiang']` | 13 |
| V | Yamen | `any:[['fujian','lingnan','jiangxi'],2]` | 13 |
| VI | Der Götterwind | `choice`: „Flotte nach Japan“ (danach Sturm-Ereignis: Flotte verloren, Ruhm +15) oder „Gesandtschaft und Handel“ (Handel +2) | 3 |

- **Summe:** etwa 55 Runden, Frist 70.
- **Gold:** lingnan, sichuan und yunnan halten.

**Intro (Kern):**
> Kaiping, Frühjahr 1260. Möngke, der Großkhan der Mongolen, ist vor den Mauern einer chinesischen Festung gestorben. Seine Brüder streiten um das Erbe. In Karakorum, der alten Hauptstadt in der Steppe, lässt sich Ariq Böke zum Großkhan ausrufen. Hier, am Rand der chinesischen Ebene, tut es Kublai. Er hat chinesische Berater, liest die Klassiker in Übersetzung und weiß: Man kann ein Reich vom Pferd aus erobern, aber nicht vom Pferd aus regieren. Im Süden wartet das Reich der Song, das reichste Land der Welt, mit Städten von einer Million Menschen.

**Vertonung:** intro, k1–k6, ende, also 8 Texte.

**Standbilder:**
1. „Kublai Khan enthroned in a Chinese-Mongol palace hall with officials of many peoples“
2. „Giant counterweight trebuchets bombarding a Chinese river fortress, 1273“
3. „Mongol and Chinese fleet in a stormy sea off a rocky Japanese coast, ships breaking apart“
4. „Busy new imperial capital with straight avenues and drum tower, camel caravans entering“

**Benötigt neu:** Völker yuan, ariqboeke, kamakura. Die Sturm-Entscheidung braucht nur bestehende Werte.

---

### G4 · Zheng He – „Die Schatzflotte“ (Ming, 1405–1433)

**Rahmen:** Kaiser Yongle schickt den Eunuchen-Admiral Zheng He mit über 60 großen Schatzschiffen und fast 28.000 Mann auf Fahrten durch den Indischen Ozean. Die sieben Fahrten führen über Champa, Java, Palembang, Malakka, Ceylon, Calicut und Hormus bis nach Aden und Malindi. Unterwegs gibt es drei Gefechte:
- 1407 gegen den Seeräuber Chen Zuyi bei Palembang
- 1411 gegen Alakeshvara auf Ceylon
- 1415 auf Sumatra

1414 bringt die Flotte eine Giraffe aus Malindi, die man in China als Qilin feiert. Nach Zheng Hes Tod 1433 endet alles: Die Flotten verfallen, Seehandel wird verboten (Haijin).

**Kopf:** `id:'zhenghe'`, `ep:3`, `year:1405`, `ypt:0.4`, `turns:75`, `people:'ming'`, `cap:'jiangnan'` (Nanjing).

**Mechanik-Kern (neu, Aufwand M):**
- `cond:'anlegen',ids:[…],n`: Eine eigene Flotte liegt auf dem Seefeld der Provinz (`fleetSeaPos`/Abstand < 3). Das wird je Provinz einmal gezählt und als Flag gespeichert.
- `cond:'schiffe',n`: Die Summe aus Schiffszahl und Flottenstärke erreicht n.
- **Kein Erobern:** Ziele sind Anlegen, Faktoreien (`fakt`, vorhanden) und Handelsabkommen (`trade`, vorhanden). Kämpfe gibt es nur bei Palembang und auf Ceylon.

**Welt:**

| Volk | Provinzen |
|---|---|
| Spieler (ming) | zhili, shandong, henan, jiangnan, zhejiang, fujian, lingnan, jiangxi, hubei |
| chen_zuyi (neu, Seeräuber) | srivijaya |
| kotte (neu) | ceylon |
| malakka_s | malakka |
| champa_k | champa |
| majapahit (neu) | majapahit, sunda |
| zamorin | malabar |
| hormus_k (neu) | hormus |
| Afrika | wie Weltdaten |

**Akte:**

| # | Titel | Ziel | Schätzung |
|---|---|---|---|
| I | Die Werften von Longjiang | `build:['port',2,'jiangnan']` + `cond:'schiffe'` (4 Flotten) | 12 |
| II | Champa und Java | `anlegen:['champa','majapahit'],2` | 10 |
| III | Palembang | Hook: Seeräuberflotte und -heer; `cond:'dort',ids:['srivijaya']` + `wins:1` | 10 |
| IV | Das Lagerhaus von Malakka | `cond:'fakt',n:1` (Malakka) + `trade:2` | 12 |
| V | Ceylon | Hook: kotte erklärt Krieg; `wins:1` an Land (Heer per Flotte übersetzen) | 10 |
| VI | Calicut und Hormus | `anlegen:['malabar','hormus'],2` | 12 |
| VII | Die Giraffe von Malindi | `anlegen:['malindi','mogadischu'],1` | 10 |

- **Summe:** etwa 76 Runden, Frist 80.
- **Gold:** alle sieben Häfen angelaufen, keine Flotte verloren.

**Entscheidung im Ende (Haijin):**
- „Die Flotten weiterbauen“: Handel +5 je Partner, Gold −.
- „Das Meer schließen“: Ordnung +2, Steuern +10 %.

Das ist sachlich, kein Werturteil.

**Intro (Kern):**
> Nanjing, im Jahr 1405. Kaiser Yongle hat den Thron seinem Neffen entrissen, und die Welt soll erfahren, dass der Himmelssohn wieder mächtig ist. In den Werften am Jangtse liegen Schiffe mit neun Masten, so groß, dass ein Dorf darauf Platz hätte. Ihr Befehlshaber ist Zheng He, ein Muslim aus Yunnan, der als Junge gefangen und als Diener an den Hof gebracht wurde. Er soll keine Länder erobern, sondern Geschenke bringen, Tribut empfangen und Gesandte nach China holen. Die Flotte segelt mit dem Monsun nach Süden.

**Vertonung:** intro, k1–k7, ende, also 9 Texte.

**Standbilder:**
1. „Enormous nine-masted Chinese treasure ships under construction in a riverside shipyard, 1405“
2. „Chinese treasure fleet with red sails arriving at a tropical harbour with stilt houses, Malacca“
3. „Ming envoys presenting silk and porcelain to a South Indian ruler in Calicut“
4. „A giraffe led on board a Chinese ship in an East African port, astonished sailors“

**Benötigt neu:**
- Conds `anlegen` und `schiffe`.
- Völker chen_zuyi, kotte, majapahit, hormus_k.
- Ein Seeräuber-KI-Verhalten: einfache Flotte, die in der Nähe bleibt.
- Die KI muss die Seeroute nicht kennen.

---

### G5 · Yi Sun-sin – „Die Schildkrötenschiffe“ (Korea, 1592–1598)

**Rahmen:** Im Frühjahr 1592 landen japanische Heere unter Toyotomi Hideyoshi bei Busan. Danach:
- Hanseong (Seoul) fällt nach 20 Tagen, Pjöngjang im Sommer.
- Admiral Yi Sun-sin siegt zur See bei Okpo und Hansando und schneidet den Nachschub ab.
- Gerechte Heere (Uibyeong) und die Ming-Truppen unter Li Rusong drängen die Japaner zurück: Pjöngjang 1593, Haengju 1593.
- Nach einer Niederlage unter Won Gyun hat Yi 1597 nur noch 13 Schiffe und siegt damit bei Myeongnyang.
- 1598 fällt er in der Seeschlacht von Noryang.

**Kopf:** `id:'yisunsin'`, `ep:3`, `year:1592`, `ypt:0.1`, `turns:60`, `people:'joseon'`, `cap:'jeolla'`.

**Welt:**

| Volk | Provinzen |
|---|---|
| Spieler (joseon) | jeolla, gongju, pjongan, hamgyong |
| toyotomi (neu) | gyeongju, hanseong, sowie Japan (hakata, kinai …) |
| ming | zhili, liaodong (zunächst neutral, Hook: Bündnis) |

**Held:** siehe Frage F3. Variante A: Yi als Flottenheld (neu). Variante B: Yi führt ein Küstenheer, die Seesiege sind Ziele.

**Mechanik-Kern (neu, Aufwand S–M):**
- `cond:'seesieg',n`: In `navalBattle` neue Statistik `stat(winner,'seewin')`, gezählt ab dem Aktbeginn.
- Optionaler Hook „Flottenverlust“ für Akt V: Die eigenen Flotten werden auf 13 Schiffe reduziert.

**Akte:**

| # | Titel | Ziel | Schätzung |
|---|---|---|---|
| I | Busan fällt | `cond:'holdfor',ids:['jeolla'],n:6` + Technik `geobukseon` geschenkt | 9 |
| II | Okpo und Hansando | `seesieg:2` | 10 |
| III | Die Gerechten Heere | `wins:2` (an Land; Hook: 2 Uibyeong-Einheiten) | 12 |
| IV | Pjöngjang und Haengju | Hook: Ming verbündet, Ming-Heer in liaodong; `hold:['hanseong']` | 8 |
| V | Myeongnyang | Hook: Flottenverlust; `seesieg:1` | 8 |
| VI | Noryang | `hold:['gyeongju']` + `seesieg:1` | 10 |

- **Summe:** etwa 57 Runden, Frist 60.
- **Gold:** Hauptstadt nie verloren und ganz Korea gehalten.

**Ende:** Yis Tod in Noryang im Schlusstext („Sagt nicht, dass ich gefallen bin; der Kampf ist noch nicht vorbei“, sinngemäß überliefert). Vermächtnis:
- „Die Schildkrötenschiffe“: Garnisonen +20 %.
- „Die Gerechten Heere“: Ordnung +2.
- „Das Bündnis mit den Ming“: Beziehung +20 zu Ming.

**Intro (Kern):**
> Jeolla, an der Südwestküste Koreas, im Frühjahr 1592. Seit zweihundert Jahren herrscht Frieden im Königreich Joseon. Gelehrte streiten am Hof über Rangfolgen und Zeremonien, die Festungen verfallen. Nur der Befehlshaber der Flotte von Jeolla, Yi Sun-sin, lässt Kanonen gießen, Seeleute drillen und ein seltsames Schiff bauen: gedeckt wie der Rücken einer Schildkröte, mit Eisenspitzen auf dem Dach und einem Drachenkopf, aus dem Rauch quillt. Am dreizehnten Tag des vierten Monats erscheinen vor Busan über siebenhundert japanische Schiffe.

**Vertonung:** intro, k1–k6, ende, also 8 Texte.

**Standbilder:**
1. „Korean turtle ship with spiked armoured roof and dragon head, oars out, in a coastal strait, 1592“
2. „Large Japanese fleet landing troops at a Korean harbour fortress, smoke“
3. „Korean admiral in Joseon armour on the deck of a panokseon commanding a crescent formation“
4. „Thirteen Korean ships facing a huge fleet in a narrow tidal strait at sunset“

**Benötigt neu:** Cond `seesieg`, Volk toyotomi, Hook „Flottenverlust“, gegebenenfalls einen Flottenhelden (F3).

---

### G6 · Tlacaelel – „Der Dreibund“ (Mexiko, 1440–1487)

**Rahmen:** 1428 stürzen Tenochtitlan, Texcoco und Tlacopan die Herrschaft der Tepaneken und bilden den Dreibund. Der Cihuacoatl Tlacaelel berät vier Herrscher nacheinander: Moctezuma I., Axayácatl, Tízoc und Ahuitzotl. Er formt Staat, Religion und Tributsystem. Die Stationen:
- 1450–1454 die große Hungersnot (Eins Kaninchen)
- 1458 Coixtlahuaca in Oaxaca
- in den 1460ern die Totonaken an der Golfküste
- die verabredeten Blumenkriege mit Tlaxcala
- 1478 scheitert Axayácatl gegen die Purépecha. Michoacán wurde nie erobert.
- 1487 wird der Templo Mayor geweiht.

**Held:** Tlacaelel, als Feldherr und Berater. Wie bei Kaleb stirbt er nur im Kampf.

**Kopf:** `id:'dreibund'`, `ep:3`, `year:1440`, `ypt:0.65`, `turns:70`, `people:'azteken'`, `cap:'tenochtitlan'`.

**Welt:**

| Volk | Provinzen |
|---|---|
| Spieler (azteken) | tenochtitlan |
| mixteken (neu, „Mixteken und Zapoteken“) | oaxaca |
| totonaken (neu) | veracruz |
| tarasken | michoacan, zacatecas |
| maya | yucatan |
| kiche (neu, „K'iche' und Soconusco“) | guatemala, nikaragua |
| frei | Karibik |

Tlaxcala existiert nur als Ereignisgegner (Karte zu grob).

**Akte:**

| # | Titel | Ziel | Schätzung |
|---|---|---|---|
| I | Eins Kaninchen | `cond:'bau',k:['farm','lagerhaus'],lv:2,p:'tenochtitlan'` + Technik `chinampas` | 10 |
| II | Der Dichterkönig | `choice`: Nezahualcóyotl von Texcoco: „Damm gegen die Fluten bauen“ (Ordnung +2) oder „Gesetze und Gärten von Texcoco“ (Forschung +15 %) | 3 |
| III | Coixtlahuaca | `hold:['oaxaca']` | 8 |
| IV | Totonacapan | `hold:['veracruz']`; Belohnung: Tributlisten, Steuern +10 % | 8 |
| V | Die Blumenkriege | `choice`: „Verabredete Kriege mit Tlaxcala“ (Technik `blumenkrieg`, Angriff +) oder „Tlaxcala unterwerfen wollen“ (Ereigniskrieg, Ruhm +, dauerhafte Feindschaft) | 3 |
| VI | Soconusco | `hold:['guatemala']` (Kakao und Quetzalfedern) | 8 |
| VII | Der Große Tempel | `build:['temple',3,'tenochtitlan']` | 10 |

- **Summe:** etwa 50 Runden, Frist 65–70.
- **Gold (kontrafaktisch):** `michoacan` gehalten, was historisch nie gelang. Der Text kündigt es in Akt VI als „das Reich, das niemand bezwang“ an.

**Gewalt:** Gefangenenopfer werden in Akt V und VII sachlich als Teil der Religion der Mexica genannt, ohne Ausmalung und ohne Mechanik.

**Intro (Kern):**
> Tenochtitlan, im Jahr Eins Feuerstein, 1440. Vor zwölf Jahren waren die Mexica noch Tributpflichtige der Tepaneken. Dann schlossen sie mit Texcoco und Tlacopan einen Bund, und die alten Herren fielen. Nun wird Moctezuma Ilhuicamina, der Bogenschütze des Himmels, zum Tlatoani gewählt. An seiner Seite steht sein Halbbruder Tlacaelel, der Cihuacoatl. Er will kein König sein, aber er bestimmt, wie das Reich denkt: Er lässt alte Bilderhandschriften verbrennen und neue schreiben, in denen die Mexica das auserwählte Volk der Sonne sind. Rund um die Stadt im See liegen Völker, die Kakao, Baumwolle, Federn und Gold besitzen.

**Vertonung:** intro, k1–k7, ende, also 9 Texte.

**Standbilder:**
1. „Aztec city of Tenochtitlan on a lake with causeways, chinampa gardens and canoes at dawn, 1440“
2. „Two Aztec nobles in rich capes and feather headdresses conferring on a palace terrace overlooking the lake“
3. „Aztec tribute porters bringing bundles of cotton cloth, cacao and quetzal feathers to scribes with painted codices“
4. „The Great Temple of Tenochtitlan with twin shrines at the top during a festival, crowds below, no gore“

**Benötigt neu:** Völker mixteken, totonaken, kiche, als Ereignis tlaxcala. `cond:'bau'` ist vorhanden. Die Anpassung an die Religionen aus dem Glaubenspaket (Phase 2: eigene amerikanische Religionen) ist zu beachten.

---

### G7 · Atahualpa – „Der Bruderkrieg“ (Anden, 1529–1533)

**Rahmen:** Huayna Cápac und sein Erbe sterben um 1527 an einer Seuche, die vermutlich mit den Europäern kam, noch bevor diese selbst erscheinen. Danach:
- Huáscar herrscht in Cusco, Atahualpa mit dem kriegserfahrenen Nordheer in Quito.
- Die Brüder führen Krieg: Tomebamba, Ambato, Chimborazo.
- 1532 nehmen Atahualpas Feldherren Quisquis und Chalcuchímac Huáscar bei Quipaipan gefangen.
- Im selben Jahr landet Pizarro in Tumbes. Atahualpa empfängt ihn in Cajamarca und wird gefangen genommen.

**Kopf:**
- `id:'atahualpa'`, `ep:3`, `year:1529`, `ypt:0.08`, `turns:60`
- `people:'inka_n'` (neu, „Atahualpas Nordreich“) oder Umbenennung von inka
- `cap:'quito'`
- `req:['pachacutec']` (Bonus wie Cuauhtémoc, siehe F4)

**Welt:**

| Volk | Provinzen |
|---|---|
| Spieler | quito, kolumbien (Pasto) |
| huascar (neu, „Huáscars Cusco“) | cusco, lima, cajamarca, collao, charcas |
| kastilien | Hook in Akt VI: Spanier in panama |

**Heere:**
- Held „Atahualpa“: inkakeule ×2, inkaschl ×2, spear ×2, orejon.
- gen „Chalcuchímac“ und „Quisquis“.
- Huáscar: 3 Heere, gen „Atoc“ und „Huanca Auqui“.

**Akte:**

| # | Titel | Ziel | Schätzung |
|---|---|---|---|
| I | Tomebamba | `holdfor:['quito'],n:6` | 9 |
| II | Ambato | `wins:1` | 8 |
| III | Cajamarca | `hold:['cajamarca']` | 8 |
| IV | Die Küste | `hold:['lima']` | 8 |
| V | Quipaipan | `hold:['cusco']` + `choice` Huáscar: „Verbannen“ (Ordnung +1, Risiko Aufstand) oder „Gefangen halten“ (Ordnung +2, Huáscars Anhänger bleiben feindlich) | 8 |
| VI | Fremde in Cajamarca | Hook: Kastilien landet; `choice` „Mit bewaffneter Garde empfangen“, „Angreifen, bevor sie Verbündete finden“ oder „Gesandte schicken“; danach `wins:1` gegen die Kastilier | 10 |

- **Summe:** etwa 51 Runden, Frist 60.
- **Gold:** Kastilien aus panama vertrieben.

**Seuche:** Die vorhandene Blattern-Mechanik (`epiStart`) einmal zu Beginn, sachlich, ohne Schaden-Spitze für den Spieler.

**Intro (Kern):**
> Quito, im Jahr 1529. Der Sapa Inka Huayna Cápac ist tot, gestorben an einem Fieber, das niemand kannte und das ganze Dörfer leerte. Auch sein ältester Erbe ist tot. In Cusco, dem Nabel der Welt, hat sich sein Sohn Huáscar die rote Quaste aufgesetzt. Hier im Norden aber steht das Heer, das jahrelang mit Huayna Cápac gekämpft hat, und es folgt einem anderen Sohn: Atahualpa. Zwei Brüder, ein Reich, das von Quito bis Chile reicht, und eine Straße, auf der Läufer jede Nachricht in Tagen weitertragen. Noch weiß niemand, dass weit im Norden fremde Schiffe die Küste entlangsegeln.

**Vertonung:** intro, k1–k6, ende, also 8 Texte.

**Standbilder:**
1. „Inca army in colourful tunics with slings and star-headed maces marching on a mountain road below snowy volcanoes, Ecuador, 1530“
2. „Inca nobleman on a golden litter carried by bearers above a valley, soldiers around“
3. „Andean town square of Cajamarca with stone buildings, Spanish horsemen and Inca nobles facing each other, 1532“
4. „Two Inca armies meeting in a high Andean valley at dawn, banners, no gore“

**Benötigt neu:** Volk huascar (gegebenenfalls inka_n), Hook „Kastilien landet“. Die Kastilien-KI ist aus Cuauhtémoc übernehmbar.

---

### G8 · Das Große Gesetz des Friedens – Haudenosaunee (um 1450–1701)

**Rahmen:**
- **Die Gründung:** Nach der mündlichen Überlieferung bringen der Friedensstifter (Deganawida) und Hiawatha fünf verfeindete Nationen zum Großen Gesetz (Gayanashagowa): Mohawk, Oneida, Onondaga, Cayuga und Seneca. Der Onondaga-Häuptling Tadodaho widersetzt sich am längsten. Die Datierung ist umstritten und reicht von etwa 1142 bis etwa 1450.
- **Spätere Stationen:** die Kriege um den Pelzhandel gegen die Wendat (Huronen) um 1649, die Kovenantkette mit Niederländern und Engländern und der Große Frieden von Montréal 1701.

**Problem:** Die Fünf Nationen liegen alle in der Provinz `irokesen`. Eine Eroberungsgeschichte passt weder zur Karte noch zum Thema.

**Vorschlag (Aufwand L):** eine Diplomatie-Geschichte mit eigenem „Ratsfeuer“.
- `cond:'rat',n:5`: Fortschritt über Entscheidungen, Wampum-Gaben (Gold) und Kondolenzrituale (Ordnung). Jede Nation ist ein Schritt.
- Danach Ziele über vorhandene Mechanik: `trade:2` (Pelzhandel mit newyork und quebec) und `hold:['huronen']` oder die Entscheidung „Die Wendat aufnehmen“ (historisch wurden viele adoptiert).
- Schluss: `cond:'bund',n:3` (neu: n Bündnisse oder Verträge), der Große Frieden.
- **Epochenproblem:** Die Geschichte läuft nur in Epoche 3 (1510-Karte) mit `ypt:3`. Die Jahre bis 1701 werden über `ypt` abgedeckt, montreal/ohio sind dann nicht aktiv.

**Empfehlung:** Zurückstellen, bis das Glaubens-/Diplomatiepaket (Bündnisse und Verträge) steht, oder durch G9 ersetzen.

---

### G9 (Reserve) · Naresuan – „Der Schwarze Prinz von Ayutthaya“ (Siam, 1584–1600)

**Kompakt, nur vorhandene Mechanik:**
- `ep:3`, `year:1584`, `ypt:0.25`, `turns:60`, `people:'ayutthaya'`, gegen `taungoo` (Pegu).
- **Akte:**
  1. Unabhängigkeit erklären: `holdfor ayutthaya 6`
  2. Sukhothai zurückgewinnen: `hold`
  3. Nong Sarai (1593), Elefantenzweikampf: `wins:1`
  4. Angkor/Lovek: `hold angkor`
  5. Der Zug nach Pegu: `hold pegu`, Entfernung 2
- Entfernungen höchstens 2, also gut machbar.
- **Benötigt:** Kriegselefanten für südostasiatische Kultur (`elef2` hat bisher nur indisch/afrikanisch) und das Volk `ayutthaya` (vorhanden).

---

## 3. Gemeinsame Technik für alle neuen Geschichten

| Baustein | Für | Aufwand |
|---|---|---|
| Neue Völker (Name, Farbe, Wappen, Beschreibung) | alle; ca. 30 Einträge | S |
| `rules.noJpUnify` | G1 | S |
| Hooks: „Bündnis bricht“, „Provinz übergeben“, „Slot wechselt Volk“, „Gegner landet“ | G1, G2, G7 | S |
| `cond:'seesieg'` (Statistik in `navalBattle`) | G5, nützlich für G3/G4 | S |
| `cond:'anlegen'`, `cond:'schiffe'` | G4 | M |
| Flottenheld | G5 (Variante A) | M |
| `cond:'rat'`, `cond:'bund'` | G8 | M–L |
| Ostasiatische Einheitenvarianten (Samurai, Teppō, Ashigaru, Hwacha …), mindestens 3–4 als VARIANTS | G1, G3, G5 optisch und spielerisch | M |
| Elefanten für Südostasien | G9 | S |

**Dateien und Grenzen (wichtig):**
- Das Artifact hat höchstens 512 Dateien, zuletzt waren es etwa 498.
- 8 Geschichten mit eigenen `x_<id>.json` und neuen Bildpaketen sprengen die Grenze.
- **Empfehlung:**
  - Stimmen gebündelt als `x_asien.json` und `x_amerika.json`, über eine Zuordnung wie bei `x_de`.
  - Standbilder als `in_as.json` und `in_am.json`, über `IN_MAP`.
  - Das sind nur 4 neue Dateien.

**Vertonung gesamt:**

| Geschichte | Texte |
|---|---|
| G1 | 10 |
| G2 | 9 |
| G3 | 8 |
| G4 | 9 |
| G5 | 8 |
| G6 | 9 |
| G7 | 8 |
| G8 | etwa 8 |
| **Summe** | **etwa 69** |

Bei etwa 80–100 s je Bild (FLUX) und etwa 20–40 s je Sprechtext (XTTS-Erfahrung unbekannt) ist das ein großer PC-Auftrag mit grob 32 Standbildern plus 69 Sprechtexten.

**Kontinentwahl:** Geschichten in Asien oder Amerika sollten den Kontinent für diese Partie aktivieren (`S.conts`) beziehungsweise ihn in `cleanStart` setzen. Sonst ist der Schauplatz abgeschaltet. Asien setzt `addonOn('as')` voraus, Amerika `addonOn('am')`.

---

## 4. Empfehlung zur Reihenfolge

1. **Welle 1 (nur vorhandene Mechanik plus Völker und Hooks):**
   - G1 Oda Nobunaga
   - G2 Dschingis Khan
   - G6 Dreibund
   - G7 Atahualpa
   
   Je ein Schauplatz in Japan, der Steppe, Mexiko und den Anden. Kleinster Technikaufwand, größte Lücke geschlossen.
2. **Welle 2:**
   - G5 Yi Sun-sin (+`seesieg`)
   - G3 Kublai (+ wiederverwendete Völker aus G2)
3. **Welle 3:**
   - G4 Zheng He (Flottenziele)
   - G8 Haudenosaunee (nach dem Diplomatiepaket) oder G9 Naresuan

Für jede Welle braucht es einen PC-Auftrag (Standbilder plus Stimmen). Die Texte stehen oben vorbereitet.

---

## 5. Entscheidungsfragen für Moritz

**F1 – Umfang der ersten Welle**
- a) 4 Geschichten: Oda, Dschingis, Dreibund, Atahualpa (empfohlen)
- b) alle 8 auf einmal (langer Lauf, großer PC-Auftrag)
- c) erst nur Asien (Oda, Dschingis, Yi Sun-sin)

**F2 – Mongolen doppelt?**
- a) Dschingis zuerst, Kublai als Bonus-Fortsetzung (Freischaltung nach Dschingis) (empfohlen)
- b) nur Dschingis
- c) nur Kublai

**F3 – Seefahrt-Geschichten (Yi Sun-sin, Zheng He)**
- a) Neuer Flottenheld plus Seeziele, also echte Seegeschichten (mehr Aufwand)
- b) Der Held bleibt an Land, Seesiege und Anlegen sind nur Ziele (empfohlen)
- c) Seefahrt-Geschichten zurückstellen

**F4 – Freischaltung**
- a) alle neuen Geschichten sofort spielbar
- b) die Gegenseiten-Geschichten als Bonus wie Cuauhtémoc: Atahualpa nach Pachacútec, Kublai nach Dschingis (empfohlen)
- c) eine Asien-Kette und eine Amerika-Kette, die jeweils die nächste freischalten

**F5 – Haudenosaunee**
- a) eigene Rats-Mechanik als Diplomatie-Geschichte (nach dem Glaubens-/Diplomatiepaket)
- b) durch Naresuan (Siam) ersetzen, kompakt und sofort machbar
- c) beides, Haudenosaunee später

Standard ohne Rückfrage (änderbar): Historische Härten wie Opferkult, Massaker und Gefangennahmen erscheinen nur sachlich im Text und nie als belohnte Mechanik.
