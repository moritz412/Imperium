// Städte Roms – Spiellogik ohne Grafik (Gelände, Bauen, Monatsablauf)
import { RASTER, GEB, CASA, WAREN, JAHRESZEITEN, LAGER_GRUND, ARBEIT_ANTEIL, ESSEN_JE_MONAT, START, AUFTRAEGE } from './daten.js';

export const GRAS = 0, WALD = 1, WASSER = 2;
export const EINZUG = 16;   // Laufweite der Arbeiter in Feldern (Mitte Haus → Mitte Betrieb)

// Gelände: Fluss am unteren Rand, Wald links und in einigen Flecken (fest, nicht zufällig je Start)
export function erzeugeWelt() {
  const typ = new Uint8Array(RASTER * RASTER);
  let s = 7;
  const zufall = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let z = 0; z < RASTER; z++) for (let x = 0; x < RASTER; x++) {
    const fluss = 36.5 + Math.sin(x * 0.25) * 1.2;
    let t = GRAS;
    if (z >= fluss) t = WASSER;
    else if (x < 3 + Math.sin(z * 0.4) * 1.5 + zufall() * 1.2) t = WALD;
    typ[z * RASTER + x] = t;
  }
  // Waldflecken
  [[30, 5, 3.5], [12, 4, 2.5], [33, 24, 2.8]].forEach(([cx, cz, r]) => {
    for (let z = 0; z < RASTER; z++) for (let x = 0; x < RASTER; x++) {
      if (Math.hypot(x - cx, z - cz) < r + zufall() * 0.8 && typ[z * RASTER + x] === GRAS) typ[z * RASTER + x] = WALD;
    }
  });
  return { typ };
}

export function neuesSpiel() {
  const S = { v: 1, jahr0: -218, monat: 2, gut: { ...START.gut }, geb: [], naechste: 1, stimmung: START.stimmung,
    auftrag: 0, letzte: {}, versorgt: { brot: false, essen: true } };
  // Landstraße quer durch das Bauland (S1.3), an ihr entstehen die ersten Häuser
  const welt = erzeugeWelt();
  for (let x = 0; x < RASTER; x++) if (welt.typ[START_STRASSE * RASTER + x] === GRAS)
    S.geb.push({ id: S.naechste++, t: 'strasse', x, z: START_STRASSE, w: 0, prio: false, stufe: 1, bew: 0, status: [] });
  return S;
}

// ---------- Straßen (S1.3) ----------
export const START_STRASSE = 12;
export const OHNE_STRASSE = new Set(['strasse', 'brunnen']);   // brauchen keine Straße vor der Tür
const NACHBARN = [[1, 0], [-1, 0], [0, 1], [0, -1]];

export function strassenMaske(S) {
  const m = new Uint8Array(RASTER * RASTER);
  for (const b of S.geb) if (b.t === 'strasse') m[b.z * RASTER + b.x] = 1;
  return m;
}
// Felder rings um die Grundfläche (ohne Ecken)
export function randFelder(t, x, z) {
  const [w, d] = groesse(t), r = [];
  for (let i = 0; i < w; i++) r.push([x + i, z - 1], [x + i, z + d]);
  for (let i = 0; i < d; i++) r.push([x - 1, z + i], [x + w, z + i]);
  return r.filter(([a, c]) => a >= 0 && c >= 0 && a < RASTER && c < RASTER).map(([a, c]) => c * RASTER + a);
}
export const anStrasse = (t, x, z, maske) => randFelder(t, x, z).some(i => maske[i]);

// Wegstrecke über Straßen ab den Straßenfeldern vor einem Gebäude (Breitensuche), −1 = nicht erreichbar
export function strassenWeg(maske, b, max = 999) {
  const dist = new Int16Array(RASTER * RASTER).fill(-1), q = [];
  for (const i of randFelder(b.t, b.x, b.z)) if (maske[i]) { dist[i] = 0; q.push(i); }
  for (let k = 0; k < q.length; k++) {
    const i = q[k], x = i % RASTER, z = (i - x) / RASTER;
    if (dist[i] >= max) continue;
    for (const [dx, dz] of NACHBARN) {
      const a = x + dx, c = z + dz, j = c * RASTER + a;
      if (a >= 0 && c >= 0 && a < RASTER && c < RASTER && maske[j] && dist[j] < 0) { dist[j] = dist[i] + 1; q.push(j); }
    }
  }
  return dist;
}

