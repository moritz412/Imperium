// Aufruf: Ordner mit Kopien von ../js/sim.js und ../js/daten.js plus package.json {"type":"module"}, dann `node balance_spieler.js [Jahre] [ereignisse]`.
// Balance-Spieler (1.11.): baut nach Bedarf, sobald bezahlbar. Kennzahlen je Jahr, Meilensteine in Spielminuten (15 s/Monat).
import * as sim from './sim.js';
import { GEB, ESSEN_JE_MONAT, MONAT_S } from './daten.js';
const JAHRE = +(process.argv[2] || 10);
const welt = sim.erzeugeWelt(), S = sim.neuesSpiel(); S.ereignisseAus = process.argv[3] !== 'ereignisse';
const anz = t => S.geb.filter(b => b.t === t).length;
const MITTE = [20, 12];
function platz(t, bed = () => true) {
  let best = null, bd = 1e9;
  for (let z = 0; z < 38; z++) for (let x = 0; x < sim.stadtGrenze(S); x++) {
    const d = Math.hypot(x - MITTE[0], z - MITTE[1]); if (d >= bd) continue;
    if (!sim.pruefePlatz(S, welt, t, x, z) && bed(x, z)) { best = [x, z]; bd = d; }
  }
  return best;
}
const bau = (t, bed) => { if (!sim.kannBezahlen(S, sim.baukosten(S, t))) return false; const p = platz(t, bed); if (!p) return false; return sim.bauen(S, welt, t, p[0], p[1]).ok; };
// Straßenraster nach und nach: Querstraßen alle 5 Felder, Längsstraßen alle 8
const strassenPlan = [];
for (const z of [7, 17, 22, 27, 32]) for (let x = 4; x < 64; x++) strassenPlan.push([x, z]);
for (const x of [8, 16, 24, 32, 40, 48, 56]) for (let z = 3; z < 34; z++) strassenPlan.push([x, z]);
strassenPlan.sort((a, b) => Math.hypot(a[0] - MITTE[0], a[1] - MITTE[1]) - Math.hypot(b[0] - MITTE[0], b[1] - MITTE[1]));
const meile = {}; const merk = (n, ok) => { if (ok && meile[n] === undefined) meile[n] = S.monat; };
const zeilen = [];
for (let m = 0; m < JAHRE * 12; m++) {
  // Straßen (bis 8 je Monat, wenn Geld da)
  let n = 0; while (strassenPlan.length && n < 4 && S.gut.denare > 120) { const [x, z] = strassenPlan.shift(); if (sim.bauen(S, welt, 'strasse', x, z).ok) n++; }
  const bew = sim.einwohner(S), essen = bew * ESSEN_JE_MONAT, vorrat = S.gut.getreide + S.gut.brot + (S.gut.fisch || 0);
  const haeuser = S.geb.filter(b => b.t === 'huette'), voll = haeuser.every(h => h.bew >= sim.wohnraum(h) - 1);
  let gebaut = 0; const versuch = (t, bed) => { if (gebaut < 3 && bau(t, bed)) gebaut++; };
  if (anz('holzfaeller') < 1 || (S.gut.holz < 40 && anz('holzfaeller') < 1 + Math.floor(bew / 30))) versuch('holzfaeller', (x, z) => sim.waldNah(welt, { t: 'holzfaeller', x, z }));
  if (anz('feld') < 1 + Math.floor(bew / 25) || vorrat < essen * 4) versuch('feld');
  if (voll && S.stimmung >= 45) versuch('huette');
  if (anz('feld') >= 2 && anz('muehle') < Math.ceil(anz('feld') / 3)) versuch('muehle');
  if (anz('muehle') > anz('baeckerei')) versuch('baeckerei');
  if (!S.versorgt.brot && anz('muehle') <= anz('baeckerei') && S.gut.getreide > 40) versuch('muehle');   // Brot fehlt: Kette verlängern
  if (anz('lehmgrube') < 1 + Math.floor(bew / 80)) versuch('lehmgrube');
  if (anz('ziegelei') < anz('lehmgrube')) versuch('ziegelei');
  { const ohne = haeuser.find(h => !sim.inReichweite(S, h, 'brunnen'));   // Brunnen neben das unversorgte Haus (vorher: nahe der Mitte → viel zu viele)
    if (ohne) versuch('brunnen', (x, z) => Math.abs(x - ohne.x) + Math.abs(z - ohne.z) <= 3); }
  { const ohne = haeuser.length >= 3 && haeuser.find(h => !sim.inReichweite(S, h, 'markt'));
    if (ohne && anz('markt') < 1 + Math.floor(haeuser.length / 8)) versuch('markt', (x, z) => Math.abs(x - ohne.x) + Math.abs(z - ohne.z) <= 16); }
  if (sim.rang(S) >= 1 && anz('ludus') < 1) versuch('ludus');
  if (S.monat >= 20 && anz('wache') < 1 + Math.floor(haeuser.length / 12)) versuch('wache');
  if (haeuser.length >= 8 && anz('latrine') < Math.floor(haeuser.length / 8)) versuch('latrine');
  if (haeuser.length >= 6 && anz('schrein') < 1 && sim.hat(S, 'schreine')) versuch('schrein');
  { const fern = S.geb.find(b => (b.status || []).some(x => x.art === 'lager'));   // Lager-Regel (1.11.): Speicher dorthin, wo Waren liegen bleiben
    if (fern) versuch((fern.status.find(x => x.art === 'lager').text.includes('Kornspeicher')) ? 'horreum' : 'speicher', (x, z) => Math.abs(x - fern.x) + Math.abs(z - fern.z) <= 10); else if (anz('speicher') < 1 && haeuser.length >= 6) versuch('speicher'); }
  if (sim.rang(S) >= 2 && anz('basilika') < 1) versuch('basilika');   // Wahrzeichen (1.11.: Weg in die Kaiserzeit)
  if (sim.epoche(S) >= 2 && sim.hat(S, 'tempel') && anz('tempel') < 1) versuch('tempel');
  if (sim.epoche(S) >= 3 && sim.hat(S, 'kaiserkult') && anz('augusteum') < 1) versuch('augusteum');
  if (sim.epoche(S) >= 3 && sim.hat(S, 'amphitheater') && anz('amphitheater') < 1) versuch('amphitheater');
  // Umland: ab 150 Denaren Acker/Wald neben vermessenem Land vermessen, Betrieb + Weg
  if (S.gut.denare > 150) {
    const k = sim.regionKarte().filter(f => sim.kannVermessen(S, f) && ['acker', 'wald', 'lehm', 'fluss', 'stein'].includes(f.typ)).sort((a, b) => sim.hexAbstand(a, { q: 0, r: 0 }) - sim.hexAbstand(b, { q: 0, r: 0 }))[0];
    if (k) sim.vermessen(S, k);
  }
  for (const f of sim.regionKarte()) { const st = sim.landStand(S, f);
    if (st === 'vermessen' && sim.betriebFuer(f) && f.typ !== 'fluss') sim.landBauen(S, f);
    if ((st === 'betrieb' || st === 'vermessen') && !sim.hatWeg(S, f)) sim.wegAnlegen(S, f); }
  // Forschung, Epoche, Familie
  if (!sim.forschungS(S).ziel) for (const id of ['fruchtwechsel', 'ziegelbrand', 'steuerlisten', 'schotter', 'landvermessung', 'schreine', 'bauhuette', 'toepferscheibe', 'feste', 'villa', 'weinbau', 'roemerstrasse', 'aquaedukt', 'archiv', 'olivenpresse', 'tempel', 'zoelle', 'municipium', 'beton', 'kaiserkult', 'amphitheater', 'macellum', 'villenwirtschaft']) if (sim.forschungWaehlen(S, id).ok) break;
  sim.epocheWechseln(S); sim.kandidieren(S);
  const meld = sim.monat(S, welt);
  if (S.ereignis) sim.ereignisWaehlen(S, 1) .ok || sim.ereignisWaehlen(S, 0).ok || sim.ereignisWaehlen(S, 2);
  meld.filter(t => /abgebrannt|Seuche|gestorben|hungern|Gallier fallen|ist jetzt|gewählt|Republik|Kaiserzeit|fertig/.test(t)).forEach(t => zeilen.push(`  M${S.monat} ${t}`));
  merk('Dorf', sim.rang(S) >= 1); merk('Kleinstadt', sim.rang(S) >= 2); merk('Kolonie', sim.rang(S) >= 3); merk('Späte Republik', S.epoche >= 2); merk('Basilika', S.geb.some(b => b.t === 'basilika' && !(b.bau > 0))); merk('Kaiserzeit', S.epoche >= 3); merk('Amphitheater', S.geb.some(b => b.t === 'amphitheater' && !(b.bau > 0))); merk('Ädil', (S.familie || {}).amt >= 1);
  if (S.monat % 12 === 2) zeilen.push(`Jahr ${Math.floor(S.monat / 12)}: Einw ${sim.einwohner(S)}, Häuser ${anz('huette')}, Felder ${anz('feld')}, Denare ${Math.round(S.gut.denare)}, Holz ${Math.round(S.gut.holz)}, Ziegel ${Math.round(S.gut.ziegel)}, Getreide ${Math.round(S.gut.getreide)}, Brot ${Math.round(S.gut.brot)}, Stimmung ${Math.round(S.stimmung)}, Umland ${Object.keys(S.land).length}, Forschung ${sim.forschungS(S).fertig.length}, Ansehen ${Math.round(sim.familieS(S).ansehen)}`);
}
console.log(zeilen.join('\n'));
console.log('Meilensteine:', Object.entries(meile).map(([k, v]) => `${k} Monat ${v} (${Math.round(v * MONAT_S / 60)} min)`).join(', '));
