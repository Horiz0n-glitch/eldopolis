import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import StructuredData from "./structured-data"

interface BreadcrumbItem {
  name: string
  url: string
  current?: boolean
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export default function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  const allItems = [{ name: "Inicio", url: "/" }, ...items]

  return (
    <>
      <StructuredData type="breadcrumb" breadcrumbItems={allItems} />
      <nav className={`flex items-center space-x-2 text-sm text-gray-600 ${className}`} aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          {allItems.map((item, index) => (
            <li key={index} className="flex items-center">
              {index > 0 && <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />}

              {index === 0 ? (
                <Link
                  href={item.url}
                  className="flex items-center hover:text-red-600 transition-colors"
                  aria-label="Ir al inicio"
                >
                  <Home className="w-4 h-4" />
                  <span className="sr-only">{item.name}</span>
                </Link>
              ) : item.current ? (
                <span className="text-gray-900 font-medium" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link href={item.url} className="hover:text-red-600 transition-colors">
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}
