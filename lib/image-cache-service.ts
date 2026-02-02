interface CachedImage {
  url: string
  blob: Blob
  timestamp: number
  expiresAt: number
}

class ImageCacheService {
  private dbName = "ads-image-cache"
  private dbVersion = 1
  private storeName = "images"
  private cacheExpiration = 4 * 24 * 60 * 60 * 1000 // 4 días en milisegundos
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        this.cleanExpiredImages() // Limpiar imágenes expiradas al inicializar
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: "url" })
          store.createIndex("expiresAt", "expiresAt", { unique: false })
        }
      }
    })
  }

  async cacheImage(url: string): Promise<string> {
    try {
      // Verificar si ya está en caché y no ha expirado
      const cached = await this.getCachedImage(url)
      if (cached) {
        return URL.createObjectURL(cached.blob)
      }

      // Descargar la imagen
      const response = await fetch(url)
      if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`)

      const blob = await response.blob()
      const now = Date.now()

      const cachedImage: CachedImage = {
        url,
        blob,
        timestamp: now,
        expiresAt: now + this.cacheExpiration,
      }

      // Guardar en IndexedDB
      await this.saveCachedImage(cachedImage)

      return URL.createObjectURL(blob)
    } catch (error) {
      console.warn("Failed to cache image:", url, error)
      return url // Fallback a la URL original
    }
  }

  private async getCachedImage(url: string): Promise<CachedImage | null> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readonly")
      const store = transaction.objectStore(this.storeName)
      const request = store.get(url)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const result = request.result as CachedImage | undefined
        if (result && result.expiresAt > Date.now()) {
          resolve(result)
        } else {
          if (result) {
            // Eliminar imagen expirada
            this.deleteCachedImage(url)
          }
          resolve(null)
        }
      }
    })
  }

  private async saveCachedImage(cachedImage: CachedImage): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readwrite")
      const store = transaction.objectStore(this.storeName)
      const request = store.put(cachedImage)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  private async deleteCachedImage(url: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readwrite")
      const store = transaction.objectStore(this.storeName)
      const request = store.delete(url)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  private async cleanExpiredImages(): Promise<void> {
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readwrite")
      const store = transaction.objectStore(this.storeName)
      const index = store.index("expiresAt")
      const now = Date.now()

      const request = index.openCursor(IDBKeyRange.upperBound(now))

      request.onerror = () => reject(request.error)
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          cursor.delete()
          cursor.continue()
        } else {
          resolve()
        }
      }
    })
  }

  async clearAllCache(): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readwrite")
      const store = transaction.objectStore(this.storeName)
      const request = store.clear()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async getCacheSize(): Promise<number> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readonly")
      const store = transaction.objectStore(this.storeName)
      const request = store.count()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }
}

export const imageCacheService = new ImageCacheService()
