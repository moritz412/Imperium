# Konzept: Heer & Feldzüge vertiefen (Stand v129, nur gelesen)

## 1. Ist-Stand (mit Funktionsnamen)

### Heere
- **Aufbau:** `createArmy`, max. 10 Einheiten (`units.length<10` an 8 Stellen hart codiert). Einheiten über `newUnit`, Grundrollen `ROLES` (spear/sword/missile/cav/art) plus viele Kulturvarianten `VARIANTS` (z. B. condott, sipahi, azab, topcu, conquist, mongpanz, jaguar/jani …), freigeschaltet über `typeAvail`/`variantsNow`, Kaserne (`canRecruit`, `bar`).
- **Stärke:** `armyPower` = Einheiten × Tech (drill/iron, atk/def) × Feldherr (`genFx`) × Reiterbonus. `compBar` zeigt Zusammensetzung.
- **Zusammenlegen:** `mergeArmies` (KI automatisch; Spieler beim Marsch in Provinz mit eigenem Heer, `orderMove`), Aufteilen per `data-act="split"`.
- **Bewegung:** `maxMP`, `reachMap`, `marchTo`, Umstellen in Provinz (`localCost`).
- **Haltungen** `STANCES`: Gewaltmarsch, Befestigt, Hinterhalt, Plündern, Belagerung (`canStance`, `setStance`, `stanceDef`, `raidTarget`).
- **Schlachtplan** `PLANS` (frontal/umfassung/hinterhalt, `planMul`) – nur für automatische Schlacht.
- **Belagerung:** `canSiege`, `startSiege`, `siegeRound`, `siegeMul` (−12 %/Runde, max −50 %), Belagerungsgerät `siegeEq/siegeNeed`, Sturm `stormOk`, Ergeben nach ≤ 8 Runden.
- **Versorgung:** `supplyRound` (−2 %/Runde, wenn > 2 Provinzen von eigenem/verbündetem Land; Tümen/Aufgebote/Plünderer ausgenommen), `attritionOf/attritionRound` (Wüste, Kälte, Hunger, Winter nördl. 44°, Grenzfestung, Gewaltmarsch, Lagerseuche; Quartiermeister halbiert).
- **Auffüllen:** `replenish` (7 % + Kaserne + ruhend + Befestigt + Winterquartier `winterQ` + Gefolge).
- **Sold:** in `income()` (`uStat().upk`, Feldherr/Gefolge, Winterquartier −20 %, Tech, +15 % je Heer über `armyCap`).
- **Heereszahl:** `armyCap` = 4 + Rang + Provinzen/6 + Amt Heermeister; Spieler darf überziehen (`canNewArmy`), zahlt dann `armyOver`-Aufschlag.
- **Rekrutierung:** pro Provinz `P.rec` Plätze (`recMax` = 2 + Kaserne 0/1/2/4 + Mark), Kosten `recruitCost`, Waren `recGoods`.

### Epochen-Aufgebote (Heeresverfassung ansatzweise vorhanden)
- Ep. 1 **Heerbann** `heerbann` (Frühjahr, 3 Runden, Speerträger, `a.levy`).
- Ep. 2 **Heerfolge/Lehnsaufgebot** `heerfolge` (Ritter je Lehen, 12 Runden, Verweigerung nach Adel `polOf`).
- Ep. 3 **Drill** `drillRound` (+3 XP/Runde im eigenen Land).
- Ep. 4 **Nationalgefühl/Massenaushebung** `natOf`, `levee` (Volksheer, Ordnung −1).
- Steppe **Tümen** `tumen()` (≥ 70 % Reiter: keine Versorgungsverluste).
- `levyRound` entlässt Aufgebote; KI nutzt `aiLevies`.

