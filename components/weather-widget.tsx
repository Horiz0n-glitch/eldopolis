"use client"

import { useEffect, useState } from "react"
import { Cloud, CloudFog, CloudLightning, CloudRain, CloudSnow, Sun, Wind, Droplets } from "lucide-react"

interface WeatherData {
    temperature: number
    humidity: number
    windSpeed: number
    weatherCode: number
}

export function WeatherWidget() {
    const [data, setData] = useState<WeatherData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    // Coordenadas de Eldorado, Misiones
    const LAT = -26.4061
    const LON = -54.6264

    useEffect(() => {
        async function fetchWeather() {
            try {
                const response = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=America%2FSao_Paulo`
                )
                if (!response.ok) throw new Error("Weather fetch failed")

                const json = await response.json()
                setData({
                    temperature: Math.round(json.current.temperature_2m),
                    humidity: json.current.relative_humidity_2m,
                    windSpeed: Math.round(json.current.wind_speed_10m),
                    weatherCode: json.current.weather_code
                })
            } catch (err) {
                console.error("Error fetching weather:", err)
                setError(true)
            } finally {
                setLoading(false)
            }
        }

        fetchWeather()
    }, [])

    const getWeatherIcon = (code: number) => {
        // Códigos WMO
        if (code === 0) return <Sun className="w-12 h-12 text-yellow-300" /> // Despejado
        if (code >= 1 && code <= 3) return <Cloud className="w-12 h-12 text-slate-200" /> // Nublado
        if (code >= 45 && code <= 48) return <CloudFog className="w-12 h-12 text-slate-300" /> // Niebla
        if (code >= 51 && code <= 67) return <CloudRain className="w-12 h-12 text-blue-200" /> // Lluvia/Llovizna
        if (code >= 71 && code <= 77) return <CloudSnow className="w-12 h-12 text-white" /> // Nieve
        if (code >= 80 && code <= 82) return <CloudRain className="w-12 h-12 text-blue-300 animate-pulse" /> // Lluvia fuerte
        if (code >= 95 && code <= 99) return <CloudLightning className="w-12 h-12 text-yellow-100" /> // Tormenta

        return <Sun className="w-12 h-12 text-yellow-300" />
    }

    const getWeatherDescription = (code: number) => {
        if (code === 0) return "Despejado"
        if (code >= 1 && code <= 3) return "Parcialmente nublado"
        if (code >= 45 && code <= 48) return "Niebla"
        if (code >= 51 && code <= 67) return "Lluvia"
        if (code >= 71 && code <= 77) return "Nieve"
        if (code >= 80 && code <= 82) return "Lluvia intensa"
        if (code >= 95 && code <= 99) return "Tormenta"
        return "Eldorado, MN"
    }

    if (error) {
        // Fallback silencioso en caso de error, mostramos datos genéricos o nada
        return (
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-8 rounded-xl text-white shadow-xl">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <p className="text-sm font-bold opacity-80">Eldorado, MN</p>
                        <h3 className="text-4xl font-black">--°C</h3>
                    </div>
                    <Sun className="w-12 h-12 text-white/50" />
                </div>
                <div className="text-xs font-bold text-center opacity-70">
                    Clima no disponible
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-8 rounded-xl text-white shadow-xl animate-pulse">
                <div className="flex justify-between items-start mb-6">
                    <div className="space-y-3">
                        <div className="h-4 w-24 bg-white/20 rounded"></div>
                        <div className="h-10 w-20 bg-white/20 rounded"></div>
                    </div>
                    <div className="h-12 w-12 bg-white/20 rounded-full"></div>
                </div>
                <div className="flex justify-between mt-4">
                    <div className="h-3 w-20 bg-white/20 rounded"></div>
                    <div className="h-3 w-20 bg-white/20 rounded"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-8 rounded-xl text-white shadow-xl transition-all duration-500 hover:shadow-2xl hover:scale-[1.02]">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <p className="text-sm font-bold opacity-80 flex items-center gap-2">
                        Eldorado, MN
                    </p>
                    <h3 className="text-4xl font-black mt-1 flex items-start gap-1">
                        {data?.temperature}°
                        <span className="text-lg font-medium opacity-60 mt-1">C</span>
                    </h3>
                    <p className="text-xs font-medium opacity-70 mt-1">
                        {data && getWeatherDescription(data.weatherCode)}
                    </p>
                </div>
                <div className="filter drop-shadow-md">
                    {data && getWeatherIcon(data.weatherCode)}
                </div>
            </div>

            <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest border-t border-white/10 pt-4 mt-2">
                <div className="flex items-center gap-1.5" title="Humedad">
                    <Droplets className="w-3.5 h-3.5 opacity-70" />
                    <span>{data?.humidity}%</span>
                </div>
                <div className="flex items-center gap-1.5" title="Velocidad del viento">
                    <Wind className="w-3.5 h-3.5 opacity-70" />
                    <span>{data?.windSpeed} km/h</span>
                </div>
            </div>
        </div>
    )
}
