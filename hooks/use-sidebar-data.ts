"use client"

import { useState, useEffect } from "react"

interface TrendingTopic {
  title: string
  count: number
  trend: "up" | "down" | "stable"
}

interface RecentNews {
  id: number
  title: string
  time: string
  views: number
  category: string
}

interface WeatherData {
  current: {
    temp: number
    condition: string
    humidity: number
    wind: number
    feelsLike: number
  }
  forecast: Array<{
    day: string
    temp: number
    condition: string
  }>
}

export function useSidebarData() {
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([])
  const [recentNews, setRecentNews] = useState<RecentNews[]>([])
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular carga de datos
    const loadData = async () => {
      try {
        // En una implementación real, estos serían llamadas a APIs
        const mockTrending: TrendingTopic[] = [
          { title: "Elecciones 2024", count: 1250, trend: "up" },
          { title: "Copa América", count: 890, trend: "up" },
          { title: "Inflación Argentina", count: 756, trend: "down" },
          { title: "Tecnología IA", count: 623, trend: "up" },
          { title: "Cambio Climático", count: 445, trend: "stable" },
        ]

        const mockNews: RecentNews[] = [
          {
            id: 1,
            title: "Nueva medida económica anunciada por el gobierno",
            time: "hace 15 min",
            views: 1250,
            category: "Economía",
          },
          {
            id: 2,
            title: "Resultado del partido de la selección nacional",
            time: "hace 32 min",
            views: 2100,
            category: "Deporte",
          },
          {
            id: 3,
            title: "Avances en tecnología médica local",
            time: "hace 1 hora",
            views: 890,
            category: "Sociedad",
          },
        ]

        const mockWeather: WeatherData = {
          current: {
            temp: 25,
            condition: "Soleado",
            humidity: 65,
            wind: 12,
            feelsLike: 28,
          },
          forecast: [
            { day: "Mañana", temp: 27, condition: "Parcialmente nublado" },
            { day: "Miércoles", temp: 23, condition: "Lluvia" },
            { day: "Jueves", temp: 26, condition: "Soleado" },
          ],
        }

        // Simular delay de red
        await new Promise((resolve) => setTimeout(resolve, 1000))

        setTrendingTopics(mockTrending)
        setRecentNews(mockNews)
        setWeatherData(mockWeather)
      } catch (error) {
        console.error("Error loading sidebar data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  return {
    trendingTopics,
    recentNews,
    weatherData,
    loading,
  }
}
