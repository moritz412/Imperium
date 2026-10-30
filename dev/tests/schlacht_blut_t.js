// Testschlacht: Durchlauf mit Blut, Leichen als kein Hindernis, Konsolenfehler. Aufruf: node schlacht_blut_t.js [port]
const { chromium } = require('playwright');
const PORT = process.argv[2] || 8772;
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1194, height: 834 } });
  const fehler = [];
  p.on('pageerror', e => fehler.push(String(e)));
  p.on('console', m => { if (m.type() === 'error') fehler.push(m.text()); });
  await p.goto(`http://localhost:${PORT}/dev/proto/schlacht_spiel.html?g=mittel`);
  await p.waitForFunction(() => window.SCHLACHT && SCHLACHT.phase === 'aufstellung', null, { timeout: 120000 });
  await p.evaluate(() => { SCHLACHT.start(); SCHLACHT.tempo(3); SCHLACHT.units.forEach((u, i) => { if (u.side === 0) SCHLACHT.angriff(i, i === 0 ? 4 : i === 1 ? 5 : 6); }); });
  await p.waitForFunction(() => SCHLACHT.zaehler.kills >= 25, null, { timeout: 180000 });
  const r = await p.evaluate(() => {
    const u = SCHLACHT.units[1]; SCHLACHT.tempo(1); SCHLACHT.kamera(Math.PI * 0.78, 0.35, 12, u.cx, u.cz + 1);
    return { kills: SCHLACHT.zaehler.kills, treffer: SCHLACHT.zaehler.treffer, blut: typeof bHead !== 'undefined' ? bHead : -1 };
  });
  await p.waitForTimeout(1500);
  await p.screenshot({ path: 'shot/schlacht_blut.png' });
  await p.evaluate(() => { const u = SCHLACHT.units[1]; SCHLACHT.kamera(Math.PI * 0.78, 0.08, 6, u.cx + 6, u.cz - 8); });
  await p.waitForTimeout(800);
  await p.screenshot({ path: 'shot/schlacht_wiese.png' });
  await p.evaluate(() => { const u = SCHLACHT.units[1], f = SCHLACHT.units[u.foeU] || u; SCHLACHT.kamera(Math.PI * 0.8, 1.15, 13, (u.cx + f.cx) / 2, (u.cz + f.cz) / 2); });
  await p.waitForTimeout(800);
  await p.screenshot({ path: 'shot/schlacht_blut_oben.png' });
  console.log(JSON.stringify(r), 'Fehler:', fehler.length ? fehler : 'keine');
  await b.close();
})().catch(e => { console.error('ABBRUCH', e.message); process.exit(1); });
