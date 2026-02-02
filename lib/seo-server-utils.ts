import { headers } from "next/headers"
import { generateNewsMetadata, generateCategoryMetadata, generateTagMetadata, type SEOData } from "./seo-utils"
import { seoCache } from "./seo-cache-manager"
import type { News } from "@/types/news"

// Detectar bots para optimizar structured data
function getBotOptimizedOptions(): { includeStructuredData: boolean } {
  try {
    const headersList = headers()
    const userAgent = headersList.get("user-agent") || ""

    // Bots que NO necesitan structured data (WhatsApp, Facebook, Discord, etc.)
    const socialBots = /facebook|whatsapp|discord|twitter|telegram|bot/i.test(userAgent)

    return {
      includeStructuredData: !socialBots,
    }
  } catch (error) {
    // Fallback si headers() falla
    return { includeStructuredData: true }
  }
}

// Generar metadatos optimizados para noticias con cache persistente
export async function generateOptimizedNewsMetadata(news: News): Promise<SEOData> {
  try {
    // Intentar obtener desde cache persistente
    const cached = await seoCache.get("news", news.id, news.timestamp)
    if (cached) {
      return cached
    }

    // Generar nuevos metadatos con optimizaciones de bot
    const options = getBotOptimizedOptions()
    const metadata = generateNewsMetadata(news, {
      ...options,
      useCache: false, // No usar cache en memoria, usamos el persistente
    })

    // Guardar en cache persistente (sin await para no bloquear)
    seoCache.set("news", news.id, metadata, news.timestamp).catch(console.error)

    return metadata
  } catch (error) {
    console.error("Error generating optimized news metadata:", error)
    // Fallback a generación sin cache
    return generateNewsMetadata(news, { includeStructuredData: true, useCache: false })
  }
}

// Generar metadatos optimizados para categorías con cache persistente
export async function generateOptimizedCategoryMetadata(category: string): Promise<SEOData> {
  try {
    // Intentar obtener desde cache persistente
    const cached = await seoCache.get("category", category)
    if (cached) {
      return cached
    }

    // Generar nuevos metadatos con optimizaciones de bot
    const options = getBotOptimizedOptions()
    const metadata = generateCategoryMetadata(category, {
      ...options,
      useCache: false,
    })

    // Guardar en cache persistente
    seoCache.set("category", category, metadata).catch(console.error)

    return metadata
  } catch (error) {
    console.error("Error generating optimized category metadata:", error)
    return generateCategoryMetadata(category, { includeStructuredData: true, useCache: false })
  }
}

// Generar metadatos optimizados para tags con cache persistente
export async function generateOptimizedTagMetadata(tag: string): Promise<SEOData> {
  try {
    // Intentar obtener desde cache persistente
    const cached = await seoCache.get("tag", tag)
    if (cached) {
      return cached
    }

    // Generar nuevos metadatos con optimizaciones de bot
    const options = getBotOptimizedOptions()
    const metadata = generateTagMetadata(tag, {
      ...options,
      useCache: false,
    })

    // Guardar en cache persistente
    seoCache.set("tag", tag, metadata).catch(console.error)

    return metadata
  } catch (error) {
    console.error("Error generating optimized tag metadata:", error)
    return generateTagMetadata(tag, { includeStructuredData: true, useCache: false })
  }
}

// Invalidar cache cuando se actualiza una noticia
export async function invalidateNewsSEO(newsId: string): Promise<void> {
  try {
    await seoCache.invalidateNews(newsId)
  } catch (error) {
    console.error("Error invalidating news SEO cache:", error)
  }
}

// Invalidar cache de categoría
export async function invalidateCategorySEO(category: string): Promise<void> {
  try {
    await seoCache.invalidateCategory(category)
  } catch (error) {
    console.error("Error invalidating category SEO cache:", error)
  }
}

// Obtener estadísticas del cache
export function getSEOCacheStats() {
  return seoCache.getCacheStats()
}
