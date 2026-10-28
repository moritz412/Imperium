# Konzept Spätspiel: Größe wird zu Spielinhalt statt zum Abarbeiten
Imperium der Epochen 2 · Stand 27.10.2026 · Nur Konzept, im Code nichts geändert · Zeilenangaben beziehen sich auf /home/claude/imperium.html (18 718 Zeilen)

## 1. Befund und Ursachen

Lage von Moritz: Endlosspiel mit Rom, Epoche 1, Jahr 706, also etwa Runde 34 der Epoche. Er hat 93 Provinzen, das sind rund 2,7 neue Provinzen pro Runde. Die Epoche endet spätestens um Jahr 882 (Jahresgrenze, `yearCapHit`), also in etwa 20 weiteren Runden.

**Ursachen im Code (gelesen, nicht vermutet):**
1. **Alle Bremsen sind gedeckelt, deshalb kostet jede weitere Provinz am Rand fast nichts.**
   - Verwaltungsgrenze `adminCap` (Z. 3457): 14 + 2 je Statthalter + 3 × Rang + 2 Recht + 2 je Reform. Am Start gemessen waren es 19.
   - Ordnungsabzug über der Grenze: −0,3 je Provinz, höchstens −4 (Z. 2792).
   - Steuerverlust `adminLoss` (Z. 2902): 2 % je Provinz, höchstens 45 %. Dazu kommt die Verwaltungslast `admRate` (Z. 7484): 0,8 % je Provinz über 15, höchstens 20 %. Beide Deckel sind ab etwa 40 Provinzen erreicht. Ab dann bringt jede weitere Provinz netto Gewinn.
   - Entfernung höchstens −4, „Überdehnung“ höchstens −4 (Z. 2788, 2799).
2. **Eroberte Provinzen beruhigen sich schnell.** Nach der Eroberung gilt Unruhe 3 (`captureBySiege`, Z. 8055), die um 0,75 pro Runde sinkt und nach 4 Runden weg ist. „Fremde Kultur“ kostet −1,5 (Z. 8804). Dagegen stehen Truppen in der Stadt (bis +6), Garnison (+2), Fest (+3), Recht (+2) und Statthalter (bis etwa +2,5).
3. **Aufstände sind leicht zu verhindern.** Eine Provinz erhebt sich erst bei Ordnung ≤ −4, nur ohne eigenes Heer und nur nach 2 Runden mit Warnung (Z. 12608–12614). Ein Heer in der Provinz reicht als Schutz.
4. **Koalitionen greifen bei Moritz knapp nicht.** Bedrohung `threatOf` (Z. 11152) = Provinzen ÷ aktive Provinzen × 110. Laut Messung gibt es etwa 350 aktive Provinzen. 93 Provinzen ergeben also eine Bedrohung von 29, die Schwelle `COAL_ON` liegt bei 32. Erst die Eroberungen der letzten 30 Runden heben ihn darüber. Auch dann bremst die Koalition kaum:
   - höchstens 4 bis 5 Mitglieder, nur Nachbarn mit Beziehung unter 0
   - gemeinsamer Krieg erst bei 80 % der Macht des Ziels, sonst mit 10 % Zufall
   - Mitglieder lassen sich mit Gold herauslösen (`coalBuyCost` wächst nur linear)
   - Ende nach 40 Runden
5. **Die KI greift Stärkere nicht an.** `warMood` (Z. 11654) hängt vor allem am Machtverhältnis. „Dominant“ bringt nur +1, Krieg kommt erst ab 1,8. Gegen ein Reich mit 93 Provinzen erklärt fast niemand den Krieg.
6. **Auch der Erzfeind wird stumm.** Er erklärt nur dann Krieg, wenn er mindestens 60 % der Macht des Spielers hat (`nemesisRound`, Z. 15195). Ab einer bestimmten Größe des Spielers passiert das nie mehr.
7. **Die Epochenkrise läuft am Spieler vorbei.** Die Hunnen kommen nur einmal, an einem festen Ort (lon 42, lat 47,5). Sie nehmen nur Provinzen, die keinem menschlichen Spieler gehören (`spawnCrisis`, Z. 8130), und greifen nur an, wo sie mindestens 85 % der Verteidigung erreichen. Für ein großes Rom sind sie Hintergrundrauschen. Ab Runde Max − 5 fällt die Krise ganz aus.
8. **Innere Krisen sind selten oder schwach.**
   - Statthalter fallen nur ab bei Treue < 20 und Ehrgeiz > 60, ab Runde 30, mit Warnung und 30 % Chance. Ein Heer verhindert den Abfall (`govPerson`, Z. 17893).
   - Thronstreit (`dynRival`, Z. 7924) kostet höchstens 3 Provinzen.
   - Unabhängigkeit ferner Provinzen (`weltLate`) gibt es erst ab Epoche 3.
