// Prüft eschGenSchicksal: gefallener Feldherr -> etwa halb tot (Nachfolger), halb verwundet; verwundet -> bleibt. Aufruf: node gen_schicksal_t.js [port]
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const PORT = process.argv[2] || 8772, FILE = path.join(__dirname, '..', 'imperium.html');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl'] }); const p = await b.newPage(); const fehler = [];
  p.on('pageerror', e => fehler.push(String(e)));
  await p.route(/imperium\.html/, r => r.fulfill({ body: fs.readFileSync(FILE), contentType: 'text/html; charset=utf-8' }));
  await p.goto(`http://localhost:${PORT}/imperium.html`, { timeout: 300000 });
  await p.waitForFunction(() => document.getElementById('loading').hidden, null, { timeout: 300000 });
  const r = await p.evaluate(() => {
    newGame('rom'); loadGame(S); closeModal();
    const a = S.armies.find(x => x.f === S.player), B = { attSide: 0, ctx: { a, defArmies: [] } };
    let tot = 0, verw = 0; const n0 = S.log.length;
    for (let k = 0; k < 200; k++) { const g = genOf(a); eschGenSchicksal(B, [{ name: g.n, lebt: false, verwundet: true }, null]); if (a.gen !== g) tot++; else verw++; }
    const g = genOf(a); eschGenSchicksal(B, [{ name: g.n, lebt: true, verwundet: true }, null]); const bleibt = a.gen === g;
    return { tot, verw, bleibt, logs: S.log.length - n0, letzte: S.log.slice(-3).map(e => e.t) };
  });
  console.log(JSON.stringify(r)); console.log(r.tot > 60 && r.verw > 60 && r.bleibt ? 'PASS' : 'FAIL', 'Fehler:', fehler.length ? fehler.slice(0, 2) : 'keine');
  await b.close();
})().catch(e => { console.error('ABBRUCH', e.message); process.exit(1); });
