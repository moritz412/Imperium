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
