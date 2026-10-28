# Konzept: Imperium der Epochen 2 als eigenständige Web-App (ohne Claude-Abo)

Stand: v157, 21.10.2026. Ziel: Das Spiel läuft als statische Web-App (PWA) auf einem kostenlosen Hoster, lässt sich auf dem iPad zum Home-Bildschirm hinzufügen und startet zuverlässig offline. Die Artifact-Fassung auf claude.ai läuft parallel weiter (eine Quelldatei, zwei Ausgaben).

## 1. Bestandsaufnahme: Abhängigkeiten von claude.ai

| Baustein | Wo im Code | Ohne claude.ai | Ersatz |
|---|---|---|---|
| `window.claude.use('user')`, `use('db')` | `CLOUD.ready` | liefert `null`, `CLOUD.uid` leer | Abstraktion `SYNC` mit Treiber „lokal“ (Standard) und „claude“ |
| Cloud-Spielstände | `slotWrite`, `cloudLoad`, `cloudMeta`, Doc `slotidx`, `auto`, Slots unter `data/users/<uid>` | Cloud-Knöpfe zeigen „nicht verfügbar“, lokale Spielstände laufen weiter | Lokal (localStorage, bei Platzmangel IndexedDB) + Export/Import als Datei (über Teilen-Dialog nach iCloud Drive/Dateien) |
| Siege der Geschichten (`winsSync`, Doc `wins`), Erfolge (`achSync`, Doc `ach`) | geräteübergreifender Abgleich | nur lokal, bleibt korrekt | Teil der Export-Datei („Profil-Export“) |
| Mehrspieler (`mp*`, Sammlung `mp/…` in der Artifact-DB, Hot-Seat über Cloud) | `mpDb()` wartet auf `CLOUD.ready` | Mehrspieler-Menü funktionslos | Phase 1: ausblenden, wenn kein Treiber; lokales „Am selben Gerät“ (Hot-Seat) bleibt möglich. Später optional Supabase/Firebase (Gratis-Stufe) |
| Größen-/Dateilimits des Artifacts (512 Dateien, 256 MB, 64 MB je Upload) | PB-Bildpakete, Audio-Bündel, 40-kbit-Stimmen | entfallen | Bündelung beibehalten (weniger Requests = schneller, Precache einfacher) |
| Reisemodus `OFF` (IndexedDB + fetch-Wrapper) | Startmenü-Knopf | funktioniert auch auf eigener Domain | In der PWA durch Service Worker ersetzt; `OFF` bleibt nur für die Artifact-Fassung aktiv |
| Google Fonts (Marcellus, Alegreya Sans) | `<link>` im Kopf | offline Systemschrift | Schriften selbst hosten (beide OFL), in den Precache |
| three.js r128 | eingebettet | ok | – |
| Relative Pfade `img/`, `audio/`, `models/`, `saves/`, `snd/` | überall | funktionieren unverändert | – |
| Rechte/Sicherheit des Artifacts (privat, nur Moritz) | Hosting | Web-App ist über ihre URL erreichbar | „unlisted“ (nicht verlinkt, `noindex`) oder Zugangsschutz (Cloudflare Access, kostenlos) |

Größe: rund 210 MB in 128 Dateien (Audio 103 MB, Bilder 79 MB, Modelle 47 MB, Startwelten 9 MB, Instrumente 19 MB, HTML 3,5 MB). Größte Datei ~13 MB (`audio/x_vgas.json`).

## 2. Zielarchitektur

**Eine Quelle, zwei Ausgaben.** `build_pwa.py` nimmt `imperium.html` + Assets und erzeugt `dist/`:
- `index.html` (gleicher Code, Kennung `IMP_TARGET='pwa'`), `manifest.webmanifest`, Icons (180/192/512, aus dem Wappen bzw. Ladebild), `sw.js`, `fonts/`, alle Assets, `version.json` (Version + Datei-Hashes).
- Die Artifact-Fassung bleibt unverändert, `IMP_TARGET='artifact'`.