9. **Expansion wird belohnt.** Der Adel bekommt +1,5 je Eroberung (`polRound`, Z. 9384).

**Kurz:** Ab etwa 40 Provinzen ist jede Eroberung reiner Gewinn, und niemand schlägt zurück. Moritz fehlen dann keine Strafen, sondern Gegenspieler und Entscheidungen.

## 2. Leitidee

Ein großes Reich bekommt Innenleben und Gegenspieler: Mit der Größe wachsen Völker, Feldherren, Erben und Nachbarn, die eigene Wünsche haben. Sie bringen Entscheidungen mit Folgen und neue Ziele statt weiterer Provinzen zum Abhaken.

## 3. Gegner, Reibungen, Angstgegner (hohe Priorität, Ergänzung von Moritz)

### 3.1 Wie sich KI-Reiche entwickeln und warum sie schwach bleiben
- **Wachstum gegen freie Provinzen ist gedrosselt** (`aiFaction`, Z. 12503–12505). Die KI greift erst bei 1,6-facher Übermacht an. Sie stürmt keine freie Provinz mehr, wenn sie in den letzten 10 Runden schon 3 Provinzen gewonnen hat, und belagert keine mehr ab 2. Der Spieler hat keine solche Drossel.
- **Die Heeresgröße ist an die Provinzzahl gebunden:** im Frieden 4 + 1,5 × Provinzen, im Krieg 6 + 2,5 × Provinzen (Z. 12475), plus einen Goldzuschlag. Kleine Reiche bleiben deshalb dauerhaft klein.
- **Einkommen:** Die KI bekommt Nettoeinkommen × `dif().ai`, auf Normal ist das 1,0 (Z. 12571). Nur der Erzfeind im Krieg gegen den Spieler bekommt × 1,2. Einen Aufholbonus für erfolgreiche KI gibt es nicht.
- **Bauen und Forschen:** `aiEconomy` (Z. 3022) baut nach `buildScore` und wählt Forschung zufällig, gewichtet nach Kosten. Großes Gold fließt erst ab 2 500 × Epochenkosten in die Forschung (`aiSpend`, Z. 5557). Das passt, ist aber nicht zielgerichtet.
- **Krieg:** `warMood` wird vom Machtverhältnis bestimmt (siehe 1.5). Gründe für einen Krieg (`cbOf`, Z. 11095: Vergeltung, Rückeroberung, Landsleute, Heilige Stätte, belegte Ansprüche) zählen nur ±0,35.
- **Erzfeind** (`pickNemesis`, Z. 15153; `nemesisRound`, Z. 15190): Er ist gut gebaut, mit Spannungsbalken, benannten Feldherren aus `NEM_GEN`, Feldzügen (`startCampaign`) und Nachrichten. Er verstummt aber ab 60 % Machtabstand. Ein neuer Erzfeind kommt nur, wenn der alte fällt oder die Epoche wechselt.
- **Messung** (passiver Lauf, vorbereitete Welt Epoche 1, 30 Runden, Spieler tut nichts): siehe 3.5.

### 3.2 Nachvollziehbare Reibungen (statt zufälliger Kriegserklärungen)
- **Mechanik:** Jedes KI-Reich führt gegen jeden Nachbarn einen „Groll“-Wert (0–100). Er speist sich aus vorhandenen Quellen:
  - `cbOf` (Rückeroberung, Landsleute, Heilige Stätte, Vergeltung)
  - Grenzlänge (`sharesBorder`)
  - Glaubensgegensatz (`facRel`)
  - Handelsneid: der Nachbar hat viel mehr Handel (`tradeCount`)
  - Rache für eigene Verluste: `flipFrom`, `d.won`

  Der Groll steigt langsam und ist sichtbar.
