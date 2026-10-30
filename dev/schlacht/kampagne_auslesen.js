// Liest die Einheiten-Tabellen der Kampagne aus dev/imperium.html und schreibt dev/schlacht/kampagne_einheiten.json.
// So bleibt die Echtzeitschlacht an die Kampagnenwerte gebunden (eine Quelle). Aufruf: node dev/schlacht/kampagne_auslesen.js
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'imperium.html'), 'utf8');

function literal(name) {   // findet "const NAME=" und liest das folgende {…} bzw. […] mit Klammerzählung
  let i = html.indexOf('const ' + name + '='), lang = ('const ' + name + '=').length;
  if (i < 0) { const m = new RegExp('[,\\s]' + name + '=[\\[{]').exec(html); if (m) { i = m.index + 1; lang = name.length + 1; } }   // Teil einer Sammelzeile „const A=[…],B=[…]“
  if (i < 0) throw new Error('nicht gefunden: ' + name);
  let j = i + lang; const auf = html[j], zu = auf === '{' ? '}' : ']';
  let tiefe = 0, k = j, str = null;
  for (; k < html.length; k++) {
    const c = html[k];
    if (str) { if (c === '\\') { k++; continue; } if (c === str) str = null; continue; }
    if (c === "'" || c === '"' || c === '`') { str = c; continue; }
    if (c === auf) tiefe++; else if (c === zu && --tiefe === 0) break;
  }
  // Verweise auf andere Konstanten (z. B. Kulturgruppen wie STEPPE) beim Auswerten nachschlagen
  const scope = new Proxy({}, { has: (_, n) => typeof n === 'string' && /^[A-Z][A-Z0-9_]*$/.test(n), get: (_, n) => typeof n !== 'string' ? undefined : (GEFUNDEN[n] = GEFUNDEN[n] || literal(n)) });
  return Function('scope', 'with(scope){return (' + html.slice(j, k + 1) + ');}')(scope);
}
const GEFUNDEN = {};

const daten = {
  quelle: 'dev/imperium.html (ROLES, VARIANTS, UNIT_MOD, EPOCH_STR, EPOCH_COST)', erstellt: new Date().toISOString().slice(0, 10),
  ROLES: literal('ROLES'), VARIANTS: literal('VARIANTS'), UNIT_MOD: literal('UNIT_MOD'),
  EPOCH_STR: literal('EPOCH_STR'), EPOCH_COST: literal('EPOCH_COST'),
  GRUPPEN: GEFUNDEN,
  FERN_EPOCHE: [1, 1, 1, 1.25, 1.4],   // Zusatzfaktor Fernkampf je Epoche (unitStat, Feuerwaffen)
};
fs.writeFileSync(path.join(__dirname, 'kampagne_einheiten.json'), JSON.stringify(daten, null, 1));
console.log('Rollen', Object.keys(daten.ROLES).length, 'Sondereinheiten', Object.keys(daten.VARIANTS).length, 'Volks-Anpassungen', Object.keys(daten.UNIT_MOD).length);
