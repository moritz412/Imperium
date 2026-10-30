# Echtzeitschlacht – Einheiten aus der Kampagne (Plan 30.10.2026)

Vorgabe Moritz: „Für die Integration in das Hauptspiel sollen die einzelnen Einheiten die Werte und Stärken haben, wie wir sie auf der
Kampagnenkarte haben. Für jeden Typ soll es eine Echtzeiteinheit geben. Im späteren Verlauf für jede Einheit eine eigens gestaltete
Echtzeiteinheit. Am Anfang generalisieren, aber immer granularer werden.“

## 1. Was die Kampagne schon liefert (`dev/imperium.html`)
- `ROLES`: Grundrollen spear/sword/missile/cav/art mit `str`, `men`, `cost`, `upk` (Speer 7/120, Nahkampf 9/120, Fern 5,5/100, Reiter 11/60, Artillerie 13/40).
- Sondereinheiten (z. B. `libyer`, `numid`, `scutar`, `manipel` …): `role`, Epochen `ep/e1`, Kulturen `g`, Faktoren `m` (str, cost, upk) und
  Kampf-Boni `b` (def, atk, mor, spd, chg, range, ratk, ammo, skirm …), Beschreibung `d`, Aufwertung `up`.
- Zustand im Spiel: Mannstärke der Einheit, Erfahrung/Veteranen, Moral des Heeres, Feldherr mit Eigenschaften, Epoche/Forschung, Kultur des Volkes.
- Bilder: `PIC.unit(f,role,e,name)` (Bildbogen `img/u_sheet.webp`, Epochenbilder `u_e<N>_<rolle>`).
- Schlacht-Profile: `dev/schlacht/profile_truppen.json` – 333 Einträge (108 Sondereinheiten + 225 Grundeinheiten je Kulturgruppe × Epoche × Rolle) mit Kit-Familie und Ausrüstung.

## 2. Übersetzung Kampagne → Echtzeit (eine Funktion, eine Tabelle)
`schlachtEinheit(einheit, volk)` liefert `{kit, bild, figuren, werte}`:
- **Werte:** Echtzeit-Grundwerte je Rolle (Tabelle `ECHT_ROLLE`: Angriff, Abwehr, Leben, Moral, Gehen/Laufen m/s, Reichweite, Munition, Ansturm) ×
  Kampagnen-Faktoren: `m.str` → Angriff und Abwehr (je √str, damit Stärke nicht doppelt wirkt), `b.atk/def` direkt, `b.mor` additiv, `b.spd` → Tempo,
  `b.chg` → Ansturm, `b.range/ratk/ammo/skirm` → Fernkampf/Plänkeln. Epoche: Faktor aus dem Stärke-Verlauf der Kampagne.
  Erfahrung: +4 % Angriff/Abwehr je Stufe, +3 Moral. Feldherr: Fähigkeit aus `profile_charaktere.json`.
- **Figurenzahl:** aus der Mannstärke der Kampagne (Standard 1 Figur = 3 Mann, Einstellung „Einheitengröße“), Verluste werden zurückgeschrieben.
- **Bild:** dasselbe wie auf der Kampagnenkarte (`PIC.unit`).
- **Figuren (Kit):** Profil-Eintrag der Einheit → Kit. Fehlt ein eigenes Paket, greift die Kit-Familie, sonst die Grundrolle der Epoche (Rückfallkette).
- Die gleiche Formel rechnet auch „Ausgang berechnen“, damit beide Wege gleich fair sind.

