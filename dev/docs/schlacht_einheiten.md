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
