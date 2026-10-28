# Audit Epochenwechsel (v172, base72.html)

Nur analysiert und getestet, am Spiel nichts geändert.

**Tests:** Desktop-Chromium mit Software-Grafik, 1024×700 mit Touch, Grafik „leicht“.
- **Rechnerlast:** Die Last lag die ganze Zeit bei 17 bis 23, weil parallel andere Läufe liefen. Alle Zeitangaben sind deshalb nur relativ zu verstehen. Ein iPad ist nicht getestet.
- **Skripte** (in `scratchpad/shot/`):
  - `epo_t.js`: echter Rundenweg. Pro Epoche wird `epochTurn` so gesetzt, dass die Höchstdauer erreicht ist. Danach folgen 2 weitere Runden, dann Speichern und Laden, dann noch 1 Runde.
  - `epo2_t.js`: Zustandstest.
  - `flash_t.js`: frische Seite, Welt laden, Städte zählen.
  - `epo_sum.py`: Auswertung.
- **Ergebnisse:** `shot/epo/*.json`, `*.log`, `*.jpg`.

## 1. Ablauf (Code)

**`checkEpoch`**
- Ab `epochTurn+40` darf der Spieler die neue Epoche ausrufen (`S.epGo`). Bedingung: 8 Techniken der Epoche, entweder selbst oder bei der Hälfte der Reiche.
- Spätestens bei `epochTurn+65` kommt der Wechsel automatisch.
- In Geschichten gibt es keinen Wechsel (`scenNoEpoch`).

**`doEpoch`, in dieser Reihenfolge:**
1. Buchkapitel und Besitz-Schnappschuss.
2. Das Jahr springt auf `EPOCHS[e].year`.
3. `dynJump`: Alle altern um höchstens 60 Jahre. Herrscher über 70 sterben, bis zu 4 Erbfolgen.
4. Die Horde wird aufgelöst.
5. Neue Provinzen werden aktiv und frei.
6. `religionTide`. Beim Spieler wird eine Glaubenswelle vorgemerkt, die KI folgt automatisch.
7. Spawns neuer Mächte.
8. Kolonien, nur bei e=3.
9. Nachfolgevölker: Die KI wechselt sofort, der Spieler wählt später.
10. `epochPend`: Übergang und Reform. Die KI würfelt, der Spieler wählt später.
11. `applyEpochLook` mit Städten, Straßen, Namen und Farbe.

**Präsentation danach im Rundenablauf:** `showBookNews` → `showEpochNews0` (Zeitalter, Schonfrist, Wahl des Volkes) → `faithWaveChoice` → `epochChoices` (Übergang, dann Reform) → Krisen-, Erzfeind- und Provinzmeldungen → Ereignisse.

## 2. Testergebnisse

| Lauf | Übergänge | Konsolenfehler | Datenfehler¹ | Laden direkt danach | Runden danach |
|---|---|---|---|---|---|
| Rom (neues Spiel) | 0→1→2→3→4 | 0 | 0 | ok, 0,7–1,9 s | alle ok |
| Qin (neues Spiel) | 0→1→2→3→4 | 0 | 0 | ok, 0,6–1,4 s | alle ok |
| Aksum (Startwelt 1) | 1→2→3→4 | 0 | 0 | ok, 0,8–1,6 s | alle ok |
| Azteken (Startwelt 3) | 3→4 | 0 | 0 | ok, 1,2 s | ok |
| Rom-Slot (Startwelt 2), Zustandstest | 2→3 | 0 | 0 | ok | ok |

¹ Geprüft habe ich:
- Provinzen ohne oder mit totem Besitzer, ohne Kultur oder ohne Glauben
- Bauwerte NaN oder negativ
- Heere an ungültigen oder inaktiven Orten, ohne Einheiten, doppelte IDs, Heere toter Reiche
- Gold NaN, unbekanntes Volk

