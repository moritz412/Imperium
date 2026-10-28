# Audit Menüführung (Stand v171, base71.html)

Ich habe den Code gelesen und Screenshots per Playwright erstellt: iPad quer 1180×820 und Handy quer 844×390 mit Touch. Die Bilder liegen in `scratchpad/shot/menue/` (`ipad_*.jpg`, `handy_*.jpg`), die Messwerte zur Struktur in `info_ipad.json` und `info_handy.json`. Das Skript dazu ist `shot/menue_shots.js`. Am Spiel habe ich nichts geändert.

---

## 1. Menübaum heute (kompakt)

**Startmenü** (`#start`)
- Große Knöpfe (`stbig`):
  - Weiterspielen (nur mit Spielstand)
  - Spielstand laden
  - Geschichte spielen → Unterseite (`stStory`: Schwierigkeit, Liste der Geschichten)
  - Endlos spielen → Unterseite (`stFree`): Schwierigkeit, Erweiterungen, Vermächtnisse (30 Karten), **danach erst** „Wähle dein Volk“, Epoche, Kontinente
  - Sammlung der Geschichten
  - Erfolge
- Kleine Knöpfe: Mehrspieler · Spielstand importieren · Für unterwegs speichern
- Ausklappbar: „Test-Spielstände (für Tests)“
- Oben rechts: ♪ Musik einschalten
- **Fehlt hier:** Einstellungen (Ton, Grafik), Hilfe/Regeln, Lizenzen.

**Im Spiel: Kopfleiste** (`#top`)

| Element | Öffnet |
|---|---|
| Wappen und Name (`facBtn`) | `openOverview` |
| Gold (`goldStat`) | `openEconomy` |
| Jahr | nichts |
| Reich (`navReich`) | `openOverview` (doppelt zum Wappen) |
| Wirtschaft (`navEco`) | `openEconomy` (doppelt zu Gold) |
| Hof (`navHof`) | `openHof` (unter 600 px ausgeblendet) |
| Chronik (`navLog`) | `openChronicle`, das Protokoll (unter 600 px ausgeblendet) |
| Bedrohungen (`thrBtn`) | `openThreats` |
| Erzfeind (`nemBtn`) | `openNemesis` |
| Forschung (`resBtn`) | `openResearch` |
| Menü (`menuBtn`) | `openMenu` |

**Auf der Karte**
- Aufgaben (`#todo`): Lagebrett mit 11 Arten von Einträgen. Nur hier ist der **Rat** erreichbar.
- Kartenansicht (`modeBtn`), Nordknopf, Umschalter „Alte Welt / Ostasien“ (`thSel`), `endMed` „Runde beenden“.
- Blatt `#sheet` „Befehle“ mit eigenem Knopf „Runde beenden“ (`endBtn`). Ohne Auswahl zeigt es zusätzlich die Knöpfe **Wirtschaft · Hof · Reich und Diplomatie**, also die dritte Kopie der Kopfleiste.

**Spielmenü** (`openMenu`): eine flache Liste mit 21 Einträgen, ohne Gruppen.
- Mehrspieler · Spiel speichern · Spielstand laden
- Sammlung der Geschichten · Rückblick auf diese Partie · Erfolge
- Exportieren · Importieren
- **Reich und Diplomatie · Hof, Feldherren und Agenten · Wirtschaft · Protokoll und Buch des Reiches** (Kopien der Kopfleiste)
- Ratgeber-Hinweise an/aus · Für unterwegs (offline) · Ton und Musik · Oberfläche: Kulturstil · Grafik
- Test-Spielstand laden (nur im Entwicklermodus) · Einführung zeigen · Steuerung und Regeln · Neues Spiel
- Darunter folgt ein Textblock „Kapitel und Kontinente dieser Partie“.
- Höhe 1269 px bei 733 px sichtbar, auf dem Handy 1195 px bei 372 px. Dort sind ohne Scrollen nur 6 von 21 Einträgen zu sehen (`handy_w_menu.jpg`).

**Hauptfenster**

| Fenster | Reiter | Höhe iPad / Handy (sichtbar 782 / 395) |
|---|---|---|
| Reich und Diplomatie (`openOverview`) | keine | 3517 / 3443 |
| Wirtschaft (`openEconomy`) | 7: Übersicht, Haushalt, Siedlungen, Ketten, Provinzen, Transport, Handel (+ Kompanien) | – |
| Hof, Feldherren und Agenten (`openHof`) | 7: Ämter, Statthalter, Parteien, Glaube und Lehen, Familie, Feldherren, Agenten | 1451 / 1417 |
| Forschung (`openResearch`) | keine, ein Baum in einer Spalte | 3765 / 3697 |
| Chronik (`openChronicle`) | – | – |

