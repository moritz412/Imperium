# Städte Roms – Aufträge für die PC-Pipeline (1.11.2026)

Rest von Phase C des Konzepts `dev/staedte/docs/konzept_spiel.md`. Alles läuft im Spiel schon mit Ersatzformen (three.js);
die Aufträge verbessern nur Aussehen und Klang. Nicht kommerziell (MusicGen CC-BY-NC).

## 1. Blender-Modelle (Erweiterung von `dev/pc/blender/staedte_geb.py` → `models/staedte_geb.json`)
Heute als Blender-Modell: Hütte, Casa, Mühle, Bäckerei, Markt, Speicher, Holzfäller, Lehmgrube, Ziegelei, Brunnen.
Fehlen (im Spiel als einfache Form, Vorderseite = +z, Größe in Feldern):

| Name im Spiel (Schlüssel) | Feld | Inhalt |
| --- | --- | --- |
| insula (Hütte Stufe 3) | 2×2 | 3 Geschosse, Läden unten, Ziegeldach |
| domus | 3×3 | Atriumhaus, vier Flügel, Impluvium, Säulen |
| ludus (Schule) | 2×2 | Haus mit Säulenvorhalle, Bänke |
| wache (Feuerwache) | 2×2 | Wachhaus mit Turm, Eimer, Haken |
| quartier (Sklavenquartier) | 2×2 | langer niedriger Bau |
| schrein | 1×1 | Lararium mit zwei Säulen und Giebel |
| latrine | 2×1 | Bogenöffnungen, Wasserrinne |
| schmiede, kelter, oelmuehle, weberei, garumsiederei | 2×2 | Werkstätten (Esse, Baumpresse, Trapetum, Webstuhl, Becken) |
| tabernae | 2×1 | Ladenzeile mit Markisen |
| tempel | 3×3 | Podiumstempel, Freitreppe, 6 Säulen |
| theater | 4×3 | Cavea (Ränge), Bühnenhaus |
| thermen | 4×3 | Kuppeln, Becken, Schornstein |
| basilika | 6×4 | Hallenbau mit Säulenumgang, Apsis |
| tor | 1×1 | zwei Tortürme mit Bogen |
| zeltlager | 3×2 | Lederzelte, Feuerstelle |
| statue, garten | 1×1, 2×2 | Sockel + Figur; Beete, Bäume, Becken |

Vorgaben wie bisher: Low-Poly mit Farbe je Ecke, ein Mesh je Gebäude, Budget je Gebäude ≤ 1.500 Dreiecke (Basilika/Theater ≤ 3.000),
Maßstab 1 Feld = 1 Einheit, Boden y = 0, Vorderseite +z. Das Spiel nimmt automatisch das Modell, wenn der Schlüssel in der Datei ist.
Hinweis: Blender läuft auch in der Cloud headless (`pip install bpy`), siehe `dev/BACKLOG.md` „Befund Werkzeug“.

## 2. Musik (MusicGen, Warteschlange)
Je Jahreszeit ein Stück (60–90 s, schleifenfähig), Ausgabe wie `audio/st_rom.json` (eine Datei je Stück, base64 im JSON):
- `st_fruehling`: helle Lyra und Flöte, ruhig, Vogelgesang-Stimmung, antikes Rom, kein Schlagzeug
- `st_sommer`: warme Lyra, Tamburin leise, lebhafter Markt
- `st_herbst`: Ernte, Doppelflöte (aulos), gemächlich, festlich
- `st_winter`: gedämpfte Harfe, tief, ruhig, Feuer im Herd
- `st_fest`: Fanfare (tuba, cornu), Trommeln – für Feste und Eröffnungen (10–15 s)
Einbau danach in `dev/staedte/js/ton.js` (Musik je Jahreszeit wechseln), Lautstärke angleichen.

## 3. Sprecher (optional, XTTS)
Kurze Sätze für die Wendepunkte der Geschichte (Belagerung, Siedler, Via Postumia, Spartacus, Landenteignung) und die Eröffnung
der Basilika – Texte stehen in `dev/staedte/js/daten.js` (`GESCHICHTE`, `EREIGNISSE`). Danach Whisper-Prüfung (`tts_pruef.py`).
