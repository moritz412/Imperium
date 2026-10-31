// Gelände aus der Provinz (I6): lädt die Testseite mit ?gel=..&klima=..&saat=.., prüft Seitenfehler, Begehbarkeit der Kampfebene, macht ein Bild.
// Aufruf: node schlacht_gelaende_t.js [port]
const { chromium } = require('playwright');
const PORT = process.argv[2] || 8772;
const FAELLE = [['plain', 'mittelmeer', 3], ['rough', 'steppe', 5], ['plain', 'wueste', 7], ['rough', 'wald', 11], ['plain', 'schnee', 13], ['mountain', 'mittelmeer', 17]];
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  let bad = 0;
  for (const [gel, klima, saat] of FAELLE) {
    const p = await b.newPage({ viewport: { width: 1194, height: 834 } });
    const fehler = [];
    p.on('pageerror', e => fehler.push(String(e))); p.on('console', m => { if (m.type() === 'error') fehler.push(m.text()); });
    p.on('response', r => { if (r.status() >= 400 && !/favicon/.test(r.url())) fehler.push(r.status() + ' ' + r.url()); });
    await p.goto(`http://localhost:${PORT}/dev/proto/schlacht_spiel.html?g=niedrig&gel=${gel}&klima=${klima}&saat=${saat}`);
    await p.waitForFunction(() => window.SCHLACHT && SCHLACHT.phase === 'aufstellung', null, { timeout: 180000 });
    await p.evaluate(() => SCHLACHT.kamera(Math.PI, 0.42, 300, 0, -10)); await p.waitForTimeout(2500);
    const r = await p.evaluate(() => {
      let mn = 1e9, mx = -1e9, maxSt = 0, ymn = 1e9, ymx = -1e9;
      for (let x = -120; x <= 120; x += 4) for (let z = -100; z <= 100; z += 4) {
        const h = SCHLACHT.hoehe(x, z); mn = Math.min(mn, h); mx = Math.max(mx, h);
        const st = Math.hypot(SCHLACHT.hoehe(x + 2, z) - SCHLACHT.hoehe(x - 2, z), SCHLACHT.hoehe(x, z + 2) - SCHLACHT.hoehe(x, z - 2)) / 4; maxSt = Math.max(maxSt, st);
      }
      for (let x = -320; x <= 320; x += 8) for (let z = -260; z <= 260; z += 8) { const h = SCHLACHT.hoehe(x, z); ymn = Math.min(ymn, h); ymx = Math.max(ymx, h); }
      const u = SCHLACHT.einheiten ? SCHLACHT.einheiten.length : -1;
      return { mn, mx, maxSt, ymn, ymx, gel: SCHLACHT.gelaende, u };
    });
    const spanne = r.mx - r.mn, grenze = gel === 'plain' ? 5 : 8;
    const ok = fehler.length === 0 && spanne <= grenze && r.maxSt <= 0.35 && r.gel.klima === klima && r.gel.typ === gel;
    if (!ok) bad++;
    console.log((ok ? 'ok   ' : 'FAIL ') + `${gel}/${klima}/${saat} ebene ${r.mn.toFixed(1)}..${r.mx.toFixed(1)} (Spanne ${spanne.toFixed(1)}, Grenze ${grenze}), max. Steigung ${r.maxSt.toFixed(2)}, gesamt ${r.ymn.toFixed(1)}..${r.ymx.toFixed(1)}`, fehler.length ? fehler.slice(0, 4) : '');
    if (gel !== 'mountain' || klima === 'mittelmeer') await p.screenshot({ path: `shot/gel_${gel}_${klima}.png` });
    await p.close();
  }
  await b.close();
  console.log(bad ? 'GELAENDE FAIL ' + bad : 'GELAENDE OK');
  process.exit(bad ? 1 : 0);
})();