- **Vorwarnung:** Ab Groll 60 meldet der Ratgeber (Diplomat) im Kanal „Jetzt wichtig“: „Die Sachsen fordern Engern zurück“. Die vorhandene Kriegswarnung `warThreat`/`S.wpend` (Z. 11657) bekommt einen Grund und eine Forderung.
- **Spielerentscheidungen:** nachgeben (Provinz, Gold, Glaubensduldung), verhandeln (Grenzvertrag, Heirat), abschrecken (Heer an die Grenze, Garantie) oder Präventivkrieg mit sauberem Kriegsgrund.
- **Wirkung auf die KI (maßvoll):** Mit Grund zählt der Groll in `warMood` stärker: + Groll/50, also höchstens +2. Ohne Grund sinkt die Kriegslust. Reiche mit Groll ≥ 60 bekommen Vorrang bei `coalCand`.
- **Andockpunkte:** `cbOf`, `warMood`, `warThreat`/`warPendRound`, `memOf`/`relAdd` (das Gedächtnis gibt es schon), `relParts`, `RAT_RULES` (Z. 18008), `todoItems` (Z. 17573).
- **UI:** In der Diplomatie bei jedem Reich die Zeile „Groll: Rückeroberung Engern, Glaube“. Dazu ein Eintrag in „Jetzt wichtig“ mit dem Porträt des Diplomaten.
- **Aufwand M, Risiko gering, Spaßwert hoch:** Kriege werden erklärbar.

### 3.3 Angstgegner: der Aufsteiger je Epoche
- **Mechanik:** Je Epoche werden 1 bis 2 Aufsteiger bestimmt. Gewählt werden KI-Reiche mit dem besten Wachstum der letzten 15 Runden oder historische Kandidaten. Für Rom in Epoche 1 sind das zum Beispiel Franken, Westgoten oder Araber, die Araber über den vorhandenen Spawn in `EPOCHS[1].spawns`.
- **Maßvolle Vorteile:**
  - Steuern +15 %
  - die Drossel gegen freie Provinzen gilt für ihn nicht (3 → 5)
  - Heeresgrenze +20 %
  - ein benannter Herrscher mit Persönlichkeit (vorhandene `RUL_TRAITS`) und ein benannter Feldherr (`NEM_GEN` erweitern)

  Die Vorteile enden, wenn er 2 große Schlachten gegen den Spieler verliert oder 60 % der Größe des Spielers erreicht. Das ist eine Gummiband-Bremse in beide Richtungen.
- **Erinnerung:** Er merkt sich, was der Spieler getan hat (vorhandene Erinnerungen in `d.mem`), droht sichtbar („Chlodwig: ‚Gallien gehört den Franken.‘“) und kündigt Feldzüge an (vorhandenes `N.camp` und `nemNewsHtml`).
- **Andockpunkt:** Der Erzfeind ist schon zu 80 % das, was gebraucht wird. Änderungen:
  - Die Kriegsschwelle hängt nicht mehr nur an der Macht: Krieg auch bei 0,35 Macht, wenn Groll ≥ 60 ist und der Spieler gerade woanders kämpft.
  - Der Erzfeind darf zusätzlich ein Aufsteiger sein.
  - Die Auswahl wird alle 20 Runden neu geprüft.
- **UI:** Das vorhandene Erzfeind-Wappen und `nemCardHtml` in Reich/Diplomatie. Dazu ein Herrscherporträt (vorhandenes `rulerPort`) und ein Zitat.
- **Assets:** je Epoche 2 bis 3 Herrscherporträts von Aufsteigern und kurze Drohsätze für Sprecher (PC-Pipeline, etwa 10 Bilder und 15 Sätze).
- **Aufwand M, Risiko mittel** (Balance). Gegenmittel: harte Obergrenzen und ein Messlauf. **Spaßwert sehr hoch.**

### 3.4 Vorsichtige Stellschrauben mit erwarteter Wirkung
| Stellschraube | Ort | Erwartung | Absichern durch |
|---|---|---|---|
| `warMood`: Kriegsgrund ±0,35 → ±0,6 | Z. 11654 | weniger grundlose, mehr begründete Kriege | Zählen der Kriege mit und ohne Grund (balm1.js) |
| Erzfeind-Kriegsschwelle 0,6 → 0,4, aber nur, wenn der Spieler gerade woanders kämpft | Z. 15195 | Erzfeind bleibt auch gegen große Spieler aktiv | Kriege des Erzfeinds pro 30 Runden, Ziel 1–2 |
| KI-Drossel gegen freie Provinzen 3 → 4 je 10 Runden (nur Reiche ≥ 6 Provinzen) | Z. 12504 | Top-KI wächst sichtbar mit | Provinzen der Top 3 nach 30 Runden, Ziel +20–30 % |
| `threatOf`: Größe als Anteil an den Provinzen der Region statt an allen aktiven | Z. 11152 | Koalition reagiert regional früher | Koalitionsbildung bei 60–90 Provinzen |
| Koalitionskrieg bei 80 % → 60 % der Macht des Ziels | Z. 11173 | Koalition kämpft tatsächlich | Anzahl der Koalitionskriege (`dstat`) |

