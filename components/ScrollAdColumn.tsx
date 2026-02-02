"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import SmallAdCard from "./Publi/SmallAdCard"

interface ScrollAdColumnProps {
  children?: React.ReactNode
  speed?: number // Velocidad del movimiento (0.1 a 1.0)
}

export default function ScrollAdColumn({ children, speed = 0.6 }: ScrollAdColumnProps) {
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
        const space = Math.max(0, columnHeight - adHeight - 40) // 40px de margen
        setAvailableSpace(space)
      }
    }

    calculateAvailableSpace()
    window.addEventListener("resize", calculateAvailableSpace)

    const timer = setTimeout(calculateAvailableSpace, 200)

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

      // Verificar si la sección está visible
      const isInView = rect.top < windowHeight && rect.bottom > 0
      setIsVisible(isInView)

      if (isInView) {
        // Calcular progreso más suave basado en la posición de la sección
        const sectionTop = rect.top
        const sectionHeight = rect.height

        // Progreso de 0 a 1 basado en cuánto ha scrolleado la sección
        let progress = 0

        if (sectionTop <= 0) {
          // La sección ya pasó la parte superior de la ventana
          const scrolledPastTop = Math.abs(sectionTop)
          const maxScroll = sectionHeight - windowHeight
          progress = Math.min(1, scrolledPastTop / Math.max(maxScroll, 100))
        } else {
          // La sección aún está entrando en la ventana
          progress = 0
        }

        // Aplicar la velocidad configurada
        setScrollProgress(progress * speed)
      }
    }

    // Usar Intersection Observer para optimizar rendimiento
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            window.addEventListener("scroll", handleScroll, { passive: true })
            handleScroll()
          } else {
            window.removeEventListener("scroll", handleScroll)
            setIsVisible(false)
            setScrollProgress(0)
          }
        })
      },
      {
        rootMargin: "50px 0px",
        threshold: 0.1,
      },
    )

    if (columnRef.current) {
      observer.observe(columnRef.current)
    }

    return () => {
      observer.disconnect()
      window.removeEventListener("scroll", handleScroll)
    }
  }, [speed])

  const translateY = scrollProgress * availableSpace

  return (
    <div ref={columnRef} className="lg:w-1/4 w-full relative min-h-[800px] overflow-hidden">
      {/* Efecto visual de fondo */}
      <div
        className={`absolute inset-0 transition-all duration-700 rounded-lg ${
          isVisible && scrollProgress > 0.1
            ? "bg-gradient-to-b from-blue-50/10 via-transparent to-red-50/10"
            : "bg-transparent"
        }`}
      />

      {/* SmallAdCard con movimiento automático */}
      <div
        ref={adRef}
        className="relative z-10 transition-transform duration-300 ease-out will-change-transform"
        style={{
          transform: `translateY(${translateY}px)`,
        }}
      >
        <SmallAdCard />
      </div>

      {children}
    </div>
  )
}
