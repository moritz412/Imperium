# Backlog – Imperium der Epochen 2 (Stand 29.10.2026 morgens, v215 veröffentlicht)

## ÜBERGABE 29.10. (zuerst lesen)
- **Entscheidungen Moritz 29.10. 12:31:** Wikinger-Umbau ja (W5 = Phase A+B, W6 = Phase C+D), Hannibal-Kampagne jetzt (H1–H4, nach W6), Elefant im Schlachtsystem vorziehen, **Figuren baut Moritz selbst am PC** (`dev/pc/figuren_bauen.md`, Skripte `dev/pc/blender/`, MPFB + CMU-Mocap, Lizenzen geprüft).
- **v217 (W5) veröffentlicht:** Raubzeit-Sperre (England vor Schritt 3 nur Raubzug, Wessex bis Wedmore, Grund in Rückfrage), Großes Heer (Ivar und Halfdan, 8 Einheiten an Bord vor East Anglia), Pferde-Wahl East Anglia, Thronstreit Northumbria (Heere −50 %), Marionettenkönig bei Hauptstadtfall (außer Wessex), Winterlager (max. 2, Abwehr ×2, Garnison ≥ 80 %, Versorgung 3 Provinzen, nur außerhalb Skandinaviens). Rückfallbilder in `WIK_IMG` (TODO Job 42). Tests (Cloud): w5_t 49/0, smoke 4/4, v216 31/0, vk_flotte alle PASS, vk_kampagne 31/0 + alter BEFUND, raub 17/0, landnahme 40/0 (beide danach Screenshot-Timeout in der Cloud), uebersiedlung 34–35/35 (Lehen-Tribut schwankt, schon vorher). Nicht getestet: iPad, echte Touch-Ereignisse, ganze Kampagne gespielt. 
- **v218 (W6) veröffentlicht:** Alfred wird König (Beginn Landnahme), Wessex baut alle 6 Runden einen Burh + einmal Danegeld, Chippenham-Winter in Wedmore (Hauptstadt-Garnison halbiert, Sperre aufgehoben), Fyrd/Edington (bei Eroberung einer Wessex-Provinz oder nach 8 Runden; Kino k3 vor der Schlacht), Wedmore: Taufe/Treue + bei Sieg „Wessex unterwerfen“, Danelag-Vertrag (12 Runden Frieden; Danelag = icener, trinovanten, corieltauver, briganten, votadiner; Wessex = belgae_b, dumnonier, cantium, dobunner). Phase D gekürzt: 9 Schritte (Paris und Waräger weg, Island als Wahl im Vinland-Schritt). Alte Spielstände: `wikMigrate` rechnet Schrittindex einmal um. Platzhalterbilder vk_u_alfred/fyrd/danelag (TODO Job 42). Tests (Cloud): w6_t 45/0, w5_t 49/0, v216 31/0, vk_kampagne alle PASS, vk_flotte alle PASS, smoke 4/4, kino_vk 19/19 und kino_vk2 16/16 nur ohne Screenshot-Zeilen (Screenshot-Timeout in der Cloud schon vorher), landnahme 40/0 bis Screenshot. Nicht getestet: iPad, Touch, Edington in der echten Kampfansicht, ganze Kampagne gespielt.
- **Nächstes:** Moritz spielt Wikinger (v218) · am Abend Jobs 40–43 + erster MPFB-Körper · danach Hannibal H1 (Akt I, Seeweg-Sperre, Elefanten-Regeln).
- **Spieltest Wikinger (Moritz 29.10.):** Schiffe nicht selbsterklärend, Wessex in Runde 1 unterwerfbar, Northumbria-Pingpong, fühlt sich nicht wie „Wikinger erobern England“. Ursachen + Umbau-Vorschlag: `dev/docs/wikinger_nachbesserung.md`. Grundsatz neu: **Wer nachfragen muss, für den war es zu kompliziert.**
- **v216** (Sonnet): Ein-/Ausschiffen per Antippen mit Rückfrage, Wessex vor Wedmore nicht unterwerfbar, Eroberungen halten im Wikinger-Szenario (Garnison 60 %, Unruhe 2, kein Aufstand bei eigenem Heer vor Ort). Veröffentlicht 29.10. Tests (Cloud, Software-Rendering): v216_t 31/31, smoke 4/4, vk_kampagne 36 PASS (1 alter BEFUND Gold-Rang), vk_flotte 7/7, raub 17/17, landnahme 39/39, uebersiedlung 35/35. Nicht getestet: echtes iPad, echte Touch-Ereignisse (nur Funktionsaufrufe), Friedensangebote über mehrere Runden. Hinweis: raub/landnahme/uebersiedlung_t brauchen Argumente `../imperium.html 8772`.
- **Konzepte neu (warten auf Entscheidungen Moritz):** Wikinger-Umbau in Phasen (Raubzeit nur rauben / Großes Heer + Winterlager + Marionettenkönig / Alfred-Drehbuch + Edington + Danelag-Grenze) → `wikinger_nachbesserung.md` Abschnitt 5. Echtzeitschlacht-Umsetzungsplan → `schlacht_umsetzung.md` Abschnitt 7. Hannibal-Ablauf → `hannibal_ablauf.md` (Kampagne jetzt, Echtzeit-Sonderschlachten später). Lehren/Prüfliste → `lehren_kampagnen.md` (vor jeder neuen Geschichte anwenden).
- **PC heute Abend:** `dev/pc/auftraege_29_10.md` – Jobs 40 Hannibal-Bilder (106), 41 Schlacht-Ladebilder (54), 42 Wikinger-Umbau-Bilder (22, inkl. Miklagard neu), 43 Hannibal-Kino-Sprecher (7).
- **Befund Werkzeug:** Blender 5.2 läuft headless in der Cloud (`pip install bpy`), Playwright-Tests laufen in der Cloud mit Chromium aus npm (`@sparticuz/chromium`, `PW_CHROMIUM=/tmp/chromium`). Skelette/Animationen/Backen können in der Cloud gebaut werden; PC nur noch für FLUX/XTTS/TRELLIS. Ausgangsdaten (Grundkörper, Bewegungen) brauchen Freigabe je Quelle.
- **Schlacht-Profile (Sonnet, ungeprüft durch Moritz):** `dev/schlacht/` – 333 Truppenprofile (108 Sonder + 225 Grund), 20 Kit-Familien, 176 Charaktere (161 ohne Porträt → FLUX-Porträts nötig). Grob: M3 (Ostrom/Orient/Steppe, 67 Einheiten) und O1 (Ostasien, 48) sind zu breit für realistischen Stil → beim Rollout teilen. Befunde: sc_pachacutec_x1 zeigt römischen Soldaten; Dschingis Khan doppelt in SC_LEG (mongolen/temujin); zeitlich unpassende Figuren im Szenario kastilien (Hardrada, Håkon Jarl, Moctezuma, Atahualpa) prüfen; keine österreichische/schwedische Einheit für Leibwachen.
- **29.10. abends:** Jobs 40–43 laufen in der Warteschlange (Repo vorher per Pull auf v218). Antike-Kits A1–A8 von Moritz freigegeben → **Job 44_ausruestung_antike** (36 FLUX-Vorlagen, 18 feste Teile, Skript `dev/pc/ausruestung_antike.js`, Namen `teil_<art>_<kit>_<name>`, Budget je 1500/Textur 512 in `3d/a5_budget.json`, Sicherung `a5_budget_vor44.json`). Danach: Auswahl a/b → `3d/vorlagen_44/<id>.png`, dann `3d/44_ok.txt` anlegen; `3d_44.bat` (Moritz startet per Doppelklick) wartet auf beides und baut nach `3d/roh_44`. Nicht über TRELLIS, sondern Blender: Speer, Pilum, Sarissa, Wurfspeer, Schleuder, Treiberstachel (lang/dünn) sowie Kettenhemd, Linothorax, Tunika, Elefantendecke (bewegen sich mit). **Stand 21:30:** Jobs 40–44 fertig. Job 44 ausgewählt (Bogen `warteschlange/44_ausruestung_antike/bogen.jpg`, `auswahl.txt`): 13 Teile → TRELLIS fertig (21:26, 5,6 min, `3d/roh_44/*.glb`, 856–1997 Dreiecke; Optik nicht angesehen, r3-Nachbearbeitung offen). Viele Vorlagen stehen auf Museumsständern → nach `sockel.py` Ständerstangen in Blender entfernen. Falsch kamen 5 Teile (A2-Helm korinthisch statt Kegel, Pectorale als Weste, Scutum rund, Gladius mit Parierstange, Falcata gerade) → **Job 45** in der Warteschlange seit 21:30 (`warteschlange/45_ausruestung_neu`, 15 Bilder, `node dev/pc/ausruestung_antike.js <items.json> 45`); danach eigenes `3d_45.bat`. Job 43: `pruef.json` aus Job 28 prüft ALLE alten Clips (525, 108 neu gesprochen nur im Job-Ordner, nicht eingebaut) und läuft vor dem Sprechen → die 7 Hannibal-Clips sind **ungeprüft**; für neue Clips eigene Prüfung nötig. Hinweis: `3d_*.bat` per PowerShell `Start-Process` gestartet fand `environment.bat` nicht – per `cmd /c` oder Doppelklick starten. Versehen: `imperium-bilder\items.json` (alte Datei vom 18.10. für run.bat/probe*.bat, Inhalt unbekannt) wurde mit der Teile-Liste überschrieben – Skripte von damals nicht mehr nutzen.
- **29.10. 22 Uhr – Figuren baut Claude am PC** (Moritz: „am PC gebaut, nicht aus dem Netz gezogen, aber durch dich“; MPFB + CMU erlaubt). Blender 5.2.3 portable + MPFB 2.0.18 + MakeHuman-Grundpaket installiert, Körpertest headless ok, Skelett `cmu_mb` (31 Knochen, CMU-Namen) gewählt. Job 45 + TRELLIS 5 Teile fertig (`3d/roh_45`, Falcata-Klinge eher Säbel). Alle 18 Antike-Teile roh vorhanden. Details: `dev/pc/figuren_bauen.md` Abschnitt 0. 23 Uhr: 45 CMU-Aufnahmen geladen (Liste dev/pc/blender/cmu_auswahl.tsv; Reiten, Speer, Schild fehlen bei CMU → keyframen). 22:40: CMU Subject 02 geladen, Gehen + Schwertkampf auf den Körper übertragen (Bild `dev/pc/blender/cmu_test.jpg`). Nächstes: Stehen/Treffer/Fallen-Aufnahmen suchen, Schleifen schneiden, `sk_mensch.glb` mit 3 Körpern bauen, `pruefen.py`/`backen.py` daran testen, r3 für die 18 Teile.
- **Befund Hannibal-Code:** Startheer in Latium und Hook 9 heißen beide „Publius Cornelius Scipio“ (Vater/Sohn) → umbenennen beim Hannibal-Paket.

