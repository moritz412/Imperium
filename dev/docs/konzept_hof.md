# Konzept „Herrscher mit Team“ – Imperium der Epochen 2

Stand: 18.10.2026 · Grundlage: `/home/claude/imperium.html` (14.109 Zeilen, nur gelesen) · Zeilenangaben ungefähr (grep -n)

Leitlinie: Der Spieler entscheidet die Richtung, sein Team erledigt die Arbeit und meldet sich kurz. Alles bleibt übersichtlich: höchstens 3 Ratsvorschläge je Runde, Statthalterberichte gebündelt, Waren sperren nie hart (sie kosten höchstens Aufpreis). Ausnahme sind historische Regeln wie „Neue Welt ohne Feuerwaffen“. Die Bedienung ist eigenständig und lehnt sich an kein fremdes Spiel an: Karten, Chips und Ein-Tipp-Knöpfe wie im bestehenden Spiel.

---

## 1. Ist-Analyse

### 1.1 Hof und Ämter (Berater)

| Was | Wo | Befund |
|---|---|---|
| `OFFICES` (7 Ämter: kanzler, marschall, gelehrter, baumeister, diplomat ab Rang 2, heermeister ab Rang 3, statthalter = reichsweite Ordnung) | ~6061 | Rein passive Zahlenboni (`k:'tax'/'atk'/'rp'/'build'/'dipl'/'acap'/'ordm'`), Stufe 1–3 (`s`) |
| `OFF_T` Amtstitel je Kultur (orient, indisch, steppe, rom, meso, maya, anden, nord, mapuche, chinesisch, japanisch, koreanisch, suedostasiatisch, habescha), `offName(o,f)` | 6072–6086 | **Gut:** Kulturtitel gibt es schon (Wesir, Quästor, Kampaku, Tsehafi Tezaz …) |
| `MIN_TRAITS` (treu, ehrgeizig, korrupt, erfahren), `newMinister`, `minEff`, `minSalary` | 6087–6091 | Nur 1 Eigenschaft, kein Alter, keine Treue, keine Erfahrung, keine Persönlichkeit |
| `MIN_NAMES` (12 berühmte Namen je Epoche, z. B. Cicero, Richelieu) | 6088 | Wird meist von `cFull(f,e)` (Kulturnamen) überschrieben, sonst passen die Namen nicht zur Kultur |
| `hofOf` (Kandidaten alle 8 Runden neu, Minister verfallen beim Epochenwechsel), `appoint`, `minSum`, `hofCost` | 6092–6096 | Amtsinhaber verschwinden beim Epochenwechsel (`m.e<ep()`), es gibt keine Bindung an Personen |
| `hofRound` (ehrgeizig: 3 % Abgang je Runde), `aiHof` | 6097–6098 | Kaum Eigenleben |
| `openHof` Reiter: Ämter, Parteien, Glaube/Lehen, Familie, Feldherren, Agenten | 3137 | UI für Ämter ist ein Kandidatenraster, Berater sprechen nie |
| **Aufträge** `MKINDS` (Auftrag ist einem Amt zugeordnet), `mkMission`, `missionRound` (alle 2 Runden einer, höchstens 3), `missionsHtml` („Auftrag von X, Kanzler“) | 6575–6606 | **Bester Ansatzpunkt:** Das ist schon ein Vorschlagssystem mit Amtsbezug, aber zufällig, ohne Begründung, ohne „Annehmen“ und ohne Kultur- oder Epochenbezug |
| `advisorHints` („Ratgeber: …“) | 9356 | Nur 2 Hinweise (frühe Expansion in Runde 4–8, Ende der Schonfrist), nur als Logzeile |
| `ecoHints` (Engpässe) | 2797 | Gute Regeln (Nahrung, Bedarf der Siedlungen, fehlendes Erz/Metall), sichtbar aber nur im Wirtschaftsfenster |
| `todoItems` / `renderTodo` (Chips über der Karte: Unruhe, Aufstieg, Bedarf, Geldverlust, freier Bauplatz, Ämter unbesetzt, Regionen ohne Statthalter …) | 13666–13700 | Gute Form für „Rat hat Vorschläge“ |
| Parteien `POL` (adel, klerus, buerger), `polRound`, `POL_EV` Intrigen | 7476–7516 | Nur für menschliche Spieler. Lässt sich gut mit Beratern verknüpfen (z. B. Hofgeistlicher ↔ Klerus) |
| Sprecher `NARR` (XTTS-Pakete `audio/x_<paket>.json` als base64-mp3, `X_PACKS`, Ersatz durch Gerätestimme), `AUDIO.duck` | 7990–8015 | **Die Infrastruktur für Beraterstimmen ist schon da.** `speak(keys,text)` leitet das Paket aus dem Schlüssel ab und braucht dafür eine neue Regel für `rat_` |

### 1.2 Statthalter, Familie, Lehen, Daimyō

| Was | Wo | Befund |
|---|---|---|
| `GOV_DIR` (eco, mil, grow, ord, jeweils mit Gebäudeliste `k`) | 2843 | 4 Richtungen, nur als Baupräferenz (+1,6 im Score) |
| `GOV_TR` (fromm, gierig, tuechtig, bauherr, streng) | 2848 | **Bug: `gierig` ist nirgends umgesetzt** (nur Beschreibung). `bauherr` wirkt in `govRound`, `streng` im Wachstum (~9397), `fromm`/`streng` in `govOrd` |
| `govCands` (3 Kandidaten je Region, alle 10 Runden neu), `appointGov`, `govCost`, `govSalary`, `govLv` (s + tüchtig) | 2849–2856 | Keine Erfahrung, keine Treue, kein Alter |
| `GOV_RET` Gefolge (Steuereintreiber, Baumeister, Richter), zufällig nach 6 Runden mit 4 % | 6022 / 2859 | Netter Ansatz, aber zufällig und nicht steuerbar |
| `govRound` | 2859 | Baut selbst: zuerst Aufstieg/Umbau, dann der beste `buildScore` + Richtungsbonus. Reserve 150×Epochenkosten, höchstens 40 % des Golds, 1 Bau je Runde (ab Epoche 3 zwei, vgl. Text ~5516). **Jeder Bau erzeugt eine Logzeile, das wird zu Spam** |
| `kindRound` | 2172 | Statthalter wählen Stadt/Burg (mil → Burg) und die Ausrichtung (`SWAY`) |
| `govHtml` in `openRegion` | 2933 | Karte mit Richtung, „Selbst bauen an/aus“, Abberufen |
| `adminCap`/`adminParts` (+2 Verwaltungsgrenze je Statthalter) | ~2862 | Hier hängen die Statthalter schon an der Ordnung |
| Familie: `dynOf` (ruler, sp, kids, kin), `dynMakeGov` (Familienmitglied wird Statthalter, `G.fam`, Stufe 2–3, Eigenschaft über `DYN_GV`), `dynMakeGen`, `dynFreeJob`, `dynRival` (ein Amt senkt das Thronstreitrisiko), `THRON_EV` „Ihm ein hohes Amt geben“ | 6240–6410 | **Gut verzahnt:** Familie als Statthalter gibt es schon |
| Lehen/Satrapie `fiefOn`, `giveFief` (Steuern −40 %, Garnison +50 %, Ordnung +1), `fiefRound` (Adel < 20 → Gefolgschaft verweigert) | 8446–8460 | Halbautonome Provinz. Wie Lehen und Statthalter zusammenspielen, ist bisher nicht geregelt |
| Daimyō-Treue `shoRound` (`P.dl` je Provinz, nach Entfernung zur Hauptstadt und Ordnung, unter 15 Abfall), Sankin-kōtai | ~4053–4068 | Es gibt ein Treuemodell je Provinz. Das ist eine Vorlage für die Statthaltertreue |
| `orderParts(pi)` Aufschlüsselung | 2243 | Statthalter erscheinen dort über `govOrd` |
| `moneyLeaks(f)` | 3002 | Hier sollte Korruption sichtbar werden |

### 1.3 Bauen und Siedlungen

