// Städte Roms – Spiellogik ohne Grafik (Gelände, Bauen, Monatsablauf)
import { RASTER, TIEFE, GRENZE, ERWEITERUNG, GEB, CASA, INSULA, SKLAVEN, FEUER, WAREN, JAHRESZEITEN, LAGER_GRUND, ARBEIT_ANTEIL, ESSEN_JE_MONAT, START, AUFTRAEGE, RAENGE, REGION_RING, VERMESSEN, LAND_BETRIEBE, WEG, NACHBAR, MANTUA, GALLIER, HANDEL, ABGABE, SCHUTZ, GEFAHR, STEUER, FORSCHUNG, WISSEN_GRUND, EPOCHE2, FAMILIE_START, AEMTER, RIVALEN, FAMILIE, HEIRAT, KLIENTEN, AUSBILDUNG, EREIGNISSE, EREIGNIS_CHANCE, EREIGNIS_PAUSE, SEUCHE, INSCHRIFTEN, GESCHICHTE, PRAEFEKT, BODENWERT, LAGE, RUF, VERTRAG, REGION_DATEN, REGION_TYPEN } from './daten.js';

export const GRAS = 0, WALD = 1, WASSER = 2;
export const EINZUG = 16;   // Laufweite der Arbeiter in Feldern (Mitte Haus → Mitte Betrieb)

// Gelände: Fluss am unteren Rand, Wald links und in einigen Flecken (fest, nicht zufällig je Start)
// ---------- Regionen (Phase E) ----------
let REG = REGION_DATEN.po, REG_ID = 'po';
export const region = () => REG;
export const stadtName = () => REG.stadt;
export function regionSetzen(id) {
  REG_ID = REGION_DATEN[id] ? id : 'po'; REG = REGION_DATEN[REG_ID]; regionFelder = null;
  REGION_TYPEN.stadt.n = REG.stadt; REGION_TYPEN.fluss.n = REG.fluss; REGION_TYPEN.fluss.text = REG.flussText;
  REGION_TYPEN.nachbar.n = REG.west; REGION_TYPEN.nachbar.text = REG.westText;
  REGION_TYPEN.gallier.n = REG.dorf; REGION_TYPEN.gallier.text = REG.dorfText;
  if (PARTNER_OBJ) { PARTNER_OBJ.placentia.n = REG.west; PARTNER_OBJ.mantua.n = REG.ost; PARTNER_OBJ.mantua.text = REG.ostText; PARTNER_OBJ.mantua.unter = `Stadt im Osten · Handel`; }
}
let PARTNER_OBJ = null;
export function erzeugeWelt(rid = REG_ID) {
  const RW = (REGION_DATEN[rid] || REGION_DATEN.po).welt || {};
  const typ = new Uint8Array(RASTER * TIEFE);
  let s = 7;
  const zufall = () => (s = (s * 16807) % 2147483647) / 2147483647;
  // Reihenfolge wie beim alten 40×40-Gelände (gleiche Zufallsfolge → alte Spielstände passen), danach der Osten
  const feld = (x, z) => {
    const fluss = (RW.flussZ || 36.5) + Math.sin(x * 0.25) * 1.2;
    let t = GRAS;
    if (z >= fluss) t = WASSER;
    else if (x < 3 + Math.sin(z * 0.4) * 1.5 + zufall() * 1.2) t = WALD;
    typ[z * RASTER + x] = t;
  };
  for (let z = 0; z < 40; z++) for (let x = 0; x < 40; x++) feld(x, z);
  for (let z = 0; z < TIEFE; z++) for (let x = 40; x < RASTER; x++) feld(x, z);
  // Waldflecken (die ersten drei wie früher nur im alten Gebiet, dann der Osten)
  const flecken = (liste, bx) => liste.forEach(([cx, cz, r]) => {
    for (let z = 0; z < TIEFE; z++) for (let x = bx[0]; x < bx[1]; x++) {
      if (Math.hypot(x - cx, z - cz) < r + zufall() * 0.8 && typ[z * RASTER + x] === GRAS) typ[z * RASTER + x] = WALD;
    }
  });
  flecken(RW.wenigWald ? [[30, 5, 2]] : [[30, 5, 3.5], [12, 4, 2.5], [33, 24, 2.8], ...(RW.wald || [])], [0, 40]);
  flecken(RW.wenigWald ? [[55, 6, 2]] : [[49, 4, 3], [60, 15, 3.5], [55, 29, 2.5]], [40, RASTER]);
  if (RW.wenigWald) for (let z = 0; z < TIEFE; z++) for (let x = 0; x < 2; x++) if (typ[z * RASTER + x] === WALD && (x + z) % 2) typ[z * RASTER + x] = GRAS;
  const w = { typ }; mauerWelt = w; return w;
}

export function neuesSpiel(rid = REG_ID) {
  regionSetzen(rid);
  const S = { v: 1, region: REG_ID, jahr0: REG.jahr0, monat: 2, gut: { ...START.gut, ...REG.start }, geb: [], naechste: 1, stimmung: START.stimmung,
    auftrag: 0, letzte: {}, versorgt: { brot: false, essen: true }, land: {} };
  // Landstraße quer durch das Bauland (S1.3), an ihr entstehen die ersten Häuser
  const welt = erzeugeWelt();
  for (let x = 0; x < GRENZE[0]; x++) if (welt.typ[START_STRASSE * RASTER + x] === GRAS)
    S.geb.push({ id: S.naechste++, t: 'strasse', x, z: START_STRASSE, w: 0, prio: false, stufe: 1, bew: 0, status: [] });
  // Zeltlager der Kolonisten (Phase A): Bautrupp für die ersten Baustellen
  S.geb.push({ id: S.naechste++, t: 'zeltlager', x: 26, z: START_STRASSE - 2, w: 0, prio: false, stufe: 1, bew: 0, status: [], dreh: 0 });
  return S;
}

// ---------- Straßen (S1.3) ----------
export const START_STRASSE = 12;
export const OHNE_STRASSE = new Set(['strasse', 'brunnen', 'schrein', 'latrine', 'mauer', 'tor', 'garten', 'statue', 'platz']);
export const ZIEHBAR = new Set(['strasse', 'mauer']);
export const sklaven = S => S.geb.reduce((s, b) => s + (b.skl || 0), 0);   // brauchen keine Straße vor der Tür
const NACHBARN = [[1, 0], [-1, 0], [0, 1], [0, -1]];

export function strassenMaske(S) {
  const m = new Uint8Array(RASTER * TIEFE);
  for (const b of S.geb) if (b.t === 'strasse' || (b.t === 'tor' && !(b.bau > 0))) m[b.z * RASTER + b.x] = 1;
    else if (b.t === 'platz' && !(b.bau > 0)) for (let z = b.z; z < b.z + 3; z++) for (let x = b.x; x < b.x + 3; x++) m[z * RASTER + x] = 1;
  return m;
}
// Felder rings um die Grundfläche (ohne Ecken)
export function randFelder(t, x, z) {
  const [w, d] = groesse(t), r = [];
  for (let i = 0; i < w; i++) r.push([x + i, z - 1], [x + i, z + d]);
  for (let i = 0; i < d; i++) r.push([x - 1, z + i], [x + w, z + i]);
  return r.filter(([a, c]) => a >= 0 && c >= 0 && a < RASTER && c < TIEFE).map(([a, c]) => c * RASTER + a);
}
export const anStrasse = (t, x, z, maske) => randFelder(t, x, z).some(i => maske[i]);
// Vorderseite zur Straße (1.11.): 0 = Süden (+z), 1 = Osten, 2 = Norden, 3 = Westen. Nicht quadratische Gebäude nur Süd/Nord.
export function frontSeite(S, t, x, z, maske = strassenMaske(S)) {
  if (GEB[t].flach || t === 'strasse') return 0;
  const [w, d] = groesse(t), hat = feld => feld.some(([a, c]) => a >= 0 && c >= 0 && a < RASTER && c < TIEFE && maske[c * RASTER + a]);
  const reihe = (zz) => Array.from({ length: w }, (_, i) => [x + i, zz]), spalte = (xx) => Array.from({ length: d }, (_, i) => [xx, z + i]);
  if (hat(reihe(z + d))) return 0;
  if (hat(reihe(z - 1))) return 2;
  if (w !== d) return 0;
  if (hat(spalte(x + w))) return 1;
  if (hat(spalte(x - 1))) return 3;
  return 0;
}

// Wegstrecke über Straßen ab den Straßenfeldern vor einem Gebäude (Breitensuche), −1 = nicht erreichbar
export function strassenWeg(maske, b, max = 999) {
  const dist = new Int16Array(RASTER * TIEFE).fill(-1), q = [];
  for (const i of randFelder(b.t, b.x, b.z)) if (maske[i]) { dist[i] = 0; q.push(i); }
  for (let k = 0; k < q.length; k++) {
    const i = q[k], x = i % RASTER, z = (i - x) / RASTER;
    if (dist[i] >= max) continue;
    for (const [dx, dz] of NACHBARN) {
      const a = x + dx, c = z + dz, j = c * RASTER + a;
      if (a >= 0 && c >= 0 && a < RASTER && c < TIEFE && maske[j] && dist[j] < 0) { dist[j] = dist[i] + 1; q.push(j); }
    }
  }
  return dist;
}

export const jahreszeit = S => Math.floor((S.monat % 12) / 3);
export const jahr = S => S.jahr0 + Math.floor(S.monat / 12);
export const einwohner = S => S.geb.reduce((s, b) => s + (b.bew || 0), 0);
export const def = b => GEB[b.t];
export const lagerGrenze = S => LAGER_GRUND + (hat(S, 'toepferscheibe') ? 50 : 0) + S.geb.filter(b => b.t === 'speicher' && (b.w || 0) > 0).length * GEB.speicher.lager;
export const groesse = t => GEB[t].g;

export const rang = S => { const e = einwohner(S); let r = 0; RAENGE.forEach((x, i) => { if (e >= x.ab) r = i; }); return Math.max(r, S.rang || 0); };

export function datumText(S) {
  const j = jahr(S);
  return `${JAHRESZEITEN[jahreszeit(S)].n} · ${j < 0 ? -j + ' v. Chr.' : j + ' n. Chr.'}`;
}

// Belegung: welches Gebäude steht auf Feld (x,z)
export function belegung(S) {
  const m = new Int32Array(RASTER * TIEFE);
  for (const b of S.geb) {
    const [w, d] = groesse(b.t);
    for (let z = b.z; z < b.z + d; z++) for (let x = b.x; x < b.x + w; x++) m[z * RASTER + x] = b.id;
  }
  return m;
}

export function pruefePlatz(S, welt, t, x, z, bel = belegung(S)) {
  const [w, d] = groesse(t);
  if (x < 0 || z < 0 || x + w > RASTER || z + d > TIEFE) return 'Außerhalb der Stadt';
  if (x + w > stadtGrenze(S)) return 'Dieses Land hat der Senat noch nicht freigegeben';
  for (let zz = z; zz < z + d; zz++) for (let xx = x; xx < x + w; xx++) {
    const i = zz * RASTER + xx;
    if (welt.typ[i] === WASSER) return 'Hier fließt der Fluss';
    if (welt.typ[i] === WALD) return 'Hier steht Wald';
    if (bel[i] && !(t === 'tor' && S.geb.some(b => b.id === bel[i] && b.t === 'strasse'))) return 'Hier steht schon etwas';
  }
  if (!OHNE_STRASSE.has(t) && !anStrasse(t, x, z, strassenMaske(S))) return 'Hier fehlt eine Straße vor der Tür';
  if (t === 'tor' && !S.geb.some(b => b.t === 'strasse' && b.x === x && b.z === z)) return 'Ein Tor gehört auf eine Straße';
  return '';
}

export function kannBezahlen(S, kosten) {
  return Object.entries(kosten).every(([g, n]) => (S.gut[g] || 0) >= n);
}

export function fehlendeKosten(S, kosten) {
  return Object.entries(kosten).filter(([g, n]) => (S.gut[g] || 0) < n).map(([g, n]) => `${n - Math.floor(S.gut[g] || 0)} ${WAREN[g].n}`);
}

export function bauen(S, welt, t, x, z) {
  if (gesperrt(S, t)) return { ok: false, grund: sperrGrund(S, t) };
  if (GEB[t].wahrzeichen && S.geb.some(b => b.t === t)) return { ok: false, grund: `${REG.stadt} hat schon eine ${GEB[t].n}` };
  if (GEB[t].rang && rang(S) < GEB[t].rang) return { ok: false, grund: `Erst ab Stadtrang ${RAENGE[GEB[t].rang].n}` };
  const grund = pruefePlatz(S, welt, t, x, z);
  if (grund) return { ok: false, grund };
  const k = baukosten(S, t);
  if (!kannBezahlen(S, k)) return { ok: false, grund: 'Es fehlen ' + fehlendeKosten(S, k).join(', ') };
  for (const [g, n] of Object.entries(k)) S.gut[g] -= n;
  if (t === 'tor') { const st = S.geb.findIndex(o => o.t === 'strasse' && o.x === x && o.z === z); if (st >= 0) S.geb.splice(st, 1); }   // Tor ersetzt die Straße
  const b = { id: S.naechste++, t, x, z, w: 0, prio: false, stufe: 1, bew: 0, status: [], dreh: frontSeite(S, t, x, z) };
  // Bauzeit (Phase A): jedes Gebäude außer Straßen ist erst eine Baustelle; S.sofortBauen nur für Tests (Wahrzeichen immer)
  if (bauzeit(t) > 0 && (!S.sofortBauen || GEB[t].wahrzeichen)) { b.bau = bauzeit(t); b.bezahlt = k; }
  S.geb.push(b);
  return { ok: true, b };
}

export function abreissen(S, id) {
  const i = S.geb.findIndex(b => b.id === id);
  if (i < 0) return false;
  const b = S.geb[i];
  if (b.bau > 0) { for (const [g, n] of Object.entries(b.bezahlt || baukosten(S, b.t))) S.gut[g] += n; }   // Baustelle abbrechen: alles zurück
  else for (const [g, n] of Object.entries(GEB[b.t].kosten)) if (g !== 'denare') S.gut[g] += Math.floor(n / 2);
  S.geb.splice(i, 1);
  return true;
}

export const mitte = b => { const [w, d] = groesse(b.t); return [b.x + w / 2, b.z + d / 2]; };
export const abstand = (a, b) => { const p = mitte(a), q = mitte(b); return Math.hypot(p[0] - q[0], p[1] - q[1]); };

