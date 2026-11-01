// Städte Roms – Spieldaten (Gebäude, Waren, Jahreszeiten, Senatsaufträge)

export const RASTER = 64;            // Felder in Ost-West-Richtung (1.11.: 40 → 64, Erweiterung nach Osten)
export const TIEFE = 40;             // Felder in Nord-Süd-Richtung
// Stadterweiterung (1.11., Moritz: „Senat genehmigt“): offen bis x < GRENZE[S.grenze]. Die Via Postumia (148 v. Chr.)
// führt nach Osten; mit jeder Erweiterung wird die Landstraße dorthin verlängert.
export const GRENZE = [40, 52, 64];
export const ERWEITERUNG = [
  { rang: 1, gunst: 50, kosten: { denare: 150 }, text: 'Der Senat weist der Kolonie Land östlich der Mauer zu.' },
  { rang: 2, gunst: 60, kosten: { denare: 400 }, text: 'Entlang der Via Postumia darf die Stadt bis an die Grenzsteine wachsen.' },
];
export const MONAT_S = 15;           // Sekunden je Monat bei normalem Tempo (1.11.: 5 → 9 → 15, Moritz: „mehr wie Manor Lords, aber nicht so langsam“)
export const STEUER = 0.3;           // Denare je Einwohner und Monat bei Stimmung 70 (1.11.: 0,4 → 0,3)
export const LAGER_GRUND = 150;      // Lagergrenze je Ware ohne Speicher
export const ARBEIT_ANTEIL = 0.7;    // Anteil der Einwohner, der arbeitet
export const ESSEN_JE_MONAT = 0.1;   // Nahrung je Einwohner und Monat

export const WAREN = {
  denare:   { n: 'Denare',   lager: false },
  holz:     { n: 'Holz',     lager: true },
  lehm:     { n: 'Lehm',     lager: true },
  ziegel:   { n: 'Ziegel',   lager: true },
  getreide: { n: 'Getreide', lager: true },
  mehl:     { n: 'Mehl',     lager: true },
  brot:     { n: 'Brot',     lager: true },
  fisch:    { n: 'Fisch',    lager: true },
  stein:    { n: 'Stein',    lager: true },
  erz:      { n: 'Erz',      lager: true },
  werkzeug: { n: 'Werkzeug', lager: true },
  trauben:  { n: 'Trauben',  lager: true },
  wein:     { n: 'Wein',     lager: true },
  oliven:   { n: 'Oliven',   lager: true },
  oel:      { n: 'Öl',       lager: true },
  wolle:    { n: 'Wolle',    lager: true },
  tuch:     { n: 'Tuch',     lager: true },
  garum:    { n: 'Garum',    lager: true },
};

export const JAHRESZEITEN = [
  { n: 'Frühling', boden: 0x7d9656, ernte: 0.5 },
  { n: 'Sommer',   boden: 0x6f8c46, ernte: 1.0 },
  { n: 'Herbst',   boden: 0x998c50, ernte: 2.0 },
  { n: 'Winter',   boden: 0xc4c8bd, ernte: 0 },
];

export const KATEGORIEN = ['Wohnen', 'Nahrung', 'Handwerk', 'Öffentlich'];

