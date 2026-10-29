# Echtzeitschlacht – Umsetzungsplan (Stand 29.10.2026, nach Phase 0)

Grundlage: `konzept_echtzeitschlacht.md` (Phase 0 auf dem iPad Pro 11" 2. Gen bestanden, 60 B/s bei 4.000 Figuren, nur Testfiguren).
Dieses Dokument macht daraus Arbeitspakete mit Reihenfolge, Abhängigkeiten, Datenformaten und offenen Entscheidungen.
Profile: `dev/schlacht/profile_truppen.json`, `dev/schlacht/profile_charaktere.json`. PC-Aufträge: `dev/pc/auftraege_29_10.md`.
Alles hier ist Planung. Nichts davon ist gebaut oder getestet.

---

## 1. Spielablauf einer Schlacht (Soll)

| # | Zustand | Was der Spieler sieht | Was er tun kann | Technik |
|---|---|---|---|---|
| 1 | Angriff ausgelöst | Fenster „Schlacht bei …“: Bild der Landschaft, beide Feldherren mit Porträt, Kräftebalken, Schlachtplan | Knöpfe untereinander: **Schlacht schlagen** · **Ausgang berechnen** · **Zurückweichen** (nur Verteidiger, nicht bei Belagerung) | vorhandenes Angriffsfenster erweitern, nicht neu |
| 2 | Ladeschirm | Gemaltes Ladebild (Landschaftstyp × Epoche), Ortsname, Jahr, Kräfte, ein Satz Tipp, echter Balken | nichts (keine Knöpfe) | Paket laden → Kampagnenszene abbauen → Gelände bauen → Figuren anlegen → Shader vorwärmen |
| 3 | Aufstellung | Feld von oben schräg, eigene Zone hell, Feind sichtbar soweit Späher reichen, Einheitenkarten am unteren Rand | Karte antippen = Einheit wählen, auf dem Feld ziehen = verschieben; **Aufstellung nach Plan** (Plan aus Schritt 1 bestimmt Grundordnung); **Schlacht beginnen** | Aufstellungszonen aus dem Gelände |
| 4 | Schlacht | Freie Kamera, Einheitenkarten mit Mannstärke und Moralring, Feldherr hervorgehoben | Einheit wählen → Ziel antippen (Gehen) / zweimal tippen (Laufen, Angriff); Rahmen ziehen = mehrere; Formation (Spalte rechts); Pause; Tempo 1×/2× | Kampfregeln aus `battleFrame` als Grundlage |
| 5 | Ende | Siegbild (gemalt, je Epoche), Zahlen: Gefallene, Gefangene, Verfolgung, Erfahrung des Feldherrn | **Zurück zur Karte** | Ergebnis in Kampagnenwerte umrechnen |
| 6 | Rückkehr | kurzer Ladeschirm | – | Schlachtszene ganz freigeben, Kampagne neu aufbauen |

Regeln für den Ablauf:
- **Selbsterklärend:** Beim ersten Mal erklärt je Zustand eine einzige Zeile oben, was zu tun ist („Ziehe deine Einheiten in die helle Zone. Dann: Schlacht beginnen.“). Lange drücken = Erklärkarte wie überall.
- **Ausgang berechnen** bleibt immer möglich und nutzt dieselben Werte wie die echte Schlacht (gleiche Stärkeformel), damit beide Wege gleich fair sind.
- Siegbedingungen: alle Feinde fliehen oder fallen · Zeitlimit (Verteidiger gewinnt bei Ablauf, Standard 20 Min. Spielzeit) · Feldherr fällt = Moralschlag, nicht automatisch Niederlage.
- Spielstand: Während der Schlacht wird nicht gespeichert. Absturz/Neuladen → Schlacht wird automatisch berechnet (Hinweis im Protokoll).

---

## 2. Bedienung am iPad (Touch)

| Geste | Wirkung |
|---|---|
| ein Finger tippen auf Einheit/Karte | wählen |
| ein Finger tippen auf Gelände | gewählte Einheit geht dorthin |
| doppelt tippen auf Gelände/Feind | laufen bzw. angreifen |
| ein Finger ziehen von gewählter Einheit | Linie ziehen = Breite und Richtung der Aufstellung |
| ein Finger ziehen auf leerem Gelände | Kamera schieben |
| zwei Finger | drehen und zoomen |
| lange drücken | Erklärkarte |

Rechte Spalte (Menüknöpfe immer in einer Spalte): Formation · Halten/Angreifen · Sammeln (Feldherr) · Pause · Tempo. Keine Leiste mit 12 Symbolen.
Keine Oberfläche eines bestehenden Spiels nachbauen (feste Regel). Bildsprache wie die übrigen Menüs: gemalte Karten, Pergament/Bronze.

---

## 3. Arbeitspakete, Reihenfolge, Abhängigkeiten

Legende: **C** = Code in `dev/imperium.html` (in der Cloud machbar, Sonnet), **PC** = Pipeline am PC, **M** = Entscheidung/Test von Moritz.

| Nr | Paket | Art | hängt ab von | liefert für |
|---|---|---|---|---|
| S1 | Schlachtphase-Gerüst: Ein-/Ausstieg, Ladeschirm, Kampagnenszene abbauen/aufbauen, Rückfall auf alte Schlacht | C | – | alles |
| S2 | Gelände aus Provinz: Höhenfeld, Fluss/Furt, Wald, Dorf, Jahreszeit, Aufstellungszonen, Schlüsselstellen | C | S1 | S4, Hannibal-Sonderfelder |
| S3 | Figurenmotor aus Phase 0 übernehmen: Instancing, Animations-Textur laden, Detailstufen | C | S1 | S5 |
| S4 | Aufstellung + Steuerung (Touch, Spalte rechts) | C | S1, S2 | S6 |
| S5 | Grundkörper + Skelett Mensch (realistisch), 15 Clips, Backen | PC | Blender, Lizenzprüfung | S3-Inhalt |
| S6 | Kampfregeln: Formationen, Ermüdung, Ansturm, Nahkampf-Paare, Moral, Flucht/Verfolgung | C | S3, S4 | alles Spielerische |
| S7 | Pferd: Skelett, Clips, Reiter-Sitz | PC | S5 | Reiterei |
| S8 | Ausrüstung Antike (Kit-Familien A1–A8, siehe Profile) | PC | S5 | Hannibal |
| S9 | **Elefant** (vorgezogen für Hannibal): Skelett, 8 Clips, Panik-Regel | PC + C | S5, S6 | Hannibal |
| S10 | Ladebilder, Siegbilder, Einheitenkarten | PC (FLUX) | – (sofort möglich) | S1 |
| S11 | Stimmen: Feldherr- und Truppenrufe | PC (XTTS) | Profile Charaktere | S6 |
| S12 | Rollout Ep 1–2 (Wikinger, Franken, Angelsachsen, Byzanz, Araber) | PC + C | S6–S8 | Wikinger-Schlachten |
| S13 | Belagerungsschlacht (Mauern, Tore, Leitern, Türme) | C + PC | S6 | spät |
| S14 | Ep 3–4: Pulver, Kanonen, Karree, Linie | PC + C | S12 | Napoleon |

Kritischer Pfad: S1 → S3 → S6 (Code) und parallel S5 → S7/S8/S9 (PC). S10 und S11 sind unabhängig und können sofort laufen.

**Abhängigkeits-Befund:** Konzept Phase 4 sah „Elefant, Kamel, Geschütze zuletzt“ vor. Hannibal braucht Elefanten in Trebia, Cannae und Zama. Also Elefant (S9) direkt nach Pferd, Kamel und Geschütze bleiben spät.

**Befund 2:** Hannibal-Kampagne besteht aus Kartenmechanik (Pass, Fabius, Rat von Karthago, Abfall) und Schlachten. Nur die Schlachten hängen am neuen System. Vorschlag: Hannibal-Kampagne (Karte) jetzt bauen, die vier Sonderschlachten zunächst als „Ausgang berechnen“ mit Schlachtplan, Echtzeit-Fassung nachrüsten. Doppelte Arbeit entsteht dann nur bei den Schlachtplänen, nicht bei der Kampagne.

---

## 4. Datenformate

### 4.1 Truppenprofil (je Einheitentyp, `profile_truppen.json`)
```
{ "id":"libyer", "n":"Libysche Speerträger", "rolle":"spear", "epochen":[0,1], "kulturen":["punisch","berber"],
  "skelett":"mensch", "koerper":"m_mittel",                  // Grundkörper-Variante
  "kit":"A2_punisch_schwer",                                 // Ausrüstungs-Familie
  "teile":{"helm":"…","ruestung":"…","schild":"…","waffe":"…","neben":"…","umhang":"…"},
  "farben":["…","…"], "figuren":48, "formation":["phalanx","linie"], "standard":"phalanx",
  "clips":["stehen","gehen","laufen","stoss_speer","abwehr_schild","treffer","sterben_1","sterben_2","jubeln","fliehen"],
  "ruf":"punisch_fuss", "flux_karte":"Prompt für die Einheitenkarte (Englisch)", "hinweis":"historische Quelle/Unsicherheit" }
```
Grundrollen ohne Sondereinheit (Speer/Schwert/Fern/Reiter/Geschütz je Kulturgruppe und Epoche) bekommen ein Profil `basis_<gruppe>_e<N>_<rolle>`.

### 4.2 Charakterprofil (`profile_charaktere.json`)
```
{ "name":"Hannibal Barkas", "szenarien":["hannibal"], "rolle":"held", "kultur":"punisch", "epoche":0,
  "alter":28, "aussehen":"…", "ruestung":"…", "reittier":"pferd", "leibwache":"iberische Reiter",
  "eigenschaften":["taktiker","schnell"], "faehigkeit_schlacht":"Zange: Reiterei +Ansturm, wenn Feind gebunden",
  "stimme":"ruhig, tief", "rufe":["sammeln","angriff","sieg","rueckzug"], "portraet_vorhanden":"sc_hannibal_x1", "quelle":"Polybios, Livius" }
```

### 4.3 Schlachtpaket (Spiel)
- `bat/sk_mensch.json`, `bat/sk_pferd.json`, `bat/sk_elefant.json`: Skelett + Animations-Textur (je unter 1 MB, Schätzung).
- `bat/k_<kitfamilie>.json`: Körper + Teile (3 Detailstufen) + Textur-Atlas 1024² (Schätzung 1–3 MB je Familie).
- `bat/g_<landschaft>.json`: Bodentexturen und Bewuchs.
- Alle in `OFF_MAN`, Laden über `pkLoad`-ähnlich mit Fortschritt. Größe je Schlacht (2 Seiten, Gelände) Ziel unter 25 MB (Schätzung).

---

## 5. Inhalte: was es braucht

### 5.1 Clips Mensch (15, Mindestumfang)
stehen · gehen · laufen · stehen_bereit (Waffe vorn) · schlag_a · schlag_b · stoss_speer · abwehr_schild · treffer · sterben_vorn · sterben_hinten · werfen/schießen (Bogen, Schleuder, Speerwurf je eigene Variante → zählt als 3) · jubeln · fliehen.
Ep 3–4 zusätzlich: laden_muskete, feuern_stehend, feuern_kniend, bajonett.

### 5.2 Clips Pferd (10)
stehen · schritt · trab · galopp · ansturm (Galopp mit gesenktem Kopf) · steigen · treffer · sterben · Reiter-Sitzhaltung (Mensch-Clip „reiten“ + „schlag_reiter“ + „lanze_gesenkt“).

### 5.3 Clips Elefant (8)
stehen · gehen · ansturm · stampfen/zertrampeln · treffer · panik (dreht, läuft quer) · sterben · trompeten (stehend).

### 5.4 Ausrüstungs-Familien Antike (für Hannibal zuerst)
| Kit | Für | Kernteile |
|---|---|---|
| A1 römisch Manipel | Hastati/Principes/Triarier, Socii (Varianten) | Montefortino-Helm mit Federbusch, Kettenhemd/Brustplatte, großer ovaler Langschild (scutum), Kurzschwert, Wurfspeer (pilum) |
| A2 punisch-libysch | Libysche Speerträger | Helm (z. T. erbeutet römisch), Leinenpanzer/Kettenhemd, Rundschild, Stoßspeer |
| A3 iberisch | Scutarii, Caetrati | Sehnenhelm/Bronzehelm, weiße Tunika mit Purpursaum, Langschild bzw. kleiner Rundschild (caetra), Falcata |
| A4 balearisch | Schleuderer | keine Rüstung, Tunika, 3 Schleudern, Beutel |
| A5 numidisch | leichte Reiter | Tunika, kein Sattel/Zaum, kleiner Rundschild, Wurfspeere |
| A6 keltisch | Gallier, Boier, Insubrer | Hose, z. T. Oberkörper frei, langer Ovalschild, Langschwert, Kettenhemd bei Adel |
| A7 hellenistisch | Phalanx, Hopliten, Thureophoroi | Thrakerhelm, Linothorax, Rundschild/Ovalschild, Sarissa/Speer |
| A8 Kriegselefant karthagisch | Elefant mit Treiber (ohne Turm, nach Konzept) | Treiber mit Stachel, Decke |

Alles nach historischen Funden, keine Vorlagen aus Spielen (feste Regel).

### 5.5 Bilder (FLUX, sofort möglich)
- Ladebilder je Landschaft × Epochenstil: Ebene, Hügel, Wald, Gebirge, Fluss/Furt, Küste, Wüste, Steppe, Schnee = 9 × 3 (antik/mittelalterlich/neuzeitlich) = 27 Motive × 2 Varianten. Auftrag 41.
- Siegbilder/Niederlagebilder gibt es (`battle_win_*`, `battle_lose_*`), reichen vorerst.
- Hannibal-Sonderfelder (Ladebild): Trebia im Schnee, Trasimenischer See im Nebel, Cannae (Ebene, Staub, Sonne), Zama. In Auftrag 40 enthalten.

---

## 6. Prüfplan (pro Paket)
- Cloud: Playwright mit Software-Rendering: Ein-/Ausstieg, kein Speicherleck (Szene vor/nach gleiche Anzahl Geometrien), Ergebnis-Übernahme, alter Spielstand lädt. **Keine Bilder/s aus der Cloud berichten** (Software-Rendering, aussagelos).
- PC: `PW_GPU=1`, grobe Vergleiche.
- iPad (Moritz): Bilder/s an drei festen Kamerastellen, Ladezeit, 10 Minuten Dauerlast (Wärme). Ohne diesen Test gilt jedes Paket als „iPad nicht getestet“.

## 7. Offene Entscheidungen (Moritz)
1. Zeitlimit je Schlacht: 20 Minuten Spielzeit als Standard? (bei 2× Tempo 10 echte Minuten)
2. Tempo 2× erlauben oder nur 1× + Pause?
3. Einheitengröße auf „Mittel“: 40 Figuren je Einheit (bis 20 Einheiten je Seite ≈ 1.600 Figuren) – passt zum Messwert.
4. Hannibal-Kampagne jetzt (Karte), Echtzeit-Sonderschlachten später – einverstanden?
5. Elefant vorziehen (vor Kamel/Geschützen) – einverstanden?

## 8. Entscheidungen Moritz 29.10. 12:31
- Elefant vorziehen (S9 direkt nach Pferd): **ja**.
- Figuren baut **Moritz selbst am PC** (Blender, MPFB, CMU-Mocap). Claude liefert Regeln, Prüf- und Back-Skript: `dev/pc/figuren_bauen.md`. Damit verschieben sich S5/S7/S8/S9 auf Moritz' Zeitplan; Code-Pakete S1–S4, S6 laufen unabhängig davon mit Testfiguren aus Phase 0.
- Offene Punkte aus Abschnitt 7 (Zeitlimit, Tempo, 40 Figuren je Einheit) → Vorschläge gelten, bis Moritz etwas anderes sagt.
