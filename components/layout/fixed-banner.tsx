"use client"

import Image from "next/image"
import { X, ChevronUp, ChevronDown, Calendar, Music, MapPin, Users, Clock, Expand } from "lucide-react"
import { useBannerVisibility } from "@/hooks/use-banner-visibility"
import { useEventCountdown } from "@/hooks/use-event-countdown"
import { useState } from "react"

export default function FixedBanner() {
  const { isVisible, isMounted, closeBanner, isMinimized, toggleMinimize } = useBannerVisibility()
  const { timeLeft, isEventPassed } = useEventCountdown()
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)

  // No renderizar si no está montado, no es visible, o el evento ya pasó
  if (!isMounted || !isVisible || isEventPassed) {
    return null
  }

  const openImageModal = () => {
    setIsImageModalOpen(true)
  }

  const closeImageModal = () => {
    setIsImageModalOpen(false)
  }

  return (
    <>
      {/* Modal de imagen */}
      {isImageModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={closeImageModal}>
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <button
              onClick={closeImageModal}
              className="absolute -top-12 right-0 bg-white/20 hover:bg-white/30 text-white rounded-full p-2 z-50 transition-colors duration-200"
              aria-label="Cerrar imagen"
            >
              <X size={24} />
            </button>
            <div className="relative w-full h-[80vh] rounded-lg overflow-hidden">
              <Image
                src="/images/banner-lateral.jpeg"
                alt="66° Aniversario Unión Cultural Eldorado - IRIP 2000 - Detalles completos del evento"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                priority
              />
            </div>
          </div>
        </div>
      )}

      {/* Banner fijo lateral derecho - Desktop */}
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-40 hidden xl:block animate-slide-in-right">
        <div className="relative group">
          {/* Botón de cerrar */}
          <button
            onClick={closeBanner}
            className="absolute -top-2 -right-2 bg-gray-800 hover:bg-gray-900 text-white rounded-full p-1 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
            aria-label="Cerrar banner del evento"
            title="Cerrar banner (aparecerá nuevamente al recargar)"
          >
            <X size={16} />
          </button>

          {/* Banner con proporciones respetadas */}
          <div
            className="relative w-[200px] h-[356px] rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer bg-white border border-gray-200"
            onClick={openImageModal}
          >
            <Image
              src="/images/banner-lateral.jpeg"
              alt="Próximos Eventos - Unión Cultural Eldorado - IRIP 2000 - Sábado 9 Agosto"
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
              sizes="200px"
              priority
            />

            {/* Overlay sutil con información del evento */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30">
              {/* Indicador de eventos */}
              <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs px-2 py-1 rounded font-semibold">
                PRÓXIMOS EVENTOS
              </div>

              {/* Botón de expandir */}
              <div className="absolute top-3 right-3 bg-white/20 hover:bg-white/30 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Expand size={14} />
              </div>

              {/* Información del evento en la parte inferior */}
              <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                <div className="text-xs font-semibold mb-1 flex items-center">
                  <Calendar size={12} className="mr-1" />
                  SAB 9 AGOSTO - 21HS
                </div>
                <div className="text-xs opacity-90 flex items-center mb-1">
                  <Music size={12} className="mr-1" />
                  IRIP 2000
                </div>
                <div className="text-xs opacity-80">Desde $5.000</div>
              </div>
            </div>
          </div>

          {/* Countdown timer pequeño */}
          {timeLeft && (
            <div className="absolute -bottom-8 left-0 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded text-center font-mono">
              {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
            </div>
          )}
        </div>
      </div>

      {/* Banner móvil mejorado - Aparece desde abajo */}
      <div className="fixed bottom-4 left-2 right-2 z-40 xl:hidden">
        <div
          className={`bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-500 ease-out mobile-banner border border-gray-100 ${
            isMinimized ? "h-20" : "h-52"
          }`}
        >
          {/* Header del banner móvil mejorado */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-3 h-3 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
              </div>
              <div>
                <span className="text-sm font-bold">EVENTOS DE AGOSTO</span>
                <div className="text-xs opacity-90">Unión Cultural Eldorado</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleMinimize}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
                aria-label={isMinimized ? "Expandir banner" : "Minimizar banner"}
                title={isMinimized ? "Ver detalles del evento" : "Minimizar banner"}
              >
                {isMinimized ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              <button
                onClick={closeBanner}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
                aria-label="Cerrar banner del evento"
                title="Cerrar banner (aparecerá nuevamente al recargar)"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Contenido expandido del banner móvil */}
          {!isMinimized && (
            <div className="p-4 space-y-4">
              {/* Imagen y información principal */}
              <div className="flex items-start space-x-4">
                <div
                  className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 border-gray-100 shadow-md cursor-pointer group"
                  onClick={openImageModal}
                >
                  <Image
                    src="/images/banner-lateral.jpeg"
                    alt="66° Aniversario Unión Cultural Eldorado"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    sizes="80px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="bg-white/20 rounded-full p-1">
                      <Expand size={16} className="text-white" />
                    </div>
                  </div>
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <h3 className="text-base font-bold text-gray-900 leading-tight">Celebración del 66° Aniversario</h3>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar size={14} className="mr-2 text-blue-600" />
                      <span className="font-medium">Sábado 9 de Agosto</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock size={14} className="mr-2 text-green-600" />
                      <span>21:00 horas</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Music size={14} className="mr-2 text-purple-600" />
                      <span className="font-medium">IRIP 2000 en vivo</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información de precios y countdown */}
              <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-gray-900">Precios de entrada:</div>
                    <div className="space-y-1">
                      <div className="text-xs text-green-700 font-medium">
                        <Users size={12} className="inline mr-1" />
                        Socios: $5.000
                      </div>
                      <div className="text-xs text-blue-700">Anticipada: $10.000 • Ventanilla: $15.000</div>
                    </div>
                  </div>
                  {timeLeft && (
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">Faltan:</div>
                      <div className="bg-gray-800 text-white px-3 py-2 rounded-lg font-mono text-sm font-bold">
                        {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
                      </div>
                    </div>
                  )}
                </div>

                {/* Información adicional */}
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex items-center text-xs text-gray-600 mb-2">
                    <MapPin size={12} className="mr-1 text-red-500" />
                    <span>Unión Cultural y Deportiva Eldorado</span>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                    <div className="text-xs text-blue-800 font-medium mb-1">
                      🍺 Incluye: Comida típica, mesa dulce y bebida fría
                    </div>
                    <div className="text-xs text-blue-600">¡Celebremos juntos este aniversario especial!</div>
                    <button
                      onClick={openImageModal}
                      className="mt-2 text-xs text-blue-700 hover:text-blue-800 font-medium flex items-center"
                    >
                      <Expand size={12} className="mr-1" />
                      Ver imagen completa
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Banner sticky superior para tablets - Mejorado */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 hidden md:block xl:hidden">
        <div className="relative w-full h-[160px] overflow-hidden cursor-pointer" onClick={openImageModal}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              closeBanner()
            }}
            className="absolute top-3 right-3 bg-gray-800 hover:bg-gray-900 text-white rounded-full p-2 z-50 shadow-lg transition-colors duration-200"
            aria-label="Cerrar banner del evento"
            title="Cerrar banner (aparecerá nuevamente al recargar)"
          >
            <X size={16} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation()
              openImageModal()
            }}
            className="absolute top-3 right-16 bg-white/20 hover:bg-white/30 text-white rounded-full p-2 z-50 shadow-lg transition-colors duration-200"
            aria-label="Ver imagen completa"
            title="Ver imagen completa del evento"
          >
            <Expand size={16} />
          </button>

          <Image
            src="/images/banner-lateral.jpeg"
            alt="Eventos de Agosto - Unión Cultural Eldorado - IRIP 2000"
            fill
            className="object-cover object-center hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 100vw"
          />

          {/* Overlay mejorado con información del evento */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent">
            <div className="absolute top-6 left-6 space-y-3">
              <div className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg font-bold shadow-lg">
                EVENTOS DE AGOSTO
              </div>
              <div className="text-white space-y-2">
                <div className="text-xl font-bold mb-2">Unión Cultural Eldorado</div>
                <div className="space-y-1">
                  <div className="text-sm flex items-center">
                    <Calendar size={16} className="mr-2" />
                    Sábado 9 de Agosto - 21:00hs
                  </div>
                  <div className="text-sm flex items-center">
                    <Music size={16} className="mr-2" />
                    IRIP 2000 en vivo
                  </div>
                  <div className="text-sm flex items-center">
                    <Users size={16} className="mr-2" />
                    Desde $5.000 (socios)
                  </div>
                </div>
              </div>
            </div>

            {/* Countdown en tablet mejorado */}
            {timeLeft && (
              <div className="absolute bottom-6 right-6 bg-gray-800 text-white px-4 py-3 rounded-lg font-mono text-base shadow-lg">
                <div className="text-xs text-gray-300 mb-1">Faltan:</div>
                <div className="font-bold">
                  {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
