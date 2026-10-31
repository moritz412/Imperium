// Fluss mit Furten in der neuen Echtzeitschlacht: lädt ?fluss=1, startet die Schlacht (Tempo hoch), prüft in ~300 s Spielzeit
// (a) keine Seitenfehler, (b) Einheiten beider Seiten queren den Fluss (über Furten) oder kämpfen in der Furt,
// (c) kein lebender Soldat im Tiefwasser außerhalb der Furten. Bilder: shot/fluss_aufstellung.png, shot/fluss_furt.png
// Aufruf: node schlacht_fluss_t.js [port=8772]   Server aus der Repo-Wurzel (python -m http.server 8772)
const { chromium } = require('playwright');
const PORT = process.argv[2] || 8772;
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1194, height: 834 } }); const fehler = [];
  p.on('pageerror', e => fehler.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/404|Failed to load resource/.test(m.text())) fehler.push(m.text()); });
  await p.goto(`http://localhost:${PORT}/dev/proto/schlacht_spiel.html?g=niedrig&fluss=1`);
  await p.waitForFunction(() => window.SCHLACHT && SCHLACHT.phase === 'aufstellung' && SCHLACHT.units.length > 0, null, { timeout: 180000 });
  await p.waitForTimeout(1500);
  const gel = await p.evaluate(() => SCHLACHT.gelaende);
  console.log('Gelände', JSON.stringify(gel));
  // Bild 1: Aufstellung von schräg oben
  await p.evaluate(() => { const z = SCHLACHT.fluss.zAt(0); SCHLACHT.kamera(0.6, 0.62, 230, 0, z); });
  await p.waitForTimeout(2500);
  await p.screenshot({ path: 'shot/fluss_aufstellung.png' });
  await p.evaluate(() => {
    const F = SCHLACHT.fluss, NS = SCHLACHT.units.length * 60;
    const W = window.__f = { t0: 0, seite: new Map(), gequert: [new Set(), new Set()], wasserMax: 0, wasserZeit: 0, furtKampf: 0, furtSteher: 0, furtBild: null, last: 0 };
    window.__lauf = async (bisZeit, stopBeiKampf) => {
      if (!W.t0) { SCHLACHT.start(); SCHLACHT.tempo(6); W.t0 = W.last = SCHLACHT.zeit;
        const U = SCHLACHT.units;   // Spielerseite rückt vor: jede Einheit greift die nächste feindliche an (Fernkämpfer bleiben)
        for (const u of U) if (u.side === 0 && !u.fern) { let b = null, bd = 1e9; for (const v of U) if (v.side === 1) { const d = Math.hypot(v.cx - u.cx, v.cz - u.cz); if (d < bd) { bd = d; b = v; } } if (b) SCHLACHT.angriff(u.i, b.i); } }
      while (SCHLACHT.zeit - W.t0 < bisZeit && SCHLACHT.phase === 'schlacht') {
        await new Promise(r => setTimeout(r, 150));
        const dt = SCHLACHT.zeit - W.last; W.last = SCHLACHT.zeit; let tief = 0;
        for (let k = 0; k < NS; k++) {
          const q = SCHLACHT.soldat(k); if (!q || q.st > 3) continue;
          const rz = F.zAt(q.x), sv = q.z > rz ? 1 : -1, sd = SCHLACHT.units[q.unit].side;
          if (!W.seite.has(k)) W.seite.set(k, sv);
          else if (W.seite.get(k) !== sv && Math.abs(q.z - rz) > 7) { W.seite.set(k, sv); W.gequert[sd].add(k); }
          if (F.tief(q.x, q.z)) tief++;
          if (F.furt(q.x, q.z)) { W.furtSteher++; if (q.foe >= 0 && q.st === 1) { W.furtKampf++; if (!W.furtBild) W.furtBild = [q.x, q.z]; } }
        }
        if (tief > W.wasserMax) W.wasserMax = tief;
        if (tief > 0) W.wasserZeit += dt;
        if (stopBeiKampf && W.furtBild) { SCHLACHT.tempo(1); SCHLACHT.kamera(0.5, 0.5, 60, W.furtBild[0], W.furtBild[1]); return 'furt'; }
      }
      return 'ende';
    };
  });
  const a1 = await p.evaluate(() => window.__lauf(300, true));
  console.log('Phase 1:', a1);
  if (a1 === 'furt') { await p.waitForTimeout(1800); await p.screenshot({ path: 'shot/fluss_furt.png' }); await p.evaluate(() => { SCHLACHT.tempo(6); }); }
  await p.evaluate(() => window.__lauf(300, false));
  const r = await p.evaluate(() => { const W = window.__f; return { querte: [W.gequert[0].size, W.gequert[1].size], wasserMax: W.wasserMax, wasserZeit: +W.wasserZeit.toFixed(1), furtKampf: W.furtKampf, furtSteher: W.furtSteher, furtBild: W.furtBild, dauer: Math.round(SCHLACHT.zeit - W.t0), phase: SCHLACHT.phase, gefallen: SCHLACHT.gefallen }; });
  console.log(JSON.stringify(r));
  const ok = fehler.length === 0 && gel.fluss && r.wasserMax === 0 && (r.querte[0] > 0 || r.furtKampf > 0) && (r.querte[1] > 0 || r.furtKampf > 0);
  console.log(fehler.length ? 'Fehler: ' + fehler.slice(0, 5).join(' | ') : 'keine Seitenfehler');
  console.log(ok ? 'FLUSS OK' : 'FLUSS FAIL');
  await b.close();
  process.exit(ok ? 0 : 1);
})();