### Feldherren
- `newGeneral` (1 positive + 35 % negative Eigenschaft), `GEN_TRAITS` (20 Eigenschaften, davon 6 „earned“).
- **Taten → Eigenschaften gibt es schon:** `DEEDS` + `genDeed` (4 Siege → Sieggewohnt, 3 Abwehren → Bollwerk, 3 Städte → Städtebezwinger, 3 Plünderzüge → Plünderer, 3 Niederlagen → Glücklos, 3 Rückzüge → Zauderer, 6 Erfolge ohne Niederlage → Unbesiegt), Anzeige `deedHtml`.
- Stufen `GEN_LV` (bis 6), `genXP`: jede 2. Stufe neue Eigenschaft, Stufe 5 legt Schwäche ab.
- **Gefolge** `RETINUE` (7 Begleiter, max 3, kaufbar in eigener Stadt, 20 % Zufall nach Sieg `retinueOnWin`).
- Porträt `genPortrait` (nur 10 Epochenbilder, keine Kultur).
- Kein Alter, kein Tod außer Heeresvernichtung; beim Epochenwechsel ersetzt `genOf` alte Feldherren (Stufe −2). Seit heute: Alter nur bei Adoption (`a.gen.age`).

### Einheiten
- Ränge `RANKS` (Rekruten → Legendär über `u.xp`), Ausrüstung `EQ_NAMES` (Waffen/Rüstung 3 Stufen), Aufwertung `up:[]`.

### Schlachten
- Automatisch: `resolveAttack`/`startAttackCtx`, `applyLoss`, Odds-Anzeige `oddsText`.
- Echtzeit: `startBattle` → `BATTLE` (Moral `moraleStep`, Lasso, Front ziehen, Rückzug, „Automatisch beenden“ `autoFinish`).
- Spieler wählt pro Angriff „Berechnen“ oder „Schlacht schlagen“.

### Flotten
- `S.fleets`, `fleetRange`, `navalBattle`, `blockaded`, `seaBlocked` (Meerengen), Landungen (`aiLandingPass`), Boote `a.boat`, `fleetUpk`.

### KI-Kriegsführung (`aiFaction`)
- Rekrutiert bis Kappe (Front bevorzugt), Varianten 50 %, `aiLevies`, Entsatz `aiRelief`.
- Angriff, wenn Verhältnis ≥ 1,3 (frei 1,6; Spieler `dif().need`), Belagerung zu 30 %, Plündern zu 25 %, sonst Befestigen/Hinterhalt bei Bedrohung, Verlegen zur Front, Durchzug `trespass`.
- „Erzfeind“-Feldzüge `S.nem` + `campStep` (Heer mit Ziel `a.camp`).
- Frieden `makePeace` (Waffenstillstand 10, Tribut/Gold). **Kein Kriegsstand, keine Kriegsmüdigkeit.**

### Schwachstellen
1. **Kriegsmüdigkeit fehlt völlig.** Kriege enden nur über KI-Laune oder Spielerangebot; es gibt keinen Druck, keine Bilanz („Kriegsstand“), keine innenpolitischen Folgen langer Kriege.
2. **Aufgebote sind epochengebunden und europäisch:** Heerbann nur Ep. 1, Lehnsaufgebot nur Ep. 2, Massenaushebung nur Ep. 4. Asien, Orient, Afrika, Amerika haben keine eigene Heeresverfassung (außer Tümen).
3. **Söldner** existieren nur als teure Varianten (`condott`) – kein Anwerben ohne Kaserne/Rekrutierungsplatz, kein Risiko bei leerer Kasse.
4. **Moral** existiert nur in der Echtzeitschlacht. Auf der Karte gibt es keinen Zustand „erschöpft/kampfbereit“; ein geschlagenes Heer greift nächste Runde wieder voll an.
5. **Versorgung unsichtbar:** `supplyRound` wirkt still (nur `a.unsup`), Spieler sieht keine Nachschubreichweite.
6. **Feldherren sind austauschbar:** kein Alter, kein Tod, keine Loyalität, Porträts nur je Epoche. Taten-System gut, aber Ruhm/Titel fehlen.
7. **Doppelt/verwirrend:** Zwei „Hinterhalt“ (Haltung `hinter` und Plan `hinterhalt`) mit verschiedenen Regeln; Gefolge „Festungsbaumeister“ (Belagerung) vs. Amt „Baumeister“ (Bauen); Statthalter-Gefolge `GOV_RET` vs. Hof-Amt „Reichsverweser“ (auch `statthalter` key) – Namensverwechslung.
8. **Heeresgrenze 10 Einheiten** fest, unabhängig von Epoche/Kultur.
9. **Feldzugsziele nur für die KI** (`a.camp` beim Erzfeind); der Spieler hat Marschziel `a.goal`, aber kein „Feldzug“ mit Zweck.
10. **Echtzeitschlacht vs. Berechnen**: Plan wirkt nur beim Berechnen – nirgends erklärt.

