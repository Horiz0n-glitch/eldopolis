import Image from "next/image"
import Link from "next/link"
import type { News } from "@/types/news"
import { Calendar, User } from "lucide-react"

interface NewsCardCoverProps {
  news: News
}

export default function NewsCardCover({ news }: NewsCardCoverProps) {
  const imageUrl = Array.isArray(news.image) ? news.image[0] : news.image

  return (
    <Link href={`/news/${news.id}`} className="block group">
      <article className="relative h-96 md:h-[500px] overflow-hidden rounded-lg">
        <Image
          src={imageUrl || "/placeholder.svg?height=500&width=800"}
          alt={news.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="mb-2">
            <span className="inline-block px-3 py-1 bg-red-600 text-xs font-semibold rounded-full">
              {news.mainCategory}
            </span>
          </div>
          <h1 className="text-2xl md:text-4xl font-bold mb-2 line-clamp-3">{news.title}</h1>
          <p className="text-gray-200 mb-4 line-clamp-2">{news.subtitle}</p>
          <div className="flex items-center gap-4 text-sm text-gray-300">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{news.author}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(news.date).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}
