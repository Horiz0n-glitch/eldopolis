import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getNewsById, getNewsByCategory } from "@/lib/firebase-optimized"
import { generateOptimizedNewsMetadata } from "@/lib/seo-server-utils"
import NewsDetailContent from "./NewsDetailContent"
import { Skeleton } from "@/components/ui/skeleton"
import type { News } from "@/types/news"

interface NewsPageProps {
  params: {
    id: string
  }
}

// Generar metadatos optimizados
export async function generateMetadata({ params }: NewsPageProps): Promise<Metadata> {
  try {
    const news = await getNewsById(params.id)

    if (!news) {
      return {
        title: "Noticia no encontrada",
        description: "La noticia que buscas no existe o ha sido eliminada.",
      }
    }

    const seoData = await generateOptimizedNewsMetadata(news)

    return {
      title: seoData.title,
      description: seoData.description,
      keywords: seoData.keywords,
      authors: news.author ? [{ name: news.author }] : undefined,
      creator: news.author,
      publisher: "Eldópolis",
      robots: seoData.robots,
      canonical: seoData.canonical,
      openGraph: {
        title: seoData.openGraph.title,
        description: seoData.openGraph.description,
        url: seoData.openGraph.url,
        siteName: seoData.openGraph.siteName,
        images: seoData.openGraph.images,
        locale: "es_AR",
        type: "article",
        publishedTime: news.date,
        modifiedTime: new Date(news.timestamp).toISOString(),
        section: news.mainCategory,
        authors: news.author ? [news.author] : undefined,
        tags: news.tags,
      },
      twitter: {
        card: seoData.twitter.card as "summary" | "summary_large_image",
        title: seoData.twitter.title,
        description: seoData.twitter.description,
        images: seoData.twitter.images,
        creator: seoData.twitter.creator,
        site: seoData.twitter.site,
      },
      other: {
        "article:published_time": news.date,
        "article:modified_time": new Date(news.timestamp).toISOString(),
        "article:section": news.mainCategory,
        "article:tag": news.tags.join(","),
      },
    }
  } catch (error) {
    console.error("Error generating metadata:", error)
    return {
      title: "Error al cargar la noticia",
      description: "Ocurrió un error al cargar la noticia.",
    }
  }
}

// Componente de loading
function NewsDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Breadcrumb skeleton */}
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-1" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-1" />
          <Skeleton className="h-4 w-32" />
        </div>

        {/* Header skeleton */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-16" />
          </div>
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-6 w-3/4" />
          <div className="flex gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        {/* Image skeleton */}
        <Skeleton className="aspect-video w-full rounded-lg" />

        {/* Content skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    </div>
  )
}

async function getNewsData(id: string) {
  try {
    const news = await getNewsById(id)
    if (!news) return null

    // Obtener noticias relacionadas en el servidor
    const relatedNews = await getNewsByCategory(news.mainCategory)
    const filteredRelatedNews = (relatedNews as News[]).filter((item) => item.id !== news.id).slice(0, 6)

    return {
      news,
      relatedNews: filteredRelatedNews,
    }
  } catch (error) {
    console.error("Error fetching news data:", error)
    return null
  }
}

export default async function NewsPage({ params }: NewsPageProps) {
  try {
    const newsData = await getNewsData(params.id)

    if (!newsData) {
      notFound()
    }

    const { news, relatedNews } = newsData

    return (
      <main className="min-h-screen bg-gray-50">
        <NewsDetailContent news={news} relatedNews={relatedNews} isServerRendered={true} />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "NewsArticle",
              headline: news.title,
              description: news.subtitle || "",
              image: news.imageUrl ? [news.imageUrl] : [],
              datePublished: news.date,
              dateModified: new Date(news.timestamp).toISOString(),
              author: {
                "@type": "Person",
                name: news.author || "Eldópolis",
              },
              publisher: {
                "@type": "Organization",
                name: "Eldópolis",
                logo: {
                  "@type": "ImageObject",
                  url: `${process.env.NEXT_PUBLIC_BASE_URL}/images/logo.png`,
                },
              },
              mainEntityOfPage: {
                "@type": "WebPage",
                "@id": `${process.env.NEXT_PUBLIC_BASE_URL}/news/${news.id}`,
              },
              articleSection: news.mainCategory,
              keywords: news.tags.join(", "),
            }),
          }}
        />
      </main>
    )
  } catch (error) {
    console.error("Error loading news page:", error)
    notFound()
  }
}
