"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

interface ScrollToTopOptions {
  behavior?: "smooth" | "instant" | "auto"
  delay?: number
  offset?: number
  excludePaths?: string[]
  onlyOnRouteChange?: boolean
}

export function useScrollToTop(options: ScrollToTopOptions = {}) {
  const pathname = usePathname()
  const { behavior = "smooth", delay = 0, offset = 0, excludePaths = [], onlyOnRouteChange = true } = options

  useEffect(() => {
    // Verificar si la ruta actual debe ser excluida
    const shouldExclude = excludePaths.some((path) => pathname.includes(path))
    if (shouldExclude) return

    const scrollToTop = () => {
      window.scrollTo({
        top: offset,
        left: 0,
        behavior: behavior,
      })
    }

    if (delay > 0) {
      const timer = setTimeout(scrollToTop, delay)
      return () => clearTimeout(timer)
    } else {
      scrollToTop()
    }
  }, [pathname, behavior, delay, offset, excludePaths])

  // Función manual para scroll to top
  const scrollToTop = (customBehavior?: "smooth" | "instant") => {
    window.scrollTo({
      top: offset,
      left: 0,
      behavior: customBehavior || behavior,
    })
  }

  return { scrollToTop }
}
