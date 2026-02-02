"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { TrendingUp, TrendingDown, RefreshCw, Loader2, DollarSign, ChevronDown, Activity } from "lucide-react"
import { useDolarHeader } from "@/components/context/dolar-header-context"
import { useSmoothScroll } from "@/hooks/use-smooth-scroll"

interface DolarData {
  compra: number
  venta: number
  fecha: string
  variacion: number
}

interface CurrencyRates {
  oficial: DolarData
  blue: DolarData
  mep: DolarData
  ccl: DolarData
}

// Cache global para evitar múltiples llamadas
let globalCache: { data: CurrencyRates | null; timestamp: number } = { data: null, timestamp: 0 }
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutos

export default function DolarHeader() {
  const [rates, setRates] = useState<CurrencyRates | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const { isVisible, setIsVisible } = useDolarHeader()
  const fetchingRef = useRef(false)
  const retryCountRef = useRef(0)
  const maxRetries = 3

  useSmoothScroll({
    threshold: 60,
    onScrollDown: () => {
      setIsVisible(false)
      setIsExpanded(false)
    },
    onScrollUp: () => {
      setIsVisible(true)
    },
  })

  useEffect(() => {
    const dolarHeader = document.querySelector("[data-dolar-header]")
    if (dolarHeader) {
      dolarHeader.style.willChange = isVisible ? "auto" : "transform, opacity"
      dolarHeader.style.backfaceVisibility = "hidden"
      dolarHeader.style.perspective = "1000px"
    }
  }, [isVisible])

  const fetchRates = async (forceRefresh = false) => {
    if (fetchingRef.current && !forceRefresh) return

    const now = Date.now()
    if (!forceRefresh && globalCache.data && now - globalCache.timestamp < CACHE_DURATION) {
      setRates(globalCache.data)
      setLastUpdate(new Date(globalCache.timestamp))
      setLoading(false)
      setError(null)
      return
    }

    fetchingRef.current = true

    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/dolar", {
        headers: {
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(10000),
      })

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`)
      }

      const transformedRates: CurrencyRates = await response.json()

      if (!transformedRates || typeof transformedRates !== "object") {
        throw new Error("Datos inválidos recibidos del servidor")
      }

      if (transformedRates.oficial.venta > 0 || transformedRates.blue.venta > 0) {
        globalCache = { data: transformedRates, timestamp: now }
        setRates(transformedRates)
        setLastUpdate(new Date())
        retryCountRef.current = 0
      } else {
        throw new Error("Datos de cotización no disponibles")
      }

      setError(null)
    } catch (err) {
      console.error("Error fetching rates:", err)

      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++
        setTimeout(() => {
          fetchRates(forceRefresh)
        }, 2000 * retryCountRef.current)
        return
      }

      if (globalCache.data) {
        setRates(globalCache.data)
        setLastUpdate(new Date(globalCache.timestamp))
        setError("Usando datos anteriores")
      } else {
        setError("Error al cargar cotizaciones")
      }
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
  }

  useEffect(() => {
    fetchRates()
    const interval = setInterval(() => fetchRates(), 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const formatCurrency = (value: number) => {
    if (value === 0) return "N/A"
    return `$${value.toFixed(2)}`
  }

  const getVariationColor = (venta: number, compra: number) => {
    if (venta > compra) return "text-emerald-400"
    if (venta < compra) return "text-rose-400"
    return "text-slate-400"
  }

  const getVariationIcon = (venta: number, compra: number) => {
    if (venta > compra) return <TrendingUp className="h-3 w-3" />
    if (venta < compra) return <TrendingDown className="h-3 w-3" />
    return null
  }

  const refreshRates = () => {
    if (!fetchingRef.current) {
      retryCountRef.current = 0
      fetchRates(true)
    }
  }

  if (loading && !rates) {
    return (
      <div
        className={`w-full bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 border-b border-slate-700 shadow-lg transition-transform duration-300 ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="flex items-center justify-center w-full py-2 px-4">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
            <span className="text-sm font-medium text-slate-300">Cargando cotizaciones...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error && !rates) {
    return (
      <div
        className={`w-full bg-gradient-to-r from-red-900 via-red-800 to-red-900 border-b border-red-700 transition-transform duration-300 ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="flex items-center justify-center w-full py-2 px-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-red-200">{error}</span>
            <button
              onClick={refreshRates}
              disabled={loading || fetchingRef.current}
              className="ml-2 p-1 hover:bg-red-700 rounded-full transition-colors disabled:opacity-50"
              aria-label="Reintentar"
            >
              <RefreshCw className={`h-3 w-3 text-red-300 ${loading || fetchingRef.current ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!rates) return null

  return (
    <div
      data-dolar-header
      className={`w-full overflow-x-hidden bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 border-b border-slate-700 shadow-lg backdrop-blur-sm transition-all duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] will-change-transform ${
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}
      style={{
        transform: `translate3d(0, ${isVisible ? "0" : "-100%"}, 0)`,
        transition:
          "transform 700ms cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      }}
    >
      {/* Error banner discreto */}
      {error && (
        <div className="w-full bg-amber-900/60 border-b border-amber-700/40 px-4 py-1 transition-all duration-300 ease-out overflow-x-hidden">
          <div className="flex items-center justify-center w-full">
            <span className="text-xs text-amber-200 font-medium truncate">{error}</span>
          </div>
        </div>
      )}

      {/* Desktop Version */}
      <div className="hidden lg:block py-2.5 px-4 overflow-x-hidden">
        <div className="flex items-center justify-between w-full max-w-none min-w-0">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-blue-600/20 rounded-lg border border-blue-500/30 transition-all duration-300 ease-out hover:bg-blue-600/30 hover:scale-105">
                <DollarSign className="h-4 w-4 text-blue-400" />
              </div>
              <span className="text-sm font-semibold text-slate-200 tracking-wide">Cotizaciones</span>
            </div>

            <div className="flex items-center space-x-5">
              {[
                { key: "oficial", label: "Oficial", color: "blue", data: rates.oficial },
                { key: "blue", label: "Blue", color: "emerald", data: rates.blue },
                { key: "mep", label: "MEP", color: "amber", data: rates.mep },
                { key: "ccl", label: "CCL", color: "violet", data: rates.ccl },
              ].map(({ key, label, color, data }) => (
                <div key={key} className="group">
                  <div className="flex items-center space-x-2 mb-0.5">
                    <span
                      className={`text-xs font-bold text-${color}-400 uppercase tracking-wider transition-colors duration-200`}
                    >
                      {label}
                    </span>
                    {data.venta !== data.compra && (
                      <div
                        className={`flex items-center ${getVariationColor(data.venta, data.compra)} opacity-75 transition-all duration-300`}
                      >
                        {getVariationIcon(data.venta, data.compra)}
                      </div>
                    )}
                  </div>
                  <div className="text-xs font-bold text-white bg-slate-800/60 px-2 py-1 rounded-md border border-slate-600/50 group-hover:bg-slate-700/60 group-hover:scale-105 group-hover:shadow-lg transition-all duration-300 ease-out backdrop-blur-sm">
                    {formatCurrency(data.venta)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <Activity className="h-3 w-3" />
              <span className="font-medium">
                {lastUpdate
                  ? lastUpdate.toLocaleTimeString("es-AR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "N/A"}
              </span>
              <button
                onClick={refreshRates}
                disabled={loading || fetchingRef.current}
                className="ml-1 p-1.5 hover:bg-slate-700 rounded-full transition-all duration-300 ease-out disabled:opacity-50 hover:scale-110 active:scale-95"
                aria-label="Actualizar cotizaciones"
              >
                <RefreshCw
                  className={`h-3 w-3 text-slate-400 transition-transform duration-300 ${loading || fetchingRef.current ? "animate-spin" : "hover:rotate-180"}`}
                />
              </button>
            </div>

            <Link
              href="https://streaminglocucionar.com/portal/?p=16127"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-2 rounded-full transition-all duration-400 ease-out hover:scale-105 hover:shadow-xl hover:shadow-red-500/25 group text-xs font-bold uppercase tracking-wider active:scale-95"
            >
              <div className="w-2 h-2 bg-white rounded-full animate-pulse group-hover:animate-bounce"></div>
              <span className="group-hover:text-red-50">EN VIVO</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Tablet Version */}
      <div className="hidden md:block lg:hidden py-2.5 px-4 overflow-x-hidden">
        <div className="flex items-center justify-between w-full min-w-0">
          <div className="flex items-center space-x-4">
            <div className="p-1.5 bg-blue-600/20 rounded-lg border border-blue-500/30">
              <DollarSign className="h-4 w-4 text-blue-400" />
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {[
                { label: "OFICIAL", value: rates.oficial.venta, color: "text-blue-400" },
                { label: "BLUE", value: rates.blue.venta, color: "text-emerald-400" },
                { label: "MEP", value: rates.mep.venta, color: "text-amber-400" },
                { label: "CCL", value: rates.ccl.venta, color: "text-violet-400" },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  className="text-xs bg-slate-800/60 px-2 py-1 rounded-md border border-slate-600/50 backdrop-blur-sm"
                >
                  <span className={`font-bold ${color}`}>{label}:</span>
                  <span className="text-white font-bold ml-1">{formatCurrency(value)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={refreshRates}
              disabled={loading || fetchingRef.current}
              className="p-1.5 hover:bg-slate-700 rounded-full transition-colors disabled:opacity-50"
              aria-label="Actualizar"
            >
              <RefreshCw className={`h-3 w-3 text-slate-400 ${loading || fetchingRef.current ? "animate-spin" : ""}`} />
            </button>
            <Link
              href="https://streaminglocucionar.com/portal/?p=16127"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-3 py-1.5 rounded-full transition-all duration-200 text-xs font-bold uppercase"
            >
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
              <span>EN VIVO</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Version */}
      <div className="md:hidden overflow-x-hidden">
        <div
          className="flex items-center justify-between py-2.5 px-3 cursor-pointer hover:bg-slate-800/60 transition-all duration-300 ease-out active:bg-slate-800/80 min-w-0"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="p-1.5 bg-blue-600/20 rounded-lg border border-blue-500/30 flex-shrink-0">
              <DollarSign className="h-4 w-4 text-blue-400" />
            </div>
            <div className="flex items-center space-x-2 flex-1 min-w-0 overflow-x-hidden">
              <div className="text-xs bg-blue-900/40 px-2 py-1 rounded-md border border-blue-600/30 flex-shrink-0">
                <span className="text-blue-400 font-bold">Oficial:</span>
                <span className="text-white font-bold ml-1">{formatCurrency(rates.oficial.venta)}</span>
              </div>
              <div className="text-xs bg-emerald-900/40 px-2 py-1 rounded-md border border-emerald-600/30 flex-shrink-0">
                <span className="text-emerald-400 font-bold">Blue:</span>
                <span className="text-white font-bold ml-1">{formatCurrency(rates.blue.venta)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0">
            <Link
              href="https://streaminglocucionar.com/portal/?p=16127"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 bg-gradient-to-r from-red-600 to-red-700 text-white px-2 py-1 rounded-full transition-all duration-300 ease-out hover:scale-105 active:scale-95 text-xs font-bold uppercase"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
              <span>VIVO</span>
            </Link>
            <ChevronDown
              className={`h-4 w-4 text-slate-400 transition-transform duration-400 ease-out ${isExpanded ? "rotate-180" : ""}`}
            />
          </div>
        </div>

        {/* Expandable Content */}
        <div
          className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
            isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-3 pb-3 border-t border-slate-700 bg-slate-800/30 overflow-x-hidden">
            <div className="grid grid-cols-2 gap-2 mt-3">
              {[
                { key: "oficial", label: "Oficial", color: "blue", data: rates.oficial },
                { key: "blue", label: "Blue", color: "emerald", data: rates.blue },
                { key: "mep", label: "MEP", color: "amber", data: rates.mep },
                { key: "ccl", label: "CCL", color: "violet", data: rates.ccl },
              ].map(({ key, label, color, data }) => (
                <div
                  key={key}
                  className={`bg-slate-800/60 rounded-lg p-3 border border-${color}-600/30 shadow-sm backdrop-blur-sm`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-bold text-${color}-400 uppercase tracking-wider`}>{label}</span>
                    {data.venta !== data.compra && (
                      <div className={`flex items-center ${getVariationColor(data.venta, data.compra)}`}>
                        {getVariationIcon(data.venta, data.compra)}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-slate-300">
                      <span className="font-medium">Compra:</span>
                      <span className="font-bold text-white ml-1">{formatCurrency(data.compra)}</span>
                    </div>
                    <div className="text-xs text-slate-300">
                      <span className="font-medium">Venta:</span>
                      <span className="font-bold text-white ml-1">{formatCurrency(data.venta)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-700">
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <Activity className="h-3 w-3" />
                <span className="font-medium">
                  {lastUpdate
                    ? lastUpdate.toLocaleTimeString("es-AR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "N/A"}
                </span>
              </div>
              <button
                onClick={refreshRates}
                disabled={loading || fetchingRef.current}
                className="p-1.5 hover:bg-slate-700 rounded-full transition-colors disabled:opacity-50"
                aria-label="Actualizar"
              >
                <RefreshCw
                  className={`h-3 w-3 text-slate-400 ${loading || fetchingRef.current ? "animate-spin" : ""}`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