## ÜBERGABE 28.10. (älter)
- **W2 England fertig und veröffentlicht (v203, 28.10.):** Burh-Gebäude (britisch, Ep 1–2, Abwehr gegen Raubzüge), Wikinger-Szenario mit 4 Königreichen (Wessex usa, Mercia mogul, East Anglia vijaya, Northumbria briten; `caps`), englische Stadtbilder aus `models/c_en.json` (`enPre`, `enCityGeo`; angel/dane). Tests: smoke 4/4, raub 19/19, burh_t 20/20, en_stadt_t 8/8. Echtes iPad nicht getestet, GFX „mittel" nicht angesehen.
  Offen W2: Burh-Bild (Rückfall Grenzwall-Bild) → FLUX; `dane_haus_gross` (Job 23) fehlt → Rückfall angel_haus_gross; Städte wirken im Screenshot eher klein (dev/tests/shot/w2_england.png), Helligkeit gegen Nachbarstädte prüfen; alte Wikinger-Spielstände kennen die neuen Reiche nicht; chkf.sh braucht python3 (auf dem PC nicht im PATH, nur `r3venv`).
- **W3 fertig und veröffentlicht (v204, 28.10.; Versionsanzeige zeigt weiter v203, da OFF_VER unverändert):** Landnahme (Lager → Siedlung 6 R. → Heimat 14 R., Steuern/Wachstum +10/20/30 %, ab 3 Siedlungen Beute ×0,8 und Bau −10 %), Taufe/Treue-Wahl mit Rückfall (40 %), Danelag-Mischkultur (Angleichung ×1,5 / ×1,2), Wikinger-Kapitel + „Akt II · Landnahme" und „Akt II · Wedmore"; Engländer/Franken im Szenario fest christlich. Alle Werte in Konstante `LN`. Tests: smoke 4/4, raub 19/19, burh 20/20, glaube 7/7, help ok, landnahme_t 42/42. Nicht getestet: echtes iPad, KI-Taufe, Thronstreit-Aufschlag.
  Offen W3: Taufe-Bild (jetzt `ev_mission`, passt nicht) → FLUX; Taufe kostet über die vorhandene Glaubenslogik mehr Ordnung als −1 (Test: Kernland 3,6 → 0,6) – beim Spielen bewerten; alte Spielstände im Wikinger-Kapitel können durch die 2 neuen Schritte verrutschen; neue Schritte ohne Sprecher.
