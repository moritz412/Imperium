# Prüfbericht Hannibal-Kampagne (SCEN.hannibal, H1–H4, Stand v237, Korrekturen v238)

Test: `dev/tests/hn_kampagne_t.js` (Bot, Playwright, Software-Rendering; ein Lauf ca. 20–35 Min, Teile abschaltbar mit `HN_SKIP=PASSIV,ABK,ALT,FIX`, `HN_BOOST=1`, `HN_LOG=1`).
Methode: Der Bot führt nur das Heer des Helden und nutzt die Funktionen hinter den Knöpfen (`orderMove`/`marchTo`, Angriffsfenster mit „Belagern/Berechnen“ angeklickt, `endTurn`, Ereignisfenster angeklickt: erste Option, Besatzung „Alle ziehen mit“, Pass „lange Weg“, Wahl Rom, Abfall, Rekrutieren in eigenen Provinzen, Boten/Verstärkung). Er hat keine Taktik: keine Neuaufstellung weiterer Heere, keine Schlachten von Hand, kein Handel/Bau.
Läufe (Messwerte unten): A = naiv, vor den Korrekturen von v238 (Rhone-Umweg, Abbruch Runde 40 nach Heerverlust); B = nach v238, mit „Abkürzung“: einmalige Auffüllung des Heeres nach der Ankunft (HN_BOOST, gekennzeichnet; sonst bricht der Bot in der Poebene ein), Ende Runde 57 durch Abberufung. Dazu Passiv-30, Abkürzungstest, alter Spielstand. Echtes iPad nicht getestet. Bilder, Kino, Sprecher nicht geprüft (Job 40/43 offen).
**Nicht getestet im Spielerlauf:** Hasdrubal/Nero, Wahl Rom/Heimkehr, Zama, Ende A (der Bot kam nie über Schritt 8 „Capua“ hinaus; nur `hn4_t.js` prüft sie strukturell). Einzelläufe streuen stark (Würfel).

## Messziele
| Ziel | Messung | Urteil |
|---|---|---|
| Sagunt nicht vor Runde 3 | Fall in Runde 4 (3 Runden Belagerung, Sturm Runde 4); Abkürzungstest (sofort angreifen): Runde 8 (Bot belagerte falsch) | erreicht |
| Poebene Runde 9–12, 40–60 % der Männer | Lauf A: Runde 17, 49 % (vor der Ankunftsschlacht), danach 15 %; Lauf B: Runde 15, 57 %. Pass-Eintritt Runde 10–13, Pass 3–5 Tage. Schritte 1–3 der Reihe nach: Sagunt R4, Ebro R7, Rhone R10–12 | Männer ok, **Runde zu spät** (Ziel nur ohne Schritt 1–3 erreichbar) |
| Cannae nicht vor Runde ~20 | Lauf B: Schritt 7 beginnt Runde 24, Riesenheer Runde 25, Cannae-Schritt erfüllt Runde 29 | erreicht (Bot hielt Poebene 9 Runden) |
| Bilanz in Italien | Gesamtbilanz Reich +50 bis +150 je Runde, Gold wächst auf 3000–4300 (Lauf B, Runde 25–45), nur ab Runde 45 bei 7 Provinzen um 0. `hn3_t.js` (nur Heer) −48…−53 | Gold nie knapp, **aber ungenutzt** (Befund 9) |
| Kein Pingpong > 2 in 30 Runden | Lauf B, Spielwelt: Hirpinien 6 Wechsel (Epirus/Rom/Karthago/frei), Apulien 3, Tarent 3, Venetien 3, Taurini 3, Narbo 5, Tolosa 6. Passiv-30: nur Taurini 3 (frei/Rom/Arverner/Massilia) | verletzt, vor allem durch KI-Reiche (Befund 8) |
| Hauptstadt hält (Passiv-30) | vor v238: Karthago fiel Runde 13–15 (3 von 3 Läufen); nach v238: bleibt eigen | behoben |

## Befunde nach Schwere

