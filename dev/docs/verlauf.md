# Nachtplan 17./18.10. (Moritz: so viel wie möglich, alles Besprochene umsetzen, eigene Features erlaubt, morgen Konzepte bereit)

Regeln: höchstens EIN Browser-Agent neben XTTS (RAM). Agent arbeitet auf eigener Kopie (par_X, Basis baseN = Hauptdatei beim Start), danach git merge-file, chk.sh, integ2b, veröffentlichen (sed Titel → imperium_v2.html, Artifact publish url PyZz7hqCpdVrU68A3brsTs). Nicht-Browser-Agenten dürfen parallel.

Warteschlange Browser-Agenten (der Reihe nach):
1. [fertig, zusammengeführt] Ordnung/Steuerdeckel + Einheitennamen je Kultur (par_ord, base10)
2. [fertig, veröffentlicht] Religion Stufe 1: eigener Staatsglaube F.rel, Toleranzpolitik, heilige Stätten mit Pilgergold, eigene Wirkung je Gotteshaus, Lehmmoschee nur Islam, Haus der Weisheit antik „Museion“
3. [fertig, veröffentlicht v105] Diplomatie Stufe 1: Gedächtnis mit Gründen, Ruf/Vertrauen, KI-Forderungen/Ultimaten, Durchmarschrecht, Bündnistreue (kein Separatfrieden)
4. Amerika Stufe 1+2: Koloniearten (Plantage, Mine, Pelzposten, Mission), Seuchenwelle, indigene Verbündete, Tributreich (Altepetl), Mit'a, Qhapaq Ñan, Rat der Haudenosaunee, Pferdekultur Ebenen; Mexiko/Peru/Zentralamerika-Titel
5. Fernhandel zwischen Kontinenten: Lager je Kontinent, nur Fernhandelsgüter regulär übers Meer, Sonderaufträge
6. Forschung je Kulturkreis: Neigungen (−25 %/+40 %), Wissensverbreitung über Nachbarn/Handel, Tech-Namen je Kultur
7. [fertig, veröffentlicht] Deutsche Kultur + Geschichten Nürnberg (Reichsstadt) und Berlin (Preußen) als neue SCEN; Titel/Ämter, Kurfürsten, Reichsstädte, Hanse
8. [fertig, veröffentlicht] Habescha/Eritrea-Paket (Adulis, Medri Bahri/Bahr Negash, Debre Bizen, Timkat, Kaffee), Geschichte optional
9. Medieval-III-Bausteine: Haltung „Sammeln“, Heeresverfassung je Epoche
10. Eigene Features (Ideen): Kartenansichten (Religion/Kultur/Handel/Unruhe), Statthalter-/Minister-Eigenschaften aus Taten, Barrierefreiheit (Schriftgröße)

