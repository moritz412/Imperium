# Design-Review aller Spielsysteme (Stand v171)

Grundlage: `scratchpad/base71.html`, Code gelesen und gezählt, dazu eine Laufzeit-Zählung mit `shot/sys_census.js` (1 Browser, Desktop-Chromium). Nichts am Spiel geändert. Spielnamen dienen nur der Einordnung, übernommen wird keine Mechanik.

## 0. Zahlen auf einen Blick (gemessen)

| Größe | Wert | Beleg |
|---|---|---|
| Funktionen im Code | 2 349 | Zählung `function x(` |
| Waren (`GOODS`) | 40, je Epoche freigeschaltet: 24 / 27 / 31 / 37 / 40 | Laufzeit |
| Gebäude (`BUILDINGS`) | 64, je Epoche: 37 / 44 / 50 / 60 / 64 | Laufzeit |
| Techniken (`TECHS`) | 145, davon 30 Kultur-Lehren (`doc`) | Laufzeit |
| Religionen | 20 | Laufzeit |
| Hofämter | 7, Agenten-Aktionen 11, Hausgesetze 8 | Laufzeit |
| Ereignisse (`EVENTS`) | 56, Ratsregeln 22, heilige Stätten 13 | Laufzeit |
| Posten in `income()` | **19**: tax, upk, hof, trade, trib, sale, buy, loan, ez, mono, priv, merch, post, cred, kir, comp, gk, fx, hort | `income()` |
| Mögliche Ordnungsfaktoren je Provinz | **ca. 40 benannte** (59 `parts.push`) | `orderParts()` |
| Reiter: Wirtschaft / Hof | 7–8 / 7 | `openEconomy`, `openHof` |
| Fenster-Funktionen (`open*`) | 34 | Zählung |
| Werte je Reich / je Provinz im Spielstand | 37 → 53 Schlüssel (Ep. 0 → 3) / 23 → 34 | Laufzeit |

**Runde im Vergleich** (je 5 Runden ohne Spielerhandlung, Ereignisse automatisch beantwortet):

| | Epoche 0, Rom | Epoche 3, Startwelt (Pergamon) |
|---|---|---|
| Provinzen / Heere | 2 / 2 | 40 / 12–13 |
| Aufgaben-Einträge je Runde | 5–7 | 5–9 |
| Ratsvorschläge | 0–1 | 0–3 |
| Ereignisse + Pflichtfenster | 0–3 / 0–1 | 0–2 / 1 |
| Gold | 345 → 435 (+~20/Runde) | 1 204 → 2 998 (**+~600/Runde ohne Zutun**) |

Einschränkung: Der Ep.-3-Lauf blieb in der 5. Runde hängen (Runde 130 zweimal, vermutlich ein offenes Schlachtfenster). Die Zahlen der ersten vier Runden sind gültig. Klicks je Runde habe ich nicht gemessen, nur die Zahl der Dinge, die eine Entscheidung verlangen.

**Kernaussage:** Die einzelnen Systeme sind meist gut begründet und sauber erklärt (Aufschlüsselungen, Klartext-Gründe). Das Problem ist die **Summe**: 19 Geldposten, 40 Waren, ~40 Ordnungsfaktoren, 7 Hofreiter und 8 Wirtschaftsreiter. Vieles davon greift ineinander, ohne dass der Spieler es steuern muss oder kann. Das Spiel hat mehr Simulation als Entscheidungen.

---

## 1. Wirtschaft (Gold, Steuern, Waren, Lager, Handel, Kredite)

**Zweck:** Gold finanziert alles, Waren schalten Bauten und Truppen frei. **Kernentscheidung:** Wohin investiere ich und was kaufe ich zu?

**Gut**
- Waren werden schrittweise freigeschaltet (24 → 40), Bedarf wird erklärt (`empireNeeds` mit Grund „Verbrauch über Erzeugung“).
- Der Rat schlägt Lieferanten mit Preis vor (`mangel`). Das nimmt viel Suchaufwand ab.
- Ein Hort-Abzug (`hortCost`) bremst Goldberge.

