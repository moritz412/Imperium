# Glaubens- und Diplomatie-Paket – Bestandsaufnahme und Konzept

Stand: v128 (`/home/claude/imperium.html`), nur gelesen, nichts geändert. Die Zeilennummern sind ungefähr.

---

## 1. Ist-Stand

### 1.1 Glaube

**Religionen** (`RELIG`, Z. 7413): 17 Glaubensrichtungen.

| Gruppe | Religionen |
|---|---|
| Antike | pantheon, baal, aegypt, druiden, germ |
| Steppe | tengri |
| Persien | zoro |
| Ohne eigene Religion | natur |
| Indien | hindu |
| Christlich | christ (ab Epoche 3 „Katholische Kirche“), ortho, evang, tewahedo |
| Islam | islam |
| Asien | buddh, konfuz, shinto |

- **Startglaube:** Er hängt an der Kultur (`CUL_REL0`). Asien hat eigene Provinz-Abläufe (`OAS_REL`/`OAS_RC`, Zeichenkette je Epoche).
- **Amerika:** Alle Völker haben Kultur `indigen` und damit `natur`. Einen eigenen Glauben (Sonnenkult, Inti, Huitzilopochtli) gibt es nicht.

**Wellen je Epoche** (`REL_TIDE`, `relFor`, `religionTide`): Beim Epochenwechsel springen Provinzen per Zufall um. Das betrifft Christianisierung, Islam, Orthodoxie und die Reformation. In der Steppe wird der Islam zu 40 % angenommen, in Indien zu 15 %.

**Staatsglaube** (`facRel`, `setStateRel`, `canAdoptRel`/`adoptRel`, `relShares`):
- Gespeichert ist er in `F.rel`.
- Wechseln kann man ihn nur bewusst, und zwar ab 40 % Anteil im Reich. Der Wechsel kostet Ordnung −2 für 10 Runden, danach gilt eine Sperre von 25 Runden.
- Die KI wechselt bei 60 % Mehrheit selbst (`relRound`, Z. 7472).
- Beim Epochenwechsel kann außerdem eine „Glaubenswelle“ die Hauptstadt umstellen (Z. 4555).

**Toleranz** (`TOL`, `tolOf`, Z. 7455): drei Stufen.

| Stufe | Bekehrung | Ordnung durch fremden Glauben | Weitere Folgen |
|---|---|---|---|
| Verfolgung | ×1,6 | −2,5 | Klerus zufrieden, Bürger unzufrieden, Gunst der Kirche steigt |
| Duldung | ×1 | −2 | – |
| Toleranz | ×0,5 | −0,8 | Steuern +5 % |

- Ein Tempel mildert die Ordnungsstrafe (`faithParts`).
- Die KI setzt ihre Toleranz alle 10 Runden nach dem Anteil fremden Glaubens.

**Bekehrung und Angleichung** (`faithRound`, Z. 7487):
- `P.rp` steigt um Grundwert 0,6, dazu Tempel ×1,6, Weisheitshaus 0,8, Felskirche 1,2 und Lehmmoschee 0,8. Im Islam bringt der Tempel +0,4 extra. Das Ganze wird mit dem Toleranzfaktor multipliziert. Bei 100 % wechselt die Provinz.
- Die Kultur gleicht sich parallel über `P.cp` an.

**Tempelwirkung je Glaube** (`templeRelFx`, Z. 7459):

| Glaube | Wirkung des Tempels |
|---|---|
| Islam | Steuern („Moschee und Basar“) |
| Hindu | Steuern und Ordnung |
| Zoroastrismus | Ordnung |
| Christliche Kirchen | Forschung („Kirchenschule“) |
| Alle übrigen | nur bei gleicher Kultur Ordnung („Ahnen“) |

Buddhismus, Konfuzianismus und Shintō haben also keine eigene Wirkung.

**Weitere Wege zur Bekehrung:**
- **Agent** (`AG_ACTS.bekehr`, Priester): Bekehrung +50 %. Daneben gibt es „Kulturarbeit“.
- **Eroberungsereignis** (`relConq`/`relEvents`, „Mission oder Zwang“): Optionen sind Taufe erzwingen (Unruhe +4), Mönche schicken (`P.miss`, nach 8 Runden wechselt die Provinz, `missRound`) oder dulden. Das Ereignis kommt nur für Menschen und nur in den Epochen 1–2.

