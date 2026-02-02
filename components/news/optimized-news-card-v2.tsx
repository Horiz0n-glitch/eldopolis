import Link from "next/link"
import type { News } from "@/types/news"
import { Calendar, User, Play, Volume2 } from "lucide-react"
import OptimizedImageV2 from "@/components/optimized-image-v2"

interface OptimizedNewsCardV2Props {
  news: News
  variant?: "small" | "medium" | "large" | "hero"
  priority?: boolean
  showMedia?: boolean
  className?: string
}

export default function OptimizedNewsCardV2({
  news,
  variant = "medium",
  priority = false,
  showMedia = true,
  className = "",
}: OptimizedNewsCardV2Props) {
  const imageUrl = Array.isArray(news.image) ? news.image[0] : news.image

  const variantConfig = {
    small: {
      width: 320,
      height: 200,
      quality: 70,
      containerClass: "h-64",
      imageClass: "h-32",
      titleClass: "text-sm font-medium",
      breakpoints: [320, 480, 640],
      responsiveSizes: [
        { breakpoint: "(max-width: 480px)", size: "280px" },
        { breakpoint: "(max-width: 640px)", size: "300px" },
        { breakpoint: "", size: "320px" },
      ],
    },
    medium: {
      width: 400,
      height: 250,
      quality: 75,
      containerClass: "h-80",
      imageClass: "h-48",
      titleClass: "text-base font-semibold",
      breakpoints: [400, 600, 800],
      responsiveSizes: [
        { breakpoint: "(max-width: 640px)", size: "100vw" },
        { breakpoint: "(max-width: 1024px)", size: "50vw" },
        { breakpoint: "", size: "400px" },
      ],
    },
    large: {
      width: 600,
      height: 400,
      quality: 80,
      containerClass: "h-96",
      imageClass: "h-64",
      titleClass: "text-lg font-bold",
      breakpoints: [600, 800, 1200],
      responsiveSizes: [
        { breakpoint: "(max-width: 768px)", size: "100vw" },
        { breakpoint: "(max-width: 1200px)", size: "75vw" },
        { breakpoint: "", size: "600px" },
      ],
    },
    hero: {
      width: 1200,
      height: 600,
      quality: 85,
      containerClass: "h-[500px]",
      imageClass: "h-80",
      titleClass: "text-2xl md:text-4xl font-bold",
      breakpoints: [800, 1200, 1600, 1920],
      responsiveSizes: [
        { breakpoint: "(max-width: 768px)", size: "100vw" },
        { breakpoint: "(max-width: 1200px)", size: "100vw" },
        { breakpoint: "", size: "1200px" },
      ],
    },
  }

  const config = variantConfig[variant]

  return (
    <Link href={`/news/${news.id}`} className={`block group ${className}`}>
      <article
        className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 ${config.containerClass}`}
      >
        <div className={`relative ${config.imageClass}`}>
          <OptimizedImageV2
            src={imageUrl || "/placeholder.svg"}
            alt={news.title}
            width={config.width}
            height={config.height}
            priority={priority}
            quality={config.quality}
            format="auto"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            breakpoints={config.breakpoints}
            responsiveSizes={config.responsiveSizes}
            sharpen={variant === "hero"}
          />

          {/* Media indicators */}
          {showMedia && (
            <div className="absolute top-3 left-3 flex gap-2">
              <span className="inline-block px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded">
                {news.mainCategory}
              </span>

              {news.video && (
                <div className="bg-black/70 rounded-full p-1">
                  <Play className="w-3 h-3 text-white fill-white" />
                </div>
              )}

              {news.audio && (
                <div className="bg-black/70 rounded-full p-1">
                  <Volume2 className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
          )}

          {/* Gradient overlay for hero variant */}
          {variant === "hero" && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          )}
        </div>

        <div className={`p-4 ${variant === "hero" ? "absolute bottom-0 left-0 right-0 text-white" : ""}`}>
          <h3
            className={`${config.titleClass} mb-2 line-clamp-2 ${variant === "hero" ? "text-white" : "text-gray-900"
              }`}
          >
            {news.title}
          </h3>

          {variant !== "small" && (
            <p className={`text-sm line-clamp-3 mb-3 ${variant === "hero" ? "text-gray-200" : "text-gray-600"}`}>
              {news.subtitle}
            </p>
          )}

          <div
            className={`flex items-center justify-between text-xs ${variant === "hero" ? "text-gray-300" : "text-gray-500"
              }`}
          >
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{news.author}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{new Date(news.date).toLocaleDateString()}</span>
            </div>
          </div>

          {news.tags.length > 0 && variant !== "small" && variant !== "hero" && (
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
