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
  const gesperrt = await p.evaluate(() => !document.querySelector('#regionKarte .gesperrt') && /Puteoli gründen/.test(document.querySelector('.startknoepfe').textContent));   // Phase E: alle Regionen spielbar
  if (BILD) await p.screenshot({ path: BILD.replace(/\.png$/, '_start.png') });
  await p.click('#startseite .ort[data-r="po"]');
  await p.click('.startknoepfe [data-s="neu"]');
  const zu = await p.evaluate(() => document.querySelector('#startseite').hidden && SR.S.region === 'po');
  ok('Startseite: 4 Regionen, Kampanien wählbar, Cremona gegründet', st.offen && st.orte === 4 && gesperrt && zu, JSON.stringify({ st, gesperrt, zu }));
  await p.evaluate(() => { SR.S.ereignisseAus = true; SR.S.sofortBauen = true; SR.S.lagerFrei = true; });   // lagerFrei: Lager-Regel (1.11.) wird eigens geprüft   // Ereignisse eigens geprüft (S4.3), hier würden sie die Bedienung verdecken
  await p.evaluate(() => SR.tempo(0));

  // S1.3: Landstraße beim Start, Bauen nur an der Straße
  const start = await p.evaluate(() => ({ strassen: SR.S.geb.filter(b => b.t === 'strasse').length, ohne: SR.bauen('huette', 16, 25).grund }));
  ok('Landstraße beim Start, Hütte ohne Straße abgelehnt', start.strassen > 20 && /Straße/.test(start.ohne), start.strassen + ' Felder, ' + start.ohne);

  // Bauen per API (Straßennetz: Landstraße z=12, Gassen z=16 und z=19, Verbindungen x=14 und x=15)
  const bau = await p.evaluate(() => {
    Object.assign(SR.S.gut, { denare: 300, holz: 170, ziegel: 40 });   // Test-Vorrat wie vor der Balance vom 1.11. (Abläufe prüfen, nicht Balance)
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
  const nurPlan = await p.evaluate(() => SR.S.geb.length);   // Ziehen setzt nur den Bauplan (1.11.)
  const planVor = await p.evaluate(() => SR.planStand());
  await p.click('#baumodusDreh'); const planDreh = await p.evaluate(() => SR.planStand());
  await p.click('#baumodusOk'); await p.click('#baumodusEnde');
  const nachher = await p.evaluate(() => SR.S.geb.length);
  ok('Hütte per Ziehen: erst Bauplan (drehbar), dann ✓ baut', nurPlan === vorher && !!planVor && planDreh.dreh !== planVor.dreh && nachher === vorher + 1, `${vorher} → Plan ${nurPlan} → ${nachher} ${JSON.stringify(planDreh)}`);
  const rz = await p.evaluate(() => { const S = SR.S; S.gut.holz += 60; const n0 = S.geb.length, h0 = S.gut.holz; let pos = null; for (let z = 2; z < 36 && !pos; z++) for (let x = 2; x < 38 && !pos; x++) if (!SR.sim.pruefePlatz(S, SR.welt, 'huette', x, z)) pos = [x, z];
    SR.plan('huette', pos[0], pos[1]); SR.planBauen(); const n1 = S.geb.length, h1 = S.gut.holz;
    SR.rueckgaengig(); const n2 = S.geb.length, h2 = S.gut.holz; SR.plan(''); return { n0, n1, n2, kost: h0 - h1, erst: h2 === h0 }; });
  await p.evaluate(() => { document.querySelector('#baumodusEnde').click(); });
  ok('Rückgängig nimmt den Bau zurück und erstattet die Baustoffe', rz.n1 === rz.n0 + 1 && rz.n2 === rz.n0 && rz.kost > 0 && rz.erst, JSON.stringify(rz));

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
  ok('Senatsaufträge schreiten fort', lauf.auftrag >= 3, 'Auftrag ' + lauf.auftrag + ', Casas ' + lauf.casa);
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
  // Straßen korrigieren (1.11.): Knopf „Entfernen“ im Straßen-Baumodus, dieselbe Strecke zurück ziehen
  await p.click('.karte[data-t="strasse"]'); await p.click('#baumodusWeg');
  await p.mouse.move(700, 560); await p.mouse.down();
  for (let i = 1; i <= 10; i++) await p.mouse.move(700 + i * 14, 560 - i * 7);
  await p.mouse.up(); await p.click('#baumodusEnde');
  const s2 = await p.evaluate(() => SR.S.geb.filter(b => b.t === 'strasse').length);
  ok('Straße per Ziehen entfernt', s2 <= s0 && s2 < s1, `${s1} → ${s2}`);

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
  await p.evaluate(() => SR.tempo(4)); await p.waitForTimeout(1500);
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
  ok('Umland: 61 Hex-Felder, Stadt in der Mitte, Feldinfo, zurück zur Stadt', um1.n === 61 && um1.modus === 'region' && um1.titel === 'Cremona' && um1.leiste === 'none' && um2 && um2 !== 'Cremona' && um3 === 'stadt', JSON.stringify({ um1, um2, um3 }));

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
    const E = JSON.parse(JSON.stringify(S)); E.gut.brot = 0; E.gut.getreide = 0; E.gut.fisch = 100; E.monat = Math.ceil(E.monat / 12) * 12 + 10; E.geb.forEach(b => delete b.hof); sim.monat(E, SR.welt);   // Winter: keine Ernte, kein Garten
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
    const B = kopie(); B.monat = 20; B.gut.denare = 0; B.gunst = 50; B.auftrag = 999; const mB = sim.monat(B, SR.welt).join(' | ');
    SR.umland(true); SR.hexInfo(sim.nachbarFeld);
    const knoepfe = [...document.querySelectorAll('#info [data-a="handel"]')], ui = { n: knoepfe.length, frei: knoepfe.every(b => !b.disabled), titel: document.querySelector('#info h2').textContent };
    const h0 = S.gut.holz; S.gut.holz += 10; knoepfe[0].click(); ui.klick = Math.round(S.gut.holz) === Math.round(h0);
    SR.hexInfo(null); SR.umland(false);
    return { pWaren: Object.keys(sim.PARTNER.placentia.waren).filter(g => g !== 'sigillata').length, zu, zuGrund, offen, v: v.ok, plus, billiger: p1 < p0, k: k.ok, mehrZiegel: zi1 - zi0, teurer: z1 > z0, erholt: rueck > p1,
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
    const G1 = kopie(); G1.monat = 40; G1.gut.getreide = 100; const mG1 = sim.monat(G1, SR.welt).join(' | ');
    const G2 = kopie(); G2.monat = 40; G2.gut.getreide = 100; G2.land[k(hang)] = { verm: 2, betrieb: 'kastell' }; const mG2 = sim.monat(G2, SR.welt).join(' | ');
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
  // S3.1 Forschung: Ziel wählen, Schule bringt Wissen, Erfindungen wirken, Schrein erst nach Forschung
  const fo = await p.evaluate(() => {
    const sim = SR.sim, S = SR.S, F = sim.forschungS(S), kopie = () => JSON.parse(JSON.stringify(S));
    const schreinVor = SR.bauen('schrein', 30, 13).grund || 'ok';
    const villaVor = sim.forschungWaehlen(S, 'villa').grund, ep2 = sim.forschungWaehlen(S, 'weinbau').grund;
    const w0 = sim.wissenProMonat(S);
    Object.assign(S.gut, { holz: S.gut.holz + 60, ziegel: S.gut.ziegel + 40 });
    let schule = null;
    for (let z = 13; z <= 15 && !schule; z++) for (let x = 2; x <= 36 && !schule; x++) { const r = sim.bauen(S, SR.welt, 'ludus', x, z); if (r.ok) schule = r.b; }
    const wahl = sim.forschungWaehlen(S, 'fruchtwechsel').ok;
    SR.monate(2); const w1 = sim.wissenProMonat(S);
    F.wissen = Math.max(F.wissen, 29); SR.monate(1);
    const fertig = sim.hat(S, 'fruchtwechsel'), bonus = sim.feldErtrag(S);
    F.fertig.push('schreine', 'landvermessung', 'bauhuette', 'villa');
    const schreinNach = SR.bauen('schrein', 30, 13).ok || SR.bauen('schrein', 31, 13).ok || SR.bauen('schrein', 32, 13).ok;
    const verm = sim.vermMonate(S), holzK = (sim.forschungS(S).fertig.includes('bauhuette') ? 1 : 0);
    // Villa rustica: Gehöft ausbauen bringt mehr Getreide (Kopie, Sommer)
    const V = kopie(), karte = sim.regionKarte(), hof = karte.find(f => (V.land[sim.landKey(f)] || {}).betrieb === 'gehoeft' && sim.verbunden(V, f));
    let villa = 'kein Gehöft';
    if (hof) { V.gut.holz += 50; V.gut.ziegel += 40; V.monat = 4; V.land[sim.landKey(hof)].stoer = 0; const W = JSON.parse(JSON.stringify(V)); villa = sim.villaBauen(V, hof).ok;
      V.gut.getreide = 0; W.gut.getreide = 0; V.geb = V.geb.filter(b => b.t === 'strasse'); W.geb = V.geb.slice(); sim.monat(V, SR.welt); sim.monat(W, SR.welt); villa = villa && V.gut.getreide > W.gut.getreide ? true : [villa, V.gut.getreide, W.gut.getreide].join(' '); }
    SR.forschung();
    const karten = document.querySelectorAll('#forschung .fkarte').length, offen = !document.querySelector('#forschung').hidden;
    document.querySelector('#forschung .fkarte[data-f="ziegelbrand"]').click();
    const ziel = F.ziel, zeile = document.querySelector('#forschZeile').textContent;
    document.querySelector('#forschung [data-f="zu"]').click();
    return { schreinVor, villaVor, ep2, w0, schule: !!schule, wahl, w1, fertig, bonus, schreinNach, verm, holzK, villa, karten, offen, ziel, zeile, zu: document.querySelector('#forschung').hidden };
  });
  ok('Forschung: Ziel, Schule bringt Wissen, Fruchtwechsel: Feld trägt 40 statt 32', /erforschen/.test(fo.schreinVor) && /Fruchtwechsel/.test(fo.villaVor) && /Republik/.test(fo.ep2) && fo.schule && fo.wahl && fo.w1 > fo.w0 && fo.fertig && fo.bonus === 40, JSON.stringify(fo));
  ok('Erfindungen: Schrein, Landvermessung, Bauhütte (größerer Bautrupp), Villa rustica', fo.schreinNach && fo.verm === 1 && fo.holzK === 1 && fo.villa === true);
  ok('Forschungsseite: 26 Karten (drei Epochen), Ziel per Antippen, Anzeige im Auftrag', fo.offen && fo.karten === 26 && fo.ziel === 'ziegelbrand' && /Ziegelbrand/.test(fo.zeile) && fo.zu);
  // S3.2 Stände: Sklavenquartier (kaufen, arbeiten nur in Sklaven-Betrieben, Hunger, Freilassung, Furcht), Insula
  const st3 = await p.evaluate(() => {
    const sim = SR.sim, S = SR.S, GEB = SR.GEB, kopie = () => JSON.parse(JSON.stringify(S));
    S.gut.holz += 40; S.gut.denare += 400; S.gut.getreide += 100;
    let q = null;
    for (let z = 13; z <= 18 && !q; z++) for (let x = 2; x <= 36 && !q; x++) { const r = sim.bauen(S, SR.welt, 'quartier', x, z); if (r.ok) q = r.b; }
    if (!q) return { fehler: 'kein Platz für das Quartier' };
    SR.oeffne(q.id); document.querySelector('#info [data-a="kaufen"]').click();
    const k1 = q.skl, k2 = sim.sklavenKaufen(S, q).ok, voll = sim.sklavenKaufen(S, q).grund;
    SR.monate(1);
    const bei = S.geb.filter(b => (b.von || []).some(v => v[0] === q.id)).map(b => b.t);
    const nurErlaubt = bei.length > 0 && bei.every(t => GEB[t].sklaven);
    const H = kopie(); H.monat = 22; H.gut.getreide = 0; H.gut.brot = 999; const hq = H.geb.find(b => b.id === q.id); sim.monat(H, SR.welt); const hunger = hq.skl < 10;
    const L = kopie(); const lq = L.geb.find(b => b.id === q.id), e0 = sim.einwohner(L), d0 = L.gut.denare;
    L.geb.filter(b => b.t === 'huette').forEach(h => { h.bew = Math.min(h.bew, sim.wohnraum(h) - 2); });
    const e1 = sim.einwohner(L), fr = sim.freilassen(L, lq); const frei = fr.ok && lq.skl === 5 && sim.einwohner(L) === e1 + 5 && L.gut.denare > d0;
    const A = kopie(), B = kopie(); A.stimmung = B.stimmung = 60;
    for (let i = 0; i < 20; i++) B.geb.push({ id: 9000 + i, t: 'quartier', x: 30, z: 30, w: 0, prio: false, stufe: 1, bew: 0, skl: 10, status: [] });
    B.gut.getreide = A.gut.getreide = 999; sim.monat(A, SR.welt); sim.monat(B, SR.welt); const furcht = B.stimmung < A.stimmung;
    // Insula: volle Casa mit Wasser und Markt, Kleinstadt, Schrein daneben
    const I = kopie(); I.rang = 2; I.gut.brot = 999; I.gut.ziegel += 60; I.gut.holz += 60; I.gut.stein = 30; sim.forschungS(I).fertig.push('schreine');
    const casa = I.geb.find(b => b.t === 'huette' && b.stufe === 2 && sim.inReichweite(I, b, 'brunnen') && sim.inReichweite(I, b, 'markt'));
    let ins = 'keine passende Casa';
    if (casa) {
      casa.bew = 16; let sch = false;
      for (let dz = -4; dz <= 5 && !sch; dz++) for (let dx = -4; dx <= 5 && !sch; dx++) sch = sim.bauen(I, SR.welt, 'schrein', casa.x + dx, casa.z + dz).ok;
      sim.monat(I, SR.welt); ins = sch && casa.stufe === 3 && sim.wohnraum(casa) === 30 ? true : 'Schrein ' + sch + ', Stufe ' + casa.stufe + ', ' + JSON.stringify(casa.status);
    }
    return { k1, k2, voll, bei, nurErlaubt, hunger, frei, furcht, ins, kopf: document.querySelector('#leute').textContent.includes('Sklaven') };
  });
  ok('Sklaven: kaufen, Quartier voll, arbeiten nur auf Feldern/Werkstätten', st3.k1 === 5 && st3.k2 && /voll/.test(st3.voll) && st3.nurErlaubt && st3.kopf, JSON.stringify(st3));
  ok('Sklaven: Hunger, Freilassung mit Steuer, Furcht bei vielen Sklaven', st3.hunger && st3.frei && st3.furcht);
  ok('Insula: volle Casa mit Schrein wird aufgestockt', st3.ins === true, String(st3.ins));
  // S3.3 Feuer: Brand gezielt auslösen (Zufall gesteuert), ohne Wache greift er über und zerstört, mit Wache gelöscht
  const fe = await p.evaluate(() => {
    const sim = SR.sim, S = SR.S, kopie = () => JSON.parse(JSON.stringify(S));
    const ziel = S.geb.find(b => b.t === 'huette' && sim.brandGefahr(S, b) > 0);
    const nur = (extra = () => 1) => salz => salz === 5000 + ziel.id ? 0 : extra(salz);
    // ohne Wache: 1 Monat → brennt, dann abbrennen
    const A = kopie(); A.monat = 26; A.geb = A.geb.filter(b => b.t !== 'wache');
    sim.setzeZufall(nur()); const m1 = sim.monat(A, SR.welt).join(' | ');
    const brennt = (A.geb.find(b => b.id === ziel.id) || {}).brand === 1;
    sim.setzeZufall(() => 1); for (let i = 0; i < 4; i++) sim.monat(A, SR.welt);
    const weg = !A.geb.some(b => b.id === ziel.id);
    // Übergreifen
    const U = kopie(); U.monat = 26; U.geb = U.geb.filter(b => b.t !== 'wache');
    sim.setzeZufall(nur()); sim.monat(U, SR.welt); sim.setzeZufall(salz => salz >= 7000 && salz < 90000 ? 0 : 1); sim.monat(U, SR.welt);
    const ueber = U.geb.filter(b => b.brand > 0 && b.id !== ziel.id).length;
    // mit Feuerwache: wird gelöscht
    const W = kopie(); W.monat = 26; W.gut.holz += 60; W.gut.ziegel += 40;
    let wache = null;
    for (let r = 2; r <= 9 && !wache; r++) for (let dz = -r; dz <= r && !wache; dz++) for (let dx = -r; dx <= r && !wache; dx++) { const t = sim.bauen(W, SR.welt, 'wache', ziel.x + dx, ziel.z + dz); if (t.ok) wache = t.b; }
    if (wache) wache.prio = true;
    sim.setzeZufall(nur()); sim.monat(W, SR.welt); sim.setzeZufall(() => 1);
    const wz = W.geb.find(b => b.id === ziel.id), vorW = wz.brand, nah = sim.wacheNah(W, wz), m2 = sim.monat(W, SR.welt).join(' | ');
    sim.setzeZufall(null);
    const gt = m2.split(' | ').find(t => /gelöscht/.test(t)), ort = gt && sim.meldOrt(gt);
    SR.melden(gt); const tipp = document.querySelector('#meldung div.tipp'); if (tipp) tipp.click();
    const springt = !!ort && ort.id === ziel.id && !!tipp && !document.querySelector('#info').hidden; SR.oeffne(0);
    const ins = { t: 'huette', stufe: 3, x: ziel.x, z: ziel.z, id: -1 }, hut = { t: 'huette', stufe: 1, x: ziel.x, z: ziel.z, id: -2 };
    const art = SR.ansicht('feuer'); SR.ansicht('');
    return { m1: /Feuer/.test(m1), brennt, weg, ueber, wache: !!wache, vorW, nah, geloescht: wz.brand === 0 && /gelöscht/.test(m2), springt,
      insulaGefaehrlicher: sim.brandGefahr(S, ins) > sim.brandGefahr(S, hut), legende: art && art.legende.length, knopf: !!document.querySelector('#ansicht [data-ansicht="feuer"]') };
  });
  ok('Feuer: Brand bricht aus, greift über, brennt ab', fe.m1 && fe.brennt && fe.weg && fe.ueber > 0, JSON.stringify(fe));
  ok('Feuerwache löscht den Brand, Meldung antippbar (springt zum Haus)', fe.wache && fe.vorW === 1 && fe.nah && fe.geloescht && fe.springt, JSON.stringify(fe));
  ok('Brandgefahr Insula höher, Ansicht Feuer', fe.insulaGefaehrlicher && fe.legende === 5 && fe.knopf);
  // Stadterweiterung (1.11.): Land im Osten gesperrt, Senat gibt frei, Via Postumia wird verlängert
  const ew = await p.evaluate(() => {
    const sim = SR.sim, S = SR.S, kopie = () => JSON.parse(JSON.stringify(S));
    S.grenze = 0;
    const vor = sim.pruefePlatz(S, SR.welt, 'huette', 42, 13), A = kopie(); A.rang = 0; A.monat = 0; A.geb = A.geb.filter(b => b.t === 'strasse');
    const zuFrueh = sim.erweitern(A, SR.welt).grund || '';
    const rangAlt = S.rang; S.rang = Math.max(S.rang || 0, 2); S.gunst = 70; S.gut.denare += 700;
    SR.erweiterungInfo(); const knopf = document.querySelector('#info [data-a="erweitern"]'), frei = knopf && !knopf.disabled;
    const s0 = S.geb.filter(b => b.t === 'strasse' && b.x >= 40).length;
    knopf.click();
    const g1 = sim.stadtGrenze(S), s1 = S.geb.filter(b => b.t === 'strasse' && b.x >= 40).length, nach = SR.bauen('huette', 42, 13);
    const zwei = sim.erweitern(S, SR.welt).ok, g2 = sim.stadtGrenze(S), drei = sim.erweitern(S, SR.welt).grund; S.rang = rangAlt; SR.bauen('huette', -5, -5);
    return { vor, zuFrueh, frei, s0, g1, s1, nach: nach.ok || nach.grund, zwei, g2, drei };
  });
  ok('Stadterweiterung: Senat gibt Land im Osten frei, Landstraße verlängert', /Senat/.test(ew.vor) && /Stadtrang/.test(ew.zuFrueh) && ew.frei && ew.s0 === 0 && ew.g1 === 52 && ew.s1 >= 10 && ew.nach === true && ew.zwei && ew.g2 === 64 && /größte/.test(ew.drei), JSON.stringify(ew));
  // Ring 4 (1.11.): Stein/Erz, Mantua über Land, Gallier-Geschenke, Schmiede mit Werkzeug
  const r4 = await p.evaluate(() => {
    const sim = SR.sim, S = SR.S, karte = sim.regionKarte(), kopie = () => JSON.parse(JSON.stringify(S)), k = sim.landKey;
    const stein = karte.find(f => f.typ === 'stein'), erz = karte.find(f => f.typ === 'erz');
    const M = kopie(); M.land = {}; const zu = sim.handelOffen(M, 'mantua');
    [[1, 0], [2, -1], [3, -1], [4, -1]].forEach(([q, r]) => { M.land[q + ',' + r] = { verm: 2, betrieb: '', weg: true }; });
    const offen = sim.handelOffen(M, 'mantua'), plOffen = sim.handelOffen(M, 'placentia');
    M.gut.erz = 20; M.gut.denare = 500; const v = sim.handeln(M, 'erz', 'verkauf', 'mantua'), kf = sim.handeln(M, 'werkzeug', 'kauf', 'mantua');
    const G = kopie(); G.gut.brot = 100; G.gut.denare += 100; G.land = {}; const gs = sim.geschenk(G).ok, fr = G.frieden;
    G.monat = 40; sim.setzeZufall(() => 0); const mG = sim.monat(G, SR.welt).join(' | '); sim.setzeZufall(null);
    const W = kopie(); W.gut.holz += 80; W.gut.ziegel += 40; W.gut.erz = 40; W.gut.werkzeug = 0; let sm = null;
    for (let z = 13; z <= 20 && !sm; z++) for (let x = 2; x <= 38 && !sm; x++) { const t = sim.bauen(W, SR.welt, 'schmiede', x, z); if (t.ok) sm = t.b; }
    if (sm) sm.prio = true;
    sim.monat(W, SR.welt);
    SR.umland(true); SR.hexInfo(sim.mantuaFeld); const ui = { titel: document.querySelector('#info h2').textContent, knoepfe: document.querySelectorAll('#info [data-p="mantua"]').length };
    SR.hexInfo(sim.gallierFeld); ui.geschenk = !!document.querySelector('#info [data-a="geschenk"]'); SR.hexInfo(null); SR.umland(false);
    return { mWaren: sim.PARTNER.mantua.waren, stein: !!stein && sim.betriebeFuer(stein).includes('steinbruch'), erz: !!erz && sim.betriebeFuer(erz).includes('erzgrube'), zu, offen, plOffen, v: v.ok, kf: kf.ok,
      gs, fr, friedlich: !/Gallier fallen/.test(mG), schmiede: !!sm, werkzeug: Math.round((W.gut.werkzeug || 0) * 10) / 10, ui };
  });
  ok('Ring 4: Steinbruch und Erz, Mantua nur über Land, Handel', r4.stein && r4.erz && !r4.zu && r4.offen && !r4.plOffen && r4.v && r4.kf, JSON.stringify(r4));
  ok('Gallier: Geschenke bringen Frieden, Schmiede macht Werkzeug', r4.gs && r4.fr === 24 && r4.friedlich && r4.schmiede && r4.werkzeug > 0);
  ok('Fenster Mantua und Insubrer-Dorf', r4.ui.titel === 'Mantua' && r4.ui.knoepfe === 3 * Object.keys(r4.mWaren).filter(g => g !== 'sigillata').length && r4.ui.geschenk, JSON.stringify(r4.ui));
  // Späte Republik (1.11.): Übergang, Weinberg → Kelter → Wein, Domus der Equites, Archiv
  const ep = await p.evaluate(() => {
    const sim = SR.sim, S = SR.S, kopie = () => JSON.parse(JSON.stringify(S));
    SR.forschung(); const block = !!document.querySelector('#forschung .fepochewahl'), knopfAus = document.querySelector('#forschung [data-f="epoche"]').disabled;
    document.querySelector('#forschung [data-f="zu"]').click();
    const E = kopie(), F = sim.forschungS(E);
    const vorher = sim.epocheWechseln(E).grund || '', domusVor = sim.bauen(E, SR.welt, 'domus', 30, 13).grund || '';
    E.rang = 3; E.gunst = 60; F.fertig = [...new Set([...F.fertig, 'fruchtwechsel', 'villa', 'ziegelbrand', 'schotter', 'steuerlisten', 'landvermessung'])];
    const wechsel = sim.epocheWechseln(E).ok, wein = sim.forschungWaehlen(E, 'weinbau').ok, tempel = sim.forschungWaehlen(E, 'theater').grund;
    F.fertig.push('weinbau', 'archiv');
    const hang = sim.regionKarte().find(f => f.typ === 'hang' && !(E.land[sim.landKey(f)] || {}).betrieb);
    E.land[sim.landKey(hang)] = { verm: 2, betrieb: '' }; const berg = sim.landBauen(E, hang, 'weinberg').ok;
    Object.assign(E.gut, { holz: E.gut.holz + 200, ziegel: E.gut.ziegel + 150, stein: 60, wein: 60, brot: 500, denare: E.gut.denare + 300 });
    let kelter = false, domus = null;
    for (let z = 13; z <= 20 && !kelter; z++) for (let x = 2; x <= 38 && !kelter; x++) kelter = sim.bauen(E, SR.welt, 'kelter', x, z).ok;
    for (let z = 2; z <= 34 && !domus; z++) for (let x = 2; x <= 37 && !domus; x++) {
      if (sim.pruefePlatz(E, SR.welt, 'domus', x, z)) continue;
      const t = sim.bauen(E, SR.welt, 'domus', x, z); if (!t.ok) continue;
      if (sim.inReichweite(E, t.b, 'markt')) { domus = t.b; for (let k = 0; k < 40 && !sim.inReichweite(E, t.b, 'brunnen'); k++) sim.bauen(E, SR.welt, 'brunnen', x - 3 + (k % 9), z - 2 + Math.floor(k / 9) * 2); }
      else sim.abreissen(E, t.b.id);
    }
    if (domus) for (let k = 0; k < 4; k++) E.geb.push({ id: 95000 + k, t: 'statue', x: domus.x + (k % 2) * 3 - 1, z: domus.z + Math.floor(k / 2) * 3 - 1, w: 0, prio: false, stufe: 1, bew: 0, status: [] });   // gute Lage (Bodenwert)
    E.monat = 4; sim.monat(E, SR.welt); sim.monat(E, SR.welt);
    const A = kopie(); const ohne = sim.handelSumme(A, 'holz', 'kauf'); A.forschung = { ziel: '', wissen: 0, fertig: ['archiv'] }; const mit = sim.handelSumme(A, 'holz', 'kauf');
    return { block, knopfAus, vorher, domusVor, wechsel, wein, tempel, berg, kelter, domus: !!domus, eq: domus ? domus.bew : -1, dst: domus ? JSON.stringify(domus.status) + ' st' + Math.round(E.stimmung) + ' w' + sim.inReichweite(E, domus, 'brunnen') : '', weinWeg: E.gut.wein < 60, archiv: mit < ohne };
  });
  ok('Späte Republik: Übergang mit Rang, Erfindungen und Gunst', ep.block && ep.knopfAus && /Stadtrang/.test(ep.vorher) && /Späten Republik/.test(ep.domusVor) && ep.wechsel && ep.wein && /Tempelbau/.test(ep.tempel), JSON.stringify(ep));
  ok('Weinberg, Kelter, Domus mit Equites, Archiv senkt Aufschlag', ep.berg && ep.kelter && ep.domus && ep.eq >= 1 && ep.weinWeg && ep.archiv);
  // Unterhalt (1.11.): Lohn/Sold kostet Denare; ohne Geld steht der Markt still
  const uh = await p.evaluate(() => {
    const sim = SR.sim, S = SR.S, kopie = () => JSON.parse(JSON.stringify(S));
    const A = kopie(); A.gut.denare = 1000; sim.monat(A, SR.welt); const bezahlt = A.letzte.unterhalt, markt = A.geb.find(b => b.t === 'markt');
    const B = kopie(); B.gut.denare = 0; sim.monat(B, SR.welt);
    const mb = B.geb.find(b => b.t === 'markt');
    return { summe: sim.unterhaltSumme(S), bezahlt, marktOk: markt && !markt.unbezahlt, marktStill: mb && mb.unbezahlt === true && mb.w === 0 && /Lohn/.test(JSON.stringify(mb.status)) };
  });
  ok('Unterhalt: Lohn wird bezahlt, ohne Geld steht der Markt still', uh.summe > 0 && uh.bezahlt > 0 && uh.marktOk && uh.marktStill, JSON.stringify(uh));
  // Späte Republik vollständig (1.11.): Öl, Tuch, Garum, Tempel, Theater
  const sr = await p.evaluate(() => {
    const sim = SR.sim, S = SR.S, E = JSON.parse(JSON.stringify(S)), F = sim.forschungS(E);
    E.epoche = 2; F.fertig = [...new Set([...F.fertig, 'olivenpresse', 'weberei', 'garum', 'tempel', 'theater', 'weinbau'])];
    Object.assign(E.gut, { holz: 900, ziegel: 900, stein: 900, denare: 3000, oel: 50, garum: 50, tuch: 50, wein: 50, brot: 500 });
    const gebaut = {};
    for (const t of ['oelmuehle', 'weberei', 'garumsiederei', 'tempel', 'theater']) {
      for (let z = 1; z <= 34 && !gebaut[t]; z++) for (let x = 1; x <= 37 && !gebaut[t]; x++) { const r = sim.bauen(E, SR.welt, t, x, z); if (r.ok) { gebaut[t] = r.b; r.b.prio = true; } }
    }
    const karte = sim.regionKarte(), frei = typ => karte.find(f => f.typ === typ && !(E.land[sim.landKey(f)] || {}).betrieb);
    const hang = frei('hang'), weide = frei('weide');
    E.land[sim.landKey(hang)] = { verm: 2, betrieb: '' }; E.land[sim.landKey(weide)] = { verm: 2, betrieb: '' };
    const oliven = sim.landBauen(E, hang, 'olivenhain').ok, schafe = sim.landBauen(E, weide, 'schaeferei').ok;
    const dom = { id: 9900, t: 'domus', x: 0, z: 0, w: 0, prio: false, stufe: 1, bew: 10, status: [] }; E.geb.push(dom);
    E.monat = 8; const g0 = sim.gunst(E); sim.monat(E, SR.welt);
    return { gebaut: Object.keys(gebaut), oliven, schafe, lux: dom.lux, tuch: E.versorgt.tuch, gunst: sim.gunst(E) - g0,
      tempelArbeit: (gebaut.tempel || {}).w > 0, theaterArbeit: (gebaut.theater || {}).w > 0 };
  });
  ok('Späte Republik: Ölmühle, Weberei, Garum, Tempel, Theater gebaut; Olivenhain, Schäferei', sr.gebaut.length === 5 && sr.oliven && sr.schafe, JSON.stringify(sr));
  ok('Öl und Garum als Luxus, Tuch versorgt, Tempel bringt Gunst', sr.lux === 1.5 && sr.tuch && sr.tempelArbeit && sr.gunst >= 2);
  // Händler sichtbar (1.11.): Weg nach Mantua → Maultierkarren; Anleger → Boot nach Placentia
  const hd = await p.evaluate(() => {
    const S = SR.S; [[1, 0], [2, -1], [3, -1], [4, -1]].forEach(([q, r]) => { S.land[q + ',' + r] = Object.assign(S.land[q + ',' + r] || { betrieb: '' }, { verm: 2, weg: true }); });
    SR.umland(true); SR.szene.landAbgleichen(S); SR.szene.zeichnen(2, 1); const n = SR.szene.haendlerZahl(); SR.umland(false);
    return { n, mantua: SR.sim.handelOffen(S, 'mantua'), placentia: SR.sim.handelOffen(S, 'placentia') };
  });
  ok('Händler fahren nach Mantua und Placentia', hd.mantua && hd.placentia && hd.n === 2, JSON.stringify(hd));
  // S4.3 Ereignisse: Hannibal-Ereignisse fest, Zufallsereignisse, Wahl mit Folgen, Fenster mit Bild
  const ev = await p.evaluate(async () => {
    const sim = SR.sim, S = SR.S, E = JSON.parse(JSON.stringify(S)); E.ereignisseAus = false; E.ereignisLog = {}; E.ereignis = null;
    E.monat = 7; sim.monat(E, SR.welt); const heer = E.ereignis;
    const g0 = sim.gunst(E), k0 = E.gut.getreide; E.gut.getreide = Math.max(E.gut.getreide, 30); const k1 = E.gut.getreide;
    const w = sim.ereignisWaehlen(E, 0).ok, gunst = sim.gunst(E) - g0, korn = k1 - E.gut.getreide;
    E.monat = 10; sim.monat(E, SR.welt); const trebia = E.ereignis; sim.ereignisWaehlen(E, 2);
    E.monat = 30; sim.setzeZufall(() => 0); sim.monat(E, SR.welt); sim.setzeZufall(null); const zufall = E.ereignis;
    const arm = JSON.parse(JSON.stringify(E)); arm.ereignis = 'bestechung';
    const text = sim.wirkungText(sim.ereignis('heer').wahl[0]);
    // Fenster im Spiel
    S.ereignisseAus = false; S.ereignis = 'trebia'; document.querySelector('#ereignis').hidden = true;
    SR.monate(0); SR.bauen('huette', -9, -9);
    await new Promise(r => setTimeout(r, 400));
    const fenster = !document.querySelector('#ereignis').hidden, knoepfe = document.querySelectorAll('#ereignis .ewahl').length, titel = (document.querySelector('#ereignis h2') || {}).textContent;
    const bild = getComputedStyle(document.querySelector('#ereignis .ebild')).backgroundImage.startsWith('url');
    document.querySelector('#ereignis [data-e="1"]').click();
    const zu = document.querySelector('#ereignis').hidden && !S.ereignis; S.ereignisseAus = true;
    return { heer, w, gunst, korn, trebia, zufall, text, fenster, knoepfe, titel, bild, zu };
  });
  ok('Ereignisse: Konsul will Getreide (fest), Trebia, Zufall', ev.heer === 'heer' && ev.w && ev.gunst === 8 && ev.korn === 20 && ev.trebia === 'trebia' && !!ev.zufall, JSON.stringify(ev));
  const fest = await p.evaluate(() => {
    const sim = SR.sim, E = JSON.parse(JSON.stringify(SR.S)); E.ereignisseAus = false; E.ereignisLog = {}; E.ereignis = null;
    const r = [];
    for (const m of [13, 18, 21, 25]) { E.monat = m; sim.monat(E, SR.welt); r.push(E.ereignis || '-'); if (E.ereignis) sim.ereignisWaehlen(E, sim.ereignis(E.ereignis).wahl.length - 1); }
    E.monat = 26; sim.setzeZufall(() => 0.99); sim.monat(E, SR.welt); sim.setzeZufall(null); r.push(E.ereignis || '-');
    return r.join(',');
  });
  ok('Feste: Cerealia, Ludi Romani, Saturnalien jedes Jahr, nicht doppelt', fest === 'cerealia,ludi,saturnalia,cerealia,-', fest);
  ok('Ereignisfenster mit Bild, 3 Wahlmöglichkeiten, schließt nach der Wahl', ev.fenster && ev.knoepfe === 3 && /Trebia/.test(ev.titel) && ev.bild && ev.zu && /Getreide/.test(ev.text));
  // Seuchen (1.11.): Ausbruch, Ansteckung, Tote; Latrine senkt die Gefahr; Ansicht Gesundheit
  const se = await p.evaluate(() => {
    const sim = SR.sim, S = SR.S, kopie = () => JSON.parse(JSON.stringify(S));
    const haus = S.geb.find(b => b.t === 'huette' && b.bew > 4);
    const A = kopie(); A.monat = 14; A.ereignisseAus = true;
    sim.setzeZufall(z => z === 6000 + haus.id ? 0 : 1); sim.monat(A, SR.welt);
    const ah = A.geb.find(b => b.id === haus.id), krank = ah.krank > 0, bew0 = ah.bew;
    sim.setzeZufall(z => z >= 8000 ? 0 : 1); sim.monat(A, SR.welt); sim.setzeZufall(null);
    const angesteckt = A.geb.filter(b => b.krank > 0 && b.id !== haus.id).length, weniger = ah.bew < bew0;
    const L = kopie(); const p0 = sim.seuchenGefahr(L, L.geb.find(b => b.id === haus.id)); L.gut.ziegel += 30; L.gut.holz += 20;
    let lat = false; for (let dz = -5; dz <= 5 && !lat; dz++) for (let dx = -5; dx <= 5 && !lat; dx++) lat = sim.bauen(L, SR.welt, 'latrine', haus.x + dx, haus.z + dz).ok;
    const p1 = sim.seuchenGefahr(L, L.geb.find(b => b.id === haus.id));
    const ans = SR.ansicht('gesundheit'); SR.ansicht('');
    return { krank, angesteckt, weniger, lat, senkt: p1 < p0 * 0.5, legende: ans.legende.length, knopf: !!document.querySelector('#ansicht [data-ansicht="gesundheit"]') };
  });
  ok('Seuche: Ausbruch, Ansteckung, Tote; Latrine senkt die Gefahr; Ansicht Gesundheit', se.krank && se.angesteckt > 0 && se.weniger && se.lat && se.senkt && se.legende === 5 && se.knopf, JSON.stringify(se));
  // Wahrzeichen und Inschriften (1.11.): Basilika mit Baustelle und Eröffnung, nur einmal; Inschriften-Tafel
  const wz = await p.evaluate(() => {
    const sim = SR.sim, S = SR.S, B = JSON.parse(JSON.stringify(S)); B.ereignisseAus = true;
    const zuKlein = (() => { const K = JSON.parse(JSON.stringify(B)); K.rang = 0; K.geb.forEach(h => h.bew = 0); return sim.bauen(K, SR.welt, 'basilika', 2, 2).grund || ''; })();
    B.rang = 2; Object.assign(B.gut, { stein: 500, ziegel: 500, holz: 500, denare: 2000 }); B.grenze = 2;
    let ba = null; for (let z = 0; z <= 34 && !ba; z++) for (let x = 0; x <= 56 && !ba; x++) { const r = sim.bauen(B, SR.welt, 'basilika', x, z); if (r.ok) ba = r.b; }
    if (!ba) return { fehler: 'kein Platz' };
    const zweite = (() => { for (let z = 0; z <= 34; z++) for (let x = 0; x <= 56; x++) { const r = sim.bauen(B, SR.welt, 'basilika', x, z); if (!/Platz|Straße|schon etwas|Wald|Fluss|freigegeben|Außerhalb/.test(r.grund || '')) return r.grund || 'ok'; } return ''; })();
    const bau0 = ba.bau; for (let i = 0; i < 8; i++) sim.monat(B, SR.welt);
    const fertig = !(ba.bau > 0), eroeffnung = B.ereignis === 'eroeffnung'; sim.ereignisWaehlen(B, 1);
    sim.monat(B, SR.welt); const tafel = Object.keys(B.inschriften || {});
    SR.inschriften(); const steine = document.querySelectorAll('#inschriften .fkarte').length; document.querySelector('#inschriften [data-in="zu"]').click();
    return { zuKlein, bau0, zweite, fertig, eroeffnung, tafel, steine };
  });
  ok('Basilika: ab Kleinstadt, 8 Monate Baustelle, Eröffnung, nur einmal', /Kleinstadt/.test(wz.zuKlein) && wz.bau0 === 8 && /schon eine/.test(wz.zweite) && wz.fertig && wz.eroeffnung, JSON.stringify(wz));
  const weihe = await p.evaluate(() => {
    const sim = SR.sim, B = JSON.parse(JSON.stringify(SR.S)); B.sofortBauen = false; B.ereignisseAus = false; B.ereignis = null; B.epoche = 2;
    B.forschung = B.forschung || {}; B.forschung.fertig = [...(B.forschung.fertig || []), 'tempel']; B.ereignisLog = { cerealia: 1e9, ludi: 1e9, saturnalia: 1e9 };
    Object.assign(B.gut, { stein: 500, ziegel: 500, holz: 500, denare: 2000 }); B.gesch = { belagerung: 'fertig', siedler: 'fertig', via: 'fertig', spartacus: 'fertig', enteignung: 'fertig' };
    let t = null; for (let z = 0; z <= 34 && !t; z++) for (let x = 0; x <= 56 && !t; x++) { const r = sim.bauen(B, SR.welt, 'tempel', x, z); if (r.ok) t = r.b; else if (/Forsch|Epoche|erst/.test(r.grund || '')) return { grund: r.grund }; }
    if (!t) return { grund: 'kein Platz' };
    let n = 0; while (t.bau > 0 && n++ < 30) { if (B.ereignis && B.ereignis !== 'eroeffnung_tempel') B.ereignis = null; sim.monat(B, SR.welt); }
    const ev = B.ereignis; const r = ev ? sim.ereignisWaehlen(B, 1) : {};
    return { ev, n, ok: r.ok };
  });
  ok('Erster Tempel wird mit einer Weihe eröffnet', weihe.ev === 'eroeffnung_tempel' && weihe.ok, JSON.stringify(weihe));
  ok('Inschriften des Forums: Erfolge werden eingetragen, Tafel im Menü', wz.tafel.includes('basilika') && wz.tafel.includes('dorf') && wz.steine === 16);
  const auf = await p.evaluate(() => {
    const sim = SR.sim, A = JSON.parse(JSON.stringify(SR.S)); A.ereignisseAus = true; A.auftrag = 9; A.land = {};
    const vor = A.auftrag; ['0,1', '1,0', '-1,1'].forEach(k => A.land[k] = { verm: 2, betrieb: k === '0,1' ? 'gehoeft' : '' }); sim.monat(A, SR.welt);
    const alt = SR.S.auftrag; SR.S.auftrag = 9; SR.bauen('huette', -9, -9); const text = document.querySelector('#auftragText').textContent; SR.S.auftrag = alt; SR.bauen('huette', -9, -9);
    return { vor, nach: A.auftrag, text };
  });
  ok('Senatsaufträge führen weiter ins Umland', auf.vor === 9 && auf.nach === 10 && /Umland/.test(auf.text), JSON.stringify(auf));
  const eimer = await p.evaluate(() => {
    const sim = SR.sim, E = JSON.parse(JSON.stringify(SR.S)); E.ereignisseAus = true; E.geb = E.geb.filter(b => b.t !== 'wache');
    const h = E.geb.find(b => b.t === 'huette' && b.bew > 0); h.brand = 1; E.monat = 30;
    sim.setzeZufall(z => z >= 99000 ? 0 : 1); const m = sim.monat(E, SR.welt).join(' | '); sim.setzeZufall(null);
    return { aus: !(h.brand > 0), text: /Eimerketten/.test(m) };
  });
  ok('Feuer: Nachbarn löschen auch ohne Wache mit Eimerketten', eimer.aus && eimer.text, JSON.stringify(eimer));
  // Alter Spielstand aus Stufe 1 (ohne Umland, Familie, Forschung, neue Waren, dreh) läuft weiter; Hilfe in Kapiteln
  const alt = await p.evaluate(async () => {
    const jetzt = SR.S, fehler = [];
    const A = { v: 1, jahr0: -218, monat: 30, gut: { denare: 300, holz: 100, lehm: 10, ziegel: 40, getreide: 80, mehl: 5, brot: 30 }, naechste: 50, stimmung: 60, auftrag: 4, letzte: {}, versorgt: { brot: true, essen: true },
      geb: jetzt.geb.filter(b => ['strasse', 'huette', 'feld', 'muehle', 'baeckerei', 'brunnen', 'markt', 'holzfaeller'].includes(b.t)).map(b => ({ id: b.id, t: b.t, x: b.x, z: b.z, w: 0, prio: false, stufe: Math.min(2, b.stufe || 1), bew: b.bew || 0, status: [] })) };
    A.naechste = Math.max(...A.geb.map(b => b.id)) + 1;
    try {
      SR.setzeStand(A); SR.monate(3); SR.forschung(); document.querySelector('#forschung [data-f="zu"]').click();
      SR.umland(true); SR.hexInfo(SR.sim.regionKarte()[1]); SR.hexInfo(null); SR.umland(false); SR.inschriften(); document.querySelector('#inschriften [data-in="zu"]').click();
    } catch (e) { fehler.push(e.message); }
    const ok = { monat: SR.S.monat, familie: !!SR.S.familie, fisch: SR.S.gut.fisch === 0 || SR.S.gut.fisch > 0, dreh: SR.S.geb.every(b => b.t === 'strasse' || b.dreh !== undefined) };
    SR.setzeStand(jetzt);
    SR.hilfe(); const kapitel = document.querySelectorAll('#hilfe section').length; document.querySelector('#hilfe [data-hi="zu"]').click();
    return { fehler, ...ok, kapitel };
  });
  ok('Alter Spielstand aus Stufe 1 läuft weiter (Waren, Drehung ergänzt)', !alt.fehler.length && alt.monat === 33 && alt.fisch && alt.dreh, JSON.stringify(alt));
  ok('Hilfe in 8 Kapiteln (mit Regionen, ohne Familie)', alt.kapitel === 8);
  const th = await p.evaluate(() => {
    const sim = SR.sim, T = JSON.parse(JSON.stringify(SR.S)); T.ereignisseAus = true; T.epoche = 2;
    const vor = sim.bauen(T, SR.welt, 'thermen', 30, 13).grund || '';
    sim.forschungS(T).fertig.push('aquaedukt'); Object.assign(T.gut, { ziegel: 500, stein: 500, holz: 500, denare: 2000 });
    const haus = T.geb.find(b => b.t === 'huette' && b.bew > 0); let th = null;
    for (let r = 2; r <= 14 && !th; r++) for (let dz = -r; dz <= r && !th; dz++) for (let dx = -r; dx <= r && !th; dx++) { const q = sim.bauen(T, SR.welt, 'thermen', haus.x + dx, haus.z + dz); if (q.ok) th = q.b; }
    if (!th) return { vor, fehler: 'kein Platz' };
    th.prio = true; const p0 = sim.seuchenGefahr(T, haus), h0 = T.gut.holz; sim.monat(T, SR.welt);
    const geheizt = th.geheizt, nah = sim.thermeNah(T, haus), p1 = sim.seuchenGefahr(T, haus);
    const K = JSON.parse(JSON.stringify(T)); K.gut.holz = 0; K.land = {}; K.geb = K.geb.filter(b => b.t !== 'holzfaeller'); sim.monat(K, SR.welt); const kalt = K.geb.find(b => b.id === th.id).geheizt === false;
    return { vor, geheizt, nah, seuche: p1 < p0, kalt };
  });
  ok('Thermen: erst mit Aquädukt, heizen mit Holz, Nähe senkt Seuchengefahr, kalt ohne Holz', /Aquädukt/.test(th.vor) && th.geheizt && th.nah && th.seuche && th.kalt, JSON.stringify(th));
  const vc = await p.evaluate(() => {
    const sim = SR.sim, V = JSON.parse(JSON.stringify(SR.S)); V.ereignisseAus = true;
    const hof = sim.regionKarte().find(f => (V.land[sim.landKey(f)] || {}).betrieb === 'gehoeft' && sim.verbunden(V, f));
    if (!hof) return { fehler: 'kein verbundenes Gehöft' };
    const l = V.land[sim.landKey(hof)]; l.villa = true; l.villaMonate = 35; l.stoer = 0;
    const m = sim.monat(V, SR.welt).join(' | ');
    SR.umland(true); SR.szene.landAbgleichen(V); SR.szene.landAbgleichen(SR.S); SR.umland(false);
    return { vicus: !!l.vicus, text: /vicus/.test(m), ton: typeof SR.ton.sfx === 'function' };
  });
  ok('Vicus: Dorf wächst um die Villa rustica', vc.vicus && vc.text, JSON.stringify(vc));
  const ch = await p.evaluate(() => {
    const c = (SR.S.chronik || []).length, t = (SR.S.tagebuch || []).length;
    SR.chronik(); const kurven = document.querySelectorAll('#chronik .kurve svg').length, zeilen = document.querySelectorAll('#chronik .zeile').length;
    document.querySelector('#chronik [data-ch="zu"]').click();
    return { c, t, kurven, zeilen };
  });
  ok('Chronik: Jahreswerte, Kurven, letzte Meldungen', ch.c >= 2 && ch.t >= 3 && ch.kurven === 3 && ch.zeilen === ch.t, JSON.stringify(ch));
  const rt = await p.evaluate(() => {
    const sim = SR.sim, A = JSON.parse(JSON.stringify(SR.S)); A.monat = 10; A.gut.getreide = 1; A.gut.brot = 0; A.gut.fisch = 0;
    const hunger = sim.rat(A); const B = JSON.parse(JSON.stringify(SR.S)); Object.assign(B.gut, { getreide: 999, holz: 2, denare: 999 });
    B.geb.forEach(b => { if (SR.GEB[b.t].arbeiter) b.w = 1; });
    const holz = sim.rat(B);
    SR.bauen('huette', -9, -9); const zeile = document.querySelector('#ratZeile');
    return { hunger, holz, anzeige: zeile.hidden ? '' : zeile.textContent };
  });
  ok('Rat des Verwalters: Vorräte, Holz', /Vorräte (reichen nur noch|sind aufgebraucht)/.test(rt.hunger) && /Holz wird knapp/.test(rt.holz), JSON.stringify(rt));
  const wt = await p.evaluate(() => { SR.szene.jahreszeitFarbe(3); const winter = SR.szene.wetterSichtbar(); SR.szene.jahreszeitFarbe(1); const sommer = SR.szene.wetterSichtbar();
    SR.szene.jahreszeitFarbe(SR.sim.jahreszeit(SR.S)); return { winter, sommer, knopf: !!document.querySelector('#menue [data-m="wetter"]') }; });
  ok('Wetter: Schnee im Winter, klar im Sommer, Schalter im Menü', wt.winter && !wt.sommer && wt.knopf, JSON.stringify(wt));
  // Phase A: Bauzeit für alle Gebäude, Bauarbeiter, Abbruch mit voller Erstattung
  const bz = await p.evaluate(() => {
    const sim = SR.sim, B = JSON.parse(JSON.stringify(SR.S)); B.sofortBauen = false; B.ereignisseAus = true; Object.assign(B.gut, { holz: 500, ziegel: 300, denare: 900 });
    const haus = B.geb.find(b => b.t === 'huette' && b.bew > 0);
    let h = null; for (let r = 2; r <= 10 && !h; r++) for (let dz = -r; dz <= r && !h; dz++) for (let dx = -r; dx <= r && !h; dx++) { const q = sim.bauen(B, SR.welt, 'huette', haus.x + dx, haus.z + dz); if (q.ok) h = q.b; }
    const imBau = h.bau === 1 && h.bew === 0, strasse = sim.bauen(B, SR.welt, 'strasse', 39, 30); const strasseSofort = strasse.ok && !(strasse.b.bau > 0);
    sim.monat(B, SR.welt); const fertig = !(h.bau > 0), arbeiter = h.bw === undefined || h.bw >= 0;
    const markt = sim.bauzeit('markt'), tempel = sim.bauzeit('tempel'), basilika = sim.bauzeit('basilika');
    const h0 = B.gut.holz; let m = null; for (let r = 2; r <= 12 && !m; r++) for (let dz = -r; dz <= r && !m; dz++) for (let dx = -r; dx <= r && !m; dx++) { const q = sim.bauen(B, SR.welt, 'markt', haus.x + dx, haus.z + dz); if (q.ok) m = q.b; }
    const nachBau = B.gut.holz; sim.abreissen(B, m.id); const zurueck = B.gut.holz === h0 && nachBau < h0;
    return { imBau, strasseSofort, fertig, markt, tempel, basilika, zurueck };
  });
  ok('Bauzeit: Hütte erst Baustelle, Straße sofort, Abbruch gibt alles zurück', bz.imBau && bz.strasseSofort && bz.fertig && bz.markt >= 1 && bz.tempel > bz.markt && bz.basilika === 8 && bz.zurueck, JSON.stringify(bz));
  // Stadtmauer (Phase A): Ring schützt die Häuser, Tor ersetzt Straße, Gallier verschonen die Stadt
  const mu = await p.evaluate(() => {
    const sim = SR.sim, M = JSON.parse(JSON.stringify(SR.S)); M.ereignisseAus = true;
    const h = M.geb.filter(b => b.t === 'huette'), x0 = Math.min(...h.map(b => b.x)) - 2, x1 = Math.max(...h.map(b => b.x)) + 3, z0 = Math.min(...h.map(b => b.z)) - 2, z1 = Math.max(...h.map(b => b.z)) + 3;
    const vor = sim.mauerSchutz(M);
    let id = 90000; const ring = (x, z) => M.geb.push({ id: id++, t: 'mauer', x, z, w: 0, prio: false, stufe: 1, bew: 0, status: [] });
    for (let x = x0; x <= x1; x++) { ring(x, z0); ring(x, z1); } for (let z = z0 + 1; z < z1; z++) { ring(x0, z); ring(x1, z); }
    const nach = sim.mauerSchutz(M);
    const L = JSON.parse(JSON.stringify(M)); L.geb = L.geb.filter(b => !(b.t === 'mauer' && b.x === x0 && b.z === z0 + 3)); const loch = sim.mauerSchutz(L);
    const T = JSON.parse(JSON.stringify(SR.S)); T.gut.ziegel += 50; T.gut.holz += 20; const st = T.geb.find(b => b.t === 'strasse' && b.x === 30);
    const tor = sim.bauen(T, SR.welt, 'tor', st.x, st.z); const ersetzt = !T.geb.some(b => b.t === 'strasse' && b.x === st.x && b.z === st.z);
    const maske = sim.strassenMaske(T)[st.z * 64 + st.x] === 1;
    const G = JSON.parse(JSON.stringify(M)); G.monat = 40; G.gut.getreide = 100; G.gunst = 50; G.frieden = 0; G.land = {};
    sim.setzeZufall(z => z === 1002 ? 0 : 1); const mG = sim.monat(G, SR.welt).join(' | '); sim.setzeZufall(null);
    return { vor, nach, loch, tor: tor.ok, ersetzt, maske, haelt: /Stadtmauer hält/.test(mG), knopf: !!document.querySelector('.karte[data-t="mauer"]') || true };
  });
  ok('Stadtmauer: Ring schützt alle Häuser, Lücke nicht, Tor auf der Straße, Gallier verschonen die Stadt', mu.vor === 0 && mu.nach === 1 && mu.loch < 1 && mu.tor && mu.ersetzt && mu.maske && mu.haelt, JSON.stringify(mu));
  // Phase B: Geschichte als Prüfung – Vorwarnung, Belagerung nach Vorbereitung, Siedler, Spartacus, Via-Wahl, Präfekt, Kulisse
  const gs = await p.evaluate(() => {
    const sim = SR.sim, basis = () => { const G = JSON.parse(JSON.stringify(SR.S)); G.ereignisseAus = false; G.ereignis = null; G.gesch = {}; return G; };
    const mB = 220;   // Sommer 200 v. Chr.
    const W = basis(); W.monat = mB - 20; sim.monat(W, SR.welt); const warn = W.gesch.belagerung === 'gewarnt' && sim.geschichteKommend(W).monate > 0;
    const A = basis(); A.gesch = { belagerung: 'gewarnt' }; A.monat = mB; A.gut.getreide = 0; A.gut.brot = 0; A.ereignisLog = { cerealia: 1e9, ludi: 1e9, saturnalia: 1e9 };
    sim.monat(A, SR.welt); const schlecht = A.ereignis === 'g:belagerung' && /verwüstet|plündern/.test(A.gText);
    const B = basis(); B.gesch = { belagerung: 'gewarnt' }; B.monat = mB; B.gut.getreide = 2000; B.ereignisLog = { cerealia: 1e9, ludi: 1e9, saturnalia: 1e9 };
    const h = B.geb.filter(b => b.t === 'huette' || b.t === 'domus'); let id = 90000;
    const x0 = Math.min(...h.map(b => b.x)) - 2, x1 = Math.max(...h.map(b => b.x)) + 4, z0 = Math.min(...h.map(b => b.z)) - 2, z1 = Math.max(...h.map(b => b.z)) + 4;
    const ring = (x, z) => B.geb.push({ id: id++, t: 'mauer', x, z, w: 0, prio: false, stufe: 1, bew: 0, status: [] });
    for (let x = x0; x <= x1; x++) { ring(x, z0); ring(x, z1); } for (let z = z0 + 1; z < z1; z++) { ring(x0, z); ring(x1, z); }
    const hang = sim.regionKarte().find(f => f.typ === 'hang'); B.land[sim.landKey(hang)] = { verm: 2, betrieb: 'kastell' };
    const g0 = sim.gunst(B); sim.monat(B, SR.welt); const gut = /vergeblich/.test(B.gText) && sim.gunst(B) > g0;
    const V = basis(); V.gesch = { belagerung: 'fertig', siedler: 'fertig', via: 'gewarnt' }; V.monat = (-148 + 218) * 12 + 4; V.ereignisLog = { cerealia: 1e9, ludi: 1e9, saturnalia: 1e9 }; sim.monat(V, SR.welt);
    const via = V.ereignis === 'via'; V.gut.denare = 500; V.gut.ziegel = 100; sim.ereignisWaehlen(V, 0); const viaAn = V.via === true;
    const P = basis(); P.gunst = 0; P.monat = 30; sim.monat(P, SR.welt); const praef = P.praefekt > 0;
    const K = basis(); K.geschichte = 'kulisse'; K.gesch = { belagerung: 'gewarnt' }; K.monat = mB; const mk = sim.monat(K, SR.welt).join(' | '); const kulisse = !K.ereignis && /Im Jahr 200/.test(mk);
    return { warn, schlecht, gut, via, viaAn, praef, kulisse, gText: B.gText.slice(0, 60) };
  });
  ok('Geschichte: Vorwarnung, Belagerung nach Vorbereitung (gut/schlecht), Via Postumia', gs.warn && gs.schlecht && gs.gut && gs.via && gs.viaAn, JSON.stringify(gs));
  ok('Präfekt bei Gunst 0, Geschichte als Kulisse ohne Folgen', gs.praef && gs.kulisse);
  const bw = await p.evaluate(() => {
    const sim = SR.sim, B = JSON.parse(JSON.stringify(SR.S)); Object.assign(B.gut, { holz: 200, ziegel: 200, stein: 200, denare: 900 });
    const h = B.geb.find(b => b.t === 'huette'), v0 = sim.bodenwert(B, h);
    let g = false; for (let r = 2; r <= 6 && !g; r++) for (let dz = -r; dz <= r && !g; dz++) for (let dx = -r; dx <= r && !g; dx++) g = sim.bauen(B, SR.welt, 'garten', h.x + dx, h.z + dz).ok;
    const v1 = sim.bodenwert(B, h);
    let z = false; for (let r = 2; r <= 6 && !z; r++) for (let dz = -r; dz <= r && !z; dz++) for (let dx = -r; dx <= r && !z; dx++) z = sim.bauen(B, SR.welt, 'ziegelei', h.x + dx, h.z + dz).ok;
    const v2 = sim.bodenwert(B, h);
    let t = null; for (let r = 1; r <= 8 && !t; r++) for (let dz = -r; dz <= r && !t; dz++) for (let dx = -r; dx <= r && !t; dx++) { const q = sim.bauen(B, SR.welt, 'tabernae', h.x + dx, h.z + dz); if (q.ok) t = q.b; }
    t.w = 1; const nahe = B.geb.find(o => o.t === 'huette' && sim.abstand(o, t) <= 8); const laden = nahe ? sim.inReichweite(B, nahe, 'markt') : 'kein Haus';
    const ans = SR.ansicht('bodenwert'); SR.ansicht('');
    return { v0, v1, v2, g, z, laden, legende: ans.legende.length };
  });
  ok('Bodenwert: Garten hebt, Ziegelei senkt; Läden versorgen wie ein Markt; Ansicht Lage', bw.g && bw.v1 > bw.v0 && bw.z && bw.v2 < bw.v1 && bw.laden === true && bw.legende === 4, JSON.stringify(bw));
  const rv = await p.evaluate(() => {
    const sim = SR.sim, R = JSON.parse(JSON.stringify(SR.S)); R.ereignisseAus = true; R.ruf = undefined; R.rang = 1;
    const frueh = sim.rufWaehlen(R, 'kornkammer').grund || ''; R.rang = 2; const ruf = sim.rufWaehlen(R, 'kornkammer').ok, zweimal = sim.rufWaehlen(R, 'handel').grund || '';
    const bonus = sim.bonus(R, 'feld', 'getreide') > sim.bonus(JSON.parse(JSON.stringify(SR.S)), 'feld', 'getreide');
    const V = JSON.parse(JSON.stringify(SR.S)); V.ereignisseAus = true; V.vertraege = []; V.gut.holz = 200; V.geb = V.geb.filter(b => b.t !== 'holzfaeller'); V.land = Object.fromEntries(Object.entries(V.land).filter(([k, l]) => l.betrieb !== 'holzlager'));
    const vt = sim.vertragUmschalten(V, 'placentia', 'holz').ok, d0 = V.gut.denare, h0 = V.gut.holz; sim.monat(V, SR.welt);
    const geliefert = h0 - V.gut.holz >= 5;
    V.gut.holz = 0; for (let i = 0; i < 3; i++) { V.gut.holz = 0; sim.monat(V, SR.welt); } const gekuendigt = !V.vertraege.length;
    SR.forschung(); document.querySelector('[data-buch="chronik"]').click(); const buch = !document.querySelector('#chronik').hidden && document.querySelector('#forschung').hidden && document.querySelectorAll('#chronik .buchreiter button').length === 4;
    document.querySelector('#chronik [data-ch="zu"]').click();
    return { frueh, ruf, zweimal, bonus, vt, geliefert, gekuendigt, buch };
  });
  ok('Ruf der Stadt, Lieferverträge (Lieferung, Kündigung), Stadtbuch-Kapitel', /Kleinstadt/.test(rv.frueh) && rv.ruf && /steht schon/.test(rv.zweimal) && rv.bonus && rv.vt && rv.geliefert && rv.gekuendigt && rv.buch, JSON.stringify(rv));
  const sp = await p.evaluate(() => {
    const m0 = SR.S.monat, e0 = SR.S.geb.length;
    document.querySelector('#menue [data-m="staende"]').click();
    const plaetze = document.querySelectorAll('#staende .stand').length;
    document.querySelector('#staende [data-st="speichern"][data-n="2"]').click();
    const text = document.querySelectorAll('#staende .stand small')[1].textContent;
    const d0 = SR.S.gut.denare; SR.S.gut.denare = 12345; document.querySelector('#staende [data-st="laden"][data-n="2"]').click();
    const zurueck = SR.S.monat === m0 && SR.S.geb.length === e0 && SR.S.gut.denare === d0, zu = document.querySelector('#staende').hidden;
    return { plaetze, text, zurueck, zu };
  });
  const altStand = await p.evaluate(() => { const sim = SR.sim, A = JSON.parse(JSON.stringify(SR.S));
    delete A.stand; delete A.land; delete A.letzte; delete A.gut.wolle; A.geb[0].status = undefined; A.geb.push({ id: 99999, t: 'abgerissen', x: 0, z: 0 });
    const B = sim.aufbereiten(A); let lauf = true; try { sim.monat(B, SR.welt); } catch (e) { lauf = e.message; }
    return { ok: !!B, stand: B && B.stand, land: B && !!B.land, wolle: B && B.gut.wolle === 0, weg: B && !B.geb.some(b => b.t === 'abgerissen'), lauf, kaputt: sim.aufbereiten({ v: 1 }) === null }; });
  const zen = await p.evaluate(() => { const sim = SR.sim, B = JSON.parse(JSON.stringify(SR.S)); B.monat = 59; B.ereignisseAus = true; B.zensus = [];
    const m = sim.monat(B, SR.welt).join(' | '); const z = (B.zensus || [])[0];
    const S = SR.S; S.zensus = B.zensus; SR.zensus(); const seite = document.querySelectorAll('#chronik .fkarte.zensus').length, offen = !document.querySelector('#chronik').hidden;
    document.querySelector('#chronik [data-ch="zu"]').click(); SR.chronik(); const inChronik = /Zensus/.test(document.querySelector('#chronik').textContent); document.querySelector('#chronik [data-ch="zu"]').click();
    return { meld: /Zensus/.test(m), z: !!z && z.u.length === 3, seite, offen, inChronik, zu: document.querySelector('#chronik').hidden }; });
  ok('Zensus alle fünf Jahre: Bilanz mit drei Urteilen, Seite und Chronik', zen.meld && zen.z && zen.seite === 3 && zen.offen && zen.inChronik && zen.zu, JSON.stringify(zen));
  ok('Alter Spielstand wird ergänzt und läuft weiter', altStand.ok && altStand.stand >= 4 && altStand.land && altStand.wolle && altStand.weg && altStand.lauf === true && altStand.kaputt, JSON.stringify(altStand));
  ok('Spielstände: drei Plätze, speichern und laden', sp.plaetze === 3 && /Einwohner/.test(sp.text) && sp.zurueck && sp.zu, JSON.stringify(sp));
  const rgn = await p.evaluate(() => {
    const sim = SR.sim, wasser = w => w.typ.reduce((n, t) => n + (t === 2 ? 1 : 0), 0), wald = w => w.typ.reduce((n, t) => n + (t === 1 ? 1 : 0), 0);
    const po = { w: wasser(sim.erzeugeWelt('po')), wald: wald(sim.erzeugeWelt('po')) };
    const K = sim.neuesSpiel('kampanien'), k = { stadt: sim.stadtName(), jahr: K.jahr0, fisch: K.gut.fisch, partner: sim.PARTNER.placentia.n, w: wasser(sim.erzeugeWelt('kampanien')) };
    const A = sim.neuesSpiel('apulien'), a = { stadt: sim.stadtName(), weide: sim.regionKarte().filter(f => f.typ === 'weide').length, wald: wald(sim.erzeugeWelt('apulien')), duerre: sim.bonus(A, 'feld', 'getreide') < 1 };
    const E = sim.neuesSpiel('etrurien'), e = { stadt: sim.stadtName(), jahr: E.jahr0, stein: sim.regionKarte().filter(f => f.typ === 'stein').length, eigeneGeschichte: (() => { E.monat = 200; E.ereignisseAus = true; sim.monat(E, SR.welt); return E.gesch.rubikon === 'fertig' && E.gesch.perusia === 'gewarnt' && !('belagerung' in E.gesch) && /Krieg um Perusia/.test(document.querySelector('#ahnungZeile') ? sim.geschichteKommend(E).g.titel : ''); })() };
    sim.regionSetzen('kampanien'); const P = sim.neuesSpiel('kampanien'); P.ereignisseAus = true; P.gesch = { bacchanalien: 'fertig', kaufleute: 'fertig', spartacus_k: 'fertig', piraten: 'gewarnt' }; P.monat = (-68 + 194) * 12 + 4;
    const pm = sim.monat(P, SR.welt).join(' | '); e.piraten = /Seeräuber/.test(pm) && /Puteoli/.test(pm) && P.gesch.piraten === 'fertig';
    sim.regionSetzen('apulien'); const L = sim.neuesSpiel('apulien'); L.ereignisseAus = true; L.gesch = { samniten: 'fertig', pyrrhus: 'fertig', cannae: 'gewarnt' }; L.monat = (-216 + 314) * 12 + 4;
    const lm = sim.monat(L, SR.welt).join(' | '); e.cannae = /Flüchtlinge aus Cannae/.test(lm) && /Venusia/.test(lm);
    sim.regionSetzen('po'); const zurueck = sim.stadtName() === 'Cremona' && sim.PARTNER.placentia.n === 'Placentia';
    const poWeide = sim.regionKarte().filter(f => f.typ === 'weide').length, poStein = sim.regionKarte().filter(f => f.typ === 'stein').length;
    return { po, k, a, e, zurueck, poWeide, poStein };
  });
  const vorl = await p.evaluate(async () => { const D = await import('./js/daten.js'), sim = SR.sim, zehn = () => D.INSCHRIFTEN.find(i => i.id === 'zehn').n;
    sim.regionSetzen('apulien'); const lu = zehn(), ruf = D.RUF.kornkammer.n, rest = JSON.stringify([D.INSCHRIFTEN.map(i => [i.n, i.text]), D.EREIGNISSE.map(e => e.text), D.AUFTRAEGE.map(a => a.n), D.RUF]).match(/\{[a-zA-Z]+\}/g);
    sim.regionSetzen('po'); return { lu, ruf, po: zehn(), rest }; });
  ok('Texte nennen die gewählte Stadt (Platzhalter je Region)', vorl.lu === 'Zehn Jahre Luceria' && vorl.ruf === 'Kornkammer Apuliens' && vorl.po === 'Zehn Jahre Cremona' && !vorl.rest, JSON.stringify(vorl));
  ok('Regionen: Puteoli am Meer, Luceria trocken, Florentia mit Stein, eigene Zeitleisten je Region', rgn.k.stadt === 'Puteoli' && rgn.k.jahr === -194 && rgn.k.fisch === 30 && rgn.k.partner === 'Neapolis' && rgn.k.w > rgn.po.w && rgn.a.stadt === 'Luceria' && rgn.a.weide > rgn.poWeide && rgn.a.wald < rgn.po.wald && rgn.a.duerre && rgn.e.stadt === 'Florentia' && rgn.e.stein > rgn.poStein && rgn.e.eigeneGeschichte && rgn.e.piraten && rgn.e.cannae && rgn.zurueck, JSON.stringify(rgn));
  ok('Handelsfenster Placentia mit Knöpfen', handel.ui.titel === 'Placentia' && handel.ui.n === 2 * handel.pWaren && handel.ui.frei && handel.ui.klick, JSON.stringify(handel.ui));

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
  ok('Ansicht Stimmung zeigt Marktstraßen und Häuser', ans.stimmung.felder.length > 5 && ans.stimmung.geb.length >= 4, ans.stimmung.felder.length + ' Straßenfelder, ' + ans.stimmung.geb.length + ' Häuser');
  ok('Ansicht Arbeit färbt Betriebe', ans.arbeit.geb.length >= 8, ans.arbeit.geb.length + ' Gebäude');
  if (BILD) { await p.screenshot({ path: BILD.replace(/\.png$/, '_ansicht.png') }); }
  await p.evaluate(() => SR.ansicht(''));
  ok('Ansicht wieder aus', await p.evaluate(() => SR.szene.ansichtZahl() === 0 && document.querySelector('#legende').hidden));

  const stp = await p.evaluate(() => { const S = SR.S; S.gut.holz += 60; S.gut.ziegel += 30; if (!S.geb.some(b => b.t === 'speicher')) { const st = S.geb.find(b => b.t === 'strasse'); let ok = false; for (let r = 1; r < 12 && !ok; r++) for (let dz = -r; dz <= r && !ok; dz++) for (let dx = -r; dx <= r && !ok; dx++) ok = SR.bauen('speicher', st.x + dx, st.z + dz).ok; }
    const sp = S.geb.filter(b => b.t === 'speicher' && !(b.bau > 0)); S.gut.holz = Math.max(S.gut.holz, 120); S.gut.ziegel = Math.max(S.gut.ziegel, 60); SR.setzeStand(S);
    if (sp[0]) SR.szene.zentrieren(sp[0].x + 1.5, sp[0].z + 1); return { sp: sp.length, n: SR.szene.stapelZahl() }; });
  ok('Warenstapel vor den Speichern', stp.sp > 0 && stp.n >= stp.sp * 2 && stp.n <= stp.sp * 4, JSON.stringify(stp));
  if (BILD) { await p.evaluate(() => SR.szene.zoom(2.2)); await p.waitForTimeout(400); await p.screenshot({ path: BILD.replace(/\.png$/, '_lager.png') }); await p.evaluate(() => SR.szene.zoom(1 / 2.2)); }
  if (BILD) { await p.evaluate(() => SR.tempo(0)); await p.waitForTimeout(500); await p.screenshot({ path: BILD }); console.log('  Bild: ' + BILD); }
  const umg = await p.evaluate(() => { SR.monate(1); const u = SR.ton.umgebungStand(); return { ...u, js2: SR.sim.jahreszeit(SR.S), ein: SR.sim.einwohner(SR.S) }; });
  ok('Klangkulisse folgt Jahreszeit und Einwohnern (Werte, Klang selbst nicht gehört)', umg.js >= 0 && umg.js <= 3 && umg.einwohner > 0, JSON.stringify(umg));
  const kz = await p.evaluate(() => { const sim = SR.sim, K = JSON.parse(JSON.stringify(SR.S)); K.ereignisseAus = true; K.sofortBauen = false; K.epoche = 2;
    const F = sim.forschungS(K); const vor = sim.epocheFehlt(K);
    F.fertig = [...new Set([...F.fertig, 'weinbau', 'olivenpresse', 'weberei', 'garum', 'archiv'])]; K.gunst = 70;
    K.geb.push({ id: 90001, t: 'basilika', x: 50, z: 2, stufe: 1, bew: 0, w: 4, status: [], dreh: 0 });
    const w = sim.epocheWechseln(K); const pax = K.frieden >= 60;
    F.fertig.push('kaiserkult', 'amphitheater', 'beton', 'macellum'); Object.assign(K.gut, { stein: 900, ziegel: 900, holz: 900, denare: 3000 });
    let a = null; for (let z = 0; z <= 34 && !a; z++) for (let x = 0; x <= 56 && !a; x++) { const r = sim.bauen(K, SR.welt, 'amphitheater', x, z); if (r.ok) a = r.b; }
    const bau = a && a.bau;
    let m = null; for (let z = 0; z <= 34 && !m; z++) for (let x = 0; x <= 56 && !m; x++) { const r = sim.bauen(K, SR.welt, 'macellum', x, z); if (r.ok) m = r.b; }
    const sperre = sim.sperrGrund(SR.S, 'augusteum');
    return { vor: /Basilika/.test(vor), ok: w.ok, ep: K.epoche, pax, bau, macellum: !!m, sperre }; });
  ok('Kaiserzeit: Übergang mit Basilika, Erfindungen, Gunst; Pax; Amphitheater mit Beton schneller', kz.vor && kz.ok && kz.ep === 3 && kz.pax && kz.bau === 7 && kz.macellum && /Kaiserzeit|erforschen/.test(kz.sperre), JSON.stringify(kz));
  const aq = await p.evaluate(() => { const S = SR.S, F = SR.sim.forschungS(S), vor = SR.szene.aquaeduktDa(); const hatte = F.fertig.includes('aquaedukt');
    if (!hatte) F.fertig.push('aquaedukt'); SR.setzeStand(S); const da = SR.szene.aquaeduktDa(); if (!hatte) F.fertig.splice(F.fertig.indexOf('aquaedukt'), 1); SR.setzeStand(S);
    return { vor, da, weg: !SR.szene.aquaeduktDa(), brunnen: S.geb.some(b => b.t === 'brunnen') }; });
  ok('Aquädukt sichtbar, sobald erforscht', aq.brunnen && aq.da && aq.weg, JSON.stringify(aq));
  const kas = await p.evaluate(() => { SR.monate(1); document.querySelector('#waren [data-kasse]').click(); const t = document.querySelector('#info').innerText, offen = !document.querySelector('#info').hidden;
    document.querySelector('#info [data-a="zu"]').click(); return { offen, steuern: /Steuern der Bürger/.test(t), saldo: /Überschuss|Fehlbetrag/.test(t), zu: document.querySelector('#info').hidden, k: SR.S.kasse }; });
  ok('Stadtkasse: Denare antippen zeigt Einnahmen und Ausgaben', kas.offen && kas.steuern && kas.saldo && kas.zu && kas.k.steuern > 0, JSON.stringify(kas));
  const tit = await p.evaluate(() => { const sim = SR.sim, T = JSON.parse(JSON.stringify(SR.S)); T.ereignisseAus = true; const vor = sim.zielStand(T).filter(z => z[1]).length;
    T.rang = 4; T.epoche = 3; T.geb.push({ id: 90004, t: 'theater', x: 40, z: 30, stufe: 1, bew: 0, w: 4, status: [], dreh: 0 }, { id: 90005, t: 'thermen', x: 44, z: 30, stufe: 1, bew: 0, w: 3, status: [], dreh: 0 }); T.geb.forEach(h => { if (h.t === 'huette') h.bew = 60; });
    T.geb.push({ id: 90002, t: 'amphitheater', x: 50, z: 30, stufe: 1, bew: 0, w: 6, status: [], dreh: 0 });
    const m = sim.monat(T, SR.welt).join(' | '); const S = SR.S, alt = { t: S.titel, n: S.titelNeu };
    SR.titel(); const seite = /Splendidissima|SPLENDIDISSIMA/.test(document.querySelector('#chronik').innerText); document.querySelector('#chronik [data-ch="zu"]').click();
    return { vor, titel: !!T.titel, meld: /Ehrentitel/.test(m), seite, alle: sim.zielStand(T).every(z => z[1]) }; });
  ok('Großes Ziel: Ehrentitel „Splendidissima“ mit Festseite', tit.titel && tit.meld && tit.seite && tit.alle && tit.vor < 4, JSON.stringify(tit));
  const br = await p.evaluate(() => { const S = SR.S; S.gut.ziegel += 50; const h = S.geb.find(b => b.t === 'huette'); const texte = [];
    const beob = new MutationObserver(m => m.forEach(x => x.addedNodes.forEach(n => texte.push(n.textContent)))); beob.observe(document.querySelector('#meldung'), { childList: true });
    let fertig = false; for (let r = 1; r < 6 && !fertig; r++) for (const [dx, dz] of [[r, 0], [0, r], [-r, 0], [0, -r]]) { if (fertig) break; fertig = SR.bauenFeld('brunnen', h.x + dx, h.z + dz); }
    return new Promise(res => setTimeout(() => { beob.disconnect(); res(texte.filter(t => /Brunnen:/.test(t))); }, 50)); });
  ok('Brunnen bauen meldet, wie viele Häuser neu versorgt werden', br.length === 1 && /versorgt (kein neues Haus|\d+ Häuser? neu)/.test(br[0]), JSON.stringify(br));
  const see = await p.evaluate(() => { const sim = SR.sim, po = sim.pruefePlatz(SR.S, SR.welt, 'hafen', 10, 10);
    sim.regionSetzen('kampanien'); const K = sim.neuesSpiel('kampanien'), w = sim.erzeugeWelt('kampanien'); let trocken = '', nass = null;
    for (let z = 0; z < 38 && !nass; z++) for (let x = 0; x < 36 && !nass; x++) { const g = sim.pruefePlatz(K, w, 'hafen', x, z); if (/ans Wasser/.test(g)) trocken = g; else if (!g || /Straße/.test(g)) nass = [x, z, g]; }
    const zu = sim.handelOffen(K, 'alexandria'); K.geb.push({ id: 90003, t: 'hafen', x: 1, z: 1, stufe: 1, bew: 0, w: 4, status: [], dreh: 0 });
    const auf = sim.handelOffen(K, 'alexandria'), billig = sim.preis(K, 'getreide', 'alexandria') < sim.preis(K, 'getreide', 'placentia');
    const verkauf = sim.handeln(K, 'getreide', 'kauf', 'alexandria').ok;
    sim.regionSetzen('po'); return { po, trocken, nass, zu, auf, billig, verkauf }; });
  ok('Hafen nur in Puteoli und am Wasser, Seehandel mit Alexandria', /Puteoli/.test(see.po) && /ans Wasser/.test(see.trocken) && !!see.nass && !see.zu && see.auf && see.billig && see.verkauf, JSON.stringify(see));
  const reg2 = await p.evaluate(() => { const sim = SR.sim, po = sim.pruefePlatz(SR.S, SR.welt, 'toepferei', 10, 10);
    sim.regionSetzen('apulien'); const A = sim.neuesSpiel('apulien'), wolle = sim.bonus(A, 'schaeferei', 'wolle');
    sim.regionSetzen('etrurien'); const E = sim.neuesSpiel('etrurien'), et = sim.pruefePlatz(E, sim.erzeugeWelt('etrurien'), 'toepferei', 0, 0), preis = sim.preis(E, 'sigillata', 'mantua');
    const beton = sim.forschungsKosten(E, 'beton'); sim.regionSetzen('kampanien'); const K = sim.neuesSpiel('kampanien'), betonK = sim.forschungsKosten(K, 'beton');
    sim.regionSetzen('po'); return { po, wolle, et, preis, beton, betonK }; });
  ok('Regionen: Töpferei nur in Florentia, apulische Wolle +50 %, Beton in Puteoli halb so teuer', /Florentia/.test(reg2.po) && reg2.wolle >= 1.5 && !/Florentia/.test(reg2.et) && reg2.preis > 8 && reg2.betonK * 2 === reg2.beton, JSON.stringify(reg2));
  const leiste = await p.evaluate(() => { document.querySelector('#reiter [data-k="Öffentlich"]').click(); const k = document.querySelector('#karten'), c = document.querySelector('#karten .karte');
    const ta = getComputedStyle(c).touchAction, breit = k.scrollWidth > k.clientWidth; k.scrollLeft = 200; return { ta, breit, scroll: k.scrollLeft > 0 }; });
  ok('Bauleiste lässt sich waagerecht verschieben (iPad: Karten erlauben pan-x)', leiste.ta === 'pan-x' && leiste.breit && leiste.scroll, JSON.stringify(leiste));
  const wf = await p.evaluate(() => { SR.monate(1); const z = document.querySelector('#waren [data-ware="getreide"]'); z.click(); const t = document.querySelector('#info').innerText;
    const sprung = document.querySelector('#info [data-ziel]'); let offen = false; if (sprung) { sprung.click(); offen = !document.querySelector('#info').hidden && /Getreidefeld|Mühle|Gehöft/.test(document.querySelector('#info h2').textContent); }
    SR.oeffne(0); return { titel: /Getreide/.test(t), her: /Hergestellt in/.test(t), feld: /Getreidefeld/.test(t), weg: /Gebraucht von/.test(t), offen, delta: SR.S.delta && 'getreide' in SR.S.delta }; });
  ok('Warenfenster: Herkunft, Verbraucher, Sprung zum Betrieb, Bilanz', wf.titel && wf.her && wf.feld && wf.weg && wf.offen && wf.delta, JSON.stringify(wf));
  const av = await p.evaluate(() => { const sim = SR.sim, S = SR.S, B = JSON.parse(JSON.stringify(S)); B.ereignisseAus = true;
    const f = B.geb.find(b => b.t === 'holzfaeller' && b.w > 0); const id = f.id; f.soll = 1; sim.monat(B, SR.welt); const g1 = B.geb.find(b => b.id === id);
    const begrenzt = g1.w === 1; g1.soll = 0; sim.monat(B, SR.welt); const g2 = B.geb.find(b => b.id === id); const still = g2.w === 0 && g2.status.some(s => s.art === 'still');
    const echt = S.geb.find(b => b.t === 'holzfaeller'); SR.oeffne(echt.id); document.querySelector('#info [data-a="soll-"]').click(); const ui = echt.soll === SR.GEB.holzfaeller.arbeiter - 1 && /zugeteilt/.test(document.querySelector('#info').innerText);
    document.querySelector('#info [data-a="soll+"]').click(); const zurueck = echt.soll === undefined; SR.oeffne(0); return { begrenzt, still, ui, zurueck }; });
  ok('Arbeiter von Hand verteilen: begrenzen, stilllegen, − und + im Fenster', av.begrenzt && av.still && av.ui && av.zurueck, JSON.stringify(av));
  const lg = await p.evaluate(() => { const sim = SR.sim, L = JSON.parse(JSON.stringify(SR.S)); L.lagerFrei = false; L.ereignisseAus = true;
    L.geb = L.geb.filter(b => b.t !== 'speicher' && b.t !== 'zeltlager'); const h = L.geb.find(b => b.t === 'holzfaeller' && b.w > 0) || L.geb.find(b => b.t === 'holzfaeller');
    const holz0 = L.gut.holz; sim.monat(L, SR.welt); const hh = L.geb.find(b => b.id === h.id);
    const liegt = hh.halde > 0 && hh.status.some(s => s.art === 'lager'), kasseGleich = L.gut.holz <= holz0;
    L.geb.push({ id: 90010, t: 'speicher', x: h.x + 3, z: h.z, stufe: 1, bew: 0, w: 1, status: [], dreh: 0 }); L.gut.holz = 0;
    const st = L.geb.find(b => b.id === 90010); sim.monat(L, SR.welt); const hh2 = L.geb.find(b => b.id === h.id);
    // Kornspeicher: Getreidefeld liefert nur mit Kornspeicher (oder Zeltlager) in der Nähe; Speicher allein genügt nicht
    const K = JSON.parse(JSON.stringify(L)); K.kornImSpeicher = false; const f = K.geb.find(b => b.t === 'feld'); K.monat = 8;
    K.geb.push({ id: 90011, t: 'speicher', x: f.x + 3, z: f.z, stufe: 1, bew: 0, w: 1, status: [], dreh: 0 }); sim.monat(K, SR.welt);
    const ohneKorn = K.geb.find(b => b.id === f.id).status.some(s => s.art === 'lager' && /Kornspeicher/.test(s.text));
    return { liegt, kasseGleich, abgeholt: !(hh2.halde > 0) && L.gut.holz > 0, alt: !!sim.aufbereiten({ ...JSON.parse(JSON.stringify(SR.S)), stand: 2 }).lagerFrei, ohneKorn,
      typ: sim.lagerTyp(K, 'getreide') === 'horreum' && sim.lagerTyp(K, 'holz') === 'speicher' }; });
  ok('Lager als Orte: Speicher für Waren, Kornspeicher für Nahrung; ohne Lager stapelt sich die Ware am Betrieb', lg.liegt && lg.kasseGleich && lg.abgeholt && lg.alt && lg.ohneKorn && lg.typ, JSON.stringify(lg));
  const wi = await p.evaluate(() => { const sim = SR.sim, W = JSON.parse(JSON.stringify(SR.S)); W.ereignisseAus = true; W.monat = 9; W.gut.holz = 0; W.geb = W.geb.filter(b => b.t !== 'holzfaeller'); W.land = {};   // Wintermonat ohne Holz
    const st0 = W.stimmung; const m = sim.monat(W, SR.welt).join(' | '); const kalt = W.frieren && /frieren/.test(m) && W.stimmung < st0 + 1;
    const V = JSON.parse(JSON.stringify(SR.S)); V.ereignisseAus = true; V.monat = 9; V.gut.holz = 500; const h0 = V.gut.holz; sim.monat(V, SR.welt); const verbrannt = V.gut.holz < h0 && !V.frieren;
    const wv = sim.wintervorrat(SR.S); sim.regionSetzen('kampanien'); const mild = sim.brennholzBedarf(SR.S); sim.regionSetzen('po'); const po = sim.brennholzBedarf(SR.S);
    return { kalt, verbrannt, wv: wv.holzBrauch > 0 && wv.essenBrauch > 0, mild: mild < po }; });
  ok('Winter: Brennholz wird verbraucht, ohne Holz frieren die Menschen; Kampanien milder', wi.kalt && wi.verbrannt && wi.wv && wi.mild, JSON.stringify(wi));
  const fj = await p.evaluate(() => { const sim = SR.sim, F = JSON.parse(JSON.stringify(SR.S)); F.ereignisseAus = true; F.lagerFrei = true;
    const feld = F.geb.find(b => b.t === 'feld'), id = feld.id; F.monat = Math.ceil(F.monat / 12) * 12; const stand = [], korn = [];
    for (let i = 0; i < 12; i++) { const g0 = F.gut.getreide; sim.monat(F, SR.welt); const b = F.geb.find(x => x.id === id); stand.push(sim.feldStand(F, b)); korn.push(Math.round(F.gut.getreide - g0)); }
    const fb = F.geb.find(x => x.id === id).feld;
    // ohne Arbeiter im Herbst verdirbt die Ernte
    const V = JSON.parse(JSON.stringify(SR.S)); V.ereignisseAus = true; V.lagerFrei = true; V.monat = Math.ceil(V.monat / 12) * 12 + 6; V.geb.forEach(b => { if (b.t === 'feld') { b.feld = { gesaet: 1, geerntet: 0 }; b.soll = 0; } });
    const mv = []; for (let i = 0; i < 4; i++) mv.push(...sim.monat(V, SR.welt)); const verdorben = mv.some(t => /verdorben/.test(t));
    return { stand: stand.join(','), gesaet: fb.gesaet, verdorben, herbstPlus: korn.slice(6, 9).some(k => k > 5) }; });
  ok('Felder im Jahreslauf: säen, wachsen, ernten im Herbst; ungeerntet verdirbt', /gesaet/.test(fj.stand) && /gruen/.test(fj.stand) && /reif|stoppel/.test(fj.stand) && /brach/.test(fj.stand) && fj.gesaet > 0.9 && fj.herbstPlus && fj.verdorben, JSON.stringify(fj));
  const hf = await p.evaluate(() => { const sim = SR.sim, H = JSON.parse(JSON.stringify(SR.S)); H.ereignisseAus = true; H.monat = Math.ceil(H.monat / 12) * 12 + 4; H.gut.holz += 50;
    const h = H.geb.find(b => b.t === 'huette' && b.stufe !== 3 && b.bew > 2); const r = sim.hofBauen(H, h, 'garten'); const g0 = H.gut.getreide; const frei0 = (() => { const K = JSON.parse(JSON.stringify(H)); K.geb.find(b => b.id === h.id).hof = undefined; sim.monat(K, SR.welt); return K.letzte.arbeitslos; })();
    sim.monat(H, SR.welt); const frei1 = H.letzte.arbeitslos;
    const S = SR.S, echt = S.geb.find(b => b.t === 'huette' && b.stufe !== 3); S.gut.holz += 20; SR.oeffne(echt.id); const knopf = document.querySelector('#info [data-a="hof"][data-hof="huehner"]'); knopf.click();
    const ui = echt.hof === 'huehner' && /Hinterhof: Hühner/.test(document.querySelector('#info').innerText); SR.oeffne(0);
    return { ok: r.ok, bindet: frei1 <= frei0, laube: /Republik/.test(sim.hofBauen({ ...H, epoche: 1 }, h, 'laube').grund || ''), ui }; });
  ok('Hinterhof: Garten/Hühner/Weberei/Laube, bindet einen Arbeiter, Knopf im Hausfenster', hf.ok && hf.bindet && hf.laube && hf.ui, JSON.stringify(hf));
  const spl = await p.evaluate(() => { const sim = SR.sim, A = JSON.parse(JSON.stringify(SR.S)), B = JSON.parse(JSON.stringify(SR.S)); A.ereignisseAus = B.ereignisseAus = true; A.stimmung = B.stimmung = 50;
    for (const g of ['fisch', 'oel', 'wein']) { A.gut[g] = 0; B.gut[g] = 50; } sim.monat(A, SR.welt); sim.monat(B, SR.welt);
    const h = SR.S.geb.find(b => b.t === 'huette'); SR.oeffne(h.id); const ui = /Speiseplan/.test(document.querySelector('#info').innerText); SR.oeffne(0);
    return { mehr: B.stimmung > A.stimmung, ui, n: sim.speiseplan(SR.S).length }; });
  ok('Speiseplan: mehr verschiedene Speisen heben die Stimmung, Anzeige im Hausfenster', spl.mehr && spl.ui && spl.n === 5, JSON.stringify(spl));
  const ox = await p.evaluate(() => { const sim = SR.sim, mach = mitStall => { const F = JSON.parse(JSON.stringify(SR.S)); F.ereignisseAus = true; F.lagerFrei = true; F.monat = Math.ceil(F.monat / 12) * 12;
      const f = F.geb.find(b => b.t === 'feld'); F.geb.forEach(b => { if (b.t === 'feld') b.feld = { gesaet: 0, geerntet: 0 }; });
      if (mitStall) F.geb.push({ id: 90020, t: 'stall', x: f.x + 3, z: f.z, stufe: 1, bew: 0, w: 1, status: [], dreh: 0 }); F.gut.getreide = 200;
      sim.monat(F, SR.welt); return F.geb.find(b => b.id === f.id).feld.gesaet; };
    const ohne = mach(false), mit = mach(true); return { ohne, mit }; });
  ok('Ochsenstall: Felder in der Nähe werden schneller gepflügt', ox.mit > ox.ohne, JSON.stringify(ox));
  const tp = await p.evaluate(() => { const sim = SR.sim, mach = mit => { const T = JSON.parse(JSON.stringify(SR.S)); T.ereignisseAus = true; T.stimmung = 50; T.epoche = 2; T.gut.wein = 50;
      const h = T.geb.find(b => b.t === 'huette'); if (mit) T.geb.push({ id: 90030, t: 'thermopolium', x: h.x + 3, z: h.z, stufe: 1, bew: 0, w: 2, status: [], dreh: 0 });
      sim.monat(T, SR.welt); return { st: T.stimmung, wein: T.gut.wein }; };
    const ohne = mach(false), mit = mach(true); return { mehr: mit.st > ohne.st, trinkt: mit.wein < ohne.wein, sperre: sim.gesperrt(SR.S, 'thermopolium') === (sim.epoche(SR.S) < 2) }; });
  ok('Thermopolium: schenkt Wein aus, Nachbarschaft zufriedener, ab Später Republik', tp.mehr && tp.trinkt && tp.sperre, JSON.stringify(tp));
  ok('Keine Seiten-/Konsolenfehler', !errs.length, errs.slice(0, 4).join(' | '));
  console.log(`STAEDTE ${R.filter(Boolean).length}/${R.length}`);
  await b.close();
})();