- **W4 fertig und veröffentlicht (v205, 28.10.):** Wikinger-Kino: Seq. 1 beim Start, Seq. 2 bei „Das große Heer", Seq. 3 „Edington" vor der Wedmore-Wahl (immer Niederlage, ohne Siegbild), Ende A/B nach Taufe/Treue; Kapitelbilder vk_kap_* je Schritt; Taufe-Fenster mit vk_e1_taufe. Pakete img/pk_vk.json (1,6 MB), audio/x_wikinger_kino.json (2,5 MB), OFF_VER v205. Tests: smoke 4/4, landnahme 42/42, kino_vk_t 19/19. Nicht geprüft: Erzähler-mp3 per Whisper, Untertitel-Timing mit Ton, echtes iPad.
- **Lückenbilder fertig und veröffentlicht (v206, 28.10.):** 65 Bilder aus Job 34 (Auswahl: warteschlange/34_luecken_bilder/auswahl_bogen.jpg + auswahl.txt), Pakete img/pk_lk.json (55 Gesandte, 1,7 MB) und pk_lb.json (Gebäude, Artillerie, ui_waren/ui_maerkte, 0,5 MB); heroImg nimmt Epochen-Fassung vor _x1; Börse jetzt gemaltes b_boerse statt wi_boerse (Moritz bestätigen). luecken_t 15/15, smoke 4/4. Schwach: b_giesserei (schriftähnlich), vm_chinesisch/japanisch (Pseudo-Schrift, Hintergrundfiguren), vm_keltisch (Lilien), vm_indigen (Prärie-Federhauben), u_art_e0. Artillerie-Namen geprüft: Torsionsgeschütze/Katapulte/Bliden – stimmt.
- **v207–v209 veröffentlicht (28.10.):** Reichsvolk-Kachel, 42 Erklärtexte (offen ohne Text: Hof-Reiter „Stände und Völker", „Ernennen", Diplomatie-Reiter, Dialog-Fußknöpfe); chkf.sh läuft mit Node; 9 Sprecher-Clips geschnitten (Hörtest Moritz: temujin_k2, nobunaga_k5); Job 35 eingebaut (Burh-Bild – Mauer wirkt eher steinern –, Gießerei, Ballisten, Gesandte chinesisch/japanisch). Offen: Indigene-Gesandte weiter mit Prärie-Federhauben; Achtung: tts_pruef.py-Neulauf würde die Schnitte überschreiben.
- **v210–v211 veröffentlicht (28.10.):** dane_haus_gross aus TRELLIS Job 36 in models/c_en.json (en_stadt_t 8/8, max. 4977 Dreiecke; Optik nicht im Bild geprüft, shot.js hat noch Linux-Pfade); rat_marschall_foederaten_01 neu gesprochen (Job 37, „Die Föderaten werden unruhig …“, Whisper fehlerfrei).
- **Entscheidung Moritz 28.10. abends – Übersiedlung („Die Heimat verlegen“):** angeboten, wenn eine Landnahme-Provinz Stufe Heimat hat und dort die Hauptstadt steht; neue Region wird Kernland. Alte Heimat: Wahl im Spiel (behalten / einem Jarl als Lehen → Verbündeter mit Tribut / aufgeben → frei, dafür Gold + Gefolge ziehen mit). KI darf selten übersiedeln. Reihenfolge: erst Übersiedlung (zusammen mit Funden der Kampagnen-Prüfung), parallel PC-Jobs 38 (Kinobilder Akt III–IV) und 39 (Sprecher kino5/6, landnahme, wedmore).
- **v212–v215 veröffentlicht (28.10. nachts):** v212 Startflotte (Hafen Vestfold, 3 Langschiffe); v213 Kampagne spielbar nach Prüfbericht dev/docs/pruef_wikinger_kampagne.md (Raubzug an Bord für Seeräuber, Landung bei Bernicia plündert, Beute-Ziele 100/400, Startgold 400, Sold Feindesland ×0,5/daheim ×0,7, KI-Schonfrist 25 Runden, Waräger erreichbar, stSkip mit Folgen, Jahre je Schritt bis 1000, Paris/Normandie/Island/Vinland-Kosmetik); v214 Übersiedlung (UB-Block, Fenster + Knopf im Provinzfenster, behalten/Lehen/aufgeben, Kernland F.kern, KI 2 %); v215 Kino II (Seq. k5 Waräger, k6 Nordmeer, 6 Kapitelbilder, Sprecher Landnahme/Wedmore; pk_vk2 1,2 MB, x_wikinger_kino2 1,5 MB). Tests: vk_kampagne_t ALLE PASS (2 Läufe), kino_vk2_t 16/16, uebersiedlung_t 35/35 (Lehen-Tribut-Prüfung schwankt unter Last), landnahme 42, kino_vk 19, smoke 4/4. Offen: Bilanz bleibt leicht negativ (−15 bis −20/Runde, Beute gleicht aus); vk_k4_miklagard zeigt Minarette (neu erzeugen); Landnahme-Clip mit „Punkt“-Einschub (Schnitt nicht eindeutig besser, Original behalten); Vasallen-Tribut 25 % statt gewünschter 20 % (gilt global); Hörtest + iPad fehlen.
- Wikinger-Paket damit komplett (W1–W4). Nächstes freigegebenes Paket: **Hannibal** (`konzept_hannibal.md`, Kino) – laut Echtzeitschlacht-Empfehlung erst nach dem Schlachtsystem; vorher mit Moritz klären.
- Fertig im Code (v199–v201): W1 Raubzug & Verwüstung; Artillerie-Namen; Völkerbilder laden; Waren/Märkte-Bild + Ring; Erklärkarte (lange drücken, `HELP_ACT` 96 Einträge); Reichsvolk-Kachel (`rkHtml`); Beute Raubvölker ×3/×2,5, erste Runde nur Verwüstung, Wikinger-Flussfahrt im Raubzug (halbe Marschkosten).
- Tests v201: smoke 4/4, raub 19/19, help 15/15 (v200: bed1 26/26, bed2 34/34, reach_fo_des2 120/120). `bed3_t.js` bricht ab (`HD is not defined`, Testskript veraltet).
- PC-Warteschlange: Job 33 (Wikinger-Kinosprecher) und 34 (130 Lückenbilder) – Ergebnisse auswählen und einbauen (heroImg: Epochen-Fassung vor _x1 bevorzugen; Artillerie u_art_e0–e2 in PIC.unit; b_* in PIC.bld; ui_waren/ui_maerkte als Paket).
- Kosmetik offen: Reichsvolk-Kachel läuft rechts an den Schließen-Knopf; Erklärtexte für Handel/Forschung/Agenten fehlen noch.
- Arbeitsweise: neuer Chat je Paket, Sonnet für Umsetzung, kurze Zusammenfassungen statt langer Ausgaben.

