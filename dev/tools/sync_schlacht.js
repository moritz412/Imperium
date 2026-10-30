// Gleicht den Schlachtkern aus dev/proto/schlacht_spiel.html (Quelle) in dev/imperium.html ab: nur Text zwischen den ESCH-Markierungen.
// Aufruf im Repo-Wurzelordner: node dev/tools/sync_schlacht.js   (danach chkf.sh für beide Dateien)
const fs = require('fs'), path = require('path'), R = path.join(__dirname, '..') + path.sep;
const P = fs.readFileSync(R + 'proto/schlacht_spiel.html', 'utf8').replace(/\r\n/g, '\n');
let I = fs.readFileSync(R + 'imperium.html', 'utf8'); const CR = I.includes('\r\n'); I = I.replace(/\r\n/g, '\n');
const teil = (s, a, b) => { const i = s.indexOf(a), j = s.indexOf(b); if (i < 0 || j < i) throw new Error('Quelle: ' + a); return s.slice(i + a.length, j); };
const setze = (a, b, x) => { const i = I.indexOf(a), j = I.indexOf(b); if (i < 0 || j < i) throw new Error('Ziel: ' + a); I = I.slice(0, i + a.length) + x + I.slice(j); };
let n = 0;
for (const [a, b] of [['/*ESCH-CSS-BEGIN*/', '/*ESCH-CSS-END*/'], ['<!--ESCH-DEFS-BEGIN-->', '<!--ESCH-DEFS-END-->'], ['<!--ESCH-DOM-BEGIN-->', '<!--ESCH-DOM-END-->'], ['//ESCH-KERN-BEGIN', '//ESCH-KERN-END']]) {
  const x = teil(P, a, b); if (teil(I, a, b) !== x) n++; setze(a, b, x);
}
fs.writeFileSync(R + 'imperium.html', CR ? I.replace(/\n/g, '\r\n') : I);
console.log('Schlachtkern abgeglichen, geänderte Abschnitte:', n);
