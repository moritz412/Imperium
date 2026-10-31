// Wege um Hindernisse (Gehöft, Rundhäuser, Felsen): eine Einheit wird auf die andere Seite der Hindernisgruppe befohlen.
// Aufruf: node schlacht_wege_t.js [port=8772] [seite=schlacht_spiel.html]   Server aus der Repo-Wurzel (python -m http.server 8772)
// Gemessen: Ankunftszeit am Ziel, größte Eindringtiefe eines Soldaten in ein Hindernis (m), Zeit mit Soldaten im Hindernis. Bilder: shot/wege_*.png
const { chromium } = require('playwright');
const PORT = process.argv[2] || 8772, SEITE = process.argv[3] || 'schlacht_spiel.html';
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1194, height: 834 } }); const fehler = [];
  p.on('pageerror', e => fehler.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/404|Failed to load resource/.test(m.text())) fehler.push(m.text()); });
  await p.goto(`http://localhost:${PORT}/dev/proto/${SEITE}?g=niedrig`);
  await p.waitForFunction(() => window.SCHLACHT && SCHLACHT.phase === 'aufstellung', null, { timeout: 180000 });
  let ok = true;
  for (const gef of ['karthago', 'kelten']) {
    await p.evaluate(g => { try { SCHLACHT.neu(); } catch (e) {} return SCHLACHT.gefecht(g); }, gef);
    await p.waitForFunction(() => SCHLACHT.phase === 'aufstellung' && SCHLACHT.units.length > 0, null, { timeout: 180000 });
    await p.waitForTimeout(1500);
    const um = await p.evaluate(() => SCHLACHT.umwelt);
    const geb = um.liste.filter(h => h[0] === '' || h[0] === 'rundhaus' || /haus|hof|mauer|zaun/i.test(h[0]));
    const cx = geb.reduce((a, h) => a + h[1], 0) / geb.length, cz = geb.reduce((a, h) => a + h[2], 0) / geb.length;
    console.log(`GEFECHT ${gef}: ${um.liste.length} Hindernisse, Gruppenmitte ${Math.round(cx)},${Math.round(cz)}`);
    // Richtungen: von der Feldmitte zur Gruppe (quer hindurch), und längs (z)
    for (const [name, dx, dz] of [['quer', -Math.sign(cx) * 0 + (0 - cx), (0 - cz)], ['laengs', 0, 1]]) {
      const l = Math.hypot(dx, dz) || 1, ux = dx / l, uz = dz / l;
      const R = Math.max(...(um.gruppen || [0, 0, 14]).filter((v, k) => k % 3 === 2)), kl = v => Math.max(-185, Math.min(185, v)), kz = v => Math.max(-135, Math.min(135, v));
      const sx = kl(cx + ux * (R + 30)), sz = kz(cz + uz * (R + 30)), tx = kl(cx - ux * (R + 20)), tz = kz(cz - uz * (R + 20));
      const r = await p.evaluate(async ([sx, sz, tx, tz]) => {
        SCHLACHT.kiSeiten(false, false);
        for (const u of SCHLACHT.units) SCHLACHT.haltung(u.i, 'halten');
        const i = SCHLACHT.units.find(u => u.side === 0 && !u.reit && !u.fern).i;   // Fußtruppe
        for (const u of SCHLACHT.units) if (u.i !== i) SCHLACHT.versetzen(u.i, -Math.sign(sx) * 120 + (u.i % 7) * 12, u.side ? 120 : -120);   // alle anderen weit weg, damit nichts stört
        SCHLACHT.versetzen(i, sx, sz);
        // Soldaten nach dem Versetzen sauber stehen lassen
        await new Promise(r => setTimeout(r, 1500));
        SCHLACHT.start(); SCHLACHT.tempo(4);
        SCHLACHT.befehl(i, tx, tz, false);
        const hind = SCHLACHT.umwelt.liste, u = SCHLACHT.units[i];
        window.__pen = { max: 0, zeit: 0, t0: SCHLACHT.zeit, ank: null, minAbst: 1e9 };
        const ids = []; for (let k = 0; k < SCHLACHT.units.length * 60; k++) { const q = SCHLACHT.soldat(k); if (q && q.unit === i && q.st <= 3) ids.push(k); }
        const t0 = SCHLACHT.zeit; let last = t0, ank = null;
        while (SCHLACHT.zeit - t0 < 150) {
          await new Promise(r => setTimeout(r, 120));
          const dt = SCHLACHT.zeit - last; last = SCHLACHT.zeit;
          let pen = 0;
          for (const k of ids) { const q = SCHLACHT.soldat(k); for (const h of hind) { const d = Math.hypot(q.x - h[1], q.z - h[2]), tief = h[3] + q.rad - d; if (tief > pen) pen = tief; } }
          if (pen > window.__pen.max) window.__pen.max = pen;
          if (pen > 0.35) window.__pen.zeit += dt;
          if (Math.hypot(u.cx - tx, u.cz - tz) < 8) { ank = SCHLACHT.zeit - t0; break; }
        }
        let mx = 0, mz = 0, n = 0; for (const k of ids) { const q = SCHLACHT.soldat(k); if (q.st <= 3) { mx += q.x; mz += q.z; n++; } }
        return { ank, pen: window.__pen.max, penZeit: window.__pen.zeit, ende: [Math.round(u.cx), Math.round(u.cz)], ziel: [Math.round(tx), Math.round(tz)], schwerpunktAbstand: Math.round(Math.hypot(mx / n - tx, mz / n - tz)), n };
      }, [sx, sz, tx, tz]);
      const gut = r.ank != null && r.pen < 1.2 && r.penZeit < 3;
      if (!gut) ok = false;
      console.log(`  ${name.padEnd(7)} Start ${Math.round(sx)},${Math.round(sz)} -> Ziel ${r.ziel}: ${r.ank != null ? 'angekommen nach ' + r.ank.toFixed(0) + ' s' : 'NICHT angekommen (Anker bei ' + r.ende + ', Soldaten-Schwerpunkt ' + r.schwerpunktAbstand + ' m vom Ziel)'} | größte Eindringtiefe ${r.pen.toFixed(2)} m, Zeit im Hindernis ${r.penZeit.toFixed(1)} s | ${gut ? 'OK' : 'FEHLER'}`);
      if (name === 'quer') {   // Bild: Einheit mitten beim Umgehen (neues Gefecht nicht nötig)
        await p.evaluate(([x, z]) => SCHLACHT.kamera(Math.PI * 0.5, 0.5, 60, x, z), [cx, cz]); await p.waitForTimeout(600);
        await p.screenshot({ path: `shot/wege_${gef}_${name}.png` });
      }
      await p.evaluate(() => { try { SCHLACHT.neu(); } catch (e) {} });
      await p.waitForTimeout(500);
    }
  }
  console.log('FEHLER (Seite)', fehler.length ? fehler.join(' | ') : 'keine'); console.log(ok ? 'ERGEBNIS: alle Wege frei' : 'ERGEBNIS: mindestens ein Weg blockiert oder Soldaten im Hindernis');
  await b.close(); process.exit(ok && !fehler.length ? 0 : 1);
})();
