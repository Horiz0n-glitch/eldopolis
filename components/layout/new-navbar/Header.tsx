"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Menu, Search, Contrast } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://eldopolis.com"
const abs = (slug: string) => `${BASE_URL}${slug}`

const categories = [
  { name: "Sociedad", slug: "/category/sociedad" },
  { name: "Política", slug: "/category/politica" },
  { name: "Deportes", slug: "/category/deporte" },
  { name: "Economía", slug: "/category/economia" },
  { name: "Policiales", slug: "/category/policiales" },
  { name: "Espectáculos", slug: "/category/espectaculos" },
]

type Rate = { name: string; sell: number; change: string }

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Usar dollarRates como referencia estática para el primer render
  const initialDollarRates = [
    { name: "Dólar MEP", sell: 1150, change: "+0.5%" },
    { name: "Dólar CCL", sell: 1160, change: "+0.2%" },
    { name: "Blue", sell: 1220, change: "-0.8%" },
    { name: "Oficial", sell: 1020, change: "—" },
    { name: "Cripto", sell: 1185, change: "+1.1%" },
  ]
  const [dollarRates, setDollarRates] = useState<Rate[]>(initialDollarRates)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    setMounted(true)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      {/* Ticker Bar */}
      <div suppressHydrationWarning className="bg-slate-900 text-white overflow-hidden border-b border-white/10 h-10 flex items-center">
        <div className="max-w-[1440px] mx-auto relative flex items-center w-full">
          <div className="absolute left-0 z-10 bg-slate-900 px-6 h-full flex items-center text-[10px] font-bold tracking-widest uppercase border-r border-white/10">
            Mercados
          </div>
          <div className="ticker-scroll flex space-x-12 items-center text-xs font-medium pl-32 animate-ticker">
            {[...dollarRates, ...dollarRates].map((rate, i) => (
              <span key={i} className="flex items-center gap-2 whitespace-nowrap">
                {rate.name}
                <span className={rate.change.startsWith("+") ? "text-emerald-400" : rate.change.startsWith("-") ? "text-red-400" : "text-slate-400"}>
                  ${rate.sell}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header suppressHydrationWarning className={`sticky top-0 z-40 transition-all duration-300 ${isScrolled
        ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm h-16"
        : "bg-white dark:bg-slate-900 h-20"
        } border-b border-slate-100 dark:border-slate-800`}>
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link href="/" className="group outline-none">
              <img
                src="https://pub-514df041e2b3494caab09827cb896071.r2.dev/logo_rojo_azul_1_ethdja.svg"
                alt="Eldópolis"
                className={`w-auto transition-all duration-300 ease-out group-hover:scale-105 ${isScrolled ? "h-7" : "h-12"}`}
              />
            </Link>

            <nav className="hidden lg:flex items-center space-x-6">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={cat.slug}
                  className="text-[11px] font-bold uppercase tracking-wider text-slate-500 hover:text-primary transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-6">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden p-0 h-auto hover:bg-transparent">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetTitle className="flex items-center mb-8">
                  <span className="text-2xl font-extrabold tracking-tighter">eldópolis<span className="text-primary">red</span></span>
                </SheetTitle>
                <nav className="flex flex-col space-y-4">
                  {categories.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={cat.slug}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-sm font-bold uppercase tracking-widest text-slate-600 hover:text-primary"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

    </>
  )
}