// g = Größe [Breite x, Tiefe z] in Feldern, h = Wandhöhe, flach = nur Bodenfläche
export const GEB = {
  domus: { n: 'Domus', kat: 'Wohnen', g: [3, 3], h: 0.95, wand: 0xeadbc0, dach: 0xa9482a, epoche: 2,
    kosten: { ziegel: 40, stein: 20, holz: 20 }, wohnt: 10,
    text: 'Stadthaus mit Atrium für die Equites (Ritter). Sie brauchen Brot, Wasser, Markt und Wein, arbeiten nicht selbst und zahlen hohe Steuern.' },
  huette: { n: 'Hütte', kat: 'Wohnen', g: [2, 2], h: 0.7, wand: 0xd8b88a, dach: 0xa9583a,
    kosten: { holz: 12 }, wohnt: 8, text: 'Wohnraum für 8 Plebejer. Wird zur Casa mit Brot, Brunnen und Markt in der Nähe.' },
  zeltlager: { n: 'Zeltlager der Kolonisten', kat: '', g: [3, 2], h: 0.5, wand: 0xd8c8a8, dach: 0xb89a70, kosten: {}, bautrupp: 4,
    text: 'Hier lagern die Kolonisten, bis die ersten Häuser stehen. Ihr Bautrupp (4 Mann) arbeitet auf Baustellen in Laufweite – auch ohne Häuser.' },
  quartier: { n: 'Sklavenquartier', kat: 'Wohnen', g: [2, 2], h: 0.55, wand: 0xa08a6a, dach: 0x6e5236,
    kosten: { holz: 20 }, sklavenPlatz: 10,
    text: 'Enge Unterkunft für 10 Sklaven. Sklaven arbeiten auf Feldern, in Gruben und Werkstätten, essen Getreidebrei und zahlen keine Steuern.' },
  feld: { n: 'Getreidefeld', kat: 'Nahrung', g: [3, 3], flach: true, wand: 0xd9c26e, sklaven: true,
    kosten: { holz: 10 }, arbeiter: 3, erzeugt: { getreide: 3 }, ernte: true,
    text: 'Getreide. Wenig im Frühling, viel im Herbst, nichts im Winter.' },
  muehle: { n: 'Mühle', kat: 'Nahrung', g: [2, 2], h: 1.1, wand: 0xc9a27a, dach: 0x8a5a3a, sklaven: true,
    kosten: { holz: 25, ziegel: 10 }, arbeiter: 3, braucht: { getreide: 3 }, erzeugt: { mehl: 3 },
    text: 'Mahlt Getreide zu Mehl.' },
  baeckerei: { n: 'Bäckerei', kat: 'Nahrung', g: [2, 2], h: 0.8, wand: 0xd6b07e, dach: 0x9e4e30,
    kosten: { holz: 20, ziegel: 15 }, arbeiter: 3, braucht: { mehl: 3 }, erzeugt: { brot: 4 },
    text: 'Backt Brot aus Mehl. Brot macht die Bürger zufriedener als Getreidebrei.' },
  markt: { n: 'Markt', kat: 'Öffentlich', g: [3, 3], h: 0.45, wand: 0xe9d9b5, dach: 0x3f6e8c,
    kosten: { holz: 35, ziegel: 15 }, arbeiter: 2, reichweite: 20, strassen: true, unterhalt: 3,
    text: 'Versorgt Häuser, die er über Straßen in höchstens 20 Feldern erreicht. Nötig für den Aufstieg zur Casa.' },
  speicher: { n: 'Speicher', kat: 'Öffentlich', g: [3, 2], h: 0.9, wand: 0xcbb894, dach: 0x9a4a2b,
    kosten: { holz: 40, ziegel: 20 }, arbeiter: 1, lager: 200, unterhalt: 2,
    text: 'Erhöht die Lagergrenze jeder Ware um 200.' },
  holzfaeller: { n: 'Holzfäller', kat: 'Handwerk', g: [2, 2], h: 0.6, wand: 0x9c7a55, dach: 0x6b4a32, sklaven: true,
    kosten: { holz: 8 }, arbeiter: 2, erzeugt: { holz: 4 }, wald: 6,
    text: 'Schlägt Holz. Braucht Wald in höchstens 6 Feldern Abstand.' },
  lehmgrube: { n: 'Lehmgrube', kat: 'Handwerk', g: [2, 2], flach: true, wand: 0x9a6b4a, sklaven: true,
    kosten: { holz: 10 }, arbeiter: 2, erzeugt: { lehm: 3 },
    text: 'Sticht Lehm für die Ziegelei.' },
  kelter: { n: 'Kelter', kat: 'Nahrung', g: [2, 2], h: 0.75, wand: 0xd2b48c, dach: 0x7a3a2a, sklaven: true, forschung: 'weinbau',
    kosten: { holz: 30, ziegel: 20 }, arbeiter: 2, braucht: { trauben: 2 }, erzeugt: { wein: 2 },
    text: 'Presst Trauben zu Wein und lagert ihn in Dolia. Die Equites in ihren Domus trinken ihn.' },
  oelmuehle: { n: 'Ölmühle', kat: 'Nahrung', g: [2, 2], h: 0.75, wand: 0xd8c49a, dach: 0x8a4a2a, sklaven: true, forschung: 'olivenpresse',
    kosten: { holz: 30, ziegel: 20 }, arbeiter: 2, braucht: { oliven: 2 }, erzeugt: { oel: 2 },
    text: 'Mahlt Oliven mit dem Trapetum und presst das Öl. Equites mit Öl zahlen mehr Steuern.' },
  garumsiederei: { n: 'Garum-Siederei', kat: 'Nahrung', g: [2, 2], h: 0.6, wand: 0xc8b898, dach: 0x7a4a2a, sklaven: true, forschung: 'garum',
    kosten: { holz: 25, ziegel: 15 }, arbeiter: 2, braucht: { fisch: 3 }, erzeugt: { garum: 1 },
    text: 'Fisch reift mit Salz in offenen Becken zu Garum. Teuer im Handel, begehrt bei den Equites. Es riecht.' },
  weberei: { n: 'Weberei', kat: 'Handwerk', g: [2, 2], h: 0.75, wand: 0xd6c4a8, dach: 0x8a5a3a, forschung: 'weberei',
    kosten: { holz: 30, ziegel: 15 }, arbeiter: 3, braucht: { wolle: 2 }, erzeugt: { tuch: 2 },
    text: 'Webt Tuch aus Wolle. Familien in Casa und Insula kleiden sich damit – das hebt die Stimmung.' },
  schmiede: { n: 'Schmiede', kat: 'Handwerk', g: [2, 2], h: 0.7, wand: 0x8a7a68, dach: 0x5a3a2a, kamin: true, sklaven: true,
    kosten: { holz: 25, ziegel: 15 }, arbeiter: 3, braucht: { erz: 1, holz: 1 }, erzeugt: { werkzeug: 2 },
    text: 'Schmiedet Werkzeug aus Erz. Mit Werkzeug arbeiten Felder, Gruben und Werkstätten 15 % schneller.' },
  ziegelei: { n: 'Ziegelei', kat: 'Handwerk', g: [2, 2], h: 0.7, wand: 0xb9714f, dach: 0x6e3b28, kamin: true, sklaven: true,
    kosten: { holz: 30 }, arbeiter: 3, braucht: { lehm: 2 }, erzeugt: { ziegel: 2 },
    text: 'Brennt Ziegel aus Lehm.' },
  brunnen: { n: 'Brunnen', kat: 'Öffentlich', g: [1, 1], h: 0.35, wand: 0xbfb6a4, wasser: true,
    kosten: { ziegel: 8 }, reichweite: 7,
    text: 'Versorgt Häuser im Umkreis von 7 Feldern mit Wasser.' },
  ludus: { n: 'Schule', kat: 'Öffentlich', g: [2, 2], h: 0.75, wand: 0xe6d6b4, dach: 0x8a4a2b,
    kosten: { holz: 25, ziegel: 15 }, arbeiter: 2, wissen: 3, unterhalt: 4,
    text: 'Ein Lehrer (ludi magister) unterrichtet die Kinder der Stadt: 3 Wissen im Monat für die Forschung.' },
  schrein: { n: 'Schrein', kat: 'Öffentlich', g: [1, 1], h: 0.6, wand: 0xd8ccb0, dach: 0xa9583a, forschung: 'schreine',
    kosten: { ziegel: 10, holz: 5 }, reichweite: 9,
    text: 'Kleiner Schrein der Laren. Häuser im Umkreis von 9 Feldern sind zufriedener.' },
  wache: { n: 'Feuerwache', kat: 'Öffentlich', g: [2, 2], h: 0.8, wand: 0xc8a888, dach: 0x8a3a2a,
    kosten: { holz: 30, ziegel: 20 }, arbeiter: 3, reichweite: 12, unterhalt: 5,
    text: 'Nachtwächter mit Eimern, Haken und Decken (tresviri nocturni) löschen Brände und halten nachts Ordnung. Augustus macht daraus später die Vigiles.' },
  tempel: { n: 'Tempel', kat: 'Öffentlich', g: [3, 3], h: 1.2, wand: 0xeee6d4, dach: 0xa9482a, forschung: 'tempel',
    kosten: { ziegel: 60, stein: 40, holz: 20 }, arbeiter: 2, unterhalt: 5, reichweite: 16,
    text: 'Tempel für Jupiter. Häuser im Umkreis von 16 Feldern sind zufriedener, und jeden Herbst steigt die Gunst Roms.' },
  theater: { n: 'Theater', kat: 'Öffentlich', g: [4, 3], h: 0.9, wand: 0xe0d4bc, dach: 0xb5522f, forschung: 'theater',
    kosten: { ziegel: 80, stein: 60, holz: 40 }, arbeiter: 4, unterhalt: 8,
    text: 'Komödien des Plautus und Terenz. Ein bespieltes Theater hebt die Stimmung der ganzen Stadt.' },
  latrine: { n: 'Latrine', kat: 'Öffentlich', g: [2, 1], h: 0.55, wand: 0xd8ccb0, dach: 0xa9583a,
    kosten: { ziegel: 12, holz: 6 }, reichweite: 9,
    text: 'Öffentliche Latrine mit fließendem Wasser in der Rinne. Häuser im Umkreis von 9 Feldern erkranken viel seltener.' },
  thermen: { n: 'Thermen', kat: 'Öffentlich', g: [4, 3], h: 1.0, wand: 0xe6dccb, dach: 0xa9482a, forschung: 'aquaedukt',
    kosten: { ziegel: 80, stein: 40, holz: 40 }, arbeiter: 3, unterhalt: 6, reichweite: 16, heizen: 3,
    text: 'Öffentliches Bad mit Kalt-, Lau- und Warmbad. Die Heizung (praefurnium) verbrennt jeden Monat 3 Holz. Geheizt: Stimmung im Umkreis von 16 Feldern, Luxus für die Equites, weniger Seuchen.' },
  basilika: { n: 'Basilika', kat: 'Öffentlich', g: [6, 4], h: 1.6, wand: 0xeee6d4, dach: 0xa9482a, wahrzeichen: true, rang: 2,
    kosten: { stein: 120, ziegel: 150, holz: 80, denare: 300 }, bauzeit: 8, arbeiter: 4, unterhalt: 6,
    text: 'Wahrzeichen am Forum: Markthalle und Gerichtssaal unter einem Dach. Einmal je Stadt, ab der Kleinstadt, 8 Monate Bauzeit. Danach Stimmung +5 in der ganzen Stadt und jeden Monat Ansehen für die Familie.' },
  mauer: { n: 'Stadtmauer', kat: 'Öffentlich', g: [1, 1], h: 0.9, wand: 0xcfc4a8, kosten: { ziegel: 3, holz: 1 }, bauarbeiter: 1, bauzeit: 1,
    text: 'Ein Abschnitt der Stadtmauer – durch Ziehen gebaut. Häuser, die die Mauer ganz umschließt, sind bei Überfällen sicher. Fluss und Mauer sperren, Tore lassen Straßen hindurch.' },
  tor: { n: 'Stadttor', kat: 'Öffentlich', g: [1, 1], h: 1.2, wand: 0xcfc4a8, kosten: { ziegel: 12, holz: 6 }, bauarbeiter: 2, bauzeit: 2,
    text: 'Tor in der Stadtmauer. Wird auf eine Straße gebaut: Wagen fahren hindurch, bei Gefahr wird es geschlossen.' },
  strasse: { n: 'Straße', kat: 'Öffentlich', g: [1, 1], flach: true, wand: 0xb3a07c,
    kosten: { denare: 2 }, text: 'Pflasterweg. Gebäude brauchen eine Straße vor der Tür, der Markt erreicht Häuser nur über Straßen.' },
};