Asien Stufe 1 veröffentlicht v106. Als Nächstes: Asien-Feinschliff + Welten neu (par_oas2, base15), dann Amerika 1+2.
XTTS: xtts/gen.py resumable (erst _intro, dann _ende, dann Rest); fertige mp3 → audio/x_<sid>.json, X_PACKS im Code ergänzen, veröffentlichen.
Erzähler (XTTS): alle 228 Aufnahmen fertig, gepackt, veröffentlicht v105. Standbilder: Paket img/in_<id>.json (IN_PACKS). Asien Stufe 1 läuft (par_oas, base14). Lokale Bilderzeugung wird geprüft (localimg).
Entscheidungen Moritz 18.10. 09:37: Asien und Amerika im Endlosspiel als aktive Auswahl/Abwahl beim Start (nicht pauschal). Japan: Spieler kann Shōgun werden (an Feinschliff-Agent gegeben).
Warteschlange neu: 11. Start-Auswahl Kontinente (Alte Welt fix, Ostasien/Amerika an/aus; abgewählt = Provinzen inaktiv, keine Spawns, schnellere Runden) – nach Amerika-Einbau.
Audit 18.10.: ✕-Fehler 1-3 + 2 Texte direkt behoben (Hauptdatei, unveröffentlicht). Moritz: Doppelte Systeme zusammenlegen + Wirtschaftssieg erreichbar = JA; Ordnungsabzüge entstapeln + Fensterflut bündeln = NEIN; Klarheitspunkte direkt einbauen = JA. Agent par_clean (base16).
Erinnern: 3D-Auftrag (Auftrag 2) sobald Bilder-Zip hochgeladen; dann Musik-Auftrag anbieten.
v107: Startepoche-Rücksprung + Wappen späterer Epochen + ✕-Fixes veröffentlicht.
Neu 10:24: 12. Fraktions-Detailbildschirm vor Start (Herrscher, Startgebiet-Minikarte, Besonderheiten, Einheiten, Schwierigkeit, dann „Starten“) + Startmenü wertiger.
Neu 10:25: 13. Diplomatie nach Kontinent/Schauplatz sortiert; Beziehungen/Diplomatie nur mit Reichen in Kontakt (Nachbarn, Schauplatz, Handel/Seeweg) – China–Karthago unrealistisch.
Konzept Hof/Statthalter/Waren/Bauen: scratchpad/konzept_hof.md (Entscheidungen offen).
Entscheidungen Hof (10:26): Statthalter-Abfall mit Vorwarnung (2 R., nie vor R30, abschaltbar) + Gegenmaßnahmen (absetzen, Beziehung/Treue verbessern: Geschenk/Ehre/Amt); Regionskasse 15/30/50 %; paralleles Bauen per Forschung: erst Hauptstadt, weitere Forschung dann ab Großstadt (bzw. Stadt); Pulver/Geschütze Pflichtware mit Aufpreis bei Mangel. Rest wie Empfehlung (Rat 1–2/Runde ohne Popup, Bericht alle 5 R., Stimmen 2 je Amt + Frauenstimme, Dörfer 1 Bauplatz nur neue Spiele).
Neu 10:26 HOHE PRIO: 14. Regionaler Look: Asien (chinesische/japanische Städte, Armeen, Atmosphäre), Amerika (Meso/Anden/Nordamerika), sichtbarer Dschungel, sichtbare Wüste, Steppe – 3D-Kits je Kulturkreis für Städte+Armeen, Gelände/Vegetation je Klima. PC-3D-Auftrag um asiatische/amerikanische Figuren+Gebäude erweitern.
Moritz 11:16: Vertonung auf PC verlagern, sobald dort Bilder fertig (Auftrag 3 XTTS: texts_neu.json + texts_volk.json schicken, Rest überspringen was hier schon fertig).
v109 veröffentlicht (Asien-Feinschliff + Aufräumen + worlds_v4). Nächster Browser-Agent: Amerika 1+2 + Kontinent-Auswahl (par_amk, base17).
v110: PC-Bilder (Pakete pk_*, in_a/m/n1/n2), Legionär als models/mdl_leg_s.json (.bin wird nicht ausgeliefert!). Nächstes: par_ev (base18) fehlende Ereignisse für unzugeordnete Bilder.
v111 (512 Dateien = Limit!): Amerika 1+2, Kontinent-Auswahl, 20 Ereignisse, Stimmen Nürnberg/Berlin (x_de.json). Nächstes: regionaler Look (par_look, base19); Dateien konsolidieren (snd).
v112: snd gebündelt (487 Dateien). 3D-Modelle (43 GLB) in scratchpad/pc3d → Agent par_3d (base20).
Moritz 15:38: Hauptarbeit bleibt in dieser Sitzung. Nur bei aufwändigen Sachen (Generierung Bild/3D/Stimme/Musik, große Batch-Tests/Balance-Simulationen) Auslagerung an PC VORSCHLAGEN, mit fertigem Auftrag.
v113: Volksgeschichten-Stimmen (stE*). PC Auftrag 4 Stadtbausätze+Pflanzen. par_ui (base21): Fraktionsdetail + Startmenü wertiger + Diplomatie nach Kontinent/Kontakt.
v115: Volk-Details, Startmenü, Diplomatie Kontakt. Nächstes: par_fig (base22) Sofort-Ersatz alter Figuren (inventar3d.md Abschnitt 4) + Bugs: Ming Haus Ottonen (dynOf/CUL_HOUSES), Manipellegion-Kachel, Rom kennt Ostasien (met), Funan chinesisch, Berlin Schritt 6.
Stadtbausätze (52 GLB) in scratchpad/pcstadt – einbauen nach par_fig (cityStyle je Kultur inkl. Ostasien, Vegetation je Klima). Nachbessern lassen: orient_haus_gross, veg_akazie, veg_kiefer, veg_steppengras.
v318 lokal = Figuren-Austausch + sauberer Start + Held-Fix (Test läuft, merged_test2). par_city (base23): Stadtbausätze+Vegetation.
Gruppe B (71 GLB) in scratchpad/pc3dB. Europa-Bausätze+Vegetation an Stadt-Agent. Rest (Häfen, Burg, Tiere, Karren, Belagerung, Lager, Betriebe, Brücken) später. Nachbessern: eu_nz_palais, ff_feuer, ff_zelt_ori, m_grabhuegel, s_fischer_med, s_fischer_nord, sg_trebuchet, sg_ramme, pp_wassermuehle.
v117 online. 22:08 geliefert: pcgeb (199 Gebäudebilder), pc3dA (44 Modelle Gruppe A), pc3dB2 (B mit Fixes palais/feuer/zelt_ori/grabhuegel + Tiere neu; fehlen noch s_fischer_med/nord, sg_trebuchet, sg_ramme, pp_wassermuehle). Agent par_more (base24).
v119 online. Feedback Moritz 19.10. 08:47: Laden deutlich länger (China Endlos); Bauern auf Feldern weg; Bäume = Pixelhaufen (Asien, Rom) → kaputt; 2 Brücken an einer Flussstelle; Felder zu viele → raus; Burg überdimensional; Städte zu kleinteilig/gepunktet → Fokus mittlere/ferne Zoomstufe, weniger aber schönere/größere Modelle, höchste Zoomstufe egal. Gut: Kühe, Figuren, Schiffe, Hafen. Später: UI-Thema je Kontinent.
Agent par_fix (base25).
v121 online (Dioramen). Musik (22 MusicGen-mp3) in scratchpad/pcmus, 3 Fixes folgen. Agent par_mus (base26).
v122: Musik (m_eu/or/as/sl, Fixes eu_nap/schlacht_ma/steppe), Ducking Erzähler, 16 ungenutzte Modelle entfernt (city*, gen*, general_rom). Ca. 498 Dateien.
v123: Hof/Statthalter/Beschaffung/Rat/Pulver/paralleles Bauen. Nächstes: par_theme (base28) UI-Optik je Kulturraum + Rom-Diorama-Lage.
v124: Kulturstil UI (10 Räume, Schalter), Volksauswahl-Minikarte als Bild, Diplomatiekarte zentriert, Diorama weg vom Fluss. Offen: Reiter-Farbe bleibt gold; integ bricht nach Epochenwechsel-Screenshot ab (auch v123, flaky); Pflanzen-Billboards (PC Auftrag 8).
Moritz 23:06: Geschichten-Ziele unrealistisch (Cäsar: am Ende 3 Regionen in 10 Runden, eine in Spanien ohne Vorankündigung). Agent par_goals (base29). Parallel par_tech (Forschung je Kulturkreis).
- 20.10. v327: Geschichten-Ziele geprüft (geschichten_ziele.md): Fristverlängerung je Schritt, Cäsar-Schluss Italien statt Hispanien, Kleopatra/Venedig/Ptolemäer-Ziele, Regionsaufträge begrenzt, Zieltext mit Region. scall2b 24/24.

