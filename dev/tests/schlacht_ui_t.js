// Testschlacht: Oberfläche und Fernkampf ansehen (Aufstellung, Gefecht mit Geschossen, Endtafel). Aufruf: node schlacht_ui_t.js [port]
const { chromium } = require('playwright');
const PORT = process.argv[2] || 8772;
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1194, height: 834 } });
  const fehler = [];
  p.on('pageerror', e => fehler.push(String(e))); p.on('console', m => { if (m.type() === 'error') fehler.push(m.text()); });
  await p.goto(`http://localhost:${PORT}/dev/proto/schlacht_spiel.html?g=mittel`);
  await p.waitForFunction(() => window.SCHLACHT && SCHLACHT.phase === 'aufstellung', null, { timeout: 120000 });
  await p.waitForTimeout(1500); await p.screenshot({ path: 'shot/ui_aufstellung.png' });
  await p.evaluate(() => { SCHLACHT.start(); SCHLACHT.tempo(2); });
  await p.waitForFunction(() => (SCHLACHT.geschosse && SCHLACHT.geschosse.gesamt > 40), null, { timeout: 120000 });
  await p.evaluate(() => { SCHLACHT.tempo(1); const u = SCHLACHT.units.find(u => /Velit/.test(u.name)) || SCHLACHT.units[0]; SCHLACHT.kamera(Math.PI * 0.85, 0.3, 40, u.cx, u.cz + 25); });
  await p.waitForTimeout(1200); await p.screenshot({ path: 'shot/ui_fernkampf.png' });
  const r = await p.evaluate(() => ({ g: SCHLACHT.geschosse, kills: SCHLACHT.zaehler.kills }));
  console.log(JSON.stringify(r), 'Fehler:', fehler.length ? fehler.slice(0, 3) : 'keine');
  await b.close();
})().catch(e => { console.error('ABBRUCH', e.message); process.exit(1); });
