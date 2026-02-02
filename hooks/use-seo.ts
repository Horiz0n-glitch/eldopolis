"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import type { SEOData } from "@/lib/seo-utils"
import { DEFAULT_SEO } from "@/lib/seo-utils"

export function useSEO(initialSEO?: Partial<SEOData>) {
  const pathname = usePathname()
  const [seo, setSEO] = useState<SEOData>(() => ({
    title: initialSEO?.title || DEFAULT_SEO.defaultTitle,
    description: initialSEO?.description || DEFAULT_SEO.defaultDescription,
    keywords: initialSEO?.keywords || ["noticias", "actualidad", "información"],
    canonical: initialSEO?.canonical || `${DEFAULT_SEO.siteUrl}${pathname}`,
    openGraph: {
      title: initialSEO?.openGraph?.title || DEFAULT_SEO.defaultTitle,
      description: initialSEO?.openGraph?.description || DEFAULT_SEO.defaultDescription,
      image: initialSEO?.openGraph?.image || `${DEFAULT_SEO.siteUrl}${DEFAULT_SEO.defaultImage}`,
      url: initialSEO?.openGraph?.url || `${DEFAULT_SEO.siteUrl}${pathname}`,
      type: initialSEO?.openGraph?.type || "website",
      siteName: DEFAULT_SEO.siteName,
      locale: DEFAULT_SEO.locale,
      ...initialSEO?.openGraph,
    },
    twitter: {
      card: initialSEO?.twitter?.card || "summary_large_image",
      site: DEFAULT_SEO.twitterHandle,
      title: initialSEO?.twitter?.title || DEFAULT_SEO.defaultTitle,
      description: initialSEO?.twitter?.description || DEFAULT_SEO.defaultDescription,
      image: initialSEO?.twitter?.image || `${DEFAULT_SEO.siteUrl}${DEFAULT_SEO.defaultImage}`,
      ...initialSEO?.twitter,
    },
    structuredData: initialSEO?.structuredData,
  }))

  const updateSEO = (newSEO: Partial<SEOData>) => {
    setSEO((prev) => ({
      ...prev,
      ...newSEO,
      openGraph: {
        ...prev.openGraph,
        ...newSEO.openGraph,
      },
      twitter: {
        ...prev.twitter,
        ...newSEO.twitter,
      },
    }))
  }

  useEffect(() => {
    // Update canonical URL when pathname changes
    setSEO((prev) => ({
      ...prev,
      canonical: `${DEFAULT_SEO.siteUrl}${pathname}`,
      openGraph: {
        ...prev.openGraph,
        url: `${DEFAULT_SEO.siteUrl}${pathname}`,
      },
    }))
  }, [pathname])

  return { seo, updateSEO }
}