### Blockiert (behoben in v238)
1. **Rom erobert die Hauptstadt, bevor Hannibal Italien erreicht.** Rom setzt 6–7 Einheiten aus Sardinien nach Africa über (Runde 12–13), belagert Zeugitana, Niederlage „Zeugitana ist verloren“ in Runde 15 – ob der Spieler passiv ist oder die Alpen quert (3 von 3 Läufen). Ursache: Drei KI-Wege greifen Africa an: `aiFaction` (Angriff über Seeverbindung und Belagerungsbeginn) und `campStep` (Erzfeind-Heer, Nemesis-System), dazu `aiLanding`. Das Szenario hat keine Schonfrist (`rules.shield` wirkt nur auf Kriegserklärungen). Fix: `hnNoLand(j)`: Roms KI greift Karthagos Heimat vor Akt IV (`HN_STEP_SEE`) nicht an (an den vier Stellen). Test: Passiv-30 hält Karthago; `FIX`-Abschnitt.
2. **Das Heer des Helden verschwand, der Held tauchte in Hispanien auf.** Wird das Heer des Helden als Verteidiger geschlagen und hat keine eigene Nachbarprovinz zum Rückzug (typisch in der Poebene), setzt `resolveAttack` (Zweig `if(win)` bei `defArmies`) `d.units=[]`; `scenRound` ließ ihn dann „den Befehl über Heer IV“ in Hispanien übernehmen (Lauf A, Runde 28/29; kein Fenster, keine Erklärung). Fix: Das Heer des Helden flieht in eine Nachbarprovinz ohne Feindheer, sonst fällt der Held (`heroFell`). Test: 17 Siege des Angreifers, 8 Fluchten + 9 Tode, nie still gelöscht.

### Verwirrend
3. **„Hannibal Barkas ist gestorben“ in Runde 3–15.** Das Herrscherhaus läuft in der Geschichte mit (`dynRound`, `AGE_TURN`=2 Jahre je Runde trotz ypt 0,25; Herrscher heißt wie der Held, Alter 42). Folge: Thronwechsel mit Ordnung −1, fremde Namen (Viriathus, Imilke). Fix v238: Herrscher stirbt in der Hannibal-Geschichte nicht. Offen: `AGE_TURN` ignoriert `ypt` der Szenarien (betrifft alle Geschichten, Vorschlag: Szenario-Alter nach ypt).
4. **Rhone-Fenster ließ sich umgehen.** Der Weg Tolosa → Arverner → Allobroger überquert die Rhone ohne Fenster (`hnGate` kannte nur Narbo/Vocontier; Elefanten ohne Risiko). Fix: Allobroger zählt zum Tor (auch Rückfall in `hnRound`).
5. **Pass-Ziel stand nach der Ankunft auf 1 von 2** (`SC_COND.pass` verlangt `in_taurini` aus `scenRound`, der Marker kommt erst am Rundenende). Wer sofort weiterzog, ließ den Schritt offen (Bot marschierte zurück in den Pass). Fix: `hn_ankunft` zählt sofort.
6. **Ankunftsschlacht in der Poebene ist erzwungen** (`hnPassArrive` → `resolveAttack` ohne Aussichtsprüfung). Lauf A: 49 % der Männer vor, 15 % nach der Schlacht („Taurinerland hält stand“), 5 Einheiten weg. Lauf B: gewonnen. *Vorschlag:* Prüfung der Aussicht; bei < 1 ohne Kampf ankommen (Kelten-Treue 35 nutzen) oder halbe Verluste.
7. **Jahreszahlen laufen der Geschichte voraus.** Fensterjahr = Spielerjahr (ypt 0,25): Pass 216–215 (Text/Geschichte 218), Trebia 215, Cannae 213 (Text: „Sommer 216 vor Christus“), Akt IV bei Runde 53+ = 207–205 (passt). **Die „219 v. Chr.“ im H4-Screenshot** war der Teststand (Runde 1 nach `setup`), kein Fehler im Fenster. `stHook`-Jahressprung geht nur vorwärts, bei ypt 0,25 (= Jahreszeiten) nicht lösbar. *Vorschlag:* Jahre aus den Kapiteltexten streichen oder `fmtYear(S.year)` einsetzen. Gesandtschafts-/Erzfeind-Fenster zeigen gar kein Jahr (Kosmetik, Hauptspiel).

