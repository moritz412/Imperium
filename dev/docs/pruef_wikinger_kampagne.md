# Prüfbericht Wikinger-Kampagne (SCEN.wikinger, Stand v212, Branch vk-startflotte)

Nur geprüft, nichts am Spiel geändert. Test: `dev/tests/vk_kampagne_t.js` (läuft ca. 95 s, „ALLE PASS“, zählt bekannte Probleme als `BEFUND`).
Methode: Playwright, Spielfunktionen direkt (Flotte, Landung, `resolveAttack`, `endTurn`, `stChoiceEv`), Einzelschlachten mehrfach gewürfelt (4–7 Versuche, also grobe Quoten).
Teile mit „Abkürzung“ setzen Schrittbedingungen per Flag/Besitz. Ein Spieler am iPad wurde **nicht** simuliert: keine selbst geführten Schlachten, kein vollständiger 80-Runden-Durchlauf, echtes iPad nicht getestet,
Sprecher-Inhalt nicht per Whisper geprüft (nur: Datei und Schlüssel vorhanden). Angaben mit „(Schätzung)“ sind Hochrechnungen aus 2–3 Bot-Läufen.

## Behoben in v213 (Wikinger spielbar)
Geprüft mit `vk_kampagne_t.js` (jetzt PASS statt BEFUND). Echtes iPad nicht getestet.
- Befund 1: `canRaub` erlaubt den Raubzug an Bord für Seeräuber; Landung im Raubzug plündert (kein Erobern, keine Belagerung). Akt-I-Text: Raubzug an Bord, bei Bernicia anlanden, nicht bei Jórvík.
- Befund 2: Beute 150 → 100, 700 → 400. Eroberungs-Plünderung und erhaltenes Danegeld zählen auf die Beute (nur Spieler im Szenario). Szenario-Regel `raidLoot` 1,1 (Beute des Spielers +10 %), damit 100 in Runde 3 bis 4 erreicht wird (ohne: 99 nach drei Raubzügen).
- Befund 3: Startgold 400; Sold im Feindesland und an Bord ×0,5, daheim ×0,7 (`raidUpkeep`, `homeUpkeep`, nur Seeräuber-Spieler im Wikinger-Szenario). Bilanz am Start −34 → −17, auf Fahrt/im Feindesland −14 bis −20. Das ist noch leicht negativ; das Gold (400 + Beute) reicht im Test über 14 Runden.
- Befund 4: Schonfrist `rules.shield` 25: keine neue KI-Kriegserklärung gegen den Spieler in den ersten 25 Szenario-Runden (`scenShield` in `declareWar`). Der Startkrieg mit Northumbria bleibt; der Spieler darf selbst angreifen.
- Befund 5: `rus` aufgedeckt; Ziele zusätzlich Esten, Karelien, Liven (Esten per Landzug ab Gautar in 2 Runden). Die Ostsee bleibt für die Flotte unbefahrbar.
- Befund 6: `stSkip` löst Meldung und Haken des nächsten Schritts aus (ohne Belohnung).
- Befund 8: Jahr springt beim Beginn eines Schritts auf das historische Jahr (`steps[].year`), nie rückwärts, kein Epochenwechsel (Szenarien haben keinen).
- Befund 9: Island/Vinland: Texte versprechen nur noch Ruhm; „Noch warten“ verweist auf den Geschichte-Knopf. Befund 10: Normandie „Lehen“ verlegt fränkische Heere aus den übergebenen Provinzen. Befund 11: Paris-Ziel ist nur noch Parisier.
- Offen: Befund 7 (Landnahme-Kosten), Kosmetik 12, Ersatzbilder und fehlende Sprecher (ki:0), Bilanz noch leicht negativ.

## Befunde nach Schwere (Stand v212, vor den Korrekturen)