### 3.5 Messlauf (einmalig, passiv)
**Aufbau:** vorbereitete Welt Epoche 1, Runde 44–74 (Jahr 418–688), Normal. Der Spieler war das erste Reich der Welt und hat nur Runden beendet. Skript: `shot/balm1.js`, Ausgabe `shot/spaet_mess.txt`. Die Reichsnamen sind interne Slot-Schlüssel.

| Runde/Jahr | Top 1 (Prov./Einheiten) | Top 2 | Top 3 | Median Einheiten | Reiche |
|---|---|---|---|---|---|
| 44 / 418 | seleukiden 15/33 | makedonien 16/33 | pergamon 13/32 | 14 | 37 |
| 59 / 553 | seleukiden 19/44 | massilia 15/26 | makedonien 14/42 | 21 | 35 |
| 74 / 688 | seleukiden 21/58 | jin_s 18/46 | aksum 17/36 | 25 | 32 |

**Ergebnisse:**
- Das stärkste KI-Reich wächst in 30 Runden von 16 auf 21–23 Provinzen, also etwa **0,2 Provinzen pro Runde**. Moritz schafft etwa 2,7, mehr als zehnmal so viel.
- Der Gini der Provinzverteilung bleibt flach (0,30–0,34). Die Welt verdichtet sich nicht zu Großmächten.
- In 30 Runden gab es 71 Kriegserklärungen und 169 Friedensschlüsse. Es wird viel gekämpft, aber ohne dass Gebiet dauerhaft den Besitzer wechselt.
- Der passive Spieler verlor 16 → 8 Provinzen. Die KI greift also Schwache durchaus an. Sie wächst nur nicht über etwa 20 Provinzen hinaus.

**Folgerung:** Gegen 93 Provinzen gibt es in Epoche 1 schlicht kein ebenbürtiges Reich. Ohne Aufsteiger (3.3) und Koalition (Säule 1) entsteht keine Gegenmacht.

**Zur Absicherung der Stellschrauben:** denselben Lauf wiederholen und Ziele prüfen:
- Top-KI nach 30 Runden mindestens 28 Provinzen
- Gini 0,35–0,40
- weiterhin mindestens 30 Reiche am Leben

## 4. Säulen 1–4

### Säule 1: Bedrohung und Koalitionen gegen den Übermächtigen
- **Kernmechanik:** Die vorhandene Koalition (`S.coal`, `coalitionRound` Z. 11162) bekommt zwei Stufen:
  - „Misstrauen“ ab Bedrohung 24: Handelsbremse, keine neuen Bündnisse mit dem Übermächtigen
  - „Koalition“ ab 32
  - Die Bedrohung bekommt einen zusätzlichen Teil „Anteil an der Region/Theater“.
- **Entscheidungen:**
  - Reichsfrieden ausrufen: 10 Runden keine Eroberung, dafür sinkt die Bedrohung schnell.
  - Mitglieder herauskaufen
  - einen Kongress einberufen (`congressAI` gibt es schon)
  - Präventivschlag gegen das schwächste Mitglied
- **KI:** Koalitionskrieg ab 60 % der Macht des Ziels, Mitglieder bis 6.
- **UI:** Diplomatie mit `openCoalition` (vorhanden) und „Jetzt wichtig“. **Assets:** 1 Bild „Gesandte verbünden sich“.
- **Aufwand S–M, Risiko gering, Spaßwert mittel.**

### Säule 2: Innere Krisen
- **Kernmechanik:**
  - (a) **Thronstreit** (`dynRival`/`dynRevolt` vorhanden): Der Anteil der abfallenden Provinzen wächst mit der Größe des Reichs, statt höchstens 3 sind es bis zu 8 bei großen Reichen. Der Gegenkönig wird zu einem eigenen KI-Reich statt zu „frei“.
  - (b) **Bürgerkrieg der Statthalter:** Fällt ein Statthalter ab, nimmt er seine Region als neues Reich mit, nicht als freie Provinzen. Dazu gibt es die Wahl: zurückholen, anerkennen als Vasall oder bestechen.
  - (c) **Umbruchsprüfung beim Epochenwechsel** in `doEpoch`: Jede Region ohne Statthalter und mit Ordnung < 2 würfelt. Nach einem Vorlauf von 5 Runden („Die Zeitenwende naht“) kann die Region abfallen.
