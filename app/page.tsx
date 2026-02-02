import type { Metadata } from "next"
import { getNewsOptimized } from "@/lib/firebase-optimized"
import { LoadMoreNews } from "@/components/home/load-more-news"
import { sortNews } from "@/lib/news-utils"
import { convertirURL } from "@/lib/image-utils"
import { DEFAULT_SEO } from "@/lib/seo-utils"

export const dynamic = "force-dynamic"
export const revalidate = 60 // Revalidate every minute

export async function generateMetadata(): Promise<Metadata> {
  const { news } = await getNewsOptimized(15)
  const coverNews = news.find(n => n.featuredType === "cover") || news[0]

  if (!coverNews) return {}

  return {
    title: coverNews.title,
    description: coverNews.subtitle || coverNews.description?.substring(0, 160),
    openGraph: {
      title: coverNews.title,
      description: coverNews.subtitle || coverNews.description?.substring(0, 160),
      images: [
        {
          url: Array.isArray(coverNews.image) ? coverNews.image[0] : (coverNews.image as string) || DEFAULT_SEO.defaultImage,
          width: 1200,
          height: 630,
          alt: coverNews.title,
        },
      ],
    },
  }
}

export default async function Home() {
  const result = await getNewsOptimized(15)

  // Procesar URLs de imagen y ordenar noticias en el servidor
  const processedNews = result.news.map((item) => ({
    ...item,
    image: Array.isArray(item.image)
      ? item.image.map(img => convertirURL(img))
      : convertirURL(item.image as string),
    imageUrl: convertirURL(item.imageUrl || (Array.isArray(item.image) ? item.image[0] : (item.image as string))),
  })).sort(sortNews)

  return (
    <div className="py-8">
      <LoadMoreNews initialNews={processedNews} />
    </div>
  )
}
