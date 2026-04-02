// Service Worker: 地図タイルのキャッシュ
const TILE_CACHE = 'teslacamv-tiles-v1'
const TILE_MAX = 500

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== TILE_CACHE).map((n) => caches.delete(n)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (e) => {
  const url = e.request.url
  // 地図タイルのみキャッシュ (OpenStreetMap)
  if (url.includes('tile.openstreetmap.org')) {
    e.respondWith(
      caches.open(TILE_CACHE).then((cache) =>
        cache.match(e.request).then((cached) => {
          if (cached) return cached
          return fetch(e.request).then((res) => {
            if (res.ok) {
              cache.put(e.request, res.clone())
              // キャッシュ上限を超えたら古いエントリを削除
              cache.keys().then((keys) => {
                if (keys.length > TILE_MAX) {
                  for (let i = 0; i < keys.length - TILE_MAX; i++) {
                    cache.delete(keys[i])
                  }
                }
              })
            }
            return res
          })
        })
      )
    )
  }
})