## 3. Stufen der Granularität
| Stufe | Figuren | Umfang | Aufwand |
|---|---|---|---|
| **E1 – verallgemeinert** | je Kit-Familie ein Paket (20 Familien, `profile_truppen.json`), Farben je Volk/Einheit per Tönung im Shader (Tunika-/Schildfarbe als eigene Farbmarke gebacken, im Shader ersetzt – keine Extra-Pakete) | jede Kampagnen-Einheit bekommt sofort eine Echtzeit-Einheit mit eigenen Werten, Bild und passender Familie | Bau-Skript je Familie (Kits aus Teilen), Shader-Tönung, Übersetzungsfunktion |
| **E2 – Sondereinheiten** | eigene Pakete für die 108 Sondereinheiten aus ihrem Profil (`teile`: Helm, Schild, Waffe, Rüstung → Formteile aus `teile_form.py`) | Libyer, Scutarii, Velites … sehen jeweils eigen aus | Profil-Text → Teile-Zuordnung, Formteile ergänzen |
| **E3 – je Volk/Epoche** | Grundeinheiten je Kulturgruppe × Epoche eigen (225 Profile) | jedes Volk eigenes Fußvolk | Kleidung/Helme je Kultur |
| **E4 – Feinschliff** | Körper-/Clip-Varianten, Reiter, Elefanten, Kamele, Geschütze, Belagerung | volle Vielfalt | P1–P6 laut `dev/pc/plan_schlacht_pc.md` |

## 4. Bezug zum Stand heute
- Die Testschlacht hat 7 handgebaute Kits (A1 Hastatus, A1 Veles, A2, A3, A4, A6, A7) = Teil von E2. Ihre Werte sind noch frei gesetzt → mit E1 aus der Kampagne berechnen.
- Bau-Skript `dev/pc/blender/soldat_bau.py` kann Kits aus Einstellungen bauen; für E1/E2 wird es um „Kit aus Profil“ erweitert.
- Einbau ins Spiel (S1/S3/S4/S6) nutzt `schlachtEinheit()` als einzige Brücke.

## 5. Umsetzung E1 in der Testschlacht (Vorgabe für die Umsetzung, 30.10.)
Daten: `dev/proto/einheiten_kampagne.json` (erzeugt von `dev/schlacht/einheiten_karte_bauen.js` aus `kampagne_einheiten.json` = Auslese von `dev/imperium.html`
durch `dev/schlacht/kampagne_auslesen.js`, und `profile_truppen.json`). Enthält ROLES, UNIT_MOD, EPOCH_STR, FERN_EPOCHE, GRUPPEN, VARIANTS (role, ep, g, n, m, b, d)
und `profile[id]` = {n, rolle, kit, kulturen, epochen, figuren, formation, bild, sheet, paket, paketGenau}.

**`schlachtEinheit(e)`** – Eingabe wie eine Kampagnen-Einheit: `{volk, kultur, rolle, variante, epoche, mann, erfahrung}` (volk = Schlüssel in UNIT_MOD, z. B. 'rom').
1. Profil: Sondereinheit → `profile[variante]`; sonst Grundeinheit → `basis_<gruppe>_e<epoche>_<rolle>` mit passender Kultur (erstes Profil, dessen `kulturen` die Kultur
   enthält und dessen `epochen` die Epoche); sonst irgendein Grundprofil der Rolle in der Epoche.
2. Kampagnenstärke wie `unitStat`: `str = ROLES[rolle].str × (UNIT_MOD[volk][rolle].str / ROLES-str, nur Epoche 0 ohne Variante) × VARIANTS[v].m.str × EPOCH_STR[e] × (Fern: FERN_EPOCHE[e])`.
   Verhältnis zur Grundrolle `q = str / (ROLES[rolle].str × EPOCH_STR[e])`.
3. Echtzeitwerte = Grundwerte je Rolle `ECHT_ROLLE` (spear: Angriff 9, Abwehr 12, Leben 3, Moral 65, Gehen 1,3, Laufen 3,6, Ansturm 1 · sword: 11/10/3/62/1,35/3,8/1,1 ·
   missile: 6/6/2,5/55/1,4/4,0/0,8 + Fern {Reichweite 55 m, Nachladen 3,5 s, Munition 15, Schaden 1,0} · cav: 12/9/3,5/70/2,0/8,0/1,8 · art: 4/4/2/50/1/2/0)
   × √q (Angriff, Abwehr) × b.atk / b.def; Moral + b.mor × 2; Tempo × b.spd; Ansturm × b.chg; Fern: Reichweite × b.range, Schaden × b.ratk, Munition × b.ammo;
   Plänkeln = b.skirm; Pike = b.pike (Abwehr frontal gegen Ansturm ×1,5). Erfahrung: +4 % Angriff/Abwehr, +3 Moral je Stufe. Die bisherigen Fern-Werte von Velites
   (Wurfspeer) und Balearen (Schleuder) bleiben als Waffenart erhalten und werden nur mit den Faktoren skaliert.