// Casa: ausgebaute Hütte
export const CASA = { n: 'Casa', h: 1.15, wand: 0xe2c8a0, dach: 0xb5522f, wohnt: 16, kosten: { ziegel: 10 } };
// Insula (S3.2): mehrstöckiges Mietshaus, ab Kleinstadt; braucht zusätzlich einen Schrein in der Nähe
export const INSULA = { n: 'Insula', h: 2.1, wand: 0xd9b48a, dach: 0xa9482a, wohnt: 30, kosten: { ziegel: 20, stein: 10 }, rang: 2 };

// Sklaven (S3.2, Moritz 1.11.: „historisch“). Kauf beim Sklavenhändler (servus venalis), Freilassung (manumissio)
// mit der Freilassungssteuer (vicesima libertatis, 5 % des Werts). Viele Sklaven im Verhältnis zu Freien schüren Furcht.
export const SKLAVEN = { los: 5, preis: 25, essen: 0.1, furcht: 0.5, vicesima: 0.05 };

// Umland (S2.1): Hex-Felder um die Stadt. Ring 3 = 37 Felder. nutzen = was ab S2.2 dort entstehen kann.
export const REGION_RING = 4;   // 1.11.: Ring 4 dazu (61 Felder); die inneren 37 Felder bleiben wie zuvor erzeugt
export const REGION_TYPEN = {
  stadt: { n: 'Cremona', farbe: 0x8f9a5c, text: 'Die Stadt innerhalb ihrer Grenzen.', nutzen: '' },
  acker: { n: 'Ackerland', farbe: 0x9aa456, text: 'Fruchtbarer Boden der Po-Ebene.', nutzen: 'Gehöft mit Getreide, später Villa rustica' },
  wald:  { n: 'Wald', farbe: 0x55703a, text: 'Eichen- und Buchenwald.', nutzen: 'Holzfällerlager' },
  lehm:  { n: 'Lehmgrund', farbe: 0x9a7650, text: 'Schwerer Lehm in der Flussaue.', nutzen: 'Lehmgrube und Ziegelei' },
  weide: { n: 'Weide', farbe: 0x86a35a, text: 'Feuchte Wiesen.', nutzen: 'Schafe und Rinder (Wolle, Leder)' },
  hang:  { n: 'Hang', farbe: 0x8c8a58, text: 'Sanfte Hügel am Rand der Ebene.', nutzen: 'Kastell gegen die Gallier, später Wein und Oliven' },
  fluss: { n: 'Padus', farbe: 0x5e8fb0, text: 'Der Fluss Padus, schiffbar bis zur Adria.', nutzen: 'Anleger und Fischerei' },
  stein: { n: 'Steinbruch', farbe: 0x9a958a, text: 'Kalkstein aus den Ausläufern der Alpen.', nutzen: 'Steinbruch (Stein für Insulae)' },
  erz:   { n: 'Erzader', farbe: 0x8a6e5a, text: 'Eisenhaltiges Gestein am Hügelrand.', nutzen: 'Erzgrube (Erz für die Schmiede)' },
  gallier: { n: 'Dorf der Insubrer', farbe: 0x7e8a4e, text: 'Ein keltisches Dorf hinter Palisaden. Die Insubrer haben Rom nicht vergessen, dass es ihr Land nahm.', nutzen: '' },
  nachbar: { n: 'Placentia', farbe: 0x8f9a5c, text: 'Schwesterkolonie flussaufwärts, im selben Jahr gegründet wie Cremona.', nutzen: '' },
};

// Nachbarstadt und Handel (S2.5). Placentia liegt westlich vor dem Ring am Padus (Hex-Feld außerhalb der Karte).
// Handel offen, wenn ein Nachbarfeld von Placentia mit der Stadt verbunden ist oder ein verbundener Anleger besteht.
// Preis = basis × (normal / Vorrat)^0,7, begrenzt auf 0,4–3 × basis; Vorrat kehrt jeden Monat um 10 % zurück.
export const NACHBAR = { q: -5, r: 4 };   // 1.11.: an den Rand von Ring 4 gerückt
// Handelspartner (1.11.): Placentia (Fluss oder Weg), Mantua (nur über die Straße nach Osten)
export const MANTUA = { q: 5, r: -1, n: 'Mantua', unter: 'Stadt am Mincius · Handel',
  text: 'Alte etruskische Stadt in den Sümpfen des Mincius. Ihre Schmiede kaufen Erz und verkaufen Werkzeug.',
  waren: { holz: { basis: 3, normal: 100 }, getreide: { basis: 2.5, normal: 90 }, fisch: { basis: 2, normal: 120 }, ziegel: { basis: 3.5, normal: 80 },
    stein: { basis: 3, normal: 60 }, erz: { basis: 4, normal: 40 }, werkzeug: { basis: 6, normal: 50 },
    wein: { basis: 6.5, normal: 30 }, tuch: { basis: 7.5, normal: 40 }, garum: { basis: 11, normal: 40 } } };
// Gallier (1.11.): das Dorf, von dem die Überfälle kommen. Geschenke kaufen Frieden.
export const GALLIER = { q: -1, r: -4, geschenk: { brot: 40, denare: 60 }, monate: 24 };
export const HANDEL = {
  menge: 10, aufschlag: 0.15, rueck: 0.1,
  waren: {   // basis = Denare je Einheit, normal = üblicher Vorrat in Placentia
    holz:     { basis: 2, normal: 160 }, lehm: { basis: 1, normal: 120 }, ziegel: { basis: 4, normal: 50 },
    getreide: { basis: 2, normal: 140 }, mehl: { basis: 3, normal: 80 }, brot: { basis: 4, normal: 60 },
    fisch:    { basis: 3, normal: 60 },
    wein: { basis: 6, normal: 40 }, oel: { basis: 6, normal: 40 }, tuch: { basis: 7, normal: 30 }, garum: { basis: 12, normal: 30 },
  },
};
// Abgaben an Rom (S2.5): am Ende jedes Herbstes ab dem zweiten Jahr. Gunst Roms (0–100) ändert den Lohn der Senatsaufträge.
export const ABGABE = { grund: 10, je: 0.8, gunst: 50, plus: 8, minus: 20 };

