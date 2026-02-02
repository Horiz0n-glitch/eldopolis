import Head from "next/head"
import type { SEOData } from "@/lib/seo-utils"

interface MetaTagsProps {
  seo: SEOData
}

export default function MetaTags({ seo }: MetaTagsProps) {
  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="keywords" content={seo.keywords.join(", ")} />

      {/* Canonical URL */}
      {seo.canonical && <link rel="canonical" href={seo.canonical} />}

      {/* Open Graph */}
      <meta property="og:title" content={seo.openGraph.title} />
      <meta property="og:description" content={seo.openGraph.description} />
      <meta property="og:image" content={seo.openGraph.image} />
      <meta property="og:url" content={seo.openGraph.url} />
      <meta property="og:type" content={seo.openGraph.type} />
      <meta property="og:site_name" content={seo.openGraph.siteName} />
      <meta property="og:locale" content={seo.openGraph.locale} />

      {/* Article specific Open Graph */}
      {seo.openGraph.type === "article" && (
        <>
          {seo.openGraph.publishedTime && (
            <meta property="article:published_time" content={seo.openGraph.publishedTime} />
          )}
          {seo.openGraph.modifiedTime && <meta property="article:modified_time" content={seo.openGraph.modifiedTime} />}
          {seo.openGraph.author && <meta property="article:author" content={seo.openGraph.author} />}
          {seo.openGraph.section && <meta property="article:section" content={seo.openGraph.section} />}
          {seo.openGraph.tags?.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Twitter Cards */}
      <meta name="twitter:card" content={seo.twitter.card} />
      <meta name="twitter:site" content={seo.twitter.site} />
      <meta name="twitter:title" content={seo.twitter.title} />
      <meta name="twitter:description" content={seo.twitter.description} />
      <meta name="twitter:image" content={seo.twitter.image} />
      {seo.twitter.creator && <meta name="twitter:creator" content={seo.twitter.creator} />}

      {/* Additional SEO Meta Tags */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <meta name="bingbot" content="index, follow" />

      {/* Language and Region */}
      <meta httpEquiv="content-language" content="es-ES" />
      <meta name="geo.region" content="ES" />
      <meta name="geo.placename" content="España" />

      {/* Mobile Optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      <meta name="format-detection" content="telephone=no" />

      {/* Structured Data */}
      {seo.structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(seo.structuredData),
          }}
        />
      )}
    </Head>
  )
}
