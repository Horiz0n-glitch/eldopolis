"use client"

import { useEffect, useState } from "react"
import { imageOptimizer } from "@/lib/image-optimizer"

interface ImagePerformanceStats {
  totalImages: number
  optimizedImages: number
  formatDistribution: Record<string, number>
  averageLoadTime: number
  cacheHitRate: number
  bandwidthSaved: number
}

export default function ImagePerformanceMonitor() {
  const [stats, setStats] = useState<ImagePerformanceStats>({
    totalImages: 0,
    optimizedImages: 0,
    formatDistribution: {},
    averageLoadTime: 0,
    cacheHitRate: 0,
    bandwidthSaved: 0,
  })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return

    const updateStats = () => {
      const cacheStats = imageOptimizer.getCacheStats()

      // Simular estadísticas (en producción esto vendría de analytics reales)
      setStats({
        totalImages: cacheStats.size,
        optimizedImages: Math.floor(cacheStats.size * 0.85),
        formatDistribution: {
          AVIF: Math.floor(cacheStats.size * 0.4),
          WebP: Math.floor(cacheStats.size * 0.45),
          JPEG: Math.floor(cacheStats.size * 0.15),
        },
        averageLoadTime: 1.2,
        cacheHitRate: 0.78,
        bandwidthSaved: 2.3, // MB
      })
    }

    updateStats()
    const interval = setInterval(updateStats, 30000)

    return () => clearInterval(interval)
  }, [])

  if (process.env.NODE_ENV !== "development") return null

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 left-4 z-50 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        title="Image Performance Monitor"
      >
        📊
      </button>

      {/* Stats panel */}
      {isVisible && (
        <div className="fixed bottom-16 left-4 z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-4 w-80">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Image Performance</h3>
            <button onClick={() => setIsVisible(false)} className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>

          <div className="space-y-3 text-sm">
            {/* Total images */}
            <div className="flex justify-between">
              <span className="text-gray-600">Total Images:</span>
              <span className="font-medium">{stats.totalImages}</span>
            </div>

            {/* Optimized images */}
            <div className="flex justify-between">
              <span className="text-gray-600">Optimized:</span>
              <span className="font-medium text-green-600">
                {stats.optimizedImages} ({Math.round((stats.optimizedImages / stats.totalImages) * 100)}%)
              </span>
            </div>

            {/* Format distribution */}
            <div>
              <span className="text-gray-600 block mb-1">Format Distribution:</span>
              <div className="space-y-1 ml-2">
                {Object.entries(stats.formatDistribution).map(([format, count]) => (
                  <div key={format} className="flex justify-between text-xs">
                    <span>{format}:</span>
                    <span>{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Average load time */}
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Load Time:</span>
              <span className="font-medium text-blue-600">{stats.averageLoadTime}s</span>
            </div>

            {/* Cache hit rate */}
            <div className="flex justify-between">
              <span className="text-gray-600">Cache Hit Rate:</span>
              <span className="font-medium text-purple-600">{Math.round(stats.cacheHitRate * 100)}%</span>
            </div>

            {/* Bandwidth saved */}
            <div className="flex justify-between">
              <span className="text-gray-600">Bandwidth Saved:</span>
              <span className="font-medium text-green-600">{stats.bandwidthSaved} MB</span>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-gray-200">
              <button
                onClick={() => imageOptimizer.clearCache()}
                className="w-full text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-1 px-2 rounded transition-colors"
              >
                Clear Cache
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
