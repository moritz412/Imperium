# Echtzeitschlacht – Integration ins Hauptspiel (Prüfung 30.10.2026)

Wunsch Moritz: bald integrieren; eigener Schwierigkeitsgrad nur für Echtzeitschlachten.

## 1. Ist-Zustand

**Hauptspiel `dev/imperium.html`** hat schon eine ältere Echtzeitschlacht (rund 90 KB Code):
- Funktionen `startBattle`, `mkUnit`, `buildTerrain`, `battleFrame`, `battleTap`, `buildBattleUI`, `endBattle`, `teardownBattle`.
- Aufgerufen über „Schlacht schlagen“ beim eigenen Angriff (`openAttack…`, ~Z. 17828) und bei gegnerischem Angriff (~Z. 19642). Daneben gibt es „Berechnen“ (`resolveAttack`).
- Sie kann bereits einiges, das die neue Schlacht übernehmen muss:
  - Speichern vor der Schlacht (`KEY_BATTLE`, nicht im Mehrspieler)
  - Garnison als Miliz-Einheiten
  - Feldherr als eigene Einheit mit Fähigkeiten Sammeln/Anfeuern (`B.ab`)
  - Verstärkungen beider Seiten (`attRe`/`defRe`)
  - Mauern mit Leitern (`B.wall`)
  - Zeitgrenze 480 s
  - Rückschreiben der Männer (`u.ref.men`), danach `concludeAttack`
- Die Schlacht nutzt den Renderer der Kampagne mit eigener Szene `B.scene`.

**Kampagnen-Schwierigkeit:**
- `DIFF` (Leicht/Normal/Schwer), gewählt im Startbildschirm (`renderDiff`, `#diffSeg`), gespeichert als `S.diff`.
- Sie wirkt auf die KI-Wirtschaft, Kriegsbereitschaft und Heeresgröße, nicht auf Kämpfe.

**Neue Testschlacht `dev/proto/schlacht_spiel.html`** (~180 KB, Three r128 wie das Spiel):
- Kampfsystem:
  - Einzelsoldaten mit Zweikämpfen
  - Fernkampf, Reiterei, Moral und Flucht
  - Werte aus der Kampagne über `schlachtEinheit()`
- Darstellung:
  - Figurenpakete (je Kit ~2,2–2,8 MB, Pferd 0,4 MB)
  - Gelände, Bewuchs, Licht und Schatten, Blut
- Ton: 14 Musikstücke, ~85 Geräusche.
- Oberfläche: Einheitenkarten mit Kampagnenbildern.

## 2. Was für die Integration noch fehlt

| Nr. | Paket | Inhalt | Aufwand |
|---|---|---|---|
| I0 | **iPad-Test (Moritz)** | Testschlacht mit ~600 Figuren und Reiterei auf dem iPad: flüssig? Ton? Speicher? Ohne diesen Test kein Einbau. | kurz |
| I1 | Gerüst | Schlachtcode als eigener Script-Block in `imperium.html`. Er nutzt den vorhandenen Renderer wie die alte Schlacht (kein zweiter WebGL-Kontext, wichtig fürs iPad). Ein- und Ausstieg, Kampagnenszene pausieren und wieder aufbauen. Die alte Schlacht bleibt als Rückfall. | groß |
| I2 | Datenbrücke | Kampagnen-Einheit → `schlachtEinheit` (Rolle, Variante, Volk, Kultur, Epoche, Ausrüstungs-Epoche, Waffen, Rüstung, Elite, Rang). Männer → Figuren (120 Mann ≈ 40 Figuren; Verluste zurückrechnen). Garnison und Verstärkungen. Ergebnis: Männer, Erfahrung/Rang, Feldherr verwundet/gefallen, dann `concludeAttack`. | mittel |
| I3 | Feldherr | Leibwache als Reitereinheit, Aura (Moral), Fähigkeiten Sammeln/Anfeuern wie bisher. Fehlt in der Testschlacht. | mittel |
| I4 | Schwierigkeit Echtzeit | siehe Abschnitt 3 | klein |
| I5 | Laden/Offline | Nur benötigte Kits laden. Ladeschirm mit den vorhandenen Schlacht-Ladebildern. Figurenpakete und Ton in `OFF_MAN` (Größe), `OFF_VER` erhöhen. Pakete zusammen ~35 MB: in den Offline-Speicher erst nach dem ersten Laden aufnehmen? | mittel |
| I6 | Gelände aus Provinz | Höhenfeld-Saat je Provinz. Bewuchs und Farben nach Klima (Mittelmeer, Steppe, Wüste, Wald, Schnee). Fluss/Furt später. | mittel |
| I7 | Ton zusammenführen | Schlachtmusik und Geräusche über das `AUDIO`-System der Kampagne (Lautstärke-Einstellungen, Stumm). Ton auf dem Handy ist noch offen. | klein–mittel |
| I8 | Oberfläche | Übergänge Vorschau → Aufstellung → Schlacht → Endtafel → Kampagne. Knopf „Rückzug“ (Schlacht verlassen = Rückzug mit Verlusten). Nach der Design-Leitlinie, Knöpfe in einer Spalte. | mittel |
| I9 | Tests | Playwright: Kampagne → Schlacht → zurück, Verluste stimmen, Speichern/Laden nach der Schlacht, Verteidigungsschlacht, Garnison. | mittel |

