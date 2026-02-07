import React, { useEffect, useState } from "react"
import AdPlaceholder from "./AdPlaceholder"
import { getAllAds } from "@/lib/firebase-optimized"
import type { Publicidad } from "@/lib/validations"
import { convertirURL } from "@/lib/image-utils"

const SmallPrincipalAdCard: React.FC = () => {
  const [ad, setAd] = useState<Publicidad | null>(null)

  useEffect(() => {
    const fetchAd = async () => {
      const ads = await getAllAds()
      const smallPrincipalAds = ads["Pequeña Principal"]
      if (smallPrincipalAds && smallPrincipalAds.length > 0) {
        setAd(smallPrincipalAds[0])
      }
    }
    fetchAd()
  }, [])

  if (ad) {
    return (
      <a href={ad.linkUrl || "#"} target="_blank" rel="noopener noreferrer">
        <AdPlaceholder height="400px" text={ad.title || "Publicidad"} imageUrl={convertirURL(ad.imageUrl || "")} />
      </a>
    )
  }

  return <AdPlaceholder height="400px" text="Publicidad Lateral" />
}

export default SmallPrincipalAdCard
