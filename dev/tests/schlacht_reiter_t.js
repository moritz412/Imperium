// Reiterei: Gefecht Karthago (Equites, Numider, keltische Reiter), Ansturm, Lösen. Aufruf: node schlacht_reiter_t.js [port]
const { chromium } = require('playwright');
const PORT = process.argv[2] || 8772;
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1194, height: 834 } }); const fehler = [];
  p.on('pageerror', e => fehler.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/404|Failed to load resource/.test(m.text())) fehler.push(m.text()); });
  await p.goto(`http://localhost:${PORT}/dev/proto/schlacht_spiel.html?g=mittel`);
  await p.waitForFunction(() => window.SCHLACHT && SCHLACHT.phase === 'aufstellung', null, { timeout: 120000 });
  await p.evaluate(() => SCHLACHT.gefecht('karthago'));
  await p.waitForFunction(() => SCHLACHT.phase === 'aufstellung' && SCHLACHT.units.length > 0 && SCHLACHT.pakete.includes('P_pferd'), null, { timeout: 120000 });
  await p.waitForTimeout(2500);
  const roster = await p.evaluate(() => SCHLACHT.units.map(u => u.i + ' ' + u.name + ':' + u.ein.paket + (u.ein.paketGenau ? '' : '*') + (u.reit ? ' [reit ' + u.np + ' Fig]' : '')).join('\n'));
  console.log('ROSTER\n' + roster);
  const reiter = await p.evaluate(() => SCHLACHT.units.filter(u => u.reit).map(u => u.i));
  console.log('Reiter-Einheiten', JSON.stringify(reiter), 'Pakete', JSON.stringify(await p.evaluate(() => SCHLACHT.pakete)));
  // stehende Reiter in der Aufstellung (römischer Flügel, Blick von der Seite)
  const r0 = await p.evaluate(i => { const u = SCHLACHT.units[i]; return [u.cx, u.cz]; }, reiter[0]);
  await p.evaluate(([x, z]) => SCHLACHT.kamera(Math.PI * 0.72, 0.16, 15, x, z), r0);
  await p.waitForTimeout(1500); await p.screenshot({ path: 'shot/reiter_1stehend.png' });
  await p.evaluate(([x, z]) => SCHLACHT.kamera(Math.PI * 0.95, 0.22, 11, x, z), r0);
  await p.waitForTimeout(1200); await p.screenshot({ path: 'shot/reiter_1stehend_hinten.png' });
  const nu = await p.evaluate(() => SCHLACHT.units.map(u => u.side));
  const romCav = reiter.filter(i => nu[i] === 0), feindCav = reiter.filter(i => nu[i] === 1);
  // Start, Rom-Reiter stürmt: erst auf die keltische Schwertkämpfer-Einheit (Seite), dann auf Libyer (Speere von vorn)
  await p.evaluate(([a, c]) => {
    SCHLACHT.start(); SCHLACHT.tempo(2);
    const f = SCHLACHT.units.filter(u => u.side === 1 && !u.reit);
    const keltR = f.find(u => /Kelt|kelt/.test(u.name)) || f[0], lib = f.find(u => /Libyer|libyer/.test(u.name)) || f[1];
    SCHLACHT.angriff(a, keltR.i); SCHLACHT.angriff(c, lib.i);
  }, [romCav[0], romCav[1]]);
  const shots = { gal: false, ans: false, kon: false }; let n0 = 0, loes = null, log = [];
  for (let t = 0; t < 46; t++) {
    await p.waitForTimeout(1000);
    const st = await p.evaluate(rc => {
      const U = SCHLACHT.units, z = SCHLACHT.zaehler;
      return { z: { ansturm: z.ansturm, abw: z.ansturmAbgewehrt, umg: z.ansturmUmgeworfen, loesen: z.loesen, kills: z.kills },
        cav: rc.map(i => ({ i, name: U[i].name, st: U[i].state, v: +U[i].curSpeed.toFixed(1), n: U[i].strength, mor: Math.round(U[i].morale), x: Math.round(U[i].cx), zz: Math.round(U[i].cz), eng: U[i].engaged, loes: U[i].loesen })),
        zeit: Math.round(SCHLACHT.schlachtZeit), phase: SCHLACHT.phase };
    }, reiter);
    if (t % 5 === 0) log.push(JSON.stringify(st));
    const gal = st.cav.find(c => c.v > 6);
    if (gal && !shots.gal) { shots.gal = true; await p.evaluate(([x, z]) => SCHLACHT.kamera(Math.PI * 0.6, 0.15, 24, x, z), [gal.x, gal.zz]); await p.waitForTimeout(150); await p.screenshot({ path: 'shot/reiter_2galopp.png' }); }
    if (st.z.ansturm > n0 && !shots.kon) {
      const c = st.cav.find(c => c.eng) || st.cav[0]; shots.kon = true;
      await p.evaluate(([x, z]) => SCHLACHT.kamera(Math.PI * 0.7, 0.2, 16, x, z), [c.x, c.zz]); await p.waitForTimeout(100); await p.screenshot({ path: 'shot/reiter_3ansturm.png' });
      await p.waitForTimeout(500); await p.screenshot({ path: 'shot/reiter_3ansturm_b.png' });
      // Lösen prüfen: ein lebender, kämpfender römischer Reitertrupp bricht ab, reitet zurück und sammelt sich
      await p.waitForTimeout(1500);
      loes = await p.evaluate(rc => { const u = rc.map(i => SCHLACHT.units[i]).find(u => u.side === 0 && u.engaged && u.strength > 0); if (!u) return null; const x0 = Math.round(u.cx), z0 = Math.round(u.cz); return { i: u.i, ok: SCHLACHT.loesen(u.i), x0, z0 }; }, romCav);
      console.log('LÖSEN Befehl', JSON.stringify(loes));
      for (let k = 0; k < 4; k++) { await p.waitForTimeout(2500); console.log('LÖSEN +' + (k + 1) * 2.5 + ' s', JSON.stringify(await p.evaluate(i => { const u = SCHLACHT.units[i]; return { state: u.state, engaged: u.engaged, loesen: u.loesen, hasDest: u.hasDest, x: Math.round(u.cx), z: Math.round(u.cz), n: u.strength, v: +u.curSpeed.toFixed(1) }; }, loes ? loes.i : 0))); if (!loes) break; }
    }
    n0 = st.z.ansturm;
    if (st.phase === 'ende') break;
  }
  console.log('VERLAUF (alle 5 s)\n' + log.join('\n'));
  if (!loes) console.log('LÖSEN: kein Ansturm-Kontakt gefunden -> nicht getestet');
  const s = await p.evaluate(() => ({ z: SCHLACHT.zaehler, gef: SCHLACHT.gefallen, units: SCHLACHT.units.map(u => u.name + ':' + u.strength + '/' + u.np + ' ' + u.state), ton: SCHLACHT.ton, fps: SCHLACHT.fps, sold: (() => { const o = []; for (let i = 0; i < 1000; i++) { const q = SCHLACHT.soldat(i); if (q && q.reit && q.st < 3) { o.push({ i, clip: q.clip, pferd: q.pferd, v: +q.v.toFixed(1) }); if (o.length >= 6) break; } } return o; })() }));
  console.log('KENNZAHLEN', JSON.stringify({ ansturm: s.z.ansturm, abgewehrt: s.z.ansturmAbgewehrt, umgeworfen: s.z.ansturmUmgeworfen, loesen: s.z.loesen, kills: s.z.kills }));
  console.log('Verluste je Seite (gefallen Rom/Karthago)', JSON.stringify(s.gef)); console.log(s.units.join(' | '));
  console.log('Soldaten (Clips)', JSON.stringify(s.sold)); console.log('B/s (Software-Rendering)', JSON.stringify(s.fps)); console.log('Ton', JSON.stringify(s.ton));
  // Speerprobe: Equites gegen die Pikenphalanx von vorn (Makedonien, feindliche Reiter ausgeschaltet) -> Speere halten, Pferd steigt
  const q = await b.newPage({ viewport: { width: 1194, height: 834 } });
  q.on('pageerror', e => fehler.push(String(e))); q.on('console', m => { if (m.type() === 'error' && !/404|Failed to load resource/.test(m.text())) fehler.push(m.text()); });
  await q.goto("http://localhost:" + PORT + "/dev/proto/schlacht_spiel.html?g=mittel");
  await q.waitForFunction(() => window.SCHLACHT && SCHLACHT.phase === 'aufstellung', null, { timeout: 120000 });
  await q.evaluate(() => SCHLACHT.gefecht('makedonien'));
  await q.waitForFunction(() => SCHLACHT.phase === 'aufstellung' && SCHLACHT.pakete.includes('P_pferd'), null, { timeout: 120000 });
  await q.waitForTimeout(1500);
  await q.evaluate(() => { const U = SCHLACHT.units; for (const u of U) if (u.side === 1 && u.reit) u.state = 'aufgerieben'; SCHLACHT.stellen(4, 12, -20); SCHLACHT.start(); SCHLACHT.tempo(2);
    SCHLACHT.angriff(4, U.find(u => /phalanx/i.test(u.name)).i); });
  let sp = false, spz = null;
  for (let t = 0; t < 150 && !sp; t++) {
    await q.waitForTimeout(500);
    spz = await q.evaluate(() => { const z = SCHLACHT.zaehler, u = SCHLACHT.units[4]; return { zeit: +SCHLACHT.schlachtZeit.toFixed(1), ansturm: z.ansturm, abgewehrt: z.ansturmAbgewehrt, umgeworfen: z.ansturmUmgeworfen, reiter: u.strength, cx: u.cx, cz: u.cz }; });
    if (spz.abgewehrt >= 3) { sp = true; await q.evaluate(([x, z]) => SCHLACHT.kamera(Math.PI * 0.8, 0.2, 14, x, z), [spz.cx, spz.cz]); await q.waitForTimeout(200); await q.screenshot({ path: 'shot/reiter_4speerprobe.png' });
      const lv = await q.evaluate(() => { const ok = SCHLACHT.loesen(4), u = SCHLACHT.units[4]; return { ok, loesen: u.loesen, x: Math.round(u.cx), z: Math.round(u.cz), n: u.strength }; });
      console.log('LÖSEN (Speerprobe) Befehl', JSON.stringify(lv));
      for (let k = 0; k < 4; k++) { await q.waitForTimeout(3000); console.log('LÖSEN (Speerprobe) +' + (k + 1) * 3 + ' s', JSON.stringify(await q.evaluate(() => { const u = SCHLACHT.units[4]; return { state: u.state, engaged: u.engaged, loesen: u.loesen, hasDest: u.hasDest, x: Math.round(u.cx), z: Math.round(u.cz), n: u.strength, v: +u.curSpeed.toFixed(1) }; }))); } }
  }
  console.log('SPEERPROBE', JSON.stringify(spz), sp ? '' : '(keine Abwehr beobachtet)');
  console.log('Fehler:', fehler.length ? fehler.slice(0, 5) : 'keine');
  await b.close();
})().catch(e => { console.error('ABBRUCH', e.message); process.exit(1); });
