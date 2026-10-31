// Frühmittelalter-Figuren (31.10., F4): Gefecht Franken gegen Ostrom mit den neuen Paketen M1_*/M3_*, prüft Pakete, Seitenfehler, Ablauf; Bilder shot/m1_*.png
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1194, height: 834 } }); const err = [];
  p.on('pageerror', e => err.push(String(e))); p.on('console', m => { if (m.type() === 'error') err.push(m.text()); });
  p.on('response', r => { if (r.status() >= 400) err.push(r.status() + ' ' + r.url()); });
  await p.goto('http://localhost:8772/dev/proto/schlacht_spiel.html?g=hoch');
  await p.waitForFunction(() => window.SCHLACHT && SCHLACHT.phase === 'aufstellung', null, { timeout: 180000 });
  const EP = +(process.env.EP || 1); const E = (s, kultur, rolle, x, z) => ({ s, volk: s ? 'byzanz' : 'franken', kultur, rolle, epoche: EP, x, z });
  const g = { id: 'm1', n: 'Franken gegen Ostrom', seiten: ['Franken', 'Ostrom'], text: 'Test', einheiten: [
    E(0, 'germanisch', 'spear', -30, -60), E(0, 'germanisch', 'spear', 30, -60), E(0, 'germanisch', 'sword', 0, -72), E(0, 'germanisch', 'missile', 0, -40), E(0, 'germanisch', 'cav', 70, -66),
    E(1, 'griechisch', 'spear', -30, 60), E(1, 'griechisch', 'spear', 30, 60), E(1, 'griechisch', 'sword', 0, 72), E(1, 'griechisch', 'missile', 0, 40), E(1, 'griechisch', 'cav', -70, 66)] };
  await p.evaluate(g => SCHLACHT.gefecht(g), g);
  await p.waitForFunction(() => SCHLACHT.phase === 'aufstellung' && SCHLACHT.aktuellesGefecht === 'm1', null, { timeout: 180000 });
  const pk = await p.evaluate(() => SCHLACHT.units.map(u => u.ein.paket + (u.ein.paketGenau ? '' : '*')));
  console.log('PAKETE', pk.join(' '));
  for (const [n, nm] of [[0, 'franken'], [5, 'ostrom'], [9, 'kataphrakt']]) {
    await p.evaluate(n => { const u = SCHLACHT.units[n]; SCHLACHT.kamera(u.f + Math.PI, 0.16, 11, u.cx, u.cz); }, n);
    await p.waitForTimeout(1500); await p.screenshot({ path: `shot/m${EP}_${nm}.png` });
  }
  await p.evaluate(() => { SCHLACHT.start(); SCHLACHT.tempo(30); for (const u of SCHLACHT.units) if (u.side === 0) SCHLACHT.haltung(u.i, 'angreifen'); });
  await p.waitForFunction(() => SCHLACHT.phase === 'ende', null, { timeout: 400000 });
  const ok = pk.every(x => (EP === 2 ? /^(M2|M3)_/ : /^(M1|M3)_/).test(x) && !x.endsWith('*'));
  console.log(ok && !err.length ? 'M1 OK' : 'M1 FEHLER', err.slice(0, 3));
  await b.close();
})().catch(e => { console.error('ABBRUCH', e.message); process.exit(1); });
