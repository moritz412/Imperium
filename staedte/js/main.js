// Städte Roms – Start, Eingabe (Touch/Maus), Oberfläche, Spielschleife, Speichern
import { GEB, CASA, WAREN, KATEGORIEN, MONAT_S, AUFTRAEGE, JAHRESZEITEN, ARBEIT_ANTEIL } from './daten.js';
import * as sim from './sim.js';
import { erzeugeSzene } from './szene.js';

const SPEICHER = 'staedte_roms.v1';
const $ = s => document.querySelector(s);
const welt = sim.erzeugeWelt();
let S = laden() || sim.neuesSpiel();
let tempo = 1, uhr = 0, auswahl = 0, bauTyp = '', reiter = 'Wohnen';
const szene = erzeugeSzene($('#welt'), welt);
szene.zentrieren(20, 20);
szene.jahreszeitFarbe(sim.jahreszeit(S));

// ---------- Speichern ----------
function laden() {
  try { const s = JSON.parse(localStorage.getItem(SPEICHER)); return s && s.v === 1 ? s : null; } catch (e) { return null; }
}
function speichern(still) {
  try { localStorage.setItem(SPEICHER, JSON.stringify(S)); if (!still) melden('Gespeichert.'); }
  catch (e) { if (!still) melden('Speichern nicht möglich.'); }
}

// ---------- Meldungen ----------
function melden(text) {
  const d = document.createElement('div'); d.textContent = text; $('#meldung').appendChild(d);
  setTimeout(() => d.remove(), 4600);
  while ($('#meldung').children.length > 3) $('#meldung').firstChild.remove();
}

// ---------- Kopfleiste ----------
const ANZEIGE = ['denare', 'holz', 'ziegel', 'lehm', 'getreide', 'mehl', 'brot'];
const rund = n => Math.floor(n).toLocaleString('de-DE');
function kopfleiste() {
  $('#datum').textContent = sim.datumText(S);
  const grenze = sim.lagerGrenze(S);
  const zellen = ANZEIGE.map(g => {
    const knapp = g !== 'denare' && S.gut[g] < 5 ? ' knapp' : '';
    const voll = WAREN[g].lager && S.gut[g] >= grenze ? ' (voll)' : '';
    return `<div class="ware${knapp}"><b>${rund(S.gut[g])}</b><small>${WAREN[g].n}${voll}</small></div>`;
  });
  const st = Math.round(S.stimmung);
  zellen.push(`<div class="ware"><b>${rund(sim.einwohner(S))}</b><small>Einwohner</small></div>`);
  zellen.push(`<div class="ware${st < 40 ? ' knapp' : ''}"><b>${st} %</b><small>Stimmung</small></div>`);
  $('#waren').innerHTML = zellen.join('');
  document.querySelectorAll('.tempo button').forEach(b => b.classList.toggle('an', +b.dataset.tempo === tempo));
  const a = AUFTRAEGE[S.auftrag];
  $('#auftragText').textContent = a ? a.n : 'Alle Aufträge erfüllt. Die Stadt wächst weiter – bald folgt die Region.';
  $('#auftrag').hidden = !!auswahl;
}

// ---------- Bauleiste ----------
function kostenText(k) { return Object.entries(k).map(([g, n]) => `${WAREN[g].n} ${n}`).join(' · ') || 'frei'; }
function bauleiste() {
  $('#reiter').innerHTML = KATEGORIEN.map(k => `<button role="tab" aria-selected="${k === reiter}" class="${k === reiter ? 'an' : ''}" data-k="${k}">${k}</button>`).join('');
  $('#karten').innerHTML = Object.entries(GEB).filter(([, d]) => d.kat === reiter).map(([t, d]) => {
    const [w] = d.g, hoch = d.flach ? 6 : Math.round(d.h * 26);
    return `<button class="karte${t === bauTyp ? ' an' : ''}${sim.kannBezahlen(S, d.kosten) ? '' : ' teuer'}" data-t="${t}" aria-pressed="${t === bauTyp}">
      <span class="bild" style="background:#3a3026"><i style="width:${10 + w * 8}px;height:${hoch}px;background:#${d.wand.toString(16).padStart(6, '0')};border-top:5px solid #${(d.dach || d.wand).toString(16).padStart(6, '0')}"></i></span>
      <b>${d.n}</b><small>${kostenText(d.kosten)}</small></button>`;
  }).join('');
}
$('#reiter').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { reiter = b.dataset.k; bauleiste(); } });