4. Figuren: `round(mann / 3)`, höchstens 60; Paket: `profile.paket` (Rückfall-Kennzeichen `paketGenau=false` → im Einheitenfenster „Figuren vorläufig“).
5. Bild wie in der Kampagne: Sondereinheit mit `sheet ≥ 0` → Ausschnitt aus `../../img/u_sheet.webp` (8 Spalten à 192 px, CSS background-position);
   Grundeinheit → `u_e<epoche>_<rolle>` aus `../../img/pb_ui.json` (Daten-URLs, erst bei Bedarf laden); sonst Platzhalter.
6. Die Testschlacht bekommt **keine frei gesetzten Werte mehr**: Aufstellung als Kampagnen-Einheiten, z. B. Rom (volk 'rom', Kultur latein, Epoche 0):
   3 × Grund-Nahkampf (= Hastati) + 1 × Grund-Fernkampf (= Velites); Karthago: 2 × `libyer`, 1 × `scutar`, 1 × `balear`, 2 × Grund-Nahkampf Kultur keltisch.
   In der Aufstellung eine Auswahl „Gefecht“ mit 3 Vorlagen: Rom gegen Karthago (wie oben), Rom gegen Makedonien (`phalanx`, `hoplit`, Thureophoroi = Grund-Speer hellenistisch …),
   Rom gegen Kelten (`langschw`, `galater`, `soldurii` …) – zeigt, dass jede Einheit aus der Kampagne kommt (mit Rückfall-Figuren, wo noch kein Paket existiert).
7. Einheitenfenster: Kampagnenstärke (Zahl wie auf der Karte), abgeleitete Echtzeitwerte, Sonderfähigkeiten (Plänkeln, Pike, Ansturm), Beschreibung `d`, Figuren-Herkunft.

## 6. Aufwertungen (Hinweis Moritz 30.10.: „man kann ja auch Rüstungen und so weiter upgraden – im Schritt 2 beachten“)
Kampagne je Einheit: `u.wpn` Waffen 0–2 (Angriff +8 %/Stufe), `u.arm` Rüstung 0–2 (Abwehr +8 %/Stufe), `u.tier` Aufwertung/Veteranen (Stärke ×1,2),
Rang (`rankOf` → R.b auf Angriff/Abwehr, R.m auf Moral), `u.ep` Epoche der Ausrüstung (veraltet bis „Modernisieren“).
- **Werte (E1):** schlachtEinheit() übernimmt alle fünf (so wie `st.atkM/defM/morB` in der Kampagne).
- **Aussehen (E2 ff.):** Aufwertungen sollen man **sehen**: je Kit Ausrüstungsstufen als Teile-Varianten – Rüstung 0 = Tunika/Leinen, 1 = Brustplatte/Lederpanzer,
  2 = Kettenhemd/Schuppenpanzer bzw. epochentypisch besser; Waffen 0–2 = einfachere/bessere Klinge, Speerspitze, Schildbeschlag; Veteranen = Helmbusch/Zier,
  Feldzeichen; veraltete Epoche = Teile der älteren Epoche. Umsetzung: Teile je Stufe als eigene Formteile im Paket (alle Stufen im selben Paket, Auswahl je Einheit
  per Sichtbarkeit/Instanz-Flag im Shader), damit keine zusätzlichen Pakete entstehen.

