import { db as configDb } from "./firebaseConfig"
import { Firestore, collection, getDocs, query, where, orderBy, limit } from "firebase/firestore"
import { cacheManager } from "./cache-manager"
import type { News } from "@/types/news"

// Re-export db from firebaseConfig to ensure singleton instance with persistence settings
export const db = configDb as Firestore

function reorderUcamiFirst(ads: any[]) {
  if (!Array.isArray(ads) || ads.length <= 1) return ads

  const idx = ads.findIndex((a) => {
    const hay = `${(a.title || "").toLowerCase()} ${(a.link || "").toLowerCase()} ${(a.id || "").toLowerCase()}`
    return hay.includes("ucami")
  })

  if (idx <= 0) return ads

  const copy = [...ads]
  const [found] = copy.splice(idx, 1)
  return [found, ...copy]
}

// Batch query para obtener todo el contenido inicial en una sola petición
export const getBatchInitialData = async () => {
  const cacheKey = "batch_initial_data"
  const cached = cacheManager.get(cacheKey, "news")

  if (cached) {
    console.log("📦 Batch data loaded from cache")
    return cached
  }

  try {
    console.log("🔥 Fetching batch initial data from Firebase")

    // Ejecutar todas las consultas en paralelo
    const [newsSnapshot, adsSnapshot] = await Promise.all([
      // Obtener noticias principales
      getDocs(query(collection(db, "news"), orderBy("date", "desc"), limit(60))),
      // Obtener todas las publicidades de una vez
      getDocs(collection(db, "advertisements")),
    ])

    // Procesar noticias
    const news = newsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as News[]

    // Procesar y agrupar publicidades por categoría
    const allAds = adsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as any[]

    const adsByCategory = {
      "Grande Principal": allAds.filter((ad) => ad.category === "Grande Principal"),
      "Mediana Principal": allAds.filter((ad) => ad.category === "Mediana Principal"),
      "Pequeña Principal": allAds.filter((ad) => ad.category === "Pequeña Principal"),
      Sidebar: allAds.filter((ad) => ad.category === "Sidebar"),
    }

    // Priorizar cualquier banner que contenga 'ucami' en Grande Principal
    adsByCategory["Grande Principal"] = reorderUcamiFirst(adsByCategory["Grande Principal"])

    const batchData = {
      news,
      ads: adsByCategory,
      timestamp: Date.now(),
    }

    // Cachear por 2 minutos
    cacheManager.set(cacheKey, batchData, "news")

    console.log(`✅ Batch loaded: ${news.length} news, ${allAds.length} ads`)
    return batchData
  } catch (error) {
    console.error("Error fetching batch data:", error)
    return { news: [], ads: {}, timestamp: Date.now() }
  }
}

// Prefetch inteligente basado en comportamiento del usuario
export const prefetchUserContent = async (userBehavior: {
  visitedCategories: string[]
  readingTime: number
  scrollDepth: number
}) => {
  const prefetchPromises = []

  // Si el usuario lee mucho, prefetch más noticias
  if (userBehavior.readingTime > 30000) {
    // 30 segundos
    prefetchPromises.push(getDocs(query(collection(db, "news"), orderBy("date", "desc"), limit(100))))
  }

  // Prefetch categorías relacionadas
  if (userBehavior.visitedCategories.length > 0) {
    const relatedCategories = getRelatedCategories(userBehavior.visitedCategories)
    relatedCategories.forEach((category) => {
      prefetchPromises.push(
        getDocs(
          query(collection(db, "news"), where("mainCategory", "==", category), orderBy("date", "desc"), limit(20)),
        ),
      )
    })
  }

  // Si el usuario hace mucho scroll, prefetch más contenido
  if (userBehavior.scrollDepth > 70) {
    prefetchPromises.push(getDocs(query(collection(db, "news"), orderBy("date", "desc"), limit(80))))
  }

  try {
    await Promise.all(prefetchPromises)
    console.log("🚀 Prefetch completed")
  } catch (error) {
    console.warn("Prefetch failed:", error)
  }
}

// Obtener categorías relacionadas
function getRelatedCategories(visited: string[]): string[] {
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

// Cache inteligente con invalidación selectiva
export const invalidateRelatedCache = (newsId: string, category: string) => {
  // Invalidar solo el cache relacionado
  cacheManager.invalidate("batch_initial_data")
  cacheManager.invalidate(`category_${category.toLowerCase()}`)
  cacheManager.invalidate(`news_${newsId}`)
}

// Optimización de consultas por lotes
export const getBatchNewsByIds = async (ids: string[]) => {
  const cacheKey = `batch_news_${ids.join("_")}`
  const cached = cacheManager.get(cacheKey, "news")

  if (cached) {
    return cached
  }

  try {
    // Dividir en lotes de 10 (límite de Firestore para 'in' queries)
    const batches = []
    for (let i = 0; i < ids.length; i += 10) {
      const batchIds = ids.slice(i, i + 10)
      batches.push(getDocs(query(collection(db, "news"), where("__name__", "in", batchIds))))
    }

    const results = await Promise.all(batches)
    const news = results.flatMap((snapshot) => snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))) as News[]

    cacheManager.set(cacheKey, news, "news")
    return news
  } catch (error) {
    console.error("Error in batch news fetch:", error)
    return []
  }
}

export const getBatchNewsByCategory = async (category: string) => {
  const cacheKey = `category_${category.toLowerCase()}`
  const cached = cacheManager.get(cacheKey, "news")

  if (cached) {
    console.log(`📦 Category ${category} loaded from cache`)
    return cached
  }

  try {
    console.log(`🔥 Fetching category ${category} from Firebase`)

    // Solo filtrar por categoría, sin orderBy
    const categoryQuery = query(collection(db, "news"), where("mainCategory", "==", category), limit(50))

    const snapshot = await getDocs(categoryQuery)

    // Ordenar en cliente por fecha descendente
    const news = snapshot.docs
      .map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          _parsedDate: new Date(data.date || 0),
        }
      })
      .sort((a, b) => b._parsedDate.getTime() - a._parsedDate.getTime())
      .map(({ _parsedDate, ...rest }) => rest)

    // Cachear por 3 minutos
    cacheManager.set(cacheKey, news, "news")

    console.log(`✅ Category ${category} loaded: ${news.length} news`)
    return news
  } catch (error) {
    console.error(`Error fetching category ${category}:`, error)
    return []
  }
}
