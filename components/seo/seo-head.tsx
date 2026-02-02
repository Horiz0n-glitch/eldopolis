"use client"

import { useEffect } from "react"
import type { SEOData } from "@/lib/seo-utils"

interface SEOHeadProps {
  seo: SEOData
}

export default function SEOHead({ seo }: SEOHeadProps) {
  useEffect(() => {
    // Update document title
    document.title = seo.title

    // Update meta description
    updateMetaTag("description", seo.description)
    updateMetaTag("keywords", seo.keywords.join(", "))

    // Update Open Graph tags
    updateMetaTag("og:title", seo.openGraph.title, "property")
    updateMetaTag("og:description", seo.openGraph.description, "property")
    updateMetaTag("og:image", seo.openGraph.image, "property")
    updateMetaTag("og:url", seo.openGraph.url, "property")
    updateMetaTag("og:type", seo.openGraph.type, "property")
    updateMetaTag("og:site_name", seo.openGraph.siteName, "property")
    updateMetaTag("og:locale", seo.openGraph.locale, "property")

    // Update Twitter Card tags
    updateMetaTag("twitter:card", seo.twitter.card)
    updateMetaTag("twitter:site", seo.twitter.site)
    updateMetaTag("twitter:title", seo.twitter.title)
    updateMetaTag("twitter:description", seo.twitter.description)
    updateMetaTag("twitter:image", seo.twitter.image)

    if (seo.twitter.creator) {
      updateMetaTag("twitter:creator", seo.twitter.creator)
    }

    // Update canonical link
    if (seo.canonical) {
      updateCanonicalLink(seo.canonical)
    }

    // Add structured data
    if (seo.structuredData) {
      addStructuredData(seo.structuredData)
    }
  }, [seo])

  return null
}

function updateMetaTag(name: string, content: string, attribute: "name" | "property" = "name") {
  let meta = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement

  if (!meta) {
    meta = document.createElement("meta")
    meta.setAttribute(attribute, name)
    document.head.appendChild(meta)
  }

  meta.content = content
}

function updateCanonicalLink(href: string) {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement

  if (!link) {
    link = document.createElement("link")
    link.rel = "canonical"
    document.head.appendChild(link)
  }

  link.href = href
}

function addStructuredData(data: any) {
  // Remove existing structured data
  const existingScript = document.querySelector('script[type="application/ld+json"]')
  if (existingScript) {
    existingScript.remove()
  }

  // Add new structured data
  const script = document.createElement("script")
  script.type = "application/ld+json"
  script.textContent = JSON.stringify(data)
  document.head.appendChild(script)
}