**Blockierend / sehr schwer**
1. **Raubzug-Landung ist unmöglich.** `canRaub` verbietet den Raubzug an Bord (`a.boat`); der Code für „Landung vom Schiff ohne Abzug“ (Z. ~10014/10032, `a._land && a.rz && raidKind==='see'`) ist damit toter Code. Ohne Raubzug wird jede gewonnene Landung zur Eroberung: Votadiner fällt (6/6 Siege), bringt aber **keine Beute** und ist als Beutequelle verbraucht; bei Jórvík (Briganten) verliert man 5 von 6 Landungsschlachten (1 Sieg), mit gesetztem Raubzug 4 von 6 (Test setzt `a.rz` künstlich). Der Akt-I-Text („lande an … dort schaltest du den Raubzug ein“) führt zur schlechten Variante. *Vorschlag:* in `canRaub` Boot für `raidKind==='see'` erlauben, damit `rzLand` beim Anlanden greift; Text: „Lande bei Bernicia (Votadiner)“.
2. **Beute 150 / 700 praktisch nicht erreichbar mit dem, was die Geschichte anbietet.** Krieg besteht nur mit Northumbria; Ziele: Briganten 45, Silurer 27 (nur solange es Northumbria gehört), Votadiner 27 (wenn nicht erobert). Gemessen (Bot, zwei Läufe): 72 Beute nach 3 Raubzügen (Runde 4), danach Verwüstung 5–10 Runden + 6 Erholung, nächste Beute erst ab ca. Runde 17 (+27); 99 nach 17 Runden. 150 ≈ drei Zyklen (Schätzung Runde 30+), 700 ≈ 20+ Plünderungen bei mindestens 4 Reichen (Schätzung Runde 50–70). Andere Reiche (Wessex, Mercia, East Anglia, Franken) stehen auf Frieden; ein Krieg ohne Kriegsgrund kostet Ordnung −1 (10 Runden), Beziehung −12 zu allen. Danegeld-Angebote der KI zählen nicht als Beute und sperren die Plünderung. *Vorschlag:* Beute 150→100 und 700→400; Startkrieg zusätzlich mit East Anglia/Mercia (`wars`) oder Hinweis im Text; Plünderung bei Eroberung (`conqGold`) und Danegeld in `flags.beute` zählen.
3. **Wirtschaft am Start im Minus.** Steuern 27–30, Sold 55–58 (10 Einheiten), Hof/Flotte 6, Bilanz −34 je Runde, 200 Gold. Ohne Beute ist Gold ab Runde 5–7 bei 0, danach desertiert eine Einheit je Runde (alle Läufe; das Heer war in Runde 9–25 aufgerieben). Bei Belagerung von Jórvík (7 Runden) schmilzt das Heer auf 240 Mann. *Vorschlag:* Startgold 400 oder Sold im Feindesland/auf Raubzug halbieren oder Björns Heer als Heimatwache ohne Sold.
4. **KI überrollt den Start.** Beobachtet in 4 Läufen (Spieler passiv, Heere daheim): Germanen erklären Krieg in Runde 7–12, Boier Runde 7–9, Osmanen (Schweden) Runde 11, Slawen Runde 13; Gautar fällt Runde 8–14, in einem Lauf auch Hauptstadt Viken Runde 16 (`Niederlage: Viken ist verloren`). Die Schonfrist (`EPOCH_SHIELD`=6, ab Geschichtsstart Runde 31) endet nach 6 Runden. Zieht Ragnar mit der Flotte aus, ist es schlimmer. Northumbria wächst im selben Zeitraum auf 11 Provinzen. *Vorschlag:* Nichtangriffspakt/Frieden mit Germanen, Boiern, Slawen für ca. 25 Runden (`dip.nap`/`truce` im Start), oder Schonfrist der Geschichte verlängern; Wachtruppe in Viken.

