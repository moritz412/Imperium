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
