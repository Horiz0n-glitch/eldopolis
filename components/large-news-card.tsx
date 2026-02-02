"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import type { News } from "@/lib/validations"
import { format } from "date-fns"
import { es } from "date-fns/locale"

import { convertirURL } from "@/lib/image-utils"

interface LargeNewsCardProps {
  news: News
}

export function LargeNewsCard({ news }: LargeNewsCardProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const displayImage = news.imageUrl || (Array.isArray(news.image) ? news.image[0] : news.image)

  return (
    <Link
      href={`/news/${news.id}`}
      className="block group relative overflow-hidden rounded-lg bg-slate-900 h-[400px]"
    >
      <img
        alt={news.title}
        src={convertirURL(displayImage || "")}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-80"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
      <div className="absolute bottom-0 p-8 w-full">
        <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-tight mb-4 transition-colors">
          {news.title}
        </h2>
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">schedule</span>
            {mounted ? format(new Date(news.date), "PPP", { locale: es }) : ""}
          </span>
          <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
          <span className="font-bold text-white">{news.author || "Redacción"}</span>
        </div>
      </div>
    </Link>
  )
}