**Heilige Stätten:**
- `HOLY` (Z. 3150) umfasst 4 Provinzen: latium, judaea, hedschas, byzantion.
  - Wirkung: Ordnung bis +2 (`holyCount`, Z. 2504), Klerus +0,4 je Stätte (Z. 7933) und ein Kriegsgrund „Heilige Stätte“ in `cbOf`.
  - Freie heilige Städte erscheinen in `freeInfo` als „Heilige Stätte“.
- `HOLY_REL` (Z. 7463) umfasst 5 Provinzen, zusätzlich **aksum**.
  - Wirkung: Pilgergold (`pilgrimGold`).
  - Wenn eine Stätte an einen fremden Glauben fällt, sinkt die Beziehung aller Gläubigen zum Halter um −15 (`relRound`).

**Kirche** (nur katholisch, Epochen 2–3; `kirOn`, `pietyOf`, `kirParts`, `kirHtml`, Z. 9309–9420):
- Gunst der Kirche (`piety`) mit Zehnt, Bann (`excommunicate`), Bußgang, Kreuzzug (`crusadeStart`/`crusadeRound`/`crJoin`) und Ritterorden (`ordenOn`).
- Wer Rom hält, ist „Heiliger Stuhl“ (`papal`).
- Der Bann bringt −20 Beziehung zu allen Katholiken und einen Kriegsgrund „Kirchenbann“. Der Kreuzzug ist ebenfalls ein Kriegsgrund.

**Ereignisse:**
- `reformation` als Epochenkrise in Epoche 3 macht den Staat protestantisch.
- `x_schisma` mit Beziehungen ±10.
- `x_konzil` und `x_mission` (Bilder `re_*`).
- Geschichten: Nürnberg/Luther.

**Ostasien:** Das Mandat des Himmels (`mandOn`, `mandOf`) wirkt auf Steuern. Tribut und Shogunat laufen über das Asien-Modul. Es ist religionsnah, aber vom Glaubenssystem getrennt.

**Rat und Hof:**
- Ein Ratsvorschlag „Tempel bei Unruhe“ (`vo:'glaube'`, Z. 15345) betrachtet nur die Ordnung, nicht den Glauben.
- Der Stand „klerus“ (Z. 7933) reagiert auf Bann, Zehnt, heilige Stätten, fremden Glauben und Krieg ohne Grund.

**Anzeigen:**
- Provinz (`faithHtml`): Kultur- und Glaubenspunkt, „Bekehrung X %“ und „Angleichung X %“, letzteres nur für den Spieler.
- Hof-Reiter „kir“ (`relHtml` + `kirHtml`): Staatsglaube, Anteilsbalken, Annehmen-Knöpfe, Toleranz, Kirche.
- Kartenansicht **Religion** existiert schon (`MAPMODE 'rel'`, Ebenen-Knopf). Sie zeigt nur Flächenfarben, ohne Fortschritt, Legende oder heilige Stätten.

### 1.2 Diplomatie

**Datenmodell** (`dip(a,b)`):
- Status `st`: Krieg, Frieden oder Bündnis.
- Dazu: `rel` mit Gedächtnis (`memOf`), `trade`, `nap` (Nichtangriffspakt), `truce`, `vas`, `trib`, `emb` (Gesandter), `wed` (Heirat), `warT`.

**Beziehung** (`relParts`/`relation`, Z. 9038): Summe aus Erinnerungen und Regeln:

| Faktor | Wert |
|---|---|
| Krieg | −25 |
| Bündnis | +20 |
| Handel | +10 |
| Gemeinsame Grenze | −5 |
| Gemeinsamer Feind | +12 |
| Fürchtet Macht | −15 |
| Volksbonus | variabel |
| Lehnstreue | +10 |
| Koalition | ±15/−20 |
| Schutzmacht | +10 |
| Nichtangriffspakt | +10 |
| Gesandter | +4 |
| **Glaube** (nur bei Kontakt): gleich | +14 |
| **Glaube**: christlich verwandt | −2 |
| **Glaube**: sonst fremd | −8 |
| Erzfeind | −45 |
| Diplomat | variabel |

