// Neue Echtzeitschlacht im Hauptspiel (ESCH, Pakete I1/I2/I4). Aufruf: node eschlacht_integ_t.js [port]   (Server aus der Repo-Wurzel, Port 8772)
// Prüft: Spiel mit ?eschlacht=1, römisches Heer greift an, neue Schlacht startet (Figuren, Einheiten aus dem Heer), KI-Werte bei Schwierigkeit Leicht/Sehr schwer,
// Schlacht bis zum Ende (Weiter) bzw. Rückzug, zurück in der Kampagne mit geänderten Männern, Aufräumen (BATTLE, #esch, Renderer-Zustand, Speicherzähler),
// Schalter aus = alte Schlacht, keine Seitenfehler. Speicher: die Zähler der Kampagne schwanken von selbst (Nachladen), daher nur grobe Grenzen;
// ein Dauerlauf mit vier Schlachten hintereinander blieb bei gleichen Zählern (Geometrien 245, Texturen 11, Programme 24 nach jeder Schlacht). Die Assets unter /proto/ kommen aus dev/proto (nicht aus der Wurzel).
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const PORT = process.argv[2] || '8772';
const FILE = path.join(__dirname, '..', 'imperium.html'), PROTO = path.join(__dirname, '..', 'proto');
const MIME = { '.json': 'application/json', '.mp3': 'audio/mpeg', '.webp': 'image/webp', '.html': 'text/html; charset=utf-8' };
(async () => {
  const t0 = Date.now(); const R = []; const ok = (n, c, i = '') => { R.push(!!c); console.log((c ? 'PASS ' : 'FAIL ') + n + (i ? '  ' + i : '')); };
  const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined, args: process.env.PW_GPU ? [] : ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const ctx = await b.newContext({ viewport: { width: 1194, height: 834 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push('PAGE ' + e.message + ' @ ' + String(e.stack).split('\n').slice(1, 4).map(x => x.trim().replace(/^at /, '')).join(' < ')));
  p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|WebGL|GPU stall/.test(m.text())) errs.push('CON ' + m.text().slice(0, 200)); });
  await p.addInitScript(() => { try { localStorage.setItem('imperium.gfx', JSON.stringify({ q: 'leicht' })); } catch (e) {} });
  await p.route(/cdnjs/, r => r.fulfill({ body: fs.readFileSync(path.join(__dirname, 'node_modules/three/build/three.min.js')), contentType: 'application/javascript' }));
  await p.route(/fonts\.g/, r => r.abort());
  await p.route(/imperium\.html/, r => r.fulfill({ body: fs.readFileSync(FILE), contentType: 'text/html; charset=utf-8' }));
  await p.route(/\/proto\//, r => {   // Assets der Schlacht aus dev/proto
    const u = new URL(r.request().url()), f = path.join(PROTO, decodeURIComponent(u.pathname.replace(/^.*\/proto\//, '')));
    if (!fs.existsSync(f)) return r.fulfill({ status: 404, body: '' });
    r.fulfill({ body: fs.readFileSync(f), contentType: MIME[path.extname(f)] || 'application/octet-stream' });
  });
  await p.goto(`http://localhost:${PORT}/imperium.html?eschlacht=1`, { timeout: 300000 });
  await p.waitForFunction(() => document.getElementById('loading').hidden, null, { timeout: 300000 });
  // Spiel: Rom, Heer mit allen Rollen, Ziel = Nachbarprovinz ohne Mauern
  const set = await p.evaluate(() => {
    window.showEvent = (E, c, next) => { try { const o = E.opts.find(o => !o.cost || S.fac[S.player].gold >= o.cost()) || E.opts[0]; o.fx(S.player, c); } catch (e) {} next && next(); };
    newGame('rom'); loadGame(S); closeModal();
    const a = S.armies.find(x => x.f === S.player && x.units.length); if (!a) return { err: 'kein Heer' };
    for (const r of ['sword', 'spear', 'missile', 'cav']) if (!a.units.some(u => u.r === r)) a.units.push(newUnit(S.player, r));
    a.units.push(Object.assign(newUnit(S.player, 'sword'), { tier: 1, xp: 320, wpn: 1, arm: 2 }));
    let ti = null;
    for (const n of ADJ[a.p]) { if (isSeaLink(a.p, n) || S.prov[n].owner === S.player) continue; ti = n; break; }
    if (ti == null) return { err: 'kein Ziel' };
    const P = S.prov[ti]; if (P.b) P.b.walls = 0; if (P.gar < 4) P.gar = 8;
    window.__a = a; window.__ti = ti; window.__men0 = a.units.map(u => u.men);
    return { aid: a.id, units: a.units.map(u => u.r + (u.v ? ':' + u.v : '') + ' ' + u.men), ti, prov: PROV_DEF[ti].name, owner: P.owner, gar: P.gar, ep: S.epoch || 0, bdiff: S.bdiff };
  });
  console.log('SETUP', JSON.stringify(set));
  ok('Aufbau: Heer und Ziel gefunden', !set.err, set.err || '');
  if (set.err) { await b.close(); process.exit(1); }
  ok('S.bdiff gesetzt (Standard Normal)', set.bdiff === 1, 'bdiff=' + set.bdiff);
  const mem0 = await p.evaluate(() => ({ g: renderer.info.memory.geometries, t: renderer.info.memory.textures, enc: renderer.outputEncoding, tm: renderer.toneMapping, sh: renderer.shadowMap.enabled }));
  console.log('RENDERER vor Schlacht', JSON.stringify(mem0));
  const warte = (fn, arg, to = 240000) => p.waitForFunction(fn, arg, { timeout: to });
  const beginne = async bd => {   // Schlacht mit Schwierigkeit bd starten und bis zur Aufstellung warten
    await p.evaluate(v => { S.bdiff = v; startBattle({ a: window.__a, ti: window.__ti, playerAttacker: true, done: () => { window.__done = (window.__done || 0) + 1; } }); }, bd);
    await warte(() => ESCH && ESCH.api && ESCH.api.phase === 'aufstellung');
  };
  // ---- Lauf 1/2: KI-Werte bei Leicht und Sehr schwer, danach Rückzug ----
  const ki = {}; let memIn = null;
  for (const bd of [0, 3]) {
    await beginne(bd);
    ki[bd] = await p.evaluate(() => {
      const U = ESCH.api.units, s1 = U.filter(u => u.side === 1);
      const sum = f => s1.reduce((s, u) => s + f(u), 0) / s1.length;
      return { name: ESCH.api.bdiffName, iv: ESCH.api.kiIntervall, eigene: U.filter(u => u.side === 0).map(u => u.name + ' ' + u.np), gegner: s1.map(u => u.name + ' ' + u.np), atk: +sum(u => u.def.atk).toFixed(2), def: +sum(u => u.def.def).toFixed(2), mor: +sum(u => u.def.mor).toFixed(1), reserve: s1.filter(u => u.reserve).length, eigeneGleich: U.filter(u => u.side === 0).every(u => u.def === u.ein.werte), gegnerAngepasst: s1.every(u => u.def !== u.ein.werte), eigenAtk: +(U.filter(u => u.side === 0).reduce((s, u) => s + u.def.atk, 0) / U.filter(u => u.side === 0).length).toFixed(2) };
    });
    console.log('KI bdiff ' + bd, JSON.stringify(ki[bd]));
    if (bd === 0) {
      ok('Figuren geladen, Einheiten aus dem Heer', await p.evaluate(() => ESCH.api.units.filter(u => u.side === 0).length >= 5 && ESCH.api.pakete.length >= 3), JSON.stringify(ki[0].eigene));
      ok('Leibwache des Feldherrn dabei', ki[0].eigene.some(n => /Leibwache/.test(n)));
      ok('Garnison beim Verteidiger', ki[0].gegner.some(n => /Garnison/.test(n)), JSON.stringify(ki[0].gegner));
    }
    if (bd === 0) memIn = await p.evaluate(() => ({ g: renderer.info.memory.geometries, t: renderer.info.memory.textures }));
    // Rückzug: zweimal tippen
    await p.screenshot({ path: 'shot/eschlacht_integ_auf' + bd + '.png' });
    await p.click('#esch #bRueck'); await p.waitForTimeout(200); await p.click('#esch #bRueck');
    await warte(() => !ESCH && document.getElementById('modal').hidden === false);
    await p.evaluate(() => closeModal());
  }
  ok('Schwierigkeit wirkt auf die KI (Angriff Leicht < Sehr schwer)', ki[0].atk < ki[3].atk && ki[0].mor < ki[3].mor, `Leicht atk ${ki[0].atk} mor ${ki[0].mor} iv ${ki[0].iv} s | Sehr schwer atk ${ki[3].atk} mor ${ki[3].mor} iv ${ki[3].iv} s, Reserve ${ki[3].reserve}`);
  ok('Eigene Werte unverändert, nur die Gegner angepasst', ki[0].eigeneGleich && ki[3].eigeneGleich && ki[0].gegnerAngepasst && ki[3].gegnerAngepasst, 'eigene Seite = Kampagnenwerte, Gegner Leicht atk ' + ki[0].atk + ' def ' + ki[0].def + ' / Sehr schwer atk ' + ki[3].atk + ' def ' + ki[3].def);
  const memNach = await p.evaluate(() => ({ g: renderer.info.memory.geometries, t: renderer.info.memory.textures }));
  ok('Speicher nach Rückzug: Geometrien/Texturen der Schlacht freigegeben', memNach.g <= mem0.g + 80 && memNach.t <= mem0.t + 4 && memIn.g > memNach.g + 40, 'Kampagne vorher ' + mem0.g + '/' + mem0.t + ' · in der Schlacht ' + memIn.g + '/' + memIn.t + ' · nach Rückzug ' + memNach.g + '/' + memNach.t + ' (Geometrien/Texturen)');
  const nachRz = await p.evaluate(() => ({ esch: !!ESCH, battle: !!BATTLE, hidden: document.getElementById('esch').hidden, empty: document.getElementById('esch').childElementCount, top: !document.getElementById('top').hidden, done: window.__done || 0 }));
  ok('Rückzug räumt auf (kein ESCH/BATTLE, #esch leer, Leiste da, done)', !nachRz.esch && !nachRz.battle && nachRz.hidden && nachRz.empty === 0 && nachRz.top, JSON.stringify(nachRz));
  // ---- Lauf 3: Normal, bis zum Ende ----
  const men1 = await p.evaluate(() => { const a = window.__a; window.__men1 = a.units.map(u => u.men); window.__nU = a.units.length; return window.__men1; });
  await beginne(1);
  const info = await p.evaluate(() => ({ name: ESCH.api.bdiffName, iv: ESCH.api.kiIntervall, n: ESCH.api.units.length, tris: ESCH.api.tris }));
  console.log('LAUF 3', JSON.stringify(info));
  ok('Normal: KI-Intervall 1 s', info.name === 'Normal' && info.iv === 1);
  await p.screenshot({ path: 'shot/eschlacht_integ_aufstellung.png' });
  await p.evaluate(() => { const A = ESCH.api; A.start(); A.tempo(4); for (const u of A.units) if (u.side === 0) A.haltung(u.i, 'angreifen'); });
  await p.waitForTimeout(25000);
  await p.evaluate(() => { const A = ESCH.api; let x = 0, z = 0, n = 0; for (const u of A.units) if (u.side === 0 && u.strength > 0) { x += u.cx; z += u.cz; n++; } A.kamera(Math.PI * 0.9, 0.42, 70, x / n, z / n + 15); A.tempo(2); });
  await p.waitForTimeout(6000);
  await p.screenshot({ path: 'shot/eschlacht_integ.png' });
  const mitten = await p.evaluate(() => ({ phase: ESCH.api.phase, st: ESCH.api.units.map(u => u.side + ':' + u.strength + '/' + u.np), fps: ESCH.api.fps.slice(-3) }));
  console.log('MITTEN', JSON.stringify(mitten));
  await p.evaluate(() => ESCH.api.tempo(30));
  await warte(() => ESCH && ESCH.api && ESCH.api.phase === 'ende', null, 900000);
  await p.waitForTimeout(1500);
  await p.screenshot({ path: 'shot/eschlacht_integ_ende.png' });
  const ende = await p.evaluate(() => { const A = ESCH.api; return { erg: A.ergebnis, zeit: Math.round(A.schlachtZeit), st: A.units.map(u => u.side + ':' + u.strength + '+' + u.fled + '/' + u.np), weiter: !!document.querySelector('#esch #bNoch') }; });
  console.log('ENDE', JSON.stringify(ende));
  ok('Endtafel mit Weiter-Knopf', ende.weiter && /Weiter/.test(await p.textContent('#esch #bNoch')));
  await p.click('#esch #bNoch');
  await warte(() => !ESCH && !document.getElementById('modal').hidden);
  const fin = await p.evaluate(() => {
    const a = window.__a, men = a.units.map(u => u.men);
    return { esch: !!ESCH, battle: !!BATTLE, hidden: document.getElementById('esch').hidden, kinder: document.getElementById('esch').childElementCount, top: !document.getElementById('top').hidden, done: window.__done || 0,
      men1: window.__men1, men2: men, modal: document.getElementById('modal').innerText.slice(0, 120).replace(/\s+/g, ' '),
      r: { g: renderer.info.memory.geometries, t: renderer.info.memory.textures, enc: renderer.outputEncoding, tm: renderer.toneMapping, sh: renderer.shadowMap.enabled }, ratio: renderer.getPixelRatio(), pratio: PRATIO };
  });
  console.log('NACH SCHLACHT', JSON.stringify(fin));
  ok('Zurück in der Kampagne, aufgeräumt', !fin.esch && !fin.battle && fin.hidden && fin.kinder === 0 && fin.top);
  ok('Männer der Einheiten verändert', JSON.stringify(fin.men1) !== JSON.stringify(fin.men2), fin.men1.join(',') + ' -> ' + fin.men2.join(','));
  ok('Schlussmodal der Kampagne (showBattle)', /Sieg|Niederlage/.test(fin.modal), fin.modal);
  ok('Renderer-Zustand wiederhergestellt', fin.r.enc === mem0.enc && fin.r.tm === mem0.tm && fin.r.sh === mem0.sh && fin.ratio === fin.pratio, JSON.stringify(fin.r) + ' Pixelrate ' + fin.ratio + '/' + fin.pratio);
  ok('Speicher: Geometrien/Texturen der Schlacht freigegeben', fin.r.g <= mem0.g + 80 && fin.r.t <= mem0.t + 4, `Geometrien ${mem0.g} -> ${fin.r.g}, Texturen ${mem0.t} -> ${fin.r.t}`);
  await p.evaluate(() => closeModal());
  // Kampagne läuft weiter
  const weiter = await p.evaluate(async () => { try { endTurn(); } catch (e) { return 'endTurn ' + e.message; } await new Promise(z => setTimeout(z, 2500)); closeModal(); return 'ok T' + S.turn; });
  ok('Kampagne läuft nach der Schlacht weiter', /^ok/.test(weiter), weiter);
  // ---- Schalter aus: alte Schlacht ----
  const alt = await p.evaluate(() => {
    history.replaceState(null, '', '/imperium.html'); ESCFG.an = false;
    const a = S.armies.find(x => x.f === S.player && x.units.length); let ti = null;
    for (const n of ADJ[a.p]) { if (isSeaLink(a.p, n) || S.prov[n].owner === S.player) continue; ti = n; break; }
    startBattle({ a, ti, playerAttacker: true, done() {} });
    return { esch: !!ESCH, battle: !!BATTLE, alt: !!(BATTLE && BATTLE.units && BATTLE.units.length), neu: !!(BATTLE && BATTLE.esch) };
  });
  ok('Schalter aus: alte Schlacht startet wie bisher', !alt.esch && alt.battle && alt.alt && !alt.neu, JSON.stringify(alt));
  await p.waitForTimeout(1500);
  await p.screenshot({ path: 'shot/eschlacht_integ_alt.png' });
  await p.evaluate(() => { try { retreat(); } catch (e) {} });
  await p.waitForTimeout(500);
  ok('Keine Seiten-/Konsolenfehler', !errs.length, errs.slice(0, 5).join(' | '));
  console.log(`ESCH-INTEG ${R.filter(Boolean).length}/${R.length} in ${Math.round((Date.now() - t0) / 1000)} s`);
  await b.close();
})().catch(e => { console.error('ABBRUCH', e.message); process.exit(1); });