export const reichweite = (S, typ) => typ === 'brunnen' && hat(S, 'aquaedukt') ? 12 : GEB[typ].reichweite;
export function inReichweite(S, b, typ, maske) {
  const d = GEB[typ];
  if (typ === 'markt' && S.geb.some(o => o.t === 'tabernae' && o.w > 0 && abstand(o, b) <= GEB.tabernae.reichweite)) return true;   // Läden
  if (!d.strassen) return S.geb.some(o => o.t === typ && !(o.bau > 0) && abstand(o, b) <= reichweite(S, typ));
  // über Straßen: Weg vom Versorger bis zu einem Straßenfeld vor dem Haus
  maske = maske || strassenMaske(S);
  const vorHaus = randFelder(b.t, b.x, b.z);
  return S.geb.some(o => {
    if (o.t !== typ || !(o.w > 0)) return false;
    const dist = strassenWeg(maske, o, d.reichweite);
    return vorHaus.some(i => dist[i] >= 0 && dist[i] <= d.reichweite);
  });
}

export function waldNah(welt, b) {
  const r = GEB.holzfaeller.wald, [cx, cz] = mitte(b);
  for (let z = Math.max(0, Math.floor(cz - r)); z < Math.min(TIEFE, cz + r); z++)
    for (let x = Math.max(0, Math.floor(cx - r)); x < Math.min(RASTER, cx + r); x++)
      if (welt.typ[z * RASTER + x] === WALD && Math.hypot(x + 0.5 - cx, z + 0.5 - cz) <= r) return true;
  return false;
}

export const wohnraum = b => b.t === 'huette' ? (b.stufe === 3 ? INSULA.wohnt : b.stufe === 2 ? CASA.wohnt : GEB.huette.wohnt) : b.t === 'domus' ? GEB.domus.wohnt : 0;
export function insulaFehlt(S, b, wasser = inReichweite(S, b, 'brunnen'), markt = inReichweite(S, b, 'markt')) {
  if (!wasser) return 'Brunnen'; if (!markt) return 'Markt'; if (!S.versorgt.brot) return 'Brot';
  if (!S.geb.some(o => o.t === 'schrein' && !(o.bau > 0) && abstand(o, b) <= GEB.schrein.reichweite)) return 'Schrein in der Nähe';
  return '';
}

// Ein Monat: Arbeit verteilen, produzieren, essen, wachsen, Steuern, Stimmung, Aufträge
export function monat(S, welt) {
  const meld = [];
  for (const g of Object.keys(WAREN)) S.gut[g] = S.gut[g] || 0;   // neue Waren in alten Spielständen
  const js = jahreszeit(S), grenze = lagerGrenze(S);
  const bew = einwohner(S);

  // Arbeiter verteilen (S1.2): Betriebe nach Priorität, dann Bauzeit; jeder holt sich Arbeiter aus den nächsten Häusern
  // in Laufweite. b.von = [[Haus-Id, Anzahl], …] für die Laufwege in der Szene.
  // Sklaven (S3.2) arbeiten vollständig, aber nur in Betrieben mit „sklaven“; dort gehen sie vor den Freien hin.
  const wohnorte = S.geb.filter(b => b.t === 'huette' && b.bew > 0).map(h => ({ h, frei: Math.round(h.bew * ARBEIT_ANTEIL) }))
    .concat(S.geb.filter(b => b.t === 'quartier' && b.skl > 0).map(h => ({ h, frei: h.skl, skl: true })))
    .concat(S.geb.filter(b => b.t === 'zeltlager').map(h => ({ h, frei: GEB.zeltlager.bautrupp, lager: true })));   // Bautrupp, nur für Baustellen
  const alle = wohnorte.reduce((s, x) => s + x.frei, 0);
  // Baustellen (Phase A, 1.11.) holen ihre Bauarbeiter zuerst (b.bw, getrennt von b.w); Sklaven dürfen mitbauen
  const baustellen = S.geb.filter(b => b.bau > 0).sort((a, b) => (b.prio - a.prio) || (a.id - b.id));
  const betriebe = S.geb.filter(b => GEB[b.t].arbeiter && !(b.bau > 0)).sort((a, b) => (b.prio - a.prio) || (a.id - b.id));
  for (const b of [...baustellen, ...betriebe]) {
    const bau = b.bau > 0, brauch = bau ? bauarbeiter(b.t) : GEB[b.t].arbeiter;
    const nah = wohnorte.filter(x => abstand(x.h, b) <= EINZUG && (!x.skl || bau || GEB[b.t].sklaven) && (!x.lager || bau));
    let n0 = 0; b.w = 0; b.bw = 0; b.von = []; b.einzug = nah.length;
    for (const x of nah.filter(x => x.frei > 0).sort((p, q) => (q.skl ? 1 : 0) - (p.skl ? 1 : 0) || abstand(p.h, b) - abstand(q.h, b))) {
      if (n0 >= brauch) break;
      const n = Math.min(x.frei, brauch - n0); x.frei -= n; n0 += n; b.von.push([x.h.id, n]);
    }
    if (bau) b.bw = n0; else b.w = n0;
  }
  S.letzte = { arbeitslos: wohnorte.filter(x => !x.skl && !x.lager).reduce((s, x) => s + x.frei, 0), sklavenFrei: wohnorte.filter(x => x.skl).reduce((s, x) => s + x.frei, 0), arbeiter: alle };
  S.letzte.unterhalt = unterhaltZahlen(S);

  // Produktion
  for (const b of S.geb) {
    const d = GEB[b.t]; b.status = [];
    if (b.brand > 0) { b.status.push({ art: 'brand', text: b.brand === 1 ? 'Es brennt!' : `Es brennt seit ${b.brand} Monaten!` }); continue; }
    if (b.bau > 0) {   // Baustelle: kommt nur mit Bauarbeitern voran
      if (!(b.bw > 0)) { b.status.push({ art: 'arbeiter', text: b.einzug === 0 ? 'Baustelle: keine Häuser in Laufweite' : 'Baustelle: keine Bauarbeiter frei' }); continue; }
      b.bauFort = (b.bauFort || 0) + b.bw / bauarbeiter(b.t);
      while (b.bauFort >= 1 && b.bau > 0) { b.bauFort -= 1; b.bau--; }
      if (b.bau > 0) { b.status.push({ art: 'bau', text: `Baustelle – noch ${b.bau} ${b.bau === 1 ? 'Monat' : 'Monate'}`, leicht: true }); continue; }
      delete b.bau; delete b.bauFort; b.w = 0;
      if (b.t === 'basilika') S.ereignis = 'eroeffnung';
      if (d.wahrzeichen || bauzeit(b.t) >= 3) meld.push(b.t === 'thermen' ? 'Die Thermen sind fertig!' : `${artikel(b.t)} ${d.n} ist fertig!`);
      continue; }
    if (b.unbezahlt) { b.status.push({ art: 'arbeiter', text: `Kein Geld für den Lohn (${d.unterhalt} Denare)` }); continue; }
    if (!d.arbeiter) continue;
    const anteil = b.w / d.arbeiter;
    if (b.w === 0) { b.status.push({ art: 'arbeiter', text: b.einzug === 0 ? 'Keine Häuser in Laufweite' : 'Keine Arbeiter' }); continue; }
    if (b.w < d.arbeiter) b.status.push({ art: 'arbeiter', text: `Nur ${b.w} von ${d.arbeiter} Arbeitern`, leicht: true });
    if (d.wald && !waldNah(welt, b)) { b.status.push({ art: 'wald', text: 'Kein Wald in der Nähe' }); continue; }
    if (!d.erzeugt) continue;
    let faktor = anteil * (d.ernte ? JAHRESZEITEN[js].ernte : 1);
    if (d.ernte && js === 3) b.status.push({ art: 'winter', text: 'Winterruhe', leicht: true });
    if (d.braucht) for (const [g, n] of Object.entries(d.braucht)) {
      const moeglich = Math.min(1, (S.gut[g] || 0) / (n * anteil || 1));
      if (moeglich < 1) b.status.push({ art: 'rohstoff', gut: g, text: `${WAREN[g].n} fehlt` });
      faktor = Math.min(faktor, anteil * moeglich);
    }
    for (const [g, n] of Object.entries(d.erzeugt)) {
      if (S.gut[g] >= grenze) { b.status.push({ art: 'voll', text: `Lager für ${WAREN[g].n} voll` }); faktor = 0; }
    }
    if (faktor <= 0) continue;
    if (d.sklaven && S.gut.werkzeug >= 0.1) { faktor *= 1.15; S.gut.werkzeug -= 0.1; }   // Werkzeug (1.11.)
    if (d.braucht) for (const [g, n] of Object.entries(d.braucht)) S.gut[g] = Math.max(0, S.gut[g] - n * faktor);
    for (const [g, n] of Object.entries(d.erzeugt)) S.gut[g] = Math.min(grenze, S.gut[g] + n * faktor * bonus(S, b.t, g));
  }

  // Umland (S2.2): Vermessung schreitet fort, Betriebe liefern
  landMonat(S, js, grenze, meld);

  // Essen: erst Brot, sonst Getreidebrei
  const bedarf = bew * ESSEN_JE_MONAT;
  let brotAnteil = 1, essen = true;
  if (bedarf > 0) {
    S.gut.fisch = S.gut.fisch || 0;
    const ausBrot = Math.min(S.gut.brot, bedarf); S.gut.brot -= ausBrot;
    const ausFisch = Math.min(S.gut.fisch, bedarf - ausBrot); S.gut.fisch -= ausFisch;   // Fisch zählt wie Brot (S2.4)
    const rest = bedarf - ausBrot - ausFisch, ausKorn = Math.min(S.gut.getreide, rest); S.gut.getreide -= ausKorn;
    brotAnteil = (ausBrot + ausFisch) / bedarf; essen = ausBrot + ausFisch + ausKorn >= bedarf * 0.99;
  }
  S.versorgt = { brot: brotAnteil > 0.95, essen };
  // Sklaven essen Getreidebrei nach den Freien; fehlt er, fliehen oder sterben sie (−1 je Quartier)
  const skl = sklaven(S);
  if (skl > 0) {
    const brauch = skl * SKLAVEN.essen, aus = Math.min(S.gut.getreide, brauch); S.gut.getreide -= aus;
    if (aus < brauch * 0.99) {
      for (const q of S.geb.filter(b => b.t === 'quartier' && b.skl > 0)) { q.skl--; q.status.push({ art: 'hunger', text: 'Die Sklaven hungern' }); }
      meld.push('Die Sklaven hungern – einige sind geflohen.');
    }
  }

  // Häuser: Wasser, Markt, Wachstum, Aufstieg
  let wasserN = 0, marktN = 0, haeuser = 0;
  const maske = strassenMaske(S);
  for (const b of S.geb.filter(b => b.t === 'huette' && !(b.bau > 0))) {
    haeuser++;
    const wasser = inReichweite(S, b, 'brunnen'), markt = inReichweite(S, b, 'markt', maske);
    if (wasser) wasserN++; if (markt) marktN++;
    if (b.brand > 0) continue;
    if (b.krank > 0) { b.status.push({ art: 'krank', text: 'Krankheit im Haus' }); continue; }
    if (!essen) { b.status.push({ art: 'hunger', text: 'Hunger' }); b.bew = Math.max(0, b.bew - 1); continue; }
    if (b.bew < wohnraum(b) && S.stimmung >= 40) b.bew++;
    if (!wasser) b.status.push({ art: 'wasser', text: 'Kein Brunnen in der Nähe', leicht: true });
    else if (!markt && b.stufe === 1) b.status.push({ art: 'markt', text: 'Kein Markt in der Nähe', leicht: true });
    if (b.stufe === 1 && wasser && markt && S.versorgt.brot && b.bew >= wohnraum(b)) {
      if (kannBezahlen(S, CASA.kosten)) {
        for (const [g, n] of Object.entries(CASA.kosten)) S.gut[g] -= n;
        b.stufe = 2; meld.push('Eine Hütte ist zur Casa aufgestiegen.');
      } else b.status.push({ art: 'rohstoff', gut: 'ziegel', text: 'Für die Casa fehlen 10 Ziegel', leicht: true });
    }
    // Insula (S3.2): volle Casa, Kleinstadt, Wasser, Markt, Brot und ein Schrein in der Nähe
    if (b.stufe === 2 && b.bew >= wohnraum(b) && rang(S) >= INSULA.rang) {
      const fehlt = insulaFehlt(S, b, wasser, markt);
      if (fehlt) b.status.push({ art: 'markt', text: 'Für die Insula fehlt: ' + fehlt, leicht: true });
      else if (kannBezahlen(S, INSULA.kosten)) {
        for (const [g, n] of Object.entries(INSULA.kosten)) S.gut[g] -= n;
        b.stufe = 3; meld.push('Eine Casa wird zur Insula aufgestockt – Platz für 30 Bewohner.');
      } else b.status.push({ art: 'rohstoff', gut: 'ziegel', text: 'Für die Insula fehlen ' + fehlendeKosten(S, INSULA.kosten).join(', '), leicht: true });
    }
  }

  // Thermen (1.11.): geheizt nur mit Holz
  for (const b of S.geb.filter(b => b.t === 'thermen' && b.w > 0 && !(b.brand > 0))) {
    b.geheizt = S.gut.holz >= GEB.thermen.heizen;
    if (b.geheizt) S.gut.holz -= GEB.thermen.heizen; else b.status.push({ art: 'rohstoff', gut: 'holz', text: 'Kein Holz zum Heizen' });
  }
  // Domus der Equites (Späte Republik): wachsen mit Brot, Wasser, Markt und Wein; trinken Wein, zahlen hohe Steuern
  let equites = 0;
  for (const b of S.geb.filter(b => b.t === 'domus')) {
    if (b.brand > 0 || b.bau > 0) continue;
    const wasser = inReichweite(S, b, 'brunnen'), markt = inReichweite(S, b, 'markt', maske), wein = S.gut.wein >= Math.max(0.5, b.bew * 0.1);
    if (b.bew > 0) { if (wein) S.gut.wein -= b.bew * 0.1; else { b.status.push({ art: 'rohstoff', gut: 'wein', text: 'Kein Wein – die Equites ziehen weg' }); b.bew--; } }
    // Luxus (Späte Republik): Öl und Garum – je +25 % Steuern
    let lux = 1;
    for (const [g, n] of [['oel', 0.05], ['garum', 0.02]]) if (b.bew > 0 && S.gut[g] >= b.bew * n) { S.gut[g] -= b.bew * n; lux += 0.25; }
    if (b.bew > 0 && thermeNah(S, b)) lux += 0.25;
    b.lux = lux;
    const lage = bodenwert(S, b) >= LAGE.domus;
    const fehlt = !wasser ? 'Brunnen' : !markt ? 'Markt' : !S.versorgt.brot ? 'Brot' : !wein ? 'Wein' : !lage ? 'guter Lage (Bodenwert ' + LAGE.domus + ')' : '';
    if (fehlt && b.bew === 0) b.status.push({ art: 'markt', text: 'Equites ziehen erst ein mit ' + fehlt, leicht: true });
    else if (!fehlt && b.bew < wohnraum(b) && S.stimmung >= 50) b.bew++;
    equites += b.bew * lux;
  }
  // Tuch für Casa und Insula (Späte Republik)
  const tuchBedarf = S.geb.filter(b => b.t === 'huette' && b.stufe >= 2).reduce((s, b) => s + b.bew * 0.02, 0);
  S.versorgt.tuch = tuchBedarf > 0 && S.gut.tuch >= tuchBedarf;
  if (S.versorgt.tuch) S.gut.tuch -= tuchBedarf;

  // Stimmung und Steuern
  let ziel = 50 + (S.versorgt.brot ? 20 : essen ? 5 : -35);
  if (haeuser) ziel += 15 * wasserN / haeuser + 10 * marktN / haeuser;
  if (skl > SKLAVEN.furcht * Math.max(1, bew)) ziel -= 8;
  if (S.versorgt.tuch) ziel += 6;
  if (haeuser >= 5 && mauerSchutz(S) >= 0.8) ziel += 3;   // Sicherheit hinter der Mauer
  const tempel = S.geb.filter(b => b.t === 'tempel' && b.w > 0);
  if (haeuser && tempel.length) ziel += 12 * S.geb.filter(h => h.t === 'huette' && tempel.some(o => abstand(o, h) <= GEB.tempel.reichweite)).length / haeuser;
  if (tempel.length && S.monat % 12 === 8) S.gunst = Math.min(100, gunst(S) + 2);
  if (S.geb.some(b => b.t === 'theater' && b.w > 0)) ziel += 8;
  if (haeuser && S.geb.some(b => b.t === 'thermen' && b.geheizt)) ziel += 8 * S.geb.filter(h => h.t === 'huette' && thermeNah(S, h)).length / haeuser;
  if (S.geb.some(b => b.t === 'basilika' && !(b.bau > 0) && b.w > 0)) { ziel += 5; familieS(S).ansehen += 0.5; }
  if (haeuser && rang(S) >= INSULA.rang) {   // S3.3: Ordnung – Häuser ohne Wache in der Nähe
    const ohne = S.geb.filter(h => h.t === 'huette' && !wacheNah(S, h)).length;
    ziel -= FEUER.unruhe * ohne / haeuser;
  }   // S3.2: Furcht vor einem Sklavenaufstand
  const schreine = S.geb.filter(b => b.t === 'schrein' && !(b.bau > 0));   // S3.1: Schreine in der Nähe
  if (haeuser && schreine.length) ziel += 10 * S.geb.filter(h => h.t === 'huette' && schreine.some(o => abstand(o, h) <= GEB.schrein.reichweite)).length / haeuser;
  S.stimmung += (Math.max(0, Math.min(100, ziel)) - S.stimmung) * 0.3;
  S.gut.denare += (einwohner(S) + equites * 3) * STEUER * (hat(S, 'steuerlisten') ? 1.2 : 1) * 1.1 * (S.stimmung / 70) * (S.praefekt > 0 ? PRAEFEKT.steuer : 1);   // ×1,1: Quästor; Präfekt kassiert mit
  if (S.via) S.gut.denare += 6;   // Zoll und Herbergen an der Via Postumia
  if (S.ruf === 'handel') S.gut.denare += 5 * Object.keys(PARTNER).filter(id => handelOffen(S, id)).length;
  vertraegeMonat(S, meld);
  // Lage (Phase D): Häuser in bester Lage zahlen mehr
  const teuer = S.geb.filter(h => h.t === 'huette' && h.bew > 0 && bodenwert(S, h) >= LAGE.hoch).reduce((n, h) => n + h.bew, 0);
  S.gut.denare += teuer * STEUER * LAGE.steuer * (S.stimmung / 70);   // Equites zahlen vierfach
  if (hat(S, 'zoelle')) S.gut.denare += 8 * Object.keys(PARTNER).filter(id => handelOffen(S, id)).length;

  // Senatsauftrag (Lohn nach Gunst Roms, S2.5)
  const a = AUFTRAEGE[S.auftrag];
  if (a && a.ok(S)) {
    const lohn = Object.entries(a.lohn).map(([g, n]) => [g, Math.round(n * lohnFaktor(S))]);
    for (const [g, n] of lohn) S.gut[g] += n;
    meld.push('Auftrag des Senats erfüllt: ' + lohn.map(([g, n]) => `+${n} ${WAREN[g].n}`).join(', '));
    familieS(S).ansehen += FAMILIE.auftragAnsehen;
    S.auftrag++;
  }

  // Stadtrang steigt mit den Einwohnern (fällt nicht zurück)
  const r = rang(S);
  if (r > (S.rang || 0)) { S.rang = r; meld.push(`${REG.stadt} ist jetzt ${RAENGE[r].art} ${RAENGE[r].n}!`); }

  feuerMonat(S, meld);
  seucheMonat(S, meld);

  familieMonat(S, meld);
  geschichteMonat(S, meld);
  praefektMonat(S, meld);
  ereignisMonat(S);
  inschriftenMonat(S, meld);

  // Handel und Abgaben (S2.5), Forschung und Erntefest (S3.1)
  handelMonat(S);
  forschungMonat(S, meld);
  if (S.monat % 12 === 8 && hat(S, 'feste')) {
    if (S.gut.brot >= 20) { S.gut.brot -= 20; S.stimmung = Math.min(100, S.stimmung + 10); meld.push('Erntefest! Die Stadt feiert die Ernte (−20 Brot, Stimmung +10).'); }
    else meld.push('Für ein Erntefest fehlt das Brot.');
  }
  if (S.monat % 12 === 8 && S.monat >= 12) meld.push(abgabeZahlen(S));

  const altJs = js;
  S.monat++;
  if (S.monat % 12 === 0) (S.chronik = S.chronik || []).push({ j: jahr(S) - 1, e: einwohner(S), d: Math.round(S.gut.denare), s: Math.round(S.stimmung), a: Math.round((S.familie || {}).ansehen || 0) });
  if (jahreszeit(S) !== altJs) meld.push(JAHRESZEITEN[jahreszeit(S)].n + ' beginnt.');
  if (S.monat % 12 === 6 && S.monat >= 12) meld.push(`Rom erwartet am Ende des Herbstes ${abgabeBetrag(S)} Denare Abgaben.`);
  if (bedarf > 0 && !essen) meld.push('Die Vorräte reichen nicht – die Menschen hungern.');
  return meld;
}

