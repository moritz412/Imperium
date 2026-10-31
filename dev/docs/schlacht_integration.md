# Echtzeitschlacht – Integration ins Hauptspiel (Prüfung 30.10.2026)

Wunsch Moritz: bald integrieren; eigener Schwierigkeitsgrad nur für Echtzeitschlachten.

## 1. Ist-Zustand

**Hauptspiel `dev/imperium.html`** hat schon eine ältere Echtzeitschlacht (rund 90 KB Code):
- Funktionen `startBattle`, `mkUnit`, `buildTerrain`, `battleFrame`, `battleTap`, `buildBattleUI`, `endBattle`, `teardownBattle`.
- Aufgerufen über „Schlacht schlagen“ beim eigenen Angriff (`openAttack…`, ~Z. 17828) und bei gegnerischem Angriff (~Z. 19642). Daneben gibt es „Berechnen“ (`resolveAttack`).
- Sie kann bereits einiges, das die neue Schlacht übernehmen muss:
  - Speichern vor der Schlacht (`KEY_BATTLE`, nicht im Mehrspieler)
  - Garnison als Miliz-Einheiten
  - Feldherr als eigene Einheit mit Fähigkeiten Sammeln/Anfeuern (`B.ab`)
  - Verstärkungen beider Seiten (`attRe`/`defRe`)
  - Mauern mit Leitern (`B.wall`)
  - Zeitgrenze 480 s
  - Rückschreiben der Männer (`u.ref.men`), danach `concludeAttack`
- Die Schlacht nutzt den Renderer der Kampagne mit eigener Szene `B.scene`.

**Kampagnen-Schwierigkeit:**
- `DIFF` (Leicht/Normal/Schwer), gewählt im Startbildschirm (`renderDiff`, `#diffSeg`), gespeichert als `S.diff`.
- Sie wirkt auf die KI-Wirtschaft, Kriegsbereitschaft und Heeresgröße, nicht auf Kämpfe.

**Neue Testschlacht `dev/proto/schlacht_spiel.html`** (~180 KB, Three r128 wie das Spiel):
- Kampfsystem:
  - Einzelsoldaten mit Zweikämpfen
  - Fernkampf, Reiterei, Moral und Flucht
  - Werte aus der Kampagne über `schlachtEinheit()`
- Darstellung:
  - Figurenpakete (je Kit ~2,2–2,8 MB, Pferd 0,4 MB)
  - Gelände, Bewuchs, Licht und Schatten, Blut
- Ton: 14 Musikstücke, ~85 Geräusche.
- Oberfläche: Einheitenkarten mit Kampagnenbildern.

## 2. Was für die Integration noch fehlt

| Nr. | Paket | Inhalt | Aufwand |
|---|---|---|---|
| I0 | **iPad-Test (Moritz)** | Testschlacht mit ~600 Figuren und Reiterei auf dem iPad: flüssig? Ton? Speicher? Ohne diesen Test kein Einbau. | kurz |
| I1 | Gerüst | Schlachtcode als eigener Script-Block in `imperium.html`. Er nutzt den vorhandenen Renderer wie die alte Schlacht (kein zweiter WebGL-Kontext, wichtig fürs iPad). Ein- und Ausstieg, Kampagnenszene pausieren und wieder aufbauen. Die alte Schlacht bleibt als Rückfall. | groß |
| I2 | Datenbrücke | Kampagnen-Einheit → `schlachtEinheit` (Rolle, Variante, Volk, Kultur, Epoche, Ausrüstungs-Epoche, Waffen, Rüstung, Elite, Rang). Männer → Figuren (120 Mann ≈ 40 Figuren; Verluste zurückrechnen). Garnison und Verstärkungen. Ergebnis: Männer, Erfahrung/Rang, Feldherr verwundet/gefallen, dann `concludeAttack`. | mittel |
| I3 | Feldherr | Leibwache als Reitereinheit, Aura (Moral), Fähigkeiten Sammeln/Anfeuern wie bisher. Fehlt in der Testschlacht. | mittel |
| I4 | Schwierigkeit Echtzeit | siehe Abschnitt 3 | klein |
| I5 | Laden/Offline | Nur benötigte Kits laden. Ladeschirm mit den vorhandenen Schlacht-Ladebildern. Figurenpakete und Ton in `OFF_MAN` (Größe), `OFF_VER` erhöhen. Pakete zusammen ~35 MB: in den Offline-Speicher erst nach dem ersten Laden aufnehmen? | mittel |
| I6 | Gelände aus Provinz | Höhenfeld-Saat je Provinz. Bewuchs und Farben nach Klima (Mittelmeer, Steppe, Wüste, Wald, Schnee). Fluss/Furt später. | mittel |
| I7 | Ton zusammenführen | Schlachtmusik und Geräusche über das `AUDIO`-System der Kampagne (Lautstärke-Einstellungen, Stumm). Ton auf dem Handy ist noch offen. | klein–mittel |
| I8 | Oberfläche | Übergänge Vorschau → Aufstellung → Schlacht → Endtafel → Kampagne. Knopf „Rückzug“ (Schlacht verlassen = Rückzug mit Verlusten). Nach der Design-Leitlinie, Knöpfe in einer Spalte. | mittel |
| I9 | Tests | Playwright: Kampagne → Schlacht → zurück, Verluste stimmen, Speichern/Laden nach der Schlacht, Verteidigungsschlacht, Garnison. | mittel |

