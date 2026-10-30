// E2: Gefecht Makedonien mit Phalangiten, Hopliten, Bogenschützen (Pfeile); Kelten mit Plänklern. Aufruf: node schlacht_e2_t.js [port]
const { chromium } = require('playwright');
const PORT = process.argv[2] || 8772;
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1194, height: 834 } }); const fehler = [];
  p.on('pageerror', e => fehler.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/404|Failed to load resource/.test(m.text())) fehler.push(m.text()); });
  await p.goto(`http://localhost:${PORT}/dev/proto/schlacht_spiel.html?g=mittel`);
  await p.waitForFunction(() => window.SCHLACHT && SCHLACHT.phase === 'aufstellung', null, { timeout: 120000 });
  await p.evaluate(() => SCHLACHT.gefecht('makedonien'));
  await p.waitForFunction(() => SCHLACHT.phase === 'aufstellung' && SCHLACHT.units.length > 0, null, { timeout: 120000 });
  await p.waitForTimeout(2500);
  const roster = await p.evaluate(() => SCHLACHT.units.map(u => u.name + ':' + (u.ein ? u.ein.paket + (u.ein.paketGenau ? '' : '*') : '?')).join(' | '));
  await p.evaluate(() => { SCHLACHT.start(); SCHLACHT.tempo(2); });
  console.log(roster); await p.waitForTimeout(40000); console.log('NACH40', JSON.stringify(await p.evaluate(() => ({ g: SCHLACHT.geschosse, b: SCHLACHT.units.filter(u => u.def.fern).map(u => u.name + ':' + u.state + ':' + u.def.fern.typ + ':' + (u.mun ?? '?')) }))));
  await p.evaluate(() => { SCHLACHT.tempo(1); const u = SCHLACHT.units.find(u => /Phalanx|phalanx/.test(u.name)); SCHLACHT.kamera(Math.PI * 0.2, 0.18, 14, u.cx, u.cz - 4); });
  await p.waitForTimeout(1200); await p.screenshot({ path: 'shot/e2_phalanx.png' });
  await p.evaluate(() => { const u = SCHLACHT.units.find(u => /Bogen/.test(u.name)); SCHLACHT.kamera(Math.PI * 0.2, 0.25, 22, u.cx, u.cz - 6); });
  await p.waitForTimeout(1500); await p.screenshot({ path: 'shot/e2_bogen.png' });
  const g = await p.evaluate(() => SCHLACHT.geschosse);
  console.log(roster); console.log(JSON.stringify(g), 'Fehler:', fehler.length ? fehler.slice(0, 3) : 'keine');
  await b.close();
})().catch(e => { console.error('ABBRUCH', e.message); process.exit(1); });
