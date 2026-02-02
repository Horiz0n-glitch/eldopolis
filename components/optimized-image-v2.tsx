"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Image from "next/image"
import { imageOptimizer } from "@/lib/image-optimizer"

interface OptimizedImageV2Props {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  quality?: number
  format?: "webp" | "avif" | "auto"
  placeholder?: "blur" | "empty"
  sizes?: string
  fit?: "cover" | "contain" | "fill"
  onLoad?: () => void
  onError?: () => void
  lazy?: boolean
  blur?: number
  sharpen?: boolean
  grayscale?: boolean
  breakpoints?: number[]
  responsiveSizes?: Array<{ breakpoint: string; size: string }>
}

export default function OptimizedImageV2({
  src,
  alt,
  width,
  height,
  className = "",
  priority = false,
  quality = 75,
  format = "auto",
  placeholder = "blur",
  sizes,
  fit = "cover",
  onLoad,
  onError,
  lazy = true,
  blur,
  sharpen,
  grayscale,
  breakpoints,
  responsiveSizes,
}: OptimizedImageV2Props) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(priority || !lazy)
  const [hasError, setHasError] = useState(false)
  const [currentFormat, setCurrentFormat] = useState<string>("jpeg")
  const imgRef = useRef<HTMLDivElement>(null)

  // Optimizar imagen
  const optimizedImage = imageOptimizer.optimizeImage(src, {
    width,
    height,
    quality,
    format,
    fit,
    blur,
    sharpen,
    grayscale,
    breakpoints,
    responsiveSizes,
  })

  // Intersection Observer para lazy loading
  useEffect(() => {
    if (priority || isInView || !lazy) return

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
        rootMargin: "50px 0px",
        threshold: 0.1,
      },
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [priority, isInView, lazy])

  // Precargar imagen si es prioritaria
  useEffect(() => {
    if (priority) {
      imageOptimizer.preloadImage(src, {
        width,
        height,
        quality,
        format,
      })
    }
  }, [priority, src, width, height, quality, format])

  const handleLoad = useCallback(
    (event: any) => {
      setIsLoaded(true)
      setCurrentFormat(optimizedImage.format)
      onLoad?.()
    },
    [onLoad, optimizedImage.format],
  )

  const handleError = useCallback(() => {
    setHasError(true)
    onError?.()
  }, [onError])

  // Componente de error
  if (hasError) {
    return (
      <div
        ref={imgRef}
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
        role="img"
        aria-label={`Error loading image: ${alt}`}
      >
        <div className="text-center text-gray-500">
          <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-xs">Error al cargar imagen</span>
        </div>
      </div>
    )
  }

  // Placeholder mientras no está en vista
  if (!isInView) {
    return (
      <div
        ref={imgRef}
        className={`bg-gray-200 animate-pulse ${className}`}
        style={{ width, height }}
        role="img"
        aria-label={`Loading: ${alt}`}
      />
    )
  }

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      <Image
        src={optimizedImage.src || "/placeholder.svg"}
        alt={alt}
        width={width}
        height={height}
        quality={quality}
        priority={priority}
        sizes={sizes || optimizedImage.sizes}
        placeholder={placeholder}
        blurDataURL={placeholder === "blur" ? optimizedImage.placeholder : undefined}
        className={`transition-all duration-500 ${isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"}`}
        style={{
          objectFit: fit,
        }}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? "eager" : "lazy"}
      />

      {/* Loading skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer" />
        </div>
      )}

      {/* Format indicator (solo en desarrollo) */}
      {process.env.NODE_ENV === "development" && isLoaded && (
        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {currentFormat.toUpperCase()}
        </div>
      )}

      {/* Performance metrics (solo en desarrollo) */}
      {process.env.NODE_ENV === "development" && isLoaded && (
        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {width}×{height} | Q{quality}
        </div>
      )}
    </div>
  )
}
