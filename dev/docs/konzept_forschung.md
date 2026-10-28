# Konzept Forschung – Imperium der Epochen 2

Stand 27.10.2026. Grundlage: Code-Analyse `imperium.html` (nur gelesen), ein Messlauf (Rom, 75 Runden), Recherche zu anderen Spielen.

## 1. Befund

### 1.1 Aufbau des Baums (Code)
- Pro Epoche und Bereich gibt es eine **lineare 4er-Kette** (`TECHS`/`TECHS_LATER`, `req` = Vorgänger). Dazu kommen:
  - Militär: 2–4 Einheiten-Techs, die an einem Kettenglied hängen
  - je Bereich am Kettenende 1 Doktrin-Paar (`ex`, nur eine wählbar)
  - Bauhütte (E0) und Dombauhütten (E2) mit `xc` (zählen nicht für den Epochenwechsel)
- **Querverbindungen zwischen Bereichen: keine.** Jede `req` zeigt in denselben Bereich, und das gilt in allen 5 Epochen. Auch über Epochen hinweg gibt es keine `req`: E1-Techs hängen nicht an E0-Techs.
- Die maximale Tiefe ist überall 4: Kette 1→4, Doktrin hängt an Glied 4.
- Kosten steigen innerhalb jeder Kette linear (E0: 12/20/28/36 … E4: 50/64/78/92).
- `techAvail` prüft nur `hasTech(f,t.req)`. **Arrays als `req` werden nicht unterstützt**, nur `techOpens` (Menü-Badge „★ Schlüssel“) liest Arrays.
- Geistesblitz (`EUR`): 4 je Bereich und Epoche, nur auf den Kettentechs. Einheiten und Doktrinen haben keinen. Effekt: Kosten ×0,6 (Doktrin „Akademien“ usw.: ×0,4).
- Eigenes Wissen (`CUL_TECHS`): 39 insgesamt, verteilt auf 12 Kulturkreise. Für Europa/Rom gibt es nur 3 über alle Epochen. Je Epoche: 8/13/12/5/1.
- Forschungsrate (`researchRate`, ~Z. 2936): 5 + 0,6 je Provinz + 3 je „gelehrter“ Provinz + Tempel/Kloster/Bibliothek usw.; Schrift ×1,2; dazu `rp`-Boni. Kosten sinken über `techMult` durch Kulturneigung und Wissensverbreitung (Nachbarn kennen die Tech), Untergrenze ×0,4.
- Wenn alles erforscht ist, bleiben nur die „Fortschritte“ (REP), wiederholbar mit Kosten Ø×1,2×(1+0,3·Stufe).

### 1.2 Epochenlogik
- `checkEpoch`: Ein Wechsel ist möglich ab Runde `epochTurn+EPOCH_MIN(40)`, wenn der Spieler **oder die Hälfte der Reiche** `EPOCH_TECHS(8)` Techs der Epoche kennt. Die Zeitgrenze (`yearCapHit`) und `EPOCH_MAX(65)` erzwingen ihn spätestens.
- Rechnerische Jahresgrenze bei ypt 13/9/11/5: E0 ≈ 52 Runden, E1 ≈ 53, E2 ≈ 53, E3 ≈ 56 (danach +3 Runden Gnadenfrist).

### 1.3 Umfang je Epoche (statisch, Rom)
„Wählbar“ zählt ein Doktrin-Paar als 1. „Zählt“ heißt ohne `xc`. Die Kosten sind Grundkosten der wählbaren Techs, ohne Rabatte.

| Epoche | Techs gesamt (Mil/Wi/Ku) | wählbar | zählt für Wechsel | Gesamtkosten | Tiefe | Quer |
|---|---|---|---|---|---|---|
| 0 Antike | 23 (10/6/7) | 20 | 19 | 550 | 4 | 0 |
| 1 Völkerwanderung | 20 (8/6/6) | 17 | 17 | 594 | 4 | 0 |
| 2 Mittelalter | 22 (9/6/7) | 19 | 18 | 938 | 4 | 0 |
| 3 Frühe Neuzeit | 20 (8/6/6) | 17 | 17 | 1046 | 4 | 0 |
| 4 Napoleon | 21 (9/6/6) | 18 | 18 (letzte Epoche) | 1340 | 4 | 0 |

`EPOCH_TECHS=8` entspricht damit nur **42–47 %** der Techs einer Epoche.

