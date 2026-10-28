# Konzept: Berater-Stimmen und Chronik als Buch (Stand v129, nur gelesen, kein Code geändert)

---------------------------------------------------------------------------------------------------
## A) BERATER-STIMMEN

### A1. Ist-Stand

**Rat (Hof → Rat)**
- `RAT_RULES` (19 Regeln) erzeugen in `ratRound(f)` je Runde bis zu 2 neue Vorschläge, höchstens 3 gleichzeitig. Es gibt einen Sprecher je Amt und Abklingzeiten `cd` von 4 bis 20 Runden. Die Option `hofOpt().rat` hat die Werte `norm`, `dring` und `aus`.
- **Sprecher:** `ratSpeaker(f,o)`. Der Diplomat spricht erst ab Königsrang und wenn er ernannt ist, sonst übernimmt der Kanzler. Gewichtung: `TR2` (Kühn, Fromm, Kaufmännisch …) über `minEff`.
- **Sprach-Haken existiert schon:** `ratRound` setzt `vo:`rat_${sp.o}_${p.vo||r.id}_01``. Er wird aber nirgends abgespielt.
- **vo-Werte der Regeln:**
  - Kanzler: `waren_mangel`, `kasse_knapp`, `route_voll`, `kasse_voll`
  - Marschall: `grenze_gefahr`, `ruestung_mangel` (3 verschiedene Texte, nämlich Pulver kaufen, Pulvermühle und Waffen, alle mit derselben id), `garnison` (Regel kaserne)
  - Diplomat: `handel_partner`, `frieden_rat`, `buendnis`
  - Gelehrter: `forschung`, `glaube` (Tempel), `schreibstoff`
  - Statthalter (Amt „Reichsverweser“): `region_ohne`, `statthalter_untreu`, `aufstieg`, `unruhe`, `bauplatz`, `doc_<bau>` (30 Doktrin-Texte in 14 Kulturgruppen, `DOCTRINE`)
- **Ämter (`OFFICES`):** kanzler, marschall, gelehrter, baumeister, diplomat, heermeister, statthalter (Reichsverweser).
  - Baumeister und Heermeister geben keine Vorschläge.
  - Die Namen sind kulturabhängig (`offName`: orient, indisch, ostasiatisch, meso, anden …).
  - Minister haben kein Geschlecht (`newMinister`: Name, Fähigkeit, Eigenschaft, `face`).
- **Statthalter-Bericht:** `govReport(f)` läuft alle `hofOpt().rep` = 5 Runden und erzeugt `S.govRep` sowie eine Zeile im Protokoll. Inhalt: Bauten, Gold, Feste, Sorge („Unruhe in …“, „… braucht …“, „Abfall droht!“).
- **Zusätzlich:** `advisorHints` (Zeile ~10344), textuelle Tipps ohne Stimme.

**Vertonung (`NARR`, Zeile ~8915)**
- `speak(keys,text)` sucht den Schlüssel in einem Paket `audio/x_<sid>.json` (`{schlüssel: mp3 base64}`) aus `X_PACKS`, sonst liest die Gerätestimme (TTS).
- Die sid wird aus dem Schlüssel abgeleitet: `chronik_*` ergibt chronik, `stE*` den Präfix, sonst wird `_intro|_ende|_kN` abgeschnitten.
- Ein festes, beim ersten Antippen freigeschaltetes Audio-Element (`AEL`) erlaubt verzögertes Abspielen auf dem iPad. `AUDIO.duck(true/false)` senkt die Musik ab.
- **Einstellungen `cfg`:** auto, rec, rate, cineMute.
- **Größen:** x_caesar.json 3,7 MB mit 12 Clips, also etwa 300 KB je Clip (lange Erzähltexte, etwa 30–40 s). Daraus ergeben sich rund 8–10 KB base64 je Sekunde.
- **PC-Weg:** XTTS v2 mit Sprecher „Damien Black“ (Erzähler), danach packt xpack.py zu `x_<id>.json`.

**Dateigrenze:** Das Artifact ist auf 512 Dateien begrenzt und liegt derzeit bei etwa 500. Berater-Stimmen dürfen also höchstens 1–2 neue Dateien brauchen.

