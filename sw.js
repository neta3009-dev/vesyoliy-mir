/* Service Worker — Весёлый мир */
var CACHE = 'vesyoliy-mir-v16';

/* Ядро: кэшируется при установке обязательно */
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
  './assets/images/puzzle/%D0%BC%D0%B0%D1%88%D0%B8%D0%BD%D0%BA%D0%B0.png',
  './assets/images/puzzle/%D1%81%D0%B0%D0%BC%D0%BE%D0%BB%D1%91%D1%82.png',
  './assets/images/puzzle/%D0%BF%D0%BE%D0%B5%D0%B7%D0%B4.png',
  './assets/images/puzzle/%D0%BA%D0%BE%D1%88%D0%BA%D0%B0.png',
  './assets/images/puzzle/%D0%B2%D0%B5%D1%80%D1%82%D0%BE%D0%BB%D1%91%D1%82.png',
  './assets/images/puzzle/%D0%BB%D0%BE%D1%88%D0%B0%D0%B4%D1%8C.png',
  './assets/images/puzzle/%D1%82%D1%80%D0%B0%D0%BA%D1%82%D0%BE%D1%80.png',
  './assets/images/puzzle/%D1%8D%D0%BA%D1%81%D0%BA%D0%B0%D0%B2%D0%B0%D1%82%D0%BE%D1%80.png'
];

/* Аудио: кэшируется при установке по одному файлу (ошибки игнорируются).
   Это критично для iOS — play() из setTimeout работает только если файл
   уже в кеше и отдаётся мгновенно, без сетевого запроса. */
var AUDIO = [
  './assets/audio/snd_cat.m4a',
  './assets/audio/snd_dog.m4a',
  './assets/audio/snd_cow.m4a',
  './assets/audio/snd_frog.m4a',
  './assets/audio/snd_duck.m4a',
  './assets/audio/snd_horse.m4a',
  './assets/audio/snd_sheep.m4a',
  './assets/audio/snd_pig.m4a',
  './assets/audio/snd_mouse.m4a',
  './assets/audio/snd_parrot.m4a',
  './assets/audio/snd_monkey.m4a',
  './assets/audio/snd_chicken.m4a',
  './assets/audio/snd_rooster.m4a',
  './assets/audio/snd_pz_car.m4a',
  './assets/audio/snd_pz_airplane.m4a',
  './assets/audio/snd_pz_train.m4a',
  './assets/audio/snd_pz_cat.m4a',
  './assets/audio/snd_pz_helicopter.m4a',
  './assets/audio/snd_pz_horse.m4a',
  './assets/audio/snd_pz_tractor.m4a',
  './assets/audio/snd_pz_excavator.m4a',
  './assets/audio/snd_pz_ok.m4a',
  './assets/audio/snd_pz_wrong.m4a',
  './assets/audio/snd_pz_win.m4a',
  './assets/audio/snd_hello.m4a',
  './assets/audio/snd_circle.m4a',
  './assets/audio/snd_square.m4a',
  './assets/audio/snd_triangle.m4a',
  './assets/audio/snd_star.m4a',
  './assets/audio/snd_heart.m4a',
  './assets/audio/snd_rectangle.m4a',
  './assets/audio/snd_task_circle.m4a',
  './assets/audio/snd_task_square.m4a',
  './assets/audio/snd_task_triangle.m4a',
  './assets/audio/snd_task_star.m4a',
  './assets/audio/snd_task_heart.m4a',
  './assets/audio/snd_task_rectangle.m4a',
  './assets/audio/snd_ok_circle.m4a',
  './assets/audio/snd_ok_square.m4a',
  './assets/audio/snd_ok_triangle.m4a',
  './assets/audio/snd_ok_star.m4a',
  './assets/audio/snd_ok_heart.m4a',
  './assets/audio/snd_ok_rectangle.m4a',
  './assets/audio/snd_num_1.m4a',
  './assets/audio/snd_num_2.m4a',
  './assets/audio/snd_num_3.m4a',
  './assets/audio/snd_num_4.m4a',
  './assets/audio/snd_num_5.m4a',
  './assets/audio/snd_num_6.m4a',
  './assets/audio/snd_num_7.m4a',
  './assets/audio/snd_num_8.m4a',
  './assets/audio/snd_num_9.m4a',
  './assets/audio/snd_num_10.m4a',
  './assets/audio/snd_num_11.m4a',
  './assets/audio/snd_num_12.m4a',
  './assets/audio/snd_num_13.m4a',
  './assets/audio/snd_num_14.m4a',
  './assets/audio/snd_num_15.m4a',
  './assets/audio/snd_num_16.m4a',
  './assets/audio/snd_num_17.m4a',
  './assets/audio/snd_num_18.m4a',
  './assets/audio/snd_num_19.m4a',
  './assets/audio/snd_num_20.m4a',
  './assets/audio/snd_numok_0.m4a',
  './assets/audio/snd_numok_1.m4a',
  './assets/audio/snd_numok_2.m4a',
  './assets/audio/snd_numok_3.m4a',
  './assets/audio/snd_numok_4.m4a',
  './assets/audio/snd_numno_0.m4a',
  './assets/audio/snd_numno_1.m4a',
  './assets/audio/snd_numno_2.m4a',
  './assets/audio/snd_al_0.m4a',
  './assets/audio/snd_al_1.m4a',
  './assets/audio/snd_al_2.m4a',
  './assets/audio/snd_al_3.m4a',
  './assets/audio/snd_al_4.m4a',
  './assets/audio/snd_al_5.m4a',
  './assets/audio/snd_al_6.m4a',
  './assets/audio/snd_al_7.m4a',
  './assets/audio/snd_al_8.m4a',
  './assets/audio/snd_al_9.m4a',
  './assets/audio/snd_al_10.m4a',
  './assets/audio/snd_al_11.m4a',
  './assets/audio/snd_al_12.m4a',
  './assets/audio/snd_al_13.m4a',
  './assets/audio/snd_al_14.m4a',
  './assets/audio/snd_al_15.m4a',
  './assets/audio/snd_al_16.m4a',
  './assets/audio/snd_al_17.m4a',
  './assets/audio/snd_al_18.m4a',
  './assets/audio/snd_al_19.m4a',
  './assets/audio/snd_al_20.m4a',
  './assets/audio/snd_al_21.m4a',
  './assets/audio/snd_al_22.m4a',
  './assets/audio/snd_al_23.m4a',
  './assets/audio/snd_al_24.m4a',
  './assets/audio/snd_al_25.m4a',
  './assets/audio/snd_al_26.m4a',
  './assets/audio/snd_al_27.m4a',
  './assets/audio/snd_al_28.m4a',
  './assets/audio/snd_al_29.m4a'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      /* Обязательные файлы — падаем если не загрузились */
      return cache.addAll(CORE).then(function() {
        /* Аудио — каждый файл по отдельности, ошибки игнорируем */
        return Promise.all(AUDIO.map(function(url) {
          return cache.add(url).catch(function() {});
        }));
      });
    }).then(function() { return self.skipWaiting(); })
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
      .then(function() {
        /* После активации нового SW — перезагружаем все вкладки */
        return self.clients.matchAll({ type: 'window' }).then(function(clients) {
          clients.forEach(function(c) { c.postMessage({ type: 'SW_UPDATED' }); });
        });
      })
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
      }).catch(function() {
        return new Response('', { status: 503, statusText: 'Offline' });
      });
    })
  );
});
