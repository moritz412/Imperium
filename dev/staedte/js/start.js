// Städte Roms – Startseite mit Regionswahl (S1.5): Italienkarte, Regionskarte, Knöpfe in einer Spalte
import { REGIONEN } from './daten.js';

// Grobe Umrisse (Länge, Breite) für die Karte, Projektion einfach linear
const P = (lon, lat) => [((lon - 6.3) * 26).toFixed(1), ((47.4 - lat) * 32).toFixed(1)];
const UMRISSE = [
  // Festland
  [[7.0, 45.9], [8.5, 46.4], [10.5, 46.6], [12.2, 47.0], [13.7, 46.5], [13.6, 45.6], [12.3, 45.3], [12.5, 44.2], [13.6, 43.6],
   [14.4, 42.4], [15.1, 41.95], [16.2, 41.9], [15.9, 41.5], [17.0, 41.1], [18.0, 40.6], [18.5, 40.1], [18.3, 39.8], [17.2, 40.4],
   [16.6, 40.1], [17.1, 39.0], [16.5, 38.4], [15.7, 37.95], [15.6, 38.3], [16.0, 39.0], [15.6, 40.0], [14.9, 40.3], [14.3, 40.6],
   [14.0, 40.8], [13.0, 41.25], [12.2, 41.7], [11.0, 42.4], [10.5, 43.0], [10.3, 43.6], [10.0, 44.0], [9.0, 44.3], [8.0, 43.9],
   [7.5, 43.8], [7.0, 44.2], [6.8, 45.0]],
  [[12.4, 37.8], [13.3, 38.2], [15.6, 38.3], [15.1, 37.3], [15.1, 36.7], [14.3, 37.0], [12.6, 37.6]],            // Sizilien
  [[8.4, 41.0], [9.6, 41.1], [9.8, 40.1], [9.6, 39.2], [8.9, 38.9], [8.4, 39.1], [8.4, 40.3]],                    // Sardinien
  [[9.4, 43.0], [9.6, 42.1], [9.2, 41.4], [8.6, 41.9], [8.7, 42.6]],                                              // Korsika
];
// Flüsse Padus und Tiberis als Linien
const FLUESSE = [[[7.6, 45.0], [9.0, 45.1], [10.0, 45.1], [11.0, 45.0], [12.2, 44.95]], [[12.0, 43.7], [12.4, 43.0], [12.5, 42.3], [12.3, 41.75]]];

const $ = s => document.querySelector(s);

export function startseite({ hatStand, weiter, gruenden }) {
  let wahl = REGIONEN[0];
  const pfad = pts => 'M' + pts.map(([a, b]) => P(a, b).join(',')).join('L');
  const karte = `<svg viewBox="0 0 322 350" class="italien" role="group" aria-label="Karte Italiens">
    ${UMRISSE.map(u => `<path class="land" d="${pfad(u)}Z"/>`).join('')}
    ${FLUESSE.map(f => `<path class="fluss" d="${pfad(f)}"/>`).join('')}
    <g class="roma"><path d="M${P(12.5, 41.9).join(',')}m0,-6l1.8,4.2 4.4,.3 -3.4,2.9 1.1,4.3 -3.9,-2.4 -3.9,2.4 1.1,-4.3 -3.4,-2.9 4.4,-.3z"/>
      <text x="${+P(12.5, 41.9)[0] - 10}" y="${+P(12.5, 41.9)[1] + 16}">Roma</text></g>
    ${REGIONEN.map(r => { const [x, y] = P(r.lon, r.lat);
      return `<g class="ort${r.aktiv ? ' aktiv' : ''}" data-r="${r.id}" tabindex="0" role="button" aria-label="${r.n}, ${r.stadt}">
        <circle class="ring" cx="${x}" cy="${y}" r="15"/><circle cx="${x}" cy="${y}" r="8"/>
        <text x="${x}" y="${y - 19}" text-anchor="middle">${r.stadt}</text></g>`; }).join('')}
  </svg>`;
  const el = $('#startseite');
  // Hintergrundbild aus dem Hauptspiel: veröffentlicht unter ../img, in der Entwicklung unter ../../img
  (function bild(pfade) {
    if (!pfade.length) return;
    const i = new Image(); i.onload = () => el.style.setProperty('--startbild', `url(${pfade[0]})`); i.onerror = () => bild(pfade.slice(1));
    i.src = pfade[0];
  })(['../img/ep_0.webp', '../../img/ep_0.webp']);
  el.innerHTML = `<div class="startrahmen feld">
    <div class="startkarte">${karte}</div>
    <div class="startspalte">
      <h1>Städte Roms</h1><div class="untertitel">Imperium der Epochen</div>
      <div id="regionKarte"></div>
      <div class="startknoepfe"></div>
    </div></div>`;
  function zeichnen() {
    el.querySelectorAll('.ort').forEach(g => g.classList.toggle('gewaehlt', g.dataset.r === wahl.id));
    $('#regionKarte').innerHTML = `<div class="region${wahl.aktiv ? '' : ' gesperrt'}">
      <h2>${wahl.n}</h2>
      <div class="ortzeile"><b>${wahl.stadt}</b> · gegründet ${wahl.gruendung}</div>
      <p>${wahl.text}</p>
      <div class="zeile"><span>Rohstoffe</span><b>${wahl.roh}</b></div>
      <div class="zeile"><span>Schwierigkeit</span><b>${wahl.schwer}</b></div>
      ${wahl.aktiv ? '' : '<div class="schloss">🔒 Diese Provinz öffnet sich in einer späteren Ausbaustufe.</div>'}</div>`;
    const k = [];
    if (hatStand() && wahl.aktiv) k.push(`<button class="knopf haupt" data-s="weiter">Weiterspielen</button>`);
    if (wahl.aktiv) k.push(`<button class="knopf${hatStand() ? '' : ' haupt'}" data-s="neu">${hatStand() ? `${wahl.stadt} neu gründen` : `${wahl.stadt} gründen`}</button>`);
    else k.push(`<button class="knopf" disabled>${wahl.stadt} noch nicht wählbar</button>`);
    el.querySelector('.startknoepfe').innerHTML = k.join('');
  }
  el.addEventListener('click', e => {
    const ort = e.target.closest('.ort');
    if (ort) { wahl = REGIONEN.find(r => r.id === ort.dataset.r); zeichnen(); return; }
    const b = e.target.closest('[data-s]'); if (!b) return;
    if (b.dataset.s === 'weiter') { el.hidden = true; weiter(); }
    if (b.dataset.s === 'neu') {
      if (hatStand() && !confirm(`${wahl.stadt} neu gründen? Der bisherige Stand geht verloren.`)) return;
      el.hidden = true; gruenden(wahl);
    }
  });
  el.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('.ort')) e.target.closest('.ort').dispatchEvent(new MouseEvent('click', { bubbles: true })); });
  return { zeigen() { wahl = REGIONEN[0]; zeichnen(); el.hidden = false; } };
}
