"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import SmallAdCard from "./Publi/SmallAdCard"

interface InteractiveAdColumnProps {
  children?: React.ReactNode
}

export default function InteractiveAdColumn({ children }: InteractiveAdColumnProps) {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const columnRef = useRef<HTMLDivElement>(null)
  const adRef = useRef<HTMLDivElement>(null)
  const [availableSpace, setAvailableSpace] = useState(0)

  useEffect(() => {
    const calculateAvailableSpace = () => {
      if (columnRef.current && adRef.current) {
        const columnHeight = columnRef.current.clientHeight
        const adHeight = adRef.current.clientHeight
        const space = Math.max(0, columnHeight - adHeight)
        setAvailableSpace(space)
      }
    }

    calculateAvailableSpace()
    window.addEventListener("resize", calculateAvailableSpace)

    // Recalcular después de que el componente se haya renderizado completamente
    const timer = setTimeout(calculateAvailableSpace, 100)

    return () => {
      window.removeEventListener("resize", calculateAvailableSpace)
      clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (!columnRef.current) return

      const rect = columnRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight

      // Calcular si la sección está visible
      const isInView = rect.top < windowHeight && rect.bottom > 0
      setIsVisible(isInView)

      if (isInView) {
        // Calcular el progreso del scroll dentro de la sección
        const sectionHeight = rect.height
        const visibleTop = Math.max(0, -rect.top)
        const visibleBottom = Math.min(sectionHeight, windowHeight - rect.top)
        const visibleHeight = Math.max(0, visibleBottom - visibleTop)

        // Progreso basado en cuánto de la sección ha pasado por la ventana
        const totalScrollableArea = sectionHeight + windowHeight
        const scrolled = visibleTop + (windowHeight - rect.bottom > 0 ? windowHeight - rect.bottom : 0)
        const progress = Math.min(1, Math.max(0, scrolled / totalScrollableArea))

        setScrollProgress(progress)
      }
    }

    // Intersection Observer para mejor rendimiento
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            window.addEventListener("scroll", handleScroll, { passive: true })
            handleScroll() // Llamar inmediatamente para establecer posición inicial
          } else {
            window.removeEventListener("scroll", handleScroll)
          }
        })
      },
      {
        rootMargin: "100px 0px", // Empezar a escuchar un poco antes de que sea visible
      },
    )

    if (columnRef.current) {
      observer.observe(columnRef.current)
    }

    return () => {
      observer.disconnect()
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const translateY = isVisible ? scrollProgress * availableSpace : 0

  return (
    <div ref={columnRef} className="lg:w-1/4 w-full relative min-h-[800px]">
      {/* Indicador visual sutil del área interactiva */}
      <div
        className={`absolute inset-0 transition-all duration-500 rounded-lg ${
          isVisible && scrollProgress > 0
            ? "bg-gradient-to-b from-red-50/20 via-transparent to-red-50/20 border border-red-200/20"
            : "bg-transparent"
        }`}
      />

      {/* SmallAdCard con movimiento suave basado en scroll */}
      <div
        ref={adRef}
        className="relative z-10 transition-transform duration-200 ease-out"
        style={{
          transform: `translateY(${translateY}px)`,
        }}
      >
        <SmallAdCard />
      </div>

      {/* Indicador de progreso de scroll (opcional) */}
      {isVisible && availableSpace > 0 && (
        <div className="absolute right-2 top-4 z-20">
          <div className="bg-black/20 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            Auto
          </div>
        </div>
      )}

      {/* Barra de progreso visual (opcional) */}
      {isVisible && availableSpace > 0 && (
        <div className="absolute left-2 top-4 bottom-4 w-1 bg-gray-200/30 rounded-full z-20">
          <div
            className="w-full bg-red-500/60 rounded-full transition-all duration-200"
            style={{
              height: `${scrollProgress * 100}%`,
            }}
          />
        </div>
      )}

      {/* Contenido adicional si se proporciona */}
      {children}
    </div>
  )
}
