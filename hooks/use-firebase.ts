"use client"

import { useEffect, useState } from "react"
import {
  getNews as fetchNews,
  getNewsById as fetchNewsById,
  getNewsByCategory as fetchNewsByCategory,
} from "@/lib/firebase"
import type { News } from "@/types/news"

export function useNews() {
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadNews = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchNews()
        setNews(data as News[])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading news")
        console.error("Error in useNews:", err)
      } finally {
        setLoading(false)
      }
    }

    loadNews()
  }, [])

  return { news, loading, error }
}

export function useNewsById(id: string) {
  const [news, setNews] = useState<News | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    const loadNews = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchNewsById(id)
        setNews(data as News)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading news")
        console.error("Error in useNewsById:", err)
      } finally {
        setLoading(false)
      }
    }

    loadNews()
  }, [id])

  return { news, loading, error }
}

export function useNewsByCategory(category: string) {
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadNews = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchNewsByCategory(category)
      setNews(data as News[])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading news")
      console.error("Error in useNewsByCategory:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!category) return

    loadNews()
  }, [category])

  return { news, loading, error, refetch: loadNews }
}