### 1.4 Messung (1 Lauf, Rom, 75 Runden; Skript `shot/forsch.js`, Rohdaten `shot/forsch_log.jsonl`)
Aufbau: Der Spieler-Zug wird von der KI gespielt (`aiFaction(S.player)`). Geforscht wird immer die billigste verfügbare Tech, auch Reste aus alten Epochen. Ausgerufen wird die Epoche, sobald das möglich ist.
Ein erster Versuch mit völlig passivem Spieler endete in Runde 21, weil Rom unterging. Daraus stammen nur die Werte bis Runde 21; die Rate lag dort bei 6–9.

| Kennzahl | Antike (R1–41) | Völkerwanderung (R42–75) |
|---|---|---|
| Spieler-Forschung/Runde | 7,3 → 16 (meist 10–12) | 10–15 |
| KI-Rate Median / Maximum | 6,7→13 / 11→27 | 12→20 / 26→60 |
| Führende KI erreicht 8 Techs | **Runde 11** | Runde 53 (11 Runden nach Beginn) |
| Führende KI hat **alle** zählenden Techs | **Runde 31** (19/19, Seleukiden) | Runde 66 (17/17, 24 Runden nach Beginn) |
| Spieler erreicht 8 Techs | Runde 22 | Runde 71 (29 Runden nach Beginn) |
| Spieler bei Epochenende | 14/19 zählend (5 offen) | nicht gemessen (Lauf endete in R75 bei 9/17) |
| Spieler hat alle Techs | **nie** (bis R75 nicht erreicht) | nie |
| Epochenwechsel | Runde 41/42 (= EPOCH_MIN) | nicht gemessen (frühestens R82) |
| Geistesblitze des Spielers | 2 in 41 Runden | 0 weitere (insgesamt 2 in 75 Runden) |

Epochen 2–4 wurden nicht gemessen. Hochrechnung (nicht gemessen): Die Kosten steigen von E1 auf E2 um +58 % und bis E4 um +125 %. Wächst die Rate nicht entsprechend, sinkt der Anteil, den der Spieler schafft.

### 1.5 Kernaussagen
1. **Die Epochendauer hängt allein an EPOCH_MIN.** Die Tech-Bedingung (8) ist von der KI schon nach 11 Runden erfüllt. Die übrigen 29 Runden sind reines Warten.
2. **Die Schere ist groß.** Ein starkes Reich ist nach ~30 Runden fertig und hat danach 10 Runden lang nur die „Fortschritte“. Ein mittleres Reich (Rom, 5 Provinzen, ~11 P/Runde) schafft in 40 Runden ~75 % der Techs.
3. **Die Menge reicht für 30–35 Runden, nicht für 40.** Bei ~12 P/Runde und 550 Punkten (mit Rabatten ~450) braucht der Spieler rechnerisch ~40–45 Runden.
4. **Motivationslücken**:
   - Vier parallele lineare Ketten ohne Querbezug, also keine Entscheidung „was öffnet was“.
   - Geistesblitze sind zu selten (2 in 75 Runden) und kaum sichtbar.
   - Der Epochen-Fortschritt („8 Techs“) ist kein spürbares Ziel.

## 2. Übertragbare Mechaniken (nur Konzepte)

| Spiel | Konzept | Was motiviert |
|---|---|---|
| Civilization VI | Eureka/Inspiration: eine Spielhandlung gibt 50 % auf eine Tech | Spielen und Forschen greifen ineinander, sichtbares Ziel |
| Civilization IV/V | UND/ODER-Voraussetzungen über Bereiche hinweg | Wichtige Techs brauchen Breite, man plant Wege |
| Old World | Tech-Deck: 4 Karten ziehen, 1 wählen; Bonuskarten (Einmaleffekt) | Jede Wahl ist eine echte Entscheidung, kein fester Pfad |
| Humankind | Era Stars: 7 von 21 Zielen in 7 Kategorien für den Aufstieg | Klare Meilensteine, viele Wege zum Ziel |
| Endless Legend | 9 Techs einer Ära öffnen die nächste; Kosten steigen mit jeder Entdeckung | Je mehr man hat, desto teurer, das bremst Ausreißer |
| Age of Empires II/IV | Zeitalteraufstieg braucht 2 Gebäude der Ära bzw. ein Wahrzeichen (1 von 2) | Eine bewusste „Epochenaktion“ statt Timer |
| Total War: Warhammer (Imperium) | Techs werden durch Gebäude freigeschaltet | Bauen öffnet Forschung |
| Stellaris | Zufällige Auswahl aus wenigen Karten, seltene Techs | Überraschung, Vorfreude |

