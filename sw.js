const CACHE_NAME = 'barco-app-v3-2';
const APP_SHELL = [
  './',
  './index.html',
  './app.html',
  './admin.html',
  './reman.html',
  './barcoapp-v3.1.css',
  './barcoapp-v3.1.js',
  './barcoapp-v3.2.css',
  './barcoapp-v3.2.js',
  './fundoentrada.png',
  './logo.png',
  './icone.png',
  './manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response && response.ok && new URL(request.url).origin === self.location.origin) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return (await cache.match(request)) ||
      (await cache.match('./app.html')) ||
      (await cache.match('./index.html'));
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const network = fetch(request).then(response => {
    if (response && response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => cached);
  return cached || network;
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(staleWhileRevalidate(request));
});

self.addEventListener('sync', event => {
  if (event.tag === 'sync-barcos' || event.tag === 'sync-updates') {
    console.log('BarcoApp: sincronização solicitada.');
  }
});

self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'Nova atualização no BarcoApp',
    icon: 'logo.png',
    badge: 'icone.png',
    vibrate: [100, 50, 100],
    data: { dateOfArrival: Date.now(), url: 'app.html' }
  };
  event.waitUntil(self.registration.showNotification('BarcoApp', options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data?.url || 'app.html'));
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'GET_NOTES') {
    event.source?.postMessage({ notes: [] });
  }
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
