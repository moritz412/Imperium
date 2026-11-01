// Städte Roms – Start, Eingabe (Touch/Maus), Oberfläche, Spielschleife, Speichern
import { RASTER, TIEFE, ERWEITERUNG, GEB, CASA, INSULA, SKLAVEN, WAREN, KATEGORIEN, MONAT_S, AUFTRAEGE, JAHRESZEITEN, ARBEIT_ANTEIL, RAENGE, REGION_TYPEN, LAND_BETRIEBE, WEG, HANDEL, SCHUTZ, GEFAHR, FORSCHUNG, ZWEIGE, EPOCHEN, EPOCHE2, AEMTER, RIVALEN, FAMILIE, KLIENTEN, AUSBILDUNG } from './daten.js';
import * as sim from './sim.js';
import { erzeugeSzene } from './szene.js';
import { startseite } from './start.js';
import * as ton from './ton.js';

const SPEICHER = 'staedte_roms.v1';
const $ = s => document.querySelector(s);
const welt = sim.erzeugeWelt();
let S = laden() || sim.neuesSpiel();
let tempo = 1, uhr = 0, auswahl = 0, bauTyp = '', reiter = 'Wohnen', entfernen = false;
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
const ANZEIGE = ['denare', 'holz', 'ziegel', 'lehm', 'getreide', 'mehl', 'brot', 'fisch', 'stein', 'erz', 'werkzeug', 'trauben', 'wein', 'oliven', 'oel', 'wolle', 'tuch', 'garum'];
const NUR_WENN_DA = new Set(['stein', 'erz', 'werkzeug', 'trauben', 'wein', 'oliven', 'oel', 'wolle', 'tuch', 'garum']);   // erscheinen erst, wenn vorhanden
const rund = n => Math.floor(n || 0).toLocaleString('de-DE');
function kopfleiste() {
  const r = sim.rang(S), naechster = RAENGE[r + 1];
  $('#datum').textContent = `${RAENGE[r].n} · ${sim.datumText(S)}`;
  $('#datum').title = naechster ? `${naechster.n} ab ${naechster.ab} Einwohnern` : '';
  const grenze = sim.lagerGrenze(S);
  const zellen = ANZEIGE.filter(g => !NUR_WENN_DA.has(g) || S.gut[g] >= 1).map(g => {
    const knapp = g !== 'denare' && S.gut[g] < 5 ? ' knapp' : '';
    const voll = WAREN[g].lager && S.gut[g] >= grenze ? ' (voll)' : '';
    const titel = g === 'denare' ? ` title="Unterhalt ${sim.unterhaltSumme(S)} Denare im Monat"` : '';
    return `<div class="ware${knapp}"${titel}><b>${rund(S.gut[g])}</b><small>${WAREN[g].n}${voll}</small></div>`;
  });
  const st = Math.round(S.stimmung);
  zellen.push(`<div class="ware"><b>${rund(sim.einwohner(S))}</b><small>Einwohner</small></div>`);
  const skl = sim.sklaven(S); if (skl) zellen.push(`<div class="ware"><b>${rund(skl)}</b><small>Sklaven</small></div>`);
  zellen.push(`<div class="ware${st < 40 ? ' knapp' : ''}"><b>${st} %</b><small>Stimmung</small></div>`);
  $('#waren').innerHTML = zellen.join('');
  document.querySelectorAll('.tempo button').forEach(b => b.classList.toggle('an', +b.dataset.tempo === tempo));
  const a = AUFTRAEGE[S.auftrag];
  $('#auftragText').textContent = a ? a.n : 'Alle Aufträge erfüllt. Die Stadt wächst weiter – bald folgt die Region.';
  $('#auftrag').hidden = !!auswahl || !$('#info').hidden;
  const F = sim.forschungS(S), fz = FORSCHUNG[F.ziel];
  const Fa = sim.familieS(S);
  $('#familieZeile').textContent = `Familie der ${Fa.name} · ${AEMTER[Fa.amt].n} · Ansehen ${Math.round(Fa.ansehen)} · Vermögen ${rund(Fa.vermoegen)}`;
  $('#forschZeile').textContent = fz ? `Forschung: ${fz.n} (${Math.min(99, Math.floor(F.wissen / fz.kosten * 100))} %)` : 'Forschung: kein Ziel gewählt';
}

