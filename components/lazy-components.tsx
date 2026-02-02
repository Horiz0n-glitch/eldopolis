import type React from "react"
import { lazy, Suspense } from "react"
import { Loader2 } from "lucide-react"

// Lazy load de componentes pesados
export const LazyLargeAdCard = lazy(() => import("./Publi/LargexlAdCard"))
export const LazyMediumAdCard = lazy(() => import("./Publi/MediumAdCard"))
export const LazySmallAdCard = lazy(() => import("./Publi/SmallAdCard"))
export const LazySidebarAdCard = lazy(() => import("./Publi/SidebarAdCard"))
export const LazyCurrencyCard = lazy(() =>
  import("./section/Dolar").then((module) => ({ default: module.CurrencyCard })),
)

// Componente de loading universal
export const ComponentLoader = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center justify-center p-8 ${className}`}>
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      <span className="text-sm text-gray-500">Cargando componente...</span>
    </div>
  </div>
)

// HOC para lazy loading con suspense
export const withLazyLoading = <P extends object>(Component: React.ComponentType<P>, fallback?: React.ReactNode) => {
  return (props: P) => (
    <Suspense fallback={fallback || <ComponentLoader />}>
      <Component {...props} />
    </Suspense>
  )
}

// Componentes lazy con suspense incluido
export const LargeAdCardLazy = withLazyLoading(
  LazyLargeAdCard,
  <div className="w-full max-w-4xl mx-auto my-8">
    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
      <ComponentLoader />
    </div>
  </div>,
)

export const MediumAdCardLazy = withLazyLoading(
  LazyMediumAdCard,
  <div className="w-full max-w-xs mx-auto">
    <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
      <ComponentLoader />
    </div>
  </div>,
)

export const SmallAdCardLazy = withLazyLoading(
  LazySmallAdCard,
  <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
    <ComponentLoader />
  </div>,
)

export const SidebarAdCardLazy = withLazyLoading(
  LazySidebarAdCard,
  <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200 mb-4">
    <ComponentLoader />
  </div>,
)

export const CurrencyCardLazy = withLazyLoading(
  LazyCurrencyCard,
  <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-4 border border-red-200 shadow-sm">
    <ComponentLoader />
  </div>,
)
