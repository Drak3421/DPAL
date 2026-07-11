const CACHE_NAME = 'fmhy-cache-v2';

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            // Cache core assets immediately so the app works offline on first disconnect
            return cache.addAll([
                '/',
                '/index.html',
                '/app.js',
                '/data.js',
                '/index.css',
                '/app-icon-v2.png'
            ]);
        }).catch(err => console.log('Cache addAll failed', err))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    return caches.delete(key);
                }
            }));
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    // Network first, falling back to cache strategy
    // This ensures users always get the freshest data.js when online,
    // but the app still loads perfectly when completely offline.
    e.respondWith(
        fetch(e.request).then((response) => {
            // Don't cache opaque responses or non-basic requests (like third party APIs)
            if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
                cache.put(e.request, responseToCache);
            });
            return response;
        }).catch(() => {
            // Network failed (offline), fetch from cache
            return caches.match(e.request).then(cachedResponse => {
                return cachedResponse;
            });
        })
    );
});
