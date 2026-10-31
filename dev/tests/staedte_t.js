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

  // S1.5 Startseite: vier Regionen, nur Cremona wählbar
  const st = await p.evaluate(() => ({ offen: !document.querySelector('#startseite').hidden, orte: document.querySelectorAll('#startseite .ort').length }));
  await p.click('#startseite .ort[data-r="kampanien"]');
  const gesperrt = await p.evaluate(() => !!document.querySelector('#regionKarte .gesperrt') && !!document.querySelector('.startknoepfe button:disabled'));
  if (BILD) await p.screenshot({ path: BILD.replace(/\.png$/, '_start.png') });
  await p.click('#startseite .ort[data-r="po"]');
  await p.click('.startknoepfe [data-s="neu"]');
  const zu = await p.evaluate(() => document.querySelector('#startseite').hidden && SR.S.region === 'po');
  ok('Startseite: 4 Regionen, Kampanien gesperrt, Cremona gegründet', st.offen && st.orte === 4 && gesperrt && zu, JSON.stringify({ st, gesperrt, zu }));
  await p.evaluate(() => SR.tempo(0));

  // S1.3: Landstraße beim Start, Bauen nur an der Straße
  const start = await p.evaluate(() => ({ strassen: SR.S.geb.filter(b => b.t === 'strasse').length, ohne: SR.bauen('huette', 16, 25).grund }));
  ok('Landstraße beim Start, Hütte ohne Straße abgelehnt', start.strassen > 20 && /Straße/.test(start.ohne), start.strassen + ' Felder, ' + start.ohne);

  // Bauen per API (Straßennetz: Landstraße z=12, Gassen z=16 und z=19, Verbindungen x=14 und x=15)
  const bau = await p.evaluate(() => {
    const str = [];
    for (let x = 14; x <= 25; x++) str.push([x, 16]);
    for (let x = 9; x <= 26; x++) str.push([x, 19]);
    for (let z = 13; z <= 15; z++) str.push([14, z]);
    for (let z = 17; z <= 18; z++) str.push([15, z]);
    const fehl = str.map(([x, z]) => SR.bauen('strasse', x, z)).filter(r => !r.ok).map(r => 'strasse:' + r.grund);
    const liste = [['huette', 16, 14], ['huette', 19, 14], ['huette', 16, 17], ['huette', 22, 14], ['holzfaeller', 4, 10], ['feld', 9, 20], ['muehle', 13, 20],
      ['baeckerei', 16, 20], ['lehmgrube', 20, 20], ['ziegelei', 23, 20], ['brunnen', 19, 17]];
    return fehl.concat(liste.map(([t, x, z]) => { const r = SR.bauen(t, x, z); return t + ':' + (r.ok ? 'ok' : r.grund); }));
  });
  ok('11 Gebäude gebaut', bau.every(s => s.endsWith(':ok')), bau.filter(s => !s.endsWith(':ok')).join(', '));
  const besetzt = await p.evaluate(() => SR.bauen('huette', 16, 14).grund);
  ok('Belegtes Feld wird abgelehnt', /schon etwas/.test(besetzt), besetzt);
  const wald = await p.evaluate(() => SR.bauen('huette', 0, 5).grund);
  ok('Wald wird abgelehnt', /Wald/.test(wald), wald);

  // Bauen per Ziehen aus der Leiste (Maus); vorher Straße unter dem Zielfeld legen
  await p.evaluate(() => {
    const f = SR.szene.feldAn(330, 480), x = Math.round(f.p.x + 20 - 1), z = Math.round(f.p.z + 20 - 1);
    SR.bauen('strasse', x, z + 2); SR.bauen('strasse', x + 1, z + 2);
  });
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
      if (m === 8) SR.bauen('markt', 20, 9);
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

  // S1.3 Straße ziehen im Baumodus (Maus)
  const s0 = await p.evaluate(() => { SR.S.gut.denare += 100; return SR.S.geb.filter(b => b.t === 'strasse').length; });
  await p.click('#reiter button[data-k="Öffentlich"]'); await p.click('.karte[data-t="strasse"]');
  await p.mouse.move(700, 560); await p.mouse.down();
  for (let i = 1; i <= 10; i++) await p.mouse.move(700 + i * 14, 560 - i * 7);
  await p.mouse.up(); await p.click('#baumodusEnde');
  const s1 = await p.evaluate(() => SR.S.geb.filter(b => b.t === 'strasse').length);
  ok('Straße per Ziehen gelegt', s1 - s0 >= 3, `${s0} → ${s1}`);

  // S1.1 Modelle, S1.2 Einzugsbereich und Laufwege
  ok('Gebäudemodelle geladen', await p.evaluate(() => SR.modelle()));
  const lauf2 = await p.evaluate(() => {
    SR.S.gut.holz += 50; SR.bauen('strasse', 36, 4); SR.bauen('strasse', 37, 4); const r = SR.bauen('lehmgrube', 36, 2); SR.monate(1);
    const fern = SR.S.geb.find(b => b.id === r.b.id);
    const von = SR.S.geb.filter(b => b.von && b.von.length).length;
    return { fern: fern.status.map(s => s.text).join(', '), von };
  });
  ok('Betrieb ohne Häuser in Laufweite bekommt keine Arbeiter', /Laufweite/.test(lauf2.fern), lauf2.fern);
  ok('Arbeiter kommen aus Häusern (Laufwege)', lauf2.von >= 5, lauf2.von + ' Betriebe mit Herkunft');
  await p.evaluate(() => SR.tempo(3)); await p.waitForTimeout(1500);
  const figuren = await p.evaluate(() => SR.szene.laeuferZahl());
  ok('Läufer sind unterwegs', figuren > 0, figuren + ' Figuren');

  // S2.1 Umland: Hex-Karte, Stadtfeld in der Mitte, Feld antippen
  await p.evaluate(() => SR.tempo(0));
  await p.click('#ansicht [data-umland]'); await p.waitForTimeout(400);
  const vp = p.viewportSize();
  await p.mouse.click(vp.width / 2, vp.height / 2);
  const um1 = await p.evaluate(() => ({ n: SR.szene.regionInfo(), modus: SR.szene.modus(), titel: document.querySelector('#info h2')?.textContent, leiste: getComputedStyle(document.querySelector('#leiste')).display }));
  await p.mouse.click(vp.width / 2 - 260, vp.height / 2 + 40);
  const um2 = await p.evaluate(() => document.querySelector('#info h2')?.textContent);
  if (BILD) await p.screenshot({ path: BILD.replace(/\.png$/, '_umland.png') });
  await p.click('#ansicht [data-umland]');
  const um3 = await p.evaluate(() => SR.szene.modus());
  ok('Umland: 37 Hex-Felder, Stadt in der Mitte, Feldinfo, zurück zur Stadt', um1.n === 37 && um1.modus === 'region' && um1.titel === 'Cremona' && um1.leiste === 'none' && um2 && um2 !== 'Cremona' && um3 === 'stadt', JSON.stringify({ um1, um2, um3 }));

  // S2.2 Vermessen und Betriebe im Umland
  const land = await p.evaluate(() => {
    const sim = SR.sim, S = SR.S, nachbarn = sim.regionKarte().filter(f => sim.hexAbstand(f, { q: 0, r: 0 }) === 1 && sim.betriebFuer(f));
    const weit = sim.regionKarte().find(f => sim.hexAbstand(f, { q: 0, r: 0 }) === 3);
    const f = nachbarn[0]; S.gut.denare += 100; S.gut.holz += 50;
    const zuWeit = sim.vermessen(S, weit).ok;
    const v = sim.vermessen(S, f).ok, zuFrueh = sim.landBauen(S, f).ok;
    SR.monate(2); const nachVerm = sim.landStand(S, f);
    const b = sim.landBauen(S, f).ok; SR.monate(1);
    return { typ: f.typ, zuWeit, v, zuFrueh, nachVerm, b, stand: sim.landStand(S, f) };
  });
  ok('Umland: vermessen (2 Monate), dann Betrieb; zu weit/zu früh abgelehnt', !land.zuWeit && land.v && !land.zuFrueh && land.nachVerm === 'vermessen' && land.b && land.stand === 'betrieb', JSON.stringify(land));
  // S2.3 Feldweg: ohne Weg kein Ertrag, mit Weg verbunden und liefernd
  const weg = await p.evaluate(() => {
    const sim = SR.sim, S = SR.S, f = sim.regionKarte().find(h => sim.landStand(S, h) === 'betrieb');
    const ware = { acker: 'getreide', wald: 'holz', lehm: 'lehm' }[f.typ], vorher = sim.verbunden(S, f);
    // Ertrag eines Monats nur aus dem Umland messen: Stadtbetriebe kurz entfernen, Sommer
    const geb = S.geb, monat0 = S.monat; S.geb = geb.filter(b => b.t === 'strasse' || b.t === 'speicher'); S.monat = 6;
    const a0 = S.gut[ware]; SR.sim.monat(S, SR.welt); const ohne = S.gut[ware] - a0;
    S.gut.denare += 50; S.gut.holz += 20; const w = sim.wegAnlegen(S, f).ok, nachher = sim.verbunden(S, f);
    const a1 = S.gut[ware]; S.monat = 6; SR.sim.monat(S, SR.welt); const mit = S.gut[ware] - a1;
    S.geb = geb; S.monat = monat0;
    return { typ: f.typ, vorher, w, nachher, ohne: Math.round(ohne * 10) / 10, mit: Math.round(mit * 10) / 10 };
  });
  ok('Feldweg: ohne Weg kein Ertrag, mit Weg verbunden und Ertrag', !weg.vorher && weg.w && weg.nachher && weg.mit > weg.ohne, JSON.stringify(weg));

  // dasselbe über die Knöpfe im Feldfenster
  await p.evaluate(() => { SR.umland(true); const sim = SR.sim; SR.hexInfo(sim.regionKarte().find(f => sim.kannVermessen(SR.S, f) && sim.betriebFuer(f))); });
  await p.click('#info [data-a="vermessen"]');
  const knopf1 = await p.evaluate(() => document.querySelector('#info .lage')?.textContent || '');
  await p.evaluate(() => SR.monate(2));
  await p.click('#info [data-a="landbau"]');
  const knopf2 = await p.evaluate(() => document.querySelector('#info .lage')?.textContent || '');
  ok('Umland per Knopf: vermessen lassen, dann bauen', /Landvermesser/.test(knopf1) && /arbeitet/.test(knopf2), knopf1 + ' | ' + knopf2);
  const karren = await p.evaluate(() => SR.szene.karrenZahl());
  ok('Karren fährt für den verbundenen Betrieb', karren === 1, karren + ' Karren');
  if (BILD) { await p.waitForTimeout(400); await p.screenshot({ path: BILD.replace(/\.png$/, '_land.png') }); }
  await p.evaluate(() => SR.umland(false));

  // S2.4 Padus: zwei Anleger verbinden ein fernes Feld ohne durchgehenden Weg; Fischer liefert Fisch, Fisch wird gegessen
  const fluss = await p.evaluate(() => {
    const sim = SR.sim, S = SR.S, karte = sim.regionKarte(), k = sim.landKey;
    const fl = karte.filter(f => f.typ === 'fluss'), A = fl.find(f => f.q === 0 && f.r === 2), B = fl.find(f => f.q === -3 && f.r === 3);
    const zwischen = karte.find(f => f.q === 0 && f.r === 1);   // zwischen Stadt und Anleger A
    const fern = sim.nachbarn(B).find(n => n && n.typ !== 'fluss' && sim.betriebFuer(n));
    const fischer = fl.find(f => f.q === -1 && f.r === 3);
    S.land[k(zwischen)] = Object.assign(S.land[k(zwischen)] || { verm: 2, betrieb: '' }, { verm: 2, weg: true });
    [A, B, fischer].forEach(f => { S.land[k(f)] = { verm: 2, betrieb: '' }; });
    S.land[k(fern)] = { verm: 2, betrieb: sim.betriebFuer(fern), weg: true };
    S.gut.holz += 100; S.gut.ziegel += 30;
    const a1 = sim.landBauen(S, A, 'anleger').ok, vorB = sim.verbunden(S, fern);
    const b1 = sim.landBauen(S, B, 'anleger').ok, nachB = sim.verbunden(S, fern);
    const f1 = sim.landBauen(S, fischer, 'fischer').ok; S.land[k(fischer)].weg = true;
    const fischVerb = sim.verbunden(S, fischer);
    SR.umland(true); SR.szene.landAbgleichen(S); const boote = SR.szene.karrenZahl(); SR.umland(false);
    // Fang ohne Esser (Kopie ohne Häuser, Sommer) und Essen aus Fisch (Kopie ohne Brot und Getreide)
    const T = JSON.parse(JSON.stringify(S)); T.geb = T.geb.filter(b => b.t === 'strasse'); T.monat = 6; T.gut.fisch = 0; sim.monat(T, SR.welt);
    const E = JSON.parse(JSON.stringify(S)); E.gut.brot = 0; E.gut.getreide = 0; E.gut.fisch = 100; sim.monat(E, SR.welt);
    SR.monate(1);
    return { a1, b1, f1, vorB, nachB, fischVerb, boote, fang: Math.round(T.gut.fisch * 10) / 10, gegessen: Math.round((100 - E.gut.fisch) * 10) / 10, satt: E.versorgt.essen, kopf: document.querySelector('#waren').textContent.includes('Fisch') };
  });
  ok('Padus: Anleger verbinden per Boot, Fischer liefert, Fisch in der Kopfleiste', fluss.a1 && fluss.b1 && fluss.f1 && !fluss.vorB && fluss.nachB && fluss.fischVerb && fluss.boote >= 2 && fluss.fang > 0 && fluss.gegessen > 0 && fluss.satt && fluss.kopf, JSON.stringify(fluss));
  if (BILD) { await p.evaluate(() => SR.umland(true)); await p.waitForTimeout(400); await p.screenshot({ path: BILD.replace(/\.png$/, '_fluss.png') }); await p.evaluate(() => SR.umland(false)); }

  // S2.5 Placentia: Handel erst mit Verbindung, Preise nach Angebot/Nachfrage, Abgaben an Rom im Herbst
  const handel = await p.evaluate(() => {
    const sim = SR.sim, S = SR.S, kopie = () => JSON.parse(JSON.stringify(S));
    const Z = kopie(); Z.land = {}; const zu = sim.handelOffen(Z), zuGrund = sim.handeln(Z, 'holz', 'verkauf').grund;
    S.gut.holz += 20; S.gut.denare += 200;
    const offen = sim.handelOffen(S), p0 = sim.preis(S, 'holz'), d0 = S.gut.denare;
    const v = SR.handeln('holz', 'verkauf'), p1 = sim.preis(S, 'holz'), plus = S.gut.denare - d0;
    const z0 = sim.preis(S, 'ziegel'), zi0 = S.gut.ziegel, k = SR.handeln('ziegel', 'kauf'), z1 = sim.preis(S, 'ziegel'), zi1 = S.gut.ziegel;
    const M = kopie(); sim.monat(M, SR.welt); const rueck = sim.preis(M, 'holz');
    const A = kopie(); A.monat = 20; A.gut.denare = 1000; A.gunst = 50; const mA = sim.monat(A, SR.welt).join(' | ');
    const B = kopie(); B.monat = 20; B.gut.denare = 0; B.gunst = 50; const mB = sim.monat(B, SR.welt).join(' | ');
    SR.umland(true); SR.hexInfo(sim.nachbarFeld);
    const knoepfe = [...document.querySelectorAll('#info [data-a="handel"]')], ui = { n: knoepfe.length, frei: knoepfe.every(b => !b.disabled), titel: document.querySelector('#info h2').textContent };
    const h0 = S.gut.holz; S.gut.holz += 10; knoepfe[0].click(); ui.klick = Math.round(S.gut.holz) === Math.round(h0);
    SR.hexInfo(null); SR.umland(false);
    return { zu, zuGrund, offen, v: v.ok, plus, billiger: p1 < p0, k: k.ok, mehrZiegel: zi1 - zi0, teurer: z1 > z0, erholt: rueck > p1,
      gunstA: A.gunst, mA: /bezahlt/.test(mA), gunstB: B.gunst, mB: /reicht nicht/.test(mB), ui };
  });
  ok('Placentia: Handel erst mit Verbindung, Preise nach Angebot und Nachfrage', !handel.zu && /kein Weg/.test(handel.zuGrund) && handel.offen && handel.v && handel.plus > 0 && handel.billiger && handel.k && handel.mehrZiegel === 10 && handel.teurer && handel.erholt, JSON.stringify(handel));
  ok('Abgaben an Rom am Ende des Herbstes, Gunst steigt/sinkt', handel.mA && handel.gunstA === 58 && handel.mB && handel.gunstB === 30, JSON.stringify({ a: handel.gunstA, b: handel.gunstB }));
  // S2.6 Gefahren (Zufall erzwungen): Räuber/Wachturm, Hochwasser/Deich, Gallier/Kastell
  const gef = await p.evaluate(() => {
    const sim = SR.sim, S = SR.S, karte = sim.regionKarte(), k = sim.landKey, kopie = () => JSON.parse(JSON.stringify(S));
    const fern = karte.find(f => sim.hexAbstand(f, { q: 0, r: 0 }) >= 2 && (S.land[k(f)] || {}).betrieb && !['anleger', 'kastell'].includes(S.land[k(f)].betrieb) && !sim.raeuberSchutz(S, f));
    const aue = karte.find(f => sim.amFluss(f) && sim.betriebFuer(f));
    S.land[k(aue)] = Object.assign(S.land[k(aue)] || {}, { verm: 2, betrieb: sim.betriebFuer(aue), weg: true });
    const hang = karte.find(f => f.typ === 'hang');
    sim.setzeZufall(() => 0);
    const R1 = kopie(); R1.monat = 14; const mR = sim.monat(R1, SR.welt).join(' | '); const raub = R1.land[k(fern)];
    const R2 = kopie(); R2.monat = 14; R2.land[k(fern)].turm = true; sim.monat(R2, SR.welt); const turm = R2.land[k(fern)];
    const H1 = kopie(); H1.monat = 13; const mH = sim.monat(H1, SR.welt).join(' | '); const nass = H1.land[k(aue)];
    const H2 = kopie(); H2.monat = 13; H2.land[k(aue)].deich = true; H2.land[k(aue)].turm = true; sim.monat(H2, SR.welt); const trocken = H2.land[k(aue)];
    const G1 = kopie(); G1.monat = 28; G1.gut.getreide = 100; const mG1 = sim.monat(G1, SR.welt).join(' | ');
    const G2 = kopie(); G2.monat = 28; G2.gut.getreide = 100; G2.land[k(hang)] = { verm: 2, betrieb: 'kastell' }; const mG2 = sim.monat(G2, SR.welt).join(' | ');
    sim.setzeZufall(null);
    // Bedienung: Wachturm per Knopf auf dem fernen Feld, Kastell auf dem Hang zählt
    S.gut.holz += 50; S.gut.ziegel += 20;
    SR.umland(true); SR.hexInfo(fern);
    const tk = document.querySelector('#info [data-a="schutz"][data-t="turm"]'); if (tk) tk.click();
    const ui = { knopf: !!tk, turm: !!S.land[k(fern)].turm, zeile: document.querySelector('#info').textContent.includes('Wachturm') };
    SR.szene.landAbgleichen(S); SR.hexInfo(null); SR.umland(false);
    return { fern: k(fern), aue: k(aue), raub: raub.stoer > 0 && raub.stoerArt, mR: /Räuber/.test(mR), turm: !(turm.stoer > 0),
      nass: nass.stoer > 0 && nass.stoerArt, mH: /Hochwasser/.test(mH), trocken: !(trocken.stoer > 0),
      mG1: /Gallier fallen/.test(mG1), korn: Math.round(G1.gut.getreide), kornK: Math.round(G2.gut.getreide), mG2: /Kastells/.test(mG2), ui };
  });
  ok('Räuber plündern ferne Betriebe, Wachturm schützt', gef.raub === 'raeuber' && gef.mR && gef.turm, JSON.stringify(gef));
  ok('Hochwasser im Frühling, Deich schützt', gef.nass === 'hochwasser' && gef.mH && gef.trocken);
  ok('Gallier rauben, Kastell schlägt sie zurück', gef.mG1 && gef.korn < gef.kornK - 15 && gef.mG2, JSON.stringify({ korn: gef.korn, mitKastell: gef.kornK }));
  ok('Wachturm per Knopf gebaut', gef.ui.knopf && gef.ui.turm && gef.ui.zeile, JSON.stringify(gef.ui));
  ok('Handelsfenster Placentia mit Knöpfen', handel.ui.titel === 'Placentia' && handel.ui.n === 14 && handel.ui.frei && handel.ui.klick, JSON.stringify(handel.ui));

  // Stadtrang
  const rg = await p.evaluate(() => ({ r: SR.S.rang, kopf: document.querySelector('#datum').textContent }));
  ok('Stadtrang Dorf ab 40 Einwohnern', rg.r === 1 && /^Dorf/.test(rg.kopf), JSON.stringify(rg));

  // S1.6 Ton: nach der ersten Berührung läuft der Ton, Musik geladen, Schalter im Menü
  await p.waitForFunction(() => SR.ton.zustand().musik, null, { timeout: 20000 }).catch(() => {});
  const tz = await p.evaluate(() => SR.ton.zustand());
  await p.click('#menueKnopf'); await p.click('#menue [data-m="ton"]');
  const tonAus = await p.evaluate(() => ({ z: SR.ton.zustand().an, k: document.querySelector('#menue [data-m="ton"]').textContent }));
  await p.click('#menue [data-m="ton"]'); await p.click('#menue [data-m="weiter"]');
  ok('Ton läuft, Musik geladen, Schalter im Menü', tz.laeuft && tz.musik && !tonAus.z && tonAus.k === 'Ton: aus', JSON.stringify({ tz, tonAus }));

  // S1.4 Ansichten
  await p.evaluate(() => SR.tempo(0));
  await p.click('#ansicht button[data-ansicht="wasser"]');
  const ans = await p.evaluate(() => ({ wasser: SR.szene.ansichtZahl(), leg: !document.querySelector('#legende').hidden,
    stimmung: SR.ansicht('stimmung'), arbeit: SR.ansicht('arbeit') }));
  ok('Ansicht Wasser zeigt Brunnenbereich', ans.wasser > 50 && ans.leg, ans.wasser + ' Felder');
  ok('Ansicht Stimmung zeigt Marktstraßen und Häuser', ans.stimmung.felder.length > 5 && ans.stimmung.geb.length >= 5, ans.stimmung.felder.length + ' Straßenfelder, ' + ans.stimmung.geb.length + ' Häuser');
  ok('Ansicht Arbeit färbt Betriebe', ans.arbeit.geb.length >= 8, ans.arbeit.geb.length + ' Gebäude');
  if (BILD) { await p.screenshot({ path: BILD.replace(/\.png$/, '_ansicht.png') }); }
  await p.evaluate(() => SR.ansicht(''));
  ok('Ansicht wieder aus', await p.evaluate(() => SR.szene.ansichtZahl() === 0 && document.querySelector('#legende').hidden));

  if (BILD) { await p.evaluate(() => SR.tempo(0)); await p.waitForTimeout(500); await p.screenshot({ path: BILD }); console.log('  Bild: ' + BILD); }
  ok('Keine Seiten-/Konsolenfehler', !errs.length, errs.slice(0, 4).join(' | '));
  console.log(`STAEDTE ${R.filter(Boolean).length}/${R.length}`);
  await b.close();
})();
