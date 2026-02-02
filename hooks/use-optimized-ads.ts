"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { getAllAds } from "@/lib/firebase-optimized"
import { cacheManager } from "@/lib/cache-manager"
import type { Publicidad } from "@/types/publicidad"

interface UseOptimizedAdsReturn {
  ads: Publicidad[]
  currentAd: Publicidad | null
  loading: boolean
  error: string | null
  nextAd: () => void
  refreshAds: () => void
  preloadNextImage: () => void
}


export function useOptimizedAds(category: string): UseOptimizedAdsReturn {
  const [allAds, setAllAds] = useState<Record<string, Publicidad[]>>({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const initialTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const initialPriorityIndexRef = useRef<number | null>(null)
  const initialShownRef = useRef(false)

  const ads = allAds[category] || []
  const currentAd = ads.length > 0 ? ads[currentIndex % ads.length] : null

  // Precarga removida por requerimiento
  const preloadNextImage = useCallback(() => {}, [ads, currentIndex])

  // Ya no se inicializa el imageCacheService (precarga eliminada)

  const fetchAds = useCallback(
    async (forceRefresh = false) => {
      try {
        setLoading(true)
        setError(null)

        const cacheKey = `ads_${category}`
        const cachedData = localStorage.getItem(cacheKey)
        const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`)

        if (!forceRefresh && cachedData && cacheTimestamp) {
          const cacheAge = Date.now() - Number.parseInt(cacheTimestamp)
          if (cacheAge < 5 * 60 * 1000) {
            const parsedAds = JSON.parse(cachedData)
            setAllAds((prev) => ({ ...prev, [category]: parsedAds }))
            setLoading(false)
            return
          }
        }

        if (forceRefresh) {
          cacheManager.invalidate("advertisements")
        }

        const adsData = await getAllAds()
        setAllAds(adsData)

        // Si la categoría es Grande Principal, buscar un banner prioritario que contenga "ucami"
        if (category === "Grande Principal" && adsData[category] && Array.isArray(adsData[category])) {
          const idx = adsData[category].findIndex((a: Publicidad) => {
            const hay = `${a.title || ""} ${a.link || ""} ${a.id || ""}`.toLowerCase()
            return hay.includes("ucami")
          })

          if (idx >= 0) {
            initialPriorityIndexRef.current = idx
            setCurrentIndex(idx)
          }
        }

        if (adsData[category]) {
          localStorage.setItem(cacheKey, JSON.stringify(adsData[category]))
          localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString())
        }
      } catch (err) {
        console.error("Error fetching ads:", err)
        setError("Error al cargar publicidades")
      } finally {
        setLoading(false)
      }
    },
    [category],
  )

  const nextAd = useCallback(() => {
    if (ads.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % ads.length)
    }
  }, [ads.length])

  const refreshAds = useCallback(() => {
    fetchAds(true)
  }, [fetchAds])

  useEffect(() => {
    fetchAds()
  }, [fetchAds])

  useEffect(() => {
    // Usamos un timeout por muestra para poder variar la duración cuando la publi
    // contiene 'ucami' (será 10s más larga que la base)
    if (initialTimeoutRef.current) {
      clearTimeout(initialTimeoutRef.current)
      initialTimeoutRef.current = null
    }

    if (ads.length > 1) {
      const current = ads[currentIndex % ads.length]
      const hay = `${(current?.title || "").toLowerCase()} ${(current?.link || "").toLowerCase()} ${(current?.id || "").toLowerCase()}`
      const isUcami = hay.includes("ucami")

      const BASE_MS = 5000
      const extra = isUcami ? 10000 : 0
      const duration = BASE_MS + extra

      initialTimeoutRef.current = setTimeout(() => {
        nextAd()
      }, duration)
    }

    return () => {
      if (initialTimeoutRef.current) {
        clearTimeout(initialTimeoutRef.current)
        initialTimeoutRef.current = null
      }
    }
  }, [ads.length, nextAd, preloadNextImage])

  // Precarga de imagen actual eliminada

  return {
    ads,
    currentAd,
    loading,
    error,
    nextAd,
    refreshAds,
    preloadNextImage,
  }
}

export function useMultipleAds(categories: string[]) {
  const [allAds, setAllAds] = useState<Record<string, Publicidad[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAllAds = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const cachedResults: Record<string, Publicidad[]> = {}
      const categoriesToFetch: string[] = []

      for (const category of categories) {
        const cacheKey = `ads_${category}`
        const cachedData = localStorage.getItem(cacheKey)
        const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`)

        if (cachedData && cacheTimestamp) {
          const cacheAge = Date.now() - Number.parseInt(cacheTimestamp)
          if (cacheAge < 5 * 60 * 1000) {
            cachedResults[category] = JSON.parse(cachedData)
          } else {
            categoriesToFetch.push(category)
          }
        } else {
          categoriesToFetch.push(category)
        }
      }

      if (Object.keys(cachedResults).length > 0) {
        setAllAds((prev) => ({ ...prev, ...cachedResults }))
      }

      if (categoriesToFetch.length > 0) {
        const adsData = await getAllAds()

        const newData: Record<string, Publicidad[]> = {}
        for (const category of categoriesToFetch) {
          if (adsData[category]) {
            newData[category] = adsData[category]
            localStorage.setItem(`ads_${category}`, JSON.stringify(adsData[category]))
            localStorage.setItem(`ads_${category}_timestamp`, Date.now().toString())
          }
        }

        setAllAds((prev) => ({ ...prev, ...newData }))
      }
    } catch (err) {
      console.error("Error fetching multiple ads:", err)
      setError("Error al cargar publicidades")
    } finally {
      setLoading(false)
    }
  }, [categories])

  useEffect(() => {
    fetchAllAds()
  }, [fetchAllAds])

  const getAdsForCategory = useCallback(
    (category: string) => {
      return allAds[category] || []
    },
    [allAds],
  )

  return {
    allAds,
    loading,
    error,
    getAdsForCategory,
    refreshAds: fetchAllAds,
  }
}
