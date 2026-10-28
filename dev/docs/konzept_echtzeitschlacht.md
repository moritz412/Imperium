# Konzept: Echtzeitschlachten neu (Entwurf 28.10.2026)

Ziel: wertige Echtzeitschlachten nach dem Vorbild der Total-War-Reihe, mit Ladeschirm und eigenem Datenpaket, ohne nahtlosen Übergang.
Vorbild heißt hier: Spielprinzipien (Einheitengröße, Formationen, Moral, Gelände, Kamera). Keine Benutzeroberfläche und keine Assets eines bestehenden Spiels kopieren (feste Regel).

Alle Leistungs- und Größenangaben unten sind **Schätzungen, nicht gemessen**. Das echte iPad ist nicht getestet. Ob das Konzept trägt, entscheidet erst der Prototyp in Phase 0.

---

## 1. Ist-Stand (v197)

| Bereich | Heute | Problem |
|---|---|---|
| Ablauf | `startBattle` baut eine eigene Szene im selben Canvas, ohne Ladeschirm | keine Zeit für schwere Daten |
| Feld | `BW=34, BD=30` Spielfeld, Gelände 120×110 Ebene (`battleLand`) | zu klein, kaum taktisches Gelände |
| Einheiten | höchstens 14 je Seite + Feldherr, je Figur `u.ratio` Mann | wenige Figuren je Einheit |
| Figuren | aus Grundkörpern zusammengesetzt (`FIGGEO`, `figMerge`), Arme und Beine schwingen per Sinus im Shader (`FIGMAT`) | keine echten Bewegungsabläufe (Gehen, Schlagen, Sterben) |
| Kampf | Regeln in `battleFrame` (Moral, Flanke, Ansturm, Fernkampf, Mauern) | taugt als Grundlage, muss mit mehr Figuren und Nahkampf-Paaren erweitert werden |

Die Kampfregeln können weitgehend bleiben. Neu machen muss man vor allem **Darstellung, Animation, Kartengröße und Ladeablauf**.

---

## 2. Zielbild

- **Eigene Schlachtphase:** Klick auf „Schlacht schlagen“ → Ladeschirm mit Balken (Bild der Region, Kräfteverhältnis, Tipp) → Aufstellung → Schlacht → Ergebnis → zurück zur Karte.
- **Größere Felder:** etwa 3–4-mal die heutige Fläche. Gelände entsteht aus der Provinz der Kampagnenkarte (Relief, Fluss, Wald, Siedlung, Jahreszeit), dazu Aufstellungszonen und Schlüsselstellen (Hügel, Furt, Brücke, Dorf).
- **Figuren mit echten Bewegungen:** Gehen, Laufen, Stehen, Zuschlagen (2 Varianten), Abwehren, Getroffen, Sterben (2), Schießen/Nachladen, Jubeln/Fliehen. Reiter und Pferd: Schritt, Trab, Galopp, Ansturm, Sterben.
- **Mehr Figuren:** Ziel je Seite bis 20 Einheiten mit je 40–60 Figuren, gesamt etwa 2.000–3.000 Figuren gleichzeitig (Stufe „Hoch“). Auf „Leicht“ entsprechend weniger.
- **Kamera:** frei drehen, zoomen bis nah an die Front (die Animationen sollen sich lohnen).

---

## 3. Ist das auf dem iPad machbar? (Technik)

### Kernidee: gebackene Skelett-Animation auf der Grafikkarte
Einzelne animierte 3D-Figuren mit eigenem Skelett (`SkinnedMesh` in three.js) sind für Tausende Figuren zu teuer, weil jede Figur einzeln von der CPU gerechnet und gezeichnet wird.
Stattdessen:
1. Am PC wird jede Animation eines Skeletts in eine **kleine Textur** gebacken (Knochenmatrizen je Bild).
2. Im Spiel gibt es je Figurtyp **ein** `InstancedMesh`. Ein eigener Shader liest pro Figur „welche Animation, welches Bild“ aus der Textur und verformt den Körper selbst.
3. Ergebnis: wenige Zeichenaufrufe für Tausende animierte Figuren. Die CPU setzt pro Figur nur Position, Richtung und Animationsnummer.

Das passt zu three r128 (eigener Shader über `onBeforeCompile`, wie heute schon bei `FIGMAT`). Eine neue Bibliothek ist nicht nötig.

### Detailstufen (LOD)
- Nah: Figur mit ca. 1.000–1.500 Dreiecken, voll animiert.
- Mittel: ca. 300 Dreiecke, gleiche Animation.
- Fern: Bildtafel (vorgerendert am PC, 8 Blickwinkel × wenige Bewegungsbilder).

