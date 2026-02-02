"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import Link from "next/link"
import { collection, query, getDocs, limit, orderBy, startAfter, type QueryDocumentSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebaseConfig"
import { SmallNewsCard } from "@/components/small-news-card"
import { MediumNewsCard } from "@/components/medium-news-card"
import { LargeNewsCard } from "@/components/large-news-card"
import LargeAdCard from "@/components/Publi/LargexlAdCard"
import MediumAdCard from "@/components/Publi/MediumAdCard"
import SmallAdCard from "@/components/Publi/SmallAdCard"
import SidebarAdCard from "@/components/Publi/SidebarAdCard"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, Hash, TrendingUp, ChevronRight, Clock } from "lucide-react"
import type { News } from "@/types/news"

const ITEMS_PER_PAGE = 40
const CACHE_DURATION = 15 * 60 * 1000 // 15 minutos

// Función para normalizar texto (quitar acentos y convertir a minúsculas)
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remover acentos
    .trim()
}

function convertirURL(urlOriginal: string): string {
  const newBaseUrl = "https://pub-514df041e2b3494caab09827cb896071.r2.dev"
  const imagePathIndex = urlOriginal.indexOf("/image")
  if (imagePathIndex !== -1) {
    return newBaseUrl + urlOriginal.slice(imagePathIndex)
  }
  return urlOriginal
}

