import React, { useEffect, useState } from "react"
import AdPlaceholder from "./AdPlaceholder"
import { getAllAds } from "@/lib/firebase-optimized"
import type { Publicidad } from "@/lib/validations"
import { convertirURL } from "@/lib/image-utils"

const OptimizedMediumAdCard: React.FC = () => {
  const [ads, setAds] = useState<Publicidad[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const fetchAds = async () => {
      const allAds = await getAllAds()
      const mediumPrincipalAds = allAds["Mediana Principal"]
      if (mediumPrincipalAds && mediumPrincipalAds.length > 0) {
        setAds(mediumPrincipalAds)
      }
    }
    fetchAds()
  }, [])

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
        <AdPlaceholder height="300px" text={ad.title || "Publicidad"} imageUrl={convertirURL(ad.imageUrl || "")} />
      </a>
    )
  }

  return <AdPlaceholder height="300px" text="Publicidad Mediana" />
}

export default OptimizedMediumAdCard
