"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { useScrollToTopContext } from "./scroll-to-top-provider"

interface PageTransitionProps {
  children: React.ReactNode
  enableTransition?: boolean
  transitionDuration?: number
}

export default function PageTransition({
  children,
  enableTransition = true,
  transitionDuration = 300,
}: PageTransitionProps) {
  const pathname = usePathname()
  const { isScrolling } = useScrollToTopContext()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [displayChildren, setDisplayChildren] = useState(children)

  useEffect(() => {
    if (!enableTransition) {
      setDisplayChildren(children)
      return
    }

    setIsTransitioning(true)

    const timer = setTimeout(() => {
      setDisplayChildren(children)
      setIsTransitioning(false)
    }, transitionDuration / 2)

    return () => clearTimeout(timer)
  }, [pathname, children, enableTransition, transitionDuration])

  if (!enableTransition) {
    return <>{children}</>
  }

  return (
    <div
      className={`transition-opacity duration-${transitionDuration} ${
        isTransitioning || isScrolling ? "opacity-0" : "opacity-100"
      }`}
    >
      {displayChildren}
    </div>
  )
}
