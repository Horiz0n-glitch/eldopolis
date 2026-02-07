import React, { useEffect, useState } from "react"
import AdPlaceholder from "./AdPlaceholder"
import { getAllAds } from "@/lib/firebase-optimized"
import type { Publicidad } from "@/lib/validations"
import { convertirURL } from "@/lib/image-utils"

const SmallAdCard: React.FC = () => {
  const [ads, setAds] = useState<Publicidad[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const fetchAds = async () => {
      const allAdsRecord = await getAllAds()

      // Collect all potential vertical/sidebar ads
      const sidebarCandidates = [
        ...(allAdsRecord["Sidebar"] || []),
        ...(allAdsRecord["Pequeña Principal"] || []),
        ...(allAdsRecord["Mediana Principal"] || [])
      ]

      if (sidebarCandidates.length > 0) {
        setAds(sidebarCandidates)
      }
    }
    fetchAds()
  }, [])

  // Rotate ads every 5 seconds
  useEffect(() => {
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
        <AdPlaceholder height="auto" text={ad.title || "Publicidad"} imageUrl={convertirURL(ad.imageUrl || "")} className="aspect-auto min-h-[200px]" />
      </a>
    )
  }

  return <AdPlaceholder height="auto" text="Espacio Publicitario Vertical" />
}

export default SmallAdCard
export { SmallAdCard }
