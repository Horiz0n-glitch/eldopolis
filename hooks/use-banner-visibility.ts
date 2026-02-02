"use client"

import { useState, useEffect } from "react"

export function useBannerVisibility() {
  const [isVisible, setIsVisible] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    // Verificar solo el estado minimizado (no el cerrado)
    const bannerMinimized = localStorage.getItem("eldopolis-banner-minimized")

    if (bannerMinimized === "true") {
      setIsMinimized(true)
    }

    // Siempre mostrar el banner después de 3 segundos en cada recarga
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const closeBanner = () => {
    // Solo ocultar temporalmente en la sesión actual
    setIsVisible(false)
    // No guardar en localStorage para que aparezca en la próxima recarga
  }

  const toggleMinimize = () => {
    const newMinimizedState = !isMinimized
    setIsMinimized(newMinimizedState)
    localStorage.setItem("eldopolis-banner-minimized", newMinimizedState.toString())
  }

  return {
    isVisible,
    isMounted,
    closeBanner,
    isMinimized,
    toggleMinimize,
  }
}
