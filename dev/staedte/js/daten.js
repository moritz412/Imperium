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
    kosten: { holz: 35, ziegel: 15 }, arbeiter: 2, reichweite: 20, strassen: true,
    text: 'Versorgt Häuser, die er über Straßen in höchstens 20 Feldern erreicht. Nötig für den Aufstieg zur Casa.' },
  speicher: { n: 'Speicher', kat: 'Öffentlich', g: [3, 2], h: 0.9, wand: 0xcbb894, dach: 0x9a4a2b,
    kosten: { holz: 40, ziegel: 20 }, arbeiter: 1, lager: 200,
    text: 'Erhöht die Lagergrenze jeder Ware um 200.' },
  holzfaeller: { n: 'Holzfäller', kat: 'Handwerk', g: [2, 2], h: 0.6, wand: 0x9c7a55, dach: 0x6b4a32, sklaven: true,
    kosten: { holz: 8 }, arbeiter: 2, erzeugt: { holz: 3 }, wald: 6,
    text: 'Schlägt Holz. Braucht Wald in höchstens 6 Feldern Abstand.' },
  lehmgrube: { n: 'Lehmgrube', kat: 'Handwerk', g: [2, 2], flach: true, wand: 0x9a6b4a, sklaven: true,
    kosten: { holz: 10 }, arbeiter: 2, erzeugt: { lehm: 3 },
    text: 'Sticht Lehm für die Ziegelei.' },
  ziegelei: { n: 'Ziegelei', kat: 'Handwerk', g: [2, 2], h: 0.7, wand: 0xb9714f, dach: 0x6e3b28, kamin: true, sklaven: true,
    kosten: { holz: 30 }, arbeiter: 3, braucht: { lehm: 2 }, erzeugt: { ziegel: 2 },
    text: 'Brennt Ziegel aus Lehm.' },
  brunnen: { n: 'Brunnen', kat: 'Öffentlich', g: [1, 1], h: 0.35, wand: 0xbfb6a4, wasser: true,
    kosten: { ziegel: 8 }, reichweite: 7,
    text: 'Versorgt Häuser im Umkreis von 7 Feldern mit Wasser.' },
  ludus: { n: 'Schule', kat: 'Öffentlich', g: [2, 2], h: 0.75, wand: 0xe6d6b4, dach: 0x8a4a2b,
    kosten: { holz: 25, ziegel: 15 }, arbeiter: 2, wissen: 3,
    text: 'Ein Lehrer (ludi magister) unterrichtet die Kinder der Stadt: 3 Wissen im Monat für die Forschung.' },
  schrein: { n: 'Schrein', kat: 'Öffentlich', g: [1, 1], h: 0.6, wand: 0xd8ccb0, dach: 0xa9583a, forschung: 'schreine',
    kosten: { ziegel: 10, holz: 5 }, reichweite: 9,
    text: 'Kleiner Schrein der Laren. Häuser im Umkreis von 9 Feldern sind zufriedener.' },
  wache: { n: 'Feuerwache', kat: 'Öffentlich', g: [2, 2], h: 0.8, wand: 0xc8a888, dach: 0x8a3a2a,
    kosten: { holz: 30, ziegel: 20 }, arbeiter: 3, reichweite: 12,
    text: 'Nachtwächter mit Eimern, Haken und Decken (tresviri nocturni) löschen Brände und halten nachts Ordnung. Augustus macht daraus später die Vigiles.' },
  strasse: { n: 'Straße', kat: 'Öffentlich', g: [1, 1], flach: true, wand: 0xb3a07c,
    kosten: { denare: 2 }, text: 'Pflasterweg. Gebäude brauchen eine Straße vor der Tür, der Markt erreicht Häuser nur über Straßen.' },
};

