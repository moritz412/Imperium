// Misst Draw-Calls und Dreiecke einer großen Testsstadt (keine FPS – Software-Rendering in der Cloud)
const { chromium } = require(__dirname + '/../../tests/node_modules/playwright');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 1180, height: 820 } });
  await p.route(/cdnjs/, r => r.fulfill({ body: require('fs').readFileSync(__dirname + '/../../tests/node_modules/three/build/three.min.js'), contentType: 'application/javascript' }));
  await p.route(/fonts\.g/, r => r.abort());
  await p.goto('http://localhost:' + (process.argv[2] || '8772') + '/dev/staedte/index.html'); await p.waitForFunction(() => window.SR && SR.modelle && SR.modelle(), null, { timeout: 90000 });
  const r = await p.evaluate(async () => {
    await SR.modelle(); document.querySelector('#startseite').hidden = true; SR.tempo(0);
    const S = SR.S; S.ereignisseAus = true; S.epoche = 2; S.rang = 3; S.grenze = 2; S.forschung = { ziel: '', wissen: 0, fertig: Object.keys(SR.sim.FORSCHUNG || {}) };
    Object.assign(S.gut, { holz: 1e5, ziegel: 1e5, stein: 1e5, denare: 1e6, lehm: 1e5 });
    for (let z = 3; z < 36; z += 5) for (let x = 0; x < 64; x++) SR.sim.bauen(S, SR.welt, 'strasse', x, z);
    for (let x = 6; x < 64; x += 8) for (let z = 0; z < 36; z++) SR.sim.bauen(S, SR.welt, 'strasse', x, z);
    const typen = ['huette', 'huette', 'huette', 'huette', 'tempel', 'ludus', 'wache', 'schmiede', 'kelter', 'quartier', 'domus', 'oelmuehle', 'weberei', 'latrine', 'markt', 'baeckerei'];
    let n = 0;
    for (let z = 0; z < 38; z++) for (let x = 0; x < 64; x++) { const t = typen[(x * 7 + z * 3) % typen.length]; const q = SR.sim.bauen(S, SR.welt, t, x, z); if (q.ok) { n++; if (t === 'huette') q.b.stufe = 1 + ((x + z) % 3); } }
    SR.bauen('huette', -9, -9); SR.szene.zentrieren(30, 18); SR.szene.zoom(0.45);
    const R = SR.szene.renderer; R.info.autoReset = true; SR.szene.zeichnen(0.016, 0);
    return { gebaeude: n, calls: R.info.render.calls, dreiecke: R.info.render.triangles, geometrien: R.info.memory.geometries };
  });
  console.log(JSON.stringify(r)); await b.close();
})();