**Stufenleiter** (`relLadder`): Krieg › Frieden › Nichtangriffspakt › Handel › Bündnis › Vasall. Die Aktionen laufen über `dipAction`, Bündnisse über `makeAlliance`, Frieden über `makePeace`, Vasallen über `makeVassal`/`integrateVassal`/`vassalTribute`/`aiVassals`.

**Heirat** (`canMarry`/`marry`/`marryTargets`): Beziehung `WED_REL`. Ein Erbanspruch entsteht, wenn ein Haus erlischt (`F.claims`).

**Kriegsgründe** (`cbOf`, Z. 9061): Vergeltung/Vertragsbruch, Rückeroberung, Landsleute, **Heilige Stätte**, begründete Ansprüche (Agent), Erzfeind, Bündnispflicht, Erbanspruch, abgelehnte Forderung, **Kirchenbann**, **Kreuzzug**. Ohne Grund greift `noCbPenalty`.

**Weitere Systeme:**
- Kontakt: `inContact`, `nwContact` (Neue Welt), `amContact`.
- Handel: `tradeSlots`, `tradeEval`, `tradeTerms`, `setTrade`, `tradeIncome`. Dazu Lieferverträge und Kredite aus dem Hof.
- Koalition gegen Übermacht (`S.coal`, `dipCoalHtml`, `dipEvents`).
- KI-Diplomatie (`aiDiplomacy`, Z. 9581): Frieden, wenn sie verliert oder satt ist. Krieg anhand eines Werts aus Kriegsgrund, Macht, Beziehung und Übermacht. Bündnisse bei Beziehung ≥15 (`aiEval`). Forderungen über `aiDemand`.
- Darstellung: Fenster `openDiplomacy` mit Karte (`dipMapHtml`/`drawDipMap`, zentriert) und Vertragsliste (`treatiesHtml`). Die Liste ist seit v115 nach Kontinent gruppiert.

### 1.3 Wo Religion schon in die Diplomatie greift
- Beziehung: gleicher Glaube +14, fremder −8.
- Heilige Stätte: −15 Beziehung bei fremder Hand, dazu ein Kriegsgrund.
- Schisma: ±10.
- Katholische Kirche: Bann (−20, Kriegsgrund), Kreuzzug (Kriegsgrund und Beitritt der KI), Strafe in der Gunst bei „Angriff auf Glaubensbrüder“.
- Klerus-Stand: Krieg ohne Grund −1,2.

### 1.4 Probleme: verwaist, doppelt, unsichtbar, verwirrend

1. **Zwei Listen heiliger Stätten:**
   - `HOLY` enthält nur 4 Provinzen, `HOLY_REL` 5. Aksum bringt deshalb Pilgergold und Empörung, aber weder Ordnung noch Kriegsgrund noch die Anzeige in `freeInfo`.
   - Die Ordnung aus `HOLY` gilt unabhängig vom Glauben. Auch ein Heide bekommt Ordnung +1 für Jerusalem.
   - Asien, Indien und Amerika haben keine einzige heilige Stätte.
