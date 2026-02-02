import type { News } from "@/lib/validations"
import { parseDraftJSToPlainText } from "@/utils/draftjs-parser"

export interface SEOData {
  title: string
  description: string
  keywords: string[]
  canonical?: string
  openGraph: {
    title: string
    description: string
    image: string
    images?: Array<{
      url: string
      secure_url?: string
      width?: number
      height?: number
      alt?: string
      type?: string
    }>
    url: string
    type: "website" | "article"
    siteName: string
    locale: string
    publishedTime?: string
    modifiedTime?: string
    author?: string
    section?: string
    tags?: string[]
  }
  twitter: {
    card: "summary" | "summary_large_image"
    site: string
    creator?: string
    title: string
    description: string
    image: string
    imageAlt?: string
  }
  structuredData?: any
}

const getSiteUrl = () => {
  const url = process.env.NEXT_PUBLIC_BASE_URL || "https://eldopolis.com"
  return url.startsWith("http") ? url : `https://${url}`
}

// Configuración base del sitio - EXPORTADA como DEFAULT_SEO
export const DEFAULT_SEO = {
  siteName: "Eldópolis",
  siteUrl: getSiteUrl(),
  defaultTitle: "Eldópolis - Noticias de actualidad",
  defaultDescription:
    "Portal de noticias de Eldorado, Misiones. Las últimas noticias de política, deportes, economía, sociedad y más.",
  defaultImage: "/images/og-default.jpg",
  twitterHandle: "@eldopolis",
  language: "es",
  locale: "es_AR",
  keywords: ["noticias", "eldorado", "misiones", "argentina", "actualidad", "política", "deportes"],
  logo: "/images/logo.png",
  type: "website",
}

// Cache en memoria para metadatos (fallback)
const memoryCache = new Map<string, SEOData>()
const MEMORY_CACHE_TTL = 5 * 60 * 1000 // 5 minutos
const cacheTimestamps = new Map<string, number>()

function getAbsoluteUrl(path: string): string {
  if (!path) return `${DEFAULT_SEO.siteUrl}${DEFAULT_SEO.defaultImage}`
  if (path.startsWith("http")) return path

  const base = DEFAULT_SEO.siteUrl.endsWith("/") ? DEFAULT_SEO.siteUrl.slice(0, -1) : DEFAULT_SEO.siteUrl
  const cleanPath = path.startsWith("/") ? path : `/${path}`
  return `${base}${cleanPath}`
}

function sanitizeText(text: string, maxLength?: number): string {
  if (!text) return ""

  const cleanedText = text
    .replace(/<[^>]*>?/gm, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s\s+/g, " ")
    .trim()

  if (maxLength && cleanedText.length > maxLength) {
    return `${cleanedText.slice(0, maxLength - 3)}...`
  }
  return cleanedText
}

function getCachedMetadata(cacheKey: string): SEOData | null {
  const cached = memoryCache.get(cacheKey)
  const timestamp = cacheTimestamps.get(cacheKey)

  if (cached && timestamp && Date.now() - timestamp < MEMORY_CACHE_TTL) {
    return cached
  }

  memoryCache.delete(cacheKey)
  cacheTimestamps.delete(cacheKey)
  return null
}

function setCachedMetadata(cacheKey: string, data: SEOData): void {
  memoryCache.set(cacheKey, data)
  cacheTimestamps.set(cacheKey, Date.now())

  if (memoryCache.size > 500) {
    const oldestKey = memoryCache.keys().next().value
    memoryCache.delete(oldestKey)
    cacheTimestamps.delete(oldestKey)
  }
}

// Función auxiliar para obtener imagen de noticia
function getNewsImage(news: News): string {
  // Priorizar imageUrl, luego image
  if (news.imageUrl) return news.imageUrl
  if (news.image) {
    return Array.isArray(news.image) ? news.image[0] : news.image
  }
  return DEFAULT_SEO.defaultImage
}

