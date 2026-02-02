"use client"

import { useEffect, useState, useCallback } from "react"
import { DollarSign, RefreshCcw, TrendingUp, TrendingDown, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface CurrencyData {
  compra: number
  venta: number
  fechaActualizacion: string
  nombre: string
  variacion?: number
}

const CURRENCY_API_BASE_URL = "https://dolarapi.com/v1"

export function CurrencyCard() {
  const [currencyData, setCurrencyData] = useState<CurrencyData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/dolar", {
        headers: {
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`)
      }

      const rates = await response.json()

      setCurrencyData([
        { ...rates.oficial, nombre: "Dólar Oficial" },
        { ...rates.blue, nombre: "Dólar Blue" },
        { ...rates.tarjeta, nombre: "Dólar Tarjeta" },
        { ...rates.mep, nombre: "Dólar MEP" },
      ])
      setLastUpdateTime(new Date())
    } catch (error) {
      console.error("Error fetching currency data:", error)
      setError("Hubo un problema al cargar los datos. Por favor, intente nuevamente.")
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30 * 60 * 1000) // Update every 30 minutes
    return () => clearInterval(interval)
  }, [fetchData])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(value)
  }

  const getVariationColor = (variation: number) => {
    if (variation > 0) return "text-red-500"
    if (variation < 0) return "text-green-500"
    return "text-gray-500"
  }

  const getVariationIcon = (variation: number) => {
    if (variation > 0) return <TrendingUp className="h-4 w-4" />
    if (variation < 0) return <TrendingDown className="h-4 w-4" />
    return null
  }

  return (
    <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-4 border border-red-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="flex items-center justify-center w-8 h-8 bg-red-600 rounded-lg mr-2">
            <DollarSign className="h-4 w-4 text-white" />
          </div>
          <h3 className="font-semibold text-gray-800">Cotizaciones</h3>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={fetchData}
                disabled={loading}
                className="h-8 w-8 rounded-full bg-white border-red-200 hover:bg-red-50"
              >
                {loading ? (
                  <Loader2 className="h-3 w-3 animate-spin text-red-600" />
                ) : (
                  <RefreshCcw className="h-3 w-3 text-red-600" />
                )}
                <span className="sr-only">Actualizar cotizaciones</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Actualizar cotizaciones</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {error ? (
        <div className="text-center py-4 text-red-500 text-sm">{error}</div>
      ) : (
        <div className="space-y-3">
          {loading
            ? Array(4)
                .fill(0)
                .map((_, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 border border-red-200 animate-pulse">
                    <div className="flex items-center space-x-3">
                      <div className="h-6 w-6 bg-red-200 rounded"></div>
                      <div className="flex-1">
                        <div className="h-3 bg-red-200 rounded w-20 mb-1"></div>
                        <div className="h-2 bg-red-200 rounded w-32"></div>
                      </div>
                    </div>
                  </div>
                ))
            : currencyData.map((currency) => (
                <div
                  key={currency.nombre}
                  className="bg-white rounded-lg p-3 border border-red-200 hover:border-red-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-6 h-6 bg-red-100 rounded">
                        <DollarSign className="h-3 w-3 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{currency.nombre}</p>
                        <p className="text-xs text-gray-600">
                          C: {formatCurrency(currency.compra)} | V: {formatCurrency(currency.venta)}
                        </p>
                      </div>
                    </div>
                    {currency.variacion !== undefined && (
                      <div className={`flex items-center ${getVariationColor(currency.variacion)}`}>
                        {getVariationIcon(currency.variacion)}
                        <span className="text-xs ml-1">{currency.variacion.toFixed(2)}%</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-red-200">
        <p className="text-xs text-gray-500 text-center">
          Última actualización: {lastUpdateTime ? lastUpdateTime.toLocaleString() : "N/A"}
        </p>
      </div>
    </div>
  )
}
