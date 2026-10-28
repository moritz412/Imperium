# Bedienung und Einsteigerfreundlichkeit – Bestandsaufnahme und Konzept

Stand: v170 (`scratchpad/base70.html`). Ich habe nur gelesen und Screenshots gemacht, am Spiel ist nichts geändert.

**Screenshots** in `scratchpad/shot/bed/`:
- `phone_*`: Handy quer, 844×390, Touch, mit Viewport-Meta wie im Artifact und in der App
- `ipad_*`: iPad quer, 1180×820
- Situationen: `0start` (Startmenü), `1heer_ziel` (Heer gewählt, Ziel neben Feind), `2hof` (Hof), `3wirtschaft` (Wirtschaft), `4diplomatie` (Diplomatie), `5uebersicht` (Übersicht), `6provinz` (Provinz), `7stadt` (Stadtansicht)
- Skript: `shot/bed_shots.js`

---

## 1. Ist-Stand: konkrete Probleme

### A. Heer bewegen und angreifen

**A1. Die Angriffsmarke verschwindet unter Heer-Marken.** Das ist Moritz' Beispiel.
- Das Etikett am Wegende („Angriff“, „Diese Runde“, „Nächste Runde“) ist `#pathlab`.
- Es wird einmal früh in `#labels` angehängt (`labelsEl.appendChild(pathLab)`, etwa Z. 14211) und hat keinen z-index.
- Die Heer-Marken `.achip` werden später angehängt (`makeToken`) und liegen deshalb im DOM darüber. Die Ereignis-Marken `.hmark` haben `z-index:2` und liegen ebenfalls darüber.
- Das Etikett sitzt genau am Zielpunkt (`syncPath`, `pathLabPos`), also dort, wo die gegnerischen Heer-Marken stehen.
- Beleg: `ipad_1heer_ziel.jpg`. „Diese Ru…“ ist von der Marke „2 ×13“ verdeckt.

**A2. Der Bestätigungsknopf „Angreifen“ bzw. „Marschieren“ steht ganz unten im Heer-Blatt.**
- Reihenfolge in `renderSheet`, Modus `move` (Z. ~15153–15168): Titel, Feldherr-Kasten, alle Einheitenkarten, Bewegungsbalken. Erst danach kommen `mvcard` und der Knopf `data-act="go"`.
- Auf dem Handy ist das Blatt 342 px breit und steht rechts. Man sieht nur den Feldherrn (`phone_1heer_ziel.jpg`). Der Knopf ist erst nach langem Scrollen erreichbar.

**A3. Bestätigt wird durch „nochmal antippen“, ohne sichtbaren Knopf am Ziel.**
- `onProvinceTap`, Modus `move`: Der erste Tipp setzt `UI.preview`, der zweite Tipp auf dieselbe Provinz löst `marchTo` aus.
- Der Hinweis „Nochmal antippen zum Bestätigen“ (`renderHint`) steht oben rechts weit weg vom Ziel. Auf dem Handy liegt er über der Karte und den Heeren (`phone_1heer_ziel.jpg`).
- Ein Fehltipp knapp daneben wählt eine andere Provinz als Vorschau. Ein Tipp außerhalb der Reichweite wählt das Heer ab („Außer Reichweite: Heer abgewählt“).

**A4. Ein Heer lässt sich nur an der kleinen Marke ziehen, nicht an der Figur.**
- `armyChipDown` startet `cand:'march'` nur auf `.achip`. Die Marke ist 26 px hoch, die Trefferfläche wird über `::after inset:-8px` auf etwa 42 px erweitert.
- Wer auf die 3D-Figur drückt und zieht, verschiebt die Karte (`startDrag` → `pan`). Die Figur kann man nur antippen (`armyFigAt` in `tapAt`), nicht ziehen.

**A5. Mehrere Heere in einer Provinz überlappen sich.**
- `syncTokens` versetzt sie nur um `0.26` Welteinheiten (`sameSpot*0.26`) bzw. auf `SLOT`-Plätze. Bei weiter Kartenansicht liegen die Marken übereinander.
- Zusammen mit Stadtnamen (`.plabel`) und Ereignismarken (`.hmark`) ist das Antippen dann Glückssache.

**A6. Die Gesten sind kaum zu entdecken.**
- Langes Drücken (430 ms) zeigt Infos (`holdAt`/`holdInfo`).
- Mit zwei Fingern dreht man die Karte (nur bei kleinen Winkeln `<0.3`).
- In der Schlacht gibt es Lasso, Pfad und Front.
- Erklärt wird davon fast nichts, die Einführung nennt nur Ziehen und Zoomen.

**A7. Kein Rückgängig.** Ein versehentlicher Marsch kostet die Bewegung für die ganze Runde.

### B. Bildschirmaufteilung