**Schwer**
5. **Waräger-Schritt: kein Seeweg.** Ilmen, Smolensk, Neurer, Dregowitschen sind Binnenland; die Flotte findet in die Ostsee keinen Weg (`moveFleet` → `null` für Skane, Seeland, Svear, Esten, Aestier, Karelien, Gotland; Nordsee/Irland/Orkney/Kimbern gehen). Nur Landzug: Gautar → Hälsingland (nach „Thing“ eigen) → Svear (Schweden, Frieden, „Durchziehen“) → Esten (frei, 2 Runden) → Ilmen; mindestens zwei Eroberungen freier Provinzen (Garnison 11), Gebiet unaufgedeckt (`known=false`, `reveal` enthält `rus` nicht). Die „Flussfahrt“ (halbe Marschkosten Fluss→Fluss) gibt es nur für Heere mit Raubzug. *Vorschlag:* Ziel um Esten/Aestier/Karelien erweitern, `rus` in `reveal`, oder Öresund/Ostsee im Navigationsraster öffnen.
6. **„Schritt aufgeben“ (`stSkip`) überspringt Haken und Meldung.** Nach 30 Runden an einem Schritt (bei Beute 700 wahrscheinlich) wird der nächste Schritt ohne `stHook`, ohne `stMsg`/Ereignis, ohne Fristverlängerung begonnen. Beim Überspringen von „Das Thing“ fehlt der Haken (Lade und Hälsingland bleiben bei Polen, bestätigt). *Vorschlag:* in `stSkip` wie in `storyRound` `stMsg(f,{k:'step'})` und `stHook(f,s.i)` aufrufen.
7. **Landnahme-Kosten gegen Dauerdefizit** (165 Gold, Frühestens Runde 10, 3 Plünderungen je Region, Heer in der Provinz) und Wedmore/Paris danach: machbar, aber nur mit Beute.

**Kosmetik**
8. Jahreszählung: `ypt` 0,5 → nach 80 Runden erst Jahr 833, Kinotexte nennen 865 (Themse), 878 (Wedmore), 911 (Normandie). *Vorschlag:* beim Schrittwechsel `S.scen.yoff` setzen (Hook).
9. Island/Grönland und Vinland sind reine Gold-/Ruhm-Wahlen: keine Provinz, keine Siedlung, keine Bevölkerungswirkung, obwohl die Beschreibung „Zwei Siedlungen … Bevölkerung entlastet“ verspricht. Zu wenig Gold: Fenster schließt, nichts passiert (erneut über Geschichte-Knopf). „Noch warten – kommt wieder“ kommt nicht von selbst wieder. *Vorschlag:* Text anpassen oder Marker/Gold je Runde.
10. Normandie „Lehen“: fränkisches Heer bleibt in der nun eigenen Provinz, Kultur bleibt keltisch, keine Taufe als Bedingung.
11. Paris-Schritt zu früh lösbar: Kaleter/Lexovier fallen schon in Runde 3 (7/7 Landungssiege, Garnison 11, kein Heer; nur Kriegserklärung nötig). *Vorschlag:* Ziel `parisier` (Binnenland) statt Küste.
12. Prüfhilfe: Das Fenster „greift an“ der KI blockiert `endTurn` bis zum Klick (kein Fehler, nur für Tests relevant).

## Tabelle je Schritt
Bild = Kapitelbild; Sprecher = `wikinger_kN`; Kino = Sequenz (alle Dateien im Paket geprüft, Inhalt nicht).

