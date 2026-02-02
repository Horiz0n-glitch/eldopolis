"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { ScrollToTopProvider } from "@/components/scroll-to-top-provider"
import { DolarHeaderProvider } from "@/components/context/dolar-header-context"

import Footer from "@/components/layout/footer"

import ScrollToTopButton from "@/components/scroll-to-top-button"
import NavigationProgress from "@/components/navigation-progress"
import ServiceWorkerManager from "@/components/service-worker-manager"
import { initializeFirebase } from "@/lib/firebaseClient"

import Header from "@/components/layout/new-navbar/Header"

interface ClientLayoutProps {
  children: React.ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [isFirebaseReady, setIsFirebaseReady] = useState(false)
  const [firebaseError, setFirebaseError] = useState<string | null>(null)

  useEffect(() => {
    const initFirebase = async () => {
      try {
        await initializeFirebase()
        setIsFirebaseReady(true)
        console.log("Firebase initialized successfully")
      } catch (error) {
        console.error("Firebase initialization error:", error)
        setFirebaseError(error instanceof Error ? error.message : "Unknown Firebase error")
        // Continue without Firebase
        setIsFirebaseReady(true)
      }
    }

    initFirebase()
  }, [])

  // Optimización para animaciones fluidas
  useEffect(() => {
    // Configurar CSS custom properties para animaciones más fluidas
    document.documentElement.style.setProperty("--header-transition", "500ms cubic-bezier(0.4, 0, 0.2, 1)")
    document.documentElement.style.setProperty("--dolar-transition", "500ms cubic-bezier(0.4, 0, 0.2, 1)")

    // Optimizar el rendering para animaciones
    const style = document.createElement("style")
    style.textContent = `
      * {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      
      [data-dolar-header], [data-main-header] {
        backface-visibility: hidden;
        perspective: 1000px;
        transform-style: preserve-3d;
      }
      
      @media (prefers-reduced-motion: reduce) {
        [data-dolar-header], [data-main-header] {
          transition: none !important;
          animation: none !important;
        }
      }
    `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  // No bloqueamos el renderizado de children para permitir SSR y mejor SEO.
  // Solo mostramos advertencias si hay errores críticos.

  return (
    <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light" enableSystem={false}>
      <DolarHeaderProvider>
        <ScrollToTopProvider>
          <div className="min-h-screen flex flex-col bg-white">
            {/* Service Worker Manager */}
            <ServiceWorkerManager />




            {/* Navigation Progress */}
            <NavigationProgress />

            {/* Dolar Header */}
            <Header />

            {/* Main Content */}
            <main className="flex-1 relative">{children}</main>

            {/* Footer */}
            <Footer />

            {/* Scroll to Top Button */}
            <ScrollToTopButton />
          </div>
        </ScrollToTopProvider>
      </DolarHeaderProvider>
    </ThemeProvider>
  )
}
