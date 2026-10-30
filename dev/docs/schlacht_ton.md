# Testschlacht – Tonsystem (Vorgabe 30.10.2026)

Wunsch Moritz: „ein sehr gutes Soundsystem … dass die Kämpfe an sich hörbar werden … und ein Soundtrack, dass das Ganze entsprechend
episch wird, beziehungsweise natürlich verschiedenste Soundtracks.“ Entscheidungen: Geräusche per **AudioGen** am PC, Musik **dynamisch**.
Lizenz: MusicGen und AudioGen sind CC-BY-NC 4.0 – passt, das Projekt ist nicht kommerziell. Stil: groß, orchestral, Chor, Kriegstrommeln –
eigene Stücke, keine Nachahmung bestimmter Filmmusik (Prompts nennen keine Werke oder Komponisten).

## 1. Musik (MusicGen-medium, PC)
Je Stück ca. 90–120 s, schleifenfähig (weiche Ein-/Ausblendung), mp3 96 kbit/s mono. Ablage `audio/schlacht/m_<id>.mp3` (eigene Dateien, kein Base64).
| Stimmung | Stücke | Einsatz |
|---|---|---|
| vor der Schlacht | `ruhe_1` | Aufstellung: Wind, ferne Trommeln, gedämpfte Streicher |
| Aufmarsch | `aufmarsch_rom`, `aufmarsch_karthago`, `aufmarsch_kelt` | nach „Schlacht beginnen“ bis zum ersten Kontakt; Kultur der eigenen Seite |
| Kampf | `kampf_1`, `kampf_2`, `kampf_3`, `kampf_rom`, `kampf_karthago` | sobald nennenswert gekämpft wird; zufällig/abwechselnd |
| Höhepunkt | `hoehepunkt_1`, `hoehepunkt_2` | eine Seite wankt (Moral < 35 % oder viele Fliehende) |
| Sieg | `sieg_1`, `sieg_2` | Endtafel Sieg |
| Niederlage | `niederlage_1` | Endtafel Niederlage |
Je Stück 2 Fassungen erzeugen, die bessere wird gewählt (Auswahl am PC per Anhören der Kurzproben).

## 2. Geräusche (AudioGen-medium, PC)
Kurze Einzelgeräusche 1–3 s, Teppiche 10 s schleifenfähig. Mehrere Varianten je Art gegen Wiederholung. Ablage `audio/schlacht/s_<art>_<n>.mp3`.
- Nahkampf: `klirren` (Schwert auf Schwert, 8), `schild` (Schwert auf Holzschild, 6), `schildstoss` (dumpfer Stoß, 4), `treffer` (Schlag + Stöhnen, 6), `tod` (Schrei/Fall, 6), `speer` (Stoß auf Schild, 4).
- Bewegung: `marsch` (Marschtritt vieler, Teppich), `sturm` (laufende Menge mit Gebrüll, Teppich), `ruestung` (Klappern, kurz).
- Rufe: `kriegsgeschrei` (Heer brüllt beim Angriff, 4), `sieg_jubel` (2), `horn` (Signalhorn/Cornu, 4).
- Teppich: `kampflaerm_nah`, `kampflaerm_fern` (viele kämpfende Männer), `wind`, `wiese` (Vögel, Insekten leise).

## 3. Abspielen im Spiel (Web Audio, `dev/proto/schlacht_spiel.html`)
- Erst nach der ersten Berührung starten (iOS). Laden im Hintergrund nach dem Figurenladen; fehlende Dateien dürfen das Spiel nicht aufhalten.
- **Musik:** Zustandsmaschine Ruhe → Aufmarsch → Kampf → Höhepunkt → Sieg/Niederlage, Überblendung 3–4 s, nie zweimal dasselbe Kampfstück hintereinander.
- **Raumklang:** Einzelgeräusche an der Stelle des Ereignisses (Zweikampf-Treffer, Parade, Tod) mit Panorama und Entfernungsdämpfung zur Kamera; höchstens ~12 gleichzeitig, nur Ereignisse in Hörweite (~60 m), zufällige Tonhöhe ±8 %.
- **Teppiche:** Lautstärke aus der Zahl kämpfender/marschierender Soldaten nahe der Kamera (gleitend); ferner Kampflärm, wenn weiter weg gekämpft wird; Wind/Wiese immer leise.
- **Ereignisse:** Angriffsbefehl → Kriegsgeschrei der Einheit; Horn bei Schlachtbeginn und bei Flucht einer Einheit; Jubel bei Sieg.
- **Bedienung:** Ein Knopf „Ton“ in der rechten Spalte (Spalte bleibt einspaltig): an/aus; lange drücken = Erklärkarte mit zwei Reglern Musik/Geräusche. Einstellung wird gemerkt.
- Leistung: keine Knoten pro Bild anlegen; Puffer einmal dekodieren; Quellen nach dem Ende freigeben.

