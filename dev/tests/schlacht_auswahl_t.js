// Prüft: Auswahl einer Karte öffnet KEIN Fenster; das i öffnet es; × schließt; Ton-Kontext läuft nach Tippen. Aufruf: node schlacht_auswahl_t.js [port]
const { chromium } = require('playwright');
const PORT = process.argv[2] || 8772;
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage({ viewport: { width: 1194, height: 834 } }); const fehler = [];
  p.on('pageerror', e => fehler.push(String(e))); p.on('console', m => { if (m.type() === 'error') fehler.push(m.text()); });
  await p.goto(`http://localhost:${PORT}/dev/proto/schlacht_spiel.html?g=niedrig`);
  await p.waitForFunction(() => window.SCHLACHT && SCHLACHT.phase === 'aufstellung', null, { timeout: 120000 });
  const karte = p.locator('.karte').first(); await karte.click({ position: { x: 80, y: 120 } }); await p.waitForTimeout(500);
  const nachAuswahl = await p.evaluate(() => getComputedStyle(document.getElementById('fenster')).display);
  await p.locator('.karte .info').first().click(); await p.waitForTimeout(500);
  const nachInfo = await p.evaluate(() => getComputedStyle(document.getElementById('fenster')).display);
  await p.screenshot({ path: 'shot/auswahl_info.png' });
  await p.locator('#fenster .x').click(); await p.waitForTimeout(500);
  const nachX = await p.evaluate(() => getComputedStyle(document.getElementById('fenster')).display);
  const ton = await p.evaluate(() => SCHLACHT.ton && { aktiv: SCHLACHT.ton.aktiv, kontext: SCHLACHT.ton.kontext });
  console.log(JSON.stringify({ nachAuswahl, nachInfo, nachX, ton }), 'Fehler:', fehler.length ? fehler.slice(0, 3) : 'keine');
  await b.close();
})().catch(e => { console.error('ABBRUCH', e.message); process.exit(1); });
