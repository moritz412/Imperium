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

## Akt IV im Spielerlauf (v243, 05.11.)

Test: `dev/tests/hn_akt4_t.js` (Bot, Playwright, Software-Rendering; ca. 12 Min für 15 Läufe). Aufruf z. B. `HN4_LAUFE="B:4,C:4,A:3,E:3,D:1" HN4_ZAMA=16 node hn_akt4_t.js ../imperium.html 8772`.
**Abkürzung (gekennzeichnet):** Schritte 1–8 werden nicht gespielt. `akt3()` stellt einen typischen Stand nach Akt III her: Runde 53 (Jahr 206 v. Chr.), Hannibal in Kampanien mit 65 % der Startstärke (515 Mann, 10 Einheiten, 3 Elefanten-Einheiten), Gunst 50, Gold 3000, Cannae erledigt, Provinzen Kampanien, Lukanien, Bruttium, Apulien, Insubrien, Taurini; die Geschichte rückt per `storyRound` selbst auf Schritt 9 (Hook 8). Der Bot bewegt beide Heere (Hannibal und Hasdrubal) über `marchTo`/Angriffsfenster, klickt Fenster, beendet Runden; Friedensangebote Roms lehnt er ab. Zama-Wiederholungen laufen aus einem Ladepunkt direkt vor der Schlacht (`resolveAttack` ohne Fenster, gekennzeichnet). Echtes iPad nicht getestet; Kino/Bilder nicht geprüft.
Varianten: A = Hasdrubal entgegen, vereinen, dann Rom (3 Läufe); B = passiv im Süden, Heimkehr, Zama (4); C = wie B mit Plan „Elefanten zurückhalten“ (4); E = wie B, Poebene nicht in Karthagos Hand (3); D = ganz passiv (1). Würfel streuen, Stichproben klein.

### Messwerte
| Messung | Ergebnis |
|---|---|
| Hasdrubals Ankunft | Runde 57 in allen Läufen (Aufbruch 53, Pass 55–56, 2 Tage), 58–77 % der Männer (meist 73 %), 1 von 3 Elefanten-Einheiten |
| Neros Eilmarsch | Start Runde 56/57, Abstand zu Hasdrubal 5 Provinzen; erreicht ihn Runde 59 (2 Provinzen/Runde) |
| Nero vor Hannibal? | Aktiv (A): Hannibal in Runde 58 beim Heer, Vereinigung („vereint“) 3 von 3 Läufen, **vor** Nero (Runde 59–62). Passiv (B/C/E): Nero stellt Hasdrubal in Runde 59, **Hasdrubal siegt jedes Mal** („nero geschlagen“) |
| „Hasdrubals Kopf“ | **0 von 14** Läufen (auch mit fremder Poebene, Variante E) |
| Rom-Angriff (A) | 3 Läufe: Ende B in 3 von 3 (Karthago fiel in 2, Hannibal fiel in 1), Latium nicht erobert; Lauf mit frühem Ende A („Rom fällt“, Runde 59–60) nur, wenn Hannibals Heer Latium schon vor der Wahl nimmt |
| Zama-Siegquote | Sofortiger Angriff nach der Heimkehr (Stärkeverhältnis 0,8–1,1): B 2 von 48 Schlachten (4 %), C 1 von 48 (2 %), E kein Lauf erreichte Zama. Echte Läufe: 0 von 6 gewonnen. Nach Warten und Rekrutieren (Verhältnis 2,4): 16 von 16 gewonnen |
| Enden (heim/rom/passiv) | Ende B „Zama“ 6, B „Hauptstadt gefallen“ 5 (nach Korrektur) bzw. früher fälschlich als „Zama“, B „Rom“ 3, A „Zama“ 1 (nur nach Warten), A „Rom“ 1, B „Zeit“ 2 (Lauf vor Korrektur) |
| Jahr im Endfenster | 204–202 v. Chr. (Zama 203/204, nach Warten 202), Ende A „Rom“ 204; Metaurus-Ankunft Hasdrubal Runde 57 = 205 (Geschichte: 207) |
| Fehler | keine Seiten-/Konsolenfehler, keine Platzhalter (undefined/NaN/`${`) in Fenstertexten, keine Fenster ohne Knopf (`stuck` leer), keine Warnungen aus den Hannibal-Bausteinen |

### Befunde nach Schwere
**Blockiert (behoben in v243)**
1. **Scipio verließ Byzacena.** Der Text sagt „Scipio lagert in Byzacena: Dort fällt bei Zama die Entscheidung“, die KI zog ihn aber nach Gaetulien weiter oder ließ ihn das leere Karthago nehmen, solange Hannibals Heer noch zwei Runden auf See war. Zama war dann nicht mehr erreichbar. Fix: `hnWahlRound` hält Scipio (`hold`) in Byzacena, bis Zama entschieden ist (nur wenn er dort steht; wie das Bürgerheer bei „Rom angreifen“).
2. **Mago landet im aufgegebenen Italien.** Nach „Heimkehren“ bot der Rat weiter Verstärkung an (Gunst −25), die bei Locri in Italien landete, das schon an Rom gefallen war. Fix: `hnVerstWhy` sperrt die Verstärkung nach der Heimkehr.

