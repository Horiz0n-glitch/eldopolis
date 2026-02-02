import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc,
  startAfter,
  type QueryDocumentSnapshot,
  type DocumentData,
  Timestamp,
} from "firebase/firestore"
import { getFirebaseApp } from "./firebaseClient"
import { db } from "./firebaseConfig"
import type { News, Publicidad } from "@/lib/validations"
import { NewsSchema, PublicidadSchema } from "@/lib/validations"
import { mockNewsData } from "./mock-data"

import { cacheManager } from "./cache-manager"

function getFromCache<T>(key: string, type: any = "news"): T | null {
  return cacheManager.get<T>(key, type)
}

function setCache<T>(key: string, data: T, type: any = "news"): void {
  cacheManager.set(key, data, type)
}

// Convertir timestamp de Firestore a string
function convertTimestamp(timestamp: any): string {
  if (!timestamp) return new Date().toISOString()

  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toISOString()
  }

  if (timestamp.seconds) {
    return new Date(timestamp.seconds * 1000).toISOString()
  }

  return timestamp.toString()
}

// Convertir documento de Firestore a News
function convertFirestoreToNews(doc: QueryDocumentSnapshot<DocumentData>): News {
  const data = doc.data()

  const rawNews = {
    id: doc.id,
    title: data.title || "",
    subtitle: data.subtitle || "",
    description: data.description || "",
    mainCategory: data.mainCategory || "",
    subCategory: data.subCategory || "",
    tags: data.tags || [],
    author: data.author || "",
    date: convertTimestamp(data.date),
    timestamp: convertTimestamp(data.timestamp || data.date),
    image: data.image || data.imageUrl,
    imageUrl: data.imageUrl || (Array.isArray(data.image) ? data.image[0] : data.image),
    imageCaption: data.imageCaption || "",
    featured: data.featured || false,
    featuredType: data.featuredType,
    breaking: data.breaking || false,
    views: data.views || 0,
    likes: data.likes || 0,
    comments: data.comments || 0,
    status: data.status || "published",
    slug: data.slug || "",
    excerpt: data.excerpt || "",
    readTime: data.readTime || 0,
    source: data.source || "",
    location: data.location || "",
    priority: data.priority || 0,
    content: data.content || "",
    video: data.video || "",
    audio: data.audio || "",
    summary: data.summary || "",
    youtubeLink: data.youtubeLink || "",
  }

  try {
    return NewsSchema.parse(rawNews)
  } catch (error) {
    console.warn(`[SERVER]\t⚠️ News validation failed for doc ${doc.id}:`, error)
    return rawNews as News
  }
}

// Convertir documento de Firestore a Publicidad
function convertFirestoreToAd(doc: QueryDocumentSnapshot<DocumentData>): Publicidad {
  const data = doc.data()

  const rawAd = {
    id: doc.id,
    title: data.title || "",
    description: data.description || "",
    imageUrl: data.imageUrl || (Array.isArray(data.images) ? data.images[0] : ""),
    images: Array.isArray(data.images) ? data.images : (data.imageUrl ? [data.imageUrl] : []),
    linkUrl: data.linkUrl || data.link || "",
    link: data.link || data.linkUrl || "",
    position: data.position || data.category || "sidebar",
    category: data.category || data.position || "",
    isActive: data.isActive !== false,
    startDate: data.startDate ? convertTimestamp(data.startDate) : undefined,
    endDate: data.endDate ? convertTimestamp(data.endDate) : undefined,
    priority: data.priority || 0,
    clicks: data.clicks || 0,
    impressions: data.impressions || 0,
    targetAudience: data.targetAudience || [],
    budget: data.budget || 0,
    costPerClick: data.costPerClick || 0,
    createdAt: data.createdAt ? convertTimestamp(data.createdAt) : undefined,
    updatedAt: data.updatedAt ? convertTimestamp(data.updatedAt) : undefined,
  }

  try {
    return PublicidadSchema.parse(rawAd)
  } catch (error) {
    console.warn(`[SERVER]\t⚠️ Ad validation failed for doc ${doc.id}:`, error)
    return rawAd as Publicidad
  }
}

