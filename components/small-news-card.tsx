"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import type { News } from "@/lib/validations"
import { format } from "date-fns"
import { es } from "date-fns/locale"

import { convertirURL } from "@/lib/image-utils"

interface SmallNewsCardProps {
  news: News
}

export function SmallNewsCard({ news }: SmallNewsCardProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const displayImage = news.imageUrl || (Array.isArray(news.image) ? news.image[0] : news.image)

  return (
    <Link href={`/news/${news.id}`} className="group block">
      <article className="space-y-4">
        <div className="aspect-[4/5] overflow-hidden rounded-lg bg-slate-100 relative">
          <img
            alt={news.title}
            src={convertirURL(displayImage || "")}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        <div>
          <h4 className="text-sm font-bold leading-snug transition-colors line-clamp-2">
            {news.title}
          </h4>
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-2 block">
            {mounted ? format(new Date(news.date), "d 'de' MMM", { locale: es }) : ""}
          </span>
        </div>
      </article>
    </Link>
  )
}
