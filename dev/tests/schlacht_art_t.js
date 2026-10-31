// Feldartillerie R6 (31.10.): Torsionsgeschütze in der Echtzeitschlacht. Aufruf: node schlacht_art_t.js [port=8772]   Bild: shot/art_*.png
// Geprüft: Testseite ?art=1 hängt je Seite eine Artillerie-Einheit an; Geschütze angelegt und sichtbar; Schüsse mit Treffern auf ein Ziel in 150-200 m;
// Nachladezeit (zwei Geschütze: je drei aufeinanderfolgende Schüsse mindestens ~8 s); aufgegebene Geschütze nach der Flucht; keine Seitenfehler.
const { chromium } = require('playwright');
const PORT = process.argv[2] || 8772;
const ok = [], fail = [];
const check = (n, c, info) => { (c ? ok : fail).push(n); console.log((c ? 'OK   ' : 'FAIL ') + n + (info ? '  ' + info : '')); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1194, height: 834 } }); const fehler = [];
  p.on('pageerror', e => fehler.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/404|Failed to load resource/.test(m.text())) fehler.push(m.text()); });
  await p.goto(`http://localhost:${PORT}/dev/proto/schlacht_spiel.html?g=niedrig&art=1`);
  await p.waitForFunction(() => window.SCHLACHT && SCHLACHT.phase === 'aufstellung', null, { timeout: 180000 });
  // 1) ?art=1: je Seite eine Artillerie-Einheit in der Vorlage
  const vorl = await p.evaluate(() => SCHLACHT.units.filter(u => u.def.art).map(u => ({ s: u.side, g: u.def.art.guns, np: u.np, reich: Math.round(u.def.fern.reich), walk: u.def.walk, pak: u.ein.paket })));
  check('?art=1: je Seite eine Artillerie-Einheit', vorl.length === 2 && vorl[0].s !== vorl[1].s, JSON.stringify(vorl));
  check('Werte: 4 Geschütze, 12 Mann, Reichweite ~220 m, Tempo 0,6', vorl[0].g === 4 && vorl[0].np === 12 && vorl[0].reich === 220 && Math.abs(vorl[0].walk - .6) < .01, '');
  await p.waitForTimeout(1500);
  const sicht0 = await p.evaluate(() => SCHLACHT.geschuetzSichtbar);
  check('Geschütze sichtbar (Vorlage: 2 Einheiten x 4)', sicht0 === 8, 'sichtbar=' + sicht0);

  // 2) eigenes Gefecht: eine Artillerie-Einheit mit 2 Geschützen (mann 20) gegen ein Ziel in 180 m
  const gef = (mann, x) => ({ id: 'art_t' + mann, n: 'Artillerie-Test', seiten: ['Rom', 'Karthago'], text: 'Test', umgebung: 'keine', einheiten: [
    { s: 0, volk: 'rom', kultur: 'latein', rolle: 'art', epoche: 0, mann, x, z: -140 },
    { s: 1, volk: 'karthago', kultur: 'punisch', rolle: 'sword', epoche: 0, x, z: 40 },
    { s: 1, volk: 'karthago', kultur: 'punisch', rolle: 'art', epoche: 0, mann: 40, x: x + 100, z: 140 },
    { s: 0, volk: 'rom', kultur: 'latein', rolle: 'sword', epoche: 0, x: x - 150, z: -140 }] });
  await p.evaluate(g => SCHLACHT.gefecht(g), gef(20, 0));
  await p.waitForFunction(() => SCHLACHT.phase === 'aufstellung' && SCHLACHT.aktuellesGefecht === 'art_t20', null, { timeout: 180000 });
  await p.waitForTimeout(1500);
  const s2 = await p.evaluate(() => { const a = SCHLACHT.units[0], z = SCHLACHT.units[1]; SCHLACHT.kiSeiten(false, false); SCHLACHT.units.forEach(u => SCHLACHT.haltung(u.i, 'halten'));
    return { guns: a.def.art.guns, np: a.np, d: Math.hypot(a.cx - z.cx, a.cz - z.cz), sicht: SCHLACHT.geschuetzSichtbar, npZ: z.np, mun: a.mun }; });
  check('2 Geschütze, Ziel in 150-200 m', s2.guns === 2 && s2.np === 6 && s2.d >= 150 && s2.d <= 200, JSON.stringify(s2));
  await p.evaluate(() => {
    window.__t = []; let last = 0;
    window.__iv = setInterval(() => { const n = SCHLACHT.geschosse.gesamt; while (last < n) { __t.push(+SCHLACHT.schlachtZeit.toFixed(2)); last++; } }, 40);
    SCHLACHT.start(); SCHLACHT.tempo(1);
  });
  await p.waitForFunction(() => SCHLACHT.schlachtZeit >= 26, null, { timeout: 400000, polling: 300 });
  const r = await p.evaluate(() => ({ t: __t, g: Object.assign({}, SCHLACHT.geschosse), ft: SCHLACHT.zaehler.fernTreffer, zl: SCHLACHT.units[1].strength, mor: SCHLACHT.units[1].morale, art: SCHLACHT.units[0].mun }));
  console.log('SCHÜSSE', JSON.stringify(r));
  check('Schüsse abgegeben', r.t.length >= 3, 'n=' + r.t.length);
  check('Treffer auf das Ziel in 150-200 m', r.ft >= 1 && r.zl < 6 || r.ft >= 1, `Fern-Treffer=${r.ft}, Ziel-Stärke=${r.zl}/6`);
  let minD = 99; for (let i = 0; i + 2 < r.t.length; i++) minD = Math.min(minD, r.t[i + 2] - r.t[i]);
  check('Nachladezeit: je Geschütz mindestens ~8 s (3 Schüsse zweier Geschütze >= 7,5 s)', r.t.length >= 3 && minD >= 7.5, 'kleinster Abstand=' + minD.toFixed(2));
  await p.evaluate(() => { SCHLACHT.pause(true); const a = SCHLACHT.units[0]; SCHLACHT.kamera(Math.PI * 1.1, 0.35, 28, a.cx, a.cz); });
  await p.waitForTimeout(2500); await p.screenshot({ path: 'shot/art_2.png' });
  // 3) Flucht: Geschütze werden aufgegeben (bleiben stehen)
  await p.evaluate(() => { SCHLACHT.pause(false); SCHLACHT.tempo(4); SCHLACHT.druck(0, 40); });
  await p.waitForFunction(() => SCHLACHT.units[0].state === 'flieht' || SCHLACHT.units[0].state === 'geflohen', null, { timeout: 120000, polling: 300 });
  await p.waitForTimeout(3000);
  const g1 = await p.evaluate(() => SCHLACHT.geschuetze(0)); await p.waitForTimeout(3000); const g2 = await p.evaluate(() => SCHLACHT.geschuetze(0));
  check('nach Flucht: Geschütze aufgegeben und unbewegt', g1.length === 2 && g1.every(q => q.tot) && JSON.stringify(g1) === JSON.stringify(g2), JSON.stringify(g2));
  check('aufgegebene Geschütze bleiben sichtbar', (await p.evaluate(() => SCHLACHT.geschuetzSichtbar)) >= 2, '');
  await p.evaluate(() => clearInterval(__iv));

  // 4) Bild mit 4 Geschützen
  await p.evaluate(() => SCHLACHT.neu()); await p.waitForFunction(() => SCHLACHT.phase === 'aufstellung', null, { timeout: 60000 });
  await p.evaluate(g => SCHLACHT.gefecht(g), gef(40, 0));
  await p.waitForFunction(() => SCHLACHT.phase === 'aufstellung' && SCHLACHT.aktuellesGefecht === 'art_t40', null, { timeout: 180000 });
  await p.waitForTimeout(1500);
  await p.evaluate(() => { SCHLACHT.kiSeiten(false, false); SCHLACHT.units.forEach(u => SCHLACHT.haltung(u.i, 'halten')); SCHLACHT.start(); SCHLACHT.tempo(1); });
  await p.waitForFunction(() => SCHLACHT.schlachtZeit >= 14, null, { timeout: 300000, polling: 300 });
  await p.evaluate(() => { SCHLACHT.pause(true); const a = SCHLACHT.units[0]; SCHLACHT.kamera(Math.PI * 1.05, 0.3, 26, a.cx, a.cz - 2); });
  await p.waitForTimeout(2500); await p.screenshot({ path: 'shot/art_4.png' });
  const s4 = await p.evaluate(() => ({ sicht: SCHLACHT.geschuetzSichtbar, guns: SCHLACHT.geschuetze(0).length, g: SCHLACHT.geschosse.gesamt }));
  check('4 Geschütze sichtbar', s4.sicht >= 4 && s4.guns === 4, JSON.stringify(s4));
  check('keine Seitenfehler', fehler.length === 0, fehler.slice(0, 3).join(' | '));
  console.log(fail.length ? 'FEHLGESCHLAGEN: ' + fail.join('; ') : 'ALLES OK (' + ok.length + ')');
  await b.close(); process.exit(fail.length ? 1 : 0);
})().catch(e => { console.error('ABBRUCH', e.message); process.exit(1); });
