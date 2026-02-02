import type { MetadataRoute } from "next"

const baseUrl = (() => {
  const url = process.env.NEXT_PUBLIC_BASE_URL || "https://eldopolis.com"
  return url.startsWith("http") ? url : `https://${url}`
})()

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/private/", "/_next/", "/static/", "*.json", "/search?*"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/api/", "/admin/", "/private/"],
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: ["/api/", "/admin/", "/private/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