2. **Drei bis vier Bekehrungswege, nirgends zusammen erklärt:** Tempel, Priester-Agent, Mönche aus dem Eroberungsereignis (eigener Zeitgeber `P.miss`) und erzwungene Taufe. Die Provinz zeigt nur „Bekehrung X %“, aber nicht, wie schnell es geht und warum.
3. **Mönchs-Mission ohne Fortschrittsanzeige:** Nach 8 Runden springt die Provinz um. `P.miss` taucht in keiner Anzeige auf.
4. **Namensdopplung:** Intern heißen sowohl `P.miss` (Mönche) als auch `S.miss` (Aufträge) „miss“. Für den Spieler unsichtbar, aber eine Fehlerquelle.
5. **Asiatische Religionen und Naturreligion ohne eigenes Profil:** Buddh, Konfuz und Shintō haben keine Tempelwirkung. Die Beziehungsregel kennt nur „christlich verwandt“. Buddhismus, Konfuzianismus und Shintō gelten untereinander als „fremd −8“, obwohl sie historisch nebeneinander bestanden (Synkretismus). Das gilt genauso für die Götter der Antike.
6. **Amerika:** Alles ist `natur` mit `indigen`, Azteken und Inka haben also denselben Glauben (+14 untereinander). Die neuen Kulturtechniken nennen Sonnenkult und Blumenkriege, im Glaubenssystem gibt es sie nicht.
7. **Institution nur katholisch:** Orthodoxe (Patriarch), Islam (Kalifat) und Buddhismus haben keine Gegenstücke. Kreuzzug ja, keine Entsprechung auf der anderen Seite. Wirkt einseitig europäisch.
8. **Kartenansicht Religion schlecht auffindbar und stumm:** keine Legende, kein Bekehrungsfortschritt, keine heiligen Stätten, kein Hinweis aus dem Hof-Reiter.
9. **Toleranz wirkt viel, erklärt wenig:** Die Folgen für die Stände (Klerus/Bürger) und die Kirchengunst stehen nur als Satz da, ohne Zahlen. Die KI-Toleranz sieht man nicht. Dass ein Wechsel nichts kostet, lädt zum Hin- und Herschalten ein.
10. **Glaubenswellen beim Epochenwechsel kommen ohne Vorwarnung:** Provinzen wechseln per Zufall, und der Staatsglaube kann sich über die Hauptstadt mitdrehen (Z. 4555). Für den Spieler wirkt das willkürlich.
11. **Diplomatie zeigt Glauben nur als Zeile im Beziehungstooltip:** In Vertragsliste und Karte ist nicht zu sehen, welcher Glaube wo herrscht.
12. **„Mission oder Zwang“ nur in den Epochen 1–2:** Ab der Neuzeit gibt es kein Gegenstück, die Bekehrung läuft dann still.

---

## 2. Konzept: was zu einem runden System fehlt

Aufwand: S = bis ~½ Lauf, M = ~1 Lauf, L = mehrere Läufe.