// Casa: ausgebaute Hütte
export const CASA = { n: 'Casa', h: 1.15, wand: 0xe2c8a0, dach: 0xb5522f, wohnt: 16, kosten: { ziegel: 10 } };
// Insula (S3.2): mehrstöckiges Mietshaus, ab Kleinstadt; braucht zusätzlich einen Schrein in der Nähe
export const INSULA = { n: 'Insula', h: 2.1, wand: 0xd9b48a, dach: 0xa9482a, wohnt: 30, kosten: { ziegel: 25, holz: 15 }, rang: 2 };

// Sklaven (S3.2, Moritz 1.11.: „historisch“). Kauf beim Sklavenhändler (servus venalis), Freilassung (manumissio)
// mit der Freilassungssteuer (vicesima libertatis, 5 % des Werts). Viele Sklaven im Verhältnis zu Freien schüren Furcht.
export const SKLAVEN = { los: 5, preis: 25, essen: 0.1, furcht: 0.5, vicesima: 0.05 };

// Umland (S2.1): Hex-Felder um die Stadt. Ring 3 = 37 Felder. nutzen = was ab S2.2 dort entstehen kann.
export const REGION_RING = 3;
export const REGION_TYPEN = {
  stadt: { n: 'Cremona', farbe: 0x8f9a5c, text: 'Die Stadt innerhalb ihrer Grenzen.', nutzen: '' },
  acker: { n: 'Ackerland', farbe: 0x9aa456, text: 'Fruchtbarer Boden der Po-Ebene.', nutzen: 'Gehöft mit Getreide, später Villa rustica' },
  wald:  { n: 'Wald', farbe: 0x55703a, text: 'Eichen- und Buchenwald.', nutzen: 'Holzfällerlager' },
  lehm:  { n: 'Lehmgrund', farbe: 0x9a7650, text: 'Schwerer Lehm in der Flussaue.', nutzen: 'Lehmgrube und Ziegelei' },
  weide: { n: 'Weide', farbe: 0x86a35a, text: 'Feuchte Wiesen.', nutzen: 'Schafe und Rinder (Wolle, Leder)' },
  hang:  { n: 'Hang', farbe: 0x8c8a58, text: 'Sanfte Hügel am Rand der Ebene.', nutzen: 'Kastell gegen die Gallier, später Wein und Oliven' },
  fluss: { n: 'Padus', farbe: 0x5e8fb0, text: 'Der Fluss Padus, schiffbar bis zur Adria.', nutzen: 'Anleger und Fischerei' },
  nachbar: { n: 'Placentia', farbe: 0x8f9a5c, text: 'Schwesterkolonie flussaufwärts, im selben Jahr gegründet wie Cremona.', nutzen: '' },
};

