"use client"

import type React from "react"

import { useState, useMemo, useCallback } from "react"
import type { News } from "@/types/news"
import OptimizedNewsCard from "@/components/news/optimized-news-card"

interface VirtualGridListProps {
  news: News[]
  columns?: number
  itemHeight?: number
  itemWidth?: number
  gap?: number
  containerHeight?: number
  onLoadMore?: () => void
  hasMore?: boolean
  loading?: boolean
}

export default function VirtualGridList({
  news,
  columns = 3,
  itemHeight = 320,
  itemWidth = 300,
  gap = 16,
  containerHeight = 600,
  onLoadMore,
  hasMore = false,
  loading = false,
}: VirtualGridListProps) {
  const [scrollTop, setScrollTop] = useState(0)
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null)

  // Calcular filas y elementos por fila
  const rowHeight = itemHeight + gap
  const itemsPerRow = columns
  const totalRows = Math.ceil(news.length / itemsPerRow)

  // Calcular filas visibles
  const visibleRange = useMemo(() => {
    const startRow = Math.floor(scrollTop / rowHeight)
    const endRow = Math.min(startRow + Math.ceil(containerHeight / rowHeight) + 1, totalRows - 1)

    return {
      start: Math.max(0, startRow),
      end: Math.max(0, endRow),
    }
  }, [scrollTop, rowHeight, containerHeight, totalRows])

  // Elementos a renderizar
  const visibleItems = useMemo(() => {
    const items = []

    for (let row = visibleRange.start; row <= visibleRange.end; row++) {
      for (let col = 0; col < itemsPerRow; col++) {
        const index = row * itemsPerRow + col
        if (index < news.length) {
          items.push({
            index,
            news: news[index],
            style: {
              position: "absolute" as const,
              top: row * rowHeight,
              left: col * (itemWidth + gap),
              width: itemWidth,
              height: itemHeight,
            },
          })
        }
      }
    }

    return items
  }, [visibleRange, news, itemsPerRow, rowHeight, itemWidth, itemHeight, gap])

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const scrollTop = e.currentTarget.scrollTop
      setScrollTop(scrollTop)

      // Load more logic
      if (hasMore && !loading && onLoadMore) {
        const scrollHeight = e.currentTarget.scrollHeight
        const clientHeight = e.currentTarget.clientHeight
        const scrollPosition = scrollTop + clientHeight

        if (scrollPosition >= scrollHeight - 200) {
          onLoadMore()
        }
      }
    },
    [hasMore, loading, onLoadMore],
  )

  const totalHeight = totalRows * rowHeight
  const totalWidth = columns * itemWidth + (columns - 1) * gap

  return (
    <div className="relative">
      <div
        ref={setContainerRef}
        className="overflow-auto border border-gray-200 rounded-lg"
        style={{ height: containerHeight }}
        onScroll={handleScroll}
      >
        <div
          style={{
            height: totalHeight,
            width: totalWidth,
            position: "relative",
            margin: "0 auto",
          }}
        >
          {visibleItems.map(({ index, news, style }) => (
            <div key={`${news.id}-${index}`} style={style}>
              <OptimizedNewsCard
                news={news}
                variant="medium"
                priority={index < 6} // Prioridad para los primeros 6
              />
            </div>
          ))}
        </div>

        {loading && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
              <span className="ml-2 text-sm text-gray-600">Cargando más noticias...</span>
            </div>
          </div>
        )}
      </div>

      {/* Debug info */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-2 text-xs text-gray-500 bg-gray-100 p-2 rounded">
          <div>
            Total items: {news.length} | Rows: {totalRows}
          </div>
          <div>
            Visible rows: {visibleRange.start} - {visibleRange.end}
          </div>
          <div>Rendered items: {visibleItems.length}</div>
        </div>
      )}
    </div>
  )
}