### A2. Konzept

**Grundsatz:** Die Stimme spricht einen kurzen, allgemeinen Satz (2–5 s). Namen, Zahlen und Orte stehen weiter nur auf der Ratskarte. So bleiben die Clips fest und wiederverwendbar.

**Rollen und Stimmen (XTTS v2 Studio-Sprecher, Proben auf dem PC nötig)**

| Rolle | Charakter | Vorschlag Sprecher (XTTS) | Alternativen |
|---|---|---|---|
| Kanzler | ruhig, gesetzt, etwas besorgt | Viktor Eka | Ludvig Milivoj |
| Marschall | kurz, hart, laut | Baldur Sanjin | Craig Gutsy |
| Gelehrter | alt, bedächtig | Ludvig Milivoj | Torcull Diarmuid |
| Diplomat | glatt, höflich | Andrew Chipper | Xavier Hayes |
| Statthalter (Reichsverweser) | sachlich, verwaltend | Gilberto Mathias | Royston Min |
| Regionsstatthalter (Berichte) | eigene Stimme, damit klar ist, dass es nicht der Rat ist | Aaron Dreschner | Kumar Dahl |
| (Erzähler bleibt) | | Damien Black | – |

- Die Namen der XTTS-Sprecher habe ich aus dem Gedächtnis aufgeführt. Vor dem Lauf muss `tts.speakers` auf dem PC die tatsächliche Liste liefern. Zuerst eine Probe mit 6 Sätzen machen und Moritz vorspielen.
- **Kulturraum-Stimmen** (Akzent oder andere Sprecher je Region) würden die Clips ×10 vervielfachen. Nicht in Phase 1. Stattdessen sind die Doktrin-Sätze kulturspezifisch, siehe Phase 2.
- **Anrede:** einheitlich „Hoheit“. Das passt für Herrscher und Herrscherinnen und wirkt in allen Kulturen nicht falsch, anders als Sire, Khan oder Sultan.

**Wann spricht ein Berater (damit es nicht nervt)**
1. **Rat öffnen:** Der Sprecher des dringendsten Vorschlags sagt seinen Vorschlagssatz. Gibt es keinen, folgt eine Begrüßung, aber höchstens alle 5 Runden.
2. **Neuer dringender Vorschlag** (`urg ≥ 3`, etwa Grenze in Gefahr, Aufruhr, Kasse leer) bei Rundenbeginn: ein Satz, höchstens 1 pro Runde.
3. **Annehmen oder Ablehnen** in der Ratskarte: eine kurze Reaktion („Eine weise Entscheidung.“), aber nur in 1 von 3 Fällen.
4. **Ereignisse** (Sieg, Niederlage, Stadt erobert oder verloren, Frieden, Entdeckung, Epoche, Wunder): höchstens 1 pro Runde, Priorität nach Gewicht.
5. **Statthalter-Bericht** alle 5 Runden: ein Satz je nach Lage (gut, Sorge, Kasse, Mangel, Abfall).
6. **Nie** während einer Kinoszene, eines Geschichten-Intros, einer Vorlese-Erzählung oder einer Schlacht. NARR prüft „läuft schon etwas?“. Berater-Clips haben niedrigere Priorität und werden verworfen, nicht eingereiht.
7. **Abklingen:** dieselbe id frühestens nach 10 Runden. Gibt es Varianten `_01`/`_02`, wechseln sie sich ab.
8. **Kein Rückfall auf die Gerätestimme** für Berater, weil kurze Robotersätze stören. Fehlt ein Clip, bleibt es still.

**Einstellungen** (Hof → Rat und Einstellungen → Ton)
- Beraterstimmen: An / Nur Dringendes (Standard) / Aus
- Lautstärke Stimmen: Regler 0–100 % (gilt für Erzähler und Berater, über AEL.volume)
- Reaktionen auf Annehmen und Ablehnen: an/aus (Standard aus, wenn „Nur Dringendes“)