### Grobe Rechnung (Schätzung)
| Posten | Schätzung |
|---|---|
| Dreiecke im Bild (Hoch, 2.500 Figuren gemischt) | ca. 1–1,5 Mio. |
| Zeichenaufrufe | unter 150 |
| Animationstextur je Skelett (40 Knochen × 15 Clips × 30 Bilder) | unter 1 MB |
| Datenpaket je Kultur und Epoche (Figuren, Ausrüstung, Animation, Gelände-Texturen) | ca. 5–15 MB |
| Alle Pakete zusammen (optional offline, wie die Musik) | ca. 150–300 MB |
| Ladezeit einer Schlacht (Paket im Cache) | einige Sekunden, unbekannt bis gemessen |

**Einschätzung:** Auf einem neueren iPad (M1 oder später) wirkt Stufe „Hoch“ machbar. Auf älteren Geräten (A12–A14) eher „Mittel“ mit der Hälfte der Figuren. Größte Unbekannte ist die Speichergrenze pro Tab (auf dem iPad nutzen Chrome und Safari dieselbe WebKit-Engine). Die Kampagnenkarte muss deshalb während der Schlacht ganz aus dem Grafikspeicher, nicht nur ausgeblendet.

### Übersteigt es das Projekt?
Technisch nicht. Der Aufwand liegt im **Inhalt**: Figuren, Ausrüstung und Animationen für 5 Epochen und viele Kulturen. Deshalb gilt:
- Wenige Grundskelette (Mensch, Pferd, Elefant, Kamel). Alle Figuren eines Skeletts teilen sich die Animationen.
- Vielfalt über **Ausrüstungsteile** (Helm, Schild, Waffe, Umhang) und Farben, nicht über einzelne Modelle je Einheit.
- Schrittweise ausrollen: zuerst eine Epoche und Kultur vollständig, dann erweitern. Bis dahin bleibt die alte Schlacht als Rückfall.

---

## 4. Was der PC übernehmen kann

| Aufgabe | Werkzeug am PC | Ergebnis |
|---|---|---|
| Grundkörper und Skelette | Blender (kostenlos, per Skript ohne Bedienung), Ausgangsmodelle mit freier Lizenz (CC0, z. B. Quaternius) oder eigene Modelle | 4 Skelette mit einheitlicher Knochenbenennung |
| Animationen | CC0-Animationsbibliotheken, auf unsere Skelette übertragen (Retargeting in Blender). Optional: KI-Bewegungserzeugung aus Text (z. B. MoMask), Lizenz vorher prüfen | ca. 15 Clips je Skelett |
| Ausrüstung (Helme, Schilde, Waffen, Standarten) | TRELLIS wie bei den Gebäuden + r3-Nachbearbeitung, oder in Blender modelliert | Teile je Epoche und Kultur |
| Backen | Blender-Skript: Animationstexturen, Detailstufen, Bildtafeln für die Ferne | fertige Spielpakete |
| Gelände | Höhenkarten je Landschaftstyp aus der Kampagnenkarte, Bodentexturen (FLUX oder prozedural) | Schlachtfeld-Vorlagen |
| Bilder | FLUX: Ladeschirme, Einheitenkarten | Bilder je Kultur |
| Stimmen | XTTS: Rufe von Feldherr und Truppe | kurze Clips |
| Vorprüfung | Playwright mit `PW_GPU=1` am PC | grobe Leistungsvergleiche, ersetzt das iPad nicht |

Alles läuft über die bestehende Warteschlange (`_neu\<job>` → `warteschlange`). Blender kommt als neuer Auftragstyp dazu (`blend.json`), nie gleichzeitig mit TRELLIS auf der Grafikkarte.
Neu zu installieren: Blender (~1 GB) und die CC0-Ausgangsdaten. Für jeden Download vorher fragen.

---

## 5. Phasen

**Phase 0: Machbarkeits-Prototyp (Entscheidung danach)**
- Eine Testschlacht: 1 Skelett (Mensch), 2 Einheitentypen (Speer, Schwert), 6 Clips, 2.500 Figuren, einfacher Boden.
- Ladeschirm mit Balken, eigenes Paket.
- Messung **auf deinem iPad** (die Leistungsanzeige gibt es schon): Bilder pro Sekunde, Ladezeit, ob der Browser abstürzt.
- Weiter nur bei mindestens 30 Bildern pro Sekunde auf „Mittel“ (Schwelle zu entscheiden).

**Phase 1: Schlachtphase und Karte**
- Eigener Ablauf mit Ladeschirm, Aufräumen der Kampagnenszene, Rückkehr.
- Größeres Feld aus der Provinz erzeugt, Aufstellungszonen, Schlüsselstellen.

**Phase 2: Figurensystem**
- Skelette Mensch und Pferd, voller Clip-Satz, Ausrüstungsteile, Detailstufen.
- Nahkampf-Paare (zwei Figuren schlagen aufeinander ein statt nur „ineinander stehen“).

**Phase 3: Kampfregeln anpassen**
- Mehr Figuren je Einheit, Formationen (Linie, Keil, Schildwall, Karree), Ermüdung, Ansturmwucht.
- KI-Verhalten nur vorsichtig ändern (feste Regel).

