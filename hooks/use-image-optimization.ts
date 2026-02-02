"use client"

import { useState, useEffect, useCallback } from "react"
import { imageOptimizer } from "@/lib/image-optimizer"

interface UseImageOptimizationOptions {
  width?: number
  height?: number
  quality?: number
  format?: "webp" | "avif" | "auto"
  lazy?: boolean
  preload?: boolean
}

interface UseImageOptimizationReturn {
  optimizedSrc: string
  srcSet: string
  sizes: string
  placeholder: string
  isLoading: boolean
  hasError: boolean
  format: string
  preloadImage: () => void
  retryLoad: () => void
}

export function useImageOptimization(
  src: string,
  options: UseImageOptimizationOptions = {},
): UseImageOptimizationReturn {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [optimizedData, setOptimizedData] = useState({
    optimizedSrc: "",
    srcSet: "",
    sizes: "",
    placeholder: "",
    format: "jpeg",
  })

  const { width, height, quality = 75, format = "auto", lazy = true, preload = false } = options

  const optimizeImage = useCallback(async () => {
    try {
      setIsLoading(true)
      setHasError(false)

      const result = imageOptimizer.optimizeImage(src, {
        width,
        height,
        quality,
        format,
      })

      setOptimizedData({
        optimizedSrc: result.src,
        srcSet: result.srcSet,
        sizes: result.sizes,
        placeholder: result.placeholder,
        format: result.format,
      })

      setIsLoading(false)
    } catch (error) {
      console.error("Error optimizing image:", error)
      setHasError(true)
      setIsLoading(false)
    }
  }, [src, width, height, quality, format])

  const preloadImage = useCallback(() => {
    if (src) {
      imageOptimizer.preloadImage(src, { width, height, quality, format })
    }
  }, [src, width, height, quality, format])

  const retryLoad = useCallback(() => {
    optimizeImage()
  }, [optimizeImage])

  useEffect(() => {
    if (src) {
      optimizeImage()
    }
  }, [optimizeImage, src])

  useEffect(() => {
    if (preload && src) {
      preloadImage()
    }
  }, [preload, preloadImage, src])

  return {
    optimizedSrc: optimizedData.optimizedSrc,
    srcSet: optimizedData.srcSet,
    sizes: optimizedData.sizes,
    placeholder: optimizedData.placeholder,
    isLoading,
    hasError,
    format: optimizedData.format,
    preloadImage,
    retryLoad,
  }
}

// Hook para múltiples imágenes
export function useMultipleImageOptimization(images: Array<{ src: string; options?: UseImageOptimizationOptions }>) {
  const [optimizedImages, setOptimizedImages] = useState<Array<UseImageOptimizationReturn>>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const optimizeAllImages = async () => {
      setIsLoading(true)

      const results = await Promise.all(
        images.map(async ({ src, options = {} }) => {
          try {
            const result = imageOptimizer.optimizeImage(src, options)
            return {
              optimizedSrc: result.src,
              srcSet: result.srcSet,
              sizes: result.sizes,
              placeholder: result.placeholder,
              isLoading: false,
              hasError: false,
              format: result.format,
              preloadImage: () => imageOptimizer.preloadImage(src, options),
              retryLoad: () => {},
            }
          } catch (error) {
            return {
              optimizedSrc: "",
              srcSet: "",
              sizes: "",
              placeholder: "",
              isLoading: false,
              hasError: true,
              format: "jpeg",
              preloadImage: () => {},
              retryLoad: () => {},
            }
          }
        }),
      )

      setOptimizedImages(results)
      setIsLoading(false)
    }

    if (images.length > 0) {
      optimizeAllImages()
    }
  }, [images])

  return {
    optimizedImages,
    isLoading,
  }
}

// Hook para detección de formato
export function useFormatSupport() {
  const [support, setSupport] = useState({
    webp: false,
    avif: false,
    loading: true,
  })

  useEffect(() => {
    const detectSupport = async () => {
      if (typeof window === "undefined") {
        setSupport({ webp: true, avif: true, loading: false })
        return
      }

      try {
        // Test WebP
        const webpTest = new Promise<boolean>((resolve) => {
          const webp = new Image()
          webp.onload = webp.onerror = () => resolve(webp.height === 2)
          webp.src =
            "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA"
        })

        // Test AVIF
        const avifTest = new Promise<boolean>((resolve) => {
          const avif = new Image()
          avif.onload = avif.onerror = () => resolve(avif.height === 2)
          avif.src =
            "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABcAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKCBgABogQEDQgMgkQAAAAB8dSLfI="
        })

        const [webpSupported, avifSupported] = await Promise.all([webpTest, avifTest])

        setSupport({
          webp: webpSupported,
          avif: avifSupported,
          loading: false,
        })
      } catch (error) {
        console.error("Error detecting format support:", error)
        setSupport({ webp: false, avif: false, loading: false })
      }
    }

    detectSupport()
  }, [])

  return support
}