// Ursache für ein stockendes Gebäude in der Kette suchen (für das Gebäudefenster)
export function ursache(S, b) {
  const d = GEB[b.t];
  const roh = b.status.find(s => s.art === 'rohstoff' && !s.leicht);
  if (!roh || !d.braucht) return '';
  const lieferant = Object.entries(GEB).find(([, x]) => x.erzeugt && x.erzeugt[roh.gut]);
  if (!lieferant) return '';
  const [t, x] = lieferant;
  const vorhandene = S.geb.filter(o => o.t === t);
  if (!vorhandene.length) return `Es gibt noch keine ${x.n}. Sie liefert ${WAREN[roh.gut].n}.`;
  const schwach = vorhandene.find(o => o.status.some(s => !s.leicht || s.art === 'arbeiter'));
  if (schwach) return `${x.n}: ${schwach.status[0].text}.`;
  return `Die ${x.n} liefert zu wenig. Baue eine zweite.`;
}

// ---------- Ansichten (S1.4): Farben für Felder und Gebäude ----------
// Rückgabe: { felder: [[x, z, farbe]], geb: [[id, farbe]], legende: [[farbe, text]] }
const GRUEN = 0x6fc060, GELB = 0xe9c84c, ORANGE = 0xe8903a, ROT = 0xe0603c, BLAU = 0x4f8fd0;
const stufe = a => a >= 0.99 ? GRUEN : a >= 0.5 ? GELB : a > 0 ? ORANGE : ROT;
export function ansicht(S, welt, art) {
  const d = ansichtRoh(S, welt, art);
  if (!d) return null;
  // Grundfläche der Gebäude in derselben Farbe (Gebäude leuchten nur schwach, Mischfarben wären missverständlich)
  const nach = new Map(S.geb.map(b => [b.id, b]));
  for (const [id, c] of d.geb) {
    const b = nach.get(id), [w, t] = groesse(b.t);
    for (let z = b.z; z < b.z + t; z++) for (let x = b.x; x < b.x + w; x++) d.felder.push([x, z, c]);
  }
  return d;
}
function ansichtRoh(S, welt, art) {
  const felder = [], geb = [];
  const haeuser = S.geb.filter(b => b.t === 'huette');
  if (art === 'wasser') {
    const brunnen = S.geb.filter(b => b.t === 'brunnen'), r = reichweite(S, 'brunnen');
    for (let z = 0; z < TIEFE; z++) for (let x = 0; x < RASTER; x++) {
      if (welt.typ[z * RASTER + x] !== GRAS) continue;
      if (brunnen.some(o => { const [cx, cz] = mitte(o); return Math.hypot(x + 0.5 - cx, z + 0.5 - cz) <= r; })) felder.push([x, z, BLAU]);
    }
    for (const h of haeuser) geb.push([h.id, inReichweite(S, h, 'brunnen') ? GRUEN : ROT]);
    return { felder, geb, legende: [[BLAU, 'Brunnen erreicht'], [GRUEN, 'Haus hat Wasser'], [ROT, 'Haus ohne Wasser']] };
  }
  if (art === 'feuer') {   // S3.3: Brandgefahr je Gebäude, Bereich der Feuerwachen
    for (const o of S.geb.filter(b => b.t === 'wache' && b.w > 0)) {
      const [cx, cz] = mitte(o), r = GEB.wache.reichweite;
      for (let z = 0; z < TIEFE; z++) for (let x = 0; x < RASTER; x++)
        if (welt.typ[z * RASTER + x] === GRAS && Math.hypot(x + 0.5 - cx, z + 0.5 - cz) <= r) felder.push([x, z, BLAU]);
    }
    for (const b of S.geb) {
      if (b.brand > 0) { geb.push([b.id, ROT]); continue; }
      const p = brandGefahr(S, b); if (!p) continue;
      geb.push([b.id, p < 0.002 ? GRUEN : p < 0.006 ? GELB : ORANGE]);
    }
    return { felder, geb, legende: [[BLAU, 'Feuerwache erreicht'], [GRUEN, 'geringe Brandgefahr'], [GELB, 'mittel'], [ORANGE, 'hoch'], [ROT, 'brennt']] };
  }
  if (art === 'gesundheit') {   // Seuchengefahr je Haus, Bereich der Latrinen
    for (const o of S.geb.filter(b => b.t === 'latrine')) {
      const [cx, cz] = mitte(o), r = GEB.latrine.reichweite;
      for (let z = 0; z < TIEFE; z++) for (let x = 0; x < RASTER; x++)
        if (welt.typ[z * RASTER + x] === GRAS && Math.hypot(x + 0.5 - cx, z + 0.5 - cz) <= r) felder.push([x, z, BLAU]);
    }
    for (const h of haeuser) {
      if (h.krank > 0) { geb.push([h.id, ROT]); continue; }
      const p = seuchenGefahr(S, h); geb.push([h.id, p < 0.001 ? GRUEN : p < 0.003 ? GELB : ORANGE]);
    }
    return { felder, geb, legende: [[BLAU, 'Latrine erreicht'], [GRUEN, 'gesund'], [GELB, 'mittlere Seuchengefahr'], [ORANGE, 'hohe Seuchengefahr'], [ROT, 'krank']] };
  }
  if (art === 'bodenwert') {   // Bodenwert je Haus und Werkstatt
    for (const b of S.geb) {
      if (GEB[b.t].flach || b.t === 'mauer' || b.t === 'strasse') continue;
      const v = bodenwert(S, b); geb.push([b.id, v >= LAGE.hoch ? GRUEN : v >= LAGE.gut ? GELB : v >= 0 ? ORANGE : ROT]);
    }
    return { felder, geb, legende: [[GRUEN, `beste Lage (ab ${LAGE.hoch}): mehr Steuern`], [GELB, `gute Lage (ab ${LAGE.gut}): Domus möglich`], [ORANGE, 'gewöhnlich'], [ROT, 'laut und schmutzig']] };
  }
  if (art === 'arbeit') {
    const geht = new Map();
    for (const b of S.geb) for (const [id, n] of b.von || []) geht.set(id, (geht.get(id) || 0) + n);
    for (const b of S.geb) {
      if (GEB[b.t].arbeiter) geb.push([b.id, stufe((b.w || 0) / GEB[b.t].arbeiter)]);
      else if (b.t === 'huette' && b.bew > 0) geb.push([b.id, (geht.get(b.id) || 0) >= Math.round(b.bew * ARBEIT_ANTEIL) ? GRUEN : BLAU]);
    }
    return { felder, geb, legende: [[GRUEN, 'voll besetzt'], [GELB, 'halb'], [ROT, 'ohne Arbeiter'], [BLAU, 'Haus mit freien Arbeitern']] };
  }
  if (art === 'stimmung') {
    const maske = strassenMaske(S), rw = GEB.markt.reichweite;
    for (const m of S.geb.filter(b => b.t === 'markt' && b.w > 0)) {
      const dist = strassenWeg(maske, m, rw);
      for (let i = 0; i < dist.length; i++) if (dist[i] >= 0 && dist[i] <= rw) felder.push([i % RASTER, Math.floor(i / RASTER), GELB]);
    }
    for (const h of haeuser) {
      const n = (inReichweite(S, h, 'brunnen') ? 1 : 0) + (inReichweite(S, h, 'markt', maske) ? 1 : 0) + (S.versorgt.brot ? 1 : 0);
      geb.push([h.id, [ROT, ORANGE, ORANGE, GRUEN][n]]);
    }
    return { felder, geb, legende: [[GELB, 'Straßen in Marktreichweite'], [GRUEN, 'Wasser, Markt und Brot'], [ORANGE, 'teilweise versorgt'], [ROT, 'nichts davon']] };
  }
  return null;
}

