# Imperium der Epochen 2 im Nachtest (Stand v179)

*Getestet im Desktop-Chromium mit Touch-Emulation, iPad quer (1180×820) und Handy quer (844×390), Grafikstufe „mittel“. Gespielt: Rom im Endlosspiel je ~9 Runden auf beiden Größen, alle Hauptbereiche, Angriff bis zur Befehlsblase, Startwelt 1510 mit den Azteken, Stadtansichten von sieben Reichen außerhalb Europas, ein Epochenwechsel 3 → 4. Nicht prüfbar: Ton und Sprachausgabe, echtes iPad/iPhone, Bildrate (Software-Grafik, keine FPS-Angaben), die neuen 3D-Stadtbausätze aus der Nähe auf der Karte (die Kamera fuhr im Testbrowser nicht an fremde Hauptstädte heran) und der Inhalt des neuen Epochenberichts (der Test hat die Fenster nicht erfasst). Screenshots: `scratchpad/shot/rev2/`.*

## Einleitung

Vier Tage nach unserem ersten Test (74 %) liegt eine Version vor, die vieles von dem angegangen ist, was wir kritisiert hatten: neue Menüs, ein Kanal „Jetzt wichtig“ statt Aufgabenflut, gebündelte Epochenwechsel, Verwaltungslast gegen den Goldberg, Kriegsvorwarnung, neue Stadtbausätze für die Welt außerhalb Europas. Die Frage diesmal: Ist aus dem überladenen Prachtband ein aufgeräumtes Spiel geworden?

## Einstieg & Bedienung

Der größte Sprung. Die Kopfleiste trägt jetzt sechs klar benannte Bereiche – Reich, Diplomatie, Wirtschaft, Hof, Chronik, Forschung – und jedes Fenster ist gleich gebaut: Titel, „?“-Kurzhilfe, Reiter, darunter höchstens eine zweite Reiterreihe, oben rechts ein ✕ (`ipad_a1wirtschaft`, `ipad_a3hof`). Die Wirtschaft hat statt sieben nur noch vier Reiter (Haushalt, Waren, Siedlungen, Handel), die Chronik bündelt Protokoll, Buch, Geschichten und Erfolge samt Verlaufsdiagramm (`ipad_a4chronik`), das Spielmenü ist von 21 auf drei Gruppen geschrumpft (`ipad_a5menu`). Das wirkt erstmals wie aus einem Guss.

„Jetzt wichtig“ ersetzt die Aufgabenleiste: Auf dem iPad stehen oben links drei Chips („Roma braucht Kleidung“, „Die Gelehrten sitzen untätig“, „2 Heere ohne Befehl“) plus „Alle anzeigen · 6“, auf dem Handy ein einziger Knopf „5 Jetzt wichtig“ (`handy_05karte_rom`). In neun Testrunden öffnete sich kein einziges Pflichtfenster mehr – im ersten Test waren es 0–2 je Runde. Die Heersteuerung bleibt vorbildlich: Befehlsblase mit Ankunft bzw. Siegchance („Aussicht 24 % · Sehr ungünstig“), Rückgängig nach dem Marsch, Schilde nebeneinander.

Kleinere Kratzer: Das „‹ Zurück“ oben links zeigt auch dann ein vorheriges Fenster an, wenn man dieses längst geschlossen hat (Chronik öffnet mit „‹ Hof“, das Menü mit „‹ Chronik“). Im Warenreiter heißen dieselbe Sache „Beschaffen“ und „Ware besorgen“. Und im Endlosspiel mit Rom unterbricht nach rund neun Runden eine Kinoszene („Vom Stadtstaat zur Herrin Italiens“) das Spiel und legt sich über alle Fenster, bis man sie wegtippt – auf beiden Gerätegrößen.

Auf dem Handy ist das Spiel jetzt angenehm: Rom liegt beim Start sichtbar links vom Blatt, die Kopfleiste zeigt nur Symbole (Beschriftung per langem Drücken), Gold und Jahreszahl überlappen nicht mehr (`handy_05karte_rom`).

## Grafik & Präsentation

Karte, Oberfläche und Kinoszenen bleiben das Aushängeschild. Neu sind gemalte Bilder für heilige Stätten, geistliche Oberhäupter, Heiligen Krieg, Söldner, Tross, Feldzug und Westfälischen Frieden – im Stil der übrigen Bilder, ohne Bruch. Die Stadtansicht zeigt Gebäude als Bildkarten mit Wirkung und Ausbaukosten, klar und schön (`welt_c_meso`).