**Technik**
- **Neue sid `rat`:** `X_PACKS.add('rat')`. Die Schlüsselableitung in `speak` bekommt eine Ausnahme: `/^rat_/` ergibt `rat`. Eine Datei `audio/x_rat.json`.
- **Größe:** Phase 1 hat 88 Clips × 3–4 s × ~9 KB/s, also etwa **2,5–3,5 MB**. Bei kleinerer Bitrate (mp3 32 kbit/s mono, reicht für Sprache) etwa 1,5–2 MB.
- **Laden:** erst beim ersten Öffnen des Rats oder beim ersten dringenden Vorschlag (`NARR.pre('rat')`), nicht beim Spielstart.
- **Phase 2:** Doktrin-Sätze kommen in eine zweite Datei `audio/x_ratdoc.json`. Insgesamt sind es dann 2 neue Dateien.
- **Neue Funktion** `ratVoice(id)`: prüft Einstellung, Abklingzeit und „läuft schon etwas“, wählt die Variante und ruft `NARR.speak([id],'',{noTTS:true,prio:'low'})`. `speak` braucht dafür eine Option `noTTS`, damit nicht die Gerätestimme einspringt.
- **Datenfehler beheben:** `ruestung_mangel` in `ruestung_pulver`, `ruestung_muehle` und `ruestung_waffen` aufteilen. Drei verschiedene Texte teilen sich sonst eine Aufnahme.
- **Fallback-Sprecher:** Spricht der Kanzler statt des Diplomaten, lautet der Schlüssel `rat_kanzler_handel_partner_01`. Diese 3 Clips liegen im Kanzler-Satz bei.
- **Ereignis-Haken:** `chronAdd` wird schon an den richtigen Stellen aufgerufen (Sieg, Eroberung, Verlust …). Ein Aufruf `ratVoice` in `chronAdd` je nach `k` deckt die meisten Ereignissätze ohne neue Haken ab. Ergänzt werden nur Frieden, Entdeckung, Epoche und Wunder.

**Satzliste:** `scratchpad/berater_saetze.json`, 88 Sätze (Felder `id`, `rolle`, `text`, `gruppe`, `phase`):

| Gruppe | Anzahl |
|---|---|
| Vorschläge | 37 |
| Kanzler statt Diplomat | 3 |
| Begrüßung | 10 |
| Reaktionen ja/nein | 10 |
| Warnungen | 10 |
| Ereignisse | 12 |
| Statthalter-Berichte | 6 |

- Die ids folgen dem vorhandenen Haken `rat_<amt>_<vo>_<nn>`.
- Die Sprecherzuordnung erfolgt über `rolle` mit der Tabelle oben.
- Phase 2 (nicht in der Datei): 30 Doktrin-Sätze aus `DOCTRINE` ohne `{p}`, gesprochen vom Statthalter.

**Aufwand**
- PC: etwa 90 Clips à ~10–20 s XTTS, also 20–40 min Rechenzeit. Probe vorher.
- Code: M (ratVoice, NARR-Erweiterung, Einstellungen, Aufteilung von ruestung, Ereignis-Haken).
- Risiko: Nervfaktor. Abhilfe ist „Nur Dringendes“ als Standard und höchstens 1 Satz pro Runde.

### A3. Empfehlung
- **Phase 1:**
  - 5 Ratsstimmen und die Regionsstatthalter-Stimme mit 88 Sätzen
  - Einstellungen: Standard „Nur Dringendes“, kein Gerät-TTS
  - eine Paketdatei
  - Aufteilung von ruestung
- **Phase 2:**
  - 30 Doktrin-Sätze in Kulturfarbe (zweite Paketdatei)
  - Porträts aus Paket 11 (`hof_berater_*`, `hof_statthalter_*`) auf der Ratskarte, mit leichter Mundbewegung bzw. Puls beim Sprechen
  - Baumeister und Heermeister mit eigenen Vorschlägen
  - optional: Priester-Rolle zusammen mit dem Glaubenspaket, wenn geistliche Häupter kommen

### A4. Entscheidungsfragen
1. **Wie oft sollen Berater sprechen (Standard)?**
   - a) Nur Dringendes und beim Öffnen des Rats (empfohlen)
   - b) Jeder neue Vorschlag
   - c) Nur beim Öffnen des Rats
   - d) Standard aus, zuschaltbar
