# Konzept Kartenansichten (Stand v129, nur gelesen)

## 1. Ist-Stand

### Vorhandene Ansichten (`MAPMODES`, Umschalter `#modeBtn` → Liste `#modePop`)
| Schlüssel | Name | Farbe (`dispColors`) | Legende (`renderLegend`) | Extras |
|---|---|---|---|---|
| pol | Politik | Fraktionsfarbe, schwach (0,2) | keine | Reichsnamen |
| reg | Regionen | Goldener-Schnitt-Farbton je Region | Herzogtum/Königreich-Erklärung | `syncRealmLabels` zeigt Regions-/Königreichsnamen |
| res | Fruchtbarkeit | `heatCol(fert)` | 3 Stufen | – |
| cit | Siedlungen | `LVL_COL[lvlOf]` | 5 Stadtstufen | – |
| sup | Versorgung | Versorgungsgrad nur eigene Provinzen | 3 Stufen | – |
| kul | Kultur | `CULT[k].c` | Top 9 sichtbare Kulturen | – |
| rel | Religion | `RELIG[k].c` | Top 9 Religionen | (paralleler Fork: Legende + heilige Stätten) |
| net | Transport | Transportverlust eigene Provinzen | 3 Stufen | Flusslinien `syncFlow` (FLOWG) |
| ter | Gelände und Bewegung | `TERCOL` 3 Klassen | Kosten je Klasse | – |
| eco | Wohlstand | `provIncome`, min/max über ALLE Provinzen | 3 Stufen | – |
| ord | Ordnung | `provOrder` absolut (−3…+5) | 3 Stufen | – |
| dip | Diplomatie | `dipCol` = Haltung zu DIR | `DIPLEG` 9 Stufen | Reichsnamen mit Haltung |

Immer sichtbar, unabhängig vom Modus: Handelsrouten (`syncTrade`, TRG, farbig nach Auslastung/Überfall), Straßen, Flüsse, Seewege, Nebel/unerforscht, Heere-Chips, Dioramen, Pflanzen.

### Technik
- Provinzfarben laufen über eine Paletten-Textur `palTex` (DataTexture `PAL_W`×3, Nearest): Zeile 0 = Besitzer + Status (Auswahl/Bewegung), **Zeile 1 = Ansichtsfarbe + Deckkraft** (`dispColors` → `syncTiles`), Zeile 2 = Region/Königreich. Der Gelände-Shader (`TF`, `dispAt(i)`) mischt die Ansichtsfarbe über das Terrain anhand einer Provinz-ID-Textur.
- Umschalten = 1 Palettenupdate (≈1024 Texel) + Legende. **Sehr billig, auch fürs iPad.** Teuer wären nur neue Geometrie (Linien, Icons, Beschriftungen) pro Wechsel.
- `setMapMode(m)`: setzt MAPMODE, schließt Regions-Hervorhebung, `syncRealmLabels`, `syncTiles`, `syncFlow`, Toast. Kein Speichern der Wahl, keine Tastenkürzel (Tastatur nur Kamera und Escape).
- Langes Drücken `holdAt` zeigt immer dieselbe Provinzinfo (Name, Besitzer, Garnison, Gelände, Heere) – nicht ansichtsbezogen.

### Schwächen
1. 12 Einträge in einer langen Textliste, ohne Gruppierung, Symbole oder Erklärung; „Siedlungen“, „Versorgung“, „Transport“ sind schwer zu unterscheiden.
2. Farbskalen fast überall Rot→Grün (`heatCol`): schlecht bei Rot-Grün-Schwäche, kollidiert mit Fraktionsfarben, in Kulturstil-Themes nicht abgestimmt.
3. Wohlstand normiert über alle Provinzen inkl. fremder → eigene Provinzen wirken alle „mittel“, keine absoluten Werte in der Legende.
4. Keine Zahlen auf der Karte; Tap/Halten zeigt nicht den Wert der Ansicht.
5. Dioramen, Figuren, Pflanzen und Handelsrouten bleiben in allen Ansichten voll sichtbar und überdecken die Farbfläche in mittlerer Zoomstufe.
6. Diplomatie nur aus eigener Sicht, nicht „Beziehungen von Reich X“.
7. Es fehlen: Militär/Bedrohung, Handel/Waren, Bevölkerung (nur Stadtstufe), Statthalter, Forschung/Wissen, Unruhe-Gründe.
8. Wahl der Ansicht geht beim Laden verloren; nach Rundenende kein Hinweis, dass man nicht in Politik ist (nur Button-Markierung `on`).