Ein neuer, gut sichtbarer Fehler: Schaut man als Azteke in fremde Hauptstädte, tragen auch Delhi, Kaifeng, Kilwa, Edo und Groß-Simbabwe aztekische Gebäudenamen und -bilder – der Tempel ist überall eine Stufenpyramide, in Groß-Simbabwe wird gerade ein „Tianguis“ gebaut, in Delhi eine „Tempelpyramide“ (`welt_c_indien`, `welt_c_afrika2`). Ursache im Code: Die Gebäudenamen richten sich nach der Kultur des Spielers, nicht nach der des Besitzers.

Die 33 neuen Stadtbausätze und die korrigierten Figuren (Jaguarkrieger, japanischer Fußsoldat, byzantinischer Schild) konnten wir auf der Karte nicht aus der Nähe begutachten; auf den Kontaktbögen der Entwicklung sehen sie ordentlich aus, aber das ist kein Spieleindruck. Hier bleibt unsere Wertung vorsichtig.

## Ton & Vertonung (nur eingeschränkt prüfbar)

Unverändert nicht prüfbar. Neu hinzugekommen sind laut Entwicklung 30 kulturbezogene Statthaltersätze und eine Sprechanimation der Berater (das Porträt leuchtet, während gesprochen wird).

## Spielmechanik & Tiefe

Die Tiefe ist geblieben, die Last ist gesunken. Der Haushalt zeigt sechs aufklappbare Gruppen statt 19 Posten, die Ordnung fünf Gruppen plus „Kleineres“, die 40 Waren stehen in fünf Gruppen mit „Woher?“, „Verkaufen“ und einem Knopf, der den günstigsten Lieferanten vorschlägt (`ipad_a8haushalt`). Die Forschung ist nach Militär, Wirtschaft und Kultur geteilt und markiert Schlüsseltechniken mit „★ Schlüssel“ (`ipad_a7forschung`). Berechnete Schlachten berücksichtigen jetzt die Truppenmischung, große Reiche zahlen ab 16 Provinzen eine Verwaltungslast. Damit sind drei unserer Hauptkritikpunkte entschärft.

Was bleibt: Jahreszahl und Epoche laufen weiter auseinander, und im Spiel selbst ändert sich an der Grundmenge an Werten wenig – es ist nur besser sortiert.

## KI

Spürbar besser kommuniziert: Im Diplomatiefenster steht bei jedem Reich die Stimmung („Im Krieg“, sonst von „Friedlich“ bis „Droht mit Krieg · noch n Runden“), daneben die Vertragsleiter mit Glaubensbund (`ipad_a9reich_dip`). Kriege gegen den Spieler werden laut Entwicklung 1–3 Runden vorher angedroht; im Test kam es in neun Runden zu keiner Drohung, wir konnten sie also nicht selbst erleben. Am Kern ändert das nichts: Die Reiche haben weiterhin keinen eigenen Charakter, „Schwer“ heißt weiterhin vor allem mehr Gold.

## Kampagne & Geschichten

Unverändert stark. Die Startwelt 1510 mit den Azteken beginnt direkt mit einem Kapitelziel („Der Große Tempel 1/3“) im Befehlsblatt. Dass Kapitelbilder jetzt zur Kultur passen sollen, konnten wir nur am Rand sehen; ein Skriptorium tauchte nicht mehr auf.

## Langzeitmotivation

Die ruhigeren Runden helfen am meisten: Ohne Pflichtfenster und mit drei klaren Hinweisen spielt man länger am Stück. Ein inszeniertes Ziel und Finale im Endlosspiel fehlt weiterhin.

## Technik & Stabilität

Keine Abstürze und keine Skriptfehler in allen Durchläufen, nur derselbe einzelne fehlgeschlagene Netzwerkaufruf wie im ersten Test. Der Startbildschirm stand diesmal nach 21 Sekunden (erster Test: rund 100 s, gleiche Software-Grafik, aber weniger Last im Testrechner – das ist kein sauberer Vergleich). Der Epochenwechsel von 1510 auf 1790 lief ohne Fehler durch. Echte Geräte sind weiterhin ungetestet.

---

## Das hat uns gefallen
- Klare Menüstruktur mit sechs Bereichen, Reitern, „?“-Hilfe und einheitlichem ✕
- „Jetzt wichtig“: drei Hinweise statt Aufgabenflut, keine Pflichtfenster mehr pro Runde
- Gebündelter Haushalt, gruppierte Ordnung und Waren, Forschung nach Zweigen mit Schlüsseltechniken
- Stimmung je Reich und angekündigte Kriege
- Handy: Kamera beim eigenen Reich, saubere Kopfleiste
- Neue Bilder für Glaube, Söldner, Tross, Feldzug, Westfälischen Frieden

