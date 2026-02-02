"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export default function NavigationProgress() {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsLoading(true)

    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500) // Simular tiempo de carga

    return () => clearTimeout(timer)
  }, [pathname])

  if (!isLoading) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="h-1 bg-red-600 animate-pulse">
        <div className="h-full bg-red-700 animate-pulse" style={{ width: "100%" }} />
      </div>
    </div>
  )
}
