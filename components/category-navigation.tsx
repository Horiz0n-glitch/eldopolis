"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Globe, Dumbbell, LandPlot, Shield, Users, MessageSquare, Tv, DollarSign } from "lucide-react"

const categories = [
  {
    name: "Mundo",
    slug: "mundo",
    icon: Globe,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    hoverColor: "hover:bg-blue-100",
  },
  {
    name: "Deporte",
    slug: "deporte",
    icon: Dumbbell,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    hoverColor: "hover:bg-orange-100",
  },
  {
    name: "Política",
    slug: "politica",
    icon: LandPlot,
    color: "text-red-600",
    bgColor: "bg-red-50",
    hoverColor: "hover:bg-red-100",
  },
  {
    name: "Policiales",
    slug: "policiales",
    icon: Shield,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    hoverColor: "hover:bg-yellow-100",
  },
  {
    name: "Sociedad",
    slug: "sociedad",
    icon: Users,
    color: "text-green-600",
    bgColor: "bg-green-50",
    hoverColor: "hover:bg-green-100",
  },
  {
    name: "Columna",
    slug: "columna",
    icon: MessageSquare,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    hoverColor: "hover:bg-indigo-100",
  },
  {
    name: "Espectáculos",
    slug: "espectaculos",
    icon: Tv,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    hoverColor: "hover:bg-purple-100",
  },
  {
    name: "Economía",
    slug: "economia",
    icon: DollarSign,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    hoverColor: "hover:bg-emerald-100",
  },
]

interface CategoryNavigationProps {
  variant?: "horizontal" | "vertical" | "grid"
  showIcons?: boolean
  className?: string
}

export default function CategoryNavigation({
  variant = "horizontal",
  showIcons = true,
  className = "",
}: CategoryNavigationProps) {
  const pathname = usePathname()

  const isActive = (slug: string) => {
    return pathname === `/category/${slug}`
  }

  if (variant === "grid") {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
        {categories.map((category) => {
          const Icon = category.icon
          const active = isActive(category.slug)

          return (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              className={`
                flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200
                ${
                  active
                    ? `${category.bgColor} border-current ${category.color}`
                    : `bg-white border-gray-200 hover:border-gray-300 ${category.hoverColor}`
                }
              `}
            >
              {showIcons && (
                <div
                  className={`
                  w-12 h-12 rounded-full flex items-center justify-center mb-3
                  ${active ? category.bgColor : "bg-gray-100"}
                `}
                >
                  <Icon className={`w-6 h-6 ${active ? category.color : "text-gray-600"}`} />
                </div>
              )}
              <span
                className={`
                text-sm font-medium text-center
                ${active ? category.color : "text-gray-700"}
              `}
              >
                {category.name}
              </span>
            </Link>
          )
        })}
      </div>
    )
  }

  if (variant === "vertical") {
    return (
      <nav className={`space-y-2 ${className}`}>
        {categories.map((category) => {
          const Icon = category.icon
          const active = isActive(category.slug)

          return (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                ${
                  active
                    ? `${category.bgColor} ${category.color} font-medium`
                    : `text-gray-700 hover:bg-gray-50 ${category.hoverColor}`
                }
              `}
            >
              {showIcons && <Icon className={`w-5 h-5 ${active ? category.color : "text-gray-500"}`} />}
              <span>{category.name}</span>
            </Link>
          )
        })}
      </nav>
    )
  }

  // Horizontal variant (default)
  return (
    <nav className={`flex items-center gap-2 overflow-x-auto ${className}`}>
      {categories.map((category) => {
        const Icon = category.icon
        const active = isActive(category.slug)

        return (
          <Link
            key={category.slug}
            href={`/category/${category.slug}`}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200
              ${
                active
                  ? `${category.bgColor} ${category.color} font-medium`
                  : `text-gray-700 hover:bg-gray-100 ${category.hoverColor}`
              }
            `}
          >
            {showIcons && <Icon className={`w-4 h-4 ${active ? category.color : "text-gray-500"}`} />}
            <span className="text-sm">{category.name}</span>
          </Link>
        )
      })}
    </nav>
  )
}
