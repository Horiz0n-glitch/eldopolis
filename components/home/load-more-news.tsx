"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Loader2, ChevronDown, TrendingUp, Mail } from "lucide-react"
import type { News } from "@/lib/validations"
import { HeroSection } from "./hero-section"
import { SmallNewsCard } from "@/components/small-news-card"
import { MediumNewsCard } from "@/components/medium-news-card"
import { getNewsOptimized } from "@/lib/firebase-optimized"
import AdPlaceholder from "@/components/Publi/AdPlaceholder"

interface LoadMoreNewsProps {
    initialNews: News[]
}

interface NewsGroup {
    news: News[]
    loaded: boolean
    loading: boolean
}

export function LoadMoreNews({ initialNews }: LoadMoreNewsProps) {
    const [newsGroups, setNewsGroups] = useState<NewsGroup[]>([
        { news: initialNews, loaded: true, loading: false },
        { news: [], loaded: false, loading: false },
        { news: [], loaded: false, loading: false },
    ])
    const [lastDoc, setLastDoc] = useState<any>(null)

    const handleLoadMore = useCallback(async (groupIndex: number) => {
        if (newsGroups[groupIndex].loading) return

        setNewsGroups((prev) =>
            prev.map((group, index) => (index === groupIndex ? { ...group, loading: true } : group)),
        )

        try {
            const result = await getNewsOptimized(20, lastDoc)
            setNewsGroups((prev) =>
                prev.map((group, index) =>
                    index === groupIndex ? { news: result.news, loaded: true, loading: false } : group,
                ),
            )
            setLastDoc(result.lastDoc)
        } catch (error) {
            console.error("Error loading more news:", error)
            setNewsGroups((prev) =>
                prev.map((group, index) => (index === groupIndex ? { ...group, loading: false } : group)),
            )
        }
    }, [newsGroups, lastDoc])

    const trends = initialNews.slice(0, 5)

    return (
        <div className="space-y-16">
            {/* Sección 1: Hero section */}
            <HeroSection news={newsGroups[0].news} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 px-4 md:px-12 lg:px-20">
                {/* Main Content Area */}
                <div className="lg:col-span-8 space-y-12">
                    <div className="space-y-12">
                        {/* Primeras noticias post-hero */}
                        <div className="space-y-12">
                            {newsGroups[0].news.slice(3, 8).map((news) => (
                                <MediumNewsCard key={news.id} news={news} />
                            ))}
                        </div>

                        {/* Fila de tarjetas pequeñas (antes sección deportes) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 py-8 border-y border-slate-50 dark:border-slate-800/50">
                            {newsGroups[0].news.slice(8, 12).map((news) => (
                                <SmallNewsCard key={news.id} news={news} />
                            ))}
                        </div>

                        {/* Resto de las noticias iniciales */}
                        <div className="space-y-12">
                            {newsGroups[0].news.slice(12).map((news) => (
                                <MediumNewsCard key={news.id} news={news} />
                            ))}
                        </div>
                    </div>

                    {/* Botón Cargar Más */}
                    {!newsGroups[1].loaded && (
                        <div className="flex justify-center pt-8">
                            <Button
                                onClick={() => handleLoadMore(1)}
                                disabled={newsGroups[1].loading}
                                className="group px-10 py-6 bg-primary hover:bg-red-700 text-white rounded-full font-bold text-sm tracking-widest uppercase transition-all shadow-lg hover:shadow-primary/30 flex items-center gap-3 h-auto"
                            >
                                {newsGroups[1].loading ? <Loader2 className="animate-spin" /> : "Cargar Más Historias"}
                                <span className="material-symbols-outlined group-hover:translate-y-1 transition-transform">keyboard_arrow_down</span>
                            </Button>
                        </div>
                    )}

                    {/* Grupo 2 cargado */}
                    {newsGroups[1].loaded && (
                        <div className="space-y-12">
                            {newsGroups[1].news.map((news) => (
                                <MediumNewsCard key={news.id} news={news} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Sidebar */}
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
                                        <h4 className="text-sm font-bold leading-tight line-clamp-2 transition-colors mb-1">
                                            {item.title}
                                        </h4>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Clima Simulado */}
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

                    {/* Ad Reference */}
                    <AdPlaceholder height="250px" text="Publicidad" />
                </aside>
            </div>
        </div>
    )
}