## Backlog: Glaubens- und Diplomatie-Paket (Moritz 20.10.)
- Glaubenssystem einmal gesamt angehen: Tempelwirkung sichtbarer machen (Bekehrung, Glaubensstärke im Reich), Zusammenspiel mit Diplomatie.

## Glaube & Diplomatie – Entscheidungen Moritz 20.10.
- Heilige Stätten: 6–8 neue weltweit, an Glauben gebunden
- Diplomatie: mild (Familien/Rivalen ~±15)
- Heiliger Krieg alle Religionen: Phase 2
- Geistliche Häupter Patriarch/Kalif/Abuna: ja (Phase 2)
- Amerika: eigene Religionen ohne Kontaktmechanik

## Kartenansichten – Entscheidungen 20.10.
- 8–10 Ansichten in 3 Gruppen mit Symbolen; Modelle abdunkeln; Zahlen nur beim Antippen/Halten; Farbskalen farbenblindfreundlich Blau→Gold→Rot; neu Handel + Militär (Phase 1)

## Heer & Feldzüge – Entscheidungen 20.10.
- Kriegsmüdigkeit spürbar (ab 40 Ordnung/Steuern, ab 70 Rat drängt), Kriegsstand + Friedensbedingungen nach Verlauf
- Moral auf Karte ja (erschüttert 1–2 Runden)
- Heeresverfassung je Kultur: Phase 2 voll (aktiv+passiv, alte Aufgebote gehen auf)
- Heeresgröße wächst mit Epoche 10→12→14 (iPad-Übersicht prüfen)
- Feldherren: Ehrentitel + Ruhm, kein Altern

## Berater/Chronik – Entscheidungen 20.10.
- Berater sprechen: Dringendes + beim Öffnen des Rats, je Rolle eine Stimme (88 Clips, PC-Lauf nach Paket 11), Reaktionen selten (Standard), keine Beraterinnen (Standard)
- Chronik: Epoche→Herrscher, Chronist mit leichtem Pathos; KEIN Druck/PDF, kein Regal; umbenennen „Sammlung der Geschichten“ / „Das Buch des Reiches“

## Geschichten Asien/Amerika – Entscheidungen 20.10.
- Welle 1: Oda Nobunaga, Dschingis Khan, Dreibund (Tlacaelel), Atahualpa; Welle 2: Yi Sun-sin, Kublai; Welle 3: Zheng He, Naresuan; Haudenosaunee später mit eigener Rats-Mechanik
- Seefahrt: Held an Land, Seesieg/Flotte-vor-Hafen als Ziele
- Freischaltung: Gegenseiten als Bonus (Atahualpa nach Pachacútec, Kublai nach Dschingis)
- Vertonung (~69 Texte) + Standbilder (~32) als PC-Paket nach dem Schreiben

## Familie – Entscheidungen 20.10.
- Stammbaum mittel (Kinder, Enkel, Geschwister, Neffen, 2 Ahnen-Gen., max 24 Lebende), Baumansicht iPad
- Fremde Häuser: Herrscher, Partner, Erbe, Hausgesetz, Verwandtschaft in Diplomatie, nur bei Kontakt
- Personalunion: verbundenes Reich, Phase 2
- Erbrecht nach Kultur & Epoche (Frauen erben wo üblich, sonst Regentin); Konflikte mittel (Thronstreit max. alle 20 Runden)

- 20.10. Straßenbau bei Statthaltern höher priorisiert (+1,1 neu, +0,7 Ausbau in govRound); Messung offen (Last zu hoch)

## Nacht 20./21.10.
- v146 Kleinigkeiten (Straßen +1,8/+1,0, KI-Artillerie, Heldenwarnung), v147 Welle 3 (Zheng He, Naresuan; Stimmen/Bilder fehlen: job09_tts.json, job10_items.json bereit für Warteschlange)

- v148 Familiennamen nach Kultur, smoke-Fix (Startwelt-Jahr war Testfehler)
- v149 Haudenosaunee + Ratsfeuer; Integrationstest v149 22/22
- PC offen: scratchpad/jobs09_12.tgz (job09 x_asien3 TTS, job10 in_as3 Bilder, job11 x_amerika2 TTS, job12 in_am2 Bilder) → Warteschlange 09–12

- 21.10. Moritz: Beraterstimmen klingen schlecht betont (XTTS-Eingebaut-Sprecher) → job13: alle 88 mit Erzähler-Referenzstimme neu

- v156 Reisemodus (OFF, IndexedDB, three.js eingebettet). WICHTIG: bei neuen/geänderten Paketen OFF_MAN + OFF_VER neu erzeugen (Vorlage par_off/manifest.json). chk.sh prüft jetzt alle Skriptblöcke.
- Offen: job16 pk_vg (Volksgeschichten-Bilder) auf PC – abholen Montag (warteschlange/16_bilder_vg)