| # | Idee | Nutzen | Aufwand | Risiken |
|---|---|---|---|---|
| A | **Glaubensübersicht je Provinz:** Statt „Bekehrung X %“ eine Zeile „Bekehrung 34 % · +6 je Runde · fertig in ~11 Runden“ mit Aufschlüsselung (Tempel, Priester, Toleranz, Mönche) | Endlich sichtbar, was Tempel bewirken. Moritz' Frage ist damit beantwortet | S | keine |
| B | **Kartenansicht Religion ausbauen:** Legende, schraffierte Provinzen im Wechsel, Symbole an heiligen Stätten, Knopf „Auf Karte zeigen“ im Hof-Reiter | Übersicht über Glaubensgrenzen | S–M | Leistung beim Neuzeichnen (gering) |
| C | **Heilige Stätten vereinheitlichen und weltweit ergänzen:** eine Tabelle mit Glaube(n), Wirkung und Kriegsgrund. Neu: Bodh Gaya (buddh), Varanasi (hindu), Lhasa (buddh), Ise (shinto), Qufu (konfuz), Lalibela/Aksum (tewahedo), Rom, Mekka, Jerusalem, Konstantinopel, Cusco (Inti), Tenochtitlan (Templo Mayor). Ordnung nur für Halter des passenden Glaubens | Behebt die Doppelliste, macht die Welt rund, gibt Asien und Amerika Ziele | M | Balance von Pilgergold und Ordnung. Ziele der Geschichten müssen unberührt bleiben |
| D | **Glaubensfamilien für die Beziehung:** gleicher Glaube +14. Gleiche Familie (christlich; asiatisch-synkretisch: buddh/konfuz/shinto; antike Polytheismen) ±0 bis +4. Fremd −8. **Rivalen** (z. B. christlich gegen Islam in Epoche 2–3, katholisch gegen evangelisch in Epoche 3) −14 | Historisch plausibler, Asien wird nicht künstlich zerstritten | S | Ändert das Bündnisverhalten der KI. Muss gemessen werden |
| E | **Heiliger Krieg als Kriegsgrund mit Bedingungen:** nur bei Rivalenglaube und einer heiligen Stätte bzw. eigenen Gläubigen beim Gegner. Kostet Gold oder Klerusgunst. Bringt Klerus +, Bündnispartner gleichen Glaubens erhalten eine Einladung. Für alle Religionen mit eigenem Namen: Kreuzzug, Dschihad, sonst „Glaubenskrieg“. Der bestehende päpstliche Kreuzzug bleibt als Sonderfall | Gegenstück zum Kreuzzug, weniger europäische Schlagseite | M | KI darf nicht in Dauerkriege verfallen (Abklingzeit, Grenze je Epoche) |
| F | **Glaubensbund:** neuer Vertrag „Glaubensbund“, nur bei gleichem Glauben. Leichte Bündnisvorstufe mit Beziehung +6. Wer angegriffen wird, kann um Hilfe bitten | Eine Stufe mehr auf der Leiter, gibt Religion diplomatischen Sinn | M | Überlappt mit Bündnis und Koalition, Übersicht. Wäre auch als Bündnisvariante möglich |
| G | **Geistliche Häupter für alle großen Kirchen:** Patriarch von Konstantinopel (orthodox), Kalif bzw. Kalifat (Islam, mit Titel für den Halter von Mekka, Bagdad oder Kairo), Abuna (Tewahedo), Dalai Lama ab Epoche 3. Einheitliche Mechanik: Gunst, wenige Aktionen (Segen, Bann/Fatwa, Aufruf) | Gleichbehandlung, nutzt das vorhandene System `kir*` | L | Großer Umbau, KI-Verhalten, Texte und Bilder. Besser als Phase 2 |
| H | **Mission und Orden vereinheitlichen:** Mönche aus dem Ereignis werden zu einem sichtbaren Bekehrungsschub (+X je Runde für N Runden) statt zu einem unsichtbaren Zeitgeber. Priester-Agent und Mönche erscheinen in derselben Aufschlüsselung (siehe A). Das Ereignis gilt für alle Epochen, mit an die Epoche angepassten Texten | Weniger Sonderwege, gleiche Wirkung, klar erklärt | S–M | Alte Spielstände mit `P.miss` übernehmen (einfach) |
| I | **Toleranz als Politik mit Folgen und Abklingzeit:** Wechsel nur alle 10 Runden, Folgen mit Zahlen anzeigen (Stände, Kirchengunst, Steuern). Zusätzlich die KI-Toleranz in der Diplomatie zeigen („verfolgt Andersgläubige“), mit Beziehungsabzug bei Gläubigen der verfolgten Religion | Entscheidung mit Gewicht, transparent | S | Balance der Ordnung |
| J | **Glaubenswellen ankündigen:** Beim Epochenwechsel ein Abschnitt „Glaube im neuen Zeitalter“ mit betroffenen Provinzen und gegebenenfalls Wechsel des Staatsglaubens. Als Wahl: Welle annehmen oder bisherigen Glauben halten (mit Folgen) | Kein unerklärter Sprung mehr | S–M | Texte. Wechselwirkung mit den Epochennachrichten |
| K | **Glaubensstärke/Frömmigkeit je Provinz** (0–100) als neuer Wert, der Bekehrung bremst und Aufstände mit beeinflusst | Mehr Tiefe | L | Neuer Wert, Übersicht leidet. Besser nicht |
| L | **Amerika-Glauben:** `meso` (Sonnen- und Kriegsgott, Blumenkriege) und `inti` (Sonnenkult der Anden) als eigene Religionen. Nordamerika bleibt `natur`. Nach dem Kontakt Mission bzw. Zwang durch Kolonialmächte, mit Synkretismus als Option | Amerika wird unterscheidbar | M | Startwelten und `OAS_REL`-artige Tabellen anpassen. Weitere Prüfung nötig |
| M | **Asien:** Synkretismus (siehe D). Tempelwirkung für buddh (Forschung und Ordnung, Klöster), konfuz (Verwaltung, Steuern), shinto (Ordnung, Moral). Das Mandat des Himmels sinkt bei Glaubensunruhen (Bindung an das vorhandene `mandOf`) | Asien bekommt Profil im Glauben | S–M | Balance |
| N | **Reformation als Epochenmoment ausbauen:** in Epoche 3 Rivalität katholisch/evangelisch (D), Gunst der Kirche, Glaubenskriege (E), am Ende ein Religionsfrieden als Ereignis (Augsburg/Westfalen) mit Beziehungsreset | Starkes Kapitel für Europa | M | Nur Europa. Bewusst begrenzt halten |
| O | **Glaube im Rat:** Der Berater „Klerus/Glaube“ schlägt Bekehrung, Tempel in Provinzen mit fremdem Glauben, Toleranzwechsel und heilige Stätten als Ziele vor. Nutzt die bestehende Ratskarte | Führt den Spieler, ohne Popup | S | keine |