// Karte ziehen = bauen beim Loslassen; Karte antippen = Baumodus (mehrfach bauen per Antippen)
let zug = null;
$('#karten').addEventListener('pointerdown', e => {
  const k = e.target.closest('.karte'); if (!k) return;
  zug = { t: k.dataset.t, x0: e.clientX, y0: e.clientY, raus: false, id: e.pointerId };
});
window.addEventListener('pointermove', e => {
  if (!zug || e.pointerId !== zug.id) return;
  // Touch hält das Ereignis an der Karte fest – deshalb nach Lage statt nach Ziel-Element entscheiden
  const ueberLeiste = e.clientY >= $('#leiste').getBoundingClientRect().top;
  if (!zug.raus && Math.hypot(e.clientX - zug.x0, e.clientY - zug.y0) > 18 && !ueberLeiste) zug.raus = true;
  if (zug.raus) vorschauAn(zug.t, e.clientX, e.clientY);
});
window.addEventListener('pointerup', e => {
  if (!zug || e.pointerId !== zug.id) return;
  const z = zug; zug = null;
  if (z.raus) {
    const leiste = $('#leiste').getBoundingClientRect();
    if (e.clientY < leiste.top) bauenAn(z.t, e.clientX, e.clientY);
    if (!bauTyp) szene.vorschau('');
  } else {
    bauTyp = bauTyp === z.t ? '' : z.t; baumodus();
  }
});

function platzFuer(t, px, py) {
  const f = szene.feldAn(px, py); if (!f) return null;
  const [w, d] = GEB[t].g;
  return { x: Math.round(f.p.x + 20 - w / 2), z: Math.round(f.p.z + 20 - d / 2) };
}
function vorschauAn(t, px, py) {
  const p = platzFuer(t, px, py); if (!p) return;
  const ok = !sim.pruefePlatz(S, welt, t, p.x, p.z) && sim.kannBezahlen(S, GEB[t].kosten);
  szene.vorschau(t, p.x, p.z, ok);
}
function bauenAn(t, px, py) {
  const p = platzFuer(t, px, py); if (!p) return;
  const r = sim.bauen(S, welt, t, p.x, p.z);
  if (!r.ok) { melden(r.grund); return; }
  if (t === 'holzfaeller' && !sim.waldNah(welt, r.b)) melden('Achtung: Kein Wald in der Nähe dieses Holzfällers.');
  allesZeichnen();
}
function baumodus() {
  $('#baumodus').hidden = !bauTyp;
  if (bauTyp) { $('#baumodusText').textContent = bauTyp === 'strasse' ? 'Straße bauen: Felder antippen oder ziehen' : `${GEB[bauTyp].n} bauen: Feld antippen`; schliesseInfo(); }
  else szene.vorschau('');
  bauleiste();
}
$('#baumodusEnde').addEventListener('click', () => { bauTyp = ''; baumodus(); });

// ---------- Eingabe auf der Karte: wischen, Zwei-Finger-Zoom, antippen ----------
const finger = new Map();
let wisch = null, pinch = 0, bewegt = false;
const lw = $('#welt');
lw.addEventListener('pointerdown', e => {
  lw.setPointerCapture(e.pointerId);
  finger.set(e.pointerId, { x: e.clientX, y: e.clientY });
  bewegt = false;
  if (finger.size === 1) wisch = szene.bodenPunkt(e.clientX, e.clientY);
  // Straßen-Baumodus: mit einem Finger ziehen legt Straße statt die Karte zu verschieben
  malen = bauTyp === 'strasse' && finger.size === 1 ? new Set() : null;
  if (malen) strasseMalen(e.clientX, e.clientY);
  if (finger.size === 2) { const [a, b] = [...finger.values()]; pinch = Math.hypot(a.x - b.x, a.y - b.y); }
});
lw.addEventListener('pointermove', e => {
  if (!finger.has(e.pointerId)) { if (bauTyp && e.pointerType === 'mouse') vorschauAn(bauTyp, e.clientX, e.clientY); return; }
  const alt = finger.get(e.pointerId);
  if (Math.hypot(e.clientX - alt.x, e.clientY - alt.y) > 3) bewegt = true;
  finger.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (finger.size === 2) {
    const [a, b] = [...finger.values()], d = Math.hypot(a.x - b.x, a.y - b.y);
    if (pinch) szene.zoom(d / pinch); pinch = d; return;
  }
  if (finger.size === 1 && malen) { strasseMalen(e.clientX, e.clientY); return; }
  if (finger.size === 1 && bewegt && wisch) szene.verschieben(wisch, szene.bodenPunkt(e.clientX, e.clientY));
});
let malen = null;
function strasseMalen(px, py) {
  const p = platzFuer('strasse', px, py); if (!p) return;
  const k = p.x + ',' + p.z; if (malen.has(k)) return; malen.add(k);
  const r = sim.bauen(S, welt, 'strasse', p.x, p.z);
  if (r.ok) allesZeichnen(); else if (/fehlen/.test(r.grund)) melden(r.grund);
}
function fingerWeg(e) {
  const war = finger.has(e.pointerId); finger.delete(e.pointerId);
  if (finger.size < 2) pinch = 0;
  if (finger.size === 1) { const [a] = [...finger.values()]; wisch = szene.bodenPunkt(a.x, a.y); }
  if (malen && !finger.size) { malen = null; return; }
  if (!war || bewegt || finger.size) return;
  if (bauTyp) { bauenAn(bauTyp, e.clientX, e.clientY); return; }
  const id = szene.gebaeudeAn(e.clientX, e.clientY);
  if (id) oeffneInfo(id); else schliesseInfo();
}
lw.addEventListener('pointerup', fingerWeg);
lw.addEventListener('pointercancel', e => { finger.delete(e.pointerId); pinch = 0; });
lw.addEventListener('wheel', e => { e.preventDefault(); szene.zoom(e.deltaY < 0 ? 1.12 : 1 / 1.12); }, { passive: false });