## 2. Konzept je Ansicht

Gemeinsame Regeln für alle Ansichten:
- **Farbskala:** Sequenzielle Skalen einfarbig hell→dunkel oder Blau→Gold→Rot (farbenblindfreundlich), kategorisch nur mit ≤ 9 Farben + „Sonstige“. Unbesitzt/fremd immer neutral graubraun `#8f8676`, Deckkraft 0,4.
- **Legende:** unten links wie bisher, aber antippbar: Tippen auf Eintrag hebt nur diese Provinzen hervor (Rest abgedunkelt, über PAL-Zeile 1 Alpha) – billig.
- **Tap-Info:** kurzes Tippen wählt wie gewohnt die Provinz; die Provinzleiste bekommt oben eine Zeile „In dieser Ansicht: …“ mit Wert und den 2–3 wichtigsten Gründen. Langes Drücken (`holdAt`) zeigt zusätzlich den Ansichtswert.
- **Zahlen auf der Karte (optional je Ansicht):** kleine Wert-Etiketten über eigenen Provinzen ab mittlerer Zoomstufe, als HTML-Labels wie Reichsnamen (max. ~40 sichtbar) oder Canvas-Textur-Sprites.
- **Abdunkeln der Modelle:** In allen Ansichten außer Politik werden Pflanzen-Billboards und Dioramen auf ~35 % Helligkeit/Transparenz gesetzt (Material-Uniform, keine Neuerstellung); Heere-Chips bleiben, außer Militär hebt sie hervor.