**Später, nicht für den ersten Einbau:**
- Belagerung mit Mauern (S13)
- Elefanten, Wagen, Kamele, Artillerie mit eigenen Modellen
- Figuren für Mittelalter und Neuzeit (E3)
- Seeschlachten

## 3. Vorschlag Schwierigkeitsgrad Echtzeitschlacht

- Eigene Einstellung `S.bdiff`, unabhängig von der Kampagnen-Schwierigkeit.
- Auswahl im Startbildschirm unter der Kampagnen-Schwierigkeit („Schlachten: Leicht · Normal · Schwer · Sehr schwer“). Im laufenden Spiel jederzeit in den Einstellungen änderbar.
- Sie wirkt nur in der Echtzeitschlacht und nur auf die KI-Seite. „Berechnen“ bleibt davon unberührt.

| | Leicht | Normal | Schwer | Sehr schwer |
|---|---|---|---|---|
| Angriff/Abwehr der KI | ×0,9 | ×1 | ×1 | ×1,1 |
| Moral der KI | −10 | ±0 | +5 | +10 |
| KI-Reaktionszeit | 2 s | 1 s | 0,5 s | 0,5 s |
| KI-Taktik | frontal, keine Flankenmanöver | Flanken mit Reiterei | Flanken, Lösen und neu anstürmen, Fernkämpfer gezielt | wie Schwer, dazu Reserve zurückhalten |
| Hilfen für den Spieler | Hinweise auf Flankengefahr | – | – | – |

Die KI-Seite wird nur in der Schlacht stärker oder schwächer gerechnet. Die Kampagnenwerte der Einheiten bleiben unverändert.

## 4. Entscheidungen für Moritz

1. **Einbauweg:**
   - Empfohlen: Schlachtcode direkt in `imperium.html`, gleicher Renderer.
   - Alternative: eigene Seite. Das ergäbe zwei WebGL-Kontexte und eine Datenübergabe per Nachricht, was auf dem iPad riskanter ist.
2. **Umfang des ersten Einbaus:**
   - Empfohlen: neue Schlacht nur in der Antike (Epoche 0) und ohne Mauern; sonst weiter die alte Schlacht.
   - Grund: Für spätere Epochen gibt es noch keine Figuren.
3. **Schwierigkeitsstufen:** wie in Abschnitt 3?
4. **Mehrspieler:** Echtzeitschlacht dort vorerst nicht anbieten (nur „Berechnen“)?

## 5. Reihenfolge

1. I0 iPad-Test
2. I1 + I2 Gerüst und Datenbrücke, nur Antike
3. I4 Schwierigkeit
4. I3 Feldherr
5. I8 Oberfläche/Übergänge
6. I5 Laden/Offline
7. I7 Ton
8. I6 Gelände aus Provinz
9. I9 Tests vor der Veröffentlichung

Je Paket ein Unteragent (Sonnet), Prüfung im Hauptchat. Vorher noch offen in der Testschlacht:
- Balance (Rom verliert die Vorlagen)
- Sarissa im Kampf nicht zweihändig gesenkt
- „Lösen“ im dichten Gefecht: Reste werden beim Sammeln wieder gestellt