**Problematisch**
- **19 Einnahme- und Ausgabeposten** (`income()`): Monopole, Privilegien, Handelsposten, Kredite, Kompanien, Goldkarawane, Pilgergold, Hort, Kirche, Tribut in 3 Formen. Die meisten bewegen jeweils nur wenige Gold. Prinzip „wenige starke statt viele schwache Ressourcen“ verletzt: Der Spieler kann nicht abschätzen, welcher Hebel zählt.
- **40 Waren** sind für ein Spiel dieser Größe viel. Viele haben nur Handels- oder Prestigewert (Bernstein, Purpur, Met, Honig, Möbel, Schmuck, Porzellan, Geschirr). Wer handelt, braucht Übersicht über Ketten, Transport und Lager, dafür gibt es eigene Reiter „Ketten“ und „Transport“.
- **Spätspiel-Goldberg:** In Ep. 3 wuchs das Gold um ~600 je Runde ohne jede Handlung (40 Provinzen). Ausgaben werden dann unbedeutend, Entscheidungen verlieren Gewicht. Der Hort-Abzug wirkt erst über `hortCap()`.
- **Drei Wege zum selben Effekt „Ware besorgen“:** Liefervertrag, Handelsroute, Händler-Agent (+ Kontor/Handelsposten). Überschneidung, schwer zu unterscheiden.

**Empfehlung**
- **Vereinfachen (hoher Nutzen, Aufwand M, Risiko mittel):** Kleinposten im Haushalt zu 5–6 Gruppen zusammenfassen: Steuern, Handel, Tribut, Heer, Hof und Kirche, Sonstiges. Die Rechnung bleibt, nur die Anzeige wird lesbar.
- **Waren gruppieren statt streichen (M, Risiko gering):** 40 Waren in 6–8 Gruppen zeigen (Nahrung, Bau, Rüstung, Textil, Luxus, Glaube, Pulver). Luxuswaren nur als Sammelwert „Luxus“ für Ordnung und Ansehen. Einzelwaren bleiben im Detail sichtbar.
- **Goldberg begrenzen (S–M, Risiko mittel, messen!):** Unterhalt oder Verwaltungskosten mit Reichsgröße etwas steigen lassen, damit Ep. 3–4 nicht in Überfluss kippt. Nur mit Langzeitmessung (gehört in `audit_balance.md`).
- **Beschaffung zusammenlegen (M):** Ein Knopf „Ware besorgen“, der den besten der drei Wege vorschlägt (Vertrag, Route, Händler).

## 2. Bauten, Ausbau, Bauplätze, Städtestufen

**Zweck:** Provinzen entwickeln. **Kernentscheidung:** Welches Gebäude wo.

**Gut:** Freischaltung je Epoche (37 → 64), Bauplätze begrenzen, Städtestufen geben sichtbaren Fortschritt. Paralleles Bauen erst mit Technik (`parOk`).

**Problematisch**
- **64 Gebäude** mit vielen Kulturvarianten (Felskirche, Lehmmoschee, Stelen, Persischer Garten, Pfalz …). Jedes bringt kleine Prozentwerte, oft +3–4 %. Bei 40 Provinzen wird das zur Klickroutine.
- Statthalter können automatisch bauen. Das ist gut, steht aber in einem anderen Fenster (Hof → Statthalter) als das Bauen selbst.

**Empfehlung:** **Behalten, aber automatisieren mit Kontrolle (M):** In der Provinz „Bauplan: automatisch nach Ausrichtung (Wirtschaft / Ordnung / Militär)“ als Standard anbieten und den Statthalter-Auftrag dort sichtbar machen. Kleinste Gebäude zusammenlegen, wo sie dasselbe tun (Prüfliste mit `bldByEp`).

## 3. Hof, Ämter, Minister, Stände (Parteien)

