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
