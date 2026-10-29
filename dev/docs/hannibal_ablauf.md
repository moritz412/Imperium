# Hannibal-Kampagne – vollständiger Spielablauf (Plan 29.10.2026)

Grundlagen: `konzept_hannibal.md` (Bausteine 1–7, freigegeben 27.10.), `konzept_kino.md`, `lehren_kampagnen.md`, `schlacht_umsetzung.md`.
Ist-Stand im Code (`SCEN.hannibal`, Z. ~5786): 10 Schritte, 72 Runden, 4 Runden je Jahr (`ypt` 0,25 = Jahreszeiten!), Einheiten libyer/scutar/balear/numid/elef/manipel/socii vorhanden,
allgemeine Bausteine vorhanden: `passRound` (Pass-Verluste), `tryDefect` (Abfall), `supplyRound` (fern vom Nachschub), `PLANS` (Schlachtplan Frontal/Umfassung/Geländeangriff), Hook 8 (Hasdrubal) und 9 (Scipio in Africa).
Nicht vorhanden: Pass-Abschnitt mit Ereignissen, Elefanten-Panik, Fabius-Verhalten, Rat von Karthago, gesperrte falsche Wege, Kino, Sonderschlachten.

**Bauweise (Vorschlag):** Kampagne (Karte) jetzt, Echtzeit-Sonderschlachten nach dem Schlachtsystem. Bis dahin werden Trebia, Trasimene, Cannae, Zama berechnet – mit Schlachtplan und Gelände-Bonus.

---

## Überblick: vier Akte, jeder mit eigener Regel

| Akt | Jahre | Runden (Ziel) | Neue Regel in diesem Akt | Gegner-Drehbuch | Ende des Akts |
|---|---|---|---|---|---|
| I Hispanien | 219–218 | 1–8 | Belagern, Besatzung zurücklassen, Rhone-Übergang | Rom erklärt Krieg (Schritt 1), Scipio-Brüder landen in Hispanien (Runde ~6) | Rhone überquert |
| II Über die Alpen | 218–217 | 9–20 | **Pass-Abschnitt**, Kelten-Treue, Fern vom Nachschub | Zwei Konsulheere marschieren auf Hannibal zu | 2 Siege (Trebia, Trasimene) |
| III Italien | 216–208 | 21–52 | Cannae, **Fabius-Verhalten**, Abfall der Städte, Winterlager, **Rat von Karthago** | Rom stellt Riesenheer bei Cannae, danach Zermürbung | 4 Städte im Süden abgefallen |
| IV Die Entscheidung | 207–202 | 53–72 | Hasdrubal über die Alpen, Wahl Rom/Zama | Rom fängt Hasdrubal ab (Metaurus), Scipio landet in Africa | Rom fällt oder Zama |

Falsche Wege, ausdrücklich gesperrt (Grund am Knopf, Lehre Nr. 2):
- **Seeweg nach Italien vor Akt IV:** „Rom beherrscht das Meer. Der Weg nach Italien führt über die Alpen.“ Flotten dürfen keine Heere an Italiens Küste anlanden lassen (Ausnahme Verstärkung durch den Rat, s. u.).
- **Rom direkt angreifen vor Akt III:** Latium hat Sondergarnison (Bürgerheer) und Mauern; Angriff möglich, aber Rückfrage zeigt geschätzte Lage („Rom hat noch 4 Legionen im Feld und starke Mauern – fast aussichtslos.“).
- **Unterwerfung Roms per Diplomatie:** nie (Rom verhandelt erst nach Akt III und nur über Frieden, s. Ende A).

---

## Akt I · Hispanien (Runden 1–8)

**Schritt 1 Sagunt** (bestehend, Ziel `hold edetaner`)
- Sagunt bekommt Mauern und Garnison, die 3–4 Runden Belagerung verlangen (heute möglicherweise schneller – messen). Rom erklärt beim Fall den Krieg (Hook 1, bestehend → besser: Hook beim *Beginn* der Belagerung, damit die Kriegsschuld bei Hannibal liegt wie historisch).
- Bild: Kino 1 beim Start („Der Schwur“, 5 Bilder hn_k1_*).