## Läuft / gleich als Nächstes
- v200 (unveröffentlicht): Lange drücken (0,5 s) auf Knopf/Karte/Plakette = Erklärkarte (zentraler Mechanismus, HELP_ACT, 96 Texte; Rechtsklick am PC), einmaliger Tipp-Toast, Zeile in der Hilfe; Hof › Völker: Kachel „Reichsvolk“ mit Anteilen, „Angleichung an die …“. Test tests/help_t.js. Offen: Texte für weitere Bereiche (Handel, Forschung, Agenten, Szenarien-Knöpfe), echtes iPad (Dauer, iOS-Menü) ungetestet.
- v199 (unveröffentlicht, Paket W1): Raubzug, Verwüstung/Erholung, Raubvölker-Profile, Abwehr, Danegeld, Ruhm aus Beute (Konzept konzept_raubzug.md Punkte 1–5). Test tests/raub_t.js. Offen: Punkt 6 Sesshaftwerdung + Glaubenswechsel (eigenes Paket), Korsaren nicht gebaut, Burh-Gebäude (England) erst im England-Paket. Echtes iPad nicht getestet.
- v198 (unveröffentlicht): 4 Sprechersätze verdrahtet (Thronstreit-Warnung, Putsch-Ehre, Völker-Wunsch, Völker zufrieden); Hinweis bei neuer Epoche, wie man Ostafrika/Indien/Amerika erreicht.
- Erledigt bis v194: Bilder Paket 2 + 20 Völker-Porträts (pk_p2), 17 Sprechersätze (in x_rat, verdrahtet über RATV_P2-Muster im Protokoll, Sold-Warnung, Angleichen).
  Rest: rat_marschall_foederaten noch leicht fehlerhaft gesprochen; rat_kanzler_thronstreit_warnung, _putsch_ehre, _volk_wunsch, _volk_zufrieden sind geliefert, aber noch nicht verdrahtet.