### Balance
8. **KI-Reiche fressen Süditalien vor Hannibal:** Epirus erobert Tarent (Runde 8), Hirpinien (12), Apulien (14); Hirpinien wechselt 6-mal. Das Capua-Ziel (4 Abfälle in Süditalien) verlangt römische Städte. *Vorschlag:* Epirus/Makedonien in der Geschichte Frieden mit Rom/Karthago für ca. 40 Runden oder Süditalien-Schutz im Szenario.
9. **Gold ohne Verwendung:** 2000 Gold in Runde 15, 3000–4300 ab Runde 25 (Spanien/Africa/Gallien bringen +50…+150). In Italien lässt sich nichts kaufen (Rekrutieren nur in eigenen Provinzen mit Rekrutenpunkten; Boten kosten 150). *Vorschlag:* „Söldner anwerben“ (Kelten, Numider) im Heer-Blatt gegen Gold bei Kelten-Treue ≥ 50.
10. **Aufstände entziehen die Basis:** Nach dem Abmarsch fallen eroberte gallische/spanische Provinzen ab (15 → 6 Provinzen binnen 7 Runden, Tolosa/Lapurdum/Arverner), Hauptstadt-Ordnung sinkt. Normales Unruhesystem, in Akt I-II nicht abgefedert. *Vorschlag:* Besatzung zurücklassen (Wahl a/b/c) wirkt nur für Hispanien, nicht für Gallien.
11. **Capua-Schritt 29 Runden** (Lauf B, Bot stand untätig): Gunst −3/Runde sank von 90 auf 22, Abberufung Runde 57 (Ende B). Wie geplant, aber knapp 30 Runden ohne Hinweis, was zu tun ist; „Zum Abfall bewegen“ gelingt oft nicht (Chance 20–45 %, 6 Runden Pause). *Vorschlag:* Gunstabfall im Ratsleiste-Hinweis erklären („Handle, sonst Abberufung in n Runden“).
12. **Pass „lange Weg“ mit erster Option** kostet 49–57 % der Männer (Ziel getroffen); Kelten-Treue bei Ankunft 35, fällt im Stillstand um 5/Runde (90 → 30 in 12 Runden, Lauf B). Wie geplant.

### Kosmetik
13. Eroberungsfenster („X ist gefallen“) nennt Wirkung nur in Karten, die nicht anklickbar sind; nur die Knöpfe unten wirken (Hauptspiel).
14. Das Buch des Reiches nach dem Spielende hat nur ✕ (kein Aktionsknopf), korrekt für das Hauptspiel.
15. Friedenskongress-Fenster (Runde 11, 26) erscheinen mitten in der Geschichte; die erste Option schließt Separatfrieden (Ruf −15). Nicht weiter untersucht.

## Prüfliste „nach dem Bau“
- Spielertest 15 Runden über Knöpfe/Gesten: ja (Bot); kein Fenster ohne Ausweg in 3 Läufen (`stuck` leer außer dem Schlussbuch), Konsole ohne Fehler.
- Abkürzungstest: Seeweg nach Italien gesperrt (4/4 Küsten), Angriff auf Rom in Akt I fragt zurück, Sagunt nicht vor Runde 3 (frühester Fall Runde 4). Umgehungen gefunden: Rhone (Befund 4), Pass-Ziel (5).
- Stillstand: passiv 30 Runden siehe oben (vor v238 Niederlage Runde 15); aggressiv siehe Pingpong.
- Bilanz Gold nach 10 Runden: +800…+1600 (> 0). Alter Spielstand (ohne `hn_`-Flags, Runde 4): lädt, 3 Runden ohne Warnung.
- „Wer nachfragen muss, war zu kompliziert“: Bot musste bei Ebro/Pyrenäen nicht nachfragen; zu klären bleibt, **was zwischen Runde 17 und 30 zu tun ist** (Befund 11) und warum Gold nichts bewirkt (9).

## Tests nach den Korrekturen
chkf.sh „checked“, smoke 4/4, hn1 57, hn2 43, hn3 36 (`HN3_SKIP=BI,PP`), hn4 39 PASS, `hn_kampagne_t.js` FIX-/ALT-Teile PASS. Lauf A/B: BEFUND-Meldungen (keine FAIL). iPad nicht getestet.