// ---------- Umland (S2.1): Hex-Felder in axialen Koordinaten (q, r), Spitze oben ----------
export const hexAbstand = (a, b) => (Math.abs(a.q - b.q) + Math.abs(a.r - b.r) + Math.abs(a.q + a.r - b.q - b.r)) / 2;
export function erzeugeRegion() {
  const felder = [], R = 3;   // innerer Teil wie vor dem 1.11. (gleiche Zufallsfolge, alte Spielstände passen)
  let s = 11; const zufall = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let q = -R; q <= R; q++) for (let r = Math.max(-R, -q - R); r <= Math.min(R, -q + R); r++) {
    const z = r + q / 2;   // Nord-Süd-Lage (Süden = positiv)
    let typ;
    if (q === 0 && r === 0) typ = 'stadt';
    else if (r === Math.max(-R, -q - R, Math.min(R, -q + R, Math.round(2.4 - q / 2)))) typ = 'fluss';   // Padus: je Spalte ein Feld im Süden
    else if (z < -2.2) typ = zufall() < 0.6 ? 'hang' : 'wald';                       // Hügel im Norden
    else if (q <= -2 && z < 1) typ = zufall() < 0.75 ? 'wald' : 'acker';             // Wald im Westen
    else if (z > 0.9) typ = zufall() < 0.5 ? 'lehm' : 'weide';                       // Flussaue
    else typ = zufall() < 0.78 ? 'acker' : zufall() < 0.5 ? 'weide' : 'wald';
    felder.push({ q, r, typ });
  }
  // Ring 4 (1.11.): Padus weiter im Süden, Steinbruch und Erz im Norden, Acker/Weide im Osten, Wald im Westen
  const R4 = REGION_RING; let s4 = 23; const z4 = () => (s4 = (s4 * 16807) % 2147483647) / 2147483647;
  for (let q = -R4; q <= R4; q++) for (let r = Math.max(-R4, -q - R4); r <= Math.min(R4, -q + R4); r++) {
    if (Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r)) !== R4) continue;
    const z = r + q / 2, fluss = Math.max(-R4, -q - R4, Math.min(R4, -q + R4, Math.round(2.4 - q / 2)));
    let typ;
    if (r === fluss) typ = 'fluss';
    else if (r > fluss) typ = z4() < 0.5 ? 'weide' : 'lehm';                       // Südufer
    else if (z < -2.9) typ = (q + r * 3) % 3 === 0 ? 'erz' : z4() < 0.55 ? 'stein' : 'hang';   // Alpenvorland
    else if (q <= -3) typ = z4() < 0.7 ? 'wald' : 'acker';
    else typ = z4() < 0.65 ? 'acker' : 'weide';
    felder.push({ q, r, typ });
  }
  // Regionen (Phase E): Gelände umfärben (fest je Feld)
  for (const f of felder) {
    const h = ((f.q + 9) * 7 + (f.r + 9) * 13) % 10;
    if (REG.hang && f.typ === 'acker' && h < 4) f.typ = 'hang';
    if (REG.hang && f.typ === 'hang' && h >= 7) f.typ = 'stein';
    if (REG.duerre && f.typ === 'wald' && h < 7) f.typ = 'weide';
    if (REG.duerre && f.typ === 'acker' && h < 2) f.typ = 'weide';
    if (REG.meer && f.typ === 'lehm' && h < 5) f.typ = 'acker';
  }
  return felder;
}

// ---------- Umland: Vermessen und Betriebe (S2.2). S.land[„q,r“] = { verm: Monate, betrieb } ----------
let regionFelder = null;
export const regionKarte = () => regionFelder || (regionFelder = erzeugeRegion());
export const landKey = f => f.q + ',' + f.r;
const HEX_NACHBARN = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];
export function landStand(S, f) {
  const l = (S.land || {})[landKey(f)];
  if (f.typ === 'stadt') return 'stadt';
  if (!l) return 'frei';
  return l.verm < vermMonate(S) ? 'vermessung' : l.betrieb ? 'betrieb' : 'vermessen';
}
export function kannVermessen(S, f) {
  if (landStand(S, f) !== 'frei') return false;
  return HEX_NACHBARN.some(([dq, dr]) => {
    const n = regionKarte().find(h => h.q === f.q + dq && h.r === f.r + dr);
    return n && (n.typ === 'stadt' || ['vermessen', 'betrieb'].includes(landStand(S, n)));
  });
}
export function vermessen(S, f) {
  if (!kannVermessen(S, f)) return { ok: false, grund: 'Nur Land neben der Stadt oder neben vermessenem Land' };
  const vk = vermKosten(S);
  if (!kannBezahlen(S, vk)) return { ok: false, grund: 'Es fehlen ' + fehlendeKosten(S, vk).join(', ') };
  for (const [g, n] of Object.entries(vk)) S.gut[g] -= n;
  (S.land = S.land || {})[landKey(f)] = { verm: 0, betrieb: '' };
  return { ok: true };
}
export const betriebeFuer = f => Object.keys(LAND_BETRIEBE).filter(t => LAND_BETRIEBE[t].auf === f.typ);
export const betriebFuer = f => betriebeFuer(f)[0] || '';
export function landBauen(S, f, t = betriebFuer(f)) {
  if (!betriebeFuer(f).includes(t)) t = '';
  if (!t) return { ok: false, grund: 'Hier ist noch kein Betrieb möglich' };
  if (landStand(S, f) !== 'vermessen') return { ok: false, grund: 'Erst vermessen' };
  if (LAND_BETRIEBE[t].forschung && !hat(S, LAND_BETRIEBE[t].forschung)) return { ok: false, grund: 'Erst erforschen: ' + FORSCHUNG[LAND_BETRIEBE[t].forschung].n };
  const k = LAND_BETRIEBE[t].kosten;
  if (!kannBezahlen(S, k)) return { ok: false, grund: 'Es fehlen ' + fehlendeKosten(S, k).join(', ') };
  for (const [g, n] of Object.entries(k)) S.gut[g] -= n;
  S.land[landKey(f)].betrieb = t;
  return { ok: true };
}
// Wege (S2.3): Netz ab der Stadt über Felder mit Weg; nur verbundene Betriebe liefern
const istAnleger = (S, f) => ((S.land || {})[landKey(f)] || {}).betrieb === 'anleger';
export const hatWeg = (S, f) => f.typ === 'stadt' || f.typ === 'nachbar' || f.typ === 'gallier' || istAnleger(S, f) || !!((S.land || {})[landKey(f)] || {}).weg;
export function wegNetz(S) {
  const karte = regionKarte(), da = new Set(['0,0']), q = [{ q: 0, r: 0 }];
  for (let i = 0; i < q.length; i++) {
    const nb = HEX_NACHBARN.map(([dq, dr]) => karte.find(h => h.q === q[i].q + dq && h.r === q[i].r + dr));
    if (istAnleger(S, q[i])) nb.push(...karte.filter(h => istAnleger(S, h)));   // Flussboote: Anleger untereinander
    for (const n of nb) if (n && !da.has(landKey(n)) && hatWeg(S, n)) { da.add(landKey(n)); q.push(n); }
  }
  return da;
}
export const verbunden = (S, f) => wegNetz(S).has(landKey(f));
// Weg vom Feld zur Stadt über Felder mit Weg (Liste der Felder, Stadt zuletzt), null ohne Verbindung
export function wegPfad(S, f) {
  const karte = regionKarte(), vor = new Map([[landKey(f), null]]), q = [f];
  for (let i = 0; i < q.length; i++) {
    if (q[i].typ === 'stadt') { const p = []; for (let k = landKey(q[i]); k; k = vor.get(k)) p.push(karte.find(h => landKey(h) === k)); return p.reverse(); }
    for (const [dq, dr] of HEX_NACHBARN) {
      const n = karte.find(h => h.q === q[i].q + dq && h.r === q[i].r + dr);
      if (n && !vor.has(landKey(n)) && hatWeg(S, n)) { vor.set(landKey(n), landKey(q[i])); q.push(n); }
    }
  }
  return null;
}
export const nachbarn = f => HEX_NACHBARN.map(([dq, dr]) => regionKarte().find(h => h.q === f.q + dq && h.r === f.r + dr)
  || sonderFelder().find(h => h.q === f.q + dq && h.r === f.r + dr) || null);   // Nachbarstädte/Dorf nur für die Zeichnung
export function wegAnlegen(S, f) {
  const st = landStand(S, f);
  if (st !== 'vermessen' && st !== 'betrieb') return { ok: false, grund: 'Erst vermessen' };
  if (hatWeg(S, f)) return { ok: false, grund: 'Hier gibt es schon einen Weg' };
  if (!kannBezahlen(S, WEG.kosten)) return { ok: false, grund: 'Es fehlen ' + fehlendeKosten(S, WEG.kosten).join(', ') };
  for (const [g, n] of Object.entries(WEG.kosten)) S.gut[g] -= n;
  S.land[landKey(f)].weg = true;
  return { ok: true };
}
export const landFaktor = (f, S) => S && hat(S, 'schotter') ? 1 : Math.max(0.5, 1 - 0.05 * (hexAbstand(f, { q: 0, r: 0 }) - 1));
function landMonat(S, js, grenze, meld) {
  const netz = wegNetz(S);
  for (const f of regionKarte()) {
    const l = (S.land || {})[landKey(f)]; if (!l) continue;
    if (l.verm < vermMonate(S)) { if (++l.verm === vermMonate(S)) meld.push('Die Landvermesser haben ein Feld im Umland abgesteckt.'); continue; }
    if (l.stoer > 0) { l.stoer--; continue; }   // geplündert oder überschwemmt (S2.6)
    const d = LAND_BETRIEBE[l.betrieb]; if (!d || !netz.has(landKey(f))) continue;
    // Vicus (1.11.): nach 36 verbundenen Monaten wächst um die Villa rustica ein Dorf – Marktabgaben für die Stadt
    if (l.villa) { l.villaMonate = (l.villaMonate || 0) + 1; if (!l.vicus && l.villaMonate >= 36) { l.vicus = true; meld.push('Rund um eine Villa rustica ist ein Dorf (vicus) entstanden.'); } }
    if (l.vicus) { S.gut.denare += 3; if (S.familie) S.familie.ansehen += 0.05; }
    const faktor = landFaktor(f, S) * (d.ernte ? JAHRESZEITEN[js].ernte : 1) * (l.villa ? 1.75 : 1);
    for (const [g, n] of Object.entries(d.erzeugt)) S.gut[g] = Math.min(grenze, (S.gut[g] || 0) + n * faktor * bonus(S, l.betrieb, g));
  }
  gefahren(S, meld);
}

// ---------- Gefahren (S2.6): Räuber, Hochwasser, Gallier ----------
let zufallFn = null;
export const setzeZufall = f => { zufallFn = f; };   // für Tests: f(salz) → 0..1
function wurf(S, salz) {
  if (zufallFn) return zufallFn(salz);
  // Ganzzahl-Mischfunktion (1.11.: ersetzt sin-Hash, der für Monate im Abstand 12 fast gleiche Werte lieferte)
  let h = (Math.imul(S.monat + 1, 0x9E3779B1) ^ Math.imul(salz + 7, 0x85EBCA6B)) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x7FEB352D) >>> 0; h = Math.imul(h ^ (h >>> 15), 0x846CA68B) >>> 0; h = (h ^ (h >>> 16)) >>> 0;
  return h / 4294967296;
}
const STADT = { q: 0, r: 0 };
export const amFluss = f => f.typ !== 'fluss' && f.typ !== 'stadt' && nachbarn(f).some(n => n && n.typ === 'fluss');
const fertig = (S, l) => l && l.verm >= vermMonate(S);
export function raeuberSchutz(S, f) {
  if (hexAbstand(f, STADT) < GEFAHR.raeuber.weit) return true;
  return regionKarte().some(g => { const l = (S.land || {})[landKey(g)]; if (!fertig(S, l)) return false;
    const d = hexAbstand(f, g); return (l.turm && !l.turmUnbezahlt && d <= 1) || (l.betrieb === 'kastell' && !l.unbezahlt && d <= 2); });
}
export const hatKastell = S => regionKarte().some(g => { const l = (S.land || {})[landKey(g)]; return fertig(S, l) && l.betrieb === 'kastell' && !l.unbezahlt; });
export function schutzBauen(S, f, art) {
  const d = SCHUTZ[art], st = landStand(S, f), l = (S.land || {})[landKey(f)];
  if (!d) return { ok: false, grund: 'Unbekannter Bau' };
  if (st !== 'vermessen' && st !== 'betrieb') return { ok: false, grund: 'Erst vermessen' };
  if (art === 'deich' && !amFluss(f)) return { ok: false, grund: 'Ein Deich gehört an den Fluss' };
  if (l[art]) return { ok: false, grund: `Hier steht schon ein ${d.n}` };
  if (!kannBezahlen(S, d.kosten)) return { ok: false, grund: 'Es fehlen ' + fehlendeKosten(S, d.kosten).join(', ') };
  for (const [g, n] of Object.entries(d.kosten)) S.gut[g] -= n;
  l[art] = true;
  return { ok: true };
}
function stoeren(l, art, n) { l.stoer = Math.max(l.stoer || 0, n); l.stoerArt = art; }
function gefahren(S, meld) {
  const m = S.monat, land = S.land || {}, salz = f => (f.q + 5) * 13 + (f.r + 5);
  const betriebe = regionKarte().filter(f => { const l = land[landKey(f)]; return fertig(S, l) && l.betrieb && !['anleger', 'kastell'].includes(l.betrieb); });
  const G = GEFAHR;
  if (m >= G.raeuber.ab) {
    const opfer = betriebe.filter(f => !(land[landKey(f)].stoer > 0) && !raeuberSchutz(S, f) && wurf(S, salz(f)) < G.raeuber.chance * (hat(S, 'roemerstrasse') ? 0.5 : 1) * (amt(S) >= 2 ? 0.5 : 1));
    opfer.forEach(f => stoeren(land[landKey(f)], 'raeuber', G.raeuber.monate));
    if (opfer.length) meld.push(`Räuber haben ${opfer.length === 1 ? 'einen Betrieb' : opfer.length + ' Betriebe'} im Umland geplündert. Wachtürme schützen.`);
  }
  if (m >= G.hochwasser.ab && m % 12 === G.hochwasser.monat && wurf(S, 1001) < G.hochwasser.chance) {
    const nass = betriebe.filter(f => amFluss(f) && !land[landKey(f)].deich);
    nass.forEach(f => stoeren(land[landKey(f)], 'hochwasser', G.hochwasser.monate));
    meld.push(`Hochwasser am ${REG.fluss}! ` + (nass.length ? `${nass.length === 1 ? 'Ein Betrieb steht' : nass.length + ' Betriebe stehen'} unter Wasser.` : 'Die Aue ist überflutet, aber kein Betrieb ist betroffen.'));
  }
  if (S.frieden > 0) S.frieden--;
  else if (m >= G.gallier.ab && m % 12 === G.gallier.monat && einwohner(S) >= G.gallier.einwohner && wurf(S, 1002) < G.gallier.chance * (S.familie && eigenschaft(S.familie, 'Veteran') ? 0.5 : 1)) {
    if (hatKastell(S)) { meld.push(`${REG.feind} ziehen heran – die Besatzung des Kastells schlägt sie zurück.`); return; }
    const nord = betriebe.filter(f => f.r + f.q / 2 < 0.5).sort((a, b) => hexAbstand(a, gallierFeld) - hexAbstand(b, gallierFeld)).slice(0, 4);
    nord.forEach(f => stoeren(land[landKey(f)], 'gallier', G.gallier.monate));
    const offen = 1 - mauerSchutz(S);   // Stadtmauer: geschützter Anteil der Häuser bleibt verschont
    for (const g of ['getreide', 'holz']) S.gut[g] = (S.gut[g] || 0) * (1 - G.gallier.raub * offen);
    S.stimmung = Math.max(0, S.stimmung - G.gallier.stimmung * offen);
    meld.push(offen < 0.05 ? `${REG.feind} fallen ins Umland ein${nord.length ? ' und verwüsten ' + nord.length + ' Betriebe' : ''} – doch die Stadtmauer hält, die Stadt bleibt verschont.`
      : `${REG.feind} fallen ein! Sie rauben Getreide und Holz${nord.length ? ' und verwüsten ' + nord.length + ' Betriebe' : ''}. Kastell oder Stadtmauer hielten sie ab.`);
  }
}