- 8 kurze Sprechersätze halluzinieren weiterhin → per Whisper-Wortzeiten schneiden (Liste: warteschlange/28_tts_pruef/bericht.json, erste 8 Keys; Prüfskript tts_pruef.py). Angefangen 28.10., zurückgestellt für Konzept Echtzeitschlachten.
- Angelsächsische Halle (`angel_halle`) neu: fertig aufbereitet (Dach dicht, Sockel weg, 1760 Dreiecke) in `3d/roh_32/r3/angel_halle_ns.glb`,
  Vorschau `bogen_ns.jpg`. Ins Paket erst mit dem Wikinger-Paket. Alle 12 England-Modelle jetzt lokal aufbereitet: `3d/roh_21/r3/*_ns.glb` (Bogen bogen.jpg);
  Hof-/Lagerflächen bei kloster, markt, lager, mauer bewusst als Boden behalten.
  r3 auf dem PC: eigene Umgebung `Desktopimperium-bilder
3venv` (trimesh usw.), `PYTHONUTF8=1` setzen; shot.js braucht lokale Pfade.
- Technikbilder `tk_<id>` (82 Techniken ohne Einheiten/Eigenes Wissen, 1:1) + Banner aus `assets_design.md` (16:9),
  erzeugt mit `dev/pc/tech_bilder.js`: Probe Job 29_tech_probe (8 Techniken + ev_urkunden) fertig, Bogen in warteschlange/29_tech_probe/bogen.jpg; Hauptauftrag
  31_tech_bilder fertig; Auswahl (81 Techniken + 7 Banner) in warteschlange/31_tech_bilder/auswahl (Liste auswahl.txt).
  Armbrust auch im 2. Versuch nur Bögen → bleibt beim alten Bild.
  v196 eingebaut: Paket img/pk_tk.json (1,7 MB), RIMG, Schatzkammer, Urkundenkammer, Grafikstufen; alte Bilder als Rückfall. Nicht veröffentlicht.