/**
 * 🚀 FUNCIÓN PRINCIPAL: Genera metadatos con cache persistente
 */
export async function generateNewsMetadata(news: News): Promise<SEOData> {
  // 1. 🚀 INTENTAR OBTENER DE CACHE PERSISTENTE
  const newsTimestamp = news.timestamp || news.date
  const memoryCacheKey = `news-${news.id}-${newsTimestamp}`
  const memoryCached = getCachedMetadata(memoryCacheKey)
  if (memoryCached) {
    return memoryCached
  }

  // 2. 🚀 GENERAR METADATOS (solo si no hay cache)
  console.log(`🔄 Generating SEO metadata for: ${news.id}`)

  const canonicalUrl = `/news/${news.id}`

  // Procesar imágenes
  let imageUrls: string[] = []
  const newsImage = getNewsImage(news)
  if (newsImage && newsImage !== DEFAULT_SEO.defaultImage) {
    imageUrls = [newsImage]
  } else {
    imageUrls = [DEFAULT_SEO.defaultImage]
  }

  const absoluteImageUrls = imageUrls.map(getAbsoluteUrl)
  const professionalTitle = sanitizeText(news.title, 70) || "Noticia sin título"

  // Procesar descripción optimizada
  const subtitleValid =
    news.subtitle && typeof news.subtitle === "string" && !news.subtitle.includes("{") && news.subtitle.length > 10

  let finalDescription = ""

  if (subtitleValid) {
    finalDescription = sanitizeText(news.subtitle, 160)
  } else if (news.description) {
    const bodyText = parseDraftJSToPlainText(news.description)
    if (bodyText && bodyText.length > 10) {
      finalDescription = sanitizeText(bodyText, 160)
    }
  }

  if (!finalDescription) {
    finalDescription = `Noticia publicada en ${DEFAULT_SEO.siteName} sobre ${news.mainCategory || "actualidad"}.`
  }

  // Keywords optimizados
  const keywords = Array.from(
    new Set([...(news.tags || []), news.mainCategory, news.subCategory, "noticias", "actualidad"]),
  )
    .filter(Boolean)
    .slice(0, 5) as string[]

  const result: SEOData = {
    title: `${professionalTitle} | ${DEFAULT_SEO.siteName}`,
    description: finalDescription,
    keywords,
    canonical: canonicalUrl,
    openGraph: {
      title: professionalTitle,
      description: finalDescription,
      image: absoluteImageUrls[0],
      images: absoluteImageUrls.slice(0, 3).map((url) => ({
        url: url,
        secure_url: url.replace("http://", "https://"),
        width: 1200,
        height: 630,
        alt: professionalTitle,
        type: "image/jpeg",
      })),
      url: canonicalUrl,
      type: "article",
      siteName: DEFAULT_SEO.siteName,
      locale: DEFAULT_SEO.locale,
      publishedTime: news.date,
      modifiedTime: newsTimestamp,
      author: news.author || DEFAULT_SEO.siteName,
      section: news.mainCategory || "Noticias",
      tags: news.tags?.slice(0, 5) || [],
    },
    twitter: {
      card: "summary_large_image",
      site: DEFAULT_SEO.twitterHandle,
      creator: news.author ? `@${news.author.toLowerCase().replace(/\s+/g, "")}` : DEFAULT_SEO.twitterHandle,
      title: professionalTitle,
      description: finalDescription,
      image: absoluteImageUrls[0],
      imageAlt: professionalTitle,
    },
    structuredData: generateNewsArticleStructuredData(news),
  }

  // 3. 🚀 CACHEAR RESULTADO EN AMBOS LUGARES
  setCachedMetadata(memoryCacheKey, result)

  return result
}

