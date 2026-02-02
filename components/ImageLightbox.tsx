"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw, Download } from "lucide-react"
import { convertirURL } from "@/lib/image-utils"

interface ImageLightboxProps {
    images: string[]
    initialIndex: number
    isOpen: boolean
    onClose: () => void
}

export function ImageLightbox({ images, initialIndex, isOpen, onClose }: ImageLightboxProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex)
    const [zoom, setZoom] = useState(1)
    const [rotation, setRotation] = useState(0)

    useEffect(() => {
        setCurrentIndex(initialIndex)
        setZoom(1)
        setRotation(0)
    }, [initialIndex, isOpen])

    const handleNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length)
        setZoom(1)
        setRotation(0)
    }, [images.length])

    const handlePrev = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
        setZoom(1)
        setRotation(0)
    }, [images.length])

    useEffect(() => {
        if (!isOpen) return

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose()
            if (e.key === "ArrowRight") handleNext()
            if (e.key === "ArrowLeft") handlePrev()
        }

        window.addEventListener("keydown", handleKeyDown)
        document.body.style.overflow = "hidden"

        return () => {
            window.removeEventListener("keydown", handleKeyDown)
            document.body.style.overflow = "unset"
        }
    }, [isOpen, onClose, handleNext, handlePrev])

    if (!isOpen) return null

    const handleDownload = async () => {
        try {
            const response = await fetch(convertirURL(images[currentIndex]))
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `eldopolis-image-${currentIndex + 1}.jpg`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } catch (error) {
            console.error("Error downloading image:", error)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm transition-all duration-300">
            {/* Header controls */}
            <div className="absolute top-0 left-0 right-0 h-20 px-6 flex items-center justify-between z-[110] bg-gradient-to-b from-black/50 to-transparent">
                <div className="text-white font-medium text-sm">
                    {currentIndex + 1} / {images.length}
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => setZoom(prev => Math.min(prev + 0.5, 3))} className="p-2 text-white/70 hover:text-white transition-colors" title="Zoom In">
                        <ZoomIn className="w-5 h-5" />
                    </button>
                    <button onClick={() => setZoom(prev => Math.max(prev - 0.5, 1))} className="p-2 text-white/70 hover:text-white transition-colors" title="Zoom Out">
                        <ZoomOut className="w-5 h-5" />
                    </button>
                    <button onClick={() => setRotation(prev => (prev + 90) % 360)} className="p-2 text-white/70 hover:text-white transition-colors" title="Rotate">
                        <RotateCcw className="w-5 h-5" />
                    </button>
                    <button onClick={handleDownload} className="p-2 text-white/70 hover:text-white transition-colors" title="Download">
                        <Download className="w-5 h-5" />
                    </button>
                    <div className="w-px h-6 bg-white/10 mx-2" />
                    <button
                        onClick={onClose}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all transform hover:scale-110"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Main image container */}
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                {images.length > 1 && (
                    <>
                        <button
                            onClick={handlePrev}
                            className="absolute left-6 z-[110] p-4 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all transform -translate-y-1/2 top-1/2 hover:scale-110"
                        >
                            <ChevronLeft className="w-8 h-8" />
                        </button>
                        <button
                            onClick={handleNext}
                            className="absolute right-6 z-[110] p-4 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all transform -translate-y-1/2 top-1/2 hover:scale-110"
                        >
                            <ChevronRight className="w-8 h-8" />
                        </button>
                    </>
                )}

                <div
                    className="relative w-full h-full transition-transform duration-300 ease-out flex items-center justify-center"
                    style={{
                        transform: `scale(${zoom}) rotate(${rotation}deg)`,
                        cursor: zoom > 1 ? 'grab' : 'default'
                    }}
                >
                    <Image
                        src={convertirURL(images[currentIndex])}
                        alt="Gallery view"
                        fill
                        className="object-contain p-4 md:p-12 select-none"
                        priority
                        unoptimized
                    />
                </div>
            </div>

            {/* Thumbnails desktop footer */}
            {images.length > 1 && (
                <div className="absolute bottom-6 left-0 right-0 overflow-x-auto pb-4 z-[110]">
                    <div className="flex justify-center gap-3 px-6 mx-auto w-max">
                        {images.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${currentIndex === idx ? 'border-primary scale-110 shadow-lg shadow-primary/20' : 'border-transparent opacity-50 hover:opacity-100'
                                    }`}
                            >
                                <Image
                                    src={convertirURL(img)}
                                    alt={`Thumb ${idx + 1}`}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
