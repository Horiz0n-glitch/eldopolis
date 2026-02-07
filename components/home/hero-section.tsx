"use client"

import Link from "next/link"
import type { News } from "@/lib/validations"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface HeroSectionProps {
    news: News[]
}

export function HeroSection({ news }: HeroSectionProps) {
    if (!news || news.length === 0) return null

    const mainNews = news[0]
    const sideNews = news.slice(1, 3)

    return (
        <section className="mb-16 px-4 md:px-12 lg:px-20">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[600px]">
                {/* Main Hero Card */}
                <Link
                    href={`/news/${mainNews.id}`}
                    className="lg:col-span-2 relative group overflow-hidden rounded-lg bg-slate-900 h-[400px] lg:h-full"
                >
                    <img
                        alt={mainNews.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-80"
                        src={mainNews.imageUrl || "/placeholder.svg"}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    <div className="absolute bottom-0 p-8 md:p-12 w-full">
                        <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-4 transition-colors">
                            {mainNews.title}
                        </h1>
                        <p className="text-slate-200 text-sm md:text-base line-clamp-2 mb-6 max-w-2xl opacity-90">
                            {mainNews.subtitle || mainNews.description?.substring(0, 150)}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">schedule</span>
                                {format(new Date(mainNews.date), "PPP", { locale: es })}
                            </span>
                            <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                            <span className="font-bold text-white">{mainNews.author || "Redacción Eldópolis"}</span>
                        </div>
                    </div>
                </Link>

                {/* Side Cards Column */}
                <div className="flex flex-col gap-6 h-full">
                    {/* First side news card */}
                    {sideNews[0] && (
                        <Link
                            href={`/news/${sideNews[0].id}`}
                            className="flex-1 relative group overflow-hidden rounded-lg bg-slate-900 h-[250px] lg:h-auto"
                        >
                            <img
                                alt={sideNews[0].title}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-70"
                                src={sideNews[0].imageUrl || "/placeholder.svg"}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                            <div className="absolute bottom-0 p-6 w-full">
                                <h3 className="text-xl font-bold text-white leading-tight transition-colors">
                                    {sideNews[0].title}
                                </h3>
                            </div>
                        </Link>
                    )}

                    {/* Radio Banner */}
                    <a
                        href="https://streaminglocucionar.com/portal/?p=16127"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 relative group overflow-hidden rounded-lg bg-slate-900 h-[250px] lg:h-auto"
                    >
                        <img
                            alt="Escuchá Radio Eldópolis en vivo"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                            src="/banner-radio.gif.gif"
                        />
                    </a>
                </div>
            </div>
        </section>
    )
}