- Hof-Reiterleiste (Familie, Feldherren …) noch im alten Stil.

## iPad-Test Moritz 28.10. (v194, Screenshots im Chat)
Darstellung (ein Paket): STAND v195 (Quelle bearbeitet, nicht gebaut/deployt, echtes iPad nicht getestet):
- Diplomatie-Symbol in der Kopfleiste sticht weiterhin heraus (rotes Siegel), trotz Dämpfung in v193. [v195 erledigt: Siegel jetzt Bronze statt Rot + Sättigung gedämpft; kein Badge am Knopf vorhanden]
- iPad: grauer Balken am unteren Rand; Kopfleiste oben zu nah am Bildschirmrand (Safe-Area/Höhe prüfen, PWA-Modus). [v195 teils: Kopfleiste und abhängige Elemente +7 px unter der Statusleiste (nur mit Safe-Area), html/body dunkel; Ursache des grauen Balkens am echten iPad NICHT belegt, bitte auf dem iPad prüfen]
- Hof › Ämter (Posten): Kacheln zerschossen – Spalten ungleich hoch, Kopfkarten oben abgeschnitten, große Lücken. [v195 teils: gleich hohe Reihen, Blöcke breiter, Texte umbrechen sauber; den genauen Fehler aus dem iPad-Bild konnte ich im Browser nicht nachstellen]
- Feldherren-Übersicht: großes Szenenbild je Feldherr dominiert und wiederholt sich → kleiner/nur beim ausgewählten oder je Titel variieren. [v195 erledigt: nur 84-px-Banner beim ersten Feldherrn der Liste]
Karte (ein Paket):
- Hafen-Modell mit bunten Dreiecken. [v197: Ursache `MDL_FIX.lift` hellte fast schwarze Flächen mit zufälligem Farbton auf → jetzt entsättigt. Nur rechnerisch geprüft (grelle Ecken m_hafen_med 3082 → 426), nicht im Bild]
- Städte teils zu dunkel. [v197: 15 dunkle Dioramen-Texturen (nord, eu_ma, eu_ant_1, jp, nordam_2 …) per `DIO_HELL` ×1,1–1,4 aufgehellt. Nicht im Bild geprüft]
Spielregeln (Entscheidung nötig):
- Statthalter: „Auftrag“ (GOV_DIR, baut aus der Regionskasse, plus Wirkung) und „Bauvorlagen“ (TPL, plant je Siedlung bei leerer
  Bauschlange) überschneiden sich, dazu das Stadtprofil im Provinzfenster. Vorschlag: im Statthalterfenster nur Auftrag;
  Bauvorlage nur noch als Ausnahme je Stadt im Provinzfenster.
  [v197 Weg A umgesetzt: mit Statthalter keine Bauvorlagen mehr (Regionsfenster zeigt Hinweis, Auto-Bau nach Vorlage ruht); ohne Statthalter wie bisher. Geprüft per Browser-Test, smoke 4/4]