Bewusst **nicht** übernommen: keine Abläufe oder Oberflächen aus bestehenden Spielen (etwa Religionsbäume mit Glaubenspunkten oder Spielerwahl von Lehrsätzen). Die Mechaniken bleiben an Provinzwerte, Stände und die vorhandene Kirche gebunden.

---

## 3. Empfehlung

### Phase 1 (machbar in einem Lauf, wenig Risiko, hoher Klarheitsgewinn)
1. **A:** Bekehrungsübersicht je Provinz mit Rate, Restrunden und Aufschlüsselung.
2. **C:** Heilige Stätten in einer Liste vereinheitlicht (behebt die Dopplung HOLY/HOLY_REL und die Ordnung ohne Glaubensbezug). Dazu 6–8 neue Stätten in Asien, Indien, Afrika und Amerika.
3. **D:** Glaubensfamilien und Rivalen in der Beziehung.
4. **H:** Mönche als sichtbarer Bekehrungsschub. Das Ereignis „Mission oder Zwang“ für alle Epochen.
5. **I:** Toleranz mit Abklingzeit und Zahlen. KI-Toleranz in der Diplomatie sichtbar.
6. **B (klein):** Kartenansicht Religion mit Legende und Symbolen für heilige Stätten. Knopf im Glaubensreiter.
7. **M (klein):** Tempelwirkung für buddh, konfuz und shinto.
8. **O:** Ratsvorschläge zum Glauben.

**Messung:** KI-Bündnisse und -Kriege über 100 Runden vorher und nachher (bal2), Zahl der Glaubenswechsel, Ordnung.

### Phase 2 (eigener Lauf oder mehrere)
- **E:** Heiliger Krieg für alle Religionen.
- **F:** Glaubensbund.
- **G:** geistliche Häupter (Patriarch, Kalifat, Abuna).
- **J:** Glaubenswellen mit Ankündigung und Wahl.
- **L:** eigene Religionen für Amerika.
- **N:** Reformationskapitel mit Religionsfrieden.
- Bilder dafür: heilige Stätten, Glaubenskrieg, Kalif, Patriarch. Als PC-Paket möglich.

---

## 4. Entscheidungsfragen für Moritz

1. **Heilige Stätten weltweit?**
   - a) Ja, 6–8 neue in Asien, Indien, Afrika und Amerika (empfohlen)
   - b) Nur die bestehenden reparieren
   - c) Ja, und jede Stätte als Ziel in Aufträgen
2. **Wie stark soll der Glaube die Diplomatie prägen?**
   - a) Mild: Familien und Rivalen, Werte etwa ±15 (empfohlen)
   - b) Stark: Rivalen −25, gleicher Glaube +20, Glaubensbund als neuer Vertrag
   - c) Nur Anzeige, keine neuen Werte
3. **Heiliger Krieg für alle Religionen (Kreuzzug, Dschihad, Glaubenskrieg)?**
   - a) Ja, in Phase 2 mit strengen Bedingungen
   - b) Nein, nur der päpstliche Kreuzzug bleibt
   - c) Schon in Phase 1
4. **Geistliche Häupter außerhalb Roms (Patriarch, Kalif, Abuna)?**
   - a) Ja, Phase 2, einheitliche Mechanik (empfohlen)
   - b) Nur Kalifat als Titel ohne eigene Mechanik
   - c) Nein
5. **Eigene Religionen für Amerika (Sonnenkult Anden, Mexica-Götter)?**
   - a) Ja, mit Mission bzw. Synkretismus nach dem Kontakt
   - b) Ja, aber ohne Kontaktmechanik
   - c) Nein, Naturreligion bleibt