**B1. Auf dem Handy quer bleibt wenig Karte** (`phone_6provinz.jpg`).
- Kopfleiste: 67 px.
- Blatt rechts: 342 px, also 40 % der Breite.
- Die Aufgaben-Chips `#todo` belegen links 404×170 px in 4 bis 5 Reihen.
- Sichtbar bleibt grob ein Drittel der Karte.

**B2. Der Umschalter „Alte Welt / Ostasien“** (`#thSel`) liegt bei 844 px Breite über dem Kopf des Blatts („Legio I“, „Latium“). Die Regel aus v170 greift erst unter 700 px.

**B3. Stadtansicht auf dem Handy:** `#cityPanel` liegt über dem noch offenen Blatt. Man sieht zwei Ebenen gleichzeitig (`phone_7stadt.jpg`).

**B4. Kopfleiste auf dem Handy:**
- Reich, Wirtschaft, Hof und Chronik erscheinen nur als Symbole ohne Beschriftung.
- Dazu kommen Bedrohungen, Erzfeind, Forschung („Wählen“) und Menü, insgesamt 9 Knöpfe.
- Für Einsteiger ist nicht erkennbar, was hinter Thron, Glocke, Lorbeer oder Truhe steckt.

### C. Fenster und Orientierung

**C1. Viele Reiter:** Hof und Wirtschaft haben je 7 Reiter (`phone_2hof.jpg`, `ipad_3wirtschaft.jpg`). Diplomatie und Übersicht sind ähnlich dicht.

**C2. Doppeltes Schließen:** Jedes Fenster hat ✕ oben rechts und unten einen großen Knopf „Schließen“. Auf dem Handy kostet das etwa 60 px. Im Hof bleibt dadurch eine einzige Inhaltszeile sichtbar.

**C3. Kein Ort für „Wo finde ich …?“** Hilfe gibt es nur als Liste im Menü (Z. ~15429). Die Fenster haben keine Kurzhilfe.

### D. Einstieg

**D1. Die Einführung `TUT` (Z. 10776) besteht aus 7 Texttafeln ohne Handlung.** Teile sind veraltet:
- Sie sagt „unten siehst du“ für das Blatt, das quer aber seitlich steht.
- Sie nennt „das Buch oben rechts“ für die Forschung, der Knopf heißt jetzt „Wählen“.
- Die Schritte warten nicht darauf, dass der Spieler etwas tut.

**D2. Nach der Einführung führen nur die Aufgaben-Chips** („2 Heere ohne Befehl“ und Ähnliches). Das ist gut, aber auf dem Handy nehmen sie zu viel Platz weg (siehe B1).

**D3. Ratsvorschläge sind hilfreich.** Ihr 🗺-Knopf ist neu und noch nicht in der Einführung erwähnt.

---

## 2. Maßnahmen

