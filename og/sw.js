/* sw.js — offline support for OG Games.
   Stale-while-revalidate: the cached copy answers instantly (and works with no
   connection at all), while a fresh copy is fetched for next time. */
var CACHE = 'og-games-v1';
var ASSETS = [
  './', './index.html', './how-to-use.html', './word-lists.html',
  './blend.html', './sound-sort.html', './syllables.html',
  './heart-words.html', './word-chains.html', './suffix-lab.html',
  './assets/og.css', './assets/og.js', './data/words.js',
  './manifest.webmanifest', './icon.svg'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; })
      .map(function (k) { return caches.delete(k); }));
  }));
  self.clients.claim();
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(function (cached) {
      var network = fetch(e.request).then(function (res) {
        if (res && res.status === 200 && res.type === 'basic') {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        }
        return res;
      }).catch(function () { return cached; });
      return cached || network;
    })
  );
});
