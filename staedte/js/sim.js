// Städte Roms – Spiellogik ohne Grafik (Gelände, Bauen, Monatsablauf)
import { RASTER, TIEFE, GRENZE, ERWEITERUNG, GEB, CASA, INSULA, SKLAVEN, FEUER, WAREN, JAHRESZEITEN, LAGER_GRUND, ARBEIT_ANTEIL, ESSEN_JE_MONAT, START, AUFTRAEGE, RAENGE, REGION_RING, VERMESSEN, LAND_BETRIEBE, WEG, NACHBAR, MANTUA, GALLIER, HANDEL, ABGABE, SCHUTZ, GEFAHR, STEUER, FORSCHUNG, WISSEN_GRUND, EPOCHE2, FAMILIE_START, AEMTER, RIVALEN, FAMILIE } from './daten.js';

export const GRAS = 0, WALD = 1, WASSER = 2;
export const EINZUG = 16;   // Laufweite der Arbeiter in Feldern (Mitte Haus → Mitte Betrieb)

// Gelände: Fluss am unteren Rand, Wald links und in einigen Flecken (fest, nicht zufällig je Start)
export function erzeugeWelt() {
  const typ = new Uint8Array(RASTER * TIEFE);
  let s = 7;
  const zufall = () => (s = (s * 16807) % 2147483647) / 2147483647;
  // Reihenfolge wie beim alten 40×40-Gelände (gleiche Zufallsfolge → alte Spielstände passen), danach der Osten
  const feld = (x, z) => {
    const fluss = 36.5 + Math.sin(x * 0.25) * 1.2;
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
  flecken([[30, 5, 3.5], [12, 4, 2.5], [33, 24, 2.8]], [0, 40]);
  flecken([[49, 4, 3], [60, 15, 3.5], [55, 29, 2.5]], [40, RASTER]);
  return { typ };
}

export function neuesSpiel() {
  const S = { v: 1, jahr0: -218, monat: 2, gut: { ...START.gut }, geb: [], naechste: 1, stimmung: START.stimmung,
    auftrag: 0, letzte: {}, versorgt: { brot: false, essen: true }, land: {} };
  // Landstraße quer durch das Bauland (S1.3), an ihr entstehen die ersten Häuser
  const welt = erzeugeWelt();
  for (let x = 0; x < GRENZE[0]; x++) if (welt.typ[START_STRASSE * RASTER + x] === GRAS)
    S.geb.push({ id: S.naechste++, t: 'strasse', x, z: START_STRASSE, w: 0, prio: false, stufe: 1, bew: 0, status: [] });
  return S;
}

// ---------- Straßen (S1.3) ----------
export const START_STRASSE = 12;
export const OHNE_STRASSE = new Set(['strasse', 'brunnen', 'schrein']);
export const sklaven = S => S.geb.reduce((s, b) => s + (b.skl || 0), 0);   // brauchen keine Straße vor der Tür
const NACHBARN = [[1, 0], [-1, 0], [0, 1], [0, -1]];

export function strassenMaske(S) {
  const m = new Uint8Array(RASTER * TIEFE);
  for (const b of S.geb) if (b.t === 'strasse') m[b.z * RASTER + b.x] = 1;
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
  if (gesperrt(S, t)) return { ok: false, grund: sperrGrund(S, t) };
  const grund = pruefePlatz(S, welt, t, x, z);
  if (grund) return { ok: false, grund };
  const k = baukosten(S, t);
  if (!kannBezahlen(S, k)) return { ok: false, grund: 'Es fehlen ' + fehlendeKosten(S, k).join(', ') };
  for (const [g, n] of Object.entries(k)) S.gut[g] -= n;
  const b = { id: S.naechste++, t, x, z, w: 0, prio: false, stufe: 1, bew: 0, status: [], dreh: frontSeite(S, t, x, z) };
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

export const reichweite = (S, typ) => typ === 'brunnen' && hat(S, 'aquaedukt') ? 12 : GEB[typ].reichweite;
export function inReichweite(S, b, typ, maske) {
  const d = GEB[typ];
  if (!d.strassen) return S.geb.some(o => o.t === typ && abstand(o, b) <= reichweite(S, typ));
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
  if (!S.geb.some(o => o.t === 'schrein' && abstand(o, b) <= GEB.schrein.reichweite)) return 'Schrein in der Nähe';
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
    .concat(S.geb.filter(b => b.t === 'quartier' && b.skl > 0).map(h => ({ h, frei: h.skl, skl: true })));
  const alle = wohnorte.reduce((s, x) => s + x.frei, 0);
  const betriebe = S.geb.filter(b => GEB[b.t].arbeiter).sort((a, b) => (b.prio - a.prio) || (a.id - b.id));
  for (const b of betriebe) {
    const brauch = GEB[b.t].arbeiter, nah = wohnorte.filter(x => abstand(x.h, b) <= EINZUG && (!x.skl || GEB[b.t].sklaven));
    b.w = 0; b.von = []; b.einzug = nah.length;
    for (const x of nah.filter(x => x.frei > 0).sort((p, q) => (q.skl ? 1 : 0) - (p.skl ? 1 : 0) || abstand(p.h, b) - abstand(q.h, b))) {
      if (b.w >= brauch) break;
      const n = Math.min(x.frei, brauch - b.w); x.frei -= n; b.w += n; b.von.push([x.h.id, n]);
    }
  }
  S.letzte = { arbeitslos: wohnorte.filter(x => !x.skl).reduce((s, x) => s + x.frei, 0), sklavenFrei: wohnorte.filter(x => x.skl).reduce((s, x) => s + x.frei, 0), arbeiter: alle };
  S.letzte.unterhalt = unterhaltZahlen(S);

  // Produktion
  for (const b of S.geb) {
    const d = GEB[b.t]; b.status = [];
    if (b.brand > 0) { b.status.push({ art: 'brand', text: b.brand === 1 ? 'Es brennt!' : `Es brennt seit ${b.brand} Monaten!` }); continue; }
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
  for (const b of S.geb.filter(b => b.t === 'huette')) {
    haeuser++;
    const wasser = inReichweite(S, b, 'brunnen'), markt = inReichweite(S, b, 'markt', maske);
    if (wasser) wasserN++; if (markt) marktN++;
    if (b.brand > 0) continue;
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

  // Domus der Equites (Späte Republik): wachsen mit Brot, Wasser, Markt und Wein; trinken Wein, zahlen hohe Steuern
  let equites = 0;
  for (const b of S.geb.filter(b => b.t === 'domus')) {
    if (b.brand > 0) continue;
    const wasser = inReichweite(S, b, 'brunnen'), markt = inReichweite(S, b, 'markt', maske), wein = S.gut.wein >= Math.max(0.5, b.bew * 0.1);
    if (b.bew > 0) { if (wein) S.gut.wein -= b.bew * 0.1; else { b.status.push({ art: 'rohstoff', gut: 'wein', text: 'Kein Wein – die Equites ziehen weg' }); b.bew--; } }
    // Luxus (Späte Republik): Öl und Garum – je +25 % Steuern
    let lux = 1;
    for (const [g, n] of [['oel', 0.05], ['garum', 0.02]]) if (b.bew > 0 && S.gut[g] >= b.bew * n) { S.gut[g] -= b.bew * n; lux += 0.25; }
    b.lux = lux;
    const fehlt = !wasser ? 'Brunnen' : !markt ? 'Markt' : !S.versorgt.brot ? 'Brot' : !wein ? 'Wein' : '';
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
  const tempel = S.geb.filter(b => b.t === 'tempel' && b.w > 0);
  if (haeuser && tempel.length) ziel += 12 * S.geb.filter(h => h.t === 'huette' && tempel.some(o => abstand(o, h) <= GEB.tempel.reichweite)).length / haeuser;
  if (tempel.length && S.monat % 12 === 8) S.gunst = Math.min(100, gunst(S) + 2);
  if (S.geb.some(b => b.t === 'theater' && b.w > 0)) ziel += 8;
  if (haeuser && rang(S) >= INSULA.rang) {   // S3.3: Ordnung – Häuser ohne Wache in der Nähe
    const ohne = S.geb.filter(h => h.t === 'huette' && !wacheNah(S, h)).length;
    ziel -= FEUER.unruhe * ohne / haeuser;
  }   // S3.2: Furcht vor einem Sklavenaufstand
  const schreine = S.geb.filter(b => b.t === 'schrein');   // S3.1: Schreine in der Nähe
  if (haeuser && schreine.length) ziel += 10 * S.geb.filter(h => h.t === 'huette' && schreine.some(o => abstand(o, h) <= GEB.schrein.reichweite)).length / haeuser;
  S.stimmung += (Math.max(0, Math.min(100, ziel)) - S.stimmung) * 0.3;
  S.gut.denare += (einwohner(S) + equites * 3) * STEUER * (hat(S, 'steuerlisten') ? 1.2 : 1) * 1.1 * (S.stimmung / 70);   // ×1,1: Quästor   // Equites zahlen vierfach
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
  if (r > (S.rang || 0)) { S.rang = r; meld.push(`Cremona ist jetzt ${RAENGE[r].art} ${RAENGE[r].n}!`); }

  feuerMonat(S, meld);

  familieMonat(S, meld);

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
    meld.push('Hochwasser am Padus! ' + (nass.length ? `${nass.length === 1 ? 'Ein Betrieb steht' : nass.length + ' Betriebe stehen'} unter Wasser.` : 'Die Aue ist überflutet, aber kein Betrieb ist betroffen.'));
  }
  if (S.frieden > 0) S.frieden--;
  else if (m >= G.gallier.ab && m % 12 === G.gallier.monat && einwohner(S) >= G.gallier.einwohner && wurf(S, 1002) < G.gallier.chance) {
    if (hatKastell(S)) { meld.push('Gallier ziehen heran – die Besatzung des Kastells schlägt sie zurück.'); return; }
    const nord = betriebe.filter(f => f.r + f.q / 2 < 0.5);
    nord.forEach(f => stoeren(land[landKey(f)], 'gallier', G.gallier.monate));
    for (const g of ['getreide', 'holz']) S.gut[g] = (S.gut[g] || 0) * (1 - G.gallier.raub);
    S.stimmung = Math.max(0, S.stimmung - G.gallier.stimmung);
    meld.push(`Gallier fallen aus dem Norden ein! Sie rauben Getreide und Holz${nord.length ? ' und verwüsten ' + nord.length + ' Betriebe' : ''}. Ein Kastell auf den Hügeln hielte sie ab.`);
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
const aufschlag = S => hat(S, 'archiv') ? 0.08 : HANDEL.aufschlag;
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
export const abgabeBetrag = S => Math.round(ABGABE.grund + einwohner(S) * ABGABE.je);
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
  if (t === 'ziegelei' && hat(S, 'ziegelbrand')) m *= 1.5;
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
const eigenschaft = (F, e) => F.mitglieder.some(m => m.eig === e && (m.rolle === 'Oberhaupt' || m.rolle === 'Ehefrau'));
export const ansehenProMonat = S => { const F = familieS(S); return (0.3 + 0.35 * rang(S) + (gunst(S) >= 70 ? 0.4 : 0)) * (eigenschaft(F, 'Redner') ? 1.2 : 1); };
export const staerksterRivale = S => { familieS(S); return S.rivalen.reduce((a, r) => r.ansehen > a.ansehen ? r : a); };
export function amtFehlt(S) {
  const F = familieS(S), a = AEMTER[F.amt + 1]; if (!a) return 'Kein höheres Amt';
  if (a.bald) return 'Kommt mit der Kaiserzeit';
  const f = [];
  if (a.epoche && epoche(S) < a.epoche) f.push('Späte Republik');
  if (a.rang && rang(S) < a.rang) f.push(`Stadtrang ${RAENGE[a.rang].n}`);
  if (F.ansehen < a.ansehen) f.push(`Ansehen ${a.ansehen}`);
  const r = staerksterRivale(S); if (F.ansehen <= r.ansehen) f.push(`mehr Ansehen als die ${RIVALEN.find(x => x.gens === r.gens).n} (${Math.round(r.ansehen)})`);
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
  F.vermoegen += 1;   // kleines Landgut der Familie
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
    }
    const o = oberhaupt(F);
    if (o && o.alter >= 62 && wurf(S, 9001) < 0.2) {
      const erbe = F.mitglieder.filter(m => m.rolle === 'Sohn' && m.alter >= 16).sort((a, b) => b.alter - a.alter)[0];
      F.mitglieder = F.mitglieder.filter(m => m !== o);
      if (erbe) { erbe.rolle = 'Oberhaupt'; F.ansehen *= 0.8; meld.push(`${o.n} ist gestorben. ${erbe.n} führt nun die Familie.`); }
      else meld.push(`${o.n} ist gestorben. Ohne mündigen Sohn führt die Witwe die Familie.`);
    }
  }
}

