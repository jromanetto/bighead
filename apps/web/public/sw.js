/* global self, caches, fetch, clients */
// BIGHEAD service worker — délibérément minimal et sans dépendance.
//
// Stratégie :
// - navigations (HTML)  : network-first, fallback offline.html — l'app SSR
//   reste toujours fraîche, le SW n'introduit jamais de HTML périmé.
// - /assets/* (hashés)  : cache-first — immutables par construction (Vite).
// - tout le reste       : passthrough réseau.
//
// Bump CACHE_VERSION pour invalider d'un coup tous les caches précédents.
const CACHE_VERSION = 'bh-v1'
const OFFLINE_URL = '/offline.html'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll([OFFLINE_URL, '/logo192.png']))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // Navigations : réseau d'abord, page offline en dernier recours.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match(OFFLINE_URL)),
    )
    return
  }

  // Assets hashés : cache d'abord, réseau sinon (et on met en cache).
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ??
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone()
              caches
                .open(CACHE_VERSION)
                .then((cache) => cache.put(request, copy))
            }
            return response
          }),
      ),
    )
  }
})

// ----- Web push (rappel quotidien) -----

self.addEventListener('push', (event) => {
  let payload = {}
  try {
    payload = event.data ? event.data.json() : {}
  } catch {
    // Payload non-JSON : on affiche le défaut.
  }
  const title = payload.title || 'BIGHEAD'
  const options = {
    body: payload.body || 'Ton défi du jour t’attend ! 🧠',
    icon: '/logo192.png',
    badge: '/logo192.png',
    data: { url: payload.url || '/play/daily' },
    tag: payload.tag || 'bh-daily',
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = (event.notification.data && event.notification.data.url) || '/play'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ('focus' in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      return clients.openWindow(url)
    }),
  )
})
