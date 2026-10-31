// Pikenphalanx mit gesenkter Sarissa: Gefecht Makedonien. Prüft die Clips der Phalanx-Soldaten (Abstand zum Feind) und macht Bilder.
// Aufruf: node schlacht_sarissa_t.js [port=8772]   Bilder: shot/sarissa_*.png
const { chromium } = require('playwright');
const PORT = process.argv[2] || 8772;
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1194, height: 834 } }); const fehler = [];
  p.on('pageerror', e => fehler.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/404|Failed to load resource/.test(m.text())) fehler.push(m.text()); });
  await p.goto(`http://localhost:${PORT}/dev/proto/schlacht_spiel.html?g=mittel`);
  await p.waitForFunction(() => window.SCHLACHT && SCHLACHT.phase === 'aufstellung', null, { timeout: 180000 });
  await p.evaluate(() => SCHLACHT.gefecht('makedonien'));
  await p.waitForFunction(() => SCHLACHT.phase === 'aufstellung' && SCHLACHT.units.length > 0, null, { timeout: 180000 });
  await p.waitForTimeout(2000);
  const ph = await p.evaluate(() => SCHLACHT.units.filter(u => u.def.sar).map(u => u.i));
  console.log('Phalanx-Einheiten (def.sar):', JSON.stringify(ph), 'Paket', await p.evaluate(i => SCHLACHT.units[i].ein.paket, ph[0]));
  const clipsAt = () => p.evaluate(ids => { const o = {}; for (const i of ids) { const u = SCHLACHT.units[i]; for (let k = 0; k < SCHLACHT.units.length * 60; k++) { const q = SCHLACHT.soldat(k); if (q && q.unit === i && q.st <= 3) { const f = u.feindD < 40 ? 'nah' : 'fern'; o[f] = o[f] || {}; o[f][q.clip] = (o[f][q.clip] || 0) + 1; } } } return o; }, ph);
  console.log('Aufstellung (Feind fern):', JSON.stringify(await clipsAt()));
  await p.evaluate(() => { SCHLACHT.kiSeiten(false, true); SCHLACHT.units.forEach(u => { if (u.side === 0) SCHLACHT.haltung(u.i, 'halten'); }); SCHLACHT.start(); SCHLACHT.tempo(2); });
  // Vorrücken: Rom steht, die Phalanx (KI) marschiert; Bild der gesenkten Pike beim Vorrücken, dann im Kampf
  let marsch = null, kampf = null, sumNah = {}, sumFern = {};
  for (let t = 0; t < 140; t++) {
    await p.waitForTimeout(700);
    const s = await p.evaluate(ids => ids.map(i => { const u = SCHLACHT.units[i]; return { i, st: u.state, d: Math.round(u.feindD), x: u.cx, z: u.cz, eng: u.engaged }; }), ph);
    const c = await clipsAt();
    for (const [f, o] of Object.entries(c)) { const T = f === 'nah' ? sumNah : sumFern; for (const [k, v] of Object.entries(o)) T[k] = (T[k] || 0) + v; }
    const m = s.find(u => u.st === 'marsch' && u.d < 36 && u.d > 12), k = s.find(u => u.eng);
    if (m && !marsch) { marsch = m; await p.evaluate(([x, z]) => { SCHLACHT.pause(true); SCHLACHT.kamera(Math.PI * 0.9, 0.17, 11, x, z); }, [m.x, m.z]); await p.waitForTimeout(1200); await p.screenshot({ path: 'shot/sarissa_marsch.png' }); await p.evaluate(() => SCHLACHT.pause(false)); }
    if (k && !kampf && t > 5) { kampf = k; await p.waitForTimeout(2500);
      const ku = await p.evaluate(i => { const u = SCHLACHT.units[i]; return [u.cx, u.cz, u.f]; }, k.i);
      await p.evaluate(([x, z, f]) => { SCHLACHT.pause(true); SCHLACHT.kamera(f + Math.PI * 0.0 + Math.PI, 0.16, 11, x, z); }, ku); await p.waitForTimeout(1200); await p.screenshot({ path: 'shot/sarissa_kampf_vorn.png' });
      await p.evaluate(([x, z, f]) => SCHLACHT.kamera(f + Math.PI * 1.5, 0.14, 10, x, z), ku); await p.waitForTimeout(1000); await p.screenshot({ path: 'shot/sarissa_kampf_seite.png' });
      await p.evaluate(([x, z, f]) => SCHLACHT.kamera(f + Math.PI * 0.0, 0.2, 14, x, z), ku); await p.waitForTimeout(1000); await p.screenshot({ path: 'shot/sarissa_kampf_hinten.png' });
      await p.evaluate(() => SCHLACHT.pause(false)); }
    if (marsch && kampf && t > 40) break;
  }
  console.log('Clips (nur Phalanx-Soldaten, aufsummiert über die Messpunkte)\n  Feind unter 40 m:', JSON.stringify(sumNah), '\n  Feind weiter:', JSON.stringify(sumFern));
  const sar = ['sarissa_bereit', 'sarissa_stoss', 'gehen_sarissa'], ferndrin = sar.filter(c => sumFern[c]);
  console.log('Sarissa-Clips bei Feind fern (soll leer sein):', JSON.stringify(ferndrin), '| bei Feind nah gesehen:', JSON.stringify(sar.filter(c => sumNah[c])));
  console.log('Bild Marsch:', marsch ? 'ja' : 'nein', '| Bild Kampf:', kampf ? 'ja' : 'nein');
  console.log('FEHLER (Seite)', fehler.length ? fehler.join(' | ') : 'keine');
  await b.close(); process.exit(fehler.length || ferndrin.length ? 1 : 0);
})();