| Ansicht | Inhalt / Farbskala | Legende | Tap-Info | Icons/Overlays | Nutzen | Aufwand | Perf. |
|---|---|---|---|---|---|---|---|
| **Politik** (vorhanden) | Fraktionsfarbe | neu: eigene Reiche + Verbündete + Kriegsgegner als Liste | Besitzer, Haltung, Vertrag | Reichsnamen | Überblick | S | – |
| **Religion** (vorhanden, Fork ergänzt) | Religionsfarbe; NEU: Schraffur/heller Rand bei laufender Bekehrung, Deckkraft nach Glaubensfestigkeit | Religionen + heilige Stätten (vom Fork) | Religion, Bekehrung %, Restrunden, Gründe | ✦ heilige Stätten, ⛪ Mönche/Priester | Bekehrung planen, Heiliger Krieg | S (nur ergänzen) | – |
| **Kultur** (vorhanden) | Kulturfarbe; Rand/Deckkraft nach Angleichungsfortschritt `P.cp` | + „fremde Kultur im Reich: n Provinzen“ | Kultur, Angleichung %, Unruhefolgen | – | Assimilation, Aufstandsrisiko | S | – |
| **Handel** (neu) | Rohstoffwert je Provinz (Summe `priceOf` der Lagerstätten) einfarbig Gold; eigene Handelsrouten bleiben farbig | Wertstufen + Route frei/ausgelastet/überfallen | Waren (Symbole aus `GOODS`), ≈ Gold je Händler (`merchEst`), Händler vor Ort (`merchantsAt`) | Warensymbol je Provinz (1 Symbol, ab mittlerem Zoom), Händler-Marker | Händler setzen, Handel/Monopol, Beschaffung im Hof | M | Icons als InstancedMesh/Sprite-Atlas |
| **Ordnung/Unruhe** (vorhanden, ausbauen) | absolute Skala −3…+5; NEU: pulsierender Rand bei „Abfall nächste Runde“ | Werte mit Zahlen | Ordnung, Hauptgründe (Steuern, Kultur, Religion, Krieg, Statthalter) | ⚠ bei Aufstandsgefahr | Aufstände verhindern | S | – |
| **Wohlstand/Steuern** (vorhanden, korrigieren) | NUR eigene Provinzen normiert, fremde neutral; Legende mit Gold-Zahlen | 5 Stufen mit Goldwerten | Einnahmen aufgeschlüsselt (Steuer, Handel, Betriebe) | optional Zahl | Bauprioritäten | S | – |
| **Diplomatie** (vorhanden, ausbauen) | Haltung zu dir; NEU: „Sicht von Reich X“ – Tippen auf fremdes Reich in dieser Ansicht färbt dessen Beziehungen | wie `DIPLEG` + Kopfzeile „Sicht: Rom“ | Beziehung mit Aufschlüsselung, Verträge, Kriegsgründe | Bündnislinien zwischen Hauptstädten (dünn, nur in dieser Ansicht) | Bündnisse, Koalitionen erkennen | M | Linien nur bei Wechsel bauen |
| **Militär** (neu) | Bedrohung `threat(pi,me)` je eigener Provinz Blau→Rot; fremde Provinzen nach Garnison grau-dunkel | Stufen + „Feindheer in Reichweite“ | Garnison, Mauern, angrenzende Feindstärke, eigene Heere in Reichweite | Heere-Chips hervorgehoben, Reichweitenringe feindlicher Heere optional | Verteidigung planen | M | `threat` je Provinz pro Runde cachen |
| **Bevölkerung/Siedlungen** (vorhanden = Siedlungen) | Stadtstufe (bestehend); umbenennen „Städte“ und Wachstum als Pfeil | Stufen + Wachstum ↑/↓ | Stufe, Bevölkerung, Wachstum, Versorgung | – | Wachstum steuern | S | – |
| **Versorgung + Transport** (vorhanden, zusammenlegen) | eine Ansicht „Versorgung“ mit Farbe = Versorgungsgrad und Linien = Transportnetz | 3 Stufen + Linien | Versorgung %, Transportverlust %, Engpass | Flusslinien (bestehend) | Nahrung/Logistik | S | – |
| **Gelände** (vorhanden) | wie bisher, + Wasser/Seeweg; Flüsse/Brücken betonen | Kosten | Bewegungskosten, Gelände-Kampfbonus | – | Marschplanung | S | – |
| **Fruchtbarkeit** (vorhanden) | in „Städte“ oder „Handel“ integrieren oder behalten | – | – | – | Siedlungsplanung | S | – |
| **Regionen/Statthalter** (vorhanden + neu) | Regionen wie bisher; NEU: eigene Regionen nach Statthalter (Farbe je Statthalter, grau ohne), Regionskasse als Zahl | Statthalter-Namen | Statthalter, Loyalität/Abfallwarnung, Regionskasse, Auftrag | Wappen/Siegel am Regionsnamen | Statthalter verwalten | M | – |
| **Forschung/Wissen** (neu) | für gewählte Technik (aus Forschungsfenster „Auf Karte zeigen“): Reiche, die sie kennen, grün; Kontakt/Handelspartner (Rabattquelle) hell | Kennt / Partner / unbekannt | Rabatt aus `techDiff` | – | Wissensverbreitung verstehen | M | – |

## 3. Bedienung auf dem iPad

- **Umschalter:** Statt langer Textliste ein Kartenansicht-Fächer am rechten Rand (wo `#modeBtn` sitzt): 3 Gruppen mit Symbol + Kurzname, max. 8 Kacheln:
  - Reich: Politik, Diplomatie, Militär
  - Land & Leute: Städte (inkl. Fruchtbarkeit), Kultur, Religion, Ordnung
  - Wirtschaft: Wohlstand, Handel, Versorgung, Gelände
  - (Regionen/Statthalter und Forschung über Kontext: Hof-Fenster bzw. Forschungsfenster „Auf Karte zeigen“)
