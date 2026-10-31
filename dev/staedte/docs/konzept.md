# Imperium der Epochen: Städte Roms – Spielkonzept

Stand 31.10.2026. Ausführliche, bearbeitbare Fassung: Claude-Doc „Imperium der Epochen: Städte Roms – Spielkonzept“.
Mockups: Claude-Design-Canvas „Civitas Mockups“ (Startregion, Stadtansicht, Gebäude, Bevölkerung, Familie).

## Kernidee
Aufbauspiel: Eine römische Provinzstadt in Italien samt Umland vom Feldlager zur Kolonie führen und die eigene Familie
vom Quästor bis ins Konsulat bringen. Mix 60 % Aufbau/Wirtschaft, 40 % Familie/Politik. Eigenständig, gleiche Optik
und gemeinsame 3D-Modelle wie das Hauptspiel. Keine Echtzeitschlachten.

Säulen: sichtbares Wachstum · Probleme als Rätsel mit klarer Ursache · Rhythmus der Jahreszeiten · Region und Stadt
greifen ineinander · Ehrgeiz der Familie · Forschung als Fortschritt.

## Rahmen
| Region | Startstadt | Gründung | Rohstoffe | Besonderheit | Schwierigkeit |
| --- | --- | --- | --- | --- | --- |
| Po-Ebene | Cremona | 218 v. Chr. | Getreide, Holz, Lehm | Fluss Padus, Gallier, Hochwasser | Mittel |
| Etrurien | Florentia | 59 v. Chr. | Eisenerz, Wein, Marmor | Marmor aus Luna, wenig Bauland | Mittel |
| Kampanien | Puteoli | 194 v. Chr. | Wein, Oliven, Fisch, Puzzolanerde | Hafen, Beton, Erdbeben/Vesuv | Leicht |
| Apulien | Luceria | 314 v. Chr. | Oliven, Wolle, Getreide | Weite Ebenen, Dürre, fern von Rom | Schwer |

Technik: Three.js r128, orthografische Kamera in fester Schrägsicht, Touch (iPad zuerst), Instancing für Häuser/Felder.

## Spielschleifen
Bürger wollen mehr → neue Waren fehlen → Region erschließen → Transport & Handel → Stadt verarbeitet →
Häuser steigen auf (Steuern, Ansehen) → Ämter & Forschung schalten neue Ketten frei → Bürger wollen mehr.
- Minuten: bauen, Engpass sehen, Ursache finden, beheben.
- Jahr: Frühling säen, Sommer bauen, Herbst ernten, Winter überstehen; Senat zieht Bilanz.
- Kampagne: Amtszeiten, Aufstieg öffnet Epoche, Gebiete, Forschung.

## Regionskarte (Stufe 2)
Brettspielartige Karte mit 20–30 Feldern um die Stadt. Felder erst vermessen (agrimensores), dann Betrieb setzen und
per Weg verbinden. Feldtypen: Ackerland, Wald, Lehmgrube, Steinbruch (Marmor selten), Erzader, Weide, Hang (Oliven,
Wein), Fluss/Küste (Fisch, Salz). Gehöft → Villa rustica (Spezialisierung) → Dorf (vicus). 2–4 KI-Nachbarstädte.
Gefahren: Räuber (Wachtürme), Grenzvölker (Kastell), Hochwasser/Dürre (Deiche, Zisternen, Vorräte).

## Transport & Handel (Stufe 2)
Route ziehen, Ware wählen, Fahrzeuge fahren selbst. Lastenträger, Maultier, Ochsenkarren, Flussboot, Seeschiff (Küste).
Wege: Pfad, Schotterweg, Römerstraße (erforscht, doppelt so schnell), Brücken/Anleger. Lager → Speicher (horreum).
Handel: Preise nach Angebot/Nachfrage, Verträge mit Nachbarstädten, wandernde Händler, Abgaben an Rom.
Familiengeschäfte: Gewinn ins Familienvermögen, nicht in die Stadtkasse (Versuchung).

## Stadt
Raster innerhalb der Mauern, begrenzter Platz. Kategorien: Wohnen, Nahrung, Handwerk, Wasser, Öffentlich, Glaube,
Ordnung, Verwaltung.

| Kette | Schritte | Verbraucher |
| --- | --- | --- |
| Brot | Getreide → Mühle → Bäckerei → Markt | alle |
| Ziegel | Lehm → Ziegelei → Baustelle | Gebäude ab Stufe 2 |
| Olivenöl | Oliven → Ölpresse → Markt, Thermen | Equites |
| Wein | Trauben → Kelter → Weinkeller → Markt | Plebejer+, Equites, Patrizier |
| Tuch | Wolle → Weberei → Tuchhändler | Plebejer+ |
| Werkzeug | Erz → Schmelze → Schmiede | Höfe, Minen, Baustellen |
| Garum | Fisch + Salz → Garum-Siederei | Equites, Handel |
| Marmor | Marmor → Steinmetz → Statuen | Patrizier, Wahrzeichen |

