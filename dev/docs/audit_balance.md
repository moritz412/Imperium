# Audit Balancing (Stand v172, base72.html)

Stand: Endfassung 26.10. Gemessen mit `shot/balm.js` und `shot/balinc.js` (Desktop-Chromium, 1 Browser, Spieler passiv). Nichts am Spiel geändert.

## A. Code-Befunde (gelesen, nicht gemessen)

1. **Automatische Schlachtberechnung kennt keine Einheitentypen.** `resolveAttack` → `armyPower` summiert nur `uStat().pow` (≈ Stärke × Rang). Konter (Speer gegen Reiter usw.) wirken nur in der Echtzeitschlacht. Damit zählt beim „Berechnen“ und bei KI-gegen-KI-Kämpfen nur Stärke je Gold:

   | Rolle | Kosten | Stärke | Stärke je 100 Gold | Sold je Stärkepunkt |
   |---|---|---|---|---|
   | Speer | 60 | 7 | 11,7 | 0,86 |
   | Nahkampf | 85 | 9 | 10,6 | 0,89 |
   | Fernkampf | 65 | 5,5 (Ep. 3: 6,9 / Ep. 4: 7,7) | 8,5 (10,6 / 11,8) | 1,09 (0,87 / 0,78) |
   | Reiterei | 120 | 11 | 9,2 | 1,00 |
   | Artillerie | 220 | 13 | 5,9 | 1,38 |

   Epochenfaktoren (`EPOCH_STR`, `EPOCH_COST`) skalieren alle Rollen gleich, die Rangfolge bleibt. **Speerträger sind in der Berechnung bis Epoche 3 die effizienteste Einheit**, Artillerie die schlechteste (ihr Nutzen liegt nur in Belagerung/Echtzeit).
2. **Epochenskalierung Einnahmen vs. Kosten:** `EPOCH_INC` 1 → 1,2, aber `EPOCH_COST` 1 → 1,5 und `EPOCH_STR` 1 → 2,1. Auf dem Papier wird das Spätspiel knapper. Gegenläufig wirken der Steuerdeckel `TAX_CAP` 0,35 → 0,6, Bauten (Markt/Bank/Börse/Garten) und viele Zusatzposten (19 Posten in `income()`), die mit der Reichsgröße wachsen. Ob der Goldberg entsteht, zeigt die Messung.
3. **Schwierigkeit über Gold:** `DIFF` Schwer = KI-Einnahmen ×1,3, Leicht = Spieler-Steuer ×1,15 (siehe konzept_ki.md).

## B. Messergebnisse

Messskript `shot/balm.js` (Basis gbm.js): Spieler bleibt passiv, Dialoge per „Berechnen/Weiter“, alle 10 Runden Momentaufnahme aller lebenden Reiche. Desktop-Chromium, Grafik „leicht“, 1 Browser.

| Lauf | Runden | Gini Provinzen Start → Ende | Reichstode | größtes KI-Reich Ende | KI-Einnahmen Median Start → Ende | Kriege / Frieden |
|---|---|---|---|---|---|---|
| Rom 1 | 60 (Jahr −300 → 387) | 0,30 → 0,39 | 5 von 34 | Ptolemäer 27 Prov., 74 Einheiten | 20 → 18 (Max. 78) | 126 / 102 |
| Rom 2 | 60 | 0,30 → 0,36 | 9 von 34 | Seleukiden 20–24 Prov. | 20 → 67 | 101 / 73 |
| Startwelt Ep. 2, 1 | 60 (Jahr 922 → 1489) | 0,38 → 0,38 | 11 von 42 | Araber 37 Prov., 1 149 Gold/Runde | 91 → 333 | 155 / 300 |
| Startwelt Ep. 2, 2 | 60 | 0,38 → 0,39 | 8 von 42 | Ptolemäer 30 Prov., 1 125 Gold/Runde | 91 → 329 | 173 / 318 |