## 6. Entscheidungen Moritz 30.10. – „Ja, alle vier“
1. Einbau direkt in `imperium.html`, gleicher Renderer.
2. Erster Umfang: nur Antike (Epoche 0), ohne Mauern; sonst alte Schlacht.
3. Schwierigkeitsstufen wie Abschnitt 3.
4. Mehrspieler: nur „Berechnen“.

Umsetzung I1+I2 beginnt hinter einem Schalter (Einstellung „Neue Echtzeitschlacht (Test)“, vorerst aus), bis der iPad-Test (I0) bestanden ist.
Assets: das Spiel lädt Figuren und Ton aus `proto/figuren/` und `proto/ton/` (deploy.py kopiert dev/proto nach proto/), keine Doppelablage.

## 7. Stand Umsetzung I1/I2/I4 (30.10.2026)

Die neue Echtzeitschlacht läuft im Hauptspiel hinter dem Schalter. **Auf dem echten iPad nicht getestet** (I0 steht aus), Tests nur mit Software-Rendering am PC.

**Was geht**
- Schalter: Einstellungen > Grafik > „Neue Echtzeitschlacht (Test)“ (Standard aus, `localStorage imperium.esch`) oder URL `?eschlacht=1`.
- Bedingung für die neue Schlacht: Schalter an, Epoche 0, kein Mehrspieler, nicht „Mauern mit Garnison“. Sonst läuft `startBattle` wie bisher. Schlägt das Laden fehl (z. B. offline), fällt `eschStart` auf die alte Schlacht zurück.
- Beide Wege (eigener Angriff, Verteidigung) rufen `startBattle`; dort steht jetzt die Weiche (`eschGeeignet`, `eschStart`).
- Kampagnen-Einheit → `schlachtEinheit` (`eschDesc`): Volk, Kultur, Rolle, Variante, Ausrüstungs-Epoche, Waffen, Rüstung, Veteranen, Rang. Aufschläge aus dem Spiel wie in `mkUnit` (Techniken `drill`/`iron`/`techBonus`, Feldherr `genFx`), bis zur Kappe. Garnison = Miliz-Speerträger (Werte ×0,85).
- Figuren = Männer/3, mindestens 8, höchstens 60. Höchstens 9 Einheiten + Leibwache je Seite (Heer zuerst, Garnison, dann Verstärkungen; Überzählige bleiben zu Hause, Hinweis per Toast). `MAXU` im Kern von 16 auf 20.
- Feldherr (I3 nur teilweise): „Leibwache“ als Reitereinheit mit 20 Figuren (Fußtruppe bei Völkern ohne Pferd), Atk/Def ×1,8 bis zur Kappe. Keine Aura, kein Sammeln/Anfeuern.
- Ende: Männer = Männer × (Überlebende + Geflohene) / Start-Figuren; unter 18 % der Sollstärke → 0; Garnison zurück in `P.gar` wenn der Verteidiger gewinnt; danach wie bisher `concludeAttack`, `battleLog`, `showBattle`. Speichern vor der Schlacht (`KEY_BATTLE`) wie bisher.
- Knopf „Rückzug“ (zweimal tippen) = Niederlage mit zusätzlich 12 % Verlust der eigenen Seite (wie `retreat()` der alten Schlacht).
- Zeitgrenze 600 s Schlachtzeit: wer mehr als 5 % mehr Soldaten auf dem Feld hat, gewinnt; sonst der Verteidiger. (Die alte Schlacht entscheidet nach 480 s immer für den Verteidiger; hier sonst endlose Plänkler-Verfolgungen.)
- Ton: Kampagnenmusik wird angehalten (`AUDIO.hush`), die Schlacht nutzt ihr eigenes Tonsystem mit den Werten aus der Kampagne (Musik/Effekte an/aus, Lautstärke); danach `AUDIO.setTheme('map')`.
- Kein zweiter WebGL-Kontext: der Kern bekommt den Renderer und das Canvas der Kampagne, eigene Szene. Eingabe über eine eigene Fläche `#eingabe` (die Kartensteuerung am Canvas bekommt nichts mit). Beim Abbau (`eschAbbau`) werden Zustand des Renderers (Kodierung, Tonwerte, Schatten, Pixelrate), Geometrien, Materialien, Texturen, Instanzen, Zuhörer und Audio freigegeben. Während der Schlacht steht ein Platzhalter in `BATTLE` (`{esch:true,…}`), damit Fenster und Ereignisse der Kampagne warten.