// ---------- Bauleiste ----------
function kostenText(k) { return Object.entries(k).map(([g, n]) => `${WAREN[g].n} ${n}`).join(' · ') || 'frei'; }
function bauleiste() {
  $('#reiter').innerHTML = KATEGORIEN.map(k => `<button role="tab" aria-selected="${k === reiter}" class="${k === reiter ? 'an' : ''}" data-k="${k}">${k}</button>`).join('');
  $('#karten').innerHTML = Object.entries(GEB).filter(([, d]) => d.kat === reiter).map(([t, d]) => {
    const [w] = d.g, hoch = d.flach ? 6 : Math.round(d.h * 26), k = sim.baukosten(S, t), zu = sim.gesperrt(S, t);
    return `<button class="karte${t === bauTyp ? ' an' : ''}${sim.kannBezahlen(S, k) ? '' : ' teuer'}${zu ? ' gesperrt' : ''}" data-t="${t}" aria-pressed="${t === bauTyp}">
      <span class="bild" style="background:#3a3026"><i style="width:${10 + w * 8}px;height:${hoch}px;background:#${d.wand.toString(16).padStart(6, '0')};border-top:5px solid #${(d.dach || d.wand).toString(16).padStart(6, '0')}"></i></span>
      <b>${d.n}</b><small>${zu ? (d.epoche > sim.epoche(S) ? 'Späte Republik' : 'Erforschen: ' + FORSCHUNG[d.forschung].n) : kostenText(k)}</small></button>`;
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
  } else if (sim.gesperrt(S, z.t)) {
    melden(sim.sperrGrund(S, z.t)); ton.sfx('fehler');
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
  const ok = !sim.pruefePlatz(S, welt, t, p.x, p.z) && sim.kannBezahlen(S, sim.baukosten(S, t));
  szene.vorschau(t, p.x, p.z, ok, sim.frontSeite(S, t, p.x, p.z));
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
  if (bauTyp !== 'strasse') entfernen = false;
  const wk = $('#baumodusWeg'); wk.hidden = bauTyp !== 'strasse'; wk.classList.toggle('an', entfernen); wk.setAttribute('aria-pressed', entfernen);
  if (bauTyp) { $('#baumodusText').textContent = bauTyp === 'strasse' ? (entfernen ? 'Straße entfernen: Felder antippen oder ziehen' : 'Straße bauen: Felder antippen oder ziehen') : `${GEB[bauTyp].n} bauen: Feld antippen`; schliesseInfo(); }
  else szene.vorschau('');
  bauleiste();
}
$('#baumodusEnde').addEventListener('click', () => { bauTyp = ''; baumodus(); });
$('#baumodusWeg').addEventListener('click', () => { entfernen = !entfernen; baumodus(); szene.vorschau(''); });

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
  if (!finger.has(e.pointerId)) { if (bauTyp && !entfernen && e.pointerType === 'mouse') vorschauAn(bauTyp, e.clientX, e.clientY); return; }
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
  if (entfernen) {   // Straßen korrigieren: vorhandene Straße auf dem Feld abreißen
    const st = S.geb.find(b => b.t === 'strasse' && b.x === p.x && b.z === p.z);
    if (st) { sim.abreissen(S, st.id); allesZeichnen(); ton.sfx('abreissen'); }
    return;
  }
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
  if (id) { oeffneInfo(id); return; }
  const f = szene.feldAn(e.clientX, e.clientY);
  if (f && f.x >= sim.stadtGrenze(S) && f.x < RASTER && f.z >= 0 && f.z < TIEFE) { erweiterungInfo(); return; }
  schliesseInfo();
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
  const d = GEB[b.t], casa = b.t === 'huette' && b.stufe >= 2;
  const name = b.t === 'huette' && b.stufe === 3 ? INSULA.n : casa ? CASA.n : d.n;
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
    html += `<div class="zeile"><span>Freie Arbeitskräfte in der Stadt</span><b>${S.letzte.arbeitslos ?? 0}${S.letzte.sklavenFrei ? ' + ' + S.letzte.sklavenFrei + ' Sklaven' : ''}</b></div>`;
    html += `<div class="zeile"><span>Sklaven</span><b>${d.sklaven ? 'arbeiten hier' : 'nicht hier'}</b></div>`;
    if (d.erzeugt) html += `<button class="knopf${b.familie ? ' an' : ''}" data-a="familie">${b.familie ? 'Familiengeschäft der ' + sim.familieS(S).name + ' (zurückgeben)' : 'Der Familie übertragen (Gewinn ins Familienvermögen)'}</button>`;
    html += `<button class="knopf${b.prio ? ' an' : ''}" data-a="prio" aria-pressed="${b.prio}">${b.prio ? 'Arbeiter gehen zuerst hierher' : 'Arbeiter zuerst hierher schicken'}</button>`;
  }
  if (b.t === 'huette') {
    const ja = v => v ? 'ja' : 'nein';
    const arbeiten = S.geb.reduce((s, o) => s + (o.von || []).filter(v => v[0] === b.id).reduce((t, v) => t + v[1], 0), 0);
    html += `<div class="zeile"><span>Bewohner</span><b>${b.bew} / ${sim.wohnraum(b)}</b></div>
      <div class="zeile"><span>Gehen zur Arbeit</span><b>${arbeiten}</b></div>
      <div class="zeile"><span>Brot</span><b>${ja(S.versorgt.brot)}</b></div>
      <div class="zeile"><span>Brunnen in der Nähe</span><b>${ja(sim.inReichweite(S, b, 'brunnen'))}</b></div>
      <div class="zeile"><span>Markt in der Nähe</span><b>${ja(sim.inReichweite(S, b, 'markt'))}</b></div>
      <div class="zeile"><span>Feuerwache in der Nähe</span><b>${ja(sim.wacheNah(S, b))}</b></div>`;
    if (!casa) html += `<p>Aufstieg zur Casa (16 Bewohner): Haus voll, Brot, Brunnen und Markt in der Nähe, 10 Ziegel.</p>`;
    else if (b.stufe === 2) html += sim.rang(S) < INSULA.rang
      ? `<p>Ab der Kleinstadt (${RAENGE[INSULA.rang].ab} Einwohner) kann eine volle Casa zur Insula aufgestockt werden (30 Bewohner).</p>`
      : `<p>Aufstockung zur Insula (30 Bewohner): Casa voll, Brot, Brunnen, Markt und ein Schrein in der Nähe, ${kostenText(INSULA.kosten)}.${sim.insulaFehlt(S, b) ? ' Es fehlt: ' + sim.insulaFehlt(S, b) + '.' : ''}</p>`;
  }
  if (b.t === 'domus') {
    html += `<div class="zeile"><span>Equites</span><b>${b.bew} / ${sim.wohnraum(b)}</b></div>
      <div class="zeile"><span>Wein im Lager</span><b>${rund(S.gut.wein)}</b></div>
      <div class="zeile"><span>Brunnen / Markt in der Nähe</span><b>${sim.inReichweite(S, b, 'brunnen') ? 'ja' : 'nein'} / ${sim.inReichweite(S, b, 'markt') ? 'ja' : 'nein'}</b></div>
      <div class="zeile"><span>Luxus (Öl, Garum)</span><b>${b.lux > 1.4 ? 'beides' : b.lux > 1.1 ? 'eins davon' : 'nichts'}</b></div>
      <p>Equites zahlen viermal so viel Steuern wie Plebejer, mit Öl und Garum je ein Viertel mehr. Sie trinken jeden Monat Wein (0,1 je Kopf).</p>`;
  }
  if (b.t === 'quartier') {
    const frei = GEB.quartier.sklavenPlatz - (b.skl || 0), n = Math.min(SKLAVEN.los, frei);
    const arbeiten = S.geb.reduce((s, o) => s + (o.von || []).filter(v => v[0] === b.id).reduce((t, v) => t + v[1], 0), 0);
    html += `<div class="zeile"><span>Sklaven</span><b>${b.skl || 0} / ${GEB.quartier.sklavenPlatz}</b></div>
      <div class="zeile"><span>Arbeiten in Betrieben</span><b>${arbeiten}</b></div>
      <div class="zeile"><span>Getreidebrei im Monat</span><b>${zahl((b.skl || 0) * SKLAVEN.essen)} Getreide</b></div>
      <p>Sklaven arbeiten auf Feldern, in Gruben, Mühlen und Werkstätten – nicht am Markt oder in der Schule. Sind es mehr als halb so viele wie freie Bürger, fürchtet die Stadt einen Aufstand.</p>
      <button class="knopf haupt" data-a="kaufen"${n > 0 ? '' : ' disabled'}>${n > 0 ? `${n} Sklaven kaufen (${n * SKLAVEN.preis} Denare)` : 'Quartier voll'}</button>
      <button class="knopf" data-a="frei"${b.skl > 0 ? '' : ' disabled'}>Freilassen (manumissio): ${Math.min(SKLAVEN.los, b.skl || 0)} werden Plebejer</button>`;
  }
  const gefahr = sim.brandGefahr(S, b);
  if (gefahr) html += `<div class="zeile"><span>Brandgefahr</span><b>${gefahr < 0.002 ? 'gering' : gefahr < 0.006 ? 'mittel' : 'hoch'}</b></div>`;
  if (d.unterhalt) html += `<div class="zeile"><span>Lohn/Sold im Monat</span><b>${d.unterhalt} Denare${b.unbezahlt ? ' – nicht bezahlt!' : ''}</b></div>`;
  if (d.reichweite) html += `<div class="zeile"><span>Reichweite${d.strassen ? ' über Straßen' : ''}</span><b>${d.reichweite} Felder</b></div>`;
  html += `<div style="flex:1"></div><button class="knopf weg" data-a="weg">Abreißen (Hälfte der Baustoffe zurück)</button>`;
  $('#info').innerHTML = html; $('#info').hidden = false;
}
$('#info').addEventListener('click', e => {
  const a = e.target.closest('[data-a]'); if (!a) return;
  if (a.dataset.a === 'erweitern') {
    const r = sim.erweitern(S, welt);
    if (!r.ok) { melden(r.grund); ton.sfx('fehler'); return; }
    ton.sfx('aufstieg'); melden('Der Senat stimmt zu: ' + r.text); schliesseInfo(); allesZeichnen(); return;
  }
  if (a.dataset.a === 'zu' && !auswahl && szene.modus() !== 'region') { schliesseInfo(); return; }
  if (szene.modus() === 'region') {
    if (a.dataset.a === 'stadt') umland(false);
    else if (a.dataset.a === 'geschenk') {
      const r = sim.geschenk(S);
      if (!r.ok) { melden(r.grund); ton.sfx('fehler'); } else { ton.sfx('aufstieg'); melden('Der Häuptling nimmt die Geschenke an. Zwei Jahre Frieden.'); }
      allesZeichnen(); hexInfo(hexWahl);
    } else if (a.dataset.a === 'schutz' || a.dataset.a === 'villa') {
      const r = a.dataset.a === 'villa' ? sim.villaBauen(S, hexWahl) : sim.schutzBauen(S, hexWahl, a.dataset.t);
      if (!r.ok) { melden(r.grund); ton.sfx('fehler'); } else ton.sfx('bauen');
      allesZeichnen(); hexInfo(hexWahl);
    } else if (a.dataset.a === 'handel') {
      const r = sim.handeln(S, a.dataset.g, a.dataset.art, a.dataset.p);
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
  if (a.dataset.a === 'familie') { const r = sim.familienGeschaeft(S, b); melden(r.ok ? r.text : r.grund); if (!r.ok) ton.sfx('fehler'); infoZeichnen(); kopfleiste(); }
  if (a.dataset.a === 'kaufen' || a.dataset.a === 'frei') {
    const r = a.dataset.a === 'kaufen' ? sim.sklavenKaufen(S, b) : sim.freilassen(S, b);
    if (!r.ok) { melden(r.grund); ton.sfx('fehler'); }
    else { ton.sfx('klick'); melden(a.dataset.a === 'kaufen' ? `${r.n} Sklaven gekauft (${r.preis} Denare).` : `${r.n} Sklaven freigelassen – sie ziehen als Liberti in die Häuser. Freilassungssteuer: ${zahl(r.steuer)} Denare.`); }
    allesZeichnen();
  }
  if (a.dataset.a === 'weg') { sim.abreissen(S, b.id); ton.sfx('abreissen'); schliesseInfo(); allesZeichnen(); }
});

// ---------- Tempo und Menü ----------
document.querySelector('.tempo').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { tempo = +b.dataset.tempo; kopfleiste(); } });
$('#menueKnopf').addEventListener('click', () => { tonKnopf(); $('#menue').hidden = false; });
$('#menue').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) { if (e.target.id === 'menue') $('#menue').hidden = true; return; }
  const m = b.dataset.m;
  if (m === 'weiter') $('#menue').hidden = true;
  if (m === 'ton') { ton.schalten(); tonKnopf(); return; }
  if (m === 'ereignisse') { S.ereignisseAus = !S.ereignisseAus; tonKnopf(); return; }
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
      <li>Placentia im Westen kauft und verkauft Waren, sobald ein Weg oder Anleger hinführt. Rom will jeden Herbst Abgaben.</li>
      <li>Gefahren: Räuber plündern ferne Betriebe (Wachturm), der Padus tritt im Frühling über die Ufer (Deich), Gallier kommen aus dem Norden (Kastell auf einem Hang).</li>
      <li>Sklaven: im Sklavenquartier kaufen. Sie arbeiten auf Feldern und in Werkstätten und essen Getreide. Freigelassene werden Plebejer.</li>
      <li>Feuer: Dichte Häuser, Bäckereien und Ziegeleien brennen leicht. Eine Feuerwache löscht Brände und hält Ordnung. Ansicht „Feuer“ zeigt die Gefahr.</li>
      <li>Familie (Knopf „Familie“): Ansehen sammeln, gegen die Rivalen zum Ädil und Prätor gewählt werden. Familiengeschäfte füllen das Familienvermögen – auf Kosten der Stadtkasse.</li>
      <li>Forschung (Knopf „Wissen“): ein Ziel wählen. Wissen kommt vom Stadtrat und aus Schulen.</li></ol>`;
  }
});

// ---------- Spielschleife ----------
// ---------- Stadterweiterung (1.11.) ----------
function erweiterungInfo() {
  auswahl = 0; const e = ERWEITERUNG[S.grenze || 0];
  if (!e) { schliesseInfo(); return; }
  const haken = ok => ok ? '<b style="color:var(--gut)">erfüllt</b>' : '<b style="color:var(--schlecht)">fehlt</b>';
  const rg = sim.rang(S) >= e.rang, gu = sim.gunst(S) >= e.gunst, geld = sim.kannBezahlen(S, e.kosten), alles = rg && gu && geld;
  $('#info').innerHTML = `<button class="schliessen" data-a="zu" aria-label="Schließen"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
    <h2>Land im Osten</h2><div class="unter">Stadterweiterung ${(S.grenze || 0) + 1} von ${ERWEITERUNG.length}</div>
    <p>${e.text} Grenzsteine markieren, wie weit die Kolonie bauen darf. Über neues Land entscheidet der Senat in Rom.</p>
    <div class="zeile"><span>Stadtrang ${RAENGE[e.rang].n}</span>${haken(rg)}</div>
    <div class="zeile"><span>Gunst Roms mindestens ${e.gunst} (jetzt ${Math.round(sim.gunst(S))})</span>${haken(gu)}</div>
    <div class="zeile"><span>Gebühr ${kostenText(e.kosten)}</span>${haken(geld)}</div>
    <button class="knopf${alles ? ' haupt' : ''}" data-a="erweitern"${alles ? '' : ' disabled'}>Beim Senat beantragen</button>`;
  $('#info').hidden = false; kopfleiste();
}
// ---------- Ereignisse (S4.3) ----------
let evBilder = null;
const BILD_PFADE = ['../img/st_ev.json', '../../img/st_ev.json'];
async function evBilderLaden() {
  for (const p of BILD_PFADE) { try { const r = await fetch(p); if (r.ok) { evBilder = await r.json(); if (!$('#ereignis').hidden) ereignisZeigen(); return; } } catch (e) {} }
  evBilder = {};
}
function ereignisZeigen() {
  const e = S.ereignis && sim.ereignis(S.ereignis);
  if (!e) { $('#ereignis').hidden = true; return; }
  if (!evBilder) evBilderLaden();
  const bild = evBilder && evBilder[e.bild];
  $('#ereignis').innerHTML = `<div class="feld ereigniskarte">
    <div class="ebild"${bild ? ` style="background-image:url(${bild})"` : ''}></div>
    <div class="einhalt"><small>${sim.datumText(S)}</small><h2>${e.titel}</h2><p>${e.text}</p>
    ${e.wahl.map((w, i) => { const f = sim.wahlMoeglich(S, w);
      return `<button class="knopf ewahl" data-e="${i}"${f ? ' disabled' : ''}><b>${w.t}</b><small>${f || sim.wirkungText(w)}</small></button>`; }).join('')}</div></div>`;
  $('#ereignis').hidden = false;
}
$('#ereignis').addEventListener('click', e => {
  const b = e.target.closest('[data-e]'); if (!b) return;
  const r = sim.ereignisWaehlen(S, +b.dataset.e);
  if (!r.ok) { melden(r.grund); ton.sfx('fehler'); return; }
  ton.sfx('klick'); $('#ereignis').hidden = true; allesZeichnen();
});

let grenzeGezeigt = -1;
function allesZeichnen() { if (grenzeGezeigt !== sim.stadtGrenze(S)) { grenzeGezeigt = sim.stadtGrenze(S); szene.grenze(grenzeGezeigt); }
  szene.abgleichen(S, auswahl); if (S.ereignis && $('#ereignis').hidden) ereignisZeigen(); szene.landAbgleichen(S); if (hexWahl && szene.modus() === 'region') hexInfo(hexWahl); ansichtZeichnen(); kopfleiste(); bauleiste(); if (auswahl) infoZeichnen(); }

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
  if (f.typ === 'nachbar') { handelInfo(f.id); return; }
  if (f.typ === 'gallier') { gallierInfo(); return; }
  const d = REGION_TYPEN[f.typ], weit = sim.hexAbstand(f, { q: 0, r: 0 }), stand = sim.landStand(S, f);
  const l = (S.land || {})[sim.landKey(f)], bt = (l && l.betrieb) || sim.betriebFuer(f), bd = LAND_BETRIEBE[bt];
  const ertrag = (t, villa) => Object.entries(LAND_BETRIEBE[t].erzeugt).map(([g, n]) => `${zahl(n * sim.landFaktor(f, S) * sim.bonus(S, t, g) * (villa ? 1.75 : 1))} ${WAREN[g].n}`).join(', ');
  const pro = bd ? ertrag(bt, l && l.villa) : '';
  let lage = '';
  if (stand === 'frei') lage = sim.kannVermessen(S, f)
    ? `<button class="knopf haupt" data-a="vermessen">Vermessen lassen (${kostenText(sim.vermKosten(S))}, ${sim.vermMonate(S)} ${sim.vermMonate(S) === 1 ? 'Monat' : 'Monate'})</button>`
    : '<div class="lage warn">Noch zu weit draußen – erst das Land daneben vermessen.</div>';
  if (stand === 'vermessung') lage = `<div class="lage warn">Die Landvermesser sind bei der Arbeit (${l.verm} von ${sim.vermMonate(S)} Monaten).</div>`;
  if (stand === 'vermessen') lage = bd
    ? '<div class="lage gut">Vermessen</div>' + sim.betriebeFuer(f).map((t, i) => { const b = LAND_BETRIEBE[t];
        const e = ertrag(t);
        const zu = b.forschung && !sim.hat(S, b.forschung);
        return `<p>${b.text}</p>${e ? `<div class="zeile"><span>Ertrag im Monat</span><b>${e}${b.ernte ? ' (Sommer)' : ''}</b></div>` : ''}
        <button class="knopf${i || zu ? '' : ' haupt'}" data-a="landbau" data-t="${t}"${zu ? ' disabled' : ''}>${zu ? b.n + ': erst ' + FORSCHUNG[b.forschung].n + ' erforschen' : `${b.n} bauen (${kostenText(b.kosten)})`}</button>`; }).join('')
    : '<div class="lage gut">Vermessen</div><p>Für dieses Land gibt es noch keinen Betrieb.</p>';
  const verb = sim.verbunden(S, f);
  if (stand === 'betrieb' && bt === 'kastell') lage = `<div class="lage gut">Kastell besetzt</div><p>${bd.text}</p>`;
  else if (stand === 'betrieb' && bt === 'anleger') lage = `<div class="lage ${verb ? 'gut' : 'warn'}">Anleger ${verb ? 'mit der Stadt verbunden' : 'noch ohne Verbindung'}</div><p>${bd.text}</p>`;
  else if (stand === 'betrieb') lage = verb
    ? `<div class="lage gut">${bd.n} arbeitet</div><div class="zeile"><span>Ertrag im Monat</span><b>${pro}${bd.ernte ? ' (Sommer)' : ''}</b></div>`
    : `<div class="lage schlecht">${bd.n} arbeitet, aber kein Weg zur Stadt</div><p>Ohne Weg kommt nichts in der Stadt an. Lege Feldwege bis zur Stadt an.</p>`;
  if ((stand === 'vermessen' || stand === 'betrieb') && !sim.hatWeg(S, f))
    lage += `<button class="knopf${stand === 'betrieb' ? ' haupt' : ''}" data-a="weg">Feldweg anlegen (${kostenText(WEG.kosten)})</button>`;
  else if (sim.hatWeg(S, f)) lage += `<div class="zeile"><span>Feldweg</span><b>${verb ? 'mit der Stadt verbunden' : 'noch nicht bis zur Stadt'}</b></div>`;
  if (stand === 'betrieb' && bt === 'gehoeft') lage += l.villa ? '<div class="zeile"><span>Ausbau</span><b>Villa rustica</b></div>'
    : sim.hat(S, 'villa') ? `<button class="knopf" data-a="villa">Zur Villa rustica ausbauen (${kostenText(sim.VILLA_KOSTEN)})</button>` : '';
  if (stand === 'vermessen' || stand === 'betrieb') lage += schutzInfo(f, l, bt);
  if (l && l.stoer > 0) lage = `<div class="lage schlecht">${STOER[l.stoerArt] || 'Gestört'} – noch ${l.stoer} ${l.stoer === 1 ? 'Monat' : 'Monate'} ohne Ertrag</div>` + lage;
  $('#info').innerHTML = `<button class="schliessen" data-a="zu" aria-label="Schließen"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
    <h2>${d.n}</h2><div class="unter">${weit ? weit + (weit === 1 ? ' Feld' : ' Felder') + ' von der Stadt' : 'Stadtgebiet'}</div>
    <p>${d.text}</p>
    ${d.nutzen ? `<div class="zeile"><span>Nutzen</span><b>${d.nutzen}</b></div>${lage}` : romInfo() + '<button class="knopf haupt" data-a="stadt">Zur Stadt</button>'}`;
  $('#info').hidden = false;
}

// ---------- Nachbarstadt und Rom (S2.5) ----------
const zahl = n => (Math.round(n * 10) / 10).toLocaleString('de-DE');
// ---------- Familie und Ämter (S4.1) ----------
let heiratWahl = '';
function familieZeigen() {
  const F = sim.familieS(S), naechstes = AEMTER[F.amt + 1], fehlt = sim.amtFehlt(S);
  const mitglieder = F.mitglieder.map(m => {
    const angebote = sim.heiratsAngebote(S, m), esc = m.n.replace(/"/g, '');
    let knoepfe = '';
    if (m.rolle === 'Sohn' && m.alter >= 14 && !m.gelernt) knoepfe += Object.entries(AUSBILDUNG).map(([k, a]) => `<button class="knopf klein" data-fa="lernen" data-m="${esc}" data-o="${k}">${a.n}${a.kosten ? ' (' + a.kosten + ' Denare)' : ''}</button>`).join('');
    if (angebote.length) knoepfe += `<button class="knopf klein" data-fa="angebote" data-m="${esc}">Heirat arrangieren</button>`;
    const zusatz = m.ausbildung ? `<small>${AUSBILDUNG[m.ausbildung.art].n}: noch ${m.ausbildung.rest} Monate</small>` : m.verheiratet ? `<small>verheiratet mit ${m.verheiratet}</small>` : '';
    return `<div class="fkarte"><b>${m.n}</b><span>${m.rolle}, ${m.alter} Jahre · ${m.eig}</span><small>${m.text}</small>${zusatz}${knoepfe}</div>`;
  }).join('');
  const wahl = F.mitglieder.find(m => m.n === heiratWahl), angebote = wahl ? sim.heiratsAngebote(S, wahl) : [];
  const heiratBlock = angebote.length ? `<div class="fziel"><b>Heiratsangebote für ${wahl.n}</b>${angebote.map(o => {
      const vergeben = o.bund && (F.buende || []).includes(o.bund);
      const geld = wahl.rolle === 'Tochter' ? `Mitgift ${o.mitgift} Denare zahlen` : `bringt ${o.mitgift} Denare mit`;
      return `<div class="handel" style="grid-template-columns:1fr 180px"><div><b>${o.n} (${o.haus})</b><small>${o.text}</small></div><button class="knopf" data-fa="heirat" data-m="${wahl.n}" data-o="${o.id}"${vergeben ? ' disabled' : ''}>${vergeben ? 'schon verbündet' : geld}</button></div>`; }).join('')}</div>` : '';
  const laufbahn = AEMTER.map((a, i) => {
    const st = i < F.amt ? 'fertig' : i === F.amt ? 'ziel' : a.bald ? 'bald' : 'offen';
    const unten = i < F.amt ? 'bekleidet' : i === F.amt ? 'jetziges Amt' : a.bald ? 'kommt später' : `Ansehen ${a.ansehen} · ${a.kosten} Denare`;
    return `<div class="fkarte ${st}"><b>${a.n}</b><span>${a.text}</span><small>${unten}</small></div>`;
  }).join('');
  const rivalen = S.rivalen.map(r => { const d = RIVALEN.find(x => x.gens === r.gens), bund = (F.buende || []).includes(r.gens); return `<div class="zeile"><span>${d.n} – ${bund ? 'verbündet durch Heirat' : d.text}</span><b>Ansehen ${Math.round(r.ansehen)}</b></div>`; }).join('');
  const gesch = sim.geschaefte(S);
  const spieleOk = F.amt >= 1 && F.spieleJahr !== sim.jahr(S);
  $('#familie').innerHTML = `<div class="feld forschungsseite">
    <button class="schliessen" data-fa="zu" aria-label="Schließen"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
    <h2>Familie der ${F.name}</h2><div class="untertitel">${AEMTER[F.amt].n} · Ansehen ${Math.round(F.ansehen)} (+${zahl(sim.ansehenProMonat(S))} im Monat) · Familienvermögen ${rund(F.vermoegen)} Denare</div>
    <div class="fbaum fam">${mitglieder}</div>
    ${heiratBlock}
    <h3 class="fh">Klienten (salutatio)</h3>
    <p class="fp">Jeden Morgen erscheinen Klienten im Atrium und erhalten eine Zuwendung (sportula): ${KLIENTEN.kosten.toString().replace('.', ',')} Denare im Monat je Klient aus dem Familienvermögen. Dafür bringen sie Ansehen und Stimmen.</p>
    <div class="handel" style="grid-template-columns:1fr 120px 120px"><div><b>${F.klienten || 0} von höchstens ${sim.klientenMax(S)} Klienten</b><small>+${zahl((F.klienten || 0) * KLIENTEN.ansehen)} Ansehen, −${zahl((F.klienten || 0) * KLIENTEN.kosten)} Denare im Monat</small></div>
      <button class="knopf" data-fa="klientMinus">${KLIENTEN.schritt} entlassen</button><button class="knopf" data-fa="klientPlus">${KLIENTEN.schritt} aufnehmen</button></div>
    ${(F.buende || []).length ? `<div class="zeile"><span>Bündnisse durch Heirat</span><b>${F.buende.map(g => RIVALEN.find(r => r.gens === g).n).join(', ')}</b></div>` : ''}
    <h3 class="fh">Ämterlaufbahn (cursus honorum)</h3>
    <div class="fbaum fam">${laufbahn}</div>
    ${naechstes && !naechstes.bald ? `<div class="fziel"><b>Kandidatur als ${naechstes.n}</b><small>${fehlt ? 'Es fehlt: ' + fehlt : 'Alles bereit – die Bürger warten auf die Wahl.'}</small>
      <button class="knopf${fehlt ? '' : ' haupt'}" data-fa="wahl"${fehlt ? ' disabled' : ''}>Kandidieren (${naechstes.kosten} Denare Wahlkampf)</button></div>` : ''}
    <h3 class="fh">Rivalen</h3>${rivalen}
    <h3 class="fh">Familiengeschäfte (${gesch.length} von ${FAMILIE.geschaeftMax})</h3>
    <p class="fp">Ein Betrieb kann der Familie übertragen werden (im Gebäudefenster). Er bringt dem Familienvermögen ${FAMILIE.geschaeftGewinn} Denare im Monat – bezahlt aus der Stadtkasse. Ab ${FAMILIE.gerede} Geschäften redet der Senat: Die Gunst Roms sinkt.</p>
    ${gesch.map(b => `<div class="zeile"><span>${GEB[b.t].n}</span><b>${b.w > 0 ? 'arbeitet' : 'steht still'}</b></div>`).join('')}
    <h3 class="fh">Spiele (ludi)</h3>
    <p class="fp">Als Ädil richtet die Familie einmal im Jahr Spiele aus: ${FAMILIE.spiele.vermoegen} Denare aus dem Familienvermögen, Ansehen +${FAMILIE.spiele.ansehen}, Stimmung +${FAMILIE.spiele.stimmung}.</p>
    <button class="knopf${spieleOk ? ' haupt' : ''}" data-fa="spiele"${spieleOk ? '' : ' disabled'}>${F.amt < 1 ? 'Erst als Ädil' : F.spieleJahr === sim.jahr(S) ? 'Dieses Jahr schon gefeiert' : 'Spiele ausrichten'}</button>
  </div>`;
  $('#familie').hidden = false;
}
$('#familie').addEventListener('click', e => {
  const b = e.target.closest('[data-fa]');
  if (!b) { if (e.target.id === 'familie') $('#familie').hidden = true; return; }
  if (b.dataset.fa === 'zu') { $('#familie').hidden = true; heiratWahl = ''; return; }
  if (b.dataset.fa === 'angebote') { heiratWahl = b.dataset.m; familieZeigen(); return; }
  const fa = b.dataset.fa;
  if (['heirat', 'lernen', 'klientPlus', 'klientMinus'].includes(fa)) {
    const r = fa === 'heirat' ? sim.heiraten(S, b.dataset.m, b.dataset.o) : fa === 'lernen' ? sim.ausbilden(S, b.dataset.m, b.dataset.o) : sim.klienten(S, fa === 'klientPlus');
    if (!r.ok) { melden(r.grund); ton.sfx('fehler'); } else { ton.sfx(fa === 'heirat' ? 'aufstieg' : 'klick'); if (r.text) melden(r.text); if (fa === 'heirat') heiratWahl = ''; }
    familieZeigen(); kopfleiste(); return;
  }
  const r = b.dataset.fa === 'wahl' ? sim.kandidieren(S) : sim.spieleAusrichten(S);
  if (!r.ok) { melden(r.grund); ton.sfx('fehler'); }
  else { ton.sfx('aufstieg'); melden(b.dataset.fa === 'wahl' ? r.text : 'Die Spiele begeistern die Stadt! Ansehen und Stimmung steigen.'); }
  familieZeigen(); kopfleiste();
});

// ---------- Forschung (S3.1) ----------
const STAND_TEXT = { fertig: 'erforscht', ziel: 'wird erforscht', epoche: 'Späte Republik', bald: 'kommt in einer späteren Ausbaustufe' };
function forschungZeigen() {
  const F = sim.forschungS(S), w = sim.wissenProMonat(S), ziel = FORSCHUNG[F.ziel];
  const karte = id => {
    const d = FORSCHUNG[id], st = sim.forschungsStand(S, id);
    const unten = st === 'offen' ? `${d.kosten} Wissen` : st === 'gesperrt' ? 'braucht ' + FORSCHUNG[d.braucht].n : STAND_TEXT[st];
    return `<button class="fkarte ${st}" data-f="${id}"${st === 'epoche' || st === 'fertig' || st === 'bald' ? ' disabled' : ''}><b>${d.n}</b><span>${d.text}</span><small>${unten}</small></button>`;
  };
  const spalten = ZWEIGE.map((z, i) => {
    const ids = ep => Object.keys(FORSCHUNG).filter(id => FORSCHUNG[id].zweig === i && FORSCHUNG[id].ep === ep);
    return `<div class="fzweig"><h3>${z}</h3>${ids(1).map(karte).join('')}<div class="fepoche">${EPOCHEN[2]}</div>${ids(2).map(karte).join('')}</div>`;
  }).join('');
  const rest = ziel ? Math.max(0, ziel.kosten - F.wissen) : 0, mon = Math.ceil(rest / w);
  $('#forschung').innerHTML = `<div class="feld forschungsseite">
    <button class="schliessen" data-f="zu" aria-label="Schließen"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
    <h2>Forschung</h2><div class="untertitel">Epoche ${sim.epoche(S) === 2 ? 'II' : 'I'} · ${EPOCHEN[sim.epoche(S)]} · ${zahl(F.wissen)} Wissen gesammelt · +${zahl(w)} im Monat</div>
    ${epocheBlock()}
    <div class="fziel">${ziel ? `<b>${ziel.n}</b><div class="balken"><i style="width:${Math.min(100, F.wissen / ziel.kosten * 100)}%"></i></div>
      <small>noch ${zahl(rest)} Wissen – etwa ${mon} ${mon === 1 ? 'Monat' : 'Monate'}</small>`
      : '<b>Wähle ein Ziel</b><small>Wissen sammelt sich auch ohne Ziel. Schulen bringen je 3 Wissen im Monat.</small>'}</div>
    <div class="fbaum">${spalten}</div></div>`;
  $('#forschung').hidden = false;
}
function epocheBlock() {
  if (sim.epoche(S) >= 2) return '';
  const n = sim.forschungS(S).fertig.filter(id => FORSCHUNG[id].ep === 1).length, fehlt = sim.epocheFehlt(S);
  const z = (t, ok) => `<span class="${ok ? 'ok' : 'nein'}">${t}</span>`;
  return `<div class="fziel fepochewahl"><b>Der Weg in die Späte Republik</b>
    <div class="fbeding">${z(`Stadtrang ${RAENGE[EPOCHE2.rang].n}`, sim.rang(S) >= EPOCHE2.rang)}${z(`${n} von ${EPOCHE2.erfindungen} Erfindungen`, n >= EPOCHE2.erfindungen)}${z(`Gunst Roms ${Math.round(sim.gunst(S))} von ${EPOCHE2.gunst}`, sim.gunst(S) >= EPOCHE2.gunst)}</div>
    <small>Dann öffnen sich Wein, Öl, Tuch, Garum, Domus der Equites, Römerstraße, Aquädukt, Archiv, Zölle, Tempel und Theater.</small>
    <button class="knopf${fehlt ? '' : ' haupt'}" data-f="epoche"${fehlt ? ' disabled' : ''}>Späte Republik beginnen</button></div>`;
}
$('#forschung').addEventListener('click', e => {
  const b = e.target.closest('[data-f]');
  if (b && b.dataset.f === 'epoche') {
    const r = sim.epocheWechseln(S);
    if (!r.ok) { melden(r.grund); ton.sfx('fehler'); return; }
    ton.sfx('aufstieg'); melden('Die Späte Republik beginnt. Cremona ist eine blühende Kolonie – neue Erfindungen und Bauten warten.');
    forschungZeigen(); allesZeichnen(); return;
  }
  if (!b) { if (e.target.id === 'forschung') $('#forschung').hidden = true; return; }
  if (b.dataset.f === 'zu') { $('#forschung').hidden = true; return; }
  const r = sim.forschungWaehlen(S, b.dataset.f);
  if (!r.ok) { melden(r.grund); ton.sfx('fehler'); } else ton.sfx('klick');
  forschungZeigen(); kopfleiste();
});

// ---------- Gefahren (S2.6) ----------
const STOER = { raeuber: 'Von Räubern geplündert', hochwasser: 'Vom Hochwasser überflutet', gallier: 'Von Galliern verwüstet' };
function schutzInfo(f, l, bt) {
  let h = '';
  const knopf = t => `<button class="knopf" data-a="schutz" data-t="${t}">${SCHUTZ[t].n} bauen (${kostenText(SCHUTZ[t].kosten)})</button>`;
  if (bt !== 'kastell') {
    const nah = sim.hexAbstand(f, { q: 0, r: 0 }) < GEFAHR.raeuber.weit;
    h += `<div class="zeile"><span>Schutz vor Räubern</span><b>${l.turm ? 'Wachturm' : nah ? 'nah an der Stadt' : sim.raeuberSchutz(S, f) ? 'bewacht' : 'ungeschützt'}</b></div>`;
    if (!nah && !l.turm) h += knopf('turm');
  }
  if (sim.amFluss(f)) {
    h += `<div class="zeile"><span>Hochwasser im Frühling</span><b>${l.deich ? 'Deich schützt' : 'gefährdet'}</b></div>`;
    if (!l.deich) h += knopf('deich');
  }
  return h;
}
function romInfo() {
  const gu = Math.round(sim.gunst(S)), wort = gu >= 70 ? 'wohlgesonnen' : gu >= 40 ? 'abwartend' : 'verärgert';
  return `<div class="zeile"><span>Gunst Roms</span><b>${gu} von 100 (${wort})</b></div>
    <div class="zeile"><span>Schutz vor Galliern</span><b>${sim.hatKastell(S) ? 'Kastell besetzt' : 'kein Kastell'}</b></div>
    <div class="zeile"><span>Unterhalt (Löhne, Sold) im Monat</span><b>${sim.unterhaltSumme(S)} Denare</b></div>
    <div class="zeile"><span>Abgabe am Ende des Herbstes</span><b>${sim.abgabeBetrag(S)} Denare${S.monat < 12 ? ' (ab dem 2. Jahr)' : ''}</b></div>
    <p>Wer pünktlich zahlt, gewinnt die Gunst des Senats – dann fällt auch der Lohn für Aufträge höher aus (jetzt ${Math.round(sim.lohnFaktor(S) * 100)} %).</p>`;
}
function handelInfo(id = 'placentia') {
  const P = sim.PARTNER[id], offen = sim.handelOffen(S, id), n = HANDEL.menge;
  const d = id === 'placentia' ? { n: 'Placentia', unter: 'Nachbarstadt am Padus · Handel', text: REGION_TYPEN.nachbar.text } : P;
  const zeilen = Object.keys(P.waren).map(g => {
    const p = sim.preis(S, g, id), rel = p / P.waren[g].basis, wort = rel < 0.8 ? 'billig' : rel > 1.25 ? 'teuer' : 'üblich';
    return `<div class="handel"><div><b>${WAREN[g].n}</b><small>${rund(S.gut[g])} im Lager · ${P.n}: ${zahl(p)} je Stück, ${wort}</small></div>
      <button class="knopf" data-a="handel" data-p="${id}" data-art="verkauf" data-g="${g}"${offen ? '' : ' disabled'}>${n} verkaufen<small>+${sim.handelSumme(S, g, 'verkauf', id)} Denare</small></button>
      <button class="knopf" data-a="handel" data-p="${id}" data-art="kauf" data-g="${g}"${offen ? '' : ' disabled'}>${n} kaufen<small>−${sim.handelSumme(S, g, 'kauf', id)} Denare</small></button></div>`;
  }).join('');
  const weg = P.anleger ? 'Lege Feldwege bis an Placentia heran oder baue einen Anleger am Padus – dann fahren die Boote flussaufwärts.'
    : `Nach ${P.n} kommt man nur über Land: Lege Feldwege bis an die Stadt im Osten heran.`;
  $('#info').innerHTML = `<button class="schliessen" data-a="zu" aria-label="Schließen"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
    <h2>${d.n}</h2><div class="unter">${d.unter}</div><p>${d.text}</p>
    ${offen ? `<div class="lage gut">Händler fahren zwischen Cremona und ${P.n}</div>` : `<div class="lage warn">Noch kein Weg nach ${P.n}</div><p>${weg}</p>`}
    <p>Was du verkaufst, wird dort billiger; was du kaufst, teurer. Mit der Zeit gleichen sich die Preise wieder aus.</p>
    ${zeilen}`;
  $('#info').hidden = false;
}
function gallierInfo() {
  const d = REGION_TYPEN.gallier, fr = S.frieden > 0;
  $('#info').innerHTML = `<button class="schliessen" data-a="zu" aria-label="Schließen"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
    <h2>${d.n}</h2><div class="unter">Gallier im Norden</div><p>${d.text}</p>
    ${fr ? `<div class="lage gut">Frieden – noch ${S.frieden} Monate</div>` : '<div class="lage warn">Im Sommer können ihre Krieger einfallen</div>'}
    <div class="zeile"><span>Kastell auf den Hügeln</span><b>${sim.hatKastell(S) ? 'besetzt' : 'keins'}</b></div>
    <p>Geschenke an den Häuptling – Brot und Silber – sichern zwei Jahre Frieden. Ein Kastell hält sie auch ohne Geschenke ab.</p>
    <button class="knopf${fr ? '' : ' haupt'}" data-a="geschenk"${fr ? ' disabled' : ''}>Geschenke schicken (${kostenText(sim.GALLIER_GESCHENK)})</button>`;
  $('#info').hidden = false;
}

// ---------- Ansichten (S1.4) ----------
let ansicht = '';
const ANSICHT_NAME = { feuer: 'Feuer: Brandgefahr', wasser: 'Wasser', stimmung: 'Stimmung: Versorgung', arbeit: 'Arbeit' };
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
  if (b.hasAttribute('data-forschung')) { forschungZeigen(); return; }
  if (b.hasAttribute('data-familie')) { familieZeigen(); return; }
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
  if (tempo && $('#menue').hidden && $('#startseite').hidden && $('#forschung').hidden && $('#familie').hidden && $('#ereignis').hidden) { uhr += dt * tempo; if (uhr >= MONAT_S) { uhr -= MONAT_S; monatAblaufen(); } }
  szene.zeichnen(dt, $('#menue').hidden && $('#startseite').hidden ? tempo : 0);
  requestAnimationFrame(schleife);
}
const tonKnopf = () => { $('#menue [data-m="ton"]').textContent = ton.istAn() ? 'Ton: an' : 'Ton: aus';
  $('#menue [data-m="ereignisse"]').textContent = S.ereignisseAus ? 'Ereignisse: aus' : 'Ereignisse: an'; };
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
  tempo: t => { tempo = t; kopfleiste(); }, ereignis: i => { const r = sim.ereignisWaehlen(S, i); $('#ereignis').hidden = true; allesZeichnen(); return r; }, erweiterungInfo: () => erweiterungInfo(), forschung: () => forschungZeigen(), familie: () => familieZeigen(),
  modelle: () => szene.modelleBereit, szene, start, ton, umland, hexInfo: f => hexInfo(f),
  handeln: (g, art, id) => { const r = sim.handeln(S, g, art, id); allesZeichnen(); return r; },
  ansicht: a => { ansicht = a; ansichtZeichnen(); return sim.ansicht(S, welt, a); },
};