**Abstraktionsschicht im Code (`STORE`/`SYNC`):**
- `STORE`: lokale Spielstände, Profil (Siege, Erfolge, Einstellungen). Heute schon localStorage; zusätzlich IndexedDB-Fallback für große Spielstände.
- `SYNC`: Treiber `claude` (heutiges `CLOUD`), `none` (PWA Standard), später `supabase`. Die UI zeigt Cloud-Funktionen nur, wenn ein Treiber bereit ist.
- `EXPORT`: „Spielstand/Profil exportieren“ → Datei `imperium_<volk>_<runde>.imp` über `navigator.share` (iPad: „In Dateien sichern“ → iCloud Drive) bzw. Download; „Importieren“ über Dateiauswahl. Grundlage existiert schon (`openImport`, Export im Speichermenü).

**Service Worker (`sw.js`):**
- Installation: Precache von `index.html`, Schriften, `pb_ui`, `pb_bau`, Startwelten, Kernmodelle (≈ 40 MB) → App startet offline.
- „Alles für unterwegs“ (Knopf, wie heute der Reisemodus): lädt den Rest (Audio, Ereignis-Pakete, Geschichten) in den Cache, mit Fortschritt.
- Runtime: Cache-first für Assets, Network-first mit Zeitlimit für `index.html`/`version.json`.
- Update: neue `version.json` → Hinweis „Neue Version – neu laden“; nur geänderte Dateien (Hash) werden neu geholt; alte Caches werden gelöscht.

**Hosting (kostenlos, alle Größen passen):**

| Anbieter | Grenzen | Einrichtung |
|---|---|---|
| GitHub Pages | Seite ≤ 1 GB, Datei ≤ 100 MB, ~100 GB/Monat Bandbreite (weich) | GitHub-Konto, Repo, Pages einschalten; ich kann danach selbst pushen, wenn GitHub in claude.ai verbunden ist |
| Cloudflare Pages | ≤ 20.000 Dateien, Datei ≤ 25 MiB, Bandbreite unbegrenzt | Konto, Zip per Drag & Drop hochladen (ohne Git) oder später über GitHub; Zugangsschutz (Access) kostenlos möglich |
| Netlify | 100 GB/Monat, Drag & Drop | ähnlich Cloudflare |

Empfehlung: **Cloudflare Pages** (einfachster Upload, unbegrenzte Bandbreite, optionaler Zugangsschutz). Mit GitHub-Verbindung kann ich Updates danach selbständig ausrollen.

**iPad-Besonderheiten:**
- Als Home-Bildschirm-App ist die Seite von Safaris 7-Tage-Löschregel ausgenommen; Speicher (Cache + IndexedDB) reicht für 210 MB (Quote ist ein Anteil des freien Gerätespeichers).
- Audio-Freigabe nach erster Berührung bleibt nötig (wie heute).
- Home-Bildschirm-App hat eigenen Speicher: Spielstände aus Safari/Artifact einmalig per Export/Import übernehmen.

**Mehrspieler:** Phase 1 nur Hot-Seat auf einem Gerät. Online-Mehrspieler später über Supabase (Gratis-Stufe, kleine Tabelle `mp_games`) – eigener Schritt, braucht Konto.

## 3. Lizenzen (Einschätzung, keine Rechtsberatung)

| Inhalt | Lizenz | Folge |
|---|---|---|
| Musik (MusicGen-Gewichte) | CC-BY-NC 4.0 | nur nicht-kommerziell, Namensnennung „Musik erzeugt mit MusicGen (Meta), CC-BY-NC 4.0“ im Impressum/Credits |
| Stimmen (Coqui XTTS-v2) | Coqui Public Model License | nur nicht-kommerziell; Hinweis in den Credits |
| Bilder (FLUX.1 schnell) | Apache 2.0 | frei nutzbar, auch kommerziell |
| 3D-Modelle (TRELLIS) | MIT (Code und veröffentlichte Gewichte) – vor Veröffentlichung nochmals prüfen | frei nutzbar |
| Freistellen (rembg/isnet) | Apache 2.0 / MIT | frei |
| three.js | MIT | Lizenzhinweis mitliefern |
| Schriften Marcellus, Alegreya Sans | SIL OFL | selbst hosten erlaubt |
| Historische Inhalte, Texte | eigene Texte | frei |

