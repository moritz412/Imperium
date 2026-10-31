// Test Städte Roms (Stufe 1): node staedte_t.js [port] [bild.png]. Server aus der Repo-Wurzel starten (python -m http.server 8772).
// Prüft: Laden ohne Fehler, Bauen per API und per Ziehen, Ketten Brot/Ziegel über 2 Jahre, Gebäudefenster, Speichern.
const { chromium } = require('playwright'); const fs = require('fs');
const PORT = process.argv[2] || '8772', BILD = process.argv[3] || '';
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined, args: process.env.PW_GPU ? [] : ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const ctx = await b.newContext({ viewport: { width: 1180, height: 820 }, deviceScaleFactor: 1, hasTouch: true });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push('PAGE ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|WebGL|GPU stall/.test(m.text())) errs.push('CON ' + m.text().slice(0, 160)); });
  await p.route(/cdnjs/, r => r.fulfill({ body: fs.readFileSync(__dirname + '/node_modules/three/build/three.min.js'), contentType: 'application/javascript' }));
  await p.route(/fonts\.g/, r => r.abort());
  const R = []; const ok = (n, c, i = '') => { R.push(!!c); console.log((c ? 'PASS ' : 'FAIL ') + n + (i ? '  ' + i : '')); };
  await p.addInitScript(() => { try { localStorage.removeItem('staedte_roms.v1'); } catch (e) {} });
  await p.goto(`http://localhost:${PORT}/dev/staedte/index.html`, { timeout: 120000 });
  await p.waitForFunction(() => window.SR, null, { timeout: 60000 });
  ok('Geladen, Spielobjekt vorhanden', true);
  await p.evaluate(() => SR.tempo(0));

  // Bauen per API
  const bau = await p.evaluate(() => {
    const liste = [['huette', 16, 14], ['huette', 19, 14], ['huette', 16, 17], ['huette', 22, 14], ['holzfaeller', 4, 10], ['feld', 9, 20], ['muehle', 13, 20],
      ['baeckerei', 16, 20], ['lehmgrube', 20, 20], ['ziegelei', 23, 20], ['brunnen', 19, 17]];
    return liste.map(([t, x, z]) => { const r = SR.bauen(t, x, z); return t + ':' + (r.ok ? 'ok' : r.grund); });
  });
  ok('11 Gebäude gebaut', bau.every(s => s.endsWith(':ok')), bau.filter(s => !s.endsWith(':ok')).join(', '));
  const besetzt = await p.evaluate(() => SR.bauen('huette', 16, 14).grund);
  ok('Belegtes Feld wird abgelehnt', /schon etwas/.test(besetzt), besetzt);
  const wald = await p.evaluate(() => SR.bauen('huette', 0, 5).grund);
  ok('Wald wird abgelehnt', /Wald/.test(wald), wald);

  // Bauen per Ziehen aus der Leiste (Maus)
  const vorher = await p.evaluate(() => SR.S.geb.length);
  await p.click('#reiter button[data-k="Wohnen"]');
  const karte = await p.$('.karte[data-t="huette"]'); const kb = await karte.boundingBox();
  await p.mouse.move(kb.x + kb.width / 2, kb.y + kb.height / 2); await p.mouse.down();
  for (let i = 1; i <= 12; i++) await p.mouse.move(kb.x + kb.width / 2 + i * 10, kb.y - i * 30);
  await p.mouse.move(330, 480); await p.mouse.up();
  const nachher = await p.evaluate(() => SR.S.geb.length);
  ok('Hütte per Ziehen gebaut', nachher === vorher + 1, `${vorher} → ${nachher}`);

  // Zwei Jahre laufen lassen, Markt nach dem ersten Herbst
  const lauf = await p.evaluate(() => {
    const spur = [];
    for (let m = 0; m < 24; m++) {
      if (m === 8) SR.bauen('markt', 20, 10);
      SR.monate(1);
      const S = SR.S; spur.push({ m: S.monat, bew: SR.sim.einwohner(S), brot: Math.round(S.gut.brot), korn: Math.round(S.gut.getreide), ziegel: Math.round(S.gut.ziegel), st: Math.round(S.stimmung) });
    }
    const S = SR.S;
    return { spur, auftrag: S.auftrag, casa: S.geb.filter(b => b.stufe === 2).length, denare: Math.round(S.gut.denare), probleme: S.geb.flatMap(b => b.status.filter(s => !s.leicht).map(s => b.t + ':' + s.text)) };
  });
  const ende = lauf.spur.at(-1), maxBrot = Math.max(...lauf.spur.map(s => s.brot));
  console.log('  Verlauf (Monat/Einwohner/Brot/Getreide/Ziegel/Stimmung):', lauf.spur.filter((s, i) => i % 3 === 2).map(s => `${s.m}/${s.bew}/${s.brot}/${s.korn}/${s.ziegel}/${s.st}`).join('  '));
  ok('Einwohner wachsen', ende.bew >= 15, 'Einwohner ' + ende.bew);
  ok('Brotkette liefert', lauf.spur.some((s, i) => i && s.brot > lauf.spur[i - 1].brot), 'Brot max ' + maxBrot);
  ok('Ziegelkette liefert', lauf.spur.some((s, i) => i && s.ziegel > lauf.spur[i - 1].ziegel));
  ok('Senatsaufträge schreiten fort', lauf.auftrag >= 4, 'Auftrag ' + lauf.auftrag + ', Casas ' + lauf.casa);
  ok('Keine Hungersnot am Ende', !lauf.probleme.some(s => /Hunger/.test(s)), lauf.probleme.slice(0, 5).join(', '));

  // Gebäudefenster mit Kette
  const fenster = await p.evaluate(() => { const b = SR.S.geb.find(x => x.t === 'baeckerei'); SR.oeffne(b.id); const i = document.querySelector('#info'); return !i.hidden && !!i.querySelector('.kette') && i.textContent.includes('Mehl'); });
  ok('Gebäudefenster zeigt Kette', fenster);
  // Antippen eines leeren Feldes schließt das Fenster
  await p.mouse.click(300, 420);
  ok('Tippen auf leeres Feld schließt Fenster', await p.evaluate(() => document.querySelector('#info').hidden));

  // Speichern
  const gesp = await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('staedte_roms.v1') || 'null'); return s ? s.geb.length : 0; });
  ok('Spielstand gespeichert (Jahreszeitwechsel)', gesp > 0, gesp + ' Gebäude');

  if (BILD) { await p.evaluate(() => SR.tempo(0)); await p.waitForTimeout(500); await p.screenshot({ path: BILD }); console.log('  Bild: ' + BILD); }
  ok('Keine Seiten-/Konsolenfehler', !errs.length, errs.slice(0, 4).join(' | '));
  console.log(`STAEDTE ${R.filter(Boolean).length}/${R.length}`);
  await b.close();
})();