| Was | Wo | Befund |
|---|---|---|
| `BUILDINGS` (~31 Bauten, je 3 Stufen, `ep`, `cul`, `rel`, `pk`, `need`, `req3`, `free`) | 1909–1941 | Breites Angebot |
| `BETRIEBE` (~31 Betriebe, `kind:'b'`, Ware `g`) → `EKEYS` | 2026–2057 | Eigene Betriebsplätze |
| `BNAMES`/`BNAMES_CUL` Epochen- und Kulturnamen, `bOld`/`modernCost`/`diffRound` (Veralten und Ausbreitung des Wissens) | 1947–2030 | Stark |
| `BIMG_CUL` Kulturbilder (`b_<geb>_<kontext>.webp`), `img/bcul.json` | 1944–1946 | 12 Kulturvarianten |
| **Bauplätze gibt es schon:** `slotsOf(pi)=1+lvl(+1 Burg)(+1 Hauptstadt)`, `slotsUsed`; `betrSlots=1+lvl(+1 Hauptstadt)`, `betrUsed`; `demolish` | 2190–2194, 2788 | Dorf 2, Marktflecken 3, Stadt 4, Großstadt 5, Metropole 6 (+1 Hauptstadt/Burg). Wichtig für Teil D |
| `BLVL` (Mindeststufe der Siedlung je Gebäude) | 2616 | Abgestufte Freischaltung gibt es |
| `LVLN` Dorf…Metropole, `LVL_NEEDS` (Warenbedarf je Stufe), `LVL_UP`, `canLvlUp`/`startLvlUp` | 2601–2622 | Siedlungsaufstieg mit Waren |
| `KIND` stadt/burg, `SWAY` (Handels-, Gelehrten-, Hafenstadt, Grenzmark, Hafenfestung, Klosterburg), `setKind`, `kindRound` | 2147–2185 | Spezialisierung ab Stadt/Großstadt |
| **Ein Bauauftrag je Provinz:** `P.build` (ein Objekt), Warteschlange `P.q`, Vorlagen `TPL`/`tplNext`/`tplRound`, Abarbeitung in `newRound` | 2201–2235, ~9390 | 125 Fundstellen `.build`, 25 Fundstellen `P.q` |
| `canBuild` (Prüfreihenfolge, Kosten inkl. Baumeister-Gefolge), `startBuild`, `cancelBuild` | 2212–2240 | Zentraler Engpass |
| `buildCost` + `buildGoods` (Holz/Stein, ab Epoche 2 Ziegel, ab Epoche 4 Eisen) + `goodsCost` (Aufpreis für fehlende Waren, 3–4× Preis) | 2200, 2784–2786 | Fehlende Waren erzeugen Aufpreis statt Sperre. Spielerfreundlich, so beibehalten |
| KI: `aiEconomy` (2–4 Bauten je Runde, `buildScore`/`buildScore0`) | 2436, 2411 | Würde paralleles Bauen sofort mitnutzen, wenn `canBuild` es erlaubt |
| Hinweis: `S.capQ` ist die **Eroberungs-Entscheidungsschlange** (`conquestDecide` 6469), keine Bauschlange | | Begriff nicht verwechseln |

### 1.4 Waren, Produktionsketten, Handel

| Was | Wo | Befund |
|---|---|---|
| `GOODS` (37 Waren inkl. `waffen` p6, `metall` p4, `erz`, `eisen` ab Epoche 4, `kohle`, `pferde`) | 2458 | Waffen sind schon eine Ware |
| `DEPOSITS` (eisen, kupfer, zinn, silber, gold, salz, marmor + Fernwaren) | 2468 | Kupfer und Zinn landen beide in `erz`, Bronze wird nicht unterschieden |
| Ketten `ECO_CHAINS`: Erz+Holz → Schmelze → Metall → Waffenschmiede (`smith`) → Waffen; Werkzeugschmiede; Hochofen (Erz+Kohle → Eisen, Epoche 4); Fabrik | 2817–2840, `ecoRound` 2716 (z. B. `smith` 2740) | **Erz → Schmelze → Waffenschmiede gibt es schon** |
| `RG` Aushebungswaren: spear Waffen 1, sword Waffen 2, missile **Holz 1**, cav Pferde 2, art Metall 3 | 2476 | **Lücke:** Musketen kosten nur Holz, Kanonen nur Metall. Pulver und Geschütze fehlen |
| `equipCost` (Waffen-/Rüstungsstufe: Waffen/Metall), Aufwerten/Modernisieren (Waffen) | 8873–8883 | Waffenverbrauch ist eingebaut |
| `canRecruit` (Kaserne für Reiterei, Kaserne II für Artillerie, Varianten mit `bar`), `recMax`, `noHorse` (Neue Welt), `indNoGun`/`indGunRound` (Neue Welt lernt Feuerwaffen durch Kontakt) | 2196–2199, 1242–1248 | Historische Regel für die Neue Welt gibt es schon |
| `VARIANTS` Feuerwaffen/Artillerie: torsion, bombarde (Epoche 2), arkebus, janits, topcu, feldkan (Epoche 3), haubitze, jaeger (Epoche 4) | 1085–1197 | Ein Flag für Feuerwaffen gibt es (`st.gun`) |
| `importGoods` (automatisch: Handelspartner liefern Mangelware aus ihrem Überschuss, bis 1,5 je Partner, 80 % Preis, begrenzt durch Routenkapazität) | 2667 | Automatischer Zukauf über Partner gibt es, er ist aber unsichtbar |
| `goodSrcHtml`/`openGoodSrc` („Woher?“: eigene Erzeugung, Lagerstätten, Betriebe, **Liste möglicher Lieferanten mit Überschuss** und Handelsbereitschaft, Eroberungsziele) | 2676–2700 | **Halb fertig:** zeigt Lieferanten, öffnet aber nur das Diplomatiefenster, ohne Route, Preis oder Ein-Tipp-Vertrag |
| `F.hold` „Horten“ je Ware (kein Verkauf über der Lagergrenze) | 3054/3116 | Vorrat halten gibt es |
| `storeCap` (30 + 8 je Provinz + 20 je Lagerhausstufe), Überschuss über dem Limit wird verkauft (`ecoRound` ~2780) | 2536 | |
| `marketPrices` (Angebot/Nachfrage aller Reiche, Marktschocks), `priceOf`, `saleRate` | 2560–2570 | |
| Handel: `tradeSlots`, `tradeCount`, `tradeEval` (Beziehung, Grenze, Märkte, ab Wert 2), `TRADE_TERM`=20, `tradeTerms`, `tradeIncome` (Festeinnahmen je Partner), `tradeTrim` | 8300–8306, 11544–11583 | Ein Handelsvertrag ist ein pauschaler Vertrag, keine Lieferung einer bestimmten Ware |
| `routeInfo`/`routePath` (Etappen, See- oder Landweg, Kapazität), `upgradeRoute`, `routesHtml` | 13716–13730 | Routen mit Kapazität sind gut sichtbar |
| Lieferaufträge `contractRound`/`acceptContract` (nur **Export**: Partner bestellen bei dir) | 13802–13822 | **Lücke:** Es gibt keinen Importauftrag in die Gegenrichtung |
| Embargo `aiEmbargo`, Monopole `monoRound`, Raub `robRound`, Kompanien `compRound` | 8315–8539 | |
| Wirtschaftsfenster `openEconomy` Reiter: Übersicht, Haushalt, Siedlungen, Ketten, Provinzen, Transport, Handel, (Kompanien) | 3043 | Der Reiter „Handel“ zeigt Verkauf, Partner, Routen und Marktpreise, sagt aber nicht, was fehlt und wer es liefern kann |
| `img/ui_import.webp`/`ui_export.webp` | 11957 (`mImp`), Todo `img:'export'` | **`ui_import` ist das Symbol für den Spielstand-Import im Hauptmenü**, nicht für Warenimport. `ui_export` dient bei Bedarf und Lieferauftrag als Chip-Bild. Für die Warenbeschaffung braucht es ein eigenes Symbol (Vorschlag `ui_beschaffen`) |

### 1.5 Zusammenfassung: vorhanden, dünn, fehlt

- **Vorhanden und stark:** Kulturtitel der Ämter, Familie als Statthalter, Lehen und Satrapien, Daimyō-Treue, Bau- und Betriebsplätze je Siedlungsstufe, Stadt/Burg samt Ausrichtung, Warenketten bis zur Waffenschmiede, automatischer Import, „Woher?“-Fenster, Todo-Chips, XTTS-Erzählerpakete.
- **Dünn:** Berater sind nur Zahlenboni ohne Stimme und ohne Persönlichkeit. Aufträge sind zufällig und unbegründet. Statthalter haben 4 Richtungen, keine Erfahrung und keine Treue, sie berichten per Logzeile je Bau, und ihr Budget ist eine globale Reserve. Import passiert unsichtbar automatisch.
- **Fehlt:** begründete Ein-Tipp-Vorschläge, reichsweite Bedarfsliste, Statthalterberichte, Korruption/Abfall (`gierig` ist ein Bug), Pulver/Geschütze, Importvertrag („Ware X beschaffen“), paralleles Bauen.

---

## 2. Konzept

### A) Der Rat: Berater mit Person, Vorschlägen und Stimme

**Ämter, die sprechen (5 Ratssitze).** Die bestehenden `OFFICES` werden weiterverwendet, fünf davon bekommen eine Stimme:

| Ratssitz | Schlüssel | spricht über | Kulturtitel (bestehend/neu) |
|---|---|---|---|
| Kanzler / Schatzmeister | `kanzler` | Gold, Steuern, Waren, Handel, Beschaffung | Quästor, Wesir, Chengxiang, Tsehafi Tezaz, Cihuacoatl … |
| Feldherr | `marschall` | Heere, Grenzen, Rüstung, Pulver/Geschütze | Legat, Noyan, Taishō, Fitawrari … |
| Diplomat | `diplomat` (ab Rang 2; darunter spricht der Kanzler für ihn) | Bündnisse, Handelspartner, Heiraten, Tribut | Gesandter, Pochteca-Gesandter … |
| Gelehrter / Hofgeistlicher | `gelehrter` | Forschung, Glaube, Ordnung, Klerus | Hanlin-Gelehrter, Aqabe Seat, Amauta, Ah Kin … |
| Reichsverweser (= heutiges Amt `statthalter`) | `statthalter` | Provinzen, Statthalter-Team, Aufstieg, Bauplätze | Prokonsul, Wali, Darughachi, Shugo … |

Baumeister und Heermeister bleiben stille Ämter (Boni wie heute). Der Baumeister liefert dem Reichsverweser bessere Bauvorschläge (+1 Vorschlagsqualität).

**Person (Erweiterung von `newMinister`, abwärtskompatibel):**
```js
m = { n, o, s /*1–3 Fähigkeit*/, t /*bestehende Eigenschaft*/, e, face,
      age: 30–60, tr2: 'kuehn'|'vorsichtig'|'fromm'|'kaufmann'|'traditionell'|'neuerer'|null, // Haltung, färbt die Vorschläge
      loy: 50–80 /*Treue*/, xp: 0, since: S.turn,
      vo: 'a'|'b' /*Stimme*/, ok: 0, no: 0 /*angenommene/abgelehnte Vorschläge*/ }
```
- **Haltung `tr2`** gewichtet die Vorschläge: kühn → Angriff und Expansion ×1,3; vorsichtig → Mauern, Reserve, Frieden ×1,3; kaufmännisch → Handel; fromm → Tempel, Glaube; traditionell → Kulturleitlinie ×1,4; Neuerer → Forschung und Modernisierung.
- **Treue** steigt durch angenommene Vorschläge (+1, höchstens +5 je 10 Runden) und gezahltes Gehalt, sie sinkt bei Dauerablehnung (−1 ab 5 Ablehnungen in Folge), bei zufriedener Partei des Gegenlagers usw. Wirkung: unter 30 macht „ehrgeizig“ einen Abgang oder Intrigen wahrscheinlicher, unter 15 wechselt er zum Rivalen (nur Text plus kleiner Malus). **Ablehnen wird nie hart bestraft.**
- **Erfahrung:** +1 je Runde im Amt, +5 je angenommenem Vorschlag, der sich erfüllt. Bei 40/100 steigt `s` um eins (höchstens 3, mit „erfahren“ 4). Daraus wird die Geschichte „Mein Kanzler ist mit mir gewachsen“.
- **Epochenwechsel:** Minister verfallen nicht mehr (`hofOf` löscht heute bei `m.e<ep()`). Sie altern um den Zeitsprung (wie `dynJump`). Wer über 70 ist, geht in Ruhestand und ein Nachfolger wird vorgeschlagen. Ruhestand ist ein Spielmoment und kein stummer Verlust.
- **Familie im Rat:** Erwachsene Verwandte (`D.kin`, `D.kids`) erscheinen als Kandidaten (wie `dynMakeGov`). Sie bekommen Treue +20, sind aber oft weniger fähig. Ein Amt senkt das Thronstreitrisiko (`dynRival`), das ist schon heute so gedacht.
- **Namen:** immer `cFull(f,e)` (Kultur). `MIN_NAMES` bleiben als seltene „Berühmtheit“ (5 %, nur passende Kultur und Epoche, z. B. Agrippa für Rom, Zheng He als Diplomat für China, Mercator als Gelehrter ab Epoche 3) mit `s:3`.

**Vorschlagsmaschine (Kernstück).** Sie ersetzt `advisorHints` und speist zusätzlich `mkMission`.

```js
const ADV = [ // Regel = Vorschlag
 { id:'holz_kaufen', o:'kanzler', ep:[0,4], cat:'waren',
   when: f => { const d = deficit(f,'holz'); return d.r < 0.8 ? {g:'holz', d} : null; },
   urg: c => 2 + (1 - c.d.r) * 3,               // 0–5 Dringlichkeit
   txt: (c,f) => `Uns fehlt ${GOODS[c.g].n}: ${fmt(c.d.miss)} je Runde. ${bestSupplierTxt(f,c.g)}`,
   why: c => [`Bedarf ${c.d.use}`, `Erzeugung ${c.d.prod}`, `Aufpreis beim Bauen ${c.d.sur} Gold`],
   act: c => ({k:'procure', g:c.g}),            // öffnet „Ware beschaffen“, vorbelegt
   say: 'waren_mangel', cd: 8 },
 { id:'rom_strasse', o:'statthalter', ep:[0,1], doc:['rom'], ...
   when: f => longestUnroadedPath(f) >= 3 ? {...} : null,
   act: c => ({k:'build', pi:c.pi, key:'strasse'}), say:'bau_strasse', cd:10 },
 ...
];
```

- **Ablauf je Runde (in `newRound` nach `ecoRound`, nur für den menschlichen Spieler):** alle Regeln prüfen, dann `score = urg × kulturGewicht(doc) × haltung(tr2) × (0,6 + 0,2·s)`, abzüglich kürzlich abgelehnter Themen. Danach wählen: **höchstens 1 Vorschlag je Amt, insgesamt 1 (ruhig) bis 3 (Krise)**, und nur, wenn der Score über einer Schwelle liegt. Unbesetztes Amt heißt, der „Rat“ spricht ohne Person, mit schwächerer Gewichtung, nur dringende Themen.
- **Kulturleitlinien `DOCTRINE`** (Gewicht ×1,3–1,5, nicht exklusiv, gute Spielzüge bleiben gute Spielzüge):

| Gruppe | Leitlinien → Regeln |
|---|---|
| Rom (latein, Epoche 0–1) | Straßen (`strasse`), Kolonien/Expansion in freie Nachbarprovinzen, Aquädukt in Städten, Legionen an Grenzen, Bürgerrecht (Ordnung), Lehen erst ab Völkerwanderung |
| Griechen | Häfen und Kolonien an Küsten, Theater, Bibliothek/Museion |
| Karthago/Punier | Häfen, Kontor, Söldner (Hilfstruppen `hireAux`), Purpur-Handel |
| Venedig/Genua (latein + Hafen, Epoche 2–3) | Kontore, Handelsrouten ausbauen (`upgradeRoute`), Flotte, Glashütte, Lieferaufträge annehmen |
| Germanisch/HRR (Epoche 1–3) | Pfalz, Lehen vergeben, Burg statt Stadt an Grenzen, Kloster; ab Epoche 3 Bergbau (Nürnberg/Erzgebirge: Mine, Waffenschmiede, Geschützgießerei) |
| Steppe/Mongolen | Yam-Post (Straßenstation/Karawanserei, Text „Yam-Station“), Gestüte und Reiterei, Tribut statt Eroberung schwacher Nachbarn, Handel auf der Seidenstraße |
| Arabisch/Persisch | Karawansereien, Haus der Weisheit, Persischer Garten, Satrapien, Fernhandel (Weihrauch, Seide) |
| Osmanen (pp osmanen) | Janitscharen, Topçu-Großgeschütze plus Geschützgießerei, Festungen an der Grenze |
| Habescha | Stelen, Felsenkirche, Handel über das Rote Meer (Hafen/Kontor), Gold-Mine, Glaubensschutz; ab Epoche 3 **Feuerwaffen nur über Handel** (historisch Bezug über Osmanen und Portugiesen) |
| China | Kornspeicher, Bibliothek (Beamtenprüfung), Mandat des Himmels pflegen, Tributstaaten, Pulver früh (ab Epoche 2) |
| Japan | Burg/Shugo, Sankin-kōtai bei sinkender Daimyō-Treue, ab Epoche 3 Teppō (Pulver über Handel/Portugiesen) |
| Indien (Mogul) | Salpeter (Bengalen) als Exportschlager, Gärten, Elefanten, Kontor |
| Meso/Maya | Chinampas (Gutshof), Tempel, Tributprovinzen statt Vernichtung, Pochteca-Handel. **Keine Feuerwaffen-Vorschläge** |
| Anden | Qhapaq Ñan (Straßen), Qollqa (Kornspeicher), Terrassen (Gutshof), Mit'a (Bauen günstig) |
| Britisch, Epoche 3–4 | Flotte, Kompanie gründen, Kolonien, Börse |
| Frankreich/Preußen, Epoche 4 | Kaserne III, Jäger, Feldartillerie, Fabrik, Kanäle (Straße) |