| # Schritt | Ziel | erreichbar | Weg / Messung | Problem | Vorschlag | Kino · Bild · Sprecher |
|---|---|---|---|---|---|---|
| 0 Lindisfarne | Beute 150 | schwer | Viken einschiffen (6 Einheiten passen; Björn nicht getestet), Fahrt 2 Runden, Landung Votadiner (6/6 Sieg, erobert), Raubzug Briganten 45 + Silurer 27 | Befunde 1–3 | Raubzug an Bord, Beute 100, Startgold | Intro-Kino (5 Bilder) ok · hist_lindisfarne · k1 |
| 1 Ruhm | Beute 700 | nein/sehr schwer | Mehrfronten nötig (Schätzung Runde 50–70) | Befund 2 | Beute 400, Beutequellen | – · vk_kap_raubzeit · k2 |
| 2 Das Thing | Ruhm 60 | ja | Ruhm: Sieg +6, Eroberung +8, Beute/30; 28 nach 4 Raubzügen | wird mit Beute 700 ohnehin überschritten; Haken (Polen-Provinzen) getestet, ok | – | – · vk_kap_thronstreit · k3 |
| 3 Großes Heer | Briganten halten | schwer | Landung dort 1/6; von Votadiner 3/6 Siege, dann 7 Runden Belagerung, Heer 240 Mann (1 Lauf) | Northumbria 11 Provinzen im Passivlauf; Eroberung zerstört Beutequelle | Reihenfolge belassen, Sold senken | Kino k2 ok · vk_kap_jorvik · k4 |
| 4 Landnahme | Siedlung in Britannien | ja (Abkürzung) | `lnCan`/`lnStart` geprüft, Frist 16, nach 6 Runden Siedlung (landnahme_t) | 165 Gold bei Defizit | – | – · vk_kap_landnahme · **kein Sprecher** (ki:0) |
| 5 Wedmore | Wahl | ja | beide Wahlen fehlerfrei; Taufe: `bapt=tauf`; Treue: Ruhm +15 | Folgen über Runden hier nicht gemessen (landnahme_t) | – | k3 + e1/e2 ok · vk_kap_burhbau · **kein Sprecher** (nur Kino-Sprecher) |
| 6 Paris | 1 von Kaleter/Parisier/Lexovier | ja (leicht) | Kriegserklärung, Fahrt 3 Runden, Landung 7/7 Sieg + Eroberung | zu früh lösbar | Ziel Parisier | – · vk_kap_danegeld · k5 |
| 7 Normandie | Wahl | ja | „Lehen“: Kaleter + Lexovier eigen, Frieden 10 Runden; „plündern“ +400 Gold/+400 Beute | Befund 10 | – | – · **Ersatzbild ev_thron** · k6 |
| 8 Waräger | 1 von 4 Binnenprovinzen | schwer | nur Landzug, siehe Befund 5 | kein Seeweg, unaufgedeckt | Ziel/Seeweg/`reveal` | – · **Ersatzbild ev_conq** · k7 |
| 9 Miklagard | Wahl | ja | Garde: 2 Warägergarde bei „Harald Hardrada“ in Viken, +400 Gold (Sold +22); Handel: Steuern +10 % | keine Karte/Reise | – | – · **Ersatzbild ev_thron** · k8 |
| 10 Island/Grönland | Wahl, 300 Gold | ja (mit Gold) | Ruhm +20, Flag | Befund 9 | Text/Wirkung | – · **Ersatzbild ev_thron** · k9 |
| 11 Vinland | Wahl, 400 Gold | ja (mit Gold) | Ruhm +30, Flag | Befund 9 | wie oben | – · hist_vinland · k10 |
| Saga-Ende | 3 Optionen | ja | `scenWin`, Rang Silber (≤ 64 Runden) sonst Bronze, Vermächtnis +1 Modifikator; Gold-Rang nur mit Beute ≥ 1500 und Vinland | – | – | – · sc_wikinger · wikinger_ende |

**Zeit:** `turns:80`; Fristverlängerung (`scenStepTime`) setzt je Schritt nur „mindestens N Runden übrig“, N = [8, 8, 8, 8, 16, 3, 12, 3, 14, 3, 3, 3] (Summe 89). Schritt 1 allein sprengt realistisch 80 Runden; danach gilt für jeden Schritt nur sein N-Fenster („Die Zeit ist abgelaufen“). Ein Vorankommen in 80 Runden ist nach den Messungen nur mit den Änderungen aus Befund 1–4 realistisch.

**Konsole:** keine Seitenfehler, keine Warnungen aus Haken/Wahlen/Kino in allen Läufen. Gleiche Menge Kino-/Bilddateien wie in `kino_vk_t` (19/19 laut Backlog, hier nicht neu ausgeführt).
