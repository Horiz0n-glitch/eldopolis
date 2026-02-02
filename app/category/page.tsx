"use client"

import Link from "next/link"
import CategoryNavigation from "@/components/category-navigation"
import { ArrowRight, TrendingUp } from "lucide-react"

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Explora todas las categorías</h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Encuentra las noticias que más te interesan organizadas por categorías. Mantente informado sobre los temas
              que realmente importan.
            </p>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-12">
        <div className="space-y-12">
          {/* Categories Grid */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <TrendingUp className="w-6 h-6 text-red-600" />
              <h2 className="text-2xl font-bold text-gray-900">Categorías principales</h2>
            </div>

            <CategoryNavigation variant="grid" showIcons={true} className="mb-8" />
          </section>

          {/* Quick Access */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Acceso rápido</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link
                href="/category/politica"
                className="group flex items-center justify-between p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
              >
                <div>
                  <h3 className="font-semibold text-red-900 group-hover:text-red-700">Política Nacional</h3>
                  <p className="text-sm text-red-700">Las últimas noticias del gobierno y la política</p>
                </div>
                <ArrowRight className="w-5 h-5 text-red-600 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/category/deporte"
                className="group flex items-center justify-between p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
              >
                <div>
                  <h3 className="font-semibold text-orange-900 group-hover:text-orange-700">Deportes</h3>
                  <p className="text-sm text-orange-700">Resultados, fichajes y análisis deportivo</p>
                </div>
                <ArrowRight className="w-5 h-5 text-orange-600 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/category/mundo"
                className="group flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <div>
                  <h3 className="font-semibold text-blue-900 group-hover:text-blue-700">Noticias del Mundo</h3>
                  <p className="text-sm text-blue-700">Actualidad internacional y eventos globales</p>
                </div>
                <ArrowRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/category/economia"
                className="group flex items-center justify-between p-4 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
              >
                <div>
                  <h3 className="font-semibold text-emerald-900 group-hover:text-emerald-700">Economía</h3>
                  <p className="text-sm text-emerald-700">Mercados, finanzas y análisis económico</p>
                </div>
                <ArrowRight className="w-5 h-5 text-emerald-600 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
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
