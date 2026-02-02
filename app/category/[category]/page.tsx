import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { generateCategoryMetadata } from "@/lib/seo-utils"
import { getNewsByCategoryOptimized } from "@/lib/firebase-optimized"
import CategoryClientPage from "./CategoryClientPage"

const categoryMapping: Record<string, string> = {
  mundo: "Mundo",
  deporte: "Deporte", // plural as stored in database
  politica: "Política", // CON tilde, como está en Firestore
  policiales: "Policiales",
  sociedad: "Sociedad",
  columna: "Columna",
  espectaculos: "Espectaculos", // no accent as stored in database
  economia: "Economia", // no accent as stored in database
}

const categoryDisplayNames: Record<string, string> = {
  mundo: "Mundo",
  deporte: "Deporte",
  politica: "Política",
  policiales: "Policiales",
  sociedad: "Sociedad",
  columna: "Columna",
  espectaculos: "Espectáculos",
  economia: "Economía",
}

interface CategoryPageProps {
  params: Promise<{ category: string }>
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params
  const categoryName = categoryDisplayNames[category] || category

  if (!categoryMapping[category]) {
    return {
      title: "Categoría no encontrada",
      description: "La categoría que buscas no existe.",
    }
  }

  const seoData = generateCategoryMetadata(categoryName)
  return {
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.keywords.join(", "),
    openGraph: seoData.openGraph,
    twitter: seoData.twitter,
    alternates: { canonical: seoData.canonical },
    robots: { index: true, follow: true },
  }
}

async function getCategoryData(categorySlug: string) {
  try {
    const dbCategory = categoryMapping[categorySlug]
    if (!dbCategory) {
      console.error(`❌ Invalid category slug: ${categorySlug}`)
      return null
    }

    console.log(`📦 Consultando Firestore por categoría (SSR): ${categorySlug} -> ${dbCategory}`)
    const result = await getNewsByCategoryOptimized(categorySlug, 50)
    console.log(`📦 SSR result: ${result.news.length} news items found`)
    return result.news
  } catch (error) {
    console.error("❌ Error fetching category data:", error)
    return null
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params

  if (!categoryMapping[category]) {
    console.error(`❌ Category not found: ${category}`)
    notFound()
  }

  try {
    const initialNews = await getCategoryData(category)
    return (
      <CategoryClientPage
        initialNews={(initialNews || []) as any}
        categorySlug={category}
        isServerRendered={true}
      />
    )
  } catch (error) {
    console.error("❌ Error loading category page:", error)
    notFound()
  }
}
