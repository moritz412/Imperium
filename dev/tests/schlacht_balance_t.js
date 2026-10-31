// Gleichgewicht der Echtzeitschlacht: mehrere Läufe je Szenario, beide Seiten greifen automatisch an (Haltung „angreifen“).
// Aufruf: node schlacht_balance_t.js [läufe=4] [port=8772] [szenario,szenario...|alle] [modus=ki,auto]
// Modus ki = beide Seiten mit der Computer-Führung (fairer Vergleich), auto = Seite 0 Haltung „angreifen“ (Spielerseite ohne Befehle: greift erst bei Feind < 45 m an), Seite 1 Computer, kk = beide Haltung „angreifen“ (steht still bis 45 m)   Server aus der Repo-Wurzel (python -m http.server 8772)
// Ausgabe je Szenario: Siege Rom/Gegner/Zeitgrenze, mittlere Verluste in % der Startstärke je Seite, mittlere Dauer. Software-Rendering, kein iPad.
const { chromium } = require('playwright');
const TEMPO = +process.env.TEMPO || 8;   // Zeitraffer (Regeln laufen in festen Schritten, das Ergebnis hängt nicht vom Tempo ab)
const LAEUFE = +process.argv[2] || 4, PORT = process.argv[3] || 8772, NUR = process.argv[4] && process.argv[4] !== 'alle' ? process.argv[4].split(',') : null, MODI = (process.argv[5] || 'ki,auto').split(',');
const R = (rolle, x, z, extra) => Object.assign({ volk: 'rom', kultur: 'latein', rolle, epoche: 0, x, z }, extra);
const L = (rolle, xs, z, extra) => xs.map(x => R(rolle, x, z, extra));
// Spiegelgefechte: gleiche Einheiten gegeneinander; Paare: je 3 Einheiten Rolle gegen Rolle
function spiegel(id, vorlage, anz) {
  const xs = anz === 3 ? [-30, 0, 30] : [-45, -15, 15, 45];
  return { id, n: id, seiten: ['A', 'B'], text: '', einheiten: [].concat(xs.map(x => Object.assign({}, vorlage, { s: 0, x, z: -60 })), xs.map(x => Object.assign({}, vorlage, { s: 1, x, z: 60 }))) };
}
function paar(id, a, b, anz) {
  const xs = anz === 3 ? [-30, 0, 30] : [-45, -15, 15, 45];
  return { id, n: id, seiten: ['A', 'B'], text: '', einheiten: [].concat(xs.map(x => Object.assign({}, a, { s: 0, x, z: -60 })), xs.map(x => Object.assign({}, b, { s: 1, x, z: 60 }))) };
}
const tausch = g => Object.assign({}, g, { id: g.id + '_tausch', n: g.id + '_tausch', einheiten: g.einheiten.map(e => Object.assign({}, e, { z: -e.z })) });   // Seiten tauschen die Plätze: Seitenvorteil nach Platz oder nach Nummer?
const ROM_S = { volk: 'rom', kultur: 'latein', rolle: 'sword', epoche: 0 }, ROM_SP = { volk: 'rom', kultur: 'latein', rolle: 'spear', epoche: 0 };
const LIB = { volk: 'karthago', kultur: 'punisch', rolle: 'spear', variante: 'libyer', epoche: 0 }, KEL = { volk: 'arverner', kultur: 'keltisch', rolle: 'sword', variante: 'langschw', epoche: 0 };
const PHA = { volk: 'makedonien', kultur: 'griechisch', rolle: 'spear', variante: 'phalanx', epoche: 0 }, HOP = { volk: 'makedonien', kultur: 'griechisch', rolle: 'spear', variante: 'hoplit', epoche: 0 };
const SZ = [
  { id: 'karthago' }, { id: 'makedonien' }, { id: 'kelten' },
  { g: spiegel('sp_hastati', ROM_S, 4) }, { g: tausch(spiegel('sp_hastati', ROM_S, 4)) }, { g: spiegel('sp_libyer', LIB, 4) }, { g: spiegel('sp_kelten', KEL, 4) },
  { g: paar('p_hastati_libyer', ROM_S, LIB, 4) }, { g: paar('p_hastati_kelten', ROM_S, KEL, 4) }, { g: paar('p_hastati_phalanx', ROM_S, PHA, 4) },
  { g: paar('p_hastati_hoplit', ROM_S, HOP, 4) }, { g: paar('p_hastati_triarier', ROM_S, ROM_SP, 4) },
].filter(s => !NUR || NUR.includes(s.id || s.g.id));
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 640, height: 400 } }); const fehler = [];
  p.on('pageerror', e => fehler.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/404|Failed to load resource/.test(m.text())) fehler.push(m.text()); });
  await p.goto(`http://localhost:${PORT}/dev/proto/${process.env.SEITE || 'schlacht_spiel.html'}?g=niedrig`);
  await p.waitForFunction(() => window.SCHLACHT && SCHLACHT.phase === 'aufstellung', null, { timeout: 180000 });
  const alle = [];
  for (const sz of SZ) for (const modus of MODI) {
    const id = sz.id || sz.g.id;
    await p.evaluate(g => { try { SCHLACHT.neu(); } catch (e) {} return SCHLACHT.gefecht(g); }, sz.g || sz.id);
    await p.waitForFunction(() => SCHLACHT.phase === 'aufstellung' && SCHLACHT.units.length > 0, null, { timeout: 180000 });
    await p.waitForTimeout(800);
    const res = [];
    for (let l = 0; l < LAEUFE; l++) {
      if (l > 0) { await p.evaluate(() => SCHLACHT.neu()); await p.waitForTimeout(300); }
      const st = await p.evaluate(m => { const U = SCHLACHT.units; SCHLACHT.kiSeiten(m === 'ki', m !== 'kk'); U.forEach(u => SCHLACHT.haltung(u.i, 'angreifen')); return U.map(u => [u.side, u.np]); }, modus);
      const n0 = [0, 0]; st.forEach(([s, n]) => n0[s] += n);
      await p.evaluate(t => { SCHLACHT.start(); SCHLACHT.tempo(t); }, TEMPO);
      await p.waitForFunction(() => SCHLACHT.phase === 'ende' || SCHLACHT.schlachtZeit > 600, null, { timeout: 900000, polling: 500 });
      const e = await p.evaluate(() => { const U = SCHLACHT.units, r = [0, 0]; U.forEach(u => { if (u.state !== 'weg') r[u.side] += u.strength; }); const g0 = r[0], g1 = r[1], erg = SCHLACHT.ergebnis || (g0 > g1 * 1.05 ? 'sieg' : g1 > g0 * 1.05 ? 'niederlage' : null);   // nach 600 s wie im Spiel: wer 5 % mehr Soldaten hat, gewinnt, sonst offen
        return { erg, t: SCHLACHT.schlachtZeit, ueb: r, gef: SCHLACHT.gefallen }; });
      res.push({ n0, e });
    }
    const sieg = res.filter(r => r.e.erg === 'sieg').length, nied = res.filter(r => r.e.erg === 'niederlage').length, rest = res.length - sieg - nied;
    const mv = s => Math.round(res.reduce((a, r) => a + r.e.gef[s] / r.n0[s], 0) / res.length * 100);
    const dauer = Math.round(res.reduce((a, r) => a + r.e.t, 0) / res.length);
    console.log(`${(id + " " + modus).padEnd(26)} Siege Seite0/Seite1/offen ${sieg}/${nied}/${rest} von ${res.length} | Gefallene Seite0 ${mv(0)}% Seite1 ${mv(1)}% der Startfiguren | Dauer ${dauer} s | Start ${res[0].n0.join(' gegen ')} Mann`);
    alle.push({ id, sieg, nied, rest });
  }
  console.log('FEHLER', fehler.length ? fehler.join(' | ') : 'keine');
  await b.close();
})();
