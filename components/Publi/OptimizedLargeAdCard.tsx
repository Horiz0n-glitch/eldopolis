"use client"

import React, { memo } from "react"
import AdPlaceholder from "./AdPlaceholder"

const OptimizedLargeAdCard: React.FC = memo(() => {
  return <AdPlaceholder height="250px" text="Publicidad Optimizada" />
})

OptimizedLargeAdCard.displayName = "OptimizedLargeAdCard"

export default OptimizedLargeAdCard