## Das hat uns gestört
- Fremde Städte tragen Gebäudenamen und -bilder der eigenen Kultur (Tempelpyramide in Delhi)
- Kinoszene unterbricht das Endlosspiel mitten in der Partie und liegt über allen Fenstern
- „‹ Zurück“ zeigt auf bereits geschlossene Fenster
- Uneinheitliche Begriffe im Warenreiter („Beschaffen“ / „Ware besorgen“)

## Das hätten wir uns gewünscht
- KI-Reiche mit erkennbarem Charakter
- Kapitel-Kinoszenen im Endlosspiel nur an Rundenanfängen oder abschaltbar
- Jahreszahl und Epoche, die zusammenpassen

## Was noch fehlt
- Ziel und Finale im Endlosspiel
- Ein Blick auf die neuen Stadtbausätze im Spiel auf echter Hardware
- Test auf echtem iPad und Handy

## Wertung

| Kategorie | v175 | v179 |
|---|---|---|
| Einstieg & Bedienung | 66 % | 77 % |
| Grafik & Präsentation | 80 % | 81 % |
| Ton & Vertonung | nicht bewertet | nicht bewertet |
| Spielmechanik & Tiefe | 74 % | 78 % |
| KI | 60 % | 65 % |
| Kampagne & Geschichten | 86 % | 86 % |
| Langzeitmotivation | 75 % | 78 % |
| Technik & Stabilität | 76 % | 79 % |
| **Gesamt** | **74 %** | **79 %** |

Wie beim ersten Mal gewichten wir Bedienung und Spielgefühl stärker. Der Sprung kommt fast vollständig aus der Ordnung: Menüs, „Jetzt wichtig“ und gebündelte Anzeigen. Die Grafik bekommt nur einen Punkt, weil wir die neuen Bausätze nicht selbst im Spiel sehen konnten und der Kulturfehler in fremden Städten neu auffällt. Mit den drei kleinen Bedienfehlern und einem Charakter für die KI ist die 80er-Marke klar erreichbar.

## Fazit

Imperium der Epochen 2 hat genau die Arbeit gemacht, die wir verlangt hatten: Es ist nicht kleiner geworden, aber geordnet. Wer jetzt eine Runde spielt, sieht drei Hinweise, eine Karte und ein Heer, das sich mit einem Tipp bewegen lässt – und findet die Tiefe in klar benannten Bereichen, wenn er sie sucht. Störend sind jetzt Kleinigkeiten statt Grundsätzliches. Das ist der Unterschied zwischen einem beeindruckenden Projekt und einem Spiel, das man gern weiterempfiehlt.

---

## Stand des Projekts

**Fertig und rund**
- Karte, Oberfläche, Kinoszenen, Ereignisbilder
- Menüstruktur mit sechs Bereichen, ✕, „?“-Hilfe, Einstellungen in einem Fenster
- „Jetzt wichtig“ und ruhiger Rundenablauf
- Heersteuerung auf Touch; Handy-Layout
- Gebündelte Wirtschafts- und Ordnungsanzeigen, Forschung nach Zweigen
- Geschichten, Offline-App, Export/Import

**Halbfertig**
- 3D-Bausätze außerhalb Europas (eingebaut, im Spiel nicht von uns geprüft)
- Epochenwechsel (gebündelt, Inhalt des Berichts von uns nicht geprüft)
- KI (Stimmung und Vorwarnung da, Charakter fehlt)

**Fehlt**
- Ziel und Finale im Endlosspiel
- KI-Charakter, klügeres „Schwer“
- Kopplung von Jahreszahl und Epoche
- Test auf echter Hardware

**Top 10 bis „fühlt sich wie ein fertiges Spiel an“**
1. Gebäudenamen und -bilder in fremden Städten nach der Kultur des Besitzers wählen.
2. Kapitel-Kinoszenen im Endlosspiel nicht mitten über offene Fenster legen (nur am Rundenbeginn, mit Option zum Abschalten).
3. „‹ Zurück“ beim Schließen eines Fensters zurücksetzen.
4. Begriffe im Warenreiter vereinheitlichen („Ware besorgen“ überall).
5. Echter Gerätetest auf iPad und Handy, inklusive Blick auf die neuen Stadtbausätze.
6. Jahreszahl und Epoche koppeln (Uhr bremsen oder Wechsel anbieten).
7. Ziel und Finale im Endlosspiel inszenieren.
8. KI-Charakter in kleinen, gemessenen Schritten.
9. „Schwer“ klüger statt reicher machen.
10. Die beiden verworfenen Modelle (Lalibela, antike Ballista) neu erzeugen.
