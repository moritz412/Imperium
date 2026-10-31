// Städte Roms – 3D-Szene: feste Schrägsicht (orthografisch), Gelände, Gebäude, Vorschau, Problem-Symbole
import { RASTER, GEB, CASA, JAHRESZEITEN, REGION_TYPEN } from './daten.js';
import { WALD, WASSER, groesse, strassenMaske, randFelder, erzeugeRegion, landStand, landKey, hatWeg, nachbarn, wegPfad } from './sim.js';
import { LAND_BETRIEBE } from './daten.js';

const THREE = window.THREE;
const BLICK = new THREE.Vector3(1, 1.05, 1).normalize();   // feste Blickrichtung (Azimut 45°, ca. 37° Höhe)
const RAHMEN = 11;
const REG_X = 200;                                            // Umland liegt neben der Stadt in derselben Szene                                            // halbe Bildhöhe in Feldern bei Zoom 1
// Gebäudemodelle (S1.1) aus dev/pc/blender/staedte_geb.py, gemeinsam mit dem Hauptspiel in models/.
// Liegt unter /staedte/ (veröffentlicht) bzw. /dev/staedte/ (Entwicklung) – daher zwei Pfade.
const MODELL_PFADE = ['../models/staedte_geb.json', '../../models/staedte_geb.json'];

async function ladeModelle() {
  for (const url of MODELL_PFADE) {
    try {
      const r = await fetch(url); if (!r.ok) continue;
      const d = await r.json(); if (d.format !== 'staedte_geb_v1') continue;
      const m = {};
      for (const [name, t] of Object.entries(d.teile)) {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(t.pos, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(new Uint8Array(t.col), 3, true));
        geo.computeVertexNormals();   // ohne Index = flache Schattierung
        m[name] = { geo, h: t.h, anh: t.anh || [] };
      }
      return m;
    } catch (e) { /* nächster Pfad */ }
  }
  return null;
}