## Stand E1 (30.10.2026) – gebaut in `dev/proto/schlacht_spiel.html`
**Was ist drin:** Abschnitt „E1 SCHLACHT-EINHEIT AUS DER KAMPAGNEN-EINHEIT“ (eigenständig, verschiebbar): `schlachtEinheit(e)`, Tabellen `ECHT_ROLLE`, `ECHT_FERN`,
`ECHT_PAKET`, `ECHT_RANG`, `FERN_PAKET`, Vorlagen `GEFECHTE`. Daten werden beim Laden aus `einheiten_kampagne.json` geholt. Alle Einheiten der Testschlacht entstehen aus
Kampagnen-Beschreibungen `{volk, kultur, rolle, variante, epoche, mann, waffen, ruestung, tier, rang, ausruestungEpoche}`; es gibt keine frei gesetzten Werte mehr.
Knopf „Gefecht“ (Aufstellung) öffnet die Auswahl der 3 Vorlagen; Figurenpakete werden nur für die gewählte Vorlage geladen. `SCHLACHT.einheit(desc)`, `SCHLACHT.gefecht(id)`.
Bilder wie in der Kampagne (`u_sheet.webp` per Index, sonst `u_e<Epoche>_<Rolle>` aus `pb_ui.json`). Einheitenfenster: Kampagnenstärke, Werte, Fähigkeiten, Waffen-/Rüstungsstufe, Rang/Aufwertung,
Beschreibung, Figurenherkunft („Figuren vorläufig“ bei `paketGenau=false`).

**Formel (endgültige Konstanten):**
- `str = (UNIT_MOD[volk][rolle].str nur Epoche 0 ohne Variante, sonst ROLES.str) × VARIANTS.m.str × EPOCH_STR[ue] (Fern × FERN_EPOCHE[ue])`, `tier` → `× 1,2` (je Schritt auf 0,1 gerundet wie `unitStat`/`uStat`); `ue` = Epoche der Ausrüstung (höchstens Einheitsepoche)
- `q = str / (ROLES.str × EPOCH_STR[ue])`
- Angriff = Grund × √q × b.atk × (1+Rang.b) × (1+0,08·Waffenstufe) · Abwehr = Grund × √q × b.def × (1+Rang.b) × (1+0,08·Rüstungsstufe) · Moral = Grund + 2·b.mor + Rang.m
- Tempo × b.spd · Ansturm × b.chg · Fern: Reichweite × b.range, Schaden × b.ratk, Vorrat × b.ammo · Pike: Abwehr ×1,5 gegen Ansturm von vorn
- Grundwerte (Angriff/Abwehr/Leben/Moral/Gehen/Laufen/Ansturm): Speer 9/12/3/65/1,3/3,6/1 · Nahkampf 11/10/3/62/1,35/3,8/1,1 · Fern 6/6/2,5/55/1,4/4,0/0,8 · Reiter 12/9/3,5/70/2/8/1,8 · Artillerie 4/4/2/50/1/2/0
- Rang (wie `RANKS`): 0 Rekruten 0/0, 1 Erprobt 5 %/+5, 2 Veteranen 10 %/+10, 3 Elite 15 %/+15, 4 Legendär 20 %/+25
- Waffenart Fernkampf nach Paket: `A1_veles` Wurfspeer (30 m, 5 Speere, Schaden 1,6), `A4_balearisch` Schleuder (70 m, 25 Steine, Schaden 0,8). Fernkämpfer ohne eines dieser Pakete bekommen `A1_veles` (vorläufig).
- Figuren = round(mann/3), 4–60 (Plätze: 60 je Einheit, Raster 10 breit); KI-Stil: Ansturm ≥ 1,6 stürmt zuerst, Nahkampf sonst läuft zuletzt, Speer marschiert.

