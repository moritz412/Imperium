# Städte Roms – vom Prototyp zum Spiel (Konzept 1.11.2026)

Ergänzt `konzept.md`. Ziel: aus der Systemsammlung (Stufen 1–4) ein Spiel machen, bei dem Entscheidungen weh tun und das sich
wie ein eigenes Spiel anfühlt – Manor-Lords-Nähe, aber römisch, freies Spiel mit der Stadt im Vordergrund und der Geschichte
als Bühne. Kein Nachbau von Anno.

## 1. Befund: Was fehlt zum „echten Spiel“
| Bereich | Stand heute | Was fehlt |
| --- | --- | --- |
| Ziel und Ende | 18 Senatsaufträge, Ränge, Inschriften | kein Bogen, kein Sieg, keine Niederlage; nach Jahr 8 „läuft es halt“ |
| Entscheidungen | viele Systeme, meist „alles bauen“ | echte Zielkonflikte (Land, Arbeitskraft, Gunst, Familie vs. Stadt) |
| Sichtbares Leben | Laufwege, Karren, Boote, Wetter | Bürger als Menschen, Baustellen für alles, Markttreiben, Feste sichtbar |
| Erzählung | 15 Einzelereignisse, Hannibal-Auftakt | Ereignisketten, wiederkehrende Personen, Geschichte als Bühne |
| Familie | Valerier, Ämter, Heirat, Rivalen (passiv) | Charaktere mit Werten, Generationen, aktive Rivalen, echte Wahlen |
| Oberfläche | viele Schichten (Forschung, Familie, Chronik, Inschriften, Hilfe) | ein Ort für alles, Bilder, geführte erste Stunde |
| Präsentation | 10 Blender-Modelle, Rest aus three-Formen, Musik 1 Stück | Modelle für alle Gebäude, Musik je Akt/Jahreszeit, Sprecher |
| Balance | nur per Skript-Spieler | Spieltests mit Moritz, Kurven je Akt |
| Technik | 81 Prüfungen, Draw-Calls gesenkt | **iPad nie getestet**, ein Spielstand, keine Versionierung der Stände |

## 2. Leitbild – fünf Säulen (überarbeitet nach Moritz' Entscheidungen 1.11.)
1. **Die Stadt ist die Hauptfigur.** Bauen, Versorgen, Wachsen stehen vorn. Die Familie (Valerier) ist eine zweite Ebene für
   Politik und Ansehen – wichtig, aber nicht der Held.
2. **Die Stadt lebt sichtbar.** Was im Lager steht, ist auch zu sehen: Baustellen, Materialfuhren, Märkte, Menschen, Jahreszeiten.
3. **Geschichte als Bühne.** Cremona 218–27 v. Chr. läuft als Zeitleiste im Hintergrund des freien Spiels mit – Hannibal, Gallier,
   Via Postumia, Krise der Republik, Bürgerrecht, Bürgerkrieg, Landenteignung (Moritz: „okay“).
4. **Knappheit erzwingt Entscheidungen.** Land, Arbeitskräfte, Gunst Roms und Geld reichen nie für alles.
5. **Selbst gesetzte Ziele, sichtbarer Fortschritt.** Freies Spiel ohne Zwang; Ziele aus Senat, Rängen, Inschriften, Wahrzeichen.

## 3. Spielstruktur: Freies Spiel im Vordergrund, Geschichte als Zeitleiste
- **Hauptmodus freies Spiel** (Moritz 1.11.): Keine Akte mit Zwangsende. Die Stadt wächst, solange man spielt.
- **Zeitleiste der Geschichte**: Große Ereignisse kommen zu ihrem Jahr als Ereignisketten mit Entscheidungen und Folgen –
  sie geben dem freien Spiel einen Bogen, ohne es zu beenden:

| Jahr (v. Chr.) | Ereignis | Frage an die Stadt |
| --- | --- | --- |
| 218 | Hannibal, Trebia (vorhanden) | Getreide für das Heer? Flüchtlinge? |
| 200 | Gallier belagern Cremona (Placentia fällt) | Mauer, Vorräte, Kastell – hält die Stadt? |
| 190 | Neue Siedler aus Rom | Land für 6.000 Familien – wohin? |
| 148 | Via Postumia | Straße durch die Stadt: Handel, aber Abriss |
| 133–121 | Landreform der Gracchen | Wem gehört das Umland? |
| 89 | Bundesgenossenkrieg, latinisches Recht | Rom gegen die Verbündeten – auf wessen Seite? |
| 72 | Spartacus zieht durch die Po-Ebene | Sklaven, Mauern, Furcht |
| 49 | Caesar: Bürgerrecht für die Transpadaner | Dank an Caesar – Bruch mit dem Senat? |
| 41 | Landenteignung für Veteranen | Wessen Land geht verloren? |
| 27 | Augustus | Kaiserzeit – weiter frei spielen |

