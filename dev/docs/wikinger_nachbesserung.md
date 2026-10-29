# Wikinger-Kampagne – Nachbesserung nach Spieltest Moritz (29.10.2026)

Rückmeldung Moritz (v215, gespielt):
1. Schiffe be- und entladen ist nicht selbsterklärend. Anspruch: Truppen auf ein Schiff ziehen → Rückfrage → eingeladen.
2. Wessex lässt sich theoretisch schon in Runde 1 unterwerfen.
3. Mit Northumbria später nur Hin und Her: ich erobere, sie erobern zurück, Stillstand.
4. Es spielt sich noch nicht wie „Wikinger erobern England“.

Grundsatz (gilt ab jetzt für alle Funktionen): **Wer nachfragen muss, für den war es zu kompliziert.** Jede Handlung muss sich über die Karte mit Ziehen/Tippen auslösen lassen; Knöpfe in Blättern sind nur der zweite Weg.

Ursachen unten aus dem Code gelesen (statisch, nicht im Spiel nachgestellt). Zeilen = `dev/imperium.html` Stand v215.

---

## 1. Ein- und Ausschiffen

**Ursache:** Ein-/Ausschiffen geht nur über Knöpfe im Heer-Blatt („⚓ Einschiffen“, Z. ~17136) und im Flotten-Blatt („Ausladen: …“, Z. ~9973). Tippt man mit gewähltem Heer auf die Flotte, öffnet sich nur das Flotten-Blatt (`onFleetChip`); tippt man mit einem Heer an Bord auf Land, passiert nichts (`reachMap` liefert an Bord nur die eigene Provinz). Keine Rückfrage, Landungsangriff startet sofort.

**Soll (umgesetzt in v216, siehe unten):**
| Geste | Rückfrage | Ergebnis |
|---|---|---|
| Heer gewählt → Flotte antippen (Flotte im Küstenkreis, Platz frei) | „Einschiffen? ‹Heer› geht an Bord von ‹Flotte›. Restliche Bewegung verfällt.“ | `embark` |
| Heer gewählt → Flotte antippen, aber zu weit/kein Platz | Hinweis mit Grund („Flotte zu weit weg – erst an die Küste von ‹Provinz› segeln“ / „Kein Platz: 4 Einheiten je Schiff“) | nichts |
| Flotte mit Ladung gewählt → Landprovinz im Küstenkreis antippen | „Anlanden bei ‹Provinz›?“ + bei Feind: „Das ist ein Landungsangriff (−20 %, im Raubzug ohne Abzug).“ | `disembark` |
| Heer an Bord gewählt → Landprovinz antippen | wie oben | `disembark` |
| Flotte mit Ladung segelt an eine Küste | einmaliger Hinweis „Jetzt eine Küstenprovinz antippen, um anzulanden.“ | – |
Knöpfe in den Blättern bleiben. Erklärkarte (lange drücken) auf Flotte erklärt beides.

## 2. Wessex in Runde 1 unterwerfbar

**Ursache:** „Unterwerfung fordern“ geht bei höchstens 3 Provinzen und Stärkeverhältnis ≥ 3 (bzw. ≥ 2). Wessex hat 4 Provinzen; Kent, Essex, Dumnonia sind kleine Orte ohne Mindestbelagerung und fallen mit einer gewonnenen Landung. Danach reicht das Verhältnis (10 gegen 5 Einheiten). Die Schonfrist `rules.shield` schützt nur den Spieler vor der KI, nicht Wessex vor dem Spieler.

**Soll (umgesetzt in v216):** Wessex kann bis zum Schritt „Wedmore“ weder zum Vasallen noch zu Tribut gezwungen werden; Grund steht am Knopf („Wessex beugt sich nicht – noch nicht.“). Weitergehend im Umbau (Abschnitt 4): Wessex ist bis 871 nur Raubziel.

## 3. Northumbria-Pingpong

**Ursachen (in Reihenfolge der Wirkung):**
1. Nach Eroberung Garnison nur 30 %, Unruhe 4, Bevölkerung −15 %; das Heer zieht weiter.
2. Die KI greift jede benachbarte Feindprovinz an, sobald ihr Verhältnis ≥ 1,4 ist – eine Provinz mit Garnison 2–4 ist fast immer „günstig“. Der Anfangsschutz `shielded()` greift in Geschichten nie (Geschichten starten bei Runde `epochTurn+30`).
3. Ordnung nach Eroberung oft ≤ −4 → Aufstand → Provinz wird frei → Northumbria holt sie zurück. In Geschichten verhindert ein eigenes Heer vor Ort den Aufstand nicht.
4. Northumbria bietet keinen Frieden an, weil sie nach dem Rückgewinn nicht „verliert“.

**Soll, Stufe 1 (umgesetzt in v216, nur im Wikinger-Szenario):**
- Eroberung durch den Spieler: Garnison 60 % statt 30 %, Unruhe 2 statt 4.
- Steht ein eigenes Heer in der Provinz, bricht dort kein Aufstand aus (nur Unruhe).
- Fällt die Hauptstadt eines englischen Königreichs, bekommt das Reich Kriegsmüdigkeit (macht Friedens-/Tributangebote wahrscheinlich).
Die KI-Angriffslogik selbst bleibt unverändert (feste Regel: KI nur vorsichtig ändern).

**Soll, Stufe 2 (im Umbau, Abschnitt 4):** „Winterlager“ und „Marionettenkönig“.

---

## 4. Umbau: Damit es sich wie „Wikinger erobern England“ spielt (Vorschlag, Entscheidung Moritz)