**Berechnete Werte der drei Vorlagen** (Angriff/Abwehr/Moral, Tempo Gehen/Laufen m/s; * = Figuren vorläufig; Fern = Reichweite m / Schaden / Vorrat je Mann):
| Vorlage | Einheit | Kampagnenstärke | Fig. | Angriff | Abwehr | Moral | Tempo | Ansturm | Paket |
|---|---|---|---|---|---|---|---|---|---|
| Karthago | Hastati I | 9,6 | 40 | 11,4 | 10,3 | 62 | 1,35/3,8 | 1,1 | A1_hastatus |
| | Hastati (Veteranen; Rang 2) | 11,5 | 40 | 13,7 | 12,4 | 72 | 1,35/3,8 | 1,1 | A1_hastatus |
| | Hastati II (Waffen 1, Rüstung 2) | 9,6 | 40 | 12,3 | 12,0 | 62 | 1,35/3,8 | 1,1 | A1_hastatus |
| | Velites | 5,5 | 33 | 6,0 | 6,0 | 55 | 1,4/4,0 | 0,8 | A1_veles (Fern 30/1,6/5) |
| | Schwertkämpfer I, II (keltisch) | 9,0 | 40 | 11,0 | 10,0 | 62 | 1,35/3,8 | 1,1 | A6_keltisch |
| | Libysche Speerträger I, II | 8,0 | 40 | 9,6 | 14,8 | 73 | 1,3/3,6 | 1,0 | A2_libysch |
| | Iberische Scutarii | 9,9 | 40 | 11,5 | 11,5 | 62 | 1,35/3,8 | 1,1 | A3_iberisch |
| | Balearische Schleuderer | 6,1 | 33 | 6,3 | 6,3 | 55 | 1,4/4,0 | 0,8 | A4_balearisch (Fern 84/0,92/25) |
| Makedonien | Hastati I | 9,6 | 40 | 11,4 | 10,3 | 62 | 1,35/3,8 | 1,1 | A1_hastatus |
| | Hastati II (Waffen 1, Rüstung 1) | 9,6 | 40 | 12,3 | 11,2 | 62 | 1,35/3,8 | 1,1 | A1_hastatus |
| | Triarii (Grund-Speer) | 7,0 | 40 | 9,0 | 12,0 | 65 | 1,3/3,6 | 1,0 | A1_hastatus |
| | Velites | 5,5 | 33 | 6,0 | 6,0 | 55 | 1,4/4,0 | 0,8 | A1_veles |
| | Pikenphalanx I, II | 8,8 | 40 | 9,1 | 18,2 | 65 | 1,1/3,1 | 1,0 | A7_hellenistisch (Pike) |
| | Hopliten I (Variante hoplit) | 8,0 | 40 | 9,6 | 15,4 | 75 | 1,3/3,6 | 1,0 | A7_hellenistisch |
| | Hopliten II (Grund-Speer) | 8,2 | 40 | 9,7 | 13,0 | 65 | 1,3/3,6 | 1,0 | A7_hellenistisch |
| | Epilektoi/Hypaspisten | 9,0 | 40 | 11,0 | 10,0 | 62 | 1,35/3,8 | 1,1 | A7_hellenistisch |
| | Bogenschützen (Grund-Fern) | 5,5 | 33 | 6,0 | 6,0 | 55 | 1,4/4,0 | 0,8 | A1_veles* (Fern 30/1,6/5) |
| Kelten | Hastati I, II | 9,6 | 40 | 11,4 | 10,3 | 62 | 1,35/3,8 | 1,1 | A1_hastatus |
| | Hastati (Veteranen, Rang 0) | 11,5 | 40 | 12,4 | 11,3 | 62 | 1,35/3,8 | 1,1 | A1_hastatus |
| | Velites | 5,5 | 33 | 6,0 | 6,0 | 55 | 1,4/4,0 | 0,8 | A1_veles |
| | Langschwertkrieger I, II | 10,8 | 40 | 15,1 | 9,3 | 70 | 1,35/3,8 | 1,65 | A6_keltisch |
| | Soldurii | 11,3 | 40 | 13,6 | 11,2 | 98 | 1,35/3,8 | 1,1 | A6_keltisch |
| | Galatische Leibwache | 11,7 | 40 | 15,1 | 11,4 | 82 | 1,35/3,8 | 1,1 | A6_keltisch |
| | Speerkrieger (Grund-Speer keltisch) | 7,0 | 40 | 9,0 | 12,0 | 65 | 1,3/3,6 | 1,0 | A6_keltisch |
| | Plänkler (Grund-Fern keltisch) | 5,5 | 33 | 6,0 | 6,0 | 55 | 1,4/4,0 | 0,8 | A1_veles* (Fern 30/1,6/5) |

**Grenzen E1:** Reiter/Artillerie sind berechenbar, haben aber keine eigenen Figuren/Fernkampf (kein Vorlagen-Einsatz); Fernkampf nur für Rolle „Fernkampf“; Pike nur als Abwehrfaktor
gegen Ansturm; kein Feldherr, keine Verlust-Rückschreibung in die Kampagne; Gleichgewicht der Vorlagen nicht abgestimmt (Rom ist in „Karthago“ 4 gegen 6 Einheiten).

## Stand Reiterei (30.10.)

