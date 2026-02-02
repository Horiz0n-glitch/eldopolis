"use client"

import { useEffect, useMemo } from "react"
import { Suspense } from "react"
import Link from "next/link"
import { LargeNewsCard } from "@/components/large-news-card"
import { MediumNewsCard } from "@/components/medium-news-card"
import { SmallNewsCard } from "@/components/small-news-card"
import SmallPrincipalAdCard from "@/components/Publi/SmallPrincipalAdCard"
import { ComponentLoader } from "@/components/lazy-components"
import { useOptimizedNews, usePrefetchRelated } from "@/hooks/use-optimized-news"
import { useMultipleAds } from "@/hooks/use-optimized-ads"
import { cacheManager } from "@/lib/cache-manager"
import type { News } from "@/types/news"

// Lazy load de componentes pesados
import { LargeAdCardLazy, MediumAdCardLazy, SmallAdCardLazy } from "@/components/lazy-components"

function convertirURL(urlOriginal: string): string {
  const newBaseUrl = "https://pub-514df041e2b3494caab09827cb896071.r2.dev"
  const imagePathIndex = urlOriginal.indexOf("/image")
  if (imagePathIndex !== -1) {
    return newBaseUrl + urlOriginal.slice(imagePathIndex)
  }
  return urlOriginal
}

export default function OptimizedHomePage() {
  const { news, loading, error, hasMore, loadMore, refresh } = useOptimizedNews(60)
  const { getAdsForCategory } = useMultipleAds([
    "Grande Principal",
    "Mediana Principal",
    "Pequeña Principal",
    "Sidebar",
  ])

  // Prefetch related content
  usePrefetchRelated("Política", ["Últimas Noticias", "Tendencias"])

  // Procesar noticias con URLs optimizadas
  const processedNews = useMemo(() => {
    return news.map(
      (item: News): News => ({
        ...item,
        image: Array.isArray(item.image) ? item.image.map(convertirURL) : convertirURL(item.image as string),
      }),
    )
  }, [news])

  // Agrupar noticias para diferentes secciones
  const newsGroups = useMemo(() => {
    return {
      hero: processedNews.slice(0, 1),
      featured: processedNews.slice(1, 13),
      section1: processedNews.slice(13, 20),
      section2: processedNews.slice(20, 24),
      section3: processedNews.slice(24, 30),
      section4: processedNews.slice(30, 36),
      section5: processedNews.slice(36, 42),
      section6: processedNews.slice(42, 50),
      final: processedNews.slice(50),
    }
  }, [processedNews])

  // Mostrar estadísticas de cache en desarrollo
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      const stats = cacheManager.getStats()
      console.log("📊 Cache Stats:", stats)
    }
  }, [])

  if (loading && processedNews.length === 0) {
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

  if (error && processedNews.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error al cargar</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={refresh}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="space-y-12">
        {processedNews.length > 0 && (
          <>
            {/* Sección 1: Hero section optimizado */}
            <div className="w-full px-6">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="lg:w-[70%] w-full">
                  {/* Hero principal */}
                  <div className="mb-6">
                    {newsGroups.hero.map((item) => (
                      <div key={item.id} className="transform hover:scale-[1.01] transition-transform duration-300">
                        <LargeNewsCard news={item} />
                      </div>
                    ))}
                  </div>

                  {/* Grid de noticias secundarias */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {newsGroups.featured.map((item) => (
                      <div key={item.id} className="transform hover:scale-[1.02] transition-transform duration-300">
                        <SmallNewsCard news={item} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sidebar optimizado */}
                <div className="lg:w-[30%] w-full">
                  <div className="sticky top-4 space-y-6">
                    <div className="space-y-4">
                      <Link
                        href="https://www.youtube.com/@EldopolisCanal"
                        className="block group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <img
                          alt="YouTube Canal"
                          src="https://pub-514df041e2b3494caab09827cb896071.r2.dev/3%20(2).png"
                          className="w-full h-auto rounded-xl group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </Link>

                      <Link
                        href="https://streaminglocucionar.com/portal/?p=16127"
                        target="_blank"
                        className="block group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <img
                          src="https://pub-514df041e2b3494caab09827cb896071.r2.dev/4%20(2).png"
                          alt="Radio en Vivo"
                          className="w-full h-auto rounded-xl group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </Link>
                    </div>

                    <Suspense fallback={<ComponentLoader />}>
                      <SmallPrincipalAdCard />
                    </Suspense>

                    {/* Widget trending optimizado */}
                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
                      <div className="flex items-center mb-3">
                        <div className="w-2 h-2 bg-red-600 rounded-full mr-2 animate-pulse"></div>
                        <h3 className="text-sm font-bold text-gray-900">Trending</h3>
                      </div>
                      <div className="space-y-2">
                        {newsGroups.hero.concat(newsGroups.featured.slice(0, 2)).map((item, index) => (
                          <Link
                            key={`trending-${item.id}`}
                            href={`/news/${item.id}`}
                            className="flex items-start gap-2 p-1 rounded hover:bg-white/50 transition-colors group"
                          >
                            <span className="flex-shrink-0 w-4 h-4 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                              {index + 1}
                            </span>
                            <p className="text-xs font-medium text-gray-800 line-clamp-2 group-hover:text-red-700">
                              {item.title.substring(0, 50)}...
                            </p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sección 2: Publicidad grande con lazy loading */}
            <div className="px-6">
              <Suspense fallback={<ComponentLoader className="h-64" />}>
                <LargeAdCardLazy />
              </Suspense>
            </div>

            {/* Sección 3: Layout balanceado con SmallAdCard */}
            <div className="w-full px-6">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="lg:w-1/4 w-full">
                  <div className="sticky top-4">
                    <Suspense fallback={<ComponentLoader className="h-[400px]" />}>
                      <SmallAdCardLazy />
                    </Suspense>
                  </div>
                </div>

                <div className="lg:w-3/4 w-full">
                  <div className="mb-6">
                    {newsGroups.section1[0] && <LargeNewsCard news={newsGroups.section1[0]} />}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {newsGroups.section1.slice(1).map((item) => (
                      <SmallNewsCard key={item.id} news={item} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sección 4: Grid de noticias medianas */}
            <div className="w-full px-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {newsGroups.section2.map((item) => (
                  <MediumNewsCard key={item.id} news={item} />
                ))}
              </div>
            </div>

            {/* Sección 5: Layout con MediumAdCard integrada */}
            <div className="w-full px-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="flex flex-col gap-6">
                  {newsGroups.section3.slice(0, 2).map((item) => (
                    <SmallNewsCard key={item.id} news={item} />
                  ))}
                </div>

                <div className="flex justify-center">
                  <Suspense fallback={<ComponentLoader className="h-96" />}>
                    <MediumAdCardLazy />
                  </Suspense>
                </div>

                <div className="flex flex-col gap-6">
                  {newsGroups.section3.slice(2, 4).map((item) => (
                    <SmallNewsCard key={item.id} news={item} />
                  ))}
                </div>

                <div className="flex flex-col gap-6">
                  {newsGroups.section3.slice(4, 6).map((item) => (
                    <SmallNewsCard key={item.id} news={item} />
                  ))}
                </div>
              </div>
            </div>

            {/* Continuar con más secciones... */}
            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-8 py-3 text-lg bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 transition-colors"
                >
                  {loading ? "Cargando..." : "Cargar más noticias"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