// Betriebe im Umland (S2.2). Ertrag je Monat nur mit Weg zur Stadt (S2.3), minus 5 % je Feld Entfernung ab dem zweiten
export const VERMESSEN = { kosten: { denare: 20 }, monate: 2 };
export const WEG = { kosten: { denare: 10, holz: 5 } };   // Feldweg auf einem vermessenen Feld (S2.3)
export const LAND_BETRIEBE = {
  gehoeft:    { n: 'Gehöft', auf: 'acker', kosten: { holz: 20 }, erzeugt: { getreide: 3 }, ernte: true, modell: 'huette',
    text: 'Eine Bauernfamilie bestellt das Feld. Getreide wie auf den Feldern der Stadt: viel im Herbst, nichts im Winter.' },
  holzlager:  { n: 'Holzfällerlager', auf: 'wald', kosten: { holz: 10 }, erzeugt: { holz: 3 }, modell: 'holzfaeller',
    text: 'Holzfäller schlagen Stämme und flößen sie zur Stadt.' },
  lehmstich:  { n: 'Lehmstich', auf: 'lehm', kosten: { holz: 10 }, erzeugt: { lehm: 3 }, modell: 'lehmgrube',
    text: 'Lehm aus der Flussaue für die Ziegeleien.' },
  fischer:    { n: 'Fischerhütte', auf: 'fluss', kosten: { holz: 15 }, erzeugt: { fisch: 3 }, modell: 'huette',
    text: 'Fischer werfen ihre Netze im Padus aus. Fisch macht satt wie Brot.' },
  anleger:    { n: 'Anleger', auf: 'fluss', kosten: { holz: 30, ziegel: 10 }, erzeugt: {}, modell: '',
    text: 'Flussboote verbinden alle Anleger am Padus: Was einen Anleger erreicht, kommt über einen anderen in die Stadt.' },
  steinbruch: { n: 'Steinbruch', auf: 'stein', kosten: { holz: 20 }, erzeugt: { stein: 2 }, modell: 'lehmgrube',
    text: 'Steinmetze brechen Kalksteinblöcke. Insulae brauchen Stein.' },
  erzgrube:   { n: 'Erzgrube', auf: 'erz', kosten: { holz: 25, denare: 20 }, erzeugt: { erz: 2 }, modell: 'holzfaeller',
    text: 'Bergleute fördern Eisenerz für die Schmiede in der Stadt.' },
  weinberg:   { n: 'Weinberg', auf: 'hang', forschung: 'weinbau', kosten: { holz: 25, denare: 30 }, erzeugt: { trauben: 3 }, ernte: true, modell: 'huette',
    text: 'Reben an den sonnigen Hängen. Lese im Herbst, die Trauben gehen in die Kelter der Stadt.' },
  olivenhain: { n: 'Olivenhain', auf: 'hang', forschung: 'olivenpresse', kosten: { holz: 20, denare: 30 }, erzeugt: { oliven: 3 }, ernte: true, modell: 'huette',
    text: 'Ölbäume an den Hängen. Im Herbst werden die Oliven geschlagen und in die Ölmühle der Stadt gebracht.' },
  schaeferei: { n: 'Schäferei', auf: 'weide', forschung: 'weberei', kosten: { holz: 20 }, erzeugt: { wolle: 2 }, modell: 'huette',
    text: 'Hirten scheren die Schafe der feuchten Wiesen. Die Wolle geht an die Weberei.' },
  kastell:    { n: 'Kastell', auf: 'hang', unterhalt: 6, kosten: { holz: 60, ziegel: 40, denare: 80 }, erzeugt: {}, modell: '',
    text: 'Eine Besatzung auf den Hügeln hält die Gallier ab und vertreibt Räuber im Umkreis von 2 Feldern.' },
};

// Gefahren (S2.6). Schutzbauten als Zusatz auf vermessenem Land (wie der Feldweg)
export const SCHUTZ = {
  turm:  { n: 'Wachturm', unterhalt: 1, kosten: { holz: 25, ziegel: 10 }, text: 'Wächter halten Räuber fern – auf diesem Feld und den Feldern daneben.' },
  deich: { n: 'Deich', kosten: { holz: 10, lehm: 15 }, text: 'Schützt das Feld vor dem Hochwasser des Padus im Frühling.' },
};
// ab = erster Spielmonat, monat = Monat im Jahr (0 = erster Frühlingsmonat), chance je Gelegenheit, monate = Ausfall
export const GEFAHR = {
  raeuber:    { ab: 12, chance: 0.05, monate: 3, weit: 2 },              // je ungeschütztem Betrieb ab 2 Feldern Entfernung
  hochwasser: { ab: 12, monat: 1, chance: 0.4, monate: 2 },             // Betriebe neben dem Fluss ohne Deich
  gallier:    { ab: 36, einwohner: 60, monat: 4, chance: 0.35, monate: 4, raub: 0.25, stimmung: 10 },   // Norden, ohne Kastell
};

// Stadtrang nach Einwohnern (Konzept „Ziele“)
export const RAENGE = [
  { n: 'Feldlager', art: 'ein', ab: 0 }, { n: 'Dorf', art: 'ein', ab: 40 }, { n: 'Kleinstadt', art: 'eine', ab: 120 },
  { n: 'Kolonie', art: 'eine', ab: 300 }, { n: 'Metropole', art: 'eine', ab: 800 },
];

// Startregionen (Konzept „Rahmen“); vorerst nur die Po-Ebene spielbar
export const REGIONEN = [
  { id: 'po', n: 'Po-Ebene', stadt: 'Cremona', lon: 10.02, lat: 45.13, gruendung: '218 v. Chr.', roh: 'Getreide, Holz, Lehm',
    text: 'Latinische Kolonie am Fluss Padus, vorgeschobener Posten gegen die Gallier. Fruchtbare Ebene, Hochwasser im Frühling.', schwer: 'Mittel', aktiv: true },
  { id: 'etrurien', n: 'Etrurien', stadt: 'Florentia', lon: 11.25, lat: 43.77, gruendung: '59 v. Chr.', roh: 'Eisenerz, Wein, Marmor',
    text: 'Veteranenstadt am Arnus. Marmor aus Luna, aber wenig Bauland zwischen den Hügeln.', schwer: 'Mittel' },
  { id: 'kampanien', n: 'Kampanien', stadt: 'Puteoli', lon: 14.1, lat: 40.82, gruendung: '194 v. Chr.', roh: 'Wein, Oliven, Fisch, Puzzolanerde',
    text: 'Hafenstadt am Golf. Puzzolanerde für römischen Beton – und die Erde bebt unter dem Vesuv.', schwer: 'Leicht' },
  { id: 'apulien', n: 'Apulien', stadt: 'Luceria', lon: 15.33, lat: 41.5, gruendung: '314 v. Chr.', roh: 'Oliven, Wolle, Getreide',
    text: 'Weite Ebenen und Schafweiden, Dürre im Sommer, fern von Rom.', schwer: 'Schwer' },
];

export const START = {
  gut: { denare: 220, holz: 130, lehm: 0, ziegel: 30, getreide: 40, mehl: 0, brot: 20, fisch: 0 },
  stimmung: 60,
};

const anzahl = (S, t) => S.geb.filter(b => b.t === t).length;

