# Städte Roms – vom Prototyp zum Spiel (Konzept 1.11.2026)

Ergänzt `konzept.md`. Ziel: aus der Systemsammlung (Stufen 1–4) ein Spiel machen, das man von Anfang bis Ende spielt,
bei dem Entscheidungen weh tun und das sich wie ein eigenes Spiel anfühlt – Manor-Lords-Nähe, aber römisch und mit
Familie als Hauptfigur. Kein Nachbau von Anno.

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

## 2. Leitbild – fünf Säulen
1. **Die Familie ist die Hauptfigur.** Man spielt die Valerier über Generationen; die Stadt ist ihr Werkzeug und ihre Bühne.
   Das unterscheidet uns klar von Anno (dort gibt es keine Dynastie) und Manor Lords (dort ein Herr ohne Familie).
2. **Die Stadt lebt sichtbar.** Was im Lager steht, ist auch zu sehen: Baustellen, Karren, Märkte, Menschen, Jahreszeiten.
3. **Geschichte als Bühne.** Cremona 218–27 v. Chr. ist echte Geschichte mit Wendepunkten – Hannibal, Gallier, Via Postumia,
   Krise der Republik, Bürgerrecht, Bürgerkrieg, Landenteignung. Jede Epoche bringt eine neue Frage.
4. **Knappheit erzwingt Entscheidungen.** Land, Arbeitskräfte, Gunst Roms und Familienvermögen reichen nie für alles.
5. **Klare Ziele, klare Enden.** Jeder Akt hat Ziele, eine Krise und eine Bewertung; man kann scheitern und neu anfangen.

## 3. Spielstruktur: Kampagne in vier Akten + freies Spiel
| Akt | Zeit | Frage | Krise am Ende | Neu im Akt |
| --- | --- | --- | --- | --- |
| I Gründung | 218–201 v. Chr. | Überlebt die Kolonie den Krieg? | Gallier-Belagerung 200 v. Chr. (historisch: Placentia zerstört, Cremona hält) | Grundbedürfnisse, Umland, Kastell |
| II Aufstieg | 200–134 | Wird Cremona reich? | Seuche oder Missernte | Via Postumia (148), Handel, Epoche II, Ädil |
| III Krise der Republik | 133–50 | Wem gehört das Land? | Sklavenaufstand (Spartacus zieht 72 v. Chr. durch die Po-Ebene) | Landreform (Gracchen), Sklaven gegen Freie, Bürgerrecht für die Transpadaner |
| IV Bürgerkrieg | 49–27 | Wem hält Cremona die Treue? | 41 v. Chr.: Landenteignung für Veteranen (historisch traf es Cremona) | Caesar oder Pompeius, Oktavian oder Antonius |
| Epilog | ab 27 v. Chr. | Augustus | – | Kaiserzeit als freies Weiterspielen |

- Jeder Akt: 3–5 Ziele (Stadt, Familie, Rom), dazwischen frei bauen; Ende mit Bewertung (Inschrift + Chronik-Seite),
  Familie und Stadt gehen in den nächsten Akt über. Dauer je Akt 60–90 Minuten bei 15 s/Monat.
- **Niederlage** (weich, mit Ausweg): Gunst Roms auf 0 → Senat setzt die Familie ab (Neustart des Akts);
  Stadt unter 20 Einwohner für 2 Jahre → Kolonie aufgegeben; Familie ohne Erben → Ende der Dynastie.
- **Freies Spiel**: ohne Akte, mit allen Freischaltungen; weitere Regionen (Florentia, Puteoli, Luceria) als Szenarien.

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

## 7. Fahrplan
| Phase | Inhalt | Umfang (grob) |
| --- | --- | --- |
| A Spielbar von Anfang bis Ende | Akt I komplett (Ziele, Belagerung 200 v. Chr., Bewertung), Niederlage/Sieg, geführte erste 20 min, Baustellen für alle Gebäude, Stadtbuch-Oberfläche, **Spieltest Moritz** | 10–12 h |
| B Lebendige Stadt | Bürger mit Tageswegen, Markttreiben, Bauarbeiter + Materialfuhren, Stadtmauer, Blender-Modelle für ~15 Gebäude, Musik je Jahreszeit | ~10 h + PC-Pipeline |
| C Dynastie und Rom | Charakterwerte, Generationen, aktive Rivalen, Wahlen mit Stimmen, Patron, Ereignisketten Akt II | ~12 h |
| D Krise der Republik | Akt III und IV, Landreform, Spartacus, Bürgerrecht, Bürgerkrieg, Landenteignung 41 v. Chr., Epilog | ~10 h |
| E Szenarien und Feinschliff | weitere Regionen, mehrere Spielstände, PWA/offline, iPad-Feinschliff, Balance je Akt | offen |

Erfolgskriterien: erste 10 Minuten ohne Hilfe verständlich (Spieltest), ein Akt 60–90 Minuten, je Akt mindestens drei echte
Zielkonflikte, Testsatz grün, Draw-Calls im Rahmen, Bildrate **auf dem iPad gemessen** (nicht geschätzt).

## 8. Entscheidungen für Moritz
1. Kampagne in Akten entlang der Geschichte – oder lieber freies Spiel als Hauptmodus?
2. Familie als Hauptfigur mit Generationen – passt das, oder Stadt im Vordergrund lassen?
3. Bauzeit und Materialfuhren für **alle** Gebäude (langsamer, mehr Manor Lords) – oder nur für große?
4. Bürger als einzelne Figuren mit Tageswegen (iPad-Last!) – oder weiter nur Arbeiter-/Trägerwege?
5. Akt III/IV mit Bürgerkrieg und Landenteignung – zu düster oder genau richtig?
6. Reihenfolge: zuerst Phase A (spielbar) oder zuerst B (Optik)?
