// Städte Roms – Start, Eingabe (Touch/Maus), Oberfläche, Spielschleife, Speichern
import { GEB, CASA, WAREN, KATEGORIEN, MONAT_S, AUFTRAEGE, JAHRESZEITEN, ARBEIT_ANTEIL, RAENGE, REGION_TYPEN, VERMESSEN, LAND_BETRIEBE, WEG, HANDEL } from './daten.js';
import * as sim from './sim.js';
import { erzeugeSzene } from './szene.js';
import { startseite } from './start.js';
import * as ton from './ton.js';

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
  try { const s = JSON.parse(localStorage.getItem(SPEICHER)); if (s) s.land = s.land || {}; return s && s.v === 1 ? s : null; } catch (e) { return null; }
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
const ANZEIGE = ['denare', 'holz', 'ziegel', 'lehm', 'getreide', 'mehl', 'brot', 'fisch'];
const rund = n => Math.floor(n || 0).toLocaleString('de-DE');
function kopfleiste() {
  const r = sim.rang(S), naechster = RAENGE[r + 1];
  $('#datum').textContent = `${RAENGE[r].n} · ${sim.datumText(S)}`;
  $('#datum').title = naechster ? `${naechster.n} ab ${naechster.ab} Einwohnern` : '';
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
  if (!r.ok) { melden(r.grund); ton.sfx('fehler'); return; }
  ton.sfx('bauen');
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
  if (r.ok) { allesZeichnen(); ton.sfx('strasse'); } else if (/fehlen/.test(r.grund)) melden(r.grund);
}
function fingerWeg(e) {
  const war = finger.has(e.pointerId); finger.delete(e.pointerId);
  if (finger.size < 2) pinch = 0;
  if (finger.size === 1) { const [a] = [...finger.values()]; wisch = szene.bodenPunkt(a.x, a.y); }
  if (malen && !finger.size) { malen = null; return; }
  if (!war || bewegt || finger.size) return;
  if (szene.modus() === 'region') { hexInfo(szene.hexAn(e.clientX, e.clientY)); return; }
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
  if (szene.modus() === 'region') {
    if (a.dataset.a === 'stadt') umland(false);
    else if (a.dataset.a === 'handel') {
      const r = sim.handeln(S, a.dataset.g, a.dataset.art);
      if (!r.ok) { melden(r.grund); ton.sfx('fehler'); } else ton.sfx('klick');
      allesZeichnen(); hexInfo(hexWahl);
    } else if (a.dataset.a === 'vermessen' || a.dataset.a === 'landbau' || a.dataset.a === 'weg') {
      const r = a.dataset.a === 'vermessen' ? sim.vermessen(S, hexWahl) : a.dataset.a === 'weg' ? sim.wegAnlegen(S, hexWahl) : sim.landBauen(S, hexWahl, a.dataset.t);
      if (!r.ok) { melden(r.grund); ton.sfx('fehler'); } else ton.sfx(a.dataset.a === 'landbau' ? 'bauen' : 'klick');
      allesZeichnen(); hexInfo(hexWahl);
    } else hexInfo(null);
    return;
  }
  const b = S.geb.find(x => x.id === auswahl); if (!b) return;
  if (a.dataset.a === 'zu') schliesseInfo();
  if (a.dataset.a === 'prio') { b.prio = !b.prio; infoZeichnen(); }
  if (a.dataset.a === 'weg') { sim.abreissen(S, b.id); ton.sfx('abreissen'); schliesseInfo(); allesZeichnen(); }
});

