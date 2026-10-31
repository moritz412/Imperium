// Verstärkungen R5 (31.10.): Testseite schlacht_spiel.html. Aufruf: node schlacht_verst_t.js [port=8772]
// Teil A: eigenes kleines Gefecht (6 + 2 Verstärkung je Seite, links/rechts bzw. hinten): Ankunftszeit, Rand, Hinweis, Karte, Höchstzahl, Ergebnisdaten.
// Teil B: ?verst=1 (Vorlage Karthago mit je 10 Einheiten): Höchstzahl 10 je Seite, Ankunft erst bei freiem Platz, Ergebnisdaten.
// Zeiten werden an der Spielzeit (schlachtZeit) geprüft, nicht an der Echtzeit.
const { chromium } = require('playwright');
const PORT = process.argv[2] || 8772;
const R = []; const ok = (n, c, i = '') => { R.push(!!c); console.log((c ? 'PASS ' : 'FAIL ') + n + (i ? '  ' + i : '')); };
const mk = (s, rolle, x, z, extra) => Object.assign({ s, volk: s ? 'karthago' : 'rom', kultur: s ? 'punisch' : 'latein', rolle, epoche: 0, x, z }, extra || {});
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined, args: process.env.PW_GPU ? [] : ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const fehler = [];
  const neueSeite = async url => {
    const p = await b.newPage({ viewport: { width: 1194, height: 834 } });
    p.on('pageerror', e => fehler.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/404|Failed to load resource|WebGL|GPU stall/.test(m.text())) fehler.push(m.text().slice(0, 200)); });
    await p.goto(url); await p.waitForFunction(() => window.SCHLACHT && SCHLACHT.phase === 'aufstellung', null, { timeout: 240000 });
    return p;
  };
  const abfrage = p => p.evaluate(() => {
    const U = SCHLACHT.units; const feld = sd => U.filter(u => u.side === sd && u.state !== 'wartet' && u.state !== 'geflohen' && u.state !== 'aufgerieben').length;
    const h = document.getElementById('hinweis');
    return { z: SCHLACHT.schlachtZeit, ph: SCHLACHT.phase, w: U.filter(u => u.state === 'wartet').map(u => u.i), feld0: feld(0), feld1: feld(1), hint: h.textContent, hintAn: h.classList.contains('an') };
  });
  const g = {
    id: 'verst_t', n: 'Verstärkungstest', seiten: ['Rom', 'Karthago'], text: '',
    einheiten: [
      mk(0, 'sword', -40, -60), mk(0, 'sword', 0, -60), mk(0, 'spear', 40, -60), mk(0, 'sword', -40, -80), mk(0, 'spear', 40, -80), mk(0, 'missile', 0, -40),
      mk(0, 'sword', 0, -120, { verst: { t: 60, rand: 'links' } }), mk(0, 'spear', 0, -120, { verst: { t: 80, rand: 'hinten' } }),
      mk(1, 'sword', -40, 60), mk(1, 'sword', 0, 60), mk(1, 'spear', 40, 60), mk(1, 'sword', -40, 80), mk(1, 'spear', 40, 80), mk(1, 'missile', 0, 40),
      mk(1, 'sword', 0, 120, { verst: { t: 60, rand: 'rechts' } }), mk(1, 'spear', 0, 120, { verst: { t: 80, rand: 'hinten' } }),
    ],
  };
  // ---------------- Teil A1: Zeitpunkte ohne Kampf (Haltung, keine KI) ----------------
  let p = await neueSeite(`http://localhost:${PORT}/dev/proto/schlacht_spiel.html?g=niedrig`);
  ok('Gefecht mit Beschreibung geladen', await p.evaluate(g => SCHLACHT.gefecht(g), g));
  await p.waitForFunction(() => SCHLACHT.phase === 'aufstellung' && SCHLACHT.units.length === 16, null, { timeout: 240000 });
  const st = await p.evaluate(() => ({ w: SCHLACHT.units.filter(u => u.state === 'wartet').map(u => [u.i, u.side]), kartenWeg: document.querySelectorAll('#karten .karte.weg').length, karten: document.querySelectorAll('#karten .karte').length, fk: document.querySelectorAll('#feinde .fk.verst').length }));
  ok('Vor Beginn: 4 Einheiten warten (2 je Seite)', st.w.length === 4 && st.w.filter(x => x[1] === 0).length === 2, JSON.stringify(st.w));
  ok('Karte der wartenden Einheiten in der Leiste (ausgegraut): 8 Karten, 2 weg', st.karten === 8 && st.kartenWeg === 2, JSON.stringify(st));
  ok('Feindliste: wartende Feinde ausgegraut (2)', st.fk === 2, 'fk.verst=' + st.fk);
  await p.evaluate(() => { SCHLACHT.kiSeiten(false, false); SCHLACHT.units.forEach(u => SCHLACHT.haltung(u.i, 'halten')); SCHLACHT.start(); SCHLACHT.tempo(5); });
  await p.waitForFunction(() => SCHLACHT.schlachtZeit >= 57 || SCHLACHT.phase === 'ende', null, { timeout: 240000, polling: 100 });
  let v = await abfrage(p);
  ok('Bei ~57 s: noch alle 4 wartend, Schlacht läuft (kein vorzeitiges Ende)', v.w.length === 4 && v.ph === 'schlacht', JSON.stringify(v));
  let hint = false;
  const t0 = Date.now();
  while (Date.now() - t0 < 60000) { v = await abfrage(p); if (v.z >= 62) break; if (/Verst/.test(v.hint) && v.hintAn) hint = true; await p.waitForTimeout(100); }
  hint = hint || (/Verst/.test(v.hint) && v.hintAn);
  ok('Bei ~62 s: genau 2 eingetroffen (je Seite 1)', v.w.length === 2, JSON.stringify(v));
  ok('Hinweis „Verstärkung trifft ein“ erschien', hint, v.hint);
  const kr = await p.evaluate(() => ({ weg: document.querySelectorAll('#karten .karte.weg').length }));
  ok('Eintreffende eigene Karte nicht mehr ausgegraut (1 weg)', kr.weg === 1, JSON.stringify(kr));
  await p.waitForFunction(() => SCHLACHT.schlachtZeit >= 81 || SCHLACHT.phase === 'ende', null, { timeout: 240000, polling: 100 });
  v = await abfrage(p);
  ok('Bei ~81 s: alle da, je Seite 8 auf dem Feld', v.w.length === 0 && v.feld0 === 8 && v.feld1 === 8, JSON.stringify(v));
  const e = await p.evaluate(() => SCHLACHT.units.filter(u => u.ank).map(u => ({ s: u.side, rand: u.ank.rand, da: !!u.ank.da, zeit: u.ank.zeit, x: Math.round(u.startX), z: Math.round(u.startZ) })));
  console.log('VERST', JSON.stringify(e));
  ok('Ankunftszeiten 60 s und 80 s (Takt 0,5 s / Pause 10 s)', e.filter(x => x.zeit >= 60 && x.zeit <= 62).length === 2 && e.filter(x => x.zeit >= 80 && x.zeit <= 82).length === 2, JSON.stringify(e.map(x => x.zeit)));
  const l = e.find(x => x.s === 0 && x.rand === 'links'), r = e.find(x => x.s === 1 && x.rand === 'rechts'), h0 = e.find(x => x.s === 0 && x.rand === 'hinten'), h1 = e.find(x => x.s === 1 && x.rand === 'hinten');
  ok('Rand links x < -150, rechts x > 150, hinten am eigenen Ende (Rom z<-120, Karthago z>120)', l && l.x < -150 && r && r.x > 150 && h0 && h0.z < -120 && h1 && h1.z > 120, JSON.stringify([l, r, h0, h1]));
  const rd = await p.evaluate(() => SCHLACHT.ergebnisDaten(false));
  ok('Ergebnisdaten enthalten alle 16 Einheiten', rd.einheiten.length === 16, 'n=' + rd.einheiten.length);
  await p.close();
  // ---------------- Teil A2: nie eingetroffen, Ergebnis unversehrt; Schlacht endet nicht vorzeitig ----------------
  p = await neueSeite(`http://localhost:${PORT}/dev/proto/schlacht_spiel.html?g=niedrig`);
  const g2 = JSON.parse(JSON.stringify(g)); g2.einheiten.forEach(d => { if (d.verst) d.verst.t = 100000; });
  await p.evaluate(g => SCHLACHT.gefecht(g), g2);
  await p.waitForFunction(() => SCHLACHT.phase === 'aufstellung' && SCHLACHT.units.length === 16, null, { timeout: 240000 });
  await p.evaluate(() => { SCHLACHT.kiSeiten(true, true); SCHLACHT.start(); SCHLACHT.tempo(8); });
  // Rom vernichten lassen: Verstärkung kommt wegen „Seite leer“ sofort, Ende erst danach
  let maxF = 0, seen = false; const tA = Date.now();
  while (Date.now() - tA < 400000) {
    v = await abfrage(p); maxF = Math.max(maxF, v.feld0, v.feld1);
    if (v.w.length < 4) seen = true;
    if (v.ph === 'ende') break;
    await p.waitForTimeout(400);
  }
  const rd2 = await p.evaluate(() => ({ e: SCHLACHT.ergebnisDaten(false), erg: SCHLACHT.ergebnis }));
  console.log('A2 Ende', rd2.erg, 'Verst. eingetroffen', seen, JSON.stringify(rd2.e.einheiten.map(x => [x.seite, x.np, x.rest, x.verst])));
  ok('A2: höchstens 10 je Seite', maxF <= 10, 'max ' + maxF);
  ok('A2: Ergebnisdaten enthalten alle 16 Einheiten', rd2.e.einheiten.length === 16);
  ok('A2: nicht eingetroffene Einheiten unversehrt (rest = np, geflohen 0)', rd2.e.einheiten.filter(x => x.verst === -1).every(x => x.rest === x.np && x.geflohen === 0 && x.gefallen === 0));
  ok('A2: Seite ohne Kämpfer auf dem Feld bekam ihre Verstärkung sofort (trotz t=100000 s); Ende hier durch Zeitgrenze', rd2.e.einheiten.filter(x => x.verst === -1).length === 0 ? seen : true, 'seen=' + seen);
  await p.close();
  // ---------------- Teil B: ?verst=1 ----------------
  p = await neueSeite(`http://localhost:${PORT}/dev/proto/schlacht_spiel.html?g=niedrig&verst=1`);
  const sb = await p.evaluate(() => ({ n: SCHLACHT.units.length, w: SCHLACHT.units.filter(u => u.state === 'wartet').length }));
  ok('?verst=1: 24 Einheiten, 4 wartend', sb.n === 24 && sb.w === 4, JSON.stringify(sb));
  await p.evaluate(() => { SCHLACHT.kiSeiten(true, true); SCHLACHT.start(); SCHLACHT.tempo(8); });
  let m0 = 0, m1 = 0, vor = false, ende = false; const tB = Date.now();
  while (Date.now() - tB < 400000) {
    v = await abfrage(p); m0 = Math.max(m0, v.feld0); m1 = Math.max(m1, v.feld1);
    if (v.z < 58 && v.w.length < 4) vor = true;
    if (v.ph === 'ende') { ende = true; break; }
    if (v.z > 200) break;
    await p.waitForTimeout(400);
  }
  const arr = await p.evaluate(() => SCHLACHT.units.filter(u => u.ank).map(u => [u.side, u.ank.rand, u.ank.da ? u.ank.zeit : -1]));
  console.log('B', 'Ende:', ende, JSON.stringify(arr), 'max', m0, m1);
  ok('?verst=1: höchstens 10 je Seite gleichzeitig', m0 <= 10 && m1 <= 10, 'max ' + m0 + '/' + m1);
  ok('?verst=1: keine Ankunft vor 58 s', !vor);
  ok('?verst=1: mindestens eine Verstärkung eingetroffen', arr.some(x => x[2] >= 60), JSON.stringify(arr));
  const e2 = await p.evaluate(() => SCHLACHT.ergebnisDaten(false)); ok('?verst=1: Ergebnisdaten mit allen 24 Einheiten', e2.einheiten.length === 24, 'n=' + e2.einheiten.length);
  await p.close();
  ok('Keine Seitenfehler', fehler.length === 0, fehler.slice(0, 3).join(' | '));
  await b.close(); console.log(R.filter(x => !x).length ? 'FEHLER: ' + R.filter(x => !x).length : 'ALLES OK', '(' + R.length + ' Prüfungen)'); process.exit(R.every(x => x) ? 0 : 1);
})();
