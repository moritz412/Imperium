// Fähigkeiten R1 (31.10.): Schildkröte, Keil, Schildwall, Wurfsalve. Gefecht Makedonien, Einheiten gezielt aufgestellt, alle anderen weit weg geparkt.
// Aufruf: node schlacht_faehigkeit_t.js [port=8772]   Bild: shot/faehigkeit_schildkroete.png
// Messungen sind einzelne Läufe mit Zufall (kein Mittel über viele Läufe); geprüft werden nur grobe Richtungen.
const { chromium } = require('playwright');
const PORT = process.argv[2] || 8772;
const ok = []; const fail = [];
const check = (n, c, info) => { (c ? ok : fail).push(n); console.log((c ? 'OK   ' : 'FAIL ') + n + (info ? '  ' + info : '')); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1194, height: 834 } }); const fehler = [];
  p.on('pageerror', e => fehler.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/404|Failed to load resource/.test(m.text())) fehler.push(m.text()); });
  await p.goto(`http://localhost:${PORT}/dev/proto/schlacht_spiel.html?g=mittel`);
  await p.waitForFunction(() => window.SCHLACHT && SCHLACHT.phase === 'aufstellung', null, { timeout: 180000 });
  // Aufbau: Gefecht neu laden, KI aus, alle auf „halten“, nur die genannten Einheiten in die Mitte, der Rest weit weg
  let geladen = false;
  const aufbau = async (paare, ki1) => {
    if (!geladen) { geladen = true; await p.evaluate(() => SCHLACHT.gefecht('makedonien')); } else await p.evaluate(() => SCHLACHT.neu());   // danach nur zurücksetzen
    await p.waitForFunction(() => SCHLACHT.phase === 'aufstellung' && SCHLACHT.units.length > 0, null, { timeout: 180000 });
    await p.waitForTimeout(1500);
    await p.evaluate(([pa, ki1]) => {
      SCHLACHT.kiSeiten(false, !!ki1);
      const nutz = new Set(pa.map(q => q[0]));
      let k0 = 0, k1 = 0;
      SCHLACHT.units.forEach(u => { SCHLACHT.haltung(u.i, 'halten'); if (!nutz.has(u.i)) { if (u.side === 0) SCHLACHT.versetzen(u.i, -175, -130 + 28 * k0++); else SCHLACHT.versetzen(u.i, 175, -130 + 28 * k1++); } });
      for (const [i, x, z, f] of pa) { SCHLACHT.versetzen(i, x, z); if (f != null) SCHLACHT.units[i].f = f; }
    }, [paare, ki1]);
    await p.waitForTimeout(1500);
  };
  const hpSumme = i => p.evaluate(i => { let s = 0, n = 0; for (let k = 0; k < SCHLACHT.units.length * 60; k++) { const q = SCHLACHT.soldat(k); if (q && q.unit === i && q.st <= 3) { s += Math.max(0, q.hp); n++; } } return { s, n }; }, i);
  const warte = (sek) => p.waitForFunction(s => SCHLACHT.schlachtZeit >= s, sek, { timeout: 300000, polling: 200 });

  // ---------- Liste der Fähigkeiten je Einheit ----------
  await aufbau([[0, 0, 0, 0]]);
  const li = await p.evaluate(() => SCHLACHT.units.map(u => u.i + ':' + u.ein.paket + ':' + SCHLACHT.faehig(u.i).liste.join('+')));
  console.log(li.join(' | '));
  const L = Object.fromEntries(li.map(s => s.split(':')).map(a => [a[0], a[2]]));
  check('Hastati: Schildkröte + Wurfsalve', L[0] === 'schildkroete+salve', L[0]);
  check('Equites: Keil', L[7] === 'keil', L[7]);
  check('Hopliten/Phalanx: Schildwall', L[11] === 'schildwall' && L[9] === 'schildwall', L[11] + '/' + L[9]);
  check('Velites/Bogenschützen: keine', L[6] === '' && L[14] === '', '[' + L[6] + '][' + L[14] + ']');

  // ---------- 1 Schildkröte: Beschuss ohne / mit, je 60 s Spielzeit ----------
  const beschuss = async (schild) => {
    await aufbau([[0, 0, 0, 0], [14, 0, 62, Math.PI]]);
    await p.evaluate(() => { SCHLACHT.start(); SCHLACHT.tempo(4); });
    if (schild) { const r = await p.evaluate(() => SCHLACHT.faehigkeit(0, 'schildkroete')); check('Schildkröte einschalten', r === true && (await p.evaluate(() => SCHLACHT.units[0].fa)) === 'schildkroete'); }
    const h0 = await hpSumme(0);
    await warte(60);
    const h1 = await hpSumme(0), g = await p.evaluate(() => ({ t: SCHLACHT.geschosse.treffer, ab: SCHLACHT.geschosse.abgewehrt, ges: SCHLACHT.geschosse.gesamt }));
    return { verlust: +(h0.s - h1.s).toFixed(1), tote: h0.n - h1.n, treffer: g.t, abgewehrt: g.ab, geschosse: g.ges };
  };
  const bA = await beschuss(false), bB = await beschuss(true);
  console.log('BESCHUSS ohne Schildkröte', JSON.stringify(bA), '| mit', JSON.stringify(bB));
  check('Schildkröte mindert Beschussverlust (Leben) deutlich', bA.verlust > 3 && bB.verlust < bA.verlust * 0.6, `ohne ${bA.verlust}, mit ${bB.verlust} Lebenspunkte in 60 s`);

  // ---------- 1b Schildkröte: Tempo ----------
  const tempo = async (schild) => {
    await aufbau([[0, 0, 0, 0]]);
    await p.evaluate(() => { SCHLACHT.start(); SCHLACHT.tempo(1); });
    if (schild) await p.evaluate(() => SCHLACHT.faehigkeit(0, 'schildkroete'));
    await p.evaluate(() => SCHLACHT.befehl(0, 0, 120, false));
    await p.waitForTimeout(6000);
    return p.evaluate(() => { const u = SCHLACHT.units[0]; return { v: +u.curSpeed.toFixed(2), z: Math.round(u.cz), fk: u.fk }; });
  };
  const tA = await tempo(false), tB = await tempo(true);
  console.log('TEMPO ohne', JSON.stringify(tA), 'mit', JSON.stringify(tB));
  check('Schildkröte: Tempo etwa ×0,4 und enger Verband', tB.v > 0 && tB.v < tA.v * 0.6 && tB.fk < tA.fk, `${tB.v} gegen ${tA.v} m/s`);

  // ---------- 2/3 Keil und Schildwall: Reiteransturm ----------
  const ansturm = async (ziel, wie) => {   // Messfenster: 1,5 s Spielzeit ab dem ersten Stoß (danach überwiegt der Nahkampf); Leben des Ziels je Stoß
    await aufbau([[7, 0, -75, 0], [ziel, 0, 0, Math.PI]]);
    await p.evaluate(() => { SCHLACHT.start(); SCHLACHT.tempo(1); });
    if (wie) check(wie + ' einschalten', await p.evaluate(([i, n]) => SCHLACHT.faehigkeit(i, n), [wie === 'keil' ? 7 : ziel, wie]));
    await p.evaluate(([e, z]) => SCHLACHT.angriff(e, z), [7, ziel]);
    let h0 = null, t0 = 0;
    for (let t = 0; t < 600; t++) {
      await p.waitForTimeout(60);
      const z = await p.evaluate(() => ({ a: SCHLACHT.zaehler.ansturm, ab: SCHLACHT.zaehler.ansturmAbgewehrt, t: SCHLACHT.schlachtZeit }));
      if (!h0 && z.a >= 1) { h0 = await hpSumme(ziel); t0 = z.t; h0.r = await hpSumme(7); }
      if (h0 && z.t >= t0 + 1.5) { const h1 = await hpSumme(ziel); return { stoesse: z.a, abgewehrt: z.ab, zielVerlust: +(h0.s - h1.s).toFixed(1) }; }
    }
    return null;
  };
  const kA = await ansturm(13, null), kB = await ansturm(13, 'keil');   // Ziel: Epilektoi (kein Speerwall)
  console.log('KEIL ohne', JSON.stringify(kA), '| mit', JSON.stringify(kB));
  if (kA && kB) check('Keil: Ansturm wuchtiger (Verlust des Ziels je Stoß höher)', kB.zielVerlust / kB.stoesse > kA.zielVerlust / kA.stoesse * 1.05, `je Stoß ${(kA.zielVerlust / kA.stoesse).toFixed(2)} -> ${(kB.zielVerlust / kB.stoesse).toFixed(2)}`);
  else check('Keil: Ansturm gemessen', false, 'kein Ansturm erreicht');
  const sA = await ansturm(11, null), sB = await ansturm(11, 'schildwall');
  console.log('SCHILDWALL ohne', JSON.stringify(sA), '| mit', JSON.stringify(sB));
  if (sA && sB) check('Schildwall: Reiteransturm von vorn stark abgeschwächt (Verlust des Walls je Stoß)', sB.zielVerlust / sB.stoesse < sA.zielVerlust / sA.stoesse * 0.7, `je Stoß ${(sA.zielVerlust / sA.stoesse).toFixed(2)} -> ${(sB.zielVerlust / sB.stoesse).toFixed(2)}; abgewehrt ${sA.abgewehrt} -> ${sB.abgewehrt}`);
  else check('Schildwall: Ansturm gemessen', false, 'kein Ansturm erreicht');

  // Schildwall: kein Laufen
  await aufbau([[11, 0, 0, Math.PI]]);
  await p.evaluate(() => { SCHLACHT.start(); SCHLACHT.faehigkeit(11, 'schildwall'); SCHLACHT.befehl(11, 0, -100, true); });
  let vmax = 0, vwalk = await p.evaluate(() => SCHLACHT.units[11].def.walk);
  for (let t = 0; t < 12; t++) { await p.waitForTimeout(500); vmax = Math.max(vmax, await p.evaluate(() => SCHLACHT.units[11].curSpeed)); }
  check('Schildwall: kann nicht laufen (Tempo höchstens Gehtempo)', vmax > 0.3 && vmax <= vwalk * 1.02 && !(await p.evaluate(() => SCHLACHT.units[11].run)), `(Befehl „laufen“ bleibt ohne Wirkung) höchstes Tempo ${vmax.toFixed(2)}, Gehen ${vwalk.toFixed(2)} m/s`);

  // ---------- 4 Wurfsalve: genau einmal ----------
  await aufbau([[0, 0, 0, 0], [11, 0, 24, Math.PI]]);
  await p.evaluate(() => { SCHLACHT.start(); SCHLACHT.tempo(2); });
  const f0 = await p.evaluate(() => SCHLACHT.faehig(0)); const sp0 = await p.evaluate(() => SCHLACHT.geschosse.speere | 0); const n0 = (await hpSumme(0)).n;
  const r1 = await p.evaluate(() => SCHLACHT.faehigkeit(0));   // Standardwahl: Salve, weil ein Feind in 24 m steht
  await warte(14);
  const sp1 = await p.evaluate(() => SCHLACHT.geschosse.speere | 0), r2 = await p.evaluate(() => SCHLACHT.faehigkeit(0, 'salve'));
  await warte(26);
  const sp2 = await p.evaluate(() => SCHLACHT.geschosse.speere | 0), f1 = await p.evaluate(() => SCHLACHT.faehig(0));
  console.log('SALVE', JSON.stringify({ wahlVorher: f0.wahl, speere1: sp1 - sp0, speere2: sp2 - sp0, mann: n0 }));
  check('Wurfsalve: Standardwahl bei Feind in Wurfweite', f0.wahl === 'salve' && r1 === true);
  check('Wurfsalve: feuert (bis auf Gefallene/Unruhige) einmal je Mann', sp1 - sp0 >= n0 * 0.6 && sp1 - sp0 <= n0, `${sp1 - sp0} Speere bei ${n0} Mann`);
  check('Wurfsalve: zweite Salve nicht möglich, keine weiteren Würfe', r2 === false && sp2 === sp1 && f1.salveVerbr, `nach 26 s ${sp2 - sp1} weitere`);

  // ---------- Bedienung: Knopf, Karte, Fenster ----------
  await aufbau([[7, 0, 0, 0]]);
  await p.evaluate(() => { SCHLACHT.start(); SCHLACHT.pause(true); SCHLACHT.waehle(7); });
  await p.waitForTimeout(500);
  const ui0 = await p.evaluate(() => ({ b: document.querySelector('#bFaeh').innerText.replace(/\s+/g, ' '), op: getComputedStyle(document.querySelector('#bFaeh')).opacity }));
  await p.click('#bFaeh'); await p.waitForTimeout(300);
  await p.evaluate(() => SCHLACHT.pause(false)); await p.waitForTimeout(700);
  const ui1 = await p.evaluate(() => ({ b: document.querySelector('#bFaeh').innerText.replace(/\s+/g, ' '), fa: SCHLACHT.units[7].fa, zst: [...document.querySelectorAll('#esch .karte .zst span, .karte .zst span')].map(e => e.textContent).join('|') }));
  await p.locator('.karte .info').nth(7).click();
  await p.waitForTimeout(800);
  const fw = await p.evaluate(() => ({ d: document.querySelector('#fenster [data-k=d]')?.textContent, fh: document.querySelector('#fenster .fh')?.textContent }));
  console.log('UI', JSON.stringify({ ui0, ui1, fw }));
  check('Knopf „Fähigkeit“ zeigt Keil, schaltet ein', /Keil/.test(ui0.b) && ui1.fa === 'keil' && /Keil · an/.test(ui1.b), ui0.b + ' -> ' + ui1.b);
  check('Zustand „Keil“ auf der Einheitenkarte', /Keil/.test(ui1.zst), ui1.zst);
  check('Einheitenfenster: Abwehr ×0,85 und Erklärung', /\(Keil\)/.test(fw.d || '') && /Keil/.test(fw.fh || ''), (fw.d || '') + ' / ' + (fw.fh || '').slice(0, 40));
  await aufbau([[11, 0, 0, Math.PI]]); await p.evaluate(() => { SCHLACHT.start(); SCHLACHT.waehle(6); });
  await p.waitForTimeout(300);
  const ui2 = await p.evaluate(() => ({ b: document.querySelector('#bFaeh').innerText.replace(/\s+/g, ' '), op: getComputedStyle(document.querySelector('#bFaeh')).opacity }));
  check('Knopf ausgegraut ohne Fähigkeit (Velites)', /keine/.test(ui2.b) && +ui2.op < 0.6, ui2.b + ' Deckkraft ' + ui2.op);

  // ---------- KI: Schildwall gegen anstürmende Reiter, nicht sonst ----------
  await aufbau([[7, 0, -90, 0], [11, 0, 0, Math.PI]], true);
  await p.evaluate(() => { SCHLACHT.start(); SCHLACHT.tempo(2); });
  const ruhig = await p.evaluate(() => SCHLACHT.units[11].fa);
  await p.evaluate(() => SCHLACHT.angriff(7, 11));
  let kiAn = false; for (let t = 0; t < 60 && !kiAn; t++) { await p.waitForTimeout(250); kiAn = (await p.evaluate(() => SCHLACHT.units[11].fa)) === 'schildwall'; }
  check('KI: Schildwall erst bei anstürmenden Reitern', ruhig == null && kiAn, `vorher ${ruhig}, bei Ansturm ${kiAn}`);

  // ---------- Bild: Schildkröte ----------
  await aufbau([[0, 0, 0, 0]]);
  await p.evaluate(() => { SCHLACHT.start(); SCHLACHT.faehigkeit(0, 'schildkroete'); });
  await p.waitForTimeout(3500);
  const ku = await p.evaluate(() => { const u = SCHLACHT.units[0]; return [u.cx, u.cz]; });
  await p.evaluate(([x, z]) => { SCHLACHT.pause(true); SCHLACHT.kamera(Math.PI * 0.9, 0.35, 16, x, z); }, ku);
  await p.waitForTimeout(1500); await p.screenshot({ path: 'shot/faehigkeit_schildkroete.png' });
  console.log('Bild: shot/faehigkeit_schildkroete.png');

  console.log('FEHLER (Seite)', fehler.length ? fehler.join(' | ') : 'keine');
  console.log(`ERGEBNIS ${ok.length} ok, ${fail.length} fehlgeschlagen${fail.length ? ': ' + fail.join('; ') : ''}`);
  await b.close(); process.exit(fehler.length || fail.length ? 1 : 0);
})();
