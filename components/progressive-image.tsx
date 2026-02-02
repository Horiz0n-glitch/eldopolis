"use client"

import { useState, useEffect, useRef } from "react"
import { imageOptimizer } from "@/lib/image-optimizer"

interface ProgressiveImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  quality?: number
  lowQualityPlaceholder?: boolean
  onLoad?: () => void
  onError?: () => void
}

export default function ProgressiveImage({
  src,
  alt,
  width,
  height,
  className = "",
  quality = 75,
  lowQualityPlaceholder = true,
  onLoad,
  onError,
}: ProgressiveImageProps) {
  const [loadingState, setLoadingState] = useState<"loading" | "low-quality" | "high-quality" | "error">("loading")
  const [isInView, setIsInView] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)
  const lowQualityRef = useRef<HTMLImageElement>(null)
  const highQualityRef = useRef<HTMLImageElement>(null)

  // Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.disconnect()
          }
        })
      },
      { rootMargin: "50px 0px", threshold: 0.1 },
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // Cargar imágenes progresivamente
  useEffect(() => {
    if (!isInView) return

    const loadImages = async () => {
      try {
        // Cargar imagen de baja calidad primero
        if (lowQualityPlaceholder) {
          const lowQualityUrl = imageOptimizer.optimizeImageUrl(src, {
            width: Math.floor((width || 400) / 4),
            height: Math.floor((height || 300) / 4),
            quality: 20,
            format: "webp",
          })

          const lowQualityImg = new Image()
          lowQualityImg.onload = () => {
            setLoadingState("low-quality")
            if (lowQualityRef.current) {
              lowQualityRef.current.src = lowQualityUrl
            }
          }
          lowQualityImg.src = lowQualityUrl
        }

        // Cargar imagen de alta calidad
        const highQualityUrl = imageOptimizer.optimizeImageUrl(src, {
          width,
          height,
          quality,
          format: "auto",
        })

        const highQualityImg = new Image()
        highQualityImg.onload = () => {
          setLoadingState("high-quality")
          if (highQualityRef.current) {
            highQualityRef.current.src = highQualityUrl
          }
          onLoad?.()
        }
        highQualityImg.onerror = () => {
          setLoadingState("error")
          onError?.()
        }
        highQualityImg.src = highQualityUrl
      } catch (error) {
        setLoadingState("error")
        onError?.()
      }
    }

    loadImages()
  }, [isInView, src, width, height, quality, lowQualityPlaceholder, onLoad, onError])

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`} style={{ width, height }}>
      {/* Skeleton loader */}
      {loadingState === "loading" && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-pulse" />
        </div>
      )}

      {/* Low quality placeholder */}
      {lowQualityPlaceholder && (loadingState === "low-quality" || loadingState === "high-quality") && (
        <img
          ref={lowQualityRef}
          alt={alt}
          className={`absolute inset-0 w-full h-full object-cover filter blur-sm transition-opacity duration-300 ${
            loadingState === "high-quality" ? "opacity-0" : "opacity-100"
          }`}
        />
      )}

      {/* High quality image */}
      {loadingState === "high-quality" && (
        <img
          ref={highQualityRef}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 opacity-100"
        />
      )}

      {/* Error state */}
      {loadingState === "error" && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs">Error al cargar</span>
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {loadingState !== "high-quality" && loadingState !== "error" && (
        <div className="absolute top-2 right-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Format indicator (desarrollo) */}
      {process.env.NODE_ENV === "development" && loadingState === "high-quality" && (
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">Progressive</div>
      )}
    </div>
  )
}