export const jahreszeit = S => Math.floor((S.monat % 12) / 3);
export const jahr = S => S.jahr0 + Math.floor(S.monat / 12);
export const einwohner = S => S.geb.reduce((s, b) => s + (b.bew || 0), 0);
export const def = b => GEB[b.t];
export const lagerGrenze = S => LAGER_GRUND + S.geb.filter(b => b.t === 'speicher' && (b.w || 0) > 0).length * GEB.speicher.lager;
export const groesse = t => GEB[t].g;

export function datumText(S) {
  const j = jahr(S);
  return `${JAHRESZEITEN[jahreszeit(S)].n} · ${j < 0 ? -j + ' v. Chr.' : j + ' n. Chr.'}`;
}

// Belegung: welches Gebäude steht auf Feld (x,z)
export function belegung(S) {
  const m = new Int32Array(RASTER * RASTER);
  for (const b of S.geb) {
    const [w, d] = groesse(b.t);
    for (let z = b.z; z < b.z + d; z++) for (let x = b.x; x < b.x + w; x++) m[z * RASTER + x] = b.id;
  }
  return m;
}

export function pruefePlatz(S, welt, t, x, z, bel = belegung(S)) {
  const [w, d] = groesse(t);
  if (x < 0 || z < 0 || x + w > RASTER || z + d > RASTER) return 'Außerhalb der Stadt';
  for (let zz = z; zz < z + d; zz++) for (let xx = x; xx < x + w; xx++) {
    const i = zz * RASTER + xx;
    if (welt.typ[i] === WASSER) return 'Hier fließt der Fluss';
    if (welt.typ[i] === WALD) return 'Hier steht Wald';
    if (bel[i]) return 'Hier steht schon etwas';
  }
  if (!OHNE_STRASSE.has(t) && !anStrasse(t, x, z, strassenMaske(S))) return 'Hier fehlt eine Straße vor der Tür';
  return '';
}

export function kannBezahlen(S, kosten) {
  return Object.entries(kosten).every(([g, n]) => (S.gut[g] || 0) >= n);
}

export function fehlendeKosten(S, kosten) {
  return Object.entries(kosten).filter(([g, n]) => (S.gut[g] || 0) < n).map(([g, n]) => `${n - Math.floor(S.gut[g] || 0)} ${WAREN[g].n}`);
}

export function bauen(S, welt, t, x, z) {
  const grund = pruefePlatz(S, welt, t, x, z);
  if (grund) return { ok: false, grund };
  const k = GEB[t].kosten;
  if (!kannBezahlen(S, k)) return { ok: false, grund: 'Es fehlen ' + fehlendeKosten(S, k).join(', ') };
  for (const [g, n] of Object.entries(k)) S.gut[g] -= n;
  const b = { id: S.naechste++, t, x, z, w: 0, prio: false, stufe: 1, bew: 0, status: [] };
  S.geb.push(b);
  return { ok: true, b };
}

export function abreissen(S, id) {
  const i = S.geb.findIndex(b => b.id === id);
  if (i < 0) return false;
  const b = S.geb[i];
  for (const [g, n] of Object.entries(GEB[b.t].kosten)) if (g !== 'denare') S.gut[g] += Math.floor(n / 2);
  S.geb.splice(i, 1);
  return true;
}

export const mitte = b => { const [w, d] = groesse(b.t); return [b.x + w / 2, b.z + d / 2]; };
export const abstand = (a, b) => { const p = mitte(a), q = mitte(b); return Math.hypot(p[0] - q[0], p[1] - q[1]); };

export function inReichweite(S, b, typ, maske) {
  const d = GEB[typ];
  if (!d.strassen) return S.geb.some(o => o.t === typ && abstand(o, b) <= d.reichweite);
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
  for (let z = Math.max(0, Math.floor(cz - r)); z < Math.min(RASTER, cz + r); z++)
    for (let x = Math.max(0, Math.floor(cx - r)); x < Math.min(RASTER, cx + r); x++)
      if (welt.typ[z * RASTER + x] === WALD && Math.hypot(x + 0.5 - cx, z + 0.5 - cz) <= r) return true;
  return false;
}

export const wohnraum = b => b.t === 'huette' ? (b.stufe === 2 ? CASA.wohnt : GEB.huette.wohnt) : 0;

