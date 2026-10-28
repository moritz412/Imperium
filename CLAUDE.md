# Imperium der Epochen 2 – Arbeitsanleitung für Claude

Strategiespiel für das iPad (Total-War-ähnlich, 5 Epochen von 300 v. Chr. bis Napoleon). Eine einzige HTML-Datei mit Three.js r128.
Entwickelt von Moritz zusammen mit Claude. Nicht kommerziell (MusicGen CC-BY-NC, XTTS nicht kommerziell).
Moritz schreibt Deutsch, will knappe, direkte Antworten.

## Wo was liegt
- `dev/imperium.html` – **die Quelldatei** (alles: Code, CSS, HTML). Wird gezielt bearbeitet, nie neu geschrieben.
- Repo-Wurzel (`index.html`, `img/`, `audio/`, `models/`, `snd/`, `saves/` …) – die **gebaute Web-App** für GitHub Pages
  (https://moritz412.github.io/Imperium/). Nicht von Hand ändern, sondern mit `python dev/tools/deploy.py` neu bauen.
  `saves/` sind Start-Welten des Spiels, keine Spielstände. **Echte Spielstände nie ins Repo** (Repo ist öffentlich).
- `dev/tools/` – `build.py` (PWA-Build), `deploy.py` (baut in die Repo-Wurzel), `chkf.sh` (Syntaxcheck aller Script-Blöcke).
- `dev/tests/` – Playwright-Tests (`npm install` einmalig). Aufruf: `node smoke.js [html] [port]`.
- `dev/r3/` – Nachbearbeitung von TRELLIS-3D-Modellen (siehe `dev/r3/README.md`).
- `dev/pc/` – Skripte/Aufträge für die PC-Pipeline (FLUX-Bilder, XTTS-Sprecher, Whisper-Prüfung `tts_pruef.py`).
- `dev/docs/` – Konzepte (`konzept_*.md`), Audits, Leitlinie `design_leitlinie.md`, Verlauf `verlauf.md`.
- `dev/BACKLOG.md` – offene Themen und Entscheidungen. **Zuerst lesen.**

## Feste Regeln (von Moritz, wörtlich)
- „Behaupte nicht, einen Test ausgeführt zu haben, wenn dies nicht geschehen ist.“
- „Lege keine frei erfundenen FPS-Ergebnisse vor.“
- „Falls ein Test nicht ausführbar ist, kennzeichne ihn als ‚nicht getestet‘.“
- „Kopiere keine konkrete Benutzeroberfläche oder proprietären Assets eines bestehenden Spiels.“
- „Füge keine neue Beleuchtungsbibliothek hinzu.“
- „Vermeide eine vollständige Neuschreibung der index.html.“
Weitere: KI-Verhalten nur vorsichtig ändern. Immer sagen, dass das echte iPad nicht getestet ist. Handy ist zweitrangig.
Menüs: „Spiel statt Software“ – siehe `dev/docs/design_leitlinie.md` (Bilder, gestaltete Zustände, Infos sichtbar,
wenige Reiter, **Menüknöpfe immer in einer Spalte**, kein Programm-Look). Zahlen höchstens eine Nachkommastelle.

## Sparsam arbeiten (Token-Budget)
1. Ein Thema nach dem anderen. Kleine Änderungen direkt selbst machen.
2. Unteragenten nur für große, abgegrenzte Pakete – höchstens einer gleichzeitig, mit `model: sonnet` für die Umsetzung;
   Planung und Prüfung übernimmt der Hauptchat.
3. Neuer Chat je Paket; Stand in `dev/BACKLOG.md` und `dev/docs/verlauf.md` festhalten statt in langen Chats.
4. Tests gezielt: `smoke.js` + die betroffenen Tests. Vollen Satz nur vor großen Veröffentlichungen.
5. Screenshots nur bei Oberflächen-Änderungen, ein Vorher/Nachher-Bild genügt. Lange Logs nur gefiltert lesen (`grep FAIL`).
6. Nachtläufe nur mit vorher abgesprochenem Umfang.

## Arbeitsablauf
1. Änderung in `dev/imperium.html` (gezielt mit Edit/str_replace).
2. `bash dev/tools/chkf.sh dev/imperium.html` → muss „checked“ melden.
3. Testserver aus der Repo-Wurzel: `python -m http.server 8772` (eigenes Terminal), dann in `dev/tests`: `node smoke.js`
   und betroffene Tests. Auf dem PC mit echter Grafik: Umgebungsvariable `PW_GPU=1` (sonst Software-Rendering),
   optional `PW_CHROMIUM=<pfad zu chrome.exe>`. Tests warten auf das Ende des Ladeschirms (`#loading[data-gate]`).
4. Versionsnummer: Kommentar/Changelog im Code; bei geänderten Datenpaketen `OFF_MAN`-Größe anpassen und `OFF_VER` erhöhen.
5. Veröffentlichen: `python dev/tools/deploy.py`, dann `git add -A && git commit -m "vNNN: …" && git push`.
   Commit-Nachrichten mit den Attributionszeilen, die die jeweilige Sitzung vorgibt.
   Die claude.ai-Artifact-Fassung (mit Cloud-Speicherständen) wird nur aus einer claude.ai-Sitzung veröffentlicht.

## Wichtige Code-Bausteine (Auswahl)
- Bildpakete: `PKREG`, `IMGLIB` (Varianten-Suffix `_a1/_m1/_n1/_x1` = Antike/Mittelalter/Neuzeit/alle), `sysImg`, `heroImg`, `pkLoad`.
- Offline-Liste: `OFF_MAN`, `OFF_VER`. Ladeschirm bis Karte fertig: `mapGate`.
- Epochen: `EPOCHS`, `EPOCH_MIN/MAX/TECHS`, `checkEpoch`, Wende-Techs `wende0–3`, `yearCapHit`.
- Spätspiel: Paket 1 (`grollRound`, `riseRound`, `invPlan`, Verlustgrenze `pk1Cap`), Paket 2 (`fhRound` Feldherren,
  `pk2DynRevolt`, `pk2GovRevolt`, `pk2UmbRound`, Grenzmark `markOpen`), Völkermosaik (`S.vm`, `vmRound`), `EP_FOCUS`.
- Forschung: `openResearch` (illustrierte Seite). Menüs: `openMenu`, Startmenü `#start .stmenu`.

## PC-Pipeline (Moritz' Windows-PC, RTX 4060 8 GB)
Ordner `Desktop\imperium-bilder`. `warteschlange.bat` läuft dauerhaft und arbeitet `warteschlange\<job>\` ab:
`items.json` → FLUX-Bilder (`gen.py`), `tts.json` → XTTS-Sprecher, zusätzlich `pruef.json` → Whisper-Prüfung (`tts_pruef.py`).
Aufträge immer in `_neu\<job>` anlegen und dann in die Warteschlange verschieben. TRELLIS (3D) über `3d_NN.bat`,
nie gleichzeitig mit der Warteschlange auf der Grafikkarte.
