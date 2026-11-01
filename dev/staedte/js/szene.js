// Städte Roms – 3D-Szene: feste Schrägsicht (orthografisch), Gelände, Gebäude, Vorschau, Problem-Symbole
import { RASTER, TIEFE, GEB, CASA, INSULA, JAHRESZEITEN, REGION_TYPEN } from './daten.js';
import { WALD, WASSER, frontSeite, groesse, strassenMaske, randFelder, erzeugeRegion, nachbarFeld, sonderFelder, landStand, landKey, hatWeg, nachbarn, wegPfad, hat, bauzeit, handelOffen, PARTNER, verbunden, regionKarte, mantuaFeld } from './sim.js';
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
  const welt0 = -TIEFE / 2, mitteX = welt0 + RASTER / 2;   // Ursprung wie beim alten 40×40-Gelände, der Osten kommt dazu
  const bodenMat = new THREE.MeshLambertMaterial({ color: JAHRESZEITEN[0].boden });
  const boden = new THREE.Mesh(new THREE.PlaneGeometry(RASTER, TIEFE), bodenMat);
  boden.rotation.x = -Math.PI / 2; boden.position.x = mitteX; boden.receiveShadow = true; szene.add(boden);
  const erde = new THREE.Mesh(new THREE.BoxGeometry(RASTER, 1.2, TIEFE), new THREE.MeshLambertMaterial({ color: 0x5e4e36 }));
  erde.position.set(mitteX, -0.61, 0); szene.add(erde);
  const gl = [];
  for (let x = 0; x <= RASTER; x++) gl.push(welt0 + x, 0, welt0, welt0 + x, 0, -welt0);
  for (let z = 0; z <= TIEFE; z++) gl.push(welt0, 0, welt0 + z, welt0 + RASTER, 0, welt0 + z);
  const gitter = new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(gl, 3)),
    new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.06 }));
  gitter.position.y = 0.005; szene.add(gitter);
  // Gesperrtes Land (Stadterweiterung): dunkler Schleier östlich der Grenze und Grenzsteine (cippi)
  const sperre = new THREE.Mesh(new THREE.PlaneGeometry(1, TIEFE).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x1a140e, transparent: true, opacity: 0.45, depthWrite: false }));
  sperre.position.y = 0.09; sperre.renderOrder = 1; szene.add(sperre);
  const cippi = new THREE.InstancedMesh(new THREE.BoxGeometry(0.22, 0.5, 0.22).translate(0, 0.25, 0), new THREE.MeshLambertMaterial({ color: 0xe8e0cc }), TIEFE);
  cippi.castShadow = true; szene.add(cippi);
  function grenze(gx) {
    const breit = RASTER - gx; sperre.visible = breit > 0;
    sperre.scale.x = Math.max(0.001, breit); sperre.position.x = welt0 + gx + breit / 2;
    let n = 0; const mm = new THREE.Matrix4();
    if (breit > 0) for (let z = 1; z < TIEFE; z += 3) { if (welt.typ[z * RASTER + gx] === WASSER) continue; cippi.setMatrixAt(n++, mm.makeTranslation(welt0 + gx, 0, welt0 + z + 0.5)); }
    cippi.count = n; cippi.instanceMatrix.needsUpdate = true;
    grenzeX = gx; kameraSetzen();
  }
  let grenzeX = RASTER;

  // Wasser als ein Mesh aus Feldern
  const wasserGeo = [];
  for (let z = 0; z < TIEFE; z++) for (let x = 0; x < RASTER; x++) if (welt.typ[z * RASTER + x] === WASSER) wasserGeo.push([x, z]);
  const wasser = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshLambertMaterial({ color: 0x5e8fb0 }), wasserGeo.length);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0)), eins = new THREE.Vector3(1, 1, 1);
  wasserGeo.forEach(([x, z], i) => wasser.setMatrixAt(i, m4.compose(new THREE.Vector3(welt0 + x + 0.5, 0.02, welt0 + z + 0.5), q, eins)));
  wasser.receiveShadow = true; szene.add(wasser);

  // Bäume (Instancing: Stamm + Krone)
  const baeume = [];
  for (let z = 0; z < TIEFE; z++) for (let x = 0; x < RASTER; x++) if (welt.typ[z * RASTER + x] === WALD) baeume.push([x, z]);
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

  // Insula (S3.2): Läden (tabernae) im Erdgeschoss, zwei Wohngeschosse mit Fenstern, Ziegeldach
  function baueInsula() {
    const g = new THREE.Group(), lam = c => new THREE.MeshLambertMaterial({ color: c }), B = 1.76;
    const stock = (y, h, c) => { const m = new THREE.Mesh(new THREE.BoxGeometry(B, h, B), lam(c)); m.position.y = y + h / 2; m.castShadow = true; m.receiveShadow = true; g.add(m); };
    stock(0, 0.6, 0xb89a74); stock(0.6, 0.72, INSULA.wand); stock(1.32, 0.72, 0xe0c39c);
    const gesims = new THREE.Mesh(new THREE.BoxGeometry(B + 0.08, 0.05, B + 0.08), lam(0xc9b08a)); gesims.position.y = 0.62; g.add(gesims);
    const dunkel = lam(0x3a2a1e);
    for (const seite of [0, 1, 2, 3]) {
      const w = Math.PI / 2 * seite, nx = Math.sin(w), nz = Math.cos(w);
      for (let i = 0; i < 3; i++) {
        const o = (i - 1) * 0.55;
        const tuer = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.42, 0.02), dunkel); tuer.position.set(nx * (B / 2 + 0.01) + nz * o, 0.22, nz * (B / 2 + 0.01) - nx * o); tuer.rotation.y = w; g.add(tuer);
        for (const y of [0.98, 1.7]) { const f = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.24, 0.02), dunkel); f.position.set(nx * (B / 2 + 0.01) + nz * o, y, nz * (B / 2 + 0.01) - nx * o); f.rotation.y = w; g.add(f); }
      }
    }
    const r = satteldach(B + 0.12, B + 0.12, 0.45, INSULA.dach); r.position.y = 2.04; g.add(r);
    g.userData.h = 2.6;
    return g;
  }
  // Domus (Späte Republik): Atriumhaus – vier Flügel mit Pultdächern um einen offenen Hof mit Becken (impluvium), Garten
  function baueDomus(geist) {
    const g = new THREE.Group(), lam = c => new THREE.MeshLambertMaterial({ color: c, transparent: geist, opacity: geist ? 0.6 : 1 }), A = 2.7, T = 0.75, H = 0.85;
    const teil = (geo, c, x, y, z, ry = 0) => { const m = new THREE.Mesh(geo, lam(c)); m.position.set(x, y, z); m.rotation.y = ry; m.castShadow = true; m.receiveShadow = true; g.add(m); return m; };
    teil(new THREE.BoxGeometry(A, 0.06, A), 0xd8cbb0, 0, 0.03, 0);
    for (const [x, z, w, d] of [[0, -(A - T) / 2, A, T], [0, (A - T) / 2, A, T], [-(A - T) / 2, 0, T, A - 2 * T], [(A - T) / 2, 0, T, A - 2 * T]]) {
      teil(new THREE.BoxGeometry(w, H, d), 0xeadbc0, x, H / 2, z);
      teil(new THREE.BoxGeometry(w + 0.1, 0.08, d + 0.1), 0xa9482a, x, H + 0.06, z);
    }
    teil(new THREE.BoxGeometry(0.5, 0.04, 0.5), 0x5e8fb0, 0, 0.08, 0);
    for (const [x, z] of [[-0.4, -0.4], [0.4, -0.4], [-0.4, 0.4], [0.4, 0.4]]) teil(new THREE.CylinderGeometry(0.05, 0.05, H, 6), 0xf2ead8, x, H / 2, z);
    teil(new THREE.BoxGeometry(0.42, 0.6, 0.04), 0x3a2a1e, 0, 0.3, A / 2 + 0.005);
    g.userData.h = 1.2;
    return g;
  }
  // Eigene Formen für Gebäude ohne Blender-Modell (1.11.): Schule, Feuerwache, Quartier, Schrein, Schmiede, Kelter
  function teileBau(geist) {
    const g = new THREE.Group();
    const teil = (geo, c, x, y, z, ry = 0) => { const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color: c, transparent: geist, opacity: geist ? 0.6 : 1 }));
      m.position.set(x, y, z); m.rotation.y = ry; m.castShadow = true; m.receiveShadow = true; g.add(m); return m; };
    const box = (w, h, d, c, x, y, z, ry) => teil(new THREE.BoxGeometry(w, h, d), c, x, y, z, ry);
    const dach = (w, d, hh, c, x, y, z) => { const r = satteldach(w, d, hh, c); r.position.set(x, y, z); if (geist) r.material.transparent = true; g.add(r); return r; };
    const saeule = (x, z, h, c = 0xf2ead8) => teil(new THREE.CylinderGeometry(0.05, 0.06, h, 6), c, x, h / 2, z);
    return { g, teil, box, dach, saeule };
  }
  const EIGEN = {
    ludus: geist => { const { g, box, dach, saeule } = teileBau(geist);   // Schulhaus mit Säulenvorhalle und Bänken
      box(1.7, 0.7, 1.1, 0xe6d6b4, 0, 0.35, -0.3); dach(1.8, 1.2, 0.35, 0x8a4a2b, 0, 0.7, -0.3);
      box(1.7, 0.05, 0.55, 0x9a8a70, 0, 0.6, 0.55); for (const x of [-0.75, -0.25, 0.25, 0.75]) saeule(x, 0.78, 0.6);
      for (const x of [-0.45, 0.45]) box(0.5, 0.12, 0.14, 0x7a5a3a, x, 0.06, 0.45);
      box(0.5, 0.35, 0.03, 0x2e3a2e, 0, 0.35, 0.26); g.userData.h = 1.1; return g; },
    wache: geist => { const { g, box, dach, teil } = teileBau(geist);   // Wachhaus mit Turm, Eimern und Haken
      box(1.4, 0.65, 1.2, 0xc8a888, -0.15, 0.33, 0.1); dach(1.5, 1.3, 0.3, 0x8a3a2a, -0.15, 0.65, 0.1);
      box(0.5, 1.5, 0.5, 0xb89878, 0.6, 0.75, -0.55); dach(0.6, 0.6, 0.25, 0x8a3a2a, 0.6, 1.5, -0.55);
      for (let i = 0; i < 4; i++) teil(new THREE.CylinderGeometry(0.07, 0.06, 0.14, 8), 0x6b4a2a, -0.6 + i * 0.22, 0.07, 0.8);
      box(0.04, 0.9, 0.04, 0x5a4330, 0.75, 0.45, 0.6); box(0.25, 0.04, 0.04, 0x444444, 0.75, 0.88, 0.6); g.userData.h = 1.8; return g; },
    quartier: geist => { const { g, box, dach } = teileBau(geist);   // langes, niedriges Quartier mit kleinen Öffnungen
      box(1.75, 0.5, 1.0, 0xa08a6a, 0, 0.25, -0.2); dach(1.85, 1.1, 0.25, 0x6e5236, 0, 0.5, -0.2);
      for (const x of [-0.6, -0.2, 0.2, 0.6]) box(0.12, 0.12, 0.02, 0x2a1e14, x, 0.36, 0.31);
      box(0.25, 0.35, 0.02, 0x2a1e14, 0.75, 0.18, 0.31); box(1.75, 0.04, 0.6, 0x8a7a5a, 0, 0.02, 0.6); g.userData.h = 0.9; return g; },
    schrein: geist => { const { g, box, saeule, teil } = teileBau(geist);   // Lararium: Sockel, zwei Säulen, Giebel, Altar
      box(0.7, 0.18, 0.6, 0xd8ccb0, 0, 0.09, 0); for (const x of [-0.24, 0.24]) teil(new THREE.CylinderGeometry(0.04, 0.05, 0.5, 6), 0xf2ead8, x, 0.43, 0.18);
      box(0.6, 0.45, 0.3, 0xe8dcc4, 0, 0.4, -0.12); const gi = new THREE.Shape(); gi.moveTo(-0.36, 0); gi.lineTo(0.36, 0); gi.lineTo(0, 0.2); gi.lineTo(-0.36, 0);
      teil(new THREE.ExtrudeGeometry(gi, { depth: 0.55, bevelEnabled: false }).translate(0, 0, -0.3), 0xa9583a, 0, 0.68, 0.02);
      box(0.16, 0.16, 0.16, 0xc8bca4, 0, 0.26, 0.45); g.userData.h = 0.95; return g; },
    schmiede: geist => { const { g, box, dach, teil } = teileBau(geist);   // Werkstatt mit offener Front, Esse und Amboss
      box(1.6, 0.6, 1.1, 0x8a7a68, 0, 0.3, -0.3); dach(1.7, 1.2, 0.3, 0x5a3a2a, 0, 0.6, -0.3);
      box(0.45, 1.25, 0.45, 0x6a5a4a, 0.55, 0.62, -0.45);
      teil(new THREE.SphereGeometry(0.16, 8, 6), 0xff7a2a, 0.55, 0.3, -0.05).material.emissive = new THREE.Color(0x8a2a00);
      box(0.3, 0.2, 0.15, 0x3a3a3a, -0.35, 0.22, 0.45); box(0.12, 0.12, 0.12, 0x3a3a3a, -0.35, 0.06, 0.45);
      box(0.4, 0.15, 0.3, 0x7a5848, 0.3, 0.07, 0.6); g.userData.h = 1.4; return g; },
    thermen: geist => { const { g, box, teil } = teileBau(geist);   // Badehaus mit Kuppeln, Becken im Hof, Schornstein der Heizung
      box(3.7, 0.15, 2.7, 0xd8ccb0, 0, 0.07, 0);
      box(2.4, 0.8, 1.4, 0xe6dccb, -0.5, 0.55, -0.55); box(2.5, 0.08, 1.5, 0xa9482a, -0.5, 0.98, -0.55);
      for (const x of [-1.2, -0.5, 0.2]) teil(new THREE.SphereGeometry(0.42, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), 0xd8d0c0, x, 1.0, -0.55);
      box(1.0, 0.5, 2.2, 0xe0d4bc, 1.3, 0.4, 0); box(1.1, 0.06, 2.3, 0xa9482a, 1.3, 0.68, 0);
      box(2.2, 0.08, 0.9, 0x5e8fb0, -0.5, 0.17, 0.75); box(2.4, 0.16, 0.08, 0xd8ccb0, -0.5, 0.22, 1.24);
      box(0.25, 1.4, 0.25, 0x8a7a68, 1.55, 0.85, -0.95);
      for (let i = 0; i < 5; i++) teil(new THREE.CylinderGeometry(0.05, 0.06, 0.5, 6), 0xf6f0e2, -1.6 + i * 0.55, 0.4, 1.2);
      g.userData.h = 1.6; return g; },
    basilika: geist => { const { g, box, teil } = teileBau(geist);   // Hallenbau mit Säulenumgang, Obergaden und Apsis
      box(5.6, 0.2, 3.6, 0xd8ccb0, 0, 0.1, 0);
      box(4.6, 1.1, 2.6, 0xeee6d4, 0, 0.75, 0); box(4.6, 0.55, 1.4, 0xe6dccb, 0, 1.55, 0);
      for (let i = 0; i < 11; i++) for (const z of [-1.6, 1.6]) teil(new THREE.CylinderGeometry(0.07, 0.08, 1.1, 8), 0xf6f0e2, -2.5 + i * 0.5, 0.75, z);
      for (const x of [-2.6, 2.6]) for (let i = 0; i < 6; i++) teil(new THREE.CylinderGeometry(0.07, 0.08, 1.1, 8), 0xf6f0e2, x, 0.75, -1.25 + i * 0.5);
      box(5.4, 0.1, 3.4, 0xa9482a, 0, 1.35, 0);
      const d1 = new THREE.Shape(); d1.moveTo(-0.8, 0); d1.lineTo(0.8, 0); d1.lineTo(0, 0.4); d1.lineTo(-0.8, 0);
      teil(new THREE.ExtrudeGeometry(d1, { depth: 4.7, bevelEnabled: false }).translate(0, 0, -2.35).rotateY(Math.PI / 2), 0xa9482a, 0, 1.82, 0);
      teil(new THREE.CylinderGeometry(0.8, 0.8, 1.1, 16, 1, false, Math.PI / 2, Math.PI).rotateY(Math.PI / 2), 0xe6dccb, -2.3, 0.75, 0);
      for (let i = 0; i < 6; i++) box(0.16, 0.22, 0.02, 0x3a2a1e, -1.9 + i * 0.75, 1.55, 0.71);
      g.userData.h = 2.3; return g; },
    zeltlager: geist => { const { g, box, teil } = teileBau(geist);   // Lederzelte der Kolonisten, Feuerstelle, Werkzeugkiste
      const zelt = (x, z, ry) => { const f = new THREE.Shape(); f.moveTo(-0.32, 0); f.lineTo(0.32, 0); f.lineTo(0, 0.45); f.lineTo(-0.32, 0);
        teil(new THREE.ExtrudeGeometry(f, { depth: 0.7, bevelEnabled: false }).translate(0, 0, -0.35), 0xc8b08a, x, 0, z, ry); };
      zelt(-0.9, -0.3, 0); zelt(0, -0.35, 0); zelt(0.9, -0.3, 0); zelt(-0.5, 0.55, Math.PI / 2);
      teil(new THREE.CylinderGeometry(0.15, 0.18, 0.06, 8), 0x5a4a3a, 0.5, 0.03, 0.5); teil(new THREE.ConeGeometry(0.08, 0.2, 5), 0xe8903a, 0.5, 0.14, 0.5);
      box(0.35, 0.18, 0.22, 0x7a5a3a, 1.0, 0.09, 0.55); box(0.04, 0.5, 0.04, 0x6b4a2a, 1.3, 0.25, -0.75); box(0.02, 0.18, 0.3, 0xa8261f, 1.3, 0.55, -0.62);
      g.userData.h = 0.7; return g; },
    tor: geist => { const { g, box } = teileBau(geist);   // zwei Tortürme mit Bogen
      for (const x of [-0.42, 0.42]) { box(0.3, 1.3, 0.9, 0xc4b89c, x, 0.65, 0); box(0.34, 0.1, 0.94, 0xa9482a, x, 1.33, 0); }
      box(0.6, 0.35, 0.9, 0xcfc4a8, 0, 1.0, 0); box(0.54, 0.02, 0.92, 0x3a2a1e, 0, 0.82, 0);
      g.userData.h = 1.4; return g; },
    tabernae: geist => { const { g, box, dach } = teileBau(geist);   // Ladenzeile mit Markisen und Auslagen
      box(1.8, 0.6, 0.7, 0xd8c4a0, 0, 0.3, -0.1); dach(1.9, 0.8, 0.2, 0xa9583a, 0, 0.6, -0.1);
      [0xb0402a, 0x3f6e8c, 0xe0c464].forEach((c, i) => { box(0.5, 0.03, 0.3, c, -0.6 + i * 0.6, 0.48, 0.38); box(0.42, 0.3, 0.02, 0x3a2a1e, -0.6 + i * 0.6, 0.18, 0.26); box(0.4, 0.12, 0.18, 0xb08a5a, -0.6 + i * 0.6, 0.12, 0.38); });
      g.userData.h = 0.85; return g; },
    garten: geist => { const { g, box, teil } = teileBau(geist);   // Beete, Wege, Bäume, Brunnenbecken
      box(1.9, 0.04, 1.9, 0x6f9a48, 0, 0.02, 0); box(1.9, 0.05, 0.25, 0xd8ccb0, 0, 0.03, 0); box(0.25, 0.05, 1.9, 0xd8ccb0, 0, 0.03, 0);
      for (const [x, z] of [[-0.55, -0.55], [0.55, 0.55], [-0.55, 0.55], [0.55, -0.55]]) { teil(new THREE.CylinderGeometry(0.04, 0.05, 0.35, 5), 0x5a4330, x, 0.18, z); teil(new THREE.SphereGeometry(0.28, 8, 6), x * z > 0 ? 0x4f7a3a : 0x6a8a3a, x, 0.52, z); }
      teil(new THREE.CylinderGeometry(0.22, 0.24, 0.12, 12), 0xd8ccb0, 0, 0.06, 0); box(0.3, 0.02, 0.3, 0x5e8fb0, 0, 0.12, 0);
      g.userData.h = 0.8; return g; },
    statue: geist => { const { g, box, teil } = teileBau(geist);   // Sockel und Figur
      box(0.5, 0.45, 0.5, 0xd8ccb0, 0, 0.22, 0); teil(new THREE.CylinderGeometry(0.1, 0.13, 0.5, 8), 0xe8e2d4, 0, 0.7, 0); teil(new THREE.SphereGeometry(0.08, 8, 6), 0xe8e2d4, 0, 1.02, 0);
      box(0.06, 0.32, 0.06, 0xe8e2d4, 0.15, 0.78, 0); g.userData.h = 1.1; return g; },
    platz: geist => { const { g, box, teil } = teileBau(geist);   // Pflaster mit Mittelbrunnen
      box(2.95, 0.04, 2.95, 0xd8ccb0, 0, 0.02, 0); for (let i = -1; i <= 1; i++) { box(2.95, 0.045, 0.02, 0xbfb39a, 0, 0.025, i * 0.98); box(0.02, 0.045, 2.95, 0xbfb39a, i * 0.98, 0.025, 0); }
      teil(new THREE.CylinderGeometry(0.3, 0.34, 0.15, 12), 0xc8bca4, 0, 0.08, 0); g.userData.h = 0.4; return g; },
    latrine: geist => { const { g, box, dach } = teileBau(geist);   // langer Raum mit Bogenöffnungen, Wasserrinne
      box(1.7, 0.5, 0.7, 0xd8ccb0, 0, 0.25, -0.05); dach(1.8, 0.8, 0.2, 0xa9583a, 0, 0.5, -0.05);
      for (const x of [-0.5, 0, 0.5]) box(0.24, 0.3, 0.02, 0x3a2a1e, x, 0.17, 0.31);
      box(1.7, 0.04, 0.12, 0x5e8fb0, 0, 0.03, 0.42); g.userData.h = 0.75; return g; },
    kelter: geist => { const { g, box, dach, teil } = teileBau(geist);   // Kelterhaus mit Baumpresse und Dolia
      box(1.5, 0.65, 1.0, 0xd2b48c, -0.1, 0.33, -0.35); dach(1.6, 1.1, 0.3, 0x7a3a2a, -0.1, 0.65, -0.35);
      box(1.3, 0.08, 0.1, 0x5a4330, 0.05, 0.55, 0.45); box(0.1, 0.6, 0.1, 0x5a4330, -0.55, 0.3, 0.45);
      for (let i = 0; i < 4; i++) teil(new THREE.SphereGeometry(0.17, 8, 6), 0xb0703a, -0.6 + i * 0.4, 0.15, 0.75);
      teil(new THREE.CylinderGeometry(0.28, 0.3, 0.12, 10), 0x6a2a5a, 0.45, 0.06, 0.45); g.userData.h = 1.0; return g; },
    oelmuehle: geist => { const { g, box, dach, teil } = teileBau(geist);   // Haus mit Trapetum (Steinbecken, Mühlstein)
      box(1.5, 0.65, 1.0, 0xd8c49a, -0.1, 0.33, -0.35); dach(1.6, 1.1, 0.3, 0x8a4a2a, -0.1, 0.65, -0.35);
      teil(new THREE.CylinderGeometry(0.42, 0.45, 0.25, 14), 0xb8b0a0, 0.3, 0.12, 0.45); teil(new THREE.CylinderGeometry(0.22, 0.22, 0.16, 12).rotateZ(Math.PI / 2), 0x9a948a, 0.3, 0.36, 0.45);
      for (let i = 0; i < 3; i++) teil(new THREE.SphereGeometry(0.15, 8, 6), 0xb0703a, -0.6 + i * 0.32, 0.14, 0.65); g.userData.h = 1.0; return g; },
    garumsiederei: geist => { const { g, box, dach } = teileBau(geist);   // offene Becken und Schuppen
      box(1.6, 0.5, 0.6, 0xc8b898, 0, 0.25, -0.55); dach(1.7, 0.7, 0.2, 0x7a4a2a, 0, 0.5, -0.55);
      for (const [x, z] of [[-0.45, 0.2], [0.45, 0.2], [-0.45, 0.68], [0.45, 0.68]]) { box(0.7, 0.18, 0.38, 0xb8ae98, x, 0.09, z); box(0.58, 0.02, 0.27, 0x8a6a3a, x, 0.185, z); }
      g.userData.h = 0.8; return g; },
    weberei: geist => { const { g, box, dach } = teileBau(geist);   // Werkstatt mit Webstuhl und Wollballen
      box(1.6, 0.7, 1.0, 0xd6c4a8, 0, 0.35, -0.35); dach(1.7, 1.1, 0.3, 0x8a5a3a, 0, 0.7, -0.35);
      box(0.06, 0.6, 0.06, 0x5a4330, -0.3, 0.3, 0.45); box(0.06, 0.6, 0.06, 0x5a4330, 0.3, 0.3, 0.45); box(0.66, 0.05, 0.05, 0x5a4330, 0, 0.6, 0.45);
      box(0.5, 0.45, 0.01, 0xb0402a, 0, 0.33, 0.45); for (const x of [-0.6, 0.62]) box(0.3, 0.25, 0.3, 0xeee6d4, x, 0.13, 0.55); g.userData.h = 1.1; return g; },
    tempel: geist => { const { g, box, saeule, teil } = teileBau(geist);   // Podiumstempel mit Freitreppe, 6 Säulen vorn, Giebel
      box(2.2, 0.45, 2.6, 0xd8ccb0, 0, 0.22, -0.1); for (let i = 0; i < 4; i++) box(1.4, 0.11, 0.18, 0xd8ccb0, 0, 0.055 + i * 0.11, 1.4 - i * 0.18);
      box(1.7, 1.0, 1.5, 0xeee6d4, 0, 0.95, -0.45);
      for (let i = 0; i < 6; i++) teil(new THREE.CylinderGeometry(0.07, 0.08, 1.0, 8), 0xf6f0e2, -0.85 + i * 0.34, 0.95, 0.85);
      for (const z of [0.45, 0.05]) for (const x of [-0.85, 0.85]) teil(new THREE.CylinderGeometry(0.07, 0.08, 1.0, 8), 0xf6f0e2, x, 0.95, z);
      box(2.0, 0.12, 2.3, 0xe8dcc4, 0, 1.5, -0.05);
      const gi = new THREE.Shape(); gi.moveTo(-1.02, 0); gi.lineTo(1.02, 0); gi.lineTo(0, 0.42); gi.lineTo(-1.02, 0);
      teil(new THREE.ExtrudeGeometry(gi, { depth: 2.3, bevelEnabled: false }).translate(0, 0, -1.2), 0xa9482a, 0, 1.56, 0);
      g.userData.h = 2.1; return g; },
    theater: geist => { const { g, box, teil } = teileBau(geist);   // halbrunde Ränge (cavea), Bühnenhaus (scaena)
      for (let i = 0; i < 4; i++) {   // Ränge: halbe Ringe, nach außen höher
        const ri = 0.55 + i * 0.3, ro = ri + 0.3, h = 0.15 + i * 0.15, f = new THREE.Shape();
        f.absarc(0, 0, ro, 0, Math.PI, false); f.lineTo(-ri, 0); f.absarc(0, 0, ri, Math.PI, 0, true); f.lineTo(ro, 0);
        teil(new THREE.ExtrudeGeometry(f, { depth: h, bevelEnabled: false, curveSegments: 20 }).rotateX(-Math.PI / 2), i % 2 ? 0xd8ccb2 : 0xe6dcc6, 0, 0, 0.35);
      }
      teil(new THREE.CylinderGeometry(0.55, 0.55, 0.03, 20, 1, false, Math.PI / 2, Math.PI), 0xc8b898, 0, 0.015, 0.35);
      box(3.6, 0.9, 0.35, 0xd8c8a8, 0, 0.45, 1.15); box(3.7, 0.08, 0.45, 0xb5522f, 0, 0.92, 1.15);
      for (let i = 0; i < 5; i++) box(0.22, 0.4, 0.02, 0x3a2a1e, -1.2 + i * 0.6, 0.25, 0.97);
      box(2.6, 0.12, 0.4, 0xb8a888, 0, 0.06, 0.75); g.userData.h = 1.1; return g; },
  };
  // Baustelle (Wahrzeichen): Fundament, halbhohe Mauern, Gerüst aus Stangen, Kran (Tretkran), Steinstapel
  function baueBaustelle(t) {
    const { g, box, teil } = teileBau(false), [gw, gd] = groesse(t), W = gw - 0.3, D = gd - 0.3;
    if (GEB[t].flach || Math.min(gw, gd) < 2 || bauzeit(t) <= 1) {   // kleine oder flache Bauten: abgesteckt, Erdhaufen, Balken
      box(W, 0.05, D, 0x9a7a52, 0, 0.025, 0);
      for (const [x, z] of [[-W / 2, -D / 2], [W / 2, -D / 2], [-W / 2, D / 2], [W / 2, D / 2]]) box(0.05, 0.5, 0.05, 0x8a6a46, x, 0.25, z);
      box(Math.min(0.6, W * 0.6), 0.12, 0.12, 0x9c7a55, 0, 0.11, D * 0.2); box(0.3, 0.2, 0.3, 0x8a6e52, -W * 0.25, 0.1, -D * 0.2);
      g.userData.h = 0.6; return g;
    }
    box(W, 0.15, D, 0xc8bca4, 0, 0.07, 0);
    for (const [x, z, w, d] of [[0, -D / 2 + 0.1, W, 0.2], [0, D / 2 - 0.1, W, 0.2], [-W / 2 + 0.1, 0, 0.2, D], [W / 2 - 0.1, 0, 0.2, D]]) box(w, 0.6, d, 0xe6dccb, x, 0.45, z);
    for (let x = -W / 2; x <= W / 2 + 0.01; x += W / 5) for (const z of [-D / 2 - 0.15, D / 2 + 0.15]) box(0.05, 1.3, 0.05, 0x8a6a46, x, 0.65, z);
    for (const z of [-D / 2 - 0.15, D / 2 + 0.15]) for (const y of [0.6, 1.2]) box(W, 0.04, 0.05, 0x8a6a46, 0, y, z);
    box(0.1, 2.2, 0.1, 0x6b4a2a, W / 2 - 0.5, 1.1, 0); const arm = box(1.6, 0.08, 0.08, 0x6b4a2a, W / 2 - 1.0, 2.15, 0); arm.rotation.z = -0.25;
    teil(new THREE.CylinderGeometry(0.35, 0.35, 0.15, 12).rotateZ(Math.PI / 2), 0x8a6a46, W / 2 - 0.5, 0.4, 0.5);
    for (let i = 0; i < 4; i++) box(0.4, 0.2, 0.3, 0xd8d2c4, -W / 2 + 0.6 + i * 0.45, 0.25 + (i % 2) * 0.2, D / 2 - 0.6);
    g.userData.h = 2.3; return g;
  }
  function baueMesh(t, stufe = 1, geist = false) {
    const d = GEB[t], [gw, gd] = groesse(t);
    if (t === 'huette' && stufe === 3) return baueInsula();
    if (t === 'domus') return baueDomus(geist);
    if (EIGEN[t]) return EIGEN[t](geist);
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
  const FARBE = { krank: '#9ccb8e', brand: '#f2683a', arbeiter: '#e8a33a', rohstoff: '#e8a33a', voll: '#c9bba4', wald: '#9ccb8e', hunger: '#f28c6e', wasser: '#7fb6e0', markt: '#e9b44c', winter: '#dfe6ee' };
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
    else if (art === 'krank') { x.moveTo(26, 18); x.lineTo(38, 18); x.moveTo(32, 18); x.lineTo(32, 44); x.moveTo(26, 30); x.quadraticCurveTo(32, 24, 38, 30); x.quadraticCurveTo(32, 36, 26, 30); }
    else if (art === 'brand') { x.moveTo(32, 12); x.quadraticCurveTo(46, 28, 42, 38); x.quadraticCurveTo(38, 46, 32, 46); x.quadraticCurveTo(22, 46, 22, 36); x.quadraticCurveTo(22, 28, 28, 24); x.quadraticCurveTo(30, 30, 33, 30); x.quadraticCurveTo(36, 22, 32, 12); }
    else if (art === 'markt') { x.moveTo(18, 26); x.lineTo(22, 16); x.lineTo(42, 16); x.lineTo(46, 26); x.closePath(); x.moveTo(22, 26); x.lineTo(22, 42); x.lineTo(42, 42); x.lineTo(42, 26); }
    else { x.arc(32, 30, 8, 0, Math.PI * 2); }
    x.stroke();
    const tex = new THREE.CanvasTexture(c); symbolTex.set(art, tex); return tex;
  }

  // Leistung (1.11.): Teile eines Gebäudes zu einem Mesh mit Farben je Ecke verschmelzen → 1 Draw-Call je Gebäude.
  // Bewegte (Mühlstein), durchsichtige und Flammen-Teile bleiben einzeln.
  function verschmelzen(g) {
    g.updateMatrixWorld(true);
    const pos = [], nor = [], col = [], weg = [], farbe = new THREE.Color();
    const inv = new THREE.Matrix4().copy(g.matrixWorld).invert(), m4 = new THREE.Matrix4();
    let schatten = false;
    g.traverse(m => {
      if (!m.isMesh || m.isInstancedMesh || Array.isArray(m.material) || m.material.transparent || m.userData.dreht || m.userData.drehY || m.userData.flamme !== undefined) return;
      let anim = false; for (let o = m.parent; o && o !== g; o = o.parent) if (o.userData.dreht || o.userData.drehY) anim = true;
      if (anim) return;
      const geo = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone();
      geo.applyMatrix4(m4.multiplyMatrices(inv, m.matrixWorld));
      if (!geo.attributes.normal) geo.computeVertexNormals();
      const P = geo.attributes.position, N = geo.attributes.normal, C = m.material.vertexColors ? geo.attributes.color : null;
      farbe.copy(m.material.color || new THREE.Color(1, 1, 1));
      for (let i = 0; i < P.count; i++) {
        pos.push(P.getX(i), P.getY(i), P.getZ(i)); nor.push(N.getX(i), N.getY(i), N.getZ(i));
        if (C) col.push(C.getX(i) * farbe.r, C.getY(i) * farbe.g, C.getZ(i) * farbe.b); else col.push(farbe.r, farbe.g, farbe.b);
      }
      schatten = schatten || m.castShadow; weg.push(m);
    });
    if (weg.length < 2) return g;
    for (const m of weg) m.parent.remove(m);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    const ein = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true }));
    ein.castShadow = schatten; ein.receiveShadow = true; g.add(ein);
    return g;
  }
  // Straßen als ein Instanced-Mesh
  let strassenMesh = null, strassenSchluessel = '';
  function strassenZeichnen(liste) {
    const k = liste.length + ':' + liste.reduce((s, b) => s + b.x * 41 + b.z * 7, 0);
    if (k === strassenSchluessel) return; strassenSchluessel = k;
    if (strassenMesh) { szene.remove(strassenMesh); strassenMesh.geometry.dispose(); }
    strassenMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.03, 1), new THREE.MeshLambertMaterial({ color: GEB.strasse.wand }), Math.max(1, liste.length));
    const mm = new THREE.Matrix4();
    liste.forEach((b, i) => strassenMesh.setMatrixAt(i, mm.makeTranslation(welt0 + b.x + 0.5, 0.025, welt0 + b.z + 0.5)));
    strassenMesh.count = liste.length; strassenMesh.receiveShadow = true; szene.add(strassenMesh);
  }

  // Stadtmauer als zwei Instanced-Meshes: fertig (Mauer mit Zinnen) und im Bau (halbhoch, heller)
  let mauerMesh = null, mauerBau = null, mauerSchl = '';
  function mauernZeichnen(liste) {
    const k = liste.map(b => b.x * 41 + b.z * 7 + (b.bau > 0 ? 1e6 : 0)).reduce((a, v) => a + v, liste.length);
    if (k === mauerSchl) return; mauerSchl = k;
    for (const m of [mauerMesh, mauerBau]) if (m) { szene.remove(m); m.geometry.dispose(); }
    const geo = new THREE.BoxGeometry(1, 0.9, 1).translate(0, 0.45, 0), zinne = new THREE.BoxGeometry(0.3, 0.18, 1).translate(0, 0.99, 0);
    const mm = new THREE.Matrix4(), fertig = liste.filter(b => !(b.bau > 0)), bau = liste.filter(b => b.bau > 0);
    const baue = (arr, h, farbe) => { const m = new THREE.InstancedMesh(geo, new THREE.MeshLambertMaterial({ color: farbe }), Math.max(1, arr.length));
      arr.forEach((b, i) => m.setMatrixAt(i, mm.compose(new THREE.Vector3(welt0 + b.x + 0.5, 0, welt0 + b.z + 0.5), new THREE.Quaternion(), new THREE.Vector3(0.96, h, 0.96))));
      m.count = arr.length; m.castShadow = true; m.receiveShadow = true; szene.add(m); return m; };
    mauerMesh = baue(fertig, 1, 0xcfc4a8); mauerBau = baue(bau, 0.4, 0xe2d8c0);
  }

  let buergerAn = true;

  let letzter = null;
  function abgleichen(S, auswahlId) {
    letzter = [S, auswahlId];
    const da = new Set();
    const strassen = [], mauern = [];
    for (const b of S.geb) {
      if (b.t === 'strasse') { strassen.push(b); continue; }   // alle Straßen zusammen als ein Instanced-Mesh (1.11.)
      if (b.t === 'mauer') { mauern.push(b); continue; }        // Stadtmauer ebenso (Phase A)
      da.add(b.id);
      if (b.dreh === undefined) b.dreh = frontSeite(S, b.t, b.x, b.z);   // alte Spielstände
      const schluessel = b.t + b.stufe + 'd' + b.dreh + (b.bau > 0 ? 'B' : '');
      let o = objekte.get(b.id);
      if (!o || o.schluessel !== schluessel) {
        if (o) gruppe.remove(o.g);
        const g = verschmelzen(b.bau > 0 ? baueBaustelle(b.t) : baueMesh(b.t, b.stufe));
        const [gw, gd] = groesse(b.t);
        g.position.copy(weltPos(b.x + gw / 2, b.z + gd / 2));
        g.rotation.y = [0, Math.PI / 2, Math.PI, -Math.PI / 2][b.dreh || 0];
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
      // Brand (S3.3): Flammen und Rauch, Gebäude glüht
      if ((b.brand > 0) !== !!o.feuer) {
        if (o.feuer) { o.g.remove(o.feuer); o.feuer = null; }
        else {
          const f = new THREE.Group(), [gw, gd] = groesse(b.t), h = o.g.userData.h || 1;
          for (let i = 0; i < 5; i++) {
            const fl = new THREE.Mesh(new THREE.ConeGeometry(0.22 + (i % 2) * 0.1, 0.9, 6), new THREE.MeshBasicMaterial({ color: i % 2 ? 0xffb030 : 0xf05a20, transparent: true, opacity: 0.85 }));
            fl.position.set(((i * 37) % 10 / 10 - 0.5) * gw * 0.7, h * 0.8, ((i * 53) % 10 / 10 - 0.5) * gd * 0.7); fl.userData.flamme = i; f.add(fl);
          }
          for (let i = 0; i < 4; i++) { const r = new THREE.Mesh(new THREE.SphereGeometry(0.3 + i * 0.12, 6, 4), new THREE.MeshLambertMaterial({ color: 0x3a3632, transparent: true, opacity: 0.5 - i * 0.09 }));
            r.position.set(0.1 * i, h + 0.6 + i * 0.5, -0.1 * i); f.add(r); }
          o.g.add(f); o.feuer = f;
        }
      }
      // Auswahl hervorheben
      const an = b.id === auswahlId, af = ansichtGeb.get(b.id);
      const glanz = b.brand > 0 ? 0x5a1e04 : an ? 0x3a2a08 : af !== undefined ? new THREE.Color(af).multiplyScalar(0.3).getHex() : 0x000000;
      o.g.traverse(m => { if (m.isMesh && m.material.emissive) m.material.emissive.setHex(glanz); });
    }
    for (const [id, o] of objekte) if (!da.has(id)) { gruppe.remove(o.g); objekte.delete(id); }
    strassenZeichnen(strassen); mauernZeichnen(mauern);
    laufwege(S);
  }

  // Laufwege (S1.2): Arbeiter zwischen Haus und Betrieb, Träger vom Erzeuger zum Abnehmer (Instancing, Farbe je Figur)
  const LMAX = 700, SCHRITT = 1.1;   // 1.11. Phase C: Bürger und Markttreiben (vorher 240)   // Figuren höchstens, Felder je Sekunde bei normalem Tempo
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
    const vor = new Int32Array(RASTER * TIEFE).fill(-2), q = [];
    for (const i of randFelder(a.t, a.x, a.z)) if (maske[i]) { vor[i] = -1; q.push(i); }
    for (let k = 0; k < q.length; k++) {
      const i = q[k];
      if (ziel.has(i)) { const p = []; for (let j = i; j >= 0; j = vor[j]) p.push(j); return p.reverse(); }
      const x = i % RASTER, z = (i - x) / RASTER;
      for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const ax = x + dx, az = z + dz, j = az * RASTER + ax;
        if (ax >= 0 && az >= 0 && ax < RASTER && az < TIEFE && maske[j] && vor[j] === -2) { vor[j] = i; q.push(j); }
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
      if (!b.von || !(b.w || b.bw)) continue;
      b.von.forEach(([hid, n], k) => {
        const h = nach.get(hid); if (!h) return;
        for (let i = 0; i < Math.min(n, 2); i++)
          neu.push(weg(punkte(maske, h, b), TUNIKA[(hid + i + k) % TUNIKA.length], '', `${hid}-${b.id}-${i}`));
      });
      const d = GEB[b.t];
      if (b.bau > 0 && b.bw > 0) {   // Materialfuhren: Träger bringen Baustoffe aus Speicher oder Werkstatt zur Baustelle
        const st = Object.keys(d.kosten).find(g => g !== 'denare') || 'holz', quelle = nachste(b, ['speicher', st === 'holz' ? 'holzfaeller' : st === 'ziegel' ? 'ziegelei' : 'markt']);
        if (quelle) for (let i = 0; i < 2; i++) neu.push(weg(punkte(maske, quelle, b), TUNIKA[(b.id + i) % TUNIKA.length], st, `m${b.id}-${i}`));
        continue;
      }
      if (d.erzeugt && !b.status.some(s => !s.leicht)) {
        const g = Object.keys(d.erzeugt)[0], ziel = nachste(b, ABNEHMER(g));
        if (ziel) neu.push(weg(punkte(maske, b, ziel), TUNIKA[(b.id + 3) % TUNIKA.length], g, `t${b.id}-${ziel.id}`));
      }
    }
    // Phase C: Bürger gehen von ihrem Haus zum Markt (sonst Brunnen) und zurück; Markttreiben rund um die Stände
    if (buergerAn) {
      for (const h of S.geb) {
        if (h.t !== 'huette' && h.t !== 'domus' || !(h.bew > 0) || h.bau > 0) continue;
        const ziel = nachste(h, ['markt']) || S.geb.find(o => o.t === 'brunnen' && !(o.bau > 0) && Math.hypot(o.x - h.x, o.z - h.z) < 12);
        if (!ziel) continue;
        const n = h.bew >= 20 ? 2 : 1;
        for (let i = 0; i < n; i++) neu.push(weg(punkte(maske, h, ziel), TUNIKA[(h.id * 3 + i) % TUNIKA.length], '', `b${h.id}-${i}`));
      }
      for (const m of S.geb.filter(b => b.t === 'markt' && b.w > 0)) {
        const [gw, gd] = groesse('markt'), cx = welt0 + m.x + gw / 2, cz = welt0 + m.z + gd / 2, r = 1.75;
        for (let i = 0; i < 6; i++) { const a0 = i * 1.05, ring = []; for (let k = 0; k <= 8; k++) { const a = a0 + k * 0.78; ring.push([cx + Math.cos(a) * r * (0.8 + (i % 3) * 0.12), cz + Math.sin(a) * r * (0.8 + (i % 3) * 0.12)]); }
          neu.push(weg(ring, TUNIKA[(m.id + i) % TUNIKA.length], i % 3 === 0 ? 'getreide' : '', `mk${m.id}-${i}`)); }
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
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55, depthWrite: false }), RASTER * TIEFE);
  for (let i = 0; i < RASTER * TIEFE; i++) ansichtFelder.setColorAt(i, new THREE.Color(0xffffff));
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
  function vorschau(t, x, z, gueltig, dreh = 0) {
    if (!t) { if (geist) { szene.remove(geist); geist = null; geistTyp = ''; } return; }
    if (geistTyp !== t) { if (geist) szene.remove(geist); geist = baueMesh(t, 1, true); geistTyp = t; szene.add(geist); }
    const [gw, gd] = groesse(t);
    geist.position.copy(weltPos(x + gw / 2, z + gd / 2)).setY(0.02); geist.rotation.y = [0, Math.PI / 2, Math.PI, -Math.PI / 2][dreh];
    geist.traverse(m => { if (m.isMesh) m.material.emissive && m.material.emissive.setHex(gueltig ? 0x1e5a1e : 0x7a1e1e); });
  }

  function jahreszeitFarbe(js) { bodenMat.color.setHex(JAHRESZEITEN[js].boden); wetterSetzen(js); }
  // Wetter (1.11.): Schnee im Winter, Regen im Frühling, Blätter im Herbst – ein Points-Objekt um den Blickpunkt
  const WN = 700, wPos = new Float32Array(WN * 3), wGeo = new THREE.BufferGeometry();
  for (let i = 0; i < WN; i++) { wPos[i * 3] = (Math.random() - 0.5) * 60; wPos[i * 3 + 1] = Math.random() * 20; wPos[i * 3 + 2] = (Math.random() - 0.5) * 60; }
  wGeo.setAttribute('position', new THREE.BufferAttribute(wPos, 3));
  const wMat = new THREE.PointsMaterial({ color: 0xffffff, size: 3, sizeAttenuation: false, transparent: true, opacity: 0.8, depthWrite: false });
  const wetter = new THREE.Points(wGeo, wMat); wetter.frustumCulled = false; wetter.visible = false; szene.add(wetter);
  let wArt = '', wetterAn = true;
  const WETTER = { 3: { farbe: 0xffffff, size: 3, fall: 1.6, wind: 0.4, op: 0.85 }, 0: { farbe: 0xa8c4dc, size: 2, fall: 14, wind: 1.5, op: 0.55 }, 2: { farbe: 0xc8742a, size: 4, fall: 1.2, wind: 1.8, op: 0.9, wenige: true } };
  function wetterSetzen(js) {
    const w = WETTER[js]; wArt = w ? js : ''; wetter.visible = !!w && wetterAn;
    if (w) { wMat.color.setHex(w.farbe); wMat.size = w.size; wMat.opacity = w.op; wGeo.setDrawRange(0, w.wenige ? 90 : WN); }
  }
  function wetterSchalten(an) { wetterAn = an; wetter.visible = an && wArt !== ''; }
  function wetterBewegen(dt) {
    if (!wetter.visible) return;
    const w = WETTER[wArt], t = performance.now() / 1000;
    for (let i = 0; i < WN; i++) {
      let y = wPos[i * 3 + 1] - w.fall * dt * (0.7 + (i % 7) / 10);
      wPos[i * 3] += (w.wind + Math.sin(t + i) * 0.3) * dt;
      if (y < 0) { y += 20; wPos[i * 3] = (Math.random() - 0.5) * 60; wPos[i * 3 + 2] = (Math.random() - 0.5) * 60; }
      if (wPos[i * 3] > 30) wPos[i * 3] -= 60;
      wPos[i * 3 + 1] = y;
    }
    wGeo.attributes.position.needsUpdate = true;
    wetter.position.set(ziel.x, 0, ziel.z);
  }

  // Kamera
  function groesseAnpassen() {
    const w = leinwand.clientWidth, h = leinwand.clientHeight;
    renderer.setSize(w, h, false);
    const a = w / Math.max(1, h);
    Object.assign(kamera, { left: -RAHMEN * a, right: RAHMEN * a, top: RAHMEN, bottom: -RAHMEN });
    kamera.updateProjectionMatrix();
  }
  function kameraSetzen() {
    if (modus === 'region') { ziel.x = Math.max(REG_X - 28, Math.min(REG_X + 28, ziel.x)); ziel.z = Math.max(-26, Math.min(26, ziel.z)); }
    else {
      ziel.x = Math.max(welt0, Math.min(welt0 + Math.min(RASTER, grenzeX + 6), ziel.x)); ziel.z = Math.max(welt0, Math.min(-welt0, ziel.z));
      // Schatten folgen dem Blick (Schattenbereich ±30 Felder)
      const sx = Math.round(ziel.x / 8) * 8;
      if (sonne.target.position.x !== sx) { sonne.position.set(sx - 18, 30, 10); sonne.target.position.set(sx, 0, 0); sonne.target.updateMatrixWorld(); }
    }
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
  const HOEHE = { hang: 0.75, fluss: 0.08, stadt: 0.3, nachbar: 0.3, stein: 0.65, erz: 0.6, gallier: 0.36 };
  function regionBauen() {
    const g = new THREE.Group(), felder = erzeugeRegion(), lam = c => new THREE.MeshLambertMaterial({ color: c });
    const hexGeo = h => new THREE.CylinderGeometry(HEX, HEX, h, 6).rotateY(Math.PI / 6).translate(0, h / 2 - 0.2, 0);
    const rand = 0.82 * HEX;
    [...felder, ...sonderFelder()].forEach(f => {
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
      if (f.typ === 'stein') { for (let i = 0; i < 7; i++) { const [a, b] = im(); add(new THREE.BoxGeometry(0.5 + zz() * 0.6, 0.3 + zz() * 0.5, 0.5 + zz() * 0.5), i % 2 ? 0xc8c2b4 : 0xa8a294, a, 0.2, b, zz() * 3); }
        add(new THREE.BoxGeometry(1.6, 0.6, 0.12), 0xd8d2c4, 0.4, 0.3, -1.4, 0.3); }
      if (f.typ === 'erz') { for (let i = 0; i < 6; i++) { const [a, b] = im(); add(new THREE.DodecahedronGeometry(0.3 + zz() * 0.3, 0), i % 3 ? 0x7a5a48 : 0x5a4a44, a, 0.2, b); }
        add(new THREE.BoxGeometry(0.7, 0.55, 0.12), 0x2a201a, -0.6, 0.27, -0.9); }
      if (f.typ === 'gallier') {   // Rundhütten mit Strohdach hinter einer Palisade
        for (let i = 0; i < 28; i++) { const w = i / 28 * Math.PI * 2; add(new THREE.CylinderGeometry(0.06, 0.07, 0.7, 4), 0x6b4a2a, Math.cos(w) * HEX * 0.72, 0.35, Math.sin(w) * HEX * 0.72); }
        [[0, 0, 0.8], [-1.1, 0.5, 0.55], [1.0, 0.6, 0.6], [0.2, -1.2, 0.55], [-0.8, -0.9, 0.5]].forEach(([a, b, r]) => {
          add(new THREE.CylinderGeometry(r, r, 0.45, 10), 0xb89a70, a, 0.22, b); add(new THREE.ConeGeometry(r * 1.15, r * 1.1, 10), 0xc8a85a, a, 0.45 + r * 0.55, b); });
        add(new THREE.CylinderGeometry(0.02, 0.02, 1.4, 4), 0x5a4330, 1.6, 0.7, -0.6); add(new THREE.BoxGeometry(0.02, 0.35, 0.5), 0x3f6e3c, 1.6, 1.25, -0.35);
      }
      if (f.typ === 'fluss') for (let i = 0; i < 4; i++) { const [a, b] = im(); add(new THREE.ConeGeometry(0.1, 0.5, 4), 0x7d8a48, a * 1.05, 0.25, b * 1.05); }
      if (f.typ === 'stadt' || f.typ === 'nachbar') {
        add(new THREE.CylinderGeometry(HEX * 0.8, HEX * 0.8, 0.04, 24), 0xc9b48a, 0, 0.02, 0);
        const mauer = new THREE.Mesh(new THREE.TorusGeometry(HEX * 0.8, 0.09, 4, 32).rotateX(Math.PI / 2), lam(0xb8aa8c)); mauer.position.set(x, top + 0.12, z); g.add(mauer);
        const orte = f.id === 'mantua' ? [['speicher', -0.5, 0.9, 0.3], ['casa', 0.8, -0.6, 0.36], ['casa', -0.9, -0.7, 0.36], ['ziegelei', 0.9, 0.8, 0.32], ['huette', 0, 0, 0.36], ['casa', -0.2, -1.4, 0.34]]
          : f.typ === 'nachbar'   // Placentia (S2.5): kleiner, mit Speicher am Fluss
          ? [['speicher', 0.4, 1.0, 0.3], ['casa', -0.9, -0.4, 0.36], ['casa', 0.7, -0.9, 0.36], ['huette', -0.6, 1.1, 0.36], ['huette', 1.3, 0.1, 0.36], ['brunnen', 0, 0, 0.5]]
          : [['markt', 0, 0, 0.35], ['casa', -1.1, -0.6, 0.38], ['casa', 1.1, -0.5, 0.38], ['casa', -0.3, 1.2, 0.38], ['huette', 1.0, 1.0, 0.38], ['huette', -1.4, 0.6, 0.38], ['speicher', 0.2, -1.5, 0.3]];
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
    const f = region.felder.find(h => h.q === rq && h.r === rr) || sonderFelder().find(h => h.q === rq && h.r === rr) || null;
    if (wahlRing) { wahlRing.visible = !!f; if (f) { const [hx, hz] = hexMitte(f.q, f.r); wahlRing.position.set(hx, (HOEHE[f.typ] ?? 0.32) + 0.03, hz); } }
    return f;
  }
  const regionInfo = () => region ? region.felder.length : 0;
  // Stand des Umlands zeichnen: Pflöcke (Vermessung/vermessen), Betriebsmodell
  const landObj = new Map();
  let landS = null;
  function landAbgleichen(S) {
    landS = S; kTempo = hat(S, 'roemerstrasse') ? 3 : hat(S, 'schotter') ? 2 : 1; if (!region) return;
    for (const f of region.felder) {
      const k = landKey(f), stand = landStand(S, f), l = (S.land || {})[k];
      const wegNach = hatWeg(S, f) ? nachbarn(f).map(n => n && hatWeg(S, n) ? 1 : 0).join('') : '';
      const schl = stand + (l && l.betrieb || '') + wegNach + (l && l.turm ? 'T' : '') + (l && l.deich ? 'D' : '') + (l && l.stoer > 0 ? 'S' + l.stoerArt : '') + (l && l.villa ? 'V' : '') + (l && l.vicus ? 'Vc' : '') + (hat(S, 'schotter') ? 'G' : '');
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
        const n = nachbarn(f)[i], [nx, nz] = hexMitte(n.q, n.r), dx = nx - x, dz = nz - z, ganz = n.typ === 'nachbar' || n.typ === 'gallier' ? 2 : 1, L = Math.hypot(dx, dz) / 2 * ganz;
        const st = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.05, L + 0.3), new THREE.MeshLambertMaterial({ color: hat(S, 'schotter') ? 0xbdb6a6 : 0x9c8460 }));
        st.position.set(x + dx / 4 * ganz, top + 0.03, z + dz / 4 * ganz); st.rotation.y = Math.atan2(dx, dz); st.receiveShadow = true; g.add(st);
      });
      if (l) gefahrZeichnen(g, f, l, x, z, top);
      if (l && l.vicus) for (const [a, c] of [[-1.3, -0.6], [-0.4, -1.4], [0.6, -1.3], [-1.5, 0.6], [1.6, -0.2]]) {   // Hütten des Dorfes
        const mo = modelle && modelle.huette, m = mo ? new THREE.Mesh(mo.geo, new THREE.MeshLambertMaterial({ vertexColors: true })) : new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 0.6), new THREE.MeshLambertMaterial({ color: 0xd8b88a }));
        m.scale.setScalar(mo ? 0.45 : 1); m.position.set(x + a, top, z + c); m.rotation.y = a * 2; m.castShadow = true; g.add(m);
      }
      if (stand === 'betrieb' && l.betrieb === 'kastell') {
        const lam = c => new THREE.MeshLambertMaterial({ color: c }), A = 1.1;
        for (const [a, b, w, d] of [[0, -A, 2 * A, 0.2], [0, A, 2 * A, 0.2], [-A, 0, 0.2, 2 * A], [A, 0, 0.2, 2 * A]]) {
          const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.5, d), lam(0xb8aa8c)); m.position.set(x + a, top + 0.25, z + b); g.add(m); }
        for (const [a, b] of [[-A, -A], [A, -A], [-A, A], [A, A]]) {
          const t = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.85, 0.4), lam(0xa89a7c)); t.position.set(x + a, top + 0.42, z + b); g.add(t); }
        const zelt = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.35, 0.7), lam(0x9a4a2b)); zelt.position.set(x, top + 0.18, z); g.add(zelt);
        const fahne = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.3, 0.45), lam(0xa8261f)); fahne.position.set(x + A, top + 1.15, z - A + 0.2); g.add(fahne);
        g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
      } else if (stand === 'betrieb' && (l.betrieb === 'anleger' || l.betrieb === 'fischer')) {
        const lam = c => new THREE.MeshLambertMaterial({ color: c });
        if (l.betrieb === 'anleger') {
          const steg = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.08, 0.7), lam(0x8a6a46)); steg.position.set(x, top + 0.12, z - 0.4); g.add(steg);
          for (const sx of [-1, 0, 1]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 5), lam(0x5a4330)); p.position.set(x + sx * 0.95, top + 0.05, z - 0.1); g.add(p); }
          const lager = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.5, 0.6), lam(0xcbb894)); lager.position.set(x - 0.4, top + 0.25, z - 1.3); g.add(lager);
          const dach = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.08, 0.7), lam(0xa9583a)); dach.position.set(x - 0.4, top + 0.54, z - 1.3); g.add(dach);
        } else {
          const boot = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.14, 1.3), lam(0x6b4a2a)); boot.position.set(x + 0.5, top + 0.1, z + 0.3); boot.rotation.y = 0.6; g.add(boot);
          const netz = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.01, 10), new THREE.MeshLambertMaterial({ color: 0xd8d0b8, transparent: true, opacity: 0.5 })); netz.position.set(x - 0.6, top + 0.06, z - 0.2); g.add(netz);
          const h = modelle && modelle.huette; if (h) { const m = new THREE.Mesh(h.geo, new THREE.MeshLambertMaterial({ vertexColors: true })); m.scale.setScalar(0.6); m.position.set(x - 0.9, top, z - 1.4); g.add(m); }
        }
        g.traverse(o => { if (o.isMesh) o.castShadow = true; });
      } else if (stand === 'betrieb') {
        const t = l.villa ? 'casa' : LAND_BETRIEBE[l.betrieb].modell, mo = modelle && modelle[t];
        const m = mo ? new THREE.Mesh(mo.geo, new THREE.MeshLambertMaterial({ vertexColors: true })) : new THREE.Mesh(new THREE.BoxGeometry(1, 0.7, 1), new THREE.MeshLambertMaterial({ color: 0xd8b88a }));
        m.scale.setScalar(mo ? 0.9 : 1); m.position.set(x + 0.9, top, z + 0.9); m.castShadow = true; m.receiveShadow = true; g.add(m);
      }
      region.g.add(g); landObj.set(k, { g, schl });
    }
    // Karren (S2.3): je verbundenem Betrieb einer, fährt beladen zur Stadt und leer zurück
    for (const k of karren) region.g.remove(k.g);
    karren = [];
    // Flussboote: pendeln zwischen je zwei verbundenen Anlegern
    const anl = region.felder.filter(f => ((S.land || {})[landKey(f)] || {}).betrieb === 'anleger');
    for (let i = 1; i < anl.length; i++) {
      const a = anl[i - 1], b = anl[i], [ax, az] = hexMitte(a.q, a.r), [bx, bz] = hexMitte(b.q, b.r);
      const g = new THREE.Group(), lam = col => new THREE.MeshLambertMaterial({ color: col });
      const rumpf = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.2, 1.6), lam(0x6b4a2a)); rumpf.position.y = 0.12; g.add(rumpf);
      const ladung = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.2, 0.8), lam(0xd9c26e)); ladung.position.y = 0.32; g.add(ladung);
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.2, 4), lam(0x5a4330)); mast.position.set(0, 0.7, 0.4); g.add(mast);
      const segel = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.7, 0.6), lam(0xe8dcc0)); segel.position.set(0, 0.85, 0.4); g.add(segel);
      g.traverse(o => { if (o.isMesh) o.castShadow = true; });
      const pts = [[ax, az, 0.1], [bx, bz, 0.1]], L = Math.hypot(bx - ax, bz - az);
      region.g.add(g); karren.push({ g, pts, c: [0, L], L, last: ladung, ph: i * 3 });
    }
    for (const f of region.felder) {
      const l = (S.land || {})[landKey(f)]; if (!l || !l.betrieb || !Object.keys(LAND_BETRIEBE[l.betrieb].erzeugt).length) continue;
      const pf = hatWeg(S, f) && wegPfad(S, f); if (!pf) continue;
      const pts = pf.map(h => { const [x, z] = hexMitte(h.q, h.r); return [x, z, (HOEHE[h.typ] ?? 0.32) + 0.05]; });
      const c = [0]; for (let i = 1; i < pts.length; i++) c.push(c[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
      const g = new THREE.Group(), lam = col => new THREE.MeshLambertMaterial({ color: col });
      const wagen = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.18, 0.8), lam(0x6b4a2a)); wagen.position.y = 0.22; g.add(wagen);
      for (const sx of [-1, 1]) { const rad = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.06, 8).rotateZ(Math.PI / 2), lam(0x3a2a1a)); rad.position.set(sx * 0.28, 0.16, 0); g.add(rad); }
      const last = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.18, 0.6), lam({ olivenhain: 0x6a7a3a, schaeferei: 0xeee6d4, weinberg: 0x6a2a5a, gehoeft: 0xe0c464, holzlager: 0x8a6a46, lehmstich: 0x9a6b4a, steinbruch: 0xd0cabc, erzgrube: 0x6a5048, fischer: 0x9ab8c8 }[l.betrieb] || 0xd9c26e));
      last.position.y = 0.4; g.add(last);
      const ochse = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.6), lam(0xb8a890)); ochse.position.set(0, 0.3, 0.85); g.add(ochse);
      g.traverse(o => { if (o.isMesh) o.castShadow = true; });
      region.g.add(g); karren.push({ g, pts, c, L: c[c.length - 1], last, ph: (f.q * 3 + f.r * 7 + 20) % 10 });
    }
    haendler(S);
  }
  // Gefahren (S2.6): Wachturm, Deich zum Fluss hin, Rauch (geplündert) oder Wasser (überflutet)
  function gefahrZeichnen(g, f, l, x, z, top) {
    const lam = c => new THREE.MeshLambertMaterial({ color: c });
    if (l.turm) {
      const t = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.7, 0.5), lam(0xa89a7c)); t.position.set(x - 1.3, top + 0.85, z + 0.7); t.castShadow = true; g.add(t);
      const d = new THREE.Mesh(new THREE.ConeGeometry(0.48, 0.45, 4).rotateY(Math.PI / 4), lam(0x9a4a2b)); d.position.set(x - 1.3, top + 1.92, z + 0.7); d.castShadow = true; g.add(d);
    }
    if (l.deich) nachbarn(f).forEach(n => {
      if (!n || n.typ !== 'fluss') return;
      const [nx, nz] = hexMitte(n.q, n.r), dx = nx - x, dz = nz - z, L = Math.hypot(dx, dz);
      const m = new THREE.Mesh(new THREE.BoxGeometry(HEX * 0.95, 0.28, 0.45), lam(0x6f7f45));
      m.position.set(x + dx / L * HEX * 0.72, top + 0.12, z + dz / L * HEX * 0.72); m.rotation.y = Math.atan2(dx, dz); m.castShadow = true; g.add(m);
    });
    if (l.stoer > 0 && l.stoerArt === 'hochwasser') {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(HEX * 0.85, HEX * 0.85, 0.06, 6).rotateY(Math.PI / 6), new THREE.MeshLambertMaterial({ color: 0x5e8fb0, transparent: true, opacity: 0.7 }));
      w.position.set(x, top + 0.12, z); g.add(w);
    } else if (l.stoer > 0) {
      for (let i = 0; i < 4; i++) { const r = new THREE.Mesh(new THREE.SphereGeometry(0.35 + i * 0.12, 6, 4), new THREE.MeshLambertMaterial({ color: 0x3a3632, transparent: true, opacity: 0.55 - i * 0.1 }));
        r.position.set(x + 0.9 + i * 0.15, top + 1.2 + i * 0.55, z + 0.9 - i * 0.1); g.add(r); }
    }
  }
  // Händler (1.11.): Maultierkarren über die Feldwege zu Mantua/Placentia, sonst Handelsboot vom Anleger nach Placentia
  function haendler(S) {
    const lam = c => new THREE.MeshLambertMaterial({ color: c });
    for (const [id, pf] of [['placentia', nachbarFeld], ['mantua', mantuaFeld]]) {
      if (!handelOffen(S, id)) continue;
      const nb = nachbarn(pf).find(n => n && n.typ !== 'nachbar' && n.typ !== 'gallier' && regionKarte().includes(n) && hatWeg(S, n) && verbunden(S, n));
      const [px, pz] = hexMitte(pf.q, pf.r), g = new THREE.Group();
      let pts;
      if (nb) {
        const weg = wegPfad(S, nb); if (!weg) continue;
        pts = weg.reverse().map(h => { const [x, z] = hexMitte(h.q, h.r); return [x, z, (HOEHE[h.typ] ?? 0.32) + 0.05]; }).concat([[px, pz, 0.35]]);
        const wagen = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.16, 0.7), lam(0x7a5a3a)); wagen.position.y = 0.2; g.add(wagen);
        for (const sx of [-1, 1]) { const rad = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.05, 8).rotateZ(Math.PI / 2), lam(0x3a2a1a)); rad.position.set(sx * 0.25, 0.15, 0); g.add(rad); }
        const esel = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.26, 0.5), lam(0x8a8078)); esel.position.set(0, 0.28, 0.7); g.add(esel);
      } else {
        const anl = regionKarte().filter(f => ((S.land || {})[landKey(f)] || {}).betrieb === 'anleger' && verbunden(S, f))
          .sort((a, b) => Math.hypot(...hexMitte(a.q, a.r).map((v, i) => v - [px, pz][i])) - Math.hypot(...hexMitte(b.q, b.r).map((v, i) => v - [px, pz][i])))[0];
        if (!anl) continue;
        const [ax, az] = hexMitte(anl.q, anl.r); pts = [[ax, az, 0.1], [px, pz + 2.2, 0.1]];
        const rumpf = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.2, 1.7), lam(0x5a3a22)); rumpf.position.y = 0.12; g.add(rumpf);
        const segel = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.8, 0.7), lam(0xc8a070)); segel.position.set(0, 0.8, 0.2); g.add(segel);
      }
      const last = new THREE.Group();
      [0xb0402a, 0x3f6e8c, 0xe0c464].forEach((c, i) => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.16), lam(c)); m.position.set(-0.13 + i * 0.13, 0.36, (i - 1) * 0.15); last.add(m); });
      g.add(last); g.traverse(o => { if (o.isMesh) o.castShadow = true; });
      const c = [0]; for (let i = 1; i < pts.length; i++) c.push(c[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
      region.g.add(g); karren.push({ g, pts, c, L: c[c.length - 1], last, ph: id.length * 2, beide: true, haendler: id });
    }
  }
  let karren = [], kzeit = 0, kTempo = 1;
  function karrenFahren(dt) {
    kzeit += dt;
    for (const k of karren) {
      if (k.L <= 0) continue;
      const v = 1.6 * kTempo, hin = k.L / v, zyklus = 2 * hin + 3, t = (kzeit + k.ph) % zyklus;
      const zurStadt = t < hin + 1.5, s = t < hin ? t * v : t < hin + 1.5 ? k.L : t < 2 * hin + 1.5 ? k.L - (t - hin - 1.5) * v : 0;
      let i = 1; while (i < k.c.length - 1 && k.c[i] < s) i++;
      const a = k.pts[i - 1], b = k.pts[i], f = Math.min(1, (s - k.c[i - 1]) / Math.max(1e-6, k.c[i] - k.c[i - 1]));
      k.g.position.set(a[0] + (b[0] - a[0]) * f, a[2] + (b[2] - a[2]) * f, a[1] + (b[1] - a[1]) * f);
      const dir = zurStadt ? 1 : -1; k.g.rotation.y = Math.atan2((b[0] - a[0]) * dir, (b[1] - a[1]) * dir);
      k.last.visible = zurStadt || !!k.beide;
    }
  }

  function zentrieren(x, z) { ziel.copy(weltPos(x, z)); kameraSetzen(); }

  let zeit = 0;
  function zeichnen(dt, laufTempo = 1) {
    zeit += dt;
    laufen(dt * laufTempo); wetterBewegen(dt * Math.max(0.3, Math.min(1, laufTempo || 0.3)));
    if (modus === 'region') karrenFahren(dt * laufTempo);
    gruppe.traverse(o => { if (o.userData.dreht) o.rotation.z += dt * 0.8; if (o.userData.drehY) o.rotation.y += dt * o.userData.drehY;
      if (o.userData.flamme !== undefined) o.scale.y = 0.75 + 0.35 * Math.abs(Math.sin(zeit * 9 + o.userData.flamme * 1.7)); });
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
  return { laeuferGesamt: () => laeufer.length, laufMessen: n => { const t0 = performance.now(); for (let i = 0; i < n; i++) laufen(0.016); return (performance.now() - t0) / n; }, buergerSchalten: an => { buergerAn = an; if (letzter) abgleichen(letzter[0], letzter[1]); }, wetterSchalten, wetterSichtbar: () => wetter.visible, grenze, zeigeModus, hexAn, regionInfo, landAbgleichen, karrenZahl: () => karren.length, haendlerZahl: () => karren.filter(k => k.haendler).length, modus: () => modus, modelleBereit, laeuferZahl: () => koerper.count, ansicht, ansichtZahl: () => ansichtFelder.count, abgleichen, vorschau, jahreszeitFarbe, zoom, bodenPunkt, feldAn, verschieben, gebaeudeAn, zentrieren, zeichnen, groesseAnpassen, renderer };
}
