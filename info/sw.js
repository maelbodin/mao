// MAO Mobile : garde l'app en mémoire pour qu'elle marche sans internet
const CACHE = 'mao-reseau-v1';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  // L'app : réseau d'abord (mises à jour), sinon la copie gardée
  if (url.origin === location.origin) {
    e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); return r; }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html'))));
    return;
  }
  // Polices : la copie gardée d'abord
  if (url.hostname.endsWith('googleapis.com') || url.hostname.endsWith('gstatic.com')) {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => { const c = res.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); return res; })));
  }
});
