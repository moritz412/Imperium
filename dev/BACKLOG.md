# Backlog – Imperium der Epochen 2 (Stand 28.10.2026 abends, v203 fertig auf Branch w2-england, unveröffentlicht bis Freigabe)

## ÜBERGABE an den nächsten Chat (zuerst lesen)
- **W2 England fertig (v202/v203, Branch `w2-england`, nicht committet/deployt):** Burh-Gebäude (britisch, Ep 1–2, Abwehr gegen Raubzüge), Wikinger-Szenario mit 4 Königreichen (Wessex usa, Mercia mogul, East Anglia vijaya, Northumbria briten; `caps`), englische Stadtbilder aus `models/c_en.json` (`enPre`, `enCityGeo`; angel/dane). Tests: smoke 4/4, raub 19/19, burh_t 20/20, en_stadt_t 8/8. Echtes iPad nicht getestet, GFX „mittel" nicht angesehen.
  Offen W2: Burh-Bild (Rückfall Grenzwall-Bild) → FLUX; `dane_haus_gross` (Job 23) fehlt → Rückfall angel_haus_gross; Städte wirken im Screenshot eher klein (dev/tests/shot/w2_england.png), Helligkeit gegen Nachbarstädte prüfen; alte Wikinger-Spielstände kennen die neuen Reiche nicht; chkf.sh braucht python3 (auf dem PC nicht im PATH, nur `r3venv`).
- Nächstes Paket: **W3** Landnahme/Glaubenswechsel/Danelag, dann W4.
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
  r3 auf dem PC: eigene Umgebung `Desktopimperium-bilder3venv` (trimesh usw.), `PYTHONUTF8=1` setzen; shot.js braucht lokale Pfade.
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