2. **Stimmen je Rolle oder zusätzlich je Kulturraum?**
   - a) Je Rolle 1 Stimme, überall gleich (empfohlen, 88 Clips)
   - b) Je Rolle und 3 Großräume (Europa, Orient und Afrika, Asien und Amerika), etwa 260 Clips, 3 Dateien
   - c) Nur eine einzige Beraterstimme
3. **Dürfen Berater auf deine Entscheidung reagieren („Eine weise Entscheidung.“)?**
   - a) Ja, selten (1 von 3) (empfohlen)
   - b) Nein
   - c) Immer
4. **Sollen Beraterinnen vorkommen (einzelne weibliche Stimmen, etwa Diplomatin oder Gelehrte, wo historisch denkbar)?**
   - a) Nein, alle Rollen männlich wie bisher
   - b) Ja, als zweite Stimmvariante bei Diplomat und Gelehrtem; das Geschlecht wird dann bei der Ernennung gezogen
   - c) Nur bei Herrscherinnen am Hof

---------------------------------------------------------------------------------------------------
## B) CHRONIK ALS BUCH

### B1. Ist-Stand

**Es gibt zwei Dinge namens Chronik, und das verwirrt:**
1. **„Chronik“ (`openChronik`, `chronShow`, `chronImg`, `chronTxt`, `CHRON_TXT`):** Sammelalbum der gewonnenen Geschichten über alle Partien. Je Geschichte gibt es ein Bild, einen historischen Text und eine Vorlese-Stimme (`x_chronik.json`).
2. **„Reichschronik“ (`chronAdd`, `chronBook`, `bookHtml`, `openBooks`, `showBookNews`, `chronicleHtml`):** gehört zur Partie.
   - **`chronAdd(k,txt)`** schreibt `{e,t,y,k,txt}` nach `S.chron` (höchstens 400 Einträge).
     - Arten: `brk` (Durchbruch, 1 Stelle), `hist` (15 Stellen), `conq` (3), `lost` (6), `win` (4). Insgesamt 27 Aufrufe.
     - Abgedeckt: Thronfolge, Adoption, Heirat, Gegenkönig, Belagerung, Feldschlacht, Hinterhalt, Hauptstadtverlegung, Reformen, Bann, Kreuzzug, Orden, Erbfall, Shōgun, Statthalter-Abfall, Entscheidungsereignisse.
     - Fehlt: Tod des Herrschers bei normaler Erbfolge, Kriegserklärungen und Friedensschlüsse, Bündnisse, Wunder vollendet, Glaubenswechsel, Seuchen und Hungersnöte, Epochenwechsel als eigener Eintrag, Kapitel der Geschichten, Heldentod, Kulturtechniken, Stadtaufstieg zur Metropole.
   - **`chronSnap`:** Momentaufnahme von Provinzen, Bevölkerung, Statistik `st` (win, conq, siege, defwin) und Kultur.
   - **Am Epochenende** (Zeile ~4556): `chronBook()` erzeugt ein Kapitel `B` mit Zeitraum, Provinzen vorher→nachher, Bevölkerung, Siegen, Eroberungen, Abwehr, Kultur und bis zu 16 Taten (nach Art priorisiert). `S.books.push(B)`, dann `showBookNews` als Dialog: Epochenbild `img/ep_<e>.webp`, Statistik, Liste „Denkwürdige Taten“ und das SVG-Diagramm „Provinzen je Reich über die Zeit“ (`chronicleHtml`, aus `S.hist`).
   - **`openBooks`:** Liste der Kapitel plus „Laufendes Kapitel – Entwurf lesen“.
- **Spielende:** `victoryHtml` zeigt nur die Siegbalken, die Chronik wird nicht als Abschluss gezeigt.
- **Drucken:** Es gibt kein `@media print` und kein `window.print`.
- **Bildquellen im Spiel:**
  - Rund 596 Bilddateien unter img/, davon ev_* 104, hist_* 27, sc_* 22, ep_* je Epoche, battle_* 11.
  - `IMGLIB` mit Varianten, `EVIMG` (Ereignis-id → Bild), `heroImg`, Geschichten-Standbilder (`in_*`-Pakete).

### B2. Konzept „Das Buch des Reiches“