**Was geht** (`dev/proto/schlacht_spiel.html`, Test `dev/tests/schlacht_reiter_t.js`):
- **Darstellung:** je Reiter ein Platz im Soldatenfeld, aber zwei Instanzen: Pferd (`P_pferd`, Clip nach Tempo: stehen / schritt / trab / galopp / ansturm, Abspielrate = Tempo ÷ Clip-Tempo,
  Sonderclips steigen / treffer / sterben) und Reiter (`A1_eques`, `A2_numidisch`; Sitzclips `reiten`, `lanze_gesenkt`, `stoss_reiter`, `schlag_reiter`, `treffer_reiter`, `wurf_reiter`).
  Die Fußclips der Reiterpakete werden in `kitBauen` über die Tabelle `RIT` auf Sitzclips umgelegt, der übrige Kampfcode blieb unverändert. Reiter sitzt +0,62 m hoch, 0,05 m hinter dem Pferdepunkt,
  beide gleich skaliert (`gr`). Nur Instanzen (keine Einzel-Meshes). Tod: Pferd stürzt und bleibt liegen, der Reiter liegt nach 0,5 s 0,8 m daneben (Blutfleck beider).
- **Bewegung:** Formation 1,6 m × 3,0 m, Kollisionsradius je Figur (`sRad`: Fuß 0,375, Reiter 0,75), trägeres Beschleunigen (3,2) und Bremsen (4,5), Wenderadius (Drehrate wächst mit dem Tempo),
  Pferde laufen nur in Blickrichtung.
- **Ansturm:** Reiter mit > 6 m/s beim Kontakt werden „scharf“ (`sCh`), steuern den nächsten Gegner im Weg an und lösen beim ersten Gegner in 2 m `aufprall()` aus: Schaden nach Tempo × Ansturmwert
  × Richtung (Front 1, Flanke 1,6, Rücken 2), Rückstoß oder Sturz (`stolpern`), Moralschock, Umstehende werden gestoßen; der Reiter dringt 0,9 s weiter ein (ohne Blockwand), dann gewöhnlicher
  Nahkampf (Angriff ×0,8, ohne Schwung). Speerträger (Pike 78 %, Hoplit 66 %, sonst 52 %) wehren von vorn und im Stehen/Gehen ab: Reiter nimmt Schaden, Pferd steigt.
- **Befehl „Lösen“** (Knopf in der Spalte, nur bei Reiterei): Nahkampf abbrechen, 40 m zurück, 3,5 s sammeln, dann neu stürmen. **KI** (`reitKI`): Feind-Reiterei meidet Speere von vorn (Umweg um die Flanke),
  bevorzugt Fernkämpfer, löst sich nach ≥ 5 s Nahkampf, wenn sie verliert. Numider (`fernKI`): reiten in Wurfweite, werfen (`wurf_reiter`), weichen früh (22 m) und weit (45 m) aus.
- **Karte/UI:** Symbol `sy-reiter`. **Gefechte:** je Vorlage 2 Reitereinheiten je Seite an den Flügeln (Equites; Numider und keltische Reiter / Hippeis und Thraker / `auxreit` und keltische Reiter);
  `MAXU` jetzt 16. **Ton:** Einträge für `hufe_galopp`, `hufe_trab`, `wiehern`, `reiter_aufprall`, `pferd_tod` (fehlende Dateien werden still übergangen), Hufteppich je bewegter Reitereinheit, Wiehern und Pferdetod nur anteilig.

**Offen:** Ton nicht gehört/geprüft (Dateien fehlen noch); echtes iPad nicht getestet; Gleichgewicht nur grob (Reiter sterben im Nahkampf schnell, wenn man sie nicht löst);
Elefanten, Wagen, Kamele laufen vorläufig als Pferd + A1_eques; Reiter ohne Lanzen-Modell bei `A2_numidisch` (kein `lanze_gesenkt`); Pferd kippt nicht mit dem Gelände; Kavallerie-Bogenschützen (`harch`) werfen Speere statt zu schießen;
Numider haben nur 3 Wurfspeere je Reiter (Varianten-Boni), danach greifen sie nach der Reiter-KI an; Spieler-Reiterei wird nicht automatisch gelöst.