export const AUFTRAEGE = [
  { n: 'Baue zwei Hütten an der Landstraße für die ersten Siedler.', ok: S => anzahl(S, 'huette') >= 2, lohn: { denare: 50, holz: 30 } },
  { n: 'Baue einen Holzfäller am Waldrand.', ok: S => anzahl(S, 'holzfaeller') >= 1, lohn: { denare: 40 } },
  { n: 'Brotkette: Getreidefeld, Mühle und Bäckerei.', ok: S => ['feld', 'muehle', 'baeckerei'].every(t => anzahl(S, t) >= 1), lohn: { denare: 80, ziegel: 20 } },
  { n: 'Ziegelkette: Lehmgrube und Ziegelei.', ok: S => anzahl(S, 'lehmgrube') >= 1 && anzahl(S, 'ziegelei') >= 1, lohn: { denare: 80 } },
  { n: 'Brunnen und Markt: Lass eine Hütte zur Casa aufsteigen.', ok: S => S.geb.some(b => b.t === 'huette' && b.stufe === 2), lohn: { denare: 120 } },
  { n: 'Siedle 60 Einwohner an.', ok: S => S.geb.reduce((s, b) => s + (b.bew || 0), 0) >= 60, lohn: { denare: 150 } },
  // ab hier (1.11.): roter Faden durch Umland, Handel, Forschung, Gefahren und Familie
  { n: 'Umland: Lass drei Felder vermessen und baue ein Gehöft (Knopf „Umland“).', ok: S => Object.keys(S.land || {}).length >= 3 && Object.values(S.land || {}).some(l => l.betrieb === 'gehoeft'), lohn: { denare: 100, holz: 40 } },
  { n: 'Lege Feldwege, bis ein Betrieb im Umland mit der Stadt verbunden ist.', ok: S => Object.values(S.land || {}).some(l => l.betrieb && l.weg), lohn: { denare: 80 } },
  { n: 'Baue eine Schule und wähle ein Ziel auf der Forschungsseite (Knopf „Wissen“).', ok: S => anzahl(S, 'ludus') >= 1 && !!S.forschung && (!!S.forschung.ziel || S.forschung.fertig.length > 0), lohn: { denare: 100, ziegel: 20 } },
  { n: 'Handle mit Placentia: Lege einen Weg oder Anleger bis zur Nachbarstadt.', ok: S => ((S.zaehler || {}).handel || 0) >= 1, lohn: { denare: 120 } },
  { n: 'Schütze die Stadt: Baue eine Feuerwache.', ok: S => anzahl(S, 'wache') >= 1, lohn: { denare: 80, ziegel: 20 } },
  { n: 'Werde eine Kleinstadt mit 120 Einwohnern.', ok: S => (S.rang || 0) >= 2, lohn: { denare: 200 } },
  { n: 'Baue eine Latrine und lass eine Casa zur Insula aufstocken.', ok: S => anzahl(S, 'latrine') >= 1 && S.geb.some(b => b.t === 'huette' && b.stufe === 3), lohn: { denare: 150, stein: 20 } },
  { n: 'Führe Cremona in die Späte Republik (Forschungsseite).', ok: S => (S.epoche || 1) >= 2, lohn: { denare: 250 } },
  { n: 'Lass einen Valerier zum Ädil wählen (Knopf „Familie“).', ok: S => !!S.familie && S.familie.amt >= 1, lohn: { denare: 200 } },
  { n: 'Errichte die Basilika am Forum.', ok: S => S.geb.some(b => b.t === 'basilika' && !(b.bau > 0)), lohn: { denare: 300 } },
  { n: 'Werde eine Kolonie mit 300 Einwohnern.', ok: S => (S.rang || 0) >= 3, lohn: { denare: 400 } },
  { n: 'Lass einen Valerier zum Prätor wählen.', ok: S => !!S.familie && S.familie.amt >= 2, lohn: { denare: 500 } },
];

// Forschung (S3.1): Wissen aus dem Stadtrat (1 im Monat) und Schulen (je 3), ein Ziel gleichzeitig.
// ep 1 = Frühe Republik (erforschbar), ep 2 = Späte Republik (nur Vorschau, kommt mit dem Amt des Ädils)
export const WISSEN_GRUND = 1;
export const ZWEIGE = ['Landwirtschaft', 'Handwerk', 'Bauwesen', 'Verwaltung & Recht', 'Kultur & Glaube'];
export const FORSCHUNG = {
  fruchtwechsel:  { n: 'Fruchtwechsel', zweig: 0, ep: 1, kosten: 30, text: 'Bohnen und Getreide im Wechsel: Getreide von Feldern und Gehöften +25 %.' },
  villa:          { n: 'Villa rustica', zweig: 0, ep: 1, kosten: 60, braucht: 'fruchtwechsel', text: 'Gehöfte im Umland lassen sich zum Gutshof ausbauen: Ertrag +75 %.' },
  ziegelbrand:    { n: 'Ziegelbrand', zweig: 1, ep: 1, kosten: 30, text: 'Heißere Öfen: Ziegeleien brennen 3 statt 2 Ziegel.' },
  toepferscheibe: { n: 'Töpferscheibe', zweig: 1, ep: 1, kosten: 40, braucht: 'ziegelbrand', text: 'Amphoren und Dolia für die Vorräte: Lagergrenze +50 je Ware.' },
  schotter:       { n: 'Schotterwege', zweig: 2, ep: 1, kosten: 40, text: 'Feldwege mit Kies: kein Verlust durch Entfernung, Karren fahren doppelt so schnell.' },
  bauhuette:      { n: 'Bauhütte', zweig: 2, ep: 1, kosten: 35, text: 'Geübte Zimmerleute: Gebäude in der Stadt brauchen 20 % weniger Holz.' },
  steuerlisten:   { n: 'Steuerlisten', zweig: 3, ep: 1, kosten: 30, text: 'Der Census erfasst jeden Haushalt: Steuern +20 %.' },
  landvermessung: { n: 'Landvermessung', zweig: 3, ep: 1, kosten: 25, text: 'Groma und Messkette: Vermessen dauert 1 Monat und kostet 10 Denare.' },
  schreine:       { n: 'Schreine', zweig: 4, ep: 1, kosten: 30, text: 'Schreine der Laren an den Straßen: Häuser in der Nähe sind zufriedener.' },
  feste:          { n: 'Erntefest', zweig: 4, ep: 1, kosten: 40, braucht: 'schreine', text: 'Nach der Ernte feiert die Stadt: Stimmung +10, kostet 20 Brot.' },
  weinbau:        { n: 'Weinbau', zweig: 0, ep: 2, kosten: 80, text: 'Weinberge an den Hängen und Kelter in der Stadt. Wein brauchen die Equites.' },
  olivenpresse:   { n: 'Olivenpresse', zweig: 0, ep: 2, kosten: 90, text: 'Olivenhaine an den Hängen und Ölmühle: Equites mit Öl zahlen mehr.' },
  weberei:        { n: 'Weberei', zweig: 1, ep: 2, kosten: 80, text: 'Schäfereien auf den Weiden und Weberei: Tuch für Casa und Insula.' },
  garum:          { n: 'Garum-Siederei', zweig: 1, ep: 2, kosten: 90, text: 'Fischsoße aus Padus-Fisch: teuer im Handel, Luxus für die Equites.' },
  roemerstrasse:  { n: 'Römerstraße', zweig: 2, ep: 2, kosten: 100, braucht: 'schotter', text: 'Gepflasterte Wege: Karren dreimal so schnell, Räuber halb so oft.' },
  aquaedukt:      { n: 'Aquädukt', zweig: 2, ep: 2, kosten: 120, text: 'Wasser aus den Hügeln: Brunnen reichen 12 statt 7 Felder, weniger Brände, Thermen bauen.' },
  archiv:         { n: 'Archiv', zweig: 3, ep: 2, kosten: 80, text: 'Verträge mit den Nachbarstädten: Händler nehmen nur 8 statt 15 % Aufschlag.' },
  zoelle:         { n: 'Zölle', zweig: 3, ep: 2, kosten: 90, braucht: 'archiv', text: 'Zoll auf durchziehende Händler: 8 Denare im Monat je offener Handelsstraße.' },
  tempel:         { n: 'Tempelbau', zweig: 4, ep: 2, kosten: 90, text: 'Ein Tempel für Jupiter: Stimmung im Umkreis, jeden Herbst Gunst Roms.' },
  theater:        { n: 'Theater', zweig: 4, ep: 2, kosten: 110, braucht: 'tempel', text: 'Komödien des Plautus: Stimmung in der ganzen Stadt.' },
};
export const EPOCHEN = ['', 'Frühe Republik', 'Späte Republik', 'Kaiserzeit'];

