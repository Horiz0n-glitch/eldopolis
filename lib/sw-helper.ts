// Helper para interactuar con el Service Worker desde el cliente

export class ServiceWorkerHelper {
  private static instance: ServiceWorkerHelper
  private registration: ServiceWorkerRegistration | null = null

  private constructor() {}

  static getInstance(): ServiceWorkerHelper {
    if (!ServiceWorkerHelper.instance) {
      ServiceWorkerHelper.instance = new ServiceWorkerHelper()
    }
    return ServiceWorkerHelper.instance
  }

  async init(): Promise<boolean> {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return false
    }

    try {
      this.registration = await navigator.serviceWorker.ready
      return true
    } catch (error) {
      console.error("[SW Helper] Failed to initialize:", error)
      return false
    }
  }

  // Precargar imágenes importantes
  async preloadImages(urls: string[]): Promise<void> {
    if (!this.registration?.active) return

    this.registration.active.postMessage({
      type: "PRELOAD_IMAGES",
      payload: { urls },
    })
  }

  // Limpiar caché manualmente
  async cleanupCache(): Promise<void> {
    if (!this.registration?.active) return

    this.registration.active.postMessage({
      type: "CLEANUP_CACHE",
    })
  }

  // Obtener estadísticas del caché
  async getCacheStats(): Promise<any> {
    if (!this.registration?.active) return null

    return new Promise((resolve) => {
      const messageChannel = new MessageChannel()

      messageChannel.port1.onmessage = (event) => {
        resolve(event.data)
      }

      this.registration!.active!.postMessage({ type: "GET_CACHE_STATS" }, [messageChannel.port2])

      // Timeout después de 5 segundos
      setTimeout(() => resolve(null), 5000)
    })
  }

  // Verificar si una imagen está en caché
  async isImageCached(url: string): Promise<boolean> {
    if (!("caches" in window)) return false

    try {
      const cache = await caches.open("eldopolis-images-v1.2.0")
      const response = await cache.match(url)
      return !!response
    } catch (error) {
      return false
    }
  }

  // Obtener tamaño aproximado del caché
  async getCacheSize(): Promise<number> {
    if (!("caches" in window)) return 0

    try {
      const cacheNames = await caches.keys()
      let totalSize = 0

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName)
        const keys = await cache.keys()

        for (const request of keys) {
          const response = await cache.match(request)
          if (response) {
            const blob = await response.blob()
            totalSize += blob.size
          }
        }
      }

      return totalSize
    } catch (error) {
      console.error("[SW Helper] Failed to calculate cache size:", error)
      return 0
    }
  }
}

// Hook para usar el Service Worker Helper en React
export function useServiceWorker() {
  const swHelper = ServiceWorkerHelper.getInstance()

  return {
    preloadImages: (urls: string[]) => swHelper.preloadImages(urls),
    cleanupCache: () => swHelper.cleanupCache(),
    getCacheStats: () => swHelper.getCacheStats(),
    isImageCached: (url: string) => swHelper.isImageCached(url),
    getCacheSize: () => swHelper.getCacheSize(),
  }
}