**Zweck:** Personen mit Werten und Eigenschaften, drei Stände (`pol`: adel, klerus, buerger).

**Gut:** Kleine Zahl Ämter (7), Minister mit wenigen Eigenschaften, Stände mit drei Zuständen (gut / mittel / schlecht).

**Problematisch**
- **Hof-Fenster mit 7 Reitern:** Ämter, Statthalter, Parteien, Glaube und Lehen, Familie, Feldherren, Agenten. Das ist ein Sammelbecken für fast alles, was nicht Karte ist.
- Kandidaten werden alle 8 Runden neu gewürfelt (`hofOf`). Wer nicht hinschaut, verpasst nichts Wichtiges. Folge: Pflicht-Kontrollklick ohne echte Entscheidung.
- Stände reagieren auf viele Kleinigkeiten (Toleranz ±0,3 je Runde usw.). Ursache und Wirkung sind schwer zu sehen.

**Empfehlung:** **Zusammenlegen (M):** Hof in **„Herrscherhaus“** (Familie, Erbrecht) und **„Regierung“** (Ämter, Statthalter, Stände) teilen. Glaube in eigenen Bereich, Feldherren zum Heer, Agenten zur Diplomatie. Stände: Nur Änderungen über ±5 je Runde melden, mit Ursache.

## 4. Statthalter und Regionen

**Gut:** Echte Automatisierung mit Ausrichtung (`G.dir`), Bericht alle 5 Runden (`govReport`), Straßenbau-Priorität. Genau das, was Spätspiel-Verwaltung braucht.

**Problematisch:** Treue, Ehrgeiz und Gefolge (`GOV_RET`) erzeugen Unterbrechungen (Abfall-Warnungen). Gefolge entsteht zufällig (4 % je Runde).

**Empfehlung:** **Behalten und ausbauen (S):** Statthalter als *die* Spätspiel-Lösung bewerben: Hinweis „Ab 8 Provinzen: Statthalter einsetzen spart dir Arbeit“. Zufallsgefolge vereinfachen oder streichen (Wirkung klein, Erklärbedarf groß).

## 5. Familie und Erbrecht

**Gut:** Stammbaum, Hausgesetze, Regentschaft. Thronstreit höchstens alle 20 Runden. Erzeugt Geschichten statt Klickarbeit.

**Problematisch:** Viele Teilsysteme (Geiseln, Mündel, Exil, Personalunion, Loyalität, Botschafter, Glaubensgrenzen bei Ehen). Für Einsteiger unsichtbar bis zum ersten Ereignis.

**Empfehlung:** **Behalten, schrittweise zeigen (S):** Teilsysteme erst einblenden, wenn sie relevant werden (erstes Kind im heiratsfähigen Alter, erster Erbfall). Mehr nicht.

## 6. Glaube, Kirche, geistliche Häupter

**Gut:** Bekehrung mit Rate und Restrunden (`convHtml`), Toleranz mit Zahlen und Sperre, heilige Stätten an Glauben gebunden. Vorbildliche Rückkopplung.

**Problematisch:** Sehr viele Schichten: 20 Religionen, Toleranz, Kirche/Gunst/Zehnt/Bann/Kreuzzug, Häupter, Heiliger Krieg, Glaubensbund, Glaubenswellen, Westfälischer Friede, Mission, Priester-Agent. Für die meisten Völker spielen nur 2–3 davon eine Rolle, angezeigt wird aber vieles.

**Empfehlung:** **Ausblenden statt streichen (S):** Im Glaubensbereich nur zeigen, was für den eigenen Glauben gilt (z. B. Kirche nur katholisch, Kalifat nur Islam). Alles Übrige unter „Mehr“.

## 7. Diplomatie, Verträge, Glaubensbund, Koalition

**Gut:** Beziehung mit Aufschlüsselung (`relParts`), Ruf (`trustOf`), Klartext-Ablehnung, Stufenleiter. Branchenüblich gut.

