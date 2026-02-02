interface PrefetchConfig {
  priority: "high" | "medium" | "low"
  delay: number
  maxAge: number
}

interface PrefetchItem {
  key: string
  fetcher: () => Promise<any>
  config: PrefetchConfig
  timestamp: number
  data?: any
  loading?: boolean
}

class PrefetchManager {
  private static instance: PrefetchManager
  private prefetchQueue: Map<string, PrefetchItem> = new Map()
  private activeRequests: Set<string> = new Set()
  private prefetchDebounceTimer: NodeJS.Timeout | null = null
  private behaviorDebounceTimer: NodeJS.Timeout | null = null
  private userBehavior: {
    visitedCategories: string[]
    visitedTags: string[]
    readingTime: number
    scrollDepth: number
    lastActivity: number
  } = {
    visitedCategories: [],
    visitedTags: [],
    readingTime: 0,
    scrollDepth: 0,
    lastActivity: Date.now(),
  }

  static getInstance(): PrefetchManager {
    if (!PrefetchManager.instance) {
      PrefetchManager.instance = new PrefetchManager()
    }
    return PrefetchManager.instance
  }

  trackUserBehavior(action: string, data: any) {
    this.userBehavior.lastActivity = Date.now()

    switch (action) {
      case "visit_category":
        if (!this.userBehavior.visitedCategories.includes(data.category)) {
          this.userBehavior.visitedCategories.push(data.category)
        }
        break
      case "visit_tag":
        if (!this.userBehavior.visitedTags.includes(data.tag)) {
          this.userBehavior.visitedTags.push(data.tag)
        }
        break
      case "scroll":
        this.userBehavior.scrollDepth = Math.max(this.userBehavior.scrollDepth, data.depth)
        break
      case "reading_time":
        this.userBehavior.readingTime += data.time
        break
    }

    if (this.behaviorDebounceTimer) {
      clearTimeout(this.behaviorDebounceTimer)
    }

    this.behaviorDebounceTimer = setTimeout(() => {
      this.predictAndPrefetch()
    }, 10000)
  }

  // Prefetching predictivo basado en comportamiento
  private predictAndPrefetch() {
    const timeSinceLastActivity = Date.now() - this.userBehavior.lastActivity
    if (timeSinceLastActivity > 120000) {
      return
    }

    const predictions = this.generatePredictions()

    if (this.prefetchDebounceTimer) {
      clearTimeout(this.prefetchDebounceTimer)
    }

    this.prefetchDebounceTimer = setTimeout(() => {
      predictions.forEach((prediction) => {
        this.addToPrefetchQueue(prediction.key, prediction.fetcher, prediction.config)
      })
    }, 5000)
  }

  private generatePredictions(): Array<{ key: string; fetcher: () => Promise<any>; config: PrefetchConfig }> {
    const predictions = []

    // Predecir categorías relacionadas
    if (this.userBehavior.visitedCategories.length > 0) {
      const relatedCategories = this.getRelatedCategories(this.userBehavior.visitedCategories)
      relatedCategories.forEach((category) => {
        predictions.push({
          key: `category_${category}`,
          fetcher: () => import("@/lib/firebase-optimized").then((m) => m.getNewsByCategoryOptimized(category)),
          config: { priority: "medium" as const, delay: 15000, maxAge: 20 * 60 * 1000 },
        })
      })
    }

    // Predecir tags relacionados
    if (this.userBehavior.visitedTags.length > 0) {
      const relatedTags = this.getRelatedTags(this.userBehavior.visitedTags)
      relatedTags.forEach((tag) => {
        predictions.push({
          key: `tag_${tag}`,
          fetcher: () => import("@/lib/firebase-optimized").then((m) => m.getNewsByTagOptimized(tag)),
          config: { priority: "low" as const, delay: 20000, maxAge: 15 * 60 * 1000 },
        })
      })
    }

    if (this.userBehavior.readingTime > 120000) {
      predictions.push({
        key: "trending_news",
        fetcher: () => import("@/lib/firebase-optimized").then((m) => m.getNewsOptimized(undefined, 10)),
        config: { priority: "high" as const, delay: 10000, maxAge: 10 * 60 * 1000 },
      })
    }

    return predictions
  }

