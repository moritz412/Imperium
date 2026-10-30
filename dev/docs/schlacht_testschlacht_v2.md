# Testschlacht v2 – Bewegung und Zweikampf (Vorgabe 30.10.2026)

Rückmeldung Moritz zur v1 (`dev/proto/schlacht_spiel.html`): Leistung am iPad gut. Aber: Einheiten bewegen sich zu gleich und stehen
im Raster, zwei Blöcke prallen aufeinander und gehen kaum ineinander, und statt eines echten Kampfes gibt es nur „Gepiekse“.
v2 baut auf v1 auf (gleiche Datei, gleiche Oberfläche, gleiche `window.SCHLACHT`-Schnittstelle) und ändert Bewegung und Kampf grundlegend.

## 1. Jede Figur ist ein eigener Körper
- Je Soldat Position, Geschwindigkeit, Blickrichtung (weich drehen, max. ~240°/s), eigenes Tempo (±12 %), eigene Reaktionszeit (0–0,4 s Verzögerung beim Losgehen).
- Formation ist nur noch ein **Ziel**: jeder Soldat steuert seinen Platz an (Ankunftsverhalten, Beschleunigung ~3 m/s², Bremsen), Plätze mit kleinem festem Versatz (±0,25 m), Reihen leicht versetzt.
- Abstand halten: Trennkraft zu Nachbarn (Raster-Hash, Zellgröße 2 m, nur Nachbarzellen prüfen; Mindestabstand 0,75 m), auch zu Feinden und zu Leichen (leicht).
- Beim Marsch lockert sich die Formation (hinten hängt etwas nach), beim Halten zieht sie sich wieder zusammen.
- Laufen/Gehen-Clip und Abspielgeschwindigkeit nach tatsächlicher Geschwindigkeit des Soldaten (Füße rutschen weniger).

## 2. Zusammenstoß: Front löst sich in Zweikämpfe auf
- Sobald zwei feindliche Einheiten sich auf ~6 m nähern, wechseln ihre Soldaten in **Kampfmodus**: jeder sucht sich einen Gegner (nächster freier Feind, höchstens 2 Angreifer je Verteidiger), geht auf ~1,1 m heran und richtet sich auf ihn aus.
- Hintere Reihen rücken nach und füllen Lücken; wer keinen Gegner hat, drängt nach vorn (Ziel: hinter dem nächsten kämpfenden Kameraden) – so entsteht eine zerfranste, ineinander verzahnte Kampflinie statt zweier Blöcke.
- Ansturm: Einheit im Laufen (Angriff) trifft mit Wucht: die ersten 2 s Bonus auf Treffer, getroffene Gegner können umgeworfen werden (treffer-Clip, kurz außer Gefecht) und weichen zurück.
- Druck: die unterlegene Seite (weniger Kämpfer, schlechtere Moral) weicht schrittweise zurück (ausweichen-Clip), die überlegene rückt nach.

## 3. Zweikampf statt Zufallsverluste
- Jeder Kämpfer hat Leben (Hastati 3, Libyer 3, Iberer 2,5, Kelten 2,5 – Kelten ohne Rüstung, aber Ansturm) und einen Angriffstakt (1,1–1,8 s, zufällig je Schlag).
- Ablauf eines Schlags: Clip wählen (schlag_a Stoß, schlag_b Hieb von oben, schlag_c seitlicher Hieb, schild_stoss; Speerträger stoss_speer) → **Trefferzeitpunkt bei ~50 % der Clip-Länge** → Verteidiger reagiert: Parade mit Schild (parade oder abwehr_schild, Chance aus Abwehr/Angriff, Ermüdung, von der Seite/hinten keine Parade) oder Ausweichen, sonst Treffer (treffer-Clip, Leben −1; schwerer Hieb −1,5).
- Leben 0 → Tod: sterben_vorn, wenn der Schlag von hinten kam, sonst sterben_hinten (Blickrichtung des Toten zählt, prüfen!). Leiche bleibt liegen und ist Hindernis.
- Wartende Kämpfer spielen kampf_bereit (Schleife), nicht stehen.
- Verluste entstehen **nur** aus diesen Zweikämpfen. Moral wie v1, aber getrieben von echten Verlusten, Flanke, Übermacht im Zweikampf, Feldherr/Banner in der Nähe (optional).
- Ermüdung je Soldat: steigt bei Laufen und Kampf, senkt Trefferchance und Parade; Anzeige auf der Einheitenkarte (z. B. dünner Balken).

## 4. Übergänge
- Zwei Clips gleichzeitig im Shader: aAnim (neu) und aAnimAlt (vorher) plus Überblendung über 0,2 s (Mischen der beiden Skinmatrizen). Kein harter Sprung mehr bei Clip-Wechsel.

## 5. Flucht und Verfolgung
- Fliehende rennen einzeln, nicht als Block (Streuung, unterschiedliche Richtung ±25°), werfen nicht um; Verfolger fallen einzeln Fliehende an.
- Kettenflucht schwächer als in v1: Nachbarflucht nur, wenn die Nachbareinheit selbst schon Verluste hat oder bedrängt ist.

