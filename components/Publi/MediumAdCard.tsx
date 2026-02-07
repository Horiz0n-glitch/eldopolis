import React, { useEffect, useState } from "react"
import AdPlaceholder from "./AdPlaceholder"
import { getAllAds } from "@/lib/firebase-optimized"
import type { Publicidad } from "@/lib/validations"
import { convertirURL } from "@/lib/image-utils"

const MediumAdCard: React.FC = () => {
  const [ad, setAd] = useState<Publicidad | null>(null)

  useEffect(() => {
    const fetchAd = async () => {
      const ads = await getAllAds()
      const mediumPrincipalAds = ads["Mediana Principal"]
      if (mediumPrincipalAds && mediumPrincipalAds.length > 0) {
        setAd(mediumPrincipalAds[0])
      }
    }
    fetchAd()
  }, [])

  if (ad) {
    return (
      <a href={ad.linkUrl || "#"} target="_blank" rel="noopener noreferrer">
        <AdPlaceholder height="384px" text={ad.title || "Publicidad"} imageUrl={convertirURL(ad.imageUrl || "")} />
      </a>
    )
  }

  return <AdPlaceholder height="384px" text="Espacio Publicitario Mediano" />
}

export default MediumAdCard