**Problematisch**
- **Stufenleiter mit 7 Stufen** (Krieg, Frieden, Nichtangriffspakt, Handel, Glaubensbund, Bündnis, Vasall), dazu Heirat, Tribut (3 Formen), Embargo, Koalition, Gesandter. Glaubensbund und Nichtangriffspakt liegen in der Wirkung nah beieinander.
- Kriegserklärungen der KI kommen ohne Vorwarnung (außer Erzfeind), siehe `konzept_ki.md`. Verstößt gegen „klare Rückkopplung“.

**Empfehlung:** **Vorwarnung einführen (S, Risiko gering):** Stimmungsanzeige und Drohung 1–3 Runden vor Krieg, aus dem schon berechneten Kriegswert. **Tribut-Anzeige zusammenlegen (S).** Glaubensbund bleibt (frisch, gerade gemessen), aber im Fenster neben dem Bündnis gruppieren.

## 8. Agenten

**Zweck:** 11 Aktionen (Kundschaft, Sabotage, Unruhe, Netz, Abwehr, Bestechung, Anspruch, Handel, Bekehrung, Kultur …).

**Problematisch:** Überschneidung mit Diplomatie (Ansprüche, Beziehung), Glaube (Bekehrung), Wirtschaft (Handel). Agenten sitzen im Hof-Fenster, wirken aber auf Karte und Diplomatie.

**Empfehlung:** **Zusammenlegen (M):** Agenten als Karteneinheit bzw. im Diplomatie-Bereich führen. Aktionen auf ~6 kürzen, die nicht anderswo doppelt vorkommen (Handel → Wirtschaft, Bekehrung → Glaube nur als Abkürzung).

## 9. Kultur und Kulturtechniken (Doktrin)

**Gut:** 30 Kultur-Lehren geben Völkern Profil, Ratsvorschläge „Bewährte Strategie unseres Volkes“. Gutes Prinzip: asymmetrische Völker ohne neue Regeln.

**Problematisch:** Kultur-Lehren laufen im selben Forschungsbaum wie normale Techniken (145 gesamt). Ihr Sonderstatus ist schwer erkennbar.

**Empfehlung:** **Behalten (S):** Kultur-Lehren optisch eigen markieren (Volkssymbol), im Forschungsfenster eigene Zeile.

## 10. Forschung

**Gut:** Geistesblitze (`eurekaRound`, −40 %), Wissen durch Kontakt (`techMult`), historische Durchbrüche. Gute Rückkopplung mit der neuen Wissenskarte.

**Problematisch:** 145 Techniken sind viel. Eine Wahl je Forschungsabschluss ist in Ordnung, aber die Liste ist lang, und viele Techniken bringen nur +x %.

**Empfehlung:** **Vereinfachen in der Anzeige (S):** Pro Epoche 3–5 „Schlüsseltechniken“ hervorheben, den Rest als „Verbesserungen“ einklappen. Kein Umbau der Werte.

## 11. Ordnung, Unruhe, Feste

**Gut:** Jede Provinz zeigt die Aufschlüsselung. Feste sind eine klare Ein-Knopf-Entscheidung mit Abklingzeit.

**Problematisch:** **~40 mögliche Faktoren** (`orderParts`). Typischerweise wirken 6–12 gleichzeitig. Kein Spieler kann die gezielt steuern. Viele Faktoren sind ±0,5 und damit Rauschen.

**Empfehlung:** **Vereinfachen in der Anzeige (S–M):** Faktoren in 5 Gruppen zusammenfassen (Verwaltung, Glaube, Militär, Wohlstand, Besonderes), Gruppe aufklappbar. Faktoren unter ±0,5 als „Kleineres“ bündeln. Rechnung unverändert.

## 12. Militär (Einheiten, Heeresverfassung, Söldner, Tross, Feldzüge, Kriegsmüdigkeit)

**Gut:** Kriegsmüdigkeit mit Zahlen, Feldzugsziele als Automatisierung, Moral auf der Karte, Heeresgröße je Epoche. Söldner mit echtem Risiko sind eine bedeutsame Entscheidung.