- **Ziele** statt Zwang: Senatsaufträge (vorhanden), Stadtränge, Wahrzeichen, Inschriften, „Ehrenziele“ je Epoche.
- **Rückschläge** statt Spielende: Gunst Roms 0 → Rom schickt einen Präfekten (Steuern höher, Familie verliert Ämter);
  Stadt fast leer → Senat kürzt Unterstützung. Kein Game over.
- **Familie** bleibt (Ämter, Heirat, Rivalen) als Politik-Ebene; Ausbau nur, wo es der Stadt dient.
- Weitere Regionen als zusätzliche freie Spiele (Florentia, Puteoli, Luceria).

## 4. Kernschleifen
| Rhythmus | Spieler tut | Spiel antwortet |
| --- | --- | --- |
| Minute (Monat) | bauen, Ketten flicken, Ursachen lesen | Laufwege, Symbole, Rat des Verwalters |
| Jahr (4 Jahreszeiten) | Ernte sichern, Feste, Abgaben, Wahlen | Chronik-Seite, Bilanz, Ereignis |
| Generation (~20 Jahre) | Erbe ausbilden, Heirat, Ämter | Tod/Nachfolge, Rivalen wechseln, neuer Akt |

## 5. Systeme – was neu kommt oder sich ändert
**A. Sichtbares Stadtleben (Manor-Lords-Kern)**
- Bauzeit für alle Gebäude: Baustelle, Bauarbeiter laufen hin, Material kommt per Träger/Karren aus dem Lager.
- Bürger als Figuren mit Tagesweg (Haus → Arbeit → Markt/Brunnen → Haus), Markttreiben mit Ständen, Feste auf dem Forum.
- Lager werden Orte: Waren liegen im Speicher, Träger fahren sie zu den Betrieben (leicht, ohne Einzelstück-Simulation).

**B. Land und Raum**
- Stadtmauer (Cremona war befestigt): Bau in Abschnitten, schützt in Akt I, später Grenze für Erweiterung.
- Bodenwert je Viertel (nah an Forum/Markt/Wasser): Domus will gute Lage, Werkstätten stören.
- Umland: Dörfer (vicus) wachsen, Landvergabe an Veteranen/Bürger als Entscheidung (Akt III/IV).

**C. Wirtschaft mit Zielkonflikten**
- Arbeitskraft knapp: Freie vs. Sklaven (billig, aber Furcht/Aufstand), Bauarbeiter vs. Betriebe.
- Handelsverträge mit Placentia/Mantua (feste Mengen, bessere Preise, Bruch kostet Ansehen).
- Spezialisierung: Cremona als Getreide-, Wein- oder Handelsstadt – je Richtung andere Boni im Akt.

**D. Familie als Dynastie**
- Charaktere mit Werten (Ehrgeiz, Frömmigkeit, Klugheit, Gesundheit) und Alter; Werte wirken auf Ämter, Ereignisse, Erbfolge.
- Rivalen handeln selbst: kandidieren, bestechen, verklagen, heiraten; Wahlen mit Stimmen (Klienten, Ansehen, Gunst, Geld).
- Familienvermögen kauft Land, Klienten, Spiele, Wahlkampf – die Versuchung, die Stadtkasse anzuzapfen, bleibt.

**E. Rom und Politik**
- Patron in Rom (Senator), der Gefallen verlangt und gewährt; Anfragen aus Rom (Getreide, Truppen, Geld).
- Bürgerrecht als Akt-III-Thema (Transpadaner, 49 v. Chr. durch Caesar); Parteinahme im Bürgerkrieg mit Folgen.

**F. Krieg ohne Echtzeitschlacht**
- Miliz und Kastell, Belagerung als Folge von Entscheidungen (Vorräte, Mauer, Moral), Aushebung für Roms Legionen.

**G. Erzählung**
- Ereignisketten mit wiederkehrenden Personen (der Händler aus Ariminum, der Häuptling der Insubrer, der Patron).
- Drei Ratgeber mit Gesicht: Verwalter (Wirtschaft), Priester (Stimmung/Götter), Vertrauter (Familie/Politik).

**H. Ziele und Belohnung**
- Akt-Ziele, Inschriften, Wahrzeichen: Stadtmauer, Basilika, Jupitertempel, Theater, Aquädukt – je mit Baustelle und Eröffnung.
- Endbewertung je Akt (Stadt, Familie, Rom) als illustrierte Chronik-Seite.

**I. Oberfläche (Spiel statt Software)**
- Ein „Stadtbuch“ (tabularium) statt vieler Fenster: Kapitel Familie, Wissen, Chronik, Inschriften, Hilfe – gezeichnete Seiten,
  Knöpfe in einer Spalte, wenige Reiter.
- Erste 20 Minuten geführt (Senat als Erzähler), Meldungen antippbar (springt zum Gebäude), Ziele immer sichtbar.
- Bilder aus der PC-Pipeline (FLUX) für Ereignisse, Ratgeber, Akt-Titel.

