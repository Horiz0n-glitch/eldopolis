import { generateWebsiteStructuredData, generateBreadcrumbStructuredData } from "@/lib/seo-utils"

interface StructuredDataProps {
  type: "website" | "breadcrumb" | "custom"
  data?: any
  breadcrumbItems?: Array<{ name: string; url: string }>
}

export default function StructuredData({ type, data, breadcrumbItems }: StructuredDataProps) {
  let structuredData

  switch (type) {
    case "website":
      structuredData = generateWebsiteStructuredData()
      break
    case "breadcrumb":
      structuredData = breadcrumbItems ? generateBreadcrumbStructuredData(breadcrumbItems) : null
      break
    case "custom":
      structuredData = data
      break
    default:
      return null
  }

  if (!structuredData) return null

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  )
}