Meine eigene Prüfung der Einheitenwerte war falsch formuliert. Die Meldung „Einheit?“ ist deshalb kein Befund.

**Weitere Ergebnisse:**
- **Rundendauer:** Der Zug mit Epochenwechsel dauerte unter dieser Last 16–57 s, normale Runden derselben Läufe 9–36 s. Der Wechselzug kostet also etwa das 1,5- bis 2,5-Fache einer normalen Runde.
- **Dialoge:** Pro Wechsel kommen 8 bis 12 Dialoge hintereinander: Buch, Zeitalter, Volkswahl, Glaube, Übergang, Reform, neue Macht, Bericht, Thronfolge, Kapitel der Geschichte, Ereignisse.
- **Spielstandgröße:** wächst je Epoche von 1,21 auf 1,34, 1,57 und 1,70 MB (Rom), bei Azteken in Epoche 4 auf 1,98 MB.
- **Zustandstest** (Startwelt 2, Rom-Slot, 2→3):
  - Tross, 2 Söldner, Statthalter, Glaubensbund und Krieg bleiben erhalten.
  - Die Söldner, die eine Runde vor dem Wechsel angeworben wurden, gelten danach als „veraltet“: 12 von 12 Einheiten.
  - Den Feldzug konnte ich nicht testen, weil es nach der Kriegserklärung keine Ziele über Land gab. Das Handelsabkommen ließ sich im Test nicht aufsetzen (`setTrade` ohne Wirkung). Beides gilt als **nicht getestet**.

## 3. Belegte Fehler und Auffälligkeiten (nach Priorität)

### P1: Alte Ersatzstädte beim Laden sichtbar (von Moritz gemeldet), Ursache bestätigt
- **Ursache:** Der Städte-Baukasten der Epoche (`models/kitN.json`, 0,52–0,63 MB) wird erst geladen, wenn `syncCities` ihn braucht (`loadKit` in `syncCities` und `syncCityKit`). Bis er fertig ist, zeichnet `syncCities` jede Stadt als prozedurale Ersatzstadt (`cityParts` → `c.mesh`). Danach tauscht es alle Städte aus. Beide Modelle liegen nicht gleichzeitig vor, man sieht sie nacheinander.
- **Messung** (`flash_t.js`, Startwelt 3, Azteken, frische Seite):
  - Auf der Startseite ist nur `kit0` geladen.
  - `kit3` wird erst 7,2 s nach Start der Welt angefordert.
  - Bei 16,9 s waren 14 von 14 sichtbaren Städten Ersatzstädte. Erst bei 61 s war der Baukasten da, alle 14 Städte stammten dann aus dem Baukasten.
  - Der Hauptthread hing dazwischen etwa 44 s. Das Dekodieren lief unter Last, das Fenster ist auf echter Hardware kürzer.
- **Beim Wechsel im laufenden Spiel** trat das Problem in allen Läufen nicht auf: `kitT` = 0 ms, 0 Ersatzstädte. Der Baukasten war jeweils schon geladen. Getestet in einer langen Sitzung, die frische Seite ist der kritische Fall.
- **Vorschlag:**
  - Den Baukasten der Spielstand-Epoche laden, bevor `loadGame` bzw. `startWorld` die Karte zeigt. Den Ladebildschirm „Welt wird vorbereitet“ so lange stehen lassen.
  - Ab etwa Runde `epochTurn+35` `loadKit(ep()+1)` im Hintergrund vorladen.
  - Solange `KIT[ep()]` fehlt, Städte unsichtbar lassen statt die Ersatzstadt zeigen. Nur wenn das Laden fehlschlägt, auf die Ersatzstadt zurückfallen.
  - Zusätzlich: `kit0` nicht laden, wenn ein Spielstand einer späteren Epoche geladen wird. Das spart 0,6 MB.