**Schritt 2 Ebro und Pyrenäen** (bestehend, 3 von 4 Provinzen)
- **Neu „Besatzung zurücklassen“:** Beim Verlassen Hispaniens (erste Provinz jenseits der Pyrenäen) Wahl:
  a) Hanno mit 3 Einheiten bleibt nördlich des Ebro (Rückweg gesichert, Scipio-Landung wird abgewehrt),
  b) alle ziehen mit (stärkeres Heer, Hispanien offen; Rom landet sicher),
  c) unwillige Iberer heimschicken (−2 Einheiten, Moral +, Sold −).
- Gegner-Drehbuch: Runde ~6 landen Gnaeus und Publius Scipio mit 5 Einheiten bei Emporion (Hook) und greifen Hispanien an. Ergebnis hängt an der Wahl.

**Schritt 3 Die Rhone** (bestehend, 1 von 3)
- **Neu Rhone-Übergang** (Ereignisfenster beim ersten Betreten von narbo/vocontier mit Elefanten): a) Flöße bauen (1 Runde Wartezeit, Elefanten sicher), b) übersetzen sofort (jede Elefanten-Einheit 50 % Risiko −1 Tier/Einheit −30 % Männer). Volcae-Krieger am anderen Ufer → Schlacht; Plan „Umfassung“ erhält +10 % zusätzlich („Hanno quert flussaufwärts“).
- Kapitelbild hn_kap_rhone.

## Akt II · Über die Alpen (Runden 9–20)

**Schritt 4 Der Pass** – Baustein 1, das Herzstück
- Auslöser: Hannibals Heer betritt eine Pass-Provinz der Westalpen (salasser, segusiner, seealpen).
- **Routenwahl** (Fenster, Bild hn_ps_route): kurz/steil (2 Runden, Verluste hoch, Schnee), lang/Wald (4 Runden, Verluste mittel, Vorräte knapp), bewacht (3 Runden, Kampf gegen Bergstamm oder Bestechung).
- **Leiste im Heer-Blatt während des Passes:** Vorräte · Tragtiere · Moral (je 0–100), dazu Jahreszeit-Uhr (jede Runde später = mehr Schnee).
- **Tagesereignisse** (1–2 je Runde im Pass, Fenster mit Bild und Wahl):
  | Ereignis | Wahl | Folge |
  |---|---|---|
  | Bergstämme (hn_k2_bergstaemme) | kämpfen / bestechen (Gold) / Geiseln nehmen | Männer bzw. Gold bzw. Moral |
  | Häuptling bietet Führer an (hn_ps_haeuptling) | vertrauen / ablehnen | 50 %: Abkürzung oder Hinterhalt |
  | Felssturz (hn_k2_fels) | Feuer + Essig (1 Runde, Vorräte −) / umgehen (+1 Runde) | historische Lösung belohnt |
  | Lawine (hn_ps_lawine) | – | Verlust 5–10 % |
  | Frostnacht (hn_ps_frost) | Tragtiere schlachten / ausharren | Tragtiere ↔ Moral |
  | Elefant stürzt (hn_ps_absturz) | Seile/zurücklassen | Elefanten |
  | Vorräte knapp (hn_ps_vorraete) | Rationen kürzen / Tragtiere essen | Moral ↔ Tragtiere |
- **Ergebnis:** Ankunft in Taurini/Insubrien mit 40–70 % der Männer (historisch ~50 %), Elefanten 0–100 % (historisch fast alle überlebten zunächst, starben dann im Winter an der Trebia). Messziel: normaler Spieler 50 ± 10 %.
- Kino 2 („Der Pass“): Teil 1 beim Betreten (hn_k2_kolonne, …), Teil 2 bei Ankunft (hn_k2_poebene, hn_k2_elefanten).
- Wiederverwendung: Endlosspiel behält die leise Geländeregel (`passRound`), Ereignisse nur in der Geschichte (Entscheidung 27.10.). Napoleon (Großer St. Bernhard) kann das Fenster-System später nutzen.

**Schritt 5 Freunde in der Poebene** (bestehend, 2 von 4)
- **Neu Kelten-Treue (Schwung)** – Baustein 3: Leiste 0–100. Sieg +15, Plündern keltischer Provinz −20, Stillstand (3 Runden ohne Sieg) −5/Runde. Ab 50 stellen Insubrer/Boier je Runde mit Chance eine keltische Einheit (kostenlos, Unterhalt halb). Unter 20: keltische Einheiten verlassen das Heer.
- Gegner: Konsul Sempronius zieht von Ariminum heran (bestehend: Heer in ariminum), Publius Scipio (Vater) von Norden.

