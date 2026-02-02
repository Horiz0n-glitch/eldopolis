"use client"

import { useState, useEffect, useCallback } from "react"
import { getNewsOptimized, getNewsByCategoryOptimized, getNewsByTagOptimized } from "@/lib/firebase-optimized"
import { cacheManager } from "@/lib/cache-manager"
import type { News } from "@/types/news"
import type { DocumentSnapshot } from "firebase/firestore"

interface UseOptimizedNewsReturn {
  news: News[]
  loading: boolean
  error: string | null
  hasMore: boolean
  loadMore: () => void
  refresh: () => void
  lastVisible: DocumentSnapshot | null
}

export function useOptimizedNews(pageSize = 20): UseOptimizedNewsReturn {
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [lastVisible, setLastVisible] = useState<DocumentSnapshot | null>(null)

  const fetchNews = useCallback(
    async (isInitialFetch = false, forceRefresh = false) => {
      try {
        if (isInitialFetch) {
          setLoading(true)
        } else {
          setLoadingMore(true)
        }
        setError(null)

        if (forceRefresh) {
          cacheManager.invalidate("news")
          setLastVisible(null)
        }

        const { news: fetchedNews, lastVisible: newLastVisible } = await getNewsOptimized(
          isInitialFetch || forceRefresh ? undefined : lastVisible,
          pageSize,
        )

        if (isInitialFetch || forceRefresh) {
          setNews(fetchedNews)
        } else {
          setNews((prev) => [...prev, ...fetchedNews])
        }

        setLastVisible(newLastVisible)
        setHasMore(fetchedNews.length === pageSize)
      } catch (err) {
        console.error("Error fetching news:", err)
        setError("Error al cargar noticias")
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [lastVisible, pageSize],
  )

  const loadMore = useCallback(() => {
    if (hasMore && !loadingMore && !loading) {
      fetchNews(false)
    }
  }, [hasMore, loadingMore, loading, fetchNews])

  const refresh = useCallback(() => {
    fetchNews(true, true)
  }, [fetchNews])

  useEffect(() => {
    fetchNews(true)
  }, []) // Solo ejecutar una vez al montar

  return {
    news,
    loading: loading || loadingMore,
    error,
    hasMore,
    loadMore,
    refresh,
    lastVisible,
  }
}

export function useOptimizedCategoryNews(category: string) {
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategoryNews = useCallback(
    async (forceRefresh = false) => {
      try {
        setLoading(true)
        setError(null)

        if (forceRefresh) {
          cacheManager.invalidate(`category_${category.toLowerCase()}`)
        }

        const fetchedNews = await getNewsByCategoryOptimized(category)
        setNews(fetchedNews)
      } catch (err) {
        console.error(`Error fetching ${category} news:`, err)
        setError(`Error al cargar noticias de ${category}`)
      } finally {
        setLoading(false)
      }
    },
    [category],
  )

  const refresh = useCallback(() => {
    fetchCategoryNews(true)
  }, [fetchCategoryNews])

  useEffect(() => {
    if (category) {
      fetchCategoryNews()
    }
  }, [category, fetchCategoryNews])

  return {
    news,
    loading,
    error,
    refresh,
  }
}

export function useOptimizedTagNews(tag: string, pageSize = 20) {
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [lastVisible, setLastVisible] = useState<DocumentSnapshot | null>(null)

  const fetchTagNews = useCallback(
    async (isInitialFetch = false, forceRefresh = false) => {
      try {
        if (isInitialFetch) {
          setLoading(true)
        } else {
          setLoadingMore(true)
        }
        setError(null)

        if (forceRefresh) {
          cacheManager.invalidate(`tag_${tag}`)
          setLastVisible(null)
        }

        const { news: fetchedNews, lastVisible: newLastVisible } = await getNewsByTagOptimized(
          tag,
          isInitialFetch || forceRefresh ? undefined : lastVisible,
          pageSize,
        )

        if (isInitialFetch || forceRefresh) {
          setNews(fetchedNews)
        } else {
          setNews((prev) => [...prev, ...fetchedNews])
        }

        setLastVisible(newLastVisible)
        setHasMore(fetchedNews.length === pageSize)
      } catch (err) {
        console.error(`Error fetching tag ${tag} news:`, err)
        setError(`Error al cargar noticias del tag ${tag}`)
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [tag, lastVisible, pageSize],
  )

  const loadMore = useCallback(() => {
    if (hasMore && !loadingMore && !loading) {
      fetchTagNews(false)
    }
  }, [hasMore, loadingMore, loading, fetchTagNews])

  const refresh = useCallback(() => {
    fetchTagNews(true, true)
  }, [fetchTagNews])

  useEffect(() => {
    if (tag) {
      setNews([])
      setLastVisible(null)
      setHasMore(true)
      fetchTagNews(true)
    }
  }, [tag]) // Solo ejecutar cuando cambie el tag

  return {
    news,
    loading: loading || loadingMore,
    error,
    hasMore,
    loadMore,
    refresh,
    lastVisible,
  }
}

// Hook para prefetching de noticias relacionadas
export function usePrefetchRelated(category?: string, tags?: string[]) {
  useEffect(() => {
    const prefetch = async () => {
      // Prefetch category news
      if (category) {
        setTimeout(() => {
          getNewsByCategoryOptimized(category)
        }, 2000) // Prefetch después de 2 segundos
      }

      // Prefetch tag news
      if (tags && tags.length > 0) {
        setTimeout(() => {
          tags.slice(0, 2).forEach((tag) => {
            getNewsByTagOptimized(tag, undefined, 10)
          })
        }, 3000) // Prefetch después de 3 segundos
      }
    }

    prefetch()
  }, [category, tags])
}