/**
 * Obtener noticias con paginación optimizada
 */
export async function getNewsOptimized(
  pageSize = 10,
  lastDoc?: QueryDocumentSnapshot<DocumentData> | null,
  lastDate?: string
): Promise<{
  news: News[]
  lastDoc: QueryDocumentSnapshot<DocumentData> | null
  hasMore: boolean
}> {
  const cacheKey = `news-optimized-${pageSize}-${lastDoc?.id || lastDate || "first"}`
  const cached = getFromCache<{
    news: News[]
    lastDoc: QueryDocumentSnapshot<DocumentData> | null
    hasMore: boolean
  }>(cacheKey)

  if (cached) {
    console.log("📦 Cache hit for news optimized")
    return cached
  }

  try {
    console.log(`[CLIENT-API] Fetching news. PageSize: ${pageSize}, hasLastDoc: ${!!lastDoc}, hasLastDate: ${!!lastDate}`)

    // Consulta básica
    let newsQuery = query(
      collection(db, "news"),
      orderBy("date", "desc"),
      limit(pageSize),
    )

    if (lastDoc) {
      console.log("[CLIENT-API] Building query with lastDoc");
      newsQuery = query(
        collection(db, "news"),
        orderBy("date", "desc"),
        startAfter(lastDoc),
        limit(pageSize),
      )
    } else if (lastDate) {
      console.log(`[CLIENT-API] Building query with lastDate (String): ${lastDate}`);
      // Intento 1: Usar fecha como String
      newsQuery = query(
        collection(db, "news"),
        orderBy("date", "desc"),
        startAfter(lastDate),
        limit(pageSize),
      )
    } else {
      console.log("[CLIENT-API] Building initial query (no cursor)");
    }

    let snapshot = await getDocs(newsQuery)

    // Lógica de Reintento para Fallback de Fecha
    if (snapshot.size === 0 && lastDate && !lastDoc) {
      console.log("[CLIENT-API] ⚠️ String query returned 0 results. Retrying with Date object...");
      const retryQuery = query(
        collection(db, "news"),
        orderBy("date", "desc"),
        startAfter(new Date(lastDate)),
        limit(pageSize),
      );
      snapshot = await getDocs(retryQuery);
      console.log(`[CLIENT-API] Retry result size: ${snapshot.size}`);
    }

    console.log(`[CLIENT-API] Snapshot size: ${snapshot.size}`)

    if (snapshot.size === 0) {
      console.log("[SERVER] ⚠️ No news found in Firestore")
      return { news: [], lastDoc: null, hasMore: false }
    }

    const news = snapshot.docs.map(convertFirestoreToNews)

    // Ordenar por prioridad (featuredType) y luego por fecha descendente
    news.sort((a, b) => {
      const featuredOrder: Record<string, number> = {
        cover: 1,
        featured1: 2,
        featured2: 3,
        featured3: 4,
      }

      const aPriority = a.featuredType ? featuredOrder[a.featuredType] || 99 : 99
      const bPriority = b.featuredType ? featuredOrder[b.featuredType] || 99 : 99

      if (aPriority !== bPriority) {
        return aPriority - bPriority
      }

      // Si tienen la misma prioridad, ordenar por fecha descendente
      return b.date.localeCompare(a.date)
    })

    const newLastDoc = snapshot.docs[snapshot.docs.length - 1] || null
    const hasMore = snapshot.docs.length === pageSize

    const result = {
      news,
      lastDoc: newLastDoc,
      hasMore,
    }

    // Solo cachear si hay resultados
    if (news.length > 0) {
      setCache(cacheKey, result)
    }

    return result
  } catch (error) {
    console.error("[SERVER] ❌ Error in getNewsOptimized:", error)
    return {
      news: [],
      lastDoc: null,
      hasMore: false,
    }
  }
}


