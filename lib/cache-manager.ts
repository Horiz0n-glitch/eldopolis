interface CacheConfig {
  key: string
  ttl: number
  version: string
}

interface CacheItem<T> {
  data: T
  timestamp: number
  version: string
  ttl: number
}

class CacheManager {
  private static instance: CacheManager
  private memoryCache = new Map<string, CacheItem<any>>()
  private readonly MAX_MEMORY_CACHE_SIZE = 50

  private readonly CACHE_CONFIGS = {
    news: { ttl: 20 * 60 * 1000, version: "1.2" },
    categories: { ttl: 60 * 60 * 1000, version: "1.2" },
    ads: { ttl: 120 * 60 * 1000, version: "1.2" },
    tags: { ttl: 30 * 60 * 1000, version: "1.2" },
    currency: { ttl: 120 * 60 * 1000, version: "1.2" },
    static: { ttl: 240 * 60 * 1000, version: "1.2" },
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager()
    }
    return CacheManager.instance
  }

  private getConfig(type: keyof typeof this.CACHE_CONFIGS) {
    return this.CACHE_CONFIGS[type] || this.CACHE_CONFIGS.static
  }

  set<T>(key: string, data: T, type: keyof typeof this.CACHE_CONFIGS = "static"): void {
    const config = this.getConfig(type)
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      version: config.version,
      ttl: config.ttl,
    }

    // Siempre guardar en memoria para acceso rápido
    this.setMemoryCache(key, cacheItem)

    // Guardar en localStorage para persistencia entre sesiones/recargas
    if (typeof window !== "undefined") {
      try {
        const serialized = JSON.stringify(cacheItem)
        const compressed = this.compress(serialized)
        localStorage.setItem(key, compressed)
      } catch (error) {
        // Si falla por espacio, limpiar expirados e intentar uno pequeño
        console.warn("Cache set failed (likely quota), clearing expired items")
        this.clearExpired()
      }
    }
  }

  get<T>(key: string, type: keyof typeof this.CACHE_CONFIGS = "static"): T | null {
    // 1. Primero intentar memoria (más rápido)
    const memoryResult = this.getMemoryCache<T>(key, type)
    if (memoryResult !== null) return memoryResult

    // 2. Si no está en memoria, verificar localStorage (cliente)
    if (typeof window === "undefined") return null

    try {
      const compressed = localStorage.getItem(key)
      if (!compressed) return null

      const serialized = this.decompress(compressed)
      const cacheItem: CacheItem<T> = JSON.parse(serialized)
      const config = this.getConfig(type)

      // Verificar versión
      if (cacheItem.version !== config.version) {
        localStorage.removeItem(key)
        return null
      }

      // Verificar TTL
      const isExpired = Date.now() - cacheItem.timestamp > cacheItem.ttl
      if (isExpired) {
        localStorage.removeItem(key)
        return null
      }

      // Si es válido, subir a memoria para la próxima vez
      this.setMemoryCache(key, cacheItem)
      return cacheItem.data
    } catch (error) {
      console.warn("Cache get failed:", error)
      localStorage.removeItem(key)
      return null
    }
  }

  private setMemoryCache<T>(key: string, cacheItem: CacheItem<T>): void {
    // Limpiar cache de memoria si está lleno
    if (this.memoryCache.size >= this.MAX_MEMORY_CACHE_SIZE) {
      const oldestKey = this.memoryCache.keys().next().value
      this.memoryCache.delete(oldestKey)
    }

    this.memoryCache.set(key, cacheItem)
  }

  private getMemoryCache<T>(key: string, type: keyof typeof this.CACHE_CONFIGS): T | null {
    const cacheItem = this.memoryCache.get(key)
    if (!cacheItem) return null

    const config = this.getConfig(type)

    // Verificar versión y TTL
    if (cacheItem.version !== config.version || Date.now() - cacheItem.timestamp > cacheItem.ttl) {
      this.memoryCache.delete(key)
      return null
    }

    return cacheItem.data
  }

  invalidate(pattern: string): void {
    // Limpiar memoria cache
    for (const key of this.memoryCache.keys()) {
      if (key.includes(pattern)) {
        this.memoryCache.delete(key)
      }
    }

    // Limpiar localStorage
    if (typeof window === "undefined") return

    const keys = Object.keys(localStorage)
    keys.forEach((key) => {
      if (key.includes(pattern)) {
        localStorage.removeItem(key)
      }
    })
  }

  clearExpired(): void {
    // Limpiar memoria cache expirada
    const now = Date.now()
    for (const [key, item] of this.memoryCache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.memoryCache.delete(key)
      }
    }

    // Limpiar localStorage expirado
    if (typeof window === "undefined") return

    const keys = Object.keys(localStorage)
    keys.forEach((key) => {
      try {
        const compressed = localStorage.getItem(key)
        if (!compressed) return

        const serialized = this.decompress(compressed)
        const cacheItem = JSON.parse(serialized)

        if (cacheItem.timestamp && cacheItem.ttl) {
          const isExpired = now - cacheItem.timestamp > cacheItem.ttl
          if (isExpired) {
            localStorage.removeItem(key)
          }
        }
      } catch (error) {
        localStorage.removeItem(key)
      }
    })
  }

  getStats(): {
    memory: { total: number; expired: number }
    localStorage: { total: number; expired: number; size: string }
  } {
    const now = Date.now()

    // Stats de memoria
    let memoryExpired = 0
    for (const [, item] of this.memoryCache.entries()) {
      if (now - item.timestamp > item.ttl) {
        memoryExpired++
      }
    }

    // Stats de localStorage
    let localStorageExpired = 0
    let totalSize = 0
    const keys = Object.keys(localStorage || {})

    keys.forEach((key) => {
      const value = localStorage?.getItem(key)
      if (value) {
        totalSize += value.length

        try {
          const serialized = this.decompress(value)
          const cacheItem = JSON.parse(serialized)
          if (cacheItem.timestamp && cacheItem.ttl) {
            const isExpired = now - cacheItem.timestamp > cacheItem.ttl
            if (isExpired) localStorageExpired++
          }
        } catch (error) {
          localStorageExpired++
        }
      }
    })

    return {
      memory: {
        total: this.memoryCache.size,
        expired: memoryExpired,
      },
      localStorage: {
        total: keys.length,
        expired: localStorageExpired,
        size: `${Math.round(totalSize / 1024)}KB`,
      },
    }
  }

  private compress(data: string): string {
    // Compresión simple para datos grandes
    if (data.length > 2000) {
      return btoa(data)
    }
    return data
  }

  private decompress(data: string): string {
    try {
      return atob(data)
    } catch {
      return data
    }
  }

  // Método para limpiar automáticamente cada cierto tiempo
  startAutoCleanup(): void {
    setInterval(
      () => {
        this.clearExpired()
      },
      60 * 60 * 1000,
    )
  }
}

export const cacheManager = CacheManager.getInstance()

// Iniciar limpieza automática solo en el cliente
if (typeof window !== "undefined") {
  cacheManager.startAutoCleanup()
}