**Schritt 6 Trebia und Trasimenischer See** (bestehend, 2 Siege)
- **Sonderschlacht Trebia** (Winter, Fluss): Plan „Hinterhalt“ (Mago im Bachbett) = +20 % wenn Kampf in Provinz mit Fluss im Winter. Elefanten: Kälteverlust im Winter (Baustein 2).
- **Sonderschlacht Trasimene** (Nebel, See): Plan „Hinterhalt“ = +25 % wenn Feind in die Provinz einmarschiert (Gegner-Drehbuch: Flaminius marschiert auf Hannibal zu).
- Ladebilder hn_sf_trebia, hn_sf_trasimene. Kapitelbilder hn_kap_trebia, hn_kap_trasimene.

## Akt III · Italien (Runden 21–52)

**Schritt 7 Cannae** – Ziel ändern: statt `hold daunien` → **„Das Heer von Cannae schlagen“** (Rom-Drehbuch: Varro und Paullus mit 12–14 Einheiten erscheinen in Apulien, marschieren auf Hannibal). Plan „Umfassung“ +25 % hier (Sonderwert). Kino 3 nach dem Sieg (hn_k3_*). Bei Niederlage: Akt geht weiter, Fabius-Phase beginnt früher.

**Schritt 8 Capua** (bestehend, 4 von 7 abfallen) – Bausteine 4 und 6
- **Fabius-Verhalten (Szenario-Skript, nicht allgemeine KI):** Römische Heere suchen keine Schlacht mit Hannibals Heer, wenn ihr Verhältnis < 1,5; sie folgen in 2 Provinzen Abstand, verwüsten (vorhandene Verwüstung) Provinzen neben Hannibal (Vorräte!), greifen kleine karthagische Heere und abgefallene Städte an. Ausnahme Marcellus („Schwert Roms“): greift an.
  Gegenmittel des Spielers: Köder (kleines Heer als Lockvogel → Rom greift an → Hannibal steht daneben), Hinterhalt-Haltung, Abfall der Städte. Ereignis „Ochsen mit Fackeln“ (Ager Falernus, 217) als Ausbruch aus einer Falle.
- **Winterlager in Capua** (Baustein aus dem Wikinger-Umbau): Versorgung, Erholung; Livius' „Verweichlichung“ als Ereignis: Moral −, Männer +.
- **Rat von Karthago** – Leiste „Gunst“ 0–100 (Barkiden gegen Hanno-Partei; nutzt Hof-Parteien, falls vorhanden):
  Siege +10, Abfall einer Stadt +5, Stillstand −3/Runde ohne Erfolg, Niederlage −15. Ab 60: Verstärkung anfordern (Mago mit Elefanten/Numidern landet bei Locri – Ausnahme vom Seeweg-Verbot), ab 80: zweite Verstärkung. Unter 25: Rat beruft Hannibal ab (Ende B früher).
  Fenster mit Bildern hn_rat_hanno, hn_rat_barkiden, hn_rat_verstaerkung.
- Kino 4 („Das Zögern“) beim Beginn von Schritt 8.

## Akt IV · Die Entscheidung (Runden 53–72)

**Schritt 9 Nachschub** (bestehend, Hook 8: Hasdrubal)
- Gegner-Drehbuch: Claudius Nero marschiert mit einem Heer nach Norden, um Hasdrubal abzufangen (Metaurus). Spieler muss Hannibal und Hasdrubal vereinen (beide Heere in derselben Provinz) oder Neros Heer schlagen. Scheitert es: Ereignis „Hasdrubals Kopf“ (historisch), Moral −, Gunst −20.
- Hasdrubals Heer nutzt den Pass-Abschnitt in kurzer Form (2 Ereignisse).

**Schritt 10 Rom oder Zama** (bestehend, Hook 9: Scipio landet)
- **Befund im Code:** Hook 9 und das Startheer in Latium heißen beide „Publius Cornelius Scipio“ (Vater, Konsul 218, und Sohn, später Africanus). → Startheer „Publius Cornelius Scipio (Konsul)“, Hook 9 „Scipio der Jüngere“.
- Wahl über Fenster (Bild hn_k5b_landung): **Rom angreifen** (Latium belagern, Mauern, Bürgerheer; Rückkehr unmöglich) oder **heimkehren** (Heer wird nach Africa versetzt, 2 Runden, Italien geht verloren).
- **Sonderschlacht Zama:** Römer öffnen Gassen – Elefanten-Panik-Regel (Baustein 2): Chance 40 % je Elefanten-Einheit, in die eigenen Reihen zu laufen; Gegenmittel „Elefanten zurückhalten“ (Plan). Masinissa auf römischer Seite: römische Reiterei +.
- **Ende A „Karthago triumphiert“** (Rom fällt oder Zama gewonnen) – Kino 5A. **Ende B „Zama“** (Zama verloren, abberufen oder Zeit abgelaufen) – Kino 5B. Beide Enden bestehen als Text (`win`/`lose`), Kino neu.