Beobachtungen:
- **Goldberg bei der KI in Epoche 2:** Median-Einnahmen ×3,6 in 60 Runden, die größten Reiche 1 100–1 500 Gold je Runde. In Epoche 0 bleibt alles flach (Median 20–70).
- **Keine Epochenwechsel in 60 Runden** (beide Welten). Der Wechsel hängt am Spieler (Forschung/Entscheidung); bei passivem Spieler laufen die Jahre weiter: Startwelt Ep. 2 erreicht das Jahr 1489 in Epoche 2. Jahreszahl und Epoche laufen auseinander.
- **Passiver Spieler:** Rom verliert in einem Lauf bis Runde 11 die zweite Provinz (Schutzzeit 10 Runden). Makedonien (30 Provinzen, 65 Einheiten) bricht in beiden Ep.-2-Läufen auf 1–2 Provinzen ein: Einnahmen 610 → −150 bis −334, Heer schrumpft, Gold teils 0. Ohne Eingriff gibt es keine automatische Schutzbremse (Sold > Einnahmen).
- **Schneeball moderat:** Gini steigt nur leicht, Spitzenreiche 20–37 Provinzen bei 31–42 Reichen. 5–11 Reichstode je 60 Runden.

| Startwelt Ep. 3, 1 | 60 (Jahr 1510 → 1785) | 0,46 → 0,43 | 10 von 48 | Ptolemäer 41 Prov., 2 076 Gold/Runde | 132 → 403 | 165 / 299 |
| Startwelt Ep. 3, Aufschlüsselung | 40 | 0,46 → 0,39 | 9 von 48 | Makedonien 41 Prov., +1 394/Runde | 132 → 380 | 146 / 237 |

Der zweite volle Ep.-3-Lauf wurde vom Zeitlimit abgebrochen; für Epoche 3 gibt es deshalb 1 vollen Lauf plus 1 Lauf mit 40 Runden. Streuung je Fall bei 2 Läufen (Rom, Ep. 2) eng: Median-Einnahmen Ende 18/67 bzw. 333/329.

**Woher der Goldberg kommt (Ep. 3, Aufschlüsselung `income()` der 4 größten Reiche):**

| Runde | Reich | Prov. | Steuer | Sold | Hof | Handel | Verkauf | Rest | Netto |
|---|---|---|---|---|---|---|---|---|---|
| 126 | Ptolemäer | 23 | 1 119 | 440 | 15 | 106 | 41 | 23 | 825 |
| 166 | Ptolemäer | 30 | 1 961 | 585 | 100 | 31 | 61 | 22 | 1 390 |
| 126 | Pergamon | 40 | 1 222 | 723 | 75 | 28 | 146 | 0 | 598 |
| 166 | Makedonien | 41 | 2 135 | 867 | 57 | 31 | 136 | 16 | 1 394 |

- Fast das ganze Netto ist **Grundsteuer** (`provIncome`). Die übrigen 15 Posten (Monopol, Privilegien, Händler, Post, Kredite, Kirche, Kompanien …) liegen zusammen meist unter 30 Gold. Sie machen die Anzeige komplex, aber nicht den Goldberg.
- **Steuer je Provinz** steigt in 40 Runden von ~49 auf ~65 (Ptolemäer), also +33 % durch Ausbau und Bevölkerung, zusätzlich zu mehr Provinzen. In Epoche 0 liegt sie bei ~18 (Seleukiden, 10 Prov., 177).
- **Sold frisst nur 30–45 %** der Steuer, obwohl die KI ihre Heere stark vergrößert (Median-Einheiten 17 → 37). Die Kasse der KI bleibt trotzdem niedrig (Median 300–450), sie gibt also aus – beim aktiven Spieler sammelt sich das Gold dagegen an.
- `EPOCH_COST` (bis ×1,5) zieht die Ausgaben nach, aber Bauten/Bevölkerung heben die Steuer stärker als `EPOCH_INC` (×1,15–1,2) vorsieht.

## C. Belegte Probleme und Vorschläge (nach Priorität)

