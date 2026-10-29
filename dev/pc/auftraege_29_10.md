# PC-Aufträge für den Abend des 29.10.2026

Reihenfolge so gewählt, dass die Grafikkarte durchläuft. Alles über die Warteschlange (`_neu\<job>` anlegen → in `warteschlange` verschieben).
Repo vorher aktualisieren: `git pull` im Repo-Ordner.

## 1. Bilder (FLUX) – zuerst, laufen über Nacht

| Job | Erzeugen mit | Bilder | Inhalt |
|---|---|---|---|
| 40_hannibal | `node dev\pc\hannibal_bilder.js _neu\40_hannibal\items.json` | 106 (53 Motive × 2) | Kino 1–5, Kapitel, Pass-Ereignisse, Rat von Karthago, Sonder-Schlachtfelder, 8 Porträts |
| 41_schlacht_lade | `node dev\pc\schlacht_ladebilder.js _neu\41_schlacht_lade\items.json` | 54 | Ladebilder Echtzeitschlacht: 9 Landschaften × antik/mittelalterlich/neuzeitlich |
| 42_wikinger2 | `node dev\pc\wikinger_umbau_bilder.js _neu\42_wikinger2\items.json` | 22 | Alfred, Ivar/Halfdan, Winterlager, Athelney, Fyrd, Marionettenkönig, Danelag, Burh-Bau, Thronstreit, Pferde, **vk_k4_miklagard neu** (ohne Minarette) |

Geschätzte Laufzeit: nicht gemessen; bisher lief Job 34 (130 Bilder) über Nacht.

## 2. Stimmen (XTTS) – nach den Bildern

| Job | Datei | Sätze |
|---|---|---|
| 43_hannibal_kino | `dev\pc\43_hannibal_kino_tts.json` → `_neu\43_hannibal_kino\tts.json` | 7 (Kino 1, 2a, 2b, 3, 4, 5A, 5B) |
| dazu Prüfung | `pruef.json` wie bei Job 28 | Whisper-Wortvergleich |

Hinweis: `tts_pruef.py` nicht über alte Jobs neu laufen lassen (würde Schnitte überschreiben, siehe Backlog).

## 3. Blender – neu: läuft auch in der Cloud

Befund heute: Blender 5.2 lässt sich in der Cloud-Sitzung ohne Bildschirm betreiben (`pip install bpy`, geprüft: Version 5.2.3 startet, Testobjekt angelegt).
Folge: Skelette, Animationen übertragen und **Backen** (Schlachtsystem S5, S7, S9) können in Cloud-Sitzungen gebaut und geprüft werden. Der PC wird nur noch für FLUX, XTTS und TRELLIS (Ausrüstungsteile) gebraucht.
Daher heute Abend am PC **kein** Blender-Installieren nötig.

Was dafür fehlt (Entscheidung Moritz, Ausgangsdaten – jede Quelle einzeln freigeben, Lizenz vor Download prüfen):
| Zweck | Kandidat | Lizenz laut Anbieter (vor Nutzung prüfen) | Erreichbar aus der Cloud |
|---|---|---|---|
| Realistischer Grundkörper Mensch | MakeHuman / MPFB (Blender-Erweiterung) | erzeugte Modelle CC0 (Angabe MakeHuman) | Quellen auf GitHub |
| Bewegungen Mensch | CMU Motion Capture Database (BVH) | frei nutzbar (Angabe CMU) | Umwandlungen auf GitHub |
| Bewegungen Mensch (Alternative) | Quaternius Animationsbibliothek | CC0 (Angabe Quaternius) | prüfen |
| Pferd, Elefant | eigene Skelette in Blender + Handanimation per Skript | eigen | – |
Nicht verwenden: Modelle/Animationen aus Spielen, Mixamo-Rohdateien im öffentlichen Repo (Weitergabe unklar).

## 4. TRELLIS – erst nach Freigabe der Ausrüstungsliste
Ausrüstungsteile Antike (Kit A1–A8 in `docs/schlacht_umsetzung.md` 5.4) als TRELLIS-Aufträge vorbereiten, sobald die Profile (`dev/schlacht/profile_truppen.json`) durchgesehen sind. Nicht gleichzeitig mit der Warteschlange.

## 5. Nach dem Lauf (nächste Sitzung)
- Auswahlbogen je Job ansehen (wie Job 34), Auswahl in `auswahl.txt`.
- Einbau: Hannibal-Kino erst mit dem Hannibal-Paket; Ladebilder mit Schlachtsystem S1; Wikinger2 erst nach Freigabe des Umbaus (außer vk_k4_miklagard – sofort tauschbar).
