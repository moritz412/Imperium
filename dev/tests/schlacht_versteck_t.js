// Verstecken im Wald R3 (31.10.): Gefecht Makedonien, gezielt aufgestellt. Aufruf: node schlacht_versteck_t.js [port=8772]   Bilder: shot/versteck_feind.png, versteck_eigen.png
// Einzelläufe mit Zufall; geprüft werden nur grobe Richtungen. Wald-Mitten: (-135,10) und (95,100) (WALD0 der Testkarte).
const { chromium } = require('playwright');
const PORT = process.argv[2] || 8772;
const ok = [], fail = [];
const check = (n, c, info) => { (c ? ok : fail).push(n); console.log((c ? 'OK   ' : 'FAIL ') + n + (info ? '  ' + info : '')); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1194, height: 834 } }); const fehler = [];
  p.on('pageerror', e => fehler.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/404|Failed to load resource/.test(m.text())) fehler.push(m.text()); });
  await p.goto(`http://localhost:${PORT}/dev/proto/schlacht_spiel.html?g=mittel`);
  await p.waitForFunction(() => window.SCHLACHT && SCHLACHT.phase === 'aufstellung', null, { timeout: 180000 });
  let geladen = false;
  const aufbau = async (paare, px0 = 175, px1 = -175) => {   // Rest geparkt: Seite 0 bei x=px0, Seite 1 bei x=px1 (weit von den Testeinheiten)
    if (!geladen) { geladen = true; await p.evaluate(() => SCHLACHT.gefecht('makedonien')); } else await p.evaluate(() => SCHLACHT.neu());
    await p.waitForFunction(() => SCHLACHT.phase === 'aufstellung' && SCHLACHT.units.length > 0, null, { timeout: 180000 });
    await p.waitForTimeout(1200);
    await p.evaluate(([pa, px]) => {
      SCHLACHT.kiSeiten(false, false);
      const nutz = new Set(pa.map(q => q[0])); let k0 = 0, k1 = 0;
      SCHLACHT.units.forEach(u => { SCHLACHT.haltung(u.i, 'halten'); if (!nutz.has(u.i)) { if (u.side === 0) SCHLACHT.versetzen(u.i, px[0], -130 + 28 * k0++); else SCHLACHT.versetzen(u.i, px[1], -130 + 28 * k1++); } });
      for (const [i, x, z, f] of pa) { SCHLACHT.versetzen(i, x, z); if (f != null) SCHLACHT.units[i].f = f; }
    }, [paare, [px0, px1]]);
    await p.waitForTimeout(1200);
  };
  const warte = sek => p.waitForFunction(s => SCHLACHT.schlachtZeit >= s, sek, { timeout: 300000, polling: 200 });
  const warteBis = async (sek) => { const t0 = await p.evaluate(() => SCHLACHT.schlachtZeit); await warte(t0 + sek); };
  const V = i => p.evaluate(i => SCHLACHT.verst(i), i);

  // ---- 1) Versteckter Feind (Hopliten I, Seite 1) im Wald (-135,10); eigene Velites zunächst weit weg
  await aufbau([[11, -135, 10, 0], [6, 0, 0, 0]]);
  await p.evaluate(() => { SCHLACHT.start(); SCHLACHT.tempo(4); });
  await warteBis(2);
  let v = await V(11);
  check('Feind im Wald (WF>=0,5) ist versteckt', v.vers === true && v.wald >= 0.5, JSON.stringify(v));
  check('versteckter Feind: Ring aus, Banner aus, Feindliste ausgegraut', v.ring === false && v.bannerAus && v.fkVerst, '');
  const fk = await p.evaluate(() => { const f = document.querySelectorAll('#feinde .fk'); for (const e of f) if (e.classList.contains('verst')) return e.innerText.replace(/\s+/g, ' '); return null; });
  check('Feindliste zeigt „?“', !!fk && fk.includes('?'), `„${fk}“`);
  await p.evaluate(() => { SCHLACHT.pause(true); SCHLACHT.kamera(Math.PI * 0.75, 0.42, 70, -135, 25); });
  await p.waitForTimeout(2500); await p.screenshot({ path: 'shot/versteck_feind.png' });
  await p.evaluate(() => SCHLACHT.pause(false));
  // Annäherung: Velites auf 30 m -> entdeckt, mindestens 10 s sichtbar
  await p.evaluate(() => { SCHLACHT.tempo(1); SCHLACHT.versetzen(6, -135, 40); });
  await warteBis(1);
  v = await V(11);
  check('Annäherung (30 m): entdeckt, aufgedeckt >= 10 s', v.vers === false && v.aufT > 8 && v.ring === true, JSON.stringify(v));
  await p.evaluate(() => SCHLACHT.versetzen(6, -135, 150));
  await warteBis(5);
  v = await V(11);
  check('5 s nach Rückzug des Gegners noch sichtbar (Mindestdauer)', v.vers === false, JSON.stringify(v));
  await warteBis(8);
  v = await V(11);
  check('später wieder versteckt', v.vers === true, JSON.stringify(v));

  // ---- 2) Eigene versteckte Einheit (Hastati I, Seite 0) im Wald (95,100); Bogenschützen (Seite 1) auf 80 m
  await aufbau([[0, 95, 100, 0], [14, 95, 180, Math.PI]], -175, 175);
  await p.evaluate(() => { SCHLACHT.start(); SCHLACHT.tempo(4); });
  await warteBis(8);
  v = await V(0);
  const gz = await p.evaluate(() => ({ fz: SCHLACHT.units[14].fZ, ges: SCHLACHT.geschosse.gesamt }));
  check('eigene Einheit im Wald ist versteckt, Zustand „versteckt“', v.vers === true && v.zustand === 'versteckt', JSON.stringify(v));
  const kt = await p.evaluate(() => document.querySelector('#karten .karte .zst span').innerText);
  check('Karte zeigt „versteckt“', kt === 'versteckt', `„${kt}“`);
  check('Fernkämpfer (Reichweite 110 m, Ziel 80 m) wählt die versteckte Einheit nicht', gz.fz === -1 && gz.ges === 0, JSON.stringify(gz));
  await p.evaluate(() => { SCHLACHT.pause(true); SCHLACHT.kamera(Math.PI * 0.8, 0.4, 70, 95, 120); });
  await p.waitForTimeout(2500); await p.screenshot({ path: 'shot/versteck_eigen.png' });
  await p.evaluate(() => SCHLACHT.pause(false));
  await p.evaluate(() => { SCHLACHT.tempo(1); SCHLACHT.versetzen(14, 95, 130); });
  await warteBis(1);
  v = await V(0);
  check('Fernkämpfer auf 30 m: aufgedeckt', v.vers === false && v.aufT > 8, JSON.stringify(v));

  // ---- 3) Angriff aus dem Versteck: Hastati I im Wald, Hopliten I (Seite 1) 60 m entfernt
  await aufbau([[0, 95, 100, 0], [11, 95, 160, Math.PI]], -175, 175);
  await p.evaluate(() => { SCHLACHT.start(); SCHLACHT.tempo(1); });
  await warteBis(2);
  v = await V(0);
  const m0 = await p.evaluate(() => SCHLACHT.units[11].morale);
  const h0 = await p.evaluate(() => SCHLACHT.hinterhalt);
  await p.evaluate(() => SCHLACHT.angriff(0, 11));
  await p.waitForFunction(() => SCHLACHT.hinterhalt > 0, null, { timeout: 20000, polling: 'raf' });
  const m1 = await p.evaluate(() => SCHLACHT.units[11].morale), h1 = await p.evaluate(() => SCHLACHT.hinterhalt);
  const hz = await p.evaluate(() => document.querySelector('#hinweis').innerText);
  check('vor dem Angriff versteckt', v.vers === true, JSON.stringify(v));
  check('Moralschock beim Ziel (>= 6, Soll 8 minus kurze Erholung)', m0 - m1 >= 6 && h1 === h0 + 1, `${m0.toFixed(1)} -> ${m1.toFixed(1)}, Zähler ${h0}->${h1}`);
  check('Hinweis „Hinterhalt!“', /Hinterhalt/.test(hz), `„${hz}“`);
  v = await V(0);
  check('nach dem Angriff aufgedeckt', v.vers === false && v.aufT > 5, JSON.stringify(v));
  await warteBis(2);
  check('Schock nur einmal', (await p.evaluate(() => SCHLACHT.hinterhalt)) === h1);

  check('keine Seitenfehler', fehler.length === 0, fehler.slice(0, 2).join(' | '));
  await b.close();
  console.log(`\n${ok.length} OK, ${fail.length} FAIL`); process.exit(fail.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