// Firebase connectivity test function
async function testFirebaseConnectivity(): Promise<boolean> {
  if (!db) {
    console.log("[SERVER]\t❌ Firebase DB not initialized")
    return false
  }

  try {
    console.log("[SERVER]\t🔍 Testing Firebase connectivity...")
    const testQuery = query(collection(db, "news"), limit(1))
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Connectivity test timeout")), 3000)
    })

    await Promise.race([getDocs(testQuery), timeoutPromise])
    console.log("[SERVER]\t✅ Firebase connectivity test passed")
    return true
  } catch (error) {
    console.log(
      "[SERVER]\t❌ Firebase connectivity test failed:",
      error instanceof Error ? error.message : "Unknown error",
    )
    return false
  }
}

/**
 * Obtener noticias por categoría con cache - SIN ÍNDICES COMPUESTOS
 */
export async function getNewsByCategoryOptimized(
  category: string,
  pageSize = 10,
  lastDoc?: QueryDocumentSnapshot<DocumentData>,
): Promise<{
  news: News[]
  lastDoc: QueryDocumentSnapshot<DocumentData> | null
  hasMore: boolean
}> {
  // Mapa de slugs a nombres de categoría reales en Firestore
  const categoryMap: Record<string, string> = {
    "politica": "Política",
    "economia": "Economía",
    "policiales": "Policiales",
    "deportes": "Deportes",
    "sociedad": "Sociedad",
    "espectaculos": "Espectáculos",
    "deporte": "Deportes", // Alias
    "futas": "Futas", // ?
  };

  const lowerCat = category.toLowerCase();
  const normalizedCategory = categoryMap[lowerCat] || (category.charAt(0).toUpperCase() + category.slice(1).toLowerCase())

  console.log(`[SERVER]\t📦 Consultando Firestore por categoría (SSR): ${category} -> ${normalizedCategory}`)

  const returnFallbackData = () => {
    const mockNews = mockNewsData.filter((news) => news.mainCategory === normalizedCategory)
    console.log(`[SERVER]\t📦 Returning ${mockNews.length} mock news items for category: ${normalizedCategory}`)

    if (mockNews.length === 0) {
      const availableCategories = [...new Set(mockNewsData.map((news) => news.mainCategory))]
      console.log(`[SERVER]\t🔍 Available mock categories: ${availableCategories.join(", ")}`)
      console.log(`[SERVER]\t🔍 Searched for: "${normalizedCategory}"`)
    }

    return {
      news: mockNews,
      lastDoc: null,
      hasMore: false,
    }
  }

  if (!db) {
    console.log("[SERVER]\t❌ Firebase not initialized - using fallback data")
    return returnFallbackData()
  }

  const cacheKey = `news-category-${normalizedCategory}-${pageSize}-${lastDoc?.id || "first"}`
  const cached = getFromCache<{
    news: News[]
    lastDoc: QueryDocumentSnapshot<DocumentData> | null
    hasMore: boolean
  }>(cacheKey)

  if (cached) {
    console.log(`[SERVER]\t📦 Cache hit for category: ${normalizedCategory}`)
    return cached
  }

  const isConnected = await testFirebaseConnectivity()
  if (!isConnected) {
    console.log("[SERVER]\t❌ Firebase connectivity failed - using fallback data")
    return returnFallbackData()
  }

  try {
    console.log(`[SERVER]\t🔍 [DEBUG] Querying Firestore for category: "${normalizedCategory}"`)

    const categoryQuery = query(
      collection(db, "news"),
      where("mainCategory", "==", normalizedCategory),
      limit(pageSize * 2),
    )

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Firestore query timeout after 5 seconds")), 5000)
    })

    const queryPromise = getDocs(categoryQuery)
    const snapshot = await Promise.race([queryPromise, timeoutPromise])

    console.log(
      `[SERVER]\t🔍 [DEBUG] Firestore returned ${snapshot.docs.length} documents for category: "${normalizedCategory}"`,
    )

    const allNews = snapshot.docs
      .map(convertFirestoreToNews)
      .sort((a: News, b: News) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    const news = allNews.slice(0, pageSize)
    const hasMore = allNews.length > pageSize

    const result = {
      news,
      lastDoc: null,
      hasMore,
    }

    setCache(cacheKey, result)
    console.log(`[SERVER]\t✅ Fetched ${news.length} news items for category: ${normalizedCategory}`)

    return result
  } catch (error) {
    console.log(
      `[SERVER]\t❌ Error fetching news for category ${normalizedCategory}:`,
      error instanceof Error ? error.message : "Unknown error",
    )

    if (error instanceof Error && error.message.includes("timeout")) {
      console.log(`[SERVER]\t❌ TIMEOUT: Firestore query took too long. Using fallback data.`)
    }

    return returnFallbackData()
  }
}