| # | Maßnahme | Nutzen | Aufwand | Risiko |
|---|---|---|---|---|
| M1 | **Befehlsblase am Ziel:** Ist ein Ziel gewählt, erscheint über dem Ziel ein großer Knopf, mindestens 44 px, mit z-index über allen Marken. Er zeigt „⚔ Angreifen · Aussicht 72 %“, „Marschieren · diese Runde“ oder „Marschziel · 2 Runden“, dazu daneben ein ✕. Ersetzt das versteckte `#pathlab` (A1) und das Nochmal-Antippen (A3). Das Doppeltippen auf die Provinz bleibt als Abkürzung | Größter Gewinn: Angriff ist immer sichtbar und mit einem Tipp erreichbar | S–M | Gering. Die Blase darf nicht unter die Kopfleiste oder das Blatt rutschen, also an den Bildschirmrand klemmen |
| M2 | **Heer-Blatt im Zielmodus umsortieren:** Zielkarte und Knöpfe ganz oben und fest stehend, Einheitenkarten darunter einklappbar | Kein Scrollen mehr bis zum Befehl (A2) | S | Keins |
| M3 | **Figur ziehen = marschieren:** `pointerdown` auf eine eigene Figur (`armyFigAt`) startet `cand:'march'` statt Kartenverschiebung. Trefferfläche der Marken auf 44 px | Bewegen wie mit einer Spielfigur (A4) | S | Wer die Karte über einem eigenen Heer verschieben will, zieht jetzt das Heer. Abhilfe: Ein Marsch startet erst nach 120 ms Halten oder nur bei ausgewähltem Heer |
| M4 | **Gestapelte Heer-Marken:** mehrere Heere einer Provinz als eine Marke „3 Heere“. Antippen fächert sie auf | Kein Fehltippen mehr bei Häufungen (A5) | M | Darstellung in Schlachten und Belagerung prüfen |
| M5 | **Rückgängig für die letzte Bewegung:** nur wenn keine Schlacht, keine Entdeckung und kein Ereignis ausgelöst wurde. Gilt bis zur nächsten Aktion oder dem Rundenende. Knopf „↶“ in der Befehlsblase oder Toast | Nimmt die Angst vor Fehltipps (A7) | M | Muss Bewegung, Position und Haltung sauber zurücksetzen. Nicht im Mehrspielermodus |
| M6 | **Handy quer:** schmaleres, einklappbares Blatt (etwa 300 px, ein Griff zum Wegschieben). Die Aufgaben-Chips werden zu einem Knopf „Aufgaben (5)“, der aufklappt. `#thSel` wandert in das Ansichtenmenü (`#modeBtn`) oder unter 900 px nach oben links | Doppelt so viel sichtbare Karte (B1, B2) | M | Layouttests bei 390, 844, 1180 und 1366 px |
| M7 | **Kurze Beschriftung unter jedem Symbol in der Kopfleiste**, auch auf dem Handy (11 px). „Wählen“ wird zu „Forschung“. Bedrohungen und Erzfeind kommen zusammen in einen Knopf „Lage“ | Orientierung (B4) | S | Platz in der Kopfleiste. Bei unter 700 px nur noch Symbole plus Hilfe-Overlay |
| M8 | **Fenster aufräumen:** unteren „Schließen“-Knopf auf dem Handy weglassen (✕ und Wischen genügen). Reiter mit Symbolen und waagerechtem Scrollen. Je Fenster ein „?“ mit 2–3 Sätzen, was man hier tut | Mehr Inhalt sichtbar, schneller zurechtfinden (C1–C3) | M | Keins. Reiter-Zahl selbst bleibt, das ist eine Inhaltsfrage für Phase 2 |
| M9 | **Geführter erster Zug statt Texttafeln:** 5 Schritte, die auf Handlungen warten. Heer antippen, freien Stamm angreifen (Befehlsblase), Gebäude bauen, Forschung wählen, Runde beenden. Jeder Schritt markiert das Ziel. Danach 3 Tipps beim ersten Auftreten: Langes Drücken = Info, Figur ziehen = Marsch, Rat-🗺. Texte aktualisieren | Einstieg verstehen durch Tun (D1, A6) | M | Muss abbrechbar sein und darf Geschichten-Intros nicht stören |
| M10 | **Einsteiger-Modus** in den Einstellungen (Standard an für neue Spiele): größere Marken, Befehlsblase immer, Bestätigung vor Krieg, Tipps beim ersten Mal. Erfahrene schalten ihn ab | Ein Schalter statt vieler | S (nach M1–M9) | Zwei Bedienwege müssen gepflegt werden |
| M11 | **Stadtansicht auf dem Handy:** Blatt beim Öffnen einklappen, Stadtpanel als einzige Ebene (B3) | Übersicht | S | Keins |

Nicht übernommen: Menüs oder Abläufe nach dem Vorbild bekannter Spiele. Die Lösungen bauen auf den vorhandenen Elementen auf (Blatt, Marken, Ratsvorschläge, Aufgaben-Chips).

---

## 3. Phasen

**Phase 1 (ein Lauf, größter Gewinn):**
- M1 Befehlsblase, behebt auch die verdeckte Angriffsmarke
- M2 Heer-Blatt umsortieren
- M3 Figur ziehen und größere Trefferflächen
- M5 Rückgängig für die letzte Bewegung, nur bei einfachen Bewegungen
- M6 Handy-Layout: Aufgaben-Knopf, schmaleres einklappbares Blatt, `#thSel`
- M7 Beschriftungen in der Kopfleiste
- M11 Stadtansicht auf dem Handy
- Einführungstexte aktualisieren (Vorstufe von M9)

Prüfung: Screenshots bei 390, 844, 1180 und 1366 px; Playwright-Test für Blase, Ziehen der Figur und Rückgängig; smoke, fz_t, sold_t. iPad-Test durch Moritz.

**Phase 2:**
- M4 gestapelte Marken
- M8 Fenster und Kurzhilfe
- M9 geführter erster Zug
- M10 Einsteiger-Modus
- Danach eine Reiter-Prüfung je Fenster: Was wird selten gebraucht und kann zusammengelegt werden?

---

## 4. Entscheidungsfragen an Moritz

1. **Wie wird ein Ziel bestätigt?**
   - a) **Befehlsblase am Ziel, ein Tipp** (Empfehlung). Doppeltippen auf die Provinz bleibt als Abkürzung.
   - b) Wie bisher zweimal tippen, nur mit besser sichtbarem Etikett.
   - c) Sofort ausführen ohne Bestätigung. Schnell, aber fehleranfällig auf Touch.
2. **Rückgängig für Bewegungen ohne Kampf?**
   - **Ja** (Empfehlung). Nur die letzte Bewegung, nur solange nichts ausgelöst wurde, nicht im Mehrspielermodus.
   - Nein.
3. **Handy quer: wohin mit dem Infoblatt?**
   - a) **Rechts, schmaler und einklappbar** (Empfehlung). Die Karte bleibt links frei, das Blatt ist mit dem Daumen gut erreichbar.
   - b) Als untere Schublade. Bei 390 px Höhe bleibt dann aber kaum Karte.
