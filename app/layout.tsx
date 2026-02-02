import type React from "react"
import type { Metadata } from "next"
import { Plus_Jakarta_Sans, Inter, Lora } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import ClientLayout from "./clientLayout"
import FixedBanner from "@/components/layout/fixed-banner"
import ServiceWorkerRegistration from "@/components/service-worker-registration"
import { DEFAULT_SEO } from "@/lib/seo-utils"

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ["300", "400", "500", "600", "700", "800"]
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
})


export const metadata: Metadata = {
  metadataBase: new URL(DEFAULT_SEO.siteUrl),
  title: {
    default: DEFAULT_SEO.defaultTitle,
    template: `%s | ${DEFAULT_SEO.siteName}`,
  },
  description: DEFAULT_SEO.defaultDescription,
  keywords: ["noticias", "Eldorado", "Misiones", "Argentina", "deportes", "cultura", "actualidad", "política"],
  authors: [{ name: "Eldópolis", url: DEFAULT_SEO.siteUrl }],
  creator: "Eldópolis",
  publisher: "Eldópolis",
  openGraph: {
    title: DEFAULT_SEO.defaultTitle,
    description: DEFAULT_SEO.defaultDescription,
    url: "/",
    siteName: DEFAULT_SEO.siteName,
    images: [
      {
        url: DEFAULT_SEO.defaultImage,
        width: 1200,
        height: 630,
        alt: "Eldópolis - INFORMACIÓN DESDE LA TIERRA COLORADA",
      },
    ],
    locale: DEFAULT_SEO.locale,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_SEO.defaultTitle,
    description: DEFAULT_SEO.defaultDescription,
    site: DEFAULT_SEO.twitterHandle,
    creator: DEFAULT_SEO.twitterHandle,
    images: [DEFAULT_SEO.defaultImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "https://pub-514df041e2b3494caab09827cb896071.r2.dev/Icono-web.ico",
    shortcut: "https://pub-514df041e2b3494caab09827cb896071.r2.dev/Icono-web.ico",
    apple: "https://pub-514df041e2b3494caab09827cb896071.r2.dev/Icono-web.ico",
  },
  manifest: `${DEFAULT_SEO.siteUrl}/site.webmanifest`,
  generator: "Horizont",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" />
      </head>
      <body className={`${plusJakarta.variable} ${inter.variable} ${lora.variable} ${plusJakarta.className}`}>
        <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light" enableSystem={false} disableTransitionOnChange>
          <ClientLayout>
            {children}
          </ClientLayout>
          <ServiceWorkerRegistration />
        </ThemeProvider>
      </body>
    </html>
  )
}
