"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const tags = [
  "Últimas Noticias",
  "Tendencias",
  "Análisis",
  "Opinión",
  "Investigación",
  "Entrevistas",
  "Reportajes",
  "Breaking News",
  "Actualidad",
  "Exclusivas",
]

// Función para normalizar texto para URLs
function normalizeForUrl(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remover acentos
    .replace(/\s+/g, "-") // Reemplazar espacios con guiones
    .trim()
}

export default function TagNavigation() {
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: "smooth" })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: "smooth" })
    }
  }

  useEffect(() => {
    checkScrollButtons()
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener("scroll", checkScrollButtons)
      return () => container.removeEventListener("scroll", checkScrollButtons)
    }
  }, [])

  return (
    <div className="relative bg-gray-50 border-t">
      <div className="flex items-center">
        {canScrollLeft && (
          <Button variant="ghost" size="icon" className="absolute left-0 z-10 bg-white shadow-md" onClick={scrollLeft}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}

        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto scrollbar-hide py-3 px-4 space-x-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {tags.map((tag, index) => (
            <Link
              key={index}
              href={`/tag/${normalizeForUrl(tag)}`}
              className="flex-shrink-0 px-3 py-1 bg-white border rounded-full text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors whitespace-nowrap"
            >
              {tag}
            </Link>
          ))}
        </div>

        {canScrollRight && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 z-10 bg-white shadow-md"
            onClick={scrollRight}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
