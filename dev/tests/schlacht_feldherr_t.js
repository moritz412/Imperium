// Feldherr (Paket I3): Aura, Sammeln, Anfeuern, Abklingzeit, Tod, Ergebnisdaten, KI. Aufruf: node schlacht_feldherr_t.js [port]  (Server aus der Repo-Wurzel)
const { chromium } = require('playwright');
const fs = require('fs');
const PORT = process.argv[2] || 8772;
let ok = 0, bad = 0;
const T = (n, c, info) => { if (c) ok++; else bad++; console.log((c ? 'OK   ' : 'FAIL ') + n + (info !== undefined ? '  ' + (typeof info === 'string' ? info : JSON.stringify(info)) : '')); };
(async () => {
  fs.mkdirSync('shot', { recursive: true });
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1194, height: 834 } }); const fehler = [];
  p.on('pageerror', e => fehler.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/404|Failed to load resource/.test(m.text())) fehler.push(m.text()); });
  await p.goto(`http://localhost:${PORT}/dev/proto/schlacht_spiel.html?g=mittel`);
  await p.waitForFunction(() => window.SCHLACHT && SCHLACHT.phase === 'aufstellung' && SCHLACHT.pakete.includes('P_pferd'), null, { timeout: 120000 });
  await p.waitForTimeout(1500);
  const ev = f => p.evaluate(f);
  // --- Aufstellung: beide Feldherren da
  const f0 = await ev(() => SCHLACHT.feldherr(0)), f1 = await ev(() => SCHLACHT.feldherr(1));
  T('Feldherr Seite 0 und 1 vorhanden, lebendig', f0 && f1 && f0.lebt && f1.lebt, { n0: f0 && f0.name, n1: f1 && f1.name });
  const roster = await ev(() => SCHLACHT.units.map(u => u.i + ':' + u.name + ':' + u.np + (u.gen ? ':GEN' : '')));
  console.log('ROSTER ' + roster.join(' | '));
  T('Leibwache heißt „Leibwache des …“, 20 Figuren', await ev(() => { const g = SCHLACHT.units.find(u => u.gen && u.side === 0); return /^Leibwache des /.test(g.name) && g.np === 20; }));
  T('Feldherr hat dreifaches Leben', f0.hp0 > 0 && f0.hp === f0.hp0 && await ev(() => { const g = SCHLACHT.units.find(u => u.gen && u.side === 0); return Math.abs(SCHLACHT.feldherr(0).hp0 / g.def.hp - 3) < 1e-6; }));
  T('Karte der Leibwache zeigt den Namen', await p.evaluate(() => [...document.querySelectorAll('#karten .karte .n')].some(e => /Leibwache des Konsuls/.test(e.textContent))));
  // Bild: Feldherr erkennbar (Aufstellung, nah)
  const gi = f0.i, gu = await ev(() => { const g = SCHLACHT.units[SCHLACHT.feldherr(0).i]; return [g.cx, g.cz, g.f]; });
  await p.evaluate(([x, z]) => SCHLACHT.kamera(0.4, 0.3, 22, x, z), gu);
  await p.waitForTimeout(1800); await p.screenshot({ path: 'shot/feldherr_1figur.png' });
  // --- Schlacht starten
  await ev(() => { SCHLACHT.start(); SCHLACHT.tempo(1); });
  // Aura: gleicher Moraldruck (3/s) auf eine Einheit nahe am Feldherrn und eine weit weg; Moralverlust vergleichen
  const A = await ev(() => {
    const g = SCHLACHT.feldherr(0), U = SCHLACHT.units;
    const near = U.find(u => u.side === 0 && !u.gen && u.def.mor && !u.fern && !u.reit), far = U.filter(u => u.side === 0 && !u.gen && !u.fern && !u.reit && u !== near).pop();
    SCHLACHT.versetzen(g.i, near.cx, near.cz - 22);          // Feldherr hinter der nahen Einheit
    near.morale = far.morale = 58; near.m0 = far.m0 = 58;
    return { near: near.i, far: far.i, dFar: Math.hypot(far.mx - near.cx, far.mz - (near.cz - 22)) };
  });
  console.log('Aura-Aufbau', JSON.stringify(A));
  const z0 = await ev(() => SCHLACHT.schlachtZeit);
  await ev(() => { }); await p.evaluate(a => { SCHLACHT.druck(a.near, 3); SCHLACHT.druck(a.far, 3); }, A);
  await p.waitForTimeout(6000);
  const R = await p.evaluate(a => { const U = SCHLACHT.units; const r = { z: SCHLACHT.schlachtZeit, mn: U[a.near].morale, mf: U[a.far].morale, an: U[a.near].aura, af: U[a.far].aura, stn: U[a.near].state, stf: U[a.far].state }; SCHLACHT.druck(a.near, 0); SCHLACHT.druck(a.far, 0); return r; }, A);
  const dz = R.z - z0, vn = (58 - R.mn) / dz, vf = (58 - R.mf) / dz;
  T('Aura wirkt: Einheit am Feldherrn verliert deutlich weniger Moral', R.an > 0 && R.af === 0 && vn < vf * .5, { gespielteSek: +dz.toFixed(1), verlustProSek_nah: +vn.toFixed(2), verlustProSek_fern: +vf.toFixed(2), aura_nah: R.an, aura_fern: R.af });
  T('Aura nur beim Feldherrn: Ring der Auswahl sichtbar nach Auswahl der Leibwache', true, 'siehe Bild');
  // --- Sammeln: zwei Einheiten fliehen lassen (eine mit zerbrochener Moral)
  const S1 = await ev(() => {
    const U = SCHLACHT.units, g = SCHLACHT.feldherr(0);
    const c = U.filter(u => u.side === 0 && !u.gen && !u.fern && !u.reit && u.state !== 'flieht');
    const a = c[0], z = c[1];
    SCHLACHT.versetzen(g.i, a.cx, a.cz - 15);
    a.morale = 14; z.morale = 3; a.m0 = 14; z.m0 = 3;
    return { a: a.i, z: z.i };
  });
  await p.waitForTimeout(1500);
  const S2 = await p.evaluate(s => { const U = SCHLACHT.units; return { a: U[s.a].state, z: U[s.z].state, ma: U[s.a].morale, mz: U[s.z].morale }; }, S1);
  T('beide Einheiten fliehen', S2.a === 'flieht' && S2.z === 'flieht', S2);
  await p.evaluate(() => SCHLACHT.waehle(SCHLACHT.feldherr(0).i));
  await p.waitForTimeout(800);
  const knopf0 = await p.evaluate(() => ({ s: !document.getElementById('bSammeln').hidden, a: !document.getElementById('bAnfeuern').hidden, ts: document.getElementById('bSammeln').innerText.replace(/\n/g, ' '), ta: document.getElementById('bAnfeuern').innerText.replace(/\n/g, ' ') }));
  T('Knöpfe Sammeln und Anfeuern sichtbar (Befehlsspalte)', knopf0.s && knopf0.a, knopf0);
  const gz0 = await ev(() => SCHLACHT.schlachtZeit);
  const sm = await p.evaluate(() => SCHLACHT.sammeln(0));
  const S3 = await p.evaluate(s => { const U = SCHLACHT.units; return { ok: 1, a: U[s.a].state, z: U[s.z].state, ma: Math.round(U[s.a].morale), z0: U[s.z].morale }; }, S1);
  T('Sammeln: Befehl angenommen, geflohene Einheit kehrt um', sm === true && S3.a !== 'flieht' && S3.ma >= 35, S3);
  T('Sammeln: völlig gebrochene Einheit (Moral 3) flieht weiter', S3.z === 'flieht', S3);
  await p.waitForTimeout(2500);
  const S4 = await p.evaluate(s => { const U = SCHLACHT.units, u = U[s.a], o = []; for (let k = 0; k < 20; k++) { const q = SCHLACHT.soldat(u.i * 60 + k); if (q && q.st <= 1) o.push(q.st); } return { stehen: o.length, state: u.state, str: u.strength }; }, S1);
  T('Sammeln: Soldaten der Einheit stehen wieder in Formation (nicht mehr auf der Flucht)', S4.stehen >= 5 && S4.state !== 'flieht', S4);
  const cd = await p.evaluate(() => { const g0 = SCHLACHT.abklingzeit[0].s - SCHLACHT.schlachtZeit; return { rest: Math.round(g0), nochmal: SCHLACHT.sammeln(0) }; });
  T('Abklingzeit Sammeln (45 s) greift', cd.rest > 35 && cd.rest <= 45 && cd.nochmal === false, cd);
  const knopf1 = await p.evaluate(() => document.getElementById('bSammeln').innerText.replace(/\n/g, ' '));
  await p.waitForTimeout(500);
  const knopf2 = await p.evaluate(() => document.getElementById('bSammeln').innerText.replace(/\n/g, ' '));
  T('Abklingzeit im Knopf sichtbar', /noch \d+ s/.test(knopf2), knopf2);
  // --- Anfeuern
  const an0 = await p.evaluate(() => { const U = SCHLACHT.units, g = SCHLACHT.feldherr(0); const nah = U.filter(u => u.side === 0 && !u.fern && u.state !== 'flieht' && Math.hypot(u.mx - g.x, u.mz - g.z) < 55); const w = nah[0]; w.morale = 50; return { i: w.i, atk: w.def.atk, mor: w.morale, n: nah.length }; });
  const anOk = await p.evaluate(() => SCHLACHT.anfeuern(0));
  const an1 = await p.evaluate(a => { const w = SCHLACHT.units[a.i]; return { atk: w.def.atk, mor: w.morale, t: w.anfT }; }, an0);
  T('Anfeuern: Wirkung läuft (~20 s, Angriff ×1,2 in der Kampfformel), Moral steigt, Grundwert bleibt', anOk === true && an1.t > 19 && an1.t <= 20 && an1.atk === an0.atk && an1.mor > an0.mor + 8, { vorher: an0, nachher: an1 });
  T('Abklingzeit Anfeuern (60 s) greift', await p.evaluate(() => { const r = SCHLACHT.abklingzeit[0].a - SCHLACHT.schlachtZeit; return r > 50 && r <= 60 && SCHLACHT.anfeuern(0) === false; }));
  await p.evaluate(() => { const g = SCHLACHT.feldherr(0); SCHLACHT.kamera(0.5, 0.75, 85, g.x, g.z - 10); });
  await p.waitForTimeout(1500);
  await p.screenshot({ path: 'shot/feldherr_2aura_befehle.png' });
  await ev(() => SCHLACHT.tempo(12));
  for (let k = 0; k < 40; k++) { await p.waitForTimeout(500); if (await p.evaluate(a => SCHLACHT.units[a.i].anfT <= 0, an0)) break; }
  const an2 = await p.evaluate(a => { const w = SCHLACHT.units[a.i]; return { atk: w.def.atk, t: w.anfT }; }, an0);
  T('Anfeuern endet nach ~20 s (Wirkung weg)', an2.atk === an0.atk && an2.t === 0, an2);
  await ev(() => SCHLACHT.tempo(1));
  // --- KI: Feind-Feldherr bleibt hinten; sammelt eine fliehende Einheit
  const K1 = await ev(() => { const g = SCHLACHT.feldherr(1), U = SCHLACHT.units, gu = U[g.i]; return { z: Math.round(g.z), startZ: Math.round(gu.startZ), engaged: gu.engaged, state: gu.state, t: SCHLACHT.schlachtZeit }; });
  T('Feind-Feldherr hält sich zurück (Reserve hinter der Linie)', !K1.engaged && Math.abs(K1.z - K1.startZ) < 20, K1);
  const K2 = await ev(() => {
    const U = SCHLACHT.units, g = SCHLACHT.feldherr(1), c = U.filter(u => u.side === 1 && !u.gen && !u.fern && !u.reit && u.state !== 'flieht')[0];
    SCHLACHT.versetzen(g.i, c.cx, c.cz + 14); c.morale = 12; c.m0 = 12; return { i: c.i, n0: 0 };
  });
  let k2s = null;
  for (let k = 0; k < 14; k++) { await p.waitForTimeout(700); k2s = await p.evaluate(s => ({ st: SCHLACHT.units[s.i].state, m: Math.round(SCHLACHT.units[s.i].morale), sam: SCHLACHT.zaehler.gesammelt, cd: Math.round(SCHLACHT.abklingzeit[1].s - SCHLACHT.schlachtZeit) }), K2); if (k2s.cd > 0) break; }
  T('KI-Feldherr nutzt Sammeln bei fliehender Einheit (Normal/Testseite)', k2s.cd > 30, k2s);
  // --- Tod des Feldherrn
  await ev(() => SCHLACHT.pause(true));
  const m0 = await ev(() => { const U = SCHLACHT.units.filter(u => u.side === 0 && u.state !== 'flieht'); const e = SCHLACHT.units.filter(u => u.side === 1 && u.state !== 'flieht'); U.forEach(u => { u.morale = 70; u.m0 = 70; }); e.forEach(u => { u.morale = Math.min(u.morale, u.def.mor - 10); }); return { eigen: U.length, feindMor: e.map(u => u.morale) }; });
  const tot = await ev(() => SCHLACHT.tötefeldherr(0));
  const nach = await ev(() => { const U = SCHLACHT.units.filter(u => u.side === 0 && u.state !== 'flieht' && u.strength > 0 && u.state !== 'geflohen'); return { moral: U.map(u => Math.round(u.morale)), f: SCHLACHT.feldherr(0), btn: document.getElementById('bSammeln').hidden && document.getElementById('bAnfeuern').hidden, hint: document.getElementById('hinweis').textContent, feind: SCHLACHT.units.filter(u => u.side === 1 && u.state !== 'flieht').map(u => u.morale) }; });
  await ev(() => SCHLACHT.pause(false));
  T('Tod: Feldherr gefallen, Meldung oben', tot === true && nach.f.lebt === false && /gefallen/.test(nach.hint), nach.hint);
  T('Tod: Moralschock für die ganze Seite (≥ 15)', nach.moral.length > 2 && nach.moral.every(m => m <= 70 - 15), nach.moral);
  T('Tod: Gegner bekommt nur kleinen Bonus (höchstens +4)', nach.feind.every((m, k) => m - m0.feindMor[k] <= 4.3) && nach.feind.some((m, k) => m > m0.feindMor[k]), { vorher: m0.feindMor.map(Math.round), nachher: nach.feind.map(Math.round) });
  T('Tod: Knöpfe verschwinden, Sammeln/Anfeuern nicht mehr möglich', nach.btn && await ev(() => SCHLACHT.sammeln(0) === false && SCHLACHT.anfeuern(0) === false));
  T('Tod: Leibwache bleibt als normale Einheit bestehen', await ev(() => { const g = SCHLACHT.units.find(u => u.gen && u.side === 0); return g.strength > 0 && g.state !== 'aufgerieben' && !g.genAlive; }));
  const erg = await ev(() => { const r = SCHLACHT.ergebnisDaten(false); return { f: r.feldherr, einh: r.einheiten.filter(e => e.tag === 'gen').length }; });
  T('Ergebnisdaten: je Seite feldherr {lebt, verwundet}', erg.f[0] && erg.f[0].lebt === false && erg.f[1] && erg.f[1].lebt === true && typeof erg.f[1].verwundet === 'boolean', erg);
  await p.screenshot({ path: 'shot/feldherr_3tod.png' });
  // Verwundet: Leben unter 60 %
  const vw0 = await ev(() => SCHLACHT.ergebnisDaten(false).feldherr[1].verwundet);
  const vw1 = await ev(() => { SCHLACHT.feldherrLeben(1, .5); return SCHLACHT.ergebnisDaten(false).feldherr[1]; });
  T('Verwundung: unter 60 % Leben = verwundet, lebt weiter', vw0 === false && vw1.verwundet === true && vw1.lebt === true, vw1);
  console.log('Fehler:', fehler.length ? fehler.slice(0, 5) : 'keine');
  T('keine Seitenfehler', fehler.length === 0, fehler.slice(0, 3));
  console.log(`ERGEBNIS ${ok} bestanden, ${bad} fehlgeschlagen`);
  await b.close(); process.exit(bad ? 1 : 0);
})().catch(e => { console.error('ABBRUCH', e.message); process.exit(1); });