**1. Spätspiel-Goldberg (hoch, Moritz-Entscheidung: vorsichtig dämpfen).**
Beleg: oben, KI-Median ×3,1–3,6 in 60 Runden (Ep. 2/3), Spitzenreiche 1 100–2 100 Gold/Runde, Ursache Grundsteuer × Reichsgröße.
Vorschlag „Verwaltungslast“: Steuer aller Provinzen eines Reiches × `1 − 0,008 × max(0, n − 15)`, Untergrenze 0,8 (ab 40 Provinzen −20 %). Eine Zeile in `provIncome` (Faktor je Reich, einmal pro Runde gecacht) plus Anzeige in `taxParts` („Verwaltung großer Reiche −x %“).
Erwartete Wirkung (aus den gemessenen Zahlen gerechnet): Ptolemäer 30 Prov. −12 % Steuer → Netto 1 390 → ~1 155 (−17 %); Makedonien 41 Prov. −20 % → 1 394 → ~967 (−31 %); Reiche bis 15 Provinzen unverändert. Dämpft gleichzeitig den KI-Schneeball. Messung danach: dieselben Läufe Ep. 2/3, Ziel KI-Median-Wachstum ≤ ×2,5 in 60 Runden, keine zusätzlichen Reichstode.
Alternative mit geringerem Eingriff: Steuerdeckel `TAX_CAP` ab Ep. 3 nicht weiter erhöhen (0,52/0,6 → 0,45). Wirkt nur auf Bonusstapel, schwächer und schwerer vorherzusagen.

**2. Jahreszahl läuft der Epoche davon (hoch).**
Beleg: alle Ep.-2/3-Läufe, z. B. Startwelt Ep. 2 erreicht Jahr 1489 in Epoche 2, Ep. 3 erreicht 1785. Der Epochenwechsel hängt am Spieler; die Jahre laufen weiter.
Vorschlag: Jahresschritt ab dem historischen Epochenende stark verlangsamen (z. B. ¼) und einen sichtbaren Hinweis „Das Zeitalter neigt sich – Wechsel bereit“ zeigen; oder Wechsel nach `EPOCH_MAX` automatisch anbieten. Mit dem Epochen-Audit abstimmen.

**3. Kein Schutz bei Sold > Einnahmen (mittel).**
Beleg: Makedonien (Ep. 2, 30 Prov., 65 Einheiten) fällt in beiden Läufen von +610 auf −150 bis −334 Gold/Runde und verliert 28–29 Provinzen; Ep. 3 ebenso (40 → 4 Prov.). Ein aktiver Spieler würde gegensteuern, aber es gibt keine frühe, deutliche Warnung.
Vorschlag: Ratswarnung mit Zahlen, sobald das Netto 3 Runden negativ ist und die Kasse < 10 Runden reicht, mit Ein-Tipp-Aktion „Teuerste Einheiten entlassen“ oder „Steuern erhöhen“. Kein Eingriff in die Regeln.

**4. Berechnete Schlachten kennen keine Konter (mittel).**
Beleg: Code (Abschnitt A). Speerträger haben die beste Stärke je Gold (11,7 je 100 Gold), Artillerie die schlechteste (5,9). Wer nur „Berechnen“ nutzt, fährt mit Speermassen am besten; Reiterei lohnt sich dort kaum.
Vorschlag (vorsichtig): in `armyPower` einen kleinen Zusammensetzungsbonus: +5 % bei mindestens 3 Rollen im Heer, Reiterei +10 % gegen Heere ohne Speerträger, Fernkampf +5 % bei Verteidigung. Messung mit einer Kampfsimulation (gleiches Gold, verschiedene Mischungen) vorher/nachher.

**5. Schutzzeit für kleine Startreiche (niedrig).**
Beleg: Rom-Lauf 1 verliert die zweite Provinz bis Runde 11 (Schutz 10 Runden auf Normal). Einmal in 2 Läufen.
Vorschlag: Nur beobachten; ggf. Erzfeind-Angriffe erst ab Runde 15 auf Normal.

**Nicht gemessen:** Forschungstempo (kein Spieler-Forschen im Passivlauf), Ordnung/Unruhe-Verteilung, Glaubenswechsel, Söldnerwirtschaft im aktiven Spiel, echte Echtzeitschlachten. Schneeball insgesamt moderat (Gini 0,36–0,46, keine Explosion).