**Schwierigkeit (I4)**
- `S.bdiff` 0..3 (Leicht/Normal/Schwer/Sehr schwer), Standard Normal; alte Spielstände ohne Wert gelten als Normal (`bdiffNow`). Startbildschirm: Reihe „Schlachten“ unter der Schwierigkeit (`#bdiffSeg`, `renderBDiff`, Wert `imperium.bdiff`, neue Partie übernimmt ihn). Im Spiel: Einstellungen > Grafik.
- Wirkt nur auf Seite 1 (KI) der neuen Schlacht: Angriff/Abwehr ×0,9 / 1 / 1 / 1,1, Moral −10 / 0 / +5 / +10, Reaktionszeit 2 / 1 / 0,5 / 0,5 s, Taktik (Leicht ohne Flankenmanöver und ohne Lösen, Normal Flanken, Schwer und Sehr schwer zusätzlich Lösen und neu anstürmen und Fernkämpfer gezielt, Sehr schwer hält eine Fußeinheit als Reserve zurück, wenn die KI mindestens 4 Fußeinheiten hat). Leicht: Hinweis „Flankengefahr“. Der Kern kennt die Tabelle (`BDIFF`); ohne `bdiff` (Testseite) laufen die alten Werte.

**Eine Fassung des Kerns, so bleibt sie synchron**
- Quelle ist `dev/proto/schlacht_spiel.html`: Funktion `schlachtKern(OPT)` (Zeilen zwischen `//ESCH-KERN-BEGIN` und `//ESCH-KERN-END`), dazu gemeinsam `/*ESCH-CSS-BEGIN/END*/` (alle Regeln mit `#esch` vorangestellt), `<!--ESCH-DEFS-…-->` (Symbole) und `<!--ESCH-DOM-…-->` (Oberfläche).
- `imperium.html` enthält dieselben vier Abschnitte zwischen denselben Markierungen (Kern als eigener `<script>`-Block vor dem Hauptskript, Oberfläche als `<template id="eschTpl">`). **Nach jeder Änderung am Kern in der Testseite abgleichen** (nur Text zwischen den Markierungen wird ersetzt, CRLF der Hauptdatei bleibt):

```js
// dev/tools/sync_schlacht.js (noch nicht abgelegt): node dev/tools/sync_schlacht.js
const fs=require('fs'),R='dev/';
const P=fs.readFileSync(R+'proto/schlacht_spiel.html','utf8');
let I=fs.readFileSync(R+'imperium.html','utf8');const CR=I.includes('\r\n');I=I.replace(/\r\n/g,'\n');
const teil=(s,a,b)=>s.slice(s.indexOf(a)+a.length,s.indexOf(b));
const setze=(a,b,x)=>{const i=I.indexOf(a),j=I.indexOf(b);if(i<0||j<i)throw new Error(a);I=I.slice(0,i+a.length)+x+I.slice(j);};
for(const[a,b]of[['/*ESCH-CSS-BEGIN*/','/*ESCH-CSS-END*/'],['<!--ESCH-DEFS-BEGIN-->','<!--ESCH-DEFS-END-->'],['<!--ESCH-DOM-BEGIN-->','<!--ESCH-DOM-END-->'],['//ESCH-KERN-BEGIN','//ESCH-KERN-END']])setze(a,b,teil(P,a,b));
fs.writeFileSync(R+'imperium.html',CR?I.replace(/\n/g,'\r\n'):I);
```
- Unterschiede der Fassungen nur über `OPT`: Hauptspiel `{root,renderer,canvas,extern:true,assets:'proto/',img:'img/',bdiff,limit,zeitSieg,farben,fps,ton,onEnde}`, Testseite `{standalone:true}` (eigener Renderer, eigene Schleife, `window.SCHLACHT`).
- Klassen der Oberfläche heißen so, dass sie nicht mit globalen Regeln der Kampagne zusammenstoßen (`.st`/`.bar` der Kampagne → hier `.stz`/`.zbar`). Neue Klassen vorher gegen die Kampagnen-CSS prüfen.

**Geprüft (Software-Rendering, Chromium, kein iPad)** – `dev/tests/eschlacht_integ_t.js` (Rom greift Etrurien an): Schlacht startet, Figuren und Einheiten aus dem Heer, Leibwache und Garnison dabei, KI-Werte Leicht gegen Sehr schwer unterscheiden sich, eigene Werte nicht, Schlacht bis „Weiter“ und per Rückzug, Männer verändert, Modal der Kampagne, Aufräumen, Renderer-Zustand zurückgesetzt, Kampagne läuft weiter, Schalter aus = alte Schlacht. Dazu `smoke.js`, `schlacht_e1_t.js`, `schlacht_reiter_t.js`.

