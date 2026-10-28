# Backlog – Imperium der Epochen 2 (Stand 28.10.2026, v194)

## Läuft / gleich als Nächstes
- Erledigt bis v194: Bilder Paket 2 + 20 Völker-Porträts (pk_p2), 17 Sprechersätze (in x_rat, verdrahtet über RATV_P2-Muster im Protokoll, Sold-Warnung, Angleichen).
  Rest: rat_marschall_foederaten noch leicht fehlerhaft gesprochen; rat_kanzler_thronstreit_warnung, _putsch_ehre, _volk_wunsch, _volk_zufrieden sind geliefert, aber noch nicht verdrahtet.
- 8 kurze Sprechersätze halluzinieren weiterhin → per Whisper-Wortzeiten schneiden (Liste in Bericht Job 25c/28).
- Angelsächsische Halle (`angel_halle`) neu erzeugen (Loch im Dach). Übrige 11 England-Modelle sind aufbereitet (r3).
- Bilder je Technik für das Forschungsmenü (heute ein Motiv je Bereich) und Banner aus `dev/docs/assets_design.md`.
- Hof-Reiterleiste (Familie, Feldherren …) noch im alten Stil.

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