## 4. Prüfen
- Am PC: Proben anhören ist nicht möglich (keine Lautsprecher in der Sitzung) → Prüfung über Lautheit/Länge/Stille-Anteil (Skript) und durch Moritz.
- Im Spiel: keine Konsolenfehler, Zustandswechsel der Musik per `window.SCHLACHT.ton` nachvollziehbar, iPad durch Moritz.

## 5. Dateien und Namen (Stand 30.10. mittags)
- Musik: `dev/proto/ton/m_<id>_<a|b>.mp3` (ids siehe Abschnitt 1; zunächst nur `m_kampf_1_a`, `m_kampf_1_b` vorhanden, der Rest folgt). Fehlende Stücke überspringen, nicht als Fehler melden.
- Geräusche: `dev/proto/ton/s_<art>_<n>.mp3` (Arten und Anzahl in `dev/pc/schlacht_geraeusche.json`: klirren 8, schild 6, schildstoss 4, treffer 6, tod 6, speer 4, ruestung 4, kriegsgeschrei 4, horn 4, sieg_jubel 2, marsch 2, sturm 2, kampflaerm_nah 3, kampflaerm_fern 2, wind 2, wiese 1, pfeil 4, pfeil_treffer 4, schleuder 3, wurf 3). Noch nicht vorhanden – Tonsystem muss ohne sie fehlerfrei laufen und sie nachladen, sobald es sie findet (Liste fest im Code, Laden mit HEAD/fetch und still übergehen bei 404).
- Die Seite meldet Ereignisse bereits an `window.SCHLACHT_TON.ereignis(typ, x, z)` (siehe Stand Fernkampf/Oberfläche) – daran anschließen.

## 6. Oberfläche nachbessern (Rückmeldung Moritz 30.10.)
- „Die Position der gegnerischen Einheiten im Interface finde ich noch nicht ideal“ → Feindkarten aus der linken Spalte nehmen: **schmale Reihe oben**, unter/neben dem Kräftebalken, kleinere Karten mit Bild + Stärkebalken (eigene Einheiten unten, Feinde oben – gespiegelt, sofort lesbar). Antippen wie bisher.
- „Interface generell noch etwas schöner“: Karten mit feinem Bronze-Rahmen und Schatten, Bild füllt die Karte, Text auf halbtransparentem Band; Kräftebalken mit Wappen beider Seiten; Knöpfe der rechten Spalte etwas kompakter, Symbole größer, Hover/Tipp-Rückmeldung; Hinweiszeile im gleichen Stil; einheitliche Abstände; Hochformat weiter prüfen.