- **Reich und Diplomatie** ist eine einzige lange Seite (`ipad_w_reich.jpg`). Inhalt der Reihe nach: Kennzahlen Steuern/Handel/Sold/Saldo, Erzfeind, Rang und Titel, Zeichen der Zeit, Bild, Steuersatz, Verträge, Lage der Reiche (Karte), Reichsliste „antippen für Diplomatie“, Erkunden, Chronik-Auszug (`chronicleHtml`), Regionen, Sieg (`victoryHtml`), Erweiterungen (`modsHtml`).
- **Wirtschaft** hat unten den Knopf „Reich und Diplomatie“.
- **Hof**: Die Rats-Einstellung fehlt in den Reitern. Die Statthalter-Einstellungen (`hofOpt().rep/abfall`) stehen unter Statthalter.
- **Chronik** (`openChronicle`) ist das Protokoll, mit dem Knopf „Das Buch des Reiches“ (`openBooks`).

**Unterfenster**
- Diplomatie mit einem Reich (`openDiplomacy`, 19 Aufrufe): Knöpfe Zurück · Auf der Karte · Schließen.
- Region (`openRegion`): Auf der Karte · Schließen.
- Bedrohungen · Erzfeind · Rat (`openRat`, Knöpfe Hof/Schließen) · Buch des Reiches (`openBooks`/`openReichBook`) · Sammlung (`openChronik`) · Erfolge (`openAch`) · Rückblick (`openReview`) · Ton und Musik (`openAudio`) · Grafik (`openGfx`) · Offline (`openOffline`/`openPwaOffline`) · Laden/Speichern/Export/Import · Mehrspieler (`openMP`) · Stadtansicht (`openCityView`) · Fraktionsdetail (`openFacDetail`, nur im Startmenü).

**Technik der Fenster**
- Es gibt **eine einzige Modal-Ebene** (`showModal` ersetzt den Inhalt von `#dialog`).
- Jedes Fenster hat ✕ (`.dlgx`) **und** meist einen Knopf „Schließen“.
- Öffnet man aus einem Fenster ein Unterfenster (Reich → Diplomatie), ist das Hauptfenster weg. „Zurück“ gibt es nur an 8 Stellen, wo es eigens eingebaut ist.

---

## 2. Probleme mit Belegen

### A. Doppelungen
1. **Dieselbe Funktion an drei Stellen:**
   - Reich: Wappen, Kopfleiste „Reich“ und Spielmenü (`facBtn`, `navReich`, `mDip`), dazu der Knopf im Blatt.
   - Wirtschaft: Gold, Kopfleiste und Spielmenü (`goldStat`, `navEco`, `mEco`), dazu Blatt und Fußknopf in „Reich“.
   - Hof: Kopfleiste, Spielmenü, Blatt.
   - Chronik: Kopfleiste und Spielmenü.
   - Das bläht vor allem Spielmenü und Blatt auf (`ipad_karte.jpg`: drei Knöpfe unten im Blatt).
2. **„Runde beenden“ zweimal:** `endMed` (Sanduhr unten rechts) und `endBtn` im Kopf des Blatts (`ipad_karte.jpg` und `handy_karte.jpg`).
3. **Geldzahlen doppelt:** Steuern/Handel/Sold/Saldo und der Steuersatz stehen oben in „Reich und Diplomatie“, obwohl sie zur Wirtschaft gehören (Haushalt).
4. **Chronik an drei Orten:** Der Chronik-Auszug steht in „Reich“ (`chronicleHtml()` in `openOverview`), dazu kommen die Kopfleiste „Chronik“ (Protokoll) und der Menüeintrag „Protokoll und Buch des Reiches“.
5. **Ähnliche Einstellungen getrennt:** Berater-Stimmen stehen unter „Ton und Musik“ (`data-rv`), wie oft der Rat Vorschläge macht nur im Rat-Fenster selbst (`data-ratm`). Grafik, Ton, Kulturstil und Hinweise sind vier einzelne Menüeinträge.