export function generateCategoryMetadata(category: string, newsCount = 0): SEOData {
  const cacheKey = `category-${category}-${newsCount}`
  const cached = getCachedMetadata(cacheKey)
  if (cached) return cached

  const categoryDescriptions: Record<string, string> = {
    mundo: "Las noticias más importantes del mundo, política internacional y eventos globales.",
    deporte: "Toda la actualidad deportiva, resultados, fichajes y análisis deportivo.",
    politica: "Política nacional, elecciones, gobierno y análisis político.",
    policiales: "Noticias policiales, seguridad ciudadana y crónica del país.",
    sociedad: "Noticias de sociedad, cultura, educación y comunidad.",
    columna: "Opiniones, análisis y columnas de periodistas y colaboradores.",
    espectaculos: "Entretenimiento, celebridades, cine, música y espectáculos.",
    economia: "Economía nacional e internacional, mercados y finanzas.",
  }

  const description = categoryDescriptions[category.toLowerCase()] || `Noticias de ${category}`
  const fullDescription = `${description} ${newsCount > 0 ? `${newsCount} noticias disponibles.` : ""} Mantente informado con ${DEFAULT_SEO.siteName}.`

  const categoryImage = getAbsoluteUrl(`/images/og-category-${category.toLowerCase()}.jpg`)

  const result: SEOData = {
    title: `${category} - Noticias | ${DEFAULT_SEO.siteName}`,
    description: fullDescription,
    keywords: [category, "noticias", "actualidad", DEFAULT_SEO.siteName.toLowerCase()].slice(0, 4),
    canonical: `/category/${category.toLowerCase()}`,
    openGraph: {
      title: `Noticias de ${category}`,
      description: fullDescription,
      image: categoryImage,
      url: `/category/${category.toLowerCase()}`,
      type: "website",
      siteName: DEFAULT_SEO.siteName,
      locale: DEFAULT_SEO.locale,
    },
    twitter: {
      card: "summary_large_image",
      site: DEFAULT_SEO.twitterHandle,
      title: `Noticias de ${category}`,
      description: fullDescription,
      image: categoryImage,
    },
    structuredData: generateCategoryStructuredData(category),
  }

  setCachedMetadata(cacheKey, result)
  return result
}

export function generateTagMetadata(tag: string, newsCount = 0): SEOData {
  const cacheKey = `tag-${tag}-${newsCount}`
  const cached = getCachedMetadata(cacheKey)
  if (cached) return cached

  const description = `Todas las noticias relacionadas con ${tag}. ${newsCount > 0 ? `${newsCount} artículos disponibles.` : ""} Información actualizada en ${DEFAULT_SEO.siteName}.`

  const result: SEOData = {
    title: `${tag} - Noticias y artículos | ${DEFAULT_SEO.siteName}`,
    description,
    keywords: [tag, "noticias", "artículos", "información", "actualidad"].slice(0, 5),
    canonical: `/tag/${encodeURIComponent(tag)}`,
    openGraph: {
      title: `Noticias sobre ${tag}`,
      description,
      image: getAbsoluteUrl(DEFAULT_SEO.defaultImage),
      url: `/tag/${encodeURIComponent(tag)}`,
      type: "website",
      siteName: DEFAULT_SEO.siteName,
      locale: DEFAULT_SEO.locale,
    },
    twitter: {
      card: "summary",
      site: DEFAULT_SEO.twitterHandle,
      title: `Noticias sobre ${tag}`,
      description,
      image: getAbsoluteUrl(DEFAULT_SEO.defaultImage),
    },
    structuredData: generateTagStructuredData(tag),
  }

  setCachedMetadata(cacheKey, result)
  return result
}