**Verwirrend**
3. **Falscher Endtext (behoben).** Fällt Karthago in Akt IV durch Landung statt in einer Schlacht, zeigte Ende B den Zama-Text („Elefanten rasen durch die Gassen“), obwohl nie gekämpft wurde. Neuer Grund „kapital“ in `hnEndMark`/`hnEndInfo`: „Rom hat Karthago genommen, ehe Hannibals Heer es schützen konnte …“.
4. **Friede mit Rom sperrt Zama (nicht behoben).** Nimmt der Spieler ein Friedensangebot Roms an (Gesandtschaft „Annehmen“ ist die Standardwahl) oder die erste Option des Friedenskongresses (Separatfrieden), gilt Waffenstillstand: Hannibal kann Scipio nicht angreifen („Solange kannst du keinen Krieg erklären“), die Gunst fällt um 3 je Runde. Der Bot musste Frieden ablehnen, sonst endete jeder Lauf an dieser Stelle (Zeit/Abberufung). *Vorschlag:* In der Hannibal-Geschichte ab Akt IV keine Friedensangebote Roms an den Spieler (Regel wie `noSubmit`), oder Warnhinweis im Angebotsfenster.
5. Ende B „Zeit“ in Läufen, die Zama nicht erreichen, wirkt wie ein Sprung: es gibt keine Meldung, dass Scipios Heer aufgesucht werden muss (Wahlfenster verspricht „Heimkehren und Scipio schlagen“, Karte zeigt keine Marke).

**Balance (nur Vorschläge)**
6. **Rom nimmt Karthago vor der Entscheidung.** Ab Akt IV (`hnNoLand` endet bei Schritt 9 = Index 8) landet Rom in Zeugitana: Karthago fiel in 5 von 11 Läufen mit Heimkehr, in 2 von 3 mit „Rom angreifen“, im passiven Lauf einmal in Runde 63 – meist **vor** dem Wahlfenster oder während der Heimfahrt (3 Runden Frist). *Vorschlag:* `hnNoLand` bis zum Wahlfenster (Index 9) verlängern oder Garnison/Mauern Karthagos beim Beginn von Akt IV stärken.
7. **Zama praktisch nicht gewinnbar bei sofortigem Angriff.** Mit 65 % Startstärke, Panik 40 % je Elefanten-Einheit, Masinissa +12 % und Gassen-Regel liegt das Verhältnis bei 0,8–1,1: Siegquote 2–4 %. Der Plan „Elefanten zurückhalten“ (−5 %) ändert nichts (C 2 %). Wer wartet und rekrutiert, gewinnt sicher (Verhältnis 2,4: 100 %) – dann fällt aber Karthago öfter oder die Gunst sinkt. *Vorschlag:* Panik 25–30 %, Masinissa +8 % oder Heer-Auffüllung bei der Heimkehr (Veteranen aus Africa), dazu Hinweis, dass Warten und Verstärken lohnt.
8. **Nero ist zu schwach.** Er greift Hasdrubal in der Poebene an und verliert immer (14 von 14); „Hasdrubals Kopf“ kommt nie vor. Mit aktivem Hannibal ist die Vereinigung leicht (Runde 58). *Vorschlag:* Nero 9–10 Einheiten oder Angriff mit +25 % (Überraschung); Hasdrubal ohne Heimvorteil.
9. **Rom angreifen** schlägt in 3 von 3 Läufen fehl (Garnison 46, Mauern 4, Bürgerheer; Belagerung dauert, derweil fällt Karthago). Ende A „Rom“ ist praktisch nur über Latium vor dem Wahlfenster erreichbar.

**Kosmetik**
10. Jahre: Hasdrubal kommt 205 an (Geschichte 207), Zama 203/204 (Geschichte 202). Folge von ypt 0,25 und der Rundenzählung (siehe Befund 7 der Gesamtprüfung).
11. Der Bot-Fund „Fenster Schritt 10 von 10“ und das Wahlfenster erscheinen unmittelbar hintereinander (zwei Fenster mit demselben Text): zusammenlegen oder das Schrittfenster in dieser Runde unterdrücken.

### Geänderte Funktionen (v243)
`hnWahlRound` (Scipio hold), `hnVerstWhy` (keine Verstärkung nach Heimkehr), `hnEndMark`/`hnEndInfo` (Grund „kapital“). Tests nach den Korrekturen: chkf „checked“, smoke, hn4 (siehe unten). iPad nicht getestet.