### B. Versteckte Funktionen
6. **Rat** (`openRat`) ist nur über den Eintrag „Rat“ im Lagebrett erreichbar, wenn gerade Vorschläge vorliegen (`k:'rat'`, Z. 17283). Ohne Vorschläge kommt man nicht an die Einstellungen des Rats. Im Testlauf in Runde 1 öffnete der Rat nicht.
7. **Diplomatie mit einem Reich** erreicht man nur über die lange Reichsseite (Tabelle weit unten), über Antippen auf der Karte oder über die Diplomatie-Kartenansicht. Einen Knopf „Diplomatie“ gibt es nicht. Der Titel „Reich und Diplomatie“ verspricht ihn, liefert ihn aber erst nach etwa 3 Bildschirmhöhen.
8. **Kopfleiste unter 600 px:** Hof und Chronik sind ausgeblendet (`@media (max-width:600px){#navHof,#navLog{display:none}}`) und nur noch über das Menü erreichbar.
9. **Sieg- und Zielbedingungen** stehen ganz unten in „Reich“ (`victoryHtml`) und im Hilfetext, sonst nirgends sichtbar.

### C. Benennung, Symbole, Knöpfe
10. **Ein Begriff, vier Dinge:**
    - „Chronik“ ist das Protokoll (Kopfleiste und Fenstertitel).
    - „Das Buch des Reiches“ ist die Chronik in Kapiteln.
    - „Sammlung der Geschichten“ fasst die gewonnenen Geschichten zusammen.
    - Der Menüeintrag heißt „Protokoll und Buch des Reiches“.
    - Dazu kommt „Chronik“ als Abschnitt in „Reich“.
11. **Fenstertitel weichen vom Knopf ab:** „Hof, Feldherren und Agenten“ heißt in der Kopfleiste „Hof“, „Reich und Diplomatie“ heißt dort „Reich“.
12. **Reiter mischen Themen:** „Glaube und Lehen“ bzw. „Glaube und Satrapien“ steht im Hof, „Statthalter“ ebenfalls im Hof, Regionen und Bauvorlagen dagegen im Regionsfenster.
13. **Uneinheitliche Fußknöpfe:**

    | Bedeutung | Varianten |
    |---|---|
    | Schließen | Schließen (23×), Fertig (3×, z. B. Ton und Musik), Verstanden (2×), Weiter (13×) |
    | Karte | „Auf der Karte“ und „Auf Karte zeigen“ (je 2×), „Religionskarte zeigen“ |
    | Zurück | „Zurück“ (8×), „‹ Zurück“, „Zurück zum Bericht“, „Zurück zur Karte“ |

14. **Menüeinträge teils ohne Symbol:** Sammlung, Rückblick, Erfolge und weitere Einträge haben kein Symbol, die übrigen schon (`ipad_w_menu.jpg`).
15. **Veraltete Texte:**
    - Im Blatt steht „Keine Forschung gewählt. Tippe oben auf das Buch.“ Der Knopf heißt aber „Forschung“ (`handy_karte.jpg`).
    - Die Hilfe „Steuerung und Regeln“ ist veraltet:
      - „Ziel antippen zeigt den Weg, nochmal antippen marschiert“: Es gibt jetzt die Befehlsblase.
      - „Forschung: Das Buch oben“
      - „Diplomatie: Über dein Wappen oben links“
      - „Großbauten im Bauen-Menü“
    - Das Startmenü sagt „19 Geschichten und 3 Bonus-Geschichten“. Im Code sind es 33 Geschichten, davon 5 Bonus, und die Sammlung zeigt „2 von 33“.
16. **Kleinigkeiten:** Das Buch zeigt „Bis heute, waren es 2.“ (falsches Komma) und „300 v. Chr. bis 300 v. Chr.“ (`ipad_w_buch.jpg`). In der Heerzeile steht „1 Einheiten“. In den Vermächtnissen erscheint „Dschingis Khan“ zweimal (zwei Geschichten, gleicher Name).

### D. Tiefe und Länge
17. **Lange Seiten:** „Reich“ ist etwa 4,5 iPad- bzw. 9 Handy-Bildschirmhöhen lang. „Forschung“ ist etwa 4,8 bzw. 9,4 Höhen lang, ein Baum in einer Spalte.
18. **„Endlos spielen“ versteckt die Hauptwahl:** Die Wahl des Volks kommt erst nach den Erweiterungen und 30 Vermächtnis-Karten (`ipad_start_endlos.jpg`).
19. **Startmenü auf dem Handy:** Oberhalb des Bildrands passt nur ein Knopf, Titel und Einleitung nehmen den Rest ein (`handy_start.jpg`).
20. **Klicktiefe** von der Karte aus:
    - Diplomatie mit einem Reich: Reich, dann scrollen, dann Reich antippen.
    - Einstellung Berater-Stimmen: Menü, dann scrollen, dann Ton und Musik.
    - Buch: Chronik, dann Buch.
    - Hilfe: Menü, dann ganz nach unten scrollen.