**Nicht getestet / offen**
- iPad (Leistung, Speicher, Ton), Handy, echte Grafikkarte.
- Verteidigungsschlacht (`processPending`) und Verstärkungen beider Seiten nur durch Code, nicht im Lauf; Garnison-Rückschreiben im Lauf nur indirekt.
- Reserve (Sehr schwer), Flankenhinweis (Leicht) und die Taktik-Unterschiede nur durch Code und Werte geprüft, nicht im Spielverlauf.
- Ton in der integrierten Schlacht: Kontext entsteht erst nach der ersten Berührung; kein Hörtest.
- Offline (`OFF_MAN`) unberührt (I5): ohne Netz fällt die Schlacht auf die alte zurück, solange `proto/` nicht gecacht ist.
- Gelände weiter das der Testschlacht (I6); Mauern/Belagerung alte Schlacht; Feldherr-Fähigkeiten (I3) fehlen.
- Spielgleichgewicht nicht geprüft (im Test verlor Rom gegen den Feind teils deutlich; bekannt aus Abschnitt 5).

## 8. Stand Feldherr (30.10.) – Paket I3

**Auf dem echten iPad nicht getestet.** Tests nur am PC mit Software-Rendering (`dev/tests/schlacht_feldherr_t.js`, `eschlacht_integ_t.js`).

**Figur und Marke**
- Die Leibwache (Tag `gen`, Reitereinheit mit 20 Figuren, Fußtruppe bei Völkern ohne Pferd) enthält einen Feldherrn: eine Figur der zweiten Reihe (`u.genId`), 10 % größer, goldener Farbstich (Instanzfarbe `instanceColor` im Kit, nur für diese Figur gesetzt), dreifaches Leben (`GEN_HP`), Standarte (höher, goldenes Tuch) steht über ihm.
- Name „Leibwache des …“ (Hauptspiel: Name des Feldherrn aus `ga.gen.n`; Testseite: Konsul, Feldherr der Punier, König, Stammesfürst). Im Einheitenfenster steht „Feldherr: … · Aura 40 m“.

**Regeln (Zahlen)**
- Aura 40 m um die Figur, nur solange er nicht selbst flieht: Moralverlust der eigenen Einheiten × (1 − 0,35 · Stärke), also × 0,65 bei Stärke 1; Erholung +0,9 · Stärke je Sekunde (nicht im Kampf). Stärke = 1 + `genFx(mor)` / 50, höchstens 1,6 (Hauptspiel); Testseite 1. Bei Auswahl der Leibwache zeigt ein dünner Ring am Boden den Umkreis.
- **Sammeln** (Knopf in der Befehlsspalte): Fliehende eigene Einheiten im Umkreis 60 m kehren um, wenn ihre Moral mindestens 8 beträgt (Moral +30, mindestens 35; 8 s standfest). Andere Einheiten im Umkreis mit Moral unter Höchstwert −8 bekommen +12. Abklingzeit 45 s (wie alte Schlacht). Ohne Wirkung wird der Befehl abgelehnt (Hinweis), die Abklingzeit startet dann nicht.
- **Anfeuern**: eigene Einheiten (nicht fliehend) im Umkreis 60 m: Moral +12 (höchstens Höchstwert +8), Angriff ×1,2 für 20 s (Faktor in der Kampfformel `reaktion`, Grundwert bleibt). Abklingzeit 60 s. (Alte Schlacht: +25 %, 28 m.)
- Knöpfe nur sichtbar, solange der eigene Feldherr auf dem Feld ist; die Abklingzeit steht im Knopf („noch 43 s“).
- **Tod** (Figur fällt): eigene Seite Moral −18 (Aura mildert das nicht), Gegner +4; Meldung oben, Ton `horn`. Die Leibwache bleibt als normale Reitereinheit. (Alte Schlacht: −15.) Flieht nur die Einheit, lebt der Feldherr weiter.
- Ton: `horn` (Sammeln, Tod), `kriegsgeschrei` (Anfeuern); keine neuen Klänge.
- **KI** (nur Feind-Feldherr, vorsichtig): bleibt an seinem Startplatz hinter der Linie; greift nur schwache (Verluste > 50 %, Moral < 30) oder fliehende Ziele bis 90 m an, nach 150 s auch andere Nicht-Speerträger bis 60 m; ist er die letzte aktive Einheit seiner Seite (oder nach 300 s), greift er das nächste Ziel an (sonst endete die Schlacht nicht); unter 60 % Stärke zieht er sich zurück/löst sich. Sammeln ab Schwierigkeit Leicht (Flieht eine Einheit im Umkreis), Anfeuern ab Normal (mindestens zwei Einheiten im Nahkampf, nach 20 s). Reaktionszeit wie `BDIFF.iv`.

