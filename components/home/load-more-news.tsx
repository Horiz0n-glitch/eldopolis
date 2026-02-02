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
import { WeatherWidget } from "@/components/weather-widget"

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

    // Observer para Scroll Infinito con carga anticipada (estilo Pinterest)
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    loadMore()
                }
            },
            {
                threshold: 0,
                rootMargin: "800px" // Carga mucho antes de llegar al final para fluidez total
            }
        )

        if (loaderRef.current) {
            observer.observe(loaderRef.current)
        }

        return () => observer.disconnect()
    }, [loadMore, hasMore, loading])

    const trends = allNews.slice(0, 5)

    return (
        <div className="space-y-12">
            {/* Sección 1: Hero section (siempre con las primeras noticias) */}
            <HeroSection news={allNews.slice(0, 8)} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-4 md:px-8 lg:px-12">
                {/* Main Content Area */}
                <div className="lg:col-span-8 flex flex-col gap-10">

                    {/* Noticias Principales (Post-Hero) - Lista Vertical Clásica */}
                    <div className="space-y-10">
                        {allNews.slice(8, 14).map((news) => (
                            <MediumNewsCard key={`${news.id}-main`} news={news} />
                        ))}
                    </div>

                    {/* Separador Visual */}
                    {allNews.length >= 14 && (
                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-white dark:bg-slate-950 px-3 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                    Más Noticias
                                </span>
                            </div>
                        </div>
                    )}

                    {/* GRID INFINITO ESTILO PINTEREST */}
                    {/* Las noticias cargadas dinámicamente se muestran en grid para mejor consumo */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {allNews.slice(14).map((news) => (
                            <div key={`${news.id}-grid`} className="opacity-0 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-forwards">
                                <SmallNewsCard news={news} />
                            </div>
                        ))}
                    </div>

                    {/* Indicador de carga invisible pero detectado anticipadamente */}
                    <div ref={loaderRef} className="flex justify-center py-8 min-h-[50px]">
                        {loading && (
                            <Loader2 className="w-8 h-8 animate-spin text-primary/60" />
                        )}
                    </div>
                </div>

                {/* Sidebar (Sticky) */}
                <aside className="lg:col-span-4 space-y-8 h-fit lg:sticky lg:top-24">
                    {/* Tendencia */}
                    <div className="bg-white dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <h3 className="text-base font-extrabold mb-6 flex items-center justify-between text-slate-800 dark:text-slate-100">
                            Tendencia
                            <TrendingUp className="text-primary w-4 h-4" />
                        </h3>
                        <div className="space-y-6">
                            {trends.map((item, i) => (
                                <Link key={item.id} href={`/news/${item.id}`} className="flex gap-4 group cursor-pointer items-start">
                                    <span className="text-2xl font-black text-slate-200 dark:text-slate-700 leading-none">
                                        {String(i + 1).padStart(2, '0')}
                                    </span>
                                    <div>
                                        <h4 className="text-sm font-bold leading-snug transition-colors group-hover:text-primary text-slate-700 dark:text-slate-300">
                                            {item.title}
                                        </h4>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Clima */}
                    <WeatherWidget />

                    <AdPlaceholder height="300px" text="Publicidad" />
                </aside>
            </div>
        </div>
    )
}
