// Städte Roms – Ton (S1.6): Musik „rom_ant“ aus dem Hauptspiel (MusicGen, audio/st_rom.json), Umgebung und Geräusche
// per WebAudio erzeugt (wie sfx() im Hauptspiel). Startet mit der ersten Berührung (Browser-Regel).
const PFADE = ['../audio/st_rom.json', '../../audio/st_rom.json'];
const SCHALTER = 'staedte_roms.ton';

let ac = null, musik = null, geraeusch = null, rauschen = null, an = true, musikLaeuft = false;
const zuletzt = {};
try { an = localStorage.getItem(SCHALTER) !== 'aus'; } catch (e) { /* ohne Speicher: an */ }

function rauschPuffer() {
  const b = ac.createBuffer(1, ac.sampleRate, ac.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return b;
}
// Kurzer gefilterter Rauschstoß (Holz, Schritte, Wind)
function stoss({ t, f, q = 1, dauer, v, typ = 'bandpass', ziel = geraeusch }) {
  const s = ac.createBufferSource(); s.buffer = rauschen;
  const fl = ac.createBiquadFilter(); fl.type = typ; fl.frequency.value = f; fl.Q.value = q;
  const g = ac.createGain(); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dauer);
  s.connect(fl); fl.connect(g); g.connect(ziel); s.start(t, Math.random() * 0.5); s.stop(t + dauer + 0.05);
}
// Ton mit Zupf-Hüllkurve
function ton({ t, f, f2, dauer, v, typ = 'triangle', a = 0.004, ziel = geraeusch }) {
  const o = ac.createOscillator(); o.type = typ; o.frequency.setValueAtTime(f, t);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dauer);
  const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dauer);
  o.connect(g); g.connect(ziel); o.start(t); o.stop(t + dauer + 0.05);
}
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

async function musikLaden() {
  for (const url of PFADE) {
    try {
      const r = await fetch(url); if (!r.ok) continue;
      const b64 = (await r.json()).rom_ant, bin = atob(b64), buf = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
      return await ac.decodeAudioData(buf.buffer);
    } catch (e) { /* nächster Pfad */ }
  }
  return null;
}

function starten() {
  if (ac) { if (ac.state !== 'running') ac.resume().catch(() => {}); return; }
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
  ac = new AC(); rauschen = rauschPuffer();
  const haupt = ac.createGain(); haupt.gain.value = an ? 1 : 0; haupt.connect(ac.destination); starten.haupt = haupt;
  musik = ac.createGain(); musik.gain.value = 0; musik.connect(haupt);
  geraeusch = ac.createGain(); geraeusch.gain.value = 0.7; geraeusch.connect(haupt);
  // Umgebung: leiser Wind, langsam schwankend
  const w = ac.createBufferSource(); w.buffer = rauschen; w.loop = true;
  const wf = ac.createBiquadFilter(); wf.type = 'lowpass'; wf.frequency.value = 380;
  const wg = ac.createGain(); wg.gain.value = 0.018;
  const lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = 0.07; lg.gain.value = 0.01;
  lfo.connect(lg); lg.connect(wg.gain); w.connect(wf); wf.connect(wg); wg.connect(geraeusch); w.start(); lfo.start();
  setInterval(() => { if (ac.state === 'running' && Math.random() < 0.12) sfx('vogel'); }, 1500);
  musikLaden().then(puffer => {
    if (!puffer) return;
    const s = ac.createBufferSource(); s.buffer = puffer; s.loop = true; s.connect(musik); s.start();
    musik.gain.setValueAtTime(0, ac.currentTime); musik.gain.linearRampToValueAtTime(0.32, ac.currentTime + 4);
    musikLaeuft = true;
  });
}
['pointerdown', 'keydown'].forEach(ev => document.addEventListener(ev, starten, { passive: true }));

const JAHRESZEIT_AKKORD = [[60, 64, 67, 72, 76], [62, 66, 69, 74, 78], [57, 60, 64, 69, 72], [50, 53, 57, 62, 65]];

export function sfx(name, arg) {
  if (!ac || !an || ac.state !== 'running') return;
  const t = ac.currentTime;
  if (zuletzt[name] && t - zuletzt[name] < (name === 'strasse' ? 0.07 : 0.15)) return;
  zuletzt[name] = t;
  switch (name) {
    case 'bauen':   // drei Hammerschläge auf Holz
      [0, 0.18, 0.36].forEach((x, i) => { stoss({ t: t + x, f: 1500 + i * 120, q: 2.2, dauer: 0.09, v: 0.5 }); ton({ t: t + x, f: 380, f2: 260, dauer: 0.11, v: 0.18, typ: 'sine' }); });
      break;
    case 'strasse': stoss({ t, f: 900 + Math.random() * 300, q: 1.2, dauer: 0.07, v: 0.25 }); break;
    case 'abreissen': stoss({ t, f: 300, q: 0.7, dauer: 0.6, v: 0.45, typ: 'lowpass' }); stoss({ t: t + 0.1, f: 1200, q: 1, dauer: 0.4, v: 0.2 }); break;
    case 'aufstieg': [0, 0.07, 0.15].forEach((x, i) => ton({ t: t + x, f: [2100, 2600, 3150][i], dauer: 0.3, v: 0.08, typ: 'sine' })); break;
    case 'jahreszeit': (JAHRESZEIT_AKKORD[arg] || JAHRESZEIT_AKKORD[0]).forEach((m, i) => ton({ t: t + i * 0.1, f: mtof(m), dauer: 1.8, v: 0.12 })); break;
    case 'fehler': ton({ t, f: 150, dauer: 0.18, v: 0.07, typ: 'square' }); break;
    case 'feuer':   // Knistern: kurze Rauschstöße
      for (let i = 0; i < 9; i++) stoss({ t: t + i * 0.09 + Math.random() * 0.05, f: 1800 + Math.random() * 2500, q: 2, dauer: 0.05, v: 0.12 });
      stoss({ t, f: 220, q: 0.6, dauer: 1.0, v: 0.18, typ: 'lowpass' }); break;
    case 'ereignis':   // Hornruf (tuba): zwei Töne
      ton({ t, f: 196, dauer: 0.45, v: 0.1, typ: 'sawtooth' }); ton({ t: t + 0.42, f: 294, dauer: 0.7, v: 0.1, typ: 'sawtooth' }); break;
    case 'fest':   // Leier: aufsteigender Dreiklang
      [0, 4, 7, 12].forEach((m, i) => ton({ t: t + i * 0.12, f: mtof(62 + m), dauer: 1.2, v: 0.1 })); break;
    case 'klick': ton({ t, f: 880, f2: 620, dauer: 0.07, v: 0.06, typ: 'sine' }); break;
    case 'vogel': { const f = 2400 + Math.random() * 1400; for (let i = 0; i < 2 + Math.floor(Math.random() * 3); i++) ton({ t: t + i * 0.11, f, f2: f * 1.25, dauer: 0.08, v: 0.012, typ: 'sine', a: 0.005 }); break; }
  }
}

export const istAn = () => an;
export function schalten() {
  an = !an;
  try { localStorage.setItem(SCHALTER, an ? 'an' : 'aus'); } catch (e) { /* egal */ }
  starten();
  if (starten.haupt) starten.haupt.gain.setTargetAtTime(an ? 1 : 0, ac.currentTime, 0.1);
  return an;
}
export const zustand = () => ({ laeuft: !!ac && ac.state === 'running', musik: musikLaeuft, an });
