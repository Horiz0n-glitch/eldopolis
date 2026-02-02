"use client"

import type React from "react"

import { useBatchData } from "@/hooks/use-batch-data"
import { useEffect } from "react"

interface OptimizedPageWrapperProps {
  children: React.ReactNode
  category?: string
}

export default function OptimizedPageWrapper({ children, category }: OptimizedPageWrapperProps) {
  const { data, loading, trackUserBehavior } = useBatchData()

  // Track category visits
  useEffect(() => {
    if (category) {
      trackUserBehavior("visit_category", { category })
    }
  }, [category, trackUserBehavior])

  // Performance monitoring
  useEffect(() => {
    if (data && !loading) {
      console.log("📊 Performance Stats:", {
        newsCount: data.news.length,
        adsCount: Object.values(data.ads).flat().length,
        loadTime: Date.now() - data.timestamp,
        cacheHit: Date.now() - data.timestamp < 1000,
      })
    }
  }, [data, loading])

  if (loading) {
    return (
      <div className="w-full h-[100vh] bg-[#182538] flex justify-center items-center">
        <img
          alt="logoloader"
          className="h-20 w-auto animate-pulse"
          src="https://res.cloudinary.com/deemssikv/image/upload/v1738581472/logo_rojo_azul_1_ethdja.svg"
        />
      </div>
    )
  }

  return <>{children}</>
}