export function erzeugeSzene(leinwand, welt) {
  const renderer = new THREE.WebGLRenderer({ canvas: leinwand, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const szene = new THREE.Scene();
  szene.background = new THREE.Color(0x2f3326);

  const kamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 400);
  const ziel = new THREE.Vector3(0, 0, 0);
  kamera.zoom = 1.1;

  szene.add(new THREE.HemisphereLight(0xfff4e0, 0x5a5040, 0.62));
  const sonne = new THREE.DirectionalLight(0xfff0d8, 0.72);
  sonne.position.set(-18, 30, 10);
  sonne.castShadow = true;
  sonne.shadow.mapSize.set(2048, 2048);
  Object.assign(sonne.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 90 });
  sonne.shadow.bias = -0.0008;
  szene.add(sonne, sonne.target);

  // Gelände
  const welt0 = -RASTER / 2;
  const bodenMat = new THREE.MeshLambertMaterial({ color: JAHRESZEITEN[0].boden });
  const boden = new THREE.Mesh(new THREE.PlaneGeometry(RASTER, RASTER), bodenMat);
  boden.rotation.x = -Math.PI / 2; boden.receiveShadow = true; szene.add(boden);
  const erde = new THREE.Mesh(new THREE.BoxGeometry(RASTER, 1.2, RASTER), new THREE.MeshLambertMaterial({ color: 0x5e4e36 }));
  erde.position.y = -0.61; szene.add(erde);
  const gitter = new THREE.GridHelper(RASTER, RASTER, 0x000000, 0x000000);
  gitter.material.opacity = 0.06; gitter.material.transparent = true; gitter.position.y = 0.005; szene.add(gitter);

  // Wasser als ein Mesh aus Feldern
  const wasserGeo = [];
  for (let z = 0; z < RASTER; z++) for (let x = 0; x < RASTER; x++) if (welt.typ[z * RASTER + x] === WASSER) wasserGeo.push([x, z]);
  const wasser = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshLambertMaterial({ color: 0x5e8fb0 }), wasserGeo.length);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0)), eins = new THREE.Vector3(1, 1, 1);
  wasserGeo.forEach(([x, z], i) => wasser.setMatrixAt(i, m4.compose(new THREE.Vector3(welt0 + x + 0.5, 0.02, welt0 + z + 0.5), q, eins)));
  wasser.receiveShadow = true; szene.add(wasser);

  // Bäume (Instancing: Stamm + Krone)
  const baeume = [];
  for (let z = 0; z < RASTER; z++) for (let x = 0; x < RASTER; x++) if (welt.typ[z * RASTER + x] === WALD) baeume.push([x, z]);
  const stamm = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.06, 0.08, 0.4, 5), new THREE.MeshLambertMaterial({ color: 0x5a4330 }), baeume.length);
  const krone = new THREE.InstancedMesh(new THREE.ConeGeometry(0.38, 0.9, 6), new THREE.MeshLambertMaterial({ color: 0x55703a }), baeume.length);
  baeume.forEach(([x, z], i) => {
    const s = 0.8 + ((x * 7 + z * 13) % 5) * 0.1, ox = ((x * 31 + z * 17) % 7) / 20 - 0.15, oz = ((x * 11 + z * 29) % 7) / 20 - 0.15;
    const p = new THREE.Vector3(welt0 + x + 0.5 + ox, 0, welt0 + z + 0.5 + oz);
    stamm.setMatrixAt(i, m4.compose(p.clone().setY(0.2 * s), new THREE.Quaternion(), new THREE.Vector3(s, s, s)));
    krone.setMatrixAt(i, m4.compose(p.clone().setY(0.4 * s + 0.45 * s), new THREE.Quaternion(), new THREE.Vector3(s, s, s)));
  });
  stamm.castShadow = krone.castShadow = true; szene.add(stamm, krone);

  // Gebäude
  const gruppe = new THREE.Group(); szene.add(gruppe);
  const objekte = new Map();   // id -> { g, schluessel, symbol }
  const symbolTex = new Map();

  function weltPos(x, z) { return new THREE.Vector3(welt0 + x, 0, welt0 + z); }

  function satteldach(w, d, hoehe, farbe) {
    const form = new THREE.Shape();
    form.moveTo(-d / 2, 0); form.lineTo(d / 2, 0); form.lineTo(0, hoehe); form.lineTo(-d / 2, 0);
    const geo = new THREE.ExtrudeGeometry(form, { depth: w, bevelEnabled: false });
    geo.translate(0, 0, -w / 2); geo.rotateY(Math.PI / 2);
    const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color: farbe }));
    m.castShadow = true; return m;
  }

  let modelle = null;
  function modellMesh(teil, geist) {
    const mat = new THREE.MeshLambertMaterial({ vertexColors: true });
    if (geist) { mat.transparent = true; mat.opacity = 0.6; }
    const m = new THREE.Mesh(teil.geo, mat);
    m.castShadow = !geist; m.receiveShadow = true; return m;
  }
  function baueModell(name, geist) {
    const teil = modelle[name], g = new THREE.Group();
    g.add(modellMesh(teil, geist));
    teil.anh.forEach((a, i) => {
      const m = modellMesh(modelle[a.t], geist);
      m.position.set(a.p[0], a.p[1], a.p[2]); m.rotation.y = i * 2.1;
      m.userData.drehY = a.dreh * Math.PI * 2; g.add(m);
    });
    g.userData.h = teil.h;
    return g;
  }

  function baueMesh(t, stufe = 1, geist = false) {
    const d = GEB[t], [gw, gd] = groesse(t);
    const casa = t === 'huette' && stufe === 2;
    const name = casa ? 'casa' : t;
    if (modelle && modelle[name]) return baueModell(name, geist);
    const g = new THREE.Group();
    const wand = casa ? CASA.wand : d.wand, dach = casa ? CASA.dach : d.dach, h = casa ? CASA.h : d.h;
    const rand = 0.12, w = gw - rand * 2, tief = gd - rand * 2;
    if (d.flach) {
      const fuge = t === 'strasse' ? 0 : 0.06, f = new THREE.Mesh(new THREE.BoxGeometry(gw - fuge, t === 'strasse' ? 0.03 : 0.05, gd - fuge), new THREE.MeshLambertMaterial({ color: wand }));
      f.position.y = 0.025; f.receiveShadow = true; g.add(f);
      if (t === 'feld') for (let i = 0; i < 6; i++) {
        const reihe = new THREE.Mesh(new THREE.BoxGeometry(gw - 0.3, 0.06, 0.08), new THREE.MeshLambertMaterial({ color: 0xb59e48 }));
        reihe.position.set(0, 0.06, -gd / 2 + 0.35 + i * (gd - 0.7) / 5); g.add(reihe);
      }
      if (t === 'lehmgrube') {
        const grube = new THREE.Mesh(new THREE.BoxGeometry(gw - 0.6, 0.07, gd - 0.6), new THREE.MeshLambertMaterial({ color: 0x7a4f34 }));
        grube.position.y = 0.04; g.add(grube);
      }
    } else if (t === 'brunnen') {
      const r = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, h, 10), new THREE.MeshLambertMaterial({ color: wand }));
      r.position.y = h / 2; r.castShadow = true; g.add(r);
      const w2 = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.02, 10), new THREE.MeshLambertMaterial({ color: 0x5e8fb0 }));
      w2.position.y = h + 0.005; g.add(w2);
    } else if (t === 'markt') {
      [[-0.8, -0.6, 0x3f6e8c], [0.6, -0.7, 0xb5522f], [-0.5, 0.7, 0xc8902e], [0.8, 0.6, 0x3f6e8c]].forEach(([x, z, c]) => {
        const s = new THREE.Mesh(new THREE.BoxGeometry(0.7, h, 0.5), new THREE.MeshLambertMaterial({ color: wand }));
        s.position.set(x, h / 2, z); s.castShadow = true; g.add(s);
        const r = satteldach(0.8, 0.6, 0.25, c); r.position.set(x, h, z); g.add(r);
      });
      const platz = new THREE.Mesh(new THREE.BoxGeometry(gw - 0.1, 0.03, gd - 0.1), new THREE.MeshLambertMaterial({ color: 0xe5dac2 }));
      platz.position.y = 0.015; platz.receiveShadow = true; g.add(platz);
    } else {
      const k = new THREE.Mesh(new THREE.BoxGeometry(w, h, tief), new THREE.MeshLambertMaterial({ color: wand }));
      k.position.y = h / 2; k.castShadow = true; k.receiveShadow = true; g.add(k);
      if (dach) { const r = satteldach(w + 0.08, tief + 0.1, Math.min(w, tief) * 0.35 + 0.15, dach); r.position.y = h; g.add(r); }
      if (d.kamin) {
        const c = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.9, 0.22), new THREE.MeshLambertMaterial({ color: 0x6b4a3a }));
        c.position.set(w / 2 - 0.2, h + 0.3, -tief / 2 + 0.2); c.castShadow = true; g.add(c);
      }
      if (t === 'muehle') {
        const fl = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.4, 0.12), new THREE.MeshLambertMaterial({ color: 0x8a6a46 }));
        const fl2 = fl.clone(); fl2.rotation.z = Math.PI / 2;
        const rad = new THREE.Group(); rad.add(fl, fl2); rad.position.set(0, h + 0.35, tief / 2 + 0.1); rad.rotation.z = Math.PI / 4;
        rad.userData.dreht = true; g.add(rad);
      }
    }
    if (geist) g.traverse(o => { if (o.material) { o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = 0.6; o.castShadow = false; } });
    g.userData.h = d.flach ? 0.2 : (h + (dach ? 0.5 : 0.1));
    return g;
  }

  // Problem-Symbole als Sprite (gezeichnet, keine Schrift)
  const FARBE = { arbeiter: '#e8a33a', rohstoff: '#e8a33a', voll: '#c9bba4', wald: '#9ccb8e', hunger: '#f28c6e', wasser: '#7fb6e0', markt: '#e9b44c', winter: '#dfe6ee' };
  function symbol(art) {
    if (symbolTex.has(art)) return symbolTex.get(art);
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const x = c.getContext('2d');
    x.fillStyle = FARBE[art] || '#e8a33a'; x.strokeStyle = '#1f1a15'; x.lineWidth = 4;
    x.beginPath(); x.arc(32, 30, 24, 0, Math.PI * 2); x.fill(); x.stroke();
    x.beginPath(); x.moveTo(24, 52); x.lineTo(40, 52); x.lineTo(32, 62); x.closePath(); x.fill(); x.stroke();
    x.strokeStyle = '#1f1a15'; x.fillStyle = '#1f1a15'; x.lineWidth = 3.5; x.lineCap = 'round'; x.lineJoin = 'round';
    x.beginPath();
    if (art === 'arbeiter') { x.arc(32, 22, 6, 0, Math.PI * 2); x.moveTo(20, 42); x.quadraticCurveTo(32, 26, 44, 42); }
    else if (art === 'wasser') { x.moveTo(32, 14); x.quadraticCurveTo(46, 32, 42, 38); x.arc(32, 36, 10, 0.2, Math.PI - 0.2); x.quadraticCurveTo(18, 32, 32, 14); }
    else if (art === 'rohstoff') { x.moveTo(26, 16); x.lineTo(38, 16); x.lineTo(35, 22); x.quadraticCurveTo(46, 30, 42, 40); x.lineTo(22, 40); x.quadraticCurveTo(18, 30, 29, 22); x.closePath(); }
    else if (art === 'voll') { x.rect(20, 18, 24, 22); x.moveTo(20, 26); x.lineTo(44, 26); }
    else if (art === 'wald') { x.moveTo(32, 14); x.lineTo(44, 36); x.lineTo(20, 36); x.closePath(); x.moveTo(32, 36); x.lineTo(32, 44); }
    else if (art === 'hunger') { x.moveTo(20, 38); x.quadraticCurveTo(20, 20, 32, 20); x.quadraticCurveTo(44, 20, 44, 38); x.closePath(); }
    else if (art === 'markt') { x.moveTo(18, 26); x.lineTo(22, 16); x.lineTo(42, 16); x.lineTo(46, 26); x.closePath(); x.moveTo(22, 26); x.lineTo(22, 42); x.lineTo(42, 42); x.lineTo(42, 26); }
    else { x.arc(32, 30, 8, 0, Math.PI * 2); }
    x.stroke();
    const tex = new THREE.CanvasTexture(c); symbolTex.set(art, tex); return tex;
  }

  let letzter = null;
  function abgleichen(S, auswahlId) {
    letzter = [S, auswahlId];
    const da = new Set();
    for (const b of S.geb) {
      da.add(b.id);
      const schluessel = b.t + b.stufe;
      let o = objekte.get(b.id);
      if (!o || o.schluessel !== schluessel) {
        if (o) gruppe.remove(o.g);
        const g = baueMesh(b.t, b.stufe);
        const [gw, gd] = groesse(b.t);
        g.position.copy(weltPos(b.x + gw / 2, b.z + gd / 2));
        g.userData.id = b.id;
        gruppe.add(g);
        o = { g, schluessel, symbol: null, art: '' };
        objekte.set(b.id, o);
      }
      // Symbol: schwerstes Problem zuerst
      const p = b.status.find(s => !s.leicht) || b.status.find(s => s.leicht && s.art !== 'winter');
      const art = p ? p.art : '';
      if (art !== o.art) {
        if (o.symbol) { o.g.remove(o.symbol); o.symbol = null; }
        if (art) {
          const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: symbol(art), depthTest: false }));
          sp.scale.set(0.9, 0.9, 1); sp.position.y = o.g.userData.h + 0.75; sp.renderOrder = 10;
          o.g.add(sp); o.symbol = sp;
        }
        o.art = art;
      }
      // Auswahl hervorheben
      const an = b.id === auswahlId, af = ansichtGeb.get(b.id);
      const glanz = an ? 0x3a2a08 : af !== undefined ? new THREE.Color(af).multiplyScalar(0.3).getHex() : 0x000000;
      o.g.traverse(m => { if (m.isMesh && m.material.emissive) m.material.emissive.setHex(glanz); });
    }
    for (const [id, o] of objekte) if (!da.has(id)) { gruppe.remove(o.g); objekte.delete(id); }
    laufwege(S);
  }

  // Laufwege (S1.2): Arbeiter zwischen Haus und Betrieb, Träger vom Erzeuger zum Abnehmer (Instancing, Farbe je Figur)
  const LMAX = 240, SCHRITT = 1.1;   // Figuren höchstens, Felder je Sekunde bei normalem Tempo
  const figur = (geo, farbe) => {
    const m = new THREE.InstancedMesh(geo, new THREE.MeshLambertMaterial({ color: 0xffffff }), LMAX);
    for (let i = 0; i < LMAX; i++) m.setColorAt(i, new THREE.Color(farbe));
    m.count = 0; m.frustumCulled = false; m.castShadow = true; szene.add(m); return m;
  };
  const koerper = figur(new THREE.CylinderGeometry(0.055, 0.085, 0.3, 6).translate(0, 0.15, 0), 0xb08a5a);
  const kopf = figur(new THREE.SphereGeometry(0.055, 6, 4).translate(0, 0.36, 0), 0xc89a78);
  const sack = figur(new THREE.BoxGeometry(0.15, 0.11, 0.12).translate(0, 0.47, 0), 0xd9c26e);
  const TUNIKA = [0xb08a5a, 0x8c6f4e, 0xa25a3c, 0x7d7a5c, 0xc4b08a, 0x6f5a48].map(c => new THREE.Color(c));
  const WARE = { getreide: 0xe0c464, mehl: 0xf0e8d6, brot: 0x9a5a2a, holz: 0x6b4a2a, lehm: 0x8a5a3a, ziegel: 0xa94c2c };
  // Abnehmer je Ware: wer sie braucht, sonst Markt (Brot) oder Speicher
  const ABNEHMER = g => Object.keys(GEB).filter(t => GEB[t].braucht && GEB[t].braucht[g]).concat(g === 'brot' ? ['markt'] : [], ['speicher']);
  let laeufer = [], lzeit = 0;
  const tuer = b => { const [gw, gd] = groesse(b.t); return [welt0 + b.x + gw / 2, welt0 + b.z + gd + 0.3]; };
  // Weg über die Straßen (Breitensuche von den Straßenfeldern vor a zu denen vor b), sonst L-förmig querfeldein
  function strassenPfad(maske, a, b) {
    const ziel = new Set(randFelder(b.t, b.x, b.z).filter(i => maske[i]));
    if (!ziel.size) return null;
    const vor = new Int32Array(RASTER * RASTER).fill(-2), q = [];
    for (const i of randFelder(a.t, a.x, a.z)) if (maske[i]) { vor[i] = -1; q.push(i); }
    for (let k = 0; k < q.length; k++) {
      const i = q[k];
      if (ziel.has(i)) { const p = []; for (let j = i; j >= 0; j = vor[j]) p.push(j); return p.reverse(); }
      const x = i % RASTER, z = (i - x) / RASTER;
      for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const ax = x + dx, az = z + dz, j = az * RASTER + ax;
        if (ax >= 0 && az >= 0 && ax < RASTER && az < RASTER && maske[j] && vor[j] === -2) { vor[j] = i; q.push(j); }
      }
    }
    return null;
  }
  function punkte(maske, a, b) {
    const pf = strassenPfad(maske, a, b), m = o => { const [gw, gd] = groesse(o.t); return [welt0 + o.x + gw / 2, welt0 + o.z + gd / 2]; };
    if (!pf) { const p = tuer(a), q = tuer(b); return [p, [q[0], p[1]], q]; }
    const p = [m(a)];
    for (const i of pf) { const x = i % RASTER; p.push([welt0 + x + 0.5, welt0 + (i - x) / RASTER + 0.5]); }
    p.push(m(b));
    return p.filter((q, k) => k === 0 || k === p.length - 1 ||   // Punkte auf gerader Linie weglassen
      (q[0] - p[k - 1][0]) * (p[k + 1][1] - q[1]) !== (q[1] - p[k - 1][1]) * (p[k + 1][0] - q[0]));
  }
  function weg(p, farbe, ware, schluessel) {
    const c = [0];
    for (let i = 1; i < p.length; i++) c.push(c[i - 1] + Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]));
    let h = 0; for (const z of schluessel) h = (h * 31 + z.charCodeAt(0)) % 9973;
    return { p, c, L: c[c.length - 1], farbe, ware: ware ? new THREE.Color(WARE[ware] || 0xd9c26e) : null, ph: h / 97 };
  }
  function laufwege(S) {
    const neu = [], nach = new Map(S.geb.map(b => [b.id, b])), maske = strassenMaske(S);
    const nachste = (von, typen) => {
      let best = null, bd = 1e9;
      for (const o of S.geb) if (typen.includes(o.t) && o !== von && (o.w || 0) > 0) {
        const d = Math.hypot(o.x - von.x, o.z - von.z); if (d < bd) { bd = d; best = o; }
      }
      return best;
    };
    for (const b of S.geb) {
      if (!b.von || !b.w) continue;
      b.von.forEach(([hid, n], k) => {
        const h = nach.get(hid); if (!h) return;
        for (let i = 0; i < Math.min(n, 2); i++)
          neu.push(weg(punkte(maske, h, b), TUNIKA[(hid + i + k) % TUNIKA.length], '', `${hid}-${b.id}-${i}`));
      });
      const d = GEB[b.t];
      if (d.erzeugt && !b.status.some(s => !s.leicht)) {
        const g = Object.keys(d.erzeugt)[0], ziel = nachste(b, ABNEHMER(g));
        if (ziel) neu.push(weg(punkte(maske, b, ziel), TUNIKA[(b.id + 3) % TUNIKA.length], g, `t${b.id}-${ziel.id}`));
      }
    }
    laeufer = neu.filter(l => l.L > 0.5).slice(0, LMAX);
  }
  function laufen(dt) {
    lzeit += dt;
    let n = 0, ns = 0;
    for (const l of laeufer) {
      const hin = l.L / SCHRITT, zyklus = 2 * hin + 2, t = (lzeit + l.ph * zyklus) % zyklus;
      const s = t < hin ? t * SCHRITT : t < hin + 1 ? l.L : t < 2 * hin + 1 ? l.L - (t - hin - 1) * SCHRITT : 0;
      if (s >= l.L - 0.02 || s <= 0.02) continue;   // im Haus/Betrieb
      let i = 1; while (i < l.c.length - 1 && l.c[i] < s) i++;
      const f = (s - l.c[i - 1]) / Math.max(1e-6, l.c[i] - l.c[i - 1]), a = l.p[i - 1], b = l.p[i];
      const x = a[0] + (b[0] - a[0]) * f, z = a[1] + (b[1] - a[1]) * f, y = Math.abs(Math.sin(s * 9)) * 0.025;
      m4.makeTranslation(x, y, z);
      koerper.setMatrixAt(n, m4); kopf.setMatrixAt(n, m4); koerper.setColorAt(n, l.farbe); n++;
      if (l.ware && t < hin) { sack.setMatrixAt(ns, m4); sack.setColorAt(ns, l.ware); ns++; }
    }
    koerper.count = kopf.count = n; sack.count = ns;
    for (const m of [koerper, kopf, sack]) { m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; }
  }

  // Ansichten (S1.4): eingefärbte Felder (Instancing) und leuchtende Gebäude
  let ansichtGeb = new Map();
  const ansichtFelder = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.94, 0.94).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55, depthWrite: false }), RASTER * RASTER);
  for (let i = 0; i < RASTER * RASTER; i++) ansichtFelder.setColorAt(i, new THREE.Color(0xffffff));
  ansichtFelder.count = 0; ansichtFelder.frustumCulled = false; ansichtFelder.renderOrder = 2; szene.add(ansichtFelder);
  function ansicht(d) {
    ansichtGeb = new Map(d ? d.geb : []);
    const f = d ? d.felder : [], farbe = new THREE.Color();
    f.forEach(([x, z, c], i) => {
      ansichtFelder.setMatrixAt(i, m4.makeTranslation(welt0 + x + 0.5, 0.07, welt0 + z + 0.5));
      ansichtFelder.setColorAt(i, farbe.setHex(c));
    });
    ansichtFelder.count = f.length; ansichtFelder.instanceMatrix.needsUpdate = true; ansichtFelder.instanceColor.needsUpdate = true;
    if (letzter) abgleichen(letzter[0], letzter[1]);
  }

  // Vorschau beim Bauen
  let geist = null, geistTyp = '';
  function vorschau(t, x, z, gueltig) {
    if (!t) { if (geist) { szene.remove(geist); geist = null; geistTyp = ''; } return; }
    if (geistTyp !== t) { if (geist) szene.remove(geist); geist = baueMesh(t, 1, true); geistTyp = t; szene.add(geist); }
    const [gw, gd] = groesse(t);
    geist.position.copy(weltPos(x + gw / 2, z + gd / 2)).setY(0.02);
    geist.traverse(m => { if (m.isMesh) m.material.emissive && m.material.emissive.setHex(gueltig ? 0x1e5a1e : 0x7a1e1e); });
  }

  function jahreszeitFarbe(js) { bodenMat.color.setHex(JAHRESZEITEN[js].boden); }

  // Kamera
  function groesseAnpassen() {
    const w = leinwand.clientWidth, h = leinwand.clientHeight;
    renderer.setSize(w, h, false);
    const a = w / Math.max(1, h);
    Object.assign(kamera, { left: -RAHMEN * a, right: RAHMEN * a, top: RAHMEN, bottom: -RAHMEN });
    kamera.updateProjectionMatrix();
  }
  function kameraSetzen() {
    const mx = modus === 'region' ? REG_X : 0;
    ziel.x = Math.max(mx - RASTER / 2, Math.min(mx + RASTER / 2, ziel.x));
    ziel.z = Math.max(-RASTER / 2, Math.min(RASTER / 2, ziel.z));
    kamera.position.copy(ziel).addScaledVector(BLICK, 100);
    kamera.lookAt(ziel);
    kamera.updateProjectionMatrix();
  }
  function zoom(f) { kamera.zoom = Math.max(0.45, Math.min(3.2, kamera.zoom * f)); kameraSetzen(); }

  const ray = new THREE.Raycaster(), ebene = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), nv = new THREE.Vector2();
  function bodenPunkt(px, py) {
    const r = leinwand.getBoundingClientRect();
    nv.set(((px - r.left) / r.width) * 2 - 1, -((py - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(nv, kamera);
    const p = new THREE.Vector3();
    return ray.ray.intersectPlane(ebene, p) ? p : null;
  }
  function feldAn(px, py) {
    const p = bodenPunkt(px, py); if (!p) return null;
    return { x: Math.floor(p.x - welt0), z: Math.floor(p.z - welt0), p };
  }
  function verschieben(a, b) { if (!a || !b) return; ziel.x += a.x - b.x; ziel.z += a.z - b.z; kameraSetzen(); }
  function gebaeudeAn(px, py) {
    const r = leinwand.getBoundingClientRect();
    nv.set(((px - r.left) / r.width) * 2 - 1, -((py - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(nv, kamera);
    const t = ray.intersectObjects(gruppe.children, true)[0];
    if (!t) return 0;
    let o = t.object; while (o && !o.userData.id) o = o.parent;
    return o ? o.userData.id : 0;
  }
  // ---------- Umland (S2.1): Hex-Felder neben der Stadt (x + REG_X), gleiche Kamera und Steuerung ----------
  let modus = 'stadt', region = null, wahlRing = null;
  const HEX = 3.2, S3 = Math.sqrt(3);
  const hexMitte = (q, r) => [REG_X + 1.5 * HEX * q, S3 * HEX * (r + q / 2)];
  const HOEHE = { hang: 0.75, fluss: 0.08, stadt: 0.3 };
  function regionBauen() {
    const g = new THREE.Group(), felder = erzeugeRegion(), lam = c => new THREE.MeshLambertMaterial({ color: c });
    const hexGeo = h => new THREE.CylinderGeometry(HEX, HEX, h, 6).rotateY(Math.PI / 6).translate(0, h / 2 - 0.2, 0);
    const rand = 0.82 * HEX;
    felder.forEach(f => {
      const [x, z] = hexMitte(f.q, f.r), h = (HOEHE[f.typ] ?? 0.32) + 0.2, top = h - 0.2;
      let k = (f.q * 7 + f.r * 13 + 100) | 0; const zz = () => (k = (k * 16807) % 2147483647) / 2147483647;
      const im = (rr = rand) => { let a, b; do { a = (zz() * 2 - 1) * rr; b = (zz() * 2 - 1) * rr; } while (Math.hypot(a, b) > rr); return [a, b]; };
      const feld = new THREE.Mesh(hexGeo(h), lam(REGION_TYPEN[f.typ].farbe)); feld.position.set(x, 0, z); feld.receiveShadow = true; g.add(feld);
      const ring = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.CircleGeometry(HEX * 0.995, 6).rotateX(-Math.PI / 2).rotateY(Math.PI / 6)),
        new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.12 }));
      ring.position.set(x, top + 0.01, z); g.add(ring);
      const add = (geo, farbe, a, y, b, ry = 0) => { const m = new THREE.Mesh(geo, lam(farbe)); m.position.set(x + a, top + y, z + b); m.rotation.y = ry; m.castShadow = true; m.receiveShadow = true; g.add(m); return m; };
      if (f.typ === 'wald') for (let i = 0; i < 16; i++) { const [a, b] = im(), sc = 0.8 + zz() * 0.6;
        add(new THREE.CylinderGeometry(0.08, 0.1, 0.4 * sc, 5), 0x5a4330, a, 0.2 * sc, b); add(new THREE.ConeGeometry(0.5 * sc, 1.3 * sc, 6), zz() < 0.5 ? 0x55703a : 0x4a6534, a, 0.4 * sc + 0.65 * sc, b); }
      if (f.typ === 'acker') { const w = zz() * Math.PI; for (let i = 0; i < 4; i++) { const c = [0xd9c26e, 0x8a9a48, 0xb08a52, 0xc8b060][(i + f.q + 9) % 4];
        const off = (i - 1.5) * 1.05, L = 2 * Math.sqrt(Math.max(0.3, (0.8 * S3 / 2 * HEX) ** 2 - (Math.abs(off) + 0.48) ** 2));
        add(new THREE.BoxGeometry(L, 0.04, 0.95), c, Math.sin(w) * off, 0.02, Math.cos(w) * off, w); } }
      if (f.typ === 'weide') { for (let i = 0; i < 6; i++) { const [a, b] = im(); add(new THREE.BoxGeometry(0.22, 0.16, 0.14), 0xeee8dc, a, 0.12, b, zz() * 3); }
        for (let i = 0; i < 3; i++) { const [a, b] = im(); add(new THREE.SphereGeometry(0.35, 6, 4), 0x6f8c46, a, 0.15, b); } }
      if (f.typ === 'lehm') for (let i = 0; i < 5; i++) { const [a, b] = im(1.6); add(new THREE.CylinderGeometry(0.5 + zz() * 0.4, 0.6, 0.05, 7), i % 2 ? 0x7a4f34 : 0x5e8fb0, a, 0.03, b); }
      if (f.typ === 'hang') { for (let i = 0; i < 5; i++) add(new THREE.BoxGeometry(3.4, 0.12, 0.12), 0x4f6a30, 0, 0.08, (i - 2) * 0.6);
        for (let i = 0; i < 3; i++) { const [a, b] = im(); add(new THREE.ConeGeometry(0.18, 1.4, 6), 0x3f5a2a, a, 0.7, b); } }
      if (f.typ === 'fluss') for (let i = 0; i < 4; i++) { const [a, b] = im(); add(new THREE.ConeGeometry(0.1, 0.5, 4), 0x7d8a48, a * 1.05, 0.25, b * 1.05); }
      if (f.typ === 'stadt') {
        add(new THREE.CylinderGeometry(HEX * 0.8, HEX * 0.8, 0.04, 24), 0xc9b48a, 0, 0.02, 0);
        const mauer = new THREE.Mesh(new THREE.TorusGeometry(HEX * 0.8, 0.09, 4, 32).rotateX(Math.PI / 2), lam(0xb8aa8c)); mauer.position.set(x, top + 0.12, z); g.add(mauer);
        const orte = [['markt', 0, 0, 0.35], ['casa', -1.1, -0.6, 0.38], ['casa', 1.1, -0.5, 0.38], ['casa', -0.3, 1.2, 0.38], ['huette', 1.0, 1.0, 0.38], ['huette', -1.4, 0.6, 0.38], ['speicher', 0.2, -1.5, 0.3]];
        orte.forEach(([t, a, b, sc]) => {
          const m = modelle && modelle[t] ? new THREE.Mesh(modelle[t].geo, new THREE.MeshLambertMaterial({ vertexColors: true })) : new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.8, 1.2), lam(0xd8b88a));
          m.scale.setScalar(modelle && modelle[t] ? sc : 0.35); m.position.set(x + a, top + 0.04, z + b); m.castShadow = true; g.add(m);
        });
      }
    });
    wahlRing = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.CircleGeometry(HEX * 0.95, 6).rotateX(-Math.PI / 2).rotateY(Math.PI / 6)), new THREE.LineBasicMaterial({ color: 0xe9b44c }));
    wahlRing.visible = false; g.add(wahlRing);
    szene.add(g); return { g, felder };
  }
  function zeigeModus(m) {
    if (m === 'region' && !region) { region = regionBauen(); if (landS) landAbgleichen(landS); }
    modus = m; const mx = m === 'region' ? REG_X : 0;
    sonne.position.set(mx - 18, 30, 10); sonne.target.position.set(mx, 0, 0); sonne.target.updateMatrixWorld();
    ziel.set(mx, 0, 0); kamera.zoom = m === 'region' ? 0.85 : 1.1; kameraSetzen();
  }
  function hexAn(px, py) {
    const p = bodenPunkt(px, py); if (!p || !region) return null;
    const x = p.x - REG_X, z = p.z;
    let q = (2 / 3 * x) / HEX, r = (-x / 3 + S3 / 3 * z) / HEX, s = -q - r;
    let rq = Math.round(q), rr = Math.round(r), rs = Math.round(s);
    const dq = Math.abs(rq - q), dr = Math.abs(rr - r), ds = Math.abs(rs - s);
    if (dq > dr && dq > ds) rq = -rr - rs; else if (dr > ds) rr = -rq - rs;
    const f = region.felder.find(h => h.q === rq && h.r === rr) || null;
    if (wahlRing) { wahlRing.visible = !!f; if (f) { const [hx, hz] = hexMitte(f.q, f.r); wahlRing.position.set(hx, (HOEHE[f.typ] ?? 0.32) + 0.03, hz); } }
    return f;
  }
  const regionInfo = () => region ? region.felder.length : 0;
  // Stand des Umlands zeichnen: Pflöcke (Vermessung/vermessen), Betriebsmodell
  const landObj = new Map();
  let landS = null;
  function landAbgleichen(S) {
    landS = S; if (!region) return;
    for (const f of region.felder) {
      const k = landKey(f), stand = landStand(S, f), l = (S.land || {})[k];
      const wegNach = hatWeg(S, f) ? nachbarn(f).map(n => n && hatWeg(S, n) ? 1 : 0).join('') : '';
      const schl = stand + (l && l.betrieb || '') + wegNach;
      const alt = landObj.get(k); if (alt && alt.schl === schl) continue;
      if (alt) region.g.remove(alt.g);
      const g = new THREE.Group(), [x, z] = hexMitte(f.q, f.r), top = HOEHE[f.typ] ?? 0.32;
      if (stand === 'vermessung' || stand === 'vermessen') for (let i = 0; i < 6; i++) {
        const w = Math.PI / 3 * i, p = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.7, 4), new THREE.MeshLambertMaterial({ color: i % 2 ? 0xf0ebe0 : 0xb5322a }));
        p.position.set(x + Math.cos(w) * HEX * 0.86, top + 0.35, z + Math.sin(w) * HEX * 0.86); p.castShadow = true; g.add(p);
      }
      // Feldweg: halbe Strecke von der Mitte zu jedem Nachbarn mit Weg (der Nachbar zeichnet die andere Hälfte)
      [...wegNach].forEach((v, i) => {
        if (v !== '1') return;
        const n = nachbarn(f)[i], [nx, nz] = hexMitte(n.q, n.r), dx = nx - x, dz = nz - z, L = Math.hypot(dx, dz) / 2;
        const st = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.05, L + 0.3), new THREE.MeshLambertMaterial({ color: 0x9c8460 }));
        st.position.set(x + dx / 4, top + 0.03, z + dz / 4); st.rotation.y = Math.atan2(dx, dz); st.receiveShadow = true; g.add(st);
      });
      if (stand === 'betrieb') {
        const t = LAND_BETRIEBE[l.betrieb].modell, mo = modelle && modelle[t];
        const m = mo ? new THREE.Mesh(mo.geo, new THREE.MeshLambertMaterial({ vertexColors: true })) : new THREE.Mesh(new THREE.BoxGeometry(1, 0.7, 1), new THREE.MeshLambertMaterial({ color: 0xd8b88a }));
        m.scale.setScalar(mo ? 0.9 : 1); m.position.set(x + 0.9, top, z + 0.9); m.castShadow = true; m.receiveShadow = true; g.add(m);
      }
      region.g.add(g); landObj.set(k, { g, schl });
    }
    // Karren (S2.3): je verbundenem Betrieb einer, fährt beladen zur Stadt und leer zurück
    for (const k of karren) region.g.remove(k.g);
    karren = [];
    for (const f of region.felder) {
      const l = (S.land || {})[landKey(f)]; if (!l || !l.betrieb) continue;
      const pf = hatWeg(S, f) && wegPfad(S, f); if (!pf) continue;
      const pts = pf.map(h => { const [x, z] = hexMitte(h.q, h.r); return [x, z, (HOEHE[h.typ] ?? 0.32) + 0.05]; });
      const c = [0]; for (let i = 1; i < pts.length; i++) c.push(c[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
      const g = new THREE.Group(), lam = col => new THREE.MeshLambertMaterial({ color: col });
      const wagen = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.18, 0.8), lam(0x6b4a2a)); wagen.position.y = 0.22; g.add(wagen);
      for (const sx of [-1, 1]) { const rad = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.06, 8).rotateZ(Math.PI / 2), lam(0x3a2a1a)); rad.position.set(sx * 0.28, 0.16, 0); g.add(rad); }
      const last = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.18, 0.6), lam({ gehoeft: 0xe0c464, holzlager: 0x8a6a46, lehmstich: 0x9a6b4a }[l.betrieb] || 0xd9c26e));
      last.position.y = 0.4; g.add(last);
      const ochse = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.6), lam(0xb8a890)); ochse.position.set(0, 0.3, 0.85); g.add(ochse);
      g.traverse(o => { if (o.isMesh) o.castShadow = true; });
      region.g.add(g); karren.push({ g, pts, c, L: c[c.length - 1], last, ph: (f.q * 3 + f.r * 7 + 20) % 10 });
    }
  }
  let karren = [], kzeit = 0;
  function karrenFahren(dt) {
    kzeit += dt;
    for (const k of karren) {
      if (k.L <= 0) continue;
      const hin = k.L / 1.6, zyklus = 2 * hin + 3, t = (kzeit + k.ph) % zyklus;
      const zurStadt = t < hin + 1.5, s = t < hin ? t * 1.6 : t < hin + 1.5 ? k.L : t < 2 * hin + 1.5 ? k.L - (t - hin - 1.5) * 1.6 : 0;
      let i = 1; while (i < k.c.length - 1 && k.c[i] < s) i++;
      const a = k.pts[i - 1], b = k.pts[i], f = Math.min(1, (s - k.c[i - 1]) / Math.max(1e-6, k.c[i] - k.c[i - 1]));
      k.g.position.set(a[0] + (b[0] - a[0]) * f, a[2] + (b[2] - a[2]) * f, a[1] + (b[1] - a[1]) * f);
      const dir = zurStadt ? 1 : -1; k.g.rotation.y = Math.atan2((b[0] - a[0]) * dir, (b[1] - a[1]) * dir);
      k.last.visible = zurStadt;
    }
  }

  function zentrieren(x, z) { ziel.copy(weltPos(x, z)); kameraSetzen(); }

  let zeit = 0;
  function zeichnen(dt, laufTempo = 1) {
    zeit += dt;
    laufen(dt * laufTempo);
    if (modus === 'region') karrenFahren(dt * laufTempo);
    gruppe.traverse(o => { if (o.userData.dreht) o.rotation.z += dt * 0.8; if (o.userData.drehY) o.rotation.y += dt * o.userData.drehY; });
    renderer.render(szene, kamera);
  }

  window.addEventListener('resize', groesseAnpassen);
  groesseAnpassen(); kameraSetzen();
  // Modelle nachladen; bis dahin (oder wenn die Datei fehlt) bleiben die einfachen Formen
  const modelleBereit = ladeModelle().then(m => {
    if (!m) return false;
    modelle = m;
    for (const o of objekte.values()) o.schluessel = '';
    if (geist) { szene.remove(geist); geist = null; geistTyp = ''; }
    if (letzter) abgleichen(letzter[0], letzter[1]);
    return true;
  });
  return { zeigeModus, hexAn, regionInfo, landAbgleichen, karrenZahl: () => karren.length, modus: () => modus, modelleBereit, laeuferZahl: () => koerper.count, ansicht, ansichtZahl: () => ansichtFelder.count, abgleichen, vorschau, jahreszeitFarbe, zoom, bodenPunkt, feldAn, verschieben, gebaeudeAn, zentrieren, zeichnen, groesseAnpassen, renderer };
}