// ---------- Gebäudefenster ----------
function oeffneInfo(id) { auswahl = id; infoZeichnen(); szene.abgleichen(S, auswahl); kopfleiste(); }
function schliesseInfo() { auswahl = 0; $('#info').hidden = true; szene.abgleichen(S, 0); kopfleiste(); }
function infoZeichnen() {
  const b = S.geb.find(x => x.id === auswahl);
  if (!b) { schliesseInfo(); return; }
  const d = GEB[b.t], casa = b.t === 'huette' && b.stufe === 2;
  const name = casa ? CASA.n : d.n;
  const schwer = b.status.find(s => !s.leicht), leicht = b.status.find(s => s.leicht && s.art !== 'winter');
  let html = `<button class="schliessen" data-a="zu" aria-label="Schließen"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
    <h2>${name}</h2><div class="unter">${d.kat}</div>`;
  if (schwer) html += `<div class="lage schlecht">${schwer.text}</div>`;
  else if (leicht) html += `<div class="lage warn">${leicht.text}</div>`;
  else if (d.arbeiter || b.t === 'huette') html += `<div class="lage gut">Läuft</div>`;
  html += `<p>${d.text}</p>`;
  if (d.erzeugt) {
    const glied = (g, selbst) => `<div class="glied${selbst ? ' selbst' : ''}"><b>${selbst ? name : WAREN[g].n}</b>${selbst ? '' : rund(S.gut[g]) + ' im Lager'}</div>`;
    html += `<div class="kette">${d.braucht ? Object.keys(d.braucht).map(g => glied(g)).join('') + '<span class="pfeil">→</span>' : ''}${glied('', true)}<span class="pfeil">→</span>${Object.keys(d.erzeugt).map(g => glied(g)).join('')}</div>`;
    const u = sim.ursache(S, b); if (u) html += `<div class="ursache"><b>Ursache:</b> ${u}</div>`;
  }
  if (d.arbeiter) {
    html += `<div class="zeile"><span>Arbeiter</span><b>${b.w} / ${d.arbeiter}</b></div>`;
    html += `<div class="zeile"><span>Häuser in Laufweite (${sim.EINZUG} Felder)</span><b>${b.einzug ?? '–'}</b></div>`;
    html += `<div class="zeile"><span>Freie Arbeitskräfte in der Stadt</span><b>${S.letzte.arbeitslos ?? 0}</b></div>`;
    html += `<button class="knopf${b.prio ? ' an' : ''}" data-a="prio" aria-pressed="${b.prio}">${b.prio ? 'Arbeiter gehen zuerst hierher' : 'Arbeiter zuerst hierher schicken'}</button>`;
  }
  if (b.t === 'huette') {
    const ja = v => v ? 'ja' : 'nein';
    const arbeiten = S.geb.reduce((s, o) => s + (o.von || []).filter(v => v[0] === b.id).reduce((t, v) => t + v[1], 0), 0);
    html += `<div class="zeile"><span>Bewohner</span><b>${b.bew} / ${sim.wohnraum(b)}</b></div>
      <div class="zeile"><span>Gehen zur Arbeit</span><b>${arbeiten}</b></div>
      <div class="zeile"><span>Brot</span><b>${ja(S.versorgt.brot)}</b></div>
      <div class="zeile"><span>Brunnen in der Nähe</span><b>${ja(sim.inReichweite(S, b, 'brunnen'))}</b></div>
      <div class="zeile"><span>Markt in der Nähe</span><b>${ja(sim.inReichweite(S, b, 'markt'))}</b></div>`;
    if (!casa) html += `<p>Aufstieg zur Casa (16 Bewohner): Haus voll, Brot, Brunnen und Markt in der Nähe, 10 Ziegel.</p>`;
  }
  if (d.reichweite) html += `<div class="zeile"><span>Reichweite${d.strassen ? ' über Straßen' : ''}</span><b>${d.reichweite} Felder</b></div>`;
  html += `<div style="flex:1"></div><button class="knopf weg" data-a="weg">Abreißen (Hälfte der Baustoffe zurück)</button>`;
  $('#info').innerHTML = html; $('#info').hidden = false;
}
$('#info').addEventListener('click', e => {
  const a = e.target.closest('[data-a]'); if (!a) return;
  const b = S.geb.find(x => x.id === auswahl); if (!b) return;
  if (a.dataset.a === 'zu') schliesseInfo();
  if (a.dataset.a === 'prio') { b.prio = !b.prio; infoZeichnen(); }
  if (a.dataset.a === 'weg') { sim.abreissen(S, b.id); schliesseInfo(); allesZeichnen(); }
});