## 2. Konzept-Bausteine

Aufwand: S ≈ unter einem halben Lauf, M ≈ ein Lauf, L ≈ mehrere Läufe.

### A. Kriegsmüdigkeit & Kriegsstand (M) — höchster Spielwert
- Je Krieg ein **Kriegsstand** (−100…+100) aus Schlachten (nach Mannstärke), eroberten/verlorenen Provinzen, Belagerungen, Plünderungen. Anzeige im Diplomatiefenster als Balken.
- Je Reich **Kriegsmüdigkeit** 0–100: steigt pro Kriegsrunde (+1), stark bei Verlusten, Plünderung im eigenen Land, Hunger; sinkt im Frieden.
- **Folgen** ab 40/70: Ordnung −1/−2, Steuern −5/−10 %, ab 70 Ratsvorschlag „Frieden suchen“.
- **Friedensbedingungen** richten sich nach Kriegsstand (Provinzen abtreten, Tribut, Gold). KI nimmt Frieden eher an, wenn müde oder verlierend.
- Risiken: KI-Friedenslogik (`makePeace`-Aufrufer) muss vorsichtig ergänzt werden; Balance der Steuerabschläge; Übersicht: ein Balken + eine Zahl.

### B. Moral auf der Karte / Erschöpfung (S–M)
- Heer-Zustand **Kampfbereit / Erschüttert / Aufgelöst** nach Schlachtausgang. Erschüttert: Angriff −15 %, keine Angriffe außer Verteidigung für 1–2 Runden; Aufgelöst: Rückzug zwingend.
- Erholung durch Rast im eigenen Land, Gefolge Bannerträger, Feldherrnstufe.
- Plakette zeigt kleines Symbol. Risiken: KI muss Zustand respektieren (einfach: KI greift mit erschüttertem Heer nicht an).

