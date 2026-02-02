"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import type { News } from "@/lib/validations"
import { format } from "date-fns"
import { es } from "date-fns/locale"

import { convertirURL } from "@/lib/image-utils"

interface MediumNewsCardProps {
  news: News
}

export function MediumNewsCard({ news }: MediumNewsCardProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const displayImage = news.imageUrl || (Array.isArray(news.image) ? news.image[0] : news.image)

  return (
    <Link href={`/news/${news.id}`} className="flex flex-col md:flex-row gap-8 group cursor-pointer">
      <div className="md:w-1/3 aspect-[4/3] overflow-hidden rounded-lg bg-slate-100 shrink-0">
        <img
          alt={news.title}
          src={convertirURL(displayImage || "")}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <div className="flex flex-col justify-center py-1 flex-1">
        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3">
          <span className="lowercase">
            {mounted ? format(new Date(news.date), "d 'de' MMMM", { locale: es }) : ""}
          </span>
        </div>
        <h3 className="text-xl md:text-2xl font-bold mb-3 leading-snug transition-colors">
          {news.title}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 leading-relaxed mb-4">
          {news.subtitle || news.description?.substring(0, 160)}
        </p>
        <div className="flex items-center gap-2 mt-auto">
          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
            <span className="material-symbols-outlined text-sm text-slate-400">person</span>
          </div>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {news.author || "Redacción"}
          </span>
        </div>
      </div>
    </Link>
  )
}