// ---------- Nachbarstadt und Handel (S2.5) ----------
export const nachbarFeld = { q: NACHBAR.q, r: NACHBAR.r, typ: 'nachbar', id: 'placentia' };
export const mantuaFeld = { q: MANTUA.q, r: MANTUA.r, typ: 'nachbar', id: 'mantua' };
export const gallierFeld = { q: GALLIER.q, r: GALLIER.r, typ: 'gallier' };
export const sonderFelder = () => [nachbarFeld, mantuaFeld, gallierFeld];
export const GALLIER_GESCHENK = GALLIER.geschenk;
// Handelspartner: Placentia (Fluss oder Weg) und Mantua (nur Weg)
export const PARTNER = { placentia: { ...NACHBAR, n: 'Placentia', anleger: true, waren: HANDEL.waren }, mantua: { ...MANTUA, anleger: false } };
PARTNER_OBJ = PARTNER; regionSetzen(REG_ID);
export function handelOffen(S, id = 'placentia') {
  const p = PARTNER[id], netz = wegNetz(S);
  if (p.anleger && regionKarte().some(f => istAnleger(S, f) && netz.has(landKey(f)))) return true;   // Boote fahren flussaufwärts
  return HEX_NACHBARN.some(([dq, dr]) => netz.has((p.q + dq) + ',' + (p.r + dr)));
}
const handelS = S => (S.handel = S.handel || { vorrat: {} });
const vorratVon = (S, id) => id === 'placentia' ? handelS(S).vorrat : ((handelS(S).v = handelS(S).v || {})[id] = handelS(S).v[id] || {});
export const handelVorrat = (S, g, id = 'placentia') => vorratVon(S, id)[g] ?? PARTNER[id].waren[g].normal;
export function preis(S, g, id = 'placentia') {
  const w = PARTNER[id].waren[g], f = Math.pow(w.normal / Math.max(5, handelVorrat(S, g, id)), 0.7);
  return w.basis * Math.max(0.4, Math.min(3, f));
}
// Summe für eine Ladung (HANDEL.menge): Kauf mit Aufschlag, Verkauf mit Abschlag
export const handelSumme = (S, g, art, id = 'placentia') => Math.max(1, Math.round(preis(S, g, id) * HANDEL.menge * (art === 'kauf' ? 1 + aufschlag(S) : 1 - aufschlag(S))));
const aufschlag = S => (hat(S, 'archiv') ? 0.08 : HANDEL.aufschlag) - (S.via ? 0.03 : 0) - (S.ruf === 'handel' ? 0.05 : 0) - (S.familie && (S.familie.buende || []).includes('Sempronii') ? 0.05 : 0);
export function handeln(S, g, art, id = 'placentia') {
  const p = PARTNER[id];
  if (!p || !p.waren[g]) return { ok: false, grund: `Diese Ware handelt ${p ? p.n : 'niemand'} nicht` };
  if (!handelOffen(S, id)) return { ok: false, grund: 'Noch kein Weg nach ' + p.n };
  const n = HANDEL.menge, summe = handelSumme(S, g, art, id), v = vorratVon(S, id);
  if (art === 'verkauf') {
    if ((S.gut[g] || 0) < n) return { ok: false, grund: `Es fehlen ${n - Math.floor(S.gut[g] || 0)} ${WAREN[g].n}` };
    S.gut[g] -= n; S.gut.denare += summe; v[g] = handelVorrat(S, g, id) + n;
  } else {
    if (S.gut.denare < summe) return { ok: false, grund: `Es fehlen ${Math.ceil(summe - S.gut.denare)} Denare` };
    if (handelVorrat(S, g, id) < n) return { ok: false, grund: `${p.n} hat kaum noch ${WAREN[g].n}` };
    if ((S.gut[g] || 0) + n > lagerGrenze(S)) return { ok: false, grund: `Lager für ${WAREN[g].n} voll` };
    S.gut.denare -= summe; S.gut[g] = (S.gut[g] || 0) + n; v[g] = handelVorrat(S, g, id) - n;
  }
  (S.zaehler = S.zaehler || {}).handel = (S.zaehler.handel || 0) + 1;
  return { ok: true, summe };
}
function handelMonat(S) {
  for (const id of Object.keys(PARTNER)) {
    const v = vorratVon(S, id);
    for (const g of Object.keys(v)) { const z = PARTNER[id].waren[g].normal; v[g] += (z - v[g]) * HANDEL.rueck; if (Math.abs(z - v[g]) < 1) delete v[g]; }
  }
}
// Gallier (1.11.): Geschenke an das Dorf der Insubrer bringen 2 Jahre Frieden
export function geschenk(S) {
  if (S.frieden > 0) return { ok: false, grund: `Es herrscht noch ${S.frieden} Monate Frieden` };
  if (!kannBezahlen(S, GALLIER.geschenk)) return { ok: false, grund: 'Es fehlen ' + fehlendeKosten(S, GALLIER.geschenk).join(', ') };
  for (const [g, n] of Object.entries(GALLIER.geschenk)) S.gut[g] -= n;
  S.frieden = GALLIER.monate;
  return { ok: true };
}
// Abgaben an Rom: am Ende des Herbstes; bezahlt → Gunst steigt, sonst sinkt sie stark
export const gunst = S => S.gunst ?? ABGABE.gunst;
export const lohnFaktor = S => 0.5 + gunst(S) / 100;
export const abgabeBetrag = S => Math.round((ABGABE.grund + einwohner(S) * ABGABE.je) * (S.ruf === 'kornkammer' ? 0.8 : 1));
function abgabeZahlen(S) {
  const n = abgabeBetrag(S);
  if (S.gut.denare >= n) {
    S.gut.denare -= n; S.gunst = Math.min(100, gunst(S) + ABGABE.plus);
    return `Abgaben an Rom bezahlt: ${n} Denare. Die Gunst Roms steigt.`;
  }
  S.gunst = Math.max(0, gunst(S) - ABGABE.minus);
  return `Die Kasse reicht nicht für die Abgaben an Rom (${n} Denare). Der Senat ist verärgert.`;
}

// ---------- Forschung (S3.1) ----------
export const forschungS = S => (S.forschung = S.forschung || { ziel: '', wissen: 0, fertig: [] });
export const hat = (S, id) => !!(S.forschung && S.forschung.fertig.includes(id));
export const gesperrt = (S, t) => (!!GEB[t].forschung && !hat(S, GEB[t].forschung)) || (GEB[t].epoche || 1) > epoche(S);
export const sperrGrund = (S, t) => (GEB[t].epoche || 1) > epoche(S) ? 'Erst in der Späten Republik' : 'Erst erforschen: ' + FORSCHUNG[GEB[t].forschung].n;
// Epochen (1.11.): Übergang in die Späte Republik
export const epoche = S => S.epoche || 1;
export function epocheFehlt(S) {
  if (epoche(S) >= 2) return '';
  const f = [], n = forschungS(S).fertig.filter(id => FORSCHUNG[id].ep === 1).length;
  if (rang(S) < EPOCHE2.rang) f.push(`Stadtrang ${RAENGE[EPOCHE2.rang].n} (${RAENGE[EPOCHE2.rang].ab} Einwohner)`);
  if (n < EPOCHE2.erfindungen) f.push(`${EPOCHE2.erfindungen} Erfindungen (${n} erforscht)`);
  if (gunst(S) < EPOCHE2.gunst) f.push(`Gunst Roms ${EPOCHE2.gunst}`);
  return f.join(', ');
}
export function epocheWechseln(S) {
  const f = epocheFehlt(S); if (epoche(S) >= 2) return { ok: false, grund: 'Schon in der Späten Republik' };
  if (f) return { ok: false, grund: 'Es fehlt: ' + f };
  S.epoche = 2; return { ok: true };
}
export const vermMonate = S => hat(S, 'landvermessung') ? 1 : VERMESSEN.monate;
export const vermKosten = S => hat(S, 'landvermessung') ? { denare: 10 } : VERMESSEN.kosten;
export function baukosten(S, t) {
  const k = { ...GEB[t].kosten };
  if (k.holz && hat(S, 'bauhuette')) k.holz = Math.ceil(k.holz * 0.8);
  if (amt(S) >= 1) for (const g of Object.keys(k)) k[g] = Math.ceil(k[g] * 0.9);   // Ädil
  return k;
}
export function bonus(S, t, g) {
  let m = 1;
  if (g === 'getreide' && hat(S, 'fruchtwechsel')) m *= 1.25;
  if (REG.duerre && (g === 'getreide' || g === 'trauben' || g === 'oliven')) m *= 0.85;   // Apulien: Dürre
  if (t === 'ziegelei' && hat(S, 'ziegelbrand')) m *= 1.5;
  if (S.ruf === 'kornkammer' && (g === 'getreide' || g === 'brot')) m *= 1.15;
  if (S.ruf === 'handwerk' && GEB[t] && GEB[t].kat === 'Handwerk') m *= 1.15;
  return m;
}
export function wissenProMonat(S) {
  return WISSEN_GRUND + S.geb.filter(b => b.t === 'ludus').reduce((s, b) => s + GEB.ludus.wissen * (b.w || 0) / GEB.ludus.arbeiter, 0);
}
export function forschungsStand(S, id) {
  const d = FORSCHUNG[id], F = forschungS(S);
  if (F.fertig.includes(id)) return 'fertig';
  if (d.ep > epoche(S)) return 'epoche';
  if (d.bald) return 'bald';
  if (d.braucht && !F.fertig.includes(d.braucht)) return 'gesperrt';
  return F.ziel === id ? 'ziel' : 'offen';
}
export function forschungWaehlen(S, id) {
  const st = FORSCHUNG[id] ? forschungsStand(S, id) : '';
  if (st === 'fertig') return { ok: false, grund: 'Schon erforscht' };
  if (st === 'epoche') return { ok: false, grund: 'Erst in der ' + (FORSCHUNG[id].ep === 2 ? 'Späten Republik' : 'Kaiserzeit') };
  if (st === 'gesperrt') return { ok: false, grund: 'Erst erforschen: ' + FORSCHUNG[FORSCHUNG[id].braucht].n };
  if (st === 'bald') return { ok: false, grund: 'Kommt in einer späteren Ausbaustufe' };
  if (st !== 'offen' && st !== 'ziel') return { ok: false, grund: 'Unbekannt' };
  forschungS(S).ziel = id;
  return { ok: true };
}
function forschungMonat(S, meld) {
  const F = forschungS(S);
  F.wissen += wissenProMonat(S);
  const d = FORSCHUNG[F.ziel];
  if (d && F.wissen >= d.kosten) {
    F.wissen -= d.kosten; F.fertig.push(F.ziel); F.ziel = '';
    meld.push(`Erforscht: ${d.n}. ${d.text}`);
  }
}
// Villa rustica (S3.1): Gehöft ausbauen
export const VILLA_KOSTEN = { holz: 40, ziegel: 30 };
export function villaBauen(S, f) {
  const l = (S.land || {})[landKey(f)];
  if (!l || l.betrieb !== 'gehoeft') return { ok: false, grund: 'Nur ein Gehöft lässt sich ausbauen' };
  if (!hat(S, 'villa')) return { ok: false, grund: 'Erst erforschen: Villa rustica' };
  if (l.villa) return { ok: false, grund: 'Schon eine Villa rustica' };
  if (!kannBezahlen(S, VILLA_KOSTEN)) return { ok: false, grund: 'Es fehlen ' + fehlendeKosten(S, VILLA_KOSTEN).join(', ') };
  for (const [g, n] of Object.entries(VILLA_KOSTEN)) S.gut[g] -= n;
  l.villa = true;
  return { ok: true };
}

// ---------- Sklaven (S3.2): kaufen beim Händler, freilassen (manumissio) ----------
export function sklavenKaufen(S, q) {
  if (!q || q.t !== 'quartier') return { ok: false, grund: 'Sklaven wohnen im Sklavenquartier' };
  const n = Math.min(SKLAVEN.los, GEB.quartier.sklavenPlatz - (q.skl || 0));
  if (n <= 0) return { ok: false, grund: 'Das Quartier ist voll' };
  const preis = n * SKLAVEN.preis;
  if (S.gut.denare < preis) return { ok: false, grund: `Es fehlen ${Math.ceil(preis - S.gut.denare)} Denare` };
  S.gut.denare -= preis; q.skl = (q.skl || 0) + n;
  return { ok: true, n, preis };
}
export function freilassen(S, q) {
  if (!q || !(q.skl > 0)) return { ok: false, grund: 'Hier wohnen keine Sklaven' };
  const haeuser = S.geb.filter(b => b.t === 'huette' && b.bew < wohnraum(b));
  const platz = haeuser.reduce((s, b) => s + wohnraum(b) - b.bew, 0), n = Math.min(SKLAVEN.los, q.skl, platz);
  if (n <= 0) return { ok: false, grund: 'Kein freier Platz in den Häusern für die Freigelassenen' };
  let rest = n;
  for (const h of haeuser) { const k = Math.min(rest, wohnraum(h) - h.bew); h.bew += k; rest -= k; if (!rest) break; }
  q.skl -= n;
  const steuer = Math.round(n * SKLAVEN.preis * SKLAVEN.vicesima * 10) / 10;
  S.gut.denare += steuer; S.stimmung = Math.min(100, S.stimmung + 2);
  return { ok: true, n, steuer };
}

