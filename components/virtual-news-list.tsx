"use client"

import type React from "react"

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import type { News } from "@/types/news"
import OptimizedNewsCard from "@/components/news/optimized-news-card"

interface VirtualNewsListProps {
  news: News[]
  itemHeight?: number
  containerHeight?: number
  overscan?: number
  onLoadMore?: () => void
  hasMore?: boolean
  loading?: boolean
}

export default function VirtualNewsList({
  news,
  itemHeight = 320,
  containerHeight = 600,
  overscan = 5,
  onLoadMore,
  hasMore = false,
  loading = false,
}: VirtualNewsListProps) {
  const [scrollTop, setScrollTop] = useState(0)
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null)
  const scrollElementRef = useRef<HTMLDivElement>(null)

  // Calcular elementos visibles
  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight)
    const endIndex = Math.min(startIndex + Math.ceil(containerHeight / itemHeight), news.length - 1)

    return {
      start: Math.max(0, startIndex - overscan),
      end: Math.min(news.length - 1, endIndex + overscan),
    }
  }, [scrollTop, itemHeight, containerHeight, overscan, news.length])

  // Elementos a renderizar
  const visibleItems = useMemo(() => {
    const items = []
    for (let i = visibleRange.start; i <= visibleRange.end; i++) {
      if (news[i]) {
        items.push({
          index: i,
          news: news[i],
          style: {
            position: "absolute" as const,
            top: i * itemHeight,
            left: 0,
            right: 0,
            height: itemHeight,
          },
        })
      }
    }
    return items
  }, [visibleRange, news, itemHeight])

  // Manejar scroll
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const scrollTop = e.currentTarget.scrollTop
      setScrollTop(scrollTop)

      // Trigger load more cuando esté cerca del final
      if (hasMore && !loading && onLoadMore) {
        const scrollHeight = e.currentTarget.scrollHeight
        const clientHeight = e.currentTarget.clientHeight
        const scrollPosition = scrollTop + clientHeight

        if (scrollPosition >= scrollHeight - 200) {
          // 200px antes del final
          onLoadMore()
        }
      }
    },
    [hasMore, loading, onLoadMore],
  )

  // Intersection Observer para detectar cuando cargar más
  useEffect(() => {
    if (!containerRef || !hasMore || loading) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && onLoadMore) {
            onLoadMore()
          }
        })
      },
      { rootMargin: "100px" },
    )

    const sentinel = containerRef.querySelector("[data-sentinel]")
    if (sentinel) {
      observer.observe(sentinel)
    }

    return () => observer.disconnect()
  }, [containerRef, hasMore, loading, onLoadMore])

  const totalHeight = news.length * itemHeight

  return (
    <div className="relative">
      <div
        ref={(el) => {
          scrollElementRef.current = el
          setContainerRef(el)
        }}
        className="overflow-auto border border-gray-200 rounded-lg"
        style={{ height: containerHeight }}
        onScroll={handleScroll}
      >
        {/* Container virtual con altura total */}
        <div style={{ height: totalHeight, position: "relative" }}>
          {/* Renderizar solo elementos visibles */}
          {visibleItems.map(({ index, news, style }) => (
            <div key={`${news.id}-${index}`} style={style} className="px-4 py-2">
              <OptimizedNewsCard
                news={news}
                variant="medium"
                priority={index < 3} // Prioridad para los primeros 3
              />
            </div>
          ))}

          {/* Sentinel para infinite scroll */}
          {hasMore && (
            <div
              data-sentinel
              style={{
                position: "absolute",
                top: Math.max(0, totalHeight - itemHeight * 2),
                height: itemHeight,
                width: "100%",
              }}
            />
          )}
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
              <span className="ml-2 text-sm text-gray-600">Cargando más noticias...</span>
            </div>
          </div>
        )}
      </div>

      {/* Estadísticas de rendimiento (solo en desarrollo) */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-2 text-xs text-gray-500 bg-gray-100 p-2 rounded">
          <div>Total items: {news.length}</div>
          <div>
            Visible range: {visibleRange.start} - {visibleRange.end}
          </div>
          <div>Rendered items: {visibleItems.length}</div>
          <div>Scroll position: {Math.round(scrollTop)}px</div>
        </div>
      )}
    </div>
  )
}
