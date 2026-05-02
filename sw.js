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
              // キャッシュ上限を超えたら古いエントリを削除。
              // 注意: cache.keys() の返却順は Service Worker 仕様では「実装定義」 で
              // 厳密保証されないが、 Chrome / Edge / Safari の現行実装はいずれも
              // 「挿入順 (= put した順)」 を返す。 そのため先頭から削除すれば概ね LRU
              // (= 最古挿入) として機能する。 理論上「最近 hit した古い tile が先に
              // 消される」 ケースが起きうるが、 タイルは再取得可能 (= OpenStreetMap から
              // ダウンロードし直すだけ) なので UX への影響は限定的。
              // 真の LRU が必要になったら、 Cache Storage に timestamp メタデータを
              // 別途持たせるか IndexedDB で管理する設計が必要だが、 費用対効果が薄い
              // ためこの簡易方式を維持する (= REVIEW.md M-D2 選択肢 A の判断結果)。
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