- Treue/Zufriedenheit von Feldherren und Statthaltern intransparent → Ursachen sichtbar machen (was hebt/senkt, Ziel, Trend).
  Freigegeben (Moritz 28.10.): Ziel-Wert + Pfeil neben dem Balken, Gründe-Liste darunter; Erfolge (Siege, Eroberungen, gute Verwaltung) sollen Treue heben.
  [v197 umgesetzt: Zeile „▲/▼ Ziel NN · Gründe“ bei Feldherren und Statthaltern; Erfolge der letzten 12 Runden: Feldherr +5 je Sieg/Eroberung (max. +15), Statthalter +3 je Bau/Aufstieg (max. +12); Landgut +15 jetzt wirklich im Ziel (war nur angezeigt). smoke 4/4, pk2 19/19]

## Fehlende Bilder (Prüfung 28.10., Browser-Audit aller 23 Kulturkreise)
- Gebäude ohne jedes Bild: Salpetersiederei, Pulvermühle (ab Ep. 1), Geschützgießerei (ab Ep. 2), Stelenfeld, Börse (ab Ep. 3) → FLUX.
- Völker-Porträts fehlen ganz: habescha, indigen, japanisch, koreanisch, suedostasiatisch (Ersatz: Einheitenbild/Epochenbild).
- Völker-Porträts im Mittelalter: Ursache Nachladen – `pk_p2` wird nie vorgeladen, Hof zeichnet nach dem Laden nicht neu → Fix im Code (nach W1).
  Außerdem nur eine Fassung je Volk (_x1, antik wirkend) → Mittelalter-/Neuzeit-Fassungen (_m1/_n1) als Vorschlag.
- Feste Pfade ohne Datei/Paket: img/g_getreide, img/g_gewuerz (Wirtschaft-Kacheln), po_reichstag, po_lehnseid, sc_nuernberg_x1, sc_berlin_x1 (prüfen, ob Rückfall greift).

## Entscheidungen Moritz 28.10. (nach Prüfungen)
- Erklärungen: **lange drücken = Erklärkarte** (keine Wirkungszeile).
- Reichsvolk: **nur anzeigen** (kein Wechsel).
- Bilder: **alle fehlenden** → Job 34_luecken_bilder (130 Bilder: Völker-Gesandte _m1/_n1 für 25 Kulturen + _x1 für 5 fehlende,
  5 Gebäude b_*, Artillerie u_art_e0–e2, ui_waren, ui_maerkte; Skript dev/pc/luecken_bilder.js).
  Beim Einbau: heroImg muss Epochen-Fassung (_m1/_n1) vor _x1 bevorzugen, sonst Zufallsmischung.

## Wirtschaftsmenü (Moritz 28.10.: „deutlich schöner“)
- Unterreiter „Waren“: Bild fehlt – Ursache `img/g_getreide.webp` existiert nicht (Z. ~4141), ebenso `img/g_gewuerz.webp` bei „Märkte und Wege“ → vorhandenes Bild nehmen bzw. FLUX-Motiv.
- Waren-Kacheln: Prozentzahl ragt in den Ring (`.ering b` 14 px bei 64-px-Ring) → Schrift kleiner, „%“ klein absetzen.

## Truppen-Prüfung 28.10. (22 Kulturen × 5 Epochen × 5 Rollen)
- Speer/Nahkampf/Fernkampf/Reiterei: überall Name und echtes Bild vorhanden.
- Artillerie: Ep0 Name „Kanonen“ (falsch für Antike) + nur gezeichneter Platzhalter; Ep1/Ep2 Name „undefined“ (EPOCH_UNIT_NAMES[1/2].art fehlt) + Platzhalter.
  Fix: Namen (Antike Torsionsgeschütze, Frühmittelalter Katapulte, Hochmittelalter Bliden/Tribok) + 3 Bilder per FLUX.