- **Schnellwahl:** Wischen mit zwei Fingern nach links/rechts auf dem Umschalter-Knopf oder langes Drücken → letzte Ansicht; Tippen auf aktiven Knopf → zurück zu Politik. Desktop: Tasten 1–9/0 für Ansichten, `M` öffnet Fächer, `Esc` zurück zu Politik (Escape ist schon belegt für Auswahl – nur zurücksetzen, wenn nichts ausgewählt).
- **Kontextsprünge:** Aus Fenstern direkt in passende Ansicht: Händlerwahl → Handel, Toleranz/Bekehrung → Religion, Statthalter → Regionen, Verteidigungswarnung des Rats → Militär.
- **Übergänge:** Palettenfarbe in 250 ms überblenden (zwei PAL-Zeilen mischen über Uniform `uMix`), Modelle gleichzeitig abdunkeln. Kein Kameraruck.
- **Lesbarkeit:** In Nicht-Politik-Ansichten Pflanzen/Dioramen abdunkeln (siehe oben), Handelsrouten nur in Politik/Handel/Diplomatie, Straßen bleiben. Legende ab 2 Einträgen einklappbar.
- **Merken:** Gewählte Ansicht in `cfg` (pro Gerät), Hinweis-Chip „Ansicht: Handel ✕“ oben, solange nicht Politik.
- **Themes:** Rahmen/Knöpfe über bestehende Theme-Variablen (`--bronze`, `--on-bronze`); Kartenfarben selbst bleiben themenunabhängig (Bedeutung darf nicht wechseln).
- Eigene Gestaltung, keine Übernahme fremder Spiel-Oberflächen.

## 4. Empfehlung

**Phase 1 (ein Lauf, vor allem S):**
1. Umschalter neu (3 Gruppen, Symbole, Tasten 1–0, Ansicht merken, Hinweis-Chip).
2. Ansichtsbezogene Tap-Info in Provinzleiste + `holdAt`.
3. Modelle abdunkeln außerhalb Politik.
4. Wohlstand nur eigene Provinzen, Legenden mit Zahlen; farbenblindfreundliche Skala.
5. Versorgung + Transport zusammenlegen; Fruchtbarkeit in Städte als Unterschalter.
6. Neue Ansicht **Handel** (Warensymbole, Händler, Routen) und **Militär** (Bedrohung, Garnison).
7. Legende antippbar → Hervorheben.

**Phase 2:**
- Diplomatie „Sicht von Reich X“ + Bündnislinien.
- Regionen/Statthalter-Ansicht, Forschung „Auf Karte zeigen“.
- Kontextsprünge aus Fenstern, Überblendung, Zahlen-Etiketten auf der Karte.

## 5. Entscheidungsfragen

1. **Wie viele Ansichten im Umschalter?**
   a) Kompakt 8–10 in 3 Gruppen, seltene zusammengelegt (empfohlen)
   b) Alle 14 einzeln
   c) Nur 5 Hauptansichten, Rest über Fenster
2. **Modelle in Nicht-Politik-Ansichten?**
   a) abdunkeln/transparent (empfohlen)
   b) ganz ausblenden
   c) unverändert lassen
3. **Zahlen direkt auf der Karte?**
   a) nur bei Antippen/Halten (empfohlen für Phase 1)
   b) kleine Zahlen über eigenen Provinzen ab mittlerem Zoom
   c) gar nicht
4. **Farbskalen:**
   a) farbenblindfreundlich Blau→Gold→Rot (empfohlen)
   b) bisheriges Rot→Grün behalten
5. **Neue Ansichten Phase 1:**
   a) Handel + Militär (empfohlen)
   b) zusätzlich Statthalter-Regionen
   c) zuerst nur Bedienung verbessern, keine neuen Ansichten