- **Entscheidungen:** Erbe stärken, Kronrat vorher besänftigen; Regionen gezielt vorbereiten; Abfall bewusst zulassen und als Vasall binden.
- **Andockpunkte:** `dynRival`, `dynRevolt`, `govPerson`, `weltLoose`, `makeVassal` (Z. 11582), `checkEpoch`/`doEpoch` (Z. 4859, 4894), `epochTodo` in `todoItems`.
- **KI:** gilt maßvoll auch für große KI-Reiche (mit Chance halbiert). So zerfallen auch KI-Großreiche manchmal, und die Welt bleibt beweglich.
- **UI:** Hof, Reich-Tab Statthalter, „Jetzt wichtig“.
- **Assets:** 3 Bilder (Gegenkönig, Statthalter mit Krone, Zeitenwende), Sprecher Kanzler.
- **Aufwand M, Risiko mittel, Spaßwert hoch.**

### Säule 3: Invasionswellen passend zur Epoche
- **Kernmechanik:** `CRISES` (Z. 8116) wird erweitert:
  - Die Wellen richten sich nach dem Größten. Der Startpunkt ist der Rand seines Reichs, an dem das passende historische Theater liegt (Hunnen und Awaren Donau/Osten, Araber Süd/Levante, Wikinger Küste, Mongolen Osten). `C.dom` gibt es schon für die Revolution.
  - Zweite Welle je Epoche nur, wenn ein Reich ≥ 25 % der aktiven Provinzen hält.
  - Menschliche Provinzen sind nicht mehr ausgeschlossen, mit Vorwarnung von 3 Runden („Späher melden …“).
- **Entscheidungen:** Tribut zahlen (`attila`-Ereignis, Z. 10630, gibt es schon), Grenzmarken befestigen, Föderaten einsetzen (E), Bündnis mit Nachbarn gegen die Horde.
- **KI:** `aiHorde` bleibt. Die Horde wird stärker: Größe + 10 % je 10 Provinzen des Ziels, gedeckelt.
- **UI:** Krisenmeldung `S.crisisNews`, Mission `mkMission('horde')`.
- **Assets:** Bilder Awaren, Araber, Magyaren (Hunnen, Wikinger und Mongolen gibt es schon).
- **Aufwand S–M, Risiko mittel, Spaßwert hoch.**

### Säule 4: Ambitionen je Epoche und Epochenwertung
- **Kernmechanik:** Bei Epochenbeginn wählt der Spieler 1 aus 3 Ambitionen:
  - Eroberer: 2 Regionen vereinen
  - Baumeister: 3 Wunder oder 10 Stadtaufstiege
  - Bewahrer: keine Provinz verlieren, Ordnung im Schnitt ≥ 4
  - Bekehrer, Händler

  Am Epochenende folgt die Wertung in 4 Achsen (Ruhm, Wohlstand, Kultur, Stabilität) mit Bronze, Silber oder Gold. Die Belohnung trägt in die nächste Epoche.
- **Andockpunkte:**
  - Missionen `mkMission`/`missionRound` (Z. 8160, 8178)
  - Epochenbuch `chronBook` (Z. 8580) hat schon Siege, Eroberungen, Kultur und Bevölkerung
  - `SC_RANKS` Bronze/Silber/Gold (Z. 5476)
  - Epochenintro `EP_INTRO` (Z. 6986)
  - `victoryHtml` (Z. 9951)
- **Entscheidungen:** Die Ambition lenkt das Spiel. Wer „Bewahrer“ wählt, hat einen Grund, nicht zu expandieren.
- **UI:** Epochenwechsel-Dialog, Reich → Übersicht, Chronik.
- **Assets:** 5 Ambitionssymbole, 1 Bild „Wertung“.
- **Aufwand M, Risiko gering, Spaßwert hoch** (gibt Richtung).

## 5. Frische Ideen A–G

### A: Ruhmreiche Feldherren werden Rivalen
- **Kernmechanik:** Feldherren haben schon Ruhm `fameOf` und Ehrentitel `FAME_T` 15/32/55 (Z. 7434). Neu dazu kommen Ehrgeiz und Treue, wie bei den Statthaltern (`govMigrate`). Ab Ehrentitel 2 und einem großen Heer fern der Hauptstadt steigt die Gefahr.
- **Entscheidungen:**
  - Ehren: Triumph mit Gold und Ordnung, Treue +
  - Kaltstellen: in die Hauptstadt holen, verliert Heer-Boni
  - Wegschicken: ferne Front oder Statthalter einer Region
  - Gewähren lassen: Gefahr eines Putsches, dann wird er Thronanwärter (`dynRevolt` wiederverwenden) und nimmt sein Heer mit
