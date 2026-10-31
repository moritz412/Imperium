// Wetter R4 (31.10.): ?wetter=regen|nebel|schnee|hitze auf der Testseite. Gefecht Makedonien, gezielt aufgestellt (wie schlacht_faehigkeit_t.js).
// Aufruf: node schlacht_wetter_t.js [port=8772]   Bilder: shot/wetter_regen.png, wetter_nebel.png, wetter_schnee.png
// Messungen sind einzelne Läufe mit Zufall; geprüft werden nur grobe Richtungen.
const { chromium } = require('playwright');
const PORT = process.argv[2] || 8772;
const ok = []; const fail = [];
const check = (n, c, info) => { (c ? ok : fail).push(n); console.log((c ? 'OK   ' : 'FAIL ') + n + (info ? '  ' + info : '')); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const R = {};
  for (const w of ['klar', 'regen', 'nebel', 'schnee', 'hitze']) {
    const p = await b.newPage({ viewport: { width: 1194, height: 834 } }); const fehler = [];
    p.on('pageerror', e => fehler.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/404|Failed to load resource/.test(m.text())) fehler.push(m.text()); });
    await p.goto(`http://localhost:${PORT}/dev/proto/schlacht_spiel.html?g=mittel${w === 'klar' ? '' : '&wetter=' + w}`);
    await p.waitForFunction(() => window.SCHLACHT && SCHLACHT.phase === 'aufstellung', null, { timeout: 180000 });
    check(`${w}: Wetter erkannt`, (await p.evaluate(() => SCHLACHT.wetter)) === w);
    let geladen = false;
    const aufbau = async (paare) => {
      if (!geladen) { geladen = true; await p.evaluate(() => SCHLACHT.gefecht('makedonien')); } else await p.evaluate(() => SCHLACHT.neu());
      await p.waitForFunction(() => SCHLACHT.phase === 'aufstellung' && SCHLACHT.units.length > 0, null, { timeout: 180000 });
      await p.waitForTimeout(1200);
      await p.evaluate(([pa]) => {
        SCHLACHT.kiSeiten(false, false);
        const nutz = new Set(pa.map(q => q[0])); let k0 = 0, k1 = 0;
        SCHLACHT.units.forEach(u => { SCHLACHT.haltung(u.i, 'halten'); if (!nutz.has(u.i)) { if (u.side === 0) SCHLACHT.versetzen(u.i, -175, -130 + 28 * k0++); else SCHLACHT.versetzen(u.i, 175, -130 + 28 * k1++); } });
        for (const [i, x, z, f] of pa) { SCHLACHT.versetzen(i, x, z); if (f != null) SCHLACHT.units[i].f = f; }
      }, [paare]);
      await p.waitForTimeout(1200);
    };
    const hpSumme = i => p.evaluate(i => { let s = 0, n = 0; for (let k = 0; k < SCHLACHT.units.length * 60; k++) { const q = SCHLACHT.soldat(k); if (q && q.unit === i && q.st <= 3) { s += Math.max(0, q.hp); n++; } } return { s, n }; }, i);
    const warte = sek => p.waitForFunction(s => SCHLACHT.schlachtZeit >= s, sek, { timeout: 300000, polling: 200 });
    // Bild (Aufstellung, Kamera schräg über dem Heer)
    if (w === 'regen' || w === 'nebel' || w === 'schnee') {
      await aufbau([[0, 0, 0, 0], [14, 0, 60, Math.PI]]);
      await p.evaluate(() => { SCHLACHT.pause(true); SCHLACHT.kamera(Math.PI * 0.9, 0.3, 55, 0, 25); });
      await p.waitForTimeout(2500); await p.screenshot({ path: `shot/wetter_${w}.png` });
      const hz = await p.evaluate(() => document.querySelector('#hinweis').innerText);
      console.log(`${w}: Hinweis „${hz}“, Anzeige „${await p.evaluate(() => document.querySelector('#kTempo').innerText)}“`);
      check(`${w}: Hinweis zeigt Wetter`, /Regen|Nebel|Schnee/.test(hz));
    }
    // Fernkampf: Bogenschützen (14) beschießen Hastati (0) aus 80 m, 60 s Spielzeit
    await aufbau([[0, 0, 0, 0], [14, 0, 80, Math.PI]]);
    const reich = await p.evaluate(() => SCHLACHT.units[14].def.fern.reich);
    await p.evaluate(() => { SCHLACHT.start(); SCHLACHT.tempo(4); });
    const h0 = await hpSumme(0); await warte(60); const h1 = await hpSumme(0);
    const g = await p.evaluate(() => ({ ges: SCHLACHT.geschosse.gesamt, t: SCHLACHT.geschosse.treffer }));
    R[w] = { reich: +reich.toFixed(1), verlust: +(h0.s - h1.s).toFixed(1), geschosse: g.ges, treffer: g.t };
    // Tempo
    await aufbau([[0, 0, 0, 0]]);
    await p.evaluate(() => { SCHLACHT.start(); SCHLACHT.tempo(1); SCHLACHT.befehl(0, 0, 120, false); });
    await p.waitForTimeout(6000);
    R[w].v = await p.evaluate(() => +SCHLACHT.units[0].curSpeed.toFixed(2));
    // Ermüdung beim Rennen (Spielzeit 20 s bei Tempo 4)
    await aufbau([[7, 0, -60, 0]]);
    await p.evaluate(() => { SCHLACHT.start(); SCHLACHT.tempo(4); SCHLACHT.befehl(7, 0, 160, true); });
    await warte(20);
    R[w].fat = await p.evaluate(() => { let s = 0, n = 0; for (let k = 0; k < SCHLACHT.units.length * 60; k++) { const q = SCHLACHT.soldat(k); if (q && q.unit === 7 && q.st <= 3) { s += q.fat; n++; } } return +(s / Math.max(1, n)).toFixed(3); });
    console.log(w, JSON.stringify(R[w]));
    check(`${w}: keine Seitenfehler`, fehler.length === 0, fehler.slice(0, 2).join(' | '));
    await p.close();
  }
  const k = R.klar;
  check('Regen: Verlust durch Beschuss deutlich geringer', k.verlust > 3 && R.regen.verlust < k.verlust * 0.9, `${k.verlust} -> ${R.regen.verlust}`);
  check('Regen: Reichweite ×0,85', Math.abs(R.regen.reich / k.reich - 0.85) < 0.02, `${k.reich} -> ${R.regen.reich}`);
  check('Nebel: kein Beschuss auf 80 m', k.geschosse > 10 && R.nebel.geschosse === 0, `klar ${k.geschosse}, Nebel ${R.nebel.geschosse} Geschosse`);
  check('Schnee: Tempo ×0,85', k.v > 0 && R.schnee.v / k.v > 0.78 && R.schnee.v / k.v < 0.92, `${k.v} -> ${R.schnee.v} m/s`);
  check('Hitze: Reiter ermüden stärker beim Rennen', R.hitze.fat > k.fat * 1.25, `${k.fat} -> ${R.hitze.fat}`);
  await b.close();
  console.log(`\n${ok.length} OK, ${fail.length} FAIL`); process.exit(fail.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
