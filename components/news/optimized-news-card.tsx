import Link from "next/link"
import type { News } from "@/types/news"
import { Calendar, User, Play } from "lucide-react"
import OptimizedImage from "@/components/optimized-image"

interface OptimizedNewsCardProps {
  news: News
  variant?: "small" | "medium" | "large"
  priority?: boolean
}

export default function OptimizedNewsCard({ news, variant = "medium", priority = false }: OptimizedNewsCardProps) {
  const imageUrl = Array.isArray(news.image) ? news.image[0] : news.image

  const dimensions = {
    small: { width: 300, height: 200 },
    medium: { width: 400, height: 250 },
    large: { width: 800, height: 400 },
  }

  const { width, height } = dimensions[variant]

  return (
    <Link href={`/news/${news.id}`} className="block group">
      <article
        className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 ${variant === "large" ? "h-96 md:h-[500px]" : variant === "medium" ? "h-80" : "h-64"
          }`}
      >
        <div className={`relative ${variant === "large" ? "h-64 md:h-80" : variant === "medium" ? "h-48" : "h-32"}`}>
          <OptimizedImage
            src={imageUrl || "/placeholder.svg"}
            alt={news.title}
            width={width}
            height={height}
            priority={priority}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            sizes={`(max-width: 768px) 100vw, (max-width: 1200px) 50vw, ${width}px`}
          />

          {news.video && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/50 rounded-full p-3">
                <Play className="w-6 h-6 text-white fill-white" />
              </div>
            </div>
          )}

          <div className="absolute top-3 left-3">
            <span className="inline-block px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded">
              {news.mainCategory}
            </span>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
            {news.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-3 mb-3">{news.subtitle}</p>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{news.author}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{new Date(news.date).toLocaleDateString()}</span>
            </div>
          </div>

          {news.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {news.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    </Link>
  )
}