### M1 Querabhängigkeiten zwischen Bereichen (Civ IV/V) – größter Effekt
- `req` als Array erlauben (UND). `techAvail`, `why`-Text und `branchHtml` müssen dafür angepasst werden.
- Je Epoche **3–4 Querkanten**, immer ab Kettenglied 3 oder 4, damit der Einstieg einfach bleibt. Beispiele:
  - E0: Belagerungskunst ← Eisenwaffen + **Baukunst**
  - E0: Straßenbau ← Handelsrouten + **Eisenwaffen** (Legionärsstraßen)
  - E0: Bürgerrecht ← Baukunst + **Münzprägung**
  - E2: Universitäten ← … + **Zünfte**
  - E2: Bombarden ← Burgenbau + **Zünfte**
  - E3: Banken ← … + **Buchdruck**
- Wirkung: Das Badge „★ Schlüssel“ greift dann wirklich, und man sieht „X öffnet 3 Dinge in 2 Bereichen“.
- Aufwand: mittel (~40 Zeilen plus Daten). Risiko: gering bis mittel. Die KI wählt nur aus `techAvail` und bleibt dadurch nie stecken. Prüfen muss man aber `grantOldTechs` und `t.ex`.

### M2 Epochen-Schlüsseltech („Zeitalterwende“, AoE + Humankind + Endless Legend)
- Je Epoche **eine Abschluss-Tech** („Wende zur Völkerwanderung“, „… zum Mittelalter“). Voraussetzung: z. B. **2 Techs je Bereich** oder Glied 3 in zwei Bereichen. Hohe Kosten (~1,5× Glied 4).
- Sie **ersetzt EPOCH_TECHS=8**: Ein Wechsel ist möglich, wenn der Spieler die Wendetech hat, oder die Hälfte der Reiche (Mindestrunde bleibt).
- Bonus für das erste Reich: wie die vorhandenen Durchbrüche (`BRK`), z. B. „Gold + Einfluss“ oder ein früherer Einheiten-Typ.
- Aufwand: mittel. Risiko: mittel, weil `checkEpoch`, `epochState`-Dialog und der KI-Forschungswahl (Z. ~3012, gewichtet zufällig) betroffen sind. Die KI sollte die Wendetech ab Runde Min−8 bevorzugen.

### M3 Geistesblitze ausbauen und sichtbar machen (Civ VI)
- Gemessen gab es 2 Geistesblitze in 75 Runden, das ist zu selten. Vorschlag:
  - auch Einheiten-Techs und Wendetechs bekommen einen
  - die Bedingungen erreichbarer machen (heute z. B. „15 Schlachten“, „30 Provinzen“)
  - 40 % beibehalten
- **Fortschrittsanzeige** am Knoten („Märkte 2/3“). Ein Hinweis kommt, wenn die Bedingung zu 50 % erfüllt ist.
- Neu: **Gebäude-Geistesblitz** nach TW-Art. Ein bestimmtes Gebäude gibt sofort **+25 % Fortschritt** auf die Tech (Bibliothek II → Universität). Ein harter Gebäude-Zwang wird es nicht, damit niemand blockiert wird.
- Aufwand: gering (Daten plus Anzeige). Risiko: gering. Die Tech-Kosten sinken effektiv, das gleicht sich mit der kürzeren Epoche aus.

### M4 Echte Wahlknoten in der Mitte (Old World light)
- Die Doktrin-Paare am Ende gibt es schon. Neu kommt **ein Wahlknoten auf Glied 2–3 je Bereich**: zwei Varianten, eine wählbar, die andere bleibt bis zur nächsten Epoche gesperrt (`ex` gibt es bereits). Beispiel E0 Wirtschaft: „Seehandel (+Handel)“ oder „Kornkammern (+Wachstum)“ schon auf Glied 2.
- Optional als Old-World-Element: **Gelehrten-Angebot**. Alle 8 Runden erscheinen 3 Karten (2 normale Techs zu −15 % und 1 Bonuskarte mit Einmaleffekt, z. B. „+150 Gold“, „freie Einheit“, „+1 Ordnung für 10 Runden“). Das ist ein Ziel für die „leeren“ Runden.
- Aufwand: gering (Wahlknoten) bzw. mittel (Angebot). Risiko: gering bzw. mittel (UI, KI-Auswahl).