- **Allgemeine Regeln (alle Kulturen, je Amt 8–12):**
  - *Kanzler:* Warenmangel X (aus der Bedarfsliste, s. B), Kasse unter 2 Runden Ausgaben → Steuern „hoch“ für 5 Runden oder Anleihe, Lager über dem Limit → Ware X „Horten“ ausschalten bzw. Lieferauftrag, Route voll → Route ausbauen, freier Handelsplatz → Partner mit passendem Überschuss vorschlagen, Marktschock (`S.mshock`) → jetzt verkaufen oder kaufen.
  - *Feldherr:* Feind an der Grenze (`frontierOf`, Heere in der Nähe) → Garnison/Mauern/Heer verlegen, Heer ohne Feldherr, veraltete Einheiten → Modernisieren, Pulver- oder Waffenmangel vor einem Krieg, Schonfrist endet (heutiger `advisorHints`-Fall), schwache freie Nachbarprovinz (heutiger Expansionshinweis).
  - *Diplomat:* Nachbar mit guter Beziehung ohne Vertrag → Handel/Bündnis, Erzfeind wird stark → Koalition/Garantie, heiratsfähiges Kind → Heirat, Krieg kostet zu viel → Frieden.
  - *Gelehrter:* keine Forschung gewählt, passende Forschung für ein aktuelles Ziel (z. B. „Architektur → Mauern III“), Klerus unzufrieden → Tempel/Spende, fremder Glaube über 50 %, Bibliothek ohne Schreibstoff.
  - *Reichsverweser:* Region ohne Statthalter, Statthalter untreu, Aufstieg möglich, Siedlung braucht Ware für Wachstum, freier Bauplatz in einer Großstadt, Burg oder Stadt wählen, Unruheprovinz → Fest/Truppen.
- **Annehmen = Aktion.** Typen von `act`:
  - `build{pi,key}` → `startBuild` oder, wenn belegt, `P.q.push`
  - `procure{g}` → Beschaffungsfenster
  - `open{win,arg}` → Diplomatie, Region, Hof, vorbelegt
  - `tax{rate,turns}`
  - `fest{pi}`
  - `gov{reg}` → Kandidatenauswahl
  - `research{id}`
  - `move{aid,pi}` → zeigt nur den Weg, der Spieler bestätigt

  Kostet die Aktion Gold, steht die Zahl auf dem Knopf („Annehmen · 180 Gold“). Fehlt Gold, heißt der Knopf „Vormerken“ und legt die Aktion in die Warteschlange.
- **Gegen Gängelung und Spam:**
  1. Höchstens 3 Vorschläge je Runde, normal 1–2, je Amt einer.
  2. Abklingzeit `cd` je Regel (8–15 Runden), „Nicht mehr vorschlagen“ sperrt das Thema 40 Runden.
  3. Keine Vorschläge für Dinge, die der Spieler gerade schon tut (Bau läuft, Fenster offen, Statthalter mit passendem Auftrag deckt es ab).
  4. Einstellung **Rat: Aus / Nur Dringendes / Normal** (Standard Normal, im Menü neben Vorlesen).
  5. Keine Modale. Ein Todo-Chip „👑 Rat · 2“ öffnet eine kleine Ratskarte. In ruhigen Runden erscheint gar nichts.
  6. Vorschläge verfallen still nach 3 Runden.
- **Aufträge (`MKINDS`) zusammenführen:** Die zufälligen Missionen werden zu angenommenen Vorschlägen mit Belohnung. Aus „Annehmen“ wird „Annehmen und als Auftrag führen“ (Ziel plus Belohnung wie heute über `addMission`). So hängt das bekannte Auftragssystem dran, ohne zweites Parallelsystem.

**UI-Skizze (iPad, Hochformat und Querformat):**
- Todo-Leiste: Chip mit Bild `ui_rat` „Rat · 2“.
- Ratskarte (Bottom-Sheet bis halbe Höhe): je Vorschlag eine Zeile mit Porträt (Gesicht `face`, Rahmen in Amtsfarbe), Titel des Amts und Name („Quästor Gaius Aemilius“), **ein Satz Vorschlag** in Fettschrift, darunter 1–2 Begründungschips („Holz: −2,4 je Runde“, „Aufpreis 60 Gold je Bau“). Rechts die Knöpfe **Annehmen**, **Später**, `⋯` (Nicht mehr vorschlagen). Ein Tipp aufs Porträt öffnet den Hof.
- Beim Öffnen spielt einmal die Stimme des ersten Vorschlags (Kurzkommentar, 2–5 s), danach bleibt es still. Ein Lautsprechersymbol wiederholt den Kommentar.
- Hof → Ämter: Personenkarte mit Alter, Eigenschaften, Treue-Balken, Erfahrung, „angenommen 12 / abgelehnt 3“.