**Problematisch**
- Viele Sonderformen nebeneinander: Lehnsaufgebot (`levy`), stehendes Heer mit Drill, Massenaushebung, Söldner, Condottieri, Tümen, Janitscharen, Daimyō. Für den Spieler meist unklar, welche gerade gilt.
- 12–13 Heere in Ep. 3 sind Mikromanagement. Die neue Befehlsblase hilft, ein Sammelbefehl fehlt.
- Unterhalt-Formel mit 6 Faktoren (Epoche, Winter, Feldherr, Technik, Überdehnung, Miliz) in `income()`. Die Ursache hoher Kosten ist schwer zu sehen.

**Empfehlung:** **Behalten, Lesbarkeit verbessern (S–M):** Im Heer-Fenster eine Zeile „Heeresverfassung: … (was das bedeutet)“. Für das Spätspiel „Alle Heere in Region X: Feldzug / Halten“ (M). Unterhalt-Aufschlüsselung im Haushalt.

## 13. Rat, Aufgaben, Hinweise

**Gut:** 22 Ratsregeln mit Ein-Tipp-Aktion und Begründung, dazu die Aufgabenliste. Starkes Werkzeug gegen Überforderung.

**Problematisch**
- **Drei parallele Hinweis-Kanäle:** Aufgaben (5–9 je Runde), Rat (0–3), `advisorHints` (Text ohne Stimme), dazu Protokoll und Berater-Einblendung. Wichtiges kann untergehen, die Kanäle wiederholen sich teils.
- Aufgabenzahl wächst mit dem Reich nicht stark (5–9). Das ist gut, aber die Liste zeigt keine Priorität.

**Empfehlung:** **Zusammenlegen (M, hoher Nutzen):** Ein Kanal „Was jetzt wichtig ist“ mit höchstens 3 priorisierten Einträgen (Rat + Aufgaben verschmolzen), Rest einklappbar. Protokoll bleibt reines Nachlesen.

## 14. Geschichten

**Gut:** Klare Ziele, Fristen, Vertonung und Bilder, Ziele nach Rückmeldung entschärft. Erzeugt Bindung und dient als Tutorial-Ersatz.

**Problematisch:** Viele Geschichten führen eigene Mechaniken ein (Ratsfeuer, Mandat, Tributsystem). Gut für Abwechslung, aber das Basisspiel muss dann vorher sitzen.

**Empfehlung:** **Behalten (S):** Eine Geschichte als ausgewiesenen **Einstieg** markieren (kurz, wenige Systeme, z. B. Rom/Cäsar), mit Hinweis „empfohlen für den Anfang“.

---

## 15. Querschnitt gegen die Prinzipien

| Prinzip | Stand | Hauptbeleg |
|---|---|---|
| Bedeutsame Entscheidungen statt Pflichtklicks | teils | Kandidaten-Neuwurf alle 8 Runden, 64 Gebäude mit +3 %, Kleinposten |
| Klare Rückkopplung | **stark** | Aufschlüsselungen überall (`relParts`, `orderParts`, `convHtml`) |
| Lesbare Zahlen | **schwach in der Summe** | 19 Geldposten, ~40 Ordnungsfaktoren |
| Komplexitätsbudget, schrittweise Freischaltung | teils | Waren und Gebäude je Epoche ja, Fenster und Reiter nein |
| Wenige starke Ressourcen | verletzt | 40 Waren, viele Kleineinnahmen |
| Keine Mikromanagement-Falle | teils | Statthalter und Feldzüge ja, Bauen und 12+ Heere nein |
| Keine dominanten Strategien | ungeprüft | gehört in `audit_balance.md` |
| Schneeball-Kontrolle | schwach | +600 Gold je Runde in Ep. 3 ohne Zutun, Hort-Abzug spät |
| Spätspiel-Verwaltungsaufwand | mittel | Statthalter gut, Sammelbefehle fehlen |
| Automatisierung mit Kontrolle | gut begonnen | Statthalter, Feldzüge, Rat |
| Konsistente Begriffe | teils | „Statthalter“ = Regionsstatthalter und Hofamt „Reichsverweser“ (key `statthalter`), zwei „Hinterhalt“, Hof-Reiter „Glaube und Lehen“ |

