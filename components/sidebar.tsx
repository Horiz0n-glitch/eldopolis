"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Radio,
  Play,
  Globe,
  Dumbbell,
  LandPlot,
  Shield,
  Users,
  MessageSquare,
  Tv,
  DollarSign,
  Instagram,
  Phone,
  Facebook,
  Twitter,
  Home,
  ChevronRight,
  Star,
  TrendingUp,
  Zap,
  Share2,
} from "lucide-react"
import { CurrencyCard } from "./section/Dolar"
import { useScrollToTopContext } from "./scroll-to-top-provider"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { scrollToTop } = useScrollToTopContext()

  const handleLinkClick = () => {
    onClose()
  }

  const categories = [
    { href: "/category/mundo", icon: Globe, label: "Mundo", color: "bg-blue-100 text-blue-600", count: 45 },
    { href: "/category/deporte", icon: Dumbbell, label: "Deporte", color: "bg-orange-100 text-orange-600", count: 32 },
    { href: "/category/politica", icon: LandPlot, label: "Política", color: "bg-red-100 text-red-600", count: 28 },
    {
      href: "/category/policiales",
      icon: Shield,
      label: "Policiales",
      color: "bg-yellow-100 text-yellow-600",
      count: 19,
    },
    { href: "/category/sociedad", icon: Users, label: "Sociedad", color: "bg-green-100 text-green-600", count: 41 },
    {
      href: "/category/columna",
      icon: MessageSquare,
      label: "Columna",
      color: "bg-indigo-100 text-indigo-600",
      count: 15,
    },
    {
      href: "/category/espectaculos",
      icon: Tv,
      label: "Espectáculos",
      color: "bg-purple-100 text-purple-600",
      count: 23,
    },
    {
      href: "/category/economia",
      icon: DollarSign,
      label: "Economía",
      color: "bg-emerald-100 text-emerald-600",
      count: 37,
    },
  ]

  const socialLinks = [
    {
      href: "https://wa.me/your-whatsapp-number",
      icon: Phone,
      label: "WhatsApp",
      color: "hover:bg-green-50 hover:border-green-300",
      iconColor: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      href: "https://www.instagram.com/eldopolis",
      icon: Instagram,
      label: "Instagram",
      color: "hover:bg-pink-50 hover:border-pink-300",
      iconColor: "text-pink-600",
      bgColor: "bg-pink-50",
    },
    {
      href: "https://www.facebook.com/Eldopolis",
      icon: Facebook,
      label: "Facebook",
      color: "hover:bg-blue-50 hover:border-blue-300",
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      href: "https://twitter.com/eldopolis",
      icon: Twitter,
      label: "Twitter",
      color: "hover:bg-slate-50 hover:border-slate-400",
      iconColor: "text-slate-700",
      bgColor: "bg-slate-50",
    },
  ]

  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-b from-white via-gray-50 to-white overflow-hidden">
      <ScrollArea className="flex-1 w-full">
        <div className="w-full px-2 sm:px-3 lg:px-4 pb-4">
          {/* Header del Sidebar */}
          <div className="mb-4 p-3 sm:p-4 bg-gradient-to-br from-red-600 via-red-700 to-red-800 text-white relative overflow-hidden rounded-b-lg">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-3 w-3 sm:h-5 sm:w-5" />
                  </div>
                  <span className="font-bold text-sm sm:text-lg truncate">NAVEGACIÓN</span>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-white/20 text-white border-white/30 font-semibold text-xs flex-shrink-0 ml-2"
                >
                  Menu
                </Badge>
              </div>
              <p className="text-white/80 text-xs sm:text-sm">Explora todas las secciones</p>
            </div>
          </div>

          {/* Navegación principal */}
          <div className="mb-4">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="w-full justify-start h-12 sm:h-14 bg-gradient-to-r from-red-50 via-red-100 to-red-50 border-2 border-red-200 hover:from-red-100 hover:to-red-200 hover:border-red-300 transition-all duration-300 group shadow-lg hover:shadow-xl"
            >
              <Link href="/" onClick={handleLinkClick}>
                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg mr-3 group-hover:from-red-600 group-hover:to-red-700 transition-all duration-300 shadow-lg flex-shrink-0">
                  <Home className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <span className="text-sm sm:text-base font-bold text-red-700 group-hover:text-red-800 block truncate">
                    Inicio
                  </span>
                  <span className="text-xs text-red-600 group-hover:text-red-700 hidden sm:block">
                    Página principal
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-red-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
              </Link>
            </Button>
          </div>

          {/* Currency Card */}
          <div className="mb-4">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-1 border border-blue-200">
              <CurrencyCard />
            </div>
          </div>

          {/* Multimedia mejorado */}
          <div className="mb-4">
            <div className="bg-white rounded-lg border-2 border-gray-200 p-3 sm:p-4 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm sm:text-base font-bold text-gray-800 uppercase tracking-wider flex items-center min-w-0 flex-1">
                  <Zap className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-red-600 flex-shrink-0" />
                  <span className="truncate">En Vivo</span>
                </h4>
                <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <Badge variant="outline" className="text-xs border-red-200 text-red-600 font-semibold">
                    LIVE
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  variant="ghost"
                  asChild
                  className="w-full justify-start h-auto p-3 bg-gradient-to-br from-red-50 via-red-100 to-red-50 border-2 border-red-200 hover:from-red-100 hover:to-red-200 hover:border-red-300 transition-all duration-300 group shadow-md hover:shadow-lg rounded-lg"
                >
                  <Link href="https://streaminglocucionar.com/portal/?p=16127" target="_blank">
                    <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg mr-3 group-hover:from-red-600 group-hover:to-red-700 transition-all duration-300 shadow-lg group-hover:scale-105 flex-shrink-0">
                      <Radio className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <span className="block font-bold text-gray-800 group-hover:text-red-800 text-sm sm:text-base truncate">
                        Radio en Vivo
                      </span>
                      <span className="block text-xs sm:text-sm text-gray-600 group-hover:text-red-600 truncate">
                        Programación 24/7
                      </span>
                      <div className="flex items-center mt-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2 flex-shrink-0" />
                        <span className="text-xs font-bold text-green-600">ON AIR</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-red-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  asChild
                  className="w-full justify-start h-auto p-3 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 border-2 border-blue-200 hover:from-blue-100 hover:to-blue-200 hover:border-blue-300 transition-all duration-300 group shadow-md hover:shadow-lg rounded-lg"
                >
                  <Link href="https://streaminglocucionar.com/portal/?p=16127" target="_blank">
                    <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg mr-3 group-hover:from-blue-600 group-hover:to-blue-700 transition-all duration-300 shadow-lg group-hover:scale-105 flex-shrink-0">
                      <Play className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <span className="block font-bold text-gray-800 group-hover:text-blue-800 text-sm sm:text-base truncate">
                        Streaming
                      </span>
                      <span className="block text-xs sm:text-sm text-gray-600 group-hover:text-blue-600 truncate">
                        Multimedia exclusivo
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-blue-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Redes sociales mejoradas */}
          <div className="mb-4">
            <div className="bg-white rounded-lg border-2 border-gray-200 p-3 sm:p-4 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm sm:text-base font-bold text-gray-800 uppercase tracking-wider flex items-center min-w-0 flex-1">
                  <Share2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-red-600 flex-shrink-0" />
                  <span className="truncate">Síguenos</span>
                </h4>
                <Badge variant="outline" className="text-xs font-semibold flex-shrink-0 ml-2">
                  Social
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {socialLinks.map((social, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    asChild
                    className={`h-12 sm:h-14 ${social.bgColor} border-2 border-gray-200 ${social.color} transition-all duration-300 group hover:shadow-lg hover:scale-105 rounded-lg`}
                  >
                    <Link href={social.href} target="_blank" rel="noopener noreferrer">
                      <div className="flex flex-col items-center space-y-1 min-w-0 w-full">
                        <social.icon
                          className={`h-4 w-4 sm:h-5 sm:w-5 ${social.iconColor} group-hover:scale-110 transition-transform flex-shrink-0`}
                        />
                        <span className="text-xs font-semibold text-gray-700 group-hover:text-gray-900 truncate w-full text-center">
                          {social.label}
                        </span>
                      </div>
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Categorías mejoradas */}
          <div className="mb-4">
            <div className="bg-white rounded-lg border-2 border-gray-200 p-3 sm:p-4 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm sm:text-base font-bold text-gray-800 uppercase tracking-wider flex items-center min-w-0 flex-1">
                  <Star className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-yellow-500 flex-shrink-0" />
                  <span className="truncate">Categorías</span>
                </h4>
                <Badge variant="outline" className="text-xs font-semibold flex-shrink-0 ml-2">
                  {categories.length}
                </Badge>
              </div>

              <div className="space-y-2">
                {categories.map((item) => (
                  <Button
                    key={item.href}
                    variant="ghost"
                    asChild
                    className="w-full justify-start h-12 sm:h-14 bg-gray-50 border-2 border-gray-100 hover:border-red-200 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-300 group hover:shadow-md rounded-lg"
                  >
                    <Link href={item.href} onClick={handleLinkClick}>
                      <div
                        className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 ${item.color} rounded-lg mr-3 group-hover:scale-110 transition-all duration-300 shadow-sm flex-shrink-0`}
                      >
                        <item.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <span className="font-bold text-gray-700 group-hover:text-red-700 transition-colors text-sm sm:text-base block truncate">
                          {item.label}
                        </span>
                        <span className="text-xs text-gray-500 group-hover:text-red-500 hidden sm:block">
                          {item.count} artículos
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                        <Badge
                          variant="secondary"
                          className="text-xs bg-gray-200 text-gray-700 group-hover:bg-red-100 group-hover:text-red-700 transition-colors font-semibold"
                        >
                          {item.count}
                        </Badge>
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer mejorado */}
          <div className="p-3 sm:p-4 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 border-2 border-gray-200 rounded-lg">
            <div className="text-center">
              <div className="mb-4 p-4 bg-white rounded-xl shadow-lg border-2 border-gray-200">
                <img
                  src="https://res.cloudinary.com/deemssikv/image/upload/v1738581472/logo_rojo_azul_1_ethdja.svg"
                  alt="Eldopolis"
                  className="h-8 sm:h-10 w-auto mx-auto mb-3"
                />
                <h3 className="text-base font-bold text-gray-800 mb-2">Eldopolis</h3>
                <p className="text-xs sm:text-sm font-medium text-gray-700 mb-1">Tu fuente confiable de noticias</p>
                <p className="text-xs text-gray-500">Noticias 24/7</p>
              </div>

              <div className="flex justify-center space-x-3 mb-4">
                {socialLinks.slice(0, 3).map((social, index) => (
                  <Link
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-white rounded-lg flex items-center justify-center hover:bg-gray-50 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-110 border-2 border-gray-200"
                  >
                    <social.icon className={`h-5 w-5 ${social.iconColor}`} />
                  </Link>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="flex justify-center space-x-4 text-xs text-gray-600 mb-3 flex-wrap">
                <Link href="/privacy" className="hover:text-red-600 transition-colors font-medium">
                  Privacidad
                </Link>
                <span className="text-gray-300">•</span>
                <Link href="/terms" className="hover:text-red-600 transition-colors font-medium">
                  Términos
                </Link>
                <span className="text-gray-300">•</span>
                <Link href="/contact" className="hover:text-red-600 transition-colors font-medium">
                  Contacto
                </Link>
              </div>

              <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-3 border-2 border-red-200">
                <p className="text-xs sm:text-sm text-red-700 font-bold mb-1">© 2024 Eldopolis</p>
                <p className="text-xs text-red-600">Todos los derechos reservados</p>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