- v157 Offline-Fix: IDB speichert ArrayBuffer, Pakete mit Wiederholung, Cloud-Autosave wird lokal gespiegelt.
- ZIEL Moritz (mittelfristig): Spiel ohne Claude-Abo spielbar → eigene Web-App/PWA (z.B. GitHub Pages), Spielstand-Export/iCloud statt Cloud-DB, Lizenzen prüfen (MusicGen CC-BY-NC, XTTS nicht kommerziell).

## Standalone/PWA – Entscheidungen 21.10.
- Hosting GitHub Pages (Claude pusht Updates, sobald GitHub verbunden + Repo genannt)
- Sichtbarkeit: nur per Link, noindex (Hinweis: Pages-Repo im Gratis-Plan öffentlich)
- Spielstände: Export/Import über iCloud
- Mehrspieler in der App: abwechselnd auf einem Gerät

- v158: ENV artifact/pwa, Export/Import Datei. PWA-Build: scratchpad/pwa/build.py → site/ + imperium_pwa.zip. Wartet auf GitHub-Verbindung + Repo-Name.

- v160: Dreibund-Erbennamen ohne Tlacaelel/Nezahualcoyotl/Cuauhtemoc/Tezozomoc/Chimalpopoca/Itzcoatl/Moctezuma. general_rom: Aufruf ist auskommentiert, kein Fehler. Cäsar-404 nur sporadisch (1 von 3 Läufen), Bild kommt trotzdem. OFF_VER bleibt v156 (Paketstand; Wechsel erzwingt Neu-Download), Montag mit pk_vg erhöhen. Irokesen Schritt 2: Mechanik stimmig, nur „östlich“ (eher südöstlich) – steht so in der Vertonung, unverändert.

- 22.10.: Prüfung ergab: Glaube Phase 1 + Teile Phase 2 (Häupter, Heiliger Krieg, Amerika-Religionen) schon in v160. Offen: J Glaubenswellen ankündigen/Wahl, N Reformationskapitel, F Glaubensbund. Test shot/glaube_t.js 7/7.

- 22.10. Audit: alle Pakete Stufe 1 fertig. Offen Stufe 2: Karten (Diplomatie-Sicht+Bündnislinien, Forschung auf Karte, Sprünge, Überblendung, Zahlen-Etiketten), Heer (Feldzugsziele Spieler, Söldner/Tross), Berater (Doktrin-Sätze, Sprechanimation, Kartenausschnitt/Vorwort Chronik), Familie (Hausgesetz wechseln). Gestartet: par_karten2, par_heer2 (Feldzugsziele), par_glaube2 (J+N).

- v161: Karten Stufe 2 (Sicht von Reich X, Linien, Wissen-Ansicht, Auf-Karte-Knöpfe, Überblendung) + Glaube J/N (Wellen-Ankündigung+Wahl, Westfälischer Friede). Tests smoke 4/4, glaube 7/7, glaube2 12/12, karten2 13/13.

- v162: Feldzugsziele Spieler (a.fz, fzStep). Tests smoke 4/4, fz 14/14, karten2 13/13, glaube2 12/12. Offen Stufe 2: Söldner/Tross, Berater-Doktrin/Sprechanimation, Chronik-Kartenausschnitt/Vorwort, Hausgesetz wechseln, Glaubensbund (nicht entschieden).

- v163: Hausgesetz wechseln (D.lawT/lawSet), Buch des Reiches Karte je Kapitel (B.own). Tests smoke 4/4, fam3 8/8, bkmap 8/8, fz 14/14, karten2 13/13. PWA neu bauen bei nächster Gelegenheit.

- v164: Doktrin-Stimmen vorbereitet: ratVoBase → rat_statthalter_doc_<grp>_<bau>, Rückfall auf rat_statthalter_doc_01. job17_tts.json (30 Sätze) für Montag; Clips in x_rat.json einfügen, dann OFF_MAN/OFF_VER.

- v165: Söldner (Spieler, Kassenrisiko) + Tross. KI wirbt nicht, ausgenommen vom Risiko. sold_t 11/11, fz 14/14, smoke 4/4. par_gbund/par_anim basieren auf base64 → mit base64 als Basis mergen.