// ---------- Feuer und Ordnung (S3.3) ----------
const FLACH = t => !!GEB[t].flach;
export const wacheNah = (S, b) => S.geb.some(o => o.t === 'wache' && (o.w || 0) > 0 && !(o.brand > 0) && abstand(o, b) <= GEB.wache.reichweite);
export function brandGefahr(S, b) {
  if (FLACH(b.t) || b.t === 'brunnen' || b.t === 'schrein') return 0;
  const art = b.t === 'huette' ? (b.stufe === 3 ? 'insula' : b.stufe === 2 ? 'casa' : 'huette') : b.t;
  let p = FEUER.basis[art] ?? FEUER.sonst;
  p *= 1 + FEUER.dichte * S.geb.filter(o => o !== b && !FLACH(o.t) && abstand(o, b) <= FEUER.umkreis).length;
  if (wacheNah(S, b)) p *= FEUER.wache;
  if (inReichweite(S, b, 'brunnen')) p *= hat(S, 'aquaedukt') ? 0.5 : FEUER.brunnen;
  if (jahreszeit(S) === 1) p *= FEUER.sommer;
  return p;
}
function feuerMonat(S, meld) {
  // laufende Brände: Wache löscht, sonst greift das Feuer über und zerstört das Gebäude
  const brennt = S.geb.filter(b => b.brand > 0);
  for (const b of brennt) {
    const name = b.t === 'huette' ? (b.stufe === 3 ? INSULA.n : b.stufe === 2 ? CASA.n : GEB.huette.n) : GEB[b.t].n;
    if (wacheNah(S, b)) { b.brand = 0; meld.push(`Brand gelöscht: ${name}. Die Wache war rechtzeitig da.`); continue; }
    if (wurf(S, 99000 + b.id) < FEUER.eimer) { b.brand = 0; if (b.bew) b.bew = Math.floor(b.bew * 0.75); meld.push(`Nachbarn haben den Brand mit Eimerketten gelöscht: ${name}.`); continue; }
    for (const o of S.geb) {
      if (o.brand > 0 || brandGefahr(S, o) === 0 || abstand(o, b) > FEUER.nachbar) continue;
      if (wurf(S, 7000 + o.id * 3 + b.id) < (wacheNah(S, o) ? FEUER.ueberWache : FEUER.ueber)) { o.brand = 1; o.neu = true; }
    }
    if (++b.brand > FEUER.monate) {
      const i = S.geb.indexOf(b); if (i >= 0) S.geb.splice(i, 1);
      meld.push(`${name} ist abgebrannt.${b.bew ? ' ' + b.bew + ' Bewohner haben ihr Heim verloren.' : ''}`);
    }
  }
  // neue Brände (ab dem 2. Jahr)
  const neu = [];
  for (const b of S.geb) if (b.neu) { delete b.neu; neu.push(b); }
  if (S.monat >= FEUER.ab) for (const b of S.geb) {
    if (b.brand > 0 || neu.includes(b)) continue;
    if (wurf(S, 5000 + b.id) < brandGefahr(S, b)) { b.brand = 1; neu.push(b); }
  }
  const nameVon = b => b.t === 'huette' ? (b.stufe === 3 ? INSULA.n : b.stufe === 2 ? CASA.n : GEB.huette.n) : GEB[b.t].n;
  if (neu.length) meld.push(neu.length === 1 ? `Feuer! ${nameVon(neu[0])} brennt.` : `Feuer! ${neu.length} Gebäude brennen.`);
}

// ---------- Stadterweiterung (1.11.): der Senat gibt Land im Osten frei ----------
export const stadtGrenze = S => GRENZE[Math.min(S.grenze || 0, GRENZE.length - 1)];
export function erweiterungFehlt(S) {
  const e = ERWEITERUNG[S.grenze || 0]; if (!e) return 'Die Stadt hat ihre größte Ausdehnung erreicht';
  const f = [];
  if (rang(S) < e.rang) f.push(`Stadtrang ${RAENGE[e.rang].n} (${RAENGE[e.rang].ab} Einwohner)`);
  if (gunst(S) < e.gunst) f.push(`Gunst Roms ${e.gunst}`);
  if (!kannBezahlen(S, e.kosten)) f.push(fehlendeKosten(S, e.kosten).join(', '));
  return f.join(', ');
}
export function erweitern(S, welt) {
  if (!ERWEITERUNG[S.grenze || 0]) return { ok: false, grund: 'Die Stadt hat ihre größte Ausdehnung erreicht' };
  const fehlt = erweiterungFehlt(S); if (fehlt) return { ok: false, grund: 'Es fehlt: ' + fehlt };
  const e = ERWEITERUNG[S.grenze || 0], von = stadtGrenze(S);
  for (const [g, n] of Object.entries(e.kosten)) S.gut[g] -= n;
  S.grenze = (S.grenze || 0) + 1;
  // Via Postumia: Landstraße bis an die neue Grenze verlängern (wo frei)
  const bel = belegung(S);
  for (let x = von; x < stadtGrenze(S); x++) { const i = START_STRASSE * RASTER + x;
    if (welt.typ[i] === GRAS && !bel[i]) S.geb.push({ id: S.naechste++, t: 'strasse', x, z: START_STRASSE, w: 0, prio: false, stufe: 1, bew: 0, status: [] }); }
  return { ok: true, text: e.text };
}

// ---------- Unterhalt (1.11.): Lohn und Sold aus der Stadtkasse; ohne Geld steht das Gebäude still ----------
export function unterhaltSumme(S) {
  let n = S.geb.reduce((s, b) => s + (GEB[b.t].unterhalt || 0), 0);
  for (const l of Object.values(S.land || {})) { if (l.betrieb === 'kastell') n += LAND_BETRIEBE.kastell.unterhalt; if (l.turm) n += SCHUTZ.turm.unterhalt; }
  return n;
}
function unterhaltZahlen(S) {
  let n = 0;
  const zahle = u => { if (S.gut.denare >= u) { S.gut.denare -= u; n += u; return true; } return false; };
  for (const b of S.geb) {
    const u = (GEB[b.t].unterhalt || 0) * (b.t === 'wache' && amt(S) >= 2 ? 0.5 : 1); if (!u) continue;
    b.unbezahlt = !(b.w > 0) ? false : !zahle(u);   // nur wer arbeitet, bekommt Lohn
    if (b.unbezahlt) { b.w = 0; b.von = []; }
  }
  for (const l of Object.values(S.land || {})) {
    if (l.betrieb === 'kastell') l.unbezahlt = !zahle(LAND_BETRIEBE.kastell.unterhalt * (amt(S) >= 2 ? 0.5 : 1));
    if (l.turm) l.turmUnbezahlt = !zahle(SCHUTZ.turm.unterhalt);
  }
  return n;
}

// ---------- Familie und Ämter (S4.1) ----------
export function familieS(S) {
  if (!S.familie) S.familie = JSON.parse(JSON.stringify(FAMILIE_START));
  if (!S.rivalen) S.rivalen = RIVALEN.map(r => ({ gens: r.gens, ansehen: r.ansehen }));
  return S.familie;
}
export const amt = S => (S.familie ? S.familie.amt : 0);
const oberhaupt = F => F.mitglieder.find(m => m.rolle === 'Oberhaupt');
const eigenschaft = (F, e) => F.mitglieder.some(m => m.eig === e && m.alter >= 16 && !m.ausbildung);   // jedes erwachsene Mitglied hilft (S4.2)
export const ansehenProMonat = S => { const F = familieS(S); return (0.3 + 0.35 * rang(S) + (gunst(S) >= 70 ? 0.4 : 0) + (F.klienten || 0) * KLIENTEN.ansehen) * (eigenschaft(F, 'Redner') ? 1.2 : 1); };
export const staerksterRivale = S => { const F = familieS(S); const g = S.rivalen.filter(r => !(F.buende || []).includes(r.gens)); return g.length ? g.reduce((a, r) => r.ansehen > a.ansehen ? r : a) : null; };
export function amtFehlt(S) {
  const F = familieS(S), a = AEMTER[F.amt + 1]; if (!a) return 'Kein höheres Amt';
  if (a.bald) return 'Kommt mit der Kaiserzeit';
  const f = [];
  if (a.epoche && epoche(S) < a.epoche) f.push('Späte Republik');
  if (a.rang && rang(S) < a.rang) f.push(`Stadtrang ${RAENGE[a.rang].n}`);
  if (F.ansehen < a.ansehen) f.push(`Ansehen ${a.ansehen}`);
  const r = staerksterRivale(S); if (r && F.ansehen <= r.ansehen) f.push(`mehr Ansehen als die ${RIVALEN.find(x => x.gens === r.gens).n} (${Math.round(r.ansehen)})`);
  if (F.vermoegen < a.kosten) f.push(`${a.kosten} Denare Familienvermögen für den Wahlkampf`);
  return f.join(', ');
}
export function kandidieren(S) {
  const fehlt = amtFehlt(S); if (fehlt) return { ok: false, grund: 'Es fehlt: ' + fehlt };
  const F = familieS(S), a = AEMTER[F.amt + 1];
  F.vermoegen -= a.kosten; F.amt++;
  return { ok: true, text: `${(oberhaupt(F) || { n: 'Die Familie' }).n} ist zum ${a.n} gewählt!` };
}
export const geschaefte = S => S.geb.filter(b => b.familie);
export function familienGeschaeft(S, b) {
  if (!b || !GEB[b.t].erzeugt) return { ok: false, grund: 'Nur ein Betrieb kann ein Familiengeschäft sein' };
  if (b.familie) { b.familie = false; return { ok: true, text: 'Der Betrieb gehört wieder der Stadt.' }; }
  if (geschaefte(S).length >= FAMILIE.geschaeftMax) return { ok: false, grund: `Mehr als ${FAMILIE.geschaeftMax} Familiengeschäfte duldet der Senat nicht` };
  b.familie = true; return { ok: true, text: 'Der Betrieb arbeitet jetzt für die Familie.' };
}
export function spieleAusrichten(S) {
  const F = familieS(S), k = FAMILIE.spiele;
  if (F.amt < 1) return { ok: false, grund: 'Spiele richtet der Ädil aus' };
  if (F.spieleJahr === jahr(S)) return { ok: false, grund: 'Dieses Jahr gab es schon Spiele' };
  if (F.vermoegen < k.vermoegen) return { ok: false, grund: `Es fehlen ${Math.ceil(k.vermoegen - F.vermoegen)} Denare im Familienvermögen` };
  F.vermoegen -= k.vermoegen; F.ansehen += k.ansehen; F.spieleJahr = jahr(S); S.stimmung = Math.min(100, S.stimmung + k.stimmung);
  return { ok: true };
}
function familieMonat(S, meld) {
  const F = familieS(S);
  F.vermoegen += 1 + (F.annier ? 3 : 0);   // kleines Landgut der Familie, Geschäfte mit den Anniern
  // Klienten: Zuwendungen (sportula) aus dem Vermögen; fehlt es, gehen sie
  if (F.klienten > 0) { const k = F.klienten * KLIENTEN.kosten; if (F.vermoegen >= k) F.vermoegen -= k; else { F.klienten = Math.max(0, F.klienten - KLIENTEN.schritt); meld.push('Die Familie kann ihre Klienten nicht mehr versorgen – einige bleiben der salutatio fern.'); } }
  // Ausbildung
  for (const m of F.mitglieder) if (m.ausbildung && --m.ausbildung.rest <= 0) {
    const a = AUSBILDUNG[m.ausbildung.art]; m.eig = a.eig; m.text = a.text; delete m.ausbildung;
    meld.push(`${m.n} kehrt zurück: ${a.n} abgeschlossen.`);
  }
  // Familiengeschäfte: Gewinn für die Familie, bezahlt aus der Stadtkasse (Versuchung); ab 3 Gerede im Senat
  const gesch = geschaefte(S).filter(b => b.w > 0);
  const gewinn = gesch.length * FAMILIE.geschaeftGewinn * (eigenschaft(F, 'Geschäftssinn') ? 1.25 : 1);
  const aus = Math.min(gewinn, Math.max(0, S.gut.denare)); S.gut.denare -= aus; F.vermoegen += aus;
  if (geschaefte(S).length >= FAMILIE.gerede) S.gunst = Math.max(0, gunst(S) - 1);
  F.ansehen += ansehenProMonat(S);
  S.rivalen.forEach(r => { r.ansehen += RIVALEN.find(x => x.gens === r.gens).wachstum; });
  // Jahreswechsel: Alter, Mündigkeit, Erbfolge
  if (S.monat % 12 === 11) {
    for (const m of F.mitglieder) {
      m.alter++;
      if (m.rolle === 'Sohn' && m.alter === 16) meld.push(`${m.n} ist mündig und kann einmal die Familie führen.`);
      if (m.rolle === 'Tochter' && m.alter === HEIRAT.alterTochter && !m.verheiratet) meld.push(`${m.n} ist im heiratsfähigen Alter. Die Familien der Stadt machen Angebote.`);
    }
    // Enkel: verheirateter Sohn (oder Oberhaupt mit Ehefrau unter 40) bekommt Kinder
    const vater = F.mitglieder.find(m => m.rolle === 'Sohn' && m.verheiratet);
    if (vater && F.mitglieder.length < 9 && wurf(S, 9002) < HEIRAT.kindChance) {
      const sohn = wurf(S, 9003) < 0.5, gens = vater.n.split(' ')[1] || 'Valerius';
      const k = { n: sohn ? ['Publius', 'Quintus', 'Gaius'][F.mitglieder.length % 3] + ' ' + gens : ['Valeria Minor', 'Valeria Tertia'][F.mitglieder.length % 2], alter: 0, rolle: sohn ? 'Enkel' : 'Enkelin', eig: '–', text: `Kind von ${vater.n}.` };
      F.mitglieder.push(k); meld.push(`Freude im Haus der Valerier: ${k.n} ist geboren.`);
    }
    for (const m of F.mitglieder) if (m.rolle === 'Enkel' && m.alter >= 14) { m.rolle = 'Sohn'; m.text = 'Enkel des Hauses, möglicher Erbe.'; }
    for (const m of F.mitglieder) if (m.rolle === 'Enkelin' && m.alter >= 12) { m.rolle = 'Tochter'; m.text = 'Eine gute Heirat stärkt die Familie.'; }
    const o = oberhaupt(F);
    if (o && o.alter >= 62 && wurf(S, 9001) < 0.2) {
      const erbe = F.mitglieder.filter(m => m.rolle === 'Sohn' && m.alter >= 16).sort((a, b) => b.alter - a.alter)[0];
      F.mitglieder = F.mitglieder.filter(m => m !== o);
      if (erbe) { erbe.rolle = 'Oberhaupt'; F.ansehen *= 0.8; meld.push(`${o.n} ist gestorben. ${erbe.n} führt nun die Familie.`); }
      else meld.push(`${o.n} ist gestorben. Ohne mündigen Sohn führt die Witwe die Familie.`);
    }
  }
}

