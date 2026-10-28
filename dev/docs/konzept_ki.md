# Konzept: Schwierigkeit & KI-Charakter (Stand v171, base71.html)

Nur gelesen, nichts geändert. Zeilennummern ungefähr.

## 1. Ist-Stand

**Schwierigkeitsgrade** (`DIFF`, Z. 9196): Leicht / Normal / Schwer, Wahl nur im Startmenü (`diffSeg`, Z. 10847), danach fest in `S.diff`.

| Faktor | Leicht | Normal | Schwer | Wirkung (Beleg) |
|---|---|---|---|---|
| `ai` | 0,75 | 1 | 1,3 | KI-Einnahmen (nur positive) × Faktor; Erzfeind im Krieg mit dir zusätzlich ×1,2 (Rundenabrechnung) – **reiner Bonus, also „Cheat“** |
| `army` | 0,7 | 1 | 1,12 | Heeresobergrenze der KI (`aiFaction`, Z. 12266) |
| `need` | 1,6 | 1,4 | 1,2 | Mindest-Überlegenheit, bevor die KI eine Spielerprovinz angreift (gegen KI immer 1,3) |
| `war` | −0,4 | 0 | +0,3 | Kriegslust gegen den Spieler (`aiDiplomacy`, Z. 11467) |
| `grace` | 16 | 10 | 5 | Schutzrunden am Start (`shielded`, Flotten, Embargo, Koalition, Erzfeind-Krieg) |
| `pl` | 1,15 | 1 | 1 | Spieler-Steuern +15 % nur auf Leicht |

Dazu: Epochenschutz `EPOCH_SHIELD=6` Runden nach Epochenwechsel; Leicht schaltet zwei Hilfen ab/an (Z. 11295, 17559).

**KI-Entscheidungen** – überall gleich für alle Reiche:
- Krieg erklären (`aiDiplomacy`): Wert aus Kriegsgrund ±0,35, Machtverhältnis, Beziehung/60, Übermacht +1, Spieler-Faktor `war`, Ablenkung des Gegners +0,3, Bündnispflicht +0,8, Abschreckung (`garDeter`); Schwelle 1,8 und 12 % Zufall. Keine Kriege bei ≥2 Kriegen oder Kriegsmüdigkeit ≥50.
- Frieden: verliert (<0,8 Macht), müde (≥60), satt (2 Siege) oder lange Kriege.
- Bündnisse/Verträge (`aiEval`, Z. 11414): Beziehung, gemeinsamer Feind, Übermacht, Ruf (`trustOf`).
- Forderungen (`aiDemand`): nur bei ≥2,2-facher Macht, selten, mit Abständen.
- Militär (`aiMil`): Heeresverfassung nur im Krieg, 25 % Zufall.
- **Erzfeind** (`pickNemesis`, Z. 14900): historisch (`NEM_HIST`) oder stärkster Nachbar; eigener Spannungszähler `ten` → Kriegserklärung ab 12, eigene Feldzüge (`a.camp`, `campStep`), Feldherren-Namen (`NEM` Liste), Anzeige „Kriegsgefahr x %“ im Erzfeind-Fenster.
- Kampf-KI (`aiThink`) ohne Boni.

**KI-Persönlichkeiten:** gibt es **nicht**. Keine Werte je Herrscher/Volk für Aggression, Handel, Expansion oder Verlässlichkeit; Herrscher-Eigenschaften wirken nicht auf KI-Entscheidungen (Suche nach aiStyle/Persönlichkeit/Charakter: 0 Treffer). Unterschiede entstehen nur aus Lage, Kultur-Heerwesen und Ereignissen.

**Rückmeldung an den Spieler:**
- Beziehung mit Aufschlüsselung (`relParts`, Z. 10888), Ruf (`trustOf`), Ablehnungsgründe im Klartext (`aiEval.why`) – gut.
- Kriegsgefahr nur beim Erzfeind sichtbar. Für alle anderen Reiche sieht man nicht, ob sie rüsten oder einen Krieg erwägen.
- Schwierigkeit im laufenden Spiel nicht sichtbar oder änderbar.

**Probleme:**
1. „Schwer“ wirkt vor allem über mehr Gold und mehr Truppen (Cheat), nicht über klügeres Spiel.
2. Alle KI-Reiche „denken“ gleich – Rom und Karthago, Mongolen und Song verhalten sich nur lagebedingt verschieden.
3. Überraschende Kriegserklärungen von Nicht-Erzfeinden ohne Vorwarnung.
4. Einsteiger können den Grad nicht nachträglich senken.

## 2. Ideen

