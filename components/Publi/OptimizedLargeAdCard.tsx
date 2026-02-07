"use client"

import { getAllAds } from "@/lib/firebase-optimized"
import type { Publicidad } from "@/lib/validations"
import React, { memo } from "react"
import AdPlaceholder from "./AdPlaceholder"
import { convertirURL } from "@/lib/image-utils"

const OptimizedLargeAdCard: React.FC = memo(() => {
  const [ads, setAds] = React.useState<Publicidad[]>([])
  const [currentIndex, setCurrentIndex] = React.useState(0)

  React.useEffect(() => {
    const fetchAds = async () => {
      const allAds = await getAllAds()
      const largeAds = allAds["Grande Principal"]
      if (largeAds && largeAds.length > 0) {
        setAds(largeAds)
        setCurrentIndex(Math.floor(Math.random() * largeAds.length))
      }
    }
    fetchAds()
  }, [])

  React.useEffect(() => {
    if (ads.length <= 1) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [ads.length])

  const ad = ads[currentIndex]

  if (ad) {
    return (
      <a href={ad.linkUrl || "#"} target="_blank" rel="noopener noreferrer" className="block w-full transition-opacity duration-500">
        <AdPlaceholder height="250px" text={ad.title || "Publicidad"} imageUrl={convertirURL(ad.imageUrl || "")} />
      </a>
    )
  }

  return <AdPlaceholder height="250px" text="Publicidad Optimizada" />
})

OptimizedLargeAdCard.displayName = "OptimizedLargeAdCard"

export default OptimizedLargeAdCard
