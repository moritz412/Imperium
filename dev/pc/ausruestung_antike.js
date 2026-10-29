// Job 44: FLUX-Vorlagen für TRELLIS-Ausrüstungsteile der Antike (Kits A1–A8, schlacht_umsetzung.md 5.4).
// Aufruf: node dev\pc\ausruestung_antike.js _neu\44_ausruestung_antike\items.json
// Nur feste Teile (Helm, Schild, Schwert, Beutel, Brustplatte). Lange dünne Teile (Speer, Pilum, Sarissa,
// Schleuder, Treiberstachel) und mitbewegte Stoffe (Kettenhemd, Linothorax, Tunika, Elefantendecke) kommen aus Blender.
// Namen nach figuren_bauen.md: teil_<art>_<kit>_<name>.
const fs = require('fs');
const out = process.argv[2] || 'items.json';
const TEILE = [
  ['teil_helm_A1_montefortino', 'a bronze Montefortino helmet of the Roman Republic, rounded bowl with top knob holding a tall upright black and red horsehair crest, short neck guard, hinged cheek pieces'],
  ['teil_ruest_A1_pectorale', 'a square bronze chest plate (pectorale) of a Roman hastatus, about 20 cm wide, with leather straps'],
  ['teil_schild_A1_scutum', 'a large curved oval Roman scutum shield, red painted wood with a central iron boss and vertical wooden spine, front view at a slight angle'],
  ['teil_schwert_A1_gladius', 'a Roman gladius hispaniensis short sword in its scabbard, straight double-edged blade, wooden grip with round pommel, lying flat'],
  ['teil_helm_A2_libysch', 'a plain conical bronze pilos helmet of a Libyan spearman of Carthage, simple smooth cone with a small rim'],
  ['teil_schild_A2_rund', 'a large round wooden shield of a Carthaginian Libyan infantryman, about 90 cm, plain bronze rim, undecorated ochre painted face'],
  ['teil_helm_A3_sehnen', 'an ancient Iberian sinew helmet, close-fitting cap of dark woven sinew with a small crest, simple and rustic'],
  ['teil_schild_A3_caetra', 'a small round Iberian caetra shield, about 50 cm, leather over wood with a central metal boss and simple geometric decoration'],
  ['teil_schild_A3_scutum', 'a flat long oval Iberian scutarius shield, wood covered with hide, central spine and iron boss, white and dark red painted'],
  ['teil_schwert_A3_falcata', 'an Iberian falcata sword, single-edged forward-curved blade, hooked hilt shaped like a bird head, lying flat'],
  ['teil_beutel_A4_schleuder', 'a small leather pouch for sling stones of a Balearic slinger, tied with a cord, a few lead sling bullets next to it'],
  ['teil_schild_A5_rund', 'a small round hide shield of a Numidian light horseman, about 45 cm, plain brown leather with a simple handle'],
  ['teil_helm_A6_kelt', 'a Celtic bronze helmet of the 3rd century BC, Montefortino-like bowl with a top knob and small cheek pieces, decorated with simple La Tene spiral engraving'],
  ['teil_schild_A6_oval', 'a long narrow oval Celtic shield, flat wooden planks covered with leather, vertical spine with a strip iron boss, painted in dark green with a simple pattern'],
  ['teil_schwert_A6_lang', 'a Celtic La Tene long sword in an iron scabbard, long straight blade with rounded tip, simple grip, lying flat'],
  ['teil_helm_A7_thraker', 'a bronze Thracian helmet of the Hellenistic period, high forward-curving apex, peak over the brow, large cheek pieces, small crest holder'],
  ['teil_schild_A7_aspis', 'a round Greek hoplite aspis shield, about 90 cm, deeply dished, bronze faced with a wide flat rim, plain without emblem'],
  ['teil_schild_A7_thureos', 'an oval Hellenistic thureos shield, wood covered with leather, vertical spine and central metal boss, plain off-white'],
];
// Job 45: Neuversuch der 5 Teile, die in Job 44 falsch kamen (Aufruf mit zweitem Argument 45, je 3 Varianten).
const NEU45 = [
  ['teil_helm_A2_libysch', 'a very simple plain bronze pilos helmet, a smooth tall cone like an upturned bowl or felt cap shape, no cheek pieces, no visor, no face guard, no crest, open face, only a narrow rim at the bottom'],
  ['teil_ruest_A1_pectorale', 'a single small flat square bronze plate, about 20 by 20 cm, with two leather shoulder straps attached to its top corners, worn on the chest by Roman hastati; not a cuirass, not a vest, only one small square plate, lying flat'],
  ['teil_schild_A1_scutum', 'a tall curved Roman scutum shield of the Republic, much taller than wide, about 120 cm high and 65 cm wide, long oval shape, curved like a section of a cylinder, red painted, with a vertical wooden spine (spina) and an iron boss in the centre; not round, lying flat on its back'],
  ['teil_schwert_A1_gladius', 'a Roman gladius hispaniensis, short straight double-edged blade about 60 cm with a long pointed tip, a rounded wooden hand guard shaped like a small oval disc instead of any crossguard, ribbed bone grip, spherical wooden pommel; no crossguard, no quillons, lying flat'],
  ['teil_schwert_A3_falcata', 'an Iberian falcata, a single-edged sword with a strongly curved blade that bends forward like a kukri, widest near the tip, concave near the hilt, the hilt curls back into a hook shaped like a horse or bird head protecting the knuckles; not straight, no crossguard, lying flat'],
];
module.exports = TEILE;
if (require.main !== module) return;
const JOB45 = process.argv[3] === '45';
const STIL =', a single isolated object, realistic museum reproduction based on archaeological finds, worn but complete, no person, no hands, no stand, no base, no ground, three-quarter view from slightly above, plain light grey background, soft studio lighting, no text, no writing';
const items = [];
const LISTE = JOB45 ? NEU45 : TEILE, VAR = JOB45 ? ['a', 'b', 'c'] : ['a', 'b'];
LISTE.forEach(([id, p], i) => VAR.forEach((v, j) =>
  items.push({ f: id + '_' + v, p: p + STIL, r: '1:1', g: JOB45 ? '45 Ausruestung Antike neu' : '44 Ausruestung Antike', ext: 'png', seed: (JOB45 ? 45000 : 44000) + i * 10 + j })));
fs.writeFileSync(out, JSON.stringify(items, null, 1));
console.log(items.length + ' Bilder (' + LISTE.length + ' Teile × ' + VAR.length + ')');