- v167: Sprechanimation Berater (ratSpeakFx, #ratSay). anim 7/7, sold 11/11, smoke 4/4.

- v168: Glaubensbund (d.gb, Goldhilfe), KI-KI-Chance 3%. gbund 13/13, karten2 13/13, glaube2 12/12, anim 7/7, smoke 4/4. Offen: längere KI-Messung (gbmess.js hängt bei Runde 10). PWA neu bauen.

- 23.10. 00:34 Moritz: „Bis morgen fertigstellen, was offen ist“. PC nicht erreichbar. Gestartet: KI-Langmessung (gbmess), par_klein (Tross in Nachschubzeile, ratSay-Überdeckung schmal, Cäsar-404-Rennen).

- KI-Langmessung 40 R: kein belastbarer Unterschied base64 vs v168 (Bündnisse 76,7/74,5 Rom; 71,3/72,7 Ep2). v168 bleibt. Messskript shot/gbm.js.

- v169: Tross in Nachschubzeile (+Fehler Reichweite 3 behoben), ratSayPlace, PB.fix für style.backgroundImage (Cäsar-404). smoke 4/4, sold 11/11, anim 7/7, gbund 13/13. Offen: 390px Umschalter Alte Welt/Ostasien über Befehlsfeld; einmalig smoke trim-null unter Last.

- v170: Umschalter Alte Welt/Ostasien <700px oben rechts; three.js InfoLog trim null-sicher. smoke 4/4, anim 7/7, karten2 13/13. Offen nur noch: PC Montag (job16 pk_vg, job17 Doktrin-TTS), GitHub (Moritz).

- 23.10. App nach github.com/moritz412/Imperium (main, Stand v170) gepusht. Pages muss Moritz einschalten. Update-Weg: build.py → site/ → nach /home/claude/imperium kopieren, commit, push.

- 23.10. 09:40 Pages live: https://moritz412.github.io/Imperium/ (Repo öffentlich). Ab jetzt bei jeder Veröffentlichung auch build.py + push.

- 23.10. Moritz: (1) schöneres Web-App-Icon, (2) Handy/Chrome automatisch Querformat, (3) danach Bedienung einsteigerfreundlich (Angriffssymbol verschwindet unter Anzeigen, Einheiten bewegen per Finger einfacher, Menü-Orientierung). Gestartet: par_quer, Konzept Bedienung, Icon-Varianten via FLUX.

- Icon: Moritz Bronzetafel (pwa/app_icon.png, build.py nutzt es). Push-Helfer: bash scratchpad/pushsite.sh "Nachricht".

- Bedienung Entscheidungen 23.10.: Befehlsblase am Ziel (Doppeltipp bleibt), Rückgängig letzte Bewegung ohne Kampf ja, Handy-Blatt rechts schmal einklappbar. Phase 1 gestartet: par_bed1 (Karte: Blase, Ziehen, Trefferflächen, Rückgängig, z-Order), par_bed2 (Layout Handy, Kopfleiste, Heer-Blatt Befehl oben, Stadtansicht, Einführung).

- v171: Bedienung Phase 1 (Befehlsblase, Ziehen an Figur, Rückgängig, Heer-Blatt Befehl oben, Handy-Layout, Kopfleiste-Labels/Langdruck, Einführung neu) + Querformat-Hinweis/Android-Sperre. Tests: smoke 4/4, bed1 25/26 (Handy: Figur lag im Test unter #hint-Knopf), bed2 34/34, quer 11/11, fz 14/14, sold 11/11, anim 7/7, karten2 13/13. Icon-Link mit ?v=2.

- 23.10. 11:05 Moritz will konzeptionell weiter: Bedienung Phase 2, Spielziele & Spielende, Schwierigkeit & KI-Charakter, See & Handel. Konzepte gestartet (konzept_ziele.md, konzept_ki.md, konzept_see.md); par_bed3: gestapelte Heer-Marken, #hint-Überdeckung, Fenster-Kurzhilfe.

## 23.10. 11:04 Moritz: ERST Ist-Zustand perfektionieren, dann neue Features. (1) alle 3D-Modelle optisch perfekt, (2) Menüführung klar strukturieren, (3) Balancing-Fehler ausgleichen, (4) Epochenwechsel rund, (5) fühlt sich wie fertiges Spiel an. See/Ziele-Konzepte gestoppt; KI-Konzept läuft weiter (für Balance). Audits gestartet: audit_3d.md, audit_menue.md, audit_balance.md, audit_epoche.md.

- konzept_ki.md fertig (KI-Persönlichkeiten fehlen; Schwer = Gold-Boni). Fragen (Charakter, Schwer klüger statt reicher, Kriegsankündigung) zurückgestellt bis nach Politur; Kriegsvorwarnung evtl. als Politur-Punkt.

- 23.10. Entscheidungen Systeme: Tiefe behalten+bündeln, 40 Waren behalten gruppiert, Spätspiel-Gold vorsichtig dämpfen (gemessen).
- 26.10. Neustart: Container lief nicht weiter; fertig nur audit_menue.md, audit_systeme.md. Neu gestartet: 3D, Balance, Epoche, Review, par_bed3. PC nicht erreichbar.

- v172: pk_vg (28 Volksgeschichten-Bilder, 2,0 MB) eingebaut, OFF_VER v172 (Neu-Download offline nötig). job17 x_ratdoc läuft am PC (17_x_ratdoc) → Clips in x_rat.json mergen, OFF_MAN Größe x_rat anpassen.

- 26.10. Menü-Entscheidungen: Diplomatie eigener Bereich, nur ✕ + ‹ Zurück, Chronik mit 4 Reitern. Gestartet: par_menu (Umbau nach audit_menue.md), par_bed3 (Stapel + #hint), Audits 3D/Balance/Epoche, Review.

- v173: 30 Doktrin-Clips in x_rat.json (150 Clips, 40k), OFF_VER v173. WICHTIG: laufende par_* basieren auf base72 → mit base72 als Basis gegen main mergen.

- job18 18_bilder_neu (16 Bilder: ev_westfalen, ev_glaubensbund, war_soeldner, war_tross, war_feldzug, ev_glaubenswelle, ev_soeldner_meuterei, ev_hausgesetz; je a/b) am PC eingereiht. Einbau später (Pack + Zuordnung im Code).

- 26.10. 3D-Audit fertig (audit_3d.md). Moritz: Stil = DETAILLIERT (fehlende/einfache Bausteine am PC neu, bis dahin angleichen). Gestartet: par_3dfix (7 Code-Fixes), PC-Vorbereitung 3D-Auftrag (FLUX-Vorlagen via Warteschlange 19, Proben zeigen, dann TRELLIS-.bat).

- Epochen-Audit fertig (audit_epoche.md). Gestartet par_epo (Basis base74 = v173+Stapel).

- job19 (84 FLUX-Vorlagen, 42 Modelle) am PC eingereiht, 3d_19.bat bereit (wartet auf 3d\19_ok.txt). PC seit ~17:55 offline. Offen: job18 ergebnis.zip abholen, job19 Kontaktbogen → Moritz, r3-Werkzeuge neu aufbauen (process.py, sockel.py, normw.py, shot.js fehlen nach Neustart). Rohmodelle roh_stadt (18.10.) als Ausweich.

- v174: gestapelte Heer-Marken (placeChips), #hint weicht aus (placeHint). smoke 4/4, stk 12/12, bed1 26/26.

- job18 abgeholt; Auswahl in scratchpad/pk_neu.json (8 Bilder, Keys *_x1). Einbau (PKREG, OFF_MAN, Zuordnung zu Ereignissen) nach Merge Menü/Epoche.

- v175: 3D-Code-Fixes (MDL_FIX/mdlFix, DIO_CUT, DIO_SCF, harmKit). smoke 4/4. Spielansicht ungeprüft. jag ist Jaguar-Mensch-Hybrid → für PC-Neuerzeugung (Krieger mit Jaguarfell) notieren.

- v175 veröffentlicht + GitHub. job19 Auswahl: 40 aus Kontaktbogen + Ersatz job21 (lalibela_b, nordam_haus_klein_a = Wigwam). 3d/vorlagen_19 = 42, 3d/19_ok.txt gesetzt. Moritz startet 3d_19.bat. WÄHREND TRELLIS KEINE Warteschlangen-Jobs einreihen (GPU)! Hinweis: Warteschlange nimmt leere Ordner sofort als fertig → Jobs immer als fertigen Ordner per mv einreihen.

- Balance-Audit fertig (audit_balance.md). Gestartet par_bal (base75): Verwaltungslast, Soldwarnung Rat, Schlacht-Konter. Jahr/Epoche-Takt erst nach Merge par_epo.

- 26.10. ~19:30 Container-Neustart: abgebrochen par_menu (teilweise, Basis base72), par_epo (teilweise, base74), par_bal (teilweise, base75), Review (kaum begonnen). 22:00 neu gestartet mit Fortsetzung der Teilstände. Main = v175.

- v176: Menü-Umbau + Epochen-Korrekturen + Balance (Verwaltungslast, Konter, Soldwarnung). Volle Testreihe grün (reach/stk beim 2. Lauf, 1. Lauf Lastfehler). Review v175: 74 %; neue Funde: Handy-Kamera Sardinien, Test-Spielstände sichtbar, verwaiste Rat-Plakette, 📍 überdeckt Chronik, „Aussichtslos“ bei 31 %, Moskau Skriptorium.

- 27.10. Container-Neustart: par_rev, par_jw abgebrochen → neu gestartet (Fortsetzung).

- v177: Kanal „Jetzt wichtig“ + Review-Funde + pk_neu (8 Bilder), OFF_VER v177. Volle Testreihe grün inkl. reach 104/104 (bei wenig Last).

- 27.10. 09:40 gestartet: par_sys (Systeme bündeln: Haushalt 5–6 Gruppen, Ordnung 5 Gruppen, Ware besorgen, Kriegsvorwarnung/Stimmung, nur Relevantes, Begriffe), r3-Werkzeuge neu (3D-Nachbearbeitung).

- r3-Werkzeuge neu (/home/claude/r3: mdl.py, process.py, sockel.py, normw.py, shot.js, pack.py, README). Spielformat = eigenes Binärformat (mdlParse), nicht GLB. Vor Lauf: apt-get install -y libopengl0 (pymeshlab).

- 27.10. 09:56 Moritz: Nutzungsbudget schonen → Tests gezielt (nur betroffene + smoke), keine Wiederholungs-/Langläufe ohne Grund, max. 1 Lauf parallel, wenige Zwischenmeldungen.

- v178: Systeme gebündelt (Haushalt 6 Gruppen, Ordnung 5, Waren-Gruppen + Ware besorgen, Kriegsvorwarnung S.wpend + Stimmung, Relevanz, Begriffe). KI-KI-Kriegspfad codegleich (geprüft); Messung 62→103 Kriege je 1 Lauf = Streuung, gegen Spieler 8→6.

- 27.10. 17:10 TRELLIS 19 fertig (42 GLB, 26.10. 19:51). Roh in scratchpad/r19/roh_19, Vorlagen r19/vorlagen_19. Einbau in par_3d19 gestartet.

- job20 (20_bilder_glaube, 40 Bilder: hs_<pid> 13 heilige Stätten, head_ortho/islam/tewahedo, hw_kreuzzug/dschihad/glaubenskrieg, jag_a/b Vorlage 3:4) läuft am PC seit 17:27. Einbau + jag TRELLIS später.

- job20 abgeholt; pk_glaube.json (19 Bilder hs_*, head_*, hw_*) gebaut, Einbau ausstehend. jag_a/b Vorlage → Moritz wählen.

- jag: Moritz wählt A. 3d_20.bat bereit (vorlagen_20/jag.png, 20_ok gesetzt, Budget 4000/512). Ergebnis: 3d/roh_20/jag.glb.

- jag.glb (roh, 4041 Dr.) in scratchpad/r20/jag.glb – an 3D-Einbau-Lauf übergeben.

- v179: 40 neue 3D-Modelle + jag (c_kit 34, jpa, byz, jag, Brücke, 3 Dioramen; verworfen lalibela, art_ant), pk_glaube (19 Bilder: heilige Stätten in Provinz-Glaubenszeile, Oberhäupter, Heiliger Krieg), OFF_VER v180. smoke 4/4, glimg ok. Spielansicht 3D noch ungeprüft.

- 27.10. 18:18 Moritz: Handy zweitrangig. Start Jahr/Epoche koppeln (par_jahr, Basis base79). Danach (nach Review v179) Entscheidung: KI-Charakter, geführter erster Zug, Endlos-Ziel.

- 27.10. Konzept Raubzug/Verwüstung beschlossen (konzept_raubzug.md), Umsetzung nach Feinschliff.

- 27.10. 19:02 Wikinger-Geschichte: Wandel/Glaubenswechsel England ausbauen (konzept_raubzug.md, historische Vorlagen, keine Serienkopie).

- 27.10. 19:15 Auftrag 21_3d_england am PC (24 FLUX-Vorlagen: angel_haus_klein/gross, angel_halle, angel_kirche, angel_kloster, angel_mauer (Burh), angel_markt, dane_haus_klein/gross, dane_lager, dane_mauer, dane_markt). Budget in scratchpad/job21_budget.json. Danach: Kontaktbogen → Moritz wählt → 3d_21.bat.

- 27.10. konzept_hannibal.md (Entwurf) – Moritz fragt nach Tiefe/Optik/Recycling.

- Hannibal-Paket komplett beschlossen (konzept_hannibal.md). Reihenfolge: Feinschliff → Wikinger → Hannibal.

- 27.10. 19:23 Kinosequenzen beschlossen (konzept_kino.md): Wikinger 4, Hannibal 5 Sequenzen + Kapitelbilder; Alpen-Regel leise im Endlos bestätigt.

- 27.10. 19:35 Auftrag 22_kino_bilder (98 Bilder) in Warteschlange. England-Auswahl (11) in 3d/vorlagen_21, Budget eingetragen, 3d_21.bat bereit – 21_ok.txt erst setzen, wenn 22 fertig (GPU!). dane_haus_gross neu als Auftrag 23 (4 Varianten).

- v180: Straße Stufe 3 Farbe #e6dcc4 → #b3a487 (Moritz: zu hell). Merge-Basis für par_jahr bleibt base79.

- 27.10. 19:40 Moritz: Häfen in Seitenansicht sehr dunkler Bereich; Objekte versinken in der Landschaft (nicht aufgesetzt). par_optik (base80) gestartet.

- 27.10. 19:50 Auftrag 24_epochen_bilder (war_musterung a1/m1, war_triumph m1/n1, war_soeldner a1/n1, war_frieden a1/n1). Beim Einbau: x1-Keys umbenennen (war_musterung_x1→n1, war_triumph_x1→a1, war_soeldner_x1→m1, war_frieden_x1→m1) im Paket, sonst mischt heroImg x mit Epoche. 21_ok erst nach 24.

- v181: Jahr/Epoche gekoppelt (yearCapHit, sanfter Takt, Angebot, nach 3 R automatisch; nur ohne S.scen). smoke 4/4, jahr_t 4/4.

## 27.10. abends – v186 (Artefakt Version 183, GitHub f393aeb)
- Enthält: Statthalter-Schwerpunkt vereinheitlicht (profdet), Epochenbilder war_* a1/m1/n1 + sysImg nach Epoche, Unterreiter-Stil + „Märkte & Verträge“, par_txt (Erklärungen, Nachkommastellen, Safe-Area), par_optik (Häfen, Versinken, Karren, mapGate-Ladeschirm), par_p1 (Groll, Aufsteiger, Erzfeind, Koalition, Invasion, Verlustgrenze 15 %/Epoche, max 2 Kräfte), par_fo (EPOCH 30/45/11, Wende-Techs, 8 Wahlpaare, neues Forschungsmenü), par_tex (Gebirge/Italien/Sand), 100 TTS-Clips ersetzt (Whisper-Prüfung Job 25c).
- Basis für neue Arbeiten: $S/base86.html (= imperium.v386.html).
- Offen: 8 TTS-Clips weiter halluziniert (Liste in j25/bericht.json, s1<0.86) → Whisper-Wortzeiten schneiden; England-GLBs in $S/roh_21 (r3 verarbeiten, Wikinger-Paket); Kinobilder Job 22 in $S/j22_kino_bilder; dane_haus_gross Variante b → TRELLIS; Paket 2/3 Spätspiel; Forschungs-Querverbindungen/Geistesblitze nicht freigegeben.
- Tests v186: smoke 4/4, reach_fo 112/112, jahr 4/4, sold 11/11. reach_t/reach_fo warten jetzt auf #loading[data-gate].
## Nachtlauf 27./28.10.
- par_des (Forschung+Hauptmenü Spiel-Look, design_leitlinie.md) und par_p2 (Paket 2: A Feldherren, Säule 2 Krisen, E Föderaten, ggf. B) laufen, beide auf base86.
- England-Modelle verarbeitet: /home/claude/r3/out21 (*_ns.glb wo Sockel weg), Bogen out21/bogen.jpg. angel_halle hat Loch im Dach → neu erzeugen (PC). Rest ok, Integration im Wikinger-Paket.
- Moritz prüft morgen. Vor Veröffentlichung: Vergleichsbild zeigen, Tests smoke/reach_fo/sold/gbund/fam3.
- 28.10. nachts: par_p2 (base86→m87) und par_vm (→m88) und par_des (→m89) gemergt. Gesamttest v189: smoke 4/4, reach_fo_des 118/118, pk2 19/19, vm 21/21, sold 11/11, gbund 13/13, fam3 8/8, jahr 4/4. Snapshot imperium.v389.html. NICHT veröffentlicht (Moritz prüft morgen).
- par_des2 läuft (Menüs Speichern/Laden, Wirtschaft, Hof, Diplomatie-Verträge, Einstellungen, qhelp) auf base89.
- PC-Aufträge vorbereitet in $S/pcjobs: 26_items.json (70 Bilder Paket 2 + Völker-Porträts, je 2 Varianten), 27_tts.json (17 Sätze inkl. rat_kanzler_sold). Danach Prüfjob (pruef.json) erneut, plus 8 Rest-Clips per Whisper-Wortzeiten schneiden. angel_halle neu (TRELLIS). Tech-Bilder je Technik (Vorschlag).
- par_des2 gemergt → base90 = imperium.v390.html. Tests v390: smoke 4/4, reach_fo_des2 120/120, bed1 26/26, bed2 34/34 (Tests warten jetzt auf data-gate), sold 11/11, pk2 18/19 (bekannte Zeitflake „3 Runden“), vm 21/21, jahr 4/4. Unveröffentlicht – wartet auf Moritz' Freigabe. Vergleichsbilder: par_des/vergleich.jpg, par_des2/vergleich.jpg, shot/vm_hof_ipad.jpg, shot/pk2_feldherr.jpg.
## Backlog (Moritz, 28.10.)
- Agenten (Hof › Agenten / Spione): spielen sich nutzlos, Wirkung kaum spürbar, viel manuelle Arbeit, wenig Spaß → überarbeiten (zurückgestellt, später).
- Weitere offene Entscheidungen: KI-Charakter, geführter erster Zug, Ziel/Finale Endlos (teilw. durch Urteil der Geschichte C), Forschungs-Querverbindungen/Geistesblitze (nicht freigegeben), Spätspiel Paket 3 (Ambitionen, Urteil der Geschichte, Zeitenwenden F, Mächte ohne Land G, Reichsteilung D), Wikinger- und Hannibal-Paket.

- 28.10. Technikbilder: dev/pc/tech_bilder.js schreibt Probe (Job 29, 18 Bilder), Hauptauftrag (Job 31 in _neu, 160 Bilder) und angel_halle c–f (Job 30). Schlüssel tk_<id>, Banner laut assets_design.md.
- 28.10. angel_halle: Vorlage e (Dach geschlossen) → 3d_32.bat, wartet auf Job 31.
- 28.10. v195 Darstellung (nicht committet/gebaut): Diplomatie-Siegel bronze; Kopfleiste +7 px unter Statusleiste (--sx, nur mit Safe-Area); html/body dunkel; Hof-Ämter Raster gleich hohe Reihen; Feldherren-Szenenbild nur 84-px-Banner beim ersten Eintrag. chkf (Node-Äquivalent) checked, smoke 4/4. Echtes iPad nicht getestet.
- 28.10. v196: Technikbilder pk_tk (81 Techniken + 7 Banner) eingebaut. smoke 4/4, reach_fo_des2 120/120. Armbrust bleibt altes Bild. Unveröffentlicht.
- 28.10. v197 (unveröffentlicht): Hafen-Farbfehler (lift entsättigt), dunkle Dioramen DIO_HELL, Statthalter Weg A (keine Bauvorlagen mit Statthalter). smoke 4/4.
- 28.10. v197: Treue-Gründe sichtbar, Erfolge heben Treue, Landgut-Bug (+15 fehlte in der Formel). pk2 19/19.
- 28.10. Konzept Echtzeitschlachten (Entwurf) geschrieben, Entscheidungen offen. v198 (Sprechersätze, Seeweg-Hinweis) unveröffentlicht; angel_halle aufbereitet.
- 28.10. Phase-0-Prototyp Echtzeitschlacht: Quelle dev/proto/schlacht_p0.html, deploy.py kopiert dev/proto → proto/ (Wurzel wird beim Bauen geleert!). v198 veröffentlicht.
- 28.10. v199 (unveröffentlicht): Paket W1 Raubzug & Verwüstung (Befehl Raubzug, Verwüstung 5–10 Runden + 6 Erholung, Wikinger/Steppe-Profile, Abwehr über vorhandene Bauten, Danegeld, Ruhm aus Beute). raub_t 19/19.

- 28.10. v200 (unveröffentlicht): Erklärkarte per langem Druck (imperium.html: HELP_ACT, helpText, Handler nach der Kopfleisten-Blase; CSS #helpCard), Klick danach unterdrückt, Rechtsklick öffnet sie am PC; Tipp-Toast beim ersten Start (imperium.helptip). Reichsvolk-Kachel (rkHtml) im Hof › Völker. help_t.js 15/15.
- 28.10. abends v201: Beute Raubvölker höher, keine doppelte Halbierung, Wikinger-Flussfahrt. raub 19/19, smoke 4/4, help 15/15. Übergabe im BACKLOG oben.
- 28.10. v202/v203 (unveröffentlicht, Branch w2-england): Paket W2 England. v202: Gebäude Burh (nur britisch, Ep 1–2; Raubzug-Beute −20/−35/−50 %, Garnison +15/30/45 %, KI bei Raubvolk-Krieg/Verwüstung, Statthalter „Verteidigung"); Wikinger-Szenario mit Wessex/Mercia (Slot mogul)/East Anglia (Slot vijaya)/Northumbria, Hauptstädte über neues `caps`, historische Orts­namen. v203: models/c_en.json (11 England-Modelle), enPre/enCityGeo: englische Städte in Ep 1 aus Einzelmodellen (angel bzw. dane bei Seeräuber-Besitzer), 1,6–4,8 Tsd. Dreiecke. Tests: smoke 4/4, raub 19/19, burh_t 20/20, en_stadt_t 8/8. chkf.sh braucht python3 (fehlt auf dem PC) → node --check je Block benutzt.
