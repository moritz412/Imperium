// Kriegselefanten und Umgebungsteile: Gefecht Karthago (Elefanten vor der Mitte), 40 s bei Tempo 2, Kennzahlen, Bilder. Aufruf: node schlacht_elefant_t.js [port]
// Server aus der Repo-Wurzel (python -m http.server 8772). Bilder: shot/elefant_*.png
const { chromium } = require('playwright');
const PORT = process.argv[2] || 8772;
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1194, height: 834 } }); const fehler = [];
  p.on('pageerror', e => fehler.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/404|Failed to load resource/.test(m.text())) fehler.push(m.text()); });
  const URL = `http://localhost:${PORT}/dev/proto/schlacht_spiel.html?g=mittel`;
  await p.goto(URL);
  await p.waitForFunction(() => window.SCHLACHT && SCHLACHT.phase === 'aufstellung', null, { timeout: 120000 });
  await p.evaluate(() => SCHLACHT.gefecht('karthago'));
  await p.waitForFunction(() => SCHLACHT.phase === 'aufstellung' && SCHLACHT.units.length > 0 && SCHLACHT.pakete.includes('E_elefant'), null, { timeout: 120000 });
  await p.waitForTimeout(2500);
  console.log('ROSTER\n' + await p.evaluate(() => SCHLACHT.units.map(u => u.i + ' s' + u.side + ' ' + u.name + ':' + u.ein.paket + (u.ele ? ' [Elefant ' + u.np + ' Tiere, Reittier ' + u.ein.reittier + ', hp ' + u.def.hp + ', Tempo ' + u.def.walk.toFixed(1) + '/' + u.def.run.toFixed(1) + ']' : u.reit ? ' [reit ' + u.np + ']' : '')).join('\n')));
  console.log('Pakete', JSON.stringify(await p.evaluate(() => SCHLACHT.pakete)));
  const um = await p.evaluate(() => SCHLACHT.umwelt);
  console.log('UMWELT Karthago', JSON.stringify(um.teile), 'Hindernisse', um.hindernisse);
  const ele = await p.evaluate(() => SCHLACHT.units.filter(u => u.ele).map(u => u.i));
  if (!ele.length) { console.log('KEINE Elefanten-Einheit -> Abbruch'); await b.close(); process.exit(1); }
  // Bild 1: Elefanten stehend, nah (Seite, dann schräg von hinten)
  const e0 = await p.evaluate(i => { const u = SCHLACHT.units[i]; return [u.cx, u.cz]; }, ele[0]);
  await p.evaluate(([x, z]) => SCHLACHT.kamera(Math.PI * 0.55, 0.14, 13, x, z), e0);
  await p.waitForTimeout(1500); await p.screenshot({ path: 'shot/elefant_1stehend.png' });
  await p.evaluate(([x, z]) => SCHLACHT.kamera(Math.PI * 1.05, 0.2, 10, x, z), e0);
  await p.waitForTimeout(1200); await p.screenshot({ path: 'shot/elefant_1stehend_b.png' });
  // Bild 2/3: Gehöft und Felsen (Karthago), Rundhäuser (Kelten)
  async function umweltBild(name) {
    const u = await p.evaluate(() => SCHLACHT.umwelt);
    const geb = u.liste.filter(h => h[0] === ''), fels = u.liste.filter(h => h[0] === 'fels_gross' || h[0] === 'fels_mittel');
    if (!geb.length) return console.log('kein Gebäude für Bild ' + name);
    const cx = geb.reduce((a, h) => a + h[1], 0) / geb.length, cz = geb.reduce((a, h) => a + h[2], 0) / geb.length;
    await p.evaluate(([x, z]) => SCHLACHT.kamera(Math.PI * 0.35, 0.3, 42, x, z), [cx, cz]);
    await p.waitForTimeout(1800); await p.screenshot({ path: `shot/elefant_3${name}.png` });
    await p.evaluate(([x, z]) => SCHLACHT.kamera(Math.PI * 0.8, 0.12, 19, x, z), [cx, cz]);
    await p.waitForTimeout(1200); await p.screenshot({ path: `shot/elefant_3${name}_nah.png` });
    if (fels.length) { await p.evaluate(([x, z]) => SCHLACHT.kamera(Math.PI * 0.2, 0.18, 14, x, z), [fels[0][1], fels[0][2]]); await p.waitForTimeout(1000); await p.screenshot({ path: `shot/elefant_3${name}_fels.png` }); }
    console.log('Gebäudemitte', name, Math.round(cx), Math.round(cz), 'Teile', JSON.stringify(u.teile));
  }
  await umweltBild('a_karthago');
  // Schlacht 40 s
  await p.evaluate(() => { SCHLACHT.start(); SCHLACHT.tempo(2); });
  const shots = { ans: false, pan: false }; let log = [], panSeen = 0, forced = null;
  for (let t = 0; t < 42; t++) {
    await p.waitForTimeout(1000);
    const st = await p.evaluate(el => {
      const U = SCHLACHT.units, z = SCHLACHT.zaehler;
      return { z: { ansturm: z.ansturm, elefAnsturm: z.elefAnsturm, elefUmg: z.elefUmgeworfen, stampfen: z.stampfen, panik: z.panik, panikTote: z.panikTote, panikEigene: z.panikEigene, panikFeinde: z.panikFeinde, furcht: z.furcht, kills: z.kills, fern: z.fernTreffer },
        ele: el.map(i => { const u = U[i]; return { i, st: u.state, n: u.strength, mor: Math.round(u.morale), x: Math.round(u.cx), zz: Math.round(u.cz), v: +u.curSpeed.toFixed(1), eng: u.engaged, pan: u.panikN, scheu: U.some(w => w.scheu) }; }),
        schnell: (() => { for (let i = 0; i < 1200; i++) { const q = SCHLACHT.soldat(i); if (q && q.ele && q.st < 3 && q.v > 4) return { i, x: q.x, z: q.z, v: q.v, clip: q.pferd }; } return null; })(),
        pan: (() => { for (let i = 0; i < 1200; i++) { const q = SCHLACHT.soldat(i); if (q && q.ele && q.pan) return { i, x: q.x, z: q.z, clip: q.pferd, pan: q.pan }; } return null; })(),
        zeit: Math.round(SCHLACHT.schlachtZeit), phase: SCHLACHT.phase, gef: SCHLACHT.gefallen };
    }, ele);
    if (t % 4 === 0) log.push(JSON.stringify(st));
    if (st.pan) panSeen++;
    if (st.schnell && !shots.ans) { shots.ans = true; await p.evaluate(([x, z]) => { SCHLACHT.pause(true); SCHLACHT.kamera(Math.PI * 0.6, 0.15, 17, x, z); }, [st.schnell.x, st.schnell.z]); await p.waitForTimeout(1500); await p.screenshot({ path: 'shot/elefant_2ansturm.png' });
      await p.evaluate(([x, z]) => SCHLACHT.kamera(Math.PI * 0.95, 0.2, 14, x, z), [st.schnell.x, st.schnell.z]); await p.waitForTimeout(1200); await p.screenshot({ path: 'shot/elefant_2ansturm_b.png' }); await p.evaluate(() => SCHLACHT.pause(false)); }
    if (st.pan && !shots.pan) { shots.pan = true; await p.evaluate(([x, z]) => { SCHLACHT.pause(true); SCHLACHT.kamera(Math.PI * 0.6, 0.2, 18, x, z); }, [st.pan.x, st.pan.z]); await p.waitForTimeout(1500); await p.screenshot({ path: 'shot/elefant_4panik_natuerlich.png' }); await p.evaluate(() => SCHLACHT.pause(false)); }
    if (st.phase === 'ende') break;
  }
  console.log('VERLAUF (alle 4 s)\n' + log.join('\n'));
  const s = await p.evaluate(() => ({ z: SCHLACHT.zaehler, gef: SCHLACHT.gefallen, units: SCHLACHT.units.map(u => u.name + ':' + u.strength + '/' + u.np + ' ' + u.state + ' m' + Math.round(u.morale)), fps: SCHLACHT.fps, ton: SCHLACHT.ton }));
  console.log('KENNZAHLEN', JSON.stringify({ elefAnsturm: s.z.elefAnsturm, ansturmGesamt: s.z.ansturm, umgeworfenDurchElefanten: s.z.elefUmgeworfen, stampfen: s.z.stampfen, panikFaelle: s.z.panik, panikTote: s.z.panikTote, eigeneOpferPanik: s.z.panikEigene, feindOpferPanik: s.z.panikFeinde, furchtSchock: s.z.furcht, kills: s.z.kills, fernTreffer: s.z.fernTreffer }));
  console.log('natürliche Panik: Bilder mit Panik-Tier in', panSeen, 'Messpunkten (je 1 s)');
  console.log('Verluste je Seite (gefallen Rom/Karthago)', JSON.stringify(s.gef)); console.log(s.units.join(' | '));
  console.log('B/s (Software-Rendering, kein iPad)', JSON.stringify(s.fps));
  // Panik gezielt auslösen (nur für das Bild und den Ablauf; kein Spielwert): ein Tier der Elefanteneinheit zwischen Fußvolk
  const q = await b.newPage({ viewport: { width: 1194, height: 834 } });
  q.on('pageerror', e => fehler.push(String(e))); q.on('console', m => { if (m.type() === 'error' && !/404|Failed to load resource/.test(m.text())) fehler.push(m.text()); });
  await q.goto(URL);
  await q.waitForFunction(() => window.SCHLACHT && SCHLACHT.phase === 'aufstellung', null, { timeout: 120000 });
  await q.evaluate(() => SCHLACHT.gefecht('karthago'));
  await q.waitForFunction(() => SCHLACHT.phase === 'aufstellung' && SCHLACHT.pakete.includes('E_elefant'), null, { timeout: 120000 });
  await q.waitForTimeout(1500);
  // Elefanten (Feind) in die eigenen Libyer stellen, Schlacht starten, dann Panik erzwingen
  const pr = await q.evaluate(() => {
    const U = SCHLACHT.units, el = U.find(u => u.ele), lib = U.filter(u => u.side === 1 && !u.reit && !u.fern);
    el.cx = lib[1].cx; el.cz = lib[1].cz - 8; SCHLACHT.start(); SCHLACHT.tempo(2);
    return { ele: el.i, lib: lib.map(u => u.i + ':' + u.strength) };
  });
  await q.waitForTimeout(1500);
  const f = await q.evaluate(i => { const id = SCHLACHT.elefPanik(i, 0);   // Richtung +z: quer durch die eigenen Libyer
     const s0 = SCHLACHT.units.filter(u => u.side === 1 && !u.ele).map(u => u.strength); return { id, s0 }; }, pr.ele);
  console.log('PANIK erzwungen (Testhilfe)', JSON.stringify(f));
  let bild = false;
  for (let t = 0; t < 16; t++) {
    await q.waitForTimeout(1000);
    const r = await q.evaluate(([id]) => { const s = SCHLACHT.soldat(id); return { x: s.x, z: s.z, pan: s.pan, clip: s.pferd, st: s.st, z0: SCHLACHT.zaehler.panikEigene, f: SCHLACHT.zaehler.panikFeinde, tote: SCHLACHT.zaehler.panikTote }; }, [f.id]);
    if (r.pan && !bild && t >= 2) { bild = true; await q.evaluate(([x, z]) => { SCHLACHT.pause(true); SCHLACHT.kamera(Math.PI * 0.62, 0.22, 16, x, z); }, [r.x, r.z]); await q.waitForTimeout(1500); await q.screenshot({ path: 'shot/elefant_4panik.png' }); await q.evaluate(() => SCHLACHT.pause(false)); }
    if (t % 3 === 0) console.log('Panik +' + (t + 1) + ' s', JSON.stringify(r));
  }
  const f1 = await q.evaluate(() => ({ s1: SCHLACHT.units.filter(u => u.side === 1 && !u.ele).map(u => u.strength), z: SCHLACHT.zaehler }));
  console.log('Panik-Ergebnis: umgeworfen / verletzt (alle Elefanten)', f1.z.elefUmgeworfen, '· eigene Soldaten niedergetrampelt', f1.z.panikEigene, '· Feinde', f1.z.panikFeinde, '· Tier gestorben', f1.z.panikTote, '· Einheitsstärken Seite 1 vorher', JSON.stringify(f.s0), 'nachher', JSON.stringify(f1.s1));
  // Hindernisse: Hastati I marschiert in der Schlacht auf das Gehöft zu (Feinde weit weggesetzt); kleinster Abstand aller Soldaten zu allen Hindernissen
  {
    const um2 = await q.evaluate(() => SCHLACHT.umwelt), geb = um2.liste.filter(h => h[0] === '');
    const gx = geb.reduce((a, h) => a + h[1], 0) / geb.length, gz = geb.reduce((a, h) => a + h[2], 0) / geb.length;
    await q.evaluate(([x, z]) => { for (const u of SCHLACHT.units) if (u.side === 1) SCHLACHT.versetzen(u.i, -190 + (u.i % 3) * 8, 140 - (u.i % 4) * 6); SCHLACHT.versetzen(0, x - 4, z - 40); SCHLACHT.befehl(0, x, z, true); SCHLACHT.tempo(2); }, [gx, gz]);
    let minK = 1e9, imHaus = 0, ziel = null, spur = [];
    for (let t = 0; t < 30; t++) {
      await q.waitForTimeout(700);
      const r = await q.evaluate(L => { let m = 1e9, in_ = 0; const u = SCHLACHT.units[0];
        for (let i = 0; i < 60; i++) { const s = SCHLACHT.soldat(i); if (!s || s.st > 1) continue;
          for (const h of L) { if (h[3] < 1) continue; const c = Math.hypot(s.x - h[1], s.z - h[2]) - h[3] - 0.375; if (c < m) m = c; if (c < -0.05) in_++; } }
        return { m, in_, cx: u.cx, cz: u.cz, d: u.hasDest, dx: u.destX, dz: u.destZ }; }, um2.liste);
      if (r.m < minK) minK = r.m; imHaus += r.in_; ziel = [Math.round(r.dx), Math.round(r.dz)]; if (t % 5 === 0) spur.push([Math.round(r.cx), Math.round(r.cz), +r.m.toFixed(1)]);
    }
    console.log('HINDERNISSE: Weg der Einheit (x,z,Abstand zum nächsten Hindernis)', JSON.stringify(spur));
    console.log('HINDERNISSE: kleinster Abstand Soldat–Hindernis (Rand) ' + minK.toFixed(2) + ' m, Messungen mit Soldat im Hindernis: ' + imHaus + ', Zielpunkt nach Verschiebung ' + JSON.stringify(ziel) + ' (Gehöftmitte ' + Math.round(gx) + ',' + Math.round(gz) + ')');
    await q.evaluate(() => SCHLACHT.pause(true));
    await q.evaluate(([x, z]) => SCHLACHT.kamera(Math.PI * 0.9, 0.35, 34, x, z), [gx, gz]); await q.waitForTimeout(1500); await q.screenshot({ path: 'shot/elefant_3b_soldaten_am_haus.png' });
  }
  const r2 = await b.newPage({ viewport: { width: 1194, height: 834 } });
  r2.on('pageerror', e => fehler.push(String(e))); r2.on('console', m => { if (m.type() === 'error' && !/404|Failed to load resource/.test(m.text())) fehler.push(m.text()); });
  await r2.goto(URL);
  await r2.waitForFunction(() => window.SCHLACHT && SCHLACHT.phase === 'aufstellung', null, { timeout: 120000 });
  // Rundhäuser: Gefecht Kelten
  await r2.evaluate(() => SCHLACHT.gefecht('kelten'));
  await r2.waitForFunction(() => SCHLACHT.aktuellesGefecht === 'kelten' && SCHLACHT.phase === 'aufstellung' && SCHLACHT.units.length > 0, null, { timeout: 120000 });
  await r2.waitForTimeout(1500);
  {
    const u = await r2.evaluate(() => SCHLACHT.umwelt), geb = u.liste.filter(h => h[0] === ''), fels = u.liste.filter(h => /fels_(gross|mittel)/.test(h[0]));
    const cx = geb.reduce((a, h) => a + h[1], 0) / geb.length, cz = geb.reduce((a, h) => a + h[2], 0) / geb.length;
    console.log('UMWELT Kelten', JSON.stringify(u.teile), 'Hindernisse', u.hindernisse);
    await r2.evaluate(([x, z]) => SCHLACHT.kamera(Math.PI * 0.4, 0.3, 46, x, z), [cx, cz]); await r2.waitForTimeout(1800); await r2.screenshot({ path: 'shot/elefant_3c_kelten.png' });
    await r2.evaluate(([x, z]) => SCHLACHT.kamera(Math.PI * 0.75, 0.13, 20, x, z), [cx, cz]); await r2.waitForTimeout(1200); await r2.screenshot({ path: 'shot/elefant_3c_kelten_nah.png' });
    // Grafikstufe niedrig: weniger Felsen
    const vor = await r2.evaluate(() => SCHLACHT.umwelt.teile.fels_klein.sichtbar + SCHLACHT.umwelt.teile.fels_mittel.sichtbar);
    await r2.evaluate(() => SCHLACHT.setGrafik('niedrig'));
    const nach = await r2.evaluate(() => SCHLACHT.umwelt.teile.fels_klein.sichtbar + SCHLACHT.umwelt.teile.fels_mittel.sichtbar);
    console.log('Felsen sichtbar (klein+mittel): mittel', vor, '-> niedrig', nach);
  }
  console.log('Fehler:', fehler.length ? fehler.slice(0, 6) : 'keine');
  await b.close();
})().catch(e => { console.error('ABBRUCH', e.message); process.exit(1); });