### C. Heeresverfassung je Kultur/Epoche (M–L)
Eine Tabelle `MIL_SYS[kultur][epoche]` mit 1 aktiver Fähigkeit + 1 passivem Effekt, ersetzt/vereinheitlicht Heerbann/Heerfolge/Drill/Levée:
- **Römische Legion** (Ep. 0, Rom): Veteranen-Kolonien – entlassene Einheiten ab Rang Veteran geben Provinz Ordnung +1; Legionen +1 Rang beim Rekrutieren in Kasernenstufe 2.
- **Germanisch/keltisch Heerbann** (Ep. 0–1): bestehender Heerbann, für diese Kulturen auch Ep. 0.
- **Lehnsaufgebot** (Ep. 2, Europa/Orient-Iqta): bestehende Heerfolge, im Orient als **Iqta-Reiter**.
- **Söldner/Condottieri** (Ep. 2–3, Italien/Latein, später alle): Anwerben ohne Rekrutierungsplatz, 2× Sold, bei Kasse < 0 laufen sie über oder plündern.
- **Stehendes Heer** (Ep. 3, Europa): bestehender Drill + Kasernen-Unterhalt −10 %.
- **Massenaushebung** (Ep. 4): bestehend.
- **Tümen** (Steppe, alle Epochen): bestehend + Dezimalordnung (Heer max 10 → bei Steppe 12?) – siehe Frage 4.
- **Janitscharen-Ocak** (Osmanen Ep. 3): Elite-Infanterie mit Sold, Unruhe in der Hauptstadt, wenn Sold ausbleibt (Kulturtech gibt es schon).
- **Samurai/Daimyō-Gefolge** (Japan Ep. 2–3): Daimyō-Aufgebot wie Heerfolge, Loyalität an Shōgun-Mechanik gekoppelt.
- **Chinesisches Weisungsheer** (Ep. 2–3): Militärkolonien (Tuntian) – Grenzprovinzen versorgen Heere (keine Versorgungsverluste in eigenen Grenzregionen), Garnison +.
- **Azteken-Kriegerorden** (Meso): Adler-/Jaguarkrieger steigen durch Gefangene auf (Sieg → XP-Bonus), Blumenkrieg (gibt es als Kulturtech) bringt Ränge ohne Eroberung.
- **Inka-Mitʼa-Aufgebot** (Anden): Aufgebot aus allen Provinzen, Straßen (Qhapaq Ñan) +1 Bewegung im eigenen Land.
- **Afrika (Mali/Habesha)**: Reiteradel + Aufgebot der Provinzfürsten (Ras), Abuna-Segen (Glaubenspaket) gibt Moral.
- Anzeige: eine Karte „Heerwesen“ im Heerfenster mit Name, Wirkung, aktivem Knopf.
- Risiken: viele Sonderregeln → strikt 1 aktiv + 1 passiv je Eintrag; KI nutzt nur aktive Knöpfe, wenn im Krieg (wie `aiLevies`).

### D. Truppen sammeln / Musterung (S)
- Knopf „Musterung“ in einer Stadt: holt alle eigenen Heere aus Nachbarprovinzen mit freiem Platz zusammen bzw. füllt ein Heer aus der Rekrutierungsliste in einem Zug (Mehrfachauswahl statt Einheit für Einheit).
- „Sammelpunkt“ setzen: neu rekrutierte Einheiten marschieren automatisch dorthin.
- Spielerwirkung: viel weniger Tippen auf dem iPad. KI nicht betroffen.

### E. Feldherren: Ruhm, Titel, Alter, Loyalität (M)
- **Ruhm** aus Taten (Summe `dd`); ab Schwellen **Ehrentitel** je Kultur („Africanus“-Art: „der Bezwinger von <Region>“, Triumph in Rom, Ghazi, Bahadur, Shōgun-Gunst).
- **Alter & Tod**: Feldherren altern (wie Herrscherhaus), ab 60 Ruhestand-Ereignis; Tod in Schlacht nur bei vernichtender Niederlage (Geschichten-Helden bleiben geschützt, siehe heroFell).
- **Loyalität** (nur bei hohem Ruhm + niedrigem Hofansehen): Ereignis „Der Feldherr fordert …“ (Amt, Gold, Triumph) – verknüpft mit Statthalter-Abfall-Mechanik (2-Runden-Warnung).
- Kulturporträts: nutzen Hof-Porträts aus Paket 11 als Fallback.
- Risiken: Herrscher-/Statthalterlogik wiederverwenden, nicht neu bauen.

### F. Gefolge/Stab (S)
- Bestehendes `RETINUE` sichtbar machen (wann bekomme ich einen Begleiter), 2–3 kulturspezifische Namen (z. B. Feldscher → „Hakim“ im Orient), Stab = Gefolge, kein zweites System.

### G. Versorgungslinien/Nachschub sichtbar (S–M)
- Karte zeigt beim gewählten Heer Nachschubreichweite (Provinzen ohne Abzug grün, mit Abzug orange) – Daten aus `supplyRound`/`attritionOf` vorhanden.
- Optional: Tross-Einheit (eigene Rolle ohne Kampfkraft) verlängert Reichweite um 1. Eher Phase 2.