// ---------- Tempo und Menü ----------
document.querySelector('.tempo').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { tempo = +b.dataset.tempo; kopfleiste(); } });
$('#menueKnopf').addEventListener('click', () => { $('#menue').hidden = false; });
$('#menue').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) { if (e.target.id === 'menue') $('#menue').hidden = true; return; }
  const m = b.dataset.m;
  if (m === 'weiter') $('#menue').hidden = true;
  if (m === 'ton') { ton.schalten(); tonKnopf(); return; }
  if (m === 'speichern') { speichern(); $('#menue').hidden = true; }
  if (m === 'neu') { speichern(true); $('#menue').hidden = true; start.zeigen(); }
  if (m === 'hilfe') {
    b.closest('.menuespalte').querySelector('.klein').outerHTML = `<ol class="hilfe">
      <li>Gebäude aus der unteren Leiste aufs Feld ziehen – oder antippen und dann Felder antippen.</li>
      <li>Wischen verschiebt die Karte, zwei Finger zoomen.</li>
      <li>Ein Symbol über einem Gebäude zeigt ein Problem. Antippen zeigt die Ursache.</li>
      <li>Brot: Getreidefeld → Mühle → Bäckerei. Ziegel: Lehmgrube → Ziegelei.</li>
      <li>Im Herbst wird geerntet, im Winter wächst nichts – Vorräte anlegen.</li>
      <li>Jedes Gebäude braucht eine Straße vor der Tür. Straßen legt man durch Ziehen. Der Markt versorgt nur Häuser an seinen Straßen.</li>
      <li>Arbeiter gehen zu Fuß: Betriebe brauchen Häuser in höchstens 16 Feldern Entfernung.</li>
      <li>Umland: Felder vermessen, Betriebe bauen, Feldwege bis zur Stadt legen. Anleger am Padus verbinden per Boot.</li>
      <li>Placentia im Westen kauft und verkauft Waren, sobald ein Weg oder Anleger hinführt. Rom will jeden Herbst Abgaben.</li></ol>`;
  }
});

// ---------- Spielschleife ----------
function allesZeichnen() { szene.abgleichen(S, auswahl); szene.landAbgleichen(S); if (hexWahl && szene.modus() === 'region') hexInfo(hexWahl); ansichtZeichnen(); kopfleiste(); bauleiste(); if (auswahl) infoZeichnen(); }

// ---------- Umland (S2.1) ----------
function umland(an) {
  bauTyp = ''; baumodus(); schliesseInfo(); ansicht = ''; ansichtZeichnen();
  szene.zeigeModus(an ? 'region' : 'stadt');
  document.body.classList.toggle('umland', an);
  const k = $('#ansicht [data-umland]'); k.classList.toggle('an', an); k.setAttribute('aria-pressed', an);
  k.querySelector('small').textContent = an ? 'Stadt' : 'Umland';
  if (an) melden('Das Umland von Cremona. Tippe ein Feld an.');
}
let hexWahl = null;
function hexInfo(f) {
  hexWahl = f;
  if (!f) { $('#info').hidden = true; return; }
  if (f.typ === 'nachbar') { handelInfo(); return; }
  const d = REGION_TYPEN[f.typ], weit = sim.hexAbstand(f, { q: 0, r: 0 }), stand = sim.landStand(S, f);
  const l = (S.land || {})[sim.landKey(f)], bt = (l && l.betrieb) || sim.betriebFuer(f), bd = LAND_BETRIEBE[bt];
  const pro = bd ? Object.entries(bd.erzeugt).map(([g, n]) => `${(n * sim.landFaktor(f)).toFixed(1).replace('.', ',')} ${WAREN[g].n}`).join(', ') : '';
  let lage = '';
  if (stand === 'frei') lage = sim.kannVermessen(S, f)
    ? `<button class="knopf haupt" data-a="vermessen">Vermessen lassen (${kostenText(VERMESSEN.kosten)}, ${VERMESSEN.monate} Monate)</button>`
    : '<div class="lage warn">Noch zu weit draußen – erst das Land daneben vermessen.</div>';
  if (stand === 'vermessung') lage = `<div class="lage warn">Die Landvermesser sind bei der Arbeit (${l.verm} von ${VERMESSEN.monate} Monaten).</div>`;
  if (stand === 'vermessen') lage = bd
    ? '<div class="lage gut">Vermessen</div>' + sim.betriebeFuer(f).map((t, i) => { const b = LAND_BETRIEBE[t];
        const e = Object.entries(b.erzeugt).map(([g, n]) => `${(n * sim.landFaktor(f)).toFixed(1).replace('.', ',')} ${WAREN[g].n}`).join(', ');
        return `<p>${b.text}</p>${e ? `<div class="zeile"><span>Ertrag im Monat</span><b>${e}${b.ernte ? ' (Sommer)' : ''}</b></div>` : ''}
        <button class="knopf${i ? '' : ' haupt'}" data-a="landbau" data-t="${t}">${b.n} bauen (${kostenText(b.kosten)})</button>`; }).join('')
    : '<div class="lage gut">Vermessen</div><p>Für dieses Land gibt es noch keinen Betrieb.</p>';
  const verb = sim.verbunden(S, f);
  if (stand === 'betrieb' && bt === 'anleger') lage = `<div class="lage ${verb ? 'gut' : 'warn'}">Anleger ${verb ? 'mit der Stadt verbunden' : 'noch ohne Verbindung'}</div><p>${bd.text}</p>`;
  else if (stand === 'betrieb') lage = verb
    ? `<div class="lage gut">${bd.n} arbeitet</div><div class="zeile"><span>Ertrag im Monat</span><b>${pro}${bd.ernte ? ' (Sommer)' : ''}</b></div>`
    : `<div class="lage schlecht">${bd.n} arbeitet, aber kein Weg zur Stadt</div><p>Ohne Weg kommt nichts in der Stadt an. Lege Feldwege bis zur Stadt an.</p>`;
  if ((stand === 'vermessen' || stand === 'betrieb') && !sim.hatWeg(S, f))
    lage += `<button class="knopf${stand === 'betrieb' ? ' haupt' : ''}" data-a="weg">Feldweg anlegen (${kostenText(WEG.kosten)})</button>`;
  else if (sim.hatWeg(S, f)) lage += `<div class="zeile"><span>Feldweg</span><b>${verb ? 'mit der Stadt verbunden' : 'noch nicht bis zur Stadt'}</b></div>`;
  $('#info').innerHTML = `<button class="schliessen" data-a="zu" aria-label="Schließen"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
    <h2>${d.n}</h2><div class="unter">${weit ? weit + (weit === 1 ? ' Feld' : ' Felder') + ' von der Stadt' : 'Stadtgebiet'}</div>
    <p>${d.text}</p>
    ${d.nutzen ? `<div class="zeile"><span>Nutzen</span><b>${d.nutzen}</b></div>${lage}` : romInfo() + '<button class="knopf haupt" data-a="stadt">Zur Stadt</button>'}`;
  $('#info').hidden = false;
}