// ---------- Tempo und Menü ----------
document.querySelector('.tempo').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { tempo = +b.dataset.tempo; kopfleiste(); } });
$('#menueKnopf').addEventListener('click', () => { $('#menue').hidden = false; });
$('#menue').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) { if (e.target.id === 'menue') $('#menue').hidden = true; return; }
  const m = b.dataset.m;
  if (m === 'weiter') $('#menue').hidden = true;
  if (m === 'speichern') { speichern(); $('#menue').hidden = true; }
  if (m === 'neu' && confirm('Neues Spiel beginnen? Der aktuelle Stand geht verloren.')) {
    S = sim.neuesSpiel(); auswahl = 0; bauTyp = ''; speichern(true); szene.jahreszeitFarbe(sim.jahreszeit(S)); allesZeichnen(); $('#menue').hidden = true;
  }
  if (m === 'hilfe') {
    b.closest('.menuespalte').querySelector('.klein').outerHTML = `<ol class="hilfe">
      <li>Gebäude aus der unteren Leiste aufs Feld ziehen – oder antippen und dann Felder antippen.</li>
      <li>Wischen verschiebt die Karte, zwei Finger zoomen.</li>
      <li>Ein Symbol über einem Gebäude zeigt ein Problem. Antippen zeigt die Ursache.</li>
      <li>Brot: Getreidefeld → Mühle → Bäckerei. Ziegel: Lehmgrube → Ziegelei.</li>
      <li>Im Herbst wird geerntet, im Winter wächst nichts – Vorräte anlegen.</li>
      <li>Jedes Gebäude braucht eine Straße vor der Tür. Straßen legt man durch Ziehen. Der Markt versorgt nur Häuser an seinen Straßen.</li>
      <li>Arbeiter gehen zu Fuß: Betriebe brauchen Häuser in höchstens 16 Feldern Entfernung.</li></ol>`;
  }
});

// ---------- Spielschleife ----------
function allesZeichnen() { szene.abgleichen(S, auswahl); kopfleiste(); bauleiste(); if (auswahl) infoZeichnen(); }
function monatAblaufen() {
  const js = sim.jahreszeit(S);
  sim.monat(S, welt).forEach(melden);
  if (sim.jahreszeit(S) !== js) { szene.jahreszeitFarbe(sim.jahreszeit(S)); speichern(true); }
  allesZeichnen();
}
let zuletzt = performance.now();
function schleife(jetzt) {
  const dt = Math.min(0.1, (jetzt - zuletzt) / 1000); zuletzt = jetzt;
  if (tempo && $('#menue').hidden) { uhr += dt * tempo; if (uhr >= MONAT_S) { uhr -= MONAT_S; monatAblaufen(); } }
  szene.zeichnen(dt, $('#menue').hidden ? tempo : 0);
  requestAnimationFrame(schleife);
}
allesZeichnen();
requestAnimationFrame(schleife);
if (!S.geb.length) melden('Willkommen in Cremona. Der Senat erwartet die ersten Hütten.');

// Für Tests und Fehlersuche
window.SR = {
  get S() { return S; }, welt, sim, GEB,
  bauen: (t, x, z) => { const r = sim.bauen(S, welt, t, x, z); allesZeichnen(); return r; },
  monate: n => { for (let i = 0; i < n; i++) monatAblaufen(); return S; },
  oeffne: id => oeffneInfo(id), neu: () => { S = sim.neuesSpiel(); allesZeichnen(); },
  tempo: t => { tempo = t; kopfleiste(); },
  modelle: () => szene.modelleBereit, szene,
};