### E. Schließen und Zurück
21. **Doppelt schließen:** ✕ und „Schließen“ sitzen in fast jedem Fenster. Auf dem Handy blendet der v171-Lauf das untere „Schließen“ aus, wenn es keine Aktion hat. Auf dem iPad bleiben beide.
22. **Kein Rückweg:** Nach Reich → Reich antippen → Diplomatie führt „Zurück“ zur Reichsseite. Bei Region, Rat → Hof, Wirtschaft → Reich und Ähnlichem geht der Rückweg verloren, weil es nur eine Modal-Ebene gibt.
23. **✕ wählt Knöpfe per Text:** Die ✕-Logik sucht den Fußknopf über ein Textmuster (`/Schließen|Weiter|Verstanden|Abbrechen|Zurück|…|Später/`). Neue Beschriftungen können das unbemerkt brechen.

---

## 3. Soll-Struktur (höchstens 2 Ebenen)

**Grundsatz:**
- Jede Funktion hat **einen** festen Platz.
- Abkürzungen (Wappen, Gold) dürfen bleiben, führen aber auf genau diesen Platz.
- Die Fenstertitel lauten wie die Knöpfe.

**Kopfleiste: 6 Bereiche** mit festen Namen und Symbolen

| Bereich | Reiter | Herkunft |
|---|---|---|
| **Reich** | Überblick · Regionen · Ziele | Überblick: Rang, Zeichen der Zeit, Erzfeind, Kennzahlen kompakt. Regionen: bisher `regionsHtml` und Regionsfenster. Ziele: Sieg, Vermächtnisse, Erweiterungen dieser Partie |
| **Diplomatie** (neu als eigener Knopf) | Reiche · Verträge · Karte | Reiche: Liste, antippen öffnet das Reich. Verträge: Liste und Glaubensbund. Karte: Lage der Reiche. Erkunden kommt in „Reiche“ |
| **Wirtschaft** | Haushalt · Waren · Siedlungen · Handel | Haushalt: Saldo, Steuersatz, Anleihen. Waren: Übersicht und Ketten. Siedlungen: Siedlungen und Provinzen. Handel: Handel, Transport, Kompanien |
| **Hof** | Ämter · Familie · Feldherren · Agenten · Glaube · Rat | Ämter: Ämter, Statthalter, Parteien. Glaube: Staatsglaube, Politik, Kirche, Lehen. Rat: immer erreichbar, mit seinen Einstellungen |
| **Forschung** | Zweige: Militär · Wirtschaft · Kultur | Statt eines langen Baums in einer Spalte |
| **Chronik** | Protokoll · Buch des Reiches · Geschichten · Erfolge | Rückblick erscheint am Partieende |

**Rechts außen:** Bedrohungen und Erzfeind bleiben als Warnsymbole und führen zu Reich → Überblick. Das Menü ☰ folgt danach.

**Spielmenü ☰: höchstens 8 Einträge in 3 Gruppen**
- **Partie:** Speichern · Laden · Exportieren/Importieren · Neues Spiel
- **Einstellungen:** ein Fenster mit Reitern Ton · Grafik · Oberfläche (Kulturstil, Hinweise, Beraterstimmen, Rat-Häufigkeit) · Offline
- **Hilfe:** Einführung · Steuerung und Regeln (aktualisiert) · Lizenzen
- **Mehrspieler** steht nur im Startmenü bzw. als Eintrag, wenn eine Mehrspielerpartie läuft.

**Startmenü**
- Weiterspielen (prominent) · Neues Spiel (Geschichte / Endlos) · Laden · Chronik (Geschichten und Erfolge) · Einstellungen · Mehrspieler.
- Unter „Endlos“ kommt **zuerst** das Volk, dann Epoche und Kontinente. Erweiterungen und Vermächtnisse werden einklappbar.
- Auf dem Handy wird die Einleitung kürzer, damit die Knöpfe sichtbar sind.

**Blatt „Befehle“**
- Nur noch Bezug zur Karte: Auswahl, Heere, Aufgaben.
- Keine Kopien von Wirtschaft, Hof oder Reich.
- Kein zweites „Runde beenden“, `endMed` bleibt der einzige Knopf.

