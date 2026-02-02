"use client"

import { useState, useCallback, useEffect } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface ImageItem {
  url: string
  caption?: string
  alt?: string
}

interface ImageGalleryProps {
  images: (string | ImageItem)[]
  className?: string
  columns?: number
  showCaptions?: boolean
  enableDownload?: boolean
  enableZoom?: boolean
}

export function ImageGallery({
  images,
  className = "",
  columns = 3,
  showCaptions = true,
  enableDownload = true,
  enableZoom = true,
}: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [isZoomed, setIsZoomed] = useState(false)

  // Normalizar imágenes a formato consistente
  const normalizedImages: ImageItem[] = images.map((img, index) => {
    if (typeof img === "string") {
      return {
        url: img,
        alt: `Imagen ${index + 1}`,
      }
    }
    return {
      ...img,
      alt: img.alt || `Imagen ${index + 1}`,
    }
  })

  // Navegación con teclado
  useEffect(() => {
    if (selectedIndex === null) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          setSelectedIndex(null)
          setIsZoomed(false)
          break
        case "ArrowLeft":
          e.preventDefault()
          setSelectedIndex((prev) => (prev === null ? 0 : prev > 0 ? prev - 1 : normalizedImages.length - 1))
          break
        case "ArrowRight":
          e.preventDefault()
          setSelectedIndex((prev) => (prev === null ? 0 : (prev + 1) % normalizedImages.length))
          break
        case "+":
        case "=":
          if (enableZoom) {
            e.preventDefault()
            setIsZoomed(true)
          }
          break
        case "-":
          if (enableZoom) {
            e.preventDefault()
            setIsZoomed(false)
          }
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedIndex, normalizedImages.length, enableZoom])

  const openLightbox = useCallback((index: number) => {
    setSelectedIndex(index)
    setIsZoomed(false)
  }, [])

  const closeLightbox = useCallback(() => {
    setSelectedIndex(null)
    setIsZoomed(false)
  }, [])

  const goToPrevious = useCallback(() => {
    setSelectedIndex((prev) => (prev === null ? 0 : prev > 0 ? prev - 1 : normalizedImages.length - 1))
  }, [normalizedImages.length])

  const goToNext = useCallback(() => {
    setSelectedIndex((prev) => (prev === null ? 0 : (prev + 1) % normalizedImages.length))
  }, [normalizedImages.length])

  const downloadImage = useCallback(async (url: string, filename?: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.href = downloadUrl
      link.download = filename || `imagen-${Date.now()}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error("Error downloading image:", error)
    }
  }, [])

  if (normalizedImages.length === 0) {
    return null
  }

  const gridCols =
    {
      1: "grid-cols-1",
      2: "grid-cols-1 sm:grid-cols-2",
      3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
      5: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
      6: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
    }[Math.min(columns, 6)] || "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"

  return (
    <>
      {/* Galería principal */}
      <div className={`grid gap-4 ${gridCols} ${className}`}>
        {normalizedImages.map((image, index) => (
          <div
            key={index}
            className="group relative overflow-hidden rounded-lg bg-gray-100 cursor-pointer transition-transform hover:scale-105"
            onClick={() => openLightbox(index)}
          >
            <div className="aspect-square relative">
              <Image
                src={image.url || "/placeholder.svg"}
                alt={image.alt || ""}
                fill
                className="object-cover transition-opacity group-hover:opacity-90"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />

              {/* Overlay con información */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Número de imagen */}
              <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                {index + 1} / {normalizedImages.length}
              </div>
            </div>

            {/* Caption */}
            {showCaptions && image.caption && (
              <div className="p-3 bg-white">
                <p className="text-sm text-gray-600 line-clamp-2">{image.caption}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      <Dialog open={selectedIndex !== null} onOpenChange={closeLightbox}>
        <DialogContent className="max-w-7xl w-full h-full max-h-screen p-0 bg-black/95">
          {selectedIndex !== null && (
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Imagen principal */}
              <div className={`relative transition-transform duration-300 ${isZoomed ? "scale-150" : "scale-100"}`}>
                <Image
                  src={normalizedImages[selectedIndex].url || "/placeholder.svg"}
                  alt={normalizedImages[selectedIndex].alt || ""}
                  width={1200}
                  height={800}
                  className="max-w-full max-h-[80vh] object-contain"
                  priority
                />
              </div>

              {/* Controles superiores */}
              <div className="absolute top-4 right-4 flex gap-2">
                {enableZoom && (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsZoomed(!isZoomed)}
                      className="bg-black/50 hover:bg-black/70 text-white border-0"
                    >
                      {isZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
                    </Button>
                  </>
                )}

                {enableDownload && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => downloadImage(normalizedImages[selectedIndex].url, `imagen-${selectedIndex + 1}`)}
                    className="bg-black/50 hover:bg-black/70 text-white border-0"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                )}

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={closeLightbox}
                  className="bg-black/50 hover:bg-black/70 text-white border-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Navegación lateral */}
              {normalizedImages.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={goToPrevious}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-0"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={goToNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-0"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </Button>
                </>
              )}

              {/* Información inferior */}
              <div className="absolute bottom-4 left-4 right-4 text-center">
                <div className="bg-black/50 rounded-lg p-4 text-white">
                  <p className="text-sm mb-1">
                    {selectedIndex + 1} de {normalizedImages.length}
                  </p>
                  {normalizedImages[selectedIndex].caption && (
                    <p className="text-sm opacity-90">{normalizedImages[selectedIndex].caption}</p>
                  )}
                </div>
              </div>

              {/* Indicadores de navegación */}
              {normalizedImages.length > 1 && (
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2">
                  {normalizedImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === selectedIndex ? "bg-white" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

// Export por defecto para compatibilidad
export default ImageGallery
