import type { MetadataRoute } from "next"
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore"
import { db } from "@/lib/firebaseConfig"
import type { News } from "@/types/news"

const baseUrl = (() => {
  const url = process.env.NEXT_PUBLIC_BASE_URL || "https://eldopolis.com"
  return url.startsWith("http") ? url : `https://${url}`
})()

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "hourly" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/category`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tag`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.7,
    },
  ]

  // Category pages
  const categories = ["mundo", "deporte", "politica", "policiales", "sociedad", "columna", "espectaculos", "economia"]
  const categoryPages = categories.map((category) => ({
    url: `${baseUrl}/category/${category}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }))

  // News pages
  let newsPages: MetadataRoute.Sitemap = []
  try {
    const newsQuery = query(
      collection(db, "news"),
      orderBy("timestamp", "desc"),
      limit(1000), // Limit to prevent too large sitemap
    )

    const newsSnapshot = await getDocs(newsQuery)
    newsPages = newsSnapshot.docs.map((doc) => {
      const news = doc.data() as News
      return {
        url: `${baseUrl}/news/${doc.id}`,
        lastModified: new Date(news.timestamp || news.date),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }
    })
  } catch (error) {
    console.error("Error generating sitemap for news:", error)
  }

  // Get unique tags for tag pages
  let tagPages: MetadataRoute.Sitemap = []
  try {
    const newsSnapshot = await getDocs(collection(db, "news"))
    const allTags = new Set<string>()

    newsSnapshot.docs.forEach((doc) => {
      const news = doc.data() as News
      if (news.tags && Array.isArray(news.tags)) {
        news.tags.forEach((tag) => allTags.add(tag))
      }
    })

    tagPages = Array.from(allTags)
      .slice(0, 100)
      .map((tag) => ({
        url: `${baseUrl}/tag/${encodeURIComponent(tag)}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.5,
      }))
  } catch (error) {
    console.error("Error generating sitemap for tags:", error)
  }

  return [...staticPages, ...categoryPages, ...newsPages, ...tagPages]
}