| # | Idee | Nutzen | Aufwand | Risiko |
|---|---|---|---|---|
| A | **Stimmung je Reich** sichtbar: „freundlich / misstrauisch / erwägt Krieg / rüstet“ aus dem schon berechneten Kriegswert (`sc` in `aiDiplomacy`) und Truppenaufbau; Symbol in Diplomatie und auf der Karte (Sicht von Reich X) | Keine Überraschungskriege mehr, Spieler versteht die KI | S | Keines im Verhalten (nur Anzeige) |
| B | **Charakter je Herrscher/Volk** (4 Werte, leicht): Kriegslust, Handelsgeist, Verlässlichkeit, Ehrgeiz. Grundwert aus Volk/Kultur (z. B. Steppe/Wikinger kriegslustig, Venedig/Hanse händlerisch), Herrscher variiert ±; wirkt als kleiner Summand in vorhandenen Formeln (Kriegsschwelle ±0,3, Bündnis-/Handelsbereitschaft, Vertragsbruch) | Reiche fühlen sich unterschiedlich an, Herrscherwechsel ändert Politik | M | Verhalten ändert sich → messen (gbm.js: Kriege/Bündnisse 40 Runden), klein dosieren |
| C | **Charakter anzeigen**: im Diplomatiefenster zwei, drei Wörter („kriegerisch, verlässlich“) + Einfluss beim Herrscherwechsel als Nachricht | Rollenspiel-Gefühl, Planbarkeit | S (mit B) | – |
| D | **Schwierigkeit fairer**: „Schwer“ statt Goldbonus mehr Klugheit: Koalitionen früher, KI konzentriert Heere, nutzt Feldzüge auch gegen andere starke Spieler, nutzt Schwächen (Spieler im Zweifrontenkrieg). Goldbonus reduzieren (1,3 → 1,15) | Herausforderung ohne Gefühl von Betrug | M–L | Balance; muss gemessen und gespielt werden |
| E | **Schwierigkeit im Spiel ändern** (Menü → Optionen), nur nach unten frei; nach oben mit Hinweis | Einsteiger hängen nicht fest | S | Erfolge/Wertung: Hinweis „mit Leicht beendet“ |
| F | **Einsteiger-Grad „Entdecker“** unter Leicht: längere Schonzeit, KI erklärt nie ohne Vorwarnung Krieg, Rat schlägt mehr vor | Zugänglichkeit (passt zu Bedienung Phase 2) | S | gering |
| G | **Vorwarnung vor Kriegen**: Reich mit hohem Kriegswert schickt 1–3 Runden vorher eine Drohung/Forderung (vorhandenes `aiDemand`-Muster) | Fair, dramatisch, nutzt vorhandene Mechanik | S–M | Leicht weniger Überraschung, KI etwas berechenbarer |
| H | KI-Lernen aus Spielerverhalten (Wortbruch merkt sich jeder) | schon teilweise über Ruf | – | nicht nötig |

Bewusst nicht: KI-Persönlichkeitsbäume oder Agendasysteme aus bestehenden Spielen; die Werte bleiben einfache Zuschläge in den vorhandenen Formeln.

## 3. Empfehlung

**Phase 1** (ein Lauf, wenig Verhaltensänderung):
- A Stimmung je Reich sichtbar (nur Anzeige)
- G Vorwarnung vor Kriegserklärung (Drohung 1–3 Runden vorher, nicht bei Erzfeind-Überfall im Krieg)
- E Schwierigkeit im laufenden Spiel ändern
- F Grad „Entdecker“ (für Einsteiger, passt zur Bedienung)
- Messung vorher/nachher mit gbm.js (40 Runden, Rom + Epoche 2, je 3 Läufe): Kriege, Bündnisse, Friedensschlüsse

**Phase 2** (gemessen, in kleinen Schritten):
- B+C Charakter je Volk/Herrscher, zuerst nur Kriegslust und Verlässlichkeit, Ausschlag klein (±0,3 auf Schwelle 1,8)
- D „Schwer“ klüger statt reicher, Goldbonus schrittweise senken, jeweils messen und von Moritz anspielen lassen

## 4. Entscheidungsfragen an Moritz

1. **Sollen KI-Reiche einen Charakter bekommen (kriegerisch, händlerisch, verlässlich …), der ihr Verhalten leicht verändert?**
   Empfehlung: Ja, aber erst in Phase 2 und vorsichtig dosiert mit Messung. Phase 1 zeigt zunächst nur an, was die KI ohnehin denkt.
2. **Soll „Schwer“ weniger über Gold-/Truppenboni und mehr über klügeres Verhalten wirken?**
   Empfehlung: Ja, schrittweise (Goldbonus 1,3 → 1,15, dafür Koalitionen und Heereskonzentration), jeweils gemessen.
3. **Sollen Kriegserklärungen (außer beim Erzfeind) vorher angekündigt werden?**
   Empfehlung: Ja, mit Drohung 1–3 Runden vorher; auf „Schwer“ nur 1 Runde.
