"use client"

import { useEffect, useState } from "react"

interface ServiceWorkerState {
  isSupported: boolean
  isRegistered: boolean
  isUpdating: boolean
  error: string | null
}

export function ServiceWorkerManager() {
  const [swState, setSwState] = useState<ServiceWorkerState>({
    isSupported: false,
    isRegistered: false,
    isUpdating: false,
    error: null,
  })

  useEffect(() => {
    // Only register service worker in production or when explicitly enabled
    const shouldRegisterSW = process.env.NODE_ENV === "production" || process.env.NEXT_PUBLIC_SW_DEBUG === "true"

    if (!shouldRegisterSW) {
      console.log("Service Worker registration skipped (development mode)")
      return
    }

    if (!("serviceWorker" in navigator)) {
      setSwState((prev) => ({ ...prev, error: "Service Worker not supported" }))
      return
    }

    setSwState((prev) => ({ ...prev, isSupported: true }))

    const registerSW = async () => {
      try {
        // Check if sw.js exists and has correct MIME type
        const swResponse = await fetch("/sw.js", { method: "HEAD" })
        const contentType = swResponse.headers.get("content-type")

        if (!swResponse.ok) {
          throw new Error(`Service Worker file not found (${swResponse.status})`)
        }

        if (!contentType || !contentType.includes("javascript")) {
          throw new Error(`Invalid MIME type: ${contentType}. Expected JavaScript.`)
        }

        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        })

        setSwState((prev) => ({ ...prev, isRegistered: true }))
        console.log("SW registered successfully:", registration.scope)

        // Handle updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing
          if (newWorker) {
            setSwState((prev) => ({ ...prev, isUpdating: true }))
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                setSwState((prev) => ({ ...prev, isUpdating: false }))
                console.log("New version available")
                // Optionally show update notification to user
              }
            })
          }
        })

        // Check for updates every 30 minutes
        setInterval(
          () => {
            registration.update()
          },
          30 * 60 * 1000,
        )
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error"
        setSwState((prev) => ({ ...prev, error: errorMessage }))
        console.error("SW registration failed:", errorMessage)
      }
    }

    registerSW()
  }, [])

  // Debug panel (only in development or when debug is enabled)
  if (process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_SW_DEBUG === "true") {
    return (
      <div className="fixed bottom-4 left-4 bg-black/80 text-white p-3 rounded-lg text-xs max-w-xs z-50">
        <div className="font-bold mb-2">Service Worker Status</div>
        <div>Supported: {swState.isSupported ? "✅" : "❌"}</div>
        <div>Registered: {swState.isRegistered ? "✅" : "❌"}</div>
        <div>Updating: {swState.isUpdating ? "🔄" : "✅"}</div>
        {swState.error && <div className="text-red-400 mt-1">Error: {swState.error}</div>}
      </div>
    )
  }

  return null
}

// Named export
export { ServiceWorkerManager as default }