// ---------- Nachbarstadt und Rom (S2.5) ----------
const zahl = n => (Math.round(n * 10) / 10).toLocaleString('de-DE');
function romInfo() {
  const gu = Math.round(sim.gunst(S)), wort = gu >= 70 ? 'wohlgesonnen' : gu >= 40 ? 'abwartend' : 'verärgert';
  return `<div class="zeile"><span>Gunst Roms</span><b>${gu} von 100 (${wort})</b></div>
    <div class="zeile"><span>Abgabe am Ende des Herbstes</span><b>${sim.abgabeBetrag(S)} Denare${S.monat < 12 ? ' (ab dem 2. Jahr)' : ''}</b></div>
    <p>Wer pünktlich zahlt, gewinnt die Gunst des Senats – dann fällt auch der Lohn für Aufträge höher aus (jetzt ${Math.round(sim.lohnFaktor(S) * 100)} %).</p>`;
}
function handelInfo() {
  const offen = sim.handelOffen(S), d = REGION_TYPEN.nachbar, n = HANDEL.menge;
  const zeilen = Object.keys(HANDEL.waren).map(g => {
    const p = sim.preis(S, g), rel = p / HANDEL.waren[g].basis, wort = rel < 0.8 ? 'billig' : rel > 1.25 ? 'teuer' : 'üblich';
    return `<div class="handel"><div><b>${WAREN[g].n}</b><small>${rund(S.gut[g])} im Lager · Placentia: ${zahl(p)} je Stück, ${wort}</small></div>
      <button class="knopf" data-a="handel" data-art="verkauf" data-g="${g}"${offen ? '' : ' disabled'}>${n} verkaufen<small>+${sim.handelSumme(S, g, 'verkauf')} Denare</small></button>
      <button class="knopf" data-a="handel" data-art="kauf" data-g="${g}"${offen ? '' : ' disabled'}>${n} kaufen<small>−${sim.handelSumme(S, g, 'kauf')} Denare</small></button></div>`;
  }).join('');
  $('#info').innerHTML = `<button class="schliessen" data-a="zu" aria-label="Schließen"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
    <h2>${d.n}</h2><div class="unter">Nachbarstadt am Padus · Handel</div><p>${d.text}</p>
    ${offen ? '<div class="lage gut">Händler fahren zwischen Cremona und Placentia</div>'
      : '<div class="lage warn">Noch kein Weg nach Placentia</div><p>Lege Feldwege bis an Placentia heran oder baue einen Anleger am Padus – dann fahren die Boote flussaufwärts.</p>'}
    <p>Was du verkaufst, wird in Placentia billiger; was du kaufst, teurer. Mit der Zeit gleichen sich die Preise wieder aus.</p>
    ${zeilen}`;
  $('#info').hidden = false;
}