### M5 Meilensteine im Menü (Humankind-Sterne, nur als Anzeige)
- Ein Epochenbalken oben im Menü: „Wende: 5/8 Voraussetzungen“, „Durchbrüche dieser Epoche: 1 von 3 vergeben“, „Geistesblitze: 2 bereit“.
- Aufwand: gering. Risiko: keins. Wirkt erst richtig zusammen mit M2.

## 3. Empfehlung Epochendauer und Umfang

**Messbasis:**
- Die führende KI ist nach 31 bzw. 24 Runden fertig.
- Der Spieler mit ~12 P/Runde schafft ~14 Techs in 40 Runden, also ~0,35 Techs pro Runde.
- Der Wechsel kommt nur durch EPOCH_MIN.

| Parameter | heute | Vorschlag | Begründung |
|---|---|---|---|
| EPOCH_MIN | 40 | **30** | Die KI-Spitze ist bei 24–31 fertig. Ein mittleres Reich hat nach 30 Runden ~10–11 von 17–19 Techs (aus der Messung: 0,35/Runde) |
| EPOCH_TECHS (oder Wendetech, M2) | 8 | **11** (≈ 60 %) | Dann ist die Bedingung echt: Spieler ~R28–32, KI-Spitze ~R15–18. „Hälfte der Reiche“ bremst Ausreißer |
| EPOCH_MAX | 65 | **45** | Sicherheitsnetz |
| ypt (Jahre/Runde) | 13/9/11/5/1 | **22/15/18/9/1** | Sonst springt das Jahr beim Wechsel (gemessen: 220 → 400). Spanne ÷ ~32 Runden |
| Anzahl Techs | 17–20 wählbar | **+3 je Epoche** (Wendetech plus 2 Wahl-/Querknoten), keine weiteren Ketten | Ein mittleres Reich soll ~70 % schaffen, ein starkes alles kurz vor Schluss |

- Ein Risiko ist nicht gemessen: Die späteren Epochen werden um 58–125 % teurer. Vor der Umsetzung sollte ein Lauf ab Epoche 2 (Startwelt `w2`) die Rate prüfen. Falls nötig: `TECHS_LATER`-Kosten E2–E4 um ~15 % senken oder `rp` stärker skalieren.
- Alternative ohne M2: Die Mindestdauer an die Forschung koppeln, also `EPOCH_MIN` = 30, aber nur, wenn die Hälfte der Reiche 11 Techs hat. Sonst gilt 38. Einfacher, aber weniger spürbar.
- Die „Fortschritte“ bleiben das Ventil für Spitzenreiter. Bei 30 Runden Min sind das ~5 statt ~10 Runden.

## 4. Menü-Vorschlag „Forschungsübersicht“

**Probleme heute:**
- 5 Reiter, und je Bereich ein 92 px hohes Banner (`.tban`).
- Man sieht nicht, wo noch etwas offen ist.
- Ältere offene Techs stehen versteckt am Ende des Reiters.

**Neu:**
- **Standardansicht „Übersicht“**: 3 Spalten (Militär, Wirtschaft, Kultur) nebeneinander.
- Querkanten als SVG-Linien zwischen den Spalten, Wendetech unten mittig.
- Knoten kompakt: Icon (ca. 40 px), Name und Kosten. Details erscheinen erst beim Antippen in einem Bottom-Sheet.
- **Zähler in jedem Spaltenkopf**: „3 offen · 2 verfügbar · 1 ✦“ (✦ = Geistesblitz bereit).
- Banner nur noch als **28–36 px hoher Bildstreifen** im Spaltenkopf.
- Reiter bleiben für „Eigenes Wissen“ und „Fortschritte“ und tragen ebenfalls Zähler, z. B. „Eigenes Wissen (1)“.
- „Ältere Epochen“ bekommt eine eigene, einklappbare Zeile mit Zähler, nicht mehr versteckt im Bereich.
- Zustände: erforscht (gedimmt, Haken), verfügbar (hell, Goldrand), laufend (Balken), gesperrt (grau, Schloss, Linien zeigen woher). Geistesblitz-Fortschritt erscheint als kleiner Ring am Knoten.
- iPad: Querformat mit 3 Spalten. Hochformat: horizontal scrollbar mit Snap je Spalte, die Zähler bleiben oben fixiert.