// Nachbarstadt und Handel (S2.5). Placentia liegt westlich vor dem Ring am Padus (Hex-Feld außerhalb der Karte).
// Handel offen, wenn ein Nachbarfeld von Placentia mit der Stadt verbunden ist oder ein verbundener Anleger besteht.
// Preis = basis × (normal / Vorrat)^0,7, begrenzt auf 0,4–3 × basis; Vorrat kehrt jeden Monat um 10 % zurück.
export const NACHBAR = { q: -4, r: 3 };
export const HANDEL = {
  menge: 10, aufschlag: 0.15, rueck: 0.1,
  waren: {   // basis = Denare je Einheit, normal = üblicher Vorrat in Placentia
    holz:     { basis: 2, normal: 160 }, lehm: { basis: 1, normal: 120 }, ziegel: { basis: 4, normal: 50 },
    getreide: { basis: 2, normal: 140 }, mehl: { basis: 3, normal: 80 }, brot: { basis: 4, normal: 60 },
    fisch:    { basis: 3, normal: 60 },
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
  kastell:    { n: 'Kastell', auf: 'hang', kosten: { holz: 60, ziegel: 40, denare: 80 }, erzeugt: {}, modell: '',
    text: 'Eine Besatzung auf den Hügeln hält die Gallier ab und vertreibt Räuber im Umkreis von 2 Feldern.' },
};

// Gefahren (S2.6). Schutzbauten als Zusatz auf vermessenem Land (wie der Feldweg)
export const SCHUTZ = {
  turm:  { n: 'Wachturm', kosten: { holz: 25, ziegel: 10 }, text: 'Wächter halten Räuber fern – auf diesem Feld und den Feldern daneben.' },
  deich: { n: 'Deich', kosten: { holz: 10, lehm: 15 }, text: 'Schützt das Feld vor dem Hochwasser des Padus im Frühling.' },
};
// ab = erster Spielmonat, monat = Monat im Jahr (0 = erster Frühlingsmonat), chance je Gelegenheit, monate = Ausfall
export const GEFAHR = {
  raeuber:    { ab: 12, chance: 0.05, monate: 3, weit: 2 },              // je ungeschütztem Betrieb ab 2 Feldern Entfernung
  hochwasser: { ab: 12, monat: 1, chance: 0.4, monate: 2 },             // Betriebe neben dem Fluss ohne Deich
  gallier:    { ab: 24, monat: 4, chance: 0.35, monate: 4, raub: 0.25, stimmung: 10 },   // Norden, ohne Kastell
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
  weinbau:        { n: 'Weinbau', zweig: 0, ep: 2, kosten: 80, text: 'Reben an den Hängen, Kelter und Weinkeller.' },
  olivenpresse:   { n: 'Olivenpresse', zweig: 0, ep: 2, kosten: 90, text: 'Öl für Küche, Lampen und Thermen.' },
  weberei:        { n: 'Weberei', zweig: 1, ep: 2, kosten: 80, text: 'Wolle von den Weiden wird zu Tuch.' },
  garum:          { n: 'Garum-Siederei', zweig: 1, ep: 2, kosten: 90, text: 'Fischsoße für die Equites – und für den Handel.' },
  roemerstrasse:  { n: 'Römerstraße', zweig: 2, ep: 2, kosten: 100, text: 'Gepflasterte Fernstraße nach Placentia und Rom.' },
  aquaedukt:      { n: 'Aquädukt', zweig: 2, ep: 2, kosten: 120, text: 'Frisches Wasser aus den Hügeln für die ganze Stadt.' },
  archiv:         { n: 'Archiv', zweig: 3, ep: 2, kosten: 80, text: 'Verträge mit Nachbarstädten.' },
  zoelle:         { n: 'Zölle', zweig: 3, ep: 2, kosten: 90, text: 'Einnahmen von jedem Boot auf dem Padus.' },
  tempel:         { n: 'Tempelbau', zweig: 4, ep: 2, kosten: 90, text: 'Ein Tempel für Jupiter auf dem Forum.' },
  theater:        { n: 'Theater', zweig: 4, ep: 2, kosten: 110, text: 'Komödien des Plautus für die Plebejer.' },
};
export const EPOCHEN = ['', 'Frühe Republik', 'Späte Republik', 'Kaiserzeit'];

// Feuer und Ordnung (S3.3). Chance je Gebäude und Monat = basis × Dichte × Schutz (ab dem 2. Jahr).
// Dichte = 1 + 0,15 je Gebäude (nicht flach) im Umkreis von 3 Feldern. Feuerwache in Reichweite ×0,2, Brunnen ×0,7.
// Ein Brand ohne Wache greift zu 25 % je Monat auf Nachbarn (bis 3,5 Felder) über und zerstört nach 3 Monaten das Gebäude.
export const FEUER = {
  ab: 12, basis: { huette: 0.002, casa: 0.0015, insula: 0.004, baeckerei: 0.006, ziegelei: 0.006, quartier: 0.003 }, sonst: 0.001,
  dichte: 0.15, umkreis: 3, wache: 0.2, brunnen: 0.7, sommer: 1.5, ueber: 0.25, ueberWache: 0.05, nachbar: 3.5, monate: 3,
  unruhe: 6,   // Stimmungsziel − bis 6, wenn Häuser ab der Kleinstadt keine Wache in der Nähe haben
};

