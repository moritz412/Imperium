// Städte Roms – Spiellogik ohne Grafik (Gelände, Bauen, Monatsablauf)
import { RASTER, GEB, CASA, WAREN, JAHRESZEITEN, LAGER_GRUND, ARBEIT_ANTEIL, ESSEN_JE_MONAT, START, AUFTRAEGE } from './daten.js';

export const GRAS = 0, WALD = 1, WASSER = 2;

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
  return { v: 1, jahr0: -218, monat: 2, gut: { ...START.gut }, geb: [], naechste: 1, stimmung: START.stimmung,
    auftrag: 0, letzte: {}, versorgt: { brot: false, essen: true } };
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
const abstand = (a, b) => { const p = mitte(a), q = mitte(b); return Math.hypot(p[0] - q[0], p[1] - q[1]); };

export function inReichweite(S, b, typ) {
  return S.geb.some(o => o.t === typ && (typ !== 'markt' || o.w > 0) && abstand(o, b) <= GEB[typ].reichweite);
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

  // Arbeiter verteilen: Priorität zuerst, dann nach Bauzeit
  let frei = Math.floor(bew * ARBEIT_ANTEIL);
  const betriebe = S.geb.filter(b => GEB[b.t].arbeiter).sort((a, b) => (b.prio - a.prio) || (a.id - b.id));
  for (const b of betriebe) { const n = Math.min(GEB[b.t].arbeiter, frei); b.w = n; frei -= n; }
  S.letzte = { arbeitslos: frei, arbeiter: Math.floor(bew * ARBEIT_ANTEIL) };

  // Produktion
  for (const b of S.geb) {
    const d = GEB[b.t]; b.status = [];
    if (!d.arbeiter) continue;
    const anteil = b.w / d.arbeiter;
    if (b.w === 0) { b.status.push({ art: 'arbeiter', text: 'Keine Arbeiter' }); continue; }
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
  for (const b of S.geb.filter(b => b.t === 'huette')) {
    haeuser++;
    const wasser = inReichweite(S, b, 'brunnen'), markt = inReichweite(S, b, 'markt');
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