**J. Präsentation**
- Blender-Modelle für alle Gebäude (heute 10), Figuren mit einfachen Animationen, Musik je Akt und Jahreszeit (MusicGen),
  kurze Sprechertexte für Akt-Anfänge und große Ereignisse (XTTS, nicht kommerziell).

**K. Technik**
- Mehrere Spielstände, Versionsnummer im Stand mit Migration, Absturzschutz (Autospeichern je Jahreszeit ist da).
- Figuren per Instancing (heute schon), Ziel < 400 Draw-Calls bei 400 Gebäuden, **Messung auf dem echten iPad**.

## 6. Abgrenzung – was wir bewusst nicht machen
Keine Inseln/Schiffsrouten-Wirtschaft, keine Bedarfsstufen-Treppe nach Anno-Muster mit Zahlenkaskaden, keine Echtzeitschlachten,
keine kopierten Oberflächen, Gebäudelisten oder Ketten. Stattdessen: Laufwege, Hex-Umland mit Vermessen, Jahreszeiten,
Familie über Generationen, echte Ortsgeschichte.

## 7. Fahrplan (überarbeitet 1.11.; Reihenfolge „wie es gerade besser passt“)
| Phase | Inhalt | Umfang (grob) |
| --- | --- | --- |
| A Bauen fühlt sich echt an | Bauzeit und Baustellen für **alle** Gebäude (Moritz: „tendenziell für alle“), Material per Träger/Karren aus dem Lager, Bauarbeiter; Stadtmauer in Abschnitten | ~8 h |
| B Geschichte als Zeitleiste | Ereignisketten 200–27 v. Chr. (Tabelle oben) mit Folgen für Stadt und Umland; Präfekt als Rückschlag | ~8 h |
| C Lebendige Stadt | **Machbarkeit Bürgerfiguren prüfen** (Prototyp, Draw-Calls/Dreiecke messen, iPad-Test durch Moritz), dann Tageswege, Markttreiben; Blender-Modelle, Musik je Jahreszeit | ~10 h + PC-Pipeline |
| D Stadt-Tiefe | Bodenwert/Viertel, Spezialisierung der Stadt, Handelsverträge, Stadtbuch-Oberfläche | ~8 h |
| E Feinschliff | mehrere Spielstände, offline, weitere Regionen, Balance mit Spieltests | offen |

Erfolgskriterien: erste 10 Minuten ohne Hilfe verständlich (Spieltest), echte Zielkonflikte, Testsatz grün, Draw-Calls im
Rahmen, Bildrate **auf dem iPad gemessen** (nicht geschätzt).

## 8. Entscheidungen (Moritz, 1.11.)
1. Hauptmodus: **freies Spiel**. 2. **Stadt im Vordergrund**, Familie als zweite Ebene. 3. Bauzeit: gerade nicht wichtig,
tendenziell **für alle Gebäude**. 4. Bürgerfiguren: **erst Machbarkeit prüfen**, an sich gewünscht. 5. Bürgerkrieg/Landenteignung:
**okay**. 6. Reihenfolge: **wie es gerade besser passt**.

## 9. Stand der Umsetzung (1.11., Cloud, Test staedte_t 89/89)
| Phase | Umgesetzt | Offen |
| --- | --- | --- |
| A Bauen fühlt sich echt an | Bauzeit für alle Gebäude, Bauarbeiter, Zeltlager der Kolonisten, Materialträger, Baustellenfenster, Stadtmauer + Tore mit Schutzberechnung | Lager als Orte mit sichtbaren Warenstapeln |
| B Geschichte | Zeitleiste Po-Ebene: Belagerung 200, Siedler 190, Via Postumia 148, Spartacus 72, Landenteignung 41 mit Vorwarnung; Präfekt; Menü an/Kulisse/aus. Florentia: Rubikon 49, Perusia 41, Veteranen 30, Clanis 15 n. Chr.; Puteoli: Bacchanalien 186, Kaufleute 150, Capua 73, Seeräuber 68; Luceria: Samniten 294, Pyrrhus 279, Cannae 216, Bundesgenossenkrieg 90 | – |
| C Lebendige Stadt | Bürger mit Wegen zu Markt/Brunnen, Markttreiben (gemessen: Draw-Calls gleich, 0,035 ms/Bild), Menüschalter | Blender-Modelle, Musik je Jahreszeit, Sprecher → `dev/pc/staedte_auftrag.md`; **Bildrate auf dem iPad** |
| D Stadt-Tiefe | Bodenwert/Lage, Läden, Garten, Statue, Platz, Ruf der Stadt, Lieferverträge, Stadtbuch-Kapitel, Meldungen antippbar (Bau fertig, Aufstieg, Feuer, Seuche → springt zum Gebäude) | – |
| E Feinschliff | 3 Spielstände, 4 Regionen spielbar, offline (PWA), iPad-Layout, Abgabe nach Reichtum | Spieltest mit Moritz, Balance mit echtem Spiel, Offline auf dem iPad prüfen |

