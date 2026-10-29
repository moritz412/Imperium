# Lehren aus den bisherigen Kampagnen – Prüfliste für jede neue Geschichte (29.10.2026)

Quellen: Prüfbericht Wikinger (`pruef_wikinger_kampagne.md`), Spieltest Moritz 29.10. (`wikinger_nachbesserung.md`), Erfahrungen Caesar/Hannibal/Karl (Steps-Struktur in `SCEN`).

## Was schiefging – und warum

| # | Fehler | Beispiel | Ursache im Vorgehen |
|---|---|---|---|
| 1 | Geschichte als Text, Mechanik fehlt | Großes Heer, Alfred, Edington, Danelag nur Kino/Text | Kapitel zuerst geschrieben, Mechanik „später“ |
| 2 | Ziel auf falschem Weg lösbar | Wessex in Runde 1 unterwerfbar; Paris-Küste in Runde 3 | Allgemeine Regeln (Unterwerfung ≤ 3 Provinzen, kleine Orte ohne Belagerung) nicht gegen die Geschichte geprüft |
| 3 | Ziel praktisch unerreichbar | Beute 700, Waräger ohne Seeweg | Zahlen geschätzt statt aus dem Spiel gemessen |
| 4 | Stillstand statt Fortschritt | Northumbria-Pingpong | Eroberung zu schwach gehalten; KI hat keinen Grund aufzuhören; kein „Ende“ eines Krieges außer völliger Vernichtung |
| 5 | Bedienung nur für Eingeweihte | Ein-/Ausschiffen über Knöpfe im Blatt | Funktion eingebaut, aber nicht als Geste auf der Karte |
| 6 | Wirtschaft am Start im Minus | Wikinger −34/Runde | Startwerte aus dem Endlosspiel übernommen |
| 7 | KI überrollt den Start | Germanen/Polen erklären Krieg in Runde 7–12 | Schonfrist galt nur für das Endlosspiel |
| 8 | Toter Code | Raubzug-Landung (`canRaub` verbot `boat`) | Zwei Funktionen getrennt gebaut, Zusammenspiel nie durchgespielt |
| 9 | Platzhalter-Bilder bleiben | ev_thron/ev_conq als Kapitelbild, Minarette in Miklagard | Bildliste nicht gegen Inhalt geprüft |
| 10 | Getestet wie ein Bot, nicht wie ein Spieler | Tests setzen Flags/Besitz direkt | Kein Durchlauf „ich spiele die ersten 15 Runden mit den Knöpfen, die ein Spieler sieht“ |

## Prüfliste vor dem Bau (Konzept)

1. **Jeder Akt hat eine eigene Spielregel.** Frage: „Was kann ich in diesem Akt tun, was ich vorher nicht konnte – oder nicht mehr kann?“ Wenn die Antwort nur ein Text ist, fehlt die Mechanik.
2. **Ein beabsichtigter Weg je Ziel** – und die falschen Wege sind ausdrücklich gesperrt, mit Grund am Knopf (nicht still).
3. **Der Gegner hat ein Drehbuch.** Wichtige Gegner (Wessex/Alfred, Rom/Fabius) bekommen ein Szenario-Skript (Phasen, Ereignisse), statt nur allgemeine KI.
4. **Kriege enden.** Jede Eroberung eines Hauptortes bietet eine Abschlusswahl (Vasall/Marionette, Tribut, Frieden mit Gebietsteilung). Kein Ziel darf völlige Vernichtung verlangen.
5. **Zahlen aus dem Spiel.** Für jedes Ziel: wie viele Runden braucht ein normaler Spieler? Messung mit Playwright im echten Ablauf, nicht geschätzt.
6. **Startbilanz ≥ 0** oder ein im Text erklärter Grund, warum nicht (z. B. „Beute ist euer Einkommen“).
7. **Schonfrist in beide Richtungen** prüfen: Wer darf wen in den ersten N Runden angreifen?
8. **Jede neue Handlung als Geste auf der Karte** (Ziehen/Tippen + Rückfrage). Knopf im Blatt ist der zweite Weg.
9. **Bildliste gegen Inhalt**: jedes Kapitel/Ereignis/Fenster hat ein eigenes Bild; Anachronismen (Minarette, Schrift, falsche Rüstung) in den Prompt als Verbot.
10. **Stimmen**: jeder Kapiteltext und jede Kinosequenz mit Sprecher, Whisper-Prüfung vor Einbau.

## Prüfliste nach dem Bau (Test)

1. **Spielertest 15 Runden** nur über sichtbare Knöpfe/Gesten (Playwright klickt, setzt keine Flags).
2. **Abkürzungstest**: Kann ein Ziel früher als geplant erreicht werden? (Erste 5 Runden alles Naheliegende angreifen/fordern.)
3. **Stillstandstest**: 30 Runden passiv bzw. 30 Runden aggressiv – wechseln Provinzen mehr als 2-mal den Besitzer? Dann ist etwas falsch.
4. **Bilanztest**: Gold nach 10 Runden bei normalem Spiel > 0.
5. **Bild-/Sprecher-Vollständigkeit**: Test wie `kino_vk_t.js`.
6. **Alte Spielstände** laden.
7. Immer vermerken: echtes iPad nicht getestet.

## Folgen für Hannibal (direkt eingeplant in `hannibal_ablauf.md`)
- Akt-Regeln: Hispanien (Belagern), Marsch (Versorgung, Pass), Italien (Abfall der Städte, Fabius-Skript), Afrika (Zama).
- Falsche Wege gesperrt: Rom kann erst ab Akt III direkt angegriffen werden; Seeweg nach Italien gesperrt (römische Flottenherrschaft, Grund am Knopf).
- Kriege enden: Abfall-Mechanik + Friedensangebot Roms nach X Niederlagen (historisch nicht, aber als Alternativgeschichte).
- Zahlen messen: Pass-Verluste (Ziel ≈ 40–50 % wie historisch), Zeit bis Cannae.
