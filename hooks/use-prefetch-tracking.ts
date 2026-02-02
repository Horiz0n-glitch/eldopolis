"use client"

import { useEffect, useCallback } from "react"
import { usePathname } from "next/navigation"
import { prefetchManager } from "@/lib/prefetch-manager"

export function usePrefetchTracking() {
  const pathname = usePathname()

  // Track page visits
  useEffect(() => {
    if (pathname.startsWith("/category/")) {
      const category = pathname.split("/")[2]
      prefetchManager.trackUserBehavior("visit_category", { category })
    } else if (pathname.startsWith("/tag/")) {
      const tag = pathname.split("/")[2]
      prefetchManager.trackUserBehavior("visit_tag", { tag })
    }
  }, [pathname])

  // Track scroll behavior
  const trackScroll = useCallback(() => {
    const scrollDepth = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
    prefetchManager.trackUserBehavior("scroll", { depth: scrollDepth })
  }, [])

  // Track reading time
  const trackReadingTime = useCallback((startTime: number) => {
    return () => {
      const readingTime = Date.now() - startTime
      prefetchManager.trackUserBehavior("reading_time", { time: readingTime })
    }
  }, [])

  useEffect(() => {
    window.addEventListener("scroll", trackScroll, { passive: true })
    return () => window.removeEventListener("scroll", trackScroll)
  }, [trackScroll])

  return { trackReadingTime }
}
