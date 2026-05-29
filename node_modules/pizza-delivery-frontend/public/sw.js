const CACHE_NAME = 'pizzahub-static-v1'
const OFFLINE_URL = '/offline.html'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll([OFFLINE_URL]))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Do not cache API requests or auth routes
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/socket.io')) {
    return
  }

  // For navigation requests, try network first then fallback to cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match(OFFLINE_URL))
    )
    return
  }

  // For other requests, use cache first for images and static resources
  if (request.destination === 'image' || request.destination === 'script' || request.destination === 'style') {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request))
    )
  }
})
