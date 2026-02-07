import { db as configDb } from "./firebaseConfig"
import {
  Firestore,
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore"

// Re-export db from firebaseConfig to ensure singleton instance with persistence settings
export const db = configDb as Firestore

// ✅ Traer noticias generales ordenadas por fecha descendente
export const getNews = async () => {
  try {
    const newsCollection = collection(db, "news")
    const newsSnapshot = await getDocs(
      query(newsCollection, orderBy("date", "desc"), limit(50))
    )
    return newsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error("Error fetching news:", error)
    return []
  }
}

// ✅ Obtener una noticia por ID
export const getNewsById = async (id: string) => {
  try {
    const newsDoc = doc(db, "news", id)
    const newsSnapshot = await getDoc(newsDoc)
    if (newsSnapshot.exists()) {
      return { id: newsSnapshot.id, ...newsSnapshot.data() }
    }
    return null
  } catch (error) {
    console.error("Error fetching news by id:", error)
    return null
  }
}

// ⚠️ Método de fallback: sin índice en Firestore (se ordena en cliente)
export const getNewsByCategory = async (category: string) => {
  try {
    const newsCollection = collection(db, "news")
    const categoryQuery = query(
      newsCollection,
      where("mainCategory", "==", category),
      limit(50)
    )
    const newsSnapshot = await getDocs(categoryQuery)

    // Ordenar en cliente por campo `date` descendente
    const newsData = newsSnapshot.docs
      .map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          _parsedDate: new Date(data.date || 0),
        }
      })
      .sort((a, b) => b._parsedDate.getTime() - a._parsedDate.getTime())
      .map(({ _parsedDate, ...rest }) => rest)

    return newsData
  } catch (error) {
    console.error("Error fetching news by category:", error)
    return []
  }
}

// ✅ Noticias destacadas (por featuredType) ordenadas por fecha
export const getFeaturedNews = async () => {
  try {
    const newsCollection = collection(db, "news")
    const featuredQuery = query(
      newsCollection,
      where("featuredType", "in", ["cover", "featured1", "featured2", "featured3"]),
      limit(50)
    )
    const newsSnapshot = await getDocs(featuredQuery)

    return newsSnapshot.docs
      .map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          _parsedDate: new Date(data.date || 0),
        }
      })
      .sort((a, b) => b._parsedDate.getTime() - a._parsedDate.getTime())
      .map(({ _parsedDate, ...rest }) => rest)
  } catch (error) {
    console.error("Error fetching featured news:", error)
    return []
  }
}


// ✅ Corrección final con categoría capitalizada
export const getNewsByCategoryWithIndex = async (category: string) => {
  try {
    const newsCollection = collection(db, "news")
    const categoryQuery = query(
      newsCollection,
      where("mainCategory", "==", category), // sin .toLowerCase()
      orderBy("date", "desc"),
      limit(50)
    )
    const newsSnapshot = await getDocs(categoryQuery)

    return newsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error("Error fetching news by category (with index):", error)
    return []
  }
}
