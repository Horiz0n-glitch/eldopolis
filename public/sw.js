const CACHE_NAME = "eldopolis-v1.2.0"
const STATIC_CACHE = "eldopolis-static-v1.2.0"
const DYNAMIC_CACHE = "eldopolis-dynamic-v1.2.0"
const IMAGE_CACHE = "eldopolis-images-v1.2.0"

const CACHE_VERSION = "1.2.0"
const MAX_CACHE_SIZE = 50 * 1024 * 1024 // 50MB máximo
const MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000 // 7 días

// Files to cache immediately
const STATIC_ASSETS = [
  "/",
  "/offline.html",
  "/manifest.json",
  "/favicon.ico",
  "/_next/static/css/app/layout.css",
  "/_next/static/chunks/webpack.js",
  "/_next/static/chunks/main.js",
]

const SUPPORTED_CDNS = [
  "pub-514df041e2b3494caab09827cb896071.r2.dev",
  "res.cloudinary.com",
  "images.unsplash.com",
  "cdn.pixabay.com",
]

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing version", CACHE_VERSION)
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("[SW] Caching static assets")
        return cache.addAll(STATIC_ASSETS.filter((url) => url !== "/"))
      })
      .then(() => {
        console.log("[SW] Static assets cached")
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error("[SW] Failed to cache static assets:", error)
      }),
  )
})

// Activate event - clean old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating version", CACHE_VERSION)
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== STATIC_CACHE &&
              cacheName !== DYNAMIC_CACHE &&
              cacheName !== IMAGE_CACHE &&
              cacheName !== CACHE_NAME
            ) {
              console.log("[SW] Deleting old cache:", cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => {
        console.log("[SW] Activated")
        return self.clients.claim()
      }),
  )
})

self.addEventListener("message", (event) => {
  const { type, payload } = event.data

  switch (type) {
    case "CLEANUP_CACHE":
      event.waitUntil(cleanupOldCache())
      break
    case "PRELOAD_IMAGES":
      if (payload?.urls) {
        event.waitUntil(preloadImages(payload.urls))
      }
      break
    case "GET_CACHE_STATS":
      event.waitUntil(
        getCacheStats().then((stats) => {
          event.ports[0]?.postMessage(stats)
        }),
      )
      break
  }
})

// Fetch event - handle requests
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== "GET") {
    return
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith("http")) {
    return
  }

  // Handle different types of requests
  if (url.pathname.startsWith("/api/")) {
    // API requests - network first with cache fallback
    event.respondWith(handleApiRequest(request))
  } else if (
    url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico|avif)$/i) ||
    SUPPORTED_CDNS.some((cdn) => url.hostname.includes(cdn))
  ) {
    event.respondWith(handleImageRequest(request))
  } else if (url.pathname.startsWith("/_next/static/")) {
    // Static assets - cache first
    event.respondWith(handleStaticRequest(request))
  } else {
    // Pages - network first with cache fallback
    event.respondWith(handlePageRequest(request))
  }
})

// Handle API requests
async function handleApiRequest(request) {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      if (request.url.includes("/api/dolar") || request.url.includes("/api/news")) {
        cache.put(request, networkResponse.clone())
      }
    }
    return networkResponse
  } catch (error) {
    console.log("[SW] API network failed, trying cache:", request.url)
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    // Return offline response for API
    return new Response(JSON.stringify({ error: "Offline", offline: true }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    })
  }
}

async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE)
  const cachedResponse = await caches.match(request)

  if (cachedResponse) {
    // Verificar si la imagen cacheada no es muy antigua
    const cachedDate = cachedResponse.headers.get("sw-cached-date")
    if (cachedDate && Date.now() - Number.parseInt(cachedDate) < MAX_CACHE_AGE) {
      return cachedResponse
    }
  }

  try {
    const networkResponse = await fetch(request, {
      headers: {
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },
    })

    if (networkResponse.ok) {
      // Clonar respuesta y agregar timestamp
      const responseToCache = networkResponse.clone()
      const headers = new Headers(responseToCache.headers)
      headers.set("sw-cached-date", Date.now().toString())

      const modifiedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers,
      })

      const contentLength = networkResponse.headers.get("content-length")
      if (!contentLength || Number.parseInt(contentLength) < 5 * 1024 * 1024) {
        // Máximo 5MB por imagen
        cache.put(request, modifiedResponse)
      }
    }
    return networkResponse
  } catch (error) {
    console.log("[SW] Image network failed:", request.url)
    return cachedResponse || new Response("", { status: 404 })
  }
}

// Handle static asset requests
async function handleStaticRequest(request) {
  const cachedResponse = await caches.match(request)
  if (cachedResponse) {
    return cachedResponse
  }

  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.log("[SW] Static asset network failed:", request.url)
    return cachedResponse || new Response("", { status: 404 })
  }
}

// Handle page requests
async function handlePageRequest(request) {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.log("[SW] Page network failed, trying cache:", request.url)
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    // Return offline page
    return caches.match("/offline.html")
  }
}

async function cleanupOldCache() {
  console.log("[SW] Starting cache cleanup...")

  try {
    const cache = await caches.open(IMAGE_CACHE)
    const requests = await cache.keys()
    const now = Date.now()
    let deletedCount = 0

    for (const request of requests) {
      const response = await cache.match(request)
      if (response) {
        const cachedDate = response.headers.get("sw-cached-date")
        if (cachedDate && now - Number.parseInt(cachedDate) > MAX_CACHE_AGE) {
          await cache.delete(request)
          deletedCount++
        }
      }
    }

    console.log(`[SW] Cleanup completed. Deleted ${deletedCount} old entries.`)
  } catch (error) {
    console.error("[SW] Cache cleanup failed:", error)
  }
}

async function preloadImages(urls) {
  console.log("[SW] Preloading", urls.length, "images...")

  const cache = await caches.open(IMAGE_CACHE)
  const promises = urls.map(async (url) => {
    try {
      const cachedResponse = await cache.match(url)
      if (!cachedResponse) {
        const response = await fetch(url)
        if (response.ok) {
          await cache.put(url, response)
        }
      }
    } catch (error) {
      console.warn("[SW] Failed to preload image:", url, error)
    }
  })

  await Promise.allSettled(promises)
  console.log("[SW] Image preloading completed")
}

async function getCacheStats() {
  try {
    const cacheNames = await caches.keys()
    const stats = {
      caches: {},
      totalSize: 0,
      totalEntries: 0,
    }

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName)
      const keys = await cache.keys()
      let cacheSize = 0

      for (const request of keys) {
        const response = await cache.match(request)
        if (response) {
          const blob = await response.blob()
          cacheSize += blob.size
        }
      }

      stats.caches[cacheName] = {
        entries: keys.length,
        size: cacheSize,
      }
      stats.totalSize += cacheSize
      stats.totalEntries += keys.length
    }

    return stats
  } catch (error) {
    console.error("[SW] Failed to get cache stats:", error)
    return null
  }
}

// Background sync for failed requests
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    console.log("[SW] Background sync triggered")
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  // Implement background sync logic here
  console.log("[SW] Performing background sync...")
}

// Push notifications
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: "/icon-192x192.png",
      badge: "/icon-72x72.png",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey,
      },
      actions: [
        {
          action: "explore",
          title: "Ver noticia",
          icon: "/icon-192x192.png",
        },
        {
          action: "close",
          title: "Cerrar",
          icon: "/icon-192x192.png",
        },
      ],
    }

    event.waitUntil(self.registration.showNotification(data.title, options))
  }
})

// Notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("/"))
  }
})
