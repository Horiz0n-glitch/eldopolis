"use client"

import { useState, useEffect, useCallback } from "react"
import { getBatchInitialData, prefetchUserContent } from "@/lib/firebase-batch-optimizer"
import type { News } from "@/types/news"

interface BatchData {
  news: News[]
  ads: {
    "Grande Principal": any[]
    "Mediana Principal": any[]
    "Pequeña Principal": any[]
    Sidebar: any[]
  }
  timestamp: number
}

interface UserBehavior {
  visitedCategories: string[]
  readingTime: number
  scrollDepth: number
  startTime: number
}

export function useBatchData() {
  const [data, setData] = useState<BatchData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userBehavior, setUserBehavior] = useState<UserBehavior>({
    visitedCategories: [],
    readingTime: 0,
    scrollDepth: 0,
    startTime: Date.now(),
  })

  // Cargar datos iniciales
  const loadBatchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const batchData = await getBatchInitialData()
      setData(batchData)
    } catch (err) {
      setError("Error loading data")
      console.error("Batch data error:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Tracking de comportamiento del usuario
  const trackUserBehavior = useCallback((action: string, payload: any) => {
    setUserBehavior((prev) => {
      const updated = { ...prev }

      switch (action) {
        case "visit_category":
          if (!updated.visitedCategories.includes(payload.category)) {
            updated.visitedCategories.push(payload.category)
          }
          break
        case "scroll":
          updated.scrollDepth = Math.max(updated.scrollDepth, payload.depth)
          break
        case "reading_time":
          updated.readingTime = Date.now() - updated.startTime
          break
      }

      // Trigger prefetch si el usuario está activo
      if (updated.readingTime > 10000 || updated.scrollDepth > 50) {
        prefetchUserContent(updated).catch(console.warn)
      }

      return updated
    })
  }, [])

  // Scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      trackUserBehavior("scroll", { depth: scrollPercent })
    }

    const handleBeforeUnload = () => {
      trackUserBehavior("reading_time", {})
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [trackUserBehavior])

  // Cargar datos al montar
  useEffect(() => {
    loadBatchData()
  }, [loadBatchData])

  return {
    data,
    loading,
    error,
    userBehavior,
    trackUserBehavior,
    refresh: loadBatchData,
  }
}

// Hook específico para publicidades optimizadas
export function useOptimizedAds(category: string) {
  const { data } = useBatchData()
  const [currentIndex, setCurrentIndex] = useState(0)

  const ads = data?.ads[category as keyof typeof data.ads] || []

  // Rotación automática de anuncios
  useEffect(() => {
    if (ads.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % ads.length)
      }, 45000)
      return () => clearInterval(interval)
    }
  }, [ads.length])

  return {
    currentAd: ads[currentIndex] || null,
    totalAds: ads.length,
    loading: !data,
  }
}
