// Städte Roms – Service Worker (Phase E): Netz zuerst, ohne Netz der zuletzt geladene Stand. Nur gleiche Herkunft.
const CACHE = 'staedte-roms-v1';
const VORAB = ['./', 'index.html', 'stil.css', 'manifest.webmanifest', 'js/main.js', 'js/sim.js', 'js/daten.js', 'js/szene.js', 'js/start.js', 'js/ton.js',
  '../models/staedte_geb.json', '../audio/st_rom.json', '../img/st_ev.json', '../img/ep_0.webp'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(VORAB.map(u => c.add(new Request(u, { cache: 'reload' })).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n.startsWith('staedte-roms-') && n !== CACHE).map(n => caches.delete(n)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const q = e.request; if (q.method !== 'GET' || new URL(q.url).origin !== location.origin) return;
  e.respondWith(fetch(q).then(r => { if (r.ok) { const k = r.clone(); caches.open(CACHE).then(c => c.put(q, k)); } return r; })
    .catch(() => caches.match(q).then(r => r || caches.match('index.html'))));
});