**Einheitliche Regeln**
- **Schließen:** nur ✕, Fußknöpfe nur für echte Aktionen. Der Text „Schließen“ entfällt.
- **Zurück:** Eine kleine Fenster-Historie für Unterfenster: ‹ oben links, wenn man aus einem Bereich kam.
- **Feste Begriffe:** „Auf der Karte“ · „Zurück“ · „Abbrechen“ · „Bestätigen/Weiter“.
- Gleiche Symbole in Kopfleiste, Fenstertitel und Menü.

---

## 4. Umsetzungsschritte (Reihenfolge, Risiko)

1. **Texte und Kleinfehler** (Risiko gering): Hilfetext, „Tippe oben auf das Buch“, Anzahl der Geschichten aus `SCEN` berechnen, Buchsätze, „1 Einheit“, Fußknöpfe vereinheitlichen. Keine Strukturänderung.
2. **Fenster-Historie und Schließen** (Risiko mittel):
   - `showModal` bekommt einen Stapel, und Unterfenster zeigen ‹ Zurück.
   - ✕ schließt immer.
   - Fußknopf-Schließen entfällt überall, wo ✕ reicht.
   - Die Textmuster-Logik der ✕ wird ersetzt durch ein Feld `cancel` am Knopf.
   - Betrifft alle 83 `showModal`-Aufrufe, die Ereignisse brauchen Tests.
3. **Spielmenü und Einstellungen bündeln** (Risiko gering):
   - Ein Fenster „Einstellungen“ mit Reitern. Die bestehenden Funktionen `openAudio`, `openGfx`, `openOffline`, Hinweise, Kulturstil und Rat-Einstellung werden darin wiederverwendet.
   - Das Menü wird gruppiert, die Kopien der Bereiche fallen weg.
4. **Doppelungen auf der Karte entfernen** (Risiko gering): Bereichsknöpfe im Blatt und `endBtn` fallen weg. Wappen und Gold bleiben als Abkürzung.
5. **Diplomatie als eigener Bereich, „Reich“ entschlacken** (Risiko mittel):
   - `openOverview` wird in Reiter aufgeteilt.
   - Ein neuer Kopfleisten-Knopf „Diplomatie“.
   - Die 19 Aufrufe von `openDiplomacy` und die Rücksprünge müssen angepasst werden.
   - Platz in der Kopfleiste auf dem Handy prüfen (Kurzlabels oder nur Symbole).
6. **Wirtschaft 7 → 4 Reiter, Hof umsortieren, Rat immer erreichbar** (Risiko mittel): Inhalte verschieben, Reiter zusammenlegen. Tests: `bed2_t`, `gbund_t`, `fam3_t`, `glaube_t`.
7. **Forschung nach Zweigen** (Risiko gering bis mittel): reine Darstellung. Tests: Forschungswahl und Doktrinen.
8. **Chronik bündeln** (Risiko gering): ein Fenster mit 4 Reitern. Protokoll, `openBooks`, `openChronik` und `openAch` werden eingebettet.
9. **Startmenü** (Risiko gering): Reihenfolge unter „Endlos“, Einstellungen und Hilfe ergänzen, kürzere Einleitung auf dem Handy.
10. **Am Ende:**
    - Einführung (`#tut`) und Kurzhilfe auf die neuen Namen bringen.
    - Gesamttest mit `smoke`, `bed1`, `bed2`, `fz`, `sold`, `anim`, `karten2` und `glaube2`.
    - Screenshots erneut bei 844 und 1180 px.

---

## 5. Entscheidungsfragen an Moritz

1. **Diplomatie als eigener Kopfleisten-Bereich, getrennt von „Reich“?**
   Empfehlung: **Ja.** Sie ist die häufigste versteckte Funktion. Auf dem Handy werden die Kopfleisten-Knöpfe dann nur noch als Symbole gezeigt, mit Beschriftung beim langen Drücken.
2. **Fußknopf „Schließen“ abschaffen, nur noch ✕ oben rechts plus ‹ Zurück bei Unterfenstern?**
   Empfehlung: **Ja.** Das spart Platz, vor allem auf dem Handy, und ist eindeutig.
3. **Namen für den Geschichtsbereich:** „Chronik“ als Bereich mit den Reitern Protokoll · Buch des Reiches · Geschichten · Erfolge?
   Empfehlung: **Ja**, wobei „Sammlung der Geschichten“ kurz „Geschichten“ heißt. Die Alternative wäre, das Protokoll „Ereignisse“ zu nennen und das Buch eigenständig zu lassen.