// Feuer und Ordnung (S3.3). Chance je Gebäude und Monat = basis × Dichte × Schutz (ab dem 3. Jahr; 1.11. nach Balance-Lauf gesenkt).
// Dichte = 1 + 0,15 je Gebäude (nicht flach) im Umkreis von 3 Feldern. Feuerwache in Reichweite ×0,2, Brunnen ×0,7.
// Ein Brand ohne Wache: Nachbarn löschen mit Eimerketten (35 % je Monat), sonst greift er zu 15 % auf Nachbarn (bis 3,5 Felder)
// über und zerstört nach 3 Monaten das Gebäude (1.11. nach Balance-Spieler: vorher 25 %, ohne Eimer).
export const FEUER = {
  ab: 24, basis: { huette: 0.0015, casa: 0.0012, insula: 0.003, baeckerei: 0.0045, ziegelei: 0.0045, schmiede: 0.0045, quartier: 0.002 }, sonst: 0.0008,
  dichte: 0.15, umkreis: 3, wache: 0.2, brunnen: 0.7, sommer: 1.5, ueber: 0.15, ueberWache: 0.05, nachbar: 3.5, monate: 3, eimer: 0.35,
  unruhe: 6,   // Stimmungsziel − bis 6, wenn Häuser ab der Kleinstadt keine Wache in der Nähe haben
};

// Übergang in die Späte Republik (1.11., Moritz: Rang + Forschung): Kolonie, 6 Erfindungen, Gunst Roms ab 50
export const EPOCHE2 = { rang: 3, erfindungen: 6, gunst: 50 };

// Familie und Ämter (S4.1). Stadtkasse (S.gut.denare) und Familienvermögen (S.familie.vermoegen) sind getrennt.
export const FAMILIE_START = {
  gens: 'Valerii', name: 'Valerier', vermoegen: 120, ansehen: 10, amt: 0, geschaefte: 0,
  mitglieder: [
    { n: 'Lucius Valerius', alter: 38, rolle: 'Oberhaupt', eig: 'Redner', text: 'Ansehen wächst 20 % schneller.' },
    { n: 'Aemilia', alter: 31, rolle: 'Ehefrau', eig: 'Geschäftssinn', text: 'Familiengeschäfte bringen 25 % mehr.' },
    { n: 'Marcus Valerius', alter: 13, rolle: 'Sohn', eig: 'ehrgeizig', text: 'Erbe der Familie, mündig mit 16.' },
    { n: 'Valeria', alter: 9, rolle: 'Tochter', eig: 'klug', text: 'Eine gute Heirat stärkt später die Familie.' },
  ],
};
// cursus honorum (vereinfacht). Wahl: Ansehen über der Schwelle UND über der stärksten Rivalen-Familie, Wahlkampf aus dem Vermögen.
export const AEMTER = [
  { id: 'quaestor', n: 'Quästor', text: 'Verwaltet die Kasse der Kolonie: Steuern +10 %.' },
  { id: 'aedil', n: 'Ädil', ansehen: 60, kosten: 300, epoche: 2, text: 'Aufsicht über Bauten, Märkte und Spiele: alles 10 % billiger zu bauen, Spiele ausrichten.' },
  { id: 'praetor', n: 'Prätor', ansehen: 150, kosten: 800, rang: 3, text: 'Gerichte und Ordnung: Räuber halb so oft, Wache und Kastell nur halben Sold.' },
  { id: 'konsul', n: 'Konsul', ansehen: 300, kosten: 2000, rang: 4, bald: true, text: 'Das höchste Amt der Republik – kommt mit der Kaiserzeit.' },
];
export const RIVALEN = [
  { gens: 'Fabii', n: 'Fabier', ansehen: 22, wachstum: 0.6, text: 'Alte Grundbesitzer, stolz und vorsichtig.' },
  { gens: 'Sempronii', n: 'Sempronier', ansehen: 14, wachstum: 0.75, text: 'Händlerfamilie mit Freunden in Placentia.' },
];
// Heirat (S4.2). Tochter: Die Familie zahlt die Mitgift (dos) und gewinnt ein Bündnis. Sohn: Die Braut bringt die Mitgift mit.
export const HEIRAT = {
  tochter: [
    { id: 'fabii', n: 'Gnaeus Fabius', haus: 'Fabier', mitgift: 200, bund: 'Fabii', text: 'Bündnis: Die Fabier treten bei Wahlen nicht mehr gegen euch an.' },
    { id: 'sempronii', n: 'Tiberius Sempronius', haus: 'Sempronier', mitgift: 150, bund: 'Sempronii', text: 'Bündnis: Die Sempronier treten nicht mehr gegen euch an und öffnen ihre Handelskontakte (Aufschlag −5 %).' },
    { id: 'annii', n: 'Titus Annius', haus: 'Kaufmann aus Placentia', mitgift: 80, text: 'Gemeinsame Geschäfte mit Placentia: 3 Denare im Monat für das Familienvermögen.' },
  ],
  sohn: [
    { id: 'fabia', n: 'Fabia', haus: 'Fabier', mitgift: 120, bund: 'Fabii', text: 'Sie bringt eine Mitgift von 120 Denaren und das Bündnis mit den Fabiern.' },
    { id: 'sempronia', n: 'Sempronia', haus: 'Sempronier', mitgift: 150, bund: 'Sempronii', text: 'Sie bringt 150 Denare und das Bündnis mit den Sempronieren.' },
    { id: 'annia', n: 'Annia', haus: 'Kaufmannsfamilie aus Placentia', mitgift: 250, text: 'Eine reiche Mitgift von 250 Denaren, aber kein politisches Bündnis.' },
  ],
  alterTochter: 14, alterSohn: 18, kindChance: 0.35,
};
// Klienten (S4.2): kommen jeden Morgen zur salutatio; kosten Zuwendungen (sportula), bringen Ansehen und Stimmen
export const KLIENTEN = { kosten: 1.5, ansehen: 0.06, schritt: 5, grund: 10, jeRang: 10 };
// Ausbildung des Sohnes (S4.2) ab 14 Jahren, 36 Monate
export const AUSBILDUNG = {
  rhetor: { n: 'Rhetorenschule', kosten: 100, monate: 36, eig: 'Redner', text: 'Lernt bei einem griechischen Rhetor: Ansehen wächst 20 % schneller.' },
  militaer: { n: 'Militärdienst', kosten: 0, monate: 36, eig: 'Veteran', text: 'Dient in einer Legion: Gallier fallen nur halb so oft ein.' },
};
export const FAMILIE = {
  geschaeftMax: 3, geschaeftGewinn: 4, gerede: 3,   // ab 3 Familiengeschäften: Gunst −1 im Monat
  spiele: { vermoegen: 150, ansehen: 15, stimmung: 10 }, auftragAnsehen: 5,
};

