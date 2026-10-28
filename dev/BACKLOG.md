# Backlog – Imperium der Epochen 2 (Stand 28.10.2026, v194, Setup PC fertig)

## Läuft / gleich als Nächstes
- Erledigt bis v194: Bilder Paket 2 + 20 Völker-Porträts (pk_p2), 17 Sprechersätze (in x_rat, verdrahtet über RATV_P2-Muster im Protokoll, Sold-Warnung, Angleichen).
  Rest: rat_marschall_foederaten noch leicht fehlerhaft gesprochen; rat_kanzler_thronstreit_warnung, _putsch_ehre, _volk_wunsch, _volk_zufrieden sind geliefert, aber noch nicht verdrahtet.
- 8 kurze Sprechersätze halluzinieren weiterhin → per Whisper-Wortzeiten schneiden (Liste in Bericht Job 25c/28).
- Angelsächsische Halle (`angel_halle`) neu erzeugen (Loch im Dach): Vorlage e gewählt (3d/vorlagen_32), TRELLIS fertig: 3d/roh_32/angel_halle.glb,
  danach r3 (Sockel weg) und ins Wikinger-Paket. Übrige 11 England-Modelle sind aufbereitet (r3).
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
- Hafen-Modell mit bunten Dreiecken (Pixelfehler, vermutlich kaputte UVs/NaN, vgl. r3 `nan_to_num`).
- Städte teils zu dunkel (v. a. im Gebirge/Schatten).
Spielregeln (Entscheidung nötig):
- Statthalter: „Auftrag“ (GOV_DIR, baut aus der Regionskasse, plus Wirkung) und „Bauvorlagen“ (TPL, plant je Siedlung bei leerer
  Bauschlange) überschneiden sich, dazu das Stadtprofil im Provinzfenster. Vorschlag: im Statthalterfenster nur Auftrag;
  Bauvorlage nur noch als Ausnahme je Stadt im Provinzfenster.
- Treue/Zufriedenheit von Feldherren und Statthaltern intransparent → Ursachen sichtbar machen (was hebt/senkt, Ziel, Trend).

## Freigegebene Pakete (Reihenfolge)
1. Wikinger-Paket: Raubzug & Verwüstung (`konzept_raubzug.md`), England 865–950, Glaubenswechsel, Kino (`konzept_kino.md`).
2. Hannibal-Paket (`konzept_hannibal.md`), Kino.
3. Spätspiel Paket 3 (`konzept_spaetspiel.md`): Ambitionen & Epochenwertung, Urteil der Geschichte (C),
   Zeitenwenden (F), Mächte ohne Land (G), Reichsteilung (D, höchstes Risiko).

## Zurückgestellt / zu entscheiden
- Agenten (Hof › Agenten) überarbeiten: wirken kaum spürbar, viel manuelle Arbeit, wenig Spaß (Moritz, 28.10.).
- KI-Charakter, geführter erster Zug, Ziel/Finale im Endlosspiel.
- Forschung: Querverbindungen zwischen Bereichen, Geistesblitze ausbauen (nicht freigegeben).
- Kartentextur: Apennin im Winter mit etwas Schnee? Sandrippeln abschwächen, falls störend.

## Bekannte Testschwächen
- `pk2_t.js` „3 Runden mit neuen Reichen“ schlägt unter Last gelegentlich fehl (nur 2 Runden in der Wartezeit).
- Klick-Zeitüberschreitungen in `reach_*` unter hoher Last (Software-Rendering) – kein Spielfehler.
