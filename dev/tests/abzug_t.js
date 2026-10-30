// Abzug aus dem Nahkampf: Marschbefehl an eine kämpfende Fuß- und Reitereinheit, danach muss sie sich lösen und das Ziel erreichen.
// Aufruf: node abzug_t.js [port]
const { chromium } = require('playwright');
const PORT = process.argv[2] || 8772;
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1194, height: 834 } }); const fehler = [];
  p.on('pageerror', e => fehler.push(String(e)));
  await p.goto(`http://localhost:${PORT}/dev/proto/schlacht_spiel.html?g=niedrig`);
  await p.waitForFunction(() => window.SCHLACHT && SCHLACHT.phase === 'aufstellung' && SCHLACHT.units.length > 0, null, { timeout: 120000 });
  await p.evaluate(() => { SCHLACHT.start(); SCHLACHT.tempo(3); });
  const ziele = {};
  for (let t = 0; t < 90; t += 2) {
    await p.waitForTimeout(2000);
    const r = await p.evaluate(z => {
      const out = [];
      for (const u of SCHLACHT.units) {
        if (u.side !== 0 || u.state === 'flieht') continue;
        if (u.fern) continue; const art = u.def.reit ? 'reiter' : 'fuss';
        if (!z[art] && u.engaged) { z[art] = { i: u.i, x: u.cx, z: u.cz - 45 }; SCHLACHT.befehl(u.i, u.cx, u.cz - 45, true); }
      }
      for (const k in z) { const u = SCHLACHT.units[z[k].i]; out.push([k, u.name, u.state, u.engaged, u.abzug, Math.round(Math.hypot(u.cx - z[k].x, u.cz - z[k].z)), u.strength]); }
      return { z, out };
    }, ziele);
    Object.assign(ziele, r.z);
    if (r.out.length) console.log(t, JSON.stringify(r.out));
    if (Object.keys(ziele).length === 2 && t > 40) break;
  }
  console.log('Fehler:', fehler.length ? fehler.slice(0, 3) : 'keine'); await b.close();
})().catch(e => { console.error('ABBRUCH', e.message); process.exit(1); });