// Ereignisse mit Entscheidungen (S4.3). w = Wirkung: gut {Ware: ±}, vermoegen, ansehen, gunst, stimmung, leute (Anteil der
// Einwohner, negativ = Verlust), zuzug (Einwohner in freie Häuser), frieden (Monate). Negative Waren/Vermögen = Kosten (müssen da sein).
// fest = Spielmonat, an dem das Ereignis sicher kommt (Hannibal 218 v. Chr.); sonst Zufall (12 % je Monat ab Monat 6).
export const EREIGNISSE = [
  { id: 'heer', fest: 7, titel: 'Der Konsul braucht Getreide', bild: 'krieg',
    text: 'Hannibal hat die Alpen überquert. Der Konsul Tiberius Sempronius Longus zieht mit seinem Heer nach Norden und verlangt Getreide von der jungen Kolonie.',
    wahl: [{ t: 'Getreide liefern', w: { gut: { getreide: -20 }, gunst: 8 } }, { t: 'Silber statt Getreide schicken', w: { gut: { denare: -40 }, gunst: 4 } }, { t: 'Nichts geben – wir brauchen es selbst', w: { gunst: -10 } }] },
  { id: 'trebia', fest: 10, titel: 'Niederlage an der Trebia', bild: 'trebia',
    text: 'Bei Placentia hat Hannibal das römische Heer geschlagen. Versprengte Soldaten und Bauern fliehen nach Cremona und bitten um Aufnahme.',
    wahl: [{ t: 'Alle aufnehmen', w: { zuzug: 12, gut: { getreide: -10 }, ansehen: 4, stimmung: -2 } }, { t: 'Nur die Bauern aufnehmen', w: { zuzug: 6 } }, { t: 'Die Tore geschlossen halten', w: { stimmung: -4, ansehen: -3 } }] },
  { id: 'bestechung', titel: 'Ein Angebot unter vier Augen', bild: 'geld', ab: 6,
    text: 'Ein Bauunternehmer (redemptor) legt einen Beutel auf den Tisch: 80 Denare für die Familie, wenn er die nächsten Straßen der Stadt bauen darf.',
    wahl: [{ t: 'Annehmen', w: { vermoegen: 80, gunst: -5 } }, { t: 'Höflich ablehnen', w: { ansehen: 3 } }, { t: 'Ihn vor dem Rat anzeigen', w: { ansehen: 6, gunst: 2 } }] },
  { id: 'witwe', titel: 'Die Witwe eines Legionärs', bild: 'witwe', ab: 6,
    text: 'Eine Witwe mit drei Kindern bittet um Hilfe. Ihr Mann fiel im Krieg, die Felder liegen brach.',
    wahl: [{ t: 'Getreide aus dem Speicher geben', w: { gut: { getreide: -15 }, stimmung: 4, ansehen: 2 } }, { t: 'Aus dem Familienvermögen helfen', w: { vermoegen: -20, ansehen: 5 } }, { t: 'Abweisen', w: { stimmung: -3 } }] },
  { id: 'getreidehaendler', titel: 'Ein Getreideschiff am Anleger', bild: 'handel', ab: 6, wenn: S => S.gut.getreide < 60,
    text: 'Ein Händler aus Ariminum bietet eine Schiffsladung Weizen an – teuer, aber sofort.',
    wahl: [{ t: '60 Getreide für 90 Denare kaufen', w: { gut: { denare: -90, getreide: 60 } } }, { t: 'Ablehnen', w: {} }] },
  { id: 'fieber', titel: 'Fieber in den Gassen', bild: 'seuche', ab: 12, wenn: S => S.geb.reduce((s, b) => s + (b.bew || 0), 0) >= 80,
    text: 'Aus den Sümpfen am Padus zieht ein Fieber in die dichten Viertel. Die ersten Familien liegen krank.',
    wahl: [{ t: 'Griechische Ärzte holen', w: { gut: { denare: -60 }, leute: -0.02 } }, { t: 'Apollo ein Opfer bringen', w: { gut: { denare: -20 }, stimmung: 3, leute: -0.06 } }, { t: 'Abwarten', w: { leute: -0.1, stimmung: -6 } }] },
  { id: 'unruhe', titel: 'Murren auf dem Markt', bild: 'volk', ab: 6, wenn: S => S.stimmung < 45,
    text: 'Plebejer versammeln sich auf dem Markt. Sie klagen über Preise, Hunger und die Herren im Rat.',
    wahl: [{ t: 'Brot verteilen', w: { gut: { brot: -25 }, stimmung: 10 } }, { t: 'Eine Rede halten', w: { stimmung: 5, ansehen: 3 }, braucht: { ansehen: 30 } }, { t: 'Die Wache räumen lassen', w: { stimmung: -6, gunst: 2 } }] },
  { id: 'muenzen', titel: 'Ein Fund beim Pflügen', bild: 'ernte', ab: 6,
    text: 'Ein Bauer stößt beim Pflügen auf einen Topf voller alter Silbermünzen der Etrusker.',
    wahl: [{ t: 'In die Stadtkasse', w: { gut: { denare: 40 } } }, { t: 'Der Familie zuschlagen', w: { vermoegen: 40, ansehen: -2 } }, { t: 'Den Göttern weihen', w: { stimmung: 5, ansehen: 2 } }] },
  { id: 'erbschaft', titel: 'Ein Testament', bild: 'geld', ab: 12,
    text: 'Ein kinderloser Klient der Familie ist gestorben und hat den Valeriern sein Vermögen vermacht.',
    wahl: [{ t: 'Das Erbe annehmen', w: { vermoegen: 60 } }, { t: 'Der Stadt stiften', w: { gut: { denare: 60 }, ansehen: 6 } }] },
  { id: 'grenzstreit', titel: 'Streit um die Weiden', bild: 'ernte', ab: 12,
    text: 'Hirten aus Placentia treiben ihre Herden auf Cremoneser Weiden. Beide Städte berufen sich auf alte Grenzsteine.',
    wahl: [{ t: 'Nachgeben', w: { stimmung: -2, gunst: 1 } }, { t: 'Den Senat in Rom entscheiden lassen', w: { gut: { denare: -40 }, gunst: 3 } }, { t: 'Hart bleiben', w: { ansehen: 4, gunst: -3 } }] },
  { id: 'priester', titel: 'Die Priester bitten', bild: 'ernte', ab: 6,
    text: 'Die Priester der Ceres bitten um eine Spende für das Fest der Aussaat.',
    wahl: [{ t: '30 Denare spenden', w: { gut: { denare: -30 }, stimmung: 5 } }, { t: 'Getreide als Opfer geben', w: { gut: { getreide: -10 }, stimmung: 3 } }, { t: 'Ablehnen', w: { stimmung: -2 } }] },
  { id: 'insubrer', titel: 'Gesandte der Insubrer', bild: 'tor', ab: 24, wenn: S => !(S.frieden > 0),
    text: 'Zwei Krieger mit goldenen Halsringen stehen vor dem Tor. Ihr Häuptling bietet Frieden – gegen Wein und Silber.',
    wahl: [{ t: 'Frieden kaufen (60 Denare)', w: { gut: { denare: -60 }, frieden: 18 } }, { t: 'Mit Gastgeschenken empfangen (20 Brot)', w: { gut: { brot: -20 }, frieden: 8, ansehen: 2 } }, { t: 'Fortschicken', w: { ansehen: 2 } }] },
  // Feste im Jahreslauf (jährlich ab dem 2. Jahr; jaehrlich = Monat im Jahr, 0 = erster Frühlingsmonat)
  { id: 'cerealia', jaehrlich: 1, titel: 'Cerealia', bild: 'ernte',
    text: 'Im Frühling ehrt die Stadt Ceres, die Göttin des Getreides. Die Bauern hoffen auf ihren Segen für die Aussaat.',
    wahl: [{ t: 'Ein großes Fest mit Opfern und Umzug', w: { gut: { getreide: -15, denare: -20 }, stimmung: 8, ansehen: 2 } }, { t: 'Ein schlichtes Opfer', w: { gut: { getreide: -5 }, stimmung: 3 } }, { t: 'Dieses Jahr ausfallen lassen', w: { stimmung: -4 } }] },
  { id: 'ludi', jaehrlich: 6, titel: 'Ludi Romani', bild: 'spiele',
    text: 'Im Herbst feiert ganz Rom die Römischen Spiele zu Ehren Jupiters. Auch in Cremona erwarten die Bürger Wettläufe und Theater.',
    wahl: [{ t: 'Prächtige Spiele aus der Stadtkasse', w: { gut: { denare: -60 }, stimmung: 10 } }, { t: 'Die Familie bezahlt die Spiele', w: { vermoegen: -50, stimmung: 8, ansehen: 6 } }, { t: 'Nur ein Opfer am Altar', w: { stimmung: -2 } }] },
  { id: 'saturnalia', jaehrlich: 9, titel: 'Saturnalien', bild: 'volk',
    text: 'Im Dezember steht die Welt Kopf: Sklaven sitzen mit ihren Herren an einem Tisch, man beschenkt sich mit Kerzen und Tonfiguren.',
    wahl: [{ t: 'Ein Festmahl für alle', w: { gut: { brot: -20 }, stimmung: 8 } }, { t: 'Geschenke an die Klienten', w: { vermoegen: -30, ansehen: 4, stimmung: 3 } }, { t: 'Still feiern', w: {} }] },
  { id: 'eroeffnung', nurAusgeloest: true, titel: 'Die Basilika wird eröffnet', bild: 'spiele',
    text: 'Nach Monaten voller Lärm, Staub und Ochsenkarren steht die Basilika am Forum. Die ganze Stadt drängt sich unter den Säulen, ein Stier wird geopfert, der Name der Valerier steht in Stein über dem Eingang.',
    wahl: [{ t: 'Ein Festmahl für die ganze Stadt', w: { gut: { brot: -30 }, ansehen: 30, gunst: 10, stimmung: 15 } }, { t: 'Eine feierliche Rede', w: { ansehen: 25, gunst: 10, stimmung: 8 } }] },
];
export const EREIGNIS_CHANCE = 0.12, EREIGNIS_PAUSE = 36;   // Monate, bis dasselbe Ereignis wiederkommen kann