- **Andockpunkte:** `genOf`, `fameRefresh` (Z. 7442), `genHtml`, `govPerson` (Logik kopieren), `dynRevolt`.
- **KI:** nicht nötig, KI-Feldherren bleiben treu (geringes Risiko).
- **UI:** Heereskarte `genHtml`, „Jetzt wichtig“, Sprecher Marschall.
- **Assets:** 2 Bilder (Triumphzug, Putsch).
- **Aufwand M, Risiko gering, Spaßwert hoch** („Caesar-Moment“).

### B: Völkermosaik (Kernidee)
- **Kernmechanik:** Provinzen haben schon eine Kultur (`P.cul`, Angleichung `P.cp`, „Fremde Kultur“ −1,5, Z. 8804–8806). Neu: Jede fremde Kultur mit ≥ 6 Provinzen im Reich wird eine **Hoffraktion**, analog zu den Ständen `polOf` (Adel/Klerus/Bürger, Z. 9376). Sie hat Zufriedenheit 0–100 und einen wechselnden Wunsch, zum Beispiel:
  - eigenes Recht (Ordnung −0,5 im Reich, Steuern der Gruppe +)
  - Glaubensduldung
  - ein Amt am Hof
  - kein Krieg gegen Stammverwandte
  - eine eigene Hauptstadt
- **Folgen:**
  - Zufrieden (≥ 70): Spezialtruppen über vorhandene Varianten `VARIANTS`, kulturgebunden, und ein regionaler Bonus
  - Verärgert (≤ 25): paktiert mit Feinden, nutzt `cbOf` „Landsleute“ für Nachbarn gleicher Kultur, und der Bund der Unterworfenen (`bundRound`, Z. 4967) löst aus, ohne dass Grausamkeit nötig ist
- **Entscheidungen:** angleichen (langsam, kostet Zufriedenheit) oder Identität achten (Vielvölkerreich mit Boni). Das ist echte Strategie statt Abhaken.
- **Andockpunkte:** `polRound`/`POL_CONC`/`POL_EV`, `faithParts`, `CULT`, `bundRound`, `facCul`, `VARIANTS`, Hof-Tab „pol“ (`openHof('pol')`).
- **KI:** abgeschwächt auch für KI-Großreiche, nur der Abfall-Teil. Für die Diplomatie reicht ein zusätzlicher Faktor in `warMood` („Landsleute befreien“).
- **UI:** Hof → Stände wird zu Hof → „Stände und Völker“. Dazu ein Völkerkreis im Reich.
- **Assets:** ein Gesandten-Porträt je Kulturgruppe (etwa 12 Kulturen × 1 Bild), Sprecher für Wünsche.
- **Aufwand L, Risiko mittel, Spaßwert sehr hoch.**

### C: Urteil der Geschichte
- **Kernmechanik:** Ein Herrscherruf aus den vorhandenen Statistiken (`stv`, `revScore`, `S.chron`). Eroberer = conq/win, Baumeister = Bauten und Wunder, Bewahrer = Frieden `R.peace`, Tyrann = `cruel`, Bekehrer = Bekehrungen. Je Epoche ein Kapitel im Chronikbuch `chronBook` mit Bild und Sprechertext.
- **Folgen:** Der Ruf öffnet Optionen. Ein Tyrann kann Furchtfrieden erzwingen, ein Bewahrer bekommt Kongress-Bonus, ein Baumeister günstigere Wunder. Im Endlosspiel gibt es ein persönliches Finale (Epilogtext nach Ruf).
- **Andockpunkte:** `chronBook`, `revScore` (Titel gibt es schon), `achRound`, Bücher `S.books`.
- **Assets:** 5 Rufbilder, 5 Epilog-Sprechtexte.
- **Aufwand M, Risiko gering, Spaßwert mittel bis hoch** (Rahmen).

### D: Reichsteilung im Erbfall
- **Kernmechanik:** Hausgesetze gibt es schon (`LAWS` Z. 9994: prim/sal/sen/best/wahl; Wechsel Z. 10455). Neues Gesetz „Teilung unter den Söhnen“, für Franken in Epoche 1 und 2 Standard. Beim Thronwechsel wird das Reich ab etwa 30 Provinzen unter den Söhnen geteilt. Die Teile werden verwandte KI-Reiche mit Personalunion-ähnlicher Bindung (`puStart`, Z. 10285 als Vorlage).
- **Entscheidungen:**
  - Hausgesetz ändern: kostet Adel und Ordnung, braucht Zeit
  - Söhne vorher versorgen (Statthalter, Heirat)
  - bewusst teilen: Teilreiche als treue Verbündete, die man später erben kann