**Stimme (XTTS, Vorvertonung auf Moritz' PC):**
- **Stimmenbank:** je Ratssitz 2 Stimmen (`a` älter/tief, `b` jünger/heller). Dazu kommt optional eine Frauenstimme `f` (Regentin, Hofdame, Habescha-Kaiserin/Kandake, Japan). Das ergibt 10 bis 11 Stimmen. Jeder Minister bekommt `vo` bei der Ernennung, nach Alter.
- **Sätze sind name- und ortsfrei,** damit sie für alle Kulturen passen. Zahlen, Orte und Waren stehen im Bildschirmtext, die Stimme liefert nur Stimmung und Kernaussage. Eine Anrede gibt es nicht, also kein „Herr“ oder „Majestät“, das passt sonst nicht zu Herrscherinnen.
- **Schlüsselmuster:** `rat_<amt>_<stimme>_<thema>_<nr>`, z. B. `rat_kanzler_a_waren_02`. Paket `audio/x_rat_<amt>_<stimme>.json` (base64-mp3 wie bei den Erzählern), in `X_PACKS` eintragen. In `NARR.speak` kommt eine Regel dazu: `/^rat_/` → Paket `rat_<amt>_<stimme>`. Die Gerätestimme bleibt Ersatz.
- **Umfang:** 40 Sätze je Amt × 2 Stimmen × 5 Ämter = 400 Clips (+ 40–80 für die Frauenstimme). Bei ~3 s und 32 kbit/s sind das etwa 12 KB je Clip, also ~5 MB gesamt bzw. ~0,5 MB je Paket, nachgeladen nur für die besetzten Ämter.
- **Katalog Kanzler (40 Sätze, Themen und Zahl):**

| Thema | Nr | Beispielsätze |
|---|---|---|
| `gruss` | 01–04 | „Die Bücher sind geprüft.“ · „Ein kurzer Blick auf die Kasse.“ · „Ich habe die Zahlen dieser Runde.“ · „Die Schreiber haben gerechnet.“ |
| `kasse_knapp` | 01–04 | „Die Kasse wird leer, wir sollten sparen.“ · „Noch zwei Runden, dann fehlt Gold für den Sold.“ · „Eine Anleihe wäre jetzt klug.“ · „Wir geben mehr aus, als wir einnehmen.“ |
| `kasse_voll` | 01–03 | „Die Truhen sind voll. Gold, das ruht, arbeitet nicht.“ · „Wir können uns etwas leisten.“ · „Jetzt wäre die Zeit für ein großes Bauwerk.“ |
| `waren_mangel` | 01–05 | „Uns fehlt eine wichtige Ware.“ · „Die Werkstätten stehen still, der Rohstoff fehlt.“ · „Ohne Nachschub wird jeder Bau teurer.“ · „Wir müssen einkaufen oder selbst erzeugen.“ · „Ich kenne Händler, die liefern können.“ |
| `waren_ueberschuss` | 01–03 | „Die Lager quellen über.“ · „Wir sollten verkaufen, bevor es verdirbt.“ · „Ein Nachbar sucht genau diese Ware.“ |
| `handel_partner` | 01–04 | „Ein neuer Handelspartner würde sich lohnen.“ · „Die Route ist voll, wir sollten sie ausbauen.“ · „Ein Vertrag bringt jede Runde sicheres Gold.“ · „Die Händler warten auf ein Zeichen.“ |
| `markt` | 01–03 | „Die Preise steigen, jetzt verkaufen!“ · „Die Preise fallen, jetzt einkaufen.“ · „Der Markt ist unruhig.“ |
| `steuer` | 01–04 | „Die Steuern könnten etwas höher sein.“ · „Das Volk stöhnt unter den Abgaben.“ · „Ein Steuernachlass würde Ruhe bringen.“ · „Die Steuereintreiber melden gute Ernte.“ |
| `korruption` | 01–03 | „In einer Provinz verschwindet Geld.“ · „Ein Statthalter füllt die eigene Truhe.“ · „Ich empfehle eine Prüfung.“ |
| `zustimmung` | 01–03 | „Eine weise Entscheidung.“ · „Sofort veranlasst.“ · „Ich kümmere mich darum.“ |
| `ablehnung` | 01–02 | „Wie Ihr wünscht.“ (neutral) · „Dann warten wir ab.“ |
| `epoche` | 01–02 | „Eine neue Zeit, neue Märkte.“ · „Das Geld der neuen Zeit fließt schneller.“ |

  Hinweis: „Ihr“ ist geschlechtsneutral und deshalb erlaubt.
- **Themen der anderen Ämter (je 40, gleiche Struktur):**
  - Feldherr: `gruss, grenze_gefahr, angriff_chance, ruestung_mangel (Waffen/Pulver/Geschütze), veraltet, garnison, sieg, niederlage, frieden_rat, zustimmung, ablehnung, epoche`
  - Diplomat: `gruss, buendnis, handel, heirat, erzfeind, koalition, frieden, tribut, beleidigt, zustimmung, ablehnung, epoche`
  - Gelehrter/Geistlicher: `gruss, forschung_waehlen, forschung_ziel, glaube_klerus, fremder_glaube, ordnung, bibliothek, entdeckung, zustimmung, ablehnung, epoche`
  - Reichsverweser: `gruss, region_ohne, statthalter_bericht, statthalter_untreu, aufstieg, bauplatz, unruhe, versorgung, zustimmung, ablehnung, epoche`
- **Erzeugung:** Eine CSV/JSON-Liste `rat_saetze.json` (`key`, `text`, `stimme`) dient als Eingabe für das XTTS-Skript auf dem PC. Es schreibt je Stimme ein Paket. Der Text auf dem Bildschirm ist unabhängig und darf länger sein.

**Aufwand A:** Personendaten und Migration k · Vorschlagsmaschine plus 50–60 Regeln m–g (Regeln sind Fleißarbeit, aber unabhängig) · Ratskarte UI m · Stimme k (Infrastruktur da) plus Sätze schreiben m · **gesamt m–g**.
**Risiken:** Vorschläge, die schlecht sind, untergraben das Vertrauen. Darum zuerst wenige, sichere Regeln und Schwellen eher hoch ansetzen. Zusätzliche Rechenzeit je Runde (Regeln nur für den menschlichen Spieler, Ergebnisse cachen). Alte Spielstände: Felder fehlen und bekommen Standardwerte in `hofOf`.

---

### B) Das Statthalter-Team

**Ziel:** Der Spieler gibt jeder Region einen **Auftrag und ein Budget**. Der Statthalter arbeitet ihn selbständig ab, richtet sich zusätzlich nach der **reichsweiten Bedarfsliste** (Moritz' Zusatz) und meldet sich gebündelt.

**1. Aufträge (Erweiterung von `GOV_DIR`, höchstens 7 sichtbar):**

| Auftrag | Schlüssel | baut bevorzugt | handelt außerdem |
|---|---|---|---|
| Aufbau | `grow` (bestehend) | Nahrung, Waren für Siedlungen, Aufstieg | Aufstieg zuerst |
| Wirtschaft und Handel | `eco` (bestehend) | Markt, Betriebe, Kontor, Straße | **arbeitet die Bedarfsliste mit doppeltem Gewicht ab** |
| Steuern | `tax` (neu) | Markt, Bank, Zunfthaus | regionale Steuerstufe +1 (Steuern +10 %, Ordnung −0,5), senkt sie selbst wieder bei Ordnung < 1 |
| Ordnung | `ord` (bestehend) | Tempel, Theater, Wirtshaus | hält Feste (`holdFest`) bei Ordnung < 0, senkt die regionale Steuer bei Unruhe |
| Verteidigung | `mil` (bestehend) | Mauern, Kaserne, Grenzbefestigung, Burg | verstärkt die Garnison bei Bedrohung (Gold, bis 125 % `garMax`) |
| Glaube | `fai` (neu) | Tempel, Kloster, Kulturbauten | fördert Bekehrung und Angleichung (Bonus wie Festplatz) |
| Nur verwalten | `hold` (= heute „Selbst bauen: aus“) | nichts | wirkt nur auf Ordnung und Verwaltungsgrenze |

**2. Reichsweite Bedarfsliste (neu, `empireNeeds(f)`), einmal je Runde berechnet und gecacht:**
```js
needs = [ {g:'holz', miss:2.4, prio:4.1, why:'Bauten und Werkzeug', fix:[{k:'build',key:'lumber',pi:..}, {k:'procure',g:'holz'}]},
          {g:'gold', prio:2.0, why:'Bilanz −15/Runde', fix:[{k:'build',key:'market',pi:..}]},
          {g:'tuch', miss:0.8, prio:1.6, why:'Marktflecken wachsen nicht', ...}, ... ]
```
- **Quellen** (alles da):
  - `F.eco.prod/use` (Erzeugung und Verbrauch)
  - `ecoHints` (Engpässe)
  - `E.needR` (Bedarf der Siedlungen)
  - `goodsCost`-Aufpreise der letzten Runden (Messgröße: `F.surPaid`, neu)
  - `moneyLeaks`
  - Bilanz aus `income(f)`
  - geplante Aushebungen (Waffen, Pferde, Pulver)
- **Priorität** = Fehlmenge × Preis × Wichtigkeit (Nahrung ×3, Baustoffe ×2, Siedlungsbedarf ×1,5, Luxus ×1). Dazu kommt „was gutes Geld bringt“: Ware mit hohem Preis × eigener Standortvorteil (Lagerstätte, Weide, Wein) ohne Betrieb → Exportchance mit Priorität = Preis × Ertrag × `saleRate`.
- **Statthalter nutzen sie in `govRound`:** `sc = buildScore(...) + Auftragsbonus + needBonus(key)`, wobei `needBonus` = Priorität der Ware, die der Betrieb liefert, sofern die Provinz das kann (`need(feat(pi))`). **Koordination:** Ist ein Bedarf schon von einem Bau gedeckt (läuft irgendwo), sinkt seine Priorität sofort, damit nicht fünf Statthalter gleichzeitig Holzfäller bauen (`needs[g].claimed += Ertrag`).
- **Sichtbar** als Liste „Was dem Reich fehlt“ im Wirtschaftsfenster (Übersicht oben) und im Reichsverweser-Bericht: „Holz −2,4 · Statthalter Gallien baut Holzfäller (fertig in 2 Runden) · Rest über Handel: Beschaffen“.

**3. Budget statt globaler Reserve:**
- Je Statthalter eine Stufe **Sparsam / Normal / Großzügig** = 15 / 30 / 50 % der Steuereinnahmen der Region fließen in eine **Regionskasse** `G.pot`. Die Obergrenze liegt bei 6 Runden, alles darüber fließt zurück in den Staatsschatz.
- Der Statthalter gibt nur aus `G.pot` aus. Fehlt Gold im Staatsschatz (unter 0), friert die Kasse ein. **Vorteil:** Der Spieler sieht genau, was das Team kostet, und es entsteht kein Wettlauf zwischen Statthaltern um dasselbe Gold.
- Übergangsoption: Wer nicht umstellen will, nutzt „Normal“, das entspricht ungefähr der heutigen Regel (40 % Grenze, Reserve).

**4. Person, Erfahrung, Treue (Erweiterung des `G`-Objekts):**
```js
G = { n, s, t, face, dir, auto, since, fam?,           // bestehend
      age, tr:[t, t2?], xp:0, lvl:1–4, loy:60, amb:0–100, pot:0, bud:'mid',
      rep:{t0, built:[], gold:0, ord0, notes:[]} }      // Berichtsdaten
```
- **Erfahrung:** +1 je Runde, +3 je fertigem Bau, +5 je Aufstieg, +5 je 10 Runden ohne Unruhe. Stufen bei 30/80/150 → `s` +1. **Verdiente Eigenschaften** funktionieren wie `DEEDS` bei Feldherren: 8 Bauten → „Bauherr“, 15 Runden Ordnung > 3 → „Gerecht“ (Ordnung +0,5), viel Steuer → „Rechner“ (Steuern +5 %).
- **Gefolge** (`GOV_RET`) wird **kaufbar** (wie `addRetinue` bei Feldherren) statt nur zufällig: Steuereintreiber, Baumeister, Richter, neu Zollmeister (Handel +5 % in der Region) und Hauptmann (Garnison +20 %).
- **Treue** `loy` (0–100), Zielwert je Runde (Formel wie `shoRound`):
  - Basis 60
  - Familie +20, treu +15
  - Gehalt pünktlich +0, bei Bankrott −15
  - Beförderung kürzlich +10
  - **Ehrgeiz** `amb` × (Größe der Region / 6) × Entfernung zur Hauptstadt / 4, als Abzug
  - Adel unzufrieden (`POL.adel` < 30) −10
  - Lehen in der Region −5
  - Herrscher schwach/Regentschaft −10
  - Sieg/Prestige +5
- **Folgen:**
  - `loy` < 40 → **Korruption**: 5–15 % der Regionssteuern verschwinden. Das erscheint in `moneyLeaks` („Statthalter X zweigt 14 Gold ab“) und ersetzt den Bug „gierig“. „Gierig“ selbst gilt fest mit 10 %, wie beschrieben.
  - `loy` < 20 und `amb` > 60 und Region ≥ 3 Provinzen → **Abfallwarnung** (2 Runden Vorlauf, Reichsverweser-Vorschlag). Optionen: Ehrung/Gold (+25 Treue), Abberufen (Unruhe +1 in der Region), Heer in die Hauptprovinz der Region (verhindert den Abfall).
  - Ohne Reaktion: 30 % Abfall → Provinzen der Region werden über `weltLoose` frei bzw. bilden einen Gegenkönig wie `dynRevolt` (bei Familie).
  - **Nur ab Schwierigkeit „Normal“, einstellbar, und nie in den ersten 30 Runden.**
- **Familie bevorzugt:** Familienmitglieder (`dynMakeGov`) haben hohe Treue, aber ein Erbe als Statthalter einer großen Region kann Anspruch erheben, wenn der Herrscher schwach ist (`dynRival` gibt es). Das ist ein bewusstes Spannungsfeld: sicher, aber politisch heikel.
- **Befördern** (Gold, `s`+1 höchstens bis zur Erfahrungsstufe, Treue +10) / **Versetzen** (in eine andere Region, Erfahrung bleibt) / **Abberufen** (wie heute; Treue der anderen Statthalter −3, bei Familie Ärger im Haus).

**5. Zusammenspiel mit bestehenden Systemen:**
- **Daimyō (Shogunat):** Der Statthalter heißt Shugo (`OFF_T` gibt es). Der Zielwert `P.dl` der Provinzen seiner Region wird um `(G.loy−50)/5` verschoben. Sankin-kōtai hebt auch die Statthaltertreue (+15). Ein Daimyō-Abfall bleibt provinzweise, ein Statthalter-Abfall regionsweise. Beides wird in der Region getrennt angezeigt.
- **Lehen/Satrapien:** Lehen-Provinzen zählen zur Region, werden aber vom Lehnsmann verwaltet. Der Statthalter baut dort nicht, sein Ordnungsbonus wirkt aber. Satrapen in persischen Reichen *sind* lokale Statthalter: Eine Satrapie-Provinz ohne Regionsstatthalter zeigt den Satrapen als Person (Treue = Adel).
- **Ordnung und Steuern:** Neue Zeilen in `orderParts` („Statthalter X, Stufe 2: +1“, „regionale Steuer: −0,5“), Korruption in der Steueraufschlüsselung.
- **Verwaltungsgrenze:** wie heute +2 je Statthalter. Neu: +1 zusätzlich ab Statthalter-Stufe 3, das belohnt erfahrene Leute.
- **Reichsverweser (Amt):** seine Stufe gibt allen Statthaltern +10 % Erfahrung je Stufe und macht den Bericht ausführlicher (ab Stufe 2 mit Empfehlung).

**6. Rundenbericht (ersetzt die Einzelzeilen `addLog` je Bau):**
- Alle **X Runden (Einstellung 3 / 5 / 10, Standard 5)** gibt es eine Karte „Berichte der Statthalter“ in der bestehenden Kette nach `showReport` (ohne eigenes Modal, als Abschnitt im Rundenbericht). Je Region **eine Zeile**:
  `Gallien · Gaius (Stufe 2, Aufbau, Treue 72) · 3 Bauten (Markt II, Holzfäller, Mühle) · 210 Gold aus der Regionskasse · Ordnung 2,1 → 2,8 · Sorge: Aquitanien braucht Tuch` mit den Knöpfen [Region] [Auftrag ändern].
- **Sofortmeldungen** gibt es nur bei: Aufstand droht, Abfallwarnung, Feindheer in der Region, Regionskasse leer bei dringendem Bedarf. Alle anderen bisherigen Logzeilen landen im Bericht (`G.rep`).
- **UI-Skizze Regionsfenster:** Statthalterkarte mit Porträt, Stufe, Erfahrungsbalken, Treue-Balken, Eigenschaften und Gefolge. Darunter die **Auftragsleiste** (7 Knöpfe wie die heutige `seg govdir`), die **Budgetleiste** (3 Knöpfe) mit Regionskasse „124 Gold“ und eine Zeile „Arbeitet gerade an: Holzfäller in Narbonensis (Reichsbedarf Holz)“. Knöpfe: Befördern · Gefolge · Versetzen · Abberufen.
- **Reichsübersicht** (Hof → neuer Reiter „Statthalter“): Tabelle aller Regionen mit Statthalter, Auftrag, Budget, Treue und letzter Leistung. **Hier verwaltet der Spieler sein Team in einer Minute.**

**Aufwand B:** Bedarfsliste m · Aufträge plus Budget m · Person, Erfahrung, Treue, Korruption m · Abfall m · Bericht m · Übersicht k–m · **gesamt g** (größter, aber spielerisch wichtigster Block).
**Risiken:** Ein Abfall frustriert, deshalb Vorwarnung, Abschaltoption und Mindestgröße. Die Regionskasse verändert die Wirtschaftsbalance (Test mit 3 Spielständen). KI: dieselbe `govRound`-Logik, aber **Treue und Abfall zunächst nur für den Spieler**, die KI bekommt nur Bedarfsliste und Budget „Normal“ (vorsichtig).

---

### C) Kleinteiligere Gebäude, Waffen und Kanonen als Ware

**Neue Waren (nur 3, sonst wird es unübersichtlich):**

| Ware | Schlüssel | Preis | ab | Herkunft |
|---|---|---|---|---|
| Salpeter | `salpeter` | 3 | Epoche 2 | Salpetersiederei (überall mit Gutshof oder Weide, historisch aus Stallmist); Lagerstätte „Salpeter“ in Bengalen/Bihar (Epoche 3), Atacama (Epoche 4) |
| Pulver | `pulver` | 6 | Epoche 2 (China ab Epoche 1 mit Forschung) | Pulvermühle: 1 Salpeter + 1 Holz (Holzkohle) → 2 Pulver, braucht Fluss (Wassermühle) |
| Geschütze | `geschuetz` | 12 | Epoche 2 | **Kanonengießerei** (Stückgießerei): 2 Metall (Bronze; ab Epoche 4 Eisen) + 1 Holz → 1 Geschütz, ab Stadt (`BLVL` 3) |

Die bestehende Ware „Waffen“ bleibt für Blank- und Handfeuerwaffen. Bronze ist weiterhin „Metall“ (Kupfer+Zinn = Erz). Eine eigene Bronze-Ware lohnt den Aufwand nicht.

**Neue Betriebe** (in `BETRIEBE`, `kind:'b'`, belegen Betriebsplätze, also Spezialisierung):
- `salpeterei` Salpetersiederei · `pulvermuehle` Pulvermühle · `giesserei` Kanonengießerei (Namen je Epoche über `BNAMES`: Epoche 2 „Büchsengießerei“, Epoche 3 „Stückgießerei“, Epoche 4 „Kanonengießerei“; Osmanen `BNAMES_CUL` „Tophane“)
- optional später: `zeughaus` Zeughaus (Gebäude, nicht Betrieb): Lager +20 für Waffen, Pulver und Geschütze, Aushebungswaren −25 % in dieser Provinz, Voraussetzung für Artillerie III / Haubitzen

**Aushebung (`RG` wird abhängig von Variante und Epoche, Funktion `recGoods(f,role,v)`):**

| Einheit | heute | neu |
|---|---|---|
| Speer/Pike | Waffen 1 | unverändert |
| Schwert | Waffen 2 | unverändert |
| Fernkampf ohne Pulver | Holz 1 | unverändert |
| Fernkampf **mit Feuerwaffe** (`st.gun`/arkebus, janits, jaeger, Musketen) | Holz 1 | **Waffen 1 + Pulver 1** |
| Artillerie Antike (torsion) | Metall 3 | Holz 2 + Metall 1 |
| Artillerie ab Epoche 2 (bombarde, topcu, feldkan, haubitze) | Metall 3 | **Geschütze 1 + Pulver 2** (topcu Geschütze 2) |
| Modernisieren von Feuerwaffen-Einheiten | Waffen 2 | Waffen 1 + Pulver 1 |

- Fehlt eine Ware, zahlt man wie heute **Aufpreis** (`goodsCost`). Ausheben bleibt also immer möglich, ist nur teurer. Das ist der Kern der Spielerfreundlichkeit.
- **Optional (Stufe 3): Pulverversorgung in der Schlacht.** Nach einer Schlacht mit Feuerwaffen werden 0,5 Pulver je Einheit verbraucht. Bei Lager 0 haben Feuerwaffen 25 % weniger Fernkampfkraft (Anzeige vor der Schlacht). Nur einbauen, wenn Stufe 1–2 gut funktionieren.

**Epochen- und Kulturbezug:**
- **Neue Welt** (`indNoGun`): Pulvermühle und Gießerei sind ausgeblendet, solange `F.gun` fehlt. Danach Pulver nur über Handel/Beute, die Gießerei erst ab Epoche 4. Der Rat schlägt dort nie Pulver vor, sondern Obsidian- bzw. Bronzewaffen (= Waffen).
- **China:** Pulvermühle ab Epoche 1 mit eigener Forschung „Feuerarznei“. **Osmanen:** Tophane mit Geschütze ×1,5. **Habescha/Japan:** keine eigene Pulvermühle bis Epoche 4 (historisch Import), dafür liefern ihnen KI-Partner gezielt (Lieferauftrag). Das gibt dem Beschaffungsfenster (s. unten) Bedeutung. **Indien:** Salpeter-Lagerstätte = Exportgut. **HRR/Nürnberg:** Gießerei-Bonus (+25 %) in Provinzen mit Metall-Lagerstätten, Bezug zum Sonderkapitel Nürnberg (Rotschmiede, Geschützgießer).
- **Waffenembargo** (historisch: päpstliches Verbot von Waffenhandel mit Muslimen) als Ereignis in `aiEmbargo` bzw. im Kirchensystem (`kirOn`): Lieferung von Waffen, Pulver und Geschützen an Andersgläubige verärgert den Klerus.

**Übersicht bewahren:**
- In der Warenliste eine **Gruppe „Rüstung“** (Waffen, Pferde, Salpeter, Pulver, Geschütze), eingeklappt, mit einer Ampel je Ware (Vorrat in Runden Aushebung).
- **Rüstungsvorrat halten:** Je Ware ein Zielwert (Standard aus), z. B. Pulver 10. Unterschreitet der Bestand den Wert, kauft der Kanzler automatisch über `importGoods` mit Vorrang oder am Markt (Preis × 1,5) nach. Das erweitert das bestehende `F.hold`.
- Mangel löst **einen** Hinweis aus: einen Feldherr-Vorschlag „Pulver reicht für 2 Einheiten – beschaffen?“ oder den bestehenden Todo-Chip `need`. Es gibt keine Logzeile je Runde.
- „Woher?“ (`goodSrcHtml`) und die Kettenansicht (`ECO_CHAINS`) bekommen die neuen Ketten automatisch, wenn sie in `ECO_CHAINS` eingetragen werden.

**Aufwand C:** Waren plus Betriebe plus Ketten k · `recGoods` plus Varianten-Zuordnung k–m · Kulturregeln k · Zeughaus k · Rüstungsvorrat k · Schlacht-Pulver m (optional) · Bilder: 3 Warensymbole + 3 Betriebsbilder (Bildliste). **Gesamt m.**
**Risiken:** Höhere Kosten für Feuerwaffen-Armeen in Epoche 3–4. Die KI muss die neuen Ketten bauen (`buildScore0` analog zu Waffen: `if(g==='pulver'&&...)`). Sonst zahlt sie dauernd Aufpreis, was die Gold-KI schwächt. Darum `RG`-Werte zuerst mild ansetzen (Pulver 1 statt 2) und mit Testläufen nachjustieren.

---

### C2) Zusatz Moritz: „Mir fehlt Ware X → gezielt beschaffen“

**Ist-Befund:**
1. Import passiert **unsichtbar automatisch** (`importGoods`): nur bei bestehenden Handelspartnern, höchstens 1,5 je Partner, begrenzt durch die Routenkapazität. Fehlt ein Partner mit Überschuss, passiert nichts.
2. Mangel sieht man an drei Stellen: im Wirtschaftsfenster unter „Engpässe“, im Todo-Chip „braucht Ware“ (Bild `ui_export`) und am roten Aufpreis beim Bauen.
3. „Woher?“ listet zwar Lieferanten mit Überschuss, führt aber nur ins allgemeine Diplomatiefenster. Dort gibt es einen pauschalen Handelsvertrag ohne Warenbezug, und ob danach wirklich Holz ankommt, bleibt unklar.
4. Lieferaufträge gibt es nur als Export (Partner bestellen bei dir).
5. `ui_import` ist das Symbol für den Spielstand-Import.

**Lösung: Fenster „Ware beschaffen“ (`openProcure(g)`)**, erreichbar über
- den Todo-Chip „Holz fehlt · beschaffen“ (neues Bild `ui_beschaffen`),
- den Kanzler-Vorschlag (Annehmen → öffnet vorbelegt),
- den Knopf „Beschaffen“ in jeder Warenzeile (neben „Woher?“ und „Horten“),
- den roten Aufpreis-Chip beim Bauen.

Aufbau des Fensters (Beispiel Ägypten, Epoche 0, Holz):
```
🪵 Holz beschaffen                     Fehlt: 2,4 je Runde · Lager 1 · Aufpreis bisher 85 Gold
① Schon unterwegs   Kein Partner liefert Holz.
② Lieferanten       (sortiert: bester zuerst)
   [Wappen] Seleukiden   Überschuss 3,1 · ⚓ Seeweg 3 Etappen · Preis 0,9/Einheit · Beziehung +24
            ✔ Würde zustimmen (Interesse 2,6)        [Liefervertrag: 2 Holz/Runde · 12 Runden · 2 Gold/Runde]
   [Wappen] Karthago     Überschuss 1,8 · ⚓ 5 Etappen · Preis 1,0 · Beziehung +5
            ✖ Kein freier Handelsplatz bei Karthago   [Geschenk senden] [Später]
   [Wappen] Nabatäer     Überschuss 0,6 · 🛤 2 Etappen …
③ Selbst erzeugen   Holzfäller möglich in: Delta (Wald 1) [Bauen] · Statthalter Unterägypten beauftragen [Auftrag: Wirtschaft]
④ Erobern/anschließen  Zypern (Wald 3, frei) [Zeigen]
```
- **Neuer Vertragstyp „Liefervertrag“ (Importauftrag, Spiegel von `S.contracts`):**
```js
{id, to:me, from:x, g:'holz', amt:2 /*je Runde*/, price:2 /*Gold je Runde*/, dur:12, st:'active', kind:'imp'}
```
  - Ausführung in `contractRound`: je Runde `min(amt, Überschuss von x, Lager von x − 2, freie Routenkapazität)`. Bezahlung nur für Geliefertes, Preis = Marktpreis × 0,9 (Rabatt gegenüber 0,8+Aufpreis), Beziehung +1 je 4 Runden. Verfehlt der Lieferant, endet der Vertrag ohne Strafe, und eine Meldung schlägt einen anderen Lieferanten vor.
  - **Voraussetzung:** Ein Handelsvertrag mit x ist nötig. Fehlt er, schließt **ein Tipp** beide ab („Handelsvertrag + Liefervertrag“), sofern `tradeEval` ok ist. Belegt einen Handelsplatz (`tradeSlots`). Dadurch werden Handelsplätze zu einer bewussten Wahl: „Wen brauche ich wofür?“
  - **Route:** Kapazität aus `routeInfo`. Reicht sie nicht, wird „Route ausbauen“ direkt angeboten.
- **Ablehnungsgründe immer im Klartext** (aus `tradeEval.parts`: Beziehung, Grenze, Handelsplätze, Erzfeind) mit einem Weg dorthin („Geschenk +10 Beziehung“, „Markt bauen = +1 Handelsplatz“).
- **Lieferanten finden:** alle bekannten Reiche (`knows`) mit `prod−use ≥ 0,3` für g. Dazu kommen **freie Städte/Stadtstaaten mit Hafen** als Händler (kleiner Überschuss, teurer: Preis × 1,2). So hat man auch ohne große Nachbarn eine Quelle. Das passt historisch: Ägypten bezog Libanon-Zeder über Byblos.
- **Sichtbarkeit von Import und Export im Handel-Reiter:** zwei Spalten **„Kommt herein“** (Ware, Menge, von wem, Kosten) und **„Geht hinaus“** (Lieferaufträge, Verkauf über der Lagergrenze). Die Routenkarte zeigt Warensymbole auf der Linie. Die heutige unsichtbare `importGoods`-Lieferung wird dort als „automatisch“ geführt.
- **Starthilfe:** Völker mit typischem Startmangel (Ägypten: Holz; Steppe: Holz/Stein; Venedig: Getreide) bekommen in Runde 2–5 einen Kanzler-Vorschlag „Holz beschaffen“, historisch begründet („Seit alters holt Ägypten Zedernholz aus der Levante“).

**Aufwand C2:** Fenster m · Liefervertrag in `contractRound` k–m · Handel-Reiter Ein-/Ausgang k · Einstiegspunkte (Chip, Knopf, Vorschlag) k · **gesamt m**. **Risiken:** gering. Der KI-Handel bleibt unverändert, die KI nimmt Lieferverträge nur an, wenn `tradeEval` ok ist und Überschuss da ist. Gegen einen Gold-Exploit hilft ein Preis von mindestens 1 Gold je Einheit.

---

### D) Bauplätze und paralleles Bauen

**Befund:** Bauplätze gibt es schon (`slotsOf`, `betrSlots`):

| Stufe | Bauplätze | Betriebsplätze |
|---|---|---|
| Dorf | 2 | 2 |
| Marktflecken | 3 | 3 |
| Stadt | 4 | 4 |
| Großstadt | 5 | 5 |
| Metropole | 6 | 6 |

Hauptstadt +1, Burg +1 Bauplatz. Straße, Grenzbefestigung und Karawanserei sind frei. Bei ~31 Gebäuden bedeutet das schon heute: **Man kann nicht überall alles haben.** Dass es sich nicht so anfühlt, liegt an der Darstellung, nicht am Regelwerk.

**Vorschlag 1: Spezialisierung sichtbarer machen statt neuer Regeln (k):**
- Im Baumenü oben „Bauplätze 3/4 · Betriebe 2/4“ als Kästchen anzeigen (Bilder der belegten Gebäude, leere Rahmen).
- Mit Vorlagen (`TPL`) zu einer „Prägung“ verbinden: Handelsstadt, Festung, Gelehrtenstadt. Das gibt es als `tpl` und `SWAY`, es fehlt nur die Anzeige. Ein Ratsvorschlag „Mach X zur Handelsstadt“.
- Kleiner Feinschliff: Dorf 2 → **1 Bauplatz + 2 Betriebe** (Dörfer produzieren, Städte verwalten). Das wirkt nur für neue Spiele (s. Migration).

**Vorschlag 2: Zweite Baustelle (paralleles Bauen):**
- **Wer:** Großstadt und Metropole **automatisch 2 Baustellen**. Darunter nur 1. Ausnahmen geben +1 (höchstens 2): Hauptstadt ab Stadt, Statthalter-Eigenschaft „Bauherr“ Stufe 3, Baumeister-Amt Stufe 3 (nur Hauptstadt). Burgen bleiben bei 1. Begründung: Garnisonsstadt, und das macht die Wahl Burg/Stadt bedeutsamer.
- **Kosten:** Die zweite Baustelle hat keinen Aufpreis, aber **Baustoffe werden gleichzeitig fällig** (Holz, Stein, Ziegel aus `buildGoods`). Das bremst natürlich über die Warenwirtschaft, und das Gold bleibt die Hauptbremse.
- **Für:**
  - Große Städte fühlen sich groß an.
  - Weniger Leerlauf und Warten.
  - Weniger Tippen am iPad.
  - Statthalter können Aufstieg und Bau gleichzeitig.
  - Belohnt den Aufstieg zur Großstadt (Moritz' Rome-2-Gefühl).
- **Wider:**
  - Der Schneeballeffekt für reiche Spieler steigt (abgemildert, weil nur wenige Großstädte existieren).
  - Hoher Umbau: 125 Stellen `.build`.
  - Die KI baut schneller und muss mit.
  - Die UI muss zwei Fortschrittsbalken zeigen.
  - Ein Abbruch braucht einen Index.
- **Technik (risikoarm):**
  - `P.build` bleibt die **erste** Baustelle, neu kommt `P.build2` (gleiche Struktur). Alle bestehenden 125 Stellen funktionieren unverändert für Baustelle 1.
  - Nur angepasst werden:
    - `canBuild`: „Es wird bereits gebaut“ → frei, wenn `buildSlotsFree(pi)>0`; derselbe Schlüssel nicht doppelt.
    - `startBuild`: in `build`, sonst in `build2`.
    - Rundenfortschritt in `newRound` (Kopie des `P.build`-Blocks für `build2`, danach nachrücken: `if(!P.build&&P.build2){P.build=P.build2;P.build2=null}`).
    - `slotsUsed`/`betrUsed` (Bau in `build2` mitzählen).
    - `cancelBuild(pi,i)`, `buildRefund`.
    - Anzeige im Provinzpanel und im Baumenü.
    - `govRound`/`aiEconomy`-Prüfung `if(S.prov[pi].build)continue` → `if(!buildSlotsFree(pi))continue`.
    - Warteschlange `P.q` startet bis zu 2.
  - Alle anderen Lesestellen (`P.build&&...` für Anzeige, Krieg, Eroberung `transferProv` setzt `P.build=null`) müssen zusätzlich `build2` löschen. Das ist eine gezielte grep-Liste (~15 Stellen).
- **Balance:** Bauzeiten bleiben gleich. Zu beobachten ist die Goldkurve der KI in Epoche 3–4. Falls nötig, gilt die zweite Baustelle für die KI erst ab Metropole.
- **Migration:** Bestehende Gebäude über einem eventuell neuen Platzlimit **bleiben** (keine Löschung). `slotsUsed > slotsOf` zeigt dann „überbelegt, keine neuen Bauten“. Alte Spielstände kennen `build2` nicht (undefined = frei). Die Dorf-Änderung (1 Bauplatz) wirkt nur bei `S.v >= neu`, sonst bleibt die alte Formel.
- **KI:** `aiEconomy` nutzt automatisch den zweiten Platz. Zur Sicherheit bekommt der zweite Platz für die KI einen Mindestgoldbetrag (`F.gold > 400*EPOCH_COST`).

**Aufwand D:** Anzeige und Spezialisierung k · zweite Baustelle m · Migration k. **Risiken:** übersehene `P.build`-Stellen, die dann Baustelle 2 ignorieren (zum Beispiel bei Eroberung). Deshalb Testliste: Erobern, Abbrechen, Epochenwechsel, Umbau zu Burg/Stadt (`kindRound`), Speichern/Laden, Mehrspieler.

---

## 3. Empfehlung: Reihenfolge

**Stufe 1 – „Das Team spürt man sofort“ (größter Spaß, mittlerer Aufwand)**
1. Bedarfsliste `empireNeeds` + Fenster **„Ware beschaffen“** + Liefervertrag (C2). Das löst Moritz' konkretes Ägypten-Holz-Problem und liefert die Grundlage für Rat und Statthalter.
2. **Statthalter-Bericht** statt Logzeilen, **Aufträge erweitert** (Steuern, Glaube, Nur verwalten), Statthalter arbeiten die Bedarfsliste ab, **Bug „gierig“** beheben.
3. **Ratskarte mit 15–20 sicheren Regeln** (Kanzler, Feldherr, Reichsverweser zuerst), Ein-Tipp-Annahme, Abklingzeiten, Einstellung Rat aus/dringend/normal. Stimme zunächst über die Gerätestimme (läuft sofort), die XTTS-Pakete kommen nach.

**Stufe 2 – „Menschen mit Geschichte“**
4. Person für Minister und Statthalter (Alter, Erfahrung, Treue, Haltung), Minister überleben den Epochenwechsel, Familie im Rat.
5. Budget/Regionskasse, Befördern, Gefolge kaufen, Hof-Reiter „Statthalter“ (Teamübersicht).
6. Kulturleitlinien `DOCTRINE` plus restliche Regeln (bis ~60), XTTS-Sätze (400 Clips) erzeugen und einbinden.
7. Pulver, Salpeter, Geschütze, Kanonengießerei, `recGoods`, Rüstungsvorrat (C).

**Stufe 3 – „Größe und Risiko“**
8. Zweite Baustelle für Großstadt/Metropole plus Bauplatzanzeige (D).
9. Korruption und Abfall von Statthaltern (mit Vorwarnung, abschaltbar).
10. Optional: Pulver in der Schlacht, Zeughaus, Waffenembargo-Ereignis.

---

## 4. Offene Entscheidungsfragen an Moritz

1. **Wie viele Ratsvorschläge je Runde?** *Empfehlung:* normal 1–2, höchstens 3 bei Krise, keine Modale, nur Todo-Chip plus Ratskarte.
2. **Darf ein Statthalter abfallen (Region verloren)?** *Empfehlung:* ja, aber erst Stufe 3, mit 2 Runden Vorwarnung, nie in den ersten 30 Runden, in den Einstellungen abschaltbar. Davor nur Korruption als sichtbarer Geldverlust.
3. **Budget der Statthalter: eigene Regionskasse (15/30/50 % der Regionssteuer) oder weiter die globale Reserve?** *Empfehlung:* Regionskasse. Sie ist klarer und verhindert, dass Statthalter das ganze Gold verbauen.
4. **Wie oft sollen Statthalter berichten?** *Empfehlung:* alle 5 Runden, einstellbar 3/5/10, Sofortmeldung nur bei Gefahr.
5. **Stimmen: 2 je Amt (10 Stimmen, ~400 Clips, ~5 MB) oder eine eigene Stimme je Person?** *Empfehlung:* 2 je Amt plus 1 Frauenstimme. Personen bekommen beim Ernennen fest eine davon. Eigene Stimmen je Person sprengen Umfang und Speicher.
6. **Feuerwaffen-Kosten: Pulver und Geschütze als Pflichtware (mit Aufpreis bei Mangel) oder nur als Rabatt („mit Pulver 20 % billiger“)?** *Empfehlung:* Pflichtware mit Aufpreis wie bei Waffen heute. Das ist konsequent und wird nie zur Sperre. Pulver in der Schlacht erst später.
7. **Paralleles Bauen: automatisch ab Großstadt (2 Baustellen) oder nur über Gebäude/Forschung/Eigenschaft?** *Empfehlung:* automatisch ab Großstadt (nicht Burg), dazu Hauptstadt ab Stadt. Ohne Aufpreis, die Baustoffe bremsen.
8. **Dörfer verkleinern (1 Bauplatz + 2 Betriebe) für mehr Spezialisierung?** *Empfehlung:* ja, aber nur für neue Spielstände. Alte Stände behalten alles, überzählige Gebäude bleiben stehen.
