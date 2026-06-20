/* Service Worker — Весёлый мир */
var CACHE = 'vesyoliy-mir-v1';

/* Ядро: кэшируется при установке */
var CORE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './assets/styles.css',
  './assets/app.js',
  './assets/animals.js',
  './assets/alphabet.js',
  './assets/audio.js',
  './assets/puzzles.js',
  './assets/images/puzzle/car.svg',
  './assets/images/puzzle/airplane.svg',
  './assets/images/puzzle/tank.svg',
  './assets/images/puzzle/cat.svg',
  './assets/images/puzzle/helicopter.svg',
  './assets/images/puzzle/horse.svg',
  './assets/images/puzzle/truck.svg',
  './assets/images/puzzle/excavator.svg'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function(cache) { return cache.addAll(CORE); })
      .then(function() { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() { return self.clients.claim(); })
  );
});

/* Стратегия: сначала кэш, при промахе — сеть + кэшируем ответ */
self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;
      return fetch(e.request).then(function(resp) {
        if (resp && resp.ok) {
          var clone = resp.clone();
          caches.open(CACHE).then(function(cache) { cache.put(e.request, clone); });
        }
        return resp;
      });
    })
  );
});
