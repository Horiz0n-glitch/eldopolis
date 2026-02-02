import { initializeApp, getApps } from "firebase/app"
import { getFirestore, doc, getDoc, setDoc, deleteDoc, collection, query, where, getDocs } from "firebase/firestore"
import type { SEOData } from "./seo-utils"

// Configuración de Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Inicializar Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const db = getFirestore(app)

// Cache en memoria para evitar múltiples consultas a Firestore
const memoryCache = new Map<string, { data: SEOData; timestamp: number; expiresAt: number }>()
const MEMORY_CACHE_TTL = 20 * 60 * 1000 // 20 minutos en memoria
const FIRESTORE_CACHE_TTL = 48 * 60 * 60 * 1000 // 48 horas en Firestore

class SEOCacheManager {
  private collectionName = "seo_cache"

  // Método genérico para obtener cache
  async get(type: "news" | "category" | "tag", id: string, timestamp?: string | number): Promise<SEOData | null> {
    try {
      const cacheKey = type === "news" ? `${id}-${timestamp}` : `${type}-${id}`

      // 1. Verificar cache en memoria
      const memoryEntry = memoryCache.get(cacheKey)
      if (memoryEntry && Date.now() < memoryEntry.expiresAt) {
        return memoryEntry.data
      }

      // 2. Verificar cache en Firestore
      const docRef = doc(db, this.collectionName, cacheKey)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const data = docSnap.data()
        const entryExpiresAt = data.expiresAt || 0

        if (Date.now() < entryExpiresAt) {
          const seoData = data.seoData as SEOData

          // Guardar en memoria
          memoryCache.set(cacheKey, {
            data: seoData,
            timestamp: data.timestamp || Date.now(),
            expiresAt: Date.now() + MEMORY_CACHE_TTL
          })

          return seoData
        } else {
          await deleteDoc(docRef)
        }
      }
      return null
    } catch (error) {
      console.error(`Error in seoCache.get (${type}):`, error)
      return null
    }
  }

  // Método genérico para guardar cache
  async set(type: "news" | "category" | "tag", id: string, seoData: SEOData, timestamp?: string | number): Promise<void> {
    try {
      const cacheKey = type === "news" ? `${id}-${timestamp}` : `${type}-${id}`
      const now = Date.now()

      // 1. Guardar en Firestore
      const docRef = doc(db, this.collectionName, cacheKey)
      await setDoc(docRef, {
        type,
        id,
        timestamp: timestamp || now,
        seoData,
        createdAt: now,
        expiresAt: now + FIRESTORE_CACHE_TTL
      })

      // 2. Guardar en memoria
      memoryCache.set(cacheKey, {
        data: seoData,
        timestamp: timestamp ? (typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime()) : now,
        expiresAt: now + MEMORY_CACHE_TTL
      })
    } catch (error) {
      console.error(`Error in seoCache.set (${type}):`, error)
    }
  }

  // Métodos de compatibilidad y específicos
  async getCachedSEO(newsId: string, newsTimestamp: string | number): Promise<SEOData | null> {
    return this.get("news", newsId, newsTimestamp)
  }

  async cacheSEO(newsId: string, newsTimestamp: string | number, seoData: SEOData): Promise<void> {
    return this.set("news", newsId, seoData, newsTimestamp)
  }

  async invalidateNews(newsId: string): Promise<void> {
    try {
      // Limpiar memoria
      for (const key of memoryCache.keys()) {
        if (key.startsWith(newsId)) {
          memoryCache.delete(key)
        }
      }

      // Limpiar Firestore
      const q = query(collection(db, this.collectionName), where("id", "==", newsId), where("type", "==", "news"))
      const querySnapshot = await getDocs(q)
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref))
      await Promise.all(deletePromises)

      console.log(`🗑️ SEO Cache invalidated for news: ${newsId}`)
    } catch (error) {
      console.error("Error invalidating news cache:", error)
    }
  }

  async invalidateCategory(category: string): Promise<void> {
    try {
      const cacheKey = `category-${category}`
      memoryCache.delete(cacheKey)
      const docRef = doc(db, this.collectionName, cacheKey)
      await deleteDoc(docRef)
      console.log(`🗑️ SEO Cache invalidated for category: ${category}`)
    } catch (error) {
      console.error("Error invalidating category cache:", error)
    }
  }

  // Limpiar cache expirado
  async cleanExpiredCache(): Promise<void> {
    try {
      const now = Date.now()
      for (const [key, entry] of memoryCache.entries()) {
        if (now > entry.expiresAt) memoryCache.delete(key)
      }

      // Firestore clean up (ejecutar ocasionalmente)
      // En una implementación real, esto podría ser una Cloud Function
    } catch (error) {
      console.error("Error cleaning expired cache:", error)
    }
  }

  async getCacheStats(): Promise<{ memoryEntries: number; memorySize: string }> {
    return {
      memoryEntries: memoryCache.size,
      memorySize: `${(JSON.stringify(Array.from(memoryCache.entries())).length / 1024).toFixed(2)} KB`
    }
  }

  async clearAllCache(): Promise<void> {
    memoryCache.clear()
    // Limpiar toda la colección de Firestore si es necesario
  }
}

// Instancia singleton
export const seoCache = new SEOCacheManager()

// Limpiar cache expirado cada 60 minutos
if (typeof window === "undefined") {
  setInterval(() => {
    seoCache.cleanExpiredCache().catch(console.error)
  }, 60 * 60 * 1000)
}