## 16. Top-10 Nachbesserungen (nach Nutzen für ein rundes, zugängliches Spiel)

| # | Maßnahme | Systeme | Aufwand | Risiko |
|---|---|---|---|---|
| 1 | **Ein Kanal „Jetzt wichtig“**: Rat und Aufgaben verschmelzen, max. 3 priorisierte Einträge, Rest einklappbar | Rat, Aufgaben, Hinweise | M | gering |
| 2 | **Menü neu ordnen**: Hof aufteilen in Herrscherhaus / Regierung, Glaube eigen, Feldherren zum Heer, Agenten zur Diplomatie (deckt sich mit `audit_menue.md`) | Hof, Agenten, Glaube | M–L | mittel |
| 3 | **Haushalt in 5–6 Gruppen** statt 19 Posten, Unterhalt aufgeschlüsselt | Wirtschaft, Militär | M | gering |
| 4 | **Ordnung in 5 Gruppen** mit „Kleineres“-Bündel | Ordnung | S–M | gering |
| 5 | **Spätspiel-Goldberg dämpfen** (gemessen, vorsichtig) | Wirtschaft, Balance | S–M | mittel |
| 6 | **Bauen automatisieren mit Kontrolle**: Bauplan je Provinz/Region nach Ausrichtung, Statthalter-Auftrag sichtbar in der Provinz | Bauten, Statthalter | M | gering |
| 7 | **Waren gruppiert anzeigen** (Nahrung, Bau, Rüstung, Textil, Luxus, Glaube, Pulver), „Ware besorgen“ als ein Knopf über alle Wege | Wirtschaft, Handel, Agenten | M | gering |
| 8 | **Kriegsvorwarnung und Stimmung** je Reich | Diplomatie, KI | S | gering |
| 9 | **Nur Relevantes zeigen**: Glaubens-Teilsysteme nach eigenem Glauben, Familien-Teilsysteme bei Bedarf, Schlüsseltechniken je Epoche hervorheben | Glaube, Familie, Forschung | S | gering |
| 10 | **Begriffe vereinheitlichen** (Statthalter / Reichsverweser, Hinterhalt doppelt, Reiter-Namen), Einstiegs-Geschichte markieren | alle | S | gering |

Nicht empfohlen: Systeme ersatzlos streichen. Die Tiefe ist ein Wert des Spiels. Die Lösung ist **Bündeln in der Anzeige, Automatisieren mit Kontrolle und schrittweises Einblenden**, die Rechnung bleibt weitgehend gleich. Ausnahme: zufälliges Statthalter-Gefolge und die Kandidaten-Neuwürfe könnten wegfallen, ohne dass jemand sie vermisst.

## 17. Grundsatzfragen an Moritz

1. **Tiefe behalten, Anzeige bündeln, oder Systeme wirklich verschlanken?**
   Empfehlung: bündeln und automatisieren (Rechnung bleibt), nur wenige Kleinsysteme streichen (Gefolge-Zufall, Kandidaten-Neuwurf).
2. **Waren: 40 Einzelwaren behalten oder auf ~15 Kernwaren reduzieren?**
   Empfehlung: behalten, aber gruppiert anzeigen. Eine echte Reduktion würde Startwelten, Ketten, Gebäude und Handel umbauen (L, hohes Risiko).
3. **Soll das Spätspiel bewusst knapper werden (Goldberg dämpfen, mehr Kosten mit Reichsgröße)?**
   Empfehlung: ja, vorsichtig und gemessen, damit Entscheidungen in Ep. 3–4 Gewicht behalten.