**Aufbau**
- **Einband:** Wappen (`HER.url`), Reichsname, „Chronik des Hauses <Dynastie>“, Zeitraum. Einband in Lederfarbe des Kulturstils. Die `body[data-theme]`-Akzentfarbe gibt Prägung und Kapitelband vor.
- **Kapitel je Epoche** (wie heute). Darin **Abschnitte je Herrscher**: Herrscherwechsel kommt als neuer Eintrag `k:'ruler'` dazu, mit Name, Beiname und Regierungsjahren aus der Dynastie (`dynOf`).
- **Doppelseiten:**
  - links Bild und Bildunterschrift, rechts Text
  - Initiale (großer Anfangsbuchstabe, in CSS gezeichnet, Kulturfarbe)
  - Randnotizen mit Jahreszahlen
  - Seitenzahl unten
  - Blättern per Wischen bzw. Pfeiltasten, CSS-Übergang ohne 3D-Effekt, um das iPad zu schonen
- **Bilder:** Zu jedem Abschnitt gibt es höchstens 1 Bild. Ausgewählt wird nach der wichtigsten Tat: Schlacht wird `battle_*`, Eroberung oder Belagerung `ev_belagerung`, Hochzeit und Thron `ruler_*`/`hist_*`, Ereignis über `EVIMG`, sonst `ep_<e>`. Dazu kommt ein Gewichtungs-Merker `img` beim `chronAdd`-Aufruf, als optionales 3. Argument.
- **Karten-Ausschnitt** (Phase 2): Am Kapitelende ein kleines Reichsumriss-Bild der Epoche. Gerendert wird es wie die Volksauswahl-Minikarte (v124 rendert sie bereits als Bild), einmal beim Epochenwechsel als kleines JPEG-dataURL in `B.map` (~30–60 KB). Nur das letzte und das erste Bild behalten, um den Spielstand klein zu halten.
- **Statistik-Seite** je Kapitel (die vorhandenen Werte und das Diagramm), gestaltet als Tabellenseite „Aus den Registern des Kanzlers“.

**Text (Chronistenstil statt Liste)**
- Feste Vorlagen je Art in der dritten Person, Vergangenheit und mit leichtem Pathos. Der Text bleibt sachlich, die Vorlagen sind eigene und nicht übernommen.
  - win: „Im Jahre {y} stellte sich {herrscher} dem Heer der {feind} bei {ort} und behielt das Feld.“
  - conq: „{ort} öffnete im Jahre {y} seine Tore …“
  - lost: „Schwer traf das Reich der Verlust von {ort} …“
  - hist: Text 1:1, aber mit Satzanfang „Im Jahre {y} …“.
- Je Art 3–4 Varianten, damit sich nichts wiederholt.
- **Verdichtung:** Mehrere Siege in derselben Runde bzw. gegen denselben Feind werden zu einem Satz zusammengefasst: „In drei Schlachten gegen Karthago …“.
- **Einleitung je Kapitel** aus der Statistik: „Als das Zeitalter des Hochmittelalters anbrach, gebot das Haus X über 7 Provinzen; als es endete, über 12.“
- **Schlussurteil je Herrscher** aus wenigen Werten (Provinzen ±, Siege, Bauten): „ein Mehrer des Reiches“, „ein Friedensfürst“, „glücklos“ usw. Die Liste der Urteile ist fest, die Zuordnung erfolgt nach Regeln.
- **Daten:** `chronAdd` braucht zusätzlich strukturierte Felder `{who,ort,feind}` neben `txt`. Die 27 Aufrufstellen bekommen die Felder schrittweise. Wo sie fehlen, wird `txt` genutzt.
- **Speicher:** `S.chron` ist auf 400 Einträge gekappt, wodurch frühe Epochen verloren gehen können. Deshalb beim Epochenwechsel das fertige Kapitel (`S.books`) als Text speichern und die Rohdaten danach verwerfen. Der Spielstand wächst so um ~5–10 KB je Kapitel.