### H. Jahreszeiten/Winter (S)
- Existiert (`season`, Winterverluste, `winterQ`). Nur besser zeigen: Winterhinweis im Heerfenster eine Runde vorher. Keine neuen Regeln.

### I. Feldzugsziele für den Spieler (M)
- „Feldzug ausrufen“: Ziel-Region + Frist (z. B. 8 Runden). Belohnung bei Erfolg (Ruhm, Ordnung, Kriegsmüdigkeit −), Malus bei Scheitern (Müdigkeit +). Nutzt `a.camp`-Mechanik der KI.
- Verbindet Kriegsmüdigkeit (A) mit Feldherren-Ruhm (E).

### J. Veteranen & Fahnen (S)
- Einheiten ab „Elite“ bekommen Namen/Fahnenband („Legio X Equestris“, „Eiserne Kompanie“), bleiben beim Epochenwechsel als Aufwertung erhalten.
- Fahnen: Ehrenband an der Heer-Plakette pro großer Schlacht (max 3), Chronik-Eintrag.

## 3. Empfehlung

### Phase 1 (ein Lauf)
1. **Kriegsmüdigkeit + Kriegsstand + Friedensbedingungen** (A).
2. **Kartenmoral** Kampfbereit/Erschüttert (B, schlanke Fassung).
3. **Musterung / Mehrfach-Rekrutierung + Sammelpunkt** (D).
4. **Klarheit**: Nachschubreichweite beim gewählten Heer (G), Winterhinweis (H), Begriffe entwirren (zwei Hinterhalte, Baumeister/Reichsverweser), Schlachtplan-Hinweis „wirkt nur beim Berechnen“.
5. **Ehrentitel & Ruhm** aus vorhandenen Taten (E ohne Alter/Loyalität) + Veteranen-Namen (J).

### Phase 2
- Heeresverfassung je Kultur (C) als Tabelle, alte Einzelsysteme darin aufgehen lassen.
- Feldherren-Alter/Tod/Loyalität (E Rest).
- Feldzugsziele für den Spieler (I).
- Söldner mit Risiko, Tross.

## 4. Entscheidungsfragen für Moritz

1. **Kriegsmüdigkeit – wie streng?**
   a) Spürbar: Ordnung/Steuern sinken ab 40, Rat drängt ab 70 (empfohlen)
   b) Mild: nur Anzeige + Friedensbereitschaft der KI
   c) Hart: ab 80 droht Aufstand/Thronstreit
2. **Moral auf der Karte?**
   a) Ja, Kampfbereit/Erschüttert, 1–2 Runden Erholung (empfohlen)
   b) Nein, nur in der Echtzeitschlacht
3. **Heeresverfassung je Kultur – wann und wie viel?**
   a) Phase 2, 1 aktive + 1 passive Fähigkeit je Kultur/Epoche, alte Aufgebote gehen darin auf (empfohlen)
   b) Schon Phase 1 für die großen Kulturen (Rom, Lehnswesen, Steppe, Osmanen, Japan, Azteken)
   c) Nur bestehende Aufgebote auf andere Kulturen ausweiten
4. **Heeresgröße 10 Einheiten?**
   a) Bleibt 10 überall (Übersicht iPad) (empfohlen)
   b) Mit Epoche/Tech wachsend (10 → 12 → 14)
   c) Kulturabhängig (z. B. Tümen 12)
5. **Feldherren-Alter und Tod?**
   a) Ja, mit Ruhestand und Tod nur in vernichtender Schlacht; Geschichten-Helden geschützt
   b) Nur Ehrentitel/Ruhm, kein Altern (empfohlen für Phase 1)
   c) Ja, inkl. Loyalität/Forderungen berühmter Feldherren