## Verständlichkeit (Moritz 28.10.: „Tross aufstellen · 72 Gold – was macht das?“)
- Tross: Nachschub reicht 3 statt 2 Provinzen über eigenes/verbündetes Land hinaus; ohne Nachschub verliert ein Heer 2 % Männer je Runde; Unterhalt 5 Gold/Runde (× Epochenfaktor); geht bei Niederlage verloren.
- Ideen ohne Mauszeiger: (1) Wirkungszeile unter jedem Befehlsknopf, (2) Lange drücken = Erklärkarte (überall gleich), (3) Vorschau auf der Karte (z. B. Nachschub-Reichweite einfärben), (4) einmaliger Ratgeber-Hinweis beim ersten Mal.

## Völker im Reich – Frage Moritz 28.10.
- Hauptvolk = Kultur des eigenen Volkes (`facCul`), bei Rom `latein` (im MA „Italiener“). Provinzen gleichen sich daran an (`P.cp`), fremde Kultur ab 6 Provinzen = Volk im Reich.
- Problem: Hauptvolk steht nirgends; ein Reich mit Kern in Gallien bleibt „italienisch“, Franzosen erscheinen als Fremdvolk.
- Vorschlag: (1) Kopfzeile „Reichsvolk“ im Völker-Abschnitt + Anteile; (2) Entscheidung „Reichsvolk wechseln“, wenn ein Volk Mehrheit hat und die Hauptstadt hält (Vorbild Franken/Normannen). Wartet auf Entscheidung.

## Wikinger-Paket (läuft seit 28.10.)
- W1-Entscheidungen Moritz: Danegeld bleibt Tribut ohne Waffenstillstand · Beute für Raubvölker deutlich höher (Plan: Wikinger ×3, Steppe ×2,5 statt ×1,2/×1,1; an armer Provinz prüfen, „ggf. noch mehr“) · erste Runde nur Verwüstung, alte Überfall-Halbierung entfällt · Wikinger landen auch ohne Hafen/Flotte vom Fluss aus. → nach Erklärkarten-Agent umsetzen (v201).
- W1 Raubzug & Verwüstung (Sonnet, v199) · W2 England-Schauplatz · W3 Landnahme/Glaubenswechsel/Danelag · W4 Kapitel + 4 Kinosequenzen.
- Kinobilder ausgewählt: warteschlange/22_kino_bilder/auswahl_vk (23, Liste auswahl_vk.txt; vk_k1_kloster schwach).

## Freigegebene Pakete (Reihenfolge)
1. Wikinger-Paket: Raubzug & Verwüstung (`konzept_raubzug.md`), England 865–950, Glaubenswechsel, Kino (`konzept_kino.md`).
2. Hannibal-Paket (`konzept_hannibal.md`), Kino.
3. Spätspiel Paket 3 (`konzept_spaetspiel.md`): Ambitionen & Epochenwertung, Urteil der Geschichte (C),
   Zeitenwenden (F), Mächte ohne Land (G), Reichsteilung (D, höchstes Risiko).

## Neu: Echtzeitschlachten (Moritz 28.10.)
- Konzept-Entwurf `dev/docs/konzept_echtzeitschlacht.md`: gebackene Skelett-Animation auf der GPU, Ladeschirm, größere Felder, PC-Pipeline (Blender, CC0, TRELLIS).
  Phase 0 auf dem iPad bestanden (Abschnitt 9: 60 B/s bei 4.000 Figuren, Ladezeit 1,6 s). Entschieden (Abschnitt 8): iPad Pro 11" 2. Gen (A12Z), realistisch, alte Schlacht entfällt später, PC darf Blender/CC0 laden. Empfehlung: Phase 0 vor Wikinger, Hannibal nach Schlachtsystem.

## Zurückgestellt / zu entscheiden
- Agenten (Hof › Agenten) überarbeiten: wirken kaum spürbar, viel manuelle Arbeit, wenig Spaß (Moritz, 28.10.).
- KI-Charakter, geführter erster Zug, Ziel/Finale im Endlosspiel.
- Forschung: Querverbindungen zwischen Bereichen, Geistesblitze ausbauen (nicht freigegeben).
- Kartentextur: Apennin im Winter mit etwas Schnee? Sandrippeln abschwächen, falls störend.

## Bekannte Testschwächen
- `pk2_t.js` „3 Runden mit neuen Reichen“ schlägt unter Last gelegentlich fehl (nur 2 Runden in der Wartezeit).
- Klick-Zeitüberschreitungen in `reach_*` unter hoher Last (Software-Rendering) – kein Spielfehler.