**Phase 4: Inhalte ausrollen**
- Epoche für Epoche, Kultur für Kultur über die PC-Warteschlange. Elefant, Kamel, Geschütze und Belagerung zuletzt.

**Phase 5: Feinschliff**
- Klänge, Staub und Rauch, Kamerafahrten, Siegbild.

---

## 6. Risiken

- **Browser-Speicher (WebKit):** Stürzt die Seite ab, muss das Paket kleiner werden (weniger Figuren, kleinere Texturen).
- **Einheitlicher Look:** Modelle aus verschiedenen Quellen passen schlecht zusammen. Gegenmittel: ein gemeinsamer Grundkörper und eine einheitliche Farbgebung.
- **Lizenzen:** nur CC0/frei nutzbare Ausgangsdaten. KI-Bewegungsmodelle haben oft Forschungslizenzen (für das nicht-kommerzielle Projekt meist in Ordnung, trotzdem einzeln prüfen).
- **Aufwand:** Das ist das größte Paket bisher, größer als Wikinger- und Hannibal-Paket. Wer es vorzieht, verschiebt die anderen.
- **Spielstände:** Schlachten bleiben auflösbar (Auto-Ergebnis), alte Stände müssen weiter laden.

---

## 7. Offene Entscheidungen für Moritz

1. Phase 0 jetzt starten (vor Wikinger- und Hannibal-Paket) oder danach?
2. Mindestgerät: welches iPad muss „Mittel“ flüssig schaffen? (Modell nennen, dann Zielwerte festlegen.)
3. Darf der PC Blender und CC0-Ausgangsdaten herunterladen und installieren?
4. Stil: näher am heutigen gemalten Look (Figuren leicht stilisiert) oder realistischer?
5. Soll die alte Schlacht als Option „Schnelle Schlacht“ bleiben?

---

## 8. Entscheidungen (Moritz 28.10.)

- Gerät: **iPad Pro 11" (2. Generation, 2020, A12Z, 6 GB)**. Damit ist das Zielgerät kein M1: Phase 0 misst genau dort. Startwerte: „Mittel“ ≈ 1.200–1.500 Figuren, „Hoch“ ≈ 2.500 (beides Schätzungen).
- PC darf Blender und CC0-Ausgangsdaten laden: **ja**.
- Stil: **realistisch** (Proportionen, Rüstung und Stoffe naturnah; keine Comic-Figuren). Folge: CC0-Grundkörper müssen realistisch sein, ggf. eigener Grundkörper in Blender.
- Alte Schlacht als Option „Schnelle Schlacht“: **nein**. Sie bleibt nur intern als Rückfall, bis die neue Schlacht für die jeweilige Epoche fertig ist, und wird dann entfernt.
- Reihenfolge (Empfehlung Claude): Phase 0 zuerst (klein, entscheidet die Machbarkeit). Das Wikinger-Paket ist überwiegend Kampagne und Erzählung und kann danach normal laufen. Das Hannibal-Paket (Cannae, Trebia) erst nach dem neuen Schlachtsystem, sonst doppelte Arbeit.

---

## 9. Ergebnis Phase 0 (iPad Pro 11" 2. Gen, Chrome – auf dem iPad mit WebKit-Engine wie Safari, 28.10. 13:06, Screenshots von Moritz)

| Figuren | Kamera | Bilder/s | schlechtester Wert | Dreiecke gesamt | Zeichenaufrufe | Pixelverhältnis |
|---|---|---|---|---|---|---|
| 1.500 | Übersicht | 59,9 | 59,3 | 556.400 | 7 | 2 |
| 1.500 | Front nah | 60,0 | 50,6 | 446.302 | 7 | 2 |
| 2.500 | Front | 60,0 | 57,4 | 446.756 | 7 | 2 |
| 4.000 | Front | 59,9 | 54,8 | 536.062 | 7 | 2 |
| 4.000 | Übersicht | 60,0 | 59,0 | 890.354 | 7 | 2 (Fenster 1194×702) |

- Ladezeit 1,6 s, CPU je Bild 0,7–1,6 ms, kein Absturz bei 4.000.
- Der iPad-Browser begrenzt auf 60 Bilder/s, die echte Reserve ist also unbekannt (größer als null). Ein Lastsprung zeigt sich nur in „schlechtester Wert“ (≥ 50).
- **Bewertung: Phase 0 bestanden.** Die Technik (gebackene Skelett-Animation + Instancing) trägt auf dem Zielgerät mit Abstand.
- Noch nicht abgedeckt: realistische Figuren mit Texturen (mehr Speicher, teurere Pixel), echtes Gelände, Effekte, Spiel-UI, Dauerlast (Wärme, Akku nach 10+ Minuten). Diese Punkte misst der nächste Prototyp-Schritt mit.