- **Andockpunkte:** `dynHeir`, `dynRound3` (Z. 10122), `puStart`/`puEnd`, `lawFor` (Z. 9999).
- **KI:** gilt auch für KI-Franken. Das ist historisch richtig und bremst KI-Monster.
- **Assets:** 1 Bild (Vertrag von Verdun), Sprecher.
- **Aufwand L, Risiko hoch** (Spielstand-Logik, Fraktionsslots). **Spaßwert hoch.**

### E: Grenzmarken und Föderaten
- **Kernmechanik:** Wanderzüge gibt es schon (`migRound`/`migAccept`, Z. 5334–5345, nur Epoche 1). Neu:
  - Föderaten bilden eine **Grenzmark**: Die Provinz zahlt keine Steuern, stellt dauerhaft ein Heer ohne Sold (wie `levy`) und zählt nicht zur Verwaltungsgrenze.
  - Die Treue der Föderaten ist an Zahlungen und Erfolg gebunden. Wer ausbleibt, riskiert einen Föderatenaufstand (Westgoten 378).
  - In späteren Epochen: Mark, Militärgrenze, Kosaken.
- **Andockpunkte:** `migAccept`, `levyRound`, Lehen `fiefOn`/`satrapOf` (Z. 11442), `adminCap` (Mark nicht zählen).
- **Entscheidungen:** Grenze billig sichern gegen das Risiko einer fremden Macht im eigenen Reich. Das passt zu B und Säule 3.
- **Aufwand S–M, Risiko gering, Spaßwert mittel bis hoch.**

### F: Zeitenwenden für alle
- **Kernmechanik:** Seuchen und Weltereignisse gibt es schon (`weltRound` Z. 9456, `epiStart`, `WELT_EPI`, Hungersnot). Neu sind feste historische Wenden mit Vorwarnung von 5 Runden, damit Vorsorge sich lohnt:
  - Justinianische Pest (541)
  - Kleine Eiszeit
  - Schwarzer Tod (1347)
  - Buchdruck (positiv)
- **Wirkung:** Sie skaliert mit der Größe, über die Zahl der Häfen und Märkte, nicht als pauschale Strafe. Hospitäler, Kornspeicher und Quarantäne helfen (gibt es alles schon).
- **Andockpunkte:** `weltEpi`, `epiStart`, `weltFam`, `chronAdd('plague')`.
- **Assets:** 4 Bilder, Sprecher Gelehrter.
- **Aufwand S, Risiko gering, Spaßwert mittel.**

### G: Mächte ohne Land
- **Kernmechanik:** Papsttum (`kirOn`, `kirRound` Z. 11397, Kirchenbann, Zehnt) und Glaubensoberhäupter (`HEADS`, `headRound` Z. 8877) gibt es schon. Neu:
  - Diese Mächte bekommen eine Gegenmacht-Logik: Ab Bedrohung ≥ 28 droht Bann, wenn der Spieler gleichen Glaubens weiter erobert. Bei anderem Glauben gibt es Kreuzzug oder Dschihad (`crusadeStart` Z. 11407, bisher nur Epoche 2–3).
  - Später kommen Hanse und Venedig als Handelsmächte hinzu: Embargo gegen den Übermächtigen (`setEmbargo` gibt es schon).
- **Entscheidungen:** Gunst kaufen (Zehnt, Stiftungen), offen brechen (eigene Kirche) oder Investitur-Streit als Ereigniskette.
- **Aufwand M, Risiko mittel, Spaßwert mittel bis hoch.**

## 6. Wie die Ideen ineinandergreifen

- **Innenleben großer Reiche (B + E + D + A + Säule 2):** Völker wollen etwas (B), Grenzvölker sichern gegen Treue (E), Erben teilen (D), Feldherren greifen nach der Krone (A). Die Statthalter- und Thronkrisen (2) sind der Ort, an dem das alles ausbricht.
- **Äußere Kräfte (Säule 3 + F + G + Säule 1 + Abschnitt 3):** Horden, Zeitenwenden, Kirche und Handelsmächte sowie Koalitionen und Angstgegner reagieren auf Größe. Jede Kraft bekommt einen sichtbaren Grund und eine Vorwarnung.
- **Rahmen und Ziel (C + Säule 4):** Ambition und Ruf machen aus „noch mehr Provinzen“ eine bewusste Wahl. Ein Bewahrer wird für Stabilität belohnt, ein Eroberer bekommt mehr Gegner und mehr Ruhm.