---

## Kriegselefanten mit Charakter (Baustein 2) – Regeln für die berechnete Schlacht (sofort) und die Echtzeitschlacht (später)
- Schrecken: gegnerische Moral −10 % zu Beginn, Reiterei des Gegners −15 % Angriff gegen Elefanten (Pferde scheuen), außer bei Völkern mit eigenen Elefanten.
- Panik: Wird eine Elefanten-Einheit unter 50 % Stärke gedrückt oder trifft auf Plänkler/Trompeten (Plan „Gassen öffnen“ des Gegners), 30 % Chance: Schaden auch beim eigenen Heer.
- Kälte: Winter + Gebirge/Norditalien −1 Tier je Runde mit 20 %.
- Nachschub selten: Elefanten nur über den Rat (Verstärkung) oder in Africa rekrutierbar.
Wiederverwendung: Indien, Persien, Khmer, Mogul (Panik-Regel allgemein, Kälte nur Geschichte).

## Abhängigkeiten
| Baustein | braucht | Status |
|---|---|---|
| Pass-Abschnitt | Ereignisfenster (vorhanden), Heer-Leisten (neu), Bilder Job 40 | baubar jetzt |
| Kelten-Treue, Rat-Gunst | Leisten im Szenario-Kopf (wie Senat bei Caesar `rules.senat`) | baubar jetzt, Muster vorhanden |
| Fabius-Skript | Szenario-Hooks je Runde; KI-Bewegung nur für diese Heere | baubar jetzt, vorsichtig (KI-Regel) |
| Winterlager | Wikinger-Umbau Phase B | gemeinsam bauen |
| Seeweg-Sperre | Anlande-Rückfrage aus v216 (Grund anzeigen) | nach v216 |
| Sonderschlachten berechnet | `PLANS`, `planMul` (vorhanden) | baubar jetzt |
| Sonderschlachten Echtzeit | Schlachtsystem S1–S6, S8, S9 (Elefant) | später |
| Kino | Bilder Job 40, Sprecher Job 43 | PC heute Abend |
| Porträts Nebenfiguren | Job 40 (hn_p_*) | PC heute Abend |

## Messziele (Playwright, Spielertest wie in `lehren_kampagnen.md`)
- Sagunt fällt nicht vor Runde 3.
- Ankunft Poebene Runde 9–12 mit 40–60 % Männern.
- Cannae möglich ab Runde ~20, nicht vorher (Riesenheer erscheint erst mit Schritt 7).
- Bilanz in Italien ohne Abfall leicht negativ (Druck), mit 3 abgefallenen Städten ausgeglichen.
- Kein Provinz-Pingpong > 2 Besitzerwechsel in 30 Runden (außer bewusst abgefallene Städte unter Fabius-Druck).

## Entscheidungen für Moritz
1. Kampagne jetzt bauen, Echtzeit-Sonderschlachten nachrüsten?
2. Cannae-Ziel „Riesenheer schlagen“ statt „Provinz halten“?
3. Rat von Karthago kann Hannibal abberufen (frühes Ende B) – zu hart?
4. Hasdrubal-Kopf-Ereignis zeigen (historisch, aber drastisch) – nur als Text, ohne Bild?

## Entscheidung Moritz 29.10. 12:31
Kampagne jetzt bauen, Echtzeit-Sonderschlachten später: **ja**. Elefant im Schlachtsystem vorziehen: **ja**. Fragen 2–4 oben nicht einzeln beantwortet → Vorschläge gelten (Cannae = Riesenheer schlagen, Abberufung möglich, Hasdrubal-Kopf nur Text), änderbar.
Reihenfolge: nach Wikinger W5/W6. Pakete: **H1** Akt I + Seeweg-Sperre + Elefanten-Regeln, **H2** Pass-Abschnitt + Kelten-Treue, **H3** Cannae/Fabius/Rat/Winterlager, **H4** Akt IV + Kino + Enden.