## Stand Ton/Oberfläche (30.10.2026, `dev/proto/schlacht_spiel.html`)
**Ton (Abschnitt 7b, `const TON`):** Web Audio, Kontext erst bei der ersten Berührung (`pointerdown/up`, `touchend`, `click`, `keydown`, capture) angelegt/fortgesetzt. Laden nacheinander nach dem Figurenladen und nach der ersten Berührung
(`fetch` + einmal `decodeAudioData`, alles in try/catch, 404 still übergangen; Wiederholung beim Schlachtbeginn und alle 60 s). Ladeliste fest im Code (Geräusche laut Abschnitt 5, 74 Dateien; Musik je Stück `_a`, sonst `_b`).
**Speicher:** höchstens `MAXM` = 10 Musikstücke gleichzeitig dekodiert (je ca. 20 MB), Reihenfolge: kampf_1, alle Geräusche, ruhe_1, aufmarsch_rom, kampf_2, hoehepunkt_1, sieg_1, niederlage_1, kampf_3, …; Aufmarsch fremder Kulturen wird nur geladen, wenn Platz ist.
**Einzelgeräusche:** `ereignis(typ,x,z)` → `TON.ereignis`: Mindestabstand je Art, Hörweite 60 m + 0,3 × Kameraabstand (Kriegsgeschrei 140 m, Horn 400 m), Dämpfung (1−d/R)^1,4 und Zoom, Panorama aus Kamerarichtung (`StereoPanner`), Tonhöhe ±8 %, höchstens 12 gleichzeitig,
kurzlebige Quellen. Ereignisse neu im Kampfcode: `klirren`/`schild` (Parade), `treffer`/`speer`/`schildstoss` (Treffer ohne Tod), `tod`, `kriegsgeschrei` (Angriffsbefehl, Ansturm), `horn` (Schlachtbeginn, Flucht einer Einheit), `sieg_jubel`;
dazu die Fernkampf-Ereignisse (`wurf`, `schleuder`, `treffer_fern`→`pfeil_treffer`, `abgewehrt`→`schild`). `verfehlt` bleibt stumm. Zähler in `SCHLACHT.ereignisse`.
**Teppiche:** Dauerschleifen `kampflaerm_nah/fern`, `marsch`, `sturm`, `wind`, `wiese`; alle 200 ms zählt `zaehlen()` die Soldaten (kämpfend < 50 m / 50–160 m um das Blickziel, marschierend/laufend < 60 m), Lautstärke gleitet (`setTargetAtTime`).
**Musik:** Zustände `ruhe` (Aufstellung) → `aufmarsch` (Kultur Rom) → `kampf` (ab 4 Zweikämpfen, bleibt 15 s) → `hoehepunkt` (Einheit unter 35 % Moral im Gefecht/fliehend oder ≥ 30 Fliehende, 1,5 s Vorlauf, mindestens 25 s) → `sieg`/`niederlage`.
Überblendung 3,5 s, nie dasselbe Stück zweimal hintereinander, wenn eine Alternative geladen ist; Ausweichreihenfolge: aufmarsch → aufmarsch_* → Kampfstücke; hoehepunkt → Kampfstücke. Läuft schon ein passendes Stück, wird es nicht neu gestartet (nur kampf_1 vorhanden → durchgehend). Stück zu Ende → nächstes (Überblendung 3,5 s vor dem Ende, kein Schleifen nötig).
Ohne passendes Stück Stille (ruhe, sieg, niederlage: nur mit eigenen Dateien).
**Bedienung:** Knopf „Ton“: kurz = an/aus (Master 0), lang (450 ms) = Tonkarte mit Reglern Musik/Geräusche und Statuszeile; gemerkt in `localStorage` (`schlachtTon`, `schlachtTonM`, `schlachtTonG`). `langDruck` zählt jetzt auch die Zeit (bei langsamen Bildern kam `pointerup` vor dem Timer).
**Test-Schnittstelle:** `SCHLACHT.ton` = `{zustand, stueck, geladen:{musik,geraeusche}, aktiv, kontext, gespielt, teppiche, zaehl, musikPuffer}`.
**Oberfläche:** Feindkarten aus der linken Spalte in eine Reihe unter dem Kräftebalken (`#feinde` in `#oben`, eigene unten, Feinde oben); Kräftebalken mit Wappenschilden beider Seiten; Karten mit Bronzerahmen, Bild füllt die Karte, Text auf dunklem Band;
Befehlsspalte (eine Spalte) kompakter mit 30-px-Symbolen, Tipp-/Hover-Rückmeldung; Hinweiszeile im Kartenstil. Ziele ≥ 44 px (Knöpfe 46 px, Feindkarten 72 px hoch, Regler 44 px).
**Geprüft (Headless-Chromium, Software-Rendering, `--autoplay-policy=no-user-gesture-required`):** keine Konsolenfehler/uncaught Rejections (nur erwartete 404-Zeilen für fehlende Dateien); Kontext `running` nach erster Berührung; `kampf_1` geladen; Zustandsfolge in einer automatischen Schlacht
aufmarsch → kampf → hoehepunkt → niederlage; mit abgefangenen Testtönen (WAV statt mp3, nur per Netzwerk-Abfangen) wurden alle 74 Geräusche geladen, 662 Einzelgeräusche gestartet, alle 6 Teppiche liefen; Tonkarte, Regler, Speichern, Stumm geprüft; Bilder bei 1194×834 und 834×1194 angesehen.
**Nicht geprüft:** Hörbarer Klang (keine Lautsprecher), echte Lautstärkemischung, iPad/iOS-Entsperrung, Bildraten (Software-Rendering sagt nichts).
