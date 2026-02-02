"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Image from "next/image"

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  quality?: number
  placeholder?: "blur" | "empty"
  sizes?: string
  onLoad?: () => void
  onError?: () => void
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = "",
  priority = false,
  quality = 75,
  placeholder = "blur",
  sizes,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(priority)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)

  // Intersection Observer para lazy loading
  useEffect(() => {
    if (priority || isInView) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.disconnect()
          }
        })
      },
      {
        rootMargin: "50px 0px", // Cargar 50px antes de que sea visible
        threshold: 0.1,
      },
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [priority, isInView])

  const handleLoad = useCallback(() => {
    setIsLoaded(true)
    onLoad?.()
  }, [onLoad])

  const handleError = useCallback(() => {
    setHasError(true)
    onError?.()
  }, [onError])

  // Generar placeholder blur data URL
  const generateBlurDataURL = (w: number, h: number) => {
    const canvas = document.createElement("canvas")
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.fillStyle = "#f3f4f6"
      ctx.fillRect(0, 0, w, h)
    }
    return canvas.toDataURL()
  }

  // Optimizar URL de imagen
  const optimizeImageUrl = (url: string, w?: number, q?: number) => {
    if (url.includes("cloudinary.com")) {
      // Optimizaciones para Cloudinary
      const baseUrl = url.split("/upload/")[0] + "/upload/"
      const imagePath = url.split("/upload/")[1]
      const optimizations = []

      if (w) optimizations.push(`w_${w}`)
      if (q) optimizations.push(`q_${q}`)
      optimizations.push("f_auto") // Formato automático
      optimizations.push("c_fill") // Crop para mantener aspecto

      return `${baseUrl}${optimizations.join(",")}/${imagePath}`
    }

    return url
  }

  const optimizedSrc = optimizeImageUrl(src, width, quality)

  if (hasError) {
    return (
      <div
        ref={imgRef}
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    )
  }

  if (!isInView) {
    return <div ref={imgRef} className={`bg-gray-200 animate-pulse ${className}`} style={{ width, height }} />
  }

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      <Image
        src={optimizedSrc || "/placeholder.svg"}
        alt={alt}
        width={width}
        height={height}
        quality={quality}
        priority={priority}
        sizes={sizes}
        placeholder={placeholder}
        blurDataURL={placeholder === "blur" ? generateBlurDataURL(10, 10) : undefined}
        className={`transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-0"}`}
        onLoad={handleLoad}
        onError={handleError}
      />

      {/* Loading skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-red-600 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  )
}