Infrastruktur: Wasser (Brunnen, Aquädukt, Wasserschloss), Abwasser (Cloaca, sonst Seuchen), Feuer (Vigiles),
Ordnung (Wachen). Overlays: Wasser, Feuer, Stimmung, Arbeit, Bodenwert.

## Bevölkerung
| Stand | Wohnstufen | Grundbedürfnisse | Gehoben | Liefert |
| --- | --- | --- | --- | --- |
| Sklaven | Quartier | Getreidebrei, Unterkunft | Ruhetage | Arbeit Felder/Minen/Werkstätten |
| Plebejer | Hütte → Casa → Insula | Brot, Wasser, Markt | Tempel, Thermen, Wein, Tuch | Handwerk, Steuern |
| Equites | Domus → große Domus | Brot, Wasser, Wein | Öl, Garum, Theater, Thermen | Verwaltung, hohe Steuern |
| Patrizier | Villa urbana | wie Equites | Marmor, Statuen, Spiele, Garten | Stimmen, Ansehen, Gunst |

Arbeiter gehen zu Fuß zur Arbeit (Einzugsbereich), Priorität je Betrieb. Freilassung: Sklaven → liberti (Plebejer).
Stimmung: > 70 % Zuzug/Feste, 40–70 % normal, < 40 % Proteste, < 20 % Aufruhr.

## Forschung
Wissen aus Schule/Bibliothek/Lehrern, Erfahrung durch laufende Betriebe, Händler/Kontakte, Gunst Roms.
Ein Ziel gleichzeitig. Neue Epoche mit Amt + Stadtrang.

| Zweig | Epoche I – Frühe Republik | Epoche II – Späte Republik | Epoche III – Kaiserzeit |
| --- | --- | --- | --- |
| Landwirtschaft | Fruchtwechsel, Villa rustica | Weinbau, Olivenpresse mit Hebel | Wassermühle, Latifundien |
| Handwerk | Töpferscheibe, Ziegelbrand | Weberei, Garum-Siederei | Glasbläserei, Münzprägung |
| Bauwesen | Schotterwege, Holzbrücken | Römerstraße, Tretkran, Aquädukt | Römischer Beton, Kuppel, Fußbodenheizung |
| Verwaltung & Recht | Steuerlisten, Landvermessung | Archiv, Handelsrecht, Zölle | Stadtrecht, Getreideversorgung |
| Kultur & Glaube | Schreine, Feste | Tempelbau, Theater | Amphitheater, Bibliothek, Triumphbogen |

## Familie & Politik
Ämter (vereinfacht): Quästor (Start, Steuern) → Ädil (Bauten, Märkte, Spiele, Epoche II) → Prätor (Gerichte, Ordnung,
größere Region) → Konsul (Epoche III, Kampagnensieg). Gunst des Senats, Klienten, 2–3 Rivalen-Familien,
Familienmitglieder mit Alter/Eigenschaften, Ausbildung, Heirat, Erbfolge. Stadtkasse und Familienvermögen getrennt.

## Jahreszeiten & Ereignisse
Frühling (Aussaat, Hochwasser, Cerealia) · Sommer (Bauen, Brand/Dürre, Spiele) · Herbst (Ernte, Ludi Romani, Abgaben)
· Winter (Vorräte, Saturnalien). Krisen: Hungersnot, Großbrand, Seuche, Naturereignisse, Überfall, Unruhen.
Ereignisse mit 2–3 Entscheidungen.

## Ziele
Senatsaufträge (kurz, zugleich Tutorial) · Amtsziele · Stadtrang Feldlager → Dorf → Kleinstadt → Kolonie → Metropole ·
Wahrzeichen mit Eröffnungsszene · Inschriften auf dem Forum als Erfolge · Ende: Konsul + Kolonie, danach frei weiter.

## Bedienung
Ziehen statt Knöpfe · Problem-Symbol am Gebäude · Kette zeigt Bruchstelle · Zoom wechselt Stadt ↔ Region ·
höchstens zwei Taps · Tutorial über Senatsaufträge · Knöpfe ≥ 44 px, daumenfreundlich · Pause/normal/schnell.

## Ausbaustufen
1. Stadtkern (MVP): Schrägsicht, ~12 Gebäude, Brot und Ziegel, Plebejer, Jahreszeiten, Speichern.
2. Region & Transport: Cremona-Umland, Höfe, Wege, Karren, Flussboote, eine Nachbarstadt.
3. Forschung & volle Bevölkerung: Epoche I–II, alle Stände, Wasser/Feuer.
4. Familie & Politik.
5. Ereignisse & Wahrzeichen.
6. Weitere Regionen, Epoche III, Verbindung zum Hauptspiel.

Offene Fragen: Raster quadratisch oder frei drehbar · Region als Hex-Felder oder freie Landschaft · Länge eines
Spieljahres · Sklaven als Stand oder Tagelöhner · welche Blender-Modelle aus dem Hauptspiel direkt passen.
