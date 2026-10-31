// Balance-Lauf (1.11.): fester Bauplan, gebaut sobald bezahlbar; druckt Kennzahlen je Halbjahr und Ereignisse.
// Aufruf: Ordner mit Kopien von ../js/sim.js und ../js/daten.js plus package.json {"type":"module"}, dann `node balance_lauf.js`.
import * as sim from './sim.js';
const welt = sim.erzeugeWelt(), S = sim.neuesSpiel();
const str = [];
for (let x = 14; x <= 25; x++) str.push([x, 16]);
for (let x = 9; x <= 26; x++) str.push([x, 19]);
for (let z = 13; z <= 15; z++) str.push([14, z]);
for (let z = 17; z <= 18; z++) str.push([15, z]);
const plan = [...str.slice(0, 15).map(([x, z]) => ['strasse', x, z]), ['huette', 16, 14], ['huette', 19, 14], ['holzfaeller', 4, 10], ...str.slice(15).map(([x, z]) => ['strasse', x, z]), ['feld', 9, 20],
  ['huette', 16, 17], ['muehle', 13, 20], ['baeckerei', 16, 20], ['lehmgrube', 20, 20], ['ziegelei', 23, 20], ['brunnen', 19, 17],
  ['huette', 22, 14], ['markt', 20, 9], ['huette', 26, 13], ['huette', 28, 13], ['feld', 22, 21], ['huette', 10, 10], ['huette', 12, 10],
  ['ludus', 30, 13], ['huette', 25, 9], ['wache', 32, 13], ['huette', 14, 10], ['speicher', 34, 13], ['huette', 16, 9]];
const ziele = {}; let i = 0;
const merk = (n, ok) => { if (ok && ziele[n] === undefined) ziele[n] = S.monat; };
const fs = sim.forschungS(S); fs.ziel = 'fruchtwechsel';
for (let m = 0; m < 60; m++) {
  while (i < plan.length) { const [t, x, z] = plan[i]; const r = sim.bauen(S, welt, t, x, z); if (r.ok || /schon|Wald|Fluss|Straße vor/.test(r.grund)) { if (!r.ok) console.log('übersprungen', t, x, z, r.grund); i++; } else break; }
  if (!fs.ziel) { const offen = Object.keys(sim.FORSCHUNG || {}).length; }
  const meld = sim.monat(S, welt);
  if (!sim.forschungS(S).ziel) { for (const id of ['ziegelbrand', 'steuerlisten', 'schotter', 'schreine', 'bauhuette', 'landvermessung', 'toepferscheibe', 'feste', 'villa']) if (sim.forschungWaehlen(S, id).ok) break; }
  meld.filter(t => /Feuer|abgebrannt|hungern|Casa|ist jetzt|Erforscht|Abgaben|Räuber|Gallier/.test(t)).forEach(t => console.log(`  M${S.monat} ${t}`));
  merk('Bauplan fertig', i >= plan.length); merk('Dorf (40)', sim.rang(S) >= 1); merk('Kleinstadt (120)', sim.rang(S) >= 2); merk('erste Casa', S.geb.some(b => b.stufe === 2));
  if (S.monat % 6 === 0) console.log(`Monat ${S.monat} (${sim.datumText(S)}): Einw ${sim.einwohner(S)}, Denare ${Math.round(S.gut.denare)}, Holz ${Math.round(S.gut.holz)}, Ziegel ${Math.round(S.gut.ziegel)}, Getreide ${Math.round(S.gut.getreide)}, Brot ${Math.round(S.gut.brot)}, Stimmung ${Math.round(S.stimmung)}, Plan ${i}/${plan.length}, Aufträge ${S.auftrag}, erforscht ${sim.forschungS(S).fertig.length}`);
}
console.log('Meilensteine (Spielmonat):', JSON.stringify(ziele), '· 1 Monat = 15 s →', Object.entries(ziele).map(([k, v]) => `${k}: ${Math.round(v * 15 / 60)} min`).join(', '));