// ---------- Heirat, Klienten, Ausbildung (S4.2) ----------
export function heiratsAngebote(S, m) {
  if (!m || m.verheiratet || m.ausbildung) return [];
  if (m.rolle === 'Tochter' && m.alter >= HEIRAT.alterTochter) return HEIRAT.tochter;
  if (m.rolle === 'Sohn' && m.alter >= HEIRAT.alterSohn) return HEIRAT.sohn;
  return [];
}
export function heiraten(S, name, id) {
  const F = familieS(S), m = F.mitglieder.find(x => x.n === name), o = heiratsAngebote(S, m).find(x => x.id === id);
  if (!o) return { ok: false, grund: 'Diese Heirat ist nicht möglich' };
  if (o.bund && (F.buende || []).includes(o.bund)) return { ok: false, grund: `Mit den ${o.haus}n besteht schon ein Bündnis` };
  if (m.rolle === 'Tochter') {
    if (F.vermoegen < o.mitgift) return { ok: false, grund: `Für die Mitgift fehlen ${Math.ceil(o.mitgift - F.vermoegen)} Denare` };
    F.vermoegen -= o.mitgift; F.mitglieder = F.mitglieder.filter(x => x !== m);   // sie zieht in das Haus ihres Mannes
    if (o.id === 'annii') F.annier = true;
  } else { F.vermoegen += o.mitgift; m.verheiratet = o.n; F.mitglieder.push({ n: o.n, alter: Math.max(15, m.alter - 4), rolle: 'Schwiegertochter', eig: '–', text: `Aus dem Haus der ${o.haus}.` }); }
  if (o.bund) F.buende = [...new Set([...(F.buende || []), o.bund])];
  F.ansehen += 5;
  return { ok: true, text: m.rolle === 'Tochter' ? `${m.n} heiratet ${o.n}. ${o.text}` : `${m.n} heiratet ${o.n}. ${o.text}` };
}
export const klientenMax = S => KLIENTEN.grund + KLIENTEN.jeRang * rang(S);
export function klienten(S, mehr) {
  const F = familieS(S), n = (F.klienten || 0) + (mehr ? KLIENTEN.schritt : -KLIENTEN.schritt);
  if (n < 0) return { ok: false, grund: 'Keine Klienten mehr' };
  if (n > klientenMax(S)) return { ok: false, grund: `Mehr als ${klientenMax(S)} Klienten folgen einer Familie in einer Stadt dieser Größe nicht` };
  F.klienten = n; return { ok: true };
}
export function ausbilden(S, name, art) {
  const F = familieS(S), m = F.mitglieder.find(x => x.n === name), a = AUSBILDUNG[art];
  if (!m || m.rolle !== 'Sohn' || m.alter < 14 || m.ausbildung || m.gelernt) return { ok: false, grund: 'Nur ein Sohn ab 14 Jahren, einmal' };
  if (F.vermoegen < a.kosten) return { ok: false, grund: `Es fehlen ${Math.ceil(a.kosten - F.vermoegen)} Denare` };
  F.vermoegen -= a.kosten; m.ausbildung = { art, rest: a.monate }; m.gelernt = true;
  return { ok: true, text: `${m.n} beginnt: ${a.n}.` };
}

// ---------- Ereignisse mit Entscheidungen (S4.3) ----------
export const ereignis = (id, S) => id && id.startsWith('g:') && S
  ? { id, titel: S.gTitel || 'Geschichte', text: S.gText || '', bild: S.gBild || 'krieg', wahl: [{ t: 'Weiter', w: {} }] }
  : EREIGNISSE.find(e => e.id === id);
function ereignisMonat(S) {
  if (S.ereignis || S.ereignisseAus) return;
  const log = S.ereignisLog = S.ereignisLog || {};
  const po = !S.region || S.region === 'po';
  const fest = EREIGNISSE.find(e => e.fest === S.monat && log[e.id] === undefined && (po || !e.nurPo))
    || (S.monat >= 12 && EREIGNISSE.find(e => e.jaehrlich === S.monat % 12 && (log[e.id] === undefined || Math.floor(log[e.id] / 12) < Math.floor(S.monat / 12))));
  if (fest) { S.ereignis = fest.id; return; }
  if (S.monat < 6 || wurf(S, 4242) >= EREIGNIS_CHANCE) return;
  const moegl = EREIGNISSE.filter(e => !e.fest && !e.nurAusgeloest && (po || !e.nurPo) && e.jaehrlich === undefined && S.monat >= (e.ab || 0) && (log[e.id] === undefined || S.monat - log[e.id] >= EREIGNIS_PAUSE) && (!e.wenn || e.wenn(S)));
  if (moegl.length) S.ereignis = moegl[Math.floor(wurf(S, 4243) * moegl.length)].id;
}
export function wahlMoeglich(S, w) {
  const F = familieS(S), x = w.w;
  for (const [g, n] of Object.entries(x.gut || {})) if (n < 0 && (S.gut[g] || 0) < -n) return `Es fehlen ${Math.ceil(-n - (S.gut[g] || 0))} ${WAREN[g].n}`;
  if (x.vermoegen < 0 && F.vermoegen < -x.vermoegen) return `Es fehlen ${Math.ceil(-x.vermoegen - F.vermoegen)} Denare im Familienvermögen`;
  if (w.braucht && w.braucht.ansehen && F.ansehen < w.braucht.ansehen) return `Braucht Ansehen ${w.braucht.ansehen}`;
  return '';
}
export function ereignisWaehlen(S, i) {
  const e = ereignis(S.ereignis, S), w = e && e.wahl[i];
  if (!w) return { ok: false, grund: 'Kein Ereignis' };
  const fehlt = wahlMoeglich(S, w); if (fehlt) return { ok: false, grund: fehlt };
  const F = familieS(S), x = w.w;
  for (const [g, n] of Object.entries(x.gut || {})) S.gut[g] = Math.max(0, (S.gut[g] || 0) + n);
  if (x.vermoegen) F.vermoegen += x.vermoegen;
  if (x.ansehen) F.ansehen = Math.max(0, F.ansehen + x.ansehen);
  if (x.gunst) S.gunst = Math.max(0, Math.min(100, gunst(S) + x.gunst));
  if (x.stimmung) S.stimmung = Math.max(0, Math.min(100, S.stimmung + x.stimmung));
  if (x.frieden) S.frieden = Math.max(S.frieden || 0, x.frieden);
  if (x.via) S.via = true;
  if (x.hoefe) { let n = x.hoefe; for (const l of Object.values(S.land || {})) if (n > 0 && l.betrieb === 'gehoeft') { l.betrieb = ''; l.villa = false; n--; } }
  if (x.leute) for (const h of S.geb.filter(b => b.bew > 0)) h.bew = Math.max(0, h.bew - Math.ceil(h.bew * -x.leute));
  if (x.zuzug) { let rest = x.zuzug; for (const h of S.geb.filter(b => b.t === 'huette')) { const k = Math.min(rest, wohnraum(h) - h.bew); if (k > 0) { h.bew += k; rest -= k; } if (!rest) break; } }
  (S.ereignisLog = S.ereignisLog || {})[e.id] = S.monat; S.ereignis = null;
  return { ok: true };
}
// Wirkung als kurzer Text für die Knöpfe
export function wirkungText(w) {
  const x = w.w, t = [], z = n => (n > 0 ? '+' : '−') + Math.abs(n);
  for (const [g, n] of Object.entries(x.gut || {})) t.push(`${z(n)} ${WAREN[g].n}`);
  if (x.vermoegen) t.push(`${z(x.vermoegen)} Familienvermögen`);
  if (x.ansehen) t.push(`Ansehen ${z(x.ansehen)}`);
  if (x.gunst) t.push(`Gunst Roms ${z(x.gunst)}`);
  if (x.stimmung) t.push(`Stimmung ${z(x.stimmung)}`);
  if (x.leute) t.push(`${Math.round(-x.leute * 100)} % der Einwohner sterben`);
  if (x.zuzug) t.push(`bis ${x.zuzug} neue Einwohner`);
  if (x.frieden) t.push(`${x.frieden} Monate Frieden`);
  if (x.via) t.push('Fernstraße: Handel und Zoll');
  if (x.hoefe) t.push(`${x.hoefe} Höfe im Umland gehen verloren`);
  return t.join(' · ') || 'keine Folgen';
}

// ---------- Seuchen (1.11.) ----------
export const latrineNah = (S, b) => S.geb.some(o => o.t === 'latrine' && !(o.bau > 0) && abstand(o, b) <= GEB.latrine.reichweite);
export function seuchenGefahr(S, b) {
  if (b.t !== 'huette' || !(b.bew > 0)) return 0;
  const X = SEUCHE;
  let p = X.basis * (1 + X.dichte * S.geb.filter(o => o !== b && o.t === 'huette' && abstand(o, b) <= X.umkreis).length);
  if (b.stufe === 3) p *= X.insula;
  if (jahreszeit(S) === 1) p *= X.sommer;
  if (latrineNah(S, b)) p *= X.latrine;
  if (inReichweite(S, b, 'brunnen')) p *= X.brunnen;
  if (hat(S, 'aquaedukt')) p *= X.aquaedukt;
  if (thermeNah(S, b)) p *= 0.7;
  return p;
}
function seucheMonat(S, meld) {
  const X = SEUCHE, krank = S.geb.filter(b => b.krank > 0);
  let tote = 0;
  for (const b of krank) {
    const n = Math.ceil(b.bew * X.verlust); b.bew = Math.max(0, b.bew - n); tote += n;
    for (const o of S.geb) {
      if (o.t !== 'huette' || o.krank > 0 || !(o.bew > 0) || abstand(o, b) > X.nachbar) continue;
      if (wurf(S, 8000 + o.id * 3 + b.id) < (latrineNah(S, o) ? X.ueberLatrine : X.ueber)) { o.krank = X.monate + 1; o.neuKrank = true; }
    }
    if (--b.krank <= 0) delete b.krank;
  }
  let neu = 0;
  for (const b of S.geb) if (b.neuKrank) { delete b.neuKrank; neu++; }
  if (S.monat >= X.ab) for (const b of S.geb) {
    if (b.krank > 0 || b.t !== 'huette') continue;
    if (wurf(S, 6000 + b.id) < seuchenGefahr(S, b)) { b.krank = X.monate; neu++; }
  }
  if (neu) meld.push(neu === 1 ? 'Krankheit! In einem Haus liegen die Menschen mit Fieber.' : `Eine Seuche breitet sich aus: ${neu} Häuser sind betroffen.`);
  if (tote) meld.push(`${tote} Menschen sind an der Krankheit gestorben.`);
}

// ---------- Inschriften (1.11.) ----------
const SIM = { rang: S => rang(S) };
function inschriftenMonat(S, meld) {
  const da = S.inschriften = S.inschriften || {};
  for (const i of INSCHRIFTEN) if (!da[i.id] && i.ok(S, SIM)) { da[i.id] = S.monat; meld.push(`Inschrift auf dem Forum: „${i.n}“`); }
}
export const thermeNah = (S, b) => S.geb.some(o => o.t === 'thermen' && o.geheizt && o.w > 0 && abstand(o, b) <= GEB.thermen.reichweite);

// ---------- Rat des Verwalters (1.11.): das dringendste Problem mit Vorschlag ----------
export function rat(S) {
  const bew = einwohner(S), skl = sklaven(S), haeuser = S.geb.filter(b => b.t === 'huette');
  if (!haeuser.length) return '';
  const bedarf = (bew + skl) * ESSEN_JE_MONAT, vorrat = (S.gut.getreide || 0) + (S.gut.brot || 0) + (S.gut.fisch || 0);
  const ernteBald = jahreszeit(S) === 1 || (jahreszeit(S) === 0 && S.monat % 3 === 2);
  if (bedarf > 0 && vorrat / bedarf < 3 && !ernteBald) { const m = Math.floor(vorrat / bedarf);
    return `${m < 1 ? 'Die Vorräte sind aufgebraucht' : `Die Vorräte reichen nur noch ${m} ${m === 1 ? 'Monat' : 'Monate'}`}. Baue Getreidefelder oder Gehöfte – oder kaufe Getreide in Placentia.`; }
  if (S.gut.denare < (S.letzte.unterhalt || 0) * 2 && S.gut.denare < 30) return 'Die Kasse ist fast leer. Ohne Lohn stehen Markt, Schule und Wache still. Mehr Einwohner bringen mehr Steuern.';
  const leer = S.geb.filter(b => GEB[b.t].arbeiter && b.w === 0 && !(b.bau > 0) && !b.unbezahlt);
  if (leer.length) return `${leer.length === 1 ? GEB[leer[0].t].n + ' steht' : leer.length + ' Betriebe stehen'} ohne Arbeiter. ${leer.some(b => b.einzug === 0) ? 'Baue Hütten in höchstens 16 Feldern Entfernung.' : 'Es fehlen Arbeitskräfte: Baue mehr Hütten oder gib wichtigen Betrieben Vorrang.'}`;
  if ((S.gut.holz || 0) < 15) return 'Holz wird knapp. Baue einen weiteren Holzfäller am Waldrand oder ein Holzfällerlager im Umland.';
  const ohneWasser = haeuser.filter(h => !inReichweite(S, h, 'brunnen')).length;
  if (ohneWasser) return `${ohneWasser === 1 ? 'Ein Haus hat' : ohneWasser + ' Häuser haben'} keinen Brunnen in der Nähe. Ansicht „Wasser“ zeigt die Lücken.`;
  if ((S.letzte.arbeitslos || 0) >= 10) return `${S.letzte.arbeitslos} Menschen finden keine Arbeit. Neue Betriebe in ihrer Nähe bringen Waren und Stimmung.`;
  if (S.stimmung < 45) return 'Die Stimmung sinkt. Brot statt Getreidebrei, Brunnen, Markt, Schreine und Feste helfen.';
  if (haeuser.every(h => h.bew >= wohnraum(h)) && S.stimmung >= 40) return 'Alle Häuser sind voll. Neue Hütten bringen neue Siedler.';
  return '';
}