## 6. Leistung
- iPad Pro 11" (2. Gen.) lief mit v1 flüssig. v2 darf nicht spürbar langsamer werden: Raster-Hash statt alle-gegen-alle, keine Speicheranforderungen im Bildablauf, Kampf-Logik in festen Schritten (z. B. 20 Hz), Bewegung jedes Bild.

## 7. Clips in den Paketen (neu gebacken 30.10.)
stehen, gehen, laufen, fliehen, stehen_bereit, kampf_bereit (Schleife), schlag_a, schlag_b, schlag_c, stoss_speer, schild_stoss,
abwehr_schild, parade, ausweichen, treffer, sterben_vorn, sterben_hinten, jubeln.

## 8. Prüfen
- `window.SCHLACHT` wie v1, zusätzlich je Einheit `lebend`, `kaempfend`, `muede`. Automatischer Durchlauf (Tempo 4) bis Endtafel ohne Konsolenfehler.
- Sichtprüfung im Bild: Front verzahnt sich, Zweikämpfe mit Parade/Treffer/Tod erkennbar, Fliehende verstreut.
- Echtes iPad: nicht getestet, bis Moritz es meldet. Keine Bildraten aus Software-Rendering berichten.

## Stand v2 (umgesetzt in `dev/proto/schlacht_spiel.html`)
**Gebaut:** Soldaten als eigene Körper (Position, Geschwindigkeit, Blickrichtung, Leben, Müdigkeit), Formation nur als Ziel (Ankunftsverhalten, Versatz ±0,25 m, versetzte Reihen, Lockerung beim Marsch über `u.loose`), Raster-Hash (2 m) für Abstand und Gegnersuche, Kampfmodus ab 6 m, Zweikämpfe (höchstens 2 Angreifer je Verteidiger, bevorzugt Rückschlag auf den Angreifer), Schlag mit Trefferzeitpunkt bei 50 % der Clip-Länge, Ergebnis (Parade/Ausweichen/Treffer) kurz davor aus Angriff, Abwehr, Müdigkeit und Blickwinkel gewürfelt, Tod nur aus Leben ≤ 0, Druck/Zurückweichen der Unterlegenen, Ansturm (2 s, wirft um), einzelne Flucht (±25°), Verfolger fallen einzelne Fliehende an, Überblendung 0,2 s im Shader (`aAnim`, `aAnimAlt`, `aLoop` = vec3 Schleife/Schleife alt/Blendstart). Kampflogik 20 Hz (`kampfTick`), Bewegung jedes Bild (`figuren`), keine Speicheranforderung im Bildablauf.
**Schnittstelle:** wie v1, je Einheit zusätzlich `lebend`, `kaempfend`, `muede` (0–1); neu `SCHLACHT.zaehler` (schlaege, parade, ausweich, treffer, kills, umgeworfen, rueckweich, fliehende) und `SCHLACHT.soldat(id)`. `gefallen` und `zaehler.kills` zählen nur in `sterbe()` (Zweikampf).
**Stellschrauben (Code, Abschnitt 3):** `TICK` 0,05 s · `DREH` 4,19 rad/s · `BESCHL` 3 / `BREMS` 6 m/s² · `SEP/SEP_F/SEP_L` 0,75/0,85/0,62 m · `KONT_R` 6 m, `KONT_HALT` 1,5 s · Suchradius 8 m, dann 14 m · `MAXANG` 2 · Leben je Kit `hp` (3 / 3 / 2,5 / 2,5) · Schlagperiode 1,1–1,8 s (× (1+0,4·Müdigkeit)) · Parade `0,42/Verhältnis` (0,08–0,65, nur von vorn, halb wenn selbst im Schlag), Ausweichen `0,16/Verhältnis` (0,02–0,3, nicht von hinten) · Schaden schlag_a 1, schlag_b 1,5, schlag_c 1,1, Speer 1,2, Schildstoß 0,5 (wirft um); Seite ×1,15, Rücken ×1,35 · Ansturm: Angriff × (1+(ans−1)·0,7) für 2 s, 40 % Umwerfen · Müdigkeit: Laufen +0,012/s, Gehen +0,002/s, Schlag +0,02, Treffer +0,01, Rast −0,012/s; wirkt −40 % auf Angriff/Abwehr · Moral wie v1 (0,6 je Gefallenem × Flanke, Flucht der Nachbarn −4 nur wenn selbst bedrängt/mit Verlusten, Flanke −1,5/s, Ansturm −3/−7), neu: Übermacht −0,35·Druck/s, Treffer von der Seite/hinten −0,2/−0,4, eigener Kill +0,25.
**Nicht umgesetzt / Grenzen:** Feldherr/Banner-Einfluss auf Moral (optional) fehlt; Marschbefehl im Gefecht löst die Einheit für 2,5 s vom Kampf, Verfolger greifen aber weiter an; Kollision nur Positionskorrektur (keine Kräfte), bei sehr hohem Tempo (>10×) möglich leichtes Durchdringen; echtes iPad nicht getestet.
