interface JsonLdProps {
  data: any
}

export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  )
}

// Specific structured data components
export function NewsArticleJsonLd({ news }: { news: any }) {
  const baseUrl = (() => {
    const url = process.env.NEXT_PUBLIC_BASE_URL || "https://eldopolis.com"
    return url.startsWith("http") ? url : `https://${url}`
  })()

  const imageUrl = Array.isArray(news.image) ? news.image[0] : news.image
  const fullImageUrl = imageUrl.startsWith("http") ? imageUrl : `${baseUrl}${imageUrl}`

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: news.title,
    description: news.subtitle,
    image: {
      "@type": "ImageObject",
      url: fullImageUrl,
      width: 1200,
      height: 630,
    },
    datePublished: news.date,
    dateModified: news.timestamp || news.date,
    author: {
      "@type": "Person",
      name: news.author,
    },
    publisher: {
      "@type": "Organization",
      name: "Eldópolis",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/images/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${baseUrl}/news/${news.id}`,
    },
    articleSection: news.mainCategory,
    keywords: news.tags?.join(", ") || "",
  }

  return <JsonLd data={structuredData} />
}

export function WebSiteJsonLd() {
  const baseUrl = (() => {
    const url = process.env.NEXT_PUBLIC_BASE_URL || "https://eldopolis.com"
    return url.startsWith("http") ? url : `https://${url}`
  })()

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Eldópolis",
    url: baseUrl,
    description: "Las últimas noticias de actualidad, política, deportes, economía y más.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  }

  return <JsonLd data={structuredData} />
}

export function OrganizationJsonLd() {
  const baseUrl = (() => {
    const url = process.env.NEXT_PUBLIC_BASE_URL || "https://eldopolis.com"
    return url.startsWith("http") ? url : `https://${url}`
  })()

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Eldópolis",
    url: baseUrl,
    logo: `${baseUrl}/images/logo.png`,
    description: "Medio de comunicación digital especializado en noticias de actualidad.",
    sameAs: ["https://twitter.com/eldopolis", "https://facebook.com/eldopolis", "https://instagram.com/eldopolis"],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "contacto@eldopolis.com",
    },
  }

  return <JsonLd data={structuredData} />
}
