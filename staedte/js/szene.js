// Städte Roms – 3D-Szene: feste Schrägsicht (orthografisch), Gelände, Gebäude, Vorschau, Problem-Symbole
import { RASTER, GEB, CASA, JAHRESZEITEN } from './daten.js';
import { WALD, WASSER, groesse } from './sim.js';

const THREE = window.THREE;
const BLICK = new THREE.Vector3(1, 1.05, 1).normalize();   // feste Blickrichtung (Azimut 45°, ca. 37° Höhe)
const RAHMEN = 11;                                            // halbe Bildhöhe in Feldern bei Zoom 1

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
  szene.add(sonne);

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

  function baueMesh(t, stufe = 1, geist = false) {
    const d = GEB[t], [gw, gd] = groesse(t);
    const g = new THREE.Group();
    const casa = t === 'huette' && stufe === 2;
    const wand = casa ? CASA.wand : d.wand, dach = casa ? CASA.dach : d.dach, h = casa ? CASA.h : d.h;
    const rand = 0.12, w = gw - rand * 2, tief = gd - rand * 2;
    if (d.flach) {
      const f = new THREE.Mesh(new THREE.BoxGeometry(gw - 0.06, 0.05, gd - 0.06), new THREE.MeshLambertMaterial({ color: wand }));
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

  function abgleichen(S, auswahlId) {
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
      const an = b.id === auswahlId;
      o.g.traverse(m => { if (m.isMesh && m.material.emissive) m.material.emissive.setHex(an ? 0x3a2a08 : 0x000000); });
    }
    for (const [id, o] of objekte) if (!da.has(id)) { gruppe.remove(o.g); objekte.delete(id); }
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
    ziel.x = Math.max(-RASTER / 2, Math.min(RASTER / 2, ziel.x));
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
  function zentrieren(x, z) { ziel.copy(weltPos(x, z)); kameraSetzen(); }

  let zeit = 0;
  function zeichnen(dt) {
    zeit += dt;
    gruppe.traverse(o => { if (o.userData.dreht) o.rotation.z += dt * 0.8; });
    renderer.render(szene, kamera);
  }

  window.addEventListener('resize', groesseAnpassen);
  groesseAnpassen(); kameraSetzen();
  return { abgleichen, vorschau, jahreszeitFarbe, zoom, bodenPunkt, feldAn, verschieben, gebaeudeAn, zentrieren, zeichnen, groesseAnpassen, renderer };
}
