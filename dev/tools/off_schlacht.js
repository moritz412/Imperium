// I5 (31.10.): trägt die Dateien der neuen Echtzeitschlacht (dev/proto -> proto/ in der Web-App) in OFF_MAN ein:
// Figurenpakete, Umgebung, Einheitendaten, Schlachtgeräusche/-musik. Vorhandene proto/-Einträge werden ersetzt, Größen neu gemessen.
// Aufruf im Repo-Wurzelordner: node dev/tools/off_schlacht.js [--ver]   (--ver erhöht OFF_VER um eins)
const fs = require('fs'), path = require('path');
const R = path.join(__dirname, '..'), H = path.join(R, 'imperium.html'), P = path.join(R, 'proto');
let s = fs.readFileSync(H, 'utf8');
const m = s.match(/const OFF_MAN=(\[.*?\]\]),OFF_VER='([^']*)'/);
if (!m) throw new Error('OFF_MAN nicht gefunden');
const man = JSON.parse(m[1]).filter(([p]) => !p.startsWith('proto/'));
const neu = [['proto/einheiten_kampagne.json', fs.statSync(path.join(P, 'einheiten_kampagne.json')).size]];
for (const f of fs.readdirSync(path.join(P, 'figuren')).sort()) if (/^(k_.*|umgebung)\.json$/.test(f)) neu.push(['proto/figuren/' + f, fs.statSync(path.join(P, 'figuren', f)).size]);
for (const f of fs.readdirSync(path.join(P, 'ton')).sort()) if (/\.mp3$/.test(f)) neu.push(['proto/ton/' + f, fs.statSync(path.join(P, 'ton', f)).size]);
let ver = m[2];
if (process.argv.includes('--ver')) ver = ver.replace(/(\d+)(?!.*\d)/, d => String(+d + 1));
const alt = JSON.stringify(man.concat(neu)).replace(/\],\[/g, '], [').replace(/",(\d)/g, '", $1');
s = s.replace(m[0], `const OFF_MAN=${alt},OFF_VER='${ver}'`);
fs.writeFileSync(H, s);
const mb = neu.reduce((a, [, b]) => a + b, 0) / 1048576;
console.log('OFF_MAN: Schlachtdateien', neu.length, '·', mb.toFixed(1), 'MB · OFF_VER', ver);
