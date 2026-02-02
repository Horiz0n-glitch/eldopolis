"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Loader2, ChevronDown, TrendingUp } from "lucide-react"
import type { News } from "@/lib/validations"
import { HeroSection } from "./hero-section"
import { SmallNewsCard } from "@/components/small-news-card"
import { MediumNewsCard } from "@/components/medium-news-card"
import { getNewsOptimized } from "@/lib/firebase-optimized"
import AdPlaceholder from "@/components/Publi/AdPlaceholder"

interface LoadMoreNewsProps {
    initialNews: News[]
}

export function LoadMoreNews({ initialNews }: LoadMoreNewsProps) {
    const [allNews, setAllNews] = useState<News[]>(initialNews)
    const [loading, setLoading] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const [lastDoc, setLastDoc] = useState<any>(null)
    const loaderRef = useRef<HTMLDivElement>(null)

    // Función para cargar más noticias
    const loadMore = useCallback(async () => {
        if (loading || !hasMore) return
        setLoading(true)

        try {
            // Usamos las últimas noticias cargadas para obtener el marcador de paginación si no tenemos lastDoc directo
            // Aquí asumo que getNewsOptimized maneja el cursor internamente o necesita el ID
            const result = await getNewsOptimized(12, lastDoc)

            if (result.news.length === 0) {
                setHasMore(false)
            } else {
                setAllNews(prev => [...prev, ...result.news])
                setLastDoc(result.lastDoc)
            }
        } catch (error) {
            console.error("Error loading more news:", error)
        } finally {
            setLoading(false)
        }
    }, [loading, hasMore, lastDoc])

    // Observer para Scroll Infinito
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    loadMore()
                }
            },
            { threshold: 0.1 }
        )

        if (loaderRef.current) {
            observer.observe(loaderRef.current)
        }

        return () => observer.disconnect()
    }, [loadMore, hasMore, loading])

    const trends = allNews.slice(0, 5)

    return (
        <div className="space-y-16">
            {/* Sección 1: Hero section (siempre con las primeras noticias) */}
            <HeroSection news={allNews.slice(0, 8)} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 px-4 md:px-12 lg:px-20">
                {/* Main Content Area */}
                <div className="lg:col-span-8 space-y-12">
                    <div className="space-y-12">
                        {/* Noticias Principales (Post-Hero) */}
                        <div className="space-y-12">
                            {allNews.slice(8, 15).map((news) => (
                                <MediumNewsCard key={`${news.id}-${news.title}`} news={news} />
                            ))}
                        </div>

                        {/* Separador con noticias pequeñas si hay suficientes */}
                        {allNews.length >= 20 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 py-8 border-y border-slate-50 dark:border-slate-800/50">
                                {allNews.slice(15, 19).map((news) => (
                                    <SmallNewsCard key={`${news.id}-${news.title}`} news={news} />
                                ))}
                            </div>
                        )}

                        {/* El resto de las noticias cargadas dinámicamente */}
                        <div className="space-y-12">
                            {allNews.slice(allNews.length >= 20 ? 19 : 15).map((news) => (
                                <MediumNewsCard key={`${news.id}-${news.title}`} news={news} />
                            ))}
                        </div>
                    </div>

                    {/* Indicador de carga / Trigger para Intersection Observer */}
                    <div ref={loaderRef} className="flex justify-center pt-12 min-h-[100px]">
                        {loading && (
                            <div className="flex flex-col items-center gap-4">
                                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                                <p className="text-sm font-medium text-slate-500 animate-pulse">Cargando más historias...</p>
                            </div>
                        )}
                        {!hasMore && allNews.length > 0 && (
                            <p className="text-sm font-medium text-slate-400">Has llegado al final de las noticias</p>
                        )}
                    </div>
                </div>

                {/* Sidebar (Sticky) */}
                <aside className="lg:col-span-4 space-y-12 h-fit lg:sticky lg:top-32">
                    {/* Tendencia */}
                    <div className="bg-white dark:bg-slate-800/50 p-8 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <h3 className="text-lg font-extrabold mb-8 flex items-center justify-between">
                            Tendencia
                            <TrendingUp className="text-primary w-5 h-5" />
                        </h3>
                        <div className="space-y-8">
                            {trends.map((item, i) => (
                                <Link key={item.id} href={`/news/${item.id}`} className="flex gap-4 group cursor-pointer">
                                    <span className="text-3xl font-black text-slate-200 dark:text-slate-700">
                                        {String(i + 1).padStart(2, '0')}
                                    </span>
                                    <div>
                                        <h4 className="text-sm font-bold leading-tight line-clamp-2 transition-colors mb-1 group-hover:text-primary">
                                            {item.title}
                                        </h4>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Clima */}
                    <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-8 rounded-xl text-white shadow-xl">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <p className="text-sm font-bold opacity-80">Eldorado, MN</p>
                                <h3 className="text-4xl font-black">28°C</h3>
                            </div>
                            <span className="material-symbols-outlined text-5xl">wb_sunny</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                            <span>Humedad: 82%</span>
                            <span>Viento: 12 km/h</span>
                        </div>
                    </div>

                    <AdPlaceholder height="250px" text="Publicidad" />
                </aside>
            </div>
        </div>
    )
}