// Seuchen (1.11.): Chance je Haus und Monat ab dem 2. Jahr = basis × Dichte (+20 % je Haus im Umkreis 4) × Insula 2 × Sommer 1,5
// × Latrine in der Nähe 0,3 × Brunnen 0,8 × Aquädukt 0,7. Kranke Häuser verlieren 10 % der Bewohner je Monat (3 Monate) und
// stecken Häuser im Umkreis 3 mit 30 % an (mit Latrine 8 %).
export const SEUCHE = { ab: 12, basis: 0.0008, dichte: 0.2, umkreis: 4, insula: 2, sommer: 1.5, latrine: 0.3, brunnen: 0.8, aquaedukt: 0.7,
  monate: 3, verlust: 0.1, ueber: 0.3, ueberLatrine: 0.08, nachbar: 3 };

// Inschriften auf dem Forum (1.11.): Erfolge, einmal je Spiel. ok(S, sim) prüft monatlich.
export const INSCHRIFTEN = [
  { id: 'casa', n: 'Die erste Casa', text: 'Aus Lehm wurde Ziegel: die erste Casa der Kolonie.', ok: (S) => S.geb.some(b => b.t === 'huette' && b.stufe >= 2) },
  { id: 'dorf', n: 'Ein Dorf am Padus', text: 'Vierzig Seelen leben in Cremona.', ok: (S, sim) => sim.rang(S) >= 1 },
  { id: 'kleinstadt', n: 'Eine Kleinstadt', text: 'Hundertzwanzig Bürger zählt der Census.', ok: (S, sim) => sim.rang(S) >= 2 },
  { id: 'kolonie', n: 'Eine blühende Kolonie', text: 'Dreihundert Bürger – Cremona zählt in Rom.', ok: (S, sim) => sim.rang(S) >= 3 },
  { id: 'metropole', n: 'Metropole der Po-Ebene', text: 'Achthundert Bürger. Selbst Placentia blickt neidisch.', ok: (S, sim) => sim.rang(S) >= 4 },
  { id: 'insula', n: 'Mietshäuser', text: 'Die erste Insula erhebt sich über die Dächer.', ok: (S) => S.geb.some(b => b.t === 'huette' && b.stufe === 3) },
  { id: 'erfindung', n: 'Wissen ist Macht', text: 'Fünf Erfindungen hat die Stadt gemacht.', ok: (S) => ((S.forschung || {}).fertig || []).length >= 5 },
  { id: 'republik', n: 'Die Späte Republik', text: 'Eine neue Zeit beginnt für Cremona.', ok: (S) => (S.epoche || 1) >= 2 },
  { id: 'aedil', n: 'Ädil von Cremona', text: 'Das Volk wählte einen Valerier zum Ädil.', ok: (S) => (S.familie || {}).amt >= 1 },
  { id: 'praetor', n: 'Prätor', text: 'Recht und Ordnung liegen in der Hand der Valerier.', ok: (S) => (S.familie || {}).amt >= 2 },
  { id: 'kasse', n: 'Volle Kasse', text: 'Tausend Denare liegen in der Stadtkasse.', ok: (S) => S.gut.denare >= 1000 },
  { id: 'handel', n: 'Händler am Tor', text: 'Die erste Ladung ging nach Placentia oder Mantua.', ok: (S) => (S.zaehler || {}).handel >= 1 },
  { id: 'umland', n: 'Herr des Umlands', text: 'Zehn Felder im Umland sind vermessen.', ok: (S) => Object.keys(S.land || {}).length >= 10 },
  { id: 'basilika', n: 'Die Basilika', text: 'Das Wahrzeichen am Forum ist eröffnet.', ok: (S) => S.geb.some(b => b.t === 'basilika' && !(b.bau > 0)) },
  { id: 'zehn', n: 'Zehn Jahre Cremona', text: 'Seit zehn Jahren steht die Kolonie am Padus.', ok: (S) => S.monat >= 122 },
];