// ---------- Ansichten (S1.4) ----------
let ansicht = '';
const ANSICHT_NAME = { wasser: 'Wasser', stimmung: 'Stimmung: Versorgung', arbeit: 'Arbeit' };
function ansichtZeichnen() {
  const d = ansicht ? sim.ansicht(S, welt, ansicht) : null;
  szene.ansicht(d);
  document.querySelectorAll('#ansicht button').forEach(b => { const an = b.dataset.ansicht === ansicht; b.classList.toggle('an', an); b.setAttribute('aria-pressed', an); });
  $('#legende').hidden = !d;
  if (d) $('#legende').innerHTML = `<b>${ANSICHT_NAME[ansicht]}</b>` + d.legende.map(([c, t]) => `<span><i style="background:#${c.toString(16).padStart(6, '0')}"></i>${t}</span>`).join('');
}
$('#ansicht').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.hasAttribute('data-umland')) { umland(szene.modus() !== 'region'); return; }
  ansicht = ansicht === b.dataset.ansicht ? '' : b.dataset.ansicht; ansichtZeichnen();
});
function monatAblaufen() {
  const js = sim.jahreszeit(S);
  const meld = sim.monat(S, welt); meld.forEach(melden);
  if (meld.some(m => /Casa|ist jetzt/.test(m))) ton.sfx('aufstieg');
  if (sim.jahreszeit(S) !== js) { szene.jahreszeitFarbe(sim.jahreszeit(S)); speichern(true); ton.sfx('jahreszeit', sim.jahreszeit(S)); }
  allesZeichnen();
}
let zuletzt = performance.now();
function schleife(jetzt) {
  const dt = Math.min(0.1, (jetzt - zuletzt) / 1000); zuletzt = jetzt;
  if (tempo && $('#menue').hidden && $('#startseite').hidden) { uhr += dt * tempo; if (uhr >= MONAT_S) { uhr -= MONAT_S; monatAblaufen(); } }
  szene.zeichnen(dt, $('#menue').hidden && $('#startseite').hidden ? tempo : 0);
  requestAnimationFrame(schleife);
}
const tonKnopf = () => { $('#menue [data-m="ton"]').textContent = ton.istAn() ? 'Ton: an' : 'Ton: aus'; };
tonKnopf();

// ---------- Startseite (S1.5) ----------
const willkommen = () => melden('Willkommen in Cremona. Der Senat erwartet die ersten Hütten an der Landstraße.');
const start = startseite({
  hatStand: () => { try { return !!localStorage.getItem(SPEICHER); } catch (e) { return false; } },
  weiter: () => {},
  gruenden: r => {
    if (szene.modus() === 'region') umland(false);
    S = sim.neuesSpiel(); S.region = r.id; auswahl = 0; bauTyp = ''; uhr = 0;
    speichern(true); szene.jahreszeitFarbe(sim.jahreszeit(S)); szene.zentrieren(20, 20); allesZeichnen(); willkommen();
  },
});

allesZeichnen();
requestAnimationFrame(schleife);
start.zeigen();

// Für Tests und Fehlersuche
window.SR = {
  get S() { return S; }, welt, sim, GEB,
  bauen: (t, x, z) => { const r = sim.bauen(S, welt, t, x, z); allesZeichnen(); return r; },
  monate: n => { for (let i = 0; i < n; i++) monatAblaufen(); return S; },
  oeffne: id => oeffneInfo(id), neu: () => { S = sim.neuesSpiel(); allesZeichnen(); },
  tempo: t => { tempo = t; kopfleiste(); },
  modelle: () => szene.modelleBereit, szene, start, ton, umland, hexInfo: f => hexInfo(f),
  handeln: (g, art) => { const r = sim.handeln(S, g, art); allesZeichnen(); return r; },
  ansicht: a => { ansicht = a; ansichtZeichnen(); return sim.ansicht(S, welt, a); },
};