export default function TagResultsContent({ params }: { params: { tag: string } }) {
  const { tag } = params
  const decodedTag = decodeURIComponent(tag).replace(/-/g, " ")

  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const processNewsItem = useCallback((item: News): News => {
    return {
      ...item,
      image: Array.isArray(item.image) ? item.image.map(convertirURL) : convertirURL(item.image as string),
    }
  }, [])

  const fetchNews = useCallback(
    async (isInitialFetch = false) => {
      try {
        setError(null)

        if (isInitialFetch) {
          setLoading(true)

          // Verificar cache
          const cachedNews = localStorage.getItem(`cachedTagNews_${decodedTag}`)
          const cachedTimestamp = localStorage.getItem(`cachedTagTimestamp_${decodedTag}`)

          if (cachedNews && cachedTimestamp) {
            const currentTime = new Date().getTime()
            const cacheAge = currentTime - Number.parseInt(cachedTimestamp)

            if (cacheAge < CACHE_DURATION) {
              const parsedNews = JSON.parse(cachedNews).map(processNewsItem)
              setNews(parsedNews)
              setLoading(false)
              setHasMore(parsedNews.length >= ITEMS_PER_PAGE)
              return
            }
          }
        } else {
          setLoadingMore(true)
        }

        // Obtener todas las noticias y filtrar en el cliente
        let newsQuery = query(
          collection(db, "news"),
          orderBy("date", "desc"),
          limit(500), // Obtener más noticias para filtrar
        )

        if (lastVisible && !isInitialFetch) {
          newsQuery = query(newsQuery, startAfter(lastVisible))
        }

        const querySnapshot = await getDocs(newsQuery)

        // Normalizar el tag de búsqueda
        const normalizedSearchTag = normalizeText(decodedTag)

        // Filtrar noticias que contengan el tag (sin importar mayúsculas/minúsculas/acentos)
        const newsWithTag: News[] = querySnapshot.docs
          .map(
            (doc) =>
              ({
                id: doc.id,
                ...doc.data(),
              }) as News,
          )
          .filter((news) => {
            if (!news.tags || !Array.isArray(news.tags)) return false

            return news.tags.some((tag) => normalizeText(tag).includes(normalizedSearchTag))
          })
          .slice(0, ITEMS_PER_PAGE) // Limitar después del filtrado

        const processedNewsData = newsWithTag.map(processNewsItem)

        if (isInitialFetch) {
          setNews(processedNewsData)
          localStorage.setItem(`cachedTagNews_${decodedTag}`, JSON.stringify(processedNewsData))
          localStorage.setItem(`cachedTagTimestamp_${decodedTag}`, new Date().getTime().toString())
        } else {
          setNews((prevNews) => [...prevNews, ...processedNewsData])
        }

        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1] || null)
        setHasMore(newsWithTag.length === ITEMS_PER_PAGE)
      } catch (error) {
        console.error(`Error al obtener noticias con la etiqueta ${decodedTag}:`, error)
        setError("Error al cargar las noticias. Por favor, intenta nuevamente.")
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [decodedTag, lastVisible, processNewsItem],
  )

  useEffect(() => {
    setNews([])
    setLastVisible(null)
    setHasMore(true)
    fetchNews(true)
  }, [decodedTag])

  const loadMore = () => {
    if (hasMore && !loadingMore) {
      fetchNews()
    }
  }

  const memoizedNewsGroups = useMemo(() => {
    return {
      heroNews: news.slice(0, 1),
      featuredNews: news.slice(1, 4),
      sidebarNews: news.slice(4, 8),
      gridNews1: news.slice(8, 16),
      gridNews2: news.slice(16, 22),
      lateralNews: news.slice(22, 30),
      finalNews: news.slice(30),
    }
  }, [news])

  if (loading && news.length === 0) {
    return (
      <div className="w-full h-[100vh] bg-[#182538] flex justify-center items-center">
        <img
          alt="logoloader"
          className="h-20 w-auto"
          src="https://res.cloudinary.com/deemssikv/image/upload/v1738581472/logo_rojo_azul_1_ethdja.svg"
        />
      </div>
    )
  }

  if (error && news.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Hash className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error al cargar</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <Button onClick={() => fetchNews(true)} className="w-full bg-red-600 hover:bg-red-700">
              Reintentar
            </Button>
            <Link
              href="/"
              className="block w-full px-4 py-2 text-center bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-red-600 transition-colors">
              Inicio
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/tag" className="hover:text-red-600 transition-colors">
              Tags
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">#{decodedTag}</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <Link
                  href="/tag"
                  className="inline-flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm">Explorar tags</span>
                </Link>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Hash className="w-6 h-6 text-red-600" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 capitalize">{decodedTag}</h1>
              </div>

              <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mb-4">
                Todas las noticias relacionadas con <strong>{decodedTag}</strong>. Mantente informado con las últimas
                actualizaciones y análisis sobre este tema.
              </p>

              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">
                  {news.length} {news.length === 1 ? "noticia encontrada" : "noticias encontradas"}
                </span>
                <div className="h-4 w-px bg-gray-300"></div>
                <span className="text-sm text-gray-500">Actualizado {new Date().toLocaleDateString("es-ES")}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium text-gray-700">Trending Topic</span>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {news.length > 0 ? (
          <div className="space-y-12">
            {/* Hero Section - Layout optimizado */}
            <section>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Columna principal - Noticia destacada */}
                <div className="lg:col-span-3">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Noticia principal grande */}
                    <div className="lg:col-span-2">
                      {memoizedNewsGroups.heroNews[0] && <LargeNewsCard news={memoizedNewsGroups.heroNews[0]} />}
                    </div>

                    {/* Dos noticias medianas debajo */}
                    {memoizedNewsGroups.featuredNews.slice(0, 2).map((item) => (
                      <div key={item.id}>
                        <MediumNewsCard news={item} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sidebar con publicidad y noticias pequeñas */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Publicidad sidebar */}
                  <SidebarAdCard />

                  {/* Trending en este tag */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="w-5 h-5 text-red-600" />
                      <h3 className="font-bold text-gray-900">Más sobre #{decodedTag}</h3>
                    </div>
                    <div className="space-y-3">
                      {memoizedNewsGroups.sidebarNews.slice(0, 4).map((item, index) => (
                        <Link
                          key={item.id}
                          href={`/news/${item.id}`}
                          className="block group hover:bg-gray-50 rounded-lg p-2 transition-colors"
                        >
                          <div className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                              {index + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-red-700 transition-colors">
                                {item.title}
                              </h4>
                              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                <span>
                                  {new Date(item.date).toLocaleDateString("es-ES", {
                                    day: "numeric",
                                    month: "short",
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Publicidad grande */}
            <section className="flex justify-center">
              <LargeAdCard />
            </section>

            {/* Layout balanceado con MediumAdCard integrada */}
            <section>
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Columna 1 - 2 noticias pequeñas */}
                <div className="space-y-6">
                  {memoizedNewsGroups.gridNews1.slice(0, 2).map((item) => (
                    <SmallNewsCard key={item.id} news={item} />
                  ))}
                </div>

                {/* Columna 2 - 2 noticias pequeñas */}
                <div className="space-y-6">
                  {memoizedNewsGroups.gridNews1.slice(2, 4).map((item) => (
                    <SmallNewsCard key={item.id} news={item} />
                  ))}
                </div>

                {/* Columna central - MediumAdCard */}
                <div className="flex justify-center items-start">
                  <MediumAdCard />
                </div>

                {/* Columna 4 - 2 noticias pequeñas */}
                <div className="space-y-6">
                  {memoizedNewsGroups.gridNews1.slice(4, 6).map((item) => (
                    <SmallNewsCard key={item.id} news={item} />
                  ))}
                </div>

                {/* Columna 5 - 2 noticias pequeñas */}
                <div className="space-y-6">
                  {memoizedNewsGroups.gridNews1.slice(6, 8).map((item) => (
                    <SmallNewsCard key={item.id} news={item} />
                  ))}
                </div>
              </div>
            </section>

            {/* Grid de noticias medianas */}
            <section>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {memoizedNewsGroups.gridNews2.map((item) => (
                  <MediumNewsCard key={item.id} news={item} />
                ))}
              </div>
            </section>

            {/* Layout con SmallAdCard lateral */}
            <section>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Columna de publicidad pequeña (800px) */}
                <div className="lg:col-span-1">
                  <div className="sticky top-4">
                    <SmallAdCard />
                  </div>
                </div>

                {/* Contenido principal */}
                <div className="lg:col-span-3">
                  {/* Noticia destacada */}
                  <div className="mb-6">
                    {memoizedNewsGroups.lateralNews[0] && <LargeNewsCard news={memoizedNewsGroups.lateralNews[0]} />}
                  </div>

                  {/* Grid de noticias pequeñas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {memoizedNewsGroups.lateralNews.slice(1, 7).map((item) => (
                      <SmallNewsCard key={item.id} news={item} />
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Publicidad grande */}
            <section className="flex justify-center">
              <LargeAdCard />
            </section>

            {/* Grid final de noticias */}
            <section>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {memoizedNewsGroups.finalNews.map((newsItem, index) => (
                  <div key={newsItem.id}>
                    <SmallNewsCard news={newsItem} />

                    {/* Intercalar publicidad cada 12 noticias */}
                    {(index + 1) % 12 === 0 && (
                      <div className="col-span-full flex justify-center mt-8 mb-8">
                        <MediumAdCard />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center mt-12">
                <Button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-8 py-3 text-lg bg-red-600 hover:bg-red-700"
                  size="lg"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Cargando más noticias...
                    </>
                  ) : (
                    "Cargar más noticias"
                  )}
                </Button>
              </div>
            )}

            {/* Related Tags */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Tags relacionados</h2>
              <div className="flex flex-wrap gap-2">
                {[
                  "Últimas Noticias",
                  "Tendencias",
                  "Análisis",
                  "Opinión",
                  "Investigación",
                  "Entrevistas",
                  "Reportajes",
                  "Breaking News",
                  "Actualidad",
                  "Exclusivas",
                ]
                  .filter((relatedTag) => normalizeText(relatedTag) !== normalizeText(decodedTag))
                  .slice(0, 8)
                  .map((relatedTag) => (
                    <Link
                      key={relatedTag}
                      href={`/tag/${relatedTag.toLowerCase().replace(/\s+/g, "-")}`}
                      className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-red-100 hover:text-red-700 transition-colors font-medium"
                    >
                      #{relatedTag}
                    </Link>
                  ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <Link
                  href="/tag"
                  className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-medium text-sm"
                >
                  Ver todos los tags
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </section>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Hash className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No hay noticias disponibles</h2>
            <p className="text-gray-600 mb-6">
              No se encontraron noticias con la etiqueta <strong>#{decodedTag}</strong>.
            </p>
            <div className="space-y-3 max-w-sm mx-auto">
              <Button onClick={() => fetchNews(true)} className="w-full bg-red-600 hover:bg-red-700">
                Buscar nuevamente
              </Button>
              <Link
                href="/tag"
                className="block w-full px-4 py-2 text-center bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Explorar otros tags
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
