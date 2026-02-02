"use client"

import { useState, useEffect } from "react"
import { ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useScrollToTopContext } from "./scroll-to-top-provider"

interface ScrollToTopButtonProps {
  className?: string
  size?: "sm" | "md" | "lg"
  variant?: "default" | "outline" | "ghost"
  position?: "bottom-right" | "bottom-left" | "bottom-center"
  showThreshold?: number
}

export default function ScrollToTopButton({
  className = "",
  size = "md",
  variant = "default",
  position = "bottom-right",
  showThreshold = 400,
}: ScrollToTopButtonProps) {
  const { scrollToTop, isScrolling } = useScrollToTopContext()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      setIsVisible(scrollTop > showThreshold)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll() // Check initial position

    return () => window.removeEventListener("scroll", handleScroll)
  }, [showThreshold])

  const positionClasses = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
    "bottom-center": "bottom-6 left-1/2 transform -translate-x-1/2",
  }

  const sizeClasses = {
    sm: "h-10 w-10",
    md: "h-12 w-12",
    lg: "h-14 w-14",
  }

  if (!isVisible) return null

  return (
    <Button
      onClick={() => scrollToTop("smooth")}
      variant={variant}
      size="icon"
      disabled={isScrolling}
      className={`
        fixed z-50 shadow-lg hover:shadow-xl transition-all duration-300
        ${positionClasses[position]}
        ${sizeClasses[size]}
        ${isScrolling ? "opacity-50 cursor-not-allowed" : "opacity-90 hover:opacity-100"}
        ${variant === "default" ? "bg-red-600 hover:bg-red-700 text-white" : ""}
        ${className}
      `}
      aria-label="Volver arriba"
    >
      <ChevronUp className={`${size === "sm" ? "h-4 w-4" : size === "md" ? "h-5 w-5" : "h-6 w-6"}`} />
    </Button>
  )
}