```
┌ Forschung · Antike ───────────────── 12,3 P/Runde · Wende: 7/11 ┐
│ [Übersicht]  Eigenes Wissen (1)  Fortschritte  Ältere (2)       │
├────────────────┬──────────────────┬─────────────────────────────┤
│▒ MILITÄR ▒▒▒▒▒▒│▒ WIRTSCHAFT ▒▒▒▒▒│▒ KULTUR ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│ ← 32px-Bildstreifen
│ 2 offen·1 verf.│ 3 offen·2 verf. ✦│ 1 offen·1 verf.             │
│                │                  │                             │
│ [✓Exerzieren]  │ [✓Münzprägung]───┼──┐ [✓Schrift]               │
│      │   └[Bogen]│     │           │  │      │                   │
│ [✓Eisenwaffen]─┼─┐[▶Bewässerung]  │  │ [✓Gesetzgebung]          │
│      │   └[Legion]│    │  ✦60%    │  │      │                   │
│ [ Pferdezucht] │ └▶[ Handelsrouten]│  └▶[ Baukunst]─┐            │
│      │         │         │        │       │        └[Bauhütte]   │
│ [🔒Belagerung]◀┼─────────┼────────┼───────┘                     │
│      │         │ [🔒Straßenbau]◀─┘ │ [🔒Bürgerrecht]             │
│  ◇Doktrin A|B  │  ◇Doktrin C|D    │  ◇Doktrin E|F               │
├────────────────┴────────┬─────────┴─────────────────────────────┤
│          ★ [Wende zur Völkerwanderung]  braucht 2 je Bereich     │
└─────────────────────────────────────────────────────────────────┘
 Antippen eines Knotens → Bottom-Sheet: Text, Wirkung, Geistesblitz-
 Fortschritt („Märkte 2/3“), Durchbruch, „Öffnet: …“, [Erforschen]
```

Aufwand: mittel bis hoch (neues Layout, SVG-Linien per `getBoundingClientRect` nach dem Rendern, Bottom-Sheet). Risiko: gering für die Spiellogik, mittel für Touch und Scrollen auf dem iPad. Die bestehende `row()`-Logik lässt sich für das Bottom-Sheet weiterverwenden.

## 5. Reihenfolge, Aufwand, Risiko

| # | Maßnahme | Aufwand | Risiko | Warum hier |
|---|---|---|---|---|
| 1 | EPOCH_MIN 30, MAX 45, EPOCH_TECHS 11, ypt anpassen | sehr gering (1 Zeile plus EPOCHS) | gering bis mittel (Spawns und Ereignisse an Runden prüfen, `KIT_ON` lädt Kits bei epochTurn+30!) | erfüllt Moritz' Wunsch sofort und ist messbar |
| 2 | Menü-Übersicht mit Zählern und flachem Banner | mittel bis hoch | gering | löst „man sieht nicht, was offen ist“ |
| 3 | Querabhängigkeiten (Array-`req`) und Linien | mittel | gering bis mittel | Kern des gewünschten „erst das eine, dann das andere“; braucht die Übersicht (2) für die Linien |
| 4 | Geistesblitze erreichbarer, mit Fortschritt am Knoten | gering | gering | billige Motivation, Rückmeldung aus dem Spiel |
| 5 | Wendetech je Epoche (ersetzt Zähler 8/11) | mittel | mittel (KI, Dialog) | macht den Epochenwechsel zum Ziel |
| 6 | Wahlknoten Mitte und optionales Gelehrten-Angebot | gering bzw. mittel | gering bzw. mittel | Feinschliff, erst nach einer Messung von 1–5 |

**Hinweise:**
- Nach Schritt 1 und nach Schritt 5 je einen Messlauf machen: Rom 75 Runden plus `w2` 40 Runden.
- Wichtig zu Schritt 1: `endTurn` lädt das nächste Grafik-Kit bei `epochTurn+30`. Bei EPOCH_MIN 30 muss das auf ~+22 vorgezogen werden, sonst gibt es Ladezeit beim Wechsel.

Quellen (Konzepte):
- designer-notes.com/?p=1703 (Old World Tech-Deck)
- totalwar.com/?p=1080 (Warhammer-Techbäume)
- endless-legend.fandom.com/wiki/Technology
- humankind.fandom.com/wiki/Era
- ageofempires.com/learn-to-play/advancing-aoe2
- Stellaris Dev Diary #11 (Paradox-Forum)
