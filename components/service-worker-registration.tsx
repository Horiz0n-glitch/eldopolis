"use client"

import { useEffect } from "react"

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      // Registrar Service Worker solo en producción
      const registerSW = async () => {
        try {
          const registration = await navigator.serviceWorker.register("/sw.js", {
            scope: "/",
            updateViaCache: "none", // Siempre verificar actualizaciones
          })

          console.log("[SW] Registration successful:", registration.scope)

          // Manejar actualizaciones del Service Worker
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  // Nueva versión disponible
                  console.log("[SW] New version available")
                  // Opcional: mostrar notificación al usuario
                }
              })
            }
          })

          // Programar limpieza de caché cada 24 horas
          setInterval(
            () => {
              if (registration.active) {
                registration.active.postMessage({ type: "CLEANUP_CACHE" })
              }
            },
            24 * 60 * 60 * 1000,
          )

          // Limpiar caché al cargar la página si han pasado más de 24 horas
          const lastCleanup = localStorage.getItem("sw-last-cleanup")
          const now = Date.now()
          if (!lastCleanup || now - Number.parseInt(lastCleanup) > 24 * 60 * 60 * 1000) {
            registration.active?.postMessage({ type: "CLEANUP_CACHE" })
            localStorage.setItem("sw-last-cleanup", now.toString())
          }
        } catch (error) {
          console.error("[SW] Registration failed:", error)
        }
      }

      // Registrar cuando la página esté completamente cargada
      if (document.readyState === "complete") {
        registerSW()
      } else {
        window.addEventListener("load", registerSW)
        return () => window.removeEventListener("load", registerSW)
      }
    }
  }, [])

  return null // Este componente no renderiza nada
}
