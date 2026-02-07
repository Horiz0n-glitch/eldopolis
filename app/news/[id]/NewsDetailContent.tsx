"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import type { News } from "@/types/news"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  Facebook,
  Twitter,
  Share2,
  MessageCircle,
  Calendar,
  Clock,
  TrendingUp,
  Search,
  Menu,
  Moon,
  Sun,
  User,
  ZoomIn
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { parseDraftJSContent, groupShortParagraphs } from "@/utils/draftjs-parser"
import AdPlaceholder from "@/components/Publi/AdPlaceholder"
import SmallAdCard from "@/components/Publi/SmallAdCard"
import { convertirURL } from "@/lib/image-utils"
import { ImageLightbox } from "@/components/ImageLightbox"

interface NewsDetailContentProps {
  news: News
  relatedNews?: News[]
  isServerRendered?: boolean
}

export default function NewsDetailContent({
  news,
  relatedNews = [],
  isServerRendered = false,
}: NewsDetailContentProps) {
  const [readingTime, setReadingTime] = useState(0)
  const [isClient, setIsClient] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  useEffect(() => {
    setIsClient(true)
    const wordsPerMinute = 200
    const textContent = parseDraftJSContent(news.description).replace(/<[^>]*>/g, "")
    const wordCount = textContent.split(/\s+/).length
    setReadingTime(Math.ceil(wordCount / wordsPerMinute))
  }, [news.description])

  const parsedContent = (() => {
    if (!news.description) return '<p class="text-gray-500 italic">No hay contenido disponible.</p>'
    const grouped = groupShortParagraphs(news.description)
    if (grouped && grouped.trim()) return grouped
    return parseDraftJSContent(news.description)
  })()

  const handleShare = (platform: string) => {
    if (!isClient) return
    const url = window.location.href
    const text = news.title
    let shareLink = ""

    switch (platform) {
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        break
      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
        break
      case "whatsapp":
        shareLink = `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`
        break
      case "copy":
        navigator.clipboard.writeText(url)
        toast({ title: "¡Enlace copiado!", description: "El enlace se ha copiado al portapapeles." })
        return
    }

    if (shareLink) window.open(shareLink, "_blank", "width=600,height=400")
  }

  return (
    <div className="antialiased font-inter">
      {/* Hero Header Section */}
      <section className="relative w-full h-[60vh] md:h-[75vh] min-h-[500px] overflow-hidden">
        {news.imageUrl && (
          <div className="cursor-zoom-in group" onClick={() => {
            setLightboxIndex(0)
            setLightboxOpen(true)
          }}>
            <Image
              alt={news.title}
              src={convertirURL(news.imageUrl)}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-1000"
              priority
              unoptimized
            />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 pb-16 w-full">
            <span className="inline-block bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 mb-6 rounded-sm">
              {news.mainCategory}
            </span>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] mb-6 tracking-tight max-w-5xl">
              {news.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-slate-200 text-sm font-medium">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-white/10">
                  <User className="w-4 h-4" />
                </span>
                <span>Por {news.author || "Redacción Eldópolis"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(news.date), "d 'de' MMMM, yyyy", { locale: es })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Lectura: {readingTime} min</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-12 lg:py-20 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

          {/* Share Sidebar (Sticky) */}
          <div className="hidden xl:block xl:col-span-1">
            <div className="sticky top-32 space-y-4 flex flex-col items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest [writing-mode:vertical-rl] mb-2">Compartir</span>
              <button
                onClick={() => handleShare("twitter")}
                className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:bg-slate-900 hover:text-white transition duration-300"
              >
                <Twitter className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleShare("facebook")}
                className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition duration-300"
              >
                <Facebook className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleShare("whatsapp")}
                className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:bg-[#25D366] hover:text-white transition duration-300"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleShare("copy")}
                className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition duration-300"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Article Bio & Content */}
          <article className="lg:col-span-11 xl:col-span-7 space-y-10">
            {news.subtitle && (
              <p className="font-bold text-2xl text-slate-900 dark:text-white leading-snug border-l-4 border-primary pl-6 py-1 italic">
                {news.subtitle}
              </p>
            )}

            {/* YouTube Embed Section (if present) */}
            {news.youtubeLink && (
              <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl my-10">
                <iframe
                  src={`https://www.youtube.com/embed/${news.youtubeLink.split("v=")[1]?.split("&")[0] || news.youtubeLink.split("/").pop()}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                ></iframe>
              </div>
            )}

            {/* Video File Section (if present) */}
            {news.video && (
              <div className="relative rounded-2xl overflow-hidden shadow-2xl my-10 bg-black">
                <video
                  src={convertirURL(news.video)}
                  controls
                  className="w-full h-auto max-h-[600px]"
                >
                  Tu navegador no soporta el elemento de video.
                </video>
              </div>
            )}

            {/* Audio File Section (if present) */}
            {news.audio && (
              <div className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-2xl flex items-center gap-6 my-10 border border-slate-200 dark:border-slate-700">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div className="flex-grow">
                  <p className="text-sm font-bold uppercase tracking-wider mb-2 text-slate-500">Escuchar noticia</p>
                  <audio src={convertirURL(news.audio)} controls className="w-full h-8">
                    Tu navegador no soporta el elemento de audio.
                  </audio>
                </div>
              </div>
            )}

            <div
              className="article-content text-lg md:text-xl text-slate-700 dark:text-slate-300 leading-relaxed space-y-8
              [&>p]:mb-8
              [&>blockquote]:border-l-4 [&>blockquote]:border-primary [&>blockquote]:pl-8 [&>blockquote]:py-4 [&>blockquote]:my-12 [&>blockquote]:italic [&>blockquote]:text-2xl [&>blockquote]:font-medium [&>blockquote]:text-slate-800 [&>blockquote]:dark:text-slate-100 [&>blockquote]:bg-slate-50 [&>blockquote]:dark:bg-slate-900/40 [&>blockquote]:rounded-r-lg
              [&>h2]:text-3xl [&>h2]:font-extrabold [&>h2]:text-slate-900 [&>h2]:dark:text-white [&>h2]:mt-12 [&>h2]:mb-6
              [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:space-y-4 [&>ul]:mb-8
              [&>img]:rounded-2xl [&>img]:shadow-lg [&>img]:my-10"
              dangerouslySetInnerHTML={{ __html: parsedContent }}
            />

            {/* Image Gallery Section */}
            {news.image && (
              <div className="space-y-6 pt-10 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-2xl font-extrabold uppercase tracking-tight">Galería de imágenes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(Array.isArray(news.image) ? news.image : [news.image]).map((img, index) => (
                    <div
                      key={index}
                      className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-zoom-in group"
                      onClick={() => {
                        setLightboxIndex(index)
                        setLightboxOpen(true)
                      }}
                    >
                      <Image
                        src={convertirURL(img)}
                        alt={`${news.title} ${index + 1}`}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                        <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-300 w-10 h-10" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags Section */}
            {news.tags && news.tags.length > 0 && (
              <div className="pt-10 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
                {news.tags.map(tag => (
                  <Link
                    key={tag}
                    href={`/tag/${tag.toLowerCase()}`}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-primary hover:text-white transition uppercase tracking-wider"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}
          </article>

          {/* Sidebar Area */}
          <aside className="lg:col-span-12 xl:col-span-4 space-y-12">
            {/* Top Trending Side News */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b-2 border-primary pb-2">
                <h3 className="text-xl font-extrabold uppercase tracking-tight">Lo más leído</h3>
              </div>
              <div className="space-y-6">
                {relatedNews.slice(0, 4).map((item) => (
                  <Link key={item.id} href={`/news/${item.id}`} className="flex gap-4 group">
                    <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden relative">
                      <Image
                        src={item.imageUrl || "/placeholder.svg"}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-110 transition duration-500"
                        unoptimized
                      />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold leading-snug transition line-clamp-3">
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1 block">
                        Hace 2 horas
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <SmallAdCard />

          </aside>
        </div>
      </main>

      {/* Relacionados Footer Section */}
      {relatedNews.length > 0 && (
        <section className="bg-slate-50 dark:bg-slate-900/50 py-16 border-t border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
            <h3 className="text-2xl font-extrabold mb-10 flex items-center gap-4">
              Noticias Relacionadas
              <span className="flex-grow h-px bg-slate-200 dark:bg-slate-800"></span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedNews.slice(0, 3).map((item) => (
                <Link
                  key={item.id}
                  href={`/news/${item.id}`}
                  className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="aspect-video relative overflow-hidden">
                    <Image
                      alt={item.title}
                      src={item.imageUrl || "/placeholder.svg"}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      unoptimized
                    />
                  </div>
                  <div className="p-6">
                    <h4 className="font-bold text-lg leading-snug transition-colors line-clamp-2">
                      {item.title}
                    </h4>
                    <div className="mt-4 flex items-center text-xs text-slate-400 font-bold uppercase tracking-wider">
                      <Clock className="w-3 h-3 mr-1" /> {format(new Date(item.date), "d MMM", { locale: es })}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Lightbox Implementation */}
      <ImageLightbox
        images={Array.isArray(news.image) ? news.image : news.image ? [news.image] : []}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  )
}