Empfehlung: **privat/unlisted** (nur für Moritz und Familie), kein Verkauf, keine Werbung. Seite mit `noindex` und Credits-Seite. Für öffentliche Verbreitung wären Musik und Stimmen der einzige Knackpunkt (beide NC) – nicht-kommerziell ist erlaubt, Namensnennung nötig.

## 4. Arbeitspakete

**Selbständig (ohne Moritz), Reihenfolge:**
1. `IMP_TARGET` + Abstraktion `STORE`/`SYNC`/`EXPORT`, Cloud- und Mehrspieler-UI nur bei verfügbarem Treiber; Profil-Export/-Import (Spielstände + Siege + Erfolge + Einstellungen) über Teilen-Dialog. *(mittel)*
2. Schriften lokal einbinden (Fallback bleibt), Icons + Manifest erzeugen. *(klein)*
3. `sw.js` mit Precache-Kern, „Alles für unterwegs“, Update-Hinweis, Cache-Aufräumen; `OFF` in der PWA abschalten. *(mittel)*
4. `build_pwa.py` → `dist/` + `imperium_pwa.zip` (Cloudflare-tauglich, keine Datei > 25 MiB), `version.json` mit Hashes, `_headers` (Cache-Control, `noindex`). *(klein)*
5. Tests (Playwright/Chromium): lokal ausliefern, Service Worker installieren, „Alles“ cachen, offline schalten, Neuladen, Spiel starten, Geschichte mit Stimme, Epochenwechsel, Export→Import, Update von v1 auf v2. *(mittel)* – iPad/Safari bleibt ungetestet bis zum echten Gerät.
6. Credits-/Impressum-Seite mit Lizenzhinweisen. *(klein)*
7. Später: Supabase-Treiber für Sync und Online-Mehrspieler (nach Entscheidung).

Aufwand gesamt Pakete 1–6: etwa ein Arbeitslauf (mehrere Stunden Agentenzeit).

**Moritz:**
- Hosting wählen und Konto anlegen (Cloudflare oder GitHub). Bei GitHub: in claude.ai verbinden, dann rolle ich selbst aus.
- Bei Cloudflare ohne Git: das fertige Zip einmal per Drag & Drop hochladen (später je Update erneut, oder Git verbinden).
- Auf dem iPad: Seite öffnen → Teilen → „Zum Home-Bildschirm“, einmal „Alles für unterwegs“; Spielstand aus dem Artifact exportieren und in der App importieren.

**Risiken:**
- Safari: Service-Worker-Cache und Speicherquote auf dem iPad nicht vorab testbar; Gegenmittel: Kern klein halten, Rest optional.
- Zwei Fassungen auseinanderlaufen: durch eine Quelldatei + Build-Skript vermeiden.
- Spielstände getrennt zwischen Artifact und App: Export/Import, später Sync.
- Updates in der App erscheinen erst nach Neuladen (Hinweis-Banner).

## 5. Entscheidungsfragen für Moritz

1. **Hosting:** a) Cloudflare Pages per Zip-Upload (empfohlen, einfach, unbegrenzt) · b) GitHub Pages (ich kann selbst ausrollen, wenn GitHub verbunden ist) · c) Netlify.
2. **Sichtbarkeit:** a) unlisted mit `noindex` (empfohlen) · b) mit Zugangsschutz (Cloudflare Access, E-Mail-Login) · c) öffentlich mit Credits.
3. **Spielstand-Abgleich zwischen Geräten:** a) Export/Import über iCloud-Dateien (empfohlen für den Start) · b) später Supabase-Sync (Konto nötig) · c) nur ein Gerät.
4. **Mehrspieler in der App:** a) vorerst nur Hot-Seat auf einem Gerät (empfohlen) · b) Online über Supabase nachrüsten · c) Mehrspieler nur in der Claude-Fassung.
