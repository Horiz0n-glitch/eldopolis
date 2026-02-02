import Image from "next/image"
import Link from "next/link"
import type { News } from "@/types/news"
import { Calendar, User } from "lucide-react"

interface NewsCardFeaturedProps {
  news: News
  variant?: "featured1" | "featured2" | "featured3"
}

export default function NewsCardFeatured({ news, variant = "featured1" }: NewsCardFeaturedProps) {
  const imageUrl = Array.isArray(news.image) ? news.image[0] : news.image

  const variants = {
    featured1: "md:flex-row h-48 md:h-32",
    featured2: "flex-col h-64",
    featured3: "flex-col h-48",
  }

  const imageVariants = {
    featured1: "md:w-48 h-full",
    featured2: "w-full h-32",
    featured3: "w-full h-24",
  }

  return (
    <Link href={`/news/${news.id}`} className="block group">
      <article
        className={`flex ${variants[variant]} bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300`}
      >
        <div className={`relative ${imageVariants[variant]} flex-shrink-0`}>
          <Image
            src={imageUrl || "/placeholder.svg?height=200&width=300"}
            alt={news.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <div className="mb-2">
              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                {news.mainCategory}
              </span>
            </div>
            <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
              {news.title}
            </h3>
            {variant === "featured1" && <p className="text-gray-600 text-sm line-clamp-2 mb-2">{news.subtitle}</p>}
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{news.author}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{new Date(news.date).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}