Heute: Raubzug, Beute, Landnahme und Wedmore-Wahl sind echte Mechanik. Das Große Heer, Alfred, Edington und der Danelag sind nur Text und Kino. Die vier Königreiche verhalten sich wie normale KI-Reiche.

Historischer Bogen in drei spielbaren Phasen, jede mit **eigener Regel, eigenem Gegner-Verhalten und klarem Ziel**:

### Phase A · Raubzeit (793–864): „Wer Schiffe hat, dem gehört die Küste“
- **Regel:** In England kann man nur rauben, nicht erobern. Grund steht am Angriffsknopf: „Ihr seid ein Raubzug, kein Heer. Erobern könnt ihr erst, wenn das Thing das Große Heer beschließt.“ → löst Wessex-Runde-1 von selbst.
- **Gegner:** Königreiche zahlen Danegeld, bauen Burhs an der Küste, stellen sich nur bei Übermacht.
- **Ziel:** Beute 100 → 400 (wie heute), Ruhm 60 im Thing.
- **Neu:** Jahreszeit wichtig: Raubfahrt im Sommer, im Winter zurück nach Hause oder **Winterlager** (s. u.) – ab 850 erlaubt (historisch erstes Überwintern auf Thanet/Sheppey).

### Phase B · Das Große Heer (865–877): „Diesmal bleiben wir“
- **Auslöser:** Schritt „Großes Heer“ – Ereignis mit Kino k2: Ivar und Halfdan landen mit einem **zweiten Heer** (Hooks, 8–10 Einheiten) in East Anglia. Spieler führt beide Heere.
- **Regel:** Erobern freigeschaltet. East Anglia zahlt Pferde (Ereignis: Danegeld oder Pferde → 2 Reiter-Einheiten).
- **Northumbria-Thronstreit (historisch Ælla gegen Osberht):** beim Start der Phase verliert Northumbria die Hälfte des Heeres (Ereignis „Zwei Könige in Eoforwic“).
- **Marionettenkönig:** Fällt die Hauptstadt eines Königreichs, Wahl: **Marionettenkönig einsetzen** (Reich wird Vasall, zahlt Tribut, greift nicht mehr an – historisch Ecgberht in Northumbria, Ceolwulf in Mercia) oder **selbst herrschen** (Provinzen erobern, mehr Unruhe). → Beendet das Pingpong spielerisch statt technisch.
- **Winterlager:** Heer baut in einer eroberten Provinz ein Lager (1 Runde, Gold): Garnison +100 %, Versorgung, Unruhe sinkt doppelt so schnell, KI greift ein Lager nur mit doppelter Übermacht an. Vorbild Repton (873), Thetford.
- **Gegner:** Wessex bleibt Raubziel, Mercia und Northumbria wehren sich normal.

### Phase C · Alfred (871–886): „Der König im Sumpf“
- **Auslöser:** 871 wird Alfred König (Ereignis, eigener Feldherr mit Porträt).
- **Wessex-Verhalten (Szenario-Skript, nicht allgemeine KI):** baut je 6 Runden einen Burh in einer Grenzprovinz; zahlt einmal Danegeld; stellt sich im Winter 878 nicht (Chippenham-Überfall: Spieler kann Wessex-Hauptstadt im Winter einnehmen).
- **Athelney/Edington:** Danach Ereignis „Alfred sammelt den Fyrd“: großes Wessex-Heer erscheint im Sumpf von Athelney und marschiert auf das Spielerheer. Die Schlacht von Edington ist **echt** (gewinnbar, aber schwer). Kino k3 je nach Ausgang.
- **Wedmore:** Verloren → Taufe/Treue wie heute. Gewonnen → neue Wahl „Wessex unterwerfen“ (Alternativgeschichte).
- **Danelag-Vertrag:** Die Wahl zieht eine Grenze (Watling Street): Provinzen nördlich/östlich davon werden dein Kernland, südlich Wessex; 12 Runden Frieden; Mischkultur wie heute. Auf der Karte als Grenzlinie sichtbar.

### Phase D (wie heute, gestrafft)
Paris/Normandie, Waräger/Miklagard, Island/Vinland. Vorschlag: auf 3 Schritte kürzen (Normandie, Miklagard, Vinland), damit die Kampagne ihr Gewicht auf England legt.

### Was dafür gebaut werden muss
| Baustein | Aufwand | Wiederverwendbar für |
|---|---|---|
| Phasenregel „nur Raub“ (Angriff in Region gesperrt, mit Grund) | klein | Steppenvölker, Ungarn, Normannen |
| Winterlager (Gebäude/Haltung eines Heeres) | mittel | alle Feldzüge fern der Heimat, Hannibal (Winter in Capua) |
| Marionettenkönig (Wahl bei Fall der Hauptstadt) | mittel | Mongolen, Rom (Klientelkönige), Kolonialkampagnen |
| Szenario-Skript für einen Gegner (Burh-Bau, Fyrd-Ereignis) | mittel | Fabius im Hannibal-Paket (gleiches Muster!) |
| Danelag-Grenze (Vertrag mit Gebietsteilung) | mittel | Frieden von Verdun, Tordesillas |
| zweites Heer per Ereignis | klein (Hook gibt es) | – |
Bilder: Alfred-Porträt, Winterlager (Repton), Athelney-Sumpf, Marionettenkönig, Danelag-Grenze – in Auftrag 42.

## 5. Entscheidungen für Moritz
1. Phase A „in England nur rauben“ – einverstanden?
2. Marionettenkönig statt Dauerkrieg – einverstanden?
3. Edington als echte (gewinnbare) Schlacht, Gewinnen öffnet eine Alternativgeschichte?
4. Phase D auf 3 Schritte kürzen?
