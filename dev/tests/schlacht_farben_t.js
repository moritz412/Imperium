// Farben je Volk (F2, 31.10.): Nahbilder Rom/Kelten/Karthago nach shot/farbe_*.png, prüft keine Seiten-/Shaderfehler. Aufruf: node schlacht_farben_t.js
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1194, height: 834 } }); const err = [];
  p.on('pageerror', e => err.push(String(e))); p.on('console', m => { if (m.type() === 'error') err.push(m.text()); });
  await p.goto('http://localhost:8772/dev/proto/schlacht_spiel.html?g=hoch');
  await p.waitForFunction(() => window.SCHLACHT && SCHLACHT.phase === 'aufstellung', null, { timeout: 180000 });
  await p.waitForTimeout(2000);
  for (const [n, nm] of [[0, 'rom'], [-1, 'kelt'], [-2, 'iber']]) {
    const k = await p.evaluate(n => { const U = SCHLACHT.units; const u = n === 0 ? U[0] : n === -1 ? U.find(v => v.ein.kultur === 'keltisch') : U.find(v => v.ein.kultur === 'iberisch' || v.ein.kultur === 'punisch'); SCHLACHT.kamera(u.f + Math.PI, 0.18, 12, u.cx, u.cz); return u.name + ' ' + u.ein.kultur; }, n);
    await p.waitForTimeout(1500); await p.screenshot({ path: `shot/farbe_${nm}.png` }); console.log(nm, k);
  }
  console.log('Fehler', err.length ? err.slice(0, 3) : 'keine'); await b.close();
})();