**Abschluss am Spielende**
- Bei Sieg, Niederlage oder Ende einer Geschichte: Das letzte Kapitel wird geschlossen, danach folgt die Seite „Nachwort“ mit Gesamtbilanz und einer Gesamtbewertung des Reiches.
- Das Buch öffnet sich auf dem Endbildschirm mit dem Knopf „Das Buch des Reiches“.
- **Optional:** fertige Bücher geräteübergreifend in der Cloud wie `scenWins` speichern, als Regal „Deine Reiche“ im Startmenü.

**Export**
- **Phase 1:** „Drucken / als PDF sichern“ über `window.print()` mit einem `@media print`-Stylesheet: eine Seite je Doppelseite, Bilder eingebettet. Auf dem iPad geht das über das Teilen-Menü nach „Drucken“ und dann über eine Zwei-Finger-Geste in ein PDF. Das ist nicht getestet. Ob `window.print` im Artifact-iframe erlaubt ist, ist ebenfalls offen.
- **Alternative:** „Seite als Bild“ per Canvas-Rendering der aktuellen Doppelseite (eigener, einfacher Zeichner für Text, Bild und Initiale) und dann Download über die `downloads`-Fähigkeit des Artifacts, falls verfügbar, sonst mit einem Link. Aufwand M.

**Leistung iPad**
- Nur die aktuelle Doppelseite rendern, keine Endlosliste.
- Bilder sind webp, die vorhandenen Dateien werden genutzt. Lazy laden.
- Keine CSS-3D-Transforms, nur eine Opacity- bzw. Translate-Animation.

**Aufräumen**
- Umbenennen: die bisherige „Chronik“ (Geschichten-Sammlung) in **„Sammlung der Geschichten“** und die Reichschronik in **„Das Buch des Reiches“**. Alternativ: eine „Bibliothek“ mit zwei Regalen.

### B3. Empfehlung
- **Phase 1 (Aufwand M–L):**
  - Buchansicht (Einband, Kapitel je Epoche, Abschnitte je Herrscher, Doppelseiten mit Initiale und Bild)
  - Chronisten-Vorlagen mit Verdichtung
  - fehlende chronAdd-Haken: Herrscherwechsel, Krieg und Frieden, Bündnis, Wunder, Glaubenswechsel, Seuche und Hunger, Epochenwechsel, Heldentod und Kapitel der Geschichten
  - Endbildschirm mit Buch
  - Drucken über `@media print`
  - Umbenennung der beiden Chroniken
- **Phase 2:**
  - Karten-Ausschnitt je Kapitel
  - Urteile über Herrscher
  - Export als Bild
  - Regal „Deine Reiche“ in der Cloud
  - der Erzähler (Damien Black) liest das Vorwort jedes Kapitels vor: Geschichten-Vorworte über XTTS, frei erzeugte Kapiteltexte nur über die Gerätestimme, weil sie dynamisch sind

### B4. Entscheidungsfragen
1. **Gliederung des Buchs?**
   - a) Kapitel je Epoche, darin Abschnitte je Herrscher (empfohlen)
   - b) Nur je Herrscher
   - c) Nur je Epoche wie bisher, aber schöner
2. **Erzählstil?**
   - a) Chronist mit leichtem Pathos („Im Jahre … behielt das Feld“) (empfohlen)
   - b) Nüchtern-sachlich wie ein Geschichtsbuch
   - c) Kulturabhängig (römischer Annalist, arabischer Hofhistoriker, chinesischer Hofschreiber)
3. **Export?**
   - a) Drucken/PDF über das Druckmenü (empfohlen, Phase 1)
   - b) Zusätzlich jede Seite als Bild speichern
   - c) Kein Export
4. **Bücher über Partien hinweg aufbewahren?**
   - a) Ja, Regal „Deine Reiche“ im Startmenü, geräteübergreifend
   - b) Nur in der jeweiligen Partie (empfohlen für Phase 1)
5. **Die beiden „Chroniken“ umbenennen?**
   - a) „Sammlung der Geschichten“ und „Das Buch des Reiches“ (empfohlen)
   - b) Gemeinsame „Bibliothek“ mit zwei Regalen
   - c) Lassen

---------------------------------------------------------------------------------------------------
Hinweis außerhalb des Auftrags: `ruestung_mangel` teilen sich drei verschiedene Ratstexte (Daten-Unschärfe). Baumeister und Heermeister haben keine Ratsregeln.
