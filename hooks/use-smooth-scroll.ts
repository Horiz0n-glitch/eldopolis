"use client"

import { useEffect, useRef, useCallback } from "react"

interface UseSmoothScrollOptions {
  threshold?: number
  onScrollUp?: () => void
  onScrollDown?: () => void
}

export function useSmoothScroll({ threshold = 80, onScrollUp, onScrollDown }: UseSmoothScrollOptions = {}) {
  const lastScrollY = useRef(0)
  const ticking = useRef(false)
  const scrollDirection = useRef<"up" | "down" | null>(null)

  const updateScrollDirection = useCallback(() => {
    const scrollY = window.scrollY

    if (Math.abs(scrollY - lastScrollY.current) < 2) {
      ticking.current = false
      return
    }

    const newDirection = scrollY > lastScrollY.current ? "down" : "up"

    if (newDirection !== scrollDirection.current) {
      if (newDirection === "down" && scrollY > threshold) {
        onScrollDown?.()
        scrollDirection.current = "down"
      } else if (newDirection === "up" && scrollY >= 0) {
        onScrollUp?.()
        scrollDirection.current = "up"
      }
    }

    lastScrollY.current = scrollY
    ticking.current = false
  }, [threshold, onScrollUp, onScrollDown])

  const requestTick = useCallback(() => {
    if (!ticking.current) {
      requestAnimationFrame(updateScrollDirection)
      ticking.current = true
    }
  }, [updateScrollDirection])

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const handleScroll = () => {
      clearTimeout(timeoutId)
      requestTick()

      timeoutId = setTimeout(() => {
        ticking.current = false
      }, 150)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", handleScroll)
      clearTimeout(timeoutId)
    }
  }, [requestTick])

  return { lastScrollY: lastScrollY.current }
}