// ---------- Bauzeit (Phase A, 1.11.) ----------
// Monate mit voller Bauarbeiterschaft: fest (bauzeit in GEB) oder nach Baustoffmenge (1 Monat je 30 Einheiten, 1–4).
export function bauzeit(t) {
  const d = GEB[t]; if (t === 'strasse') return 0;
  if (d.bauzeit) return d.bauzeit;
  const n = Object.entries(d.kosten).filter(([g]) => g !== 'denare').reduce((s, [, v]) => s + v, 0);
  return Math.max(1, Math.min(4, Math.round(n / 30)));
}
export const bauarbeiter = t => GEB[t].bauarbeiter || (bauzeit(t) >= 6 ? 4 : 2);
const WEIBLICH = new Set(['huette', 'muehle', 'baeckerei', 'lehmgrube', 'ziegelei', 'schmiede', 'kelter', 'oelmuehle', 'weberei', 'garumsiederei', 'schule', 'feuerwache', 'latrine', 'basilika', 'domus']);
const artikel = t => t === 'ludus' || t === 'wache' ? 'Die' : WEIBLICH.has(t) ? 'Die' : ['markt', 'speicher', 'brunnen', 'schrein', 'tempel', 'holzfaeller'].includes(t) ? 'Der' : 'Das';

// ---------- Stadtmauer (Phase A): Anteil der Häuser, die vom Kartenrand aus nicht erreichbar sind ----------
// Mauer und fertige Tore sperren (Tore werden bei Gefahr geschlossen), Wasser sperrt, Wald nicht.
let mauerCache = { k: '', v: 0 };
export function mauerSchutz(S, welt = mauerWelt) {
  const haeuser = S.geb.filter(b => (b.t === 'huette' || b.t === 'domus') && !(b.bau > 0));
  const mauern = S.geb.filter(b => (b.t === 'mauer' || b.t === 'tor') && !(b.bau > 0));
  if (!haeuser.length || mauern.length < 4 || !welt) return 0;
  const k = mauern.length + ':' + mauern.reduce((s, b) => s + b.x * 41 + b.z * 7, 0) + ':' + haeuser.length;
  if (mauerCache.k === k) return mauerCache.v;
  const zu = new Uint8Array(RASTER * TIEFE), weg = new Uint8Array(RASTER * TIEFE), q = [];
  for (const b of mauern) zu[b.z * RASTER + b.x] = 1;
  for (let i = 0; i < zu.length; i++) if (welt.typ[i] === WASSER) zu[i] = 1;
  const rein = (x, z) => { const i = z * RASTER + x; if (!zu[i] && !weg[i]) { weg[i] = 1; q.push(i); } };
  for (let x = 0; x < RASTER; x++) { rein(x, 0); rein(x, TIEFE - 1); }
  for (let z = 0; z < TIEFE; z++) { rein(0, z); rein(RASTER - 1, z); }
  for (let n = 0; n < q.length; n++) {
    const i = q[n], x = i % RASTER, z = (i - x) / RASTER;
    if (x > 0) rein(x - 1, z); if (x < RASTER - 1) rein(x + 1, z); if (z > 0) rein(x, z - 1); if (z < TIEFE - 1) rein(x, z + 1);
  }
  const sicher = haeuser.filter(h => { const [w, d] = groesse(h.t); for (let z = h.z; z < h.z + d; z++) for (let x = h.x; x < h.x + w; x++) if (weg[z * RASTER + x]) return false; return true; });
  mauerCache = { k, v: sicher.length / haeuser.length };
  return mauerCache.v;
}
let mauerWelt = null;
export const setzeWelt = w => { mauerWelt = w; };

// ---------- Zeitleiste der Geschichte (Phase B) und Präfekt ----------
export const geschichteMonatVon = (S, g) => (g.jahr - S.jahr0) * 12 + 4;   // Sommer des Jahres
export function geschichteKommend(S) {
  const log = S.gesch || {};
  const g = GESCHICHTE.find(x => log[x.id] === 'gewarnt'); if (!g) return null;
  return { g, monate: Math.max(0, geschichteMonatVon(S, g) - S.monat) };
}
function geschichteMonat(S, meld) {
  const art = S.geschichte || 'an'; if (art === 'aus' || (S.region && S.region !== 'po')) return;   // Zeitleiste: nur Po-Ebene
  const log = S.gesch = S.gesch || {};
  for (const g of GESCHICHTE) {
    const m = geschichteMonatVon(S, g);
    if (!log[g.id] && S.monat >= m - 24 && S.monat < m) { log[g.id] = 'gewarnt'; meld.push('Vorzeichen: ' + g.warnung); }
    if (log[g.id] !== 'fertig' && S.monat >= m) {
      if (S.ereignis) return;   // erst, wenn kein anderes Ereignis offen ist
      log[g.id] = 'fertig';
      const titel = g.titel || (ereignis(g.id) || {}).titel || g.id;
      if (art === 'kulisse') { meld.push(`Im Jahr ${-g.jahr} v. Chr.: ${titel}.`); continue; }
      if (g.art === 'wahl') { if (S.ereignisseAus) { meld.push(`Im Jahr ${-g.jahr} v. Chr.: ${titel}.`); continue; } S.ereignis = g.id; return; }
      const text = pruefung(S, g);
      if (S.ereignisseAus) { meld.push(`${titel}: ${text}`); continue; }
      Object.assign(S, { ereignis: 'g:' + g.id, gTitel: titel, gText: text, gBild: g.bild });
      return;
    }
  }
}
const vorratsMonate = S => { const b = (einwohner(S) + sklaven(S)) * ESSEN_JE_MONAT; return b > 0 ? ((S.gut.getreide || 0) + (S.gut.brot || 0) + (S.gut.fisch || 0)) / b : 99; };
function brennen(S, n) { const h = S.geb.filter(b => b.t === 'huette' && !(b.brand > 0) && b.bew > 0); for (let i = 0; i < n && h.length; i++) h.splice(Math.floor(wurf(S, 9100 + i) * h.length), 1)[0].brand = 1; }
function pruefung(S, g) {
  const F = familieS(S), klein = einwohner(S) < 60 ? 0.5 : 1, verlust = a => { for (const w of ['getreide', 'brot', 'holz']) S.gut[w] = (S.gut[w] || 0) * (1 - a * klein); };
  if (g.id === 'belagerung') {
    const wert = 0.5 * mauerSchutz(S) + 0.2 * (hatKastell(S) ? 1 : 0) + 0.3 * Math.min(1, vorratsMonate(S) / 6);
    (S.zaehler = S.zaehler || {}).belagerung = wert >= 0.7 ? 'gehalten' : 'gelitten';
    if (wert >= 0.7) { F.ansehen += 15; S.gunst = Math.min(100, gunst(S) + 10); S.stimmung = Math.min(100, S.stimmung + 5);
      return 'Hamilkar und die Gallier stürmen gegen Cremona – vergeblich. Mauer und Vorräte halten, die Belagerer ziehen ab. Placentia ist gefallen, Cremona steht. (Ansehen +15, Gunst Roms +10)'; }
    if (wert >= 0.4) { verlust(0.3); S.stimmung = Math.max(0, S.stimmung - 8);
      return 'Die Gallier plündern die Vorstädte und das Umland, bevor ein römisches Heer sie vertreibt. Ein Teil der Vorräte ist verloren. (Vorräte −30 %, Stimmung −8) Mehr Mauer, Kastell und Vorräte hätten geholfen.'; }
    verlust(0.6); brennen(S, 2 * klein); S.stimmung = Math.max(0, S.stimmung - 15); S.gunst = Math.max(0, gunst(S) - 5);
    return 'Cremona wird schwer verwüstet: Häuser brennen, die Speicher sind geplündert. Erst ein römisches Heer befreit die Stadt. (Vorräte −60 %, Brände, Stimmung −15) Eine geschlossene Mauer, ein Kastell und Vorräte für sechs Monate sichern die Stadt.';
  }
  if (g.id === 'siedler') {
    const frei = S.geb.filter(b => b.t === 'huette' && !(b.bau > 0)).reduce((n, h) => n + wohnraum(h) - h.bew, 0), korn = (S.gut.getreide || 0) >= 60;
    const n = Math.min(frei, 30);
    if (n > 0) { let rest = n; for (const h of S.geb.filter(b => b.t === 'huette' && !(b.bau > 0))) { const k = Math.min(rest, wohnraum(h) - h.bew); h.bew += k; rest -= k; if (!rest) break; } }
    if (n >= 20 && korn) { S.gunst = Math.min(100, gunst(S) + 8); S.gut.getreide -= 30; return `${n} neue Familien aus Latium ziehen in die Häuser. Cremona wächst, und Rom ist zufrieden. (Gunst +8, Getreide −30)`; }
    if (n > 0) { S.gunst = Math.min(100, gunst(S) + 2); return `Nur ${n} Familien finden Platz${korn ? '' : ' und Brot'}, die übrigen ziehen weiter nach Bononia. (Gunst +2) Freie Häuser und 60 Getreide hätten alle aufgenommen.`; }
    S.gunst = Math.max(0, gunst(S) - 5); return 'Kein Haus ist frei – die Siedler ziehen weiter nach Bononia. Rom ist enttäuscht. (Gunst −5)';
  }
  if (g.id === 'spartacus') {
    const skl = sklaven(S);
    if (!skl) { F.ansehen += 3; return 'Spartacus zieht durch die Po-Ebene. In Cremona gibt es keine Sklaven, die sich ihm anschließen – das Heer zieht vorbei. (Ansehen +3)'; }
    const wert = (S.geb.some(b => b.t === 'wache' && b.w > 0) ? 0.4 : 0) + 0.4 * mauerSchutz(S) + (skl < einwohner(S) * 0.3 ? 0.2 : 0);
    const flucht = wert >= 0.6 ? 0.2 : 0.6;
    for (const q of S.geb.filter(b => b.t === 'quartier')) q.skl = Math.floor((q.skl || 0) * (1 - flucht));
    if (wert >= 0.6) return 'Spartacus zieht vorbei. Wache und Mauer halten die Ordnung, nur wenige Sklaven fliehen zu ihm. (Sklaven −20 %)';
    brennen(S, 2); S.stimmung = Math.max(0, S.stimmung - 10);
    return 'Die Sklaven Cremonas erheben sich und schließen sich Spartacus an. Häuser brennen, viele Sklaven sind fort. (Sklaven −60 %, Brände, Stimmung −10) Eine Feuerwache, die Mauer und weniger Sklaven hätten geholfen.';
  }
  return '';
}
function praefektMonat(S, meld) {
  if (S.praefekt > 0) {
    S.gunst = Math.min(100, gunst(S) + 1);
    if (--S.praefekt === 0) { S.gunst = Math.max(gunst(S), 20); meld.push('Der Präfekt kehrt nach Rom zurück. Die Stadt verwaltet sich wieder selbst.'); }
    return;
  }
  if (gunst(S) <= 0 && S.monat > 12) {
    S.praefekt = PRAEFEKT.monate; const F = familieS(S); F.amt = 0; F.ansehen *= 0.7;
    if (S.ereignisseAus) { meld.push('Ein Präfekt aus Rom übernimmt die Verwaltung (Steuern −30 %, die Valerier verlieren ihr Amt).'); return; }
    Object.assign(S, { ereignis: S.ereignis || 'g:praefekt', gTitel: 'Ein Präfekt aus Rom', gBild: 'krieg',
      gText: 'Der Senat hat das Vertrauen in die Stadt verloren. Ein Präfekt übernimmt die Verwaltung: Er treibt Steuern für Rom ein (Steuern −30 % für die Stadt), die Valerier verlieren ihr Amt. In zwei Jahren entscheidet Rom neu.' });
  }
}

// ---------- Bodenwert (Phase D) ----------
export function bodenwert(S, b) {
  let v = 0;
  for (const o of S.geb) {
    if (o === b || o.bau > 0) continue;
    const w = GEB[o.t].bodenwert || BODENWERT[o.t]; if (!w) continue;
    const d = abstand(o, b); if (d <= w[1]) v += w[0] * (1 - 0.5 * d / w[1]);
  }
  return Math.round(v * 10) / 10;
}

// ---------- Ruf der Stadt und Lieferverträge (Phase D) ----------
export function rufWaehlen(S, id) {
  if (S.ruf) return { ok: false, grund: 'Der Ruf der Stadt steht schon fest' };
  if (rang(S) < 2) return { ok: false, grund: 'Erst ab der Kleinstadt' };
  if (!RUF[id]) return { ok: false, grund: 'Unbekannt' };
  S.ruf = id; return { ok: true, text: `${REG.stadt} wird bekannt als ${RUF[id].n}.` };
}
export const vertragPreis = (id, g) => Math.round(PARTNER[id].waren[g].basis * VERTRAG.preis * VERTRAG.menge);
export function vertragUmschalten(S, id, g) {
  const v = S.vertraege = S.vertraege || [], i = v.findIndex(x => x.p === id && x.g === g);
  if (i >= 0) { v.splice(i, 1); return { ok: true, text: 'Vertrag beendet.' }; }
  if (!handelOffen(S, id)) return { ok: false, grund: 'Noch kein Weg nach ' + PARTNER[id].n };
  if (v.length >= VERTRAG.max) return { ok: false, grund: `Höchstens ${VERTRAG.max} Lieferverträge` };
  v.push({ p: id, g, fehl: 0 }); return { ok: true, text: `Vertrag: jeden Monat ${VERTRAG.menge} ${WAREN[g].n} nach ${PARTNER[id].n} für ${vertragPreis(id, g)} Denare.` };
}
function vertraegeMonat(S, meld) {
  for (const v of [...(S.vertraege || [])]) {
    if ((S.gut[v.g] || 0) >= VERTRAG.menge && handelOffen(S, v.p)) { S.gut[v.g] -= VERTRAG.menge; S.gut.denare += vertragPreis(v.p, v.g); v.fehl = 0; continue; }
    if (++v.fehl >= VERTRAG.fehlschlag) {
      S.vertraege = S.vertraege.filter(x => x !== v); familieS(S).ansehen = Math.max(0, familieS(S).ansehen - VERTRAG.ansehen);
      meld.push(`${PARTNER[v.p].n} kündigt den Vertrag über ${WAREN[v.g].n}: dreimal nicht geliefert. (Ansehen −${VERTRAG.ansehen})`);
    }
  }
}

