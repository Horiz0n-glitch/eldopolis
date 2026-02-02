"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { collection, getDocs, query, limit } from "firebase/firestore"
import { db } from "@/lib/firebaseConfig"
import { Hash, TrendingUp, ArrowRight, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

// Función para normalizar texto (quitar acentos y convertir a minúsculas)
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remover acentos
    .trim()
}

interface TagCount {
  tag: string
  count: number
}

export default function TagIndexContent() {
  const [tags, setTags] = useState<TagCount[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoading(true)

        // Obtener una muestra de noticias para extraer tags
        const newsQuery = query(collection(db, "news"), limit(500))
        const querySnapshot = await getDocs(newsQuery)

        const tagCounts: Record<string, number> = {}

        querySnapshot.docs.forEach((doc) => {
          const data = doc.data()
          if (data.tags && Array.isArray(data.tags)) {
            data.tags.forEach((tag: string) => {
              tagCounts[tag] = (tagCounts[tag] || 0) + 1
            })
          }
        })

        // Convertir a array y ordenar por frecuencia
        const sortedTags = Object.entries(tagCounts)
          .map(([tag, count]) => ({ tag, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 50) // Mostrar solo los 50 tags más populares

        setTags(sortedTags)
      } catch (error) {
        console.error("Error fetching tags:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTags()
  }, [])

  const filteredTags = tags.filter(({ tag }) => normalizeText(tag).includes(normalizeText(searchTerm)))

  const popularTags = filteredTags.slice(0, 12)
  const allTags = filteredTags

  if (loading) {
    return (
      <div className="w-full h-[100vh] bg-[#182538] flex justify-center items-center">
        <img
          alt="logoloader"
          className="h-20 w-auto"
          src="https://res.cloudinary.com/deemssikv/image/upload/v1738581472/logo_rojo_azul_1_ethdja.svg"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Hash className="w-6 h-6 text-red-600" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Explorar Tags</h1>
            </div>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              Descubre noticias por temas específicos. Explora los tags más populares o busca un tema en particular.
            </p>

            {/* Search */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Buscar tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 w-full border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-12">
        <div className="space-y-12">
          {/* Popular Tags */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <TrendingUp className="w-6 h-6 text-red-600" />
              <h2 className="text-2xl font-bold text-gray-900">Tags más populares</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {popularTags.map(({ tag, count }) => (
                <Link
                  key={tag}
                  href={`/tag/${tag.toLowerCase().replace(/\s+/g, "-")}`}
                  className="group bg-white rounded-xl p-6 border border-gray-200 hover:border-red-200 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center group-hover:bg-red-200 transition-colors">
                      <Hash className="w-5 h-5 text-red-600" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-red-700 transition-colors mb-2 capitalize">
                    {tag}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {count} {count === 1 ? "noticia" : "noticias"}
                  </p>
                </Link>
              ))}
            </div>
          </section>

          {/* All Tags */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Todos los tags {searchTerm && `(${filteredTags.length} resultados)`}
            </h2>

            {filteredTags.length > 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-wrap gap-3">
                  {allTags.map(({ tag, count }) => (
                    <Link
                      key={tag}
                      href={`/tag/${tag.toLowerCase().replace(/\s+/g, "-")}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-red-100 text-gray-700 hover:text-red-700 rounded-full transition-colors font-medium text-sm"
                    >
                      <Hash className="w-3 h-3" />
                      <span className="capitalize">{tag}</span>
                      <span className="text-xs bg-gray-200 hover:bg-red-200 px-2 py-0.5 rounded-full transition-colors">
                        {count}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Hash className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron tags</h3>
                <p className="text-gray-600">No hay tags que coincidan con tu búsqueda "{searchTerm}".</p>
              </div>
            )}
          </section>

          {/* Back to Home */}
          <div className="text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Volver al inicio
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
