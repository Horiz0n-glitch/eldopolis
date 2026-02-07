import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, type Firestore } from "firebase/firestore"
import { getAnalytics, type Analytics } from "firebase/analytics"

let app: FirebaseApp | null = null
let db: Firestore | null = null
let analytics: Analytics | null = null

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

export function initializeFirebase() {
  try {
    // Validate required config
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      console.warn("Firebase configuration incomplete")
      return { app: null, db: null, analytics: null }
    }

    // Initialize only once
    if (!app) {
      app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

      // Habilitar persistencia de caché local
      db = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager()
        })
      })

      // Initialize analytics only in browser and production
      if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
        try {
          analytics = getAnalytics(app)
        } catch (error) {
          console.warn("Analytics initialization failed:", error)
        }
      }

      console.log("Firebase initialized successfully with PERSISTENCE")
    }

    return { app, db, analytics }
  } catch (error) {
    console.error("Firebase initialization error:", error)
    return { app: null, db: null, analytics: null }
  }
}

export function getFirebaseApp() {
  return app
}

export function getFirebaseDb() {
  return db
}

export function getFirebaseAnalytics() {
  return analytics
}