**Verknüpfungen:**
- Ein verärgertes Volk (B) liefert dem Angstgegner einen Kriegsgrund (3.2).
- Föderaten (E) halten die Invasion (3) auf.
- Der Ruf „Tyrann“ (C) erhöht die Bedrohung (1).

## 7. Empfohlene Reihenfolge

### Paket 1 „Gegner, die zurückschlagen“ (zuerst, Aufwand S–M)
- Stellschrauben aus 3.4 und 8
- Reibungen mit Groll und Vorwarnung (3.2)
- Aufsteiger und lebendiger Erzfeind (3.3)
- Säule 1 (Misstrauen, regionale Bedrohung)
- Säule 3 (Invasion zielt auf den Größten)

Begründung: Das trifft Moritz' Kernproblem direkt, hängt fast vollständig an vorhandenem Code (Erzfeind, Koalition, `CRISES`, `cbOf`) und ist gut messbar.

### Paket 2 „Innenleben“ (Aufwand M–L)
- Säule 2 (Thronstreit skaliert, Statthalter-Bürgerkrieg, Umbruchsprüfung)
- A (Feldherren)
- E (Föderaten, Grenzmark)
- B (Völkermosaik) als Herzstück, zunächst nur für die Völkerwanderung

Begründung: macht Größe zu Entscheidungen. B ist das größte Stück, deshalb steht es zuletzt im Paket. E und A bereiten B vor.

### Paket 3 „Rahmen und Geschichte“ (Aufwand M, später L)
- Säule 4 (Ambitionen, Wertung)
- C (Urteil der Geschichte)
- F (Zeitenwenden)
- G (Kirche und Hanse)
- D (Reichsteilung) zum Schluss, weil das Risiko am höchsten ist

Begründung: Das gibt dem Endlosspiel eine Richtung und braucht die meisten Bilder und Sprecher. Die PC-Pipeline kann parallel zu Paket 2 laufen.

## 8. Sofort-Stellschrauben gegen zu schnelle Expansion (klein, messbar)

| # | Änderung | Ort | Erwartung | Messung |
|---|---|---|---|---|
| 1 | Deckel „Über der Verwaltungsgrenze“ in Epoche 1: −4 → −6 | Z. 2792 | Große Reiche brauchen Statthalter oder Feste | Ordnung im Schnitt bei 60+ Provinzen |
| 2 | `ADM_MAX` 20 % → 30 % ab 60 Provinzen (sanft steigend) | Z. 7483 | Randprovinzen sind wirtschaftlich fast neutral | Nettoeinkommen je zusätzlicher Provinz |
| 3 | Unruhe nach Eroberung 3 → 4 bei fremder Kultur | Z. 8055 | Eroberung ist 1 bis 2 Runden länger heikel | Runden bis Ordnung ≥ 0 |
| 4 | Aufstand auch mit Heer möglich, wenn Ordnung ≤ −6 | Z. 12608 | Heer ist kein Freifahrtschein mehr | Zahl der Aufstände pro 30 Runden |
| 5 | `COAL_ON` 32 → 28 und regionale Bedrohung | Z. 11149 | Koalition bei 70–90 Provinzen sicher | Bildungszeitpunkt |

Wichtig: Diese Schrauben machen Größe teurer. Sie gehören deshalb **zusammen mit Paket 1** ins Spiel, damit der Effekt nicht nur Strafe ist.

## 9. Offene Fragen an Moritz

1. Wie stark darf es werden: Soll ein Angstgegner dich ernsthaft Provinzen kosten können (etwa 5 bis 10 % deines Reichs je Epoche), oder soll er vor allem Druck machen?
2. Sollen die Invasionswellen deine Provinzen direkt treffen dürfen (mit Vorwarnung) oder nur deine Nachbarn?
3. Völkermosaik (B): lieber Vielvölkerreich mit Boni als Weg *neben* der Angleichung, oder Angleichung als Normalfall und Völker als Ausnahme?
4. Reichsteilung (D): verbindlich für Franken und Germanen (historisch) oder immer abwählbar per Hausgesetz?
5. Sollen die neuen Gegenkräfte auch für Leicht gelten, oder nur ab Normal (wie der Statthalter-Abfall)?
