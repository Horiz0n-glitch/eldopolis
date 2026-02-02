"use client"

import type React from "react"
import { createContext, useContext, useCallback, useRef } from "react"
import { usePathname } from "next/navigation"
import { useEffect } from "react"

interface ScrollToTopContextType {
  scrollToTop: () => void
  scrollToElement: (elementId: string) => void
}

const ScrollToTopContext = createContext<ScrollToTopContextType | undefined>(undefined)

export function useScrollToTopContext(): ScrollToTopContextType {
  const context = useContext(ScrollToTopContext)
  if (!context) {
    throw new Error("useScrollToTopContext must be used within a ScrollToTopProvider")
  }
  return context
}

// Alias for backward compatibility
export const useScrollToTop = useScrollToTopContext

interface ScrollToTopProviderProps {
  children: React.ReactNode
}

export function ScrollToTopProvider({ children }: ScrollToTopProviderProps) {
  const pathname = usePathname()
  const scrollTimeoutRef = useRef<NodeJS.Timeout>()

  const scrollToTop = useCallback(() => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }

    scrollTimeoutRef.current = setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      })
    }, 100)
  }, [])

  const scrollToElement = useCallback((elementId: string) => {
    const element = document.getElementById(elementId)
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  }, [])

  // Auto scroll to top on route change
  useEffect(() => {
    scrollToTop()
  }, [pathname, scrollToTop])

  const value = {
    scrollToTop,
    scrollToElement,
  }

  return <ScrollToTopContext.Provider value={value}>{children}</ScrollToTopContext.Provider>
}

// Default export for compatibility
export default ScrollToTopProvider
