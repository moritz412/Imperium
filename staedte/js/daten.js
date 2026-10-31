// Städte Roms – Spieldaten (Gebäude, Waren, Jahreszeiten, Senatsaufträge)

export const RASTER = 40;            // Felder je Seite
export const MONAT_S = 5;            // Sekunden je Monat bei normalem Tempo
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
  huette: { n: 'Hütte', kat: 'Wohnen', g: [2, 2], h: 0.7, wand: 0xd8b88a, dach: 0xa9583a,
    kosten: { holz: 12 }, wohnt: 8, text: 'Wohnraum für 8 Plebejer. Wird zur Casa mit Brot, Brunnen und Markt in der Nähe.' },
  feld: { n: 'Getreidefeld', kat: 'Nahrung', g: [3, 3], flach: true, wand: 0xd9c26e,
    kosten: { holz: 10 }, arbeiter: 3, erzeugt: { getreide: 3 }, ernte: true,
    text: 'Getreide. Wenig im Frühling, viel im Herbst, nichts im Winter.' },
  muehle: { n: 'Mühle', kat: 'Nahrung', g: [2, 2], h: 1.1, wand: 0xc9a27a, dach: 0x8a5a3a,
    kosten: { holz: 25, ziegel: 10 }, arbeiter: 3, braucht: { getreide: 3 }, erzeugt: { mehl: 3 },
    text: 'Mahlt Getreide zu Mehl.' },
  baeckerei: { n: 'Bäckerei', kat: 'Nahrung', g: [2, 2], h: 0.8, wand: 0xd6b07e, dach: 0x9e4e30,
    kosten: { holz: 20, ziegel: 15 }, arbeiter: 3, braucht: { mehl: 3 }, erzeugt: { brot: 4 },
    text: 'Backt Brot aus Mehl. Brot macht die Bürger zufriedener als Getreidebrei.' },
  markt: { n: 'Markt', kat: 'Öffentlich', g: [3, 3], h: 0.45, wand: 0xe9d9b5, dach: 0x3f6e8c,
    kosten: { holz: 35, ziegel: 15 }, arbeiter: 2, reichweite: 20, strassen: true,
    text: 'Versorgt Häuser, die er über Straßen in höchstens 20 Feldern erreicht. Nötig für den Aufstieg zur Casa.' },
  speicher: { n: 'Speicher', kat: 'Öffentlich', g: [3, 2], h: 0.9, wand: 0xcbb894, dach: 0x9a4a2b,
    kosten: { holz: 40, ziegel: 20 }, arbeiter: 1, lager: 200,
    text: 'Erhöht die Lagergrenze jeder Ware um 200.' },
  holzfaeller: { n: 'Holzfäller', kat: 'Handwerk', g: [2, 2], h: 0.6, wand: 0x9c7a55, dach: 0x6b4a32,
    kosten: { holz: 8 }, arbeiter: 2, erzeugt: { holz: 3 }, wald: 6,
    text: 'Schlägt Holz. Braucht Wald in höchstens 6 Feldern Abstand.' },
  lehmgrube: { n: 'Lehmgrube', kat: 'Handwerk', g: [2, 2], flach: true, wand: 0x9a6b4a,
    kosten: { holz: 10 }, arbeiter: 2, erzeugt: { lehm: 3 },
    text: 'Sticht Lehm für die Ziegelei.' },
  ziegelei: { n: 'Ziegelei', kat: 'Handwerk', g: [2, 2], h: 0.7, wand: 0xb9714f, dach: 0x6e3b28, kamin: true,
    kosten: { holz: 30 }, arbeiter: 3, braucht: { lehm: 2 }, erzeugt: { ziegel: 2 },
    text: 'Brennt Ziegel aus Lehm.' },
  brunnen: { n: 'Brunnen', kat: 'Öffentlich', g: [1, 1], h: 0.35, wand: 0xbfb6a4, wasser: true,
    kosten: { ziegel: 8 }, reichweite: 7,
    text: 'Versorgt Häuser im Umkreis von 7 Feldern mit Wasser.' },
  strasse: { n: 'Straße', kat: 'Öffentlich', g: [1, 1], flach: true, wand: 0xb3a07c,
    kosten: { denare: 2 }, text: 'Pflasterweg. Gebäude brauchen eine Straße vor der Tür, der Markt erreicht Häuser nur über Straßen.' },
};

// Casa: ausgebaute Hütte
export const CASA = { n: 'Casa', h: 1.15, wand: 0xe2c8a0, dach: 0xb5522f, wohnt: 16, kosten: { ziegel: 10 } };

// Umland (S2.1): Hex-Felder um die Stadt. Ring 3 = 37 Felder. nutzen = was ab S2.2 dort entstehen kann.
export const REGION_RING = 3;
export const REGION_TYPEN = {
  stadt: { n: 'Cremona', farbe: 0x8f9a5c, text: 'Die Stadt innerhalb ihrer Grenzen.', nutzen: '' },
  acker: { n: 'Ackerland', farbe: 0x9aa456, text: 'Fruchtbarer Boden der Po-Ebene.', nutzen: 'Gehöft mit Getreide, später Villa rustica' },
  wald:  { n: 'Wald', farbe: 0x55703a, text: 'Eichen- und Buchenwald.', nutzen: 'Holzfällerlager' },
  lehm:  { n: 'Lehmgrund', farbe: 0x9a7650, text: 'Schwerer Lehm in der Flussaue.', nutzen: 'Lehmgrube und Ziegelei' },
  weide: { n: 'Weide', farbe: 0x86a35a, text: 'Feuchte Wiesen.', nutzen: 'Schafe und Rinder (Wolle, Leder)' },
  hang:  { n: 'Hang', farbe: 0x8c8a58, text: 'Sanfte Hügel am Rand der Ebene.', nutzen: 'Wein und Oliven (später erforscht)' },
  fluss: { n: 'Padus', farbe: 0x5e8fb0, text: 'Der Fluss Padus, schiffbar bis zur Adria.', nutzen: 'Anleger und Fischerei' },
};

// Betriebe im Umland (S2.2). Ertrag je Monat, minus 15 % je Feld Entfernung ab dem zweiten (bis Wege/Karren mit S2.3 kommen)
export const VERMESSEN = { kosten: { denare: 20 }, monate: 2 };
export const LAND_BETRIEBE = {
  gehoeft:    { n: 'Gehöft', auf: 'acker', kosten: { holz: 20 }, erzeugt: { getreide: 4 }, ernte: true, modell: 'huette',
    text: 'Eine Bauernfamilie bestellt das Feld. Getreide wie auf den Feldern der Stadt: viel im Herbst, nichts im Winter.' },
  holzlager:  { n: 'Holzfällerlager', auf: 'wald', kosten: { holz: 10 }, erzeugt: { holz: 3 }, modell: 'holzfaeller',
    text: 'Holzfäller schlagen Stämme und flößen sie zur Stadt.' },
  lehmstich:  { n: 'Lehmstich', auf: 'lehm', kosten: { holz: 10 }, erzeugt: { lehm: 3 }, modell: 'lehmgrube',
    text: 'Lehm aus der Flussaue für die Ziegeleien.' },
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
  gut: { denare: 300, holz: 170, lehm: 0, ziegel: 40, getreide: 40, mehl: 0, brot: 20 },
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
];
