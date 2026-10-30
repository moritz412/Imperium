// Testschlacht E1: Einheiten aus Kampagnenwerten. Aufruf: node schlacht_e1_t.js [port]
// Prüft: keine Konsolenfehler, jedes Gefecht lädt und läuft bis zur Endtafel, schlachtEinheit-Werte, Bilder von Aufstellung und Einheitenfenster.
const { chromium } = require('playwright');
const PORT = process.argv[2] || 8772;
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1194, height: 834 } });
  const fehler = [];
  p.on('response', r => { if (r.status() >= 400) fehler.push(r.status() + ' ' + r.url()); }); p.on('pageerror', e => fehler.push(String(e))); p.on('console', m => { if (m.type() === 'error') fehler.push(m.text()); });
  await p.goto(`http://localhost:${PORT}/dev/proto/schlacht_spiel.html?g=niedrig`);
  await p.waitForFunction(() => window.SCHLACHT && SCHLACHT.phase === 'aufstellung', null, { timeout: 180000 });
  const ein = await p.evaluate(() => {
    const k = d => { const r = SCHLACHT.einheit(d); return { name: r.name, str: r.str, q: +r.q.toFixed(3), figuren: r.figuren, paket: r.paket, genau: r.paketGenau, bild: r.bild, atk: +r.werte.atk.toFixed(2), def: +r.werte.def.toFixed(2), mor: r.werte.mor, walk: +r.werte.walk.toFixed(2), run: +r.werte.run.toFixed(2), ans: +r.werte.ans.toFixed(2), fern: r.werte.fern && { reich: +r.werte.fern.reich.toFixed(1), schaden: +r.werte.fern.schaden.toFixed(2), vorrat: r.werte.fern.vorrat } }; };
    return {
      hastati: k({ volk: 'rom', kultur: 'latein', rolle: 'sword', epoche: 0, mann: 120 }),
      libyer: k({ volk: 'rom', kultur: 'latein', rolle: 'sword', variante: 'libyer', epoche: 0, mann: 120 }),
      libyerSpear: k({ volk: 'karthago', kultur: 'punisch', rolle: 'spear', variante: 'libyer', epoche: 0 }),
      hastatiBest: k({ volk: 'rom', kultur: 'latein', rolle: 'sword', epoche: 0, waffen: 1, ruestung: 2, tier: 1, rang: 2 }),
      velites: k({ volk: 'rom', kultur: 'latein', rolle: 'missile', epoche: 0 }),
      balear: k({ volk: 'karthago', kultur: 'iberisch', rolle: 'missile', variante: 'balear', epoche: 0 }),
      phalanx: k({ volk: 'makedonien', kultur: 'griechisch', rolle: 'spear', variante: 'phalanx', epoche: 0 }),
      alt: k({ volk: 'rom', kultur: 'latein', rolle: 'sword', epoche: 2, mann: 120 }),
      altVeraltet: k({ volk: 'rom', kultur: 'latein', rolle: 'sword', epoche: 2, ausruestungEpoche: 0, mann: 120 }),
    };
  });
  console.log('EINHEIT', JSON.stringify(ein, null, 1));
  const ids = await p.evaluate(() => SCHLACHT.gefechte);
  const erg = {};
  for (const id of ids) {
    if (id !== 'karthago') {
      await p.evaluate(g => SCHLACHT.gefecht(g), id);
      await p.waitForFunction(g => SCHLACHT.phase === 'aufstellung' && SCHLACHT.aktuellesGefecht === g, id, { timeout: 180000 });
    }
    await p.waitForTimeout(800);
    await p.screenshot({ path: `shot/e1_auf_${id}.png` });
    if (id === 'karthago') {
      // Gefecht-Auswahl
      await p.click('#bGefecht'); await p.waitForTimeout(400); await p.screenshot({ path: 'shot/e1_auswahl.png' });
      await p.click('#bGefecht'); await p.waitForTimeout(200);
      await p.evaluate(() => SCHLACHT.waehle(2)); await p.waitForTimeout(500); await p.screenshot({ path: 'shot/e1_fenster_hastati3.png' });
      await p.evaluate(() => SCHLACHT.waehle(1)); await p.waitForTimeout(500); await p.screenshot({ path: 'shot/e1_fenster_vet.png' });
      await p.evaluate(() => SCHLACHT.waehle(3)); await p.waitForTimeout(500); await p.screenshot({ path: 'shot/e1_fenster_velites.png' });
    }
    if (id === 'makedonien') { await p.evaluate(() => SCHLACHT.waehle(0)); const n = await p.evaluate(() => SCHLACHT.units.findIndex(u => /Phalanx|Piken/.test(u.name))); await p.evaluate(i => SCHLACHT.waehle(i), n); await p.waitForTimeout(500); await p.screenshot({ path: 'shot/e1_fenster_phalanx.png' }); }
    const tabelle = await p.evaluate(() => SCHLACHT.units.map(u => ({ s: u.side, n: u.name, np: u.np, str: +u.ein.str.toFixed(1), atk: +u.def.atk.toFixed(1), def: +u.def.def.toFixed(1), mor: +u.def.mor.toFixed(1), walk: +u.def.walk.toFixed(2), run: +u.def.run.toFixed(2), ans: +u.def.ans.toFixed(2), fern: u.def.fern ? [Math.round(u.def.fern.reich), +u.def.fern.schaden.toFixed(2), u.def.fern.vorrat] : null, pak: u.ein.paket + (u.ein.paketGenau ? '' : '*') })));
    await p.evaluate(() => { SCHLACHT.start(); SCHLACHT.tempo(30); for (const u of SCHLACHT.units) if (u.side === 0) SCHLACHT.haltung(u.i, 'angreifen'); });
    const t0 = Date.now();
    await p.waitForFunction(() => SCHLACHT.phase === 'ende', null, { timeout: 600000 });
    const e = await p.evaluate(() => ({ erg: SCHLACHT.ergebnis, gef: SCHLACHT.gefallen, zeit: Math.round(SCHLACHT.schlachtZeit), tot: SCHLACHT.units.map(u => u.strength) }));
    await p.waitForTimeout(500);
    await p.screenshot({ path: `shot/e1_ende_${id}.png` });
    erg[id] = { tabelle, ende: e, realSek: Math.round((Date.now() - t0) / 1000) };
    console.log('GEFECHT', id, JSON.stringify(erg[id].ende), 'real', erg[id].realSek, 's');
    console.log(tabelle.map(t => JSON.stringify(t)).join('\n'));
  }
  console.log('PAKETE', JSON.stringify(await p.evaluate(() => SCHLACHT.pakete)));
  console.log('FEHLER', fehler.length ? fehler.slice(0, 5) : 'keine');
  await b.close();
})().catch(e => { console.error('ABBRUCH', e.message); process.exit(1); });