// Generar datos estructurados para el sitio web
export function generateWebsiteStructuredData(): object {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: DEFAULT_SEO.siteName,
    description: DEFAULT_SEO.defaultDescription,
    url: DEFAULT_SEO.siteUrl,
    logo: {
      "@type": "ImageObject",
      url: getAbsoluteUrl(DEFAULT_SEO.logo),
    },
    publisher: {
      "@type": "Organization",
      name: DEFAULT_SEO.siteName,
      logo: {
        "@type": "ImageObject",
        url: getAbsoluteUrl(DEFAULT_SEO.logo),
      },
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${DEFAULT_SEO.siteUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  }
}

// Generar breadcrumbs estructurados
export function generateBreadcrumbStructuredData(items: Array<{ name: string; url: string }>): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : getAbsoluteUrl(item.url),
    })),
  }
}

// Generar datos estructurados para artículos de noticias
export function generateNewsArticleStructuredData(news: News): object {
  const image = getNewsImage(news)

  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: news.title,
    description: news.subtitle || extractTextFromDescription(news.description).slice(0, 160),
    image: image ? [getAbsoluteUrl(image)] : [getAbsoluteUrl(DEFAULT_SEO.defaultImage)],
    datePublished: news.date,
    dateModified: new Date(news.timestamp).toISOString(),
    author: {
      "@type": "Person",
      name: news.author || DEFAULT_SEO.siteName,
    },
    publisher: {
      "@type": "Organization",
      name: DEFAULT_SEO.siteName,
      logo: {
        "@type": "ImageObject",
        url: getAbsoluteUrl(DEFAULT_SEO.logo),
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": getAbsoluteUrl(`/news/${news.id}`),
    },
    articleSection: news.mainCategory,
    keywords: news.tags?.join(", ") || "",
    wordCount: estimateWordCount(news.description),
    articleBody: extractTextFromDescription(news.description),
  }
}

function generateCategoryStructuredData(category: string) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Noticias de ${category}`,
    description: `Todas las noticias de la categoría ${category}`,
    url: getAbsoluteUrl(`/category/${category.toLowerCase()}`),
    mainEntity: {
      "@type": "ItemList",
      name: `Noticias de ${category}`,
    },
  }
}

function generateTagStructuredData(tag: string) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Noticias sobre ${tag}`,
    description: `Todas las noticias relacionadas con ${tag}`,
    url: getAbsoluteUrl(`/tag/${encodeURIComponent(tag)}`),
    mainEntity: {
      "@type": "ItemList",
      name: `Noticias sobre ${tag}`,
    },
  }
}

// Funciones auxiliares
function extractTextFromDescription(description: string): string {
  if (!description) return ""

  try {
    // Si es contenido Draft.js
    const parsed = JSON.parse(description)
    if (parsed.blocks && Array.isArray(parsed.blocks)) {
      return parsed.blocks
        .map((block: any) => block.text || "")
        .join(" ")
        .trim()
    }
  } catch {
    // Si no es JSON, devolver como texto plano
  }

  // Limpiar HTML si existe
  return description
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function estimateWordCount(text: string): number {
  const plainText = extractTextFromDescription(text)
  return plainText.split(/\s+/).filter((word) => word.length > 0).length
}

export function clearSEOCache(pattern?: string): void {
  if (pattern) {
    for (const key of memoryCache.keys()) {
      if (key.includes(pattern)) {
        memoryCache.delete(key)
        cacheTimestamps.delete(key)
      }
    }
  } else {
    memoryCache.clear()
    cacheTimestamps.clear()
  }
}

export function getSEOCacheStats() {
  return {
    size: memoryCache.size,
    keys: Array.from(memoryCache.keys()),
    hitRate: memoryCache.size > 0 ? "Cache activo" : "Cache vacío",
  }
}

/**
 * 🚀 FUNCIÓN PARA INVALIDAR CACHE CUANDO SE ACTUALIZA UNA NOTICIA
 */
export async function invalidateNewsSEO(newsId: string): Promise<void> {
  try {
    clearSEOCache(newsId)
    console.log(`🗑️ SEO Cache invalidated for news: ${newsId}`)
  } catch (error) {
    console.error("Error invalidating news SEO:", error)
  }
}
