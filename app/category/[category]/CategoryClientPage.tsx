"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { News } from "@/lib/validations"
import {
    Filter,
    ArrowLeft,
    Clock,
    TrendingUp,
    MapPin,
    Mail,
    Phone,
    Share,
    Globe,
    Sun,
    ChevronDown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { WebSiteJsonLd } from "@/components/seo/json-ld"
import { convertirURL } from "@/lib/image-utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"

const categoryMapping: Record<string, string> = {
    mundo: "Mundo",
    deporte: "Deporte",
    politica: "Política",
    policiales: "Policiales",
    sociedad: "Sociedad",
    columna: "Columna",
    espectaculos: "Espectaculos",
    economia: "Economia",
}

const categoryDisplayNames: Record<string, string> = {
    mundo: "Mundo",
    deporte: "Deporte",
    politica: "Política",
    policiales: "Policiales",
    sociedad: "Sociedad",
    columna: "Columna",
    espectaculos: "Espectaculos",
    economia: "Economia",
}

interface CategoryClientPageProps {
    initialNews?: News[]
    categorySlug?: string
    isServerRendered?: boolean
}

export default function CategoryClientPage({
    initialNews = [],
    categorySlug: propCategorySlug,
    isServerRendered = false,
}: CategoryClientPageProps) {
    const [news, setNews] = useState<News[]>(initialNews)
    const [allNews, setAllNews] = useState<News[]>(initialNews) // Keep original for filtering
    const [loading, setLoading] = useState(!isServerRendered)
    const [error, setError] = useState<string | null>(null)
    const [mounted, setMounted] = useState(false)
    const [visibleCount, setVisibleCount] = useState(7)
    const [activeFilter, setActiveFilter] = useState<"todo" | "24h" | "leidas" | "eldorado" | "provinciales">("todo")

    useEffect(() => {
        setMounted(true)
    }, [])

    const categorySlug =
        propCategorySlug || (typeof window !== "undefined" ? window.location.pathname.split("/").pop() : "")
    const categoryName = categoryDisplayNames[categorySlug || ""] || categorySlug || "Categoría"

    useEffect(() => {
        const processInitialNews = () => {
            if (initialNews.length > 0) {
                const processed = initialNews.map((item: any) => ({
                    ...item,
                    imageUrl: convertirURL(item.imageUrl || (Array.isArray(item.image) ? item.image[0] : (item.image as string)) || ""),
                }))
                setNews(processed as News[])
                setAllNews(processed as News[])
            }
        }

        if (isServerRendered && initialNews.length > 0) {
            processInitialNews()
            setLoading(false)
            return
        }

        const fetchNews = async () => {
            if (!categorySlug) return

            try {
                setLoading(true)
                setError(null)

                const dbCategory = categoryMapping[categorySlug]
                if (!dbCategory) {
                    setError("Categoría inválida")
                    setLoading(false)
                    return
                }

                const { getNewsByCategoryOptimized } = await import("@/lib/firebase-optimized")
                const result = await getNewsByCategoryOptimized(categorySlug, 50)
                const categoryNews = result.news

                const processed = categoryNews.map((item: any) => ({
                    ...item,
                    imageUrl: convertirURL(item.imageUrl || (Array.isArray(item.image) ? item.image[0] : (item.image as string)) || ""),
                }))

                setNews(processed as News[])
                setAllNews(processed as News[])
            } catch (err) {
                console.error("❌ Error fetching category news:", err)
                setError("Error al cargar las noticias de esta categoría")
            } finally {
                setLoading(false)
            }
        }

        if (!isServerRendered) {
            fetchNews()
        }
    }, [categorySlug, isServerRendered, initialNews])

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + 6)
    }

    const handleFilterChange = (filter: typeof activeFilter) => {
        setActiveFilter(filter)
        setVisibleCount(7) // Reset visible count when changing filter

        if (filter === "todo") {
            setNews(allNews)
            return
        }

        let filtered: News[] = []
        const now = new Date()
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

        switch (filter) {
            case "24h":
                filtered = allNews.filter(item => {
                    const itemDate = new Date(item.date)
                    return itemDate >= yesterday
                })
                break
            case "leidas":
                // Sort by views (most read first)
                filtered = [...allNews].sort((a, b) => (b.views || 0) - (a.views || 0))
                break
            case "eldorado":
                filtered = allNews.filter(item => {
                    const searchText = `${item.title} ${item.subtitle || ""} ${item.description || ""} ${(item.tags || []).join(" ")} ${item.location || ""}`.toLowerCase()
                    return searchText.includes("eldorado")
                })
                break
            case "provinciales":
                filtered = allNews.filter(item => {
                    const searchText = `${item.title} ${item.subtitle || ""} ${item.description || ""} ${(item.tags || []).join(" ")} ${item.location || ""}`.toLowerCase()
                    return searchText.includes("provincial") || searchText.includes("misiones") || searchText.includes("provincia")
                })
                break
        }

        setNews(filtered)
    }

    if (loading && !isServerRendered) {
        return (
            <div className="w-full h-[100vh] bg-slate-50 dark:bg-slate-900 flex justify-center items-center">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <img
                        alt="logoloader"
                        className="h-12 w-auto opacity-20"
                        src="https://res.cloudinary.com/deemssikv/image/upload/v1738581472/logo_rojo_azul_1_ethdja.svg"
                    />
                    <div className="h-1 w-24 bg-primary/20 rounded-full overflow-hidden">
                        <div className="h-full bg-primary animate-[loading_1.5s_infinite]"></div>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#fdfdfd] dark:bg-slate-950 flex items-center justify-center p-6">
                <div className="text-center max-w-md mx-auto">
                    <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Filter className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Error de carga</h1>
                    <p className="text-slate-500 mb-8">{error}</p>
                    <Button onClick={() => window.location.reload()} className="bg-primary hover:bg-red-700 text-white rounded-full px-8 py-6 h-auto font-bold uppercase tracking-widest text-xs">
                        Reintentar
                    </Button>
                </div>
            </div>
        )
    }

    const featuredNews = news[0]
    const otherNews = news.slice(1, visibleCount)
    const trendingNews = news.slice(0, 3) // Usamos las primeras 3 para el sidebar

    return (
        <div className="min-h-screen bg-[#fdfdfd] dark:bg-slate-950 transition-colors duration-300">
            <WebSiteJsonLd />

            <main className="px-4 md:px-12 lg:px-20 py-12">
                {/* Category Header */}
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 flex items-center gap-4 text-slate-900 dark:text-white">
                        {categoryName}
                        <span className="h-2 w-16 md:w-24 bg-primary rounded-full"></span>
                    </h1>
                    <div className="flex flex-wrap items-center gap-6 border-b border-slate-100 dark:border-slate-800 pb-4 overflow-x-auto no-scrollbar">
                        <button
                            onClick={() => handleFilterChange("todo")}
                            className={`text-xs font-bold uppercase tracking-widest pb-4 -mb-4.5 whitespace-nowrap transition-colors ${activeFilter === "todo"
                                ? "text-primary border-b-2 border-primary"
                                : "text-slate-500 hover:text-primary"
                                }`}
                        >
                            Todo
                        </button>
                        <button
                            onClick={() => handleFilterChange("24h")}
                            className={`text-xs font-bold uppercase tracking-widest pb-4 -mb-4.5 whitespace-nowrap transition-colors ${activeFilter === "24h"
                                ? "text-primary border-b-2 border-primary"
                                : "text-slate-500 hover:text-primary"
                                }`}
                        >
                            Últimas 24 horas
                        </button>
                        <button
                            onClick={() => handleFilterChange("leidas")}
                            className={`text-xs font-bold uppercase tracking-widest pb-4 -mb-4.5 whitespace-nowrap transition-colors ${activeFilter === "leidas"
                                ? "text-primary border-b-2 border-primary"
                                : "text-slate-500 hover:text-primary"
                                }`}
                        >
                            Más Leídas
                        </button>
                        <button
                            onClick={() => handleFilterChange("eldorado")}
                            className={`text-xs font-bold uppercase tracking-widest pb-4 -mb-4.5 whitespace-nowrap transition-colors ${activeFilter === "eldorado"
                                ? "text-primary border-b-2 border-primary"
                                : "text-slate-500 hover:text-primary"
                                }`}
                        >
                            Eldorado
                        </button>
                        <button
                            onClick={() => handleFilterChange("provinciales")}
                            className={`text-xs font-bold uppercase tracking-widest pb-4 -mb-4.5 whitespace-nowrap transition-colors ${activeFilter === "provinciales"
                                ? "text-primary border-b-2 border-primary"
                                : "text-slate-500 hover:text-primary"
                                }`}
                        >
                            Provinciales
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-16">
                    {/* Main Content Column */}
                    <div className="lg:col-span-8 space-y-12">
                        {news.length > 0 ? (
                            <>
                                {/* Large Hero Article */}
                                {featuredNews && (
                                    <Link href={`/news/${featuredNews.id}`} className="block relative group overflow-hidden rounded-3xl bg-slate-900 aspect-[16/9] shadow-2xl">
                                        <img
                                            alt={featuredNews.title}
                                            className="absolute inset-0 w-full h-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105"
                                            src={featuredNews.imageUrl || undefined}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                                        <div className="absolute bottom-0 p-6 md:p-10 max-w-3xl">
                                            <span className="inline-block px-3 py-1 bg-primary text-white text-[10px] font-bold uppercase tracking-widest rounded-sm mb-4">Destacado</span>
                                            <h2 className="text-2xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6">
                                                {featuredNews.title}
                                            </h2>
                                            <div className="flex items-center gap-4 text-xs text-slate-300">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {mounted && featuredNews.date ? format(new Date(featuredNews.date), "d 'de' MMM", { locale: es }) : ""}
                                                </span>
                                                <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
                                                <span className="font-bold text-white">{featuredNews.author || "Redacción"}</span>
                                            </div>
                                        </div>
                                    </Link>
                                )}

                                {/* Article Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    {otherNews.map((item) => (
                                        <Link key={item.id} href={`/news/${item.id}`} className="group cursor-pointer block">
                                            <div className="aspect-video overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800 mb-6 relative">
                                                <img
                                                    alt={item.title}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    src={item.imageUrl || undefined}
                                                />
                                            </div>
                                            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-primary mb-3">
                                                <span>{item.tags?.[0] || categoryName}</span>
                                                <span className="text-slate-300">•</span>
                                                <span className="text-slate-500 font-medium">
                                                    {mounted && item.date ? format(new Date(item.date), "d 'de' MMM", { locale: es }) : ""}
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-bold mb-3 leading-snug text-slate-900 dark:text-white line-clamp-2">
                                                {item.title}
                                            </h3>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-3 leading-relaxed">
                                                {item.subtitle || item.description?.substring(0, 150)}
                                            </p>
                                        </Link>
                                    ))}
                                </div>

                                {/* Load More Button */}
                                {news.length > visibleCount && (
                                    <div className="mt-16 flex justify-center pb-12">
                                        <button
                                            onClick={handleLoadMore}
                                            className="group px-10 py-4 bg-primary hover:bg-red-700 text-white rounded-full font-bold text-sm tracking-widest uppercase transition-all shadow-lg hover:shadow-primary/30 flex items-center gap-3"
                                        >
                                            Ver más noticias {categoryName.toLowerCase()}
                                            <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
                                <Filter className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-6" />
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                    {activeFilter === "todo"
                                        ? "No hay noticias"
                                        : activeFilter === "24h"
                                            ? "Sin noticias recientes"
                                            : activeFilter === "leidas"
                                                ? "Sin datos de lectura"
                                                : `Sin resultados para "${activeFilter === "eldorado" ? "Eldorado" : "Provinciales"}"`
                                    }
                                </h2>
                                <p className="text-slate-500 mb-8">
                                    {activeFilter === "todo"
                                        ? "No se encontraron noticias en esta categoría."
                                        : activeFilter === "24h"
                                            ? "No hay noticias publicadas en las últimas 24 horas."
                                            : activeFilter === "leidas"
                                                ? "Las estadísticas de lectura aún no están disponibles."
                                                : `No hay noticias relacionadas con ${activeFilter === "eldorado" ? "Eldorado" : "la provincia de Misiones"}.`
                                    }
                                </p>
                                {activeFilter !== "todo" ? (
                                    <button
                                        onClick={() => handleFilterChange("todo")}
                                        className="inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all"
                                    >
                                        <ArrowLeft className="w-4 h-4" /> Ver todas las noticias
                                    </button>
                                ) : (
                                    <Link href="/" className="inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
                                        <ArrowLeft className="w-4 h-4" /> Volver al inicio
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sidebar Column */}
                    <aside className="lg:col-span-4 space-y-12 h-fit lg:sticky lg:top-28">
                        {/* Trending Section */}
                        <div className="bg-white dark:bg-[#111827] p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
                            <h3 className="text-lg font-extrabold mb-8 flex items-center justify-between text-slate-900 dark:text-white">
                                Más leídas de hoy
                                <TrendingUp className="text-primary w-5 h-5" />
                            </h3>
                            <div className="space-y-8">
                                {trendingNews.map((item, index) => (
                                    <Link key={item.id} href={`/news/${item.id}`} className="flex gap-4 group cursor-pointer">
                                        <span className="text-3xl font-black text-slate-200 dark:text-slate-800">
                                            0{index + 1}
                                        </span>
                                        <div>
                                            <h4 className="text-sm font-bold leading-tight line-clamp-2 text-slate-900 dark:text-slate-100 mb-1">
                                                {item.title}
                                            </h4>
                                            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                                                {item.tags?.[0] || categoryName}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Weather Widget */}
                        <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-8 rounded-2xl text-white shadow-xl">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <p className="text-sm font-bold opacity-80">Eldorado, MN</p>
                                    <h3 className="text-4xl font-black">28°C</h3>
                                </div>
                                <Sun className="w-12 h-12" />
                            </div>
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                                <span>Humedad: 82%</span>
                                <span>Viento: 12 km/h</span>
                            </div>
                        </div>

                        {/* Newsletter Signup */}
                        <div className="p-8 bg-slate-900 dark:bg-slate-950 rounded-2xl text-white border border-slate-800">
                            <h3 className="text-xl font-bold mb-4">Newsletter {categoryName}</h3>
                            <p className="text-slate-400 text-xs leading-relaxed mb-6">Recibe las alertas más importantes y el resumen del día en {categoryName.toLowerCase()}.</p>
                            <div className="space-y-3">
                                <input
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none text-white transition-all"
                                    placeholder="Tu correo electrónico"
                                    type="email"
                                />
                                <button className="w-full bg-primary py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors">
                                    Suscribirme
                                </button>
                            </div>
                        </div>

                        {/* Other Sections */}
                        <div>
                            <h3 className="text-lg font-extrabold mb-6 text-slate-900 dark:text-white">Otras Secciones</h3>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(categoryDisplayNames)
                                    .filter(([slug]) => slug !== categorySlug)
                                    .map(([slug, name]) => (
                                        <Link
                                            key={slug}
                                            href={`/category/${slug}`}
                                            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white transition-all rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300"
                                        >
                                            {name}
                                        </Link>
                                    ))}
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    )
}