### P1: Falsches oder europäisches Kapitelbild bei nicht-europäischen Völkern
- **Befund:** Die Azteken in Startwelt 3 starten mit dem Kapitel „Die Herren von Anáhuac“. Das Kinobild zeigt ein europäisches Kloster-Skriptorium mit christlichem Altar (`ep_3.webp`), Screenshot `shot/epo/flash_w3_ende.jpg`.
- **Ursache:**
  - Das Kapitel verlangt `img:"vg_azteken_3"` aus dem neuen Paket `pk_vg`.
  - `cineImgs` → `heroImg(key,…,false)` liefert `null`, solange das Paket nicht geladen ist. Es stößt dann nur das Laden an.
  - Beim ersten Kapitel ist das Paket noch nicht da. Übrig bleibt der allgemeine Rückfall `img/ep_${ep()}.webp`, und der ist europäisch.
  - Dasselbe Bild erschien bei Rom/Italien in Epoche 3, dort passt es.
- **Vorschlag:**
  - Vor dem Abspielen der Kinoszene die nötigen Pakete abwarten, mit kurzer Frist von 2–3 s.
  - Den Rückfall `ep_N` je Kulturraum wählen, etwa über `oa_*` oder `av_*`, oder ganz weglassen.

### P2: Wechsel des Volkes ändert die Kultur, aber nicht Glaube und Herrscherhaus
- **Befund:** Die Wahl des Volkes sagt „Es ändern sich nur Name, Farbe und Einheitennamen“. Tatsächlich ändert sich auch `facCul`. Beispiele aus den Läufen:

| Volk vorher | Volk nachher | Kultur | Glaube | Herrscher |
|---|---|---|---|---|
| Azteken | Mexiko | indigen → iberisch | Staatsglaube `meso` bleibt | Tezozomoc, 70 |
| Aksum / Medri Bahri | Fundsch, ein Sultanat | habescha → afrikanisch | Staatsglaube Tewahedo bleibt | Tekle Haymanot |
| Qin | Nördliche Liang → Früheres Shu → Shun-Dynastie (1500) → Pingnan Guo (1790) | – | – | Haus „Ying“ über 1500 Jahre (Ying Jun → Ying Lang → Ying Biao) |

- **Zeitliche Unstimmigkeiten:** Die Shun-Dynastie entstand 1644, Pingnan Guo 1856. Beide werden in der Epoche ab 1500 bzw. ab 1790 angeboten.
- **Einordnung:** Das Testskript klickte die letzte Option. Angeboten wird zuerst „… bleiben“. Die Liste enthält also auch kulturell oder zeitlich unpassende Nachfolger.
- **Vorschlag:**
  - Den Hinweistext korrigieren: Die Kultur ändert sich, also auch Stadtbild und Gebäude.
  - Bei einem Wechsel in einen anderen Kulturkreis eine Glaubens-Rückfrage anbieten oder solche Nachfolger aus `successorOptions` filtern.
  - Wenn das Volk wechselt, optional ein neues Herrscherhaus anlegen.
  - `REG[*].p` auf Jahreszahlen prüfen, etwa `shun_d` und `pingnan`.

### P2: Dialogkette beim Wechsel ist lang
- **Befund:** 8 bis 12 Dialoge in Folge, siehe die Klicklisten in `shot/epo/*.json`. Dazu kommt in derselben Runde das Kapitel der neuen Geschichte als Kinoszene. Für Einsteiger ist das viel.
- **Vorschlag:** Ein Epochen-Bildschirm mit Schritten 1–4: Rückblick, Volk, Glaube, Übergang und Reform. Thronfolge, neue Mächte und „Bericht“ werden darin zusammengefasst. Kapitel und Ereignisse kommen erst in der nächsten Runde.

