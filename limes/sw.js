// Limes – Service Worker: Netz zuerst, ohne Netz der zuletzt geladene Stand. Version wird von deploy_limes.py gesetzt.
const CACHE = 'limes-542a61ffdb';
const VORAB = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png',
  'lib/three.min.js', 'lib/CopyShader.js', 'lib/LuminosityHighPassShader.js', 'lib/GammaCorrectionShader.js',
  'lib/EffectComposer.js', 'lib/RenderPass.js', 'lib/ShaderPass.js', 'lib/UnrealBloomPass.js',
  '../fonts/fonts.css', '../fonts/marcellus-latin-400-normal.woff2', '../fonts/alegreya-sans-latin-400-normal.woff2',
  '../fonts/alegreya-sans-latin-500-normal.woff2', '../fonts/alegreya-sans-latin-700-normal.woff2'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(VORAB.map(u => c.add(new Request(u, { cache: 'reload' })).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n.startsWith('limes-') && n !== CACHE).map(n => caches.delete(n)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const q = e.request; if (q.method !== 'GET' || new URL(q.url).origin !== location.origin) return;
  e.respondWith(fetch(q).then(r => { if (r.ok) { const k = r.clone(); caches.open(CACHE).then(c => c.put(q, k)); } return r; })
    .catch(() => caches.match(q).then(r => r || caches.match('index.html'))));
});
