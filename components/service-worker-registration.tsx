"use client"

import { useEffect } from "react"

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const registerSW = async () => {
        try {
          const registration = await navigator.serviceWorker.register("/sw.js", {
            scope: "/",
            // Update immediately, do not wait for cache
          })

          // Force update check on load
          registration.update();

          console.log("[SW] Registration successful with scope:", registration.scope)

          // Detect new service worker installation
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    // New content is available; force refresh.
                    console.log("[SW] New version found. Reloading...");
                    // Optional: You could show a toast here instead of auto-reloading
                    // but for this issue we want to force the new version.
                    // We must ensure the new SW takes control.
                    // The SW should call skipWaiting() in its install/activate phase (already doing that).
                    // We just need to reload the page once the controller changes.
                  } else {
                    console.log("[SW] Content is cached for offline use.");
                  }
                }
              };
            }
          };
        } catch (error) {
          console.error("[SW] Registration failed:", error)
        }
      }

      // Handle controller change (when new SW takes over)
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });

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
