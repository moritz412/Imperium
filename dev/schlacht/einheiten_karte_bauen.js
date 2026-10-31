// Baut dev/proto/einheiten_kampagne.json: Kampagnenwerte + Zuordnung Einheit -> Kit-Familie, Bild, vorhandenes Figurenpaket.
// Stufe E1 (dev/docs/schlacht_einheiten.md): jede Kampagnen-Einheit bekommt eine Echtzeit-Einheit; fehlt ein eigenes Paket,
// greift die Rückfallkette Kit-Familie -> Rolle. Aufruf: node dev/schlacht/einheiten_karte_bauen.js
const fs = require('fs'), path = require('path');
const K = require('./kampagne_einheiten.json'), P = require('./profile_truppen.json');
const html = fs.readFileSync(path.join(__dirname, '..', 'imperium.html'), 'utf8');
const SHEET = html.match(/U_SHEET=\[([^\]]*)\]/)[1].split(',').map(s => s.trim().replace(/'/g, ''));

// Vorhandene Figurenpakete (dev/proto/figuren/k_<id>.json) und welche Kit-Familie bzw. Rolle sie vertreten dürfen
const PAKETE = {
  A1_hastatus: { familien: ['A1_roemisch_manipel'], rollen: ['sword', 'spear'] },
  A1_veles: { familien: ['A1_roemisch_manipel'], rollen: ['missile'] },
  A2_libysch: { familien: ['A2_punisch_libysch'], rollen: ['spear'] },
  A3_iberisch: { familien: ['A3_iberisch'], rollen: ['sword', 'spear'] },
  A4_balearisch: { familien: ['A4_balearisch'], rollen: ['missile'] },
  A6_keltisch: { familien: ['A6_keltisch'], rollen: ['sword', 'spear'] },
  A7_hellenistisch: { familien: ['A7_hellenistisch'], rollen: ['spear', 'sword'] },
  A7_toxotes: { familien: ['A7_hellenistisch'], rollen: ['missile'] },
  A6_plaenkler: { familien: ['A6_keltisch'], rollen: ['missile'] },
  A7_phalangit: { familien: [], rollen: [] },
  A7_hoplit: { familien: [], rollen: [] },
  // Reiterei (30.10.): Reiterpakete sitzen auf k_P_pferd
  A1_eques: { familien: ['A1_roemisch_manipel', 'A7_hellenistisch', 'A6_keltisch'], rollen: ['cav'] },
  A2_numidisch: { familien: ['A5_numidisch'], rollen: ['cav'] },
  A1_legion: { familien: [], rollen: [] }, A6_adlig: { familien: [], rollen: [] }, A6_falx: { familien: [], rollen: [] },
  A8_nubisch: { familien: [], rollen: [] }, A8_aksum: { familien: ['M4_afrika'], rollen: ['spear'] },
  // Frühmittelalter (31.10., F4): Nordwest (Heerbann, Huskarl, Bogen, Panzerreiter) und Ostrom/Orient (Skutatos, Thematen, Toxotes, Kataphrakt)
  M1_heerbann: { familien: ['M1_nordwest_fuss'], rollen: ['spear'] }, M1_huskarl: { familien: ['M1_nordwest_fuss'], rollen: ['sword'] },
  M1_bogen: { familien: ['M1_nordwest_fuss'], rollen: ['missile'] }, M1_panzerreiter: { familien: ['M1_nordwest_fuss'], rollen: ['cav'] },
  M3_skutatos: { familien: ['M3_ostrom_orient_steppe'], rollen: ['spear'] }, M3_thematen: { familien: ['M3_ostrom_orient_steppe'], rollen: ['sword'] },
  M3_toxotes: { familien: ['M3_ostrom_orient_steppe'], rollen: ['missile'] }, M3_kataphrakt: { familien: ['M3_ostrom_orient_steppe'], rollen: ['cav'] },
};
const ROLLE_RUECKFALL = { spear: 'A2_libysch', sword: 'A1_hastatus', missile: 'A1_veles', cav: 'A1_eques', art: 'A1_hastatus' };

// Einzelne Einheiten mit eigenem Paket (E2), vor der Familienregel
const EIGEN = { phalanx: 'A7_phalangit', hoplit: 'A7_hoplit', basis_hellen_e0_spear: 'A7_hoplit', bogen: 'A7_toxotes', basis_hellen_e0_missile: 'A7_toxotes', speerw: 'A6_plaenkler',
  legion: 'A1_legion', evocati: 'A1_legion', soldurii: 'A6_adlig', galater: 'A6_adlig', falx: 'A6_falx', nubbow: 'A8_nubisch', habbog: 'A8_nubisch', aksumsp: 'A8_aksum' };
function paketFuer(kit, rolle, id) {
  if (EIGEN[id]) return { paket: EIGEN[id], genau: true };
  for (const [id, p] of Object.entries(PAKETE)) if (p.familien.includes(kit) && p.rollen.includes(rolle)) return { paket: id, genau: true };
  for (const [id, p] of Object.entries(PAKETE)) if (p.familien.includes(kit)) return { paket: id, genau: false };
  return { paket: ROLLE_RUECKFALL[rolle] || 'A1_hastatus', genau: false };
}

const profile = {};
for (const t of P) {
  const sonder = !t.id.startsWith('basis_');
  const bild = sonder && SHEET.includes(t.id) ? t.id : null;   // Kampagnenbild aus u_sheet (Sondereinheiten); Grundeinheiten: u_e<N>_<rolle>
  const pk = paketFuer(t.kit, t.rolle, t.id);
  const elef = t.kit === 'A8_elefant_karthagisch';   // Kriegselefanten (30.10.): Treiber = Reiterpaket A2_numidisch, Reittier = Paket E_elefant
  if (elef) { pk.paket = 'A2_numidisch'; pk.genau = true; }
  profile[t.id] = { n: t.n, rolle: t.rolle, kit: t.kit, kulturen: t.kulturen, epochen: t.epochen, figuren: t.figuren, formation: t.standard,
    bild, sheet: bild ? SHEET.indexOf(bild) : -1, paket: pk.paket, paketGenau: pk.genau, ...(elef ? { reittier: 'E_elefant' } : {}) };
}
const V = {};
for (const [k, v] of Object.entries(K.VARIANTS)) V[k] = { role: v.role, ep: v.ep, e1: v.e1, g: v.g, n: v.n, m: v.m, b: v.b || {}, d: v.d };
const out = { quelle: 'dev/imperium.html via kampagne_einheiten.json + profile_truppen.json', erstellt: new Date().toISOString().slice(0, 10),
  ROLES: K.ROLES, UNIT_MOD: K.UNIT_MOD, EPOCH_STR: K.EPOCH_STR, FERN_EPOCHE: K.FERN_EPOCHE, GRUPPEN: K.GRUPPEN, VARIANTS: V,
  SHEET_SPALTEN: 8, SHEET_PX: 192, profile };
fs.writeFileSync(path.join(__dirname, '..', 'proto', 'einheiten_kampagne.json'), JSON.stringify(out));
const n = Object.values(profile), genau = n.filter(p => p.paketGenau).length;
console.log('Profile', n.length, '· eigenes/familiengenaues Paket', genau, '· Rückfall', n.length - genau, '· mit Kampagnenbild', n.filter(p => p.bild).length,
  '· Größe', (fs.statSync(path.join(__dirname, '..', 'proto', 'einheiten_kampagne.json')).size / 1024).toFixed(0), 'KB');