// Ein Monat: Arbeit verteilen, produzieren, essen, wachsen, Steuern, Stimmung, Aufträge
export function monat(S, welt) {
  const meld = [];
  const js = jahreszeit(S), grenze = lagerGrenze(S);
  const bew = einwohner(S);

  // Arbeiter verteilen (S1.2): Betriebe nach Priorität, dann Bauzeit; jeder holt sich Arbeiter aus den nächsten Häusern
  // in Laufweite. b.von = [[Haus-Id, Anzahl], …] für die Laufwege in der Szene.
  const wohnorte = S.geb.filter(b => b.t === 'huette' && b.bew > 0).map(h => ({ h, frei: Math.round(h.bew * ARBEIT_ANTEIL) }));
  const alle = wohnorte.reduce((s, x) => s + x.frei, 0);
  const betriebe = S.geb.filter(b => GEB[b.t].arbeiter).sort((a, b) => (b.prio - a.prio) || (a.id - b.id));
  for (const b of betriebe) {
    const brauch = GEB[b.t].arbeiter, nah = wohnorte.filter(x => abstand(x.h, b) <= EINZUG);
    b.w = 0; b.von = []; b.einzug = nah.length;
    for (const x of nah.filter(x => x.frei > 0).sort((p, q) => abstand(p.h, b) - abstand(q.h, b))) {
      if (b.w >= brauch) break;
      const n = Math.min(x.frei, brauch - b.w); x.frei -= n; b.w += n; b.von.push([x.h.id, n]);
    }
  }
  S.letzte = { arbeitslos: wohnorte.reduce((s, x) => s + x.frei, 0), arbeiter: alle };

  // Produktion
  for (const b of S.geb) {
    const d = GEB[b.t]; b.status = [];
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
    if (d.braucht) for (const [g, n] of Object.entries(d.braucht)) S.gut[g] = Math.max(0, S.gut[g] - n * faktor);
    for (const [g, n] of Object.entries(d.erzeugt)) S.gut[g] = Math.min(grenze, S.gut[g] + n * faktor);
  }

  // Essen: erst Brot, sonst Getreidebrei
  const bedarf = bew * ESSEN_JE_MONAT;
  let brotAnteil = 1, essen = true;
  if (bedarf > 0) {
    const ausBrot = Math.min(S.gut.brot, bedarf); S.gut.brot -= ausBrot;
    const rest = bedarf - ausBrot, ausKorn = Math.min(S.gut.getreide, rest); S.gut.getreide -= ausKorn;
    brotAnteil = ausBrot / bedarf; essen = ausBrot + ausKorn >= bedarf * 0.99;
  }
  S.versorgt = { brot: brotAnteil > 0.95, essen };

  // Häuser: Wasser, Markt, Wachstum, Aufstieg
  let wasserN = 0, marktN = 0, haeuser = 0;
  const maske = strassenMaske(S);
  for (const b of S.geb.filter(b => b.t === 'huette')) {
    haeuser++;
    const wasser = inReichweite(S, b, 'brunnen'), markt = inReichweite(S, b, 'markt', maske);
    if (wasser) wasserN++; if (markt) marktN++;
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
  }

  // Stimmung und Steuern
  let ziel = 50 + (S.versorgt.brot ? 20 : essen ? 5 : -35);
  if (haeuser) ziel += 15 * wasserN / haeuser + 10 * marktN / haeuser;
  S.stimmung += (Math.max(0, Math.min(100, ziel)) - S.stimmung) * 0.3;
  S.gut.denare += einwohner(S) * 0.4 * (S.stimmung / 70);

  // Senatsauftrag
  const a = AUFTRAEGE[S.auftrag];
  if (a && a.ok(S)) {
    for (const [g, n] of Object.entries(a.lohn)) S.gut[g] += n;
    meld.push('Auftrag des Senats erfüllt: ' + Object.entries(a.lohn).map(([g, n]) => `+${n} ${WAREN[g].n}`).join(', '));
    S.auftrag++;
  }

  const altJs = js;
  S.monat++;
  if (jahreszeit(S) !== altJs) meld.push(JAHRESZEITEN[jahreszeit(S)].n + ' beginnt.');
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
    const brunnen = S.geb.filter(b => b.t === 'brunnen'), r = GEB.brunnen.reichweite;
    for (let z = 0; z < RASTER; z++) for (let x = 0; x < RASTER; x++) {
      if (welt.typ[z * RASTER + x] !== GRAS) continue;
      if (brunnen.some(o => { const [cx, cz] = mitte(o); return Math.hypot(x + 0.5 - cx, z + 0.5 - cz) <= r; })) felder.push([x, z, BLAU]);
    }
    for (const h of haeuser) geb.push([h.id, inReichweite(S, h, 'brunnen') ? GRUEN : ROT]);
    return { felder, geb, legende: [[BLAU, 'Brunnen erreicht'], [GRUEN, 'Haus hat Wasser'], [ROT, 'Haus ohne Wasser']] };
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