  private getRelatedCategories(visited: string[]): string[] {
    const categoryRelations: Record<string, string[]> = {
      Política: ["Economía", "Sociedad"],
      Deporte: ["Sociedad", "Espectáculos"],
      Mundo: ["Política", "Economía"],
      Economía: ["Política", "Mundo"],
      Sociedad: ["Política", "Columna"],
      Policiales: ["Sociedad", "Mundo"],
      Espectáculos: ["Sociedad", "Columna"],
      Columna: ["Política", "Sociedad"],
    }

    const related = new Set<string>()
    visited.forEach((category) => {
      categoryRelations[category]?.forEach((rel) => related.add(rel))
    })

    return Array.from(related)
      .filter((cat) => !visited.includes(cat))
      .slice(0, 2)
  }

  private getRelatedTags(visited: string[]): string[] {
    const commonTags = ["Últimas Noticias", "Tendencias", "Análisis", "Breaking News"]
    return commonTags.filter((tag) => !visited.includes(tag)).slice(0, 2)
  }

  // Añadir a la cola de prefetch
  addToPrefetchQueue(key: string, fetcher: () => Promise<any>, config: PrefetchConfig) {
    if (this.prefetchQueue.has(key) || this.activeRequests.has(key)) {
      return
    }

    const item: PrefetchItem = {
      key,
      fetcher,
      config,
      timestamp: Date.now(),
    }

    this.prefetchQueue.set(key, item)
    this.schedulePrefetch(item)
  }

  private schedulePrefetch(item: PrefetchItem) {
    setTimeout(() => {
      this.executePrefetch(item)
    }, item.config.delay)
  }

  private async executePrefetch(item: PrefetchItem) {
    if (this.activeRequests.has(item.key)) return

    const timeSinceLastActivity = Date.now() - this.userBehavior.lastActivity
    if (timeSinceLastActivity > 90000) {
      return
    }

    if (navigator.connection) {
      const connection = navigator.connection as any
      if (connection.effectiveType === "slow-2g" || connection.effectiveType === "2g") {
        return
      }
      // También verificar si hay datos limitados
      if (connection.saveData) {
        return
      }
    }

    if (this.activeRequests.size >= 1) {
      return
    }

    try {
      this.activeRequests.add(item.key)
      item.loading = true

      console.log(`🔮 Prefetching: ${item.key}`)
      const data = await item.fetcher()

      item.data = data
      item.loading = false

      // Guardar en cache si es apropiado
      if (item.key.startsWith("category_") || item.key.startsWith("tag_")) {
        const cacheManager = await import("@/lib/cache-manager").then((m) => m.cacheManager)
        cacheManager.set(item.key, data, item.key.startsWith("category_") ? "categories" : "tags")
      }
    } catch (error) {
      console.warn(`Prefetch failed for ${item.key}:`, error)
      item.loading = false
    } finally {
      this.activeRequests.delete(item.key)
    }
  }

  // Obtener datos prefetcheados
  getPrefetched(key: string): any {
    const item = this.prefetchQueue.get(key)
    if (!item || item.loading) return null

    // Verificar si los datos están frescos
    const age = Date.now() - item.timestamp
    if (age > item.config.maxAge) {
      this.prefetchQueue.delete(key)
      return null
    }

    return item.data
  }

  cleanup() {
    const now = Date.now()
    for (const [key, item] of this.prefetchQueue.entries()) {
      if (now - item.timestamp > item.config.maxAge) {
        this.prefetchQueue.delete(key)
      }
    }
  }

  // Estadísticas de prefetching
  getStats() {
    return {
      queueSize: this.prefetchQueue.size,
      activeRequests: this.activeRequests.size,
      userBehavior: this.userBehavior,
      hitRate: this.calculateHitRate(),
    }
  }

  private calculateHitRate(): number {
    // Implementar lógica para calcular hit rate
    return 0.75 // Placeholder
  }

  destroy() {
    if (this.prefetchDebounceTimer) {
      clearTimeout(this.prefetchDebounceTimer)
    }
    if (this.behaviorDebounceTimer) {
      clearTimeout(this.behaviorDebounceTimer)
    }
  }
}

export const prefetchManager = PrefetchManager.getInstance()

if (typeof window !== "undefined") {
  setInterval(
    () => {
      prefetchManager.cleanup()
    },
    30 * 60 * 1000,
  )
}
