// Eroberungspunkt R8a (31.10.). Aufruf: node schlacht_punkt_t.js [port=8772]   Bild: shot/punkt.png
// Geprüft: ?punkt=1 -> Kreis hinter Seite 1; Angreifer (Seite 0) allein im Kreis -> Uhr läuft, Sieg nach ~60 s Spielzeit; Verteidiger im Kreis hält die Uhr an;
// Angreifer verlässt den Kreis -> Uhr sinkt; keine Seitenfehler.
const { chromium } = require('playwright');
const PORT = process.argv[2] || 8772;
const ok = [], fail = [];
const check = (n, c, info) => { (c ? ok : fail).push(n); console.log((c ? 'OK   ' : 'FAIL ') + n + (info ? '  ' + info : '')); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1194, height: 834 } }); const fehler = [];
  p.on('pageerror', e => fehler.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/404|Failed to load resource/.test(m.text())) fehler.push(m.text()); });
  await p.goto(`http://localhost:${PORT}/dev/proto/schlacht_spiel.html?g=niedrig&punkt=1`);
  await p.waitForFunction(() => window.SCHLACHT && SCHLACHT.phase === 'aufstellung', null, { timeout: 180000 });
  const k = await p.evaluate(() => SCHLACHT.punkt);
  check('?punkt=1: Kreis hinter Seite 1', k && k.seite === 1 && k.z > 90 && k.r === 22 && k.zeit === 60 && k.ring, JSON.stringify(k));
  // eigenes Gefecht ohne Reiter (sonst greifen Reiter von selbst ein): 3 Schwertkämpfer gegen 2, alles weit weg vom Kreis
  const gef = { id: 'punkt_t', n: 'Punkt-Test', seiten: ['Rom', 'Karthago'], text: 'Test', umgebung: 'mittelmeer', einheiten: [
    { s: 0, volk: 'rom', kultur: 'latein', rolle: 'sword', epoche: 0, x: -150, z: -120 }, { s: 0, volk: 'rom', kultur: 'latein', rolle: 'sword', epoche: 0, x: -120, z: -120 }, { s: 0, volk: 'rom', kultur: 'latein', rolle: 'sword', epoche: 0, x: -90, z: -120 },
    { s: 1, volk: 'karthago', kultur: 'punisch', rolle: 'sword', epoche: 0, x: 150, z: -100 }, { s: 1, volk: 'karthago', kultur: 'punisch', rolle: 'sword', epoche: 0, x: 120, z: -100 }] };
  await p.evaluate(g => SCHLACHT.gefecht(g), gef);
  await p.waitForFunction(() => SCHLACHT.phase === 'aufstellung' && SCHLACHT.aktuellesGefecht === 'punkt_t', null, { timeout: 180000 });
  await p.waitForTimeout(1500);
  await p.evaluate(() => { const S = SCHLACHT; S.kiSeiten(false, false); S.units.forEach(u => S.haltung(u.i, 'halten'));
    window.__a = 0; window.__d = 3; S.versetzen(0, S.punkt.x, S.punkt.z); S.tempo(30); S.start(); });
  await p.waitForTimeout(1500);
  // Verteidiger in den Kreis: Uhr steht still
  const u1 = await p.evaluate(() => SCHLACHT.punkt.uhr);
  await p.evaluate(() => { const S = SCHLACHT; S.tempo(1); S.versetzen(window.__a, S.punkt.x - 20, S.punkt.z); S.versetzen(window.__d, S.punkt.x + 20, S.punkt.z); });
  const t0 = await p.evaluate(() => SCHLACHT.punkt.uhr); await p.waitForTimeout(1500); const t1 = await p.evaluate(() => ({ u: SCHLACHT.punkt.uhr, d: SCHLACHT.punkt.d, a: SCHLACHT.punkt.a }));
  check('Uhr lief mit Angreifer allein', u1 > 0, 'uhr=' + u1.toFixed(1));
  check('Verteidiger im Kreis hält die Uhr an', Math.abs(t1.u - t0) < 0.5 && t1.d >= 1 && t1.a >= 1, JSON.stringify([t0, t1]));
  // Angreifer verlässt den Kreis: Uhr sinkt
  await p.evaluate(() => { const S = SCHLACHT; S.versetzen(window.__d, 150, -100); S.versetzen(window.__a, 0, 0); S.tempo(1); });
  const s0 = await p.evaluate(() => SCHLACHT.punkt.uhr); await p.waitForTimeout(1500); const s1 = await p.evaluate(() => SCHLACHT.punkt.uhr);
  check('Angreifer außerhalb: Uhr sinkt zurück', s1 < s0, s0.toFixed(1) + ' -> ' + s1.toFixed(1));
  // zurück in den Kreis, Bild, dann Sieg
  const z0 = await p.evaluate(() => { const S = SCHLACHT; S.tempo(4); S.versetzen(window.__a, -150, -120); window.__a = S.units.find(u => u.side === 0 && !u.fern && !u.gen && u.i !== window.__a).i; S.versetzen(window.__a, S.punkt.x, S.punkt.z); window.__u0 = S.punkt.uhr; S.kamera(0.2, 0.6, 95, S.punkt.x, S.punkt.z); return S.schlachtZeit; });
  const u0 = await p.evaluate(() => window.__u0);
  await p.waitForTimeout(1200);
  await p.screenshot({ path: 'shot/punkt.png' }); await p.evaluate(() => SCHLACHT.tempo(30));
  await p.waitForFunction(() => SCHLACHT.phase === 'ende', null, { timeout: 120000 });
  const e = await p.evaluate(() => ({ erg: SCHLACHT.ergebnis, p: SCHLACHT.punkt, z: SCHLACHT.schlachtZeit, h: document.getElementById('ende').innerText.slice(0, 80) }));
  check('Sieg des Angreifers (Seite 0) durch Eroberung', e.erg === 'sieg' && e.p.fertig && e.p.uhr >= 60, JSON.stringify(e.p));
  const dz = e.z - z0, soll = 60 - u0;
  check('Restdauer passt zur Uhr (60 s Gesamt)', Math.abs(dz - soll) < 4, 'gebraucht ' + dz.toFixed(1) + ' s, erwartet ~' + soll.toFixed(1) + ' s (Uhr stand bei ' + u0.toFixed(1) + ')');
  check('Endtext nennt die Siedlung', /Siedlung/.test(e.h), e.h.replace(/\n/g, ' '));
  check('keine Seitenfehler', fehler.length === 0, fehler.slice(0, 3).join(' | '));
  console.log(`\n${ok.length} OK, ${fail.length} FAIL`); await b.close(); process.exit(fail.length ? 1 : 0);
})();