### P2: Kopfleiste bei 1024 px Breite überlappt
- **Befund:** Bei Gold steht „G…“, und der Goldbetrag läuft in die Jahreszahl hinein: „344400 n. Chr.“, „7291790 n. Chr.“. Die Jahreszeit „Herbst“ liegt über dem Symbol „Reich“ bzw. „Wirtschaft“. Belegt in allen Screenshots `shot/epo/*_nach.jpg`, etwa `rom_e1_nach.jpg` und `qin_e4_nach.jpg`.
- **Einordnung:** Das betrifft jede Runde, nicht nur den Wechsel. Es fiel hier auf, weil die Kopfleiste mit dem Epochennamen breiter wird („NAPOLEONISCHES …“). Kleinere iPads im Querformat sind betroffen.

### P3: Reiche „leben“ einen Zug lang ohne Land
- **Befund:** Direkt nach dem Wechsel gibt es Reiche ohne Hauptstadt: zhao, gojoseon, qi, xiongnu, funan, bithynien, rouran, pagan, aulac. Bis zur übernächsten Runde verschwinden sie, die Zahl lebender Reiche sinkt um 2 bis 5.
- **Ursache:** Spawns und aktivierte Provinzen übernehmen ihr Land.
- **Einordnung:** Kein Absturz. Der Bericht „Neue Mächte“ nennt aber nicht, wer dabei untergeht.
- **Vorschlag:** In `doEpoch` diese Reiche sofort sauber beenden und unter „Wandel“ aufführen.

### P3: Bild eines Feldherrn mit NaN
- **Befund:** `404 img/gp_e2_NaN.webp` im Rom-Lauf.
- **Ursache:** `genPortrait` bzw. ein Porträt mit `p.face` undefiniert (`${G.face%2}`). Welcher Feldherr betroffen war, ist nicht ermittelt. Beim Prüfen der Heere nach dem Wechsel hatten alle `gen.face`.
- **Vorschlag:** `(G.face|0)%2`.

### P3: Textfehler (beim Test gesehen, nicht nur beim Wechsel)
- „Dahlak Kebir ist jetzt eine Marktflecken“: Der Titel der Wachstumsmeldung hat fest „eine“ eingebaut. Bei Marktflecken, Dorf und Stadt stimmt der Artikel nicht immer. Vorschlag: Artikel je Stufe.

### Nicht reproduziert, Verdacht aus dem Code
- **Spielerheere in Spawn-Provinzen:** Spawns entfernen nur KI-Heere in ihren Provinzen. Ein Spielerheer, etwa bei einer Belagerung, bleibt in der nun fremden Provinz, ohne Krieg mit der neuen Macht. Ein laufender Belagerungseintrag (`S.sieges`) wird nicht bereinigt.
- **Altern:** `dynJump` begrenzt das Altern auf 60 Jahre. Bei Startwelten mit großem Jahressprung bleibt dieselbe Familie über Jahrhunderte. Das ist gewollt, wirkt aber bei Volkswechseln seltsam, siehe P2.

## 4. Was gut funktioniert
- Kein Absturz und kein Konsolenfehler in 12 Übergängen bei 4 Völkern. Jeder Spielstand direkt nach dem Wechsel ließ sich laden und weiterspielen.
- Namen von Städten und Provinzen, Kartenfarbe und Baukasten wechseln korrekt. Die Schonfrist und die Modernisierung zum halben Preis werden erklärt.
- Glaubenswelle mit Wahl, Übergang und Reform greifen. Tross, Söldner, Statthalter, Glaubensbund und Kriege überstehen den Wechsel.

## 5. Empfohlene Reihenfolge
1. Baukasten vorladen bzw. Städte bis zum Laden ausblenden (P1, klein).
2. Kinobilder: Pakete abwarten und den europäischen Rückfall ersetzen (P1, klein).
3. Kopfleiste bei 1024 px (P2, klein).
4. Hinweis zur Kultur beim Volkswechsel korrigieren und Nachfolger filtern (P2, mittel, Datenpflege).
5. Epochen-Dialoge bündeln (P2, mittel).
6. P3-Kleinigkeiten: untergegangene Reiche, NaN-Porträt, Artikel im Text, Spawn-Heere.