**Ergebnis an die Kampagne**
- `ergebnisDaten` liefert `feldherr:[Seite 0, Seite 1]`, je `{name, lebt, verwundet}` oder `null` (kein Feldherr). `lebt` = nicht gefallen (auch wenn er mit der Einheit floh); `verwundet` = lebt mit weniger als 60 % Leben.
- Die alte Schlacht wertet Tod/Verwundung des Feldherrn nicht aus (nur Moral −15 in der Schlacht); die Kampagne entscheidet in `concludeAttack` über `genDeed` (Sieg/Niederlage) und Ersatz des Verlierer-Feldherrn mit 12 %. `eschEnde` benutzt denselben Weg unverändert und legt das Ergebnis in `eschFeldherr` und `res.feldherr` ab (bisher ohne Wirkung auf Regeln; Auswertung wäre eine Entscheidung für Moritz, z. B. gefallener Feldherr = sicherer Ersatz).

**Test-Haken im Kern** (nur für Tests): `SCHLACHT.druck`, `feldherr`, `feldherrLeben`, `tötefeldherr`, `sammeln`, `anfeuern`, `abklingzeit`.

**Offen / nicht getestet**: iPad, Anfeuern-KI und Leicht-Variante (nur Sammeln) nur durch Code, nicht im Spielverlauf; Verhalten des Feind-Feldherrn über eine ganze Schlacht nur stichprobenartig; Flucht des Feldherrn mit der Einheit (Aura aus, Standarte bleibt bei ihm); Balance der Zahlen ungeprüft; Elefanten-Panik und Aura nicht zusammen geprüft.

## Stand Gelände I6 (31.10.)
- `OPT.gelaende={typ:'plain'|'rough'|'mountain', klima:'mittelmeer'|'steppe'|'wueste'|'wald'|'schnee', saat, kueste}`; ohne Angabe bleibt das alte Testgelände (Zufallssaat und Formeln unverändert).
- Höhe: Saat bestimmt Phasen der Wellen und Lage der Kuppen (`GHILL`); plain flach (×0,5), rough ×1,5 mit 9 Kuppen plus flachen Buckeln, mountain hohe Kämme an den Flanken (|x|≈190) und hinten, Mitte frei. Kampfebene (|x|<120, |z|<100) bleibt gemessen unter 6,3 m Höhenspanne, Steigung ≤ 0,16.
- Klima: Bodenfarben (`GCOL`), Himmel/Dunst (`HZK`), Bewuchsdichte (`KV`), Waldliste je Klima, Baumartenmischung (`baum`); Wüste ohne Rundhäuser, Zäune, Heu (mehr Felsen), Zypressenallee nur Mittelmeer.
- Ton: Teppiche `s_wald_1`, `s_wueste_1`, `s_kueste_1` (nur geladen, wenn gebraucht); Wiese nur Mittelmeer/Steppe, Schnee mehr Wind. `s_fluss_1`/`s_sumpf_1` noch ungenutzt.
- Hauptspiel (`eschStart`): typ=`pter(ti)`; klima: Winter und Norden (Breite >46, >41 mit 20 %) Schnee, `aridAt`>0,7 Wüste, >0,4 Steppe, rough und nicht trocken Wald, sonst Mittelmeer; saat=ti·131+Runde; Küste=`feat(ti).coast`.
- Testseite: `schlacht_spiel.html?gel=rough&klima=wueste&saat=5&kueste=1`. Test `dev/tests/schlacht_gelaende_t.js` (Bilder `shot/gel_*.png`).
- Offen: Felsen tragen in Steppe/Wüste noch Moos; Fluss/Sumpf-Gelände; echtes iPad nicht getestet.
