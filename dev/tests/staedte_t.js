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
    return { pWaren: Object.keys(sim.PARTNER.placentia.waren).length, zu, zuGrund, offen, v: v.ok, plus, billiger: p1 < p0, k: k.ok, mehrZiegel: zi1 - zi0, teurer: z1 > z0, erholt: rueck > p1,
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
    const fertig = sim.hat(S, 'fruchtwechsel'), bonus = sim.bonus(S, 'feld', 'getreide');
    F.fertig.push('schreine', 'landvermessung', 'bauhuette', 'villa');
    const schreinNach = SR.bauen('schrein', 30, 13).ok || SR.bauen('schrein', 31, 13).ok || SR.bauen('schrein', 32, 13).ok;
    const verm = sim.vermMonate(S), holzK = sim.baukosten(S, 'markt').holz;
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
  ok('Forschung: Ziel, Schule bringt Wissen, Fruchtwechsel wirkt', /erforschen/.test(fo.schreinVor) && /Fruchtwechsel/.test(fo.villaVor) && /Republik/.test(fo.ep2) && fo.schule && fo.wahl && fo.w1 > fo.w0 && fo.fertig && fo.bonus === 1.25, JSON.stringify(fo));
  ok('Erfindungen: Schrein, Landvermessung, Bauhütte, Villa rustica', fo.schreinNach && fo.verm === 1 && fo.holzK === 28 && fo.villa === true);
  ok('Forschungsseite: 20 Karten, Ziel per Antippen, Anzeige im Auftrag', fo.offen && fo.karten === 20 && fo.ziel === 'ziegelbrand' && /Ziegelbrand/.test(fo.zeile) && fo.zu);
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
    return { k1, k2, voll, bei, nurErlaubt, hunger, frei, furcht, ins, kopf: document.querySelector('#waren').textContent.includes('Sklaven') };
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
    sim.setzeZufall(nur()); sim.monat(U, SR.welt); sim.setzeZufall(salz => salz >= 7000 ? 0 : 1); sim.monat(U, SR.welt);
    const ueber = U.geb.filter(b => b.brand > 0 && b.id !== ziel.id).length;
    // mit Feuerwache: wird gelöscht
    const W = kopie(); W.monat = 26; W.gut.holz += 60; W.gut.ziegel += 40;
    let wache = null;
    for (let r = 2; r <= 9 && !wache; r++) for (let dz = -r; dz <= r && !wache; dz++) for (let dx = -r; dx <= r && !wache; dx++) { const t = sim.bauen(W, SR.welt, 'wache', ziel.x + dx, ziel.z + dz); if (t.ok) wache = t.b; }
    if (wache) wache.prio = true;
    sim.setzeZufall(nur()); sim.monat(W, SR.welt); sim.setzeZufall(() => 1);
    const wz = W.geb.find(b => b.id === ziel.id), vorW = wz.brand, nah = sim.wacheNah(W, wz), m2 = sim.monat(W, SR.welt).join(' | ');
    sim.setzeZufall(null);
    const ins = { t: 'huette', stufe: 3, x: ziel.x, z: ziel.z, id: -1 }, hut = { t: 'huette', stufe: 1, x: ziel.x, z: ziel.z, id: -2 };
    const art = SR.ansicht('feuer'); SR.ansicht('');
    return { m1: /Feuer/.test(m1), brennt, weg, ueber, wache: !!wache, vorW, nah, geloescht: wz.brand === 0 && /gelöscht/.test(m2),
      insulaGefaehrlicher: sim.brandGefahr(S, ins) > sim.brandGefahr(S, hut), legende: art && art.legende.length, knopf: !!document.querySelector('#ansicht [data-ansicht="feuer"]') };
  });
  ok('Feuer: Brand bricht aus, greift über, brennt ab', fe.m1 && fe.brennt && fe.weg && fe.ueber > 0, JSON.stringify(fe));
  ok('Feuerwache löscht den Brand', fe.wache && fe.vorW === 1 && fe.nah && fe.geloescht);
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
  ok('Fenster Mantua und Insubrer-Dorf', r4.ui.titel === 'Mantua' && r4.ui.knoepfe === 2 * Object.keys(r4.mWaren).length && r4.ui.geschenk, JSON.stringify(r4.ui));
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

  if (BILD) { await p.evaluate(() => SR.tempo(0)); await p.waitForTimeout(500); await p.screenshot({ path: BILD }); console.log('  Bild: ' + BILD); }
  ok('Keine Seiten-/Konsolenfehler', !errs.length, errs.slice(0, 4).join(' | '));
  console.log(`STAEDTE ${R.filter(Boolean).length}/${R.length}`);
  await b.close();
})();