**Später, nicht für den ersten Einbau:**
- Belagerung mit Mauern (S13)
- Elefanten, Wagen, Kamele, Artillerie mit eigenen Modellen
- Figuren für Mittelalter und Neuzeit (E3)
- Seeschlachten

## 3. Vorschlag Schwierigkeitsgrad Echtzeitschlacht

- Eigene Einstellung `S.bdiff`, unabhängig von der Kampagnen-Schwierigkeit.
- Auswahl im Startbildschirm unter der Kampagnen-Schwierigkeit („Schlachten: Leicht · Normal · Schwer · Sehr schwer“). Im laufenden Spiel jederzeit in den Einstellungen änderbar.
- Sie wirkt nur in der Echtzeitschlacht und nur auf die KI-Seite. „Berechnen“ bleibt davon unberührt.

| | Leicht | Normal | Schwer | Sehr schwer |
|---|---|---|---|---|
| Angriff/Abwehr der KI | ×0,9 | ×1 | ×1 | ×1,1 |
| Moral der KI | −10 | ±0 | +5 | +10 |
| KI-Reaktionszeit | 2 s | 1 s | 0,5 s | 0,5 s |
| KI-Taktik | frontal, keine Flankenmanöver | Flanken mit Reiterei | Flanken, Lösen und neu anstürmen, Fernkämpfer gezielt | wie Schwer, dazu Reserve zurückhalten |
| Hilfen für den Spieler | Hinweise auf Flankengefahr | – | – | – |

Die KI-Seite wird nur in der Schlacht stärker oder schwächer gerechnet. Die Kampagnenwerte der Einheiten bleiben unverändert.

## 4. Entscheidungen für Moritz

1. **Einbauweg:**
   - Empfohlen: Schlachtcode direkt in `imperium.html`, gleicher Renderer.
   - Alternative: eigene Seite. Das ergäbe zwei WebGL-Kontexte und eine Datenübergabe per Nachricht, was auf dem iPad riskanter ist.
2. **Umfang des ersten Einbaus:**
   - Empfohlen: neue Schlacht nur in der Antike (Epoche 0) und ohne Mauern; sonst weiter die alte Schlacht.
   - Grund: Für spätere Epochen gibt es noch keine Figuren.
3. **Schwierigkeitsstufen:** wie in Abschnitt 3?
4. **Mehrspieler:** Echtzeitschlacht dort vorerst nicht anbieten (nur „Berechnen“)?

## 5. Reihenfolge

1. I0 iPad-Test
2. I1 + I2 Gerüst und Datenbrücke, nur Antike
3. I4 Schwierigkeit
4. I3 Feldherr
5. I8 Oberfläche/Übergänge
6. I5 Laden/Offline
7. I7 Ton
8. I6 Gelände aus Provinz
9. I9 Tests vor der Veröffentlichung

Je Paket ein Unteragent (Sonnet), Prüfung im Hauptchat. Vorher noch offen in der Testschlacht:
- Balance (Rom verliert die Vorlagen)
- Sarissa im Kampf nicht zweihändig gesenkt
- „Lösen“ im dichten Gefecht: Reste werden beim Sammeln wieder gestellt