/**
 * Obtener noticias por tag con cache - SIN ÍNDICES COMPUESTOS
 */
export async function getNewsByTagOptimized(
  tag: string,
  pageSize = 10,
  lastDoc?: QueryDocumentSnapshot<DocumentData>,
): Promise<{
  news: News[]
  lastDoc: QueryDocumentSnapshot<DocumentData> | null
  hasMore: boolean
}> {
  // Normalizar tag a minúsculas
  const normalizedTag = tag.toLowerCase()
  const cacheKey = `news-tag-${normalizedTag}-${pageSize}-${lastDoc?.id || "first"}`
  const cached = getFromCache<{
    news: News[]
    lastDoc: QueryDocumentSnapshot<DocumentData> | null
    hasMore: boolean
  }>(cacheKey)

  if (cached) {
    console.log(`📦 Cache hit for tag: ${normalizedTag}`)
    return cached
  }

  try {
    const tagQuery = query(
      collection(db, "news"),
      where("tags", "array-contains", normalizedTag),
      limit(pageSize * 2), // Obtener más documentos para compensar el ordenamiento en cliente
    )

    const snapshot = await getDocs(tagQuery)

    // Ordenar en cliente por timestamp descendente
    const allNews = snapshot.docs
      .map(convertFirestoreToNews)
      .sort((a: News, b: News) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    const news = allNews.slice(0, pageSize)
    const hasMore = allNews.length > pageSize

    const result = {
      news,
      lastDoc: null, // Simplificamos la paginación para evitar complejidad
      hasMore,
    }

    setCache(cacheKey, result)
    console.log(`✅ Fetched ${news.length} news items for tag: ${normalizedTag} (client-side sorted)`)

    return result
  } catch (error) {
    console.error(`Error fetching news for tag ${normalizedTag}:`, error)
    return {
      news: [],
      lastDoc: null,
      hasMore: false,
    }
  }
}

/**
 * Obtener todas las publicidades activas - EXPORT AGREGADO
 */
export async function getAllAds(): Promise<Record<string, Publicidad[]>> {
  const cacheKey = "all-ads-active-record"
  const cached = getFromCache<Record<string, Publicidad[]>>(cacheKey, "ads")

  if (cached) {
    console.log("[SERVER] 📦 Cache hit for ads record")
    return cached
  }

  try {
    const now = new Date()

    // Intentar obtener de ambas posibles colecciones individualmente para evitar fallos por permisos
    let publicidadesDocs: any[] = []
    let advertisementsDocs: any[] = []

    try {
      const snap = await getDocs(collection(db, "publicidad"))
      publicidadesDocs = snap.docs
    } catch (e) {
      console.warn("[SERVER] No permissions for 'publicidad' collection, skipping.")
    }

    try {
      const snap = await getDocs(collection(db, "advertisements"))
      advertisementsDocs = snap.docs
    } catch (e) {
      console.warn("[SERVER] No permissions for 'advertisements' collection, skipping.")
    }

    const allAdsArray = [
      ...publicidadesDocs.map(convertFirestoreToAd),
      ...advertisementsDocs.map(convertFirestoreToAd)
    ].filter((ad: Publicidad) => {
      if (ad.isActive === false) return false
      const startDate = ad.startDate ? new Date(ad.startDate) : null
      const endDate = ad.endDate ? new Date(ad.endDate) : null
      if (startDate && now < startDate) return false
      if (endDate && now > endDate) return false
      return true
    }).sort((a, b) => (b.priority || 0) - (a.priority || 0))

    // Agrupar por categoría/posición
    const groupedAds: Record<string, Publicidad[]> = {
      all: allAdsArray
    }

    allAdsArray.forEach(ad => {
      const cat = ad.category || ad.position || "otros"
      if (!groupedAds[cat]) groupedAds[cat] = []
      groupedAds[cat].push(ad)
    })

    setCache(cacheKey, groupedAds, "ads")
    console.log(`✅ Fetched and grouped ${allAdsArray.length} ads into ${Object.keys(groupedAds).length} categories`)

    return groupedAds
  } catch (error) {
    console.error("Error fetching ads:", error)
    return { all: [] }
  }
}

/**
 * Obtener una noticia específica por ID
 */
export async function getNewsById(id: string): Promise<News | null> {
  const cacheKey = `news-${id}`
  const cached = getFromCache<News>(cacheKey)

  if (cached) {
    console.log(`📦 Cache hit for news: ${id}`)
    return cached
  }

  try {
    const docRef = doc(db, "news", id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      console.log(`❌ News not found: ${id}`)
      return null
    }

    const news = convertFirestoreToNews(docSnap as QueryDocumentSnapshot<DocumentData>)
    setCache(cacheKey, news)
    console.log(`✅ Fetched news: ${id}`)

    return news
  } catch (error) {
    console.error(`Error fetching news ${id}:`, error)
    return null
  }
}

/**
 * Obtener noticias relacionadas por categoría y tags - SIN ÍNDICES COMPUESTOS
 */
export async function getRelatedNews(
  newsId: string,
  category: string,
  tags: string[] = [],
  limitCount = 4,
): Promise<News[]> {
  // Normalizar categoría y tags usando mapa de acentos
  const categoryMap: Record<string, string> = {
    "politica": "Política",
    "economia": "Economía",
    "policiales": "Policiales",
    "deportes": "Deportes",
    "sociedad": "Sociedad",
    "espectaculos": "Espectáculos",
    "deporte": "Deportes",
  };

  const lowerCat = category.toLowerCase();
  const normalizedCategory = categoryMap[lowerCat] || (category.charAt(0).toUpperCase() + category.slice(1).toLowerCase())
  const normalizedTags = tags.map((tag) => tag.toLowerCase())
  const cacheKey = `related-${newsId}-${normalizedCategory}-${normalizedTags.join(",")}-${limitCount}`
  const cached = getFromCache<News[]>(cacheKey)

  if (cached) {
    console.log(`📦 Cache hit for related news: ${newsId}`)
    return cached
  }

  try {
    // Primero intentar por tags si existen
    let relatedNews: News[] = []

    if (normalizedTags.length > 0) {
      const tagQuery = query(
        collection(db, "news"),
        where("status", "==", "published"),
        where("tags", "array-contains-any", normalizedTags.slice(0, 10)), // Firestore limita a 10 elementos
        limit((limitCount + 1) * 2), // Obtener más para compensar ordenamiento en cliente
      )

      const tagSnapshot = await getDocs(tagQuery)
      relatedNews = tagSnapshot.docs
        .map(convertFirestoreToNews)
        .sort((a: News, b: News) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .filter((news: News) => news.id !== newsId)
        .slice(0, limitCount)
    }

    // Si no hay suficientes noticias relacionadas por tags, completar con categoría
    if (relatedNews.length < limitCount) {
      const categoryQuery = query(
        collection(db, "news"),
        where("status", "==", "published"),
        where("mainCategory", "==", normalizedCategory),
        limit((limitCount + 1) * 2),
      )

      const categorySnapshot = await getDocs(categoryQuery)
      const categoryNews = categorySnapshot.docs
        .map(convertFirestoreToNews)
        .sort((a: News, b: News) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .filter((news: News) => news.id !== newsId && !relatedNews.some((rn) => rn.id === news.id))
        .slice(0, limitCount - relatedNews.length)

      relatedNews = [...relatedNews, ...categoryNews]
    }

    setCache(cacheKey, relatedNews)
    console.log(`✅ Fetched ${relatedNews.length} related news for: ${newsId} (client-side sorted)`)

    return relatedNews
  } catch (error) {
    console.error(`Error fetching related news for ${newsId}:`, error)
    return []
  }
}

/**
 * Obtener noticias por categoría (función de compatibilidad)
 */
export async function getNewsByCategory(category: string): Promise<News[]> {
  const result = await getNewsByCategoryOptimized(category, 50) // Obtener más noticias para compatibilidad
  return result.news
}
